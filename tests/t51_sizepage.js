// محصولی که در فهرست اندازه ندارد: از ویژگی‌های API یا از صفحه‌ی خودِ محصول خوانده می‌شود؛ نتیجه نگه داشته می‌شود
global.DOMParser=undefined;global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))}}
function pr(v){return {price:String(v),regular_price:String(v),currency_code:'IRT',currency_minor_unit:0}}
var items=[
 {id:1,name:'عطر ادکلن کلینیک هپی مردانه | Clinique Happy',type:'simple',is_in_stock:true,short_description:'',permalink:'https://liliome.com/shop/happy-m/',prices:pr(13440000),images:[],categories:[{name:'Clinique (کلینیک)'}]},
 {id:2,name:'عطر ادکلن کلینیک هپی زنانه | Clinique Happy',type:'simple',is_in_stock:true,short_description:'',permalink:'https://liliome.com/shop/happy-w/',prices:pr(11040000),images:[],categories:[{name:'Clinique (کلینیک)'}]},
 {id:3,name:'عطر ادکلن کلینیک سیمپلی | Clinique Simply',type:'simple',is_in_stock:true,short_description:'',attributes:[{name:'سایز',terms:[{name:'۵۰ میل'}]}],permalink:'https://liliome.com/shop/simply/',prices:pr(9000000),images:[],categories:[{name:'Clinique (کلینیک)'}]},
 {id:4,name:'عطر ادکلن کلینیک چمیستری | Clinique Chemistry',type:'simple',is_in_stock:true,short_description:'',attributes:[{name:'سایز',terms:[{name:'50 میل'},{name:'100 میل'}]}],permalink:'https://liliome.com/shop/chem/',prices:pr(9500000),images:[],categories:[{name:'Clinique (کلینیک)'}]},
];
var PAGE2='<table class="shop_attributes"><tr><th>سایز</th><td>50 میل، 100 میل</td></tr></table>';
var PAGE='<html><body><h1>x</h1><table class="woocommerce-product-attributes shop_attributes"><tr class="woocommerce-product-attributes-item"><th>سایز</th><td><p>100 میل</p></td></tr><tr><th>جنسیت</th><td>مردانه</td></tr></table><div class="related">حجم 30 میل</div></body></html>';
var fetched=[];
var net={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);if(m){if(+m[1]>1)return {status:400,body:'{}'};return {status:200,body:JSON.stringify(items)}}
  fetched.push(u);if(/happy-m/.test(u))return {status:200,body:PAGE};if(/happy-w/.test(u))return {status:200,body:'<html>بدون جدول</html>'};return {status:200,body:PAGE}}};
(async function(){
  var sz={};C.useSz(sz);
  var r=await C.wooSource('https://liliome.com',net,function(){},'full'),by={};r.items.forEach(function(x){by[x.id]=x});
  eq(/100 میل/.test(by[1].t),true,'size from product page: '+by[1].t);
  eq(C.parseTitle(by[1].t).ml,100,'parsed 100');
  eq(/میل/.test(by[2].t),false,'page without table: still no size');
  eq(C.parseTitle(by[3].t).ml,50,'size from API attribute (one term) without page fetch: '+by[3].t);
  eq(fetched.some(function(u){return /simply/.test(u)}),false,'attribute size → no page fetch');
  eq(C.parseTitle(by[4].t)===null&&!fetched.some(function(u){return /chem/.test(u)}),true,'multi-size product is not guessed: '+by[4].t);
  eq(/اندازه از صفحه‌ی محصول 1/.test(r.note),true,'note: '+r.note);
  eq(sz['https://liliome.com|1'][0],100,'cached size'); eq(sz['https://liliome.com|2'][0],0,'cached miss');
  var n1=fetched.length;
  var r2=await C.wooSource('https://liliome.com',net,function(){},'full');
  eq(fetched.length,n1,'second run does not fetch again');
  eq(/100 میل/.test(r2.items.filter(function(x){return x.id===1})[0].t),true,'cached size applied on second run');
  // ingest: عطر نمایش داده می‌شود
  var db=C.newDb(),idx=C.dbIndex(db);C.ingest(db,idx,'liliome',r.items,true);db.t.liliome=Date.now();
  var l=C.buildList(db,['liliome'],{},0);
  eq(l.some(function(g){return /هپی/.test(g.name)&&g.sizes[0].ml===100&&g.sizes[0].price===13440000}),true,'Happy men is in the list with size and sale price');
  // محدودیت: حداکثر ۴۰ صفحه در هر بار
  var many=[];for(var i=0;i<100;i++)many.push({id:1000+i,name:'عطر ادکلن تست '+i+' | Test '+i,type:'simple',is_in_stock:true,short_description:'',permalink:'https://liliome.com/shop/t'+i+'/',prices:pr(5000000),images:[],categories:[]});
  items=many;fetched=[];C.useSz({});
  await C.wooSource('https://liliome.com',net,function(){},'full');
  eq(fetched.length,40,'at most 40 page fetches per run: '+fetched.length);
  // حالت قیمت (بدون نام) صفحه نمی‌خواند
  fetched=[];await C.wooSource('https://liliome.com',net,function(){},'price');
  eq(fetched.length,0,'price mode never fetches pages');
  fetched=[];C.useSz({});items=[{id:9,name:'عطر ادکلن چند اندازه | Multi',type:'simple',is_in_stock:true,short_description:'',permalink:'https://liliome.com/shop/multi/',prices:pr(7000000),images:[],categories:[]}];
  var net0=net.get;net.get=async function(u){if(/multi/.test(u))return {status:200,body:PAGE2};return net0(u)};
  var rm=await C.wooSource('https://liliome.com',net,function(){},'full');
  eq(/میل/.test(rm.items[0].t),false,'page with several sizes is not guessed: '+rm.items[0].t);
  console.log(ok,'ok',bad,'bad'); process.exit(bad?1:0);
})();
