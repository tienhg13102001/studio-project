// Types for the /hop-dong contract builder — mirrors the Google Apps Script Vue
// app's data model (back-end/scripts/google/hop-dong/index.html) and the doPost
// backend (back-end/scripts/google/hop-dong/Mã.gs) so the React port, the payloads
// and the backend stay in lockstep. Sibling of src/lib/quote/types.ts.

export type CatKey = "SX" | "TB" | "HK" | "HC";

export type Service = {
  ten: string;
  chitiet: string;
  dongia: number;
  dvt: string;
};

// A contract pricing line. Backend (_buildScopeTable/_buildPricingTable) reads
// ten, dvt, sl, sn, dongia, chitiet; line total = dongia * (sl||1) * (sn||1).
export type ContractItem = {
  id: string; // client key
  ten: string; // name
  chitiet: string; // detail / note (scope table, Điều 2)
  dongia: number; // unit price VND
  dvt: string; // unit
  sl: number; // quantity, min 1
  sn: number; // days, default 1 (>1 renders "sl × sn ngày")
  showNote: boolean; // UI: chitiet textarea visible
};

// The editable contract form (matches the Vue app's `form` object 1:1).
export type ContractForm = {
  // ── Contract meta ──
  sohdDate: string; // "YYYYMMDD" — builds the contract number + file name
  sohd: string; // full contract number, auto-built by _updateSohd
  brand: string; // brand/customer short code (part of sohd)
  ngayky: string; // sign date "YYYY-MM-DD"

  // ── Bên A (client) ──
  tencty: string; // company name — REQUIRED
  diachi: string; // address
  mst: string; // tax code
  nguoidaidien: string; // representative — REQUIRED
  chucvu: string; // rep title (default "Giám đốc")
  email: string;
  sdt: string; // phone

  // ── Điều 1 content ──
  duann: string; // project name
  motadv: string; // service description (Điều 1.1)
  tu: string; // start "YYYY-MM-DDTHH:mm"
  den: string; // end   "YYYY-MM-DDTHH:mm"
  thoigianText: string; // human time-range (Điều 1.2), auto from tu/den
  diadiem: string; // location (Điều 1.3)

  // ── Pricing (Điều 3) ──
  applyVat: boolean; // default true
  vatPct: number; // default 8
  ck: number; // chiết khấu (discount, absolute VND)
  payDays: number; // payment window days (default 15), feeds presets
  thanhtoantxt: string; // payment method clause — REQUIRED (progress)
  ghichu: string; // extra notes appended after clauses

  items: Record<CatKey, ContractItem[]>;
};

// Derived totals merged into formData at submit time (not user-editable).
export type ContractSubmitData = ContractForm & {
  subTotal: number;
  afterCk: number;
  vatAmount: number;
  tonggiatri: number;
  tonggiatriChu: string; // docTienChu(tonggiatri)
};

export type ContractActionType = "CREATE_NEW" | "EDIT";

export type ContractFile = { id: string; name: string };

export type ProcessContractPayload = {
  actionType: ContractActionType;
  fileId?: string;
  formData: ContractSubmitData;
};

export type ProcessContractResult = {
  success: boolean;
  sohd?: string;
  pdfUrl?: string;
  docUrl?: string;
  fileId?: string;
  ma?: string;
  message?: string;
};

// Shared result shape for BBNT + DNTT documents.
export type ProcessDocResult = {
  success: boolean;
  docUrl?: string;
  pdfUrl?: string;
  fileId?: string;
  ma?: string;
  message?: string;
};

export type InitialData = {
  db: Record<CatKey, Service[]>;
};

export type CheckSohdResult = { exists: boolean; name?: string; error?: string };

// ── Import from báo giá (BZ quote sheets) ──
export type BaoGiaFile = { id: string; name: string };

export type BaoGiaOption = {
  khachhang?: string;
  mst?: string;
  duann?: string;
  tu?: string;
  den?: string;
  ckValue?: number;
  items?: Record<CatKey, Partial<ContractItem>[]>;
  subTotal?: number;
  _liveSheet?: boolean;
  [k: string]: unknown;
};

