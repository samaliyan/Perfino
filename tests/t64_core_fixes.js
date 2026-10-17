/* اصلاح‌های بازبینی: تاریخچه (برند/مدل برای ناموجودها، قیمتِ همین حالا)، قاعده‌ی قیمتِ جستجوی زنده، دیجی‌کالا، آدرسِ جستجوی هر سایت */
global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
var D = 86400000, T0 = 1.8e12;
function mk(id, name, ml, price) { return { id: id, name: name, sizes: [{ ml: ml, price: price, n: 1, srcs: [{ s: 'a', price: price, pid: 1, used: true }] }] }; }
function base() { var l = []; for (var i = 0; i < 30; i++) l.push(mk('g' + i, 'عطر ' + i, 100, 1000000 + i * 1000)); return l; }
var meta = function (g) { return { b: 'brand-' + g.id, m: 'model-' + g.id }; };

(async function () {
  // ---- تاریخچه: برند و مدل ذخیره می‌شود و در ردیفِ «ناموجود» هم هست (تا برندِ خاموش و عطرِ پنهان در گزارش نیایند)
  var h = C.histNew(), t = T0, L = base();
  C.histSnap(h, L, 'a', t, null, undefined, meta);
  chk(h.d['g3|100'].b === 'brand-g3' && h.d['g3|100'].hm === 'model-g3', 'snapshot stores brand and model ids');
  var L2 = base().slice(0, 29);
  t += 3600000; C.histSnap(h, L2, 'a', t, null, undefined, meta);
  t += 3600000; C.histSnap(h, L2, 'a', t, null, undefined, meta);
  var Rg = C.histReport(h, L2, t);
  chk(Rg.gone.length === 1 && Rg.gone[0].gid === 'g29' && Rg.gone[0].b === 'brand-g29' && Rg.gone[0].hm === 'model-g29', 'gone row carries brand and model: ' + JSON.stringify(Rg.gone[0]));
  var fx = C.histFix(JSON.parse(JSON.stringify(h)));
  chk(fx.d['g29|100'].b === 'brand-g29', 'histFix keeps brand');
  var old = C.histNew(); old.t0 = T0; old.t = T0; old.d['x|100'] = { n: 'قدیمی', l: '', f: T0, s: T0, c: 1, cm: 1, ct: T0, p: [[T0, 1000000]] };
  chk(C.histFix(old).d['x|100'].b === '' && C.histFix(old).d['x|100'].hm === '', 'old history without brand still loads');

  // ---- قیمتِ ردیف = قیمتِ همین حالا (نقطه‌ی تاریخچه فقط با ۲٪ تغییر ثبت می‌شود)
  var h2 = C.histNew(); h2.t0 = T0 - 20 * D; h2.t = T0;
  var cur = mk('p1', 'عطر آزمایشی', 100, 1000000);
  h2.d['p1|100'] = { n: 'عطر آزمایشی', l: '', f: T0 - 20 * D, s: T0, c: 1, cm: 1, ct: T0, p: [[T0 - 10 * D, 1300000], [T0 - 1 * D, 1015000]] };
  var R = C.histReport(h2, [cur], T0);
  chk(R.down.length === 1 && R.down[0].to === 1000000, 'report row shows the price of right now: ' + JSON.stringify(R.down[0] && R.down[0].to));
  chk(Math.abs(R.down[0].pct - (1000000 - 1300000) / 1300000) < 1e-9, 'percent uses the price of right now');
  h2.d['p1|100'].r = T0 - 1 * D; var R2 = C.histReport(h2, [cur], T0);
  chk(R2.back.length === 1 && R2.back[0].price === 1000000, 'back row price is the current one');

  // ---- قیمتِ جستجوی زنده (همان قاعده‌ی دریافتِ کامل)
  function it(o) { return Object.assign({ name: 'x', is_in_stock: true, is_purchasable: true, prices: { price: '4500000', currency_code: 'IRT', currency_minor_unit: 0 } }, o || {}); }
  chk(C.wooLivePrice(it()) === 4500000, 'normal price');
  chk(C.wooLivePrice(it({ is_in_stock: false })) === 0, 'out of stock = 0');
  chk(C.wooLivePrice(it({ is_on_backorder: true })) === 0, 'backorder = 0 (not available)');
  chk(C.wooLivePrice(it({ is_purchasable: false })) === 0, 'not purchasable = 0');
  chk(C.wooLivePrice(it({ prices: { price: '4500000', currency_code: 'IRT', currency_minor_unit: 0, price_range: { min_amount: '4000000', max_amount: '9000000' } } })) === -1, 'price range = unknown (-1)');
  chk(C.wooLivePrice(it({ prices: { price: '4500000', currency_code: 'IRT', currency_minor_unit: 0, price_range: { min_amount: '4500000', max_amount: '4500000' } } })) === 4500000, 'same min and max is a normal price');
  chk(C.wooLivePrice(it({ prices: { price: '99999999999', currency_code: 'IRT', currency_minor_unit: 0 } })) === -1, 'absurd price = unknown');
  chk(C.wooLivePrice(it({ prices: { price: '45000000', currency_code: 'IRR', currency_minor_unit: 0 } })) === 4500000, 'rial converted to toman');
  chk(C.wooLivePrice(it({ prices: { price: '45', currency_code: 'USD', currency_minor_unit: 0 } })) === -1, 'foreign currency = price is on the site (-1), not out of stock');
  chk(C.wooLivePrice(it({ prices: { price: '', currency_code: 'IRT' }, price_html: 'تماس بگیرید' })) === -1, 'call-us text on an in-stock item = -1 (price is on the site)');
  chk(C.wooLivePrice(it({ is_in_stock: false, prices: { price: '', currency_code: 'IRT' }, price_html: 'تماس بگیرید' })) === 0, 'call-us text but out of stock = 0');
  chk(C.wooLivePrice(it({ prices: { price: '0', currency_code: 'IRT' }, price_html: '<span>۴٬۰۰۰٬۰۰۰ تومان</span>' })) === 4000000, 'price only in text');

  // ---- دیجی‌کالا: تنوعِ ناموجود قیمت ندارد
  function dkNet(dv) {
    var body = JSON.stringify({ data: { products: [{ id: 1, title_fa: 'عطر ادکلن شنل بلو', status: 'marketable', default_variant: dv, images: { main: { url: ['https://dkstatics-public.digikala.com/a.jpg'] } } }] } });
    return { calls: [], get: async function (u) { this.calls.push(u); return { status: 200, body: body }; } };
  }
  var r = await C.liveSearch('شنل', dkNet({ status: 'marketable', price: { selling_price: 52000000 } }), ['digikala']);
  chk(r.items.length === 1 && r.items[0].price === 5200000, 'digikala: normal item has its price: ' + JSON.stringify(r.items));
  r = await C.liveSearch('شنل', dkNet({ status: 'out_of_stock', price: { selling_price: 52000000 } }), ['digikala']);
  chk(r.items.length === 1 && r.items[0].price === 0, 'digikala: variant out of stock = 0: ' + JSON.stringify(r.items));
  r = await C.liveSearch('شنل', dkNet({ status: 'marketable', price: { selling_price: 9e13 } }), ['digikala']);
  chk(r.items.length === 1 && r.items[0].price === -1, 'digikala: absurd price is not shown as a price (-1): ' + JSON.stringify(r.items));

  // ---- «شنل ۵» (شماره‌ی نام) و بی‌معنی
  function lt(x) { return C.liveTerms(x).join(' '); }
  chk(lt('عطر چنده شنل ۵ ۱۰۰ میل') === 'شنل 5', 'live terms keep the name number but drop noise and size: ' + lt('عطر چنده شنل ۵ ۱۰۰ میل'));
  chk(lt('عطر ۱۰۰ میل') === '', 'only a size = nothing to search');
  chk(lt('212') === '212' && lt('4711') === '4711', 'a perfume that is only a number is searched: ' + lt('212') + ' / ' + lt('4711'));
  chk(lt('ساواج صد میل') === 'ساواج' && lt('ساواج 100 میل') === 'ساواج', 'size words are dropped');
  chk(lt('250') === '' && lt('100') === '', 'common bottle sizes alone are not a perfume name');
  chk(lt('1881 بدی') === '1881 بدی', 'long name number is kept: ' + lt('1881 بدی'));
  chk(lt('ایو سن لوران لیبره 10 میل') === 'ایو سن لوران لیبره', 'a number followed by a unit is a size: ' + lt('ایو سن لوران لیبره 10 میل'));

  // ---- جستجوی سایت: عنوان با املای نزدیک یا نامِ لاتین هم جور شود
  var tl = { toFa: function (w) { return ({ sauvage: 'ساواج', bleu: 'بلو', chanel: 'شنل' })[w] || w; }, toEn: function (w) { return ({ ساواج: 'sauvage', بلو: 'bleu' })[w] || w; } };
  chk(C.liveHit('ادکلن دیور ساواج الکسیر', ['ساواج']), 'exact word hit');
  chk(C.liveHit('ادکلن دیور ساواژ', ['ساواج'], tl), 'near spelling hit (ساواژ ~ ساواج)');
  chk(C.liveHit('ادکلن دیور ساواج', ['sauvage'], tl), 'Latin query matches a Persian title');
  chk(C.liveHit('Dior Sauvage EDP 100ml', ['ساواج'], tl), 'Persian query matches a Latin title');
  chk(!C.liveHit('ادکلن شنل بلو', ['ساواج'], tl), 'an unrelated title is not a hit');
  chk(!C.liveHit('ادکلن شنل بلو 100 میل', ['5']), 'a number alone is not a hit on 100');
  chk(C.liveHit('ادکلن CH 212 ونوس', ['212']) && !C.liveHit('ادکلن 2120 ونوس', ['212']), 'a number must be a whole word');
  chk(C.liveHit('ادکلن شنل نامبر 5', ['شنل', '5']) && !C.liveHit('ادکلن دیور 5 ساواج', ['شنل', '5']), 'with words present the number is not enough');

  // ---- جستجوی سایتی که رابطِ ووکامرس ندارد: رابط یک بار پرسیده می‌شود، صفحه‌ی جستجو با نسخه‌ی فارسی هم امتحان می‌شود
  var calls = [], net404 = { get: async function (u) { calls.push(u); return { status: 404, body: '' }; } };
  r = await C.liveSearch('sauvage', net404, ['hiland'], tl);
  var api = calls.filter(function (u) { return u.indexOf('wp-json') >= 0; }).length, pages = calls.filter(function (u) { return u.indexOf('wp-json') < 0; });
  chk(api === 1, 'Woo API asked once for a shop without it, not for every query: ' + api + ' ' + JSON.stringify(calls));
  chk(pages.length === 2 && pages[0].indexOf('sauvage') >= 0 && pages[1].indexOf(encodeURIComponent('ساواج')) >= 0, 'search page asked with the Latin and with the Persian spelling: ' + JSON.stringify(pages));
  chk(r.notes.hiland === 'fail', 'nothing reachable = fail');

  // ---- گزارش: بعد از عوض شدنِ سایت‌های روشن، قیمتِ سایتِ دیگر با قیمتِ قبلی سنجیده نشود
  var h3 = C.histNew(); h3.t0 = T0 - 20 * D; h3.t = T0; h3.as = 'a';
  var c3 = mk('q1', 'عطر دوم', 100, 1500000);
  h3.d['q1|100'] = { n: 'عطر دوم', l: '', f: T0 - 20 * D, s: T0, c: 1, cm: 1, ct: T0, p: [[T0 - 10 * D, 1000000], [T0 - 1 * D, 1010000]] };
  var Ra = C.histReport(h3, [c3], T0, { sig: 'a' }), Rb = C.histReport(h3, [c3], T0, { sig: 'b' }), Rn = C.histReport(h3, [c3], T0);
  chk(Ra.up.length === 1 && Ra.up[0].to === 1500000, 'same source set: the current price is used');
  chk(Rb.up.length === 0, 'source set changed: no fake rise from comparing another shop: ' + JSON.stringify(Rb.up));
  chk(Rn.up.length === 1, 'no signature given: behaves as before');

  // ---- جستجو: شماره‌ی نام
  var TR = [{ id: 'chanel', name: 'شنل', models: [
    { name: 'نامبر 5', variants: [{ en: 'chanel no 5', key: [], sizes: [{ n: 3 }] }] },
    { name: 'بلو', variants: [{ en: 'chanel bleu', key: [], sizes: [{ n: 3 }] }] },
    { name: 'شانس', variants: [{ en: 'chanel chance', key: [], sizes: [{ n: 3 }] }] },
    { name: 'کوکو مادمازل', variants: [{ en: 'chanel coco mademoiselle', key: [], sizes: [{ n: 3 }] }] }] },
    { id: 'bond', name: 'باند نامبر 9', models: [
    { name: 'آف برودوی', variants: [{ en: 'bond no 9 off broadway', key: [], sizes: [{ n: 2 }] }] },
    { name: 'مای نیویورک', variants: [{ en: 'bond no 9 my new york', key: [], sizes: [{ n: 2 }] }] }] },
    { id: 'dior', name: 'دیور', models: [
    { name: 'ساواج', variants: [{ en: 'sauvage', key: [], sizes: [{ n: 9 }] }] }] },
    { id: 'ysl', name: 'ایو سن لوران', models: [
    { name: 'لیبره', variants: [{ en: 'libre', key: [], sizes: [{ n: 5 }] }] },
    { name: 'وای', variants: [{ en: 'y', key: [], sizes: [{ n: 5 }] }] },
    { name: 'بلک اپیوم', variants: [{ en: 'black opium', key: [], sizes: [{ n: 5 }] }] }] }];
  var IDX = C.searchIndex(TR, function (w) { return ({ شنل: 'chanel', نامبر: 'no', بلو: 'bleu', لیبره: 'libre' })[w] || w; });
  function rk(q, o) { return C.searchRank(IDX, [q], null, o || { prefixLast: true }); }
  function nm(x) { return IDX[x.i].b.name + '|' + IDX[x.i].m.name; }
  function strongN(r) { return r.filter(function (x) { return !x.sim && !x.miss && x.k >= 1; }).length; }
  var q5 = rk('شنل 5');
  chk(nm(q5[0]) === 'شنل|نامبر 5', 'شنل 5: No.5 first: ' + nm(q5[0]));
  var q5w = rk('شنل پنج');
  chk(q5w.length && nm(q5w[0]) === 'شنل|نامبر 5' && strongN(q5w) === 1, 'شنل پنج: only No.5 is a sure answer: ' + strongN(q5w) + ' ' + q5w.map(nm).join(','));
  var q19 = rk('شنل نوزده', { prefixLast: false });
  chk(strongN(q19) === 0, 'شنل نوزده: no sure answer, so the shops are asked (brand-only rows are not sure): ' + strongN(q19));
  var bn = rk('بوند نامبر 9');
  chk(bn.length && IDX[bn[0].i].b.id === 'bond' && bn[0].s >= 1, 'Bond No. 9 (number in the brand name) is not penalised: ' + bn.slice(0, 2).map(function (x) { return nm(x) + ' ' + x.s.toFixed(2); }).join(','));
  var l10 = rk('لیبره 10'), l10m = rk('لیبره 10 میل');
  chk(l10.length && nm(l10[0]) === 'ایو سن لوران|لیبره' && l10[0].s >= 1, 'a number nobody has is not punished: ' + l10.slice(0, 2).map(function (x) { return nm(x) + ' ' + x.s.toFixed(2); }).join(','));
  chk(l10m.length && nm(l10m[0]) === 'ایو سن لوران|لیبره' && l10m[0].s >= 1, 'size with unit: ' + l10m.slice(0, 2).map(function (x) { return nm(x) + ' ' + x.s.toFixed(2); }).join(','));

  var sv = rk('ساواج هفتاد و پنج میل', { prefixLast: false }), sv2 = rk('ساواج سی و پنج', { prefixLast: false }), sv3 = rk('ساواج پنج میل', { prefixLast: false });
  chk(sv.length && nm(sv[0]) === 'دیور|ساواج' && !sv[0].miss && strongN(sv) >= 1, 'a compound spoken size ("75 ml") does not turn into a hard name number: ' + sv.slice(0, 2).map(function (x) { return nm(x) + ' miss=' + x.miss; }).join(','));
  chk(sv2.length && nm(sv2[0]) === 'دیور|ساواج' && !sv2[0].miss, '"سی و پنج" the same: ' + sv2.slice(0, 1).map(function (x) { return nm(x) + ' miss=' + x.miss; }));
  chk(sv3.length && nm(sv3[0]) === 'دیور|ساواج' && !sv3[0].miss, '"پنج میل" the same: ' + sv3.slice(0, 1).map(function (x) { return nm(x) + ' miss=' + x.miss; }));
  chk(lt('sauvage 3.4 oz') === 'sauvage' && lt('ساواج ۱٫۷ اونس') === 'ساواج', 'decimals are sizes, not name numbers: ' + lt('sauvage 3.4 oz') + ' / ' + lt('ساواج ۱٫۷ اونس'));
  // نمایشِ قیمت در «برگشت/تازه/کم‌شده» همیشه قیمتِ همین حالا است، حتی وقتی سایت‌های روشن عوض شده
  var h4 = C.histNew(); h4.t0 = T0 - 20 * D; h4.t = T0; h4.as = 'a';
  var c4 = mk('r1', 'عطر سوم', 100, 3000000);
  h4.d['r1|100'] = { n: 'عطر سوم', l: '', f: T0 - 2 * D, s: T0, c: 1, cm: 1, ct: T0, r: T0 - 1 * D, p: [[T0 - 1 * D, 2000000]] };
  var Rc = C.histReport(h4, [c4], T0, { sig: 'b' });
  chk(Rc.back.length === 1 && Rc.back[0].price === 3000000, 'back row shows the current price even if the source set changed: ' + JSON.stringify(Rc.back[0] && Rc.back[0].price));
  // دیجی‌کالا: تنوعِ پیش‌فرضِ آرایه‌ی خالی ناموجود است نه «قیمت در سایت»
  r = await C.liveSearch('شنل', dkNet([]), ['digikala']);
  chk(r.items.length === 1 && r.items[0].price === 0, 'digikala: an empty default variant is out of stock: ' + JSON.stringify(r.items));
  // سفیر (Next.js): موجود و بدون قیمت = «قیمت در سایت» (-1)؛ ناموجود = ۰
  var nd = function (pl) { return { getElementById: function () { return { textContent: JSON.stringify({ props: { pageProps: { productList: pl } } }) }; } }; };
  var nc = C.nextDataCards(nd([{ label: 'عطر الف', price: 0, isAvailable: true, canBuy: true, frontEndUrl: '/p/1' }, { label: 'عطر ب', price: 0, isAvailable: false, frontEndUrl: '/p/2' }, { label: 'عطر ج', price: 5000000, isAvailable: true, canBuy: true, frontEndUrl: '/p/3' }]), 'https://www.safirstores.com/');
  chk(nc.length === 3 && nc[0].np === 1 && nc[1].np === 0 && nc[2].np === 0 && nc[0].st === 1 && nc[1].st === 1 && nc[2].st === 0, 'next data cards: np flag only for available-without-price: ' + JSON.stringify(nc.map(function (x) { return [x.np, x.st]; })));

  // ---- محصولِ چنداندازه‌ای (بازه‌ی قیمت): هر اندازه با قیمتِ خودش
  function pr(v, extra) { return Object.assign({ price: String(v), currency_code: 'IRT', currency_minor_unit: 0, price_range: null }, extra || {}); }
  var calls2 = [];
  function wooNet(variants, fail) {
    var simple = { id: 11, name: 'عطر ادکلن ورساچه اروس ادوتویلت 100 میل', type: 'simple', is_in_stock: true, is_purchasable: true, prices: pr(4000000), categories: [{ name: 'عطر' }], images: [], attributes: [] };
    var vp = { id: 900, name: 'عطر ادکلن دیور ساواج ادوتویلت', type: 'variable', is_in_stock: true, is_purchasable: true, prices: pr(3000000, { price_range: { min_amount: '3000000', max_amount: '9000000' } }), categories: [{ name: 'عطر' }], images: [{ thumbnail: 't.jpg', src: 'b.jpg' }], attributes: [] };
    return { get: async function (u) {
      calls2.push(u);
      if (u.indexOf('type=variation') >= 0) { if (fail) return { status: 500, body: '' }; return { status: 200, body: JSON.stringify(u.indexOf('parent=900') >= 0 ? variants : []) }; }
      if (/[?&]page=1(&|$)/.test(u)) return { status: 200, body: JSON.stringify([simple, vp]) };
      return { status: 200, body: '[]' };
    } };
  }
  var VAR = [
    { id: 901, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(3000000), attributes: [{ name: 'حجم', value: '50ML' }] },
    { id: 902, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(9000000), attributes: [{ name: 'حجم', value: '۲۰۰ میل' }] },
    { id: 903, type: 'variation', is_in_stock: false, is_purchasable: true, prices: pr(6000000), attributes: [{ name: 'حجم', value: '100ML' }] },
    { id: 904, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(5000000), attributes: [] }];
  var LIL = C.SOURCES.filter(function (x) { return x.id === 'liliome'; })[0];
  var rr = await LIL.run(wooNet(VAR), function () { }, 'full');
  var byId = {}; rr.items.forEach(function (x) { byId[x.id] = x; });
  var vid = function (n) { return 'https://liliome.com/?p=900#v' + n; };      // شناسه‌ی هر اندازه = نشانیِ محصولِ اصلی + شماره‌ی تنوع
  [901, 902, 903].forEach(function (n) { byId[n] = byId[vid(n)]; }); byId[904] = byId[vid(904)];
  chk(byId[11] && byId[11].price === 4000000, 'a normal product is unchanged');
  chk(!byId[900], 'the range product itself is replaced by its sizes');
  chk(C.itemUrl('liliome', vid(901)) === vid(901) && C.itemUrl('liliome', vid(901)).indexOf('?p=900') > 0, 'the see-on-site link of a size opens the parent product page (variations have no page of their own)');
  chk(byId[901] && byId[901].price === 3000000 && /50 میل/.test(byId[901].t) && /دیور ساواج/.test(byId[901].t), 'variation 50 ml has its own price and size in the title: ' + JSON.stringify(byId[901]));
  chk(byId[902] && byId[902].price === 9000000 && /200 میل/.test(byId[902].t), 'Persian digits in the size are read: ' + JSON.stringify(byId[902] && byId[902].t));
  chk(byId[903] && byId[903].price === 0, 'an out-of-stock size is unavailable (price 0)');
  chk(!byId[904], 'a size that cannot be read is not guessed');
  chk(byId[901].img === 't.jpg', 'the size uses the product photo');
  var ing = C.newDb(), ix = C.dbIndex(ing); rr = await LIL.run(wooNet(VAR), function () { }, 'full');
  C.ingest(ing, ix, 'liliome', rr.items, true);
  var lst = C.buildList(ing, ['liliome'], {}, 0), dsv = lst.filter(function (g) { return /ساواج/.test(g.name); })[0];
  chk(dsv && dsv.sizes.length === 2 && dsv.sizes.map(function (z) { return z.ml + ':' + z.price; }).sort().join() === '200:9000000,50:3000000', 'after ingest the perfume has two sizes with their own prices: ' + JSON.stringify(dsv && dsv.sizes.map(function (z) { return z.ml + ':' + z.price; })));
  rr = await LIL.run(wooNet(VAR, true), function () { }, 'full');
  var ids2 = {}; rr.items.forEach(function (x) { ids2[x.id] = x; });
  chk(ids2[900] && ids2[900].price === 0 && ids2[11], 'variations could not be read: the range product stays "no price", nothing else changes');
  chk(rr.complete === false, 'a server error on the variations makes the list incomplete (so nothing is deleted because of it): complete=' + rr.complete);
  var net404 = wooNet(VAR); var g0 = net404.get; net404.get = async function (u) { if (u.indexOf('type=variation') >= 0) return { status: 404, body: '' }; return g0(u); };
  rr = await LIL.run(net404, function () { }, 'full');
  chk(rr.complete === 'soft', 'a 404 on type=variation (site does not support it) does not make the list incomplete forever');
  calls2.length = 0; rr = await LIL.run(wooNet(VAR), function () { }, 'price');
  var ids3 = {}; rr.items.forEach(function (x) { ids3[x.id] = x; });
  chk(ids3[vid(901)] && ids3[vid(901)].price === 3000000 && ids3[vid(903)] && ids3[vid(903)].price === 0, 'price-only refresh returns the same ids as the full fetch');
  chk(!ids3[vid(904)], 'price-only refresh also skips sizes that cannot be read (otherwise every refresh would ask for a full fetch)');
  chk(calls2.some(function (u) { return u.indexOf('type=variation') >= 0 && u.indexOf('_fields') < 0; }), 'the variation request in price mode keeps the attributes (needs them to read the size)');
  // غلظت در نام، اندازه‌ی ۵ میل، و بیش از ۱۰۰ تنوع (صفحه‌ی دوم)
  var VAR2 = [
    { id: 911, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(5000000), attributes: [{ name: 'حجم', value: '100ML' }, { name: 'غلظت', value: 'ادو پرفیوم' }] },
    { id: 912, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(4000000), attributes: [{ name: 'حجم', value: '100ML' }, { name: 'غلظت', value: 'ادو تویلت' }] },
    { id: 913, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(800000), attributes: [{ name: 'حجم', value: '5ML' }] },
    { id: 914, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(1800000), attributes: [{ name: 'حجم', value: '1.5ml' }] }];
  rr = await LIL.run(wooNet(VAR2), function () { }, 'full');
  var b2 = {}; rr.items.forEach(function (x) { b2[x.id] = x; });
  chk(b2[vid(911)] && b2[vid(912)] && b2[vid(911)].t !== b2[vid(912)].t && /پرفیوم/.test(b2[vid(911)].t) && /تویلت/.test(b2[vid(912)].t), 'two sizes with the same ml but different concentration get different titles: ' + JSON.stringify([b2[vid(911)] && b2[vid(911)].t, b2[vid(912)] && b2[vid(912)].t]));
  chk(b2[vid(913)] && /5 میل/.test(b2[vid(913)].t), 'a 5 ml size is read: ' + JSON.stringify(b2[vid(913)] && b2[vid(913)].t));
  chk(!b2[vid(914)], '1.5 ml is not misread as 5 ml');
  var many = []; for (var q = 0; q < 101; q++) many.push({ id: 2000 + q, type: 'variation', is_in_stock: true, is_purchasable: true, prices: pr(1000000 + q), attributes: [{ name: 'حجم', value: (30 + (q % 60)) + 'ML' }] });
  var netMany = wooNet([]); var g1 = netMany.get;
  netMany.get = async function (u) { if (u.indexOf('type=variation') >= 0 && u.indexOf('parent=900') >= 0) return { status: 200, body: JSON.stringify(u.indexOf('&page=1&') >= 0 ? many.slice(0, 100) : u.indexOf('&page=2&') >= 0 ? many.slice(100) : []) }; return g1(u); };
  rr = await LIL.run(netMany, function () { }, 'full');
  chk(rr.items.filter(function (x) { return /p=900#v/.test(String(x.id)); }).length === 101, 'more than 100 variations are all read (second page): ' + rr.items.filter(function (x) { return /p=900#v/.test(String(x.id)); }).length);

  // ---- نوشته‌ی HTML: «&amp;lt;» دوبار کدشده و نامِ خاصِ «constructor»
  chk(C.normFa('&amp;lt;b&amp;gt; عطر') === C.normFa('<b> عطر') || C.normFa('&amp;lt;b&amp;gt; عطر').indexOf('&') < 0, 'double-encoded entity is decoded: ' + C.normFa('&amp;lt;b&amp;gt; عطر'));
  chk(typeof C.normFa('&constructor; &__proto__; عطر') === 'string' && C.normFa('&constructor; عطر').indexOf('function') < 0, 'entity names like constructor are not looked up on Object');
  console.log(ok, 'pass', bad, 'fail');
  process.exit(bad ? 1 : 0);
})();
