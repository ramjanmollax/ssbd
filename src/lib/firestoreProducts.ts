import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Category, OrderDetails, Banner, Review, Coupon } from '../types';
import { INITIAL_PRODUCTS_DATA } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'সকল বীজ', iconEmoji: '🌾', subtitle: 'সব ধরনের বীজ ও সামগ্রী', itemCount: 0 },
  { id: 'veg', name: 'সবজি বীজ', iconEmoji: '🥦', subtitle: 'টাটকা সবজির সেরা বীজ', itemCount: 0 },
  { id: 'ful', name: 'ফুলের বীজ', iconEmoji: '🌸', subtitle: 'রঙিন ফুলের বাহারি বীজ', itemCount: 0 },
  { id: 'fruit', name: 'ফুলের বীজ', iconEmoji: '🍉', subtitle: 'মিষ্টি ফলের উন্নত বীজ', itemCount: 0 },
  { id: 'other', name: 'বাগান সামগ্রী', iconEmoji: '🛠️', subtitle: 'টব ও চাষের প্রয়োজনীয় সামগ্রী', itemCount: 0 },
];

export interface HomepageSettings {
  topBarEnabled?: boolean;
  topBarPhone?: string;
  topBarHours?: string;
  topBarDelivery?: string;
  topBarGuarantee?: string;
  topBarTagline?: string;
  marqueeEnabled?: boolean;
  marqueeText?: string;
  marqueeSpeed?: 'slow' | 'normal' | 'fast';
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  marqueeBadge?: string;
  marqueeLink?: string;
  noticeText?: string;
  noticeEnabled?: boolean;
  heroHeading?: string;
  heroSubheading?: string;
  heroBannerImage?: string;
  heroMobileBannerImage?: string;
  ctaText?: string;
  ctaLink?: string;
  showCategories?: boolean;
  showPromoBanner?: boolean;
  showLeaderboard?: boolean;
  leaderboardTitle?: string;
  leaderboardSubtitle?: string;
  leaderboardBadge?: string;
  leaderboardType?: 'customer' | 'product';
  leaderboardMode?: 'auto' | 'custom';
  leaderboardHideIfEmpty?: boolean;
  leaderboardCustomJson?: string;
  leaderboardCustomUsers?: Array<{
    rank?: number;
    name: string;
    phone: string;
    location: string;
    totalAmount: number;
    ordersCount: number;
    avatar?: string;
  }>;
  showBlogTips?: boolean;
  showTrustSection?: boolean;
  promoTitle?: string;
  promoSubtext?: string;
  promoButtonText?: string;
  promoCouponCode?: string;
}

export interface FooterSettings {
  brandName?: string;
  tagline?: string;
  bio?: string;
  footerLogoUrl?: string;
  footerBgColor?: string;
  footerFaqBgColor?: string;
  accentColor?: string;
  hotline?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  copyright?: string;
  footerEnabled?: boolean;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  quickLinksTitle?: string;
  quickLink1Text?: string;
  quickLink2Text?: string;
  quickLink3Text?: string;
  quickLink4Text?: string;
  quickLink5Text?: string;
  quickLink6Text?: string;
  contactBoxTitle?: string;
  showFaq?: boolean;
  faqTitle?: string;
  faqSubtitle?: string;
  faq1Q?: string;
  faq1A?: string;
  faq2Q?: string;
  faq2A?: string;
  faq3Q?: string;
  faq3A?: string;
  faq4Q?: string;
  faq4A?: string;
  faq5Q?: string;
  faq5A?: string;
  faq6Q?: string;
  faq6A?: string;
  faqTwoColumns?: boolean;
  badge1Text?: string;
  badge2Text?: string;
  badge3Text?: string;
  badge4Text?: string;
  deliveryTitle?: string;
  deliveryNote1?: string;
  deliveryNote2?: string;
  deliveryNote3?: string;
  privacyLabel?: string;
  termsLabel?: string;
  refundLabel?: string;
  shippingLabel?: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  brandName: 'Ss Seed Shop',
  tagline: 'বিশুদ্ধ বীজ, সমৃদ্ধ ফসল',
  bio: 'নিজের ছাদবাগানে টাটকা, স্বাস্থ্যকর ও বিষমুক্ত সবজি ফলান। Ss Seed Shop আপনার সবুজ স্বপ্নের নির্ভরযোগ্য সঙ্গী।',
  footerLogoUrl: '',
  footerBgColor: '#082f1e',
  footerFaqBgColor: '#f4f8f3',
  accentColor: '#22c55e',
  hotline: '01915957187',
  whatsapp: '01915957187',
  phone: '01915957187',
  email: 'support@ssseedshop.com',
  address: 'ঢাকা, বাংলাদেশ',
  businessHours: 'সকাল ৯টা - রাত ৮টা',
  copyright: '© 2026 Ss Seed Shop | সর্বস্বত্ব সংরক্ষিত।',
  footerEnabled: true,
  facebook: 'https://facebook.com/ssseedshop',
  youtube: 'https://youtube.com/@ssseedshop',
  tiktok: 'https://tiktok.com/@ssseedshop',
  instagram: 'https://instagram.com/ssseedshop',
  quickLinksTitle: 'দ্রুত লিংক',
  quickLink1Text: 'হোমপেজ',
  quickLink2Text: 'সকল বীজ',
  quickLink3Text: 'কম্বো প্যাক',
  quickLink4Text: 'কেন কিনবেন',
  quickLink5Text: 'প্রশ্নোত্তর',
  quickLink6Text: 'অর্ডার করুন',
  contactBoxTitle: 'যোগাযোগ ও হেল্পলাইন',
  showFaq: true,
  faqTitle: 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)',
  faqSubtitle: 'সাধারণ জিজ্ঞাসা',
  faq1Q: 'বীজ কীভাবে রোপণ করবো?',
  faq1A: 'দোআঁশ বা বেলে-দোআঁশ মাটির সাথে ৫০% জৈব সার বা ভার্মিকম্পোস্ট ভালো করে মিশিয়ে মাটি ঝুরঝুরে করে নিন। বীজ মাটির ১-২ সেমি গভীরে রোপণ করে হালকা পানি স্প্রে করুন। অতিরিক্ত কড়া রোদ বা বৃষ্টির পানি থেকে চারা রক্ষা করতে হালকা শেডের ব্যবস্থা রাখুন। সঠিক আর্দ্রতা বজায় রাখলে ৩-৭ দিনের মধ্যে দ্রুত অঙ্কুরোদ্গম ঘটবে।',
  faq2Q: 'গাইডলাইন PDF কীভাবে পাবো?',
  faq2A: 'আমাদের যেকোনো বীজ অর্ডারের সাথে পাচ্ছেন বিনামূল্যে একটি পূর্ণাঙ্গ প্রিন্টেড ও রঙিন ডিজিটাল বাগান পরিচর্যা গাইডলাইন PDF। এছাড়া পার্সেল কনফার্মেশনের পর আমাদের অফিসিয়াল হোয়াটসঅ্যাপেও সরাসরি গাইডলাইন ফাইলটি পাঠিয়ে দেওয়া হয়।',
  faq3Q: 'অন্য কোনো প্রশ্ন আছে?',
  faq3A: 'যেকোনো কৃষি পরামর্শ, সঠিক বীজ নির্বাচন বা চাষাবাদ সম্পর্কিত তথ্যের জন্য আমাদের হেল্পলাইনে সরাসরি কল করুন: 01915957187 অথবা হোয়াটসঅ্যাপে মেসেজ পাঠান। আমাদের অভিজ্ঞ এগ্রিকালচারিস্ট টিম আপনাকে সার্বক্ষণিক সহায়তা করবে।',
  faq4Q: 'বীজের গুণগত মান কেমন?',
  faq4A: 'আমাদের সকল বীজ ল্যাব-পরীক্ষিত এবং ৯৫%+ অঙ্কুরোদগম হার সমৃদ্ধ। আমরা কৃষক ও ছাদবাগানীদের জন্য প্রিমিয়াম গ্রেডের বীজ সরাসরি সরবরাহ করি।',
  faq5Q: '',
  faq5A: '',
  faq6Q: '',
  faq6A: '',
  faqTwoColumns: true,
  badge1Text: 'উন্নত মানের বীজ',
  badge2Text: 'অঙ্কুরোদগম ৯৫%+',
  badge3Text: 'বিশ্বাস ও সততার প্রতীক',
  badge4Text: 'সহায়তা সার্বক্ষণিক',
  deliveryTitle: 'ডেলিভারি তথ্য',
  deliveryNote1: 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি',
  deliveryNote2: 'ডেলিভারি চার্জ একদম FREE!',
  deliveryNote3: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
  privacyLabel: 'গোপনীয়তা নীতি',
  termsLabel: 'ব্যবহারের শর্তাবলী',
  refundLabel: 'রিটার্ন নীতি',
  shippingLabel: 'সাইটম্যাপ / ডেলিভারি',
};

