# قاعده‌های بروزرسانیِ خودکار که بازبینی مستقل خواست: گیر کردن روی «در حال بارگذاری»، خواندنِ لیست، اعتبارِ «همین حالا»،
# خطای دیررسیده‌ی نوعِ دیگر، به یاد ماندنِ «بعداً»
import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
sys.path.insert(0,'/home/claude/perfumeprice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
def native():
    s="window.__nc=[];(function(){var N=window.Native;function rec(n){return function(){window.__nc.push(n);return n==='otaApply'||n==='updInstall'?true:undefined}}"
    s+="N.otaCheck=rec('otaCheck');N.otaDownload=rec('otaDownload');N.otaApply=rec('otaApply');N.otaOk=rec('otaOk');N.otaBoot=rec('otaBoot');N.otaErr=rec('otaErr');"
    s+="N.updCheck=rec('updCheck');N.updDownload=rec('updDownload');N.updInstall=rec('updInstall');N.appCode=function(){return 100};})();"
    return s
async def load(p,extra):
    b,ctx,pg,errs=await new_page(p,mobile=False,extra=extra)
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(300)
    return b,ctx,pg,errs
ev=lambda pg,js: pg.evaluate(js)
async def box(pg):
    return await pg.evaluate("({on:document.getElementById('updBox').classList.contains('on'),go:document.getElementById('updGo').innerText,sup:document.getElementById('sUpdT').textContent})")
async def calls(pg): return await pg.evaluate("window.__nc.slice()")
FWD="window.__rn=window.__rn||Date.now.bind(Date);Date.now=function(){return window.__rn()+(window.__fw||0)};"
async def settle(pg): await pg.wait_for_timeout(6000)
async def main():
    async with async_playwright() as p:
        # ---- ۱) برنامه روی «در حال بارگذاری» گیر کرده و کسی کاری نمی‌کند: بروزرسانی باز هم انجام می‌شود
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,FWD+"window.__fw=0;window.dispatchEvent(new Event('pointerdown'));window.__pp.state.db.ready=false;window.__nc.length=0;window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)")
        await settle(pg); c=await calls(pg)
        chk('۱ هنوز ۳۰ ثانیه نشده: گیر کرده هم باشد صبر می‌کند',c.count('otaApply')==0,c)
        await ev(pg,"window.__fw=40000"); await settle(pg); c=await calls(pg)
        chk('۱ روی «در حال بارگذاری» گیر کرده و ۳۰ ثانیه کسی دست نزده: بروزرسانی انجام شد (راهِ دور درست کردنِ برنامه)',c.count('otaApply')==1,c)
        await b.close()
        # ---- ۲) وسطِ خواندنِ لیست یک برند: سه دقیقه بی‌حرکتی لازم است، نه ۱۵ ثانیه
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        bid=await ev(pg,"window.__pp.tree[0].id")
        await ev(pg,"window.__pp.open(%s)"%json.dumps(bid)); await pg.wait_for_timeout(900)
        chk('۲ داخل لیستِ یک برند هستیم',(await ev(pg,"window.__pp.nav"))['lvl']==1)
        await ev(pg,FWD+"window.__fw=60000;window.__nc.length=0;window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)")
        await settle(pg); c=await calls(pg)
        chk('۲ یک دقیقه بی‌حرکت داخل لیستِ برند: هنوز باز نمی‌کند',c.count('otaApply')==0,c)
        await ev(pg,"window.__fw=200000"); await settle(pg); c=await calls(pg)
        chk('۲ بیش از سه دقیقه بی‌حرکت: باز می‌کند',c.count('otaApply')==1,c)
        await b.close()
        # ---- ۳) خطای دیررسیده‌ی نوعِ دیگر وسطِ بروزرسانی را خراب نمی‌کند
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(300)
        await ev(pg,"window.__otaErr()"); await pg.wait_for_timeout(300); bx=await box(pg)
        chk('۳ APK آماده است و خطای دیررسیده‌ی «بی‌نصب» آمد: کارت می‌ماند',bx['on'] or 'آماده' in bx['sup'],bx)
        await b.close()
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100})")
        await ev(pg,"window.__updErr('late')"); await pg.wait_for_timeout(200)
        st=await ev(pg,"document.getElementById('sUpdT').textContent")
        chk('۳ دانلودِ بی‌نصب در جریان است و خطای دیررسیده‌ی APK آمد: قطع نمی‌شود',not 'الان نشد' in st,st)
        await b.close()
        # ---- ۴) «بعداً» با بسته شدنِ برنامه فراموش نمی‌شود
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(5500)
        bx=await box(pg); chk('۴ کارتِ نصب آمد',bx['on'],bx)
        await pg.wait_for_timeout(900)
        await ev(pg,"document.getElementById('updLater').click()"); await pg.wait_for_timeout(300)
        dis=await ev(pg,"localStorage.getItem('pp.updDis')")
        chk('۴ «بعداً» در حافظه ذخیره شد',bool(dis) and json.loads(dis)[0]==999,dis)
        await ev(pg,"location.reload()"); await pg.wait_for_timeout(2500)
        await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(5500)
        bx=await box(pg); chk('۴ برنامه دوباره باز شد: همان بروزرسانی که «بعداً» خورده بود دوباره نمی‌آید',not bx['on'],bx)
        await ev(pg,"window.__updInfo(1000);window.__updReady(1000)"); await pg.wait_for_timeout(5500)
        bx=await box(pg); chk('۴ ولی نسخه‌ی تازه‌تر (شماره‌ی دیگر) می‌آید',bx['on'],bx)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
