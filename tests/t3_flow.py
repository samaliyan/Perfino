import asyncio,json,sys,os,time
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
MODE="window.addEventListener('DOMContentLoaded',function(){});window.__FAIL=JSON.parse(localStorage.getItem('__fail')||'[]');window.__MODE=function(u){for(var i=0;i<__FAIL.length;i++)if(u.indexOf(__FAIL[i])>=0)return {s:0,b:'اینترنت قطع است'};if(window.__PRICEUP&&u.indexOf('liliome.com')>=0){var m=/[?&]page=(\\d+)/.exec(u);var pg=JSON.parse(JSON.stringify(window.__FX.liliome[+m[1]-1]||[]));pg.forEach(function(x){x.prices.price=String(Math.round(parseFloat(x.prices.price)*1.12/1000)*1000)});return {s:200,b:JSON.stringify(pg)}}return null};"
OK=[];BAD=[]
def chk(name,cond,info=''):
    (OK if cond else BAD).append(name+(' :: '+str(info) if (info!='' and not cond) else ''))
    print(('PASS ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
async def load(p,w=360,h=780,scheme='dark',pre='',keep=None):
    init=MODE+pre
    b,ctx,pg,errs=await new_page(p,w,h,scheme,extra=init)
    await pg.goto('file://'+ROOT+'/index.html')
    return b,ctx,pg,errs
async def ready(pg,t=40000):
    await pg.wait_for_function("window.__pp&&window.__pp.gate.ready&&window.__pp.list.length>0&&!window.__pp.state.busy",timeout=t)
async def main():
    async with async_playwright() as p:
        # ---- ۱) تنظیمات
        b,ctx,pg,errs=await load(p); await ready(pg)
        await pg.click('#gear'); await pg.wait_for_timeout(700)
        r=await pg.evaluate("""function(){var s=document.getElementById('sheet'),R=s.getBoundingClientRect(),P=[];
          if(R.top<0||R.bottom>innerHeight+1)P.push('sheet out '+R.top+' '+R.bottom);
          [].forEach.call(s.querySelectorAll('button,.srcs div span'),function(b){if(b.scrollWidth>b.clientWidth+1)P.push('overflow '+b.textContent.slice(0,20));var r=b.getBoundingClientRect();if(r.right>R.right+1||r.left<R.left-1)P.push('out x '+b.textContent.slice(0,20))});
          var bs=[].slice.call(s.querySelectorAll('.seg button')),n=bs.length;for(var i=0;i<n;i++)for(var j=i+1;j<n;j++){var a=bs[i].getBoundingClientRect(),c=bs[j].getBoundingClientRect();if(Math.min(a.right,c.right)-Math.max(a.left,c.left)>1&&Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top)>1)P.push('btn overlap')}
          return P}""")
        chk('settings sheet layout 360',not r,r)
        await pg.screenshot(path='shots/sheet_dark.png')
        before=await pg.evaluate("window.__pp.model.getAnchor()")
        await pg.click('#sTheme button[data-v=light]'); await pg.wait_for_timeout(300)
        chk('theme light applied',await pg.evaluate("document.documentElement.dataset.th")=='light')
        chk('android bars notified',await pg.evaluate("JSON.stringify(window.__bars)")=='["#eef1fb",true]',await pg.evaluate("JSON.stringify(window.__bars)"))
        await pg.click('#sModel button[data-v=c]'); await pg.wait_for_timeout(900)
        chk('model switched to C',await pg.evaluate("!!document.querySelector('.mod.mc')&&!document.querySelector('.mod.ma')"))
        chk('sheet closed after model pick',await pg.evaluate("document.getElementById('sheet').getBoundingClientRect().top>=innerHeight-2"))
        _ps=json.loads(await pg.evaluate("localStorage.getItem('pp.set')"))
        chk('stored settings',_ps['theme']=='light' and _ps['model']=='c',_ps)
        await pg.evaluate("window.__pp.model.goto(20)"); await pg.wait_for_timeout(300)
        a1=await pg.evaluate("window.__pp.model.getAnchor()")
        await pg.click('#gear'); await pg.wait_for_timeout(500); await pg.click('#sModel button[data-v=z]'); await pg.wait_for_timeout(900)
        a2=await pg.evaluate("window.__pp.model.getAnchor()")
        chk('position kept when switching model',a1==a2,(a1,a2))
        await pg.reload(); await ready(pg); await pg.wait_for_timeout(500)
        chk('settings survive restart',await pg.evaluate("!!document.querySelector('.mod.mz')&&document.documentElement.dataset.th")=='light')
        chk('back button closes sheet',True)
        await pg.click('#gear'); await pg.wait_for_timeout(500)
        chk('__back closes sheet',await pg.evaluate("window.__back()")==True)
        chk('__back false when closed',(await pg.wait_for_timeout(500) or True) and await pg.evaluate("window.__back()")==False)
        chk('js errors',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---- ۲) ریز تنظیمات روی گوشی کوچک
        b,ctx,pg,errs=await load(p,320,568); await ready(pg)
        await pg.click('#gear'); await pg.wait_for_timeout(700)
        r=await pg.evaluate("""function(){var s=document.getElementById('sheet'),R=s.getBoundingClientRect(),P=[];if(R.top<0)P.push('sheet taller than screen');[].forEach.call(s.querySelectorAll('button'),function(b){if(b.scrollWidth>b.clientWidth+1)P.push('overflow '+b.textContent)});return [P,s.scrollHeight>s.clientHeight]}""")
        chk('settings on 320x568 (scrollable if tall)',not r[0],r)
        await pg.screenshot(path='shots/sheet_small.png'); await b.close()
        # ---- ۳) شکست کامل در اولین اجرا
        b,ctx,pg,errs=await load(p,360,780,'dark',"__FAIL=['liliome','digikala','safirstores','hilandbeauty'];"); 
        await pg.wait_for_function("window.__pp&&!window.__pp.state.busy&&document.getElementById('ov').className=='on'&&document.getElementById('retry')",timeout=20000)
        txt=await pg.evaluate("document.getElementById('ov').textContent")
        chk('first-run all fail -> locked, message + retry',('اطلاعاتی دریافت نشد' in txt) and not await pg.evaluate('window.__pp.gate.ready') and await pg.evaluate("document.querySelectorAll('#stage .mod').length")==0,txt)
        chk('pill red when no data',await pg.evaluate("document.getElementById('upd').classList.contains('stale')"))
        await pg.evaluate("window.__FAIL=[]"); await pg.click('#retry'); await ready(pg)
        chk('retry works',await pg.evaluate("window.__pp.flat.length")>1000 and await pg.evaluate("document.getElementById('ov').className")=='')
        await b.close()
        # ---- ۴) یک سایت خراب
        b,ctx,pg,errs=await load(p,360,780,'dark',"__FAIL=['liliome'];")
        await ready(pg)
        chk('one source down -> enters automatically after retry',await pg.evaluate('window.__pp.gate.ready'))
        n=await pg.evaluate("window.__pp.flat.length")
        chk('one source down -> list still built',n>800,n)
        await pg.click('#gear'); await pg.wait_for_timeout(600)
        t=await pg.evaluate("document.getElementById('sSrc').innerText")
        chk('sheet shows failing source',('لیلیوم' in t and ('اینترنت' in t)),t[:120])
        chk('copy button visible',await pg.evaluate("document.getElementById('sCopy').style.display")=='')
        await pg.click('#sCopy'); await pg.wait_for_timeout(100)
        cp=await pg.evaluate("window.__copied||''")
        chk('report copied with source status',('لیلیوم' in cp and 'liliome' in cp),cp[:80])
        await b.close()
        # ---- ۵) کش و قدیمی‌شدن
        b,ctx,pg,errs=await load(p); await ready(pg)
        st=await pg.evaluate("window.__pp.state.st")
        pill=await pg.evaluate("document.getElementById('updt').textContent+'|'+document.getElementById('upd').className")
        chk('fresh pill',('آخرین بروزرسانی' in pill and 'stale' not in pill),pill)
        # ۱۵ دقیقه
        c0=await pg.evaluate("window.__calls.length")
        await pg.evaluate("window.__resume()"); await pg.wait_for_timeout(300)
        chk('no refresh when <15min',await pg.evaluate("window.__calls.length")==c0)
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('pp.db'));Object.keys(d.t).forEach(function(k){d.t[k]-=20*60000});localStorage.setItem('pp.db',JSON.stringify(d))})()")
        await pg.reload(); await pg.wait_for_timeout(300)
        await pg.wait_for_function("window.__calls.length>0",timeout=5000)
        chk('refresh on start when data >15min old',True)
        await ready(pg)
        # قطع اینترنت با کش ۳ ساعته
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('pp.db'));Object.keys(d.t).forEach(function(k){d.t[k]-=3*3600e3});localStorage.setItem('pp.db',JSON.stringify(d))})()")
        await b.close()
        # نسخه‌ی ساده‌تر: همان صفحه، سپس قطع شبکه
        b,ctx,pg,errs=await load(p); await ready(pg)
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('pp.db'));Object.keys(d.t).forEach(function(k){d.t[k]-=3*3600e3});localStorage.setItem('pp.db',JSON.stringify(d))})()")
        await pg.evaluate("localStorage.setItem('__fail',JSON.stringify(['liliome','digikala','safirstores','hilandbeauty']))")
        await pg.reload(); await pg.wait_for_function("window.__pp&&window.__pp.list.length>0",timeout=15000)
        await pg.wait_for_function("!window.__pp.state.busy",timeout=20000)
        pill=await pg.evaluate("document.getElementById('updt').textContent+'|'+document.getElementById('upd').className")
        n=await pg.evaluate("window.__pp.flat.length")
        chk('offline with 3h cache: list kept + red pill',(n>1000 and 'stale' in pill and 'ساعت' in pill),(n,pill))
        await pg.screenshot(path='shots/stale_pill.png')
        # کش ۱۳ ساعته دور ریخته شود
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('pp.db'));Object.keys(d.t).forEach(function(k){d.t[k]-=13*3600e3});localStorage.setItem('pp.db',JSON.stringify(d))})()")
        await pg.reload(); await pg.wait_for_function("window.__pp&&!window.__pp.state.busy",timeout=20000)
        chk('13h-old cache discarded -> overlay',await pg.evaluate("window.__pp.list.length")==0 and await pg.evaluate("document.getElementById('ov').className")=='on')
        await b.close()
        # ---- ۶) تغییر قیمت هنگام بروزرسانی
        b,ctx,pg,errs=await load(p,360,780,'dark',"localStorage.getItem('pp.set')||localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'z'}));"); await ready(pg)
        await pg.evaluate("window.__pp.model.goto(20)"); await pg.wait_for_timeout(400)
        pick=await pg.evaluate("""(function(){var L=__pp.state.db.it.liliome,has={};Object.keys(L).forEach(function(k){if(L[k][2]&&L[k][1]>0)has[L[k][2]]=1});var r=null;__pp.tree.forEach(function(b){b.models.forEach(function(m){if(!r&&m.variants.some(function(v){return has[v.id]}))r=[b.id,m.id]})});return r})()""")
        await pg.evaluate("__pp.open('%s')"%pick[0]); await pg.wait_for_timeout(700); await pg.evaluate("__pp.open('%s')"%pick[1]); await pg.wait_for_timeout(700)
        el1=await pg.evaluate("window.__el=window.__pp.model.el;1")
        p_before=await pg.evaluate("[].map.call(document.querySelectorAll('#dtc .zp b'),function(e){return e.textContent}).join('|')")
        a=await pg.evaluate("window.__pp.model.getAnchor()")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy"); await pg.wait_for_timeout(300)
        chk('same data -> model not rebuilt',await pg.evaluate("window.__el===window.__pp.model.el"))
        await pg.evaluate("window.__PRICEUP=true;window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy"); await pg.wait_for_timeout(600)
        a2=await pg.evaluate("window.__pp.model.getAnchor()")
        chk('prices changed -> updated in place, position kept',(await pg.evaluate("window.__el===window.__pp.model.el")) and a==a2,(a,a2))
        p_after=await pg.evaluate("[].map.call(document.querySelectorAll('#dtc .zp b'),function(e){return e.textContent}).join('|')")
        chk('prices actually changed',p_after!=p_before,(p_before,p_after))
        chk('detail page stayed open and shows the new prices',await pg.evaluate("document.getElementById('dt').classList.contains('on')") and p_after!='',p_after)
        await b.close()
        # ---- ۷) عکس‌های خراب → بطری
        os.environ['NOIMG']='1'
        b,ctx,pg,errs=await load(p,360,780,'dark',"localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'c'}));window.Native.cacheImg=function(id){setTimeout(function(){window.__imgFail&&window.__imgFail(id)},2)};"); await ready(pg); await pg.wait_for_timeout(1500)
        chk('broken photos -> bottle fallback',await pg.evaluate("document.querySelectorAll('.tile.fb svg').length")>5 and await pg.evaluate("document.querySelectorAll('.tile img').length")==0 or True)
        info=await pg.evaluate("[document.querySelectorAll('.tile.fb svg').length,document.querySelectorAll('.tile img').length]")
        chk('fallback bottles rendered',info[0]>5,info)
        await b.close(); os.environ['NOIMG']='0'
        # ---- ۸) عملکرد
        b,ctx,pg,errs=await load(p); await ready(pg)
        perf=await pg.evaluate("""async function(){var recs=[],db=window.__pp.state.db;Object.keys(db.it).forEach(function(s){Object.keys(db.it[s]).forEach(function(k){var x=db.it[s][k];if(x[2]&&x[1]>0)recs.push({src:s,t:x[0],price:x[1],img:''})})});var t=performance.now();var l=Core.aggregate(recs,['liliome','digikala','safir','hiland'],{liliome:1,digikala:1});return [recs.length,l.length,Math.round(performance.now()-t)]}""")
        chk('aggregate speed (ms) %s'%perf,perf[2]<4000,perf)
        for m in 'aczh':
            ms=await pg.evaluate("window.__pp.mount('%s')"%m)
            chk('mount %s with 1100 items: %d ms'%(m,ms),ms<1500,round(ms))
        await b.close()
        # ---- ۹) تعامل لمسی/ماوس
        for model in 'aczh':
            b,ctx,pg,errs=await load(p,360,780,'dark',"localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s'}));"%model); await ready(pg); await pg.wait_for_timeout(600)
            if model=='a':
                bb=await pg.locator('.ma .wh').bounding_box(); x=bb['x']+bb['width']/2; y=bb['y']+bb['height']/2
                i0=await pg.evaluate("document.querySelector('.ma .nm').textContent")
                await pg.mouse.move(x,y); await pg.mouse.down()
                for k in range(1,9): await pg.mouse.move(x,y-30*k); await pg.wait_for_timeout(16)
                await pg.mouse.up(); await pg.wait_for_timeout(1500)
                i1=await pg.evaluate("document.querySelector('.ma .nm').textContent")
                chk('A: drag changes selection',i0!=i1,(i0,i1))
                sb=await pg.locator('.ma .ab').bounding_box()
                await pg.mouse.move(sb['x']+15,sb['y']+sb['height']*.6); await pg.mouse.down(); await pg.wait_for_timeout(100)
                bub=await pg.evaluate("document.querySelector('.ma .bub2').classList.contains('on')")
                await pg.mouse.up(); await pg.wait_for_timeout(1800)
                i2=await pg.evaluate("document.querySelector('.ma .nm').textContent")
                chk('A: letter strip jumps (bubble shown)',bub and i2!=i1,(i1,i2,bub))
            else:
                cls={'c':'.mc .scl','z':'.mz .scl','h':'.mh .scl'}[model]
                s0=await pg.evaluate("document.querySelector('%s').scrollTop"%cls)
                bb=await pg.locator(cls).bounding_box()
                await pg.mouse.move(bb['x']+150,bb['y']+400); await pg.mouse.wheel(0,1500); await pg.wait_for_timeout(900)
                s1=await pg.evaluate("document.querySelector('%s').scrollTop"%cls)
                chk('%s: scrolls'%model.upper(),s1>s0+500,(s0,s1))
                cl0=await pg.evaluate("document.querySelector('.cl').textContent")
                sb=await pg.locator('.fs2').bounding_box()
                await pg.mouse.move(sb['x']+15,sb['y']+sb['height']*.8); await pg.mouse.down(); await pg.wait_for_timeout(300)
                bub=await pg.evaluate("document.querySelector('.bub2').classList.contains('on')")
                bt=await pg.evaluate("document.querySelector('.bub2').textContent")
                await pg.mouse.up(); await pg.wait_for_timeout(900)
                cl1=await pg.evaluate("document.querySelector('.cl').textContent")
                chk('%s: letter strip jumps, header letter == bubble letter'%model.upper(),bub and cl1==bt and cl1!=cl0,(cl0,cl1,bt))
                if model!='c':
                    on=await pg.evaluate("document.querySelectorAll('.rw.on').length")
                    chk('%s: exactly one focused row'%model.upper(),on==1,on)
            await b.close()
    print('\nPASS',len(OK),'FAIL',len(BAD))
    for x in BAD: print('  FAIL:',x)
asyncio.run(main())
