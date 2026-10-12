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
  if(u.indexOf('liliome.com/wp-json')>=0){m=/[?&]page=(\\d+)/.exec(u);return {s:200,b:JSON.stringify(F.liliome[+m[1]-1]||[])}}
  if(u.indexOf('api.digikala.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:JSON.stringify({data:{products:F.digikala[+m[1]-1]||[],pager:{total_pages:F.digikala.length}}})}}
  if(u.indexOf('/wp-json')>=0)return {s:404,b:'{"code":"rest_no_route"}'};
  if(u.indexOf('safirstores.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:F.safirPages[(m?+m[1]:1)-1]||'<html></html>'}}
  if(u.indexOf('hilandbeauty.com')>=0){m=/page=(\\d+)/.exec(u);return {s:200,b:F.hilandPages[(m?+m[1]:1)-1]||'<html></html>'}}
  return {s:404,b:'nf'};
 }
 window.__calls=[];
 window.Native={fetch:function(id,url,h){window.__calls.push(url);var r=window.__MODE&&window.__MODE(url)||resp(url);setTimeout(function(){window.__nat(id,r.s,r.b)},3)},copy:function(t){window.__copied=t},setBars:function(c,l){window.__bars=[c,l]}};
})();
"""%FX
async def new_page(p, w=360,h=780, scheme='dark', stub=STUB, extra=None, mobile=True):
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
    if stub: await pg.add_init_script(stub)
    if extra: await pg.add_init_script(extra)
    return b,ctx,pg,errs
async def wait_ready(pg,timeout=60000):
    await pg.wait_for_function("window.__pp && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=timeout)
