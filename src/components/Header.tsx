import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Search,
  Heart,
  Scale,
  Truck,
  Phone,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';
import { StoreSettings, HomepageSettings } from '../lib/firestoreProducts';

import { Category } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu?: () => void;
  storeSettings?: StoreSettings;
  homepageSettings?: HomepageSettings;
  currentUser?: { name: string; phone: string; email?: string; photoUrl?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenTracker?: () => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenCompare?: () => void;
  compareCount?: number;
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
  onOpenSearch?: () => void;
  onNavigateHome?: () => void;
  menuBarEnabled?: boolean;
}

const getIconEmoji = (id: string, name: string, defaultEmoji?: string): string => {
  if (defaultEmoji && defaultEmoji.trim()) return defaultEmoji;
  const n = (name || id).toLowerCase();
  if (id === 'all' || n.includes('সকল') || n.includes('সব')) return '🌾';
  if (id === 'ful' || n.includes('ফুল') || n.includes('flower')) return '🌸';
  if (id === 'fruit' || n.includes('ফল') || n.includes('fruit')) return '🍉';
  if (id === 'other' || n.includes('সামগ্রী') || n.includes('বাগান') || n.includes('tool')) return '🛠️';
  if (id === 'veg' || n.includes('সবজি') || n.includes('veg')) return '🥬';
  return '🌱';
};

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  storeSettings,
  homepageSettings,
  currentUser,
  onOpenAuth,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenCompare,
  compareCount = 0,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  onOpenSearch,
  onOpenTracker,
  onNavigateHome,
  menuBarEnabled = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    setLogoError(false);
  }, [storeSettings?.logo]);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-xs">
      {/* ========================================================= */}
      {/* 1. TOP ANNOUNCEMENT BAR (PC / TABLET) */}
      {/* ========================================================= */}
      {homepageSettings?.topBarEnabled !== false && (
        <div className="hidden md:block bg-[#1e293b] text-slate-100 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Highlights */}
            <div className="flex items-center gap-4 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-amber-400" />
                <span>
                  হেল্পলাইন:{' '}
                  <a
                    href={`tel:${homepageSettings?.topBarPhone || '01410136900'}`}
                    className="text-white font-bold hover:underline"
                  >
                    {homepageSettings?.topBarPhone || '01410136900'}
                  </a>{' '}
                  ({homepageSettings?.topBarHours || 'সকাল ৯টা - রাত ৮টা'})
                </span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-amber-400" />
                <span className="font-bold text-amber-200">{homepageSettings?.topBarDelivery || 'সারাদেশে ক্যাশ অন হোম ডেলিভারি'}</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Sparkles size={12} />
                <span>{homepageSettings?.topBarGuarantee || '১০০% খাঁটি ও অঙ্কুরোদগম গ্যারান্টি'}</span>
              </span>
            </div>

            {/* Right Brand Tagline */}
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
              <ShieldCheck size={13} className="text-amber-400" />
              <span>{homepageSettings?.topBarTagline || 'Ss Seed Shop - বিশুদ্ধ বীজ ও গার্ডেন শপ'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN HEADER (RESPONSIVE: MOBILE & DESKTOP) */}
      {/* ========================================================= */}
      <header className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Left: Menu Toggle & Brand Logo with Store Name */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Menu Button (Mobile & Desktop) - rendered only when menuBarEnabled is true */}
          {menuBarEnabled && (
            <button
              onClick={onOpenMenu}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-slate-300"
              aria-label="Menu"
              title="মেনুবার খুলুন"
            >
              <Menu size={22} className="text-slate-800" />
              <span className="hidden md:inline text-xs font-bold text-slate-800">মেনু</span>
            </button>
          )}

          {/* Brand Logo & Store Name */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateHome) onNavigateHome();
            }}
            className="flex items-center gap-2 sm:gap-2.5 group select-none cursor-pointer min-w-0"
            title={storeSettings?.name || "Ss Seed Shop"}
          >
            {storeSettings?.logo && !logoError ? (
              <img
                src={storeSettings.logo}
                alt={storeSettings?.name || "Ss Seed Shop"}
                onError={() => setLogoError(true)}
                className="h-8 sm:h-9 md:h-10 w-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px] object-contain shrink-0 rounded-md"
              />
            ) : (
              <img
                src="/logo.svg"
                alt={storeSettings?.name || "Ss Seed Shop"}
                className="h-8 sm:h-9 md:h-10 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] object-contain shrink-0"
              />
            )}
          </a>
        </div>

        {/* Center: Desktop Categories Navigation + Compact Search Bar directly inside Header */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-3 flex-1 justify-center min-w-0 px-1">
          {/* Categories List in Header */}
          {homepageSettings?.showCategories !== false && (() => {
            let desktopCatList = [...(categories || [])];
            if (desktopCatList.length === 0) {
              desktopCatList = [
                { id: 'all', name: 'সকল বীজ', iconEmoji: '🌾', subtitle: '', itemCount: 0 },
                { id: 'ful', name: 'ফুলের বীজ', iconEmoji: '🌸', subtitle: '', itemCount: 0 },
                { id: 'fruit', name: 'ফলের বীজ', iconEmoji: '🍉', subtitle: '', itemCount: 0 },
                { id: 'other', name: 'বাগান সামগ্রী', iconEmoji: '🛠️', subtitle: '', itemCount: 0 },
                { id: 'veg', name: 'সবজি বীজ', iconEmoji: '🥬', subtitle: '', itemCount: 0 },
              ];
            } else {
              const hasAll = desktopCatList.some((c) => c.id === 'all' || c.name.includes('সকল'));
              if (!hasAll) {
                desktopCatList.unshift({ id: 'all', name: 'সকল বীজ', iconEmoji: '🌾', subtitle: '', itemCount: 0 });
              }
            }

            return (
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 max-w-full">
                {desktopCatList.map((cat) => {
                  const isSelected = (selectedCategory || 'all') === cat.id;
                  const emoji = getIconEmoji(cat.id, cat.name, cat.iconEmoji);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.id);
                        scrollToProducts();
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap select-none shrink-0 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-extrabold'
                          : 'bg-slate-100 text-slate-700 border-slate-200/90 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-xs leading-none">{emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Search Bar in Header (Desktop) - Sleek Neutral Theme */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchChange) {
                onSearchChange(searchQuery);
              }
              const el = document.getElementById('products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative w-44 lg:w-60 xl:w-72 shrink-0 flex items-center"
          >
            <div className="w-full flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white border border-slate-300 focus-within:border-emerald-600 rounded-full p-0.5 transition-all shadow-3xs">
              <div className="pl-2.5 text-slate-500 flex items-center shrink-0">
                <Search size={14} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (onSearchChange) onSearchChange(searchQuery);
                    const el = document.getElementById('products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder="বীজ ও বাগান পণ্য খুঁজুন..."
                className="w-full pl-2 pr-1.5 py-1 bg-transparent text-xs text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="px-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="ক্লিয়ার করুন"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                খুঁজুন
              </button>
            </div>
          </form>
        </div>

        {/* Right Actions: Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-2xs cursor-pointer relative"
            aria-label="Cart"
          >
            <ShoppingCart
              size={18}
              className={`transition-transform ${isAnimating ? 'scale-125' : ''}`}
            />
            <span className="hidden sm:inline text-xs font-bold">কার্ট</span>
            <span
              className={`min-w-[19px] h-[19px] bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center px-1 transition-all duration-300 ${
                isAnimating ? 'scale-125 ring-4 ring-amber-200' : ''
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </header>
    </div>
  );
};
