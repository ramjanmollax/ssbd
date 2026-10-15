# Ss Seed Shop Admin - Android Studio APK Project

এই প্রজেক্টটি **Ss Seed Shop Admin Panel**-এর সম্পূর্ণ Android Studio Wrapper প্রজেক্ট।
মূল `admin.html` ফাইলটি সম্পূর্ণ অপরিবর্তিত রেখে (SHA-256 Hash মিলিয়ে) হাই-পারফরম্যান্স Android Native WebView-তে সাজানো হয়েছে।

---

### 📋 প্রজেক্ট পরিচিতি (Project Details)
- **App Name:** Ss Seed Shop Admin
- **Package Name:** `com.ssseedshop.admin`
- **Language:** Kotlin
- **Target SDK:** 34 (Android 14)
- **Min SDK:** 24 (Android 7.0 Nougat - ৯৯.৮% ডিভাইসে চলবে)
- **Architecture:** Android Native Kotlin + AndroidX WebKit + WebViewAssetLoader
- **Security:** Secure Context (HTTPS via `appassets.androidplatform.net`) - Firebase Auth ও Firestore ১০০% সচল

---

### 🚀 কিভাবে Android Studio-তে APK Build করবেন:

#### ধাপ ১: প্রজেক্ট ওপেন করুন
1. **Android Studio** চালু করুন।
2. **Open** অথবা **File > Open** চাপুন।
3. `SsSeedShop-Android-APK` ফোল্ডারটি সিলেক্ট করে **OK** দিন।

#### ধাপ ২: Gradle Sync
- প্রজেক্ট লোড হলে Android Studio স্বয়ংক্রিয়ভাবে Gradle Sync সম্পন্ন করবে (প্রথমবার ইন্টারনেট স্পিড অনুযায়ী ১-২ মিনিট লাগতে পারে)।
- যদি নিচে কোনো **Sync Now** নোটিফিকেশন আসে, তবে **Sync Now** ক্লিক করুন।

#### ধাপ ৩: APK তৈরি করুন (Build APK)
1. উপরের মেনুবার থেকে **Build** মেনুতে যান।
2. **Build Bundle(s) / APK(s)**-এ মাউস রাখুন।
3. **Build APK(s)**-এ ক্লিক করুন।

#### ধাপ ৪: APK সংগ্রহ ও ফোনে ইন্সটল
- বিল্ড সফল হলে নিচে ডানে একটি পপআপ আসবে: `APK(s) generated successfully for 1 module`.
- সেখানে **locate** লিঙ্কে ক্লিক করলেই আপনি সরাসরি APK ফাইলটি পেয়ে যাবেন:
  `app/build/outputs/apk/debug/app-debug.apk`
- ফাইলটি আপনার ফোনে পাঠিয়ে নিন এবং এক ক্লিকে Install করুন।

---

### ⚡ যুক্ত করা মূল ফিচারসমূহ:
1. **মূল admin.html সম্পূর্ণ অপরিবর্তিত:** একটি কোড বা বর্ণও পরিবর্তন করা হয়নি।
2. **Firebase ও রিয়েলটাইম ডাটাবেজ:** Secure Context ও WebKit AssetLoader দ্বারা লাইভ অনলাইন কানেকশন শতভাগ সক্রিয়।
3. **ফাইল ও ছবি আপলোড সাপোর্ট:** পণ্য বা ভাউচারের ছবি আপলোডের জন্য নেটিভ File Chooser ও Camera সাপোর্ট।
4. **অর্ডার নোটিফিকেশন ও সাউন্ড:** নতুন অর্ডার এলে ভাইব্রেশন ও রিংটোন সহ নোটিফিকেশন চ্যানেল।
5. **স্মুথ সোয়াইপ রিফ্রেশ:** ওপর থেকে নিচে টান দিলে আধুনিক অ্যাপের মতো পেজ রিফ্রেশ হবে।
6. **অফলাইন রিকভারি:** ইন্টারনেট ডিসকানেক্ট হলে সুন্দর অফলাইন স্ক্রিন ও 'আবার চেষ্টা করুন' বাটন।
7. **স্মার্ট ব্যাক বাটন:** ভুলবশত অ্যাপ বন্ধ না হয়ে প্রিভিয়াস ট্যাবে যাবে, দুইবার চাপলে অ্যাপ বন্ধ হবে।
8. **প্রিন্ট ও ডাউনলোড সাপোর্ট:** ইনভয়েস প্রিন্ট এবং রিপোর্ট/ডাটা ডাউনলোড করার জন্য DownloadManager ইন্টিগ্রেশন।

---
*Created for Ss Seed Shop Admin*
