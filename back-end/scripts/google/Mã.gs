const DB_ID = '1vonMvi7TEg5WlQ_ZrxOxgye0fOpEhVAqg2iOnACpkTA';
const TEMPLATE_ID = '1BR8Eeb_kJYuMasQ6fgJU-abUOTKzHdDVDGh2Hn9qCbA';
const FOLDER_ID = '1hNFiZy9xGQ1bE9Y3r7VpoCF4AZYM2g9J';


// Lọc ký tự không hợp lệ cho tên file Drive (dùng chung cho makeCopy + tra/xóa PDF), giới hạn ~120 ký tự
function sanitizeName_(s) {
  return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\r\n]+/g, '-').trim().slice(0, 120) || 'Bao gia';
}


function doGet(e) {
  // Nhánh ?api=1 cũ (đọc metadata file bất kỳ theo fileId) ĐÃ GỠ vì lỗ hổng lộ giá/MST:
  // web app chạy dưới quyền owner nên mọi request ẩn danh có thể đọc file bất kỳ chỉ với fileId.
  // Hợp Đồng App KHÔNG dùng nhánh này (nó đọc file Báo Giá trực tiếp qua backend riêng của nó).
  if (e && e.parameter && e.parameter.api) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'forbidden' }))
      .setMimeType(ContentService.MimeType.JSON);
  }


  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Hệ Thống Tạo Báo Giá - Bee Z')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * doPost — JSON API cho FE ngoài (React /bao-gia) gọi trực tiếp bằng fetch,
 * thay cho google.script.run (vốn chỉ chạy trong iframe của Apps Script).
 *
 * FE gửi POST với Content-Type: text/plain (tránh CORS preflight — Apps Script
 * không xử lý được preflight OPTIONS). Body là JSON:
 *   { "action": "<tên hàm>", "payload": { ... } }
 *
 * Trả về ĐÚNG giá trị mà từng hàm trả (giữ nguyên shape mà UI cũ nhận qua
 * google.script.run), bọc trong JSON qua ContentService.
 * ContentService của web app đã tự set Access-Control-Allow-Origin: * nên
 * fetch cross-origin đọc được response bình thường.
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
      case 'getQuoteFiles':
        out = getQuoteFiles();
        break;
      case 'getQuoteDataFromFile':
        out = getQuoteDataFromFile(payload.fileId);
        break;
      case 'processQuoteDocument':
        out = processQuoteDocument(payload);
        break;
      case 'rollbackProcess':
        out = rollbackProcess(payload);
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


function getInitialData() {
  const ss = SpreadsheetApp.openById(DB_ID);
  const sheets = ['SX', 'TB', 'HC', 'HK'];
  let data = {};

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

  return {
    db: data,
    currentUser: Session.getActiveUser().getEmail().split('@')[0] || 'Admin'
  };
}


function getQuoteFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  let list = [];
  while (files.hasNext()) {
    const file = files.next();
    list.push({ id: file.getId(), name: file.getName() });
  }
  return list;
}


