// دور ۱ نقد: ادغام اشتباه، کالای تقلبی/اضافی، املا و برندِ لاتین
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function T(c,m,x){if(c)ok++;else{bad++;console.log('FAIL',m,x===undefined?'':JSON.stringify(x))}}
var id=0;function it(t,price,o){o=o||{};return {id:o.id||++id,t:t,e:o.e||'',price:price,img:'',st:o.st||0,b:o.b||[]}}
// ۱) تقلبی/اضافی رد می‌شوند
['عطر مشابه ساواج 100 میل','کپی ساواج دیور 100 میل','Inspired by Dior Sauvage 100ml','Dior Sauvage body splash 100ml','Dior Sauvage after shave 100ml','Dior Sauvage candle 100ml','عطر مو دیور 100 میل','Dior Sauvage unboxed 100ml','عطر دیور بدون کارتن 100 میل','Dior Sauvage 2 pack 100ml','عطر استوک دیور ساواج 100 میل'].forEach(function(t){T(C.parseTitle(t)===null,'excluded: '+t)});
// ۲) نویز حذف می‌شود
var a=C.parseTitle('عطر ادکلن دیور ساواج جدید پرفروش اورجینال گارانتی دار ارسال رایگان ساخت فرانسه 100 میل ادو تویلت'),b=C.parseTitle('عطر دیور ساواج 100 میل ادو تویلت');
T(a&&b&&a.key.join(' ')===b.key.join(' '),'noise words removed',a&&a.key);
// ۳) «لو میل» می‌ماند
var m=C.parseTitle('عطر ادکلن ژان پل گوتیه لو میل 125 میل ادو تویلت');T(m&&m.key.indexOf('میل')>=0,'Le Male keeps میل',m&&m.key);
// ۴) حروف با نشانه
var h=C.parseTitle('Terre d\'Hermès EDT 100ml');T(h&&h.key.join(' ')==='terre hermes','accent+apostrophe',h&&h.key);
var j=C.parseTitle("Dior J'adore EDP 100ml");T(j&&j.key.indexOf('jadore')>=0,'jadore joined',j&&j.key);
var lc=C.parseTitle('Lancôme La Vie Est Belle EDP 100ml');T(lc&&lc.key.indexOf('lancome')>=0,'Lancome accent',lc&&lc.key);
// ۵) ادغام اشتباهِ مدل‌های نزدیک ولی متفاوت
var db=C.newDb(),idx=C.dbIndex(db);
C.ingest(db,idx,'liliome',[
 it('عطر ادکلن لانکوم لا ویه است بل ادو پرفیوم زنانه 100 میل',5000000,{id:1}),
 it('Versace Dylan Blue EDT men 100ml',3000000,{id:2}),
 it('Versace Dylan Blue Intense EDP men 100ml',3100000,{id:3}),
 it('عطر ادکلن جیورجیو آرمانی اکوا دی جیو ادو پرفیوم مردانه 100 میل',4000000,{id:4}),
 it('عطر ادکلن جیورجیو آرمانی اکوا دی جیو ابسولو ادو پرفیوم مردانه 100 میل',4100000,{id:5}),
 it('عطر ادکلن ورساچه بلک اپیوم ادو پرفیوم زنانه 100 میل',4000000,{id:6}),
 it('عطر ادکلن ورساچه بلک اپیوم اینتنس ادو پرفیوم زنانه 100 میل',4100000,{id:7}),
 it('عطر ادکلن ورساچه لایت بلو ادو تویلت زنانه 100 میل',3000000,{id:8}),
 it('عطر ادکلن ورساچه لایت بلو اینتنس ادو تویلت زنانه 100 میل',3100000,{id:9}),
],true);
var gs=Object.keys(db.g).length;T(gs===8||gs===9,'similar-but-different not merged',gs);
T(gs===9,'9 distinct groups',gs);
// ۶) املای متفاوت بدون غلظت/جنسیت با شباهت قیمت ادغام نمی‌شود
var db2=C.newDb(),i2=C.dbIndex(db2);
C.ingest(db2,i2,'liliome',[it('عطر ادکلن دیور ایلوژن ادو تویلت مردانه 100 میل',5000000,{id:1})],true);
C.ingest(db2,i2,'digikala',[it('عطر دیور ایلوزن 100 میل',5000000,{id:'9'})],true);
T(Object.keys(db2.g).length===2,'fuzzy w/o conc not merged by price',Object.keys(db2.g).length);
// ۷) مدل تک‌حرفی Y
var db3=C.newDb(),i3=C.dbIndex(db3);
C.ingest(db3,i3,'liliome',[it('عطر ادکلن ایو سن لوران وای ادو پرفیوم مردانه 100 میل',6000000,{id:1,b:['Yves Saint Laurent']}),it('YSL Y EDP men 100ml',6100000,{id:2})],true);

