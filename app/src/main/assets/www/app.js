(function () {
'use strict';
var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var VERSION = '1.41';
var myCode = (function () { var m = /\/b(\d{1,10})\/index\.html$/.exec(String(location.pathname || '')); return m ? m[1] : '0'; })();      // نسخه‌ی این صفحه از روی آدرسش؛ در گزارش‌ها به جاوا فرستاده می‌شود تا صفحه‌ی کهنه نتواند نسخه‌ی تازه را «سالم» اعلام کند
function otaCall(n) { try { if (window.Native && typeof window.Native[n] === 'function') window.Native[n](myCode); } catch (e) { } }
otaCall('otaBoot');      // «جاوااسکریپتِ این صفحه شروع شد»: برنامه به صفحه‌ی بی‌نصب مهلتِ بیشتری برای ساختن فهرست می‌دهد
var bootErr = 0, okSent = false, errSent = false;      // خطای جاوااسکریپت در شروعِ برنامه؛ اگر صفر نبود «سالم بالا آمدم» گفته نمی‌شود (بروزرسانیِ بی‌نصبِ خراب برمی‌گردد)
function bootBad() { if (!okSent && !errSent) { errSent = true; otaCall('otaErr'); } }      // به برنامه می‌گوید دیگر «زنده‌ام» نخواهد آمد: به جای دو دقیقه، چند ثانیه بعد برمی‌گردد
window.addEventListener('error', function (e) { var m = String((e && e.message) || ''); if (m.indexOf('ResizeObserver') < 0) { bootErr++; bootBad(); } });
function $(id) { return document.getElementById(id); }
function fa(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function mix(hex, t) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function m(c) { return Math.round(c + (255 - c) * t); } return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')'; }
/* دادهٔ بزرگ (فهرست و تاریخچه) در فایلِ خودِ برنامه ذخیره می‌شود، چون localStorage حدود ۵ مگابایت بیشتر جا ندارد؛ بدون فایل (مرورگر) یا در خطا به localStorage برمی‌گردد */
var BIGK = { 'pp.db': 1, 'pp.hist': 1 };
function fileOk() { return !!(window.Native && window.Native.fileSet && window.Native.fileGet); }
var ls = {
  get: function (k, d) {
    try {
      if (BIGK[k] && fileOk()) { var s = window.Native.fileGet(k); if (s) return JSON.parse(s); }
      var v = localStorage.getItem(k); return v ? JSON.parse(v) : d;
    } catch (e) { return d; }
  },
  set: function (k, v) {
    var str; try { str = JSON.stringify(v); } catch (e) { return false; }
    if (BIGK[k] && fileOk()) {
      var ok = false; try { ok = !!window.Native.fileSet(k, str); } catch (e) { ok = false; }
      if (ok) { try { localStorage.removeItem(k); } catch (e) { } return true; }
    }
    try { localStorage.setItem(k, str); lsMirror(); return true; } catch (e) { return false; }
  }
};
/* تنظیمات و لیست مغازه یک نسخه‌ی پشتیبان هم در فایلِ برنامه دارند. اگر گوشی حافظه‌ی صفحه را پاک کرد (یا بسته‌ی بی‌نصب از جای دیگری باز شد)، از همین فایل برمی‌گردد */
var LSM = ['pp.set', 'pp.st', 'pp.last', 'pp.try', 'pp.updt', 'pp.run'], lsmT = 0;
function lsMirror() {
  if (!fileOk()) return; clearTimeout(lsmT);
  lsmT = setTimeout(function () { try { var o = {}; LSM.forEach(function (k) { var v = localStorage.getItem(k); if (v != null) o[k] = v; }); window.Native.fileSet('pp.ls', JSON.stringify(o)); } catch (e) { } }, 700);
}
(function lsRestore() {
  try {
    if (!fileOk() || localStorage.getItem('pp.set') !== null) return;
    var raw = window.Native.fileGet('pp.ls'); if (!raw) return; var o = JSON.parse(raw);
    LSM.forEach(function (k) { if (typeof o[k] === 'string' && localStorage.getItem(k) === null) localStorage.setItem(k, o[k]); });
  } catch (e) { }
})();
function themeNow() { return document.documentElement.getAttribute('data-th'); }

/* ---------- بطری جایگزین عکس ---------- */
var PAL = [
  { bg: '#1b2a63', liq: '#7fb2ff', liq2: '#3a6bd8', cap: '#e3c37d', cap2: '#a07d2e' },
  { bg: '#52183a', liq: '#ff8fb8', liq2: '#d6457f', cap: '#e3c37d', cap2: '#a07d2e' },
  { bg: '#0f3d33', liq: '#6ff0c0', liq2: '#1f9e78', cap: '#e3c37d', cap2: '#a07d2e' },
  { bg: '#4a2a0d', liq: '#ffc75a', liq2: '#d98617', cap: '#dfe3ea', cap2: '#8d949f' },
  { bg: '#2f1a5c', liq: '#c4a8ff', liq2: '#7a52d6', cap: '#e3c37d', cap2: '#a07d2e' },
  { bg: '#52190f', liq: '#ff9a6b', liq2: '#d6471f', cap: '#e3c37d', cap2: '#a07d2e' },
  { bg: '#0d3d4f', liq: '#6fdcf5', liq2: '#1b93b8', cap: '#dfe3ea', cap2: '#8d949f' },
  { bg: '#26262c', liq: '#eceef4', liq2: '#9aa0b2', cap: '#e3c37d', cap2: '#a07d2e' }
];
var U = 0;
function bottle(k, lt) {
  var p = PAL[k % 8], u = 'g' + (U++), s = k % 4;
  var B = ['M14 40 Q14 32 22 32 H78 Q86 32 86 40 V140 Q86 152 74 152 H26 Q14 152 14 140 Z',
    'M50 52 C22 52 6 76 6 102 C6 132 28 152 50 152 C72 152 94 132 94 102 C94 76 78 52 50 52 Z',
    'M34 34 H66 L90 140 Q92 152 80 152 H20 Q8 152 10 140 Z',
    'M26 44 Q26 38 32 38 H68 Q74 38 74 44 V142 Q74 152 64 152 H36 Q26 152 26 142 Z'];
  var C = ['<rect x="39" y="6" width="22" height="22" rx="5" fill="url(#' + u + 'c)"/><rect x="45" y="26" width="10" height="9" fill="#dfe4ea" opacity=".7"/>',
    '<circle cx="50" cy="26" r="15" fill="url(#' + u + 'c)"/><rect x="44" y="38" width="12" height="16" fill="#dfe4ea" opacity=".7"/>',
    '<rect x="40" y="8" width="20" height="20" rx="3" fill="url(#' + u + 'c)"/><rect x="35" y="26" width="30" height="10" rx="3" fill="url(#' + u + 'c)"/>',
    '<rect x="42" y="4" width="16" height="14" rx="3" fill="url(#' + u + 'c)"/><rect x="46" y="16" width="8" height="24" fill="#dfe4ea" opacity=".7"/>'];
  var top = [70, 88, 84, 78][s], hx = [22, 16, 26, 33][s], hy = [50, 80, 52, 56][s], hh = [88, 50, 78, 82][s];
  var gf = lt ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.13)', gs = lt ? 'rgba(30,30,60,.3)' : 'rgba(255,255,255,.55)';
  return '<svg width="100%" height="100%" viewBox="0 0 100 160" aria-hidden="true"><defs>'
    + '<linearGradient id="' + u + 'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.liq + '"/><stop offset="1" stop-color="' + p.liq2 + '"/></linearGradient>'
    + '<linearGradient id="' + u + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.cap + '"/><stop offset="1" stop-color="' + p.cap2 + '"/></linearGradient>'
    + '<clipPath id="' + u + 'k"><path d="' + B[s] + '"/></clipPath></defs>' + C[s]
    + '<path d="' + B[s] + '" fill="' + gf + '" stroke="' + gs + '" stroke-width="1.6"/>'
    + '<g clip-path="url(#' + u + 'k)"><rect x="0" y="' + top + '" width="100" height="100" fill="url(#' + u + 'l)" opacity=".95"/></g>'
    + '<rect x="' + hx + '" y="' + hy + '" width="6" height="' + hh + '" rx="3" fill="#fff" opacity=".4"/>'
    + '<rect x="36" y="104" width="28" height="22" rx="3" fill="#fff" opacity=".88"/>'
    + '<rect x="41" y="112" width="18" height="2.5" rx="1" fill="' + p.bg + '" opacity=".55"/>'
    + '<rect x="44" y="118" width="12" height="2" rx="1" fill="' + p.bg + '" opacity=".35"/></svg>';
}
function tile(p) {
  var src = p.loc || p.img;
  if (src) return '<div class="tile"><img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-k="' + p.k + '"' + (p.loc && p.img ? ' data-r="' + esc(p.img) + '"' : '') + '></div>';
  return '<div class="tile fb">' + bottle(p.k, themeNow() === 'light') + '</div>';
}
document.addEventListener('error', function (e) {
  var im = e.target;
  if (im && im.tagName === 'IMG' && im.classList && im.classList.contains('nimg') && im.parentNode) { var nb = im.parentNode; nb.classList.add('ph'); nb.innerHTML = bottle(+im.dataset.k || 0, themeNow() === 'light'); return; }      // عکسِ خبر نیامد: همان قابِ بزرگ با یک بطریِ ساده، نه جای خالی
  if (im && im.tagName === 'IMG' && im.parentNode && im.parentNode.classList.contains('tile')) {
    if (im.dataset.r) { var rs = im.dataset.r; im.removeAttribute('data-r'); im.src = rs; return; }   // فایل محلی خراب بود؛ از اینترنت
    var t = im.parentNode; t.classList.add('fb'); t.innerHTML = bottle(+im.dataset.k || 0, themeNow() === 'light');
  }
}, true);

/* ---------- اندازه‌کردن متن (جلوگیری از روی‌هم‌افتادن) ---------- */
function fitW(el, min) {
  var fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
  while (el.scrollWidth > el.clientWidth + 1 && fs > min && n++ < 40) { fs -= .5; el.style.fontSize = fs + 'px'; }
}
function fitH(el, min) {
  var fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
  while (el.scrollHeight > el.clientHeight + 1 && fs > min && n++ < 40) { fs -= .5; el.style.fontSize = fs + 'px'; }
  if (el.scrollHeight > el.clientHeight + 1) clampLines(el);
}
function clampLines(el) {
  var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight); if (!(lh > 0)) lh = fs * 1.35;
  var lines = Math.max(1, Math.floor(el.clientHeight / lh));
  el.style.display = '-webkit-box'; el.style.webkitBoxOrient = 'vertical'; el.style.webkitLineClamp = String(lines);
}
function fitLines(el, lines, min) {
  var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) / fs, n = 0;
  if (!(lh > 0)) lh = 1.3;
  while (el.scrollHeight > fs * lh * lines + 2 && fs > min && n++ < 40) { fs -= .5; el.style.fontSize = fs + 'px'; }
}
function fitRow(row, fixedH) {
  if (row._f) return; row._f = 1;
  var pr = row.querySelector('.pr'), s = 1, n = 0;
  if (pr) while (pr.scrollWidth > pr.clientWidth + 1 && s > .6 && n++ < 12) { s -= .05; pr.style.setProperty('--ps', s.toFixed(2)); }
  if (fixedH) { var nm = row.querySelector('.n'); if (nm) fitH(nm, 10); }
}

/* ---------- فیزیک فنری ---------- */
var SP = new Set(), raf = 0, last = 0;
function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
function loop(ts) { var dt = Math.min((ts - last) / 1000, .034); last = ts; SP.forEach(function (s) { s.step(dt); if (!s.run) SP.delete(s); }); raf = SP.size ? requestAnimationFrame(loop) : 0; }
function Spring(x, cb) { this.x = x; this.t = x; this.v = 0; this.cb = cb; this.r = .4; this.z = 1; this.run = false; this.eps = .0006; }
Spring.prototype.to = function (t, o) { o = o || {}; this.t = t; this.r = RM ? .18 : (o.response || .4); this.z = o.damping == null ? 1 : o.damping; if (o.velocity != null) this.v = o.velocity; if (!this.run) { this.run = true; SP.add(this); kick(); } };
Spring.prototype.stop = function () { this.run = false; this.v = 0; SP.delete(this); };
Spring.prototype.step = function (dt) {
  var w = 6.2832 / this.r, k = w * w, c = 2 * this.z * w, h = dt / 2;
  for (var i = 0; i < 2; i++) { var a = -k * (this.x - this.t) - c * this.v; this.v += a * h; this.x += this.v * h; }
  if (Math.abs(this.v) < this.eps * 5 && Math.abs(this.x - this.t) < this.eps) { this.x = this.t; this.v = 0; this.run = false; }
  this.cb(this.x);
};
function rb(x, dim) { return (x * dim * .55) / (dim + .55 * x); }

