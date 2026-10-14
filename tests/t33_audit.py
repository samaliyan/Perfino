import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
CNT="(function(){var d=window.__pp.state.db;var o=0;Object.keys(d.it.safir).forEach(function(k){if(d.it.safir[k][1]>0&&d.it.safir[k][2])o++});return o})()"
VARIANTS={'set=null':{'pp.set':'null'},'set=5':{'pp.set':'5'},'set=[]':{'pp.set':'[]'},'set.soff=string':{'pp.set':json.dumps({'theme':'auto','model':'a','soff':'x'})},
 'set.soff=all4':{'pp.set':json.dumps({'theme':'auto','model':'a','soff':{'liliome':1,'digikala':1,'safir':1,'hiland':1}})},
 'bogus theme/model':{'pp.set':json.dumps({'theme':'zzz','model':'q','auto':'abc'})},'st=5':{'pp.st':'5'},'st=null':{'pp.st':'null'},'run=5':{'pp.run':'5'},'run={}':{'pp.run':'{}'}}
async def main():
    async with async_playwright() as p:
        # ۱) صفحه‌ی کپچای ۲۰۰ وسط فهرست نباید کالاها را پاک کند
        b,ctx,pg,errs=await new_page(p)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        a=await pg.evaluate(CNT)
        await pg.evaluate("(function(){window.__MODE=function(u){if(u.indexOf('safirstores')>=0){var m=/page=(\\d+)/.exec(u);if(m&&+m[1]>=18)return {s:200,b:'<html><body>Checking your browser</body></html>'}}};return 1})()")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        c=await pg.evaluate(CNT)
        chk('captcha page (200) mid-list does not delete safir items',c>=a*0.99,[a,c])
        await b.close()
        # ۲) قیمتِ ۱۳ ساعت پیش در حالت پیش‌فرض: صفحه‌ی خالی نباشد و خودش تازه شود
        b,ctx,pg,errs=await new_page(p,extra="window.__MODE=function(u){if(sessionStorage.getItem('offline'))return {s:0,b:'java.net.SocketException: Connection reset'}}")
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(function(h){var d=window.__pp.state.db;Object.keys(d.t).forEach(function(k){d.t[k]-=h*3600000});Object.keys(d.it).forEach(function(s){Object.keys(d.it[s]).forEach(function(p){d.it[s][p][4]-=h*60})});localStorage.setItem('pp.db',JSON.stringify(d));localStorage.removeItem('pp.try');return 1})(13)")
        await pg.evaluate("sessionStorage.setItem('offline','1')")
        await pg.reload(); await pg.wait_for_timeout(1500); await pg.wait_for_function("!window.__pp.state.busy",timeout=90000); await pg.wait_for_timeout(500)
        r=await pg.evaluate("({flat:window.__pp.flat.length,ov:document.getElementById('ov').className,pill:document.getElementById('updt').textContent,stale:document.getElementById('upd').classList.contains('stale')})")
        chk('offline + 13h-old data: old prices still shown (not blank)',r['flat']>0 and r['ov']=='','%s'%r)
        chk('pill is red/stale and says old',r['stale'] and 'قدیمی' in r['pill'],r['pill'])
        errtxt=await pg.evaluate("JSON.stringify(window.__pp.state.st)")
        stx=await pg.evaluate("document.getElementById('sSrc').innerText")
        chk('no raw English technical error shown in status text',not any(x in stx for x in ['Socket','java.','HTTP ']),stx[:200])
        await b.close()
        b,ctx,pg,errs=await new_page(p)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(function(h){var d=window.__pp.state.db;Object.keys(d.t).forEach(function(k){d.t[k]-=h*3600000});Object.keys(d.it).forEach(function(s){Object.keys(d.it[s]).forEach(function(p){d.it[s][p][4]-=h*60})});localStorage.setItem('pp.db',JSON.stringify(d));localStorage.removeItem('pp.try');return 1})(13)")
        await pg.evaluate("window.__calls.length=0")
        await pg.reload(); await pg.wait_for_timeout(2500)
        n=await pg.evaluate("window.__calls.length")
        chk('online + 13h-old data, default settings: refreshes by itself at launch',n>0,n)
        await b.close()
        # ۳) ذخیره‌ی خراب
        for name,v in VARIANTS.items():
            pre="try{"+";".join("localStorage.setItem(%s,%s)"%(json.dumps(k),json.dumps(x)) for k,x in v.items())+"}catch(e){}"
            b,ctx,pg,errs=await new_page(p,extra="if(!sessionStorage.getItem('rv')){sessionStorage.setItem('rv','1');"+pre+"}")
            await pg.goto('file://'+ROOT+'/index.html')
            try:
                await wait_ready(pg,60000); ok=await pg.evaluate("window.__pp.list.length")>0
            except Exception as e: ok=False
            chk('corrupt storage survives: '+name,ok and not errs,errs[:1])
            await b.close()
        # ۴) برگشتِ دوبار پشت‌سرهم
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(800)
        r=await pg.evaluate("(function(){var id=window.__pp.tree[0].id;window.__pp.open(id);return 1})()"); await pg.wait_for_timeout(400)
        r=await pg.evaluate("[window.__back(),window.__back()]")
        chk('double back during transition does not exit app',r==[True,True],r)
        await b.close()
        # ۵) اندازه‌ی لمس
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.set_viewport_size({'width':320,'height':640})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(800)
        r=await pg.evaluate("(function(){var g=document.getElementById('gear').getBoundingClientRect();return [Math.round(g.width),Math.round(g.height)]})()")
        chk('gear tap target >=44',r[0]>=44 and r[1]>=44,r)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
    sys.exit(1 if BAD else 0)
asyncio.run(main())
