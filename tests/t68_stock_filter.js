// فروشگاهِ بزرگ (مثل لیلیوم: >۱۶۰۰۰ محصول با ناموجودها): فقط موجودها خوانده می‌شود تا عطرهای قدیمی از سقفِ ۹۰ صفحه بیرون نمانند
global.DOMParser=undefined;global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))}}
function pr(v){return {price:String(v),regular_price:String(v),currency_code:'IRT',currency_symbol:'تومان',currency_minor_unit:0,price_range:null}}
function mk(id,name,inStock,price){return {id:id,name:name,slug:'p'+id,type:'simple',is_in_stock:inStock,is_purchasable:inStock,is_on_backorder:false,short_description:'<table><tr><td>سایز</td><td>100 میل</td></tr></table>',permalink:'https://big.shop/shop/p'+id+'/',prices:pr(inStock?price:0),images:[],categories:[{name:'Brand'}],attributes:[]}}
// ۱۶۰۰۰ محصول، جدیدها اول؛ فقط هر پنجمی موجود است. کلینیک (قدیمی‌ترین) موجود است.
var ALL=[];for(var i=0;i<16000;i++){var id=300000-i*10,inS=i%5===0;ALL.push(mk(id,'عطر ادکلن تست '+['الف','ب','ج','د','ه'][i%5]+i+' | Test'+i,inS,5000000+i))}
ALL.push(mk(9882,'عطر ادکلن کلینیک هپی مردانه | Clinique Happy',true,13440000));ALL[ALL.length-1].categories=[{name:'Clinique'}];
function server(mode){var calls=[];return {calls:calls,get:async function(u){
  calls.push(u);var m=/[?&]page=(\d+)/.exec(u);if(!m)return {status:404,body:''};
  var pg=+m[1],list=ALL;
  if(/stock_status=instock/.test(u)){
    if(mode==='reject')return {status:400,body:'{"code":"rest_invalid_param"}'};
    if(mode!=='ignore')list=ALL.filter(function(x){return x.is_in_stock});
  }
  var a=list.slice((pg-1)*100,pg*100);
  if(pg>1&&!a.length)return {status:400,body:'{"code":"rest_invalid_page_number"}'};
  return {status:200,body:JSON.stringify(a)}}}}
