import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,90000)
        r=await pg.evaluate("""function(){var db=window.__pp.state.db,recs=[];
          Object.keys(db.it).forEach(function(s){Object.keys(db.it[s]).forEach(function(k){var e=db.it[s][k];if(e[2]&&e[1]>0)recs.push({src:s,t:e[0],price:e[1],img:''})})});
          var A=Core.aggregate(recs,['liliome','digikala','safir','hiland'],{liliome:1,digikala:1});
          var B=window.__pp.flat;
          var ma={};A.forEach(function(x){ma[x.name+'|'+x.conc]=x.sizes.map(function(z){return z.ml+':'+z.price}).join(',')});
          var diff=0,miss=0,ex=[];B.forEach(function(x){var k=x.name+'|'+x.conc;if(!(k in ma)){miss++;if(ex.length<4)ex.push(k)}else if(ma[k]!==x.sizes.map(function(z){return z.ml+':'+z.price}).join(',')){diff++;if(ex.length<4)ex.push(k+' '+ma[k]+' vs '+x.sizes.map(function(z){return z.ml+':'+z.price}).join(','))}});
          return [A.length,B.length,diff,miss,ex]}""")
        print(r)
        await b.close()
asyncio.run(main())
