(function () {
'use strict';
var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var VERSION = '1.8';
function $(id) { return document.getElementById(id); }
function fa(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function mix(hex, t) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function m(c) { return Math.round(c + (255 - c) * t); } return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')'; }
var ls = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
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
  var p = pend[id]; if (!p) return; delete pend[id]; clearTimeout(p.t);
  var le = { u: p.u, s: status, b: String(body || '').slice(0, 300) };
  netLog.push(le); if (netLog.length > 6) netLog.shift();
  if (status !== 200) { netBad.push(le); if (netBad.length > 12) netBad.shift(); }
  if (status === 0) p.rej(new Error(String(body || 'اینترنت وصل نیست')));
  else p.res({ status: status, body: body });
};
var net = {
  get: function (url, headers) {
    return new Promise(function (res, rej) {
      if (window.Native && window.Native.fetch) {
        var id = 'r' + (++seq);
        pend[id] = { res: res, rej: rej, u: url, t: setTimeout(function () { delete pend[id]; rej(new Error('زمان انتظار تمام شد')); }, 30000) };
        window.Native.fetch(id, url, JSON.stringify(headers || {}));
      } else {
        fetch(url, { headers: headers }).then(function (r) { return r.text().then(function (b) { var le = { u: url, s: r.status, b: b.slice(0, 300) }; netLog.push(le); if (netLog.length > 6) netLog.shift(); if (r.status !== 200) { netBad.push(le); if (netBad.length > 12) netBad.shift(); } res({ status: r.status, body: b }); }); }).catch(rej);
      }
    });
  }
};

/* ================= وضعیت برنامه ================= */
var set = ls.get('pp.set', { theme: 'auto', model: 'a' });
if (!MODELS[set.model]) set.model = 'a';
var db = ls.get('pp.db', null);
if (!db || db.v !== 3 || db.fv !== 5 || !db.g || !db.it) db = Core.newDb();   // نسخه‌ی ۱.۳ همه چیز را یک‌بار از نو و کامل می‌گیرد
db.fv = 5;
db.full = db.full || {}; db.t = db.t || {}; db.fa = db.fa || {}; db.sc = db.sc || {};
try { localStorage.removeItem('pp.raw'); } catch (e) {}
var idx = Core.dbIndex(db);
var stt = ls.get('pp.st', {}), prog = {}, busy = false, curModel = null, list = [], struct = '', psig = '', mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
var ORDER = Core.SOURCES.map(function (s) { return s.id; }), TRUSTED = {}, imgLoc = {}, imgAsked = {};
Core.SOURCES.forEach(function (s) { if (s.trusted) TRUSTED[s.id] = true; });
var hiddenN = 0, TREE = [], BR_BY = {}, MD_BY = {}, nav = { lvl: 0, brand: null }, imgPend = {}, imgTot = 0, imgOk = 0, imgBad = 0, imgLastT = 0, startAnchor = ls.get('pp.last', null), lastTried = 0, prevP = null, FLAT = [], ALLB = [], gateRetried = 0;
var FULL_EVERY = 3 * 86400e3;
function friendly(m) {
  m = String(m || '');
  if (/UnknownHost|resolve host/i.test(m)) return 'سایت پیدا نشد (اینترنت یا DNS)';
  if (/timeout|timed out|زمان انتظار/i.test(m)) return 'سایت دیر جواب داد';
  if (/ConnectException|Unreachable|refused|SSL|Handshake/i.test(m)) return 'اتصال به سایت برقرار نشد';
  if (/Too many follow-up/i.test(m)) return 'سایت درخواست را در چرخه انداخت';
  return m;
}
function saveDb() { ls.set('pp.db', db); ls.set('pp.st', stt); }

function applyTheme() {
  var t = set.theme === 'auto' ? (mq && mq.matches === false ? 'light' : 'dark') : set.theme;
  document.documentElement.setAttribute('data-th', t);
  var bg = t === 'light' ? '#eef1fb' : '#0c0f1f';
  if (window.Native && window.Native.setBars) try { window.Native.setBars(bg, t === 'light'); } catch (e) {}
  if (curModel && curModel.theme) curModel.theme();
}
if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (set.theme === 'auto') applyTheme(); });

