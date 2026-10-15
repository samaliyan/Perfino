import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
# Native ساختگی: هر فراخوانی ثبت می‌شود؛ جوابِ جاوا را خودِ آزمایش می‌فرستد
def native(ota=True, okfn=True, apk=True, files=False, boot=True):
    s="window.__nc=[];window.__na=[];window.__files={};(function(){var N=window.Native;function rec(n){return function(){window.__nc.push(n);window.__na.push([n].concat([].slice.call(arguments)));return n==='otaApply'||n==='updInstall'?true:undefined}}"
    if ota: s+="N.otaCheck=rec('otaCheck');N.otaDownload=rec('otaDownload');N.otaApply=rec('otaApply');"
    if okfn: s+="N.otaOk=rec('otaOk');"
    if boot: s+="N.otaBoot=rec('otaBoot');N.otaErr=rec('otaErr');"
    if apk: s+="N.updCheck=rec('updCheck');N.updDownload=rec('updDownload');N.updInstall=rec('updInstall');N.appCode=function(){return 100};"
    if files: s+="N.fileSet=function(k,t){window.__files[k]=t;return true};N.fileGet=function(k){return window.__files[k]||''};"
    s+="})();"
    return s
async def load(p,extra,url=None,**kw):
    b,ctx,pg,errs=await new_page(p,mobile=False,extra=extra,**kw)
    await pg.goto(url or ('file://'+ROOT+'/index.html')); await wait_ready(pg,180000); await pg.wait_for_timeout(300)
    return b,ctx,pg,errs
ev=lambda pg,js: pg.evaluate(js)
async def box(pg):
    return await pg.evaluate("({on:document.getElementById('updBox').classList.contains('on'),tx:document.getElementById('updBox').innerText,go:document.getElementById('updGo').innerText,gd:document.getElementById('updGo').disabled,h:getComputedStyle(document.getElementById('updH')).display,sup:document.getElementById('sUpdT').textContent})")
