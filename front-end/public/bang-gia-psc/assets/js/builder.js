/* Trang báo giá: chọn hành trình, combo (hoặc đặt riêng chụp / quay), dịch vụ thêm, địa điểm, xem ước tính, gửi yêu cầu. */
(function () {
  var BZ = window.BZ;
  var P = BZ.PRICES;
  var C = BZ.CONFIG;
  var t = function (k, v) { return BZ.t(k, v); };
  var fmt = function (n) { return BZ.fmt(n); };
  var esc = BZ.esc;
  var icon = BZ.icon;
  var JOURNEYS = ['fullday', 'twoday', 'single'];

  var state = {
    mode: 'combo', // 'combo' = chọn combo (mặc định), 'solo' = đặt riêng chỉ chụp hoặc chỉ quay
    journey: 'twoday', variant: 'engagement', tier: 'complete',
    soloKind: 'photo', soloN: 1,
    extras: {}, permit: false, photo24Sets: 1, droneDays: 'engagement', lightDays: 'one', founderDays: 'engagement', travel: null
  };
  var soloOpen = false;
  var uiOpen = {}; // khối nào đang mở trên điện thoại (xem sản phẩm của combo, điều khoản)
  var want = { tier: null, extras: {}, droneDays: null, lightDays: null, founderDays: null, photo24Sets: null, permit: null }; // lựa chọn gốc của khách, để khôi phục khi đổi lịch rồi đổi lại
  var curStep = 's1';

  /* ---------- Chữ tiếng Việt cho email gửi nhân viên (không phụ thuộc ngôn ngữ đang xem) ---------- */
  function vi(key, vars) {
    var s = (BZ.T[key] || {}).vi || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; }

  /* ---------- Cách hiển thị ---------- */
  function isSolo() { return state.mode === 'solo'; }

  function tierLabel() {
    if (isSolo()) return t(state.soloKind === 'photo' ? 'sb.photoS' : 'sb.videoS');
    return t('tier.' + state.tier);
  }

  function peopleLine(combo, journeyId) {
    var two = journeyId === 'twoday';
    var n = combo.photo + combo.video;
    if (combo.isSolo) {
      var k = combo.photo ? 'Photo' : 'Video';
      return { head: n === 1 ? t('sb.person1') : t('sb.persons', { n: n }), mix: t('combo.mix' + k + (two ? 'Day' : ''), { n: n }) };
    }
    return {
      head: t(two ? 'combo.peopleDay' : 'combo.people', { n: n }),
      mix: t(two ? 'combo.mixDay' : 'combo.mix', { p: combo.photo, v: combo.video })
    };
  }
  function cap(x) { return x ? x.charAt(0).toUpperCase() + x.slice(1) : x; }
  function distLabel(key) { return t('d.' + key); }

  // Giải thích dòng Founder: trong combo thì đã giảm 9–10%; đặt riêng thì chỉ cộng phần chênh.
  function founderNote(f) {
    return f.discounted ? t('x.founder.diffCombo') : t('x.founder.diff', { a: fmt(f.gross), b: fmt(f.replaced) });
  }

  // Dịch vụ thêm nào hợp với kiểu đặt đang chọn (Founder và giao phim 24 giờ chỉ cho quay; giao ảnh 24 giờ chỉ cho chụp).
  function extraAllowed(id) {
    if (!isSolo()) return true;
    if (state.soloKind === 'photo') return id !== 'founder' && id !== 'sameday';
    return id !== 'photo24';
  }
  function applyConstraints() {
    P.extrasOrder.forEach(function (id) {
      if (!extraAllowed(id)) delete state.extras[id];
      else if (want.extras[id] !== undefined) state.extras[id] = want.extras[id]; // hợp lệ trở lại thì trả về đúng lựa chọn của khách
    });
    var two = state.journey === 'twoday';
    if (!state.extras.drone) state.permit = false;
    else if (want.permit !== null) state.permit = want.permit;
    state.droneDays = two && state.extras.drone ? (want.droneDays || state.droneDays) : 'engagement'; // chỉ gói Hai ngày được chọn ngày bay
    state.lightDays = two && state.extras.light ? (want.lightDays || state.lightDays) : 'one'; // và ngày dùng đèn
    state.founderDays = two && state.extras.founder ? (want.founderDays || state.founderDays) : 'engagement'; // và ngày Founder quay
    state.photo24Sets = two && state.extras.photo24 ? (want.photo24Sets || state.photo24Sets) : 1; // chỉ gói Hai ngày mới có 2 bộ
    var combos = BZ.combosOf(state.journey, state.variant);
    if (want.tier && combos[want.tier]) state.tier = want.tier;
    else if (!combos[state.tier]) state.tier = 'complete'; // Chỉ một buổi chỉ có Đủ đầy và Trọn vẹn
  }

  /* ---------- Vẽ từng phần ---------- */
  function renderJourney() {
    var h = '<div class="opts" role="radiogroup" aria-label="' + esc(t('s1.title')) + '">';
    JOURNEYS.forEach(function (id) {
      var on = state.journey === id;
      h += '<label class="opt' + (on ? ' on' : '') + '"><input type="radio" name="journey" value="' + id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="tick">' + icon('check') + '</span>' +
        '<span class="t">' + t('j.' + id + '.name') + '</span>' +
        '<span class="d">' + t('j.' + id + '.desc') + '</span>' +
        '<span class="f">' + t('j.from') + ' <b>' + fmt(BZ.fromPrice(id)) + '</b></span></label>';
    });
    h += '</div>';
    if (state.journey === 'single') {
      h += '<div class="variant-row"><div class="seg" role="radiogroup" aria-label="' + esc(t('j.single.name')) + '">';
      ['engagement', 'reception'].forEach(function (v) {
        h += '<label><input type="radio" name="variant" value="' + v + '"' + (state.variant === v ? ' checked' : '') + '><span>' + t('v.' + v) + '</span></label>';
      });
      h += '</div></div>';
    }
    document.getElementById('slot-journey').innerHTML = h;
  }

  function comboCard(combo, opts) {
    // opts: { name, tierKey, on, popular, journeyId, single }
    var pl = peopleLine(combo, opts.journeyId);
    var save = combo.solo - combo.price;
    var phone = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    var h = '<article class="combo' + (opts.on ? ' on' : '') + (uiOpen['combo-' + opts.tierKey] ? ' more-open' : '') + '" data-card-tier="' + opts.tierKey + '"' + (phone ? ' tabindex="0" role="button" aria-pressed="' + !!opts.on + '"' : '') + '>';
    if (opts.popular) h += '<div class="badge">' + t('badge.popular') + '</div>';
    h += '<h3>' + opts.name + '</h3>';
    if (opts.tierKey) { // chỉ được ngắt dòng ở dấu phẩy
      var tagKey = 'tag.' + opts.tierKey + (opts.journeyId === 'single' && BZ.T['tag.' + opts.tierKey + '.single'] ? '.single' : ''); // Chỉ một buổi: không nói "cả ngày"
      var clauses = t(tagKey).split(', ');
      h += '<div class="tag">' + clauses.map(function (c, i) { return '<span class="cl">' + c + (i < clauses.length - 1 ? ',' : '') + '</span>'; }).join(' ') + '</div>';
    }
    h += '<div class="ppl"><b>' + pl.head + '</b><span>' + pl.mix + '</span></div>';
    h += '<div class="price">' + fmt(combo.price) + '</div>';
    h += '<div class="was">' + t('combo.solo') + ' <s>' + fmt(combo.solo) + '</s> <span class="pill">' + t('pill.save', { x: fmt(save) }) + '</span></div>';
    h += '<button type="button" class="more-btn" data-more="combo-' + opts.tierKey + '" aria-expanded="' + !!uiOpen['combo-' + opts.tierKey] + '"><span>' + t('combo.more') + '</span><i></i></button>';
    h += '<ul><li>' + icon('check') + '<span>' + t(combo.photo > 1 ? 'combo.b1n' : 'combo.b1', { n: combo.photo, d: opts.journeyId === 'twoday' ? t('combo.perDay') : '' }) + '</span></li><li>' + icon('check') + '<span>' + t('combo.b2') + '</span></li>';
    if (opts.journeyId === 'twoday') h += '<li>' + icon('check') + '<span>' + t('combo.b3two') + '</span></li>';
    else if (combo.video > 1) h += '<li>' + icon('check') + '<span>' + t('combo.b3cam') + '</span></li>';
    h += '</ul>';
    h += '<button class="btn ' + (opts.on ? 'btn-primary' : 'btn-secondary') + '" type="button" data-tier="' + opts.tierKey + '">' +
      (opts.on ? t('btn.selected') : t('btn.choose', { name: opts.name })) + '</button>';
    var jn = opts.journeyId === 'single' ? journeyName() : t('j.' + opts.journeyId + '.name');
    var msg = t('combo.askMsg', { tier: opts.name, j: jn, price: fmt(combo.price) }).replace(/\u00A0/g, ' ');
    h += '<a class="ask" href="' + esc(C.zalo) + '" target="_blank" rel="noopener" data-zalo-combo data-msg="' + esc(msg) + '">' + icon('chat') + '<span>' + t('combo.ask') + '</span></a>';
    return h + '</article>';
  }

  // Thẻ gợi ý màu vàng: đang xem giá đặt riêng thì cho thấy thêm phần còn lại trong combo chỉ tốn bao nhiêu.
  function nudgeHtml() {
    var nd = BZ.nudge(state);
    if (!nd) return '<div class="nudge-card"><div class="nt">' + t('nudge.generic') + '</div></div>';
    var tierName = t('tier.' + nd.tierKey);
    var pl = peopleLine(nd.combo, state.journey);
    return '<div class="nudge-card"><div class="nt">' + t('nudge.' + nd.kind, { x: fmt(nd.delta) }) + '</div>' +
      '<p>' + t('nudge.body', { tier: tierName, mix: pl.mix, price: fmt(nd.combo.price), save: fmt(nd.saving) }) + '</p>' +
      '<button type="button" class="btn btn-dark btn-sm" data-nudge-tier="' + nd.tierKey + '">' + t('nudge.btn', { tier: tierName }) + '</button></div>';
  }

  // Lối tắt Founder ngay dưới các thẻ combo (chỉ khi đang chọn combo): bấm để thêm hoặc bỏ Founder.
  function founderBandHtml() {
    if (isSolo()) return '';
    var c = BZ.extraCost('founder', state);
    if (!c.founder || !c.founder.discounted) return '';
    var on = !!state.extras.founder;
    return '<div class="founder-band' + (on ? ' on' : '') + '"><div class="fb-text">' +
      '<div class="fb-title">' + t('fb.title') + '</div><p>' + BZ.lines(t('fb.body')) + '</p>' +
      '<p class="fb-price">' + BZ.clauses(t('fb.price', { tier: tierLabel(), price: fmt(c.founder.priceF), x: fmt(c.amount) })) + '</p></div>' +
      '<button type="button" class="btn ' + (on ? 'btn-primary' : 'btn-bee') + '" data-founder-toggle aria-pressed="' + on + '">' +
      (on ? icon('check') + '<span>' + t('fb.added') + '</span>' : '<span>' + t('fb.add', { x: fmt(c.amount) }) + '</span>') + '</button></div>';
  }

  function renderSoloBox() {
    var solo = isSolo();
    var open = solo || soloOpen;
    var max = P.soloMax;
    function row(kind) {
      var n = Math.min(solo ? state.soloN : 1, max[kind]);
      var price = BZ.soloPrice(kind, n, state.journey, state.variant);
      var full = BZ.soloPriceFull(kind, n, state.journey, state.variant);
      var on = solo && state.soloKind === kind;
      return '<label class="srow' + (on ? ' on' : '') + '"><input type="radio" name="soloKind" value="' + kind + '"' + (on ? ' checked' : '') + '>' +
        '<span class="box">' + icon('check') + '</span><span class="tt">' + t('sb.' + kind) + '</span><span class="pp">' + fmt(price) + (full > price ? '<s>' + fmt(full) + '</s>' : '') + '</span></label>';
    }
    var h = '<details class="solo-box"' + (open ? ' open' : '') + '><summary><span>' + t('solo.open') + '</span>' + icon('chevron') + '</summary><div class="sb-body">' +
      '<p class="muted small">' + t('sb.note') + '</p><div class="srows">' + row('photo') + row('video') + '</div>';
    if (solo) {
      var maxN = max[state.soloKind];
      h += '<div class="scount"><label for="solo-n">' + t('sb.count') + '</label><select id="solo-n" name="soloN">';
      for (var i = 1; i <= maxN; i++) h += '<option value="' + i + '"' + (i === state.soloN ? ' selected' : '') + '>' + (i === 1 ? t('sb.person1') : t('sb.persons', { n: i })) + '</option>';
      h += '</select></div>' + nudgeHtml() +
        '<button type="button" class="link" data-combo-back>' + t('sb.back') + '</button>';
    }
    h += '</div></details>';
    return h;
  }

  function renderCombos() {
    var J = P.journeys[state.journey];
    var solo = isSolo();
    var h = '';
    if (solo) h += '<div class="viewing">' + icon('info') + '<span>' + t('sb.viewing') + '</span></div>';
    var map = BZ.combosOf(state.journey, state.variant), keys = P.tiers.filter(function (k) { return map[k]; });
    h += '<div class="combos' + (keys.length === 2 ? ' two' : '') + (solo ? ' dim' : '') + '">';
    keys.forEach(function (k) {
      h += comboCard(map[k], { name: t('tier.' + k), tierKey: k, on: !solo && state.tier === k, popular: J.popular === k, journeyId: state.journey });
    });
    h += '</div>';
    var askKey = !solo && map[state.tier] ? state.tier : keys[0];
    var askJn = state.journey === 'single' ? journeyName() : t('j.' + state.journey + '.name');
    var askMsg = t('combo.askMsg', { tier: t('tier.' + askKey), j: askJn, price: fmt(map[askKey].price) }).replace(/\u00A0/g, ' ');
    h += '<a class="ask ask-all" href="' + esc(C.zalo) + '" target="_blank" rel="noopener" data-zalo-combo data-msg="' + esc(askMsg) + '">' + icon('chat') + '<span>' + t('combo.askAll') + '</span></a>';
    h += founderBandHtml();
    h += renderSoloBox();
    document.getElementById('slot-combos').innerHTML = h;
  }

  // Khối chọn ngày cho flycam, đèn, Founder ở gói Hai ngày. Mỗi lựa chọn hiện đúng số tiền sẽ cộng thêm.
  function dayOptionsHtml(id) {
    var vals = id === 'light' ? [['one', 'day1'], ['both', 'day2']] : [['engagement', 'engagement'], ['reception', 'reception'], ['both', 'two']];
    var cur = BZ.dayPick(id, state), nm = id + 'Days';
    var save = id === 'founder' ? '' : ' <span class="hint">' + t('x.hint.save', { s: fmt(BZ.bothDays(id).saving) }) + '</span>';
    var h = '<div class="xsub"><div class="tt">' + t('x.' + id + '.sets') + save + '</div><div class="seg" role="radiogroup" aria-label="' + esc(t('x.' + id + '.sets')) + '">';
    vals.forEach(function (v) {
      var st = {};
      for (var k in state) st[k] = state[k];
      st[nm] = v[0];
      var amount = BZ.extraCost(id, st).amount;
      h += '<label><input type="radio" name="' + nm + '" value="' + v[0] + '"' + (cur === v[0] ? ' checked' : '') + '><span>' + t('x.opt.' + v[1], { x: fmt(amount) }) + (v[0] === 'both' && id !== 'founder' ? '<em class="off10">-10%</em>' : '') + '</span></label>';
    });
    h += '</div></div>';
    return h;
  }

  var XMORE = { drone: true, photo24: true }; // dịch vụ có câu mô tả thứ hai
  var XICON = { founder: 'user', drone: 'plane', light: 'bulb', photo24: 'clock', sameday: 'clap' };

  function renderExtras() {
    var h = '<div class="xrows">';
    P.extrasOrder.forEach(function (id) {
      if (!extraAllowed(id)) return;
      var c = BZ.extraCost(id, state);
      var on = !!state.extras[id];
      var diff = c.founder && c.founder.discounted ? '<span class="dd">' + founderNote(c.founder) + '</span>' : ''; // chỉ ghi chú (*) khi đặt combo
      // Điện thoại: hiện câu đầu, phần còn lại (câu thứ hai, ghi chú giá Founder) ẩn sau nút "Chi tiết".
      var rest = (XMORE[id] ? '<span class="dd">' + BZ.lines(t('x.' + id + '.d2')) + '</span>' : '') + diff;
      var open = !!uiOpen['x-' + id];
      h += '<label class="xrow' + (on ? ' on' : '') + '"><input type="checkbox" data-extra="' + id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="box">' + icon('check') + '</span>' +
        '<span class="ico40">' + icon(XICON[id] || 'check') + '</span>' +
        '<span class="xtxt' + (open ? ' more-open' : '') + '"><span class="tt">' + t('x.' + id + '.t') + '</span><span class="dd">' + BZ.lines(t('x.' + id + '.d')) + '</span>' +
        (rest ? '<span class="xrest">' + rest + '</span><button type="button" class="more-btn xmore" data-more="x-' + id + '" aria-expanded="' + open + '"><span>' + t('x.more') + '</span><i></i></button>' : '') + '</span>' +
        '<span class="pp">+' + fmt(c.amount) + (c.was ? '<s>' + fmt(c.was) + '</s>' : '') + '<small>' + cap(t(c.unitKey)) + '</small></span></label>';
      if (id === 'photo24' && on && state.journey === 'twoday') {
        var setPrice = P.extras.photo24.flat;
        h += '<div class="xsub"><div class="tt">' + t('x.photo24.sets') + '</div><div class="seg" role="radiogroup" aria-label="' + esc(t('x.photo24.sets')) + '">' +
          '<label><input type="radio" name="photo24Sets" value="1"' + (state.photo24Sets === 1 ? ' checked' : '') + '><span>' + t('x.photo24.opt1', { x: fmt(setPrice) }) + '</span></label>' +
          '<label><input type="radio" name="photo24Sets" value="2"' + (state.photo24Sets === 2 ? ' checked' : '') + '><span>' + t('x.photo24.opt2', { x: fmt(setPrice * 2) }) + '</span></label>' +
          '</div></div>';
      }
      if ((id === 'drone' || id === 'light' || id === 'founder') && on && state.journey === 'twoday') {
        h += dayOptionsHtml(id);
      }
      if (id === 'drone' && on) {
        h += '<label class="xrow sub' + (state.permit ? ' on' : '') + '"><input type="checkbox" data-permit' + (state.permit ? ' checked' : '') + '>' +
          '<span class="box">' + icon('check') + '</span>' +
          '<span><span class="tt">' + t('x.permit.t') + '</span><span class="dd">' + t('x.permit.d') + '</span></span>' +
          '<span class="pp">+' + fmt(P.extras.drone.permit) + '</span></label>';
      }
    });
    h += '</div>';
    document.getElementById('slot-extras').innerHTML = h;
  }

  function renderWhere() {
    var h = '<div class="kicker">' + t('where.kicker') + '</div><h3>' + t('where.title') + '</h3><p class="muted" style="margin-bottom:14px">' + t('where.sub') + '</p>';
    h += '<div class="seg" role="radiogroup" aria-label="' + esc(t('where.title')) + '">';
    P.travel.forEach(function (r) {
      h += '<label><input type="radio" name="travel" value="' + r.key + '"' + (state.travel === r.key ? ' checked' : '') + '><span>' + distLabel(r.key) + '</span></label>';
    });
    h += '</div>';
    var note;
    if (!state.travel) note = t('where.none');
    else {
      var row = P.travel.filter(function (r) { return r.key === state.travel; })[0];
      note = row.fee === 0 ? t('where.free') : t('where.fee', { fee: fmt(row.fee) });
    }
    h += '<div class="note">' + icon('info') + '<span>' + note + '</span></div>';
    document.getElementById('slot-where').innerHTML = h;
  }

  function journeyName() {
    return t('j.' + state.journey + '.name') + (state.journey === 'single' ? ' · ' + t('v.' + state.variant) : '');
  }

  // Dòng chi tiết dưới giá, ví dụ "2.000.000đ × 2 bộ ảnh".
  function detailText(d) {
    if (d.k === 'times') return t('det.times', { u: fmt(d.u) });
    if (d.k === 'times10') return t('det.times10', { u: fmt(d.u) });
    if (d.k === 'was') return t('det.was', { w: fmt(d.was), p: d.pct });
    if (d.k === 'sameday') return t('det.sameday', { t: fmt(d.total), e: fmt(d.edit) });
    return t('det.sum10', { a: fmt(d.a), b: fmt(d.b) });
  }

  function renderEstimate() {
    var r = BZ.calc(state);
    var pl = peopleLine(r.combo, state.journey);
    var solo = isSolo();
    var now = new Date();
    var today = ('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear();
    var h = '<div class="print-head"><div class="ph-brand"><span class="chip">BEE Z</span> Wedding Film</div>' +
      '<div class="ph-title">' + t('print.title') + '</div>' +
      '<div class="ph-meta">' + t('print.date') + ' ' + today + ' · ' + esc(C.phone) + ' · ' + esc(C.email) + '</div></div>';
    h += '<div class="receipt">';
    var title = solo
      ? t(state.soloKind === 'photo' ? 'line.soloPhoto' : 'line.soloVideo', { j: journeyName() })
      : t('line.combo', { j: t('j.' + state.journey + '.name'), tier: tierLabel() });
    h += '<div class="rl"><div class="l"><b>' + title + '</b><small>' + pl.head + ': ' + pl.mix + '</small>' +
      (solo ? (r.saving > 0 ? '<span class="pill save">' + t('line.save2', { x: fmt(r.saving) }) + '</span>' : '') : '<span class="pill save">' + t('line.save', { x: fmt(r.comboSaving) }) + '</span>') +
      '</div><div class="r">' + fmt(r.comboPrice) + '</div></div>';
    // Mọi dòng cùng một khuôn với dòng combo: tên đậm, một dòng nhỏ, thẻ tiết kiệm (nếu có), giá ở bên phải.
    var cap = function (x) { return x ? x.charAt(0).toUpperCase() + x.slice(1) : x; };
    r.extrasLines.forEach(function (l) {
      var sub = l.detail && l.detail.k === 'times' ? detailText(l.detail)
        : l.id === 'sameday' ? t('x.sameday.sub')
        : l.id === 'photo24' && !l.detail ? t('x.photo24.sub')
        : l.days ? t('x.pick.' + l.days) : l.unitKey ? t(l.unitKey) : '';
      var pill = l.was && l.was > l.amount ? '<span class="pill save">' + t('line.saveWas', { x: fmt(l.was - l.amount), w: fmt(l.was) }) + '</span>' : '';
      h += '<div class="rl"><div class="l"><b>' + t('x.' + l.id + '.t') + '</b>' + (sub ? '<small>' + cap(sub) + '</small>' : '') + pill + '</div><div class="r">' + fmt(l.amount) + '</div></div>';
    });
    if (r.travelRow) {
      var sub2 = r.travelRow.fee === 0 ? distLabel(r.travelRow.key) : t('line.travelSub', { d: distLabel(r.travelRow.key), f: fmt(r.travelRow.fee), n: r.people, days: r.days, pw: t(r.people === 1 ? 'unit.person' : 'unit.people'), dw: t(r.days === 1 ? 'unit.day' : 'unit.days') });
      h += '<div class="rl"><div class="l"><b>' + t('line.travelTitle') + '</b><small>' + sub2 + '</small></div><div class="r">' + fmt(r.travelTotal) + '</div></div>';
    } else {
      h += '<div class="rl"><div class="l"><b>' + t('line.travelTitle') + '</b><small>' + t('line.travelNoneSub') + '</small></div><div class="r">—</div></div>';
    }
    h += '<div class="rtotal"><div class="l">' + t('total.label') + '</div><div class="r">' + fmt(r.total) + '</div></div>';
    if (!r.travelRow) h += '<div class="warn">' + t('total.noTravel') + '</div>';
    h += '</div>';
    h += '<div class="estimate-extra">' + (solo ? nudgeHtml() : '') +
      '<div class="terms' + (uiOpen.terms ? ' more-open' : '') + '"><h3><button type="button" class="more-btn" data-more="terms" aria-expanded="' + !!uiOpen.terms + '"><span>' + t('terms.title') + '</span><i></i></button></h3><div class="terms-body"><ul>';
    for (var i = 1; i <= 5; i++) h += '<li>' + icon('info') + '<span>' + t('terms.' + i, { x: fmt(500000) }) + '</span></li>';
    h += '</ul><a class="link" href="index.html#faq">' + t('terms.full') + '</a></div></div>' +
      '<div class="note">' + t('est.note') + '</div>' +
      '<div class="pdf"><button type="button" class="link" id="print-btn">' + t('est.pdf') + '</button></div></div>';
    document.getElementById('slot-estimate').innerHTML = h;
  }

  function renderSummary() {
    var r = BZ.calc(state);
    var pl = peopleLine(r.combo, state.journey);
    // Mỗi tên dịch vụ thêm một thẻ riêng có mã, để hiệu ứng (motion.js) biết dòng nào vừa thêm.
    var names = r.extrasLines.map(function (l) { return '<span class="xn" data-x="' + esc(l.id) + '">' + esc(t('x.' + l.id + '.t')) + '</span>'; });
    var travel = r.travelRow ? fmt(r.travelTotal) : t('sum.none');
    var h = '<h2>' + t('sum.title') + '</h2>' +
      '<div class="sline"><span class="k">' + t('sum.journey') + '</span><span class="v">' + (state.journey === 'single' ? t('v.' + state.variant) : journeyName()) + '</span></div>' +
      '<div class="sline stack"><div class="row"><span class="k">' + t(isSolo() ? 'sum.soloLabel' : 'sum.combo') + '</span><span class="v">' + tierLabel() + '</span></div>' +
      '<div class="sub">' + pl.head + ': ' + pl.mix + '</div><div class="amt">' + fmt(r.comboPrice) + '</div></div>' +
      '<div class="sline"><span class="k">' + t('sum.extras') + '</span><span class="v">' + (names.length ? names.join('<br>') : t('sum.none')) + (r.extrasTotal ? '<span class="amt">' + fmt(r.extrasTotal) + '</span>' : '') + '</span></div>' +
      '<div class="sline"><span class="k">' + t('sum.travel') + '</span><span class="v">' + (r.travelRow ? '<span class="amt">' + travel + '</span>' : travel) + '</span></div>' +
      '<div class="stotal"><div class="l">' + t('total.label') + '</div><div class="r">' + fmt(r.total) + '</div></div>' +
      '<a class="btn btn-primary" href="#s5">' + t('sum.send') + '</a>' +
      '<div class="help">' + t('sum.help') + ' <a href="' + esc(C.zalo) + '" target="_blank" rel="noopener">Zalo ' + esc(C.phone) + '</a></div>';
    document.getElementById('summary').innerHTML = h;
    var barLabel = t('bar.total') + ' · ' + t('j.' + state.journey + '.name') + ' · ';
    document.getElementById('bar').innerHTML = '<div class="bl"><div class="l">' + esc(barLabel) + '<span class="bt">' + esc(tierLabel()) + '</span></div><div class="r">' + fmt(r.total) + '</div>' +
      (r.travelRow ? '' : '<div class="bn">' + t('bar.noTravel') + '</div>') + '</div>' +
      '<a class="btn btn-primary" href="#s2" data-bar-next>' + t('bar.next') + '</a>';
    updateBar();
    // Báo cho motion.js: tổng mới + các dịch vụ thêm đang chọn (để chạy số, trượt dòng mới vào).
    document.dispatchEvent(new CustomEvent('bz:summary', { detail: { total: r.total, extras: r.extrasLines.map(function (l) { return l.id; }) } }));
  }

  function renderAll() {
    applyConstraints();
    var a = document.activeElement;
    var key = null;
    if (a && a.matches && a.matches('input, button, select')) {
      key = { tag: a.tagName, name: a.getAttribute('name'), value: a.getAttribute('value'), extra: a.getAttribute('data-extra'), permit: a.hasAttribute('data-permit'), tier: a.getAttribute('data-tier'), fb: a.hasAttribute('data-founder-toggle'), id: a.id };
    }
    renderJourney(); renderCombos(); renderExtras(); renderWhere(); renderEstimate(); renderSummary(); renderTrust();
    if (key) {
      var sel = key.id ? '#' + key.id :
        key.extra ? '[data-extra="' + key.extra + '"]' :
        key.permit ? '[data-permit]' :
        key.fb ? '[data-founder-toggle]' :
        key.tier ? '[data-tier="' + key.tier + '"]' :
        key.tag === 'INPUT' && key.name ? 'input[name="' + key.name + '"][value="' + key.value + '"]' : null;
      var el = sel ? document.querySelector(sel) : null;
      if (el) el.focus({ preventScroll: true });
    }
  }

  /* ---------- Gửi yêu cầu ---------- */
  var form = document.getElementById('quote-form');

  // Mỗi ô lỗi gắn câu báo lỗi (aria-describedby, aria-invalid); dòng tóm tắt trên nút gửi cho mọi người, kể cả người dùng phần mềm đọc màn hình.
  function updateFormSummary() {
    var sum = document.getElementById('form-summary');
    if (!sum) return;
    var labels = Array.prototype.map.call(form.querySelectorAll('.field.bad label:first-child'), function (l) { return l.textContent.replace(/\s*\(.*\)\s*$/, '').trim(); });
    var n = labels.length;
    sum.textContent = n ? t(n === 1 && BZ.lang() === 'en' ? 'err.sumOne' : 'err.sum', { n: n, list: labels.join(', ') }) : '';
    sum.classList.toggle('on', n > 0);
  }

  function validate() {
    var bad = [];
    function mark(name, ok) {
      var f = form.querySelector('[data-field="' + name + '"]');
      if (f) {
        f.classList.toggle('bad', !ok);
        var inp = f.querySelector('input:not([type="checkbox"])'), err = f.querySelector('.err');
        if (err) err.id = 'err-' + name;
        if (inp) {
          if (ok) { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
          else {
            inp.setAttribute('aria-invalid', 'true');
            inp.setAttribute('aria-describedby', 'err-' + name);
          }
        }
      }
      if (!ok) bad.push(name);
    }
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    mark('name', v('name').length > 0);
    var digits = v('phone').replace(/\D/g, '');
    mark('phone', digits.length >= 9 && digits.length <= 12);
    mark('date', form.elements.dateTbd.checked || v('date').length > 0); // địa điểm không bắt buộc
    mark('email', v('email') === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')));
    updateFormSummary();
    if (bad.length) {
      var first = form.querySelector('[data-field="' + bad[0] + '"] input');
      if (first) first.focus();
    }
    return bad.length === 0;
  }

  function buildPayload() {
    var r = BZ.calc(state);
    var solo = isSolo();
    var journeyName = vi('j.' + state.journey + '.name') + (state.journey === 'single' ? ' (' + vi('v.' + state.variant) + ')' : '');
    var comboName = solo
      ? (state.soloKind === 'photo' ? 'Đặt lẻ: chỉ chụp' : 'Đặt lẻ: chỉ quay')
      : vi('tier.' + state.tier);
    var perDay = state.journey === 'twoday' ? ' mỗi ngày' : '';
    var crew = solo
      ? r.people + ' nhân sự: ' + r.people + (state.soloKind === 'photo' ? ' chụp ảnh' : ' quay phim') + perDay
      : r.people + ' nhân sự: ' + r.combo.photo + ' chụp ảnh, ' + r.combo.video + ' quay phim' + perDay;
    var extras = r.extrasLines.map(function (l) { return vi('x.' + l.id + '.t') + ': ' + money(l.amount) + (l.days ? ' (' + vi('x.pick.' + l.days) + ')' : l.unitKey ? ' (' + vi(l.unitKey) + ')' : ''); });
    var travelLabel = r.travelRow
      ? vi('d.' + r.travelRow.key) + ' · ' + money(r.travelRow.fee) + ' × ' + r.people + ' nhân sự × ' + r.days + ' ngày'
      : 'Chưa chọn khoảng cách';
    return {
      submittedAt: new Date().toISOString(),
      uiLang: BZ.lang(),
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      weddingDate: form.elements.dateTbd.checked ? 'Chưa chốt ngày' : form.elements.date.value,
      dateTbd: form.elements.dateTbd.checked,
      venue: form.elements.venue.value.trim(),
      notes: form.elements.notes.value.trim(),
      journey: journeyName,
      combo: comboName,
      crew: crew,
      extras: extras.join(' | '),
      travel: travelLabel,
      comboPrice: r.comboPrice,
      soloPrice: r.solo,
      saving: r.saving,
      extrasTotal: r.extrasTotal,
      travelTotal: r.travelTotal,
      total: r.total,
      note: 'Ước tính, cần xác nhận báo giá chốt.' + (solo ? ' Khách chọn ĐẶT LẺ, nên gợi ý combo khi liên hệ.' : ''),
      website: form.elements.website.value
    };
  }

  // Gói toàn bộ lựa chọn thành một tin nhắn dễ đọc — hiện ở Portal → Yêu cầu và trong mail báo.
  function leadMessage(p) {
    var dong = [
      'YÊU CẦU BÁO GIÁ CƯỚI (từ beezvn.com/bang-gia-psc)',
      'Ngày cưới: ' + p.weddingDate,
      'Địa điểm: ' + p.venue,
      'Lịch quay chụp: ' + p.journey,
      'Combo: ' + p.combo,
      'Nhân sự: ' + p.crew,
      'Dịch vụ thêm: ' + (p.extras || 'không'),
      'Công tác phí: ' + p.travel,
      'Giá combo: ' + money(p.comboPrice) + (p.saving > 0 ? ' (nếu đặt riêng ' + money(p.soloPrice) + ', tiết kiệm ' + money(p.saving) + ')' : ''),
      'Tổng dịch vụ thêm: ' + money(p.extrasTotal),
      'Tổng công tác phí: ' + money(p.travelTotal),
      'TẠM TÍNH: ' + money(p.total),
      'Ghi chú của khách: ' + (p.notes || 'không'),
      'Ngôn ngữ khách xem: ' + (p.uiLang || 'vi'),
      '— ' + p.note
    ];
    return dong.join('\n');
  }

  function goConfirm(payload, demo) {
    try { sessionStorage.setItem('bz-last', JSON.stringify({ payload: payload, state: state, demo: demo })); } catch (e) {}
    location.href = 'xac-nhan.html';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('sent-err').classList.remove('show');
    if (!validate()) return;
    var payload = buildPayload();
    if (!C.endpoint) { goConfirm(payload, true); return; } // chạy thử, chưa nối Google Sheet
    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.classList.add('is-sending');
    btn.firstChild.textContent = t('form.sending');
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    // Cùng tên miền nên đọc được kết quả thật: máy chủ từ chối thì báo lỗi cho khách gửi lại,
    // không bao giờ báo "đã gửi" khi Bee Z chưa nhận được.
    fetch(C.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        service: C.serviceId,
        message: leadMessage(payload),
        website: payload.website
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      clearTimeout(timer);
      // Đã nhận: hiện dấu tích trên nút một nhịp rồi mới sang trang cảm ơn (không có hiệu ứng thì sang ngay).
      btn.classList.remove('is-sending');
      btn.classList.add('is-done');
      setTimeout(function () { goConfirm(payload, false); }, document.documentElement.classList.contains('mo') ? 650 : 0);
    }).catch(function () {
      clearTimeout(timer);
      btn.disabled = false;
      btn.classList.remove('is-sending');
      btn.firstChild.textContent = t('form.submit');
      document.getElementById('sent-err').classList.add('show');
    });
  });

  Array.prototype.forEach.call(form.querySelectorAll('input'), function (i) {
    i.addEventListener('input', function () {
      var f = i.closest('.field');
      if (f) { f.classList.remove('bad'); i.removeAttribute('aria-invalid'); }
      updateFormSummary();
    });
  });

  /* ---------- Sự kiện chung ---------- */
  // Điện thoại: bấm dấu để mở hoặc gấp phần sản phẩm của combo, điều khoản và mô tả dịch vụ thêm (máy tính luôn hiện đủ).
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-more]');
    if (!b) return;
    var box = b.closest('.combo, .terms, .xtxt');
    if (!box) return;
    var open = !box.classList.contains('more-open');
    box.classList.toggle('more-open', open);
    b.setAttribute('aria-expanded', String(open));
    uiOpen[b.getAttribute('data-more')] = open;
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.matches) return;
    if (el.name === 'journey') { state.journey = el.value; renderAll(); }
    else if (el.name === 'variant') { state.variant = el.value; renderAll(); }
    else if (el.name === 'travel') { state.travel = el.value; renderAll(); }
    else if (el.name === 'soloKind') {
      state.mode = 'solo'; state.soloKind = el.value; soloOpen = true;
      state.soloN = Math.min(state.soloN, P.soloMax[el.value]);
      renderAll();
    }
    else if (el.name === 'soloN') { state.soloN = Number(el.value); renderAll(); }
    else if (/^(drone|light|founder)Days$/.test(el.name)) { state[el.name] = el.value; want[el.name] = el.value; renderAll(); }
    else if (el.name === 'photo24Sets') { state.photo24Sets = Number(el.value); want.photo24Sets = state.photo24Sets; renderAll(); }
    else if (el.hasAttribute('data-extra')) {
      state.extras[el.getAttribute('data-extra')] = el.checked;
      want.extras[el.getAttribute('data-extra')] = el.checked;
      renderAll();
    } else if (el.hasAttribute('data-permit')) { state.permit = el.checked; want.permit = el.checked; renderAll(); }
    else if (el.name === 'dateTbd') {
      var de = document.getElementById('f-date');
      de.disabled = el.checked;
      if (el.checked) { de.value = ''; de.classList.remove('has-value'); }
      var df = el.closest('.field'); if (df) { df.classList.remove('bad'); de.removeAttribute('aria-invalid'); }
      updateFormSummary();
    } else if (el.name === 'date') { el.classList.toggle('has-value', !!el.value); }
  });

  document.addEventListener('click', function (e) {
    var sm = e.target.closest ? e.target.closest('.solo-box > summary') : null;
    if (sm) { // mở / đóng khung đặt riêng, chưa đổi cách đặt cho tới khi khách chọn một dòng
      e.preventDefault();
      var d = sm.parentNode;
      d.open = !d.open;
      soloOpen = d.open;
      return;
    }
    var card = e.target.closest ? e.target.closest('.combo[data-card-tier]') : null;
    if (card && !e.target.closest('button, a, summary') && window.matchMedia('(max-width: 720px)').matches) { // điện thoại: chạm cả thẻ để chọn combo
      state.mode = 'combo'; state.tier = card.getAttribute('data-card-tier'); want.tier = state.tier; renderAll();
      return;
    }
    var el = e.target.closest ? e.target.closest('button, a') : null;
    if (!el) return;
    if (el.hasAttribute('data-zalo-combo')) { // chép sẵn lời nhắn, khách chỉ cần dán vào Zalo
      try { navigator.clipboard.writeText(el.getAttribute('data-msg')); el.querySelector('span').textContent = t('combo.asked'); } catch (err) {}
      return;
    }
    if (el.hasAttribute('data-founder-toggle')) { state.extras.founder = !state.extras.founder; want.extras.founder = state.extras.founder; renderAll(); }
    else if (el.hasAttribute('data-tier')) { state.mode = 'combo'; state.tier = el.getAttribute('data-tier'); want.tier = state.tier; renderAll(); }
    else if (el.hasAttribute('data-combo-back')) { state.mode = 'combo'; renderAll(); }
    else if (el.hasAttribute('data-nudge-tier')) {
      state.mode = 'combo';
      state.tier = el.getAttribute('data-nudge-tier');
      want.tier = state.tier;
      renderAll();
      document.getElementById('s2').scrollIntoView({ behavior: 'smooth' });
    }
    else if (el.id === 'print-btn') {
      // Mở sẵn mục điều khoản để có trong bản in.
      Array.prototype.forEach.call(document.querySelectorAll('#slot-estimate details'), function (d) { d.open = true; });
      document.body.classList.add('print-estimate');
      window.print();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.matches && e.target.matches('.combo[data-card-tier]') ? e.target : null;
    if (!card) return;
    e.preventDefault();
    state.mode = 'combo'; state.tier = card.getAttribute('data-card-tier'); want.tier = state.tier; renderAll();
  });

  window.addEventListener('afterprint', function () { document.body.classList.remove('print-estimate'); });

  // Thanh dưới cùng: nút đổi theo bước đang xem (Tiếp tục tới bước kế, ở bước 04 mời điền thông tin gửi).
  function updateBar() {
    var a = document.querySelector('#bar [data-bar-next]');
    if (!a) return;
    var nx = { s1: ['#s2', 'bar.next'], s2: ['#s3', 'bar.next'], s3: ['#s4', 'bar.next'], s4: ['#s5', 'bar.details'], s5: ['#s5', 'bar.details'] }[curStep];
    a.setAttribute('href', nx[0]);
    var txt = t(nx[1]);
    if (a.textContent !== txt) a.textContent = txt;
  }

  // Ô "Ngại điền form? Nhắn Zalo" cạnh nút gửi.
  function renderTrust() {
    var a = document.getElementById('zalo-alt');
    if (!a) return;
    a.setAttribute('href', C.zalo);
    a.textContent = t('f.zaloAlt', { phone: C.phone });
  }

  /* ---------- Thanh bước: sáng bước đang xem ---------- */
  function updateStepper() {
    var ids = ['s1', 's2', 's3', 's4', 's5'];
    var cur = 's1';
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 190) cur = id;
    });
    Array.prototype.forEach.call(document.querySelectorAll('#stepper a'), function (a) {
      var on = a.getAttribute('data-step') === cur;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      a.setAttribute('aria-label', t('step.aria', { n: a.getAttribute('data-step').slice(1), name: t('st.' + a.getAttribute('data-step').slice(1)) }));
    });
    curStep = cur;
    updateBar();
    // Điện thoại: khi form gửi đã hiện thì ẩn thanh tổng tiền dưới cùng (form có nút gửi riêng, thanh sẽ che mất nút).
    var f = document.getElementById('s5');
    if (f) document.body.classList.toggle('in-form', f.getBoundingClientRect().top < window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', updateStepper, { passive: true });

  /* ---------- Khởi động ---------- */
  BZ.init(function () {
    var j = BZ.param('journey');
    if (JOURNEYS.indexOf(j) > -1) state.journey = j;
    var d = document.getElementById('f-date');
    var now = new Date();
    d.min = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    document.body.classList.add('has-bar');
    renderAll();
    updateStepper();
    document.addEventListener('bz:lang', renderAll);
    if (JOURNEYS.indexOf(j) > -1) { // đã chọn lịch ở trang chủ: đưa khách thẳng tới bước chọn combo (cuộn lại sau khi phông tải xong để không lệch)
      var moved = false;
      ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true }); });
      var go = function () { if (!moved) { document.getElementById('s2').scrollIntoView({ block: 'start', behavior: 'instant' }); updateStepper(); } };
      setTimeout(go, 60);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, 50); });
      window.addEventListener('load', function () { setTimeout(go, 50); }, { once: true });
    }
  });
}());
