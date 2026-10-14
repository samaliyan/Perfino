global.window = global; var C = require('../app/src/main/assets/www/core.js'); var ok = 0, bad = 0;
function chk(c, m) { if (c) ok++; else { bad++; console.log('FAIL', m); } }
var p = C.parseTitle('Jean Paul Gaultier Le Male EDT 125ml'); chk(p && p.key.join(' ').indexOf('male') >= 0, 'Le Male keeps Male: ' + (p && p.key));
p = C.parseTitle('Jean Paul Gaultier Ultra Male EDT 125ml'); chk(p && p.key.join(' ').indexOf('male') >= 0, 'Ultra Male keeps Male');
p = C.parseTitle('Prada Candy Ladies EDP 80ml'); chk(p && p.gn === 'w' && p.key.indexOf('ladies') < 0, 'Ladies removed, gender w');
p = C.parseTitle('ورساچه اروس آقایان ادو تویلت 100 میل'); chk(p && p.key.join(' ') === 'ورساچه اروس' && p.gn === 'm', 'Persian men word removed');
p = C.parseTitle('Dior Sauvage EDT 3,4 oz'); chk(p && p.ml === 100, 'oz comma');
p = C.parseTitle('عطر ورساچه اروس 100 میل قیمت 2,5 میلیون'); chk(p && p.ml === 100, 'میلیون not size');
var db = C.newDb(), ix = C.dbIndex(db);
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'ورساچه اروس ادو تویلت 100 میل', price: 5e6, st: 0 }], true);
var gid = db.it.liliome[1][2]; db.g[gid].k = ['ورساچه', 'اروس', 'آقایان']; db.dv = 4; db.full = { liliome: Date.now() };
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'x', price: 5e6, st: 3 }], false);
chk(db.it.liliome[1][0] === '' && !db.full.liliome, 'stale key -> title cleared and full refresh forced');
C.ingest(db, ix, 'liliome', [{ id: 1, t: 'ورساچه اروس ادو تویلت 100 میل', price: 5e6, st: 0 }], true);
var g2 = db.g[db.it.liliome[1][2]]; chk(g2.k.join(' ') === 'ورساچه اروس', 're-resolved with clean key: ' + g2.k);
console.log(ok + ' ok ' + bad + ' bad'); process.exit(bad ? 1 : 0);
