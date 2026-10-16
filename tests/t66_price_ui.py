# ظاهرِ قیمت‌ها (۱.۳۴): قیمت در همه‌ی بخش‌ها «حبابِ رنگی» است، ارزان‌ترین فروشگاه علامت دارد، گزارش «قبلاً/الان» رنگی است،
# هیچ حبابی از جایش بیرون نمی‌زند (۳ عرض × ۴ اندازه‌ی نوشته × ۲ پوسته) و رنگ‌ها به‌اندازه‌ی کافی خوانا هستند.
import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from rep_common import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
# نسبتِ روشنایی (WCAG) میانِ رنگِ نوشته و رنگِ پشتِ آن؛ پشت = همه‌ی لایه‌های شفافِ پدرها روی هم
CONTRAST_JS="""
function pzContrast(el){
  function parse(c){var m=/rgba?\\(([^)]+)\\)/.exec(c);if(!m)return [0,0,0,0];var p=m[1].split(',').map(parseFloat);return [p[0],p[1],p[2],p.length>3?p[3]:1]}
  function over(f,b){var a=f[3];return [f[0]*a+b[0]*(1-a),f[1]*a+b[1]*(1-a),f[2]*a+b[2]*(1-a),1]}
  var chain=[],e=el;while(e&&e.nodeType===1){chain.push(parse(getComputedStyle(e).backgroundColor));e=e.parentElement}
  var bg=parse(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().length?'rgb(12,15,31)':'rgb(255,255,255)');
  var cs=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if(/^#/.test(cs)){var h=cs.slice(1);if(h.length===3)h=h.split('').map(function(x){return x+x}).join('');bg=[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),1]}
  for(var i=chain.length-1;i>=0;i--)bg=over(chain[i],bg);
  var fg=over(parse(getComputedStyle(el).color),bg);
  function L(c){var a=c.slice(0,3).map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]}
  var l1=L(fg),l2=L(bg);if(l1<l2){var t=l1;l1=l2;l2=t}return (l1+0.05)/(l2+0.05);
}
"""
def CJS(body): return "(function(){"+CONTRAST_JS+"return "+body+"})()"
async def page(p,seed,sch,fs,W,extra=''):
    init="localStorage.setItem('pp.set',JSON.stringify({theme:'%s',model:'c',fs:%d}));"%(sch,fs)+extra
    b,ctx,pg,errs=await new_page(p,W,780,sch,extra=pre_js(seed,0,init))
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
    return b,pg,errs
