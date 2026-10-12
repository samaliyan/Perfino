# قفل ورود: تا دانلود کامل (فهرست + قیمت + عکس) وارد برنامه نمی‌شویم
import asyncio,json,sys
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
async def st(pg):
    return await pg.evaluate("""(function(){var p=window.__pp;return {ready:p.gate.ready,gate:p.gate,busy:p.state.busy,full:Object.keys(p.state.db.full||{}).length,mods:document.querySelectorAll('#stage .mod').length,ov:document.getElementById('ov').className,ovt:document.getElementById('ov').innerText.replace(/\\s+/g,' ').slice(0,200),retry:!!document.getElementById('retry'),goon:!!document.getElementById('goon'),list:p.list.length}})()""")
async def main():
    async with async_playwright() as p:
        # A) عکس‌ها نیامده → وارد نشود
        b,ctx,pg,errs=await new_page(p,extra=HOLD+"window.__DELAY=60;")
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_timeout(500)
        s=await st(pg); chk(s['busy'] and s['ov']=='on' and s['mods']==0 and not s['ready'],'A1 during source download: overlay on, no app: '+json.dumps(s,ensure_ascii=False))
        chk('آماده' in s['ovt'] and 'عکس' in s['ovt'],'A1b overlay text mentions preparing+photos: '+s['ovt'])
        await pg.wait_for_function("window.__pp.state.busy===false && Object.keys(window.__pp.state.db.full).length==4",timeout=120000)
        await pg.wait_for_timeout(700)
        s=await st(pg); held=await pg.evaluate("__heldN()")
        chk(held>500 and not s['ready'] and s['ov']=='on' and s['mods']==0,'A2 sources done but photos pending → still locked: held=%d %s'%(held,json.dumps(s,ensure_ascii=False)))
        chk(s['gate']['left']>500,'A2b gate counts pending photos %s'%s['gate'])
        # دایره‌ی چرخان با آمدن هر عکس از نو ساخته نشود (قبلاً مدام از اول شروع می‌کرد)
        await pg.evaluate("window.__sp=document.getElementById('gsp');window.__pp.__n=0")
        await pg.evaluate("(function(){var h=__held_take(300);h.forEach(function(x){window.__imgDone(x[0],'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22/>')})})()")
        await pg.wait_for_timeout(700)
        same=await pg.evaluate("document.getElementById('gsp')===window.__sp && !!window.__sp.isConnected")
        mid=await pg.evaluate("document.querySelector('#gv2').innerText")
        chk(same,'A2d spinner element is the same object while photos arrive (animation not restarted) '+mid)
        chk(not await pg.evaluate("__pp.gate.ready"),'A2e still locked mid-way')
        # بعضی عکس‌ها نیامدند (خطا) ولی بقیه آمدند
        await pg.evaluate("__release(7)"); await pg.wait_for_timeout(900)
        s=await st(pg)
        chk(s['ready'] and s['mods']==1 and s['ov']=='' and s['list']>10,'A3 after photos settled (some failed) → enters: '+json.dumps(s,ensure_ascii=False))
        chk(s['gate']['bad']>50 and s['gate']['ok']>400,'A3b ok/bad counted %s'%s['gate'])
        # ماندگاری: بعد از بستن و بازکردن دوباره، قفل نیست
        await pg.evaluate("window.__DELAY=2500")
        await pg.reload(); await pg.wait_for_timeout(1200)
        s=await st(pg)
        chk(s['ready'] and s['mods']==1 and s['ov']=='','A4 relaunch → straight into app while refresh still running: '+json.dumps(s,ensure_ascii=False))
        await b.close()
        # B) یک سایت جواب نمی‌دهد
        MODE="window.__MODE=function(u){ if(u.indexOf('liliome')>=0 && !window.__FIXED) return {s:500,b:'server error'} };"
        b,ctx,pg,errs=await new_page(p,extra=MODE)
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_function("window.__pp.state.busy===false && Object.keys(window.__pp.state.st).length==4",timeout=120000)
        await pg.wait_for_function("window.__pp.gate.ready",timeout=60000); await pg.wait_for_timeout(600)
        s=await st(pg)
        chk(s['ready'] and s['ov']=='' and s['mods']==1 and s['list']>10,'B1 one source down → after one auto-retry enters with the other sites: '+json.dumps(s,ensure_ascii=False))
        await b.close()
        # C) دادهٔ نسخه‌ی قبل (۱.۲) → از نو و کامل
        OLD="localStorage.setItem('pp.db',JSON.stringify({v:3,g:{old1:{k:['a'],c:'',nm:{'قدیمی':1},im:{}}},it:{liliome:{1:['x',1000000,'old1',100]}},full:{liliome:Date.now(),digikala:Date.now(),safir:Date.now(),hiland:Date.now()},t:{liliome:Date.now()},sc:{}}));window.__DELAY=80;"
        b,ctx,pg,errs=await new_page(p,extra=OLD)
        await pg.goto('file://'+ROOT+'/index.html'); await pg.wait_for_timeout(500)
        s=await st(pg); d=await pg.evaluate("({fv:__pp.state.db.fv,old:!!__pp.state.db.g.old1,full:Object.keys(__pp.state.db.full)})")
        chk(not s['ready'] and s['mods']==0 and d["fv"]==5 and not d['old'],'C1 old v1.2 data discarded, locked until full download: '+json.dumps([s,d],ensure_ascii=False))
        await b.close()
        # D) پیشرفت درصد در قفل بالا می‌رود
        b,ctx,pg,errs=await new_page(p,extra=HOLD+"window.__DELAY=120;")
        await pg.goto('file://'+ROOT+'/index.html')
        ws=[]
        for i in range(5):
            await pg.wait_for_timeout(700); ws.append(await pg.evaluate("parseInt((document.querySelector('#ov .pb i')||{style:{width:'0'}}).style.width)"))
        chk(ws[-1]>=ws[0] and max(ws)>0,'D1 progress bar moves: %s'%ws)
        await b.close()
    print(len(OK),'passed',len(BAD),'failed'); print('PASS' if not BAD else 'FAIL')
asyncio.run(main())
