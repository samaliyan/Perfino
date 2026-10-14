import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:160] if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        ev=pg.evaluate
        await ev("document.getElementById('sr').click()"); await ev("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(400)
        t=await ev("document.getElementById('mkr').innerText")
        chk('summary has market conclusions',('خلاصهٔ بازار' in t) and ('صرفه' in t),t[:80])
        chk('summary has price spread bars',await ev("document.querySelectorAll('#mkr .mkbar').length")==6)
        chk('summary shows best deals',await ev("document.querySelectorAll('#mkr .mkr[data-m]').length")>=1)
        await ev("document.querySelector('#mkr [data-go=cmp]').click()"); await pg.wait_for_timeout(300)
        chk('go to compare tab',await ev("document.querySelector('#mkt2 .on').dataset.t")=='cmp')
        n0=await ev("document.querySelectorAll('#mkr .mkr').length")
        await ev("document.querySelector('#mkr .mkch button[data-k=gn][data-v=w]').click()"); await pg.wait_for_timeout(300)
        n1=await ev("document.querySelectorAll('#mkr .mkr').length")
        chk('gender filter changes rows',n1<=n0 and await ev("document.querySelector('#mkr .mkch button[data-v=w]').classList.contains('on')"),[n0,n1])
        await ev("document.querySelector('#mkr .mkch button[data-k=gn][data-v=\"\"]').click()"); await pg.wait_for_timeout(200)
        await ev("document.querySelector('#mkr .mkch button[data-k=sort][data-v=p]').click()"); await pg.wait_for_timeout(300)
        pc=await ev("[].map.call(document.querySelectorAll('#mkr .mkr .mv b'),function(e){return e.innerText})")
        chk('percent sort has rows',len(pc)>=1,pc[:3])
        await ev("document.querySelector('#mkt2 [data-t=brand]').click()"); await pg.wait_for_timeout(300)
        chk('brand rows',await ev("document.querySelectorAll('#mkr .mkr[data-b]').length")>=3)
        await ev("document.querySelector('#mkr .mkch button[data-v=hi]').click()"); await pg.wait_for_timeout(300)
        bn=await ev("document.querySelector('#mkr .mkr[data-b]').dataset.b")
        await ev("document.querySelector('#mkr .mkr[data-b]').click()"); await pg.wait_for_timeout(700)
        chk('brand row opens brand page',await ev("window.__pp.nav.lvl")==1 and await ev("window.__pp.nav.brand")==bn and not await ev("document.getElementById('mk').classList.contains('on')"))
        chk('no errors',not errs,errs[:2])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
