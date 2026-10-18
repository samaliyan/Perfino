// دیجی‌کالا: هر ترتیب فقط ۱۰۰ صفحه؛ با ترتیب‌های دیگر (ارزان‌ترین، گران‌ترین) کالاهای بیشتری خوانده می‌شود. اجرا: node tests/t79_dk_sorts.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
var N = 3000, order, ALL = []; for (var i = 1; i <= N; i++) ALL.push({ id: i, title_fa: 'ادو پرفیوم مردانه برند' + i + ' مدل تست' + i + ' حجم 100 میلی لیتر', status: 'marketable', default_variant: { price: { selling_price: 1e7 + i } } });
order = function (q) { var a = ALL.slice(); if (/sort=20/.test(q)) a.reverse(); else if (/sort=21/.test(q)) a = a.filter(function (x, k) { return k % 2; }).concat(a.filter(function (x, k) { return !(k % 2); })); return a; };
function server(o) {
  var n = { req: 0, urls: [] };
  return { n: n, get: async function (u) {
    n.req++; n.urls.push(u);
    if (o.noStock && /has_selling_stock/.test(u)) return { status: 400, body: '' };
    if (o.noSort && /sort=/.test(u)) return { status: 400, body: '' };
    var p = +/page=(\d+)/.exec(u)[1], a = order(u), tp = Math.ceil(a.length / 20);
    return { status: 200, body: JSON.stringify({ data: { products: a.slice((p - 1) * 20, p * 20), pager: { total_pages: Math.min(100, tp) } } }) };
  } };
}
(async function () {
  var s1 = server({}), r1 = await C.digikalaSource(s1, function () {}, 'full');
  var ids = {}, dup = 0; r1.items.forEach(function (x) { if (ids[x.id]) dup++; ids[x.id] = 1; });
  chk(r1.items.length === N, 'all 3000 products seen through other sort orders: ' + r1.items.length);
  chk(dup === 0, 'no duplicate products across passes: ' + dup);
  chk(r1.complete === false, 'still not "complete" (cannot prove every product was seen)');
  chk(/ترتیب‌های دیگر/.test(r1.note), 'note says extra products came from other orders: ' + r1.note);
  chk(!s1.n.urls.some(function (u) { return /has_selling_stock/.test(u); }), 'no stock filter (sold-out items must come back as sold out)');
  var s1b = server({}), o1 = order; order = function (q) { return /sort=21/.test(q) ? ALL.slice() : o1(q); };
  await C.digikalaSource(s1b, function () {}, 'full'); order = o1;
  chk(s1b.n.urls.filter(function (u) { return /sort=21/.test(u); }).length <= 15, 'an order that brings nothing new is dropped quickly: ' + s1b.n.urls.filter(function (u) { return /sort=21/.test(u); }).length);
  // یک صفحه‌ی خراب ترتیب‌های دیگر را لغو نمی‌کند
  var tries = {}, s6 = server({}), g6 = s6.get; s6.get = async function (u) { if (/page=37(&|$)/.test(u) && !/sort=/.test(u)) return { status: 503, body: '' }; return g6(u); };
  var r6 = await C.digikalaSource(s6, function () {}, 'full');
  chk(r6.items.length >= 2900 && r6.complete === false, 'one bad page still lets the other orders run: ' + r6.items.length);
  // نوارِ پیشرفت بین ۰ و ۱ و رو به جلو
  var ps = [], s7 = server({}); await C.digikalaSource(s7, function (n, p) { if (p != null) ps.push(p); }, 'full');
  chk(ps.every(function (p, i) { return p >= 0 && p <= 1 && (i === 0 || p >= ps[i - 1]); }), 'progress stays in 0..1 and moves forward');
  var s2 = server({ noSort: true }), r2 = await C.digikalaSource(s2, function () {}, 'full');
  chk(r2.items.length === 2000, 'site rejects the sort param: the plain list (2000) is kept: ' + r2.items.length);
  chk(s2.n.urls.filter(function (u) { return /sort=/.test(u); }).length <= DK_SORTS_LEN() * 5, 'rejected sort param is not hammered: ' + s2.n.urls.filter(function (u) { return /sort=/.test(u); }).length);
  var s3 = server({}), r3 = await C.digikalaSource(s3, function () {}, 'price');
  chk(r3.items.length === N, 'price-only refresh also reads the other orders (else those items go stale in 4 hours): ' + r3.items.length);
  // فهرستِ زیرِ ۱۰۰ صفحه: کامل و بدونِ ترتیب‌های اضافه
  var small = ALL.slice(0, 900), s4 = { get: async function (u) { var p = +/page=(\d+)/.exec(u)[1]; return { status: 200, body: JSON.stringify({ data: { products: small.slice((p - 1) * 20, p * 20), pager: { total_pages: 45 } } }) }; } };
  var r4 = await C.digikalaSource(s4, function () {}, 'full');
  chk(r4.complete === true && r4.items.length === 900, 'a list under 100 pages is complete and needs no extra orders: ' + r4.complete + ' ' + r4.items.length);
  // محصولِ بی‌شناسه
  var s5 = { get: async function () { return { status: 200, body: JSON.stringify({ data: { products: [{ title_fa: 'الف' }, { title_fa: 'ب' }, ALL[0]], pager: { total_pages: 1 } } }) }; } };
  var r5 = await C.digikalaSource(s5, function () {}, 'full');
  chk(r5.items.length === 1, 'products without id are skipped: ' + r5.items.length);
  console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
})();
function DK_SORTS_LEN() { return 2; }
