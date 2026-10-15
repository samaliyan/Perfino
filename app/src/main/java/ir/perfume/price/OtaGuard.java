package ir.perfume.price;

/**
 * ناظرِ بسته‌ی بی‌نصب: «صفحه‌ی تازه زنده شد یا نه» را نگه می‌دارد و اگر زنده نشد برمی‌گرداند.
 * هیچ وابستگی به اندروید ندارد (زمان و باز کردن صفحه را Env می‌دهد)، پس با JDK و ساعتِ ساختگی آزمایش می‌شود (tests/java/.../GuardTest.java).
 * از چند رشته صدا زده می‌شود (رشته‌ی اصلی، پل جاوااسکریپت)؛ حالت‌ها و تصمیم‌های «سالم/ناسالم» با قفلِ همین شیء نگه داشته می‌شوند (کارِ فایل‌ها کوچک است)؛ فقط باز کردنِ صفحه بیرون از قفل است. ترتیب قفل‌ها: ناظر ← Ota.
 */
final class OtaGuard {
    interface Env {
        void postDog(long ms);      // ناظرِ در انتظار را بردار و یکی تازه بگذار (پس از ms میلی‌ثانیه dogFired() صدا زده شود)
        void cancelDog();
        void load(String url);      // آدرس بسته؛ null = صفحه‌ی داخل APK
        long now();                 // ساعتِ یکنواخت، میلی‌ثانیه
    }

    static final long DOG_MS = 30000;      // تا وقتی هیچ جاوااسکریپتی اجرا نشده
    static final long BOOT_MS = 120000;      // بعد از «دارم بالا می‌آیم» (روی گوشی کند، ساختن فهرست ثانیه‌ها طول می‌کشد)
    static final long ERR_MS = 20000;      // بعد از خطای جاوااسکریپتِ شروع: دیگر «زنده‌ام» نمی‌گوید، پس بیشتر منتظر نمی‌مانیم
    static final long BG_MS = 15000;      // برنامه در پس‌زمینه است: هر ۱۵ ثانیه دوباره نگاه می‌کند
    static final long CRASH_WINDOW_MS = 120000;

    /** شمارشِ مرگ پردازه‌ی صفحه؛ بین دوباره‌ساخته شدنِ Activity می‌ماند */
    private static final Object CRASH_LOCK = new Object();
    private static long crashAt = 0;
    private static int crashN = 0;
    static void resetCrashes() { synchronized (CRASH_LOCK) { crashAt = 0; crashN = 0; } }

    private final Ota ota;
    private final Env env;
    private final int apkCode;
    private boolean loaded = false, alive = false, resumed = false;
    private int run;
    private long grace = DOG_MS;

    OtaGuard(Ota ota, Env env, int apkCode) {
        this.ota = ota; this.env = env; this.apkCode = apkCode; this.run = apkCode;
    }

    synchronized boolean loaded() { return loaded; }

    /** شماره‌ی نسخه‌ای که همین الان در صفحه اجرا می‌شود (بسته یا APK) */
    synchronized int runCode() { return run; }

    /** صفحه را باز می‌کند: u = آدرس بسته، یا null = صفحه‌ی داخل APK. از رشته‌ی اصلی صدا زده شود. */
    void start(String u) {
        int c = Ota.codeOf(u);      // شماره را از خودِ آدرس می‌گیریم، نه از خواندنِ جداگانه‌ای که با نصبِ همزمان می‌تواند فرق کند
        synchronized (this) {
            env.cancelDog();
            alive = false;
            if (u != null && ota != null && c > 0) {
                loaded = true; run = c; grace = DOG_MS;
                env.postDog(grace);
            } else {
                loaded = false; run = apkCode; u = null;
            }
        }
        env.load(u);
    }

    /** گزارشی که از صفحه‌ی همین نسخه‌ی در حال اجرا نیامده (صفحه‌ی کهنه‌ای که هنوز زنده است، یا صفحه‌ی APK) نادیده گرفته می‌شود */
    private boolean mine(String c) {
        try { return loaded && c != null && Integer.parseInt(c.trim()) == run; } catch (Exception e) { return false; }
    }

    private void rearm(long ms) { grace = ms; env.postDog(ms); }

    /** جاوااسکریپتِ صفحه شروع شد: مهلتِ بالا آمدن بلندتر می‌شود */
    synchronized void boot(String code) {
        if (!mine(code) || alive || grace == ERR_MS) return;      // خطا قبلاً گزارش شده؛ مهلت را دوباره بلند نکن
        rearm(BOOT_MS);
    }

    /** صفحه در شروع خطا داد و «زنده‌ام» نخواهد گفت: به جای دو دقیقه، ۲۰ ثانیه صبر می‌کنیم */
    synchronized void err(String code) {
        if (!mine(code) || alive) return;
        rearm(ERR_MS);
    }

    /** صفحه سالم بالا آمد. نوشتنِ نشانه زیر همان قفلِ ناظر است تا ناظر و «زنده‌ام» هیچ‌وقت وسطِ هم نیفتند (یا اولی، یا دومی) */
    synchronized void ok(String code) {
        if (!mine(code)) return;
        alive = true;
        env.cancelDog();
        if (ota != null) ota.ok(run);
    }

    /** مهلت تمام شد (رشته‌ی اصلی) */
    void dogFired() {
        String back;
        synchronized (this) {
            if (!loaded || alive) return;
            if (!resumed) { env.postDog(BG_MS); return; }      // برنامه در پس‌زمینه (یا پنجره‌ی دیگری باز) است؛ زمانی که صفحه نمی‌توانسته کار کند حساب نمی‌شود
            int c = run;
            try {
                back = ota.fail(c);
                if (Ota.STALE.equals(back)) {      // نشانه دیگر «اجرای نشده‌ی» این صفحه نیست
                    back = ota.failHard(c);      // نشانه می‌گوید «سالم» ولی این صفحه نگفته (مثلاً نوشتنِ شمارنده شکست خورده): همین صفحه کنار گذاشته می‌شود
                    if (Ota.STALE.equals(back)) back = ota.startUrl();      // نسخه‌ی دیگری (نصب تازه) جایش را گرفته: همان را باز کن، نه اینکه صفحه‌ی ناسالم بماند
                }
            } catch (Exception e) { back = null; }      // خطای ناگهانی: صفحه‌ی داخل APK
        }
        start(back);      // بازکردنِ صفحه بیرون از قفل
    }

    synchronized void pause() { resumed = false; }

    /** برنامه برگشت: صفحه (که در پس‌زمینه کند یا متوقف بوده) مهلتِ کاملش را از نو دارد */
    synchronized void resume() {
        resumed = true;
        if (loaded && !alive) env.postDog(grace);
    }

    /**
     * پردازه‌ی صفحه مُرد. crashed=false یعنی سیستم آن را برای کمبود حافظه بسته (عادی است و به بسته ربطی ندارد): شمرده نمی‌شود.
     * بار دوم «خرابی» در دو دقیقه، بسته‌ی بی‌نصب (حتی اگر یک بار «زنده‌ام» گفته) کنار گذاشته می‌شود.
     */
    void renderGone(boolean crashed) {
        if (!crashed) return;
        int c = 0;
        synchronized (CRASH_LOCK) {
            long now = env.now();
            if (now - crashAt > CRASH_WINDOW_MS) crashN = 0;
            crashAt = now; crashN++;
            if (crashN >= 2) { synchronized (this) { if (loaded) c = run; } }
        }
        if (c > 0 && ota != null) { try { ota.failHard(c); } catch (Exception ignore) { } }
    }

    synchronized void cancel() { env.cancelDog(); }
}
