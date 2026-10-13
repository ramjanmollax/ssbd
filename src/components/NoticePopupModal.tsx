import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { NoticeSettings } from '../lib/firestoreProducts';

interface NoticePopupModalProps {
  settings: NoticeSettings;
}

export const NoticePopupModal: React.FC<NoticePopupModalProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Keep popup disabled by default unless explicitly enabled in Firestore
    if (settings && settings.popupEnabled === true) {
      const dismissed = sessionStorage.getItem('seedhaven_popup_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOpen(false);
    }
  }, [settings?.popupEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('seedhaven_popup_dismissed', 'true');
  };

  const handleAction = () => {
    handleClose();
    if (settings.popupLink) {
      if (settings.popupLink.startsWith('http')) {
        window.open(settings.popupLink, '_blank');
      } else {
        const targetId = settings.popupLink.replace('/#', '').replace('#', '');
        const el = document.getElementById(targetId || 'products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen || !settings.popupEnabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-emerald-100 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 text-slate-500 bg-white/80 hover:bg-white rounded-full shadow-md transition-all cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X size={18} />
        </button>

        {/* Optional Popup Image */}
        {settings.popupImage ? (
          <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-100">
            <img
              src={settings.popupImage}
              alt={settings.popupHeading || 'অফার'}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-[#1c3822] via-[#2b5019] to-[#3a6924] text-white text-center relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-2">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-black">{settings.popupHeading || '🎁 বিশেষ ছাড় ও ধামাকা অফার!'}</h3>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 text-center space-y-4">
          {settings.popupImage && (
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {settings.popupHeading || '🎁 বিশেষ ছাড় ও ধামাকা অফার!'}
            </h3>
          )}

          {settings.popupSubheading && (
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {settings.popupSubheading}
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={handleAction}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{settings.popupButton || 'অফারটি দেখুন'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
