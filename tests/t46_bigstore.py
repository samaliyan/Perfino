import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
# localStorage با سقف خیلی کم (پر شدن حافظه را شبیه می‌سازد) + Native.fileSet/fileGet در حافظه
MOCK="""
window.__files={};window.__fsets=0;
(function(){var N=window.Native;
 N.fileSet=function(k,t){window.__fsets++;window.__files[k]=t;return true};
 N.fileGet=function(k){return window.__files[k]||''};
 var os=Storage.prototype.setItem;
 Storage.prototype.setItem=function(k,v){ if((k==='pp.db'||k==='pp.hist')&&String(v).length>3000){throw new Error('QuotaExceededError')} return os.call(this,k,v)};
})();
"""
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=MOCK)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(800)
        r=await pg.evaluate("({fsets:window.__fsets,db:(window.__files['pp.db']||'').length,ls:(localStorage.getItem('pp.db')||'').length,files:Object.keys(window.__files)})")
        chk('db saved to file despite localStorage quota',r['db']>10000 and r['ls']==0,r)
        chk('history saved to file',('pp.hist' in r['files']),r['files'])
        sf=await pg.evaluate("document.getElementById('upd')&&document.getElementById('updTx')?document.getElementById('updTx').textContent:''")
        chk('no "memory full" message',('ذخیره نشد' not in (await pg.evaluate("document.body.innerText"))))
        # reload: data must come back from file
        n1=await pg.evaluate("Object.keys(JSON.parse(window.__files['pp.db']).g).length")
        await pg.evaluate("sessionStorage.setItem('keep','1')")
        files=await pg.evaluate("window.__files")
        await pg.close()
        pg2=await ctx.new_page()
        await pg2.add_init_script(STUB)
        await pg2.add_init_script(MOCK.replace("window.__files={};","window.__files="+json.dumps(files)+";"))
        await pg2.goto('file://'+ROOT+'/index.html'); await wait_ready(pg2,120000)
        n2=await pg2.evaluate("Object.keys(JSON.parse(window.__files['pp.db']).g).length")
        chk('reload keeps same number of perfumes',n1==n2 and n1>100,(n1,n2))
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