function Scroller(el, o) {
  var pos = 0, idx = -1, drag = false, sc = 0, sp = 0, moved = 0, S = [], wa = 0, self = this;
  var spr = new Spring(0, function (x) { pos = x; o.render(pos); chk(); });
  function chk() { if (o.n < 1) return; var i = clamp(Math.round(pos), 0, o.n - 1); if (i !== idx) { idx = i; if (o.onIndex) o.onIndex(i); } }
  function rub(v) { var hi = o.n - 1; if (v < 0) return -rb(-v, 2); if (v > hi) return hi + rb(v - hi, 2); return v; }
  function cd(e) { return o.axis === 'x' ? e.clientX : e.clientY; }
  el.addEventListener('pointerdown', function (e) { drag = true; moved = 0; spr.stop(); sc = cd(e); sp = pos; S = [{ t: e.timeStamp, c: sc }]; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
  el.addEventListener('pointermove', function (e) {
    if (!drag) return; var c = cd(e); moved = Math.max(moved, Math.abs(c - sc));
    pos = rub(sp + o.sign * (c - sc) / o.step); S.push({ t: e.timeStamp, c: c });
    while (S.length > 2 && e.timeStamp - S[0].t > 100) S.shift();
    o.render(pos); chk();
  });
  function up(e) {
    if (!drag) return; drag = false;
    var v = 0; if (S.length > 1) { var a = S[0], b = S[S.length - 1]; if (b.t > a.t) v = (b.c - a.c) / ((b.t - a.t) / 1000); }
    var vu = o.sign * v / o.step;
    if (moved < 7 && e.type === 'pointerup') { var t = document.elementFromPoint(e.clientX, e.clientY), it = t && t.closest ? t.closest('[data-i]') : null; if (it && el.contains(it)) { var ti = +it.dataset.i; if (o.onTap && ti === idx) o.onTap(ti); else self.go(ti); return; } }
    var pj = clamp(vu * .5, -120, 120), tg = clamp(Math.round(pos + pj), 0, Math.max(0, o.n - 1));
    spr.x = pos; spr.to(tg, { response: .5 + Math.min(1.1, Math.abs(pj) / 60), damping: Math.abs(vu) > .6 ? .82 : 1, velocity: vu });
  }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', function (e) { e.preventDefault(); wa += (e.deltaY || e.deltaX); if (Math.abs(wa) > 50) { var dir = wa > 0 ? 1 : -1; wa = 0; self.go(clamp(Math.round(spr.t) + dir, 0, o.n - 1)); } }, { passive: false });
  this.go = function (i) { spr.x = pos; spr.to(i, { response: .55 + Math.min(1, Math.abs(i - pos) / 80), damping: .9 }); };
  this.set = function (i) { spr.stop(); pos = i; spr.x = i; spr.t = i; idx = -1; o.render(i); chk(); };
  this.index = function () { return idx < 0 ? 0 : idx; };
  this.stop = function () { spr.stop(); };
}
function tween(el, from, to, ms) {
  var t0 = performance.now(), tok = (el._tk || 0) + 1; el._tk = tok;
  (function s(t) { if (el._tk !== tok) return; var p = ms > 0 ? Math.min(1, (t - t0) / ms) : 1, e = 1 - Math.pow(1 - p, 3); el.textContent = fa(from + (to - from) * e); if (p < 1) requestAnimationFrame(s); })(t0);
}
function winRender(rows, pos, R, st, fn) {
  var lo = Math.max(0, Math.floor(pos) - R), hi = Math.min(rows.length - 1, Math.ceil(pos) + R);
  if (st.lo !== undefined) for (var j = st.lo; j <= st.hi; j++) if ((j < lo || j > hi) && rows[j]) rows[j].style.display = 'none';
  for (var k = lo; k <= hi; k++) fn(rows[k], k - pos, k);
  st.lo = lo; st.hi = hi;
}

/* ---------- نوار حروف ---------- */
function ZS() { return FS[set.fs | 0] || 1; }
function Strip(el, o) {
  var L = o.letters, n = L.length, on = false;
  el.innerHTML = L.map(function (l) { return '<span>' + l + '</span>'; }).join('');
  var sp = el.children;
  /* اندازه‌ی حرف‌ها را با ارتفاع نوار هماهنگ می‌کند تا هیچ‌وقت روی هم نیفتند */
  function fit() {
    var h = el.clientHeight || 0; if (!h || !n) return;
    var px = Math.max(11, Math.min(16 * ZS(), h / n * .92));
    el.style.fontSize = px.toFixed(1) + 'px';
  }
  fit();
  requestAnimationFrame(fit);
  window.addEventListener('resize', fit);
  function paint(fy) {
    for (var j = 0; j < n; j++) {
      var k = 1, x = o.curve ? o.curve * Math.sin(Math.PI * j / Math.max(1, n - 1)) : 0;
      if (fy != null) { var dd = j - fy; k = 1 + 1.1 * Math.exp(-dd * dd / 1.8); x += (k - 1) * 12; }
      sp[j].style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + k.toFixed(2) + ')';
    }
  }
  function mv(e) {
    var r = el.getBoundingClientRect(), y = clamp(e.clientY - r.top, 0, r.height), fy = y / r.height * (n - 1), i = Math.round(fy);
    paint(fy); o.bub.textContent = L[i]; o.bub.style.top = (e.clientY - o.box.getBoundingClientRect().top - (o.bub.offsetHeight || 62) / 2) + 'px'; o.pick(i);
  }
  el.addEventListener('pointerdown', function (e) { e.stopPropagation(); on = true; try { el.setPointerCapture(e.pointerId); } catch (_) {} o.bub.classList.add('on'); mv(e); });
  el.addEventListener('pointermove', function (e) { if (on) mv(e); });
  function end() { on = false; o.bub.classList.remove('on'); paint(null); }
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  paint(null);
  return { setOn: function (i) { for (var j = 0; j < n; j++) sp[j].classList.toggle('on', j === i); }, destroy: function () { window.removeEventListener('resize', fit); } };
}

/* ---------- ساخت داده‌ی نمایش ---------- */
function decorate(list, title, sub, crumb) {
  var LET = [], FI = {};
  list.forEach(function (p, i) { p.k = parseInt(String(p.imgId || p.id).replace(/^b/, ''), 36) % 64 || 0; if (FI[p.L] === undefined) { FI[p.L] = i; LET.push(p.L); } });
  return { list: list, LET: LET, FI: FI, title: title || '', sub: sub || '', crumb: crumb || '' };
}
function div(cls, html) { var d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; }
function idxOf(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return i; return 0; }
var CHEV = '<svg class="chev" width="11" height="18" viewBox="0 0 10 16" aria-hidden="true"><path d="M8 1L2 8l6 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* قیمت همه‌جا یک شکل دارد: حبابِ رنگی با عددِ درشت و «تومان» (cls: dn سبز، up قرمز، خالی زرد) */
function pzh(n, cls) { return '<span class="pz' + (cls ? ' ' + cls : '') + '"><b>' + fa(n) + '</b><span class="tu">تومان</span></span>'; }
function priceHtml(p, max) {
  if (!p.sizes.length) return CHEV;
  return p.sizes.slice(0, max).map(function (z, j) {
    return j ? '<div class="p2"><span>' + fa(z.ml) + ' میل</span><b>' + fa(z.price) + '</b></div>'
      : '<div class="p1">' + pzh(z.price) + (z.n < 2 ? '<i title="فقط یک سایت"></i>' : '') + '<small>' + fa(z.ml) + ' میل</small></div>';
  }).join('');
}
var GN = { m: 'مردانه', w: 'زنانه', u: 'یونیسکس' };
function tagOf(p) { return p.tag || ''; }
function rowHtml(p, max) {
  var pr = priceHtml(p, max);
  return '<div class="rw" data-id="' + p.id + '">' + tile(p) + '<div class="m"><div class="n">' + esc(p.name) + '</div>' + (tagOf(p) ? '<div class="tg">' + tagOf(p) + '</div>' : '') + '</div><div class="pr">' + pr + '</div></div>';
}

/* ================= مدل الف: چرخ نیم‌دایره ================= */
function ModelA(host, data, anchor) {
  var el = div('mod ma', '<div class="wh"><div class="sel"></div><div class="rs"></div><div class="fs2 ab"></div><div class="bub2"></div></div><div class="pn"><div class="tx"><div class="bn"></div><div class="nm"></div><span class="tg"></span><div class="lns"></div></div><div class="ph"></div></div>');
  host.appendChild(el);
  var wh = el.querySelector('.wh'), L = data.list, rows = [], st = {}, cur = 0, STEP = Math.round(54 * ZS());
  var frag = document.createDocumentFragment();
  L.forEach(function (p, k) { var r = div('wr'); r.dataset.i = k; r.innerHTML = '<span class="wt">' + esc(p.name) + '</span>'; r._f = 0; rows.push(r); frag.appendChild(r); });
  el.querySelector('.rs').appendChild(frag);   // فقط ردیف‌ها محو می‌شوند؛ نوار حروف سر جایش کاملاً دیده می‌شود
  var strip = Strip(el.querySelector('.ab'), { letters: data.LET, box: wh, bub: el.querySelector('.bub2'), pick: function (i) { sc.go(data.FI[data.LET[i]]); } });
  function bgFor(p) { return themeNow() === 'light' ? mix(PAL[p.k % 8].liq, .8) : PAL[p.k % 8].bg; }
  function show(i, quiet) {
    var p = L[i]; cur = i; el.style.backgroundColor = bgFor(p);
    var ph = el.querySelector('.ph'); ph.innerHTML = '<div class="pop" style="width:100%;height:100%"><div class="fl" style="width:100%;height:100%">' + tile(p) + '</div></div>';
    var nm = el.querySelector('.nm'); nm.style.fontSize = ''; nm.textContent = p.name;
    var tg = el.querySelector('.tg'); tg.textContent = tagOf(p); tg.style.display = tagOf(p) ? '' : 'none';
    el.querySelector('.pn').dataset.id = p.id;
    var bn = el.querySelector('.bn'); bn.textContent = data.crumb || ''; bn.style.display = data.crumb ? '' : 'none';
    var lns = el.querySelector('.lns'), many = p.sizes.length > 2;
    if (!p.sizes.length) { lns.innerHTML = '<div class="hn">' + esc(p.hint || '') + CHEV + '</div>'; fitLines(nm, 3, 14); strip.setOn(data.LET.indexOf(p.L)); return; }
    lns.innerHTML = p.sizes.slice(0, 4).map(function (z) { return '<div class="ln"><span>' + fa(z.ml) + ' میل</span><b style="' + (many ? 'font-size:21px' : '') + '"></b></div>'; }).join('');
    var bs = lns.querySelectorAll('b');
    p.sizes.slice(0, 4).forEach(function (z, j) { bs[j].textContent = fa(z.price); if (z.n < 2) bs[j].insertAdjacentHTML('afterend', '<span title="فقط یک سایت" style="width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5;flex:0 0 6px;align-self:center"></span>'); });
    fitLines(nm, 3, 14);
    Array.prototype.forEach.call(lns.querySelectorAll('.ln'), function (ln) { var b = ln.querySelector('b'); var n = 0, fs = parseFloat(getComputedStyle(b).fontSize); while (ln.scrollWidth > ln.clientWidth + 1 && fs > 11 && n++ < 40) { fs -= .5; b.style.fontSize = fs + 'px'; } });
    Array.prototype.forEach.call(lns.querySelectorAll('b'), function (b, j) { if (!RM && !quiet) tween(b, p.sizes[j].price * .7, p.sizes[j].price, 420); });
    strip.setOn(data.LET.indexOf(p.L));
  }
  var sc = new Scroller(wh, { n: L.length, step: STEP, axis: 'y', sign: -1, onIndex: show, onTap: function (i) { openEntry(L[i].id); }, render: function (pos) {
    winRender(rows, pos, 6, st, function (r, d, j) {
      var ad = Math.abs(d), th = Math.min(ad * .3, 1.25), x = -150 * (1 - Math.cos(th)), s = Math.max(.55, 1.12 - .15 * ad);
      r.style.display = 'flex';
      if (!r._f) { r._f = 1; fitW(r.firstChild, 12); }
      r.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (d * STEP).toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      r.style.opacity = Math.max(0, 1 - .24 * ad).toFixed(3);
      r.style.filter = ad > 1.3 ? 'blur(' + ((ad - 1.3) * .8).toFixed(2) + 'px)' : 'none';
    });
  } });
  sc.set(idxOf(L, anchor));
  return {
    el: el, goto: function (i) { sc.set(i); }, getAnchor: function () { return L[sc.index()] ? L[sc.index()].id : null; },
    theme: function () { if (L[cur]) el.style.backgroundColor = bgFor(L[cur]); },
    refresh: function () { if (L[cur]) show(cur, true); },
    destroy: function () { sc.stop(); strip.destroy(); el.remove(); }
  };
}

/* ================= مدل ج: لیست شیشه‌ای ================= */
function ModelC(host, data, anchor) {
  var el = div('mod mc', '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="hdr"><div><div class="t1">قیمت امروز</div><div class="t2"></div></div><div class="cl"></div></div><div class="scl"></div><div class="fs2"></div><div class="bub2"></div>');
  host.appendChild(el);
  var L = data.list, scl = el.querySelector('.scl'), cl = el.querySelector('.cl'), gi = -1, PADT = 116;
  el.querySelector('.t1').textContent = data.title; el.querySelector('.t2').textContent = data.sub;
  /* فهرست آیتم‌ها با ارتفاع ثابت (برای ساخت فقط ردیف‌های نزدیک صفحه) */
  var items = [], top = 0, gtops = [], rowItem = [], zs = ZS(), GH = Math.round(40 * zs), GP = Math.round(9 * Math.sqrt(zs));
  L.forEach(function (p, k) {
    if (data.FI[p.L] === k) { gtops.push(top); items.push({ t: 'g', top: top, h: GH, L: p.L }); top += GH; }
    var h = Math.round((p.sizes.length > 3 ? 96 : p.sizes.length > 2 ? 88 : 80) * zs);
    rowItem[k] = items.length; items.push({ t: 'r', top: top, h: h, k: k }); top += h + GP;
  });
  scl.innerHTML = '<div class="vt" style="position:relative;height:' + top + 'px"></div>';
  scl.style.paddingTop = PADT + 'px';
  function padB() { scl.style.paddingBottom = Math.max(40, (scl.clientHeight || 700) - PADT - 120) + 'px'; }   // آخرین حرف هم بتواند به بالای صفحه برسد
  padB();
  var vt = scl.firstChild, live = {}, tmp = document.createElement('div');
  function find(y) { var a = 0, b = items.length - 1; while (a < b) { var m = (a + b + 1) >> 1; if (items[m].top <= y) a = m; else b = m - 1; } return a; }
  function make(i) {
    var it = items[i], r;
    if (it.t === 'g') { tmp.innerHTML = '<div class="ghw"><span class="gh">' + it.L + '</span></div>'; r = tmp.firstChild; r.style.height = it.h + 'px'; }
    else { tmp.innerHTML = rowHtml(L[it.k], 4); r = tmp.firstChild; r.style.setProperty('--h', it.h + 'px'); r.style.height = it.h + 'px'; r.classList.add('v'); }
    r.style.top = it.top + 'px'; r._f = 0; vt.appendChild(r); live[i] = r;
    if (it.t === 'r') { fitRow(r, true); requestAnimationFrame(function () { r.style.transitionDelay = (RM ? 0 : (i % 5) * 45) + 'ms'; r.classList.add('in'); }); }
    return r;
  }
  function run() {
    var st = scl.scrollTop, vh = scl.clientHeight || 700;
    var lo = find(Math.max(0, st - PADT - 250)), hi = find(st - PADT + vh + 250);
    for (var i = lo; i <= hi; i++) if (!live[i]) make(i);
    Object.keys(live).forEach(function (k) { if (+k < lo - 6 || +k > hi + 6) { live[k].remove(); delete live[k]; } });
    var g = 0, a = 0, b = gtops.length - 1, y = st - PADT + 124;
    while (a < b) { var m = (a + b + 1) >> 1; if (gtops[m] <= y) a = m; else b = m - 1; } g = a;
    if (g !== gi) { gi = g; cl.textContent = data.LET[g] || ''; cl.classList.remove('pop'); void cl.offsetWidth; cl.classList.add('pop'); strip.setOn(g); }
  }
  var rf = 0;
  scl.addEventListener('scroll', function () { if (!rf) rf = requestAnimationFrame(function () { rf = 0; run(); }); });
  var strip = Strip(el.querySelector('.fs2'), { letters: data.LET, box: el, bub: el.querySelector('.bub2'), pick: function (i) { scl.scrollTop = gtops[i] + 4; } });
  function toRow(k) { k = clamp(k | 0, 0, L.length - 1); if (rowItem[k] != null) scl.scrollTop = items[rowItem[k]].top - 8; }
  if (anchor) toRow(idxOf(L, anchor));
  run();
  function onR() { padB(); run(); }
  window.addEventListener('resize', onR);
  requestAnimationFrame(padB);
  return {
    el: el, goto: function (i) { toRow(i); run(); },
    getAnchor: function () { var it = items[find(scl.scrollTop + 20)]; var k = it.t === 'r' ? it.k : (items[Math.min(items.length - 1, find(scl.scrollTop + 20) + 1)].k || 0); return L[k] ? L[k].id : null; },
    theme: function () {},
    refresh: function () {
      Object.keys(live).forEach(function (k) {
        var it = items[k]; if (!it || it.t !== 'r') return;
        var r = live[k], pr = r.querySelector('.pr'); if (!pr) return;
        pr.innerHTML = priceHtml(L[it.k], 4); pr.style.removeProperty('--ps'); r._f = 0; fitRow(r, true);
      });
    },
    destroy: function () { window.removeEventListener('resize', onR); strip.destroy(); el.remove(); }
  };
}

/* ================= مدل ز و ح: لیست کانونی ================= */
function ModelFocus(kind, host, data, anchor) {
  var z = kind === 'z', zs = ZS(), RH = Math.round((z ? 84 : 96) * zs), GAP = Math.round((z ? 8 : 10) * Math.sqrt(zs)), P = RH + GAP, PAD = z ? 112 : 120;
  var el = div('mod mg ' + (z ? 'mz' : 'mh'), (z ? '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>' : '<div class="ov"></div>') + '<div class="hdr"><div><div class="t1">قیمت امروز</div><div class="t2"></div></div><div class="cl"></div></div><div class="scl"></div><div class="fs2"></div><div class="bub2"></div>');
  el.style.setProperty('--rh', RH + 'px'); el.style.setProperty('--gap', GAP + 'px');
  host.appendChild(el);
  var L = data.list, scl = el.querySelector('.scl'), cl = el.querySelector('.cl'), cur = -1, gl = '', rf = 0, CY = 300, force = -1;      // force: عطرِ بالای فهرست که به خط وسط نمی‌رسد ولی عکسش باز است؛ تا اولین اسکرولِ دست، همان «برجسته» می‌ماند
  el.querySelector('.t1').textContent = data.title; el.querySelector('.t2').textContent = data.sub;
  scl.innerHTML = '<div class="vt" style="position:relative;height:' + (L.length * P) + 'px"></div>';
  var vt = scl.firstChild, live = {}, tmp = document.createElement('div');
  function ensure(j) {
    if (live[j]) return live[j];
    tmp.innerHTML = rowHtml(L[j], 3);
    var r = tmp.firstChild; r.style.top = (j * P) + 'px'; r._f = 0; r._w = 0;
    vt.appendChild(r); live[j] = r; return r;
  }
  function geom() {
    var H = el.clientHeight; CY = Math.round(H * .54);
    el.style.setProperty('--spt', (CY - RH / 2) + 'px');
    scl.style.paddingBottom = Math.max(60, H - CY + RH) + 'px';
    scl.style.paddingTop = PAD + 'px';
  }
  function setCur(i) {
    var p = L[i]; if (!p) return;
    var pi = PAL[p.k % 8], dark = themeNow() !== 'light';
    el.style.setProperty('--ac', z ? (dark ? pi.liq : pi.liq2) : pi.liq);
    if (z || dark) el.style.setProperty('--act', z ? (dark ? pi.liq : pi.liq2) : pi.liq); else el.style.removeProperty('--act');
    if (!z) {
      el.style.backgroundColor = dark ? pi.liq2 : mix(pi.liq, .5);
      el.style.setProperty('--hov', dark ? 'radial-gradient(120% 60% at 80% 0%,rgba(255,255,255,.3),transparent 60%),linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.42))' : 'radial-gradient(120% 60% at 80% 0%,rgba(255,255,255,.55),transparent 60%),linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.4))');
    }
    if (p.L !== gl) { gl = p.L; cl.textContent = gl; cl.classList.remove('pop'); void cl.offsetWidth; cl.classList.add('pop'); strip.setOn(data.LET.indexOf(gl)); }
  }
  function fx(r, d, ad) {
    if (!r._f && !r._w) { r._w = 1; fitRow(r, true); }
    if (z) {
      r.style.transform = 'scale(' + (1 + .05 * Math.max(0, 1 - ad)).toFixed(3) + ')';
      r.style.opacity = (.45 + .55 * Math.max(0, 1 - ad * .28)).toFixed(2);
    } else {
      var a = clamp(d * 16, -85, 85), rad = a * Math.PI / 180, R = P / (16 * Math.PI / 180);
      r.style.visibility = ad > 5.3 ? 'hidden' : 'visible';
      r.style.transform = 'translate3d(0,' + (R * Math.sin(rad) - d * P).toFixed(1) + 'px,' + (R * (Math.cos(rad) - 1)).toFixed(1) + 'px) rotateX(' + (-a).toFixed(1) + 'deg)';
      r.style.opacity = Math.pow(Math.max(0, Math.cos(rad)), 1.3).toFixed(3);
    }
  }
  function run() {
    rf = 0; var s = scl.scrollTop, c = clamp(Math.round((s + CY - PAD - RH / 2) / P), 0, L.length - 1);
    var lo = Math.max(0, c - 7), hi = Math.min(L.length - 1, c + 7), best = c, bd = 99;
    for (var j = lo; j <= hi; j++) {
      var d = (PAD + j * P + RH / 2 - s - CY) / P, ad = Math.abs(d);
      if (ad < bd) { bd = ad; best = j; }
      fx(ensure(j), d, ad);
    }
    if (force >= 0) { if (s > 3) force = -1; else { best = force; bd = 0; } }
    for (var k = lo; k <= hi; k++) live[k].classList.toggle('on', k === best && bd < .55);
    Object.keys(live).forEach(function (key) { if (+key < lo - 4 || +key > hi + 4) { live[key].remove(); delete live[key]; } });
    if (best !== cur) { cur = best; setCur(best); }
  }
  var down = false, settle = 0, jump = false;
  function settleNow() {
    if (down || jump || force >= 0) return;      // عطرِ بالای فهرست برجسته است؛ جابه‌جایی‌اش نکن
    var s = scl.scrollTop, j = clamp(Math.round((s + CY - PAD - RH / 2) / P), 0, L.length - 1), t = PAD + j * P + RH / 2 - CY, d = t - s;
    if (Math.abs(d) > 1.5 && Math.abs(d) < P * .6 && t >= 0) { try { scl.scrollTo({ top: t, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { scl.scrollTop = t; } }
  }
  scl.addEventListener('scroll', function () { if (!rf) rf = requestAnimationFrame(run); clearTimeout(settle); settle = setTimeout(settleNow, 160); });
  scl.addEventListener('pointerdown', function () { down = true; });
  scl.addEventListener('touchstart', function () { down = true; }, { passive: true });
  function rel() { down = false; clearTimeout(settle); settle = setTimeout(settleNow, 160); }
  scl.addEventListener('pointerup', rel); scl.addEventListener('pointercancel', rel); scl.addEventListener('touchend', rel, { passive: true });
  var strip = Strip(el.querySelector('.fs2'), { letters: data.LET, box: el, bub: el.querySelector('.bub2'), curve: z ? 0 : 14, pick: function (i) { jump = true; clearTimeout(settle); var fi = data.FI[data.LET[i]], t = PAD + fi * P + RH / 2 - CY; force = t < 0 && fi >= 0 && fi < L.length ? fi : -1; scl.scrollTop = Math.max(0, t); run(); setTimeout(function () { jump = false; }, 400); } });
  function onR() { geom(); run(); }
  window.addEventListener('resize', onR);
  geom();
  function focusAnchor() {      // عطرِ لنگر؛ اگر بالای فهرست است و به خط وسط نمی‌رسد، همان برجسته می‌ماند
    var ai = anchor ? idxOf(L, anchor) : -1, t = ai >= 0 ? PAD + ai * P + RH / 2 - CY : 0;
    force = t < 0 && ai >= 0 && L[ai] && L[ai].id === anchor ? ai : -1; scl.scrollTop = Math.max(0, t);
  }
  focusAnchor();
  run();
  requestAnimationFrame(function () { geom(); if (anchor) focusAnchor(); run(); });
  return {
    el: el, goto: function (i) { var t = PAD + i * P + RH / 2 - CY; force = t < 0 && i >= 0 && i < L.length ? i : -1; scl.scrollTop = Math.max(0, t); run(); }, getAnchor: function () { return L[cur] ? L[cur].id : null; },
    theme: function () { setCur(cur < 0 ? 0 : cur); },
    refresh: function () {
      Object.keys(live).forEach(function (k) {
        var r = live[k], pr = r.querySelector('.pr'); if (!pr) return;
        pr.innerHTML = priceHtml(L[+k], 3); pr.style.removeProperty('--ps'); r._f = 0; r._w = 0;
      });
      run();
    },
    destroy: function () { clearTimeout(settle); window.removeEventListener('resize', onR); strip.destroy(); el.remove(); }
  };
}

var MODELS = {
  a: function (h, d, a) { return ModelA(h, d, a); },
  c: function (h, d, a) { return ModelC(h, d, a); },
  z: function (h, d, a) { return ModelFocus('z', h, d, a); },
  h: function (h, d, a) { return ModelFocus('h', h, d, a); }
};

/* ================= شبکه ================= */
var pend = {}, seq = 0, netLog = [], netBad = [];
window.__nat = function (id, status, body) {
  var p = pend[id]; if (!p) return; delete pend[id]; clearTimeout(p.t); if (p.rel) p.rel();
  var le = { u: p.u, s: status, b: String(body || '').slice(0, 300) };
  netLog.push(le); if (netLog.length > 6) netLog.shift();
  if (status !== 200) { netBad.push(le); if (netBad.length > 12) netBad.shift(); }
  if (status === 0) p.rej(new Error(String(body || 'اینترنت وصل نیست')));
  else p.res({ status: status, body: body });
};
var netQ = [], netBusy = 0;
function netPump() { while (netBusy < 6 && netQ.length) { netBusy++; var job = netQ.shift(); try { job(); } catch (e) { netBusy--; } } }
var net = {
  get: function (url, headers) {
    return new Promise(function (res, rej) {
      if (window.Native && window.Native.fetch) {
        netQ.push(function () {                       // حداکثر ۶ درخواست هم‌زمان؛ بقیه در صف می‌مانند و زمانِ انتظارشان از ۳۰ ثانیه حساب نمی‌شود
          var id = 'r' + (++seq), done = false;
          function rel() { if (done) return; done = true; netBusy--; netPump(); }
          pend[id] = { res: res, rej: rej, u: url, rel: rel, t: setTimeout(function () { delete pend[id]; rel(); rej(new Error('زمان انتظار تمام شد')); }, 30000) };
          window.Native.fetch(id, url, JSON.stringify(headers || {}));
        });
        netPump();
      } else {
        fetch(url, { headers: headers }).then(function (r) { return r.text().then(function (b) { var le = { u: url, s: r.status, b: b.slice(0, 300) }; netLog.push(le); if (netLog.length > 6) netLog.shift(); if (r.status !== 200) { netBad.push(le); if (netBad.length > 12) netBad.shift(); } res({ status: r.status, body: b }); }); }).catch(rej);
      }
    });
  }
};

/* ================= وضعیت برنامه ================= */
var set = ls.get('pp.set', { theme: 'auto', model: 'a' });
if (!set || typeof set !== 'object' || Array.isArray(set)) set = {};                      // ذخیره‌ی خراب یا قدیمی نباید برنامه را از کار بیندازد
if (!/^(auto|light|dark)$/.test(set.theme)) set.theme = 'auto';
if (!set.soff || typeof set.soff !== 'object' || Array.isArray(set.soff)) set.soff = {};
if (!Array.isArray(set.rec)) set.rec = [];          // آخرین عطرهایی که دیده شد
if (!set.fav || typeof set.fav !== 'object' || Array.isArray(set.fav)) set.fav = {};          // لیست مغازه
if (!set.hide || typeof set.hide !== 'object' || Array.isArray(set.hide)) set.hide = {};      // عطرهای پنهان‌شده
if (!Array.isArray(set.block)) set.block = [];                                               // واژه‌های ممنوع
set.block = set.block.filter(function (x) { return typeof x === 'string' && x.trim().length >= 2; }).slice(0, 60);
if (!(set.fs >= 0 && set.fs <= 3)) set.fs = 0;
Core.setBlock(set.block);
if (!Object.prototype.hasOwnProperty.call(MODELS, set.model)) set.model = 'a';
var db = ls.get('pp.db', null);
function dbSane(d) {      // حافظه‌ی نیمه‌خراب (مثلاً یک ردیفِ null) نباید برنامه را برای همیشه در بوت‌لوپ نگه دارد؛ خراب = از نو دریافت
  try {
    if (!d || typeof d !== 'object' || !d.g || typeof d.g !== 'object' || !d.it || typeof d.it !== 'object') return false;
    for (var s in d.it) { var m = d.it[s]; if (!m || typeof m !== 'object') return false; for (var k in m) { var e = m[k]; if (!Array.isArray(e) || e.length < 4) return false; } }
    for (var g in d.g) { var x = d.g[g]; if (!x || typeof x !== 'object' || !Array.isArray(x.k)) return false; }
    return true;
  } catch (e) { return false; }
}
if (!db || db.v !== 3 || db.fv !== 5 || !dbSane(db)) db = Core.newDb();   // نسخه‌ی ۱.۳ همه چیز را یک‌بار از نو و کامل می‌گیرد
db.fv = 5;
db.full = db.full || {}; db.t = db.t || {}; db.fa = db.fa || {}; db.sc = db.sc || {};
try { localStorage.removeItem('pp.raw'); } catch (e) {}
var idx = Core.dbIndex(db);
var stt = ls.get('pp.st', {});
if (!stt || typeof stt !== 'object' || Array.isArray(stt)) stt = {};
var prog = {}, busy = false, curModel = null, list = [], struct = '', psig = '', mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
var ORDER = [], TRUSTED = {}, imgLoc = {}, imgAsked = {};
Core.SOURCES.forEach(function (s) { if (s.trusted) TRUSTED[s.id] = true; });
/* سایت‌هایی که کاربر خاموش کرده (set.soff) نه دریافت می‌شوند و نه در فهرست می‌آیند؛ حداقل یک سایت همیشه روشن می‌ماند */
function srcOn(id) { return !(set.soff && set.soff[id]); }
function actv() { return Core.SOURCES.filter(function (s) { return srcOn(s.id); }); }
function order() { return actv().map(function (s) { return s.id; }); }
if (!actv().length) set.soff = {};                       // همه‌ی سایت‌ها خاموش = داده‌ی خراب؛ همه روشن شوند
var staleN = 0, audOpen = false, hiddenN = 0, TREE = [], BR_BY = {}, MD_BY = {}, nav = { lvl: 0, brand: null }, imgPend = {}, imgTot = 0, imgOk = 0, imgBad = 0, imgLastT = 0, startAnchor = ls.get('pp.last', null), lastTried = 0, prevP = null, FLAT = [], ALLB = [], gateRetried = 0;
var FULL_EVERY = 3 * 86400e3;
function friendly(m) {
  m = String(m || '');
  if (/UnknownHost|resolve host/i.test(m)) return 'سایت پیدا نشد (اینترنت یا DNS)';
  if (/timeout|timed out|زمان انتظار/i.test(m)) return 'سایت دیر جواب داد';
  if (/ConnectException|Unreachable|refused|SSL|Handshake/i.test(m)) return 'اتصال به سایت برقرار نشد';
  if (/Too many follow-up/i.test(m)) return 'سایت درخواست را در چرخه انداخت';
  var h = /HTTP[: ]*(\d{3})/i.exec(m);
  if (h) { var c = +h[1]; return c === 403 || c === 429 || c === 401 ? 'سایت دسترسی را بسته یا محدود کرده (' + fa(c) + ')' : c === 404 ? 'صفحه‌ی سایت پیدا نشد (' + fa(c) + ')' : c >= 500 ? 'سایت خراب یا شلوغ است (' + fa(c) + ')' : 'سایت جواب درست نداد (' + fa(c) + ')'; }
  if (/reset|SocketException|EOF|abort|broken pipe/i.test(m)) return 'اتصال وسطِ کار قطع شد';
  if (m && !/[؀-ۿ]/.test(m)) return 'خطای نامشخص در دریافت از سایت';        // متنِ انگلیسیِ فنی به کاربر نشان داده نمی‌شود (متنِ اصلی در «کپی گزارش» هست)
  return m;
}
var saveFail = false;
/* حافظه‌ی گوشی پر شد: عنوانِ محصولاتِ «عطر نیست» و فرهنگِ واژه‌ها را کم می‌کنیم و دوباره تلاش می‌کنیم؛ اگر باز نشد در گزارش می‌گوییم */
function shrinkDb() {
  Object.keys(db.it).forEach(function (s) { var m = db.it[s]; Object.keys(m).forEach(function (p) { if (!m[p][2]) m[p][0] = ''; }); });
}
function saveDb() {
  var ok = ls.set('pp.db', db);
  if (!ok) { shrinkDb(); ok = ls.set('pp.db', db); }
  if (!ok) { db.wd = {}; ok = ls.set('pp.db', db); }   // آخرین چاره: واژه‌نامه‌ی یادگرفته‌شده دوباره ساخته می‌شود
  saveFail = !ok; ls.set('pp.st', stt);
}

function applyTheme() {
  var t = set.theme === 'auto' ? (mq && mq.matches === false ? 'light' : 'dark') : set.theme;
  document.documentElement.setAttribute('data-th', t);
  var bg = t === 'light' ? '#eef1fb' : '#0c0f1f';
  if (window.Native && window.Native.setBars) try { window.Native.setBars(bg, t === 'light'); } catch (e) {}
  if (curModel && curModel.theme) curModel.theme();
}
if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (set.theme === 'auto') applyTheme(); });

var STALE_H = 10;       // حالت دستی: بعد از این‌همه ساعت قیمت‌ها «قدیمی» حساب می‌شوند و هنگام باز شدنِ برنامه خودکار تازه می‌شوند
function oldestOk() { var m = 0; actv().forEach(function (s) { var t = db.t[s.id] || 0; if (t && (!m || t < m)) m = t; }); return m || lastOk(); }
function needFresh() { var now = Date.now(); return actv().some(function (s) { return !db.t[s.id] || now - db.t[s.id] > STALE_H * 3600000; }); }
function lastOk() { var m = 0; Object.keys(db.t).forEach(function (k) { if (srcOn(k) && db.t[k] > m) m = db.t[k]; }); return m; }
function agoText(ms) {
  var m = Math.floor(ms / 60000);
  if (m < 1) return 'همین الان';
  if (m < 60) return fa(m) + ' دقیقه پیش';
  var h = Math.floor(m / 60);
  if (h < 48) return fa(h) + ' ساعت پیش';
  return fa(Math.floor(h / 24)) + ' روز پیش';
}
function total() { var n = 0; Object.keys(prog).forEach(function (k) { n += prog[k].n || 0; }); return n; }
function firstLoad() { return Object.keys(prog).some(function (k) { return prog[k].mode === 'full'; }); }
function pct() {   // درصد پیشرفت؛ null یعنی نامعلوم
  var ks = Object.keys(prog), sum = 0;
  for (var i = 0; i < ks.length; i++) {
    var p = prog[ks[i]], v;
    if (p.done) v = 1;
    else if (p.pct != null) v = p.pct;
    else { var exp = p.exp || (p.mode === 'full' ? 1300 : 0); if (!exp) return null; v = Math.min(.97, p.n / exp); }   // اولین بار تعدادِ محصولات را نمی‌دانیم؛ حدسِ تقریبی فقط برای نوارِ پیشرفت
    sum += v;
  }
  return ks.length ? sum / ks.length : null;
}
function updPill() {
  var u = $('upd'), t = $('updt'), lo = lastOk();
  u.classList.remove('busy', 'stale');
  if (busy) { u.classList.add('busy'); t.textContent = firstLoad() ? 'دریافت اولیه‌ی عطرها…' : 'در حال بروزرسانی قیمت…'; return; }
  if (!lo) { u.classList.add('stale'); t.textContent = 'قیمتی دریافت نشده'; return; }
  var age = Date.now() - oldestOk();      // قدیمی‌ترین سایتِ روشن؛ یک سایتِ قدیمی در میانگین گم نمی‌شود
  if (saveFail) { u.classList.add('stale'); t.textContent = 'ذخیره نشد؛ حافظه‌ی برنامه پر است'; return; }
  if (age > (autoMs() ? 40 * 60000 : STALE_H * 3600000)) { u.classList.add('stale'); t.textContent = 'قیمت‌ها قدیمی‌اند · ' + agoText(age); }
  else t.textContent = 'آخرین بروزرسانی ' + agoText(age);
}
function srcDone() { return actv().filter(function (s) { return stt[s.id] && stt[s.id].ok; }).length; }   // سایت‌هایی که اطلاعاتشان آمده
function imgLeft() { return Object.keys(imgPend).length; }
/* عکس‌ها: need = مدل‌هایی که عکس دارند (برندهای روشن)، have = آن‌هایی که روی گوشی هست */
function photoStat() {
  var need = 0, have = 0;
  TREE.forEach(function (b) { b.models.forEach(function (m) { if (!m.img) return; need++; if (imgLoc[m.imgId]) have++; }); });
  return { need: need, have: have, pend: imgLeft(), bad: imgBad };
}
function overlay() {
  var o = $('ov');
  if (db.ready && list.length) { o.className = ''; o.innerHTML = ''; o._h = ''; o._g = 0; return; }
  o.className = 'on';
  if (!db.ready) {                       // قفل ورود: تا پایان دانلود اولیه وارد برنامه نمی‌شویم
    var N = actv().length, sd = srcDone(), il = imgLeft(), phase = busy ? 'src' : il > 0 ? 'img' : 'fail';
    var ps = photoStat(), sf = phase === 'src' ? (pct() == null ? 0 : pct()) : 1, imf = ps.need ? ps.have / ps.need : (phase === 'img' ? 0 : 1);
    var all = phase === 'src' ? sf * .75 : phase === 'img' ? .75 + .25 * imf : phase === 'fail' && !ps.have ? .75 * (N ? sd / N : 0) : .75 + .25 * imf;      // شکست: نوار پر نشان داده نشود
    if (!o._g) {                         // اسکلت فقط یک‌بار ساخته می‌شود؛ بعد فقط متن‌ها عوض می‌شوند (تا چرخش دایره از اول شروع نشود)
      o._h = ''; o._g = 1; o._bk = '';
      o.innerHTML = '<div class="gt"><div class="sp" id="gsp"></div><b id="gtt"></b><span id="gts"></span><div class="pb"><i id="gpb"></i></div><div class="st">'
        + '<div id="gr1"><span>فهرست عطرها و قیمت‌ها</span><span id="gv1"></span></div><div id="gr2"><span>عکس‌ها</span><span id="gv2"></span></div></div><div id="gbt"></div></div>';
    }
    $('gsp').style.display = phase === 'fail' ? 'none' : '';
    $('gtt').textContent = phase === 'fail' ? 'اطلاعاتی دریافت نشد' : 'در حال آماده‌سازی برنامه';
    $('gts').textContent = phase === 'fail' ? 'هیچ سایتی جواب نداد. اینترنت را بررسی کنید؛ برنامه خودش دوباره تلاش می‌کند.' : 'بار اول چند دقیقه طول می‌کشد. لطفاً صبر کنید و برنامه را نبندید.';
    $('gpb').style.width = Math.round(all * 100) + '%';
    $('gr1').className = phase !== 'src' && sd > 0 ? 'ok' : '';
    $('gv1').innerHTML = '<bdi>' + fa(sd) + '</bdi> از <bdi>' + fa(N) + '</bdi> سایت' + (phase === 'src' && total() ? ' — <bdi>' + fa(total()) + '</bdi> محصول' : '');
    $('gr2').className = ps.need && il === 0 && ps.have >= ps.need ? 'ok' : '';
    $('gv2').innerHTML = ps.need ? '<bdi>' + fa(ps.have) + '</bdi> از <bdi>' + fa(ps.need) + '</bdi>' + (il > 0 && ps.have > 0 ? ' · <bdi>' + fa(il) + '</bdi> مانده' : '') : phase === 'src' ? 'بعد از فهرست' : '—';
    var bk = phase === 'fail' ? (list.length ? 'f2' : 'f1') : (list.length && sd >= 1 && Date.now() - gateT0 > 30000 ? 'f3' : '');      // بعد از ۳۰ ثانیه، اگر فهرست آماده است، راهِ ورود هست (اینترنتِ کند راه را نبندد)
    if (o._bk !== bk) {                   // دکمه‌ها فقط وقتی حالت عوض شد
      o._bk = bk;
      $('gbt').innerHTML = bk ? (bk === 'f3' ? '' : '<button id="retry">تلاش دوباره</button>') + (bk !== 'f1' ? '<button id="goon" class="gh2">ادامه با اطلاعات فعلی</button>' : '') : '';
      var rb = $('retry'); if (rb) rb.onclick = function () { refresh(true); };
      var gb = $('goon'); if (gb) gb.onclick = function () { db.ready = true; saveDb(); enter(); histTake(); };
    }
    return;
  }
  if (ALLB.length && !TREE.length) { o._h = ''; o._g = 0; o.innerHTML = '<div><b>همه‌ی برندها خاموش‌اند</b>از تنظیمات (چرخ‌دنده) برندها را روشن کنید.</div>'; return; }
  o._h = ''; o._g = 0; o.innerHTML = '<div><b>قیمتی دریافت نشد</b>اینترنت را بررسی کنید و دوباره تلاش کنید.<br><button id="retry">تلاش دوباره</button></div>';
  var b2 = $('retry'); if (b2) b2.onclick = function () { refresh(true); };
}
function toast(msg, ms, undo) {      // undo: تابعی که با زدنِ «بازگردانی» اجرا می‌شود (اشتباهِ انگشت قابل جبران باشد)
  var t = $('toast'); t.textContent = msg; t.classList.add('on'); t.classList.toggle('act', !!undo);
  if (undo) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tundo'; b.textContent = 'بازگردانی';
    b.onclick = function () { t.classList.remove('on', 'act'); clearTimeout(toast._t); try { undo(); } catch (e) { } };
    t.appendChild(b);
  }
  clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on', 'act'); }, ms || 3200);
}
var tickT = 0;
function tick() {   // نمایش زنده‌ی پیشرفت
  if (tickT) return;
  tickT = setTimeout(function () { tickT = 0; updPill(); overlay(); refBtn(); if (open) renderSheet(); }, 250);
}
function refBtn() {
  var b = $('sRef'); if (!b) return;
  b.classList.toggle('busy', busy);
  if (!busy) { b.innerHTML = '<span>بروزرسانی قیمت‌ها همین حالا</span>'; return; }
  var p = pct(), n = total();
  b.innerHTML = '<i class="bar' + (p == null ? ' ind' : '') + '" style="width:' + (p == null ? 40 : Math.round(p * 100)) + '%"></i><span>' + (firstLoad() ? 'دریافت اولیه' : 'بروزرسانی قیمت') + (p == null ? ' …' : ' <bdi>' + fa(Math.round(p * 100)) + '٪</bdi>') + '</span>';
}

/* برند ← مدل ← نوع و قیمت. فهرستِ هر سطح از درخت ساخته می‌شود؛ قیمت فقط در صفحه‌ی جزئیات است */
function GNtxt(gs) { return gs.map(function (g) { return GN[g]; }).join(' · '); }
function curEntries() {
  var b = nav.brand && BR_BY[nav.brand];
  if (b) return b.models.map(function (m) { return { id: m.id, name: m.name, L: m.L, tag: GNtxt(m.gset), hint: 'بزنید تا اندازه‌ها و قیمت‌ها را ببینید', sizes: [], img: m.img, imgId: m.imgId, kind: 'm' }; });
  return TREE.map(function (b2) { return { id: b2.id, name: b2.name, L: b2.L, tag: fa(b2.models.length) + ' عطر', hint: 'بزنید تا نام عطرها را ببینید', sizes: [], img: b2.img, imgId: b2.imgId, kind: 'b' }; });
}
function titleOf() {
  var b = nav.brand && BR_BY[nav.brand];
  return b ? { t: b.name, s: fa(b.models.length) + ' عطر', c: b.name } : { t: 'برندها', s: fa(TREE.length) + ' برند', c: '' };
}
function structOf(l) { return l.length + '|' + l.map(function (p) { return p.id + ':' + p.name + ':' + p.tag; }).join(';'); }
function priceMap(l) { var o = {}; l.forEach(function (g) { o[g.id] = g.sizes.map(function (z) { return z.ml + ':' + z.price; }).join(','); }); return o; }
function setEntries() {
  list = curEntries(); list.forEach(function (p) { p.loc = imgLoc[p.imgId] || ''; });
  struct = structOf(list);
}
/* ---------- تاریخچه و «گزارش بازار» ---------- */
var VM = {}, VA = {}, hist = Core.histFix(ls.get('pp.hist', null)), mkOn = false;
function histTake() {
  try {
    var now = Date.now(), a = actv();
    if (!db.ready || !a.length || !a.every(function (s) { return db.t[s.id] && now - db.t[s.id] < 12 * 3600e3; })) return;   // همه‌ی سایت‌های روشن باید تازه باشند؛ وگرنه کالاهای یک سایتِ خراب «ناموجود» دیده می‌شوند
    Core.histSnap(hist, FLAT, order().join(','), now, function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); }, set.block.join(','), function (g) { var a = VA[g.id]; return a ? { b: a.b, m: a.m } : null; });
    if (!ls.set('pp.hist', hist)) {
      Object.keys(hist.d).forEach(function (k) { var e = hist.d[k]; if (e.p && e.p.length > 2) e.p = [e.p[0], e.p[e.p.length - 1]]; });
      if (!ls.set('pp.hist', hist)) { hist = Core.histNew(); ls.set('pp.hist', hist); }
    }
    if (mkOn) { var sc = $('mkr').scrollTop; mkRender(); $('mkr').scrollTop = sc; }
  } catch (e) { console.error(e); }
}
var mkTab = 'news', mkMore = {}, mkChgN = 0;
function dayT(d) { return d < 1 ? 'امروز' : fa(d) + ' روز پیش'; }
function srcName(id) { var r = ''; Core.SOURCES.forEach(function (s) { if (s.id === id) r = s.name; }); return r || id; }
function spark(pts) {                                    // نمودارِ کوچکِ تغییر قیمت
  if (!pts || pts.length < 2) return '';
  var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), w = 56, h = 18, d = (mx - mn) || 1;
  var xy = pts.map(function (v, i) { return (i * (w - 4) / (pts.length - 1) + 2).toFixed(1) + ',' + (h - 2 - ((v - mn) / d) * (h - 4)).toFixed(1); }).join(' ');
  return '<svg class="spk" width="56" height="18" viewBox="0 0 56 18" aria-hidden="true"><polyline points="' + xy + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
