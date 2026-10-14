import asyncio,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra="window.__sv=[];(function(){var N=window.Native;N.saveText=function(n,t){window.__sv.push([n,t.length]);return 'Downloads/'+n};})();")
        await pg.set_viewport_size({'width':360,'height':700})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        r=await pg.evaluate("(function(){var b=document.getElementById('sSamp');var q=b.getBoundingClientRect();return {h:q.height,w:q.width,vis:q.width>0}})()")
        chk('button visible & >=44px',r['vis'] and r['h']>=44,r)
        await pg.evaluate("document.getElementById('sSamp').click()"); await pg.wait_for_timeout(300)
        t=await pg.evaluate("window.__samp||''")
        chk('text has 3 sections','مشکوک' in t and 'ردشده' in t and 'بقیه' in t,t[:80])
        lines=[l for l in t.split('\n') if ' | ' in l]
        chk('has many lines with 4 fields',len(lines)>100 and all(l.count(' | ')==3 for l in lines[1:]),len(lines))
        sv=await pg.evaluate('window.__sv')
        chk('saveText called once with file name .txt',len(sv)==1 and sv[0][0].startswith('perfume-titles-') and sv[0][0].endswith('.txt') and sv[0][1]==len(t),sv)
        chk('ALL titles included (no cap)',len(lines)>1000,len(lines))
        lab=await pg.evaluate("document.getElementById('sSamp').textContent")
        chk('label confirms copy','ذخیره شد' in lab,lab)
        chk('no js errors',not errs,errs)
        await b.close()
    print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
