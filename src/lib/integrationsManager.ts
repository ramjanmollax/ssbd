/**
 * Integration Tracker Manager
 * Safely loads enabled tracking scripts (GA4, GTM, Meta Pixel, Clarity, TikTok, Pinterest, Schema, WhatsApp, Meta Domain Verification)
 * Strictly prevents duplicate script tags and enforces independent on/off controls.
 */

import { IntegrationsSettings } from '../types/integrations';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    pintrk?: any;
    clarity?: (...args: any[]) => void;
  }
}

// Track loaded scripts to prevent duplicate injection
const loadedScriptIds = new Set<string>();

/**
 * Remove script by ID if exists
 */
function removeScript(id: string) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
    loadedScriptIds.delete(id);
  }
}

/**
 * Inject script tag safely
 */
function injectScript(id: string, src?: string, inlineCode?: string, async = true): Promise<void> {
  return new Promise((resolve) => {
    if (loadedScriptIds.has(id) || document.getElementById(id)) {
      return resolve();
    }
    const script = document.createElement('script');
    script.id = id;
    script.async = async;
    if (src) {
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => resolve();
    }
    if (inlineCode) {
      script.textContent = inlineCode;
      resolve();
    }
    document.head.appendChild(script);
  });
}

/**
 * Set or remove meta tag safely
 */
function syncMetaTag(attrName: 'name' | 'property', attrValue: string, content?: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sync Canonical URL tag
 */
export function syncCanonicalUrl(canonicalBase: string, currentPath: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalBase) {
    if (link) link.remove();
    return;
  }
  const cleanBase = canonicalBase.replace(/\/+$/, '');
  const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  const fullUrl = `${cleanBase}${cleanPath === '/' ? '' : cleanPath}`;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = fullUrl;
}

/**
 * Sync Schema.org JSON-LD Structured Data
 */
export function syncSchemaMarkup(config?: IntegrationsSettings['seo'], products?: any[]) {
  const SCRIPT_ID = 'ssseedshop-schema-jsonld';
  if (!config?.schemaEnabled) {
    removeScript(SCRIPT_ID);
    return;
  }

  const base = config.canonicalBaseUrl || 'https://ssseedshop.vercel.app';
  const orgName = config.schemaOrganizationName || 'Ss Seed Shop';

  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: orgName,
      url: base,
      logo: config.schemaLogoUrl || `${base}/logo.png`,
      telephone: config.schemaPhone || '+8801410136900',
      email: 'ssseedshop@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.schemaAddress || 'Debiganj, Panchagarh',
        addressCountry: 'BD',
      },
      sameAs: Array.isArray(config.schemaSocialLinks) ? config.schemaSocialLinks : [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: orgName,
      url: base,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${base}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  if (config.schemaIncludeBreadcrumbs) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: base,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${base}/products`,
        },
      ],
    });
  }

  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = SCRIPT_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schemas);
}

/**
 * Initialize all external client integrations
 */
export function applyClientIntegrations(settings?: IntegrationsSettings) {
  if (!settings) return;

  // 1. Google Search Console Verification Meta
  const gsc = settings.google;
  if (gsc?.searchConsoleEnabled && gsc.searchConsoleVerificationCode) {
    const code = gsc.searchConsoleVerificationCode.trim();
    // If user entered full meta tag or content string
    const match = code.match(/content=["']([^"']+)["']/i);
    const content = match ? match[1] : code;
    syncMetaTag('name', 'google-site-verification', content);
  } else {
    syncMetaTag('name', 'google-site-verification', '');
  }

  // 2. Bing Webmaster Tools Verification Meta
  const seo = settings.seo;
  if (seo?.bingEnabled && seo.bingVerificationCode) {
    const code = seo.bingVerificationCode.trim();
    const match = code.match(/content=["']([^"']+)["']/i);
    const content = match ? match[1] : code;
    syncMetaTag('name', 'msvalidate.01', content);
  } else {
    syncMetaTag('name', 'msvalidate.01', '');
  }

  // 3. Meta / Facebook Domain Verification Meta
  const meta = settings.meta;
  if (meta?.domainVerificationEnabled && meta.domainVerificationCode) {
    const code = meta.domainVerificationCode.trim();
    const match = code.match(/content=["']([^"']+)["']/i);
    const content = match ? match[1] : code;
    syncMetaTag('name', 'facebook-domain-verification', content);
  } else {
    syncMetaTag('name', 'facebook-domain-verification', '');
  }

  // 4. Open Graph Defaults
  if (meta?.ogEnabled) {
    if (meta.ogTitle) syncMetaTag('property', 'og:title', meta.ogTitle);
    if (meta.ogDescription) syncMetaTag('property', 'og:description', meta.ogDescription);
    if (meta.ogImage) syncMetaTag('property', 'og:image', meta.ogImage);
    syncMetaTag('property', 'og:type', meta.ogType || 'website');
  }

  // 5. Google Tag Manager (GTM)
  const gtmId = gsc?.gtmContainerId?.trim();
  const gtmScriptId = 'seedhaven-gtm-script';
  if (gsc?.gtmEnabled && gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId)) {
    if (!document.getElementById(gtmScriptId)) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      injectScript(gtmScriptId, `https://www.googletagmanager.com/gtm.js?id=${gtmId}`);
    }
  } else {
    removeScript(gtmScriptId);
  }

  // 6. Google Analytics 4 (GA4)
  const ga4Id = gsc?.ga4MeasurementId?.trim();
  const ga4ScriptId = 'seedhaven-ga4-script';
  const ga4InlineId = 'seedhaven-ga4-inline';
  if (gsc?.ga4Enabled && ga4Id && /^G-[A-Z0-9]+$/i.test(ga4Id)) {
    if (!document.getElementById(ga4ScriptId)) {
      injectScript(ga4ScriptId, `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`);
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer?.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, { send_page_view: true });
    }
  } else {
    removeScript(ga4ScriptId);
    removeScript(ga4InlineId);
  }

  // 7. Google Ads Conversion ID
  if (gsc?.googleAdsEnabled && gsc.googleAdsConversionId) {
    const awId = gsc.googleAdsConversionId.trim();
    if (awId) {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag === 'function') {
        window.gtag('config', awId);
      }
    }
  }

  // 8. Meta Pixel
  const pixelId = meta?.pixelId?.trim();
  const pixelScriptId = 'seedhaven-meta-pixel';
  if (meta?.pixelEnabled && pixelId && /^[0-9]+$/.test(pixelId)) {
    if (!window.fbq) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.id = pixelScriptId;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    if (window.fbq) {
      window.fbq('init', pixelId);
      if (meta.trackPageView !== false) {
        window.fbq('track', 'PageView');
      }
    }
  } else {
    removeScript(pixelScriptId);
  }

  // 9. Microsoft Clarity
  const clarityId = seo?.clarityProjectId?.trim();
  const clarityScriptId = 'seedhaven-clarity';
  if (seo?.clarityEnabled && clarityId) {
    if (!window.clarity && !document.getElementById(clarityScriptId)) {
      (function (c: any, l: any, a: any, r: any, i?: any, t?: any, y?: any) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.id = clarityScriptId;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', clarityId);
    }
  } else {
    removeScript(clarityScriptId);
  }

  // 10. TikTok Pixel
  const ads = settings.advertising;
  const ttId = ads?.tiktokPixelId?.trim();
  const ttScriptId = 'seedhaven-tiktok-pixel';
  if (ads?.tiktokPixelEnabled && ttId) {
    if (!window.ttq && !document.getElementById(ttScriptId)) {
      injectScript(
        ttScriptId,
        undefined,
        `!function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${ttId}');
          ttq.page();
        }(window, document, 'ttq');`
      );
    }
  } else {
    removeScript(ttScriptId);
  }

  // 11. Pinterest Tag
  const pinId = ads?.pinterestTagId?.trim();
  const pinScriptId = 'seedhaven-pinterest-tag';
  if (ads?.pinterestTagEnabled && pinId) {
    if (!window.pintrk && !document.getElementById(pinScriptId)) {
      injectScript(
        pinScriptId,
        undefined,
        `!function(e){if(!window.pintrk){window.pintrk = function () {
          window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
          n=window.pintrk;n.queue=[],n.version="3.0";var
          t=document.createElement("script");t.async=!0,t.src=e;var
          r=document.getElementsByTagName("script")[0];
          r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
          pintrk('load', '${pinId}');
          pintrk('page');`
      );
    }
  } else {
    removeScript(pinScriptId);
  }

  // 12. Schema.org Markup
  syncSchemaMarkup(seo);
}

