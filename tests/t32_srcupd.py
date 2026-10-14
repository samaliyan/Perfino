import asyncio,json,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i) if i!='' else ''))
MOCK="""
window.__u={checks:0,dl:0,inst:0,code:100,latest:150,log:[]};
(function(){var N=window.Native;
 N.appCode=function(){return window.__u.code};
 N.updCheck=function(){window.__u.checks++;setTimeout(function(){window.__updInfo(window.__u.latest)},50)};
 N.updDownload=function(){window.__u.dl++;var p=0;var iv=setInterval(function(){p+=20;if(p<100){window.__updProg(p)}else{clearInterval(iv);window.__updReady(window.__u.latest)}},500)};
 N.updInstall=function(){window.__u.inst++;return true};
})();
"""
SNAP="""(function(){var g=document.getElementById('updGo'),b=document.getElementById('updBox'),m=document.getElementById('sUpd');return {on:b.classList.contains('on'),dis:g.disabled,lab:g.textContent,tx:document.getElementById('updTx').textContent,mdis:m.disabled,mlab:m.textContent,w:document.getElementById('updPbi').style.width,pbv:getComputedStyle(document.getElementById('updPb')).display}})()"""
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra=MOCK)
        await pg.set_viewport_size({'width':360,'height':700})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000)
        await pg.wait_for_function("window.__u.checks>=1",timeout=15000)
        await pg.wait_for_function("document.getElementById('updGo').textContent.indexOf('٪')>0",timeout=8000)
        s=await pg.evaluate(SNAP); print(s)
        chk('asked at open: box visible while downloading',s['on'])
        chk('download button disabled + says downloading + percent',s['dis'] and 'دانلود' in s['lab'] and '٪' in s['lab'],s['lab'])
        chk('progress bar visible with width',s['pbv']=='block' and s['w'] not in ('','0%'),s['w'])
        await pg.screenshot(path='/tmp/w/upd_dl.png')
        await pg.evaluate("document.getElementById('updGo').click()")
        chk('click while downloading does nothing',await pg.evaluate("window.__u.inst")==0)
        await pg.evaluate("document.getElementById('gear').click()"); await pg.wait_for_timeout(600)
        s=await pg.evaluate(SNAP)
        chk('settings update button disabled while downloading',s['mdis'] and 'دانلود' in s['mlab'],s['mlab'])
        await pg.wait_for_function("!document.getElementById('updGo').disabled",timeout=10000)
        s=await pg.evaluate(SNAP); print(s)
        chk('ready: button enabled, asks install',(not s['dis']) and 'نصب شود' in s['lab'] and s['pbv']=='none')
        chk('settings button enabled again',not s['mdis'])
        await pg.evaluate("document.getElementById('updGo').click()")
        s=await pg.evaluate(SNAP)
        chk('installing: disabled, says installing',s['dis'] and 'در حال نصب' in s['lab'])
        # سایت‌ها
        names=await pg.evaluate("[].map.call(document.querySelectorAll('#sSrc .sw'),function(x){return x.dataset.s})")
        chk('one switch per source',len(names)==4,names)
        await pg.evaluate("document.getElementById('updLater').click()")
        el=await pg.query_selector('#sSrc'); await el.scroll_into_view_if_needed(); await el.screenshot(path='/tmp/w/src_sw.png')
        await pg.evaluate("document.querySelector('#sSrc .sw[data-s=\"safir\"]').click()"); await pg.wait_for_timeout(600)
        st=await pg.evaluate("JSON.parse(localStorage.getItem('pp.set')).soff")
        chk('safir off saved',st and st.get('safir')==1,st)
        fl=await pg.evaluate("window.__pp.flat.some(function(g){return g.sizes.some(function(z){return z.srcs.some(function(r){return r.s==='safir'})})})")
        chk('safir prices not in list when off',not fl)
        t0=await pg.evaluate("window.__pp.state.db.t.safir")
        await pg.evaluate("window.__pp.refresh(true)"); await pg.wait_for_function("!window.__pp.state.busy",timeout=120000)
        t1=await pg.evaluate("window.__pp.state.db.t.safir")
        chk('refresh skipped safir (stamp unchanged)',t0==t1,[t0,t1])
        rep=await pg.evaluate("document.getElementById('sRep').innerText")
        chk('report: safir shown as off, not as problem','خاموش' in rep and 'safir' not in rep)
        # حداقل یکی
        for sid in names:
            await pg.evaluate("(function(i){var e=document.querySelector('#sSrc .sw[data-s=\"'+i+'\"]');e&&e.click()})('%s')"%sid)
        on=await pg.evaluate("[].filter.call(document.querySelectorAll('#sSrc .sw'),function(x){return x.classList.contains('on')}).length")
        chk('at least one source stays on',on>=1,on)
        await pg.evaluate("document.querySelector('#sSrc .sw[data-s=\"safir\"]').click()") if False else None
        chk('no js errors',not errs,errs)
        await b.close()
        print(len(OK),'pass',len(BAD),'fail')
asyncio.run(main())
