# خبرهای قدیمی‌تر با اسکرول: اول فقط صفحه‌ی اول؛ نزدیکِ ته که رسید خودکار می‌آید؛ تکراری نیست؛ پایان؛ خطا + دکمه؛ سقف؛ تازه‌سازی صفر می‌کند
import asyncio,sys,json,os
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from rep_common import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:240] if i!='' else ''))
def mock(total=35,endless=False):
    return """
window.__NEWSCALLS=[];window.__NEWSTOTAL=%d;window.__ENDLESS=%s;
window.__MODE=function(u){
  if(u.indexOf('/wp-json/wp/v2/posts')<0 && u.indexOf('/feed')<0) return null;
  window.__NEWSCALLS.push(u);
  if(window.__NEWSMODE==='fail') return {s:0,b:'offline'};
  if(u.indexOf('liliome.com/wp-json/wp/v2/posts')<0) return {s:404,b:'nf'};
  var m=/[&?]page=(\\d+)/.exec(u),pg=m?+m[1]:1,a=[],now=Date.now();
  if(!window.__ENDLESS&&(pg-1)*10>=window.__NEWSTOTAL) return {s:400,b:'{"code":"rest_post_invalid_page_number"}'};
  for(var i=(pg-1)*10;i<(window.__ENDLESS?pg*10:Math.min(window.__NEWSTOTAL,pg*10));i++)
    a.push({title:{rendered:'خبر عطر شماره '+(i+1)},link:'https://liliome.com/n/'+(i+1)+'/',date_gmt:new Date(now-(i+1)*6*3600e3).toISOString().slice(0,19),excerpt:{rendered:'<p>خلاصه '+(i+1)+'</p>'},content:{rendered:''},_embedded:{}});
  return {s:200,b:JSON.stringify(a)};
};
"""%(total,'true' if endless else 'false')
async def open_report(pg,wait=3000):
    await pg.evaluate("document.getElementById('nw').click()"); await pg.wait_for_timeout(wait)
