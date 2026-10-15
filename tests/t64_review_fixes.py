# اصلاح‌های بازبینیِ مستقل: «نمایش بیشتر» چند بار، کَشِ مقایسه با پنهان/نمایانِ دو عطرِ دیگر، ناموجودِ پنهان‌شده/برندِ خاموش،
# لمسِ دوباره‌ی پدر (روی صفحه‌ی تازه و روی ستاره‌ی لیست مغازه)
import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from rep_common import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:220] if i!='' else ''))
def set_js(obj):
    return "var s2=JSON.parse(localStorage.getItem('pp.set')||'{}');Object.assign(s2,%s);localStorage.setItem('pp.set',JSON.stringify(s2));"%json.dumps(obj,ensure_ascii=False)
async def page(p,seed,extra='',w=360):
    b,ctx,pg,errs=await new_page(p,w,780,'light',extra=pre_js(seed,0,extra))
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
    return b,pg,errs
async def open_report(pg,tab):
    ev=pg.evaluate
    if not await ev("document.getElementById('mk').classList.contains('on')"):
        await ev("document.getElementById('nw').click()"); await pg.wait_for_timeout(700)
    await ev("document.querySelector('#mkt2 button[data-t=%s]').click()"%tab); await pg.wait_for_timeout(500)
async def close_report(pg):
    await pg.evaluate("document.getElementById('mkx').click()"); await pg.wait_for_timeout(500)
