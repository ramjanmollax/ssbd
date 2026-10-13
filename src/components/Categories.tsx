import React from 'react';
import { Category } from '../types';

interface CategoriesProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isLoading?: boolean;
}

// 3D vector graphics matching Bengali Seed Category Selector
const AllSeedsGraphic: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xs">
    <circle cx="32" cy="32" r="28" fill="#e8f5e9" />
    {/* Seed Packet */}
    <rect x="20" y="16" width="24" height="32" rx="4" fill="#1b5e20" />
    <path d="M20 16 L32 26 L44 16 Z" fill="#2e7d32" />
    <rect x="24" y="26" width="16" height="18" rx="2" fill="#ffffff" />
    {/* Leaf on packet */}
    <path d="M32 30 C28 30 26 34 32 40 C38 34 36 30 32 30 Z" fill="#4caf50" />
    {/* Spilled seeds */}
    <circle cx="16" cy="48" r="3" fill="#8d6e63" />
    <circle cx="22" cy="51" r="2.5" fill="#a1887f" />
    <circle cx="44" cy="49" r="3" fill="#8d6e63" />
    <circle cx="49" cy="45" r="2.5" fill="#a1887f" />
  </svg>
);

const FlowerSeedsGraphic: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xs">
    <circle cx="32" cy="32" r="28" fill="#fce4ec" />
    {/* Leaves */}
    <path d="M12 36 C18 28 30 32 32 36 C24 44 16 42 12 36 Z" fill="#43a047" />
    <path d="M52 36 C46 28 34 32 32 36 C40 44 48 42 52 36 Z" fill="#43a047" />
    {/* Pink Petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <g key={i} transform={`rotate(${angle} 32 32)`}>
        <path d="M32 32 C26 18 38 18 32 32 Z" fill="#ec407a" />
      </g>
    ))}
    {/* Yellow Center */}
    <circle cx="32" cy="32" r="7" fill="#fdd835" />
    <circle cx="32" cy="32" r="5" fill="#f57f17" />
  </svg>
);

const FruitSeedsGraphic: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xs">
    <circle cx="32" cy="32" r="28" fill="#ffebee" />
    {/* Whole Watermelon behind */}
    <circle cx="26" cy="28" r="18" fill="#2e7d32" />
    <path d="M16 18 C20 16 26 22 24 32 C22 40 18 42 16 18 Z" fill="#1b5e20" />
    <path d="M32 14 C36 16 38 24 34 34 Z" fill="#1b5e20" />
    {/* Slice */}
    <path d="M18 36 C18 48 46 48 46 36 Z" fill="#2e7d32" />
    <path d="M20 36 C20 46 44 46 44 36 Z" fill="#ffffff" />
    <path d="M22 36 C22 44 42 44 42 36 Z" fill="#e53935" />
    {/* Seeds */}
    <circle cx="28" cy="39" r="1.5" fill="#212121" />
    <circle cx="32" cy="41" r="1.5" fill="#212121" />
    <circle cx="36" cy="39" r="1.5" fill="#212121" />
  </svg>
);

const GardenToolsGraphic: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xs">
    <circle cx="32" cy="32" r="28" fill="#fff8e1" />
    {/* Crossed Handles */}
    <rect x="22" y="32" width="6" height="22" rx="3" transform="rotate(-30 25 43)" fill="#8d6e63" />
    <rect x="36" y="32" width="6" height="22" rx="3" transform="rotate(30 39 43)" fill="#8d6e63" />
    {/* Trowel Head */}
    <path d="M18 16 C18 12 30 14 26 28 L20 26 Z" fill="#78909c" />
    {/* Fork Head */}
    <path d="M36 16 L38 28 L42 28 L44 16 L42 16 L40 22 L38 16 Z" fill="#546e7a" />
  </svg>
);

const VegSeedsGraphic: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xs">
    <circle cx="32" cy="32" r="28" fill="#e8f5e9" />
    {/* Bok Choy Leaves */}
    <path d="M24 44 C16 32 18 18 28 14 C32 24 30 38 24 44 Z" fill="#43a047" />
    <path d="M40 44 C48 32 46 18 36 14 C32 24 34 38 40 44 Z" fill="#43a047" />
    <path d="M32 46 C26 34 28 16 32 12 C36 16 38 34 32 46 Z" fill="#66bb6a" />
    {/* Stems */}
    <path d="M26 48 C24 42 26 36 30 32 C34 36 36 42 34 48 Z" fill="#ffffff" />
    <path d="M32 50 C30 44 31 38 32 34 C33 38 34 44 32 50 Z" fill="#f1f8e9" />
  </svg>
);

