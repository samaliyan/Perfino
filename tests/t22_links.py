# لینک به سایت، گزارش پایش و کهنگی در رابط
import asyncio,json,sys,re
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
REC="window.__opened=[];(function(){var N=window.Native;N.open=function(u){window.__opened.push(u);return true}})();"
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,360,780,'dark',extra=REC)
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
        await pg.wait_for_timeout(800)
        # مدلی با چند منبع
        mid=await pg.evaluate("""(function(){var r=null;__pp.tree.some(function(b){return b.models.some(function(m){return m.variants.some(function(v){return v.sizes.some(function(z){if(z.srcs.length>=3){r=[b.id,m.id];return true}})})})});return r})()""")
        chk(mid is not None,'a model with ≥3 sources exists')
        await pg.evaluate("__pp.open('%s')"%mid[0]); await pg.wait_for_timeout(700)
        await pg.evaluate("__pp.open('%s')"%mid[1]); await pg.wait_for_timeout(700)
        n0=await pg.evaluate("document.querySelectorAll('#dtc .sr').length")
        vis0=await pg.evaluate("(function(){var e=document.querySelector('#dtc .srl');return getComputedStyle(e).display})()")
        chk(vis0=='none','source rows hidden until tapped (%s)'%vis0)
        await pg.click('#dtc .sz'); await pg.wait_for_timeout(300)
        vis1=await pg.evaluate("(function(){var e=document.querySelector('#dtc .srl');return getComputedStyle(e).display})()")
        chk(vis1=='block','tap on size shows sources')
        rows=await pg.evaluate("[].map.call(document.querySelector('#dtc .srl').querySelectorAll('.sr'),function(r){return r.innerText.replace(/\\n/g,' ')})")
        chk(len(rows)>=3 and all(re.search(r'(لیلیوم|دیجی|سفیر|هایلند)',x) for x in rows),'rows name the sites: %s'%rows)
        # دکمه‌ی دیدن در سایت
        await pg.click('#dtc .srl .go'); await pg.wait_for_timeout(200)
        op=await pg.evaluate("window.__opened")
        chk(len(op)==1 and re.match(r'^https://(liliome\.com/\?p=\d+|www\.digikala\.com/product/dkp-\d+/|www\.safirstores\.com/|hilandbeauty\.com/)',op[0]),'link opened via Native.open: %s'%op)
        # بدون ماسک/برش
        ov=await pg.evaluate("(function(){var s=document.getElementById('dtc');return s.scrollWidth>s.clientWidth+1})()")
        chk(not ov,'detail has no horizontal overflow when sources are open')
        await pg.screenshot(path='shots/t22_detail.png')
        # باز و بسته ماندن بعد از تازه‌سازی قیمت‌ها
        await pg.evaluate("__pp.refresh(false)"); await pg.wait_for_timeout(2500)
        vis2=await pg.evaluate("(function(){var e=document.querySelector('#dtc .srl');return e?getComputedStyle(e).display:'none'})()")
        chk(vis2=='block','open state kept across price refresh')
        # گزارش پایش
        await pg.evaluate("document.getElementById('dtx').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk('پالایش نام‌ها' in rep,'report has audit row: '+rep.replace('\\n',' | ')[:400])
        await pg.evaluate("document.querySelector('.aud-t').click()"); await pg.wait_for_timeout(200)
        chk(await pg.evaluate("!!document.querySelector('.audl')"),'examples expand')
        chk(not [e for e in errs if 'Failed to load' not in e],'no js errors '+str(errs[:2]))
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
