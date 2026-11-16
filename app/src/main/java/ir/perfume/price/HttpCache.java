package ir.perfume.price;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * کشِ شرطیِ HTTP: اگر سایتی برای صفحه‌ای ETag یا Last-Modified بدهد، بدنه‌ی آن صفحه (فشرده) نگه داشته می‌شود و دفعه‌ی بعد
 * با If-None-Match / If-Modified-Since پرسیده می‌شود؛ جوابِ «۳۰۴ تغییر نکرده» یعنی همان بدنه‌ی قبلی، بدونِ دانلودِ دوباره.
 * سایتی که این هدرها را نمی‌دهد هیچ اثری نمی‌بیند (چیزی ذخیره نمی‌شود). هر خطای کش = رفتارِ معمولی (دانلودِ کامل).
 * در پوشه‌ی کشِ برنامه است (اندروید هر وقت جا کم بیاورد پاکش می‌کند) و سقفِ حجم دارد. وابستگی به اندروید ندارد (tests/java/.../CacheTest.java).
 */
final class HttpCache {
    private final File dir;
    private final long maxTotal;
    private static final int MAX_ENTRY = 9 * 1024 * 1024;
    private long sinceTrim = 0;

    HttpCache(File dir, long maxTotal) { this.dir = dir; this.maxTotal = maxTotal; }

    static String keyOf(String url) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-1").digest(url.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : d) sb.append(Character.forDigit((b >> 4) & 15, 16)).append(Character.forDigit(b & 15, 16));
            return sb.toString();
        } catch (Exception e) { return null; }
    }

    Http.Result fetch(String url, Map<String, String> headers, Http.Policy pol, int maxBytes) throws IOException {
        String k = dir == null ? null : keyOf(url);
        String[] meta = null;      // {etag, lastModified}
        File mf = null, bf = null;
        if (k != null) {
            mf = new File(dir, k + ".m"); bf = new File(dir, k + ".b");
            try { if (mf.isFile() && bf.isFile()) meta = readMeta(mf); } catch (Throwable e) { meta = null; }
        }
        Map<String, String> hm = new HashMap<String, String>();
        if (headers != null) hm.putAll(headers);
        if (meta != null) {
            if (meta[0].length() > 0) hm.put("If-None-Match", meta[0]);
            if (meta[1].length() > 0) hm.put("If-Modified-Since", meta[1]);
        }
        Http.Result r = Http.fetch(url, hm, pol, maxBytes);
        if (r.status == 304 && meta != null) {
            try {
                byte[] body = readBody(bf, maxBytes);
                r.status = 200; r.body = body; r.fromCache = true; r.truncated = false;
                bf.setLastModified(System.currentTimeMillis());      // تازه استفاده شد
                return r;
            } catch (Throwable e) {      // بدنه‌ی ذخیره‌شده خراب است: دور بریز و بی‌شرط بگیر
                try { mf.delete(); bf.delete(); } catch (Throwable ignore) { }
                return Http.fetch(url, headers, pol, maxBytes);
            }
        }
        if (r.status == 304) return Http.fetch(url, headers, pol, maxBytes);      // سایت بی‌دلیل ۳۰۴ داد
        if (k != null && r.status == 200 && !r.truncated && r.body.length > 0 && r.body.length <= MAX_ENTRY && (r.etag.length() > 0 || r.lastModified.length() > 0)) {
            try { save(mf, bf, r); } catch (Throwable e) { try { mf.delete(); bf.delete(); } catch (Throwable ignore) { } }
        } else if (k != null && meta != null && r.status == 200) {
            try { mf.delete(); bf.delete(); } catch (Throwable ignore) { }      // دیگر هدرِ اعتبار نمی‌دهد
        }
        return r;
    }

    private static String[] readMeta(File mf) throws IOException {
        FileInputStream in = new FileInputStream(mf);
        try {
            byte[] b = new byte[4096];
            int n = in.read(b);
            String s = n > 0 ? new String(b, 0, n, "UTF-8") : "";
            int i = s.indexOf('\n');
            String e = i < 0 ? s : s.substring(0, i), l = i < 0 ? "" : s.substring(i + 1).trim();
            if (e.length() == 0 && l.length() == 0) return null;
            return new String[]{e.trim(), l};
        } finally { in.close(); }
    }

    private static byte[] readBody(File bf, int maxBytes) throws IOException {
        InputStream in = new GZIPInputStream(new FileInputStream(bf), 65536);
        try {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n, total = 0;
            while ((n = in.read(buf)) > 0) { total += n; if (total > maxBytes) throw new IOException("too large"); bo.write(buf, 0, n); }
            if (total == 0) throw new IOException("empty");
            return bo.toByteArray();
        } finally { in.close(); }
    }

    private void save(File mf, File bf, Http.Result r) throws IOException {
        if (!dir.isDirectory() && !dir.mkdirs()) return;
        File tb = new File(dir, bf.getName() + "." + Thread.currentThread().getId() + ".tmp");
        FileOutputStream fo = new FileOutputStream(tb);
        try { GZIPOutputStream gz = new GZIPOutputStream(fo, 65536); gz.write(r.body); gz.finish(); } finally { fo.close(); }
        if (!tb.renameTo(bf)) { bf.delete(); if (!tb.renameTo(bf)) { tb.delete(); return; } }
        File tm = new File(dir, mf.getName() + "." + Thread.currentThread().getId() + ".tmp");
        FileOutputStream mo = new FileOutputStream(tm);
        try { mo.write((r.etag.replace('\n', ' ') + "\n" + r.lastModified.replace('\n', ' ')).getBytes("UTF-8")); } finally { mo.close(); }
        if (!tm.renameTo(mf)) { mf.delete(); if (!tm.renameTo(mf)) { tm.delete(); bf.delete(); return; } }
        synchronized (this) { sinceTrim += bf.length(); if (sinceTrim > 4L * 1024 * 1024) { sinceTrim = 0; trim(); } }
    }

    /** اگر حجم از سقف گذشت، قدیمی‌ترین‌ها (به زمانِ آخرین استفاده) پاک می‌شوند تا ۷۰٪ِ سقف */
    void trim() {
        try {
            File[] fs = dir.listFiles();
            if (fs == null) return;
            long total = 0;
            for (File f : fs) total += f.length();
            if (total <= maxTotal) return;
            File[] bodies = new File[fs.length];
            int nb = 0;
            for (File f : fs) { String n = f.getName(); if (n.endsWith(".tmp")) { if (System.currentTimeMillis() - f.lastModified() > 600000) f.delete(); } else if (n.endsWith(".b")) bodies[nb++] = f; }
            bodies = Arrays.copyOf(bodies, nb);
            final Map<File, Long> age = new HashMap<File, Long>();
            for (File f : bodies) age.put(f, f.lastModified());
            Arrays.sort(bodies, new Comparator<File>() { @Override public int compare(File a, File b) { return Long.compare(age.get(a), age.get(b)); } });
            for (int i = 0; i < bodies.length && total > maxTotal * 7 / 10; i++) {
                File b = bodies[i], m = new File(dir, b.getName().substring(0, b.getName().length() - 2) + ".m");
                total -= b.length() + m.length();
                m.delete(); b.delete();
            }
        } catch (Throwable ignore) { }
    }
}
