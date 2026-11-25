/*
 * DỮ LIỆU DUY NHẤT của web báo giá cưới Bee Z Film.
 * Đổi giá ở đây là mọi trang tự cập nhật. Nguồn: "Bảng giá cưới.md".
 * Phần CONFIG: thông tin liên hệ và địa chỉ nhận yêu cầu (Google Apps Script).
 * Phần PRICES: toàn bộ giá. Phần T: toàn bộ chữ hiển thị (tiếng Việt / tiếng Anh).
 */
(function (g) {
  var BZ = (g.BZ = g.BZ || {});

  BZ.CONFIG = {
    // Gửi thẳng vào web beezvn.com, cùng chỗ với form ở trang Liên hệ: yêu cầu hiện trong
    // Portal → Yêu cầu, và Bee Z nhận mail báo. Đường dẫn tuyệt đối vì trang nằm ở /bang-gia-psc/.
    // Để trống = chế độ chạy thử: yêu cầu KHÔNG được gửi đi đâu cả.
    endpoint: '/api/contact/inquiry',
    // Mã dịch vụ "Quay Phim & Chụp Ảnh Cưới" trên web — để Portal gắn nhãn dịch vụ cho yêu cầu.
    serviceId: '6a1ea667007f17532cb7917d',
    phone: '0967 33 55 77',
    phoneHref: 'tel:0967335577',
    zalo: 'https://zalo.me/0967335577',
    email: 'BeeZ.fw@gmail.com',
    facebook: 'https://facebook.com/BeeZFilm',
    portfolioUrl: 'https://www.beezvn.com/service/quay-phim-chup-anh-cuoi',
    company: 'CÔNG TY TNHH BEE Z PRODUCTION',
    taxId: '0110989139',
    address: '54 ngõ 250 Khương Trung, Khương Đình, Hà Nội'
  };

  // Đơn vị: đồng.
  BZ.PRICES = {

    // Đặt riêng, 1 người. Quay phim đã gồm dựng 1 clip (quay 5/6/8 triệu + dựng 2,5 triệu).
    solo: {
      photo: { engagement: 4000000, reception: 5000000, fullday: 6000000 },
      video: { engagement: 7500000, reception: 8500000, fullday: 10500000 }
    },
    extraCameraEdit: 1000000, // thêm 1 máy quay vào cùng một phim

    // Đơn giá quay gốc (chưa dựng) và công dựng 1 clip, dùng để tính đặt riêng nhiều người quay.
    raw: { video: { engagement: 5000000, reception: 6000000, fullday: 8000000 }, edit: 2500000 },
    // Số người tối đa khi khách chọn đặt riêng (khớp số người trong các combo).
    soloMax: { photo: 3, video: 2 },
    retouchPerPhoto: 50000,

    tiers: ['essential', 'complete', 'grand'],

    // Combo gợi ý chỉ khai báo số nhân sự (photo = người chụp, video = người quay, mỗi buổi).
    // price (giá combo) và solo (giá nếu đặt lẻ) được TÍNH bằng công thức ở cuối phần PRICES (BZ.pkg).
    journeys: {
      fullday: {
        days: 1, unit: 'day', popular: 'complete',
        combos: {
          essential: { photo: 1, video: 1 },
          complete: { photo: 2, video: 1 },
          grand: { photo: 3, video: 2 }
        }
      },
      twoday: {
        days: 2, unit: 'session', popular: 'complete',
        combos: {
          essential: { photo: 1, video: 1 },
          complete: { photo: 2, video: 1 },
          grand: { photo: 2, video: 2 }
        }
      },
      single: {
        days: 1, unit: 'session', popular: 'complete',
        // Chỉ một buổi: chọn ăn hỏi hoặc tiệc cưới, mỗi buổi có hai gói Đủ đầy và Trọn vẹn.
        variants: {
          engagement: { combos: { essential: { photo: 1, video: 1 }, complete: { photo: 2, video: 1 } } },
          reception: { combos: { essential: { photo: 1, video: 1 }, complete: { photo: 2, video: 1 } } }
        }
      }
    },

    // session = giá theo buổi, day = giá theo ngày, flat = giá cố định. Founder và flycam: theo loại buổi.
    extras: {
      founder: { engagement: 8000000, reception: 10000000, fullday: 12000000 }, // 4 giờ / 7 giờ / 10 giờ
      // Flycam theo loại buổi: ăn hỏi / tiệc / trọn ngày. Gói Hai ngày: chọn 1 ngày hoặc cả hai (cả hai giảm 10%).
      drone: { engagement: 4000000, reception: 6000000, fullday: 8000000, permit: 4000000 },
      light: { perTime: 2000000 }, // mỗi lần (ăn hỏi, tiệc hoặc trọn ngày); Hai ngày: chọn 1 ngày hoặc cả hai (giảm 10%)
      photo24: { flat: 2000000 },
      // Giao phim phóng sự cưới trong 24 giờ: giá 6.000.000đ, đã có sẵn 2.500.000đ công dựng trong gói nên cộng thêm 3.500.000đ.
      sameday: { flat: 3500000 }
    },
    extrasOrder: ['founder', 'drone', 'light', 'photo24', 'sameday'],

    // Công tác phí: mỗi người, mỗi ngày làm việc, theo quãng đường một chiều từ trung tâm Hà Nội.
    travel: [
      { key: 'lt25', fee: 0 },
      { key: 'd25', fee: 300000 },
      { key: 'd100', fee: 500000 },
      { key: 'd200', fee: 700000 },
      { key: 'd300', fee: 1000000 }
    ]
  };

  /* ---------- Tính giá ---------- */
  //
  // Công thức (bảng giá chuẩn của Hằng, 29/10/2026):
  //  - Giá lẻ = chụp + quay (theo bảng từng loại buổi) + dựng 2.500.000 mỗi video + 1.000.000 cho mỗi máy quay thêm vào cùng phim.
  //  - Giảm chỉ tính trên chụp + quay (và Founder): combo quay + chụp HOẶC book 2 ngày = 10%; đủ cả hai điều kiện = 15%.
  //  - Không giảm: dựng, máy quay thêm, giao ảnh 24h, giao phim 24h, giấy phép flycam, công tác phí.
  //  - Flycam, đèn chỉ giảm 10% ở lựa chọn "cả 2 ngày".
  //  - Mọi số làm tròn đến 50.000đ.

  BZ.round50 = function (x) { return Math.round(x / 50000) * 50000; };

  // Các buổi của một lịch quay chụp: trọn ngày = 1 buổi (10 giờ), hai ngày = ăn hỏi + tiệc cưới, một buổi = ăn hỏi hoặc tiệc cưới.
  BZ.sessionsOf = function (jid, variant) {
    return jid === 'fullday' ? ['fullday'] : jid === 'twoday' ? ['engagement', 'reception'] : [variant];
  };

  // Mức giảm: một điều kiện (combo quay + chụp, hoặc 2 ngày) = 10%; đủ cả hai = 15%; không có = 0.
  BZ.discountRate = function (jid, hasBoth) {
    var n = (hasBoth ? 1 : 0) + (jid === 'twoday' ? 1 : 0);
    return n === 0 ? 0 : n === 1 ? 0.10 : 0.15;
  };

  // Một gói chụp / quay. hasBoth = gói có cả chụp lẫn quay.
  // Trả về từng khoản để hiển thị: chup, quay, dung, extraCam, rate, discount, price (đã giảm), solo (giá lẻ, chưa giảm).
  BZ.pkg = function (jid, variant, photoN, videoN, hasBoth) {
    var P = BZ.PRICES, sessions = BZ.sessionsOf(jid, variant);
    var chup = 0, quay = 0;
    sessions.forEach(function (k) { chup += photoN * P.solo.photo[k]; quay += videoN * P.raw.video[k]; });
    var cams = videoN * sessions.length;
    var dung = videoN > 0 ? P.raw.edit : 0;
    var extraCam = cams > 1 ? (cams - 1) * P.extraCameraEdit : 0;
    var rate = BZ.discountRate(jid, hasBoth);
    var discount = BZ.round50((chup + quay) * rate);
    return {
      chup: chup, quay: quay, dung: dung, extraCam: extraCam, rate: rate, discount: discount,
      price: chup + quay - discount + dung + extraCam,
      solo: chup + quay + dung + extraCam
    };
  };

  // Giá của một dịch vụ thêm theo lựa chọn hiện tại (state: journey, variant, permit, photo24Sets, droneDays, lightDays, founderDays).
  //  - Founder THAY MỘT NGƯỜI QUAY trong team (số người không đổi): chỉ tính phần chênh giữa giá Founder
  //    và giá quay thường của người bị thay, rồi giảm theo mức giảm của đơn (combo 10%, combo hai ngày 15%).
  //  - Giao ảnh 24 giờ: 1 bộ cho 1 ngày; gói Hai ngày được chọn 1 bộ hoặc 2 bộ.
  //  - Flycam, đèn (gói Hai ngày): chọn 1 ngày hoặc cả hai; cả hai giảm 10%.
  BZ.extraCost = function (id, state) {
    var P = BZ.PRICES, R = P.raw;
    var jid = state.journey, e = P.extras[id];
    var amount, unitKey, founder = null, detail = null, was = null;
    if (id === 'founder') {
      if (jid === 'fullday') {
        founder = { gross: e.fullday, replaced: R.video.fullday }; unitKey = 'u.day1';
      } else if (jid === 'twoday') {
        var fp = BZ.dayPick('founder', state);
        if (fp === 'engagement') founder = { gross: e.engagement, replaced: R.video.engagement };
        else if (fp === 'reception') founder = { gross: e.reception, replaced: R.video.reception };
        else founder = { gross: e.engagement + e.reception, replaced: R.video.engagement + R.video.reception };
        unitKey = 'x.pick.' + fp; // Chỉ ăn hỏi, Chỉ tiệc cưới, Cả 02 ngày
      } else {
        founder = { gross: e[state.variant], replaced: R.video[state.variant] }; unitKey = 'u.session1';
      }
      var diff = founder.gross - founder.replaced;
      var inCombo = state.mode !== 'solo';
      var rate = BZ.discountRate(jid, inCombo);
      var cut = BZ.round50(diff * rate);
      amount = diff - cut;
      if (cut) { was = diff; detail = { k: 'was', was: diff, pct: Math.round(rate * 100) }; }
      if (inCombo) {
        var base = BZ.getCombo(state);
        founder.discounted = true;
        founder.soloF = base.solo + diff;      // giá lẻ khi có Founder
        founder.priceF = base.price + amount;  // giá combo có Founder
      }
    } else if (id === 'photo24') {
      var sets = jid === 'twoday' && state.photo24Sets === 2 ? 2 : 1;
      amount = e.flat * sets; unitKey = sets === 2 ? 'u.sets2' : 'u.set1';
      if (sets === 2) detail = { k: 'times', u: e.flat };
    } else if (id === 'drone' || id === 'light') {
      var one = function (day) { return id === 'drone' ? e[day] : e.perTime; };
      if (jid === 'fullday') { amount = one('fullday'); unitKey = 'u.day1'; }
      else if (jid === 'single') { amount = one(state.variant); unitKey = 'u.session1'; }
      else {
        var pick = BZ.dayPick(id, state);
        if (pick === 'both') {
          var bd = BZ.bothDays(id);
          amount = bd.price; was = bd.gross; unitKey = id === 'light' ? 'u.days2' : 'x.pick.both';
          detail = id === 'drone' ? { k: 'sum10', a: e.engagement, b: e.reception } : { k: 'times10', u: e.perTime };
        } else {
          amount = one(pick); unitKey = id === 'light' ? 'u.day1' : 'x.pick.' + pick;
        }
      }
    } else if (id === 'sameday') {
      amount = e.flat; unitKey = 'u.clip1';
      detail = { k: 'sameday', total: e.flat + R.edit, edit: R.edit };
    } else {
      amount = e.flat; unitKey = 'u.clip1';
    }
    var permitAmount = id === 'drone' && state.permit ? e.permit : 0;
    return { amount: amount, permit: permitAmount, unitKey: unitKey, founder: founder, detail: detail, was: was };
  };

  // Flycam và đèn của gói Hai ngày, chọn cả hai ngày: cộng hai buổi rồi giảm 10%.
  BZ.bothDays = function (id) {
    var e = BZ.PRICES.extras[id];
    var gross = id === 'drone' ? e.engagement + e.reception : 2 * e.perTime;
    var price = gross - BZ.round50(gross * 0.10);
    return { gross: gross, price: price, saving: gross - price };
  };
  BZ.droneBoth = function () { return BZ.bothDays('drone'); };
  // Ngày khách chọn (mặc định cả hai ngày).
  BZ.dayPick = function (id, state) {
    var v = state[id + 'Days'];
    if (id === 'light') return v === 'one' ? 'one' : 'both'; // đèn: 1 ngày hoặc 2 ngày
    return v === 'engagement' || v === 'reception' ? v : 'both'; // flycam, Founder: ăn hỏi, tiệc cưới, cả 2 ngày
  };

  // Các gói của một lịch quay chụp (Chỉ một buổi: theo buổi đã chọn).
  BZ.combosOf = function (jid, variant) {
    var J = BZ.PRICES.journeys[jid];
    return jid === 'single' ? J.variants[variant].combos : J.combos;
  };
  BZ.getCombo = function (state) {
    var m = BZ.combosOf(state.journey, state.variant);
    return m[state.tier] || m.complete;
  };

  // Giá đặt riêng chỉ chụp hoặc chỉ quay, n người (mỗi buổi / mỗi ngày). Quay phim đã gồm dựng 1 video.
  // Chỉ gói Hai ngày được giảm 10% (điều kiện "book 2 ngày"); một ngày thì giữ giá lẻ.
  BZ.soloPrice = function (kind, n, journeyId, variant) {
    return BZ.pkg(journeyId, variant, kind === 'photo' ? n : 0, kind === 'video' ? n : 0, false).price;
  };
  BZ.soloPriceFull = function (kind, n, journeyId, variant) {
    return BZ.pkg(journeyId, variant, kind === 'photo' ? n : 0, kind === 'video' ? n : 0, false).solo;
  };

  // Khi khách đang chọn đặt riêng: combo nào thêm phần còn lại với giá rẻ, để gợi ý chuyển sang combo.
  BZ.nudge = function (state) {
    if (state.mode !== 'solo') return null;
    var combos = BZ.combosOf(state.journey, state.variant);
    var kind = state.soloKind, n = state.soloN;
    var price = BZ.soloPrice(kind, n, state.journey, state.variant);
    var pick = null, key = null;
    Object.keys(combos).forEach(function (k) {
      var c = combos[k];
      if (!pick && c[kind] === n) { pick = c; key = k; }
    });
    if (!pick) return null;
    return { tierKey: key, combo: pick, delta: pick.price - price, saving: pick.solo - pick.price, kind: kind, soloPrice: price };
  };

  // state: { mode:'combo'|'solo', journey, variant, tier, soloKind, soloN, extras:{id:true}, permit, travel: key | null }
  BZ.calc = function (state) {
    var P = BZ.PRICES;
    var J = P.journeys[state.journey];
    var combo;
    if (state.mode === 'solo') {
      var kd = state.soloKind, n = state.soloN;
      var pk = BZ.pkg(state.journey, state.variant, kd === 'photo' ? n : 0, kd === 'video' ? n : 0, false);
      combo = { price: pk.price, solo: pk.solo, photo: kd === 'photo' ? n : 0, video: kd === 'video' ? n : 0, isSolo: true };
    } else {
      combo = BZ.getCombo(state);
    }
    var people = combo.photo + combo.video;
    var extrasLines = [];
    var extrasTotal = 0;
    P.extrasOrder.forEach(function (id) {
      if (!state.extras[id]) return;
      var c = BZ.extraCost(id, state);
      extrasLines.push({ id: id, amount: c.amount, unitKey: c.unitKey, founder: c.founder, detail: c.detail, was: c.was, days: (id === 'drone' || id === 'light' || id === 'founder') && state.journey === 'twoday' ? BZ.dayPick(id, state) : null });
      extrasTotal += c.amount;
      if (c.permit) {
        extrasLines.push({ id: 'permit', amount: c.permit, unitKey: null });
        extrasTotal += c.permit;
      }
    });
    var soloTotal = combo.solo, founderCombo = null;
    extrasLines.forEach(function (l) {
      if (l.founder && l.founder.discounted) { founderCombo = l.founder; soloTotal = l.founder.soloF; }
    });
    var travelRow = null;
    P.travel.forEach(function (r) { if (r.key === state.travel) travelRow = r; });
    var travelTotal = travelRow ? travelRow.fee * people * J.days : 0;
    return {
      combo: combo,
      people: people,
      days: J.days,
      comboPrice: combo.price,
      solo: soloTotal,
      comboSaving: combo.solo - combo.price, // chỉ phần tiết kiệm của combo, Founder đã có thẻ tiết kiệm riêng
      saving: soloTotal - (founderCombo ? founderCombo.priceF : combo.price),
      extrasLines: extrasLines,
      extrasTotal: extrasTotal,
      travelRow: travelRow,
      travelTotal: travelTotal,
      total: combo.price + extrasTotal + travelTotal
    };
  };

  // Điền giá combo (price) và giá đặt lẻ (solo) cho từng combo từ công thức; parts = các khoản cộng lại.
  (function () {
    var P = BZ.PRICES;
    Object.keys(P.journeys).forEach(function (jid) {
      var J = P.journeys[jid];
      var fillAll = function (map, variant) {
        Object.keys(map).forEach(function (t) {
          var c = map[t], k = BZ.pkg(jid, variant, c.photo, c.video, true);
          c.price = k.price; c.solo = k.solo; c.parts = k;
        });
      };
      if (J.combos) fillAll(J.combos);
      else Object.keys(J.variants).forEach(function (v) { fillAll(J.variants[v].combos, v); });
    });
  }());

  // Giá "từ" (thấp nhất) của một hành trình.
  BZ.fromPrice = function (journeyId) {
    var J = BZ.PRICES.journeys[journeyId], list = [];
    var add = function (map) { Object.keys(map).forEach(function (k) { list.push(map[k].price); }); };
    if (J.combos) add(J.combos); else Object.keys(J.variants).forEach(function (v) { add(J.variants[v].combos); });
    return Math.min.apply(null, list);
  };

  /* ---------- Chữ hiển thị (vi / en) ---------- */
  var T = {
    'nav.pricing': { vi: 'Bảng giá', en: 'Pricing' },
    'nav.products': { vi: 'Sản phẩm', en: 'Our work' },
    'nav.contact': { vi: 'Liên hệ', en: 'Contact' },
    'cta.quote': { vi: 'Nhận báo giá', en: "Request a quote" },
    'brand.tag': { vi: 'Wedding Film', en: 'Wedding Film' },
    'footer.blurb': { vi: 'Gói ghém cả câu chuyện tình\nvào một thước phim hạnh phúc.', en: 'Your whole love story,\nwrapped in one happy reel.' },
    'footer.contact': { vi: 'Liên hệ nhanh', en: "Quick contact" },
    'footer.legal': { vi: 'Pháp nhân xuất hóa đơn', en: 'Invoicing entity' },
    'footer.zalo': { vi: 'Nhắn Zalo', en: 'Message on Zalo' },

    /* ----- Trang chủ ----- */
    'hero.eyebrow': { vi: 'Ăn hỏi · Đón dâu · Tiệc cưới', en: "Engagement · Bridal procession · Reception" },
    'hero.h1': { vi: "Thiết kế gói quay chụp cưới, nắm chi phí trong 2 phút", en: "Design your wedding photo and film package, know your costs in 2 minutes" },
    'hero.sub': { vi: "Tiết kiệm đến 15% khi chọn combo.", en: "Save up to 15% with a bundle." },
    'hero.start': { vi: 'Bắt đầu ước tính', en: 'Start your estimate' },
    'hero.products': { vi: 'Xem sản phẩm của Bee Z', en: "See Bee Z's work" },

    'j.kicker': { vi: "Ba cách ghi lại ngày cưới", en: "Three ways to capture your wedding" },
    'j.h2': { vi: 'Chọn lịch quay chụp của bạn', en: "Choose your coverage" },
    'j.sub': { vi: "Chọn theo số buổi bạn cần ghi lại.", en: "Pick the sessions you need covered." },
    'j.from': { vi: 'Từ', en: 'From' },
    'j.choose': { vi: 'Chọn lịch này', en: 'Choose' },
    'j.fullday.name': { vi: 'Trọn một ngày', en: 'Full day' },
    'j.fullday.meta': { vi: '01 ngày cưới', en: 'One wedding day' },
    'j.fullday.desc': { vi: "Từ lúc chuẩn bị hoặc đón dâu tới khi tan tiệc (tối đa 10 giờ).", en: "From getting ready or the bridal procession to the end of the reception (up to 10 hours)." },
    'j.twoday.name': { vi: 'Hai ngày', en: 'Two days' },
    'j.twoday.meta': { vi: '2 buổi riêng', en: "2 separate sessions" },
    'j.twoday.desc': { vi: "Ăn hỏi (tối đa 4 giờ) và tiệc cưới (tối đa 7 giờ). Hai ngày không cần liền nhau, được dựng thành 1 bộ phim chung.", en: "Engagement ceremony (up to 4 hours) and wedding reception (up to 7 hours). The two days need not be consecutive; they are edited into one film." },
    'j.single.name': { vi: 'Chỉ một buổi', en: 'A single session' },
    'j.single.meta': { vi: 'Tối đa 4 hoặc 7 giờ', en: 'Up to 4 or 7 hours' },
    'j.single.desc': { vi: "Chỉ ăn hỏi (tối đa 4 giờ) hoặc chỉ tiệc cưới (tối đa 7 giờ), chọn gói Đủ đầy hoặc Trọn vẹn.", en: "Just the engagement (up to 4 hours) or just the wedding reception (up to 7 hours), in the Essential or Complete bundle." },

    'inc.kicker': { vi: "Có trong mọi combo", en: "In every bundle" },
    'inc.h2': { vi: "Sản phẩm bạn nhận về", en: "What you receive" },
    'inc.sub': { vi: "Mọi combo đều có đủ ảnh, phim, nhạc và thời gian giao rõ ràng.", en: "Every bundle includes photos, film, music and clear delivery times." },
    'inc.1.c': { vi: 'Giao sản phẩm', en: 'Delivery' },
    'inc.1.b': { vi: '07', en: '7' },
    'inc.1.u': { vi: 'ngày', en: 'days' },
    'inc.2.c': { vi: 'Ảnh', en: 'Photos' },
    'inc.2.b': { vi: '200', en: '200' },
    'inc.2.u': { vi: 'ảnh', en: 'photos' },
    'inc.3.c': { vi: 'Phim', en: 'Film' },
    'inc.3.b': { vi: '4–5', en: '4–5' },
    'inc.3.u': { vi: 'phút', en: 'min' },
    'inc.4.c': { vi: 'Nhạc', en: 'Music' },
    'inc.4.b': { vi: 'Bản quyền', en: 'Licensed' },
    'inc.1.t': { vi: 'Toàn bộ ảnh gốc', en: 'All original photos' },
    'inc.1.d': { vi: "Ảnh giao trong 07 ngày kể từ ngày chụp, phim trong 14 ngày kể từ ngày quay.", en: "Photos within 7 days of the shoot, film within 14 days of filming." },
    'inc.2.t': { vi: 'Ảnh đẹp nhất đã chỉnh màu, làm da', en: 'Best photos, colour-graded and retouched' },
    'inc.2.d': { vi: "Ít nhất 200 ảnh đẹp nhất mỗi bộ, đã chỉnh màu, kèm toàn bộ ảnh gốc, không lọc bớt.", en: "At least 200 best photos per set, colour-graded, with all the original files and nothing filtered out." },
    'inc.3.t': { vi: 'Phim cưới 4K dài 4–5 phút', en: '4K wedding film, 4–5 minutes' },
    'inc.3.d': { vi: 'Phim phóng sự 4K, đã gồm dựng, 03 lần chỉnh sửa miễn phí.', en: 'A 4K documentary-style film, editing included, with 3 free revisions.' },
    'inc.4.t': { vi: 'Nhạc có bản quyền', en: 'Licensed music' },
    'inc.4.d': { vi: 'Nhạc nền chọn từ thư viện có bản quyền của team.', en: "Background music selected from our licensed music library." },

    'solo.kicker': { vi: 'Tùy biến theo nhu cầu', en: "Flexible options" },
    'solo.h2': { vi: 'Chỉ cần chụp hoặc chỉ cần quay?', en: "Photography only or videography only?" },
    'solo.sub': { vi: "Giá cho 1 nhân sự, đặt lẻ.", en: "Prices are per person, booked separately." },
    'solo.nudge': { vi: 'Đặt combo để tiết kiệm đến 15%', en: "Book a bundle to save up to 15%" },
    'combo.more': { vi: 'Xem sản phẩm bạn nhận về', en: "What you receive" },
    'solo.nudge.link': { vi: 'Xem gói combo', en: "See bundles" },
    'solo.col.item': { vi: 'Hạng mục', en: 'Item' },
    'solo.col.engagement': { vi: 'Ăn hỏi (tối đa 4 giờ)', en: 'Engagement (up to 4 hours)' },
    'solo.col.reception': { vi: "Tiệc cưới (tối đa 7 giờ)", en: "Wedding reception (up to 7 hours)" },
    'solo.col.fullday': { vi: 'Trọn ngày (tối đa 10 giờ)', en: 'Full day (up to 10 hours)' },
    'solo.photo': { vi: 'Chụp ảnh', en: 'Photography' },
    'solo.video': { vi: "Quay phim (đã gồm dựng 1 video)", en: "Videography (includes editing one video)" },
    'solo.legend': { vi: '(*) Số gạch ngang là giá khi đặt lẻ cả chụp và quay.', en: "(*) Prices in VND. Struck-through figures are the prices if booked separately." },
    'solo.combo': { vi: 'Cả hai', en: "Both" },

    'why.kicker': { vi: 'Vì sao chọn Bee Z', en: 'Why Bee Z' },
    'why.h2': { vi: "Bốn điều giúp bạn yên tâm", en: "Four things that put you at ease" },
    'why.1.t': { vi: 'Trả toàn bộ ảnh gốc, không lọc bớt', en: 'Every original photo, nothing filtered out' },
    'why.1.d': { vi: 'Mọi khoảnh khắc đều thuộc về bạn: bạn nhận toàn bộ ảnh gốc, kèm bộ ảnh đẹp nhất đã chỉnh màu.', en: "Every moment belongs to you: you receive all the original photos, plus a best-of set that is colour-graded." },
    'why.2.t': { vi: "Giá minh bạch, ghi rõ trong hợp đồng", en: "Transparent pricing, written in the contract" },
    'why.2.d': { vi: "Bảng giá niêm yết từng hạng mục. Công tác phí của team được thống nhất trước khi ký hợp đồng.", en: "Every item is priced and listed. The crew allowance is agreed before you sign." },
    'why.3.t': { vi: "Ảnh tự nhiên, ít sắp đặt", en: "Natural photos, little staging" },
    'why.3.d': { vi: "Hạn chế tối đa sự sắp đặt gượng gạo, team Bee Z ẩn mình để bắt trọn những khoảnh khắc tự nhiên, những cái đan tay nhẹ nhàng hay ánh mắt xúc động của hai bạn và gia đình.", en: "Minimising forced poses, the Bee Z crew blends into the background to capture organic moments, subtle touches, and emotional glances between you and your loved ones." },
    'why.4.t': { vi: "Tông màu cinematic", en: "Cinematic colour" },
    'why.4.d': { vi: "Định hình màu sắc theo phong cách điện ảnh cao cấp, cá nhân hóa theo câu chuyện của từng cặp đôi, với mong muốn màu phim vẫn sang trọng và bền qua năm tháng.", en: "Colour is shaped in a premium cinematic style and personalised to each couple's story, so the film stays elegant and timeless through the years." },
    'founder.kicker': { vi: 'Founder trực tiếp cầm máy', en: 'The founder films personally' },
    'founder.name': { vi: 'Hoàn Nguyễn', en: 'Hoàn Nguyễn' },
    'founder.text': { vi: "Founder của Bee Z Wedding Film. Hoàn không đứng ngoài chỉ đạo mà trực tiếp quay và điều phối cả team, để từng khoảnh khắc quan trọng trong ngày cưới của bạn được giữ lại trọn vẹn.", en: "Founder of Bee Z Wedding Film. Hoan films in person and leads the whole crew rather than directing from the sidelines, so every important moment of your wedding day is preserved." },
    'founder.stat': { vi: "10 năm", en: "10 years" },
    'founder.stat.l': { vi: "kinh nghiệm", en: "of experience" },
    'founder.link': { vi: 'Thêm Founder vào gói của bạn', en: "Add the Founder Package to your booking" },

    'faq.t1': { vi: "Đặt lịch và thanh toán", en: "Booking and payment" },
    'faq.t2': { vi: "Phim và ảnh", en: "Film and photos" },
    'faq.t3': { vi: "Team và ngày quay", en: "Crew and the day" },
    'faq.8.q': { vi: "Ngại ống kính thì Bee Z hướng dẫn thế nào?", en: "What if I feel awkward in front of the camera?" },
    'faq.8.a': { vi: "Bạn không cần lo lắng. Team Bee Z thiên về bắt khoảnh khắc tự nhiên (candid), trò chuyện để bạn thoải mái và gợi ý những chuyển động nhẹ nhàng thay vì bắt tạo dáng gượng gạo.", en: "There is nothing to worry about. The Bee Z wedding team focuses on natural, candid moments, chats with you so you feel at ease, and guides gentle movements instead of forcing stiff poses." },
    'faq.9.q': { vi: "Sản phẩm bàn giao cuối cùng gồm những gì?", en: "What exactly do I receive at the end?" },
    'faq.9.a': { vi: "Bạn nhận toàn bộ ảnh gốc, kèm mỗi bộ ảnh có ít nhất 200 ảnh đẹp nhất đã chỉnh màu, và 01 phim phóng sự 4K dài 4–5 phút. Ảnh giao trong 07 ngày kể từ ngày chụp, phim trong 14 ngày kể từ ngày quay.", en: "You receive all the original photos, plus a best-of set of at least 200 colour-graded photos per set and one 4K wedding film of 4–5 minutes. Photos are delivered within 7 days of the shoot, the film within 14 days of filming." },
    'faq.10.q': { vi: "Nếu ngày cưới kéo dài quá giờ thì tính thế nào?", en: "What if the wedding runs over time?" },
    'faq.10.a': { vi: "Quá giờ tính +500.000₫ mỗi giờ cho mỗi nhân sự. Bắt đầu trước 6h00 tính +500.000₫ mỗi nhân sự mỗi ngày. Mức này ghi rõ trong hợp đồng, không có chi phí ẩn.", en: "Overtime is +VND 500,000 per hour per person. Starting before 6:00 a.m. is +VND 500,000 per person per day. These rates are written in the contract, with no hidden costs." },
    'faq.kicker': { vi: 'Minh bạch điều khoản', en: 'Clear terms' },
    'faq.h2': { vi: 'Câu hỏi thường gặp', en: 'Frequently asked questions' },
    'faq.sub': { vi: "Về đặt lịch, thanh toán, đổi lịch và sản phẩm.", en: "About booking, payment, rescheduling and what you receive." },
    'faq.1.q': { vi: 'Đặt cọc và thanh toán như thế nào?', en: 'How do the deposit and payment work?' },
    'faq.1.a': { vi: "Bạn đặt cọc 30% để giữ lịch (lịch chỉ được giữ sau khi đã đặt cọc), thanh toán 30% sau ngày làm việc cuối cùng và 40% còn lại sau khi nhận sản phẩm hoàn thiện.", en: "Pay a 30% deposit to secure your date (your date is only held once the deposit is received). A further 30% is due after the final shooting day, and the remaining 40% after you receive your finished photos and film." },
    'faq.2.q': { vi: 'Tôi có thể đổi ngày hoặc hủy không?', en: 'Can I reschedule or cancel?' },
    'faq.2.a': { vi: "Đổi lịch báo trước 14 ngày là miễn phí. Báo muộn hơn, Bee Z thu 20% số tiền đã đặt cọc. Nếu hủy, tiền đặt cọc không được hoàn lại. Gặp thời tiết xấu hoặc sự cố ngoài ý muốn, bạn được đổi lịch miễn phí 01 lần; chi phí đã phát sinh (thuê thiết bị, di chuyển) vẫn tính.", en: "Rescheduling with at least 14 days' notice is free. With shorter notice, Bee Z charges 20% of the deposit. If you cancel, the deposit is non-refundable. In case of bad weather or unforeseen events, you may reschedule once for free; costs already incurred (equipment hire, travel) still apply." },
    'faq.3.q': { vi: 'Tôi được chỉnh sửa bao nhiêu lần?', en: 'How many revisions do I get?' },
    'faq.3.a': { vi: '03 lần chỉnh sửa miễn phí cho mỗi sản phẩm. Từ lần thứ tư, Bee Z báo giá riêng.', en: "3 free revisions per deliverable. From the 4th revision, Bee Z will quote separately." },
    'faq.4.q': { vi: "Công tác phí của team được tính thế nào?", en: "How is the crew allowance calculated?" },
    'faq.4.a': { vi: "Đám cưới ở xa sẽ có công tác phí của team, tính theo quãng đường (miễn phí dưới 25 km). Công tác phí chưa bao gồm chi phí di chuyển, ăn và chỗ nghỉ cho team; hai bên trao đổi cụ thể trước khi ký hợp đồng.", en: "Weddings more than 25 km from central Hanoi carry a crew allowance based on distance. The allowance does not cover transport, meals or accommodation for the crew; we agree on these details before you sign." },
    'faq.5.q': { vi: 'File gốc được lưu bao lâu?', en: 'How long are the original files stored?' },
    'faq.5.a': { vi: 'File gốc được giữ trên máy chủ 30 ngày sau khi bàn giao. Nếu cần giữ lâu hơn, hãy báo trước cho Bee Z.', en: "Original files are kept on our server for 30 days after delivery. If you need them stored for longer, please let Bee Z know in advance." },
    'faq.6.q': { vi: "Nên đặt lịch trước bao lâu?", en: "How far in advance should I book?" },
    'faq.6.a': { vi: "Nên đặt trước 3–5 tháng, nhất là ngày cuối tuần và ngày đẹp trong mùa cưới. Các ngày khác, bạn liên hệ sớm để Bee Z kiểm tra lịch team.", en: "Book 3–5 months ahead, especially for weekends and auspicious dates in the wedding season. For other dates, contact us early so Bee Z can check the crew's availability." },
    'faq.7.q': { vi: "Phim phóng sự khác gì phim truyền thống?", en: "How is a wedding film different from a traditional wedding video?" },
    'faq.7.a': { vi: "Phim phóng sự ngắn (4–5 phút) tập trung vào các khoảnh khắc tự nhiên, cảm xúc và góc nhìn cô đọng. Phim truyền thống thì ghi hình dài và theo trình tự dàn dựng sẵn.", en: "A short documentary-style wedding film (4–5 minutes) focuses on natural moments, emotion and a condensed point of view. A traditional wedding video, by contrast, records the whole event at length in a staged sequence." },
    'cta2.kicker': { vi: 'Sẵn sàng lưu giữ ngày trọng đại?', en: "Ready to preserve your big day?" },
    'cta2.h2': { vi: 'Nhận bảng ước tính chi tiết\ncho đám cưới của bạn', en: 'Get a detailed estimate\nfor your wedding' },
    'cta2.sub': { vi: "Chọn lịch quay chụp, combo và dịch vụ thêm. Tổng chi phí tạm tính hiện ngay trên trang.", en: "Choose your coverage, bundle and extras. Your estimated total appears instantly on the page." },
    'cta2.zalo': { vi: 'Nhắn Zalo trực tiếp', en: 'Chat on Zalo' },

    /* ----- Trang báo giá ----- */
    'b.kicker': { vi: 'Tự chọn gói và xem giá ngay', en: "Build your package and see the price instantly" },
    'b.h1': { vi: 'Tạo ước tính chi phí ngày cưới', en: 'Build your wedding estimate' },
    'b.lead': { vi: 'Tổng chi phí rõ ràng ngay khi bạn chọn lịch quay chụp, combo và dịch vụ thêm.', en: "See a clear total as you choose your coverage, bundle and extras." },
    'st.1': { vi: 'Lịch quay chụp', en: 'Coverage' },
    'st.2': { vi: 'Combo', en: 'Bundle' },
    'st.3': { vi: 'Dịch vụ thêm', en: 'Extras' },
    'st.4': { vi: 'Ước tính', en: 'Estimate' },
    'st.5': { vi: 'Gửi', en: 'Send' },
    's1.title': { vi: 'Lịch quay chụp', en: 'Your coverage' },
    's1.sub': { vi: 'Bạn cần ghi lại những buổi nào?', en: 'Which sessions do you need covered?' },
    'v.engagement': { vi: 'Ăn hỏi (tối đa 4 giờ)', en: 'Engagement (up to 4 hours)' },
    'v.reception': { vi: "Tiệc cưới (tối đa 7 giờ)", en: "Wedding reception (up to 7 hours)" },
    's2.title': { vi: 'Combo ngày cưới', en: "Your wedding bundle" },
    's2.sub': { vi: "Chọn số nhân sự trong team theo quy mô ngày cưới của bạn.", en: "Choose the crew size that fits the scale of your wedding." },
    'tier.essential': { vi: 'Đủ đầy', en: 'Essential' },
    'tier.complete': { vi: 'Trọn vẹn', en: 'Complete' },
    'tier.grand': { vi: 'Viên mãn', en: 'Grand' },
    'tag.essential': { vi: "Tinh gọn mà đủ đầy", en: "Streamlined, yet complete" },
    'tag.complete': { vi: "Cả ngày cưới trọn vẹn, trong từng khung hình", en: "Your whole wedding day, in every frame" },
    'tag.complete.single': { vi: "Trọn buổi lễ, trong từng khung hình", en: "The whole ceremony, frame by frame" },
    'tag.grand': { vi: "Từng cảm xúc, từng góc nhìn, đều được giữ lại", en: "Every emotion, every angle, preserved" },
    'badge.popular': { vi: 'Được chọn nhiều nhất', en: 'Most popular' },
    'pill.save': { vi: 'Tiết kiệm {x}', en: 'You save {x}' },
    'combo.solo': { vi: 'Đặt lẻ', en: 'Separately' },
    'combo.people': { vi: "{n} nhân sự", en: '{n} people' },
    'combo.peopleDay': { vi: "{n} nhân sự mỗi ngày", en: '{n} people per day' },
    'combo.mix': { vi: "{p} chụp ảnh, {v} quay phim", en: "{p} on photo, {v} on video" },
    'combo.b1': { vi: "Ảnh: {n} bộ ảnh{d} (của 1 nhân sự chụp trong 1 buổi) gồm ít nhất 200 ảnh đẹp nhất đã chỉnh màu, cùng toàn bộ ảnh gốc.", en: "Photos: {n} photo set{d}, shot by 1 photographer in 1 session, with at least 200 colour-graded best photos plus all original files." },
    'combo.b1n': { vi: "Ảnh: {n} bộ ảnh{d} (mỗi bộ của 1 nhân sự chụp trong 1 buổi), mỗi bộ gồm ít nhất 200 ảnh đẹp nhất đã chỉnh màu, cùng toàn bộ ảnh gốc.", en: "Photos: {n} photo sets{d}, each shot by 1 photographer in 1 session, each with at least 200 colour-graded best photos plus all original files." },
    'combo.perDay': { vi: ' mỗi ngày', en: ' per day' },
    'combo.b2': { vi: "Phim: 01 phim phóng sự chất lượng 4K, thời lượng 4–5 phút.", en: "Film: one 4K wedding film, 4–5 minutes long." },
    'combo.b3two': { vi: 'Hai ngày được dựng thành 1 bộ phim chung.', en: 'Both days are edited into one film.' },
    'combo.b3cam': { vi: 'Nhiều góc quay trong cùng một phim.', en: 'Several camera angles in the same film.' },
    'btn.choose': { vi: 'Chọn combo {name}', en: 'Choose {name}' },
    'btn.selected': { vi: 'Đã chọn', en: 'Selected' },
    'inc.toggle': { vi: 'Mọi combo đều gồm gì?', en: "What does every bundle include?" },
    'solo.open': { vi: 'Chỉ cần chụp hoặc chỉ cần quay?', en: "Need photography only or videography only?" },
    'sb.note': { vi: "Giá theo từng nhân sự.", en: "Prices are per person." },
    'sb.photo': { vi: 'Chỉ chụp ảnh', en: 'Photography only' },
    'sb.video': { vi: 'Chỉ quay phim (đã gồm dựng)', en: "Videography only (editing included)" },
    'sb.count': { vi: "Số nhân sự", en: "Number of crew members" },
    'sb.persons': { vi: "{n} nhân sự", en: "{n} people" },
    'sb.person1': { vi: "01 nhân sự", en: "1 person" },
    'unit.person': { vi: "nhân sự", en: "person" },
    'unit.people': { vi: "nhân sự", en: "people" },
    'unit.day': { vi: "ngày", en: "day" },
    'unit.days': { vi: "ngày", en: "days" },
    'sb.back': { vi: 'Quay lại chọn combo', en: "Back to bundles" },
    'sb.viewing': { vi: 'Bạn đang xem giá đặt lẻ. Chọn một combo để tiết kiệm.', en: "You are viewing individual pricing. Choose a bundle to save." },
    'nudge.photo': { vi: 'Thêm quay phim, chỉ +{x}', en: "Add video for just +{x}" },
    'nudge.video': { vi: 'Thêm chụp ảnh, chỉ +{x}', en: "Add photography for just +{x}" },
    'nudge.body': { vi: 'Combo {tier} ({mix}) giá {price}, tiết kiệm {save} so với đặt lẻ cả hai.', en: "The {tier} bundle ({mix}) costs {price}, saving {save} compared with booking both separately." },
    'nudge.btn': { vi: 'Chọn combo {tier}', en: 'Choose {tier}' },
    'nudge.generic': { vi: 'Đặt combo chụp + quay để tiết kiệm đến 15%.', en: "Book a photo + video bundle and save up to 15%." },
    'line.soloPhoto': { vi: 'Chỉ chụp ảnh · {j}', en: 'Photography only · {j}' },
    'line.soloVideo': { vi: 'Chỉ quay phim · {j}', en: 'Videography only · {j}' },
    'combo.mixDay': { vi: "{p} chụp ảnh, {v} quay phim", en: "{p} on photo, {v} on video" },
    'combo.mixPhotoDay': { vi: "{n} chụp ảnh mỗi ngày", en: "{n} on photo per day" },
    'combo.mixVideoDay': { vi: "{n} quay phim mỗi ngày", en: "{n} on video per day" },
    'combo.mixPhoto': { vi: "{n} chụp ảnh", en: "{n} on photo" },
    'combo.mixVideo': { vi: "{n} quay phim", en: "{n} on video" },
    'sum.soloLabel': { vi: 'Đặt lẻ', en: "Individual" },
    'sb.photoS': { vi: 'Chỉ chụp', en: 'Photo only' },
    'sb.videoS': { vi: 'Chỉ quay', en: 'Video only' },
    's3.title': { vi: 'Thêm cho trọn vẹn', en: "Add to your package" },
    's3.sub': { vi: "Chọn khoảng cách tới địa điểm cưới và các dịch vụ bạn cần. Bỏ chọn là giá tự trừ đi.", en: "Choose the distance to your venue and the services you need. Untick any and the price adjusts automatically." },
    'fb.title': { vi: 'Muốn Founder trực tiếp quay?', en: "Would you like the Founder to film personally?" },
    'fb.body': { vi: "Hoàn Nguyễn, 10 năm kinh nghiệm, trực tiếp quay phim đồng thời điều phối cả team.", en: "Hoàn Nguyễn, with 10 years of experience, films in person while leading the whole crew." },
    'fb.price': { vi: "Combo {tier} có Founder: {price}.", en: "The {tier} bundle with the Founder: {price}." },
    'fb.add': { vi: 'Founder Package +{x}', en: 'Founder Package +{x}' },
    'fb.added': { vi: 'Đã thêm Founder', en: 'Founder added' },
    'x.founder.t': { vi: "Founder Package", en: "Founder Package" },
    'x.founder.d': { vi: "Hoàn Nguyễn, 10 năm kinh nghiệm, trực tiếp quay phim đồng thời điều phối cả team.", en: "Hoàn Nguyễn, with 10 years of experience, films in person while leading the whole crew." },
    'x.founder.diff': { vi: "Founder {a} thay nhân sự quay phim thường {b}, chỉ cộng phần chênh.", en: "Founder {a} replaces a regular videographer {b}; only the difference is added." },
    'x.founder.diffCombo': { vi: "Vẫn được hưởng giá ưu đãi khi đặt combo. Số nhân sự trong combo không đổi.", en: "You keep the bundle discount. The crew size in the bundle stays the same." },
    'x.photo24.sets': { vi: 'Giao ảnh 24 giờ cho:', en: "24-hour photo delivery for:" },
    'x.photo24.opt1': { vi: '1 bộ · +{x}', en: '1 set · +{x}' },
    'x.photo24.opt2': { vi: '2 bộ · +{x}', en: '2 sets · +{x}' },
    'u.sets2': { vi: '2 bộ ảnh', en: '2 photo sets' },
    'x.drone.t': { vi: 'Flycam', en: 'Drone' },
    'x.drone.d': { vi: "Những khung hình toàn cảnh từ trên cao, cho thấy trọn vẹn không gian ngày cưới.", en: "Sweeping aerial shots that show the whole setting of your wedding day." },
    'x.drone.d2': { vi: "Team kiểm tra vùng bay trước và báo bạn nếu địa điểm cần xin phép bay.", en: "Our crew checks the flight zone in advance and tells you if the venue needs flight approval." },
    'x.drone.sets': { vi: "Bay flycam cho:", en: "Drone coverage for:" },
    'x.light.sets': { vi: "Dùng đèn cho:", en: "Lighting for:" },
    'x.hint.save': { vi: "Chọn 2 ngày để tiết kiệm {s}", en: "Choose both days and save {s}" },
    'x.founder.sets': { vi: "Founder quay cho:", en: "Founder films for:" },
    'x.opt.engagement': { vi: "Chỉ ăn hỏi · +{x}", en: "Engagement · +{x}" },
    'x.opt.reception': { vi: "Chỉ tiệc cưới · +{x}", en: "Reception · +{x}" },
    'x.opt.two': { vi: "Cả 2 ngày · +{x}", en: "Both days · +{x}" },
    'x.opt.day1': { vi: "1 ngày · +{x}", en: "1 day · +{x}" },
    'x.opt.day2': { vi: "2 ngày · +{x}", en: "2 days · +{x}" },
    'x.pick.engagement': { vi: "chỉ ăn hỏi", en: "engagement only" },
    'x.pick.reception': { vi: "chỉ tiệc cưới", en: "reception only" },
    'x.pick.both': { vi: "cả 2 ngày", en: "both days" },
    'x.pick.one': { vi: "1 ngày", en: "1 day" },
    'det.times': { vi: "{u} × 2 bộ ảnh", en: "{u} × 2 photo sets" },
    'det.times10': { vi: "{u} × 2 ngày, giảm 10%", en: "{u} × 2 days, 10% off" },
    'det.sum10': { vi: "{a} + {b}, giảm 10%", en: "{a} + {b}, 10% off" },
    'det.was': { vi: "Giá gốc {w}, giảm {p}%", en: "List price {w}, {p}% off" },
    'det.sameday': { vi: "{t} trừ {e} công dựng đã có trong gói", en: "{t} minus {e} for editing already included in your package" },
    'line.save2': { vi: "Đã tiết kiệm {x}", en: "You save {x}" },
    'line.travelTitle': { vi: "Công tác phí của team", en: "Crew allowance" },
    'line.travelSub': { vi: "{d}: {f} × {n} {pw} × {days} {dw}", en: "{d}: {f} × {n} {pw} × {days} {dw}" },
    'line.travelNoneSub': { vi: "Chưa chọn khoảng cách", en: "Distance not selected" },
    'line.saveWas': { vi: "Đã tiết kiệm {x}", en: "You save {x}" },
    'x.permit.t': { vi: 'Giấy phép bay flycam', en: 'Drone flight permit' },
    'x.permit.d': { vi: 'Chỉ cần khi địa điểm yêu cầu xin phép bay.', en: "Needed only if the venue requires drone flight approval." },
    'x.light.t': { vi: 'Bộ 02 đèn × 500W', en: "Lighting set (2 × 500W)" },
    'x.light.d': { vi: 'Hỗ trợ ánh sáng khi quay chụp ở không gian thiếu sáng.', en: "Extra lighting for dimly lit venues." },
    'x.photo24.t': { vi: 'Giao ảnh trong 24 giờ', en: "24-hour photo delivery" },
    'x.photo24.sub': { vi: "1 bộ ảnh gồm ít nhất 200 ảnh đẹp nhất đã chỉnh màu", en: "1 photo set with at least 200 best photos, colour-graded" },
    'x.photo24.d': { vi: 'Nhận trọn bộ ảnh trong 24 giờ thay vì 07 ngày.', en: "Receive your full photo set within 24 hours instead of 7 days." },
    'x.photo24.d2': { vi: '01 bộ ảnh được chụp bởi 01 nhân sự trong 01 ngày.', en: "One photo set is shot by one photographer in one day." },
    'x.more': { vi: 'Chi tiết', en: "Details" },
    'x.sameday.t': { vi: "Giao phim trong 24 giờ", en: "24-hour film delivery" },
    'x.sameday.sub': { vi: "01 phim phóng sự chất lượng 4K, thời lượng 4–5 phút", en: "One 4K wedding film, 4–5 minutes long" },
    'x.sameday.d': { vi: "Nhận phim phóng sự trong 24 giờ thay vì 14 ngày.", en: "Receive your wedding film within 24 hours instead of 14 days." },
    'u.day1': { vi: '1 ngày', en: '1 day' },
    'u.session1': { vi: '1 buổi', en: '1 session' },
    'u.days2': { vi: '2 ngày', en: '2 days' },
    'u.sessions2': { vi: '2 buổi', en: '2 sessions' },
    'u.set1': { vi: '1 bộ ảnh', en: '1 photo set' },
    'u.clip1': { vi: "1 phim", en: "1 film" },
    'where.kicker': { vi: 'Địa điểm', en: 'Location' },
    'where.title': { vi: 'Đám cưới ở đâu?', en: "Where is your wedding?" },
    'where.sub': { vi: 'Khoảng cách một chiều từ trung tâm Hà Nội tới địa điểm cưới.', en: "One-way distance from central Hanoi to your venue." },
    'd.lt25': { vi: 'Dưới 25 km', en: 'Under 25 km' },
    'd.d25': { vi: '25 – dưới 100 km', en: '25 to under 100 km' },
    'd.d100': { vi: '100 – dưới 200 km', en: '100 to under 200 km' },
    'd.d200': { vi: '200 – dưới 300 km', en: '200 to under 300 km' },
    'd.d300': { vi: 'Từ 300 km', en: '300 km and above' },
    'where.fee': { vi: "Công tác phí của team: {fee} / nhân sự / ngày. Chưa bao gồm chi phí di chuyển, ăn và chỗ nghỉ cho team; hai bên trao đổi cụ thể trước khi ký hợp đồng.", en: "Crew allowance: {fee} per person per day. Transport, meals and accommodation for the crew are not included and will be agreed before you sign." },
    'where.free': { vi: "Dưới 25 km: không tính công tác phí của team.", en: "Under 25 km: no crew allowance." },
    'where.none': { vi: "Hãy chọn khoảng cách để tính công tác phí của team.", en: "Choose a distance to calculate the crew allowance." },
    's4.title': { vi: 'Ước tính chi tiết', en: 'Detailed estimate' },
    'line.combo': { vi: '{j} · {tier}', en: '{j} · {tier}' },
    'line.save': { vi: 'Đã tiết kiệm {x}', en: 'You save {x}' },
    'total.label': { vi: 'Tạm tính', en: 'Estimated total' },
    'total.noTravel': { vi: "Chưa gồm công tác phí của team vì bạn chưa chọn khoảng cách.", en: "The crew allowance is not included because you haven't chosen a distance." },
    'terms.title': { vi: 'Điều khoản chính', en: 'Key terms' },
    'terms.1': { vi: "Bạn đặt cọc 30% để giữ lịch, thanh toán 30% sau ngày làm việc cuối cùng và 40% còn lại sau khi nhận sản phẩm hoàn thiện", en: "Please pay a 30% deposit to secure your date, 30% after the final shooting day, and the remaining 40% after you receive your finished photos and film" },
    'terms.2': { vi: "Miễn phí đổi lịch khi báo trước 14 ngày", en: "Free rescheduling with at least 14 days' notice" },
    'terms.3': { vi: "Miễn phí 03 lần chỉnh sửa cho mỗi sản phẩm", en: "3 free revisions per deliverable" },
    'terms.4': { vi: "Nhận ảnh trong 07 ngày kể từ ngày chụp, phim trong 14 ngày kể từ ngày quay", en: "Photos delivered within 7 days of the shoot, film within 14 days of filming" },
    'terms.5': { vi: "Quá giờ: +{x}/giờ/nhân sự. Bắt đầu trước 6h00: +{x}/nhân sự/ngày", en: "Overtime: +{x} per hour per person. Starting before 6:00 a.m.: +{x} per person per day" },
    'terms.full': { vi: 'Xem câu hỏi thường gặp', en: 'See the FAQ' },
    'est.note': { vi: 'Đây chỉ là ước tính. Bee Z sẽ liên hệ để xác nhận báo giá chốt với bạn.', en: "This is only an estimate. Bee Z will contact you to confirm your final quote." },
    'combo.ask': { vi: 'Hỏi Zalo về combo này', en: "Ask on Zalo" },
    'combo.asked': { vi: 'Đã chép sẵn nội dung, dán vào Zalo nhé', en: "Message copied. Just paste it into Zalo" },
    'combo.askMsg': { vi: 'Chào Bee Z, mình đang xem combo {tier} ({j}) giá {price}. Mình muốn được tư vấn thêm.', en: "Hello Bee Z, I'm interested in the {tier} bundle ({j}) at {price}. I'd like to get some advice." },
    'est.pdf': { vi: 'Tải bản ước tính (PDF)', en: 'Download estimate (PDF)' },
    'print.title': { vi: 'Bản ước tính chi phí quay chụp cưới', en: 'Wedding photo and film cost estimate' },
    'print.date': { vi: 'Ngày lập', en: 'Prepared on' },
    's5.title': { vi: 'Gửi cho Bee Z', en: "Send your request to Bee Z" },
    's5.sub': { vi: 'Thông tin liên hệ', en: "Your contact details" },
    'f.name': { vi: 'Tên của bạn', en: 'Your name' },
    'f.namePh': { vi: 'Ví dụ: Minh Anh và Thu Thủy', en: 'e.g. Minh Anh and Thu Thuy' },
    'f.phone': { vi: 'Số điện thoại hoặc Zalo', en: 'Phone or Zalo number' },
    'f.date': { vi: 'Ngày cưới (hoặc ngày dự kiến)', en: 'Wedding date (or expected date)' },
    'f.venue': { vi: 'Địa điểm tổ chức (không bắt buộc)', en: 'Venue (optional)' },
    'f.dateTbd': { vi: 'Chưa chốt ngày', en: 'Date not set yet' },
    'f.trust': { vi: 'Gửi yêu cầu không mất phí và chưa cần đặt cọc. Bee Z sẽ liên hệ tư vấn kỹ hơn cho bạn sớm nhất có thể.', en: "Sending a request is free and needs no deposit. Bee Z will get in touch as soon as possible to advise you in more detail." },
    'f.zaloAlt': { vi: 'Ngại điền form? Nhắn Zalo {phone}', en: "Prefer not to fill in the form? Message us on Zalo: {phone}" },
    'f.emailPh': { vi: 'ten@email.com', en: 'name@email.com' },
    'f.venuePh': { vi: 'Tỉnh/thành, quận hoặc tên nhà hàng', en: "City/province, district or venue name" },
    'f.email': { vi: 'Email (không bắt buộc)', en: 'Email (optional)' },
    'f.notes': { vi: 'Lịch trình trong ngày hoặc ghi chú', en: "Wedding day schedule or notes" },
    'f.notesPh': { vi: 'Ví dụ: Đón dâu lúc 8h00, tiệc cưới bắt đầu lúc 18h30…', en: 'e.g. Bridal procession at 8:00, reception starts at 18:30…' },
    'err.name': { vi: 'Vui lòng nhập tên của bạn.', en: 'Please enter your name.' },
    'err.phone': { vi: 'Vui lòng nhập số điện thoại hoặc Zalo hợp lệ.', en: 'Please enter a valid phone or Zalo number.' },
    'err.date': { vi: 'Vui lòng chọn ngày cưới.', en: 'Please choose the wedding date.' },
    'err.venue': { vi: 'Vui lòng nhập địa điểm tổ chức.', en: 'Please enter the venue.' },
    'err.sum': { vi: 'Có {n} ô cần sửa: {list}.', en: '{n} fields need fixing: {list}.' },
    'err.sumOne': { vi: 'Có {n} ô cần sửa: {list}.', en: '1 field needs fixing: {list}.' },
    'err.email': { vi: 'Email chưa hợp lệ.', en: "This email address doesn't look valid." },
    'err.send': { vi: 'Chưa gửi được. Vui lòng thử lại, hoặc nhắn Zalo 0967 33 55 77.', en: "We couldn't send your request. Please try again, or message us on Zalo at 0967 33 55 77." },
    'form.submit': { vi: 'Gửi yêu cầu báo giá', en: "Request a quote" },
    'form.sending': { vi: 'Đang gửi…', en: 'Sending…' },
    'form.privacy': { vi: "Bee Z chỉ dùng thông tin này để liên hệ báo giá cho bạn.", en: "Bee Z only uses these details to contact you about your quote." },
    'sum.title': { vi: 'Gói của bạn', en: 'Your package' },
    'sum.journey': { vi: 'Lịch quay chụp', en: "Coverage" },
    'sum.combo': { vi: 'Combo', en: 'Bundle' },
    'sum.extras': { vi: 'Dịch vụ thêm', en: 'Extras' },
    'sum.travel': { vi: "Công tác phí", en: "Crew allowance" },
    'sum.none': { vi: 'Chưa chọn', en: "Not selected" },
    'sum.send': { vi: 'Gửi yêu cầu báo giá', en: "Request a quote" },
    'sum.help': { vi: 'Cần tư vấn trực tiếp?', en: "Need advice from our team?" },
    'm.title': { vi: 'Đặt lẻ chụp hoặc quay', en: "Photography or videography only" },
    'm.sub': { vi: "Giá cho 1 nhân sự, đặt lẻ.", en: "Prices are per person." },
    'm.nudge': { vi: 'Đặt cả chụp và quay trong combo để tiết kiệm đến 15%', en: "Book photo and video in a bundle and save up to 15%" },
    'm.nudgeBtn': { vi: 'Xem combo', en: "See bundles" },
    'm.continue': { vi: 'Nhắn Zalo để đặt lẻ', en: 'Message us on Zalo to book separately' },
    'm.close': { vi: 'Đóng', en: 'Close' },
    'bar.total': { vi: 'Tạm tính', en: "Total" },
    'bar.next': { vi: 'Tiếp tục', en: "Continue" },
    'bar.details': { vi: 'Điền thông tin', en: "Your details" },
    'bar.noTravel': { vi: 'Chưa gồm công tác phí', en: "Excludes crew allowance" },
    'step.aria': { vi: 'Bước {n}: {name}', en: "Step {n}: {name}" },
    'combo.askAll': { vi: 'Cần tư vấn chọn combo? Nhắn Zalo', en: "Need help choosing? Message us on Zalo" },
    'bar.go': { vi: 'Gửi yêu cầu', en: 'Send request' },

    /* ----- Trang xác nhận ----- */
    'c.badge': { vi: 'Yêu cầu đã được gửi', en: 'Request sent' },
    'c.h1': { vi: 'Cảm ơn bạn! Bee Z đã nhận được yêu cầu.', en: 'Thank you! Bee Z has received your request.' },
    'c.sub': { vi: 'Team sẽ liên hệ với bạn qua Zalo hoặc điện thoại để xác nhận ngày và lịch trình.', en: "Our crew will contact you by Zalo or phone to confirm your date and schedule." },
    'c.demoBadge': { vi: 'Chế độ chạy thử', en: 'Test mode' },
    'c.demoH1': { vi: 'Đây là bản chạy thử, yêu cầu chưa được gửi tới Bee Z.', en: "This is a test run. Your request has not been sent to Bee Z." },
    'c.demoSub': { vi: 'Trang web chưa được nối với Google Sheet và email. Xem README.md để nối.', en: "The site is not yet connected to Google Sheets and email. See README.md to set it up." },
    'c.recap': { vi: 'Yêu cầu của bạn', en: 'Your request' },
    'c.name': { vi: 'Tên', en: 'Name' },
    'c.contact': { vi: 'Liên hệ', en: 'Contact' },
    'c.date': { vi: 'Ngày cưới dự kiến', en: 'Wedding date' },
    'c.notYet': { vi: 'Chưa nhập', en: 'Not provided' },
    'c.dateTbd': { vi: 'Chưa chốt ngày', en: 'Not set yet' },
    'c.venue': { vi: 'Địa điểm', en: 'Venue' },
    'c.estimate': { vi: 'Tạm tính', en: 'Estimated total' },
    'c.next': { vi: 'Điều gì xảy ra tiếp theo?', en: 'What happens next?' },
    'c.n1.t': { vi: 'Xác nhận lịch trình', en: 'Confirm the schedule' },
    'c.n1.d': { vi: 'Bee Z liên hệ để xác nhận ngày, địa điểm và lịch trình trong ngày của bạn.', en: "Bee Z will contact you to confirm your date, venue and schedule for the day." },
    'c.n2.t': { vi: 'Nhận báo giá chốt', en: "Receive your final quote" },
    'c.n2.d': { vi: "Bạn nhận báo giá chốt theo đúng số nhân sự, số giờ và địa điểm.", en: "You will receive a final quote based on your exact crew, hours and venue." },
    'c.n3.t': { vi: 'Đặt cọc giữ lịch', en: "Pay a deposit to hold your date" },
    'c.n3.d': { vi: 'Đặt cọc 30% để giữ lịch. Lịch chỉ được giữ sau khi đã đặt cọc.', en: "A 30% deposit secures your date. Your date is only held once the deposit is received." },
    'c.call': { vi: 'Gọi / nhắn Zalo', en: "Call or message on Zalo" },
    'c.products': { vi: 'Xem sản phẩm của Bee Z', en: "See Bee Z's work" },
    'c.again': { vi: 'Tạo ước tính khác', en: 'Create another estimate' },
    'c.empty': { vi: 'Chưa có yêu cầu nào để hiển thị.', en: "There is no request to display yet." }
  };
  BZ.T = T;
}(typeof window !== 'undefined' ? window : globalThis));
