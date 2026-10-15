# Ss Seed Shop - Full Architectural Blueprint & Technical Documentation

This document provides the complete technical breakdown, file/folder structure, features, and implementation details of the Ss Seed Shop e-commerce platform.

---

## 📁 1. Project Directory & File Structure

```text
├── .aistudio/                  # AI Studio configuration
├── api/
│   └── index.ts                # Vercel Serverless Function entry point
├── data/                       # Local data backups / seed datasets
├── public/
│   ├── .htaccess               # Apache / cPanel / Shared hosting SPA & cache rules
│   ├── _headers                # HTTP security & caching headers (Cloudflare/Netlify)
│   ├── _redirects              # Netlify SPA redirect rules
│   ├── robots.txt              # Search engine crawler rules & sitemap links
│   ├── sitemap.xml             # SEO XML Sitemap for Google Indexing
│   ├── googled0dc2aad1b47a15f.html # Google Search Console verification file
│   └── uploads/                # Static upload assets
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx       # User login & registration modal
│   │   ├── CartDrawer.tsx      # Slide-out shopping cart & COD checkout form
│   │   ├── ClearanceBanner.tsx # Top notification & clearance notice bar
│   │   ├── ContactModal.tsx    # About Us & Contact helpline modal
│   │   ├── Footer.tsx          # Site footer with links, copyright & badges
│   │   ├── Header.tsx          # Sticky navigation header, search, wishlist & cart triggers
│   │   ├── Hero.tsx            # Promotional banner slider
│   │   ├── MarqueeSection.tsx  # Scrolling announcement marquee bar
│   │   ├── MenuDrawer.tsx      # Mobile hamburger navigation menu drawer
│   │   ├── NoticePopupModal.tsx# Promotional popup notice modal
│   │   ├── OrderMemoModal.tsx  # Printable & downloadable customer cash memo / invoice
│   │   ├── OrderTrackerModal.tsx# Live order tracking page with timeline chart
│   │   ├── PolicyModal.tsx     # Terms, Privacy, Refund & Shipping policy modal
│   │   ├── ProductCard.tsx     # Individual product grid card with stock & price
│   │   ├── ProductCompareModal.tsx# Product comparison modal
│   │   ├── ProductDetailPage.tsx# Dedicated product view with reviews & ratings
│   │   ├── QuickSearchModal.tsx# Instant search modal
│   │   ├── WishlistModal.tsx   # Saved favorite products modal
│   │   └── MarketingSections.tsx# Leaderboard, promos, blog & trust badges
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization (Firestore & Auth)
│   │   ├── firestoreProducts.ts# Real-time Firestore sync & caching functions
│   │   ├── integrationsManager.ts# Facebook Pixel, Google Analytics & CAPI manager
│   │   └── utils.ts            # Helper utilities, formatters & analytics trackers
│   ├── types/
│   │   ├── index.ts            # Core TypeScript interfaces (Product, Order, Category, etc.)
│   │   └── integrations.ts     # Integrations settings types
│   ├── App.tsx                 # Main React application component & router controller
│   ├── index.css               # Global Tailwind CSS imports & custom styles
│   ├── main.tsx                # React DOM entry point with BrowserRouter
│   └── vite-env.d.ts           # Vite client environment definitions
├── admin.html                  # Standalone standalone Admin Panel dashboard
├── server.ts                   # Express.js + Vite middleware server & API routes
├── vercel.json                 # Vercel deployment rewrites & security headers
├── netlify.toml                # Netlify build and redirect configurations
├── Dockerfile                  # Container deployment configuration
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite bundler & admin bundle copy plugin
```

---

## 🚀 2. Core Features & Functional Modules

### A. Customer Website (`src/App.tsx` & `src/components/*`)
1. **Dynamic Routing & SEO:**
   - Client-side routing with React Router (`/`, `/products`, `/product/:id`, `/category/:id`, `/cart`, `/track-order`, `/about`, `/contact`, `/privacy`, `/terms`, `/refund`, `/shipping`, `/login`).
   - Dynamic meta tags (`og:title`, `og:description`, `og:image`, canonical URLs) updated per route.
2. **Product Catalog & Details:**
   - Real-time product inventory sync with Firebase Firestore.
   - Filter by categories, instant search, sorting, and stock management.
   - Dedicated product view with customer reviews, star ratings, and direct checkout.
3. **Cart & COD Checkout:**
   - Slide-out cart drawer with quantity adjustments, coupon code application, and subtotal calculation.
   - Cash on Delivery (COD) order placement saving directly to Firestore.
   - **Order Cash Memo & Invoice Generator (`OrderMemoModal.tsx`):** Instant printable/downloadable A4 invoice showing store details, customer address, purchased items, and totals.
4. **Live Order Tracker (`OrderTrackerModal.tsx`):**
   - Customers can track their order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`) using their phone number or Order ID with an interactive Recharts delivery progress timeline.

### B. Admin Panel (`admin.html`)
1. **Dashboard Analytics:**
   - Real-time stats for total products, orders, today's sales, total sales, pending orders, low stock alerts, and visitor analytics.
2. **Catalog Management:**
   - CRUD operations for products, categories, banners, coupons, and customer reviews.
   - Client-side image compression to lightweight WebP with strict 3.5s timeout safeguards and Firebase Storage fallback.
3. **Order & Inventory Management:**
   - Manage order statuses, customer lists, and stock restocking.
   - Print individual order invoices ("চালান প্রিন্ট") with dynamic store name, address, and hotline synced from Firestore settings.
4. **Comprehensive Site Settings:**
   - Store settings (Name, Logo, Favicon, Currency, Login Toggle).
   - Homepage settings, menu control, footer settings, delivery zones, payment gateways, notice popups, contact info, privacy policies, SEO settings, Facebook Pixel/Google analytics integrations, and Steadfast Courier API settings.

### C. Backend & Deployment (`server.ts`, `vercel.json`, `netlify.toml`)
1. **Express Server (`server.ts`):**
   - Serves API routes, handles sitemap XML generation dynamically, and serves Vite SPA middleware in development.
   - Robust SPA catch-all fallback route (`app.get('*')`) preventing 404 errors on browser page refreshes or direct URL sharing.
2. **Multi-Platform Deployment Ready:**
   - **Vercel:** Configured via `vercel.json` with clean rewrites.
   - **Netlify:** Configured via `netlify.toml` with redirect rules.
   - **cPanel / Apache:** Configured via `public/.htaccess` with URL rewriting and browser caching rules.
   - **Docker:** Supported via `Dockerfile` and `docker-compose.yml`.

---

## 📦 3. Key Dependencies (`package.json`)
- **React 19 & React Router DOM:** UI framework and routing.
- **Tailwind CSS (v4):** Modern styling and responsive layout.
- **Lucide React:** Clean UI vector icons.
- **Firebase (v11):** Firestore database & Authentication.
- **Recharts:** Analytics and delivery timeline charts.
- **Vite & Esbuild:** Fast bundling and production server building.
