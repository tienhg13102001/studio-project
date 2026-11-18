/* Trang chủ: điền giá từ bảng giá chung, ảnh, biểu tượng. */
(function () {
  var BZ = window.BZ;
  var P = BZ.PRICES;

  function icons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (el) {
      if (!el.firstChild) el.innerHTML = BZ.icon(el.getAttribute('data-icon'));
    });
  }

  // Ảnh thật: nếu có file trong assets/img/ thì hiện, không thì giữ khung giữ chỗ.
  function photos() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-img]'), function (el) {
      var name = el.getAttribute('data-img');
      var img = new Image();
      img.onload = function () {
        // Đường dẫn đầy đủ: url() trong biến CSS bị tính theo thư mục file CSS, không theo trang
        el.style.setProperty('--img', 'url("' + img.src + '")');
        el.classList.add('has');
      };
      img.src = 'assets/img/' + name;
      // Bản dọc riêng cho điện thoại (thẻ hành trình là khung dọc hẹp)
      var mName = el.getAttribute('data-img-m');
      if (mName) {
        var mImg = new Image();
        mImg.onload = function () {
          el.style.setProperty('--img-m', 'url("' + mImg.src + '")');
          el.classList.add('has-m');
        };
        mImg.src = 'assets/img/' + mName;
      }
    });
  }

  function money() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-from]'), function (el) {
      el.textContent = BZ.fmt(BZ.fromPrice(el.getAttribute('data-from')));
    });
  }

  // Bảng đặt riêng chụp / quay, kèm so sánh với combo chụp + quay.
  function soloTable() {
    var S = P.solo;
    var cols = ['engagement', 'reception', 'fullday'];
    var comboPrice = {
      engagement: P.journeys.single.variants.engagement.combos.essential.price,
      reception: P.journeys.single.variants.reception.combos.essential.price,
      fullday: P.journeys.fullday.combos.essential.price
    };
    var head = '<thead><tr><th>' + BZ.t('solo.col.item') + '</th>' + cols.map(function (c) {
      return '<th>' + BZ.t('solo.col.' + c) + '</th>';
    }).join('') + '</tr></thead>';
    var rows = '<tbody>' +
      '<tr><td>' + BZ.t('solo.photo') + '</td>' + cols.map(function (c) { return '<td class="pr">' + BZ.fmt(S.photo[c]) + '</td>'; }).join('') + '</tr>' +
      '<tr><td>' + BZ.t('solo.video') + '</td>' + cols.map(function (c) { return '<td class="pr">' + BZ.fmt(S.video[c]) + '</td>'; }).join('') + '</tr>' +
      '<tr class="combo-row"><td>' + BZ.t('solo.combo') + '</td>' + cols.map(function (c) {
        return '<td class="pr">' + BZ.fmt(comboPrice[c]) + '<small>' + BZ.t('combo.solo') + ' <s>' + BZ.fmt(S.photo[c] + S.video[c]) + '</s></small></td>';
      }).join('') + '</tr>' +
      '</tbody>';
    document.getElementById('solo-table').innerHTML = head + rows;
    // Điện thoại: bảng thu gọn một khối, đủ ba lịch và ba hàng giá trong một màn hình (bảng lớn được ẩn bằng CSS)
    var split = function (txt) {
      var m = String(txt).match(/^(.*?)\s*\((.*)\)\s*$/);
      return m ? { main: m[1], sub: m[2] } : { main: txt, sub: '' };
    };
    var cell = function (cls, txt) {
      var x = split(txt);
      return '<div class="' + cls + '"><b>' + x.main + '</b>' + (x.sub ? '<small>' + x.sub + '</small>' : '') + '</div>';
    };
    var m = function (n) { return BZ.fmt(n).replace(/^VND[\s\u00A0]*/, ''); }; // tiếng Anh: bỏ chữ VND trong ô, ghi một lần ở chú thích
    var mini = '<div class="sm-h"></div>' + cols.map(function (c) { return cell('sm-h', BZ.t('solo.col.' + c)); }).join('') +
      cell('sm-l', split(BZ.t('solo.photo')).main) + cols.map(function (c) { return '<div class="sm-p">' + m(S.photo[c]) + '</div>'; }).join('') +
      cell('sm-l', split(BZ.t('solo.video')).main) + cols.map(function (c) { return '<div class="sm-p">' + m(S.video[c]) + '</div>'; }).join('') +
      '<div class="sm-l sm-c"><b>' + BZ.t('solo.combo') + ' (*)</b></div>' + cols.map(function (c) {
        return '<div class="sm-p sm-c">' + m(comboPrice[c]) + '<s>' + m(S.photo[c] + S.video[c]) + '</s></div>';
      }).join('');
    var host = document.getElementById('solo-cards');
    if (host) host.innerHTML = '<div class="solo-mini">' + mini + '</div><p class="solo-legend">' + BZ.t('solo.legend') + '</p>';
  }

  function links() {
    document.getElementById('products-link').setAttribute('href', BZ.CONFIG.portfolioUrl);
    document.getElementById('zalo-link').setAttribute('href', BZ.CONFIG.zalo);
  }

  function render() { icons(); money(); soloTable(); }

  BZ.init(function () {
    links();
    photos();
    render();
    document.addEventListener('bz:lang', render);
  });
}());
