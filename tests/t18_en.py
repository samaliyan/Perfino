# حروف چرخ، فقط فارسی، کلید انگلیسی، یادگیری نام برند
import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
LAT="(function(){var F=window.__FX,n=0;F.digikala.forEach(function(pg){pg.forEach(function(p){n++;if(n%40==0)p.title_fa='Zzqx Wnrk Eau de Parfum 100ml'})})})();"
async def go(p,en,model='a',w=360,h=780):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s',en:%s}));"%(model,'true' if en else 'false')+LAT
    b,ctx,pg,errs=await new_page(p,w,h,'dark',extra=init)
    await pg.goto('file://'+ROOT+'/index.html')
    await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
    await pg.wait_for_timeout(800)
    return b,pg,errs
LATQ="(function(){var c=0;__pp.allBrands.forEach(function(b){if(/^[A-Za-z#]/.test(b.name))c++});return c})()"
async def main():
    async with async_playwright() as p:
        for en in (False,True):
            b,pg,errs=await go(p,en)
            t=await pg.evaluate("__pp.tree.map(function(x){return x.name})")
            has=await pg.evaluate("(function(){var c=0;__pp.allBrands.forEach(function(b){b.models.forEach(function(m){m.variants.forEach(function(v){if(!/[\\u0600-\\u06FF]/.test(v.name))c++})})});return c>0})()")
            chk(has==en,'en=%s: latin-only items present=%s'%(en,has))
            await b.close()
        # حروف چرخ
        for (w,h) in ((360,780),(320,640)):
            b,pg,errs=await go(p,False,'a',w,h)
            r=await pg.evaluate("""(function(){var s=document.querySelector('.ma .ab');var masks=[],e=s;while(e&&e!==document.body){var cs=getComputedStyle(e);if((cs.webkitMaskImage&&cs.webkitMaskImage!=='none')||(cs.maskImage&&cs.maskImage!=='none')||parseFloat(cs.opacity)<1)masks.push(e.className);e=e.parentElement}
 var pn=document.querySelector('.ma .pn').getBoundingClientRect().top;var bad=[];var kids=[].slice.call(s.children);kids.forEach(function(k){var r=k.getBoundingClientRect();if(r.top<0||r.bottom>pn+1||r.height<4)bad.push(k.textContent+':'+Math.round(r.top)+'-'+Math.round(r.bottom))});return {has:!!s,masks:masks,n:kids.length,bad:bad,pn:pn}})()""")
            chk(r['has'] and not r['masks'] and not r['bad'] and r['n']>5,'%dx%d letter strip has no mask on ancestors: %s'%(w,h,json.dumps(r)))
            await pg.screenshot(path='shots/t18_%d.png'%w)
            await b.close()
        # ماژول‌های دیگر هم Latin ندارند
        for m in 'chz':
            b,pg,errs=await go(p,False,m)
            chk(not errs or not [e for e in errs if 'Failed to load' not in e],'%s: no js errors'%m)
            await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
