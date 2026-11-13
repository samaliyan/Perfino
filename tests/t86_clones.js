// ۱.۵۵ — «طرحِ عطرها» (غیر اصل): با setClones(true) نگه داشته می‌شوند ولی هرگز با عطرِ اصل یکی نمی‌شوند و گروهِ جدا دارند. اجرا: node tests/t86_clones.js
global.window = global; global.DOMParser = undefined;
var C = require('../app/src/main/assets/www/core.js'); C = C.Core || C;
var ok = 0, bad = 0;
function chk(c, m, x) { if (c) ok++; else { bad++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x)); } }
var CL = 'ادو پرفیوم مردانه هارلینگن مدل ساواج دیور با رایحه خنک حجم 100 میلی لیتر', CL2 = 'ادو پرفیوم مردانه اسکلاره مدل Tom Ford Tuscan Leather با رایحه گرم و تلخ حجم 100 میلی لیتر';
chk(C.parseTitle(CL) === null, 'default: clone titles are rejected (as before)');
C.setClones(true);
var p = C.parseTitle(CL);
chk(p && p.cl === true && p.key[0] === C.CL_MARK && p.ml === 100 && p.gn === 'm', 'kept, marked, size and gender read', p);
chk(C.brandOf(p.key, ['هارلینگن']).id === 'clone' && C.brandOf(p.key, ['Dior']).id === 'clone', 'brand is the clone group whatever the shop says');
var og = C.parseTitle('ادو تویلت مردانه دیور مدل Sauvage حجم 100 میلی لیتر');
chk(og && !og.cl && og.key[0] !== C.CL_MARK, 'the real brand with «مدل» is not a clone', og);
chk(C.parseTitle('تستر ادو پرفیوم مردانه هارلینگن مدل ساواج دیور حجم 100 میلی لیتر') === null, 'testers/samples stay rejected');
C.setBlock(['هارلینگن']); chk(C.parseTitle(CL) === null, 'the user\'s blocked words still win'); C.setBlock([]);
var items = { digikala: [{ id: 1, t: CL, price: 1499000, st: 0, b: ['هارلینگن'] }, { id: 2, t: 'ادو تویلت مردانه دیور مدل Sauvage حجم 100 میلی لیتر', price: 40000000, st: 0, b: ['دیور'] }, { id: 3, t: CL2, price: 1461620, st: 0, b: ['اسکلاره'] }],
  liliome: [{ id: 9, t: 'عطر ادکلن دیور ساواج | Dior Sauvage 100 میل مردانه ادوتویلت', price: 40800000, st: 0, b: ['Dior'] }, { id: 10, t: 'عطر ادکلن تام فورد توسکان لدر | Tom Ford Tuscan Leather 100 میل یونیسکس ادوپرفیوم', price: 90000000, st: 0, b: ['Tom Ford'] }] };
var db = C.newDb(), ix = C.dbIndex(db);
Object.keys(items).forEach(function (s) { C.ingest(db, ix, s, items[s], true); db.t[s] = Date.now(); });
C.reconcile(db, ix);
var L = C.buildList(db, Object.keys(items), {}, 0), T = C.tree(L, 'fa', db.wd), B = {};
T.forEach(function (b) { B[b.id === 'clone' ? 'clone' : b.name] = b; });
chk(T[T.length - 1].id === 'clone' && T[T.length - 1].L === '#', 'clone group is the last entry of the brand list', T.map(function (b) { return b.name; }));
chk(B.clone && B.clone.models.length === 2, 'two clones listed', B.clone && B.clone.models.map(function (m) { return m.name; }));
chk(B['دیور'] && B['دیور'].models.length === 1 && B['دیور'].models[0].variants[0].sizes[0].n === 2 && B['دیور'].models[0].variants[0].sizes[0].price > 3e7, 'Dior Sauvage: only the two real listings, price not pulled down by the clone', B['دیور'] && B['دیور'].models.map(function (m) { return [m.name, m.variants.map(function (v) { return v.sizes; })]; }));
chk(B['تام فورد'] && B['تام فورد'].models.length === 1 && B['تام فورد'].models[0].variants[0].sizes[0].n === 1, 'Tom Ford Tuscan Leather is not merged with the clone');
chk(B.clone.models.every(function (m) { return !/طرحعطر/.test(m.name) && /هارلینگن|اسکلاره/.test(m.name); }), 'clone names show the maker and no marker', B.clone.models.map(function (m) { return m.name; }));
chk(L.filter(function (g) { return C.isCloneKey(g.key); }).length === 2, 'isCloneKey finds them (market report leaves them out)');
// جستجو: هر دو پیدا می‌شوند و می‌شود جدایشان کرد
var idx = C.searchIndex(T, function (w) { return w; }), r = C.searchRank(idx, ['ساواج'], null, { prefixLast: true });
chk(r.length >= 2 && r.some(function (o) { return idx[o.i].b.id === 'clone'; }) && r.some(function (o) { return idx[o.i].b.name === 'دیور'; }), 'search finds the original and the clone (the screen shows them in separate sections)');
C.setClones(false);
console.log(ok + ' pass ' + bad + ' fail'); process.exit(bad ? 1 : 0);
