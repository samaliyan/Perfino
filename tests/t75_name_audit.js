// بازبینیِ تمیزیِ نامِ عطرها روی عنوان‌های واقعیِ چهار فروشگاه (tests/data/titles.txt، از گزارش‌های خودِ برنامه)
// و آزمونِ ترمیمِ عنوانِ خراب‌شده‌ی هایلند. اجرا: node tests/t75_name_audit.js
global.window = global; global.DOMParser = undefined;
var fs = require('fs'), path = require('path');
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var ok = 0, bad = 0;
function eq(a, b, m) { var A = JSON.stringify(a), B = JSON.stringify(b); if (A === B) ok++; else { bad++; console.log('FAIL', m, '\n  got ', A, '\n  want', B); } }
function chk(c, m, i) { if (c) ok++; else { bad++; console.log('FAIL', m, i === undefined ? '' : i); } }

// ۱) هوگو باس ≠ هوگو بوس: املای نزدیکِ برند در نامِ عطر نمی‌ماند
(function () {
  var db = C.newDb(), ix = C.dbIndex(db);
  C.ingest(db, ix, 'liliome', [
    { id: 1, t: 'عطر ادکلن هوگو باس باتلد پارفوم Hugo Boss Bottled Parfum 100 میل مردانه', price: 5e6 },
    { id: 2, t: 'عطر ادکلن هوگو باس رد-قرمز Hugo Boss Red 200ml مردانه ادوتویلت', price: 5e6 },
    { id: 3, t: 'عطر ادکلن هوگو بوس اینفینیت 100 میل', price: 5e6 },
    { id: 4, t: 'عطر ادکلن پاکو رابانا وان میلیون 100 میل مردانه', price: 5e6 },
    { id: 5, t: 'عطر ادکلن رالف لوران پولو بلک 125 میل مردانه', price: 5e6 },
    { id: 6, t: 'عطر ادکلن کالوین کلاین اترنیتی 100 میل مردانه', price: 5e6 },
    { id: 7, t: 'عطر ادکلن ایسی میاک ل یو 125 میل مردانه', price: 5e6 }], true);
  var T = C.tree(C.buildList(db, ['liliome'], {}, 0), 'fa', db.wd), names = [];
  T.forEach(function (b) { b.models.forEach(function (m) { names.push(b.name + ' :: ' + m.name); }); });
  var all = names.join('\n');
  chk(!/باس|رابانا|لوران|کلاین|میاک /.test(all.replace(/ایسی میاکی/g, '')), 'brand spelling variants are not left in model names', all);
  chk(T.some(function (b) { return b.name === 'هوگو بوس' && b.models.length === 3; }), 'Hugo Boss has its 3 models: ' + all);
  chk(T.every(function (b) { return /[A-Za-z]/.test(b.en || 'x') || b.id === 'other' || !b.en; }), 'every brand has a Latin name for the background');
})();
// ۱ب) نامِ خودِ عطر که شبیه نامِ برند است، گم نمی‌شود
(function () {
  var db = C.newDb(), ix = C.dbIndex(db);
  C.ingest(db, ix, 'liliome', [
    { id: 1, t: 'عطر ادکلن ولنتینو ولنتینا بلاش 80 میل زنانه', price: 5e6 },
    { id: 2, t: 'ادو تویلت مردانه مرسدس بنز مدل Man با رایحه تلخ حجم 100 میلی لیتر', price: 5e6 },
    { id: 3, t: 'عطر ادکلن جیمی چو من 100 میل مردانه', price: 5e6 }], true);
  var T = C.tree(C.buildList(db, ['liliome'], {}, 0), 'fa', db.wd), names = [];
  T.forEach(function (b) { b.models.forEach(function (m) { names.push(b.name + ' :: ' + m.name); }); });
  chk(names.indexOf('والنتینو :: ولنتینا بلاش') >= 0, 'Valentina is the perfume, not the brand', names);
  chk(names.some(function (n) { return /^مرسدس بنز :: /.test(n) && n.length > 14; }), 'Mercedes Benz Man keeps its name', names);
})();
// ۲) یک عطر که اسمش همان نامِ برند است، با املای استانداردِ برند نشان داده می‌شود
(function () {
  var db = C.newDb(), ix = C.dbIndex(db);
  C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن هوگو باس 100 میل مردانه', price: 5e6 }, { id: 2, t: 'عطر ادکلن هوگو باس باتلد 100 میل مردانه', price: 5e6 }], true);
  var T = C.tree(C.buildList(db, ['liliome'], {}, 0), 'fa', db.wd), n = [];
  T.forEach(function (b) { b.models.forEach(function (m) { n.push(m.name); }); });
  chk(n.indexOf('هوگو باس') < 0, 'self-named perfume uses the standard brand spelling', n);
})();
// ۳) عنوانِ فارسیِ خراب‌شده (ر/ژ ← غ/ق) با نامِ لاتینِ درستِ همان کارت ترمیم می‌شود؛ کالای قدیمیِ ثبت‌شده هم یک‌بار ترمیم می‌شود
(function () {
  var db = C.newDb(), ix = C.dbIndex(db), bad1 = 'ادوپرفیوم مردانه نوید محمدزاده سواق 100 میل', en = 'NAVID MOHAMMADZADEH Soir For Him Edp 100ml M';
  C.ingest(db, ix, 'hiland', [{ id: 'u1', t: bad1, price: 4e6 }], true);      // نسخه‌ی قدیمی: نامِ لاتین نبود
  var L0 = C.buildList(db, ['hiland'], {}, 0);
  chk(L0.length === 1 && /سواق/.test(L0[0].name), 'old data keeps the broken name until a card with the English name arrives', L0.map(function (g) { return g.name; }));
  C.ingest(db, ix, 'hiland', [{ id: 'u1', t: bad1, e: en, hd: 1, price: 4e6 }], true);
  var L1 = C.buildList(db, ['hiland'], {}, 0);
  chk(L1.length === 1 && !/[غق]/.test(L1[0].name) && /soir/i.test(L1[0].key.join(' ')), 'known item is re-read once with the English name', L1.map(function (g) { return g.name + '/' + g.key.join(' '); }));
  chk(db.it.hiland.u1[5] === 1, 'the item is marked as repaired');
  C.ingest(db, ix, 'hiland', [{ id: 'u1', t: bad1, e: en, hd: 1, price: 4.2e6 }], true);
  var L2 = C.buildList(db, ['hiland'], {}, 0);
  chk(L2.length === 1 && L2[0].sizes[0].price === 4200000 && db.it.hiland.u1[5] === 1, 'next update only changes the price', L2.map(function (g) { return JSON.stringify(g.sizes); }));
  // توضیحِ لاتین بدون واحد («... Edp 100») و حرفِ جنسیتِ آخر: کلید عددِ اضافه ندارد و نامِ انگلیسی «M/W» ندارد
  var db3 = C.newDb(), ix3 = C.dbIndex(db3);
  C.ingest(db3, ix3, 'hiland', [{ id: 'a', t: bad1, e: 'NAVID MOHAMMADZADEH Soir For Him Edp 100', hd: 1, price: 4e6 }, { id: 'b', t: 'ادوپرفیوم زنانه مارکو سروسی لیدی اینتنس قابل شارژ 90 میل', e: 'MARCO SERUSSI The Lady Intense Edp 90ml W', hd: 1, price: 4e6 }], true);
  var L3 = C.buildList(db3, ['hiland'], {}, 0);
  chk(L3.every(function (g) { return !/\b(100|90)\b/.test(g.key.join(' ')); }), 'no stray size number in the repaired key', L3.map(function (g) { return g.key.join(' '); }));
  var TE = C.tree(L3, 'en', db3.wd), en = []; TE.forEach(function (b) { b.models.forEach(function (m) { en.push(m.name); }); });
  chk(en.every(function (n) { return !/ [MW]$/.test(n) && !/\d/.test(n); }), 'English names have no gender letter or size', en);
  // شناسه‌ی هایلند که «غ/ق» در واژه‌ی درست دارد ولی نامِ لاتین ندارد (ووکامرس و دیجی‌کالا): دست نمی‌خورد
  var db2 = C.newDb(), ix2 = C.dbIndex(db2);
  C.ingest(db2, ix2, 'liliome', [{ id: 1, t: 'عطر ادکلن گرلن شالیمار قابل شارژ 100 میل زنانه', e: 'guerlain shalimar', price: 5e6 }], true);
  chk(!db2.it.liliome['1'][5], 'a site without the English description field is never "repaired"');
})();
// ۴) تمیزیِ نامِ مدل‌ها روی عنوان‌های واقعیِ چهار فروشگاه
(function () {
  var lines = fs.readFileSync(path.join(__dirname, 'data', 'titles.txt'), 'utf8').split('\n').filter(Boolean), by = {};
  lines.forEach(function (l) { var i = l.indexOf('|'), s = l.slice(0, i), t = l.slice(i + 1); if (s === 'hiland' && /[غق]/.test(t)) return; (by[s] = by[s] || []).push({ id: s + (by[s] ? by[s].length : 0), t: t, price: 6e6 }); });
  var db = C.newDb(), ix = C.dbIndex(db), ids = Object.keys(by);
  ids.forEach(function (s) { C.ingest(db, ix, s, by[s], true); });
  var T = C.tree(C.buildList(db, ids, {}, 0), 'fa', db.wd), models = 0, junkNames = [], leaks = [], latin = 0, dupw = [];
  T.forEach(function (b) {
    var bt = b.name.split(' ');
    b.models.forEach(function (m) {
      models++;
      var w = m.name.split(' ');
      if (/[A-Za-z]/.test(m.name)) latin++;
      if (/^(عطر|ادکلن|ادو|ادوپرفیوم|ادوتویلت|مردانه|زنانه|یونیسکس|اورجینال|اصل|قیمت|تستر)$/.test(w[0])) junkNames.push(b.name + ' :: ' + m.name);
      for (var i = 1; i < w.length; i++) if (w[i] === w[i - 1] && b.id !== 'other') { dupw.push(b.name + ' :: ' + m.name); break; }
      if (b.id !== 'other' && bt.length >= 2 && w.length > 1 && m.name !== b.name) {      // اولین واژه‌ی نامِ عطر شبیهِ اولین واژه‌ی نامِ برند (املای دیگرِ برند)
        var sk = function (x) { return C.fzKey(x); };
        if (sk(w[0]) === sk(bt[0]) && sk(w[1]) === sk(bt[1])) leaks.push(b.name + ' :: ' + m.name);
      }
    });
  });
  console.log('models', models, '| latin', latin, '| junk', junkNames.length, '| brand-leak', leaks.length, '| dup-word', dupw.length);
  chk(models > 5000, 'corpus builds a real tree', models);
  chk(junkNames.length === 0, 'no model name starts with a generic word', junkNames.slice(0, 8));
  chk(leaks.length === 0, 'no model name starts with a spelling of its own brand', leaks.slice(0, 8));
  chk(dupw.length <= 2, 'no repeated word in a name', dupw.slice(0, 8));
  chk(latin <= 2, 'Persian list has no Latin letters in names: ' + latin);
})();
console.log('PASS', ok, 'FAIL', bad); process.exit(bad ? 1 : 0);
