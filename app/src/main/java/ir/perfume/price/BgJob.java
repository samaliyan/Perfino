package ir.perfume.price;

import android.annotation.SuppressLint;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * بروزرسانیِ قیمت‌ها وقتی برنامه بسته است.
 * اندروید این کار را هر چند ساعت یک بار، فقط با وای‌فای، صدا می‌زند. یک صفحه‌ی بی‌نمایش همان فایل‌های برنامه را با «?bg=1» باز می‌کند؛
 * خودِ صفحه تصمیم می‌گیرد: اگر قیمت‌ها کمتر از ۲۰ ساعت کهنه‌اند کاری نمی‌کند، وگرنه آرام (۲ درخواستِ هم‌زمان) بروز می‌کند و با Native.bgDone خبر می‌دهد.
 * اندروید به هر نوبت حدودِ ۱۰ دقیقه وقت می‌دهد؛ اگر کار تمام نشد، صفحه جای کار را یادداشت کرده و نوبتِ بعدی (چند دقیقه بعد) از همان‌جا ادامه می‌دهد.
 * اگر برنامه روی صفحه باز باشد این کار شروع نمی‌شود، و اگر وسطِ کار باز شود همان لحظه کنار می‌رود (دو صفحه هم‌زمان روی یک حافظه ننویسند).
 * هر خطایی اینجا فقط همین نوبت را تمام می‌کند؛ به خودِ برنامه دست نمی‌زند.
 */
public class BgJob extends JobService {
    static final int JOB_DAILY = 7201, JOB_MORE = 7202;
    static final long PERIOD_MS = 6 * 60 * 60 * 1000L;      // هر ۶ ساعت نگاه می‌کند؛ بروزرسانیِ واقعی فقط وقتی قیمت‌ها ۲۰ ساعت یا بیشتر کهنه‌اند
    static final long MAX_RUN_MS = 9 * 60 * 1000L;          // کمتر از سقفِ ۱۰ دقیقه‌ایِ اندروید
    private static BgJob running;                            // فقط روی رشته‌ی اصلی خوانده و نوشته می‌شود

    private final Handler ui = new Handler(Looper.getMainLooper());
    private WebView web;
    private JobParameters params;
    private ExecutorService pool;
    private boolean done;
    private final Runnable cap = new Runnable() { @Override public void run() { finish(true); } };

