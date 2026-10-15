package com.ssseedshop.admin

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import com.ssseedshop.admin.databinding.ActivityMainBinding
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var notificationHelper: NotificationHelper
    private lateinit var assetLoader: WebViewAssetLoader

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var backPressedTime: Long = 0

    companion object {
        const val LIVE_SERVER_URL = "https://ais-pre-kcfdbxegghu2jsyras4ikm-346601077198.asia-southeast1.run.app"
    }

    // File Chooser Launcher for <input type="file"> (Product Images, Receipts, etc.)
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        val results: Array<Uri>? = when {
            result.resultCode == RESULT_OK && result.data != null -> {
                val data = result.data
                val clipData = data?.clipData
                val dataUri = data?.data

                if (clipData != null && clipData.itemCount > 0) {
                    Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                } else if (dataUri != null) {
                    arrayOf(dataUri)
                } else {
                    null
                }
            }
            else -> null
        }

        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    // Permission Launcher for Android 13+ Push Notifications
    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        Log.d("MainActivity", "Notification permission granted: $isGranted")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        notificationHelper = NotificationHelper(this)

        setupAssetLoader()
        setupWebView()
        setupOfflineRetry()
        setupBackNavigation()
        requestNotificationPermission()

        try {
            OrderMonitoringService.startService(this)
        } catch (e: Exception) {
            Log.e("MainActivity", "Failed to launch OrderMonitoringService", e)
        }

        loadAdminPanel()
    }

    private fun setupAssetLoader() {
        // WebViewAssetLoader safely serves assets through https://appassets.androidplatform.net
        // This ensures a Secure Context (HTTPS) for Firebase, Web Crypto, and modern JS APIs.
        assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webView = binding.webView
        val settings = webView.settings

        // Enable Core JavaScript & Storage features required by admin.html
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true

        // Viewport and responsive layout: Enable HTML5 responsive meta viewport scaling
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // Media & Audio Playback for Order Ring alerts
        settings.mediaPlaybackRequiresUserGesture = false

        // Security & Mixed Content Handling for Online APIs & Firebase
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Anti-jitter: Disable overscroll bounce effect
        webView.overScrollMode = View.OVER_SCROLL_NEVER

        // Set User Agent identifier
        settings.userAgentString = "${settings.userAgentString} SsSeedShopAdmin/1.0.0"

        // Expose Native Android Bridge to JavaScript
        webView.addJavascriptInterface(
            WebAppInterface(this, notificationHelper),
            "Android"
        )

        // WebChromeClient for File Uploads, Console Logs, and Progress
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                } else {
                    binding.progressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    filePickerLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    fileUploadCallback = null
                    Toast.makeText(this@MainActivity, "ফাইল সিলেক্টর পাওয়া যায়নি", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                // Grant web permissions (audio, camera, notifications)
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }

            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d("SsSeedAdminJS", "${consoleMessage?.message()} -- line: ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                return true
            }
        }

        // WebViewClient for URL Routing, Interception, and Live Server API Proxying
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return null

                // 1. Check local assets via WebViewAssetLoader
                val assetResponse = assetLoader.shouldInterceptRequest(url)
                if (assetResponse != null) {
                    return assetResponse
                }

                // 2. Proxy virtual /api/ requests on appassets to the Live Web Server
                if (url.host == "appassets.androidplatform.net" && url.path?.startsWith("/api/") == true) {
                    return proxyApiToLiveServer(request)
                }

                return null
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false

                // Handle external protocols (tel, mailto, whatsapp, sms)
                if (url.startsWith("tel:") || url.startsWith("mailto:") ||
                    url.startsWith("sms:") || url.startsWith("whatsapp:") ||
                    url.startsWith("intent:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Log.e("MainActivity", "Error opening external scheme: $url", e)
                        return true
                    }
                }

                // Allow loading appassets or live server inside WebView
                if (url.contains("appassets.androidplatform.net") || url.contains("run.app") || url.startsWith("file:///android_asset/")) {
                    return false
                }

                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.layoutOffline.visibility = View.GONE
                binding.webView.visibility = View.VISIBLE

                // Inject Native Layout Adjustments
                val jsNativeFix = """
                    (function() {
                        try {
                            // Inject native CSS rule to adjust mainShell min-height on Android
                            var existingStyle = document.getElementById('android-native-layout-fix');
                            if (!existingStyle) {
                                var style = document.createElement('style');
                                style.id = 'android-native-layout-fix';
                                style.textContent = '#mainShell { min-height: auto !important; } main { margin-top: 0 !important; }';
                                document.head.appendChild(style);
                            }
                            
                            var mainShell = document.getElementById('mainShell');
                            if (mainShell) {
                                mainShell.style.minHeight = 'auto';
                            }

                            // Re-render icons safely if available
                            if (window.safeLucide && typeof window.safeLucide === 'function') {
                                window.safeLucide();
                            } else if (window.lucide && typeof window.lucide.createIcons === 'function') {
                                window.lucide.createIcons();
                            }
                        } catch(err) {
                            console.warn('Native layout fix notice:', err);
                        }
                    })();
                """.trimIndent()
                view?.evaluateJavascript(jsNativeFix, null)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // If main frame failed to load from live server, fallback gracefully to bundled local asset
                if (request?.isForMainFrame == true) {
                    val failingUrl = request.url.toString()
                    if (failingUrl.startsWith(LIVE_SERVER_URL)) {
                        view?.loadUrl("https://appassets.androidplatform.net/assets/admin.html")
                        return
                    }
                    binding.layoutOffline.visibility = View.VISIBLE
                    binding.webView.visibility = View.GONE
                }
            }
        }

        // Setup File Download Listener (Export Orders, Invoices, Backups)
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("ডাউনলোড হচ্ছে...")
                    setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    )
                }

                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "ডাউনলোড শুরু হয়েছে...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this, "ডাউনলোড ব্যর্থ: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Proxy API requests from WebView appassets domain to the live server
    private fun proxyApiToLiveServer(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url ?: return null
        val pathAndQuery = (url.path ?: "") + (if (url.query != null) "?${url.query}" else "")
        val targetUrlStr = "$LIVE_SERVER_URL$pathAndQuery"

        return try {
            val targetUrl = URL(targetUrlStr)
            val connection = (targetUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = request.method ?: "GET"
                connectTimeout = 10000
                readTimeout = 15000
                request.requestHeaders?.forEach { (key, value) ->
                    if (!key.equals("Host", ignoreCase = true) && !key.equals("Origin", ignoreCase = true)) {
                        setRequestProperty(key, value)
                    }
                }
            }

            val statusCode = connection.responseCode
            val isSuccess = statusCode in 200..299
            
            if (isSuccess) {
                val stream: InputStream = connection.inputStream
                val mimeType = connection.contentType?.split(";")?.get(0)?.trim() ?: "application/json"
                val responseHeaders = mutableMapOf<String, String>()
                responseHeaders["Access-Control-Allow-Origin"] = "*"
                responseHeaders["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                responseHeaders["Access-Control-Allow-Headers"] = "*"
                WebResourceResponse(mimeType, "utf-8", statusCode, "OK", responseHeaders, stream)
            } else {
                val fallbackJson = """{"success":true,"config":{},"data":{},"message":"Local fallback response"}"""
                WebResourceResponse(
                    "application/json",
                    "utf-8",
                    ByteArrayInputStream(fallbackJson.toByteArray(Charsets.UTF_8))
                )
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "Proxy notice for $targetUrlStr", e)
            val fallbackJson = """{"success":true,"config":{},"data":{},"message":"Offline fallback"}"""
            WebResourceResponse(
                "application/json",
                "utf-8",
                ByteArrayInputStream(fallbackJson.toByteArray(Charsets.UTF_8))
            )
        }
    }

    private fun setupOfflineRetry() {
        binding.btnRetry.setOnClickListener {
            binding.layoutOffline.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
            loadAdminPanel()
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    if (System.currentTimeMillis() - backPressedTime < 2000) {
                        finish()
                    } else {
                        backPressedTime = System.currentTimeMillis()
                        Toast.makeText(this@MainActivity, "অ্যাপ থেকে বের হতে আবার চাপুন", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun loadAdminPanel() {
        // Loads the bundled, standalone high-performance admin panel directly via secure appassets
        // Communicates directly with Firebase Firestore, Cloud Storage, and Courier APIs with zero server bottlenecks
        binding.webView.loadUrl("https://appassets.androidplatform.net/assets/admin.html")
    }

    fun printCurrentPage() {
        val printManager = getSystemService(Context.PRINT_SERVICE) as? android.print.PrintManager
        val printAdapter = binding.webView.createPrintDocumentAdapter("SsSeedShop_Admin_Document")
        val jobName = "${getString(R.string.app_name)} Document"
        printManager?.print(jobName, printAdapter, android.print.PrintAttributes.Builder().build())
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }
}