// ---- دور ۲ ----
function key(t){var p=C.parseTitle(t);return p?p.key.join(' '):null}
var base=key('عطر ادکلن دیور ساواج ادو تویلت مردانه 100 میل');
['عطر ادکلن دیور ساواج ادو تویلت وارداتی 100 میل','عطر ادکلن دیور ساواج ادو تویلت تخفیف ویژه ارسال فوری 100 میل','عطر و ادکلن دیور ساواج، ادو تویلت، 100 میل','ادکلن کریستین دیور ساواج ادو تویلت 100 میل','عطر دیور ساواج اصلی و اورجینال ادو تویلت 100 میل','<b>عطر دیور</b> ساواج ادو تویلت 100 میل'].forEach(function(t){T(key(t)===base,'same key: '+t,[key(t),base])});
['ادکلن دیور ساواج طرح اصلی ادو تویلت 100 میل','عطر ماشین دیور ساواج 100 میل','Dior Sauvage Body Cream 200ml','Dior Hand Cream 75ml','Dior Shampoo 250ml','Dior Gift Pack 100ml'].forEach(function(t){T(C.parseTitle(t)===null,'junk excluded: '+t)});
T(C.parseTitle('عطر وایت ماسک 100 میل')!==null,'white musk is not a face mask');
T(key('Armani Prive Rouge Malachite EDP 100ml')===key('Giorgio Armani Prive Rouge Malachite EDP 100ml'),'armani alias canon',[key('Armani Prive Rouge Malachite EDP 100ml'),key('Giorgio Armani Prive Rouge Malachite EDP 100ml')]);
T(key('عطر ایو سن لوران وای ادو پرفیوم 100 میل')===key('عطر سن لوران وای ادو پرفیوم 100 میل'),'ysl alias canon');
T(key('Mont Blanc Legend EDT 100ml')===key('Montblanc Legend EDT 100ml'),'mont blanc canon');
T(key('عطر لو میل ژان پل گوتیه ادو تویلت 125 میل')===key('عطر لومیل ژان پل گوتیه ادو تویلت 125 میل'),'le male spacing');
T(key('عطر وان میلیون پاکو رابان ادو تویلت 100 میل')===key('عطر 1 میلیون پاکو رابان ادو تویلت 100 میل'),'1 million = وان میلیون');
T(key('Burberry Her EDP 100ml')!==key('Burberry Hero EDP 100ml'),'Her vs Hero distinct');
T(C.parseTitle('Jimmy Choo Man EDT 100ml')!==null,'Jimmy Choo Man kept');
T(key('Dior Sauvage Man EDT 100ml')===key('Dior Sauvage EDT 100ml'),'trailing Man = gender',[key('Dior Sauvage Man EDT 100ml'),key('Dior Sauvage EDT 100ml')]);
T(/sauvage/.test(key('ادو تویلت مردانه دیور مدل Sauvage حجم 100 میلی لیتر')||''),'mixed script keeps Latin model',key('ادو تویلت مردانه دیور مدل Sauvage حجم 100 میلی لیتر'));
T(key('Chanel No 5 EDP 100ml')===key('Chanel N°5 EDP 100ml'),'No 5 variants');
// همان سایت دو آگهی (ساده و EDP) → یکی در دیگری گم نشود
var dbS=C.newDb(),ixS=C.dbIndex(dbS);
C.ingest(dbS,ixS,'safir',[it('Dior Sauvage 100ml',5500000,{id:1}),it('Dior Sauvage EDP 100ml',6800000,{id:2})],true);
C.ingest(dbS,ixS,'hiland',[it('Dior Sauvage EDP 100ml',6900000,{id:3})],true);
dbS.t.safir=dbS.t.hiland=Date.now();
var LS=C.buildList(dbS,['safir','hiland'],{},0);
T(LS.length===2,'same-shop plain vs EDP stay separate',LS.length);

