# لمس واقعی: برند ← مدل ← جزئیات ← عکس بزرگ ← برگشت (هر ۴ مدل)
import asyncio,json,sys,re
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
RECT="""(function(sel,skipTile){var best=null;[].forEach.call(document.querySelectorAll(sel),function(e){var r=e.getBoundingClientRect();if(r.width<20||r.height<20)return;var cs=getComputedStyle(e);if(cs.visibility==='hidden'||parseFloat(cs.opacity)<.7)return;
 var cy=r.top+r.height/2;if(cy<150||cy>innerHeight-170)return;var d=Math.abs(cy-innerHeight*.5);if(!best||d<best.d)best={d:d,x:r.left+r.width/2,y:cy,w:r.width,id:e.dataset.id,rx:r.left+r.width*.5}});return best})"""
async def click_row(pg,model,photo=False):
    if model=='a':
        sel='.ma .pn .tile' if photo else '.ma .pn .tx'
        r=await pg.evaluate("(%s)('%s')"%(RECT.replace('cy<150||cy>innerHeight-170','false'),sel))
    else:
        r=await pg.evaluate("(%s)('%s')"%(RECT,'.mod .rw .tile' if photo else '.mod .rw .m'))
    await pg.mouse.click(r['x'],r['y']); await pg.wait_for_timeout(600)
    return r
async def run(p,model):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s'}));"%model
    b,ctx,pg,errs=await new_page(p,360,780,'dark',extra=init)
    await pg.goto('file://'+ROOT+'/index.html')
    await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
    await pg.wait_for_timeout(800)
    n0=await pg.evaluate("__pp.list.length")
    # عکس در لیست برندها → عکس بزرگ
    await click_row(pg,model,photo=True)
    v=await pg.evaluate("document.getElementById('vw').classList.contains('on')")
    chk(v,'%s: tap photo in brand list opens viewer'%model)
    await pg.mouse.click(180,400); await pg.wait_for_timeout(200)
    chk(not await pg.evaluate("document.getElementById('vw').classList.contains('on')"),'%s: tap closes viewer'%model)
    chk((await pg.evaluate("__pp.nav"))['lvl']==0,'%s: still on brands after viewer'%model)
    # لمس برند
    await click_row(pg,model)
    nav=await pg.evaluate("__pp.nav")
    chk(nav['lvl']==1 and nav['brand'],'%s: tap brand → models list %s'%(model,json.dumps(nav)))
    exp=await pg.evaluate("(function(b){var o=__pp.tree.filter(function(x){return x.id==b})[0];return {n:o.models.length,name:o.name}})(__pp.nav.brand)")
    n1=await pg.evaluate("__pp.list.length"); chk(n1==exp['n'],'%s: models list size %d == %d'%(model,n1,exp['n']))
    hdr=await pg.evaluate("(document.querySelector('.mod .t1')||document.querySelector('.mod .bn')||{}).textContent")
    chk(hdr==exp['name'],'%s: title shows brand "%s" / "%s"'%(model,hdr,exp['name']))
    chk(await pg.evaluate("getComputedStyle(document.getElementById('bk')).display!=='none'"),'%s: back button visible'%model)
    # لمس عکس مدل
    await click_row(pg,model,photo=True)
    chk(await pg.evaluate("document.getElementById('vw').classList.contains('on')"),'%s: tap photo in model list opens viewer'%model)
    await pg.mouse.click(180,400); await pg.wait_for_timeout(200)
    # لمس مدل → جزئیات
    await click_row(pg,model)
    d=await pg.evaluate("(function(){var c=document.getElementById('dtc');return {on:document.getElementById('dt').classList.contains('on'),nm:(c.querySelector('.dnm')||{}).textContent,vars:[].map.call(c.querySelectorAll('.vr'),function(v){return {h:v.querySelector('.vh').textContent,z:[].map.call(v.querySelectorAll('.sz'),function(z){return z.innerText.replace(/\\s+/g,' ')})}})}})()")
    chk(d['on'] and d['nm'],'%s: tap model opens detail: %s'%(model,json.dumps(d,ensure_ascii=False)[:150]))
    # مقایسه‌ی قیمت‌های نمایش‌داده‌شده با داده‌ی محاسبه‌شده
    tv=await pg.evaluate("(function(){var id=null;[].forEach.call(document.querySelectorAll('#dtc .dnm'),function(e){});var m=null;__pp.tree.forEach(function(b){b.models.forEach(function(x){if(x.name==document.querySelector('#dtc .dnm').textContent&&b.id==__pp.nav.brand)m=x})});return m.variants.map(function(v){return v.sizes.map(function(z){return z.ml+'|'+z.price})})})()")
    fa=lambda n:str(n).translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹'))
    def f3(n):
        s=f"{n:,}".replace(',','٬'); return fa(s)
    okp=True
    for vi,v in enumerate(d['vars']):
        for zi,z in enumerate(v['z']):
            ml,pr=tv[vi][zi].split('|')
            if fa(ml) not in z or f3(int(pr)) not in z: okp=False; print('  mismatch',z,ml,pr)
    chk(okp and len(d['vars'])==len(tv),'%s: detail sizes+prices equal computed data (%d variants)'%(model,len(tv)))
    # عکس بزرگ از جزئیات
    await pg.click('#dtc .dpic'); await pg.wait_for_timeout(500)
    chk(await pg.evaluate("document.getElementById('vw').classList.contains('on')&&document.getElementById('vwi').naturalWidth>0"),'%s: tap photo in detail → big image shown'%model)
    bigsrc=await pg.evaluate("document.getElementById('vwi').src")
    chk('liliome.com' in bigsrc or 'digikala' in bigsrc or 'safir' in bigsrc or 'hiland' in bigsrc or bigsrc.startswith('data:') or bigsrc.startswith('file:'),'%s: viewer src %s'%(model,bigsrc[:60]))
    # دکمه‌ی برگشتِ گوشی: عکس ← جزئیات ← مدل‌ها ← برندها
    seq=[]
    for i in range(4):
        seq.append(await pg.evaluate("__back()")); await pg.wait_for_timeout(500)
        st=await pg.evaluate("({vw:document.getElementById('vw').classList.contains('on'),dt:document.getElementById('dt').classList.contains('on'),lvl:__pp.nav.lvl})")
        seq.append(json.dumps(st))
    chk(seq[0]==True and '"vw": false, "dt": true' in seq[1] and seq[2]==True and '"dt": false, "lvl": 1' in seq[3] and seq[4]==True and '"lvl": 0' in seq[5] and seq[6]==False,'%s: phone Back walks viewer→detail→models→brands→exit %s'%(model,seq))
    chk(await pg.evaluate("__pp.list.length")==n0,'%s: back on brand list with %d brands'%(model,n0))
    anchor=await pg.evaluate("__pp.model.getAnchor()")
    chk(anchor==nav['brand'],'%s: back returns to the same brand (%s == %s)'%(model,anchor,nav['brand']))
    # دکمه‌ی برگشتِ روی صفحه
    await click_row(pg,model); await pg.click('#bk'); await pg.wait_for_timeout(600)
    chk((await pg.evaluate("__pp.nav"))['lvl']==0,'%s: on-screen back button works'%model)
    chk(not [e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e],'%s: no JS errors %s'%(model,errs[:2]))
    await b.close()
async def main():
    async with async_playwright() as p:
        for m in ['a','c','z','h']: await run(p,m)
    print(len(OK),'passed',len(BAD),'failed'); print('PASS' if not BAD else 'FAIL')
asyncio.run(main())
