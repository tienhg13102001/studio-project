// Types for the /bao-gia quote builder — mirrors the Google Apps Script Vue
// app's data model (back-end/scripts/google/index.html) so the React port
// and the doPost backend stay in lockstep.

export type CatKey = "SX" | "TB" | "HK" | "HC";

export type Service = {
  ten: string;
  chitiet: string;
  dongia: number;
  dvt: string;
};

export type QuoteItem = {
  id: string; // client key
  ten: string; // name
  chitiet: string; // legacy; kept "" in new data (backend reads ghichu||chitiet)
  dongia: number; // unit price VND (cap 1e12)
  dvt: string; // unit
  sl: number; // quantity, min 1
  sn: number; // days, default = calculatedDays
  snTouched: boolean; // UI: user edited sn manually
  ghichu: string; // note / description (source of truth)
  showNote: boolean; // UI: note textarea visible
};

export type QuoteForm = {
  sobg: string; // auto code, e.g. "BZ260710.1430"
  duann: string; // project/event
  phutrach: string; // default "Hoàn Nguyễn"
  yeucau: string;
  khachhang: string; // REQUIRED
  mst: string;
  tu: string; // "YYYY-MM-DDTHH:mm"
  den: string; // "YYYY-MM-DDTHH:mm"
  ckValue: number; // resolved discount, absolute VND
  hanHieuLuc: string; // "YYYY-MM-DD"
  items: Record<CatKey, QuoteItem[]>;
  tongTienChu?: string; // injected at submit = docTienChu(finalTotal)
};

export type ActionType = "CREATE_NEW" | "ADD_OPTION" | "EDIT_OPTION";

export type QuoteFile = { id: string; name: string };

export type ProcessPayload = {
  actionType: ActionType;
  formData: QuoteForm;
  fileId: string;
  targetOptionName: string;
};

export type ProcessResult = {
  success: boolean;
  sobg?: string;
  fileName?: string;
  pdfUrl?: string;
  sheetUrl?: string;
  fileId?: string;
  currentOption?: string;
  message?: string;
};

export type InitialData = {
  db: Record<CatKey, Service[]>;
  currentUser: string;
};

export type CategoryMeta = {
  key: CatKey;
  /** Tab label, e.g. "I. NHÂN SỰ" */
  tab: string;
  /** Short label, e.g. "Nhân Sự" */
  short: string;
  /** Preview section label, e.g. "NHÂN SỰ" */
  sectionLabel: string;
};

export const CATEGORIES: CategoryMeta[] = [
  { key: "SX", tab: "I. NHÂN SỰ", short: "Nhân Sự", sectionLabel: "NHÂN SỰ" },
  { key: "TB", tab: "II. THIẾT BỊ", short: "Thiết Bị", sectionLabel: "THIẾT BỊ" },
  { key: "HK", tab: "III. HẬU KỲ", short: "Hậu Kỳ", sectionLabel: "HẬU KỲ" },
  { key: "HC", tab: "IV. HẬU CẦN", short: "Hậu Cần", sectionLabel: "HẬU CẦN" },
];
