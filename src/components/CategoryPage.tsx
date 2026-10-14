import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Search,
  X,
  ArrowUpDown,
  Check,
  Share2,
} from 'lucide-react';
import { Product, Category, OrderDetails } from '../types';
import { ProductCard } from './ProductCard';
import { StoreSettings, FooterSettings, ContactSettings } from '../lib/firestoreProducts';
import { Footer } from './Footer';

interface CategoryPageProps {
  categoryId: string;
  categoriesList: Category[];
  allProducts: Product[];
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onDirectCheckout?: (product: Product, quantity?: number) => void;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  compareProducts: Product[];
  onToggleCompare: (product: Product) => void;
  ordersList?: OrderDetails[];
  userRatings?: Record<string, number>;
  onRateProduct?: (productId: string, rating: number) => void;
  storeSettings?: StoreSettings;
  footerSettings?: FooterSettings;
  contactSettings?: ContactSettings;
  onOpenContact?: (tab?: 'about' | 'contact') => void;
  onOpenPolicy?: (tab?: 'privacy' | 'terms' | 'refund' | 'shipping') => void;
}

// Concise category metadata (emoji + clean short title only, no bloated text)
export function getCategoryMeta(catId: string, catName?: string, customEmoji?: string) {
  const id = (catId || '').toLowerCase();
  const name = (catName || '').toLowerCase();

  if (id === 'all' || name.includes('সকল') || name.includes('all')) {
    return {
      emoji: customEmoji || '🌾',
      title: catName || 'সকল বীজ',
    };
  }

  if (id === 'ful' || id === 'flower' || name.includes('ফুল')) {
    return {
      emoji: customEmoji || '🌸',
      title: catName || 'ফুলের বীজ',
    };
  }

  if (id === 'veg' || id === 'vegetable' || name.includes('সবজি')) {
    return {
      emoji: customEmoji || '🥬',
      title: catName || 'সবজি বীজ',
    };
  }

  if (id === 'fruit' || id === 'fol' || name.includes('ফল')) {
    return {
      emoji: customEmoji || '🍉',
      title: catName || 'ফলের বীজ',
    };
  }

  if (id === 'other' || id === 'tools' || name.includes('বাগান') || name.includes('সামগ্রী')) {
    return {
      emoji: customEmoji || '🛠️',
      title: catName || 'বাগান সামগ্রী',
    };
  }

  return {
    emoji: customEmoji || '🌱',
    title: catName || 'ক্যাটাগরি',
  };
}

export function matchProductToCategory(productCategory: string, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'all' || targetCategory === 'সকল') return true;
  const prodCat = (productCategory || '').toLowerCase().trim();
  const target = targetCategory.toLowerCase().trim();

  if (prodCat === target) return true;

  // Flower
  if (target === 'ful' || target === 'flower' || target.includes('ফুল')) {
    return prodCat.includes('ফুল') || prodCat.includes('flow') || prodCat.includes('ful');
  }
  // Vegetable
  if (target === 'veg' || target === 'vegetable' || target.includes('সবজি')) {
    return prodCat.includes('সবজি') || prodCat.includes('veg');
  }
  // Fruit
  if (target === 'fruit' || target === 'fol' || target.includes('ফল')) {
    return prodCat.includes('ফল') || prodCat.includes('fruit') || prodCat.includes('fol');
  }
  // Garden tools
  if (target === 'other' || target === 'tools' || target.includes('বাগান') || target.includes('সামগ্রী')) {
    return prodCat.includes('বাগান') || prodCat.includes('সামগ্রী') || prodCat.includes('tool') || prodCat.includes('other');
  }
  // Offers
  if (target === 'offers' || target === 'offer' || target.includes('অফার')) {
    return prodCat.includes('offer') || prodCat.includes('অফার') || prodCat.includes('discount') || prodCat.includes('ছাড়');
  }

  return prodCat.includes(target) || target.includes(prodCat);
}

