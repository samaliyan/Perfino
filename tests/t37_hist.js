global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
var D = 86400000, T0 = 1.8e12;
function mk(id, name, ml, prices) {   // prices: {src: price}
  var srcs = Object.keys(prices).map(function (s) { return { s: s, price: prices[s], pid: 1, used: true }; });
  var vals = srcs.map(function (x) { return x.price; });
  return { id: id, name: name, sizes: [{ ml: ml, price: Math.max.apply(null, vals), n: srcs.length, srcs: srcs }] };
}
function base() { var l = []; for (var i = 0; i < 30; i++) l.push(mk('g' + i, 'عطر ' + i, 100, { a: 1000000 + i * 1000, b: 1010000 + i * 1000 })); return l; }
var h = C.histNew(), t = T0, L = base();
C.histSnap(h, L, 'a,b', t);
chk(Object.keys(h.d).length === 30 && h.t0 === t, 'first snapshot records all');
var R0 = C.histReport(h, L, t); chk(R0.up.length + R0.down.length + R0.gone.length + R0.fresh.length === 0, 'day one: no changes, no "fresh" flood');
// قیمت بالا / پایین
t += 2 * D; L = base(); L[0].sizes[0].price = 1300000; L[0].sizes[0].srcs.forEach(function (x) { x.price = 1300000; }); L[1].sizes[0].price = 800000; L[1].sizes[0].srcs.forEach(function (x) { x.price = 800000; }); L[2].sizes[0].price = 1030000; L[2].sizes[0].srcs.forEach(function (x) { x.price = 1030000; });
C.histSnap(h, L, 'a,b', t);
var R = C.histReport(h, L, t);
chk(R.up.length === 1 && R.up[0].gid === 'g0' && Math.abs(R.up[0].pct - 0.3) < 0.02, 'big rise found: ' + JSON.stringify(R.up.map(function (x) { return x.gid; })));
chk(R.down.length === 1 && R.down[0].gid === 'g1', 'big drop found');
chk(R.up.concat(R.down).every(function (x) { return x.gid !== 'g2'; }), '3% move is ignored');
// یک‌بار ندیدن = ناموجود نیست؛ دوبار با فاصله = ناموجود
t += 3600000; var L2 = base().slice(0, 29); L2[0].sizes[0].price = 1300000; C.histSnap(h, L2, 'a,b', t);
chk(C.histReport(h, L2, t).gone.length === 0, 'one miss is not gone yet');
t += 3600000; C.histSnap(h, L2, 'a,b', t);
var Rg = C.histReport(h, L2, t); chk(Rg.gone.length === 1 && Rg.gone[0].gid === 'g29', 'two misses = gone');
chk(Rg.gone[0].price > 0, 'gone row keeps last price');
// دوباره موجود: کمتر از ۶ ساعت ساکت، بیشتر گزارش
t += 3600000; C.histSnap(h, L, 'a,b', t);
chk(C.histReport(h, L, t).back.length === 0, 'short gap does not count as back');
var L3 = base().slice(0, 29);
t += D; C.histSnap(h, L3, 'a,b', t); t += 3600000; C.histSnap(h, L3, 'a,b', t);   // دوباره ناموجود
t += 8 * 3600000; C.histSnap(h, L3, 'a,b', t);
t += D; C.histSnap(h, base(), 'a,b', t);
chk(C.histReport(h, base(), t).back.length === 1, 'long gap then return = back');
// خطای دریافت: بیش از ۴۰٪ نیامده → ناموجود ثبت نشود
var h2 = C.histNew(), tt = T0; C.histSnap(h2, base(), 'a,b', tt);
var half = base().slice(0, 10);
tt += 3600000; C.histSnap(h2, half, 'a,b', tt); tt += 3600000; var s2 = C.histSnap(h2, half, 'a,b', tt);
chk(s2.skipped === 'mass' && C.histReport(h2, half, tt).gone.length === 0, 'mass disappearance treated as glitch');
// عوض شدن سایت‌های روشن: نه تغییر قیمت، نه ناموجود
var h3 = C.histNew(); tt = T0; C.histSnap(h3, base(), 'a,b', tt);
var one = base(); one.forEach(function (g) { g.sizes[0].price = 2000000; g.sizes[0].srcs = [{ s: 'a', price: 2000000, pid: 1, used: true }]; });
tt += D; C.histSnap(h3, one.slice(0, 5), 'a', tt); tt += 3600000; C.histSnap(h3, one.slice(0, 5), 'a', tt);
var R3 = C.histReport(h3, one.slice(0, 5), tt); chk(R3.up.length === 0 && R3.gone.length === 0, 'source switch does not fake changes');
// موجودی کم (تعداد فروشگاه‌ها)
var h4 = C.histNew(), t4 = T0; C.histSnap(h4, base(), 'a,b', t4);
var lo = base(); lo[5].sizes[0].srcs = [lo[5].sizes[0].srcs[0]]; t4 += D;
C.histSnap(h4, lo, 'a,b', t4);
var R4 = C.histReport(h4, lo, t4); chk(R4.low.length === 1 && R4.low[0].was === 2 && R4.low[0].now === 1, 'fewer shops = low');
// اختلاف قیمت فروشگاه‌ها (روز اول هم کار می‌کند)
var gp = base(); gp[3].sizes[0].srcs = [{ s: 'a', price: 1000000, pid: 1, used: true }, { s: 'b', price: 1600000, pid: 2, used: true }];
var Rgp = C.histReport(C.histNew(), gp, T0); chk(Rgp.gap.length === 1 && Rgp.gap[0].loS === 'a' && Rgp.gap[0].hiS === 'b' && Rgp.gap[0].d === 600000, 'gap found without any history');
// تازه‌ها: فقط وقتی تاریخچه چند روزه است
var h5 = C.histNew(), t5 = T0; C.histSnap(h5, base(), 'a,b', t5); t5 += 4 * D;
var nw = base(); nw.push(mk('gNew', 'جدید', 50, { a: 900000 })); C.histSnap(h5, nw, 'a,b', t5);
chk(C.histReport(h5, nw, t5).fresh.length === 1, 'new item after history is fresh');
// ساعت عقب، ورودی خراب، سقف نقطه‌ها، پاک‌سازی قدیمی‌ها
chk(C.histSnap(h5, nw, 'a,b', t5 - D).skipped === 'clock', 'clock going back is skipped');
chk(C.histSnap(C.histFix(null), base(), 'a', T0) && Object.keys(C.histFix('x').d).length === 0 && C.histFix({ d: [] }).t0 === 0, 'bad stored data is replaced');
var h6 = C.histNew(), t6 = T0, one6 = [mk('x', 'x', 100, { a: 1000000 })];
for (var i = 0; i < 60; i++) { one6[0].sizes[0].price = 1000000 * (i % 2 ? 1.5 : 1); one6[0].sizes[0].srcs[0].price = one6[0].sizes[0].price; t6 += 3600000; C.histSnap(h6, one6, 'a', t6); }
chk(h6.d['x|100'].p.length <= 24, 'price points are capped: ' + h6.d['x|100'].p.length);
t6 += 70 * D; C.histSnap(h6, [mk('y', 'y', 100, { a: 1000000 })], 'a', t6);
chk(!h6.d['x|100'] && h6.d['y|100'], 'items unseen for 60 days are dropped');
chk(C.histSnap(C.histNew(), [], 'a', T0).skipped === 'empty', 'empty list is not recorded');
console.log(ok + ' ok ' + bad + ' bad'); process.exit(bad ? 1 : 0);
