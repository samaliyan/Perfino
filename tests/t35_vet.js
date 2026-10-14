global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
// ۱) نامِ آلوده رد شود
var junk = ['عطر ادکلن مردانه ونوس 500 تومن 100 میل', 'عطر ورساچه اروس 100 میل تماس 09121234567', 'عطر دیور ساواج 100 میل 0912 123 4567', 'Versace Eros 100ml instagram @shopx', 'عطر ورساچه اروس 100 میل واتساپ', 'های نیوویش اروس 100 میل', 'عطر ورساچه اروس 100 میل قیمت 5000000', 'ورساچه اروس 100 میل 2,5 میلیون', 'عطر مردانه Venus 100 میل 450000 ریال'];
junk.forEach(function (t) { chk(C.parseTitle(t) === null, 'rejected: ' + t); });
['عطر ادکلن ورساچه اروس ادو پرفیوم 100 میل', 'هزار و یک شب 100 میل', 'پاکو رابان وان میلیون 100 میل', 'Paco Rabanne 1 Million EDT 100ml', 'Dior Sauvage EDT 3.4 oz'].forEach(function (t) { chk(C.parseTitle(t) !== null, 'kept: ' + t); });
// ۲) خطِ معروف بدونِ برند زیر «سایر» نرود
function br(t) { var p = C.parseTitle(t); return p && C.brandOf(p.key, []).name; }
chk(br('Pour Un Homme 100ml') === 'کارون', 'Pour un homme -> Caron: ' + br('Pour Un Homme 100ml'));
chk(br('عطر پور اون هوم 100 میل') === 'کارون', 'fa pour un homme -> Caron');
chk(br('Acqua di Gio EDT 100ml') === 'جورجیو آرمانی', 'Acqua di Gio -> Armani');
chk(br('ساواج ادو پرفیوم 100 میل') === 'دیور', 'Sauvage fa -> Dior');
chk(br('Aventus 100ml') === 'کرید', 'Aventus -> Creed');
chk(br('Zara Red Vanilla 100ml') === 'زارا', 'Zara known');
chk(br('Venus Collection Gold 100ml') === 'سایر برندها', 'unknown stays other');
// ۳) واژه‌ی ممنوعِ کاربر + پاک‌سازیِ همان لحظه از دادهٔ ذخیره‌شده
var db = C.newDb(), ix = C.dbIndex(db);
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن ورساچه اروس ادو پرفیوم 100 میل', price: 5e6, st: 0 }, { id: 2, t: 'عطر مردانه فلان سپید مدل ورساچه دیلان بلو 100 میل', price: 2e6, st: 0 }, { id: 3, t: 'عطر ادکلن پاکو رابان وان میلیون 100 میل', price: 6e6, st: 0 }], true);
chk(db.it.liliome[2][2] === 0, 'maker-model clone not ingested');
C.setBlock(['وان میلیون']);
var n = C.purgeStored(db); chk(n >= 1 && db.it.liliome[3][2] === 0 && db.it.liliome[1][2] !== 0, 'user block word purges stored item, others stay: n=' + n);
C.setBlock([]);
// ۴) خلاصه‌ی ردشده‌ها
chk(C.REJ.n > 0 && Object.keys(C.REJ.by).length >= 3, 'rejection counters by reason: ' + JSON.stringify(C.REJ.by));
console.log(ok + ' ok ' + bad + ' bad'); process.exit(bad ? 1 : 0);
