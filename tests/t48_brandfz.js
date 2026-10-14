// برندهای هم‌نام با املای نزدیک («هوگو بوس» = «هوگو باس») یک برند می‌شوند؛ برندهای متفاوت یکی نمی‌شوند
global.window=global;
var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function T(c,m,x){if(c)ok++;else{bad++;console.log('FAIL',m,x===undefined?'':JSON.stringify(x))}}
var id=0;function it(t,price,o){o=o||{};return {id:o.id||++id,t:t,e:'',price:price,img:'',st:0,b:o.b||[]}}
var db=C.newDb(),idx=C.dbIndex(db);
C.ingest(db,idx,'liliome',[
 it('عطر ادکلن هوگو بوس بوتلد مردانه ادو تویلت 100 میل',3000000,{b:['هوگو بوس']}),
 it('عطر ادکلن هوگو باس بوتلد نایت مردانه ادو تویلت 100 میل',3100000,{b:['هوگو باس']}),
 it('عطر ادکلن هوگو باس ایر مردانه ادو تویلت 100 میل',3200000,{b:[]}),                // بدون دسته‌ی برند
 it('عطر ادکلن ارمانو سروینو گلم زنانه ادو پرفیوم 100 میل',3300000,{b:[]}),           // برند دیگر؛ آرمانی نیست
 it('عطر ادکلن زاکوتا الف مردانه ادو تویلت 100 میل',3400000,{b:['زاکوتاس']}),
 it('عطر ادکلن زاکوتیس ب مردانه ادو تویلت 100 میل',3500000,{b:['زاکوتیس']}),           // دو برندِ ناشناخته با املای نزدیک
 it('عطر ادکلن جاکوتا ج مردانه ادو تویلت 100 میل',3600000,{b:['جاکوتاس']}),            // برندِ دیگر (حرفِ اول فرق دارد)
],true);
db.t.liliome=Date.now();
var l=C.buildList(db,['liliome'],{},0),tr=C.tree(l,'fa',db.wd);
var names=tr.map(function(b){return b.name});
var boss=tr.filter(function(b){return /بوس/.test(b.name)});
T(boss.length===1,'هوگو بوس و هوگو باس یک برند',names);
T(boss.length&&boss[0].models.length===3,'سه مدل زیر یک برند',boss.length&&boss[0].models.map(function(m){return m.name}));
T(!tr.some(function(b){return /باس/.test(b.name)}),'برندِ جدایی با «باس» نیست',names);
var arm=tr.filter(function(b){return b.name==='جورجیو آرمانی'});
T(!arm.length,'ارمانو سروینو آرمانی نشد',names);
var zk=tr.filter(function(b){return /زاکوتا/.test(b.name)});
T(zk.length===1&&zk[0].models.length===2,'زاکوتاس و زاکوتیس یک برند با دو مدل',zk.map(function(b){return b.name+':'+b.models.length}));
T(names.indexOf('جاکوتاس')>=0,'جاکوتاس برندِ جدا ماند',names);
console.log(ok,'pass',bad,'fail');
