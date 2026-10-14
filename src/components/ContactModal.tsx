import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Send,
  X,
  Check,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Mail,
  MessageCircle,
  Sprout,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ContactSettings, StoreSettings, FooterSettings } from '../lib/firestoreProducts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: ContactSettings;
  storeSettings?: StoreSettings;
  footerSettings?: FooterSettings;
  initialTab?: 'about' | 'contact';
  whatsappEnabled?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  settings,
  storeSettings,
  footerSettings,
  initialTab = 'contact',
  whatsappEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact'>(initialTab);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  // Store brand info
  const storeName = storeSettings?.name || 'Ss Seed Shop';
  const storeLogo = storeSettings?.logo || footerSettings?.footerLogoUrl || '';
  const storeTagline = settings?.tagline || storeSettings?.tagline || footerSettings?.tagline || 'মানসম্মত ও খাঁটি বীজ সরবরাহকারী';

  // Contact details from settings or defaults
  const hotline = settings?.hotline || storeSettings?.hotline || footerSettings?.hotline || '09617443377';
  const phoneNum = settings?.phone || storeSettings?.phone || footerSettings?.phone || '01410136900';
  const whatsapp = settings?.whatsapp || storeSettings?.phone || footerSettings?.whatsapp || '01410136900';
  const email = settings?.email || storeSettings?.email || footerSettings?.email || 'support@ssseedshop.com';
  const address = settings?.address || storeSettings?.address || footerSettings?.address || 'ঢাকা, বাংলাদেশ';

  // About Us customizations
  const aboutTitle = settings?.aboutTitle || 'আমাদের পথচলা ও অঙ্গীকার';
  const aboutDescription = settings?.aboutDescription || `${storeName} হলো বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন বীজ বাজার। আমাদের মূল লক্ষ্য—গৃহস্থালী, ছাদবাগান ও কমার্শিয়াল খামারিদের কাছে ১০০% খাঁটি, উচ্চ অঙ্কুরোদগম ক্ষমতাসম্পন্ন ও উন্নত জাতের সবজি, ফল, ফুল ও ভেষজ বীজ পৌঁছে দেওয়া।`;
  const perk1Title = settings?.aboutPerk1Title || '১০০% জেনুইন বীজ';
  const perk1Desc = settings?.aboutPerk1Desc || 'উচ্চ অঙ্কুরোদগম ও বাছাইকৃত জাতের বীজ';
  const perk2Title = settings?.aboutPerk2Title || 'সারা দেশে হোম ডেলিভারি';
  const perk2Desc = settings?.aboutPerk2Desc || 'নিরাপদ ক্যাশ অন ডেলিভারি সুবিধা';
  const showroomTitle = settings?.showroomTitle || 'প্রধান শোরুম ও দপ্তর:';

  const facebook = settings?.facebook || footerSettings?.facebook || 'https://facebook.com/ssseedshop';
  const instagram = settings?.instagram || footerSettings?.instagram || 'https://instagram.com/ssseedshop';
  const youtube = settings?.youtube || footerSettings?.youtube || 'https://youtube.com/@ssseedshop';
  const tiktok = settings?.tiktok || footerSettings?.tiktok || 'https://tiktok.com/@ssseedshop';

  const hotlineClean = hotline.replace(/[^0-9+]/g, '');
  const phoneClean = phoneNum.replace(/[^0-9+]/g, '');
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = whatsappClean
    ? whatsappClean.startsWith('88')
      ? `https://wa.me/${whatsappClean}`
      : `https://wa.me/88${whatsappClean}`
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setSent(true);

    // Format WhatsApp URL using the site's configured WhatsApp number
    const waText = encodeURIComponent(`নাম: ${name}\nমোবাইল: ${phone}\nবার্তা: ${message}`);
    const targetWaUrl = whatsappUrl ? `${whatsappUrl}?text=${waText}` : `https://wa.me/8801410136900?text=${waText}`;

    setTimeout(() => {
      window.open(targetWaUrl, '_blank');
      setSent(false);
      setName('');
      setPhone('');
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-[#e8eadf] my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#e0e4d7] flex items-center justify-center text-[#063d24] hover:bg-[#f0f4e8] transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="w-12 h-12 rounded-2xl object-contain border border-emerald-200 shrink-0 bg-emerald-50/50 p-1" />
          ) : (
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl border border-emerald-200 shrink-0">
              🌱
            </div>
          )}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#063d24]">
              {storeName}
            </h3>
            <p className="text-xs font-semibold text-[#176b38] flex items-center gap-1">
              <span>{storeTagline}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#f2f6ee] p-1 rounded-2xl border border-[#e2e8dc] mb-5">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-[#176b38] text-white shadow-sm'
                : 'text-[#415545] hover:text-[#063d24]'
            }`}
          >
            <Sprout size={15} />
            <span>আমাদের সম্পর্কে</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'contact'
                ? 'bg-[#176b38] text-white shadow-sm'
                : 'text-[#415545] hover:text-[#063d24]'
            }`}
          >
            <Phone size={15} />
            <span>যোগাযোগ ও সোশ্যাল</span>
          </button>
        </div>

        {/* TAB 1: আমাদের সম্পর্কে (ABOUT US) */}
        {activeTab === 'about' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Overview Card */}
            <div className="bg-[#f8fbf6] p-4 rounded-2xl border border-[#e3ebe0] space-y-2">
              <div className="flex items-center gap-2 text-[#176b38] font-black text-sm">
                <Sparkles size={16} />
                <span>{aboutTitle}</span>
              </div>
              <p className="text-xs text-[#3a4e3d] leading-relaxed whitespace-pre-line">
                {aboutDescription}
              </p>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#063d24]">{perk1Title}</h4>
                  <p className="text-[10px] text-[#526250] mt-0.5">{perk1Desc}</p>
                </div>
              </div>

              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                <Truck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#063d24]">{perk2Title}</h4>
                  <p className="text-[10px] text-[#526250] mt-0.5">{perk2Desc}</p>
                </div>
              </div>
            </div>

            {/* Office Address & Helpline */}
            <div className="bg-white p-4 rounded-2xl border border-[#e3ebe0] space-y-3">
              <div className="flex items-start gap-2 text-xs text-[#2d4231]">
                <MapPin size={16} className="text-[#176b38] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#063d24]">{showroomTitle}</span>
                  <span>{address}</span>
                </div>
              </div>

              {email && (
                <div className="flex items-center gap-2 text-xs text-[#2d4231]">
                  <Mail size={16} className="text-[#176b38] shrink-0" />
                  <span className="font-bold text-[#063d24]">ইমেইল:</span>
                  <a href={`mailto:${email}`} className="text-[#176b38] hover:underline font-medium">
                    {email}
                  </a>
                </div>
              )}
            </div>

            {/* Quick Call Action */}
            <div className="pt-2 flex gap-2">
              {hotline && (
                <a
                  href={`tel:${hotlineClean}`}
                  className="flex-1 bg-[#176b38] hover:bg-[#063d24] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Phone size={15} />
                  <span>হটলাইন: {hotline}</span>
                </a>
              )}
              {whatsappEnabled !== false && whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#1eb856] text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: যোগাযোগ ও সোশ্যাল (CONTACT & SOCIAL) */}
        {activeTab === 'contact' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Quick Contact Buttons Row */}
            <div className="grid grid-cols-2 gap-2.5">
              {hotline && (
                <a
                  href={`tel:${hotlineClean}`}
                  className="bg-[#f0f7e6] hover:bg-[#e2f0d1] border border-[#cbe0b0] p-3 rounded-2xl flex items-center gap-2.5 text-[#063d24] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#176b38] text-white flex items-center justify-center shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#456b3a] uppercase block leading-tight">হটলাইন কল</span>
                    <span className="text-xs font-black truncate block">{hotline}</span>
                  </div>
                </a>
              )}

              {whatsappEnabled !== false && whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#eafaf1] hover:bg-[#d4f5e2] border border-[#a8e6c1] p-3 rounded-2xl flex items-center gap-2.5 text-[#0a522c] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#1b7342] uppercase block leading-tight">হোয়াটসঅ্যাপ চ্যাট</span>
                    <span className="text-xs font-black truncate block">{whatsapp}</span>
                  </div>
                </a>
              )}
            </div>

            {/* Address & Email Detail Box */}
            <div className="bg-[#fbfdfa] p-3.5 rounded-2xl border border-[#e3ebe0] space-y-2 text-xs">
              {phoneNum && (
                <div className="flex items-center gap-2 text-[#2d4231]">
                  <Phone size={14} className="text-[#176b38] shrink-0" />
                  <span className="font-bold text-[#063d24]">বিকল্প ফোন:</span>
                  <a href={`tel:${phoneClean}`} className="font-semibold text-[#176b38] hover:underline">
                    {phoneNum}
                  </a>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-2 text-[#2d4231]">
                  <Mail size={14} className="text-[#176b38] shrink-0" />
                  <span className="font-bold text-[#063d24]">ইমেইল:</span>
                  <a href={`mailto:${email}`} className="font-semibold text-[#176b38] hover:underline">
                    {email}
                  </a>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-2 text-[#2d4231] pt-1 border-t border-[#edf0e7]">
                  <MapPin size={14} className="text-[#176b38] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#063d24]">ঠিকানা: </span>
                    <span>{address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Channels */}
            <div>
              <h4 className="text-xs font-extrabold text-[#063d24] mb-2 flex items-center gap-1.5">
                <ExternalLink size={14} className="text-[#176b38]" />
                <span>সোশ্যাল মিডিয়া পেজ ও চ্যানেল</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {facebook && (
                  <a
                    href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white font-bold text-xs transition-all border border-[#1877F2]/20"
                  >
                    <Facebook size={14} />
                    <span>Facebook</span>
                  </a>
                )}

                {instagram && (
                  <a
                    href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#E4405F]/10 hover:bg-[#E4405F] text-[#E4405F] hover:text-white font-bold text-xs transition-all border border-[#E4405F]/20"
                  >
                    <Instagram size={14} />
                    <span>Instagram</span>
                  </a>
                )}

                {youtube && (
                  <a
                    href={youtube.startsWith('http') ? youtube : `https://${youtube}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white font-bold text-xs transition-all border border-[#FF0000]/20"
                  >
                    <Youtube size={14} />
                    <span>YouTube</span>
                  </a>
                )}

                {tiktok && (
                  <a
                    href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 hover:bg-black text-slate-800 hover:text-white font-bold text-xs transition-all border border-slate-200"
                  >
                    <span className="font-black text-xs">TikTok</span>
                  </a>
                )}
              </div>
            </div>

            {/* Direct Message Inbox Form */}
            <div className="pt-2 border-t border-[#edf0e7]">
              <div className="flex items-center gap-1.5 text-[#176b38] font-bold text-xs mb-2">
                <MessageSquare size={14} />
                <span>সরাসরি মেসেজ পাঠান</span>
              </div>

              {sent ? (
                <div className="bg-[#f0f7e6] p-4 rounded-2xl border border-[#d2e4b6] text-center space-y-1">
                  <div className="w-10 h-10 bg-[#176b38] text-white rounded-full flex items-center justify-center mx-auto text-lg">
                    <Check size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-[#063d24]">আপনার বার্তা পাঠানো হয়েছে!</h4>
                  <p className="text-[11px] text-[#526250]">আমাদের প্রতিনিধি দ্রুত আপনার নম্বরে যোগাযোগ করবেন।</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="আপনার নাম"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 text-xs bg-[#fbfdf7] border border-[#dce2d2] rounded-xl focus:outline-none focus:border-[#176b38]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="মোবাইল নম্বর"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2 text-xs bg-[#fbfdf7] border border-[#dce2d2] rounded-xl focus:outline-none focus:border-[#176b38]"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      required
                      placeholder="আপনার বার্তা বা কাঙ্ক্ষিত বীজ সম্পর্কিত তথ্য লিখুন..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-2 text-xs bg-[#fbfdf7] border border-[#dce2d2] rounded-xl focus:outline-none focus:border-[#176b38]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#176b38] hover:bg-[#063d24] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send size={14} />
                    <span>মেসেজ পাঠান</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

