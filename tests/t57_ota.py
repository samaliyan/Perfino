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
    return await pg.evaluate("({on:document.getElementById('updBox').classList.contains('on'),tx:document.getElementById('updBox').innerText,go:document.getElementById('updGo').innerText,gd:document.getElementById('updGo').disabled,sup:document.getElementById('sUpdT').textContent})")
async def anyinstall(pg):      # «Install anyway» نباید هیچ‌جای صفحه نوشته شده باشد
    return await pg.evaluate("/install anyway/i.test(document.documentElement.innerHTML+document.body.innerText)")
async def calls(pg): return await pg.evaluate("window.__nc.slice()")
async def cargs(pg): return await pg.evaluate("window.__na.slice()")
async def main():
    async with async_playwright() as p:
        # ---- A) بسته‌ی تازه: خودش می‌گیرد و خودش باز می‌کند؛ هیچ پنجره‌ای، هیچ دکمه‌ای
        b,ctx,pg,errs=await load(p,native())
        for _ in range(40):
            if 'otaOk' in await calls(pg): break
            await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(1700)
        c=await calls(pg)
        chk('A باز شدن برنامه: خودش «بروزرسانی بدون نصب» را می‌پرسد (بدون لمس هیچ دکمه‌ای)',c.count('otaCheck')==1 and 'updCheck' not in c,c)
        chk('A بعد از بالا آمدنِ فهرست، پیام «صفحه سالم است» (otaOk) رفت',c.count('otaOk')==1,c)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100})")
        c=await calls(pg); bx=await box(pg)
        chk('A نسخه‌ی تازه: دانلود خودکار شروع شد',c.count('otaDownload')==1,c)
        chk('A هیچ پنجره‌ای باز نشد (بی‌صدا می‌گیرد)',not bx['on'],bx)
        await ev(pg,"window.__otaProg(40)"); bx=await box(pg)
        chk('A هنگام گرفتن هم پنجره‌ای نمی‌آید',not bx['on'])
        await ev(pg,"window.__nc.length=0;window.__otaReady(999)"); await pg.wait_for_timeout(1300)
        c=await calls(pg); bx=await box(pg)
        chk('A آماده شد و کسی کاری نمی‌کرد: خودش بازش کرد (otaApply) بدون پرسیدن',c.count('otaApply')==1,c)
        chk('A هیچ نصب APK صدا زده نشد',not any(x in c for x in ('updCheck','updDownload','updInstall')),c)
        chk('A هنوز پنجره‌ای نیست',not bx['on'],bx)
        chk('A «به نسخه‌ی ... می‌رود» ذخیره شد تا بعد از باز شدن پیام بدهد',await ev(pg,"localStorage.getItem('pp.updTo')")=='999',await ev(pg,"localStorage.getItem('pp.updTo')"))
        chk('A «Install anyway» هیچ‌جای صفحه نیست',not await anyinstall(pg))
        await ev(pg,"window.__otaErr()"); bx=await box(pg)
        chk('A خطا در باز کردن: پنجره‌ای نیست و وضعیت ساده می‌گوید خودش دوباره امتحان می‌کند',(not bx['on']) and 'خودش دوباره' in bx['sup'],bx)
        chk('A بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- A2) وقتی پدر مشغول است، وسطِ کار صفحه را عوض نمی‌کند؛ بعد از بسته شدن/بی‌کاری خودش انجام می‌دهد
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)"); await pg.wait_for_timeout(1500)
        c=await calls(pg)
        chk('A2 جستجو باز است: وسطِ کار صفحه را عوض نمی‌کند',c.count('otaApply')==0,c)
        await ev(pg,"document.getElementById('srx').click()"); await pg.wait_for_timeout(4800)
        c=await calls(pg)
        chk('A2 جستجو بسته شد: همان لحظه‌ی بعدی خودش بازش کرد',c.count('otaApply')==1,c)
        await b.close()
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.dispatchEvent(new Event('pointerdown'))")      # همین الان گوشی را لمس کرد
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)"); await pg.wait_for_timeout(1500)
        chk('A2 همین الان لمس کرده: صبر می‌کند',(await calls(pg)).count('otaApply')==0)
        await pg.wait_for_timeout(15500)
        chk('A2 پانزده ثانیه دست نزد: خودش باز می‌کند',(await calls(pg)).count('otaApply')==1,await calls(pg))
        await b.close()
        # قیمت‌ها در حال گرفتن است (busy): صبر می‌کند
        b,ctx,pg,errs=await load(p,native()+"window.__DELAY=1500;"); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;document.getElementById('gear').click()"); await pg.wait_for_timeout(300)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)"); await pg.wait_for_timeout(1500)
        chk('A2 تنظیمات باز است: صبر می‌کند',(await calls(pg)).count('otaApply')==0)
        await b.close()

        # ---- B) نسخه‌ای که بخش اصلی را عوض کرده: ناچار APK؛ فقط یک دکمه‌ی «نصب»، بدون «Install anyway»
        b,ctx,pg,errs=await load(p,native())
        await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100})")
        c=await calls(pg)
        chk('B نسخه‌ی نیازمند نصب: روش APK شروع شد',c==['updCheck'],c)
        await ev(pg,"window.__updInfo(999)"); c=await calls(pg)
        chk('B APK بی‌صدا دانلود می‌شود',c==['updCheck','updDownload'],c)
        bx=await box(pg); chk('B هنگام دانلود پنجره‌ای نیست',not bx['on'],bx)
        await ev(pg,"window.__updReady(999)"); await pg.wait_for_timeout(300); bx=await box(pg)
        chk('B آماده‌ی نصب: یک کارتِ ساده با دکمه‌ی «نصب»',bx['on'] and bx['go']=='نصب' and 'فقط دکمه' in bx['tx'],bx)
        chk('B «Install anyway» و راهنمای گوگل‌پلی هیچ‌جا نیست',not await anyinstall(pg) and 'Play' not in bx['tx'],bx['tx'])
        await ev(pg,"document.getElementById('updGo').click()"); c=await calls(pg)
        chk('B لمسِ اتفاقیِ همان لحظه‌ی آمدنِ کارت نصب را شروع نمی‌کند',c[-1]!='updInstall',c)
        await pg.wait_for_timeout(900)
        await ev(pg,"document.getElementById('updGo').click()"); c=await calls(pg)
        chk('B دکمه: updInstall (نه otaApply)',c[-1]=='updInstall' and 'otaApply' not in c,c)
        await ev(pg,"window.__back&&0"); await b.close()
        # کارتِ APK وسطِ کارِ پدر نمی‌پرد؛ «برگشت» کارت را می‌بندد و دوباره نمی‌پرد
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(800)
        bx=await box(pg); chk('B جستجو باز است: کارتِ نصب وسطِ کار نمی‌پرد',not bx['on'],bx)
        await ev(pg,"document.getElementById('srx').click()"); await pg.wait_for_timeout(4800); bx=await box(pg)
        chk('B جستجو بسته شد: کارتِ نصب نشان داده می‌شود',bx['on'],bx)
        await ev(pg,"window.__back()"); await pg.wait_for_timeout(300); await pg.wait_for_timeout(4800); bx=await box(pg)
        chk('B «برگشت» کارت را می‌بندد و دوباره نمی‌پرد',not bx['on'],bx); await b.close()
        # «بعداً» هم همین‌طور؛ و اگر نصب‌کننده لغو شد، دکمه دوباره کار می‌کند (نه «در حال نصب…» برای همیشه)
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(5200)
        bx=await box(pg); chk('B2 بی‌کار بود: کارتِ نصب آمد',bx['on'],bx)
        await ev(pg,"document.getElementById('updLater').click()"); await pg.wait_for_timeout(9000); bx=await box(pg)
        chk('B2 «بعداً» زده شد: تا نه ثانیه بعد هم برنگشت',not bx['on'],bx)
        await ev(pg,"window.__resume()"); await pg.wait_for_timeout(5000); bx=await box(pg)
        chk('B2 با باز و بسته شدنِ برنامه هم تا سه ساعت برنمی‌گردد',not bx['on'],bx)
        await b.close()
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'apk',code:999,v:'9.9',cur:100,run:100});window.__updInfo(999);window.__updReady(999)"); await pg.wait_for_timeout(5200)
        await ev(pg,"document.getElementById('updGo').click()"); await pg.wait_for_timeout(300); bx=await box(pg)
        chk('B3 «نصب» زده شد: دکمه «در حال نصب…» و غیرفعال',bx['gd'] and 'نصب' in bx['go'],bx)
        await ev(pg,"window.__resume()"); await pg.wait_for_timeout(1500); bx=await box(pg)
        chk('B3 همان لحظه‌ی برگشتن هنوز «در حال نصب…» است (نصب‌کننده ممکن است هنوز باز باشد)',bx['gd'],bx)
        await pg.wait_for_timeout(20500); bx=await box(pg)
        chk('B3 نصب‌کننده لغو شد و برنامه برگشت: دکمه دوباره فعال است',bx['on'] and not bx['gd'] and bx['go']=='نصب',bx)
        await b.close()
        # دانلودِ ناموفقِ پشت‌سرهم شمرده می‌شود (فاصله‌ی بررسی بیشتر می‌شود) و با موفقیت صفر می‌شود
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        for i in range(2):
            await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100})"); await ev(pg,"window.__otaErr()"); await ev(pg,"window.__nc.length=0")
        chk('B4 دو دانلودِ ناموفق شمرده شد',await ev(pg,"localStorage.getItem('pp.updFail')")=='2',await ev(pg,"localStorage.getItem('pp.updFail')"))
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaReady(999)")
        chk('B4 با دانلودِ موفق شمارنده صفر شد',await ev(pg,"localStorage.getItem('pp.updFail')")=='0',await ev(pg,"localStorage.getItem('pp.updFail')"))
        await b.close()

        # ---- C) پرسیدن نشد (اینترنت قطع/گیت‌هاب جواب نداد): هرگز سراغ APK نمی‌رود، خودش بعداً دوباره می‌پرسد
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'same',code:100,v:'1.32',cur:100,run:100})")      # جواب بررسیِ خودکارِ شروع
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:false,reason:'net'})"); c=await calls(pg); bx=await box(pg)
        chk('C اینترنت نیست → APK صدا زده نمی‌شود',c==[],c)
        chk('C پنجره‌ای باز نمی‌شود؛ وضعیتِ تنظیمات ساده می‌گوید',(not bx['on']) and 'بپرسم' in bx['sup'],bx)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:false,reason:'none'})"); c=await calls(pg); bx=await box(pg)
        chk('C ota.json نیست (۴۰۴) → «آخرین نسخه»، بدون APK',c==[] and 'آخرین نسخه' in bx['sup'],(c,bx))
        # ۲۰ دقیقه بعد خودش دوباره می‌پرسد؛ زودتر نه
        await ev(pg,"window.__nc.length=0;window.__resume()"); chk('C کمتر از ۲۰ دقیقه: دوباره نمی‌پرسد',(await calls(pg)).count('otaCheck')==0,await calls(pg))
        await ev(pg,"localStorage.setItem('pp.updt',String(Date.now()-21*60000));window.__resume()"); await pg.wait_for_timeout(100)
        chk('C بیش از ۲۰ دقیقه گذشت: خودش دوباره می‌پرسد',(await calls(pg)).count('otaCheck')==1,await calls(pg))
        chk('C بدون خطای صفحه',not errs,errs[:2]); await b.close()

        # ---- D) آخرین نسخه
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__nc.length=0;window.__otaInfo({ok:true,state:'same',code:100,v:'1.32',cur:100,run:100})")
        c=await calls(pg); bx=await box(pg)
        chk('D آخرین نسخه: دانلود نمی‌شود، پنجره باز نمی‌شود',c==[] and not bx['on'] and 'آخرین نسخه' in bx['sup'],(c,bx))
        # ---- E) قبلاً گرفته شده ولی هنوز باز نشده: دوباره دانلود نمی‌شود، خودش باز می‌کند
        await ev(pg,"window.__otaInfo({ok:true,state:'same',code:150,v:'1.33',cur:150,run:100})"); await pg.wait_for_timeout(1300)
        c=await calls(pg); bx=await box(pg)
        chk('E گرفته‌شده ولی بازنشده: دوباره دانلود نمی‌شود و خودش باز می‌کند',c==['otaApply'] and not bx['on'],(c,bx)); await b.close()

        # ---- F) خطای دانلود: پیامِ آرام، بعداً خودش دوباره
        b,ctx,pg,errs=await load(p,native()); await pg.wait_for_timeout(1900)
        await ev(pg,"window.__otaInfo({ok:true,state:'new',code:999,v:'9.9',cur:100,run:100});window.__otaErr()")
        bx=await box(pg); tt=await ev(pg,"(function(){var t=document.getElementById('toast');return t.classList.contains('on')?t.textContent:''})()")
        chk('F خطا: پنجره‌ای نیست، پیامِ ساده در تنظیمات و بدون پیامِ مزاحم روی صفحه',(not bx['on']) and 'خودش دوباره' in bx['sup'] and 'انجام نشد' not in tt,(bx,tt))
        await ev(pg,"window.__nc.length=0;document.getElementById('sUpd').click()"); c=await calls(pg)
        chk('F دکمه‌ی آزمایشیِ تنظیماتِ پیشرفته دوباره از بسته‌ی بی‌نصب می‌پرسد',c==['otaCheck'],c)
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
        chk('K در حال گرفتن: بررسیِ دوباره، دانلود را از نو شروع نمی‌کند',c==['otaDownload'],c)
        chk('K هنوز پنجره‌ای نیست',not bx['on'],bx)
        await ev(pg,"window.__otaReady(999)"); await pg.wait_for_timeout(1300)
        c=await calls(pg); chk('K آماده شد و خودش بازش کرد (فقط یک بار)',c.count('otaApply')==1 and c.count('otaDownload')==1,c)
        await ev(pg,"document.getElementById('sUpd').click()"); await pg.wait_for_timeout(100)
        chk('K در حال بازشدن: بررسیِ دوباره دوباره بازش نمی‌کند',(await calls(pg)).count('otaApply')==1,await calls(pg))
        chk('K بدون خطای صفحه',not errs,errs[:2]); await b.close()
        # پیامِ «برنامه بروز شد» بعد از باز شدنِ نسخه‌ی تازه
        b,ctx,pg,errs=await load(p,native()+"localStorage.setItem('pp.updTo','100');"); await pg.wait_for_timeout(3600)
        t=await ev(pg,"document.getElementById('toast').textContent")
        chk('K بعد از بروزرسانی، پیامِ کوتاهِ «برنامه بروز شد» می‌آید',('بروز شد' in t),t)
        chk('K و برای بار بعد پاک شد',await ev(pg,"localStorage.getItem('pp.updTo')")=='0',await ev(pg,"localStorage.getItem('pp.updTo')")); await b.close()
        # خاموش (فقط برای آزمایش): هیچ بررسیِ خودکاری نمی‌کند
        b,ctx,pg,errs=await load(p,native()+"localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'a',updAuto:0}));"); await pg.wait_for_timeout(2600)
        chk('K حالت «خاموش»: بررسیِ خودکار نمی‌کند',(await calls(pg)).count('otaCheck')==0,await calls(pg)); await b.close()

        # ---- I) پشتیبانِ تنظیمات: لیست مغازه با پاک شدنِ حافظه‌ی صفحه برمی‌گردد
        b,ctx,pg,errs=await load(p,native(files=True))
        await ev(pg,"(function(){var t=__pp.tree[0].models[0];window.__favId=t.id;window.__pp.open(t.id)})()"); await pg.wait_for_timeout(600)
        await ev(pg,"document.querySelector('#dtc .dact button[data-a=fav]').click()"); await pg.wait_for_timeout(1200)
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