/**
 * Generate unique event ID for deduplication between Pixel & Conversions API
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Unified dispatch for all active tracking platforms
 */
export async function trackUnifiedEvent(
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Lead',
  eventData: Record<string, any>,
  integrations?: IntegrationsSettings
) {
  const eventId = generateEventId();

  // 1. Meta Pixel (Client-side)
  if (integrations?.meta?.pixelEnabled && typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const metaConfig = integrations.meta;
    let shouldTrack = true;
    if (eventName === 'PageView' && metaConfig.trackPageView === false) shouldTrack = false;
    if (eventName === 'ViewContent' && metaConfig.trackViewContent === false) shouldTrack = false;
    if (eventName === 'AddToCart' && metaConfig.trackAddToCart === false) shouldTrack = false;
    if (eventName === 'InitiateCheckout' && metaConfig.trackInitiateCheckout === false) shouldTrack = false;
    if (eventName === 'Purchase' && metaConfig.trackPurchase === false) shouldTrack = false;
    if (eventName === 'Lead' && metaConfig.trackLead === false) shouldTrack = false;

    if (shouldTrack) {
      try {
        window.fbq('track', eventName, { ...eventData }, { eventID: eventId });
      } catch (e) {
        console.warn('Meta Pixel dispatch error:', e);
      }
    }
  }

  // 2. Meta Conversions API (Server-side with deduplication)
  if (integrations?.meta?.capiEnabled && integrations?.meta?.capiAccessToken) {
    try {
      fetch('/api/integrations/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventId, // Deduplication key
          eventData,
          url: window.location.href,
        }),
      }).catch((e) => console.warn('CAPI error:', e));
    } catch {}
  }

  // 3. Google Analytics 4 Event
  if (integrations?.google?.ga4Enabled && typeof window.gtag === 'function') {
    try {
      const gaEventMap: Record<string, string> = {
        PageView: 'page_view',
        ViewContent: 'view_item',
        AddToCart: 'add_to_cart',
        InitiateCheckout: 'begin_checkout',
        Purchase: 'purchase',
        Lead: 'generate_lead',
      };
      window.gtag('event', gaEventMap[eventName] || eventName, eventData);
    } catch {}
  }

  // 4. TikTok Pixel
  if (integrations?.advertising?.tiktokPixelEnabled && window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, eventData);
    } catch {}
  }

  // 5. Pinterest Tag
  if (integrations?.advertising?.pinterestTagEnabled && window.pintrk) {
    try {
      window.pintrk('track', eventName, eventData);
    } catch {}
  }
}
