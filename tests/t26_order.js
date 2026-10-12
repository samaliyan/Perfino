global.window=global;var C=require('../app/src/main/assets/www/core.js');
var ok=0,bad=0;function chk(n,c,i){if(c)ok++;else{bad++;console.log('FAIL',n,i||'')}}
function run(items){var db=C.newDb(),ix=C.dbIndex(db);C.ingest(db,ix,'liliome',items.filter(function(x){return x.s=='l'}).map(function(x,i){return {id:i+1,t:x.t,price:x.p,st:0}}),true);
 C.ingest(db,ix,'digikala',items.filter(function(x){return x.s=='d'}).map(function(x,i){return {id:i+1,t:x.t,price:x.p,st:0}}),true);
 db.t.liliome=db.t.digikala=Date.now();
 var L=C.buildList(db,['liliome','digikala'],{liliome:1},0);var T=C.tree(L,'fa',db.wd).filter(function(b){return 1});return T}
function names(T,brand){var o=[];T.forEach(function(b){if(b.name.indexOf(brand)>=0)b.models.forEach(function(m){o.push(m.name+'('+m.variants.length+')')})});return o}
// 1) ساواج الکسیر و الکسیر ساواج یکی؛ ساواج ساده جدا
var T=run([
 {s:'l',t:'عطر دیور ساواج الکسیر پارفوم 100 میل',p:9000000},
 {s:'d',t:'ادکلن دیور الکسیر ساواج پارفوم 100 میل',p:9100000},
 {s:'l',t:'عطر دیور ساواج ادو تویلت 100 میل',p:6000000},
 {s:'d',t:'ادکلن دیور سواژ ادو تویلت 100 میل',p:6100000},
 {s:'l',t:'عطر دیور ساواج ساواج الکسیر 60 میل',p:7000000}]);
var n=names(T,'دیور');console.log(n);
chk('elixir order merged + plain separate',n.length===2,n);
// 2) Black XS و XS Black جدا بمانند
var T2=run([
 {s:'l',t:'عطر پاکو رابان بلک ایکس اس ادو تویلت مردانه 100 میل',p:5000000},
 {s:'d',t:'ادکلن پاکو رابان ایکس اس بلک ادو تویلت مردانه 100 میل',p:5100000}]);
var n2=names(T2,'پاکو');console.log(n2);
chk('Black XS / XS Black stay separate',n2.length===2,n2);
console.log(ok,'ok',bad,'bad');process.exit(bad?1:0)
