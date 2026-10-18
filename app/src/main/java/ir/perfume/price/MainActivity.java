package ir.perfume.price;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** یک WebView تمام‌صفحه؛ رابط و منطق در assets/www است. این کلاس فقط دانلود (بدون محدودیت CORS) و چند کار کوچک سیستمی را انجام می‌دهد. */
public class MainActivity extends Activity {
    private WebView web;
    private FrameLayout root;
    private static long rgT;
    private static int rgN;
    private volatile Uri lastBackup;
    private volatile String lastBackupText;      // اندروید ۹ و قدیمی‌تر: بدون FileProvider فایل را نمی‌شود فرستاد؛ خودِ متن فرستاده می‌شود
    private final ExecutorService pool = Executors.newFixedThreadPool(8);
    private final ExecutorService imgPool = Executors.newFixedThreadPool(3);
    private File imgDir;
    private Updater upd;
    private Ota ota;
    private final Ota.Net otaNet = new Ota.HttpNet(Ota.GITHUB);
    private static final String ASSET_URL = "file:///android_asset/www/index.html";
    private final android.os.Handler ui = new android.os.Handler(android.os.Looper.getMainLooper());
    private volatile boolean otaBusy = false;
    private OtaGuard guard;      // ناظرِ بسته‌ی بی‌نصب (منطقش در OtaGuard.java است و جدا آزمایش می‌شود)
    private String otaPrefix = "";
    private final Runnable otaDog = new Runnable() {
        @Override public void run() { if (guard != null && web != null) guard.dogFired(); }
    };

    /** شماره‌ی نسخه‌ای که همین الان در صفحه اجرا می‌شود */
    private int runCode() { return guard != null ? guard.runCode() : (upd == null ? 0 : upd.appCode()); }

    /** u = آدرس بسته‌ی بی‌نصب، یا null = نسخه‌ی داخل APK. فقط روی رشته‌ی اصلی صدا زده می‌شود. */
    private void loadStart(String u) {
        if (web == null) return;
        try { web.clearCache(true); } catch (Exception ignore) { }      // فایل‌های تازه‌ی همان مسیر، نه نسخه‌ی ذخیره‌شده‌ی قبلی
        if (guard != null) guard.start(u); else web.loadUrl(ASSET_URL);
    }
    private static final int REQ_VOICE = 7411;
    private static final int MAX_BYTES = 12 * 1024 * 1024;
    private static final String[] ALLOW_HOSTS = {"liliome.com", "digikala.com", "safirstores.com", "hilandbeauty.com", "hesperfume.ir", "flower-perfume.com", "khalifechi.com", "redmag.ir"};

