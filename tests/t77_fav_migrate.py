# ستاره‌ی لیست مغازه برای مدلی که نامش با قاعده‌ی تازه کوتاه‌تر شده، به همان مدل وصل می‌شود
import asyncio,sys,json
sys.path.insert(0,'/home/claude/perfumeprice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.goto('file://'+ROOT+'/index.html')
        await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
        pick=await pg.evaluate("(function(){var t=__pp.tree;for(var i=0;i<t.length;i++){var b=t[i];for(var j=0;j<b.models.length;j++){var m=b.models[j];if(m.name.split(' ').length<=2)return [b.name,m.name,m.id]}}return null})()")
        chk('found a model',bool(pick),pick)
        fav={'bogus.111':pick[0]+' | پرفیومز دو '+pick[1],'bogus.222':'برندِ ناموجود | عطرِ ناموجود'}
        await pg.evaluate("(function(f){var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.fav=f;localStorage.setItem('pp.set',JSON.stringify(s))})(%s)"%json.dumps(fav,ensure_ascii=False))
        await pg.reload()
        await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
        got=await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).fav")
        chk('old star moved to the new model id',pick[2] in got and got[pick[2]]==pick[0]+' | '+pick[1],got)
        chk('old id is gone',  'bogus.111' not in got)
        chk('a really missing perfume stays as it was','bogus.222' in got,got)
        errs=[e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e]
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail'); sys.exit(1 if BAD else 0)
asyncio.run(main())