CNT="document.querySelectorAll('#mkr .nwc').length"
SCR="(function(){var r=document.getElementById('mkr');r.scrollTop=r.scrollHeight;r.dispatchEvent(new Event('scroll'))})()"
async def main():
    async with async_playwright() as p:
        flat,mid0=await first_flat(p)
        seed=make_seed(flat)
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+mock())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        ev=pg.evaluate
        await open_report(pg)
        n0=await ev(CNT)
        calls=await ev("window.__NEWSCALLS.filter(function(u){return u.indexOf('liliome.com/wp-json')>=0})")
        chk('first screen: only the newest 6 articles; nothing older was fetched yet',n0==6 and not any('&page=' in u for u in calls),(n0,calls))
        chk('bottom note invites scrolling (not an error)','پایین' in await ev("document.getElementById('nfmore').innerText"),await ev("document.getElementById('nfmore').innerText"))
        # تا ته می‌رویم: ۴ تای مانده + صفحه‌ی ۲
        sc0=await ev("document.getElementById('mkr').scrollTop")
        await ev(SCR); await pg.wait_for_timeout(2500)
        n1=await ev(CNT); sc1=await ev("document.getElementById('mkr').scrollTop")
        chk('scrolling to the bottom brings 6 older articles',n1==12,n1)
        chk('the page does not jump: scroll position kept, new cards are added below',sc1>=sc0 and await ev("document.querySelectorAll('#mkr .nwc')[0].querySelector('.nft').innerText")=='خبر عطر شماره 1',(sc0,sc1))
        titles=await ev("[].map.call(document.querySelectorAll('#mkr .nwc .nft'),function(e){return e.innerText})")
        chk('older articles come in date order (7th card is article 7)',titles[6]=='خبر عطر شماره 7' and titles[11]=='خبر عطر شماره 12',titles[5:8])
        # ادامه تا پایان
        for i in range(10):
            await ev(SCR); await pg.wait_for_timeout(1800)
            if 'فعلاً نیست' in await ev("document.getElementById('nfmore').innerText"): break
        n2=await ev(CNT); titles=await ev("[].map.call(document.querySelectorAll('#mkr .nwc .nft'),function(e){return e.innerText})")
        chk('all 35 articles reached, none twice',n2==35 and len(set(titles))==35,(n2,len(set(titles))))
        chk('end of the feed says there are no more',await ev("document.getElementById('nfmore').innerText")=='خبرهای بیشتری فعلاً نیست')
        c2=await ev("window.__NEWSCALLS.length"); await ev(SCR); await pg.wait_for_timeout(1500)
        chk('after the end nothing more is requested',await ev("window.__NEWSCALLS.length")==c2)
        # تازه‌سازیِ خودکار (نه دکمه) وسطِ خواندن: کارت‌های قدیمی‌تر نمی‌پرند
        sc_before=await ev("document.getElementById('mkr').scrollTop")
        await ev("window.__pp.newsStale('open');0"); await pg.wait_for_timeout(4500)
        chk('automatic refresh while reading keeps the older cards and the scroll position',await ev(CNT)==35 and abs(await ev("document.getElementById('mkr').scrollTop")-sc_before)<5,(await ev(CNT),sc_before,await ev("document.getElementById('mkr').scrollTop")))
        # دکمه‌ی تازه‌سازی همه را برمی‌گرداند به ۶ تا
        await ev("document.querySelector('#mkr [data-act=news]').click()"); await pg.wait_for_timeout(4500)
        chk('refresh resets the feed to the newest 6 (older ones are fetched again by scrolling)',await ev(CNT)==6,await ev(CNT))
        chk('saved news stays small (older articles are not stored)',len(json.loads(await ev("localStorage.getItem('pp.news')"))['items'])<=30)
        chk('no page errors',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
        # ---------- اینترنت قطع هنگام اسکرول ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+mock())
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        ev=pg.evaluate; await open_report(pg)
        await ev("window.__NEWSMODE='fail'"); await ev(SCR); await pg.wait_for_timeout(2500); await ev(SCR); await pg.wait_for_timeout(2500)
        btn=await ev("(function(){var b=document.querySelector('#mkr [data-act=newsmore]');if(!b)return null;var r=b.getBoundingClientRect();return {h:r.height,t:b.innerText}})()")
        chk('offline: a clear retry button appears (and no endless retry loop)',btn is not None and btn['h']>=47 and 6<=await ev(CNT)<=10,btn)
        k=await ev("window.__NEWSCALLS.length"); await pg.wait_for_timeout(2500)
        chk('offline: no automatic retries while the button is shown',await ev("window.__NEWSCALLS.length")==k)
        await ev("window.__NEWSMODE=''"); await ev("document.querySelector('#mkr [data-act=newsmore]').click()"); await pg.wait_for_timeout(3000)
        chk('after the net is back, the button loads older articles',await ev(CNT)>=12 and await ev("document.querySelector('#mkr [data-act=newsmore]')")is None,await ev(CNT))
        await b.close()
        # ---------- سایتِ بی‌پایان: سقف ----------
        b,ctx,pg,errs=await new_page(p,360,780,'light',extra=pre_js(seed)+mock(0,True))
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1200)
        ev=pg.evaluate; await open_report(pg)
        for i in range(40):
            await ev(SCR); await pg.wait_for_timeout(900)
            if 'فعلاً نیست' in await ev("document.getElementById('nfmore').innerText"): break
        n=await ev(CNT)
        chk('endless site: feed stops growing at the cap (phone stays light)',n<=6+120 and 'فعلاً نیست' in await ev("document.getElementById('nfmore').innerText"),n)
        await b.close()
    print('\n%d pass, %d fail'%(len(OK),len(BAD)))
    if BAD: print('FAILED:',BAD); sys.exit(1)
asyncio.run(main())
