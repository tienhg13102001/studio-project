/*
 * Phần dùng chung: ngôn ngữ VI/EN, định dạng tiền, đầu trang và chân trang.
 */
(function (g) {
  var BZ = g.BZ;
  var C = BZ.CONFIG;
  var lang = 'vi';

  BZ.lang = function () { return lang; };

  // Luật xuống dòng: không để từ nối ngắn (của, và, cho, tối đa...) đứng cuối dòng; không để đứt giữa số và đơn vị ("2 phút", "250 ảnh", "≤ 4 giờ"), giữa "+" và "×" với hai vế của nó.
  // Hai từ cuối mỗi câu cũng đi liền nhau. Dùng khoảng trắng không ngắt (U+00A0).
  var NB = '\u00A0';
  // Cụm hai từ không được tách đôi giữa hai dòng.
  var WORDS = new RegExp('(' + ['phóng sự', 'nhân sự', 'đón dâu', 'ăn hỏi', 'quay phim', 'chụp ảnh', 'đặt lẻ', 'đặt cọc', 'bản quyền',
    'ngày cưới', 'đã gồm', 'chi phí', 'chi tiết', 'tạm tính', 'ước tính', 'dịch vụ', 'quay chụp', 'báo giá', 'hợp đồng', 'hóa đơn',
    'điều khoản', 'chỉnh sửa', 'thanh toán', 'địa điểm', 'khoảng cách', 'di chuyển', 'miễn phí', 'tiết kiệm', 'đẹp nhất', 'ảnh gốc',
    'file gốc', 'minh bạch', 'thường gặp', 'góc nhìn', 'khung hình', 'cảm xúc', 'khoảnh khắc', 'ngày trọng đại', 'trực tiếp', 'kinh nghiệm', 'điều phối', 'chất lượng', 'thời lượng', 'sản phẩm', 'hoàn thiện', 'khách hàng', 'lịch trình', 'cập nhật'].join('|') + ')', 'giu');
  function nb(s) {
    return s
      .replace(/(\d)\s(?=[\d\p{L}%])/gu, '$1' + NB)
      .replace(/(^|\s)(của|và|cho|với|để|là|khi|các|một|hoặc|trong|tại|ở|từ|đến|nếu|thì|mỗi|khoảng)\s/giu, '$1$2' + NB)
      .replace(/\b(Bee)\s(?=Z\b)/g, '$1' + NB)
      .replace(/\b(up)\s(to)\s(?=\d)/gi, '$1' + NB + '$2' + NB)
      .replace(/(tối|ít)\s(?=đa|nhất)/giu, '$1' + NB)
      .replace(/(đa|nhất)\s(?=\d)/giu, '$1' + NB)
      .replace(WORDS, function (w) { return w.replace(/\s/g, NB); })
      .replace(/([≤≥])\s/g, '$1' + NB)
      .replace(/\s([+×])\s/g, NB + '$1' + NB)
      // Hai từ cuối mỗi câu đi liền nhau, để không còn chữ lẻ một mình ở dòng cuối.
      .replace(/(\S)\s(\S*[.!?…])(?=\s+[\p{Lu}\d]|\n)/gu, '$1' + NB + '$2')
      .replace(/(\S)\s(\S+)\s*$/u, '$1' + NB + '$2');
  }

  // Số đếm một chữ số đứng riêng đi liền chữ (2 phút, 1 nhân sự) viết thành 02, 01 (chỉ tiếng Việt).
  // Bỏ qua số trong khoảng (4–5), số nằm trong phép nhân (× 3 nhân sự) và số đã có nhiều chữ số.
  function pad2(s) {
    return s.replace(/(^|[^\d.,–\-\/])([1-9])(?=[ \u00A0]\p{L})/gu, function (m, pre, d, off) {
      return /(×|\bx)\s$/.test(s.slice(0, off + pre.length)) ? m : pre + '0' + d;
    });
  }

  BZ.t = function (key, vars) {
    var e = BZ.T[key];
    if (!e) return key;
    var s = e[lang] || e.vi;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    if (lang !== 'en' && key !== 'hero.h1') s = pad2(s); // tiêu đề trang chủ giữ "2 phút"
    return nb(s);
  };

  // 15000000 -> "15.000.000đ" (vi) hoặc "VND 15,000,000" (en)
  BZ.fmt = function (n) {
    var sep = lang === 'en' ? ',' : '.';
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return lang === 'en' ? 'VND' + NB + s : s + '₫';
  };

  BZ.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 20.5c0-3.8 3.4-6 7.5-6s7.5 2.2 7.5 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5a6 6 0 00-12 0c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 21.5h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 6.5V12l3.5 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 6L3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3zM6.2 5.3l3.1 3.9M12.4 3.4l3.1 4M3 11h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.4 4-2 1.3a11 11 0 005.2 5.2l1.3-2 4 1.4v3a2 2 0 01-2.2 2A16 16 0 014.6 5.7a2 2 0 012-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 2h10v10H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    photo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="12.5" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 10.5l5-3v9l-5-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="16" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.7 1A3.5 3.5 0 0117 18z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12l2.2 2.2L15.5 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 7.8v.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  BZ.icon = function (name) { return ICONS[name] || ''; };

  function headerHtml() {
    var onBuilder = /bao-gia\.html$/.test(location.pathname);
    return '<header class="site-header"><div class="hdr wrap-wide">' +
      '<a class="logo" href="index.html" aria-label="Bee Z Wedding Film"><span class="chip">BEE Z</span><span class="logo-t" data-i18n="brand.tag">Wedding Film</span></a>' +
      '<nav class="nav" aria-label="Menu">' +
      '<a href="bao-gia.html"' + (onBuilder ? ' aria-current="page"' : '') + ' data-i18n="nav.pricing"></a>' +
      '<a href="' + BZ.esc(C.portfolioUrl) + '" target="_blank" rel="noopener" data-i18n="nav.products"></a>' +
      '<a href="#lien-he" data-i18n="nav.contact"></a></nav>' +
      '<div class="hdr-r">' +
      '<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="vi">VI</button><button type="button" data-lang="en">EN</button></div>' +
      '<a class="icon-btn" href="' + BZ.esc(C.phoneHref) + '" aria-label="' + BZ.esc(C.phone) + '">' + ICONS.phone + '</a>' +
      '<a class="btn btn-primary btn-sm hdr-cta" href="bao-gia.html" data-i18n="cta.quote"></a>' +
      '</div></div></header>';
  }

  function footerHtml() {
    return '<footer class="site-footer" id="lien-he"><div class="wrap-wide ftr">' +
      '<div><div class="logo"><span class="chip">BEE Z</span><span class="logo-t">Wedding Film</span></div>' +
      '<p class="muted" data-i18n="footer.blurb"></p></div>' +
      '<div><h4 data-i18n="footer.contact"></h4><ul class="plain">' +
      '<li><a href="' + BZ.esc(C.phoneHref) + '">' + BZ.esc(C.phone) + '</a> · <a href="' + BZ.esc(C.zalo) + '" target="_blank" rel="noopener" data-i18n="footer.zalo"></a></li>' +
      '<li><a href="mailto:' + BZ.esc(C.email) + '">' + BZ.esc(C.email) + '</a></li>' +
      '<li><a href="' + BZ.esc(C.facebook) + '" target="_blank" rel="noopener">facebook.com/BeeZFilm</a></li></ul></div>' +
      '</div></footer>';
  }

  var CLAUSES = '.hero h1';
  var LEADS = '.lead, .sec-head p, .page-head p, .cta2 p, .step > .sub';

  // Mỗi câu một dòng / mỗi vế (ngắt ở dấu phẩy) một cụm không bị đứt giữa chừng.
  BZ.lines = function (txt) {
    return txt.replace(/([.!?])\s+(?=[\p{Lu}\d])/gu, '$1\n').split('\n').map(function (p) { return '<span class="ln">' + BZ.esc(p) + '</span>'; }).join('');
  };
  BZ.clauses = function (txt) {
    return txt.replace(/,\s+/g, ',\n').split('\n').map(function (p) { return '<span class="cl">' + BZ.esc(p) + '</span>'; }).join(' ');
  };

  BZ.applyI18n = function (root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (el) {
      var txt = BZ.t(el.getAttribute('data-i18n'));
      // Đoạn dẫn nhiều câu: mỗi câu một dòng, câu nào dài thì tự cân dòng.
      var parts = el.matches(LEADS) ? txt.replace(/([.!?])\s+(?=\p{Lu})/gu, '$1\n').split('\n')
        : el.matches(CLAUSES) ? txt.replace(/,\s+/g, ',\n').split('\n') : txt.indexOf('\n') > -1 ? txt.split('\n') : [txt]; // tiêu đề lớn: mỗi vế một dòng, ngắt ở dấu phẩy
      if (parts.length > 1) el.innerHTML = parts.map(function (p) { return '<span class="ln">' + BZ.esc(p) + '</span>'; }).join('');
      else el.textContent = txt;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-ph]'), function (el) {
      el.setAttribute('placeholder', BZ.t(el.getAttribute('data-i18n-ph')));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-aria]'), function (el) {
      el.setAttribute('aria-label', BZ.t(el.getAttribute('data-i18n-aria')));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-money]'), function (el) {
      el.textContent = BZ.fmt(Number(el.getAttribute('data-money')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.lang button'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    var tk = document.documentElement.getAttribute('data-title');
    if (tk) document.title = BZ.t(tk) + ' · Bee Z Wedding Film';
    document.documentElement.lang = lang;
  };

  BZ.setLang = function (l) {
    lang = l === 'en' ? 'en' : 'vi';
    try { localStorage.setItem('bz-lang', lang); } catch (e) {}
    BZ.applyI18n(document);
    document.dispatchEvent(new CustomEvent('bz:lang', { detail: lang }));
  };

  BZ.param = function (name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  };

  // Gọi một lần khi trang nạp xong: chèn đầu/chân trang, áp ngôn ngữ, rồi chạy hàm của từng trang.
  BZ.init = function (onReady) {
    function go() {
      var q = BZ.param('lang');
      var saved = null;
      try { saved = localStorage.getItem('bz-lang'); } catch (e) {}
      lang = q === 'en' || q === 'vi' ? q : saved === 'en' ? 'en' : 'vi';
      var h = document.getElementById('site-header');
      var f = document.getElementById('site-footer');
      if (h) h.innerHTML = headerHtml();
      if (f) f.innerHTML = footerHtml();
      Array.prototype.forEach.call(document.querySelectorAll('.lang button'), function (b) {
        b.addEventListener('click', function () { BZ.setLang(b.getAttribute('data-lang')); });
      });
      BZ.applyI18n(document);
      if (onReady) onReady();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  };
}(typeof window !== 'undefined' ? window : globalThis));
