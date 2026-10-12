import asyncio,json,sys,os
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(name,cond,info=''):
    (OK if cond else BAD).append(name)
    print(('PASS ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
FAST="Object.defineProperty(window,'Core',{configurable:true,set:function(v){v.CFG.retryMs=5;Object.defineProperty(window,'Core',{value:v,writable:true,configurable:true})}});"
# شبکه‌ی ناپایدار: ۳۰٪ درخواست‌ها قطع (UnknownHost/timeout)، دیجی‌کالای آدرس اول حلقه
FLAKY=FAST+"""
(function(){var seed=7;function r(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff}
window.__flaky=0.3;window.__loopHits=0;
window.__MODE=function(u){
  if(u.indexOf('api.digikala.com/v1/categories/perfume/search/?')>=0){window.__loopHits++;return {s:0,b:'ProtocolException: Too many follow-up requests: 21'}}
  if(window.__flaky&&r()<window.__flaky)return {s:0,b:r()<.5?'UnknownHostException: Unable to resolve host "liliome.com": No address associated with hostname':'SocketTimeoutException: timeout'};
  return null}})();"""
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=FLAKY)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        st=await pg.evaluate("window.__pp.state.st")
        print({k:(v.get('ok'),v.get('n'),v.get('note'),v.get('err')) for k,v in st.items()})
        chk('digikala works despite redirect-loop URL variant (falls back)',st['digikala']['ok'] and st['digikala']['n']>1000,st['digikala'])
        chk('loop variant tried only on first page',await pg.evaluate("window.__loopHits")<=4,await pg.evaluate("window.__loopHits"))
        # با ۳۰٪ خطا و ۳ بار تلاش، احتمال شکست یک صفحه ≈ ۲.۷٪ ؛ ممکن است چند صفحه ناقص باشد
        n=await pg.evaluate("window.__pp.flat.length")
        chk('flaky network: list built (>=95% of truth)',n>=1050,n)
        inc=[k for k,v in st.items() if v.get('ok') and 'ناقص' in (v.get('note') or '')]
        print('incomplete sources after first load:',inc)
        # دور بعد: شبکه سالم → کامل می‌شود و چیزی کم نمی‌شود
        before=await pg.evaluate("window.__pp.flat.length")
        await pg.evaluate("window.__flaky=0")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        after=await pg.evaluate("window.__pp.flat.length")
        st=await pg.evaluate("window.__pp.state.st")
        chk('healthy retry completes and never loses names',after>=before and after>=1085,(before,after))
        chk('all sources complete (no ناقص)',all('ناقص' not in (v.get('note') or '') for v in st.values()),{k:v.get('note') for k,v in st.items()})
        # قطع اینترنت وسط بروزرسانی قیمت: چیزی پاک نشود
        await pg.evaluate("window.__flaky=0.9")
        names0=await pg.evaluate("JSON.stringify(window.__pp.flat.map(function(x){return x.id}))")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        names1=await pg.evaluate("JSON.stringify(window.__pp.flat.map(function(x){return x.id}))")
        chk('90% failures during price refresh: no names lost',names0==names1)
        tt=await pg.evaluate("document.getElementById('toast').textContent")
        print('toast:',tt)
        await b.close()
        # --- بار اول با خطای شدید: ناقص ولی ذخیره؛ با اینترنت سالم کامل می‌شود
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=FLAKY.replace("window.__flaky=0.3","window.__flaky=0.75"))
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        n_bad=await pg.evaluate("window.__pp.flat.length")
        st=await pg.evaluate("window.__pp.state.st")
        print('heavy-loss first load:',n_bad,{k:(v.get('ok'),v.get('n'),v.get('note'),(v.get('err') or '')[:40]) for k,v in st.items()})
        fl=await pg.evaluate("JSON.stringify(window.__pp.state.db.full)")
        await pg.evaluate("window.__flaky=0;window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        n_ok=await pg.evaluate("window.__pp.flat.length")
        chk('resume after heavy loss reaches full list',n_ok>=1085 and n_ok>=n_bad,(n_bad,n_ok))
        await b.close()
    print('PASS',len(OK),'FAIL',len(BAD))
asyncio.run(main())
