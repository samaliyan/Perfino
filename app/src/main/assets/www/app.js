(function () {
'use strict';
var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var VERSION = '1.30';
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
    try { localStorage.setItem(k, str); return true; } catch (e) { return false; }
  }
};
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
function Strip(el, o) {
  var L = o.letters, n = L.length, on = false;
  el.innerHTML = L.map(function (l) { return '<span>' + l + '</span>'; }).join('');
  var sp = el.children;
  function paint(fy) {
    for (var j = 0; j < n; j++) {
      var k = 1, x = o.curve ? o.curve * Math.sin(Math.PI * j / Math.max(1, n - 1)) : 0;
      if (fy != null) { var dd = j - fy; k = 1 + 1.1 * Math.exp(-dd * dd / 1.8); x += (k - 1) * 12; }
      sp[j].style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + k.toFixed(2) + ')';
    }
  }
  function mv(e) {
    var r = el.getBoundingClientRect(), y = clamp(e.clientY - r.top, 0, r.height), fy = y / r.height * (n - 1), i = Math.round(fy);
    paint(fy); o.bub.textContent = L[i]; o.bub.style.top = (e.clientY - o.box.getBoundingClientRect().top - 31) + 'px'; o.pick(i);
  }
  el.addEventListener('pointerdown', function (e) { e.stopPropagation(); on = true; try { el.setPointerCapture(e.pointerId); } catch (_) {} o.bub.classList.add('on'); mv(e); });
  el.addEventListener('pointermove', function (e) { if (on) mv(e); });
  function end() { on = false; o.bub.classList.remove('on'); paint(null); }
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  paint(null);
  return { setOn: function (i) { for (var j = 0; j < n; j++) sp[j].classList.toggle('on', j === i); } };
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
function priceHtml(p, max) {
  if (!p.sizes.length) return CHEV;
  return p.sizes.slice(0, max).map(function (z, j) {
    return j ? '<div class="p2">' + fa(z.ml) + ' میل · ' + fa(z.price) + '</div>'
      : '<div class="p1">' + fa(z.price) + (z.n < 2 ? '<i title="فقط یک سایت"></i>' : '') + '<small>' + fa(z.ml) + ' میل</small></div>';
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
  var wh = el.querySelector('.wh'), L = data.list, rows = [], st = {}, cur = 0;
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
  var sc = new Scroller(wh, { n: L.length, step: 54, axis: 'y', sign: -1, onIndex: show, onTap: function (i) { openEntry(L[i].id); }, render: function (pos) {
    winRender(rows, pos, 6, st, function (r, d, j) {
      var ad = Math.abs(d), th = Math.min(ad * .3, 1.25), x = -150 * (1 - Math.cos(th)), s = Math.max(.55, 1.12 - .15 * ad);
      r.style.display = 'flex';
      if (!r._f) { r._f = 1; fitW(r.firstChild, 12); }
      r.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (d * 54).toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      r.style.opacity = Math.max(0, 1 - .24 * ad).toFixed(3);
      r.style.filter = ad > 1.3 ? 'blur(' + ((ad - 1.3) * .8).toFixed(2) + 'px)' : 'none';
    });
  } });
  sc.set(idxOf(L, anchor));
  return {
    el: el, goto: function (i) { sc.set(i); }, getAnchor: function () { return L[sc.index()] ? L[sc.index()].id : null; },
    theme: function () { if (L[cur]) el.style.backgroundColor = bgFor(L[cur]); },
    refresh: function () { if (L[cur]) show(cur, true); },
    destroy: function () { sc.stop(); el.remove(); }
  };
}

/* ================= مدل ج: لیست شیشه‌ای ================= */
function ModelC(host, data, anchor) {
  var el = div('mod mc', '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="hdr"><div><div class="t1">قیمت امروز</div><div class="t2"></div></div><div class="cl"></div></div><div class="scl"></div><div class="fs2"></div><div class="bub2"></div>');
  host.appendChild(el);
  var L = data.list, scl = el.querySelector('.scl'), cl = el.querySelector('.cl'), gi = -1, PADT = 116;
  el.querySelector('.t1').textContent = data.title; el.querySelector('.t2').textContent = data.sub;
  /* فهرست آیتم‌ها با ارتفاع ثابت (برای ساخت فقط ردیف‌های نزدیک صفحه) */
  var items = [], top = 0, gtops = [], rowItem = [];
  L.forEach(function (p, k) {
    if (data.FI[p.L] === k) { gtops.push(top); items.push({ t: 'g', top: top, h: 40, L: p.L }); top += 40; }
    var h = p.sizes.length > 3 ? 96 : p.sizes.length > 2 ? 88 : 80;
    rowItem[k] = items.length; items.push({ t: 'r', top: top, h: h, k: k }); top += h + 9;
  });
  scl.innerHTML = '<div class="vt" style="position:relative;height:' + top + 'px"></div>';
  scl.style.paddingTop = PADT + 'px';
  function padB() { scl.style.paddingBottom = Math.max(40, (scl.clientHeight || 700) - PADT - 120) + 'px'; }   // آخرین حرف هم بتواند به بالای صفحه برسد
  padB();
  var vt = scl.firstChild, live = {}, tmp = document.createElement('div');
  function find(y) { var a = 0, b = items.length - 1; while (a < b) { var m = (a + b + 1) >> 1; if (items[m].top <= y) a = m; else b = m - 1; } return a; }
  function make(i) {
    var it = items[i], r;
    if (it.t === 'g') { tmp.innerHTML = '<div class="ghw"><span class="gh">' + it.L + '</span></div>'; r = tmp.firstChild; }
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
  function toRow(k) { scl.scrollTop = items[rowItem[k]].top - 8; }
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
    destroy: function () { window.removeEventListener('resize', onR); el.remove(); }
  };
}

/* ================= مدل ز و ح: لیست کانونی ================= */
function ModelFocus(kind, host, data, anchor) {
  var z = kind === 'z', RH = z ? 84 : 96, GAP = z ? 8 : 10, P = RH + GAP, PAD = z ? 112 : 120;
  var el = div('mod mg ' + (z ? 'mz' : 'mh'), (z ? '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>' : '<div class="ov"></div>') + '<div class="hdr"><div><div class="t1">قیمت امروز</div><div class="t2"></div></div><div class="cl"></div></div><div class="scl"></div><div class="fs2"></div><div class="bub2"></div>');
  el.style.setProperty('--rh', RH + 'px'); el.style.setProperty('--gap', GAP + 'px');
  host.appendChild(el);
  var L = data.list, scl = el.querySelector('.scl'), cl = el.querySelector('.cl'), cur = -1, gl = '', rf = 0, CY = 300;
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
    for (var k = lo; k <= hi; k++) live[k].classList.toggle('on', k === best && bd < .55);
    Object.keys(live).forEach(function (key) { if (+key < lo - 4 || +key > hi + 4) { live[key].remove(); delete live[key]; } });
    if (best !== cur) { cur = best; setCur(best); }
  }
  var down = false, settle = 0, jump = false;
  function settleNow() {
    if (down || jump) return;
    var s = scl.scrollTop, j = clamp(Math.round((s + CY - PAD - RH / 2) / P), 0, L.length - 1), t = PAD + j * P + RH / 2 - CY, d = t - s;
    if (Math.abs(d) > 1.5 && Math.abs(d) < P * .6 && t >= 0) { try { scl.scrollTo({ top: t, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { scl.scrollTop = t; } }
  }
  scl.addEventListener('scroll', function () { if (!rf) rf = requestAnimationFrame(run); clearTimeout(settle); settle = setTimeout(settleNow, 160); });
  scl.addEventListener('pointerdown', function () { down = true; });
  scl.addEventListener('touchstart', function () { down = true; }, { passive: true });
  function rel() { down = false; clearTimeout(settle); settle = setTimeout(settleNow, 160); }
  scl.addEventListener('pointerup', rel); scl.addEventListener('pointercancel', rel); scl.addEventListener('touchend', rel, { passive: true });
  var strip = Strip(el.querySelector('.fs2'), { letters: data.LET, box: el, bub: el.querySelector('.bub2'), curve: z ? 0 : 14, pick: function (i) { jump = true; clearTimeout(settle); scl.scrollTop = PAD + data.FI[data.LET[i]] * P + RH / 2 - CY; setTimeout(function () { jump = false; }, 400); } });
  function onR() { geom(); run(); }
  window.addEventListener('resize', onR);
  geom();
  scl.scrollTop = anchor ? PAD + idxOf(L, anchor) * P + RH / 2 - CY : 0;
  run();
  requestAnimationFrame(function () { geom(); if (anchor) scl.scrollTop = PAD + idxOf(L, anchor) * P + RH / 2 - CY; run(); });
  return {
    el: el, goto: function (i) { scl.scrollTop = PAD + i * P + RH / 2 - CY; }, getAnchor: function () { return L[cur] ? L[cur].id : null; },
    theme: function () { setCur(cur < 0 ? 0 : cur); },
    refresh: function () {
      Object.keys(live).forEach(function (k) {
        var r = live[k], pr = r.querySelector('.pr'); if (!pr) return;
        pr.innerHTML = priceHtml(L[+k], 3); pr.style.removeProperty('--ps'); r._f = 0; r._w = 0;
      });
      run();
    },
    destroy: function () { clearTimeout(settle); window.removeEventListener('resize', onR); el.remove(); }
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
if (!set.fav || typeof set.fav !== 'object' || Array.isArray(set.fav)) set.fav = {};          // لیست مغازه
if (!set.hide || typeof set.hide !== 'object' || Array.isArray(set.hide)) set.hide = {};      // عطرهای پنهان‌شده
if (!Array.isArray(set.block)) set.block = [];                                               // واژه‌های ممنوع
set.block = set.block.filter(function (x) { return typeof x === 'string' && x.trim().length >= 2; }).slice(0, 60);
if (!(set.fs >= 0 && set.fs <= 3)) set.fs = 0;
Core.setBlock(set.block);
if (!Object.prototype.hasOwnProperty.call(MODELS, set.model)) set.model = 'a';
var db = ls.get('pp.db', null);
if (!db || db.v !== 3 || db.fv !== 5 || !db.g || !db.it) db = Core.newDb();   // نسخه‌ی ۱.۳ همه چیز را یک‌بار از نو و کامل می‌گیرد
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
    var all = phase === 'src' ? sf * .75 : phase === 'img' ? .75 + .25 * imf : .75 + .25 * imf;
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
    $('gv1').innerHTML = '<bdi>' + fa(sd) + '</bdi> از <bdi>' + fa(N) + '</bdi> سایت' + (phase === 'src' && total() ? ' · <bdi>' + fa(total()) + '</bdi> محصول' : '');
    $('gr2').className = ps.need && il === 0 && ps.have >= ps.need ? 'ok' : '';
    $('gv2').innerHTML = ps.need ? '<bdi>' + fa(ps.have) + '</bdi> از <bdi>' + fa(ps.need) + '</bdi>' + (il > 0 && ps.have > 0 ? ' · <bdi>' + fa(il) + '</bdi> مانده' : '') : phase === 'src' ? 'بعد از فهرست' : '—';
    var bk = phase === 'fail' ? (list.length ? 'f2' : 'f1') : '';
    if (o._bk !== bk) {                   // دکمه‌ها فقط وقتی حالت عوض شد
      o._bk = bk;
      $('gbt').innerHTML = bk ? '<button id="retry">تلاش دوباره</button>' + (bk === 'f2' ? '<button id="goon" class="gh2">ادامه با اطلاعات فعلی</button>' : '') : '';
      var rb = $('retry'); if (rb) rb.onclick = function () { refresh(true); };
      var gb = $('goon'); if (gb) gb.onclick = function () { db.ready = true; saveDb(); enter(); histTake(); };
    }
    return;
  }
  if (ALLB.length && !TREE.length) { o._h = ''; o._g = 0; o.innerHTML = '<div><b>همه‌ی برندها خاموش‌اند</b>از تنظیمات (چرخ‌دنده) برندها را روشن کنید.</div>'; return; }
  o._h = ''; o._g = 0; o.innerHTML = '<div><b>قیمتی دریافت نشد</b>اینترنت را بررسی کنید و دوباره تلاش کنید.<br><button id="retry">تلاش دوباره</button></div>';
  var b2 = $('retry'); if (b2) b2.onclick = function () { refresh(true); };
}
function toast(msg, ms) {
  var t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, ms || 3200);
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
    Core.histSnap(hist, FLAT, order().join(','), now, function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); }, set.block.join(','));
    if (!ls.set('pp.hist', hist)) {
      Object.keys(hist.d).forEach(function (k) { var e = hist.d[k]; if (e.p && e.p.length > 2) e.p = [e.p[0], e.p[e.p.length - 1]]; });
      if (!ls.set('pp.hist', hist)) { hist = Core.histNew(); ls.set('pp.hist', hist); }
    }
    if (mkOn) { var sc = $('mkr').scrollTop; mkRender(); $('mkr').scrollTop = sc; }
  } catch (e) { console.error(e); }
}
var mkTab = 'sum', mkMore = {};
function dayT(d) { return d < 1 ? 'امروز' : fa(d) + ' روز پیش'; }
function srcName(id) { var r = ''; Core.SOURCES.forEach(function (s) { if (s.id === id) r = s.name; }); return r || id; }
function spark(pts) {                                    // نمودارِ کوچکِ تغییر قیمت
  if (!pts || pts.length < 2) return '';
  var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), w = 56, h = 18, d = (mx - mn) || 1;
  var xy = pts.map(function (v, i) { return (i * (w - 4) / (pts.length - 1) + 2).toFixed(1) + ',' + (h - 2 - ((v - mn) / d) * (h - 4)).toFixed(1); }).join(' ');
  return '<svg class="spk" width="56" height="18" viewBox="0 0 56 18" aria-hidden="true"><polyline points="' + xy + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
function mkRow(r, val, sub, spk) {
  var m = VM[r.gid], a = VA[r.gid], lab = [a && a.bn, r.l, fa(r.ml) + ' میل'].filter(Boolean).join(' · ');
  var st = (r.stores && r.stores.length) ? 'فروشگاه‌ها: ' + r.stores.map(srcName).join('، ') : '';
  return '<button type="button" class="mkr" ' + (m ? 'data-m="' + esc(m) + '"' : 'data-q="' + esc(r.name) + '"') + '><div class="mi"><b>' + esc(r.name) + '</b><small>' + esc(lab) + '</small>' + (sub ? '<small>' + sub + '</small>' : '') + (st ? '<small>' + esc(st) + '</small>' : '') + '</div><div class="mv ' + val[0] + '"><b>' + val[1] + '</b>' + (val[2] ? '<small>' + val[2] + '</small>' : '') + (spk ? spk : '') + '</div></button>';
}
function mkInfo(title, body) { return '<div class="mks">' + title + '</div><div class="mkh">' + body + '</div>'; }
function mkSec(id, title, hint, rows, cap0) {
  var base = cap0 || 10, cap = mkMore[id] ? base * 5 : base, shown = rows.slice(0, cap), more = rows.length - shown.length;
  return '<div class="mks">' + title + (rows.length ? ' <span class="mkn">(' + fa(rows.length) + ' مورد)</span>' : '') + '</div><div class="mkh">' + hint + '</div>'
    + (rows.length ? shown.join('') + (more > 0 ? '<button type="button" class="mkmore" data-s="' + id + '">نمایش بیشتر (' + fa(Math.min(more, base * 4)) + ' مورد دیگر)</button>' : '') : '<div class="mkn">موردی نیست.</div>');
}
var mkCmp = { sort: 'd', gn: '' }, mkBr = { sort: 'n' };
function fa1(x) { return (Math.round(x * 10) / 10).toString().replace('.', '٫').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function tmM(n) { return n >= 1e6 ? fa1(n / 1e6) + ' میلیون' : fa(n); }                 // ۱۰٫۹ میلیون
function mkChips(key, st, opts) {
  return '<div class="srchips mkch">' + opts.map(function (o) { return '<button type="button" data-k="' + key + '" data-v="' + o[0] + '"' + (st[key] === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div>';
}
var TIER_L = ['زیر ۲ میلیون', '۲ تا ۴ میلیون', '۴ تا ۶ میلیون', '۶ تا ۹ میلیون', '۹ تا ۱۴ میلیون', 'بالای ۱۴ میلیون'];
function mkView() {
  var vis = function (g) { var a = VA[g.id]; return !(a && (set.hide[a.m] || (set.off || {})[a.b])); };
  var lab = function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); };
  var key = FLAT.length + ':' + treeStamp + ':' + Object.keys(set.hide).length + ':' + Object.keys(set.off || {}).length;
  if (mkView.k === key && mkView.v) return mkView.v;
  var V = Core.marketView(FLAT.filter(vis), { lab: lab, brand: function (gid) { var a = VA[gid]; return a ? { id: a.b, name: a.bn } : null; } });
  mkView.k = key; mkView.v = V; return V;
}
function mkRender() {
  var tm = function (n) { return fa(n) + ' تومان'; }, pct = function (x) { return fa(Math.abs(x) * 100) + '٪'; };
  var vis = function (r) { var a = VA[r.gid]; return !(a && (set.hide[a.m] || (set.off || {})[a.b])); };      // پنهان‌شده‌ها و برندهای خاموش در گزارش نیایند
  Array.prototype.forEach.call($('mkt2').children, function (b) { b.classList.toggle('on', b.dataset.t === mkTab); });
  var h = '', V = mkView(), sc = mkTab === 'sum' || mkTab === 'chg';
  var R = sc ? Core.histReport(hist, FLAT, Date.now(), { thr: 0.08, lab: function (g) { return [GN[g.gn], g.conc].filter(Boolean).join(' · '); } }) : null;
  if (R) ['up', 'down', 'gone', 'back', 'low', 'fresh'].forEach(function (k) { R[k] = R[k].filter(vis); });
  var dealRow = function (r) {
    return mkRow(r, ['gn', pct(r.pct) + ' اختلاف', tm(r.d) + ' فرق'], 'ارزان‌تر: ' + esc(srcName(r.loS)) + '، ' + tm(r.lo) + '<br>گران‌تر: ' + esc(srcName(r.hiS)) + '، ' + tm(r.hi));
  };
  if (mkTab === 'sum') {
    var MS = Core.marketStats(FLAT.filter(function (g) { return vis({ gid: g.id }); })), lo = lastOk(), span = R.span;
    h += '<div class="mkg"><div class="mkk"><b>' + fa(V.nPerf) + '</b><small>عطر</small></div><div class="mkk"><b>' + fa(TREE.length) + '</b><small>برند</small></div><div class="mkk"><b>' + fa(MS.multi) + '</b><small>اندازه در چند فروشگاه</small></div>'
      + '<div class="mkk"><b>' + (V.med100 ? tmM(V.med100) : '—') + '</b><small>میانهٔ قیمت ۱۰۰ میل</small></div><div class="mkk"><b>' + fa(V.nDeals) + '</b><small>عطر با اختلاف قیمت</small></div><div class="mkk"><b>' + (lo ? esc(agoText(Date.now() - lo)) : '—') + '</b><small>آخرین بروزرسانی</small></div></div>';
    /* نتیجه‌گیری‌های آماده: بدون نیاز به تاریخچه */
    var best = null, worst = null;
    Object.keys(MS.bySrc).forEach(function (id) { var s = MS.bySrc[id]; if (s.shared < 5) return; if (!best || s.avg < MS.bySrc[best].avg) best = id; if (!worst || s.avg > MS.bySrc[worst].avg) worst = id; });
    var ins = [];
    if (best && worst && best !== worst) ins.push('<b>' + esc(srcName(best)) + '</b> در عطرهای مشترک معمولاً ارزان‌ترین است (' + pct(MS.bySrc[best].avg - 1) + ' زیر میانهٔ بازار)؛ <b>' + esc(srcName(worst)) + '</b> معمولاً گران‌تر است (' + pct(MS.bySrc[worst].avg - 1) + ' بالاتر).');
    if (V.nDeals) ins.push('در <b>' + fa(V.nDeals) + '</b> عطر، فروشگاه‌ها بیش از ۵٪ با هم اختلاف دارند. اگر همه را از ارزان‌ترین فروشگاه بخرید، در مجموع <b>' + tm(V.save) + '</b> صرفه‌جویی می‌شود.');
    var bs = V.brands.filter(function (b) { return b.n >= 3; }).sort(function (a, b) { return b.med - a.med; });
    if (bs.length >= 2) ins.push('گران‌ترین برند (میانهٔ ۱۰۰ میل): <b>' + esc(bs[0].name) + '</b> با ' + tmM(bs[0].med) + ' تومان؛ ارزان‌ترین: <b>' + esc(bs[bs.length - 1].name) + '</b> با ' + tmM(bs[bs.length - 1].med) + ' تومان.');
    if (V.top[0]) ins.push('گران‌ترین عطر ۱۰۰ میلی: <b>' + esc(V.top[0].name) + '</b> (' + tmM(V.top[0].price) + ' تومان)؛ ارزان‌ترین: <b>' + esc(V.low[0].name) + '</b> (' + tmM(V.low[0].price) + ' تومان).');
    if (ins.length) h += mkInfo('خلاصهٔ بازار', ins.map(function (t) { return '• ' + t; }).join('<br>'));
    var rowsS = Object.keys(MS.bySrc).sort(function (a, b) { return MS.bySrc[b].n - MS.bySrc[a].n; }).map(function (id) {
      var s = MS.bySrc[id], line1 = fa(s.n) + ' اندازه‌ی عطر دارد', line2 = '', cls = 'gn', val = '—';
      if (s.shared >= 5) {
        var d = s.avg - 1; val = (Math.abs(d) < 0.01 ? 'هم‌سطح' : pct(d) + (d > 0 ? ' گران‌تر' : ' ارزان‌تر')); cls = d > 0.01 ? 'up' : d < -0.01 ? 'dn' : 'gn';
        line2 = 'ارزان‌ترین بوده در ' + fa(s.cheapest) + ' مورد از ' + fa(s.shared) + ' موردِ مشترک با فروشگاه‌های دیگر';
      } else line2 = 'موردِ مشترکِ کافی برای مقایسه ندارد';
      return '<div class="mkr nl"><div class="mi"><b>' + esc(srcName(id)) + '</b><small>' + line1 + '</small><small>' + line2 + '</small></div><div class="mv ' + cls + '"><b>' + val + '</b><small>نسبت به میانهٔ بازار</small></div></div>';
    });
    h += mkInfo('فروشگاه‌ها با هم', 'قیمتِ هر فروشگاه در عطرهایی که چند فروشگاه دارند با میانهٔ بازار مقایسه شده است. فروشگاهی که معمولاً «ارزان‌تر» است جای خوبی برای خرید است.') + (rowsS.join('') || '<div class="mkn">هنوز داده‌ی کافی نیست.</div>');
    var mx = Math.max.apply(null, V.tiers.concat([1])), tot = V.tiers.reduce(function (a, b) { return a + b; }, 0);
    if (tot) h += mkInfo('قیمت‌ها چقدر پراکنده‌اند؟', 'تعداد عطرهای ۱۰۰ میلی در هر بازهٔ قیمت (تومان).') + V.tiers.map(function (n, i) {
      return '<div class="mkbar"><span>' + TIER_L[i] + '</span><i style="width:' + Math.max(n ? 3 : 0, Math.round(n / mx * 100)) + '%"></i><b>' + fa(n) + '</b></div>';
    }).join('');
    var dl = V.deals.slice().sort(function (a, b) { return b.d - a.d; }).slice(0, 5);
    if (dl.length) h += mkInfo('بهترین فرصت‌های خرید', 'بیشترین صرفه‌جویی (به تومان) با خرید از ارزان‌ترین فروشگاه. قبل از خرید، قیمت را خودتان هم چک کنید.') + dl.map(dealRow).join('')
      + '<button type="button" class="mkmore" data-go="cmp">دیدن همهٔ مقایسه‌ها</button>';
    var T = R.trend;
    h += mkInfo('روند قیمت‌ها', T.n >= 5
      ? 'از ' + fa(T.n) + ' عطری که تاریخچه دارد: <b>' + fa(T.up) + '</b> گران‌تر شده، <b>' + fa(T.down) + '</b> ارزان‌تر شده و <b>' + fa(T.same) + '</b> تقریباً ثابت مانده است. میانهٔ تغییر: <b>' + (T.med > 0.0005 ? pct(T.med) + ' گران‌تر' : T.med < -0.0005 ? pct(T.med) + ' ارزان‌تر' : 'تقریباً بدون تغییر') + '</b>.'
      : 'تاریخچه ' + (span < 1 ? 'از همین امروز' : 'از ' + fa(span) + ' روز پیش') + ' ثبت می‌شود. بعد از چند روز اینجا می‌نویسد بازار گران می‌شود یا ارزان؛ و تب «تغییرات» پر می‌شود.');
  } else if (mkTab === 'cmp') {
    var rows = V.deals.filter(function (r) { return !mkCmp.gn || r.gn === mkCmp.gn; });
    rows.sort(mkCmp.sort === 'p' ? function (a, b) { return b.pct - a.pct; } : function (a, b) { return b.d - a.d; });
    h += mkChips('sort', mkCmp, [['d', 'بیشترین صرفه'], ['p', 'بیشترین درصد']]) + mkChips('gn', mkCmp, [['', 'همه'], ['m', 'مردانه'], ['w', 'زنانه'], ['u', 'یونیسکس']]);
    h += mkSec('cmp', 'مقایسهٔ فروشگاه‌ها', 'همان عطر و همان اندازه که چند فروشگاه دارند و قیمت‌شان دست‌کم ۵٪ فرق دارد. ممکن است یکی از قیمت‌ها اشتباه باشد؛ قبل از خرید چک کنید.', rows.map(dealRow), 30);
  } else if (mkTab === 'brand') {
    var bl = V.brands.filter(function (b) { return b.n >= 2; });
    bl.sort(mkBr.sort === 'hi' ? function (a, b) { return b.med - a.med; } : mkBr.sort === 'lo' ? function (a, b) { return a.med - b.med; } : function (a, b) { return b.n - a.n; });
    h += mkChips('sort', mkBr, [['n', 'بیشترین عطر'], ['hi', 'گران‌ترین'], ['lo', 'ارزان‌ترین']]);
    h += mkSec('brand', 'سطح قیمتِ برندها', 'قیمتِ «میانه» یعنی نیمی از عطرهای برند ارزان‌تر و نیمی گران‌تر از آن است؛ برای مقایسهٔ عادلانه همه به ۱۰۰ میل رسانده شده.',
      bl.map(function (b) {
        var br = BR_BY[b.id], sub = b.lo && b.hi && b.lo.gid !== b.hi.gid ? 'ارزان‌ترین: ' + esc(b.lo.name) + ' (' + tmM(b.lo.ppm) + ')<br>گران‌ترین: ' + esc(b.hi.name) + ' (' + tmM(b.hi.ppm) + ')' : '';
        return '<button type="button" class="mkr' + (br ? '" data-b="' + esc(b.id) : ' nl') + '"><div class="mi"><b>' + esc(b.name) + '</b><small>' + fa(b.n) + ' عطر</small>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="mv gn"><b>' + tmM(b.med) + '</b><small>تومان، میانهٔ ۱۰۰ میل</small></div></button>';
      }), 15);
  } else {
    h += '<div class="mkh">' + (R.span < 1 ? 'ثبت تاریخچه از همین امروز شروع شده است؛ بعد از چند روز این صفحه پر می‌شود.' : 'تاریخچه ' + fa(R.span) + ' روز است ثبت می‌شود.') + '</div>';
    h += mkSec('up', 'گران شده‌اند', 'قیمت در ۳۰ روز اخیر دست‌کم ۸٪ بالا رفته. اگر از این‌ها دارید، احتمالاً می‌توانید گران‌تر بفروشید؛ اگر ندارید، زودتر بخرید.',
      R.up.map(function (r) { return mkRow(r, ['up', pct(r.pct) + ' گران‌تر', tm(r.to - r.from) + ' بیشتر'], 'قبلاً ' + tm(r.from) + '، الان ' + tm(r.to) + '<br>' + dayT(r.ago) + ' شروع شد', spark(r.pts)); }));
    h += mkSec('down', 'ارزان شده‌اند', 'قیمت در ۳۰ روز اخیر دست‌کم ۸٪ پایین آمده. زمان خوبی برای خرید است.',
      R.down.map(function (r) { return mkRow(r, ['dn', pct(r.pct) + ' ارزان‌تر', tm(r.from - r.to) + ' کمتر'], 'قبلاً ' + tm(r.from) + '، الان ' + tm(r.to) + '<br>' + dayT(r.ago) + ' شروع شد', spark(r.pts)); }));
    h += mkSec('gone', 'ناموجود شده‌اند', 'این اندازه الان در هیچ‌کدام از فروشگاه‌ها دیده نمی‌شود. اگر مشتری خواست، زودتر تهیه کنید.',
      R.gone.map(function (r) { return mkRow(r, ['up', 'ناموجود', dayT(r.ago)], (r.price ? 'آخرین قیمت: ' + tm(r.price) : '') + (r.was ? '<br>قبلاً در ' + fa(r.was) + ' فروشگاه بود' : '')); }));
    h += mkSec('back', 'دوباره موجود شده‌اند', 'مدتی نبودند و در دو هفته‌ی اخیر دوباره پیدا شدند.',
      R.back.map(function (r) { return mkRow(r, ['dn', 'دوباره موجود', dayT(r.ago)], 'قیمت: ' + tm(r.price)); }));
    h += mkSec('low', 'موجودی کم شده', 'تعداد فروشگاه‌هایی که این را دارند کمتر شده؛ یعنی دارد کم‌یاب می‌شود.',
      R.low.map(function (r) { return mkRow(r, ['gn', 'کم‌یاب', 'در ' + fa(r.now) + ' فروشگاه'], 'قبلاً در ' + fa(r.was) + ' فروشگاه بود، قیمت: ' + tm(r.price)); }));
    h += mkSec('fresh', 'تازه‌های بازار', 'در هفته‌ی اخیر برای اولین بار در فروشگاه‌ها دیده شده‌اند.',
      R.fresh.map(function (r) { return mkRow(r, ['dn', 'تازه', dayT(r.ago)], 'قیمت: ' + tm(r.price)); }));
  }
  $('mkr').innerHTML = h;
}
function openReport() {
  try { mkRender(); } catch (e) { console.error(e); toast('گزارش ساخته نشد', 3000); return; }      // تاریخچه‌ی سالم هرگز به‌خاطر یک خطا پاک نمی‌شود (داده‌ی خراب هنگام خواندن اصلاح می‌شود)
  mkOn = true; closeSearch(); if (open) closeSheet(); $('mk').classList.add('on'); $('mkr').scrollTop = 0;
}
function closeReport() { mkOn = false; $('mk').classList.remove('on'); }
$('mkOpen').onclick = openReport; $('sMk').onclick = openReport; $('mkx').onclick = closeReport;
$('mkt2').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !b.dataset.t) return; mkTab = b.dataset.t; try { mkRender(); } catch (e2) { console.error(e2); } $('mkr').scrollTop = 0; });
$('mkr').addEventListener('click', function (e) {
  var ch = e.target.closest('.mkch button'); if (ch) { (mkTab === 'brand' ? mkBr : mkCmp)[ch.dataset.k] = ch.dataset.v; mkRender(); return; }
  var go = e.target.closest('button[data-go]'); if (go) { mkTab = go.dataset.go; mkRender(); $('mkr').scrollTop = 0; return; }
  var bb = e.target.closest('button.mkr[data-b]'); if (bb) { var bid = bb.dataset.b; closeReport(); if (BR_BY[bid]) openEntry(bid); return; }
  var mo = e.target.closest('button.mkmore[data-s]'); if (mo) { mkMore[mo.dataset.s] = 1; var sc = $('mkr').scrollTop; mkRender(); $('mkr').scrollTop = sc; return; }
  var b = e.target.closest('button.mkr'); if (!b) return;
  if (b.dataset.m && MD_BY[b.dataset.m]) { closeReport(); openDetail(b.dataset.m); return; }
  if (b.dataset.q) { closeReport(); openSearch(); $('srq').value = b.dataset.q; srRender(); }      // عطری که صفحه‌ی مستقیم ندارد (مثلاً ناموجود شده): جستجو با نامش
});
/* فهرستِ نمایشی را از حافظه می‌سازد؛ اگر فقط قیمت‌ها عوض شده باشد، همان صفحه سر جایش می‌ماند و فقط صفحه‌ی جزئیات (اگر باز است) بروز می‌شود */
/* «مهرِ داده»: اگر هیچ قیمت/زمان/گروهی عوض نشده باشد، درخت دوباره ساخته نمی‌شود (ساختنش روی گوشی چند ثانیه است) و از فایلِ ذخیره‌شده خوانده می‌شود */
function dataStamp(lang) {
  var now = Date.now(), p = [VERSION, lang, Object.keys(db.g).length, Object.keys(db.wd || {}).length, db.dv | 0];
  order().forEach(function (s) {
    var m = db.it[s] || {}, n = 0, a = 0, b = 0, c = 0;
    for (var k in m) { var e = m[k]; n++; a += e[1] | 0; b += e[4] | 0; c += e[2] ? e[2].charCodeAt(e[2].length - 1) + e[2].length : 0; }
    p.push(s + ':' + (db.t[s] | 0) + ':' + n + ':' + a + ':' + b + ':' + c + ':' + ((db.t[s] && now - db.t[s] <= 12 * 3600e3) ? 1 : 0));
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
function checkReady() {
  if (db.ready || busy) return;
  if (imgLeft() > 0) { overlay(); return; }
  if (srcDone() < actv().length && !gateRetried) { gateRetried = 1; overlay(); setTimeout(function () { refresh(false); }, 2500); return; }   // سایتِ ناموفق یک‌بار دیگر امتحان می‌شود؛ بعد هر سایتی که در دسترس بود کافی است
  if (srcDone() < 1 || !list.length) { overlay(); return; }
  db.ready = true; saveDb(); enter(); histTake();
}

/* ---- رفتن بین سطح‌ها ---- */
var swapping = false;
function swap(anchor) {
  var st = $('stage'); st.classList.add('out'); swapping = true;
  setTimeout(function () { swapping = false; setEntries(); mountModel(anchor); navUi(); st.classList.remove('out'); }, RM ? 0 : 140);
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
function navUi() { var b = $('bk'); if (b) b.classList.toggle('on', nav.lvl === 1 && !!db.ready); var q = $('sr'); if (q) q.style.display = db.ready && !(nav.lvl === 1) ? '' : 'none'; }
$('bk').onclick = function () { goUp(); };
$('stage').addEventListener('click', function (e) {
  var h = e.target.closest && e.target.closest('.rw,.pn'); if (!h || !h.dataset.id) return;
  if (e.target.closest('.tile')) viewImg(h.dataset.id); else openEntry(h.dataset.id);
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
var hideArm = 0;
function dact(id) {
  var fv = !!set.fav[id], armed = hideArm && Date.now() - hideArm < 5000;
  return '<div class="dact"><button type="button" class="' + (fv ? 'on' : '') + '" data-a="fav">' + (fv ? '★ در لیست مغازه' : '☆ افزودن به لیست مغازه') + '</button><button type="button" class="warn" data-a="hide">' + (armed ? 'مطمئنید؟ دوباره بزنید' : 'درست نیست؛ پنهانش کن') + '</button></div>';
}
function renderDetail() {
  var m = MD_BY[dtId]; if (!m) return;
  var im = entryImg(dtId);
  var vs = m.variants.map(function (v) {
    var lab = [GN[v.gn], v.conc].filter(Boolean).join(' · ') || 'اندازه‌ها و قیمت‌ها';
    return '<div class="vr g-' + (v.gn || 'x') + '"><div class="vh">' + esc(lab) + '</div>' + v.sizes.map(function (z, zi) {
      var key = v.id + ':' + z.ml, op = szOpen[key] ? ' on' : '';
      return '<div class="sz' + op + '" data-k="' + esc(key) + '"><span class="zm"><bdi>' + fa(z.ml) + '</bdi> میل</span><span class="zp"><b>' + fa(z.price) + '</b><small>تومان</small>' + (z.n < 2 ? '<i title="فقط یک سایت"></i>' : '') + '<em class="cv"></em></span></div>'
        + '<div class="srl' + op + '">' + (z.srcs || []).map(function (q) {
          var u = Core.itemUrl(q.s, q.pid), nmS = srcName(q.s);
          return '<div class="sr' + (q.used ? '' : ' x') + '"><span class="sn">' + esc(nmS) + '</span><span class="sp"><bdi>' + fa(q.price) + '</bdi>' + (q.used ? '' : '<small>در محاسبه نیامد</small>') + '</span>' + (u ? '<button class="go" data-u="' + esc(u) + '">دیدن در سایت</button>' : '') + '</div>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }).join('');
  var keep = $('dtc').scrollTop;
  $('dtc').innerHTML = '<div class="dtop"><div class="dpic" data-vw="1">' + tile({ loc: im.loc, img: im.img, k: im.k }) + '<em>بزرگ‌نمایی</em></div><div class="dti"><div class="dbn">' + esc(BR_BY[m.brandId].name) + '</div><div class="dnm">' + esc(m.name) + '</div></div></div>' + dact(dtId) + vs
    + '<div class="dnote">روی هر اندازه بزنید تا قیمتِ هر سایت و دکمه‌ی دیدن در سایت بیاید. نقطه‌ی کوچک یعنی فقط یک سایت آن را داشته.</div>';
  var nm = $('dtc').querySelector('.dnm'); fitLines(nm, 3, 16);
  $('dtc').scrollTop = keep;
}
function openDetail(id) {
  hideArm = 0;
  dtId = id; renderDetail(); $('dtc').scrollTop = 0;
  dtEl.classList.add('on');
}
function closeDetail() { hideArm = 0; dtId = null; dtEl.classList.remove('on'); }
$('dtx').onclick = closeDetail;
$('dtc').addEventListener('click', function (e) {
  var ab = e.target.closest && e.target.closest('.dact button');
  if (ab && dtId) {
    var m0 = MD_BY[dtId];
    if (ab.dataset.a === 'fav') { if (set.fav[dtId]) delete set.fav[dtId]; else set.fav[dtId] = BR_BY[m0.brandId].name + ' | ' + m0.name; ls.set('pp.set', set); hideArm = 0; renderDetail(); }
    else if (ab.dataset.a === 'hide') {
      if (hideArm && Date.now() - hideArm > 500 && Date.now() - hideArm < 5000) { set.hide[dtId] = BR_BY[m0.brandId].name + ' | ' + m0.name; hideArm = 0; ls.set('pp.set', set); closeDetail(); rebuild(); renderSheet(); toast('پنهان شد. برگرداندن: تنظیمات، «عطرهای پنهان‌شده»', 4000); }
      else { hideArm = Date.now(); renderDetail(); setTimeout(function () { if (dtId) renderDetail(); }, 5100); }
    }
    return;
  }
  if (e.target.closest('.dpic') && dtId) { viewImg(dtId); return; }
  var g = e.target.closest('.go'); if (g) { openLink(g.dataset.u); return; }
  var z = e.target.closest('.sz'); if (z && z.dataset.k) { var on = !z.classList.contains('on'); szOpen[z.dataset.k] = on; z.classList.toggle('on', on); if (z.nextElementSibling) z.nextElementSibling.classList.toggle('on', on); }
});

/* ---- عکس بزرگ ---- */
var vwId = null, vwTok = 0;
function refreshViewer() {}
function viewImg(id) {
  var im = entryImg(id); if (!im) return;
  vwId = id; var tok = ++vwTok, box = $('vwb'), small = im.loc || im.img;
  if (!small && !im.big) box.innerHTML = '<div class="vfb">' + bottle(im.k, false) + '</div>';
  else {
    box.innerHTML = '<img id="vwi" alt="" referrerpolicy="no-referrer" src="' + esc(small || im.big) + '">';
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
  $('vw').classList.add('on');
}
function closeViewer() { vwId = null; vwTok++; $('vw').classList.remove('on'); }
$('vw').onclick = closeViewer;

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
    if (!ok) toast('اینترنت یا سایت‌ها جواب ندادند؛ دوباره امتحان کنید', 4200);
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
  $('sVer').textContent = 'نسخه ' + VERSION;
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
function openSheet() { open = true; if (!window.__forceAdv) $('sAdv').style.display = 'none'; $('sAdvBtn').setAttribute('aria-expanded', 'false'); $('sAdvBtn').firstChild.textContent = 'تنظیمات پیشرفته'; renderSheet(); sheet.scrollTop = 0; sSp.x = sheetY; sSp.to(0, { response: .42, damping: .85 }); }
function closeSheet() { open = false; sSp.x = sheetY; sSp.to(1, { response: .36, damping: 1 }); }
sSp.cb(1);
$('sVer').onclick = function () { if (++advN >= 5 && !adv) { adv = true; renderSheet(); toast('گزینه‌های سازنده نشان داده شد', 2200); } };
$('gear').onclick = openSheet; scm.onclick = closeSheet;
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
$('sUpd').onclick = function () { if ($('sUpd').disabled) return; updSt.dismissed = false; updCheck(true); };
$('updLater').onclick = function () { updSt.dismissed = true; updSt.manual = false; $('updBox').classList.remove('on'); };
$('updGo').onclick = function () {
  if ($('updGo').disabled) return;
  updSt.phase = 'inst'; updSt.installing = true; updRender();
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
  if ($('updBox').classList.contains('on')) { $('updBox').classList.remove('on'); updSt.dismissed = true; return true; }
  if (mkOn) { closeReport(); return true; }
  if (srOn) { closeSearch(); return true; }
  if (vwId) { closeViewer(); return true; }
  if (open) { closeSheet(); return true; }
  if (dtId) { closeDetail(); return true; }
  return goUp();
};

/* ---------- اندازه‌ی نوشته ---------- */
var FS = [1, 1.15, 1.3, 1.5];
function applyFs() { document.documentElement.style.setProperty('--zs', FS[set.fs | 0] || 1); }
/* ---------- جستجو و لیست مغازه ---------- */
var srOn = false, srFavOnly = false, srIdx = [], srSig = '', srT = 0;
function srNorm(x) { return Core.normFa(String(x || '')).toLowerCase().replace(/[^؀-ۿa-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
function srBuild() {
  var sig = TREE.length + ':' + treeStamp + ':' + Object.keys(set.hide).join(',') + ':' + Object.keys(set.off || {}).join(','); if (sig === srSig) return; srSig = sig; srIdx = [];
  var hasFa = function (t) { return /[؀-ۿ]/.test(t); };
  TREE.forEach(function (b) {
    b.models.forEach(function (m) {
      var parts = [b.name, m.name];
      if (hasFa(b.name)) parts.push(Core.fa2en(b.name.split(' '), db.wd));
      m.variants.forEach(function (v) {
        if (v.key) { parts.push(v.key.join(' ')); if (hasFa(v.key.join(' '))) parts.push(Core.fa2en(v.key, db.wd)); }
        if (typeof v.en === 'string') parts.push(v.en);
      });
      srIdx.push({ m: m, b: b, h: ' ' + srNorm(parts.join(' ')) + ' ' });
    });
  });
}
function srMatch(h, toks) {
  return toks.every(function (t) {
    if (h.indexOf(t) >= 0) return true;
    if (/[؀-ۿ]/.test(t)) { var en = srNorm(Core.fa2en([t], db.wd)); if (en && en.length >= 3 && h.indexOf(' ' + en) >= 0) return true; }      // «ساواج» ← sauvage
    return false;
  });
}
function srRender() {
  var q = srNorm($('srq').value), toks = q ? q.split(' ') : [], out = [], box = $('srr'), nf = Object.keys(set.fav).length;
  $('srFc').textContent = nf ? '(' + fa(nf) + ')' : ''; $('srFav').classList.toggle('on', srFavOnly);
  srBuild();
  function row(m, b, gone, id, lab) {
    var fv = !!set.fav[id];
    return '<div class="srr' + (gone ? ' gone' : '') + '"><button type="button" class="sn1" data-id="' + esc(id) + '"' + (gone ? ' disabled' : '') + '><b>' + esc(m) + '</b><small>' + esc(b) + (gone ? ' · الان در سایت‌ها نیست' : '') + '</small></button><button type="button" class="sf" data-f="' + esc(id) + '" aria-label="لیست مغازه">' + (fv ? '★' : '☆') + '</button></div>';
  }
  if (srFavOnly) {
    Object.keys(set.fav).forEach(function (id) {
      var m = MD_BY[id], lab = String(set.fav[id]).split(' | ');
      if (m && (!toks.length || srMatch(' ' + srNorm(BR_BY[m.brandId].name + ' ' + m.name) + ' ', toks))) out.push([BR_BY[m.brandId].name, m.name, row(m.name, BR_BY[m.brandId].name, false, id)]);
      else if (!m && !toks.length) out.push([lab[0] || '', lab[1] || '', row(lab[1] || lab[0], lab[0] || '', true, id)]);
    });
    out.sort(function (a, c) { return (a[0] + a[1]).localeCompare(c[0] + c[1], 'fa'); });
    box.innerHTML = out.length ? out.map(function (x) { return x[2]; }).join('') : '<div class="sremp">لیست مغازه خالی است.<br>در صفحه‌ی هر عطر یا همین‌جا روی ستاره بزنید تا عطرهای مغازه را جدا نگه دارید.</div>';
    return;
  }
  if (!toks.length) { box.innerHTML = '<div class="sremp">نام عطر یا برند را بنویسید؛ فارسی یا انگلیسی.<br>مثلاً «ساواج» یا «sauvage» یا «ورساچه».</div>'; return; }
  srIdx.forEach(function (x) { if (srMatch(x.h, toks)) out.push([x.m.name.toLowerCase().indexOf(toks[0]) === 0 ? 0 : 1, x]); });
  out.sort(function (a, c) { return a[0] - c[0]; });
  var more = out.length > 60; out = out.slice(0, 60);
  box.innerHTML = out.length ? out.map(function (r) { return row(r[1].m.name, r[1].b.name, false, r[1].m.id); }).join('') + (more ? '<div class="sremp">فقط ۶۰ مورد اول نشان داده شد؛ دقیق‌تر بنویسید.</div>' : '')
    : '<div class="sremp">چیزی پیدا نشد.<br>املای دیگری را امتحان کنید یا فقط بخشی از نام را بنویسید.</div>';
}
function openSearch() { srOn = true; $('srch').classList.add('on'); srRender(); setTimeout(function () { try { $('srq').focus(); $('srq').select(); } catch (e) { } }, 60); }
function closeSearch() { srOn = false; $('srch').classList.remove('on'); try { $('srq').blur(); } catch (e) { } }
$('sr').onclick = openSearch; $('srx').onclick = closeSearch;
$('srq').addEventListener('input', function () { clearTimeout(srT); srT = setTimeout(srRender, 120); });
$('srFav').onclick = function () { srFavOnly = !srFavOnly; srRender(); };
$('srr').addEventListener('click', function (e) {
  var f = e.target.closest('button.sf');
  if (f) { var id = f.dataset.f; if (set.fav[id]) delete set.fav[id]; else { var m = MD_BY[id]; if (m) set.fav[id] = BR_BY[m.brandId].name + ' | ' + m.name; } ls.set('pp.set', set); var sc = $('srr').scrollTop; srRender(); $('srr').scrollTop = sc; return; }
  var b = e.target.closest('button.sn1'); if (b && b.dataset.id && MD_BY[b.dataset.id]) { closeSearch(); openDetail(b.dataset.id); }
});
/* ---------- تنظیمات: اندازه‌ی نوشته، واژه‌های ممنوع، عطرهای پنهان ---------- */
function renderMine() {
  Array.prototype.forEach.call($('sFs').children, function (b) { b.classList.toggle('on', +b.dataset.v === (set.fs | 0)); });
  var bl = set.block.map(function (w, i) { return '<button type="button" class="ch" data-i="' + i + '"><bdi>' + esc(w) + '</bdi></button>'; }).join('');
  if ($('bkList')._h !== bl) { $('bkList')._h = bl; $('bkList').innerHTML = bl; }
  var hk = Object.keys(set.hide), hl = hk.map(function (id) { return '<button type="button" class="ch" data-id="' + esc(id) + '"><bdi>' + esc(String(set.hide[id]).replace(' | ', ' ، ')) + '</bdi></button>'; }).join('');
  if ($('hdList')._h !== hl) { $('hdList')._h = hl; $('hdList').innerHTML = hl; }
  $('hdHint').textContent = hk.length ? 'برای برگرداندنِ هر عطر روی نامش بزنید.' : 'عطری پنهان نکرده‌اید. در صفحه‌ی هر عطر دکمه‌ی «درست نیست؛ پنهانش کن» هست.';
}
$('sFs').onclick = function (e) { var b = e.target.closest('button'); if (!b || b.dataset.v == null) return; set.fs = +b.dataset.v; ls.set('pp.set', set); applyFs(); renderMine(); };
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
/* ---------- بروزرسانی خودِ برنامه از گیت‌هاب ---------- */
var updSt = { code: 0, ready: 0, phase: '', pct: null, dismissed: false, checking: false, manual: false }, UPD_EVERY = 3 * 3600000;
function hasN(k) { return !!(window.Native && typeof window.Native[k] === 'function'); }
function updText(t) { var e = $('sUpdT'); if (e) e.textContent = t; }
function updAutoOn() { return set.updAuto !== 0; }
function updCheck(manual) {
  updSt.manual = !!manual;
  if (!hasN('updCheck')) { if (manual) toast('این امکان فقط در برنامه‌ی نصب‌شده کار می‌کند', 3000); return; }
  ls.set('pp.updt', Date.now());
  updSt.checking = true; updRender();
  if (manual) updText('در حال بررسی…');
  try { window.Native.updCheck(); } catch (e) { }
}
function updDue() { return updAutoOn() && hasN('updCheck') && Date.now() - (+ls.get('pp.updt', 0) || 0) > UPD_EVERY; }
/* پنجره‌ی بروزرسانی: سه حالت دارد؛ dl = در حال دانلود (دکمه غیرفعال با درصد)، ready = آماده‌ی نصب، inst = در حال نصب */
function updRender() {
  var ph = updSt.phase, g = $('updGo'), sp = g.querySelector('span'), pb = $('updPb'), bi = $('updPbi'), me = $('sUpd'), ms = me.querySelector('span');
  if (ph === 'dl') {
    var pc = updSt.pct == null ? null : Math.max(0, Math.min(100, Math.round(updSt.pct)));
    $('updTx').textContent = 'نسخه‌ی جدید برنامه پیدا شد و دارد دانلود می‌شود. چند لحظه صبر کنید.';
    g.disabled = true; g.classList.add('busy'); sp.textContent = pc == null ? 'در حال دانلود…' : 'دانلود ' + fa(pc) + '٪';
    pb.style.display = 'block'; bi.style.width = (pc == null ? 8 : pc) + '%';
  } else if (ph === 'inst') {
    $('updTx').textContent = 'در حال نصب… اگر اندروید پرسید، گزینه‌ی بروزرسانی را بزنید.';
    g.disabled = true; g.classList.add('busy'); sp.textContent = 'در حال نصب…'; pb.style.display = 'none';
  } else {
    $('updTx').textContent = 'نسخه‌ی جدید برنامه دانلود شد. الان نصب شود؟ بعد از نصب باید برنامه را دوباره باز کنید.';
    g.disabled = false; g.classList.remove('busy'); sp.textContent = 'بله، نصب شود'; pb.style.display = 'none';
  }
  var wk = ph === 'dl' || ph === 'inst' || updSt.checking;
  me.disabled = wk; me.classList.toggle('busy', wk);
  ms.textContent = ph === 'dl' ? 'در حال دانلود…' : ph === 'inst' ? 'در حال نصب…' : updSt.checking ? 'در حال بررسی…' : 'بررسی نسخه‌ی جدید';
  if (ph && (!updSt.dismissed || updSt.manual)) $('updBox').classList.add('on'); else $('updBox').classList.remove('on');
}
function showUpd() { updSt.phase = 'ready'; updRender(); }
window.__updInfo = function (code) {
  updSt.checking = false;
  var cur = hasN('appCode') ? +window.Native.appCode() : 0;
  if (code > cur) {
    updSt.code = code;
    if (updSt.ready === code) { showUpd(); return; }
    updText('نسخه‌ی تازه پیدا شد؛ در حال دانلود…');
    updSt.phase = 'dl'; updSt.pct = null; updRender();
    try { window.Native.updDownload(); } catch (e) { }
  } else {
    updText('برنامه‌ی شما آخرین نسخه است'); updRender();
    if (updSt.manual) toast('آخرین نسخه را دارید', 2500);
  }
};
window.__updProg = function (p) { if (updSt.phase === 'dl') { updSt.pct = +p; updRender(); } };
window.__updReady = function (code) { updSt.ready = code; updText('نسخه‌ی تازه آماده‌ی نصب است'); showUpd(); };
window.__updErr = function (m) {
  var was = updSt.phase;
  updSt.phase = ''; updSt.checking = false; updSt.installing = false; updRender();
  updText('بروزرسانیِ برنامه انجام نشد؛ بعداً دوباره امتحان کنید');
  if (updSt.manual || was) toast('بروزرسانیِ برنامه انجام نشد', 3500);
};
function autoMs() { var m = +set.auto; return m > 0 ? m * 60000 : 0; }      // ۰ = دستی (پیش‌فرض)
function autoDue() { var lo = lastOk(); if (!lo) return true; var a = autoMs(); return a > 0 && Date.now() - lo > a; }
var lastTry = +ls.get('pp.try', 0) || 0;       // آخرین تلاشِ بروزرسانی (ماندگار)؛ سایتِ همیشه‌خراب هر بار باز شدن را به بمباران تبدیل نکند
function launchDue() { return !busy && needFresh() && Date.now() - lastTry > 1800000; }      // قیمت‌ها قدیمی‌اند یا سایتی هنوز نیامده: حتی در حالت دستی یک بار تازه شود
window.__resume = function () { updPill(); if (updDue()) updCheck(false); if (!busy && (autoDue() || launchDue())) refresh(false); };
document.addEventListener('visibilitychange', function () { if (!document.hidden) window.__resume(); });
window.addEventListener('beforeunload', function () { if (curModel && nav.lvl === 0) { var a = curModel.getAnchor(); if (a) ls.set('pp.last', a); } });
window.__pp = { get allBrands() { return ALLB; }, open: openEntry, up: goUp, view: viewImg, closeView: closeViewer, get nav() { return nav; }, get tree() { return TREE; }, get gate() { var ps = photoStat(); return { need: ps.need, have: ps.have, ready: !!db.ready, tot: imgTot, left: imgLeft(), ok: imgOk, bad: imgBad }; }, mount: function (m) { var t = performance.now(); set.model = m; mountModel(curModel ? curModel.getAnchor() : null); return performance.now() - t; }, get model() { return curModel; }, get list() { return list; }, get flat() { return FLAT; }, get state() { return { db: db, st: stt, busy: busy, imgLoc: imgLoc }; }, refresh: refresh, net: net };

/* شروع */
applyTheme(); applyFs();
loadImgs();
try { rebuild(); } catch (e) { console.error(e); }
updPill(); overlay(); renderSheet();
if (autoDue() || launchDue()) refresh(false);
setTimeout(function () { if (updAutoOn() && hasN('updCheck')) updCheck(false); }, 1500);      // هر بار که برنامه باز می‌شود نسخه‌ی تازه را می‌پرسد
setInterval(function () { updPill(); if (!busy && autoDue()) refresh(false); }, 30000);
/* قفل ورود: اگر دانلود گیر کرد خودش دوباره تلاش کند؛ عکسی که جواب نداد جلوی ورود را نگیرد */
setInterval(function () {
  if (db.ready) return;
  if (!busy && imgLeft() > 0 && Date.now() - imgLastT > 40000) { imgBad += imgLeft(); imgPend = {}; checkReady(); }
  else if (!busy && imgLeft() === 0 && srcDone() < actv().length && Date.now() - lastTried > 45000) refresh(false);
}, 5000);
})();
