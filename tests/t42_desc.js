global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, failed = 0;
function chk(c, m) { if (c) ok++; else { failed++; console.log('FAIL', m); } }
function P(t) { return C.parseTitle(t); }
function key(t) { var p = P(t); return p ? p.key.join(' ') : null; }
// توضیح تبلیغاتی نامِ عطر نیست
chk(key('عطر ادکلن افنان 9pm با رایحه شیرین و گرم ادو پرفیوم 100 میل') === 'افنان 9pm', 'description clause removed, name kept: ' + key('عطر ادکلن افنان 9pm با رایحه شیرین و گرم ادو پرفیوم 100 میل'));
chk(key('عطر ادکلن افنان با رایحه خنک 100 میل') === 'افنان', '"با رایحه خنک" is not a perfume name');
chk(key('عطر ادکلن افنان با ساختار ترش فصل بهار نایت ادو پرفیوم 100 میل') === 'افنان', '"با ساختار ترش فصل بهار" is not a perfume name');
chk(P('عطر ادکلن افنان با رایحه خنک 100 میل') !== null, 'a title with "با رایحه خنک" is no longer rejected');
chk(key('عطر ادکلن اسپرینگ نایت افنان مناسب فصل بهار 100 میل') === 'اسپرینگ نایت افنان', 'season phrase removed: ' + key('عطر ادکلن اسپرینگ نایت افنان مناسب فصل بهار 100 میل'));
// تقلیدِ «با رایحه‌ی عطرِ معروف» هنوز رد می‌شود
['عطر ادکلن رومبا با رایحه ورساچه اروس 100 میل', 'عطر ادکلن با رایحه دیور ساواج 100 میل'].forEach(function (t) { chk(P(t) === null, 'scent-of clone rejected: ' + t); });
// نام‌های درست دست‌نخورده
['Afnan 9PM Eau de Parfum 100ml', 'عطر ادکلن افنان 9 پی ام الکسیر | Afnan 9PM Elixir 100 میل', 'Dior Sauvage Elixir 100ml', 'عطر ادکلن ورساچه اروس 100 میل'].forEach(function (t) { chk(P(t) !== null && key(t).length > 3, 'normal title kept: ' + t); });
// عنوانِ بی‌نام + نشانیِ صفحه (slug) = نامِ واقعی
var db = C.newDb(), ix = C.dbIndex(db), h0 = C.CLEANSE.healed | 0;
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'عطر ادکلن افنان با رایحه خنک ادو پرفیوم 100 میل', e: 'afnan 9pm elixir', price: 3000000, st: 0 }, { id: 2, t: 'عطر ادکلن افنان با ساختار ترش فصل بهار 100 میل', e: 'afnan spring night', price: 2500000, st: 0 }], true);
var L = C.buildList(db, ['liliome'], { liliome: true }, 0);
var names = L.map(function (g) { return g.name + '|' + g.key.join(' '); }).join(' ; ');
chk((C.CLEANSE.healed | 0) - h0 === 2, 'both nameless titles healed from slug: ' + names);
chk(L.length === 2 && L.every(function (g) { return !/ساختار|رایحه|فصل/.test(g.name); }), 'no description text in names: ' + names);
chk(L.some(function (g) { return /9pm|elixir|الکسیر|۹/i.test(g.key.join(' ')); }) && L.some(function (g) { return /spring|اسپرینگ/i.test(g.key.join(' ')); }), 'real names recovered: ' + names);
// بدونِ slug: بی‌نام می‌ماند ولی شمرده و نمونه‌اش ثبت می‌شود (برای گزارش)
var n0 = C.CLEANSE.nameless | 0; C.ingest(db, ix, 'safir', [{ id: 9, t: 'عطر ادکلن افنان با رایحه سرد ادو پرفیوم 100 میل', price: 2800000, st: 0 }], true);
chk((C.CLEANSE.nameless | 0) === n0 + 1 && (C.CLEANSE.nlEx || []).some(function (x) { return /رایحه سرد/.test(x); }), 'nameless titles are counted with a sample for the report');
// حافظه‌ی قدیمی: گروهی که با قاعده‌ی قبلی ساخته شده با نامِ تازه دوباره ثبت شود
var db2 = C.newDb(), ix2 = C.dbIndex(db2); C.ingest(db2, ix2, 'liliome', [{ id: 5, t: 'عطر ادکلن افنان 9pm 100 میل', price: 3e6, st: 0 }], true);
var gid = db2.it.liliome[5][2]; db2.g[gid].k = ['افنان', 'با', 'ساختار', 'ترش']; db2.dv = 1;
db2.it.liliome[5][0] = 'عطر ادکلن افنان 9pm 100 میل';
var n = C.purgeStored(db2); chk(db2.it.liliome[5][0] === '' , 'stored item whose key changed is queued for re-ingest');
// عنوان واقعی دیجی‌کالا (بدون الفِ «ادو»)
var RT='دوپرفیوم مردانه افنان مدل 9pm night out حجم 100 میلی‌لیتر با ساختار رایحه ترش مناسب فصل بهار';
chk(key(RT)==='افنان 9pm night out'&&P(RT).conc==='ادوپرفیوم'&&P(RT).ml===100,'real digikala title: '+key(RT));
chk(key('دوتویلت زنانه شنل مدل چنس 100 میلی لیتر')!==null&&P('دوتویلت زنانه شنل مدل چنس 100 میلی لیتر').conc==='ادوتویلت','دوتویلت typo');
console.log(ok + ' ok ' + failed + ' bad'); process.exit(failed ? 1 : 0);
