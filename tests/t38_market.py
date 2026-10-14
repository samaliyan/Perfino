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
        TABS={'sum':['فروشگاه‌ها با هم','روند قیمت‌ها','برندهایی که بیشتر تغییر','راهنمای گزارش'],
              'price':['اختلاف قیمت بین فروشگاه‌ها','گران شده‌اند','ارزان شده‌اند'],
              'stock':['ناموجود شده‌اند','دوباره موجود شده‌اند','موجودی کم شده','تازه‌های بازار','فقط در یک فروشگاه']}
        for w,fs in ((320,0),(360,3)):
            pre="if(!sessionStorage.getItem('mk')){sessionStorage.setItem('mk','1');localStorage.setItem('pp.hist',%s);%s}"%(json.dumps(json.dumps(seed)),"var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.fs=%d;localStorage.setItem('pp.set',JSON.stringify(s));"%fs)
            b,ctx,pg,errs=await new_page(p,extra=pre)
            await pg.set_viewport_size({'width':w,'height':640})
            await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
            tag='w%d fs%d '%(w,fs)
            await pg.evaluate("document.getElementById('sr').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(400)
            chk(tag+'report opens from search on the summary tab',await pg.evaluate("document.getElementById('mk').classList.contains('on')") and not await pg.evaluate("document.getElementById('srch').classList.contains('on')") and await pg.evaluate("document.querySelector('#mkt2 .on').dataset.t")=='sum')
            for t,secs in TABS.items():
                await pg.evaluate("document.querySelector('#mkt2 [data-t=%s]').click()"%t); await pg.wait_for_timeout(300)
                txt=await pg.evaluate("document.getElementById('mkr').innerText")
                for sec in secs: chk(tag+t+' tab has '+sec,sec in txt)
                chk(tag+t+' tab no NaN/undefined',('NaN' not in txt) and ('undefined' not in txt) and ('null' not in txt))
                ov=await pg.evaluate("(function(){var r=document.getElementById('mkr'),bad=[];[].forEach.call(r.querySelectorAll('.mkr,.mkr *,.mkk,.mkk *'),function(e){var b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push(e.className+':'+Math.round(b.left)+'-'+Math.round(b.right))});var ov=0;[].forEach.call(r.querySelectorAll('.mkr'),function(x){var a=x.querySelector('.mi').getBoundingClientRect(),c=x.querySelector('.mv').getBoundingClientRect();if(a.left<c.right-1&&a.right>c.left+1)ov++});return {bad:bad.slice(0,4),sw:r.scrollWidth,cw:r.clientWidth,ov:ov}})()")
                chk(tag+t+' tab: no overflow, columns do not overlap',not ov['bad'] and ov['sw']<=ov['cw']+1 and ov['ov']==0,ov)
                await pg.screenshot(path='/tmp/w/mk_%s_%d.png'%(t,w))
            await pg.evaluate("document.querySelector('#mkt2 [data-t=sum]').click()"); await pg.wait_for_timeout(200)
            nk=await pg.evaluate("document.querySelectorAll('#mkr .mkk').length"); chk(tag+'six summary cards',nk==6,nk)
            ns=await pg.evaluate("document.querySelectorAll('#mkr .mkr.nl').length"); chk(tag+'store rows shown',ns>=3,ns)
            await pg.evaluate("document.querySelector('#mkt2 [data-t=price]').click()"); await pg.wait_for_timeout(300)
            nr=await pg.evaluate("[].map.call(document.querySelectorAll('#mkr .mkr'),function(r){return r.innerText})")
            chk(tag+'rise row',any('گران‌تر' in r and 'قبلاً' in r for r in nr)); chk(tag+'drop row',any('ارزان‌تر' in r and 'قبلاً' in r for r in nr))
            chk(tag+'sparkline drawn',await pg.evaluate("document.querySelectorAll('#mkr .spk polyline').length")>=2)
            await pg.evaluate("document.querySelector('#mkt2 [data-t=stock]').click()"); await pg.wait_for_timeout(300)
            nr=await pg.evaluate("[].map.call(document.querySelectorAll('#mkr .mkr'),function(r){return r.innerText})")
            chk(tag+'gone row with last price',any('عطر ناموجود آزمایشی' in r and '۲٬۵۰۰٬۰۰۰' in r for r in nr),[r for r in nr if 'ناموجود آزمایشی' in r])
            chk(tag+'low row',any('کم‌یاب' in r for r in nr)); chk(tag+'back row',any('دوباره موجود' in r for r in nr))
            # «نمایش بیشتر»
            before=await pg.evaluate("document.querySelectorAll('#mkr .mkr').length")
            hasmore=await pg.evaluate("document.querySelectorAll('#mkr .mkmore').length")
            if hasmore:
                await pg.evaluate("document.querySelector('#mkr .mkmore').click()"); await pg.wait_for_timeout(300)
                after=await pg.evaluate("document.querySelectorAll('#mkr .mkr').length"); chk(tag+'show more adds rows',after>before,[before,after])
            else: chk(tag+'show more adds rows',True,'no section over 10 rows')
            # هر ردیف قابل لمس است: یا صفحه‌ی عطر یا جستجو
            allb=await pg.evaluate("document.querySelectorAll('#mkr div.mkr:not(.nl)').length+document.querySelectorAll('#mkr button.mkr:not([data-m]):not([data-q])').length")
            chk(tag+'every row is tappable',allb==0,allb)
            # ردیفِ ناموجود → جستجو با نام
            await pg.evaluate("(function(){var r=[].filter.call(document.querySelectorAll('#mkr .mkr[data-q]'),function(x){return /ناموجود آزمایشی/.test(x.innerText)})[0];if(r)r.click()})()"); await pg.wait_for_timeout(500)
            chk(tag+'gone row opens search with its name',await pg.evaluate("document.getElementById('srch').classList.contains('on') && !document.getElementById('mk').classList.contains('on') && document.getElementById('srq').value.indexOf('ناموجود')>=0"),await pg.evaluate("document.getElementById('srq').value"))
            await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.getElementById('sr').click()"); await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.querySelector('#mkt2 [data-t=price]').click()"); await pg.wait_for_timeout(300)
            clicked=await pg.evaluate("(function(){var r=document.querySelector('#mkr .mkr[data-m]');if(!r)return 0;r.click();return 1})()"); await pg.wait_for_timeout(500)
            chk(tag+'row opens detail',clicked and await pg.evaluate("document.getElementById('dt').classList.contains('on')") and not await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.getElementById('sMk').click()"); await pg.wait_for_timeout(500)
            chk(tag+'report opens from settings',await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
            chk(tag+'back closes report',not await pg.evaluate("document.getElementById('mk').classList.contains('on')"))
            chk(tag+'no page errors',not errs,errs[:2])
            await b.close()
        # عطرِ پنهان‌شده در گزارش نمی‌آید
        pre="if(!sessionStorage.getItem('hh')){sessionStorage.setItem('hh','1');localStorage.setItem('pp.hist',%s);var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.hide={};s.hide[%s]='x | y';localStorage.setItem('pp.set',JSON.stringify(s));}"%(json.dumps(json.dumps(seed)),json.dumps(mid0))
        b,ctx,pg,errs=await new_page(p,extra=pre)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('sr').click()"); await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(400)
        await pg.evaluate("document.querySelector('#mkt2 [data-t=price]').click()"); await pg.wait_for_timeout(300)
        nr=await pg.evaluate("[].map.call(document.querySelectorAll('#mkr .mkr'),function(r){return r.innerText})")
        chk('hidden perfume is not in the report (rise row gone)',not any('گران‌تر' in r and 'قبلاً' in r for r in nr) and any('ارزان‌تر' in r and 'قبلاً' in r for r in nr),len(nr))
        await b.close()
        # تاریخچهٔ خراب
        b,ctx,pg,errs=await new_page(p,extra="if(!sessionStorage.getItem('c')){sessionStorage.setItem('c','1');localStorage.setItem('pp.hist','{{{');}")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        await pg.evaluate("document.getElementById('sr').click()"); await pg.evaluate("document.getElementById('mkOpen').click()"); await pg.wait_for_timeout(300)
        chk('corrupt history: report still opens',await pg.evaluate("document.getElementById('mk').classList.contains('on')") and 'undefined' not in await pg.evaluate("document.getElementById('mkr').innerText"),errs[:2])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