function lastOk() { var m = 0; Object.keys(db.t).forEach(function (k) { if (db.t[k] > m) m = db.t[k]; }); return m; }
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
  var age = Date.now() - lo;
  if (age > 40 * 60000) { u.classList.add('stale'); t.textContent = 'قیمت‌ها قدیمی‌اند · ' + agoText(age); }
  else t.textContent = 'آخرین بروزرسانی ' + agoText(age);
}
function srcDone() { return Core.SOURCES.filter(function (s) { return stt[s.id] && stt[s.id].ok; }).length; }   // سایت‌هایی که اطلاعاتشان آمده
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
    var N = Core.SOURCES.length, sd = srcDone(), il = imgLeft(), phase = busy ? 'src' : il > 0 ? 'img' : 'fail';
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
      var gb = $('goon'); if (gb) gb.onclick = function () { db.ready = true; saveDb(); enter(); };
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
/* فهرستِ نمایشی را از حافظه می‌سازد؛ اگر فقط قیمت‌ها عوض شده باشد، همان صفحه سر جایش می‌ماند و فقط صفحه‌ی جزئیات (اگر باز است) بروز می‌شود */
function rebuild() {
  var l = Core.buildList(db, ORDER, TRUSTED, 12 * 3600e3);
  hiddenN = l.hidden || 0; FLAT = l;
  ALLB = Core.tree(l, set.lang === 'en' ? 'en' : 'fa', db.wd); set.off = set.off || {};
  TREE = ALLB.filter(function (b) { return !set.off[b.id]; }); BR_BY = {}; MD_BY = {};
  TREE.forEach(function (b) { BR_BY[b.id] = b; b.models.forEach(function (m) { m.brandId = b.id; MD_BY[m.id] = m; }); });
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
  if (srcDone() < Core.SOURCES.length && !gateRetried) { gateRetried = 1; overlay(); setTimeout(function () { refresh(false); }, 2500); return; }   // سایتِ ناموفق یک‌بار دیگر امتحان می‌شود؛ بعد هر سایتی که در دسترس بود کافی است
  if (srcDone() < 1 || !list.length) { overlay(); return; }
  db.ready = true; saveDb(); enter();
}

/* ---- رفتن بین سطح‌ها ---- */
function swap(anchor) {
  var st = $('stage'); st.classList.add('out');
  setTimeout(function () { setEntries(); mountModel(anchor); navUi(); st.classList.remove('out'); }, RM ? 0 : 140);
}
function openEntry(id) {
  if (BR_BY[id]) { nav.lvl = 1; nav.brand = id; ls.set('pp.last', id); startAnchor = id; swap(null); }
  else if (MD_BY[id]) openDetail(id);
}
function goUp() {
  if (nav.lvl === 0) return false;
  var b = nav.brand; nav.lvl = 0; nav.brand = null; swap(b); return true;
}
function navUi() { var b = $('bk'); if (b) b.classList.toggle('on', nav.lvl === 1 && !!db.ready); }
$('bk').onclick = function () { goUp(); };
$('stage').addEventListener('click', function (e) {
  var h = e.target.closest && e.target.closest('.rw,.pn'); if (!h || !h.dataset.id) return;
  if (e.target.closest('.tile')) viewImg(h.dataset.id); else openEntry(h.dataset.id);
});

/* ---- صفحه‌ی جزئیات: نوع‌ها (مردانه/زنانه) و اندازه‌ها با قیمت ---- */
var dtId = null, dtEl = $('dt');
function entryImg(id) {
  var o = BR_BY[id] || MD_BY[id]; if (!o) return null;
  return { img: o.img, big: o.big || o.img, loc: imgLoc[o.imgId] || '', k: parseInt(String(o.imgId).replace(/^b/, ''), 36) % 64 || 0, name: o.name };
}
function renderDetail() {
  var m = MD_BY[dtId]; if (!m) return;
  var im = entryImg(dtId);
  var vs = m.variants.map(function (v) {
    var lab = [GN[v.gn], v.conc].filter(Boolean).join(' · ') || 'اندازه‌ها و قیمت‌ها';
    return '<div class="vr g-' + (v.gn || 'x') + '"><div class="vh">' + esc(lab) + '</div>' + v.sizes.map(function (z) {
      return '<div class="sz"><span class="zm"><bdi>' + fa(z.ml) + '</bdi> میل</span><span class="zp"><b>' + fa(z.price) + '</b><small>تومان</small>' + (z.n < 2 ? '<i title="فقط یک سایت"></i>' : '') + '</span></div>';
    }).join('') + '</div>';
  }).join('');
  var keep = $('dtc').scrollTop;
  $('dtc').innerHTML = '<div class="dtop"><div class="dpic" data-vw="1">' + tile({ loc: im.loc, img: im.img, k: im.k }) + '<em>بزرگ‌نمایی</em></div><div class="dti"><div class="dbn">' + esc(BR_BY[m.brandId].name) + '</div><div class="dnm">' + esc(m.name) + '</div></div></div>' + vs
    + '<div class="dnote">نقطه‌ی کوچک کنار قیمت یعنی فقط یک سایت آن را داشته.</div>';
  var nm = $('dtc').querySelector('.dnm'); fitLines(nm, 3, 16);
  $('dtc').scrollTop = keep;
}
function openDetail(id) {
  dtId = id; renderDetail(); $('dtc').scrollTop = 0;
  dtEl.classList.add('on');
}
function closeDetail() { dtId = null; dtEl.classList.remove('on'); }
$('dtx').onclick = closeDetail;
$('dtc').addEventListener('click', function (e) { if (e.target.closest('.dpic') && dtId) viewImg(dtId); });

