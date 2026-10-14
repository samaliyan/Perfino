import asyncio,json,sys,time
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        flat=await pg.evaluate("window.__pp.flat.slice(0,8).map(function(g){return {id:g.id,ml:g.sizes[0].ml,price:g.sizes[0].price,n:g.sizes[0].srcs.length}})")
        mid0=await pg.evaluate("(function(){var id=window.__pp.flat[0].id,t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++)for(var k=0;k<t[i].models[j].variants.length;k++)if(t[i].models[j].variants[k].id===id)return t[i].models[j].id;return ''})()")
        h0=await pg.evaluate("localStorage.getItem('pp.hist')")
        chk('first run created history',bool(h0) and len(json.loads(h0)['d'])>10,len(json.loads(h0)['d']) if h0 else 0)
        await b.close()
        now=int(time.time()*1000); D=86400000
        d={}
        def key(g): return '%s|%d'%(g['id'],g['ml'])
        g=flat[0]; d[key(g)]={'n':'الف','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'p':[[now-9*D,int(g['price']*0.7)],[now-1*D,g['price']]]}
        g=flat[1]; d[key(g)]={'n':'ب','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'p':[[now-9*D,int(g['price']*1.5)],[now-1*D,g['price']]]}
        g=flat[3]; d[key(g)]={'n':'ج','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n']+2,'ct':now,'p':[[now-9*D,g['price']]]}
        g=flat[4]; d[key(g)]={'n':'د','l':'','f':now-1*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'r':now-2*D,'p':[[now-1*D,g['price']]]}
        d['zzz|100']={'n':'عطر ناموجود آزمایشی','l':'مردانه','f':now-9*D,'s':now-3*D,'c':1,'cm':1,'ct':now-3*D,'o':now-2*D,'p':[[now-9*D,2500000]]}
        seed={'v':1,'t0':now-10*D,'t':now-3600000,'as':'','d':d}
        for w,fs in ((320,0),(360,3)):
            pre="if(!sessionStorage.getItem('mk')){sessionStorage.setItem('mk','1');localStorage.setItem('pp.hist',%s);%s}"%(json.dumps(json.dumps(seed)),"var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.fs=%d;localStorage.setItem('pp.set',JSON.stringify(s));"%fs)
            b,ctx,pg,errs=await new_page(p,extra=pre)
            await pg.set_viewport_size({'width':w,'height':640})
            await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
            tag='w%d fs%d '%(w,fs)
            await pg.evaluate("document.getElementById('sr').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(400)
            chk(tag+'report opens from search',await pg.evaluate("document.getElementById('mk').classList.contains('on')") and not await pg.evaluate("document.getElementById('srch').classList.contains('on')"))
            txt=await pg.evaluate("document.getElementById('mkr').innerText")
            for s in ('گران شده‌اند','ارزان شده‌اند','ناموجود شده‌اند','دوباره موجود شده‌اند','موجودی کم شده','تازه‌های بازار','اختلاف قیمت بین فروشگاه‌ها'):
                chk(tag+'section '+s,s in txt)
            nr=await pg.evaluate("[].map.call(document.querySelectorAll('#mkr .mkr'),function(r){return r.innerText})")
            chk(tag+'rise row',any('گران‌تر' in r for r in nr)); chk(tag+'drop row',any('ارزان‌تر' in r and 'قبلاً' in r for r in nr))
            chk(tag+'gone row with last price',any('عطر ناموجود آزمایشی' in r and '۲٬۵۰۰٬۰۰۰' in r for r in nr),[r for r in nr if 'ناموجود آزمایشی' in r])
            chk(tag+'low row',any('کم‌یاب' in r for r in nr)); chk(tag+'back row',any('دوباره موجود' in r for r in nr))
            chk(tag+'no digits in latin',not any(ch in txt for ch in 'NaN undefined'.split()) and 'NaN' not in txt and 'undefined' not in txt)
            ov=await pg.evaluate("(function(){var r=document.getElementById('mkr'),bad=[];[].forEach.call(r.querySelectorAll('.mkr,.mkr *'),function(e){var b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push(e.className+':'+Math.round(b.left)+'-'+Math.round(b.right))});return {bad:bad.slice(0,5),sw:r.scrollWidth,cw:r.clientWidth}})()")
            chk(tag+'no horizontal overflow',not ov['bad'] and ov['sw']<=ov['cw']+1,ov)
            ov2=await pg.evaluate("(function(){var rows=[].slice.call(document.querySelectorAll('#mkr .mkr')),bad=0;rows.forEach(function(r){var a=r.querySelector('.mi').getBoundingClientRect(),c=r.querySelector('.mv').getBoundingClientRect();if(a.left<c.right-1&&a.right>c.left+1)bad++});return bad})()")
            chk(tag+'name and value columns do not overlap',ov2==0,ov2)
            await pg.screenshot(path='/tmp/w/mk_%d.png'%w)
            # باز کردن عطر از ردیف
            clicked=await pg.evaluate("(function(){var r=document.querySelector('#mkr .mkr[data-m]');if(!r)return 0;r.click();return 1})()"); await pg.wait_for_timeout(500)
            chk(tag+'row opens detail',clicked and await pg.evaluate("document.getElementById('dt').classList.contains('on')") and not await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
            # از تنظیمات
            await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.getElementById('sMk').click()"); await pg.wait_for_timeout(500)
            chk(tag+'report opens from settings',await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            r=await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
            chk(tag+'back closes report',not await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            chk(tag+'no page errors',not errs,errs[:2])
            await b.close()
        # عطرِ پنهان‌شده در گزارش نمی‌آید
        pre="if(!sessionStorage.getItem('hh')){sessionStorage.setItem('hh','1');localStorage.setItem('pp.hist',%s);var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.hide={};s.hide[%s]='x | y';localStorage.setItem('pp.set',JSON.stringify(s));}"%(json.dumps(json.dumps(seed)),json.dumps(mid0))
        b,ctx,pg,errs=await new_page(p,extra=pre)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('sr').click()"); await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(400)
        nr=await pg.evaluate("[].map.call(document.querySelectorAll('#mkr .mkr'),function(r){return r.innerText})")
        chk('hidden perfume is not in the report (rise row gone)',not any('گران‌تر' in r for r in nr) and any('ارزان‌تر' in r and 'قبلاً' in r for r in nr),len(nr))
        chk('rows without a perfume page are not buttons',await pg.evaluate("document.querySelectorAll('#mkr div.mkr.nl').length>0 && document.querySelectorAll('#mkr button.mkr:not([data-m])').length==0"))
        await b.close()
        # تاریخچهٔ خراب
        b,ctx,pg,errs=await new_page(p,extra="if(!sessionStorage.getItem('c')){sessionStorage.setItem('c','1');localStorage.setItem('pp.hist','{{{');}")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        await pg.evaluate("document.getElementById('sr').click()"); await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(300)
        chk('corrupt history: report still opens',await pg.evaluate("document.getElementById('mk').classList.contains('on')") and 'undefined' not in await pg.evaluate("document.getElementById('mkr').innerText"),errs[:2])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