export const CategoriesSkeleton: React.FC = () => {
  return (
    <section className="md:hidden w-full max-w-7xl mx-auto px-2 py-1" id="categories">
      <div className="w-full bg-white rounded-xl border border-emerald-100 p-1.5 animate-pulse">
        <div className="grid grid-cols-5 gap-1 w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-100 h-11 w-full"
            >
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
              <div className="w-8 h-2 bg-slate-200 rounded-md mt-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoryItem: React.FC<{
  cat: Category;
  isSelected: boolean;
  onSelectCategory: (id: string) => void;
}> = ({ cat, isSelected, onSelectCategory }) => {
  const [imgError, setImgError] = React.useState(false);

  const renderIcon = () => {
    if (cat.image && !imgError) {
      return (
        <img
          src={cat.image}
          alt={cat.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      );
    }

    const id = (cat.id || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();

    if (id === 'all' || name.includes('সকল') || name.includes('সব')) return <AllSeedsGraphic />;
    if (id === 'ful' || name.includes('ফুল') || name.includes('flower')) return <FlowerSeedsGraphic />;
    if (id === 'fruit' || name.includes('ফল') || name.includes('fruit')) return <FruitSeedsGraphic />;
    if (id === 'other' || name.includes('সামগ্রী') || name.includes('বাগান') || name.includes('tool')) return <GardenToolsGraphic />;
    if (id === 'veg' || name.includes('সবজি') || name.includes('veg')) return <VegSeedsGraphic />;
    if (name.includes('ভেষজ') || name.includes('ঔষধি') || name.includes('herbal')) return <VegSeedsGraphic />; // Use Veg as fallback for herbal


    // Fallback emoji inside a soft light-green circle
    return (
      <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center text-[11px] select-none leading-none">
        {cat.iconEmoji || '🌱'}
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={() => onSelectCategory(cat.id)}
      className={`group relative flex flex-col items-center justify-center w-full py-1.5 px-0.5 rounded-lg transition-all duration-150 cursor-pointer min-w-0 select-none border active:scale-95 ${
        isSelected
          ? 'bg-gradient-to-b from-[#f2fcf5] to-[#e8f8ed] border-emerald-600 shadow-2xs'
          : 'bg-[#f9fbf9] hover:bg-white border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Image / Graphic */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
        {renderIcon()}
      </div>

      {/* Category Name Label */}
      <span className="text-[9px] font-bold tracking-tight text-[#1c3822] text-center leading-tight max-w-full px-0.5 mt-0.5 line-clamp-1">
        {cat.name}
      </span>

      {/* Active Pill Indicator at Bottom */}
      {isSelected ? (
        <div className="w-4 h-0.5 bg-emerald-600 rounded-full shrink-0 mt-0.5 shadow-2xs" />
      ) : (
        <div className="w-4 h-0.5 bg-transparent shrink-0 mt-0.5" />
      )}
    </button>
  );
};

export const Categories: React.FC<CategoriesProps> = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) => {
  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  let list = [...(categories || [])];

  // Default fallback categories matching Bengali Seed Category Selector image
  if (list.length === 0) {
    list = [
      { id: 'all', name: 'সকল বীজ', iconEmoji: '🌾' },
      { id: 'ful', name: 'ফুলের বীজ', iconEmoji: '🌸' },
      { id: 'fruit', name: 'ফলের বীজ', iconEmoji: '🍉' },
      { id: 'other', name: 'বাগান সামগ্রী', iconEmoji: '🛠️' },
      { id: 'veg', name: 'সবজি বীজ', iconEmoji: '🥬' },
    ];
  } else {
    // Ensure "সকল বীজ" is prepended as first category
    const hasAll = list.some((c) => c.id === 'all' || c.name.includes('সকল'));
    if (!hasAll) {
      list.unshift({ id: 'all', name: 'সকল বীজ', iconEmoji: '🌾' });
    }
  }

  const isGridMode = list.length <= 5;

  return (
    <section className="md:hidden w-full max-w-7xl mx-auto px-2 py-1" id="categories">
      {/* Outer Card Wrapper with soft light-green border */}
      <div className="w-full bg-white/95 backdrop-blur-xs rounded-xl border border-emerald-500/25 shadow-2xs p-1">
        {isGridMode ? (
          <div className="grid grid-cols-5 gap-1 w-full">
            {list.map((cat: Category) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                isSelected={selectedCategory === cat.id}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-0.5 py-0.5">
            {list.map((cat: Category) => (
              <div key={cat.id} className="min-w-[62px] flex-1">
                <CategoryItem
                  cat={cat}
                  isSelected={selectedCategory === cat.id}
                  onSelectCategory={onSelectCategory}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