/* عکسِ کوچکِ عطر در ردیف‌ها؛ اگر عطر صفحه‌ی خودش را ندارد (مثلاً ناموجود شده) یک بطریِ ساده */
function mkPh(gid, name) {
  var id = VM[gid], im = id ? entryImg(id) : null, k = 0;
  if (!im) String(name || '').split('').forEach(function (c) { k = (k * 31 + c.charCodeAt(0)) % 64; });
  return '<span class="mph">' + tile({ loc: im ? im.loc : '', img: im ? im.img : '', k: im ? im.k : k }) + '</span>';
}
function mkRow(r, val, sub, spk) {
  var m = VM[r.gid], a = VA[r.gid], lab = [a && a.bn, r.l, fa(r.ml) + ' میل'].filter(Boolean).join('، ');      // «·» کنارِ رقم شبیهِ «۰» دیده می‌شود؛ ویرگول خواناتر است
  return '<button type="button" class="mkr pr" ' + (m ? 'data-m="' + esc(m) + '"' : 'data-q="' + esc(r.name) + '"') + '>' + mkPh(r.gid, r.name)
    + '<div class="mi"><b>' + esc(r.name) + '</b><small>' + esc(lab) + '</small><div class="mv ' + val[0] + '"><b>' + val[1] + '</b>' + (val[2] ? '<small>' + val[2] + '</small>' : '') + (spk || '') + '</div>'
    + (sub ? '<small>' + sub + '</small>' : '') + '</div></button>';
}
function mkInfo(title, body) { return '<div class="mks">' + title + '</div><div class="mkh">' + body + '</div>'; }
function mkSec(id, title, hint, rows, cap0) {
  var base = cap0 || 10, cap = base + (mkMore[id] | 0) * base * 4, shown = rows.slice(0, cap), more = rows.length - shown.length;
  return '<div class="mks">' + title + (rows.length ? ' <span class="mkn">(' + fa(rows.length) + ' مورد)</span>' : '') + '</div><div class="mkh">' + hint + '</div>'
    + (rows.length ? shown.join('') + (more > 0 ? '<button type="button" class="mkmore" data-s="' + id + '">نمایش بیشتر (' + fa(Math.min(more, base * 4)) + ' مورد دیگر)</button>' : '') : '<div class="mkn">موردی نیست.</div>');
}
var mkCmp = { sort: 'd', gn: '' };
function fa1(x) { return (Math.round(x * 10) / 10).toString().replace('.', '٫').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function tmM(n) { return n >= 1e6 ? fa1(n / 1e6) + ' میلیون' : fa(n); }                 // ۱۰٫۹ میلیون
function mkChips(key, st, opts) {
  return '<div class="srchips mkch">' + opts.map(function (o) { return '<button type="button" data-k="' + key + '" data-v="' + o[0] + '"' + (st[key] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div>';
}
function mkView() {
  var vis = function (g) { var a = VA[g.id]; return !(a && (set.hide[a.m] || (set.off || {})[a.b])); };
  var lab = function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); };
  var key = FLAT.length + ':' + treeStamp + ':' + Object.keys(set.hide).sort().join(',') + ':' + Object.keys(set.off || {}).sort().join(',');      // نه فقط تعداد؛ عوض کردنِ یک برند با برندِ دیگر هم دیده شود
  if (mkView.k === key && mkView.v) return mkView.v;
  var V = Core.marketView(FLAT.filter(vis), { lab: lab, brand: function (gid) { var a = VA[gid]; return a ? { id: a.b, name: a.bn } : null; } });
  mkView.k = key; mkView.v = V; return V;
}
/* ---- خبرِ سایت‌ها (مجلهٔ همان فروشگاه‌ها): ذخیره می‌شود، هر چند ساعت یک بار خودش تازه می‌شود، نقطهٔ قرمزِ کنارِ دکمه یعنی خبرِ نادیده ---- */
var news = (function () { var n = ls.get('pp.news', null); if (!n || typeof n !== 'object' || !Array.isArray(n.items)) return { t: 0, items: [], notes: {} }; n.items = n.items.filter(function (x) { return x && typeof x.t === 'string' && typeof x.u === 'string' && Core.itemUrl('x', x.u); }); n.t = +n.t || 0; n.notes = n.notes && typeof n.notes === 'object' ? n.notes : {}; return n; })();
var newsOld = [], newsSt = null, newsMoreBusy = false, newsMoreEnd = false, newsMoreErr = false, NEWS_OLD_MAX = 120;      // خبرهای قدیمی‌تر که با اسکرول می‌آیند (فقط در حافظه؛ هر بار تازه‌سازی صفر می‌شود)
var newsBusy = false, newsTok = 0, newsSeenAt = 0;      // newsSeenAt: «دیده‌شده»ی پیش از باز شدنِ این گزارش؛ خبرِ تازه‌تر از آن «جدید» نشان داده می‌شود
function newsSeenMax() { return +ls.get('pp.newsSeen', 0) || 0; }
function nwDot() { try { var seen = newsSeenMax(); $('nw').classList.toggle('nu', !mkOn && news.items.some(function (x) { return x.d > seen; })); } catch (e) { } }
function newsMarkSeen() { var m = 0; news.items.forEach(function (x) { if (x.d > m) m = x.d; }); if (m > newsSeenMax()) ls.set('pp.newsSeen', m); nwDot(); }
function mkKeep() { var sc = $('mkr').scrollTop; try { mkRender(); } catch (e) { console.error(e); } $('mkr').scrollTop = sc; }
function newsLoad(mode) {                  // mode: 'force' (دکمه‌ی «دوباره»)، 'open' (باز شدنِ گزارش)، 'bg' (پس‌زمینه)
  if (newsBusy) return;
  var now = Date.now(), gap = mode === 'force' ? 0 : mode === 'open' ? 10 * 60e3 : 60 * 60e3;
  if (mode !== 'force' && news.t && now - news.t < 3 * 3600e3) return;                // خبرِ تازه دارد
  if (now - (+ls.get('pp.newsTry', 0) || 0) < gap) return;                            // تازه تلاش شده؛ اینترنتِ ضعیف را خسته نکند
  ls.set('pp.newsTry', now); newsBusy = true; var tok = ++newsTok;
  if (mkOn && mkTab === 'news') mkKeep();
  var done = function (r) {
    if (tok !== newsTok || !newsBusy) return; newsBusy = false;
    if (r && r.items && r.items.length) {
      var nt = r.notes || {}, seenU = {}, all = [], lim = Date.now() - 60 * 864e5, per = {};
      r.items.map(function (x) { return [x, 1]; }).concat(news.items.filter(function (x) { return x.d > 0 || nt[x.s] === 'fail'; }).map(function (x) { return [x, 0]; })).forEach(function (e) {      // تازه‌ها اول (اگر تکراری بود، نسخه‌ی تازه می‌ماند)؛ خبرهای قبلی هم می‌مانند تا صفحه خالی و کوتاه نشود
        var x = e[0]; if (seenU[x.u] || (!e[1] && x.d > 0 && x.d < lim)) return; seenU[x.u] = 1; all.push(x);      // آنچه همین دریافت آورده همیشه می‌ماند؛ فقط خبرِ قدیمیِ ذخیره‌شده بعد از ۶۰ روز می‌پرد
      });
      all.sort(function (a, b) { return b.d - a.d; });
      all = all.filter(function (x) { per[x.s] = (per[x.s] | 0) + 1; return per[x.s] <= 10; }).slice(0, 30);      // یک سایتِ پرنوشته همه‌جا را نگیرد
      news = { t: Date.now(), items: all, notes: nt }; ls.set('pp.news', news);
      if (mode === 'force' || !newsOld.length || !newsSt) { newsSt = r.st || null; newsOld = []; newsMoreEnd = false; newsMoreErr = false; }
      else { var nu = {}; all.forEach(function (x) { nu[x.u] = 1; }); newsOld = newsOld.filter(function (x) { return !nu[x.u]; }); }      // تازه‌سازیِ خودکارِ وسطِ خواندن: خبرهای قدیمی‌ترِ آمده نمی‌پرند و صفحه نمی‌پرد
    }
    else if (r) news.notes = r.notes || {};
    if (mkOn && mkTab === 'news') { newsMarkSeen(); mkKeep(); if (mode === 'force') $('mkr').scrollTop = 0; } else nwDot();      // دکمه‌ی «تازه‌سازی» ته صفحه است؛ بعدش تازه‌ترین‌ها را از بالا نشان بده
  };
  try { Core.fetchNews(net).then(done, function (e) { console.error(e); done(null); }); } catch (e) { console.error(e); done(null); }
}
var NW_ABB = { liliome: 'لی', safir: 'سف', hiland: 'های', digikala: 'دی', hes: 'حس', flower: 'فل', khalife: 'خل', redmag: 'رد' };
var NW_COL = { liliome: '#6d4ad6', safir: '#c8402f', hiland: '#1f8f56', digikala: '#d6303f', hes: '#0e7c86', flower: '#c2559a', khalife: '#8a5a1f', redmag: '#b3261e' };
function newsKey(t) { var k = 0; String(t || '').split('').forEach(function (c) { k = (k * 31 + c.charCodeAt(0)) % 64; }); return k; }
/* هر خبر یک «پست» است مثل اینستاگرام: بالا نامِ سایت و زمان، عکسِ بزرگ، تیتر، دو خطِ خلاصه؛ لمسِ هرجای کارت خبر را در مرورگر باز می‌کند */
function newsCard(x) {
  var k = newsKey(x.t), isNew = newsSeenAt > 0 && x.d > newsSeenAt, nm = String(x.sn || x.s || '').replace(/^مجله‌ی\s*/, ''), ago = x.d > 0 ? agoText(Date.now() - x.d) : '';
  var pic = x.img ? '<span class="nfi"><img class="nimg" src="' + esc(x.img) + '" data-k="' + k + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>'
    : '<span class="nfi ph">' + bottle(k, themeNow() === 'light') + '</span>';
  return '<button type="button" class="nwc" data-u="' + esc(x.u) + '"><span class="nfh"><i class="nfa" style="background:' + (NW_COL[x.s] || '#5b4bd6') + '">' + esc(NW_ABB[x.s] || nm.slice(0, 2) || '؟') + '</i>'
    + '<span class="nfs"><b>' + esc(x.sn || '') + '</b>' + (ago ? '<small>' + ago + '</small>' : '') + '</span>' + (isNew ? '<em class="nfnew">جدید</em>' : '') + '</span>'
    + pic + '<span class="nft">' + esc(x.t) + '</span>' + (x.x ? '<span class="nfx">' + esc(x.x) + '</span>' : '') + '<span class="nfg">خواندن در مرورگر ‹</span></button>';
}
/* ته فید: در حال آوردن / خطا (دکمه) / تمام. وقتی کاربر نزدیکِ ته می‌رسد، خبرهای قدیمی‌تر خودکار می‌آید؛ لازم نیست دکمه‌ای بزند */
function nfMoreHtml() {
  if (newsMoreEnd) return 'خبرهای بیشتری فعلاً نیست';
  if (newsMoreErr) return '<button type="button" class="mkmore" data-act="newsmore">خبرهای قدیمی‌تر را بیاور</button>';
  return newsMoreBusy ? '<span class="spn"></span>در حال آوردن خبرهای قدیمی‌تر…' : 'پایین‌تر بروید تا خبرهای قدیمی‌تر بیاید';
}
function nfSync(cards) {
  try {
    if (!mkOn || mkTab !== 'news') return;
    var el = $('nfmore'); if (!el) return;
    if (cards && cards.length) el.insertAdjacentHTML('beforebegin', cards.map(newsCard).join(''));      // فقط کارت‌های تازه اضافه می‌شود؛ صفحه نمی‌پرد
    el.innerHTML = nfMoreHtml();
  } catch (e) { console.error(e); }
}
function nfCheck() {
  if (!mkOn || mkTab !== 'news' || newsMoreBusy || newsMoreEnd || newsMoreErr || newsBusy || !news.items.length) return;
  var m = $('mkr'); if (m.scrollHeight - m.scrollTop - m.clientHeight < 900) newsMoreLoad();
}
function newsMoreLoad() {
  if (newsMoreBusy || newsMoreEnd || newsBusy || !news.items.length) return;
  newsMoreBusy = true; newsMoreErr = false; nfSync();
  var tok = newsTok, have = {}; news.items.concat(newsOld).forEach(function (x) { have[x.u] = 1; });
  var fin = function (r) {
    newsMoreBusy = false;
    if (tok !== newsTok) {      // وسطِ کار تازه‌سازی شد: نتیجه نمایش داده نمی‌شود؛ ولی خبرها گم نشوند (به صفِ همان سایت برمی‌گردند)
      if (r && r.items && newsSt) r.items.forEach(function (x) { var e = newsSt[x.s]; if (e && Array.isArray(e.pend)) e.pend.unshift(x); });
      nfSync(); setTimeout(nfCheck, 150); return;
    }
    var cards = [];
    if (!r) newsMoreErr = true;
    else {
      newsSt = r.st || newsSt;
      if (r.items.length) { cards = r.items.slice(0, Math.max(0, NEWS_OLD_MAX - newsOld.length)); newsOld = newsOld.concat(cards); }
      if (r.done || newsOld.length >= NEWS_OLD_MAX) newsMoreEnd = true; else if (!r.items.length && r.failed) newsMoreErr = true;
    }
    nfSync(cards);
    if (!newsMoreEnd && !newsMoreErr) setTimeout(nfCheck, 150);      // هنوز نزدیکِ ته است (فید کوتاه بود)؟ ادامه
  };
  try { Core.newsMore(net, newsSt, have).then(fin, function (e) { console.error(e); fin(null); }); } catch (e) { console.error(e); fin(null); }
}
function mkNewsSec() {
  var items = news.items, h = '';
  var st = newsBusy ? '<span class="spn"></span>در حال گرفتن خبر تازه…' : (news.t ? 'بروزرسانی: ' + agoText(Date.now() - news.t) + ' (هر ۳ ساعت خودکار)' : '');
  if (st) h += '<div class="nfst">' + st + '</div>';
  if (items.length) h += items.concat(newsOld).map(newsCard).join('') + '<div class="nfend" id="nfmore">' + nfMoreHtml() + '</div>';
  else if (newsBusy) h += '<div class="nfsk"></div><div class="nfsk"></div>';
  else h += '<div class="mkn">فعلاً خبری از سایت‌ها نرسید. شاید اینترنت ضعیف است یا سایت‌ها خبر تازه نگذاشته‌اند.</div>';
  h += '<button type="button" class="mkmore" data-act="news"' + (newsBusy ? ' disabled' : '') + '>' + (newsBusy ? 'در حال گرفتن…' : items.length ? 'تازه‌سازیِ خبرها' : 'دوباره امتحان کن') + '</button>';
  return h;
}
function mkRender() {
  var tm = function (n) { return fa(n) + ' تومان'; }, pct = function (x) { return fa(Math.abs(x) * 100) + '٪'; };
  var vis = function (r) { var a = VA[r.gid] || (r.b ? { m: r.hm, b: r.b } : null); return !(a && ((a.m && set.hide[a.m]) || (set.off || {})[a.b])); };      // پنهان‌شده‌ها و برندهای خاموش در گزارش نیایند (حتی وقتی عطر دیگر در فهرست نیست)
  Array.prototype.forEach.call($('mkt2').children, function (b) { b.classList.toggle('on', b.dataset.t === mkTab); });
  var h = '', V = mkView(), hs = mkTab === 'news' || mkTab === 'chg';
  var R = hs ? Core.histReport(hist, FLAT, Date.now(), { thr: 0.08, sig: order().join(','), lab: function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); } }) : null;
  if (R) {
    ['up', 'down', 'gone', 'back', 'low', 'fresh'].forEach(function (k) { R[k] = R[k].filter(vis); });
    /* شمارنده‌ی تبِ «قیمت‌ها» = تعدادِ تغییرهایی که هنوز ندیده‌ای. با باز کردنِ تبِ «قیمت‌ها» دیده حساب می‌شوند و عدد محو می‌شود؛ فقط تغییرِ تازه دوباره عدد می‌آورد */
    var ck = []; [['down', 'd'], ['up', 'u'], ['fresh', 'f'], ['back', 'b'], ['gone', 'g']].forEach(function (c) { R[c[0]].forEach(function (r) { ck.push(c[1] + ':' + r.k); }); });
    var sn = ls.get('pp.chgSeen', []), sm = {}; if (Array.isArray(sn)) sn.forEach(function (k) { sm[k] = 1; });
    mkChgN = ck.filter(function (k) { return !sm[k]; }).length;
    if (mkTab === 'chg') { ls.set('pp.chgSeen', ck); mkChgN = 0; }      // دیده شد (فهرستِ دیده‌شده با فهرستِ فعلی عوض می‌شود تا بزرگ نشود؛ تغییری که رفت و دوباره آمد، تازه حساب می‌شود)
  }
  var ct = $('mkt2').querySelector('[data-t="chg"]'); if (ct) ct.innerHTML = 'قیمت‌ها' + (mkChgN ? '<i>' + (mkChgN > 99 ? '۹۹+' : fa(mkChgN)) + '</i>' : '');      // شمارنده: چند عطر قیمت یا موجودی‌شان عوض شده
  var dealRow = function (r) {
    return mkRow(r, ['gn', pct(r.pct) + ' اختلاف', '<span class="pnum">' + tm(r.d) + '</span> فرق'], 'ارزان‌تر: ' + esc(srcName(r.loS)) + '، ' + pzh(r.lo, 'dn') + '<br>گران‌تر: ' + esc(srcName(r.hiS)) + '، ' + pzh(r.hi, 'up'));
  };
  var rowFresh = function (r) { return mkRow(r, ['dn', 'تازه آمده', dayT(r.ago)], 'قیمت: ' + pzh(r.price)); };
  var rowBack = function (r) { return mkRow(r, ['dn', 'دوباره موجود شد', dayT(r.ago)], 'قیمت: ' + pzh(r.price)); };
  if (mkTab === 'news') {
    /* خبرِ سایت‌ها: یک فیدِ اسکرولی مثل اینستاگرام. تغییرِ قیمت‌ها و مقایسه در دو تبِ بالا هستند (روی تبِ «قیمت‌ها» شمارنده می‌آید) */
    h += mkNewsSec();
  } else if (mkTab === 'cmp') {
    var MS = Core.marketStats(FLAT.filter(function (g) { return vis({ gid: g.id }); })), lo = lastOk();
    h += '<div class="mkh first">' + (lo ? 'قیمت‌ها ' + esc(agoText(Date.now() - lo)) + ' بروز شد. ' : '') + fa(V.nPerf) + ' عطر از ' + fa(TREE.length) + ' برند.</div>';
    /* نتیجه‌گیری‌های آماده: بدون نیاز به تاریخچه */
    var best = null, worst = null;
    Object.keys(MS.bySrc).forEach(function (id) { var s = MS.bySrc[id]; if (s.shared < 5) return; if (!best || s.avg < MS.bySrc[best].avg) best = id; if (!worst || s.avg > MS.bySrc[worst].avg) worst = id; });
    var ins = [];
    if (best && worst && best !== worst && MS.bySrc[worst].avg - MS.bySrc[best].avg >= 0.01) ins.push('<b>' + esc(srcName(best)) + '</b> در عطرهای مشترک معمولاً ارزان‌ترین است (' + pct(MS.bySrc[best].avg - 1) + ' زیر میانهٔ بازار)؛ <b>' + esc(srcName(worst)) + '</b> معمولاً گران‌تر است (' + pct(MS.bySrc[worst].avg - 1) + ' بالاتر).');
    if (V.nDeals) ins.push('در <b>' + fa(V.nDeals) + '</b> عطر، فروشگاه‌ها بیش از ۵٪ با هم اختلاف دارند. اگر همه را از ارزان‌ترین فروشگاه بخرید، در مجموع <span class="pnum">' + tm(V.save) + '</span> صرفه‌جویی می‌شود.');
    var bs = V.brands.filter(function (b) { return b.n >= 3; }).sort(function (a, b) { return b.med - a.med; });
    if (bs.length >= 2) ins.push('گران‌ترین برند (میانهٔ ۱۰۰ میل): <b>' + esc(bs[0].name) + '</b> با <span class="pnum">' + tmM(bs[0].med) + ' تومان</span>؛ ارزان‌ترین: <b>' + esc(bs[bs.length - 1].name) + '</b> با <span class="pnum">' + tmM(bs[bs.length - 1].med) + ' تومان</span>.');
    if (V.top[0] && V.low[0]) ins.push('گران‌ترین عطر ۱۰۰ میلی: <b>' + esc(V.top[0].name) + '</b> (<span class="pnum">' + tmM(V.top[0].price) + ' تومان</span>)؛ ارزان‌ترین: <b>' + esc(V.low[0].name) + '</b> (<span class="pnum">' + tmM(V.low[0].price) + ' تومان</span>).');
    if (ins.length) h += '<div class="mks">نتیجه</div>' + ins.map(function (t) { return '<div class="mki">' + t + '</div>'; }).join('');
    var rowsS = Object.keys(MS.bySrc).sort(function (a, b) { return MS.bySrc[b].n - MS.bySrc[a].n; }).map(function (id) {
      var s = MS.bySrc[id], line1 = fa(s.n) + ' اندازه‌ی عطر دارد', line2 = '', cls = 'gn', val = '—';
      if (s.shared >= 5) {
        var d = s.avg - 1; val = (Math.abs(d) < 0.01 ? 'هم‌سطح' : pct(d) + (d > 0 ? ' گران‌تر' : ' ارزان‌تر')); cls = d > 0.01 ? 'up' : d < -0.01 ? 'dn' : 'gn';
        line2 = 'ارزان‌ترین بوده در ' + fa(s.cheapest) + ' مورد از ' + fa(s.shared) + ' موردِ مشترک با فروشگاه‌های دیگر';
      } else line2 = 'موردِ مشترکِ کافی برای مقایسه ندارد';
      return '<div class="mkr nl"><div class="mi"><b>' + esc(srcName(id)) + '</b><small>' + line1 + '</small><small>' + line2 + '</small></div><div class="mv ' + cls + '"><b>' + val + '</b><small>نسبت به میانهٔ بازار</small></div></div>';
    });
    h += mkInfo('فروشگاه‌ها با هم', 'قیمتِ هر فروشگاه در عطرهایی که چند فروشگاه دارند با میانهٔ بازار مقایسه شده است. فروشگاهی که معمولاً «ارزان‌تر» است جای خوبی برای خرید است.') + (rowsS.join('') || '<div class="mkn">هنوز داده‌ی کافی نیست.</div>');
    var rows = V.deals.filter(function (r) { return !mkCmp.gn || r.gn === mkCmp.gn; });
    rows.sort(mkCmp.sort === 'p' ? function (a, b) { return b.pct - a.pct; } : function (a, b) { return b.d - a.d; });
    h += mkChips('sort', mkCmp, [['d', 'بیشترین صرفه'], ['p', 'بیشترین درصد']]) + mkChips('gn', mkCmp, [['', 'همه'], ['m', 'مردانه'], ['w', 'زنانه'], ['u', 'یونیسکس']]);
    h += mkSec('cmp', 'کدام عطر را از کجا بخرم؟', 'همان عطر و همان اندازه که چند فروشگاه دارند و قیمت‌شان دست‌کم ۵٪ فرق دارد. ممکن است یکی از قیمت‌ها اشتباه باشد؛ قبل از خرید چک کنید.', rows.map(dealRow), 12);
  } else {
    var T = R.trend;
    h += '<div class="mkh first">' + (R.span < 1 ? 'ثبت تاریخچه از همین امروز شروع شده است؛ بعد از چند روز این صفحه پر می‌شود.' : 'تاریخچه ' + fa(R.span) + ' روز است ثبت می‌شود.') + '</div>';
    if (T.n >= 5) h += mkInfo('روند کلی', 'از ' + fa(T.n) + ' عطری که تاریخچه دارد: <b>' + fa(T.up) + '</b> گران‌تر شده، <b>' + fa(T.down) + '</b> ارزان‌تر شده و <b>' + fa(T.same) + '</b> تقریباً ثابت مانده است. میانهٔ تغییر: <b>' + (T.med > 0.0005 ? pct(T.med) + ' گران‌تر' : T.med < -0.0005 ? pct(T.med) + ' ارزان‌تر' : 'تقریباً بدون تغییر') + '</b>.');
    h += mkSec('down', 'ارزان شده‌اند', 'قیمت در ۳۰ روز اخیر دست‌کم ۸٪ پایین آمده. زمان خوبی برای خرید است.',
      R.down.map(function (r) { return mkRow(r, ['dn', pct(r.pct) + ' ارزان‌تر', dayT(r.ago)], 'قبلاً: <span class="was">' + tm(r.from) + '</span><br>الان: ' + pzh(r.to, 'dn'), spark(r.pts)); }), 8);
    h += mkSec('up', 'گران شده‌اند', 'قیمت در ۳۰ روز اخیر دست‌کم ۸٪ بالا رفته. اگر از این‌ها دارید، احتمالاً می‌توانید گران‌تر بفروشید؛ اگر ندارید، زودتر بخرید.',
      R.up.map(function (r) { return mkRow(r, ['up', pct(r.pct) + ' گران‌تر', dayT(r.ago)], 'قبلاً: <span class="was">' + tm(r.from) + '</span><br>الان: ' + pzh(r.to, 'up'), spark(r.pts)); }), 8);
    h += mkSec('back', 'دوباره موجود شده‌اند', 'مدتی نبودند و در دو هفته‌ی اخیر دوباره پیدا شدند.', R.back.map(rowBack), 8);
    h += mkSec('fresh', 'تازه‌های بازار', 'در هفته‌ی اخیر برای اولین بار در فروشگاه‌ها دیده شده‌اند.', R.fresh.map(rowFresh), 8);
    h += mkSec('gone', 'ناموجود شده‌اند', 'این اندازه الان در هیچ‌کدام از فروشگاه‌ها دیده نمی‌شود. اگر مشتری خواست، زودتر تهیه کنید.',
      R.gone.map(function (r) { return mkRow(r, ['up', 'ناموجود', dayT(r.ago)], (r.price ? 'آخرین قیمت: ' + pzh(r.price) : '') + (r.was ? '<br>قبلاً در ' + fa(r.was) + ' فروشگاه بود' : '')); }), 8);
    h += mkSec('low', 'موجودی کم شده', 'تعداد فروشگاه‌هایی که این را دارند کمتر شده؛ یعنی دارد کم‌یاب می‌شود.',
      R.low.map(function (r) { return mkRow(r, ['gn', 'کم‌یاب', 'در ' + fa(r.now) + ' فروشگاه'], 'قبلاً در ' + fa(r.was) + ' فروشگاه بود، قیمت: ' + pzh(r.price)); }), 6);
  }
  $('mkr').innerHTML = h;
  if (mkOn) fitPz($('mkr'));
  if (mkTab === 'news') setTimeout(nfCheck, 200);
}
$('mkr').addEventListener('scroll', nfCheck, { passive: true });
function openReport() {
  mkTab = 'news'; newsSeenAt = newsSeenMax();      // پیش از اولین نقاشیِ صفحه: خبرِ تازه‌تر از آخرین دیدن «جدید» می‌شود
  try { mkRender(); } catch (e) { console.error(e); toast('گزارش ساخته نشد', 3000); return; }      // تاریخچه‌ی سالم هرگز به‌خاطر یک خطا پاک نمی‌شود (داده‌ی خراب هنگام خواندن اصلاح می‌شود)
  layerMark(); mkOn = true; closeSearch(); if (open) closeSheet(); $('mk').classList.add('on'); $('mkr').scrollTop = 0; fitPz($('mkr'));
  newsMarkSeen(); newsLoad('open');
}
function closeReport() { layerMark(); mkOn = false; $('mk').classList.remove('on'); nwDot(); }
$('nw').onclick = openReport; $('mkx').onclick = closeReport;
$('mkt2').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b || !b.dataset.t) return; mkTab = b.dataset.t;
  try { mkRender(); } catch (e2) { console.error(e2); } $('mkr').scrollTop = 0;
  if (mkTab === 'news') { newsMarkSeen(); newsLoad('open'); }
});
/* لمسِ هر ردیف، صفحه‌ی قیمتِ همان عطر را «روی» گزارش باز می‌کند؛ «برگشت» دوباره به همین گزارش (با همان جای اسکرول) برمی‌گرداند */
$('mkr').addEventListener('click', function (e) {
  if (ghosted()) return;
  var ch = e.target.closest('.mkch button'); if (ch) { mkCmp[ch.dataset.k] = ch.dataset.v; mkKeep(); return; }
  var go = e.target.closest('button[data-go]'); if (go) { mkTab = go.dataset.go; mkRender(); $('mkr').scrollTop = 0; return; }
  var nc = e.target.closest('button.nwc'); if (nc) { openLink(nc.dataset.u); return; }
  var ac = e.target.closest('button[data-act="news"]'); if (ac) { newsLoad('force'); return; }
  var am = e.target.closest('button[data-act="newsmore"]'); if (am) { newsMoreErr = false; newsMoreLoad(); return; }
  var mo = e.target.closest('button.mkmore[data-s]'); if (mo) { mkMore[mo.dataset.s] = (mkMore[mo.dataset.s] | 0) + 1; mkKeep(); return; }
  var b = e.target.closest('button.mkr'); if (!b) return;
  if (b.dataset.m && MD_BY[b.dataset.m]) { openDetail(b.dataset.m); return; }
  if (b.dataset.q) { closeReport(); openSearch(b.dataset.q); }      // عطری که صفحه‌ی مستقیم ندارد (مثلاً ناموجود شده): جستجو با نامش
});
nwDot();
/* فهرستِ نمایشی را از حافظه می‌سازد؛ اگر فقط قیمت‌ها عوض شده باشد، همان صفحه سر جایش می‌ماند و فقط صفحه‌ی جزئیات (اگر باز است) بروز می‌شود */
/* «مهرِ داده»: اگر هیچ قیمت/زمان/گروهی عوض نشده باشد، درخت دوباره ساخته نمی‌شود (ساختنش روی گوشی چند ثانیه است) و از فایلِ ذخیره‌شده خوانده می‌شود */
function dataStamp(lang) {
  var now = Date.now(), wc = 0; try { if (window.Native && window.Native.webCode) wc = window.Native.webCode() | 0; } catch (e) { }
  var p = [VERSION, wc, lang, Object.keys(db.g).length, Object.keys(db.wd || {}).length, db.dv | 0];
  order().forEach(function (s) {
    var m = db.it[s] || {}, n = 0, a = 0, b = 0, c = 0, tmin = db.t[s] ? Math.floor(Math.min(db.t[s], now) / 60000) : 0, nowM = Math.floor(now / 60000);
    for (var k in m) {
      var e = m[k]; n++; a += e[1] | 0; c += e[2] ? e[2].charCodeAt(e[2].length - 1) + e[2].length : 0;
      if (!e[4] || e[4] > nowM + 10 || (tmin && e[4] < tmin - 240)) b += n * 7 + 1;      // «کهنه» بودن (همان قاعده‌ی buildList)؛ نه خودِ زمانِ دیده‌شدن: دریافتِ بی‌تغییر نباید درخت را دوباره بسازد
    }
    p.push(s + ':' + n + ':' + a + ':' + b + ':' + c + ':' + ((db.t[s] && now - db.t[s] <= 12 * 3600e3) ? 1 : 0));
  });
  return p.join('|');
}
var treeStamp = '', treeSaveT = 0;
function flatOf(tree, bare) {
  var o = bare ? bare.slice() : []; tree.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { o.push(v); }); }); });
  return o;
}
function treeSave(lang, stamp, tree, l) {
  if (!fileOk()) return;
  clearTimeout(treeSaveT);
  treeSaveT = setTimeout(function () {
    try {
      var inT = {}; tree.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { inT[v.id] = 1; }); }); });
      var bare = l.filter(function (g) { return !inT[g.id]; });
      window.Native.fileSet('pp.tree', JSON.stringify({ stamp: stamp, tree: tree, bare: bare, hid: l.hidden || 0, stale: l.stale || 0, audit: tree.audit || null }));
    } catch (e) { }
  }, 2500);
}
function rebuild(light) {
  var lang = set.lang === 'en' ? 'en' : 'fa', stamp = dataStamp(lang), l;
  if (ALLB.length && stamp === treeStamp) l = FLAT;                    // داده همان است (فقط روشن/خاموشیِ برندها یا عطرها عوض شده)
  else if (!ALLB.length && !light && fileOk()) {                       // اولین ساخت بعد از باز شدن برنامه: از فایل
    try {
      var raw = window.Native.fileGet('pp.tree'), c = raw ? JSON.parse(raw) : null;
      if (c && c.stamp === stamp && c.tree && c.tree.length) {
        ALLB = c.tree; if (c.audit) ALLB.audit = c.audit;
        window.__treeSrc = 'cache'; l = flatOf(ALLB, c.bare); l.hidden = c.hid; l.stale = c.stale; treeStamp = stamp; hiddenN = l.hidden || 0; staleN = l.stale || 0; FLAT = l;
      }
    } catch (e) { ALLB = []; l = null; }
  }
  if (!l) {
    l = Core.buildList(db, order(), TRUSTED, 12 * 3600e3, order());
    if (!l.length && lastOk()) { var l2 = Core.buildList(db, order(), TRUSTED, 0, order()); if (l2.length) l = l2; }      // همه‌ی قیمت‌ها قدیمی‌اند: به‌جای صفحه‌ی خالی همان‌ها را نشان بده (نشانگرِ بالا قرمز و «قدیمی» می‌شود)
    hiddenN = l.hidden || 0; staleN = l.stale || 0; FLAT = l;
    window.__treeSrc = 'build'; ALLB = Core.tree(l, lang, db.wd); treeStamp = stamp; treeSave(lang, stamp, ALLB, l);
  }
  set.off = set.off || {};
  TREE = ALLB.filter(function (b) { return !set.off[b.id]; }).map(function (b) {
    var ms = b.models.filter(function (m) { return !set.hide[m.id]; });      // عطرهایی که کاربر پنهان کرده
    return ms.length === b.models.length ? b : Object.assign({}, b, { models: ms });
  }).filter(function (b) { return b.models.length; });
  BR_BY = {}; MD_BY = {};
  VM = {}; VA = {};
  ALLB.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { VA[v.id] = { m: m.id, b: b.id, bn: b.name }; }); }); });
  TREE.forEach(function (b) { BR_BY[b.id] = b; b.models.forEach(function (m) { m.brandId = b.id; MD_BY[m.id] = m; m.variants.forEach(function (v) { VM[v.id] = m.id; }); }); });
  srWarm();      // نمایه‌ی جستجو را وقتِ بیکاری بساز، نه وقتی پدر روی ذره‌بین می‌زند
  if (nav.brand && !BR_BY[nav.brand]) { nav.lvl = 0; nav.brand = null; }
  var vis = []; TREE.forEach(function (b) { b.models.forEach(function (m) { m.variants.forEach(function (v) { vis.push(v); }); }); });
  var np = priceMap(vis), ch = 0;
  if (prevP) Object.keys(np).forEach(function (k) { if (prevP[k] !== undefined && prevP[k] !== np[k]) ch++; });
  prevP = np;
  var before = struct, hadModel = !!curModel;
  setEntries();
  if (dtId) { if (MD_BY[dtId]) renderDetail(); else closeDetail(); }
  if (vwId) refreshViewer();
  navUi();
  if (!db.ready) { overlay(); return -1; }
  if (hadModel && before === struct) { if (curModel.refresh) curModel.refresh(); overlay(); return ch; }
  var anchor = curModel ? curModel.getAnchor() : (nav.lvl ? null : startAnchor);
  mountModel(anchor);
  overlay();
  return -1;
}
function mountModel(anchor) {
  if (curModel) { curModel.destroy(); curModel = null; }
  if (!list.length || !db.ready) return;
  var T = titleOf();
  curModel = MODELS[set.model]($('stage'), decorate(list, T.t, T.s, T.c), anchor);
}
/* ورود به برنامه (بعد از پایان دانلود اولیه) */
function enter() { setEntries(); mountModel(nav.lvl ? null : startAnchor); overlay(); navUi(); updPill(); }
var gateImgT = 0, gateTm = 0, gateT0 = Date.now();
setTimeout(function () { if (!db.ready) overlay(); }, 31000);
function checkReady() {
  if (db.ready || busy) return;
  if (imgLeft() > 0) {      // عکس‌ها در حال دانلود: تا ۴۵ ثانیه صبر؛ بعد وارد می‌شویم و عکس‌ها پشت‌صحنه ادامه می‌دهند (اینترنتِ کند پدر را پای صفحه‌ی انتظار نگه ندار)
    if (!gateImgT) gateImgT = Date.now();
    var wl = 45000 - (Date.now() - gateImgT);
    if (wl > 0 || srcDone() < 1 || !list.length) { overlay(); clearTimeout(gateTm); gateTm = setTimeout(checkReady, Math.max(1000, wl)); return; }
  }
  if (srcDone() < actv().length && !gateRetried) { gateRetried = 1; overlay(); setTimeout(function () { refresh(false); }, 2500); return; }   // سایتِ ناموفق یک‌بار دیگر امتحان می‌شود؛ بعد هر سایتی که در دسترس بود کافی است
  if (srcDone() < 1 || !list.length) { overlay(); return; }
  db.ready = true; saveDb(); enter(); histTake();
}

