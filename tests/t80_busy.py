# در طولِ دریافتِ قیمت‌ها صفحه‌ی گوشی روشن می‌ماند: Native.busy(true) در شروع و busy(false) در پایان (حتی اگر خطا بدهد)
import asyncio,sys
sys.path.insert(0,'/home/claude/perfumeprice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra="window.__bz=[];window.Native.busy=function(on){window.__bz.push(!!on)};")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        first=await pg.evaluate("window.__bz.slice()")
        chk('first load: screen kept on during the fetch, then released',len(first)>=2 and first[0]==True and first[-1]==False,first)
        await pg.evaluate("window.__bz=[];document.getElementById('gear').click()"); await pg.wait_for_timeout(400)
        await pg.evaluate("document.getElementById('sRef').click()"); await pg.wait_for_timeout(300)
        mid=await pg.evaluate("window.__bz.slice()")
        chk('manual refresh turns it on at the start',mid[:1]==[True],mid)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000); await pg.wait_for_timeout(200)
        end=await pg.evaluate("window.__bz.slice()")
        chk('...and off at the end',end[-1]==False and end.count(True)==1,end)
        # بدونِ Native.busy (APKِ قدیمی) هیچ خطایی نیست
        await pg.evaluate("delete window.Native.busy;window.__bz=[];document.getElementById('sRef').click()")
        await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        errs2=[e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e]
        chk('old app part without busy(): no errors',not errs2,errs2)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail'); sys.exit(1 if BAD else 0)
asyncio.run(main())
