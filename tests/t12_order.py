import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,90000)
        r=await pg.evaluate("""function(){
          var db=window.__pp.state.db,recs=[];
          Object.keys(db.it).forEach(function(s){Object.keys(db.it[s]).forEach(function(k){var e=db.it[s][k];if(e[2]&&e[1]>0)recs.push({src:s,t:e[0],price:e[1],img:''})})});
          var seed=11;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
          function sig(l){var m={};l.forEach(function(x){m[x.name+'|'+x.conc+'|'+x.gn]=x.sizes.map(function(z){return z.ml+':'+z.price}).join(',')});return m}
          var O=['liliome','digikala','safir','hiland'],T={liliome:1,digikala:1};
          var base=sig(Core.aggregate(recs,O,T)),res=[];
          for(var t=0;t<5;t++){
            var a=recs.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var x=a[i];a[i]=a[j];a[j]=x}
            var cur=sig(Core.aggregate(a,O,T)),diff=0,miss=0,ex=[];
            Object.keys(base).forEach(function(k){if(!(k in cur)){miss++;if(ex.length<3)ex.push('missing '+k)}else if(cur[k]!==base[k]){diff++;if(ex.length<3)ex.push(k+' '+base[k]+' vs '+cur[k])}});
            var extra=Object.keys(cur).filter(function(k){return !(k in base)}).length;
            res.push([Object.keys(base).length,Object.keys(cur).length,diff,miss,extra,ex]);
          }
          return res}""")
        for x in r: print('rows base/shuffled',x[0],x[1],'| price-diff',x[2],'missing',x[3],'extra',x[4],x[5])
        await b.close()
asyncio.run(main())
