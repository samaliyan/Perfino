package ir.perfume.price;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.util.Locale;
import java.util.Map;

/**
 * دانلودِ امنِ وب: هر تغییر مسیر (ریدایرکت) دستی دنبال می‌شود و مقصدش دوباره با همان قاعده سنجیده می‌شود؛
 * هدرهای درخواست در هر مرحله دوباره گذاشته می‌شوند؛ و پاسخِ بیش از اندازه «بریده‌شده» گزارش می‌شود (نه موفق).
 * هیچ وابستگی به اندروید ندارد، پس با JDK و سرور محلی آزمایش می‌شود (tests/java/.../HttpTest.java).
 */
final class Http {
    /** آیا این نشانی مجاز است؟ (برای هر مرحله‌ی تغییر مسیر هم پرسیده می‌شود) */
    interface Policy { boolean allow(URL u); }

    static final String UA = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

    static final class Result {
        int status;
        byte[] body = new byte[0];
        boolean truncated;      // پاسخ از maxBytes بزرگ‌تر بود و ادامه‌اش خوانده نشد
    }

    /** قاعده‌ی برنامه برای کار با سایت‌ها: فقط https و فقط همان چهار سایت (و زیردامنه‌هایشان) */
    static Policy sitesOnly(final String[] hosts) {
        return new Policy() {
            @Override public boolean allow(URL u) {
                if (u == null || !"https".equals(u.getProtocol())) return false;
                String h = u.getHost();
                if (h == null) return false;
                h = h.toLowerCase(Locale.ROOT);
                for (String a : hosts) { if (h.equals(a) || h.endsWith("." + a)) return true; }
                return false;
            }
        };
    }

    /** قاعده‌ی عکس‌ها: هر سایتِ https (عکس‌ها روی CDN هستند) ولی نه آدرسِ داخلی/محلی، حتی اگر نامِ دامنه به آدرسِ داخلی برسد */
    static Policy publicHttps() {
        return new Policy() {
            @Override public boolean allow(URL u) {
                try {
                    if (u == null || !"https".equals(u.getProtocol())) return false;
                    String h = u.getHost() == null ? "" : u.getHost().toLowerCase(Locale.ROOT);
                    if (h.isEmpty() || h.equals("localhost") || h.matches("[0-9.]+") || h.contains(":") || h.endsWith(".local") || h.endsWith(".internal")) return false;
                    for (InetAddress a : InetAddress.getAllByName(h)) { if (!isPublic(a)) return false; }
                    return true;
                } catch (Exception e) { return false; }
            }
        };
    }

    static boolean isPublic(InetAddress a) {
        if (a.isAnyLocalAddress() || a.isLoopbackAddress() || a.isLinkLocalAddress() || a.isSiteLocalAddress() || a.isMulticastAddress()) return false;
        byte[] b = a.getAddress();
        if (b.length == 16 && (b[0] & 0xFE) == 0xFC) return false;      // fc00::/7 (آدرس داخلیِ IPv6)
        if (b.length == 4 && (b[0] & 255) == 100 && (b[1] & 0xC0) == 0x40) return false;      // 100.64.0.0/10
        return true;
    }

    private static HttpURLConnection prepare(URL u, Map<String, String> headers, int connectMs, int readMs, boolean defaults) throws IOException {
        HttpURLConnection c = (HttpURLConnection) u.openConnection();
        c.setConnectTimeout(connectMs);
        c.setReadTimeout(readMs);
        c.setInstanceFollowRedirects(false);
        c.setRequestProperty("User-Agent", UA);
        if (defaults) {
            c.setRequestProperty("Accept-Language", "fa-IR,fa;q=0.9,en;q=0.5");
            c.setRequestProperty("Accept", "application/json, text/html;q=0.9, */*;q=0.5");
        }
        if (headers != null) for (Map.Entry<String, String> e : headers.entrySet()) {
            String k = e.getKey();
            if (k == null || e.getValue() == null) continue;
            if (k.equalsIgnoreCase("Host") || k.equalsIgnoreCase("Cookie") || k.equalsIgnoreCase("Authorization")) continue;      // این‌ها از صفحه نمی‌آیند
            c.setRequestProperty(k, e.getValue());
        }
        return c;
    }

    /**
     * درخواست را می‌فرستد و تا ۵ تغییر مسیر را دنبال می‌کند؛ هر مقصد باید Policy را بگذراند (وگرنه IOException).
     * اتصالِ آخر را (با کدِ پاسخ آماده) برمی‌گرداند؛ بستنش با فراخواننده است.
     */
    static HttpURLConnection open(String url, Map<String, String> headers, Policy pol, int connectMs, int readMs, boolean defaults) throws IOException {
        URL u = new URL(url);
        if (!pol.allow(u)) throw new IOException("host not allowed");
        HttpURLConnection c = prepare(u, headers, connectMs, readMs, defaults);
        int status = c.getResponseCode();
        for (int hop = 0; hop < 5 && status >= 300 && status < 400; hop++) {
            String loc = c.getHeaderField("Location");
            if (loc == null) break;
            URL nu = new URL(u, loc);
            if (!pol.allow(nu)) { c.disconnect(); throw new IOException("redirect not allowed"); }
            c.disconnect();
            u = nu;
            c = prepare(u, headers, connectMs, readMs, defaults);
            status = c.getResponseCode();
        }
        return c;
    }

    /** پاسخ را تا maxBytes می‌خواند؛ اگر بزرگ‌تر بود truncated=true (و بدنه‌ی ناقص) */
    static Result fetch(String url, Map<String, String> headers, Policy pol, int maxBytes) throws IOException {
        HttpURLConnection c = open(url, headers, pol, 15000, 25000, true);
        try {
            Result r = new Result();
            r.status = c.getResponseCode();
            InputStream in = r.status >= 400 ? c.getErrorStream() : c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            if (in != null) {
                try {
                    byte[] buf = new byte[16384];
                    int n, total = 0;
                    while ((n = in.read(buf)) > 0) {
                        if (total + n > maxBytes) { out.write(buf, 0, maxBytes - total); r.truncated = true; break; }
                        out.write(buf, 0, n); total += n;
                    }
                } finally { try { in.close(); } catch (Exception ignore) { } }
            }
            r.body = out.toByteArray();
            return r;
        } finally { c.disconnect(); }
    }
}
