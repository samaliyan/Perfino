# همان آزمونِ خبر، داخل مرورگر (برای DOMParser و خوراکِ RSS)
import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,stub=None,adv=False)
        logs=[]; pg.on('console',lambda m: logs.append(m.text))
        await pg.goto('about:blank')
        await pg.add_script_tag(path=ROOT+'/core.js')
        shim="window.global=window;window.require=function(){return window.Core};window.process={exit:function(c){window.__exit=c}};"
        src=open('/home/claude/PerfumePrice/tests/t61_news.js',encoding='utf-8').read()
        await pg.add_script_tag(content=shim+src)
        await pg.wait_for_function("window.__exit!==undefined",timeout=60000)
        for l in logs: print(l)
        print('exit',await pg.evaluate("window.__exit"))
        await b.close()
asyncio.run(main())
