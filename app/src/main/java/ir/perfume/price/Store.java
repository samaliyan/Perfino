package ir.perfume.price;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * فایل‌های بزرگِ برنامه (حافظه‌ی قیمت‌ها، فهرستِ ساخته‌شده، تاریخچه): فشرده (gzip) و با نوشتنِ اتمیک.
 * نوشتن: اول فایلِ موقت، بعد جابه‌جایی به «کلید.json.gz»؛ فایلِ قدیمیِ فشرده‌نشده («کلید.json») فقط بعد از موفقیت پاک می‌شود.
 * خواندن: اول فایلِ فشرده؛ اگر نبود یا خراب بود، فایلِ قدیمیِ فشرده‌نشده (نصب‌های قبل از این نسخه). خطا = رشته‌ی خالی، هرگز استثنا.
 * وابستگی به اندروید ندارد و با JDK آزمایش می‌شود (tests/java/.../StoreTest.java).
 */
final class Store {
    private static final Object LOCK = new Object();

    static String safe(String key) { return String.valueOf(key).replaceAll("[^A-Za-z0-9._-]", "_"); }

    static boolean set(File dir, String key, String text, String tmpTag) {
        if (dir == null || key == null || text == null) return false;
        synchronized (LOCK) {
            String s = safe(key);
            File tmp = new File(dir, s + "." + (tmpTag == null ? "w" : tmpTag) + ".tmp");
            try {
                FileOutputStream fo = new FileOutputStream(tmp);
                try {
                    GZIPOutputStream gz = new GZIPOutputStream(fo, 65536);
                    gz.write(text.getBytes("UTF-8"));
                    gz.finish();
                    fo.flush();
                    fo.getFD().sync();
                } finally { fo.close(); }
                File f = new File(dir, s + ".json.gz");
                if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) { tmp.delete(); return false; } }
                new File(dir, s + ".json").delete();      // نسخه‌ی قدیمیِ فشرده‌نشده دیگر لازم نیست
                return true;
            } catch (Throwable e) {
                try { tmp.delete(); } catch (Throwable ignore) { }
                return false;
            }
        }
    }

    static String get(File dir, String key) {
        if (dir == null || key == null) return "";
        synchronized (LOCK) {
            String s = safe(key);
            File gz = new File(dir, s + ".json.gz");
            if (gz.isFile()) {
                try {
                    InputStream in = new GZIPInputStream(new FileInputStream(gz), 65536);
                    try { return readAll(in, gz.length() * 6 + 16); } finally { in.close(); }
                } catch (Throwable e) { /* خراب: به فایلِ قدیمی برمی‌گردیم */ }
            }
            File f = new File(dir, s + ".json");
            if (!f.isFile()) return "";
            try {
                InputStream in = new FileInputStream(f);
                try { return readAll(in, f.length() + 16); } finally { in.close(); }
            } catch (Throwable e) {
                return "";
            }
        }
    }

    private static String readAll(InputStream in, long hint) throws java.io.IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream((int) Math.max(1024, Math.min(hint, 64L * 1024 * 1024)));
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        return bo.toString("UTF-8");
    }
}
