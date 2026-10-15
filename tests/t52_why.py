import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:260] if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.set_viewport_size({'width':360,'height':700})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(800)
        ev=pg.evaluate
        # عنوان‌های آزمایشی
        shown=await ev("(function(){var db=window.__pp.state.db,t=Date.now()/60000|0;var g=window.__pp.flat[0];var e=null;Object.keys(db.it).forEach(function(s){Object.keys(db.it[s]).forEach(function(k){if(!e&&db.it[s][k][2]===g.id&&db.it[s][k][1]>0)e=db.it[s][k]})});"
          "db.it.liliome['9001']=['عطر ادکلن کلینیک هپی مردانه | Clinique Happy',0,0,0,t];"
          "db.it.liliome['9002']=['تستر اورجینال عطر کلینیک هپی زنانه | Clinique Happy 100 میل ادوتویلت',0,0,0,t];"
          "db.it.liliome['9003']=['عطر ادکلن کلینیک سیمپلی 100 میل | Clinique Simply',0,'zz',100,t];"
          "return e[0]})()")
        await ev("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        async def ask(q):
            await ev("(function(q){var i=document.getElementById('whyIn');i.value=q;document.getElementById('whyGo').click()})(%s)"%repr(q)); await pg.wait_for_timeout(200)
            return await ev("document.getElementById('whyOut').innerText")
        t=await ask('کلینیک هپی')
        chk('size-less title explained',('اندازه' in t) and ('رد شد' in t),t)
        chk('tester explained',('تستر' in t),t)
        t=await ask('سیمپلی')
        chk('out-of-stock explained',('ناموجود' in t),t)
        w=shown.split(' ')[1] if len(shown.split(' '))>1 else shown
        t=await ask(shown[:12])
        chk('shown perfume says it is in the list',('در فهرست هست' in t),t[:200])
        t=await ask('زززززز')
        chk('missing perfume gives guidance',('چیزی با این نام نیست' in t) and ('بروزرسانی کامل' in t),t[:120])
        await ev("document.getElementById('whyCovB').click()"); await pg.wait_for_timeout(300)
        c=await ev("document.getElementById('whyCov').innerText")
        chk('coverage shows each store',all(n in c for n in ['لیلیوم','دیجی‌کالا']) and 'محصول دریافت شده' in c,c[:200])
        chk('coverage lists rejection reasons',('کنار گذاشته شده' in c) and ('اندازه' in c),c)
        ov=await ev("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1")
        chk('no horizontal overflow',ov)
        chk('no js errors',not errs,errs[:2])
        await pg.screenshot(path='/tmp/w/why.png')
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
