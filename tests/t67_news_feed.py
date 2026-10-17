# «خبرها» به شکل فیدِ اسکرولی (مثل اینستاگرام): کارتِ بزرگ، عکس، تیتر، دو خط خلاصه؛ «جدید»؛ بطریِ جایگزین؛ ذخیره‌ی انباشته؛ هر ۳ ساعت تازه شدن
import asyncio,sys,json,os
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from rep_common import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:240] if i!='' else ''))
H=3600000
OVF="""(function(){var r=document.getElementById('mkr'),bad=[];[].forEach.call(r.querySelectorAll('.nwc,.nwc *,.nfst,.nfend,.mkmore'),function(e){var b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1))bad.push(e.className+':'+Math.round(b.left)+'-'+Math.round(b.right))});
[].forEach.call(r.querySelectorAll('.nft,.nfx,.nfg,.nfs b'),function(e){if(e.scrollWidth>e.clientWidth+1)bad.push('clip:'+e.className+':'+e.scrollWidth+'>'+e.clientWidth)});
return {bad:bad.slice(0,5),sw:r.scrollWidth,cw:r.clientWidth}})()"""
def seed_news(items,t_ms,seen=None,notes=None):
    js="if(!sessionStorage.getItem('nsd')){sessionStorage.setItem('nsd','1');localStorage.setItem('pp.news',%s);%s}"%(json.dumps(json.dumps({'t':t_ms,'notes':notes or {},'items':items})),("localStorage.setItem('pp.newsSeen','%d');"%seen) if seen else '')
    return js
def item(s,t,d,u,x='',img=''):
    return {'s':s,'sn':{'liliome':'لیلیوم','hiland':'هایلند','safir':'سفیر','digikala':'مجله‌ی دیجی‌کالا'}[s],'t':t,'d':d,'u':u,'x':x,'img':img}
async def open_report(pg,wait=2500):
    await pg.evaluate("document.getElementById('nw').click()"); await pg.wait_for_timeout(wait)