export type BaoGiaDataResult = {
  success: boolean;
  sheetNames?: string[];
  savedData?: Record<string, BaoGiaOption>; // keyed "OPTION_<sheetName>"
  message?: string;
};

// ── getContractDataLive (BBNT/DNTT prefill) ──
export type ContractLiveItem = {
  ten: string;
  dvt: string;
  sl: number;
  dongia: number;
  tt: number;
};

export type ContractLive = {
  snapshot: Partial<ContractForm> & { tonggiatri?: number };
  fromSnapshot: boolean;
  error?: string;
  live: {
    items: ContractLiveItem[];
    ck: number;
    vatPct: number;
    vatAmount: number;
    subTotal: number;
    total: number;
    applyVat: boolean;
  };
};

// ── BBNT (Biên bản nghiệm thu) ──
export type BBNTItem = {
  ten: string;
  dvt: string;
  sl: number;
  dongia: number;
  tt?: number; // line total base (default dongia * sl)
  tyle: number | ""; // acceptance % (default 100); accepted = round(tt * tyle / 100)
};

export type BBNTForm = {
  contractId: string;
  loading: boolean;
  fromSnapshot: boolean;
  sohd: string;
  sohdDate: string;
  ngayky: string;
  brand: string;
  duann: string;
  tencty: string;
  diachi: string;
  mst: string;
  nguoidaidien: string;
  chucvu: string;
  items: BBNTItem[];
  vatPct: number;
  applyVat: boolean;
  daTT: number; // amount already paid
  ngayNthu: string; // acceptance date
  deliverables: string; // multiline deliverables
};

// Payload sent to processBBNT (server-facing subset + computed words).
export type BBNTPayload = {
  sohdDate: string;
  brand: string;
  duann: string;
  sohd: string;
  ngayky: string;
  ngayNthu: string;
  tencty: string;
  nguoidaidien: string;
  chucvu: string;
  diachi: string;
  mst: string;
  sanPham: string;
  daTT: number;
  conPhaiChu: string;
  vatPct: number;
  applyVat: boolean;
  items: BBNTItem[];
};

// ── DNTT (Đề nghị thanh toán) ──
export type DNTTForm = {
  contractId: string;
  loading: boolean;
  sohd: string;
  sohdDate: string;
  brand: string;
  duann: string;
  tencty: string;
  soBBNT: string;
  soTien: number;
  soTienNote: string;
  soNgayText: string;
  ngay: string;
};

// Payload sent to processDNTT.
export type DNTTPayload = {
  sohdDate: string;
  brand: string;
  duann: string;
  soDntt: string;
  tencty: string;
  sohd: string;
  soBBNT: string;
  soTienNote: string;
  soTien: number;
  soTienChu: string;
  soNgayText: string;
  ngay: string;
};

export type CategoryMeta = {
  key: CatKey;
  /** Tab label, e.g. "I. NHÂN SỰ" */
  tab: string;
  /** Short label, e.g. "Nhân sự" */
  short: string;
  /** Preview section label, e.g. "NHÂN SỰ" */
  sectionLabel: string;
};

// Display order matches the Vue app's `tabs`: SX, TB, HK, HC.
export const CATEGORIES: CategoryMeta[] = [
  { key: "SX", tab: "I. NHÂN SỰ", short: "Nhân sự", sectionLabel: "NHÂN SỰ" },
  { key: "TB", tab: "II. THIẾT BỊ", short: "Thiết bị", sectionLabel: "THIẾT BỊ" },
  { key: "HK", tab: "III. HẬU KỲ", short: "Hậu kỳ", sectionLabel: "HẬU KỲ" },
  { key: "HC", tab: "IV. HẬU CẦN", short: "Hậu cần", sectionLabel: "HẬU CẦN" },
];

export const CAT_KEYS: CatKey[] = ["SX", "TB", "HK", "HC"];