export interface ContactSettings {
  hotline?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  // About Us Modal Customizations (Managed from Admin Panel)
  tagline?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutPerk1Title?: string;
  aboutPerk1Desc?: string;
  aboutPerk2Title?: string;
  aboutPerk2Desc?: string;
  showroomTitle?: string;
}

export interface PolicySettings {
  privacy?: string;
  terms?: string;
  refund?: string;
  shipping?: string;
}

export interface StoreSettings {
  name?: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  hours?: string;
  address?: string;
  phone?: string;
  hotline?: string;
  email?: string;
  currency?: string;
  language?: string;
  loginEnabled?: boolean;
  reviewEnabled?: boolean;
  whatsappFloatEnabled?: boolean;
  cultivationGuideEnabled?: boolean;
  cultivationGuideTitle?: string;
  defaultCultivationGuide?: string;
  // Invoice / Cash Memo Customizations
  invoiceSubtitle?: string;
  invoiceNote?: string;
  invoiceFooterMsg?: string;
}

export interface SeoSettings {
  siteTitle?: string;
  keywords?: string;
  description?: string;
  googleVerification?: string;
  facebookPixel?: string;
  ogImage?: string;
}

export interface DeliverySettings {
  insideCharge: number;
  outsideCharge: number;
  freeMinimum: number;
  deliveryNote?: string;
  deliveryChargeEnabled: boolean;
}

export interface PaymentSettings {
  codEnabled: boolean;
  bkashEnabled: boolean;
  bkashNumber?: string;
  bkashType?: string;
  nagadEnabled: boolean;
  nagadNumber?: string;
  nagadType?: string;
  rocketEnabled: boolean;
  rocketNumber?: string;
  rocketType?: string;
  instruction?: string;
}

export interface ShippingZone {
  id?: string;
  name: string;
  charge: number;
  estimatedDays?: string;
  description?: string;
}

export interface NoticeSettings {
  noticeText?: string;
  noticeLink?: string;
  noticeEnabled?: boolean;
  popupHeading?: string;
  popupSubheading?: string;
  popupImage?: string;
  popupButton?: string;
  popupLink?: string;
  popupEnabled?: boolean;
}

export interface MenuSettings {
  bottomNavEnabled?: boolean;
  menuBarEnabled?: boolean;
  headerMenuEnabled?: boolean;
  bottomNavMenuEnabled?: boolean;
  menuOrderTrackerEnabled?: boolean;
  menuDeliveryChargeEnabled?: boolean;
  menuOrderRulesEnabled?: boolean;
  menuSearchEnabled?: boolean;
  menuHomeEnabled?: boolean;
  menuAllProductsEnabled?: boolean;
  menuCategoriesEnabled?: boolean;
  menuCartEnabled?: boolean;
  menuWishlistEnabled?: boolean;
  menuCompareEnabled?: boolean;
  menuAboutEnabled?: boolean;
  menuContactEnabled?: boolean;
  menuPolicyEnabled?: boolean;
  menuAdminLinkEnabled?: boolean;
  menuHelplineEnabled?: boolean;
}

export const DEFAULT_MENU_SETTINGS: MenuSettings = {
  bottomNavEnabled: true,
  menuBarEnabled: true,
  headerMenuEnabled: true,
  bottomNavMenuEnabled: false,
  menuOrderTrackerEnabled: true,
  menuDeliveryChargeEnabled: true,
  menuOrderRulesEnabled: true,
  menuSearchEnabled: true,
  menuHomeEnabled: true,
  menuAllProductsEnabled: true,
  menuCategoriesEnabled: true,
  menuCartEnabled: true,
  menuWishlistEnabled: true,
  menuCompareEnabled: true,
  menuAboutEnabled: true,
  menuContactEnabled: true,
  menuPolicyEnabled: true,
  menuAdminLinkEnabled: true,
  menuHelplineEnabled: true,
};

// Default Homepage Settings
export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  topBarEnabled: false,
  topBarPhone: '01915957187',
  topBarHours: 'সকাল ৯টা - রাত ৮টা',
  topBarDelivery: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি',
  topBarGuarantee: '১০০% খাঁটি ও অঙ্কুরোদগম গ্যারান্টি',
  topBarTagline: 'Ss Seed Shop - বিশুদ্ধ বীজ ও গার্ডেন শপ',
  marqueeEnabled: false,
  marqueeText: '🌾 Ss Seed Shop - বিশুদ্ধ বীজ ও সুস্থ চারা দিয়ে গড়ে তুলুন আপনার স্বপ্নের ছাদবাগান! সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা ও ১০০% অঙ্কুরোদ্গম নিশ্চয়তা।',
  marqueeSpeed: 'normal',
  marqueeBgColor: '#07361a',
  marqueeTextColor: '#ffffff',
  marqueeBadge: '📢 বিশেষ ঘোষণা',
  marqueeLink: '#products',
  noticeText: '',
  noticeEnabled: false,
  heroHeading: '',
  heroSubheading: '',
  heroBannerImage: '',
  heroMobileBannerImage: '',
  ctaText: '',
  ctaLink: '#products',
  showCategories: true,
  showPromoBanner: false,
  showLeaderboard: false,
  leaderboardTitle: '',
  leaderboardSubtitle: '',
  leaderboardBadge: '',
  leaderboardType: 'customer',
  leaderboardMode: 'auto',
  leaderboardHideIfEmpty: true,
  leaderboardCustomUsers: [],
  showBlogTips: false,
  showTrustSection: false,
  promoTitle: '',
  promoSubtext: '',
  promoButtonText: '',
  promoCouponCode: '',
};

