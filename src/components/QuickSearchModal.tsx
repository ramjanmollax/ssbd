import React, { useState } from 'react';
import { Search, X, ShoppingCart, Star, Sparkles, Clock } from 'lucide-react';
import { Product } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  products?: Product[];
}

const POPULAR_KEYWORDS = [
  'টমেটো',
  'ফুলকপি',
  'লাউ',
  'বেগুন',
  'মরিচ',
  'শসা',
  'পালং শাক',
  'ফুল বীজ',
  'হাইব্রিড',
];

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onQuickView,
  products = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative animate-in fade-in slide-in-from-top-6 duration-200 border border-[#e8eadf]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#edf0e7] mb-4">
          <div className="relative flex-1 mr-4">
            <Search size={20} className="absolute left-3.5 top-3.5 text-[#6a776e]" />
            <input
              type="text"
              autoFocus
              placeholder="বীজের নাম বা ক্যাটাগরি অনুসন্ধান করুন (যেমন: টমেটো, ফুলকপি, ফলের বীজ)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f8faef] border border-[#dce2d2] rounded-2xl text-sm focus:outline-none focus:border-[#176b38] font-semibold text-[#063d24]"
            />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#e0e4d7] flex items-center justify-center text-[#063d24] hover:bg-[#f0f4e8]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Popular / Recent Keywords Suggestions */}
        {!searchTerm && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6a776e] mb-2">
              <Sparkles size={14} className="text-[#176b38]" />
              <span>জনপ্রিয় অনুসন্ধান (Popular Searches):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchTerm(kw)}
                  className="text-xs bg-[#f4f7ec] hover:bg-[#176b38] hover:text-white text-[#063d24] px-3 py-1.5 rounded-xl font-medium transition-colors border border-[#e2e8d4]"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[#6a776e]">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-bold text-sm">কোনো বীজ পাওয়া যায়নি</p>
              <p className="text-xs mt-0.5">অন্য কোনো নাম দিয়ে আবার চেষ্টা করুন</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onQuickView(product);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl border border-[#eaeee4] hover:border-[#176b38] hover:bg-[#f7f9f2] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50/50 flex items-center justify-center shrink-0 overflow-hidden border border-emerald-100/80">
                    {product.image && product.image.trim() !== '' ? (
                      <img
                        src={getOptimizedImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                        style={{ opacity: 0 }}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl">${product.imageEmoji || '🌱'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-3xl">{product.imageEmoji || '🌱'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#063d24] group-hover:text-[#176b38]">
                      {product.name}
                    </h4>
                    <div className="text-xs text-[#6a776e] flex items-center gap-2 mt-0.5">
                      <span>প্যাক: {product.packSize}</span>
                      <span>•</span>
                      <span className="text-[#176b38] font-bold">৳ {product.price}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="bg-[#176b38] text-white p-2.5 rounded-full hover:bg-[#063d24] transition-colors"
                  title="কার্টে যোগ করুন"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

