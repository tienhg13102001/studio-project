/*
 * Phần JS của các hiệu ứng chuyển động (CSS ở assets/css/motion.css). Hoàn duyệt 15/15 ngày 19/11/2026.
 * Chỉ chạy khi <html> có lớp "mo" — lớp này KHÔNG được thêm nếu máy bật "giảm chuyển động".
 * Nạp SAU data.js, common.js và script riêng của trang. Không đổi dữ liệu hay giá: chỉ đổi cách hiện.
 */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('mo')) return;
  var BZ = window.BZ;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var wide = function () { return window.matchMedia('(min-width: 721px)').matches; };
  var IO = 'IntersectionObserver' in window;

  // Chạy fn(t) với t từ 0 tới 1 trong ms mili giây; fn trả false là dừng giữa chừng.
  function tween(ms, fn, done) {
    var t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / ms);
      if (fn(t) === false) return;
      if (t < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
  }
  function inView(el) { var r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; }
  function onView(el, fn, th) {
    if (!IO) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: th || 0.3 });
    io.observe(el);
  }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ---------- 10. Đầu trang gọn lại khi cuộn (có khoảng đệm để không chập chờn quanh ngưỡng) ---------- */
  var small = false;
  function header() {
    var y = window.scrollY || window.pageYOffset;
    var s = small ? y > 8 : y > 40;
    if (s !== small) { small = s; root.classList.toggle('hdr-small', s); }
  }

  /* ---------- 3. Ảnh trôi chậm khi cuộn (ảnh đầu trang + Founder, chỉ máy tính) ---------- */
  var drift = [];
  function parallax() {
    var on = wide();
    drift.forEach(function (el) {
      if (!on) { el.style.removeProperty('--py'); return; }
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var cap = r.height * 0.05; // ảnh chừa 6–7% mỗi phía nên trôi tối đa 5% là không lộ mép
      var v = -(r.top + r.height / 2 - window.innerHeight / 2) * 0.06;
      el.style.setProperty('--py', Math.max(-cap, Math.min(cap, v)).toFixed(1) + 'px');
    });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; header(); parallax(); });
  }

  /* ---------- 4 + 6. Ba thẻ lịch hiện lần lượt, giá "Từ…" đếm lên ---------- */
  function countPrice(b) {
    if (!BZ || !BZ.fromPrice) return;
    var n = BZ.fromPrice(b.getAttribute('data-from'));
    tween(1100, function (t) { b.textContent = BZ.fmt(Math.round(n * ease(t) / 1e5) * 1e5); }, function () { b.textContent = BZ.fmt(n); });
  }
  function journeyCards() {
    var cards = $$('.jcard');
    if (!cards.length) return;
    var box = cards[0].parentNode;
    var prices = cards.map(function (c) { return c.querySelector('[data-from]'); });
    prices.forEach(function (b) { if (b && BZ) b.textContent = BZ.fmt(0); });
    var run = function (reveal) {
      cards.forEach(function (c, i) {
        if (reveal) c.classList.add('rv-in');
        if (prices[i]) setTimeout(function () { countPrice(prices[i]); }, (reveal ? 150 : 250) + i * 150);
        if (reveal) setTimeout(function () { c.classList.remove('rv', 'rv-in'); c.style.removeProperty('--d'); }, 1400);
      });
    };
    if (inView(box)) { run(false); return; } // đã thấy ngay khi mở trang: không giấu thẻ, chỉ đếm giá
    cards.forEach(function (c, i) { c.classList.add('rv'); c.style.setProperty('--d', (i * 0.14) + 's'); });
    onView(box, function () { run(true); }, 0.2);
  }

  /* ---------- 7. Số lớn "Sản phẩm bạn nhận về" đếm lên ---------- */
  function figures() {
    var box = document.querySelector('.figs');
    if (!box || !BZ) return;
    var pad = function (v, n) { v = String(v); while (v.length < n) v = '0' + v; return v; };
    var spans = $$('.fig .big > span[data-i18n]', box).map(function (s) {
      var m = BZ.t(s.getAttribute('data-i18n')).trim().match(/^(\d+)(?:([–-])(\d+))?$/);
      return m ? { el: s, m: m } : null;
    }).filter(Boolean);
    var show = function (x, e) {
      var m = x.m;
      x.el.textContent = pad(Math.round(+m[1] * e), m[1].length) + (m[3] ? m[2] + pad(Math.round(+m[3] * e), m[3].length) : '');
    };
    if (!inView(box)) spans.forEach(function (x) { show(x, 0); });
    onView(box, function () {
      spans.forEach(function (x) {
        // Lấy lại số đích lúc chạy (khách có thể đã đổi ngôn ngữ).
        var m = BZ.t(x.el.getAttribute('data-i18n')).trim().match(/^(\d+)(?:([–-])(\d+))?$/);
        if (!m) return;
        x.m = m;
        tween(1200, function (t) { show(x, ease(t)); }, function () { x.el.textContent = BZ.t(x.el.getAttribute('data-i18n')); });
      });
    }, 0.4);
  }

  /* ---------- 8. Hỏi đáp mở / đóng mượt ---------- */
  function faq() {
    $$('.faq3 details').forEach(function (d) {
      var sm = d.querySelector('summary'), ans = d.querySelector('.ans');
      if (!sm || !ans || !ans.animate) return; // trình duyệt cũ: giữ cách mở mặc định
      if (d.open) d.classList.add('is-open');
      var anim = null;
      sm.addEventListener('click', function (e) {
        e.preventDefault();
        var from = d.open ? ans.getBoundingClientRect().height : 0;
        if (anim) { anim.cancel(); anim = null; }
        var opening = !d.classList.contains('is-open');
        if (opening) { d.open = true; d.classList.add('is-open'); } else d.classList.remove('is-open');
        var to = opening ? ans.scrollHeight : 0;
        ans.style.overflow = 'hidden';
        anim = ans.animate([{ height: from + 'px', opacity: opening ? 0 : 1 }, { height: to + 'px', opacity: opening ? 1 : 0 }],
          { duration: 480, easing: 'cubic-bezier(.65,0,.35,1)' });
        anim.onfinish = function () { anim = null; ans.style.overflow = ''; if (!opening) d.open = false; };
      });
    });
  }

  /* ---------- 11, 12, 13. Trang tính giá: thẻ vừa chọn, tổng chạy số, dòng mới trong "Gói của bạn" ----------
     builder.js vẽ lại toàn bộ sau mỗi lần chọn rồi phát sự kiện bz:summary. Ở đây ghi nhớ khách vừa bấm gì
     (nghe ở pha "capture" để chạy TRƯỚC builder), vẽ xong thì tìm lại thẻ đó và cho nó chạy hiệu ứng. */
  var pick = null;
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || !el.matches || !el.checked) return;
    if (el.name === 'journey') { var v = el.value; pick = function () { var i = document.querySelector('input[name="journey"][value="' + v + '"]'); return i && i.closest('.opt'); }; }
    else if (el.hasAttribute('data-extra')) { var x = el.getAttribute('data-extra'); pick = function () { var i = document.querySelector('[data-extra="' + x + '"]'); return i && i.closest('.xrow'); }; }
    else if (el.hasAttribute('data-permit')) { pick = function () { var i = document.querySelector('[data-permit]'); return i && i.closest('.xrow'); }; }
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-tier], .combo[data-card-tier]') : null;
    if (!b) return;
    // Bấm vào thân thẻ combo chỉ là "chọn" trên điện thoại; trên máy tính phải bấm nút của thẻ.
    if (!b.hasAttribute('data-tier') && !window.matchMedia('(max-width: 720px)').matches) return;
    var tier = b.getAttribute('data-tier') || b.getAttribute('data-card-tier');
    pick = function () { return document.querySelector('.combo[data-card-tier="' + tier + '"]'); };
  }, true);

  var shown = null, target = null, rollId = 0;
  function setTotal(v) { $$('.summary .stotal .r, #bar .r').forEach(function (el) { el.textContent = BZ.fmt(v); }); }
  function rollTo(to) {
    var from = shown, id = ++rollId;
    target = to;
    setTotal(from);
    var fl = document.querySelector('.summary .stotal .r');
    if (fl) restart(fl, 'mo-fl');
    var br = document.querySelector('#bar .r');
    if (br) restart(br, 'mo-bump'); // 25. số trên thanh dưới cùng (điện thoại) nảy nhẹ
    tween(700, function (t) {
      if (id !== rollId) return false;
      shown = t < 1 ? Math.round((from + (to - from) * ease(t)) / 1e5) * 1e5 : to;
      setTotal(shown);
    }, function () { if (id === rollId) { shown = to; setTotal(to); } });
  }
  var lastExtras = null;
  document.addEventListener('bz:summary', function (e) {
    var d = e.detail || {};
    if (pick) {
      var el = pick(); pick = null;
      if (el && el.classList.contains('on')) restart(el, 'just-on');
    }
    var xs = d.extras || [];
    if (lastExtras) xs.forEach(function (id) {
      if (lastExtras.indexOf(id) > -1) return;
      var n = document.querySelector('.summary .xn[data-x="' + id + '"]');
      if (n) n.classList.add('xn-in');
    });
    lastExtras = xs.slice();
    if (typeof d.total !== 'number' || !BZ) return;
    if (shown === null) { shown = target = d.total; return; } // lần vẽ đầu: không chạy số
    if (d.total !== target) rollTo(d.total);
    else if (shown !== target) setTotal(shown); // vẽ lại giữa lúc đang chạy số: giữ con số đang chạy
  });

  /* ---------- 14. Thanh bước: vạch vàng trượt theo bước đang xem ---------- */
  function stepperBar() {
    var nav = document.querySelector('.stepper'), ol = document.getElementById('stepper');
    if (!nav || !ol) return;
    var ind = document.createElement('span');
    ind.className = 'mo-ind';
    ind.setAttribute('aria-hidden', 'true');
    nav.appendChild(ind);
    var place = function (instant) {
      var a = ol.querySelector('a.on');
      if (!a) { ind.style.opacity = '0'; return; }
      var nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      if (instant) ind.style.transition = 'none';
      ind.style.opacity = '1';
      ind.style.transform = 'translateX(' + (r.left - nr.left).toFixed(1) + 'px) scaleX(' + r.width.toFixed(1) + ')';
      if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    };
    new MutationObserver(function () { place(false); }).observe(ol, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () { place(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
    place(true);
  }

  /* ---------- 15. Nút gửi: chèn ba chấm + dấu tích (builder.js gắn .is-sending / .is-done) ---------- */
  function submitButton() {
    var b = document.getElementById('submit-btn');
    if (!b) return;
    b.insertAdjacentHTML('beforeend', '<span class="mo-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<svg class="mo-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>');
  }


  /* ===================== Đợt 2 (Hoàn lấy 14/15 ngày 19/11/2026, bỏ số 26) ===================== */

  /* ---------- 16. Ảnh thẻ lịch + Founder hiện từ mờ sang nét khi cuộn tới ---------- */
  function sharpPhotos() {
    $$('.jcard .photo, .founder .photo').forEach(function (ph) {
      ph.classList.add('mo-blur');
      var done = false;
      var go = function () { if (done) return; done = true; ph.classList.remove('mo-blur'); ph.classList.add('mo-sharp'); setTimeout(function () { ph.classList.remove('mo-sharp'); }, 1100); }; // gỡ lớp khi xong để ảnh không giữ bộ lọc
      // Ảnh không tải được thì sau 4 giây cũng bỏ mờ, không để khung nhoè mãi.
      setTimeout(function () { if (!ph.classList.contains('has')) go(); }, 4000);
      onView(ph, function () {
        if (ph.classList.contains('has')) { go(); return; }
        var mo = new MutationObserver(function () { if (ph.classList.contains('has')) { mo.disconnect(); go(); } });
        mo.observe(ph, { attributes: true, attributeFilter: ['class'] });
      }, 0.25);
    });
  }

  /* ---------- 17 + 18. Đầu mục: chữ nhỏ khép lại, tiêu đề trồi lên, câu dẫn hiện sau ---------- */
  function headings() {
    var groups = $$('main .sec-head, main .founder > div:last-child, main .cta2 .wrap, main .page-head').filter(function (g) { return !g.closest('.hero'); });
    groups.forEach(function (g) {
      var k = g.querySelector(':scope > .kicker'), h = g.querySelector(':scope > h1, :scope > h2, :scope > h3'), sub = g.querySelector(':scope > p');
      var parts = [[k, 'mo-kin'], [h, 'mo-hin'], [sub, 'mo-pin']].filter(function (x) { return x[0]; });
      if (!parts.length) return;
      var show = function () {
        parts.forEach(function (x) { x[0].classList.remove('mo-hide'); x[0].classList.add(x[1]); });
        // Bỏ lớp sau khi chạy xong: chữ nhỏ được xuống dòng lại như thường.
        setTimeout(function () { parts.forEach(function (x) { x[0].classList.remove(x[1]); }); }, 1600);
      };
      if (inView(g)) { show(); return; }
      parts.forEach(function (x) { x[0].classList.add('mo-hide'); });
      onView(g, show, 0.35);
    });
  }

  /* ---------- 20. Bảng đặt lẻ: hàng "Cả hai" được tô sáng khi cuộn tới ---------- */
  function soloSweep() {
    [['solo-table', '.combo-row td'], ['solo-cards', '.sm-c']].forEach(function (x) {
      var box = document.getElementById(x[0]);
      if (!box) return;
      box.classList.add('mo-sw');
      onView(box, function () {
        $$(x[1], box).forEach(function (c, i) { c.style.animationDelay = (i * 0.1) + 's'; });
        box.classList.add('mo-swin');
        // Xong thì trả về màu nền gốc của hàng (bảng có thể vẽ lại khi đổi ngôn ngữ).
        setTimeout(function () { box.classList.remove('mo-sw', 'mo-swin'); $$(x[1], box).forEach(function (c) { c.style.animationDelay = ''; }); }, 1400);
      }, 0.4);
    });
  }

  /* ---------- 22. Bốn điều yên tâm: dấu tích tự vẽ lần lượt ---------- */
  function promises() {
    var box = document.querySelector('.promises');
    if (!box) return;
    $$('.promise', box).forEach(function (p, i) { p.style.setProperty('--pd', (i * 0.22) + 's'); });
    if (!inView(box)) box.classList.add('mo-wait');
    onView(box, function () { box.classList.remove('mo-wait'); box.classList.add('mo-go'); }, 0.3);
  }

  /* ---------- 23. Founder: viền vàng tự vẽ quanh ảnh, "10 năm" đếm lên ---------- */
  function founder() {
    var f = document.querySelector('.founder'), ph = f && f.querySelector('.photo');
    if (!f || !ph) return;
    ph.insertAdjacentHTML('beforeend', '<svg class="mo-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x=".5" y=".5" width="99" height="99" pathLength="100" vector-effect="non-scaling-stroke"/></svg>');
    var b = f.querySelector('.stat b[data-i18n]');
    var target = function () { return b ? BZ.t(b.getAttribute('data-i18n')) : ''; };
    var m0 = target().match(/^(\d+)(.*)$/);
    if (m0 && !inView(f)) b.textContent = '0' + m0[2];
    onView(f, function () {
      f.classList.add('mo-go');
      var m = target().match(/^(\d+)(.*)$/);
      if (!m) return;
      tween(1400, function (t) { b.textContent = Math.round(+m[1] * ease(t)) + m[2]; }, function () { b.textContent = target(); });
    }, 0.35);
  }

  /* ---------- 24. Báo lỗi form: ô thiếu rung nhẹ (builder.js gắn .bad trước, script này nghe sau) ---------- */
  function formShake() {
    var form = document.getElementById('quote-form');
    if (!form) return;
    form.addEventListener('submit', function () {
      $$('.field.bad', form).forEach(function (f) { restart(f, 'mo-shake'); });
    });
  }

  /* ---------- 25. Điện thoại: thanh tổng tiền trượt lên khi khách bắt đầu chọn ---------- */
  function bottomBar() {
    if (!document.getElementById('bar')) return;
    var up = function () { document.body.classList.add('mo-bar-up'); };
    var head = document.querySelector('.page-head');
    var check = function () { if ((window.scrollY || 0) > (head ? head.offsetTop + head.offsetHeight - 80 : 160)) up(); };
    window.addEventListener('scroll', check, { passive: true });
    document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('.builder')) up(); });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.builder button, .builder .combo')) up(); });
    check();
  }

  /* ---------- 27. Máy tính: vòng tròn vàng bám theo chuột ---------- */
  function cursorRing() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ring = document.createElement('div');
    ring.className = 'mo-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    var tx = -100, ty = -100, x = -100, y = -100, running = false;
    var HOT = 'a, button, summary, label, select, .jcard, .combo, input, textarea';
    function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      ring.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.4) requestAnimationFrame(loop); else running = false;
    }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ring.classList.contains('on')) { x = tx; y = ty; ring.classList.add('on'); }
      ring.classList.toggle('big', !!(e.target.closest && e.target.closest(HOT)));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) ring.classList.remove('on'); });
  }

  /* ---------- 28. Trang cảm ơn: kim tuyến vàng rơi 2,4 giây ---------- */
  function confetti() {
    if (!document.querySelector('.confirm .recap')) return; // chỉ khi thật sự vừa gửi xong
    setTimeout(function () {
      var cv = document.createElement('canvas');
      cv.className = 'mo-confetti';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      var c = cv.getContext('2d');
      if (!c) { cv.remove(); return; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cols = ['#D4B062', '#E6CF8F', '#B8933F', '#FCD125', '#F5EBC8'], ps = [], n = W < 721 ? 50 : 90;
      for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 1.2, vy: 1.6 + Math.random() * 2.4,
        a: Math.random() * 6, va: (Math.random() - 0.5) * 0.2, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4, col: cols[i % cols.length] });
      var t0 = null;
      (function loop(now) {
        if (t0 === null) t0 = now;
        var t = Math.max(0, (now - t0) / 2400);
        c.clearRect(0, 0, W, H);
        c.globalAlpha = Math.max(0, Math.min(1, (1 - t) * 3));
        ps.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.a += p.va;
          c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.scale(1, Math.cos(p.a * 2));
          c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
        });
        if (t < 1) requestAnimationFrame(loop); else cv.remove();
      })(performance.now());
    }, 450);
  }

  /* ---------- 30. Máy tính: thẻ combo nghiêng nhẹ theo chuột (builder vẽ lại thẻ nên nghe ở document) ---------- */
  function comboTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 721px)').matches) return;
    var cur = null, ev = null, queued = false;
    function reset(c) { if (!c) return; c.classList.remove('mo-tilt'); c.style.transform = ''; }
    function apply() {
      queued = false;
      var c = ev && ev.target.closest ? ev.target.closest('.combo') : null;
      if (c !== cur) { reset(cur); cur = c; }
      if (!c) return;
      var r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      c.classList.add('mo-tilt');
      c.style.transform = 'perspective(900px) rotateY(' + ((x - 0.5) * 12).toFixed(2) + 'deg) rotateX(' + (-(y - 0.5) * 12).toFixed(2) + 'deg)';
      c.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    }
    document.addEventListener('mousemove', function (e) { ev = e; if (!queued) { queued = true; requestAnimationFrame(apply); } }, { passive: true });
    document.addEventListener('bz:summary', function () { cur = null; }); // thẻ vừa được vẽ lại
  }

  function init() {
    drift = $$('.hero-media .photo, .founder .photo');
    header(); parallax();
    journeyCards(); figures(); faq(); stepperBar(); submitButton();
    sharpPhotos(); headings(); soloSweep(); promises(); founder(); formShake(); bottomBar(); cursorRing(); confetti(); comboTilt();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  // Đăng ký sau BZ.init của trang (script này nạp sau) nên chạy khi giá, chữ, ảnh đã được điền.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