async def main():
    async with async_playwright() as p:
        flat,mid0=await first_flat(p)
        D_=86400000
        # ---------- ۱) «نمایش بیشتر» بیش از یک بار ----------
        seed=make_seed(flat); now=seed['t']
        for g in flat[8:80]:                       # ۷۰ ردیفِ «ارزان شده»
            for ml,pr,nn in g['all']:
                seed['d']['%s|%d'%(g['id'],ml)]['p']=[[now-9*D_,int(pr*1.5)],[now-1*D_,pr]]
        b,pg,errs=await page(p,seed); ev=pg.evaluate
        await open_report(pg,'chg')
        n0=await ev("document.querySelectorAll('#mkr .mkr.pr').length")
        await ev("document.querySelector('#mkr .mkmore[data-s=down]').click()"); await pg.wait_for_timeout(300)
        n1=await ev("document.querySelectorAll('#mkr .mkr.pr').length")
        has2=await ev("document.querySelectorAll('#mkr .mkmore[data-s=down]').length")
        chk('first "show more" adds rows',n1>n0,[n0,n1])
        chk('after the first tap a second "show more" is still offered (70 rows)',has2==1,has2)
        if has2:
            await ev("document.querySelector('#mkr .mkmore[data-s=down]').click()"); await pg.wait_for_timeout(300)
            n2=await ev("document.querySelectorAll('#mkr .mkr.pr').length")
            chk('second "show more" adds rows again (not stuck)',n2>n1,[n0,n1,n2])
        chk('no page errors (show more)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- ۲) کشِ «مقایسه»: یک عطر را پنهان و دیگری را نمایان کنیم؛ تعداد برابر است ولی نتیجه باید فرق کند ----------
        b,pg,errs=await page(p,make_seed(flat)); ev=pg.evaluate
        await open_report(pg,'cmp')
        ids=await ev("[].map.call(document.querySelectorAll('#mkr .mkr.pr[data-m]'),function(r){return r.dataset.m})")
        ids=[x for i,x in enumerate(ids) if x not in ids[:i]]
        chk('compare tab has at least 3 perfumes',len(ids)>=3,ids[:4])
        if len(ids)>=3:
            m1,m2=ids[0],ids[1]
            await close_report(pg); await ev("window.__pp.setHide(%s,true)"%json.dumps(m1)); await open_report(pg,'cmp')
            now_ids=await ev("[].map.call(document.querySelectorAll('#mkr .mkr.pr[data-m]'),function(r){return r.dataset.m})")
            chk('hidden perfume 1 is gone from the compare tab',m1 not in now_ids and m2 in now_ids,[m1 in now_ids,m2 in now_ids])
            await close_report(pg); await ev("window.__pp.setHide(%s,false);window.__pp.setHide(%s,true)"%(json.dumps(m1),json.dumps(m2))); await open_report(pg,'cmp')
            now_ids=await ev("[].map.call(document.querySelectorAll('#mkr .mkr.pr[data-m]'),function(r){return r.dataset.m})")
            chk('swap: perfume 1 is back and perfume 2 is gone (same count, different perfumes)',m1 in now_ids and m2 not in now_ids,[m1 in now_ids,m2 in now_ids])
        chk('no page errors (compare cache)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- ۳) ناموجودِ یک عطرِ پنهان‌شده یا برندِ خاموش در گزارش نیاید ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light')
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        bid,mid=await pg.evaluate("(function(){var bs=window.__pp.allBrands.filter(function(b){return b.models.length>=2});var b=bs[0];return [b.id,b.models[0].id]})()")
        await b.close()
        seed=make_seed(flat); seed['d']['zzz|100'].update({'b':bid,'hm':mid})
        for label,extra,want in (('nothing hidden',"",True),('model hidden',set_js({'hide':{mid:'x | y'}}),False),('brand off',set_js({'off':{bid:1}}),False)):
            b,pg,errs=await page(p,seed,extra); ev=pg.evaluate
            await open_report(pg,'chg')
            txt=await ev("document.getElementById('mkr').innerText")
            chk('gone row "%s": %s'%(label,'shown' if want else 'not shown'),('عطر ناموجود آزمایشی' in txt)==want,txt[:60].replace('\n',' '))
            if want:
                n_q=await ev("document.querySelectorAll('#mkr .mkr[data-q]').length")
                if n_q:
                    await ev("document.querySelector('#mkr .mkr[data-q]').click()"); await pg.wait_for_timeout(600)
                    chk('tapping a gone row opens the search with its name, keyboard stays down',await ev("document.getElementById('srch').classList.contains('on')") and (await ev("document.getElementById('srq').value"))!='' and await ev("document.activeElement&&document.activeElement.id")!='srq',await ev("document.getElementById('srq').value"))
            await b.close()
        # ---------- ۴) لمسِ دوباره ----------
        b,pg,errs=await page(p,make_seed(flat)); ev=pg.evaluate
        await ev("window.__NOGHOST=0")      # در این بخش نگهبانِ لمسِ اتفاقی روشن است
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(400)
        await pg.fill('#srq','دیور'); await pg.wait_for_timeout(600)
        await ev("window.__lastOpen='';(function(){var c=document.querySelector('#srr .pc[data-id]');c.click();var g=document.querySelector('#dtc .go');if(g)g.click();var z=document.querySelector('#dtc .dpic');if(z)z.click();})()")
        await pg.wait_for_timeout(100)
        chk('double tap: the second tap does not open a shop link',await ev("window.__lastOpen")=='',await ev("window.__lastOpen"))
        chk('double tap: the second tap does not open the big photo',not await ev("document.getElementById('vw').classList.contains('on')"))
        chk('double tap: the price page is open',await ev("document.getElementById('dt').classList.contains('on')"))
        await pg.wait_for_timeout(500)
        has_go=await ev("document.querySelectorAll('#dtc .go').length")
        if has_go:
            await ev("document.querySelector('#dtc .go').click()"); await pg.wait_for_timeout(100)
            chk('a deliberate tap later opens the shop link',(await ev("window.__lastOpen")).startswith('https://'),await ev("window.__lastOpen"))
        # بسته شدنِ صفحه و لمسِ دوباره روی لیستِ زیرش
        await ev("window.__lastOpen='';document.getElementById('dtx').click();document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(200)
        chk('double tap on close: the list underneath did not open another perfume',not await ev("document.getElementById('dt').classList.contains('on')"))
        # ستاره‌ی لیست مغازه: دو بار پشت‌سرهم، فقط یکی برداشته شود
        await ev("document.getElementById('dtx').click()") if await ev("document.getElementById('dt').classList.contains('on')") else None
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(500)
        mids=await ev("[].slice.call(document.querySelectorAll('#srr .pc[data-id]'),0,3).length")
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(400)
        await pg.fill('#srq','دیور'); await pg.wait_for_timeout(600)
        three=await ev("[].slice.call(document.querySelectorAll('#srr .pc[data-id]'),0,3).map(function(c){return c.dataset.id})")
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(500)
        await ev("(function(){var ids=%s;ids.forEach(function(id,i){window.__pp.fav[id]='برند | عطر '+i})})()"%json.dumps(three))
        await ev("document.getElementById('dkF').click()"); await pg.wait_for_timeout(600)
        nf0=await ev("document.querySelectorAll('#fvr .pfv').length")
        await ev("(function(){document.querySelectorAll('#fvr .pfv')[0].click();document.querySelectorAll('#fvr .pfv')[0].click();})()"); await pg.wait_for_timeout(300)
        nf1=await ev("document.querySelectorAll('#fvr .pfv').length")
        chk('double tap on a star removes only one perfume',nf0>=3 and nf1==nf0-1,[nf0,nf1])
        await pg.wait_for_timeout(500)
        await ev("document.querySelectorAll('#fvr .pfv')[0].click()"); await pg.wait_for_timeout(300)
        chk('a later tap on the star removes the next one',await ev("document.querySelectorAll('#fvr .pfv').length")==nf1-1)
        chk('no page errors (ghost taps)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        # نگهبانِ همگانی: هر چیزی که درست بعد از عوض شدنِ صفحه زده شود، اثری ندارد؛ کمی بعد کار می‌کند
        await ev("document.getElementById('fvx').click()") if await ev("document.getElementById('fv').classList.contains('on')") else None
        await pg.wait_for_timeout(500)
        await ev("document.getElementById('dkS').click();document.getElementById('srx').click()")
        await pg.wait_for_timeout(100)
        chk('global guard: the close button tapped right after opening search is ignored',await ev("document.getElementById('srch').classList.contains('on')"))
        await pg.wait_for_timeout(500)
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(300)
        chk('global guard: a deliberate tap later closes the search',not await ev("document.getElementById('srch').classList.contains('on')"))
        await pg.wait_for_timeout(500)
        # ستاره‌ی صفحه‌ی قیمت: دو بار پشت‌سرهم یک بار حساب می‌شود
        await ev("(function(){var m=window.__pp.list[0];window.__pp.open&&0;})()")
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(500)
        await pg.fill('#srq','دیور'); await pg.wait_for_timeout(600)
        await ev("document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(500)
        f0=await ev("Object.keys(window.__pp.fav).length")
        await ev("(function(){var a=document.querySelector('#dtc .dact button[data-a=fav]');a.click();var a2=document.querySelector('#dtc .dact button[data-a=fav]');a2.click();})()"); await pg.wait_for_timeout(200)
        f1=await ev("Object.keys(window.__pp.fav).length")
        chk('global guard: double tap on the shop-list star counts once (changes by exactly one)',abs(f1-f0)==1,[f0,f1])
        # ساعتِ گوشی عقب برود: لمس‌ها قفل نمی‌مانند
        await pg.wait_for_timeout(500)
        await ev("window.__realNow=Date.now;document.getElementById('dtx').click();Date.now=function(){return window.__realNow()-600000}"); await pg.wait_for_timeout(100)
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(300)
        chk('clock set back: taps still work',not await ev("document.getElementById('srch').classList.contains('on')"))
        await ev("Date.now=window.__realNow")
        await b.close()
        # ---------- ۵) خبر: سایتی که این بار جواب نداد، خبرهای قبلی‌اش نمی‌پرد ----------
        b,pg,errs=await page(p,make_seed(flat),news_mock_js()); ev=pg.evaluate
        await ev("document.getElementById('nw').click()"); await pg.wait_for_timeout(2800)
        n1=json.loads(await ev("localStorage.getItem('pp.news')") or '{}')
        s1=[x for x in n1.get('items',[]) if x['s']=='safir']; l1=[x for x in n1.get('items',[]) if x['s']=='liliome']
        chk('first load: news from both sites saved',len(s1)>=1 and len(l1)>=1,[len(s1),len(l1)])
        await ev("document.getElementById('mkx').click()"); await pg.wait_for_timeout(300)
        await ev("window.__NEWSMODE='partial';(function(){var n=JSON.parse(localStorage.getItem('pp.news'));n.t=Date.now()-4*3600000;localStorage.setItem('pp.news',JSON.stringify(n));localStorage.setItem('pp.newsTry','0');})()")
        await ev("location.reload()"); await pg.wait_for_timeout(2500)
        await ev("window.__NEWSMODE='partial'")
        await ev("document.getElementById('nw').click()"); await pg.wait_for_timeout(3000)
        n2=json.loads(await ev("localStorage.getItem('pp.news')") or '{}')
        s2=[x for x in n2.get('items',[]) if x['s']=='safir']
        chk('second load: one site failed, its earlier news is kept',len(s2)>=1,[len(s2),n2.get('notes')])
        chk('second load: the data was refreshed for the other sites',n2.get('t',0)>n1.get('t',0),[n1.get('t'),n2.get('t')])
        chk('no page errors (news merge)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