function getQuoteDataFromFile(fileId) {
  try {
    const doc = SpreadsheetApp.openById(fileId);
    const metadata = doc.getDeveloperMetadata();
    let savedData = {};
    metadata.forEach(m => {
      const k = m.getKey();
      if (k.startsWith('OPTION_') && !k.endsWith('_backup')) {
        savedData[k] = JSON.parse(m.getValue());
      }
    });
    const sheetNames = doc.getSheets().map(s => s.getName()).filter(n => !n.endsWith('_backup'));
    return { success: true, sheetNames: sheetNames, savedData: savedData };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}


function processQuoteDocument(payload) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau giây lát.' };
  try {
    const { actionType, formData, fileId, targetOptionName } = payload;
    // ---- Validate đầu vào (chống payload hỏng, số âm/chuỗi, quá tải insertRows) ----
    if (!formData || typeof formData !== 'object') throw new Error('Thiếu dữ liệu biểu mẫu.');
    if (['CREATE_NEW', 'ADD_OPTION', 'EDIT_OPTION'].indexOf(actionType) === -1) throw new Error('Loại thao tác không hợp lệ.');
    formData.items = formData.items || {};
    let totalItems = 0;
    ['SX', 'TB', 'HK', 'HC'].forEach(k => {
      if (!Array.isArray(formData.items[k])) formData.items[k] = [];
      formData.items[k].forEach(it => {
        it.dongia = Number(it.dongia) || 0;
        it.sl = Number(it.sl) || 1;
        it.sn = Number(it.sn) || 1;
        totalItems++;
      });
    });
    // Cap tổng số dòng để bảo vệ quota insertRows (6 phút / lệnh)
    if (totalItems > 300) throw new Error('Quá nhiều dòng (>300) — chia nhỏ báo giá.');
    const templateDoc = SpreadsheetApp.openById(TEMPLATE_ID);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    let newSs, newFile, sheet, pdfFile;

    let fileName = formData.sobg;
    if (formData.duann && formData.duann.trim() !== "") {
       fileName = formData.sobg + " - " + formData.duann.trim();
    }
    fileName = sanitizeName_(fileName);
    // Chống trùng tên khi TẠO MỚI (2 báo giá cùng phút) → tránh 2 file trùng + PDF đè xóa nhau
    if (actionType === 'CREATE_NEW') {
      let base = fileName, n = 2;
      while (folder.getFilesByName(fileName).hasNext() && n < 100) { fileName = base + ' (' + n + ')'; n++; }
    }


    if (actionType === 'CREATE_NEW') {
      newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(fileName, folder);
      newSs = SpreadsheetApp.openById(newFile.getId());
      sheet = newSs.getSheets()[0];
      sheet.setName('Option 1');
      newSs.addDeveloperMetadata('OPTION_Option 1', JSON.stringify(formData), SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
    } else if (actionType === 'ADD_OPTION') {
      newFile = DriveApp.getFileById(fileId);
      newSs = SpreadsheetApp.openById(fileId);
      if (!newSs.getSheets()[0].getName().startsWith('Option')) {
        newSs.getSheets()[0].setName('Option 1');
      }
      // Đặt tên theo SỐ LỚN NHẤT + 1 (tránh trùng khi có option ở giữa bị xóa)
      let maxOptN = 0;
      newSs.getSheets().forEach(s => { const mm = s.getName().match(/^Option (\d+)$/); if (mm) maxOptN = Math.max(maxOptN, parseInt(mm[1])); });
      const newOptionName = 'Option ' + (maxOptN + 1);
      const templateSheet = templateDoc.getSheets()[0];
      sheet = templateSheet.copyTo(newSs);
      sheet.setName(newOptionName);
      newSs.addDeveloperMetadata('OPTION_' + newOptionName, JSON.stringify(formData), SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
    } else if (actionType === 'EDIT_OPTION') {
      newFile = DriveApp.getFileById(fileId);
      newSs = SpreadsheetApp.openById(fileId);
      const oldSheet = newSs.getSheetByName(targetOptionName);
      if (oldSheet) oldSheet.setName(targetOptionName + '_backup');
      const templateSheet = templateDoc.getSheets()[0];
      sheet = templateSheet.copyTo(newSs);
      sheet.setName(targetOptionName);
      if (oldSheet) newSs.deleteSheet(oldSheet);
      const metas = newSs.getDeveloperMetadata();
      metas.forEach(m => { if(m.getKey() === 'OPTION_' + targetOptionName) m.remove(); });
      newSs.addDeveloperMetadata('OPTION_' + targetOptionName, JSON.stringify(formData), SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
    }


    // Hạn hiệu lực: ưu tiên ngày người dùng chọn (formData.hanHieuLuc); trống → +30 ngày kể từ hôm nay
    let nhl = '';
    if (formData.hanHieuLuc) {
      const dpart = String(formData.hanHieuLuc).split('T')[0];   // 'YYYY-MM-DD'
      const p = dpart.split('-');
      if (p.length === 3) nhl = `${p[2]}/${p[1]}/${p[0]}`;
    }
    if (!nhl) {
      const nhlDate = new Date();
      nhlDate.setDate(nhlDate.getDate() + 30);
      const dd = String(nhlDate.getDate()).padStart(2, '0');
      const mm = String(nhlDate.getMonth() + 1).padStart(2, '0');
      const yyyy = nhlDate.getFullYear();
      nhl = `${dd}/${mm}/${yyyy}`;
    }


    const replacements = {
      '{{sobg}}': formData.sobg, '{{duann}}': formData.duann, '{{phutrach}}': formData.phutrach,
      '{{yeucau}}': formData.yeucau, '{{khachhang}}': formData.khachhang, '{{mst}}': formData.mst,
      '{{tu}}': formData.tu ? formData.tu.replace('T', ' ') : '',
      '{{den}}': formData.den ? formData.den.replace('T', ' ') : '',
      '{{ck}}': formData.ckValue || 0, '{{tongtien_chu}}': formData.tongTienChu,
      '{{nhl}}': nhl
    };
    for (let key in replacements) { sheet.createTextFinder(key).replaceAllWith(replacements[key] || ''); }

    const blocks = [
      { key: 'sx', data: formData.items.SX }, { key: 'tb', data: formData.items.TB },
      { key: 'hk', data: formData.items.HK }, { key: 'hc', data: formData.items.HC }
    ];

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    let currentRomanIndex = 0;

    blocks.forEach((block, index) => {
      const { key, data } = block;
      const sttPlaceholder = `{{stt${index + 1}}}`;

      if (data && data.length > 0) {
        sheet.createTextFinder(sttPlaceholder).replaceAllWith(romanNumerals[currentRomanIndex]);
        currentRomanIndex++;

        const tenFinder = sheet.createTextFinder(`{{ten${key}}}`).findNext();
        if (tenFinder) {
          const startRow = tenFinder.getRow();
          if (data.length > 1) {
            sheet.insertRowsAfter(startRow, data.length - 1);
            const rangeToCopy = sheet.getRange(startRow, 1, 1, sheet.getLastColumn());
            for (let i = 1; i < data.length; i++) { rangeToCopy.copyTo(sheet.getRange(startRow + i, 1)); }
          }
          data.forEach((item, idx) => {
            const row = startRow + idx;
            const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
            rowRange.createTextFinder(`{{stt${key}}}`).replaceAllWith(idx + 1);
            rowRange.createTextFinder(`{{ten${key}}}`).replaceAllWith(item.ten || '');
            const ctText = item.ghichu || item.chitiet || '';
            rowRange.createTextFinder(`{{ct${key}}}`).replaceAllWith(ctText);
            rowRange.createTextFinder(`{{dg${key}}}`).replaceAllWith(item.dongia || 0);
            rowRange.createTextFinder(`{{sn${key}}}`).replaceAllWith(item.sn || 1);
            rowRange.createTextFinder(`{{sl${key}}}`).replaceAllWith(item.sl || 1);
            rowRange.createTextFinder(`{{dvt${key}}}`).replaceAllWith(item.dvt || '');
          });
        }
      } else {
        const sttFinder = sheet.createTextFinder(sttPlaceholder).findNext();
        if (sttFinder) { sheet.hideRows(sttFinder.getRow(), 1); }
        const tenFinder = sheet.createTextFinder(`{{ten${key}}}`).findNext();
        if (tenFinder) { sheet.hideRows(tenFinder.getRow(), 1); }

        sheet.createTextFinder(sttPlaceholder).replaceAllWith('');
        ['stt', 'ten', 'ct', 'dg', 'sn', 'sl', 'dvt'].forEach(prefix => {
           sheet.createTextFinder(`{{${prefix}${key}}}`).replaceAllWith('');
        });
      }
    });

    sheet.createTextFinder('{{stt5}}').replaceAllWith(romanNumerals[currentRomanIndex] || '');
    SpreadsheetApp.flush();


    // Dùng ĐÚNG tên file thực (ADD/EDIT giữ tên file gốc dù đổi tên dự án) → dọn đúng PDF cũ, không để rác
    const pdfBaseName = newFile.getName();
    let existingPdfs = folder.getFilesByName(pdfBaseName + '.pdf');
    while (existingPdfs.hasNext()) { existingPdfs.next().setTrashed(true); }


    const pdfBlob = newFile.getAs('application/pdf');
    pdfFile = folder.createFile(pdfBlob).setName(pdfBaseName + '.pdf');

    return {
      success: true,
      sobg: formData.sobg,
      fileName: fileName,
      pdfUrl: pdfFile.getUrl(),
      sheetUrl: newFile.getUrl(),
      fileId: newFile.getId(),
      currentOption: sheet.getName()
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}


// Hàm dọn dẹp khi người dùng bấm Hủy tiến trình
function rollbackProcess(payload) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return { success: false, message: 'Hệ thống đang bận, thử lại sau.' };
  try {
    const { actionType, resultData, targetOptionName } = payload;
    if (!resultData || !resultData.success) return { success: false };


    const folder = DriveApp.getFolderById(FOLDER_ID);
    const fileId = resultData.fileId;


    if (actionType === 'CREATE_NEW') {
      // Xóa toàn bộ file và PDF vừa tạo (dùng ĐÚNG tên file đã tạo, không phải sobg — PDF tên theo fileName)
      DriveApp.getFileById(fileId).setTrashed(true);
      const pdfName = (resultData.fileName || resultData.sobg) + '.pdf';
      const pdfs = folder.getFilesByName(pdfName);
      while(pdfs.hasNext()) pdfs.next().setTrashed(true);
    }
    else if (actionType === 'ADD_OPTION') {
      // Xóa sheet vừa thêm và metadata
      const ss = SpreadsheetApp.openById(fileId);
      const sheet = ss.getSheetByName(resultData.currentOption);
      if (sheet) ss.deleteSheet(sheet);
      const metas = ss.getDeveloperMetadata();
      metas.forEach(m => { if(m.getKey() === 'OPTION_' + resultData.currentOption) m.remove(); });
    }
    // EDIT_OPTION: hoàn tác được xử lý ở client (nộp lại data cũ dựng lại option),
    // KHÔNG rollback ở đây để tránh xóa nhầm mất option.
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

