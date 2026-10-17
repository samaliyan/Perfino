# دور ۱ بازبینی سخت‌گیرانه: دکمه‌ی بستن تنظیمات، حافظه‌ی نیمه‌خراب، دریافتِ بی‌تغییر درخت را دوباره نمی‌سازد
import asyncio,json,sys
sys.path.insert(0,'/home/claude/perfumeprice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        # ۱) دکمه‌ی «بستن» در تنظیمات
        n0=await pg.evaluate('window.__pp.list.length')
        await pg.click('#gear'); await pg.wait_for_timeout(700)
        r=await pg.evaluate("(function(){var b=document.getElementById('sClose');if(!b)return null;var r=b.getBoundingClientRect();return {w:r.width,h:r.height,top:r.top,inview:r.top>=0&&r.bottom<=innerHeight,txt:b.innerText}})()")
        chk('settings has a visible close button, big enough to touch',bool(r) and r['inview'] and r['h']>=44 and r['w']>=60,r)
        await pg.click('#sClose'); await pg.wait_for_timeout(700)
        chk('the close button closes settings',await pg.evaluate("(function(){var s=document.getElementById('sheet').getBoundingClientRect();return s.top>=innerHeight-2})()"))
        # ۲) دریافتِ بی‌تغییر: درخت دوباره ساخته نمی‌شود
        await pg.evaluate("window.__treeSrc='probe'")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_timeout(3000)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        src=await pg.evaluate("window.__treeSrc")
        chk('refresh with unchanged data does not rebuild the tree',src=='probe',src)
        # ۲.۵) نوار وضعیت = بروزرسانی؛ اندازه‌ی نوشته بالای تنظیمات
        await pg.evaluate("window.__pp.state.busy=false")
        pos=await pg.evaluate("(function(){var a=document.querySelector('#sFs').getBoundingClientRect().top,b=document.querySelector('#sTheme').getBoundingClientRect().top;return a<b})()")
        chk('font size setting comes before theme in settings',pos)
        await pg.evaluate("window.__refN=0;var o=window.__pp.refresh;")
        await pg.evaluate("document.getElementById('toast').classList.remove('on');document.getElementById('toast').textContent=''")
        await pg.click('#upd'); await pg.wait_for_function("document.getElementById('toast').textContent.indexOf('بروزرسانی')>=0",timeout=60000)
        chk('tapping the status pill starts an update',True)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        # ۲.۶) دروازه‌ی ورودِ بار اول: بعد از ۳۰ ثانیه، «ادامه» هست
        await pg.evaluate("window.__gateTest(40000)"); await pg.wait_for_timeout(300)
        chk('gate: after 30 s with a ready list there is a way in',await pg.evaluate("!!document.getElementById('goon')"))
        await pg.click('#goon'); await pg.wait_for_timeout(700)
        chk('gate: the way in works and the overlay disappears',await pg.evaluate("window.__pp.state.db.ready===true && document.getElementById('ov').className===''"))
        await b.close()
        # ۳) حافظه‌ی نیمه‌خراب (ردیفِ null): برنامه بالا می‌آید، از نو دریافت می‌کند، بوت‌لوپ ندارد
        bad=json.dumps({"v":3,"fv":5,"g":{"1":None},"it":{"liliome":None},"t":{},"full":{}})
        b,ctx,pg,errs=await new_page(p,mobile=True,extra="try{localStorage.setItem('pp.db',%s)}catch(e){}"%json.dumps(bad))
        await pg.goto('file://'+ROOT+'/index.html'); 
        try:
            await wait_ready(pg,180000); good=True
        except Exception as e: good=False
        chk('a half-corrupt stored database does not kill the app (it refetches)',good,errs[:2] if errs else '')
        n=await pg.evaluate("window.__pp?window.__pp.list.length:-1")
        chk('...and the list is the same as on a clean start',n==n0 and n>0,(n,n0))
        await b.close()
    print('PASS',len(OK),'FAIL',len(BAD)); sys.exit(1 if BAD else 0)
asyncio.run(main())
