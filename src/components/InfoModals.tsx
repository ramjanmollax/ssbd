import React from 'react';
import { X, Package, PlayCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryChargeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-5 relative shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3 text-[#1c3822]">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">ডেলিভারি চার্জ তালিকা</h3>
            <p className="text-[11px] text-slate-500">সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>

        <div className="space-y-2 text-xs font-semibold text-gray-700 border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-[#083e23]">সারাদেশে ডেলিভারি চার্জ (All Bangladesh):</span>
            <span className="font-extrabold text-base text-[#087d43]">৳ ৫৫</span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
            <span>ক্যাশ অন ডেলিভারি:</span>
            <span className="font-bold text-gray-800">পণ্য হাতে পেয়ে টাকা পরিশোধ</span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>১০০০+ টাকার ওপরের অর্ডারে:</span>
            <span className="font-black text-emerald-700">🎉 সম্পূর্ণ ফ্রি ডেলিভারি!</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-[#15803d] hover:bg-[#0f602c] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          ঠিক আছে
        </button>
      </div>
    </div>
  );
};

export const OrderRulesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-5 relative shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3 text-[#1c3822]">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <PlayCircle size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">কীভাবে অর্ডার করবেন?</h3>
            <p className="text-[11px] text-slate-500">সহজ ৩টি ধাপে ঘরে বসেই অর্ডার করুন</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-gray-700 border-t border-gray-100 pt-3">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">১</span>
            <span className="leading-snug">পছন্দের বীজ বা পণ্য নির্বাচন করে <b>"কার্টে যুক্ত করুন"</b> বা <b>"অর্ডার করুন"</b> বোতামে চাপুন।</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">২</span>
            <span className="leading-snug">কার্ট বা চেকআউট পেজে আপনার নাম, মোবাইল নম্বর এবং জেলা ও সম্পূর্ণ ঠিকানা দিন।</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">৩</span>
            <span className="leading-snug">কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার কনফার্ম করুন। পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করুন।</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-[#15803d] hover:bg-[#0f602c] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          ঠিক আছে, বুঝতে পেরেছি
        </button>
      </div>
    </div>
  );
};
