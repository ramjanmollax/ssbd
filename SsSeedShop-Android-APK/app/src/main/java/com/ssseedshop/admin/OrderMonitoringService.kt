package com.ssseedshop.admin

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class OrderMonitoringService : Service() {

    companion object {
        private const val TAG = "OrderMonitoringService"
        private const val POLL_INTERVAL_MS = 12000L // Check every 12 seconds
        private const val PREFS_NAME = "ss_seed_shop_prefs"
        private const val KEY_KNOWN_ORDERS = "known_order_ids_set"
        private const val SERVICE_CHANNEL_ID = "ss_seed_shop_service_channel"
        private const val SERVICE_NOTIFICATION_ID = 9999

        fun startService(context: Context) {
            try {
                val intent = Intent(context, OrderMonitoringService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ContextCompat.startForegroundService(context, intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start OrderMonitoringService", e)
            }
        }
    }

    private val executor = Executors.newSingleThreadScheduledExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    private lateinit var notificationHelper: NotificationHelper
    private var isFirstCheck = true

    override fun onCreate() {
        super.onCreate()
        try {
            notificationHelper = NotificationHelper(this)
            createServiceNotificationChannel()
            startForegroundServiceNotification()
            startPolling()
            Log.d(TAG, "OrderMonitoringService created and polling started.")
        } catch (e: Exception) {
            Log.e(TAG, "Error in OrderMonitoringService onCreate", e)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createServiceNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                val channel = NotificationChannel(
                    SERVICE_CHANNEL_ID,
                    "অর্ডার মনিটরিং ব্যাকগ্রাউন্ড সার্ভিস",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "ব্যাকগ্রাউন্ডে নতুন অর্ডারের সতর্কবার্তা চেক করার জন্য সার্ভিস সচল থাকে"
                    setShowBadge(false)
                }
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.createNotificationChannel(channel)
            } catch (e: Exception) {
                Log.e(TAG, "Error creating notification channel", e)
            }
        }
    }

    private fun startForegroundServiceNotification() {
        try {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification: Notification = NotificationCompat.Builder(this, SERVICE_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Ss Seed Shop Admin")
                .setContentText("নতুন অর্ডার অ্যালার্ট সার্ভিস ব্যাকগ্রাউন্ডে সক্রিয় 🔔")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setContentIntent(pendingIntent)
                .build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    SERVICE_NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
                )
            } else {
                startForeground(SERVICE_NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting foreground notification", e)
        }
    }

    private fun startPolling() {
        executor.scheduleWithFixedDelay({
            try {
                checkNewOrders()
            } catch (e: Exception) {
                Log.e(TAG, "Error checking new orders in background", e)
            }
        }, 2, POLL_INTERVAL_MS / 1000, java.util.concurrent.TimeUnit.SECONDS)
    }

    private fun checkNewOrders() {
        val targetUrl = "${MainActivity.LIVE_SERVER_URL}/api/orders"
        val connection = (URL(targetUrl).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 8000
            readTimeout = 8000
            setRequestProperty("Accept", "application/json")
        }

        try {
            if (connection.responseCode == 200) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val responseStr = reader.use { it.readText() }
                val ordersArray = JSONArray(responseStr)

                val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                val knownSet = HashSet(prefs.getStringSet(KEY_KNOWN_ORDERS, emptySet()) ?: emptySet())

                if (isFirstCheck) {
                    for (i in 0 until ordersArray.length()) {
                        val orderObj = ordersArray.optJSONObject(i) ?: continue
                        val oId = orderObj.optString("orderId", orderObj.optString("id", ""))
                        if (oId.isNotEmpty()) knownSet.add(oId)
                    }
                    prefs.edit().putStringSet(KEY_KNOWN_ORDERS, knownSet).apply()
                    isFirstCheck = false
                    Log.d(TAG, "Initial order set loaded: ${knownSet.size} orders.")
                    return
                }

                val newOrdersToNotify = mutableListOf<JSONObject>()

                for (i in 0 until ordersArray.length()) {
                    val orderObj = ordersArray.optJSONObject(i) ?: continue
                    val oId = orderObj.optString("orderId", orderObj.optString("id", ""))
                    if (oId.isNotEmpty() && !knownSet.contains(oId)) {
                        knownSet.add(oId)
                        newOrdersToNotify.add(orderObj)
                    }
                }

                if (newOrdersToNotify.isNotEmpty()) {
                    prefs.edit().putStringSet(KEY_KNOWN_ORDERS, knownSet).apply()
                    mainHandler.post {
                        for (oObj in newOrdersToNotify) {
                            val oId = oObj.optString("orderId", "SS-New")
                            val cName = oObj.optString("customerName", "নতুন কাস্টমার")
                            val phone = oObj.optString("phone", "")
                            val total = oObj.optDouble("total", 0.0).toInt()

                            val title = "🛒 নতুন অর্ডার এসেছে! (Ss Seed Shop)"
                            val msg = "অর্ডার #${oId} | গ্রাহক: ${cName} (${phone}) | মোট: ৳${total}"
                            notificationHelper.sendOrderNotification(title, msg)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error during checkNewOrders HTTP call", e)
        } finally {
            try {
                connection.disconnect()
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            executor.shutdownNow()
        } catch (e: Exception) {
            // Ignore
        }
        Log.d(TAG, "OrderMonitoringService destroyed.")
    }
}
