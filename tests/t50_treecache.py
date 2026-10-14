import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
MOCK="""
window.__files={};
(function(){var N=window.Native;N.fileSet=function(k,t){window.__files[k]=t;return true};N.fileGet=function(k){return window.__files[k]||''};})();
"""
SUM="(function(){var t=window.__pp.allBrands;return JSON.stringify([t.length,t.map(function(b){return b.name+':'+b.models.length}).join('|'),window.__pp.flat.length])})()"
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=MOCK)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(4500)
        chk('first run builds the tree',await pg.evaluate("window.__treeSrc")=='build')
        files=await pg.evaluate("window.__files")
        chk('tree saved to a file',len(files.get('pp.tree',''))>10000,list(files.keys()))
        s1=await pg.evaluate(SUM)
        await pg.close()
        pg2=await ctx.new_page(); await pg2.add_init_script(STUB)
        await pg2.add_init_script(MOCK.replace("window.__files={};","window.__files="+json.dumps(files)+";"))
        await pg2.goto('file://'+ROOT+'/index.html'); await pg2.wait_for_function("window.__treeSrc",timeout=60000)
        chk('second start uses the saved tree',await pg2.evaluate("window.__treeSrc")=='cache')
        await wait_ready(pg2,120000)
        s2=await pg2.evaluate(SUM)
        chk('same brands/models/perfumes after cache',s1==s2,(s1[:120],s2[:120]))
        # stale stamp (data changed) -> rebuild
        f2=dict(files); t=json.loads(f2['pp.tree']); t['stamp']='old'; f2['pp.tree']=json.dumps(t)
        pg3=await ctx.new_page(); await pg3.add_init_script(STUB)
        await pg3.add_init_script(MOCK.replace("window.__files={};","window.__files="+json.dumps(f2)+";"))
        await pg3.goto('file://'+ROOT+'/index.html'); await wait_ready(pg3,120000)
        chk('changed data rebuilds',await pg3.evaluate("window.__treeSrc")=='build')
        # corrupt cache -> rebuild, no crash
        f3=dict(files); f3['pp.tree']='{{{'
        pg4=await ctx.new_page(); await pg4.add_init_script(STUB)
        await pg4.add_init_script(MOCK.replace("window.__files={};","window.__files="+json.dumps(f3)+";"))
        await pg4.goto('file://'+ROOT+'/index.html'); await wait_ready(pg4,120000)
        chk('corrupt cache rebuilds',await pg4.evaluate("window.__treeSrc")=='build')
        chk('no js errors',not errs,errs[:2])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
