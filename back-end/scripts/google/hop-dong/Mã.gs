const DB_ID      = '1vonMvi7TEg5WlQ_ZrxOxgye0fOpEhVAqg2iOnACpkTA'; // BZ DB — danh mục SX/TB/HC/HK
const TEMPLATE_ID = '1gmLyIT3l9SitrlWHG9u6H-g07lS0tXTDC3cmFka9NYw'; // [ Template ] Hợp Đồng — BeeZ
const FOLDER_ID   = '1ZxmfHG8yeDYdeUSkGghCNE3oMozIo4Sv';             // Đã tạo hợp đồng
const BZ_FOLDER_ID = '1hNFiZy9xGQ1bE9Y3r7VpoCF4AZYM2g9J';            // BZ files (để import báo giá)

// ── Entry point ──────────────────────────────────────────────────────────────
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Hợp Đồng - Bee Z Production')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * doPost — JSON API cho FE React (/hop-dong) gọi trực tiếp bằng fetch,
 * thay cho google.script.run (chỉ chạy trong iframe Apps Script).
 *
 * FE gửi POST Content-Type: text/plain (tránh CORS preflight). Body JSON:
 *   { "action": "<tên hàm>", "payload": { ... } }
 * Trả về ĐÚNG shape mà từng hàm trả (giữ nguyên như google.script.run),
 * bọc JSON qua ContentService.
 */
function doPost(e) {
  var out;
  try {
    var body = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents)
      : {};
    var action = body.action;
    var payload = body.payload || {};

    switch (action) {
      case 'getInitialData':
        out = getInitialData();
        break;
      case 'getContractFiles':
        out = getContractFiles();
        break;
      case 'getContractData':
        out = getContractData(payload.fileId);
        break;
      case 'checkSohdExists':
        out = checkSohdExists(payload.sohdDate, payload.brand);
        break;
      case 'getBaoGiaFiles':
        out = getBaoGiaFiles();
        break;
      case 'getBaoGiaDataFromFile':
        out = getBaoGiaDataFromFile(payload.fileId);
        break;
      case 'processContract':
        out = processContract(payload);
        break;
      case 'rollbackContract':
        out = rollbackContract(payload);
        break;
      case 'getContractDataLive':
        out = getContractDataLive(payload.fileId);
        break;
      case 'processBBNT':
        out = processBBNT(payload);
        break;
      case 'processDNTT':
        out = processDNTT(payload);
        break;
      default:
        out = { success: false, message: 'Unknown action: ' + String(action) };
    }
  } catch (err) {
    out = { success: false, message: String(err) };
  }

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Initial data: service catalog từ BZ DB ───────────────────────────────────
function getInitialData() {
  const ss = SpreadsheetApp.openById(DB_ID);
  const sheets = ['SX', 'TB', 'HC', 'HK'];
  const data = {};
  sheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const values = sheet.getDataRange().getValues();
      values.shift();
      data[name] = values.filter(r => r[0]).map(r => ({
        ten: r[0], chitiet: r[1], dongia: r[2], dvt: r[3]
      }));
    } else { data[name] = []; }
  });
  return { db: data };
}

// ── Hợp đồng files trong output folder ───────────────────────────────────────
function getContractFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  const list = [];
  while (files.hasNext()) {
    const f = files.next();
    const nm = f.getName();
    if (nm.indexOf('[HĐ') === 0) list.push({ id: f.getId(), name: nm }); // chỉ hợp đồng, loại BBNT/DNTT
  }
  return list;
}

// ── Kiểm tra trùng số HĐ (theo mã ngày + brand trong tên file đã tạo) ────────
function checkSohdExists(sohdDate, brand) {
  try {
    if (!sohdDate) return { exists: false };
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const it = folder.searchFiles('title contains "[HĐ' + sohdDate + ']"');
    const b = String(brand || '').toLowerCase();
    while (it.hasNext()) {
      const n = it.next().getName();
      if (!b || n.toLowerCase().indexOf(b) >= 0) return { exists: true, name: n };
    }
    return { exists: false };
  } catch(e) { return { exists: false, error: String(e) }; }
}

