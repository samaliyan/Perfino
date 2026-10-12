// لیلیوم: اندازه/جنسیت/غلظت از توضیحات و دسته‌بندی؛ برند از دسته‌بندی. (نمونه‌ها شبیه خروجی واقعی‌اند که با WebFetch دیده شد)
global.DOMParser=undefined;
var C=require('../app/src/main/assets/www/core.js'), ok=0, bad=0;
function eq(a,b,m){ if(JSON.stringify(a)===JSON.stringify(b)){ok++}else{bad++;console.log('FAIL',m,'\n  got',JSON.stringify(a),'\n  exp',JSON.stringify(b))} }
function table(rows){return '<table><tbody>'+rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table>'}
var items=[
 {id:1,name:'عطر ادکلن دولچه گابانا د وان الکسیر پور فم | Dolce & Gabbana The One Elixir Pour Femme',type:'simple',is_in_stock:true,short_description:table([['سایز','۱۰۰ میل'],['طبع','گرم'],['جنسیت','زنانه'],['نوع عطر','ادو پرفیوم']]),prices:{price:'12500000',currency_code:'IRT',currency_minor_unit:0},images:[{thumbnail:'https://l/a-200.jpg',src:'https://l/a.jpg'}],categories:[{name:'Dolce & Gabbana'},{name:'ادکلن زنانه'}]},
 {id:2,name:'عطر ادکلن تاور پرفیومز پچ ابسولو | Tauer Perfumes Patch Absolue',type:'simple',is_in_stock:true,short_description:table([['سایز','50 ml'],['جنسیت','یونیسکس']]),prices:{price:'30000000',currency_code:'IRT',currency_minor_unit:0},images:[],categories:[{name:'Tauer Perfumes'},{name:'ادکلن مردانه'},{name:'ادکلن زنانه'}]},
 {id:3,name:'عطر ادکلن شنل بلو دو شنل ادو پرفیوم 100 میل',type:'simple',is_in_stock:true,short_description:'',prices:{price:'0',currency_code:'IRT',currency_minor_unit:0},price_html:'<span class="price"><del>۱۸٬۰۰۰٬۰۰۰</del> <ins>۱۶٬۵۰۰٬۰۰۰ تومان</ins></span>',images:[],categories:[{name:'Chanel'}]},
 {id:4,name:'عطر ادکلن ناشناس بدون مشخصات',type:'simple',is_in_stock:true,short_description:'',prices:{price:'5000000',currency_code:'IRT',currency_minor_unit:0},images:[],categories:[]},
 {id:5,name:'عطر ادکلن ناموجود | X',type:'simple',is_in_stock:false,short_description:table([['سایز','۱۰۰ میل']]),prices:{price:'0',currency_code:'IRT',currency_minor_unit:0},images:[],categories:[]},
];
var net={get:async function(u){var m=/[?&]page=(\d+)/.exec(u);if(+m[1]>1)return {status:400,body:'{}'};return {status:200,body:JSON.stringify(items)}}};
(async function(){
  var r=await C.wooSource('https://liliome.com',net,function(){},'full');
  var by={};r.items.forEach(function(x){by[x.id]=x});
  eq(/100 میل/.test(by[1].t)&&/زنانه/.test(by[1].t)&&/ادوپرفیوم/.test(by[1].t),true,'item1 enriched: '+by[1].t);
  eq(C.parseTitle(by[1].t).ml,100,'item1 ml'); eq(C.parseTitle(by[1].t).gn,'w','item1 gender'); eq(C.parseTitle(by[1].t).conc,'ادوپرفیوم','item1 conc');
  eq(by[1].b,['Dolce & Gabbana'],'brand hint'); eq(by[1].big,'https://l/a.jpg','big image'); eq(by[1].img,'https://l/a-200.jpg','thumb');
  eq(C.parseTitle(by[2].t).ml,50,'item2 ml (ml latin)'); eq(C.parseTitle(by[2].t).gn,'u','item2 unisex (both cats / spec)');
  eq(by[3].price,16500000,'price from price_html lowest'); eq(by[3].st,0,'item3 in stock via price_html');
  eq(C.parseTitle(by[4].t),null,'item4 without size is skipped, not guessed');
  eq(by[5].st,1,'out of stock');
  eq(/بدون اندازه 1/.test(r.note),true,'diagnostic note counts missing size: '+r.note);
  // گروه‌بندی: همان عطر در دو سایت
  var db=C.newDb(),idx=C.dbIndex(db);
  C.ingest(db,idx,'liliome',r.items,true);
  C.ingest(db,idx,'digikala',[{id:9,t:'عطر ادکلن دولچه گابانا د وان الکسیر پور فم زنانه ادوپرفیوم 100 میل',price:12800000,img:'',st:0}],true);
  db.t.liliome=db.t.digikala=Date.now();
  var l=C.buildList(db,['liliome','digikala'],{liliome:1,digikala:1},0);
  var one=l.filter(function(g){return /وان/.test(g.name)});
  eq(one.length,1,'same perfume merged across sites'); eq(one[0].sizes[0].n,2,'two sources'); 
  var T=C.tree(l);
  var bn=T.map(function(b){return b.name});
  eq(bn.indexOf('دولچه و گابانا')>=0,true,'brand D&G from category hint: '+bn);
  eq(bn.indexOf('شنل')>=0,true,'brand Chanel: '+bn);
  var dg=T.filter(function(b){return b.name==='دولچه و گابانا'})[0];
  eq(dg.models.length,1,'one model'); eq(/دولچه|گابانا/.test(dg.models[0].name),false,'brand words stripped from model name: '+dg.models[0].name);
  eq(dg.models[0].variants[0].gn,'w','variant gender');
  console.log(ok+' passed, '+bad+' failed'); process.exit(bad?1:0);
})();
