# مسیرِ برند («برندها ‹ نامِ برند») و نامِ محوِ برند پشتِ فهرست: ۴ مدل × ۲ رنگ؛ لمسِ «برندها» برمی‌گرداند
import asyncio,sys,re
sys.path.insert(0,'/home/claude/perfumeprice/tests')
from harness import *
src=open('/home/claude/perfumeprice/tests/t13_hier.py',encoding='utf-8').read()
GEN=re.search(r'^GEN="(.*)"$',src,re.M).group(1)
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
PROBE="""(function(){
 function R(e){return e.getBoundingClientRect()}
 var m=document.querySelector('.mod'),o={model:m.className};
 var crb=m.querySelector('.crb'),wm=m.querySelector('.bwm');
 o.crb=crb?crb.textContent:null; o.crc=m.querySelector('.crc')?m.querySelector('.crc').textContent:null;
 o.wm=wm?wm.textContent:null;
 if(crb){var r=R(crb);o.crbIn=r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.width>20;o.crbH=r.height;
   var bk=document.getElementById('bk');o.bkOverlap=(function(a,b){return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1.5})(r,R(bk));}
 if(wm){var w=R(wm);o.wmVisible=getComputedStyle(wm).opacity>0&&w.height>20;o.wmPointer=getComputedStyle(wm).pointerEvents;}
 o.hscroll=document.documentElement.scrollWidth>innerWidth+1;
 return o})()"""
async def one(p,model,theme,w=360,h=780):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'%s',model:'%s'}));"%(theme,model)
    b,ctx,pg,errs=await new_page(p,w,h,theme,extra=init)
    await pg.add_init_script(GEN)
    await pg.goto('file://'+ROOT+'/index.html')
    await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
    await pg.wait_for_timeout(500)
    l0=await pg.evaluate(PROBE)
    chk('%s %s: no crumb/watermark on the brand list'%(model,theme),l0['crb'] is None and l0['wm'] is None,l0)
    pick=await pg.evaluate("(function(){var t=__pp.tree;var ln=0;t.forEach(function(b,i){if(b.name.length>t[ln].name.length)ln=i});return [t[0].id,t[ln].id,t[ln].name]})()")
    for bid in pick[:2]:
        await pg.evaluate("__pp.open('%s')"%bid); await pg.wait_for_timeout(600)
        o=await pg.evaluate(PROBE)
        nm=await pg.evaluate("(function(){var b=__pp.tree.filter(function(x){return x.id=='%s'})[0];return [b.name,b.en]})()"%bid)
        tag='%s %s %s'%(model,theme,nm[0])
        chk(tag+': crumb says «برندها»',o['crb']=='برندها',o)
        chk(tag+': crumb shows the brand',o['crc']==nm[0],o)
        chk(tag+': crumb inside the screen, not over the back button',o.get('crbIn') and not o.get('bkOverlap'),o)
        chk(tag+': crumb is at least 20px tall (the touch area adds 8px on each side)',(o.get('crbH') or 0)>=20,o.get('crbH'))
        chk(tag+': brand-name background is there and is the Latin name',o['wm']==(nm[1] or '').strip() and o.get('wmVisible') and o.get('wmPointer')=='none',o)
        chk(tag+': no sideways scroll',not o['hscroll'])
        await pg.evaluate("document.querySelector('.crb').click()"); await pg.wait_for_timeout(500)
        nav=await pg.evaluate("__pp.nav")
        chk(tag+': tapping «برندها» goes back to the brand list',nav['lvl']==0,nav)
        l0=await pg.evaluate(PROBE)
        chk(tag+': back on the list: no crumb',l0['crb'] is None,l0)
    errs=[e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e]
    chk('%s %s: no js errors'%(model,theme),not errs,errs)
    await b.close()
async def main():
    async with async_playwright() as p:
        for m in ['a','c','z','h']:
            for t in ['dark','light']: await one(p,m,t)
    print(len(OK),'pass',len(BAD),'fail')
    sys.exit(1 if BAD else 0)
asyncio.run(main())
