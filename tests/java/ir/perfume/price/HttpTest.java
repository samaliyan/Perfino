package ir.perfume.price;

import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/** آزمایش Http.java با دو سرور محلیِ واقعی: بریده‌شدنِ پاسخ، ریدایرکت (هدرها، مقصدِ غیرمجاز، حلقه)، قاعده‌ی آدرس‌های عمومی */
public class HttpTest {
    static int ok = 0, bad = 0;
    static void chk(String name, boolean c, Object info) {
        if (c) ok++; else bad++;
        System.out.println((c ? "PASS " : "FAIL ") + name + (info != null ? "  " + info : ""));
    }
    static void chk(String name, boolean c) { chk(name, c, null); }

    static final Map<String, Map<String, String>> seen = new ConcurrentHashMap<String, Map<String, String>>();

    static HttpServer server(final int port, final String tag) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        s.createContext("/", new com.sun.net.httpserver.HttpHandler() {
            @Override public void handle(com.sun.net.httpserver.HttpExchange x) throws IOException {
                String path = x.getRequestURI().getPath();
                Map<String, String> h = new HashMap<String, String>();
                for (String k : x.getRequestHeaders().keySet()) h.put(k.toLowerCase(Locale.ROOT), x.getRequestHeaders().getFirst(k));
                seen.put(tag + path, h);
                byte[] body; int code = 200;
                if (path.equals("/ok")) body = "hello".getBytes(StandardCharsets.UTF_8);
                else if (path.equals("/big")) { body = new byte[1000]; Arrays.fill(body, (byte) 'x'); }
                else if (path.equals("/exact")) { body = new byte[100]; Arrays.fill(body, (byte) 'y'); }
                else if (path.equals("/missing")) { code = 404; body = "nope".getBytes(StandardCharsets.UTF_8); }
                else if (path.equals("/r1")) { code = 302; x.getResponseHeaders().add("Location", "/ok"); body = new byte[0]; }
                else if (path.equals("/toother")) { code = 302; x.getResponseHeaders().add("Location", "http://127.0.0.1:" + OTHER + "/ok"); body = new byte[0]; }
                else if (path.equals("/loop")) { code = 302; x.getResponseHeaders().add("Location", "/loop"); body = new byte[0]; }
                else body = "other".getBytes(StandardCharsets.UTF_8);
                x.sendResponseHeaders(code, body.length == 0 ? -1 : body.length);
                if (body.length > 0) { OutputStream o = x.getResponseBody(); o.write(body); o.close(); }
                x.close();
            }
        });
        s.start();
        return s;
    }
    static int OTHER;

    public static void main(String[] a) throws Exception {
        HttpServer s1 = server(0, "A"), s2 = server(0, "B");
        final int p1 = s1.getAddress().getPort(); OTHER = s2.getAddress().getPort();
        final String base = "http://127.0.0.1:" + p1;
        Http.Policy onlyA = new Http.Policy() { public boolean allow(URL u) { return u.getProtocol().equals("http") && u.getPort() == p1; } };
        Map<String, String> hd = new LinkedHashMap<String, String>();
        hd.put("Accept", "application/json"); hd.put("X-Test", "yes"); hd.put("Cookie", "secret=1"); hd.put("Authorization", "Bearer z");

        Http.Result r = Http.fetch(base + "/ok", hd, onlyA, 1000);
        chk("plain 200: status and body", r.status == 200 && new String(r.body, StandardCharsets.UTF_8).equals("hello") && !r.truncated);
        chk("headers from the page reach the server", "yes".equals(seen.get("A/ok").get("x-test")) && "application/json".equals(seen.get("A/ok").get("accept")));
        chk("Cookie and Authorization from the page are not sent", seen.get("A/ok").get("cookie") == null && seen.get("A/ok").get("authorization") == null);

        r = Http.fetch(base + "/big", null, onlyA, 100);
        chk("a response bigger than the limit is reported as truncated (never as complete)", r.truncated && r.body.length == 100 && r.status == 200, r.truncated + "/" + r.body.length);
        r = Http.fetch(base + "/exact", null, onlyA, 100);
        chk("a response exactly at the limit is not truncated", !r.truncated && r.body.length == 100);
        r = Http.fetch(base + "/missing", null, onlyA, 1000);
        chk("404: status and error body are read", r.status == 404 && new String(r.body, StandardCharsets.UTF_8).equals("nope"));

        seen.clear();
        r = Http.fetch(base + "/r1", hd, onlyA, 1000);
        chk("redirect to the same site is followed", r.status == 200 && new String(r.body, StandardCharsets.UTF_8).equals("hello"));
        chk("the page's headers are sent again on the redirected request", seen.get("A/ok") != null && "yes".equals(seen.get("A/ok").get("x-test")) && "application/json".equals(seen.get("A/ok").get("accept")), seen.get("A/ok"));

        boolean thrown = false;
        try { Http.fetch(base + "/toother", null, onlyA, 1000); } catch (IOException e) { thrown = e.getMessage().contains("redirect not allowed"); }
        chk("redirect to a destination the policy refuses is an error", thrown);
        chk("the refused destination was never contacted", seen.get("B/ok") == null);

        thrown = false;
        try { Http.fetch("http://127.0.0.1:" + OTHER + "/ok", null, onlyA, 1000); } catch (IOException e) { thrown = e.getMessage().contains("not allowed"); }
        chk("a first URL the policy refuses is an error", thrown);

        r = Http.fetch(base + "/loop", null, onlyA, 1000);
        chk("a redirect loop stops after 5 hops (no endless loop)", r.status == 302);

        // قاعده‌ی سایت‌ها
        Http.Policy sites = Http.sitesOnly(new String[]{"liliome.com", "digikala.com"});
        chk("sitesOnly: https on an allowed site and its subdomain", sites.allow(new URL("https://liliome.com/x")) && sites.allow(new URL("https://www.digikala.com/y")));
        chk("sitesOnly: refuses http, other hosts and look-alikes", !sites.allow(new URL("http://liliome.com/x")) && !sites.allow(new URL("https://evil.com/")) && !sites.allow(new URL("https://notliliome.com/")) && !sites.allow(new URL("https://liliome.com.evil.com/")));

        // قاعده‌ی عکس‌ها
        chk("isPublic: private, loopback, link-local, ULA and carrier-NAT addresses are refused",
            !Http.isPublic(InetAddress.getByName("127.0.0.1")) && !Http.isPublic(InetAddress.getByName("10.1.2.3")) && !Http.isPublic(InetAddress.getByName("192.168.1.5"))
            && !Http.isPublic(InetAddress.getByName("172.16.0.9")) && !Http.isPublic(InetAddress.getByName("169.254.1.1")) && !Http.isPublic(InetAddress.getByName("fd00::1"))
            && !Http.isPublic(InetAddress.getByName("::1")) && !Http.isPublic(InetAddress.getByName("100.64.0.1")) && !Http.isPublic(InetAddress.getByName("0.0.0.0")));
        chk("isPublic: a normal public address is accepted", Http.isPublic(InetAddress.getByName("8.8.8.8")) && Http.isPublic(InetAddress.getByName("2001:4860:4860::8888")));
        Http.Policy img = Http.publicHttps();
        chk("publicHttps: refuses http, IP literals, localhost and .local", !img.allow(new URL("http://example.com/a.jpg")) && !img.allow(new URL("https://127.0.0.1/a.jpg")) && !img.allow(new URL("https://localhost/a.jpg"))
            && !img.allow(new URL("https://192.168.1.1/a.jpg")) && !img.allow(new URL("https://printer.local/a.jpg")) && !img.allow(new URL("https://[::1]/a.jpg")));

        s1.stop(0); s2.stop(0);
        System.out.println("\nHttpTest: " + ok + " pass, " + bad + " fail");
        if (bad > 0) System.exit(1);
    }
}
