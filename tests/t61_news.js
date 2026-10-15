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
  // ۵) حداکثر ۴ خبر از هر سایت؛ ۱۲ خبر در کل؛ تکراری حذف
  var many = []; for (var i = 0; i < 9; i++) many.push(wpPost('خبر لیلیوم ' + i, 'https://liliome.com/m' + (i % 8) + '/', i, 'x'));
  var many2 = []; for (var j = 0; j < 9; j++) many2.push(wpPost('خبر هایلند ' + j, 'https://hilandbeauty.com/h' + j + '/', j + 0.5, 'x'));
  var many3 = []; for (var k = 0; k < 9; k++) many3.push(wpPost('خبر دیگر ' + k, 'https://liliome.com/m0/', k, 'x'));
  net = mkNet({ 'liliome.com/wp-json': { status: 200, body: JSON.stringify(many) }, 'hilandbeauty.com/wp-json': { status: 200, body: JSON.stringify(many2) }, 'safirstores.com/wp-json': { status: 200, body: JSON.stringify(many3.map(function (x) { x.link = x.link.replace('liliome.com', 'www.safirstores.com'); return x; })) }, 'digikala.com/mag/wp-json': { status: 404, body: '' }, 'digikala.com/mag/feed': { status: 404, body: '' } });
  r = await C.fetchNews(net);
  var per = {}; r.items.forEach(function (x) { per[x.s] = (per[x.s] || 0) + 1; });
  chk(Object.keys(per).every(function (s) { return per[s] <= 4; }) && r.items.length <= 12 && r.items.length >= 8, 'per-site cap: ' + JSON.stringify(per));
  var seen = {}; chk(r.items.every(function (x) { if (seen[x.u]) return false; seen[x.u] = 1; return true; }), 'no duplicates');
  chk(r.items.every(function (x, i) { return i === 0 || r.items[i - 1].d >= x.d; }), 'sorted newest first');
  // ۶) پاسخِ بی‌معنی (JSON خراب، شیء به‌جای آرایه)
  net = mkNet({ 'wp-json': { status: 200, body: '{"code":"x"}' }, '/feed': { status: 200, body: '<rss><channel><item><title>x' } });
  r = await C.fetchNews(net, ['liliome', 'hiland']);
  chk(r.items.length === 0, 'garbage responses give no items and no crash');
  console.log('dom:', HAS_DOM);
  // ۷) درخواست‌ها فقط به آدرس‌های همان چهار سایت
  var allCalls = []; net = { get: function (u) { allCalls.push(u); return Promise.resolve({ status: 404, body: '' }); } };
  await C.fetchNews(net);
  chk(allCalls.length >= 4 && allCalls.every(function (u) { return /^https:\/\/(liliome\.com|www\.safirstores\.com|hilandbeauty\.com|www\.digikala\.com)\//.test(u); }), 'only the four sites are asked: ' + allCalls.length);
  console.log(ok, 'pass', bad, 'fail'); process.exit(bad ? 1 : 0);
})();
