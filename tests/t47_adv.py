import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:200] if i!='' else ''))
SIMPLE=['sRef','sTheme','sModel','sLang','sFs','sUpdT']
ADV=['dgGo','sRep','bkIn','bkList','sBrBtn','sAuto','sSrc','sUpdA','sUpd']
async def main():
    async with async_playwright() as p:
        for fs in (0,3):
            b,ctx,pg,errs=await new_page(p,mobile=True,adv=False)
            await pg.set_viewport_size({'width':360,'height':700})
            await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
            if fs: await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(300); await pg.evaluate("document.querySelector('#sFs button[data-v=\"%d\"]').click()"%fs); await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
            vis=await pg.evaluate("(ids)=>ids.map(i=>{var e=document.getElementById(i);var r=e.getBoundingClientRect();return [i,r.width>0&&r.height>0]})",SIMPLE+ADV)
            d=dict(vis)
            chk('fs%d simple settings visible'%fs,all(d[i] for i in SIMPLE),[i for i in SIMPLE if not d[i]])
            chk('fs%d advanced hidden at first'%fs,not any(d[i] for i in ADV),[i for i in ADV if d[i]])
            await pg.evaluate("document.getElementById('sAdvBtn').click()"); await pg.wait_for_timeout(500)
            vis=dict(await pg.evaluate("(ids)=>ids.map(i=>{var e=document.getElementById(i);var r=e.getBoundingClientRect();return [i,r.width>0&&r.height>0]})",ADV))
            chk('fs%d advanced visible after tap'%fs,sum(vis.values())>=8,vis)
            await pg.wait_for_timeout(1200)
            st=await pg.evaluate("({app:document.getElementById('app').scrollTop,body:document.body.scrollTop+document.documentElement.scrollTop,stage:document.getElementById('stage').getBoundingClientRect().top,sheet:document.getElementById('sheet').scrollTop,adv:document.getElementById('sAdv').getBoundingClientRect().top})")
            chk('fs%d main page not shifted after opening advanced'%fs,st['app']==0 and st['body']==0 and st['stage']>=-1,st)
            chk('fs%d sheet scrolled to advanced'%fs,st['sheet']>0 and 0<=st['adv']<700,st)
            lab=await pg.evaluate("document.getElementById('sAdvBtn').textContent")
            chk('fs%d button label changes'%fs,'بستن' in lab,lab)
            ov=await pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1")
            chk('fs%d no horizontal overflow'%fs,ov)
            await pg.evaluate("document.getElementById('sAdvBtn').click()")
            h=await pg.evaluate("document.getElementById('sAdv').style.display")
            chk('fs%d collapses again'%fs,h=='none',h)
            chk('fs%d no js errors'%fs,not errs,errs)
            await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
