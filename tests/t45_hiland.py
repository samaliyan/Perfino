import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    html=open('/home/claude/PerfumePrice/tests/fx_hiland.html',encoding='utf8').read()
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        r=await pg.evaluate("""async (h)=>{
          var asked=[];
          var net={get:async function(u){asked.push(u);
            if(u.indexOf('wp-json')>=0||u.indexOf('/wc/')>=0) return {status:404,body:''};
            var m=/pagenumber=(\\d+)/.exec(u);var n=m?+m[1]:1; if(n>216) return {status:404,body:''};
            return {status:200,body:h.replace(/href=(\\/fa\\/)/g,'href=$1p'+n+'-').replace(/href="(https:\\/\\/hilandbeauty.com\\/fa\\/)/g,'href="$1p'+n+'-')};}};
          var src=Core.SOURCES.filter(function(s){return s.id==='hiland'})[0];
          var res=await src.run(net,function(){},'full');
          var pages=asked.filter(function(u){return u.indexOf('pagenumber=')>=0||u.indexOf('/fa/')>=0});
          return {n:res.items.length,complete:res.complete,note:res.note,last:asked[asked.length-1],junk:res.items.filter(function(x){return /^سبد/.test(x.t)}).length,asked:asked.length}}""",html)
        print(r)
        chk('read all 216 pages',r['n']>=216*30,r['n'])
        chk('marked complete',r['complete']==True,r['note'])
        chk('no cart junk',r['junk']==0)
        chk('last request was page 216 (not beyond)','pagenumber=216' in r['last'],r['last'])
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
