import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:200] if i!='' else ''))
PINCH="""(function(a,b,steps){var el=document.getElementById('vwb');function ev(t,id,x,y){el.dispatchEvent(new PointerEvent(t,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,bubbles:true,isPrimary:id===1}))}
 var cx=180,cy=380;ev('pointerdown',1,cx-a,cy);ev('pointerdown',2,cx+a,cy);for(var i=1;i<=steps;i++){var k=a+(b-a)*i/steps;ev('pointermove',1,cx-k,cy);ev('pointermove',2,cx+k,cy)}ev('pointerup',2,cx+b,cy);ev('pointerup',1,cx-b,cy)})"""
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,360,780,'dark')
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(800)
        ev=pg.evaluate
        # برند با چند عطر
        bid=await ev("(function(){var t=window.__pp.tree.filter(function(b){return b.models.length>=4})[0];return t.id})()")
        await ev("window.__pp.open(%s)"%json.dumps(bid)); await pg.wait_for_timeout(600)
        await ev("(function(){var t=document.querySelector('.tile');t.click()})()"); await pg.wait_for_timeout(500)
        st=await ev("({on:document.getElementById('vw').classList.contains('on'),n:window.__vw.seq.length,ix:window.__vw.ix,cap:document.getElementById('vwc').textContent})")
        chk('viewer opens with the list of perfumes',st['on'] and st['n']>=4,st)
        chk('caption shows name and position',('از' in st['cap']),st['cap'])
        id0=await ev("window.__vw.id")
        async def drag(x0,y0,x1,y1):
            await pg.mouse.move(x0,y0); await pg.mouse.down(); await pg.mouse.move((x0+x1)/2,(y0+y1)/2,steps=4); await pg.mouse.move(x1,y1,steps=4); await pg.mouse.up(); await pg.wait_for_timeout(350)
        await drag(280,380,90,385)
        id1=await ev("window.__vw.id"); ix1=await ev("window.__vw.ix")
        chk('swipe left = next perfume',id1!=id0 and ix1==1,[id0,id1,ix1])
        await drag(90,380,280,385)
        chk('swipe right = previous perfume',await ev("window.__vw.id")==id0)
        await drag(90,380,280,385)
        chk('swipe right on the first one stays',await ev("window.__vw.id")==id0 and await ev("document.getElementById('vw').classList.contains('on')"))
        # دکمه‌ها
        await ev("document.getElementById('vwn').click()"); await pg.wait_for_timeout(300)
        chk('next button',await ev("window.__vw.ix")==1)
        await ev("document.getElementById('vwp').click()"); await pg.wait_for_timeout(300)
        chk('previous button',await ev("window.__vw.ix")==0)
        chk('no previous button on the first',await ev("getComputedStyle(document.getElementById('vwp')).display")=='none')
        # زوم با دو انگشت
        await ev(PINCH+"(40,130,10)"); await pg.wait_for_timeout(200)
        s1=await ev("window.__vw.t")
        chk('pinch zooms in',s1['s']>2.2,s1)
        # حرکت وقتی زوم است عطر را عوض نمی‌کند
        await drag(280,380,90,385)
        chk('drag while zoomed pans, does not switch',await ev("window.__vw.ix")==0 and (await ev("window.__vw.t"))['x']!=s1['x'],await ev("window.__vw.t"))
        await ev(PINCH+"(130,20,10)"); await pg.wait_for_timeout(200)
        chk('pinch out returns to normal',(await ev("window.__vw.t"))['s']==1,await ev("window.__vw.t"))
        # دو بار لمس
        await pg.mouse.click(180,380); await pg.wait_for_timeout(120); await pg.mouse.click(180,380); await pg.wait_for_timeout(400)
        chk('double tap zooms in',(await ev("window.__vw.t"))['s']>2,await ev("window.__vw.t"))
        chk('double tap does not close',await ev("document.getElementById('vw').classList.contains('on')"))
        await pg.mouse.click(180,380); await pg.wait_for_timeout(120); await pg.mouse.click(180,380); await pg.wait_for_timeout(400)
        chk('second double tap zooms out',(await ev("window.__vw.t"))['s']==1)
        # حد: بیشتر از ۶ برابر نمی‌شود
        await ev(PINCH+"(10,300,12)"); await pg.wait_for_timeout(100)
        chk('zoom limited to 6x',(await ev("window.__vw.t"))['s']<=6.001,await ev("window.__vw.t"))
        await ev(PINCH+"(200,10,12)"); await pg.wait_for_timeout(100)
        # بستن: لمس تکی
        await pg.mouse.click(180,380); await pg.wait_for_timeout(500)
        chk('single tap closes',not await ev("document.getElementById('vw').classList.contains('on')"))
        # کشیدن به پایین
        await ev("document.querySelector('.tile').click()"); await pg.wait_for_timeout(400)
        await drag(180,300,185,520)
        chk('swipe down closes',not await ev("document.getElementById('vw').classList.contains('on')"))
        # دکمه‌ی بستن و برگشت
        await ev("document.querySelector('.tile').click()"); await pg.wait_for_timeout(400)
        await ev("document.getElementById('vwx').click()")
        chk('close button',not await ev("document.getElementById('vw').classList.contains('on')"))
        await ev("document.querySelector('.tile').click()"); await pg.wait_for_timeout(400)
        await ev("window.__back()"); chk('back closes viewer',not await ev("document.getElementById('vw').classList.contains('on')"))
        # از صفحه‌ی جزئیات
        mid=await ev("window.__pp.tree.filter(function(b){return b.id===%s})[0].models.map(function(m){return m.id})"%json.dumps(bid))
        await ev("window.__pp.open(%s)"%json.dumps(mid[0])); await pg.wait_for_timeout(500)
        await ev("document.querySelector('#dtc .dpic').click()"); await pg.wait_for_timeout(400)
        chk('viewer from detail walks the brand perfumes',await ev("window.__vw.seq.length")==len(mid))
        await drag(280,380,90,385); await drag(280,380,90,385)
        chk('detail swipe two forward',await ev("window.__vw.id")==mid[2],await ev("window.__vw.id"))
        await ev("document.getElementById('vwx').click()"); await pg.wait_for_timeout(300)
        exp=await ev("(function(){var r='';window.__pp.tree.forEach(function(b){b.models.forEach(function(m){if(m.id===%s)r=m.name||m.nm||m.title||''})});return r})()"%json.dumps(mid[2]))
        got=await ev("(document.querySelector('#dtc .dnm')||{}).textContent||''")
        chk('closing shows the detail of the perfume you reached',await ev("document.getElementById('dt').classList.contains('on')") and bool(exp) and exp.split()[0] in got)
        dn=await ev("(document.querySelector('#dtc .dnm')||{}).textContent")
        nm=await ev("window.__pp.tree.filter(function(b){return b.id===%s})[0].models[2].name"%json.dumps(bid))
        chk('detail title is the perfume reached',dn==nm,[dn,nm])
        ov=await ev("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1")
        chk('no overflow',ov); chk('no js errors',not errs,errs[:2])
        await ev("document.getElementById('dtx').click()"); await pg.wait_for_timeout(200)
        await ev("document.querySelector('.tile').click()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/w/viewer.png')
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