// ── Load form data từ description của file hợp đồng ─────────────────────────
function getContractData(fileId) {
  try {
    const desc = DriveApp.getFileById(fileId).getDescription();
    if (desc) return { success: true, formData: JSON.parse(desc) };
    return { success: false, message: 'Không tìm thấy dữ liệu đã lưu.' };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ── BZ báo giá files (để import) ─────────────────────────────────────────────
function getBaoGiaFiles() {
  const folder = DriveApp.getFolderById(BZ_FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  const list = [];
  while (files.hasNext()) {
    const f = files.next();
    list.push({ id: f.getId(), name: f.getName() });
  }
  return list;
}

// ── Helpers đọc CELL SỐNG của sheet báo giá ─────────────────────────────────
// "3.000.000" | 3000000 → 3000000
function _parseMoney(v) {
  if (typeof v === 'number') return Math.round(v);
  if (!v) return 0;
  return parseInt(String(v).replace(/[^\d]/g, ''), 10) || 0;
}
// Tên nhóm trong sheet → key nhóm form HĐ (nhận theo chữ, bền hơn theo vị trí)
function _sheetGroupKey(name) {
  const s = String(name || '').toUpperCase();
  if (s.indexOf('SẢN XUẤT') >= 0) return 'SX';
  if (s.indexOf('THIẾT BỊ') >= 0) return 'TB';
  if (s.indexOf('HẬU KÌ') >= 0 || s.indexOf('HẬU KỲ') >= 0) return 'HK';
  if (s.indexOf('HẬU CẦN') >= 0) return 'HC';
  return null; // "CHI PHÍ DỰ KIẾN"... không phải nhóm item
}
// Layout sheet BZ: A=STT · B=Tên · C=ĐVT · D=Đơn giá · E=Số ngày · F=Số lượng · G=Thành tiền · H=Chi tiết
function _readOptionFromSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  const rows = sheet.getDataRange().getValues();
  const items = { SX: [], TB: [], HK: [], HC: [] };
  const ROMAN = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/;
  let started = false, curGroup = null, ck = 0;

  for (let i = 0; i < rows.length; i++) {
    const r  = rows[i];
    const a  = String(r[0] == null ? '' : r[0]).trim();
    const aU = a.toUpperCase();
    const b  = String(r[1] == null ? '' : r[1]).trim();

    if (!started) { if (aU === 'STT') started = true; continue; } // neo vào dòng header bảng
    if (aU.indexOf('GHI CHÚ') === 0) break;
    if (aU === 'CHIẾT KHẤU') { ck = _parseMoney(r[2]); continue; }
    if (ROMAN.test(a)) { curGroup = _sheetGroupKey(b); continue; }  // dòng nhóm
    if (aU.indexOf('CHI PHÍ DỰ KIẾN') >= 0 || aU.indexOf('SAU CHIẾT KHẤU') >= 0 ||
        aU.indexOf('THUẾ') >= 0 || aU.indexOf('TỔNG') >= 0) { curGroup = null; continue; }

    if (curGroup && b) { // dòng item trong nhóm hợp lệ
      items[curGroup].push({
        ten: b,
        dongia: _parseMoney(r[3]),
        sn: Number(r[4]) || 1,
        sl: Number(r[5]) || 1,
        dvt: String(r[2] == null ? '' : r[2]).trim(),
        chitiet: String(r[7] == null ? '' : r[7]).trim()
      });
    }
  }
  let subTotal = 0;
  ['SX','TB','HK','HC'].forEach(k => items[k].forEach(it => subTotal += it.dongia * it.sl * it.sn));
  return { items: items, subTotal: subTotal, ck: ck };
}

// ── Đọc data từ BZ sheet — HYBRID: metadata (thông tin KH) + CELL SỐNG (items) ─
// Vì user hay sửa tay trực tiếp trên Google Sheet → phải đọc cell sống mới đúng số.
function getBaoGiaDataFromFile(fileId) {
  try {
    const ss = SpreadsheetApp.openById(fileId);
    const savedData = {};
    ss.getDeveloperMetadata().forEach(m => {
      const k = m.getKey();
      // Bỏ qua bản _backup (BZ để lại khi edit option) — giống hệt Báo Giá App
      if (k.startsWith('OPTION_') && !k.endsWith('_backup')) {
        try { savedData[k] = JSON.parse(m.getValue()); } catch(e2) {}
      }
    });
    // Chỉ liệt kê option THẬT: bỏ sheet _backup (đang ẩn) + sheet không có metadata import
    const sheetNames = ss.getSheets()
      .map(s => s.getName())
      .filter(n => !n.endsWith('_backup') && savedData['OPTION_' + n]);

    // HYBRID: override items/subTotal/chiết khấu bằng nội dung SỐNG của sheet
    // (phản ánh đúng khi user thêm/sửa hạng mục trực tiếp trên Google Sheet).
    // Parse lỗi hoặc rỗng → giữ nguyên metadata (fallback an toàn).
    sheetNames.forEach(n => {
      try {
        const live = _readOptionFromSheet(ss, n);
        if (live && live.subTotal > 0) {
          const meta = savedData['OPTION_' + n];
          meta.items     = live.items;
          meta.subTotal  = live.subTotal;
          meta.ckValue   = live.ck || meta.ckValue || 0;
          meta._liveSheet = true;
        }
      } catch(e) {}
    });

    return { success: true, sheetNames, savedData };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ── Core: tạo / chỉnh sửa hợp đồng ──────────────────────────────────────────
function processContract(payload) {
  try {
    const { actionType, formData, fileId } = payload;
    const folder = DriveApp.getFolderById(FOLDER_ID);

    const dateCode = formData.sohdDate || new Date().toISOString().slice(0,10).replace(/-/g,'');
    const brandPart = formData.brand ? ' ' + formData.brand : '';
    const projectPart = formData.duann ? ' - ' + formData.duann : '';
    const fileName = `[HĐ${dateCode}]${brandPart}${projectPart} x Bee Z`;

    let docFile, docId;
    if (actionType === 'CREATE_NEW') {
      docFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(fileName, folder);
      docId = docFile.getId();
    } else {
      // EDIT: luôn tạo bản mới từ template để đảm bảo placeholder còn nguyên, xoá bản cũ
      try { DriveApp.getFileById(fileId).setTrashed(true); } catch(e) {}
      docFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(fileName, folder);
      docId = docFile.getId();
    }

    // Cho phép xem qua link — ai cũng mở được (không cần đăng nhập)
    docFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const doc  = DocumentApp.openById(docId);
    const body = doc.getBody();

    // ── Replace thông tin ──────────────────────────────────────────────────
    const ngayKyFmt = _formatNgayKy(formData.ngayky);
    const r = {
      '{{ma_hdp}}':         formData.sohdDate || '',
      '{{brand}}':          formData.brand    || '',
      '{{sohd}}':           formData.sohd     || '',
      '{{ngay_ky}}':        ngayKyFmt,
      '{{ngay_hdp}}':       ngayKyFmt,
      '{{fullname_cty}}':   formData.tencty   || '',
      '{{dia_chi_thue}}':   formData.diachi   || '',
      '{{dia_chi}}':        formData.diachi   || '',
      '{{ma_so_thue}}':     formData.mst      || '',
      '{{mst}}':            formData.mst      || '',
      '{{dai_dien}}':       formData.nguoidaidien || '',
      '{{chuc_vu}}':        formData.chucvu   || 'Giám đốc',
      '{{email}}':          formData.email    || '',
      '{{sdt}}':            formData.sdt      || '',
      '{{mo_ta_dv}}':              formData.motadv   || '',
      '{{thoigian}}':              formData.thoigianText || '',
      '{{thoi_gian_thuc_hien1}}':  _formatDateVN(formData.tu),
      '{{thoi_gian_thuc_hien2}}':  _formatDateVN(formData.den),
      '{{diadiem}}':               formData.diadiem  || '',
      '{{ghichu}}':                formData.ghichu   || '',
      '{{thanhtoan_text}}':        formData.thanhtoantxt || '',
      '{{chiphi_dk}}':             _fmtMoney(formData.afterCk ?? formData.subTotal ?? 0),
      '{{vat_pct}}':               String(formData.vatPct || 8),
      '{{vat_amount}}':            _fmtMoney(formData.vatAmount  || 0),
      '{{tonggiatri}}':            _fmtMoney(formData.tonggiatri || 0),
      '{{tonggiatri_chu}}':        formData.tonggiatriChu || '',
      '{{tong_hop_dong}}':         formData.tonggiatriChu || '',
    };
    for (const [k, v] of Object.entries(r)) {
      body.replaceText(k.replace(/\{/g,'\\{').replace(/\}/g,'\\}'), v);
    }

    // Fallback cho template dùng text cứng thay vì {{placeholder}}
    if (formData.chucvu && formData.chucvu !== 'Giám đốc') {
      body.replaceText('Chức vụ : Giám đốc', 'Chức vụ : ' + formData.chucvu);
    }
    if (formData.motadv)  body.replaceText('Chọn dịch vụ của Bên A', formData.motadv);
    if (formData.tu)      body.replaceText('27/06/2026', _formatDateVN(formData.tu));
    if (formData.diadiem) body.replaceText('Theo kế hoạch được thỏa thuận', formData.diadiem);

    // ── Xây dựng 2 bảng ────────────────────────────────────────────────────
    const tables = body.getTables();
    let scopeTable = null, priceTable = null;
    tables.forEach(t => {
      if (t.getNumRows() < 1) return;
      try {
        if (t.getRow(0).getNumCells() === 2) {
          const h0 = t.getCell(0,0).getText();
          const h1 = t.getCell(0,1).getText();
          if (h0.includes('Hạng mục') && h1.includes('Chi tiết')) scopeTable = t;
        }
      } catch(e) {}
      try {
        const nc = t.getRow(0).getNumCells();
        if (nc === 5) {
          const last = t.getCell(0, nc-1).getText();
          if (last.includes('Thành tiền')) priceTable = t;
        }
      } catch(e) {}
    });

    if (scopeTable) _buildScopeTable(scopeTable, formData);
    if (priceTable) _buildPricingTable(priceTable, formData);

    // ── Thanh toán: thay toàn bộ đoạn điều khoản (kể cả danh sách đợt cũ) ──
    if (formData.thanhtoantxt) {
      _replacePaymentSection(body, formData.thanhtoantxt);
    }

    doc.saveAndClose();

    // ── Export PDF ─────────────────────────────────────────────────────────
    const pdfName = fileName + '.pdf';
    const existingPdfs = folder.getFilesByName(pdfName);
    while (existingPdfs.hasNext()) existingPdfs.next().setTrashed(true);

    const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
    const pdfFile = folder.createFile(pdfBlob).setName(pdfName);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    DriveApp.getFileById(docId).setDescription(JSON.stringify(formData));

    return {
      success: true,
      sohd:    formData.sohd,
      pdfUrl:  pdfFile.getUrl(),
      docUrl:  DriveApp.getFileById(docId).getUrl(),
      fileId:  docId
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ── Rollback nếu user huỷ ────────────────────────────────────────────────────
function rollbackContract(payload) {
  try {
    const { actionType, resultData } = payload;
    if (!resultData || !resultData.success) return { success: false };
    if (actionType === 'CREATE_NEW') {
      DriveApp.getFileById(resultData.fileId).setTrashed(true);
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const pdfs = folder.getFilesByName(resultData.sohd + '.pdf');
      while (pdfs.hasNext()) pdfs.next().setTrashed(true);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _formatNgayKy(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return `ngày ${d.getDate()} tháng ${d.getMonth()+1} năm ${d.getFullYear()}`;
}

function _formatDateVN(val) {
  if (!val) return '___';
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  const p = n => String(n).padStart(2,'0');
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`;
}

function _fmtMoney(num) {
  if (!num || num === 0) return '0';
  return Number(num).toLocaleString('vi-VN');
}

// Xây bảng Điều 2: mô tả công việc (2 cột)
function _buildScopeTable(table, formData) {
  for (let i = table.getNumRows() - 1; i >= 1; i--) table.removeRow(i);

  const groups = [
    { label: 'Sản xuất', keys: ['SX','TB','HC'] },
    { label: 'Hậu kỳ',  keys: ['HK'] }
  ];

  groups.forEach(g => {
    const items = g.keys.flatMap(k => formData.items[k] || []);
    items.forEach(item => {
      const row = table.appendTableRow();
      const sl     = String(item.sl || 1).padStart(2,'0');
      const dvt    = item.dvt || '';
      const snPart = (item.sn||1) > 1 ? ` × ${item.sn} ngày` : '';
      const detail = item.chitiet ? ` - ${item.chitiet}` : '';
      const note   = item.ghichu  ? ` (${item.ghichu})` : '';
      row.appendTableCell().setText(`${item.ten} (${g.label})`);
      row.appendTableCell().setText(`${sl} ${dvt}${snPart}${detail}${note}`.trim());
    });
  });
}

// Xây bảng Điều 3: giá (5 cột) + VAT + tổng. Style rõ từng ô (bold true/false + Times New Roman)
// để KHÔNG bị kế thừa bold tràn từ dòng header (giống cách đã fix cho bảng nghiệm thu BBNT).
function _buildPricingTable(table, formData) {
  const A = BBNT_ALIGN();
  const colAl = [A.L, A.C, A.C, A.R, A.R];   // Hạng mục · ĐVT · SL · Đơn giá · Thành tiền
  for (let i = table.getNumRows() - 1; i >= 1; i--) table.removeRow(i);

  const sxItems = ['SX','TB','HC'].flatMap(k => formData.items[k] || []);
  const hkItems = formData.items.HK || [];

  function _addHeader(text) {
    const row = table.appendTableRow();
    for (let c = 0; c < 5; c++) {
      const cell = row.appendTableCell(c === 0 ? text : '');
      _styleCell(cell, { b: true, s: 11, al: (c === 0 ? A.L : A.C), bg: '#f0f0f0' });
    }
  }

  function _addItem(item, stt) {
    const row  = table.appendTableRow();
    const tt   = (item.dongia||0) * (item.sl||1) * (item.sn||1);
    const slSnText = (item.sn||1) > 1
      ? `${item.sl||1} × ${item.sn} ngày`
      : String(item.sl||1);
    const vals = [stt + '. ' + item.ten, item.dvt||'', slSnText,
                  _fmtMoney(item.dongia), _fmtMoney(tt)];
    vals.forEach((v, c) => _styleCell(row.appendTableCell(v), { b: false, s: 11, al: colAl[c] }));
  }

  function _addTotalRow(label, value, bold) {
    const row = table.appendTableRow();
    for (let c = 0; c < 5; c++) {
      const cell = row.appendTableCell(c === 0 ? label : (c === 4 ? value : ''));
      _styleCell(cell, { b: !!bold, s: 11, al: (c === 4 ? A.R : (c === 0 ? A.L : A.C)), bg: bold ? '#efefef' : null });
    }
  }

  if (sxItems.length > 0) {
    _addHeader('1. Chi phí sản xuất');
    sxItems.forEach((item, i) => _addItem(item, i+1));
  }
  if (hkItems.length > 0) {
    _addHeader('2. Chi phí xử lý hậu kỳ');
    hkItems.forEach((item, i) => _addItem(item, i+1));
  }

  const ck        = Number(formData.ck) || 0;
  const rawSub    = Number(formData.subTotal) || 0;
  const afterCk   = Number(formData.afterCk != null ? formData.afterCk : (rawSub - ck)) || 0;
  const vatPct    = Number(formData.vatPct) || 8;
  const vatAmount = formData.applyVat !== false ? Math.round(afterCk * vatPct / 100) : 0;
  const total     = afterCk + vatAmount;

  _addHeader('3. Thuế và Tổng cộng');
  _addTotalRow('Chi phí dự kiến (chưa bao gồm thuế)', _fmtMoney(rawSub), false);
  if (ck > 0) {
    _addTotalRow('Chiết khấu', '− ' + _fmtMoney(ck), false);
    _addTotalRow('Chi phí sau chiết khấu', _fmtMoney(afterCk), false);
  }
  if (vatAmount > 0) _addTotalRow(`Thuế GTGT (VAT ${vatPct}%)`, _fmtMoney(vatAmount), false);
  _addTotalRow('TỔNG GIÁ TRỊ HỢP ĐỒNG', _fmtMoney(total) + ' VNĐ', true);
}

// ── Chạy 1 lần để cập nhật placeholder mới trong template ───────────────────
// Apps Script editor → chọn fixTemplate2 → Run
function fixTemplate2() {
  const doc  = DocumentApp.openById(TEMPLATE_ID);
  const body = doc.getBody();
  const log  = [];

  // 1. Thời gian: đổi {{thoigian}} → 2 placeholder riêng
  body.replaceText('ngày \\{\\{thoigian\\}\\}',
    'từ ngày {{thoi_gian_thuc_hien1}} đến ngày {{thoi_gian_thuc_hien2}}');
  // Fallback nếu fixTemplate chưa chạy (text cứng vẫn còn)
  body.replaceText('ngày 27/06/2026',
    'từ ngày {{thoi_gian_thuc_hien1}} đến ngày {{thoi_gian_thuc_hien2}}');
  log.push('✓ Thời gian → 2 placeholder');

  // 2. Tổng bằng chữ: "(Bằng chữ: ...)" → {{tong_hop_dong}}
  body.replaceText('\\(Bằng chữ:.*\\)', '(Bằng chữ: {{tong_hop_dong}})');
  log.push('✓ Bằng chữ → {{tong_hop_dong}}');

  // 3. Kiểm tra {{mo_ta_dv}} — re-add nếu mất
  if (!body.getText().includes('{{mo_ta_dv}}')) {
    body.replaceText('Chọn dịch vụ của Bên A', '{{mo_ta_dv}}');
    log.push('✓ Re-add {{mo_ta_dv}}');
  } else {
    log.push('✓ {{mo_ta_dv}} đã có sẵn');
  }

  doc.saveAndClose();
  const result = log.join('\n');
  Logger.log(result);
  return 'OK: ' + log.join(' | ');
}

// ── Chạy 1 lần để cập nhật template Google Docs sang dùng placeholders ───────
// Vào Apps Script editor → chọn hàm fixTemplate → Run
function fixTemplate() {
  const doc  = DocumentApp.openById(TEMPLATE_ID);
  const body = doc.getBody();
  const log  = [];

  // 1. Chức vụ: hardcode "Giám đốc" → {{chuc_vu}}
  body.replaceText('Chức vụ : Giám đốc', 'Chức vụ : {{chuc_vu}}');
  log.push('✓ Chức vụ → {{chuc_vu}}');

  // 2. Mô tả dịch vụ: "Chọn dịch vụ của Bên A" → {{mo_ta_dv}}
  body.replaceText('Chọn dịch vụ của Bên A', '{{mo_ta_dv}}');
  log.push('✓ Chọn dịch vụ → {{mo_ta_dv}}');

  // 3. Thời gian: hardcode ngày → {{thoigian}}
  body.replaceText('ngày 27/06/2026', 'ngày {{thoigian}}');
  log.push('✓ Ngày cứng → {{thoigian}}');

  // 4. Địa điểm: hardcode → {{diadiem}}
  body.replaceText('Theo kế hoạch được thỏa thuận', '{{diadiem}}');
  log.push('✓ Địa điểm → {{diadiem}}');

  // 5. Thêm dòng SĐT sau Email trong section Bên A
  const paras = body.getParagraphs();
  let emailParaIdx = -1;
  for (let i = 0; i < paras.length; i++) {
    if (paras[i].getText().trim().startsWith('- Email') && paras[i].getText().includes('{{email}}')) {
      emailParaIdx = i;
      break;
    }
  }
  if (emailParaIdx >= 0) {
    // Tìm index thực trong body children
    for (let i = 0; i < body.getNumChildren(); i++) {
      if (body.getChild(i) === paras[emailParaIdx]) {
        body.insertParagraph(i + 1, '  - SĐT : {{sdt}}');
        log.push('✓ Thêm dòng SĐT sau Email');
        break;
      }
    }
  } else {
    log.push('ℹ Không tìm thấy dòng Email để thêm SĐT (có thể đã có)');
  }

  // 6. Payment section: "Tiền thanh toán..." → {{thanhtoan_text}} + xoá Đợt 1/2 cũ
  let payIdx = -1;
  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    let t = '';
    try { t = child.getText().trim(); } catch(e) { continue; }
    if (t.includes('Tiền thanh toán được chia làm 02')) {
      payIdx = i;
      child.setText('{{thanhtoan_text}}');
      log.push('✓ Payment header → {{thanhtoan_text}} tại idx ' + i);
      break;
    }
  }
  if (payIdx >= 0) {
    let removed = 0, safety = 25;
    while (payIdx + 1 < body.getNumChildren() && safety-- > 0) {
      const child = body.getChild(payIdx + 1);
      const type  = child.getType();
      if (type !== DocumentApp.ElementType.PARAGRAPH &&
          type !== DocumentApp.ElementType.LIST_ITEM) break;
      let t = '';
      try { t = child.getText().trim(); } catch(e) {}
      if (t.match(/^3\.3\./i) || t.match(/^Điều\s+\d+/i)) break;
      const isOld = t === '' || t.match(/^\d+\.\s*(Đợt|Tạm ứng)/i) ||
        t.match(/^[●•◆\-]\s*/u) || t.includes('Đợt 1') || t.includes('Đợt 2') ||
        t.includes('Biên bản nghiệm thu') || t.includes('Hóa đơn giá trị gia tăng') ||
        t.includes('Hồ sơ thanh toán') || t.includes('bản gốc') ||
        t.includes('tương đương') || t.includes('tạm ứng') || t.includes('Thanh toán nốt');
      if (!isOld) break;
      body.removeChild(body.getChild(payIdx + 1));
      removed++;
    }
    log.push('✓ Xoá ' + removed + ' đoạn Đợt 1/2 cũ khỏi template');
  }

  doc.saveAndClose();
  const result = log.join('\n');
  Logger.log(result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// v4.0 — BBNT (Biên bản nghiệm thu) — dữ liệu LIVE từ hợp đồng đã sửa
// ═══════════════════════════════════════════════════════════════════════════

// Bên B (Bee Z) — cố định
const BEEZ = {
  ten: 'CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION',
  daidien: 'Ông Nguyễn Thọ Trần Hoàn',
  chucvu: 'Giám đốc',
  diachi: 'Số nhà 54, ngõ 250 Khương Trung, Phường Khương Đình, Quận Thanh Xuân, TP. Hà Nội',
  mst: '0110989139',
  stk: '68335577 – Techcombank – CN Hà Thành'
};

// Đọc bảng giá SỐNG trong Doc hợp đồng (bắt được hạng mục khách sửa tay) + party từ snapshot.
// Phân loại dòng bằng CẤU TRÚC CELL (cell2 Số lượng có/không, cell4 có/không) — KHÔNG bằng regex STT
// (vì header nhóm cũng bắt đầu "N. ..." giống item; STT reset mỗi nhóm).
function getContractDataLive(fileId) {
  const out = { snapshot: {}, live: null, fromSnapshot: false };
  try {
    const desc = DriveApp.getFileById(fileId).getDescription();
    if (desc) out.snapshot = JSON.parse(desc);
  } catch(e) {}

  const money = s => { const n = parseInt(String(s).replace(/[^\d]/g, ''), 10); return isNaN(n) ? 0 : n; };

  try {
    const body = DocumentApp.openById(fileId).getBody();
    const tables = body.getTables();
    let pt = null;
    for (let t = 0; t < tables.length; t++) {
      const tb = tables[t];
      if (tb.getNumRows() < 1 || tb.getRow(0).getNumCells() !== 5) continue;
      if (tb.getRow(0).getCell(4).getText().indexOf('Thành tiền') >= 0) { pt = tb; break; } // "Thành tiền\n(VNĐ)" → contains
    }
    if (pt) {
      const items = [];
      let ck = 0, vatPct = 0, vatAmount = 0, subTotal = 0, total = 0, hasVat = false;
      for (let r = 1; r < pt.getNumRows(); r++) {
        const row = pt.getRow(r);
        if (row.getNumCells() < 5) continue;
        const c0 = row.getCell(0).getText().trim();
        const c1 = row.getCell(1).getText().trim();
        const c2 = row.getCell(2).getText().trim();
        const c3 = row.getCell(3).getText().trim();
        const c4 = row.getCell(4).getText().trim();
        if (c2 !== '') {
          // ITEM — cột SL có thể là "1 × 3 ngày" ⇒ lấy số đầu bằng parseInt (không strip toàn bộ).
          // Thành tiền lấy từ cột c4 (ĐÚNG cả item thuê theo ngày = dongia×sl×sn) → dùng làm gốc nghiệm thu.
          items.push({ ten: c0.replace(/^\d+\.\s*/, '').trim(), dvt: c1, sl: parseInt(String(c2), 10) || 1, dongia: money(c3), tt: money(c4) });
        } else if (c4 !== '') {
          // DÒNG TỔNG (SL rỗng, có giá trị cột cuối)
          const lb = c0.toLowerCase(), val = money(c4); // money() tự strip '.', ' ', '−'(U+2212), 'VNĐ'
          if (lb.indexOf('chiết khấu') >= 0 && lb.indexOf('sau chiết khấu') < 0) ck = val;
          else if (lb.indexOf('tổng giá trị') >= 0) total = val;
          else if (lb.indexOf('vat') >= 0 || lb.indexOf('%') >= 0 || lb.indexOf('gtgt') >= 0 || lb.indexOf('giá trị gia tăng') >= 0) {
            hasVat = true; vatAmount = val; const m = c0.match(/(\d+)\s*%/); if (m) vatPct = parseInt(m[1], 10); // 2 biến thể nhãn thuế
          } else if (lb.indexOf('dự kiến') >= 0) subTotal = val;
        }
        // header nhóm (c2 & c4 đều rỗng) → bỏ qua
      }
      if (items.length) {
        if (!subTotal) subTotal = items.reduce((s, i) => s + (i.tt || 0), 0);
        if (!vatPct) vatPct = 8;
        const afterCk = subTotal - ck;
        if (!vatAmount && hasVat) vatAmount = Math.round(afterCk * vatPct / 100); // chỉ suy VAT khi HĐ có dòng VAT
        if (!total) total = afterCk + vatAmount;
        out.live = { items: items, ck: ck, vatPct: vatPct, vatAmount: vatAmount, subTotal: subTotal, total: total, applyVat: hasVat };
      }
    }
  } catch(e) { out.error = String(e); }

  // Fallback: không parse được bảng sống → dùng snapshot (làm phẳng SX/TB/HC/HK)
  if (!out.live) {
    out.fromSnapshot = true;
    const s = out.snapshot || {}, flat = [];
    ['SX','TB','HC','HK'].forEach(k => (s.items && s.items[k] || []).forEach(i => {
      flat.push({ ten: i.ten, dvt: i.dvt || '', sl: i.sl || 1, dongia: i.dongia || 0, tt: (i.dongia||0)*(i.sl||1)*(i.sn||1) });
    }));
    const ck = Number(s.ck) || 0, subTotal = flat.reduce((a, i) => a + i.tt, 0), vatPct = Number(s.vatPct) || 8;
    const applyVat = s.applyVat !== false;
    const afterCk = subTotal - ck, vatAmount = applyVat ? Math.round(afterCk * vatPct / 100) : 0;
    out.live = { items: flat, ck: ck, vatPct: vatPct, vatAmount: vatAmount, subTotal: subTotal, total: afterCk + vatAmount, applyVat: applyVat };
  }
  return out;
}

function _getOrCreateSubfolder(parentId, name) {
  const parent = DriveApp.getFolderById(parentId);
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

// Trash các file trùng tên (Doc + PDF) trong folder trước khi tạo mới → tránh nhân đôi khi xuất lại.
function _trashSameName(folder, baseName) {
  [baseName, baseName + '.pdf'].forEach(n => {
    try { const it = folder.getFilesByName(n); while (it.hasNext()) it.next().setTrashed(true); } catch(e) {}
  });
}

const BBNT_FONT = 'Times New Roman';
const BBNT_ALIGN = () => ({
  C: DocumentApp.HorizontalAlignment.CENTER,
  L: DocumentApp.HorizontalAlignment.LEFT,
  R: DocumentApp.HorizontalAlignment.RIGHT
});

// Style 1 ô bảng: LUÔN set font + bold (true/false) để không kế thừa style dòng trước.
function _styleCell(cell, opt) {
  opt = opt || {};
  const t = cell.editAsText();
  t.setFontFamily(BBNT_FONT);
  t.setForegroundColor(opt.color || '#000000');
  t.setFontSize(opt.s || 11);
  t.setBold(!!opt.b);
  t.setItalic(!!opt.i);
  try { cell.getChild(0).asParagraph().setAlignment(opt.al || DocumentApp.HorizontalAlignment.LEFT); } catch (e) {}
  if (opt.bg) cell.setBackgroundColor(opt.bg);
}

// Auto-tạo template BBNT (lưu ID + VERSION vào Script Properties). Bump TEMPLATE_VER khi đổi layout → tự tạo lại.
function _getOrCreateBBNTTemplate() {
  const TEMPLATE_VER = '3';   // v2: fix bold + TNR · v3: thêm mục sản phẩm bàn giao {{san_pham}} ở Điều 1
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('BBNT_TEMPLATE_ID');
  const ver = props.getProperty('BBNT_TEMPLATE_VER');
  if (id && ver === TEMPLATE_VER) { try { DriveApp.getFileById(id); return id; } catch(e) { id = null; } }
  if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch(e) {} }   // dọn template cũ (bold lỗi)

  const A = BBNT_ALIGN();
  const doc = DocumentApp.create('[ Template ] Biên bản nghiệm thu — BeeZ');
  const body = doc.getBody();
  body.clear();
  try { body.setMarginTop(50).setMarginBottom(50).setMarginLeft(64).setMarginRight(50); } catch(e) {}

  // add(txt, opt): LUÔN set bold true/false + font Times New Roman + size + spacing → không dính bold tràn.
  const add = (txt, opt) => {
    opt = opt || {};
    const p = body.appendParagraph(txt);
    p.setAlignment(opt.c ? A.C : A.L);
    try { p.setLineSpacing(1.15).setSpacingBefore(opt.sb != null ? opt.sb : 0).setSpacingAfter(opt.sa != null ? opt.sa : 3); } catch(e) {}
    if (txt) {
      const t = p.editAsText();
      t.setFontFamily(BBNT_FONT);
      t.setForegroundColor('#000000');
      t.setFontSize(opt.s || 13);
      t.setBold(!!opt.b);
      t.setItalic(!!opt.i);
    }
    return p;
  };

  add('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { c: true, b: true, s: 13, sa: 0 });
  add('Độc lập - Tự do - Hạnh phúc', { c: true, b: true, s: 13, sa: 0 });
  add('------------', { c: true, sa: 6 });
  add('BIÊN BẢN NGHIỆM THU', { c: true, b: true, s: 17, sb: 6, sa: 2 });
  add('Số: {{ma_bbnt}}', { c: true, i: true, s: 12, sa: 10 });

  add('- Căn cứ Hợp đồng số: {{sohd}} ký {{ngay_ky}} giữa Công ty TNHH Truyền thông Bee Z Production với {{fullname_cty}};');
  add('- Căn cứ các công việc hai bên đã hoàn thành,');
  add('Hôm nay, {{ngay_nghiemthu}}, tại TP. Hà Nội, chúng tôi gồm:', { sa: 8 });

  add('BÊN A: {{fullname_cty}}', { b: true });
  add('Đại diện: {{dai_dien}}');
  add('Chức vụ: {{chuc_vu}}');
  add('Trụ sở chính: {{dia_chi}}');
  add('Mã số thuế: {{mst}}', { sa: 8 });

  add('BÊN B: ' + BEEZ.ten, { b: true });
  add('Đại diện: ' + BEEZ.daidien);
  add('Chức vụ: ' + BEEZ.chucvu);
  add('Trụ sở chính: ' + BEEZ.diachi);
  add('Mã số thuế: ' + BEEZ.mst);
  add('Số tài khoản: ' + BEEZ.stk, { sa: 8 });

  add('Hai bên thống nhất ký biên bản nghiệm thu của Hợp đồng số: {{sohd}}, với các nội dung cụ thể như sau:', { sa: 8 });

  add('ĐIỀU 1: NỘI DUNG NGHIỆM THU', { b: true, sb: 4 });
  add('Bên B đã hoàn thành và bàn giao cho Bên A các sản phẩm/hạng mục sau:');
  add('{{san_pham}}');   // sẽ được thay bằng danh sách sản phẩm bàn giao (mỗi dòng 1 mục, có thể kèm link)
  add('Chi tiết giá trị nghiệm thu được liệt kê tại bảng dưới đây.', { sa: 8 });

  add('ĐIỀU 2: GIÁ TRỊ NGHIỆM THU', { b: true, sb: 4, sa: 4 });
  const ntTable = body.appendTable([['STT','Hạng mục','ĐVT','Số lượng','Đơn giá','Thành tiền','Tỉ lệ nghiệm thu','Thành tiền nghiệm thu']]);
  const hdrAl = [A.C, A.L, A.C, A.C, A.R, A.R, A.C, A.R];
  for (let c = 0; c < ntTable.getRow(0).getNumCells(); c++)
    _styleCell(ntTable.getRow(0).getCell(c), { b: true, s: 10.5, al: hdrAl[c], bg: '#1a1a1a', color: '#ffffff' });

  add('- Bên A đã thanh toán cho Bên B số tiền: {{da_tt}} VNĐ', { sb: 8 });
  add('- Bên A còn phải thanh toán cho Bên B số tiền: {{con_phai_tt}}', { sa: 8 });

  add('ĐIỀU 3: LƯU TRỮ DỰ ÁN', { b: true, sb: 4 });
  add('Sau khi hoàn thành dự án, toàn bộ file gốc và sản phẩm hoàn thiện được lưu giữ tại phòng sản xuất của Bên B trong vòng 01 tháng kể từ ngày ký biên bản, sau đó Bên B có quyền hủy bỏ.', { sa: 8 });

  add('ĐIỀU 4: ĐIỀU KHOẢN CHUNG', { b: true, sb: 4 });
  add('- Sau khi Bên A thanh toán đủ, hợp đồng trên tự động được thanh lý.');
  add('- Biên bản này được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản, có hiệu lực từ ngày ký./', { sa: 16 });

  const signT = body.appendTable([['ĐẠI DIỆN BÊN A', 'ĐẠI DIỆN BÊN B'], ['\n\n\n\n', '\n\n\n\n']]);
  try { signT.setBorderWidth(0); } catch(e) {}
  for (let c = 0; c < 2; c++) _styleCell(signT.getRow(0).getCell(c), { b: true, s: 12, al: A.C });
  for (let c = 0; c < 2; c++) _styleCell(signT.getRow(1).getCell(c), { b: false, s: 11, al: A.C });
  doc.saveAndClose();

  id = doc.getId();
  props.setProperty('BBNT_TEMPLATE_ID', id);
  props.setProperty('BBNT_TEMPLATE_VER', TEMPLATE_VER);
  try { DriveApp.getFileById(id).moveTo(DriveApp.getFolderById(FOLDER_ID)); } catch(e) {}
  return id;
}

// Dựng bảng nghiệm thu (8 cột) từ items + dòng tổng. Style rõ font/bold từng ô. Trả về { sumNthu, vat, tong }.
function _buildNghiemThuTable(table, payload) {
  const A = BBNT_ALIGN();
  for (let i = table.getNumRows() - 1; i >= 1; i--) table.removeRow(i);
  const items = payload.items || [];
  const vatPct = Number(payload.vatPct) || 8;
  const applyVat = payload.applyVat !== false;
  const colAl = [A.C, A.L, A.C, A.C, A.R, A.R, A.C, A.R];
  let sumNthu = 0;
  items.forEach((it, idx) => {
    const dg = Number(it.dongia) || 0, sl = Number(it.sl) || 1;
    const tt = Number(it.tt) || (dg * sl);   // Thành tiền GỐC = giá trị đã parse từ HĐ (đúng cả thuê theo ngày)
    const tyle = (it.tyle === '' || it.tyle == null) ? 100 : (Number(it.tyle) || 0);
    const ttNthu = Math.round(tt * tyle / 100);
    sumNthu += ttNthu;
    const row = table.appendTableRow();
    const vals = [String(idx + 1), it.ten || '', it.dvt || '', String(sl), _fmtMoney(dg), _fmtMoney(tt), tyle + '%', _fmtMoney(ttNthu)];
    vals.forEach((v, i) => { _styleCell(row.appendTableCell(v), { b: false, s: 11, al: colAl[i] }); });
  });
  const vat = applyVat ? Math.round(sumNthu * vatPct / 100) : 0;
  const tong = sumNthu + vat;
  const addTotal = (label, val, strong) => {
    const row = table.appendTableRow();
    for (let c = 0; c < 8; c++) {
      const cell = row.appendTableCell(c === 0 ? label : (c === 7 ? val : ''));
      _styleCell(cell, { b: true, s: 11, al: (c === 7 ? A.R : (c === 0 ? A.L : A.C)), bg: strong ? '#efefef' : null });
    }
  };
  addTotal('Tổng tiền chưa bao gồm thuế GTGT', _fmtMoney(sumNthu), false);
  addTotal('Thuế GTGT (' + vatPct + '%)', _fmtMoney(vat), false);
  addTotal('Tổng tiền đã bao gồm thuế GTGT', _fmtMoney(tong), true);
  return { sumNthu: sumNthu, vat: vat, tong: tong };
}

// Thay 1 paragraph chứa `marker` bằng NHIỀU dòng (text nhiều dòng, mỗi dòng 1 đoạn có prefix bullet).
// URL trong dòng được tự động gắn hyperlink cho dễ bấm.
function _replaceBlockLines(body, marker, text, prefix) {
  let idx = -1;
  for (let i = 0; i < body.getNumChildren(); i++) {
    let t = ''; try { t = body.getChild(i).getText(); } catch(e) { continue; }
    if (t.indexOf(marker) >= 0) { idx = i; break; }
  }
  if (idx === -1) return;
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  const styleLine = (para, line) => {
    para.setText((prefix || '') + line);
    const t = para.editAsText();
    t.setBold(false).setItalic(false).setFontFamily(BBNT_FONT).setFontSize(13).setForegroundColor('#000000');
    try { para.setLineSpacing(1.15).setSpacingBefore(0).setSpacingAfter(3); } catch(e) {}
    // Gắn link cho mọi URL http(s) trong dòng (bỏ dấu câu dính cuối)
    const full = para.getText();
    const re = /https?:\/\/[^\s)]+/g; let m;
    while ((m = re.exec(full)) !== null) {
      const url = m[0].replace(/[.,;:!?)\]}]+$/, '');
      if (url.length < 8) continue;
      try { t.setLinkUrl(m.index, m.index + url.length - 1, url); } catch(e) {}
    }
  };
  if (!lines.length) { try { body.removeChild(body.getChild(idx)); } catch(e) {} return; }
  let para = body.getChild(idx).asParagraph();
  styleLine(para, lines[0]);
  for (let j = 1; j < lines.length; j++) styleLine(body.insertParagraph(idx + j, ''), lines[j]);
}

// Tạo file BBNT (Doc + PDF) từ template + payload (từ form frontend, các số bằng chữ tính sẵn).
function processBBNT(payload) {
  try {
    const p = payload || {};
    const templateId = _getOrCreateBBNTTemplate();
    const folder = _getOrCreateSubfolder(FOLDER_ID, 'Biên bản nghiệm thu');
    const brand = p.brand || '';
    const fileName = '[BBNT' + (p.sohdDate || '') + ']' + (brand ? ' ' + brand : '') + (p.duann ? ' - ' + p.duann : '');
    _trashSameName(folder, fileName);   // dedup: xuất lại không nhân đôi file
    const copy = DriveApp.getFileById(templateId).makeCopy(fileName, folder);
    const doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    // Tìm bảng nghiệm thu (8 cột, header cuối chứa "nghiệm thu")
    let ntTable = null;
    const tables = body.getTables();
    for (let t = 0; t < tables.length; t++) {
      const tb = tables[t];
      if (tb.getNumRows() >= 1 && tb.getRow(0).getNumCells() === 8 &&
          tb.getRow(0).getCell(7).getText().toLowerCase().indexOf('nghiệm thu') >= 0) { ntTable = tb; break; }
    }
    let totals = { tong: 0 };
    if (ntTable) totals = _buildNghiemThuTable(ntTable, p);

    const daTT = Number(p.daTT) || 0;
    const conPhai = Math.max(0, totals.tong - daTT);
    const r = {
      '{{ma_bbnt}}': fileName.replace(/[\[\]]/g, ''),
      '{{sohd}}': p.sohd || '',
      '{{ngay_ky}}': _formatNgayKy(p.ngayky),
      '{{ngay_nghiemthu}}': _formatNgayKy(p.ngayNthu) || _formatNgayKy(new Date()),
      '{{fullname_cty}}': p.tencty || '',
      '{{dai_dien}}': p.nguoidaidien || '',
      '{{chuc_vu}}': p.chucvu || '',
      '{{dia_chi}}': p.diachi || '',
      '{{mst}}': p.mst || '',
      '{{da_tt}}': _fmtMoney(daTT),
      '{{con_phai_tt}}': _fmtMoney(conPhai) + ' VNĐ' + (p.conPhaiChu ? ' (Bằng chữ: ' + p.conPhaiChu + ')' : ' (đã bao gồm VAT)')
    };
    Object.keys(r).forEach(k => body.replaceText(k.replace(/\{/g, '\\{').replace(/\}/g, '\\}'), r[k]));
    const sanPham = (p.sanPham && String(p.sanPham).trim()) ? p.sanPham : 'Toàn bộ sản phẩm/dịch vụ theo Hợp đồng đã ký.';
    _replaceBlockLines(body, '{{san_pham}}', sanPham, '- ');
    doc.saveAndClose();

    const pdfFile = folder.createFile(copy.getAs('application/pdf')).setName(fileName + '.pdf');
    copy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    try { copy.setDescription(JSON.stringify(p)); } catch(e) {}

    return { success: true, docUrl: copy.getUrl(), pdfUrl: pdfFile.getUrl(), fileId: copy.getId(), ma: fileName };
  } catch(e) {
    return { success: false, message: String(e) };
  }
}

// ════════════ DNTT — ĐỀ NGHỊ THANH TOÁN (đợt 2) ════════════

// Thêm 1 đoạn vào Doc: LUÔN set bold true/false + Times New Roman + size + spacing (chống bold tràn như BBNT v1).
function _dtAdd(body, txt, opt) {
  opt = opt || {};
  const A = BBNT_ALIGN();
  const p = body.appendParagraph(txt);
  p.setAlignment(opt.c ? A.C : (opt.r ? A.R : A.L));
  try { p.setLineSpacing(1.15).setSpacingBefore(opt.sb != null ? opt.sb : 0).setSpacingAfter(opt.sa != null ? opt.sa : 3); } catch(e) {}
  if (txt) {
    const t = p.editAsText();
    t.setFontFamily(BBNT_FONT);
    t.setForegroundColor('#000000');
    t.setFontSize(opt.s || 13);
    t.setBold(!!opt.b);
    t.setItalic(!!opt.i);
  }
  return p;
}

// Auto-tạo template ĐNTT (lưu ID + VERSION). Bump DNTT_TEMPLATE_VER khi đổi layout → tự tạo lại.
function _getOrCreateDNTTTemplate() {
  const TEMPLATE_VER = '1';
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('DNTT_TEMPLATE_ID');
  const ver = props.getProperty('DNTT_TEMPLATE_VER');
  if (id && ver === TEMPLATE_VER) { try { DriveApp.getFileById(id); return id; } catch(e) { id = null; } }
  if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch(e) {} }

  const doc = DocumentApp.create('[ Template ] Đề nghị thanh toán — BeeZ');
  const body = doc.getBody();
  body.clear();
  try { body.setMarginTop(50).setMarginBottom(50).setMarginLeft(64).setMarginRight(50); } catch(e) {}
  const add = (txt, opt) => _dtAdd(body, txt, opt);

  // Header — thông tin Bên B (BeeZ) + số ĐNTT
  add(BEEZ.ten, { b: true, s: 13, sa: 0 });
  add('Địa chỉ: ' + BEEZ.diachi, { s: 12, sa: 0 });
  add('Số: {{so_dntt}}', { s: 12, sa: 10 });

  add('ĐỀ NGHỊ THANH TOÁN', { c: true, b: true, s: 17, sb: 4, sa: 10 });

  add('Kính gửi: {{fullname_cty}}', { b: true, sa: 8 });

  add('- Căn cứ Hợp đồng dịch vụ số: {{sohd}};', { i: true });
  add('- Căn cứ Biên bản nghiệm thu và bàn giao dịch vụ số: {{so_bbnt}}.', { i: true });
  add('Công ty ' + BEEZ.ten + ' trân trọng đề nghị Quý công ty thanh toán chi phí thực hiện dịch vụ "{{duann}}" với thông tin chi tiết:', { sa: 8 });

  add('1. NỘI DUNG THANH TOÁN:', { b: true, sb: 4 });
  add('- Số tiền thanh toán ({{so_tien_note}}): {{so_tien}} VNĐ (Bằng chữ: {{so_tien_chu}}).', { sa: 8 });

  add('2. THÔNG TIN TÀI KHOẢN NHẬN THANH TOÁN:', { b: true, sb: 4 });
  add('Quý công ty vui lòng chuyển khoản vào tài khoản ngân hàng chính thức dưới đây:');
  add('- Chủ tài khoản: ' + BEEZ.ten);
  add('- Số tài khoản: ' + BEEZ.stk, { sa: 8 });

  add('3. CHỨNG TỪ ĐÍNH KÈM:', { b: true, sb: 4 });
  add('- Biên bản nghiệm thu và bàn giao dịch vụ số {{so_bbnt}}.');
  add('- Hóa đơn giá trị gia tăng (GTGT) hợp lệ theo quy định của pháp luật.', { sa: 8 });

  add('Kính đề nghị Quý công ty xem xét và duyệt giải ngân trong vòng {{so_ngay}} ngày làm việc kể từ ngày nhận được Đề nghị thanh toán này theo đúng quy định tại Hợp đồng.', { sa: 6 });
  add('Xin trân trọng cảm ơn sự hợp tác của Quý công ty!', { sa: 18 });

  // Chữ ký — Người đại diện Bên B (căn phải)
  add('{{ngay_dntt}}', { r: true, i: true, sa: 0 });
  add('NGƯỜI ĐẠI DIỆN', { r: true, b: true, sa: 0 });
  add('(Ký, ghi rõ họ tên và đóng dấu)', { r: true, i: true, s: 12, sa: 44 });
  add(BEEZ.daidien.replace(/^Ông\s+/i, '').toUpperCase(), { r: true, b: true });

  doc.saveAndClose();
  id = doc.getId();
  props.setProperty('DNTT_TEMPLATE_ID', id);
  props.setProperty('DNTT_TEMPLATE_VER', TEMPLATE_VER);
  try { DriveApp.getFileById(id).moveTo(DriveApp.getFolderById(FOLDER_ID)); } catch(e) {}
  return id;
}

// Tạo file ĐNTT (Doc + PDF) từ template + payload (số bằng chữ tính sẵn ở frontend).
function processDNTT(payload) {
  try {
    const p = payload || {};
    const templateId = _getOrCreateDNTTTemplate();
    const folder = _getOrCreateSubfolder(FOLDER_ID, 'Đề nghị thanh toán');
    const brand = p.brand || '';
    const fileName = '[ĐNTT' + (p.sohdDate || '') + ']' + (brand ? ' ' + brand : '') + (p.duann ? ' - ' + p.duann : '');
    _trashSameName(folder, fileName);   // dedup: xuất lại không nhân đôi file
    const copy = DriveApp.getFileById(templateId).makeCopy(fileName, folder);
    const doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();
    const soTien = Number(p.soTien) || 0;
    const r = {
      '{{so_dntt}}':      p.soDntt || '',
      '{{fullname_cty}}': p.tencty || '',
      '{{sohd}}':         p.sohd || '',
      '{{so_bbnt}}':      p.soBBNT || '(theo biên bản nghiệm thu)',
      '{{duann}}':        p.duann || '',
      '{{so_tien_note}}': p.soTienNote || '100% giá trị hợp đồng đã bao gồm VAT',
      '{{so_tien}}':      _fmtMoney(soTien),
      '{{so_tien_chu}}':  p.soTienChu || '',
      '{{so_ngay}}':      p.soNgayText || '15 (mười lăm)',
      '{{ngay_dntt}}':    'Hà Nội, ' + (_formatNgayKy(p.ngay) || _formatNgayKy(new Date()))
    };
    Object.keys(r).forEach(k => body.replaceText(k.replace(/\{/g, '\\{').replace(/\}/g, '\\}'), r[k]));
    doc.saveAndClose();

    const pdfFile = folder.createFile(copy.getAs('application/pdf')).setName(fileName + '.pdf');
    copy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    try { copy.setDescription(JSON.stringify(p)); } catch(e) {}

    return { success: true, docUrl: copy.getUrl(), pdfUrl: pdfFile.getUrl(), fileId: copy.getId(), ma: fileName };
  } catch(e) {
    return { success: false, message: String(e) };
  }
}

// Thay thế toàn bộ đoạn điều khoản thanh toán (kể cả danh sách đợt cũ bên dưới)
function _replacePaymentSection(body, newText) {
  if (!newText) return;
  const lines = newText.split('\n').filter(l => l.trim());
  if (!lines.length) return;

  // Tìm đoạn mở đầu thanh toán
  let payIdx = -1;
  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    let t = '';
    try { t = child.getText().trim(); } catch(e) { continue; }
    if (t.includes('{{thanhtoan_text}}') ||
        t.includes('Tiền thanh toán được chia làm 02') ||
        t.includes('Tiền thanh toán được chia làm hai')) {
      payIdx = i;
      break;
    }
  }
  if (payIdx === -1) return; // không tìm thấy, bỏ qua

  // Ghi dòng đầu vào đoạn tìm được
  try { body.getChild(payIdx).setText(lines[0]); } catch(e) { return; }

  // Xoá các đoạn phía dưới thuộc payment clause (đợt 1/2, bullet points...)
  let delIdx = payIdx + 1;
  let safety = 25;
  while (delIdx < body.getNumChildren() && safety-- > 0) {
    const child = body.getChild(delIdx);
    const type  = child.getType();
    // Dừng ở bảng hoặc element khác paragraph/list
    if (type !== DocumentApp.ElementType.PARAGRAPH &&
        type !== DocumentApp.ElementType.LIST_ITEM) break;
    let t = '';
    try { t = child.getText().trim(); } catch(e) { break; }
    // Dừng ở điều khoản tiếp theo
    if (t.match(/^Điều\s+\d+/i)) break;
    // Nhận diện nội dung thanh toán để xoá
    const isPayContent =
      t === '' ||
      t.match(/^\d+\s*\.\s*(Đợt|Tạm ứng)/i) ||
      t.match(/^[●•◆\-]\s*/u) ||
      t.includes('Đợt 1') || t.includes('Đợt 2') ||
      t.includes('Biên bản nghiệm thu') ||
      t.includes('Hóa đơn giá trị gia tăng') ||
      t.includes('Hồ sơ thanh toán') ||
      t.includes('bản gốc') ||
      t.includes('tương đương') ||
      t.includes('tạm ứng') ||
      t.includes('Thanh toán nốt') ||
      t.includes('thanh toán hợp lệ');
    if (!isPayContent) break;
    body.removeChild(body.getChild(delIdx));
    // delIdx không tăng vì đã remove
  }

  // Chèn các dòng còn lại vào sau payIdx
  for (let j = 1; j < lines.length; j++) {
    body.insertParagraph(payIdx + j, lines[j]);
  }
}