async def calls(pg): return await pg.evaluate("window.__nc.slice()")
async def cargs(pg): return await pg.evaluate("window.__na.slice()")
async def main():
    async with async_playwright() as p:
        # ---- A) بسته‌ی تازه: دانلود → آماده → باز کردن، بدون هیچ مرحله‌ی نصب
        b,ctx,pg,errs=await load(p,native())
        for _ in range(40):
            if 'otaOk' in await calls(pg): break
            await pg.wait_for_timeout(250)
        c=await calls(pg)
        chk('A باز شدن برنامه: اول «بروزرسانی بدون نصب» پرسیده می‌شود',c.count('otaCheck')==1 and 'updCheck' not in c,c)
        chk('A بعد از بالا آمدنِ فهرست، پیام «صفحه سالم است» (otaOk) رفت',c.count('otaOk')==1,c)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100})")
        c=await calls(pg); bx=await box(pg)
        chk('A دانلودِ بسته شروع شد',c.count('otaDownload')==1,c)
        chk('A پنجره‌ی بروزرسانی باز است و «گرفته می‌شود» می‌گوید',bx['on'] and 'گرفته می‌شود' in bx['tx'] and bx['gd'],bx)
        await ev(pg,"window.__otaProg(40)"); bx=await box(pg)
        chk('A درصد پیشرفت نشان داده می‌شود',('۴۰' in bx['go']),bx['go'])
        await ev(pg,"window.__otaReady(999)"); bx=await box(pg)
        chk('A آماده: می‌گوید نصب لازم نیست',bx['on'] and 'نصب لازم نیست' in bx['tx'],bx['tx'])
        chk('A دکمه «بله، تازه شود»',('تازه شود' in bx['go']) and not bx['gd'],bx['go'])
        chk('A «Install anyway» دیده نمی‌شود (نه در پنجره، نه راهنما)',bx['h']=='none' and 'Install anyway' not in bx['tx'] and 'نصب شود' not in bx['go'],bx)
        await ev(pg,"document.getElementById('updGo').click()"); await pg.wait_for_timeout(100)
        c=await calls(pg); bx=await box(pg)
        chk('A دکمه: otaApply صدا زده شد',c.count('otaApply')==1,c)
        chk('A هیچ نصب APK صدا زده نشد',not any(x in c for x in ('updCheck','updDownload','updInstall')),c)
        chk('A در حال باز کردن نشان داده می‌شود',('باز می‌شود' in bx['tx'] or 'باز کردن' in bx['go']),bx)
        await ev(pg,"window.__otaErr()"); bx=await box(pg)
        chk('A خطا در باز کردن: پنجره بسته و پیام ساده',(not bx['on']) and 'انجام نشد' in bx['sup'],bx)
        chk('A بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- B) نسخه‌ای که بخش اصلی را عوض کرده: همان روش قدیمی APK (و راهنمای Install anyway)
        b,ctx,pg,errs=await load(p,native())
        await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100})")
        c=await calls(pg)
        chk('B نسخه‌ی نیازمند نصب: روش APK شروع شد',c==['updCheck'],c)
        await ev(pg,"window.__updInfo(999)"); c=await calls(pg)
        chk('B APK دانلود می‌شود',c==['updCheck','updDownload'],c)
        await ev(pg,"window.__updReady(999)"); bx=await box(pg)
        chk('B آماده‌ی نصب: متن و دکمه‌ی نصب، با هشدار «Install anyway» (چون واقعاً نصب است)',bx['on'] and 'نصب' in bx['go'] and bx['h']!='none' and 'Install anyway' in bx['tx'],bx)
        await ev(pg,"document.getElementById('updGo').click()"); c=await calls(pg)
        chk('B دکمه: updInstall (نه otaApply)',c[-1]=='updInstall' and 'otaApply' not in c,c)
        await b.close()

        # ---- C) پرسیدن نشد (اینترنت قطع/گیت‌هاب جواب نداد): هرگز سراغ APK نمی‌رود
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'same',code:100,v:'1.32',cur:100,run:100})")      # جواب بررسیِ خودکارِ شروع
        await ev(pg,"window.__nc.length=0;document.getElementById('sUpd').click()"); await pg.wait_for_timeout(50)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:false,reason:'net'})"); c=await calls(pg); bx=await box(pg)
        tt=await ev(pg,"document.getElementById('toast').textContent")
        chk('C اینترنت نیست → APK صدا زده نمی‌شود',c==[],c)
        chk('C پیام ساده می‌گوید اینترنت را ببینید، پنجره باز نمی‌شود',(not bx['on']) and 'اینترنت' in bx['sup'] and 'اینترنت' in tt,(bx,tt))
        d=await ev(pg,"document.getElementById('sUpd').disabled")
        chk('C دکمه‌ی «بررسی» دوباره فعال است',d==False,d)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:false,reason:'none'})"); c=await calls(pg); bx=await box(pg)
        chk('C ota.json نیست (۴۰۴) → «آخرین نسخه»، بدون APK',c==[] and 'آخرین نسخه' in bx['sup'],(c,bx))
        chk('C بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- D) آخرین نسخه
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'same',code:100,v:'1.32',cur:100,run:100})")
        c=await calls(pg); bx=await box(pg)
        chk('D آخرین نسخه: دانلود نمی‌شود، پنجره باز نمی‌شود',c==[] and not bx['on'] and 'آخرین نسخه' in bx['sup'],(c,bx))
        # ---- E) قبلاً گرفته شده ولی هنوز باز نشده
        await ev(pg,"window.__otaInfo({ok:true,state:'same',code:150,v:'1.33',cur:150,run:100})")
        c=await calls(pg); bx=await box(pg)
        chk('E گرفته‌شده ولی بازنشده: دوباره دانلود نمی‌شود و «آماده» نشان داده می‌شود',c==[] and bx['on'] and 'نصب لازم نیست' in bx['tx'],(c,bx))
        await ev(pg,"document.getElementById('updLater').click()"); bx=await box(pg)
        chk('E «بعداً» پنجره را می‌بندد',not bx['on'],bx); await b.close()

        # ---- F) خطای دانلود، سپس تلاش دوباره از تنظیمات
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaErr()")
        bx=await box(pg); tt=await ev(pg,"document.getElementById('toast').textContent")
        chk('F خطا: پنجره بسته، پیامِ ساده',(not bx['on']) and 'انجام نشد' in bx['sup'] and 'انجام نشد' in tt,(bx,tt))
        await ev(pg,"window.__nc.length=0;document.getElementById('sUpd').click()"); c=await calls(pg)
        chk('F «بررسی نسخه‌ی جدید» دوباره از بسته‌ی بی‌نصب می‌پرسد',c==['otaCheck'],c)
        chk('F بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- G) گوشی/برنامه‌ی قدیمی (بدون otaCheck): فقط روش APK، بدون خطا
        b,ctx,pg,errs=await load(p,native(ota=False,okfn=False,boot=False)); await pg.wait_for_timeout(2900)
        c=await calls(pg)
        chk('G برنامه‌ی قدیمی: همان روش APK، بدون خطا',c==['updCheck'] and not errs,(c,errs[:2])); await b.close()

        # ---- H) otaCheck هست ولی استثنا می‌دهد: باز هم سراغ APK نمی‌رود و پنجره/دکمه گیر نمی‌کند
        b,ctx,pg,errs=await load(p,native()+"window.Native.otaCheck=function(){throw new Error('x')};"); await pg.wait_for_timeout(1900)
        c=await calls(pg); d=await ev(pg,"document.getElementById('sUpd').disabled")
        chk('H otaCheck خطا بدهد → APK نه؛ دکمه‌ی بررسی فعال می‌ماند',c.count('updCheck')==0 and d==False and not errs,(c,d,errs[:2])); await b.close()

        # ---- J) خطای جاوااسکریپت در شروع: «سالم بالا آمدم» گفته نمی‌شود
        b,ctx,pg,errs=await load(p,native()+"setTimeout(function(){throw new Error('boom')},400);"); await pg.wait_for_timeout(4000)
        c=await calls(pg)
        chk('J خطای صفحه در شروع → otaOk صدا زده نمی‌شود (ناظر برمی‌گرداند)',c.count('otaOk')==0 and len(errs)>=1,(c,errs[:2]))
        chk('J ... و یک بار otaErr صدا زده شد (برنامه به جای دو دقیقه، ۲۰ ثانیه صبر می‌کند)',c.count('otaErr')==1,c); await b.close()

        # ---- L) هر گزارش شماره‌ی نسخه‌ی خودِ صفحه را می‌فرستد (از روی آدرس): صفحه‌ی کهنه نمی‌تواند نسخه‌ی تازه را تأیید کند
        import shutil,tempfile,os
        td=tempfile.mkdtemp(); bd=td+'/files/ota/b123'; shutil.copytree(ROOT,bd)
        b,ctx,pg,errs=await load(p,native(),url='file://'+bd+'/index.html')
        for _ in range(40):
            if 'otaOk' in await calls(pg): break
            await pg.wait_for_timeout(250)
        a=await cargs(pg)
        chk('L صفحه‌ی بسته‌ی b123: otaBoot و otaOk با شماره‌ی «123» رفتند',['otaBoot','123'] in a and ['otaOk','123'] in a,a)
        chk('L بدون خطا، otaErr صدا زده نمی‌شود',not any(x[0]=='otaErr' for x in a) and not errs,(a,errs[:2])); await b.close()
        b,ctx,pg,errs=await load(p,native())
        for _ in range(40):
            if 'otaOk' in await calls(pg): break
            await pg.wait_for_timeout(250)
        a=await cargs(pg)
        chk('L صفحه‌ی داخل APK (آدرس بدون b<شماره>): شماره‌ی «0» می‌رود',['otaBoot','0'] in a and ['otaOk','0'] in a,a); await b.close()
        shutil.rmtree(td,ignore_errors=True)

        # ---- M) خطا بعد از «سالم بالا آمدم» دیگر چیزی گزارش نمی‌کند (فقط خطای شروع مهم است)
        b,ctx,pg,errs=await load(p,native()+"setTimeout(function(){throw new Error('late')},6000);")
        for _ in range(40):
            if 'otaOk' in await calls(pg): break
            await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(7000); c=await calls(pg)
        chk('M خطای دیرهنگام (بعد از otaOk) باعث otaErr نمی‌شود',c.count('otaOk')==1 and c.count('otaErr')==0 and len(errs)>=1,(c,errs[:2])); await b.close()
        # خطای دوباره پشت‌سرهم فقط یک بار گزارش می‌شود
        b,ctx,pg,errs=await load(p,native()+"setTimeout(function(){throw new Error('e1')},300);setTimeout(function(){throw new Error('e2')},500);"); await pg.wait_for_timeout(3000)
        c=await calls(pg)
        chk('M دو خطا پشت‌سرهم: otaErr فقط یک بار',c.count('otaErr')==1 and c.count('otaOk')==0,c); await b.close()
        # ---- N) APK/مرورگر بدون otaErr و otaBoot: خطایی نمی‌دهد
        b,ctx,pg,errs=await load(p,native(boot=False)+"setTimeout(function(){throw new Error('x')},300);"); await pg.wait_for_timeout(2500)
        c=await calls(pg)
        chk('N Native بدون otaBoot/otaErr (APK قدیمی): بی‌صدا ادامه می‌دهد (فقط خطای خودِ آزمایش)',c.count('otaErr')==0 and all('PAGEERR x' in e or 'x' in e for e in errs) and len(errs)<=2,(c,errs[:3])); await b.close()

        # ---- K) وسط یک بروزرسانی، بررسیِ دوباره وضعیت را خراب نمی‌کند
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaProg(30)")
        await ev(pg,"document.getElementById('sUpd').click()"); await pg.wait_for_timeout(50)
        c=await calls(pg); bx=await box(pg)
        chk('K در حال گرفتن: دکمه‌ی «بررسی» دوباره نمی‌پرسد و دانلود دوباره شروع نمی‌شود',c==['otaDownload'],c)
        chk('K هنوز «در حال گرفتن» نشان می‌دهد',bx['on'] and 'گرفته می‌شود' in bx['tx'],bx)
        await ev(pg,"window.__otaReady(999)")
        await ev(pg,"window.__nc.length=0;document.getElementById('updLater').click();document.getElementById('sUpd').click()"); await pg.wait_for_timeout(50)
        c=await calls(pg); bx=await box(pg)
        chk('K آماده بود و «بعداً» زده شد؛ بررسی دستی: فقط پنجره دوباره نشان داده می‌شود (حالت بی‌نصب می‌ماند)',c==[] and bx['on'] and 'نصب لازم نیست' in bx['tx'] and bx['h']=='none',(c,bx))
        chk('K بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- I) پشتیبانِ تنظیمات: لیست مغازه با پاک شدنِ حافظه‌ی صفحه برمی‌گردد
        b,ctx,pg,errs=await load(p,native(files=True))
        await ev(pg,"(function(){document.getElementById('sr').click();})()"); await pg.wait_for_timeout(200)
        r=await ev(pg,"(function(){var t=__pp.tree[0].models[0];window.__favId=t.id;window.__favName=t.name;document.getElementById('srq').value=t.name;document.getElementById('srq').dispatchEvent(new Event('input'));return t.name})()")
        await pg.wait_for_timeout(500)
        await ev(pg,"(function(){var b=document.querySelector('#srr button.sf');b&&b.click()})()"); await pg.wait_for_timeout(1200)
        f=await ev(pg,"window.__files['pp.ls']||''")
        chk('I پشتیبان تنظیمات در فایل برنامه نوشته شد',f!='' and ('pp.set' in f) and window_has(f,'fav'),f[:120])
        files=await ev(pg,"window.__files"); await b.close()
        init=native(files=True).replace("window.__files={};","window.__files="+json.dumps(files)+";")
        b2,ctx2,pg2,errs2=await load(p,init)
        # حافظه‌ی صفحه خالی بود (صفحه‌ی تازه)، ولی لیست مغازه باید برگشته باشد
        r=await ev(pg2,"(function(){var s=JSON.parse(localStorage.getItem('pp.set')||'null');return {has:!!s,fav:s?Object.keys(s.fav||{}).length:0}})()")
        chk('I حافظه‌ی صفحه خالی بود؛ تنظیمات و لیست مغازه از فایل برگشت',r['has'] and r['fav']==1,r)
        chk('I بدون خطای صفحه',not errs2,errs2[:2]); await b2.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
def window_has(f,k): return ('"'+k+'\\"') in f or ('"'+k+'"') in f
asyncio.run(main())
