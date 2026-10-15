import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
        # ۱) حداکثر ۶ درخواست هم‌زمان، همه‌ی ۲۴ درخواست جواب بگیرند
        r=await pg.evaluate("""(async function(){
          var inf=0,max=0,orig=window.Native.fetch;
          window.Native.fetch=function(id,u){inf++;if(inf>max)max=inf;setTimeout(function(){inf--;window.__nat(id,200,'ok')},120)};
          var ps=[];for(var i=0;i<24;i++)ps.push(window.__pp.net.get('https://x.test/'+i,{}));
          var rs=await Promise.all(ps);window.Native.fetch=orig;return {max:max,n:rs.length,ok:rs.every(function(x){return x.status===200})}})()""")
        chk('at most 6 requests in flight and all 24 answered',r['max']<=6 and r['n']==24 and r['ok'],r)
        # ۲) درخواستِ بی‌جواب بعد از مهلت، جایش را آزاد کند
        r=await pg.evaluate("""(async function(){
          var os=window.setTimeout;window.setTimeout=function(f,ms){return os(f,ms>=30000?300:ms)};
          var orig=window.Native.fetch,calls=0;
          window.Native.fetch=function(id,u){calls++;if(/hang/.test(u))return;setTimeout(function(){window.__nat(id,200,'ok')},20)};
          var hang=[];for(var i=0;i<6;i++)hang.push(window.__pp.net.get('https://x.test/hang'+i,{}).then(function(){return 'ok'},function(e){return 'timeout'}));
          var good=await window.__pp.net.get('https://x.test/good',{});
          var hs=await Promise.all(hang);window.setTimeout=os;window.Native.fetch=orig;
          return {good:good.status,hs:hs,calls:calls}})()""")
        chk('hung requests time out and free their slot (queued request still runs)',r['good']==200 and all(x=='timeout' for x in r['hs']),r)
        # ۳) نصبِ ناموفق (فایل از بین رفته): دوباره دانلود شود
        r=await pg.evaluate("""(async function(){
          var n=0;window.Native.updInstall=function(){return false};window.Native.updCheck=function(){n++};window.Native.updDownload=function(){n+=100};
          window.__updReady(999999);
          await new Promise(function(r){setTimeout(r,900)});      // لمسِ اتفاقیِ لحظه‌ی آمدنِ کارت نادیده گرفته می‌شود
          document.getElementById('updGo').click();
          await new Promise(function(r){setTimeout(r,1200)});
          return {n:n,on:document.getElementById('updBox').classList.contains('on')}})()""")
        chk('install failure re-checks (and so re-downloads) instead of getting stuck',r['n']>=1,r)
        chk('no page errors',not errs,errs[:2])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
