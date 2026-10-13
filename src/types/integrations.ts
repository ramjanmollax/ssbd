/**
 * Types & Schema for the Integrations Management System
 * Stored persistently in Firebase Firestore under settings/integrations
 */

export interface GoogleServicesConfig {
  // Google Search Console
  searchConsoleEnabled?: boolean;
  searchConsoleVerificationCode?: string; // HTML meta tag or verification string
  searchConsoleStatus?: 'connected' | 'unverified' | 'action_required';

  // Google Analytics 4
  ga4Enabled?: boolean;
  ga4MeasurementId?: string; // e.g. G-XXXXXXXXXX

  // Google Tag Manager
  gtmEnabled?: boolean;
  gtmContainerId?: string; // e.g. GTM-XXXXXXX

  // Google Business Profile
  businessProfileEnabled?: boolean;
  businessProfileUrl?: string; // Map or Profile link
  businessProfileName?: string;

  // Google Merchant Center
  merchantCenterEnabled?: boolean;
  merchantCenterId?: string;
  merchantCenterFeedUrl?: string;

  // Google Ads
  googleAdsEnabled?: boolean;
  googleAdsConversionId?: string; // e.g. AW-XXXXXXXXX
  googleAdsConversionLabel?: string;
}

export interface MetaServicesConfig {
  // Meta Pixel
  pixelEnabled?: boolean;
  pixelId?: string; // e.g. 123456789012345
  trackPageView?: boolean;
  trackViewContent?: boolean;
  trackAddToCart?: boolean;
  trackInitiateCheckout?: boolean;
  trackPurchase?: boolean;
  trackLead?: boolean;

  // Meta Conversions API (CAPI)
  capiEnabled?: boolean;
  capiDatasetId?: string; // Pixel or Dataset ID
  capiAccessToken?: string; // Secure token (saved on server, never rendered raw)
  capiTestEventCode?: string; // Optional test event code

  // Meta Domain Verification
  domainVerificationEnabled?: boolean;
  domainVerificationCode?: string; // meta-tag content or DNS token

  // Facebook Open Graph
  ogEnabled?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

export interface SearchAndSeoConfig {
  // Bing Webmaster Tools
  bingEnabled?: boolean;
  bingVerificationCode?: string;

  // Microsoft Clarity
  clarityEnabled?: boolean;
  clarityProjectId?: string;

  // Sitemap.xml
  sitemapEnabled?: boolean;
  sitemapUrl?: string;
  sitemapAutoGenerate?: boolean;
  sitemapCustomXml?: string;

  // Robots.txt
  robotsTxtEnabled?: boolean;
  robotsTxtContent?: string;

  // Schema Markup
  schemaEnabled?: boolean;
  schemaOrganizationName?: string;
  schemaLogoUrl?: string;
  schemaAddress?: string;
  schemaPhone?: string;
  schemaSocialLinks?: string[]; // JSON array or comma separated
  schemaIncludeProducts?: boolean;
  schemaIncludeBreadcrumbs?: boolean;
  canonicalBaseUrl?: string;
}

export interface OtherAdPlatformsConfig {
  // TikTok Pixel
  tiktokPixelEnabled?: boolean;
  tiktokPixelId?: string;
  tiktokTrackEvents?: boolean;

  // Pinterest Tag
  pinterestTagEnabled?: boolean;
  pinterestTagId?: string;
  pinterestTrackEvents?: boolean;
}

export interface SecurityPerformanceConfig {
  // Cloudflare
  cloudflareEnabled?: boolean;
  cloudflareZoneId?: string;
  cloudflareApiToken?: string;
  cloudflareDomain?: string;
  cloudflareProxyStatus?: 'active' | 'pending' | 'disabled';

