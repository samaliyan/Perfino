# دور ۱ نقد: موجودی و قیمت (Woo، دیجی‌کالا، HTML، JSON-LD، ارز، ۱۰ برابر)
import asyncio, json
from playwright.async_api import async_playwright
ROOT='/home/claude/PerfumePrice/app/src/main/assets/www/core.js'
ok=bad=0
def T(c,m,x=''):
    global ok,bad
    if c: ok+=1
    else: bad+=1; print('FAIL',m,x)
JS="""
async()=>{
 var R={};
 function net(map){return {get:async function(u){for(var k in map){if(u.indexOf(k)>=0)return map[k](u)}return {status:404,body:''}}}}
 var P=function(o){return Object.assign({price:'5000000',currency_code:'IRT',currency_minor_unit:0},o||{})};
 var W=[
  {id:1,name:'عطر دیور ساواج ادو تویلت 100 میل',is_in_stock:true,is_purchasable:true,prices:P(),categories:[{name:'عطر'}],images:[]},
  {id:2,name:'عطر دیور ساواج ادو پرفیوم 100 میل',is_in_stock:false,prices:P(),categories:[{name:'عطر'}],images:[]},
  {id:3,name:'عطر شنل بلو دو شنل ادو پرفیوم 100 میل',prices:P(),categories:[{name:'عطر'}],images:[]},
  {id:4,name:'عطر گوچی بلوم ادو پرفیوم 100 میل',is_in_stock:true,prices:P({currency_code:'USD'}),categories:[{name:'عطر'}],images:[]},
  {id:5,name:'عطر ورساچه اروس ادو تویلت 100 میل',is_in_stock:true,prices:P({price:'0'}),price_html:'<span>موجود نیست</span>',categories:[{name:'عطر'}],images:[]},
  {id:6,name:'عطر ورساچه اروس ادو پرفیوم 100 میل',is_in_stock:true,prices:P({price:'0'}),price_html:'<span>6,000,000 تومان</span>',categories:[{name:'عطر'}],images:[]}
 ];
 var w=await Core.wooSource('https://x.test',net({'wp-json':function(u){var m=/[?&]page=(\\d+)/.exec(u);return (m&&+m[1]>1)?{status:400,body:'{}'}:{status:200,body:JSON.stringify(W)}}}),function(){},'full');
 R.woo=w.items.map(function(i){return [i.id,i.st,i.price]});
 // دیجی‌کالا
 var D=[{id:1,title_fa:'عطر ادکلن دیور ساواج 100 میل',default_variant:{price:{selling_price:50000000}},status:'marketable'},
        {id:2,title_fa:'عطر ادکلن قدیمی 100 میل',price:{selling_price:40000000},status:'marketable'},
        {id:3,title_fa:'عطر ادکلن متوقف 100 میل',default_variant:{price:{selling_price:40000000}},status:'stopped_production'}];
 var d=await Core.digikalaSource(net({'digikala':function(){return {status:200,body:JSON.stringify({data:{products:D,pager:{total_pages:100}}})}}}),function(){},'full');
 R.dk=d.items.map(function(i){return [i.id,i.st,i.price]}); R.dkc=d.complete;
 // HTML
 function card(n,cls,body,alt){return '<li class="'+(cls||'')+'"><a href="/p/'+n+'"><img src="/i'+n+'.jpg" alt="'+(alt||('عطر شماره '+n+' ادو پرفیوم 100 میل'))+'"></a><h3>عطر شماره '+n+' ادو پرفیوم 100 میل</h3>'+body+'</li>'}
 var html='<html><body><ul>'+card(1,'','<span>5,000,000 تومان</span>')+card(2,'','<span>ناموجود</span><span>5,000,000 تومان</span>')+card(3,'','<span>نا&zwnj;موجود</span><span>5,000,000 تومان</span>')+card(4,'product outofstock','<span>5,000,000 تومان</span>')+card(5,'','<span class="old-badge">ناموجود</span><span>5,000,000 تومان</span>')+card(6,'','<span>5,000,000 تومان</span>','عطر ناموجود')+card(7,'','<span>در دسترس نیست</span><span>5,000,000 تومان</span>')+card(8,'','<span>پیش‌فروش</span><span>5,000,000 تومان</span>')+'</ul></body></html>';
 var doc=new DOMParser().parseFromString(html,'text/html');
 R.cards=Core.extractCards?Core.extractCards(doc,'https://s.test/c').map(function(c){return [c.t.slice(-26),c.st|0,c.price]}):null;
 // JSON-LD
 function ld(o){return new DOMParser().parseFromString('<script type="application/ld+json">'+JSON.stringify(o)+'</script>','text/html')}
 R.ld=[
  Core.extractCards(ld({'@type':'Product',name:'A',url:'/a',offers:{price:'5000000',priceCurrency:'IRT',availability:'https://schema.org/InStock'}}),'https://s.test/').length,
  Core.extractCards(ld({'@type':'Product',name:'B',url:'/b',offers:{price:'5000000',priceCurrency:'IRT'}}),'https://s.test/').length,
  Core.extractCards(ld({'@type':'Product',name:'C',url:'/c',offers:{price:'5000000',priceCurrency:'IRT',availability:'https://schema.org/OutOfStock'}}),'https://s.test/').map(function(c){return c.st+':'+c.price}),
  Core.extractCards(ld({'@type':'Product',name:'D',url:'/d',offers:{price:'50',priceCurrency:'USD',availability:'https://schema.org/InStock'}}),'https://s.test/').length
 ];
 // دور ۲: کارت با چند عکس، متن‌ها و کلاس‌های ناموجود، قیمت بدون جداکننده، لینک سبد
 function card2(n,cls,inner,attrs){return '<li class="'+(cls||'')+'" '+(attrs||'')+'><a href="/p/'+n+'"><img src="/a'+n+'.jpg" alt="عطر کد '+n+' ادو پرفیوم 100 میل"><img src="/b'+n+'.jpg"><img src="/c'+n+'.jpg"></a>'+inner+'</li>'}
 var h2='<html><body><ul>'
  +card2(1,'','<b>5,000,000 تومان</b>')
  +card2(2,'product outofstock','<b>5,000,000 تومان</b>')
  +card2(3,'','<span>فروخته شد</span><b>5,000,000 تومان</b>')
  +card2(4,'','<b>5,000,000 تومان</b>','data-stock="0"')
  +card2(5,'','<b>5,000,000 تومان</b><img src="/img/sold-out-badge.png" alt="">')
  +card2(6,'price-holder','<div class="price discounted"><del>6,000,000</del><ins>5,000,000</ins></div>')
  +card2(7,'','<b>5000000 تومان</b>')
  +card2(8,'','<b>5 میلیون تومان</b>')
  +card2(9,'','<b>5,000,000 تومان</b><small>ارسال رایگان بالای 3,000,000 تومان</small>')
  +card2(10,'','<b>5,000,000 تومان</b><a href="/?add-to-cart=10"><img src="/cart.png" alt=""></a>')
  +'</ul></body></html>';
 var d2=new DOMParser().parseFromString(h2,'text/html');
 R.c2=Core.extractCards(d2,'https://s.test/c').map(function(c){return [c.u.replace('https://s.test',''),c.st|0,c.price]});
 // ۱۰ برابر بین دو سایت مطمئن
 var db=Core.newDb(),ix=Core.dbIndex(db);
 Core.ingest(db,ix,'liliome',[{id:1,t:'عطر دیور ساواج ادو تویلت مردانه 100 میل',price:5000000,st:0}],true);
 Core.ingest(db,ix,'digikala',[{id:2,t:'عطر دیور ساواج ادو تویلت مردانه 100 میل',price:50000000,st:0}],true);
 db.t.liliome=Date.now();db.t.digikala=Date.now();
 var L=Core.buildList(db,['liliome','digikala'],{liliome:1,digikala:1},0);
 R.tenx=L.map(function(g){return g.sizes.map(function(z){return z.price})});
 // پایین‌تر از حد معقول
 var db2=Core.newDb(),i2=Core.dbIndex(db2);
 Core.ingest(db2,i2,'liliome',[{id:1,t:'عطر دیور ساواج ادو تویلت مردانه 100 میل',price:160000,st:0}],true);db2.t.liliome=Date.now();
 R.tiny=Core.buildList(db2,['liliome'],{liliome:1},0).length;
 // ---- دور ۳ ----
 function P3(html){var d=new DOMParser().parseFromString('<html><body><ul>'+html+'</ul></body></html>','text/html');return Core.extractCards(d,'https://s.test/c').map(function(c){return [c.u.replace('https://s.test',''),c.st|0,c.price]})}
 R.r3={};
 R.r3.outside=P3('<li class="product outofstock"><a href="/product/a1"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2><span class="price">5,000,000 تومان</span></a><a class="add_to_cart_button" href="/?add-to-cart=1">افزودن</a></li><li class="product"><a href="/product/a2"><img src="/b.jpg"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2><span class="price">6,000,000 تومان</span></a></li>');
 R.r3.badge=P3('<li><a href="/product/b1"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2><span class="price">5,000,000 تومان</span></a><span class="badge">ناموجود</span></li><li><a href="/product/b2"><img src="/b.jpg"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2><span class="price">6,000,000 تومان</span></a></li>');
 R.r3.vocab=['غیرموجود','موجودی ندارد','به اتمام رسید','از رده خارج','قابل سفارش نیست','No longer available','نا\u200bموجود'].map(function(w,i){return P3('<li><a href="/product/v'+i+'"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2></a><span class="price">5,000,000 تومان</span><em>'+w+'</em></li><li><a href="/product/w'+i+'"><img src="/b.jpg"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2></a><span class="price">6,000,000 تومان</span></li>')[0]});
 R.r3.glued=P3('<li><a href="/product/g1"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2></a><span>4.5</span><span class="price">2,500,000 تومان</span></li><li><a href="/product/g2"><img src="/b.jpg"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2></a><span>12</span><span class="price">۲٬۵۰۰٬۰۰۰ تومان</span></li>').map(function(x){return x[2]});
 R.r3.fmt=['5.500.000 تومان','4/500/000 تومان','4 500 000 تومان','۴٫۵ میلیون تومان','۵۵۰ هزار تومان','600,000 تومان تخفیف'].map(function(t){return Core.priceFromText(t).nums});
 R.r3.rialWord=Core.priceFromText('5,000,000 تومان\\nپرداخت با ریال و کارت');
 R.r3.logo=P3('<li><a href="/brand/dior"><img src="/logo.png" alt="Dior"></a><a href="/product/l1"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2></a><span class="price">5,000,000 تومان</span><b>ناموجود</b></li><li><a href="/brand/dior"><img src="/logo.png" alt="Dior"></a><a href="/product/l2"><img src="/b.jpg" alt="تصویر محصول"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2></a><span class="price">6,000,000 تومان</span></li>');
 R.r3.itemprop=P3('<li><a href="/product/i1"><img src="/a.jpg"><h2>عطر دیور ساواج ادو تویلت 100 میل</h2></a><span class="price">5,000,000 تومان</span><link itemprop="availability" href="https://schema.org/OutOfStock"></li><li><a href="/product/i2"><img src="/b.jpg"><h2>عطر دیور ساواج ادو پرفیوم 100 میل</h2></a><span class="price">6,000,000 تومان</span></li>');
 // مقیاس ریالی با شواهد کم از بین نمی‌رود + پاک‌سازی بی‌رویه نمی‌شود
 var dbq=Core.newDb(),iq=Core.dbIndex(dbq);
 var lil=[],saf=[];for(var q=0;q<30;q++){var nm='عطر ورساچه مدل نام'+String.fromCharCode(1570+q)+'ابکد ادو پرفیوم مردانه 100 میل';lil.push({id:q+1,t:nm,price:5000000+q*10000,st:0});saf.push({id:q+1,t:nm,price:(5000000+q*10000)*10,st:0})}
 Core.ingest(dbq,iq,'liliome',lil,true);Core.ingest(dbq,iq,'safir',saf,true);dbq.t.liliome=dbq.t.safir=Date.now();
 var Lq=Core.buildList(dbq,['liliome','safir'],{liliome:1},0);R.r3.scale1=dbq.sc.safir;
 Core.ingest(dbq,iq,'safir',saf.slice(0,3),false);   // ناقص: چیزی پاک نشود
 var cntSaf=Object.keys(dbq.it.safir).length;
 Core.ingest(dbq,iq,'safir',saf.slice(0,3),true);    // «کامل» ولی خیلی کوچک → پاک نشود
 R.r3.pruned=[cntSaf,Object.keys(dbq.it.safir).length];
 return R;
}
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
        pg=await b.new_page(); await pg.goto('about:blank'); await pg.add_script_tag(path=ROOT)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        R=await pg.evaluate(JS)
        woo={r[0]:r for r in R['woo']}
        T(woo[1][1]==0 and woo[1][2]==5000000,'woo in stock',woo[1])
        T(woo[2][1]==1 and woo[2][2]==0,'woo out',woo[2])
        T(woo[3][1]==1,'woo missing is_in_stock -> unavailable',woo[3])
        T(woo[4][1]==1 or woo[4][2]==0,'woo USD not toman',woo[4])
        T(woo[5][1]==1,'woo price_html says unavailable',woo[5])
        T(woo[6][2]==6000000 and woo[6][1]==0,'woo price_html fallback ok',woo[6])
        dk={r[0]:r for r in R['dk']}
        T(dk[1][1]==0 and dk[1][2]==5000000,'dk ok',dk[1]); T(dk[2][1]==1 and dk[2][2]==0,'dk no default_variant',dk[2]); T(dk[3][1]==1,'dk stopped status',dk[3])
        T(R['dkc'] is False,'dk >80 pages is not complete')
        c={x[0][-3:]:x for x in (R['cards'] or [])}
        for n in (1,): pass
        cs=R['cards'] or []
        T(len(cs)==8,'8 cards',len(cs))
        sts=[x[1] for x in cs]
        T(sts==[0,1,1,1,1,1,1,1],'only card 1 is available',sts)
        T(all(x[2]==0 for x in cs[1:]),'unavailable have price 0',cs)
        L=R['ld']; T(L[0]==1,'ld InStock'); T(L[1]==0,'ld without availability rejected',L[1]); T(L[2]==['1:0'],'ld OutOfStock -> st1',L[2]); T(L[3]==0,'ld USD rejected',L[3])
        c2=R['c2']; st2=[x[1] for x in c2]
        T(len(c2)==10-0 or len(c2)==9,'cards2 count',len(c2))
        byu={x[0]:x for x in c2}
        T(byu['/p/1'][1]==0 and byu['/p/1'][2]==5000000,'multi-image available card ok',byu.get('/p/1'))
        for n,why in [(2,'li class outofstock with 3 imgs'),(3,'sold text فروخته شد'),(4,'data-stock=0'),(5,'sold-out overlay img')]:
            T(byu['/p/%d'%n][1]==1 and byu['/p/%d'%n][2]==0,why,byu.get('/p/%d'%n))
        T(byu['/p/6'][2]==5000000,'discounted wrapper keeps price',byu.get('/p/6'))
        T(byu['/p/7'][2]==5000000,'plain digits with تومان',byu.get('/p/7'))
        T(byu['/p/8'][2]==5000000,'N میلیون',byu.get('/p/8'))
        T(byu['/p/9'][2]==5000000,'free shipping threshold not price',byu.get('/p/9'))
        T(not any('add-to-cart' in x[0] for x in c2),'cart link not a product',c2)
        T(R['tenx']==[[5000000]],'trusted 10x error -> first source',R['tenx'])
        T(R['tiny']==0,'implausible per-ml price dropped',R['tiny'])
        r3=R['r3']
        T(r3['outside'][0][1]==1 and r3['outside'][0][2]==0,'outofstock class on li outside the anchor',r3['outside'])
        T(r3['outside'][1][1]==0 and r3['outside'][1][2]==6000000,'neighbour card still available',r3['outside'])
        T(r3['badge'][0][1]==1 and r3['badge'][1][1]==0,'badge outside anchor',r3['badge'])
        T(all(v[1]==1 and v[2]==0 for v in r3['vocab']),'out-of-stock vocabulary',r3['vocab'])
        T(r3['glued']==[2500000,2500000],'glued numbers not merged',r3['glued'])
        f=r3['fmt']; T(f[0]==[5500000] and f[1]==[4500000] and f[2]==[4500000] and f[3]==[4500000] and f[4]==[550000] and f[5]==[],'price formats',f)
        T(r3['rialWord']['rial'] is False,'ریال word elsewhere is not the unit',r3['rialWord'])
        T(r3['logo'][0][1]==1 and r3['logo'][1][1]==0 and len(r3['logo'])==2,'brand logo link does not break card, heading title wins',r3['logo'])
        T(r3['itemprop'][0][1]==1,'itemprop availability OutOfStock',r3['itemprop'])
        T(r3['scale1']==0.1,'rial scale detected',r3['scale1'])
        T(r3['pruned'][0]==r3['pruned'][1],'suspiciously small "complete" list does not prune',r3['pruned'])
        T(not errs,'js errors',errs)
        await b.close()
asyncio.run(main()); print(ok,'passed',bad,'failed'); raise SystemExit(1 if bad else 0)
