// دور ۱ بازبینی سخت‌گیرانه: ردیف‌های خراب، ک/ی عربی، عنوان غول‌پیکر، ناهمزمان بودن reconcile، حافظه‌ی برند
global.DOMParser=undefined;global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;C.CFG.retryMs=3;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))}}
function pr(v){return {price:String(v),regular_price:String(v),currency_code:'IRT',currency_symbol:'تومان',currency_minor_unit:0,price_range:null}}
function mk(id,name,cat){return {id:id,name:name,slug:'p'+id,type:'simple',is_in_stock:true,is_purchasable:true,is_on_backorder:false,short_description:'<table><tr><td>سایز</td><td>100 میل</td></tr></table>',prices:pr(5000000+id),categories:cat===undefined?[{name:'عطر'}]:cat,images:[],attributes:[]}}
(async function(){
  C.useSz({});
  // ۱) ردیف‌های خراب (null، categories نادرست) کلِ فروشگاه را نمی‌اندازند
  var page=[mk(1,'عطر ادکلن الف | A'),null,mk(2,'عطر ادکلن ب | B',[null]),mk(3,'عطر ادکلن پ | P','عطر'),mk(4,'عطر ادکلن ت | T')];
  var net={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);return +m[1]===1?{status:200,body:JSON.stringify(page)}:{status:400,body:'{"code":"rest_invalid_page_number"}'}}};
  var r=await C.wooSource('https://x.shop',net,function(){},'full');
  eq(r.items.length>=3,true,'bad rows are skipped, the rest arrive: '+r.items.length);
  // ۲) ک و ی عربی در عنوان و دسته: عطر است
  var net2={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);return +m[1]===1?{status:200,body:JSON.stringify([mk(10,'ادكلن مردانه ورساچه اروس 100 ميل',[{name:'ادكلن مردانه'}])])}:{status:400,body:'{"code":"rest_invalid_page_number"}'}}};
  var r2=await C.wooSource('https://x.shop',net2,function(){},'full');
  eq(r2.items.map(function(x){return x.st}),[0],'Arabic ك/ي perfume is not rejected as non-perfume');
  // ۳) محصول غیرعطر هنوز رد می‌شود
  var net3={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);return +m[1]===1?{status:200,body:JSON.stringify([mk(11,'کرم مرطوب کننده نیوآ 100 میل',[{name:'مراقبت پوست'}])])}:{status:400,body:'{"code":"rest_invalid_page_number"}'}}};
  var r3=await C.wooSource('https://x.shop',net3,function(){},'full');
  eq(r3.items.map(function(x){return x.st}),[2],'a face cream is still not a perfume');
  // ۴) عنوان غول‌پیکر: کوتاه می‌شود و زمان معقول است
  var db=C.newDb(),idx=C.dbIndex(db),t0=Date.now();
  C.ingest(db,idx,'s',[{id:1,t:'عطر ادکلن '+new Array(30000).join('1')+' 100 میل',price:5000000,st:0,img:'',big:'',b:[]}],true);
  eq(Date.now()-t0<6000,true,'huge title is cheap: '+(Date.now()-t0));
  // ۵) ingestAsync بدون خطا و با همان نتیجه‌ی ingest
  var BRS=['دیور','شنل','گوچی','ورساچه','پرادا','هرمس','لانکوم','ژیوانشی'],WS='ساواج بلو نایت رویال دارک عود امبر گلد سیلور فانتوم اینتنس ایکون جادور نوآر بلوم دیزایر ریزرو ویکتوری سنتس رز موسک وانیل سدر'.split(' ');
  var items=[];for(var i=0;i<600;i++)items.push({id:i+1,t:'عطر ادکلن '+BRS[i%8]+' '+WS[Math.floor(i/8)%24]+' '+WS[(i*5+Math.floor(i/24))%24]+' ادوپرفیوم 100 میل',price:6000000+i,st:0,img:'',big:'',b:[]});
  var dbG=C.newDb();C.ingest(dbG,C.dbIndex(dbG),'s',items,true);eq(Object.keys(dbG.g).length>100,true,'test data makes real groups: '+Object.keys(dbG.g).length);
  var dbA=C.newDb(),dbS=C.newDb();
  var sA=await C.ingestAsync(dbA,C.dbIndex(dbA),'s',items,true),sS=C.ingest(dbS,C.dbIndex(dbS),'s',items,true);
  eq([sA.added,sA.merged|0],[sS.added,sS.merged|0],'async ingest equals sync ingest');
  eq(Object.keys(dbA.g).length,Object.keys(dbS.g).length,'same groups');
  // ۶) reconcile ناهمزمان در میان کار ایستگاه می‌دهد (صفحه قفل نمی‌شود)
  var fired=false;setTimeout(function(){fired=true},0);
  var dbB=C.newDb(),idxB=C.dbIndex(dbB);C.ingest(dbB,idxB,'s',items,true);
  var dbC=C.newDb(),idxC=C.dbIndex(dbC);C.ingest(dbC,idxC,'s',items,true);
  fired=false;setTimeout(function(){fired=true},0);
  var ra=await C.reconcileAsync(dbB,idxB),rs=C.reconcile(dbC,idxC);
  eq(fired,true,'a timer fires while reconcileAsync runs (page is not locked)');
  eq(ra,rs,'async and sync reconcile move the same number of groups');
  // ۷) عنوان چنداندازه‌ای رد می‌شود؛ «Armani Code 2024» نامش را نگه می‌دارد؛ ردیف null در صفحه‌ی دوم فروشگاه را نمی‌اندازد
  ['Dior Sauvage 60/100/200ml','عطر دیور ساواج 30 - 50 - 100 میل','عطر دیور ساواج 60 و 100 میل'].forEach(function(t){eq(C.parseTitle(t),null,'multi-size title rejected: '+t)});
  ['Chanel 19, 100ml','Kayali Vanilla 28 - 100ml','Le Labo Santal 33 - 100ml','Carolina Herrera 212 - 100ml'].forEach(function(t){var r=C.parseTitle(t);eq(!!r&&r.ml,100,'product number before size is not a second size: '+t)});
  var ac=C.parseTitle('Armani Code 2024 EDP 75ml');eq(ac&&ac.key.join(' '),'giorgio armani code','Armani Code keeps "code" when a year follows');
  eq(C.parseTitle('عطر ادکلن دیور ساواج کد 12345 100 میل').key.join(' '),'دیور ساواج','a real product code is still removed');
  eq(C.parseTitle('Dior Sauvage EDP 100ml').ml,100,'normal title unchanged');
  var pg1=[];for(var u=0;u<100;u++)pg1.push(mk(500+u,'عطر ادکلن برند '+u+' | B'+u));
  var net7={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);var p=+m[1];if(p===1)return {status:200,body:JSON.stringify(pg1)};if(p===2)return {status:200,body:JSON.stringify([null].concat(pg1.slice(0,0)).concat([mk(900,'عطر ادکلن آخر | Last')]))};return {status:400,body:'{"code":"rest_invalid_page_number"}'}}};
  var r7=await C.wooSource('https://x.shop',net7,function(){},'full');
  eq(r7.items.length,101,'null row on page 2 does not drop the shop: '+r7.items.length);
  console.log('PASS',ok,'FAIL',bad);process.exit(bad?1:0);
})();
