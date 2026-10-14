global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, failed = 0;
function chk(c, m) { if (c) ok++; else { failed++; console.log('FAIL', m); } }
function P(t) { return C.parseTitle(t); }
function br(t) { var p = P(t); return p ? C.brandOf(p.key, []).name : null; }
// ۱) «فقط/قیمت» کنار اندازه قیمت نیست
chk(P('عطر دیور ساواج فقط 100 میل') && P('عطر دیور ساواج فقط 100 میل').ml === 100, 'size after فقط kept');
chk(P('قیمت 100 میل دیور ساواج') !== null, 'قیمت + size kept');
chk(P('عطر دیور ساواج 100 میل قیمت 5000000') === null, 'real price phrase still rejected');
chk(P('عطر ساواج 1.5 میلیون تومان 100 میل') === null, '1.5 million toman rejected');
chk(P('پاکو رابان وان میلیون 100 میل') !== null && P('Paco Rabanne 1 Million EDT 100ml') !== null, '1 Million kept');
chk((P('عطر دیور ساواج فقط 100 میل').key || []).indexOf('فقط') < 0, 'فقط is not part of the name');
// ۲) بسته‌ها و دوتایی‌ها
['Dior Sauvage 2×100ml', 'Dior Sauvage 100 ml x2', 'عطر ساواج دو عددی 100 میل', 'عطر ساواج 2 x 100 میل'].forEach(function (t) { chk(P(t) === null, 'pack rejected: ' + t); });
chk(P('Dior Sauvage 100ml') !== null && P('Hugo Boss Bottled 100 ml') !== null, 'normal single bottle kept');
// ۳) اندازه
chk(P('Le Male 4.2 oz').ml === 125 && P('Le Male 125 ml').ml === 125, '4.2 oz = 125');
chk(P('Dior Sauvage 3.4 oz').ml === 100, '3.4 oz = 100');
// ۴) برندِ لاتین + نامِ فارسی
chk(br('Lattafa خمره 100 ml') === 'لطافه' && br('Tom Ford توسکان لدر 50ml') === 'تام فورد', 'latin brand + persian name keeps brand');
var L = C.aggregate([{ src: 'liliome', t: 'Lattafa خمره 100 ml', price: 2000000 }, { src: 'safir', t: 'عطر لطافه خمره 100 میل', price: 2100000 }], ['liliome', 'safir'], { liliome: true });
chk(L.length === 1 && L[0].sizes[0].srcs.length === 2, 'Lattafa خمره merges with لطافه خمره: ' + L.length);
// ۵) «pour homme» عمومی
chk(br('Dumont Nitro Pour Homme 100ml') !== 'ورساچه', 'generic pour homme with unknown brand is not Versace');
chk(P('Mikyajy Model Pour Homme 100ml') !== null, 'Model Pour Homme not a clone');
chk(br('Pour Un Homme 100ml') === 'کارون' && br('Sauvage Elixir 100ml') === 'دیور', 'famous lines still resolve');
// ۶) دو سایتِ ریالی در کنار یک سایتِ تومانی
var rec = []; for (var i = 0; i < 6; i++) { var nm = ['ساواج', 'اروس', 'بلو دو شنل', 'گود گرل', 'لا ویی است بل', 'اونتوس'][i], p = 2000000 + i * 300000; rec.push({ src: 'liliome', t: 'عطر ' + nm + ' 100 میل', price: p }); rec.push({ src: 'safir', t: 'عطر ' + nm + ' 100 میل', price: p * 10 }); rec.push({ src: 'hiland', t: 'عطر ' + nm + ' 100 میل', price: p * 10 }); }
var L2 = C.aggregate(rec, ['liliome', 'safir', 'hiland'], { liliome: true });
chk(L2.length >= 5 && L2.every(function (g) { return g.sizes[0].price < 6000000; }), 'two rial shops + one toman shop: prices not x10: ' + L2.map(function (g) { return g.sizes[0].price; }).join(','));
// ۷) پنهان‌کردنِ مبهم فقط وقتی قیمت‌ها هم‌خوان باشند
var L3 = C.aggregate([{ src: 'liliome', t: 'عطر دیور ساواج 100 میل', price: 3000000 }, { src: 'digikala', t: 'Dior Sauvage EDP 100ml', price: 4550000 }, { src: 'hiland', t: 'Dior Sauvage EDP 100ml', price: 4600000 }], ['liliome', 'digikala', 'hiland'], { liliome: true, digikala: true });
chk(L3.length === 2, 'unlabeled cheaper item (probably EDT) is not hidden: ' + L3.length);
var L4 = C.aggregate([{ src: 'liliome', t: 'عطر دیور ساواج 100 میل', price: 4500000 }, { src: 'digikala', t: 'Dior Sauvage EDP 100ml', price: 4550000 }], ['liliome', 'digikala'], { liliome: true, digikala: true });
chk(L4.length === 1, 'unlabeled item at the same price still merges/hides: ' + L4.length);
// ۸) پاک‌سازی حافظه شمارنده‌ها را باد نکند
var db = C.newDb(), ix = C.dbIndex(db); C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن ورساچه اروس ادو پرفیوم 100 میل', price: 5e6, st: 0 }], true);
var r0 = C.REJ.n; C.purgeStored(db); chk(C.REJ.n === r0, 'purge does not inflate rejection counter');
// ۹) تاریخچه
function mk(id, name, ml, prices) { var srcs = Object.keys(prices).map(function (s) { return { s: s, price: prices[s], pid: 1, used: true }; }); return { id: id, name: name, sizes: [{ ml: ml, price: Math.max.apply(null, srcs.map(function (x) { return x.price; })), n: srcs.length, srcs: srcs }] }; }
function base() { var l = []; for (var i = 0; i < 30; i++) l.push(mk('g' + i, 'عطر ' + i, 100, { a: 1000000 + i * 1000, b: 1010000 + i * 1000 })); return l; }
var D = 864e5, T0 = 1.8e12, h = C.histNew(); C.histSnap(h, base(), 'a,b', T0);
var one = base().map(function (g) { g.sizes[0].srcs = [g.sizes[0].srcs[0]]; return g; }), t = T0 + D;
C.histSnap(h, one, 'a', t); var R = C.histReport(h, one, t);
chk(R.low.length === 0, 'turning a source off does not create "getting scarce"');
var two = one.concat([mk('gx', 'عطر تازه', 100, { a: 900000 })]); t += D; C.histSnap(h, two, 'a', t);
chk(C.histReport(h, two, t).fresh.length === 0, 'after source change new rows are not "new" ');
var h2 = C.histNew(); C.histSnap(h2, base(), 'a,b', T0);
var L5 = base(); L5[7].id = 'renamed'; var t2 = T0 + 3600000; C.histSnap(h2, L5, 'a,b', t2); t2 += 3600000; C.histSnap(h2, L5, 'a,b', t2);
var R5 = C.histReport(h2, L5, t2); chk(R5.gone.length === 0 && R5.fresh.length === 0, 'group id change is the same perfume: gone=' + R5.gone.length + ' fresh=' + R5.fresh.length);
var h3 = C.histNew(); C.histSnap(h3, base(), 'a,b', T0); C.histSnap(h3, base(), 'a,b', T0 + 10 * 365 * D);
chk(C.histSnap(h3, base(), 'a,b', T0 + 3600000).skipped !== 'clock' && h3.t === T0 + 3600000, 'clock jump forward then correct does not lock history');
var h4 = C.histNew(); C.histSnap(h4, base(), 'a,b', T0); var m5 = base().slice(0, 18); C.histSnap(h4, m5, 'a,b', T0 + 3600000); var s5 = C.histSnap(h4, m5, 'a,b', T0 + 7200000);
chk(s5.skipped === 'mass', 'a third of the catalogue vanishing is a fetch glitch');
var bad = { v: 1, t0: 5, t: 5, as: 3, d: { 'a|100': null, 'b|100': { p: {} , r: 5 }, 'c|100': { n: 'x', p: [[1, 2]] }, 'noml': { p: [[1, 2]] }, 'd|x': { p: [[1, 2]] } } };
var fx = C.histFix(bad); chk(Object.keys(fx.d).join() === 'c|100', 'histFix keeps only well-formed entries: ' + Object.keys(fx.d).join());
var thrown = false; try { C.histReport(fx, base(), T0); C.histSnap(fx, base(), 'a', T0 + D); } catch (e) { thrown = true; } chk(!thrown, 'corrupt history never throws');
// ۱۰) تقلیدی‌های «برند مدل عطرِ دیگر» همچنان رد شوند
['ادکلن رومبا مدل ساواج ادوتویلت حجم ۱۰۰ میلی لیتر', 'بربری مدل اروس 100 میل', 'مایزون مارژیلا مدل اینویکتوس 100ml', 'عطر های نیوویش مدل ورساچه اروس 100 میل', 'Rumba Model Sauvage EDT 100ml'].forEach(function (t) { chk(P(t) === null, 'clone still rejected: ' + t); });
// ۱۱) تاریخچه: تغییرِ واژه‌ی ممنوع، هم‌نام‌های چندتایی، ساعتِ آینده
var hb = C.histNew(); C.histSnap(hb, base(), 'a,b', T0, null, ''); var nb = base().slice(0, 20), tb = T0 + 3600000;
C.histSnap(hb, nb, 'a,b', tb, null, 'xx'); tb += 3600000; C.histSnap(hb, nb, 'a,b', tb, null, 'xx');
chk(C.histReport(hb, nb, tb).gone.length === 0 && Object.keys(hb.d).length === 30 && hb.d['g0|100'].p.length === 1, 'blocked-word change: no fake gone, history kept');
var hc = C.histNew(), A1 = [mk('a', 'Same', 100, { x: 1000000 }), mk('b', 'Same', 100, { x: 1100000 })]; A1[0].sizes[0].price = 1000000; for (var q = 0; q < 14; q++) A1.push(mk('f' + q, 'F' + q, 100, { x: 1000000 }));
C.histSnap(hc, A1, 'x', T0); var A2 = A1.slice(); A2[0] = mk('c', 'Same', 100, { x: 1000000 }); A2[1] = mk('d', 'Same', 100, { x: 1100000 }); C.histSnap(hc, A2, 'x', T0 + 3600000);
var Rc = C.histReport(hc, A2, T0 + 3600000); chk(Rc.up.length + Rc.down.length === 0, 'ambiguous same-name groups are not cross-matched');
var hd = C.histNew(); C.histSnap(hd, base(), 'a,b', T0); C.histSnap(hd, base(), 'a,b', T0 + 10 * 365 * D); C.histSnap(hd, base(), 'a,b', T0 + 3600000);
chk(hd.d['g0|100'].s <= T0 + 3600000 && hd.t === T0 + 3600000, 'future timestamps are clamped after a clock jump');
console.log(ok + " ok " + failed + " bad"); process.exit(failed ? 1 : 0);
