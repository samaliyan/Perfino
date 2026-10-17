/* منطق داده: خواندن سایت‌ها، یکی‌کردن نام‌ها، محاسبهٔ یک قیمت. بدون وابستگی به رابط. */
(function (root) {
'use strict';

/* ---------- متن ---------- */
var HTML_ENT = Object.assign(Object.create(null), { amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>', hellip: '…', laquo: '«', raquo: '»', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•', middot: '·', copy: '©', reg: '®', zwnj: '\u200c', zwj: '\u200d' });      // بدونِ prototype: «&constructor;» نباید تابع شود
function decodeEnt(s) {      // یک بار می‌خواند (نه چندبار)؛ «&amp;lt;» می‌شود «&lt;» نه «<». موجودیتِ ناشناخته = فاصله
  return s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, function (m, e) {
    if (e.charAt(0) === '#') { var n = e.charAt(1).toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1); try { return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' '; } catch (x) { return ' '; } }
    var v = HTML_ENT[e.toLowerCase()]; return v === undefined ? ' ' : v;
  });
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
  s = decodeEnt(String(s == null ? '' : s)); if (/&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(s)) s = decodeEnt(s);      // «&amp;amp;» (دوبار رمزشده) هم
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
var EXCL = /تستر|tester|نمونه|سمپل|sample|گیفت|gift ?set|ست هدیه|مینیاتور|miniature|دکانت|decant|اسانس|تکه ای|ریفیل|refill|بادی ?اسپری|body ?(spray|mist|lotion|wash)|لوسیون|شمع|خوشبو ?کننده|اسپری بدن|دئودورانت|دیودورانت|deodorant|ژل دوش|shower|کرم |اسپری مو|هیر ?میست|hair ?mist|شامپو|روغن عطر|عطر روغنی|رول ?ان|roll ?on|صابون|(^| )پک |(^| )ست( |$)|\bset\b|\bkit\b|(^| )کیت( |$)|مجموعه|جا ?عطری|\d+ ?تایی|\d+ ?عددی|(?:دو|سه|چهار|پنج|شش) ?(?:عددی|تایی)|\d{2,3} ?(?:ml|میل) ?[x×] ?[2-9](?!\d)|(?:^|[^\d])[2-9] ?[x×] ?\d{2,3} ?(?:ml|میل)|عمده|بدون ?(جعبه|پلمب)|پلمب شکسته|دست دوم|کارکرده|اکسسوری|مشابه|کپی|الهام ?گرفته|\binspired\b|\bclone\b|ایمیتیشن|imitation|هم ?رایحه|افتر ?شیو|آفتر ?شیو|after ?shave|body ?splash|بادی ?اسپلش|hair ?perfume|عطر مو|perfume ?oil|\bcandle\b|\bsoap\b|\bunboxed\b|without ?box|\bused\b|بدون ?کارتن|یدک|\d ?pack\b|\d+ ?عدد(?![؀-ۿ])|تقسیمی|بدون ?برچسب|فاقد ?جعبه|استوک|(^| )طرح( |$)|عطر ماشین|خوشبو ?کننده|room ?spray|\bcar\b|\bcream\b|کرم|\bshampoo\b|\blotion\b|\bdupe\b|similar to|gift ?pack|gift ?box|پک هدیه|\bpack\b|ماسک (صورت|مو|پوست)|(صورت|مو) ماسک|(face|hair|sheet) ?mask|بادی ?میست|fragrance ?mist|\bmist\b|body ?(butter|scrub|oil|crem|creme)|\bbutter\b|\bscrub\b|hair ?oil|gel ?douche|\bcr[eè]me\b|diffuser|\bdeo\b|دئو|coffret|\bduo\b|بخور|\d ?x ?\d|روغن (مو|بدن)|معادل|الهامی|\balternative\b|\bequivalent\b|\bimpression\b/;
var STOP = {};
('فقط تنها عطر ادکلن ادکلون مردانه زنانه مردونه زنونه یونیسکس یونی اورجینال اصل اصلی original حجم میلی لیتر لیتری برند مدل مناسب خرید قیمت فروش اسپری spray for men women unisex ml oz by ادو cc fl نسخه جدید پرفروش ارجینال تضمینی دخترانه پسرانه بچگانه ویژه رایگان ارسال گارانتی پلمپ پلمب کارتن جعبه باکس box عطرادکلن وارداتی اروپایی ایتالیایی تخفیف موجود هدیه فوری نمایندگی رسمی لوکس کیفیت کوالیتی perfume fragrance genuine authentic sale shipping france mens womens stock instock ضمانت اصالت عالی انبار سریع نوروز عددی brand box damaged vintage ترین بهترین برتر پرطرفدار محبوب تازه محصول کالا نیش niche luxury ایرانی اقایان اقایون آقایان آقایون بانوان خانم خانمها female ladies اوریجینال اورجینال ارجینال آنلاین فروشگاه batch بارکد barcode').split(' ').forEach(function (w) { STOP[w] = 1; });
var RE_SIZE = /(\d+(?:\.\d+)?)\s*(?:میلی ?لیتر|میلی ?گرم|میلی|میل|مل|ml|cc)(?![a-zا-ی])/g;      // «۳۰ میلی گرم» در عنوانِ عطر غلطِ تایپی «میلی لیتر» است
var RE_OZ = /(\d+(?:\.\d+)?)\s*(?:fl\.? ?)?oz(?![a-z])/g;
var CONC = [
  ['ادوپرفیوم', /ا?دوپرفیوم|ادو ?پرفیوم|ادو ?پارفوم|ادو ?پرفوم|او ?د[وی] ?پرفیوم|ادی ?پرفیوم|اد ?پرفیوم|eau d[ue] parfum|\bedp\b|e\.d\.p/g],
  ['ادوتویلت', /ا?دوتویلت|ادو ?تویلت|ادو ?توالت|ادو ?تواله|او ?د[وی] ?تو[یا]لت|ادی ?تویلت|اد ?تویلت|eau d[ue] toilette|\bedt\b/g],
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
  var w = /زنانه|زنونه|بانوان|خانم|\bwomens?\b|\bwoman\b|\bfemale\b|\bladies\b|for her|pour elle/.test(t);
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
var REJ = { n: 0, by: {}, ex: [] };      // عنوان‌هایی که «بازرسیِ نام» ردشان کرد: شمارش به تفکیکِ دلیل و چند نمونه
/* ---------- بازرسیِ نام (مرحله‌ی ثابتِ خط پالایش) ----------
   هر عنوان پیش از ورود به فهرست سنجیده می‌شود: شماره‌ی تماس، قیمت یا آدرس/آیدی داخل نام، سازنده‌ی تقلیدی، «مدل <برند>» و واژه‌های ممنوعِ خودِ کاربر. */
var BLOCK_RE = null;
function setBlock(words) {
  var w = (words || []).map(function (x) { return normFa(String(x), true).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ?'); }).filter(function (x) { return x.length >= 2; });
  BLOCK_RE = w.length ? new RegExp(w.join('|')) : null;
}
var CLONE_MAKERS = /نیوویش|new ?wish|اسمارت ?کالکشن|smart ?collection|ریو ?کالکشن|rio ?collection|جانوین|johnwin|اسکلاسیک|esclassic/;
var RE_PHONE = /(?:^|[^\d])(?:\+?98|0)?9\d{2}[ -]?\d{3}[ -]?\d{4}(?!\d)|(?:^|[^\d])0[1-8]\d[ -]?\d{8}(?!\d)/;
var RE_PRICE = /\d[\d.,]*\s*(?:تومان|تومن|ریال|تومانی|هزار|دلار|درهم|\$|usd|aed|toman|rial)|(?:^|[^\d.,])(?:[2-9]|\d{2,})[\d.,]*\s*میلیون|\d+(?:[.,٫]\d+)?\s*میلیون\s*(?:تومان|تومن|ریال)|(?:قیمت|فقط|تنها|مبلغ)\s*:?\s*\d{3,}(?!\d)(?!\s*(?:میل|ml|cc|سی ?سی|گرم|oz|اونس))/;
var RE_CONTACT = /https?:|www\.|\.(?:com|ir|net|org)\b|@[a-z0-9_.]{3,}|تلگرام|واتس ?اپ|واتساپ|اینستاگرام|instagram|telegram|whatsapp|دایرکت|شماره تماس|تماس بگیرید|\bdm\b/;
function vetReason(t) {
  if (RE_PHONE.test(t)) return 'شماره‌ی تلفن در نام';
  if (RE_PRICE.test(t)) return 'قیمت داخل نام';
  if (RE_CONTACT.test(t)) return 'آدرس/آیدی/تماس در نام';
  if (CLONE_MAKERS.test(t)) return 'سازنده‌ی تقلیدی';
  if (BLOCK_RE && BLOCK_RE.test(t)) return 'واژه‌ی ممنوعِ شما';
  if (isCloneTitle(t)) { CLEANSE.clone = (CLEANSE.clone || 0) + 1; return 'clone'; }
  return '';
}
/* کالای «به سبکِ» یک عطرِ معروف: «پرفیوم مردانه های نیوویش مدل ورساچه اروس» = ساخته‌ی شرکتِ دیگر، نه ورساچه.
   نشانه: پیش از «مدل» نامِ سازنده‌ی ناشناخته هست و بعد از «مدل» نامِ برندِ شناخته‌شده. چنین کالایی قیمتِ عطرِ اصلی را خراب می‌کند و وارد فهرست نمی‌شود. */
var CLONE_GEN = {}; 'عطر ادکلن ادکلون مردانه زنانه مردونه زنونه یونیسکس پرفیوم ادو ادوپرفیوم ادوتویلت پارفوم parfum perfume edp edt cologne men women مناسب خانم آقایان بانوان'.split(' ').forEach(function (w) { CLONE_GEN[w] = 1; });
function isCloneTitle(t) {
  var sm = /(?:^| )با (?:رایحه|بوی|عطر)(?: ی)? (.+)$/.exec(t);          // «با رایحه‌ی ساواج» = تقلید؛ «با رایحه‌ی خنک» فقط توضیح است (برای این یکی کالا رد نمی‌شود)
  if (sm) {
    var af = sm[1].split(' ').filter(function (w) { return w && !STOP[w] && !CLONE_GEN[w] && !/^\d+(?:ml|cc|میل)?$/.test(w); }).map(function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); });
    if (af.length && brandOf(af, [], true).id !== 'other') return true;
  }
  var tk = t.split(/\s+/), i = tk.indexOf('مدل');
  if (i < 0) i = tk.indexOf('model');
  if (i < 1 || i >= tk.length - 1) return false;
  var nk = function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); };
  var before = tk.slice(0, i).filter(function (w) { return w && !STOP[w] && !CLONE_GEN[w] && !/^\d+$/.test(w); }).map(nk);
  var after = tk.slice(i + 1).filter(function (w) { return w && !STOP[w] && !CLONE_GEN[w] && !/^\d+(?:ml|cc|میل)?$/.test(w); }).map(nk);      // اندازه، غلظت و واژه‌های تبلیغاتی از آنچه بعد از «مدل» آمده کنار می‌رود
  if (!before.length || !after.length) return false;
  if (/^(pour (un )?(homme|femme|hom)|the one|homme|femme|پور (اون )?(هوم|فم))$/.test(after.join(' '))) return false;      // «Model Pour Homme» نامِ عمومی است، نه عطرِ یک برند
  return brandOf(after, []).id !== 'other' && brandOf(before, [], true).id === 'other';
}
/* توضیحِ تبلیغاتی داخل عنوان نامِ عطر نیست: «با رایحه‌ی خنک»، «با ساختار ترش»، «مناسب فصل بهار» ... تا اندازه/غلظت یا آخر عنوان */
var DESC_END = '(?= \\d| ادو| دوپرفیوم| دوتویلت| ادکلن| ادوپرفیوم| edp| edt| parfum| eau|$)';
var RE_DESC = new RegExp('(?:^| )(?:همراه )?(?:با|دارای|حاوی) ?(?:ساختار|رایحه|رایجه|رایحه ی|بوی|بو|نت|نوت|نت ها|نت های|نوت ها|نوت های|ترکیب|طعم|حس|فضای|پایه|اسانس|عطر|ماندگاری|پخش|کیفیت|تم|ته ?مایه|عصاره|مواد|آروما|رنگ)(?: [^\\d]*?)?' + DESC_END, 'g');
var RE_SEASON = new RegExp('(?:^| )(?:مناسب|ویژه|مخصوص|برای)(?: ی)? (?:فصل|روزهای|روز|شب|تابستان|زمستان|بهار|پاییز)(?: [^\\d]*?)?' + DESC_END, 'g');
var SMELL = 'گرم|خنک|شیرین|تلخ|ترش|تند|ملایم|سرد|شرقی|چوبی|گلی|میوه ?ای|ادویه ?ای|تازه|مرکباتی|پودری|وانیلی|خوش|دودی|عنبری';
var RE_SMELL = new RegExp('(?:^| )(?:رایحه|رایجه|ساختار)(?: ی)?(?: (?:رایحه|و|با))*(?: (?:' + SMELL + '))(?: (?:و|' + SMELL + '))*(?= |$)', 'g');
function stripDesc(t) { t = t.replace(/([a-z])(?=[آ-ی])/g, '$1 ').replace(/([آ-ی])(?=\d)/g, '$1 ').replace(/(\d)(?=[آ-ی])/g, '$1 '); return t.replace(RE_DESC, ' ').replace(RE_SMELL, ' ').replace(/ با مجسمه(?= |$)/g, ' ').replace(RE_SEASON, ' ').replace(/ فصل (?:بهار|تابستان|پاییز|زمستان)(?= |$)/g, ' ').replace(/\s+/g, ' ').trim(); }
function isNameless(p) { var e = brandOf(p.key, []); return e.id !== 'other' && !stripBrand(p.key, e).length; }      // فقط نامِ برند؛ نامِ عطر پیدا نشد
var RE_PTAIL = /\s*(?=[\d۰-۹,٬٫.%\s]*[,٬%])[\d۰-۹][\d۰-۹,٬٫.%\s]*(?:تومان|تومن|ریال)\s*$/;
function stripPriceTail(t) { return String(t).replace(RE_PTAIL, '').trim(); }      // «نام عطر10,230,000%1 58,695,500 تومان»: قیمتِ چسبیده به آخر عنوان نام نیست
function parseTitle(raw) {
  var t = normFa(stripPriceTail(String(raw == null ? '' : raw).replace(/<[^>]*>/g, ' ')), true);
  t = t.replace(/(\d)[,٫](\d{1,2})(?=\s*(?:fl|oz|میل(?!یون)|ml))/g, '$1.$2');          // «3,4 oz» = 3.4 oz
  t = t.replace(/[()\[\]{}]/g, ' ').replace(/[،؛؟٪٫٬٭]/g, ' ').replace(/\b(?:number|n ?°|n\.|no\.)\s*(\d)/g, 'no $1').replace(/(?:نامبر|نمبر|شماره)\s*(\d)/g, 'نامبر $1');
  if (!t) return null;
  if (EXCL.test(t)) { REJ.n++; return null; }
  var vr = vetReason(t); if (vr) { REJ.n++; REJ.by[vr] = (REJ.by[vr] || 0) + 1; if (REJ.ex.length < 40 && vr !== 'clone') REJ.ex.push([vr, String(raw).slice(0, 90)]); return null; }
  var tailG = ''; t = t.replace(/(\d\s*(?:ml|میل))\s+([wmu])\s*$/i, function (_, a, g) { tailG = g.toLowerCase(); return a; });      // «... 100ml W» (هایلند): حرفِ آخر جنسیت است
  t = stripDesc(t);
  var m, sizes = [];
  RE_SIZE.lastIndex = 0;
  while ((m = RE_SIZE.exec(t))) sizes.push(+m[1]);
  if (!sizes.length) { RE_OZ.lastIndex = 0; while ((m = RE_OZ.exec(t))) sizes.push(Math.round(+m[1] * 29.5735)); }
  if (!sizes.length && (m = /حجم\s*:?\s*(\d+(?:\.\d+)?)/.exec(t))) sizes.push(+m[1]);
  if (!sizes.length) return null;
  var ml = Math.round(sizes[0]);
  var bz = 0, bd = 0.035;                                                // نزدیک‌ترین اندازه‌ی استاندارد (۴.۲ اونس = ۱۲۴ میل باید ۱۲۵ شود نه ۱۲۰)
  [25, 30, 35, 40, 45, 50, 60, 75, 80, 90, 100, 110, 120, 125, 150, 175, 200, 250, 300].forEach(function (z) { var d = Math.abs(ml - z) / z; if (d < bd) { bd = d; bz = z; } });
  if (bz) ml = bz;
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
    var le0 = latin.length ? brandOf(cleanToks(latin), [], true) : { id: 'other' };
    if (/(^| )مدل [a-z]/.test(k) && latin.length) shown = toks;                      // «داویدف مدل Zino»: واژه‌ی لاتینِ بعد از «مدل» نامِ خودِ عطر است
    else if (fe.id !== 'other' && !stripBrand(fcn, fe).length) shown = toks;
    else if (fe.id === 'other' && le0.id !== 'other') shown = toks;                      // «Lattafa خمره»: برندِ لاتین + نامِ فارسی؛ برند نباید گم شود                 // نامِ برند فارسی و نامِ عطر لاتین («دیور مدل Sauvage»)
    else {                                                                              // «اروس Flame»: واژه‌ی خطِ محصول (لاتین) جزو نام است
      var D = nameDict(), extra = [];
      latin.forEach(function (w) { if (LINEW[w]) { var pf = D.e2f[w]; var add = pf ? pf.split(' ') : [w]; if (add.every(function (x) { return fcn.indexOf(NK0(x)) >= 0; })) return; add.forEach(function (x) { extra.push(x); }); } });
      if (extra.length) shown = fa.concat(extra);
    }
  }
  if (!shown.length) return null;
  shown = cleanToks(shown).filter(function (w) { return w.length > 1 || /[a-z0-9]/.test(w); });      // حرفِ تکِ فارسی = باقی‌مانده‌ی خراب
  if (!shown.length || !meaningful(shown)) { CLEANSE.junk++; return null; }
  var nseen = {}; shown = shown.filter(function (w) { if (!/^\d+$/.test(w)) return true; if (nseen[w]) return false; nseen[w] = 1; return true; });      // «2004 ... 2004» (سالِ تکراری در بخشِ فارسی و انگلیسیِ عنوان)
  var lw = shown[shown.length - 1], pgn = '';
  if (shown.length > 2 && (lw === 'من' || lw === 'وومن' || lw === 'ومن')) { pgn = lw === 'من' ? 'm' : 'w'; shown = shown.slice(0, -1); lw = shown[shown.length - 1]; }
  if (shown.length > 2 && (lw === 'man' || lw === 'woman' || lw === 'مرد' || lw === 'زن')) {      // «Man/Woman» آخرِ عنوان = جنسیت؛ مگر اینکه نامِ خودِ عطر باشد (Jimmy Choo Man)
    var tmp = shown.slice(0, -1), te = brandOf(tmp, []);
    if (te.id === 'other' || stripBrand(tmp, te).length) shown = tmp;
  }
  var key = canonBrand(shown.map(function (w) { return w.replace(/آ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی'); }));
  var name = shown.map(function (w) { return hasFa ? w : cap(w); }).join(' ');
  return { key: key, name: name, conc: conc, ml: ml, fa: hasFa, gn: genderOf(t) || pgn || (tailG === 'w' ? 'w' : tailG === 'm' ? 'm' : tailG === 'u' ? 'u' : '') };
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

/* چرا این عنوان وارد فهرست نشد؟ (برای ابزارِ «چرا یک عطر نیست؟» در تنظیمات پیشرفته) */
function explainTitle(raw) {
  var r0 = REJ.n, b0 = Object.assign({}, REJ.by), ex0 = REJ.ex.length, c0 = CLEANSE.clone | 0, j0 = CLEANSE.junk | 0, n0 = CLEANSE.nameless | 0;
  var p = parseTitle(raw), why = '';
  REJ.n = r0; REJ.by = b0; REJ.ex.length = ex0; CLEANSE.clone = c0; CLEANSE.junk = j0; CLEANSE.nameless = n0;
  if (p) return { ok: true, ml: p.ml };
  var t = normFa(stripPriceTail(String(raw == null ? '' : raw).replace(/<[^>]*>/g, ' ')), true);
  if (EXCL.test(t)) why = 'تستر، نمونه (سمپل)، ست یا کالایی که عطرِ تکی نیست';
  else {
    var cl = CLEANSE.clone | 0, vr = vetReason(t); CLEANSE.clone = cl;
    if (vr) why = vr === 'clone' ? 'کالای «به سبک» یک عطر (تقلیدی)' : vr;
    else if (!hasSizeWord(t) && !/حجم\s*:?\s*\d/.test(t)) why = 'اندازه (میل) در نام و توضیحات سایت پیدا نشد';
    else why = 'اندازه‌ی نامعتبر یا چند اندازه در یک عنوان (ست)';
  }
  return { ok: false, why: why };
}
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
var XK = {}, XK_N = 0;
function xk(w) {      // کلیدِ مستقل از خط (فارسی/لاتین): اسکلتِ همخوان‌ها
  var h = XK[w]; if (h !== undefined) return h;
  var k = null;
  if (!/\d/.test(w) && w.length >= 3) { var l = HAS_FA.test(w) ? fa2en([w], LEX).toLowerCase().replace(/[^a-z']/g, '') : w; k = skel(l) || null; if (k && k.length < 2) k = null; }
  if (++XK_N > 40000) { XK = {}; XK_N = 0; }
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
var REVC = null;
function setLex(l) { LEX = l || null; REVC = null; }
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
var SRC_BASE = { liliome: 'https://liliome.com', digikala: 'https://www.digikala.com', safir: 'https://www.safirstores.com', hiland: 'https://hilandbeauty.com',
  hes: 'https://hesperfume.ir', flower: 'https://flower-perfume.com', khalife: 'https://khalifechi.com', redmag: 'https://redmag.ir' };      // چهار سایتِ آخر فقط برای خبر هستند
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
        var tOth = srcs.filter(function (o) { return o !== s && trusted[o]; }).map(function (o) { return median(by[ml][o]); });
        if (tOth.length) others = tOth;                       // دو سایتِ ریالی با هم مقایسه نشوند؛ سنجش فقط با سایتِ مطمئن
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
  groups.forEach(function (g) { g.items.forEach(function (it) {         // سایتی که الان با سایت دیگری هم‌پوشانی ندارد هم مقیاسِ شناخته‌شده‌ی قبلی‌اش را نگه می‌دارد (وگرنه قیمتِ ریالی ۱۰ برابر دیده می‌شد)
    if (scale[it.src] === undefined && prior && prior[it.src] && !trusted[it.src]) scale[it.src] = prior[it.src];
  }); });

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
  if (lex && REVC && REVC.lex === lex) rev = REVC.rev;
  while (i < toks.length) {
    var done = false;
    for (var n = Math.min(D.emax, toks.length - i); n >= 1 && !done; n--) {
      var k = toks.slice(i, i + n).join(' ').replace(/'/g, "'"), v = D.e2f[k];
      if (!v && n === 1 && lex) {
        if (!rev) { rev = {}; Object.keys(lex).forEach(function (f) { Object.keys(lex[f]).forEach(function (e) { if (!rev[e] || rev[e].c < lex[f][e]) rev[e] = { f: f, c: lex[f][e] }; }); }); REVC = { lex: lex, rev: rev }; }
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
['آزارو', 'آزارو|ازارو|azzaro'], ['دیویدوف', 'دیویدوف|دایویدوف|داویدوف|دیویداف|دیوید اف|davidoff'], ['هرمس', 'هرمس|هرمز|hermes'], ['لاگوست', 'لاگوست|لاکوست|lacoste'],
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
['لالیک', 'لالیک|lalique'], ['لانوین', 'لانوین|lanvin'], ['اسکادا', 'اسکادا|escada'], ['دانهیل', 'دانهیل|دانهل|dunhill'], ['جوپ', 'جوپ|جوب|ژوپ|ژوب|joop'], ['آدیداس', 'آدیداس|adidas'], ['ناتیکا', 'ناتیکا|nautica'],
['پلی بوی', 'پلی بوی|playboy'], ['لومانی', 'لومانی|lomani'], ['ژاک بوگارت', 'ژاک بوگارت|jacques bogart'], ['تاور', 'تاور|tauer perfumes|tauer'], ['بریتنی اسپیرز', 'بریتنی اسپیرز|britney spears'],
['جنیفر لوپز', 'جنیفر لوپز|jennifer lopez'], ['الکساندر جی', 'الکساندر جی|alexandre j'], ['اورتو پاریسی', 'اورتو پاریسی|orto parisi'], ['باند نامبر ۹', 'باند نامبر 9|bond no 9'],
['ماریاژ', 'ماریاژ|mariage freres'], ['آتلیه کلن', 'آتلیه کلن|atelier cologne'], ['ژولیت هو ا گان', 'ژولیت هو ا گان|juliette has a gun'], ['سرج لوتنس', 'سرج لوتنس|serge lutens'],
['هالستون', 'هالستون|halston'], ['کنت کول', 'کنت کول|kenneth cole'], ['بی کی', 'بی کی|bebe'], ['ویکتوریا سکرت', 'ویکتوریا سکرت|victoria secret|victorias secret|victoria s secret'],
['نوبایا', 'نوبایا|nobaya'], ['ادینگتون', 'ادینگتون|edington'],
['لویی ویتون', 'لویی ویتون|لوئی ویتون|لویس ویتون|louis vuitton'], ['ایو روشه', 'ایو روشه|ایو روشر|yves rocher'], ['تیفانی', 'تیفانی|تیفانی اند کو|tiffany'], ['فندی', 'فندی|fendi'],
['بالنسیاگا', 'بالنسیاگا|بالنسیاگا|balenciaga'], ['لووه', 'لووه|لوئه|loewe'], ['میزون الهمبرا', 'میزون الهمبرا|مایزون الهمبرا|maison alhambra'], ['الرحاب', 'الرحاب|الرحب|al rehab'],
['فرانک الیور', 'فرانک الیور|franck olivier'], ['ارد الزعفران', 'ارد الزعفران|ard al zaafaran'], ['الیزابت آردن', 'الیزابت آردن|الیزابت اردن|elizabeth arden'],
['استی لودر', 'استی لودر|استی لاودر|estee lauder'], ['کلینیک', 'کلینیک|کیلینیک|clinique'], ['سالوادور دالی', 'سالوادور دالی|salvador dali'], ['آنتونیو باندراس', 'آنتونیو باندراس|antonio banderas'],
['شکیرا', 'شکیرا|shakira'], ['بیانسه', 'بیانسه|beyonce'], ['ریحانا', 'ریحانا|rihanna'], ['پاریس هیلتون', 'پاریس هیلتون|paris hilton'], ['کیم کارداشیان', 'کیم کارداشیان|kim kardashian'],
['لیدی گاگا', 'لیدی گاگا|lady gaga'], ['ژاکومو', 'ژاکومو|jacomo'], ['چروتی', 'چروتی|cerruti'], ['روشاس', 'روشاس|rochas'], ['زادیگ و ولتر', 'زادیگ و ولتر|zadig voltaire|zadig and voltaire'],
['تام تیلور', 'تام تیلور|tom tailor'],
['کارون', 'کارون|caron'],
['گی لاروش', 'گی لاروش|guy laroche'],
['پلیس', 'police'],
['اورینتیکا', 'اورینتیکا|orientica'],
['امپر', 'امپر|emper'],
['برات', 'brut'],
['اولد اسپایس', 'اولد اسپایس|old spice'],
['فلوریس', 'فلوریس|floris'],
['هوبیگان', 'هوبیگان|houbigant'],
['فرگرنس ورلد', 'فرگرنس ورلد|fragrance world'],
['آیگنر', 'آیگنر|aigner'],
['جگوار', 'جگوار|jaguar'],
['مکس', 'mexx'],
['دوپونت', 'اس تی دوپونت|دوپونت|st dupont|dupont'],
['یاردلی', 'یاردلی|yardley'],
['وینس کامتو', 'وینس کامتو|vince camuto'],
['فراری', 'فراری|ferrari'],
['لامبورگینی', 'لامبورگینی|lamborghini'],
['بوگاتی', 'بوگاتی|bugatti'],
['شوپارد', 'شوپارد|chopard'],
['کورژ', 'کورژ|courreges'],
['اترو', 'اترو|etro'],
['کوچ', 'coach'],
['دیزل', 'دیزل|diesel'],
['دی اسکوئرد', 'دی اسکوئرد|دیاسکوئرد|dsquared2|dsquared'],
['بنتون', 'بنتون|benetton'],
['شیسیدو', 'شیسیدو|shiseido'],
['زگنا', 'زگنا|ermenegildo zegna|zegna'],
['توس', 'tous'],
['پری الیس', 'پری الیس|perry ellis'],
['جیانفرانکو فره', 'جیانفرانکو فره|gianfranco ferre|ferre'],
['کایالی', 'کایالی|kayali'],
['عربیان عود', 'عربیان عود|arabian oud'],
['گیسادا', 'گیسادا|gisada'],
['زیمایا', 'زیمایا|zimaya'],
['پاریس کورنر', 'پاریس کورنر|paris corner'],
['نوسوک', 'نوسوک|nusuk'],
['احمد المغربی', 'احمد المغربی|ahmed al maghribi'],
['بی دی کی', 'بی دی کی|bdk parfums|bdk'],
['اورموند جین', 'اورموند جین|ormonde jayne'],
['میکالف', 'میکالف|m micallef|micallef'],
['کریولی', 'کریولی|maison crivelli|crivelli'],
['لورنزو ویلورسی', 'لورنزو ویلورسی|lorenzo villoresi'],
['گولدفیلد اند بنکس', 'گولدفیلد اند بنکس|goldfield banks'],
['دوسیتا', 'دوسیتا|parfums dusita|dusita'],
['فرانک بوکله', 'فرانک بوکله|franck boclet'],
['ریان', 'reyane tradition'],
['جیاردینی دی توسکانا', 'جیاردینی دی توسکانا|giardini di toscana']
];
/* ---------- «خطِ عطر → برند»: عنوانی که برند ندارد ولی نامِ عطرِ معروف دارد («ساواج»، «Acqua di Gio»، «پور اون هوم») زیر «سایر برندها» نرود ---------- */
var LINE_BRAND = [
['دیور', 'sauvage|ساواج|ساوج|ساوژ|eau sauvage|fahrenheit|فارنهایت|فرنهایت|j\'adore|جادور|ژادور|hypnotic poison|هیپنوتیک پویزن|dune|دون|homme intense|هوم اینتنس'],
['شنل', 'coco mademoiselle|کوکو مادمازل|کوکو مادموازل|coco noir|کوکو نویر|allure homme|الور هوم|egoiste|اگویست|bleu de chanel|بلو دو شنل|n5|no 5|نامبر 5|نامبر پنج'],
['ایو سن لوران', 'black opium|بلک اپیوم|بلک اوپیوم|libre|لیبر|la nuit de l\'homme|لا نویت د لهوم|کوروس|kouros|mon paris|مون پاریس|y le parfum|opium|اپیوم'],
['لانکوم', 'la vie est belle|لا وی است بل|لاویه است بل|لا ویه است بل|idole|ایدول|tresor|ترزور|hypnose|هیپنوز|miracle|میراکل'],
['جورجیو آرمانی', 'acqua di gio|aqua di gio|acqua di gioia|آکوا دی جیو|اکوا دی جیو|آکوا دی جو|اکوا دی جو|stronger with you|استرانگر ویت یو|armani code|آرمانی کد|my way|مای وی'],
['ورساچه', 'eros|اروس|dylan blue|دیلان بلو|دیلن بلو|bright crystal|بریت کریستال|برایت کریستال|yellow diamond|یلو دایموند|crystal noir|کریستال نویر|man eau fraiche|من او فرش|pour homme'],
['پاکو رابان', '1 million|one million|وان میلیون|وان میلیون|invictus|اینویکتوس|اینویکتس|lady million|لیدی میلیون|olympea|المپیا|phantom|فانتوم|black xs|بلک ایکس اس|pure xs|پیور ایکس اس'],
['کارولینا هررا', 'good girl|گود گرل|bad boy|بد بوی|very good girl|وری گود گرل|212 vip|212 وی آی پی|212 men|212 sexy|212 سکسی'],
['دولچه و گابانا', 'light blue|لایت بلو|the one|دوان|د وان|devotion|دیووشن'],
['کرید', 'aventus|اونتوس|اوینتوس|اونتس|آونتوس|silver mountain water|سیلور مانتین واتر|green irish tweed|گرین ایریش توید|viking|وایکینگ'],
['تام فورد', 'oud wood|عود وود|tobacco vanille|توباکو وانیل|lost cherry|لاست چری|black orchid|بلک ارکید|ombre leather|امبر لدر|نویر د نویر|noir de noir|fucking fabulous|فاکینگ فبولوس|soleil blanc|سولیل بلان'],
['مزون فرانسیس کورکجان', 'baccarat rouge 540|باکارات روژ 540|باکارات روژ|باکارات|baccarat'],
['پارفومز د مارلی', 'layton|لایتون|herod|هرود|pegasus|پگاسوس|delina|دلینا|galloway|گالووی|percival|پرسیوال'],
['کارون', 'pour un homme|پور اون هوم|پور ان هوم|پور آن هوم|پور اون هوم'],
['گوچی', 'gucci guilty|گیلتی|flora|فلورا گورجس|bloom|بلوم'],
['پرادا', 'luna rossa|لونا روسا|candy|کندی|infusion d iris|اینفیوژن دی ایریس'],
['ژان پل گوتیه', 'le male|لو میل|له میل|لومیل|ultra male|اولترا میل|scandal|اسکندال|so scandal'],
['تیری موگلر', 'alien|الین|angel|انجل|اینجل|aura mugler'],
['مونت بلانک', 'legend|لجند|explorer|اکسپلورر'],
['آزارو', 'azzaro chrome|chrome|کروم|wanted|وانتد'],
['دیویدوف', 'cool water|کول واتر'],
['کالوین کلین', 'ck one|سی کی وان|eternity|اترنیتی|اترنتی|euphoria|یوفوریا|obsession|آبسشن'],
['ژیوانشی', 'gentleman|جنتلمن|l interdit|لانتردی|irresistible|ایرزیستیبل'],
['بولگاری', 'aqva|آکوا بولگاری|man in black|من این بلک|omnia|امنیا'],
['ویکتور اند رولف', 'flowerbomb|فلاوربمب|فلاور بمب|spicebomb|اسپایس بمب|bonbon|بن بن'],
['آمواج', 'interlude|اینترلود|اینترلید|reflection|ریفلکشن|jubilation|جوبیلیشن|memoir|میموآر|epic|ایپیک'],
['اینیتیو', 'oud for greatness|عود فور گریتنس|side effect|ساید افکت|atomic rose|اتمیک رز|rehab|ریهب'],
['نیشانه', 'hacivat|هاجیوات|هجیوات|fan your flames|ethereal|اترال'],
['کیلیان', 'angels share|انجلز شیر|love don t be shy|لاو دونت بی شای'],
['مزون مارجیلا', 'replica|ریپلیکا|jazz club|جز کلاب|by the fireplace|بای د فایرپلیس|lazy sunday morning|لیزی سانی مورنینگ'],
['کالوین کلین', 'ck be|سی کی بی']
];
var LB = null;
function lineTable() {
  if (LB) return LB; LB = []; var T = brandTable();
  LINE_BRAND.forEach(function (r) {
    var b = T.byName[brandNorm(r[0]).join(' ')]; if (!b) return;
    r[1].split('|').forEach(function (l) { var tk = brandNorm(l); if (tk.length) LB.push({ b: b, tk: tk }); });
  });
  LB.sort(function (x, y) { return y.tk.length - x.tk.length; });
  return LB;
}
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
/* ---- املای نزدیکِ نامِ برند: «هوگو باس» = «هوگو بوس» ؛ «ژیواتشی» = «ژیوانشی» ----
   نمایه‌ی «اسکلتِ بی‌مصوت» برای پیدا کردنِ کاندیدها، و تأیید با similar() (هر واژه حداکثر یک حرفِ هم‌صدا/مصوت فرق دارد).
   فقط نام‌های فارسی؛ نامِ تک‌واژه‌ای باید حداقل ۵ حرف باشد (که «بوس» با هر واژه‌ی دیگر اشتباه نشود) */
var FZI = null, FZ_NO = {}; 'ارمانو ارمانا ارمند ارماندو ارمان'.split(' ').forEach(function (w) { FZ_NO[w] = 1; });      // نامِ کوچکِ ایتالیایی/برندِ دیگر؛ «آرمانی» نیست
function fzKey(w) {
  return w.replace(/[صث]/g, 'س').replace(/[ذظض]/g, 'ز').replace(/ط/g, 'ت').replace(/ق/g, 'غ').replace(/گ/g, 'ک').replace(/ب/g, 'پ').replace(/ژ/g, 'ز').replace(/چ/g, 'ج')
    .replace(/[اآوویهئؤةء]/g, '').replace(/(.)\1+/g, '$1');
}
function fzOk(al) { return al.every(function (w) { return HAS_FA.test(w); }) && (al.length >= 2 || al[0].length >= 5) && al.map(fzKey).join('').length >= 3; }
function fzIndex() {
  if (FZI) return FZI; FZI = {}; var T = brandTable();
  T.list.forEach(function (b) { b.al.forEach(function (al) { if (!fzOk(al)) return; var k = fzKey(al[0]); (FZI[k] = FZI[k] || []).push({ b: b, al: al }); }); });
  return FZI;
}
/* toks از نقطه‌ی i به بعد با یکی از نام‌های برندها (به‌جز املا) می‌خواند؟ → {b, n} یا null (بلندترین) */
function fzMatch(toks, i, only, strict) {
  var best = null, c = fzIndex()[fzKey(toks[i])];
  if (!c || !HAS_FA.test(toks[i]) || FZ_NO[toks[i]]) return null;
  c.forEach(function (x) {
    if (only && x.b !== only) return;
    var n = x.al.length; if (i + n > toks.length || (best && best.n >= n)) return;
    if (strict && n < 2 && x.al[0].length !== toks[i].length && x.al[0].length < 6) return;      // نامِ تک‌واژه‌ای در متنِ عنوان: فقط جایگزینیِ حرف («اگنر» نه «ارمان»≠«ارمانی»)
    if (similar(toks.slice(i, i + n), x.al)) best = { b: x.b, n: n };
  });
  return best;
}
function fzFind(toks, maxStart, strict) {
  for (var i = 0; i < toks.length && i < maxStart; i++) { var m = fzMatch(toks, i, null, strict); if (m) return { b: m.b, p: i, n: m.n }; }
  return null;
}
function fzStrip(out, ent) {
  for (var i = 0; i < out.length && i < 4; i++) {
    var m = fzMatch(out, i, ent);
    if (m) { out = out.slice(0, i).concat(out.slice(i + m.n)); i--; }
  }
  return out;
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
function brandOf(key, hints, noLine) {
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
    if (!e) { var fz = fzFind(tk, 3); if (fz) e = fz.b; }
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
  if (!ent && !unk && !noLine) { var fz2 = fzFind(key, 1, true); if (fz2) ent = fz2.b; }
  if (!ent && !unk && !noLine) { var LT = lineTable(); for (var li = 0; li < LT.length; li++) { var at = seqAt(key, LT[li].tk); if (at === 0 && key.length - LT[li].tk.length <= 3) { ent = LT[li].b; break; } } }      // فقط وقتی نامِ خط اولِ عنوان است («Dumont Nitro Pour Homme» ورساچه نیست)      // نامِ عطرِ معروف بدونِ نامِ برند
  if (!ent && unk) ent = unk;
  if (!ent) return { id: 'other', name: 'سایر برندها', al: [] };
  return ent;
}
/* همه‌ی نام‌های برند (کوتاه و بلند) از واژه‌های عطر برداشته می‌شود؛ هر چند بار که آمده باشد */
function stripBrand(toks, ent) {
  var out = toks.slice();
  (ent.al || []).forEach(function (al) { out = stripSeqs(out, null, al); });
  if (ent.id.charAt(0) === 'b' && ent.al && ent.al.length) out = fzStrip(out, ent);      // املای نزدیک به نامِ برند
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
  var T = brandTable(), AUD = { bare: [], brands: [], models: [], n: groups.length }, bySeen = {}, fzSeen = {};
  ENT = ENT.map(function (e) {
    if (e.id.charAt(0) !== 'h') return e;
    var ks = [e.name ? brandNorm(e.name).join(' ') : '', e.en ? brandNorm(e.en).join(' ') : ''].filter(Boolean), to = null;
    ks.some(function (k) { if (T.byName[k]) { to = T.byName[k]; return true; } if (bySeen[k]) { to = bySeen[k]; return true; } return false; });
    if (!to && e.name) {                                  // دو برندِ ناشناختهٔ هم‌نام با املای متفاوت («ژیواتشی»/«ژیوانشی»)
      var tk0 = brandNorm(e.name);
      if (tk0.length && fzOk(tk0)) {
        var fk = fzKey(tk0[0]), cl = fzSeen[fk] = fzSeen[fk] || [];
        cl.some(function (o) { if (o.tk.length === tk0.length && similar(tk0, o.tk)) { to = o.e; return true; } return false; });
        if (!to) cl.push({ tk: tk0, e: e });
      }
    }
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
/* نمایه‌ی نامِ مدل‌ها: به‌جای مقایسه‌ی همه‌ی جفت‌ها (n² ؛ برای ۶۰۰۰ مدل ۱۸ میلیون مقایسه) فقط مدل‌هایی که واژه‌ای نزدیک (یک حرف فرق) یا هم‌آوا دارند کاندید می‌شوند.
   هر کاندیدی که nameLike بگوید همیشه در این فهرست هست (واژه‌ی کم‌تکرارِ مدل در نمایه‌ی «حذفِ یک حرف» و «اسکلتِ آوایی» جست‌وجو می‌شود) */
function delVars(w) { var o = [w]; if (w.length >= 3) for (var i = 0; i < w.length; i++) o.push(w.slice(0, i) + w.slice(i + 1)); return o; }
function nameIndex(ms) {
  var R1 = {}, RX = {}, i, t, v;
  function add(R, k, x) { var a = R[k]; if (a) { if (a[a.length - 1] !== x) a.push(x); } else R[k] = [x]; }
  var LT = ms.map(function (m) { return isFaArr(m.rk) ? enOf(m.rk) : m.rk; });
  ms.forEach(function (m, i) {
    m.rk.forEach(function (w) { delVars(w).forEach(function (k) { add(R1, k, i); }); });
    LT[i].forEach(function (w) { add(RX, skel(w), i); });
  });
  return function cand(i) {
    var m = ms[i], seen = {}, out = [], best = null, bn = 1e9;
    m.rk.forEach(function (w) { var n = (R1[w] || []).length; if (n < bn) { bn = n; best = w; } });
    if (best != null) delVars(best).forEach(function (k) { (R1[k] || []).forEach(function (j) { if (j > i && !seen[j]) { seen[j] = 1; out.push(j); } }); });
    var bx = null; bn = 1e9;
    LT[i].forEach(function (w) { var n = (RX[skel(w)] || []).length; if (n < bn) { bn = n; bx = w; } });
    if (bx != null) (RX[skel(bx)] || []).forEach(function (j) { if (j > i && !seen[j]) { seen[j] = 1; out.push(j); } });
    return out.sort(function (x, y) { return x - y; });
  };
}
function inspectBrand(b, AUD) {
  var ms = b.models, i, j;
  AUD.checked = (AUD.checked | 0) + ms.length;
  if (b.id === 'other') { AUD.nunk = ms.length; AUD.unk = ms.slice(0, 14).map(function (m) { return m.name; }); }      // برندِ ناشناخته: تعداد و نمونه برای بازبینی
  var cand = nameIndex(ms), byName = {};
  function sus(x, y) {
    AUD.nsus = (AUD.nsus | 0) + 1;
    if ((AUD.sus = AUD.sus || []).length < 30) AUD.sus.push(b.name + ': ' + ms[x].name + ' ≈ ' + ms[y].name);
  }
  for (i = 0; i < ms.length; i++) {
    var nm = ms[i].name || '';
    if (!nm || /^[\d\s]+$/.test(nm) && nm.replace(/\s/g, '').length > 3) { AUD.njunk = (AUD.njunk | 0) + 1; if ((AUD.junk = AUD.junk || []).length < 20) AUD.junk.push(b.name + ': ' + nm); }
    (byName[nm] = byName[nm] || []).push(i);
  }
  Object.keys(byName).forEach(function (k) { var a = byName[k]; for (var x = 0; x < a.length; x++) for (var y = x + 1; y < a.length; y++) sus(a[x], a[y]); });
  for (i = 0; i < ms.length; i++) cand(i).forEach(function (j) { if (ms[i].name !== ms[j].name && nameLike(ms[i].rk, ms[j].rk)) sus(i, j); });
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
  var ms = b.models, gone = {}, cand = nameIndex(ms);
  for (var i = 0; i < ms.length; i++) {
    if (gone[i]) continue;
    var cs = cand(i);
    for (var jj = 0; jj < cs.length; jj++) {
      var j = cs[jj];
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
  if (x.img) { g.im = g.im || {}; if (!g.im[src]) g.im[src] = String(x.img).replace(/^http:\/\//i, 'https://'); }      // برنامه فقط https می‌پذیرد
  if (x.big) { g.bi = g.bi || {}; if (!g.bi[src]) g.bi[src] = String(x.big).replace(/^http:\/\//i, 'https://'); }
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
    if (!x || x.id == null) return;                       // ردیفِ خراب یا بی‌شناسه کل تکه را نمی‌اندازد
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
    if (x.e && isNameless(p)) {                           // عنوان نامِ عطر نداشت (فقط توضیح بود): از نشانیِ صفحه (slug) که نامِ لاتین دارد کمک می‌گیریم
      var p2 = parseTitle(x.e + ' ' + p.ml + ' ml' + (p.conc ? ' ' + p.conc : ''));
      if (p2 && p2.ml === p.ml && !isNameless(p2)) { p2.gn = p2.gn || p.gn; p2.conc = p2.conc || p.conc; p = p2; CLEANSE.healed = (CLEANSE.healed | 0) + 1; }
    }
    if (isNameless(p)) { CLEANSE.nameless = (CLEANSE.nameless | 0) + 1; (CLEANSE.nlEx = CLEANSE.nlEx || []).length < 30 && CLEANSE.nlEx.push(String(x.t).slice(0, 100)); }
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
function purgeStored(db) {      // بیرون‌بردنِ کالاهای ذخیره‌شده‌ای که با قاعده‌های فعلی ردّ می‌شوند
  var n = 0, rk = 0, R0 = { n: REJ.n, by: Object.assign({}, REJ.by), ex: REJ.ex.length, junk: CLEANSE.junk | 0 };
  Object.keys(db.it || {}).forEach(function (src) {
    var M = db.it[src];
    Object.keys(M).forEach(function (pid) {
      var e = M[pid];
      if (e[2] && e[0] && db.g[e[2]] && db.g[e[2]].k.some(function (w) { return STOP[w]; })) { e[0] = ''; rk++; }      // گروهی که با قاعده‌ی قدیمی‌تر ساخته شده و واژه‌ی اضافه (آقایان/بانوان...) در کلیدش مانده: عنوان در دریافتِ کامل بعدی دوباره تحلیل می‌شود
      if (e[2] && e[0]) { var r0 = REJ.n, c0 = CLEANSE.clone | 0; var pr = parseTitle(e[0]); var isC = !pr && REJ.n > r0; CLEANSE.clone = c0; if (isC) { e[1] = 0; e[2] = 0; e[3] = 0; e[0] = ''; n++; } else if (pr && db.g[e[2]] && pr.key.join(' ') !== db.g[e[2]].k.join(' ')) { e[0] = ''; rk++; } }      // قاعده‌ی نام عوض شده: این کالا با نامِ تازه دوباره ثبت شود      // عنوان پاک می‌شود تا اگر قاعده برداشته شد، دریافتِ کامل دوباره تحلیلش کند
    });
  });
  REJ.n = R0.n; REJ.by = R0.by; REJ.ex.length = R0.ex; CLEANSE.junk = R0.junk;      // بازبینیِ حافظه شمارنده‌های گزارش را باد نکند
  if (rk) db.full = {};                       // بروزرسانیِ بعدی «کامل» باشد تا عنوانِ پاک‌شده‌ها دوباره تحلیل شود
  return n;
}
var DEDUPE_V = 8;
function ingestEnd(C, complete) {
  if (complete) {                                      // فهرستِ ناگهان خیلی کوچک‌تر شده (صفحه‌ی خطا/کپچا): پاک‌سازی نکن
    var live = Object.keys(C.M).filter(function (pid) { return C.M[pid][1] > 0; }), seenN = live.filter(function (pid) { return C.seen[pid]; }).length;      // فقط کالاهای قیمت‌دار شمرده می‌شوند: فروشگاهی که فقط موجودها را می‌دهد، ناموجودِ قبلی را «ندیده» حساب نکند
    if (live.length >= 20 && seenN < live.length * 0.7) { complete = false; C.st.suspect = true; }
  }
  if (complete === 'soft') {      // فروشگاهی که فقط موجودها را می‌دهد: ندیده = ناموجود (قیمت ۰) و نگه داشته می‌شود تا دوباره‌موجودشدن بی‌دریافتِ کامل ثبت شود؛ ۳۰ روز ندیده = پاک
    var lim = Math.floor(Date.now() / 60000) - 30 * 1440;
    Object.keys(C.M).forEach(function (pid) { if (C.seen[pid]) return; var e = C.M[pid]; if (e[1] > 0) { e[1] = 0; C.st.soldOut = (C.st.soldOut | 0) + 1; } else if (!(e[4] > lim)) { delete C.M[pid]; C.st.removed++; } });
  } else if (complete) Object.keys(C.M).forEach(function (pid) { if (!C.seen[pid]) { delete C.M[pid]; C.st.removed++; } });
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
function buildList(db, srcOrder, trusted, maxAge, only) {   // only: فقط این سایت‌ها (سایتِ خاموش‌شده در فهرست نمی‌آید)
  setLex(db.wd);
  var by = {}, now = Date.now(), stale = 0;
  Object.keys(db.it).forEach(function (s) {
    if (only && only.indexOf(s) < 0) return;
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
  var PMC = {};
  function pmOf(id) { var c = PMC[id]; if (c) return c; var m = {}; (by[id] || []).forEach(function (x) { var v = x.price * ((db.sc && db.sc[x.src]) || 1); if (!m[x.ml] || v < m[x.ml]) m[x.ml] = v; }); return (PMC[id] = m); }
  ids.forEach(function (id) {
    var g = db.g[id];
    if (g.c === '' || (g.gn || '') === '') {          // ویژگی نامشخص و یک هم‌نامِ مشخص‌تر هست → تکراری/مبهم است، نشان نده
      var sm = {}; (by[id] || []).forEach(function (x) { sm[x.src + '|' + x.ml] = 1; });
      var hide = pidx.cands(g.k, true).some(function (o) {
        var S = db.g[o]; if (!S || o === id) return false;
        if ((by[o] || []).some(function (x) { return sm[x.src + '|' + x.ml]; })) return false;   // همان سایت و همان اندازه در هر دو: جدا هستند
        var pa = pmOf(id), pb = pmOf(o), com = Object.keys(pa).filter(function (k) { return pb[k]; });
        if (com.length && com.every(function (k) { var q = pa[k] / pb[k]; return (q > 1.35 && q < 2.2) || (q < 1 / 1.35 && q > 1 / 2.2); })) return false;   // قیمتِ هم‌اندازه‌ها ۳۵٪ تا ۲.۲ برابر فرق دارد: غلظتِ دیگری است (EDT در برابر EDP)؛ پنهان نشود. بیش از آن معمولاً قیمتِ اشتباه است و پنهان می‌ماند
        return concCmp(g.c, S.c) && genCmp(g.gn || '', S.gn || '') && (g.c === '' || S.c !== '') && ((g.gn || '') === '' || (S.gn || '') !== '') && ((g.c === '' && S.c !== '') || ((g.gn || '') === '' && (S.gn || '') !== '')) && nameCmp(g.k, S.k);   // S باید دقیق‌تر از g باشد (نه هم‌سطح؛ وگرنه هر دو همدیگر را پنهان می‌کنند)
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
/* محصولی که قیمت دارد ولی در عنوان/توضیحاتِ فهرست اندازه ندارد («کلینیک هپی»): صفحه‌ی خودِ محصول خوانده می‌شود (جدولِ مشخصات).
   نتیجه (حتی «پیدا نشد») در db.sz نگه داشته می‌شود تا هر بار دوباره دانلود نشود؛ در هر بار حداکثر ۴۰ صفحه */
var SZC = null;
function useSz(o) { SZC = o || null; if (SZC && Object.keys(SZC).length > 4000) Object.keys(SZC).forEach(function (k) { if (!SZC[k][0]) delete SZC[k]; }); }
function sizeFromPage(html) {
  var h = String(html || ''), parts = [], m;
  if ((m = /<table[^>]*(?:shop_attributes|product-attributes)[^>]*>[\s\S]*?<\/table>/i.exec(h))) parts.push(m[0]);
  if ((m = /<div[^>]*woocommerce-product-details__short-description[^>]*>[\s\S]*?<\/div>/i.exec(h))) parts.push(m[0]);
  var tx = parts.join(' '), rows = tx.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (var i = 0; i < rows.length; i++) {      // ردیفِ سایز با چند مقدار = محصولِ چنداندازه‌ای؛ حدس نمی‌زنیم
    var rt = normFa(stripTags(rows[i]), true);
    if (/^\s*(?:سایز|حجم|اندازه|size|volume)/.test(rt)) { var ns = {}, mm; RE_SIZE.lastIndex = 0; while ((mm = RE_SIZE.exec(rt))) ns[mm[1]] = 1; if (Object.keys(ns).length > 1 || /\d+\s*(?:،|,|\/|و)\s*\d+/.test(rt)) return 0; }
  }
  var ml = specInfo(tx).ml;
  return ml >= 25 && ml <= 600 ? ml : 0;
}
async function fillSizes(base, out, net) {
  if (!SZC) return 0;
  var now = Date.now(), WEEK = 7 * 86400000, todo = [], got = 0;
  out.forEach(function (x) {
    if (!x.u) return;
    var k = base + '|' + x.id, c = SZC[k];
    if (c && c[0] > 0) { x.t += ' ' + c[0] + ' میل'; got++; return; }
    if (c && now - c[1] < WEEK) return;
    if (todo.length < 40) todo.push({ x: x, k: k });
  });
  var i = 0;
  async function worker() {
    while (i < todo.length) {
      var j = todo[i++], ml = 0;
      try { var r = await getR(net, j.x.u, { Accept: 'text/html' }, 2); if (r.status === 200) ml = sizeFromPage(r.body); } catch (e) { }
      SZC[j.k] = [ml, now];
      if (ml) { j.x.t += ' ' + ml + ' میل'; got++; }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  return got;
}
async function wooSource(base, net, rep, mode) {
  var out = [], notes = [], failed = 0, fields = mode === 'price', stk = true;
  var FIELDS = '&_fields=id,prices,price_html,is_in_stock,is_purchasable,is_on_backorder,type';
  /* فقط کالای موجود: فروشگاه‌های بزرگ (مثل لیلیوم، بیش از ۱۶ هزار محصول با ناموجودها) از سقفِ ۹۰ صفحه می‌گذشتند و عطرهای قدیمی‌تر (مثل کلینیک) هرگز خوانده نمی‌شدند */
  function url(p) { return base + '/wp-json/wc/store/v1/products?per_page=100&page=' + p + (stk ? '&stock_status=instock' : '') + (fields ? FIELDS : ''); }
  var diag = { total: 0, priced: 0, sizeTitle: 0, sizeSpec: 0, noSize: 0, sample: '' }, vparents = [];      // vparents: محصولِ چنداندازه‌ای (بازه‌ی قیمت)؛ هر اندازه‌اش جدا گرفته می‌شود
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
    var st = 0, needSz = false;
    if (cur && !/^(IRT|IRR|IRHT|IRHR)$/.test(cur) && !/تومان|ریال/.test(pr.currency_symbol || '')) v = 0;     // ارزِ ناشناخته (دلار و ...) قیمتِ تومانی نیست
    if (typeof it.is_in_stock !== 'boolean' || it.is_in_stock === false || it.is_purchasable === false || it.is_on_backorder === true || !(v > 0)) st = 1;   // فقط کالای موجود و قابل خرید
    if (pr.price_range && pr.price_range.min_amount !== pr.price_range.max_amount) { st = 1; if (it.type === 'variable' && it.id != null && vparents.length < 80) vparents.push(it); }
    if (it.price_html && OUT_RE.test(normFa(stripTags(it.price_html)))) st = 1;
    var cats = (it.categories || []).map(function (c) { return c.name; }).join(' ');
    var title = name;
    if (name && it.categories && !titleLooksPerfume(name + ' ' + cats)) st = 2;
    else if (!name) st = st === 1 ? 1 : 3;
    else {
      var attrTx = (it.attributes || []).map(function (a) { var ts = (a && a.terms) || []; return ts.length === 1 && /سایز|حجم|اندازه|size|volume/i.test(a.name || '') ? a.name + ': ' + (ts[0].name || '') : ''; }).join(' ');      // ویژگیِ «سایز» با یک مقدار (چند مقدار = محصولِ چند اندازه‌ای)
      title = enrichTitle(name, (it.short_description || it.description || '') + ' ' + attrTx, cats);
      diag.total++; if (v > 0 && st !== 1) diag.priced++;
      if (hasSizeWord(normFa(name, true))) diag.sizeTitle++; else if (title !== name && /\d+ میل/.test(title)) diag.sizeSpec++; else { diag.noSize++; if (!diag.sample) diag.sample = name.slice(0, 80); if (st === 0 && v > 0 && it.permalink && !(it.attributes || []).some(function (a) { return /سایز|حجم|اندازه|size|volume/i.test(a.name || '') && ((a.terms || []).length > 1); })) needSz = true; }
    }
    var im = it.images && it.images[0];
    return { id: it.id, u: needSz ? it.permalink : '', t: title, e: slugText(it.slug), price: st === 1 ? 0 : v, img: im ? (im.thumbnail || im.src || '') : '', big: im ? (im.src || im.thumbnail || '') : '', b: brandHints(it.categories), st: st };
  }
  /* محصولِ چنداندازه‌ای (ووکامرس «متغیر»): قیمتش بازه است (از ... تا ...)، پس یک عدد نیست. هر اندازه (تنوع) جداگانه گرفته می‌شود:
     /products?type=variation&parent=شناسه؛ اندازه از ویژگی‌های همان تنوع خوانده می‌شود. اگر اندازه‌ای خوانده نشد، چیزی حدس زده نمی‌شود. */
  function varSize(v) {
    var tx = (v.attributes || []).map(function (a) { return a && typeof a === 'object' ? [a.name, a.value].join(' ') : ''; }).join(' ') + ' ' + String(v.variation || '');
    tx = normFa(stripTags(tx), true);
    var m = /(?:^|[^\d.٫])(\d{1,3})\s*(?:ml|cc|میل|میلی)/i.exec(tx) || /(?:حجم|سایز|اندازه|size|volume)[^\d]{0,12}(\d{2,3})(?!\d)/i.exec(tx);
    var ml = m ? +m[1] : 0, kind = [];
    (v.attributes || []).forEach(function (a) { var t = a && typeof a === 'object' ? normFa(stripTags(String(a.value || '')), true) : ''; if (t && t.length <= 30 && /ادو|ادکلن|پرفیوم|تویلت|اکستریت|کلون|\bedp\b|\bedt\b|parfum|مردانه|زنانه|یونیسکس/i.test(t) && kind.indexOf(t) < 0) kind.push(t); });      // غلظت/جنسیتِ همان تنوع؛ تا دو تنوعِ هم‌اندازه یکی نشوند
    return { ml: ml >= 5 && ml <= 600 ? ml : 0, tester: /tester|تستر/i.test(tx), kind: kind.slice(0, 2).join(' ') };
  }
  async function expandVariants(parents, outArr) {
    var made = 0, okIds = {}, i = 0;
    async function worker() {
      while (i < parents.length) {
        var P = parents[i++];
        try {
          for (var pg = 1; pg <= 3; pg++) {      // تا ۳۰۰ تنوع برای هر محصول
            var r = await getR(net, base + '/wp-json/wc/store/v1/products?type=variation&per_page=100&page=' + pg + '&parent=' + encodeURIComponent(P.id), { Accept: 'application/json' }, 2), a = r.status === 200 ? parseJson(r.body) : undefined;
            if (!Array.isArray(a)) { if (!r.status || r.status >= 500 || r.status === 429) { failed++; notes.push('تنوعِ محصول نشد'); } break; }      // خطای شبکه/سرور: فهرست ناقص است؛ ۴۰۰/۴۰۴ یعنی سایت این را پشتیبانی نمی‌کند (ناقص حساب نمی‌شود)
            a.forEach(function (v) {
              if (!v || typeof v !== 'object' || v.id == null || wIds[v.id]) return;
              var sz = varSize(v);
              if (!sz.ml) return;      // اندازه معلوم نیست: حدس نزن (در هر دو حالتِ دریافت، تا کالای ناشناخته مدام دریافتِ کامل نخواهد)
              var syn = Object.assign({}, P, { id: base + '/?p=' + P.id + '#v' + v.id, type: 'variation', prices: v.prices, is_in_stock: v.is_in_stock, is_purchasable: v.is_purchasable, is_on_backorder: v.is_on_backorder, price_html: v.price_html, attributes: [], short_description: '', description: '' });      // شناسه = نشانیِ همان محصولِ اصلی (لینکِ «دیدن در سایت» درست باز شود؛ تنوع صفحه‌ی جدا ندارد)
              if (!fields) syn.name = (sz.tester ? 'تستر ' : '') + (P.name || '') + (sz.kind ? ' ' + sz.kind : '') + ' ' + sz.ml + ' میل';
              if (syn.prices && syn.prices.price_range && syn.prices.price_range.min_amount !== syn.prices.price_range.max_amount) return;
              wIds[v.id] = 1; outArr.push(conv(syn)); made++; okIds[P.id] = 1;
            });
            if (a.length < 100) break;
          }
        } catch (e) { failed++; notes.push('تنوعِ محصول نشد'); }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (made) for (var k = outArr.length - 1; k >= 0; k--) if (okIds[outArr[k].id] && parents.some(function (P) { return P.id === outArr[k].id; })) outArr.splice(k, 1);      // خودِ محصولِ بازه‌ای که اندازه‌هایش آمد، حذف شود
    return made;
  }
  async function one(p) {
    var r = await getR(net, url(p), { Accept: 'application/json' });
    if (r.status === 200) { var a = parseJson(r.body); if (Array.isArray(a)) return { k: 'ok', a: a }; return p === 1 ? { k: 'bad', a: [] } : { k: 'fail', s: 200, b: 'صفحه‌ی غیرعادی' }; }   // ۲۰۰ بدونِ فهرست وسطِ کار = کپچا/خطا، نه پایانِ فهرست
    if (p > 1 && r.status === 400 && /invalid_page_number|page_number/i.test(String(r.body || ''))) return { k: 'end', a: [] };   // ۴۰۰ِ فایروال پایانِ فهرست نیست
    return { k: 'fail', s: r.status, b: r.body };
  }
  var first = await one(1);
  if ((first.k !== 'ok' || !first.a.length) && stk) { stk = false; first = await one(1); }      // سایت فیلترِ موجودی را نپذیرفت: بی‌فیلتر
  if (first.k !== 'ok' && fields) { fields = false; first = await one(1); }      // سایت _fields را نپذیرفت
  if (first.k === 'bad') throw new Error('ساختار ناشناخته');
  if (first.k === 'fail') throw new Error(first.s ? 'HTTP ' + first.s : (first.b || 'اینترنت وصل نیست'));
  var res = [first], page = 2, ended = first.a.length === 0;            // صفحه‌ی کوتاه = پایان نیست (سایت ممکن است per_page را کم کرده باشد)
  var wIds = {};
  var pgN = 0;
  function eat(r) { pgN++; r.a.forEach(function (it) { if (wIds[it.id]) return; wIds[it.id] = 1; out.push(conv(it)); }); }      // فهرستِ زنده وسط کار جابه‌جا می‌شود: یک محصول دو بار نیاید
  function isDup(r) { return r.a.length > 0 && r.a.every(function (it) { return wIds[it.id]; }); }
  eat(first); rep(out.length);
  /* صفحه‌ی خراب بلافاصله شکست حساب نمی‌شود: فشار کم می‌شود (هم‌زمانی کمتر + مکث) و بعد از پایانِ کار، صفحه‌های خراب آرام‌تر دوباره
     خوانده می‌شوند. (گزارش واقعی: ۳۶ صفحه از ۹۰ صفحه‌ی لیلیوم خطا داده بود و عطرهای قدیمی‌تر، مثل کلینیک، هرگز وارد حافظه نشدند.) */
  var bad = {}, conc = CFG.conc, run = 0, t0 = Date.now();
  function late() { return Date.now() - t0 > 480000; }      // سقفِ ۸ دقیقه برای خواندنِ صفحه‌ها (شبکه‌ی ضعیف بی‌پایان نشود)
  function why(r) { return r.k === 'ok' ? 'صفحه‌ی تکراری' : r.s ? 'HTTP ' + r.s : 'بدون پاسخ'; }
  for (var pass = 0; pass < 4; pass++) {
    while (!ended && page <= 90 && run < 12 && !late()) {      // ۱۲ صفحه‌ی پشت‌سرهم خراب: مکث؛ سایت یا شبکه قطع است، بیش از این فشار نیاور
      var ps = []; for (var i = 0; i < conc; i++) ps.push(page + i);
      var rr = await Promise.all(ps.map(one)), nf = 0;
      rr.forEach(function (r, i) {
        if (ended && r.k === 'ok') { eat(r); return; }
        if (r.k === 'fail') { nf++; run++; bad[ps[i]] = why(r); return; }
        run = 0;
        if (r.k === 'ok') { if (isDup(r)) { failed++; notes.push('صفحه‌بندی کار نکرد'); ended = true; return; } eat(r); if (r.a.length === 0) ended = true; } else ended = true;
      });
      page += ps.length; rep(out.length);
      if (nf) { conc = Math.max(1, conc - 1); await sleep(CFG.retryMs * 2); }
    }
    var left = Object.keys(bad).map(Number).sort(function (a, b) { return a - b; }).slice(0, 60), got = 0;
    for (var rd = 1; rd <= 2 && left.length && !late(); rd++) {
      await sleep(CFG.retryMs * 2 * rd);
      var still = [];
      for (var k = 0; k < left.length; k += 2) {
        var grp = left.slice(k, k + 2), gr = await Promise.all(grp.map(one));
        gr.forEach(function (r, j) {
          if (r.k === 'ok' && !isDup(r)) { eat(r); delete bad[grp[j]]; got++; }
          else if (r.k === 'end') delete bad[grp[j]];      // آن‌طرفِ پایانِ فهرست بود؛ خرابی نیست
          else { bad[grp[j]] = why(r); still.push(grp[j]); }
        });
      }
      left = still; rep(out.length);
    }
    if (!(!ended && page <= 90 && run >= 12 && got > 0) || late()) break;      // سایت برگشت: ادامه از همان‌جا که مکث کرده بودیم
    run = 0;
  }
  var badKeys = Object.keys(bad), why2 = {};
  failed += badKeys.length; badKeys.forEach(function (k) { why2[bad[k]] = (why2[bad[k]] || 0) + 1; });
  var whyTx = Object.keys(why2).map(function (k) { return k + '×' + why2[k]; }).join('، ');
  if (!out.length) throw new Error('محصولی پیدا نشد');
  var vN = 0;
  if (vparents.length) vN = await expandVariants(vparents, out);
  var szN = 0;
  if (!fields) szN = await fillSizes(base, out, net);
  var dn = (!fields && diag.total) ? ' · قیمت‌دار ' + diag.priced + ' از ' + diag.total + ' · اندازه از عنوان ' + diag.sizeTitle + '، از توضیحات ' + diag.sizeSpec + '، بدون اندازه ' + diag.noSize + (diag.sample ? ' (نمونه: ' + diag.sample + ')' : '') : '';
  return { items: out, complete: ended && !failed ? (stk ? 'soft' : true) : false, note: (failed ? 'ناقص: ' + failed + ' صفحه' + (whyTx ? ' (' + whyTx + ')' : '') : '') + (!ended && !failed && page > 90 ? 'ناقص: به سقفِ ۹۰ صفحه رسید' : '') + (!ended && page <= 90 ? (failed ? '' : 'ناقص:') + ' خواندن در صفحه‌ی ' + page + ' متوقف شد' : '') + ' · ' + pgN + ' صفحه' + (stk ? ' فقط موجود' : ' بی‌فیلتر') + dn + (szN ? ' · اندازه از صفحه‌ی محصول ' + szN : '') + (vN ? ' · اندازه‌های محصولِ چنداندازه‌ای ' + vN : ''), diag: diag };
}

/* ---------- بررسی زنده‌ی یک فروشگاه برای گزارش تشخیص ----------
   همان محصولاتِ سایت را با جستجو می‌گیرد (هم با فیلتر موجودی هم بدونش) و عیناً از همان خط لوله‌ی برنامه (wooSource) می‌گذراند؛
   خروجی برای هر محصول: داده‌ی خامِ سایت + نتیجه‌ی برنامه. چیزی حدس زده نمی‌شود. */
async function probeShop(net, base, q) {
  var out = { base: base, q: q, calls: [], rows: [], err: '' };
  async function lst(stock) {
    var u = base + '/wp-json/wc/store/v1/products?per_page=40&search=' + encodeURIComponent(q) + (stock ? '&stock_status=instock' : '');
    var r = await getR(net, u, { Accept: 'application/json' }, 2), a = r.status === 200 ? parseJson(r.body) : undefined;
    out.calls.push((stock ? 'فقط موجود' : 'همه') + ': HTTP ' + r.status + (Array.isArray(a) ? ' · ' + a.length + ' محصول' : ' · ' + String(r.body || '').slice(0, 80).replace(/\s+/g, ' ')));
    return Array.isArray(a) ? a : [];
  }
  var all = await lst(false), inst = await lst(true), by = {}, order = [];
  inst.concat(all).forEach(function (it) { if (it && it.id != null && !by[it.id]) { by[it.id] = it; order.push(it.id); } });
  var instIds = {}; inst.forEach(function (it) { instIds[it.id] = 1; });
  if (!order.length) return out;
  var recs = order.map(function (id) { return by[id]; });
  var fake = { get: async function (u, h) {
    var m = /type=variation/.test(u) ? null : /wc\/store\/v1\/products\?.*[?&]page=(\d+)/.exec(u);
    if (m) return +m[1] === 1 ? { status: 200, body: JSON.stringify(recs) } : { status: 400, body: '{"code":"rest_invalid_page_number"}' };
    return net.get(u, h);
  } };
  var res = null;
  try { res = await wooSource(base, fake, function () { }, 'full'); } catch (e) { out.err = String(e && e.message || e).slice(0, 120); }
  var conv = {}; if (res) res.items.forEach(function (x) { conv[x.id] = x; });
  recs.forEach(function (it) {
    var pr = it.prices || {}, c = conv[it.id], x = c && c.st === 0 && c.price > 0 ? explainTitle(c.t) : null;
    out.rows.push({
      id: it.id, name: String(it.name || '').slice(0, 100), type: it.type, stock: it.is_in_stock, buy: it.is_purchasable, back: it.is_on_backorder, price: pr.price, range: !!(pr.price_range && pr.price_range.min_amount !== pr.price_range.max_amount),
      cur: pr.currency_code, cats: (it.categories || []).map(function (k) { return k.name; }).slice(0, 3).join('/'), inInstock: !!instIds[it.id],
      spec: specInfo(it.short_description || it.description || '').ml, nameSize: hasSizeWord(normFa(it.name || '', true)),
      appT: c ? String(c.t).slice(0, 110) : '', appSt: c ? c.st : -1, appPrice: c ? c.price : 0, appOk: x ? x.ok : null, appWhy: x && !x.ok ? x.why : ''
    });
  });
  return out;
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
      if (!p || typeof p !== 'object') return;
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
  total = Math.min(100, (d1.pager && d1.pager.total_pages) || 1);
  var done = 1, dbad = [];
  for (var page = 2; page <= total; page += CFG.conc + 1) {
    var ps = []; for (var i = 0; i < CFG.conc + 1 && page + i <= total; i++) ps.push(page + i);
    var rr = await Promise.all(ps.map(function (p) { return one(p, vi); }));
    var dn0 = dbad.length;
    rr.forEach(function (r, i) { if (r.k === 'ok') eat(r.d); else dbad.push(ps[i]); });
    done += ps.length; rep(out.length, done / total);
    if (dbad.length > dn0) await sleep(CFG.retryMs * 2);
    if (dbad.length >= 15) break;      // سایت جواب نمی‌دهد/مسدود کرده؛ بیش از این فشار نیاور
  }
  for (var drd = 1; drd <= 2 && dbad.length; drd++) {      // صفحه‌های خراب آرام‌تر دوباره (دو تا دو تا)
    await sleep(CFG.retryMs * 2 * drd);
    var dstill = [];
    for (var dk = 0; dk < dbad.length; dk += 2) {
      var dgrp = dbad.slice(dk, dk + 2), dgr = await Promise.all(dgrp.map(function (p) { return one(p, vi); }));
      dgr.forEach(function (r, j) { if (r.k === 'ok') eat(r.d); else dstill.push(dgrp[j]); });
    }
    dbad = dstill;
  }
  failed += dbad.length;
  if (!out.length) throw new Error('محصولی پیدا نشد');
  var capped = !(d1.pager && d1.pager.total_pages > 0) || d1.pager.total_pages > 100;
  return { items: out, complete: !failed && total > 0 && !capped, note: failed ? 'ناقص: ' + failed + ' صفحه' : (capped ? 'ناقص: تعداد صفحه‌ها معلوم نیست یا بیش از ۱۰۰ است' : '') };
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
/* سایت‌های Next.js (مثل سفیر): فهرستِ کامل محصول‌ها با حجم، قیمت و موجودی داخل __NEXT_DATA__ است؛ عنوانِ کارت حجم ندارد */
function nextDataCards(doc, pageUrl) {
  var el = doc.getElementById('__NEXT_DATA__'), j, out = [];
  if (!el) return out;
  try { j = JSON.parse(el.textContent); } catch (e) { return out; }
  var lists = [];
  (function walk(x, d) {
    if (!x || d > 8 || typeof x !== 'object') return;
    if (Array.isArray(x)) { x.forEach(function (y) { walk(y, d + 1); }); return; }
    if (Array.isArray(x.productList) && x.productList.length) lists.push(x.productList);
    else Object.keys(x).forEach(function (k) { if (k !== 'productComments') walk(x[k], d + 1); });
  })(j, 0);
  lists.forEach(function (L) {
    L.forEach(function (p) {
      if (!p || typeof p !== 'object' || !p.label) return;
      var spec = {}; (Array.isArray(p.specifications) ? p.specifications : []).forEach(function (sp) { if (sp && sp.key && sp.value && !spec[sp.key]) spec[sp.key] = String(sp.value); });
      var title = String(p.label).replace(/\s+/g, ' ').trim();
      if (spec['حجم'] && !/\d\s*(میل|ml|cc)/i.test(title)) title += ' ' + spec['حجم'];
      if (p.isTester) title = 'تستر ' + title;
      var pr = +p.priceWithOffer > 0 ? +p.priceWithOffer : +p.price, out0 = p.isAvailable === false || p.canBuy === false || !(pr > 0);
      var u = p.frontEndUrl ? urlJoin(pageUrl, p.frontEndUrl) : '';
      out.push({ u: u, t: title, price: out0 ? 0 : pr, st: out0 ? 1 : 0, np: !(pr > 0) && p.isAvailable !== false && p.canBuy !== false ? 1 : 0, img: p.imageUrl ? urlJoin(pageUrl, p.imageUrl) : '' });      // np: موجود است ولی قیمتی ننوشته (در جستجوی زنده «قیمت در سایت»)
    });
  });
  return out;
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
    title = stripPriceTail((title || '').replace(/\s+/g, ' ').trim());
    if (!title) return;
    var src = ''; if (img) ['src', 'data-src', 'data-lazy-src', 'data-original'].some(function (at) { var v2 = img.getAttribute(at) || ''; if (v2 && !/^data:/i.test(v2)) { src = v2; return true; } });      // «src» اغلب یک تصویرِ جایگزین (data:) است؛ نشانیِ واقعی در data-src
    push({ u: url, t: title, price: outFlag ? 0 : v, st: outFlag ? 1 : 0, img: src ? urlJoin(pageUrl, src) : '' });
  });
  return out;
}
function findNext(doc, url, i) {
  var n = doc.querySelector('link[rel="next"],a[rel="next"],a.next,.next.page-numbers');
  var nh = n && n.getAttribute('href');
  if (nh && nh.charAt(0) !== '#' && !/^javascript:/i.test(nh)) return urlJoin(url, nh);
  if (doc.querySelector('.pager a[href*="pagenumber="]')) {                       // nopCommerce (هایلند): ?pagenumber=N
    var base = url.replace(/[?&]pagenumber=\d+/i, '').replace(/[?&]$/, '');
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'pagenumber=' + (i + 2);
  }
  var u = url.replace(/([?&])page=\d+/, '$1page=' + (i + 2));
  if (u === url) u = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + (i + 2);
  return u;
}
var BOTWALL = /captcha|just a moment|access denied|attention required|verify you are human|are you a robot|checking your browser|کپچا|ربات نیستید|دسترسی (شما )?مسدود/i;      // روی متنِ دیدنیِ صفحه (بدون اسکریپت/تگ) سنجیده می‌شود
var RAWC = {};      // نمونه‌ی خامِ صفحه‌ی اول هر سایتِ HTML؛ فقط برای تشخیص (در فایل پشتیبان)
function rawSample(doc, cards, body, url) {
  try {
    var s = [], priceEls = [];
    Array.prototype.forEach.call(doc.querySelectorAll('body *'), function (n) { if (priceEls.length < 3 && !n.children.length && /تومان|ریال/.test(n.textContent || '') && n.parentElement && n.parentElement.parentElement) priceEls.push(n.parentElement.parentElement); });
    var seen = []; priceEls.forEach(function (n) { if (seen.indexOf(n) < 0) { seen.push(n); s.push('--قیمت--\n' + n.outerHTML.slice(0, 2500)); } });
    cards.slice(0, 3).forEach(function (c) { s.push('--کارت تشخیص‌داده‌شده: ' + c.t + ' | ' + c.price + ' | ' + c.u); });
    var host = (/^https?:\/\/([^\/]+)/.exec(url) || [])[1] || url;
    RAWC[host] = 'طول صفحه ' + body.length + '\nتعداد کارت ' + cards.length + '\n' + s.join('\n');
  } catch (e) { }
}
async function htmlSource(start, net, rep, mode) {
  var out = [], seen = {}, url = start, pages = 0, natural = false, failed = 0, stop = '', maxP = 40, lastN = 0, pre = {}, preU = {}, nopBase = '';
  for (var i = 0; i < maxP && url; i++) {
    var r = (pre[i + 1] && url === preU[i + 1]) ? await pre[i + 1] : await getR(net, url, { Accept: 'text/html' });
    if (r.status === 404 && i > 0) { natural = true; stop = 'صفحه‌ی ' + (i + 1) + ' وجود ندارد (پایان)'; break; }
    if (r.status !== 200) { if (i === 0) throw new Error(r.status ? 'HTTP ' + r.status : r.body); failed++; stop = 'صفحه ' + (i + 1) + ' نشد'; break; }
    var doc = new DOMParser().parseFromString(r.body, 'text/html');
    var cards = nextDataCards(doc, url); if (!cards.length) cards = extractCards(doc, url);
    var fresh = 0;
    if (i === 0) rawSample(doc, cards, r.body, url);
    pages++;
    if (i === 0) { var lp = doc.querySelector('.pager .last-page a[data-page]'); lastN = lp ? (+lp.getAttribute('data-page') || 0) : 0; if (lastN > 40) maxP = Math.min(lastN, 300); }      // فهرستِ بلند (هایلند ≈ ۲۰۰ صفحه)
    cards = cards.filter(function (c) { return !/^(سبد خرید|مقایسه|علاقه ?مندی|ورود|ثبت ?نام)/.test(c.t); });
    cards.forEach(function (c) {
      var k = c.t + '|' + c.price + '|' + (c.u || '');
      if (seen[k]) return; seen[k] = 1; fresh++;
      out.push({ id: c.u || c.t, t: c.t, price: c.price, img: c.img, big: c.img, st: c.st === 1 ? 1 : (titleLooksPerfume(c.t) || parseTitle(c.t)) ? 0 : 2 });
    });
    rep(out.length);
    if (!fresh && i > 0 && BOTWALL.test(r.body.slice(0, 40000).replace(/<(script|style|head)[\s\S]*?<\/\1>|<[^>]*>/gi, ' '))) { failed++; stop = 'صفحه ' + (i + 1) + ' کپچا/مسدود بود'; break; }     // صفحه‌ی کپچا پایانِ فهرست نیست؛ قیمت‌های قبلی حذف نشود
    if (!fresh) {
      if (i === 1 && cards.length) { stop = 'صفحه‌بندی کار نکرد (صفحه‌ی ۲ تکراری است)'; break; }     // پایانِ واقعی نیست؛ فهرست ناقص است
      natural = true; stop = 'صفحه ' + (i + 1) + ' کارت تازه نداشت'; break;
    }
    if (i === 0 && lastN > 1 && doc.querySelector('.pager a[href*="pagenumber="]')) nopBase = url.replace(/[?&]pagenumber=\d+/i, '').replace(/[?&]$/, '');
    if (nopBase) for (var k = i + 1; k <= i + 4 && k < lastN; k++) if (!pre[k + 1]) { preU[k + 1] = nopBase + (nopBase.indexOf('?') >= 0 ? '&' : '?') + 'pagenumber=' + (k + 1); pre[k + 1] = getR(net, preU[k + 1], { Accept: 'text/html' }); }      // ۴ صفحه‌ی بعدی از پیش و هم‌زمان گرفته می‌شود
    if (lastN && i + 1 >= lastN) { natural = true; stop = 'همه‌ی ' + lastN + ' صفحه'; break; }
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

/* ---------- جستجوی زنده در خودِ سایت‌ها ----------
   وقتی عطر در فهرستِ گوشی پیدا نشد (یا ضعیف بود)، همان نامِ گفته‌شده از خودِ سایت‌ها پرسیده می‌شود؛ شاید سایت منظور را بهتر بفهمد.
   خروجی: { items: [{s: شناسه‌ی سایت, t: عنوان, price: تومان (۰ = ناموجود), img, u: آدرس صفحه}], notes: {شناسه‌ی سایت: 'ok'|'none'|'fail'} } */
var LIVE_HTML = { liliome: ['/?s={q}&post_type=product'], hiland: ['/fa/search?q={q}'], safir: ['/search?q={q}', '/?s={q}'] };      // جستجوی صفحه‌ای (وقتی رابطِ ووکامرس نیست)
function liveHit(title, terms, tools) {      // عنوان با دست‌کم یک واژه‌ی اصلی بخواند؛ املای نزدیک («ساواژ»↔«ساواج») و واژه‌ی لاتین (با برگردان به فارسی) هم قبول است
  var t = srn(title); if (!t) return false;
  var tw = t.split(' ').filter(Boolean), ws = [], ns = [];
  terms.forEach(function (w) { var x = srn(w); if (!x) return; (srNum(x) ? ns : ws).push(x); });
  if (!ws.length) return ns.some(function (n) { return tw.indexOf(n) >= 0; });      // فقط شماره («212»): واژه‌ی کاملِ شماره باشد، نه تکه‌ای از «2120»
  function near(v) {
    if (t.indexOf(v) >= 0) return true;
    var fv = simFold(v);
    return v.length >= 3 && tw.some(function (u) { return u.length >= 3 && (simWord(u, v) >= .75 || simWord(simFold(u), fv) >= .75); });
  }
  return ws.some(function (x) {
    if (near(x)) return true;
    if (tools && !HAS_FA.test(x) && tools.toFa) { var f = srn(tools.toFa(x)); if (f && f !== x && near(f)) return true; }
    if (tools && HAS_FA.test(x) && tools.toEn) { var e = srn(tools.toEn(x)); if (e && e !== x && !HAS_FA.test(e) && near(e)) return true; }
    return false;
  });
}
var LIVE_BASE = { liliome: 'https://liliome.com', safir: 'https://www.safirstores.com', hiland: 'https://hilandbeauty.com' };
var SIZES_COMMON = srMap(); '30 35 40 45 50 60 75 80 85 90 100 110 120 125 150 200 250 300 500'.split(' ').forEach(function (w) { SIZES_COMMON[w] = 1; });
function liveTerms(text) {      // فقط واژه‌های اصلی: «عطر»، «چنده»، «۱۰۰ میل» در جستجوی سایت جواب را خالی می‌کند؛ شماره‌ی نام («شنل ۵»، «۲۱۲») می‌ماند
  var seen = {}, out = [], toks = srToks(String(text || '').replace(/[0-9۰-۹٠-٩]+\s?[.٫,]\s?[0-9۰-۹٠-٩]+/g, ' '));      // «3.4 oz» اندازه است، نه شماره‌ی نام
  toks.forEach(function (t, j) {
    var nameNum = /^\d+$/.test(t) && (+t < 20 || +t > 250) && t.length <= 5 && !SR_UNIT[toks[j + 1]];
    if (t.length >= 2 && !SR_STOP[t] && !SR_CONN[t] && !SR_NUM[t] && !srNum(t) && !seen[t]) { seen[t] = 1; out.push(t); }
    else if (nameNum && !seen[t]) { seen[t] = 1; out.push(t); }
  });
  if (!out.length) toks.forEach(function (t, j) { if (/^\d{3,5}$/.test(t) && !SIZES_COMMON[t] && !SR_UNIT[toks[j + 1]] && !seen[t] && out.length < 2) { seen[t] = 1; out.push(t); } });      // فقط عدد («۲۱۲»، «۴۷۱۱»): اگر اندازه‌ی رایجِ بطری نیست، نامِ عطر است
  return out.slice(0, 6).map(function (t) { return t.slice(0, 40); });
}
function wooLivePrice(it) {      // همان قاعده‌ی دریافتِ کامل (wooSource): ۰ = ناموجود، ۱- = قیمتش در سایت است (بازه‌ی قیمت یا بدون عدد)، بقیه = قیمت به تومان
  var pr = it.prices || {}, minor = pr.currency_minor_unit == null ? 0 : +pr.currency_minor_unit, v = parseFloat(pr.price) / Math.pow(10, minor);
  if (!(v > 0) && it.price_html && !OUT_RE.test(normFa(stripTags(it.price_html))) && !/تماس|\bcall\b|unavailable/i.test(stripTags(it.price_html))) { var pt = priceFromText(stripTags(it.price_html)).nums.filter(function (x) { return x > 0; }); if (pt.length) { var f0 = pt[0]; v = Math.min.apply(null, pt.filter(function (x) { return x >= f0 / 2.5 && x <= f0 * 2.5; })); } }
  var cur = String(pr.currency_code || '').toUpperCase();
  if (cur === 'IRHT') v = v * 1000; else if (cur === 'IRHR') v = v * 100; else if (/IRR|ریال/i.test(cur || pr.currency_symbol || '')) v = v / 10;
  if (cur && !/^(IRT|IRR|IRHT|IRHR)$/.test(cur) && !/تومان|ریال/.test(pr.currency_symbol || '')) v = 0;
  if (typeof it.is_in_stock !== 'boolean' || it.is_in_stock === false || it.is_purchasable === false || it.is_on_backorder === true) return 0;      // ناموجود
  if (it.price_html && OUT_RE.test(normFa(stripTags(it.price_html)))) return 0;
  if (!(v > 0)) return -1;      // موجود است ولی قیمتی ننوشته («تماس بگیرید») یا به تومان نیست: قیمتش در خودِ سایت است
  if (pr.price_range && pr.price_range.min_amount !== pr.price_range.max_amount) return -1;      // محصولِ چنداندازه‌ای: قیمتِ یک عدد نیست
  if (v > 4e8) return -1;      // عددِ نامعقول (ارزِ اشتباه): قیمت نشان داده نشود
  return Math.round(v);
}
async function wooLive(srcId, base, terms, net, tools) {
  var longest = terms.filter(function (w) { return !srNum(w); }).sort(function (a, b) { return b.length - a.length; })[0];
  var qs = [terms.join(' ')];      // اول همه‌ی واژه‌ها؛ بعد برگردانِ فارسیِ واژه‌های لاتین؛ نشد، بلندترین واژه به‌تنهایی
  if (tools && tools.toFa && terms.some(function (w) { return !HAS_FA.test(w) && !srNum(w); })) {
    var fa = terms.map(function (w) { return HAS_FA.test(w) || srNum(w) ? w : (srn(tools.toFa(w)) || w); }).join(' ');
    if (qs.indexOf(fa) < 0) qs.push(fa);
  }
  if (terms.length > 1 && longest && qs.indexOf(longest) < 0) qs.push(longest);
  var gotAny = false, apiDead = METHOD[base] === 'html';      // سایتی که رابطِ ووکامرس ندارد دوباره از همان راه پرسیده نمی‌شود
  for (var qi = 0; qi < qs.length; qi++) {
    var a;
    if (!apiDead) {
      /* نتیجه‌ها «تازه‌ترین اول» می‌آیند و فقط ۱۲ تا؛ در فروشگاهی که از یک برند ده‌ها محصولِ ناموجود/تستر دارد، عطرِ موجودِ قدیمی (مثل کلینیک هپی مردانه) از ۱۲ تا بیرون می‌ماند.
         پس دو پرسش هم‌زمان: «فقط موجودها» (اول می‌آیند) و «همه» (برای نشان‌دادنِ ناموجودها)؛ بدونِ تکرار ادغام می‌شوند. سایتی که فیلترِ موجودی را نمی‌پذیرد فقط از پرسشِ دوم جواب می‌گیرد. */
      var url = base + '/wp-json/wc/store/v1/products?per_page=12&search=' + encodeURIComponent(qs[qi]), flds = '&_fields=id,name,permalink,images,prices,is_in_stock,is_purchasable,is_on_backorder,price_html,categories,type';
      var r1 = await getR(net, url + '&stock_status=instock' + flds, { Accept: 'application/json' }, 2), aIn = r1.status === 200 ? parseJson(r1.body) : undefined, aAll;
      if (Array.isArray(aIn) || r1.status === 400) {      // رابطِ ووکامرس هست (۴۰۰ = فیلتر را نپذیرفت)؛ سایتی که رابط ندارد فقط یک پرسش می‌خورد
        var r2 = await getR(net, url + flds, { Accept: 'application/json' }, 2); aAll = r2.status === 200 ? parseJson(r2.body) : undefined;
      }
      if (Array.isArray(aIn) || Array.isArray(aAll)) {
        var sn = {}; a = [];
        (Array.isArray(aIn) ? aIn : []).concat(Array.isArray(aAll) ? aAll : []).forEach(function (it) { var k = it && typeof it === 'object' ? (it.id != null ? 'i' + it.id : 'p' + it.permalink) : ''; if (!k || sn[k]) return; sn[k] = 1; a.push(it); });
      } else apiDead = true;
    }
    if (apiDead) {      // رابطِ ووکامرس بسته است: صفحه‌ی جستجوی خودِ سایت (هر سایت آدرسِ خودش را دارد)
      if (qi >= 2) break;
      var tpls = LIVE_HTML[srcId] || ['/?s={q}&post_type=product'];
      for (var ti = 0; ti < tpls.length; ti++) {
        try {
          var h = await getR(net, base + tpls[ti].replace('{q}', encodeURIComponent(qs[qi])), { Accept: 'text/html' }, 2);
          if (h.status === 200 && typeof DOMParser !== 'undefined') {
            var doc = new DOMParser().parseFromString(h.body, 'text/html'), cards = nextDataCards(doc, base + '/'); if (!cards.length) cards = extractCards(doc, base + '/');
            var o2 = cards.filter(function (c) { return c && c.t && titleLooksPerfume(c.t) && liveHit(c.t, terms, tools); }).slice(0, 12).map(function (c) { return { s: srcId, t: c.t, price: c.price > 0 ? c.price : (c.st === 1 && !c.np ? 0 : -1), img: c.img || '', u: itemUrl(srcId, c.u) || '' }; });      // وقتی چیزی پیدا نشود بعضی سایت‌ها «پرفروش‌ها» را نشان می‌دهند؛ فقط ردیف‌هایی که واژه‌ی گفته‌شده را دارند
            if (o2.length) return { items: o2, note: 'ok' };
            gotAny = true;
          }
        } catch (e) { }
      }
      continue;
    }
    gotAny = true;
    var out = [];
    a.forEach(function (it) {
      if (!it || typeof it !== 'object' || !it.name) return;
      var cats = (it.categories || []).map(function (c) { return c && c.name || ''; }).join(' ');
      if (!titleLooksPerfume(it.name + ' ' + cats)) return;
      var im = it.images && it.images[0];
      out.push({ s: srcId, t: stripTags(it.name), price: wooLivePrice(it), img: im ? (im.thumbnail || im.src || '') : '', u: itemUrl(srcId, it.permalink) || '' });
    });
    if (out.length) return { items: out, note: 'ok' };
  }
  return { items: [], note: gotAny ? 'none' : 'fail' };
}
async function digikalaLive(terms, net) {
  var q = terms.join(' '), urls = ['https://api.digikala.com/v1/categories/perfume/search/?page=1&q=' + encodeURIComponent(q), 'https://api.digikala.com/v1/search/?page=1&q=' + encodeURIComponent(q)];
  var gotAny = false;
  for (var i = 0; i < urls.length; i++) {
    var r = await getR(net, urls[i], { Accept: 'application/json' }, 2), j = r.status === 200 ? parseJson(r.body) : undefined, d = j && j.data;
    if (!d || !Array.isArray(d.products)) continue;
    gotAny = true;
    var out = [];
    d.products.forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var title = p.title_fa || p.title_en || ''; if (!title || (i > 0 && !titleLooksPerfume(title))) return;
      var dv = p.default_variant, rial = dv && dv.price && dv.price.selling_price, avail = !(p.status && p.status !== 'marketable') && !!dv && typeof dv === 'object' && !Array.isArray(dv) && !(dv.status && !/marketable|available/i.test(String(dv.status)));
      var img = p.images && p.images.main && p.images.main.url && p.images.main.url[0] || '';
      out.push({ s: 'digikala', t: title, price: !avail ? 0 : (rial > 0 && rial / 10 <= 4e8) ? Math.round(rial / 10) : -1, img: img ? img.replace(/h_\d+,w_\d+/, 'h_360,w_360') : '', u: itemUrl('digikala', p.id) || '' });
    });
    if (out.length) return { items: out.slice(0, 12), note: 'ok' };
  }
  return { items: [], note: gotAny ? 'none' : 'fail' };
}
async function liveSearch(text, net, srcIds, tools) {
  var terms = liveTerms(String(text || '').slice(0, 120)), notes = {}, items = [];
  if (!terms.length) return { items: [], notes: {}, terms: terms };
  function lim(pr) { var tm; return Promise.race([pr, new Promise(function (res) { tm = setTimeout(function () { res({ items: [], note: 'fail' }); }, 20000); })]).then(function (r) { clearTimeout(tm); return r; }); }      // مهلتِ ۲۰ ثانیه؛ بعد از جواب پاک می‌شود
  var ids = (srcIds && srcIds.length ? srcIds : Object.keys(LIVE_BASE).concat(['digikala']));
  var jobs = ids.map(function (id) {
    var pr = id === 'digikala' ? digikalaLive(terms, net) : (LIVE_BASE[id] ? wooLive(id, LIVE_BASE[id], terms, net, tools) : Promise.resolve({ items: [], note: 'none' }));
    return lim(pr.catch(function () { return { items: [], note: 'fail' }; })).then(function (r) { notes[id] = r.note; return r.items; });
  });
  var res = await Promise.all(jobs);
  res.forEach(function (a) { items = items.concat(a); });
  return { items: items, notes: notes, terms: terms };
}

/* ---------- خبرهای سایت‌ها (مجله/وبلاگِ همان فروشگاه‌ها) ----------
   هر سایت اول با رابطِ وردپرس (wp-json) و اگر نشد با خوراکِ RSS خوانده می‌شود. فقط سایت‌های همین فهرست.
   خروجی: { items: [{s, sn, t, d(ms), u, x, img}], notes: {شناسه: 'ok'|'none'|'fail'} } */
var NEWS_SRC = [
  { id: 'liliome', name: 'لیلیوم', base: 'https://liliome.com', filter: false },
  { id: 'safir', name: 'سفیر', base: 'https://www.safirstores.com', alt: ['/mag'], filter: false },
  { id: 'hiland', name: 'هایلند', base: 'https://hilandbeauty.com', alt: ['/mag', '/blog'], filter: false },
  { id: 'digikala', name: 'مجله‌ی دیجی‌کالا', base: 'https://www.digikala.com/mag', filter: true, search: 'عطر' },
  { id: 'hes', name: 'حس پرفیوم', base: 'https://hesperfume.ir', alt: ['/mag'], filter: true },
  { id: 'flower', name: 'فلاور پرفیوم', base: 'https://flower-perfume.com', alt: ['/blog'], filter: true },
  { id: 'khalife', name: 'خلیفه‌چی', base: 'https://khalifechi.com', filter: true, search: 'عطر' },
  { id: 'redmag', name: 'ردمگ', base: 'https://redmag.ir', filter: true, search: 'عطر' }
];
var NEWS_RE = /عطر|ادکلن|ادکلون|پرفیوم|پارفوم|رایحه|بوی |ادو ?تویلت|ادو ?پرفیوم|fragrance|perfume|parfum/i;
function newsText(h, n) {      // برای نمایش است نه جستجو: نیم‌فاصله و رقمِ فارسی دست‌نخورده می‌ماند؛ فقط برچسب‌ها برداشته و «ي/ك» عربی درست می‌شود
  var t = stripTags(h).replace(/[\u200b\u2060\ufeff\u00ad]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
}
function newsImg(u) { u = String(u || '').trim(); if (/^http:\/\//i.test(u)) u = 'https://' + u.slice(7); return /^https:\/\//i.test(u) && u.length < 600 ? u : ''; }      // عکسِ ناامن (http) بارگذاری نمی‌شود؛ همه‌ی سایت‌ها https دارند
function newsDate(d) { var now = Date.now(); return d > 0 && d <= now + 864e5 ? Math.min(d, now) : 0; }      // اختلافِ ساعتِ کم: همین حالا؛ تاریخِ آینده‌ی دور (ساعتِ اشتباهِ سایت): نامعلوم تا برای همیشه «تازه‌ترین» نماند
/* خلاصه‌ی خبر: «[…]»، «ادامه مطلب» و «The post … appeared first on …» که وردپرس ته خلاصه می‌گذارد برداشته می‌شود؛ اگر خلاصه همان عنوان بود، خالی می‌ماند */
function newsExcerpt(h, title) {
  var x = newsText(h, 700).replace(/\s*The post .{0,200} appeared first on .{0,100}$/i, '').replace(/\s*(\[\s*(…|\.\.\.|&hellip;)\s*\]|ادامه (مطلب|خبر)(\s*[»›>]+)?)\s*$/, '').replace(/\s*(…|\.\.\.)$/, '').trim();
  if (x.length > 130) x = x.slice(0, 130).replace(/\s+\S*$/, '') + '…';
  var a = x.replace(/[\s…\.:؛،]/g, ''), b = String(title || '').replace(/[\s…\.:؛،]/g, '');
  return a && b && (a === b || b.indexOf(a) === 0 || a.indexOf(b) === 0 && a.length < b.length + 12) ? '' : x;
}
/* وقتی نوشته «عکسِ شاخص» ندارد: اولین عکسِ درخورِ خودِ نوشته (نه آیکون/لوگو/ایموجی)؛ اگر srcset دارد، اندازه‌ی میانی (حدود ۷۰۰ پیکسل) برای اینکه روی گوشی سنگین نباشد */
function newsPickImg(html) {
  html = String(html == null ? '' : html).slice(0, 40000);
  function at(tag, a) { var r = new RegExp('\\s' + a + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return r ? (r[1] != null ? r[1] : r[2]) : ''; }
  var re = /<img\b(?:[^>"']|"[^"]*"|'[^']*'){0,600}>/gi, m, n = 0;      // «>» داخلِ مقدارِ صفت (alt="a > b") تگ را نمی‌شکند
  while ((m = re.exec(html)) && n++ < 8) {
    var tag = m[0], w = +at(tag, 'width') || 0, h = +at(tag, 'height') || 0;
    if ((w && w < 160) || (h && h < 100)) continue;
    var src = at(tag, 'data-src') || at(tag, 'data-lazy-src') || at(tag, 'src');
    if (/^data:/i.test(src)) src = at(tag, 'data-src') || at(tag, 'data-lazy-src');
    var cands = [], ss = at(tag, 'srcset') || at(tag, 'data-srcset'), sm, sre = /(\S+)\s+(\d+)w\s*(?:,|$)/g;      // آدرس می‌تواند ویرگول داشته باشد (w_300,h_200)
    while ((sm = sre.exec(ss))) cands.push({ u: sm[1], w: parseInt(sm[2], 10) });
    if (cands.length) { cands.sort(function (a, b) { return a.w - b.w; }); var pick = cands.filter(function (c) { return c.w >= 640; })[0] || cands[cands.length - 1]; if (pick.w >= 300) src = pick.u; }
    src = decodeEnt(String(src || '').trim());      // &amp; و &#038; (وردپرس) → &
    if (src.slice(0, 2) === '//') src = 'https:' + src;
    if (!src || /(^|[\/_\-.])(emoji|emojis|avatar|gravatar|logo|icon|icons|spinner|placeholder|pixel)([\/_\-.\d]|$)|\.svg(\?|$)|\.gif(\?|$)/i.test(src)) continue;      // لوگو/آیکون/ایموجی/آواتار (واژه‌ی کامل؛ «silicone» نه)
    var ok = newsImg(src); if (ok) return ok;
  }
  return '';
}
function newsFromWp(a, src) {
  var out = [];
  a.forEach(function (p) {
    if (!p || typeof p !== 'object') return;
    var t = newsText(p.title && p.title.rendered, 140), u = itemUrl(src.id, p.link); if (!t || !u) return;
    var d = newsDate(Date.parse(p.date_gmt ? p.date_gmt + 'Z' : p.date)), img = '';
    try { var fm = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]; if (fm) { var sz = fm.media_details && fm.media_details.sizes; img = (sz && ((sz.medium_large && sz.medium_large.source_url) || (sz.large && sz.large.source_url))) || fm.source_url || (sz && sz.medium && sz.medium.source_url) || ''; } } catch (e) { }
    img = newsImg(img);
    var body = p.content && typeof p.content.rendered === 'string' ? p.content.rendered : '';
    if (!img && body) { try { img = newsPickImg(body); } catch (e) { } }      // عکسِ شاخص نداشت: عکسِ داخلِ متن
    var ex = newsExcerpt(p.excerpt && p.excerpt.rendered, t);
    if (!ex && body) { try { ex = newsExcerpt(body.replace(/<(figure|script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').slice(0, 6000), t); } catch (e) { } }      // خلاصه نداشت: چند کلمه‌ی اولِ متن
    out.push({ s: src.id, sn: src.name, t: t, d: d, u: u, x: ex, img: img });
  });
  return out;
}
function newsFromRss(xml, src) {
  var out = [];
  if (typeof DOMParser === 'undefined') return out;
  var doc; try { doc = new DOMParser().parseFromString(String(xml || ''), 'text/xml'); } catch (e) { return out; }
  if (!doc || doc.querySelector('parsererror')) return out;
  Array.prototype.forEach.call(doc.querySelectorAll('item'), function (it) {
    function tx(n) { var e = it.getElementsByTagName(n)[0]; return e ? e.textContent : ''; }
    var t = newsText(tx('title'), 140), u = itemUrl(src.id, String(tx('link')).trim()); if (!t || !u) return;
    var raw = tx('content:encoded') || tx('description'), im = '', m = /<img[^>]+src=["']([^"']+)["']/i.exec(raw);
    var enc = it.getElementsByTagName('enclosure')[0], mc = it.getElementsByTagName('media:content')[0];
    im = (enc && /image/i.test(enc.getAttribute('type') || 'image') && enc.getAttribute('url')) || (mc && mc.getAttribute('url')) || (m && m[1]) || '';
    out.push({ s: src.id, sn: src.name, t: t, d: newsDate(Date.parse(tx('pubDate'))), u: u, x: newsExcerpt(tx('description'), t), img: newsImg(im) });
  });
  return out;
}
var NEWS_PER = 10, NEWS_MAXPAGE = 12, NEWS_OKBASE = {};
/* یک صفحه (۱۰ نوشته) از یک سایت. سایتی که وردپرسش در پوشه‌ی /mag یا /blog است، چند نشانی امتحان می‌شود و اولینی که جواب داد در همین اجرا یادش می‌ماند.
   خروجی: {items, note, raw: تعداد نوشته‌ی صفحه پیش از پالایش، end: صفحه‌ی بعدی ندارد} */
async function newsOne(src, net, page) {
  page = page || 1;
  var root = src.base.replace(/^(https?:\/\/[^\/]+).*$/, '$1'), bases = [src.base].concat((src.alt || []).map(function (a) { return root + a; }));
  if (NEWS_OKBASE[src.id]) bases = [NEWS_OKBASE[src.id]].concat(bases.filter(function (b) { return b !== NEWS_OKBASE[src.id]; }));
  var gotAny = false;
  for (var bi = 0; bi < bases.length; bi++) {
    var base = bases[bi], items = [], raw = 0, got = false, endHint = false, restArr = false, down = false;
    var u1 = base + '/wp-json/wp/v2/posts?per_page=' + NEWS_PER + '&_embed=1' + (page > 1 ? '&page=' + page : '') + (src.search ? '&search=' + encodeURIComponent(src.search) : '');
    var r = await getR(net, u1, { Accept: 'application/json' }, 2), a = r.status === 200 ? parseJson(r.body) : undefined;
    down = r.status === 0 || r.status >= 500;      // سایت خاموش/خراب است: نشانی‌های دیگرش را امتحان نکن
    if (Array.isArray(a)) { got = restArr = true; raw = a.length; items = newsFromWp(a, src); }
    else if (page > 1 && r.status === 400 && /page_number/i.test(String(r.body || ''))) { got = true; endHint = true; }      // «rest_post_invalid_page_number»: بیش از این نوشته‌ای نیست
    if (!items.length && !endHint && (page === 1 || !restArr && !got)) {
      var q = []; if (src.search) q.push('s=' + encodeURIComponent(src.search)); if (page > 1) q.push('paged=' + page);
      var r2 = await getR(net, base + '/feed/' + (q.length ? '?' + q.join('&') : ''), { Accept: 'application/rss+xml, application/xml, text/xml' }, 2);
      down = down && (r2.status === 0 || r2.status >= 500);
      if (r2.status === 200 && /<(rss|feed)[\s>]/i.test(String(r2.body).slice(0, 600))) { got = true; items = newsFromRss(r2.body, src); raw = items.length; }
    }
    if (src.filter) items = items.filter(function (x) { return NEWS_RE.test(x.t + ' ' + x.x); });
    gotAny = gotAny || got;
    if (items.length || raw > 0 || (page > 1 && got)) {
      NEWS_OKBASE[src.id] = base;
      return { items: items, note: items.length ? 'ok' : 'none', raw: raw, end: endHint || raw < NEWS_PER || page >= NEWS_MAXPAGE };
    }
    if (down && !got) break;
  }
  return { items: [], note: gotAny ? 'none' : 'fail', raw: 0, end: true };
}
function newsGuard(src, net, page) {      // هر سایت حداکثر ۲۵ ثانیه؛ خطا = «نشد»، نه افتادنِ همه
  var tm;
  return Promise.race([newsOne(src, net, page).catch(function () { return { items: [], note: 'fail', raw: 0, end: true }; }), new Promise(function (res) { tm = setTimeout(function () { res({ items: [], note: 'fail', raw: 0, end: true }); }, 25000); })]).then(function (r) { clearTimeout(tm); return r; });
}
function newsByDate(a, b) { return b.d - a.d; }
/* خبرهای تازه. st = وضعیتِ «خبرهای قدیمی‌تر» برای newsMore: از هر سایت، آنچه دیده نشد (pend)، آخرین صفحه‌ای که خوانده شد و اینکه سایت تمام شد */
async function fetchNews(net, srcIds) {
  var notes = {}, all = [], st = {};
  var srcs = NEWS_SRC.filter(function (s) { return !srcIds || srcIds.indexOf(s.id) >= 0; });
  var jobs = srcs.map(function (src) {
    return newsGuard(src, net, 1).then(function (r) {
      notes[src.id] = r.note;
      var its = r.items.sort(newsByDate);
      st[src.id] = { pend: its.slice(6), page: 1, end: !!r.end };      // از هر سایت حداکثر شش خبرِ تازه؛ یک سایتِ پرنوشته همه‌جا را نگیرد؛ بقیه برای «خبرهای قدیمی‌تر»
      return its.slice(0, 6);
    });
  });
  (await Promise.all(jobs)).forEach(function (a) { all = all.concat(a); });
  all.sort(newsByDate);
  var seen = {}; all = all.filter(function (x) { var k = x.u; if (seen[k]) return false; seen[k] = 1; return true; });
  all.slice(24).forEach(function (x) { if (st[x.s]) st[x.s].pend.push(x); });      // از سقفِ ۲۴ بیرون ماند: برای پایین‌تر
  Object.keys(st).forEach(function (k) { st[k].pend.sort(newsByDate); });
  return { items: all.slice(0, 24), notes: notes, st: st };
}
/* خبرهای قدیمی‌تر (وقتی کاربر به پایین صفحه رسید): از هر سایتی که هنوز نوشته دارد تا شش خبر، به ترتیب تاریخ.
   have = {آدرس: 1} خبرهایی که همین حالا هست. st (از fetchNews یا null) تغییر می‌کند. done = هیچ سایتی چیزی ندارد */
async function newsMore(net, st, have) {
  st = st || {}; have = have || {};
  var srcs = NEWS_SRC.filter(function (s) { return !st[s.id] || !st[s.id].end || st[s.id].pend.length; });
  var tried = 0, fails = 0;
  var jobs = srcs.map(async function (src) {
    var e = st[src.id] = st[src.id] || { pend: [], page: 0, end: false };
    e.failed = false; tried++;
    function fresh() { e.pend = e.pend.filter(function (x) { return !have[x.u]; }); }
    fresh();
    for (var tries = 0; e.pend.length < 6 && !e.end && tries < 3; tries++) {      // تا شش خبرِ تازه برای این سایت؛ صفحه‌ی پر از تکراری حساب نمی‌شود
      var r = await newsGuard(src, net, e.page + 1);
      if (r.note === 'fail' && !r.raw) { e.failed = true; e.nf = (e.nf | 0) + 1; fails++; if (e.nf >= 2) e.end = true; break; }      // نشد: دفعه‌ی بعد دوباره؛ دو بار پشتِ هم نشد = این سایت تمام
      e.nf = 0; e.page++; e.end = !!r.end; e.pend = e.pend.concat(r.items); fresh();
    }
    e.pend.sort(newsByDate);
    return e.pend.splice(0, 6);
  });
  var got = []; (await Promise.all(jobs)).forEach(function (a) { got = got.concat(a); });
  var offline = tried > 0 && fails === tried;
  if (offline) srcs.forEach(function (src) { st[src.id].end = false; st[src.id].nf = 0; });      // همه با هم نشدند = اینترنت قطع است، نه سایتِ خراب؛ دکمه‌ی «دوباره» باید کار کند
  var seen = {}; got = got.filter(function (x) { if (seen[x.u] || have[x.u]) return false; seen[x.u] = 1; return true; });
  got.sort(newsByDate);
  var done = NEWS_SRC.every(function (s) { return st[s.id] && st[s.id].end && !st[s.id].pend.length; });
  return { items: got, st: st, done: done, failed: offline };
}

/* ---------- تاریخچه‌ی قیمت و موجودی (برای «گزارش بازار») ----------
   h.d["gid|ml"] = { n: نام, l: برچسب, f: اولین‌بار, s: آخرین‌بار دیده شد, c: تعداد فروشگاه، cm/ct: بیشترین تعداد و زمانش,
                     p: [[زمان، قیمت]...], m/mt: شمارنده‌ی «دیده نشد», o: از این زمان ناموجود, r: دوباره موجود شد در }              */
var H_DAY = 86400000, H_KEEP = 60 * H_DAY, H_MAXP = 24, H_MAXE = 9000;
function histNew() { return { v: 1, t0: 0, t: 0, as: '', d: {} }; }
function histFix(h) {                       // داده‌ی خراب یا ناقص دور ریخته می‌شود تا گزارش هرگز نیفتد
  if (!h || typeof h !== 'object' || !h.d || typeof h.d !== 'object' || Array.isArray(h.d)) return histNew();
  h.t0 = +h.t0 > 0 ? +h.t0 : 0; h.t = +h.t > 0 ? +h.t : 0; h.as = typeof h.as === 'string' ? h.as : '';
  Object.keys(h.d).forEach(function (k) {
    var e = h.d[k], okp = e && typeof e === 'object' && Array.isArray(e.p) && e.p.length && e.p.every(function (x) { return Array.isArray(x) && x[0] > 0 && x[1] > 0; });
    if (!okp || k.indexOf('|') < 0 || !(+k.split('|')[1] > 0)) { delete h.d[k]; return; }
    e.n = String(e.n == null ? '' : e.n); e.l = String(e.l == null ? '' : e.l); e.b = typeof e.b === 'string' ? e.b : ''; e.hm = typeof e.hm === 'string' ? e.hm : ''; e.s = +e.s || 0; e.f = +e.f || 0; e.c = +e.c || 0; e.cm = +e.cm || 0; e.ct = +e.ct || 0; e.o = +e.o || 0; e.r = +e.r || 0; e.m = +e.m || 0; e.mt = +e.mt || 0;
  });
  return h;
}
function histSnap(h, list, srcSig, now, labFn, blkSig, metaFn) {      // metaFn(g) → {b: شناسه‌ی برند, m: شناسه‌ی مدل}؛ برای اینکه عطرِ ناموجود هم از «برندِ خاموش» و «پنهان‌شده» جدا شود
  now = now || Date.now();
  if (!h || !h.d || !list || !list.length) return { skipped: 'empty' };
  if (h.t && now < h.t) { if (h.t - now > 2 * H_DAY) { h.t = now; Object.keys(h.d).forEach(function (k) { var e = h.d[k]; ['s', 'f', 'ct', 'o', 'r', 'mt'].forEach(function (f) { if (e[f] > now) e[f] = now; }); e.p.forEach(function (q) { if (q[0] > now) q[0] = now; }); }); } else return { skipped: 'clock' }; }      // کمی عقب‌رفتنِ ساعت: نادیده؛ پرشِ بزرگِ ساعت به آینده (و برگشتنش) نباید تاریخچه را برای همیشه قفل کند
  var present = {}, np = 0;
  list.forEach(function (g) { g.sizes.forEach(function (z) { present[g.id + '|' + z.ml] = [g, z]; np++; }); });
  if (!np) return { skipped: 'empty' };
  var chg = !!(h.as && h.as !== srcSig);                              // مجموعه‌ی سایت‌های روشن عوض شده: مقایسه با قبل بی‌معنی است
  var live = 0, miss = 0;
  Object.keys(h.d).forEach(function (k) { var e = h.d[k]; if (!e.o) { live++; if (!present[k]) miss++; } });
  var mass = live >= 20 && miss > live * 0.3;                         // یک‌دفعه بیش از ۳۰٪ نیامده: خطای دریافت است، ناموجود حساب نشود
  var bchg = h.bs !== undefined && blkSig !== undefined && h.bs !== blkSig;      // واژه‌ی ممنوع عوض شد: کالاهای برداشته‌شده «ناموجود» نیستند (قیمت‌ها حفظ می‌شود)
  if (!h.t0) h.t0 = now;
  var absent = {};                                                    // شناسه‌ی گروه عوض شده (ادغام/تقسیم) = همان عطر؛ نه «ناموجود» و «تازه» هم‌زمان
  Object.keys(h.d).forEach(function (k) {
    if (present[k] || now - (h.d[k].s || 0) > 14 * H_DAY) return;
    var nk = h.d[k].n + '|' + k.split('|')[1] + '|' + h.d[k].l; absent[nk] = absent[nk] === undefined ? k : null;      // اگر چند ردیفِ هم‌نام باشد، حدس نمی‌زنیم
  });
  Object.keys(present).forEach(function (k) {
    var g = present[k][0], z = present[k][1], e = h.d[k], ns = z.srcs.length, lab = labFn ? labFn(g) : '', mt = metaFn ? (metaFn(g) || {}) : {};
    if (!e) {
      var ak = absent[g.name + '|' + z.ml + '|' + lab];
      if (ak && h.d[ak] && !present[ak]) { e = h.d[k] = h.d[ak]; delete h.d[ak]; absent[g.name + '|' + z.ml + '|' + lab] = 0; }
      else { h.d[k] = { n: g.name, l: lab, b: mt.b || '', hm: mt.m || '', f: chg ? 0 : now, s: now, c: ns, cm: ns, ct: now, p: [[now, z.price]] }; return; }      // با عوض شدنِ سایت‌های روشن، چیزِ دیده‌شده «تازه» نیست
    }
    e.n = g.name; e.l = lab; e.s = now; e.m = 0; e.mt = 0; if (mt.b) { e.b = mt.b; e.hm = mt.m || ''; }
    if (e.o) { if (now - e.o >= 6 * 3600000) e.r = now; e.o = 0; }
    e.c = ns; if (chg || !e.cm || ns >= e.cm || now - (e.ct || 0) > 14 * H_DAY) { e.cm = ns; e.ct = now; }
    var p = e.p = Array.isArray(e.p) ? e.p : [], last = p[p.length - 1];
    if (chg || !last) e.p = [[now, z.price]];
    else if (Math.abs(z.price - last[1]) / last[1] >= 0.02) { p.push([now, z.price]); if (p.length > H_MAXP) p.shift(); }
  });
  Object.keys(h.d).forEach(function (k) {
    var e = h.d[k];
    if (now - (e.s || 0) > H_KEEP) { delete h.d[k]; return; }
    if (present[k] || e.o) return;
    if (chg || mass || bchg) { e.mt = 0; e.m = 0; return; }
    if (!e.mt) { e.mt = now; e.m = 1; }
    else if (now - e.mt >= 1800000) { e.o = e.mt; e.m = 2; }          // دو بار با فاصله‌ی نیم‌ساعت دیده نشد
  });
  var ks = Object.keys(h.d);
  if (ks.length > H_MAXE) ks.sort(function (a, b) { return h.d[a].s - h.d[b].s; }).slice(0, ks.length - H_MAXE).forEach(function (k) { delete h.d[k]; });
  h.as = srcSig; if (blkSig !== undefined) h.bs = blkSig; h.t = now;
  return { skipped: mass ? 'mass' : '', n: np };
}
/* گزارش: همه‌چیز از روی تاریخچه + فهرست فعلی. هر ردیف: { k, gid, name, l, ml, ... } */
function histReport(h, list, now, o) {
  now = now || Date.now(); o = o || {};
  var thr = o.thr || 0.08, R = { span: h && h.t0 ? (now - h.t0) / H_DAY : 0, up: [], down: [], gone: [], back: [], low: [], fresh: [], gap: [], trend: { n: 0, up: 0, down: 0, same: 0, med: 0 } };
  var cur = {}, pcs = [], sameSet = !o.sig || !h || h.as === o.sig;
  (list || []).forEach(function (g) { g.sizes.forEach(function (z) {
    cur[g.id + '|' + z.ml] = z;
    var used = z.srcs.filter(function (r) { return r.used !== false; });
    if (used.length >= 2) {                                         // اختلاف قیمتِ فروشگاه‌ها همین حالا
      var lo = used[0], hi = used[0]; used.forEach(function (r) { if (r.price < lo.price) lo = r; if (r.price > hi.price) hi = r; });
      var d = hi.price - lo.price;
      if (lo.price > 0 && d / lo.price >= 0.15 && d / lo.price <= 2 && d >= 50000) R.gap.push({ k: g.id + '|' + z.ml, gid: g.id, name: g.name, l: o.lab ? o.lab(g) : '', ml: z.ml, lo: lo.price, loS: lo.s, hi: hi.price, hiS: hi.s, pct: d / lo.price, d: d });
    }
  }); });
  if (h && h.d) Object.keys(h.d).forEach(function (k) {
    var e = h.d[k], gid = k.split('|')[0], ml = +k.split('|')[1], base = { k: k, gid: gid, name: e.n, l: e.l || '', ml: ml, b: e.b || '', hm: e.hm || '' };
    var isCur = !!cur[k], curNow = isCur && cur[k].price > 0 ? cur[k].price : 0, curP = sameSet ? curNow : 0;      // قیمتِ همین حالا (نقطه‌ی تاریخچه فقط با ۲٪ تغییر ثبت می‌شود)؛ اگر سایت‌های روشن عوض شده و هنوز عکسِ تازه گرفته نشده، قیمتِ سایتِ دیگر را با قیمتِ قبلی نمی‌سنجیم
    if (isCur) { base.n = cur[k].srcs.length; base.stores = cur[k].srcs.map(function (r) { return r.s; }); base.pts = (e.p || []).slice(-8).map(function (q) { return q[1]; }); }
    if (isCur && e.p && e.p.length) {
      var last = e.p[e.p.length - 1], ref = null;                   // قدیمی‌ترین نقطه‌ی ۳۰ روز اخیر
      for (var i = 0; i < e.p.length; i++) if (now - e.p[i][0] <= 30 * H_DAY) { ref = e.p[i]; break; }
      if (!ref) ref = last;
      if (ref !== last || e.p.length > 1) {
        var from = ref[1], to = curP || last[1], pc = (to - from) / from;
        R.trend.n++; pcs.push(pc); if (pc >= 0.02) R.trend.up++; else if (pc <= -0.02) R.trend.down++; else R.trend.same++;
        if (Math.abs(pc) >= thr && Math.abs(to - from) >= 20000) { var rec = Object.assign({}, base, { from: from, to: to, pct: pc, ago: (now - ref[0]) / H_DAY }); (pc > 0 ? R.up : R.down).push(rec); }
      }
    }
    if (!isCur && e.o && now - e.o <= 30 * H_DAY) R.gone.push(Object.assign({}, base, { was: e.cm || 0, ago: (now - e.o) / H_DAY, price: e.p && e.p.length ? e.p[e.p.length - 1][1] : 0 }));
    if (isCur && e.r && now - e.r <= 14 * H_DAY) R.back.push(Object.assign({}, base, { ago: (now - e.r) / H_DAY, price: curNow || e.p[e.p.length - 1][1] }));
    if (isCur && e.cm > e.c && now - (e.ct || 0) <= 14 * H_DAY) R.low.push(Object.assign({}, base, { was: e.cm, now: e.c, price: curNow || e.p[e.p.length - 1][1] }));
    if (isCur && R.span >= 3 && e.f && e.f > h.t0 + 0.5 * H_DAY && now - e.f <= 7 * H_DAY) R.fresh.push(Object.assign({}, base, { ago: (now - e.f) / H_DAY, price: curNow || e.p[e.p.length - 1][1] }));
  });
  R.up.sort(function (a, b) { return b.pct - a.pct; }); R.down.sort(function (a, b) { return a.pct - b.pct; });
  R.gone.sort(function (a, b) { return a.ago - b.ago; }); R.back.sort(function (a, b) { return a.ago - b.ago; });
  R.low.sort(function (a, b) { return (b.was - b.now) - (a.was - a.now); }); R.fresh.sort(function (a, b) { return a.ago - b.ago; });
  R.gap.sort(function (a, b) { return b.d - a.d; });
  if (pcs.length) { pcs.sort(function (a, b) { return a - b; }); R.trend.med = (pcs[(pcs.length - 1) >> 1] + pcs[pcs.length >> 1]) / 2; }
  return R;
}
/* آمارِ همین حالا از فهرست (بدون تاریخچه): تعداد، هر فروشگاه چند عطر دارد و چقدر ارزان/گران است */
function marketStats(list) {
  var R = { perfumes: (list || []).length, sizes: 0, single: 0, multi: 0, bySrc: {} };
  function S(id) { return R.bySrc[id] || (R.bySrc[id] = { n: 0, shared: 0, cheapest: 0, idx: [], avg: 0 }); }
  (list || []).forEach(function (g) { g.sizes.forEach(function (z) {
    R.sizes++;
    if (z.srcs.length < 2) R.single++; else R.multi++;
    z.srcs.forEach(function (r) { S(r.s).n++; });
    var u = z.srcs.filter(function (r) { return r.used !== false && r.price > 0; });
    if (u.length < 2) return;
    var vals = u.map(function (r) { return r.price; }).sort(function (a, b) { return a - b; }), md = (vals[(vals.length - 1) >> 1] + vals[vals.length >> 1]) / 2, lo = vals[0];
    var tie = vals.filter(function (v) { return v === lo; }).length;
    u.forEach(function (r) { var s = S(r.s); s.shared++; if (r.price === lo && tie < u.length) s.cheapest++; s.idx.push(r.price / md); });
  }); });
  Object.keys(R.bySrc).forEach(function (k) { var s = R.bySrc[k]; s.avg = s.idx.length ? s.idx.reduce(function (a, b) { return a + b; }, 0) / s.idx.length : 0; delete s.idx; });
  return R;
}
/* گزارشِ بازار از دادهٔ همین الان (بدون نیاز به تاریخچه): مقایسه‌ی فروشگاه‌ها برای هر عطر، سطحِ قیمتِ برندها، پراکندگیِ قیمت.
   o.brand(gid) → {id,name} ؛ o.lab(g) → برچسب نوع/جنسیت */
function marketView(list, o) {
  o = o || {};
  var V = { deals: [], brands: [], tiers: [], p100: [], save: 0, nDeals: 0, nPerf: 0, med100: 0, top: [], low: [] };
  var BR = {}, EDGE = [2e6, 4e6, 6e6, 9e6, 14e6], seenG = {};
  V.tiers = [0, 0, 0, 0, 0, 0];
  (list || []).forEach(function (g) {
    var b = o.brand ? o.brand(g.id) : null, lbl = o.lab ? o.lab(g) : '', has = false;
    g.sizes.forEach(function (z) {
      if (!(z.price > 0)) return;
      has = true;
      var used = z.srcs.filter(function (r) { return r.used !== false && r.price > 0; });
      if (used.length >= 2) {
        var lo = used[0], hi = used[0]; used.forEach(function (r) { if (r.price < lo.price) lo = r; if (r.price > hi.price) hi = r; });
        var d = hi.price - lo.price, pc = d / lo.price;
        if (pc >= 0.05 && pc <= 1.5 && d >= 30000) {
          V.deals.push({ gid: g.id, name: g.name, l: lbl, ml: z.ml, lo: lo.price, loS: lo.s, hi: hi.price, hiS: hi.s, pct: pc, d: d, n: used.length, gn: g.gn || '' });
          V.save += d;
        }
      }
      if (z.ml >= 90 && z.ml <= 110) {
        V.p100.push(z.price);
        var t = 0; while (t < EDGE.length && z.price >= EDGE[t]) t++; V.tiers[t]++;
      }
      if (b && z.ml >= 30 && z.ml <= 250) {
        var ppm = z.price / z.ml * 100, o2 = BR[b.id] || (BR[b.id] = { id: b.id, name: b.name, gids: {}, ppm: [], lo: null, hi: null });
        o2.gids[g.id] = 1; o2.ppm.push(ppm);
        if (!o2.lo || ppm < o2.lo.ppm) o2.lo = { ppm: ppm, name: g.name, gid: g.id, ml: z.ml, price: z.price };
        if (!o2.hi || ppm > o2.hi.ppm) o2.hi = { ppm: ppm, name: g.name, gid: g.id, ml: z.ml, price: z.price };
      }
    });
    if (has && !seenG[g.id]) { seenG[g.id] = 1; V.nPerf++; }
  });
  V.nDeals = V.deals.length;
  V.med100 = V.p100.length ? median(V.p100) : 0;
  V.brands = Object.keys(BR).map(function (k) { var x = BR[k]; return { id: x.id, name: x.name, n: Object.keys(x.gids).length, med: median(x.ppm), lo: x.lo, hi: x.hi }; });
  /* گران‌ترین و ارزان‌ترین عطرِ ۱۰۰ میلی */
  var all = [];
  (list || []).forEach(function (g) { g.sizes.forEach(function (z) { if (z.ml >= 90 && z.ml <= 110 && z.price > 0) all.push({ gid: g.id, name: g.name, l: o.lab ? o.lab(g) : '', ml: z.ml, price: z.price, stores: z.srcs.map(function (r) { return r.s; }) }); }); });
  all.sort(function (a, b) { return a.price - b.price; });
  V.low = all.slice(0, 30); V.top = all.slice(-30).reverse();
  return V;
}

/* ---------- جستجو (نوشتن و گفتن) ----------
   یک نمایه برای هر مدل: واژه‌های نامِ مدل، معادل انگلیسی، واژه‌های برند و واژه‌های دیگر.
   هر واژه‌ی جستجو با چند روش سنجیده می‌شود: دقیق، شروع‌شدن با آن (هنگام تایپ)، املای نزدیک (همان حروفِ بی‌صدا یا همان تلفظ انگلیسی) و یک غلطِ تایپی.
   اول عطرهایی می‌آیند که همه‌ی واژه‌هایشان «دقیقاً» در نامِ عطر یا برند هست؛ بعد بقیه به ترتیبِ نزدیکی به «نامِ مدل». */
function srMap() { return Object.create(null); }      // «constructor» و «toString» هم می‌توانند واژه باشند؛ شیء ساده نباید با آن‌ها قاطی شود
var SR_STOP = srMap(); ('عطر ادکلن ادکلون ادو ادوپرفیوم پرفیوم پارفوم تویلت میل میلی لیتر قیمت بده بدید نشون نشان بگو بگید پیدا کن کنید برام برای من یه یک می خوام خواهم خوایم دنبال رو را از و با فقط لطفا مردانه زنانه مردونه زنونه یونیسکس اورجینال اوریجینال ارجینال اصل اصلی ml cc oz edp edt edc eau parfum perfume cologne toilette ادوتویلت ادوکلن ادوپرفوم ادوتوالت توالت اکستریت اسپری تستر').split(' ').forEach(function (w) { SR_STOP[w] = 1; });
var SR_CONN = srMap(); ('de du di la le the of by and for pour with دو دی د لا لو لی ال بای پور ان اند').split(' ').forEach(function (w) { SR_CONN[w] = 1; });      // واژه‌های ربطیِ نام‌ها؛ اگر در ردیفی نبودند، رد کردنِ آن ردیف دلیل نمی‌شود
var SR_NUM = srMap(); ('صد دویست سیصد پانصد پنجاه شصت هفتاد هشتاد نود بیست سی چهل لیتر لیتری سی‌سی اونس گرم گرمی میلی‌لیتر mg ccm fl').split(' ').forEach(function (w) { SR_NUM[w] = 1; });      // اندازه‌های رایج («ساواج صد میل»)؛ فقط وقتی دقیق در نام باشند حساب می‌شوند
('چنده چقدره چقدر چند موجوده موجود دارید داری دارین دارم میخوام میخواستم میخرم بخرم خرید فروش موجودی ارزان ارزون گرون گران جدید تازه خوب بهترین بهتر').split(' ').forEach(function (w) { SR_STOP[w] = 1; });      // حرف‌های روزمره‌ی «ساواج چنده؟»؛ نبودنشان در نام دلیلِ رد کردنِ عطر نیست
var SR_UNIT = srMap(); ('میل میلی ml cc oz اونس لیتر لیتری گرم گرمی سی‌سی میلی‌لیتر mg ccm fl').split(' ').forEach(function (w) { SR_UNIT[w] = 1; });      // بعد از عدد بیاید یعنی اندازه است، نه شماره‌ی نام
function srNum(t) { return /^\d+([.,]\d+)?$/.test(t); }      // هر عددی («45»، «250»، «3.4») اندازه است؛ فقط وقتی در نام باشد حساب می‌شود («212»، «نامبر 5»)
function srSoft(t) { return SR_STOP[t] || SR_CONN[t] || SR_NUM[t] || srNum(t); }
var SR_PNUM = srMap(); (function () { var o = { یک: 1, دو: 2, سه: 3, چهار: 4, پنج: 5, شش: 6, هفت: 7, هشت: 8, نه: 9, ده: 10, یازده: 11, دوازده: 12, سیزده: 13, نوزده: 19 }; for (var k in o) SR_PNUM[k] = String(o[k]); })();
var SR_PNUM2 = srMap(); ('چهار 4 پنج 5 شش 6 هفت 7 هشت 8 نوزده 19').split(' ').forEach(function (w, i, a) { if (i % 2 === 0) SR_PNUM2[w] = a[i + 1]; });      // عددهای بی‌ابهام (نه «یک/دو/سه/نه/ده» که واژه‌ی معمولی‌اند)
var SR_NOP = srMap(); ('نامبر نمبر شماره number no n').split(' ').forEach(function (w) { SR_NOP[w] = 1; });      // «نامبر پنج» = «نامبر 5» (شنل)
var SR_ABBR = srMap(); (function () { var o = { ysl: 'ایو سن لوران', ck: 'کالوین کلین', jlo: 'جنیفر لوپز', jpg: 'ژان پل گوتیه', dg: 'دولچه گابانا', hb: 'هوگو بوس' }; for (var k in o) SR_ABBR[k] = o[k].split(' '); })();      // نام کوتاهِ برندها
var SR_ALIAS = srMap(); (function () { var o = { 'جادور': 'ژدو', 'ژادور': 'ژدو', 'ژدور': 'ژدو', jadore: 'ژدو', terre: 'تق', 'ترد': 'تق', 'ترا': 'تق', y: 'وای' }; for (var k in o) SR_ALIAS[k] = [o[k]]; })();      // نامِ معروفی که در داده با املای دیگری ثبت شده («ژدو» = جادور دیور)؛ فقط یک نسخه‌ی اضافه از جستجو ساخته می‌شود
function ed1(a, b) {      // فاصله‌ی ویرایش حداکثر ۱ (جایگزینی، افزودن، حذف، جابه‌جایی دو حرفِ کنار هم)
  var la = a.length, lb = b.length; if (Math.abs(la - lb) > 1) return false;
  var i = 0; while (i < la && i < lb && a[i] === b[i]) i++;
  if (i === la && i === lb) return true;
  if (la === lb) { if (a.slice(i + 1) === b.slice(i + 1)) return true; return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2); }
  return la > lb ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}
function lev(a, b, mx) {      // فاصله‌ی ویرایش با سقف؛ بیشتر از سقف یعنی mx+1
  var la = a.length, lb = b.length; if (Math.abs(la - lb) > mx) return mx + 1;
  var prev = [], cur = [], i, j; for (j = 0; j <= lb; j++) prev[j] = j;
  for (i = 1; i <= la; i++) {
    cur[0] = i; var lo = cur[0];
    for (j = 1; j <= lb; j++) { var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur[j] = v; if (v < lo) lo = v; }
    if (lo > mx) return mx + 1;
    var t = prev; prev = cur; cur = t;
  }
  return prev[lb];
}
function skOk(a, b) {      // «همان حروفِ بی‌صدا» فقط وقتی که خودِ دو واژه هم به هم نزدیک باشند؛ وگرنه «دیفای» و «دیویدوف» یکی می‌شد
  var m = Math.max(a.length, b.length), lim = m <= 5 ? 1 : (m <= 8 ? 2 : 3);
  return lev(a, b, lim) <= lim;
}
var FZC = srMap(), FZN = 0;
function fzKeyC(w) { var v = FZC[w]; if (v === undefined) { if (++FZN > 60000) { FZC = srMap(); FZN = 0; } v = FZC[w] = fzKey(w); } return v; }      // واژه‌ها تکرار می‌شوند؛ هر کدام یک بار
var SRN = srMap(), SRNN = 0;
function srn(x) {
  x = String(x == null ? '' : x); var v = SRN[x]; if (v !== undefined) return v;
  if (++SRNN > 60000) { SRN = srMap(); SRNN = 0; }
  return (SRN[x] = normFa(x.replace(/ى/g, 'ی').replace(/[ھہە]/g, 'ه').replace(/ڪ/g, 'ک')).toLowerCase().replace(/[،؛؟٪٫٬]/g, ' ').replace(/[^؀-ۿa-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());
}
function srToks(x) {      // «۱۰۰ml» → «100» و «ml»؛ «نامبر پنج» → «نامبر 5»؛ «ysl» → «ایو سن لوران»
  var out = [];
  srn(x).split(' ').forEach(function (t) {
    if (!t) return;
    var m = /^(\d{1,3})(ml|cc|oz|میل|میلی)$/.exec(t);
    if (m) out.push(m[1], m[2]);
    else if (SR_ABBR[t]) SR_ABBR[t].forEach(function (w) { out.push(w); });
    else if (SR_PNUM[t] && out.length && SR_NOP[out[out.length - 1]]) out.push(SR_PNUM[t]);
    else if (out.length && ((t === 'adore' && out[out.length - 1] === 'j') || (t === 'ادور' && out[out.length - 1] === 'جی'))) out[out.length - 1] = t === 'adore' ? 'jadore' : 'جادور';      // «j adore»، «جی ادور»
    else out.push(t);
  });
  return out;
}
var SRW = srMap(), SRWN = 0;
function srWord(x, toEn) {      // هر واژه یک بار ساخته می‌شود و بین همه‌ی ردیف‌ها مشترک است
  var r = SRW[x]; if (r) return r;
  if (++SRWN > 90000) { SRW = srMap(); SRWN = 0; }
  var fa = HAS_FA.test(x);
  return (SRW[x] = { x: x, fa: fa, k: fa ? fzKeyC(x) : '', e: fa && toEn ? srn(toEn(x)) : '' });
}
var SRV = srMap();      // همه‌ی واژه‌های نمایه و تعدادشان؛ برای جدا کردنِ نوشته‌های چسبیده («لاویه»)
function searchIndex(tree, toEn) {
  SRW = srMap(); SRWN = 0; SRV = srMap(); SIMV = null; var idx = [], bc = srMap();
  function words(str, set, arr, cap) { srn(str).split(' ').forEach(function (w) { if (w && !set[w] && arr.length < cap) { set[w] = 1; arr.push(srWord(w, toEn)); SRV[w] = (SRV[w] | 0) + 1; } }); }
  tree.forEach(function (b) {
    var bs = bc[b.id];
    if (!bs) {
      var set = srMap(), arr = [];
      if (b.id !== 'other') {      // «سایر برندها» نامِ برند نیست؛ «سایر» و «برندها» نباید ۶۰۰۰ عطر را بیاورند
        words(b.name, set, arr, 12);
        var bo = null; try { bo = brandOf(srn(b.name).split(' ')); } catch (e) { }
        if (bo) { (bo.al || []).forEach(function (a) { words(a.join(' '), set, arr, 12); }); if (bo.en) words(bo.en, set, arr, 12); }
      }
      bs = bc[b.id] = { arr: arr, set: set };
    }
    b.models.forEach(function (m) {
      var ms = srMap(), mw = [], es = srMap(), me = [], os = srMap(), ow = [], pop = 0;
      words(m.name, ms, mw, 10);
      m.variants.forEach(function (v) {
        var en = v.en; (!en ? [] : typeof en === 'string' ? [en] : Object.keys(en)).forEach(function (s) { words(s, es, me, 14); });
        (v.key || []).forEach(function (w) { w = srn(w); if (w && !ms[w] && !bs.set[w]) words(w, os, ow, 12); });
        (v.sizes || []).forEach(function (z) { pop += z && z.n ? z.n : 1; });
      });
      idx.push({ m: m, b: b, mw: mw, me: me, bw: bs.arr, ow: ow, n: mw.length || 1, pop: pop });
    });
  });
  return idx;
}
var SR_P = 0;      // آخرین سنجش از راه «شروعِ واژه» بود؟
function srScore(q, w) {
  var x = w.x, t = q.t; SR_P = 0;
  if (q.fa === w.fa) {
    if (x === t) return 1;
    if (q.pfx && x.length > t.length && x.indexOf(t) === 0 && (t.length >= 2 || q.last)) { SR_P = 1; return .86 - Math.min(.1, (x.length - t.length) * .02); }      // شروعِ واژه (فقط هنگام تایپ، نه در گفتار)؛ «دقیق» نیست، پس زیر .۸۷
    if (w.fa) {
      if (q.e && w.e && q.e === w.e) return .88;
      if (q.k.length >= 2 && q.k === w.k && x.length >= 3 && skOk(t, x)) return .85;
      if (t.length >= 4 && x.length >= 4 && ed1(t, x)) return .72;
    } else if (t.length >= 4 && ed1(t, x)) return .72;
    if (t.length >= 3 && x.length > t.length && x.indexOf(t, 1) > 0) return .55;      // نام چسبیده: «بلوشنل»
    return 0;
  }
  if (q.fa) {      // واژه‌ی فارسی در برابر واژه‌ی لاتین
    var e = q.e; if (!e) return 0;
    if (e === x) return .88;
    if (e.length >= 3 && x.indexOf(e) === 0) return .8;
    if (e.length >= 4 && ed1(e, x)) return e.length >= 6 ? .78 : .65;
    return 0;
  }
  if (q.f && q.f === x) return .88;      // واژه‌ی لاتین در برابر واژه‌ی فارسی
  if (q.fk.length >= 2 && q.fk === w.k && x.length >= 3 && skOk(q.f, x)) return .8;
  if (t.length >= 3 && w.e) { if (w.e === t) return .88; if (w.e.indexOf(t) === 0) return .8; if (t.length >= 4 && ed1(t, w.e)) return t.length >= 6 ? .78 : .65; }
  return 0;
}
function srBest(q, arr, mark) {
  var b = 0;
  for (var i = 0; i < arr.length; i++) { var v = srScore(q, arr[i]); if (v > b) { b = v; if (mark && (v >= .85 || SR_P)) mark.m = i; if (b >= 1) break; } }
  return b;
}
var SRK = 0;
function srSplits(toks) {      // «لاویه» → «لا ویه»: واژه‌ی ناشناخته (یا خیلی کم‌دیده) که از دو واژه‌ی شناخته‌شده ساخته شده؛ برای هر واژه یک نسخه
  var res = [];
  toks.forEach(function (t, k) {
    if (res.length >= 3 || t.length < 5 || !HAS_FA.test(t) || SRV[t] > 2) return;
    var bp = 0, bs = 0;
    for (var p = 2; p <= t.length - 2; p++) {
      var a = t.slice(0, p), b = t.slice(p), fa = SRV[a], fb = SRV[b];
      if (fa && fb && Math.max(a.length, b.length) >= 3) { var sc = Math.min(fa, fb); if (sc > bs) { bs = sc; bp = p; } }
    }
    if (bp) res.push(toks.slice(0, k).concat([t.slice(0, bp), t.slice(bp)], toks.slice(k + 1)));
  });
  return res;
}
/* ---------- شبیه‌ها: وقتی جوابِ «دقیق» کم است ----------
   تشخیصِ گفتار حرف‌های هم‌صدا را قاطی می‌کند (س/ص/ث، ز/ذ/ض/ظ، ت/ط، ه/ح، غ/ق…) و حرف‌های صدادار (ا و ی) را می‌اندازد یا اضافه می‌کند.
   برای هر واژه‌ی گفته‌شده نزدیک‌ترین واژه‌های نمایه با «فاصله‌ی ویرایشِ وزن‌دار» پیدا می‌شود: عوض شدنِ حرفِ هم‌صدا تقریباً رایگان، افتادنِ صدادار ارزان، غلطِ واقعی گران. */
var SIMC = srMap(); (function () {
  [['سصث', 0], ['زذضظ', 0], ['تط', 0], ['اآعأإ', .1], ['هح', .2], ['غق', .2], ['وؤ', .2], ['یئ', .2], ['کگ', .3], ['پب', .3], ['جچژ', .35], ['زژ', .4], ['شچ', .5], ['دت', .6], ['خک', .6], ['خه', .6], ['نم', .8]].forEach(function (g) {
    for (var i = 0; i < g[0].length; i++) for (var j = 0; j < g[0].length; j++) if (i !== j) SIMC[g[0][i] + g[0][j]] = g[1];
  });
})();
var SIMI = srMap(); 'ا آ و ی ئ ع ؤ أ إ'.split(' ').forEach(function (c) { SIMI[c] = .35; }); SIMI['ه'] = .5;
function simIns(c) { var v = SIMI[c]; return v === undefined ? 1 : v; }
function simFold(w) { return w.replace(/(.)\1+/g, '$1'); }
function wlev(a, b, mx) {      // فاصله‌ی ویرایشِ وزن‌دار؛ بیشتر از سقف یعنی mx+1
  var la = a.length, lb = b.length, prev = [0], cur = [], i, j;
  for (j = 1; j <= lb; j++) prev[j] = prev[j - 1] + simIns(b[j - 1]);
  for (i = 1; i <= la; i++) {
    var ca = a[i - 1], lo; cur[0] = prev[0] + simIns(ca); lo = cur[0];
    for (j = 1; j <= lb; j++) {
      var cb = b[j - 1], sc = ca === cb ? 0 : (SIMC[ca + cb] !== undefined ? SIMC[ca + cb] : 1);
      var v = Math.min(prev[j] + simIns(ca), cur[j - 1] + simIns(cb), prev[j - 1] + sc);
      cur[j] = v; if (v < lo) lo = v;
    }
    if (lo > mx) return mx + 1;
    var t = prev; prev = cur; cur = t;
  }
  return prev[lb];
}
function simWord(q, w) {      // شباهتِ دو واژه‌ی هم‌خط، ۰ تا ۱
  if (q === w) return 1;
  var la = q.length, lb = w.length, m = Math.max(la, lb);
  if (m < 2 || Math.abs(la - lb) > 3) return 0;
  var mx = m <= 3 ? .4 : m <= 4 ? .6 : m <= 6 ? 1.3 : 2;      // واژه‌ی کوتاه فقط با یک تغییرِ ارزان (صدادار یا هم‌صدا) جور می‌شود
  var d = wlev(q, w, mx); if (d > mx) return 0;
  return m <= 3 ? .85 : 1 - d / m;
}
var SIMV = null, SIMG = null, SIMK = null;
function simSkel(w) {      // حروفِ بی‌صدا با هم‌صداها یکی‌شده؛ «ساواج» و «سووج» هر دو «سج»
  return w.replace(/[صث]/g, 'س').replace(/[ذظض]/g, 'ز').replace(/ط/g, 'ت').replace(/ق/g, 'غ').replace(/گ/g, 'ک').replace(/ب/g, 'پ').replace(/ژ/g, 'ز').replace(/چ/g, 'ج').replace(/ح/g, 'ه').replace(/[اآأإوؤیئهع]/g, '').replace(/(.)\1+/g, '$1');
}
function simVocab() {
  if (SIMV) return SIMV;
  SIMV = []; SIMG = srMap(); SIMK = srMap();
  Object.keys(SRV).forEach(function (w) {
    if (w.length < 2 || SR_STOP[w] || srNum(w)) return;
    var v = { x: w, p: simFold(w), fa: HAS_FA.test(w), k: HAS_FA.test(w) ? simSkel(w) : '' }, n = SIMV.push(v) - 1;
    if (!v.fa) { for (var i = 0; i + 1 < v.p.length; i++) { var g = v.p.substr(i, 2), a = SIMG[g] || (SIMG[g] = []); if (a[a.length - 1] !== n) a.push(n); } return; }
    (SIMK[v.k] || (SIMK[v.k] = [])).push(n);
    for (var j = 0; j + 1 < v.k.length; j++) { var g2 = 'k' + v.k.substr(j, 2), a2 = SIMG[g2] || (SIMG[g2] = []); if (a2[a2.length - 1] !== n) a2.push(n); }
  });
  return SIMV;
}
function simCands(f) {      // واژه‌هایی از نمایه که احتمالاً به f نزدیک‌اند؛ فقط همین‌ها با فاصله‌ی ویرایش سنجیده می‌شوند
  var cnt = {}, out = [], got = {}, fa = HAS_FA.test(f), key = fa ? simSkel(f) : f, pre = fa ? 'k' : '', need = key.length <= 4 ? 1 : 2;
  function add(n) { if (!got[n]) { got[n] = 1; out.push(SIMV[n]); } }
  if (fa) { var ex = SIMK[key]; if (ex) ex.forEach(add); }
  for (var i = 0; i + 1 < key.length; i++) { var a = SIMG[pre + key.substr(i, 2)]; if (a) for (var k = 0; k < a.length; k++) { var n = a[k]; cnt[n] = (cnt[n] | 0) + 1; if (cnt[n] === need) add(n); } }
  return out;
}
function simInv(idx) {      // واژه → ردیف‌هایی که آن را دارند (یک بار برای هر نمایه)
  if (idx._inv) return idx._inv;
  var inv = srMap();
  idx.forEach(function (e, ei) {
    [e.mw, e.bw, e.me].forEach(function (arr, k) {
      for (var i = 0; i < arr.length; i++) { var w = arr[i].x, a = inv[w] || (inv[w] = []); if (a[a.length - 1] !== ei * 4 + k) a.push(ei * 4 + k); }
    });
  });
  idx._inv = inv; return inv;
}
/* خروجی: [{i, s, sim:true}] به ترتیبِ شباهت؛ skip = ردیف‌هایی که قبلاً آمده‌اند */
function searchSimilar(idx, alts, tools, skip, limit) {
  tools = tools || {}; var vocab = simVocab(), inv = simInv(idx), acc = {}, W = [1, .95, .85];
  alts.slice(0, 3).forEach(function (alt, ai) {
    var toks = srToks(alt).filter(function (t) { return !SR_STOP[t] && !SR_CONN[t] && !srNum(t) && t.length >= 2; }); if (!toks.length) return;
    toks = toks.slice(0, 6); var aw = 1 - .05 * ai, nt = toks.length, per = {};
    toks = toks.filter(function (t) { return simFold(t).length >= 2 && !(!HAS_FA.test(t) && t.length >= 4 && !/[aeiouy]/.test(t)); });      // «ززززز»، «xqzv»: بی‌معنی؛ شبیه‌یابی روی آن‌ها فقط فهرستِ بی‌ربط می‌دهد
    if (!toks.length) return;
    nt = toks.length;
    toks.forEach(function (t, j) {
      var forms = [];
      if (HAS_FA.test(t)) forms.push(simFold(t)); else { forms.push(t); var f = tools.toFa ? srn(tools.toFa(t)) : ''; if (f && HAS_FA.test(f)) f.split(' ').forEach(function (x) { if (x.length >= 2) forms.push(simFold(x)); }); }
      var hits = [];
      var seen = {};
      forms.forEach(function (f2) {
        var fa2 = HAS_FA.test(f2);
        simCands(f2).forEach(function (v) {
          if (v.fa !== fa2) return;
          var sv = simWord(f2, v.p); if (sv >= .6 && (seen[v.x] === undefined || sv > seen[v.x])) seen[v.x] = sv;
        });
      });
      Object.keys(seen).forEach(function (x) { hits.push([x, seen[x]]); });
      hits.forEach(function (h) {
        var lst = inv[h[0]]; if (!lst) return;
        for (var i = 0; i < lst.length; i++) {
          var ei = lst[i] >> 2, k = lst[i] & 3, v = h[1] * (W[k] || .8), a = acc[ei] || (acc[ei] = { t: [] });
          var cur = a.t[ai * 8 + j]; if (cur === undefined || v > cur) a.t[ai * 8 + j] = v;
          if (k === 0) { (a.m || (a.m = {}))[h[0]] = 1; }
        }
      });
    });
    acc._nt = acc._nt || {}; acc._nt[ai] = [nt, aw];
  });
  var out = [];
  Object.keys(acc).forEach(function (k) {
    if (k === '_nt') return;
    var ei = +k, a = acc[k], best = 0;
    for (var ai = 0; ai < 3; ai++) {
      var nw = acc._nt[ai]; if (!nw) continue;
      var sum = 0, got = 0, strong = 0;
      for (var j = 0; j < nw[0]; j++) { var v = a.t[ai * 8 + j]; if (v) { sum += v; got++; if (v >= .75) strong++; } }
      if (!got || (!strong && got < 2)) continue;
      var e = idx[ei], mh = a.m ? Object.keys(a.m).length : 0, cov = Math.min(1, mh / (e.n || 1));
      var sc = (sum / nw[0]) * (.55 + .45 * cov) * nw[1] * (got < nw[0] ? .9 : 1);
      if (sc > best) best = sc;
    }
    if (best >= .45 && !(skip && skip[ei])) out.push({ i: ei, s: best, sim: true });
  });
  out.sort(function (a, c) { return (c.s - a.s) || (idx[c.i].pop - idx[a.i].pop) || (a.i - c.i); });
  return limit ? out.slice(0, limit) : out;
}
/* alts: چند حدس (متنِ نوشته یا حدس‌های تشخیص گفتار)؛ tools: {toEn(واژه‌ی فارسی)→انگلیسی, toFa(واژه‌ی انگلیسی)→فارسی}
   خروجی: [{i, s, ex, bo, mn, all, cnt}] از بهترین؛
   ex = همه‌ی واژه‌های نامِ مدل دقیق گفته شده؛ bo = فقط نامِ برند گفته شده؛ mn = ضعیف‌ترین واژه؛ all = همه‌ی واژه‌ها دقیقاً در نام هست */
var SR_ALLB = .06;
function searchRank(idx, alts, tools, opts) {
  opts = opts || {}; tools = tools || {}; var best = {}, vars = [];
  alts.slice(0, 5).forEach(function (alt, ai) {
    var toks = srToks(alt); if (!toks.length) return;
    var w = 1 - .04 * ai;
    vars.push({ toks: toks, w8: w });
    srSplits(toks).forEach(function (sp) { vars.push({ toks: sp, w8: w * .97 }); });
    toks.forEach(function (t, k) { var al = SR_ALIAS[t]; if (al) vars.push({ toks: toks.slice(0, k).concat(al, toks.slice(k + 1)), w8: w * .97 }); });
    if (toks.length >= 2) toks.forEach(function (t, k) { if (k > 0 && SR_PNUM2[t]) vars.push({ toks: toks.slice(0, k).concat([SR_PNUM2[t]], toks.slice(k + 1)), w8: w * .97, hk: toks[k - 1] !== 'و' && !SR_NUM[toks[k - 1]] && !SR_UNIT[toks[k + 1]] ? k : -1 }); });      // «شنل پنج» = «شنل 5»؛ عددِ این نسخه «سخت» است (در نامِ عطر باید باشد) تا «فقط برند» جوابِ قطعی حساب نشود
  });
  var anyNh = false, bestU = {}, usedPen = false;      // anyNh: دست‌کم یک عطر شماره‌ی گفته‌شده را در نامش دارد؛ فقط آن وقت عطرِ بی‌شماره جریمه می‌شود
  var pfx = opts.prefixLast !== false;      // تایپ: شروعِ واژه هم حساب می‌شود؛ گفتار: نه (واژه‌ی نیمه‌کاره یعنی تشخیص اشتباه)
  /* allowMiss: در دور دوم، یک واژه‌ی بی‌جواب («چنده»، «ارزان»، «تابستانی») نادیده گرفته می‌شود و امتیازِ عطر کم می‌شود */
  function run(vr, allowMiss) {
    var toks = vr.toks, w8 = vr.w8;
    var hk = vr.hk === undefined ? -1 : vr.hk, hardN = toks.filter(function (t, j) { return !srSoft(t) || j === hk; }).length, anyNum = toks.some(srNum);
    if (!anyNum && toks.every(function (t) { return SR_STOP[t]; })) return;      // فقط «عطر» یا «ادکلن مردانه»: چیزی برای جستجو نیست
    if (allowMiss && hardN < 2) return;
    var tk = toks.map(function (t, j) {
      var w = srWord(t, tools.toEn), f = !w.fa && tools.toFa ? srn(tools.toFa(t)) : '';
      return { t: t, fa: w.fa, k: w.k, e: w.e, f: f, fk: f ? fzKeyC(f) : '', last: pfx && !!opts.prefixLast && j === toks.length - 1, pfx: pfx, soft: hardN > 0 && srSoft(t) && j !== hk ? 1 : 0, key: ++SRK };
    });
    var qid = ++SRK, needNum = hardN > 0 && toks.some(function (t, j) { return /^\d+$/.test(t) && (+t < 20 || +t > 250) && !SR_UNIT[toks[j + 1]] && j !== hk; });      // شماره‌ی نام (۵، ۱۹، ۲۱۲)؛ نه اندازه‌ی ۳۰ تا ۲۵۰ میل و نه عددی که «میل» دنبالش آمده
    for (var ei = 0; ei < idx.length; ei++) {
      var e = idx[ei]; if (allowMiss && best[ei]) continue;
      var sum = 0, ok = true, hit = {}, allx = true, cnt = 0, nb = 0, nbx = 0, nx = 0, mn = 9, bw = e.bw, miss = 0, dupc = 0, strong = 0, nh = 0;
      if (bw._q !== qid) { bw._q = qid; bw._v = []; }
      for (var j = 0; j < tk.length; j++) {
        var q = tk[j], mk = { m: -1 }, rm = srBest(q, e.mw, mk), re = rm < 1 ? srBest(q, e.me, null) : 0, rb = bw._v[j];
        if (rb === undefined) rb = bw._v[j] = srBest(q, bw, null);      // برند بین همه‌ی عطرهایش مشترک است؛ برای هر واژه یک بار
        var rbs = rb >= .85 ? rb * .95 : rb * .7;      // نامِ برندِ درست از شباهتِ مبهم به نامِ یک عطرِ دیگر مهم‌تر است
        var s = Math.max(rm, re * .92, rbs);
        if (s < .5) s = Math.max(s, srBest(q, e.ow, null) * .35);
        if (q.soft && s < .87) continue;      // «عطر»، «بده»، «مردانه»، «100»… فقط وقتی حساب می‌شوند که دقیق در نام باشند
        if (s < .2) {
          if (allowMiss && !miss && !q.soft) { miss = 1; continue; }
          ok = false; break;
        }
        if (mk.m >= 0) { if (hit[mk.m] !== undefined && (rm < 1 || hit[mk.m] < 1)) dupc = 1; hit[mk.m] = Math.max(hit[mk.m] || 0, rm); }      // دو واژه‌ی جستجو روی یک واژه‌ی عطر، با املای نادقیق: «ورسایس اروس» → «ورسوس»
        if (rb >= .99) nbx++;
        if (q.soft && srNum(q.t) && (rm >= .99 || re >= .99 || rb >= .99)) nh++;      // عددی که دقیق در نامِ عطر (یا برند: «Bond No. 9») هست («شنل ۵» ← «نامبر ۵»)
        if (rbs > 0 && rbs >= rm && rbs >= re * .92) nb++;
        if (rm >= .99 || rb >= .99) nx++;
        if (rm < .87 && re < .87 && rb < .87) allx = false;      // «دقیق» = نامِ مدل یا برند کامل گفته شده؛ شروعِ تایپ یا املای نزدیک دقیق نیست
        if (s >= .85) strong++;
        if (s < mn) mn = s;
        sum += s; cnt++;
      }
      if (!ok || !cnt) continue;
      if (miss && !strong) continue;      // بدون دست‌کم یک واژه‌ی مطمئن، حدس زدن بی‌معنی است
      var hn = Object.keys(hit).length, cov = hn / e.n, ex = allx && cov >= 1 && !miss && !dupc, bo = nbx === cnt;
      if (bo || (!hn && nb === cnt)) cov = 1;      // فقط نامِ برند گفته شده: همه‌ی عطرهای آن برند به یک اندازه نزدیک‌اند
      var sc0 = (sum / cnt + .4 * cov) * w8 * (miss ? .75 : 1) * (dupc ? .9 : 1), pen = needNum && !nh, sc = sc0 * (pen ? .8 : 1);      // «شنل ۵»: عطرِ بی‌شماره نباید با «فقط برند» جلوی «نامبر ۵» بنشیند
      if (needNum && nh) anyNh = true;
      var rec = { s: sc, ex: ex, bo: bo, mn: mn, all: nx === cnt && !miss ? 1 : 0, cnt: cnt, miss: miss, dupc: dupc };
      var o = best[ei]; if (!o || sc > o.s) best[ei] = rec;
      if (pen) { usedPen = true; var ou = bestU[ei]; if (!ou || sc0 > ou.s) bestU[ei] = { s: sc0, ex: ex, bo: bo, mn: mn, all: rec.all, cnt: cnt, miss: miss, dupc: dupc }; }
    }
  }
  vars.forEach(function (vr) { run(vr, false); });
  if (Object.keys(best).length < 3) vars.forEach(function (vr) { run(vr, true); });
  if (usedPen && !anyNh) Object.keys(bestU).forEach(function (k) { var o = best[k], u = bestU[k]; if (!o || u.s > o.s) best[k] = u; });      // هیچ عطری آن شماره را ندارد: جریمه معنا ندارد (اندازه یا شماره‌ی ناآشنا)
  var ALLB = opts && typeof opts.allBonus === 'number' ? opts.allBonus : SR_ALLB;      // «همه‌ی واژه‌ها دقیق» کمی بالاتر می‌نشیند، ولی املای هم‌صدای یک نامِ کوتاه‌تر هم می‌تواند جلو بیفتد
  var out = Object.keys(best).map(function (k) { var o = best[k]; return { i: +k, s: o.s, ex: o.ex, bo: o.bo, mn: o.mn, all: o.all, cnt: o.cnt, miss: o.miss, dupc: o.dupc, k: o.s + (o.all ? ALLB : 0) - (o.miss ? 5 : 0) /* نتیجه‌های «یک واژه‌شان نیامد» همیشه بعد از نتیجه‌های کامل */ }; });
  out.sort(function (a, c) {
    var d = c.k - a.k; if (d > 1e-9 || d < -1e-9) return d;
    return (c.cnt - a.cnt) || (idx[c.i].pop - idx[a.i].pop) || (idx[a.i].m.name.length - idx[c.i].m.name.length) || (a.i - c.i);
  });
  /* شبیه‌ها: اگر نتیجه‌ی کاملِ کم است، نزدیک‌ترین‌ها به املا/تلفظ هم می‌آیند (بعد از نتیجه‌های کامل و قبل از نتیجه‌های ناقص).
     opts.similar = حداکثر تعداد شبیه؛ هر کدام sim:true دارد تا صفحه بتواند جدا نشانش دهد */
  var want = opts && typeof opts.similar === 'number' ? opts.similar : 0;
  if (want > 0) {
    var good = 0; out.forEach(function (o) { if (!o.miss && o.k >= 1) good++; });
    if (good < (opts.simBelow || 8)) {
      var skip = {}; out.forEach(function (o) { skip[o.i] = 1; });
      var sims = searchSimilar(idx, alts, tools, skip, want);
      if (sims.length) {
        var full = [], part = []; out.forEach(function (o) { (o.miss ? part : full).push(o); });
        var sm = sims.map(function (x) { return { i: x.i, s: x.s, ex: false, bo: false, mn: x.s, all: 0, cnt: 0, miss: 0, dupc: 0, k: x.s, sim: true }; }), tail = [], a = 0, b = 0;
        while (a < part.length || b < sm.length) tail.push(b >= sm.length || (a < part.length && part[a].s >= sm[b].s) ? part[a++] : sm[b++]);      // ناقص‌ها و شبیه‌ها به ترتیبِ امتیازِ خودشان
        out = full.concat(tail);
      }
    }
  }
  return out;
}

root.Core = { probeShop: probeShop, fetchNews: fetchNews, newsMore: newsMore, newsFromWp: newsFromWp, newsFromRss: newsFromRss, newsPickImg: newsPickImg, newsExcerpt: newsExcerpt, NEWS_SRC: NEWS_SRC, liveSearch: liveSearch, liveTerms: liveTerms, liveHit: liveHit, wooLivePrice: wooLivePrice, searchIndex: searchIndex, searchRank: searchRank, searchSimilar: searchSimilar, simWord: simWord, simFold: simFold, srn: srn, fzKey: fzKey, explainTitle: explainTitle, useSz: useSz, sizeFromPage: sizeFromPage, nextDataCards: nextDataCards, RAWC: RAWC, stripPriceTail: stripPriceTail, marketStats: marketStats, marketView: marketView, histNew: histNew, histFix: histFix, histSnap: histSnap, histReport: histReport, purgeStored: purgeStored, setBlock: setBlock, REJ: REJ, vetReason: vetReason, reconcile: reconcile, CLEANSE: CLEANSE, cleanseText: cleanseText, cleanBrandName: cleanBrandName, itemUrl: itemUrl, STALE_MIN: STALE_MIN, fa2en: fa2en, en2fa: en2fa, enTokens: enTokens, titleEn: titleEn, tree: tree, brandOf: brandOf, specInfo: specInfo, enrichTitle: enrichTitle, genderOf: genderOf, nameCmp: nameCmp, CFG: CFG, newDb: newDb, dbIndex: dbIndex, ingest: ingest, ingestAsync: ingestAsync, buildList: buildList, normFa: normFa, parseTitle: parseTitle, aggregate: aggregate, SOURCES: SOURCES, extractCards: extractCards,
  wooSource: wooSource, digikalaSource: digikalaSource, htmlSource: htmlSource, letterOf: letterOf, median: median, priceFromText: priceFromText, similar: similar };
if (typeof module !== 'undefined') module.exports = root.Core;
})(typeof window !== 'undefined' ? window : globalThis);
