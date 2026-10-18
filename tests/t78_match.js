// یکی‌شدنِ آگهیِ یک عطر در چند سایت وقتی نامش کمی فرق می‌کند (آکوا / Aqva، تو بی / توبی، حلوا / هالوا ...)
// و محافظ‌ها: دو عطرِ واقعاً جدا نباید یکی شوند. اجرا: node tests/t78_match.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var ok = 0, bad = 0;
function chk(c, m, i) { if (c) ok++; else { bad++; console.log('FAIL', m, i === undefined ? '' : i); } }
function build(S) {      // S = { سایت: [[عنوان، قیمت]] }
  var db = C.newDb(), ix = C.dbIndex(db);
  Object.keys(S).forEach(function (src) { C.ingest(db, ix, src, S[src].map(function (a, i) { return { id: i + 1, t: a[0], price: a[1] }; }), true); });
  C.reconcile(db, ix);
  var T = C.tree(C.buildList(db, Object.keys(S), {}, 0), 'fa', db.wd), V = [];
  T.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { var s = {}; v.sizes.forEach(function (z) { z.srcs.forEach(function (x) { s[x.s] = 1; }); }); V.push({ n: b.name + ' :: ' + m.name, s: Object.keys(s).sort().join('+') }); }); }); });
  return V;
}
function find(V, re) { return V.filter(function (v) { return re.test(v.n); }); }
function one(V, re, want, msg) { var f = find(V, re); chk(f.length === 1 && f[0].s === want, msg, JSON.stringify(f)); }

