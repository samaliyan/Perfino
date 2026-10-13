global.window=global;var C=require('../app/src/main/assets/www/core.js');
var ok=0,bad=0;function chk(n,c,i){if(c)ok++;else{bad++;console.log('FAIL',n,i===undefined?'':JSON.stringify(i))}}
function key(t){var p=C.parseTitle(t+' 100 میل');return p&&p.key.join(' ')}
var T=[
 ['ادکلن دیور ساواج ادو پرفیوم 2025 2026 اصل','دیور ساواج'],
 ['ادکلن ورساچه اروس ۲۰۲۵ - ۲۰۲۴ اورجینال','ورساچه اروس'],
 ['عطر شنل بلو دو شنل نسخه جدید 2024 ویژه','شنل بلو دو شنل'],
 ['ادکلن گوچی بلوم - کد 12345 - ارسال رایگان','گوچی بلوم'],
 ['عطر ادکلن تام فورد بلک ارکید (جدید) پرفروش ترین','تام فورد بلک ارکید'],
 ['ادکلن بولگاری من ان بلک batch 2023','بولگاری من ان بلک'],
 ['ادکلن آمواج اینترلود مردانه نیش ۱۴۰۴','امواج اینترلود'],
 ['ادکلن تام فورد AB12345 اوود وود','تام فورد اوود وود'],
 ['ادکلن تام فورد SKU: TF-2201 اوود وود','تام فورد اوود وود'],
 ['ادکلن لانکوم ایدول 1234567890123 بارکد','لانکوم ایدول'],
 // اسم‌های واقعی که عدد دارند باید بمانند
 ['ادکلن میس دیور ۱۹۴۷','میس دیور 1947'],
 ['ادکلن سروتی 1881 مردانه','سروتی 1881'],
 ['ادکلن شنل نامبر 5','شنل نامبر 5'],
 ['ادکلن کارولینا هررا 212 ادو تویلت','کارولینا هررا 212']
];
T.forEach(function(x){var k=key(x[0]);chk(x[0],k===x[1],k)});
// عنوانی که بعد از پالایش بی‌معنی است
chk('only years/codes => rejected',key('عطر 2025 2026 کد 123456')===null,key('عطر 2025 2026 کد 123456'));
chk('single persian letters dropped',(key('ادکلن دیور ب ساواج')||'')==='دیور ساواج',key('ادکلن دیور ب ساواج'));
// پالایش دو نسخه‌ی یک عطر → یک کلید
chk('with/without year same key',key('ادکلن دیور ساواج 2025')===key('ادکلن دیور ساواج'));
// نام برند
chk('brand name cleaned',C.cleanBrandName('Dior 2025 جدید')==='Dior',C.cleanBrandName('Dior 2025 جدید'));
chk('brand name keeps real',C.cleanBrandName('Louis Vuitton')==='Louis Vuitton');
chk('brand hint junk only => other',(function(){var e=C.brandOf(['زرزر','x'],['عطر 2025 ویژه']);return e.id==='other'})());
console.log(ok,'ok',bad,'bad');process.exit(bad?1:0)
