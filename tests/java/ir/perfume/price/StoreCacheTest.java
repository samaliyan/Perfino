package ir.perfume.price;

import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileOutputStream;
import java.net.InetSocketAddress;
import java.net.URL;
import java.nio.file.Files;
import java.util.concurrent.atomic.AtomicInteger;

/** فایل‌های فشرده‌ی برنامه (Store) و کشِ شرطیِ HTTP (HttpCache) با JDK و سرورِ محلی. اجرا: java ir.perfume.price.StoreCacheTest */
public class StoreCacheTest {
    static int ok = 0, bad = 0;
    static void chk(String name, boolean c) { if (c) ok++; else { bad++; System.out.println("FAIL " + name); } }

    public static void main(String[] a) throws Exception {
        // ---------- Store ----------
        File d = Files.createTempDirectory("store").toFile();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 20000; i++) sb.append("{\"k\":\"عطر ادکلن دیور ساواج\",\"p\":").append(40000000 + i).append("},");
        String big = sb.toString();
        chk("set", Store.set(d, "pp.db", big, "a"));
        File gz = new File(d, "pp.db.json.gz");
        chk("compressed file exists and is much smaller", gz.isFile() && gz.length() * 5 < big.getBytes("UTF-8").length);
        chk("get returns the same text (Persian intact)", big.equals(Store.get(d, "pp.db")));
        chk("no temp file left", d.listFiles().length == 1);
        chk("missing key = empty", "".equals(Store.get(d, "nope")));
        // مهاجرت: فایلِ قدیمیِ فشرده‌نشده خوانده می‌شود و با نوشتنِ بعدی جایش را به فشرده می‌دهد
        FileOutputStream fo = new FileOutputStream(new File(d, "pp.hist.json")); fo.write("{\"old\":1}".getBytes("UTF-8")); fo.close();
        chk("old plain file is read", "{\"old\":1}".equals(Store.get(d, "pp.hist")));
        chk("write after migration", Store.set(d, "pp.hist", "{\"new\":2}", "a") && !new File(d, "pp.hist.json").exists() && "{\"new\":2}".equals(Store.get(d, "pp.hist")));
        // فایلِ فشرده‌ی خراب: به فایلِ قدیمی برمی‌گردد؛ اگر آن هم نبود، خالی (نه استثنا)
        fo = new FileOutputStream(new File(d, "pp.tree.json.gz")); fo.write(new byte[]{1, 2, 3, 4, 5}); fo.close();
        chk("corrupt gz without fallback = empty", "".equals(Store.get(d, "pp.tree")));
        fo = new FileOutputStream(new File(d, "pp.tree.json")); fo.write("fallback".getBytes("UTF-8")); fo.close();
        chk("corrupt gz with old file = old file", "fallback".equals(Store.get(d, "pp.tree")));
        // قطعِ برق وسطِ نوشتن: فایلِ موقتِ نیمه‌کاره فایلِ اصلی را خراب نمی‌کند
        fo = new FileOutputStream(new File(d, "pp.db.a.tmp")); fo.write(new byte[]{31, -117, 8}); fo.close();
        chk("half-written temp does not affect the real file", big.equals(Store.get(d, "pp.db")));
        chk("key is sanitised (no path escape)", Store.set(d, "../x/y", "z", "a") && new File(d, ".._x_y.json.gz").isFile() && "z".equals(Store.get(d, "../x/y")));
        chk("empty text round-trips", Store.set(d, "e", "", "a") && "".equals(Store.get(d, "e")));