// ---- دور ۳ ----
function kept(t){return C.parseTitle(t)!==null}
function bareOf(titles,srcs){var d=C.newDb(),x=C.dbIndex(d);titles.forEach(function(t,i){C.ingest(d,x,'s'+(i%2),[it(t,5000000+i*1000,{id:i+1})],true)});d.t.s0=d.t.s1=Date.now();var L=C.buildList(d,['s0','s1'],{},0);var tr=C.tree(L,'fa',d.wd);return {n:tr.reduce(function(a,b){return a+b.models.length},0),bare:tr.audit.bare,tr:tr}}
function names(r){var o=[];r.tr.forEach(function(b){b.models.forEach(function(m){o.push(b.name+':'+m.name)})});return o}
[['عطر ادکلن شنل نامبر 5 ادو پرفیوم 100 میل'],['Carolina Herrera 212 Men EDT 100ml'],['ادکلن مردانه پاکو رابان مدل 1 Million ادو تویلت حجم 100 میلی لیتر'],['Chloe Eau de Parfum 75ml'],['Nina Ricci Nina 80ml'],['Jimmy Choo Man 100ml'],['Hugo Boss Hugo Man 125ml'],['Paco Rabanne Paco 100ml'],['ادکلن مردانه جورجیو آرمانی مدل Acqua di Gio ادو تویلت حجم 100 میلی لیتر'],['ادکلن آزارو مدل Chrome 100 میل']].forEach(function(a){var r=bareOf(a);T(r.n>=1&&r.bare.length===0,'not deleted: '+a[0],{n:r.n,bare:r.bare,names:names(r)})});
var rr=bareOf(['عطر ادکلن ورساچه اروس Flame مردانه 100 میل','عطر ادکلن ورساچه اروس ادو تویلت مردانه 100 میل']);T(rr.tr.reduce(function(a,b){return a+b.models.length},0)===2,'Eros Flame separate from Eros',names(rr));
rr=bareOf(['دیور ساواج Elixir 60 میل','دیور ساواج ادو پرفیوم 100 میل']);T(names(rr).length===2,'Sauvage Elixir kept separate',names(rr));
rr=bareOf(['Paco Rabanne Black XS EDT 100ml','Paco Rabanne XS Black EDT 100ml']);T(names(rr).length===2,'Black XS != XS Black',names(rr));
rr=bareOf(['Dior Homme EDT 100ml','Dior Homme Cologne 100ml']);T(rr.tr[0].models[0].variants.length===2,'Homme EDT vs Cologne are two variants',names(rr));
['ویکتوریا سکرت بادی میست پیور سداکشن 250 میل','Dior Sauvage Body Butter 200ml','Dior Sauvage Hair Oil 100ml','Dior Sauvage Deo Spray 150ml','Dior Sauvage Coffret 100ml','Dior Sauvage EDP 2x100ml','بخور دیور ساواج 100 میل','ادکلن دیور ساواج (طرح اصلی) 100 میل','معادل ساواج 100 میل','Dior Sauvage Mist 100ml'].forEach(function(t){T(!kept(t),'junk: '+t)});
T(kept('Maison Margiela Replica By the Fireplace 100ml'),'Replica line is real');
T(key('دیور ساواج او دو پرفیوم 100 میل')===key('دیور ساواج ادو پرفیوم 100 میل'),'او دو پرفیوم = ادو پرفیوم',[key('دیور ساواج او دو پرفیوم 100 میل'),key('دیور ساواج ادو پرفیوم 100 میل')]);
T(C.parseTitle('دیور ساواج او دو پرفیوم 100 میل').conc==='ادوپرفیوم','conc of او دو پرفیوم');
T(key('آمواج ریفلکشن من 100 میل')===key('آمواج ریفلکشن ادو پرفیوم مردانه 100 میل'),'من = مردانه',[key('آمواج ریفلکشن من 100 میل'),key('آمواج ریفلکشن ادو پرفیوم مردانه 100 میل')]);
// دو عنوان همنام (یکی از متن فارسی و یکی لاتین) یک ردیف
rr=bareOf(['عطر ادکلن پاکو رابان اینویکتوس ادو تویلت مردانه 100 میل','Paco Rabanne Invictus EDT 100ml']);T(names(rr).filter(function(n){return /Invictus|اینویکتوس/.test(n)}).length===1,'same display name merged',names(rr));
console.log(ok+' passed, '+bad+' failed');process.exit(bad?1:0);
