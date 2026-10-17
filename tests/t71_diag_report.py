# «گزارش کامل برای سازنده»: از خودِ سایت می‌پرسد، حافظه را می‌خواند، دلیلِ هر محصول را می‌نویسد، کپی می‌کند
import asyncio,sys,json
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
SD='<table><tr><td>عطر مردانه سایز</td><td>100 میل</td></tr><tr><td>جنسیت</td><td>مردانه</td></tr></table>'
def rec(i,name,stock,price,sd=SD,cat='Clinique'):
    return {'id':i,'name':name,'slug':'s%d'%i,'type':'simple','permalink':'https://liliome.com/shop/s%d/'%i,'short_description':sd,'description':'','is_in_stock':stock,'is_purchasable':stock,'is_on_backorder':False,
      'prices':{'price':str(price if stock else 0),'regular_price':str(price),'sale_price':str(price),'price_range':None,'currency_code':'IRT','currency_symbol':'تومان','currency_minor_unit':0},
      'price_html':'','images':[],'categories':[{'name':cat}],'attributes':[]}
RECS=[rec(9882,'عطر ادکلن کلینیک هپی مردانه | Clinique Happy',True,13440000),rec(185962,'عطر ادکلن کلینیک هپی یو میک می | Clinique Happy You',False,0),rec(777,'عطر ادکلن کلینیک بدون سایز | Clinique NoSize',True,9000000,'<p>بدون جدول</p>')]
MOCK="""
window.__PROBE=[];
window.__MODE=function(u){
  if(u.indexOf('/wc/store/v1/products?per_page=40&search=')<0) return null;
  window.__PROBE.push(u);
  var recs=%s;
  if(u.indexOf('stock_status=instock')>=0) recs=recs.filter(function(r){return r.is_in_stock});
  if(u.indexOf('liliome.com')<0) return {s:200,b:'[]'};
  return {s:200,b:JSON.stringify(recs)};
};
"""%json.dumps(RECS)
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=True,extra=MOCK)
        await pg.set_viewport_size({'width':360,'height':700})
        await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,120000); await pg.wait_for_timeout(800)
        ev=pg.evaluate
        await ev("(function(){var db=window.__pp.state.db,t=Date.now()/60000|0;db.it.liliome['9001']=['عطر ادکلن کلینیک قدیمی',0,0,0,t];db.it.liliome['9002']=['عطر ادکلن کلینیک خاموش 100 میل | Clinique Off',0,'zz',100,t];})()")
        await ev("document.getElementById('gear').click()"); await pg.wait_for_timeout(500)
        await ev("document.getElementById('sAdvBtn').click()"); await pg.wait_for_timeout(300)
        chk('button and input exist in advanced settings',await ev("!!document.getElementById('dgGo')&&!!document.getElementById('dgIn')"))
        await ev("document.getElementById('dgGo').click()"); await pg.wait_for_timeout(6000)
        t=await ev("document.getElementById('dgOut').value")
        chk('report is shown in a text box (also copied)',len(t)>500 and await ev("document.getElementById('dgOut').style.display")=='',len(t))
        chk('header has version and the sources',('گزارش تشخیص' in t) and 'liliome' in t and 'حافظه: کل=' in t)
        chk('stored Clinique entries are listed with a clear state',('عطر ادکلن کلینیک قدیمی' in t and 'REJECTED' in t) and ('out-of-stock(price0)' in t or 'priced-but-not-shown' in t),t[t.find('در حافظه‌ی برنامه'):][:500])
        chk('live probe asked the site with and without the stock filter',any('stock_status=instock' in u for u in await ev("window.__PROBE")) and any('stock_status' not in u for u in await ev("window.__PROBE")))
        chk('probe shows the raw record: id, stock, price, size source',('#9882' in t) and 'stock=true' in t and 'price=13440000' in t and 'spec=100' in t and 'in-instock-list=true' in t,t[t.find('#9882'):][:400])
        chk('probe shows what the app pipeline made of it (size added, accepted)',('برنامه: st=0 price=13440000' in t) and '100 میل' in t and 'نام قابل‌قبول' in t)
        chk('out-of-stock product is shown as such (in-instock-list=false, st=1)','#185962' in t and 'in-instock-list=false' in t and 'برنامه: st=1' in t)
        chk('a product without any size is explained',('#777' in t) and 'REJECT' in t and 'اندازه' in t,t[t.find('#777'):][:400])
        chk('not-in-memory is stated plainly','در حافظه: خیر' in t)
        # با نام خاص
        await ev("document.getElementById('dgIn').value='کلینیک هپی';document.getElementById('dgGo').click()"); await pg.wait_for_timeout(6000)
        t2=await ev("document.getElementById('dgOut').value")
        chk('typed name is used for the memory search and the probe',('«کلینیک هپی»' in t2) and any('search=%DA%A9' in u for u in await ev("window.__PROBE")))
        chk('no page errors',not [e for e in errs if 'Failed to load' not in e],errs[:3])
        await b.close()
    print('\n%d pass, %d fail'%(len(OK),len(BAD)))
    if BAD: print('FAILED:',BAD); sys.exit(1)
asyncio.run(main())
