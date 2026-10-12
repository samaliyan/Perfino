import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,360,780,'dark',extra="localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'a'}));")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg)
        cdp=await ctx.new_cdp_session(pg)
        await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})   # شبیه‌سازی گوشی ضعیف‌تر
        for m in 'aczh':
            ms=await pg.evaluate("""function(m){return new Promise(function(res){var t=performance.now();window.__pp.mount(m);document.body.offsetHeight;requestAnimationFrame(function(){requestAnimationFrame(function(){res(Math.round(performance.now()-t))})})})}""",m)
            print('mount+first frames',m,ms,'ms (CPU x4 slower)')
        # فریم‌های اسکرول در مدل ز و ح
        for m in 'zh':
            await pg.evaluate("window.__pp.mount('%s')"%m); await pg.wait_for_timeout(400)
            r=await pg.evaluate("""function(){return new Promise(function(res){var sc=document.querySelector('.scl'),n=0,t0=performance.now(),worst=0,last=t0;function f(t){var d=t-last;last=t;if(d>worst)worst=d;sc.scrollTop+=40;if(++n<60)requestAnimationFrame(f);else res([Math.round(worst),Math.round((performance.now()-t0)/60)])}requestAnimationFrame(f)})}""")
            print('scroll 60 frames',m,'worst frame ms',r[0],'avg',r[1],'(CPU x4 slower)')
        print(errs)
        await b.close()
asyncio.run(main())
