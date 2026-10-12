var C=require('../app/src/main/assets/www/core.js'),ok=0,bad=0;
function eq(a,b,m){if(JSON.stringify(a)===JSON.stringify(b))ok++;else{bad++;console.log('FAIL',m,JSON.stringify(a),'!=',JSON.stringify(b))}}
var n=function(s){return C.normFa(s).split(' ')};
eq(C.fa2en(n('ساواج الکسیر'),null),'Sauvage Elixir','dict words');
eq(C.fa2en(n('وان میلیون'),null),'One Million','phrase');
eq(C.fa2en(n('بلو دو'),null),'Bleu de','small word lower');
eq(C.en2fa(['good','girl','gone','bad'],null),'گود گرل گان بد','en phrase → fa');
eq(C.en2fa(['black','orchid'],null)!=='' ,true,'en→fa nonempty');
eq(C.slug,undefined,'-');
eq(C.enTokens('Dior Sauvage Eau de Parfum For Men 100ml'),['dior','sauvage'],'enTokens');
eq(C.enTokens("Guerlain L'Homme Ideal EDT 50 ml"),['guerlain','lhomme','ideal'],'apostrophe joined');
eq(C.titleEn(["l'homme",'ideal','pour','homme','de','marly']),"L'Homme Ideal Pour Homme de Marly",'title case');
// ingest: نام انگلیسی از سایت + یادگیری واژه
var db=C.newDb(),idx=C.dbIndex(db);
C.ingest(db,idx,'digikala',[
 {id:1,t:'عطر ادکلن دیور مدل ساواج مردانه ادوپرفیوم 100 میل',e:'Dior Sauvage Eau de Parfum for Men 100ml',price:9000000,img:'',st:0,b:['Dior']},
 {id:2,t:'عطر ادکلن دیور مدل فارنهایت مردانه ادوتویلت 100 میل',e:'Dior Fahrenheit EDT 100ml',price:7000000,img:'',st:0,b:['Dior']},
 {id:3,t:'عطر ادکلن لوئی ویتون اوراژ مردانه ادوپرفیوم 100 میل',e:'Louis Vuitton Orage 100ml',price:19000000,img:'',st:0,b:['Louis Vuitton']},
 {id:4,t:'عطر ادکلن کیلیان لاو دانت بی شای زنانه ادوپرفیوم 50 میل',e:'',price:9500000,img:'',st:0,b:['Kilian']}],true);
db.t.digikala=Date.now();
var L=C.buildList(db,['digikala'],{digikala:1},0);
var T=C.tree(L,'en',db.wd), F=C.tree(L,'fa',db.wd);
var nm=function(t){return t.map(function(b){return b.name+':'+b.models.map(function(m){return m.name}).join(',')})};
console.log(nm(T)); console.log(nm(F));
eq(T.some(function(b){return b.name==='Dior'&&b.models.some(function(m){return m.name==='Sauvage'})}),true,'Dior/Sauvage from site English');
eq(T.some(function(b){return b.name==='Dior'&&b.models.some(function(m){return m.name==='Fahrenheit'})}),true,'Fahrenheit');
eq(T.some(function(b){return b.name==='Kilian'&&b.models.some(function(m){return /Love Don/.test(m.name)})}),true,'dictionary-made English');
eq(db.wd['اوراژ']&&db.wd['اوراژ'].orage,1,'learned pair اوراژ=orage');
eq(T.map(function(b){return b.id}).sort(),F.map(function(b){return b.id}).sort(),'same brand ids in both languages');
eq(T.map(function(b){return b.models.map(function(m){return m.id}).sort().join()}).sort(),F.map(function(b){return b.models.map(function(m){return m.id}).sort().join()}).sort(),'same model ids');
// واژه یادگرفته در نام‌سازی
var lex={'اوراژ':{orage:2}}; eq(C.fa2en(['اوراژ'],lex),'Orage','learned used');
eq(C.fa2en(['اوراژ'],null)!=='Orage',true,'unknown without lexicon is transliterated');
// برندهای فهرست: نام انگلیسی لاتین دارند
var bl=require('fs').readFileSync('../app/src/main/assets/www/core.js','utf8');
console.log(ok+' passed, '+bad+' failed'); process.exit(bad?1:0);
