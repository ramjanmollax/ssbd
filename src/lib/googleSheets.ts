import { Product } from '../types';

/**
 * Parses CSV text exported or published from Google Sheets into Product objects.
 */
export function parseGoogleSheetCsv(csvText: string): Product[] {
  if (!csvText || !csvText.trim()) return [];

  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  if (lines.length < 2) return [];

  // Helper to split row CSV handling quotes
  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inside && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        cells.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const rawHeaders = parseRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9à-ÿ-অ-হা-ৌ]/gi, '')
  );

  const findColIndex = (keywords: string[]): number => {
    return rawHeaders.findIndex((h) => keywords.some((k) => h.includes(k.toLowerCase())));
  };

  const nameIdx = findColIndex(['name', 'title', 'নাম', 'প্রোডাক্ট']);
  const catIdx = findColIndex(['category', 'cat', 'ক্যাটাগরি']);
  const priceIdx = findColIndex(['price', 'sale', 'দাম', 'মূল্য']);
  const origPriceIdx = findColIndex(['original', 'regular', 'পূর্বের', 'আগের']);
  const stockIdx = findColIndex(['stock', 'quantity', 'স্টক', 'পরিমাণ']);
  const imgIdx = findColIndex(['image', 'img', 'photo', 'ছবি', 'ইমেজ']);
  const descIdx = findColIndex(['description', 'desc', 'বিবরণ', 'বর্ণনা']);
  const seedTypeIdx = findColIndex(['seedtype', 'type', 'জাত']);
  const guideIdx = findColIndex(['guide', 'cultivation', 'চাষ']);
  const unitIdx = findColIndex(['unit', 'pack', 'প্যাকেট']);
  const idIdx = findColIndex(['id', 'sku', 'আইডি']);

  const parsedProducts: Product[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    const name = nameIdx >= 0 && row[nameIdx] ? row[nameIdx] : '';
    if (!name) continue;

    const id = idIdx >= 0 && row[idIdx] ? row[idIdx] : `gsheet-${i}-${Date.now()}`;
    const category = catIdx >= 0 && row[catIdx] ? row[catIdx] : 'সবজি';
    const priceStr = priceIdx >= 0 && row[priceIdx] ? row[priceIdx].replace(/[^0-9.]/g, '') : '0';
    const price = Number(priceStr) || 0;
    const origPriceStr =
      origPriceIdx >= 0 && row[origPriceIdx] ? row[origPriceIdx].replace(/[^0-9.]/g, '') : '';
    const originalPrice = origPriceStr ? Number(origPriceStr) : undefined;
    const stockStr = stockIdx >= 0 && row[stockIdx] ? row[stockIdx].replace(/[^0-9]/g, '') : '100';
    const stock = Number(stockStr) || 100;
    const image = imgIdx >= 0 && row[imgIdx] ? row[imgIdx] : '';
    const description = descIdx >= 0 && row[descIdx] ? row[descIdx] : '';
    const seedType = seedTypeIdx >= 0 && row[seedTypeIdx] ? row[seedTypeIdx] : '';
    const cultivationGuide = guideIdx >= 0 && row[guideIdx] ? row[guideIdx] : '';
    const unit = unitIdx >= 0 && row[unitIdx] ? row[unitIdx] : '১ প্যাকেট';

    parsedProducts.push({
      id,
      name,
      category,
      price,
      originalPrice,
      stock,
      image,
      description,
      seedType,
      cultivationGuide,
      unit,
      rating: 5,
      reviewsCount: 12,
      active: true,
      popular: true,
    });
  }

  return parsedProducts;
}

/**
 * Normalizes standard Google Sheets view/edit URLs to published/export CSV format.
 */
export function formatGoogleSheetUrl(inputUrl: string): string {
  if (!inputUrl || !inputUrl.trim()) return '';
  let url = inputUrl.trim();

  // If user enters standard edit URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    if (url.includes('/pub') && url.includes('output=csv')) {
      return url;
    }
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  }
  return url;
}

/**
 * Fetches products from Google Sheet URL asynchronously.
 */
export async function fetchProductsFromGoogleSheet(inputUrl: string): Promise<Product[]> {
  const csvUrl = formatGoogleSheetUrl(inputUrl);
  if (!csvUrl) return [];

  try {
    const response = await fetch(csvUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Google Sheet HTTP ${response.status}`);
    const text = await response.text();
    return parseGoogleSheetCsv(text);
  } catch (err) {
    console.warn('Failed to fetch products from Google Sheet URL:', err);
    return [];
  }
}
