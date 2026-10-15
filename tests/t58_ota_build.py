import subprocess,re,json,sys,os,tempfile,shutil
R='/home/claude/PerfumePrice'
W=R+'/app/src/main/assets/www'
OK=[];BAD=[]
def chk(n,c,i=''):
    (OK if c else BAD).append(n); print(('PASS ' if c else 'FAIL ')+n+(' '+str(i)[:300] if i!='' else ''))
rd=lambda p: open(p,encoding='utf-8').read()
app=rd(W+'/app.js'); vj=json.loads(rd(W+'/version.json')); gr=rd(R+'/app/build.gradle'); ota=rd(R+'/app/src/main/java/ir/perfume/price/Ota.java'); wf=rd(R+'/.github/workflows/build.yml'); ch=rd(R+'/CHANGELOG.md')
mv=re.search(r"var VERSION = '([0-9.]+)'",app).group(1)
chk('نسخه در app.js، version.json و build.gradle یکی است (%s)'%mv,vj['v']==mv and re.search(r"versionName '%s'"%re.escape(mv),gr) is not None,(mv,vj))
chk('api در version.json همان NATIVE_API در Ota.java است',vj['api']==int(re.search(r'NATIVE_API = (\d+)',ota).group(1)),vj)
chk('CHANGELOG برای این نسخه بخش دارد',('نسخه ۱.۳۲' in ch) if mv=='1.32' else (mv in ch))
chk('گردش‌کار CI بسته‌ی بی‌نصب را می‌سازد و در Release می‌گذارد',('make-ota.sh' in wf) and ('ota/www.zip' in wf) and ('ota/ota.json' in wf))
chk('CI اسکریپتی که تست می‌شود را اجرا می‌کند (همان فرمان)',os.path.isfile(R+'/tools/make-ota.sh') and os.access(R+'/tools/make-ota.sh',os.X_OK))
# برنامه فقط فایل‌های مجاز را می‌پذیرد؛ خود پوشه‌ی www باید همین‌ها را داشته باشد
allowed=re.compile(r'^[A-Za-z0-9_][A-Za-z0-9_./-]{0,119}\.(html|js|css|json|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|txt)$')
files=[os.path.relpath(os.path.join(d,f),W) for d,_,fs in os.walk(W) for f in fs]
chk('همه‌ی فایل‌های www برای بسته مجازند',all(allowed.match(f) for f in files),[f for f in files if not allowed.match(f)])
# هیچ آدرس مطلقِ file:///android_asset در صفحه‌ها نیست (از پوشه‌ی دیگر باز می‌شوند)
bad=[f for f in files if f.endswith(('.html','.js')) and 'file:///android_asset' in rd(os.path.join(W,f))]
chk('صفحه‌ها آدرس مطلقِ android_asset ندارند (از پوشه‌ی بسته هم باز می‌شوند)',not bad,bad)
# ساخت بسته با همان فرمانِ CI و آزمایش جاوا
tmp=tempfile.mkdtemp(); out=tmp+'/ota'; jo=tmp+'/j'; os.makedirs(jo)
r=subprocess.run(['bash',R+'/tools/make-ota.sh',W,out,'777'],capture_output=True,text=True)
chk('make-ota.sh بسته می‌سازد',r.returncode==0 and os.path.isfile(out+'/www.zip') and os.path.isfile(out+'/ota.json'),r.stdout+r.stderr)
j=json.loads(rd(out+'/ota.json')) if os.path.isfile(out+'/ota.json') else {}
chk('ota.json: code,v,api,size,sha',j.get('code')==777 and j.get('v')==mv and j.get('api')==vj['api'] and j.get('size')==os.path.getsize(out+'/www.zip') and len(j.get('sha',''))==64,j)
# اسکریپت باید نسخه‌ی بد، فایل ممنوع و شماره‌ی بد را رد کند

