/* منطق داده: خواندن سایت‌ها، یکی‌کردن نام‌ها، محاسبهٔ یک قیمت. بدون وابستگی به رابط. */
(function (root) {
'use strict';

/* ---------- متن ---------- */
function decodeEnt(s) {
  return s.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
    .replace(/&#x([0-9a-f]+);/gi, function (m, n) { return String.fromCharCode(parseInt(n, 16)); })
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/g, ' ');
}
function normFa(s, keepAlef) {
  s = decodeEnt(String(s == null ? '' : s));
  s = s.replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); })
       .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); });
  s = s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ۀ/g, 'ه').replace(/ة/g, 'ه')
       .replace(/[أإ]/g, 'ا');
  if (!keepAlef) s = s.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی');
  s = s.replace(/[ً-ٰٟـ]/g, '');
  s = s.replace(/[‌‍‎‏‪-‮]/g, ' ');
  s = s.toLowerCase().replace(/[\s ]+/g, ' ').trim();
  return s;
}
var EXCL = /تستر|tester|نمونه|سمپل|sample|گیفت|gift ?set|ست هدیه|مینیاتور|miniature|دکانت|decant|اسانس|تکه ای|ریفیل|refill|بادی ?اسپری|body ?(spray|mist|lotion|wash)|لوسیون|شمع|خوشبو ?کننده|اسپری بدن|دئودورانت|دیودورانت|deodorant|ژل دوش|shower|کرم |اسپری مو|هیر ?میست|hair ?mist|شامپو|روغن عطر|عطر روغنی|رول ?ان|roll ?on|ماسک|صابون|(^| )پک |(^| )ست( |$)|\bset\b|\bkit\b|(^| )کیت( |$)|مجموعه|جا ?عطری|\d+ ?تایی|\d+ ?عددی|عمده|بدون ?(جعبه|پلمب)|پلمب شکسته|دست دوم|کارکرده|اکسسوری/;
var STOP = {};
('عطر ادکلن ادکلون مردانه زنانه مردونه زنونه یونیسکس یونی اورجینال اصل اصلی original حجم میل میلی لیتر لیتری برند مدل مناسب خرید قیمت فروش اسپری spray for men women man woman unisex ml oz by ادو cc fl نسخه').split(' ').forEach(function (w) { STOP[w] = 1; });
var RE_SIZE = /(\d+(?:\.\d+)?)\s*(?:میلی ?لیتر|میلی|میل|مل|ml|cc)(?![a-zا-ی])/g;
var RE_OZ = /(\d+(?:\.\d+)?)\s*(?:fl\.? ?)?oz(?![a-z])/g;
var CONC = [
  ['ادوپرفیوم', /ادو ?پرفیوم|ادو ?پارفوم|ادو ?پرفوم|eau de parfum|\bedp\b|e\.d\.p/g],
  ['ادوتویلت', /ادو ?تویلت|ادو ?توالت|ادو ?تواله|eau de toilette|\bedt\b/g],
  ['ادوکلن', /ادو ?کلن|ادوکلن|eau de cologne|\bedc\b/g],
  ['اکستریت', /اکستریت|اکسترایت|extrait( de parfum)?/g],
  ['پرفیوم', /(^| )(پرفیوم|پارفوم|parfum)( |$)/g]
];
function isFa(w) { return /[؀-ۿ]/.test(w); }
function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

function parseTitle(raw) {
  var t = normFa(raw, true);
  if (!t || EXCL.test(t)) return null;
  var m, sizes = [];
  RE_SIZE.lastIndex = 0;
  while ((m = RE_SIZE.exec(t))) sizes.push(+m[1]);
  if (!sizes.length) { RE_OZ.lastIndex = 0; while ((m = RE_OZ.exec(t))) sizes.push(Math.round(+m[1] * 29.5735)); }
  if (!sizes.length && (m = /حجم\s*:?\s*(\d+(?:\.\d+)?)/.exec(t))) sizes.push(+m[1]);
  if (!sizes.length) return null;
  var ml = Math.round(sizes[0]);
  [25, 30, 35, 40, 45, 50, 60, 75, 80, 90, 100, 110, 120, 125, 150, 175, 200, 250, 300].some(function (z) { if (Math.abs(ml - z) / z < 0.035) { ml = z; return true; } });
  for (var i = 1; i < sizes.length; i++) if (Math.abs(Math.round(sizes[i]) - ml) > 1) return null; // احتمالاً ست
  if (ml < 25 || ml > 600) return null;
  var conc = '';
  for (var c = 0; c < CONC.length; c++) { CONC[c][1].lastIndex = 0; if (CONC[c][1].test(t)) { conc = CONC[c][0]; break; } }
  var k = t.replace(RE_SIZE, ' ').replace(RE_OZ, ' ');
  CONC.forEach(function (x) { if (x[0] === 'پرفیوم' && conc !== 'پرفیوم') return; x[1].lastIndex = 0; k = k.replace(x[1], ' '); });
  k = k.replace(/[^؀-ۿa-z0-9\s]/g, ' ');
  var toks = k.split(/\s+/).filter(function (w) { return w && !STOP[w]; });
  var fa = toks.filter(function (w) { return isFa(w) || /^\d+$/.test(w); });
  var hasFa = toks.some(isFa);
  var shown = hasFa ? fa : toks;
  if (!shown.length) return null;
  var key = shown.map(function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); });
  var name = shown.map(function (w) { return hasFa ? w : cap(w); }).join(' ');
  return { key: key, name: name, conc: conc, ml: ml, fa: hasFa };
}

