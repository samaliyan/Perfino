import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra="window.__sv=[];(function(){var N=window.Native;N.saveText=function(n,t){window.__sv.push([n,t.length]);return 'Downloads/'+n};N.shareBackup=function(){window.__sh=(window.__sh||0)+1;return true};N.copy=function(){window.__cp=(window.__cp||0)+1};})();")
        await pg.set_viewport_size({'width':360,'height':700})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        await pg.evaluate("(function(){if(document.getElementById('sAdv').style.display==='none')document.getElementById('sAdvBtn').click()})()"); await pg.wait_for_timeout(300)
        r=await pg.evaluate("(function(){var b=document.getElementById('dgGo');var q=b.getBoundingClientRect();return {h:q.height,w:q.width,vis:q.width>0}})()")
        chk('one report button, visible & >=44px',r['vis'] and r['h']>=44 and not await pg.evaluate("!!document.getElementById('sSamp')||!!document.getElementById('sSend')"),r)
        await pg.evaluate("document.getElementById('dgGo').click()")
        await pg.wait_for_function("window.__sv.length>0",timeout=30000); await pg.wait_for_timeout(300)
        t=await pg.evaluate("window.__samp||''")
        chk('one file has the diagnosis and all titles','گزارش تشخیص' in t and 'مشکوک' in t and 'ردشده' in t and 'بقیه' in t,t[:80])
        lines=[l for l in t.split('=== همه‌ی عنوان‌ها ===')[-1].split('\n=====')[0].split('\n') if ' | ' in l]
        chk('title lines have 6 fields (shop, title, name, ml, price, group)',len(lines)>100 and all(l.count(' | ')==5 for l in lines[1:]),len(lines))
        sv=await pg.evaluate('window.__sv')
        chk('saveText called once with a perfino-report .txt file',len(sv)==1 and sv[0][0].startswith('perfino-report-') and sv[0][0].endswith('.txt') and sv[0][1]==len(t),sv)
        chk('ALL titles included (no cap)',len(lines)>1000,len(lines))
        chk('the send sheet opens right away (shareBackup once)',await pg.evaluate('window.__sh')==1)
        chk('nothing is put on the clipboard',await pg.evaluate('window.__cp||0')==0)
        chk('without a name, no live question to the sites','پرسش زنده' not in t)
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
