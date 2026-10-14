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
var NF_C = {}, NF_N = 0;
function normFa(s, keepAlef) {
  var raw = s == null ? '' : s;
  if (typeof raw === 'string' && raw.length < 400) {
    var ck = (keepAlef ? '1' : '0') + raw, h = NF_C[ck]; if (h !== undefined) return h;
    if (NF_N > 30000) { NF_C = {}; NF_N = 0; }
    NF_N++; return (NF_C[ck] = normFa0(raw, keepAlef));
  }
  return normFa0(raw, keepAlef);
}
function normFa0(s, keepAlef) {
  s = decodeEnt(String(s == null ? '' : s));
  s = s.replace(/[\u200b\u00ad\u2060\ufeff]/g, '').replace(/\u2011/g, '-');
  if (/[\ufb50-\ufdff\ufe70-\ufeff]/.test(s)) s = s.normalize('NFKC');           // شکل‌های نمایشیِ عربی → حروف عادی
  s = s.replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); })
       .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); });
  s = s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ۀ/g, 'ه').replace(/ة/g, 'ه')
       .replace(/[أإ]/g, 'ا');
  if (!keepAlef) s = s.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی');
  s = s.replace(/[ً-ٰٟـ]/g, '');
  s = s.replace(/[‌‍‎‏‪-‮]/g, ' ');
  s = s.toLowerCase();
  if (/[\u00c0-\u024f]/.test(s)) s = s.replace(/[\u00c0-\u024f]+/g, function (m) { return m.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); });   // Hermès → hermes ، Lancôme → lancome
  s = s.replace(/\b([jln])['\u2019`\u00b4]\s*(?=[a-z])/g, '$1').replace(/\bd['\u2019`\u00b4]\s*(?=[a-z])/g, '').replace(/([a-z])['\u2019`\u00b4]s\b/g, '$1s');   // J'adore → jadore ، Terre d'Hermes → terre hermes
  s = s.replace(/[\s\u00a0]+/g, ' ').trim();
  return s;
}
var EXCL = /تستر|tester|نمونه|سمپل|sample|گیفت|gift ?set|ست هدیه|مینیاتور|miniature|دکانت|decant|اسانس|تکه ای|ریفیل|refill|بادی ?اسپری|body ?(spray|mist|lotion|wash)|لوسیون|شمع|خوشبو ?کننده|اسپری بدن|دئودورانت|دیودورانت|deodorant|ژل دوش|shower|کرم |اسپری مو|هیر ?میست|hair ?mist|شامپو|روغن عطر|عطر روغنی|رول ?ان|roll ?on|صابون|(^| )پک |(^| )ست( |$)|\bset\b|\bkit\b|(^| )کیت( |$)|مجموعه|جا ?عطری|\d+ ?تایی|\d+ ?عددی|عمده|بدون ?(جعبه|پلمب)|پلمب شکسته|دست دوم|کارکرده|اکسسوری|مشابه|کپی|الهام ?گرفته|\binspired\b|\bclone\b|ایمیتیشن|imitation|هم ?رایحه|افتر ?شیو|آفتر ?شیو|after ?shave|body ?splash|بادی ?اسپلش|hair ?perfume|عطر مو|perfume ?oil|\bcandle\b|\bsoap\b|\bunboxed\b|without ?box|\bused\b|بدون ?کارتن|یدک|\d ?pack\b|\d+ ?عدد\b|تقسیمی|بدون ?برچسب|فاقد ?جعبه|استوک|(^| )طرح( |$)|عطر ماشین|خوشبو ?کننده|room ?spray|\bcar\b|\bcream\b|کرم|\bshampoo\b|\blotion\b|\bdupe\b|similar to|gift ?pack|gift ?box|پک هدیه|\bpack\b|ماسک (صورت|مو|پوست)|(صورت|مو) ماسک|(face|hair|sheet) ?mask|بادی ?میست|fragrance ?mist|\bmist\b|body ?(butter|scrub|oil|crem|creme)|\bbutter\b|\bscrub\b|hair ?oil|gel ?douche|\bcr[eè]me\b|diffuser|\bdeo\b|دئو|coffret|\bduo\b|بخور|\d ?x ?\d|روغن (مو|بدن)|معادل|الهامی|با رایحه|\balternative\b|\bequivalent\b|\bimpression\b/;
var STOP = {};
('عطر ادکلن ادکلون مردانه زنانه مردونه زنونه یونیسکس یونی اورجینال اصل اصلی original حجم میلی لیتر لیتری برند مدل مناسب خرید قیمت فروش اسپری spray for men women unisex ml oz by ادو cc fl نسخه جدید پرفروش ارجینال تضمینی ویژه رایگان ارسال گارانتی پلمپ پلمب کارتن جعبه باکس box عطرادکلن وارداتی اروپایی ایتالیایی تخفیف موجود هدیه فوری نمایندگی رسمی لوکس کیفیت کوالیتی perfume fragrance genuine authentic sale shipping france mens womens stock instock ضمانت اصالت عالی انبار سریع نوروز عددی brand box damaged vintage ترین بهترین برتر پرطرفدار محبوب تازه محصول کالا نیش niche luxury ایرانی اوریجینال اورجینال ارجینال آنلاین فروشگاه batch بارکد barcode').split(' ').forEach(function (w) { STOP[w] = 1; });
var RE_SIZE = /(\d+(?:\.\d+)?)\s*(?:میلی ?لیتر|میلی|میل|مل|ml|cc)(?![a-zا-ی])/g;
var RE_OZ = /(\d+(?:\.\d+)?)\s*(?:fl\.? ?)?oz(?![a-z])/g;
var CONC = [
  ['ادوپرفیوم', /ادو ?پرفیوم|ادو ?پارفوم|ادو ?پرفوم|او ?د[وی] ?پرفیوم|ادی ?پرفیوم|اد ?پرفیوم|eau d[ue] parfum|\bedp\b|e\.d\.p/g],
  ['ادوتویلت', /ادو ?تویلت|ادو ?توالت|ادو ?تواله|او ?د[وی] ?تو[یا]لت|ادی ?تویلت|اد ?تویلت|eau d[ue] toilette|\bedt\b/g],
  ['ادوکلن', /ادو ?کلن|ادوکلن|eau de cologne|\bcologne\b|\bedc\b/g],
  ['اکستریت', /اکستریت( ?د ?پرفیوم)?|اکسترایت|extrait( de parfum)?/g],
  ['پرفیوم', /(^| )(پرفیوم|پارفوم|parfum)( |$)/g]
];
function isFa(w) { return /[؀-ۿ]/.test(w); }
function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

/* جنسیت فقط وقتی که صریح نوشته شده باشد: m مردانه | w زنانه | u یونیسکس | '' نامشخص */
function genderOf(t) {
  if (/یونیسکس|یونی ?سکس|unisex|مردانه ?(و|\/|&) ?زنانه|زنانه ?(و|\/|&) ?مردانه|men ?(and|&|\/) ?women|women ?(and|&|\/) ?men/.test(t)) return 'u';
  var m = /مردانه|مردونه|آقایان|آقایون|\bmens?\b|\bman\b|\bmale\b|for him|pour lui/.test(t);
  var w = /زنانه|زنونه|بانوان|\bwomens?\b|\bwoman\b|\bfemale\b|\bladies\b|for her|pour elle/.test(t);
  return m && w ? 'u' : m ? 'm' : w ? 'w' : '';
}

/* ---------- خواندن مشخصات از توضیحات محصول (سایتی که اندازه را در عنوان نمی‌نویسد) ---------- */
function stripTags(h) { return decodeEnt(String(h == null ? '' : h).replace(/<br\s*\/?>|<\/(p|div|tr|li|td|th|h\d)>/gi, ' ').replace(/<[^>]*>/g, ' ')); }
function hasSizeWord(t) { RE_SIZE.lastIndex = 0; RE_OZ.lastIndex = 0; return RE_SIZE.test(t) || RE_OZ.test(t) || /حجم\s*:?\s*\d/.test(t); }
function specInfo(html) {
  var t = normFa(stripTags(html), true), r = { ml: 0, gn: '', conc: '' }, m;
  if ((m = /(?:سایز|حجم|size|volume)\s*:?\s*(\d+(?:\.\d+)?)\s*(?:میلی ?لیتر|میلی|میل|مل|ml|cc)?/.exec(t))) r.ml = +m[1];
  if (!r.ml) { var all = [], mm; RE_SIZE.lastIndex = 0; while ((mm = RE_SIZE.exec(t))) all.push(+mm[1]); if (all.length && all.every(function (x) { return x === all[0]; })) r.ml = all[0]; }
  if ((m = /(?:جنسیت|gender)\s*:?\s*([^\d]{0,24})/.exec(t))) r.gn = genderOf(m[1]);
  if ((m = /(?:نوع عطر|نوع|type)\s*:?\s*([^\d]{0,30})/.exec(t))) {
    for (var c = 0; c < CONC.length; c++) { CONC[c][1].lastIndex = 0; if (CONC[c][1].test(' ' + m[1] + ' ')) { r.conc = CONC[c][0]; break; } }
  }
  return r;
}
var GN_WORD = { m: 'مردانه', w: 'زنانه', u: 'یونیسکس' };
/* عنوانِ کامل = عنوان + (اندازه/جنسیت/غلظتی که در عنوان نیست ولی در مشخصات یا دسته‌بندی هست) */
function enrichTitle(name, specHtml, catText) {
  var t = String(name || ''), n = normFa(t, true);
  if (!n) return t;
  var sp = specInfo(specHtml), add = [];
  if (!hasSizeWord(n) && sp.ml >= 25 && sp.ml <= 600) add.push(sp.ml + ' میل');
  if (!genderOf(n)) { var g = sp.gn || genderOf(normFa(catText, true)); if (g) add.push(GN_WORD[g]); }
  if (sp.conc) { var has = CONC.some(function (c) { c[1].lastIndex = 0; return c[1].test(n); }); if (!has) add.push(sp.conc); }
  return add.length ? t + ' ' + add.join(' ') : t;
}
var LINEW = {}; ('intense intenso elixir extreme absolu absolute flame sport noir nuit night black white red gold platinum limited legend prive private exclusive tonic aqua fresh million lady pure royal sauvage').split(' ').forEach(function (w) { LINEW[w] = 1; });
var BAD_CAT = /best ?sellers?|featured|gifts?|new ?arrivals?|^brands?$|\bsale\b|\bkids?\b|\bhome\b|tester|\bmini\b|eau de|\bedt\b|\bedp\b|ادو|عطر|ادکلن|ادکلون|مردانه|زنانه|یونیسکس|بانوان|آقایان|perfume|parfum|cologne|women|men\b|unisex|uncategorized|بدون دسته|^برند|فروشگاه|محصولات|پرفروش|جدید|تخفیف|پک|ست\b|گیفت|لوازم|آرایش|بهداشت|پوست|اسپری|بادی|خوشبو|نیش|niche|لوکس|luxury|عربی|arabic|اورجینال|original|متفرقه|سایر|نامشخص|other|generic|unknown|no brand|^all$|همه/i;
function brandHints(cats) {
  var o = [];
  (cats || []).forEach(function (c) {
    var n = typeof c === 'string' ? c : (c && c.name) || '';
    n = decodeEnt(n).replace(/\s+/g, ' ').trim();
    if (n && n.length <= 40 && !BAD_CAT.test(n) && o.indexOf(n) < 0) o.push(n);
  });
  return o.slice(0, 3);
}
/* املای استاندارد + حذفِ واژه‌ی تکراری («ساواج ساواج الکسیر» ← «ساواج الکسیر») */
function cleanToks(toks) {
  var C = nameDict().canon, seen = {}, out = [], NK = function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); };
  toks = toks.map(function (w) { var nk = NK(w); return C[nk] ? C[nk] : w; });
  var J = nameDict().joined, wi = 0, o2 = [];       // «لاویه است بل» / «پورهوم» → همان نوشتنِ استاندارد
  while (wi < toks.length) {
    var hit = 0;
    for (var wl = Math.min(4, toks.length - wi); wl >= 1 && !hit; wl--) {
      var jk = toks.slice(wi, wi + wl).map(NK).join('');
      if (J[jk] && (wl > 1 || J[jk].length > 1)) { J[jk].forEach(function (x) { o2.push(x); }); wi += wl; hit = 1; }
    }
    if (!hit) o2.push(toks[wi++]);
  }
  toks = o2;
  var pm = protMask(toks.map(NK));          // «میس دیور»، «بلو دو شنل»: تکرارِ نامِ برند در خودِ نام عطر است و می‌ماند
  toks.forEach(function (w, i) {
    var nk = NK(w);
    if (/^\d+$/.test(nk) || pm[i]) { out.push(w); return; }
    if (seen[nk]) return; seen[nk] = 1; out.push(w);
  });
  return out;
}
/* ---------- پالایش (Data Cleansing) ----------
   متنِ نام را قبل از شکستن به واژه تمیز می‌کند: کد و شناسه، سالِ تبلیغاتی (۲۰۲۵ ۲۰۲۶ ۱۴۰۴)، عددِ طولانی (بارکد)، تکرارِ عدد */
var YEAR_RE = /^(?:20(?:1[89]|2\d|30)|139[5-9]|140\d)$/;
function cleanseText(k, st) {
  var before = k;
  k = k.replace(/(?:^| )(?:کد|code|sku|batch|ref|id|شناسه|بچ|سریال|serial)\s*:?\s*(?:[a-z]{1,4}\s+)?[a-z0-9\-]*\d[a-z0-9\-]*/g, ' ');       // «کد 12345»
  k = k.replace(/(?:^| )(?:[a-z]{1,4}\d{4,}|\d{4,}[a-z]{1,4})(?= |$)/g, ' ');                                              // AB12345
  var toks = k.split(/\s+/).filter(Boolean), out = [];
  toks.forEach(function (w) {
    if (YEAR_RE.test(w)) return;                       // سالِ جدید/تبلیغاتی
    if (/^\d{5,}$/.test(w)) return;                    // بارکد و کد
    out.push(w);
  });
  var res = out.join(' ');
  if (st && res.replace(/\s+/g, '') !== before.replace(/\s+/g, '')) st.n = (st.n || 0) + 1;
  return res;
}
/* آیا نام (پس از پالایش) معنی دارد؟ باید حداقل یک واژه‌ی حرفیِ دو حرفی یا بیشتر داشته باشد؛ فقط عدد/حرفِ تک = بی‌معنی */
function meaningful(toks) {
  return toks.some(function (w) { return /^[؀-ۿa-z]{2,}$/.test(w); });
}
var CLEANSE = { n: 0, junk: 0 };
/* کالای «به سبکِ» یک عطرِ معروف: «پرفیوم مردانه های نیوویش مدل ورساچه اروس» = ساخته‌ی شرکتِ دیگر، نه ورساچه.
   نشانه: پیش از «مدل» نامِ سازنده‌ی ناشناخته هست و بعد از «مدل» نامِ برندِ شناخته‌شده. چنین کالایی قیمتِ عطرِ اصلی را خراب می‌کند و وارد فهرست نمی‌شود. */
var CLONE_GEN = {}; 'عطر ادکلن ادکلون مردانه زنانه مردونه زنونه یونیسکس پرفیوم ادو ادوپرفیوم ادوتویلت پارفوم parfum perfume edp edt cologne men women مناسب خانم آقایان بانوان'.split(' ').forEach(function (w) { CLONE_GEN[w] = 1; });
function isCloneTitle(t) {
  var tk = t.split(/\s+/), i = tk.indexOf('مدل');
  if (i < 0) i = tk.indexOf('model');
  if (i < 1 || i >= tk.length - 1) return false;
  var nk = function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); };
  var before = tk.slice(0, i).filter(function (w) { return w && !STOP[w] && !CLONE_GEN[w] && !/^\d+$/.test(w); }).map(nk);
  var after = tk.slice(i + 1).filter(function (w) { return w && !/^\d+$/.test(w); }).map(nk);
  if (!before.length || !after.length) return false;
  return brandOf(after, []).id !== 'other' && brandOf(before, []).id === 'other';
}
function parseTitle(raw) {
  var t = normFa(String(raw == null ? '' : raw).replace(/<[^>]*>/g, ' '), true);
  t = t.replace(/[()\[\]{}]/g, ' ').replace(/[،؛؟٪٫٬٭]/g, ' ').replace(/\b(?:number|n ?°|n\.|no\.)\s*(\d)/g, 'no $1').replace(/(?:نامبر|نمبر|شماره)\s*(\d)/g, 'نامبر $1');
  if (!t || EXCL.test(t)) return null;
  if (isCloneTitle(t)) { CLEANSE.clone = (CLEANSE.clone || 0) + 1; return null; }
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
  k = k.replace(/\b(for|pour) (him|her|lui|elle|men|women|man|woman)\b/g, ' ').replace(/گارانتی ?دار|ساخت (فرانسه|امارات|آلمان|ایتالیا|اسپانیا|انگلیس)|ارسال رایگان|با (جعبه|کارتن)/g, ' ');
  k = k.replace(/[^؀-ۿa-z0-9\s]/g, ' ');
  k = cleanseText(k, CLEANSE);
  var toks = k.split(/\s+/).filter(function (w, i, ar) { return w && !STOP[w] && !(w === 'd' && ar[i + 1] !== 'g'); });
  while (toks.length > 1 && (toks[0] === 'و' || toks[toks.length - 1] === 'و' || toks[toks.length - 1] === 'new')) toks = toks[0] === 'و' ? toks.slice(1) : toks.slice(0, -1);
  var fa = toks.filter(function (w) { return isFa(w) || /^\d+$/.test(w); });
  var hasFa = toks.some(isFa);
  var shown = hasFa ? fa : toks;
  if (hasFa && toks.length > fa.length) {
    var NK0 = function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); };
    var fc = cleanToks(fa), fcn = fc.map(NK0), fe = brandOf(fcn, []);
    var latin = toks.filter(function (w) { return !isFa(w) && !/^\d+$/.test(w); });
    if (fe.id !== 'other' && !stripBrand(fcn, fe).length) shown = toks;                 // نامِ برند فارسی و نامِ عطر لاتین («دیور مدل Sauvage»)
    else {                                                                              // «اروس Flame»: واژه‌ی خطِ محصول (لاتین) جزو نام است
      var D = nameDict(), extra = [];
      latin.forEach(function (w) { if (LINEW[w]) { var pf = D.e2f[w]; var add = pf ? pf.split(' ') : [w]; if (add.every(function (x) { return fcn.indexOf(NK0(x)) >= 0; })) return; add.forEach(function (x) { extra.push(x); }); } });
      if (extra.length) shown = fa.concat(extra);
    }
  }
  if (!shown.length) return null;
  shown = cleanToks(shown).filter(function (w) { return w.length > 1 || /[a-z0-9]/.test(w); });      // حرفِ تکِ فارسی = باقی‌مانده‌ی خراب
  if (!shown.length || !meaningful(shown)) { CLEANSE.junk++; return null; }
  var lw = shown[shown.length - 1], pgn = '';
  if (shown.length > 2 && (lw === 'من' || lw === 'وومن' || lw === 'ومن')) { pgn = lw === 'من' ? 'm' : 'w'; shown = shown.slice(0, -1); lw = shown[shown.length - 1]; }
  if (shown.length > 2 && (lw === 'man' || lw === 'woman' || lw === 'مرد' || lw === 'زن')) {      // «Man/Woman» آخرِ عنوان = جنسیت؛ مگر اینکه نامِ خودِ عطر باشد (Jimmy Choo Man)
    var tmp = shown.slice(0, -1), te = brandOf(tmp, []);
    if (te.id === 'other' || stripBrand(tmp, te).length) shown = tmp;
  }
  var key = canonBrand(shown.map(function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); }));
  var name = shown.map(function (w) { return hasFa ? w : cap(w); }).join(' ');
  return { key: key, name: name, conc: conc, ml: ml, fa: hasFa, gn: genderOf(t) || pgn };
}