// Default Notice & Popup Settings
export const DEFAULT_NOTICE_SETTINGS: NoticeSettings = {
  noticeText: '',
  noticeLink: '',
  noticeEnabled: false,
  popupHeading: '',
  popupSubheading: '',
  popupImage: '',
  popupButton: '',
  popupLink: '/#products',
  popupEnabled: false,
};

// Default Contact & Social Settings
export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  hotline: '01915957187',
  phone: '01915957187',
  whatsapp: '01915957187',
  email: 'support@ssseedshop.com',
  address: 'ঢাকা, বাংলাদেশ',
  facebook: 'https://facebook.com/ssseedshop',
  instagram: '',
  youtube: '',
  tiktok: '',
  tagline: 'মানসম্মত ও খাঁটি বীজ সরবরাহকারী',
  aboutTitle: 'আমাদের পথচলা ও অঙ্গীকার',
  aboutDescription: 'Ss Seed Shop হলো বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন বীজ বাজার। আমাদের মূল লক্ষ্য—গৃহস্থালী, ছাদবাগান ও কমার্শিয়াল খামারিদের কাছে ১০০% খাঁটি, উচ্চ অঙ্কুরোদগম ক্ষমতাসম্পন্ন ও উন্নত জাতের সবজি, ফল, ফুল ও ভেষজ বীজ পৌঁছে দেওয়া।',
  aboutPerk1Title: '১০০% জেনুইন বীজ',
  aboutPerk1Desc: 'উচ্চ অঙ্কুরোদগম ও বাছাইকৃত জাতের বীজ',
  aboutPerk2Title: 'সারা দেশে হোম ডেলিভারি',
  aboutPerk2Desc: 'নিরাপদ ক্যাশ অন ডেলিভারি সুবিধা',
  showroomTitle: 'প্রধান শোরুম ও দপ্তর:',
};

// Default Policy Settings
export const DEFAULT_POLICY_SETTINGS: PolicySettings = {
  privacy: `Ss Seed Shop-এ আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।\n\n১. তথ্য সংগ্রহ: অর্ডার প্রক্রিয়াকরণের জন্য আপনার নাম, ঠিকানা, মোবাইল নম্বর ও ইমেইল সংরক্ষণ করা হয়।\n২. তথ্যের ব্যবহার: শুধুমাত্র পণ্য পৌঁছে দেওয়া এবং অর্ডার সংক্রান্ত যোগাযোগের জন্য আপনার তথ্য ব্যবহৃত হয়।\n৩. তথ্য গোপনীয়তা: আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।\n৪. ডাটা সিকিউরিটি: আপনার অর্ডারের তথ্য নিরাপদ ডাটাবেসে সুরক্ষিত রাখা হয়।`,
  terms: `Ss Seed Shop থেকে যেকোনো পণ্য ক্রয়ের পূর্বে নিম্নোক্ত শর্তাবলী ভালোভাবে পড়ে নিন:\n\n১. অর্ডার নিশ্চিতকরণ: ওয়েবসাইটে অর্ডার সম্পন্ন করার পর আমাদের প্রতিনিধি কল বা মেসেজের মাধ্যমে অর্ডার কনফার্ম করতে পারেন।\n২. মূল্য ও পেমেন্ট: প্রতিটি বীজের গায়ে বা ওয়েবসাইটে উল্লেখিত মূল্যই চূড়ান্ত। ক্যাশ অন ডেলিভারি বা বিকাশ/নগদ/রকেটে পেমেন্ট করা যাবে।\n৩. স্টক ও ডেলিভারি: সকল প্রোডাক্টের স্টক প্রতিনিয়ত আপডেট হয়। প্রাকৃতিক দুর্যোগ বা পার্সেল পরিবহনে বিলম্ব হলে কাস্টমারকে অবহিত করা হবে।\n৪. বীজের গুণমান: আমরা সর্বোচ্চ মানের বীজ সরবরাহ করে থাকি, তবে অঙ্কুরোদ্গম সম্পূর্ণ নির্ভর করে সঠিক মাটি, আলো, তাপমাত্রা ও পরিচর্যার ওপর।`,
  refund: `গ্রাহক সন্তুষ্টি আমাদের মূল লক্ষ্য। পণ্য গ্রহণে কোনো ত্রুটি পরিলক্ষিত হলে আমাদের রিটার্ন পলিসি প্রযোজ্য হবে:\n\n১. রিটার্ন গ্রহণের সময়: পার্সেল হাতে পাওয়ার পর ডেলিভারি ম্যানের সামনেই প্যাকেট চেক করুন।\n২. ভুল বা ক্ষতিগ্রস্ত পণ্য: ভুল বীজ বা ক্ষতিগ্রস্ত পার্সেল পেলে সাথে সাথে ডেলিভারি ম্যানকে ফেরত দিন অথবা আমাদের হেল্পলাইনে কল করুন।\n৩. রিফান্ড প্রক্রিয়া: কোনো কারণে রিটার্নকৃত পণ্যের রিফান্ড প্রযোজ্য হলে ৩ থেকে ৭ কর্মদিবসের মধ্যে বিকাশ/নগদে টাকা ফেরত দেওয়া হবে।\n৪. শর্তাবলী: ব্যবহৃত বা কাস্টমার দ্বারা ক্ষতিগ্রস্ত পণ্যের ক্ষেত্রে রিটার্ন বা রিফান্ড প্রযোজ্য হবে না।`,
  shipping: `Ss Seed Shop সারা বাংলাদেশে বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে হোম ডেলিভারি সুবিধা প্রদান করে:\n\n১. ডেলিভারি চার্জ: ঢাকা শহরের ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকার বাইরে ১৫০ টাকা (অথবা নির্ধারিত ডেলিভারি ফি)।\n২. ডেলিভারি সময়: অর্ডার কনফার্ম হওয়ার পর সাধারণত ২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।\n৩. ট্র্যাকিং ও আপডেট: অর্ডার শিপ হওয়ার পর এসএমএস বা হোয়াটসঅ্যাপে ডেলিভারি আপডেট জানানো হবে।\n৪. ক্যাশ অন ডেলিভারি: কুরিয়ার ম্যানের থেকে পণ্য হাতে পেয়ে মূল্য পরিশোধ করার সুবিধা রয়েছে।`,
};

// Default SEO Settings
export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle: 'Ss Seed Shop - মানসম্মত বীজ ও কৃষি সরঞ্জামের নির্ভরযোগ্য শপ',
  keywords: 'বীজ, হাইব্রিড বীজ, ফুলের বীজ, সবজির বীজ, বীজ দোকান, Ss Seed Shop, ssseedshop, gardening seeds Bangladesh',
  description: 'সারা বাংলাদেশে প্রিমিয়াম কোয়ালিটির সবজি, ফুল, ফল ও অর্গানিক বীজ হোম ডেলিভারি পেতে Ss Seed Shop থেকে অর্ডার করুন।',
  googleVerification: '',
  facebookPixel: '',
  ogImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1000',
};

