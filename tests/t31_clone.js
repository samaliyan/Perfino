global.window = global; var C = require('../app/src/main/assets/www/core.js'); var bad = 0, ok = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
['عطر ادکلن پرفیوم مردانه های نیوویش مدل ورساچه اروس 100 میلی لیتر', 'عطر جیبی مردانه اسکلاسیک مدل ورساچه اروس 25 میل', 'عطر ادکلن زنانه آلفا مدل شنل کوکو مادمازل 50 میل'].forEach(function (t) { chk(C.parseTitle(t) === null, 'clone rejected: ' + t); });
['عطر ادکلن ورساچه اروس ادو پرفیوم 100 میلی لیتر', 'عطر ادکلن دیور مدل ساواج ادو تویلت 100 میل', 'عطر ادکلن مردانه ورساچه مدل اروس 100 میل', 'Versace Eros Parfum 100ml'].forEach(function (t) { chk(C.parseTitle(t) !== null, 'real kept: ' + t); });
// داده‌ی قدیمیِ گوشی: کالای جعلی باید از گروه بیرون برود و قیمتِ Eros اصلی دست نخورد
var db = C.newDb(), ix = C.dbIndex(db);
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن ورساچه اروس ادو پرفیوم 100 میلی لیتر', price: 5000000, st: 0 }], true);
var gid = db.it.liliome[1][2];
db.it.liliome[2] = ['عطر ادکلن پرفیوم مردانه های نیوویش مدل ورساچه اروس 100 میلی لیتر', 2000000, gid, 100, 1]; db.dv = 3;
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'x', price: 5000000, st: 3 }, { id: 2, t: 'x', st: 3 }], false);
chk(db.it.liliome[2][2] === 0, 'stored clone purged');
db.t.liliome = Date.now(); var L = C.buildList(db, ['liliome'], { liliome: 1 }, 0), T = C.tree(L, 'fa', db.wd), prices = [];
T.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { JSON.stringify(v).replace(/\d{6,}/g, function (x) { prices.push(+x); }); }); }); });
chk(prices.length && prices.indexOf(2000000) < 0 && prices.indexOf(5000000) >= 0, 'only real price shown ' + prices);
console.log(ok + ' ok ' + bad + ' bad');
