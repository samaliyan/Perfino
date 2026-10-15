# کشیدن عکس به چپ/راست: منوی پشتِ آن (چرخ، لیست، نوارِ متن) هم به عطر بعدی/قبلی می‌رود؛ از صفحه‌ی جزئیات هم همین‌طور
import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:200] if i!='' else ''))
async def run_model(p,mdl):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s',fs:0}));"%mdl
    b,ctx,pg,errs=await new_page(p,360,780,'dark',extra=init)
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
    ev=pg.evaluate; tag='['+mdl+'] '
    async def drag(x0,y0,x1,y1):
        await pg.mouse.move(x0,y0); await pg.mouse.down(); await pg.mouse.move((x0+x1)/2,(y0+y1)/2,steps=4); await pg.mouse.move(x1,y1,steps=4); await pg.mouse.up(); await pg.wait_for_timeout(900)
    async def stage_id(): return await ev("window.__pp.model.getAnchor()")
    async def stage_title():                       # نامِ عطری که الان وسطِ منو است (همان متنی که پدر می‌خواند)
        return await ev("(function(){var a=window.__pp.model.getAnchor();var l=window.__pp.list;for(var i=0;i<l.length;i++)if(l[i].id===a)return l[i].name;return ''})()")
    # --- سطح اول: فهرست برندها ---
    n0=await ev("window.__pp.list.length"); chk(tag+'brand list has many entries',n0>=4,n0)
    await ev("window.__pp.model.goto(0)"); await pg.wait_for_timeout(900)
    first=await stage_id()
    await ev("(function(){var t=document.querySelector('#stage .tile');t.click()})()"); await pg.wait_for_timeout(600)
    chk(tag+'viewer opens from the menu',await ev("document.getElementById('vw').classList.contains('on')"))
    v0=await ev("window.__vw.id")
    await drag(280,380,90,385)
    v1=await ev("window.__vw.id"); chk(tag+'swipe left moves to the next photo',v1!=v0,[v0,v1])
    s1=await stage_id(); chk(tag+'the menu moved to the same perfume as the photo',s1==v1,[s1,v1])
    t1=await stage_title(); cap=await ev("document.getElementById('vwc').textContent")
    chk(tag+'the menu text is the name shown on the photo',t1 and t1 in cap,[t1,cap])
    await drag(280,380,90,385)
    v2=await ev("window.__vw.id"); s2=await stage_id(); chk(tag+'second swipe: menu follows again',v2!=v1 and s2==v2,[v1,v2,s2])
    await drag(90,380,280,385)
    v3=await ev("window.__vw.id"); s3=await stage_id(); chk(tag+'swipe right: menu goes back too',v3==v1 and s3==v1,[v1,v3,s3])
    await ev("document.getElementById('vwn').click()"); await pg.wait_for_timeout(900)
    chk(tag+'next button also moves the menu',await stage_id()==await ev("window.__vw.id") and await ev("window.__vw.id")==v2)
    await ev("document.getElementById('vwp').click()"); await pg.wait_for_timeout(900)
    chk(tag+'previous button also moves the menu',await stage_id()==await ev("window.__vw.id") and await ev("window.__vw.id")==v1)
    await ev("document.getElementById('vwx').click()"); await pg.wait_for_timeout(600)
    chk(tag+'after closing, the menu shows the perfume reached (not the first)',await stage_id()==v1 and v1!=first,[await stage_id(),v1,first])
    # --- داخل یک برند ---
    bid=await ev("(function(){var t=window.__pp.tree.filter(function(b){return b.models.length>=4})[0];return t.id})()")
    await ev("window.__pp.open(%s)"%json.dumps(bid)); await pg.wait_for_timeout(900)
    await ev("window.__pp.model.goto(0)"); await pg.wait_for_timeout(700)
    await ev("(function(){var t=document.querySelector('#stage .tile');t.click()})()"); await pg.wait_for_timeout(600)
    a=await ev("window.__vw.id"); await drag(280,380,90,385); await drag(280,380,90,385)
    c=await ev("window.__vw.id"); sc=await stage_id()
    chk(tag+'inside a brand: two swipes move the list two perfumes',c!=a and sc==c,[a,c,sc])
    await ev("window.__back()"); await pg.wait_for_timeout(500)
    chk(tag+'Back closes only the viewer',not await ev("document.getElementById('vw').classList.contains('on')") and await ev("window.__pp.nav.lvl")==1)
    await ev("window.__pp.model.goto(0)"); await pg.wait_for_timeout(700); top=await stage_id()
    await ev("window.__pp.mount(%s)"%json.dumps(mdl)); await pg.wait_for_timeout(900)
    chk(tag+'re-creating the menu keeps the top perfume as the current one',await stage_id()==top,[await stage_id(),top])
    chk(tag+'no page errors',not [e for e in errs if 'Failed to load' not in e],errs[:3])
    # --- از صفحه‌ی جزئیات ---
    if mdl=='a':
        mids=await ev("window.__pp.tree.filter(function(b){return b.id===%s})[0].models.map(function(m){return {id:m.id,n:m.name}})"%json.dumps(bid))
        await ev("window.__pp.open(%s)"%json.dumps(mids[0]['id'])); await pg.wait_for_timeout(600)
        d0=await ev("(document.querySelector('#dtc .dnm')||{}).textContent")
        await ev("document.querySelector('#dtc .dpic').click()"); await pg.wait_for_timeout(500)
        await drag(280,380,90,385)
        d1=await ev("(document.querySelector('#dtc .dnm')||{}).textContent")
        chk('detail: swiping the photo changes the page title to the next perfume',d1==mids[1]['n'] and d1!=d0,[d0,d1,mids[1]['n']])
        prices0=await ev("document.querySelectorAll('#dtc .sz').length")
        chk('detail: prices of the new perfume are shown',prices0>=1,prices0)
        await drag(90,380,280,385)
        chk('detail: swipe back returns to the first perfume',await ev("(document.querySelector('#dtc .dnm')||{}).textContent")==d0)
        await drag(280,380,90,385); await drag(280,380,90,385)
        await ev("document.getElementById('vwx').click()"); await pg.wait_for_timeout(400)
        chk('detail: closing the photo shows the price page of the perfume reached',await ev("(document.querySelector('#dtc .dnm')||{}).textContent")==mids[2]['n'] and await ev("document.getElementById('dt').classList.contains('on')"))
        rec=await ev("JSON.parse(localStorage.getItem('pp.set')).rec.map(function(x){return x[0]})")
        chk('detail: perfumes reached by swiping are in "last seen"',mids[2]['id'] in rec and mids[1]['id'] in rec,rec[:4])
    await b.close()
async def main():
    async with async_playwright() as p:
        for m in ('a','c','z','h'): await run_model(p,m)
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