/* ---- رفتن بین سطح‌ها ---- */
var swapping = false;
function swap(anchor) {
  var st = $('stage'); st.classList.add('out'); swapping = true; layerMark();
  setTimeout(function () { swapping = false; setEntries(); mountModel(anchor); navUi(); st.classList.remove('out'); layerMark(); }, RM ? 0 : 140);      // نشانه‌ی دوم: ساختنِ لیست روی گوشیِ کند ممکن است از ۳۵۰ میلی‌ثانیه بیشتر طول بکشد
}
function openEntry(id) {
  if (swapping) return;
  if (BR_BY[id]) { nav.lvl = 1; nav.brand = id; ls.set('pp.last', id); startAnchor = id; swap(null); }
  else if (MD_BY[id]) openDetail(id);
}
function goUp() {
  if (swapping) return true;                    // دو بار پشت‌سرهم زدنِ «برگشت» برنامه را نبندد
  if (nav.lvl === 0) return false;
  var b = nav.brand; nav.lvl = 0; nav.brand = null; swap(b); return true;
}
function navUi() { var dk = !!db.ready, was = document.body.classList.contains('dk'); document.body.classList.toggle('dk', dk); if (dk !== was) { try { window.dispatchEvent(new Event('resize')); } catch (e) { } }      // نوار پایین آمد/رفت: مدل لیست ارتفاعش را دوباره بسنجد
  var b = $('bk'); if (b) b.classList.toggle('on', nav.lvl === 1 && !!db.ready); var q = $('sr'); if (q) q.style.display = db.ready && !(nav.lvl === 1) ? '' : 'none'; var nw = $('nw'); if (nw) nw.classList.toggle('on', !!db.ready && nav.lvl !== 1); }
$('bk').onclick = function () { goUp(); };
$('stage').addEventListener('click', function (e) {
  var h = e.target.closest && e.target.closest('.rw,.pn'); if (!h || !h.dataset.id) return;
  if (e.target.closest('.tile')) viewImg(h.dataset.id, list.map(function (p) { return p.id; }), 'stage'); else openEntry(h.dataset.id);
});

