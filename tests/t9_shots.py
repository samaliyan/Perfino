import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
FAST="Object.defineProperty(window,'Core',{configurable:true,set:function(v){v.CFG.retryMs=5;Object.defineProperty(window,'Core',{value:v,writable:true,configurable:true})}});"
async def main():
    async with async_playwright() as p:
        # بار اول، کند: روکش «دریافت اولیه»
        b,ctx,pg,errs=await new_page(p,360,780,'dark',extra=FAST+"window.__DELAY=60;")
        await pg.goto('file://'+ROOT+'/index.html'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='shots/first_load.png')
        ov=await pg.evaluate("document.getElementById('ov').innerText"); print('overlay:',ov.replace('\n',' | '))
        await wait_ready(pg,90000)
        await pg.evaluate("window.__DELAY=250")
        await pg.click('#gear'); await pg.wait_for_timeout(600)
        await pg.click('#sRef'); await pg.wait_for_timeout(500)
        await pg.screenshot(path='shots/refresh_busy.png')
        bt=await pg.evaluate("document.getElementById('sRef').innerText"); print('button:',bt, '| busy class:',await pg.evaluate("document.getElementById('sRef').classList.contains('busy')"))
        print('pill:',await pg.evaluate("document.getElementById('updt').textContent"))
        await pg.wait_for_function("!window.__pp.state.busy",timeout=60000); await pg.wait_for_timeout(500)
        await pg.screenshot(path='shots/refresh_done.png')
        print('toast:',await pg.evaluate("document.getElementById('toast').textContent"), await pg.evaluate("document.getElementById('toast').classList.contains('on')"))
        r=await pg.evaluate("(function(){var t=document.getElementById('toast').getBoundingClientRect(),s=document.getElementById('sheet').getBoundingClientRect();return [t.left,t.right,t.bottom,innerWidth,innerHeight,document.getElementById('toast').scrollWidth>document.getElementById('toast').clientWidth]})()")
        print('toast rect',r)
        await pg.click('#sModel button[data-v=z]'); await pg.wait_for_timeout(900)
        await pg.screenshot(path='shots/names.png')
        await pg.click('#gear'); await pg.wait_for_timeout(700); await pg.screenshot(path='shots/sheet_names.png')
        print(errs)
        await b.close()
asyncio.run(main())
