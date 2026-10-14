package ir.perfume.price;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
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
import java.io.FileOutputStream;
import java.io.InputStream;
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
    private final ExecutorService pool = Executors.newFixedThreadPool(8);
    private final ExecutorService imgPool = Executors.newFixedThreadPool(3);
    private File imgDir;
    private Updater upd;
    private static final int MAX_BYTES = 12 * 1024 * 1024;
    private static final String[] ALLOW_HOSTS = {"liliome.com", "digikala.com", "safirstores.com", "hilandbeauty.com"};

    /** فقط سایت‌های خودِ برنامه (و زیردامنه‌هایشان) */
    private static boolean allowedHost(String h) {
        if (h == null) return false;
        h = h.toLowerCase(java.util.Locale.ROOT);
        for (String a : ALLOW_HOSTS) { if (h.equals(a) || h.endsWith("." + a)) return true; }
        return false;
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        // کوکی‌ها نگه داشته شوند تا ریدایرکت‌های وابسته به کوکی (مثل دیجی‌کالا) حلقه نزنند
        if (CookieHandler.getDefault() == null) CookieHandler.setDefault(new CookieManager());
        imgDir = new File(getFilesDir(), "img");
        imgDir.mkdirs();
        try { File[] old = imgDir.listFiles(); if (old != null) for (File of : old) if (of.getName().endsWith(".tmp")) of.delete(); } catch (Exception ignore) { }      // فایل‌های نیمه‌کاره‌ی دانلودِ قبلی
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
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(false);
        s.setTextZoom(100); // اندازه‌ی فونت سیستم نوشته‌ها را به‌هم نریزد
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String u) {
                return u == null || !u.startsWith("file:///android_asset/");   // صفحه‌ی برنامه هرگز به جای دیگری نمی‌رود
            }
            @Override
            public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                runOnUiThread(new Runnable() { @Override public void run() { recreate(); } });   // WebView مرده قابل استفاده نیست؛ صفحه از نو ساخته می‌شود
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
        web.loadUrl("file:///android_asset/www/index.html");
    }

    public class Bridge {
        @JavascriptInterface
        public void fetch(final String id, final String url, final String headersJson) {
            pool.execute(new Runnable() {
                @Override
                public void run() {
                    int status = 0;
                    String body;
                    HttpURLConnection c = null;
                    try {
                        if (url == null || !url.startsWith("https://")) throw new java.io.IOException("bad url");      // فقط https
                        URL u0 = new URL(url);
                        if (!allowedHost(u0.getHost())) throw new java.io.IOException("host not allowed");
                        c = (HttpURLConnection) u0.openConnection();
                        c.setConnectTimeout(15000);
                        c.setReadTimeout(25000);
                        c.setInstanceFollowRedirects(false);
                        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36");
                        c.setRequestProperty("Accept-Language", "fa-IR,fa;q=0.9,en;q=0.5");
                        c.setRequestProperty("Accept", "application/json, text/html;q=0.9, */*;q=0.5");
                        try {
                            JSONObject h = new JSONObject(headersJson == null ? "{}" : headersJson);
                            Iterator<String> it = h.keys();
                            while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                        } catch (Exception ignore) { }
                        status = c.getResponseCode();
                        for (int hop = 0; hop < 5 && status >= 300 && status < 400; hop++) {   // تغییر مسیر فقط به همان چهار سایت
                            String loc = c.getHeaderField("Location");
                            if (loc == null) break;
                            URL nu = new URL(u0, loc);
                            if (!nu.getProtocol().equals("https") || !allowedHost(nu.getHost())) throw new java.io.IOException("redirect not allowed");
                            c.disconnect();
                            u0 = nu;
                            c = (HttpURLConnection) u0.openConnection();
                            c.setConnectTimeout(15000);
                            c.setReadTimeout(25000);
                            c.setInstanceFollowRedirects(false);
                            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36");
                            c.setRequestProperty("Accept-Language", "fa-IR,fa;q=0.9,en;q=0.5");
                            status = c.getResponseCode();
                        }
                        InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                        ByteArrayOutputStream out = new ByteArrayOutputStream();
                        if (in != null) {
                            byte[] buf = new byte[16384];
                            int n, total = 0;
                            while ((n = in.read(buf)) > 0 && total < MAX_BYTES) { out.write(buf, 0, n); total += n; }
                            in.close();
                        }
                        body = out.toString("UTF-8");
                    } catch (Exception e) {
                        status = 0;
                        body = e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage());
                    } finally {
                        if (c != null) c.disconnect();
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
                            URL iu = new URL(url);
                            String ih = iu.getHost() == null ? "" : iu.getHost().toLowerCase(java.util.Locale.ROOT);
                            if (!iu.getProtocol().equals("https") || ih.isEmpty() || ih.equals("localhost") || ih.matches("[0-9.]+") || ih.contains(":") || ih.endsWith(".local")) throw new java.io.IOException("image host not allowed");
                            c = (HttpURLConnection) iu.openConnection();
                            c.setConnectTimeout(12000);
                            c.setReadTimeout(20000);
                            c.setInstanceFollowRedirects(true);
                            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36");
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

        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("report", text));
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
    protected void onResume() {
        super.onResume();
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
        pool.shutdownNow();
        imgPool.shutdownNow();
        if (web != null) { web.destroy(); web = null; }
        if (upd != null) upd.destroy();
        super.onDestroy();
    }
}
