import React, { useState, useEffect } from 'react';
import { Search, X, Package, Clock, Phone, MapPin, CheckCircle2, Truck, ShieldCheck, AlertCircle, ChevronLeft } from 'lucide-react';
import { OrderDetails } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OrderTrackerPageProps {
  onBack: () => void;
  ordersList: OrderDetails[];
  onOpenCart?: () => void;
  cartCount?: number;
  isLoading?: boolean;
  onOpenMemo?: (order: OrderDetails) => void;
}

export const OrderTrackerPage: React.FC<OrderTrackerPageProps> = ({
  onBack,
  ordersList = [],
  onOpenCart,
  cartCount = 0,
  isLoading = false,
  onOpenMemo,
}) => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<OrderDetails[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = (searchVal: string, list: OrderDetails[] = ordersList) => {
    const q = searchVal.trim().toLowerCase();
    if (!q) {
      setSearchResult([]);
      setHasSearched(false);
      return;
    }

    // Require at least 3 characters for search to prevent accidental bulk matching
    if (q.length < 3) {
      setSearchResult([]);
      setHasSearched(true);
      return;
    }

    const matched = list.filter((ord) => {
      const matchId = ord.orderId && ord.orderId.toLowerCase().includes(q);
      const cleanOrdPhone = ord.phone ? ord.phone.replace(/[\s\-\+]/g, '') : '';
      const cleanQueryPhone = q.replace(/[\s\-\+]/g, '');
      const matchPhone = cleanOrdPhone && cleanQueryPhone && (cleanOrdPhone === cleanQueryPhone || cleanOrdPhone.endsWith(cleanQueryPhone) || cleanQueryPhone.endsWith(cleanOrdPhone));
      return matchId || matchPhone;
    });

    setSearchResult(matched);
    setHasSearched(true);
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="bg-[#f8faf6] min-h-screen flex flex-col items-center pb-20 animate-fadeIn px-2 sm:px-4">
      <div className="w-full max-w-4xl mx-auto bg-white min-h-screen sm:min-h-0 sm:my-6 shadow-xl relative flex flex-col justify-between border border-gray-200/80 sm:rounded-3xl overflow-hidden">
        
        <div className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-2xs">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1c3822] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ChevronLeft size={16} />
              <span>ফিরে যান</span>
            </button>
            <h1 className="text-sm font-black text-[#1c3822] tracking-wide">লাইভ অর্ডার ট্র্যাকার</h1>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
                aria-label="Cart"
              >
                <Package size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </header>

          {/* Banner */}
          <div className="bg-gradient-to-br from-[#122417] via-[#1c3822] to-[#264b2d] text-white p-5 relative overflow-hidden shadow-md m-4 rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-wide">আপনার অর্ডার স্ট্যাটাস চেক করুন</h2>
                <p className="text-[11px] text-emerald-200/90 font-medium mt-0.5">অর্ডার আইডি বা আপনার মোবাইল নম্বর দিয়ে সার্চ করুন</p>
              </div>
            </div>

            {/* Search Input Form */}
            <form onSubmit={onSubmitSearch} className="mt-4 relative z-10">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="অর্ডার আইডি (যেমন: SHB-xxxxxx) বা মোবাইল নম্বর..."
                  className="w-full pl-10 pr-20 py-3 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 bg-[#1c3822] hover:bg-[#264b2d] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>খুঁজুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Container */}
          <div className="p-4 space-y-3.5">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-1.5">
                        <div className="w-28 h-3 bg-gray-200 rounded"></div>
                        <div className="w-20 h-2.5 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-1.5">
                        <div className="w-28 h-3 bg-gray-200 rounded"></div>
                        <div className="w-20 h-2.5 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
              </div>
            ) : !hasSearched ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-xs space-y-3 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs border border-emerald-100">
                  <Package size={26} />
                </div>
                <div>
                  <p className="font-black text-[#1c3822] text-sm">অর্ডার ট্র্যাক করতে সার্চ করুন</p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    আপনার মোবাইল নম্বর বা অর্ডার আইডি দিয়ে ওপরের বক্সে খুঁজুন।
                  </p>
                </div>
              </div>
            ) : searchResult && searchResult.length === 0 ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-700 text-xs space-y-3 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-2xs">
                  <AlertCircle size={26} />
                </div>
                <div>
                  <p className="font-black text-sm">কোনো অর্ডার পাওয়া যায়নি!</p>
                  <p className="text-[11px] opacity-80 max-w-xs mx-auto mt-1 leading-relaxed">
                    সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিয়ে আবার চেষ্টা করুন।
                  </p>
                </div>
              </div>
            ) : (
              searchResult && searchResult.map((ord, idx) => {
                let statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
                let statusText = ord.status || 'প্রক্রিয়াধীন';
                let statusDesc = 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে এবং প্যাকিং চলছে।';

                if (statusText === 'কনফার্মড' || statusText === 'confirmed') {
                  statusBg = 'bg-blue-50 text-blue-800 border-blue-200';
                  statusDesc = 'অর্ডারটি কনফার্ম করা হয়েছে এবং ডেলিভারির প্রস্তুতি চলছে।';
                } else if (statusText === 'ডেলিভার্ড' || statusText === 'delivered') {
                  statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  statusDesc = 'আপনার ঠিকানায় পণ্য সফলভাবে ডেলিভারি সম্পন্ন হয়েছে।';
                } else if (statusText === 'বাতিল' || statusText === 'cancelled') {
                  statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                  statusDesc = 'এই অর্ডারটি বাতিল করা হয়েছে।';
                }

                return (
                  <div key={ord.orderId || idx} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#1c3822] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-black text-[#1c3822] block text-xs">ID: {ord.orderId}</span>
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-emerald-600" /> {ord.createdAt || 'সম্প্রতি'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusBg} shadow-2xs`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Status Banner */}
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-900 font-semibold flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>{statusDesc}</span>
                    </div>

                    {/* Visual Delivery Progress Timeline Chart */}
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Truck size={13} className="text-[#118137]" />
                          ডেলিভারি প্রোগ্রেস টাইমলাইন
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {statusText}
                        </span>
                      </div>
                      <div className="w-full h-24 pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              { step: 'অর্ডার', progress: 100, desc: 'গ্রহণ করা হয়েছে' },
                              { step: 'প্যাকিং', progress: statusText === 'প্রক্রিয়াধীন' ? 50 : 100, desc: 'প্যাকিং ও যাচাই' },
                              { step: 'শিপমেন্ট', progress: (statusText === 'কনফার্মড' || statusText === 'confirmed') ? 60 : (statusText === 'ডেলিভার্ড' || statusText === 'delivered') ? 100 : 20, desc: 'কুরিয়ারে হস্তান্তর' },
                              { step: 'ডেলিভারি', progress: (statusText === 'ডেলিভার্ড' || statusText === 'delivered') ? 100 : 0, desc: 'সফল ডেলিভারি' },
                            ]}
                            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                          >
                            <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 700 }} />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                              formatter={(value: any) => [`${value}% সম্পন্ন`, 'প্রোগ্রেস']}
                              contentStyle={{ backgroundColor: '#1c3822', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="progress"
                              stroke="#118137"
                              strokeWidth={2.5}
                              dot={{ fill: '#118137', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, fill: '#16a34a' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">গ্রাহকের নাম:</span>
                        <span className="font-bold text-gray-900">{ord.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">মোবাইল নম্বর:</span>
                        <span className="font-bold text-gray-900">{ord.phone}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-500 font-medium shrink-0">ডেলিভারি ঠিকানা:</span>
                        <span className="font-bold text-gray-900 text-right truncate max-w-[200px]">{ord.address}, {ord.district}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-gray-600 font-medium">
                        পণ্য সংখ্যা: <span className="text-emerald-700 font-black">{ord.items?.length || 0} টি</span>
                      </div>
                      <div className="text-sm font-black text-[#1c3822]">
                        মোট বিল: <span className="text-emerald-700">৳{ord.total}</span>
                      </div>
                    </div>

                    {onOpenMemo && (
                      <button
                        type="button"
                        onClick={() => onOpenMemo(ord)}
                        className="w-full mt-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#118137] border border-emerald-200/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <Truck size={14} className="hidden sm:inline" />
                        <span>📄 ক্যাশ মেমো দেখুন ও ডাউনলোড করুন</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-gray-100 text-[11px] text-gray-400 font-medium bg-white">
          Ss Seed Shop - Live Order Tracker
        </div>

      </div>
    </div>
  );
};