/* ---- صفحه‌ی جزئیات: نوع‌ها (مردانه/زنانه) و اندازه‌ها با قیمت ---- */
var dtId = null, dtEl = $('dt'), szOpen = {};
function srcName(id) { var r = ''; Core.SOURCES.forEach(function (s) { if (s.id === id) r = s.name; }); return r || id; }
/* صفحه‌ی محصول در مرورگر گوشی باز می‌شود (در برنامه فقط سایت‌های خودِ برنامه) */
function openLink(u) {
  window.__lastOpen = u;
  if (!/^https?:\/\//i.test(u || '') || !Core.itemUrl('x', u)) return;          // فقط آدرسِ سایت‌های خودِ برنامه
  var now = Date.now(); if (now - (openLink.t || 0) < 700) return; openLink.t = now;   // دو بار لمس = یک بار باز شدن
  if (window.Native && window.Native.open) { var okOpen = false; try { okOpen = window.Native.open(u); } catch (e) { } if (!okOpen) { openLink.t = 0; toast('باز نشد؛ مرورگر پیدا نشد یا آدرس درست نبود', 3200); } return; }
  try { window.open(u, '_blank', 'noopener'); } catch (e2) { }   // فقط در مرورگرِ آزمایشی، نه در برنامه
}
function entryImg(id) {
  var o = BR_BY[id] || MD_BY[id]; if (!o) return null;
  return { img: o.img, big: o.big || o.img, loc: imgLoc[o.imgId] || '', k: parseInt(String(o.imgId).replace(/^b/, ''), 36) % 64 || 0, name: o.name };
}
function dact(id) {
  var fv = !!set.fav[id];
  return '<div class="dact"><button type="button" class="' + (fv ? 'on' : '') + '" data-a="fav">' + (fv ? '★ در لیست مغازه' : '☆ افزودن به لیست مغازه') + '</button></div>';
}
function renderDetail() {
  var m = MD_BY[dtId]; if (!m) return;
  var im = entryImg(dtId);
  var vs = m.variants.map(function (v) {
    var lab = [GN[v.gn], v.conc].filter(Boolean).join(' · ') || 'اندازه‌ها و قیمت‌ها';
    return '<div class="vr g-' + (v.gn || 'x') + '"><div class="vh">' + esc(lab) + '</div>' + v.sizes.map(function (z, zi) {
      var key = v.id + ':' + z.ml, op = szOpen[key] ? ' on' : '';
      return '<div class="sz' + op + '" data-k="' + esc(key) + '"><span class="zm"><bdi>' + fa(z.ml) + '</bdi> میل</span><span class="zp">' + pzh(z.price) + (z.n < 2 ? '<i title="فقط یک سایت"></i>' : '') + '<em class="cv"></em></span></div>'
        + '<div class="srl' + op + '">' + (function (ss) {
          var lo = 0, hi = 0, nu = 0;      // ارزان‌ترین فروشگاه (فقط وقتی چند فروشگاه با قیمتِ متفاوت هست) با رنگِ سبز
          ss.forEach(function (q) { if (q.used && q.price > 0) { nu++; if (!lo || q.price < lo) lo = q.price; if (q.price > hi) hi = q.price; } });
          return ss.map(function (q) {
            var u = Core.itemUrl(q.s, q.pid), nmS = srcName(q.s), cheap = nu > 1 && lo < hi && q.used && q.price === lo;
            return '<div class="sr' + (q.used ? '' : ' x') + (cheap ? ' lo' : '') + '"><span class="sn">' + esc(nmS) + (cheap ? '<span class="lob">ارزان‌ترین</span>' : '') + '</span><span class="sp"><bdi>' + pzh(q.price) + '</bdi>' + (q.used ? '' : '<small>در محاسبه نیامد</small>') + '</span>' + (u ? '<button class="go" data-u="' + esc(u) + '">دیدن در سایت</button>' : '') + '</div>';
          }).join('');
        })(z.srcs || []) + '</div>';
    }).join('') + '</div>';
  }).join('');
  var keep = $('dtc').scrollTop;
  $('dtc').innerHTML = '<div class="dtop"><div class="dpic" data-vw="1">' + tile({ loc: im.loc, img: im.img, k: im.k }) + '<em>بزرگ‌نمایی</em></div><div class="dti"><div class="dbn">' + esc(BR_BY[m.brandId].name) + '</div><div class="dnm">' + esc(m.name) + '</div></div></div>' + dact(dtId) + vs
    + '<div class="dnote">عددِ درشتِ هر اندازه، قیمتِ میانه‌ی بازار است (میانگینِ سایت‌ها)، نه قیمتِ یک مغازه. روی هر اندازه بزنید تا قیمتِ هر سایت و دکمه‌ی دیدن در سایت بیاید. سبز یعنی ارزان‌ترین سایت. نقطه‌ی کوچک یعنی فقط یک سایت آن را داشته.</div>';
  var nm = $('dtc').querySelector('.dnm'); fitLines(nm, 3, 16);
  $('dtc').scrollTop = keep;
  if (dtEl.classList.contains('on')) fitPz($('dtc'));
}
function recAdd(id) {
  var m = MD_BY[id]; if (!m || !BR_BY[m.brandId]) return;
  set.rec = set.rec.filter(function (x) { return x && x[0] !== id; });
  set.rec.unshift([id, BR_BY[m.brandId].name + ' | ' + m.name]); if (set.rec.length > 10) set.rec.length = 10;
  ls.set('pp.set', set);
}
/* لمسِ دوباره (دو بار زدنِ پدر وقتی صفحه دیر باز می‌شود) نباید روی صفحه‌ی تازه یا زیرِ آن اثر بگذارد: چند لحظه بعد از باز و بسته شدنِ هر صفحه، لمس نادیده گرفته می‌شود */
var layerT = 0;
function layerMark() { layerT = Date.now(); }
function ghosted() { if (window.__NOGHOST) return false; var d = Date.now() - layerT; return d >= 0 && d < 350; }      // (ساعتِ گوشی عقب برود: قفل نمی‌ماند)
document.addEventListener('click', function (e) {      // یک نگهبانِ همگانی: لمسِ دوبارهٔ بی‌قصد روی هر چیزی (دکمه، ستاره، ردیف، اندازه…) در لحظه‌ی عوض شدنِ صفحه اثری ندارد
  if (!ghosted()) return;
  var t = e.target; if (t && t.closest && t.closest('input,textarea')) return;
  e.stopPropagation(); e.preventDefault();
}, true);
function openDetail(id) {
  layerMark(); recAdd(id);
  dtId = id; renderDetail(); $('dtc').scrollTop = 0;
  dtEl.classList.add('on'); layerMark(); fitPz($('dtc'));
}
function closeDetail() { layerMark(); dtId = null; dtEl.classList.remove('on'); if (typeof fvOn !== 'undefined' && fvOn) { var sc = $('fvr').scrollTop; favRender(); $('fvr').scrollTop = sc; } }      // از صفحه‌ی قیمت لیست مغازه عوض شده باشد، لیستِ زیرش هم تازه شود
$('dtx').onclick = closeDetail;
$('dtc').addEventListener('click', function (e) {
  if (ghosted()) return;
  var ab = e.target.closest && e.target.closest('.dact button');
  if (ab && dtId) {
    var m0 = MD_BY[dtId];
    if (ab.dataset.a === 'fav' && m0) { layerMark(); if (set.fav[dtId]) delete set.fav[dtId]; else set.fav[dtId] = BR_BY[m0.brandId].name + ' | ' + m0.name; ls.set('pp.set', set); renderDetail(); }
    return;
  }
  if (e.target.closest('.dpic') && dtId) { var bm = MD_BY[dtId] && BR_BY[MD_BY[dtId].brandId]; viewImg(dtId, bm ? bm.models.map(function (m) { return m.id; }) : [dtId], 'detail'); return; }
  var g = e.target.closest('.go'); if (g) { openLink(g.dataset.u); return; }
  var z = e.target.closest('.sz'); if (z && z.dataset.k) { layerMark(); var on = !z.classList.contains('on'); szOpen[z.dataset.k] = on; z.classList.toggle('on', on); if (z.nextElementSibling) { z.nextElementSibling.classList.toggle('on', on); if (on) fitPz(z.nextElementSibling); } }
});

/* ---- عکس بزرگ: بزرگ‌نمایی (دو انگشت / دو بار لمس)، جابه‌جایی، و کشیدن به چپ و راست برای عطر بعدی و قبلی ---- */
var vwId = null, vwTok = 0, vwSeq = [], vwIx = 0, vwFrom = '', vwT = { s: 1, x: 0, y: 0 }, vwPtr = {}, vwG = null, vwLastTap = 0, vwTapT = 0;
function refreshViewer() {}
function vwApply(anim) {
  var el = $('vwi') || $('vwb').firstElementChild; if (!el) return;
  el.style.transition = anim ? 'transform .22s ease' : 'none';
  el.style.transform = 'translate3d(' + vwT.x.toFixed(1) + 'px,' + vwT.y.toFixed(1) + 'px,0) scale(' + vwT.s.toFixed(3) + ')';
}
function vwClamp() {
  var el = $('vwi') || $('vwb').firstElementChild, box = $('vwb'); if (!el) return;
  vwT.s = Math.max(1, Math.min(6, vwT.s));
  var mx = Math.max(0, (el.offsetWidth * vwT.s - box.clientWidth) / 2), my = Math.max(0, (el.offsetHeight * vwT.s - box.clientHeight) / 2);
  if (vwT.s <= 1.001) { vwT.s = 1; }
  vwT.x = Math.max(-mx, Math.min(mx, vwT.x)); vwT.y = Math.max(-my, Math.min(my, vwT.y));
}
function vwCaption() {
  var im = entryImg(vwId), n = vwSeq.length;
  $('vwc').textContent = (im ? im.name : '') + (n > 1 ? '  —  ' + fa(vwIx + 1) + ' از ' + fa(n) : '');
  $('vwn').style.display = n > 1 && vwIx < n - 1 ? '' : 'none'; $('vwp').style.display = n > 1 && vwIx > 0 ? '' : 'none';
}
function viewImg(id, seq, from) {
  layerMark();
  if (seq) { vwSeq = seq; vwFrom = from || ''; vwIx = Math.max(0, seq.indexOf(id)); }
  showImg(id, 0);
  $('vw').classList.add('on');
}
function showImg(id, dir) {
  var im = entryImg(id); if (!im) return;
  vwId = id; vwIx = Math.max(0, vwSeq.indexOf(id)); vwT = { s: 1, x: 0, y: 0 };
  var tok = ++vwTok, box = $('vwb'), small = im.loc || im.img;
  if (!small && !im.big) box.innerHTML = '<div class="vfb">' + bottle(im.k, false) + '</div>';
  else {
    box.innerHTML = '<img id="vwi" alt="" draggable="false" referrerpolicy="no-referrer" src="' + esc(small || im.big) + '">';
    var vTry = 0; $('vwi').onerror = function () {      // عکس باز نشد: ابتدا نسخه‌ی بزرگ، بعد بطریِ جایگزین (نه صفحه‌ی سیاه)
      if (tok !== vwTok || vwId !== id) return;
      if (!vTry++ && im.big && this.getAttribute('src') !== im.big) { this.src = im.big; return; }
      box.innerHTML = '<div class="vfb">' + bottle(im.k, false) + '</div>';
    };
    if (im.big && im.big !== small) {
      var pre = new Image(); pre.referrerPolicy = 'no-referrer';
      pre.onload = function () { if (tok === vwTok && vwId) { var el = $('vwi'); if (el) { el.src = im.big; el.classList.add('big'); } } };
      pre.src = im.big;
    }
  }
  if (dir) { var e0 = box.firstElementChild; if (e0) { e0.style.transform = 'translate3d(' + (dir * 60) + 'px,0,0)'; e0.style.opacity = '0'; e0.getBoundingClientRect(); e0.style.transition = 'transform .22s ease, opacity .22s ease'; e0.style.transform = ''; e0.style.opacity = '1'; } }
  vwCaption();
  if (dir) vwSync(id);
  [vwSeq[vwIx + 1], vwSeq[vwIx - 1]].forEach(function (n) { var o = n && entryImg(n); if (o && (o.loc || o.img)) { var q = new Image(); q.referrerPolicy = 'no-referrer'; q.src = o.loc || o.img; } });      // عکسِ بعدی و قبلی از قبل آماده شود
}
/* با هر بار کشیدنِ عکس، پشتِ آن هم عطر عوض شود: لیست روی همان عطر می‌رود، یا صفحه‌ی قیمت‌ها همان عطر را نشان می‌دهد */
function vwSync(id) {
  try {
    if (vwFrom === 'stage' && curModel && curModel.goto) { for (var i = 0; i < list.length; i++) if (list[i].id === id) { curModel.goto(i); break; } }
    else if (vwFrom === 'detail' && dtId && dtId !== id && MD_BY[id]) { dtId = id; recAdd(id); renderDetail(); $('dtc').scrollTop = 0; }
  } catch (e) { console.error(e); }
}
function vwGo(d) {      // d=+1 بعدی، d=-1 قبلی
  var n = vwIx + d; if (n < 0 || n >= vwSeq.length) { vwApply(true); return false; }
  showImg(vwSeq[n], d); return true;
}
function closeViewer() {
  layerMark(); var was = vwId, from = vwFrom; vwId = null; vwTok++; $('vw').classList.remove('on'); vwPtr = {}; vwG = null;
  if (from === 'detail' && was && dtId && was !== dtId && MD_BY[was]) { dtId = was; renderDetail(); $('dtc').scrollTop = 0; }      // با کشیدن به عطر دیگری رفته بودید: صفحه‌ی جزئیاتِ همان عطر باز بماند
}
function vwZoomAt(px, py, s2) {
  var box = $('vwb').getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2, s0 = vwT.s;
  s2 = Math.max(1, Math.min(6, s2));
  var qx = (px - cx - vwT.x) / s0, qy = (py - cy - vwT.y) / s0;
  vwT.s = s2; vwT.x = px - cx - qx * s2; vwT.y = py - cy - qy * s2; vwClamp();
}
var vwb = $('vwb');
vwb.style.touchAction = 'none';
vwb.addEventListener('pointerdown', function (e) {
  if (!vwId) return;
  try { vwb.setPointerCapture(e.pointerId); } catch (x) { }
  vwPtr[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: Date.now() };
  var ids = Object.keys(vwPtr);
  if (ids.length === 2) {
    var a = vwPtr[ids[0]], b = vwPtr[ids[1]], box = vwb.getBoundingClientRect();
    vwG = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: vwT.s, pinch: true, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx0: vwT.x, ty0: vwT.y };
  } else if (ids.length === 1) vwG = { pan: true, tx0: vwT.x, ty0: vwT.y, moved: 0 };
});
vwb.addEventListener('pointermove', function (e) {
  var p = vwPtr[e.pointerId]; if (!p || !vwG) return;
  p.x = e.clientX; p.y = e.clientY;
  var ids = Object.keys(vwPtr);
  if (vwG.pinch && ids.length >= 2) {
    var a = vwPtr[ids[0]], b = vwPtr[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), box = vwb.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    var s = Math.max(1, Math.min(6, vwG.s0 * d / vwG.d0)), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var qx = (vwG.mx - cx - vwG.tx0) / vwG.s0, qy = (vwG.my - cy - vwG.ty0) / vwG.s0;      // نقطه‌ی زیر انگشت‌ها ثابت می‌ماند
    vwT.s = s; vwT.x = mx - cx - qx * s; vwT.y = my - cy - qy * s; vwClamp(); vwApply(false); return;
  }
  if (vwG.pan && ids.length === 1) {
    var dx = p.x - p.x0, dy = p.y - p.y0; vwG.moved = Math.max(vwG.moved, Math.hypot(dx, dy));
    if (vwT.s > 1.02) { vwT.x = vwG.tx0 + dx; vwT.y = vwG.ty0 + dy; vwClamp(); vwApply(false); }
    else { vwT.x = dx * 0.7; vwT.y = Math.max(0, dy) * 0.5; vwApply(false); }      // عکس همراهِ انگشت می‌آید
  }
});
function vwUp(e) {
  var p = vwPtr[e.pointerId]; if (!p) return;
  delete vwPtr[e.pointerId];
  var left = Object.keys(vwPtr).length;
  if (vwG && vwG.pinch) { if (left === 1) { var q = vwPtr[Object.keys(vwPtr)[0]]; q.x0 = q.x; q.y0 = q.y; vwG = { pan: true, tx0: vwT.x, ty0: vwT.y, moved: 99 }; } else { vwG = null; if (vwT.s < 1.05) { vwT = { s: 1, x: 0, y: 0 }; vwApply(true); } } return; }
  if (!vwG || !vwG.pan || left) return;
  var dx = p.x - p.x0, dy = p.y - p.y0, moved = vwG.moved, dt = Date.now() - p.t0; vwG = null;
  if (vwT.s <= 1.02) {
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) { vwT = { s: 1, x: 0, y: 0 }; vwGo(dx < 0 ? 1 : -1); return; }      // به چپ کشیدن = بعدی
    if (dy > 110 && dy > Math.abs(dx) * 1.3) { closeViewer(); return; }                                                           // به پایین کشیدن = بستن
    vwT = { s: 1, x: 0, y: 0 }; vwApply(true);
  }
  if (moved < 12 && dt < 350) {                                                        // لمس
    if (ghosted()) return;      // لمسِ دومِ همان ضربه‌ی بازکردنِ عکس
    var now = Date.now();
    if (now - vwLastTap < 320) { clearTimeout(vwTapT); vwLastTap = 0; if (vwT.s > 1.2) { vwT = { s: 1, x: 0, y: 0 }; vwApply(true); } else { vwZoomAt(p.x, p.y, 2.8); vwApply(true); } return; }
    vwLastTap = now;
    if (vwT.s <= 1.02) { var tk = vwTok; clearTimeout(vwTapT); vwTapT = setTimeout(function () { if (vwId && tk === vwTok) closeViewer(); }, 300); }      // یک لمس = بستن (کمی صبر می‌کند تا «دو بار لمس» بسته نشود)
  }
}
vwb.addEventListener('pointerup', vwUp); vwb.addEventListener('pointercancel', vwUp);
vwb.addEventListener('wheel', function (e) { if (!vwId) return; e.preventDefault(); vwZoomAt(e.clientX, e.clientY, vwT.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2)); vwApply(false); }, { passive: false });
$('vwx').onclick = closeViewer; $('vwn').onclick = function () { vwGo(1); }; $('vwp').onclick = function () { vwGo(-1); };
$('vw').addEventListener('click', function (e) { if (e.target === $('vw')) closeViewer(); });
window.__vw = { get t() { return vwT; }, get id() { return vwId; }, get seq() { return vwSeq; }, get ix() { return vwIx; } };

/* ---- عکس‌ها: یک‌بار دانلود و برای همیشه روی گوشی ---- */
function loadImgs() {
  if (!(window.Native && window.Native.listImgs)) return;
  try { imgLoc = JSON.parse(window.Native.listImgs() || '{}') || {}; } catch (e) { imgLoc = {}; }
}
function imgSettled() { imgLastT = Date.now(); tick(); if (!db.ready) checkReady(); }
window.__imgDone = function (id, path) {
  imgLoc[id] = path;
  if (imgPend[id]) { delete imgPend[id]; imgOk++; }
  for (var i = 0; i < list.length; i++) if (list[i].imgId === id) { list[i].loc = path; break; }
  imgSettled();
};
window.__imgFail = function (id) { if (imgPend[id]) { delete imgPend[id]; imgBad++; } setTimeout(function () { delete imgAsked[id]; }, 300000); imgSettled(); };      // عکسِ ناموفق بعد از چند دقیقه دوباره امتحان می‌شود
function queueImgs() {
  if (!(window.Native && window.Native.cacheImg)) return;
  TREE.forEach(function (b) {
    b.models.forEach(function (m) {
      if (!m.img || imgLoc[m.imgId] || imgAsked[m.imgId]) return;
      imgAsked[m.imgId] = 1; imgPend[m.imgId] = 1; imgTot++; imgLastT = Date.now();
      try { window.Native.cacheImg(m.imgId, m.img); } catch (e) { delete imgPend[m.imgId]; imgBad++; }
    });
  });
}

/* ---- بروزرسانی ---- */
async function doSource(s) {
  var mode = db.full[s.id] && Date.now() - db.full[s.id] < FULL_EVERY ? 'price' : 'full';
  var known = 0, M = db.it[s.id]; if (M) known = Object.keys(M).length;
  var P = prog[s.id] = { n: 0, mode: mode, exp: known, done: false };
  function rep(n, p) { P.n = n; if (p != null) P.pct = p; tick(); }
  var r = await s.run(net, rep, mode), st = await Core.ingestAsync(db, idx, s.id, r.items, r.complete);
  if (mode === 'price' && st.unknown > 0) {     // محصول تازه‌ای آمده که نامش را نمی‌شناسیم → یک دریافت کامل
    mode = P.mode = 'full'; P.pct = null; P.n = 0;
    r = await s.run(net, rep, 'full'); st = await Core.ingestAsync(db, idx, s.id, r.items, r.complete);
  }
  db.t[s.id] = Date.now();
  if (mode === 'full') {
    if (r.complete || (db.fa[s.id] = (db.fa[s.id] || 0) + 1) >= 3) { db.full[s.id] = Date.now(); db.fa[s.id] = 0; }
  }
  var cnt = 0; Object.keys(db.it[s.id] || {}).forEach(function (k) { var e = db.it[s.id][k]; if (e[2] && e[1] > 0) cnt++; });
  stt[s.id] = { ok: true, n: cnt, t: Date.now(), mode: mode, note: r.note || '', full: !!(db.full[s.id]), added: st.added, removed: st.removed | 0, merged: st.merged | 0, purged: st.purged | 0 };
  P.done = true;
}
async function refresh(manual) {
  if (busy) return;
  if (Core.CLEANSE) { Core.CLEANSE.n = 0; Core.CLEANSE.junk = 0; }
  if (Core.REJ) { Core.REJ.n = 0; Core.REJ.by = {}; Core.REJ.ex = []; }
  busy = true; prog = {}; updPill(); overlay(); refBtn(); if (open) renderSheet();
  var ok = 0, bad = 0, t0 = Date.now(), snap0 = FLAT.length ? sizeMap(FLAT) : null;
  db.sz = db.sz || {}; Core.useSz(db.sz);      // اندازه‌هایی که از صفحه‌ی محصول خوانده شده (برای محصولی که در فهرستِ سایت اندازه ندارد)
  await Promise.all(actv().map(async function (s) {
    try { await doSource(s); ok++; }
    catch (e) {
      bad++;
      var pv = stt[s.id] || {};
      stt[s.id] = { ok: false, err: friendly(e && e.message || e).slice(0, 200), raw: String(e && e.message || e).slice(0, 200), n: pv.n || 0, t: pv.t || 0, note: pv.note || '' };
      if (prog[s.id]) prog[s.id].done = true;
    }
    if (firstLoad()) saveDb();
    try { if (!list.length) rebuild(); } catch (e2) { stt[s.id].err = 'خطای ادغام: ' + e2.message; }
    tick();
  }));
  var ch = 0;
  try { ch = rebuild(); histTake(); } catch (e3) { console.error(e3); }
  try {
    var au2 = (ALLB && ALLB.audit) || {}, mg = 0, pg = 0, CL2 = Core.CLEANSE || {};
    Core.SOURCES.forEach(function (s) { mg += (stt[s.id] && stt[s.id].merged) | 0; pg += (stt[s.id] && stt[s.id].purged) | 0; });
    RUN = { t: Date.now(), dur: Date.now() - t0, manual: !!manual, chg: snap0 ? diffMaps(snap0, sizeMap(FLAT)) : null,
      src: actv().map(function (s) { var o = srcState(s); return { name: o.name, kind: o.kind, cnt: o.cnt }; }),
      clean: { rej: (Core.REJ || {}).n | 0, rejBy: (Core.REJ || {}).by || {}, rejEx: ((Core.REJ || {}).ex || []).slice(0, 12), nl: CL2.nameless | 0, nlS: (CL2.nlEx || []).slice(0, 12), healed: CL2.healed | 0, unk: au2.nunk | 0, unkS: (au2.unk || []).slice(0, 12), clone: CL2.clone | 0, purged: pg, titles: CL2.n | 0, junk: CL2.junk | 0, merged: mg, names: au2.nmod | 0, brands: (au2.brands || []).length, sus: au2.nsus | 0 } };
    ls.set('pp.run', RUN);
  } catch (e4) { console.error(e4); }
  busy = false; lastTried = Date.now(); lastTry = lastTried; ls.set('pp.try', lastTry); saveDb(); updPill(); overlay(); refBtn(); renderSheet();
  queueImgs(); checkReady();
  if (manual) {
    if (!ok) toast('اینترنت یا سایت‌ها جواب ندادند؛ دوباره امتحان کنید', 7000);
    else if (bad) toast('بروزرسانی شد، ولی ' + fa(bad) + ' سایت جواب نداد' + (ch > 0 ? ' · ' + fa(ch) + ' قیمت تغییر کرد' : ''), 4200);
    else toast(ch > 0 ? 'بروزرسانی شد · ' + fa(ch) + ' قیمت تغییر کرد' : ch < 0 ? 'بروزرسانی شد · فهرست عطرها تازه شد' : 'بروزرسانی شد · قیمت‌ها تغییری نکرده بود', 3600);
  }
}

