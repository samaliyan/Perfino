package ir.perfume.price;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * پلِ شبکه از راهِ خودِ موتورِ صفحه: صفحه با fetch() نشانیِ مجازیِ https://perfino.local/proxy?u=<نشانیِ سایت> را می‌خواهد؛
 * اینجا (روی رشته‌ی شبکه‌ی WebView، نه رشته‌ی اصلی) همان درخواست با همان قاعده‌های قبلی (فقط سایت‌های فهرست، سقفِ حجم) فرستاده می‌شود
 * و بدنه به‌صورتِ بایت به صفحه برمی‌گردد. پس دیگر لازم نیست پاسخِ چندمگابایتی به رشته‌ی جاوااسکریپت تبدیل و روی رشته‌ی اصلی تزریق شود.
 * کدِ واقعیِ پاسخ در هدرِ X-Perfino-Status است (WebView کدِ ۳xx و زیرِ ۱۰۰ را نمی‌پذیرد)؛ خطای شبکه = ۵۹۹ با متنِ خطا در بدنه.
 * اگر این راه روی گوشی‌ای کار نکند، صفحه خودش به پلِ قدیمی (Native.fetch) برمی‌گردد.
 */
final class Proxy {
    static final String HOST = "perfino.local";

    static WebResourceResponse handle(WebResourceRequest req, HttpCache cache) {
        try {
            if (req == null) return null;
            Uri u = req.getUrl();
            if (u == null || !"https".equals(u.getScheme()) || !HOST.equals(u.getHost())) return null;      // درخواستِ معمولیِ صفحه
            if (!"GET".equalsIgnoreCase(req.getMethod())) return reply(599, 0, "method".getBytes("UTF-8"), false);
            String target = "/proxy".equals(u.getPath()) ? u.getQueryParameter("u") : null;
            if (target == null || !target.startsWith("https://")) return reply(599, 0, "bad url".getBytes("UTF-8"), false);
            Map<String, String> hm = new HashMap<String, String>();
            Map<String, String> rh = req.getRequestHeaders();
            if (rh != null) for (Map.Entry<String, String> e : rh.entrySet()) { if ("accept".equalsIgnoreCase(e.getKey()) && e.getValue() != null) hm.put("Accept", e.getValue()); }
            Http.Result r;
            try {
                Http.Policy pol = Http.sitesOnly(MainActivity.ALLOW_HOSTS);
                r = cache != null ? cache.fetch(target, hm, pol, MainActivity.MAX_BYTES) : Http.fetch(target, hm, pol, MainActivity.MAX_BYTES);
                if (r.truncated) return reply(599, 0, ("IOException: response too large (> " + MainActivity.MAX_BYTES + " bytes)").getBytes("UTF-8"), false);
            } catch (Throwable e) {
                return reply(599, 0, (e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage())).getBytes("UTF-8"), false);
            }
            return reply(r.status >= 100 && r.status <= 599 && !(r.status >= 300 && r.status < 400) ? r.status : 598, r.status, r.body, r.fromCache);
        } catch (Throwable e) {
            try { return reply(599, 0, "proxy error".getBytes("UTF-8"), false); } catch (Throwable e2) { return null; }
        }
    }

    private static WebResourceResponse reply(int code, int real, byte[] body, boolean cached) {
        Map<String, String> h = new HashMap<String, String>();
        h.put("Access-Control-Allow-Origin", "*");
        h.put("Access-Control-Expose-Headers", "X-Perfino-Status, X-Perfino-Cache");
        h.put("Cache-Control", "no-store");
        h.put("X-Perfino-Status", String.valueOf(real));
        if (cached) h.put("X-Perfino-Cache", "1");
        return new WebResourceResponse("text/plain", "utf-8", code, code == 599 ? "Upstream Error" : "OK", h, new ByteArrayInputStream(body == null ? new byte[0] : body));
    }
}