async def main():
    async with async_playwright() as p:
        flat,mid0=await first_flat(p); seed=make_seed(flat)
        # ---------- ۱) صفحه‌ی قیمت: حباب، ارزان‌ترین، دکمه‌ی کوچک‌تر ----------
        for sch in ('dark','light'):
            b,pg,errs=await page(p,seed,sch,0,360); ev=pg.evaluate
            mid=await ev("""(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++){var m=t[i].models[j];for(var k=0;k<m.variants.length;k++)for(var z=0;z<m.variants[k].sizes.length;z++){var s=m.variants[k].sizes[z].srcs.filter(function(q){return q.used&&q.price>0});var pr=s.map(function(q){return q.price});if(s.length>2&&Math.min.apply(null,pr)<Math.max.apply(null,pr))return {m:m.id,k:k,z:z,lo:Math.min.apply(null,pr),n:s.filter(function(q){return q.price===Math.min.apply(null,pr)}).length}}}return null})()""")
            chk('[%s] موردی با چند فروشگاه و قیمتِ متفاوت پیدا شد'%sch,mid is not None,mid)
            await ev("window.__pp.open(%s)"%json.dumps(mid['m'])); await pg.wait_for_timeout(700)
            await ev("document.querySelectorAll('#dtc .vr')[%d].querySelectorAll('.sz')[%d].click()"%(mid['k'],mid['z'])); await pg.wait_for_timeout(400)
            r=await ev("""(function(){var vr=document.querySelectorAll('#dtc .vr')[%d],zz=vr.querySelectorAll('.srl')[%d];var rows=[].slice.call(zz.querySelectorAll('.sr'));
              var lo=rows.filter(function(r){return r.classList.contains('lo')});
              return {rows:rows.length,lo:lo.length,lob:lo.filter(function(r){return r.querySelector('.lob')&&r.querySelector('.lob').textContent.indexOf('ارزان‌ترین')>=0}).length,
                loPrices:lo.map(function(r){return r.querySelector('.pz b').textContent}),
                allHavePz:rows.every(function(r){return !!r.querySelector('.sp .pz b')}),
                goH:rows.map(function(r){var g=r.querySelector('.go');return g?Math.round(g.getBoundingClientRect().height):0}),
                mainPz:!!vr.querySelectorAll('.sz')[%d].querySelector('.zp .pz'),
                mainFs:parseFloat(getComputedStyle(vr.querySelectorAll('.sz')[%d].querySelector('.zp .pz')).fontSize)}})()"""%(mid['k'],mid['z'],mid['z'],mid['z']))
            chk('[%s] ردیفِ ارزان‌ترین‌ها علامت دارند (%d مورد)'%(sch,mid['n']),r['lo']==mid['n'] and r['lob']==mid['n'],r)
            chk('[%s] قیمتِ هر فروشگاه حباب است'%sch,r['allHavePz'])
            chk('[%s] دکمه‌ی دیدن در سایت بلند نیست (۴۰ تا ۴۸ پیکسل): %s'%(sch,r['goH']),all(40<=h<=48 for h in r['goH']))
            chk('[%s] قیمتِ اندازه حباب و درشت است (%s px)'%(sch,r['mainFs']),r['mainPz'] and r['mainFs']>=19)
            # ارزان‌ترین از بقیه رنگ جدا دارد
            d=await ev("""(function(){var vr=document.querySelectorAll('#dtc .vr')[%d],zz=vr.querySelectorAll('.srl')[%d];var a=zz.querySelector('.sr.lo .pz'),b=zz.querySelector('.sr:not(.lo):not(.x) .pz');return a&&b?[getComputedStyle(a).color,getComputedStyle(b).color]:null})()"""%(mid['k'],mid['z']))
            chk('[%s] رنگِ قیمتِ ارزان‌ترین با بقیه فرق دارد'%sch,d is not None and d[0]!=d[1],d)
            # خوانایی
            c=await ev(CJS("""(function(){var o={};['.zp .pz','.sr.lo .pz','.sr:not(.lo):not(.x) .pz','.sr .lob','.sr .go'].forEach(function(s){var e=document.querySelector('#dtc '+s);o[s]=e?Math.round(pzContrast(e)*10)/10:null});return o})()"""))
            chk('[%s] خوانایی (نسبتِ روشنایی ≥ ۴٫۵): %s'%(sch,c),all(v is not None and v>=4.5 for v in c.values()),c)
            await b.close()
        # ---------- ۲) جدولِ بیرون‌نزدن: ۳ عرض × ۴ اندازه × ۲ پوسته ----------
        for W in (320,360,412):
            for fs in (0,1,2,3):
                for sch in ('dark','light'):
                    b,pg,errs=await page(p,seed,sch,fs,W); ev=pg.evaluate
                    mid=await ev("window.__pp.flat[0].id"); 
                    m0=await ev("""(function(){var t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++){var m=t[i].models[j];for(var k=0;k<m.variants.length;k++)if(m.variants[k].sizes.some(function(z){return z.srcs.length>2}))return m.id}})()""")
                    await ev("window.__pp.open(%s)"%json.dumps(m0)); await pg.wait_for_timeout(600)
                    await ev("[].forEach.call(document.querySelectorAll('#dtc .sz'),function(x){x.click()})"); await pg.wait_for_timeout(350)
                    d=await ev("""(function(){var bad=[],n=0,s=document.getElementById('dtc');[].forEach.call(s.querySelectorAll('.pz,.sr,.zp,.go'),function(e){n++;var r=e.getBoundingClientRect();if(r.width&&(r.right>innerWidth+1||r.left<-1))bad.push('out:'+e.className);if(e.classList.contains('pz')&&e.scrollWidth>e.clientWidth+1)bad.push('clip')});
                      if(s.scrollWidth>s.clientWidth+1)bad.push('hscroll');return {n:n,bad:bad.slice(0,4)}})()""")
                    chk('صفحه‌ی قیمت W=%d fs=%d %s: بیرون‌زدگی ندارد'%(W,fs,sch),d['n']>0 and not d['bad'],d)
                    await ev("document.getElementById('dtx').click()"); await pg.wait_for_timeout(400)
                    # جستجو: حباب در همه‌ی کارت‌ها جا می‌شود
                    await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(300)
                    await pg.fill('#srq','ساواج'); await pg.wait_for_timeout(600)
                    d=await ev("""(function(){var bad=[],n=0;[].forEach.call(document.querySelectorAll('#srr .pc'),function(c){var z=c.querySelector('.pz');if(!z)return;n++;var zr=z.getBoundingClientRect(),cr=c.getBoundingClientRect(),pg=c.querySelector('.pgo').getBoundingClientRect(),b=z.querySelector('b').getBoundingClientRect();
                      if(b.left<zr.left-0.5||b.right>zr.right+0.5||zr.right>cr.right+1||zr.left<cr.left-1||zr.left<pg.right-1)bad.push(Math.round(b.left)+'/'+Math.round(zr.left))});return {n:n,bad:bad.slice(0,3)}})()""")
                    chk('کارت‌های جستجو W=%d fs=%d %s: حبابِ قیمت جا می‌شود'%(W,fs,sch),d['n']>0 and not d['bad'],d)
                    if W==360 and fs in (0,3):
                        # قیمتِ روی کارت = ۱۰۰ میلِ ارزان‌ترین نسخه
                        e=await ev("""(function(){var bad=[];[].forEach.call(document.querySelectorAll('#srr .pc[data-id]'),function(c){var id=c.dataset.id,m=null;window.__pp.tree.forEach(function(b){b.models.forEach(function(x){if(x.id===id)m=x})});if(!m)return;
                          var c1=[];m.variants.forEach(function(v){v.sizes.forEach(function(z){if(z.ml===100&&z.price>0)c1.push(z.price)})});var z=c.querySelector('.pz b');
                          if(c1.length){var want=Math.min.apply(null,c1).toLocaleString('fa-IR').replace(/\\u066c/g,'’');var got=z?z.textContent:'';var digits=function(t){return t.replace(/[^\\u06f0-\\u06f9\\u0660-\\u0669]/g,'').replace(/[\\u0660-\\u0669]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-0x0660+0x06f0)})};if(digits(want)!==digits(got))bad.push([id,want,got])}});return bad.slice(0,3)})()""")
                        chk('قیمتِ کارتِ جستجو درست است (W=%d fs=%d %s)'%(W,fs,sch),not e,e)
                    await b.close()
        # ---------- ۳) ستاره‌ی لیست مغازه زرد است (قبلاً به‌خاطر یک سلکتورِ غلط خاکستری بود) ----------
        b,pg,errs=await page(p,seed,'dark',0,360); ev=pg.evaluate
        mids=await ev("(function(){var o=[];window.__pp.tree.forEach(function(b){b.models.forEach(function(m){if(o.length<2)o.push(m.id)})});return o})()")
        for m in mids:
            await ev("window.__pp.open(%s)"%json.dumps(m)); await pg.wait_for_timeout(500)
            await ev("document.querySelector('#dtc .dact button').click()"); await pg.wait_for_timeout(250)
        await ev("document.getElementById('dtx').click()"); await pg.wait_for_timeout(400)
        await ev("document.getElementById('dkF').click()"); await pg.wait_for_timeout(600)
        s=await ev("(function(){var e=document.querySelector('#fvr .pfv');var c=getComputedStyle(e);var r=e.getBoundingClientRect();return {color:c.color,bg:c.backgroundColor,w:Math.round(r.width),h:Math.round(r.height),pz:document.querySelectorAll('#fvr .pc .pz').length}})()")
        chk('ستاره‌ی لیست مغازه زرد و گرد است',s['color']=='rgb(224, 160, 48)' and s['bg']=='rgba(0, 0, 0, 0)' and s['w']>=44 and s['h']>=44,s)
        chk('کارت‌های لیست مغازه قیمت دارند',s['pz']==len(mids),s)
        await b.close()
        # ---------- ۴) گزارش: «قبلاً» خط‌خورده، «الان» سبز/قرمز، فرصتِ خرید با ارزان/گران ----------
        for sch in ('dark','light'):
            b,pg,errs=await page(p,seed,sch,0,360); ev=pg.evaluate
            await ev("document.getElementById('nw').click()"); await pg.wait_for_timeout(800)
            await ev("document.querySelector('#mkt2 button[data-t=chg]').click()"); await pg.wait_for_timeout(500)
            r=await ev("""(function(){var q=function(s){return document.querySelectorAll('#mkr '+s).length};return {was:q('.was'),dn:q('.mkr .pz.dn'),up:q('.mkr .pz.up'),chipDn:q('.mv.dn b'),chipUp:q('.mv.up b')}})()""")
            chk('[%s] گزارش/قیمت‌ها: قبلاً خط‌خورده و الان رنگی'%sch,r['was']>=2 and r['dn']>=1 and r['up']>=1 and r['chipDn']>=1 and r['chipUp']>=1,r)
            c=await ev(CJS("""(function(){var o={};['.mkr .pz.dn','.mkr .pz.up','.mv.dn b','.mv.up b','.mkr .pz:not(.dn):not(.up)','.was'].forEach(function(s){var e=document.querySelector('#mkr '+s);o[s]=e?Math.round(pzContrast(e)*10)/10:null});return o})()"""))
            chk('[%s] گزارش: خوانایی ≥ ۴٫۵ (به‌جز «قبلاً» که کم‌رنگ است): %s'%(sch,c),all(v is not None and v>=4.5 for k,v in c.items() if k!='.was' and v is not None) and c['.mkr .pz.dn'] is not None,c)
            h=await ev("document.getElementById('mkr').scrollWidth>document.getElementById('mkr').clientWidth+1")
            chk('[%s] گزارش/قیمت‌ها: اسکرولِ افقی ندارد'%sch,not h)
            await ev("document.querySelector('#mkt2 button[data-t=cmp]').click()"); await pg.wait_for_timeout(500)
            r=await ev("""(function(){var q=function(s){return document.querySelectorAll('#mkr '+s).length};return {dn:q('.mkr .pz.dn'),up:q('.mkr .pz.up'),pn:q('.pnum')}})()""")
            chk('[%s] گزارش/مقایسه: ارزان‌تر سبز و گران‌تر قرمز، مبلغ‌ها رنگی'%sch,r['dn']>=1 and r['up']>=1 and r['pn']>=1,r)
            h=await ev("document.getElementById('mkr').scrollWidth>document.getElementById('mkr').clientWidth+1")
            chk('[%s] گزارش/مقایسه: اسکرولِ افقی ندارد'%sch,not h)
            await b.close()
    print('\nOK %d  FAIL %d'%(len(OK),len(BAD)))
    for x in BAD: print('FAIL:',x)
    sys.exit(1 if BAD else 0)
asyncio.run(main())