r=subprocess.run(['bash',R+'/tools/make-ota.sh',W,tmp+'/o3','abc'],capture_output=True,text=True)
chk('شماره‌ی ساخت نامعتبر رد می‌شود',r.returncode!=0)
# ---- نسخه‌ها و سقف‌ها: یک پروژه‌ی کوچک با همان چیدمان می‌سازیم و هر بار یک چیز را خراب می‌کنیم
def mini(tag):
    base=tmp+'/mini_'+tag; shutil.copytree(W,base+'/app/src/main/assets/www')
    os.makedirs(base+'/app/src/main/java/ir/perfume/price')
    shutil.copy(R+'/app/build.gradle',base+'/app/build.gradle')
    shutil.copy(R+'/app/src/main/java/ir/perfume/price/Ota.java',base+'/app/src/main/java/ir/perfume/price/Ota.java')
    return base,base+'/app/src/main/assets/www'
def run(www,o): return subprocess.run(['bash',R+'/tools/make-ota.sh',www,tmp+'/'+o,'5'],capture_output=True,text=True)
base,www=mini('ok'); r=run(www,'m_ok')
chk('پروژه‌ی کوچک سالم: ساخته می‌شود',r.returncode==0,r.stdout+r.stderr)
base,www=mini('evil'); open(www+'/evil.exe','w').write('x'); r=run(www,'m_evil')
chk('فایل ممنوع در www → ساخت رد می‌شود',r.returncode!=0 and 'not allowed' in r.stdout,r.stdout+r.stderr)
base,www=mini('nov'); os.remove(www+'/version.json'); r=run(www,'m_nov')
chk('بدون version.json رد می‌شود',r.returncode!=0,r.stdout+r.stderr)
bw=tmp+'/bw_only'; shutil.copytree(W,bw); r=subprocess.run(['bash',R+'/tools/make-ota.sh',bw,tmp+'/o2','5'],capture_output=True,text=True)
chk('فقط پوشه‌ی www (بدون build.gradle و Ota.java کنارش) → رد؛ بررسی نسخه بی‌صدا رد نمی‌شود',r.returncode!=0 and 'cannot find' in r.stdout,r.stdout+r.stderr)
base,www=mini('nm'); open(www+'/'+('a'*118)+'.js','w').write('x'); r=run(www,'m_nm')
chk('نام فایلِ ۱۲۱ حرفی (بلندتر از قاعده‌ی برنامه) → رد',r.returncode!=0 and 'longer than 120' in r.stdout,r.stdout+r.stderr)
base,www=mini('nm2'); open(www+'/'+('a'*117)+'.js','w').write('x'); r=run(www,'m_nm2')
chk('نام فایلِ ۱۲۰ حرفی هنوز مجاز است',r.returncode==0,r.stdout+r.stderr)
base,www=mini('gv'); g=rd(base+'/app/build.gradle'); open(base+'/app/build.gradle','w',encoding='utf-8').write(g.replace("versionName '%s'"%mv,"versionName '9.99'")); r=run(www,'m_gv')
chk('versionName با version.json نمی‌خواند → رد',r.returncode!=0 and 'versionName' in r.stdout,r.stdout+r.stderr)
base,www=mini('av'); a2=rd(www+'/app.js'); open(www+'/app.js','w',encoding='utf-8').write(a2.replace("var VERSION = '%s'"%mv,"var VERSION = '9.98'",1)); r=run(www,'m_av')
chk('VERSION در app.js با version.json نمی‌خواند → رد',r.returncode!=0 and 'VERSION' in r.stdout,r.stdout+r.stderr)
base,www=mini('na'); o2=rd(base+'/app/src/main/java/ir/perfume/price/Ota.java'); open(base+'/app/src/main/java/ir/perfume/price/Ota.java','w',encoding='utf-8').write(re.sub(r'NATIVE_API = \d+;','NATIVE_API = 77;',o2)); r=run(www,'m_na')
chk('api با NATIVE_API در Ota.java نمی‌خواند → رد',r.returncode!=0 and 'NATIVE_API' in r.stdout,r.stdout+r.stderr)
base,www=mini('dd'); open(www+'/a..b.js','w').write('x'); r=run(www,'m_dd')
chk('نام فایل با «..» → رد (همان قاعده‌ی برنامه)',r.returncode!=0 and '..' in r.stdout,r.stdout+r.stderr)
base,www=mini('many')
for i in range(205): open(www+'/f%d.js'%i,'w').write('1')
r=run(www,'m_many'); chk('بیش از ۲۰۰ فایل → رد',r.returncode!=0 and 'too many' in r.stdout,r.stdout+r.stderr)
base,www=mini('big'); open(www+'/big.js','wb').write(b'\0'*(13*1024*1024)); r=run(www,'m_big')
chk('فایل بزرگ‌تر از ۱۲ مگابایت (بازشده) → رد',r.returncode!=0 and 'too big' in r.stdout,r.stdout+r.stderr)
base,www=mini('tot')
for i in range(3): open(www+'/t%d.js'%i,'wb').write(b'\0'*(9*1024*1024))
r=run(www,'m_tot'); chk('جمعِ بازشده بیش از ۲۴ مگابایت → رد',r.returncode!=0 and 'unpacks too big' in r.stdout,r.stdout+r.stderr)
base,www=mini('case'); open(www+'/Index.html','w').write('x'); r=run(www,'m_case')
chk('نام‌های تکراری با حروف بزرگ/کوچک → رد',r.returncode!=0 and 'duplicate' in r.stdout,r.stdout+r.stderr)
import re as _re
m=_re.search(r'grep -q "([^"\n]*GITHUB_RUN_NUMBER[^"\n]*)" ',wf)
chk('CI همخوانی versionCode (RUN_NUMBER + 100) با build.gradle را می‌سنجد و برای build.gradle واقعی درست است',m is not None and m.group(1) in gr,(m.group(1) if m else None))
cl=[l for l in wf.splitlines() if 'gh release create' in l]; ul=[l for l in wf.splitlines() if 'gh release upload latest' in l]
chk('CI: ota.json بعد از ساخت Release و www.zip بارگذاری می‌شود (گوشی نیمه‌کاره نمی‌بیند)',len(cl)==1 and len(ul)==1 and 'ota.json' not in cl[0] and 'www.zip' in cl[0] and 'ota.json' in ul[0] and wf.index(cl[0])<wf.index(ul[0]),(cl,ul))
chk('CI آزمایش جاوا را روی بسته‌ی ساخته‌شده اجرا می‌کند',('OtaTest' in wf) and ('javac' in wf) and wf.index('make-ota.sh')<wf.index('OtaTest')<wf.index('gh release create'),'')
J=R+'/app/src/main/java/ir/perfume/price/'; T=R+'/tests/java/ir/perfume/price/'
c=subprocess.run(['javac','-encoding','UTF-8','-d',jo,J+'Ota.java',J+'OtaGuard.java',T+'OtaTest.java',T+'GuardTest.java'],capture_output=True,text=True)
chk('Ota.java، OtaGuard.java و آزمایش‌هایشان کامپایل می‌شود',c.returncode==0,c.stderr[-400:])
chk('CI هر دو آزمایش جاوا (OtaTest و GuardTest) را کامپایل و اجرا می‌کند',all(x in wf for x in ('OtaGuard.java','GuardTest.java','ir.perfume.price.GuardTest','ir.perfume.price.OtaTest')),'')
if c.returncode==0:
    r=subprocess.run(['java','-Dstdout.encoding=UTF-8','-cp',jo,'ir.perfume.price.OtaTest',W,out],capture_output=True,text=True,timeout=120)
    lines=[l for l in r.stdout.splitlines() if l.startswith(('PASS','FAIL'))]
    fails=[l for l in lines if l.startswith('FAIL')]
    last=[l for l in r.stdout.splitlines() if 'pass' in l and 'fail' in l][-1:] 
    chk('آزمایش‌های جاوای بسته‌ی بی‌نصب (%s)'%(last[0] if last else '?'),r.returncode==0 and not fails and len(lines)>60,fails[:3])
    r=subprocess.run(['java','-Dstdout.encoding=UTF-8','-cp',jo,'ir.perfume.price.GuardTest'],capture_output=True,text=True,timeout=120)
    lines=[l for l in r.stdout.splitlines() if l.startswith(('PASS','FAIL'))]
    fails=[l for l in lines if l.startswith('FAIL')]
    last=[l for l in r.stdout.splitlines() if 'pass' in l and 'fail' in l][-1:]
    chk('آزمایش‌های ناظر (مهلت‌ها، برگشت، گزارش کهنه، پس‌زمینه) (%s)'%(last[0] if last else '?'),r.returncode==0 and not fails and len(lines)>25,fails[:3])
shutil.rmtree(tmp,ignore_errors=True)
print(len(OK),'pass',len(BAD),'fail',BAD)