export const DEFAULT_CULTIVATION_GUIDE = `১ - হালকা রোদে রাখুন
বীজগুলো মাত্র ২-৫ মিনিট হালকা রোদ বা বাতাসে রাখুন।
কড়া রোদে দিলে অঙ্কুরোদগম ক্ষমতা নষ্ট হতে পারে।

২ - পানিতে ভিজিয়ে রাখুন
৮-১০ ঘণ্টা স্বাভাবিক পানিতে ভিজিয়ে রাখুন।

৩ - বীজতলায় বপন
জৈব সার মিশ্রিত ঝুরঝুরে মাটিতে তৈরি বীজতলায় বীজগুলো ছিটিয়ে দিন।

৪- হালকা ঢেকে স্প্রে করুন
একদম হালকা মাটি দিয়ে ঢেকে দিন এবং স্প্রে বোতল দিয়ে পানি দিন।
মাটি সামান্য ভেজা রাখুন, কিন্তু পানি যেন জমে না থাকে।

৫- মূল টবে চারা স্থানান্তর
চারা ৩-৪ ইঞ্চি বড় হলে মূল টবে বা জমিতে সাবধানে স্থানান্তর করুন।`;

// Default Store Settings
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'Ss Seed Shop',
  tagline: 'মানসম্মত ও খাঁটি বীজ সরবরাহকারী',
  logo: '',
  favicon: '',
  hours: 'সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)',
  address: 'ঢাকা, বাংলাদেশ',
  phone: '01410136900',
  hotline: '01915957187',
  email: 'support@ssseedshop.com',
  currency: 'BDT',
  language: 'bn',
  loginEnabled: false,
  reviewEnabled: true,
  whatsappFloatEnabled: true,
  cultivationGuideEnabled: true,
  cultivationGuideTitle: 'চাষ পদ্ধতি',
  defaultCultivationGuide: DEFAULT_CULTIVATION_GUIDE,
  invoiceSubtitle: 'প্রিমিয়াম বীজ ও কৃষি উপকরণ সমাহার',
  invoiceNote: '• বীজ রোপণের পূর্বে প্যাকেটের গায়ে দেওয়া নির্দেশিকা ভালোভাবে অনুসরণ করুন।',
  invoiceFooterMsg: 'Ss Seed Shop বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ!',
};

// Subscribe to real-time homepage settings from Firestore
export function subscribeToHomepageSettings(callback: (settings: HomepageSettings) => void) {
  const docRef = doc(db, 'settings', 'homepage');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          topBarEnabled: data.topBarEnabled !== undefined ? data.topBarEnabled === true : true,
          topBarPhone: data.topBarPhone || DEFAULT_HOMEPAGE_SETTINGS.topBarPhone,
          topBarHours: data.topBarHours || DEFAULT_HOMEPAGE_SETTINGS.topBarHours,
          topBarDelivery: data.topBarDelivery || DEFAULT_HOMEPAGE_SETTINGS.topBarDelivery,
          topBarGuarantee: data.topBarGuarantee || DEFAULT_HOMEPAGE_SETTINGS.topBarGuarantee,
          topBarTagline: data.topBarTagline || DEFAULT_HOMEPAGE_SETTINGS.topBarTagline,
          marqueeEnabled: data.marqueeEnabled !== undefined ? data.marqueeEnabled === true : true,
          marqueeText: data.marqueeText !== undefined ? data.marqueeText : DEFAULT_HOMEPAGE_SETTINGS.marqueeText,
          marqueeSpeed: data.marqueeSpeed || DEFAULT_HOMEPAGE_SETTINGS.marqueeSpeed,
          marqueeBgColor: data.marqueeBgColor || DEFAULT_HOMEPAGE_SETTINGS.marqueeBgColor,
          marqueeTextColor: data.marqueeTextColor || DEFAULT_HOMEPAGE_SETTINGS.marqueeTextColor,
          marqueeBadge: data.marqueeBadge || DEFAULT_HOMEPAGE_SETTINGS.marqueeBadge,
          marqueeLink: data.marqueeLink !== undefined ? data.marqueeLink : DEFAULT_HOMEPAGE_SETTINGS.marqueeLink,
          noticeText: data.noticeText !== undefined ? data.noticeText : DEFAULT_HOMEPAGE_SETTINGS.noticeText,
          noticeEnabled: data.noticeEnabled === true,
          heroHeading: data.heroHeading || '',
          heroSubheading: data.heroSubheading || '',
          heroBannerImage: data.heroBannerImage || '',
          heroMobileBannerImage: data.heroMobileBannerImage || '',
          ctaText: data.ctaText || '',
          ctaLink: data.ctaLink || '#products',
          showCategories: data.showCategories !== false,
          showPromoBanner: data.showPromoBanner === true,
          showLeaderboard: data.showLeaderboard !== false,
          leaderboardTitle: data.leaderboardTitle || DEFAULT_HOMEPAGE_SETTINGS.leaderboardTitle,
          leaderboardSubtitle: data.leaderboardSubtitle || DEFAULT_HOMEPAGE_SETTINGS.leaderboardSubtitle,
          leaderboardBadge: data.leaderboardBadge || DEFAULT_HOMEPAGE_SETTINGS.leaderboardBadge,
          leaderboardType: data.leaderboardType || DEFAULT_HOMEPAGE_SETTINGS.leaderboardType,
          leaderboardMode: data.leaderboardMode || DEFAULT_HOMEPAGE_SETTINGS.leaderboardMode,
          leaderboardHideIfEmpty: data.leaderboardHideIfEmpty !== undefined ? data.leaderboardHideIfEmpty === true : true,
          leaderboardCustomUsers: (() => {
            if (Array.isArray(data.leaderboardCustomUsers)) return data.leaderboardCustomUsers;
            if (typeof data.leaderboardCustomJson === 'string' && data.leaderboardCustomJson.trim()) {
              try { return JSON.parse(data.leaderboardCustomJson); } catch { return []; }
            }
            return [];
          })(),
          showBlogTips: data.showBlogTips === true,
          showTrustSection: data.showTrustSection !== false,
          promoTitle: data.promoTitle || DEFAULT_HOMEPAGE_SETTINGS.promoTitle,
          promoSubtext: data.promoSubtext || DEFAULT_HOMEPAGE_SETTINGS.promoSubtext,
          promoButtonText: data.promoButtonText || DEFAULT_HOMEPAGE_SETTINGS.promoButtonText,
          promoCouponCode: data.promoCouponCode || DEFAULT_HOMEPAGE_SETTINGS.promoCouponCode,
        });
      } else {
        callback(DEFAULT_HOMEPAGE_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to homepage settings from Firestore:', error);
      callback(DEFAULT_HOMEPAGE_SETTINGS);
    }
  );
}

