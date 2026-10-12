// تولید داده‌ی آزمایشی شبیه سایت‌ها (فرمت‌ها فرضی‌اند، نه کپی واقعی سایت)
function rng(seed){var s=seed;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
var R=rng(12345);
var brands='دیور,شنل,گوچی,ورساچه,جورجیو آرمانی,ایو سن لوران,پاکو رابان,تام فورد,کرید,بولگاری,لانکوم,مون بلان,کلوین کلین,هوگو بوس,دولچه گابانا,مارک جیکوبز,آمواج,ژان پل گوتیه,لالیک,نیشانه,ممو,بایردو,پرادا,بربری,زارا,جگوار,آزارو,مونتال,ایزی میاکه,کنزو,جیمی چو,امپریو آرمانی,مایزون مارژیلا,اسکادا,لوئی ویتون,هرمس,کارولینا هررا,تیری موگلر,ایلمو,لطافه,رومبا,کاستو,ورساچه,مانسرا,ارمانی'.split(',');
var words='ساواج,بلو,لیبره,وان میلیون,اینویکتوس,اروس,اکوا,کد,بلک,اوپیوم,مدمازل,آونتوس,ایکس اس,فرهنهایت,هومو,لاویه است بل,ابسولو,ریزرو,توسکان لدر,ویکتوری,دارک,نایت,سنتس,رویال,عود وود,ارکید,بلوم,آتلانتیک,اکستریم,دیزایر,فانتوم,اینتنس,ایکون,کلاب,پور هوم,زیبا,جادور,میس,نوآر,امبر,گلد,پلاتینیوم,سیلور,آکوا دی جیو,اسپرت,فرش,لجند,ایرزیستیبل,لیمیتد,سی,شانس,الور,بامبو,رز,یاسمن,دریم,ستاره,ملکه,سلطان,فانتزی'.split(',');
var seen={},truth=[];
for(var i=0;truth.length<1100;i++){
  var b=brands[i%brands.length], w=words[(i*7+Math.floor(i/brands.length)*13)%words.length];
  if(i%3===0)w=w+' '+words[(i*11+5)%words.length];
  var key=b+'|'+w; if(seen[key])continue; seen[key]=1;
  var conc=R()<.55?'ادوپرفیوم':'ادوتویلت';
  var base=Math.round((3+R()*R()*70)*1e6/1000)*1000; if(i%97===0)base=140000000+Math.round(R()*8)*1e6; // رقم خیلی بزرگ
  var r=R(), sizes=r<.55?[100]:r<.85?[100,50]:[200,100,30];
  var sz=sizes.map(function(m){return {ml:m,price:Math.round(base*Math.pow(m/100,.8)/1000)*1000}});
  truth.push({brand:b,name:w,conc:conc,sizes:sz});
}
// نام‌های بلند برای تست جا
truth.push({brand:'لانکوم',name:'لاویه است بل ابسولو دو پرفیوم اینتنس ریزرو ویژه',conc:'ادوپرفیوم',sizes:[{ml:100,price:98765000},{ml:50,price:65432000}]});
truth.push({brand:'ایو سن لوران',name:'مای سلف لیبره نکتار دو پرفیوم اینتنس کالکشن فوق العاده طولانی',conc:'ادوپرفیوم',sizes:[{ml:90,price:120000000},{ml:50,price:80000000},{ml:30,price:50000000}]});
function jit(p,a){return Math.round(p*(1+(R()*2-1)*a)/1000)*1000}
var faD=function(n){return String(n).replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})};
var out={truth:truth,liliome:[],digikala:[],safirPages:[],hilandPages:[]};
var lil=[],dig=[],saf=[],hil=[],id=1;
function arab(s){return s.replace(/ی/g,'ي').replace(/ک/g,'ك')}
truth.forEach(function(t,ti){
  t.sizes.forEach(function(s){
    // لیلیوم
    if(R()<.85){
      lil.push({id:id++,name:'عطر ادکلن '+t.brand+' '+t.name+' '+t.conc+' '+s.ml+' میل',permalink:'https://liliome.com/p/'+id,type:'simple',is_in_stock:R()>.04,
        prices:{price:String(R()<.03?0:jit(s.price,.04)),currency_code:'IRT',currency_minor_unit:0},images:[{thumbnail:'https://liliome.com/wp-content/uploads/'+id+'-200x200.jpg'}],categories:[{name:'عطر و ادکلن'}]});
      if(R()<.05) lil.push({id:id++,name:'تستر عطر '+t.brand+' '+t.name+' '+t.conc+' '+s.ml+' میل',type:'simple',is_in_stock:true,prices:{price:String(jit(s.price*.7,.02)),currency_code:'IRT',currency_minor_unit:0},images:[],categories:[{name:'عطر'}]});
    }
    // دیجی‌کالا (ریال)
    if(R()<.8){
      var price=R()<.03?s.price*.45:jit(s.price,.06);
      dig.push({id:id++,title_fa:'ادکلن '+t.brand+' مدل '+t.name+' '+t.conc+' حجم '+faD(s.ml)+' میلی لیتر',status:'marketable',images:{main:{url:['https://dkstatics-public.digikala.com/'+id+'.jpg']}},default_variant:{price:{selling_price:price*10}}});
    }
    // سفیر (HTML)
    if(R()<.7){
      var p2=jit(s.price,.05), nm=t.brand+' '+t.name+' '+t.conc+' '+s.ml+' میل'; if(R()<.02)nm=nm.replace('ا','')||nm;
      saf.push('<div class="product-card"><a href="/product/'+id+'"><img src="/img/'+id+'.jpg" alt="'+nm+'"><h3 class="title">'+nm+'</h3></a><div class="price"><del>'+faD(String(Math.round(p2*1.15)).replace(/\B(?=(\d{3})+(?!\d))/g,'٬'))+'</del> <ins>'+faD(String(p2).replace(/\B(?=(\d{3})+(?!\d))/g,'٬'))+'</ins> تومان</div></div>');id++;
    }
    // هایلند (HTML، قیمت ۱۰ برابر بدون برچسب = ریال)
    if(R()<.65){
      var p3=jit(s.price,.05)*10, nm2=arab(t.brand.replace(/ /g,'‌'))+' '+arab(t.name)+' '+t.conc+' '+s.ml+'ml';
      hil.push('<li class="item"><a href="/fa/p'+id+'"><img data-src="/pics/'+id+'.webp" alt="'+nm2+'"></a><h2>'+nm2+'</h2><span class="amount">'+String(p3).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</span></li>');id++;
    }
  });
});
// آیتم‌های ناخواسته
lil.push({id:id++,name:'کرم دست لیلیوم 100 میل',type:'simple',is_in_stock:true,prices:{price:'250000',currency_code:'IRT',currency_minor_unit:0},images:[],categories:[{name:'مراقبت پوست'}]});
lil.push({id:id++,name:'عطر متغیر نمونه',type:'variable',is_in_stock:true,prices:{price:'1000000',currency_code:'IRT',currency_minor_unit:0},images:[],categories:[{name:'عطر'}]});
function pages(arr,n){var o=[];for(var i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n));return o}
out.liliome=pages(lil,100); out.digikala=pages(dig,20);
out.safirPages=pages(saf,60).map(function(p,i,all){return '<html><body><div class="grid">'+p.join('')+'</div>'+(i<all.length-1?'<a rel="next" href="/category/perfume?page='+(i+2)+'">بعدی</a>':'')+'</body></html>'});
out.hilandPages=pages(hil,60).map(function(p,i,all){return '<html><body><ul>'+p.join('')+'</ul>'+(i<all.length-1?'<a class="next page-numbers" href="?page='+(i+2)+'">›</a>':'')+'</body></html>'});
require('fs').writeFileSync(__dirname+'/fixtures.json',JSON.stringify(out));
console.log('truth',truth.length,'lil',lil.length,'dig',dig.length,'saf',saf.length,'hil',hil.length);