function lev1(a, b) {
  if (a === b) return true;
  var la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  var i = 0, j = 0, d = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++d > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return d + (la - i) + (lb - j) <= 1;
}
function tokEq(a, b) {
  if (a === b) return true;
  if (/\d/.test(a) || /\d/.test(b)) return false;
  return a.length >= 4 && b.length >= 4 && lev1(a, b);
}
function similar(A, B) {
  var used = {}, m = 0;
  for (var i = 0; i < A.length; i++) {
    for (var j = 0; j < B.length; j++) {
      if (!used[j] && tokEq(A[i], B[j])) { used[j] = 1; m++; break; }
    }
  }
  var mx = Math.max(A.length, B.length);
  return mx <= 5 ? m === mx : m >= mx - 1;   // نام‌های کوتاه باید کاملاً یکی باشند؛ مدل‌های «الکسیر/اینتنس» جدا بمانند
}
function median(a) {
  var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

/* ---------- ادغام ---------- */
var MIN_P = 150000, MAX_P = 800000000;   // تومان
var ORD = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
function rank(c) { var i = ORD.indexOf(c); return c === ' ' ? 0 : i >= 0 ? i + 1 : 200 + c.charCodeAt(0); }
function cmpName(a, b) {
  var n = Math.min(a.length, b.length);
  for (var i = 0; i < n; i++) { var d = rank(a[i]) - rank(b[i]); if (d) return d; }
  return a.length - b.length;
}
function letterOf(name) {
  var c = normFa(name, true).charAt(0);
  if (c === 'آ') return 'ا';
  if (ORD.indexOf(c) >= 0) return c;
  return /[a-z]/.test(c) ? 'A' : '#';
}

/* records: [{src,t,price,img}] قیمت‌ها بر حسب تومان */
function aggregate(records, srcOrder, trusted) {
  trusted = trusted || {};
  var items = [];
  records.forEach(function (r) {
    var p = parseTitle(r.t);
    if (!p || !(r.price > 0)) return;
    items.push({ src: r.src, key: p.key, name: p.name, conc: p.conc, ml: p.ml, price: r.price, img: r.img || '' });
  });
  /* گروه‌بندی نام‌ها */
  var groups = [], index = {};
  function findGroup(it, concMode) {
    var best = null, cand = {};
    it.key.forEach(function (w) { (index[w] || []).forEach(function (g) { cand[g] = 1; }); });
    Object.keys(cand).forEach(function (gs) {
      var g = groups[+gs];
      if (g.conc !== it.conc) return;
      if (similar(it.key, g.key)) { if (!best) best = g; }
    });
    return best;
  }
  items.forEach(function (it) {
    var g = findGroup(it);
    if (!g) {
      // املا: توکن تقریباً برابر در فهرست اندیس
      var cands = {};
      it.key.forEach(function (w) {
        if (w.length < 4 || /\d/.test(w)) return;
        Object.keys(index).forEach(function (iw) { if (iw !== w && iw.length >= 4 && lev1(iw, w)) index[iw].forEach(function (x) { cands[x] = 1; }); });
      });
      Object.keys(cands).forEach(function (gs) { var c = groups[+gs]; if (!g && c.conc === it.conc && similar(it.key, c.key)) g = c; });
    }
    if (!g) {
      g = { id: groups.length, key: it.key, conc: it.conc, items: [] };
      groups.push(g);
      it.key.forEach(function (w) { (index[w] = index[w] || []).push(g.id); });
    }
    g.items.push(it);
  });
  /* غلظت نامشخص: ادغام در گروه هم‌نام اگر دقیقاً یک نامزد باشد */
  groups.forEach(function (g) {
    if (g.conc !== '' || g.dead) return;
    var cands = groups.filter(function (o) { return o !== g && !o.dead && o.conc !== '' && similar(g.key, o.key); });
    if (cands.length === 1) { cands[0].items = cands[0].items.concat(g.items); g.dead = true; }
  });
  groups = groups.filter(function (g) { return !g.dead; });

  /* تشخیص خودکار مقیاس (تومان/ریال) هر منبع */
  var ratios = {};
  groups.forEach(function (g) {
    var by = {};
    g.items.forEach(function (it) { var k = it.ml; (by[k] = by[k] || {}); (by[k][it.src] = by[k][it.src] || []).push(it.price); });
    Object.keys(by).forEach(function (ml) {
      var srcs = Object.keys(by[ml]);
      if (srcs.length < 2) return;
      srcs.forEach(function (s) {
        var others = [];
        srcs.forEach(function (o) { if (o !== s) others.push(median(by[ml][o])); });
        (ratios[s] = ratios[s] || []).push(median(by[ml][s]) / median(others));
      });
    });
  });
  var scale = {}, anyTrusted = Object.keys(ratios).some(function (x) { return trusted[x]; });
  Object.keys(ratios).forEach(function (s) {
    var r = ratios[s]; scale[s] = 1;
    if (trusted[s] || r.length < 8) return;
    var md = median(r);
    if (md > 7.5 && md < 13) scale[s] = 0.1;                       // ریال → تومان
    else if (anyTrusted && md > 0.075 && md < 0.133) scale[s] = 10; // فقط وقتی منبع مطمئن هست
  });

  /* قیمت نهایی */
  var out = [];
  groups.forEach(function (g) {
    var bySize = {};
    g.items.forEach(function (it) {
      var p = it.price * (scale[it.src] || 1);
      if (!(p >= MIN_P && p <= MAX_P)) return;
      var o = (bySize[it.ml] = bySize[it.ml] || {});
      (o[it.src] = o[it.src] || []).push(p);
    });
    var sizes = [];
    Object.keys(bySize).forEach(function (ml) {
      var per = bySize[ml], srcs = Object.keys(per);
      var vals = srcs.map(function (s) { return median(per[s]); });
      var price, n = vals.length;
      if (n === 1) price = vals[0];
      else if (n === 2) { var lo = Math.min(vals[0], vals[1]), hi = Math.max(vals[0], vals[1]); price = hi / lo > 1.3 ? hi : (lo + hi) / 2; }
      else {
        var md = median(vals), ok = vals.filter(function (v) { return Math.abs(v - md) / md <= 0.25; });
        price = median(ok.length ? ok : vals); n = ok.length || n;
      }
      sizes.push({ ml: +ml, price: Math.round(price / 1000) * 1000, n: n });
    });
    if (!sizes.length) return;
    sizes.sort(function (a, b) { return b.ml - a.ml; });
    /* نام نمایشی: پرتکرارترین، در تساوی بلندتر */
    var cnt = {}, best = '';
    g.items.forEach(function (it) { cnt[it.name] = (cnt[it.name] || 0) + 1; });
    Object.keys(cnt).forEach(function (n) { if (!best || cnt[n] > cnt[best] || (cnt[n] === cnt[best] && n.length > best.length)) best = n; });
    var img = '';
    (srcOrder || []).some(function (s) { return g.items.some(function (it) { if (it.src === s && it.img) { img = it.img; return true; } }); });
    if (!img) g.items.some(function (it) { if (it.img) { img = it.img; return true; } });
    out.push({ id: hash(g.key.join(' ') + '|' + g.conc), name: best, conc: g.conc, sizes: sizes, img: img, L: letterOf(best) });
  });
  out.sort(function (a, b) {
    var la = a.L === 'A' || a.L === '#' ? 1 : 0, lb = b.L === 'A' || b.L === '#' ? 1 : 0;
    return (la - lb) || cmpName(a.name, b.name) || (a.conc < b.conc ? -1 : 1);
  });
  return out;
}

/* ---------- خواندن سایت‌ها ---------- */
function urlJoin(base, h) {
  try { return new URL(h, base).href; } catch (e) { return ''; }
}
function titleLooksPerfume(t) {
  return /عطر|ادکلن|ادکلون|ادو ?(پرفیوم|تویلت|کلن|پارفوم)|edp|edt|parfum|cologne|perfume|eau de/i.test(t);
}

async function wooSource(base, net, rep) {
  var out = [];
  for (var page = 1; page <= 40; page++) {
    var r = await net.get(base + '/wp-json/wc/store/v1/products?per_page=100&page=' + page);
    if (r.status !== 200) { if (page === 1) throw new Error('HTTP ' + r.status); break; }
    var arr;
    try { arr = JSON.parse(r.body); } catch (e) { if (page === 1) throw new Error('پاسخ JSON نیست'); break; }
    if (!Array.isArray(arr)) { if (page === 1) throw new Error('ساختار ناشناخته'); break; }
    if (!arr.length) break;
    arr.forEach(function (it) {
      var pr = it.prices || {};
      if (it.is_in_stock === false || it.type === 'variable') return;
      if (pr.price_range && pr.price_range.min_amount !== pr.price_range.max_amount) return;
      var minor = pr.currency_minor_unit == null ? 0 : +pr.currency_minor_unit;
      var v = parseFloat(pr.price) / Math.pow(10, minor);
      if (!(v > 0)) return;
      if (/IRR|ریال/i.test(pr.currency_code || pr.currency_symbol || '')) v = v / 10;
      var title = it.name || '';
      var cats = (it.categories || []).map(function (c) { return c.name; }).join(' ');
      if (!titleLooksPerfume(title + ' ' + cats)) return;
      var im = it.images && it.images[0];
      out.push({ t: title, price: v, img: im ? (im.thumbnail || im.src || '') : '' });
    });
    rep(out.length);
    if (arr.length < 100) break;
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  return out;
}

async function digikalaSource(net, rep) {
  var out = [], total = 60;
  for (var page = 1; page <= total; page++) {
    var r = await net.get('https://api.digikala.com/v1/categories/perfume/search/?page=' + page, { Accept: 'application/json' });
    if (r.status !== 200) { if (page === 1) throw new Error('HTTP ' + r.status); break; }
    var j;
    try { j = JSON.parse(r.body); } catch (e) { if (page === 1) throw new Error('پاسخ JSON نیست'); break; }
    var d = j && j.data;
    if (!d || !Array.isArray(d.products)) { if (page === 1) throw new Error('ساختار ناشناخته'); break; }
    if (d.pager && d.pager.total_pages) total = Math.min(total, d.pager.total_pages);
    d.products.forEach(function (p) {
      if (p.status && p.status !== 'marketable') return;
      var pr = p.default_variant && p.default_variant.price ? p.default_variant.price : p.price;
      var rial = pr && (pr.selling_price || pr.rrp_price);
      if (!(rial > 0)) return;
      var title = p.title_fa || p.title_en || '';
      var img = p.images && p.images.main && p.images.main.url && p.images.main.url[0] || '';
      out.push({ t: title, price: rial / 10, img: img });
    });
    rep(out.length);
    if (!d.products.length) break;
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  return out;
}

/* ---- HTML عمومی (برای سایت‌هایی که API ندارند) ---- */
function priceFromText(txt) {
  var t = normFa(txt).replace(/[٬٫،]/g, ',');
  var re = /(\d{1,3}(?:,\d{3})+)/g, m, res = [];
  while ((m = re.exec(t))) res.push(+m[1].replace(/,/g, ''));
  var rial = /ریال/.test(t);
  return { nums: res, rial: rial };
}
function extractCards(doc, pageUrl) {
  var out = [], seen = {};
  // JSON-LD
  Array.prototype.forEach.call(doc.querySelectorAll('script[type="application/ld+json"]'), function (s) {
    var j; try { j = JSON.parse(s.textContent); } catch (e) { return; }
    var list = [];
    (function walk(x) {
      if (!x) return;
      if (Array.isArray(x)) return x.forEach(walk);
      if (typeof x !== 'object') return;
      if (x['@type'] === 'Product') list.push(x);
      if (x.itemListElement) walk(x.itemListElement);
      if (x.item) walk(x.item);
      if (x['@graph']) walk(x['@graph']);
    })(j);
    list.forEach(function (p) {
      var o = Array.isArray(p.offers) ? p.offers[0] : p.offers;
      var price = o && parseFloat(o.price || o.lowPrice);
      if (!(price > 0) || !p.name) return;
      if (o.availability && /OutOfStock|SoldOut/i.test(o.availability)) return;
      if (/IRR/i.test(o.priceCurrency || '')) price /= 10;
      var key = p.url || p.name; if (seen[key]) return; seen[key] = 1;
      out.push({ t: p.name, price: price, img: Array.isArray(p.image) ? p.image[0] : (p.image || '') });
    });
  });
  if (out.length) return out;
  // عمومی: لینکِ دارای عکس و قیمت
  Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
    if (!a.querySelector('img')) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;
    var c = a, ok = false;
    for (var up = 0; up < 5 && c; up++) {
      if (/[\d۰-۹٠-٩]{1,3}[,٬،][\d۰-۹٠-٩]{3}/.test(c.textContent || '')) { ok = true; break; }
      c = c.parentElement;
    }
    if (!ok) return;
    var url = urlJoin(pageUrl, href);
    if (seen[url]) return;
    var clone = c.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('del,s,strike,script,style,[class*="old"],[class*="del"],[class*="before"],[class*="regular"],[class*="prev"],[class*="discount"]'), function (n) { n.remove(); });
    var txt = clone.textContent || '';
    if (/ناموجود|اتمام موجودی|out of stock|موجود نیست/i.test(txt)) return;
    var pr = priceFromText(txt);
    if (!pr.nums.length) return;
    var v = pr.nums[0]; if (pr.rial) v = v / 10;
    var img = a.querySelector('img');
    var title = (img && img.getAttribute('alt')) || a.getAttribute('title') || '';
    if (!title || title.length < 6) {
      var h = c.querySelector('h1,h2,h3,h4,h5,[class*="title"],[class*="name"]');
      title = h ? h.textContent : '';
    }
    title = (title || '').replace(/\s+/g, ' ').trim();
    if (!title) return;
    seen[url] = 1;
    var src = img && (img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '');
    out.push({ t: title, price: v, img: src ? urlJoin(pageUrl, src) : '' });
  });
  return out;
}
function findNext(doc, url, i) {
  var n = doc.querySelector('link[rel="next"],a[rel="next"],a.next,.next.page-numbers');
  if (n && n.getAttribute('href')) return urlJoin(url, n.getAttribute('href'));
  var u = url.replace(/([?&])page=\d+/, '$1page=' + (i + 2));
  if (u === url) u = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + (i + 2);
  return u;
}
async function htmlSource(start, net, rep) {
  var out = [], seen = {}, url = start;
  for (var i = 0; i < 40 && url; i++) {
    var r = await net.get(url, { Accept: 'text/html' });
    if (r.status !== 200) { if (i === 0) throw new Error('HTTP ' + r.status); break; }
    var doc = new DOMParser().parseFromString(r.body, 'text/html');
    var cards = extractCards(doc, url), fresh = 0;
    cards.forEach(function (c) {
      var k = c.t + '|' + c.price;
      if (seen[k]) return; seen[k] = 1; fresh++;
      if (titleLooksPerfume(c.t) || parseTitle(c.t)) out.push(c);
    });
    rep(out.length);
    if (!fresh) break;
    url = findNext(doc, url, i);
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  return out;
}
async function wooOrHtml(base, start, net, rep) {
  try { return await wooSource(base, net, rep); }
  catch (e1) {
    try { return await htmlSource(start, net, rep); }
    catch (e2) { throw new Error('API: ' + e1.message + ' | HTML: ' + e2.message); }
  }
}

var SOURCES = [
  { id: 'liliome', name: 'لیلیوم', trusted: true, run: function (net, rep) { return wooSource('https://liliome.com', net, rep); } },
  { id: 'digikala', name: 'دیجی‌کالا', trusted: true, run: function (net, rep) { return digikalaSource(net, rep); } },
  { id: 'safir', name: 'سفیر', run: function (net, rep) { return wooOrHtml('https://www.safirstores.com', 'https://www.safirstores.com/category/perfume', net, rep); } },
  { id: 'hiland', name: 'هایلند', run: function (net, rep) { return wooOrHtml('https://hilandbeauty.com', 'https://hilandbeauty.com/fa/%D8%B9%D8%B7%D8%B1-%D9%88-%D8%A7%D8%AF%DA%A9%D9%84%D9%86', net, rep); } }
];

root.Core = { normFa: normFa, parseTitle: parseTitle, aggregate: aggregate, SOURCES: SOURCES, extractCards: extractCards,
  wooSource: wooSource, digikalaSource: digikalaSource, htmlSource: htmlSource, letterOf: letterOf, median: median, priceFromText: priceFromText, similar: similar };
if (typeof module !== 'undefined') module.exports = root.Core;
})(typeof window !== 'undefined' ? window : globalThis);
