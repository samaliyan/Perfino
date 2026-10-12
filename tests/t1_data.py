import asyncio,json,re,time,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
FXJ=json.loads(FX)
def norm(s):
    s=s.replace('ي','ی').replace('ك','ک').replace('آ','ا').replace('‌',' ')
    return ' '.join(sorted(s.split()))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False)
        t=time.time()
        await pg.goto('file://'+ROOT+'/index.html')
        await wait_ready(pg)
        print('ready in',round(time.time()-t,1),'s')
        lst=await pg.evaluate("window.__pp.list.map(function(p){return {id:p.id,name:p.name,conc:p.conc,L:p.L,img:p.img,sizes:p.sizes}})")
        st=await pg.evaluate("window.__pp.state.st")
        print('sources',json.dumps(st,ensure_ascii=False))
        print('list size',len(lst),'truth',len(FXJ['truth']))
        idx={}
        dup=0
        for it in lst:
            k=(norm(it['name']),it['conc'])
            if k in idx: dup+=1
            idx[k]=it
        print('duplicate display rows:',dup)
        found=0;miss=[];bad=[];tot=0;n1=0
        for t in FXJ['truth']:
            k=(norm(t['brand']+' '+t['name']),t['conc'])
            it=idx.get(k)
            if not it: miss.append(k); continue
            found+=1
            for s in t['sizes']:
                z=[x for x in it['sizes'] if x['ml']==s['ml']]
                if not z: continue
                tot+=1
                err=abs(z[0]['price']-s['price'])/s['price']
                if z[0]['n']<2:n1+=1
                if err>.08: bad.append((k,s['ml'],s['price'],z[0]['price'],z[0]['n']))
        print('truth found',found,'missing',len(miss),'size-prices checked',tot,'single-source',n1,'off>8%:',len(bad))
        for x in bad[:12]: print('  BAD',x)
        for x in miss[:8]: print('  MISS',x)
        extra=[it for it in lst if (norm(it['name']),it['conc']) not in {(norm(t['brand']+' '+t['name']),t['conc']) for t in FXJ['truth']}]
        print('rows not in truth (junk/typos):',len(extra),[e['name'] for e in extra[:8]])
        tester=[it for it in lst if 'تستر' in it['name']]
        print('tester rows:',len(tester))
        print('letters',sorted(set(i['L'] for i in lst)))
        # ترتیب الفبایی
        names=[i['name'] for i in lst]
        print('first',names[:4],'last',names[-3:])
        print('errors',errs)
        await b.close()
asyncio.run(main())