// Subscribe to real-time footer settings from Firestore
export function subscribeToFooterSettings(callback: (settings: FooterSettings) => void) {
  const docRef = doc(db, 'settings', 'footer');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let brandName = data.brandName;
        if (!brandName || brandName.includes('বিচিত্রা') || brandName.toLowerCase().includes('bichitra') || brandName.toLowerCase().includes('seed haven')) {
          brandName = 'Ss Seed Shop';
        }

        let copyright = data.copyright;
        if (copyright && (copyright.includes('বিচিত্রা') || copyright.includes('Seed Haven') || copyright.includes('seed haven'))) {
          copyright = copyright.replace(/বীজ\s*বিচিত্রা/g, 'Ss Seed Shop').replace(/Seed\s*Haven(\s*BD)?/gi, 'Ss Seed Shop');
        }

        let bio = data.bio;
        if (bio && (bio.includes('বিচিত্রা') || bio.includes('Seed Haven') || bio.includes('seed haven'))) {
          bio = bio.replace(/বীজ\s*বিচিত্রা/g, 'Ss Seed Shop').replace(/Seed\s*Haven(\s*BD)?/gi, 'Ss Seed Shop');
        }

        callback({
          ...DEFAULT_FOOTER_SETTINGS,
          ...data,
          brandName,
          copyright: copyright || DEFAULT_FOOTER_SETTINGS.copyright,
          bio: bio || DEFAULT_FOOTER_SETTINGS.bio,
          footerEnabled: data.footerEnabled !== false,
          showFaq: data.showFaq !== false,
        });
      } else {
        callback(DEFAULT_FOOTER_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to footer settings from Firestore:', error);
      callback(DEFAULT_FOOTER_SETTINGS);
    }
  );
}

// Subscribe to real-time delivery settings from Firestore
export function subscribeToDeliverySettings(callback: (settings: DeliverySettings) => void) {
  const docRef = doc(db, 'settings', 'delivery');
  const defaultDelivery: DeliverySettings = {
    insideCharge: 55,
    outsideCharge: 55,
    freeMinimum: 1000,
    deliveryNote: 'সারা বাংলাদেশে মাত্র ৫৫ টাকায় ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি।',
    deliveryChargeEnabled: true,
  };

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          insideCharge: typeof data.insideCharge === 'number' ? data.insideCharge : 55,
          outsideCharge: typeof data.outsideCharge === 'number' ? data.outsideCharge : 55,
          freeMinimum: typeof data.freeMinimum === 'number' ? data.freeMinimum : 1000,
          deliveryNote: data.deliveryNote || defaultDelivery.deliveryNote,
          deliveryChargeEnabled: typeof data.deliveryChargeEnabled === 'boolean' ? data.deliveryChargeEnabled : true,
        });
      } else {
        callback(defaultDelivery);
      }
    },
    (error) => {
      console.error('Error listening to delivery settings from Firestore:', error);
      callback(defaultDelivery);
    }
  );
}

// Subscribe to custom shipping zones from Firestore
export function subscribeToShippingZones(callback: (zones: ShippingZone[]) => void) {
  const colRef = collection(db, 'shippingZones');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const zonesList: ShippingZone[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ShippingZone, 'id'>),
      }));
      callback(zonesList);
    },
    (error: any) => {
      if (error?.code !== 'permission-denied') {
        console.error('Error listening to shipping zones from Firestore:', error);
      }
      callback([]);
    }
  );
}

// Subscribe to real-time payment settings from Firestore
export function subscribeToPaymentSettings(callback: (settings: PaymentSettings) => void) {
  const docRef = doc(db, 'settings', 'payment');
  const defaultPayment: PaymentSettings = {
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
  };

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          codEnabled: data.codEnabled !== false,
          bkashEnabled: data.bkashEnabled === true,
          bkashNumber: data.bkashNumber || defaultPayment.bkashNumber,
          bkashType: data.bkashType || defaultPayment.bkashType,
          nagadEnabled: data.nagadEnabled === true,
          nagadNumber: data.nagadNumber || defaultPayment.nagadNumber,
          nagadType: data.nagadType || defaultPayment.nagadType,
          rocketEnabled: data.rocketEnabled === true,
          rocketNumber: data.rocketNumber || defaultPayment.rocketNumber,
          rocketType: data.rocketType || defaultPayment.rocketType,
          instruction: data.instruction || defaultPayment.instruction,
        });
      } else {
        callback(defaultPayment);
      }
    },
    (error) => {
      console.error('Error listening to payment settings from Firestore:', error);
      callback(defaultPayment);
    }
  );
}

// Subscribe to real-time notice & popup settings from Firestore
export function subscribeToNoticeSettings(callback: (settings: NoticeSettings) => void) {
  const docRef = doc(db, 'settings', 'notice');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          noticeText: data.noticeText !== undefined ? data.noticeText : DEFAULT_NOTICE_SETTINGS.noticeText,
          noticeLink: data.noticeLink || '',
          noticeEnabled: data.noticeEnabled === true,
          popupHeading: data.popupHeading || DEFAULT_NOTICE_SETTINGS.popupHeading,
          popupSubheading: data.popupSubheading || DEFAULT_NOTICE_SETTINGS.popupSubheading,
          popupImage: data.popupImage || '',
          popupButton: data.popupButton || DEFAULT_NOTICE_SETTINGS.popupButton,
          popupLink: data.popupLink || DEFAULT_NOTICE_SETTINGS.popupLink,
          popupEnabled: data.popupEnabled === true,
        });
      } else {
        callback(DEFAULT_NOTICE_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to notice settings from Firestore:', error);
      callback(DEFAULT_NOTICE_SETTINGS);
    }
  );
}

