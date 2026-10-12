# زبان نام‌ها: فارسی ⇄ انگلیسی، حروف نوار، ساخت نام انگلیسی از فارسی و برعکس
import asyncio,json,sys,re
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(c,m):
    (OK if c else BAD).append(m)
    if not c: print('FAIL',m)
# عطرهای ویژه: یکی با نام انگلیسی از سایت، یکی فقط لاتین
INJ="""(function(){var F=window.__FX,n=0,dk=F.digikala;
 dk.forEach(function(pg){pg.forEach(function(p){n++;
  if(n==3){p.title_fa='عطر ادکلن دیور مدل ساواج الکسیر زنانه ادوپرفیوم 60 میل';p.title_en='Dior Sauvage Elixir Eau de Parfum 60ml';p.id=9990001}
  if(n==5){p.title_fa='Zzqx Wnrk Eau de Parfum 100ml';p.title_en='';p.id=9990002}
  if(n==7){p.title_fa='عطر ادکلن شنل مدل بلو دو شنل مردانه ادوپرفیوم 100 میل';p.title_en='';p.id=9990003}
 })});
 var m=0;F.liliome.forEach(function(pg){pg.forEach(function(p){m++;
  if(m%61==0)p.categories=[{name:'Zorg Plam | زرگ پلم'},{name:'عطر و ادکلن'}];
  if(m%67==0)p.categories=[{name:'Qaxel Brand'},{name:'عطر و ادکلن'}];
 })});})();"""
LATIN=re.compile(r"^[A-Za-z0-9 '&.\-éôè]+$")
FA=re.compile(r"[؀-ۿ]")
async def go(p,lang,model='a',w=360,h=780,extra=''):
    init="if(!localStorage.getItem('pp.set'))localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s',lang:'%s'}));"%(model,lang)+INJ+extra
    b,ctx,pg,errs=await new_page(p,w,h,'dark',extra=init)
    await pg.goto('file://'+ROOT+'/index.html')
    await pg.wait_for_function("window.__pp && window.__pp.gate.ready && window.__pp.list.length>0 && !window.__pp.state.busy",timeout=120000)
    await pg.wait_for_timeout(800)
    return b,pg,errs
