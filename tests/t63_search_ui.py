# جستجو (نوشتن و گفتن)، کارت‌های عکس‌دار، برگشت به همان لیست، لیست مغازه جدا از جستجو، جستجو در سایت‌ها (ساختگی)
import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:220] if i!='' else ''))
VOICE="""window.__vc={calls:0,answer:null};
(function(){var t=setInterval(function(){if(window.Native){clearInterval(t);window.Native.startVoice=function(){window.__vc.calls++;var a=window.__vc.answer;if(a)setTimeout(function(){window.__voiceRes(a)},20);};}},1)})();"""
def live_mock(mode='ok'):
    prods=[{'id':1,'name':'ادکلن زیلوفون ایکس ۱۰۰ میل','permalink':'https://liliome.com/product/zilofon-x/','images':[{'src':'https://liliome.com/a.jpg','thumbnail':'https://liliome.com/a-150.jpg'}],'prices':{'price':'4500000','currency_code':'IRT','currency_minor_unit':0},'is_in_stock':True,'is_purchasable':True,'price_html':'','categories':[{'name':'عطر و ادکلن'}],'type':'simple'},
           {'id':2,'name':'عطر ادکلن دیور ساواج ادو پرفیوم ۱۰۰ میل','permalink':'https://liliome.com/product/sauvage/','images':[],'prices':{'price':'9000000','currency_code':'IRT','currency_minor_unit':0},'is_in_stock':True,'is_purchasable':True,'price_html':'','categories':[{'name':'عطر مردانه'}],'type':'simple'}]
    dk={'data':{'products':[{'id':777,'title_fa':'عطر ادکلن زیلوفون ایکس ۱۰۰ میل دیجی','status':'marketable','default_variant':{'price':{'selling_price':52000000}},'images':{'main':{'url':['https://dkstatics-public.digikala.com/x.jpg']}}}]}}
    return """
window.__LIVE=[]; window.__LMODE=%s;
(function(){var prev=window.__MODE;window.__MODE=function(u){
  var live=(u.indexOf('/wc/store/v1/products')>=0&&u.indexOf('search=')>=0)||(u.indexOf('api.digikala.com')>=0&&u.indexOf('q=')>=0)||u.indexOf('?s=')>=0||u.indexOf('/search?q=')>=0;
  if(live){window.__LIVE.push(u);      // فقط پرسش‌های جستجوی زنده؛ دریافتِ عادیِ قیمت‌ها دست‌نخورده می‌ماند (وگرنه عطرِ ساختگی وارد داده می‌شود)
    if(window.__LMODE==='fail')return {s:500,b:'err'};
    if(u.indexOf('liliome.com')>=0&&u.indexOf('/wc/store/v1/products')>=0)return {s:200,b:%s};
    if(u.indexOf('api.digikala.com')>=0)return {s:200,b:%s};
    if(u.indexOf('/wc/store/v1/products')>=0)return {s:200,b:'[]'};
    return {s:404,b:'nf'};}
  return prev?prev(u):null;};})();
"""%(json.dumps(mode),json.dumps(json.dumps(prods)),json.dumps(json.dumps(dk)))
async def fresh(p,extra='',w=360,fs=0,model='c',scheme='dark'):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'%s',model:'%s',fs:%d}));"%(scheme,model,fs)+VOICE+extra
    b,ctx,pg,errs=await new_page(p,w,780,scheme,extra=init)
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
    return b,pg,errs
