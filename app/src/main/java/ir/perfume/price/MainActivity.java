package ir.perfume.price;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
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
    private static final int MAX_BYTES = 12 * 1024 * 1024;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        // کوکی‌ها نگه داشته شوند تا ریدایرکت‌های وابسته به کوکی (مثل دیجی‌کالا) حلقه نزنند
        if (CookieHandler.getDefault() == null) CookieHandler.setDefault(new CookieManager());
        imgDir = new File(getFilesDir(), "img");
        imgDir.mkdirs();
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
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(false);
        s.setTextZoom(100); // اندازه‌ی فونت سیستم نوشته‌ها را به‌هم نریزد
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
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
                        c = (HttpURLConnection) new URL(url).openConnection();
                        c.setConnectTimeout(15000);
                        c.setReadTimeout(25000);
                        c.setInstanceFollowRedirects(true);
                        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36");
                        c.setRequestProperty("Accept-Language", "fa-IR,fa;q=0.9,en;q=0.5");
                        c.setRequestProperty("Accept", "application/json, text/html;q=0.9, */*;q=0.5");
                        try {
                            JSONObject h = new JSONObject(headersJson == null ? "{}" : headersJson);
                            Iterator<String> it = h.keys();
                            while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                        } catch (Exception ignore) { }
                        status = c.getResponseCode();
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
            if (id == null || !id.matches("[A-Za-z0-9_-]{1,40}")) return;
            imgPool.execute(new Runnable() {
                @Override
                public void run() {
                    File dst = new File(imgDir, id + ".img");
                    File tmp = new File(imgDir, id + ".tmp");
                    boolean ok = dst.exists() && dst.length() > 0;
                    if (!ok) {
                        HttpURLConnection c = null;
                        try {
                            c = (HttpURLConnection) new URL(url).openConnection();
                            c.setConnectTimeout(12000);
                            c.setReadTimeout(20000);
                            c.setInstanceFollowRedirects(true);
                            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36");
                            if (c.getResponseCode() == 200) {
                                InputStream in = c.getInputStream();
                                FileOutputStream out = new FileOutputStream(tmp);
                                byte[] buf = new byte[8192];
                                int n, total = 0;
                                boolean big = false;
                                while ((n = in.read(buf)) > 0) {
                                    total += n;
                                    if (total > 3 * 1024 * 1024) { big = true; break; }
                                    out.write(buf, 0, n);
                                }
                                out.close();
                                in.close();
                                if (!big && total > 200) ok = tmp.renameTo(dst);
                                if (!ok) tmp.delete();
                            }
                        } catch (Exception e) {
                            tmp.delete();
                        } finally {
                            if (c != null) c.disconnect();
                        }
                    }
                    if (!ok) return;
                    final String js = "window.__imgDone&&window.__imgDone(" + JSONObject.quote(id) + "," + JSONObject.quote("file://" + dst.getAbsolutePath()) + ")";
                    runOnUiThread(new Runnable() {
                        @Override public void run() { if (web != null) web.evaluateJavascript(js, null); }
                    });
                }
            });
        }

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
        super.onDestroy();
    }
}