ALL="(function(){var o=[];__pp.tree.forEach(function(b){o.push({t:'b',n:b.name,L:b.L,id:b.id});b.models.forEach(function(m){o.push({t:'m',n:m.name,L:m.L,b:b.name})})});return o})()"
async def main():
    async with async_playwright() as p:
        # فارسی
        b,pg,errs=await go(p,'fa')
        A=await pg.evaluate(ALL)
        chk(all(FA.search(x['n']) for x in A),'fa: every brand/model name has Persian letters: '+str([x['n'] for x in A if not FA.search(x['n'])][:5]))
        chk(not [x for x in A if x['L']=='A'],'fa: no Latin "A" section: '+str([x['n'] for x in A if x['L']=='A'][:5]))
        chk(any(x['t']=='b' and x['n']=='زرگ پلم' for x in A),'fa: mixed-script brand hint → Persian part: '+str([x['n'] for x in A if x['t']=='b' and x['L']=='ز']))
        zz=[x for x in A if x['t']=='m' and 'ونرک' in x['n']]
        print('latin-only in fa:',[x['n'] for x in zz])
        chk(len(zz)==1,'fa: latin-only item shown with Persian letters')
        await b.close()
        # انگلیسی
        b,pg,errs=await go(p,'en')
        A=await pg.evaluate(ALL)
        bad=[x['n'] for x in A if not LATIN.match(x['n'])]
        chk(not bad,'en: every name is Latin: '+str(bad[:6]))
        letters=sorted(set(x['L'] for x in A))
        chk(all(re.match(r'^[A-Z#]$',l) for l in letters),'en: letters are A-Z: '+''.join(letters))
        bs=[x['n'].lower() for x in A if x['t']=='b' and x['id']!='other']
        chk(bs==sorted(bs),'en: brands sorted A-Z: '+str(bs[:8]))
        dior=[x['n'] for x in A if x['t']=='m' and x['b']=='Dior']
        chk(any(re.search(r'sauvage',n,re.I) for n in dior),'en: Dior has Sauvage model (name from site title_en): '+str(dior[:6]))
        chk(any(x['t']=='b' and x['n']=='Chanel' for x in A),'en: brand Chanel')
        chk(any(x['t']=='b' and x['n']=='Zorg Plam' for x in A),'en: mixed-script brand hint → Latin part')
        chk(any(x['t']=='b' and x['n']=='Qaxel Brand' for x in A),'en: Latin-hint brand shown by its own name: '+str([x['n'] for x in A if x['t']=='b' and x['L']=='Q']))
        chan=[x['n'] for x in A if x['t']=='m' and x['b']=='Chanel']
        chk(any(n.lower().startswith('bleu') for n in chan),'en: Chanel Bleu de (made from Persian by dictionary): '+str(chan[:8]))
        chk(any('zzqx' in x['n'].lower() for x in A),'en: latin-only item shown')
        # نوار حروف و رفتن با حرف
        info=await pg.evaluate("[].map.call(document.querySelectorAll('.ma .ab > *'),function(e){return e.textContent})")
        chk(len(info)>5 and all(re.match(r'^[A-Z#]$',t) for t in info),'en: strip letters Latin: '+''.join(info))
        await pg.screenshot(path='shots/t18_en.png')
        await b.close()
        # تغییر زبان از تنظیمات و ماندگاری
        b,pg,errs=await go(p,'fa')
        await pg.click('#gear'); await pg.wait_for_timeout(500)
        chk(await pg.evaluate("document.querySelector('#sLang button.on').dataset.l")=='fa','settings: fa selected')
        await pg.click('#sLang button[data-l=en]'); await pg.wait_for_timeout(600)
        s=await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).lang")
        chk(s=='en','settings: choice saved')
        A=await pg.evaluate(ALL); chk(all(LATIN.match(x['n']) for x in A),'toggle→en renames all')
        await pg.reload(); await pg.wait_for_function("window.__pp && window.__pp.gate.ready",timeout=60000); await pg.wait_for_timeout(600)
        A=await pg.evaluate(ALL); chk(all(LATIN.match(x['n']) for x in A),'en persists after restart')
        await pg.click('#gear'); await pg.wait_for_timeout(400); await pg.click('#sLang button[data-l=fa]'); await pg.wait_for_timeout(600)
        A=await pg.evaluate(ALL); chk(all(FA.search(x['n']) for x in A),'toggle→fa back')
        chk(not [e for e in errs if 'Failed to load' not in e],'no js errors: '+str(errs[:2]))
        await b.close()
        # چهار شکل در انگلیسی: حروف سرتیتر لاتین و بدون خطا
        for m in 'acz h'.replace(' ',''):
            b,pg,errs=await go(p,'en',m)
            gh=await pg.evaluate("[].map.call(document.querySelectorAll('.gh,.mod .gh'),function(e){return e.textContent})")
            chk(all(re.match(r'^[A-Z#]$',x) for x in gh),'%s: group letters Latin %s'%(m,''.join(gh[:12])))
            chk(not [e for e in errs if 'Failed to load' not in e],'%s: no js errors'%m)
            await b.close()
        # اسکرول با حرف انگلیسی: نوار حروف در هر چهار شکل
        for m in 'acz h'.replace(' ',''):
            b,pg,errs=await go(p,'en',m)
            if m=='a':
                sb=await pg.locator('.ma .ab').bounding_box()
                await pg.mouse.move(sb['x']+15,sb['y']+sb['height']*.6); await pg.mouse.down(); await pg.wait_for_timeout(150)
                bt=await pg.evaluate("document.querySelector('.ma .bub2').textContent")
                await pg.mouse.up(); await pg.wait_for_timeout(1800)
                nm=await pg.evaluate("document.querySelector('.ma .nm').textContent")
                chk(re.match(r'^[A-Z#]$',bt) and nm[:1].upper()==bt,'A: strip drag → bubble %s, selected "%s"'%(bt,nm))
            else:
                cls={'c':'.mc .scl','z':'.mz .scl','h':'.mh .scl'}[m]
                bb=await pg.locator(cls).bounding_box()
                sb=await pg.locator('.fs2').bounding_box()
                await pg.mouse.move(sb['x']+15,sb['y']+sb['height']*.8); await pg.mouse.down(); await pg.wait_for_timeout(300)
                bt=await pg.evaluate("document.querySelector('.bub2').textContent")
                await pg.mouse.up(); await pg.wait_for_timeout(900)
                cl=await pg.evaluate("document.querySelector('.cl').textContent")
                chk(re.match(r'^[A-Z#]$',bt) and cl==bt,'%s: strip drag → bubble %s, header %s'%(m.upper(),bt,cl))
            await b.close()
        # حروف چرخ: بدون ماسک و بدون برش
        for (w,h) in ((360,780),(320,640)):
            b,pg,errs=await go(p,'fa','a',w,h)
            r=await pg.evaluate("""(function(){var s=document.querySelector('.ma .ab');var masks=[],e=s;while(e&&e!==document.body){var cs=getComputedStyle(e);if((cs.webkitMaskImage&&cs.webkitMaskImage!=='none')||(cs.maskImage&&cs.maskImage!=='none')||parseFloat(cs.opacity)<1)masks.push(e.className);e=e.parentElement}
 var pn=document.querySelector('.ma .pn').getBoundingClientRect().top;var bad=[];var kids=[].slice.call(s.children);kids.forEach(function(k){var r=k.getBoundingClientRect();if(r.top<0||r.bottom>pn+1||r.height<4)bad.push(k.textContent)});return {masks:masks,n:kids.length,bad:bad}})()""")
            chk(not r['masks'] and not r['bad'] and r['n']>5,'%dx%d letter strip fully visible: %s'%(w,h,json.dumps(r,ensure_ascii=False)))
            await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
