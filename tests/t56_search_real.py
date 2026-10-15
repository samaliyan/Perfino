import asyncio,json,sys,time,statistics
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:400] if i!='' else ''))
# داده‌ی واقعی فروشگاه‌ها (۱۵۶ برند، ۱۲ هزار عطر) که از عنوان‌های واقعیِ چهار فروشگاه ساخته شده؛ /tmp/w/realdb.json
_d=json.load(open('/tmp/w/realdb.json')); _n=int(time.time()*1000)
_d['fv']=5; _d['t']={k:_n for k in ('liliome','digikala','safir','hiland')}; _d['full']=dict(_d['t'])
for _s in _d['it'].values():
    for _k in _s: _s[_k][4]=_n//60000
DB=json.dumps(_d,ensure_ascii=False); del _d
MOCK="""
window.__files={'pp.db':%s};
(function(){var N=window.Native;
 N.fileSet=function(k,t){window.__files[k]=t;return true};
 N.fileGet=function(k){var v=window.__files[k];return v==null?'':(typeof v==='string'?v:JSON.stringify(v))};
 window.__MODE=function(u){return {s:503,b:''}};
})();
"""%DB
JS_ROWS="Array.prototype.map.call(document.querySelectorAll('#srr .pc[data-id]'),function(b){return {m:b.querySelector('.pin b').textContent,b:b.querySelector('.pin small').textContent.replace(/ · .*/,''),id:b.dataset.id}})"
async def typeq(pg,q,wait=260):
    await pg.fill('#srq',q); await pg.wait_for_timeout(wait)
    return await pg.evaluate("({rows:%s,emp:(document.querySelector('#srr .sremp')||{}).textContent||''})"%JS_ROWS)
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,extra=MOCK)
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(300)
        n=await pg.evaluate("__pp.list.length"); nb=await pg.evaluate("__pp.tree.length")
        nm=await pg.evaluate("__pp.tree.reduce(function(a,b){return a+b.models.length},0)")
        print('data: variants',n,'brands',nb,'models',nm)
        chk('داده‌ی واقعی بالا آمد (۱۰۰+ برند، ۵۰۰۰+ عطر)',nb>100 and nm>5000,(nb,nm))
        # ---- کار با جستجو در حالت سرد (نمایه هنوز ساخته نشده)
        t0=time.time()
        await pg.evaluate("document.getElementById('dkS').click()")
        r=await typeq(pg,'ساواج',wait=60)
        await pg.wait_for_function("document.querySelectorAll('#srr .pc[data-id]').length>0",timeout=20000)
        cold=time.time()-t0
        print('cold first search seconds',round(cold,2))
        chk('جستجوی سرد (بدون نمایه‌ی از پیش ساخته) کمتر از ۸ ثانیه جواب می‌دهد',cold<8,round(cold,2))
        # ---- نمونه‌های دست‌نویس
        def top(r,k=0): return (r['rows'][k]['b'],r['rows'][k]['m']) if len(r['rows'])>k else None
        cases=[
         ('ساواج',('دیور','ساواج')),('sauvage',('دیور','ساواج')),('عطر ساواج',('دیور','ساواج')),('عطر ادکلن ساواج دیور',('دیور','ساواج')),('دیور ساواج',('دیور','ساواج')),
         ('اینوکتوس',('پاکو رابان','اینویکتوس')),('بلو شنل',('شنل','بلو')),('bleu de chanel',('شنل','بلو')),('بلو دو شنل',('شنل','بلو')),
         ('اروس',('ورساچه','اروس')),('ورساچه اروس',('ورساچه','اروس')),('versace eros',('ورساچه','اروس')),
         ('هپی',('کلینیک','هاپی')),('کلینیک هپی',('کلینیک','هاپی')),('کلینیک هاپی',('کلینیک','هاپی')),
         ('اکوا دی جیو',('جورجیو آرمانی','اکوا دی جیو')),('آکوا دی جیو',('جورجیو آرمانی','اکوا دی جیو')),
         ('گوچی بامبو',('گوچی','بامبو')),('بامبو',('گوچی','بامبو')),('لا ویه است بل',('لانکوم','لا ویه است بل')),('لاویه است بل',('لانکوم','لا ویه است بل')),
         ('تام فورد عود وود',('تام فورد','عود وود')),('عود وود',('تام فورد','عود وود')),('کرید اونتوس',('کرید','اونتوس')),('اونتوس',('کرید','اونتوس')),
         ('هوگو باس',('هوگو بوس','هوگو باس')),('لیبره',('ایو سن لوران','لیبره')),('ساواگ',('دیور','ساواج')),('دیور ساوج',('دیور','ساواج')),
        ]
        okc=0; bad=[]
        for q,exp in cases:
            r=await typeq(pg,q)
            if top(r)==exp: okc+=1
            else: bad.append((q,exp,[ (x['b'],x['m']) for x in r['rows'][:3]]))
        chk('عطرِ درست اول است: %d از %d نمونه'%(okc,len(cases)),okc==len(cases),bad)
        # ---- فقط نام برند: عطرهای همان برند اول بیایند
        for q,br in (('دیویدوف','دیویدوف'),('داویدوف','دیویدوف'),('امواج','آمواج'),('آمواج','آمواج'),('دیور','دیور'),('هوگو بوس','هوگو بوس'),('ورساچه','ورساچه'),('versace','ورساچه'),('givenchy','ژیوانشی'),('ژیوانشی','ژیوانشی'),('تام فورد','تام فورد'),('مونت بلنک','مونت بلانک')):
            r=await typeq(pg,q)
            first=[x['b'] for x in r['rows'][:8]]
            if q=='مونت بلنک':      # در داده، چند عطر همین املا را دارند (حتی در برند «سایر»)؛ اولی باید از خود برند باشد و اکثرِ ردیف‌ها هم
                chk('«مونت بلنک»: ردیف اول از برند «مونت بلانک» و حداقل ۵ از ۸ ردیف اول همان برند',first[:1]==[br] and sum(1 for x in first if x==br)>=5,first); continue
            chk('فقط برند «%s»: ۸ ردیف اول همه از برند «%s» هستند'%(q,br),len(first)>=5 and all(x==br for x in first),first)
        # ---- بی‌معنی
        for q in ('zzzz','xqzv','ؤؤؤؤؤ'):
            r=await typeq(pg,q); chk('«%s»: چیزی پیدا نشد (نه فهرستِ بی‌ربط)'%q,len(r['rows'])==0 and 'چیزی پیدا نشد' in r['emp'],(len(r['rows']),r['rows'][:2]))
        # ---- شماره‌ی نام: «شنل ۵» باید «نامبر ۵» را اول بیاورد، نه عطرهای بی‌شماره‌ی شنل
        for q in ('شنل 5','شنل ۵','شنل پنج','نامبر 5 شنل'):
            r=await typeq(pg,q); f=r['rows'][0] if r['rows'] else {}
            chk('«%s»: اولین نتیجه «شنل … ۵» است'%q,f.get('b')=='شنل' and any(k in f.get('m','') for k in ('5','۵','پنج')),[(x['b'],x['m']) for x in r['rows'][:3]])
        # ---- نمونه‌ی تصادفی از خودِ داده: «برند + مدل» باید همان مدل را اول بیاورد
        sample=await pg.evaluate("""(function(){var o=[],i=0;__pp.tree.forEach(function(b){b.models.forEach(function(m){if(i++%110===0&&m.name.length>2)o.push([b.name,m.name,m.id])})});return o})()""")
        ok1=ok3=0; badl=[]
        for bn,mn,mid in sample:
            if bn=='سایر برندها': bn=''      # «سایر برندها» نامِ واقعیِ برند نیست؛ کسی آن را تایپ نمی‌کند
            r=await typeq(pg,(bn+' '+mn).strip(),wait=200)
            ids=[x['id'] for x in r['rows']]
            if ids[:1]==[mid]: ok1+=1
            if mid in ids[:3]: ok3+=1
            elif len(badl)<6: badl.append((bn,mn,[(x['b'],x['m']) for x in r['rows'][:3]]))
        print('sample',len(sample),'top1',ok1,'top3',ok3)
        chk('«برند + نام مدل» از داده‌ی واقعی: اول در ≥ ۹۵٪ و در سه‌تای اول ≥ ۹۸٪ (نمونه %d: اول %d، سه‌تای اول %d)'%(len(sample),ok1,ok3),ok1>=len(sample)*.95 and ok3>=len(sample)*.98,badl)
        ok1=0; badl=[]
        for bn,mn,mid in sample:
            r=await typeq(pg,mn,wait=200)
            ids=[x['id'] for x in r['rows']]
            tie=[x for x in r['rows'] if x['m']==mn]
            if ids[:1]==[mid] or (tie and r['rows'][0]['m']==mn): ok1+=1
            elif len(badl)<6: badl.append((bn,mn,[(x['b'],x['m']) for x in r['rows'][:3]]))
        chk('فقط «نام مدل»: عطر (یا هم‌نامش) اول است ≥ ۹۸٪ (%d از %d)'%(ok1,len(sample)),ok1>=len(sample)*.98,badl)
        # ---- تایپ حرف به حرف
        await pg.fill('#srq','')
        await pg.focus('#srq')
        seq=[]
        for ch in 'ساواج':
            await pg.keyboard.type(ch,delay=30); await pg.wait_for_timeout(200)
            seq.append(await pg.evaluate("({n:document.querySelectorAll('#srr .pc[data-id]').length,emp:(document.querySelector('#srr .sremp')||{}).textContent||''})"))
        chk('تایپ حرف به حرف «ساواج»: در هر مرحله چیزی نشان داده می‌شود، نه «پیدا نشد»',all(x['n']>0 for x in seq),seq)
        r=await pg.evaluate("%s"%JS_ROWS)
        chk('... و در پایان عطر درست اول است',(r[0]['b'],r[0]['m'])==('دیور','ساواج') if r else False,r[:2])
        await pg.fill('#srq','دیور ساوا'); await pg.wait_for_timeout(250)
        r=await pg.evaluate("%s"%JS_ROWS)
        chk('نیمه‌تمام «دیور ساوا»: همه از برند دیور و نام‌ها با «ساو» شروع می‌شود',len(r)>0 and r[0]['b']=='دیور' and r[0]['m'].startswith('ساو'),r[:3])
        # ---- سرعت هر بار نوشتن
        times=[]
        for q in ('س','سا','ساو','sauv','دیور','bleu','کرید او','عطر','a','ک','tom ford','هپی کلی','لانکوم لا','ورساچه ا','jean paul','پاکو'):
            dt=await pg.evaluate("""(function(q){return new Promise(function(res){var box=document.getElementById('srr'),t0=performance.now();var mo=new MutationObserver(function(){mo.disconnect();res(performance.now()-t0)});mo.observe(box,{childList:true,subtree:true});var i=document.getElementById('srq');i.value=q;i.dispatchEvent(new Event('input'));setTimeout(function(){mo.disconnect();res(-1)},5000)})})(%s)"""%json.dumps(q))
            times.append(dt-120)
        print('keystroke ms',[round(x) for x in times])
        med=statistics.median(times); mx=max(times)
        chk('هر بار نوشتن (روی این کامپیوتر) میانه ≤ ۱۵۰ و بیشینه ≤ ۴۰۰ میلی‌ثانیه (میانه %d، بیشینه %d)'%(med,mx),med<=150 and mx<=400 and min(times)>-100,[round(x) for x in times])
        await pg.reload(); await wait_ready(pg,180000); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        # ---- گفتار روی داده‌ی واقعی
        async def say(alts): return await pg.evaluate("(function(a){var d=document.getElementById('dt');if(d.classList.contains('on'))document.getElementById('dtx').click();return __pp.voice(a)})(%s)"%json.dumps(alts,ensure_ascii=False))
        for alts,kind,name in ((['ساواج'],'open','«ساواج»'),(['دیور ساواج'],'open','«دیور ساواج»'),(['عطر ادکلن اروس ورساچه بده'],'open','جمله‌ی اضافه'),(['تام فورد عود وود'],'open','«تام فورد عود وود»'),(['دیور'],'list','فقط برند'),(['ساواگ','ساواج'],None,'حدس اول غلط'),(['ضضض غغغ'],None,'بی‌معنی')):
            r=await say(alts)
            if kind=='open': chk('گفتار %s → فهرستِ عکس‌دار با «بهترین حدس» (چیزی خودش باز نمی‌شود)'%name,r and r['kind']=='list' and r['best'] and not await pg.evaluate("document.getElementById('dt').classList.contains('on')"),r)
            elif kind: chk('گفتار %s → %s'%(name,kind),r and r['kind']==kind,r)
        r=await say(['ضضض غغغ']); chk('گفتارِ بی‌معنی عطری را باز نمی‌کند و «بهترین حدس» نمی‌دهد',r and not r.get('best') and not await pg.evaluate("document.getElementById('dt').classList.contains('on')"),r)
        chk('بدون خطای صفحه',not errs,errs[:3])
        await b.close()
    print(len(OK),'pass',len(BAD),'fail',BAD)
asyncio.run(main())