// Subscribe to real-time contact & social settings from Firestore
export function subscribeToContactSettings(callback: (settings: ContactSettings) => void) {
  const docRef = doc(db, 'settings', 'contact');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          hotline: data.hotline !== undefined && data.hotline !== '' ? data.hotline : DEFAULT_CONTACT_SETTINGS.hotline,
          phone: data.phone !== undefined && data.phone !== '' ? data.phone : DEFAULT_CONTACT_SETTINGS.phone,
          whatsapp: data.whatsapp !== undefined && data.whatsapp !== '' ? data.whatsapp : DEFAULT_CONTACT_SETTINGS.whatsapp,
          email: data.email !== undefined && data.email !== '' ? data.email : DEFAULT_CONTACT_SETTINGS.email,
          address: data.address !== undefined && data.address !== '' ? data.address : DEFAULT_CONTACT_SETTINGS.address,
          facebook: data.facebook !== undefined ? data.facebook : DEFAULT_CONTACT_SETTINGS.facebook,
          instagram: data.instagram !== undefined ? data.instagram : DEFAULT_CONTACT_SETTINGS.instagram,
          youtube: data.youtube !== undefined ? data.youtube : DEFAULT_CONTACT_SETTINGS.youtube,
          tiktok: data.tiktok !== undefined ? data.tiktok : DEFAULT_CONTACT_SETTINGS.tiktok,
          tagline: data.tagline !== undefined && data.tagline !== '' ? data.tagline : DEFAULT_CONTACT_SETTINGS.tagline,
          aboutTitle: data.aboutTitle !== undefined && data.aboutTitle !== '' ? data.aboutTitle : DEFAULT_CONTACT_SETTINGS.aboutTitle,
          aboutDescription: data.aboutDescription !== undefined && data.aboutDescription !== '' ? data.aboutDescription : DEFAULT_CONTACT_SETTINGS.aboutDescription,
          aboutPerk1Title: data.aboutPerk1Title !== undefined && data.aboutPerk1Title !== '' ? data.aboutPerk1Title : DEFAULT_CONTACT_SETTINGS.aboutPerk1Title,
          aboutPerk1Desc: data.aboutPerk1Desc !== undefined && data.aboutPerk1Desc !== '' ? data.aboutPerk1Desc : DEFAULT_CONTACT_SETTINGS.aboutPerk1Desc,
          aboutPerk2Title: data.aboutPerk2Title !== undefined && data.aboutPerk2Title !== '' ? data.aboutPerk2Title : DEFAULT_CONTACT_SETTINGS.aboutPerk2Title,
          aboutPerk2Desc: data.aboutPerk2Desc !== undefined && data.aboutPerk2Desc !== '' ? data.aboutPerk2Desc : DEFAULT_CONTACT_SETTINGS.aboutPerk2Desc,
          showroomTitle: data.showroomTitle !== undefined && data.showroomTitle !== '' ? data.showroomTitle : DEFAULT_CONTACT_SETTINGS.showroomTitle,
        });
      } else {
        callback(DEFAULT_CONTACT_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to contact settings from Firestore:', error);
      callback(DEFAULT_CONTACT_SETTINGS);
    }
  );
}

// Subscribe to real-time policy settings from Firestore
export function subscribeToPolicySettings(callback: (settings: PolicySettings) => void) {
  const docRef = doc(db, 'settings', 'policies');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          privacy: data.privacy !== undefined ? data.privacy : DEFAULT_POLICY_SETTINGS.privacy,
          terms: data.terms !== undefined ? data.terms : DEFAULT_POLICY_SETTINGS.terms,
          refund: data.refund !== undefined ? data.refund : DEFAULT_POLICY_SETTINGS.refund,
          shipping: data.shipping !== undefined ? data.shipping : DEFAULT_POLICY_SETTINGS.shipping,
        });
      } else {
        callback(DEFAULT_POLICY_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to policy settings from Firestore:', error);
      callback(DEFAULT_POLICY_SETTINGS);
    }
  );
}

// Subscribe to real-time SEO settings from Firestore
export function subscribeToSeoSettings(callback: (settings: SeoSettings) => void) {
  const docRef = doc(db, 'settings', 'seo');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          siteTitle: data.siteTitle !== undefined ? data.siteTitle : DEFAULT_SEO_SETTINGS.siteTitle,
          keywords: data.keywords !== undefined ? data.keywords : DEFAULT_SEO_SETTINGS.keywords,
          description: data.description !== undefined ? data.description : DEFAULT_SEO_SETTINGS.description,
          googleVerification: data.googleVerification !== undefined ? data.googleVerification : DEFAULT_SEO_SETTINGS.googleVerification,
          facebookPixel: data.facebookPixel !== undefined ? data.facebookPixel : DEFAULT_SEO_SETTINGS.facebookPixel,
          ogImage: data.ogImage !== undefined ? data.ogImage : DEFAULT_SEO_SETTINGS.ogImage,
        });
      } else {
        callback(DEFAULT_SEO_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to SEO settings from Firestore:', error);
      callback(DEFAULT_SEO_SETTINGS);
    }
  );
}

export async function saveSeoSettings(settings: Partial<SeoSettings>) {
  try {
    const docRef = doc(db, 'settings', 'seo');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save SEO settings:', err);
    throw err;
  }
}

// Subscribe to real-time store settings from Firestore
export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void) {
  const docRef = doc(db, 'settings', 'store');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          name: data.name !== undefined ? data.name : DEFAULT_STORE_SETTINGS.name,
          tagline: data.tagline !== undefined ? data.tagline : DEFAULT_STORE_SETTINGS.tagline,
          logo: data.logo !== undefined ? data.logo : DEFAULT_STORE_SETTINGS.logo,
          favicon: data.favicon !== undefined ? data.favicon : DEFAULT_STORE_SETTINGS.favicon,
          hours: data.hours !== undefined ? data.hours : DEFAULT_STORE_SETTINGS.hours,
          address: data.address !== undefined ? data.address : '',
          phone: data.phone !== undefined ? data.phone : '',
          hotline: data.hotline !== undefined ? data.hotline : '',
          email: data.email !== undefined ? data.email : '',
          currency: data.currency !== undefined ? data.currency : DEFAULT_STORE_SETTINGS.currency,
          language: data.language !== undefined ? data.language : DEFAULT_STORE_SETTINGS.language,
          loginEnabled: data.loginEnabled !== false,
          reviewEnabled: data.reviewEnabled !== false,
          whatsappFloatEnabled: data.whatsappFloatEnabled !== false,
          cultivationGuideEnabled: data.cultivationGuideEnabled !== false,
          cultivationGuideTitle: data.cultivationGuideTitle || DEFAULT_STORE_SETTINGS.cultivationGuideTitle,
          defaultCultivationGuide: data.defaultCultivationGuide !== undefined ? data.defaultCultivationGuide : DEFAULT_CULTIVATION_GUIDE,
          invoiceSubtitle: data.invoiceSubtitle !== undefined ? data.invoiceSubtitle : '',
          invoiceNote: data.invoiceNote !== undefined ? data.invoiceNote : '',
          invoiceFooterMsg: data.invoiceFooterMsg !== undefined ? data.invoiceFooterMsg : '',
        });
      } else {
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to store settings from Firestore:', error);
      callback(DEFAULT_STORE_SETTINGS);
    }
  );
}

// Save Store Settings to Firestore
export async function saveStoreSettings(settings: Partial<StoreSettings>) {
  try {
    const docRef = doc(db, 'settings', 'store');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save store settings:', err);
    throw err;
  }
}

