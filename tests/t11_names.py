import asyncio,json,sys,random
sys.path.insert(0,'/home/claude/PerfumePrice/tests')
from harness import *
OK=[];BAD=[]
def chk(name,cond,info=''):
    (OK if cond else BAD).append(name); print(('PASS ' if cond else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
JS="""
function(cases){
  var ORD=['liliome','digikala','safir','hiland'],T={liliome:1,digikala:1};
  return cases.map(function(c){
    var recs=c.map(function(r){return {src:r[0],t:r[1],price:r[2]}});
    return Core.aggregate(recs,ORD,T).map(function(x){return {n:x.name,c:x.conc,g:x.gn,s:x.sizes.map(function(z){return z.ml+':'+z.price+'/'+z.n}).join(',')}});
  });
}"""
M=1e6
def r(src,t,p): return [src,t,p*M]
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await new_page(p,mobile=False,stub=None)
        await pg.goto('file://'+ROOT+'/index.html'); await pg.wait_for_function("window.Core")
        cases=[]
        # A/B/C جنسیت
        men='عطر ادکلن مردانه ورساچه اروس ادو تویلت 100 میل'; wom='عطر ادکلن زنانه ورساچه اروس ادو تویلت 100 میل'; unk='عطر ادکلن ورساچه اروس ادو تویلت 100 میل'
        cases.append([r('liliome',men,20),r('liliome',wom,15),r('digikala',men,21),r('digikala',wom,14.5)])
        cases.append([r('liliome',men,20),r('liliome',wom,15),r('digikala',men,21),r('digikala',wom,14.5),r('safir',unk,20.5)])
        cases.append([r('liliome',men,20),r('liliome',wom,15),r('digikala',men,21),r('digikala',wom,14.5),r('safir',unk,17.5)])
        cases.append([r('safir',unk,20.5),r('liliome',men,20),r('digikala',wom,14.5),r('liliome',wom,15),r('digikala',men,21)])  # ترتیب برعکس
        # D املا
        cases.append([r('liliome','عطر پاکو رابان وان میلیون ادو تویلت 100 میل',9),r('digikala','ادکلن پکو رابان وان میلیون ادوتویلت 100 میل',9.2)])
        # E بلو/بلک، نایت/نایس همخانواده با قیمت یکسان
        cases.append([r('liliome','عطر گوچی بلک ادو پرفیوم 100 میل',10),r('digikala','عطر گوچی بلو ادو پرفیوم 100 میل',10.1)])
        cases.append([r('liliome','عطر مارک جیکوبز دیزایر نایت ادو تویلت 100 میل',8),r('digikala','عطر مارک جیکوبز دیزایر نایس ادو تویلت 100 میل',8.1)])
        # F
        cases.append([r('liliome','عطر دیور ساواج ادو تویلت 100 میل',30),r('liliome','عطر دیور ساواج الکسیر ادو تویلت 100 میل',45),r('digikala','عطر دیور ساواج ادو تویلت 100 میل',30.5),r('digikala','عطر دیور ساواج اینتنس ادو تویلت 100 میل',32)])
        # G غلظت نامشخص
        a='عطر شنل بلو ادو پرفیوم 100 میل'; bb='عطر شنل بلو ادو تویلت 100 میل'; cc='عطر شنل بلو 100 میل'
        cases.append([r('liliome',a,20),r('liliome',bb,15),r('safir',cc,20.3)])      # نزدیک به EDP
        cases.append([r('liliome',a,20),r('liliome',bb,15),r('safir',cc,17.5)])      # مبهم
        cases.append([r('liliome',a,20),r('safir',cc,60)])                           # خیلی دور
        cases.append([r('liliome',cc,20)])                                           # تنها
        # H تخفیف/دو قیمت در یک سایت
        d='عطر دیور ساواج ادو تویلت 100 میل'
        cases.append([r('liliome',d,30),r('liliome',d,24)])
        cases.append([r('liliome',d,30),r('liliome',d,9)])
        cases.append([r('liliome',d,30),r('liliome',d,27.5),r('digikala',d,29)])
        res=await pg.evaluate(JS,cases)
        for i,x in enumerate(res): print(i,json.dumps(x,ensure_ascii=False))
        # بررسی‌ها
        A=res[0]; chk('A men and women are two rows with own prices',len(A)==2 and {x['g'] for x in A}=={'m','w'} and any(x['g']=='m' and x['s'].startswith('100:20') for x in A) and any(x['g']=='w' and x['s'].startswith('100:14') for x in A),A)
        B=res[1]; chk('B unknown-gender listing near men price joins men (3 sources→n counts)',len(B)==2 and any(x['g']=='m' and x['s'].endswith('/3') for x in B),B)
        C=res[2]; chk('C ambiguous unknown-gender listing is not shown / not mixed in',len(C)==2 and all(x['s'].endswith('/2') for x in C),C)
        chk('B order-independent (unknown listed first)',sorted(json.dumps(x,ensure_ascii=False) for x in res[3])==sorted(json.dumps(x,ensure_ascii=False) for x in res[1]),res[3])
        chk('D spelling typo merged into one row',len(res[4])==1 and res[4][0]['s'].endswith('/2'),res[4])
        chk('E1 بلک vs بلو NOT merged',len(res[5])==2,res[5])
        chk('E2 نایت vs نایس NOT merged',len(res[6])==2,res[6])
        chk('F Sauvage / Elixir / Intense all separate',len(res[7])==3,res[7])
        chk('G1 unknown conc near EDP joins EDP (and EDT unaffected)',len(res[8])==2 and any(x['c']=='ادوپرفیوم' and x['s'].endswith('/2') for x in res[8]) and any(x['c']=='ادوتویلت' and x['s'].endswith('/1') for x in res[8]),res[8])
        chk('G2 ambiguous unknown conc hidden',len(res[9])==2 and all(x['s'].endswith('/1') for x in res[9]),res[9])
        chk('G3 far-price unknown conc not merged & not shown',len(res[10])==1 and res[10][0]['s']=='100:20000000/1',res[10])
        chk('G4 alone unknown conc still shown',len(res[11])==1 and res[11][0]['s']=='100:20000000/1',res[11])
        chk('H1 two listings same site (30M,24M) -> discounted 24M',res[12][0]['s']=='100:24000000/1',res[12])
        chk('H2 two listings (30M,9M) -> 9M treated as odd, keeps 30M',res[13][0]['s']=='100:30000000/1',res[13])
        chk('H3 duplicate + other site',res[14][0]['s'].startswith('100:2') and res[14][0]['s'].endswith('/2'),res[14])
        # extractCards: قیمت قدیم و جدید
        html1='<html><body><div><a href="/p/1"><img src="/i.jpg" alt="عطر دیور ساواج ادو تویلت 100 میل"></a><span>۳۰٬۰۰۰٬۰۰۰</span> <span>۲۴٬۰۰۰٬۰۰۰ تومان</span></div></body></html>'
        html2='<html><body><div><a href="/p/2"><img src="/i.jpg" alt="عطر دیور ساواج ادو تویلت 100 میل"></a><span class="new">۲۴٬۰۰۰٬۰۰۰</span><span class="x">۳۰٬۰۰۰٬۰۰۰</span><span>اقساط ماهانه ۳٬۰۰۰٬۰۰۰</span></div></body></html>'
        ld={"@type":"Product","name":"عطر دیور ساواج","offers":[{"price":"30000000","priceCurrency":"IRT"},{"price":"24000000","priceCurrency":"IRT"}]}
        html3='<html><head><script type="application/ld+json">%s</script></head><body></body></html>'%json.dumps(ld)
        out=await pg.evaluate("function(h){return h.map(function(x){var d=new DOMParser().parseFromString(x,'text/html');return Core.extractCards(d,'https://x.ir/').map(function(c){return c.price})})}",[html1,html2,html3])
        print(out)
        chk('card with old+new price (no markup) -> lower',out[0]==[24000000],out[0])
        chk('card with installment number ignored',out[1]==[24000000],out[1])
        chk('JSON-LD two offers -> lower',out[2]==[24000000],out[2])
        # ترتیب‌ناوابستگی روی داده‌ی بزرگ
        recs=await pg.evaluate("(async function(){return null})()")
        await b.close()
    print('PASS',len(OK),'FAIL',len(BAD))
asyncio.run(main())
