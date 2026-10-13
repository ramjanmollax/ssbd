import React, { useRef } from 'react';
import { HomepageSettings } from '../lib/firestoreProducts';
import { ArrowRight, Megaphone } from 'lucide-react';

interface MarqueeSectionProps {
  settings?: HomepageSettings;
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({ settings }) => {
  const marqueeRef = useRef<HTMLMarqueeElement>(null);

  if (settings?.marqueeEnabled === false) return null;

  const text =
    settings?.marqueeText ||
    '🌾 Ss Seed Shop - বিশুদ্ধ বীজ ও সুস্থ চারা দিয়ে গড়ে তুলুন আপনার স্বপ্নের ছাদবাগান! সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা ও ১০০% অঙ্কুরোদ্গম নিশ্চয়তা।';

  if (!text || text.trim() === '') return null;

  const badge = settings?.marqueeBadge || 'ঘোষণা';
  const link = settings?.marqueeLink || '';

  const handleClick = () => {
    if (!link) return;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
    } else if (link.startsWith('#')) {
      const el = document.getElementById(link.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-2.5">
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-full border border-amber-200/90 shadow-sm flex items-center gap-2 sm:gap-3 py-1.5 px-2 sm:px-3.5 select-none bg-gradient-to-r from-emerald-50/90 via-amber-50/80 to-green-50/90 text-slate-800 transition-all ${
          link ? 'cursor-pointer group hover:bg-slate-950 hover:shadow-md' : ''
        }`}
      >
        {/* Left Badge / Announcement Pill - Clean Dark Slate / Glass Pill */}
        {badge && (
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white shadow-2xs text-xs font-bold tracking-wide whitespace-nowrap shadow-xs">
            <Megaphone size={13} className="text-amber-200 animate-pulse" />
            <span>{badge}</span>
          </div>
        )}

        {/* Marquee Scrolling Content */}
        <div className="flex-1 min-w-0 overflow-hidden flex items-center">
          <marquee
            ref={marqueeRef}
            behavior="scroll"
            direction="left"
            scrollamount={7}
            onMouseEnter={() => marqueeRef.current?.stop()}
            onMouseLeave={() => marqueeRef.current?.start()}
            onTouchStart={() => marqueeRef.current?.stop()}
            onTouchEnd={() => marqueeRef.current?.start()}
            className="text-xs sm:text-sm font-bold tracking-wide text-slate-800"
          >
            <span className="inline-flex items-center gap-8">
              <span>{text}</span>
              <span className="text-emerald-600 font-black">•</span>
              <span>{text}</span>
              <span className="text-emerald-600 font-black">•</span>
              <span>{text}</span>
            </span>
          </marquee>
        </div>

        {/* Right Action Pill if link present */}
        {link && (
          <div className="shrink-0 hidden sm:flex items-center gap-1 text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-full group-hover:bg-white/20 transition-all">
            <span>দেখুন</span>
            <ArrowRight size={13} />
          </div>
        )}
      </div>
    </section>
  );
};
