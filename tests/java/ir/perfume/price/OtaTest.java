package ir.perfume.price;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;
import com.sun.net.httpserver.*;

/** آزمایش Ota.java بدون اندروید:  javac -d out Ota.java OtaTest.java && java -cp out ir.perfume.price.OtaTest <پوشه‌ی www واقعی> <پوشه‌ی خروجی make-ota> */
public class OtaTest {
    static int ok = 0, bad = 0;
    static void chk(String name, boolean c, Object info) {
        if (c) ok++; else bad++;
        System.out.println((c ? "PASS " : "FAIL ") + name + (c || info == null ? "" : "  " + info));
    }
    static void chk(String name, boolean c) { chk(name, c, null); }

    static File tmp(String p) throws IOException { return Files.createTempDirectory(p).toFile(); }

    static byte[] zipOf(Object... kv) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        ZipOutputStream z = new ZipOutputStream(bo);
        for (int i = 0; i < kv.length; i += 2) {
            z.putNextEntry(new ZipEntry((String) kv[i]));
            Object v = kv[i + 1];
            z.write(v instanceof byte[] ? (byte[]) v : ((String) v).getBytes(StandardCharsets.UTF_8));
            z.closeEntry();
        }
        z.close();
        return bo.toByteArray();
    }
    static String sha(byte[] b) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        StringBuilder sb = new StringBuilder(); for (byte x : md.digest(b)) sb.append(String.format("%02x", x & 255)); return sb.toString();
    }
    static byte[] good(String v, int api, String extra) throws IOException {
        return zipOf("index.html", "<html>" + v + "</html>", "app.js", "var VERSION='" + v + "';" + extra, "core.js", "//core", "version.json", "{\"v\":\"" + v + "\",\"api\":" + api + "}");
    }
    static Ota.Info info(byte[] z, int code, String v, int api) throws Exception {
        Ota.Info i = new Ota.Info(); i.code = code; i.v = v; i.api = api; i.size = z.length; i.sha = sha(z); return i;
    }
    /** شبکه‌ی ساختگی */
    static class FakeNet implements Ota.Net {
        byte[] zip; String infoJson; int fails = 0; List<Integer> pcts = new ArrayList<>(); int zipGets = 0;
        public byte[] getBytes(String url, int max) throws IOException {
            if (!url.equals(Ota.INFO_URL)) throw new IOException("url " + url);
            if (infoJson == null) throw new IOException("http 404");
            return infoJson.getBytes(StandardCharsets.UTF_8);
        }
        public void getFile(String url, File dst, long max, Ota.Progress p) throws IOException {
            if (!url.equals(Ota.ZIP_URL)) throw new IOException("url " + url);
            zipGets++;
            if (fails > 0) { fails--; throw new IOException("net"); }
            Files.write(dst.toPath(), zip);
            if (p != null) { p.pct(40); p.pct(80); }
        }
    }
    static String tree(File d) {
        List<String> l = new ArrayList<>();
        walk(d, d, l); Collections.sort(l); return l.toString();
    }
    static void walk(File base, File f, List<String> out) {
        File[] c = f.listFiles(); if (c == null) return;
        for (File x : c) { if (x.isDirectory()) walk(base, x, out); else out.add(base.toURI().relativize(x.toURI()).getPath() + ":" + x.length()); }
    }
    static boolean throwsIO(Callable r) { try { r.run(); return false; } catch (IOException e) { return true; } catch (Exception e) { return false; } }
    interface Callable { void run() throws Exception; }
    static String msg(Callable r) { try { r.run(); return "no error"; } catch (Exception e) { return e.getMessage(); } }

    public static void main(String[] a) throws Exception {
        String wwwReal = a.length > 0 ? a[0] : null, otaOut = a.length > 1 ? a[1] : null;

        // ---------- parseInfo ----------
        String okJ = "{\"code\":157,\"v\":\"1.32\",\"api\":2,\"size\":114941,\"sha\":\"" + "a".repeat(64) + "\"}";
        chk("parseInfo درست", Ota.parseInfo(okJ) != null && Ota.parseInfo(okJ).code == 157 && Ota.parseInfo(okJ).v.equals("1.32"));
        chk("parseInfo با فاصله و ترتیب دیگر", Ota.parseInfo("{ \"sha\" : \"" + "B".repeat(64) + "\" , \"size\" : 10 , \"api\":2, \"v\" : \"1.3\", \"code\": 5 }") != null);
        chk("parseInfo: sha بدشکل رد", Ota.parseInfo(okJ.replace("a".repeat(64), "zz")) == null);
        chk("parseInfo: نسخه با حرف رد", Ota.parseInfo(okJ.replace("1.32", "1.3x")) == null);
        chk("parseInfo: size صفر رد", Ota.parseInfo(okJ.replace("114941", "0")) == null);
        chk("parseInfo: size بزرگ رد", Ota.parseInfo(okJ.replace("114941", "99999999")) == null);
        chk("parseInfo: code منفی/نبود رد", Ota.parseInfo(okJ.replace("\"code\":157,", "")) == null && Ota.parseInfo(okJ.replace("157", "-3")) == null);
        chk("parseInfo: خالی و null", Ota.parseInfo("") == null && Ota.parseInfo(null) == null && Ota.parseInfo("<html>") == null);

        // ---------- extract ----------
        File t = tmp("ota-x");
        Path zp = t.toPath().resolve("a.zip");
        Files.write(zp, good("1.32", 2, ""));
        File d1 = new File(t, "d1");
        Ota.extract(zp.toFile(), d1);
        chk("extract بسته‌ی درست", new File(d1, "index.html").isFile() && new File(d1, "version.json").isFile());
        Files.write(zp, zipOf("index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{}", "fonts/a.woff2", "abc", "img/p.png", "abc"));
        Ota.extract(zp.toFile(), new File(t, "d2"));
        chk("extract زیرپوشه‌ی مجاز", new File(t, "d2/fonts/a.woff2").isFile());
        String[][] evil = {{"../evil.js", "path/name"}, {"/abs.js", "abs"}, {"a\\b.js", "backslash"}, {"x/../../e.js", "dotdot"}, {"run.exe", "type"}, {"lib.so", "so"}, {"classes.dex", "dex"}, {"noext", "noext"}, {"a.JS", "dupcase"}, {".hidden.js", "hidden"}, {"a b.js", "space"}, {"x//y.js", "dslash"}};
        for (String[] e : evil) {
            Object[] kv = e[1].equals("dupcase") ? new Object[]{"index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{}", "a.js", "1", e[0], "2"} : new Object[]{"index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{}", e[0], "bad"};
            Files.write(zp, zipOf(kv));
            File dd = new File(t, "ev" + e[1].replaceAll("\\W", ""));
            boolean thr = throwsIO(() -> Ota.extract(zp.toFile(), dd));
            chk("extract رد می‌کند: " + e[0], thr);
        }
        chk("هیچ فایلی بیرون از پوشه نوشته نشد", !new File(t, "evil.js").exists() && !new File(t.getParentFile(), "evil.js").exists());
        Files.write(zp, zipOf("index.html", "x", "app.js", "x", "core.js", "x"));
        chk("extract: بدون version.json رد", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "nov"))));
        Files.write(zp, zipOf("app.js", "x", "core.js", "x", "version.json", "{}"));
        chk("extract: بدون index.html رد", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "noi"))));
        // بمب zip: ۱۳ مگابایت صفر در یک فایل
        Files.write(zp, zipOf("index.html", "x", "app.js", new byte[13 * 1024 * 1024], "core.js", "x", "version.json", "{}"));
        chk("extract: فایل بزرگ‌تر از سقف رد (بمب zip)", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "bomb"))) && zp.toFile().length() < 100000);
        // کل حجم
        List<Object> many = new ArrayList<>(Arrays.asList("index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{}"));
        for (int i = 0; i < 3; i++) { many.add("big" + i + ".js"); many.add(new byte[9 * 1024 * 1024]); }
        Files.write(zp, zipOf(many.toArray()));
        chk("extract: جمع حجم بیش از سقف رد", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "tot"))));
        List<Object> cnt = new ArrayList<>(Arrays.asList("index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{}"));
        for (int i = 0; i < 205; i++) { cnt.add("f" + i + ".js"); cnt.add("1"); }
        Files.write(zp, zipOf(cnt.toArray()));
        chk("extract: بیش از ۲۰۰ فایل رد", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "cnt"))));
        Files.write(zp, "not a zip at all, just text".getBytes());
        chk("extract: فایل غیر zip رد", throwsIO(() -> Ota.extract(zp.toFile(), new File(t, "nz"))));

        // ---------- چرخه‌ی کامل ----------
        File fd = tmp("ota-fd");
        Ota o = new Ota(fd, 156);
        chk("آغاز: بدون بسته، صفحه‌ی APK", o.startUrl() == null && o.webCode() == 156 && !o.hasBundle());
        byte[] z157 = good("1.33", 2, "//a");
        FakeNet net = new FakeNet(); net.zip = z157;
        Ota.Info i157 = info(z157, 157, "1.33", 2);
        chk("state: new", o.state(i157).equals("new"));
        chk("state: همان نسخه = same", o.state(info(z157, 156, "1.33", 2)).equals("same"));
        chk("state: api بالاتر = apk", o.state(info(z157, 157, "1.33", 3)).equals("apk"));
        net.infoJson = "{\"code\":157,\"v\":\"1.33\",\"api\":2,\"size\":" + z157.length + ",\"sha\":\"" + sha(z157) + "\"}";
        Ota.Info f = o.fetchInfo(net);
        chk("fetchInfo", f.code == 157 && f.v.equals("1.33") && f.sha.equals(sha(z157)));
        net.infoJson = null; chk("fetchInfo: 404 → خطا", throwsIO(() -> o.fetchInfo(net)));
        net.infoJson = "garbage"; chk("fetchInfo: خراب → خطا", throwsIO(() -> o.fetchInfo(net)));
        List<Integer> pcts = new ArrayList<>();
        o.install(net, i157, pcts::add);
        chk("install: پیشرفت گزارش شد", pcts.equals(Arrays.asList(40, 80)), pcts);
        chk("install: بسته فعال شد", o.hasBundle() && o.webCode() == 157);
        chk("install: فایل‌های موقت پاک شدند", !new File(fd, "ota/dl.zip").exists() && !new File(fd, "ota/new").exists() && !o.hasPrev());
        String u = o.startUrl();
        chk("startUrl: آدرس file:// به index.html در پوشه‌ی همان نسخه", u != null && u.startsWith("file:///") && u.endsWith("/ota/b157/index.html"), u);
        chk("آدرس با rootDir()+\"/b\" شروع می‌شود (همان که صفحه‌ی برنامه اجازه می‌دهد)", u != null && u.startsWith(Ota.fileUrl(o.rootDir()) + "/b"), u);
        chk("آدرس به فایل واقعی اشاره می‌کند", u != null && new File(URI.create(u)).isFile());
        chk("پس از نصب، state همان نسخه = same", o.state(i157).equals("same"));
        // تلاش‌ها
        o.ok(157);
        chk("ok() شمارنده را صفر می‌کند", o.startUrl() != null);
        Ota o2 = new Ota(fd, 156);
        chk("نمونه‌ی تازه (بازشدن مجدد) همان بسته را می‌بیند", o2.webCode() == 157 && o2.startUrl() != null);
        chk("سومین شروعِ بی‌ok هنوز بسته را باز می‌کند", new Ota(fd, 156).startUrl() != null);
        chk("پس از سه شروعِ بی‌ok، بسته کنار گذاشته می‌شود", new Ota(fd, 156).startUrl() == null);
        chk("... و webCode به APK برمی‌گردد", new Ota(fd, 156).webCode() == 156 && !new Ota(fd, 156).hasBundle());
        chk("... و همان شماره دوباره دانلود نمی‌شود (bad)", new Ota(fd, 156).state(i157).equals("same") && new Ota(fd, 156).badCode() == 157);
        chk("... پوشه‌ی بسته پاک شد", !new File(fd, "ota/b157").exists());
        chk("... و شکستِ «تلاش» به‌حساب «این گوشی بی‌نصب را نمی‌پذیرد» نمی‌آید", new Ota(fd, 156).failCount() == 0);
        // fail(code) با ناظر
        byte[] z158 = good("1.34", 2, "//b"); net.zip = z158; Ota.Info i158 = info(z158, 158, "1.34", 2);
        Ota o3 = new Ota(fd, 156); o3.install(net, i158, null);
        chk("نسخه‌ی بعدی نصب می‌شود", o3.webCode() == 158 && o3.startUrl() != null);
        chk("fail(کد دیگر) = گزارش کهنه، کاری نمی‌کند", Ota.STALE.equals(o3.fail(157)) && o3.webCode() == 158);
        chk("fail() بدون بسته‌ی قبلی: null (= نسخه‌ی APK)", o3.fail(158) == null);
        chk("fail(): بسته کنار گذاشته و bad شد", o3.webCode() == 156 && o3.badCode() == 158 && o3.startUrl() == null && !new File(fd, "ota/b158").exists());
        chk("دو شکستِ ناظر پشت‌سرهم: نسخه‌ی تازه‌تر دیگر بی‌نصب نمی‌شود (apk)", new Ota(fd, 156).failCount() == 1);
        new File(fd, "ota/fails.txt").delete();
        // شمارنده‌ی «بزرگ‌ترین bad» پایین نمی‌آید
        chk("bad: شکستِ قدیمی‌تر عدد بزرگ‌تر را پایین نمی‌آورد", markBadTest(fd));
        chk("نسخه‌ی کهنه‌تر از bad همچنان same", o3.state(info(good("1.3", 2, ""), 157, "1.3", 2)).equals("same"));
        new File(fd, "ota/bad.txt").delete();
        // آپدیت APK بالاتر از بسته
        byte[] z160 = good("1.35", 2, ""); net.zip = z160; Ota.Info i160 = info(z160, 160, "1.35", 2);
        Ota o4 = new Ota(fd, 156); o4.install(net, i160, null);
        chk("بسته‌ی ۱۶۰ فعال", o4.webCode() == 160);
        Ota o5 = new Ota(fd, 161);       // کاربر APK تازه‌تر نصب کرد
        chk("APK تازه‌تر از بسته: بسته نادیده و پاک می‌شود", o5.startUrl() == null && o5.webCode() == 161 && !new File(fd, "ota/b160").exists());

        // ---------- خطاها: نسخه‌ی کارکنندهٔ قبلی دست‌نخورده می‌ماند ----------
        File fe = tmp("ota-err");
        Ota e0 = new Ota(fe, 100);
        byte[] g1 = good("1.40", 2, ""); net.zip = g1; Ota.Info ig1 = info(g1, 200, "1.40", 2); e0.install(net, ig1, null);
        String before = tree(new File(fe, "ota/b200")) + e0.webCode();
        byte[] g2 = good("1.41", 2, "//new");
        Ota.Info bs = info(g2, 201, "1.41", 2); bs.sha = "0".repeat(64);
        net.zip = g2;
        chk("sha اشتباه رد", msg(() -> e0.install(net, bs, null)).equals("sha"), msg(() -> e0.install(net, bs, null)));
        Ota.Info bz = info(g2, 201, "1.41", 2); bz.size += 1;
        chk("اندازه‌ی اشتباه رد", msg(() -> e0.install(net, bz, null)).equals("size"));
        Ota.Info bv = info(g2, 201, "1.99", 2);
        chk("نسخه‌ی داخل بسته با اطلاعات نمی‌خواند → رد", msg(() -> e0.install(net, bv, null)).equals("version"));
        byte[] g3 = good("1.41", 3, ""); net.zip = g3; Ota.Info ig3 = info(g3, 201, "1.41", 2);
        chk("api داخل بسته بالاتر از برنامه → رد", msg(() -> e0.install(net, ig3, null)).equals("api"));
        Ota.Info ig4 = info(g3, 201, "1.41", 3);
        chk("api بالاتر در اطلاعات → نیازی نیست (apk)", msg(() -> e0.install(net, ig4, null)).equals("not needed"));
        net.zip = g2; net.fails = 1;
        chk("خطای شبکه در دانلود", throwsIO(() -> e0.install(net, info(g2, 201, "1.41", 2), null)));
        byte[] g5 = zipOf("index.html", "x", "app.js", "x", "core.js", "x", "version.json", "{\"v\":\"1.41\",\"api\":2}", "evil.exe", "x"); net.zip = g5;
        chk("بسته‌ی دارای فایل ممنوع رد", throwsIO(() -> e0.install(net, info(g5, 201, "1.41", 2), null)));
        chk("پس از همه‌ی خطاها نسخه‌ی قبلی دست‌نخورده", (tree(new File(fe, "ota/b200")) + e0.webCode()).equals(before) && !new File(fe, "ota/new").exists() && !new File(fe, "ota/dl.zip").exists() && !new File(fe, "ota/b201").exists());
        chk("... و هنوز بالا می‌آید", e0.startUrl() != null);
        // نصب روی نسخه‌ی قبلی
        net.zip = g2; e0.install(net, info(g2, 201, "1.41", 2), null);
        chk("نصب روی بسته‌ی قبلی: جایگزین شد", e0.webCode() == 201 && new String(Files.readAllBytes(new File(fe, "ota/b201/app.js").toPath())).contains("//new"));
        // خرابیِ marker
        Files.write(new File(fe, "ota/cur.json").toPath(), "{{{{".getBytes());
        chk("marker خراب = بدون بسته (و چیزی پاک نمی‌شود)", new Ota(fe, 100).startUrl() == null && new Ota(fe, 100).webCode() == 100 && new File(fe, "ota/b201/index.html").isFile());
        Files.write(new File(fe, "ota/cur.json").toPath(), "{\"code\":4294967496,\"api\":2,\"tries\":0}".getBytes());
        chk("marker با عددِ بزرگ (بریده می‌شد) نامعتبر", new Ota(fe, 100).webCode() == 100);
        // cur بدون index.html
        File ff = tmp("ota-nf"); Ota n1 = new Ota(ff, 100); net.zip = g1; n1.install(net, ig1, null); new File(ff, "ota/b200/index.html").delete();
        chk("بسته‌ی بدون index.html معتبر نیست", n1.startUrl() == null && n1.webCode() == 100);
        chk("apkCode صفر (نامشخص) = هیچ بسته‌ای پذیرفته نمی‌شود", new Ota(ff, 0).startUrl() == null && new Ota(ff, 0).webCode() == 0);
        chk("parseInfo: code بسیار بزرگ (4294967496) رد", Ota.parseInfo("{\"code\":4294967496,\"v\":\"1.32\",\"api\":2,\"size\":10,\"sha\":\"" + "a".repeat(64) + "\"}") == null && Ota.parseInfo("{\"code\":2147483647,\"v\":\"1.32\",\"api\":2,\"size\":10,\"sha\":\"" + "a".repeat(64) + "\"}") == null);

        // ---------- برگشت به بسته‌ی سالمِ قبلی ----------
        File fr1 = tmp("ota-rb");
        byte[] A = good("2.01", 2, "//A"), B = good("2.02", 2, "//B"), Cz = good("2.03", 2, "//C");
        Ota.Info iA = info(A, 201, "2.01", 2), iB = info(B, 202, "2.02", 2), iC = info(Cz, 203, "2.03", 2);
        Ota r1 = new Ota(fr1, 100);
        net.zip = A; r1.install(net, iA, null);
        chk("rollback: بسته‌ی A نصب شد، قبلی ندارد", r1.webCode() == 201 && !r1.hasPrev());
        r1.startUrl(); r1.ok(201);
        net.zip = B; r1.install(net, iB, null);
        chk("rollback: بعد از نصب B، A (که بالا آمده بود) نسخه‌ی قبلی می‌ماند", r1.webCode() == 202 && r1.hasPrev() && new File(fr1, "ota/b201/index.html").isFile() && new File(fr1, "ota/b202/index.html").isFile());
        chk("rollback: محتوای نسخه‌ی فعال همان B است", new String(Files.readAllBytes(new File(fr1, "ota/b202/app.js").toPath())).contains("//B"));
        String ub = r1.startUrl();
        chk("ok با شماره‌ی نسخه‌ی دیگر (کهنه) نادیده گرفته می‌شود: نه قبلی پاک می‌شود نه شمارنده صفر", callOkStale(r1, 201) && r1.hasPrev());
        String back = r1.fail(202);      // B بالا نیامد
        chk("rollback: fail(B) آدرس A را می‌دهد", back != null && back.endsWith("/ota/b201/index.html") && r1.webCode() == 201 && r1.badCode() == 202 && !r1.hasPrev(), back);
        chk("rollback: پوشه‌ی B پاک شد و A مانده", !new File(fr1, "ota/b202").exists() && new File(fr1, "ota/b201/index.html").isFile());
        chk("rollback: B دوباره دانلود نمی‌شود، C می‌شود", r1.state(iB).equals("same") && r1.state(iC).equals("new"));
        r1.ok(201);
        chk("rollback: بعد از ok، شکست‌ها صفر", r1.failCount() == 0);
        // از راه شمارنده‌ی تلاش
        net.zip = B; new Ota(fr1, 100).install(net, info(B, 205, "2.02", 2), null);
        Ota r2 = new Ota(fr1, 100);
        chk("rollback(تلاش): سه شروع مجاز", r2.startUrl() != null && r2.startUrl() != null && r2.startUrl() != null);
        String back2 = r2.startUrl();
        chk("rollback(تلاش): شروع چهارم به A برمی‌گردد و A باز می‌شود", back2 != null && back2.endsWith("/ota/b201/index.html") && r2.webCode() == 201, back2);
        chk("rollback(تلاش): بسته‌ی ۲۰۵ bad شد ولی «بی‌نصب ناکارآمد» حساب نشد", r2.badCode() == 205 && r2.failCount() == 0);
        // اگر A هم بالا نیامد (ناظر)
        chk("rollback: وقتی قبلی هم نیامد → APK", r2.fail(201) == null && r2.webCode() == 100 && !r2.hasBundle() && r2.badCode() == 205 && !new File(fr1, "ota/b201").exists());
        // ok() نسخه‌ی قبلی را پاک می‌کند
        File fr3 = tmp("ota-prev-ok"); Ota r3 = new Ota(fr3, 100);
        net.zip = A; r3.install(net, iA, null); r3.startUrl(); r3.ok(201); net.zip = B; r3.install(net, iB, null);
        r3.startUrl(); r3.ok(202);
        chk("ok(): نسخه‌ی قبلی پاک می‌شود", !r3.hasPrev() && !new File(fr3, "ota/b201").exists() && !new File(fr3, "ota/prev.json").exists());
        // APK تازه‌تر از هر دو: همه پاک
        net.zip = Cz; r3.install(net, iC, null);
        Ota r3b = new Ota(fr3, 300);
        chk("APK تازه‌تر: بسته و نسخه‌ی قبلی هر دو پاک", r3b.startUrl() == null && !new File(fr3, "ota/b202").exists() && !new File(fr3, "ota/b203").exists());

        // سناریوی بازبین: B هنوز «زنده‌ام» نگفته که C می‌رسد — نسخه‌ی سالمِ A نباید از بین برود
        File fs = tmp("ota-unproven"); Ota s1 = new Ota(fs, 100);
        net.zip = A; s1.install(net, iA, null); s1.startUrl(); s1.ok(201);
        net.zip = B; s1.install(net, iB, null); s1.startUrl();      // B در حال اجراست، هنوز ok نداده
        net.zip = Cz; s1.install(net, iC, null);      // نسخه‌ی اصلاحیِ C می‌رسد
        chk("نسخه‌ی بی‌ok (B) جای نسخه‌ی سالم (A) را نمی‌گیرد: A می‌ماند، B کنار می‌رود", s1.webCode() == 203 && s1.hasPrev() && new File(fs, "ota/b201/index.html").isFile() && !new File(fs, "ota/b202").exists());
        chk("ناظرِ B (کهنه) بعداً می‌رسد: نادیده گرفته می‌شود", Ota.STALE.equals(s1.fail(202)) && s1.webCode() == 203 && s1.badCode() == 0);
        s1.ok(202);      // صفحه‌ی کهنه‌ی B دیر «زنده‌ام» می‌گوید: نباید C را «سالم» اعلام کند
        chk("«زنده‌ام»ِ کهنه نسخه‌ی C را سالم اعلام نمی‌کند و A را پاک نمی‌کند", s1.hasPrev());
        String sb = s1.fail(203);
        chk("اگر C هم بالا نیامد به A برمی‌گردیم (نه به B)", sb != null && sb.endsWith("/ota/b201/index.html") && s1.webCode() == 201);

        // خرابی در میانه‌ی نصب: پوشه‌ی نیمه‌کاره نشانه ندارد و پاک می‌شود، نسخه‌ی فعال سالم می‌ماند
        File fx = tmp("ota-crash"); Ota x1 = new Ota(fx, 100);
        net.zip = A; x1.install(net, iA, null); x1.startUrl(); x1.ok(201);
        Files.createDirectories(new File(fx, "ota/b999/sub").toPath());      // پوشه‌ی یتیم (مثلاً قطع برق بعد از جابه‌جایی و پیش از نشانه)
        Files.write(new File(fx, "ota/dl.zip").toPath(), new byte[10]);
        chk("پوشه‌ی یتیم و دانلود نیمه‌کاره با شروعِ بعدی پاک می‌شود، نسخه‌ی فعال سالم", new Ota(fx, 100).startUrl() != null && !new File(fx, "ota/b999").exists() && !new File(fx, "ota/dl.zip").exists() && new File(fx, "ota/b201/index.html").isFile());
        // مرگ بین نوشتن prev.json و cur.json: هر دو به A اشاره کنند
        Files.write(new File(fx, "ota/prev.json").toPath(), "{\"code\":201,\"api\":2}".getBytes());
        Ota x2 = new Ota(fx, 100);
        chk("prev هم‌شماره با cur مشکلی نمی‌سازد (و روی rollback جانشین نمی‌شود)", x2.startUrl() != null && x2.fail(201) == null && x2.webCode() == 100);

        // دو شکستِ ناظر پشت‌سرهم → apk
        File fr4 = tmp("ota-fails"); Ota r4 = new Ota(fr4, 100);
        net.zip = A; r4.install(net, iA, null); r4.startUrl(); r4.fail(201);
        net.zip = B; r4.install(net, iB, null); r4.startUrl(); r4.fail(202);
        chk("دو شکستِ ناظر پشت‌سرهم: بسته‌ی تازه‌تر دیگر بی‌نصب نمی‌شود (apk)", r4.failCount() == 2 && r4.state(iC).equals("apk"));
        Files.write(new File(fr4, "ota/fails.txt").toPath(), "2,99".getBytes());
        chk("fails.txt مربوط به APK دیگر نادیده", r4.failCount() == 0 && r4.state(iC).equals("new"));
        Files.write(new File(fr4, "ota/fails.txt").toPath(), "x".getBytes());
        chk("fails.txt خراب = صفر", r4.failCount() == 0);
        // ثبتِ تلاش شکست بخورد: بسته نباید پاک شود
        File fr5 = tmp("ota-nowrite"); Ota r5 = new Ota(fr5, 100);
        net.zip = A; r5.install(net, iA, null);
        Files.createDirectories(new File(fr5, "ota/cur.json.tmp").toPath());      // نوشتنِ marker خطا می‌دهد
        String w1 = r5.startUrl();
        chk("نوشتن marker شکست خورد: بسته پاک نشد و باز می‌شود", w1 != null && r5.hasBundle() && new File(fr5, "ota/b201/index.html").isFile(), w1);
        // writeSmall: جایگزینی، بدون tmp
        File fw = tmp("ota-ws"); File wf = new File(fw, "a.txt");
        Ota.writeSmall(wf, "one"); Ota.writeSmall(wf, "two");
        chk("writeSmall: جایگزین می‌شود و tmp نمی‌ماند", Ota.readSmall(wf).equals("two") && !new File(fw, "a.txt.tmp").exists());
        // همزمانی: دو نصب با هم → دومی «busy»
        File fc = tmp("ota-busy");
        final java.util.concurrent.CountDownLatch inDl = new java.util.concurrent.CountDownLatch(1), go = new java.util.concurrent.CountDownLatch(1);
        final Ota.Net slow = new Ota.Net() {
            public byte[] getBytes(String u, int m) { return new byte[0]; }
            public void getFile(String u, File dst, long m, Ota.Progress p) throws IOException {
                inDl.countDown();
                try { go.await(); } catch (InterruptedException e) { throw new IOException("int"); }
                Files.write(dst.toPath(), A);
            }
        };
        final Throwable[] th = new Throwable[1];
        Thread t1 = new Thread(() -> { try { new Ota(fc, 100).install(slow, iA, null); } catch (Throwable e) { th[0] = e; } });
        t1.start(); inDl.await();
        chk("همزمانی: نصبِ دوم در حین دانلود «busy» می‌دهد", msg(() -> new Ota(fc, 100).install(slow, iA, null)).equals("busy"));
        Ota rc = new Ota(fc, 100); rc.fail(999); rc.startUrl();      // ناظر/شروع در میانه‌ی دانلود: فایل‌های موقتِ نصب را خراب نمی‌کند
        go.countDown(); t1.join();
        chk("همزمانی: نصبِ اول سالم تمام شد (حتی با fail() و startUrl() در میانه)", th[0] == null && new Ota(fc, 100).webCode() == 201, th[0]);
        net.zip = B;
        chk("همزمانی: بعد از پایان دوباره می‌شود نصب کرد", msg(() -> new Ota(fc, 100).install(net, iB, null)).equals("no error") && new Ota(fc, 100).webCode() == 202);

        // ---------- اصلاحات بازبینیِ دوم ----------
        // ناظری که همزمان با «زنده‌ام» می‌رسد دیر آمده است: بسته‌ی سالم را نباید کنار بگذارد
        File fz = tmp("ota-late"); Ota z1 = new Ota(fz, 100);
        net.zip = A; z1.install(net, iA, null); z1.startUrl(); z1.ok(201);
        chk("fail() بعد از ok در همان اجرا = کهنه؛ بسته سالم می‌ماند، bad و failها دست‌نخورده", Ota.STALE.equals(z1.fail(201)) && z1.webCode() == 201 && z1.badCode() == 0 && z1.failCount() == 0 && new File(fz, "ota/b201/index.html").isFile());
        chk("... اما در اجرای بعدی که ok نگفته fail() کار می‌کند", z1.startUrl() != null && z1.fail(201) == null && z1.badCode() == 201 && z1.webCode() == 100);
        // failHard: بسته بعد از «زنده‌ام» هم مدام صفحه را می‌کُشد
        File fh = tmp("ota-hard"); Ota h1 = new Ota(fh, 100);
        net.zip = A; h1.install(net, iA, null); h1.startUrl(); h1.ok(201);
        net.zip = B; h1.install(net, iB, null); h1.startUrl(); h1.ok(202);
        chk("failHard بعد از ok: بسته کنار می‌رود (نسخه‌ی قبلی پاک شده بود → APK)", h1.failHard(202) == null && h1.webCode() == 100 && h1.badCode() == 202 && h1.failCount() == 1 && !new File(fh, "ota/b202").exists());
        chk("failHard دوباره/کهنه: کاری نمی‌کند", Ota.STALE.equals(h1.failHard(202)) && h1.failCount() == 1);
        File fh2 = tmp("ota-hard2"); Ota h2 = new Ota(fh2, 100);
        net.zip = A; h2.install(net, iA, null); h2.startUrl(); h2.ok(201);
        net.zip = B; h2.install(net, iB, null); h2.startUrl();      // B هنوز ok نگفته، A نسخه‌ی قبلی است
        String hb = h2.failHard(202);
        chk("failHard پیش از ok: به نسخه‌ی سالمِ قبلی برمی‌گردد", hb != null && hb.endsWith("/ota/b201/index.html") && h2.webCode() == 201 && h2.badCode() == 202);
        chk("failHard با شماره‌ی دیگر: کهنه", Ota.STALE.equals(h2.failHard(555)) && h2.webCode() == 201);
        // قطع برق: cur به پوشه‌ای اشاره می‌کند که کامل نشده؛ نسخه‌ی سالمِ قبلی نباید پاک شود
        File fm = tmp("ota-missdir"); Ota m1 = new Ota(fm, 100);
        net.zip = A; m1.install(net, iA, null); m1.startUrl(); m1.ok(201);
        net.zip = B; m1.install(net, iB, null);
        Ota.deleteTree(new File(fm, "ota/b202"));
        String mu = new Ota(fm, 100).startUrl();
        chk("پوشه‌ی cur ناقص و نسخه‌ی قبلی سالم: به قبلی برمی‌گردد", mu != null && mu.endsWith("/ota/b201/index.html") && new Ota(fm, 100).webCode() == 201 && !new Ota(fm, 100).hasPrev(), mu);
        chk("... و آن نسخه «بد» حساب نمی‌شود؛ دوباره قابل گرفتن است", new Ota(fm, 100).badCode() == 0 && new Ota(fm, 100).state(iB).equals("new"));
        File fm2 = tmp("ota-missdir2"); Ota m2 = new Ota(fm2, 100);
        net.zip = A; m2.install(net, iA, null);
        Ota.deleteTree(new File(fm2, "ota/b201"));
        chk("پوشه‌ی cur ناقص و بدون قبلی: APK، و نشانه پاک می‌شود", new Ota(fm2, 100).startUrl() == null && !new File(fm2, "ota/cur.json").exists());
        // codeOf
        chk("codeOf: آدرس بسته", Ota.codeOf("file:///data/user/0/x/files/ota/b157/index.html") == 157);
        chk("codeOf: صفحه‌ی APK، null، صفر، بزرگ، پسوند اضافه = 0", Ota.codeOf("file:///android_asset/www/index.html") == 0 && Ota.codeOf(null) == 0 && Ota.codeOf("file:///x/b0/index.html") == 0 && Ota.codeOf("file:///x/b9999999999/index.html") == 0 && Ota.codeOf("file:///x/b157/index.html?a=1") == 0 && Ota.codeOf("file:///x/bb157/index.html") == 0);
        chk("codeOf با fileUrl(startUrl) سازگار است", Ota.codeOf(new Ota(fh2, 100).startUrl()) == 201);
        // writeSmall: نوشتن شکست بخورد، فایل قبلی دست‌نخورده
        File fw2 = tmp("ota-ws2"); File wf2 = new File(fw2, "m.json"); Ota.writeSmall(wf2, "old");
        Files.createDirectories(new File(fw2, "m.json.tmp").toPath());
        chk("writeSmall: شکست → خطا و فایل قبلی دست‌نخورده", throwsIO(() -> Ota.writeSmall(wf2, "new")) && Ota.readSmall(wf2).equals("old"));

        // ---------- شبکه‌ی واقعی با سرور محلی ----------
        byte[] zs = good("1.50", 2, "//srv");
        HttpServer srv = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        final int port = srv.getAddress().getPort();
        srv.createContext("/ok/ota.json", ex -> reply(ex, 200, ("{\"code\":300}").getBytes()));
        srv.createContext("/ok/www.zip", ex -> reply(ex, 200, zs));
        srv.createContext("/redir", ex -> { ex.getResponseHeaders().add("Location", "/ok/www.zip"); ex.sendResponseHeaders(302, -1); ex.close(); });
        srv.createContext("/loop", ex -> { ex.getResponseHeaders().add("Location", "/loop"); ex.sendResponseHeaders(302, -1); ex.close(); });
        srv.createContext("/nf", ex -> reply(ex, 404, "no".getBytes()));
        srv.createContext("/off", ex -> { ex.getResponseHeaders().add("Location", "http://evil.example/x.zip"); ex.sendResponseHeaders(302, -1); ex.close(); });
        srv.createContext("/big", ex -> reply(ex, 200, new byte[300000]));
        srv.createContext("/drip", ex -> { try { ex.sendResponseHeaders(200, 0); OutputStream os = ex.getResponseBody(); for (int k = 0; k < 40; k++) { os.write(new byte[100]); os.flush(); Thread.sleep(250); } ex.close(); } catch (Exception e) { try { ex.close(); } catch (Exception e2) { } } });
        srv.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        srv.start();
        try {
            Ota.HostPolicy local = uu -> uu.getHost().equals("127.0.0.1");
            Ota.HttpNet hn = new Ota.HttpNet(local);
            String b = "http://127.0.0.1:" + port;
            chk("HttpNet.getBytes", new String(hn.getBytes(b + "/ok/ota.json", 100)).equals("{\"code\":300}"));
            File dd = new File(tmp("ota-net"), "x.zip");
            List<Integer> pc = new ArrayList<>();
            hn.getFile(b + "/ok/www.zip", dd, 1 << 20, pc::add);
            chk("HttpNet.getFile بایت‌ها یکی است", Arrays.equals(Files.readAllBytes(dd.toPath()), zs));
            hn.getFile(b + "/redir", dd, 1 << 20, null);
            chk("HttpNet ریدایرکت را دنبال می‌کند", Arrays.equals(Files.readAllBytes(dd.toPath()), zs));
            chk("404 خطا", msg(() -> hn.getBytes(b + "/nf", 100)).equals("http 404"));
            chk("حلقه‌ی ریدایرکت خطا", msg(() -> hn.getBytes(b + "/loop", 100)).equals("redirects"));
            chk("ریدایرکت به میزبان غیرمجاز خطا", msg(() -> hn.getBytes(b + "/off", 100)).equals("host"));
            chk("پاسخ بزرگ‌تر از سقف خطا (getBytes)", msg(() -> hn.getBytes(b + "/big", 1000)).equals("big"));
            chk("پاسخ بزرگ‌تر از سقف خطا (getFile)", throwsIO(() -> hn.getFile(b + "/big", dd, 1000, null)));
            Ota.HttpNet fastNet = new Ota.HttpNet(local, 1000);
            long dt0 = System.nanoTime();
            String dm = msg(() -> fastNet.getFile(b + "/drip", dd, 1 << 20, null));
            long dms = (System.nanoTime() - dt0) / 1000000L;
            chk("دانلود قطره‌چکانی (getFile) در مهلت قطع می‌شود", dm.equals("slow") && dms < 4000, dm + " " + dms);
            dt0 = System.nanoTime();
            String dm2 = msg(() -> fastNet.getBytes(b + "/drip", 1 << 20));
            dms = (System.nanoTime() - dt0) / 1000000L;
            chk("دانلود قطره‌چکانی (getBytes) در مهلت قطع می‌شود", dm2.equals("slow") && dms < 4000, dm2 + " " + dms);
            chk("مهلت پیش‌فرض بلند است و دانلود عادی را قطع نمی‌کند", Arrays.equals(new Ota.HttpNet(local).getBytes(b + "/ok/www.zip", 1 << 20), zs));
            Ota.HttpNet strict = new Ota.HttpNet(Ota.GITHUB);
            chk("سیاست GitHub: http محلی رد", msg(() -> strict.getBytes(b + "/ok/ota.json", 100)).equals("host"));
            chk("GitHub: آدرس‌های درست مجازند", Ota.GITHUB.allow(new URL(Ota.ZIP_URL)) && Ota.GITHUB.allow(new URL("https://objects.githubusercontent.com/x")) && Ota.GITHUB.allow(new URL("https://release-assets.githubusercontent.com/x")));
            chk("GitHub: میزبان‌های دیگر و http رد", !Ota.GITHUB.allow(new URL("https://evil.com/github.com")) && !Ota.GITHUB.allow(new URL("https://github.com.evil.com/x")) && !Ota.GITHUB.allow(new URL("http://github.com/x")) && !Ota.GITHUB.allow(new URL("https://notgithubusercontent.com/x")));
        } finally { srv.stop(0); }

        // ---------- بسته‌ی واقعیِ برنامه (همان فرمانِ CI) ----------
        if (wwwReal != null && otaOut != null) {
            String infoJ = new String(Files.readAllBytes(Paths.get(otaOut, "ota.json")), StandardCharsets.UTF_8);
            Ota.Info ri = Ota.parseInfo(infoJ);
            chk("ota.json ساخته‌شده توسط CI معتبر است", ri != null, infoJ);
            File rz = new File(otaOut, "www.zip");
            chk("اندازه و sha با ota.json می‌خواند", ri != null && rz.length() == ri.size && Ota.sha256(rz).equals(ri.sha));
            FakeNet rn = new FakeNet(); rn.zip = Files.readAllBytes(rz.toPath());
            File fr = tmp("ota-real"); Ota ro = new Ota(fr, 100);
            ro.install(rn, ri, null);
            chk("بسته‌ی واقعی نصب شد", ro.webCode() == ri.code && ro.startUrl() != null);
            boolean same = true; StringBuilder diff = new StringBuilder();
            for (File s : new File(wwwReal).listFiles()) {
                if (s.getName().startsWith(".")) continue;
                File c = new File(fr, "ota/b" + ri.code + "/" + s.getName());
                if (!c.isFile() || !Arrays.equals(Files.readAllBytes(s.toPath()), Files.readAllBytes(c.toPath()))) { same = false; diff.append(s.getName()).append(' '); }
            }
            chk("همه‌ی فایل‌های واقعی بایت‌به‌بایت یکی است", same, diff);
            String vj = new String(Files.readAllBytes(new File(wwwReal, "version.json").toPath()), StandardCharsets.UTF_8);
            chk("api در version.json همان NATIVE_API است", Ota.jnum(vj, "api", -1) == Ota.NATIVE_API, vj);
        }
        System.out.println(ok + " pass " + bad + " fail");
        System.exit(bad == 0 ? 0 : 1);
    }
    static boolean callOkStale(Ota o, int code) { o.ok(code); return true; }
    static boolean markBadTest(File fd) throws Exception {
        // bad.txt را روی ۱۶۰ می‌گذاریم و یک شکستِ قدیمی‌تر (۱۵۸) را ثبت می‌کنیم؛ باید ۱۶۰ بماند
        Files.createDirectories(new File(fd, "ota").toPath());
        Files.write(new File(fd, "ota/bad.txt").toPath(), "160".getBytes());
        Ota t = new Ota(fd, 156);
        Files.write(new File(fd, "ota/cur.json").toPath(), "{\"code\":158,\"api\":2,\"tries\":0,\"ok\":0}".getBytes());
        Files.createDirectories(new File(fd, "ota/b158").toPath());
        Files.write(new File(fd, "ota/b158/index.html").toPath(), "x".getBytes());
        t.fail(158);
        return t.badCode() == 160;
    }
    static void reply(HttpExchange ex, int code, byte[] b) throws IOException { ex.sendResponseHeaders(code, b.length); ex.getResponseBody().write(b); ex.close(); }
}
