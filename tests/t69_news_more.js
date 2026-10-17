// خبرهای قدیمی‌تر با اسکرول: صفحه‌به‌صفحه، بدون تکرار، سقف، خطا، سایتی که وردپرسش در /mag است
global.DOMParser=undefined;global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function chk(c,m){if(c)ok++;else{bad++;console.log('FAIL',m)}}
var NOW=Date.now(),H=3600e3;
function post(site,i,link){return {id:i,date_gmt:new Date(NOW-i*H*5).toISOString().slice(0,19),link:link,title:{rendered:site+' خبر عطر '+i},excerpt:{rendered:'<p>خلاصه '+i+'</p>'},content:{rendered:''}}}
function mkSite(site,host,total,root){ // root: مسیر وردپرس ('' یا '/mag')
  return function(u){
    var m=new RegExp('^https://'+host.replace(/\./g,'\\.')+root+'/wp-json/wp/v2/posts\\?per_page=10&_embed=1(?:&page=(\\d+))?').exec(u);
    if(!m)return null;
    var pg=+(m[1]||1),a=[];for(var i=(pg-1)*10;i<Math.min(total,pg*10);i++)a.push(post(site,i+1,'https://'+host+'/n/'+site+(i+1)+'/'));
    if(pg>1&&!a.length)return {status:400,body:'{"code":"rest_post_invalid_page_number"}'};
    return {status:200,body:JSON.stringify(a)}}}
var sites=[mkSite('L','liliome.com',33,''),mkSite('S','www.safirstores.com',12,'/mag'),mkSite('H','hilandbeauty.com',0,'')];
var calls=[];
function net(){return {get:async function(u){calls.push(u);for(var i=0;i<sites.length;i++){var r=sites[i](u);if(r)return r}return {status:404,body:''}}}}
(async function(){
  var n=net(),r=await C.fetchNews(n);
  chk(r.items.length<=24&&r.items.length>=12,'first load: '+r.items.length);
  var per={};r.items.forEach(function(x){per[x.s]=(per[x.s]|0)+1});
  chk((per.liliome|0)<=6&&(per.safir|0)<=6,'at most 6 per site: '+JSON.stringify(per));
  chk(r.st&&r.st.liliome&&r.st.liliome.pend.length===4&&r.st.liliome.page===1&&!r.st.liliome.end,'liliome state keeps the 4 unseen of page 1');
  chk(r.st.safir&&r.st.safir.page===1&&r.st.safir.pend.length===4,'safir (WP under /mag) works: '+JSON.stringify(r.st.safir&&r.st.safir.pend.length));
  chk(r.st.hiland&&r.st.hiland.end===true,'empty site is finished');
  chk(calls.some(function(u){return /safirstores\.com\/mag\/wp-json/.test(u)}),'/mag base was tried');
  var have={};r.items.forEach(function(x){have[x.u]=1});
  var allNew=[],rounds=0,st=r.st,res;
  do{ calls.length=0; res=await C.newsMore(n,st,have); st=res.st; rounds++;
    res.items.forEach(function(x){chk(!have[x.u],'no duplicate '+x.u);have[x.u]=1;allNew.push(x)});
    for(var i=1;i<res.items.length;i++)chk(res.items[i-1].d>=res.items[i].d,'each batch is newest-first');
    chk(res.items.length<=18,'batch ≤ 6 per site');
  }while(!res.done&&rounds<20);
  chk(res.done,'finally done after '+rounds+' rounds');
  var L=allNew.filter(function(x){return x.s==='liliome'}).length+Object.keys(per).length*0, Lshown=r.items.filter(function(x){return x.s==='liliome'}).length;
  chk(Lshown+allNew.filter(function(x){return x.s==='liliome'}).length===33,'every liliome post appears exactly once: '+(Lshown+L));
  chk(r.items.filter(function(x){return x.s==='safir'}).length+allNew.filter(function(x){return x.s==='safir'}).length===12,'every safir post appears exactly once');
  // یک بار دیگر بعد از پایان: درخواستی نمی‌رود
  calls.length=0;var again=await C.newsMore(n,st,have);chk(again.done&&again.items.length===0&&calls.length===0,'nothing asked after the end: '+calls.length);
  // بدون وضعیتِ قبلی (خبر از حافظه آمده): از صفحه‌ی ۱ شروع می‌کند و تکراری‌ها را رد می‌کند
  var have2={};r.items.forEach(function(x){have2[x.u]=1});
  var fresh=await C.newsMore(n,null,have2);
  chk(fresh.items.length>0&&fresh.items.every(function(x){return !have2[x.u]}),'no previous state: still gives new items: '+fresh.items.length);
  // اینترنت قطع
  var dead={get:async function(){return {status:0,body:'offline'}}};
  var d=await C.newsMore(dead,null,{});
  chk(d.items.length===0&&d.failed===true,'offline: failed flag');
  // ۴۰۰ِ فایروال (بدونِ «page_number») پایانِ فهرست نیست
  var fw={get:async function(u){if(!/liliome\.com\/wp-json/.test(u))return {status:404,body:''};if(/&page=/.test(u))return {status:400,body:'<html>blocked</html>'};return {status:200,body:JSON.stringify(Array.from({length:10},function(_,i){return post('F',i+1,'https://liliome.com/f/'+(i+1)+'/')}))}}};
  var f1=await C.fetchNews(fw,['liliome']);var f2=await C.newsMore(fw,f1.st,(function(){var h={};f1.items.forEach(function(x){h[x.u]=1});return h})());
  chk(f2.st.liliome.failed===true&&f2.st.liliome.end===false,'firewall 400 on page 2 is a failure (retry later), not the end');
  // سقفِ صفحه: سایتی که هیچ‌وقت تمام نمی‌شود
  var inf={get:async function(u){var m=/liliome\.com.*?(?:&page=(\d+))?$/.exec(u);if(!/liliome\.com\/wp-json/.test(u))return {status:404,body:''};var pg=+((/&page=(\d+)/.exec(u)||[0,1])[1]);var a=[];for(var i=0;i<10;i++)a.push(post('I',pg*100+i,'https://liliome.com/i/'+(pg*100+i)+'/'));return {status:200,body:JSON.stringify(a)}}};
  var h2={},st2=null,rr,k=0;do{rr=await C.newsMore(inf,st2,h2);st2=rr.st;rr.items.forEach(function(x){h2[x.u]=1});k++}while(!rr.done&&k<60);
  chk(rr.done&&Object.keys(h2).length<=120,'endless site stops at the page cap: '+Object.keys(h2).length+' items, '+k+' rounds');
  console.log(ok,'ok',bad,'bad');process.exit(bad?1:0);
})();
