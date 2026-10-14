global.window=global;var C=require('../app/src/main/assets/www/core.js');
var ok=0,bad=0;function chk(n,c,i){if(c)ok++;else{bad++;console.log('FAIL',n,i===undefined?'':JSON.stringify(i))}}
function run(items){var db=C.newDb(),ix=C.dbIndex(db);var S={};items.forEach(function(x){(S[x.s]=S[x.s]||[]).push({id:(S[x.s].length+1),t:x.t,price:x.p,st:0})});
 Object.keys(S).forEach(function(s){C.ingest(db,ix,s,S[s],true);db.t[s]=Date.now()});
 var L=C.buildList(db,Object.keys(S),{liliome:1},0);var T=C.tree(L,'fa',db.wd);return {T:T,db:db}}
function models(r,b){var o=[];r.T.forEach(function(x){if(x.name.indexOf(b)>=0)x.models.forEach(function(m){o.push(m.name)})});return o}
// 1) فارسی + لاتین = یک ردیف
var r=run([{s:'liliome',t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',p:5000000},{s:'digikala',t:'Versace Eros Eau de Toilette 100ml Men',p:5100000},{s:'safir',t:'ادکلن ورساچه اروس ادو تویلت 100 میل',p:5050000}]);
chk('eros fa+en one row',models(r,'ورساچه').length===1,models(r,'ورساچه'));
// 2) عنوان لاتین زودتر از فارسی بیاید (ترتیب مهم نباشد)
r=run([{s:'digikala',t:'Versace Eros Eau de Toilette 100ml Men',p:5100000},{s:'liliome',t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',p:5000000}]);
chk('order independent',models(r,'ورساچه').length===1,models(r,'ورساچه'));
// 3) عطرهای واقعاً جدا جدا بمانند
r=run([
 {s:'liliome',t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',p:5000000},{s:'digikala',t:'Versace Eros EDT Men 100ml',p:5100000},
 {s:'liliome',t:'عطر ورساچه اروس فلیم ادو پرفیوم مردانه 100 میل',p:6000000},{s:'digikala',t:'Versace Eros Flame EDP Men 100ml',p:6100000},
 {s:'liliome',t:'عطر ورساچه دیلن بلو ادو تویلت مردانه 100 میل',p:4800000},{s:'digikala',t:'Versace Dylan Turquoise EDT Women 100ml',p:4700000}]);
var m3=models(r,'ورساچه');console.log(m3);
chk('distinct perfumes stay distinct (3 or 4 rows)',m3.length>=3&&m3.length<=4&&new Set(m3).size===m3.length,m3);
// 4) غلظت یا جنسیتِ متفاوت = یکی نمی‌شود
r=run([{s:'liliome',t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',p:5000000},{s:'digikala',t:'Versace Eros Eau de Parfum Men 100ml',p:7500000}]);
var rows=0;r.T.forEach(function(b){b.models.forEach(function(m){if(b.name.indexOf('ورساچه')>=0)rows+=m.variants.length})});
chk('EDT and EDP kept as two variants',rows===2,rows);
// 5) املای ناآشنا با اسکلت همخوان
r=run([{s:'liliome',t:'عطر آمواج اینترلود ادو پرفیوم مردانه 100 میل',p:9000000},{s:'digikala',t:'Amouage Interlude EDP Men 100ml',p:9100000}]);
var all5=[];r.T.forEach(function(b){b.models.forEach(function(m){all5.push(b.name+':'+m.name)})});
chk('unknown word skeleton match',all5.length===1,all5);
// 6) تعمیرِ حافظه‌ی قدیمیِ دارای تکراری
var db2=C.newDb(),ixA=C.dbIndex(db2);
C.ingest(db2,ixA,'liliome',[{id:1,t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',price:5000000,st:0}],true);
var id0=Object.keys(db2.g)[0],g1=db2.g[id0];db2.g.zzz=JSON.parse(JSON.stringify(g1));db2.g.zzz.k=['versace','eros'];db2.g.zzz.nm={'Versace Eros':1};
db2.it.digikala={1:['Versace Eros EDT',5100000,'zzz',100,Math.floor(Date.now()/60000)]};db2.t.digikala=Date.now();db2.full.digikala=Date.now();delete db2.dv;
C.ingest(db2,C.dbIndex(db2),'liliome',[{id:1,t:'عطر ورساچه اروس ادو تویلت مردانه 100 میل',price:5000000,st:0}],true);
chk('old duplicated db repaired, Persian group survives',Object.keys(db2.g).length===1&&db2.g[id0],Object.keys(db2.g));
chk('digikala item moved to survivor',db2.it.digikala[1][2]===id0,db2.it.digikala[1]);
console.log(ok,'ok',bad,'bad');process.exit(bad?1:0)
