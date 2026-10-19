package ir.perfume.price;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * بروزرسانیِ بدون نصب. تمام رابط و منطق برنامه فایل‌های وب (assets/www) است؛ پس نسخه‌ی تازه‌ی آن‌ها
 * به‌جای فایل APK گرفته و در پوشه‌ی خودِ برنامه گذاشته می‌شود. چون چیزی «نصب» نمی‌شود، اندروید و Play Protect
 * هیچ پنجره‌ای (مثل Install anyway) نشان نمی‌دهند.
 *
 * فقط وقتی APK لازم است که این کلاس‌های جاوا عوض شوند (api در version.json بالاتر از NATIVE_API شود).
 * هیچ کلاس اندرویدی اینجا نیست تا با jdk خالی هم آزمایش شود (tests/java/OtaTest.java).
 *
 * ایمنی: آدرس‌ها ثابت و فقط https گیت‌هاب؛ اندازه و SHA-256 بسته بررسی می‌شود؛ مسیرِ فایل‌ها و نوعشان بررسی می‌شود؛
 * اگر نسخه‌ی تازه بالا نیامد (MainActivity ناظر دارد) خودکار برمی‌گردد به نسخه‌ی داخل APK.
 */
final class Ota {
    /**
     * هر بار که کلاس‌های جاوا طوری عوض شوند که صفحه‌ی تازه به آن نیاز دارد، این عدد و api در version.json با هم بالا می‌روند.
     * هر تغییری در نام یا ورودی‌های متدهای پل (otaBoot، otaErr، otaOk، …) هم همین‌طور است؛ وگرنه صفحه‌ی تازه با جاوای قدیمی ناسازگار می‌ماند.
     */
    static final int NATIVE_API = 2;

    static final String BASE = "https://github.com/samaliyan/Perfino/releases/latest/download/";      // فایل‌های آخرین نسخه‌ی رسمی
    static final String INFO_URL = BASE + "ota.json";
    static final String ZIP_URL = BASE + "www.zip";

    static final long MAX_ZIP = 8L * 1024 * 1024;
    static final long MAX_TOTAL = 24L * 1024 * 1024;
    static final long MAX_FILE = 12L * 1024 * 1024;
    static final int MAX_FILES = 200;
    /** این‌قدر بار پشت‌سرهم باز شدنِ برنامه بدون «زنده‌ام» از صفحه، یعنی بسته خراب است */
    static final int MAX_TRIES = 3;
    static final long MAX_CODE = 1000000000L;
    static final int MAX_AHEAD = 5000;      // بسته‌ی OTA حداکثر این‌قدر از شماره‌ی APK جلوتر باشد
    private static final Pattern NAME_OK = Pattern.compile("[A-Za-z0-9_][A-Za-z0-9_.\\-/]{0,119}");
    private static final Set<String> EXT = new HashSet<String>();
    static {
        for (String e : new String[]{"html", "js", "css", "json", "svg", "png", "jpg", "jpeg", "webp", "ico", "woff", "woff2", "ttf", "txt"}) EXT.add(e);
    }

    interface Progress { void pct(int p); }

    /** لایه‌ی شبکه؛ در آزمایش با نمونه‌ی ساختگی عوض می‌شود */
    interface Net {
        byte[] getBytes(String url, int max) throws IOException;
        void getFile(String url, File dst, long max, Progress p) throws IOException;
    }

    interface HostPolicy { boolean allow(URL u); }

    static final class Info {
        int code, api;
        long size;
        String v, sha;
    }

    /** هر نسخه پوشه‌ی خودش را دارد (ota/b<شماره>)؛ فقط فایل cur.json می‌گوید کدام فعال است. پس عوض شدن نسخه یک «نوشتن» است، نه جابه‌جایی پوشه */
    private final File root, neu, dl, marker, prevMarker, bad, fails;
    private final int apkCode;
    /** همه‌ی نمونه‌ها (مثلاً بعد از ساخته شدنِ دوباره‌ی صفحه) یک قفل و یک «در حال دانلودم» دارند */
    private static final Object LOCK = new Object();
    private static boolean busy = false;
    /** نتیجه‌ی fail() وقتی گزارش کهنه است (آن نسخه دیگر فعال نیست): کاری نکن */
    static final String STALE = "";

