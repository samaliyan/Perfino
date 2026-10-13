package ir.perfume.price;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.os.Build;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * خودبروزرسانی از GitHub Release (برچسب latest).
 * ۱) نسخه‌ی تازه را از توضیح Release می‌خواند (code=شماره)  ۲) فایل APK را دانلود و بررسی می‌کند
 * ۳) با PackageInstaller نصب می‌کند. اندروید همیشه خودش یک تأیید نصب نشان می‌دهد؛ این قابل حذف نیست.
 * آدرس‌ها ثابت‌اند و از صفحه‌ی برنامه گرفته نمی‌شوند.
 */
class Updater {
    interface Js { void run(String script); }

    private static final String API = "https://api.github.com/repos/samaliyan/PerfumePrice/releases/tags/latest";
    private static final String APK_URL = "https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk";
    private static final String ACTION = "ir.perfume.price.UPDATE_RESULT";
    private static final int MAX_APK = 25 * 1024 * 1024;

    private final Activity act;
    private final Js js;
    private volatile boolean busy = false;
    private volatile File apk;
    private volatile int apkCode = 0;
    private BroadcastReceiver rx;

    Updater(Activity a, Js j) {
        act = a;
        js = j;
    }

    int appCode() {
        try {
            PackageInfo pi = act.getPackageManager().getPackageInfo(act.getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    private static boolean hostOk(String h) {
        if (h == null) return false;
        h = h.toLowerCase(Locale.ROOT);
        return h.equals("github.com") || h.equals("api.github.com") || h.endsWith(".githubusercontent.com");
    }

    private HttpURLConnection open(String url, int timeoutMs) throws Exception {
        for (int hop = 0; hop < 6; hop++) {
            URL u = new URL(url);
            if (!"https".equals(u.getProtocol()) || !hostOk(u.getHost())) throw new java.io.IOException("host");
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            c.setConnectTimeout(timeoutMs);
            c.setReadTimeout(timeoutMs);
            c.setInstanceFollowRedirects(false);
            c.setRequestProperty("User-Agent", "PerfumePrice-updater");
            c.setRequestProperty("Accept", "application/vnd.github+json, application/octet-stream, */*");
            int st = c.getResponseCode();
            if (st >= 300 && st < 400) {
                String loc = c.getHeaderField("Location");
                c.disconnect();
                if (loc == null) throw new java.io.IOException("redirect");
                url = new URL(u, loc).toString();
                continue;
            }
            if (st != 200) { c.disconnect(); throw new java.io.IOException("http " + st); }
            return c;
        }
        throw new java.io.IOException("too many redirects");
    }

    private void call(String fn, String arg) {
        final String s = "window." + fn + "&&window." + fn + "(" + arg + ")";
        js.run(s);
    }

    /** آخرین نسخه‌ی منتشرشده؛ نتیجه با window.__updInfo(code) */
    void check() {
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    HttpURLConnection c = open(API, 15000);
                    InputStream in = c.getInputStream();
                    java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
                    byte[] buf = new byte[4096]; int n, tot = 0;
                    while ((n = in.read(buf)) > 0 && tot < 300000) { bo.write(buf, 0, n); tot += n; }
                    in.close(); c.disconnect();
                    JSONObject j = new JSONObject(bo.toString("UTF-8"));
                    Matcher m = Pattern.compile("code=(\\d{1,9})").matcher(j.optString("body", ""));
                    int code = m.find() ? Integer.parseInt(m.group(1)) : 0;
                    call("__updInfo", String.valueOf(code));
                } catch (Exception e) {
                    call("__updErr", JSONObject.quote("check"));
                }
            }
        }).start();
    }

    /** دانلود و بررسی فایل؛ نتیجه با window.__updReady(code) یا __updErr */
    void download() {
        if (busy) return;
        busy = true;
        new Thread(new Runnable() {
            @Override public void run() {
                File dir = new File(act.getCacheDir(), "upd");
                File tmp = new File(dir, "new.tmp"), dst = new File(dir, "PerfumePrice.apk");
                try {
                    dir.mkdirs();
                    HttpURLConnection c = open(APK_URL, 30000);
                    InputStream in = c.getInputStream();
                    OutputStream out = new FileOutputStream(tmp);
                    byte[] buf = new byte[16384]; int n, tot = 0; boolean head = true; boolean pk = false;
                    while ((n = in.read(buf)) > 0) {
                        if (head && n >= 4) { pk = buf[0] == 'P' && buf[1] == 'K'; head = false; if (!pk) break; }
                        tot += n;
                        if (tot > MAX_APK) { pk = false; break; }
                        out.write(buf, 0, n);
                    }
                    out.close(); in.close(); c.disconnect();
                    if (!pk || tot < 20000) throw new java.io.IOException("bad file");
                    PackageInfo pi = act.getPackageManager().getPackageArchiveInfo(tmp.getAbsolutePath(), 0);
                    if (pi == null || !act.getPackageName().equals(pi.packageName)) throw new java.io.IOException("package");
                    int code = Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode;
                    if (code <= appCode()) throw new java.io.IOException("not newer");
                    if (dst.exists()) dst.delete();
                    if (!tmp.renameTo(dst)) throw new java.io.IOException("rename");
                    apk = dst; apkCode = code;
                    call("__updReady", String.valueOf(code));
                } catch (Exception e) {
                    tmp.delete();
                    call("__updErr", JSONObject.quote("download"));
                } finally {
                    busy = false;
                }
            }
        }).start();
    }

    /** نصب فایل دانلودشده؛ اندروید پنجره‌ی تأییدِ خودش را نشان می‌دهد */
    boolean install() {
        final File f = apk;
        if (f == null || !f.exists()) return false;
        try {
            if (rx == null) {
                rx = new BroadcastReceiver() {
                    @Override public void onReceive(Context ctx, Intent it) {
                        int st = it.getIntExtra(PackageInstaller.EXTRA_STATUS, -999);
                        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
                            Intent c = it.getParcelableExtra(Intent.EXTRA_INTENT);
                            if (c != null) { c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); try { act.startActivity(c); } catch (Exception e) { call("__updErr", JSONObject.quote("confirm")); } }
                        } else if (st != PackageInstaller.STATUS_SUCCESS) {
                            call("__updErr", JSONObject.quote("install " + st));
                        }
                    }
                };
                IntentFilter fl = new IntentFilter(ACTION);
                if (Build.VERSION.SDK_INT >= 33) act.registerReceiver(rx, fl, Context.RECEIVER_NOT_EXPORTED);
                else act.registerReceiver(rx, fl);
            }
            PackageInstaller pi = act.getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            p.setAppPackageName(act.getPackageName());
            if (Build.VERSION.SDK_INT >= 31) p.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
            int id = pi.createSession(p);
            PackageInstaller.Session s = pi.openSession(id);
            try {
                OutputStream o = s.openWrite("PerfumePrice.apk", 0, f.length());
                InputStream in = new FileInputStream(f);
                byte[] buf = new byte[65536]; int n;
                while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
                s.fsync(o); in.close(); o.close();
                Intent it = new Intent(ACTION).setPackage(act.getPackageName());
                int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
                PendingIntent pend = PendingIntent.getBroadcast(act, id, it, fl);
                s.commit(pend.getIntentSender());
            } catch (Exception e) {
                s.abandon();
                throw e;
            } finally {
                s.close();
            }
            return true;
        } catch (Exception e) {
            call("__updErr", JSONObject.quote("start"));
            return false;
        }
    }

    void destroy() {
        try { if (rx != null) act.unregisterReceiver(rx); } catch (Exception ignore) { }
        rx = null;
    }
}
