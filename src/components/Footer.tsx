import React from 'react';
import {
  Phone, Mail, MapPin, Truck, CheckCircle2, ChevronUp,
  Sprout, Facebook, Youtube, MessageCircle, Clock3,
} from 'lucide-react';
import { FooterSettings, ContactSettings } from '../lib/firestoreProducts';

interface FooterProps {
  onSelectCategory?: (catId: string) => void;
  onOpenContact?: (tab?: 'about' | 'contact') => void;
  onOpenPolicy?: (tab?: 'privacy' | 'terms' | 'refund' | 'shipping') => void;
  onOpenCart?: () => void;
  onNavigateHome?: () => void;
  settings?: FooterSettings;
  contactSettings?: ContactSettings;
  whatsappEnabled?: boolean;
}

const normalizeUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const whatsappLink = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const international = digits.startsWith('880') ? digits : digits.startsWith('0') ? `88${digits}` : digits;
  return `https://wa.me/${international}`;
};

export const Footer: React.FC<FooterProps> = ({
  settings, contactSettings, onSelectCategory, onOpenContact,
  onOpenPolicy, onOpenCart, onNavigateHome, whatsappEnabled,
}) => {
  if (settings && settings.footerEnabled === false) return null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' }); else scrollToTop();
  };

  const brandName = settings?.brandName || 'Ss Seed Shop';
  const tagline = settings?.tagline || 'বিশুদ্ধ বীজ, সমৃদ্ধ ফসল';
  const bio = settings?.bio || 'আপনার ছাদবাগান ও সবুজ স্বপ্নের জন্য মানসম্মত বীজ ও বাগান সামগ্রী। শতভাগ অঙ্কুরোদগম গ্যারান্টি।';
  const logo = settings?.footerLogoUrl || '';
  const phone = settings?.phone || contactSettings?.phone || settings?.hotline || contactSettings?.hotline || '01410136900';
  const email = settings?.email || contactSettings?.email || 'ssseedshop@gmail.com';
  const address = settings?.address || contactSettings?.address || 'ঢাকা, বাংলাদেশ';
  const businessHours = settings?.businessHours || 'সকাল ৯টা - রাত ৮টা';
  const facebook = settings?.facebook || contactSettings?.facebook || 'https://facebook.com/ssseedshop';
  const youtube = settings?.youtube || contactSettings?.youtube || '';
  const copyright = settings?.copyright || `© ${new Date().getFullYear()} ${brandName} — সর্বস্বত্ব সংরক্ষিত`;

  const quickLinksTitle = settings?.quickLinksTitle || 'দ্রুত লিংক';
  const quickLink1 = settings?.quickLink1Text || 'হোমপেজ';
  const quickLink2 = settings?.quickLink2Text || 'সকল বীজ';
  const quickLink3 = settings?.quickLink3Text || 'কম্বো প্যাক';
  const quickLink4 = settings?.quickLink4Text || 'আমাদের সম্পর্কে';
  const quickLink5 = settings?.quickLink5Text || 'প্রশ্নোত্তর';
  const quickLink6 = settings?.quickLink6Text || 'কার্ট চেকআউট';

  const contactBoxTitle = settings?.contactBoxTitle || 'যোগাযোগ ও হেল্পলাইন';
  const deliveryTitle = settings?.deliveryTitle || 'ডেলিভারি তথ্য';
  const deliveryNote1 = settings?.deliveryNote1 || 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি';
  const deliveryNote2 = settings?.deliveryNote2 || '১০০% নিরাপদ ও সুরক্ষিত পার্সেল';
  const deliveryNote3 = settings?.deliveryNote3 || 'Cash on Delivery (ক্যাশ অন ডেলিভারি)';

  const privacyLabel = settings?.privacyLabel || 'প্রাইভেসি পলিসি';
  const termsLabel = settings?.termsLabel || 'শর্তাবলী';
  const refundLabel = settings?.refundLabel || 'রিটার্ন পলিসি';
  const shippingLabel = settings?.shippingLabel || 'ডেলিভারি পলিসি';

  const waUrl = whatsappLink(phone);

  return (
    <footer className="w-full font-sans text-white bg-[#062414] relative overflow-hidden" id="footer">
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-8">
          
          {/* Column 1: Brand Profile (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white shadow-md shrink-0">
                {logo ? <img src={logo} alt={brandName} className="w-full h-full object-contain p-1 rounded-xl" /> : <Sprout size={20} />}
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight">{brandName}</h3>
                <p className="text-[10px] font-semibold text-emerald-400">{tagline}</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm">
              {bio}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {facebook && (
                <a href={normalizeUrl(facebook)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm" aria-label="Facebook">
                  <Facebook size={15} />
                </a>
              )}
              {youtube && (
                <a href={normalizeUrl(youtube)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-sm" aria-label="YouTube">
                  <Youtube size={15} />
                </a>
              )}
              {whatsappEnabled !== false && waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-sm" aria-label="WhatsApp">
                  <MessageCircle size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider pb-1 border-b border-emerald-700/60 inline-block">
              {quickLinksTitle}
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 text-xs font-medium">
              {[
                { label: quickLink1, action: () => { if (onNavigateHome) onNavigateHome(); else scrollToTop(); } },
                { label: quickLink2, action: () => { scrollToSection('products'); if (onSelectCategory) onSelectCategory('all'); } },
                { label: quickLink3, action: () => { scrollToSection('products'); if (onSelectCategory) onSelectCategory('combo'); } },
                { label: quickLink4, action: () => { if (onOpenContact) onOpenContact('about'); else scrollToSection('about'); } },
                { label: quickLink5, action: () => scrollToSection('faq') },
                { label: quickLink6, action: () => { if (onOpenCart) onOpenCart(); else scrollToSection('products'); } },
              ].map((lk, i) => (
                <li key={i}>
                  <button type="button" onClick={lk.action}
                    className="text-emerald-100/80 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{lk.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider pb-1 border-b border-emerald-700/60 inline-block">
              {contactBoxTitle}
            </h4>
            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-700/50 space-y-1.5 shadow-sm">
              <a href={`tel:${phone}`} className="block text-sm sm:text-base font-black text-white hover:text-emerald-300 transition-colors">
                {phone}
              </a>
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/80">
                <Mail size={12} className="text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline truncate">{email}</a>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-emerald-200/80">
                <MapPin size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-300/85 pt-1 border-t border-emerald-800/50">
                <Clock3 size={12} />
                <span>{businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Delivery (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider pb-1 border-b border-emerald-700/60 inline-block">
              {deliveryTitle}
            </h4>
            <div className="p-3 rounded-2xl bg-black/30 border border-emerald-700/50 space-y-2 shadow-sm">
              {[deliveryNote1, deliveryNote2, deliveryNote3].map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-8 pt-4 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] text-emerald-200/70 font-medium">{copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-emerald-200/80">
            {[
              { label: privacyLabel, tab: 'privacy' as const },
              { label: termsLabel, tab: 'terms' as const },
              { label: refundLabel, tab: 'refund' as const },
              { label: shippingLabel, tab: 'shipping' as const },
            ].map((p, i) => (
              <button key={i} type="button" onClick={() => onOpenPolicy?.(p.tab)} className="hover:text-white transition-colors cursor-pointer">
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={scrollToTop} title="ওপরে যান" aria-label="ওপরে যান"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md">
            <ChevronUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </footer>
  );
};
