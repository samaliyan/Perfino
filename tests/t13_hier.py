# برند ← مدل ← جزئیات ← عکس بزرگ؛ چیدمان در ۴ مدل × ۲ رنگ × ۳ اندازه‌ی صفحه
import asyncio,json,sys,re,os
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
src=open('/home/claude/PerfumePrice/tests/t2_ui.py',encoding='utf-8').read()
CHECK=re.search(r'CHECK="""(.*?)"""',src,re.S).group(1)
EXTRA="""
function(){
 var P=[];function R(e){return e.getBoundingClientRect()}
 function inter(a,b){var w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w>1.5&&h>1.5}
 var bk=document.getElementById('bk'),br=R(bk);
 if(getComputedStyle(bk).display==='none')P.push('back button hidden');
 [].forEach.call(document.querySelectorAll('.mod .t1,.mod .t2,.mod .cl,#upd,#gear,.mod .fs2'),function(e){ if(inter(br,R(e)))P.push('back overlaps '+(e.id||e.className))});
 [].forEach.call(document.querySelectorAll('.mod .t1'),function(t){ if(t.scrollWidth>t.clientWidth+1)P.push('title ellipsized: '+t.textContent)});
 return P;
}
"""
DT="""
function(){
 var P=[];function R(e){return e.getBoundingClientRect()}
 function inter(a,b){var w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w>1.5&&h>1.5}
 var vw=innerWidth,vh=innerHeight,c=document.getElementById('dtc'),dt=document.getElementById('dt');
 if(!dt.classList.contains('on'))P.push('detail not open');
 if(c.scrollWidth>c.clientWidth+1)P.push('detail h-scroll');
 var nm=c.querySelector('.dnm'),pic=c.querySelector('.dpic'),ti=c.querySelector('.dti');
 if(nm.scrollHeight>nm.clientHeight+1+0&&!nm.style.webkitLineClamp)P.push('name overflow '+nm.scrollHeight+'/'+nm.clientHeight);
 var lh=parseFloat(getComputedStyle(nm).lineHeight);if(nm.scrollHeight>lh*3.2)P.push('name > 3 lines '+nm.textContent);
 if(inter(R(pic),R(ti)))P.push('pic/title overlap');
 var dx=R(document.getElementById('dtx'));[pic,ti].forEach(function(e){if(inter(dx,R(e)))P.push('close overlaps top')});
 [].forEach.call(c.querySelectorAll('.sz'),function(z){
  var a=R(z.querySelector('.zm')),b=R(z.querySelector('.zp')),zr=R(z);
  if(inter(a,b))P.push('size/price overlap');
  if(b.left<zr.left-1||b.right>zr.right+1||a.left<zr.left-1||a.right>zr.right+1)P.push('size row out');
  var zz=z.querySelector('.zp');if(zz.scrollWidth>zz.clientWidth+1)P.push('price clipped');
 });
 [].forEach.call(c.querySelectorAll('.vr,.dtop'),function(v){var r=R(v);if(r.left<-.5||r.right>vw+.5)P.push('block outside screen')});
 return {p:P,vars:c.querySelectorAll('.vr').length,sizes:c.querySelectorAll('.sz').length,txt:c.innerText.slice(0,160)};
}
"""
GEN="(function(){var F=window.__FX,i=0;F.digikala.forEach(function(pg){pg.forEach(function(p){i++;p.title_fa+=(i%3==0?' مردانه':i%3==1?' زنانه':'')})});F.liliome.forEach(function(pg){pg.forEach(function(p){if(p.id%4==0)p.name+=' زنانه'})})})();"
async def run(p,w,h,theme,model,errsall,shot):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'%s',model:'%s'}));"%(theme,model)
    b,ctx,pg,errs=await new_page(p,w,h,theme,extra=init)
    await pg.add_init_script(GEN)
    await pg.goto('file://'+ROOT+'/index.html')
    await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
    await pg.wait_for_timeout(700)
    probs=[];info={}
    # --- سطح ۰: برندها
    n0=await pg.evaluate("__pp.list.length")
    info['brands']=n0
    for i in [0,n0//3,n0//2,n0-1]:
        await pg.evaluate("window.__pp.model.goto(%d)"%i); await pg.wait_for_timeout(450)
        r=await pg.evaluate(CHECK); probs+=['[L0 %d] %s'%(i,x) for x in r['p']]
    # --- یک برند با بیشترین مدل و یک با نام بلند
    pick=await pg.evaluate("(function(){var t=__pp.tree;var mx=0,ln=0;t.forEach(function(b,i){if(b.models.length>t[mx].models.length)mx=i;if(b.name.length>t[ln].name.length)ln=i});return [t[mx].id,t[ln].id,t[mx].models.length]})()")
    for bid in pick[:2]:
        await pg.evaluate("__pp.open('%s')"%bid); await pg.wait_for_timeout(500)
        nav=await pg.evaluate("__pp.nav"); 
        if nav['lvl']!=1: probs.append('open brand failed')
        n1=await pg.evaluate("__pp.list.length")
        for i in sorted(set([0,n1//2,n1-1])):
            await pg.evaluate("window.__pp.model.goto(%d)"%i); await pg.wait_for_timeout(450)
            r=await pg.evaluate(CHECK); probs+=['[L1 %s %d] %s'%(bid,i,x) for x in r['p']]
            probs+=['[L1 %s %d] %s'%(bid,i,x) for x in await pg.evaluate(EXTRA)]
        if bid==pick[0] and shot: await pg.screenshot(path='/home/claude/PerfumePrice/tests/shots/h1_%s_%s_%dx%d.png'%(model,theme,w,h))
        if bid!=pick[1]:
            # جزئیات: سخت‌ترین مدل‌ها در این برند
            ids=await pg.evaluate("(function(){var b=__pp.tree.filter(function(x){return x.id=='%s'})[0];var m=b.models;var a=m.slice().sort(function(x,y){return y.name.length-x.name.length})[0],c=m.slice().sort(function(x,y){return y.variants.length-x.variants.length})[0];return [a.id,c.id]})()"%bid)
            for k,mid in enumerate(ids):
                await pg.evaluate("__pp.open('%s')"%mid); await pg.wait_for_timeout(500)
                r=await pg.evaluate(DT); probs+=['[DT %s] %s'%(mid,x) for x in r['p']]
                info['dt']=r['txt']
                if k==0 and shot: await pg.screenshot(path='/home/claude/PerfumePrice/tests/shots/dt_%s_%s_%dx%d.png'%(model,theme,w,h))
                # عکس بزرگ
                await pg.evaluate("__pp.view('%s')"%mid); await pg.wait_for_timeout(500)
                v=await pg.evaluate("(function(){var i=document.getElementById('vwi'),r=i&&i.getBoundingClientRect();return {on:document.getElementById('vw').classList.contains('on'),w:r&&r.width,h:r&&r.height,l:r&&r.left,rt:r&&r.right,t:r&&r.top,bt:r&&r.bottom,nat:i&&i.naturalWidth,vw:innerWidth,vh:innerHeight,big:i&&i.classList.contains('big')}})()")
                if not v['on'] or not v['w'] or v['l']<-1 or v['rt']>v['vw']+1 or v['t']<-1 or v['bt']>v['vh']+1 or not v['nat']: probs.append('viewer bad '+json.dumps(v))
                await pg.evaluate("document.getElementById('vw').click()"); await pg.wait_for_timeout(120)
                if await pg.evaluate("document.getElementById('vw').classList.contains('on')"): probs.append('viewer not closed by tap')
                await pg.evaluate("document.getElementById('dtx').click()"); await pg.wait_for_timeout(450)
        # بازگشت به برندها
        ok=await pg.evaluate("__pp.up()"); await pg.wait_for_timeout(450)
        if not ok or (await pg.evaluate("__pp.nav"))['lvl']!=0: probs.append('up failed')
    errsall.extend(['%s %s %dx%d: %s'%(model,theme,w,h,e) for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e])
    await b.close()
    return probs,info
async def main():
    os.makedirs('/home/claude/PerfumePrice/tests/shots',exist_ok=True)
    errsall=[];allp={}
    async with async_playwright() as p:
        for (w,h) in [(320,640),(360,780),(412,915)]:
            for theme in ['dark','light']:
                for model in ['a','c','z','h']:
                    probs,info=await run(p,w,h,theme,model,errsall,shot=(w==360))
                    key='%s %s %dx%d'%(model,theme,w,h)
                    print(key,'problems',len(probs),info.get('brands'))
                    if probs: allp[key]=probs
    for k,v in allp.items():
        print('==',k)
        for x in sorted(set(v))[:14]:print('  ',x)
    print('JS errors:',errsall)
    print('FAIL' if allp or errsall else 'PASS')
asyncio.run(main())