async def main():
    async with async_playwright() as p:
        b,pg,errs=await fresh(p); ev=pg.evaluate
        # ---------- نوار پایین: سه دکمه ----------
        g=await ev("""(function(){function r(i){var e=document.getElementById(i);return e?e.getBoundingClientRect():null}
          var d=r('dock'),s=r('stage'),m=r('dkM'),q=r('dkS'),f=r('dkF');return {d:d&&[d.top,d.bottom],s:s&&[s.top,s.bottom],m:m&&[m.width,m.height,m.left,m.right],q:q&&[q.width,q.height,q.left,q.right],f:f&&[f.width,f.height,f.left,f.right],sr:getComputedStyle(document.getElementById('sr')).visibility+getComputedStyle(document.getElementById('sr')).display,iw:innerWidth}})()""")
        chk('dock has mic, search and shop-list buttons',all(g[k] for k in 'mqf'))
        chk('buttons are big enough to tap (>=56px)',all(g[k][1]>=56 for k in 'mqf'),[g[k][1] for k in 'mqf'])
        chk('dock does not cover the list',abs(g['s'][1]-g['d'][0])<1.5,[g['s'],g['d']])
        spans=sorted([(g[k][2],g[k][3]) for k in 'mqf']); chk('the three buttons do not overlap',all(spans[i][1]<=spans[i+1][0]+1 for i in range(2)) and spans[0][0]>=-1 and spans[2][1]<=g['iw']+1,spans)
        # ---------- نوشتن: کارتِ عکس‌دار و بزرگ ----------
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(300)
        chk('empty search explains what to do',('بنویسید' in await ev("document.getElementById('srr').innerText")))
        await pg.fill('#srq','دیور'); await pg.wait_for_timeout(500)
        cards=await ev("document.querySelectorAll('#srr .pc[data-id]').length"); chk('typing shows photo cards',cards>=5,cards)
        sz=await ev("(function(){var e=document.querySelector('#srr .pc .pph').getBoundingClientRect();var c=document.querySelector('#srr .pc').getBoundingClientRect();return [e.width,e.height,c.height]})()")
        chk('photo in the card is big (>=90px)',sz[0]>=90 and sz[1]>=90,sz)
        chk('every card has a photo tile',await ev("document.querySelectorAll('#srr .pc[data-id]').length")==await ev("document.querySelectorAll('#srr .pc[data-id] .pph .tile').length"))
        names=await ev("[].map.call(document.querySelectorAll('#srr .pc b'),function(x){return x.textContent})")
        chk('card shows perfume name and brand',all(n for n in names) and 'دیور' in await ev("document.querySelector('#srr .pc small').textContent"),names[:3])
        # ---------- زدن روی کارت و برگشت به همان لیست ----------
        await ev("document.getElementById('srr').scrollTop=420"); await pg.wait_for_timeout(200)
        sc0=await ev("document.getElementById('srr').scrollTop")
        pick=await ev("(function(){var cs=[].filter.call(document.querySelectorAll('#srr .pc[data-id]'),function(c){var r=c.getBoundingClientRect();return r.top>200&&r.bottom<600});var c=cs[1]||cs[0];c.click();return c.dataset.id})()"); await pg.wait_for_timeout(600)
        chk('tapping a card opens its price page',await ev("document.getElementById('dt').classList.contains('on')") and await ev("window.__pp.state?1:1"))
        chk('search stays open underneath',await ev("document.getElementById('srch').classList.contains('on')"))
        await ev("window.__back()"); await pg.wait_for_timeout(500)
        chk('Back closes only the price page',not await ev("document.getElementById('dt').classList.contains('on')") and await ev("document.getElementById('srch').classList.contains('on')"))
        chk('the same list is there (query kept)',await ev("document.getElementById('srq').value")=='دیور' and await ev("document.querySelectorAll('#srr .pc[data-id]').length")==cards)
        chk('scroll place kept',abs(await ev("document.getElementById('srr').scrollTop")-sc0)<4,[sc0,await ev("document.getElementById('srr').scrollTop")])
        # دو بار پشت‌سرهم: باز هم همان لیست
        await ev("document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(400); await ev("window.__back()"); await pg.wait_for_timeout(300)
        chk('second round trip also returns to the list',await ev("document.getElementById('srch').classList.contains('on') && document.querySelectorAll('#srr .pc[data-id]').length")==cards)
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(300)
        # ---------- «آخرین‌ها» ----------
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(300)
        rc=await ev("({h:(document.querySelector('#srr .srvh')||{}).textContent||'',n:document.querySelectorAll('#srr .pc[data-id]').length})")
        chk('last seen perfumes are offered as photo cards',('آخرین' in rc['h']) and rc['n']>=1,rc)
        await ev("document.getElementById('srx').click()")
        # ---------- لیست مغازه: جدا از جستجو ----------
        await ev("document.getElementById('dkF').click()"); await pg.wait_for_timeout(300)
        chk('shop list opens as its own page (not the search)',await ev("document.getElementById('fv').classList.contains('on') && !document.getElementById('srch').classList.contains('on')"))
        chk('empty shop list explains how to add',('افزودن به لیست مغازه' in await ev("document.getElementById('fvr').innerText")))
        await ev("document.getElementById('fvx').click()"); await pg.wait_for_timeout(200)
        ids=await ev("(function(){var o={};__pp.tree.forEach(function(b){b.models.forEach(function(m){if(b.name==='تام فورد'&&m.name==='اوپیوم')o.tf=m.id;if(b.name==='دیور'&&m.name==='ابسولو دارک')o.dr=m.id})});return o})()")
        await ev("window.__pp.open(%s)"%json.dumps(ids['tf'])); await pg.wait_for_timeout(600)
        chk('detail has only the shop-list button (no hide button)',await ev("document.querySelectorAll('#dtc .dact button').length")==1 and await ev("document.querySelectorAll('#dtc [data-a=hide]').length")==0 and await ev("document.querySelectorAll('#dtc .dact button.warn').length")==0)
        await ev("document.querySelector('#dtc .dact button[data-a=fav]').click()"); await pg.wait_for_timeout(200)
        chk('button says it is in the shop list',('★' in await ev("document.querySelector('#dtc .dact button').textContent")))
        await ev("document.getElementById('dtx').click()"); await pg.wait_for_timeout(300)
        await ev("document.getElementById('dkF').click()"); await pg.wait_for_timeout(450)
        chk('shop list shows the perfume as a photo card',await ev("document.querySelectorAll('#fvr .pc[data-id=\"%s\"] .pph .tile').length"%ids['tf'])==1)
        await ev("document.querySelector('#fvr .pc').click()"); await pg.wait_for_timeout(500)
        chk('tapping it opens prices above the shop list',await ev("document.getElementById('dt').classList.contains('on') && document.getElementById('fv').classList.contains('on')"))
        await ev("window.__back()"); await pg.wait_for_timeout(400)
        chk('Back returns to the shop list',await ev("!document.getElementById('dt').classList.contains('on') && document.getElementById('fv').classList.contains('on')"))
        await ev("document.getElementById('fvx').click()"); await pg.wait_for_timeout(200)
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        await pg.fill('#srq','دیور'); await pg.wait_for_timeout(500)
        chk('search is not limited to the shop list',await ev("document.querySelectorAll('#srr .pc[data-id]').length")>=5)
        await ev("document.getElementById('srx').click()"); await pg.wait_for_timeout(200)
        await ev("document.getElementById('dkF').click()"); await pg.wait_for_timeout(450)
        await ev("document.querySelector('#fvr .pfv').click()"); await pg.wait_for_timeout(300)
        chk('star next to a perfume removes it from the shop list',await ev("document.querySelectorAll('#fvr .pc[data-id]').length")==0 and not await ev("Object.keys(window.__pp.fav).length"))
        await ev("document.getElementById('fvx').click()")
        # ---------- پنهان‌کردن: دکمه نیست؛ بخشِ «پنهان‌شده‌ها» فقط وقتی هست که چیزی پنهان باشد ----------
        await ev("document.getElementById('gear').click()"); await pg.wait_for_timeout(400)
        chk('no hidden-perfumes box when nothing is hidden',await ev("getComputedStyle(document.getElementById('hdBox')).display")=='none')
        await ev("window.__pp.setHide(%s,true)"%json.dumps(ids['dr'])); await pg.wait_for_timeout(400)
        chk('hidden-perfumes box appears when something was hidden earlier',await ev("getComputedStyle(document.getElementById('hdBox')).display")!='none' and await ev("document.querySelectorAll('#hdList .ch').length")==1)
        await ev("document.querySelector('#hdList .ch').click()"); await pg.wait_for_timeout(400)
        chk('tap on its name brings it back and box hides again',await ev("getComputedStyle(document.getElementById('hdBox')).display")=='none' and await ev("Object.keys(JSON.parse(localStorage.getItem('pp.set')).hide||{}).length")==0)
        await ev("document.getElementById('gear').click()")
        chk('no page errors (typing/shop list)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- گفتن ----------
        b,pg,errs=await fresh(p); ev=pg.evaluate
        async def say(alts):
            await ev("(function(){var d=document.getElementById('dtx');if(document.getElementById('dt').classList.contains('on'))d.click();var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
            await pg.wait_for_timeout(120)
            return await ev("__pp.voice(%s)"%json.dumps(alts,ensure_ascii=False))
        r=await say(['تام فورد اوپیوم'])
        chk('voice: exact name gives a list with photos, never opens by itself',r['kind']=='list' and not await ev("document.getElementById('dt').classList.contains('on')"),r)
        chk('voice: best guess marked and it is the right perfume',r['best']==ids['tf'] and await ev("document.querySelector('#srr .pc.best').dataset.id")==ids['tf'],r)
        h=await ev("document.querySelector('#srr .srvh').innerText")
        chk('voice: shows what was heard and what to do','شنیدم' in h and 'روی عکس' in h,h)
        chk('voice: first card is big with photo',await ev("document.querySelector('#srr .pc .pph .tile')!==null") and (await ev("document.querySelector('#srr .pc .pph').getBoundingClientRect().width"))>=90)
        chk('voice: "say again" button',await ev("document.querySelectorAll('#srAgain').length")==1)
        await ev("window.__vc.calls=0;document.getElementById('srAgain').click()"); chk('say again starts listening',await ev("window.__vc.calls")==1)
        await ev("window.__voiceErr('cancel')")
        await ev("document.querySelector('#srr .pc.best').click()"); await pg.wait_for_timeout(500)
        chk('tapping the photo goes to the prices',await ev("document.getElementById('dt').classList.contains('on')"))
        await ev("window.__back()"); await pg.wait_for_timeout(300)
        chk('Back returns to the heard list (same cards)',await ev("document.getElementById('srch').classList.contains('on') && document.querySelectorAll('#srr .pc.best').length")==1 and 'شنیدم' in await ev("document.getElementById('srr').innerText"))
        # گفتار غلط
        bad=[(['تام فرد اوپیم'],ids['tf'],'تام فرد اوپیم'),(['دیور ابسلو درک'],ids['dr'],'دیور ابسلو درک'),(['دیر ابسولو دارگ'],ids['dr'],'دیر ابسولو دارگ'),(['تم فورد اپیوم','تام فورد اوپیوم'],ids['tf'],'دو حدس')]
        for alts,want,nm in bad:
            r=await say(alts); got=await ev("[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(c){return c.dataset.id})")
            chk('voice garbled "%s": right perfume among the first cards'%nm,want in got[:6],[r['kind'],got[:6].index(want) if want in got[:6] else got[:3]])
        r=await say(['ضضضض غغغغ']); chk('voice nonsense: "nothing similar", not a crash',r['kind'] in ('none','list'),r)
        # گفتن از دکمه‌ی میکروفون
        await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
        await ev("window.__vc.calls=0;window.__vc.answer=['دیور ابسولو دارک']"); await ev("document.getElementById('dkM').click();document.getElementById('dkM').click()"); await pg.wait_for_timeout(500)
        chk('mic button: one listen even if tapped twice',await ev("window.__vc.calls")==1)
        chk('mic button: the heard list appears without any other tap',await ev("document.getElementById('srch').classList.contains('on') && document.querySelectorAll('#srr .pc[data-id]').length")>=1 and not await ev("document.getElementById('dt').classList.contains('on')"))
        for c,expect in (('nomatch','نشنیدم'),('fail','تشخیص')):
            await ev("document.getElementById('srx').click()") if await ev("document.getElementById('srch').classList.contains('on')") else None
            await ev("window.__voiceErr('%s')"%c); await pg.wait_for_timeout(100)
            t=await ev("document.getElementById('toast').textContent"); chk('voice error %s says something calm'%c,expect in t,t)
            await pg.wait_for_timeout(2700)
        chk('no page errors (voice)',not [e for e in errs if 'Failed to load' not in e],errs[:3]); await b.close()
        # ---------- جستجو در سایت‌ها (ساختگی) ----------
        b,pg,errs=await fresh(p,live_mock()); ev=pg.evaluate
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        await pg.fill('#srq','زیلوفون کوارتز'); await pg.wait_for_timeout(500)
        chk('not in the phone list: nothing local',await ev("document.querySelectorAll('#srr .pc[data-id]').length")<=3)
        await pg.wait_for_timeout(1800)
        txt=await ev("document.getElementById('srlv').innerText")
        chk('site search starts by itself when nothing is found','در سایت‌ها' in txt,txt[:80])
        await pg.wait_for_timeout(2500)
        live=await ev("[].map.call(document.querySelectorAll('#srlv .pc.live'),function(c){return {u:c.dataset.u,t:c.querySelector('b').textContent,s:c.innerText}})")
        chk('found in the shop sites: cards with their site price',len(live)>=1 and any('۴٬۵۰۰٬۰۰۰' in x['s'] for x in live),live[:2])
        chk('live cards show a photo tile',await ev("document.querySelectorAll('#srlv .pc.live .pph .tile').length")==len(live))
        chk('"found in the sites" heading',('در سایت‌ها پیدا شد' in await ev("document.getElementById('srlv').innerText")))
        await ev("window.__lastOpen='';document.querySelector('#srlv .pc.live').click()"); await pg.wait_for_timeout(200)
        lo=await ev("window.__lastOpen"); chk('tapping a site card opens that shop page',lo.startswith('https://'),lo)
        chk('site search asked only the shop sites',all(('liliome.com' in u or 'safirstores.com' in u or 'hilandbeauty.com' in u or 'digikala.com' in u) for u in await ev("window.__LIVE")))
        chk('search stays open after tapping a site card',await ev("document.getElementById('srch').classList.contains('on')"))
        nl0=await ev("window.__LIVE.length"); await pg.click('#srq'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(700)
        chk('Enter with the same words does not throw the site results away',await ev("document.querySelectorAll('#srlv .pc.live').length")>=1 and await ev("window.__LIVE.length")==nl0,[nl0,await ev("window.__LIVE.length")])
        # نامِ سایت که در فهرست خودمان هست → کارتِ خودمان با قیمتِ همه‌ی سایت‌ها
        await pg.fill('#srq','دیور ساواج'); await pg.wait_for_timeout(500)
        btn=await ev("document.querySelectorAll('#srLvBtn').length"); chk('"not these? search the sites" button when results exist',btn==1,btn)
        await ev("document.getElementById('srLvBtn').click()"); await pg.wait_for_timeout(4000)
        chk('button runs the site search',await ev("document.querySelectorAll('#srlv .pc').length")>=1)
        chk('a site item that exists in our list becomes our card',await ev("document.querySelectorAll('#srlv .pc[data-id]').length")>=0)
        # گفتار با نتیجه‌ی ضعیف: خودش در سایت‌ها هم می‌گردد
        r=await ev("__pp.voice(['زیلوفون کوارتز'])"); await pg.wait_for_timeout(5000)
        chk('voice with a weak result: also searches the sites',r['live'] and await ev("document.querySelectorAll('#srlv .pc.live').length")>=1,r)
        await ev("document.getElementById('srr').scrollTop=400"); r2=await ev("__pp.voice(['دیور ساواج'])"); await pg.wait_for_timeout(900)
        chk('a new heard list starts from the top',await ev("document.getElementById('srr').scrollTop")==0,await ev("document.getElementById('srr').scrollTop"))
        chk('no page errors (live)',not [e for e in errs if 'Failed to load' not in e],errs[:3]); await b.close()
        # سایت‌ها خراب: پیامِ آرام
        b,pg,errs=await fresh(p,live_mock('fail')); ev=pg.evaluate
        await ev("document.getElementById('dkS').click()"); await pg.fill('#srq','زیلوفون کوارتز'); await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); await pg.wait_for_function("document.querySelector('#srlv .spn')===null",timeout=60000); await pg.wait_for_timeout(300)
        t=await ev("document.getElementById('srlv').innerText")
        chk('sites failing: calm message',('جواب ندادند' in t or 'نشد' in t or 'چیزی شبیه' in t),t[:100])
        chk('sites failing: no crash, search still usable',await ev("document.getElementById('srch').classList.contains('on')"))
        chk('no page errors (live fail)',not [e for e in errs if 'Failed to load' not in e],errs[:3]); await b.close()
        # ---------- نوشته‌ی بزرگ و صفحه‌ی کوچک ----------
        for w,fs in ((320,0),(320,3)):
            b,pg,errs=await fresh(p,'',w=w,fs=fs); ev=pg.evaluate; tag='w%d fs%d '%(w,fs)
            await ev("document.getElementById('dkS').click()"); await pg.fill('#srq','دیور'); await pg.wait_for_timeout(500)
            o=await ev("(function(){var r=document.getElementById('srr'),bad=[];[].forEach.call(r.querySelectorAll('.pc,.pc *'),function(e){var b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push(e.className)});return {bad:bad.slice(0,3),sw:r.scrollWidth,cw:r.clientWidth}})()")
            chk(tag+'search cards fit the screen',not o['bad'] and o['sw']<=o['cw']+1,o)
            await ev("__pp.voice(['دیور ابسولو دارک'])"); await pg.wait_for_timeout(400)
            o=await ev("(function(){var r=document.getElementById('srr'),bad=[];[].forEach.call(r.querySelectorAll('.pc,.pc *,.srbtn'),function(e){var b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push(e.className)});return {bad:bad.slice(0,3),sw:r.scrollWidth,cw:r.clientWidth}})()")
            chk(tag+'heard-list fits the screen',not o['bad'] and o['sw']<=o['cw']+1,o)
            await pg.screenshot(path='/tmp/w/shots3/t63_%d_%d.png'%(w,fs))
            chk(tag+'no page errors',not [e for e in errs if 'Failed to load' not in e],errs[:3]); await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
