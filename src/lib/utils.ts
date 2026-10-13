/**
 * Client Utilities: Image Optimizer & Pixel Analytics
 * High-speed canvas-based image compression and Facebook Pixel event tracking.
 */

// ==========================================
// IMAGE OPTIMIZATION & PRELOADING
// ==========================================

export interface CompressedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preferWebp?: boolean;
}

export async function compressImageFile(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    preferWebp = true,
  } = options;

  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি লোড করা যায়নি'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) {
          const fallbackDataUrl = (e.target?.result as string) || '';
          resolve({
            dataUrl: fallbackDataUrl,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            width,
            height,
            format: 'jpeg',
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = '';
        let format: 'webp' | 'jpeg' = 'jpeg';

        if (preferWebp) {
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
            if (dataUrl.startsWith('data:image/webp')) {
              format = 'webp';
            }
          } catch {
            // fallback
          }
        }

        if (format !== 'webp' || !dataUrl) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          format = 'jpeg';
        }

        const compressedSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          width,
          height,
          format,
        });
      };

      img.src = (e.target?.result as string) || '';
    };

    reader.readAsDataURL(file);
  });
}

export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

// ==========================================
// FACEBOOK PIXEL TRACKING
// ==========================================

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const trackPixelEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
    }
  } catch (e) {
    console.error('Facebook Pixel tracking error:', e);
  }
};

export const trackViewContent = (product: { id: string; name: string; price: number; category?: string }) => {
  trackPixelEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'BDT',
  });
};

export const trackAddToCart = (product: { id: string; name: string; price: number }, quantity: number = 1) => {
  trackPixelEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'BDT',
    num_items: quantity,
  });
};

export const trackInitiateCheckout = (totalAmount: number, numItems: number) => {
  trackPixelEvent('InitiateCheckout', {
    value: totalAmount,
    currency: 'BDT',
    num_items: numItems,
  });
};

export const trackPurchase = (
  orderId: string,
  totalAmount: number,
  items: Array<{ product: { id: string; name: string; price: number }; quantity: number }>
) => {
  trackPixelEvent('Purchase', {
    order_id: orderId,
    value: totalAmount,
    currency: 'BDT',
    content_type: 'product',
    content_ids: items.map((i) => i.product.id),
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
  });
};
