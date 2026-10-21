// مرحله‌ی پاک‌سازیِ داده (۱.۴۹): نامِ تکراری، واژه‌ی ربط، فاصله‌گذاری، تکرارِ نامِ لاتین، واژه‌نامه‌ی یادگرفته‌شده
// و محافظ‌ها (دو عطرِ جدا هرگز یکی نشوند). اجرا: node tests/t81_cleanse.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var ok = 0, bad = 0;
function chk(c, m, i) { if (c) ok++; else { bad++; console.log('FAIL', m, i === undefined ? '' : i); } }
function ingestAll(S) {
  var db = C.newDb(), ix = C.dbIndex(db);
  Object.keys(S).forEach(function (src) { C.ingest(db, ix, src, S[src].map(function (a, i) { return { id: i + 1, t: a[0], price: a[1] }; }), true); });
  C.reconcile(db, ix);
  return db;
}
function build(S) {      // S = { سایت: [[عنوان، قیمت]] } → ردیف‌های نهایی (برند :: مدل، سایت‌ها)
  var db = ingestAll(S);
  var T = C.tree(C.buildList(db, Object.keys(S), {}, 0), 'fa', db.wd), V = [];
  T.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { var s = {}; v.sizes.forEach(function (z) { z.srcs.forEach(function (x) { s[x.s] = 1; }); }); V.push({ n: b.name + ' :: ' + m.name, g: v.gn, c: v.conc, s: Object.keys(s).sort().join('+') }); }); }); });
  return V;
}
function find(V, re) { return V.filter(function (v) { return re.test(v.n); }); }
function one(V, re, want, msg) { var f = find(V, re); chk(f.length === 1 && f[0].s === want, msg, JSON.stringify(f)); }
function key(t) { var p = C.parseTitle(t); return p ? p.key.join(' ') : null; }

