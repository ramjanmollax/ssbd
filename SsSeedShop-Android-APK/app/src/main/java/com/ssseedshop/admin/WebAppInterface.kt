package com.ssseedshop.admin

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(
    private val activity: MainActivity,
    private val notificationHelper: NotificationHelper
) {

    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun showNotification(title: String, message: String) {
        notificationHelper.sendOrderNotification(title, message)
    }

    @JavascriptInterface
    fun playNotificationSound() {
        notificationHelper.sendOrderNotification("Ss Seed Shop", "নতুন অর্ডারের সতর্কবার্তা!")
    }

    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        activity.runOnUiThread {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                activity.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createOneShot(
                        if (milliseconds <= 0) 200 else milliseconds,
                        VibrationEffect.DEFAULT_AMPLITUDE
                    )
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(if (milliseconds <= 0) 200 else milliseconds)
            }
        }
    }

    @JavascriptInterface
    fun printPage() {
        activity.runOnUiThread {
            activity.printCurrentPage()
        }
    }

    @JavascriptInterface
    fun requestNotificationPermission() {
        activity.runOnUiThread {
            activity.requestNotificationPermission()
        }
    }

    @JavascriptInterface
    fun openExternal(url: String) {
        activity.runOnUiThread {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                activity.startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(activity, "Cannot open link: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