/* ================= تنظیمات ================= */
var sheetY = 1, open = false, adv = false, advN = 0;
function renderSheet() {
  Array.prototype.forEach.call($('sTheme').children, function (b) { b.classList.toggle('on', b.dataset.v === set.theme); });
  Array.prototype.forEach.call($('sAuto').children, function (b) { b.classList.toggle('on', +b.dataset.m === (+set.auto > 0 ? +set.auto : 0)); });
  Array.prototype.forEach.call($('sUpdA').children, function (b) { b.classList.toggle('on', +b.dataset.v === (updAutoOn() ? 1 : 0)); });
  Array.prototype.forEach.call($('sModel').children, function (b) { b.classList.toggle('on', b.dataset.v === set.model); });
  var bad = false;
  var srcHtml = Core.SOURCES.map(function (s) {
    var x = stt[s.id], txt = '—', cls = '', P = prog[s.id];
    if (busy && P && !P.done) txt = (P.mode === 'full' ? 'دریافت اولیه ' : 'قیمت‌ها ') + '<bdi>' + fa(P.n) + '</bdi>';
    else if (x && x.ok) { txt = fa(x.n) + ' محصول' + (x.note && /ناقص/.test(x.note) ? ' (ناقص)' : ''); }
    else if (x && x.err) { txt = x.err + (x.t ? ' (قیمت قبلی نگه داشته شد)' : ''); cls = 'bad'; bad = true; }
    var on = srcOn(s.id);
    if (!on) { txt = 'خاموش؛ بروز نمی‌شود و در فهرست نیست'; cls = 'offs'; }
    return '<div class="' + cls + '"><span>' + s.name + '</span><span class="st">' + (busy && P && !P.done && on ? txt : esc(txt)) + '</span><button type="button" class="sw' + (on ? ' on' : '') + '" data-s="' + s.id + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' + esc(s.name) + '"><i></i></button></div>';
  }).join('') + '<div style="border:0;color:var(--mu);font-size:12px;padding-top:8px"><span>با کلیدِ کنار هر سایت می‌توانید آن را خاموش کنید. نقطه‌ی کوچک کنار قیمت یعنی فقط یک سایت آن را داشته.</span></div>';
  var sEl = $('sSrc'); if (sEl._h !== srcHtml) { sEl._h = srcHtml; sEl.innerHTML = srcHtml; }      // محتوا عوض نشده = دست نزن (وگرنه لمسِ کلید وسطِ بازسازی گم می‌شد)
  renderMine();
  renderReport();
  $('sCopy').style.display = bad || adv ? '' : 'none'; $('sFull').style.display = bad || adv ? '' : 'none';
  $('sVer').textContent = 'نسخه ' + VERSION; updStatus();
  renderBrands();
  [].forEach.call(document.querySelectorAll('#sLang button'), function (b) { b.classList.toggle('on', b.dataset.l === (set.lang === 'en' ? 'en' : 'fa')); });
}
function clock(t) { if (!t) return '—'; var d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; }; var ago = Math.round((Date.now() - t) / 60000); return (p(d.getHours()) + ':' + p(d.getMinutes())).replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }) + (ago >= 1 ? ' (' + fa(ago < 120 ? ago : Math.round(ago / 60)) + (ago < 120 ? ' دقیقه' : ' ساعت') + ' پیش)' : ' (همین الان)'); }
/* گزارش به‌روز: وضعیت دریافت هر سایت، فهرست، عکس‌ها و نام‌ها؛ تا تنظیمات باز است خودش تازه می‌شود */
/* ---------- گزارش: هر بخش به زبان ساده می‌گوید «چه شد / چرا / چه باید کرد» ---------- */
var RUN = ls.get('pp.run', null);
if (!RUN || typeof RUN !== 'object' || !Array.isArray(RUN.src) || !RUN.src.every(function (x) { return x && typeof x === 'object'; })) RUN = null;
function sizeMap(l) { var o = {}; (l || []).forEach(function (g) { g.sizes.forEach(function (z) { o[g.id + '|' + z.ml] = z.price; }); }); return o; }
function diffMaps(a, b) {
  var d = { up: 0, down: 0, nw: 0, gone: 0, same: 0 };
  Object.keys(b).forEach(function (k) { if (a[k] === undefined) d.nw++; else if (b[k] > a[k]) d.up++; else if (b[k] < a[k]) d.down++; else d.same++; });
  Object.keys(a).forEach(function (k) { if (b[k] === undefined) d.gone++; });
  return d;
}
function srcState(s) {
  var x = stt[s.id] || {}, fullT = db.full[s.id], cnt = 0;
  Object.keys(db.it[s.id] || {}).forEach(function (k) { var e = db.it[s.id][k]; if (e[2] && e[1] > 0) cnt++; });
  var o = { name: s.name, cnt: cnt, t: db.t[s.id] || 0, kind: 'ok', say: '', todo: '' };
  if (!srcOn(s.id)) { o.kind = 'off'; o.say = 'خاموش است (به انتخاب شما)'; o.todo = ''; return o; }
  if (x.err) { o.kind = 'err'; o.say = 'جواب نداد (' + x.err + ')'; o.todo = db.t[s.id] ? 'قیمت‌های قبلی این سایت نگه داشته شد. اگر اینترنت درست است، چند دقیقه بعد دوباره «بروزرسانی» را بزنید.' : 'هنوز هیچ قیمتی از این سایت نیامده؛ اینترنت را بررسی و دوباره بروزرسانی کنید.'; }
  else if (!x.ok && !db.t[s.id]) { o.kind = 'wait'; o.say = 'هنوز چیزی از این سایت نیامده'; o.todo = 'بروزرسانی را بزنید.'; }
  else if (x.note && /ناقص/.test(x.note)) { o.kind = 'part'; o.say = 'فهرست سایت کامل خوانده نشد'; o.todo = 'آنچه خوانده شد بروز شد و بقیه با قیمتِ قبلی ماند؛ بار بعد خودش دوباره امتحان می‌کند. کاری لازم نیست.'; }
  else if (!fullT) { o.kind = 'part'; o.say = 'دریافتِ کامل هنوز تمام نشده'; o.todo = 'خودش ادامه می‌دهد. کاری لازم نیست.'; }
  else { o.say = 'سالم و کامل'; }
  return o;
}
function reportData() {
  var ps = photoStat(), nb = TREE.length, nm = 0, nv = 0;
  TREE.forEach(function (b) { nm += b.models.length; b.models.forEach(function (m) { nv += m.variants.length; }); });
  var withEn = 0; FLAT.forEach(function (g) { if (g.en) withEn++; });
  var src = Core.SOURCES.map(function (s) {
    var o = srcState(s), P = prog[s.id];
    var st = busy && P && !P.done ? 'در حال دریافت (' + fa(P.n) + ')' : o.kind === 'off' ? 'خاموش (بروز نمی‌شود)' : o.kind === 'ok' ? 'کامل' : o.kind === 'part' ? 'ناقص (دوباره امتحان می‌کند)' : o.kind === 'err' ? 'خطا: ' + (stt[s.id].err || '') : 'هنوز نیامده';
    return { name: s.name, st: st, ok: o.kind === 'ok' || o.kind === 'off', cnt: o.cnt, t: o.t, note: (stt[s.id] || {}).note || '', o: o };
  });
  return { ps: ps, nb: nb, nm: nm, nv: nv, withEn: withEn, all: FLAT.length, src: src };
}
function renderReport() {
  var el = $('sRep'); if (!el) return;
  var r = reportData(), out = [];
  var au = (ALLB && ALLB.audit) || { bare: [], brands: [], models: [] }, CL = Core.CLEANSE || {};
  var allOk = r.src.every(function (x) { return x.ok; }) && r.ps.have >= r.ps.need && !busy && !saveFail;
  function sec(title, lines, bad) { out.push('<div class="rp' + (bad ? ' bad' : '') + '"><h4>' + title + '</h4>' + lines.map(function (l) { return '<p>' + l + '</p>'; }).join('') + '</div>'); }
  function B(n) { return '<bdi>' + fa(n) + '</bdi>'; }
  /* ۱) نتیجه‌ی آخرین بروزرسانی */
  var L1 = [];
  if (busy) L1.push('در حال بروزرسانی؛ تا تمام نشود نتیجه نیست.');
  else if (!RUN) L1.push('از وقتی این نسخه نصب شده هنوز بروزرسانی کاملی انجام نشده. آخرین دریافت: ' + clock(lastOk()) + '. دکمه‌ی «بروزرسانی قیمت‌ها همین حالا» را بزنید.');
  else {
    var d = RUN.chg, nSrcBad = RUN.src.filter(function (x) { return x.kind !== 'ok'; }).length;
    L1.push('زمان: ' + clock(RUN.t) + '، ' + B(Math.max(1, Math.round(RUN.dur / 1000))) + ' ثانیه');
    L1.push(nSrcBad ? B(nSrcBad) + ' سایت از ' + B(RUN.src.length) + ' مشکل داشت (در بخش «مشکل‌ها» می‌بینید)' : 'هر ' + B(RUN.src.length) + ' سایت سالم جواب دادند');
    if (d) {
      var ch = d.up + d.down;
      L1.push('قیمت‌ها: ' + (ch ? B(ch) + ' قیمت عوض شد (' + B(d.up) + ' گران‌تر، ' + B(d.down) + ' ارزان‌تر)' : 'هیچ قیمتی تغییر نکرد') + '، ' + B(d.same) + ' قیمت مثل قبل بود');
      if (d.nw) L1.push('اندازه یا عطر تازه آمد: ' + B(d.nw));
      if (d.gone) L1.push('ناموجود شد یا از فهرست رفت: ' + B(d.gone));
      L1.push('نتیجه: ' + ((ch + d.nw + d.gone) ? '<b>بله، چیزی بروز شد.</b>' : '<b>نه، چیزی عوض نشد؛ همه‌چیز مثل قبل بود.</b>'));
    } else L1.push('این اولین دریافت است؛ مقایسه‌ای با قبل نیست.');
  }
  sec('نتیجه‌ی آخرین بروزرسانی', L1, false);
  /* ۲) مشکل‌ها و کار لازم */
  var iss = [];
  r.src.forEach(function (x) { if (x.o.kind !== 'ok' && x.o.kind !== 'off') iss.push('<b>' + esc(x.name) + ':</b> ' + esc(x.o.say) + '. ' + esc(x.o.todo)); });
  if (saveFail) iss.push('<b>حافظه‌ی خودِ برنامه پر شده:</b> اطلاعات ممکن است بعد از بستن برنامه برنگردد. اگر تکرار شد، در تنظیمات اندروید برای این برنامه «پاک کردن حافظه» را بزنید و دوباره باز کنید.');
  if (r.ps.have < r.ps.need) iss.push('<b>عکس‌ها:</b> ' + B(r.ps.need - r.ps.have) + ' عکس هنوز روی گوشی نیست. خودش دانلود می‌کند؛ کاری لازم نیست.');
  if (au.nsus) iss.push('<b>نام‌های شبیه هم:</b> ' + B(au.nsus) + ' جفت نام شبیه هم هست که قیمتشان به هم نمی‌خورد، پس یکی نشدند (ممکن است دو عطرِ جدا باشند). نمونه‌ها در «پالایش».');
  if (staleN) iss.push('<b>کالای قدیمی:</b> ' + B(staleN) + ' کالا چند ساعت است در سایت دیده نشده و قیمتش نشان داده نمی‌شود. با بروزرسانی بعدی روشن می‌شود.');
  sec('مشکل‌ها و کار لازم', iss.length ? iss : ['مشکلی پیدا نشد؛ کاری لازم نیست.'], iss.length > 0 && !(iss.length === 1 && r.ps.have < r.ps.need && !saveFail));
  /* ۳) پالایش نام‌ها */
  var P = [], merged = RUN && RUN.clean ? RUN.clean.merged : 0;
  P.push('بازرسی‌شده: ' + B(au.checked || r.nm) + ' نام عطر در ' + B(r.nb) + ' برند');
  if (CL.n || (RUN && RUN.clean && RUN.clean.titles)) P.push('عنوان‌های تمیزشده (سال، کد و واژه‌ی اضافه برداشته شد): ' + B(CL.n || RUN.clean.titles));
  if (CL.junk || (RUN && RUN.clean && RUN.clean.junk)) P.push('عنوانِ بی‌معنی که کنار رفت: ' + B(CL.junk || RUN.clean.junk));
  var rc = RUN && RUN.clean ? RUN.clean : {}, rejN = Math.max(rc.rej | 0, rc.purged | 0);
  if (rejN) {
    var why = Object.keys(rc.rejBy || {}).map(function (k) { return (k === 'clone' ? 'مدلِ برندِ دیگر' : k) + ' ' + fa(rc.rejBy[k]); }).join('، ');
    P.push('عنوانِ ردشده در بازرسیِ نام (شماره‌ی تلفن، قیمت یا آیدی داخل نام، سازنده‌ی تقلیدی، «مدل ...»، واژه‌ی ممنوع): ' + B(rejN) + (why ? ' — ' + esc(why) : ''));
  }
  if (rc.unk) P.push('عطر با برندِ ناشناخته (زیر «سایر برندها»): ' + B(rc.unk) + '. اگر عطرِ معروفی بود یا درست به نظر نمی‌رسید، از «نمونه‌ها» ببینید و در صفحه‌ی عطر «پنهانش کن» یا در تنظیمات «واژه‌های ممنوع» را بزنید.');
  if (merged) P.push('عطرِ تکراری که یکی شد (مثلاً فارسی و انگلیسیِ یک عطر): ' + B(merged));
  if (au.brands.length) P.push('برندِ تکراری که یکی شد: ' + B(au.brands.length));
  if (au.models.length) P.push('نامِ تکراری که یکی شد: ' + B(au.models.length));
  if (au.nb) P.push('عطرِ بی‌نام که حذف شد: ' + B(au.nb));
  if (RUN && RUN.clean && RUN.clean.healed) P.push('عنوانِ بدون نامِ عطر که نامش از نشانیِ صفحه پیدا شد: ' + B(RUN.clean.healed));
  if (P.length === 1) P.push('مورد تکراری یا ایرادداری پیدا نشد.');
  P.push('<button class="aud-t" type="button">نمونه‌ها</button>');
  if (audOpen) {
    var ex = [];
    ((RUN && RUN.clean && RUN.clean.rejEx) || []).slice(0, 8).forEach(function (x) { ex.push('ردشد (' + x[0] + '): ' + x[1]); });
    ((RUN && RUN.clean && RUN.clean.nlS) || []).slice(0, 8).forEach(function (x) { ex.push('عنوانِ بی‌نامِ عطر: ' + x); });
    ((RUN && RUN.clean && RUN.clean.unkS) || []).slice(0, 10).forEach(function (x) { ex.push('برند ناشناخته: ' + x); });
    (au.sus || []).slice(0, 8).forEach(function (x) { ex.push('مشکوک: ' + x); });
    (au.junk || []).slice(0, 5).forEach(function (x) { ex.push('بی‌معنی: ' + x); });
    au.bare.slice(0, 6).forEach(function (x) { ex.push('حذف (بی‌نام): ' + x); });
    au.brands.slice(0, 6).forEach(function (x) { ex.push('برند: ' + x); });
    au.models.slice(0, 8).forEach(function (x) { ex.push('یکی شد: ' + x); });
    P.push('<span class="audl">' + (ex.length ? ex.map(function (x) { return '<bdi>' + esc(x) + '</bdi>'; }).join('<br>') : 'موردی نبود') + '</span>');
  }
  sec('پالایش نام‌ها', P, false);
  /* ۴) سایت‌ها و عکس‌ها */
  var S = r.src.map(function (x) { return '<b>' + esc(x.name) + ':</b> ' + esc(x.st) + '، ' + B(x.cnt) + ' محصول،' + clock(x.t) + (x.note && /ناقص/.test(x.note) ? '، ' + esc(x.note) : ''); });
  S.push('<b>عکس‌ها:</b> ' + B(r.ps.have) + ' از ' + B(r.ps.need) + ' روی گوشی' + (r.ps.pend ? '، ' + B(r.ps.pend) + ' در حال دانلود' : '') + (r.ps.bad ? '، ' + B(r.ps.bad) + ' نشد' : ''));
  S.push('<b>فهرست:</b> ' + B(r.nb) + ' برند،' + B(r.nm) + ' عطر،' + B(r.nv) + ' نوع');
  S.push('<b>نام انگلیسی:</b> ' + B(r.withEn) + ' از ' + B(r.all) + ' را خودِ سایت‌ها داده‌اند؛ بقیه ساخته می‌شود');
  sec('سایت‌ها و فهرست', S, r.src.some(function (x) { return !x.ok; }));
  var rh = out.join(''); if (el._h === rh) return; el._h = rh;
  el.innerHTML = rh;
  var t = el.querySelector('.aud-t'); if (t) t.onclick = function () { audOpen = !audOpen; renderReport(); };
}
var brOpen = false;
function renderBrands() {
  var b = $('sBrBtn'), box = $('sBrList'); if (!b) return;
  var off = set.off || {}, n = ALLB.length, on = ALLB.filter(function (x) { return !off[x.id]; }).length;
  b.innerHTML = '<span>برندهای نمایش‌داده‌شده: <bdi>' + fa(on) + '</bdi> از <bdi>' + fa(n) + '</bdi></span>';
  box.style.display = brOpen && n ? '' : 'none';
  if (!brOpen || !n) return;
  var sig = ALLB.map(function (x) { return x.id + (off[x.id] ? 0 : 1); }).join();
  if (box._s === sig) return; box._s = sig;
  box.innerHTML = '<button class="btn ghost" id="sBrAll">روشن‌کردن همه</button>' + ALLB.map(function (x) {
    return '<button class="brw' + (off[x.id] ? '' : ' on') + '" data-id="' + x.id + '"><span class="bn">' + esc(x.name) + '</span><span class="bc"><bdi>' + fa(x.models.length) + '</bdi> عطر</span><i class="sw"></i></button>';
  }).join('');
}
function setOff(id, v) {
  set.off = set.off || {}; if (v) set.off[id] = 1; else delete set.off[id];
  ls.set('pp.set', set); try { rebuild(true); } catch (e) { console.error(e); } try { queueImgs(); } catch (e) {} renderBrands(); renderReport();
}
$('sLang').onclick = function (e) { var b = e.target.closest('button'); if (!b || !b.dataset.l || b.dataset.l === (set.lang === 'en' ? 'en' : 'fa')) return; set.lang = b.dataset.l; ls.set('pp.set', set); try { rebuild(); } catch (er) { console.error(er); } renderSheet(); };
$('sBrBtn').onclick = function () { brOpen = !brOpen; renderBrands(); };
$('sBrList').onclick = function (e) {
  var all = e.target.closest && e.target.closest('#sBrAll');
  if (all) { set.off = {}; ls.set('pp.set', set); try { rebuild(true); } catch (e2) {} try { queueImgs(); } catch (e3) {} renderBrands(); renderReport(); return; }
  var r = e.target.closest && e.target.closest('.brw'); if (!r) return;
  setOff(r.dataset.id, r.classList.contains('on'));
};
var sheet = $('sheet'), scm = $('scm'), sSp = new Spring(1, function (y) { sheetY = y; sheet.style.transform = 'translate3d(0,' + (y * 110).toFixed(2) + '%,0)'; scm.style.opacity = String(clamp(1 - y, 0, 1)); scm.style.pointerEvents = y < .98 ? 'auto' : 'none'; });
sSp.eps = .002;
function pageFix() { [$('app'), document.body, document.documentElement].forEach(function (e) { if (e && (e.scrollTop || e.scrollLeft)) { e.scrollTop = 0; e.scrollLeft = 0; } }); }
$('app').addEventListener('scroll', pageFix);
function openSheet() { layerMark(); open = true; if (!window.__forceAdv) $('sAdv').style.display = 'none'; $('sAdvBtn').setAttribute('aria-expanded', 'false'); $('sAdvBtn').firstChild.textContent = 'تنظیمات پیشرفته'; renderSheet(); sheet.scrollTop = 0; sSp.x = sheetY; sSp.to(0, { response: .42, damping: .85 }); layerMark(); }
function closeSheet() { layerMark(); open = false; sSp.x = sheetY; sSp.to(1, { response: .36, damping: 1 }); }
sSp.cb(1);
$('sVer').onclick = function () { if (++advN >= 5 && !adv) { adv = true; renderSheet(); toast('گزینه‌های سازنده نشان داده شد', 2200); } };
$('upd').onclick = function () { if (!busy && db.ready && !open) refresh(true); };      // زدن روی نوار وضعیت = بروزرسانی همین حالا (بدون رفتن به تنظیمات)
$('gear').onclick = openSheet; scm.onclick = closeSheet; $('sClose').onclick = closeSheet;
var dy0 = null, sy = 0;
sheet.addEventListener('pointerdown', function (e) { if (sheet.scrollTop <= 0 && e.target.closest && !e.target.closest('button')) { dy0 = e.clientY; sy = 0; } });
sheet.addEventListener('pointermove', function (e) { if (dy0 == null) return; sy = e.clientY - dy0; if (sy > 0) { sSp.stop(); sSp.cb(clamp(sy / sheet.offsetHeight / 1.1, 0, 1)); } });
function sUp() { if (dy0 == null) return; var d = sy; dy0 = null; if (d > 80) closeSheet(); else if (d > 0) { sSp.x = sheetY; sSp.to(0, { response: .3, damping: .9 }); } }
sheet.addEventListener('pointerup', sUp); sheet.addEventListener('pointercancel', sUp);
$('sTheme').onclick = function (e) { var v = e.target.dataset && e.target.dataset.v; if (!v) return; set.theme = v; ls.set('pp.set', set); applyTheme(); renderSheet(); };
$('sModel').onclick = function (e) { var b = e.target.closest && e.target.closest('button'); if (!b || !b.dataset.v) return; set.model = b.dataset.v; ls.set('pp.set', set); renderSheet(); var a = curModel ? curModel.getAnchor() : null; mountModel(a); closeSheet(); };
$('sUpdA').onclick = function (e) { var b = e.target.closest('button'); if (!b || b.dataset.v == null) return; set.updAuto = +b.dataset.v; ls.set('pp.set', set); renderSheet(); if (set.updAuto && updDue()) updCheck(false); };
$('sSrc').onclick = function (e) {
  var b = e.target.closest('button.sw'); if (!b) return;
  var id = b.dataset.s, on = srcOn(id);
  if (on && actv().length <= 1) { toast('حداقل یک سایت باید روشن بماند', 2500); return; }
  set.soff = set.soff || {}; if (on) set.soff[id] = 1; else delete set.soff[id];
  ls.set('pp.set', set);
  try { rebuild(); } catch (e2) { console.error(e2); }
  renderSheet(); updPill();
  if (!on && !busy && !(db.it[id] && Object.keys(db.it[id]).length)) refresh(false);      // تازه روشن شد و هنوز چیزی ندارد
  else if (!on && !busy) toast('سایت روشن شد؛ با «بروزرسانی» قیمت‌هایش تازه می‌شود', 3500);
};
$('sUpd').onclick = function () { if ($('sUpd').disabled) return; updSt.dismissed = false; ls.set('pp.updDis', null); updCheck(true); };
function updDismiss() { layerMark(); updSt.dismissed = true; updSt.dismissAt = Date.now(); updSt.dismissCode = updSt.ready || updSt.code || 0; ls.set('pp.updDis', [updSt.dismissCode, updSt.dismissAt]); updSt.manual = false; updSt.cardOk = false; $('updBox').classList.remove('on'); updAuto(); }      // «بعداً»: سه ساعت دوباره نیاید
$('updLater').onclick = updDismiss;
$('updGo').onclick = function () {      // فقط برای نصبِ APK
  var dc = Date.now() - (updSt.cardT || 0); if ($('updGo').disabled || (dc >= 0 && dc < 800)) return;      // کارت همین حالا آمده: لمسِ اتفاقیِ دستِ پدر نصب را شروع نکند
  clearTimeout(updSt.instTm); ls.set('pp.updDis', null); updSt.phase = 'inst'; updSt.installing = true; ls.set('pp.updTo', updSt.ready); updRender();
  var ok = false; try { ok = window.Native.updInstall(); } catch (e) { }
  if (!ok) { updSt.ready = 0; window.__updErr('start'); setTimeout(function () { updSt.dismissed = false; updCheck(true); }, 600); }      // فایلِ دانلودشده از بین رفته (کمبود حافظه): دوباره دانلود شود، نه گیر کردن تا باز شدنِ بعدی
};
$('sAuto').onclick = function (e) { var b = e.target.closest('button'); if (!b || b.dataset.m == null) return; set.auto = +b.dataset.m; ls.set('pp.set', set); renderSheet(); updPill(); if (set.auto > 0 && !busy && autoDue()) refresh(false); };
$('sRef').onclick = function () { if (busy) { toast('همین حالا در حال بروزرسانی است…', 2200); return; } refresh(true); };
$('sFull').onclick = function () { if (busy) return; db.full = {}; db.fa = {}; saveDb(); refresh(true); };
$('sCopy').onclick = function () {
  var t = 'گزارش قیمت عطر ' + VERSION + '\n' + Core.SOURCES.map(function (s) { var x = stt[s.id] || {}; return s.name + ': ' + (x.ok ? 'ok ' + x.n + (x.mode ? ' (' + x.mode + ')' : '') + (x.note ? ' ' + x.note : '') + (x.added ? ' +' + x.added : '') : (x.raw || x.err || 'نامشخص')); }).join('\n')
    + '\nعطر در حافظه: ' + Object.keys(db.g).length + ' ؛ برند: ' + TREE.length + ' ؛ عکس: ' + imgOk + ' نشد: ' + imgBad + ' ؛ نمایش: ' + list.length + ' ؛ مبهم‌ (نشان داده نشد): ' + hiddenN + ' ؛ عکس ذخیره‌شده: ' + Object.keys(imgLoc).length
    + '\n\nخطاها:\n' + netBad.concat(netLog).map(function (l) { return l.s + ' ' + l.u + '\n' + l.b; }).join('\n---\n');
  if (window.Native && window.Native.copy) window.Native.copy(t); else if (navigator.clipboard) navigator.clipboard.writeText(t).catch(function () {});
  $('sCopy').textContent = 'کپی شد؛ در پیام برای سازنده بچسبانید';
};
$('sAdvBtn').onclick = function () {
  var box = $('sAdv'), on = box.style.display === 'none';
  box.style.display = on ? '' : 'none'; $('sAdvBtn').setAttribute('aria-expanded', on ? 'true' : 'false');
  $('sAdvBtn').firstChild.textContent = on ? 'بستن تنظیمات پیشرفته' : 'تنظیمات پیشرفته';
  if (on) setTimeout(function () {      // فقط خودِ برگه اسکرول شود؛ scrollIntoView کل صفحه (#app) را هم بالا می‌کشید و عکس‌ها از صفحه‌ی اصلی می‌رفتند
    try { var top = box.getBoundingClientRect().top - sheet.getBoundingClientRect().top + sheet.scrollTop - 36; sheet.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); } catch (e) { }
    pageFix();
  }, 50);
};
/* ---- «چرا یک عطر نیست؟»: جست‌وجو در همه‌ی عنوان‌هایی که برنامه از فروشگاه‌ها گرفته و دلیلِ نمایش‌ندادن ---- */
function whyRow(title, sub) { return '<div class="mkr nl"><div class="mi"><b>' + esc(String(title).slice(0, 110)) + '</b><small>' + sub + '</small></div></div>'; }
function whyRun() {
  var q = Core.normFa($('whyIn').value, true).split(/\s+/).filter(function (w) { return w.length >= 2; }), out = $('whyOut');
  if (!q.length) { out.innerHTML = '<div class="hint2">یک یا دو واژه از نام عطر بنویسید.</div>'; return; }
  var shown = {}; FLAT.forEach(function (g) { shown[g.id] = g; });
  var rows = [], pat = function (n) { return q.filter(function (w) { return n.indexOf(w) >= 0; }).length; }, best = 0;
  Object.keys(db.it || {}).forEach(function (sr) {
    var m = db.it[sr] || {};
    Object.keys(m).forEach(function (pid) {
      var e = m[pid]; if (!e[0]) return;
      var n = Core.normFa(e[0], true), c = pat(n);
      if (c >= Math.max(1, Math.min(q.length, 2)) && c >= q.length - (q.length > 2 ? 1 : 0)) { rows.push({ s: sr, e: e, c: c }); if (c > best) best = c; }
    });
  });
  rows = rows.filter(function (r) { return r.c === best; });
  rows.sort(function (a, b) { return (b.e[2] ? 1 : 0) - (a.e[2] ? 1 : 0) || (b.e[1] > 0 ? 1 : 0) - (a.e[1] > 0 ? 1 : 0); });
  if (!rows.length) {
    out.innerHTML = '<div class="hint2"><b>در اطلاعاتی که برنامه از فروشگاه‌ها گرفته، چیزی با این نام نیست.</b><br>یعنی یا فروشگاه‌ها آن را در فهرست خود ندارند، یا برنامه آن را دریافت نکرده (مثلاً صفحه‌ای از سایت نیامده). یک بار «بروزرسانی کامل» را بزنید و دوباره بررسی کنید. اگر باز هم نبود، نام عطر و آدرس صفحه‌اش را برای سازنده بفرستید.</div>';
    return;
  }
  var h = '<div class="hint2">' + fa(rows.length) + ' مورد پیدا شد' + (rows.length > 12 ? ' (۱۲ مورد اول)' : '') + ':</div>';
  rows.slice(0, 12).forEach(function (r) {
    var e = r.e, st, g = e[2] ? shown[e[2]] : null;
    if (e[2] && e[1] > 0 && g) { var a = VA[e[2]]; st = a && (set.hide[a.m] || (set.off || {})[a.b]) ? 'پنهان‌شده توسط شما' : '<b>در فهرست هست</b> · ' + fa(e[1]) + ' تومان · ' + fa(e[3]) + ' میل'; }
    else if (e[2] && e[1] > 0) st = 'دریافت شده ولی نشان داده نمی‌شود (چند ساعت است در سایت دیده نشده، یا نامش با یک عطر دیگر مبهم است)';
    else if (e[2]) st = 'در سایت <b>ناموجود</b> است (قیمت ندارد)';
    else { var x = Core.explainTitle(e[0]); st = x.ok ? 'نام درست است ولی قیمت یا موجودی ندارد (در سایت ناموجود یا بدون قیمت)' : '<b>رد شد:</b> ' + esc(x.why); }
    h += whyRow(e[0], esc(srcName(r.s)) + ' · ' + st);
  });
  out.innerHTML = h;
}
function whyCover() {
  var h = '';
  Core.SOURCES.forEach(function (sc) {
    var m = db.it[sc.id]; if (!m) return;
    var tot = 0, ok = 0, out = 0, rej = {}, why = {};
    Object.keys(m).forEach(function (pid) {
      var e = m[pid]; tot++;
      if (e[2] && e[1] > 0) ok++; else if (e[2]) out++;
      else if (e[0]) { var x = Core.explainTitle(e[0]); var w = x.ok ? 'بدون قیمت' : x.why; why[w] = (why[w] || 0) + 1; }
    });
    var rj = Object.keys(why).sort(function (a, b) { return why[b] - why[a]; }).slice(0, 4).map(function (k) { return fa(why[k]) + ' × ' + esc(k); });
    h += '<div class="mkr nl"><div class="mi"><b>' + esc(sc.name) + '</b><small>' + fa(tot) + ' محصول دریافت شده · ' + fa(ok) + ' موجود و در فهرست · ' + fa(out) + ' ناموجود</small>'
      + (rj.length ? '<small>کنار گذاشته شده: ' + rj.join('، ') + '</small>' : '') + '</div></div>';
  });
  $('whyCov').innerHTML = h || '<div class="hint2">هنوز چیزی دریافت نشده.</div>';
}
/* ---- «گزارش کامل برای سازنده»: وضعیت هر فروشگاه + هرچه از آن عطر در حافظه هست + پرسشِ زنده از خودِ سایت و نتیجه‌ی همان خط لوله ---- */
var dgBusy = false;
async function dgRun() {
  if (dgBusy) return; dgBusy = true;
  var btn = $('dgGo'), L = [], q = ($('dgIn').value || '').trim();
  btn.disabled = true; btn.textContent = 'در حال ساخت گزارش…';
  var ago = function (t) { return t ? Math.round((Date.now() - t) / 60000) + ' دقیقه پیش' : '—'; };
  try {
    L.push('=== گزارش تشخیص ' + VERSION + ' · ' + new Date().toISOString() + ' ===');
    L.push('Native: ' + (window.Native ? 'yes' : 'no') + ' appCode=' + (function () { try { return window.Native.appCode(); } catch (e) { return '?'; } })() + ' online=' + navigator.onLine + ' UA=' + String(navigator.userAgent).slice(0, 110));
    L.push('خاموش‌شده‌ها: سایت=' + Object.keys(set.soff || {}).join(',') + ' برند=' + Object.keys(set.off || {}).length + ' پنهان=' + Object.keys(set.hide || {}).length + ' واژه‌ی ممنوع=' + ((set.block || []).length || 0));
    L.push('در فهرست: ' + list.length + ' عطر · مبهم: ' + hiddenN);
    var shown = {}; FLAT.forEach(function (g) { shown[g.id] = g; });
    L.push('\n--- فروشگاه‌ها ---');
    Core.SOURCES.forEach(function (sc) {
      var x = stt[sc.id] || {}, m = db.it[sc.id] || {}, tot = 0, pr = 0, oos = 0, rej = 0, stale = 0, why = {};
      var lim = Math.floor(Date.now() / 60000) - Core.STALE_MIN;
      Object.keys(m).forEach(function (pid) {
        var e = m[pid]; tot++;
        if (e[2] && e[1] > 0) { pr++; if (!(e[4] > lim)) stale++; } else if (e[2]) oos++;
        else if (e[0]) { rej++; var w = Core.explainTitle(e[0]); var k = w.ok ? 'بدون قیمت' : w.why; why[k] = (why[k] || 0) + 1; }
      });
      L.push(sc.id + ' (' + sc.name + '): ' + (x.ok ? 'ok' : 'FAIL ' + (x.raw || x.err || '')) + ' · حالت=' + (x.mode || '?') + ' · n=' + (x.n || 0) + ' · ' + ago(x.t) + ' · آخرین کامل=' + ago(db.full[sc.id]) + ' · note=' + (x.note || ''));
      L.push('   حافظه: کل=' + tot + ' قیمت‌دار=' + pr + ' (کهنه‌شده ' + stale + ') ناموجود=' + oos + ' ردشده/بی‌قیمت=' + rej + ' · ' + Object.keys(why).sort(function (a, b) { return why[b] - why[a]; }).slice(0, 5).map(function (k) { return why[k] + '×' + k; }).join(' | '));
    });
    var terms = q ? Core.normFa(q, true).split(/\s+/).filter(function (w) { return w.length >= 2; }) : ['کلینیک', 'clinique', 'کیلینیک'];
    L.push('\n--- آنچه در حافظه‌ی برنامه با «' + (q || 'کلینیک / clinique / کیلینیک') + '» هست ---');
    var rows = [];
    Object.keys(db.it || {}).forEach(function (sr) {
      var m = db.it[sr] || {};
      Object.keys(m).forEach(function (pid) {
        var e = m[pid]; if (!e[0]) return; var n = Core.normFa(e[0], true);
        var hit = q ? terms.every(function (w) { return n.indexOf(w) >= 0; }) : terms.some(function (w) { return n.indexOf(w) >= 0; });
        if (hit) rows.push([sr, pid, e]);
      });
    });
    L.push(rows.length + ' مورد' + (rows.length > 80 ? ' (۸۰ تای اول)' : ''));
    rows.slice(0, 80).forEach(function (r) {
      var e = r[2], g = e[2] ? shown[e[2]] : null, st;
      if (e[2] && e[1] > 0 && g) st = 'IN-LIST'; else if (e[2] && e[1] > 0) st = 'priced-but-not-shown'; else if (e[2]) st = 'out-of-stock(price0)'; else { var w = Core.explainTitle(e[0]); st = w.ok ? 'no-price' : 'REJECTED: ' + w.why; }
      L.push(r[0] + ' #' + r[1] + ' | ' + e[0].slice(0, 90) + ' | price=' + e[1] + ' ml=' + e[3] + ' | seen ' + Math.round((Date.now() / 60000 - e[4])) + 'min ago | ' + st);
    });
    var probe = q || 'clinique';
    L.push('\n--- پرسش زنده از خودِ سایت‌ها: «' + probe + '» ---');
    var bases = { liliome: 'https://liliome.com', safir: 'https://www.safirstores.com', hiland: 'https://hilandbeauty.com' };
    for (var id in bases) {
      if (!srcOn(id)) { L.push(id + ': خاموش'); continue; }
      btn.textContent = 'پرسیدن از ' + id + '…';
      var P; try { P = await Core.probeShop(net, bases[id], probe); } catch (e) { L.push(id + ': خطا ' + (e && e.message || e)); continue; }
      L.push(id + ' · ' + P.calls.join(' · ') + (P.err ? ' · pipeline-error: ' + P.err : '') + ' · ' + P.rows.length + ' محصول');
      P.rows.forEach(function (r) {
        var st = (db.it[id] || {})[String(r.id)];
        L.push('  #' + r.id + ' ' + r.name + ' | ' + r.type + ' stock=' + r.stock + ' buy=' + r.buy + ' backorder=' + r.back + ' price=' + r.price + ' ' + r.cur + (r.range ? ' RANGE' : '') + ' | cats=' + r.cats + ' | in-instock-list=' + r.inInstock + ' | size: spec=' + r.spec + ' name=' + r.nameSize);
        L.push('     برنامه: st=' + r.appSt + ' price=' + r.appPrice + ' «' + r.appT + '» ' + (r.appOk === true ? 'نام قابل‌قبول' : r.appOk === false ? 'REJECT: ' + r.appWhy : '') + ' | در حافظه: ' + (st ? 'بله price=' + st[1] + ' gid=' + (st[2] ? 'yes' : 'no') + ' ml=' + st[3] + ' ' + (st[2] && shown[st[2]] ? 'IN-LIST' : '') : 'خیر'));
      });
    }
    L.push('\n--- خطاهای شبکه ---');
    netBad.concat(netLog).slice(-8).forEach(function (l) { L.push(l.s + ' ' + l.u + ' ' + String(l.b).slice(0, 160)); });
  } catch (e) { L.push('خطا در ساخت گزارش: ' + (e && e.stack || e)); }
  var t = L.join('\n'), ta = $('dgOut');
  ta.value = t; ta.style.display = '';
  var copied = false; try { if (window.Native && window.Native.copy) { window.Native.copy(t); copied = true; } else if (navigator.clipboard) { navigator.clipboard.writeText(t).catch(function () { }); copied = true; } } catch (e) { }
  btn.disabled = false; btn.textContent = copied ? 'کپی شد؛ در پیام برای سازنده بچسبانید (دوباره: بزنید)' : 'گزارش پایین است؛ متن را نگه دارید و کپی کنید';
  dgBusy = false;
}
$('dgGo').onclick = dgRun;
$('whyGo').onclick = whyRun;
$('whyIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); whyRun(); } });
$('whyCovB').onclick = whyCover;
$('sSamp').onclick = function () {
  var srcN = {}; Core.SOURCES.forEach(function (x) { srcN[x.id] = x.name; });
  var bad = [], rej = [], okk = [], SUS = /(^| )(با|مناسب|ویژه|مخصوص|فصل|رایحه|ساختار|همراه|دارای)( |$)/;
  Object.keys(db.it || {}).forEach(function (sr) { var m = db.it[sr] || {}; Object.keys(m).forEach(function (pid) {
    var e = m[pid]; if (!e || !e[0]) return;
    var g = e[2] && db.g[e[2]], nm = g ? (g.k || []).join(' ') : '';
    var line = (srcN[sr] || sr) + ' | ' + e[0] + ' | ' + (g ? nm : 'رد شد') + ' | ' + (e[3] || '');
    if (!g) rej.push(line);
    else if (nm.split(' ').length > 5 || nm.split(' ').length < 2 || SUS.test(nm)) bad.push(line);
    else okk.push(line);
  }); });
  var t = 'نمونه عنوان‌ها ' + VERSION + ' (فروشگاه | عنوان اصلی | نام ساخته‌شده | میل)\n\nمشکوک (' + bad.length + '):\n' + bad.join('\n')
    + '\n\nردشده (' + rej.length + '):\n' + rej.join('\n') + '\n\nبقیه (' + okk.length + '):\n' + okk.join('\n');
  var hdr = '\n\nوضعیت هر سایت در آخرین بروزرسانی:\n' + Core.SOURCES.map(function (x) { var q = stt[x.id] || {}; return x.name + ': ' + (q.ok ? 'ok ' + q.n + (q.mode ? ' (' + q.mode + ')' : '') + (q.note ? ' ' + q.note : '') : (q.raw || q.err || 'نامشخص')); }).join('\n')
    + '\nرد شده در آخرین بروزرسانی: ' + ((Core.REJ && Core.REJ.n) || 0) + ' ' + JSON.stringify((Core.REJ && Core.REJ.by) || {}) + '\nنمونهٔ ردشده‌ها:\n' + ((Core.REJ && Core.REJ.ex) || []).slice(0, 40).map(function (e) { return e[0] + ' | ' + e[1]; }).join('\n');
  var szs = ''; try { szs = '\nحجم داده‌ی ذخیره‌شده (نویسه): فهرست ' + JSON.stringify(db).length + ' ؛ تاریخچه ' + JSON.stringify(hist).length + ' ؛ ذخیره در فایل: ' + (fileOk() ? 'بله' : 'نه') + ' ؛ عطر: ' + Object.keys(db.g).length; } catch (e) { }
  t += hdr + szs;
  var raw = Object.keys(Core.RAWC || {}).map(function (h) { return '\n\n===== نمونهٔ خام صفحه: ' + h + ' =====\n' + Core.RAWC[h]; }).join('');
  t += raw; window.__samp = t;
  var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fn = 'perfume-titles-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.txt', where = '';
  try { if (window.Native && window.Native.saveText) where = window.Native.saveText(fn, t) || ''; } catch (e) { where = ''; }
  if (where) { $('sSamp').textContent = 'پشتیبان ذخیره شد: ' + fn; $('sSend').disabled = false; toast('پشتیبان در پوشهٔ دانلود ذخیره شد', 3500); return; }
  if (window.Native && window.Native.copy) window.Native.copy(t); else if (navigator.clipboard) navigator.clipboard.writeText(t).catch(function () {});
  toast('ذخیرهٔ فایل نشد؛ متن کپی شد', 3500);
};
$('sSend').onclick = function () {
  var ok = false; try { ok = !!(window.Native && window.Native.shareBackup && window.Native.shareBackup()); } catch (e) { ok = false; }
  if (!ok) toast('اول پشتیبان را ذخیره کنید', 2500);
};
window.__back = function () {
  if ($('updBox').classList.contains('on')) { updDismiss(); return true; }
  if (vwId) { closeViewer(); return true; }
  if (dtId) { closeDetail(); return true; }
  if (mkOn) { closeReport(); return true; }
  if (fvOn) { closeFav(); return true; }
  if (srOn) { closeSearch(); return true; }
  if (open) { closeSheet(); return true; }
  return goUp();
};

/* ---------- اندازه‌ی نوشته ---------- */
var FS = [1, 1.15, 1.3, 1.5];
function applyFs() { document.documentElement.style.setProperty('--zs', FS[set.fs | 0] || 1); document.documentElement.classList.toggle('big', (set.fs | 0) >= 2); }
/* ---------- جستجو ----------
   نتیجه‌ها «کارتِ عکس‌دار» هستند: عکسِ بزرگ + نام + برند. لمسِ کارت = رفتن به قیمت‌ها، و جستجو زیرِ آن باز می‌ماند؛
   با «برگشت» دوباره همان لیست (با همان جای اسکرول) می‌آید. لیست مغازه جداست (دکمه‌ی ستاره‌ی پایین). */
var srLastRaw = '', srOn = false, fvOn = false, srIdx = [], srSig = '', srT = 0, srVoice = null, voiceOn = false, voiceTo = 0, srLv = null, srLvTok = 0, srLvT = 0;
function srNorm(x) { return Core.srn(x); }
var srTools = {
  toEn: function (w) { var r = Core.fa2en([w], db.wd); return Array.isArray(r) ? r.join(' ') : String(r); },
  toFa: function (w) { var r = Core.en2fa([w], db.wd); return Array.isArray(r) ? r.join(' ') : String(r); }
};
var srWT = 0;
function srWarm() { clearTimeout(srWT); srWT = setTimeout(function () { try { srBuild(); } catch (e) { } }, 2200); }
/* نمایه فقط به نام‌ها و شناسه‌ها بستگی دارد؛ با هر تغییرِ قیمت دوباره ساخته نمی‌شود (روی گوشی ثانیه‌ها طول می‌کشد) */
function srSigOf() {
  var h = 0, n = 0;
  for (var i = 0; i < TREE.length; i++) {
    var ms = TREE[i].models; n += ms.length;
    for (var j = 0; j < ms.length; j++) { var t = ms[j].id + '|' + ms[j].name; for (var k = 0; k < t.length; k++) h = (h * 31 + t.charCodeAt(k)) | 0; }
  }
  return TREE.length + ':' + n + ':' + h + ':' + (set.lang === 'en' ? 'en' : 'fa') + ':' + Object.keys(db.wd || {}).length + ':' + Object.keys(set.hide).join(',') + ':' + Object.keys(set.off || {}).join(',');
}
function srBuild() {
  var sig = srSigOf(); if (sig === srSig) return;
  srIdx = Core.searchIndex(TREE, srTools.toEn); srSig = sig;      // نشانه فقط بعد از ساختنِ درست؛ اگر خطا شد دفعه‌ی بعد دوباره امتحان می‌شود
}
/* دو ردیفِ هم‌نامِ پشت‌سرهم (یک عطر با نام فارسی و انگلیسی): کنارش اولین عنوانِ سایت را بنویس تا فرقشان معلوم باشد */
function srDup(list) {
  var c = {}; list.forEach(function (x) { var k = x.b.name + '|' + x.m.name; c[k] = (c[k] || 0) + 1; });
  return function (x) {
    if (c[x.b.name + '|' + x.m.name] < 2) return '';
    var v = x.m.variants && x.m.variants[0], t = v ? String(v.name || '') : '';
    return t && t !== x.m.name ? ' · ' + (t.length > 26 ? t.slice(0, 26) + '…' : t) : '';
  };
}
function genOf(m) { var g = {}, o = []; (m.variants || []).forEach(function (v) { if (v.gn && GN[v.gn] && !g[v.gn]) { g[v.gn] = 1; o.push(GN[v.gn]); } }); return o.join(' و '); }
/* قیمتِ نمونه برای کارتِ جستجو: اندازه‌ی ۱۰۰ میل (اگر نبود، اولین اندازه). چند نسخه (مردانه/زنانه/غلظت) با قیمتِ متفاوت: ارزان‌ترین */
function pcPrice(m) {
  var c = [];
  (m.variants || []).forEach(function (v) {
    var z = null; (v.sizes || []).forEach(function (q) { if (q && q.price > 0 && (!z || (q.ml === 100 && z.ml !== 100))) z = q; });
    if (z) c.push(z);
  });
  if (c.some(function (z) { return z.ml === 100; })) c = c.filter(function (z) { return z.ml === 100; }); else if (c.length) c = c.filter(function (z) { return z.ml === c[0].ml; });
  if (!c.length) return null;
  var lo = c[0], diff = false; c.forEach(function (z) { if (z.price !== lo.price) diff = true; if (z.price < lo.price) lo = z; });
  return { z: lo, many: diff };
}
/* قیمتِ بلند (مثلاً ۱۴۲ میلیون) در فونتِ خیلی بزرگ از حباب بیرون نزند: فقط همان حباب کمی کوچک می‌شود */
function fitPz(box) {
  try {
    var all = box.querySelectorAll('.pz'), bad = [], i;
    for (i = 0; i < all.length; i++) if (all[i].scrollWidth > all[i].clientWidth + 1) bad.push(all[i]);      // اول فقط خواندن (یک بار چیدمان)؛ فقط حباب‌های بیرون‌زده کوچک می‌شوند
    bad.forEach(function (z) {
      var n = 0, fs = parseFloat(getComputedStyle(z).fontSize);
      while (z.scrollWidth > z.clientWidth + 1 && fs > 9 && n++ < 30) { fs -= .5; z.style.fontSize = fs + 'px'; }
    });
  } catch (e) { }
}
/* کارتِ عطر: عکسِ بزرگ، نام، برند، قیمت. o: {best, gone, lab} */
function pcard(m, b, o) {
  o = o || {}; var im = entryImg(m.id), gl = genOf(m), pp = pcPrice(m);
  return '<button type="button" class="pc' + (o.best ? ' best' : '') + '" data-id="' + esc(m.id) + '"><span class="pph">' + tile({ loc: im ? im.loc : '', img: im ? im.img : '', k: im ? im.k : 0 }) + '</span><span class="pin">' + (o.best ? '<span class="pbest">بهترین حدس</span>' : '') + '<b>' + esc(m.name) + '</b><small>' + esc(b.name) + (gl ? ' · ' + esc(gl) : '') + esc(o.lab || '') + '</small>' + (pp ? '<span class="pcp">' + pzh(pp.z.price) + '<small>' + (pp.many ? 'ارزان‌ترین ' : '') + fa(pp.z.ml) + ' میل</small></span>' : '') + '</span><span class="pgo" aria-hidden="true">‹</span></button>';
}
/* list: [{x: ردیفِ نمایه, sim: شبیه است؟}] */
function srCards(list, bestFirst) {
  var dp = srDup(list.map(function (r) { return r.x; })), h = '<div class="pcs">', simOn = false;
  list.forEach(function (r, i) {
    if (r.sim && !simOn) { simOn = true; h += '</div><div class="srsim">نام‌های شبیه</div><div class="pcs">'; }
    h += pcard(r.x.m, r.x.b, { best: bestFirst && i === 0 && !r.sim, lab: dp(r.x) });
  });
  return h + '</div>';
}
function srQuery() { return srVoice && $('srq').value === srVoice.text ? srVoice.text : $('srq').value; }
function srRender() {
  var raw = $('srq').value, q = srNorm(raw), box = $('srr'), html = '', strong = 99, typed = false;
  srBuild();
  if (raw !== srLastRaw) { srLastRaw = raw; box.scrollTop = 0; }      // نوشته (یا متنِ گفتار) عوض شد: نتیجه‌ها از بالا
  if (srVoice && raw === srVoice.text) {      // نتیجه‌ی گفتار: چند کارتِ نزدیک؛ نه حدسِ بی‌صدا
    html = '<div class="srvh">شنیدم: «' + esc(srVoice.text) + '»<small>' + (srVoice.ranks.length ? 'روی عکسِ عطرِ مورد نظر بزنید تا قیمت‌ها را ببینید.' : 'چیزی شبیه آن در فهرست پیدا نشد.') + '</small></div>' + srCards(srVoice.ranks, srVoice.best) + '<button type="button" class="srbtn pri" id="srAgain">دوباره بگویید</button>';
    strong = srVoice.strong;
  } else if (!q) {
    var rc = set.rec.filter(function (x) { return x && MD_BY[x[0]]; }).slice(0, 8);
    html = (rc.length ? '<div class="srvh">آخرین‌هایی که دیدید</div><div class="pcs">' + rc.map(function (x) { var m = MD_BY[x[0]]; return pcard(m, BR_BY[m.brandId]); }).join('') + '</div>' : '')
      + '<div class="sremp">نام عطر یا برند را بنویسید، یا با دکمه‌ی میکروفون بگویید.<br>مثلاً «ساواج» یا «sauvage» یا «ورساچه».</div>';
    box.innerHTML = html; fitPz(box); return;
  } else {
    typed = true;
    var out = Core.searchRank(srIdx, [raw], srTools, { prefixLast: true, similar: 8 });
    strong = out.filter(function (r) { return !r.sim && !r.miss && r.k >= 1; }).length;
    var more = out.length > 40; out = out.slice(0, 40);
    html = out.length ? srCards(out.map(function (r) { return { x: srIdx[r.i], sim: !!r.sim }; }), false) + (more ? '<div class="sremp">فقط ۴۰ مورد اول نشان داده شد؛ دقیق‌تر بنویسید.</div>' : '')
      : '<div class="sremp">در فهرستِ گوشی چیزی پیدا نشد.</div>';
  }
  box.innerHTML = html + '<div id="srlv" class="srlive"></div>'; fitPz(box);
  if (!srLv && typed && q.length >= 3 && strong === 0) { clearTimeout(srLvT); srLvT = setTimeout(function () { if (srOn && !srLv && $('srq').value === raw) srLvStart(raw); }, 900); }      // چیزی پیدا نشد: بعد از مکثِ تایپ، از خودِ سایت‌ها هم می‌پرسد
  srLvUi(strong);
}
/* ---- پرسیدن از خودِ سایت‌ها ---- */
function srLvStart(text) {
  text = String(text || '').trim(); if (!text) return;
  clearTimeout(srLvT); var tok = ++srLvTok; srLv = { q: text, busy: true }; srLvUi();
  var ids = actv().map(function (s) { return s.id; });
  Core.liveSearch(text, net, ids, srTools).then(function (res) {
    if (tok !== srLvTok) return;
    srLv = { q: text, busy: true, res: res }; srLvUi();
    return srLvMap(res.items, tok).then(function (m) { if (tok !== srLvTok) return; srLv = { q: text, busy: false, res: res, mapped: m.mapped, other: m.other }; srLvUi(); });
  }).then(null, function () { if (tok !== srLvTok) return; srLv = { q: text, busy: false, err: 1 }; srLvUi(); });
}
function srLvReset() { srLvTok++; clearTimeout(srLvT); srLv = null; }
/* عنوانِ هر کالای سایت با فهرستِ خودمان سنجیده می‌شود: اگر همان عطر در فهرست هست، کارتِ خودمان (با قیمتِ همه‌ی سایت‌ها) نشان داده می‌شود؛ وگرنه کارتِ خودِ سایت */
function srLvMap(items, tok) {
  return new Promise(function (resolve) {
    var seen = {}, mapped = [], other = [], per = {}, todo = [];
    items.forEach(function (it) { per[it.s] = (per[it.s] || 0) + 1; if (per[it.s] <= 5) todo.push(it); });
    (function next(i) {
      if (tok !== srLvTok || i >= todo.length) { resolve({ mapped: mapped, other: other }); return; }
      var it = todo[i], t = null;
      try { var rk = Core.searchRank(srIdx, [it.t], srTools, { prefixLast: false }); t = rk[0]; } catch (e) { }
      if (t && !t.sim && (t.ex || (t.s >= 1.1 && t.cnt >= 2))) { var x = srIdx[t.i]; if (!seen[x.m.id]) { seen[x.m.id] = 1; mapped.push({ x: x, sim: false }); } }
      else other.push(it);
      setTimeout(function () { next(i + 1); }, 0);      // کارِ سنگین تکه‌تکه؛ صفحه نایستد
    })(0);
  });
}
function lvCard(it) {
  return '<button type="button" class="pc live" data-u="' + esc(it.u || '') + '"' + (it.u ? '' : ' disabled') + '><span class="pph">' + tile({ loc: '', img: it.img, k: (String(it.t).length * 7) % 64 }) + '</span><span class="pin"><b>' + esc(String(it.t).length > 70 ? String(it.t).slice(0, 70) + '…' : it.t) + '</b><small>' + esc(srcName(it.s)) + '</small><span class="pcp">' + (it.price > 0 ? pzh(it.price) : it.price < 0 ? '<span class="pz nu"><b>قیمت در سایت</b></span>' : '<span class="pz no"><b>ناموجود</b></span>') + '</span><small>فقط در سایت است؛ برای دیدن بزنید</small></span><span class="pgo" aria-hidden="true">‹</span></button>';
}
function srLvUi(strong) {
  var el = $('srlv'); if (!el || !srOn) return;
  var h = '';
  if (srLv && srLv.busy && !srLv.res) h = '<div class="srvh"><span class="spn"></span>در سایت‌ها هم می‌گردم…</div>';
  else if (srLv && srLv.busy) h = '<div class="srvh"><span class="spn"></span>در حال بررسیِ نتیجه‌ی سایت‌ها…</div>';
  else if (srLv && srLv.err) h = '<div class="sremp">جستجو در سایت‌ها نشد؛ اینترنت را ببینید.</div><button type="button" class="srbtn" id="srLvBtn">دوباره امتحان کن</button>';
  else if (srLv && srLv.res) {
    var n = (srLv.mapped || []).length + (srLv.other || []).length, ns = srLv.res.notes || {}, allFail = Object.keys(ns).length && Object.keys(ns).every(function (k) { return ns[k] === 'fail'; });
    if (n) h = '<div class="srvh">در سایت‌ها پیدا شد<small>روی عکس بزنید.</small></div>' + (srLv.mapped.length ? srCards(srLv.mapped, false) : '') + (srLv.other.length ? '<div class="pcs">' + srLv.other.map(lvCard).join('') + '</div>' : '');
    else h = '<div class="sremp">' + (allFail ? 'سایت‌ها جواب ندادند؛ اینترنت را ببینید.' : 'در سایت‌ها هم چیزی شبیه آن پیدا نشد.<br>املای دیگری را امتحان کنید.') + '</div>' + (allFail ? '<button type="button" class="srbtn" id="srLvBtn">دوباره امتحان کن</button>' : '');
  } else if (strong !== 99 && ($('srq').value || '').trim().length >= 2 && !(srVoice && $('srq').value === srVoice.text && !srVoice.ranks.length)) h = '<button type="button" class="srbtn" id="srLvBtn">اینها نبود؟ در سایت‌ها هم بگرد</button>';
  el.className = 'srlive' + (srLv && !srLv.err ? ' has' : '');
  el.innerHTML = h; fitPz(el);
}
function openSearch(q) {
  var was = srOn; if (!was) layerMark(); srOn = true; $('srch').classList.add('on');
  if (typeof q === 'string') { $('srq').value = q; srLvReset(); }
  else if (!was) { srVoice = null; srLvReset(); $('srq').value = ''; }      // هر بار از نو؛ زیرِ آن «آخرین‌هایی که دیدید» می‌آید
  srRender();
  if (!was) layerMark();
  if (typeof q !== 'string' && !was) setTimeout(function () { try { $('srq').focus(); } catch (e) { } }, 60);      // با گفتار: صفحه‌کلید باز نشود
}
function closeSearch() { layerMark(); srOn = false; clearTimeout(srT); srLvReset(); $('srch').classList.remove('on'); try { $('srq').blur(); } catch (e) { } }
$('sr').onclick = function () { openSearch(); }; $('srx').onclick = closeSearch; $('dkS').onclick = function () { openSearch(); };
$('srq').addEventListener('input', function () { srVoice = null; srLvReset(); clearTimeout(srT); srT = setTimeout(srRender, 120); });
$('srq').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); clearTimeout(srT); if (!srLv || srLv.q !== srQuery().trim()) srLvReset(); srRender(); try { $('srq').blur(); } catch (x) { } } });      // دکمه‌ی «جستجو»ی صفحه‌کلید: صفحه‌کلید بسته شود و نتیجه‌ها دیده شوند
$('srr').addEventListener('click', function (e) {
  if (ghosted()) return;
  var b = e.target.closest('button.pc');
  if (b) {
    if (b.dataset.id) { if (MD_BY[b.dataset.id]) openDetail(b.dataset.id); else toast('این عطر دیگر در فهرست نیست', 2500); }
    else if (b.dataset.u) openLink(b.dataset.u);
    return;
  }
  if (e.target.closest('#srAgain')) { startVoice(); return; }
  if (e.target.closest('#srLvBtn')) srLvStart(srQuery());
});
/* ---------- لیست مغازه (جدا از جستجو) ---------- */
function favRender() {
  var rows = Object.keys(set.fav).map(function (id) {
    var m = MD_BY[id], lab = String(set.fav[id]).split(' | ');
    return m ? { id: id, m: m, b: BR_BY[m.brandId], k: BR_BY[m.brandId].name + ' ' + m.name } : { id: id, gone: 1, bn: lab[0] || '', mn: lab[1] || lab[0] || '', k: (lab[0] || '') + ' ' + (lab[1] || '') };
  });
  rows.sort(function (a, c) { return a.k.localeCompare(c.k, 'fa'); });
  var h = rows.map(function (r) {
    var card = r.gone ? '<button type="button" class="pc gone" disabled><span class="pph">' + tile({ k: 0 }) + '</span><span class="pin"><b>' + esc(r.mn) + '</b><small>' + esc(r.bn) + ' · الان در سایت‌ها نیست</small></span></button>' : pcard(r.m, r.b);
    return '<div class="pcw">' + card + '<button type="button" class="pfv" data-f="' + esc(r.id) + '" aria-label="برداشتن از لیست مغازه">★</button></div>';
  }).join('');
  $('fvr').innerHTML = rows.length ? '<div class="srvh">عطرهایی که در مغازه دارید<small>روی عکس بزنید تا قیمت‌ها را ببینید. ستاره‌ی کنارِ هر عطر برای برداشتن از لیست است.</small></div><div class="pcs">' + h + '</div>'
    : '<div class="sremp">لیست مغازه خالی است.<br>در صفحه‌ی قیمتِ هر عطر روی «افزودن به لیست مغازه» بزنید.</div>';
  fitPz($('fvr'));
}
function openFav() { layerMark(); fvOn = true; $('fv').classList.add('on'); favRender(); $('fvr').scrollTop = 0; }
function closeFav() { layerMark(); fvOn = false; $('fv').classList.remove('on'); }
$('dkF').onclick = openFav; $('fvx').onclick = closeFav;
$('fvr').addEventListener('click', function (e) {
  if (ghosted()) return;
  var f = e.target.closest('.pfv');
  if (f) {
    layerMark(); var fid = f.dataset.f, fval = set.fav[fid]; delete set.fav[fid]; ls.set('pp.set', set); var sc = $('fvr').scrollTop; favRender(); $('fvr').scrollTop = sc;
    toast('از لیست مغازه برداشته شد', 5000, function () { set.fav[fid] = fval; ls.set('pp.set', set); var s2 = $('fvr').scrollTop; favRender(); $('fvr').scrollTop = s2; });
    return;
  }
  var b = e.target.closest('button.pc'); if (b && b.dataset.id) { if (MD_BY[b.dataset.id]) openDetail(b.dataset.id); else toast('این عطر دیگر در فهرست نیست', 2500); }
});
/* ---------- گفتنِ نام عطر ---------- */
function startVoice() {
  if (voiceOn) return;
  if (!hasN('startVoice')) { toast('ضبط صدا در این گوشی نیست؛ نام را بنویسید', 3500); openSearch(); return; }
  voiceOn = true; clearTimeout(voiceTo); voiceTo = setTimeout(function () { voiceOn = false; }, 60000);
  try { window.Native.startVoice(); } catch (e) { window.__voiceErr('fail'); }
}
/* alts: چند حدسِ تشخیص‌دهنده. همیشه «کارت‌های عکس‌دار» نشان می‌دهد (هیچ‌وقت بی‌خبر یک عطر را باز نمی‌کند):
   پدر عکس را می‌بیند، روی درستش می‌زند و به قیمت‌ها می‌رود. اگر حدسِ خوبی نبود، همان‌جا از خودِ سایت‌ها هم می‌پرسد. */