(async function(){
  var s1=server('ok');C.useSz({});
  var r=await C.wooSource('https://big.shop',s1,function(){},'full');
  eq(r.items.some(function(x){return x.id===9882&&x.st===0&&x.price===13440000}),true,'old in-stock Clinique reached');
  eq(r.complete,'soft','whole in-stock list read → complete (soft)');
  eq(s1.calls.every(function(u){return /stock_status=instock/.test(u)}),true,'every page asks for in-stock only');
  eq(s1.calls.length<=40,true,'about 33 pages, not 90: '+s1.calls.length);
  var db=C.newDb(),idx=C.dbIndex(db);C.ingest(db,idx,'big',r.items,true);db.t.big=Date.now();
  var l=C.buildList(db,['big'],{},0);
  eq(l.some(function(g){return /کلینیک/.test(g.name)&&g.sizes[0].price===13440000}),true,'Clinique in the final list');
  // price mode too
  var sp=server('ok');var rp=await C.wooSource('https://big.shop',sp,function(){},'price');
  eq(rp.items.some(function(x){return x.id===9882}),true,'price mode reaches old product');
  // سایتی که پارامتر را نمی‌پذیرد (۴۰۰) → بدون فیلتر ادامه می‌دهد
  var s2=server('reject');var r2=await C.wooSource('https://big.shop',s2,function(){},'full');
  eq(r2.items.length>0&&s2.calls.some(function(u){return !/stock_status/.test(u)}),true,'rejecting site: falls back to unfiltered');
  eq(/سقفِ ۹۰ صفحه/.test(r2.note)&&r2.complete===false,true,'cap hit is reported and list is not "complete": '+r2.note);
  // سایتی که پارامتر را نادیده می‌گیرد: مثل قبل کار می‌کند و ناموجودها st=1 می‌مانند
  var s3=server('ignore');var r3=await C.wooSource('https://big.shop',s3,function(){},'price');
  eq(r3.items.filter(function(x){return x.st===1}).length>0,true,'ignoring site: out-of-stock still marked st=1');
  // ---- ingest: فروشگاهی که از این پس فقط موجودها را می‌دهد ----
  eq(r.complete,'soft','filtered full read reports soft completion');
  var db2=C.newDb(),idx2=C.dbIndex(db2),prev=[];
  for(var q=0;q<60;q++)prev.push({id:q+1,t:'عطر ادکلن تست برند'+q+' | T'+q+' 100 میل',price:6000000+q,st:0,img:'',big:'',b:[]});
  for(q=60;q<100;q++)prev.push({id:q+1,t:'عطر ادکلن ناموجود برند'+q+' | N'+q+' 100 میل',price:0,st:1,img:'',big:'',b:[]});
  C.ingest(db2,idx2,'big',prev,true);
  var now2=prev.filter(function(x){return x.st===0&&x.id>3});      // ۳ تا حالا ناموجود شدند (دیگر در پاسخ نیستند)؛ ۴۰ ناموجودِ قدیمی هم نیستند
  var s2=C.ingest(db2,idx2,'big',now2,'soft');
  eq(!!s2.suspect,false,'out-of-stock items disappearing is not a suspicious drop');
  eq(Object.keys(db2.it.big).length,100,'recently seen entries are kept (restock needs no full download): '+Object.keys(db2.it.big).length);
  eq(db2.it.big['1'][1],0,'sold-out item no longer keeps its old price');
  eq(s2.soldOut,3,'three newly sold-out counted');
  // دوباره موجود شد: فقط قیمت (بدون «ناشناخته» و بدون دریافتِ کامل)
  var s3=C.ingest(db2,idx2,'big',[{id:1,t:'',price:6500000,st:3}],false);
  eq(db2.it.big['1'][1]===6500000&&!s3.unknown,true,'restock in price mode is recognised: '+JSON.stringify(s3));
  // ۳۰ روز ندیده شد: پاک
  Object.keys(db2.it.big).forEach(function(k){if(+k>60)db2.it.big[k][4]=Math.floor(Date.now()/60000)-31*1440});
  var s4=C.ingest(db2,idx2,'big',now2,'soft');
  eq(Object.keys(db2.it.big).length,60,'entries unseen for 30 days are pruned: '+Object.keys(db2.it.big).length);
  var s5=C.ingest(db2,idx2,'big',now2.slice(0,10),'soft');
  eq(!!s5.suspect&&Object.keys(db2.it.big).length===60,true,'a sudden tiny list (error page) is still refused: nothing changed');
  // صفحه‌ی اولِ فیلترشده خالی (ولی بی‌فیلتر کالا هست) → بی‌فیلتر ادامه بده
  var s6={calls:[],get:async function(u){this.calls.push(u);var m=/[&?]page=(\d+)/.exec(u);if(/stock_status/.test(u))return {status:200,body:'[]'};if(+m[1]>1)return {status:400,body:'{"code":"rest_invalid_page_number"}'};return {status:200,body:JSON.stringify([mk(5,'عطر ادکلن الف | A',true,5000000)])}}};
  var r6=await C.wooSource('https://big.shop',s6,function(){},'full');
  eq(r6.items.length,1,'empty filtered page → retried without filter');
  eq(r6.complete,true,'unfiltered read keeps strict completion');
  // ---- ارتقا از ۱.۳۷: حافظه‌ی قدیمی (فقط ۹۰۰۰ تای اول، با ناموجودها) + اولین بروزرسانیِ «قیمت» با فیلتر ----
  var sOld=server('reject');C.useSz({});var rOld=await C.wooSource('https://big.shop',sOld,function(){},'full');
  var dbU=C.newDb(),idxU=C.dbIndex(dbU);C.ingest(dbU,idxU,'big',rOld.items,rOld.complete);dbU.t.big=Date.now();
  eq(C.buildList(dbU,['big'],{},0).some(function(g){return /کلینیک/.test(g.name)}),false,'before the upgrade Clinique is missing (the bug)');
  var sNew=server('ok');var rNew=await C.wooSource('https://big.shop',sNew,function(){},'price');
  var stU=C.ingest(dbU,idxU,'big',rNew.items,rNew.complete);
  eq(C.buildList(dbU,['big'],{},0).some(function(g){return /کلینیک/.test(g.name)&&g.sizes[0].price===13440000}),true,'first price update after the upgrade adds the old in-stock perfume: '+JSON.stringify(stU));
  // ---- جستجوی زنده: عطرِ موجودِ قدیمی در میان ده‌ها ناموجودِ تازه‌تر ----
  var SR=[];for(var z=0;z<30;z++){var inS=(z===25);SR.push({id:1000-z,name:'عطر ادکلن کلینیک هپی مدل '+z+' | Clinique Happy '+z,permalink:'https://liliome.com/shop/c'+z+'/',images:[],categories:[{name:'Clinique'}],type:'simple',is_in_stock:inS,is_purchasable:inS,is_on_backorder:false,prices:pr(inS?13440000:0)})}
  function searchNet(filterMode){return {calls:[],get:async function(u){this.calls.push(u);var l=SR;if(/stock_status=instock/.test(u)){if(filterMode==='reject')return {status:400,body:'{"code":"rest_invalid_param"}'};if(filterMode!=='ignore')l=SR.filter(function(x){return x.is_in_stock})}return {status:200,body:JSON.stringify(l.slice(0,12))}}}}
  var sn1=searchNet('ok'),lv=(await C.liveSearch('کلینیک هپی',sn1,['liliome'],{}));
  eq(lv.items.length>0&&lv.items[0].price===13440000&&/Happy 25/.test(lv.items[0].t),true,'live search: the old in-stock perfume comes first, not lost behind 12 newer sold-out ones: '+JSON.stringify(lv.items.slice(0,2).map(function(x){return [x.t,x.price]})));
  eq(lv.items.length,13,'sold-out ones are still shown after it (12 + 1): '+lv.items.length);
  var sn2=searchNet('reject'),lv2=(await C.liveSearch('کلینیک هپی',sn2,['liliome'],{}));
  eq(lv2.items.length,12,'site rejecting the stock filter: plain search still works: '+lv2.items.length);
  var sn3=searchNet('ignore'),lv3=(await C.liveSearch('کلینیک هپی',sn3,['liliome'],{}));
  eq(lv3.items.length,12,'site ignoring the stock filter: no duplicates: '+lv3.items.length);
  console.log(ok,'ok',bad,'bad');process.exit(bad?1:0);
})();