    Ota(File filesDir, int apkCode) {
        root = new File(filesDir, "ota");
        neu = new File(root, "new");
        dl = new File(root, "dl.zip");
        marker = new File(root, "cur.json");
        prevMarker = new File(root, "prev.json");
        bad = new File(root, "bad.txt");
        fails = new File(root, "fails.txt");
        this.apkCode = apkCode;
    }

    /** پوشه‌ی بالاییِ همه‌ی نسخه‌ها؛ آدرس‌های مجازِ صفحه با <root>/b شروع می‌شوند */
    File rootDir() { return root; }

    File dirOf(int code) { return new File(root, "b" + code); }

    /* ---------- نوشتن و خواندنِ فایل‌های کوچک ---------- */

    static String readSmall(File f) {
        try {
            if (!f.isFile() || f.length() > 4096) return null;
            InputStream in = new FileInputStream(f);
            try {
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] b = new byte[1024]; int n;
                while ((n = in.read(b)) > 0) bo.write(b, 0, n);
                return new String(bo.toByteArray(), StandardCharsets.UTF_8);
            } finally { in.close(); }
        } catch (Exception e) {
            return null;
        }
    }

    static void writeSmall(File f, String text) throws IOException {
        File t = new File(f.getParentFile(), f.getName() + ".tmp");
        OutputStream o = new FileOutputStream(t);
        try {
            o.write(text.getBytes(StandardCharsets.UTF_8));
            o.flush();
            try { ((FileOutputStream) o).getFD().sync(); } catch (Exception ignore) { }
        } finally { o.close(); }
        // rename روی همان پوشه، فایل قبلی را یک‌جا عوض می‌کند؛ پیش از آن چیزی پاک نمی‌شود (قطع برق بین پاک‌کردن و عوض‌کردن، نشانه را نمی‌کُشد)
        if (!t.renameTo(f)) { t.delete(); throw new IOException("rename " + f.getName()); }      // اگر عوض نشد، فایل قبلی دست‌نخورده می‌ماند (حذفِ آن پیش از عوض کردن می‌تواند نشانه را بکُشد)
    }

    static String jstr(String j, String k) {
        if (j == null) return null;
        Matcher m = Pattern.compile("\"" + k + "\"\\s*:\\s*\"([^\"\\\\]{0,200})\"").matcher(j);
        return m.find() ? m.group(1) : null;
    }

    static long jnum(String j, String k, long d) {
        if (j == null) return d;
        Matcher m = Pattern.compile("\"" + k + "\"\\s*:\\s*(-?\\d{1,12})").matcher(j);
        try { return m.find() ? Long.parseLong(m.group(1)) : d; } catch (NumberFormatException e) { return d; }
    }

    static void deleteTree(File f) {
        if (f == null || !f.exists()) return;
        File[] ch = f.isDirectory() ? f.listFiles() : null;
        if (ch != null) for (File c : ch) deleteTree(c);
        f.delete();
    }

    /* ---------- نسخه‌ی بسته‌ی فعلی ---------- */

    private static int[] readCodes(File f) {      // {code, api, tries, ok} یا null
        String j = readSmall(f);
        if (j == null) return null;
        long c = jnum(j, "code", 0), a = jnum(j, "api", 0), t = jnum(j, "tries", 0), k = jnum(j, "ok", 1);
        return c > 0 && c <= MAX_CODE && a > 0 && a <= 1000 ? new int[]{(int) c, (int) a, (int) Math.max(0, Math.min(t, 1000)), k == 0 ? 0 : 1} : null;
    }

    private int[] readMarker() { return readCodes(marker); }

    private void writeMarker(int code, int api, int tries, int ok) throws IOException {
        root.mkdirs();
        writeSmall(marker, "{\"code\":" + code + ",\"api\":" + api + ",\"tries\":" + tries + ",\"ok\":" + ok + "}");
    }

    private boolean usable(int[] m) {
        return m != null && apkCode > 0 && m[0] > apkCode && m[1] <= NATIVE_API && new File(dirOf(m[0]), "index.html").isFile();
    }

    /** شمارنده‌ی نسخه‌ای که الان در صفحه اجرا می‌شود: بزرگ‌ترینِ «نسخه‌ی APK» و «بسته‌ی بی‌نصبِ معتبر» */
    int webCode() {
        synchronized (LOCK) {
            int[] m = readMarker();
            return usable(m) ? Math.max(apkCode, m[0]) : apkCode;
        }
    }

    boolean hasBundle() {
        synchronized (LOCK) { return usable(readMarker()); }
    }

    boolean hasPrev() {
        synchronized (LOCK) { return usable(readCodes(prevMarker)); }
    }

    int badCode() {
        String s = readSmall(bad);
        if (s == null) return 0;
        try { return Integer.parseInt(s.trim()); } catch (NumberFormatException e) { return 0; }
    }

    /** چند بار پشت‌سرهم بسته‌ی بی‌نصب روی این گوشی «زنده» نشده (با همین نسخه‌ی APK) */
    int failCount() {
        String s = readSmall(fails);
        if (s == null) return 0;
        String[] p = s.trim().split(",");
        try { return p.length == 2 && Integer.parseInt(p[1]) == apkCode ? Integer.parseInt(p[0]) : 0; } catch (NumberFormatException e) { return 0; }
    }

    private void setFails(int n) {
        try {
            if (n <= 0) fails.delete();
            else { root.mkdirs(); writeSmall(fails, n + "," + apkCode); }
        } catch (Exception ignore) { }
    }

    /** پوشه‌هایی که هیچ نشانه‌ای به آن‌ها اشاره نمی‌کند (نسخه‌ی کنار گذاشته‌شده، نصبِ نیمه‌کاره) پاک می‌شوند */
    private void gcLocked() {
        int[] m = readMarker(), p = readCodes(prevMarker);
        File[] ch = root.listFiles();
        if (ch == null) return;
        for (File f : ch) {
            String n = f.getName();
            if (n.matches("b[0-9]{1,10}")) {
                long c = Long.parseLong(n.substring(1));
                if ((m != null && c == m[0]) || (p != null && c == p[0])) continue;
                deleteTree(f);
            } else if (!busy && (n.equals("new") || n.equals("dl.zip"))) {
                deleteTree(f);
            } else if (n.endsWith(".tmp")) {
                f.delete();
            }
        }
    }

    /**
     * آدرس صفحه‌ای که هنگام باز شدنِ برنامه باید باز شود: null = همان صفحه‌ی داخل APK.
     * هر بار که بسته شروع می‌شود یک «تلاش» ثبت می‌شود و وقتی صفحه «زنده‌ام» گفت (ok) صفر می‌شود؛
     * اگر سه بار پشت‌سرهم زنده نشد، بسته کنار گذاشته می‌شود و (اگر باشد) نسخه‌ی سالمِ قبلی برمی‌گردد.
     */
    String startUrl() {
        synchronized (LOCK) {
            try {
                if (apkCode <= 0) return null;
                if (!marker.exists()) { gcLocked(); return null; }
                int[] m = readMarker();
                if (m == null) return null;      // نشانه ناخوانا یا خراب: این بار نسخه‌ی APK؛ چیزی پاک نمی‌شود (نصبِ بعدی آن را درست می‌کند)
                if (!usable(m)) {      // قدیمی‌تر از APK، یا برای APKِ جدیدتر، یا فایلش نیست (مثلاً قطع برق وسط نوشتن)
                    int[] p = readCodes(prevMarker);
                    if (usable(p) && p[0] < m[0]) {      // نسخه‌ی سالمِ قبلی هنوز هست: به آن برمی‌گردیم (بد شناخته نمی‌شود؛ نسخه‌ی تازه می‌تواند دوباره گرفته شود)
                        writeMarker(p[0], p[1], 1, 1);
                        prevMarker.delete();
                        gcLocked();
                        return fileUrl(new File(dirOf(p[0]), "index.html"));
                    }
                    discardAllLocked();
                    return null;
                }
                if (m[2] >= MAX_TRIES) return rollbackLocked(m, false);      // چند بار باز و بسته شدن ممکن است بی‌حوصلگیِ کاربر باشد؛ فقط کنار می‌گذاریم، نه «این گوشی بی‌نصب را نمی‌پذیرد»
                try { writeMarker(m[0], m[1], m[2] + 1, m[3]); } catch (IOException ignore) { /* شمارش ثبت نشد؛ ناظرِ برنامه هنوز هست */ }
                gcLocked();
                return fileUrl(new File(dirOf(m[0]), "index.html"));
            } catch (Exception e) {
                return null;      // خطای ناگهانی: بسته‌ی سالم پاک نمی‌شود، فقط این بار نسخه‌ی داخل APK باز می‌شود
            }
        }
    }

    static String fileUrl(File f) {
        String p = f.getAbsolutePath().replace(File.separatorChar, '/');
        return "file://" + (p.startsWith("/") ? p : "/" + p);
    }

    /** شماره‌ی نسخه‌ای که در آدرسِ صفحه‌ی بسته است (…/b157/index.html)؛ برای هر آدرس دیگر 0 */
    static int codeOf(String url) {
        if (url == null) return 0;
        Matcher m = Pattern.compile("/b([0-9]{1,10})/index\\.html$").matcher(url);
        if (!m.find()) return 0;
        long c = Long.parseLong(m.group(1));
        return c > 0 && c <= MAX_CODE ? (int) c : 0;
    }

    /** صفحه‌ی نسخه‌ی code بدون خطا بالا آمد و فهرست را کشید: بسته سالم است، نسخه‌ی قبلی لازم نیست. گزارشِ نسخه‌ی دیگر نادیده گرفته می‌شود. */
    void ok(int code) {
        synchronized (LOCK) {
            try {
                int[] m = readMarker();
                if (m == null || m[0] != code || !usable(m)) return;
                if (m[2] != 0 || m[3] != 1) writeMarker(m[0], m[1], 0, 1);
                prevMarker.delete();
                setFails(0);
                gcLocked();
            } catch (Exception ignore) { }
        }
    }

    /**
     * صفحه‌ی نسخه‌ی code در مهلتش زنده نشد: کنار گذاشته می‌شود و دوباره دانلود نمی‌شود.
     * نتیجه: آدرس نسخه‌ی سالمِ قبلی، یا null = نسخه‌ی داخل APK، یا STALE = این گزارش کهنه است (نسخه‌ی دیگری فعال شده) و کاری لازم نیست.
     */
    String fail(int code) { return failImpl(code, false); }

    /**
     * صفحه‌ی نسخه‌ی code بعد از «زنده‌ام» هم مدام خراب می‌شود (مثلاً پردازه‌ی صفحه می‌میرد): حتی اگر سالم شناخته شده بود کنار گذاشته می‌شود.
     * چون نسخه‌ی قبلی بعد از «زنده‌ام» پاک شده، معمولاً نسخه‌ی داخل APK برمی‌گردد.
     */
    String failHard(int code) { return failImpl(code, true); }

    private String failImpl(int code, boolean hard) {
        synchronized (LOCK) {
            int[] m = readMarker();
            if (m == null || m[0] != code) return STALE;
            if (!hard && m[2] == 0 && m[3] == 1) return STALE;      // در همین اجرا «زنده‌ام» گفته شده؛ ناظری که همزمان رسیده دیر آمده است
            return rollbackLocked(m, true);
        }
    }

    private String rollbackLocked(int[] m, boolean countFail) {
        markBad(m[0]);
        if (countFail) setFails(failCount() + 1);
        int[] p = readCodes(prevMarker);
        String url = null;
        if (usable(p) && p[0] < m[0]) {
            try {
                writeMarker(p[0], p[1], 1, 1);      // همین الان دارد باز می‌شود؛ یک جانشینیِ یک‌مرحله‌ای (نه حذف و ساختن)
                url = fileUrl(new File(dirOf(p[0]), "index.html"));
            } catch (IOException e) {
                url = null;
            }
        }
        if (url == null) marker.delete();
        prevMarker.delete();
        gcLocked();
        return url;
    }

    private void markBad(int code) {
        try { root.mkdirs(); writeSmall(bad, String.valueOf(Math.max(code, badCode()))); } catch (Exception ignore) { }      // بزرگ‌ترین شماره‌ی خراب؛ یک شکستِ قدیمی‌تر آن را پایین نمی‌آورد
    }

    private void discardAllLocked() {
        marker.delete();
        prevMarker.delete();
        gcLocked();
    }

    /** یک شروعِ تازه (بعد از دانلود در همان لحظه) */
    String beginNow() {
        return startUrl();
    }

    /* ---------- خواندنِ اطلاعاتِ نسخه‌ی منتشرشده ---------- */

    static Info parseInfo(String j) {
        if (j == null) return null;
        Info i = new Info();
        long code = jnum(j, "code", 0), api = jnum(j, "api", 0);
        if (code <= 0 || code > MAX_CODE || api <= 0 || api > 1000) return null;      // عددِ بزرگ نباید با بریده شدن به عددِ دیگری تبدیل شود
        i.code = (int) code;
        i.api = (int) api;
        i.size = jnum(j, "size", 0);
        i.v = jstr(j, "v");
        i.sha = jstr(j, "sha");
        if (i.code <= 0 || i.api <= 0 || i.size <= 0 || i.size > MAX_ZIP) return null;
        if (i.v == null || !i.v.matches("[0-9][0-9.]{0,11}")) return null;
        if (i.sha == null || !i.sha.matches("[0-9a-fA-F]{64}")) return null;
        i.sha = i.sha.toLowerCase(Locale.ROOT);
        return i;
    }

    Info fetchInfo(Net net) throws IOException {
        byte[] b = net.getBytes(INFO_URL, 4096);
        Info i = parseInfo(new String(b, StandardCharsets.UTF_8));
        if (i == null) throw new IOException("info");
        return i;
    }

    /**
     * "new" = با بسته‌ی بی‌نصب می‌شود؛ "same" = همین الان آخرین نسخه است؛
     * "apk" = این نسخه به نصب نیاز دارد (بخش جاوا هم عوض شده)، یا بسته‌ی بی‌نصب روی این گوشی دوبار پشت‌سرهم کار نکرده.
     */
    String state(Info i) {
        if (i.api > NATIVE_API) return "apk";
        if (i.code <= webCode() || i.code <= badCode()) return "same";
        if (apkCode > 0 && i.code > (long) apkCode + MAX_AHEAD) return "same";      // شماره‌ی بسته‌ی دروغین/اشتباهی (خیلی جلوتر از APK) نباید برنامه را برای همیشه به نسخه‌ی قدیمی میخکوب کند
        if (failCount() >= 2) return "apk";
        return "new";
    }

    /* ---------- دانلود، بررسی و جایگزینی ---------- */

    static String sha256(File f) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            InputStream in = new FileInputStream(f);
            try {
                byte[] b = new byte[16384]; int n;
                while ((n = in.read(b)) > 0) md.update(b, 0, n);
            } finally { in.close(); }
            StringBuilder sb = new StringBuilder();
            for (byte x : md.digest()) sb.append(String.format(Locale.ROOT, "%02x", x & 255));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IOException("sha");
        }
    }

    /** بسته‌ی zip را بدون هیچ فایلِ ناجور باز می‌کند؛ هر خطا یک IOException است */
    static void extract(File zip, File dest) throws IOException {
        deleteTree(dest);
        if (!dest.mkdirs()) throw new IOException("mkdir");
        String canon = dest.getCanonicalPath() + File.separator;
        int n = 0; long total = 0;
        Set<String> seen = new HashSet<String>();
        ZipInputStream zin = new ZipInputStream(new BufferedInputStream(new FileInputStream(zip)));
        try {
            ZipEntry e;
            while ((e = zin.getNextEntry()) != null) {
                if (e.isDirectory()) continue;
                String name = e.getName();
                if (++n > MAX_FILES) throw new IOException("count");
                if (!NAME_OK.matcher(name).matches() || name.contains("..") || name.contains("//") || name.endsWith("/")) throw new IOException("name");
                int dot = name.lastIndexOf('.');
                if (dot < 0 || !EXT.contains(name.substring(dot + 1).toLowerCase(Locale.ROOT))) throw new IOException("type");
                if (!seen.add(name.toLowerCase(Locale.ROOT))) throw new IOException("dup");
                File f = new File(dest, name);
                if (!f.getCanonicalPath().startsWith(canon)) throw new IOException("path");
                File par = f.getParentFile();
                if (par != null && !par.isDirectory() && !par.mkdirs()) throw new IOException("mkdir");
                long sz = 0;
                OutputStream out = new FileOutputStream(f);
                try {
                    byte[] b = new byte[16384]; int r;
                    while ((r = zin.read(b)) > 0) {
                        sz += r; total += r;
                        if (sz > MAX_FILE || total > MAX_TOTAL) throw new IOException("size");
                        out.write(b, 0, r);
                    }
                } finally {
                    try { out.flush(); ((FileOutputStream) out).getFD().sync(); } catch (Exception ignore) { }      // نشانه fsync می‌شود؛ فایل‌هایی که نشانه به آن‌ها اشاره می‌کند هم
                    out.close();
                }
            }
        } finally { zin.close(); }
        for (String need : new String[]{"index.html", "app.js", "core.js", "version.json"}) {
            if (!new File(dest, need).isFile()) throw new IOException("missing " + need);
        }
    }

    /**
     * بسته‌ی تازه را می‌گیرد، بررسی می‌کند و جای بسته‌ی قبلی می‌گذارد. از اینجا به بعد startUrl() آن را برمی‌گرداند.
     * هر مشکلی IOException می‌دهد و چیزی از نسخه‌ی کارکنندهٔ فعلی خراب نمی‌شود.
     */
    void install(Net net, Info i, Progress p) throws IOException {
        synchronized (LOCK) {
            if (busy) throw new IOException("busy");
            busy = true;
        }
        try {
            root.mkdirs();
            if (!"new".equals(state(i))) throw new IOException("not needed");
            try { if (root.getUsableSpace() < 4 * MAX_ZIP) throw new IOException("space"); } catch (SecurityException ignore) { }
            dl.delete();
            deleteTree(neu);
            net.getFile(ZIP_URL, dl, MAX_ZIP, p);
            if (dl.length() != i.size) throw new IOException("size");
            if (!sha256(dl).equals(i.sha)) throw new IOException("sha");
            extract(dl, neu);
            String vj = readSmall(new File(neu, "version.json"));
            if (vj == null || !i.v.equals(jstr(vj, "v"))) throw new IOException("version");
            long api = jnum(vj, "api", 0);
            if (api <= 0 || api > NATIVE_API || api != i.api) throw new IOException("api");
            synchronized (LOCK) {
                int[] was = readMarker();
                int[] oldPrev = readCodes(prevMarker);
                File target = dirOf(i.code);
                deleteTree(target);
                if (!neu.renameTo(target)) throw new IOException("swap");
                // نسخه‌ی فعلی فقط وقتی «نسخه‌ی قبلیِ سالم» می‌شود که واقعاً بالا آمده باشد (ok=1)؛ وگرنه نسخه‌ی قبلیِ پیشین می‌ماند
                boolean proven = was != null && usable(was) && was[3] == 1;
                try {
                    if (proven) writeSmall(prevMarker, "{\"code\":" + was[0] + ",\"api\":" + was[1] + "}");
                    writeMarker(i.code, i.api, 0, 0);      // تنها لحظه‌ی «تصمیم»: از اینجا نسخه‌ی تازه فعال است
                } catch (IOException e) {
                    if (proven) {
                        try { if (oldPrev != null) writeSmall(prevMarker, "{\"code\":" + oldPrev[0] + ",\"api\":" + oldPrev[1] + "}"); else prevMarker.delete(); } catch (IOException ignore) { }
                    }
                    deleteTree(target);
                    throw e;
                }
                gcLocked();
            }
        } finally {
            dl.delete();
            deleteTree(neu);
            synchronized (LOCK) { busy = false; }
        }
    }

    /* ---------- شبکه‌ی واقعی ---------- */

    static final HostPolicy GITHUB = new HostPolicy() {
        @Override public boolean allow(URL u) {
            if (!"https".equals(u.getProtocol())) return false;
            String h = u.getHost() == null ? "" : u.getHost().toLowerCase(Locale.ROOT);
            return h.equals("github.com") || h.endsWith(".githubusercontent.com");
        }
    };

    static final class HttpNet implements Net {
        private final HostPolicy policy;
        private final long deadlineMs;      // کل زمانِ یک دریافت؛ اتصالِ قطره‌چکانی که هیچ‌وقت تمام نمی‌شود، «در حال دانلودم» را برای همیشه نگه ندارد
        HttpNet(HostPolicy p) { this(p, 300000); }
        HttpNet(HostPolicy p, long deadlineMs) { policy = p; this.deadlineMs = deadlineMs; }

        private HttpURLConnection open(String url, int timeoutMs) throws IOException {
            for (int hop = 0; hop < 6; hop++) {
                URL u = new URL(url);
                if (!policy.allow(u)) throw new IOException("host");
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(timeoutMs);
                c.setReadTimeout(timeoutMs);
                c.setInstanceFollowRedirects(false);
                c.setRequestProperty("User-Agent", "Perfino-ota");
                c.setRequestProperty("Accept", "application/octet-stream, application/json, */*");
                int st = c.getResponseCode();
                if (st >= 300 && st < 400) {
                    String loc = c.getHeaderField("Location");
                    c.disconnect();
                    if (loc == null) throw new IOException("redirect");
                    url = new URL(u, loc).toString();
                    continue;
                }
                if (st != 200) { c.disconnect(); throw new IOException("http " + st); }
                return c;
            }
            throw new IOException("redirects");
        }

        @Override public byte[] getBytes(String url, int max) throws IOException {
            final long t0 = System.nanoTime();
            HttpURLConnection c = open(url, 15000);
            try {
                InputStream in = c.getInputStream();
                try {
                    ByteArrayOutputStream bo = new ByteArrayOutputStream();
                    byte[] b = new byte[2048]; int n, tot = 0;
                    while ((n = in.read(b)) > 0) {
                        tot += n; if (tot > max) throw new IOException("big");
                        if ((System.nanoTime() - t0) / 1000000L > deadlineMs) throw new IOException("slow");
                        bo.write(b, 0, n);
                    }
                    return bo.toByteArray();
                } finally { in.close(); }
            } finally { c.disconnect(); }
        }

        @Override public void getFile(String url, File dst, long max, Progress p) throws IOException {
            final long t0 = System.nanoTime();
            HttpURLConnection c = open(url, 30000);
            try {
                long len = c.getContentLengthLong();
                if (len > max) throw new IOException("big");
                InputStream in = c.getInputStream();
                OutputStream out = new FileOutputStream(dst);
                try {
                    byte[] b = new byte[16384]; int n, last = -1; long tot = 0;
                    while ((n = in.read(b)) > 0) {
                        tot += n;
                        if (tot > max) throw new IOException("big");
                        if ((System.nanoTime() - t0) / 1000000L > deadlineMs) throw new IOException("slow");
                        out.write(b, 0, n);
                        if (p != null && len > 0) { int pc = (int) (tot * 100L / len); if (pc >= last + 5 && pc < 100) { last = pc; p.pct(pc); } }
                    }
                } finally {
                    try { out.close(); } catch (Exception ignore) { }
                    try { in.close(); } catch (Exception ignore) { }
                }
            } finally { c.disconnect(); }
        }
    }
}
