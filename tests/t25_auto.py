import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.set_viewport_size({'width':320,'height':640})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.wait_for_timeout(1500)
        chk('default auto is off',await pg.evaluate("!(+JSON.parse(localStorage.getItem('pp.set')||'{}').auto>0)"))
        # داده را «۲ ساعت قدیمی» کن
        await pg.evaluate("Object.keys(window.__pp.state.db.t).forEach(function(k){window.__pp.state.db.t[k]-=7200000})")
        n0=await pg.evaluate("window.__calls.length")
        await pg.evaluate("window.__resume()"); await pg.wait_for_timeout(1500)
        chk('manual mode: resume does not refresh old data',await pg.evaluate("window.__calls.length")==n0 and not await pg.evaluate("window.__pp.state.busy"))
        pill=await pg.evaluate("document.getElementById('updt').textContent")
        chk('pill is not red-stale after 2h in manual mode',not await pg.evaluate("document.getElementById('upd').classList.contains('stale')"),pill)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(800)
        r=await pg.evaluate("(function(){var a=[].slice.call(document.querySelectorAll('#sAuto button')).map(function(x){var q=x.getBoundingClientRect();return [x.textContent,Math.round(q.left),Math.round(q.right),Math.round(q.top),x.classList.contains('on')]});return a})()")
        print(r)
        chk('5 options on one row, none outside 320px',len(r)==5 and len({x[3] for x in r})==1 and all(x[1]>=0 and x[2]<=320 for x in r))
        chk('"off" is selected',r[0][4] and sum(1 for x in r if x[4])==1)
        await pg.evaluate("document.getElementById('sAuto').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/w/auto320.png')
        ov=await pg.evaluate("[].slice.call(document.querySelectorAll('#sAuto button')).filter(function(x){return x.scrollWidth>x.clientWidth+1}).length")
        chk('no button text overflows',ov==0,ov)
        await pg.evaluate("document.querySelector('#sAuto button[data-m=\"15\"]').click()"); await pg.wait_for_timeout(300)
        chk('choosing 15 min saves',await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).auto")==15)
        await pg.wait_for_function("window.__pp.state.busy===true || window.__calls.length>%d"%n0,timeout=8000)
        chk('auto 15 + data 2h old -> refresh starts',True)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        chk('no js errors',not errs,errs)
        print(len(OK),'pass',len(BAD),'fail'); await b.close()
asyncio.run(main())
