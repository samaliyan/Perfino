// ۱.۵۴ — جستجوی سایت‌ها: خلاصه‌کردنِ جمله‌ی گفتاری، ربطِ نتیجه‌ی دیجی‌کالا، تکه‌تکه رسیدنِ جواب‌ها. اجرا: node tests/t85_live_search.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C; if (C.CFG) C.CFG.retryMs = 1;
var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
function eq(a, b, m) { chk(JSON.stringify(a) === JSON.stringify(b), m + ' got ' + JSON.stringify(a)); }
eq(C.liveTerms('من دنبال عطری هستم که اسمش چارلی هستش'), ['چارلی'], 'spoken sentence → the name');
eq(C.liveTerms('قیمت ساواج دیور چنده'), ['ساواج', 'دیور'], 'price question');
eq(C.liveTerms('یه ادکلن بلو شنل ۱۰۰ میل بده'), ['بلو', 'شنل'], 'size and filler dropped');
eq(C.liveTerms('شنل 5'), ['شنل', '5'], 'name number stays');
chk(C.liveHit('عطر ساواژ دیور', ['ساواج']) && C.liveHit('اکوا دی جیو', ['آکوا']), 'near spellings still match');
chk(!C.liveHit('ادو پرفیوم مردانه پرفیوم دو مارلی مدل Pegasus', ['چارلی']), '«مارلی» is not «چارلی»');
function prod(id, t, rial) { return { id: id, title_fa: t, status: 'marketable', default_variant: { status: 'marketable', price: { selling_price: rial } }, images: {} }; }
var FUZZY = [prod(1, 'ادو پرفیوم مردانه پرفیوم دو مارلی مدل Percival حجم 125 میلی لیتر', 664169600), prod(2, 'ادو پرفیوم مردانه چارلی مدل One حجم 100 میلی لیتر', 3160000), prod(3, 'ادو پرفیوم مردانه مارلی مدل Pegasus حجم 125 میلی لیتر', 400170700)];
var ONE = [prod(2, 'ادو پرفیوم مردانه چارلی مدل One حجم 100 میلی لیتر', 3160000), prod(4, 'ادو پرفیوم زنانه آوند مدل رولون چارلی با رایحه معتدل حجم 50 میلی لیتر', 49332900)];
(async function () {
  var urls = [], net = { get: async function (u) { var q = decodeURIComponent(u.split('q=')[1] || ''); urls.push(q); return { status: 200, body: JSON.stringify({ data: { products: q === 'چارلی رولون' ? FUZZY : q === 'چارلی' ? ONE : [] } }) }; } };
  var r = await C.digikalaLive(['چارلی', 'رولون'], net, null);
  eq(urls.slice().sort(), ['رولون', 'چارلی', 'چارلی رولون'].sort(), 'asks all words and each main word');
  eq(r.items.map(function (x) { return x.pid; }), ['4', '2'], 'only titles with a query word; more words first; no Marly');
  chk(r.items[0].k === 2 && r.items[0].price === 4933290 && /dkp-4\//.test(r.items[0].u), 'score, toman price and link');
  // هر سایت که جواب داد همان لحظه
  var parts = [], net2 = { get: async function (u) { if (/digikala/.test(u)) return net.get(u); return { status: 0, body: '' }; } };
  var all = await C.liveSearch('عطر چارلی رولون', net2, ['digikala', 'liliome'], null, function (id, items, note) { parts.push(id + ':' + items.length + ':' + note); });
  chk(parts.length === 2 && parts.indexOf('digikala:2:ok') >= 0 && parts.some(function (p) { return /^liliome:0:/.test(p); }), 'progress callback per shop: ' + parts.join(' '));
  chk(all.items.length === 2 && all.items[0].k >= all.items[1].k, 'merged and ordered by relevance');
  console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
})();
