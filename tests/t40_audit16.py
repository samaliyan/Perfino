import asyncio,json,sys,time
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def models(pg,n=3):
    return await pg.evaluate("(function(){var o=[],t=window.__pp.tree;for(var i=0;i<t.length&&o.length<%d;i++)for(var j=0;j<t[i].models.length&&o.length<%d;j++){var m=t[i].models[j];if(/^[\\u0600-\\u06ff ]+$/.test(m.name)&&m.name.length>3)o.push({id:m.id,name:m.name,tok:m.name.split(' ')[0]})}return o})()"%(n,n))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p)
        await pg.set_viewport_size({'width':320,'height':640})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        ms=await models(pg,3); A,B,C=ms[0],ms[1],ms[2]
        # ۱) فهرست جستجو بعد از پنهان/آشکار شدنِ عطر کهنه نماند (دکمه‌ی «پنهانش کن» برداشته شده؛ همان سازوکار با __pp.setHide)
        async def hide(m,on=True):
            await pg.evaluate("window.__pp.setHide(%s,%s)"%(json.dumps(m['id']),'true' if on else 'false')); await pg.wait_for_timeout(700)
        async def found(m):
            await pg.evaluate("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
            await pg.evaluate("document.getElementById('srq').value=%s;document.getElementById('srq').dispatchEvent(new Event('input'))"%json.dumps(m['tok'])); await pg.wait_for_timeout(500)
            r=await pg.evaluate("[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(x){return x.dataset.id})")
            await pg.evaluate("document.getElementById('srx').click()"); await pg.wait_for_timeout(200); return m['id'] in r
        chk('A is found before hiding',await found(A))
        await hide(A); chk('hidden A is not found',not await found(A))
        await hide(A,False)
        await hide(B)
        chk('after unhide A + hide B: A found again',await found(A))
        chk('after unhide A + hide B: B is NOT found (index not stale)',not await found(B))
        await hide(B,False)
        await b.close()
        # ۳) رفتار صفحه با تنظیم‌های خراب
        for name,items in (('run null element',{'pp.run':json.dumps({'src':[None]})}),('model __proto__',{'pp.set':json.dumps({'model':'__proto__','theme':'auto'})}),('model constructor',{'pp.set':json.dumps({'model':'constructor'})})):
            pre="if(!sessionStorage.getItem('z')){sessionStorage.setItem('z','1');"+";".join("localStorage.setItem(%s,%s)"%(json.dumps(k),json.dumps(v)) for k,v in items.items())+"}"
            b,ctx,pg,errs=await new_page(p,extra=pre)
            await pg.goto('file://'+ROOT+'/index.html')
            try:
                await wait_ready(pg,60000); n=await pg.evaluate("window.__pp.list.length"); chk('boots with '+name,n>0 and not errs,[n,errs[:2]])
            except Exception as e: chk('boots with '+name,False,str(e)[:80])
            await b.close()
        # ۴) ردیف‌های قیمتِ هر سایت در صفحه‌ی جزئیات با اندازه‌های بزرگ
        for fs in (1,2,3):
            pre="if(!sessionStorage.getItem('f')){sessionStorage.setItem('f','1');var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.fs=%d;localStorage.setItem('pp.set',JSON.stringify(s));}"%fs
            b,ctx,pg,errs=await new_page(p,extra=pre)
            await pg.set_viewport_size({'width':320,'height':640})
            await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
            ms=await models(pg,1)
            mid=await pg.evaluate("(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++){var m=t[i].models[j];for(var k=0;k<m.variants.length;k++)for(var z=0;z<m.variants[k].sizes.length;z++)if(m.variants[k].sizes[z].srcs.length>1)return {m:m.id,k:k,z:z}}return null})()")
            await pg.evaluate("window.__pp.open && 0")
            await pg.evaluate("document.getElementById('dkS').click()")
            nm=await pg.evaluate("(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++)if(t[i].models[j].id==%s)return t[i].models[j].name})()"%json.dumps(mid['m']))
            await pg.evaluate("document.getElementById('srq').value=%s;document.getElementById('srq').dispatchEvent(new Event('input'))"%json.dumps(nm.split(' ')[0])); await pg.wait_for_timeout(400)
            await pg.evaluate("(function(){var b=document.querySelector('#srr .pc[data-id=\"%s\"]');if(b)b.click()})()"%mid['m']); await pg.wait_for_timeout(500)
            await pg.evaluate("(function(){var r=document.querySelectorAll('#dtc .sz');var t=r[%d]||r[0];if(t)t.click()})()"%0); await pg.wait_for_timeout(300)
            await pg.evaluate("[].forEach.call(document.querySelectorAll('#dtc .sz'),function(x){x.click()})"); await pg.wait_for_timeout(400)
            info=await pg.evaluate("""(function(){var rows=[].slice.call(document.querySelectorAll('#dtc .sr')),bad=[];rows.forEach(function(r){var ks=[].slice.call(r.children).map(function(c){return c.getBoundingClientRect()});
              for(var i=0;i<ks.length;i++){if(ks[i].right>innerWidth+1||ks[i].left<-1)bad.push('out');for(var j=i+1;j<ks.length;j++){var a=ks[i],c=ks[j];if(a.width&&c.width&&a.left<c.right-1&&a.right>c.left+1&&a.top<c.bottom-1&&a.bottom>c.top+1)bad.push('overlap')}}
              var sp=r.querySelector('.sp');if(sp&&sp.scrollWidth>sp.clientWidth+1)bad.push('clip')});return {n:rows.length,bad:bad.slice(0,5)}})()""")
            chk('detail shop rows fs=%d no overlap/clip at 320px'%fs,info['n']>0 and not info['bad'],info)
            h=await pg.evaluate("document.getElementById('dtx').getBoundingClientRect().height")
            chk('close button >=44px (fs=%d)'%fs,h>=43.5,h)
            await pg.screenshot(path='/tmp/w/rows_fs%d.png'%fs)
            if fs==1:
                # عکس بزرگ: خطای بارگذاری = بطری، نه صفحه‌ی سیاه
                await pg.evaluate("document.querySelector('#dtc .dpic').click()"); await pg.wait_for_timeout(500)
                await pg.evaluate("(function(){var i=document.getElementById('vwi');if(i){i.dispatchEvent(new Event('error'));i.dispatchEvent(new Event('error'))}})()"); await pg.wait_for_timeout(300)
                chk('viewer falls back to bottle on image error',await pg.evaluate("!!document.querySelector('#vwb .vfb')"))
                await pg.evaluate("window.__back()"); await pg.wait_for_timeout(200)
                await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)      # عکس، سپس صفحه‌ی قیمت و جستجو بسته شود تا لحظه‌ی مناسبِ نصب برسد
                await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
                # بازگشت کنار «بروزرسانی» (فقط کارتِ نصبِ APK)
                await pg.evaluate("window.__updReady(999999)"); await pg.wait_for_timeout(400)
                on1=await pg.evaluate("document.getElementById('updBox').classList.contains('on')")
                await pg.evaluate("window.__back()"); await pg.wait_for_timeout(5200)
                chk('update box shows, Back dismisses it and it does not pop back on its own',on1 and not await pg.evaluate("document.getElementById('updBox').classList.contains('on')"),on1)
                # واژه‌ی ممنوع دوحرفی رد شود
                await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
                await pg.evaluate("document.getElementById('bkIn').value='عط';document.getElementById('bkAdd').click()"); await pg.wait_for_timeout(300)
                chk('2-letter blocked word is refused',await pg.evaluate("(JSON.parse(localStorage.getItem('pp.set')||'{}').block||[]).length")==0)
                # اطلاعاتِ کارت: تصویر تنبل
                lazy=await pg.evaluate("""(function(){var h='<html><body><div><a href="/p/1"><img src="data:image/gif;base64,R0lGOD" data-src="/img/real.jpg" alt="x"></a><h3>عطر دیور ساواج 100 میل</h3><span>۳٬۰۰۰٬۰۰۰ تومان</span></div><div><a href="/p/2"><img src="/img/b.jpg"></a><h3>عطر شنل بلو 100 میل</h3><span>۵٬۰۰۰٬۰۰۰ تومان</span></div></body></html>';var d=new DOMParser().parseFromString(h,'text/html');return Core.extractCards(d,'https://x.com/c').map(function(c){return c.img})})()""")
                chk('lazy data: image replaced by data-src',any(x.endswith('/img/real.jpg') for x in lazy),lazy)
            chk('no page errors fs=%d'%fs,not errs,errs[:2])
            await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
