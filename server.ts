import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configurable CORS for multi-domain, mobile, and external integrations
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['*'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check for Docker, Cloud Run, Kubernetes, and uptime monitors
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data'));
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('DATA_DIR initialization notice:', e);
}

const UPLOADS_DIR = process.env.UPLOADS_DIR || (process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads'));
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('UPLOADS_DIR initialization notice:', e);
}
app.use('/uploads', express.static(UPLOADS_DIR));

// High-speed Disk & Memory Image Cache System
const IMAGE_CACHE_DIR = path.join(DATA_DIR, 'image-cache');
try {
  if (!fs.existsSync(IMAGE_CACHE_DIR)) {
    fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('IMAGE_CACHE_DIR initialization notice:', e);
}

// In-memory LRU-like quick cache (up to 150 images)
const memoryImageCache = new Map<string, { buffer: Buffer; contentType: string }>();
const MAX_MEMORY_IMAGES = 150;

// High-speed Image Proxy & Caching Endpoint
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).send('Missing url parameter');
  }

  // Verify protocol
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return res.status(400).send('Invalid url protocol');
  }

  const cacheKey = crypto.createHash('sha256').update(imageUrl).digest('hex');
  const cacheFilePath = path.join(IMAGE_CACHE_DIR, `${cacheKey}.cache`);
  const metaFilePath = path.join(IMAGE_CACHE_DIR, `${cacheKey}.json`);

  // Performance headers: allow long-term caching in browser and service worker
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 1. Check Memory Cache (< 1ms latency)
  const memCached = memoryImageCache.get(cacheKey);
  if (memCached) {
    res.setHeader('Content-Type', memCached.contentType || 'image/webp');
    res.setHeader('X-Cache', 'HIT-MEMORY');
    return res.end(memCached.buffer);
  }

  // 2. Check Disk Cache (< 5ms latency)
  if (fs.existsSync(cacheFilePath) && fs.existsSync(metaFilePath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));
      const buffer = fs.readFileSync(cacheFilePath);
      if (memoryImageCache.size < MAX_MEMORY_IMAGES) {
        memoryImageCache.set(cacheKey, { buffer, contentType: meta.contentType || 'image/webp' });
      }
      res.setHeader('Content-Type', meta.contentType || 'image/webp');
      res.setHeader('X-Cache', 'HIT-DISK');
      return res.end(buffer);
    } catch (e) {
      // Proceed to remote fetch
    }
  }

  // 3. Fetch from remote CDN origin
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const remoteRes = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': new URL(imageUrl).origin + '/',
      },
    });
    clearTimeout(timer);

    if (!remoteRes.ok) {
      return res.redirect(imageUrl);
    }

    const contentType = remoteRes.headers.get('content-type') || 'image/webp';
    const arrayBuffer = await remoteRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to disk
    try {
      fs.writeFileSync(cacheFilePath, buffer);
      fs.writeFileSync(metaFilePath, JSON.stringify({ contentType, url: imageUrl, cachedAt: Date.now() }));
    } catch (err) {
      console.warn('Failed to persist image cache to disk:', err);
    }

    // Save to memory
    if (memoryImageCache.size < MAX_MEMORY_IMAGES) {
      memoryImageCache.set(cacheKey, { buffer, contentType });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Cache', 'MISS');
    return res.end(buffer);
  } catch (err) {
    // If proxy failed, redirect to original URL directly
    return res.redirect(imageUrl);
  }
});

// Background pre-warmer: fetches & caches products images in background so users experience instant loads
function prewarmProductImageCache() {
  setTimeout(async () => {
    try {
      let urls: string[] = [];
      const prodPath = path.join(DATA_DIR, 'products.json');
      if (fs.existsSync(prodPath)) {
        try {
          const prods = JSON.parse(fs.readFileSync(prodPath, 'utf-8'));
          if (Array.isArray(prods)) {
            urls = prods
              .map((p: any) => p.image)
              .filter((u: any) => typeof u === 'string' && u.startsWith('http'));
          }
        } catch {}
      }

      if (urls.length === 0) {
        const initialProdPath = path.join(process.cwd(), 'src', 'data', 'initialProducts.ts');
        if (fs.existsSync(initialProdPath)) {
          const content = fs.readFileSync(initialProdPath, 'utf-8');
          const matches = content.match(/https?:\/\/[^"'\s\\]+\.(webp|png|jpe?g)/g) || [];
          urls = Array.from(new Set(matches));
        }
      }

      for (const imgUrl of urls.slice(0, 150)) {
        const cacheKey = crypto.createHash('sha256').update(imgUrl).digest('hex');
        const cacheFilePath = path.join(IMAGE_CACHE_DIR, `${cacheKey}.cache`);
        if (!fs.existsSync(cacheFilePath)) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const r = await fetch(imgUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': new URL(imgUrl).origin + '/',
              },
            });
            clearTimeout(timer);
            if (r.ok) {
              const contentType = r.headers.get('content-type') || 'image/webp';
              const buffer = Buffer.from(await r.arrayBuffer());
              fs.writeFileSync(cacheFilePath, buffer);
              fs.writeFileSync(path.join(IMAGE_CACHE_DIR, `${cacheKey}.json`), JSON.stringify({ contentType, url: imgUrl, cachedAt: Date.now() }));
              if (memoryImageCache.size < MAX_MEMORY_IMAGES) {
                memoryImageCache.set(cacheKey, { buffer, contentType });
              }
            }
          } catch {}
          await new Promise((res) => setTimeout(res, 80));
        }
      }
    } catch (e) {
      console.warn('[Image Cache] Background pre-warm notice:', e);
    }
  }, 2000);
}
prewarmProductImageCache();

const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');

