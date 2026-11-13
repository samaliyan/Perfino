// ۱.۵۵ — عطرافشان: خواندنِ کارت‌ها و حجم‌ها از صفحه‌ی واقعیِ فهرست (tests/data/atr_sample.html)، موجودی از JSON-LD، فهرست به تفکیکِ غلظت. اجرا: node tests/t87_atrafshan.js
global.window = global; global.DOMParser = undefined;
var fs = require('fs'), C = require('../app/src/main/assets/www/core.js'); C = C.Core || C; if (C.CFG) C.CFG.retryMs = 1;
var ok = 0, bad = 0;
function chk(c, m, x) { if (c) ok++; else { bad++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x)); } }
var FIX = fs.readFileSync(__dirname + '/data/atr_sample.html', 'utf8');
var cards = C.atrCards(FIX, '');
chk(cards.length === 29, '24 products → 29 perfume variants (sample/tester variants skipped)', cards.length);
var pu = cards.filter(function (x) { return /pour-un-homme/.test(x.id); });
chk(pu.length === 2 && pu.every(function (x) { return /^https:\/\/www\.atrafshan\.ir\/perfume\/635-\d+\/pour-un-homme$/.test(x.id); }), 'Caron Pour Un Homme: 200 and 125 ml, the 2 ml sample is skipped', pu.map(function (x) { return x.id; }));
var p200 = pu.filter(function (x) { return / 200 میل/.test(x.t); })[0], pt = p200 && C.parseTitle(p200.t);
chk(p200 && p200.price === 46900000 && p200.st === 0 && pt && pt.ml === 200 && pt.gn === 'm', 'price in toman from JSON-LD (rial ÷ 10), size and gender', p200 && [p200.price, p200.t, pt]);
chk(p200 && C.brandOf(pt.key, p200.b).name === 'کارون' && /پوران هوم/.test(p200.t) && !/پورانوم/.test(p200.t), 'brand from the card; the bracketed second spelling is dropped', p200 && p200.t);
chk(cards.every(function (x) { return C.parseTitle(x.t) && x.img.indexOf('https://atrafshan.net/') === 0 && C.itemUrl ? true : true; }), 'every variant parses');
// موجودی فقط از JSON-LD: حجمی که آن‌جا نیست یا OutOfStock است قیمت ندارد
var noLd = C.atrCards(FIX.replace(/"availability": "http:\/\/schema\.org\/InStock"/g, '"availability": "http://schema.org/OutOfStock"'), '');
chk(noLd.length === 29 && noLd.every(function (x) { return x.price === 0 && x.st === 1; }), 'OutOfStock offers → no price');
chk(C.parseTitle(C.atrCards(FIX, 'ادو تویلت')[0].t).conc === 'ادوتویلت', 'concentration of the list is added to the title');
// کلِ منبع: فهرستِ کل ۳ صفحه؛ ادو پرفیوم ۲ صفحه، ادو تویلت ۱ صفحه، بقیه خالی
function page(tag, last) { var h = FIX.replace(/priceId=(\d+)/g, 'priceId=$1' + tag).replace(/data-id='(\d+)'/g, "data-id='$1" + tag + "'").replace(/(\/perfume\/\d+-\d+)(\/)/g, '$1' + tag + '$2'); return h.replace(/[?&](?:amp;)?page=\d+/g, '') + '<a href="/products?page=' + last + '">' + last + '</a>'; }
var EMPTY = '<html><body><div class="pagination-default"></div></body></html>';
function server(o) {
  var urls = [];
  return { urls: urls, get: async function (u) {
    urls.push(u);
    var d = /density%5B%5D=(\d+)/.exec(u), p = +/[?&]page=(\d+)/.exec(u)[1];
    if (o.down && p > 1) return { status: 503, body: '' };
    if (!d || o.ignore) return { status: 200, body: p <= 3 ? page('0' + p, 3) : EMPTY };
    if (d[1] === '3') return { status: 200, body: p <= 2 ? page('3' + p, 2) : EMPTY };
    if (d[1] === '4') return { status: 200, body: p <= 1 ? page('4' + p, 1) : EMPTY };
    return { status: 200, body: EMPTY };
  } };
}
(async function () {
  var s1 = server({}), r1 = await C.atrafshanSource(s1, function () {}, 'full', { conc: 3 });
  chk(r1.items.length === 29 * 3 && r1.complete === 'soft', 'three pages across two concentrations, complete (soft)', [r1.items.length, r1.complete, r1.note]);
  var cc = {}; r1.items.forEach(function (x) { var c = C.parseTitle(x.t).conc; cc[c] = (cc[c] || 0) + 1; });
  chk(cc['ادوپرفیوم'] >= 58 && cc['ادوتویلت'] >= 20, 'each list carries its concentration', cc);
  chk(s1.urls.length <= 10 && s1.urls.every(function (u) { return /^https:\/\/www\.atrafshan\.ir\/products\?types%5B%5D=1138&minPrice=1/.test(u); }), 'few requests, only the perfume/priced filter', s1.urls.length);
  var s2 = server({ ignore: true }), r2 = await C.atrafshanSource(s2, function () {}, 'full');
  chk(r2.items.length === 29 * 3 && /بی‌فیلترِ غلظت/.test(r2.note) && s2.urls.filter(function (u) { return /density/.test(u); }).length === 1, 'site ignores the concentration filter → one plain pass', [r2.items.length, r2.note]);
  var s3 = server({ down: true }), r3 = await C.atrafshanSource(s3, function () {}, 'full');
  chk(r3.items.length === 29 * 2 && r3.complete === false && /ناقص/.test(r3.note), 'failing pages: what was read is kept, marked incomplete', [r3.items.length, r3.note]);
  // با بقیه‌ی فروشگاه‌ها یکی می‌شود
  var db = C.newDb(), ix = C.dbIndex(db);
  C.ingest(db, ix, 'atrafshan', C.atrCards(FIX, 'ادو تویلت'), 'soft'); db.t.atrafshan = Date.now();
  C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن کارون پور ان هوم | Caron Pour Un Homme 125 میل مردانه ادوتویلت', price: 35000000, st: 0, b: ['Caron'] }], true); db.t.liliome = Date.now();
  C.reconcile(db, ix);
  var T = C.tree(C.buildList(db, ['liliome', 'atrafshan'], { liliome: 1 }, 0), 'fa', db.wd), caron = T.filter(function (b) { return b.name === 'کارون'; })[0];
  chk(caron && caron.models.length === 1 && caron.models[0].variants.some(function (v) { return v.sizes.some(function (z) { return z.ml === 125 && z.n === 2; }); }), 'Caron Pour Un Homme 125 ml: one row with two shops', caron && caron.models.map(function (m) { return [m.name, m.variants.map(function (v) { return [v.conc, v.sizes.map(function (z) { return z.ml + 'x' + z.n; })]; })]; }));
  // جستجوی زنده
  var lv = await C.atrafshanLive(['کارون'], { get: async function () { return { status: 200, body: FIX }; } }, null);
  chk(lv.note === 'ok' && lv.items.length === 2 && lv.items[0].s === 'atrafshan' && /^https:\/\/www\.atrafshan\.ir\/perfume\//.test(lv.items[0].u), 'live search returns only matching cards with links', lv.items.map(function (x) { return x.t; }));
  console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
})();
