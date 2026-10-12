import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(name,cond,info=''):
    (OK if cond else BAD).append(name); print(('PASS ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,360,780,'dark',extra="localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'c'}));")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,60000); await pg.wait_for_timeout(1500)
        req=await pg.evaluate("window.__imgReq.length")
        chk('first run: image download requested for each perfume with a photo',req>1000,req)
        await pg.reload(); await wait_ready(pg,60000); await pg.wait_for_timeout(1500)
        req2=await pg.evaluate("(window.__imgReq||[]).length")
        chk('after restart: no image re-download',req2==0,req2)
        info=await pg.evaluate("(function(){var im=[].slice.call(document.querySelectorAll('.tile img'));return [im.length,im.filter(function(i){return i.src.indexOf('data:')===0}).length,im.filter(function(i){return !!i.dataset.r}).length]})()")
        chk('tiles use the phone copy (with remote as spare)',info[0]>3 and info[1]==info[0] and info[2]==info[0],info)
        # فایل محلی خراب → از اینترنت
        r=await pg.evaluate("""(function(){var im=document.querySelector('.tile img');var rem=im.dataset.r;im.dispatchEvent(new Event('error',{bubbles:false}));return [rem,im.getAttribute('src')]})()""")
        # error رویداد capture روی document است؛ ارسال مستقیم
        r2=await pg.evaluate("""(function(){var im=document.querySelectorAll('.tile img')[1];var rem=im.dataset.r;var e=new Event('error');im.dispatchEvent(e);return [rem,im.getAttribute('src'),im.dataset.r||'']})()""")
        chk('bad local file falls back to remote url',r2[1]==r2[0] and r2[2]=='',r2)
        print(errs[:2])
        await b.close()
    print('PASS',len(OK),'FAIL',len(BAD))
asyncio.run(main())