/* یک ویرایش (حذف/افزودن/جایگزینیِ یک حرف) بین a و b؛ خروجی: [حرف۱، حرف۲] یا null */
function edit1(a, b) {
  if (a === b) return null;
  var la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return null;
  var i = 0;
  while (i < la && i < lb && a[i] === b[i]) i++;
  if (la === lb) return a.slice(i + 1) === b.slice(i + 1) ? [a[i], b[i]] : null;
  if (la > lb) return a.slice(i + 1) === b.slice(i) ? [a[i], ''] : null;
  return a.slice(i) === b.slice(i + 1) ? ['', b[i]] : null;
}
function lev1(a, b) { return a === b || !!edit1(a, b); }
var VOW = 'اآوویهئؤةaeiouy';
var CONF = ['جژ', 'جچ', 'زژ', 'زذ', 'ذظ', 'زظ', 'ضز', 'ضظ', 'سص', 'سث', 'صث', 'تط', 'حه', 'عا', 'قغ', 'کگ', 'پب', 'cs', 'ck', 'sz', 'kq'];
function confusable(x, y) {
  if (!x || !y) return VOW.indexOf(x || y) >= 0;                       // حذف/افزودنِ مصوت
  if (VOW.indexOf(x) >= 0 && VOW.indexOf(y) >= 0) return true;         // جایگزینیِ مصوت با مصوت
  return CONF.some(function (p) { return (p[0] === x && p[1] === y) || (p[0] === y && p[1] === x); });
}
/* واژه‌ها یکی‌اند یا فقط «املا»ی یک‌حرفیِ معقول (مصوت/حروف هم‌صدا) فرق دارند؛ «بلو/بلک» و «نایت/نایس» یکی نیستند */
var HD = {};
function hasD(w) { var v = HD[w]; if (v === undefined) v = HD[w] = /\d/.test(w); return v; }
function tokEq(a, b) {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3 || Math.abs(a.length - b.length) > 1) return false;
  if ((a.length < 4 || b.length < 4) && !(isFa(a) && isFa(b))) return false;      // فارسی: «پاکو/پکو» یکی است؛ لاتین: Her/Hero دو عطرند
  if (hasD(a) || hasD(b)) return false;
  var e = edit1(a, b);
  return !!e && confusable(e[0], e[1]);
}
function similar(A, B) {      // هم‌طول و واژه‌به‌واژه یکسان (فقط املا فرق کند)؛ ترتیب مهم است (Black XS ≠ XS Black)
  if (A.length !== B.length) return false;
  for (var i = 0; i < A.length; i++) if (!tokEq(A[i], B[i])) return false;
  return true;
}
/* واژه‌های «نوع» که جای‌شان در نام فرق می‌کند ولی عطر همان است: «الکسیر ساواج» = «ساواج الکسیر».
   (جابه‌جاییِ واژه‌های دیگر مثل Black XS / XS Black دو عطرِ جدا هستند و یکی نمی‌شوند) */
