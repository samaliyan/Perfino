// ۱.۵۱ — نامِ لاتینِ سایت مرجع است: عطرهای جدا یکی نمی‌شوند، ردیف‌های تکراری یکی می‌شوند؛ برند از دسته‌بندی؛ نمونه‌ی واقعیِ دیجی‌کالا.
// اجرا: node tests/t83_en_anchor.js
global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'), fs = require('fs'), ok = 0, bad = 0;
function chk(c, m, x) { if (c) ok++; else { bad++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x)); } }
function table(rows) { return '<table><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>'; }
var N = 0;
function it(name, ml, gn, conc, price, cats, brands) { return { id: ++N, name: name, slug: (name.split(/\||-(?=[A-Z])/)[1] || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), type: 'simple', is_in_stock: true, is_purchasable: true, short_description: table([['حجم', ml + ' میل'], ['جنسیت', gn], ['نوع عطر', conc]]), prices: { price: String(price), currency_code: 'IRT', currency_minor_unit: 0 }, images: [], categories: cats.map(function (c) { return { name: c }; }), brands: (brands || []).map(function (c) { return { name: c }; }) }; }
var items = [
  // عنوان‌های واقعیِ لیلیوم (آبان ۱۴۰۵)
  it('عطر ادکلن تام فورد نویر | Tom Ford Noir', 100, 'مردانه', 'ادو پرفیوم', 41520000, ['Tom Ford', 'ادکلن مردانه']),
  it('عطر ادکلن تام فورد نویر د نویر | Tom Ford Noir de Noir', 100, 'یونیسکس', 'ادو پرفیوم', 99600000, ['Tom Ford']),
  it('عطر ادکلن سالواتوره فراگامو اومو | Salvatore Ferragamo Uomo', 100, 'مردانه', 'ادو تویلت', 16320000, ['Salvatore Ferragamo']),
  it('عطر ادکلن سالواتوره فراگامو آمو فراگامو | Salvatore Ferragamo Amo Ferragamo', 100, 'زنانه', 'ادو پرفیوم', 17280000, ['Salvatore Ferragamo']),
  it('عطر ادکلن شنل بلو-بلو شنل ادو پرفیوم اصل-بلو چنل | Chanel Bleu de Chanel EDP', 100, 'مردانه', 'ادو پرفیوم', 61200000, ['Chanel']),
  it('عطر ادکلن بلو شنل-بلو چنل-ادوتویلت | Chanel Bleu de Chanel EDT', 150, 'مردانه', 'ادو تویلت', 66000000, ['Chanel']),
  it('عطر ادکلن شنل بلو د شنل پارفوم ۱۵۰میل | Chanel Bleu de Chanel Parfum', 150, 'مردانه', 'پرفیوم', 79200000, ['Chanel']),
  it('عطر ادکلن شنل بلو د شنل ادوپرفیوم-بلو چنل | Chanel Bleu de Chanel EDP', 150, 'مردانه', 'ادو پرفیوم', 72480000, ['Chanel']),
  it('عطر ادکلن شنل چنس او تندر ادو پرفیوم | Chanel Chance Eau Tendre EDP', 150, 'زنانه', 'ادو پرفیوم', 93600000, ['Chanel']),
  it('عطر ادکلن شنل چنس او تندر-صورتی | Chanel Chance Eau Tendre', 100, 'زنانه', 'ادو تویلت', 60480000, ['Chanel']),
  it('عطر ادکلن کرید اونتوس | Creed Aventus', 100, 'مردانه', 'ادو پرفیوم', 90000000, ['Creed']),
  it('عطر ادکلن کرید اونتوس کلن | Creed Aventus Cologne', 100, 'مردانه', 'ادو پرفیوم', 95000000, ['Creed']),
  it('عطر ادکلن آمواج اینترلود مردانه | Amouage Interlude Man', 100, 'مردانه', 'ادو پرفیوم', 60000000, ['Amouage']),
  it('عطر ادکلن آمواج اینترلود مردانه سری قدیم | Amouage Interlude Man', 100, 'مردانه', 'ادو پرفیوم', 90000000, ['Amouage']),
  it('عطر ادکلن پارفومز د مارلی لیتون | Parfums de Marly Layton', 125, 'مردانه', 'ادو پرفیوم', 70000000, ['Parfums de Marly', 'ادکلن مردانه']),
  it('عطر ادکلن هیستوریز د پارفومز 1899 همینگ وای | Histoires de Parfums 1899 Hemingway', 60, 'یونیسکس', 'ادو پرفیوم', 44400000, ['Histoires de Parfums']),
  it('عطر ادکلن اتکینسونز عود سیو د کینگ | Atkinsons Oud Save The King', 100, 'یونیسکس', 'ادو پرفیوم', 49920000, ['Atkinsons']),
  it('عطر ادکلن اتکینسون امبر امپایر | Atkinsons Amber Empire', 100, 'یونیسکس', 'ادو تویلت', 42000000, ['Atkinsons']),
  it('عطر ادکلن لاپق سیلور رین-La Prairie Silver Rain', 50, 'زنانه', 'ادو پرفیوم', 69600000, ['La Prairie']),
  it('عطر ادکلن استندال الکسیر بلانک | Stendhal Elixir Blanc', 90, 'زنانه', 'ادو پرفیوم', 25200000, ['Stendhal']),
  it('عطر ادکلن استندال الکسیر نوآر | Stendhal Elixir Noir', 40, 'زنانه', 'ادو پرفیوم', 26400000, ['Stendhal']),
  it('عطر ادکلن ناشناس برند آلفا | Qwertico Alpha', 100, 'مردانه', 'ادو پرفیوم', 9000000, ['Perfume Oil', 'ادکلن مردانه'])
];
// راهنمای برند
chk(C.brandOf(['x'], ['Parfums de Marly']).name === 'پارفومز د مارلی', 'known brand');
(async function () {
  var net = { get: async function (u) { var m = /[?&]page=(\d+)/.exec(u); if (+m[1] > 1) return { status: 400, body: '{"code":"rest_post_invalid_page_number"}' }; return { status: 200, body: JSON.stringify(items) }; } };
  var r = await C.wooSource('https://liliome.com', net, function () {}, 'full'), by = {}; r.items.forEach(function (x) { by[x.id] = x; });
  chk(JSON.stringify(by[15].b) === '["Parfums de Marly"]', 'category «Parfums de Marly» is a brand hint (not dropped for the word parfum)', by[15].b);
  chk(JSON.stringify(by[16].b) === '["Histoires de Parfums"]', 'Histoires de Parfums hint', by[16].b);
  chk(by[22].b.length === 0, 'generic category «Perfume Oil» is not a brand', by[22].b);
  var db = C.newDb(), idx = C.dbIndex(db); C.ingest(db, idx, 'liliome', r.items, true); db.t.liliome = Date.now();
  var T = C.tree(C.buildList(db, ['liliome'], { liliome: 1 }, 0), 'fa', db.wd), B = {};
  T.forEach(function (b) { B[b.name] = b.models.map(function (m) { return m.name; }); });
  function names(b) { return B[b] || []; }
  chk(names('تام فورد').length === 2, 'Noir and Noir de Noir are two perfumes', names('تام فورد'));
  chk(names('سالواتوره فراگامو').length === 2, 'Uomo and Amo are two perfumes', names('سالواتوره فراگامو'));
  var ch = names('شنل');
  chk(ch.length === 2, 'Chanel: one Bleu de Chanel row and one Chance Eau Tendre row', ch);
  chk(ch.indexOf('بلو دو شنل') >= 0 || ch.indexOf('بلو د شنل') >= 0, 'Bleu de Chanel keeps its proper name', ch);
  chk(!ch.some(function (n) { return /چنل|صورتی/.test(n); }), 'no brand respelling or colour left in Chanel names', ch);
  var bleu = T.filter(function (b) { return b.name === 'شنل'; })[0].models.filter(function (m) { return /بلو/.test(m.name); })[0];
  chk(bleu && bleu.variants.length === 3, 'Bleu de Chanel has EDP, EDT and Parfum variants', bleu && bleu.variants.map(function (v) { return v.conc; }));
  var edp = bleu && bleu.variants.filter(function (v) { return v.conc === 'ادوپرفیوم'; })[0];
  chk(edp && edp.sizes.length === 2, 'EDP has both sizes (100 and 150)', edp && edp.sizes.map(function (s) { return s.ml; }));
  chk(names('کرید').length === 2, 'Aventus and Aventus Cologne stay separate', names('کرید'));
  chk(names('آمواج').length === 2, 'old series stays a separate row (same shop, same size, other price)', names('آمواج'));
  chk(!!B['پارفومز د مارلی'] && !!B['هیستوریز د پارفومز'], 'Parfums de Marly / Histoires de Parfums are brands', Object.keys(B));
  chk(names('اتکینسونز').length === 2 && !names('اتکینسونز').some(function (n) { return /اتکینسون/.test(n); }), 'Atkinsons: one brand, name not repeated', names('اتکینسونز'));
  chk(!!B['لا پریری'], 'La Prairie (shop writes «لاپق»)', Object.keys(B));
  chk(!!B['استندال'] && names('استندال').length === 2 && names('استندال').every(function (n) { return /^الکسیر/.test(n); }), 'Stendhal: «الکسیر» belongs to the perfume, not the brand', names('استندال'));
  chk(!T.audit.q.dupBrand.n && !T.audit.q.latin.n, 'audit clean', T.audit.q);
  // دیجی‌کالا: نمونه‌ی واقعیِ پاسخِ سایت (آبان ۱۴۰۵)
  var dk = fs.readFileSync(__dirname + '/data/dk_sample.json', 'utf8'), empty = JSON.stringify({ status: 200, data: { products: [], pager: JSON.parse(dk).data.pager } });
  var net2 = { get: async function (u) { return { status: 200, body: /page=1(?!\d)/.test(u) ? dk : empty }; } };
  var d = await C.digikalaSource(net2, function () {}, 'price');
  chk(d.items.length === 4 && d.items.every(function (x) { return x.price > 100000 && x.st === 0 && x.t; }), 'Digikala sample: 4 products with title, toman price and in-stock flag', d.items.map(function (x) { return [x.t, x.price, x.st]; }));
  var lal = d.items.filter(function (x) { return /لالیک مدل Encre Noire/.test(x.t); })[0], pl = lal && C.parseTitle(lal.t);
  chk(pl && pl.ml === 100 && pl.gn === 'm' && lal.price === 6925760, 'Lalique Encre Noire 100ml: rial → toman, size and gender', lal && [lal.price, pl]);
  console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
})();