// Subscribe to real-time menu drawer settings from Firestore
export function subscribeToMenuSettings(callback: (settings: MenuSettings) => void) {
  const docRef = doc(db, 'settings', 'menu');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          bottomNavEnabled: data.bottomNavEnabled !== false,
          menuBarEnabled: data.menuBarEnabled !== false,
          headerMenuEnabled: data.headerMenuEnabled !== false,
          bottomNavMenuEnabled: false,
          menuOrderTrackerEnabled: data.menuOrderTrackerEnabled !== false,
          menuDeliveryChargeEnabled: data.menuDeliveryChargeEnabled !== false,
          menuOrderRulesEnabled: data.menuOrderRulesEnabled !== false,
          menuSearchEnabled: data.menuSearchEnabled !== false,
          menuHomeEnabled: data.menuHomeEnabled !== false,
          menuAllProductsEnabled: data.menuAllProductsEnabled !== false,
          menuCategoriesEnabled: data.menuCategoriesEnabled !== false,
          menuCartEnabled: data.menuCartEnabled !== false,
          menuWishlistEnabled: data.menuWishlistEnabled !== false,
          menuCompareEnabled: data.menuCompareEnabled !== false,
          menuAboutEnabled: data.menuAboutEnabled !== false,
          menuContactEnabled: data.menuContactEnabled !== false,
          menuPolicyEnabled: data.menuPolicyEnabled !== false,
          menuAdminLinkEnabled: data.menuAdminLinkEnabled !== false,
          menuHelplineEnabled: data.menuHelplineEnabled !== false,
        });
      } else {
        callback(DEFAULT_MENU_SETTINGS);
      }
    },
    (error) => {
      console.error('Error listening to menu settings from Firestore:', error);
      callback(DEFAULT_MENU_SETTINGS);
    }
  );
}
export function subscribeToCategories(callback: (categories: Category[]) => void) {
  const colRef = collection(db, CATEGORIES_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        callback(DEFAULT_CATEGORIES);
        return;
      }

      const categoriesList: Category[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        categoriesList.push({
          id: docSnap.id,
          name: data.name || '',
          iconEmoji: data.iconEmoji || '🌱',
          image: data.image || '',
          subtitle: data.subtitle || '',
          itemCount: Number(data.itemCount) || 0,
          description: data.description || '',
        });
      });

      callback(categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORIES);
    },
    (error) => {
      console.error('Error listening to categories from Firestore:', error);
      callback(DEFAULT_CATEGORIES);
    }
  );
}

// Add Category to Firestore
export async function addCategoryFirebase(category: Omit<Category, 'id'>) {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...category,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Delete Category from Firestore
export async function deleteCategoryFirebase(id: string) {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}

// Update Category in Firestore
export async function updateCategoryFirebase(id: string, data: Partial<Category>) {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, data);
}

// Subscribe to real-time products updates
export function subscribeToProducts(callback: (products: Product[]) => void) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const productsList: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        productsList.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'veg',
          price: Number(data.price || data.salePrice) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : (data.regularPrice ? Number(data.regularPrice) : undefined),
          cashback: data.cashback ? Number(data.cashback) : 0,
          stock: data.stock !== undefined ? Number(data.stock) : 50,
          rating: Number(data.rating) || 4.8,
          reviewsCount: Number(data.reviewsCount) || 10,
          imageEmoji: data.imageEmoji || '🌱',
          image: data.image || '',
          images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
          badgeTags: Array.isArray(data.badgeTags) ? data.badgeTags : [],
          description: data.description || '',
          germinationDays: data.germinationDays || '৫-৭ দিন',
          season: data.season || 'বারোমাসি',
          packSize: data.packSize || data.unit || '১ প্যাকেট',
          plantingTip: data.plantingTip || '',
          popular: Boolean(data.isPopular || data.popular),
          seedType: data.seedType || '',
          germinationRate: data.germinationRate || '',
          cultivationGuide: data.cultivationGuide !== undefined ? data.cultivationGuide : '',
          disableCultivationGuide: Boolean(data.disableCultivationGuide),
          disableReviews: Boolean(data.disableReviews),
          unit: data.unit || data.packSize || '',
          sku: data.sku || '',
          discount: Number(data.discount || 0),
          featured: Boolean(data.featured),
          active: data.active !== false,
        });
      });

      callback(productsList);
    },
    (error) => {
      console.error('Error listening to products from Firestore:', error);
      callback([]);
    }
  );
}

// Seed initial default products to Firestore if empty
export async function seedInitialProducts(initialList: Product[] = []) {
  try {
    for (const prod of initialList) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, {
        ...prod,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to seed initial products:', err);
  }
}

// Add a new product to Firestore
export async function addProductFirebase(product: Omit<Product, 'id'>) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...product,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Delete a product from Firestore
export async function deleteProductFirebase(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Update product in Firestore
export async function updateProductFirebase(id: string, data: Partial<Product>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, data);
}

// Helper to recursively strip undefined properties for Firestore safety
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

// Save order to Firestore
export async function saveOrderFirebase(order: OrderDetails) {
  const rawOrderData: Record<string, any> = {
    orderId: order.orderId || ('SS-' + Math.floor(100000 + Math.random() * 900000)),
    customerName: order.customerName || '',
    phone: order.phone || '',
    phone2: order.phone2 || '',
    address: order.address || '',
    district: order.district || '',
    thana: order.thana || '',
    union: order.union || '',
    village: order.village || '',
    landmark: order.landmark || '',
    note: order.note || (order as any).customerNote || '',
    items: order.items || [],
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    total: Number(order.total || 0),
    grandTotal: Number(order.total || 0),
    customer: {
      name: String(order.customerName || ''),
      phone: String(order.phone || ''),
    },
    paymentMethod: order.paymentMethod || 'cod',
    senderNumber: order.senderNumber || '',
    transactionId: order.transactionId || '',
    courierStatus: order.courierStatus || '',
    consignmentId: order.consignmentId || '',
    trackingCode: order.trackingCode || '',
    courierSubmittedAt: order.courierSubmittedAt || '',
    courierError: order.courierError || '',
  };

  const cleanOrder = sanitizeForFirestore(rawOrderData);

  // Send to API endpoint in background for instant backend backup & courier handling
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawOrderData),
    }).catch((e) => console.warn('API order backup sync notice:', e));
  } catch (e) {}

  cleanOrder.createdAt = serverTimestamp();

  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(colRef, cleanOrder);
    return docRef.id;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn('Firestore order save info:', err?.message || err);
    }
    // Attempt setDoc with explicit doc ID
    try {
      const docRef = doc(db, ORDERS_COLLECTION, cleanOrder.orderId);
      await setDoc(docRef, cleanOrder, { merge: true });
      return cleanOrder.orderId;
    } catch (setErr: any) {
      console.warn('Firestore setDoc info:', setErr?.message || setErr);
      // Local backup save so no customer order is ever lost
      try {
        const localOrders = JSON.parse(localStorage.getItem('ss_seed_shop_local_orders') || '[]');
        localOrders.unshift({ ...cleanOrder, createdAt: new Date().toISOString() });
        localStorage.setItem('ss_seed_shop_local_orders', JSON.stringify(localOrders));
      } catch {}
      return cleanOrder.orderId;
    }
  }
}

// Get all orders from Firestore
export async function getOrdersFirebase(): Promise<OrderDetails[]> {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const orders: OrderDetails[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      orders.push({
        ...data,
        orderId: docSnap.id,
      } as OrderDetails);
    });
    return orders;
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return [];
  }
}

// Delete single order from Firestore
export async function deleteOrderFirebase(orderId: string) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete order:', err);
    throw err;
  }
}

// Delete all orders from Firestore
export async function deleteAllOrdersFirebase() {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to delete all orders:', err);
    throw err;
  }
}

// Update order status in Firestore
export async function updateOrderStatusFirebase(orderId: string, status: string) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error('Failed to update order status:', err);
    throw err;
  }
}

