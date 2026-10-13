import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User, Menu as MenuIcon, Search } from 'lucide-react';

interface BottomNavbarProps {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onOpenCart: () => void;
  cartCount: number;
  loginEnabled?: boolean;
  currentUser?: { name: string; phone: string; email?: string; photoUrl?: string } | null;
  onOpenAuth?: () => void;
  onOpenMenu?: () => void;
  menuBarEnabled?: boolean;
  pathname?: string;
  onOpenSearch?: () => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  onNavigateHome,
  onNavigateProducts,
  onOpenCart,
  cartCount,
  loginEnabled = true,
  currentUser,
  onOpenAuth,
  onOpenMenu,
  menuBarEnabled = false,
  pathname = '/',
  onOpenSearch,
}) => {
  const isHomeActive = pathname === '/' || pathname === '';
  const isProductsActive = pathname === '/products' || pathname.startsWith('/category');
  const isCartActive = pathname === '/cart';
  const isAuthActive = pathname === '/login' || pathname === '/auth' || pathname === '/account';

  return (
    <nav aria-label="Mobile Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-500/20 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] px-2 py-1 sm:px-4 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            isHomeActive
              ? 'text-[#15803d] font-extrabold'
              : 'text-slate-600 hover:text-[#15803d]'
          }`}
          title="হোম"
        >
          <div className="relative">
            <Home size={21} strokeWidth={isHomeActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] tracking-tight font-bold">হোম</span>
        </button>

        {/* Products */}
        <button
          onClick={onNavigateProducts}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            isProductsActive
              ? 'text-[#15803d] font-extrabold'
              : 'text-slate-600 hover:text-[#15803d]'
          }`}
          title="সকল বীজ"
        >
          <div className="relative">
            <ShoppingBag size={21} strokeWidth={isProductsActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] tracking-tight font-bold">বীজ ও পণ্য</span>
        </button>

        {/* Search */}
        <button
          onClick={() => {
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              const el = document.getElementById('products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-slate-600 hover:text-[#15803d] transition-all cursor-pointer select-none active:scale-95"
          title="খুঁজুন"
        >
          <div className="relative">
            <Search size={21} strokeWidth={2} />
          </div>
          <span className="text-[10px] tracking-tight font-bold">খুঁজুন</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            isCartActive
              ? 'text-[#15803d] font-extrabold'
              : 'text-slate-600 hover:text-[#15803d]'
          }`}
          title="কার্ট"
        >
          <div className="relative">
            <ShoppingCart size={21} strokeWidth={isCartActive ? 2.5 : 2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-bold">কার্ট</span>
        </button>

        {/* Login / User Account (Disabled) */}
        {false && loginEnabled && (
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
            }}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
              isAuthActive
                ? 'text-[#15803d] font-extrabold'
                : 'text-slate-600 hover:text-[#15803d]'
            }`}
            title={currentUser ? 'আমার একাউন্ট' : 'লগইন'}
          >
            <div className="relative">
              {currentUser ? (
                <div className="w-5 h-5 rounded-full bg-[#15803d] text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <User size={21} strokeWidth={isAuthActive ? 2.5 : 2} />
              )}
            </div>
            <span className="text-[10px] tracking-tight font-bold">
              {currentUser ? 'একাউন্ট' : 'লগইন'}
            </span>
          </button>
        )}

        {/* Menu (if enabled in settings) */}
        {menuBarEnabled && (
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-slate-600 hover:text-[#15803d] transition-all cursor-pointer select-none active:scale-95"
            title="মেনু"
          >
            <div className="relative">
              <MenuIcon size={21} strokeWidth={2} />
            </div>
            <span className="text-[10px] tracking-tight font-bold">মেনু</span>
          </button>
        )}
      </div>
    </nav>
  );
};
