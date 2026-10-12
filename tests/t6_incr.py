import asyncio,json,sys,os,time
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(name,cond,info=''):
    (OK if cond else BAD).append(name)
    print(('PASS ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
FAST="Object.defineProperty(window,'Core',{configurable:true,set:function(v){v.CFG.retryMs=5;Object.defineProperty(window,'Core',{value:v,writable:true,configurable:true})}});"
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=FAST)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,90000)
        st=await pg.evaluate("window.__pp.state.st")
        print(json.dumps(st,ensure_ascii=False))
        n1=await pg.evaluate("window.__pp.flat.length")
        db1=await pg.evaluate("JSON.stringify(Object.keys(window.__pp.state.db.g).length)+'/'+Object.keys(window.__pp.state.db.it.liliome).length")
        chk('first load: all 4 sources ok full',all(st[k]['ok'] and st[k]['mode']=='full' for k in st),st)
        chk('db keeps names',int(db1.split('/')[0])>1000,db1)
        calls1=await pg.evaluate("window.__calls.length"); bytes1=await pg.evaluate("window.__bytes")
        # عکس‌ها صف شدند و ذخیره
        await pg.wait_for_timeout(1500)
        nimg=await pg.evaluate("Object.keys(window.__pp.state.imgLoc).length")
        chk('images queued & cached on phone',nimg>500,nimg)
        # --- بروزرسانی دوم: فقط قیمت
        pre=await pg.evaluate("JSON.stringify(window.__pp.flat.map(function(x){return x.id+x.name}))")
        await pg.evaluate("window.__calls.length=0;window.__bytes=0;window.__t0=performance.now();window.__pp.model.el.dataset.keep='1'")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        dt=await pg.evaluate("performance.now()-window.__t0")
        st=await pg.evaluate("window.__pp.state.st")
        chk('second refresh uses price mode',all(st[k]['mode']=='price' for k in ['liliome']),st['liliome'])
        calls2=await pg.evaluate("window.__calls"); bytes2=await pg.evaluate("window.__bytes")
        lil=[c for c in calls2 if 'liliome' in c]
        chk('liliome price calls use _fields',all('_fields=' in c for c in lil) and len(lil)>3,len(lil))
        print('bytes first',bytes1,'second',bytes2,'calls',calls1,len(calls2),'ms',round(dt))
        chk('price refresh not heavier than full',bytes2<=bytes1,(bytes1,bytes2))
        post=await pg.evaluate("JSON.stringify(window.__pp.flat.map(function(x){return x.id+x.name}))")
        chk('names list identical after refresh',pre==post)
        chk('model element kept (no rebuild)',await pg.evaluate("window.__pp.model.el.dataset.keep")=='1')
        chk('toast shown',await pg.evaluate("document.getElementById('toast').classList.contains('on')"),await pg.evaluate("document.getElementById('toast').textContent"))
        # --- تغییر قیمت درجا
        await pg.evaluate("localStorage.setItem('x','1')")
        await pg.evaluate("window.__PRICEUP=true")
        await pg.evaluate("(function(){window.__MODE=function(u){if(u.indexOf('liliome.com')>=0){var m=/[?&]page=(\\d+)/.exec(u);var pg=m?+m[1]:1;var arr=(window.__FX.liliome[pg-1]||[]).map(function(x){return {id:x.id,prices:{price:String(Math.round(parseFloat(x.prices.price)*1.12/1000)*1000),currency_code:'IRT',currency_minor_unit:0},is_in_stock:x.is_in_stock,type:x.type}});if(pg>window.__FX.liliome.length)return {s:400,b:'{}'};return {s:200,b:JSON.stringify(arr)}}return null}})()")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        chk('prices changed -> model not rebuilt',await pg.evaluate("window.__pp.model.el.dataset.keep")=='1')
        tt=await pg.evaluate("document.getElementById('toast').textContent")
        chk('toast reports changed count',('قیمت تغییر کرد' in tt),tt)
        post2=await pg.evaluate("JSON.stringify(window.__pp.flat.map(function(x){return x.id+x.name}))")
        chk('names still identical',pre==post2)
        await b.close()
        # --- راه‌اندازی دوباره: همه‌چیز از حافظه، بدون انتظار شبکه
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=FAST+"localStorage.setItem('__noop','1');")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,90000)
        # نمونه: آیتم جدید در لیلیوم → نام تازه افزوده، بقیه دست نخورد
        await pg.evaluate("""(function(){var F=window.__FX;var keep=JSON.stringify(F.liliome[0][0]);
          var extra={id:9990001,name:'عطر ادکلن تست‌بوی نو ابری بلو ادو پرفیوم 100 میل',type:'simple',is_in_stock:true,prices:{price:'4500000',currency_code:'IRT',currency_minor_unit:0},images:[{thumbnail:'https://liliome.com/x.jpg'}],categories:[{name:'عطر'}]};
          F.liliome[F.liliome.length-1].push(extra);window.__MODE=null})()""")
        n0=await pg.evaluate("window.__pp.flat.length")
        await pg.evaluate("window.__calls.length=0;window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        n2=await pg.evaluate("window.__pp.flat.length")
        names=await pg.evaluate("window.__pp.flat.map(function(x){return x.name})")
        chk('new product discovered & added once',n2==n0+1 and any('ابری بلو' in x for x in names),(n0,n2))
        # بار دوم نباید دوباره اضافه شود
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=60000)
        chk('no duplicates on repeat',await pg.evaluate("window.__pp.flat.length")==n2)
        await b.close()
    print('PASS',len(OK),'FAIL',len(BAD))
asyncio.run(main())