    /** فقط سایت‌های خودِ برنامه (و زیردامنه‌هایشان) */
    private static boolean allowedHost(String h) {
        if (h == null) return false;
        h = h.toLowerCase(java.util.Locale.ROOT);
        for (String a : ALLOW_HOSTS) { if (h.equals(a) || h.endsWith("." + a)) return true; }
        return false;
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    /** حافظه‌ی عکس‌ها از ۲۰۰ مگابایت بیشتر نشود: قدیمی‌ترین فایل‌ها تا رسیدن به ۱۶۰ مگابایت پاک می‌شوند (عکسِ لازم دوباره دانلود می‌شود) */
    private void pruneImgs() {
        try {
            File[] fs = imgDir.listFiles();
            if (fs == null) return;
            long total = 0;
            final long[] age = new long[fs.length];
            for (int i = 0; i < fs.length; i++) { total += fs[i].length(); age[i] = fs[i].lastModified(); }
            final long cap = 200L * 1024 * 1024;
            if (total <= cap) return;
            Integer[] ix = new Integer[fs.length];
            for (int i = 0; i < ix.length; i++) ix[i] = i;
            java.util.Arrays.sort(ix, new java.util.Comparator<Integer>() {
                @Override public int compare(Integer a, Integer b) { return Long.compare(age[a], age[b]); }
            });
            for (int i = 0; i < ix.length && total > cap * 8 / 10; i++) {
                File f = fs[ix[i]];
                long len = f.length();
                if (f.delete()) total -= len;
            }
        } catch (Exception ignore) { }
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        // کوکی‌ها نگه داشته شوند تا ریدایرکت‌های وابسته به کوکی (مثل دیجی‌کالا) حلقه نزنند
        if (CookieHandler.getDefault() == null) CookieHandler.setDefault(new CookieManager());
        imgDir = new File(getFilesDir(), "img");
        imgDir.mkdirs();
        try { File[] old = imgDir.listFiles(); if (old != null) for (File of : old) if (of.getName().endsWith(".tmp")) of.delete(); } catch (Exception ignore) { }      // فایل‌های نیمه‌کاره‌ی دانلودِ قبلی
        new Thread(new Runnable() { @Override public void run() { pruneImgs(); } }).start();      // حافظه‌ی عکس بی‌نهایت بزرگ نشود
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0c0f1f"));
        root.setFitsSystemWindows(true);
        web = new WebView(this);
        web.setBackgroundColor(Color.TRANSPARENT);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(false);       // صریحاً بسته (پیش‌فرضِ نسخه‌های جدید هم همین است)
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(false);
        s.setTextZoom(100); // اندازه‌ی فونت سیستم نوشته‌ها را به‌هم نریزد
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String u) {
                if (u == null) return true;
                if (u.startsWith("file:///android_asset/")) return false;
                return !(guard != null && guard.loaded() && otaPrefix.length() > 0 && u.startsWith(otaPrefix));   // صفحه‌ی برنامه هرگز به جای دیگری نمی‌رود
            }
            @Override
            public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                if (guard != null) guard.renderGone(d != null && d.didCrash());      // خرابیِ دوم در دو دقیقه: بسته‌ی بی‌نصب کنار گذاشته می‌شود (بسته شدن برای کمبود حافظه شمرده نمی‌شود)
                long now = System.currentTimeMillis();
                if (now - rgT > 60000) rgN = 0;
                rgT = now; rgN++;
                final boolean again = rgN <= 3;      // پشت‌سرهم بیش از سه بار مرد: حلقه‌ی بی‌پایان نساز، برنامه بسته شود
                runOnUiThread(new Runnable() { @Override public void run() { if (again) recreate(); else finish(); } });   // WebView مرده قابل استفاده نیست؛ صفحه از نو ساخته می‌شود
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient());
        upd = new Updater(this, new Updater.Js() {
            @Override public void run(final String script) {
                runOnUiThread(new Runnable() { @Override public void run() { if (web != null) web.evaluateJavascript(script, null); } });
            }
        });
        web.addJavascriptInterface(new Bridge(), "Native");
        String start = null;
        try {
            ota = new Ota(getFilesDir(), upd.appCode());
            otaPrefix = Ota.fileUrl(ota.rootDir()) + "/b";      // ota/b<شماره>/...
            guard = new OtaGuard(ota, new OtaGuard.Env() {
                @Override public void postDog(long ms) { ui.removeCallbacks(otaDog); ui.postDelayed(otaDog, ms); }
                @Override public void cancelDog() { ui.removeCallbacks(otaDog); }
                @Override public void load(String url) { if (web != null) web.loadUrl(url == null ? ASSET_URL : url); }
                @Override public long now() { return android.os.SystemClock.elapsedRealtime(); }
            }, upd.appCode());
            start = ota.startUrl();      // null = نسخه‌ی داخل برنامه (یا بسته‌ی بی‌نصبِ خراب کنار گذاشته شد)
        } catch (Exception e) {
            start = null;
        }
        loadStart(start);
    }

    /** کارهای بروزرسانیِ بی‌نصب روی رشته‌ی خودشان اجرا می‌شوند (نه استخر مشترکِ دانلودِ قیمت‌ها که با بستنِ صفحه قطع می‌شود) */
    private void startOta(String name, Runnable r) {
        Thread t = new Thread(r, name);
        t.setDaemon(true);
        t.start();
    }

    private void evalJs(final String script) {
        runOnUiThread(new Runnable() {
            @Override public void run() { if (web != null) web.evaluateJavascript(script, null); }
        });
    }

    public class Bridge {
        @JavascriptInterface
        public void fetch(final String id, final String url, final String headersJson) {
            pool.execute(new Runnable() {
                @Override
                public void run() {
                    int status = 0;
                    String body;
                    try {
                        if (url == null || !url.startsWith("https://")) throw new java.io.IOException("bad url");      // فقط https
                        java.util.Map<String, String> hm = new java.util.HashMap<String, String>();
                        try {
                            JSONObject h = new JSONObject(headersJson == null ? "{}" : headersJson);
                            Iterator<String> it = h.keys();
                            while (it.hasNext()) { String k = it.next(); hm.put(k, h.getString(k)); }
                        } catch (Exception ignore) { }
                        // تغییر مسیر فقط به سایت‌های فهرست (ALLOW_HOSTS)؛ هدرها در هر مرحله دوباره گذاشته می‌شوند؛ پاسخِ بزرگ‌تر از حد، «موفق» حساب نمی‌شود
                        Http.Result r = Http.fetch(url, hm, Http.sitesOnly(ALLOW_HOSTS), MAX_BYTES);
                        if (r.truncated) throw new java.io.IOException("response too large (> " + MAX_BYTES + " bytes)");
                        status = r.status;
                        body = new String(r.body, java.nio.charset.StandardCharsets.UTF_8);
                    } catch (Exception e) {
                        status = 0;
                        body = e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage());
                    }
                    final String js = "window.__nat(" + JSONObject.quote(id) + "," + status + "," + JSONObject.quote(body) + ")";
                    runOnUiThread(new Runnable() {
                        @Override public void run() { if (web != null) web.evaluateJavascript(js, null); }
                    });
                }
            });
        }


        /** فهرست عکس‌های ذخیره‌شده روی گوشی: {"شناسه":"file:///..."} */
        @JavascriptInterface
        public String listImgs() {
            JSONObject o = new JSONObject();
            try {
                File[] fs = imgDir.listFiles();
                if (fs != null) for (File f : fs) {
                    String n = f.getName();
                    if (n.endsWith(".img") && f.length() > 0) o.put(n.substring(0, n.length() - 4), "file://" + f.getAbsolutePath());
                }
            } catch (Exception ignore) { }
            return o.toString();
        }

        /** عکس را یک‌بار دانلود و برای همیشه روی گوشی نگه می‌دارد. پایان کار: window.__imgDone(id, path) */
        @JavascriptInterface
        public void cacheImg(final String id, final String url) {
            if (id == null || !id.matches("[A-Za-z0-9_-]{1,40}") || url == null || !url.startsWith("http")) {
                if (id != null && id.matches("[A-Za-z0-9_-]{1,40}")) {
                    final String jf = "window.__imgFail&&window.__imgFail(" + JSONObject.quote(id) + ")";
                    runOnUiThread(new Runnable() {
                        @Override public void run() { if (web != null) web.evaluateJavascript(jf, null); }
                    });
                }
                return;
            }
            imgPool.execute(new Runnable() {
                @Override
                public void run() {
                    File dst = new File(imgDir, id + ".img");
                    File tmp = new File(imgDir, id + "." + Thread.currentThread().getId() + ".tmp");      // هر نخ فایل موقتِ خودش را دارد
                    boolean ok = dst.exists() && dst.length() > 0;
                    if (!ok) {
                        HttpURLConnection c = null;
                        try {
                            // تغییر مسیرها دستی دنبال می‌شوند و مقصدِ هر کدام دوباره سنجیده می‌شود (https، نه آدرسِ داخلی/محلی)
                            c = Http.open(url, null, Http.publicHttps(), 12000, 20000, false);
                            if (c.getResponseCode() == 200) {
                                InputStream in = c.getInputStream();
                                FileOutputStream out = new FileOutputStream(tmp);
                                byte[] buf = new byte[8192];
                                int n, total = 0;
                                boolean big = false, magicOk = false;
                                try {
                                while ((n = in.read(buf)) > 0) {
                                    if (total == 0 && n >= 4) {      // فقط عکسِ واقعی (JPEG/PNG/GIF/WebP) ذخیره شود، نه صفحه‌ی خطای HTML
                                        int b0 = buf[0] & 255, b1 = buf[1] & 255, b2 = buf[2] & 255;
                                        magicOk = (b0 == 0xFF && b1 == 0xD8) || (b0 == 0x89 && b1 == 0x50) || (b0 == 'G' && b1 == 'I' && b2 == 'F') || (b0 == 'R' && b1 == 'I' && b2 == 'F');
                                        if (!magicOk) break;
                                    }
                                    total += n;
                                    if (total > 3 * 1024 * 1024) { big = true; break; }
                                    out.write(buf, 0, n);
                                }
                                } finally {
                                    try { out.close(); } catch (Exception ignore) { }
                                    try { in.close(); } catch (Exception ignore) { }
                                }
                                if (!big && magicOk && total > 200) ok = tmp.renameTo(dst);
                                if (!ok) tmp.delete();
                            }
                        } catch (Exception e) {
                            tmp.delete();
                        } finally {
                            if (c != null) c.disconnect();
                        }
                    }
                    if (!ok) {
                        final String jf = "window.__imgFail&&window.__imgFail(" + JSONObject.quote(id) + ")";
                        runOnUiThread(new Runnable() {
                            @Override public void run() { if (web != null) web.evaluateJavascript(jf, null); }
                        });
                        return;
                    }
                    final String js = "window.__imgDone&&window.__imgDone(" + JSONObject.quote(id) + "," + JSONObject.quote("file://" + dst.getAbsolutePath()) + ")";
                    runOnUiThread(new Runnable() {
                        @Override public void run() { if (web != null) web.evaluateJavascript(js, null); }
                    });
                }
            });
        }

        /** صفحه‌ی محصول را در مرورگرِ گوشی باز می‌کند؛ فقط آدرس http(s) سایت‌های خودِ برنامه. */
        @JavascriptInterface
        public boolean open(final String url) {
            try {
                if (url == null || url.length() > 2000) return false;
                for (int i = 0; i < url.length(); i++) { char ch = url.charAt(i); if (ch <= ' ' || ch == '\\' || ch == 0x7f) return false; }
                Uri u = Uri.parse(url);
                if (u.getUserInfo() != null) return false;
                String sc = u.getScheme(), h = u.getHost();
                if (sc == null || h == null || !(sc.equals("https") || sc.equals("http"))) return false;
                h = h.toLowerCase(java.util.Locale.ROOT);
                boolean ok = false;
                ok = allowedHost(h);
                if (!ok) return false;
                final Intent it = new Intent(Intent.ACTION_VIEW, u);
                it.addCategory(Intent.CATEGORY_BROWSABLE);
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                final boolean[] res = new boolean[1];
                final java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
                runOnUiThread(new Runnable() {
                    @Override public void run() { try { startActivity(it); res[0] = true; } catch (Exception ignore) { } latch.countDown(); }
                });
                try { latch.await(2, java.util.concurrent.TimeUnit.SECONDS); } catch (InterruptedException ie) { return false; }
                return res[0];
            } catch (Exception e) { return false; }
        }

        @JavascriptInterface public int appCode() { return upd == null ? 0 : upd.appCode(); }
        @JavascriptInterface public void updCheck() { if (upd != null) upd.check(); }
        @JavascriptInterface public void updDownload() { if (upd != null) upd.download(); }
        @JavascriptInterface public boolean updInstall() { return upd != null && upd.install(); }

        /* ----- بروزرسانی بدون نصب (Ota.java) ----- */
        @JavascriptInterface public int nativeApi() { return Ota.NATIVE_API; }
        @JavascriptInterface public int webCode() { return runCode(); }

        /** آخرین بسته‌ی منتشرشده را می‌پرسد؛ نتیجه با window.__otaInfo({ok,state,code,v,cur,run}) یا {ok:false,reason:"net"|"none"} */
        @JavascriptInterface
        public void otaCheck() {
            startOta("ota-check", new Runnable() {
                @Override public void run() {
                    String js;
                    try {
                        Ota.Info i = ota.fetchInfo(otaNet);
                        js = "window.__otaInfo&&window.__otaInfo({\"ok\":true,\"state\":\"" + ota.state(i) + "\",\"code\":" + i.code + ",\"v\":\"" + i.v + "\",\"cur\":" + ota.webCode() + ",\"run\":" + runCode() + "})";
                    } catch (Exception e) {
                        String m = String.valueOf(e.getMessage());
                        js = "window.__otaInfo&&window.__otaInfo({\"ok\":false,\"reason\":\"" + (m.startsWith("http 404") ? "none" : "net") + "\"})";
                    }
                    evalJs(js);
                }
            });
        }

        /** بسته‌ی تازه را می‌گیرد و بررسی می‌کند؛ نتیجه با __otaProg(درصد)، __otaReady(code) یا __otaErr() */
        @JavascriptInterface
        public void otaDownload() {
            if (otaBusy) return;
            otaBusy = true;
            startOta("ota-download", new Runnable() {
                @Override public void run() {
                    try {
                        Ota.Info i = ota.fetchInfo(otaNet);
                        ota.install(otaNet, i, new Ota.Progress() {
                            @Override public void pct(int p) { evalJs("window.__otaProg&&window.__otaProg(" + p + ")"); }
                        });
                        evalJs("window.__otaReady&&window.__otaReady(" + i.code + ")");
                    } catch (Exception e) {
                        evalJs("window.__otaErr&&window.__otaErr()");
                    } finally {
                        otaBusy = false;
                    }
                }
            });
        }

        /** بسته‌ی دانلودشده را همین الان باز می‌کند (صفحه از نو بالا می‌آید) */
        @JavascriptInterface
        public boolean otaApply() {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        String u = ota == null ? null : ota.beginNow();
                        if (u == null || web == null) { evalJs("window.__otaErr&&window.__otaErr()"); return; }
                        loadStart(u);
                    } catch (Exception e) {
                        evalJs("window.__otaErr&&window.__otaErr()");
                    }
                }
            });
            return true;
        }

        /** جاوااسکریپتِ صفحه‌ی بسته‌ی بی‌نصب (نسخه‌ی code) شروع به اجرا کرد: مهلتِ بالا آمدن بلندتر می‌شود (ساختن فهرست روی گوشی کند چند ثانیه است) */
        @JavascriptInterface
        public void otaBoot(String code) { if (guard != null) guard.boot(code); }

        /** صفحه در شروع خطای جاوااسکریپت داد و دیگر «زنده‌ام» نخواهد گفت: به جای دو دقیقه، ۲۰ ثانیه صبر می‌کنیم */
        @JavascriptInterface
        public void otaErr(String code) { if (guard != null) guard.err(code); }

        /** صفحه‌ی بسته‌ی بی‌نصب (نسخه‌ی code) سالم بالا آمد (بدون خطا و فهرست کشیده شد). گزارشِ صفحه‌ی کهنه یا صفحه‌ی APK نادیده گرفته می‌شود. */
        @JavascriptInterface
        public void otaOk(String code) { if (guard != null) guard.ok(code); }

        /** متن را در یک فایل ذخیره می‌کند (Downloads)؛ ارسال جدا با shareBackup. مسیر/نام جا را برمی‌گرداند؛ در خطا رشته‌ی خالی. */
        @JavascriptInterface
        public String saveText(final String name, final String text) {
            try {
                final byte[] data = text.getBytes("UTF-8");
                final String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    cv.put(MediaStore.MediaColumns.MIME_TYPE, "text/plain");
                    cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    final Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) return "";
                    OutputStream os = getContentResolver().openOutputStream(uri);
                    if (os == null) return "";
                    try { os.write(data); } finally { os.close(); }
                    lastBackup = uri;
                    return "Downloads/" + safe;
                }
                File dir = getExternalFilesDir(null);
                if (dir == null) dir = getFilesDir();
                File f = new File(dir, safe);
                FileOutputStream fo = new FileOutputStream(f);
                try { fo.write(data); } finally { fo.close(); }
                lastBackupText = data.length <= 100000 ? text : null;      // محدودیتِ Binder حدود ۱ مگابایت است
                return f.getAbsolutePath();
            } catch (Exception e) {
                return "";
            }
        }

        /** آخرین پشتیبان ذخیره‌شده را از برگه‌ی اشتراک‌گذاری می‌فرستد. */
        @JavascriptInterface
        public boolean shareBackup() {
            final Uri u = lastBackup;
            final String tx = lastBackupText;
            if (u == null && tx == null) return false;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        Intent send = new Intent(Intent.ACTION_SEND);
                        send.setType("text/plain");
                        if (u != null) { send.putExtra(Intent.EXTRA_STREAM, u); send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); }
                        else send.putExtra(Intent.EXTRA_TEXT, tx);
                        startActivity(Intent.createChooser(send, "ارسال گزارش"));
                    } catch (Exception ignore) { }
                }
            });
            return true;
        }

        /** دادهٔ بزرگ را در فایلِ خودِ برنامه می‌نویسد (بدون سقفِ ۵ مگابایتیِ localStorage). نوشتن اتمیک: اول فایل موقت، بعد جایگزینی. */
        @JavascriptInterface
        public boolean fileSet(final String key, final String text) {
            try {
                String safe = key.replaceAll("[^A-Za-z0-9._-]", "_");
                File dir = getFilesDir();
                File tmp = new File(dir, safe + ".tmp");
                FileOutputStream fo = new FileOutputStream(tmp);
                try { fo.write(text.getBytes("UTF-8")); fo.getFD().sync(); } finally { fo.close(); }
                File f = new File(dir, safe + ".json");
                if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) return false; }
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        /** فایلِ ذخیره‌شده را برمی‌گرداند؛ نبودن یا خطا = رشته‌ی خالی. */
        @JavascriptInterface
        public String fileGet(final String key) {
            try {
                String safe = key.replaceAll("[^A-Za-z0-9._-]", "_");
                File f = new File(getFilesDir(), safe + ".json");
                if (!f.exists()) return "";
                FileInputStream in = new FileInputStream(f);
                try {
                    ByteArrayOutputStream bo = new ByteArrayOutputStream((int) Math.min(f.length() + 16, 64L * 1024 * 1024));
                    byte[] buf = new byte[65536]; int n;
                    while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                    return bo.toString("UTF-8");
                } finally { in.close(); }
            } catch (Exception e) {
                return "";
            }
        }


        /** گفتنِ نامِ عطر: پنجره‌ی تشخیص گفتارِ خودِ گوشی (گوگل) باز می‌شود؛ نیازی به مجوز میکروفون برای برنامه نیست. نتیجه در onActivityResult */
        @JavascriptInterface
        public void startVoice() {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        Intent it = new Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                        it.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, android.speech.RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH);
                        it.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, "fa-IR");
                        it.putExtra(android.speech.RecognizerIntent.EXTRA_MAX_RESULTS, 6);
                        it.putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT, "نام عطر را بگویید");
                        startActivityForResult(it, REQ_VOICE);
                    } catch (Exception e) {
                        if (web != null) web.evaluateJavascript("window.__voiceErr&&window.__voiceErr('fail')", null);
                    }
                }
            });
        }

        /** برنامه‌ی Play Store را باز می‌کند (برای خاموش کردنِ اسکنِ Play Protect که هر بروزرسانی «Install anyway» می‌پرسد) */
        @JavascriptInterface
        public boolean openPlayStore() {
            try {
                final Intent it = getPackageManager().getLaunchIntentForPackage("com.android.vending");
                if (it == null) return false;
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                final boolean[] res = new boolean[1];
                final java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
                runOnUiThread(new Runnable() {
                    @Override public void run() { try { startActivity(it); res[0] = true; } catch (Exception ignore) { } latch.countDown(); }
                });
                try { latch.await(2, java.util.concurrent.TimeUnit.SECONDS); } catch (InterruptedException ie) { return false; }
                return res[0];
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {      // متنِ خیلی بزرگ یا خطای سیستم نباید برنامه را بیندازد
                        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                        if (cm != null && text != null) cm.setPrimaryClip(ClipData.newPlainText("report", text.length() > 400000 ? text.substring(0, 400000) : text));
                    } catch (Throwable ignore) { }
                }
            });
        }

        @JavascriptInterface
        public void setBars(final String bg, final boolean light) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    try {
                        int col = Color.parseColor(bg);
                        root.setBackgroundColor(col);
                        getWindow().setStatusBarColor(col);
                        getWindow().setNavigationBarColor(col);
                    } catch (Exception ignore) { }
                    if (Build.VERSION.SDK_INT >= 23) {
                        int f = root.getSystemUiVisibility();
                        if (light) f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR; else f &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                        if (Build.VERSION.SDK_INT >= 26) {
                            if (light) f |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; else f &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                        }
                        root.setSystemUiVisibility(f);
                    }
                }
            });
        }
    }


    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req != REQ_VOICE || web == null) return;
        if (res == RESULT_OK && data != null) {
            java.util.ArrayList<String> l = data.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS);
            org.json.JSONArray a = new org.json.JSONArray();
            if (l != null) { for (int i = 0; i < l.size() && i < 8; i++) a.put(l.get(i)); }
            String js = a.toString().replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
            web.evaluateJavascript("window.__voiceRes&&window.__voiceRes(" + js + ")", null);
        } else {
            String code;
            if (res == RESULT_CANCELED) code = "cancel";
            else if (res == android.speech.RecognizerIntent.RESULT_NO_MATCH) code = "nomatch";
            else if (res == android.speech.RecognizerIntent.RESULT_NETWORK_ERROR || res == android.speech.RecognizerIntent.RESULT_SERVER_ERROR) code = "net";
            else if (res == android.speech.RecognizerIntent.RESULT_AUDIO_ERROR) code = "audio";
            else code = "fail";
            web.evaluateJavascript("window.__voiceErr&&window.__voiceErr('" + code + "')", null);
        }
    }

    @Override
    protected void onPause() {
        if (guard != null) guard.pause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (guard != null) guard.resume();      // صفحه‌ی در پس‌زمینه کند یا متوقف بوده؛ مهلتِ کاملش را از نو دارد
        if (web != null) web.evaluateJavascript("window.__resume&&window.__resume()", null);
    }

    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("window.__back?window.__back():false", new android.webkit.ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if (!"true".equals(v)) MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onDestroy() {
        ui.removeCallbacks(otaDog);
        if (guard != null) guard.cancel();
        pool.shutdownNow();
        imgPool.shutdownNow();
        if (web != null) { web.destroy(); web = null; }
        if (upd != null) upd.destroy();
        super.onDestroy();
    }
}
