import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Check,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Printer,
  Sparkles,
  Leaf
} from 'lucide-react';
import { CartItem, OrderDetails, Coupon } from '../types';
import {
  subscribeToDeliverySettings,
  subscribeToShippingZones,
  subscribeToPaymentSettings,
  subscribeToCoupons,
  DeliverySettings,
  ShippingZone,
  PaymentSettings,
} from '../lib/firestoreProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (orderDetails: OrderDetails) => void;
  currentUser?: { name: string; phone: string } | null;
  onOpenAuth: () => void;
  loginEnabled?: boolean;
  onOpenMemo?: (order: OrderDetails) => void;
  onSelectCategory?: (catId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  currentUser,
  onOpenAuth,
  loginEnabled = true,
  onOpenMemo,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [appliedDiscountObj, setAppliedDiscountObj] = useState<{ amount: number; isPercent: boolean; code: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Success Order State
  const [successOrder, setSuccessOrder] = useState<OrderDetails | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Delivery Settings & Zones from Firestore
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    insideCharge: 60,
    outsideCharge: 100,
    freeMinimum: 1000,
    deliveryChargeEnabled: true,
  });
  const [, setShippingZones] = useState<ShippingZone[]>([]);

  // Payment Settings from Firestore
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    codEnabled: true,
    bkashEnabled: true,
    bkashNumber: '01410136900',
    bkashType: 'Personal',
    nagadEnabled: true,
    nagadNumber: '01410136900',
    nagadType: 'Personal',
    rocketEnabled: true,
    rocketNumber: '01410136900',
    rocketType: 'Personal',
    instruction: 'মোবাইল ব্যাংকিং (বিকাশ/নগদ/রকেট) বা ক্যাশ অন ডেলিভারি (COD) নির্বাচন করুন।',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Delivery Location Choice
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>('dhaka');

  // Order Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [thana, setThana] = useState('');
  const [union, setUnion] = useState('');
  const [village, setVillage] = useState('');
  const [landmark, setLandmark] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsubDelivery = subscribeToDeliverySettings((settings) => {
      if (settings) setDeliverySettings(settings);
    });
    const unsubZones = subscribeToShippingZones((zones) => {
      if (zones) setShippingZones(zones);
    });
    const unsubPayment = subscribeToPaymentSettings((settings) => {
      if (settings) setPaymentSettings(settings);
    });
    const unsubCoupons = subscribeToCoupons((coupons) => {
      setCouponsList(coupons || []);
    });
    return () => {
      unsubDelivery();
      unsubZones();
      unsubPayment();
      unsubCoupons();
    };
  }, []);

  // Ensure active payment method
  useEffect(() => {
    if (selectedPaymentMethod === 'cod' && !paymentSettings.codEnabled) {
      if (paymentSettings.bkashEnabled) setSelectedPaymentMethod('bkash');
      else if (paymentSettings.nagadEnabled) setSelectedPaymentMethod('nagad');
      else if (paymentSettings.rocketEnabled) setSelectedPaymentMethod('rocket');
    }
  }, [paymentSettings, selectedPaymentMethod]);

  // Sync district with delivery location
  const handleDeliveryLocationChange = (location: 'dhaka' | 'outside') => {
    setDeliveryLocation(location);
    if (location === 'dhaka') {
      setDistrict('ঢাকা');
    } else if (district === 'ঢাকা') {
      setDistrict('চট্টগ্রাম');
    }
  };

  // Reset checkout form and successOrder when closed
  useEffect(() => {
    if (!isOpen) {
      setFormError('');
      const timer = setTimeout(() => {
        setSuccessOrder(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-fill customerName and phone from currentUser if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) {
        setCustomerName(currentUser.name);
      }
      if (currentUser.phone && !phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isDeliveryFeeActive = deliverySettings.deliveryChargeEnabled === true;
  const baseDeliveryCharge = deliveryLocation === 'dhaka' ? deliverySettings.insideCharge : deliverySettings.outsideCharge;

  // Check if any product in the cart has custom delivery charge or free delivery set
  let customDeliveryCharge: number | null = null;
  let hasFreeDeliveryProduct = false;

  for (const item of cartItems) {
    if (item.product.isFreeDelivery) {
      hasFreeDeliveryProduct = true;
    }
    const productCharge = deliveryLocation === 'dhaka' ? item.product.insideDeliveryCharge : item.product.outsideDeliveryCharge;
    if (typeof productCharge === 'number' && !isNaN(productCharge)) {
      if (customDeliveryCharge === null || productCharge > customDeliveryCharge) {
        customDeliveryCharge = productCharge;
      }
    }
  }

  const activeDeliveryFee = customDeliveryCharge !== null ? customDeliveryCharge : baseDeliveryCharge;
  const isFreeDelivery = !isDeliveryFeeActive || hasFreeDeliveryProduct || (deliverySettings.freeMinimum > 0 && subtotal >= deliverySettings.freeMinimum);
  const deliveryFee = isFreeDelivery ? 0 : activeDeliveryFee;

  let discountAmount = 0;
  if (appliedDiscountObj) {
    if (appliedDiscountObj.isPercent) {
      discountAmount = Math.round((subtotal * appliedDiscountObj.amount) / 100);
    } else {
      discountAmount = appliedDiscountObj.amount;
    }
  }
  const total = Math.max(0, subtotal - discountAmount + (cartItems.length > 0 ? deliveryFee : 0));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = couponCode.trim().toUpperCase();
    if (!enteredCode) return;

    const foundCoupon = couponsList.find((c) => c.code === enteredCode);

    if (foundCoupon) {
      if (foundCoupon.active === false) {
        setCouponMsg({ text: 'এই কুপনটির মেয়াদ শেষ হয়ে গেছে।', isError: true });
        return;
      }
      if (foundCoupon.minimum && subtotal < foundCoupon.minimum) {
        setCouponMsg({ text: `সর্বনিম্ন ৳${foundCoupon.minimum} টাকার অর্ডার করতে হবে।`, isError: true });
        return;
      }
      if (foundCoupon.type === 'fixed') {
        setAppliedDiscountObj({ amount: foundCoupon.value, isPercent: false, code: foundCoupon.code });
        setCouponMsg({ text: `৳${foundCoupon.value} ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে! 🎉`, isError: false });
      } else {
        setAppliedDiscountObj({ amount: foundCoupon.value, isPercent: true, code: foundCoupon.code });
        setCouponMsg({ text: `${foundCoupon.value}% ছাড় সফলভাবে যুক্ত হয়েছে! 🎉`, isError: false });
      }
    } else if (enteredCode === 'SEED10') {
      setAppliedDiscountObj({ amount: 10, isPercent: true, code: 'SEED10' });
      setCouponMsg({ text: '১০% ছাড় কুপন (SEED10) সফলভাবে যুক্ত হয়েছে! 🎉', isError: false });
    } else {
      setCouponMsg({ text: 'কুপন কোডটি সঠিক নয়।', isError: true });
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !district.trim() || !thana.trim() || !village.trim()) {
      setFormError('অনুগ্রহ করে নাম, মোবাইল নম্বর, জেলা, থানা এবং গ্রাম পূরণ করুন।');
      return;
    }

    if (phone.length < 11) {
      setFormError('সঠিক ১১ ডিজিটের প্রধান মোবাইল নম্বর দিন।');
      return;
    }

    if (selectedPaymentMethod !== 'cod') {
      if (!senderNumber.trim() || !transactionId.trim()) {
        const methodLabel = selectedPaymentMethod === 'bkash' ? 'বিকাশ' : selectedPaymentMethod === 'nagad' ? 'নগদ' : 'রকেট';
        setFormError(`আপনার ${methodLabel} নম্বর এবং Transaction ID প্রদান করুন।`);
        return;
      }
    }

    setFormError('');

    const combinedAddress = `গ্রাম: ${village}${union ? `, ইউনিয়ন: ${union}` : ''}, থানা: ${thana}, জেলা: ${district}${landmark ? `. ল্যান্ডমার্ক: ${landmark}` : ''}`;

    const newOrder: OrderDetails = {
      orderId: 'SHB-' + Math.floor(100000 + Math.random() * 900000),
      customerName,
      phone,
      phone2: phone2.trim() ? phone2 : undefined,
      address: combinedAddress,
      district,
      thana,
      union,
      village,
      landmark,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total,
      paymentMethod: selectedPaymentMethod,
      senderNumber: selectedPaymentMethod !== 'cod' ? senderNumber : undefined,
      transactionId: selectedPaymentMethod !== 'cod' ? transactionId : undefined,
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    onPlaceOrder(newOrder);
    setSuccessOrder(newOrder);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 35 }).map((_, i) => {
            const randomLeft = Math.floor(Math.random() * 100);
            const randomDelay = (Math.random() * 1.5).toFixed(2);
            const randomDuration = (2 + Math.random() * 2).toFixed(2);
            const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-green-500', 'bg-lime-400', 'bg-teal-400'];
            const randomColor = colors[i % colors.length];
            return (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${randomColor} animate-confetti-fall`}
                style={{
                  left: `${randomLeft}%`,
                  top: '-20px',
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                }}
              />
            );
          })}
        </div>
      )}

      <div
        style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" }}
        className="w-full max-w-md sm:max-w-md bg-[#f8faf9] h-full shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-emerald-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="px-3.5 py-3 bg-gradient-to-r from-[#087d43] to-[#06502c] text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              {successOrder ? <Sparkles size={17} className="text-emerald-200 animate-pulse" /> : <ShoppingCart size={17} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                  {successOrder ? 'অর্ডার সম্পন্ন হয়েছে' : 'শপিং কার্ট ও চেকআউট'}
                </h2>
                {successOrder && (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/30 border border-emerald-400/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold text-emerald-200">
                    <Leaf size={9} /> Confirmed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-100/90 font-medium">
                {successOrder ? `আইডি: ${successOrder.orderId}` : 'ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            title="বন্ধ করুন"
          >
            <X size={16} />
          </button>
        </div>

        {/* Compact Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 scrollbar-thin">
          {successOrder ? (
            /* Inline Order Success Receipt */
            <div className="flex flex-col items-center text-center py-2 space-y-3 animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 text-[#078348] rounded-full flex items-center justify-center border border-emerald-300">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#075c38]">আপনার অর্ডারটি সফল হয়েছে! 🎉</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                  Ss Seed Shop-এ অর্ডার করার জন্য আপনাকে ধন্যবাদ।
                </p>
              </div>

              {/* Invoice Summary Box */}
              <div className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-800">
                  <span>অর্ডার আইডি:</span>
                  <span className="text-emerald-700 font-bold">{successOrder.orderId}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>নাম:</span>
                  <strong className="text-slate-800">{successOrder.customerName}</strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>মোবাইল:</span>
                  <strong className="text-slate-800">{successOrder.phone}</strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ঠিকানা:</span>
                  <span className="text-slate-800 text-right font-medium">{successOrder.address}, {successOrder.district}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>পেমেন্ট:</span>
                  <strong className="text-slate-800">
                    {successOrder.paymentMethod === 'bkash' ? 'বিকাশ' : successOrder.paymentMethod === 'nagad' ? 'নগদ' : successOrder.paymentMethod === 'rocket' ? 'রকেট' : 'ক্যাশ অন ডেলিভারি (COD)'}
                  </strong>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold text-xs text-slate-800">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-emerald-700">৳{successOrder.total}</span>
                </div>
              </div>

              <div className="w-full bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <PackageCheck size={16} className="text-emerald-700 shrink-0" />
                <span className="text-left font-medium text-[11px]">
                  কুরিয়ার থেকে ডেলিভারি বয় কল করার পর পণ্য দেখে টাকা পরিশোধ করবেন।
                </span>
              </div>

              <div className="w-full flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMemo && successOrder) {
                      onOpenMemo(successOrder);
                    } else {
                      window.print();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>মেমো প্রিন্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessOrder(null);
                    onClose();
                  }}
                  className="flex-1 bg-[#087d43] text-white hover:bg-[#06502c] py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  আরও কেনাকাটা
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Simple Clean Empty Cart State */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-3 select-none">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={32} className="stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                আপনার কার্ট বর্তমানে খালি
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-medium">
                আমাদের মানসম্মত বীজ ও কৃষিপণ্যের সংগ্রহ থেকে আপনার পছন্দের পণ্য নির্বাচন করুন।
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 bg-[#087d43] hover:bg-[#06502c] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>পণ্য দেখুন</span>
              </button>
            </div>
          ) : (
            <form id="orderForm" onSubmit={handleSubmitOrder} className="space-y-2.5">
              {formError && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Free Delivery Bar */}
              {deliverySettings.deliveryChargeEnabled && deliverySettings.freeMinimum > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-white p-1.5 text-emerald-700 shrink-0"><PackageCheck size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-900 truncate">
                        {isFreeDelivery ? 'আপনি ফ্রি ডেলিভারি পেয়েছেন!' : `আর ৳${Math.max(0, deliverySettings.freeMinimum - subtotal)} অর্ডার করলেই ফ্রি ডেলিভারি!`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-emerald-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${Math.min(100, (subtotal / deliverySettings.freeMinimum) * 100)}%` }} />
                  </div>
                </div>
              )}

              {/* 1. Selected Cart Items */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1">
                    <span>🛒</span>
                    <span>নির্বাচিত পণ্য ({cartItems.length}টি)</span>
                  </h3>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-2.5 p-2 bg-slate-50/80 border border-slate-200/60 rounded-lg"
                    >
                      <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          item.product.imageEmoji
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                          <span>৳{item.product.price} × {item.quantity}</span>
                          <span>=</span>
                          <strong className="text-emerald-700 font-bold">
                            ৳{item.product.price * item.quantity}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-emerald-600 hover:text-emerald-700 p-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Coupon Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag size={14} className="text-emerald-700" />
                  <span>কুপন ডিসকাউন্ট</span>
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="কুপন কোড (যেমন: SEED10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-600 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#087d43] hover:bg-[#06502c] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    প্রয়োগ
                  </button>
                </div>
                {couponMsg && (
                  <div
                    className={`text-xs font-bold p-2 rounded-lg border ${
                      couponMsg.isError ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* 3. Payment Method Selector */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>পেমেন্ট পদ্ধতি নির্বাচন করুন *</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {paymentSettings.codEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('cod')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                        selectedPaymentMethod === 'cod'
                          ? 'bg-[#087d43] text-white border-[#087d43] shadow-xs'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-sm">💵</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">ক্যাশ অন ডেলিভারি</div>
                        <div className="text-[10px] opacity-80 font-normal">পণ্য পেয়ে টাকা</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.bkashEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('bkash')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                        selectedPaymentMethod === 'bkash'
                          ? 'bg-[#e2136e] text-white border-[#e2136e] shadow-xs'
                          : 'bg-emerald-50/50 text-slate-800 border-emerald-200 hover:bg-emerald-100/50'
                      }`}
                    >
                      <span className="bg-[#e2136e] text-white text-[10px] font-bold px-1 py-0.5 rounded">bKash</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">বিকাশ পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.bkashType || 'Personal'}</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.nagadEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('nagad')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                        selectedPaymentMethod === 'nagad'
                          ? 'bg-[#f7921e] text-white border-[#f7921e] shadow-xs'
                          : 'bg-orange-50/50 text-slate-800 border-orange-200 hover:bg-orange-100/50'
                      }`}
                    >
                      <span className="bg-[#f7921e] text-white text-[10px] font-bold px-1 py-0.5 rounded">নগদ</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">নগদ পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.nagadType || 'Personal'}</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.rocketEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('rocket')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                        selectedPaymentMethod === 'rocket'
                          ? 'bg-[#8c3494] text-white border-[#8c3494] shadow-xs'
                          : 'bg-purple-50/50 text-slate-800 border-purple-200 hover:bg-purple-100/50'
                      }`}
                    >
                      <span className="bg-[#8c3494] text-white text-[10px] font-bold px-1 py-0.5 rounded">রকেট</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">রকেট পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.rocketType || 'Personal'}</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Mobile Banking Details Input Form */}
                {selectedPaymentMethod !== 'cod' && (
                  <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 space-y-2 mt-2">
                    <div className="text-xs text-slate-800 font-bold bg-white p-2 rounded-md border border-slate-200 flex items-center justify-between">
                      <span>{selectedPaymentMethod.toUpperCase()} নম্বর:</span>
                      <strong className="text-emerald-700 font-bold">
                        {selectedPaymentMethod === 'bkash' ? paymentSettings.bkashNumber : selectedPaymentMethod === 'nagad' ? paymentSettings.nagadNumber : paymentSettings.rocketNumber}
                      </strong>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">আপনার প্রেরক (Sender) নম্বর *</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-md font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ট্রানজেকশন আইডি (TrxID) *</label>
                      <input
                        type="text"
                        placeholder="যেমন: 8N7A6D..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-md font-mono font-bold uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Customer Details Form */}
              {!currentUser && loginEnabled !== false && (
                <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs">👤</span>
                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      পূর্বে অ্যাকাউন্ট থাকলে <span className="text-emerald-700 font-bold">লগইন করুন</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#087d43] hover:bg-[#06502c] text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                  >
                    লগইন
                  </button>
                </div>
              )}

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1 border-b border-slate-100 pb-1.5">
                  <span>📋</span>
                  <span>গ্রাহক ও ডেলিভারি ঠিকানা</span>
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">আপনার সম্পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">১ম মোবাইল (প্রধান) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 01700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">২য় মোবাইল (বিকল্প)</label>
                    <input
                      type="tel"
                      placeholder="যেমন: 01800000000"
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {isDeliveryFeeActive && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>শিপিং জোন / ডেলিভারি চার্জ *</span>
                      {isFreeDelivery && <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full font-bold">ফ্রি</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleDeliveryLocationChange('dhaka')}
                        className={`p-2 rounded-lg border text-left font-bold cursor-pointer ${
                          deliveryLocation === 'dhaka' ? 'bg-[#087d43] text-white border-[#087d43]' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs">ঢাকা শহর</div>
                        <div className="text-[11px] font-bold">
                          {isFreeDelivery
                            ? '৳০ (ফ্রি)'
                            : `৳${cartItems.reduce((max, item) => {
                                const c = item.product.insideDeliveryCharge;
                                return typeof c === 'number' && !isNaN(c) ? Math.max(max, c) : max;
                              }, deliverySettings.insideCharge)}`}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeliveryLocationChange('outside')}
                        className={`p-2 rounded-lg border text-left font-bold cursor-pointer ${
                          deliveryLocation === 'outside' ? 'bg-[#087d43] text-white border-[#087d43]' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs">ঢাকার বাইরে</div>
                        <div className="text-[11px] font-bold">
                          {isFreeDelivery
                            ? '৳০ (ফ্রি)'
                            : `৳${cartItems.reduce((max, item) => {
                                const c = item.product.outsideDeliveryCharge;
                                return typeof c === 'number' && !isNaN(c) ? Math.max(max, c) : max;
                              }, deliverySettings.outsideCharge)}`}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">জেলা *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: ঢাকা / চট্টগ্রাম"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">থানা / উপজেলা *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: সাভার / মিরপুর"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ইউনিয়ন (যদি থাকে)</label>
                    <input
                      type="text"
                      placeholder="যেমন: ভাকুর্তা"
                      value={union}
                      onChange={(e) => setUnion(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">গ্রাম / পাড়া / মহল্লা *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: পশ্চিমপাড়া"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ল্যান্ডমার্ক / পরিচিত স্থান</label>
                  <input
                    type="text"
                    placeholder="যেমন: জামে মসজিদের পাশে"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 font-medium text-slate-800"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Summary & Action Button */}
        {!successOrder && cartItems.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-white space-y-2 shrink-0 shadow-lg">
            <div className="space-y-1 text-xs text-slate-600 font-medium bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
              <div className="flex justify-between">
                <span>পণ্যের দাম:</span>
                <strong className="text-slate-800 font-bold">৳{subtotal}</strong>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>ডিসকাউন্ট ({appliedDiscountObj?.code}):</span>
                  <span>- ৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <strong className="text-slate-800 font-bold">
                  {!isDeliveryFeeActive || deliveryFee === 0 ? '৳০ (ফ্রি)' : `৳${deliveryFee}`}
                </strong>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-800 pt-1 border-t border-emerald-200/60">
                <span>সর্বমোট:</span>
                <span className="text-emerald-700 font-extrabold text-sm">৳{total}</span>
              </div>
            </div>

            <button
              type="submit"
              form="orderForm"
              className="w-full bg-[#087d43] hover:bg-[#06502c] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>অর্ডার নিশ্চিত করুন (৳{total})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
