import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    html=open('/home/claude/PerfumePrice/tests/fx_safir.html',encoding='utf8').read()
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        r=await pg.evaluate("""(h)=>{var d=new DOMParser().parseFromString(h,'text/html');var c=Core.nextDataCards(d,'https://www.safirstores.com/category/perfume');
          return {n:c.length,first:c[0],parsed:c.map(function(x){var p=Core.parseTitle(x.t);return p?[p.key.join(' '),p.ml,p.conc,p.gn]:null}),out:c.filter(function(x){return x.st===1}).length,titles:c.slice(0,6).map(function(x){return x.t})}}""",html)
        chk('36 cards from next data',r['n']==36,r['n'])
        pr=[x for x in r['parsed'] if x]
        chk('>=33 parse as perfume with ml',len(pr)==24 and all(x[1]>0 for x in pr),len(pr))   # ۱۲ تا بادی اسپلش/اسپری بدن است و درست رد می‌شود
        chk('first card price/url/title',r['first']['price']==8695500 and '/product/17856/' in r['first']['u'] and '100' in r['first']['t'],r['first'])
        print(r['titles'][:3], pr[:3])
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
