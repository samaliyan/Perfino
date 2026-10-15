import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p)
        await pg.set_viewport_size({'width':320,'height':640})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        # نام یک عطرِ فارسی
        info=await pg.evaluate("(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++){var b=t[i];for(var j=0;j<b.models.length;j++){var m=b.models[j];if(/^[\\u0600-\\u06ff ]+$/.test(m.name)&&m.name.length>=5)return {b:b.name,m:m.name,id:m.id,n:t.reduce(function(a,x){return a+x.models.length},0)}}}})()")
        print(info)
        tok=info['m'].split(' ')[0]
        # ۱) جستجو
        vis=await pg.evaluate("(function(){var r=document.getElementById('dkS').getBoundingClientRect();return r.width>0&&r.height>=44})()")
        chk('search button visible in the bottom bar',vis)
        await pg.evaluate("document.getElementById('dkS').click()"); await pg.wait_for_timeout(300)
        chk('search overlay opens',await pg.evaluate("document.getElementById('srch').classList.contains('on')"))
        await pg.fill('#srq',tok); await pg.wait_for_timeout(500)
        res=await pg.evaluate("[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(x){return x.dataset.id})")
        chk('Persian query finds the model',info['id'] in res,len(res))
        await pg.fill('#srq','zzzqqq'); await pg.wait_for_timeout(500)
        chk('no result message',await pg.evaluate("document.querySelectorAll('#srr .pc[data-id]').length")==0 and 'چیزی پیدا نشد' in await pg.evaluate("document.getElementById('srr').innerText"))
        # لاتین: «Sauvage» یا هر مدلی که معادل لاتین دارد
        en=await pg.evaluate("(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++){var m=t[i].models[j];if(/^[\\u0600-\\u06ff ]+$/.test(m.name)){var e=Core.fa2en(m.name.split(' '),window.__pp.state.db.wd);if(e&&/^[a-z ]{5,}$/i.test(e))return {e:e.split(' ')[0],id:m.id}}}return null})()")
        if en:
            await pg.fill('#srq',en['e']); await pg.wait_for_timeout(500)
            res=await pg.evaluate("[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(x){return x.dataset.id})")
            chk('Latin spelling finds Persian-named model',en['id'] in res,[en['e'],len(res)])
        await pg.fill('#srq',tok); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/w/search.png')
        # باز کردن جزئیات: روی جستجو باز می‌شود و جستجو زیرش می‌ماند
        await pg.evaluate("document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(600)
        chk('tap result opens detail above the search (search stays under it)',await pg.evaluate("document.getElementById('dt').classList.contains('on') && document.getElementById('srch').classList.contains('on')"))
        txt=await pg.evaluate("document.querySelector('#dtc .dact button').textContent")
        chk('detail shows not-in-shop-list state',txt.startswith('☆'),txt)
        await pg.evaluate("document.querySelector('#dtc .dact button').click()"); await pg.wait_for_timeout(200)
        favs=await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('pp.set')).fav)")
        chk('detail star saves to the shop list',len(favs)==1,favs)
        await pg.evaluate("document.querySelector('#dtc .dact button').click()"); await pg.wait_for_timeout(200)
        chk('detail star toggles off',await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('pp.set')).fav).length")==0)
        await pg.evaluate("document.querySelector('#dtc .dact button').click()"); await pg.wait_for_timeout(200)
        # اندازه‌ی لمس دکمه‌ها
        hs=await pg.evaluate("[].map.call(document.querySelectorAll('#dtc .dact button'),function(x){return Math.round(x.getBoundingClientRect().height)})")
        chk('detail action buttons >=44px',all(h>=44 for h in hs),hs)
        # ۲) پنهان‌کردن: دکمه‌اش در صفحه‌ی قیمت برداشته شد؛ عطرهای پنهان‌شده‌ی قدیمی هنوز از تنظیمات برمی‌گردند
        n0=info['n']
        chk('detail has no hide button any more',await pg.evaluate("document.querySelectorAll('#dtc .dact button.warn,#dtc [data-a=hide]').length")==0)
        await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
        await pg.evaluate("window.__pp.setHide('%s',true)"%info['id']); await pg.wait_for_timeout(700)
        n1=await pg.evaluate("window.__pp.tree.reduce(function(a,x){return a+x.models.length},0)")
        chk('a hidden model leaves the list',n1==n0-1,[n0,n1])
        # فهرست پنهان در تنظیمات و بازگرداندن
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(700)
        chk('hidden list shows 1 chip',await pg.evaluate("document.querySelectorAll('#hdList .ch').length")==1)
        await pg.evaluate("document.querySelector('#hdList .ch').click()"); await pg.wait_for_timeout(500)
        n2=await pg.evaluate("window.__pp.tree.reduce(function(a,x){return a+x.models.length},0)")
        chk('restore brings it back',n2==n0,[n0,n2])
        # ۳) اندازه‌ی نوشته
        await pg.evaluate("document.querySelector('#sFs button[data-v=\"3\"]').click()"); await pg.wait_for_timeout(300)
        zs=await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--zs').trim()")
        chk('font size sets zoom 1.5',zs=='1.5',zs)
        sv=await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).fs")
        chk('font size saved',sv==3,sv)
        ov=await pg.evaluate("(function(){var s=document.getElementById('sheet');return [s.scrollWidth,s.clientWidth]})()")
        chk('settings no horizontal overflow at 1.5x / 320px',ov[0]<=ov[1]+1,ov)
        await pg.evaluate("document.getElementById('scm').click()"); await pg.wait_for_timeout(500)
        await pg.evaluate("window.__pp.open('%s')"%info['id']); await pg.wait_for_timeout(700)
        ov=await pg.evaluate("(function(){var s=document.getElementById('dtc');return [s.scrollWidth,s.clientWidth]})()")
        chk('detail no horizontal overflow at 1.5x / 320px',ov[0]<=ov[1]+1,ov)
        await pg.screenshot(path='/tmp/w/detail_fs3.png')
        await pg.evaluate("window.__back()"); await pg.wait_for_timeout(400)
        # ۴) واژه‌ی ممنوع
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(700)
        before=await pg.evaluate("window.__pp.flat.length")
        await pg.fill('#bkIn',tok); await pg.evaluate("document.getElementById('bkAdd').click()"); await pg.wait_for_timeout(800)
        after=await pg.evaluate("window.__pp.flat.length")
        chk('blocked word removes items now',after<before,[before,after])
        chk('blocked word chip shown',await pg.evaluate("document.querySelectorAll('#bkList .ch').length")==1)
        await pg.evaluate("document.querySelector('#bkList .ch').click()"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000); await pg.wait_for_timeout(800)
        back=await pg.evaluate("window.__pp.flat.length")
        chk('removing blocked word restores items after refresh',back>=before*0.98,[before,back])
        await pg.evaluate("document.getElementById('scm').click()"); await pg.wait_for_timeout(300)
        # ۵) برگشت بسته شدنِ جستجو
        await pg.evaluate("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        chk('back button closes search first',await pg.evaluate("window.__back()")==True and not await pg.evaluate("document.getElementById('srch').classList.contains('on')"))
        chk('no js errors',not errs,errs[:3])
        await b.close()
        # ۶) ماندگاری بعد از باز شدن دوباره
        print(len(OK),'pass',len(BAD),'fail')
    sys.exit(1 if BAD else 0)
asyncio.run(main())
