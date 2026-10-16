<div align="center">

# PerfumePrice · قیمت عطر

**A lightweight Android price list for perfume shops — one clean, alphabetical price per perfume, collected automatically from Iranian online stores.**

**برنامهٔ اندروید سبک برای عطرفروشی‌ها؛ فهرست الفبایی عطرها با یک قیمت روز، جمع‌آوری‌شده خودکار از فروشگاه‌های اینترنتی ایران.**

[English](#english) · [فارسی](#فارسی) · [Changelog](CHANGELOG.md) · [Download APK](https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk)

</div>

---

<a name="english"></a>

# English

## What it is

PerfumePrice is a single-purpose Android app built for a perfume shop owner who needs to know "what is this perfume selling for today?" without opening four websites. It reads public product listings from several online stores, cleans and merges them, and shows a **single price per perfume and size**, organized **brand → perfume → variant → size** in alphabetical order.

There is **no server and no account**. Everything — fetching, cleaning, matching, storage and the interface — runs on the phone inside a WebView, using the files in `app/src/main/assets/www`.

## Features

### Prices
- **One price per perfume and size**, merged from several stores, with outlier prices (wrong units, ×10 errors, mismatched sizes) detected and discarded.
- **Four sources**, each of which can be switched on or off in Settings: Liliome, Digikala, Safir Stores and Hiland Beauty.
- **Automatic refresh** (off / 15 min / 30 min / 1 h / …), a light "prices only" mode for quick updates and a full mode that re-reads titles and images.
- **Stale data is never shown as fresh**: the top indicator turns red and the list says how old the prices are.

### Market report
Every full refresh stores a small snapshot of prices and availability. The **Market report** screen turns that history into practical shop intelligence:

| Section | What it tells you |
|---|---|
| Price gaps between stores | The same perfume is much cheaper in one store than another — a buying opportunity or a wrong price worth checking |
| Got more expensive | Price rose by 8 % or more within 30 days, with old and new price |
| Got cheaper | Price fell by 8 % or more within 30 days |
| Gone from stores | Not found in any store any more, with its last known price |
| Back in stock | Was gone for a while and has returned |
| Getting scarce | Fewer stores carry it than before |
| New on the market | Appeared for the first time in the last 7 days |

False alarms are suppressed on purpose: an item is "gone" only after it is missing twice at least 30 minutes apart; a sudden disappearance of more than 40 % of the catalogue is treated as a fetch error; switching a source on or off restarts the comparison; and entries unseen for 60 days are dropped.

### Name quality
Online-shop titles are messy. A multi-stage pipeline keeps the list clean:
- **Name vetting** rejects titles that contain phone numbers, prices, contact text (Instagram, WhatsApp …) or known clone-maker names.
- **Persian ⇄ Latin merging** — "ورساچه اروس" and "Versace Eros" end up as one perfume.
- **Brand recognition** for 180+ brands plus a *product line → brand* table (so "Pour Un Homme" lands under Caron, not under "Other brands").
- **Concentration and gender** (EDP / EDT / Parfum, men / women / unisex) are detected and kept as variants.
- **Your own control**: *blocked words* (anything containing them never enters the list and is removed immediately) and *hide this perfume* for single bad entries.

### Everyday use
- **Speak the name**: a big bottom bar has a “Speak” button (the phone's own speech recognition, Persian). It never opens a perfume by itself: it shows big photo cards of the closest names (the best guess marked) so the person looks at the picture, taps it, and lands on the prices; Back returns to the same list. If the name is not in the phone's list, the app asks the four shops' own search and shows what they sell.
- **Search** in Persian or English, with partial words and similar spellings (the same photo cards; “not these? search the shops” for names the phone's list does not have). Search shows the last perfumes you looked at.
- **Shop list** (★) is a separate page with its own button in the bottom bar (not part of search): star a perfume on its price page to keep a personal shortlist.
- **Four list styles**, light / dark / automatic theme, Persian or English names, and **four text sizes** (they scale the whole app: lists, prices and the letter strip) for easier reading.
- **Per-brand switches** to hide brands you do not sell (their images are not downloaded either).
- **Product photos** cached on the device, with a drawn bottle as fallback.

### Updates
- **Updates without installing.** All screens and logic live in `assets/www`, so a normal update downloads only those files (about 115 KB, `www.zip` + `ota.json` in the `latest` release), checks size and SHA-256, and stores them in the app's own folder. Nothing is installed, so Android and Google Play Protect show no “Install anyway” question. If the new files do not start (no “I am alive” signal after a clean start, or three failed starts in a row), the app returns by itself to the previous working files, or to the version inside the APK. If there is no internet, the update is simply postponed; the APK flow is never started just because the check failed.
- A full APK is needed only when the Java part changes (`api` in `www/version.json` is higher than `NATIVE_API` in `Ota.java`); then the old flow is used (download, confirm, install, and Play Protect may ask).
- **No button, no question.** The app checks by itself when it opens and about every 20 minutes while it stays open, downloads silently, and restarts its own page when the person is idle (nothing open, no touch for 15 seconds, prices not loading). Settings only shows a short status line; a “check now” button and an on/off switch exist only under Advanced settings (for the developer).
- If an APK is ever needed, a single card with one button (“Install”) appears when the person is idle; the Android system may still ask once. The app itself never mentions “Install anyway”.

## Install

1. On the phone, open this link:

   ```
   https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk
   ```
2. Download the file and open it.
3. If Android asks, allow installing apps from this source.
4. Tap **Install**.

Requires **Android 7.0 (API 24)** or newer with a reasonably current Android System WebView (Chrome 62 or newer) and an internet connection for updates. The first launch downloads the catalogue and photos; later launches open instantly from stored data and refresh in the background.

## Build from source

No local Android SDK is needed — GitHub Actions builds the APK.

1. Push the repository to GitHub.
2. Open the **Actions** tab, choose **Build APK**, press **Run workflow** (it also runs on every push to the main branches).
3. The release named `latest` is replaced with the new APK, and the app's self-updater picks it up.

Or open the folder in **Android Studio** and run **Build → Build APK(s)**. Version name is in `app/build.gradle`, version code comes from the CI run number.

## Project structure

```
app/src/main/assets/www/
  core.js      fetching, name parsing, cleaning, merging, pricing, history, report logic
  app.js       user interface, settings, search, updates, market report screen
  index.html   layout and styles
app/src/main/java/ir/perfume/price/
  MainActivity.java   WebView host, HTTP bridge, image cache
  Updater.java        in-app update (check, download with progress, install)
tests/                automated tests (Node and Playwright)
```

## If a store changes its website

All site-reading logic is in `core.js`; the list of stores is the `SOURCES` array at the end of the file. In the app: **Settings → Copy error report** and send the text to the developer.

## Tests

The tests use synthetic fixtures (the real shops are not contacted):

```bash
node tests/gen.js              # generate fixtures
node tests/t35_vet.js          # name vetting, brand and line recognition
node tests/t37_hist.js         # price and availability history logic
python3 tests/t36_features.py  # search, shop list, hide, blocked words, text size
python3 tests/t60_report3.py   # خبر و گزارش بازار (خبر ساختگی، سه برگه، عکس، برگشت)
python3 tests/t61_news.py      # خواندن خبر از وردپرس/RSS (در مرورگر؛ t61_news.js در Node)
python3 tests/t62_viewer_sync.py  # کشیدن عکس به چپ/راست، منو هم همراهش
python3 tests/t63_search_ui.py    # کارت‌های عکس‌دار، برگشت به لیست، لیست مغازه، گفتن، جستجو در سایت‌ها
node tests/t64_core_fixes.js        # تاریخچه (برند/مدل)، قیمت جستجوی زنده، دیجی‌کالا
python3 tests/t64_review_fixes.py   # نمایش بیشتر، کش مقایسه، لمس دوباره، خبرِ سایتِ ناموفق
python3 tests/t65_update_rules.py   # بروزرسانی: گیر کردن روی بارگذاری، خواندنِ لیست، «بعداً» ماندگار، خطای دیررسیده
python3 tests/t3_flow.py       # full refresh flow
```

Python tests need Playwright with Chromium. `Ota.java`, `OtaGuard.java` and `Http.java` (no Android dependency) are unit-tested with the JDK in CI (`tests/java/`); `MainActivity.java` and `Updater.java` are only compiled by CI.

## Known limitations

- Prices are read from public pages; a store can change its layout or block requests at any time.
- Clone products without a recognizable maker word in the title cannot be detected automatically — use *blocked words* or *hide*.
- Stores do not publish exact stock counts; "getting scarce" is based on how many stores carry an item.
- Market-report history starts on the day the feature is installed.

---

<div dir="rtl">

<a name="فارسی"></a>

# فارسی

## این برنامه چیست؟

«قیمت عطر» یک برنامهٔ اندروید با یک کار مشخص است: عطرفروش بدون باز کردن چند سایت بفهمد **امروز هر عطر چند می‌فروشد**. برنامه فهرست محصولات چند فروشگاه اینترنتی را می‌خواند، پالایش و یکی می‌کند و برای هر عطر و هر اندازه **فقط یک قیمت** نشان می‌دهد؛ به ترتیب الفبا و به شکل **برند، عطر، نسخه، اندازه**.

برنامه **سرور و حساب کاربری ندارد**. دریافت اطلاعات، پالایش نام‌ها، ذخیره‌سازی و ظاهر برنامه، همه روی خود گوشی و داخل WebView انجام می‌شود.

## امکانات

### قیمت‌ها
- **یک قیمت برای هر عطر و اندازه**، ترکیب‌شده از چند فروشگاه. قیمت‌های غیرعادی (واحد اشتباه، ده‌برابر، اندازهٔ نامطابق) شناسایی و کنار گذاشته می‌شوند.
- **چهار منبع** که هرکدام را در تنظیمات می‌توان روشن یا خاموش کرد: لیلیوم، دیجی‌کالا، سفیر و هایلند.
- **بروزرسانی خودکار** (خاموش، ۱۵ دقیقه، ۳۰ دقیقه، ۱ ساعت و …)، حالت سبک «فقط قیمت» برای بروزرسانی سریع و حالت کامل برای خواندن دوبارهٔ نام‌ها و عکس‌ها.
- **قیمت قدیمی هرگز تازه نشان داده نمی‌شود**: نشانگر بالا قرمز می‌شود و سن قیمت‌ها نوشته می‌شود.

### خبر و گزارش بازار
صفحهٔ **خبر و گزارش بازار** (دکمهٔ روزنامه، بالای صفحه) سه برگه دارد و در هر ردیف **عکس عطر** هست:

- **خبر**: تیترهای امروز (چند عطر ارزان یا گران شد، تازه آمد، دوباره موجود شد، ناموجود شد؛ هر کدام با یک لمس به فهرستش می‌رود)، **خبرهای تازهٔ مجلهٔ فروشگاه‌ها** (لیلیوم، سفیر، هایلند و مقالات عطرِ مجلهٔ دیجی‌کالا؛ با لمس در مرورگر باز می‌شود، خودش هر چند ساعت تازه می‌شود و نقطهٔ قرمز کنار دکمه یعنی خبرِ نادیده)، تازه‌های بازار و بهترین فرصت‌های خرید.
- **قیمت‌ها**: ارزان شده‌اند، گران شده‌اند، دوباره موجود، تازه، ناموجود و موجودی کم، با قیمتِ «قبلاً» و «الان» و نمودار کوچک.
- **مقایسه**: نتیجه‌ی آماده (ارزان‌ترین فروشگاه، صرفه‌جویی کل، گران‌ترین و ارزان‌ترین برند)، مقایسهٔ فروشگاه‌ها با هم و «کدام عطر را از کجا بخرم؟» با فیلتر جنسیت و ترتیب.

لمس هر ردیف صفحهٔ قیمتِ همان عطر را روی گزارش باز می‌کند و «برگشت» به همان جای گزارش برمی‌گردد.

| بخش | چه می‌گوید |
|---|---|
| اختلاف قیمت بین فروشگاه‌ها | یک عطر در یک فروشگاه خیلی ارزان‌تر از فروشگاه دیگر است؛ یا فرصت خرید است یا قیمتِ اشتباه که باید چک شود |
| گران شده‌اند | قیمت در ۳۰ روز اخیر دست‌کم ۸٪ بالا رفته؛ قیمت قبلی و فعلی نوشته می‌شود |
| ارزان شده‌اند | قیمت در ۳۰ روز اخیر دست‌کم ۸٪ پایین آمده |
| ناموجود شده‌اند | در هیچ فروشگاهی دیده نمی‌شوند؛ آخرین قیمت هم نوشته می‌شود |
| دوباره موجود شده‌اند | مدتی نبودند و دوباره پیدا شدند |
| موجودی کم شده | تعداد فروشگاه‌هایی که آن را دارند کمتر شده |
| تازه‌های بازار | در هفتهٔ اخیر برای اولین بار دیده شده‌اند |

از هشدار دروغ عمداً جلوگیری شده است: عطر فقط وقتی «ناموجود» می‌شود که دو بار با فاصلهٔ دست‌کم نیم‌ساعت دیده نشود؛ ناپدید شدن ناگهانی بیش از ۴۰٪ فهرست، خطای دریافت حساب می‌شود؛ روشن یا خاموش کردن یک منبع، مقایسه را از نو شروع می‌کند؛ و ردیف‌هایی که ۶۰ روز دیده نشوند پاک می‌شوند.

### کیفیت نام‌ها
عنوان کالاها در فروشگاه‌های اینترنتی نامرتب است. چند مرحله پالایش، فهرست را تمیز نگه می‌دارد:
- **بازرسی نام**: عنوان‌هایی که شمارهٔ موبایل، قیمت، متن تماس (اینستاگرام، واتساپ و …) یا نام سازندگان شناخته‌شدهٔ کپی دارند رد می‌شوند.
- **یکی شدن فارسی و لاتین**: «ورساچه اروس» و «Versace Eros» یک عطر می‌شوند.
- **شناخت برند** برای بیش از ۱۸۰ برند، به‌علاوهٔ جدول «نام خط محصول به برند»؛ مثلاً «Pour Un Homme» زیر برند کارون می‌رود، نه «سایر برندها».
- **غلظت و جنسیت** (ادو پرفیوم، ادو تویلت، پارفوم؛ مردانه، زنانه، یونیسکس) تشخیص داده می‌شود و به‌عنوان نسخه‌های جدا می‌ماند.
- **کنترل با خودتان**: «واژه‌های ممنوع» (هر عنوانی که آن را داشته باشد وارد فهرست نمی‌شود و همان لحظه برداشته می‌شود). عطرهایی که قبلاً پنهان شده‌اند در تنظیمات می‌مانند و با لمس برمی‌گردند؛ دکمهٔ «پنهانش کن» از صفحهٔ قیمت برداشته شد.

### استفادهٔ روزمره
- **گفتنِ نام عطر**: در نوار بزرگ پایین دکمهٔ «بگویید» هست (تشخیص گفتار خودِ گوشی، فارسی). هیچ‌وقت بی‌خبر عطری باز نمی‌شود: **کارت‌های بزرگِ عکس‌دار** از نزدیک‌ترین نام‌ها نشان داده می‌شود (بهترین حدس علامت دارد)، کاربر عکس را می‌بیند، روی درستش می‌زند و به قیمت‌ها می‌رود؛ «برگشت» دوباره همان فهرست است. املای غلط یا نزدیک هم پیدا می‌شود، و اگر نام در فهرست گوشی نبود، برنامه از جستجوی خودِ چهار فروشگاه می‌پرسد و آنچه می‌فروشند را نشان می‌دهد.
- **جستجو** به فارسی یا انگلیسی، حتی با بخشی از نام یا املای نزدیک؛ نتیجه‌ها کارت‌های عکس‌دارِ بزرگ‌اند. اگر نام را در فهرست گوشی پیدا نکرد، دکمهٔ «در سایت‌ها هم بگرد» (و برای نتیجهٔ خالی، خودکار) از فروشگاه‌ها می‌پرسد.
- **لیست مغازه** (ستاره): صفحهٔ جدا با دکمهٔ خودش در نوار پایین، نه بخشی از جستجو. در صفحهٔ قیمتِ هر عطر «افزودن به لیست مغازه» را بزنید.
- **چهار شکل فهرست**، پوستهٔ روشن، تاریک یا خودکار، نام‌ها به فارسی یا انگلیسی و **چهار اندازهٔ نوشته** (روی کل برنامه اثر می‌کند: فهرست، قیمت و ستون حروف) برای خواندن راحت‌تر.
- **خاموش کردن برند**: برندهایی که نمی‌فروشید دیده نمی‌شوند و عکسشان هم دانلود نمی‌شود.
- **عکس محصول** روی گوشی نگه‌داری می‌شود و اگر نبود، یک بطری ترسیمی جایگزین می‌شود.

### به‌روزرسانی خود برنامه
- **بروزرسانی بدون نصب:** همه‌ی رابط و منطق برنامه در `assets/www` است؛ پس بروزرسانیِ معمولی فقط همان فایل‌ها (حدود ۱۱۵ کیلوبایت: `www.zip` و `ota.json` در Release با برچسب `latest`) را می‌گیرد، اندازه و SHA-256 را بررسی می‌کند و در پوشه‌ی خودِ برنامه می‌گذارد. چیزی نصب نمی‌شود، پس اندروید و Play Protect پنجره‌ی «Install anyway» نشان نمی‌دهند. اگر فایل‌های تازه سالم بالا نیایند (بدون خطا و با فهرستِ کشیده‌شده)، برنامه خودش به فایل‌های سالمِ قبلی و در نبودِ آن به نسخه‌ی داخل APK برمی‌گردد. اگر اینترنت نباشد، بروزرسانی فقط عقب می‌افتد و هرگز به‌خاطر ناموفق بودن بررسی، فایل APK دانلود نمی‌شود.
- فقط وقتی بخش جاوا عوض شود (عدد `api` در `www/version.json` بالاتر از `NATIVE_API` در `Ota.java`) هنوز فایل APK لازم است؛ آن‌وقت همان روش قبلی (دانلود، تأیید، نصب) اجرا می‌شود و Play Protect ممکن است بپرسد.
- **بدون دکمه و بدون پرسیدن:** برنامه هنگام باز شدن و هر حدود ۲۰ دقیقه (تا وقتی باز است) خودش نسخهٔ جدید را می‌پرسد، بی‌صدا می‌گیرد و وقتی کاربر کاری نمی‌کند (چیزی باز نیست، ۱۵ ثانیه دست نزده، قیمت‌ها در حال گرفتن نیست) صفحه را با فایل‌های تازه از نو باز می‌کند و بعدش یک پیام کوتاه «برنامه بروز شد» می‌دهد. در تنظیمات فقط یک خط وضعیت هست؛ دکمهٔ «همین حالا بپرس» و کلید خاموش/روشن فقط در تنظیمات پیشرفته (برای سازنده) است.
- اگر روزی نصب APK لازم شود، فقط یک کارت با یک دکمهٔ «نصب» وقتی کاربر بیکار است نشان داده می‌شود (اندروید ممکن است یک بار تأیید بخواهد). خودِ برنامه هیچ‌جا «Install anyway» نمی‌نویسد و راهنمایی برایش لازم نیست.
- قاعده‌ی کار برای سازنده: اگر صفحه‌ها به تابع تازه‌ای در جاوا نیاز دارند، هم `NATIVE_API` و هم `api` در `version.json` را با هم بالا ببرید؛ وگرنه فقط فایل‌های وب را عوض کنید و بسته‌ی بی‌نصب خودکار ساخته می‌شود.

## نصب

1. روی گوشی این نشانی را باز کنید:

   ```
   https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk
   ```
2. فایل را دانلود و باز کنید.
3. اگر اندروید پرسید، نصب برنامه از این منبع را اجازه بدهید.
4. دکمهٔ «نصب» را بزنید.

برنامه به **اندروید ۷ (API 24)** یا بالاتر و یک Android System WebView نسبتاً به‌روز (Chrome 62 یا جدیدتر) نیاز دارد. اینترنت برای بروزرسانی لازم است. بار اول، فهرست و عکس‌ها دانلود می‌شود؛ دفعه‌های بعد برنامه فوری از اطلاعات ذخیره‌شده باز می‌شود و در پس‌زمینه بروز می‌شود.

## ساخت از روی سورس

نیازی به Android SDK روی کامپیوتر نیست؛ گیت‌هاب (GitHub Actions) فایل APK را می‌سازد.

1. مخزن را در گیت‌هاب بگذارید.
2. به تب Actions بروید، «Build APK» را انتخاب کنید و «Run workflow» را بزنید (با هر push روی شاخه‌های اصلی هم خودکار اجرا می‌شود).
3. نسخهٔ منتشرشده با نام `latest` با APK تازه جایگزین می‌شود و بروزرسانِ خودِ برنامه آن را برمی‌دارد.

یا پوشه را در **Android Studio** باز کنید و Build APK را بزنید. نام نسخه در فایل `app/build.gradle` است و شمارهٔ نسخه از شمارهٔ اجرای CI می‌آید.

## ساختار پروژه

```
app/src/main/assets/www/
  core.js      دریافت، تحلیل نام، پالایش، ادغام، قیمت‌گذاری، تاریخچه و منطق گزارش
  app.js       رابط کاربری، تنظیمات، جستجو، بروزرسانی و صفحهٔ گزارش بازار
  index.html   چیدمان و ظاهر
app/src/main/java/ir/perfume/price/
  MainActivity.java   میزبان WebView، پل شبکه، حافظهٔ عکس
  Updater.java        بروزرسانی خود برنامه با فایل APK (بررسی، دانلود با پیشرفت، نصب)
  Ota.java            بروزرسانی بدون نصب (دانلود و بررسی بسته‌ی وب، برگشت خودکار؛ بدون وابستگی به اندروید)
  OtaGuard.java       ناظر بسته‌ی بی‌نصب (مهلت‌ها، برگشت، گزارش‌های کهنه، مرگ پردازه‌ی صفحه؛ بدون وابستگی به اندروید)
app/src/main/assets/www/version.json   نسخه و «api» برای بسته‌ی بی‌نصب
tools/make-ota.sh     ساخت www.zip و ota.json در CI
tests/                تست‌های خودکار (Node، Playwright، جاوا)
```

## اگر یک سایت ساختارش عوض شد

همهٔ منطق خواندن سایت‌ها در `core.js` است و فهرست فروشگاه‌ها آرایهٔ `SOURCES` در انتهای فایل است. در برنامه، در تنظیمات دکمهٔ «کپی گزارش خطا» را بزنید و متن را برای سازنده بفرستید.

## تست‌ها

تست‌ها با دادهٔ ساختگی اجرا می‌شوند (به فروشگاه‌های واقعی وصل نمی‌شوند):

```bash
node tests/gen.js              # ساخت دادهٔ آزمایشی
node tests/t35_vet.js          # بازرسی نام، شناخت برند و خط محصول
node tests/t37_hist.js         # منطق تاریخچهٔ قیمت و موجودی
python3 tests/t36_features.py  # جستجو، لیست مغازه، پنهان کردن، واژهٔ ممنوع، اندازهٔ نوشته
python3 tests/t38_market.py    # صفحهٔ گزارش بازار
python3 tests/t53_viewer.py    # بزرگ‌نمایی و کشیدنِ عکس
python3 tests/t54_fontscale.py # اندازهٔ نوشته روی کل برنامه (۴ شکل × ۴ اندازه × ۲ عرض)
python3 tests/t66_price_ui.py   # ظاهر و جاشدنِ قیمت‌ها (حباب، ارزان‌ترین، گزارش، خوانایی)
python3 tests/t55_voice.py     # گفتن نام عطر، نوار پایین، آخرین‌ها
python3 tests/t3_flow.py       # روند کامل بروزرسانی
python3 tests/t56_search_real.py   # جستجو روی ۱۲ هزار عطر واقعی (نیاز به /tmp/w/realdb.json)
python3 tests/t57_ota.py       # بروزرسانی بدون نصب در رابط
python3 tests/t58_ota_build.py # ساخت بسته، همخوانیِ نسخه‌ها و آزمایش‌های جاوای Ota.java و OtaGuard.java
```

`Http.java` (دانلودِ امن: ریدایرکتِ دستی، هدرها، بریده‌شدنِ پاسخ، آدرس‌های داخلی) با `tests/java/ir/perfume/price/HttpTest.java` و دو سرور محلیِ واقعی آزمایش می‌شود (در CI اجرا می‌شود).
تست‌های پایتون به Playwright و Chromium نیاز دارند. `Ota.java` و `OtaGuard.java` (بدون وابستگی به اندروید) با JDK و ساعت ساختگی آزمایش می‌شوند؛ بقیه‌ی کد جاوا (`MainActivity`، `Updater`) فقط در CI ساخته می‌شود و روی گوشی واقعی در تست خودکار اجرا نشده است.

## محدودیت‌های شناخته‌شده

- قیمت‌ها از صفحه‌های عمومی خوانده می‌شوند؛ هر فروشگاه هر زمان ممکن است ظاهر سایتش را عوض کند یا درخواست‌ها را مسدود کند.
- کالای کپی که در عنوانش نام سازندهٔ قابل‌تشخیصی نباشد خودکار شناخته نمی‌شود؛ از «واژه‌های ممنوع» یا «پنهانش کن» استفاده کنید.
- فروشگاه‌ها تعداد دقیق موجودی را منتشر نمی‌کنند؛ «موجودی کم شده» بر پایهٔ تعداد فروشگاه‌هایی است که کالا را دارند.
- تاریخچهٔ گزارش بازار از روزی شروع می‌شود که این نسخه نصب شده است.

</div>
