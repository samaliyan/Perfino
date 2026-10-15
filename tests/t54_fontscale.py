# اندازه‌ی نوشته: لیست اصلی و نوار حروف باید با تنظیمات بزرگ شوند و هیچ‌چیز روی هم نیفتد
import asyncio, sys, json
sys.path.insert(0, '/home/claude/PerfumePrice/tests')
from harness import *

JS = """() => {
  const out = {};
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 60 && r.top < innerHeight; };
  const strip = document.querySelector('.fs2');
  const sp = strip ? [...strip.children] : [];
  const sr = strip ? strip.getBoundingClientRect() : null;
  out.strip = sr ? { l: sr.left, r: sr.right, t: sr.top, b: sr.bottom, fs: parseFloat(getComputedStyle(strip).fontSize), n: sp.length } : null;
  let ov = 0, minGap = 999;
  for (let i = 1; i < sp.length; i++) {
    const a = sp[i - 1].getBoundingClientRect(), b = sp[i].getBoundingClientRect();
    const g = b.top - a.bottom; minGap = Math.min(minGap, g); if (g < -0.5) ov++;
  }
  out.stripOverlap = ov; out.stripMinGap = minGap;
  out.stripInView = sr ? (sr.left >= 0 && sr.right <= innerWidth && sr.top >= 0 && sr.bottom <= innerHeight) : null;
  const rows = [...document.querySelectorAll('.rw')].filter(vis);
  out.rows = rows.length; out.bad = [];
  rows.forEach(r => {
    const n = r.querySelector('.n'), pr = r.querySelector('.pr'), m = r.querySelector('.m'), rr = r.getBoundingClientRect();
    if (n && n.scrollHeight > n.clientHeight + 2 && getComputedStyle(n).webkitLineClamp === 'none') out.bad.push('nameCut:' + n.textContent.slice(0, 12));
    if (pr && m) { const a = pr.getBoundingClientRect(), b = m.getBoundingClientRect(); if (a.right > b.left + 1) out.bad.push('priceOverName:' + n.textContent.slice(0, 12)); }
    if (pr && pr.scrollWidth > pr.clientWidth + 1) out.bad.push('priceClip');
    if (sr && rr.left < sr.right - 1 && rr.right > sr.left) out.bad.push('rowUnderStrip:' + Math.round(rr.left) + '<' + Math.round(sr.right));
    if (rr.right > innerWidth + 1) out.bad.push('rowRight');
    if (pr) { const a = pr.getBoundingClientRect(); if (a.bottom > rr.bottom + 1 || a.top < rr.top - 1) out.bad.push('priceVert'); }
  });
  /* ردیف‌های لیست شیشه‌ای نباید روی هم بیفتند */
  if (document.querySelector('.mc')) {
    const rs = rows.filter(r => getComputedStyle(r).transform === 'none' && getComputedStyle(r).opacity === '1').map(r => r.getBoundingClientRect()).sort((a, b) => a.top - b.top);   // ردیف‌هایی که هنوز در حال ظاهر شدن‌اند حساب نمی‌شوند
    for (let i = 1; i < rs.length; i++) if (rs[i].top < rs[i - 1].bottom - 1) out.bad.push('rowsOverlap');
  }
  const nm = document.querySelector('.rw .n') || document.querySelector('.ma .wr .wt');
  out.nameFs = nm ? parseFloat(getComputedStyle(nm).fontSize) : 0;
  /* مدل الف: پنل پایین */
  const pn = document.querySelector('.ma .pn');
  if (pn) {
    const p = pn.getBoundingClientRect(); out.pn = { t: p.top, b: p.bottom };
    const t = pn.querySelector('.tx'), w = document.querySelector('.ma .wh').getBoundingClientRect();
    if (p.top < w.top + 80) out.bad.push('panelTooTall');
    const nmEl = pn.querySelector('.nm'); if (nmEl.getBoundingClientRect().right > p.right + 1) out.bad.push('pnNameRight');
    pn.querySelectorAll('.ln').forEach(l => { if (l.scrollWidth > l.clientWidth + 1) out.bad.push('lnOverflow'); });
  }
  out.docOverflow = document.documentElement.scrollWidth > innerWidth + 1;
  return out;
}"""

async def main():
    fails = []
    async with async_playwright() as p:
        for w in (320, 360):
            for m in 'achz':
                base = None
                for fs in (0, 1, 2, 3):
                    init = "localStorage.setItem('pp.set',JSON.stringify({theme:'dark',model:'%s',fs:%d}));" % (m, fs)
                    b, ctx, pg, errs = await new_page(p, w, 780, 'dark', extra=init)
                    await pg.goto('file://' + ROOT + '/index.html'); await wait_ready(pg, 120000); await pg.wait_for_timeout(1300)
                    r = await pg.evaluate(JS)
                    tag = '%s fs%d w%d' % (m, fs, w)
                    if errs: fails.append(tag + ' errs ' + str(errs[:2]))
                    if r['stripOverlap']: fails.append(tag + ' strip letters overlap %d (gap %.1f, fs %.1f, n %d)' % (r['stripOverlap'], r['stripMinGap'], r['strip']['fs'], r['strip']['n']))
                    if not r['stripInView']: fails.append(tag + ' strip outside screen ' + json.dumps(r['strip']))
                    if r['bad']: fails.append(tag + ' ' + ','.join(sorted(set(r['bad']))))
                    if r['docOverflow']: fails.append(tag + ' page wider than screen')
                    if r['rows'] < 2 and m != 'a': fails.append(tag + ' few rows ' + str(r['rows']))
                    if fs == 0: base = r
                    else:
                        if r['nameFs'] <= base['nameFs'] + 0.4 and fs >= 2: fails.append(tag + ' name font not larger (%.1f vs %.1f)' % (r['nameFs'], base['nameFs']))
                    print(tag, 'rows', r['rows'], 'nameFs %.1f' % r['nameFs'], 'stripFs %.1f' % r['strip']['fs'], 'gap %.1f' % r['stripMinGap'], 'bad', sorted(set(r['bad'])))
                    await b.close()
    print('FAILS', len(fails))
    for f in fails: print(' -', f)
    sys.exit(1 if fails else 0)
asyncio.run(main())