// Subscribe to real-time banners from Firestore
export function subscribeToBanners(callback: (banners: Banner[]) => void) {
  const colRef = collection(db, 'banners');

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const bannersList: Banner[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.active !== false) {
          bannersList.push({
            id: docSnap.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            image: data.image || '',
            mobileImage: data.mobileImage || '',
            buttonText: data.buttonText || '',
            buttonLink: data.buttonLink || '',
            position: Number(data.position || 1),
            active: data.active !== false,
          });
        }
      });

      // Sort by position ascending
      bannersList.sort((a, b) => (a.position || 1) - (b.position || 1));

      callback(bannersList);
    },
    (error) => {
      console.error('Error listening to banners from Firestore:', error);
      callback([]);
    }
  );
}

// Subscribe to real-time reviews from Firestore (Optionally filtered for approved)
export function subscribeToReviews(callback: (reviews: Review[]) => void, approvedOnly = true) {
  const colRef = collection(db, 'reviews');

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const reviewsList: Review[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const status = data.status || 'approved';
        if (!approvedOnly || status === 'approved') {
          reviewsList.push({
            id: docSnap.id,
            customerName: data.customerName || 'অনামী কাস্টমার',
            productName: data.productName || data.productId || '',
            productId: data.productId || '',
            rating: Number(data.rating || 5),
            comment: data.comment || data.review || '',
            status: status as any,
            avatar: data.avatar || '',
            imageUrl: data.imageUrl || '',
            createdAt: data.createdAt,
          });
        }
      });

      callback(reviewsList);
    },
    (error) => {
      console.error('Error listening to reviews from Firestore:', error);
      callback([]);
    }
  );
}

// Submit a new customer review to Firestore
export async function submitCustomerReview(reviewData: {
  customerName: string;
  productName?: string;
  productId?: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  customerPhoto?: string;
}) {
  try {
    const colRef = collection(db, 'reviews');
    await addDoc(colRef, {
      ...reviewData,
      status: 'approved',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to submit review:', err);
    throw err;
  }
}

// Subscribe to real-time coupons from Firestore
export function subscribeToCoupons(callback: (coupons: Coupon[]) => void) {
  const colRef = collection(db, 'coupons');

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const couponsList: Coupon[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.active !== false) {
          couponsList.push({
            id: docSnap.id,
            code: (data.code || '').toString().trim().toUpperCase(),
            type: data.type === 'fixed' ? 'fixed' : 'percent',
            value: Number(data.value || 0),
            minimum: Number(data.minimum || 0),
            max: Number(data.max || 0),
            expiry: data.expiry || '',
            limit: Number(data.limit || 0),
            active: data.active !== false,
          });
        }
      });

      callback(couponsList);
    },
    (error) => {
      console.error('Error listening to coupons from Firestore:', error);
      callback([]);
    }
  );
}

// Save customer inquiry to Firestore
export async function addInquiry(inquiry: {
  name: string;
  phone: string;
  message: string;
}) {
  try {
    const colRef = collection(db, 'inquiries');
    await addDoc(colRef, {
      ...inquiry,
      createdAt: serverTimestamp(),
      status: 'unread',
    });
    return true;
  } catch (error) {
    console.error('Error saving inquiry:', error);
    return false;
  }
}

// Subscribe to real-time orders from Firestore
export function subscribeToOrders(callback: (orders: OrderDetails[]) => void) {
  const colRef = collection(db, ORDERS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const ordersList: OrderDetails[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let createdAtFormatted = '';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAtFormatted = data.createdAt.toDate().toLocaleString('bn-BD');
        } else {
          createdAtFormatted = 'সম্প্রতি';
        }

        ordersList.push({
          orderId: data.orderId || docSnap.id,
          customerName: data.customerName || '',
          phone: data.phone || '',
          address: data.address || '',
          district: data.district || '',
          items: data.items || [],
          subtotal: Number(data.subtotal || 0),
          discount: Number(data.discount || 0),
          deliveryFee: Number(data.deliveryFee || 0),
          total: Number(data.total || 0),
          paymentMethod: data.paymentMethod || 'cod',
          senderNumber: data.senderNumber || '',
          transactionId: data.transactionId || '',
          status: data.status || 'প্রক্রিয়াধীন',
          createdAt: createdAtFormatted,
        } as OrderDetails);
      });

      callback(ordersList);
    },
    (error) => {
      console.error('Error listening to orders from Firestore:', error);
      callback([]);
    }
  );
}

// Record daily visitor
export async function recordVisitor() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionKey = `visited_${todayStr}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, 'true');
    const docRef = doc(db, 'visitors', todayStr);
    await setDoc(docRef, {
      date: todayStr,
      count: increment(1),
      lastVisit: serverTimestamp()
    }, { merge: true });
  } catch (e: any) {
    if (e?.code !== 'permission-denied') {
      console.warn('Visitor record notice:', e?.message || e);
    }
  }
}

// Subscribe to visitors
export function subscribeToVisitors(callback: (visitors: { date: string; count: number }[]) => void) {
  const colRef = collection(db, 'visitors');
  return onSnapshot(colRef, (snapshot) => {
    const list: { date: string; count: number }[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        date: docSnap.id,
        count: Number(data.count || 0)
      });
    });
    list.sort((a, b) => b.date.localeCompare(a.date));
    callback(list);
  }, (err) => {
    console.error('Error listening to visitors:', err);
    callback([]);
  });
}

// Save newsletter subscription to Firestore
export async function addNewsletterSubscription(email: string) {
  try {
    const colRef = collection(db, 'newsletterSubscriptions');
    await addDoc(colRef, {
      email,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error saving newsletter subscription:', error);
    return false;
  }
}

// Save product rating to Firestore
export async function saveProductRatingFirebase(productId: string, rating: number, userId?: string) {
  try {
    const docId = userId ? `${productId}_${userId}` : `${productId}_default`;
    const docRef = doc(db, 'productRatings', docId);
    await setDoc(docRef, {
      productId,
      rating: Number(rating),
      userId: userId || 'anonymous',
      createdAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving product rating:', error);
    return false;
  }
}

// Subscribe to product ratings from Firestore
export function subscribeToProductRatings(callback: (ratingsMap: Record<string, number>) => void) {
  const colRef = collection(db, 'productRatings');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const ratingsMap: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.productId && data.rating) {
          ratingsMap[data.productId] = Number(data.rating);
        }
      });
      callback(ratingsMap);
    },
    (error: any) => {
      if (error?.code !== 'permission-denied') {
        console.error('Error listening to product ratings:', error);
      }
      callback({});
    }
  );
}

// Integrations Management System Subscriptions
export function subscribeToIntegrationsSettings(callback: (settings: any) => void) {
  const docRef = doc(db, 'settings', 'integrations');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to integrations settings:', error);
      callback(null);
    }
  );
}

export async function saveIntegrationsSettingsFirebase(settingsData: any) {
  try {
    const docRef = doc(db, 'settings', 'integrations');
    await setDoc(docRef, {
      ...settingsData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving integrations settings:', error);
    return false;
  }
}


