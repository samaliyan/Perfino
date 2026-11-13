// دیجی‌کالا: پوششِ کامل با بازه‌های قیمت (۱.۵۲). سایتِ ساختگی مثلِ خودِ دیجی‌کالا: هر پرسش حداکثر ۱۰۰ صفحه، ترتیبِ ارزان‌ترین، فیلترِ price[min].
// اجرا: node tests/t84_dk_walk.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
if (C.CFG) C.CFG.retryMs = 1;
var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
// ۹۰۰۰ کالا: ۳۰۰۰ تقلیدیِ ارزان (زیرِ کف)، ۶۰۰۰ بالای کف؛ محبوبیت تصادفی (ترتیبِ پیش‌فرض) ← کالای میان‌قیمتِ کم‌فروش در ۱۰۰ صفحه‌ی اول نیست
var ALL = [], seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
for (var i = 1; i <= 9000; i++) {
  var rial = i <= 3000 ? 300000 + i * 1000 : 6000000 + (i - 3000) * 90000 + (i % 7 === 0 ? 0 : Math.floor(rnd() * 50000));
  ALL.push({ id: i, pop: rnd(), title_fa: 'ادو پرفیوم مردانه برند' + i + ' مدل تست' + i + ' حجم 100 میلی لیتر', status: 'marketable', default_variant: { status: 'marketable', price: { selling_price: rial } }, images: {}, data_layer: {} });
}
ALL[5554].title_fa = 'ادو پرفیوم زنانه آوند مدل رولون چارلی با رایحه معتدل حجم 50 میلی لیتر'; ALL[5554].pop = 0; ALL[5554].data_layer = { brand: 'متفرقه' };      // عنوانِ واقعیِ دیجی‌کالا (dkp-22804796)
function server(o) {
  var n = { req: 0, urls: [] };
  return { n: n, get: async function (u) {
    n.req++; n.urls.push(u);
    var p = +/page=(\d+)/.exec(u)[1], a = ALL.slice(), m = /price%5Bmin%5D=(\d+)/.exec(u);
    if (m && o.reject) return { status: 400, body: '' };
    if (m && !o.ignore) a = a.filter(function (x) { return x.default_variant.price.selling_price >= +m[1]; });
    if (/sort=20/.test(u)) a.sort(function (x, y) { return x.default_variant.price.selling_price - y.default_variant.price.selling_price; });
    else if (/sort=21/.test(u)) a.sort(function (x, y) { return y.default_variant.price.selling_price - x.default_variant.price.selling_price; });
    else a.sort(function (x, y) { return y.pop - x.pop; });
    var tp = Math.ceil(a.length / 20);
    if (p > 100) return { status: 200, body: JSON.stringify({ data: { products: [], pager: { total_pages: tp, total_items: a.length } } }) };
    return { status: 200, body: JSON.stringify({ data: { products: a.slice((p - 1) * 20, p * 20), pager: { current_page: p, total_pages: tp, total_items: a.length } } }) };
  } };
}
(async function () {
  var s1 = server({}), ps = [], r1 = await C.digikalaSource(s1, function (n, p) { if (p != null) ps.push(p); }, 'full');
  var ids = {}, dup = 0; r1.items.forEach(function (x) { if (ids[x.id]) dup++; ids[x.id] = 1; });
  var above = ALL.filter(function (x) { return x.default_variant.price.selling_price >= 2500000; }), miss = above.filter(function (x) { return !ids[x.id]; }).length;
  chk(miss === 0, 'every product above the floor is read (missing ' + miss + ' of ' + above.length + ')');
  chk(!!ids[5555], 'the mid-priced, unpopular «آوند مدل رولون چارلی» is read');
  chk(dup === 0, 'no duplicates: ' + dup);
  chk(r1.complete === false && /بازه‌های قیمت/.test(r1.note) && /^ناقص: دیجی‌کالا فقط ۱۰۰ صفحه/.test(r1.note) && !/نرسید/.test(r1.note), 'note: ' + r1.note);
  chk(s1.n.req <= Math.ceil(above.length / 20) + 12, 'about one request per 20 products, no separate default pass: ' + s1.n.req + ' for ' + above.length);
  chk(!s1.n.urls.some(function (u) { return /sort=21/.test(u); }), 'old extra sort passes are not needed when the walk works');
  chk(ps.every(function (p, i) { return p >= 0 && p <= 1 && (i === 0 || p >= ps[i - 1] - 1e-9); }), 'progress in 0..1 and forward');
  var rev = r1.items.filter(function (x) { return x.id === 5555; })[0];
  var pv = rev && C.parseTitle(rev.t);
  chk(pv && pv.ml === 50 && pv.gn === 'w' && pv.key.join(' ') === 'اوند رولون چارلی' && rev.b.length === 0, 'the real title «آوند مدل رولون چارلی» is kept (۱.۵۲ آن را با افزودنِ «رولون» به فرهنگِ برندها تقلیدی حساب می‌کرد) and «متفرقه» is not a brand hint: ' + JSON.stringify([pv, rev && rev.b]));
  // سایت فیلترِ قیمت را نادیده می‌گیرد ← سنجش رد می‌کند و روشِ قبلی (ترتیب‌های دیگر) اجرا می‌شود
  var s2 = server({ ignore: true }), r2 = await C.digikalaSource(s2, function () {}, 'full');
  chk(/ترتیب‌های دیگر/.test(r2.note) && s2.n.urls.some(function (u) { return /sort=21/.test(u); }) && s2.n.urls.filter(function (u) { return /price%5Bmin/.test(u); }).length === 1, 'ignored filter: one probe, then fallback to sort passes: ' + r2.note);
  var s3 = server({ reject: true }), r3 = await C.digikalaSource(s3, function () {}, 'full');
  chk(/ترتیب‌های دیگر/.test(r3.note) && r3.items.length >= 2000, 'rejected filter (HTTP 400): fallback: ' + r3.items.length);
  // قطعیِ وسطِ پیمایش: آنچه خوانده شد می‌ماند و یادداشت می‌گوید تا آخر نرسید
  var s4 = server({}), g4 = s4.get, k4 = 0; s4.get = async function (u) { if (/price%5Bmin/.test(u) && ++k4 > 60) return { status: 503, body: '' }; return g4(u); };
  var r4 = await C.digikalaSource(s4, function () {}, 'full');
  chk(r4.items.length > 2500 && /نرسید/.test(r4.note), 'outage mid-walk keeps what was read and says so: ' + r4.items.length + ' ' + r4.note);
  // ادامه از نیمه‌راه (۱.۵۵): دورِ اول وسطِ کار قطع می‌شود؛ هر ۱۰۰ صفحه ثبت شده و دورِ دوم از همان قیمت ادامه می‌دهد
  var got = {}, cur1 = 0, rounds1 = 0, s5 = server({}), g5 = s5.get, k5 = 0; s5.get = async function (u) { if (/price%5Bmin/.test(u) && ++k5 > 230) return { status: 503, body: '' }; return g5(u); };
  var r5 = await C.digikalaSource(s5, function () {}, 'full', { onRound: async function (items, cur) { rounds1++; if (cur) cur1 = cur; items.forEach(function (it) { got[it.id] = 1; }); } });
  r5.items.forEach(function (it) { got[it.id] = 1; });
  var n1 = Object.keys(got).length;
  chk(rounds1 >= 2 && cur1 > 2500000 && n1 >= 4000 && n1 < above.length, 'first run flushed ' + rounds1 + ' rounds (' + n1 + ' products) and remembers price ' + cur1);
  chk(r5.items.length < 2200, 'flushed products are not returned again: ' + r5.items.length);
  var s6 = server({}), cur2 = -1, r6 = await C.digikalaSource(s6, function () {}, 'full', { from: cur1, conc: 8, onRound: async function (items, cur) { cur2 = cur; items.forEach(function (it) { got[it.id] = 1; }); } });
  r6.items.forEach(function (it) { got[it.id] = 1; });
  var miss6 = above.filter(function (x) { return !got[x.id]; }).length;
  chk(miss6 === 0 && r6.walkEnd === true && cur2 === 0, 'second run continues from there, wraps to the start and finishes: missing ' + miss6 + ', end cursor ' + cur2);
  var firstQ = s6.n.urls.filter(function (u) { return /price%5Bmin/.test(u); })[0];
  chk(new RegExp('price%5Bmin%5D=' + cur1 + '$').test(firstQ), 'second run starts at the remembered price: ' + firstQ);
  console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
})();
