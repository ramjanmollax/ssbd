import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Truck } from 'lucide-react';
import { PolicySettings, DEFAULT_POLICY_SETTINGS } from '../lib/firestoreProducts';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'refund' | 'shipping';
  settings?: PolicySettings;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
  settings = DEFAULT_POLICY_SETTINGS,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'refund' | 'shipping'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const privacyText = settings.privacy || DEFAULT_POLICY_SETTINGS.privacy || '';
  const termsText = settings.terms || DEFAULT_POLICY_SETTINGS.terms || '';
  const refundText = settings.refund || DEFAULT_POLICY_SETTINGS.refund || '';
  const shippingText = settings.shipping || DEFAULT_POLICY_SETTINGS.shipping || '';

  const tabs = [
    { id: 'privacy', label: 'প্রাইভেসি পলিসি', icon: ShieldCheck, content: privacyText },
    { id: 'terms', label: 'শর্তাবলী', icon: FileText, content: termsText },
    { id: 'refund', label: 'রিটার্ন ও রিফান্ড', icon: RotateCcw, content: refundText },
    { id: 'shipping', label: 'শিপিং ও ডেলিভারি', icon: Truck, content: shippingText },
  ] as const;

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c3822] to-[#2d5035] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-lime-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">স্টোর পলিসি ও নিয়মাবলী</h2>
              <p className="text-xs text-emerald-200/80">Ss Seed Shop Policy & Terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Policy Category Tabs */}
        <div className="bg-slate-50 border-b border-gray-200 px-3 pt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-white text-[#1c3822] border-[#72b01d] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-white/50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#72b01d]' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <currentTabObj.icon className="w-5 h-5 text-[#72b01d]" />
            <h3 className="text-base font-extrabold text-gray-900">{currentTabObj.label}</h3>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 sm:p-5 rounded-xl border border-gray-100 font-medium">
            {currentTabObj.content}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 font-medium">Ss Seed Shop Customer Assurance</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1c3822] hover:bg-[#2d5035] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
