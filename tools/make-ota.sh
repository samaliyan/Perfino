#!/usr/bin/env bash
# ساختنِ بسته‌ی «بروزرسانی بدون نصب»: www.zip و ota.json  (استفاده: make-ota.sh پوشه‌ی_www پوشه‌ی_خروجی شماره‌ی_ساخت)
set -euo pipefail
www="$1"; out="$2"; code="$3"
[[ "$code" =~ ^[0-9]{1,9}$ ]] || { echo "bad code: $code"; exit 1; }
mkdir -p "$out"; out="$(cd "$out" && pwd)"
rm -f "$out/www.zip" "$out/ota.json"
v=$(sed -n 's/.*"v"[[:space:]]*:[[:space:]]*"\([0-9][0-9.]*\)".*/\1/p' "$www/version.json")
api=$(sed -n 's/.*"api"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$www/version.json")
[ -n "$v" ] && [ -n "$api" ] || { echo "version.json is not valid"; exit 1; }
for f in index.html app.js core.js; do [ -f "$www/$f" ] || { echo "missing $f"; exit 1; }; done
# نسخه‌ها باید با هم بخوانند؛ وگرنه برنامه بسته را می‌پذیرد ولی خودش را «قدیمی» می‌بیند (یا برعکس)
gradle="$www/../../../../build.gradle"; ota_java="$www/../../java/ir/perfume/price/Ota.java"
[ -f "$gradle" ] || { echo "cannot find build.gradle (expected at $gradle); run with the www folder of the project"; exit 1; }
vn=$(sed -n "s/.*versionName[[:space:]]*['\"]\([0-9][0-9.]*\)['\"].*/\1/p" "$gradle" | head -n1)
[ "$vn" = "$v" ] || { echo "version.json v=$v but build.gradle versionName=$vn"; exit 1; }
[ "${#v}" -le 12 ] || { echo "version too long: $v"; exit 1; }
av=$(sed -n "s/^var VERSION = '\([0-9][0-9.]*\)'.*/\1/p" "$www/app.js" | head -n1)
[ "$av" = "$v" ] || { echo "version.json v=$v but app.js VERSION=$av"; exit 1; }
[ -f "$ota_java" ] || { echo "cannot find Ota.java (expected at $ota_java)"; exit 1; }
na=$(sed -n 's/.*NATIVE_API[[:space:]]*=[[:space:]]*\([0-9][0-9]*\);.*/\1/p' "$ota_java" | head -n1)
[ "$na" = "$api" ] || { echo "version.json api=$api but Ota.java NATIVE_API=$na"; exit 1; }
( cd "$www" && zip -q -r -X -9 "$out/www.zip" . -x '.*' -x '*/.*' )
# برنامه فقط این نوع فایل‌ها را می‌پذیرد؛ بسته‌ی ناجور همین‌جا ساخته نشود
bad=$(unzip -Z1 "$out/www.zip" | grep -v '/$' | grep -vE '^[A-Za-z0-9_][A-Za-z0-9_./-]{0,119}\.(html|js|css|json|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|txt)$' || true)
[ -z "$bad" ] || { echo "file not allowed in bundle:"; echo "$bad"; exit 1; }
long=$(unzip -Z1 "$out/www.zip" | grep -v '/$' | awk 'length($0)>120' || true)
[ -z "$long" ] || { echo "file name longer than 120 characters:"; echo "$long"; exit 1; }
dd=$(unzip -Z1 "$out/www.zip" | grep -v '/$' | grep -E '\.\.|//' || true)
[ -z "$dd" ] || { echo "file name with .. or // not allowed:"; echo "$dd"; exit 1; }
n=$(unzip -Z1 "$out/www.zip" | grep -vc '/$' || true)
[ "$n" -le 200 ] || { echo "too many files: $n"; exit 1; }
# سقف‌های همان‌هایی که برنامه می‌پذیرد (Ota.java): هر فایل ۱۲ مگابایت، کل ۲۴ مگابایت
maxf=$(unzip -Z -l "$out/www.zip" | awk 'NR>2 && NF>=9 {if ($4+0>m+0) m=$4+0} END{print m+0}')
tot=$(unzip -Z -l "$out/www.zip" | awk 'NR>2 && NF>=9 {t+=$4} END{print t+0}')
[ "$maxf" -le 12582912 ] || { echo "a file is too big: $maxf"; exit 1; }
[ "$tot" -le 25165824 ] || { echo "bundle unpacks too big: $tot"; exit 1; }
dupn=$(unzip -Z1 "$out/www.zip" | tr 'A-Z' 'a-z' | sort | uniq -d || true)
[ -z "$dupn" ] || { echo "duplicate names (case-insensitive): $dupn"; exit 1; }
unzip -Z1 "$out/www.zip" | grep -qx 'version.json' || { echo "version.json missing in zip"; exit 1; }
sha=$(sha256sum "$out/www.zip" | cut -d' ' -f1)
size=$(stat -c %s "$out/www.zip")
[ "$size" -le 8388608 ] || { echo "bundle too big: $size"; exit 1; }
printf '{"code":%s,"v":"%s","api":%s,"size":%s,"sha":"%s"}\n' "$code" "$v" "$api" "$size" "$sha" > "$out/ota.json"
cat "$out/ota.json"
