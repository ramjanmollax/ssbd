import React from 'react';
import { X, Scale, ShoppingCart, Trash2, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveFromCompare,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-[#118137]">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                পণ্যের তুলনা (Product Comparison)
              </h2>
              <p className="text-xs text-slate-500">
                একসাথে সর্বোচ্চ ৩টি পণ্যের দাম, ক্যাটাগরি ও বৈশিষ্ট্যের তুলনা করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">⚖️</div>
              <h3 className="text-base font-bold text-slate-800">তুলনা করার জন্য কোনো পণ্য নির্বাচন করা হয়নি</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                পণ্য কার্ডের ওপরের ডানপাশের স্কেল (Scale) আইকনে ক্লিক করে সর্বোচ্চ ৩টি পর্যন্ত পণ্য তুলনার তালিকায় যুক্ত করুন।
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-[#118137] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#0d6b2c] transition-all cursor-pointer"
              >
                পণ্য ব্রাউজ করুন
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-200 w-36">
                      বৈশিষ্ট্য / তথ্য
                    </th>
                    {comparedProducts.map((p) => (
                      <th
                        key={p.id}
                        className="p-3 text-center border-b border-slate-200 bg-white relative min-w-[200px]"
                      >
                        <button
                          onClick={() => onRemoveFromCompare(p.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="তালিকা থেকে সরান"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="w-20 h-20 mx-auto mb-2 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{p.imageEmoji || '🌱'}</span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 px-1">
                          {p.name}
                        </h4>
                      </th>
                    ))}
                    {/* Fill empty columns if less than 3 */}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, idx) => (
                      <th key={idx} className="p-3 text-center border-b border-slate-200 bg-slate-50/40 text-slate-400 text-xs font-normal">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl h-32 flex items-center justify-center">
                          আরেকটি পণ্য যুক্ত করুন
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {/* Price */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">মূল্য (Price)</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center font-extrabold text-[#118137] text-sm">
                        ৳{p.price}
                        {Number(p.originalPrice) > Number(p.price) && (
                          <span className="block text-[11px] text-slate-400 font-normal line-through">
                            ৳{p.originalPrice}
                          </span>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">ক্যাটাগরি</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center text-slate-700 font-medium">
                        <span className="px-2 py-0.5 bg-emerald-50 text-[#118137] rounded-md font-bold">
                          {p.category}
                        </span>
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">রেটিং</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center text-amber-500 font-bold">
                        ⭐ {p.rating || 5.0} ({p.reviewsCount || 128})
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Germination Days */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">অঙ্কুরোদগম সময়</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center text-slate-600">
                        {p.germinationDays || p.sproutDays || '৩-৫ দিন'}
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Season */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">উপযুক্ত মৌসুম</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center text-slate-600">
                        {p.season || 'সারা বছর / ১২ মাস'}
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Pack Size */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">প্যাকেট সাইজ</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center text-slate-600 font-semibold">
                        {p.packSize || '১০০ বীজ / প্যাকেট'}
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Stock */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">মজুদ অবস্থা</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-700">
                        স্টকে আছে (পাকা বীজ)
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>

                  {/* Action */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/80">অ্যাকশন</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <button
                          onClick={() => {
                            onAddToCart(p);
                            onClose();
                          }}
                          className="w-full py-2 px-3 bg-[#118137] hover:bg-[#0d6b2c] text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingCart size={14} />
                          <span>কার্টে নিন</span>
                        </button>
                      </td>
                    ))}
                    {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
                      <td key={i} className="p-3 text-center text-slate-300">-</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            সর্বোচ ৩টি পণ্য একসাথে তুলনা করা যাবে
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
