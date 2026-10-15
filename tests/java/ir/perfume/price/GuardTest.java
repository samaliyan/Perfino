package ir.perfume.price;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;

/** آزمایش منطق ناظر (OtaGuard) با ساعت و صفحه‌ی ساختگی: مهلت‌ها، برگشت، گزارش‌های کهنه، پس‌زمینه، مرگ پردازه‌ی صفحه */
public class GuardTest {
    static int ok = 0, bad = 0;
    static void chk(String name, boolean c, Object info) {
        if (c) ok++; else bad++;
        System.out.println((c ? "PASS " : "FAIL ") + name + (info != null ? "  " + info : ""));
    }
    static void chk(String name, boolean c) { chk(name, c, null); }

    static byte[] zip(String v) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        ZipOutputStream z = new ZipOutputStream(bo);
        String[][] f = {{"index.html", "<html>" + v + "</html>"}, {"app.js", "//" + v}, {"core.js", "//c"}, {"version.json", "{\"v\":\"" + v + "\",\"api\":2}"}};
        for (String[] e : f) { z.putNextEntry(new ZipEntry(e[0])); z.write(e[1].getBytes(StandardCharsets.UTF_8)); z.closeEntry(); }
        z.close();
        return bo.toByteArray();
    }
    static String sha(byte[] b) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        StringBuilder sb = new StringBuilder(); for (byte x : md.digest(b)) sb.append(String.format("%02x", x & 255)); return sb.toString();
    }
    /** نصبِ یک بسته با شبکه‌ی ساختگی */
    static void put(Ota o, int code, String v) throws Exception {
        final byte[] z = zip(v);
        Ota.Info i = new Ota.Info(); i.code = code; i.v = v; i.api = 2; i.size = z.length; i.sha = sha(z);
        o.install(new Ota.Net() {
            public byte[] getBytes(String u, int m) { return new byte[0]; }
            public void getFile(String u, File dst, long m, Ota.Progress p) throws IOException { Files.write(dst.toPath(), z); }
        }, i, null);
    }

    /** محیطِ ساختگی: ساعت دستی، یک «ناظر» در انتظار، و آخرین صفحه‌ای که باز شد */
    static class Env implements OtaGuard.Env {
        long t = 1000000; long dogAt = -1; List<String> loads = new ArrayList<>(); int posts = 0;
        public void postDog(long ms) { dogAt = t + ms; posts++; }
        public void cancelDog() { dogAt = -1; }
        public void load(String url) { loads.add(url); }
        public long now() { return t; }
        String last() { return loads.isEmpty() ? "none" : String.valueOf(loads.get(loads.size() - 1)); }
        OtaGuard g;
        /** زمان را جلو می‌برد و هر بار که ناظر رسید dogFired() را صدا می‌زند */
        void adv(long ms) {
            long end = t + ms;
            while (dogAt >= 0 && dogAt <= end) { t = dogAt; dogAt = -1; g.dogFired(); }
            t = end;
        }
    }

    public static void main(String[] a) throws Exception {
        // ---------- ۱) مسیر سالم ----------
        {
            File fd = Files.createTempDirectory("g1").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume();
            g.start(o.startUrl());
            chk("شروع: صفحه‌ی بسته باز شد، شماره‌ی اجرا 201، ناظر ۳۰ ثانیه", e.last().endsWith("/b201/index.html") && g.runCode() == 201 && g.loaded() && e.dogAt == e.t + 30000, e.last());
            g.boot("201");
            chk("boot: مهلت می‌شود ۱۲۰ ثانیه", e.dogAt == e.t + 120000);
            e.adv(40000);
            chk("۴۰ ثانیه بعد هنوز برنده‌ایم و صفحه عوض نشده", e.loads.size() == 1 && o.webCode() == 201);
            g.ok("201");
            chk("ok: ناظر برداشته شد", e.dogAt == -1);
            e.adv(600000);
            chk("هر چقدر بگذرد چیزی تغییر نمی‌کند", e.loads.size() == 1 && o.webCode() == 201 && o.badCode() == 0 && o.failCount() == 0);
        }
        // ---------- ۲) هیچ جاوااسکریپتی اجرا نشد: ۳۰ ثانیه ----------
        {
            File fd = Files.createTempDirectory("g2").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl());
            e.adv(29000);
            chk("هیچ گزارشی نیامد: تا ۲۹ ثانیه صبر", e.loads.size() == 1);
            e.adv(1500);
            chk("بعد از ۳۰ ثانیه: برگشت به صفحه‌ی APK، bad=201، شماره‌ی اجرا همان APK", e.loads.size() == 2 && e.last().equals("null") && !g.loaded() && g.runCode() == 100 && o.badCode() == 201 && o.failCount() == 1, e.last());
            chk("... و ناظری باقی نماند", e.dogAt == -1);
        }
        // ---------- ۳) خطا: ۲۰ ثانیه؛ boot دیرتر مهلت را بلند نمی‌کند ----------
        {
            File fd = Files.createTempDirectory("g3").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.boot("201");
            e.adv(3000); g.err("201");
            chk("err: مهلت ۲۰ ثانیه از همین لحظه", e.dogAt == e.t + 20000);
            g.boot("201");
            chk("boot بعد از err مهلت را دوباره بلند نمی‌کند", e.dogAt == e.t + 20000);
            e.adv(19000);
            chk("۱۹ ثانیه بعد از خطا هنوز برنگشته", e.loads.size() == 1);
            e.adv(1500);
            chk("۲۰ ثانیه بعد: برگشت به APK", e.loads.size() == 2 && e.last().equals("null") && o.badCode() == 201);
        }
        // ---------- ۴) گزارش‌های کهنه و صفحه‌ی APK ----------
        {
            File fd = Files.createTempDirectory("g4").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.boot("201"); g.ok("201");
            put(o, 202, "3.02");
            g.start(o.startUrl());      // کاربر «تازه شود» را زد
            chk("نسخه‌ی تازه (202) باز شد و شماره‌ی اجرا ۲۰۲ است", g.runCode() == 202 && e.last().endsWith("/b202/index.html"));
            g.ok("201");      // صفحه‌ی کهنه‌ی ۲۰۱ هنوز زنده است و دیر «زنده‌ام» می‌گوید
            chk("«زنده‌ام»ِ کهنه (201) نادیده: ناظر ۲۰۲ هنوز هست و نسخه‌ی قبلی پاک نشده", e.dogAt >= 0 && o.hasPrev());
            g.boot("201"); g.err("201");
            chk("boot/err کهنه مهلت را عوض نمی‌کنند", e.dogAt == e.t + 30000);
            g.ok("0"); g.ok("abc"); g.ok(null); g.ok("");
            chk("«زنده‌ام» از صفحه‌ی APK یا مقدار بد نادیده", e.dogAt >= 0 && o.hasPrev());
            g.ok("202");
            chk("«زنده‌ام»ِ خودِ ۲۰۲: پذیرفته شد، قبلی پاک", e.dogAt == -1 && !o.hasPrev());
        }
        // ---------- ۵) ناظر و «زنده‌ام» همزمان ----------
        {
            File fd = Files.createTempDirectory("g5").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl());
            g.ok("201");
            e.adv(31000);
            chk("«زنده‌ام» گفته شد و ناظر هنوز روی ساعت بود: بسته‌ی سالم کنار گذاشته نشد", e.loads.size() == 1 && o.webCode() == 201 && o.badCode() == 0 && o.failCount() == 0);
            // همزمانی واقعی: ناظر و «زنده‌ام» هم‌زمان از دو رشته؛ فقط دو نتیجه‌ی سازگار مجاز است
            int kept = 0, rolled = 0, weird = 0;
            for (int it = 0; it < 150; it++) {
                File fz = Files.createTempDirectory("g5s").toFile(); final Ota oz = new Ota(fz, 100); put(oz, 201, "3.01");
                final Env ez = new Env(); final OtaGuard gz = new OtaGuard(oz, ez, 100); ez.g = gz; gz.resume(); gz.start(oz.startUrl());
                final java.util.concurrent.CountDownLatch go = new java.util.concurrent.CountDownLatch(1);
                Thread t1 = new Thread(() -> { try { go.await(); } catch (Exception x) { } gz.dogFired(); });
                Thread t2 = new Thread(() -> { try { go.await(); } catch (Exception x) { } gz.ok("201"); });
                t1.start(); t2.start(); go.countDown(); t1.join(); t2.join();
                boolean keptState = oz.webCode() == 201 && oz.badCode() == 0 && oz.failCount() == 0;
                boolean rolledState = oz.webCode() == 100 && oz.badCode() == 201 && ez.last().equals("null");
                if (keptState) kept++; else if (rolledState) rolled++; else weird++;
            }
            chk("ناظر و «زنده‌ام» هم‌زمان (۱۵۰ بار): هر بار یکی از دو نتیجه‌ی سازگار، هرگز حالت ناسازگار", weird == 0, "kept=" + kept + " rolled=" + rolled + " weird=" + weird);
            File fd2 = Files.createTempDirectory("g5b").toFile(); Ota o2 = new Ota(fd2, 100); put(o2, 201, "3.01");
            Env e2 = new Env(); OtaGuard g2 = new OtaGuard(o2, e2, 100); e2.g = g2;
            g2.resume(); g2.start(o2.startUrl());
            e2.adv(31000);      // ناظر اول رسید و برگشت داد
            g2.ok("201");      // «زنده‌ام»ِ دیرهنگام از صفحه‌ی برگشت‌خورده
            chk("«زنده‌ام» بعد از برگشت نادیده است (APK ماند)", !g2.loaded() && o2.webCode() == 100 && e2.last().equals("null"));
        }
        // ---------- ۶) پس‌زمینه ----------
        {
            File fd = Files.createTempDirectory("g6").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.boot("201");
            e.adv(5000); g.pause();
            e.adv(600000);
            chk("ده دقیقه در پس‌زمینه: برنمی‌گردد (زمانِ پس‌زمینه حساب نمی‌شود)", e.loads.size() == 1 && o.webCode() == 201);
            g.resume();
            chk("برگشت به برنامه: مهلتِ کامل ۱۲۰ ثانیه از نو", e.dogAt == e.t + 120000);
            e.adv(119000);
            chk("۱۱۹ ثانیه بعد از برگشت هنوز برنده‌ایم", e.loads.size() == 1);
            e.adv(2000);
            chk("۱۲۱ ثانیه بعد از برگشت: برگشت به APK", e.loads.size() == 2 && e.last().equals("null"));
            // pause بعد از ok: هیچ ناظری دوباره ساخته نمی‌شود
            File fd2 = Files.createTempDirectory("g6b").toFile(); Ota o2 = new Ota(fd2, 100); put(o2, 201, "3.01");
            Env e2 = new Env(); OtaGuard g2 = new OtaGuard(o2, e2, 100); e2.g = g2;
            g2.resume(); g2.start(o2.startUrl()); g2.ok("201"); g2.pause(); g2.resume();
            chk("resume بعد از ok ناظر نمی‌گذارد", e2.dogAt == -1);
        }
        // ---------- ۷) مرگ پردازه‌ی صفحه ----------
        {
            File fd = Files.createTempDirectory("g7").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.boot("201"); g.ok("201");
            g.renderGone(true);
            chk("مرگ اول: بسته می‌ماند", o.webCode() == 201 && o.badCode() == 0);
            // Activity دوباره ساخته می‌شود
            Ota o1 = new Ota(fd, 100); Env e1 = new Env(); e1.t = e.t + 5000; OtaGuard g1 = new OtaGuard(o1, e1, 100); e1.g = g1;
            g1.resume(); g1.start(o1.startUrl()); g1.boot("201"); g1.ok("201");
            g1.renderGone(true);
            chk("مرگ دوم در دو دقیقه (حتی بعد از «زنده‌ام»): کنار گذاشته، bad، APK", o1.webCode() == 100 && o1.badCode() == 201 && o1.failCount() == 1 && !new File(fd, "ota/b201").exists());
            Ota o2 = new Ota(fd, 100); Env e2 = new Env(); e2.t = e1.t + 1000; OtaGuard g2 = new OtaGuard(o2, e2, 100); e2.g = g2;
            g2.resume(); g2.start(o2.startUrl());
            chk("Activity بعدی صفحه‌ی APK را باز می‌کند و حلقه تمام می‌شود", e2.last().equals("null") && !g2.loaded());
            g2.renderGone(true);
            chk("مرگ پردازه‌ی صفحه‌ی APK: کاری با بسته نمی‌کند (و خطا نمی‌دهد)", o2.badCode() == 201);
            // مرگ‌های دور از هم
            OtaGuard.resetCrashes();
            File fd3 = Files.createTempDirectory("g7b").toFile(); Ota o3 = new Ota(fd3, 100); put(o3, 205, "3.05");
            Env e3 = new Env(); OtaGuard g3 = new OtaGuard(o3, e3, 100); e3.g = g3;
            g3.resume(); g3.start(o3.startUrl()); g3.ok("205");
            g3.renderGone(true); e3.t += 130000; g3.renderGone(true);
            chk("دو مرگ با فاصله‌ی بیش از ۱۲۰ ثانیه: بسته می‌ماند", o3.webCode() == 205 && o3.badCode() == 0);
            e3.t += 1000; g3.renderGone(true);
            chk("... ولی دو مرگ پشت‌سرهم بعد از آن: کنار می‌رود", o3.webCode() == 100 && o3.badCode() == 205);
        }
        // ---------- ۸) برگشت به نسخه‌ی سالمِ قبلی و ادامه‌ی کارِ آن ----------
        {
            File fd = Files.createTempDirectory("g8").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.ok("201");
            put(o, 202, "3.02"); g.start(o.startUrl()); g.boot("202");
            e.adv(121000);
            chk("۲۰۲ زنده نشد: به ۲۰۱ برمی‌گردد (نه APK)", e.last().endsWith("/b201/index.html") && g.runCode() == 201 && g.loaded() && o.badCode() == 202, e.last());
            chk("... و ناظر ۲۰۱ هم گذاشته شد (۳۰ ثانیه از لحظه‌ی برگشت)", e.dogAt == e.t - 1000 + 30000);
            g.boot("201"); g.ok("201");
            e.adv(300000);
            chk("۲۰۱ زنده شد و می‌ماند", g.runCode() == 201 && o.webCode() == 201 && o.failCount() == 0);
            // ۲۰۲ دیرهنگام گزارش بدهد
            g.ok("202"); g.err("202"); g.boot("202");
            chk("گزارش‌های دیرهنگامِ ۲۰۲ بی‌اثر", e.dogAt == -1 && o.webCode() == 201);
        }
        // ---------- ۸ب) نصبِ همزمان: صفحه‌ی ناسالم نباید بدون ناظر روی صفحه بماند ----------
        {
            File fd = Files.createTempDirectory("g8b").toFile(); Ota o = new Ota(fd, 100); put(o, 202, "3.02");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.boot("202"); g.err("202");
            e.adv(5000);
            put(o, 203, "3.03");      // وسط مهلتِ ۲۰ ثانیه‌ای نسخه‌ی اصلاحیِ ۲۰۳ نصب می‌شود
            e.adv(20000);
            chk("۲۰۲ ناسالم بود و ۲۰۳ جایش را گرفت: ناظر ۲۰۳ را باز می‌کند (نه صفحه‌ی ناسالم بدون ناظر)", e.last().endsWith("/b203/index.html") && g.runCode() == 203 && e.dogAt >= 0, e.last() + " dog=" + e.dogAt);
            g.boot("203"); g.ok("203");
            chk("۲۰۳ زنده شد", o.webCode() == 203 && e.dogAt == -1 && o.failCount() == 0);
        }
        {
            // نوشتنِ شمارنده شکست بخورد (دیسک پر): نشانه «سالم» می‌ماند ولی این اجرا زنده نشد
            File fd = Files.createTempDirectory("g8c").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            o.startUrl(); o.ok(201);
            Files.createDirectories(new File(fd, "ota/cur.json.tmp").toPath());      // نوشتنِ نشانه خطا می‌دهد
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl());
            e.adv(31000);
            chk("نوشتنِ شمارنده شکست خورده و صفحه زنده نشد: بعد از ۳۰ ثانیه کنار گذاشته می‌شود", e.last().equals("null") && !g.loaded() && o.badCode() == 201, e.last());
            // ولی اگر زنده شد (alive) و ناظر دیر رسید، دست نمی‌زند
            File fd2 = Files.createTempDirectory("g8d").toFile(); Ota o2 = new Ota(fd2, 100); put(o2, 201, "3.01");
            o2.startUrl(); o2.ok(201);
            Files.createDirectories(new File(fd2, "ota/cur.json.tmp").toPath());
            Env e2 = new Env(); OtaGuard g2 = new OtaGuard(o2, e2, 100); e2.g = g2;
            g2.resume(); g2.start(o2.startUrl()); g2.boot("201"); g2.ok("201");
            e2.adv(400000);
            chk("همان وضع ولی صفحه «زنده‌ام» گفت: دست نمی‌خورد", e2.loads.size() == 1 && o2.webCode() == 201 && o2.badCode() == 0);
        }
        // ---------- ۸ج) بسته شدنِ پردازه‌ی صفحه توسط سیستم (کمبود حافظه) خرابی حساب نمی‌شود ----------
        {
            File fd = Files.createTempDirectory("g8e").toFile(); Ota o = new Ota(fd, 100); put(o, 201, "3.01");
            Env e = new Env(); OtaGuard g = new OtaGuard(o, e, 100); e.g = g; OtaGuard.resetCrashes();
            g.resume(); g.start(o.startUrl()); g.ok("201");
            for (int k = 0; k < 6; k++) g.renderGone(false);
            chk("شش بار بسته شدن برای کمبود حافظه: بسته می‌ماند", o.webCode() == 201 && o.badCode() == 0 && o.failCount() == 0);
            g.renderGone(true);
            chk("یک خرابی واقعی بعد از آنها هنوز اولین خرابی است", o.webCode() == 201);
            g.renderGone(true);
            chk("خرابیِ واقعیِ دوم: کنار می‌رود", o.webCode() == 100 && o.badCode() == 201);
        }
        // ---------- ۹) بدون Ota (ساخت شکست خورد) ----------
        {
            Env e = new Env(); OtaGuard g = new OtaGuard(null, e, 100); e.g = g;
            g.resume(); g.start("file:///x/ota/b300/index.html");
            chk("ota=null: به APK باز می‌شود و کاری خراب نمی‌شود", e.last().equals("null") && !g.loaded() && g.runCode() == 100);
            g.ok("300"); g.boot("300"); g.err("300"); g.renderGone(true); g.renderGone(true); g.dogFired(); g.pause(); g.resume();
            chk("... همه‌ی گزارش‌ها بی‌خطا نادیده", true);
        }
        System.out.println(ok + " pass " + bad + " fail");
        System.exit(bad == 0 ? 0 : 1);
    }
}
