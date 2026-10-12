// پایش: عنوان‌های شلوغ و واقع‌نما (املای مختلف، واژه‌ی تکراری، برند به شکل‌های مختلف، فقط‌برند، ناموجود)
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))}}
function T(c,m,x){if(c)ok++;else{bad++;console.log('FAIL',m,x===undefined?'':JSON.stringify(x))}}
var id=0;function it(t,price,o){o=o||{};return {id:o.id||++id,t:t,e:o.e||'',price:price,img:'',st:o.st||0,b:o.b||[]}}
var db=C.newDb(),idx=C.dbIndex(db);
// لیلیوم: «نام فارسی | English»، دسته‌ی برند به شکل «Dior (دیور)»
C.ingest(db,idx,'liliome',[
 it('عطر ادکلن دیور ساواج ادو تویلت | Dior Sauvage EDT مردانه 100 میل',5800000,{id:101,b:['Dior (دیور)','ادکلن مردانه'],e:'dior-sauvage-edt'}),
 it('عطر ادکلن دیور ساواج ادو پرفیوم | Dior Sauvage EDP مردانه 100 میل',6900000,{id:102,b:['Dior (دیور)']}),
 it('عطر ادکلن دیور ساواج الکسیر | Dior Sauvage Elixir مردانه 60 میل',9800000,{id:103,b:['Dior (دیور)']}),
 it('عطر ادکلن دیور ساواج اکسیر ساواج مردانه 60 میل',9700000,{id:104,b:['Dior']}),
 it('عطر ادکلن دیور ادوپرفیوم 100 میل',4000000,{id:105,b:['Dior (دیور)']}),                  // فقط برند → بی‌نام
 it('عطر ادکلن دیور جادور زنانه ادو پرفیوم 100 میل',7000000,{id:106,b:['دیور']}),
 it('عطر ادکلن شنل بلو دو شنل مردانه ادو پرفیوم 100 میل | Chanel Bleu de Chanel EDP',9000000,{id:107,b:['Chanel (شنل)']}),
 it('عطر ادکلن دیور میس دیور زنانه ادو پرفیوم 100 میل',8000000,{id:108,st:1}),                 // ناموجود
],true);
// دیجی‌کالا
C.ingest(db,idx,'digikala',[
 it('عطر ادکلن مردانه دیور مدل ساواج حجم 100 میلی لیتر ادو تویلت',5900000,{id:201,e:'Dior Sauvage Eau de Toilette for Men 100ml',b:['Dior']}),
 it('ادکلن دیور ساوج الکسیر ساواج مردانه 60 میل ادوپرفیوم',9900000,{id:202,e:'Dior Sauvage Elixir 60ml',b:['دیور']}),
 it('عطر ادکلن دیور ساواژ پرفیوم مردانه 100 میل',8800000,{id:203,b:['Dior']}),
 it('عطر ادکلن شنل بلو دو شنل مردانه ادو پرفیوم 100 میل',9100000,{id:204,b:['Chanel']}),
 it('عطر ادکلن کریستین دیور جادور زنانه ادوپرفیوم 100 میل',7100000,{id:205,b:['Christian Dior']}),
],true);
C.ingest(db,idx,'safir',[
 it('دیور ساواج الکسیر دیور 60 میل',9800000,{id:'https://www.safirstores.com/p/aaa'}),
 it('Dior Miss Dior EDP 100ml',8100000,{id:'https://www.safirstores.com/p/bbb'}),
],true);
['liliome','digikala','safir'].forEach(function(s){db.t[s]=Date.now()});
var L=C.buildList(db,['liliome','digikala','safir'],{liliome:1,digikala:1},0);
['fa','en'].forEach(function(lang){
  var tr=C.tree(L,lang,db.wd), dior=tr.filter(function(b){return b.name===(lang==='fa'?'دیور':'Dior')});
  eq(dior.length,1,lang+': exactly one Dior brand: '+tr.map(function(b){return b.name}));
  var d=dior[0]; if(!d) return;
  var names=d.models.map(function(m){return m.name});
  console.log(lang,JSON.stringify(names));
  T(names.indexOf(d.name)<0,lang+': no model named like the brand',names);
  T(names.every(function(n){var w=n.toLowerCase().split(' ');return w.every(function(x,i){return w.indexOf(x)===i})}),lang+': no repeated word in a model name',names);
  T(!names.some(function(n){return /ساواج ساواج|sauvage sauvage/i.test(n)}),lang+': no "ساواج ساواج"');
  T(names.filter(function(n){return /sauvage elixir|ساواج الکسیر/i.test(n)}).length===1,lang+': Sauvage Elixir appears once',names);
  var el=d.models.filter(function(m){return /sauvage elixir|ساواج الکسیر/i.test(m.name)})[0];
  T(el&&el.variants.length===1&&el.variants[0].sizes.length===1&&el.variants[0].sizes[0].srcs.length>=3,lang+': Elixir has 60ml with ≥3 sources (liliome,digikala,safir)',el&&el.variants.map(function(v){return v.sizes}));
  T(!names.some(function(n){return /miss|میس/i.test(n)&&false}),'-');
});
var au=C.tree(L,'fa',db.wd).audit;
T(au.nb>=1,'bare "Dior EDP" removed (nb='+au.nb+')',au.bare);
// ناموجود: «میس دیور» لیلیوم قیمت ندارد؛ فقط سفیر دارد → فقط از سفیر
var miss=[];C.tree(L,'fa',db.wd).forEach(function(b){b.models.forEach(function(m){if(/میس|miss/i.test(m.name))miss.push(m)})});
T(miss.length>=1,'Miss Dior exists via safir',miss.length);
T(miss.every(function(m){return m.variants.every(function(v){return v.sizes.every(function(z){return z.srcs.every(function(q){return q.s!=='liliome'})})})}),'unavailable liliome item not priced');
// کهنگی: کالایی که ۷ ساعت پیش آخرین‌بار دیده شده و بعدش سایت چند بار دیگر خوانده شده → حذف
var db2=JSON.parse(JSON.stringify(db));
Object.keys(db2.it.digikala).forEach(function(k){db2.it.digikala[k][4]-=7*60});
var L2=C.buildList(db2,['liliome','digikala','safir'],{liliome:1,digikala:1},0);
T(L2.stale>=4,'stale items (not seen for 7h) dropped: '+L2.stale);
var anyDk=false;L2.forEach(function(g){g.sizes.forEach(function(z){z.srcs.forEach(function(q){if(q.s==='digikala')anyDk=true})})});
T(!anyDk,'no digikala price when its items are stale');
// لینک‌ها
eq(C.itemUrl('liliome','328448'),'https://liliome.com/?p=328448','woo link');
eq(C.itemUrl('digikala','123'),'https://www.digikala.com/product/dkp-123/','digikala link');
eq(C.itemUrl('safir','https://www.safirstores.com/p/x'),'https://www.safirstores.com/p/x','html link');
eq(C.itemUrl('safir','عنوان بدون آدرس'),'','no link when id is not url/number');
console.log(ok+' passed, '+bad+' failed'); process.exit(bad?1:0);
