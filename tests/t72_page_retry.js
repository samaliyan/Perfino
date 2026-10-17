// صفحه‌های خراب (۴۲۹/۵۰۰/بی‌پاسخ) نباید باعث شوند محصولاتِ آن صفحه‌ها هرگز وارد حافظه نشوند (گزارش واقعی: ۳۶ از ۹۰ صفحه‌ی لیلیوم خطا داده بود)
global.DOMParser=undefined;global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;C.CFG.retryMs=3;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))}}
function pr(v){return {price:String(v),regular_price:String(v),currency_code:'IRT',currency_symbol:'تومان',currency_minor_unit:0,price_range:null}}
function mk(id,name){return {id:id,name:name,slug:'p'+id,type:'simple',is_in_stock:true,is_purchasable:true,is_on_backorder:false,short_description:'<table><tr><td>سایز</td><td>100 میل</td></tr></table>',prices:pr(5000000+id),categories:[{name:'عطر'}],images:[],attributes:[]}}
var ALL=[];for(var i=0;i<4500;i++)ALL.push(mk(100000-i,'عطر ادکلن تست '+i+' | Test'+i));      // ۴۵ صفحه
// pages in `flaky` fail the first `n` times with `st` (0 = network error), pages in `dead` always fail
function server(o){var calls=[],tries={},active=0,maxActive=0;return {calls:calls,maxActive:function(){return maxActive},get:async function(u){
  calls.push(u);var m=/[?&]page=(\d+)/.exec(u);if(!m)return {status:404,body:''};var pg=+m[1];
  active++;if(active>maxActive)maxActive=active;await new Promise(function(r){setTimeout(r,1)});active--;
  tries[pg]=(tries[pg]||0)+1;
  if(o.dead&&o.dead.indexOf(pg)>=0){if(o.st===0)throw new Error('timeout');return {status:o.st||503,body:''}}
  if(o.flaky&&o.flaky.indexOf(pg)>=0&&tries[pg]<=o.n){if(o.st===0)throw new Error('timeout');return {status:o.st||429,body:''}}
  var a=ALL.slice((pg-1)*100,pg*100);
  if(pg>1&&!a.length)return {status:400,body:'{"code":"rest_invalid_page_number"}'};
  return {status:200,body:JSON.stringify(a)}}}}
function range(a,b){var r=[];for(var i=a;i<=b;i++)r.push(i);return r}
(async function(){
  C.useSz({});
  // ۱) نیمی از صفحه‌ها اول ۴۲۹ می‌دهند و بعد خوب می‌شوند: همه‌ی ۴۵۰۰ محصول باید برسد و دریافت «کامل» باشد
  var s1=server({flaky:range(5,40),n:4,st:429});
  var r1=await C.wooSource('https://x.shop',s1,function(){},'full');
  eq(r1.items.length,4500,'all products arrive although many pages first answered 429: '+r1.items.length);
  eq(r1.complete,'soft','recovered run counts as complete: '+r1.note);
  eq(/ناقص/.test(r1.note),false,'no "incomplete" note when everything was recovered: '+r1.note);
  // ۲) خطای شبکه (بدون پاسخ)
  var s2=server({flaky:range(10,30),n:5,st:0});
  var r2=await C.wooSource('https://x.shop',s2,function(){},'price');
  eq(r2.items.length,4500,'network errors recovered too: '+r2.items.length);
  // ۳) چند صفحه همیشه خراب: بقیه می‌رسد، ناقص گزارش می‌شود، دلیل در یادداشت است
  var s3=server({dead:[7,8,33],st:503});
  var r3=await C.wooSource('https://x.shop',s3,function(){},'full');
  eq(r3.items.length,4200,'only the 3 dead pages are missing: '+r3.items.length);
  eq(r3.complete,false,'dead pages → not complete');
  eq(/ناقص: 3 صفحه/.test(r3.note)&&/HTTP 503×3/.test(r3.note),true,'note says how many pages and why: '+r3.note);
  // ۴) فشار کم می‌شود وقتی سایت خطا می‌دهد (هم‌زمانی از ۴ پایین می‌آید)
  var s4=server({flaky:range(2,12),n:2,st:429});
  await C.wooSource('https://x.shop',s4,function(){},'full');
  eq(s4.maxActive()<=4,true,'never more than 4 at once: '+s4.maxActive());
  // ۵) سایتی که کاملاً از کار افتاده: بعد از چند دسته دست می‌کشد (۹۰ صفحه‌ی بیهوده نمی‌خواهد)
  var s5=server({dead:range(2,200),st:503});
  var r5=await C.wooSource('https://x.shop',s5,function(){},'full');
  eq(r5.items.length,100,'only page 1 got through: '+r5.items.length);
  eq(r5.complete,false,'dead site → not complete');
  eq(s5.calls.length<=150,true,'gives up instead of hammering the site: '+s5.calls.length);
  // ۶) صفحه‌ی خراب آن‌طرفِ پایانِ فهرست خرابی حساب نمی‌شود
  var s6=server({dead:[46,47,48],st:503});      // فهرست ۴۵ صفحه است؛ ۴۶ به بعد ۴۰۰ می‌دهد اما اینجا ۵۰۳؛ دوباره‌خوانی هم ۵۰۳ می‌دهد
  var r6=await C.wooSource('https://x.shop',s6,function(){},'full');
  eq(r6.items.length,4500,'all real products read: '+r6.items.length);
  // ۷) فایروال به‌جای صفحه‌ی خراب، دوباره صفحه‌ی ۱ را می‌دهد: «موفق» حساب نشود
  var s7=server({flaky:[9],n:3,st:503}),g7=s7.get;
  s7.get=async function(u){var r=await g7(u);if(/[?&]page=9(&|$)/.test(u)&&r.status===200)return {status:200,body:JSON.stringify(ALL.slice(0,100))};return r};
  var r7=await C.wooSource('https://x.shop',s7,function(){},'full');
  eq(r7.complete,false,'duplicate answer for a failed page is not counted as recovered: '+r7.note);
  eq(r7.items.length,4400,'page 9 still missing, no duplicates: '+r7.items.length);
  // ۸) فهرستِ زنده وسط کار جابه‌جا می‌شود (۱۰ محصول تکراری بین دو صفحه): هر محصول یک بار
  var s8=server({}),g8=s8.get;
  s8.get=async function(u){var m=/[?&]page=(\d+)/.exec(u);if(m&&+m[1]===6){var pg=ALL.slice(490,590);return {status:200,body:JSON.stringify(pg)}}return g8(u)};
  var r8=await C.wooSource('https://x.shop',s8,function(){},'full');
  var seen={};r8.items.forEach(function(x){seen[x.id]=(seen[x.id]||0)+1});
  eq(Object.keys(seen).every(function(k){return seen[k]===1}),true,'no product twice');
  console.log('PASS',ok,'FAIL',bad);process.exit(bad?1:0);
})();
