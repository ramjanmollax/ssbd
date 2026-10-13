import React, { useState } from 'react';
import {
  X,
  Home,
  Sprout,
  LayoutGrid,
  ShoppingCart,
  User,
  Phone,
  Heart,
  ChevronRight,
  Truck,
  ShieldCheck,
  FileText,
  Package,
  PlayCircle,
  Search,
  Scale,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { DeliveryChargeModal, OrderRulesModal } from './InfoModals';
import { StoreSettings, MenuSettings, DEFAULT_MENU_SETTINGS } from '../lib/firestoreProducts';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onSelectCategory: (catId: string) => void;
  onOpenContact: (tab?: 'about' | 'contact') => void;
  onOpenPolicy?: (tab?: 'privacy' | 'terms' | 'refund' | 'shipping') => void;
  onOpenAdmin?: () => void;
  currentUser?: { name: string; phone: string; photoUrl?: string; email?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  loginEnabled?: boolean;
  onOpenTracker?: () => void;
  onOpenSearch?: () => void;
  storeSettings?: StoreSettings;
  menuSettings?: MenuSettings;
  onOpenCompare?: () => void;
  compareCount?: number;
  whatsappEnabled?: boolean;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onSelectCategory,
  onOpenContact,
  onOpenPolicy,
  currentUser,
  onOpenAuth,
  onLogout,
  loginEnabled = true,
  onOpenTracker,
  onOpenSearch,
  storeSettings,
  menuSettings,
  onOpenCompare,
  compareCount = 0,
  whatsappEnabled,
  onOpenAdmin,
}) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const menu = menuSettings || DEFAULT_MENU_SETTINGS;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-[80%] sm:w-[340px] max-w-[360px] h-full bg-white flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-left border-r border-[#e3ebe0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header Section: Short Form SHBD Brand */}
          <div className="bg-[#f4f7f2] p-3 sm:p-4 flex items-center justify-between border-b border-[#e3ebe0]">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Logo Icon */}
              {storeSettings?.logo ? (
                <img
                  src={storeSettings.logo}
                  alt={storeSettings?.name || "Ss Seed Shop"}
                  className="w-10 h-10 rounded-xl object-contain border border-emerald-100 bg-white p-0.5 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-xl border border-emerald-100 flex items-center justify-center text-xl shadow-2xs shrink-0">
                  🌱
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-black text-[#1c3822] leading-tight flex items-center gap-1.5">
                  <span className="truncate">{storeSettings?.name || "Ss Seed Shop"}</span>
                </h2>
                <p className="text-[10px] font-semibold text-[#2b5019] flex items-center gap-1 mt-0.5 truncate">
                  <span>বিশুদ্ধ বীজ ও গার্ডেন শপ</span>
                  <span>🍃</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-black flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 ml-1"
              aria-label="Close menu"
            >
              <X size={17} />
            </button>
          </div>

          {/* User Auth Section inside Menu Drawer */}
          {loginEnabled !== false && (
            <div className="p-3 bg-emerald-50/60 border-b border-emerald-100">
              {currentUser ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {currentUser.photoUrl ? (
                      <img
                        src={currentUser.photoUrl}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-emerald-300 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#118137] text-white flex items-center justify-center text-xs font-black shrink-0">
                        {currentUser.name ? currentUser.name[0] : 'ব'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] font-semibold text-[#118137] truncate">
                        {currentUser.email || currentUser.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    title="লগআউট"
                    className="px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    লগআউট
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full h-10 rounded-xl bg-[#118137] hover:bg-[#0d6b2c] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <User size={16} />
                  <span>লগইন / একাউন্ট খুলুন</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Actions & Services Bar (মেনুবারে সব দরকারি সেবা ও ফিচার) */}
          {(menu.menuOrderTrackerEnabled !== false ||
            menu.menuDeliveryChargeEnabled !== false ||
            menu.menuOrderRulesEnabled !== false ||
            menu.menuSearchEnabled !== false) && (
            <div className="p-3 bg-[#f8faf6] border-b border-[#e3ebe0]">
              <p className="text-[10px] font-black text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>প্রয়োজনীয় সেবা ও সুবিধাসমূহ</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* ১. অর্ডার ট্র্যাক */}
                {menu.menuOrderTrackerEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenTracker) onOpenTracker();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-950 transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Truck size={15} className="text-[#15803d] shrink-0" />
                    <span className="truncate">অর্ডার ট্র্যাক</span>
                  </button>
                )}

                {/* ২. চার্জ দেখুন */}
                {menu.menuDeliveryChargeEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => setShowDeliveryModal(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-xs font-bold text-gray-800 hover:text-emerald-950 transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Package size={15} className="text-[#15803d] shrink-0" />
                    <span className="truncate">চার্জ দেখুন</span>
                  </button>
                )}

                {/* ৩. অর্ডার নিয়ম */}
                {menu.menuOrderRulesEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-xs font-bold text-gray-800 hover:text-emerald-950 transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <PlayCircle size={15} className="text-[#15803d] shrink-0" />
                    <span className="truncate">অর্ডার নিয়ম</span>
                  </button>
                )}

                {/* ৪. পণ্য খুঁজুন */}
                {menu.menuSearchEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSearch) onOpenSearch();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 text-xs font-bold text-[#1c3822] transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Search size={15} className="text-[#15803d] shrink-0" />
                    <span className="truncate">পণ্য খুঁজুন</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Menu Items List */}
          <div className="p-2.5 sm:p-3 space-y-1">
            {/* 1. হোম */}
            {menu.menuHomeEnabled !== false && (
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onClose();
                }}
                className="w-full bg-[#f0f5ee] rounded-xl px-3 py-2.5 text-[#1c3822] font-bold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Home size={18} className="text-[#1c3822] fill-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[#1c3822] truncate">হোম</span>
                </div>
                <ChevronRight size={16} className="text-[#1c3822] shrink-0" />
              </button>
            )}

            {/* 2. সব পণ্য */}
            {menu.menuAllProductsEnabled !== false && (
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onClose();
                  const element = document.getElementById('products');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full hover:bg-gray-50 rounded-xl px-3 py-2.5 text-gray-800 font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sprout size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">সব বীজ ও চারা</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            )}

            {/* 3. ক্যাটাগরি */}
            {menu.menuCategoriesEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  const element = document.getElementById('categories');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full hover:bg-gray-50 rounded-xl px-3 py-2.5 text-gray-800 font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutGrid size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">ক্যাটাগরি সমূহ</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            )}

            {/* 4. কার্ট */}
            {menu.menuCartEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="w-full hover:bg-gray-50 rounded-xl px-3 py-2.5 text-gray-800 font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingCart size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">শপিং কার্ট</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {cartCount > 0 && (
                    <span className="bg-[#1c3822] text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            )}

            {/* 5. উইশলিস্ট */}
            {menu.menuWishlistEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className="w-full hover:bg-gray-50 rounded-xl px-3 py-2.5 text-gray-800 font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart size={18} className="text-emerald-500 fill-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">পছন্দের তালিকা</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {wishlistCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            )}

            {/* 6. পণ্য তুলনা */}
            {menu.menuCompareEnabled !== false && onOpenCompare && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCompare();
                }}
                className="w-full hover:bg-gray-50 rounded-xl px-3 py-2.5 text-gray-800 font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Scale size={18} className="text-amber-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">পণ্য তুলনা (Compare)</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {compareCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1.5" />

            {/* 7. আমাদের সম্পর্কে */}
            {menu.menuAboutEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact('about');
                }}
                className="w-full hover:bg-[#f0f5ee] rounded-xl px-3 py-2.5 text-[#1c3822] font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <User size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">আমাদের সম্পর্কে</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            )}

            {/* 8. যোগাযোগ */}
            {menu.menuContactEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact('contact');
                }}
                className="w-full hover:bg-[#f0f5ee] rounded-xl px-3 py-2.5 text-[#1c3822] font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">যোগাযোগ ও সাপোর্ট</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            )}

            {/* 9. পলিসি ও শর্তাবলী */}
            {menu.menuPolicyEnabled !== false && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenPolicy) onOpenPolicy('privacy');
                }}
                className="w-full hover:bg-[#f0f5ee] rounded-xl px-3 py-2.5 text-[#1c3822] font-semibold flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={18} className="text-[#1c3822] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1c3822] truncate">পলিসি ও শর্তাবলী</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Helpline & Guarantees */}
        {menu.menuHelplineEnabled !== false && (
          <div className="p-3 bg-gray-50 border-t border-gray-200/80 space-y-2">
            {/* Quick Helpline Box */}
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold">২৪/৭ কাস্টমার হেল্পলাইন</p>
                  <a href="tel:01410136900" className="text-xs font-black text-slate-900 hover:text-emerald-700">
                    01410136900
                  </a>
                </div>
              </div>
              {whatsappEnabled !== false && (
                <a
                  href="https://wa.me/8801410136900"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  title="WhatsApp এ চ্যাট করুন"
                >
                  <MessageCircle size={18} />
                </a>
              )}
            </div>

            {/* Guarantee Badges */}
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 px-1 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>১০০% খাঁটি বীজ</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-emerald-600" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Charge Modal */}
      <DeliveryChargeModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />

      {/* Order Rules Modal */}
      <OrderRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};
