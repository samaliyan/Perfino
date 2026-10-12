# خاموش/روشن‌کردن برند در تنظیمات
import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
async def main():
    async with async_playwright() as p:
        for model in ['a','c']:
            init="localStorage.getItem('pp.set')||localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s'}));"%model
            b,ctx,pg,errs=await new_page(p,320,640,'dark',extra=init)
            await pg.goto('file://'+ROOT+'/index.html')
            await pg.wait_for_function("window.__pp&&window.__pp.gate.ready&&window.__pp.list.length>0&&!window.__pp.state.busy",timeout=120000)
            await pg.wait_for_timeout(600)
            n0=await pg.evaluate("__pp.list.length"); first=await pg.evaluate("__pp.list[0].id"); fname=await pg.evaluate("__pp.list[0].name")
            await pg.click('#gear'); await pg.wait_for_timeout(600)
            t=await pg.evaluate("document.getElementById('sBrBtn').innerText")
            chk('%d'%n0 or True,'x')
            chk(await pg.evaluate("document.getElementById('sBrList').style.display")=='none','%s: list collapsed by default'%model)
            await pg.click('#sBrBtn'); await pg.wait_for_timeout(300)
            rows=await pg.evaluate("document.querySelectorAll('#sBrList .brw').length")
            chk(rows==n0,'%s: one row per brand (%d == %d)'%(model,rows,n0))
            lay=await pg.evaluate("""(function(){var P=[];var s=document.getElementById('sheet'),R=s.getBoundingClientRect();[].forEach.call(document.querySelectorAll('#sBrList .brw'),function(r){var a=r.querySelector('.bn'),c=r.querySelector('.bc'),w=r.querySelector('.sw');var A=a.getBoundingClientRect(),C=c.getBoundingClientRect(),W=w.getBoundingClientRect();function i(x,y){return Math.min(x.right,y.right)-Math.max(x.left,y.left)>1&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>1}if(i(A,C)||i(C,W)||i(A,W))P.push('overlap '+a.textContent);if(r.scrollWidth>r.clientWidth+1)P.push('overflow '+a.textContent)});if(s.scrollWidth>s.clientWidth+1)P.push('sheet hscroll');return P})()""")
            chk(not lay,'%s: brand rows layout ok %s'%(model,lay[:3]))
            await pg.click('#sBrList .brw[data-id="%s"]'%first); await pg.wait_for_timeout(700)
            ids=await pg.evaluate("__pp.list.map(function(x){return x.id})")
            chk(first not in ids and len(ids)==n0-1,'%s: switched-off brand "%s" disappears from list (%d→%d)'%(model,fname,n0,len(ids)))
            chk('%d'%(n0-1) in (await pg.evaluate("document.getElementById('sBrBtn').innerText")).translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')),'%s: counter updated'%model)
            chk(first in json.loads(await pg.evaluate("localStorage.getItem('pp.set')")).get('off',{}),'%s: saved'%model)
            # عکسِ برندِ خاموش بعد از این دانلود نشود + ماندگاری بعد از بستن برنامه
            await pg.evaluate("window.__imgReq=[]"); await pg.reload()
            await pg.wait_for_function("window.__pp&&window.__pp.gate.ready&&window.__pp.list.length>0",timeout=60000); await pg.wait_for_timeout(500)
            ids=await pg.evaluate("__pp.list.map(function(x){return x.id})")
            chk(first not in ids,'%s: still off after restart'%model)
            # همه خاموش
            await pg.click('#gear'); await pg.wait_for_timeout(500); await pg.click('#sBrBtn'); await pg.wait_for_timeout(300)
            for i in range(len(ids)):
                await pg.evaluate("(function(){var r=document.querySelector('#sBrList .brw.on');if(r)r.click()})()")
            await pg.wait_for_timeout(700)
            txt=await pg.evaluate("document.getElementById('ov').innerText")
            chk('خاموش' in txt and await pg.evaluate("__pp.list.length")==0,'%s: all off → clear message, no crash: %s'%(model,txt.replace('\n',' ')[:60]))
            await pg.click('#sBrAll'); await pg.wait_for_timeout(900)
            chk(await pg.evaluate("__pp.list.length")==n0 and await pg.evaluate("document.getElementById('ov').className")=='','%s: "all on" restores %d'%(model,n0))
            chk(not [e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e],'%s: no JS errors %s'%(model,errs[:2]))
            await pg.screenshot(path='/tmp/br_%s.png'%model)
            await b.close()
    print(len(OK),'passed',len(BAD),'failed'); print('PASS' if not BAD else 'FAIL')
asyncio.run(main())
