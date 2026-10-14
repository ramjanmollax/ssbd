import React from 'react';
import { X, Printer, Building2, MapPin, FileText } from 'lucide-react';
import { OrderDetails } from '../types';
import { ContactSettings, StoreSettings, FooterSettings } from '../lib/firestoreProducts';

interface OrderMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  storeSettings?: StoreSettings;
  contactSettings?: ContactSettings;
  footerSettings?: FooterSettings;
}

export const OrderMemoModal: React.FC<OrderMemoModalProps> = ({
  isOpen,
  onClose,
  order,
  storeSettings,
  contactSettings,
  footerSettings,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Synchronized store branding and address details
  const storeName = storeSettings?.name?.trim() || footerSettings?.brandName?.trim() || 'Ss Seed Shop';
  const storeLogo = storeSettings?.logo?.trim() || footerSettings?.footerLogoUrl?.trim() || '';

  // Store address resolution (Store settings -> Contact settings -> Footer settings)
  const storeAddress =
    (storeSettings?.address && storeSettings.address.trim()) ||
    (contactSettings?.address && contactSettings.address.trim()) ||
    (footerSettings?.address && footerSettings.address.trim()) ||
    'ঢাকা, বাংলাদেশ';

  const storePhone =
    (storeSettings?.hotline && storeSettings.hotline.trim()) ||
    (storeSettings?.phone && storeSettings.phone.trim()) ||
    (contactSettings?.hotline && contactSettings.hotline.trim()) ||
    (contactSettings?.phone && contactSettings.phone.trim()) ||
    (footerSettings?.hotline && footerSettings.hotline.trim()) ||
    (footerSettings?.phone && footerSettings.phone.trim()) ||
    '01915957187';

  const storeEmail =
    (storeSettings?.email && storeSettings.email.trim()) ||
    (contactSettings?.email && contactSettings.email.trim()) ||
    (footerSettings?.email && footerSettings.email.trim()) ||
    '';

  const invoiceSubtitle =
    (storeSettings?.invoiceSubtitle && storeSettings.invoiceSubtitle.trim()) ||
    (storeSettings?.tagline && storeSettings.tagline.trim()) ||
    (footerSettings?.tagline && footerSettings.tagline.trim()) ||
    'প্রিমিয়াম বীজ ও কৃষি উপকরণ সমাহার';

  const invoiceNote =
    (storeSettings?.invoiceNote && storeSettings.invoiceNote.trim()) ||
    '• বীজ রোপণের পূর্বে প্যাকেটের গায়ে দেওয়া নির্দেশিকা ভালোভাবে অনুসরণ করুন।';

  const invoiceFooterMsg =
    ((storeSettings as any)?.invoiceFooterMsg && (storeSettings as any).invoiceFooterMsg.trim()) ||
    `${storeName} বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ!`;

  // Customer order and delivery details
  const orderIdDisplay = order.orderId || ('#' + (order.id ? order.id.slice(0, 8) : ''));
  const customerName = order.customerName || 'গ্রাহক';
  const customerPhone = order.phone || '-';
  const customerPhone2 = order.phone2 ? ` | বিকল্প: ${order.phone2}` : '';
  const customerDistrict = order.district || '-';

  let customerAddress = order.address?.trim() || '';
  const extraParts = [order.village, order.union, order.thana].filter(Boolean).map(s => String(s).trim()).filter(Boolean);
  if (extraParts.length > 0 && !extraParts.some(p => customerAddress.includes(p))) {
    customerAddress = extraParts.join(', ') + (customerAddress ? ', ' + customerAddress : '');
  }
  if (!customerAddress) {
    customerAddress = order.district || '-';
  }

  const customerLandmark = order.landmark ? ` (ল্যান্ডমার্ক: ${order.landmark})` : '';
  const customerNote = (order as any).note || (order as any).customerNote || '';

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || order.total || 0);
  const delivery = Number(order.deliveryFee || order.shippingFee || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = Number(order.total || order.totalAmount || (subtotal + delivery - discount));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
      {/* CSS to ensure clean A4 PDF printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printableInvoiceMemo, #printableInvoiceMemo * {
            visibility: visible !important;
          }
          #printableInvoiceMemo {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Top Header Actions Bar (No-Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">অর্ডার ক্যাশ মেমো / ইনভয়েস</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Printer size={15} />
              <span>প্রিন্ট / মেমো ডাউনলোড করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Memo Printable Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white" id="printableInvoiceMemo">
          {/* Memo Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-5 mb-5">
            <div className="flex items-start gap-3.5">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="h-12 w-auto object-contain max-w-[120px] rounded-lg" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-xl shrink-0">
                  🌱
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-900 leading-tight">{storeName}</h1>
                <p className="text-xs font-semibold text-emerald-800/80">{invoiceSubtitle}</p>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>📍 {storeAddress}</span>
                  <span>| 📞 হটলাইন: {storePhone}</span>
                  {storeEmail && <span>| ✉️ {storeEmail}</span>}
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 shrink-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white mb-1">
                ক্যাশ মেমো / ইনভয়েস
              </span>
              <p className="text-sm font-black text-emerald-950">অর্ডার আইডি: {orderIdDisplay}</p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                তারিখ: {order.createdAt ? (typeof order.createdAt === 'string' ? order.createdAt : new Date((order.createdAt as any)?.seconds ? (order.createdAt as any).seconds * 1000 : order.createdAt).toLocaleDateString('bn-BD')) : new Date().toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 mb-6 text-xs text-slate-800">
            <div>
              <p className="font-extrabold text-emerald-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 size={14} />
                গ্রাহকের তথ্য
              </p>
              <p className="py-0.5"><strong className="text-slate-900">নাম:</strong> {customerName}</p>
              <p className="py-0.5"><strong className="text-slate-900">মোবাইল:</strong> {customerPhone}{customerPhone2}</p>
              <p className="py-0.5"><strong className="text-slate-900">জেলা/অঞ্চল:</strong> {customerDistrict}</p>
              {customerNote && (
                <p className="py-0.5 text-slate-600"><strong className="text-slate-900">কাস্টমার নোট:</strong> {customerNote}</p>
              )}
            </div>
            <div>
              <p className="font-extrabold text-emerald-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={14} />
                ডেলিভারি ঠিকানা
              </p>
              <p className="py-0.5"><strong className="text-slate-900">ঠিকানা:</strong> {customerAddress}{customerLandmark}</p>
              <p className="py-0.5"><strong className="text-slate-900">পেমেন্ট মেথড:</strong> <span className="uppercase font-bold text-emerald-800">{order.paymentMethod === 'bkash' ? 'বিকাশ' : order.paymentMethod === 'nagad' ? 'নগদ' : order.paymentMethod === 'rocket' ? 'রকেট' : 'ক্যাশ অন ডেলিভারি (COD)'}</span></p>
              <p className="py-0.5"><strong className="text-slate-900">অর্ডার স্ট্যাটাস:</strong> <span className="font-bold text-emerald-700">{order.status || 'প্রক্রিয়াধীন'}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6 border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-bold text-xs">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">প্রোডাক্ট বিবরণ</th>
                  <th className="p-3 text-center">একক মূল্য</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const name = item.product?.name || item.name || 'বীজ পণ্য';
                    const unit = item.product?.packSize || item.product?.unit || '';
                    const price = Number(item.product?.price || item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineSub = price * qty;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{name}</span>
                          {unit && <span className="text-[10px] text-slate-500">{unit}</span>}
                        </td>
                        <td className="p-3 text-center">৳{price}</td>
                        <td className="p-3 text-center font-bold">{qty}</td>
                        <td className="p-3 text-right font-bold text-emerald-900">৳{lineSub}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">কোনো আইটেম ডাটা পাওয়া যায়নি</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary & Notes */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
            <div className="text-xs text-slate-600 max-w-sm space-y-1">
              <p className="font-bold text-emerald-900">বিশেষ দ্রষ্টব্য:</p>
              <p>{invoiceNote}</p>
              <p>• যেকোনো পরামর্শ বা সহায়তার জন্য আমাদের হটলাইনে যোগাযোগ করুন: <strong>{storePhone}</strong></p>
              <p className="font-semibold text-emerald-700 pt-1">{invoiceFooterMsg}</p>
            </div>

            <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>সাব-টোটাল:</span>
                <span className="font-bold">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold">৳{delivery}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>ডিসকাউন্ট:</span>
                  <span className="font-bold">-৳{discount}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-emerald-800 text-sm font-black text-emerald-900">
                <span>সর্বমোট:</span>
                <span>৳{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 flex justify-between items-center text-xs text-slate-600 border-t border-dashed border-slate-300">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 pt-1 font-bold text-slate-800">
                গ্রাহকের স্বাক্ষর
              </div>
            </div>
            <div className="text-center">
              <div className="w-44 border-t border-slate-400 pt-1 font-bold text-emerald-900">
                স্টোর কর্তৃপক্ষ / ম্যানেজার
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar (No-Print) */}
        <div className="no-print p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-[#118137] hover:bg-[#0d682b] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>প্রিন্ট / মেমো ডাউনলোড</span>
          </button>
        </div>

      </div>
    </div>
  );
};
