package ir.perfume.price;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/**
 * تا وقتی برنامه قیمت‌ها را می‌گیرد، اندروید آن را «کارِ در جریان» می‌بیند و با خاموش شدنِ صفحه متوقفش نمی‌کند.
 * (بدون این، اندروید برنامه‌ی پشتِ صفحه‌ی خاموش را منجمد می‌کند و دریافت تا روشن شدنِ دوباره‌ی صفحه می‌ایستد.)
 * یک اعلانِ ساده «پرفینو در حال گرفتنِ قیمت‌ها…» نشان داده می‌شود و با پایانِ کار خودش می‌رود.
 * پردازنده و وای‌فای بیدار می‌مانند؛ همه‌چیز سقفِ زمانی دارد تا اگر صفحه خبرِ پایان را نداد، باتری خالی نشود.
 */
public class RefreshService extends Service {
    static final String CH = "refresh";
    static final int NID = 7101;
    static final long MAX_MS = 30 * 60 * 1000L;      // بیشترین زمانِ بیدار نگه داشتن
    static final String EXTRA_TEXT = "t";
    private PowerManager.WakeLock wl;
    private WifiManager.WifiLock wifi;
    private final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable cap = new Runnable() { @Override public void run() { stopSelf(); } };

    static void start(Context c, String text) {
        try {
            Intent i = new Intent(c, RefreshService.class).putExtra(EXTRA_TEXT, text == null ? "" : text);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignore) { }      // مثلاً اندروید شروع از پس‌زمینه را اجازه نداد: دریافت مثلِ قبل ادامه می‌دهد
    }

    static void stop(Context c) {
        try { c.stopService(new Intent(c, RefreshService.class)); } catch (Exception ignore) { }
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String t = intent != null ? intent.getStringExtra(EXTRA_TEXT) : null;
        if (t == null || t.isEmpty()) t = "در حال گرفتنِ قیمت‌ها…";
        Notification n = build(t);
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
            else startForeground(NID, n);
        } catch (Exception e) { stopSelf(); return START_NOT_STICKY; }
        hold();
        h.removeCallbacks(cap); h.postDelayed(cap, MAX_MS);
        return START_NOT_STICKY;      // اگر اندروید برنامه را بست، دوباره خودش شروع نشود
    }

    private Notification build(String text) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm != null && nm.getNotificationChannel(CH) == null) {
            NotificationChannel ch = new NotificationChannel(CH, "بروزرسانیِ قیمت‌ها", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.stat_sys_download).setContentTitle(getString(R.string.app_name)).setContentText(text)
         .setOngoing(true).setOnlyAlertOnce(true).setContentIntent(pi);
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_LOW);
        return b.build();
    }

    private void hold() {
        try {
            if (wl == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) { wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "perfino:refresh"); wl.setReferenceCounted(false); }
            }
            if (wl != null && !wl.isHeld()) wl.acquire(MAX_MS);
        } catch (Exception ignore) { }
        try {
            if (wifi == null) {
                WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) { wifi = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "perfino:refresh"); wifi.setReferenceCounted(false); }
            }
            if (wifi != null && !wifi.isHeld()) wifi.acquire();
        } catch (Exception ignore) { }
    }

    @Override
    public void onDestroy() {
        h.removeCallbacks(cap);
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception ignore) { }
        try { if (wifi != null && wifi.isHeld()) wifi.release(); } catch (Exception ignore) { }
        super.onDestroy();
    }
}