        // ---------- HttpCache ----------
        final AtomicInteger hits = new AtomicInteger(), cond = new AtomicInteger();
        final String[] etag = {"\"v1\""}; final String[] body = {"صفحه‌ی یک " + big.substring(0, 5000)};
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.createContext("/etag", ex -> {
            hits.incrementAndGet();
            String inm = ex.getRequestHeaders().getFirst("If-None-Match");
            ex.getResponseHeaders().add("ETag", etag[0]);
            if (inm != null) cond.incrementAndGet();
            if (etag[0].equals(inm)) { ex.sendResponseHeaders(304, -1); ex.close(); return; }
            byte[] b = body[0].getBytes("UTF-8"); ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
        });
        s.createContext("/plain", ex -> { hits.incrementAndGet(); byte[] b = "no validators".getBytes("UTF-8"); ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close(); });
        s.createContext("/lm", ex -> {
            hits.incrementAndGet();
            ex.getResponseHeaders().add("Last-Modified", "Wed, 21 Oct 2026 07:28:00 GMT");
            if (ex.getRequestHeaders().getFirst("If-Modified-Since") != null) { ex.sendResponseHeaders(304, -1); ex.close(); return; }
            byte[] b = "lm body".getBytes("UTF-8"); ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
        });
        s.createContext("/bad304", ex -> { hits.incrementAndGet(); if (ex.getRequestHeaders().getFirst("X-Second") == null && hits.get() % 2 == 1) { ex.sendResponseHeaders(304, -1); ex.close(); return; } byte[] b = "real".getBytes("UTF-8"); ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close(); });
        s.start();
        String base = "http://127.0.0.1:" + s.getAddress().getPort();
        Http.Policy any = new Http.Policy() { @Override public boolean allow(URL u) { return true; } };
        File cd = new File(Files.createTempDirectory("hc").toFile(), "cache");
        HttpCache hc = new HttpCache(cd, 10L * 1024 * 1024);
        Http.Result r1 = hc.fetch(base + "/etag", null, any, 1 << 20);
        chk("first fetch: full body, stored", r1.status == 200 && !r1.fromCache && new String(r1.body, "UTF-8").equals(body[0]) && cd.listFiles().length == 2);
        Http.Result r2 = hc.fetch(base + "/etag", null, any, 1 << 20);
        chk("second fetch: conditional, 304 → same body from cache as 200", r2.status == 200 && r2.fromCache && new String(r2.body, "UTF-8").equals(body[0]) && cond.get() == 1);
        etag[0] = "\"v2\""; body[0] = "صفحه‌ی دو";
        Http.Result r3 = hc.fetch(base + "/etag", null, any, 1 << 20);
        chk("changed on the server: new body, cache replaced", r3.status == 200 && !r3.fromCache && new String(r3.body, "UTF-8").equals("صفحه‌ی دو"));
        Http.Result r4 = hc.fetch(base + "/etag", null, any, 1 << 20);
        chk("then cached again", r4.fromCache && new String(r4.body, "UTF-8").equals("صفحه‌ی دو"));
        int n0 = cd.listFiles().length;
        Http.Result p1 = hc.fetch(base + "/plain", null, any, 1 << 20), p2 = hc.fetch(base + "/plain", null, any, 1 << 20);
        chk("no validators: nothing stored, always a full fetch", p1.status == 200 && p2.status == 200 && !p2.fromCache && cd.listFiles().length == n0);
        Http.Result l1 = hc.fetch(base + "/lm", null, any, 1 << 20), l2 = hc.fetch(base + "/lm", null, any, 1 << 20);
        chk("Last-Modified works like ETag", l1.status == 200 && l2.fromCache && new String(l2.body, "UTF-8").equals("lm body"));
        // بدنه‌ی ذخیره‌شده خراب شده: بی‌شرط دوباره گرفته می‌شود
        for (File f : cd.listFiles()) if (f.getName().equals(HttpCache.keyOf(base + "/etag") + ".b")) { FileOutputStream x = new FileOutputStream(f); x.write(new byte[]{9, 9, 9}); x.close(); }
        Http.Result r5 = hc.fetch(base + "/etag", null, any, 1 << 20);
        chk("corrupt cached body: refetched in full", r5.status == 200 && new String(r5.body, "UTF-8").equals("صفحه‌ی دو"));
        Http.Result b1 = hc.fetch(base + "/bad304", null, any, 1 << 20);
        chk("a 304 we did not ask for is not passed on", b1.status == 200 && new String(b1.body, "UTF-8").equals("real"));
        // سقفِ حجم
        HttpCache small = new HttpCache(cd, 1);
        small.trim();
        chk("trim removes entries over the size cap", cd.listFiles().length <= 2);
        HttpCache none = new HttpCache(null, 0);
        chk("no cache dir: plain fetch", none.fetch(base + "/plain", null, any, 1 << 20).status == 200);
        s.stop(0);
        System.out.println("StoreCacheTest: " + ok + " pass, " + bad + " fail");
        System.exit(bad == 0 ? 0 : 1);
    }
}
