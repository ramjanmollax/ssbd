import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight, Sprout } from 'lucide-react';
import { Product } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onClearWishlist: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onClearWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up border border-emerald-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f0f5ee] px-5 py-4 flex items-center justify-between border-b border-emerald-100/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-2xs">
              <Heart size={20} className="fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1c3822]">
                উইশলিস্ট (Wishlist)
              </h2>
              <p className="text-xs text-emerald-700 font-medium">
                সংরক্ষিত প্রিয় পণ্যের তালিকা ({wishlist.length}টি)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wishlist.length > 0 && (
              <button
                onClick={onClearWishlist}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="সব মুছে ফেলুন"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">সব মুছুন</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-black flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300">
                <Heart size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                আপনার উইশলিস্ট খালি রয়েছে
              </h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                পছন্দের যেকোনো বীজের কার্ডে থাকা হার্ট (❤️) আইকনে ক্লিক করে আপনার উইশলিস্টে সেভ করে রাখুন।
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-[#118137] hover:bg-[#0f6f30] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Sprout size={16} />
                <span>পণ্য ব্রাউজ করুন</span>
              </button>
            </div>
          ) : (
            wishlist.map((product) => {
              const currentPrice = product.discountPrice || product.price;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50/80 hover:bg-emerald-50/40 border border-gray-200/80 transition-all group"
                >
                  {/* Product Thumbnail */}
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200 cursor-pointer relative flex items-center justify-center"
                  >
                    {product.image ? (
                      <img
                        src={getOptimizedImageUrl(product.image)}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-2xl">{product.imageEmoji || '🌱'}</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="text-xs sm:text-sm font-bold text-[#16331f] hover:text-[#118137] truncate cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate mb-1">
                      {product.category || 'বীজ ও চারা'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-[#118137]">
                        ৳{currentPrice}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ৳{product.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="p-2.5 bg-[#118137] hover:bg-[#0f6f30] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="কার্টে যোগ করুন"
                    >
                      <ShoppingCart size={15} />
                    </button>
                    <button
                      onClick={() => onToggleWishlist(product)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors cursor-pointer"
                      title="উইশলিস্ট থেকে সরান"
                    >
                      <Heart size={15} className="fill-emerald-500 text-emerald-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>মোট সংরক্ষিত: <strong className="text-[#1c3822]">{wishlist.length}টি পণ্য</strong></span>
            <button
              onClick={onClose}
              className="text-[#118137] hover:text-[#0f6f30] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>কেনাকাটা চালিয়ে যান</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
