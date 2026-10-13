import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroProps {
  banners?: Banner[];
  onNavigate?: (path: string) => void;
}

interface SingleHeroSliderProps {
  banners: Banner[];
  isMobile: boolean;
  onNavigate?: (path: string) => void;
}

const SingleHeroSlider: React.FC<SingleHeroSliderProps> = ({ banners, isMobile, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Preload banner images
  useEffect(() => {
    if (banners.length === 0) return;
    banners.forEach((b) => {
      const src = isMobile ? b.mobileImage : b.image;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [banners, isMobile]);

  // Keep currentIndex in bounds
  useEffect(() => {
    if (banners.length > 0 && currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  // Auto-slide effect if multiple banners
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];
  const currentImg = isMobile ? currentBanner.mobileImage : currentBanner.image;
  if (!currentImg) return null;

  const hasOverlayText = Boolean(currentBanner.title || currentBanner.subtitle || currentBanner.buttonText);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (link?: string) => {
    if (!link) {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
    } else if (link.startsWith('#')) {
      const targetId = link.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link.startsWith('/')) {
      if (onNavigate) {
        onNavigate(link);
      } else {
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto pt-2 pb-3 px-3 sm:px-6 lg:px-8">
      <div
        className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200/80 bg-slate-900 group select-none flex flex-col justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          onClick={() => handleBannerClick(currentBanner.buttonLink)}
          className={`relative w-full flex items-center justify-center overflow-hidden cursor-pointer bg-slate-950 ${
            isMobile
              ? 'h-[170px] sm:h-[220px]'
              : 'h-[260px] md:h-[340px] lg:h-[400px] xl:h-[440px]'
          }`}
        >
          <img
            key={`banner-${isMobile ? 'm' : 'pc'}-${currentBanner.id || currentIndex}`}
            src={currentImg}
            alt={currentBanner.title || 'Ss Seed Shop Banner'}
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          />

          {hasOverlayText && (
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-4 sm:p-7 lg:p-10 text-white pointer-events-none">
              <div className="max-w-2xl space-y-1 sm:space-y-2 pointer-events-auto">
                {currentBanner.title && (
                  <h2 className="text-xs sm:text-2xl lg:text-3xl font-black text-white drop-shadow-md line-clamp-2 leading-snug tracking-tight">
                    {currentBanner.title}
                  </h2>
                )}
                {currentBanner.subtitle && (
                  <p className="text-[10px] sm:text-sm lg:text-base text-emerald-100/90 font-medium line-clamp-2 drop-shadow-xs">
                    {currentBanner.subtitle}
                  </p>
                )}
                {currentBanner.buttonText && (
                  <div className="pt-1 sm:pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(currentBanner.buttonLink);
                      }}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 hover:text-white text-[11px] sm:text-sm font-extrabold rounded-xl shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>{currentBanner.buttonText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/65 hover:bg-slate-950/95 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl border border-white/20 active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={isMobile ? 18 : 22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/65 hover:bg-slate-950/95 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl border border-white/20 active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight size={isMobile ? 18 : 22} />
            </button>

            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? 'w-4 sm:w-6 bg-[#22c55e]' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export const Hero: React.FC<HeroProps> = ({ banners = [], onNavigate }) => {
  // Only banners with valid PC image (image)
  const pcBanners = banners.filter((b) => b.active !== false && Boolean(b.image && b.image.trim() !== ''));

  // Only banners with valid Mobile image (mobileImage)
  const mobileBanners = banners.filter((b) => b.active !== false && Boolean(b.mobileImage && b.mobileImage.trim() !== ''));

  if (pcBanners.length === 0 && mobileBanners.length === 0) {
    return null;
  }

  return (
    <>
      {/* PC / Desktop Hero Section: Shown ONLY on screens >= 768px and ONLY if PC banners exist */}
      {pcBanners.length > 0 && (
        <div className="hidden md:block">
          <SingleHeroSlider banners={pcBanners} isMobile={false} onNavigate={onNavigate} />
        </div>
      )}

      {/* Mobile Hero Section: Shown ONLY on mobile screens < 768px and ONLY if Mobile banners exist */}
      {mobileBanners.length > 0 && (
        <div className="block md:hidden">
          <SingleHeroSlider banners={mobileBanners} isMobile={true} onNavigate={onNavigate} />
        </div>
      )}
    </>
  );
};