// ۱) نمونه‌ی خودِ کاربر: بولگاری آکوا پور هوم (دیجی‌کالا لاتین، لیلیوم و هایلند فارسی)
one(build({
  digikala: [['ادو تویلت مردانه بولگاری مدل Aqva Pour Homme حجم 100 میلی لیتر', 4.0e6]],
  liliome: [['عطر ادکلن بولگاری آکوا پور هوم 100 میل', 4.1e6]],
  hiland: [['ادوتویلت مردانه بولگاری آکوا پور هوم 100 میل', 4.2e6]]
}), /آکوا|اکوا|aqva/i, 'digikala+hiland+liliome', 'Bvlgari Aqva Pour Homme from 3 shops is one product');
// ۲) فاصله‌گذاری و املای فارسی (لیلیوم بدون غلظت و جنسیت)
var V2 = build({
  liliome: [['عطر ادکلن پلیس تو بی کینگ 125 میل', 2e6], ['عطر ادکلن اوجار حلوا کیس ادو پرفیوم 100 میل', 5e6], ['عطر ادکلن تامین پاتیالا 100 میل', 9e6]],
  hiland: [['ادوتویلت مردانه پلیس توبی کینگ 125 میل', 2.1e6], ['ادوپرفیوم اوجار هالوا کیس 100 میل', 5.1e6], ['اکستریت د پرفیوم تمین پاتیالا 100 میل', 9.2e6]]
});
one(V2, /کینگ/, 'hiland+liliome', 'To Be The King: "تو بی" = "توبی"');
one(V2, /کیس/, 'hiland+liliome', 'Ojar Halva Kiss: حلوا = هالوا');
one(V2, /پاتیالا/, 'hiland+liliome', 'Tamin Patiala: تامین = تمین');
// ۳) محافظ: اگر قیمت‌ها خیلی فرق دارند، املای متفاوت به‌تنهایی کافی نیست
var V3 = build({ liliome: [['عطر ادکلن پلیس تو بی کینگ 125 میل', 2e6]], hiland: [['ادوتویلت مردانه پلیس توبی کینگ 125 میل', 4e6]] });
chk(find(V3, /کینگ/).length === 2, 'different spelling AND far prices stay apart', JSON.stringify(V3));
// ۴) محافظ: عطرهای جدا یکی نمی‌شوند
var V4 = build({
  liliome: [['عطر ادکلن بودیسیا د ویکتوریوس دومینانت 100 میل', 5e6], ['عطر ادکلن زرجوف تورینو 22 100 میل', 5e6], ['عطر ادکلن مابوسین او د ایورس 100 میل', 5e6]],
  hiland: [['ادوپرفیوم بودسیا د ویکتوریوس الماس 100 میل', 5e6], ['ادوپرفیوم زرجوف تورینو 24 100 میل', 5e6], ['MAUBOUSSIN Rose Pour Elle Edp 100ml W', 5e6]]
});
chk(find(V4, /دومینانت|دایموند|الماس/).length === 2, 'Diamond and Dominant are not merged', JSON.stringify(find(V4, /دومینانت|دایموند|الماس/)));
chk(find(V4, /تورینو/).every(function (v) { return v.s.indexOf('+') < 0; }), 'Torino 22 and 24 are not merged', JSON.stringify(find(V4, /تورینو/)));
chk(find(V4, /مابوسین|Mauboussin/i).every(function (v) { return v.s.indexOf('+') < 0; }), 'Mauboussin Eau d\'Hiver and Rose are not merged', JSON.stringify(find(V4, /مابوسین|Mauboussin/i)));
// ۵) محافظ‌های بازبینی: واژه‌ی کوتاهِ آخر (عود، های، لئو) در واژه‌ی قبلی گم نمی‌شود؛ Love ≠ لولا؛ شماره‌ی عطر با اندازه قاطی نمی‌شود
[[{ liliome: [['عطر ادکلن هوگو باس باتلد 100 میل', 4.0e6]], hiland: [['ادوپرفیوم مردانه هوگو باس باتلد عود 100 میل', 4.2e6]] }, /باتلد/, 'Bottled vs Bottled Oud'],
 [{ safir: [['ادو تویلت مردانه دیزل اونلی د بریو 125 میلی لیتر', 3.0e6]], hiland: [['ادوتویلت مردانه دیزل اونلی د بریو های 125 میل', 3.1e6]] }, /بریو/, 'Only The Brave vs High'],
 [{ safir: [['ادو تویلت زنانه بولگاری امنیا کریستال 65 میلی لیتر', 3.0e6]], hiland: [['ادوتویلت زنانه بولگاری امنیا کریستال لیو 65 میل', 3.1e6]] }, /امنیا/, "Omnia Crystalline vs L'Eau"],
 [{ liliome: [['عطر ادکلن مارک جیکوبز لولا 100 میل', 4.0e6]], digikala: [['ادو پرفیوم زنانه مارک جیکوبز مدل Love حجم 100 میلی لیتر', 4.1e6]] }, /لولا|لاو|love/i, 'Lola vs Love'],
 [{ hiland: [[ 'ادوپرفیوم زرجوف تورینو 22 100 میل', 9e6, 'Xerjoff Torino 22'], ['ادوپرفیوم زرجوف تورینو 21 100 میل', 9e6, 'Xerjoff Torino 21']] }, /تورینو|torino/i, 'Torino 22 vs 21 (Hiland English name)']
].forEach(function (c) {
  var db = C.newDb(), ix = C.dbIndex(db);
  Object.keys(c[0]).forEach(function (src) { C.ingest(db, ix, src, c[0][src].map(function (a, i) { return { id: i + 1, t: a[0], price: a[1], e: a[2] || '', hd: a[2] ? 1 : 0 }; }), true); });
  C.reconcile(db, ix);
  var T = C.tree(C.buildList(db, Object.keys(c[0]), {}, 0), 'fa', db.wd), V = [];
  T.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { if (c[1].test(b.name + ' ' + m.name)) V.push(m.name); }); }); });
  chk(V.length === 2, c[2] + ' stay two perfumes', JSON.stringify(V));
});
// ۶) واژه‌ای مثل constructor برنامه را نمی‌اندازد؛ ch = ش (Cherie = شری)
try { build({ liliome: [['عطر ادکلن دیور constructor 100 میل', 5e6]], hiland: [['ادوپرفیوم مردانه دیور konstruktor 100 میل', 5e6]] }); chk(true); } catch (e) { chk(false, 'constructor word crashes matching', e && e.message); }
one(build({ digikala: [['ادو پرفیوم زنانه رولینگ مدل Cherie Blossom حجم 100 میلی لیتر', 3e6]], liliome: [['عطر ادکلن رولینگ شری بلاسم 100 میل', 3.1e6]] }), /رولینگ/, 'digikala+liliome', 'Cherie = شری');
console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