// ۱) شکایتِ کاربر: «بلو سداکشن» آنتونیو باندراس از لیلیوم و دیجی‌کالا دو ردیف بود؛ قیمتِ دو سایت خیلی فرق دارد ولی عطر یکی است
var V1 = build({
  liliome: [['عطر ادکلن آنتونیو باندراس بلو سداکشن مردانه | Antonio Banderas Blue Seduction 100 میل ادوتویلت', 2.0e6]],
  digikala: [['ادو تویلت مردانه آنتونیو باندراس مدل Blue Seduction حجم 100 میلی لیتر', 3.4e6]]
});
one(V1, /سداکشن|seduction/i, 'digikala+liliome', 'Blue Seduction from two shops (prices 70% apart) is one row');
// ۲) فاصله‌گذاری («بلوسداکشن») و واژه‌ی ربط («کینگ آف» / «کینگ آو»)
var V2 = build({
  liliome: [['عطر ادکلن آنتونیو باندراس بلو سداکشن ادو تویلت مردانه 100 میل', 2.0e6], ['عطر ادکلن آنتونیو باندراس کینگ آف سداکشن ادو تویلت مردانه 100 میل', 2.2e6]],
  hiland: [['ادوتویلت مردانه آنتونیو باندراس بلوسداکشن 100 میل', 2.1e6], ['ادوتویلت مردانه آنتونیو باندراس کینگ آو سداکشن 100 میل', 2.3e6]]
});
one(V2, /بلو ?سداکشن/, 'hiland+liliome', 'بلوسداکشن = بلو سداکشن');
one(V2, /کینگ/, 'hiland+liliome', 'King of Seduction: آف = آو');
// ۳) تکرارِ نام در عنوان (فارسی + همان نام با خطِ دیگر یا املای دیگر) پاک می‌شود
chk(key('ادوپرفیوم زنانه آنتونیو باندراس کویین او سداکشن لایولی میوز کوئین اف سداکشن 80 میل') === key('ادوپرفیوم زنانه آنتونیو باندراس کویین او سداکشن لایولی میوز 80 میل'), 'repeated name phrase is cut', key('ادوپرفیوم زنانه آنتونیو باندراس کویین او سداکشن لایولی میوز کوئین اف سداکشن 80 میل'));
chk(((key('ادوتویلت مردانه زیر آیکون د ایکون 100 میل') || '').match(/ایکون/g) || []).length === 1, 'آیکون د ایکون → one word', key('ادوتویلت مردانه زیر آیکون د ایکون 100 میل'));
// ۴) محافظ‌های واژه‌ی تکراری: چیزی که نامِ واقعی است نباید پاک شود
chk(/ولنتینا|والنتینا/.test(key('عطر ادکلن ولنتینو ولنتینا بلاش ادو پرفیوم زنانه 80 میل') || ''), 'Valentina (perfume) is not the brand Valentino repeated');
var V4 = build({ liliome: [['عطر ادکلن شنل بلو د شنل ادو پرفیوم مردانه 100 میل', 9e6]], hiland: [['ادوپرفیوم مردانه شانل بلو دو شانل 100 میل', 9.2e6]], digikala: [['ادو پرفیوم مردانه شنل مدل Bleu de Chanel حجم 100 میلی لیتر', 9.5e6]] });
one(V4, /بلو|bleu/i, 'digikala+hiland+liliome', 'Bleu de Chanel in three spellings is one row');
chk(/دی/.test(key('عطر ادکلن جیمی چو لاولی دی ادو پرفیوم زنانه 100 میل') || ''), 'Lovely Day keeps «دی»', key('عطر ادکلن جیمی چو لاولی دی ادو پرفیوم زنانه 100 میل'));
// ۵) محافظ: عطرهای جدا یکی نمی‌شوند، حتی با قیمتِ یکسان
var G = build({
  liliome: [['عطر ادکلن آیس برگ فلوید من | Iceberg Fluid Man 100 میل ادوتویلت', 3e6], ['عطر ادکلن آیس برگ افیوژن من | Iceberg Effusion Man 75 میل ادوتویلت', 3e6],
    ['عطر ادکلن ورساچه اِروس زنانه ادو تویلت | Versace Eros Pour Femme EDT 100 میل', 5e6], ['عطر ادکلن لطافه میار | Lattafa Mayar 100 میل یونیسکس ادوپرفیوم', 2e6],
    ['عطر ادکلن اچ اف سی لاور من | HFC Lover Man 75 میل ادوپرفیوم', 6e6], ['عطر ادکلن ژان پل گوتیه اسکندل | Jean Paul Gaultier Scandal 80 میل زنانه ادوپرفیوم', 6e6],
    ['عطر ادکلن جیوانچی ایرسیستیبل | Givenchy Irresistible 80 میل زنانه ادوپرفیوم', 6e6]],
  hiland: [['اکستریت د پرفیوم زنانه کورنیش دوق چری 125 میل', 9e6], ['اکستریت د پرفیوم زنانه کورنیش دوق کارا 110میل', 9e6],
    ['ادوتویلت مردانه داویدف کول واتر 200 میل', 4e6], ['ادوتویلت مردانه داویدف کول واتر ویو 125 میل', 4e6],
    ['ادوتویلت زنانه ورساچه ورسوس 100 میل', 5e6], ['ادوتویلت مردانه بیژن من 75 میل', 3e6], ['ادو تویلت مردانه نیومن 80 میل', 3e6],
    ['ادوپرفیوم زنانه ژیوانشی وری ایرسیستیبل 75 میل', 6e6]],
  digikala: [['ادوپرفیوم مردانه لطافه مدل ماهر حجم 100میل لیتر', 2e6], ['ادو پرفیوم مردانه هاوک مدل silver حجم 75 میلی لیتر', 6e6]]
});
chk(find(G, /فلوید|افیوژن/).length === 2, 'Iceberg Fluid ≠ Effusion (misaligned word list)', JSON.stringify(find(G, /فلوید|افیوژن/)));
chk(find(G, /چری|کارا/).length === 2, 'Cherry ≠ Kara', JSON.stringify(find(G, /چری|کارا/)));
chk(find(G, /کول واتر/).length === 2, 'Cool Water ≠ Cool Water Wave', JSON.stringify(find(G, /کول واتر/)));
chk(find(G, /اروس|ورسوس/).length === 2, 'Eros ≠ Versus', JSON.stringify(find(G, /اروس|ورسوس/)));
chk(find(G, /میار|ماهر/).length === 2, 'Mayar ≠ Maahir', JSON.stringify(find(G, /میار|ماهر/)));
chk(find(G, /لاور|هاوک/).length === 2, 'HFC Lover ≠ Hawk Silver', JSON.stringify(find(G, /لاور|هاوک/)));
chk(find(G, /بیژن|نیومن/).length === 2, 'Bijan Man ≠ Newman', JSON.stringify(find(G, /بیژن|نیومن/)));
chk(find(G, /ایرسیستیبل/).length === 2, 'Irresistible ≠ Very Irresistible', JSON.stringify(find(G, /ایرسیستیبل/)));
// ۶) واژه‌نامه: جفتِ جابه‌جا (نامِ دوکلمه‌ایِ فارسی و یک‌کلمه‌ایِ لاتین) یاد گرفته نمی‌شود؛ جفتِ درست یاد گرفته می‌شود
var db6 = ingestAll({ liliome: [['عطر ادکلن آیس برگ فلوید من | Iceberg Fluid Man 100 میل ادوتویلت', 3e6], ['عطر ادکلن ورساچه اروس | Versace Eros 100 میل مردانه ادوتویلت', 5e6]] });
chk(!(db6.wd && db6.wd['برگ']), 'misaligned pair برگ→fluid is not learned', JSON.stringify(db6.wd));
chk(db6.wd && db6.wd['اروس'] && db6.wd['اروس'].eros, 'aligned pair اروس→eros is learned', JSON.stringify(db6.wd));
// ۷) حافظه‌ی قدیمی: واژه‌نامه‌ای که با قاعده‌ی قبلی جفتِ غلط گرفته، در بازبینی (نسخه‌ی قاعده‌ی تازه) پاک می‌شود
var db7 = C.newDb(); db7.wd = { 'برگ': { fluid: 1 }, 'فلوید': { man: 1 }, 'اروس': { eros: 4 }, 'الکسیر': { elixir: 9, cool: 1 } }; db7.dv = 1;
C.purgeStored(db7);
chk(!db7.wd['برگ'] && !db7.wd['فلوید'] && db7.wd['اروس'].eros === 4 && db7.wd['الکسیر'].elixir === 9 && !db7.wd['الکسیر'].cool, 'old wrong dictionary pairs are pruned, right ones kept', JSON.stringify(db7.wd));
// ۸) همان سایت دو بار یک عطر را گذاشته (نام و غلظت و جنسیت یکی): یک ردیف
var V8 = build({ hiland: [['ادوتویلت مردانه ولنتینو اومو 100 میل', 4e6], ['ادوتویلت مردانه ولنتینو اومو 50 میل', 3e6], ['ادوتویلت مردانه والنتینو یومو 100 میل', 4.1e6]], liliome: [['عطر ادکلن والنتینو یومو | Valentino Uomo 100 میل مردانه ادوتویلت', 4.2e6]] });
chk(find(V8, /اومو|یومو/).length === 1, 'Valentino Uomo listed twice by one shop + another shop = one row', JSON.stringify(find(V8, /اومو|یومو/)));
// ۹) «پور هم» = «پور هوم»
var V9 = build({ liliome: [['عطر ادکلن آرماف ونتانا پور هوم مردانه | Armaf Ventana Pour Homme 100 میل ادوپرفیوم', 2e6]], hiland: [['ادوپرفیوم مردانه آرماف ونتانا پور هم 100 میل', 2.1e6]] });
one(V9, /ونتانا/, 'hiland+liliome', 'پور هم = پور هوم');
// ۱۰) یافته‌های بازبینیِ مستقل (همه باید جدا بمانند / نام نباید گم شود)
var R = build({
  liliome: [['عطر ادکلن شیسیدو زن | Shiseido Zen 100 میل زنانه ادوپرفیوم', 5e6], ['عطر ادکلن شیسیدو زن سان | Shiseido Zen Sun 100 میل زنانه ادوپرفیوم', 5e6],
    ['عطر ادکلن جورجیو آرمانی آکوا دی جیو | Giorgio Armani Acqua di Gio 100 میل مردانه ادوتویلت', 6e6], ['عطر ادکلن جورجیو آرمانی آکوا دی جیویا | Giorgio Armani Acqua di Gioia 100 میل زنانه ادوپرفیوم', 6e6]],
  digikala: [['ادو تویلت مردانه سالواتوره فراگامو مدل Uomo حجم 100 میلی لیتر', 4e6], ['ادو تویلت مردانه سالواتوره فراگامو مدل Homme حجم 100 میلی لیتر', 9e6]],
  hiland: [['ادوپرفیوم مردانه اکسودوس استرنج 100 میل', 3e6], ['ادوپرفیوم مردانه اکسودوس استارینگ 100 میل', 3.1e6]]
});
chk(find(R, /زن/).length === 2, 'Zen ≠ Zen Sun', JSON.stringify(find(R, /زن/)));
chk(find(R, /جیو/).length === 2 && find(R, /جیو$/).length === 1, 'Acqua di Gio (men) ≠ Acqua di Gioia (women), Gio row still exists', JSON.stringify(find(R, /جیو/)));
chk(find(R, /فراگامو/).length === 2, 'Ferragamo Uomo (4M) ≠ Homme (9M)', JSON.stringify(find(R, /فراگامو/)));
chk(find(R, /استرنج|استارینگ/).length === 2, 'one shop sells Strange and Staring: two products', JSON.stringify(find(R, /استرنج|استارینگ/)));
chk(/valentina/i.test(key('ادو پرفیوم زنانه والنتینو مدل Valentina حجم 80 میلی لیتر') || ''), 'Persian brand + Latin model Valentina keeps the model name', key('ادو پرفیوم زنانه والنتینو مدل Valentina حجم 80 میلی لیتر'));
chk(/valentina/i.test(key('ادو پرفیوم زنانه والنتینو مدل Valentina Blush حجم 80 میلی لیتر') || ''), 'Valentina Blush keeps Valentina', key('ادو پرفیوم زنانه والنتینو مدل Valentina Blush حجم 80 میلی لیتر'));
chk(((key('ادوپرفیوم مردانه ژک ساف اف اف 100 میل') || '').match(/اف/g) || []).length >= 1, 'Jacques Saf «اف اف» (FF) is the name, not «of»', key('ادوپرفیوم مردانه ژک ساف اف اف 100 میل'));
chk(/^آف|^اف| آف | اف /.test(' ' + (key('ادوپرفیوم آف وایت پاراگراف 100 میل') || '') + ' ') || /آف|اف/.test(key('ادوپرفیوم آف وایت پاراگراف 100 میل') || ''), 'Off-White keeps «آف»', key('ادوپرفیوم آف وایت پاراگراف 100 میل'));
var db10 = C.newDb(); db10.wd = { 'برگ': null, 'قهوه': { qahwa: 2 }, 'بلو': { black: 1, blue: 3 } }; db10.dv = 1;
var thrown = null; try { C.purgeStored(db10); } catch (e) { thrown = e; }
chk(!thrown && !('برگ' in db10.wd) && db10.wd['قهوه'] && db10.wd['قهوه'].qahwa && db10.wd['بلو'].blue && !db10.wd['بلو'].black, 'damaged dictionary entry does not crash; ق=q kept; بلو≠black pruned', JSON.stringify(db10.wd) + ' ' + thrown);
// ۱۱) یافته‌های بازبینیِ دوم
var Q = build({
  hiland: [['ادوتویلت زنانه گوچی گیلتی 75 میل', 6e6], ['ادوتویلت زنانه گوچی گیلتی او 75 میل', 5.5e6], ['ادوپرفیوم مردانه اکسودوس استرنج 100 میل', 3e6], ['ادوپرفیوم زنانه والنتینو والنتینا پینک 80 میل', 7e6], ['ادوپرفیوم زنانه کارولینا هررا کارولینا هرر گود گرل 80 میل', 8e6]],
  digikala: [['ادو پرفیوم مردانه اکسودوس مدل Strange حجم 100 میلی لیتر', 3.3e6], ['ادو پرفیوم زنانه والنتینو مدل Valentina Pink حجم 80 میلی لیتر', 7.2e6]],
  liliome: [['عطر ادکلن کارولینا هررا گود گرل ادو پرفیوم زنانه 80 میل', 8.1e6]]
});
chk(find(Q, /گیلتی/).length === 2, 'Guilty ≠ Guilty Eau', JSON.stringify(find(Q, /گیلتی/)));
one(Q, /استرنج|سترانگ|strange/i, 'digikala+hiland', 'Exodus «استرنج» = Strange across shops');
one(Q, /پینک|pink/i, 'digikala+hiland', 'Valentina Pink: Persian and Latin listings are one row');
chk(find(Q, /والنتینا|valentina/i).length === 1, 'Persian-only «والنتینو والنتینا پینک» keeps Valentina in the name', JSON.stringify(find(Q, /والنتینو/)));
one(Q, /گود گرل/, 'hiland+liliome', 'misspelled repeated brand «هررا هرر» is removed; matches Good Girl');
chk(/دو سون/.test(C.parseTitle('ادوتویلت زنانه دو سون دیپتیک 100 میل').name || ''), 'Diptyque «دو سون» (Do Son) keeps «دو»', C.parseTitle('ادوتویلت زنانه دو سون دیپتیک 100 میل').name);
// ۱۲) یافته‌های بازبینیِ سوم: غلطِ املاییِ برند بعد از خودِ برند پاک می‌شود، ولی نامِ شبیهِ برند نه
var Z = build({ hiland: [['ادوپرفیوم سالوادور فرگامو توسکان سول وندمیا 75 میل', 5e6], ['ادوپرفیوم مزون فرانسیس کورکجان کرکجان باکارات رژ 540 70 میل', 9e6]], liliome: [['عطر ادکلن مزون فرانسیس کورکجان باکارات رژ 540 ادو پرفیوم یونیسکس 70 میل', 9.3e6]] });
chk(find(Z, /توسکان/).length === 1 && !/فرگامو/.test(find(Z, /توسکان/)[0].n.split(' :: ')[1]), 'misspelled brand remainder «فرگامو» is not in the perfume name', JSON.stringify(find(Z, /توسکان/)));
one(Z, /باکارات/, 'hiland+liliome', '«کورکجان کرکجان» (brand + misspelled repeat) still matches Baccarat Rouge 540');
// ۱۳) بازبینیِ چهارم
chk(!/^(دو|پغفم|پرفیوم)/.test(C.parseTitle('اکستریت دو پغفم تیزیانا ترنزی دراکو 100 میل').name || '') && !/^دو/.test(C.parseTitle('دو پرفیوم ژیل کانتوئل وانیلا 100 میل').name || ''), '«دو پرفیوم» / «دو پغفم» is concentration, not name', [C.parseTitle('اکستریت دو پغفم تیزیانا ترنزی دراکو 100 میل').name, C.parseTitle('دو پرفیوم ژیل کانتوئل وانیلا 100 میل').name]);
var F = build({ hiland: [['ادوتویلت مردانه سالواتور فراگامو اف بای فرگامو پورهوم 100 میل', 4e6]] });
chk(find(F, /بای/).length === 1 && /فرگامو/.test(find(F, /بای/)[0].n.split(' :: ')[1]), '«F by Ferragamo» keeps «فرگامو» inside the name', JSON.stringify(F));
// ۱۴) شکایتِ کاربر: دو برندِ «پلیس» و «پلیس» در نامِ همه‌ی عطرها (برندِ دسته‌بندیِ سایت با املاهای مختلف، نامِ فارسیِ برند که واژه‌ی رایج است، نیمه‌ی لاتینِ تکراری)
function buildH(S) {
  var db = C.newDb(), ix = C.dbIndex(db);
  Object.keys(S).forEach(function (src) { C.ingest(db, ix, src, S[src].map(function (a, i) { return { id: i + 1, t: a[0], price: a[1], b: a[2] || [] }; }), true); });
  C.reconcile(db, ix);
  return C.tree(C.buildList(db, Object.keys(S), {}, 0), 'fa', db.wd);
}
var PT = buildH({
  liliome: [['عطر ادکلن پلیس تو بی بد گای | Police To Be Bad Guy 125 میل مردانه ادوتویلت', 2e6, ['پلیس']], ['عطر ادکلن پلیس آیکون گلد-طلایی | Police Icon Gold 125 میل مردانه ادوپرفیوم', 3e6, ['پلیس Police']]],
  digikala: [['ادو تویلت مردانه پلیس مدل To Be Bad Guy حجم 125 میلی لیتر', 2.2e6, ['پلیس']], ['ادو پرفیوم مردانه پلیس مدل Icon Gold حجم 125 میلی لیتر', 3.1e6, ['Police']]],
  hiland: [['ادوتویلت مردانه پلیس توبی بد گای 125 میل', 2.1e6]], safir: [['ادو توالت مردانه اورجینال پلیس 100 میلی لیتر', 1.5e6]]
});
var PB = PT.filter(function (b) { return /پلیس/.test(b.name); });
chk(PB.length === 1, 'one Police brand whatever the shop calls it', JSON.stringify(PT.map(function (b) { return b.name; })));
var PM = PB.length ? PB[0].models.filter(function (m) { return m.name !== 'پلیس'; }) : [];
chk(PM.length === 2 && PM.every(function (m) { return !/پلیس|police/i.test(m.name) && m.variants.some(function (v) { return v.sizes.some(function (z) { return z.srcs.length >= 2; }); }); }), 'Police: two perfumes, «پلیس» not in their names, shops merged', JSON.stringify(PB.length && PB[0].models.map(function (m) { return m.name; })));
chk(PB.length && PB[0].models.some(function (m) { return m.name === 'پلیس'; }), 'brand-only title «اورجینال پلیس» (Police Original) is kept under Police, not deleted');
// ۱۵) همان قاعده برای برندهای دیگر: نامِ کوتاهِ فارسیِ برند (فره = Gianfranco Ferre)، علامتِ برند («سی کی» = CK)، برندی که در فهرست نیست ولی سایت گفته (Baldessarini)
var GT = buildH({
  liliome: [['عطر ادکلن فره آبی-آکوا آزورا | Gianfranco Ferre Acqua Azzurra 100 میل مردانه ادوتویلت', 3e6], ['عطر ادکلن سی کی آبسشن مردانه | CK Obsession EDT 100 میل', 3e6], ['عطر ادکلن بالدسارینی آمبر | Baldessarini Ambre 90 میل مردانه ادوتویلت', 4e6, ['Baldessarini']]],
  digikala: [['ادو تویلت مردانه بالدسارینی مدل Ambre حجم 90 میلی لیتر', 4.2e6, ['Baldessarini']]]
});
var names = []; GT.forEach(function (b) { b.models.forEach(function (m) { names.push(b.name + ' :: ' + m.name); }); });
chk(names.some(function (n) { return /^جیانفرانکو فره :: [^فgG]*آزورا$/.test(n); }), 'Ferre short Persian name → brand Gianfranco Ferre, name without brand or Latin repeat', JSON.stringify(names));
chk(names.some(function (n) { return /^کالوین کلین :: آبسشن$/.test(n); }), '«سی کی آبسشن | CK Obsession» → Calvin Klein :: Obsession', JSON.stringify(names));
chk(names.filter(function (n) { return /بالدسارینی/.test(n); }).length === 1 && names.some(function (n) { return /^بالدسارینی :: (آمبر|امبر)$/.test(n); }), 'brand from shop category (Baldessarini): name without brand, two shops one row', JSON.stringify(names));
// ۱۶) یافته‌های بازبینیِ ۱.۵۰: هیچ عطری حذف نشود، دو عطرِ جدا یکی نشوند، واژه‌ی نامِ عطر برند حساب نشود
var RV = buildH({
  liliome: [['عطر ادکلن ژولیت هز ا گان اود تو دالنس | Juliette Has A Gun Ode To Dullness 100 میل یونیسکس ادوپرفیوم', 5e6], ['عطر ادکلن اورماندو جین مونتاباکو ریو | Ormonde Jayne Montabaco Rio 120 میل یونیسکس ادوپرفیوم', 9e6],
    ['عطر ادکلن اورماندو جین مونتاباکو ایوویر | Ormonde Jayne Montabaco Ivoire 120 میل یونیسکس ادوپرفیوم', 9.1e6], ['عطر ادکلن سی کی من | CK Man 100 میل مردانه ادوتویلت', 2e6], ['عطر ادکلن جگوار مردانه-سبز | Jaguar for Men 100 میل ادوتویلت', 2e6],
    ['عطر ادکلن کوچ زنانه | Coach for women 90 میل ادوپرفیوم', 4e6], ['عطر ادکلن پارادوکس | Prada Paradoxe 90 میل زنانه ادوپرفیوم', 8e6], ['عطر ادکلن مونته کارلو | Montale Monte Carlo 100 میل یونیسکس ادوپرفیوم', 5e6],
    ['عطر ادکلن دریمز سانست | Coach Sunset 90 میل زنانه ادوپرفیوم', 4e6], ['عطر ادکلن مکس مارا گلد تاچ | Max Mara Gold Touch 100 میل زنانه ادوپرفیوم', 3e6], ['عطر ادکلن فرانک الیور بلک تاچ | Franck Olivier Black Touch 100 میل مردانه ادوتویلت', 1e6]],
  hiland: [['ادوتویلت مردانه برات 100 میل', 1e6], ['ادوپرفیوم زنانه کوچ 90 میل', 4.1e6]]
});
var rvn = []; RV.forEach(function (b) { b.models.forEach(function (m) { rvn.push(b.name + ' :: ' + m.name); }); });
var rvAll = 0; RV.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { v.sizes.forEach(function (z) { rvAll += z.srcs.length; }); }); }); });
chk(rvAll === 13, 'no listing disappears (13 listings in, 13 out)', rvAll + ' ' + JSON.stringify(rvn));
chk(rvn.some(function (n) { return /^ژولیت هو ا گان :: /.test(n) && /دالنس/.test(n); }), 'Juliette Has A Gun keeps its brand', JSON.stringify(rvn));
chk(rvn.filter(function (n) { return /ریو|ایوویر/.test(n); }).length === 2, 'Montabaco Rio ≠ Montabaco Ivoire', JSON.stringify(rvn));
chk(rvn.some(function (n) { return /پارادوکس/.test(n); }) && rvn.some(function (n) { return /مونته کارلو/.test(n); }) && rvn.some(function (n) { return /دریمز سانست/.test(n); }), 'Paradoxe / Monte Carlo / Dreams Sunset keep their names (not taken as brand)', JSON.stringify(rvn));
chk(!rvn.some(function (n) { return /^مکس :: /.test(n); }), 'Max Mara is not Mexx', JSON.stringify(rvn));
chk(rvn.some(function (n) { return /بلک تاچ/.test(n); }), 'a real repeated-looking word stays («بلک تاچ»)', JSON.stringify(rvn));
console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