/* ---- عکس بزرگ ---- */
var vwId = null, vwTok = 0;
function refreshViewer() {}
function viewImg(id) {
  var im = entryImg(id); if (!im) return;
  vwId = id; var tok = ++vwTok, box = $('vwb'), small = im.loc || im.img;
  if (!small && !im.big) box.innerHTML = '<div class="vfb">' + bottle(im.k, false) + '</div>';
  else {
    box.innerHTML = '<img id="vwi" alt="" referrerpolicy="no-referrer" src="' + esc(small || im.big) + '">';
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
window.__imgFail = function (id) { if (imgPend[id]) { delete imgPend[id]; imgBad++; } imgSettled(); };
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
  stt[s.id] = { ok: true, n: cnt, t: Date.now(), mode: mode, note: r.note || '', full: !!(db.full[s.id]), added: st.added };
  P.done = true;
}
async function refresh(manual) {
  if (busy) return;
  busy = true; prog = {}; updPill(); overlay(); refBtn(); if (open) renderSheet();
  var ok = 0, bad = 0;
  await Promise.all(Core.SOURCES.map(async function (s) {
    try { await doSource(s); ok++; }
    catch (e) {
      bad++;
      var pv = stt[s.id] || {};
      stt[s.id] = { ok: false, err: friendly(e && e.message || e).slice(0, 200), raw: String(e && e.message || e).slice(0, 200), n: pv.n || 0, t: pv.t || 0, note: pv.note || '' };
      if (prog[s.id]) prog[s.id].done = true;
    }
    saveDb();
    try { if (!list.length) rebuild(); } catch (e2) { stt[s.id].err = 'خطای ادغام: ' + e2.message; }
    tick();
  }));
  var ch = 0;
  try { ch = rebuild(); } catch (e3) { console.error(e3); }
  busy = false; lastTried = Date.now(); saveDb(); updPill(); overlay(); refBtn(); renderSheet();
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
  Array.prototype.forEach.call($('sModel').children, function (b) { b.classList.toggle('on', b.dataset.v === set.model); });
  var bad = false;
  $('sSrc').innerHTML = Core.SOURCES.map(function (s) {
    var x = stt[s.id], txt = '—', cls = '', P = prog[s.id];
    if (busy && P && !P.done) txt = (P.mode === 'full' ? 'دریافت اولیه ' : 'قیمت‌ها ') + '<bdi>' + fa(P.n) + '</bdi>';
    else if (x && x.ok) { txt = fa(x.n) + ' محصول' + (x.note && /ناقص/.test(x.note) ? ' (ناقص)' : ''); }
    else if (x && x.err) { txt = x.err + (x.t ? ' (قیمت قبلی نگه داشته شد)' : ''); cls = 'bad'; bad = true; }
    return '<div class="' + cls + '"><span>' + s.name + '</span><span>' + (busy && P && !P.done ? txt : esc(txt)) + '</span></div>';
  }).join('') + '<div style="border:0;color:var(--mu);font-size:12px;padding-top:8px"><span>نقطه‌ی کوچک کنار قیمت یعنی فقط یک سایت آن را داشته.</span></div>';
  renderReport();
  $('sCopy').style.display = bad || adv ? '' : 'none'; $('sFull').style.display = bad || adv ? '' : 'none';
  $('sVer').textContent = 'نسخه ' + VERSION;
  renderBrands();
  [].forEach.call(document.querySelectorAll('#sLang button'), function (b) { b.classList.toggle('on', b.dataset.l === (set.lang === 'en' ? 'en' : 'fa')); });
}
function clock(t) { if (!t) return '—'; var d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; }; var ago = Math.round((Date.now() - t) / 60000); return (p(d.getHours()) + ':' + p(d.getMinutes())).replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }) + (ago >= 1 ? ' (' + fa(ago < 120 ? ago : Math.round(ago / 60)) + (ago < 120 ? ' دقیقه' : ' ساعت') + ' پیش)' : ' (همین الان)'); }
/* گزارش به‌روز: وضعیت دریافت هر سایت، فهرست، عکس‌ها و نام‌ها؛ تا تنظیمات باز است خودش تازه می‌شود */
function reportData() {
  var ps = photoStat(), nb = TREE.length, nm = 0, nv = 0;
  TREE.forEach(function (b) { nm += b.models.length; b.models.forEach(function (m) { nv += m.variants.length; }); });
  var withEn = 0; FLAT.forEach(function (g) { if (g.en) withEn++; });
  var src = Core.SOURCES.map(function (s) {
    var x = stt[s.id] || {}, P = prog[s.id], fullT = db.full[s.id];
    var st = busy && P && !P.done ? 'در حال دریافت (' + fa(P.n) + ')' : x.ok ? (fullT ? 'کامل' : 'ناقص (دوباره امتحان می‌کند)') : x.err ? 'خطا: ' + x.err : (db.t[s.id] ? 'قدیمی' : 'هنوز نیامده');
    var cnt = 0; Object.keys(db.it[s.id] || {}).forEach(function (k) { var e = db.it[s.id][k]; if (e[2] && e[1] > 0) cnt++; });
    return { name: s.name, st: st, ok: !!x.ok && !!fullT, cnt: cnt, t: db.t[s.id] || 0, note: x.note || '' };
  });
  return { ps: ps, nb: nb, nm: nm, nv: nv, withEn: withEn, all: FLAT.length, src: src };
}
function renderReport() {
  var el = $('sRep'); if (!el) return;
  var r = reportData(), rows = [], allOk = r.src.every(function (x) { return x.ok; }) && r.ps.have >= r.ps.need && !busy;
  function row(a, b, bad) { rows.push('<div' + (bad ? ' class="bad"' : '') + '><span>' + a + '</span><span>' + b + '</span></div>'); }
  row('وضعیت کلی', busy ? 'در حال بروزرسانی…' : allOk ? 'همه‌چیز کامل است' : 'ناقص؛ جزئیات پایین', !busy && !allOk);
  r.src.forEach(function (x) {
    row(esc(x.name), esc(x.st) + ' · <bdi>' + fa(x.cnt) + '</bdi> محصول · ' + clock(x.t) + (x.note && /ناقص/.test(x.note) ? ' · ' + esc(x.note) : ''), /^خطا|ناقص|قدیمی|هنوز/.test(x.st));
  });
  row('فهرست', '<bdi>' + fa(r.nb) + '</bdi> برند · <bdi>' + fa(r.nm) + '</bdi> عطر · <bdi>' + fa(r.nv) + '</bdi> نوع' + (hiddenN ? ' · <bdi>' + fa(hiddenN) + '</bdi> مبهم پنهان' : ''));
  row('عکس‌ها', '<bdi>' + fa(r.ps.have) + '</bdi> از <bdi>' + fa(r.ps.need) + '</bdi> روی گوشی' + (r.ps.pend ? ' · <bdi>' + fa(r.ps.pend) + '</bdi> در حال دانلود' : '') + (r.ps.bad ? ' · <bdi>' + fa(r.ps.bad) + '</bdi> نشد' : ''), r.ps.have < r.ps.need && !r.ps.pend);
  row('نام انگلیسی', '<bdi>' + fa(r.withEn) + '</bdi> از <bdi>' + fa(r.all) + '</bdi> را خودِ سایت‌ها داده‌اند؛ بقیه ساخته می‌شود');
  el.innerHTML = rows.join('');
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
  ls.set('pp.set', set); try { rebuild(); } catch (e) { console.error(e); } renderBrands();
}
$('sLang').onclick = function (e) { var b = e.target.closest('button'); if (!b || !b.dataset.l || b.dataset.l === (set.lang === 'en' ? 'en' : 'fa')) return; set.lang = b.dataset.l; ls.set('pp.set', set); try { rebuild(); } catch (er) { console.error(er); } renderSheet(); };
$('sBrBtn').onclick = function () { brOpen = !brOpen; renderBrands(); };
$('sBrList').onclick = function (e) {
  var all = e.target.closest && e.target.closest('#sBrAll');
  if (all) { set.off = {}; ls.set('pp.set', set); try { rebuild(); } catch (e2) {} renderBrands(); return; }
  var r = e.target.closest && e.target.closest('.brw'); if (!r) return;
  setOff(r.dataset.id, r.classList.contains('on'));
};
var sheet = $('sheet'), scm = $('scm'), sSp = new Spring(1, function (y) { sheetY = y; sheet.style.transform = 'translate3d(0,' + (y * 110).toFixed(2) + '%,0)'; scm.style.opacity = String(clamp(1 - y, 0, 1)); scm.style.pointerEvents = y < .98 ? 'auto' : 'none'; });
sSp.eps = .002;
function openSheet() { open = true; renderSheet(); sSp.x = sheetY; sSp.to(0, { response: .42, damping: .85 }); }
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
$('sRef').onclick = function () { if (busy) { toast('همین حالا در حال بروزرسانی است…', 2200); return; } refresh(true); };
$('sFull').onclick = function () { if (busy) return; db.full = {}; db.fa = {}; saveDb(); refresh(true); };
$('sCopy').onclick = function () {
  var t = 'گزارش قیمت عطر ' + VERSION + '\n' + Core.SOURCES.map(function (s) { var x = stt[s.id] || {}; return s.name + ': ' + (x.ok ? 'ok ' + x.n + (x.mode ? ' (' + x.mode + ')' : '') + (x.note ? ' ' + x.note : '') + (x.added ? ' +' + x.added : '') : (x.raw || x.err || 'نامشخص')); }).join('\n')
    + '\nعطر در حافظه: ' + Object.keys(db.g).length + ' ؛ برند: ' + TREE.length + ' ؛ عکس: ' + imgOk + ' نشد: ' + imgBad + ' ؛ نمایش: ' + list.length + ' ؛ مبهم‌ (نشان داده نشد): ' + hiddenN + ' ؛ عکس ذخیره‌شده: ' + Object.keys(imgLoc).length
    + '\n\nخطاها:\n' + netBad.concat(netLog).map(function (l) { return l.s + ' ' + l.u + '\n' + l.b; }).join('\n---\n');
  if (window.Native && window.Native.copy) window.Native.copy(t); else if (navigator.clipboard) navigator.clipboard.writeText(t).catch(function () {});
  $('sCopy').textContent = 'کپی شد؛ در پیام برای سازنده بچسبانید';
};
window.__back = function () {
  if (vwId) { closeViewer(); return true; }
  if (open) { closeSheet(); return true; }
  if (dtId) { closeDetail(); return true; }
  return goUp();
};
window.__resume = function () { updPill(); var lo = lastOk(); if (!busy && (!lo || Date.now() - lo > 15 * 60000)) refresh(false); };
document.addEventListener('visibilitychange', function () { if (!document.hidden) window.__resume(); });
window.addEventListener('beforeunload', function () { if (curModel && nav.lvl === 0) { var a = curModel.getAnchor(); if (a) ls.set('pp.last', a); } });
window.__pp = { get allBrands() { return ALLB; }, open: openEntry, up: goUp, view: viewImg, closeView: closeViewer, get nav() { return nav; }, get tree() { return TREE; }, get gate() { var ps = photoStat(); return { need: ps.need, have: ps.have, ready: !!db.ready, tot: imgTot, left: imgLeft(), ok: imgOk, bad: imgBad }; }, mount: function (m) { var t = performance.now(); set.model = m; mountModel(curModel ? curModel.getAnchor() : null); return performance.now() - t; }, get model() { return curModel; }, get list() { return list; }, get flat() { return FLAT; }, get state() { return { db: db, st: stt, busy: busy, imgLoc: imgLoc }; }, refresh: refresh, net: net };

/* شروع */
applyTheme();
loadImgs();
try { rebuild(); } catch (e) { console.error(e); }
updPill(); overlay(); renderSheet();
refresh(false);
setInterval(function () { updPill(); var lo = lastOk(); if (!busy && (!lo || Date.now() - lo > 15 * 60000)) refresh(false); }, 30000);
/* قفل ورود: اگر دانلود گیر کرد خودش دوباره تلاش کند؛ عکسی که جواب نداد جلوی ورود را نگیرد */
setInterval(function () {
  if (db.ready) return;
  if (!busy && imgLeft() > 0 && Date.now() - imgLastT > 40000) { imgBad += imgLeft(); imgPend = {}; checkReady(); }
  else if (!busy && imgLeft() === 0 && srcDone() < Core.SOURCES.length && Date.now() - lastTried > 45000) refresh(false);
}, 5000);
})();
