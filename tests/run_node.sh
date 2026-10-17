#!/bin/bash
# همه‌ی آزمون‌های Node (بدون مرورگر): هر کدام باید با کد خروج ۰ تمام شود. در CI هم اجرا می‌شود.
cd "$(dirname "$0")" || exit 1
[ -f fixtures.json ] || node gen.js > /dev/null || exit 1
fail=0
for f in ../app/src/main/assets/www/app.js ../app/src/main/assets/www/core.js; do node --check "$f" || { echo "FAIL syntax $f"; fail=1; }; done      # app.js را هیچ آزمونِ Node اجرا نمی‌کند؛ دست‌کم خطای نحوی نباید منتشر شود
for f in t*.js; do
  out=$(timeout 600 node "$f" 2>&1); rc=$?
  if [ $rc -ne 0 ]; then echo "FAIL $f (rc=$rc)"; echo "$out" | tail -15; fail=1; else echo "ok   $f"; fi
done
exit $fail
