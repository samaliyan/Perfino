import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
FAST="Object.defineProperty(window,'Core',{configurable:true,set:function(v){v.CFG.retryMs=5;Object.defineProperty(window,'Core',{value:v,writable:true,configurable:true})}});"
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=FAST)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(800)
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk('no change run says nothing changed',('چیزی عوض نشد' in rep),rep)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        await pg.evaluate("window.__PRICEUP=true")
        await pg.evaluate("(function(){window.__MODE=function(u){if(u.indexOf('liliome.com')>=0){var m=/[?&]page=(\\d+)/.exec(u);var pg=m?+m[1]:1;var arr=(window.__FX.liliome[pg-1]||[]).map(function(x){return {id:x.id,prices:{price:String(Math.round(parseFloat(x.prices.price)*1.12/1000)*1000),currency_code:'IRT',currency_minor_unit:0},is_in_stock:x.is_in_stock,type:x.type}});if(pg>window.__FX.liliome.length)return {s:400,b:'{}'};return {s:200,b:JSON.stringify(arr)}}return null}})()")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk('price change run says what changed',('قیمت عوض شد' in rep and 'بله، چیزی بروز شد' in rep and 'گران‌تر' in rep),rep)
        run=await pg.evaluate("JSON.parse(localStorage.getItem('pp.run'))")
        chk('run saved with diff',run and run['chg'] and (run['chg']['up']+run['chg']['down'])>0 and len(run['src'])==4,run)
        chk('no js errors',not errs,errs)
        await b.close()
        print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