function voiceGo(alts) {
  alts = alts.map(srNorm).filter(function (a, i, ar) { return a && ar.indexOf(a) === i; });
  if (!alts.length) { toast('چیزی نشنیدم؛ دوباره بگویید', 3000); return null; }
  srBuild();
  var rk = Core.searchRank(srIdx, alts, srTools, { prefixLast: false, similar: 12 }), said = alts[0];
  var top = rk[0], sec = null, strong = 0;
  rk.forEach(function (r) { if (!r.sim && !r.miss && r.k >= 1) strong++; });
  for (var q = 1; top && q < rk.length && q < 12; q++) { if (!top.ex || rk[q].ex) { sec = rk[q]; break; } }      // وقتی نام دقیق گفته شده، فقط یک نامِ «دقیقِ» دیگر رقیب است، نه املای نزدیک
  var gap = sec ? top.s - sec.s : 9;
  /* «بهترین حدس» فقط وقتی نوشته می‌شود که نام کامل و بی‌رقیب باشد: نه فقط برند، نه واژه‌ی بی‌جواب، نه دو املای هم‌امتیاز */
  var near = rk.length > 1 && top.s - rk[1].s < .03 - 1e-9;      // دو املای تقریباً هم‌امتیاز (مثلاً «تامین» و «تمین» که هر دو در فهرست‌اند)
  var sure = !!top && !top.sim && !top.bo && !top.miss && !top.dupc && !near && (top.ex ? gap >= .12 - 1e-9 : (top.cnt >= 2 && top.s >= 1.15 && top.mn >= .7 && gap >= .15 - 1e-9));
  srVoice = { text: said, strong: strong, best: sure, ranks: rk.slice(0, 12).map(function (r) { return { x: srIdx[r.i], sim: !!r.sim }; }) };
  if (vwId) closeViewer(); if (dtId) closeDetail(); if (fvOn) closeFav(); if (mkOn) closeReport();      // هرچه باز بود بسته شود تا لیست دیده شود
  openSearch(said);
  var live = strong < 2; if (live) srLvStart(said);
  return { kind: rk.length ? 'list' : 'none', said: said, n: srVoice.ranks.length, best: sure ? srIdx[top.i].m.id : null, live: live };
}
window.__voiceRes = function (arr) {
  voiceOn = false; clearTimeout(voiceTo);
  try { voiceGo(Array.isArray(arr) ? arr.map(String) : []); } catch (e) { console.error(e); toast('جستجو نشد؛ نام را بنویسید', 3500); openSearch(); }      // خطای ناگهانی نباید پدر را بی‌جواب بگذارد
};
window.__voiceErr = function (c) {
  voiceOn = false; clearTimeout(voiceTo);
  if (c === 'cancel') return;
  if (c === 'nomatch') { toast('چیزی نشنیدم؛ دوباره بگویید', 3000); return; }
  if (c === 'net') toast('تشخیص صدا اینترنت می‌خواهد؛ اینترنت را بررسی کنید یا نام را بنویسید', 4500);
  else if (c === 'audio') toast('میکروفون کار نکرد؛ نام را بنویسید', 4000);
  else toast('تشخیص صدا انجام نشد؛ نام را بنویسید', 4000);
  openSearch();
};
$('dkM').onclick = startVoice; $('srm').onclick = startVoice;
/* ---------- تنظیمات: اندازه‌ی نوشته، واژه‌های ممنوع، عطرهای پنهان ---------- */
function renderMine() {
  Array.prototype.forEach.call($('sFs').children, function (b) { b.classList.toggle('on', +b.dataset.v === (set.fs | 0)); });
  var bl = set.block.map(function (w, i) { return '<button type="button" class="ch" data-i="' + i + '"><bdi>' + esc(w) + '</bdi></button>'; }).join('');
  if ($('bkList')._h !== bl) { $('bkList')._h = bl; $('bkList').innerHTML = bl; }
  var hk = Object.keys(set.hide), hl = hk.map(function (id) { return '<button type="button" class="ch" data-id="' + esc(id) + '"><bdi>' + esc(String(set.hide[id]).replace(' | ', ' ، ')) + '</bdi></button>'; }).join('');
  if ($('hdList')._h !== hl) { $('hdList')._h = hl; $('hdList').innerHTML = hl; }
  $('hdHint').textContent = 'برای برگرداندنِ هر عطر روی نامش بزنید.';
  $('hdBox').style.display = hk.length ? '' : 'none';      // دکمه‌ی پنهان‌کردن برداشته شد؛ این بخش فقط وقتی هست که از قبل عطری پنهان شده باشد
}
$('sFs').onclick = function (e) { var b = e.target.closest('button'); if (!b || b.dataset.v == null) return; set.fs = +b.dataset.v; ls.set('pp.set', set); applyFs(); renderMine(); if (curModel) mountModel(curModel.getAnchor()); };
function addBlock() {
  var inp = $('bkIn'), w = inp.value.trim();
  if (w.length < 3) { toast('حداقل سه حرف بنویسید؛ واژه‌ی کوتاه چیزهای زیادی را حذف می‌کند', 3500); return; }
  if (set.block.indexOf(w) >= 0) { inp.value = ''; return; }
  set.block.push(w); ls.set('pp.set', set); inp.value = '';
  Core.setBlock(set.block);
  var n = Core.purgeStored(db); saveDb();
  try { rebuild(); } catch (e) { console.error(e); }
  renderSheet(); toast(n ? fa(n) + ' کالا از فهرست برداشته شد' : 'ثبت شد؛ از این به بعد این واژه وارد فهرست نمی‌شود', 3500);
}
$('bkAdd').onclick = addBlock;
$('bkIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addBlock(); } });
$('bkList').onclick = function (e) {
  var b = e.target.closest('button.ch'); if (!b) return;
  set.block.splice(+b.dataset.i, 1); ls.set('pp.set', set); Core.setBlock(set.block);
  db.full = {}; saveDb();                                    // دریافتِ کاملِ بعدی کالاهای برداشته‌شده را دوباره می‌سنجد
  renderSheet(); toast('برداشته شد؛ با بروزرسانیِ بعدی کالاهایش برمی‌گردد', 3500);
  if (!busy) refresh(true);
};
$('hdList').onclick = function (e) {
  var b = e.target.closest('button.ch'); if (!b) return;
  delete set.hide[b.dataset.id]; ls.set('pp.set', set);
  try { rebuild(); } catch (e2) { console.error(e2); }
  renderSheet(); toast('عطر برگشت', 2200);
};
/* ---------- بروزرسانی خودکارِ خودِ برنامه ----------
   بدون دکمه و بدون پرسیدن: برنامه خودش نسخه‌ی تازه را می‌پرسد، بی‌صدا می‌گیرد و در لحظه‌ی بی‌کاری (یا وقتی دوباره باز می‌شود)
   خودش از نو باز می‌شود. فقط اگر بخشِ اصلیِ برنامه (جاوا) عوض شده باشد نصبِ فایل لازم است؛ آن‌وقت یک کارتِ ساده با یک دکمه می‌آید. */
var updSt = { code: 0, ready: 0, phase: '', pct: null, dismissed: false, checking: false, manual: false, mode: '', last: +ls.get('pp.updt', 0) || 0, autoTm: 0 }, UPD_EVERY = 20 * 60000;
(function () { var d = ls.get('pp.updDis', null); if (Array.isArray(d) && d[1] > 0 && Date.now() - d[1] >= 0 && Date.now() - d[1] < 3 * 3600000) { updSt.dismissed = true; updSt.dismissAt = d[1]; updSt.dismissCode = +d[0] || 0; } })();      // «بعداً» با بسته شدنِ برنامه فراموش نشود
var lastTouch = Date.now() - 20000;      // هنوز کسی دست نزده = بی‌کار
['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { lastTouch = Date.now(); }, { capture: true, passive: true }); });
function hasN(k) { return !!(window.Native && typeof window.Native[k] === 'function'); }
function updText(t) { updSt.msg = t; var e = $('sUpdT'); if (e) e.textContent = t; }
function updAutoOn() { return set.updAuto !== 0; }
function updAgo() { var d = Date.now() - (updSt.last || 0); return !updSt.last ? '' : d < 120000 ? 'همین الان' : d < 3600000 ? fa(Math.round(d / 60000)) + ' دقیقه پیش' : d < 86400000 ? fa(Math.round(d / 3600000)) + ' ساعت پیش' : fa(Math.round(d / 86400000)) + ' روز پیش'; }
function updStatus() { var e = $('sUpdT'); if (!e) return; e.textContent = (updSt.msg ? updSt.msg + '. ' : '') + 'برنامه خودش بروز می‌شود؛ لازم نیست کاری بکنید.' + (updSt.last ? ' آخرین بررسی: ' + updAgo() + '.' : ''); }
/* کی می‌شود بی‌خبر از نو بازش کرد؟ وقتی پدر چیزی را باز نکرده، چند ثانیه دست نزده و قیمت‌ها هم در حال گرفتن نیست */
function updSafe() {
  if (document.hidden || busy || voiceOn || swapping || vwId || dtId || srOn || fvOn || mkOn || open) return false;
  var idle = Date.now() - lastTouch;
  if (!db.ready) return idle > 30000;      // روی «در حال بارگذاری» گیر کرده و کسی کاری نمی‌کند: بروزرسانی همین را درست می‌کند
  return nav.lvl === 0 ? idle > 15000 : idle > 180000;      // وسطِ خواندنِ لیستِ یک برند: دست‌کم سه دقیقه بی‌حرکت
}
function manualArm() { clearTimeout(updSt.manualTm); if (updSt.manual) updSt.manualTm = setTimeout(function () { updSt.manual = false; }, 90000); }      // «همین حالا» فقط چند لحظه اعتبار دارد؛ تا وقتی دانلود پیش می‌رود تمدید می‌شود
function updCheck(manual) {
  updSt.manual = !!manual; manualArm();
  if (!hasN('updCheck') && !hasN('otaCheck')) { if (manual) toast('این امکان فقط در برنامه‌ی نصب‌شده کار می‌کند', 3000); return; }
  if (updSt.phase === 'dl' || updSt.phase === 'inst') { updRender(); return; }      // همین الان دارد گرفته/باز می‌شود؛ از نو شروع نکن
  if (updSt.phase === 'ready') { updRender(); updAuto(); return; }      // آماده است و منتظرِ لحظه‌ی مناسب
  if (updSt.checking && Date.now() - updSt.checkT < 45000) return;      // پرسیدن در جریان است
  updSt.last = Date.now(); ls.set('pp.updt', updSt.last);
  updSt.checking = true; updSt.checkT = Date.now(); updSt.mode = ''; updRender();
  clearTimeout(updSt.checkTm); updSt.checkTm = setTimeout(function () { if (updSt.checking && !updSt.phase) window.__otaInfo({ ok: false, reason: 'net' }); }, 45000);      // جوابی نیامد: گیر نکن
  if (manual) updText('در حال بررسی…');
  if (hasN('otaCheck')) {      // اول بروزرسانیِ بدون نصب. فایل APK فقط وقتی لازم است که خودِ جاوا عوض شده باشد
    try { window.Native.otaCheck(); } catch (e) { window.__otaInfo({ ok: false, reason: 'net' }); }
    return;
  }
  updApk();      // برنامه‌ی قدیمی که اصلاً بروزرسانیِ بی‌نصب ندارد
}
function updApk() { try { window.Native.updCheck(); } catch (e) { window.__updErr('check'); } }
function updDue() { var f = Math.min(Math.max((+ls.get('pp.updFail', 0) || 0) - 1, 0), 4); return updAutoOn() && (hasN('updCheck') || hasN('otaCheck')) && Date.now() - (+ls.get('pp.updt', 0) || 0) > UPD_EVERY * (1 << f); }      // چند بار پشت‌سرهم نشد: فاصله دو برابر می‌شود (تا حدود پنج ساعت)
/* آماده است: اگر لحظه‌ی مناسب باشد همین الان، وگرنه هر چند ثانیه دوباره نگاه می‌کند */
function updAuto() {
  clearTimeout(updSt.autoTm);
  if (updSt.phase !== 'ready' || !updSt.ready) return;
  if (updSt.mode === 'apk' && updSt.dismissed && !updSt.manual && (!updSt.dismissCode || updSt.dismissCode === updSt.ready) && Date.now() - (updSt.dismissAt || 0) >= 0 && Date.now() - (updSt.dismissAt || 0) < 3 * 3600000) { updSt.autoTm = setTimeout(updAuto, 300000); return; }      // «بعداً» را زده؛ سه ساعت مزاحم نشو
  var go = updSt.manual || (updAutoOn() && updSafe());      // کسی دستی «بپرس» را زده: همان لحظه
  if (!go) { updSt.autoTm = setTimeout(updAuto, 4000); return; }
  if (updSt.mode === 'ota') updApply();
  else if (updSt.mode === 'apk') { updSt.dismissed = false; updSt.cardOk = true; updRender(); }      // کارت فقط در لحظه‌ی بی‌کاری (یا وقتی خودش بخواهد) می‌آید
}
function updApply() {
  updSt.phase = 'inst'; ls.set('pp.updTo', updSt.ready); updRender();
  toast('برنامه بروز می‌شود…', 1600);
  setTimeout(function () {
    if (updSt.phase !== 'inst' || updSt.mode !== 'ota') return;      // در این نیم‌ثانیه خطا یا چیز دیگری پیش آمد
    if (!updSt.manual && !updSafe()) { ls.set('pp.updTo', 0); updSt.phase = 'ready'; updRender(); updAuto(); return; }      // در همین نیم‌ثانیه دست زد: بگذار کارش را بکند، بعداً باز می‌شود
    var ok = false; try { ok = window.Native.otaApply(); } catch (e) { } if (!ok) window.__otaErr();
  }, 500);      // فقط صفحه با فایل‌های تازه از نو بالا می‌آید
}
/* کارتِ نصب فقط برای بروزرسانیِ APK دیده می‌شود (وقتی بخشِ اصلیِ برنامه عوض شده) */
function updRender() {
  var ph = updSt.phase, apk = updSt.mode === 'apk', g = $('updGo'), sp = g.querySelector('span'), pb = $('updPb'), me = $('sUpd'), ms = me.querySelector('span');
  if (apk && ph === 'inst') {
    $('updTx').textContent = 'در حال نصب… اگر گوشی پرسید، «نصب» یا «بروزرسانی» را بزنید. بعد از نصب برنامه را دوباره باز کنید.';
    g.disabled = true; g.classList.add('busy'); sp.textContent = 'در حال نصب…'; pb.style.display = 'none';
  } else {
    $('updTx').textContent = 'یک بروزرسانیِ مهم برای برنامه آماده است. فقط دکمه‌ی «نصب» را بزنید. بعد از نصب، برنامه را دوباره باز کنید.';
    g.disabled = false; g.classList.remove('busy'); sp.textContent = 'نصب'; pb.style.display = 'none';
  }
  var wk = ph === 'dl' || ph === 'inst' || updSt.checking;
  me.disabled = wk; me.classList.toggle('busy', wk);
  ms.textContent = ph === 'dl' ? 'در حال گرفتن…' : ph === 'inst' ? 'در حال باز کردن…' : updSt.checking ? 'در حال بررسی…' : 'همین حالا بپرس';
  if (apk && (ph === 'ready' || ph === 'inst') && updSt.cardOk && (!updSt.dismissed || updSt.manual)) { if (!$('updBox').classList.contains('on')) { updSt.cardT = Date.now(); layerMark(); } $('updBox').classList.add('on'); } else $('updBox').classList.remove('on');
  updStatus();
}
function showUpd() { updSt.phase = 'ready'; updRender(); updAuto(); }
window.__otaInfo = function (o) {
  if (!o || !o.ok) {      // پرسیدن نشد (اینترنت قطع است یا گیت‌هاب جواب نداد). هرگز سراغ فایل APK نمی‌رویم؛ فقط بعداً دوباره می‌پرسیم
    updSt.checking = false;
    if (o && o.reason === 'none') { updText('آخرین نسخه را دارید'); if (updSt.manual) toast('آخرین نسخه را دارید', 2500); }
    else { updText('الان نشد نسخه‌ی تازه را بپرسم'); if (updSt.manual) toast('بررسی انجام نشد؛ اینترنت را ببینید', 3500); }
    updRender(); return;
  }
  if (o.state === 'apk') { updApk(); return; }      // این نسخه بخشِ اصلیِ برنامه را هم عوض کرده؛ نصب لازم است
  updSt.checking = false; clearTimeout(updSt.checkTm);
  if (updSt.phase === 'dl' || updSt.phase === 'ready' || updSt.phase === 'inst') return;      // جوابِ دیررسیده؛ بروزرسانی همین الان در جریان است
  if (o.state === 'new') {      // بی‌صدا می‌گیرد؛ پنجره‌ای نمی‌آید
    updSt.code = o.code; updSt.mode = 'ota'; updText('نسخه‌ی تازه پیدا شد'); updSt.phase = 'dl'; updSt.pct = null; updRender(); updDlGuard();
    try { window.Native.otaDownload(); } catch (e) { window.__otaErr(); }
  } else if (o.cur > o.run) {      // قبلاً گرفته شده ولی هنوز باز نشده
    updSt.code = o.cur; updSt.mode = 'ota'; updSt.ready = o.cur; updText('نسخه‌ی تازه آماده است'); showUpd();
  } else {
    updText('آخرین نسخه را دارید'); updRender(); ls.set('pp.updFail', 0);
    if (updSt.manual) toast('آخرین نسخه را دارید', 2500);
  }
};
function updDlGuard() { clearTimeout(updSt.dlTm); updSt.dlTm = setTimeout(function () { if (updSt.phase === 'dl') { if (updSt.mode === 'apk') window.__updErr('slow'); else window.__otaErr(); } }, updSt.mode === 'apk' ? 600000 : 150000); }      // دو دقیقه و نیم بی‌خبری: گیر نکن
window.__otaProg = function (p) { if (updSt.phase === 'dl') { updSt.pct = +p; updDlGuard(); manualArm(); } };
window.__otaReady = function (code) { if (updSt.phase === 'inst') return; updSt.fail = 0; ls.set('pp.updFail', 0); clearTimeout(updSt.dlTm); updSt.mode = 'ota'; updSt.ready = code; updText('نسخه‌ی تازه آماده است'); showUpd(); };
window.__otaErr = function () {
  if (updSt.mode === 'apk' && updSt.phase) return;      // خطای دیررسیده‌ی بروزرسانیِ بی‌نصب، وسطِ کارِ نصبِ APK
  clearTimeout(updSt.dlTm); clearTimeout(updSt.autoTm);
  var was = updSt.phase, wasOta = updSt.mode === 'ota';
  if (was === 'dl' || was === 'inst') ls.set('pp.updFail', (+ls.get('pp.updFail', 0) || 0) + 1);
  updSt.phase = ''; updSt.checking = false; updSt.installing = false; updSt.mode = ''; updSt.ready = 0; updSt.cardOk = false; updRender();
  updText('بروزرسانی الان نشد؛ بعداً خودش دوباره امتحان می‌کند');
  if (updSt.manual || was || wasOta) { if (updSt.manual) toast('بروزرسانیِ برنامه انجام نشد', 3500); }
};
window.__updInfo = function (code) {
  updSt.checking = false; clearTimeout(updSt.checkTm);
  if (updSt.phase === 'dl' || updSt.phase === 'inst' || (updSt.phase === 'ready' && updSt.mode === 'ota')) return;      // جوابِ دیررسیده؛ کار دیگری در جریان است
  updSt.mode = 'apk';
  var cur = hasN('appCode') ? +window.Native.appCode() : 0;
  if (code > cur) {
    updSt.code = code;
    if (updSt.ready === code) { showUpd(); return; }
    updText('یک بروزرسانیِ مهم پیدا شد');
    updSt.phase = 'dl'; updSt.pct = null; updRender(); updDlGuard();      // بی‌صدا می‌گیرد
    try { window.Native.updDownload(); } catch (e) { window.__updErr('start'); }
  } else {
    updText('آخرین نسخه را دارید'); updRender();
    if (updSt.manual) toast('آخرین نسخه را دارید', 2500);
  }
};
window.__updProg = function (p) { if (updSt.phase === 'dl') { updSt.pct = +p; updDlGuard(); manualArm(); } };
window.__updReady = function (code) { if (updSt.phase === 'inst') return; updSt.fail = 0; ls.set('pp.updFail', 0); clearTimeout(updSt.dlTm); updSt.mode = 'apk'; updSt.ready = code; updText('بروزرسانیِ مهم آماده است'); showUpd(); };
window.__updErr = function (m) {
  if (updSt.mode === 'ota' && updSt.phase) return;      // خطای دیررسیده‌ی APK، وسطِ بروزرسانیِ بی‌نصب
  clearTimeout(updSt.autoTm); clearTimeout(updSt.dlTm); clearTimeout(updSt.instTm);
  var was = updSt.phase;
  if (was === 'dl' || was === 'inst') ls.set('pp.updFail', (+ls.get('pp.updFail', 0) || 0) + 1);
  updSt.phase = ''; updSt.checking = false; updSt.installing = false; updSt.mode = ''; updSt.cardOk = false; updRender();
  updText('بروزرسانی الان نشد؛ بعداً خودش دوباره امتحان می‌کند');
  if (updSt.manual) toast('بروزرسانیِ برنامه انجام نشد', 3500);
};
function autoMs() { var m = +set.auto; return m > 0 ? m * 60000 : 0; }      // ۰ = دستی (پیش‌فرض)
function autoDue() { var lo = lastOk(); if (!lo) return true; var a = autoMs(); return a > 0 && Date.now() - lo > a; }
var lastTry = +ls.get('pp.try', 0) || 0;       // آخرین تلاشِ بروزرسانی (ماندگار)؛ سایتِ همیشه‌خراب هر بار باز شدن را به بمباران تبدیل نکند
function launchDue() { return !busy && needFresh() && Date.now() - lastTry > 1800000; }      // قیمت‌ها قدیمی‌اند یا سایتی هنوز نیامده: حتی در حالت دستی یک بار تازه شود
window.__resume = function () {
  updPill();
  if (updSt.phase === 'inst' && updSt.mode === 'apk') { clearTimeout(updSt.instTm); updSt.instTm = setTimeout(function () { if (updSt.phase === 'inst' && updSt.mode === 'apk') { updSt.phase = 'ready'; updSt.installing = false; updRender(); } }, 20000); }      // نصب‌کننده بسته شد (لغو یا تمام): بیست ثانیه بعد دکمه دوباره کار کند، نه «در حال نصب…» برای همیشه
  if (updDue()) updCheck(false); else updAuto(); if (!busy && (autoDue() || launchDue())) refresh(false); };
document.addEventListener('visibilitychange', function () { if (!document.hidden) window.__resume(); });
window.addEventListener('beforeunload', function () { if (curModel && nav.lvl === 0) { var a = curModel.getAnchor(); if (a) ls.set('pp.last', a); } });
window.__gateTest = function (ms) { gateT0 = Date.now() - ms; db.ready = false; overlay(); };      // فقط برای آزمون
window.__pp = { newsStale: function (mode) { news.t = 1; ls.set('pp.newsTry', 0); newsLoad(mode); }, voice: function (a) { return voiceGo(a); }, setHide: function (id, on) { var m = MD_BY[id]; if (on && m) set.hide[id] = BR_BY[m.brandId].name + ' | ' + m.name; else delete set.hide[id]; ls.set('pp.set', set); rebuild(); renderSheet(); }, get fav() { return set.fav; }, openFav: openFav, openSearch: openSearch, get allBrands() { return ALLB; }, open: openEntry, up: goUp, view: viewImg, closeView: closeViewer, get nav() { return nav; }, get tree() { return TREE; }, get gate() { var ps = photoStat(); return { need: ps.need, have: ps.have, ready: !!db.ready, tot: imgTot, left: imgLeft(), ok: imgOk, bad: imgBad }; }, mount: function (m) { var t = performance.now(); set.model = m; mountModel(curModel ? curModel.getAnchor() : null); return performance.now() - t; }, get model() { return curModel; }, get list() { return list; }, get flat() { return FLAT; }, get state() { return { db: db, st: stt, busy: busy, imgLoc: imgLoc }; }, refresh: refresh, net: net };

/* شروع */
applyTheme(); applyFs();
loadImgs();
var bootOk = true;
try { rebuild(); } catch (e) { bootOk = false; console.error(e); bootBad(); }
updPill(); overlay(); renderSheet();
/* «صفحه سالم بالا آمد»: فقط وقتی بدون خطا بالا آمده و یا فهرست روی صفحه کشیده شده، یا صفحه‌ی «در حال آماده‌سازی» (بار اول/بدون داده) نشان داده شده.
   ساختنِ فهرست روی گوشی چند ثانیه طول می‌کشد، پس هر نیم‌ثانیه نگاه می‌کند (تا ۱۰۰ ثانیه).
   بسته‌ی بی‌نصبِ خراب این پیام را نمی‌فرستد و ناظرِ برنامه آن را کنار می‌گذارد و به نسخه‌ی سالم برمی‌گرداند. */
var okTries = 0, okT = setInterval(function () {
  okTries++;
  try {
    if (!hasN('otaOk') || !bootOk || bootErr || okTries > 200) { clearInterval(okT); if (!bootOk || bootErr) bootBad(); return; }
    var st = $('stage'), dk = $('dock'), ov = $('ov');
    if (st && dk && (st.children.length || (ov && ov.classList.contains('on') && ov.children.length))) { clearInterval(okT); okSent = true; otaCall('otaOk'); }
  } catch (e) { clearInterval(okT); }
}, 500);
if (autoDue() || launchDue()) refresh(false);
setTimeout(function () { if (updAutoOn() && (hasN('updCheck') || hasN('otaCheck'))) updCheck(false); }, 1500);
(function () { var to = +ls.get('pp.updTo', 0) || 0; if (!to) return; ls.set('pp.updTo', 0); var now = Math.max(+myCode || 0, hasN('appCode') ? +window.Native.appCode() : 0); if (now >= to) setTimeout(function () { toast('برنامه بروز شد ✓', 4000); }, 2500); })();      // بعد از بروزرسانیِ خودکار یک پیامِ کوتاه      // هر بار که برنامه باز می‌شود نسخه‌ی تازه را می‌پرسد
setInterval(function () { updPill(); if (!busy && autoDue()) refresh(false); if (!document.hidden && updDue()) updCheck(false); if (!document.hidden && !busy && db.ready) newsLoad('bg'); }, 30000);      // برنامه باز مانده هم باشد، هر ۲۰ دقیقه یک بار نسخه‌ی تازه را می‌پرسد
/* قفل ورود: اگر دانلود گیر کرد خودش دوباره تلاش کند؛ عکسی که جواب نداد جلوی ورود را نگیرد */
setInterval(function () {
  if (db.ready) return;
  if (!busy && imgLeft() > 0 && Date.now() - imgLastT > 40000) { imgBad += imgLeft(); imgPend = {}; checkReady(); }
  else if (!busy && imgLeft() === 0 && srcDone() < actv().length && Date.now() - lastTried > 45000) refresh(false);
}, 5000);
})();
