const C=require('../app/src/main/assets/www/core.js');
let fail=0;
function T(title,exp){const r=C.parseTitle(title);const got=r?{n:r.name,c:r.conc,ml:r.ml}:null;
 const ok=JSON.stringify(got)===JSON.stringify(exp);if(!ok){fail++;console.log('FAIL',title,'\n   got',JSON.stringify(got),'\n   exp',JSON.stringify(exp))}else console.log('ok  ',title)}
T('عطر ادکلن دیور ساواج ادو تویلت ۱۰۰ میل',{n:'دیور ساواج',c:'ادوتویلت',ml:100});
T('ادکلن مردانه شنل بلو دو شنل ادو پرفیوم حجم 100 میلی لیتر',{n:'شنل بلو دو شنل',c:'ادوپرفیوم',ml:100});
T('عطر زنانه گوچی بلوم ادو پارفوم 50ml',{n:'گوچی بلوم',c:'ادوپرفیوم',ml:50});
T('Dior Sauvage Eau de Toilette 3.4 oz',{n:'Dior Sauvage',c:'ادوتویلت',ml:100});
T('تستر ادکلن دیور ساواج 100 میل',null);
T('Tester Dior Sauvage EDP 100ml',null);
T('ست ادکلن گوچی بلوم 100 میل + 10 میل',null);
T('عطر دیور ساواج 100 میل + 10 میل',null);
T('رول آن عطر شنل 10 میل',null);
T('عطر مینیاتوری شنل 7.5 میل',null);
T('بادی اسپری ویکتوریا سکرت 250 میل',null);
T('کرم دست 100 میل',null);
T('عطر ادکلن آمواج پورپس ادوپرفیوم 100 میل',{n:'آمواج پورپس',c:'ادوپرفیوم',ml:100});
T('ادکلن لوئی ویتون اوراژ ادو پرفیوم ۱۰۰ میلی‌لیتر',{n:'لوئی ویتون اوراژ',c:'ادوپرفیوم',ml:100});
T('عطر دیور ساواج الکسیر پرفیوم 60 میل',{n:'دیور ساواج الکسیر',c:'پرفیوم',ml:60});
T('عطر ادکلن رودیر بوهمیان ۱۰۰ml',{n:'رودیر بوهمیان',c:'',ml:100});
T('عطر',null);
// تطبیق
const A=C.parseTitle('عطر دیور ساواج ادو تویلت 100 میل'),B=C.parseTitle('ادکلن Dior ساوآج دیور EDT 100ml');
console.log('similar (spelling variant ساواج/ساوآج):',C.similar(A.key,C.parseTitle('ادکلن دیور ساواژ ادوتویلت 100 میل').key));
const E=C.parseTitle('دیور ساواج 100 میل ادوتویلت'),F=C.parseTitle('دیور ساواج الکسیر 100 میل');
console.log('Sauvage vs Elixir must NOT match:',!C.similar(E.key,F.key));
if(C.similar(E.key,F.key))fail++;
// قیمت خریدار: بررسی منطق تجمیع
function rec(src,t,price){return {src,t,price}}
const R=[];
['liliome','digikala','safir','hiland'].forEach((s,i)=>R.push(rec(s,'عطر دیور ساواج ادوتویلت 100 میل',[30e6,31e6,29.5e6,30.5e6][i])));
R.push(rec('digikala','عطر شنل بلو ادوپرفیوم 100 میل',9e6)); R.push(rec('liliome','عطر شنل بلو ادوپرفیوم 100 میل',28e6)); R.push(rec('safir','عطر شنل بلو ادوپرفیوم 100 میل',27.5e6));
R.push(rec('digikala','عطر گوچی بلوم ادوپرفیوم 100 میل',12e6)); R.push(rec('liliome','عطر گوچی بلوم ادوپرفیوم 100 میل',29e6));
const L=C.aggregate(R,['liliome'],{liliome:1,digikala:1});
const pr=n=>L.find(x=>x.name.includes(n)).sizes[0];
console.log('4 sources median',pr('ساواج'));
console.log('fake-cheap among 3 sources (9M vs 28M,27.5M):',pr('شنل'));
console.log('2 sources disagree >30% -> higher kept:',pr('گوچی'));
if(pr('ساواج').price!==30250000)fail++;
if(pr('شنل').price<27e6)fail++;
if(pr('گوچی').price!==29000000)fail++;
console.log(fail?('FAILURES '+fail):'ALL OK');process.exit(fail?1:0);
