import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface SplashLoaderProps {
  onComplete: () => void;
  brandName?: string;
  logoUrl?: string;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({
  onComplete,
  brandName = 'Ss Seed Shop',
  logoUrl,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Smooth progress bar animation over ~1200ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 25) + 15;
        return next > 100 ? 100 : next;
      });
    }, 150);

    // Preload critical images into browser cache
    const preloadUrls = [
      logoUrl,
      '/api/image-proxy?url=https%3A%2F%2Fabseed.com.bd',
    ].filter(Boolean) as string[];

    preloadUrls.forEach((src) => {
      try {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      } catch (e) {}
    });

    // Start fade out after 1.2 seconds, and trigger onComplete after 1.5 seconds
    const timerFade = setTimeout(() => {
      setIsFading(true);
    }, 1200);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timerFade);
      clearTimeout(timerComplete);
    };
  }, [onComplete, logoUrl]);

  return (
    <div
      style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" }}
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-[#06321b] via-[#084b29] to-[#042111] text-white flex flex-col items-center justify-between p-6 transition-opacity duration-300 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Decorative Sparkles */}
      <div className="w-full max-w-sm flex justify-between items-center opacity-40 text-xs font-semibold tracking-widest text-emerald-300 pt-4">
        <span className="flex items-center gap-1"><Zap size={12} /> FAST LOADING</span>
        <span className="flex items-center gap-1"><ShieldCheck size={12} /> 100% GENUINE</span>
      </div>

      {/* Center Brand & Pulse Animation */}
      <div className="flex flex-col items-center text-center my-auto space-y-5 animate-in zoom-in-95 duration-300">
        <div className="relative">
          {/* Pulsing ring background */}
          <div className="absolute -inset-4 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#087d43] to-[#49a845] p-1 shadow-2xl border-2 border-emerald-300/40 flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="w-full h-full object-contain rounded-2xl bg-white/10 p-1"
              />
            ) : (
              <Sprout size={48} className="text-white drop-shadow-md animate-bounce" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            {brandName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1">
            মানসম্মত বীজ ও কৃষি সরঞ্জাম লোড হচ্ছে...
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 sm:w-72 space-y-2 pt-2">
          <div className="w-full h-2.5 bg-emerald-950/80 rounded-full p-0.5 border border-emerald-500/30 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-lime-300 rounded-full transition-all duration-200 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-emerald-300/80 font-bold px-1">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Trust Badge */}
      <div className="pb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/50 px-3.5 py-1.5 rounded-full text-[11px] text-emerald-200 font-semibold shadow-md backdrop-blur-xs">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
        </div>
      </div>
    </div>
  );
};