function getLocalOrders() {
  if (fs.existsSync(ORDERS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'));
    } catch (e) {
      console.error('Error reading local orders:', e);
      return [];
    }
  }
  return [];
}

function saveLocalOrder(order: any) {
  const orders = getLocalOrders();
  orders.unshift(order);
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
  return orders;
}

function updateLocalOrder(orderId: string, updates: any) {
  const orders = getLocalOrders();
  let updated = false;
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].orderId === orderId || orders[i].id === orderId) {
      orders[i] = { ...orders[i], ...updates, updatedAt: new Date().toISOString() };
      updated = true;
      break;
    }
  }
  if (updated) {
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
  }
  return updated;
}

// CSV line parser helper
function parseCSVRows(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentToken.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      lines.push(currentRow);
    }
  }
  return lines;
}

// API Routes

// Image upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { dataUrl, filename, image } = req.body;
    const rawData = dataUrl || image;
    if (!rawData || typeof rawData !== 'string') {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Parse base64 string
    const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'webp';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      else ext = 'webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(rawData, 'base64');
    }

    // On Vercel serverless, local disk storage /tmp is temporary and not served as static files.
    // Return the compressed Data URL directly or write to disk if running on full node server.
    if (process.env.VERCEL) {
      const sizeKb = Math.round((rawData.length * 0.75) / 1024);
      const url = rawData.startsWith('data:') ? rawData : `data:image/${ext};base64,${rawData}`;
      return res.json({
        success: true,
        url,
        sizeKb,
        filename: filename || 'image.webp',
      });
    }

    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    const sizeKb = Math.round(buffer.length / 1024);

    res.json({
      success: true,
      url: publicUrl,
      sizeKb,
      filename: safeName,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// Get Products from Google Sheet
app.get('/api/products', async (req, res) => {
  const sheetId =
    (req.query.sheetId as string) ||
    process.env.GOOGLE_SHEET_ID ||
    '1kPzbYFUkgN8dW5BVqeNtoKM8LbRvHAIfQIQZBKkv-Ws';
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Google Sheet response: ${response.statusText}`);
    }
    const csvText = await response.text();
    const rows = parseCSVRows(csvText);

    if (rows.length < 2) {
      return res.json({ products: [], source: 'empty-sheet' });
    }

    const cleanHeader = (s: string) => s.toLowerCase().replace(/[\s_\-\/\\]+/g, '').trim();

    const parseNumber = (val: string): number => {
      if (!val) return NaN;
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      let converted = '';
      for (let i = 0; i < val.length; i++) {
        const char = val[i];
        const idx = bnDigits.indexOf(char);
        if (idx !== -1) {
          converted += idx;
        } else {
          converted += char;
        }
      }
      const clean = converted.replace(/[^0-9.]/g, '');
      const n = parseFloat(clean);
      return isNaN(n) ? NaN : n;
    };

    const rawHeaders = rows[0].map((h) => h.trim());
    const normalizedHeaders = rawHeaders.map(cleanHeader);

    const products = rows
      .slice(1)
      .map((row, index) => {
        const getVal = (...aliases: string[]) => {
          for (const alias of aliases) {
            const normAlias = cleanHeader(alias);
            const colIdx = normalizedHeaders.indexOf(normAlias);
            if (colIdx !== -1 && row[colIdx] !== undefined && row[colIdx].trim() !== '') {
              return row[colIdx].trim();
            }
          }
          return '';
        };

        const id = getVal('id') || `sheet-prod-${index + 1}`;
        const name = getVal('name');
        if (!name) return null; // Skip empty rows

        const rawCat = getVal('category').toLowerCase();
        let category = 'veg';
        if (rawCat.includes('veg') || rawCat.includes('সবজি')) {
          category = 'veg';
        } else if (rawCat.includes('fruit') || rawCat.includes('fol') || rawCat.includes('ফল')) {
          category = 'fruit';
        } else if (rawCat.includes('flow') || rawCat.includes('ful') || rawCat.includes('ফুল')) {
          category = 'ful';
        } else if (rawCat.includes('other') || rawCat.includes('অন্য')) {
          category = 'other';
        } else if (rawCat) {
          category = rawCat;
        }

        const parsedPrice = parseNumber(getVal('price', 'মূল্য', 'দাম'));
        const price = !isNaN(parsedPrice) ? parsedPrice : 0;

        const parsedOrigPrice = parseNumber(getVal('originalPrice', 'original_price', 'oldPrice', 'পূর্বেরদাম', 'আগেরদাম'));
        const originalPrice = !isNaN(parsedOrigPrice) && parsedOrigPrice > price ? parsedOrigPrice : undefined;

        const parsedStock = parseNumber(getVal('stock', 'স্টক'));
        const stock = !isNaN(parsedStock) ? parsedStock : 50;

        const parsedRating = parseNumber(getVal('rating', 'রেটিং'));
        const rating = !isNaN(parsedRating) ? parsedRating : 5;

        const parsedReviews = parseNumber(getVal('reviewsCount', 'reviews_count', 'reviews', 'রিভিউ'));
        const reviewsCount = !isNaN(parsedReviews) ? parsedReviews : 10;
        
        const rawImage = getVal('image', 'image1', 'img1');
        const img2 = getVal('image2', 'img2');
        const img3 = getVal('image3', 'img3');
        const rawImagesCol = getVal('images');

        let imageList: string[] = [];

        if (rawImagesCol) {
          imageList = rawImagesCol.split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          if (rawImage) {
            rawImage.split(',').forEach((s) => {
              const trimmed = s.trim();
              if (trimmed && !imageList.includes(trimmed)) imageList.push(trimmed);
            });
          }
          if (img2 && !imageList.includes(img2)) imageList.push(img2);
          if (img3 && !imageList.includes(img3)) imageList.push(img3);
        }

        const defaultImg =
          'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80';
        const image = imageList.length > 0 ? imageList[0] : defaultImg;
        const images = imageList.length > 0 ? imageList : [defaultImg];

        const description = getVal('description', 'desc', 'details', 'বিবরণ') || '';
        const germinationDays =
          getVal('germinationDays', 'germination_days', 'germination', 'sproutDays', 'sprout_days', 'sprout', 'গজানোর সময়', 'গজানোরসময়') || '';
        const season = getVal('season', 'seasonType', 'ঋতু', 'উপযুক্ত ঋতু') || '';
        const packSize = getVal('packSize', 'pack_size', 'pack', 'size', 'প্যাক সাইজ', 'প্যাকসাইজ', 'সাইজ') || '';
        const plantingTip =
          getVal('plantingTip', 'planting_tip', 'plantingTips', 'planting_tips', 'tip', 'tips', 'রোপণ টিপস', 'রোপণটিপস') || '';

        const rawBadges = getVal('badgeTags', 'badge_tags', 'badges', 'tags', 'ট্যাগ/ব্যাজ', 'ট্যাগব্যাজ', 'ট্যাগ', 'ব্যাজ');
        const badgeTags = rawBadges
          ? rawBadges.split(/[,/|]+/).map((b) => b.trim()).filter(Boolean)
          : [];

        const parsedCashback = parseNumber(getVal('cashback', 'cash_back', 'ক্যাশব্যাক'));
        const cashback = !isNaN(parsedCashback) && parsedCashback > 0 ? parsedCashback : 0;

        const isPopularVal = getVal('isPopular', 'is_popular', 'popular').toLowerCase();
        const isNewVal = getVal('isNew', 'is_new', 'new').toLowerCase();

        return {
          id,
          name,
          category,
          price,
          originalPrice,
          cashback,
          stock,
          rating,
          reviewsCount,
          image,
          images,
          description,
          germinationDays,
          sproutDays: germinationDays,
          season,
          packSize,
          plantingTip,
          plantingTips: plantingTip,
          badgeTags,
          isPopular:
            isPopularVal === 'true' || isPopularVal === '1' || isPopularVal === 'yes',
          isNew: isNewVal === 'true' || isNewVal === '1' || isNewVal === 'yes',
        };
      })
      .filter((p) => p && p.name);

    if (products.length < 10 && fs.existsSync(BACKUP_FILE)) {
      try {
        const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
        if (Array.isArray(backupData.products) && backupData.products.length > products.length) {
          return res.json({ products: backupData.products, count: backupData.products.length, source: 'backup-store' });
        }
      } catch {}
    }

    res.json({ products, count: products.length, source: 'google-sheet' });
  } catch (error: any) {
    console.error('Error fetching products from Google Sheet:', error.message);
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
        if (Array.isArray(backupData.products) && backupData.products.length) {
          return res.json({ products: backupData.products, count: backupData.products.length, source: 'backup-store' });
        }
      } catch {}
    }
    res.status(500).json({ error: error.message, products: [] });
  }
});

// Place new Order
app.post('/api/orders', async (req, res) => {
  const order = req.body;
  if (!order || !order.orderId) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // 1. Save local order
  const orders = saveLocalOrder(order);

  // 2. Check Steadfast auto-submission if enabled and credentials exist
  const sfConfig = getSteadfastConfig();
  let courierResult: any = { submitted: false };

  if (sfConfig.enabled && sfConfig.autoSubmit && sfConfig.apiKey && sfConfig.secretKey) {
    try {
      const phoneValidation = cleanAndValidateBdPhone(order.phone);
      if (!phoneValidation.valid) {
        courierResult = {
          submitted: false,
          error: phoneValidation.error || 'Invalid phone format',
        };
        updateLocalOrder(order.orderId, {
          courierStatus: 'failed',
          courierError: phoneValidation.error,
        });
      } else {
        const codAmount =
          sfConfig.defaultCodMode === 'subtotal'
            ? Number(order.subtotal || order.total || 0)
            : Number(order.total || 0);

        const fullAddress = [
          order.village || '',
          order.landmark || '',
          order.address || '',
          order.thana || '',
          order.district || '',
        ].filter(Boolean).join(', ');

        const sfPayload = {
          invoice: String(order.orderId),
          recipient_name: String(order.customerName || 'গ্রাহক'),
          recipient_phone: phoneValidation.formatted,
          recipient_address: fullAddress || 'বাংলাদেশ',
          cod_amount: codAmount,
          note: sfConfig.defaultNote || 'বীজ পার্সেল - সাবধানে ডেলিভারি করুন',
        };

        const result = await dispatchSteadfastOrder(sfPayload, sfConfig.apiKey, sfConfig.secretKey);
        if (result.success) {
          courierResult = {
            submitted: true,
            consignment_id: result.consignment_id,
            tracking_code: result.tracking_code,
            status: result.status,
          };
          updateLocalOrder(order.orderId, {
            courierStatus: 'submitted',
            consignmentId: result.consignment_id,
            trackingCode: result.tracking_code,
            courierSubmittedAt: new Date().toISOString(),
          });
        } else {
          courierResult = {
            submitted: false,
            error: result.message,
            errors: result.errors,
          };
          updateLocalOrder(order.orderId, {
            courierStatus: 'failed',
            courierError: result.message,
          });
        }
      }
    } catch (sfErr: any) {
      console.error('Steadfast auto-submit exception:', sfErr);
      courierResult = {
        submitted: false,
        error: sfErr.message || 'Auto-submission failed',
      };
      updateLocalOrder(order.orderId, {
        courierStatus: 'failed',
        courierError: sfErr.message,
      });
    }
  }

  res.json({
    success: true,
    order,
    totalOrdersCount: orders.length,
    courier: courierResult,
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const orders = getLocalOrders();
  res.json({ orders });
});


// ==========================================
// INTEGRATIONS MANAGEMENT SYSTEM SERVER ENDPOINTS
// ==========================================

const INTEGRATIONS_CONFIG_PATH = path.join(DATA_DIR, 'integrations_secure.json');
let memoryIntegrationsConfig: any = null;

function getSecureIntegrationsConfig() {
  if (memoryIntegrationsConfig) {
    return memoryIntegrationsConfig;
  }
  if (fs.existsSync(INTEGRATIONS_CONFIG_PATH)) {
    try {
      memoryIntegrationsConfig = JSON.parse(fs.readFileSync(INTEGRATIONS_CONFIG_PATH, 'utf-8'));
      return memoryIntegrationsConfig;
    } catch {
      return {};
    }
  }
  return {};
}

function saveSecureIntegrationsConfig(cfg: any) {
  memoryIntegrationsConfig = cfg;
  try {
    fs.writeFileSync(INTEGRATIONS_CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (err) {
    console.warn('Could not write integrations config to disk (serverless ephemeral environment):', err);
  }
}

// Meta Conversions API (CAPI) Server-side Event Dispatch
app.post('/api/integrations/meta-capi', async (req, res) => {
  try {
    const { eventName, eventId, eventData, url } = req.body;
    const secureConfig = getSecureIntegrationsConfig();
    const metaConfig = secureConfig.meta || {};

    const accessToken = metaConfig.capiAccessToken || process.env.META_CAPI_ACCESS_TOKEN;
    const datasetId = metaConfig.capiDatasetId || metaConfig.pixelId || process.env.META_PIXEL_ID;

    if (!accessToken || !datasetId) {
      return res.status(200).json({
        skipped: true,
        reason: 'Meta Conversions API is not configured with Access Token and Dataset/Pixel ID.',
      });
    }

    const payload: any = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // Deduplication key with client pixel
          event_source_url: url || 'https://ssseedshop.com',
          action_source: 'website',
          user_data: {
            client_ip_address: req.ip || req.headers['x-forwarded-for'],
            client_user_agent: req.headers['user-agent'],
          },
          custom_data: eventData || {},
        },
      ],
    };

    if (metaConfig.capiTestEventCode) {
      payload.test_event_code = metaConfig.capiTestEventCode;
    }

    const fbApiUrl = `https://graph.facebook.com/v19.0/${datasetId}/events?access_token=${accessToken}`;
    const fbRes = await fetch(fbApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await fbRes.json();
    return res.json({ success: fbRes.ok, result, eventId });
  } catch (error: any) {
    console.error('Meta CAPI error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Secure Integration Settings Sync (Store secret tokens securely on server without exposing in client JS)
app.get('/api/integrations/secure-config', (req, res) => {
  const cfg = getSecureIntegrationsConfig();
  // Return configuration masking sensitive access tokens and secret keys
  const masked: any = { ...cfg };
  if (masked.meta?.capiAccessToken) {
    const len = masked.meta.capiAccessToken.length;
    masked.meta.capiAccessTokenMasked = len > 8 ? `${masked.meta.capiAccessToken.slice(0, 4)}••••••••${masked.meta.capiAccessToken.slice(-4)}` : '••••••••';
    delete masked.meta.capiAccessToken;
  }
  if (masked.security?.captchaSecretKey) {
    masked.security.captchaSecretKeyMasked = '••••••••';
    delete masked.security.captchaSecretKey;
  }
  if (masked.security?.cloudflareApiToken) {
    masked.security.cloudflareApiTokenMasked = '••••••••';
    delete masked.security.cloudflareApiToken;
  }
  res.json({ config: masked });
});

app.post('/api/integrations/secure-config', (req, res) => {
  try {
    const incoming = req.body || {};
    const existing = getSecureIntegrationsConfig();

    // Preserve existing sensitive secrets if incoming value is not explicitly provided or is masked placeholder
    const merged = { ...existing, ...incoming };
    if (!incoming.meta?.capiAccessToken && existing.meta?.capiAccessToken) {
      merged.meta = { ...merged.meta, capiAccessToken: existing.meta.capiAccessToken };
    }
    if (!incoming.security?.captchaSecretKey && existing.security?.captchaSecretKey) {
      merged.security = { ...merged.security, captchaSecretKey: existing.security.captchaSecretKey };
    }
    if (!incoming.security?.cloudflareApiToken && existing.security?.cloudflareApiToken) {
      merged.security = { ...merged.security, cloudflareApiToken: existing.security.cloudflareApiToken };
    }

    saveSecureIntegrationsConfig(merged);

    // If robots.txt was provided, safely sync it to public/robots.txt
    if (incoming.seo?.robotsTxtContent) {
      try {
        const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
        fs.writeFileSync(robotsPath, incoming.seo.robotsTxtContent, 'utf-8');
      } catch (e) {
        console.warn('Failed to write robots.txt', e);
      }
    }

    res.json({ success: true, message: 'Secure integrations configuration updated' });
  } catch (err: any) {
    console.error('Error saving secure integrations config:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// STEADFAST COURIER INTEGRATION SYSTEM
// ==========================================

const STEADFAST_BASE_URL = 'https://portal.steadfast.com.bd/api/v1';

function getSteadfastConfig() {
  const secureConfig = getSecureIntegrationsConfig();
  const sf = secureConfig.courier?.steadfast || secureConfig.steadfast || {};
  return {
    enabled: sf.enabled !== undefined ? Boolean(sf.enabled) : true,
    autoSubmit: Boolean(sf.autoSubmit),
    apiKey: sf.apiKey || process.env.STEADFAST_API_KEY || 'sgsnv0yo0md3kgthqhpcxgrumuwglvm',
    secretKey: sf.secretKey || process.env.STEADFAST_SECRET_KEY || 'swl1eszs6dloooycxqug9zua',
    defaultCodMode: sf.defaultCodMode || 'total', // 'total' | 'subtotal'
    defaultNote: sf.defaultNote || 'বীজ পার্সেল - সাবধানে ডেলিভারি করুন',
    lastSyncStatus: sf.lastSyncStatus || 'কনফিগার করা হয়নি',
    lastSyncTime: sf.lastSyncTime || null,
    lastBalance: sf.lastBalance !== undefined ? sf.lastBalance : null,
  };
}

function saveSteadfastConfig(incoming: any) {
  const secureConfig = getSecureIntegrationsConfig();
  const existing = secureConfig.steadfast || secureConfig.courier?.steadfast || {};

  const updated: any = {
    ...existing,
    ...incoming,
  };

  // Preserve existing secrets if masked placeholder was passed
  if (!incoming.apiKey && existing.apiKey) {
    updated.apiKey = existing.apiKey;
  }
  if (!incoming.secretKey && existing.secretKey) {
    updated.secretKey = existing.secretKey;
  }

  secureConfig.steadfast = updated;
  if (!secureConfig.courier) secureConfig.courier = {};
  secureConfig.courier.steadfast = updated;

  saveSecureIntegrationsConfig(secureConfig);
  return updated;
}

function cleanAndValidateBdPhone(phone: any): { valid: boolean; formatted: string; error?: string } {
  if (!phone) return { valid: false, formatted: '', error: 'ফোন নম্বর দেওয়া হয়নি' };
  let cleaned = String(phone).replace(/[\s\-\(\)\.]+/g, '').trim();
  if (cleaned.startsWith('+880')) {
    cleaned = cleaned.slice(4);
    cleaned = '0' + cleaned;
  } else if (cleaned.startsWith('880')) {
    cleaned = cleaned.slice(3);
    cleaned = '0' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  // BD mobile numbers must be 11 digits starting with 013, 014, 015, 016, 017, 018, 019
  const bdRegex = /^01[3-9]\d{8}$/;
  if (!bdRegex.test(cleaned)) {
    return {
      valid: false,
      formatted: cleaned,
      error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)',
    };
  }
  return { valid: true, formatted: cleaned };
}

async function dispatchSteadfastOrder(
  payload: {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
  },
  apiKey: string,
  secretKey: string
) {
  if (!apiKey || !secretKey) {
    throw new Error('Steadfast API Key অথবা Secret Key কনফিগার করা নেই।');
  }

  const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: any = await response.json().catch(() => ({}));

  if (response.ok && data.status === 200 && data.consignment) {
    return {
      success: true,
      consignment_id: data.consignment.consignment_id,
      tracking_code: data.consignment.tracking_code,
      status: data.consignment.status || 'in_review',
      invoice: data.consignment.invoice || payload.invoice,
      message: data.message || 'অর্ডার সফলভাবে Steadfast-এ সাবমিট হয়েছে',
      raw: data.consignment,
    };
  }

  const errorMsg =
    data.message ||
    (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status} - অর্ডার সাবমিট ব্যর্থ`);
  return {
    success: false,
    message: errorMsg,
    errors: data.errors || null,
    statusCode: response.status,
  };
}

async function checkSteadfastBalance(apiKey: string, secretKey: string) {
  if (!apiKey || !secretKey) {
    return { success: false, message: 'API Key বা Secret Key প্রদান করা হয়নি।' };
  }

  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
    });

    const data: any = await response.json().catch(() => ({}));
    if (response.ok && data.status === 200) {
      return {
        success: true,
        current_balance: data.current_balance !== undefined ? data.current_balance : 0,
        message: 'Steadfast API কানেকশন সফল! ব্যালেন্স পাওয়া গেছে।',
      };
    }

    return {
      success: false,
      statusCode: response.status,
      message: data.message || `কানেকশন ব্যর্থ (HTTP ${response.status})। কী সঠিক কিনা পরীক্ষা করুন।`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `নেটওয়ার্ক ত্রুটি: ${err.message || 'Steadfast সার্ভারে সংযোগ সম্ভব হয়নি'}`,
    };
  }
}

async function getSteadfastDeliveryStatus(
  identifier: string,
  type: 'cid' | 'tracking_code' | 'invoice',
  apiKey: string,
  secretKey: string
) {
  if (!apiKey || !secretKey) {
    throw new Error('API Key এবং Secret Key প্রয়োজন');
  }

  let endpoint = `${STEADFAST_BASE_URL}/status_by_cid/${encodeURIComponent(identifier)}`;
  if (type === 'tracking_code') {
    endpoint = `${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(identifier)}`;
  } else if (type === 'invoice') {
    endpoint = `${STEADFAST_BASE_URL}/status_by_invoice/${encodeURIComponent(identifier)}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json',
    },
  });

  const data: any = await response.json().catch(() => ({}));
  if (response.ok && data.status === 200) {
    return {
      success: true,
      delivery_status: data.delivery_status || 'unknown',
      raw: data,
    };
  }
  return {
    success: false,
    message: data.message || `স্ট্যাটাস পাওয়া যায়নি (HTTP ${response.status})`,
  };
}

// 1. Get Steadfast settings
app.get('/api/courier/steadfast/config', (req, res) => {
  const cfg = getSteadfastConfig();
  const apiKeyMasked = cfg.apiKey
    ? (cfg.apiKey.length > 8 ? `${cfg.apiKey.slice(0, 4)}••••••••${cfg.apiKey.slice(-4)}` : '••••••••')
    : '';
  const secretKeyMasked = cfg.secretKey
    ? (cfg.secretKey.length > 8 ? `${cfg.secretKey.slice(0, 4)}••••••••${cfg.secretKey.slice(-4)}` : '••••••••')
    : '';

  res.json({
    config: {
      enabled: cfg.enabled,
      autoSubmit: cfg.autoSubmit,
      defaultCodMode: cfg.defaultCodMode,
      defaultNote: cfg.defaultNote,
      hasApiKey: Boolean(cfg.apiKey),
      hasSecretKey: Boolean(cfg.secretKey),
      apiKeyMasked,
      secretKeyMasked,
      lastSyncStatus: cfg.lastSyncStatus,
      lastSyncTime: cfg.lastSyncTime,
      lastBalance: cfg.lastBalance,
    },
  });
});

// 2. Save / Update Steadfast settings
app.post('/api/courier/steadfast/config', (req, res) => {
  try {
    const { enabled, autoSubmit, apiKey, secretKey, defaultCodMode, defaultNote, removeKeys } = req.body;

    const updates: any = {};
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (autoSubmit !== undefined) updates.autoSubmit = Boolean(autoSubmit);
    if (defaultCodMode !== undefined) updates.defaultCodMode = defaultCodMode;
    if (defaultNote !== undefined) updates.defaultNote = defaultNote;

    if (removeKeys) {
      updates.apiKey = '';
      updates.secretKey = '';
      updates.enabled = false;
      updates.autoSubmit = false;
      updates.lastSyncStatus = 'কী মুছে ফেলা হয়েছে (Disconnected)';
      updates.lastBalance = null;
    } else {
      if (apiKey && !apiKey.includes('••••')) {
        updates.apiKey = apiKey.trim();
      }
      if (secretKey && !secretKey.includes('••••')) {
        updates.secretKey = secretKey.trim();
      }
    }

    saveSteadfastConfig(updates);
    res.json({ success: true, message: 'Steadfast কুরিয়ার সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    console.error('Save steadfast config error:', err);
    res.status(500).json({ error: err.message || 'সেটিংস সংরক্ষণে ব্যর্থ' });
  }
});

// 3. Test API Connection (real /get_balance endpoint)
app.post('/api/courier/steadfast/test-connection', async (req, res) => {
  try {
    const { apiKey, secretKey } = req.body || {};
    const saved = getSteadfastConfig();
    const finalApiKey = apiKey && !apiKey.includes('••••') ? apiKey.trim() : saved.apiKey;
    const finalSecretKey = secretKey && !secretKey.includes('••••') ? secretKey.trim() : saved.secretKey;

    if (!finalApiKey || !finalSecretKey) {
      return res.status(400).json({
        success: false,
        message: 'কানেকশন টেস্ট করার জন্য API Key এবং Secret Key প্রয়োজন। অনুগ্রহ করে কী প্রদান করুন।',
      });
    }

    const result = await checkSteadfastBalance(finalApiKey, finalSecretKey);
    const now = new Date().toISOString();

    if (result.success) {
      saveSteadfastConfig({
        lastSyncStatus: 'সংযুক্ত (Connected)',
        lastSyncTime: now,
        lastBalance: result.current_balance,
      });
      return res.json({
        success: true,
        message: 'Steadfast API সফলভাবে সংযুক্ত হয়েছে!',
        current_balance: result.current_balance,
        status: 'Connected',
      });
    } else {
      saveSteadfastConfig({
        lastSyncStatus: `ত্রুটি: ${result.message}`,
        lastSyncTime: now,
      });
      return res.status(400).json({
        success: false,
        message: result.message || 'Steadfast API-তে কানেক্ট করা সম্ভব হয়নি। কী সঠিক কিনা পরীক্ষা করুন।',
        statusCode: result.statusCode,
      });
    }
  } catch (err: any) {
    console.error('Steadfast connection test error:', err);
    res.status(500).json({
      success: false,
      message: `কানেকশন পরীক্ষা ব্যর্থ: ${err.message}`,
    });
  }
});

// 4. Send single order to Steadfast (manual or retry)
app.post('/api/courier/steadfast/send-order', async (req, res) => {
  try {
    const { orderId, invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note, forceRetry } = req.body;
    if (!orderId && !invoice) {
      return res.status(400).json({ error: 'Order ID / Invoice প্রয়োজন' });
    }

    const sfConfig = getSteadfastConfig();
    if (!sfConfig.apiKey || !sfConfig.secretKey) {
      return res.status(400).json({
        error: 'Steadfast API Key অথবা Secret Key কনফিগার করা নেই। অনুগ্রহ করে প্রথমে Courier Settings-এ কী সংরক্ষণ করুন।',
      });
    }

    // Check duplicate prevention
    const orders = getLocalOrders();
    const existing = orders.find((o: any) => o.orderId === (orderId || invoice) || o.id === (orderId || invoice));
    if (existing && existing.consignmentId && !forceRetry) {
      return res.status(400).json({
        error: `এই অর্ডারটি ইতোমধ্যে Steadfast-এ বুকিং করা হয়েছে (Consignment ID: ${existing.consignmentId}, Tracking Code: ${existing.trackingCode})। ডুপ্লিকেট বুকিং প্রতিরোধ করা হয়েছে।`,
        consignmentId: existing.consignmentId,
        trackingCode: existing.trackingCode,
        isDuplicate: true,
      });
    }

    // Validate phone number
    const phoneValidation = cleanAndValidateBdPhone(recipient_phone || existing?.phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        error: phoneValidation.error || 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)',
      });
    }

    const payload = {
      invoice: String(invoice || orderId || existing?.orderId),
      recipient_name: String(recipient_name || existing?.customerName || 'গ্রাহক'),
      recipient_phone: phoneValidation.formatted,
      recipient_address: String(recipient_address || existing?.address || 'বাংলাদেশ'),
      cod_amount: Number(cod_amount !== undefined ? cod_amount : (existing?.total || 0)),
      note: String(note || sfConfig.defaultNote || 'বীজ পার্সেল - সাবধানে ডেলিভারি করুন'),
    };

    const result = await dispatchSteadfastOrder(payload, sfConfig.apiKey, sfConfig.secretKey);
    if (result.success) {
      updateLocalOrder(payload.invoice, {
        courierStatus: 'submitted',
        consignmentId: result.consignment_id,
        trackingCode: result.tracking_code,
        courierSubmittedAt: new Date().toISOString(),
        courierError: null,
      });

      return res.json({
        success: true,
        message: 'অর্ডার সফলভাবে Steadfast কুরিয়ারে বুকিং হয়েছে!',
        consignment_id: result.consignment_id,
        tracking_code: result.tracking_code,
        status: result.status,
      });
    } else {
      updateLocalOrder(payload.invoice, {
        courierStatus: 'failed',
        courierError: result.message,
      });

      return res.status(400).json({
        success: false,
        error: result.message,
        errors: result.errors,
      });
    }
  } catch (err: any) {
    console.error('Send order to steadfast error:', err);
    res.status(500).json({ error: err.message || 'Steadfast বুকিং ব্যর্থ' });
  }
});

// 5. Bulk send multiple orders to Steadfast
app.post('/api/courier/steadfast/bulk-send', async (req, res) => {
  try {
    const { orders: incomingOrders, forceRetry } = req.body;
    if (!Array.isArray(incomingOrders) || incomingOrders.length === 0) {
      return res.status(400).json({ error: 'বুকিং করার জন্য কোনো অর্ডার দেওয়া হয়নি।' });
    }

    const sfConfig = getSteadfastConfig();
    if (!sfConfig.apiKey || !sfConfig.secretKey) {
      return res.status(400).json({
        error: 'Steadfast API Key অথবা Secret Key কনফিগার করা নেই।',
      });
    }

    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const item of incomingOrders) {
      const orderId = item.orderId || item.id || item.invoice;
      // Prevent duplicates
      if (item.consignmentId && !forceRetry) {
        skippedCount++;
        results.push({
          orderId,
          status: 'skipped',
          reason: 'ইতোমধ্যে বুকিং সম্পন্ন হয়েছে',
          consignmentId: item.consignmentId,
          trackingCode: item.trackingCode,
        });
        continue;
      }

      const phoneValidation = cleanAndValidateBdPhone(item.phone || item.recipient_phone);
      if (!phoneValidation.valid) {
        failedCount++;
        results.push({
          orderId,
          status: 'failed',
          reason: phoneValidation.error,
        });
        updateLocalOrder(orderId, {
          courierStatus: 'failed',
          courierError: phoneValidation.error,
        });
        continue;
      }

      const payload = {
        invoice: String(orderId),
        recipient_name: String(item.customerName || item.recipient_name || 'গ্রাহক'),
        recipient_phone: phoneValidation.formatted,
        recipient_address: String(item.address || item.recipient_address || 'বাংলাদেশ'),
        cod_amount: Number(item.total !== undefined ? item.total : (item.cod_amount || 0)),
        note: String(item.note || sfConfig.defaultNote || 'বীজ পার্সেল'),
      };

      const resSf = await dispatchSteadfastOrder(payload, sfConfig.apiKey, sfConfig.secretKey);
      if (resSf.success) {
        successCount++;
        results.push({
          orderId,
          status: 'success',
          consignment_id: resSf.consignment_id,
          tracking_code: resSf.tracking_code,
        });
        updateLocalOrder(orderId, {
          courierStatus: 'submitted',
          consignmentId: resSf.consignment_id,
          trackingCode: resSf.tracking_code,
          courierSubmittedAt: new Date().toISOString(),
          courierError: null,
        });
      } else {
        failedCount++;
        results.push({
          orderId,
          status: 'failed',
          reason: resSf.message,
          errors: resSf.errors,
        });
        updateLocalOrder(orderId, {
          courierStatus: 'failed',
          courierError: resSf.message,
        });
      }
    }

    res.json({
      success: true,
      total: incomingOrders.length,
      successCount,
      failedCount,
      skippedCount,
      results,
    });
  } catch (err: any) {
    console.error('Bulk send steadfast error:', err);
    res.status(500).json({ error: err.message || 'বাল্ক বুকিং ব্যর্থ' });
  }
});

// 6. Track order delivery status
app.get('/api/courier/steadfast/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const type =
      (req.query.type as any) ||
      (identifier.startsWith('SF') ? 'tracking_code' : (isNaN(Number(identifier)) ? 'invoice' : 'cid'));

    const sfConfig = getSteadfastConfig();
    if (!sfConfig.apiKey || !sfConfig.secretKey) {
      return res.status(400).json({
        error: 'Steadfast API Key / Secret Key কনফিগার করা নেই।',
      });
    }

    const result = await getSteadfastDeliveryStatus(identifier, type, sfConfig.apiKey, sfConfig.secretKey);
    if (result.success) {
      res.json({
        success: true,
        delivery_status: result.delivery_status,
        raw: result.raw,
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message,
      });
    }
  } catch (err: any) {
    console.error('Steadfast track error:', err);
    res.status(500).json({ error: err.message || 'ট্র্যাকিং তথ্য পাওয়া যায়নি' });
  }
});

// 7. Refresh courier status
app.post('/api/courier/steadfast/refresh-status', async (req, res) => {
  try {
    const { orderIds } = req.body || {};
    const sfConfig = getSteadfastConfig();
    if (!sfConfig.apiKey || !sfConfig.secretKey) {
      return res.status(400).json({ error: 'Steadfast API ক্রেডেনশিয়াল কনফিগার করা নেই।' });
    }

    const orders = getLocalOrders();
    const targetOrders = Array.isArray(orderIds) && orderIds.length > 0
      ? orders.filter((o: any) => orderIds.includes(o.orderId) || orderIds.includes(o.id))
      : orders.filter((o: any) => o.consignmentId || o.trackingCode);

    const updatedList: any[] = [];

    for (const ord of targetOrders) {
      const iden = ord.consignmentId || ord.trackingCode || ord.orderId;
      const type = ord.consignmentId ? 'cid' : (ord.trackingCode ? 'tracking_code' : 'invoice');
      if (!iden) continue;

      try {
        const tr = await getSteadfastDeliveryStatus(String(iden), type, sfConfig.apiKey, sfConfig.secretKey);
        if (tr.success) {
          updateLocalOrder(ord.orderId, {
            courierDeliveryStatus: tr.delivery_status,
            courierLastCheckedAt: new Date().toISOString(),
          });
          updatedList.push({
            orderId: ord.orderId,
            delivery_status: tr.delivery_status,
          });
        }
      } catch (e) {
        console.warn(`Failed to refresh status for order ${ord.orderId}`, e);
      }
    }

    res.json({
      success: true,
      refreshedCount: updatedList.length,
      updatedList,
    });
  } catch (err: any) {
    console.error('Refresh steadfast status error:', err);
    res.status(500).json({ error: err.message || 'স্ট্যাটাস রিফ্রেশ ব্যর্থ' });
  }
});

// Dynamic Sitemap.xml Generator & Updater
app.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = (
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      process.env.APP_URL ||
      'https://ssseedshop.com'
    ).replace(/\/+$/, '');
    const today = new Date().toISOString().split('T')[0];

    // Static pages with priorities
    const staticPages = [
      { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/products`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/track-order`, changefreq: 'weekly', priority: '0.6' },
      { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${siteUrl}/privacy`, changefreq: 'monthly', priority: '0.4' },
      { loc: `${siteUrl}/terms`, changefreq: 'monthly', priority: '0.4' },
      { loc: `${siteUrl}/refund`, changefreq: 'monthly', priority: '0.4' },
      { loc: `${siteUrl}/shipping`, changefreq: 'monthly', priority: '0.4' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }
    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Admin Panel route (support standalone root admin.html and dist/admin.html)
app.get(['/admin', '/admin.html', '/panel'], (req, res) => {
  const rootAdmin = path.join(process.cwd(), 'admin.html');
  const distAdmin = path.join(process.cwd(), 'dist', 'admin.html');
  if (fs.existsSync(rootAdmin)) {
    return res.sendFile(rootAdmin);
  }
  if (fs.existsSync(distAdmin)) {
    return res.sendFile(distAdmin);
  }
  res.status(404).send('Admin panel not found. Please verify admin.html exists.');
});

// Download updated Android Studio APK Project zip
app.get(['/download-admin-apk', '/SsSeedShop-Android-APK.zip'], (req, res) => {
  const zipPath = path.join(process.cwd(), 'SsSeedShop-Android-APK.zip');
  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, 'SsSeedShop-Android-APK.zip');
  }
  res.status(404).send('APK Zip not found.');
});

// Backup data endpoints for offline / quota exceeded resilience
const BACKUP_FILE = path.join(DATA_DIR, 'backup_store.json');

app.get('/api/backup-data', (req, res) => {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
      return res.json({ success: true, data });
    }
  } catch (e) {
    console.error('Error reading backup data:', e);
  }
  return res.json({ success: false, data: null });
});

app.post('/api/backup-data', (req, res) => {
  try {
    const incoming = req.body || {};
    let existing: Record<string, any> = {};
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
      } catch {}
    }
    const merged = { ...existing, ...incoming, updatedAt: new Date().toISOString() };
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(merged, null, 2));
    return res.json({ success: true, message: 'Backup saved' });
  } catch (e: any) {
    console.error('Error saving backup data:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Export Express app for Vercel Serverless Functions and modular deployment
export default app;

// Start Express + Vite (only when running as standalone Node process, not serverless function)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Express route handler for Admin Panel routes before Vite middlewares
    app.get(['/admin', '/admin.html', '/panel', '/admin/*', '/panel/*'], (req, res) => {
      const rootAdmin = path.join(process.cwd(), 'admin.html');
      if (fs.existsSync(rootAdmin)) {
        return res.sendFile(rootAdmin);
      }
      return res.status(404).send('Admin panel file not found');
    });

    // Mount Vite dev server middlewares FIRST so modules & HMR work without interference
    app.use(vite.middlewares);

    // Fallback for direct URL page refreshes in dev mode
    app.use('*', async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      if (req.path === '/admin' || req.path === '/admin.html' || req.path === '/panel' || req.path.startsWith('/admin/') || req.path.startsWith('/panel/')) {
        const rootAdmin = path.join(process.cwd(), 'admin.html');
        if (fs.existsSync(rootAdmin)) return res.sendFile(rootAdmin);
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          return;
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        return next(e);
      }
      next();
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get(['/admin', '/admin.html', '/panel', '/admin/*', '/panel/*'], (req, res) => {
      const distAdmin = path.join(distPath, 'admin.html');
      if (fs.existsSync(distAdmin)) return res.sendFile(distAdmin);
      const rootAdmin = path.join(process.cwd(), 'admin.html');
      if (fs.existsSync(rootAdmin)) return res.sendFile(rootAdmin);
      return res.status(404).send('Admin panel file not found');
    });

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only invoke standalone listener if not running within Vercel or AWS Lambda runtime
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}
