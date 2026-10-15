import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
MOCK="""
window.__u={checks:0,dl:0,inst:0,code:100,latest:150,instOk:true};
(function(){var N=window.Native;
 N.appCode=function(){return window.__u.code};
 N.updCheck=function(){window.__u.checks++;setTimeout(function(){window.__updInfo&&window.__updInfo(window.__u.latest)},50)};
 N.updDownload=function(){window.__u.dl++;setTimeout(function(){window.__updReady&&window.__updReady(window.__u.latest)},50)};
 N.updInstall=function(){window.__u.inst++;return window.__u.instOk};
})();
"""
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra=MOCK)
        await pg.set_viewport_size({'width':320,'height':640})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.wait_for_function("window.__u.checks>=1",timeout=15000)
        await pg.wait_for_function("document.getElementById('updBox').classList.contains('on')",timeout=5000)
        u=await pg.evaluate("window.__u")
        chk('auto: checked, downloaded once, one prompt',u['checks']==1 and u['dl']==1,u)
        r=await pg.evaluate("(function(){var q=document.getElementById('updBox').getBoundingClientRect();var bs=[].slice.call(document.querySelectorAll('#updBox .btn')).map(function(x){var z=x.getBoundingClientRect();return [Math.round(z.left),Math.round(z.right),Math.round(z.height),x.scrollWidth>x.clientWidth+1]});return [Math.round(q.left),Math.round(q.right),Math.round(q.bottom),bs]})()")
        print(r)
        chk('prompt inside 320px, 2 buttons not overflowing, height>=44',r[0]>=0 and r[1]<=320 and len(r[3])==2 and all(x[2]>=44 and not x[3] for x in r[3]),r)
        await pg.screenshot(path='/tmp/w/upd320.png')
        txt=await pg.evaluate("document.getElementById('updTx').textContent")
        chk('single short text, persian only, no Install-anyway talk',('دوباره' in txt) and not any('a'<=c.lower()<='z' for c in txt),txt)
        chk('card has just two buttons: install / later',await pg.evaluate("document.querySelectorAll('#updBox .btn').length")==2 and (await pg.evaluate("document.getElementById('updGo').textContent"))=='نصب')
        await pg.evaluate("document.getElementById('updLater').click()")
        chk('later hides',not await pg.evaluate("document.getElementById('updBox').classList.contains('on')"))
        await pg.evaluate("window.__resume()"); await pg.wait_for_timeout(400)
        chk('no second check or download within 20 min (the card may come back when the app is opened again)',await pg.evaluate("window.__u.checks")==1 and await pg.evaluate("window.__u.dl")==1)
        # دستی: دوباره نشان بده
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(700)
        await pg.evaluate("document.getElementById('sUpd').click()"); await pg.wait_for_timeout(1000)
        chk('manual check re-asks',await pg.evaluate("document.getElementById('updBox').classList.contains('on')"))
        await pg.evaluate("document.getElementById('updGo').click()"); await pg.wait_for_timeout(200)
        chk('yes -> install called once',await pg.evaluate("window.__u.inst")==1)
        chk('install text tells what to press if the phone asks',('نصب' in await pg.evaluate("document.getElementById('updTx').textContent")))
        await pg.evaluate("window.__updErr('install 1')"); await pg.wait_for_timeout(200)
        chk('error hides box + toast',not await pg.evaluate("document.getElementById('updBox').classList.contains('on')"))
        # همان نسخه
        await pg.evaluate("window.__u.latest=100"); await pg.evaluate("document.getElementById('sUpd').click()"); await pg.wait_for_timeout(500)
        chk('same version -> says latest',('آخرین' in await pg.evaluate("document.getElementById('sUpdT').textContent")),await pg.evaluate("document.getElementById('sUpdT').textContent"))
        # خاموش
        await pg.evaluate("document.querySelector('#sUpdA button[data-v=\"0\"]').click()")
        chk('manual mode saved',await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).updAuto")==0)
        chk('no js errors',not errs,errs)
        await b.close()
        # حالت دستی از ابتدا: بررسی خودکار نداشته باشد
        b,ctx,pg,errs=await new_page(p,mobile=True,extra=MOCK)
        await pg.add_init_script("localStorage.setItem('pp.set',JSON.stringify({theme:'auto',model:'a',updAuto:0}))")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(10000)
        chk('updAuto=0: no check at start',await pg.evaluate("window.__u.checks")==0)
        await b.close()
        print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
