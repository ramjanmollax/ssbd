import React, { useState } from 'react';
import { Zap, Tag, ArrowRight, X } from 'lucide-react';

interface ClearanceBannerProps {
  noticeText?: string;
  noticeLink?: string;
  onViewOffer?: () => void;
}

export const ClearanceBanner: React.FC<ClearanceBannerProps> = ({ noticeText, noticeLink, onViewOffer }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleClick = (e: React.MouseEvent) => {
    // If target was close button, don't trigger link
    if ((e.target as HTMLElement).closest('.close-banner-btn')) {
      return;
    }
    if (noticeLink) {
      if (noticeLink.startsWith('http')) {
        window.open(noticeLink, '_blank');
        return;
      } else {
        const targetId = noticeLink.replace('/#', '').replace('#', '');
        const el = document.getElementById(targetId || 'products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    if (onViewOffer) onViewOffer();
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-3 relative">
      <div
        onClick={handleClick}
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-md cursor-pointer group transition-transform active:scale-98"
        style={{
          background: 'linear-gradient(135deg, #7a1f1f 0%, #b8360a 45%, #d97706 100%)'
        }}
      >
        {/* Subtle radial background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5), transparent 55%), radial-gradient(circle at 85% 80%, rgba(255,210,120,0.5), transparent 55%)'
          }}
        />

        <div className="relative flex items-center gap-2.5 p-3 sm:p-4 text-white pr-9">
          {/* Icon Box */}
          <div className="shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white/20 backdrop-blur-xs grid place-items-center">
            <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                বিশেষ অ্যানাউন্সমেন্ট
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-yellow-300 text-amber-950 px-2 py-0.5 rounded-full">
                <Tag size={10} /> বিশেষ ছাড়
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-black leading-snug line-clamp-1">
              {noticeText || 'স্টক ক্লিয়ারেন্স অফার চলছে — সীমিত স্টকের পণ্যে বিশেষ ডিসকাউন্ট!'}
            </h2>
            <p className="text-[10px] sm:text-xs opacity-90 line-clamp-1 mt-0.5">
              বীজ সংগ্রহ করুন সেরা ছাড়ে। যেকোনো তথ্যে কল করুন।
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center gap-1 text-xs font-bold bg-white text-amber-800 px-2.5 py-1.5 rounded-xl group-hover:bg-amber-50 transition-colors shadow-2xs">
            <span>দেখুন</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="close-banner-btn absolute top-2 right-2 z-10 p-1.5 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
          title="বন্ধ করুন"
          aria-label="বন্ধ করুন"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  );
};
