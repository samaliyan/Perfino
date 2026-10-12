# گزارش به‌روز در تنظیمات و شمار عکس‌های گیت (کل، روی گوشی، مانده)
import asyncio,json,sys,re
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
HOLD="""
(function(){var N=window.Native,held=[];N.cacheImg=function(id,u){held.push([id,u])};
window.__heldN=function(){return held.length};window.__held_take=function(n){return held.splice(0,n)};
window.__release=function(failEvery){var h=held.splice(0);h.forEach(function(x,i){ if(failEvery&&i%failEvery==0){window.__imgFail(x[0])}else{window.__imgDone(x[0],'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22/>')}});return h.length};
})();
"""

SVG="data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22/>"
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,extra=HOLD+"window.__DELAY=40;")
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_function("window.__pp.state.busy===false && Object.keys(window.__pp.state.db.full).length==4",timeout=120000)
        await pg.wait_for_timeout(700)
        g=await pg.evaluate("__pp.gate"); t0=await pg.evaluate("document.getElementById('gv2').innerText")
        chk(g['need']>500 and g['have']==0,'gate: need=%d have=%d'%(g['need'],g['have']))
        # بخشی از عکس‌ها از قبل روی گوشی بوده (مثل آپدیت): کل را نشان می‌دهد نه فقط مانده را
        await pg.evaluate("(function(){var h=__held_take(400);h.forEach(function(x){window.__imgDone(x[0],'%s')})})()"%SVG)
        await pg.wait_for_timeout(600)
        g=await pg.evaluate("__pp.gate"); t1=await pg.evaluate("document.getElementById('gv2').innerText")
        fa2=lambda s:s.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹٬','0123456789,'))
        m=re.search(r'(\d[\d,]*)\s*از\s*(\d[\d,]*)',fa2(t1))
        chk(m and int(m.group(1).replace(',',''))==g['have']>=400 and int(m.group(2).replace(',',''))==g['need'],'gate shows have of need (%s) vs %s'%(t1,json.dumps(g)))
        chk('مانده' in t1,'gate shows remaining count: '+t1)
        # گزارش در تنظیمات (در حالی که عکس‌ها مانده)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(400)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk(all(n in rep for n in ['لیلیوم','دیجی','سفیر','هایلند']) and 'عکس‌ها' in rep and 'فهرست' in rep and 'برند' in rep,'report rows: '+rep.replace('\n',' | ')[:300])
        chk('ناقص' in rep and 'در حال دانلود' in rep,'report says incomplete while photos pending')
        # عکس‌ها تمام شوند → «کامل»
        await pg.evaluate("(function(){var h=__held_take(99999);h.forEach(function(x){window.__imgDone(x[0],'%s')})})()"%SVG)
        await pg.wait_for_timeout(900)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        g=await pg.evaluate("__pp.gate")
        chk('همه‌چیز کامل است' in rep and g['have']==g['need'],'report complete after photos: '+rep.replace('\n',' | ')[:200])
        chk(await pg.evaluate("document.getElementById('sRep').querySelectorAll('.bad').length")==0,'no red rows when complete')
        # عدد محصولِ هر سایت با db جور است
        cnts=await pg.evaluate("(function(){var o={};['liliome','digikala','safir','hiland'].forEach(function(s){var n=0,m=__pp.state.db.it[s]||{};Object.keys(m).forEach(function(k){if(m[k][2]&&m[k][1]>0)n++});o[s]=n});return o})()")
        nums=[int(x.replace(',','')) for x in re.findall(r'(\d[\d,]*)\s*محصول',fa2(rep))]
        chk(sorted(nums)==sorted(cnts.values()),'per-site counts match db: %s vs %s'%(nums,cnts))
        await pg.screenshot(path='shots/t20_report.png')
        await b.close()
        # یک سایت خراب → گزارش قرمز و دلیل
        b,ctx,pg,errs=await new_page(p,extra="window.__MODE=function(u){ if(u.indexOf('liliome')>=0) return {s:500,b:'server error'} };")
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_function("window.__pp.gate.ready",timeout=90000); await pg.wait_for_timeout(600)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk('خطا' in rep and 'ناقص؛ جزئیات' in rep,'report shows failing site: '+rep.replace('\n',' | ')[:260])
        chk(await pg.evaluate("document.getElementById('sRep').querySelectorAll('.bad').length")>=2,'red rows for the problem')
        chk(not [e for e in errs if 'Failed to load' not in e],'no js errors '+str(errs[:2]))
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
