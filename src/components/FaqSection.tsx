import React, { useState } from 'react';
import { Phone, ChevronDown, Sparkles } from 'lucide-react';
import { FooterSettings, ContactSettings } from '../lib/firestoreProducts';

interface FaqSectionProps {
  settings?: FooterSettings;
  contactSettings?: ContactSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings, contactSettings }) => {
  const showFaq = settings?.showFaq !== false;
  if (!showFaq) return null;

  const [openFaqIndexes, setOpenFaqIndexes] = useState<number[]>([]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndexes((prev) => (prev.includes(idx) ? [] : [idx]));
  };

  const phone = settings?.phone || contactSettings?.phone || '01410136900';
  const hotline = settings?.hotline || contactSettings?.hotline || '09617443377';
  const faqTitle = settings?.faqTitle || 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)';
  const faqSubtitle = settings?.faqSubtitle || 'সহজ সমাধান ও নির্দেশিকা';

  const configuredFaqs = [
    ...(settings?.faq1Q ? [{ q: settings.faq1Q, a: settings.faq1A || '' }] : []),
    ...(settings?.faq2Q ? [{ q: settings.faq2Q, a: settings.faq2A || '' }] : []),
    ...(settings?.faq3Q ? [{ q: settings.faq3Q, a: settings.faq3A || '' }] : []),
    ...(settings?.faq4Q ? [{ q: settings.faq4Q, a: settings.faq4A || '' }] : []),
    ...(settings?.faq5Q ? [{ q: settings.faq5Q, a: settings.faq5A || '' }] : []),
    ...(settings?.faq6Q ? [{ q: settings.faq6Q, a: settings.faq6A || '' }] : []),
  ];

  const faqs =
    configuredFaqs.length > 0
      ? configuredFaqs
      : [
          {
            q: 'বীজ কীভাবে রোপণ করবো?',
            a: 'দোআঁশ বা বেলে-দোআঁশ মাটির সাথে ৫০% জৈব সার মিশিয়ে মাটি ঝুরঝুরে করে নিন। বীজ ১-২ সেমি গভীরে রোপণ করে হালকা পানি স্প্রে করুন। সঠিক আর্দ্রতায় ৩-৭ দিনে অঙ্কুরোদ্গম হবে।',
          },
          {
            q: 'গাইডলাইন PDF কীভাবে পাবো?',
            a: 'যেকোনো বীজ অর্ডারের সাথে বিনামূল্যে রঙিন ডিজিটাল গাইডলাইন PDF পাঠানো হয়। পার্সেল কনফার্মেশনের পর হোয়াটসঅ্যাপেও পাঠানো হয়।',
          },
          {
            q: 'অন্য কোনো প্রশ্ন আছে?',
            a: `যেকোনো পরামর্শের জন্য হেল্পলাইনে কল করুন: ${phone || hotline} অথবা হোয়াটসঅ্যাপে মেসেজ পাঠান। আমাদের টিম সার্বক্ষণিক সহায়তা করবে।`,
          },
          {
            q: 'বীজের গুণগত মান কেমন?',
            a: 'আমাদের সকল বীজ ল্যাব-পরীক্ষিত এবং ৯৫%+ অঙ্কুরোদগম হার সমৃদ্ধ। কৃষক ও ছাদবাগানীদের জন্য প্রিমিয়াম গ্রেডের বীজ সরাসরি সরবরাহ করি।',
          },
        ];

  return (
    <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 my-8 bg-gradient-to-b from-[#f0f7f2] via-white to-[#f0f7f2]" id="faq">
      <div className="max-w-5xl mx-auto">
        {/* Modern Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs mb-3">
            <Sparkles size={13} className="text-emerald-700 animate-pulse" />
            <span>{faqSubtitle}</span>
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0f2918] tracking-tight">
            {faqTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            বীজ রোপণ, যত্ন ও ডেলিভারি সংক্রান্ত যেকোনো জিজ্ঞাসার সহজ সমাধান এখানে পেয়ে যাবেন।
          </p>
        </div>

        {/* FAQ Cards Accordion */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndexes.includes(idx);
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-300 border overflow-hidden shadow-sm ${
                  isOpen
                    ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                    : 'bg-white/80 backdrop-blur-xs border-slate-200 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 transition-all ${
                        isOpen
                          ? 'bg-emerald-600 text-white shadow-sm scale-105'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      🌱
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-800 rotate-180'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-xs sm:text-sm leading-relaxed text-slate-700 bg-emerald-50/40 border-t border-emerald-100/60 animate-in fade-in duration-200 font-medium">
                    <p className="whitespace-pre-line pl-12 sm:pl-13 text-slate-700">{faq.a}</p>
                    <div className="mt-4 pt-3 ml-12 sm:ml-13 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/50 text-xs">
                      <span className="font-bold text-slate-600">আরো কিছু জানতে চান?</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Phone size={13} />
                          <span>কল করুন: {phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
