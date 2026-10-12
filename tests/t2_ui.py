import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
CHECK="""
function(){
 var P=[];
 function R(e){return e.getBoundingClientRect()}
 function inter(a,b){var w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return w>1.5&&h>1.5}
 var vh=innerHeight,vw=innerWidth;
 if(document.documentElement.scrollWidth>vw+1)P.push('page h-scroll');
 var rows=[].slice.call(document.querySelectorAll('.mod .rw'));
 var seen=0;
 rows.forEach(function(r){
  var rr=R(r); if(rr.bottom<110||rr.top>vh-5||rr.width<5)return;
  var op=parseFloat(getComputedStyle(r).opacity); if(op<.6)return;
  if(getComputedStyle(r).visibility==='hidden')return;
  seen++;
  var nm=r.querySelector('.n'),pr=r.querySelector('.pr'),tl=r.querySelector('.tile'),tg=r.querySelector('.tg'),id=nm.textContent.slice(0,22);
  var kids=[['n',nm],['pr',pr],['tile',tl]]; if(tg)kids.push(['tg',tg]);
  if(nm.scrollHeight>nm.clientHeight+1&&!nm.style.webkitLineClamp)P.push('name clipped: '+id);
  if(pr.scrollWidth>pr.clientWidth+1)P.push('price overflow: '+id+' '+pr.textContent.slice(0,20));
  for(var i=0;i<kids.length;i++){
   var k=R(kids[i][1]); if(k.width<1)continue;
   if(k.left<rr.left-1||k.right>rr.right+1||k.top<rr.top-1||k.bottom>rr.bottom+1)P.push('out of row '+kids[i][0]+': '+id);
   for(var j=i+1;j<kids.length;j++){ if(inter(k,R(kids[j][1])))P.push('overlap '+kids[i][0]+'/'+kids[j][0]+': '+id)}
  }
  // سطرهای قیمت داخل ستون
  [].forEach.call(pr.children,function(c){ if(R(c).right>R(pr).right+1||R(c).left<R(pr).left-1)P.push('price line out: '+id)});
 });
 // بالای صفحه
 var g=R(document.getElementById('gear')),u=R(document.getElementById('upd'));
 if(inter(g,u))P.push('gear/pill overlap');
 [].forEach.call(document.querySelectorAll('.mod .t1,.mod .t2,.mod .cl'),function(e){ if(inter(R(e),g)||inter(R(e),u))P.push('header text overlaps gear/pill: '+e.className)});
 // مدل الف
 var pn=document.querySelector('.ma .pn');
 if(pn){
  var nm=pn.querySelector('.nm'),tx=pn.querySelector('.tx'),ph=pn.querySelector('.ph'),lns=[].slice.call(pn.querySelectorAll('.ln')),tg=pn.querySelector('.tg');
  if(nm.scrollHeight>nm.clientHeight+1+0)P.push('A nm clipped');
  var els=[['nm',nm],['tg',tg],['ph',ph]].concat(lns.map(function(l,i){return ['ln'+i,l]}));
  for(var a=0;a<els.length;a++){var ra=R(els[a][1]);if(ra.width<1)continue;
   if(ra.left<R(pn).left-1||ra.right>R(pn).right+1||ra.bottom>R(pn).bottom+1||ra.top<R(pn).top-1)P.push('A out of panel '+els[a][0]);
   for(var b=a+1;b<els.length;b++){var rb=R(els[b][1]);if(rb.width<1)continue;if(inter(ra,rb))P.push('A overlap '+els[a][0]+'/'+els[b][0])}}
  lns.forEach(function(l,i){if(l.scrollWidth>l.clientWidth+1)P.push('A line overflow '+i);var b=l.querySelector('b'),s=l.querySelector('span');if(inter(R(b),R(s)))P.push('A label/price overlap '+i)});
  var wh=document.querySelector('.ma .wh'),whr=R(wh);
  if(R(pn).top<whr.top+100)P.push('A wheel too short: '+(R(pn).top-whr.top));
  [].forEach.call(document.querySelectorAll('.ma .wr'),function(w){var r=R(w);if(getComputedStyle(w).display==='none'||parseFloat(w.style.opacity)<.6)return;
    var wt=w.firstChild;if(wt.scrollWidth>wt.clientWidth+1&&parseFloat(getComputedStyle(wt).fontSize)>12.5)P.push('A row name clipped w/o shrinking: '+w.textContent.slice(0,20));
    if(r.left<40)P.push('A row under letter strip: '+w.textContent.slice(0,20)+' '+Math.round(r.left))});
  var ab=R(document.querySelector('.ma .ab')); if(ab.bottom>R(pn).top+1)P.push('A strip overlaps panel');
 }
 // نوار حروف داخل صفحه
 var fs=document.querySelector('.mod .fs2'); if(fs){var f=R(fs); if(f.bottom>vh+1||f.top<0)P.push('strip out of screen')}
 return {p:P,rows:seen};
}
"""
async def run(p,w,h,theme,model,errsall):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'%s',model:'%s'}));"%(theme,model)
    b,ctx,pg,errs=await new_page(p,w,h,theme,extra=init)
    await pg.goto('file://'+ROOT+'/index.html')
    await wait_ready(pg)
    await pg.wait_for_timeout(700)
    lst=await pg.evaluate("window.__pp.list.map(function(p){return [p.name.length,Math.max.apply(null,p.sizes.map(function(s){return s.price})),p.sizes.length]})")
    # شاخص‌های سخت: بلندترین نام، گران‌ترین، بیشترین سایز
    hard=sorted(set([max(range(len(lst)),key=lambda i:lst[i][0]),max(range(len(lst)),key=lambda i:lst[i][1]),max(range(len(lst)),key=lambda i:(lst[i][2],lst[i][0])),0,len(lst)-1,len(lst)//2,333,777]))
    longs=sorted(range(len(lst)),key=lambda i:-lst[i][0])[:6]
    probs=[];nrows=0
    for i in hard+longs:
        await pg.evaluate("window.__pp.model.goto(%d)"%i)
        await pg.wait_for_timeout(500)
        r=await pg.evaluate(CHECK)
        nrows+=r['rows']
        for x in r['p']:probs.append('[idx %d] %s'%(i,x))
    await pg.screenshot(path='/home/claude/PerfumePrice/tests/shots/%s_%s_%dx%d.png'%(model,theme,w,h))
    errsall.extend(['%s %s %dx%d: %s'%(model,theme,w,h,e) for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e])
    await b.close()
    return probs,nrows
async def main():
    import os;os.makedirs('/home/claude/PerfumePrice/tests/shots',exist_ok=True)
    errsall=[];tot=0;allp={}
    async with async_playwright() as p:
        for (w,h) in [(320,640),(360,780),(412,915)]:
            for theme in ['dark','light']:
                for model in ['a','c','z','h']:
                    probs,n=await run(p,w,h,theme,model,errsall)
                    tot+=n
                    key='%s %s %dx%d'%(model,theme,w,h)
                    print(key,'rows checked',n,'problems',len(probs))
                    if probs: allp[key]=probs
    print('TOTAL rows',tot)
    for k,v in allp.items():
        print('==',k)
        for x in sorted(set(v))[:14]:print('  ',x)
    print('JS errors:',errsall)
asyncio.run(main())
