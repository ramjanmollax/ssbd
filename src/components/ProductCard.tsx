import React, { useState } from 'react';
import { ShoppingCart, ShoppingBag, Repeat, Heart, Crown, Zap, ThumbsUp, Gift, Scale, Check, Flame, Sparkles } from 'lucide-react';
import { Product, OrderDetails } from '../types';
import { getOptimizedImageUrl, getFallbackImageUrl } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onDirectCheckout?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  ordersList?: OrderDetails[];
  userRating?: number;
  onRateProduct?: (productId: string, rating: number) => void;
  priority?: boolean;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs flex flex-col h-full justify-between animate-pulse">
      <div className="relative aspect-square bg-slate-100" />
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-slate-200 rounded-md" />
          <div className="w-full h-3 bg-slate-100 rounded-md" />
        </div>
        <div className="pt-2 space-y-2">
          <div className="w-1/3 h-5 bg-slate-200 rounded-md" />
          <div className="w-full h-9 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onDirectCheckout,
  onQuickView,
  onSelectProduct,
  onToggleCompare,
  isCompared,
  onToggleWishlist,
  isWishlisted,
  ordersList = [],
  priority = false,
}) => {
  const initialImageUrl = product.image ? getOptimizedImageUrl(product.image) : '';
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(initialImageUrl);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync if product image changes
  React.useEffect(() => {
    const nextUrl = product.image ? getOptimizedImageUrl(product.image) : '';
    setCurrentImgSrc(nextUrl);
    setIsLoaded(false);
    setHasError(false);
  }, [product.image]);

  const handleImageError = () => {
    // If proxy URL failed, fallback to original direct URL
    if (currentImgSrc.includes('/api/image-proxy') && product.image) {
      const fallback = getFallbackImageUrl(currentImgSrc, product.image);
      if (fallback && fallback !== currentImgSrc) {
        setCurrentImgSrc(fallback);
        return;
      }
    }
    setHasError(true);
    setIsLoaded(true);
  };

  const handleView = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handlePreload = () => {
    if (currentImgSrc && !isLoaded) {
      const img = new Image();
      img.decoding = 'async';
      img.src = currentImgSrc;
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDirectCheckout) {
      onDirectCheckout(product);
    } else {
      onAddToCart(product);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <article
      onMouseEnter={handlePreload}
      onTouchStart={handlePreload}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs card-hover-lift flex flex-col h-full justify-between select-none"
    >
      {/* Product Image Container */}
      <div
        onClick={handleView}
        className="relative aspect-square overflow-hidden bg-[#f4f7f4] cursor-pointer group/img"
      >
        {/* Shimmer skeleton while image is loading */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-100 via-emerald-50/50 to-slate-200 animate-pulse flex items-center justify-center">
            <span className="text-2xl opacity-40 select-none">{product.imageEmoji || '🌱'}</span>
          </div>
        )}

        {currentImgSrc && !hasError ? (
          <img
            src={currentImgSrc}
            alt={product.name}
            className={`w-full h-full object-cover group-hover/img:scale-108 transition-all duration-500 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-emerald-50/60">
            {product.imageEmoji || '🌱'}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-lg shadow-sm z-10">
            -{discountPercent}% ছাড়
          </span>
        )}
      </div>

      {/* Card Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold mb-1">
            <span>{product.category || 'বীজ'}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700">ইন স্টক</span>
          </div>

          {/* Title */}
          <h3
            onClick={handleView}
            className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1 hover:text-[#126436] cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1 font-medium">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Double Action CTA Row */}
        <div className="mt-auto space-y-2 pt-1 border-t border-slate-100">
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-sm sm:text-base text-[#083e23]">
                ৳{product.price}
              </span>
              {Number(product.originalPrice) > 0 && Number(product.originalPrice) > Number(product.price) && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>
            {Number(product.cashback) > 0 && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                ৳{product.cashback} ক্যাশব্যাক
              </span>
            )}
          </div>

          {/* Dual Action Buttons: Order Now + Add to Cart */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold text-[#126436] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
              title="কার্টে যোগ করুন"
            >
              <ShoppingCart size={13} />
              <span className="truncate">কার্টে রাখুন</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-2 px-2 rounded-xl text-[11px] sm:text-xs font-black text-white bg-[#126436] hover:bg-[#083e23] flex items-center justify-center gap-1 shadow-md shadow-emerald-900/15 transition-all cursor-pointer active:scale-95"
              title="এখনই অর্ডার করুন"
            >
              <ShoppingBag size={13} />
              <span className="truncate">অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};