  // Cloudflare Turnstile / Google reCAPTCHA
  captchaEnabled?: boolean;
  captchaProvider?: 'turnstile' | 'recaptcha_v2' | 'recaptcha_v3';
  captchaSiteKey?: string;
  captchaSecretKey?: string;
  captchaApplyOnCheckout?: boolean;
  captchaApplyOnContact?: boolean;
  captchaApplyOnLogin?: boolean;
}

export interface CustomerCommunicationConfig {
  // WhatsApp Business
  whatsappEnabled?: boolean;
  whatsappNumber?: string; // e.g. +8801410136900
  whatsappChatButton?: boolean;
  whatsappDefaultMessage?: string;
  whatsappPosition?: 'bottom-right' | 'bottom-left';
  whatsappApiKey?: string;
}

export interface IntegrationsSettings {
  google?: GoogleServicesConfig;
  meta?: MetaServicesConfig;
  seo?: SearchAndSeoConfig;
  advertising?: OtherAdPlatformsConfig;
  security?: SecurityPerformanceConfig;
  communication?: CustomerCommunicationConfig;
  updatedAt?: any;
  lastUpdatedBy?: string;
}

export const DEFAULT_INTEGRATIONS_SETTINGS: IntegrationsSettings = {
  google: {
    searchConsoleEnabled: false,
    searchConsoleVerificationCode: '',
    ga4Enabled: false,
    ga4MeasurementId: '',
    gtmEnabled: false,
    gtmContainerId: '',
    businessProfileEnabled: false,
    businessProfileUrl: '',
    merchantCenterEnabled: false,
    merchantCenterId: '',
    googleAdsEnabled: false,
    googleAdsConversionId: '',
    googleAdsConversionLabel: '',
  },
  meta: {
    pixelEnabled: false,
    pixelId: '',
    trackPageView: true,
    trackViewContent: true,
    trackAddToCart: true,
    trackInitiateCheckout: true,
    trackPurchase: true,
    trackLead: true,
    capiEnabled: false,
    capiDatasetId: '',
    capiAccessToken: '',
    domainVerificationEnabled: false,
    domainVerificationCode: '',
    ogEnabled: true,
    ogTitle: 'Ss Seed Shop - প্রিমিয়াম বীজ ও গার্ডেন শপ',
    ogDescription: 'সারা বাংলাদেশে প্রিমিয়াম কোয়ালিটির সবজি, ফুল, ফল ও অর্গানিক বীজ হোম ডেলিভারি পেতে Ss Seed Shop থেকে অর্ডার করুন.',
    ogImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1000',
    ogType: 'website',
  },
  seo: {
    bingEnabled: false,
    bingVerificationCode: '',
    clarityEnabled: false,
    clarityProjectId: '',
    sitemapEnabled: true,
    sitemapUrl: '/sitemap.xml',
    sitemapAutoGenerate: true,
    robotsTxtEnabled: true,
    robotsTxtContent: `User-agent: *\nAllow: /\n\nSitemap: https://ssseedshop.vercel.app/sitemap.xml`,
    schemaEnabled: true,
    schemaOrganizationName: 'Ss Seed Shop',
    schemaLogoUrl: '',
    schemaAddress: 'দেবীগঞ্জ, পঞ্চগড়, বাংলাদেশ',
    schemaPhone: '01410136900',
    schemaIncludeProducts: true,
    schemaIncludeBreadcrumbs: true,
    canonicalBaseUrl: 'https://ssseedshop.vercel.app',
  },
  advertising: {
    tiktokPixelEnabled: false,
    tiktokPixelId: '',
    tiktokTrackEvents: true,
    pinterestTagEnabled: false,
    pinterestTagId: '',
    pinterestTrackEvents: true,
  },
  security: {
    cloudflareEnabled: false,
    cloudflareDomain: 'ssseedshop.vercel.app',
    cloudflareProxyStatus: 'active',
    captchaEnabled: false,
    captchaProvider: 'turnstile',
    captchaSiteKey: '',
    captchaSecretKey: '',
    captchaApplyOnCheckout: true,
    captchaApplyOnContact: true,
    captchaApplyOnLogin: true,
  },
  communication: {
    whatsappEnabled: true,
    whatsappNumber: '01410136900',
    whatsappChatButton: true,
    whatsappDefaultMessage: 'আসসালামু আলাইকুম! Ss Seed Shop থেকে বীজ অর্ডার করতে চাই।',
    whatsappPosition: 'bottom-right',
  },
};
