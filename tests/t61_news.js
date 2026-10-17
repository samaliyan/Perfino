/* خبرِ سایت‌ها: خواندنِ وردپرس و RSS با دریافتِ ساختگی (سایت‌های واقعی از اینجا در دسترس نیستند) */
global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
var HAS_DOM = typeof DOMParser !== 'undefined';      // در Node نیست؛ آزمونِ RSS در مرورگر (t61_news.py) اجرا می‌شود
var D = 86400000, now = Date.now();
function wpPost(t, link, ago, ex, img) { return { title: { rendered: t }, link: link, date_gmt: new Date(now - ago * D).toISOString().slice(0, 19), excerpt: { rendered: '<p>' + ex + '</p>' }, _embedded: img ? { 'wp:featuredmedia': [{ source_url: img }] } : {} }; }
function rss(items) { return '<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>' + items.map(function (i) { return '<item><title>' + i.t + '</title><link>' + i.u + '</link><pubDate>' + new Date(now - i.ago * D).toUTCString() + '</pubDate><description>' + (i.x || '') + '</description></item>'; }).join('') + '</channel></rss>'; }
function mkNet(map) { var calls = []; return { calls: calls, get: function (u) { calls.push(u); var k = Object.keys(map).filter(function (p) { return u.indexOf(p) >= 0; })[0]; var r = k ? map[k] : { status: 404, body: 'nf' }; if (typeof r === 'function') r = r(u); return Promise.resolve(r); } }; }
(async function () {
  // ۱) وردپرس: چند خبر، تاریخِ مرتب، عکس، آدرسِ بد حذف
  var posts = [wpPost('خبر ۱', 'https://liliome.com/a/', 3, 'متن یک', 'https://liliome.com/x.jpg'), wpPost('خبر ۲ <script>alert(1)</script>', 'https://liliome.com/b/', 1, 'متن <b>دو</b>'), wpPost('بد', 'https://evil.com/c/', 0, 'x'), wpPost('بد۲', 'javascript:alert(1)', 0, 'x'), wpPost('', 'https://liliome.com/d/', 0, 'x')];
  var net = mkNet({ 'liliome.com/wp-json/wp/v2/posts': { status: 200, body: JSON.stringify(posts) } });
  var r = await C.fetchNews(net, ['liliome']);
  chk(r.items.length === 2, 'wp: 2 good items, got ' + r.items.length + ' ' + JSON.stringify(r.items.map(function (x) { return x.t; })));
  chk(r.items[0].t.indexOf('خبر ۲') === 0 && r.items[0].t.indexOf('<') < 0, 'wp: title has no tags: ' + r.items[0].t);
  chk(r.items[0].d > r.items[1].d, 'wp: newest first');
  chk(r.items[1].img === 'https://liliome.com/x.jpg', 'wp: image kept');
  chk(r.items[0].x.indexOf('<') < 0 && r.items[0].x.indexOf('دو') >= 0, 'wp: excerpt stripped: ' + r.items[0].x);
  chk(r.notes.liliome === 'ok', 'wp: note ok');
  // ۲) اگر wp-json نبود، RSS
  net = mkNet({ 'safirstores.com/wp-json': { status: 404, body: '' }, 'safirstores.com/feed': { status: 200, body: rss([{ t: 'ورود عطرهای تازه', u: 'https://www.safirstores.com/p/1/', ago: 2, x: 'توضیح' }, { t: 'بد', u: 'https://evil.com/p', ago: 1 }]) } });
  r = await C.fetchNews(net, ['safir']);
  if (HAS_DOM) chk(r.items.length === 1 && r.items[0].sn === 'سفیر' && r.items[0].u === 'https://www.safirstores.com/p/1/', 'rss fallback: ' + JSON.stringify(r.items));
  // ۳) مجله‌ی دیجی‌کالا: فقط خبرِ مربوط به عطر
  net = mkNet({ 'digikala.com/mag/wp-json': { status: 404, body: '' }, 'digikala.com/mag/feed': { status: 200, body: rss([{ t: 'بهترین ادکلن‌های مردانه', u: 'https://www.digikala.com/mag/p1/', ago: 1 }, { t: 'بهترین گوشی‌های میان‌رده', u: 'https://www.digikala.com/mag/p2/', ago: 1 }, { t: 'راهنمای خرید پرفیوم', u: 'https://www.digikala.com/mag/p3/', ago: 2 }]) } });
  r = await C.fetchNews(net, ['digikala']);
  if (HAS_DOM) chk(r.items.length === 2 && r.items.every(function (x) { return /ادکلن|پرفیوم/.test(x.t); }), 'digikala mag filtered to perfume: ' + JSON.stringify(r.items.map(function (x) { return x.t; })));
  // ۴) سایتِ خراب: یادداشتِ fail و بقیه کار می‌کنند؛ هیچ استثنایی بیرون نمی‌آید
  net = mkNet({ 'liliome.com': { status: 500, body: 'err' }, 'hilandbeauty.com/wp-json': { status: 200, body: '[]' }, 'safirstores.com/wp-json': function () { throw new Error('boom'); }, 'digikala.com': { status: 200, body: '<html>not rss</html>' } });
  r = await C.fetchNews(net);
  chk(r.items.length === 0 && r.notes.liliome === 'fail' && r.notes.hiland === 'none' && r.notes.safir === 'fail' && r.notes.digikala === 'fail', 'failures noted per site: ' + JSON.stringify(r.notes));
  // ۵) حداکثر ۶ خبر از هر سایت؛ ۲۴ خبر در کل؛ تکراری حذف
  var many = []; for (var i = 0; i < 9; i++) many.push(wpPost('خبر لیلیوم ' + i, 'https://liliome.com/m' + (i % 8) + '/', i, 'x'));
  var many2 = []; for (var j = 0; j < 9; j++) many2.push(wpPost('خبر هایلند ' + j, 'https://hilandbeauty.com/h' + j + '/', j + 0.5, 'x'));
  var many3 = []; for (var k = 0; k < 9; k++) many3.push(wpPost('خبر دیگر ' + k, 'https://liliome.com/m0/', k, 'x'));
  net = mkNet({ 'liliome.com/wp-json': { status: 200, body: JSON.stringify(many) }, 'hilandbeauty.com/wp-json': { status: 200, body: JSON.stringify(many2) }, 'safirstores.com/wp-json': { status: 200, body: JSON.stringify(many3.map(function (x) { x.link = x.link.replace('liliome.com', 'www.safirstores.com'); return x; })) }, 'digikala.com/mag/wp-json': { status: 404, body: '' }, 'digikala.com/mag/feed': { status: 404, body: '' } });
  r = await C.fetchNews(net);
  var per = {}; r.items.forEach(function (x) { per[x.s] = (per[x.s] || 0) + 1; });
  chk(Object.keys(per).every(function (s) { return per[s] <= 6; }) && r.items.length <= 24 && r.items.length >= 12, 'per-site cap: ' + JSON.stringify(per));
  var seen = {}; chk(r.items.every(function (x) { if (seen[x.u]) return false; seen[x.u] = 1; return true; }), 'no duplicates');
  chk(r.items.every(function (x, i) { return i === 0 || r.items[i - 1].d >= x.d; }), 'sorted newest first');
  // ۶) پاسخِ بی‌معنی (JSON خراب، شیء به‌جای آرایه)
  net = mkNet({ 'wp-json': { status: 200, body: '{"code":"x"}' }, '/feed': { status: 200, body: '<rss><channel><item><title>x' } });
  r = await C.fetchNews(net, ['liliome', 'hiland']);
  chk(r.items.length === 0, 'garbage responses give no items and no crash');
  console.log('dom:', HAS_DOM);
  // ۷) درخواست‌ها فقط به سایت‌های فهرستِ خبر
  var allCalls = []; net = { get: function (u) { allCalls.push(u); return Promise.resolve({ status: 404, body: '' }); } };
  await C.fetchNews(net);
  chk(allCalls.length >= 4 && allCalls.every(function (u) { return /^https:\/\/(liliome\.com|www\.safirstores\.com|hilandbeauty\.com|www\.digikala\.com|hesperfume\.ir|flower-perfume\.com|khalifechi\.com|redmag\.ir)\//.test(u); }), 'only the news sites are asked: ' + allCalls.length);

  // ۸) عکسِ داخلِ متن وقتی عکسِ شاخص نیست؛ اندازه‌ی میانی از srcset؛ آیکون/لوگو/ایموجی/عکسِ کوچک رد می‌شود
  var P = C.newsPickImg;
  chk(P('<img src="https://liliome.com/a-150.jpg" width="100" height="100"><img src="https://liliome.com/up/b.jpg" srcset="https://liliome.com/up/b-300x169.jpg 300w, https://liliome.com/up/b-768x432.jpg 768w, https://liliome.com/up/b.jpg 1680w" width="1680" height="945">') === 'https://liliome.com/up/b-768x432.jpg', 'pickImg: skips the small one, picks ~768 from srcset');
  chk(P('<img src="data:image/gif;base64,AAA" data-src="//cdn.liliome.com/p.jpg">') === 'https://cdn.liliome.com/p.jpg', 'pickImg: lazy-load data-src and protocol-relative url');
  chk(P('<img src="https://x.com/emoji/1f600.png"><img src="https://x.com/logo.png"><img src="https://x.com/i.svg"><img src="https://x.com/wp-includes/images/icon.png">') === '', 'pickImg: emoji, logo, svg and icons are skipped');
  chk(P('<img src="http://liliome.com/up/z.jpg">') === 'https://liliome.com/up/z.jpg', 'pickImg: http is upgraded to https');
  chk(P('<img src="/up/relative.jpg">') === '' && P('') === '' && P(null) === '' && P('<img src=') === '', 'pickImg: relative url, empty, null and broken html give nothing');
  chk(P('<img src="https://a.com/1.jpg?x=1&amp;y=2">') === 'https://a.com/1.jpg?x=1&y=2', 'pickImg: &amp; in the url is decoded');
  // ۹) خلاصه‌ی خبر: «[…]» و «ادامه مطلب» و «The post … appeared first on …» برداشته می‌شود؛ خلاصه‌ی تکراریِ عنوان حذف می‌شود
  var X = C.newsExcerpt;
  chk(X('<p>برای فصل سرد چه رایحه‌هایی مناسب‌اند؟ [&hellip;]</p>', 'عنوان') === 'برای فصل سرد چه رایحه‌هایی مناسب‌اند؟', 'excerpt: trailing [...] removed: ' + X('<p>برای فصل سرد چه رایحه‌هایی مناسب‌اند؟ [&hellip;]</p>', 'عنوان'));
  chk(X('<p>متن The post عنوان appeared first on لیلیوم.</p>', 'x') === 'متن', 'excerpt: "appeared first on" removed');
  chk(X('<p>عنوان خبر</p>', 'عنوان خبر') === '', 'excerpt equal to the title is dropped');
  chk(X('', 't') === '' && X(null, 't') === '', 'excerpt: empty and null');
  chk(X('<p>' + 'کلمه '.repeat(60) + '</p>', 't').length <= 131 && /…$/.test(X('<p>' + 'کلمه '.repeat(60) + '</p>', 't')), 'excerpt: long text cut at a word with …');
  // ۱۰) وردپرس: عکسِ شاخص بر عکسِ متن مقدم است؛ بدونِ عکسِ شاخص از متن؛ بدونِ خلاصه از چند کلمه‌ی اولِ متن
  var wp1 = wpPost('با عکس شاخص', 'https://liliome.com/f1/', 1, 'متن'); wp1._embedded = { 'wp:featuredmedia': [{ source_url: 'https://liliome.com/up/full.jpg', media_details: { sizes: { medium: { source_url: 'https://liliome.com/up/m.jpg' }, medium_large: { source_url: 'https://liliome.com/up/ml.jpg' } } } }] }; wp1.content = { rendered: '<img src="https://liliome.com/up/inbody.jpg">' };
  var wp2 = wpPost('بدون عکس شاخص', 'https://liliome.com/f2/', 2, ''); wp2.excerpt = { rendered: '' }; wp2.content = { rendered: '<figure><img src="https://liliome.com/up/body.jpg" width="1200" height="700"></figure><p>اولین بند از متنِ مقاله که به‌جای خلاصه می‌آید.</p>' };
  var wp3 = wpPost('فقط medium', 'https://liliome.com/f3/', 3, 'خلاصه'); wp3._embedded = { 'wp:featuredmedia': [{ source_url: 'https://liliome.com/up/full3.jpg', media_details: { sizes: { medium: { source_url: 'https://liliome.com/up/m3.jpg' } } } }] };
  var wp4 = wpPost('هیچ عکسی', 'https://liliome.com/f4/', 4, 'خلاصه'); wp4.content = { rendered: '<p>فقط متن</p>' };
  net = mkNet({ 'liliome.com/wp-json/wp/v2/posts': { status: 200, body: JSON.stringify([wp1, wp2, wp3, wp4]) } });
  r = await C.fetchNews(net, ['liliome']);
  var byT = {}; r.items.forEach(function (x) { byT[x.t] = x; });
  chk(byT['با عکس شاخص'].img === 'https://liliome.com/up/ml.jpg', 'featured medium_large wins: ' + byT['با عکس شاخص'].img);
  chk(byT['بدون عکس شاخص'].img === 'https://liliome.com/up/body.jpg', 'no featured: image from the body: ' + byT['بدون عکس شاخص'].img);
  chk(byT['بدون عکس شاخص'].x.indexOf('اولین بند') === 0, 'no excerpt: first words of the body: ' + byT['بدون عکس شاخص'].x);
  chk(byT['فقط medium'].img === 'https://liliome.com/up/full3.jpg', 'only a small size: the full image is used instead of the 300px one: ' + byT['فقط medium'].img);
  chk(byT['هیچ عکسی'].img === '' && byT['هیچ عکسی'].x === 'خلاصه', 'no image anywhere: empty img (the app draws a bottle frame)');

  // ۱۱) اصلاح‌های بازبینیِ مستقل: «icon» فقط واژه‌ی کامل، &#038;، «>» در alt، ویرگول در آدرسِ srcset، سرعتِ بدترین حالت، دمِ بلندِ خلاصه
  chk(P('<img src="https://x.com/up/silicone-perfume.jpg">') === 'https://x.com/up/silicone-perfume.jpg', 'pickImg: "silicone" is not an icon');
  chk(P('<img src="https://x.com/wp-includes/images/icon.png"><img src="https://x.com/site-logo-white.png"><img src="https://x.com/up/emoji/1f600.png">') === '', 'pickImg: icon.png, logo and emoji paths are still skipped');
  chk(P('<img src="https://x.com/a.jpg?a=1&#038;b=2">') === 'https://x.com/a.jpg?a=1&b=2', 'pickImg: &#038; (what WordPress writes) is decoded');
  chk(P('<img alt="a > b" src="https://x.com/alt.jpg" width="800" height="500">') === 'https://x.com/alt.jpg', 'pickImg: ">" inside alt does not cut the tag');
  chk(P('<img src="https://x.com/old.jpg" srcset="https://cdn.x.com/w_300,h_200/a.jpg 300w, https://cdn.x.com/w_800,h_500/a.jpg 800w">') === 'https://cdn.x.com/w_800,h_500/a.jpg', 'pickImg: commas inside a srcset url');
  var t0 = Date.now(); P('<img '.repeat(9000)); P('<img src="x'.repeat(4000)); chk(Date.now() - t0 < 400, 'pickImg: thousands of unclosed tags are fast: ' + (Date.now() - t0) + 'ms');
  var longTail = 'کلمه '.repeat(24) + '[&hellip;]' + '<p>The post ' + 'عنوان '.repeat(30) + ' appeared first on لیلیوم.</p>';
  chk(X(longTail, 't').indexOf('The post') < 0 && X(longTail, 't').indexOf('[') < 0, 'excerpt: a long footer after a short excerpt is removed whole: ' + X(longTail, 't').slice(-20));
  console.log(ok, 'pass', bad, 'fail'); process.exit(bad ? 1 : 0);
})();
