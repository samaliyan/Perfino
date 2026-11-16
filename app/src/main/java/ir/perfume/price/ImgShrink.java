package ir.perfume.price;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;

import java.io.File;
import java.io.FileOutputStream;

/**
 * عکسِ ذخیره‌شده‌ی عطر اگر بزرگ‌تر از اندازه‌ی لازم برای کارت‌هاست، کوچک (حدودِ ۳۶۰ نقطه) و با WebP ذخیره می‌شود تا هم جای کمتری بگیرد
 * و هم هنگامِ اسکرولِ تند حافظه‌ی کمتری بخواهد. هر خطا = همان فایلِ اصلی دست‌نخورده می‌ماند. (عکسِ «بزرگ‌نمایی» از خودِ سایت می‌آید، نه از این فایل.)
 */
final class ImgShrink {
    static final int TARGET = 360, MIN_BYTES = 60 * 1024;

    /** true = فایل کوچک‌تر شد */
    static boolean shrink(File f) {
        File tmp = null;
        Bitmap bm = null, sc = null;
        try {
            if (f == null || !f.isFile() || f.length() < MIN_BYTES) return false;
            BitmapFactory.Options o = new BitmapFactory.Options();
            o.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(f.getAbsolutePath(), o);
            int w = o.outWidth, h = o.outHeight, mx = Math.max(w, h);
            if (w <= 0 || h <= 0 || mx <= TARGET * 3 / 2) return false;      // همین حالا کوچک است
            int s = 1;
            while (mx / (s * 2) >= TARGET) s *= 2;
            BitmapFactory.Options d = new BitmapFactory.Options();
            d.inSampleSize = s;
            bm = BitmapFactory.decodeFile(f.getAbsolutePath(), d);
            if (bm == null) return false;
            int bw = bm.getWidth(), bh = bm.getHeight(), bmx = Math.max(bw, bh);
            if (bmx > TARGET * 5 / 4) {
                float k = TARGET / (float) bmx;
                sc = Bitmap.createScaledBitmap(bm, Math.max(1, Math.round(bw * k)), Math.max(1, Math.round(bh * k)), true);
            } else sc = bm;
            tmp = new File(f.getParentFile(), f.getName() + ".s.tmp");
            FileOutputStream out = new FileOutputStream(tmp);
            boolean ok;
            try { ok = sc.compress(Build.VERSION.SDK_INT >= 30 ? Bitmap.CompressFormat.WEBP_LOSSY : Bitmap.CompressFormat.WEBP, 82, out); } finally { out.close(); }
            if (!ok || tmp.length() < 200 || tmp.length() >= f.length()) { tmp.delete(); return false; }
            if (!tmp.renameTo(f)) { tmp.delete(); return false; }
            return true;
        } catch (Throwable e) {      // از جمله کمبودِ حافظه
            try { if (tmp != null) tmp.delete(); } catch (Throwable ignore) { }
            return false;
        } finally {
            try { if (sc != null && sc != bm) sc.recycle(); if (bm != null) bm.recycle(); } catch (Throwable ignore) { }
        }
    }
}
