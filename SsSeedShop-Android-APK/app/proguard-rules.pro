# ProGuard / R8 rules for Ss Seed Shop Admin
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class com.ssseedshop.admin.WebAppInterface {
    public *;
}
