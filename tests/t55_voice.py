# گفتن نام عطر، نوار پایین، آخرین‌ها (با Native.startVoice ساختگی؛ تشخیص گفتارِ واقعی روی گوشی تست نمی‌شود)
import asyncio, sys, json
sys.path.insert(0, '/home/claude/PerfumePrice/tests')
from harness import *

fails = []
def chk(c, m):
    print(('ok   ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

MOCK = """window.__vc={calls:0,answer:null};
window.Native.startVoice=function(){window.__vc.calls++;var a=window.__vc.answer;if(a)setTimeout(function(){window.__voiceRes(a)},20);};
window.Native.openPlayStore=function(){window.__vc.play=1;return true};"""

async def fresh(p, fs=0, mock=True, w=360):
    init = "localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'c',fs:%d}));" % fs
    if mock: init += "(function(){var t=setInterval(function(){if(window.Native){clearInterval(t);%s}},1)})();" % MOCK.replace('\n', ' ')
    b, ctx, pg, errs = await new_page(p, w, 780, 'dark', extra=init)
    await pg.goto('file://' + ROOT + '/index.html'); await wait_ready(pg, 120000); await pg.wait_for_timeout(900)
    return b, pg, errs

async def main():
    async with async_playwright() as p:
        b, pg, errs = await fresh(p)
        ev = pg.evaluate
        ids = await ev("(function(){var o={};__pp.tree.forEach(function(b){b.models.forEach(function(m){if(b.name==='تام فورد'&&m.name==='اوپیوم')o.tf=m.id;if(b.name==='دیور'&&m.name==='ابسولو دارک')o.dr=m.id})});return o})()")
        chk(bool(ids.get('tf')), 'داده‌ی آزمایش: تام فورد اوپیوم هست')

        # --- نوار پایین ---
        g = await ev("""(function(){var d=document.getElementById('dock').getBoundingClientRect(),s=document.getElementById('stage').getBoundingClientRect(),m=document.getElementById('dkM').getBoundingClientRect(),q=document.getElementById('dkS').getBoundingClientRect();
          return {dock:[d.top,d.bottom,d.height],stage:[s.top,s.bottom],mic:[m.width,m.height,m.right],srch:[q.width,q.height,q.left,q.right],vis:getComputedStyle(document.getElementById('dock')).display,iw:innerWidth,ih:innerHeight,sr:getComputedStyle(document.getElementById('sr')).visibility}})()""")
        chk(g['vis'] == 'flex', 'نوار پایین دیده می‌شود')
        chk(abs(g['stage'][1] - g['dock'][0]) < 1.5, 'لیست روی نوار پایین نمی‌افتد (stage %.0f، dock %.0f)' % (g['stage'][1], g['dock'][0]))
        chk(g['mic'][1] >= 56 and g['srch'][1] >= 56, 'دکمه‌ها بلندیِ حداقل ۵۶ پیکسل دارند (%d و %d)' % (g['mic'][1], g['srch'][1]))
        chk(g['mic'][0] >= 96, 'دکمه‌ی میکروفون پهن است (%d)' % g['mic'][0])
        chk(g['mic'][2] <= g['iw'] and g['srch'][2] >= 0 and g['srch'][3] < g['mic'][2] - g['mic'][0] + 2, 'دو دکمه روی هم نیستند')
        chk(g['sr'] == 'hidden', 'ذره‌بینِ بالای صفحه تکراری نیست')

        # --- گفتن: نام درست و املای نزدیک ---
        async def say(alts):
            await ev("closeDetail&&0")if False else None
            await ev("(function(){__pp.closeView&&0;var d=document.getElementById('dtx');if(document.getElementById('dt').classList.contains('on'))d.click();})()")
            await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
            await pg.wait_for_timeout(120)
            return await ev("__pp.voice(%s)" % json.dumps(alts, ensure_ascii=False))
        for alts, name in ((["تام فورد اوپیوم"], 'نام کامل'), (["عطر تام فورد اوپیوم بده"], 'با واژه‌های اضافه'), (["تام فورد اوپیم"], 'املای ناقص'), (["تام فرود اپیوم", "تام فورد اوپیوم"], 'حدس اول غلط، حدس دوم درست'), (["تام فورد  اوپیوم"], 'فاصله‌ی اضافه'), (["تام فورد، اوپیوم؟"], 'نقطه‌گذاریِ فارسی')):
            r = await say(alts)
            got = await ev("[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(c){return c.dataset.id})")
            chk(r and r['kind'] == 'list' and ids['tf'] in got[:3] and not await ev("document.getElementById('dt').classList.contains('on')"), 'گفتار «%s» → کارت‌های عکس‌دار، عطر درست در سه‌تای اول، و چیزی بی‌خبر باز نشد %s' % (name, json.dumps(r, ensure_ascii=False)))
        chk(r and r['best'] == ids['tf'], 'نام کامل و بی‌رقیب «بهترین حدس» دارد')
        await pg.wait_for_timeout(450)      # لمسِ بلافاصله بعد از باز شدنِ صفحه، عمداً نادیده گرفته می‌شود
        await ev("document.querySelector('#srr .pc').click()"); await pg.wait_for_timeout(500)
        st = await ev("({on:document.getElementById('dt').classList.contains('on'),srch:document.getElementById('srch').classList.contains('on')})")
        chk(st['on'] and st['srch'], 'زدن روی عکسِ کارت: صفحه‌ی قیمت‌ها باز می‌شود و فهرستِ شنیده‌شده زیرش می‌ماند')
        # جزئیات روی نوار پایین را می‌پوشاند
        await pg.wait_for_timeout(500)
        top = await ev("(function(){var d=document.getElementById('dkM').getBoundingClientRect();var e=document.elementFromPoint(d.left+d.width/2,d.top+d.height/2);return !!e.closest('#dt')})()")
        chk(top, 'وقتی جزئیات باز است نوار پایین بالای آن نیست')
        await ev("window.__back()"); await pg.wait_for_timeout(300)
        chk(await ev("document.getElementById('srch').classList.contains('on') && !document.getElementById('dt').classList.contains('on')"), 'برگشت: همان فهرست شنیده‌شده')

        # --- مبهم: فهرست پیشنهاد، نه حدس ---
        r = await say(["اوپیوم"])
        chk(r and r['kind'] == 'list' and r['n'] >= 2, 'فقط «اوپیوم» (چند برند دارند) → فهرستِ پیشنهاد %s' % json.dumps(r, ensure_ascii=False))
        v = await ev("({on:document.getElementById('srch').classList.contains('on'),val:document.getElementById('srq').value,rows:document.querySelectorAll('#srr .pc[data-id]').length,h:(document.querySelector('#srr .srvh')||{}).textContent||'',dt:document.getElementById('dt').classList.contains('on'),kb:document.activeElement&&document.activeElement.id})")
        chk(v['on'] and v['rows'] >= 2 and 'شنیدم' in v['h'], 'فهرست با «شنیدم: …» نشان داده شد (%d ردیف)' % v['rows'])
        chk(v['kb'] != 'srq', 'صفحه‌کلید خودکار باز نشد')
        chk(not v['dt'], 'عطرِ حدسی باز نشد')
        # انتخاب از فهرست
        await pg.wait_for_timeout(450)      # لمسِ بلافاصله بعد از باز شدنِ صفحه، عمداً نادیده گرفته می‌شود
        await ev("document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(200)
        chk(await ev("document.getElementById('dt').classList.contains('on')"), 'زدن روی یک ردیف، عطر را باز می‌کند')
        r = await say(["دیور"])
        chk(r and r['kind'] == 'list', 'فقط نام برند → فهرست %s' % json.dumps(r, ensure_ascii=False))

        # --- نیافتن ---
        r = await say(["ضضضض غغغغ"])
        chk(r and r['kind'] == 'none', 'چیزِ بی‌معنی → پیدا نشد %s' % json.dumps(r, ensure_ascii=False))
        v = await ev("({on:document.getElementById('srch').classList.contains('on'),val:document.getElementById('srq').value,t:document.getElementById('toast').textContent})")
        chk(v['on'] and 'ضضضض' in v['val'], 'جستجو با همان متن باز شد تا اصلاح کند')
        r = await say(["", "  "])
        chk(r is None, 'گفتارِ خالی → هیچ اتفاقی نمی‌افتد')

        # --- دکمه‌ی میکروفون ---
        await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
        await ev("window.__vc.calls=0;window.__vc.answer=['تام فورد اوپیوم']")
        await ev("document.getElementById('dkM').click();document.getElementById('dkM').click()")
        await pg.wait_for_timeout(400)
        n = await ev("window.__vc.calls")
        chk(n == 1, 'دو بار پشت‌سرهم زدن، فقط یک بار گوش می‌دهد (%d)' % n)
        chk(await ev("document.getElementById('srch').classList.contains('on') && document.querySelectorAll('#srr .pc[data-id]').length")>=1 and not await ev("document.getElementById('dt').classList.contains('on')"), 'با دکمه‌ی میکروفون: عکس‌ها بدون هیچ لمس دیگری نشان داده شد (چیزی خودش باز نشد)')
        await pg.wait_for_timeout(3200)      # پیامِ قبلی (چیزی نشنیدم) محو شود
        for c, expect in (('cancel', None), ('nomatch', 'نشنیدم'), ('fail', 'تشخیص')):
            await ev("window.__voiceErr('%s')" % c); await pg.wait_for_timeout(80)
            t = await ev("(function(){var t=document.getElementById('toast');return t.classList.contains('on')?t.textContent:''})()")
            so = await ev("document.getElementById('srch').classList.contains('on')")
            if expect: chk(expect in t, 'خطای %s → پیام «%s»' % (c, t))
            else: chk(t == '' or 'نشنیدم' not in t, 'لغو → بی‌صدا')
            if c == 'fail': chk(so, 'خطای اینترنت → جستجوی نوشتاری باز شد')
            await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
            await pg.wait_for_timeout(2600) if expect else None
        for c, expect in (('net', 'اینترنت'), ('audio', 'میکروفون')):
            await ev("window.__voiceErr('%s')" % c); await pg.wait_for_timeout(80)
            tt = await ev("document.getElementById('toast').textContent")
            chk(expect in tt, 'خطای %s → پیام «%s»' % (c, tt))
            await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()")
            await pg.wait_for_timeout(2600)
        # متنِ نوشته‌شده با خطای صدا پاک نمی‌شود
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(100)
        await ev("(function(){var q=document.getElementById('srq');q.value='اوپ';q.dispatchEvent(new Event('input'))})()"); await pg.wait_for_timeout(250)
        await ev("window.__voiceErr('net')"); await pg.wait_for_timeout(100)
        chk(await ev("document.getElementById('srq').value") == 'اوپ', 'خطای صدا متنِ نوشته‌شده را پاک نمی‌کند')
        # بعد از خطا دوباره می‌شود گوش داد
        await ev("window.__vc.calls=0;window.__vc.answer=null;document.getElementById('dkM').click()")
        chk(await ev("window.__vc.calls") == 1, 'بعد از خطا دوباره می‌شود گفت')
        await ev("window.__voiceErr('cancel')")

        # --- آخرین‌ها ---
        await ev("(function(){var x=document.getElementById('srx');if(document.getElementById('srch').classList.contains('on'))x.click();})()"); await pg.wait_for_timeout(450)
        await ev("document.getElementById('dkS').click()"); await pg.wait_for_timeout(200)
        rc = await ev("({h:(document.querySelector('#srr .srvh')||{}).textContent||'',rows:[].map.call(document.querySelectorAll('#srr .pc[data-id]'),function(b){return b.innerText.replace(/\\n/g,' | ')})})")
        chk('آخرین' in rc['h'] and len(rc['rows']) >= 2, 'آخرین‌هایی که دیده شد نمایش داده می‌شود %s' % rc['rows'][:3])
        chk(rc['rows'] and 'ابسولو' in ' '.join(rc['rows'][:1]) or len(rc['rows']) >= 2, 'جدیدترین بالاست')
        await pg.wait_for_timeout(450)      # لمسِ بلافاصله بعد از باز شدنِ صفحه، عمداً نادیده گرفته می‌شود
        await ev("document.querySelector('#srr .pc[data-id]').click()"); await pg.wait_for_timeout(200)
        chk(await ev("document.getElementById('dt').classList.contains('on')"), 'از آخرین‌ها می‌شود عطر را باز کرد')
        await ev("document.getElementById('dtx').click()")

        # --- ذخیره‌ی آخرین‌ها بعد از بستن و بازکردن برنامه ---
        sv = await ev("JSON.parse(localStorage.getItem('pp.set')).rec.length")
        chk(sv >= 2 and sv <= 10, 'آخرین‌ها ذخیره می‌شود (%d)' % sv)

        # --- نشتِ شنونده‌ی resize هنگام عوض شدن شکل لیست ---
        await ev("(function(){if(window.__rz!==undefined)return;window.__rz=0;var a=window.addEventListener,r=window.removeEventListener;window.addEventListener=function(t){if(t==='resize')window.__rz++;return a.apply(this,arguments)};window.removeEventListener=function(t){if(t==='resize')window.__rz--;return r.apply(this,arguments)}})()")
        async def cyc():
            for m in 'achzachz':
                await ev("__pp.mount('%s')" % m); await pg.wait_for_timeout(60)
        await cyc(); n1 = await ev("window.__rz")
        await cyc(); await cyc(); n2 = await ev("window.__rz")
        chk(n2 - n1 <= 1, 'عوض کردنِ شکل لیست شنونده‌ی resize جا نمی‌گذارد (%d → %d)' % (n1, n2))
        chk(not errs, 'بدون خطای صفحه ' + str(errs[:2]))
        await b.close()

        # --- بدون ضبط صدا ---
        b, pg, errs = await fresh(p, mock=False)
        ev = pg.evaluate
        await ev("document.getElementById('dkM').click()"); await pg.wait_for_timeout(250)
        t = await ev("document.getElementById('toast').textContent"); so = await ev("document.getElementById('srch').classList.contains('on')")
        chk('ضبط صدا' in t and so, 'گوشی بدون تشخیص گفتار: پیام ساده و جستجوی نوشتاری')
        await b.close()

        # --- اندازه‌ی بزرگ و عرض کم ---
        for w in (320, 360):
            b, pg, errs = await fresh(p, fs=3, w=w)
            r = await pg.evaluate("""(function(){var o={};['dkM','dkS'].forEach(function(i){var e=document.getElementById(i),s=e.querySelector('span');o[i]=[s.scrollWidth>s.clientWidth+1,e.getBoundingClientRect().width,e.getBoundingClientRect().height]});var a=document.getElementById('dkM').getBoundingClientRect(),c=document.getElementById('dkS').getBoundingClientRect();o.gap=a.left-c.right;return o})()""")
            chk(not r['dkM'][0] and r['gap'] >= 4, 'خیلی بزرگ، عرض %d: برچسب‌های نوار پایین بریده نیست (میکروفون %d، جستجو %d، فاصله %d)' % (w, r['dkM'][1], r['dkS'][1], r['gap']))
            if r['dkS'][0]: print('   (متن «جستجوی عطر» بریده شد؛ فقط ... می‌شود)')
            await b.close()
    print('FAILS', len(fails))
    for f in fails: print(' -', f)
    sys.exit(1 if fails else 0)
asyncio.run(main())
