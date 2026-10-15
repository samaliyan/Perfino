import json, asyncio, os, re
from playwright.async_api import async_playwright
ROOT='/home/claude/PerfumePrice/app/src/main/assets/www'
FX=open('/home/claude/PerfumePrice/tests/fixtures.json').read()
STUB="""
window.__FX=%s;
(function(){
 var F=window.__FX;
 function resp(u){
  var m;
  if(u.indexOf('liliome.com/wp-json')>=0){m=/[?&]page=(\\d+)/.exec(u);var pgn=+m[1];if(pgn>F.liliome.length)return {s:400,b:'{"code":"rest_post_invalid_page_number"}'};var arr=F.liliome[pgn-1]||[];if(u.indexOf('_fields=')>=0&&!window.__NOFIELDS){arr=arr.map(function(x){return {id:x.id,prices:x.prices,price_html:x.price_html,is_in_stock:x.is_in_stock,type:x.type}})}return {s:200,b:JSON.stringify(arr)}}
  if(u.indexOf('api.digikala.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:JSON.stringify({data:{products:F.digikala[+m[1]-1]||[],pager:{total_pages:F.digikala.length}}})}}
  if(u.indexOf('/wp-json')>=0)return {s:404,b:'{"code":"rest_no_route"}'};
  if(u.indexOf('safirstores.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:F.safirPages[(m?+m[1]:1)-1]||'<html></html>'}}
  if(u.indexOf('hilandbeauty.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:F.hilandPages[(m?+m[1]:1)-1]||'<html></html>'}}
  return {s:404,b:'nf'};
 }
 window.__calls=[];window.__bytes=0;
 window.Native={listImgs:function(){return localStorage.getItem('imgcache')||'{}'},cacheImg:function(id,u){window.__imgReq=(window.__imgReq||[]);window.__imgReq.push(id+'|'+u);setTimeout(function(){var c=JSON.parse(localStorage.getItem('imgcache')||'{}');c[id]='data:image/svg+xml;utf8,<svg xmlns=%%22http://www.w3.org/2000/svg%%22 width=%%2240%%22 height=%%2240%%22><rect width=%%2240%%22 height=%%2240%%22 fill=%%22%%23c33%%22/></svg>';localStorage.setItem('imgcache',JSON.stringify(c));window.__imgDone&&window.__imgDone(id,c[id])},5)},fetch:function(id,url,h){window.__calls.push(url);var r=window.__MODE&&window.__MODE(url)||resp(url);window.__bytes+=(r.b||'').length;setTimeout(function(){window.__nat(id,r.s,r.b)},window.__DELAY||3)},copy:function(t){window.__copied=t},setBars:function(c,l){window.__bars=[c,l]}};
})();
"""%FX
async def new_page(p, w=360,h=780, scheme='dark', stub=STUB, extra=None, mobile=True, adv=True):
    b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
    ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,has_touch=mobile,is_mobile=mobile,device_scale_factor=2 if mobile else 1)
    IMG=b'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#fff"/><rect x="82" y="20" width="36" height="30" fill="#c9a24a"/><rect x="60" y="50" width="80" height="130" rx="14" fill="#9cc7f0"/><rect x="75" y="100" width="50" height="40" fill="#fff" opacity=".8"/></svg>'
    async def h(route):
        r=route.request
        if r.url.startswith('file:'): return await route.continue_()
        if r.resource_type=='image' and os.environ.get('NOIMG')!='1': return await route.fulfill(status=200,content_type='image/svg+xml',body=IMG)
        return await route.abort()
    await ctx.route('**/*',h)
    pg=await ctx.new_page()
    errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    if adv: await pg.add_init_script("window.__forceAdv=1;document.addEventListener('DOMContentLoaded',function(){var e=document.getElementById('sAdv');if(e)e.style.display='';});")
    await pg.add_init_script("window.__NOGHOST=1;")      # نگهبانِ لمسِ اتفاقی در آزمایش‌ها خاموش است (لمس‌های پشت‌سرهمِ آزمایش لمسِ دوبارهٔ پدر نیستند)؛ آزمایشِ خودِ نگهبان آن را روشن می‌کند
    if stub: await pg.add_init_script(stub)
    if extra: await pg.add_init_script(extra)
    return b,ctx,pg,errs
async def wait_ready(pg,timeout=60000):
    await pg.wait_for_function("window.__pp && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=timeout)
