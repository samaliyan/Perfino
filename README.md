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
- **Search** in Persian or English, with partial words.
- **Shop list** (★): star perfumes to keep a personal shortlist.
- **Four list styles**, light / dark / automatic theme, Persian or English names, and **four text sizes** for easier reading.
- **Per-brand switches** to hide brands you do not sell (their images are not downloaded either).
- **Product photos** cached on the device, with a drawn bottle as fallback.

### Updates
- On launch the app checks GitHub for a newer version and asks before installing.
- During download the button is disabled and a progress bar is shown.
- Automatic or manual update mode in Settings.

## Install

1. On the phone, open this link:

   ```
   https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk
   ```
2. Download the file and open it.
3. If Android asks, allow installing apps from this source.
4. Tap **Install**.

Requires **Android 7.0 (API 24)** or newer and an internet connection for updates. The first launch downloads the catalogue and photos; later launches open instantly from stored data and refresh in the background.

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
python3 tests/t38_market.py    # market report screen
python3 tests/t3_flow.py       # full refresh flow
```

Python tests need Playwright with Chromium. The Java code is compiled only by CI and has not been run in the automated tests.

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

### گزارش بازار
با هر بروزرسانی کامل، یک تصویر کوچک از قیمت و موجودی ذخیره می‌شود. صفحهٔ **گزارش بازار** این تاریخچه را به اطلاعات کاربردی برای مغازه تبدیل می‌کند:

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
- **کنترل با خودتان**: «واژه‌های ممنوع» (هر عنوانی که آن را داشته باشد وارد فهرست نمی‌شود و همان لحظه برداشته می‌شود) و «پنهانش کن» برای یک مورد خراب.

### استفادهٔ روزمره
- **جستجو** به فارسی یا انگلیسی، حتی با بخشی از نام.
- **لیست مغازه** (ستاره): عطرهای مهم را ستاره بزنید تا فهرست شخصی بسازید.
- **چهار شکل فهرست**، پوستهٔ روشن، تاریک یا خودکار، نام‌ها به فارسی یا انگلیسی و **چهار اندازهٔ نوشته** برای خواندن راحت‌تر.
- **خاموش کردن برند**: برندهایی که نمی‌فروشید دیده نمی‌شوند و عکسشان هم دانلود نمی‌شود.
- **عکس محصول** روی گوشی نگه‌داری می‌شود و اگر نبود، یک بطری ترسیمی جایگزین می‌شود.

### به‌روزرسانی خود برنامه
- هنگام باز شدن، برنامه از گیت‌هاب نسخهٔ جدید را بررسی می‌کند و قبل از نصب می‌پرسد.
- هنگام دانلود، دکمه غیرفعال می‌شود و نوار پیشرفت دیده می‌شود.
- حالت خودکار یا دستی در تنظیمات.

## نصب

1. روی گوشی این نشانی را باز کنید:

   ```
   https://github.com/samaliyan/PerfumePrice/releases/download/latest/PerfumePrice.apk
   ```
2. فایل را دانلود و باز کنید.
3. اگر اندروید پرسید، نصب برنامه از این منبع را اجازه بدهید.
4. دکمهٔ «نصب» را بزنید.

برنامه به **اندروید ۷ (API 24)** یا بالاتر نیاز دارد. اینترنت برای بروزرسانی لازم است. بار اول، فهرست و عکس‌ها دانلود می‌شود؛ دفعه‌های بعد برنامه فوری از اطلاعات ذخیره‌شده باز می‌شود و در پس‌زمینه بروز می‌شود.

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
  Updater.java        بروزرسانی خود برنامه (بررسی، دانلود با پیشرفت، نصب)
tests/                تست‌های خودکار (Node و Playwright)
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
python3 tests/t3_flow.py       # روند کامل بروزرسانی
```

تست‌های پایتون به Playwright و Chromium نیاز دارند. کد جاوا فقط در CI ساخته می‌شود و در تست‌های خودکار اجرا نشده است.

## محدودیت‌های شناخته‌شده

- قیمت‌ها از صفحه‌های عمومی خوانده می‌شوند؛ هر فروشگاه هر زمان ممکن است ظاهر سایتش را عوض کند یا درخواست‌ها را مسدود کند.
- کالای کپی که در عنوانش نام سازندهٔ قابل‌تشخیصی نباشد خودکار شناخته نمی‌شود؛ از «واژه‌های ممنوع» یا «پنهانش کن» استفاده کنید.
- فروشگاه‌ها تعداد دقیق موجودی را منتشر نمی‌کنند؛ «موجودی کم شده» بر پایهٔ تعداد فروشگاه‌هایی است که کالا را دارند.
- تاریخچهٔ گزارش بازار از روزی شروع می‌شود که این نسخه نصب شده است.

</div>