async def main():
    async with async_playwright() as p:
        flat,mid0=await first_flat(p)
        seed=make_seed(flat); now=int(time.time()*1000)
        # ---------- ۱) ساختارِ کارت‌ها ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        ev=pg.evaluate
        await open_report(pg)
        cards=await ev("""[].map.call(document.querySelectorAll('#mkr .nwc'),function(c){var i=c.querySelector('.nfi'),im=c.querySelector('img.nimg'),t=c.querySelector('.nft'),x=c.querySelector('.nfx'),bi=i.getBoundingClientRect();
          return {tag:c.tagName,u:c.dataset.u,ab:c.querySelector('.nfa').innerText,nm:c.querySelector('.nfs b').innerText,ago:(c.querySelector('.nfs small')||{innerText:''}).innerText,
          ph:i.classList.contains('ph'),ratio:bi.width/bi.height,lazy:im?im.getAttribute('loading'):null,fs:parseFloat(getComputedStyle(t).fontSize),title:t.innerText,
          xh:x?x.getBoundingClientRect().height:0,xlh:x?parseFloat(getComputedStyle(x).lineHeight):0,xt:x?x.innerText:'',cta:c.querySelector('.nfg').innerText,w:c.getBoundingClientRect().width,isnew:!!c.querySelector('.nfnew')}})""")
        chk('feed: 11 cards (liliome 6, hiland 2, safir 2, mag 1; the phone article is filtered)',len(cards)==11,len(cards))
        chk('every card is one button (whole card is tappable)',all(c['tag']=='BUTTON' for c in cards))
        chk('card header: two-letter site mark + site name + time',cards[0]['ab']=='لی' and cards[0]['nm']=='لیلیوم' and cards[0]['ago']=='۳ ساعت پیش',cards[0])
        chk('site marks are letters, not a lone "ه" that looks like the digit 5',all(len(c['ab'])>=2 for c in cards),[c['ab'] for c in cards])
        pics=[c for c in cards if not c['ph']]
        chk('photo frame is wide (about 16:10) and as wide as the card',all(1.5<c['ratio']<1.7 for c in pics) and len(pics)>=4,[round(c['ratio'],2) for c in pics])
        chk('cards without any image get a bottle frame (not an empty box)',all(c['ratio']>2.0 for c in cards if c['ph']) and sum(1 for c in cards if c['ph'])>=4,[c['ph'] for c in cards])
        chk('photos load lazily (30 cards must not download at once)',all(c['lazy']=='lazy' for c in pics))
        chk('title is big (18px+) and the card shows a clear "read" line',all(c['fs']>=18 and 'خواندن' in c['cta'] for c in cards),[c['fs'] for c in cards][:3])
        chk('excerpt is at most two lines',all(c['xh']<=c['xlh']*2+2 for c in cards if c['xh']),[(round(c['xh']),round(c['xlh'])) for c in cards if c['xh']][:4])
        chk('excerpt trailing […] removed; excerpt from the body when the site gave none',all('[' not in c['xt'] and '…]' not in c['xt'] for c in cards) and any(c['xt'].startswith('اگر دنبال عطری') for c in cards),[c['xt'][:30] for c in cards][:4])
        chk('urls are only the shops',all(c['u'].startswith(('https://liliome.com','https://hilandbeauty.com','https://www.safirstores.com','https://www.digikala.com')) for c in cards))
        chk('an old article the site still lists among its latest six is kept, at the bottom of that site (not silently dropped)',any('خبر خیلی قدیمی' in c['title'] for c in cards) and cards[-1]['title'].find('خبر خیلی قدیمی')>=0,[c['title'][:12] for c in cards][-2:])
        chk('article about phones from the magazine is filtered',not any('گوشی' in c['title'] for c in cards))
        chk('first run: nothing is marked "جدید" (nothing was seen before to compare with)',not any(c['isnew'] for c in cards))
        st=json.loads(await ev("localStorage.getItem('pp.news')"))
        ds=[x['d'] for x in st['items']]
        chk('saved list is newest first',ds==sorted(ds,reverse=True) and len(ds)==11,ds[:3])
        # لمس واقعی روی تیتر یک کارتِ داخلِ صفحه
        await ev("window.__lastOpen='';document.querySelectorAll('#mkr .nwc')[2].scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
        bb=await ev("(function(){var r=document.querySelectorAll('#mkr .nwc')[2].querySelector('.nft').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
        await pg.touchscreen.tap(bb[0],bb[1]); await pg.wait_for_timeout(300)
        chk('a real finger tap on the title opens that article',await ev("window.__lastOpen")==cards[2]['u'],await ev("window.__lastOpen"))
        chk('report stays open after opening an article',await ev("document.getElementById('mk').classList.contains('on')"))
        # تا ته اسکرول
        await ev("var r=document.getElementById('mkr');r.scrollTop=r.scrollHeight"); await pg.wait_for_timeout(500)
        end=await ev("(function(){var e=document.querySelector('#mkr .nfend'),b=document.querySelector('#mkr [data-act=news]');var er=e.getBoundingClientRect(),br=b.getBoundingClientRect();return {end:er.bottom<=innerHeight+1&&er.top>=0,btnVisible:br.bottom<=innerHeight+1&&br.top>=0,btnH:br.height,enabled:!b.disabled}})()")
        chk('at the end of the feed: end note and a big refresh button (48px+) are reachable',end['end'] and end['btnVisible'] and end['btnH']>=47 and end['enabled'],end)
        # عکسِ یک کارت خراب شد → فقط همان کارت بطری می‌گیرد
        await ev("document.getElementById('mkr').scrollTop=0"); await pg.wait_for_timeout(200)
        n_img=await ev("document.querySelectorAll('#mkr .nwc img.nimg').length")
        await ev("document.querySelector('#mkr .nwc img.nimg').dispatchEvent(new Event('error'))"); await pg.wait_for_timeout(200)
        chk('one broken photo turns into a bottle frame; the others stay',await ev("document.querySelectorAll('#mkr .nwc img.nimg').length")==n_img-1 and await ev("document.querySelector('#mkr .nwc .nfi').classList.contains('ph') && !!document.querySelector('#mkr .nwc .nfi svg')"))
        # تب‌ها: رفت و برگشت، تکراری نشدن
        await ev("document.querySelector('#mkt2 [data-t=chg]').click()"); await pg.wait_for_timeout(300)
        await ev("document.querySelector('#mkt2 [data-t=news]').click()"); await pg.wait_for_timeout(500)
        chk('going to another tab and back: still 11 cards, no duplicates',await ev("document.querySelectorAll('#mkr .nwc').length")==11)
        chk('no page errors (structure)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- ۲) اندازه‌ی صفحه و فونت: بیرون‌زدگی، بریدگی، شروعِ فید ----------
        for (w,th,fs) in [(320,'dark',3),(320,'light',0),(360,'light',2),(360,'dark',3),(412,'dark',1)]:
            b,ctx,pg,errs=await new_page(p,w,780,th,extra=pre_js(seed,fs)+rich_news_mock_js())
            await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
            ev=pg.evaluate
            await open_report(pg)
            tag='%dpx %s fs%d'%(w,th,fs)
            o=await ev(OVF); chk('%s: nothing outside the screen or clipped sideways (top of feed)'%tag,not o['bad'] and o['sw']<=o['cw']+1,o)
            top=await ev("document.querySelector('#mkr .nwc').getBoundingClientRect().top")
            chk('%s: the first news card starts in the upper half (no big blocks above the feed)'%tag,top<390,round(top))
            for y in (900,1800,2700):
                await ev("document.getElementById('mkr').scrollTop=%d"%y); await pg.wait_for_timeout(250)
                o=await ev(OVF)
                if o['bad'] or o['sw']>o['cw']+1: break
            chk('%s: nothing outside the screen after scrolling down the feed'%tag,not o['bad'] and o['sw']<=o['cw']+1,o)
            await pg.screenshot(path='/tmp/w/shots3/t67_%d_%s_fs%d.png'%(w,th,fs)) if os.path.isdir('/tmp/w/shots3') else None
            chk('%s: no page errors'%tag,not [e for e in errs if 'Failed to load' not in e],errs[:3])
            await b.close()
        # ---------- ۳) عکس‌ها همه خراب: همه‌ی کارت‌ها قابِ بطری می‌گیرند ----------
        os.environ['NOIMG']='1'
        b,ctx,pg,errs=await new_page(p,360,780,'dark',extra=pre_js(seed)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        await open_report(pg,3500)
        os.environ.pop('NOIMG',None)
        chk('all photos fail: every card keeps a full frame with a bottle (no hole)',await ev("[].every.call(document.querySelectorAll('#mkr .nwc .nfi'),function(i){return i.classList.contains('ph')&&!!i.querySelector('svg')&&i.getBoundingClientRect().height>60})") and await ev("document.querySelectorAll('#mkr .nwc').length")==11)
        o=await ev(OVF); chk('all photos fail: nothing outside the screen',not o['bad'] and o['sw']<=o['cw']+1,o)
        await b.close()
        # ---------- ۴) «جدید»: خبری که از آخرین باز کردن تازه رسیده ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+seed_news([],0,seen=now-12*H)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        await open_report(pg)
        newt=await ev("[].map.call(document.querySelectorAll('#mkr .nwc'),function(c){return [c.querySelector('.nft').innerText,!!c.querySelector('.nfnew')]})")
        isnew=[t for t,n in newt if n]
        chk('"جدید" only on articles newer than the last time the report was seen (3h, 7h, 9h; not 26h+)',len(isnew)==3 and any('ساواژ' in t for t in isnew) and not any('زمستان' in t for t in isnew),isnew)
        chk('the "جدید" badge is readable (text, not only a colour)',await ev("document.querySelector('#mkr .nfnew').innerText")=='جدید')
        await ev("window.__back()"); await pg.wait_for_timeout(300)
        await open_report(pg,800)
        chk('reopened: everything was seen, no badges',await ev("document.querySelectorAll('#mkr .nfnew').length")==0)
        await b.close()
        # ---------- ۵) انباشته شدنِ خبرها (نپریدن) و سقف‌ها ----------
        old=[item('liliome','قدیمیِ ذخیره‌شده %d'%i,now-(5+i)*86400000,'https://liliome.com/old%d/'%i,'x') for i in range(10)]
        old+=[item('hiland','هایلندِ ذخیره‌شده %d'%i,now-(5+i)*86400000-1000,'https://hilandbeauty.com/old%d/'%i,'x') for i in range(10)]
        old+=[item('safir','سفیرِ ذخیره‌شده %d'%i,now-(5+i)*86400000-2000,'https://www.safirstores.com/old%d/'%i,'x') for i in range(8)]
        old+=[item('liliome','خیلی قدیمی',now-61*86400000,'https://liliome.com/ancient-saved/','x'),item('safir','بی‌تاریخ',0,'https://www.safirstores.com/nodate/','x')]
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+seed_news(old,now-5*H,seen=now)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        await open_report(pg,3000)       # ذخیره‌ی ۵ ساعت پیش کهنه است: باز شدن دوباره می‌گیرد
        st=json.loads(await ev("localStorage.getItem('pp.news')")); its=st['items']
        per={}
        for x in its: per[x['s']]=per.get(x['s'],0)+1
        chk('stale (5h): opening the report fetched again',await ev("window.__NEWSCALLS.length")>=4,await ev("window.__NEWSCALLS.length"))
        chk('old articles are kept next to the new ones (feed does not shrink)',any('قدیمیِ ذخیره‌شده' in x['t'] for x in its) and any('ساواژ' in x['t'] for x in its),[x['t'][:14] for x in its][:6])
        chk('per-site cap 10 and total cap 30',max(per.values())<=10 and len(its)<=30,per)
        chk('saved articles older than 60 days are dropped; an undated saved article of a working site is dropped',not any(x['t']=='خیلی قدیمی' or x['t']=='بی‌تاریخ' for x in its))
        ds=[x['d'] for x in its]; chk('merged list is newest first',ds==sorted(ds,reverse=True))
        us=[x['u'] for x in its]; chk('no duplicate articles',len(us)==len(set(us)))
        chk('the screen shows the same count as the saved list',await ev("document.querySelectorAll('#mkr .nwc').length")==len(its),[len(its)])
        # نیامدنِ سایتی: خبرهای قبلی‌اش می‌ماند + یک خبرِ تازه بالا می‌نشیند
        await ev("""window.__NEWSCALLS=[];window.__MODE=function(u){if(u.indexOf('/wp-json/wp/v2/posts')<0&&u.indexOf('/feed')<0)return null;window.__NEWSCALLS.push(u);
          if(u.indexOf('liliome.com/wp-json')>=0)return {s:200,b:JSON.stringify([{title:{rendered:'خبرِ بسیار تازه'},link:'https://liliome.com/brand-new/',date_gmt:new Date(Date.now()-60000).toISOString().slice(0,19),excerpt:{rendered:'<p>x</p>'},content:{rendered:''},_embedded:{}}])};
          return {s:500,b:'err'};};0""")
        before=len(its)
        await ev("document.querySelector('#mkr [data-act=news]').click()"); await pg.wait_for_timeout(4500)
        st=json.loads(await ev("localStorage.getItem('pp.news')")); its2=st['items']
        chk('refresh: the new article is first; the old ones (also of failing sites) stay',its2[0]['t']=='خبرِ بسیار تازه' and len(its2)>=min(30,before+1)-0 and any(x['s']=='safir' for x in its2),[x['t'][:12] for x in its2][:3])
        chk('refresh: first card on screen is the new article',await ev("document.querySelector('#mkr .nwc .nft').innerText")=='خبرِ بسیار تازه')
        chk('no page errors (accumulate)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- ۶) هر چند وقت یک بار تازه می‌شود ----------
        # (الف) تازه (۲ ساعت): با باز کردن گزارش دوباره نمی‌گیرد
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+seed_news([item('liliome','ذخیره‌شده',now-2*H,'https://liliome.com/s1/','x')],now-2*H,seen=now)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        await open_report(pg,1500)
        chk('2 hours old: not fetched when the report opens (every 3 hours)',await ev("window.__NEWSCALLS.length")==0 and await ev("document.querySelectorAll('#mkr .nwc').length")==1)
        chk('status line shows how old and "هر ۳ ساعت"',await ev("document.querySelector('#mkr .nfst').innerText")=='بروزرسانی: ۲ ساعت پیش (هر ۳ ساعت خودکار)',await ev("document.querySelector('#mkr .nfst').innerText"))
        await b.close()
        # (ب) کهنه (۴ ساعت) و گزارش بسته: برنامه‌ی باز خودش در پس‌زمینه می‌گیرد
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+seed_news([item('liliome','ذخیره‌شده',now-8*H,'https://liliome.com/s1/','x')],now-4*H,seen=now-6*H)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000)
        ev=pg.evaluate
        chk('4 hours old, report never opened: the red dot is not lit before any new article is known',not await ev("document.getElementById('nw').classList.contains('nu')"))
        await pg.wait_for_timeout(40000)
        chk('4 hours old: the open app fetches by itself in the background (no tap needed)',await ev("window.__NEWSCALLS.length")>=4,await ev("window.__NEWSCALLS.length"))
        chk('background fetch lights the red dot for the new articles',await ev("document.getElementById('nw').classList.contains('nu')"))
        await b.close()
        # (ج) در حال گرفتن: اسکلت، دکمه‌ی غیرفعال؛ بعد کارت‌ها
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        await ev("window.__DELAY=2500")
        await ev("document.getElementById('nw').click()"); await pg.wait_for_timeout(1200)
        chk('while loading (nothing saved): placeholder cards, spinner line and a disabled button',await ev("document.querySelectorAll('#mkr .nfsk').length")==2 and await ev("!!document.querySelector('#mkr .nfst .spn')") and await ev("(function(){var b=document.querySelector('#mkr [data-act=news]');return b.disabled&&b.innerText.indexOf('در حال')>=0})()"))
        await pg.screenshot(path='/tmp/w/shots3/t67_loading.png') if os.path.isdir('/tmp/w/shots3') else None
        await pg.wait_for_timeout(9000)
        chk('after loading: placeholders gone, cards shown, button enabled again',await ev("document.querySelectorAll('#mkr .nfsk').length")==0 and await ev("document.querySelectorAll('#mkr .nwc').length")>=8 and await ev("!document.querySelector('#mkr [data-act=news]').disabled"))
        await ev("window.__DELAY=2500;document.querySelector('#mkr [data-act=news]').click()"); await pg.wait_for_timeout(700)
        chk('refresh with cards already shown: cards stay while loading, button disabled',await ev("document.querySelectorAll('#mkr .nwc').length")>=8 and await ev("document.querySelector('#mkr [data-act=news]').disabled"))
        await pg.wait_for_timeout(9000)
        chk('no page errors (timing)',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- ۷) شمارنده‌ی تبِ «قیمت‌ها»: با دیدن محو می‌شود، فقط تغییرِ تازه دوباره عدد می‌آورد ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+rich_news_mock_js())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1000)
        ev=pg.evaluate
        badge=lambda: ev("(document.querySelector('#mkt2 [data-t=chg] i')||{innerText:''}).innerText")
        await open_report(pg,2000)
        chk('unseen price changes: the tab counter shows how many (6 in the test history)',await badge()=='۶',await badge())
        await ev("document.querySelector('#mkt2 [data-t=chg]').click()"); await pg.wait_for_timeout(400)
        chk('opening the prices tab: the counter disappears at once',await badge()=='',await badge())
        await ev("document.querySelector('#mkt2 [data-t=news]').click()"); await pg.wait_for_timeout(400)
        chk('back on the news tab: the counter stays gone',await badge()=='')
        await ev("document.querySelector('#mkt2 [data-t=cmp]').click()"); await pg.wait_for_timeout(300)
        chk('compare tab: still gone',await badge()=='')
        await ev("window.__back()"); await pg.wait_for_timeout(300); await open_report(pg,600)
        chk('close and reopen the report: still gone',await badge()=='')
        await pg.reload(); await wait_ready(pg,180000); await pg.wait_for_timeout(800); await open_report(pg,1500)
        chk('after the app is restarted: still gone (remembered on the phone)',await badge()=='' and len(json.loads(await ev("localStorage.getItem('pp.chgSeen')")))==6,await ev("localStorage.getItem('pp.chgSeen')"))
        await ev("var a=JSON.parse(localStorage.getItem('pp.chgSeen'));a.shift();localStorage.setItem('pp.chgSeen',JSON.stringify(a));0")
        await pg.reload(); await wait_ready(pg,180000); await pg.wait_for_timeout(800); await open_report(pg,1500)
        chk('one change the user has not seen yet: the counter shows 1 (only the new one)',await badge()=='۱',await badge())
        await ev("document.querySelector('#mkt2 [data-t=chg]').click()"); await pg.wait_for_timeout(400)
        chk('seen again: gone, and the seen list is back to 6',await badge()=='' and len(json.loads(await ev("localStorage.getItem('pp.chgSeen')")))==6)
        await ev("localStorage.setItem('pp.chgSeen','{bad json')"); await pg.reload(); await wait_ready(pg,180000); await pg.wait_for_timeout(800); await open_report(pg,1500)
        chk('a corrupt seen list is harmless (counter shows all again, no error)',await badge()=='۶' and not [e for e in errs if 'Failed to load' not in e],errs[:2])
        await b.close()
    print('\n%d pass, %d fail'%(len(OK),len(BAD)))
    if BAD: print('FAILED:',BAD); sys.exit(1)
asyncio.run(main())
