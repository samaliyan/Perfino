# ابزارِ مشترکِ تست‌های «خبر و گزارش»: تاریخچه‌ی ساختگی + خبرِ ساختگی (وردپرس و RSS)
import json,time,sys
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
D=86400000
def iso(ms): return time.strftime('%Y-%m-%dT%H:%M:%S',time.gmtime(ms/1000))
def rfc(ms): return time.strftime('%a, %d %b %Y %H:%M:%S +0000',time.gmtime(ms/1000))
def news_mock_js(mode='ok'):
    now=int(time.time()*1000)
    wp=[{'title':{'rendered':'راهنمای انتخاب عطر زمستانی'},'link':'https://liliome.com/blog/winter-perfume/','date_gmt':iso(now-1*D),'excerpt':{'rendered':'<p>برای فصل سرد چه رایحه‌هایی مناسب‌اند؟ از چوبی و ادویه‌ای تا شیرین.</p>'},'_embedded':{'wp:featuredmedia':[{'source_url':'https://liliome.com/wp-content/uploads/a.jpg','media_details':{'sizes':{'medium':{'source_url':'https://liliome.com/wp-content/uploads/a-300.jpg'}}}}]}},
        {'title':{'rendered':'تفاوت ادو پرفیوم و ادو تویلت'},'link':'https://liliome.com/blog/edp-edt/','date_gmt':iso(now-5*D),'excerpt':{'rendered':'<p>غلظت اسانس چه فرقی در ماندگاری دارد.</p>'},'_embedded':{}},
        {'title':{'rendered':'نگهداری درست ادکلن'},'link':'https://liliome.com/blog/keep/','date_gmt':iso(now-12*D),'excerpt':{'rendered':'<p>دور از نور و گرما.</p>'},'_embedded':{}},
        {'title':{'rendered':'عطر مناسب هدیه'},'link':'https://liliome.com/blog/gift/','date_gmt':iso(now-20*D),'excerpt':{'rendered':'<p>چند پیشنهاد.</p>'},'_embedded':{}}]
    rss1='<?xml version="1.0"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>x</title>'+\
        '<item><title>عطرهای تازه رسیده به سفیر</title><link>https://www.safirstores.com/blog/new-arrivals/</link><pubDate>%s</pubDate><description>معرفی چند عطر جدید</description><content:encoded><![CDATA[<img src="https://www.safirstores.com/wp-content/uploads/b.jpg"><p>متن</p>]]></content:encoded></item>'%rfc(now-2*D)+\
        '<item><title>تخفیف ویژه</title><link>https://www.safirstores.com/blog/sale/</link><pubDate>%s</pubDate><description>تخفیف ادکلن</description></item></channel></rss>'%rfc(now-8*D)
    rss4='<?xml version="1.0"?><rss version="2.0"><channel><title>mag</title>'+\
        '<item><title>بهترین ادکلن‌های مردانه ۱۴۰۵</title><link>https://www.digikala.com/mag/best-men-perfume/</link><pubDate>%s</pubDate><description>فهرست پرفروش‌ها</description></item>'%rfc(now-3*D)+\
        '<item><title>بهترین گوشی‌های میان‌رده</title><link>https://www.digikala.com/mag/phones/</link><pubDate>%s</pubDate><description>موبایل</description></item></channel></rss>'%rfc(now-1*D)
    return """
window.__NEWSCALLS=[];
window.__MODE=function(u){
  var mode=window.__NEWSMODE||%s;
  if(u.indexOf('/wp-json/wp/v2/posts')<0 && u.indexOf('/feed')<0) return null;
  window.__NEWSCALLS.push(u);
  if(mode==='fail') return {s:500,b:'err'};
  if(mode==='partial' && u.indexOf('safirstores.com')>=0) return {s:500,b:'err'};
  if(u.indexOf('liliome.com/wp-json/wp/v2/posts')>=0) return {s:200,b:%s};
  if(u.indexOf('safirstores.com/feed')>=0) return {s:200,b:%s};
  if(u.indexOf('hilandbeauty.com/wp-json/wp/v2/posts')>=0) return {s:200,b:'[]'};
  if(u.indexOf('digikala.com/mag/feed')>=0) return {s:200,b:%s};
  return {s:404,b:'nf'};
};
"""%(json.dumps(mode),json.dumps(json.dumps(wp)),json.dumps(rss1),json.dumps(rss4))
async def first_flat(p,n=8):
    b,ctx,pg,errs=await new_page(p)
    await pg.goto('file://'+ROOT+'/index.html'); await wait_ready(pg,180000); await pg.wait_for_timeout(1500)
    flat=await pg.evaluate("window.__pp.flat.map(function(g){return {id:g.id,ml:g.sizes[0].ml,price:g.sizes[0].price,n:g.sizes[0].srcs.length,all:g.sizes.map(function(z){return [z.ml,z.price,z.srcs.length]})}})")
    mid0=await pg.evaluate("(function(){var id=window.__pp.flat[0].id,t=window.__pp.tree;for(var i=0;i<t.length;i++)for(var j=0;j<t[i].models.length;j++)for(var k=0;k<t[i].models[j].variants.length;k++)if(t[i].models[j].variants[k].id===id)return t[i].models[j].id;return ''})()")
    await b.close()
    return flat,mid0
def make_seed(flat):
    now=int(time.time()*1000); d={}
    def key(g): return '%s|%d'%(g['id'],g['ml'])
    for g in flat:                      # همه‌ی عطرها از ده روز پیش با قیمتِ ثابت در تاریخچه‌اند (مثل برنامه‌ی واقعی)
        for ml,pr,nn in g['all']:
            d['%s|%d'%(g['id'],ml)]={'n':'x','l':'','f':now-10*D,'s':now,'c':nn,'cm':nn,'ct':now,'p':[[now-10*D,pr]]}
    g=flat[0]; d[key(g)]={'n':'الف','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'p':[[now-9*D,int(g['price']*0.7)],[now-1*D,g['price']]]}
    g=flat[1]; d[key(g)]={'n':'ب','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'p':[[now-9*D,int(g['price']*1.5)],[now-1*D,g['price']]]}
    g=flat[3]; d[key(g)]={'n':'ج','l':'','f':now-9*D,'s':now,'c':g['n'],'cm':g['n']+2,'ct':now,'p':[[now-9*D,g['price']]]}
    g=flat[4]; d[key(g)]={'n':'د','l':'','f':now-1*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'r':now-2*D,'p':[[now-1*D,g['price']]]}
    g=flat[5]; d[key(g)]={'n':'ه','l':'','f':now-2*D,'s':now,'c':g['n'],'cm':g['n'],'ct':now,'p':[[now-2*D,g['price']]]}
    d['zzz|100']={'n':'عطر ناموجود آزمایشی','l':'مردانه','f':now-9*D,'s':now-3*D,'c':1,'cm':1,'ct':now-3*D,'o':now-2*D,'p':[[now-9*D,2500000]]}
    return {'v':1,'t0':now-10*D,'t':now-3600000,'as':'','d':d}
def pre_js(seed,fs=0,extra=''):
    return "if(!sessionStorage.getItem('mk')){sessionStorage.setItem('mk','1');localStorage.setItem('pp.hist',%s);%s}"%(json.dumps(json.dumps(seed)),"var s=JSON.parse(localStorage.getItem('pp.set')||'{}');s.fs=%d;localStorage.setItem('pp.set',JSON.stringify(s));"%fs)+extra