    /** نوبتِ همیشگی (اگر از قبل ثبت است دست نمی‌خورد تا شمارشِ اندروید از نو شروع نشود) */
    static void schedule(Context c) {
        try {
            JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            if (js == null) return;
            for (JobInfo j : js.getAllPendingJobs()) if (j.getId() == JOB_DAILY) return;
            JobInfo.Builder b = new JobInfo.Builder(JOB_DAILY, new ComponentName(c, BgJob.class))
                    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED)      // فقط وای‌فای
                    .setPeriodic(PERIOD_MS)
                    .setPersisted(true);                                          // بعد از خاموش و روشن شدنِ گوشی هم بماند
            js.schedule(b.build());
        } catch (Throwable ignore) { }
    }

    /** کار نیمه‌تمام ماند: چند دقیقه‌ی دیگر (باز هم فقط با وای‌فای) ادامه بده */
    private static void scheduleMore(Context c) {
        try {
            JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            if (js == null) return;
            JobInfo.Builder b = new JobInfo.Builder(JOB_MORE, new ComponentName(c, BgJob.class))
                    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED)
                    .setMinimumLatency(2 * 60 * 1000L)
                    .setOverrideDeadline(30 * 60 * 1000L);
            js.schedule(b.build());
        } catch (Throwable ignore) { }
    }

    /** صفحه‌ی برنامه (که پشتِ برنامه‌های دیگر بود) بروزرسانیِ پس‌زمینه را تمام کرد */
    static void pageDone(boolean more) {
        BgJob r = running;
        if (r != null && r.web == null) r.finish(more);
    }

    /** برنامه باز شد: کارِ پس‌زمینه‌ی در جریان همین حالا کنار برود (روی رشته‌ی اصلی صدا زده می‌شود) */
    static void abortRunning() {
        BgJob r = running;
        if (r != null) r.finish(false);
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    public boolean onStartJob(JobParameters p) {
        try {
            if (MainActivity.front || running != null) return false;      // برنامه جلوی چشم است (خودش بروز می‌کند) یا نوبتِ دیگری در جریان است
            params = p;
            done = false;
            if (MainActivity.alive) {      // برنامه باز مانده ولی پشتِ برنامه‌های دیگر است: همان صفحه بروز می‌کند و با bgDone خبر می‌دهد
                if (!MainActivity.bgRunInPage()) { params = null; return false; }
                running = this;
                ui.postDelayed(cap, MAX_RUN_MS);
                return true;
            }
            pool = Executors.newFixedThreadPool(3);
            if (java.net.CookieHandler.getDefault() == null) java.net.CookieHandler.setDefault(new java.net.CookieManager());
            web = new WebView(getApplicationContext());
            WebSettings s = web.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setAllowFileAccess(true);
            s.setAllowFileAccessFromFileURLs(false);
            s.setAllowUniversalAccessFromFileURLs(false);
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            s.setBlockNetworkImage(true);      // عکس در پس‌زمینه لازم نیست
            web.setWebViewClient(new WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(WebView v, String u) { return true; }      // صفحه‌ی بی‌نمایش هیچ‌جا نمی‌رود
                @Override public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                    ui.post(new Runnable() { @Override public void run() { finish(true); } });
                    return true;
                }
            });
            web.addJavascriptInterface(new B(), "Native");
            String start = null;
            try { start = new Ota(getFilesDir(), appCode()).peekUrl(); } catch (Throwable ignore) { }
            running = this;
            ui.postDelayed(cap, MAX_RUN_MS);
            web.loadUrl((start == null ? "file:///android_asset/www/index.html" : start) + "?bg=1");
            return true;      // کار ادامه دارد؛ پایانش را finish() خبر می‌دهد
        } catch (Throwable e) {
            cleanup();
            return false;
        }
    }

    @Override
    public boolean onStopJob(JobParameters p) {      // اندروید کار را قطع کرد (وای‌فای رفت، وقت تمام شد): جای کار در حافظه‌ی صفحه مانده
        boolean was = !done;
        done = true;
        cleanup();
        return was && p != null && p.getJobId() == JOB_MORE;      // نوبتِ «ادامه» دوباره امتحان شود؛ نوبتِ همیشگی خودش برمی‌گردد
    }

    /** پایانِ این نوبت. more = کار نیمه‌تمام است */
    private void finish(boolean more) {
        if (done) return;
        done = true;
        JobParameters p = params;
        cleanup();
        try { if (p != null) jobFinished(p, false); } catch (Throwable ignore) { }
        if (more && !MainActivity.front) scheduleMore(getApplicationContext());
    }

    private void cleanup() {
        try { ui.removeCallbacks(cap); } catch (Throwable ignore) { }
        if (running == this) running = null;
        try { if (pool != null) pool.shutdownNow(); } catch (Throwable ignore) { }
        pool = null;
        try { if (web != null) { web.stopLoading(); web.loadUrl("about:blank"); web.destroy(); } } catch (Throwable ignore) { }
        web = null;
        params = null;
    }

    @Override
    public void onDestroy() {
        done = true;
        cleanup();
        super.onDestroy();
    }

    private int appCode() {
        try {
            PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode;
        } catch (Throwable e) {
            return 0;
        }
    }

    private void eval(final String js) {
        ui.post(new Runnable() {
            @Override public void run() { try { if (web != null && !done) web.evaluateJavascript(js, null); } catch (Throwable ignore) { } }
        });
    }

    /** فقط همان چیزهایی که بروزرسانیِ قیمت لازم دارد؛ صفحه نبودنِ بقیه (عکس، صدا، نصب) را خودش می‌فهمد */
    public class B {
        @JavascriptInterface
        public void fetch(final String id, final String url, final String headersJson) {
            final ExecutorService ex = pool;
            if (ex == null) return;
            try {
                ex.execute(new Runnable() {
                    @Override public void run() {
                        int status = 0;
                        String body;
                        try {
                            if (url == null || !url.startsWith("https://")) throw new java.io.IOException("bad url");
                            java.util.Map<String, String> hm = new java.util.HashMap<String, String>();
                            try {
                                JSONObject h = new JSONObject(headersJson == null ? "{}" : headersJson);
                                Iterator<String> it = h.keys();
                                while (it.hasNext()) { String k = it.next(); hm.put(k, h.getString(k)); }
                            } catch (Exception ignore) { }
                            Http.Result r = Http.fetch(url, hm, Http.sitesOnly(MainActivity.ALLOW_HOSTS), MainActivity.MAX_BYTES);
                            if (r.truncated) throw new java.io.IOException("response too large");
                            status = r.status;
                            body = new String(r.body, java.nio.charset.StandardCharsets.UTF_8);
                        } catch (Throwable e) {
                            status = 0;
                            body = e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage());
                        }
                        eval("window.__nat(" + JSONObject.quote(id) + "," + status + "," + JSONObject.quote(body) + ")");
                    }
                });
            } catch (Throwable ignore) { }      // نوبت تمام شده و استخر بسته است
        }

        @JavascriptInterface
        public boolean fileSet(final String key, final String text) {
            if (done || MainActivity.alive) return false;      // برنامه باز شده: دیگر چیزی روی حافظه‌اش ننویس
            try {
                String safe = key.replaceAll("[^A-Za-z0-9._-]", "_");
                File dir = getFilesDir();
                File tmp = new File(dir, safe + ".bg.tmp");
                FileOutputStream fo = new FileOutputStream(tmp);
                try { fo.write(text.getBytes("UTF-8")); fo.getFD().sync(); } finally { fo.close(); }
                File f = new File(dir, safe + ".json");
                if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) return false; }
                return true;
            } catch (Throwable e) {
                return false;
            }
        }

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
            } catch (Throwable e) {
                return "";
            }
        }

        @JavascriptInterface public int appCode() { return BgJob.this.appCode(); }
        @JavascriptInterface public int nativeApi() { return Ota.NATIVE_API; }
        @JavascriptInterface public void busy(boolean on) { }

        /** صفحه کارش را تمام کرد. more = نیمه‌تمام ماند (چند دقیقه‌ی دیگر ادامه) */
        @JavascriptInterface
        public void bgDone(final boolean ok, final boolean more) {
            ui.post(new Runnable() { @Override public void run() { finish(more); } });
        }
    }
}