const SORT_OPTIONS: Array<{ id: 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'newest'; label: string }> = [
  { id: 'featured', label: 'সেরা কালেকশন' },
  { id: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { id: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { id: 'discount', label: 'সর্বোচ্চ ছাড়' },
  { id: 'newest', label: 'নতুন পণ্য' },
];

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  categoriesList,
  allProducts,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onDirectCheckout,
  onOpenCart,
  onNavigateHome,
  wishlist,
  onToggleWishlist,
  compareProducts,
  onToggleCompare,
  ordersList = [],
  userRatings,
  onRateProduct,
  storeSettings,
  footerSettings,
  contactSettings,
  onOpenContact,
  onOpenPolicy,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSearchFilter('');
    setIsCategoryDropdownOpen(false);
    setIsSortDropdownOpen(false);
  }, [categoryId]);

  // Find active category
  const currentCategoryObj = useMemo(() => {
    return categoriesList.find((c) => c.id.toLowerCase() === categoryId.toLowerCase());
  }, [categoriesList, categoryId]);

  const meta = useMemo(() => {
    return getCategoryMeta(
      categoryId,
      currentCategoryObj?.name,
      currentCategoryObj?.iconEmoji
    );
  }, [categoryId, currentCategoryObj]);

  // Unified categories list for dropdown and switcher
  const fullCategoriesList = useMemo(() => {
    const list: Array<{ id: string; name: string; emoji: string }> = [
      { id: 'all', name: 'সকল বীজ', emoji: '🌾' },
    ];

    const defaultList = [
      { id: 'ful', name: 'ফুলের বীজ', emoji: '🌸' },
      { id: 'veg', name: 'সবজি বীজ', emoji: '🥬' },
      { id: 'fruit', name: 'ফলের বীজ', emoji: '🍉' },
      { id: 'other', name: 'বাগান সামগ্রী', emoji: '🛠️' },
    ];

    if (categoriesList && categoriesList.length > 0) {
      categoriesList.forEach((c) => {
        if (c.id !== 'all' && !list.some((it) => it.id === c.id)) {
          const itemMeta = getCategoryMeta(c.id, c.name, c.iconEmoji);
          list.push({
            id: c.id,
            name: c.name,
            emoji: itemMeta.emoji,
          });
        }
      });
    } else {
      defaultList.forEach((c) => list.push(c));
    }

    return list;
  }, [categoriesList]);

  // Filter products by category, search text, and stock
  const categoryProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category match
      const inCat = matchProductToCategory(product.category || '', categoryId);
      if (!inCat) return false;

      // Stock filter
      if (inStockOnly && product.stock === 0) return false;

      // Search within category
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchesName = product.name && product.name.toLowerCase().includes(q);
        const matchesDesc = product.description && product.description.toLowerCase().includes(q);
        const matchesCat = product.category && product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [allProducts, categoryId, inStockOnly, searchFilter]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...categoryProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'discount':
        return list.sort((a, b) => {
          const discA = a.originalPrice && a.originalPrice > a.price ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice && b.originalPrice > b.price ? b.originalPrice - b.price : 0;
          return discB - discA;
        });
      case 'newest':
        return list.reverse();
      case 'featured':
      default:
        return list;
    }
  }, [categoryProducts, sortBy]);

  const activeSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'সেরা কালেকশন';
  }, [sortBy]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${meta.title} - ${storeSettings?.name || 'Ss Seed Shop'}`,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="w-full">
        {/* ========================================================= */}
        {/* COMPACT TOP BAR: BACK + CATEGORY DROPDOWN + PRODUCT COUNT */}
        {/* ========================================================= */}
        <div className="bg-white border-b border-slate-200 sticky top-0 md:top-[68px] z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
            {/* Left: Back Button + Interactive Category Dropdown */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onNavigateHome}
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 active:scale-95 border border-slate-200/80"
                title="হোম পেজে ফিরে যান"
                aria-label="হোম পেজ"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Category Dropdown Selector */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen((prev) => !prev);
                    setIsSortDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 transition-all cursor-pointer font-bold text-xs sm:text-sm select-none active:scale-95"
                  title="অন্য ক্যাটাগরি বাছাই করুন"
                >
                  <span className="text-base leading-none">{meta.emoji}</span>
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">{meta.title}</span>
                  <ChevronDown
                    size={14}
                    className={`text-emerald-700 transition-transform duration-200 shrink-0 ${
                      isCategoryDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-52 sm:w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      ক্যাটাগরি বাছাই করুন
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {fullCategoriesList.map((cat) => {
                        const isSelected =
                          (categoryId === 'all' && cat.id === 'all') ||
                          matchProductToCategory(cat.name, categoryId) ||
                          categoryId.toLowerCase() === cat.id.toLowerCase();

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              onSelectCategory(cat.id);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer text-left ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-base leading-none shrink-0">{cat.emoji}</span>
                              <span className="truncate">{cat.name}</span>
                            </div>
                            {isSelected && <Check size={14} className="text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Count Pill */}
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 shrink-0">
                {categoryProducts.length}টি
              </span>
            </div>

            {/* Right: Quick Share */}
            <button
              onClick={handleShare}
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="ক্যাটাগরি লিংক কপি করুন"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span className="hidden sm:inline">শেয়ার</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPACT TOOLBAR: SEARCH + SORT DROPDOWN + IN-STOCK */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Search Input within Category */}
            <div className="relative flex-1 min-w-[160px] max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`${meta.title}-এ খুঁজুন...`}
                className="w-full pl-8 pr-7 py-1.5 bg-white text-xs font-semibold text-slate-800 border border-slate-200 focus:border-emerald-600 rounded-lg focus:outline-none transition-all placeholder:text-slate-400 shadow-3xs"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* In-Stock Toggle + Custom Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* In-Stock Checkbox */}
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer select-none text-[11px] sm:text-xs font-bold text-slate-700 transition-colors shadow-3xs hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="whitespace-nowrap">স্টকে আছে</span>
              </label>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSortDropdownOpen((prev) => !prev);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] sm:text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-3xs select-none active:scale-95"
                >
                  <ArrowUpDown size={13} className="text-slate-500 shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{activeSortLabel}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isSortDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Sort Menu */}
                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer text-left ${
                          sortBy === opt.id
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check size={13} className="text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PRODUCTS GRID */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 pb-10">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-4">
              {sortedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 6}
                  onAddToCart={onAddToCart}
                  onDirectCheckout={onDirectCheckout}
                  onSelectProduct={onSelectProduct}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleCompare={onToggleCompare}
                  isCompared={compareProducts.some((c) => c.id === product.id)}
                  ordersList={ordersList}
                  userRating={userRatings ? userRatings[product.id] : undefined}
                  onRateProduct={onRateProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-10 text-center border border-slate-200 shadow-3xs max-w-sm mx-auto my-8">
              <div className="text-3xl mb-2 select-none">🌱</div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {searchFilter
                  ? `"${searchFilter}" দিয়ে কোনো ফলাফল পাওয়া যায়নি`
                  : 'এই ক্যাটাগরিতে পণ্য দ্রুত যুক্ত করা হচ্ছে'}
              </p>
              {searchFilter ? (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  সকল পণ্য দেখুন
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        settings={footerSettings}
        contactSettings={contactSettings}
        onSelectCategory={onSelectCategory}
        onOpenContact={onOpenContact}
        onOpenPolicy={onOpenPolicy}
        onOpenCart={onOpenCart}
        onNavigateHome={onNavigateHome}
        whatsappEnabled={storeSettings?.whatsappEnabled !== false}
      />
    </div>
  );
};