var MODW = {}; ('الکسیر اینتنس اینتنسو ابسولو ابسولوت اکستریم لیمیتد ادیشن پرایو پرایوت elixir intense intenso absolu absolute absolut extreme limited edition prive private').split(' ').forEach(function (w) { MODW[w] = 1; });
function lead(n) { return MODW[normFa(String(n).split(' ')[0])] ? 1 : 0; }      // «الکسیر ساواج» ← «ساواج الکسیر»: نوع در آخر بهتر است
function lineSplit(k) {
  if (k._ls) return k._ls;
  var core = [], lw = [];
  k.forEach(function (w) { if (MODW[w]) lw.push(w); else core.push(w); });
  return (k._ls = { core: core, lw: lw.sort() });
}
function nameLike(A, B) {            // املا / جابه‌جاییِ واژه‌ی نوع / فارسی-لاتین
  if (similar(A, B) || sameLine(A, B)) return true;
  var fa1 = isFaArr(A), fb = isFaArr(B);
  if (fa1 !== fb) return xSimilar(fa1 ? enOf(A) : A, fb ? enOf(B) : B);
  return false;
}
function sameLine(A, B) {
  if (A.length !== B.length) return false;
  var a = lineSplit(A), b = lineSplit(B);
  if (!a.lw.length || a.lw.length !== b.lw.length || !a.core.length || a.core.length !== b.core.length) return false;
  for (var i = 0; i < a.lw.length; i++) if (!tokEq(a.lw[i], b.lw[i])) return false;
  return similar(a.core, b.core);
}
function median(a) {
  var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

/* ---------- ادغام ---------- */
var MIN_P = 150000, MAX_P = 300000000, PPM_MIN = 2500, PPM_MAX = 3000000;   // تومان
var ORD = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
function rank(c) { c = c.toLowerCase(); var i = ORD.indexOf(c); return c === ' ' ? 0 : i >= 0 ? i + 1 : 200 + c.charCodeAt(0); }
function cmpName(a, b) {
  var n = Math.min(a.length, b.length);
  for (var i = 0; i < n; i++) { var d = rank(a[i]) - rank(b[i]); if (d) return d; }
  return a.length - b.length;
}
function letterOf(name, lang) {
  var c = normFa(name, true).charAt(0);
  if (lang === 'en') return /[a-z]/.test(c) ? c.toUpperCase() : '#';
  if (c === 'آ') return 'ا';
  if (ORD.indexOf(c) >= 0) return c;
  return /[a-z]/.test(c) ? 'A' : '#';
}

/* ---------- یکی‌کردن نام‌ها ---------- */
function dels(w) { var o = [w]; for (var i = 0; i < w.length; i++) o.push(w.slice(0, i) + w.slice(i + 1)); return o; }   // همسایگیِ «حذف یک حرف» برای یافتنِ سریعِ واژه‌های یک‌ویرایشی
function Index() { this.m = {}; this.fz = {}; this.xm = {}; }
var XK = {};
function xk(w) {      // کلیدِ مستقل از خط (فارسی/لاتین): اسکلتِ همخوان‌ها
  var h = XK[w]; if (h !== undefined) return h;
  var k = null;
  if (!/\d/.test(w) && w.length >= 3) { var l = HAS_FA.test(w) ? fa2en([w], LEX).toLowerCase().replace(/[^a-z']/g, '') : w; k = skel(l) || null; if (k && k.length < 2) k = null; }
  if (Object.keys(XK).length > 40000) XK = {};
  return (XK[w] = k);
}
Index.prototype.add = function (g) {
  var m = this.m, fz = this.fz;
  g.key.forEach(function (w) {
    if (!m[w]) { m[w] = []; if (w.length >= 3 && w.length <= 24 && !/\d/.test(w)) dels(w).forEach(function (k) { (fz[k] = fz[k] || []).push(w); }); }
    m[w].push(g.id);
    var x = xk(w); if (x) (this.xm[x] = this.xm[x] || []).push(g.id);
  }, this);
};
Index.prototype.cands = function (key, fuzz) {   // شناسه‌ی گروه‌هایی که حداقل یک واژه‌ی (تقریباً) یکسان دارند
  var cand = {}, m = this.m, fz = this.fz;
  key.forEach(function (w) { (m[w] || []).forEach(function (g) { cand[g] = 1; }); });
  if (fuzz) key.forEach(function (w) { var x = xk(w); if (x && this.xm[x]) this.xm[x].forEach(function (g) { cand[g] = 1; }); }, this);
  if (fuzz) key.forEach(function (w) {
    if (w.length < 3 || w.length > 24 || /\d/.test(w)) return;
    dels(w).forEach(function (k) { (fz[k] || []).forEach(function (iw) { if (iw !== w && tokEq(iw, w)) m[iw].forEach(function (x) { cand[x] = 1; }); }); });
  });
  return Object.keys(cand);
};
function sk(k) { return k._s || (k._s = k.slice().sort().join(' ')); }   // کلیدِ مرتب‌شده (کش روی همان آرایه)
/* ۲ = نام کاملاً یکی | ۱ = نام تقریباً یکی (املا/یک واژه کم) | ۰ = متفاوت */
function restOf(k) {          // نامِ بدونِ برند + شناسه‌ی برند (کش روی همان آرایه)
  if (k._r) return k._r;
  var e = brandOf(k, []), r = e.id === 'other' ? k : stripBrand(k, e);
  if (!r.length) r = k;
  k._b = e.id; return (k._r = r);
}
/* ---- یکی‌کردنِ نامِ فارسی و لاتینِ یک عطر («ورساچه اروس» = «Versace Eros») ----
   نامِ فارسی با فرهنگ‌نامه (و واژه‌هایی که از جفت‌عنوان‌ها یاد گرفته) به لاتین برگردانده و با نامِ لاتین مقایسه می‌شود؛
   املای تقریبی با «اسکلتِ همخوان‌ها» سنجیده می‌شود. نتیجه فقط «شبیه» (۱) است، پس بدون هم‌خوانیِ غلظت/جنسیت و قیمت یکی نمی‌شود. */
var LEX = null;
function setLex(l) { LEX = l || null; }
function isFaArr(r) { if (r._fa === undefined) r._fa = HAS_FA.test(r.join(' ')); return r._fa; }
function enOf(r) {
  if (!r._en) r._en = fa2en(r, LEX).toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  return r._en;
}
function skel(w) {
  var t = w.replace(/'/g, '').replace(/ph/g, 'f').replace(/ch/g, 'x').replace(/sh/g, 'x').replace(/kh/g, 'k').replace(/th/g, 't').replace(/gh/g, 'g').replace(/ck/g, 'k')
    .replace(/[cq]/g, 'k').replace(/z/g, 's').replace(/w/g, 'v').replace(/g/g, 'j').replace(/[aeiouyh]/g, '').replace(/(.)\1+/g, '$1');
  return t;
}
function xTokEq(x, y) {
  if (tokEq(x, y)) return true;
  if (/^\d+$/.test(x) || /^\d+$/.test(y)) return false;
  var sx = skel(x), sy = skel(y);
  return sx.length >= 2 && sx === sy && x.charAt(0) === y.charAt(0) || (sx.length >= 3 && sx === sy);
}
function xSimilar(A, B) { if (A.length !== B.length) return false; for (var i = 0; i < A.length; i++) if (!xTokEq(A[i], B[i])) return false; return true; }
function nameCmp(A, B) {
  var a = restOf(A), b = restOf(B);
  if (A._b === B._b && isFaArr(a) !== isFaArr(b)) {              // یکی فارسی و دیگری لاتین
    var x = isFaArr(a) ? enOf(a) : a, y = isFaArr(b) ? enOf(b) : b;
    return xSimilar(x, y) || sameLine(x, y) ? 1 : 0;
  }
  if (A._b !== B._b || a.length !== b.length) return 0;      // برندِ دیگر یا تعدادِ واژه‌ی دیگر = عطرِ دیگر
  var same = true;
  for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) { same = false; break; } }
  return same ? 2 : (similar(a, b) || sameLine(a, b)) ? 1 : 0;
}
function concCmp(a, b) { return a === b ? 2 : (!a || !b) ? 1 : 0; }
function genCmp(a, b) { return a === b ? 2 : (!a || !b || a === 'u' || b === 'u') ? 1 : 0; }   // مردانه با زنانه هرگز یکی نمی‌شود
function priceOK(r, lo, hi) { return r >= lo && r <= hi; }
/* آیا قیمتِ p برای ml میل با قیمت‌های شناخته‌شده‌ی گروه جور است؟ (هم‌اندازه: ±۲۰٪؛ اندازه‌ی دیگر: با تقریبِ نسبت) */
function corrob(prices, ml, vars) {
  if (!prices || !prices.length) return false;
  var same = prices.filter(function (x) { return x.ml === ml; });
  if (same.length) return same.some(function (x) { return vars.some(function (p) { return priceOK(p / x.p, .8, 1.25); }); });
  var best = null;
  prices.forEach(function (x) { if (!best || Math.abs(Math.log(ml / x.ml)) < Math.abs(Math.log(ml / best.ml))) best = x; });
  var q = best.p * Math.pow(ml / best.ml, .8);
  return vars.some(function (p) { return priceOK(p / q, .65, 1.55); });
}
function scaleVars(db, src, price) {
  var sc = db.sc && db.sc[src];
  return sc ? [price * sc] : [price, price / 10, price * 10];
}

/* قیمت نهایی گروه‌ها. group: {id,key,conc,gn,items:[{src,ml,price}], nm?, im?} */
function pickEntry(arr) {   // چند قیمت از یک سایت برای یک گروه و یک سایز (مثلاً دو آگهی/تخفیف)
  if (arr.length === 1) return arr[0];
  var s = arr.slice().sort(function (x, y) { return y.p - x.p; }), top = s[0].p;
  var cl = s.filter(function (v) { return v.p >= top / 1.35; });   // قیمت‌های نزدیک به بالاترین؛ خیلی ارزان‌تر = احتمالاً اشتباه یا کالای دیگر
  return cl[cl.length - 1];                                        // در همان خوشه، قیمتِ با تخفیف
}
var SRC_BASE = { liliome: 'https://liliome.com', digikala: 'https://www.digikala.com', safir: 'https://www.safirstores.com', hiland: 'https://hilandbeauty.com' };
/* آدرسِ صفحه‌ی محصول در سایت؛ از روی شناسه ساخته می‌شود (ذخیره‌ی آدرس‌های بلند حافظه را پر می‌کند) */
function itemUrl(src, pid) {
  pid = String(pid || '');
  if (/^https?:\/\//i.test(pid)) {
    if (/[\s\\\u0000-\u001f]/.test(pid) || pid.length > 2000) return '';
    var hm = /^https?:\/\/([^\/?#:@]+)(?::\d+)?(?:[\/?#]|$)/i.exec(pid);
    if (!hm) return '';
    var hh = hm[1].toLowerCase();
    return Object.keys(SRC_BASE).filter(function (k) { return !SRC_BASE[src] || k === src; }).some(function (k) { var d = SRC_BASE[k].replace(/^https?:\/\/(www\.)?/, ''); return hh === d || hh === 'www.' + d || hh.slice(-(d.length + 1)) === '.' + d; }) ? pid : '';
  }
  if (!/^\d{1,12}$/.test(pid)) return '';
  if (src === 'digikala') return SRC_BASE.digikala + '/product/dkp-' + pid + '/';
  return SRC_BASE[src] ? SRC_BASE[src] + '/?p=' + pid : '';
}
function priceGroups(groups, srcOrder, trusted, prior) {
  trusted = trusted || {};
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
    var r = ratios[s]; scale[s] = trusted[s] ? 1 : ((prior && prior[s]) || 1);          // شواهد کم است: مقیاسِ قبلی حفظ می‌شود (پرش ۱۰ برابری نداشته باشیم)
    if (trusted[s] || r.length < 4) return; scale[s] = 1;
    var md = median(r);
    if (md > 7.5 && md < 13) scale[s] = 0.1;                       // ریال → تومان
    else if (anyTrusted && md > 0.075 && md < 0.133) scale[s] = 10; // فقط وقتی منبع مطمئن هست
  });

  var out = [];
  groups.forEach(function (g) {
    var bySize = {};
    g.items.forEach(function (it) {
      var p = it.price * (scale[it.src] || 1);
      if (!(p >= MIN_P && p <= MAX_P) || !(p / it.ml >= PPM_MIN && p / it.ml <= PPM_MAX)) return;   // قیمتِ هر میلِ غیرمنطقی (۱۰ برابر/۱۰ برابر کمتر) دور ریخته می‌شود
      var o = (bySize[it.ml] = bySize[it.ml] || {});
      (o[it.src] = o[it.src] || []).push({ p: p, pid: it.pid });
    });
    var sizes = [];
    Object.keys(bySize).forEach(function (ml) {
      var per = bySize[ml], srcs = Object.keys(per);
      var ents = srcs.map(function (s) { return pickEntry(per[s]); }), vals = ents.map(function (e) { return e.p; });
      var tv = vals.filter(function (v, i) { return trusted[srcs[i]]; });
      if (srcs.length > 1 && tv.length) {            // سایتِ مطمئن هست: قیمتِ سایتِ دیگر که بیش از ۳ برابر با آن فرق دارد اشتباه است
        var tm = median(tv), kp = srcs.map(function (s, i) { return trusted[s] || (vals[i] / tm < 3 && vals[i] / tm > 1 / 3); });
        srcs = srcs.filter(function (s, i) { return kp[i]; }); ents = ents.filter(function (e, i) { return kp[i]; }); vals = vals.filter(function (v, i) { return kp[i]; });
      }
      if (srcs.length === 2 && Math.max(vals[0], vals[1]) / Math.min(vals[0], vals[1]) > 3) {   // دو قیمت ۳ برابر فرق دارند (حتی هر دو مطمئن): یکی اشتباه است؛ منبعِ جلوتر در فهرست
        var r0 = (srcOrder || []).indexOf(srcs[0]), r1 = (srcOrder || []).indexOf(srcs[1]), pk = (r1 >= 0 && (r0 < 0 || r1 < r0)) ? 1 : 0;
        srcs = [srcs[pk]]; ents = [ents[pk]]; vals = [vals[pk]];
      }
      var price, n = vals.length, used = vals.map(function () { return true; });
      if (n === 1) price = vals[0];
      else if (n === 2) { var lo = Math.min(vals[0], vals[1]), hi = Math.max(vals[0], vals[1]); price = hi / lo > 1.3 ? hi : (lo + hi) / 2; if (hi / lo > 1.3) used = vals.map(function (v) { return v === hi; }); }
      else {
        var md = median(vals), ok = vals.filter(function (v) { return Math.abs(v - md) / md <= 0.25; });
        price = median(ok.length ? ok : vals); n = ok.length || n;
        if (ok.length) used = vals.map(function (v) { return Math.abs(v - md) / md <= 0.25; });
      }
      sizes.push({ ml: +ml, price: Math.round(price / 1000) * 1000, n: n, srcs: srcs.map(function (s, k) { return { s: s, price: Math.round(vals[k] / 1000) * 1000, pid: ents[k].pid, used: used[k] }; }) });
    });
    if (!sizes.length) return;
    if (sizes.length >= 3) {                           // قیمتِ هر میلِ یک اندازه خیلی با بقیه فرق دارد (۱۰ برابر اشتباه) → دور ریخته می‌شود
      var med = median(sizes.map(function (z) { return z.price / z.ml; }));
      var kept = sizes.filter(function (z) { var q = (z.price / z.ml) / med; return q <= 4 && q >= 0.25; });
      if (kept.length >= 2) sizes = kept;
    }
    sizes.sort(function (a, b) { return b.ml - a.ml; });
    var cnt = g.nm, best = '';
    if (!cnt) { cnt = {}; g.items.forEach(function (it) { cnt[it.name] = (cnt[it.name] || 0) + 1; }); }
    Object.keys(cnt).forEach(function (n) { if (!best || cnt[n] > cnt[best] || (cnt[n] === cnt[best] && n.length > best.length)) best = n; });
    var img = '', im = g.im;
    if (!im) { im = {}; g.items.forEach(function (it) { if (it.img && !im[it.src]) im[it.src] = it.img; }); }
    (srcOrder || []).some(function (s) { if (im[s]) { img = im[s]; return true; } });
    if (!img) Object.keys(im).some(function (s) { if (im[s]) { img = im[s]; return true; } });
    var big = '', bi = g.bi || {};
    (srcOrder || []).some(function (s) { if (bi[s]) { big = bi[s]; return true; } });
    if (!big) Object.keys(bi).some(function (s) { if (bi[s]) { big = bi[s]; return true; } });
    out.push({ id: g.id || hash(g.key.join(' ') + '|' + g.conc), key: g.key, name: best, conc: g.conc, gn: g.gn || '', sizes: sizes, img: img, big: big || img, br: g.br || [], en: g.en || null, L: letterOf(best) });
  });
  out.sort(function (a, b) {
    var la = a.L === 'A' || a.L === '#' ? 1 : 0, lb = b.L === 'A' || b.L === '#' ? 1 : 0;
    return (la - lb) || cmpName(a.name, b.name) || (a.conc < b.conc ? -1 : a.conc > b.conc ? 1 : 0) || (a.gn < b.gn ? -1 : a.gn > b.gn ? 1 : 0);
  });
  out.scale = scale;
  return out;
}

/* ---------- نام فارسی ⇄ انگلیسی ----------
   سه منبع: ۱) نام انگلیسی که خودِ سایت داده (عنوان لاتین، title_en دیجی‌کالا، آدرس محصول در لیلیوم)
            ۲) واژه‌نامه‌ی داخلی (پایین) ۳) واژه‌هایی که برنامه از جفت‌عنوان‌های سایت‌ها یاد گرفته (db.wd)
   اگر هیچ‌کدام نبود، واج‌نویسی تقریبی می‌کند. */
var NAME_DICT = [
['ساواج|ساوج|ساواژ|سواج|سواژ|سوواژ|ساوژ|ساوواژ|ساواگ', 'Sauvage'], ['اونتوس|آونتوس|اوانتوس|اونتوس', 'Aventus'], ['لیبره|لیبر', 'Libre'], ['وان میلیون|وان میلیون', 'One Million'],
['لیدی میلیون', 'Lady Million'], ['میلیون', 'Million'], ['وان میلیون|1 میلیون|یک میلیون', 'One Million'], ['اینویکتوس|اینوکتوس|اینویکتس', 'Invictus'], ['اروس|اروز', 'Eros'], ['اکوا دی جیو|آکوا دی جیو|اکوا دی جو', 'Acqua di Gio'],
['پروفومو', 'Profumo'], ['اکوا|آکوا', 'Acqua'], ['دیلان بلو', 'Dylan Blue'], ['دیلن بلو', 'Dylan Blue'], ['بلو دو', 'Bleu de'], ['بلو', 'Blue'], ['بلک', 'Black'], ['وایت', 'White'],
['رد', 'Red'], ['گرین', 'Green'], ['گلد', 'Gold'], ['گلدن', 'Golden'], ['سیلور', 'Silver'], ['پلاتینیوم|پلاتینوم', 'Platinum'], ['دارک', 'Dark'], ['نایت', 'Night'], ['نوآر|نویر|نوار', 'Noir'],
['روژ', 'Rouge'], ['رز', 'Rose'], ['عود', 'Oud'], ['امبر|عنبر', 'Amber'], ['مشک|موسک', 'Musk'], ['وانیل|وانیلا|ونیل', 'Vanilla'], ['ویتیور|وتیور|وتیور', 'Vetiver'], ['سیتروس', 'Citrus'],
['لیمو', 'Lemon'], ['اورنج|پرتقال', 'Orange'], ['تونکا', 'Tonka'], ['توسکان لدر|توسکانی لدر', 'Tuscan Leather'], ['لدر|چرم', 'Leather'], ['چری|گیلاس', 'Cherry'], ['بمب', 'Bomb'], ['فلاور بمب|فلاوربمب', 'Flowerbomb'],
['فلاور|گل', 'Flower'], ['گود گرل گان بد', 'Good Girl Gone Bad'], ['گود گرل', 'Good Girl'], ['گود', 'Good'], ['گرل', 'Girl'], ['بد', 'Bad'], ['بوی', 'Boy'], ['بای', 'By'], ['بوس', 'Boss'], ['بوتلد', 'Bottled'],
['لاو دانت بی شای', "Love Don't Be Shy"], ['لاو', 'Love'], ['وان', 'One'], ['تو', 'Two'], ['لیدی', 'Lady'], ['کینگ', 'King'], ['کوئین|کویین', 'Queen'], ['ملکه', 'Queen'], ['پرنس', 'Prince'], ['پرنسس', 'Princess'],
['رویال|روال', 'Royal'], ['سلطان', 'Sultan'], ['شیخ', 'Sheikh'], ['لجند|لجندری', 'Legend'], ['ایکون|آیکون|ایکن', 'Icon'], ['ایدول|ایدل', 'Idole'], ['ایمپرس', 'Empress'], ['اولتیما', 'Ultima'],
['اکستریم', 'Extreme'], ['اسپرت|اسپورت', 'Sport'], ['اکتیو', 'Active'], ['فرش', 'Fresh'], ['کول', 'Cool'], ['واتر', 'Water'], ['ایر', 'Air'], ['فایر', 'Fire'], ['ارث', 'Earth'], ['ویند', 'Wind'], ['اوشن|اقیانوس', 'Ocean'],
['سی', 'Si'], ['دیزایر', 'Desire'], ['گان', 'Gone'], ['فانتوم|فانتم', 'Phantom'], ['کد', 'Code'], ['ایکس اس|اکس اس', 'XS'], ['ایکس|اکس', 'X'], ['پور هوم', 'Pour Homme'], ['پور فم', 'Pour Femme'],
['پور', 'Pour'], ['هوم|اوم|هومو', 'Homme'], ['فم|فام', 'Femme'], ['الکسیر|الیکسیر|الکسر|اکسیر|اکسر|الیکسر', 'Elixir'], ['اینتنس|اینتنسو|اینتنز|اینتنس', 'Intense'], ['اینتنسو', 'Intenso'], ['لانویت|لا نویت', 'La Nuit'], ['لا ویه است بل|لاویه است بل|لا ویی است بل', 'La Vie Est Belle'],
['لا ویه', 'La Vie'], ['لا', 'La'], ['لو|له', 'Le'], ['لس', 'Les'], ['دو', 'de'], ['د وان', 'The One'], ['د', 'The'], ['دی', 'di'], ['مای', 'My'], ['مای سلف', 'My Self'], ['سلف', 'Self'], ['اند', '&'],
['کریستال نویر|کریستال نوآر', 'Crystal Noir'], ['کریستال', 'Crystal'], ['جادور|ژادور|جی ادور', "J'adore"], ['میس دیور', 'Miss Dior'], ['میس', 'Miss'], ['پویزن|پوازن', 'Poison'], ['هیپنوتیک', 'Hypnotic'], ['فارنهایت|فهرنهایت|فرنهایت', 'Fahrenheit'],
['اوپیوم|اپیوم', 'Opium'], ['ابسولو|ابسولو', 'Absolu'], ['ابسولوت|ابسولوت', 'Absolute'], ['فلیم|فلیمز|فلم', 'Flame'], ['نویت|نوی', 'Nuit'], ['تونیک|تانیک', 'Tonic'], ['پیور|پیوره', 'Pure'], ['ریزرو|رزرو', 'Reserve'], ['ویکتوری|ویکتوریا', 'Victory'], ['سنتس', 'Scents'], ['ارکید', 'Orchid'], ['بلوم', 'Bloom'], ['آتلانتیک|اتلانتیک', 'Atlantic'],
['ایرزیستیبل|ایریزیستیبل', 'Irresistible'], ['امبلم', 'Emblem'], ['شانس|چنس|چانس', 'Chance'], ['مادمازل|مدمازل', 'Mademoiselle'], ['کوکو', 'Coco'], ['الور|آلور', 'Allure'], ['اگویست|اگویست', 'Egoiste'], ['نامبر|نمبر|نامبر', 'No'], ['شماره', 'No'],
['کلن|کلون|کولون', 'Cologne'], ['ادیشن', 'Edition'], ['لیمیتد|لیمیتد', 'Limited'], ['اکسکلوسیو|اکسکلوسیو', 'Exclusif'], ['کالکشن|کلکسیون', 'Collection'], ['پرایو|پریو', 'Prive'], ['پرایوت', 'Private'], ['پرستیژ', 'Prestige'],
['دایموند|الماس', 'Diamond'], ['استار|ستاره', 'Star'], ['مون|ماه', 'Moon'], ['سان|خورشید', 'Sun'], ['پرل|مروارید', 'Pearl'], ['ایمپریال', 'Imperial'], ['ماجستیک', 'Majestic'], ['اینفینیتی', 'Infinity'], ['اترنیتی|اترنیتی', 'Eternity'],
['اترنال', 'Eternal'], ['دریم|رویا', 'Dream'], ['فانتزی|فانتسی', 'Fantasy'], ['پارادایس|پارادیس', 'Paradise'], ['هیرو', 'Hero'], ['وان', 'One'], ['ایزی', 'Easy'], ['اینسپایر', 'Inspire'], ['پاور', 'Power'], ['فرییدم|فریدم', 'Freedom'],
['جنتل من|جنتلمن', 'Gentleman'], ['جنتلمن', 'Gentleman'], ['مستر', 'Mister'], ['هاوس', 'House'], ['وود|چوب', 'Wood'], ['سدر|سدر', 'Cedar'], ['سندل|صندل|سندل وود', 'Sandalwood'], ['پچولی|پچولی', 'Patchouli'],
['یاسمن|جاسمین', 'Jasmine'], ['لوتوس', 'Lotus'], ['لوند|لاوندر|اسطوخودوس', 'Lavender'], ['نارگیل', 'Coconut'], ['کوکونات', 'Coconut'], ['کارامل', 'Caramel'], ['شکلات', 'Chocolate'], ['کافی|قهوه', 'Coffee'], ['تنباکو', 'Tobacco'],
['ویسکی', 'Whisky'], ['رام', 'Rum'], ['لیکور', 'Liqueur'], ['اسپایسی|اسپایس', 'Spicy'], ['اسپایس', 'Spice'], ['کریسمس', 'Christmas'], ['شب', 'Night'], ['روز', 'Day'], ['صبح', 'Morning'], ['بهار', 'Spring'], ['تابستان', 'Summer'],
['پاییز', 'Autumn'], ['زمستان', 'Winter'], ['بامبو', 'Bamboo'], ['بلوسم', 'Blossom'], ['پتال|پتالز', 'Petals'], ['گاردنیا', 'Gardenia'], ['تیوبروز|توبروز', 'Tuberose'], ['مگنولیا|ماگنولیا', 'Magnolia'], ['پئونی|پیونی', 'Peony'],
['سیک|سیک', 'Chic'], ['شیک', 'Chic'], ['الگانت|الگانس', 'Elegant'], ['الگانس', 'Elegance'], ['پریمیر|پرمیر', 'Premier'], ['پریمیوم|پرمیوم', 'Premium'], ['کلاسیک|کلاسیک', 'Classic'], ['اورجینال', 'Original'], ['نیو', 'New'], ['مادرن|مدرن', 'Modern'],
['اسمارت', 'Smart'], ['اسکای|آسمان', 'Sky'], ['اسکای فال', 'Skyfall'], ['دیپ|عمیق', 'Deep'], ['هات|داغ', 'Hot'], ['سوییت|سویت', 'Sweet'], ['سوپر', 'Super'], ['مگا', 'Mega'], ['اولترا', 'Ultra'], ['پلاس', 'Plus'], ['پرو', 'Pro'], ['مکس|ماکس', 'Max'],
['میکس|مکس', 'Mix'], ['سنت|سنت', 'Scent'], ['پرفیوم', 'Parfum'], ['زیبا', 'Beauty'], ['بیوتی', 'Beauty'], ['ونوس|ونوس', 'Venus'], ['آپولو|اپولو', 'Apollo'], ['زئوس', 'Zeus'], ['تایتان|تیتان', 'Titan'], ['گلادیاتور', 'Gladiator'],
['وارریور|وارير', 'Warrior'], ['هانتر', 'Hunter'], ['رنجر', 'Ranger'], ['آدونیس|ادونیس', 'Adonis'], ['اتوم|اتم', 'Atom'], ['نارسیس|نارسیسو', 'Narciso'], ['اولمپیا|المپیا', 'Olympea'], ['المپیا', 'Olympea'], ['فانتوم', 'Phantom'],
['لیجند', 'Legend'], ['اسپیریت', 'Spirit'], ['ویکتورین', 'Victorine'], ['رمانتیک|رومانتیک', 'Romantic'], ['اینتیمیت|اینتیم', 'Intimate'], ['سداکشن|سداکتیو', 'Seduction'], ['تمپتیشن', 'Temptation'],
['پاشن|پشن', 'Passion'], ['ایموشن', 'Emotion'], ['هپینس|هاپینس', 'Happiness'], ['جوی|جوی', 'Joy'], ['هاپی', 'Happy'], ['لاکی', 'Lucky'], ['فرگرنس', 'Fragrance'], ['اسنس|اسانس', 'Essence'], ['اکسپرشن', 'Expression'],
['کیش', 'Kish'], ['شیراز', 'Shiraz'], ['تهران', 'Tehran'], ['پاریس', 'Paris'], ['لندن', 'London'], ['میلان', 'Milan'], ['ایتالیا', 'Italia'], ['فرانسه', 'France'], ['دبی', 'Dubai'], ['نیویورک', 'New York'], ['رم', 'Rome'],
['آمریکا', 'America'], ['سانتال', 'Santal'], ['مارین', 'Marine'], ['مارینه', 'Marine'], ['فروتی', 'Fruity'], ['فلورال', 'Floral'], ['وودی', 'Woody'], ['امبری', 'Ambery'], ['پودری|پودر', 'Powder'], ['ایریس', 'Iris'], ['ایریس', 'Iris'],
['هلیوتروپ', 'Heliotrope'], ['بنزوین', 'Benzoin'], ['افسانه', 'Legend'], ['عشق', 'Love'], ['قلب', 'Heart'], ['هارت', 'Heart'], ['سول|روح', 'Soul'], ['لایف|زندگی', 'Life'], ['خاص', 'Special'], ['ویژه', 'Special'], ['اسپشیال', 'Special'],
['لو میل|لومیل|له میل', 'Le Male'], ['کول واتر|کولواتر', 'Cool Water'], ['بلک اپیوم|بلک اوپیوم|بلکاپیوم', 'Black Opium'], ['لایت بلو|لایتبلو', 'Light Blue'], ['هر', 'Her'], ['لایت', 'Light'], ['گیلتی|گویلتی', 'Guilty'], ['اچ ۲۴|اچ 24|اچ24', 'H24'], ['میل', 'Male'], ['فیمل', 'Female']
];
var ND = null;
function nameDict() {
  if (ND) return ND;
  ND = { f2e: {}, e2f: {}, canon: {}, joined: {}, fmax: 1, emax: 1 };
  NAME_DICT.forEach(function (row) {
    var vs = row[0].split('|'), en = row[1], ek = en.toLowerCase();
    var b0 = brandNorm(vs[0]);
    if (vs.length > 1 && b0.length === 1) vs.slice(1).forEach(function (v) { var t = brandNorm(v); if (t.length === 1 && t[0] !== b0[0] && !ND.canon[t[0]]) ND.canon[t[0]] = normFa(vs[0], true); });   // املاهای دیگرِ یک واژه → یک املای استاندارد
    if (b0.length > 1) vs.forEach(function (v) { var tj = brandNorm(v); if (tj.length) { var jj = tj.join(''); if (!ND.joined[jj]) ND.joined[jj] = b0; } });   // برای املای چندواژه‌ای: همه‌ی شکل‌ها (با/بی فاصله) به شکلِ اول
    vs.forEach(function (v, i) {
      var tk = brandNorm(v); if (!tk.length) return;
      var k = tk.join(' ');
      if (!ND.f2e[k]) ND.f2e[k] = en;
      if (tk.length > ND.fmax) ND.fmax = tk.length;
    });
    var ev = ek.replace(/[^a-z0-9' &]/g, ' ').replace(/\s+/g, ' ').trim();
    if (ev && !ND.e2f[ev]) { ND.e2f[ev] = normFa(vs[0], true); var n = ev.split(' ').length; if (n > ND.emax) ND.emax = n; }
  });
  return ND;
}
/* ---- حروف: فارسی → لاتین (برای واژه‌های ناآشنا؛ تقریبی) ---- */
var FA_L = { 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'ء': '' };
function translitFaWord(w) {
  var out = '', i, c, n = w.length, needV = true;
  function isCons(ch) { return FA_L[ch] !== undefined && ch !== 'ا' && ch !== 'ء' && ch !== 'ع'; }
  for (i = 0; i < n; i++) {
    c = w[i];
    if (c === 'ا' && i === 0 && w[1] === 'ی') { out += 'i'; i++; needV = true; continue; }
    if (c === 'ا' || c === 'آ' || c === 'ع') { out += 'a'; needV = true; continue; }
    if (c === 'و') {
      if (i === 0) out += 'v'; else if (i === n - 1) out += 'o'; else if ('ای'.indexOf(w[i + 1]) >= 0 && w[i + 1] !== 'ا') out += 'v'; else out += 'u'; needV = true; continue;
    }
    if (c === 'ی') { out += (i === 0 || (i + 1 < n && w[i + 1] === 'ا')) ? 'y' : 'i'; needV = true; continue; }
    if (c === 'ه' && i === n - 1 && n > 2) { out += 'e'; needV = true; continue; }
    var m = FA_L[c];
    if (m === undefined) { if (/[0-9a-z]/.test(c)) { out += c; needV = true; } continue; }
    out += m;
    if (needV && i + 1 < n && isCons(w[i + 1]) && !(w[i + 1] === 'ه' && i + 1 === n - 1)) { out += 'a'; needV = false; }
    else needV = !needV ? true : false;
  }
  return out.replace(/aa+/g, 'a');
}
var EN_LOWER = { de: 1, du: 1, des: 1, di: 1, of: 1, the: 1, and: 1, la: 1, 'for': 1 };
var EN_UP = { ck: 1, ysl: 1, jpg: 1, xs: 1, vip: 1, uk: 1, usa: 1, dkny: 1, mfk: 1, cr7: 1, ii: 1, iii: 1, iv: 1, vi: 1, vii: 1, viii: 1, ix: 1, xo: 1, xl: 1, edp: 1, '212': 1, cm: 1, g: 1, n: 1, p: 1, w: 1, z: 1, v: 1, x: 1, i: 1, e: 1 };
function capEn(w) {
  if (!w) return w;
  if (w === '&') return w;
  if (EN_UP[w] && w.length <= 4) return w.toUpperCase();
  var parts = w.split("'");
  return parts.map(function (p, i) {
    if (!p) return p;
    if (i > 0 && p.length <= 2) return p;
    if (i === 0 && parts.length > 1 && p.length === 1) return p === 'd' ? 'd' : p.toUpperCase();
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join("'");
}
function titleEn(toks) {
  return toks.map(function (w, i) { return (i > 0 && EN_LOWER[w]) ? w : capEn(w); }).join(' ');
}
/* ---- نام فارسی (توکن‌های نرمال‌شده) → انگلیسی. lex = db.wd (یادگرفته‌ها) ---- */
function fa2en(toks, lex) {
  var D = nameDict(), out = [], i = 0;
  while (i < toks.length) {
    var done = false;
    for (var n = Math.min(D.fmax, toks.length - i); n >= 1 && !done; n--) {
      var k = toks.slice(i, i + n).join(' '), v = D.f2e[k];
      if (!v && n === 1 && lex && lex[k]) { var bc = 0; Object.keys(lex[k]).forEach(function (e) { if (lex[k][e] > bc) { bc = lex[k][e]; v = e; } }); }
      if (v) { Array.prototype.push.apply(out, v.toLowerCase().split(' ')); i += n; done = true; }
    }
    if (done) continue;
    var w = toks[i];
    if (/^[0-9a-z']+$/.test(w)) out.push(w); else out.push(translitFaWord(w));
    i++;
  }
  return titleEn(out.filter(Boolean));
}
/* ---- لاتین → فارسی ---- */
var L_FA = { b: 'ب', c: 'ک', d: 'د', f: 'ف', g: 'گ', h: 'ه', j: 'ج', k: 'ک', l: 'ل', m: 'م', n: 'ن', p: 'پ', q: 'ک', r: 'ر', s: 'س', t: 'ت', v: 'و', w: 'و', x: 'کس', z: 'ز' };
function translitEnWord(w) {
  w = w.replace(/'/g, '');
  var s = w.replace(/sch/g, 'ش').replace(/sh/g, 'ش').replace(/ch/g, 'چ').replace(/kh/g, 'خ').replace(/gh/g, 'ق').replace(/ph/g, 'ف').replace(/th/g, 'ت').replace(/ck/g, 'ک').replace(/qu/g, 'کو')
    .replace(/ee|ea|ie/g, 'ی').replace(/oo|ou/g, 'و').replace(/ai|ay|ei|ey/g, 'ی').replace(/tion/g, 'شن').replace(/(.)\1/g, '$1');
  var out = '', i, c;
  for (i = 0; i < s.length; i++) {
    c = s[i];
    if (/[؀-ۿ]/.test(c)) { out += c; continue; }
    if (c === 'a') { out += i === 0 ? 'ا' : 'ا'; continue; }
    if (c === 'e') { if (i === 0) out += 'ا'; else if (i === s.length - 1) out += ''; else if (i + 1 < s.length && /[a-z]/.test(s[i + 1]) && out.length && /[ا-ی]$/.test(out) && i === s.length - 2) out += ''; else out += ''; continue; }
    if (c === 'i') { out += (i === 0 ? 'ای' : 'ی'); continue; }
    if (c === 'o') { out += (i === 0 ? 'ا' : 'و'); continue; }
    if (c === 'u') { out += (i === 0 ? 'ا' : 'و'); continue; }
    if (c === 'y') { out += 'ی'; continue; }
    if (/[0-9]/.test(c)) { out += c; continue; }
    out += L_FA[c] || '';
  }
  return out || w;
}
function en2fa(toks, lex) {
  var D = nameDict(), out = [], i = 0;
  var rev = null;
  while (i < toks.length) {
    var done = false;
    for (var n = Math.min(D.emax, toks.length - i); n >= 1 && !done; n--) {
      var k = toks.slice(i, i + n).join(' ').replace(/'/g, "'"), v = D.e2f[k];
      if (!v && n === 1 && lex) {
        if (!rev) { rev = {}; Object.keys(lex).forEach(function (f) { Object.keys(lex[f]).forEach(function (e) { if (!rev[e] || rev[e].c < lex[f][e]) rev[e] = { f: f, c: lex[f][e] }; }); }); }
        if (rev[k]) v = rev[k].f;
      }
      if (v) { out.push(v); i += n; done = true; }
    }
    if (done) continue;
    out.push(translitEnWord(toks[i])); i++;
  }
  return out.join(' ');
}
/* عنوانِ لاتینِ محصول → توکن‌های نام (بدون اندازه/غلظت/جنسیت/واژه‌های عمومی) */
var EN_STOP = {}; ('perfume perfumes cologne edp edt edc spray for men mens women womens ladies unisex original authentic ml oz fl fragrance').split(' ').forEach(function (w) { EN_STOP[w] = 1; });
function enTokens(raw) {
  var t = normFa(raw, true); if (!t) return [];
  t = t.replace(RE_SIZE, ' ').replace(RE_OZ, ' ');
  CONC.forEach(function (x) { x[1].lastIndex = 0; t = t.replace(x[1], ' '); });
  t = t.replace(/[‘’`´]/g, "'");
  var toks = t.split(/[^a-z0-9']+/).map(function (w) { return w.replace(/^'+|'+$/g, ''); }).filter(function (w) { return w && !EN_STOP[w]; });
  if (toks.length && toks.every(function (w) { return /^\d+$/.test(w); })) return [];
  return toks;
}
/* آدرس محصول (slug) → عنوان لاتین */
function slugText(s) {
  s = String(s || ''); try { s = decodeURIComponent(s); } catch (e) { return ''; }
  return /^[a-z0-9\-_. ]+$/i.test(s) ? s.replace(/[-_.]+/g, ' ').trim() : '';
}
var BRAND_EN = {
  'دیور': 'Dior', 'دولچه و گابانا': 'Dolce & Gabbana', 'ایو سن لوران': 'Yves Saint Laurent', 'کالوین کلین': 'Calvin Klein', 'پارفومز د مارلی': 'Parfums de Marly',
  'مزون فرانسیس کورکجان': 'Maison Francis Kurkdjian', 'روژا': 'Roja Parfums', 'پنهالیگونز': "Penhaligon's", 'ممو': 'Memo Paris', 'ویکتوریا سکرت': "Victoria's Secret",
  'باند نامبر ۹': 'Bond No. 9', 'ویکتور اند رولف': 'Viktor & Rolf', 'کلوئه': 'Chloé', 'ماریاژ': 'Mariage Frères', 'سالواتوره فراگامو': 'Salvatore Ferragamo', 'لانکوم': 'Lancôme',
  'مونت بلانک': 'Montblanc', 'ژان پل گوتیه': 'Jean Paul Gaultier', 'تاور': 'Tauer Perfumes', 'جورجیو آرمانی': 'Giorgio Armani', 'مزون مارجیلا': 'Maison Margiela', 'سوئیس عربین': 'Swiss Arabian',
  'کارولینا هررا': 'Carolina Herrera', 'لو لابو': 'Le Labo', 'الحرمین': 'Al Haramain', 'ایسی میاکی': 'Issey Miyake', 'تیری موگلر': 'Mugler', 'ون کلیف': 'Van Cleef & Arpels', 'هوگو بوس': 'Hugo Boss'
};
function brandEn(b) {
  if (BRAND_EN[b[0]]) return BRAND_EN[b[0]];
  var lat = b[1].split('|').filter(function (t) { return /^[a-z0-9 ]+$/.test(t); })[0];
  return lat ? titleEn(lat.split(' ')) : '';
}

/* ---------- برندها ----------
   [نام نمایشی، نام‌های دیگر (فارسی و انگلیسی) جدا با | ]. تشخیص برند: اول دسته‌بندیِ خودِ سایت، بعد واژه‌های نامِ عطر. */
var BRAND_LIST = [
['شنل', 'شنل|شانل|chanel'], ['دیور', 'دیور|کریستین دیور|کریستیان دیور|christian dior|dior'], ['گوچی', 'گوچی|گوچ|gucci'], ['ورساچه', 'ورساچه|ورساچی|ورزاچه|versace'],
['جورجیو آرمانی', 'جورجیو آرمانی|جورجیو ارمانی|جورجو آرمانی|جورجیو|آرمانی|ارمانی|giorgio armani|armani'], ['امپریو آرمانی', 'امپریو آرمانی|امپریو ارمانی|emporio armani'],
['ایو سن لوران', 'ایو سن لوران|ایو سن لورن|ایو سنت لوران|ایو سنت لورن|وای اس ال|سن لوران|سنت لوران|ایوسن لوران|yves saint laurent|yves st laurent|saint laurent|ysl|y s l'],
['تام فورد', 'تام فورد|تامفورد|tom ford'], ['پاکو رابان', 'پاکو رابان|پاکو رابانه|پاکورابان|paco rabanne|rabanne|رابان'],
['ژان پل گوتیه', 'ژان پل گوتیه|ژان پل گوتیر|ژان پل گولتیه|ژانپل گوتیه|jean paul gaultier|gaultier|jpg'], ['دولچه و گابانا', 'دولچه اند گابانا|دولچه و گابانا|دولچه گابانا|دلچه گابانا|دولچه|گابانا|دی اند جی|dolce gabbana|dolce and gabbana|dolce|d g|dg'],
['کالوین کلین', 'کالوین کلین|کلوین کلین|کلواین کلین|calvin klein|ck'], ['هوگو بوس', 'هوگو بوس|هیوگو بوس|بوس|hugo boss|boss'], ['باربری', 'باربری|burberry'],
['بولگاری', 'بولگاری|بلگاری|بولغاری|bvlgari|bulgari'], ['کارولینا هررا', 'کارولینا هررا|کارولینا هرارا|کارولینا هریرا|هررا|carolina herrera'],
['ژیوانشی', 'ژیوانشی|ژیواتشی|جیوانچی|جیوانشی|ژیوانچی|givenchy'], ['لانکوم', 'لانکوم|لنکوم|لانکم|lancome'], ['کرید', 'کرید|creed'], ['مونت بلانک', 'مونت بلانک|مون بلان|مونت بلان|montblanc|mont blanc'],
['آزارو', 'آزارو|ازارو|azzaro'], ['دیویدوف', 'دیویدوف|دیوید اف|davidoff'], ['هرمس', 'هرمس|هرمز|hermes'], ['لاگوست', 'لاگوست|لاکوست|lacoste'],
['نینا ریچی', 'نینا ریچی|نینا ریشی|نینا ریچ|nina ricci'], ['ایسی میاکی', 'ایسی میاکی|ایسه میاکه|ایسی میاکه|میاکی|issey miyake|miyake'], ['کنزو', 'کنزو|kenzo'],
['جو مالون', 'جو مالون|جومالون|jo malone'], ['مزون فرانسیس کورکجان', 'مزون فرانسیس کورکجان|فرانسیس کورکجان|فرانسیس کرکجان|کورکجان|maison francis kurkdjian|francis kurkdjian|mfk'],
['اینیتیو', 'اینیتیو|اینیشیو|initio'], ['پارفومز د مارلی', 'پارفومز د مارلی|پارفوم د مارلی|د مارلی|دمارلی|مارلی|parfums de marly|de marly|marly|pdm'], ['زرجوف', 'زرجوف|زرجف|زیرجوف|xerjoff'],
['آمواج', 'آمواج|امواج|amouage'], ['بایردو', 'بایردو|بیردو|byredo'], ['لو لابو', 'لو لابو|لولابو|le labo'], ['نیشانه', 'نیشانه|nishane'], ['فردریک مال', 'فردریک مال|frederic malle'],
['روژا', 'روژا|روجا|roja parfums|roja'], ['پنهالیگونز', 'پنهالیگونز|پنهالیگون|پنهالیگانز|penhaligons|penhaligon'], ['ممو', 'ممو پاریس|memo paris'],
['مانسرا', 'مانسرا|منسرا|مانسیرا|mancera'], ['مونتال', 'مونتال|montale'], ['آرماف', 'آرماف|ارماف|armaf'], ['لطافه', 'لطافه|لطافة|lattafa'], ['رصاصی', 'رصاصی|رساسی|rasasi'],
['افنان', 'افنان|afnan'], ['الحرمین', 'الحرمین|الحرمين|al haramain'], ['اجمل', 'اجمل|ajmal'], ['سوئیس عربین', 'سوئیس عربین|سوییس عربین|swiss arabian'], ['زارا', 'زارا|zara'],
['آریانا گرانده', 'آریانا گرانده|اریانا گرانده|ariana grande'], ['پرادا', 'پرادا|prada'], ['والنتینو', 'والنتینو|valentino'],
['ویکتور اند رولف', 'ویکتور اند رولف|ویکتور و رولف|ویکتور رولف|viktor rolf|viktor and rolf'], ['تیری موگلر', 'تیری موگلر|تیری موگلر|موگلر|thierry mugler|mugler'],
['نارسیسو رودریگز', 'نارسیسو رودریگز|نارسیسو رودریگیز|narciso rodriguez'], ['مارک جیکوبز', 'مارک جیکوبز|مارک جکوبز|marc jacobs'], ['مایکل کورس', 'مایکل کورس|michael kors'],
['رالف لورن', 'رالف لورن|رالف لارن|ralph lauren'], ['تامی هیلفیگر', 'تامی هیلفیگر|تامی هیلفیگر|تامی|tommy hilfiger|tommy'], ['جیمی چو', 'جیمی چو|jimmy choo'], ['بنتلی', 'بنتلی|bentley'],
['مرسدس بنز', 'مرسدس بنز|مرسدس|mercedes benz'], ['کلوئه', 'کلوئه|کلویی|chloe'], ['کاشارل', 'کاشارل|cacharel'], ['گرلن', 'گرلن|گیرلن|گرلین|guerlain'],
['کلایو کریستین', 'کلایو کریستین|clive christian'], ['تیزیانا ترنزی', 'تیزیانا ترنزی|تیزیانا ترنتزی|tiziana terenzi'], ['ناسوماتو', 'ناسوماتو|nasomatto'], ['کیلیان', 'کیلیان|بای کیلیان|kilian|by kilian'],
['آکوا دی پارما', 'آکوا دی پارما|اکوا دی پارما|acqua di parma'], ['اکس نیهیلو', 'اکس نیهیلو|اکس نیهیلو|ex nihilo'], ['مزون مارجیلا', 'مزون مارجیلا|مارتین مارجیلا|مارجیلا|maison margiela|martin margiela|margiela'],
['دیپتیک', 'دیپتیک|diptyque'], ['بوشرون', 'بوشرون|boucheron'], ['کارتیه', 'کارتیه|cartier'], ['ون کلیف', 'ون کلیف|van cleef'], ['سالواتوره فراگامو', 'سالواتوره فراگامو|فراگامو|ferragamo'],
['موسکینو', 'موسکینو|moschino'], ['روبرتو کاوالی', 'روبرتو کاوالی|کاوالی|roberto cavalli|cavalli'], ['تروساردی', 'تروساردی|trussardi'], ['الی ساب', 'الی ساب|elie saab'],
['لالیک', 'لالیک|lalique'], ['لانوین', 'لانوین|lanvin'], ['اسکادا', 'اسکادا|escada'], ['دانهیل', 'دانهیل|دانهل|dunhill'], ['جوپ', 'جوپ|joop'], ['آدیداس', 'آدیداس|adidas'], ['ناتیکا', 'ناتیکا|nautica'],
['پلی بوی', 'پلی بوی|playboy'], ['لومانی', 'لومانی|lomani'], ['ژاک بوگارت', 'ژاک بوگارت|jacques bogart'], ['تاور', 'تاور|tauer perfumes|tauer'], ['بریتنی اسپیرز', 'بریتنی اسپیرز|britney spears'],
['جنیفر لوپز', 'جنیفر لوپز|jennifer lopez'], ['الکساندر جی', 'الکساندر جی|alexandre j'], ['اورتو پاریسی', 'اورتو پاریسی|orto parisi'], ['باند نامبر ۹', 'باند نامبر 9|bond no 9'],
['ماریاژ', 'ماریاژ|mariage freres'], ['آتلیه کلن', 'آتلیه کلن|atelier cologne'], ['ژولیت هو ا گان', 'ژولیت هو ا گان|juliette has a gun'], ['سرج لوتنس', 'سرج لوتنس|serge lutens'],
['هالستون', 'هالستون|halston'], ['کنت کول', 'کنت کول|kenneth cole'], ['بی کی', 'بی کی|bebe'], ['ویکتوریا سکرت', 'ویکتوریا سکرت|victoria secret|victorias secret|victoria s secret'],
['نوبایا', 'نوبایا|nobaya'], ['ادینگتون', 'ادینگتون|edington'],
['لویی ویتون', 'لویی ویتون|لوئی ویتون|لویس ویتون|louis vuitton'], ['ایو روشه', 'ایو روشه|ایو روشر|yves rocher'], ['تیفانی', 'تیفانی|تیفانی اند کو|tiffany'], ['فندی', 'فندی|fendi'],
['بالنسیاگا', 'بالنسیاگا|بالنسیاگا|balenciaga'], ['لووه', 'لووه|لوئه|loewe'], ['میزون الهمبرا', 'میزون الهمبرا|مایزون الهمبرا|maison alhambra'], ['الرحاب', 'الرحاب|الرحب|al rehab'],
['فرانک الیور', 'فرانک الیور|franck olivier'], ['ارد الزعفران', 'ارد الزعفران|ard al zaafaran'], ['الیزابت آردن', 'الیزابت آردن|الیزابت اردن|elizabeth arden'],
['استی لودر', 'استی لودر|استی لاودر|estee lauder'], ['کلینیک', 'کلینیک|clinique'], ['سالوادور دالی', 'سالوادور دالی|salvador dali'], ['آنتونیو باندراس', 'آنتونیو باندراس|antonio banderas'],
['شکیرا', 'شکیرا|shakira'], ['بیانسه', 'بیانسه|beyonce'], ['ریحانا', 'ریحانا|rihanna'], ['پاریس هیلتون', 'پاریس هیلتون|paris hilton'], ['کیم کارداشیان', 'کیم کارداشیان|kim kardashian'],
['لیدی گاگا', 'لیدی گاگا|lady gaga'], ['ژاکومو', 'ژاکومو|jacomo'], ['چروتی', 'چروتی|cerruti'], ['روشاس', 'روشاس|rochas'], ['زادیگ و ولتر', 'زادیگ و ولتر|zadig voltaire|zadig and voltaire'],
['تام تیلور', 'تام تیلور|tom tailor']
];
function brandNorm(s) {
  var t = normFa(s, true).replace(/[^؀-ۿa-z0-9\s]/g, ' ');
  return t.split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); });
}
var BR = null;
function brandTable() {
  if (BR) return BR;
  BR = { list: [], byName: {}, tok: {} };
  BRAND_LIST.forEach(function (b) {
    var id = 'b' + hash(b[0]), ent = { id: id, name: b[0], al: [], en: brandEn(b) };
    var CN = nameDict().canon;
    b[1].split('|').forEach(function (a) {
      var tk = brandNorm(a).map(function (w) { return CN[w] ? CN[w] : w; }); if (!tk.length) return;
      ent.al.push(tk); BR.byName[tk.join(' ')] = ent; tk.forEach(function (w) { BR.tok[w] = 1; });
      var fa = tk.some(function (w) { return /[؀-ۿ]/.test(w); });
      if (fa && !ent.canFa) ent.canFa = tk; else if (!fa && !ent.canEn) ent.canEn = tk;     // نخستین نامِ هر خط = نامِ استاندارد
    });
    ent.al.sort(function (x, y) { return y.length - x.length; });
    BR.list.push(ent);
  });
  return BR;
}
/* عبارت‌هایی که نامِ برند بخشِ نامِ خودِ عطر است و نباید برداشته شود */
var PROT = [['میس', 'دیور'], ['بلو', 'دو', 'شنل'], ['تر', 'دو', 'هرمس'], ['ترا', 'دو', 'هرمس'], ['بلو', 'دو', 'شانل'], ['miss', 'dior'], ['gucci', 'gucci'], ['گوچی', 'گوچی'], ['hugo', 'hugo'], ['tommy', 'tommy'], ['تامی', 'تامی'], ['bleu', 'de', 'chanel'], ['blue', 'de', 'chanel']];
function protMask(toks) {
  var m = {};
  PROT.forEach(function (p) {
    for (var i = 0; i + p.length <= toks.length; i++) {
      var ok = true; for (var j = 0; j < p.length; j++) if (toks[i + j] !== p[j]) { ok = false; break; }
      if (ok) for (var k = 0; k < p.length; k++) m[i + k] = 1;
    }
  });
  return m;
}
/* همه‌ی جاهایی که al در toks آمده و با جای محافظت‌شده هم‌پوشانی ندارد را برمی‌دارد */
function stripSeqs(toks, extra, al) {
  var out = toks, i = 0;
  while (true) {
    var pm = protMask(out), p = -1;
    for (i = 0; i + al.length <= out.length; i++) {
      var ok = true; for (var j = 0; j < al.length; j++) if (out[i + j] !== al[j] || pm[i + j]) { ok = false; break; }
      if (ok) { p = i; break; }
    }
    if (p < 0) return out;
    out = out.slice(0, p).concat(out.slice(p + al.length));
  }
}
function seqAt(toks, al) {
  for (var i = 0; i + al.length <= toks.length; i++) {
    var ok = true; for (var j = 0; j < al.length; j++) if (toks[i + j] !== al[j]) { ok = false; break; }
    if (ok) return i;
  }
  return -1;
}
/* هر شکلِ نوشتنِ برند (کریستین دیور، دیور؛ سن لوران، ایو سن لوران) در کلید به یک شکل درمی‌آید تا یک عطر از چند سایت یک گروه شود */
function canonBrand(key) {
  var T = brandTable(), pm = protMask(key), best = null;
  T.list.forEach(function (b) {
    b.al.forEach(function (al) {
      for (var i = 0; i + al.length <= key.length; i++) {
        var ok = true; for (var j = 0; j < al.length; j++) if (key[i + j] !== al[j] || pm[i + j]) { ok = false; break; }
        if (ok) { if (!best || i < best.p || (i === best.p && al.length > best.n)) best = { b: b, p: i, n: al.length, al: al }; break; }
      }
    });
  });
  if (!best) return key;
  var fa = best.al.some(function (w) { return /[؀-ۿ]/.test(w); }), can = fa ? best.b.canFa : best.b.canEn;
  if (!can || can.join(' ') === best.al.join(' ')) return key;
  var lead = can.length - best.al.length, p0 = best.p, n0 = best.n;
  if (lead > 0 && best.al.join(' ') === can.slice(lead).join(' ') && p0 >= lead) {      // «پکو رابان»: ابتدای نام برند با املای دیگر نوشته شده، نه واژه‌ی اضافه
    var okp = true; for (var q = 0; q < lead; q++) if (!tokEq(key[p0 - lead + q], can[q])) { okp = false; break; }
    if (okp) { p0 -= lead; n0 += lead; }
  }
  return key.slice(0, p0).concat(can, key.slice(p0 + n0));
}
/* برندِ یک گروه: ۱) دسته‌بندیِ سایت ۲) واژه‌های نام ۳) «سایر». خروجی: {id,name,strip:[واژه‌های برند داخل نام]} */
function junkTok(w) { var n = normFa(w); return !n || YEAR_RE.test(n) || /^\d{5,}$/.test(n) || !!STOP[n]; }
function cleanBrandName(h) {                      // نامِ برندِ گرفته‌شده از دسته‌بندیِ سایت: سال و واژه‌ی تبلیغاتی و کد نمی‌خواهد
  return String(h).split(/\s+/).filter(function (w) { return w && !junkTok(w); }).join(' ').replace(/\s*&\s*/g, ' & ').trim();
}
function brandOf(key, hints) {
  var T = brandTable(), ent = null, unk = null;
  (hints || []).some(function (h) {
    h = cleanBrandName(h);
    var tk = brandNorm(h); if (!tk.length || !meaningful(tk)) return false;
    var e = T.byName[tk.join(' ')];
    if (!e) {                                           // «Dior (دیور)»: هر بخش (فارسی/لاتین) جدا امتحان شود
      var fp = tk.filter(function (w) { return /[؀-ۿ]/.test(w); }), lp = tk.filter(function (w) { return !/[؀-ۿ]/.test(w); });
      if (fp.length && lp.length) e = T.byName[fp.join(' ')] || T.byName[lp.join(' ')];
    }
    if (!e) T.list.some(function (b) { return b.al.some(function (al) { return al.length >= 2 && seqAt(tk, al) >= 0; }) && (e = b); });
    if (e) { ent = e; return true; }
    if (!unk) {
      var ftk = tk.filter(function (w) { return /[؀-ۿ]/.test(w); }), ltk = tk.filter(function (w) { return !/[؀-ۿ]/.test(w); });
      if (ftk.length && ltk.length) unk = { id: 'h' + hash(tk.join(' ')), name: ftk.join(' '), en: titleEn(ltk), al: [ftk, ltk] };   // «Louis Vuitton | لویی ویتون»
      else unk = { id: 'h' + hash(tk.join(' ')), name: String(h), al: [tk] };
    }
    return false;
  });
  if (!ent) {
    var best = null;
    T.list.forEach(function (b) {
      b.al.forEach(function (al) { var p = seqAt(key, al); if (p >= 0 && (!best || p < best.p || (p === best.p && al.length > best.n))) best = { b: b, p: p, n: al.length }; });
    });
    if (best) ent = best.b;
  }
  if (!ent && unk) ent = unk;
  if (!ent) return { id: 'other', name: 'سایر برندها', al: [] };
  return ent;
}
/* همه‌ی نام‌های برند (کوتاه و بلند) از واژه‌های عطر برداشته می‌شود؛ هر چند بار که آمده باشد */
function stripBrand(toks, ent) {
  var out = toks.slice();
  (ent.al || []).forEach(function (al) { out = stripSeqs(out, null, al); });
  return out;
}
function stripName(name, ent) {
  var w = String(name).split(/\s+/).filter(Boolean), nt = w.map(function (x) { return brandNorm(x).join(' '); }), keep = w.map(function () { return true; });
  var out = nt.slice(); (ent.al || []).forEach(function (al) { out = stripSeqs(out, null, al); });
  // همان حذف‌ها روی خودِ واژه‌های نمایشی (به ترتیب)
  var r = [], k = 0; w.forEach(function (x, i) { if (k < out.length && nt[i] === out[k]) { r.push(x); k++; } });
  return r.join(' ');
}
var GORD = { m: 0, w: 1, u: 2, '': 3 }, CORD = { 'ادوپرفیوم': 0, 'ادوتویلت': 1, 'ادوکلن': 2, 'اکستریت': 3, 'پرفیوم': 4, '': 5 };
function zOf(L, EN) { return L === '#' || (!EN && L === 'A') ? 1 : 0; }
function cmpNm(a, b) { return ((a.z | 0) - (b.z | 0)) || cmpName(a.name, b.name); }
/* فهرست برند ← مدل ← نوع (جنسیت/غلظت) ← اندازه و قیمت. groups خروجی buildList است */
function pickEn(g) {
  var best = '', c = 0; Object.keys(g.en || {}).forEach(function (k) { if (g.en[k] > c || (g.en[k] === c && k.length > best.length)) { best = k; c = g.en[k]; } });
  return best ? best.split(' ') : null;
}
var HAS_FA = /[؀-ۿ]/;
/* نام نمایشیِ عطر (بدون برند) به زبان خواسته‌شده */
function modelName(g, ent, EN, lex) {
  var fa = HAS_FA.test(g.key.join(' '));
  if (EN) {
    var faRest = fa ? stripBrand(g.key, ent) : null, tk = pickEn(g);
    if (tk) {
      var rest = stripBrandEn(tk, ent);
      if (rest.length && (!faRest || rest.length >= Math.ceil(faRest.length * 0.6))) return titleEn(rest);
    }
    if (fa) return fa2en(faRest && faRest.length ? faRest : g.key, lex);
    var r2 = stripBrandEn(g.key, ent); return titleEn(r2.length ? r2 : g.key);
  }
  if (HAS_FA.test(g.name)) return stripName(g.name, ent);
  var r3 = stripBrandEn(g.key, ent);
  return en2fa(r3.length ? r3 : g.key, lex);
}
/* همه‌ی واژه‌ها به خطِ زبان انتخابی درمی‌آیند (تا در فهرست فارسی حرفِ A و در انگلیسی حرفِ فارسی نیاید) */
function purify(name, EN, lex) {
  var ch = false, out = String(name).split(/\s+/).filter(Boolean).map(function (w) {
    if (EN) { if (HAS_FA.test(w)) { ch = true; return fa2en(brandNorm(w), lex); } return w; }
    if (/[A-Za-z]/.test(w)) { ch = true; var lt = w.toLowerCase().replace(/[^a-z0-9']/g, ''); return lt ? en2fa([lt], lex) : w; }
    return w;
  });
  return ch ? out.join(' ') : name;
}
function brandName(ent, EN, lex) {
  if (ent.id === 'other') return EN ? 'Other brands' : 'سایر برندها';
  if (!EN) return purify(ent.name, false, lex);
  return purify(ent.en || fa2en(brandNorm(ent.name), lex), true, lex);
}
/* فهرست برند ← مدل ← نوع (جنسیت/غلظت) ← اندازه و قیمت. groups خروجی buildList است.
   lang: 'fa' | 'en' (نام و حرف‌ها)؛ ساختار در هر دو زبان یکی است. lex: واژه‌های یادگرفته (db.wd) */
var EPON = {}; ['کلوئه', 'جیمی چو', 'نینا ریچی', 'پاکو رابان', 'هوگو بوس', 'بولگاری', 'نارسیسو رودریگز', 'گوچی'].forEach(function (n) { EPON[n] = 1; });
function tree(groups, lang, lex) {
  setLex(lex);
  var EN = lang === 'en';
  var B = {}, M = {}, ENT = groups.map(function (g) { return brandOf(g.key, g.br); }), learn = {};
  /* برندِ ناشناخته با نامِ انگلیسی (مثلاً از دسته‌بندیِ سایت): نامِ فارسی‌اش از بیشترین واژه‌های مشترکِ اولِ نامِ عطرها یاد گرفته می‌شود؛
     اگر نشد، واج‌نویسی می‌شود؛ برندِ تک‌عطری زیر «سایر برندها» می‌رود. */
  ENT.forEach(function (e, i) { if (e.id.charAt(0) === 'h' && !HAS_FA.test(e.name)) (learn[e.id] = learn[e.id] || []).push(i); });
  Object.keys(learn).forEach(function (id) {
    var ix = learn[id], pre = null, e0 = ENT[ix[0]], enName = titleEn(e0.al[0] || brandNorm(e0.name));
    if (ix.length >= 2) ix.forEach(function (i) {
      var k = groups[i].key; if (!pre) { pre = k.slice(0, 3); return; }
      var n = 0; while (n < pre.length && n < k.length && pre[n] === k[n]) n++; pre = pre.slice(0, n);
    });
    var ent;
    if (pre && pre.length && pre.every(function (w) { return HAS_FA.test(w); })) ent = { id: id, name: pre.join(' '), al: [pre], en: enName };
    else ent = { id: id, name: en2fa(e0.al[0] || brandNorm(e0.name), lex), al: [], en: enName };
    ix.forEach(function (i) { ENT[i] = ent; });
  });
  /* پایش ۱: برندهای هم‌معنی یکی می‌شوند («Dior (دیور)» از دسته‌بندیِ سایت = «دیور» از فرهنگ برندها؛ دو برندِ ناشناخته با یک نام) */
  var T = brandTable(), AUD = { bare: [], brands: [], models: [], n: groups.length }, bySeen = {};
  ENT = ENT.map(function (e) {
    if (e.id.charAt(0) !== 'h') return e;
    var ks = [e.name ? brandNorm(e.name).join(' ') : '', e.en ? brandNorm(e.en).join(' ') : ''].filter(Boolean), to = null;
    ks.some(function (k) { if (T.byName[k]) { to = T.byName[k]; return true; } if (bySeen[k]) { to = bySeen[k]; return true; } return false; });
    if (!to) { ks.forEach(function (k) { bySeen[k] = e; }); return e; }
    if (to.id !== e.id && AUD.brands.indexOf(e.name) < 0) AUD.brands.push(e.name + ' ← ' + (to.name || to.en));
    return to;
  });
  var BN = {};
  groups.forEach(function (g, gi) {
    var ent = ENT[gi];
    var rest = ent.id === 'other' ? g.key.slice() : stripBrand(g.key, ent);
    /* پایش ۲: عطری که بعد از برداشتنِ نامِ برند چیزی از نامش نمی‌ماند، نام ندارد؛ نشان داده نمی‌شود */
    if ((!rest.length || !rest.join('').length) && EPON[ent.name]) rest = g.key.slice();     // عطری که اسمش همان نام برند است (Chloé، Jimmy Choo، Nina Ricci…)
    if (!rest.length || !rest.join('').length) { if (AUD.bare.length < 40) AUD.bare.push(g.name); AUD.nb = (AUD.nb || 0) + 1; return; }
    var mk = rest.join(' ');
    var bnm = BN[ent.id] || (BN[ent.id] = brandName(ent, EN, lex));
    var b = B[ent.id] = B[ent.id] || { id: ent.id, name: bnm, models: [], mm: {} };
    var m = b.mm[mk];
    if (!m) {
      m = b.mm[mk] = { id: ent.id + '.' + hash(mk), name: '', variants: [], cnt: {}, brand: b.name, rk: rest };
      b.models.push(m);
    }
    m.variants.push(g);
    var shown = purify(modelName(g, ent, EN, lex), EN, lex);
    m.cnt[shown || g.name] = (m.cnt[shown || g.name] || 0) + g.sizes.length;
  });
  var brands = Object.keys(B).map(function (k) { return B[k]; });
  brands.forEach(function (b) {
    delete b.mm;
    mergeModels(b, AUD);
    b.models.forEach(function (m) {
      var best = ''; Object.keys(m.cnt).forEach(function (n) { if (!best || m.cnt[n] > m.cnt[best] || (m.cnt[n] === m.cnt[best] && (lead(n) < lead(best) || (lead(n) === lead(best) && n.length < best.length)))) best = n; });
      m.name = best; m.L = letterOf(best, lang); m.z = zOf(m.L, EN); delete m.cnt;
      m.variants.sort(function (x, y) { return (GORD[x.gn] - GORD[y.gn]) || (CORD[x.conc] - CORD[y.conc]); });
      var first = m.variants.filter(function (v) { return v.img; })[0] || m.variants[0];
      m.img = first.img || ''; m.big = first.big || first.img || ''; m.imgId = first.id;
      var gs = []; m.variants.forEach(function (v) { if (v.gn && gs.indexOf(v.gn) < 0) gs.push(v.gn); });
      m.gset = gs;
    });
    mergeSameName(b, AUD);
    inspectBrand(b, AUD);
    b.models.sort(cmpNm);
    b.L = b.id === 'other' ? '#' : letterOf(b.name, lang); b.z = zOf(b.L, EN);
    var fm = b.models.filter(function (m) { return m.img; })[0] || b.models[0];
    b.img = fm.img; b.big = fm.big; b.imgId = fm.imgId;
  });
  brands.sort(function (a, b) {
    if (a.id === 'other') return 1; if (b.id === 'other') return -1;
    return cmpNm(a, b);
  });
  brands = brands.filter(function (b) { return b.models.length; });
  brands.audit = AUD;
  return brands;
}
/* بازرس: بعد از همه‌ی ادغام‌ها، مدل‌هایی که هنوز شبیه هم‌اند (قیمتشان نمی‌خواند یا نوعشان تکراری است) «مشکوک» ثبت می‌شوند
   تا در گزارش دیده شوند؛ و نامِ بی‌معنی ثبت می‌شود */
function inspectBrand(b, AUD) {
  var ms = b.models, i, j;
  AUD.checked = (AUD.checked | 0) + ms.length;
  for (i = 0; i < ms.length; i++) {
    var nm = ms[i].name || '';
    if (!nm || /^[\d\s]+$/.test(nm) && nm.replace(/\s/g, '').length > 3) { AUD.njunk = (AUD.njunk | 0) + 1; if ((AUD.junk = AUD.junk || []).length < 20) AUD.junk.push(b.name + ': ' + nm); }
    for (j = i + 1; j < ms.length; j++) {
      if (ms[i].name === ms[j].name || nameLike(ms[i].rk, ms[j].rk)) {
        AUD.nsus = (AUD.nsus | 0) + 1;
        if ((AUD.sus = AUD.sus || []).length < 30) AUD.sus.push(b.name + ': ' + ms[i].name + ' ≈ ' + ms[j].name);
      }
    }
  }
}
/* پایش ۴: دو مدلِ یک برند با نامِ نمایشیِ یکسان (مثلاً یکی از عنوانِ فارسی و یکی از لاتین) یکی می‌شوند، مگر نوع/جنسیتشان تکراری باشد */
function mergeSameName(b, AUD) {
  var by = {}, gone = {};
  b.models.forEach(function (m, i) {
    var k = m.name; if (!k) return;
    if (by[k] == null) { by[k] = i; return; }
    var A = b.models[by[k]], kk = {}, clash = false;
    A.variants.forEach(function (v) { kk[v.gn + '|' + v.conc] = 1; });
    m.variants.forEach(function (v) { if (kk[v.gn + '|' + v.conc]) clash = true; });
    if (clash) {                                             // نامِ نمایشیِ یکسان + نوع/جنسیتِ یکسان + قیمتِ هم‌خوان = یک عطرِ دو بار آمده؛ اندازه‌ها یکی می‌شوند
      if (!modelPriceMatch(A, m)) return;
      m.variants.forEach(function (v) {
        var tv = null; A.variants.forEach(function (x) { if (x.gn === v.gn && x.conc === v.conc) tv = x; });
        if (!tv) { A.variants.push(v); return; }
        v.sizes.forEach(function (z) {
          var hit = null; tv.sizes.forEach(function (y) { if (y.ml === z.ml) hit = y; });
          if (!hit) tv.sizes.push(z); else if ((z.n | 0) > (hit.n | 0)) tv.sizes[tv.sizes.indexOf(hit)] = z;
        });
        tv.sizes.sort(function (x, y) { return x.ml - y.ml; });
      });
      AUD.nmod = (AUD.nmod || 0) + 1; if (AUD.models.length < 40) AUD.models.push(b.name + ': ' + m.name + ' (دوبار آمده بود)');
      gone[i] = 1; return;
    }
    m.variants.forEach(function (v) { A.variants.push(v); });
    A.variants.sort(function (x, y) { return (GORD[x.gn] - GORD[y.gn]) || (CORD[x.conc] - CORD[y.conc]); });
    var gs2 = []; A.variants.forEach(function (v) { if (v.gn && gs2.indexOf(v.gn) < 0) gs2.push(v.gn); }); A.gset = gs2;
    AUD.nmod = (AUD.nmod || 0) + 1; if (AUD.models.length < 40) AUD.models.push(b.name + ': ' + m.name + ' ← ' + A.name);
    gone[i] = 1;
  });
  if (Object.keys(gone).length) b.models = b.models.filter(function (m, i) { return !gone[i]; });
}
/* پایش ۳: دو مدلِ هم‌نام که فقط املایشان فرق دارد (و قیمت‌هایشان به هم می‌خورد و نوع/جنسیتشان تکراری نیست) یکی می‌شوند */
function modelPriceMatch(a, b) {
  var pa = [], pb = [];
  a.variants.forEach(function (v) { v.sizes.forEach(function (z) { pa.push(z); }); });
  b.variants.forEach(function (v) { v.sizes.forEach(function (z) { pb.push(z); }); });
  return pa.some(function (x) { return pb.some(function (y) { var r = (y.price / y.ml) / (x.price / x.ml); return x.ml === y.ml ? priceOK(y.price / x.price, .8, 1.25) : priceOK(r, .65, 1.55); }); });
}
function mergeModels(b, AUD) {
  var ms = b.models, gone = {};
  for (var i = 0; i < ms.length; i++) {
    if (gone[i]) continue;
    for (var j = i + 1; j < ms.length; j++) {
      if (gone[j]) continue;
      var A = ms[i], C = ms[j];
      if (!nameLike(A.rk, C.rk)) continue;
      var kk = {}, clash = false;
      A.variants.forEach(function (v) { kk[v.gn + '|' + v.conc] = 1; });
      C.variants.forEach(function (v) { if (kk[v.gn + '|' + v.conc]) clash = true; });
      if (clash || !modelPriceMatch(A, C)) continue;
      C.variants.forEach(function (v) { A.variants.push(v); });
      Object.keys(C.cnt).forEach(function (n) { A.cnt[n] = (A.cnt[n] || 0) + C.cnt[n]; });
      AUD.nmod = (AUD.nmod || 0) + 1;
      if (AUD.models.length < 40) AUD.models.push(b.name + ': ' + Object.keys(C.cnt)[0] + ' ← ' + Object.keys(A.cnt)[0]);
      gone[j] = 1;
    }
  }
  b.models = ms.filter(function (m, k) { return !gone[k]; });
}

/* ---------- حافظه‌ی دائمی نام‌ها (db) ----------
   db.g[gid] = {k:[توکن‌ها], c:غلظت, gn:جنسیت, nm:{نام:تعداد}, im:{منبع:آدرس عکس}}   ← نام عطرها؛ هیچ‌وقت پاک نمی‌شود
   db.it[src][pid] = [عنوان, قیمت(تومان؛ ۰=ناموجود), gid(۰=عطر نیست), میل]            ← محصولاتِ هر سایت
   db.full[src] = زمان آخرین دریافت کاملِ موفق ؛ db.t[src] = آخرین دریافت موفق ؛ db.sc[src] = مقیاس قیمت */
function newDb() { return { v: 3, g: {}, it: {}, full: {}, t: {}, sc: {}, wd: {} }; }
function dbIndex(db) {
  var idx = new Index();
  Object.keys(db.g).forEach(function (id) { var g = db.g[id]; idx.add({ id: id, key: g.k }); });
  return idx;
}
function gview(db) {
  var G = {};
  Object.keys(db.g).forEach(function (id) { var g = db.g[id]; G[id] = { id: id, key: g.k, conc: g.c, gn: g.gn || '' }; });
  return G;
}
function pricesByGroup(db) {
  var by = {};
  Object.keys(db.it).forEach(function (s) {
    var sc = (db.sc && db.sc[s]) || 1, m = db.it[s];
    Object.keys(m).forEach(function (pid) { var e = m[pid]; if (e[2] && e[1] > 0) (by[e[2]] = by[e[2]] || []).push({ ml: e[3], p: e[1] * sc }); });
  });
  return by;
}
function mergeEn(t, f) { Object.keys(f || {}).forEach(function (k) { t[k] = (t[k] || 0) + f[k]; }); }
function moveGroup(db, from, to) {
  Object.keys(db.it).forEach(function (s) { var m = db.it[s]; Object.keys(m).forEach(function (pid) { if (m[pid][2] === from) m[pid][2] = to; }); });
  var f = db.g[from], t = db.g[to];
  Object.keys(f.nm).forEach(function (n) { t.nm[n] = (t.nm[n] || 0) + f.nm[n]; });
  Object.keys(f.im || {}).forEach(function (s) { t.im = t.im || {}; if (!t.im[s]) t.im[s] = f.im[s]; });
  Object.keys(f.bi || {}).forEach(function (s) { t.bi = t.bi || {}; if (!t.bi[s]) t.bi[s] = f.bi[s]; });
  if (f.en) mergeEn(t.en = t.en || {}, f.en);
  (f.br || []).forEach(function (h) { t.br = t.br || []; if (t.br.indexOf(h) < 0 && t.br.length < 4) t.br.push(h); });
  delete db.g[from];
}
/* گروهی که این آیتم باید به آن بپیوندد؛ null = گروه تازه */
function resolve(db, idx, G, byG, p, price, src) {
  function collect(fuzz) {
    var L = [];
    idx.cands(p.key, fuzz).forEach(function (id) {
      var g = G[id]; if (!g) return;
      var nm = nameCmp(p.key, g.key); if (!nm) return;
      var cc = concCmp(p.conc, g.conc); if (!cc) return;
      var gg = genCmp(p.gn, g.gn); if (!gg) return;
      if ((p.conc !== '' && g.conc === '') || (p.gn !== '' && g.gn === '')) return;   // به گروهِ «مبهم‌تر» نمی‌پیوندیم؛ آن گروه بعداً در reconcile به این می‌پیوندد
      L.push({ id: id, nm: nm, cc: cc, gg: gg });
    });
    return L;
  }
  var L = collect(false), full = L.filter(function (x) { return x.nm === 2 && x.cc === 2 && x.gg === 2; });
  if (full.length) return full[0].id;
  L = collect(true);                                 // املای متفاوت را فقط وقتی دنبال می‌کنیم که تطبیق دقیق نبود
  if (!L.length) return null;
  var vars = scaleVars(db, src, price);
  /* املای متفاوت فقط وقتی یکی می‌شود که غلظت یا جنسیتِ صریح هم یکی باشد؛ شباهتِ قیمت به‌تنهایی کافی نیست */
  L = L.filter(function (x) { return (x.cc === 2 && p.conc !== '') || (x.gg === 2 && p.gn !== ''); });
  var cor = L.filter(function (x) { return corrob(byG[x.id], p.ml, vars); });
  return cor.length === 1 ? cor[0].id : null;     // مبهم یا ناهم‌خوان → هرگز حدس نمی‌زنیم
}
/* گروه‌های دارای ویژگی نامشخص (غلظت/جنسیت) که یک هم‌نامِ مشخص‌تر دارند و قیمتشان فقط با یکی از آن‌ها جور است، به همان بپیوندند */
function reconcile(db, idx) {
  setLex(db.wd);
  var G = gview(db), byG = pricesByGroup(db), moved = 0, SM = {};
  Object.keys(db.it).forEach(function (sr) { var m = db.it[sr]; Object.keys(m).forEach(function (pid) { var e = m[pid]; if (e[2]) (SM[e[2]] = SM[e[2]] || {})[sr + '|' + e[3]] = 1; }); });
  Object.keys(G).forEach(function (hid) {
    var H = G[hid]; if (!H || !(H.conc === '' || H.gn === '')) return;
    var hp = byG[hid]; if (!hp || !hp.length) return;
    var sib = idx.cands(H.key, true).filter(function (id) {
      var S = G[id]; if (!S || id === hid) return false;
      var nmc = nameCmp(H.key, S.key); if (!nmc || (nmc === 1 && !((H.conc !== '' && H.conc === S.conc) || (H.gn !== '' && H.gn === S.gn)))) return false;
      if (!concCmp(H.conc, S.conc) || !genCmp(H.gn, S.gn)) return false;
      return (H.conc === '' || S.conc !== '') && (H.gn === '' || S.gn !== '') && (S.conc !== '' || S.gn !== '');
    });
    var mine = SM[hid] || {};
    sib = sib.filter(function (id) {                      // همان سایت برای همان اندازه در گروه دیگر هم آگهی دارد = دو کالای جدا هستند، نه یک کالا
      var o = SM[id] || {}; for (var q in mine) if (o[q]) return false;
      return true;
    });
    var cor = sib.filter(function (id) { return hp.some(function (x) { return corrob(byG[id], x.ml, [x.p]); }); });
    if (cor.length === 1) { var tt = SM[cor[0]] = SM[cor[0]] || {}; for (var q2 in mine) tt[q2] = 1; moveGroup(db, hid, cor[0]); delete G[hid]; moved++; }
  });
  /* مرحله‌ی ۲: دو گروهِ کاملاً مشخص (غلظت و جنسیت یکی) که فقط خط یا املای نامشان فرق دارد («ورساچه اروس» / Versace Eros) */
  byG = pricesByGroup(db);
  Object.keys(G).sort(function (x, y) { return +x - +y; }).forEach(function (hid) {
    var H = G[hid]; if (!H || H.conc === '' || H.gn === '') return;
    var hp = byG[hid]; if (!hp || !hp.length) return;
    var mine = SM[hid] || {};
    var sib = idx.cands(H.key, true).filter(function (id) {
      var S = G[id]; if (!S || id === hid || S.conc !== H.conc || S.gn !== H.gn) return false;
      if (!nameCmp(H.key, S.key)) return false;
      var o = SM[id] || {}; for (var q in mine) if (o[q]) return false;       // همان سایت و همان اندازه در هر دو = دو کالای جدا
      return true;
    });
    var cor = sib.filter(function (id) { return hp.some(function (x) { return corrob(byG[id], x.ml, [x.p]); }); });
    if (cor.length === 1) {
      var to = cor[0], from = hid;
      if (isFaArr(restOf(H.key)) && !isFaArr(restOf(G[to].key))) { from = cor[0]; to = hid; }     // گروهِ دارای نامِ فارسی می‌ماند (نامِ نمایشی از آن می‌آید)
      var tt2 = SM[to] = SM[to] || {}, fm = SM[from] || {}; for (var q3 in fm) tt2[q3] = 1;
      moveGroup(db, from, to); delete G[from]; moved++;
    }
  });
  return moved;
}
/* list: [{id,t,price,img,st}]  st: 0 عادی | 1 ناموجود | 2 عطر نیست | 3 فقط قیمت (عنوان نداریم)
   complete: همه‌ی صفحه‌ها خوانده شد → محصولاتِ دیده‌نشده پاک شوند */
function ingestStart(db, idx, src) {
  setLex(db.wd);
  return { db: db, idx: idx, src: src, M: (db.it[src] = db.it[src] || {}), G: gview(db), byG: null, seen: {}, st: { added: 0, unknown: 0, removed: 0 } };
}
/* عکس (کوچک و بزرگ) و برندِ پیشنهادیِ سایت را به گروه اضافه می‌کند؛ چیزی که هست بازنویسی نمی‌شود */
function putExtra(g, src, x) {
  if (x.img) { g.im = g.im || {}; if (!g.im[src]) g.im[src] = x.img; }
  if (x.big) { g.bi = g.bi || {}; if (!g.bi[src]) g.bi[src] = x.big; }
  if (x.b && x.b.length) { g.br = g.br || []; x.b.forEach(function (h) { if (g.br.indexOf(h) < 0 && g.br.length < 4) g.br.push(h); }); }
}
function stripBrandEn(tk, ent) {
  var clean = tk.map(function (w) { return w.replace(/'/g, ''); }), cur = clean;
  (ent.al || []).forEach(function (al) { cur = stripSeqs(cur, null, al); });
  var r = [], k = 0; tk.forEach(function (x, i) { if (k < cur.length && clean[i] === cur[k]) { r.push(x); k++; } });
  return r;
}
/* نام انگلیسیِ عطر (اگر سایت داده باشد) را به گروه اضافه می‌کند و جفتِ واژه‌ی فارسی/انگلیسی را یاد می‌گیرد */
function addEn(db, gg, p, x) {
  var ex = x.e ? enTokens(x.e) : [], own = enTokens(x.t), tk = ex.length ? ex : own, w = ex.length ? 3 : 1;
  if (ex.length && ex.length > 1 && /^\d$/.test(ex[ex.length - 1]) && normFa(x.t, true).indexOf(ex[ex.length - 1]) < 0) { ex.pop(); tk = ex; }
  if (!tk.length || tk.length > 9) return;
  var ent = brandOf(p.key, x.b), rest = stripBrandEn(tk, ent);
  if (!rest.length) return;
  var k = tk.join(' ');
  gg.en = gg.en || {}; gg.en[k] = (gg.en[k] || 0) + w;
  var ks = Object.keys(gg.en); if (ks.length > 5) { ks.sort(function (a, b) { return gg.en[b] - gg.en[a]; }); ks.slice(5).forEach(function (q) { delete gg.en[q]; }); }
  if (p.fa) {
    var fr = stripBrand(p.key, ent);
    if (ent.id.charAt(0) === 'h' && ent.al && ent.al[0] && fr.length > rest.length && fr.length - ent.al[0].length === rest.length) fr = fr.slice(ent.al[0].length);   // نامِ برندِ ناشناخته (لاتین) هنوز در عنوانِ فارسی هست
    if (fr.length && fr.length === rest.length && fr.length <= 3) {
      db.wd = db.wd || {};
      fr.forEach(function (f, i) {
        var e = rest[i];
        if (!/^[؀-ۿ]{2,}$/.test(f) || !/^[a-z']{2,}$/.test(e)) return;
        if (!db.wd[f] && Object.keys(db.wd).length > 3500) return;
        var m = db.wd[f] = db.wd[f] || {}; m[e] = (m[e] || 0) + 1;
      });
    }
  }
}
function ingestChunk(C, list) {
  var db = C.db, idx = C.idx, src = C.src, M = C.M, G = C.G, seen = C.seen, st = C.st;
  list.forEach(function (x) {
    var pid = String(x.id); seen[pid] = 1;
    var cur = M[pid], nowMin = Math.floor(Date.now() / 60000);
    var price = x.st === 1 || !(x.price > 0) ? 0 : x.price;
    if (cur && (x.st === 3 || cur[0] === x.t || !x.t)) {          // شناخته‌شده: فقط قیمت
      if (cur[2] !== 0) cur[1] = price;
      cur[4] = nowMin;                                              // آخرین باری که در سایت دیده شد
      if (cur[2] && db.g[cur[2]]) putExtra(db.g[cur[2]], src, x);
      return;
    }
    if (x.st === 3 || !x.t) { st.unknown++; return; }
    if (x.st === 2) { M[pid] = [x.t || '', 0, 0, 0, nowMin]; return; }
    var p = parseTitle(x.t);
    if (!p) { M[pid] = [x.t, 0, 0, 0, nowMin]; return; }
    st.added++;
    if (!C.byG) C.byG = pricesByGroup(db);
    var gid = resolve(db, idx, G, C.byG, p, price, src);
    if (gid == null) {
      var h = hash(p.key.join(' ') + '|' + p.conc + '|' + p.gn); gid = h; var n = 1;
      while (db.g[gid]) gid = h + (n++);
      db.g[gid] = { k: p.key, c: p.conc, gn: p.gn, nm: {}, im: {} };
      G[gid] = { id: gid, key: p.key, conc: p.conc, gn: p.gn }; idx.add({ id: gid, key: p.key });
    }
    var gg = db.g[gid]; gg.nm[p.name] = (gg.nm[p.name] || 0) + 1;
    putExtra(gg, src, x); addEn(db, gg, p, x);
    M[pid] = [x.t, price, gid, p.ml, nowMin];
    if (price > 0) (C.byG[gid] = C.byG[gid] || []).push({ ml: p.ml, p: price * ((db.sc && db.sc[src]) || 1) });
  });
}
/* عنوان‌های ذخیره‌شده را با قاعده‌های فعلی دوباره می‌سنجد؛ آن‌هایی که حالا رد می‌شوند (مثل کالای «مدل ...») از گروه‌ها بیرون می‌روند */
function purgeStored(db) {
  var n = 0;
  Object.keys(db.it || {}).forEach(function (src) {
    var M = db.it[src];
    Object.keys(M).forEach(function (pid) {
      var e = M[pid];
      if (e[2] && e[0]) { var c0 = CLEANSE.clone | 0; var pr = parseTitle(e[0]); var isC = !pr && (CLEANSE.clone | 0) > c0; CLEANSE.clone = c0; if (isC) { e[1] = 0; e[2] = 0; e[3] = 0; n++; } }
    });
  });
  return n;
}
var DEDUPE_V = 4;
function ingestEnd(C, complete) {
  if (complete) {                                      // فهرستِ ناگهان خیلی کوچک‌تر شده (صفحه‌ی خطا/کپچا): پاک‌سازی نکن
    var known = Object.keys(C.M).length, seenN = Object.keys(C.seen).length;
    if (known >= 20 && seenN < known * 0.7) { complete = false; C.st.suspect = true; }
  }
  if (complete) Object.keys(C.M).forEach(function (pid) { if (!C.seen[pid]) { delete C.M[pid]; C.st.removed++; } });
  if (C.db.dv !== DEDUPE_V) C.st.purged = purgeStored(C.db);           // نسخه‌ی قاعده‌ها عوض شده: کالاهای ردشده‌ی قبلی از حافظه بیرون بروند
  if (C.st.added || C.db.dv !== DEDUPE_V) { C.st.merged = reconcile(C.db, C.idx); C.db.dv = DEDUPE_V; }      // نسخه‌ی قاعده‌ها عوض شده = یک‌بار کل حافظه دوباره بازرسی شود
  return C.st;
}
function ingest(db, idx, src, list, complete) {
  var C = ingestStart(db, idx, src); ingestChunk(C, list); return ingestEnd(C, complete);
}
/* مثل ingest ولی تکه‌تکه، تا صفحه‌ی گوشی هنگ نکند */
var QUEUE = Promise.resolve();   // هم‌زمان فقط یک سایت وارد حافظه می‌شود (ترتیبِ درست و بدون ناهماهنگی)
function ingestAsync(db, idx, src, list, complete) {
  var run = QUEUE.then(function () { return ingestSlices(db, idx, src, list, complete); });
  QUEUE = run.then(function () {}, function () {});
  return run;
}
async function ingestSlices(db, idx, src, list, complete) {
  var C = ingestStart(db, idx, src);
  for (var i = 0; i < list.length; i += 250) {
    ingestChunk(C, list.slice(i, i + 250));
    if (i + 250 < list.length) await sleep(0);
  }
  return ingestEnd(C, complete);
}
/* ساخت فهرست نمایشی از db */
var STALE_MIN = 240;   // دقیقه
function buildList(db, srcOrder, trusted, maxAge) {
  setLex(db.wd);
  var by = {}, now = Date.now(), stale = 0;
  Object.keys(db.it).forEach(function (s) {
    if (maxAge && (!db.t[s] || now - db.t[s] > maxAge)) return;
    var m = db.it[s], tmin = db.t[s] ? Math.floor(Math.min(db.t[s], now) / 60000) : 0, nowM = Math.floor(now / 60000);   // ساعتِ گوشی عقب رفته باشد هم درست حساب می‌شود
    Object.keys(m).forEach(function (pid) {
      var e = m[pid]; if (!e[2] || !(e[1] > 0) || !db.g[e[2]]) return;
      if (!e[4] || e[4] > nowM + 10 || (tmin && e[4] < tmin - STALE_MIN)) { stale++; return; }   // چند ساعت است در فهرست سایت دیده نشده → دیگر موجود حساب نمی‌شود
      (by[e[2]] = by[e[2]] || []).push({ src: s, ml: e[3], price: e[1], pid: pid });
    });
  });
  var ids = Object.keys(by), pidx = new Index();
  ids.forEach(function (id) { pidx.add({ id: id, key: db.g[id].k }); });
  var groups = [], hid = 0;
  ids.forEach(function (id) {
    var g = db.g[id];
    if (g.c === '' || (g.gn || '') === '') {          // ویژگی نامشخص و یک هم‌نامِ مشخص‌تر هست → تکراری/مبهم است، نشان نده
      var sm = {}; (by[id] || []).forEach(function (x) { sm[x.src + '|' + x.ml] = 1; });
      var hide = pidx.cands(g.k, true).some(function (o) {
        var S = db.g[o]; if (!S || o === id) return false;
        if ((by[o] || []).some(function (x) { return sm[x.src + '|' + x.ml]; })) return false;   // همان سایت و همان اندازه در هر دو: جدا هستند
        return nameCmp(g.k, S.k) && concCmp(g.c, S.c) && genCmp(g.gn || '', S.gn || '') && (g.c === '' || S.c !== '') && ((g.gn || '') === '' || (S.gn || '') !== '') && ((g.c === '' && S.c !== '') || ((g.gn || '') === '' && (S.gn || '') !== ''));   // S باید دقیق‌تر از g باشد (نه هم‌سطح؛ وگرنه هر دو همدیگر را پنهان می‌کنند)
      });
      if (hide) { hid++; return; }
    }
    groups.push({ id: id, key: g.k, conc: g.c, gn: g.gn || '', nm: g.nm, en: g.en, im: g.im, bi: g.bi, br: g.br, items: by[id] });
  });
  var out = priceGroups(groups, srcOrder, trusted, db.sc);
  Object.keys(out.scale || {}).forEach(function (s) { db.sc[s] = out.scale[s]; });
  out.hidden = hid; out.stale = stale;
  return out;
}
/* ساخت یک‌جا (آزمون‌ها): records: [{src,t,price,img}] */
function aggregate(records, srcOrder, trusted) {
  var db = newDb(), idx = new Index(), bySrc = {};
  records.forEach(function (r, i) { (bySrc[r.src] = bySrc[r.src] || []).push({ id: i, t: r.t, price: r.price, img: r.img || '', st: 0 }); });
  Object.keys(bySrc).forEach(function (s) { ingest(db, idx, s, bySrc[s], false); db.t[s] = Date.now(); });
  buildList(db, srcOrder, trusted, 0);   // مقیاس‌ها را بیابد
  reconcile(db, idx);
  return buildList(db, srcOrder, trusted, 0);
}

/* ---------- خواندن سایت‌ها ---------- */
function urlJoin(base, h) {
  try { return new URL(h, base).href; } catch (e) { return ''; }
}
function titleLooksPerfume(t) {
  return /عطر|ادکلن|ادکلون|ادو ?(پرفیوم|تویلت|کلن|پارفوم)|edp|edt|parfum|cologne|perfume|eau de/i.test(t);
}

var CFG = { retryMs: 700, conc: 4 };
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
/* دانلود با تلاش دوباره (قطعی‌های کوتاه و خطاهای سرور) */
async function getR(net, url, headers, tries) {
  tries = tries || 3; var last = { status: 0, body: '' };
  for (var i = 0; i < tries; i++) {
    try {
      var r = await net.get(url, headers); last = r;
      if (r.status < 500 && r.status !== 429 && r.status !== 408) return r;
    } catch (e) { last = { status: 0, body: String(e && e.message || e) }; }
    if (i < tries - 1) await sleep(CFG.retryMs * (i + 1) * (i + 1));
  }
  return last;
}
function parseJson(b) { try { return JSON.parse(b); } catch (e) { return undefined; } }

/* ووکامرس: حالت full = همه‌ی اطلاعات؛ حالت price = فقط شناسه، قیمت و موجودی (چند برابر سبک‌تر) */
async function wooSource(base, net, rep, mode) {
  var out = [], notes = [], failed = 0, fields = mode === 'price';
  var FIELDS = '&_fields=id,prices,price_html,is_in_stock,is_purchasable,is_on_backorder,type';
  function url(p) { return base + '/wp-json/wc/store/v1/products?per_page=100&page=' + p + (fields ? FIELDS : ''); }
  var diag = { total: 0, priced: 0, sizeTitle: 0, sizeSpec: 0, noSize: 0, sample: '' };
  function conv(it) {
    var pr = it.prices || {}, name = it.name || '';
    var minor = pr.currency_minor_unit == null ? 0 : +pr.currency_minor_unit;
    var v = parseFloat(pr.price) / Math.pow(10, minor);
    if (!(v > 0) && it.price_html && !OUT_RE.test(normFa(stripTags(it.price_html))) && !/تماس|\bcall\b|unavailable/i.test(stripTags(it.price_html))) {                       // بعضی سایت‌ها قیمت را فقط در متنِ نمایشی می‌گذارند
      var pt = priceFromText(stripTags(it.price_html)).nums.filter(function (x) { return x > 0; });
      if (pt.length) { var f0 = pt[0]; v = Math.min.apply(null, pt.filter(function (x) { return x >= f0 / 2.5 && x <= f0 * 2.5; })); }
    }
    var cur = String(pr.currency_code || '').toUpperCase();
    if (cur === 'IRHT') v = v * 1000; else if (cur === 'IRHR') v = v * 100;     // هزار تومان / هزار ریال
    else if (/IRR|ریال/i.test(cur || pr.currency_symbol || '')) v = v / 10;
    var st = 0;
    if (cur && !/^(IRT|IRR|IRHT|IRHR)$/.test(cur) && !/تومان|ریال/.test(pr.currency_symbol || '')) v = 0;     // ارزِ ناشناخته (دلار و ...) قیمتِ تومانی نیست
    if (typeof it.is_in_stock !== 'boolean' || it.is_in_stock === false || it.is_purchasable === false || it.is_on_backorder === true || !(v > 0)) st = 1;   // فقط کالای موجود و قابل خرید
    if (pr.price_range && pr.price_range.min_amount !== pr.price_range.max_amount) st = 1;
    if (it.price_html && OUT_RE.test(normFa(stripTags(it.price_html)))) st = 1;
    var cats = (it.categories || []).map(function (c) { return c.name; }).join(' ');
    var title = name;
    if (name && it.categories && !titleLooksPerfume(name + ' ' + cats)) st = 2;
    else if (!name) st = st === 1 ? 1 : 3;
    else {
      title = enrichTitle(name, it.short_description || it.description || '', cats);
      diag.total++; if (v > 0 && st !== 1) diag.priced++;
      if (hasSizeWord(normFa(name, true))) diag.sizeTitle++; else if (title !== name && /\d+ میل/.test(title)) diag.sizeSpec++; else { diag.noSize++; if (!diag.sample) diag.sample = name.slice(0, 80); }
    }
    var im = it.images && it.images[0];
    return { id: it.id, t: title, e: slugText(it.slug), price: st === 1 ? 0 : v, img: im ? (im.thumbnail || im.src || '') : '', big: im ? (im.src || im.thumbnail || '') : '', b: brandHints(it.categories), st: st };
  }
  async function one(p) {
    var r = await getR(net, url(p), { Accept: 'application/json' });
    if (r.status === 200) { var a = parseJson(r.body); if (Array.isArray(a)) return { k: 'ok', a: a }; return { k: p === 1 ? 'bad' : 'end', a: [] }; }
    if (p > 1 && r.status === 400) return { k: 'end', a: [] };
    return { k: 'fail', s: r.status, b: r.body };
  }
  var first = await one(1);
  if (first.k !== 'ok' && fields) { fields = false; first = await one(1); }      // سایت _fields را نپذیرفت
  if (first.k === 'bad') throw new Error('ساختار ناشناخته');
  if (first.k === 'fail') throw new Error(first.s ? 'HTTP ' + first.s : (first.b || 'اینترنت وصل نیست'));
  var res = [first], page = 2, ended = first.a.length === 0;            // صفحه‌ی کوتاه = پایان نیست (سایت ممکن است per_page را کم کرده باشد)
  var wIds = {};
  function eat(r) { r.a.forEach(function (it) { wIds[it.id] = 1; out.push(conv(it)); }); }
  function isDup(r) { return r.a.length > 0 && r.a.every(function (it) { return wIds[it.id]; }); }
  eat(first); rep(out.length);
  while (!ended && page <= 90) {
    var ps = []; for (var i = 0; i < CFG.conc; i++) ps.push(page + i);
    var rr = await Promise.all(ps.map(one));
    rr.forEach(function (r, i) {
      if (ended && r.k === 'ok') { eat(r); return; }
      if (r.k === 'fail') { failed++; notes.push('صفحه ' + ps[i] + ' نشد'); return; }
      if (r.k === 'ok') { if (isDup(r)) { failed++; notes.push('صفحه‌بندی کار نکرد'); ended = true; return; } eat(r); if (r.a.length === 0) ended = true; } else ended = true;
    });
    page += CFG.conc; rep(out.length);
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  var dn = (!fields && diag.total) ? ' · قیمت‌دار ' + diag.priced + ' از ' + diag.total + ' · اندازه از عنوان ' + diag.sizeTitle + '، از توضیحات ' + diag.sizeSpec + '، بدون اندازه ' + diag.noSize + (diag.sample ? ' (نمونه: ' + diag.sample + ')' : '') : '';
  return { items: out, complete: ended && !failed, note: (failed ? 'ناقص: ' + failed + ' صفحه' : '') + dn, diag: diag };
}

var DK_URLS = [
  function (p) { return 'https://api.digikala.com/v1/categories/perfume/search/?page=' + p; },
  function (p) { return 'https://api.digikala.com/v1/categories/perfume/search?page=' + p; }
];
async function digikalaSource(net, rep, mode) {
  var out = [], failed = 0, total = 1, vi = 0, err = '';
  function small(u) { return u ? u.replace(/h_\d+,w_\d+/, 'h_360,w_360') : ''; }
  function eat(d) {
    d.products.forEach(function (p) {
      var dv = p.default_variant, pr = dv && dv.price;     // کالای ناموجود/متوقف‌شده «تنوعِ پیش‌فرض» ندارد؛ قیمتِ قدیمیِ p.price را قبول نمی‌کنیم
      var rial = pr && pr.selling_price;
      var ok = !(p.status && p.status !== 'marketable') && !!dv && rial > 0 && !(dv.status && !/marketable|available/i.test(String(dv.status)));
      var title = p.title_fa || p.title_en || '';
      var img = p.images && p.images.main && p.images.main.url && p.images.main.url[0] || '';
      var bh = p.data_layer && typeof p.data_layer.brand === 'string' ? p.data_layer.brand : '';
      out.push({ id: p.id, t: title, e: p.title_en || '', price: ok ? rial / 10 : 0, img: small(img), big: img ? img.replace(/h_\d+,w_\d+/, 'h_1000,w_1000') : '', b: bh && !BAD_CAT.test(bh) && bh.length <= 40 ? [bh] : [], st: ok ? 0 : 1 });
    });
  }
  async function one(p, v) {
    var r = await getR(net, DK_URLS[v](p), { Accept: 'application/json' });
    if (r.status !== 200) return { k: 'fail', e: r.status === 0 ? r.body : 'HTTP ' + r.status };
    var j = parseJson(r.body), d = j && j.data;
    if (!d || !Array.isArray(d.products)) return { k: 'fail', e: 'ساختار ناشناخته' };
    return { k: 'ok', d: d };
  }
  var first = null;
  for (vi = 0; vi < DK_URLS.length && !first; vi++) { var r1 = await one(1, vi); if (r1.k === 'ok') { first = r1; break; } err = r1.e; }
  if (!first) throw new Error(err || 'دیجی‌کالا جواب نداد');
  var d1 = first.d; eat(d1); rep(out.length, 0);
  total = Math.min(80, (d1.pager && d1.pager.total_pages) || 1);
  var done = 1;
  for (var page = 2; page <= total; page += CFG.conc + 1) {
    var ps = []; for (var i = 0; i < CFG.conc + 1 && page + i <= total; i++) ps.push(page + i);
    var rr = await Promise.all(ps.map(function (p) { return one(p, vi); }));
    rr.forEach(function (r) { if (r.k === 'ok') eat(r.d); else failed++; });
    done += ps.length; rep(out.length, done / total);
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  var capped = !(d1.pager && d1.pager.total_pages > 0) || d1.pager.total_pages > 80;
  return { items: out, complete: !failed && total > 0 && !capped, note: failed ? 'ناقص: ' + failed + ' صفحه' : (capped ? 'ناقص: تعداد صفحه‌ها معلوم نیست یا بیش از ۸۰ است' : '') };
}

/* ---- HTML عمومی (برای سایت‌هایی که API ندارند) ---- */
function priceFromText(txt) {
  var res = [], rial = false;
  var NONPRICE = /ارسال|بالای|بیشتر از|حداقل|قسط|اقساط|ماهانه|هر ?میل|هدیه|تخفیف|سود |صرفه|کش ?بک|اعتبار|\boff\b|shipping|cashback|over |above /;
  String(txt).split(/\n+/).forEach(function (seg) {
    var t = normFa(seg).replace(/[٬٫،]/g, ','); if (!t || NONPRICE.test(t)) return;
    if (/\d[\d,.\/\s]*\s*ریال/.test(t)) rial = true;
    var m;
    var rm = /(\d+(?:[.,\/]\d+)?)\s*میلیون(?:\s*و\s*(\d+)\s*هزار)?/g;                       // «۴٫۵ میلیون»، «۴ میلیون و ۵۰۰ هزار»
    t = t.replace(rm, function (all, a, b) { var v = parseFloat(a.replace(/[,\/]/g, '.')) * 1e6 + (b ? +b * 1000 : 0); if (v >= 100000) res.push(Math.round(v)); return ' '; });
    t = t.replace(/(\d{1,3}(?:,\d{3})*)\s*هزار/g, function (all, a) { var v = +a.replace(/,/g, '') * 1000; if (v >= 100000) res.push(v); return ' '; });
    t = t.replace(/\d{1,3}(?:[.\/]\d{3}){2,}/g, function (all) { res.push(+all.replace(/[.\/]/g, '')); return ' '; });   // ۵.۵۰۰.۰۰۰ ، ۴/۵۰۰/۰۰۰
    t = t.replace(/\d{1,3}(?:,\d{3})+/g, function (all) { res.push(+all.replace(/,/g, '')); return ' '; });
    var rp = /(?<![\d,])(\d{1,3}(?: \d{3}){2,}|\d{6,10})(?![\d,])\s*(?:تومان|ریال)|(?:تومان|ریال)\s*(?<![\d,])(\d{1,3}(?: \d{3}){2,}|\d{6,10})(?![\d,])/g;   // بدونِ جداکننده/با فاصله فقط کنارِ «تومان/ریال»
    while ((m = rp.exec(t))) res.push(+(m[1] || m[2]).replace(/ /g, ''));
  });
  return { nums: res, rial: rial };
}
var OUT_RE = /(?:^|[^ا-ی])(?:نا ?موجود|غیر ?موجود)|اتمام\s*(?:موجودی|موجود|کالا)|عدم\s*(?:موجودی|عرضه)|موجودی (?:ندار|صفر|نداریم)|موجود نیست|موجود نمی|در ?دسترس نیست|در انبار نیست|قابل (?:سفارش|خرید) نیست|غیر ?قابل (?:سفارش|خرید)|تمام شد|تمام شده|به اتمام رسید|فروخته شد|فروخته شده|تامین نشده|خبرم کن|خبر دهید|اطلاع.{0,8}موجود|به ?زودی|توقف (?:تولید|فروش)|تولید نمی|پیش ?(?:فروش|سفارش|خرید)|ناپدید|از رده خارج|خارج از رده|منسوخ|حذف شده|غیر ?فعال|النفاد|out[- ]?of[- ]?stock|sold[- ]?out|not (?:in stock|available)|no longer available|email me when|notify (?:me|when)|coming soon|pre-?order|unavailable|discontinued/i;
var OUT_CLS = /out[-_ ]?of[-_ ]?stock|outofstock|sold[-_ ]?out|soldout|stock[-_ ]?out|no[-_ ]?stock|nostock|not[-_ ]?in[-_ ]?stock|off[-_ ]?stock|empty[-_ ]?stock|on[-_ ]?backorder|onbackorder|unavailable|not[-_ ]?available|ناموجود/i;
var OUT_ATTR = /^(0|false|no|out ?of ?stock|out_of_stock|out-of-stock|outofstock|soldout|sold_out|sold out|unavailable)$/i;
var OUT_SCHEMA = /OutOfStock|SoldOut|Discontinued|PreOrder|BackOrder|PreSale/i;
var ATTRS = ['data-availability', 'data-stock', 'data-stock-status', 'data-in-stock', 'data-instock', 'data-available'];
var BAD_HREF = /add[-_]to[-_](?:cart|wishlist)|[?&]add-to-cart=|wishlist|compare|quick[-_ ]?view|[?&]action=|\/cart\/?(?:$|\?)|\/checkout|\/login|\/account|\/(?:brands?|manufacturer|product-category|category|tag)\//i;
var OLD_CLS = /(^|[-_ ])(old|del|deleted|before|regular|prev|previous|strike|strikethrough|line-through)([-_ ]|$)/i;
var NU_C = {}, NU_N = 0;
function normUrl(u) {
  var h = NU_C[u]; if (h !== undefined) return h;
  if (NU_N > 20000) { NU_C = {}; NU_N = 0; }
  NU_N++; return (NU_C[u] = normUrl0(u));
}
function normUrl0(u) {
  try { var x = new URL(u); var p = x.pathname.replace(/\/+$/, ''); try { p = decodeURIComponent(p); } catch (e) { } return (x.origin + p + x.search).toLowerCase(); } catch (e2) { return String(u || '').toLowerCase(); }
}
function shapeOf(u) { var m = /^https?:\/\/[^\/]+\/+([^\/?#]+)/i.exec(u); return m ? m[1].toLowerCase() : ''; }
function textJoin(el) {                       // متنِ همه‌ی گره‌ها با جداکننده (۴٫۵ و ۲٬۵۰۰٬۰۰۰ به هم نچسبند)
  var out = [];
  (function walk(n) {
    if (n.nodeType === 3) { var t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t) out.push(t); return; }
    if (n.nodeType !== 1) return;
    var tg = n.tagName.toLowerCase(); if (tg === 'script' || tg === 'style') return;
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  })(el);
  return out.join('\n');
}
function numPrice(x) { var t = normFa(String(x)).replace(/[\s,٬،]/g, ''); if (/^\d{1,3}(\.\d{3}){2,}$/.test(t)) t = t.replace(/\./g, ''); return parseFloat(t); }
function elOut(e) {                           // یک المان به‌تنهایی نشانه‌ی ناموجودی دارد؟
  var c = e.getAttribute('class') || '';
  if (c && OUT_CLS.test(c)) return true;
  for (var k = 0; k < ATTRS.length; k++) { var v = e.getAttribute(ATTRS[k]); if (v != null && (OUT_ATTR.test(String(v).trim()) || OUT_SCHEMA.test(String(v)))) return true; }
  var ip = e.getAttribute('itemprop');
  if (ip && /availability/i.test(ip) && OUT_SCHEMA.test((e.getAttribute('content') || '') + ' ' + (e.getAttribute('href') || '') + ' ' + (e.textContent || ''))) return true;
  var lab = normFa((e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || '') + ' ' + (e.getAttribute('alt') || ''));
  if (lab.trim() && OUT_RE.test(lab)) return true;
  if (e.tagName === 'IMG') {
    var src = (e.getAttribute('src') || '') + ' ' + (e.getAttribute('srcset') || '') + ' ' + (e.getAttribute('data-src') || '') + ' ' + (e.getAttribute('data-lazy-src') || '') + ' ' + (e.getAttribute('data-srcset') || '');
    try { src = decodeURIComponent(src); } catch (e3) { }
    src = normFa(src); if (OUT_RE.test(src) || OUT_CLS.test(src)) return true;
  }
  return false;
}
function extractCards(doc, pageUrl) {
  var out = [], seen = {}, idxByKey = {};
  function push(o) { var k = normUrl(o.u) || o.t; if (idxByKey[k] != null) { if (o.st === 1) { var z = out[idxByKey[k]]; z.price = 0; z.st = 1; } return; } idxByKey[k] = out.length; out.push(o); }
  // JSON-LD (موجودی باید صریح نوشته شده باشد)
  Array.prototype.forEach.call(doc.querySelectorAll('script[type="application/ld+json"]'), function (s) {
    var j; try { j = JSON.parse(s.textContent); } catch (e) { return; }
    var list = [];
    (function walk(x) {
      if (!x) return;
      if (Array.isArray(x)) return x.forEach(walk);
      if (typeof x !== 'object') return;
      var ty = x['@type']; if (ty === 'Product' || (Array.isArray(ty) && ty.indexOf('Product') >= 0)) list.push(x);
      if (x.itemListElement) walk(x.itemListElement);
      if (x.item) walk(x.item);
      if (x['@graph']) walk(x['@graph']);
    })(j);
    var today = new Date().toISOString().slice(0, 10);
    list.forEach(function (p) {
      if (!p.name) return;
      var all = (Array.isArray(p.offers) ? p.offers : [p.offers]).filter(Boolean);
      var offs = all.filter(function (o) { return /InStock|LimitedAvailability|OnlineOnly/i.test(String(o.availability || '')) && !(o.priceValidUntil && String(o.priceValidUntil).slice(0, 10) < today); });
      var uu = p.url || p['@id'] || (all[0] && all[0].url) || '';
      var u = /^https?:|^\//.test(String(uu)) ? urlJoin(pageUrl, uu) : '';
      var img = Array.isArray(p.image) ? p.image[0] : (p.image || ''); if (img && typeof img === 'object') img = img.url || '';
      if (!offs.length) {
        if (all.some(function (a) { return OUT_SCHEMA.test(String(a.availability || '')); })) push({ u: u, t: p.name, price: 0, st: 1, img: img });
        return;
      }
      var pr = offs.map(function (o) { var raw = o.price != null ? o.price : (o.highPrice != null && o.lowPrice != null && +o.highPrice === +o.lowPrice ? o.lowPrice : ''); return numPrice(raw); }).filter(function (x) { return x > 0; });
      if (!pr.length) return;
      var first = pr[0], price = Math.min.apply(null, pr.filter(function (x) { return x >= first / 2.5 && x <= first * 2.5; }));
      var cur = String(offs[0].priceCurrency || '').toUpperCase();
      if (/IRR/.test(cur)) price /= 10;
      else if (cur && !/IRT|TOMAN/.test(cur)) return;
      push({ u: u, t: p.name, price: price, img: img });
    });
  });
  // کارت‌های معمولی: لینکِ دارای عکس. «کارت» = بالاترین نیایی که فقط یک محصول (یک لینکِ هم‌شکل) دارد
  var doneCard = new WeakSet(), NL = new WeakMap();
  Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
    if (!a.querySelector('img')) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href) || BAD_HREF.test(href)) return;
    var url = urlJoin(pageUrl, href), shape = shapeOf(url), me = normUrl(url);
    function nLinks(el) {
      var ck = NL.get(el); if (ck && ck[shape] !== undefined) return ck[shape];
      var set = {}, n = 0;
      Array.prototype.forEach.call(el.querySelectorAll('a[href]'), function (x) {
        var h = x.getAttribute('href') || ''; if (!h || h.charAt(0) === '#' || BAD_HREF.test(h) || !x.querySelector('img')) return;
        var u2 = urlJoin(pageUrl, h); if (shapeOf(u2) !== shape) return;
        var k = normUrl(u2); if (!set[k]) { set[k] = 1; n++; }
      });
      (ck || (ck = {}))[shape] = n; NL.set(el, ck);
      return n;
    }
    var card = a;
    for (var up = 0; up < 8; up++) {
      var par = card.parentElement; if (!par || par === doc.body || par === doc.documentElement) break;
      if (nLinks(par) > 1) break;
      card = par;
    }
    if (doneCard.has(card)) return; doneCard.add(card);
    var outFlag = false, chain = a;
    for (var q = 0; q < 12 && chain; q++) { if (elOut(chain)) { outFlag = true; break; } if (chain === card) break; chain = chain.parentElement; }
    if (!outFlag) { var all = card.querySelectorAll('*'); for (var z = 0; z < all.length && z < 400; z++) if (elOut(all[z])) { outFlag = true; break; } }
    var fullTxt = normFa(textJoin(card));
    if (!outFlag && OUT_RE.test(fullTxt)) outFlag = true;
    var clone = card.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('del,s,strike,script,style,[class]'), function (n) { var tg = n.tagName.toLowerCase(); if (tg === 'del' || tg === 's' || tg === 'strike' || tg === 'script' || tg === 'style' || OLD_CLS.test(n.getAttribute('class') || '')) n.remove(); });
    var pel = clone.querySelectorAll('[class*="price"],[class*="amount"],[itemprop="price"],[class*="قیمت"]'), ptxt = '';
    Array.prototype.forEach.call(pel, function (n) { ptxt += '\n' + (n.getAttribute('content') || textJoin(n)); });
    var pr = ptxt ? priceFromText(ptxt) : { nums: [] };
    if (!pr.nums.length) pr = priceFromText(textJoin(clone));
    if (!pr.nums.length) pr = priceFromText(textJoin(card));     // قیمت داخل المانی بود که «قدیمی» حدس زدیم
    if (!outFlag && !pr.nums.length) return;
    var v = 0;
    if (pr.nums.length) {
      var f0 = pr.nums[0]; v = Math.min.apply(null, pr.nums.filter(function (x) { return x >= f0 / 2.5 && x <= f0 * 2.5; }));
      if (pr.rial) v = v / 10;
    }
    var img = a.querySelector('img'), title = '';
    var h = card.querySelector('h1,h2,h3,h4,h5,[class*="title"],[class*="name"]');
    if (h) title = (h.textContent || '').replace(/\s+/g, ' ').trim();
    if (title.length < 6) { var alt = (img && img.getAttribute('alt')) || a.getAttribute('title') || ''; if (alt.length >= 6 && !/^(تصویر|عکس|image|photo|picture|thumbnail)/i.test(alt.trim())) title = alt; }
    title = (title || '').replace(/\s+/g, ' ').trim();
    if (!title) return;
    var src = img && (img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '');
    push({ u: url, t: title, price: outFlag ? 0 : v, st: outFlag ? 1 : 0, img: src ? urlJoin(pageUrl, src) : '' });
  });
  return out;
}
function findNext(doc, url, i) {
  var n = doc.querySelector('link[rel="next"],a[rel="next"],a.next,.next.page-numbers');
  var nh = n && n.getAttribute('href');
  if (nh && nh.charAt(0) !== '#' && !/^javascript:/i.test(nh)) return urlJoin(url, nh);
  var u = url.replace(/([?&])page=\d+/, '$1page=' + (i + 2));
  if (u === url) u = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + (i + 2);
  return u;
}
async function htmlSource(start, net, rep, mode) {
  var out = [], seen = {}, url = start, pages = 0, natural = false, failed = 0, stop = '';
  for (var i = 0; i < 40 && url; i++) {
    var r = await getR(net, url, { Accept: 'text/html' });
    if (r.status === 404 && i > 0) { natural = true; stop = 'صفحه‌ی ' + (i + 1) + ' وجود ندارد (پایان)'; break; }
    if (r.status !== 200) { if (i === 0) throw new Error(r.status ? 'HTTP ' + r.status : r.body); failed++; stop = 'صفحه ' + (i + 1) + ' نشد'; break; }
    var doc = new DOMParser().parseFromString(r.body, 'text/html');
    var cards = extractCards(doc, url), fresh = 0;
    pages++;
    cards.forEach(function (c) {
      var k = c.t + '|' + c.price + '|' + (c.u || '');
      if (seen[k]) return; seen[k] = 1; fresh++;
      out.push({ id: c.u || c.t, t: c.t, price: c.price, img: c.img, big: c.img, st: c.st === 1 ? 1 : (titleLooksPerfume(c.t) || parseTitle(c.t)) ? 0 : 2 });
    });
    rep(out.length);
    if (!fresh) {
      if (i === 1 && cards.length) { stop = 'صفحه‌بندی کار نکرد (صفحه‌ی ۲ تکراری است)'; break; }     // پایانِ واقعی نیست؛ فهرست ناقص است
      natural = true; stop = 'صفحه ' + (i + 1) + ' کارت تازه نداشت'; break;
    }
    url = findNext(doc, url, i);
  }
  if (!out.length) throw new Error('محصولی پیدا نشد');
  return { items: out, complete: natural && !failed, note: pages + ' صفحه؛ ' + (stop || 'سقف صفحه') };
}
var METHOD = {};
async function wooOrHtml(base, start, net, rep, mode) {
  if (METHOD[base] !== 'html') {
    try { var w = await wooSource(base, net, rep, mode); METHOD[base] = 'woo'; return w; }
    catch (e1) {
      if (METHOD[base] === 'woo') throw e1;                // قبلاً کار می‌کرده؛ خطای گذرا است
      try { var h = await htmlSource(start, net, rep, mode); METHOD[base] = 'html'; return h; }
      catch (e2) { throw new Error('API: ' + e1.message + ' | HTML: ' + e2.message); }
    }
  }
  return htmlSource(start, net, rep, mode);
}

var SOURCES = [
  { id: 'liliome', name: 'لیلیوم', trusted: true, run: function (net, rep, mode) { return wooSource('https://liliome.com', net, rep, mode); } },
  { id: 'digikala', name: 'دیجی‌کالا', trusted: true, run: function (net, rep, mode) { return digikalaSource(net, rep, mode); } },
  { id: 'safir', name: 'سفیر', run: function (net, rep, mode) { return wooOrHtml('https://www.safirstores.com', 'https://www.safirstores.com/category/perfume', net, rep, mode); } },
  { id: 'hiland', name: 'هایلند', run: function (net, rep, mode) { return wooOrHtml('https://hilandbeauty.com', 'https://hilandbeauty.com/fa/%D8%B9%D8%B7%D8%B1-%D9%88-%D8%A7%D8%AF%DA%A9%D9%84%D9%86', net, rep, mode); } }
];

root.Core = { reconcile: reconcile, CLEANSE: CLEANSE, cleanseText: cleanseText, cleanBrandName: cleanBrandName, itemUrl: itemUrl, STALE_MIN: STALE_MIN, fa2en: fa2en, en2fa: en2fa, enTokens: enTokens, titleEn: titleEn, tree: tree, brandOf: brandOf, specInfo: specInfo, enrichTitle: enrichTitle, genderOf: genderOf, nameCmp: nameCmp, CFG: CFG, newDb: newDb, dbIndex: dbIndex, ingest: ingest, ingestAsync: ingestAsync, buildList: buildList, normFa: normFa, parseTitle: parseTitle, aggregate: aggregate, SOURCES: SOURCES, extractCards: extractCards,
  wooSource: wooSource, digikalaSource: digikalaSource, htmlSource: htmlSource, letterOf: letterOf, median: median, priceFromText: priceFromText, similar: similar };
if (typeof module !== 'undefined') module.exports = root.Core;
})(typeof window !== 'undefined' ? window : globalThis);
