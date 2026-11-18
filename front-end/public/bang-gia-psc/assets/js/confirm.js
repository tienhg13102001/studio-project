/* Trang xác nhận: đọc yêu cầu vừa gửi (lưu tạm trong trình duyệt) và hiện lại cho khách. */
(function () {
  var BZ = window.BZ;
  var C = BZ.CONFIG;
  var t = function (k, v) { return BZ.t(k, v); };
  var esc = BZ.esc;
  var data = null;

  function load() {
    try { data = JSON.parse(sessionStorage.getItem('bz-last') || 'null'); } catch (e) { data = null; }
  }

  function row(k, v) { return '<div class="rr"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }

  function render() {
    var el = document.getElementById('confirm');
    if (!data) {
      el.innerHTML = '<h1>' + t('c.empty') + '</h1><div class="actions"><a class="btn btn-primary" href="bao-gia.html">' + t('c.again') + '</a></div>';
      return;
    }
    var p = data.payload, s = data.state;
    var r = BZ.calc(s);
    var tier = s.mode === 'solo' ? t(s.soloKind === 'photo' ? 'sb.photoS' : 'sb.videoS')
      : t('tier.' + s.tier);
    var jName = t('j.' + s.journey + '.name') + (s.journey === 'single' ? ' · ' + t('v.' + s.variant) : '') + ' · ' + tier;
    var extras = r.extrasLines.map(function (l) { return t('x.' + l.id + '.t'); });
    var travel = r.travelRow ? t('d.' + r.travelRow.key) + (r.travelTotal ? ' · ' + BZ.fmt(r.travelTotal) : '') : t('sum.none');
    var demo = !!data.demo;
    document.documentElement.setAttribute('data-title', demo ? 'c.demoBadge' : 'c.h1');

    var h = '<div class="ok">' + BZ.icon('check') + '</div>' +
      '<span class="badge-s' + (demo ? ' demo' : '') + '">' + t(demo ? 'c.demoBadge' : 'c.badge') + '</span>' +
      '<h1>' + t(demo ? 'c.demoH1' : 'c.h1') + '</h1>' +
      '<p class="sub">' + t(demo ? 'c.demoSub' : 'c.sub') + '</p>';

    h += '<div class="recap"><div class="rows">' +
      row(t('c.name'), esc(p.name)) +
      row(t('c.contact'), esc(p.phone) + (p.email ? '<br>' + esc(p.email) : '')) +
      row(t('c.date'), p.dateTbd ? t('c.dateTbd') : esc(String(p.weddingDate || '').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1'))) +
      row(t('c.venue'), p.venue ? esc(p.venue) : t('c.notYet')) +
      row(t(s.mode === 'solo' ? 'sum.soloLabel' : 'sum.combo'), esc(jName)) +
      row(t('sum.extras'), extras.length ? extras.map(esc).join('<br>') : t('sum.none')) +
      row(t('sum.travel'), esc(travel)) +
      '</div><div class="tot"><div><div class="muted small">' + t('c.estimate') + '</div></div>' +
      '<div class="r">' + BZ.fmt(r.total) + '</div></div></div>';

    if (!demo) {
      h += '<div class="next"><h2>' + t('c.next') + '</h2><div class="grid">' +
        '<div class="s"><div class="n">01</div><h3>' + t('c.n1.t') + '</h3><p>' + t('c.n1.d') + '</p></div>' +
        '<div class="s"><div class="n">02</div><h3>' + t('c.n2.t') + '</h3><p>' + t('c.n2.d') + '</p></div>' +
        '<div class="s"><div class="n">03</div><h3>' + t('c.n3.t') + '</h3><p>' + t('c.n3.d') + '</p></div>' +
        '</div></div>';
    }

    h += '<div class="actions">' +
      '<a class="btn btn-primary" href="' + esc(C.zalo) + '" target="_blank" rel="noopener">' + BZ.icon('chat') + '<span>' + t('c.call') + ' ' + esc(C.phone) + '</span></a>' +
      '<a class="btn btn-secondary" href="' + esc(C.portfolioUrl) + '" target="_blank" rel="noopener">' + t('c.products') + '</a></div>' +
      '<p style="margin-top:18px"><a class="link" href="bao-gia.html">' + t('c.again') + '</a></p>';
    el.innerHTML = h;
  }

  BZ.init(function () {
    load();
    render();
    document.addEventListener('bz:lang', render);
  });
}());
