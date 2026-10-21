// بازرسیِ خودکارِ فهرستِ نهایی روی داده‌ی واقعیِ گوشی (۱۶ هزار عنوان از ۴ فروشگاه):
// برندِ تکراری، نامِ برند داخلِ نامِ عطر، واژه‌ی تکراری، نامِ تکراری، حروفِ لاتین. سه حالت برای «برندِ دسته‌بندیِ سایت»:
// بدونِ آن، با نامِ لاتینِ برند (مثلِ دیجی‌کالا/ووکامرس)، و با نامِ فارسی. اجرا: node tests/t82_list_audit.js
global.window = global; global.DOMParser = undefined;
var fs = require('fs'), C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var lines = fs.readFileSync(__dirname + '/data/titles_phone.txt', 'utf8').split('\n').filter(Boolean), by = {};
lines.forEach(function (l) { var i = l.indexOf('|'); (by[l.slice(0, i)] = by[l.slice(0, i)] || []).push(l.slice(i + 1)); });
var ok = 0, bad = 0;
function chk(c, m, i) { if (c) ok++; else { bad++; console.log('FAIL', m, i === undefined ? '' : i); } }
function hint(t, mode) {
  if (mode === 'none') return [];
  var p = C.parseTitle(t); if (!p) return [];
  var e = C.brandOf(p.key, []);
  if (e.id === 'other') { var m = t.split('|')[1]; return m && mode === 'en' ? [m.trim().split(/\s+/)[0]] : []; }      // برندِ ناشناخته: نامِ لاتینی که سایت گذاشته
  return [mode === 'fa' ? e.name : (e.en || e.name)];
}
['none', 'en', 'fa'].forEach(function (mode) {
  var db = C.newDb(), ix = C.dbIndex(db);
  Object.keys(by).forEach(function (s) { C.ingest(db, ix, s, by[s].map(function (t, i) { return { id: i + 1, t: t, price: 5e6 + (i % 7) * 1e5, b: hint(t, mode) }; }), true); });
  C.reconcile(db, ix);
  var T = C.tree(C.buildList(db, Object.keys(by), {}, 0), 'fa', db.wd), Q = T.audit.q;
  console.log(mode, 'brands', T.length, JSON.stringify(Object.keys(Q).map(function (k) { return k + ':' + Q[k].n; })));
  chk(Q.dupBrand.n === 0, mode + ': no two brands with the same name', JSON.stringify(Q.dupBrand.ex));
  chk(Q.brandInName.n <= 2, mode + ': brand name is not inside perfume names', JSON.stringify(Q.brandInName.ex));
  chk(Q.repeated.n === 0, mode + ': no repeated word in a perfume name', JSON.stringify(Q.repeated.ex));
  chk(Q.latin.n === 0, mode + ': no Latin letters in Persian names', JSON.stringify(Q.latin.ex));
  chk(Q.dupModel.n <= 3, mode + ': almost no two rows with the same name in one brand', JSON.stringify(Q.dupModel.ex));
  var pol = T.filter(function (b) { return b.name === 'پلیس'; });
  chk(pol.length === 1 && pol[0].models.length >= 20 && !pol[0].models.some(function (m) { return /پلیس|police/i.test(m.name); }), mode + ': Police is one brand and «پلیس» is not repeated in its perfume names', pol.map(function (b) { return b.models.length + ' ' + b.models.slice(0, 5).map(function (m) { return m.name; }).join(' / '); }).join(' || '));
});
console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
