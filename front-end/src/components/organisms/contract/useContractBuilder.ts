// State + logic for the /hop-dong contract builder. Ports the Vue app's data,
// computed, watchers and methods (back-end/scripts/google/hop-dong/index.html)
// into a single React hook. Pure calc/format/api helpers live in #lib/contract.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  afterDiscount,
  dateCode,
  docTienChu,
  grandSubtotal,
  newItemId,
  vatAmount as calcVat,
} from "#lib/contract/calc";
import { formatDateOnly, parseMoney } from "#lib/contract/format";
import {
  checkSohdExists,
  getBaoGiaDataFromFile,
  getBaoGiaFiles,
  getContractData,
  getContractDataLive,
  getContractFiles,
  getInitialData,
  processBBNT,
  processContract,
  processDNTT,
  rollbackContract,
} from "#lib/contract/contractApi";
import type {
  BaoGiaFile,
  BBNTForm,
  BBNTItem,
  CatKey,
  ContractActionType,
  ContractFile,
  ContractForm,
  ContractItem,
  DNTTForm,
  ProcessContractResult,
  ProcessDocResult,
  Service,
} from "#lib/contract/types";
import { CAT_KEYS } from "#lib/contract/types";
import { DV_PRESETS, PAYMENT_PRESETS } from "./constants";

export type AppMode = "NEW" | "EDIT" | "IMPORT" | "BBNT" | "DNTT";
export type ToastType = "err" | "ok" | "info";
export type Toast = { id: number; type: ToastType; msg: string };
export type SecState = { sohd: boolean; bena: boolean; noidung: boolean; thanhtoan: boolean };
export type ModalsState = { confirm: boolean; loading: boolean; success: boolean; picker: boolean };
export type DateTarget = "form" | "bbnt" | "dntt";

function emptyItems(): Record<CatKey, ContractItem[]> {
  return { SX: [], TB: [], HK: [], HC: [] };
}

function emptyForm(): ContractForm {
  return {
    sohdDate: "",
    sohd: "",
    brand: "",
    ngayky: "",
    tencty: "",
    diachi: "",
    mst: "",
    nguoidaidien: "",
    chucvu: "Giám đốc",
    email: "",
    sdt: "",
    duann: "",
    motadv: "",
    tu: "",
    den: "",
    thoigianText: "",
    diadiem: "",
    applyVat: true,
    vatPct: 8,
    ck: 0,
    payDays: 15,
    thanhtoantxt: "",
    ghichu: "",
    items: emptyItems(),
  };
}

function emptyBBNT(): BBNTForm {
  return {
    contractId: "",
    loading: false,
    fromSnapshot: false,
    sohd: "",
    sohdDate: "",
    ngayky: "",
    brand: "",
    duann: "",
    tencty: "",
    diachi: "",
    mst: "",
    nguoidaidien: "",
    chucvu: "Giám đốc",
    items: [],
    vatPct: 8,
    applyVat: true,
    daTT: 0,
    ngayNthu: "",
    deliverables: "",
  };
}

function emptyDNTT(): DNTTForm {
  return {
    contractId: "",
    loading: false,
    sohd: "",
    sohdDate: "",
    brand: "",
    duann: "",
    tencty: "",
    soBBNT: "",
    soTien: 0,
    soTienNote: "100% giá trị hợp đồng đã bao gồm VAT",
    soNgayText: "15 (mười lăm)",
    ngay: "",
  };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildSohd(sohdDate: string, brand: string): string {
  return `${sohdDate}/HĐDV/${brand ? "BeeZ-" + brand : "BeeZ"}`;
}

function normalizeItem(raw: Partial<ContractItem>): ContractItem {
  return {
    id: newItemId(),
    ten: raw.ten || "",
    chitiet: raw.chitiet || "",
    dongia: Number(raw.dongia) || 0,
    dvt: raw.dvt || "",
    sl: Number(raw.sl) || 1,
    sn: Number(raw.sn) || 1,
    showNote: false,
  };
}

function bbntItemNthu(it: BBNTItem): number {
  const tt = Number(it.tt) || (Number(it.dongia) || 0) * (Number(it.sl) || 1);
  const tyle = it.tyle === "" || it.tyle == null ? 100 : Number(it.tyle) || 0;
  return Math.round((tt * tyle) / 100);
}

export type ContractBuilder = ReturnType<typeof useContractBuilder>;

export function useContractBuilder() {
  const [form, setForm] = useState<ContractForm>(emptyForm);
  const [db, setDb] = useState<Record<CatKey, Service[]>>(() => ({
    SX: [],
    TB: [],
    HK: [],
    HC: [],
  }));

  const [appMode, setAppMode] = useState<AppMode>("NEW");
  const [activeTab, setActiveTab] = useState<CatKey>("SX");
  const [viewMode, setViewMode] = useState<"form" | "split">("split");
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sec, setSec] = useState<SecState>({
    sohd: false,
    bena: false,
    noidung: false,
    thanhtoan: false,
  });

  const [errTencty, setErrTencty] = useState(false);
  const [errDaidien, setErrDaidien] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState<Record<string, string>[]>([]);
  const [dupWarn, setDupWarn] = useState("");

  // EDIT
  const [contractList, setContractList] = useState<ContractFile[]>([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");

  // IMPORT (from báo giá)
  const [bzFileList, setBzFileList] = useState<BaoGiaFile[]>([]);
  const [bzSearchQuery, setBzSearchQuery] = useState("");
  const [selectedBZId, setSelectedBZId] = useState("");
  const [bzOptionList, setBzOptionList] = useState<string[]>([]);
  const [selectedBZOption, setSelectedBZOption] = useState("");
  const [bzHiddenData, setBzHiddenData] = useState<Record<string, Record<string, unknown>>>({});

  // Presets
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [selectedDvPreset, setSelectedDvPreset] = useState<number | null>(null);

  // BBNT / DNTT
  const [bbnt, setBbnt] = useState<BBNTForm>(emptyBBNT);
  const [bbntSearchQuery, setBbntSearchQuery] = useState("");
  const [dntt, setDntt] = useState<DNTTForm>(emptyDNTT);
  const [dnttSearchQuery, setDnttSearchQuery] = useState("");

  // Modals & submit
  const [modals, setModals] = useState<ModalsState>({
    confirm: false,
    loading: false,
    success: false,
    picker: false,
  });
  const [pendingAction, setPendingAction] = useState<ContractActionType>("CREATE_NEW");
  const [resultData, setResultData] = useState<ProcessContractResult>({ success: false });
  const [progressValue, setProgressValue] = useState(0);
  const [isProcessingDone, setIsProcessingDone] = useState(false);
  const [copyDocSuccess, setCopyDocSuccess] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Draft
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // Refs
  const toastId = useRef(0);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDraft = useRef<ContractForm | null>(null);
  const isCancelledRef = useRef(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  const bbntRef = useRef(bbnt);
  useEffect(() => {
    bbntRef.current = bbnt;
  }, [bbnt]);
  const dnttRef = useRef(dntt);
  useEffect(() => {
    dnttRef.current = dntt;
  }, [dntt]);

  // ─── Derived (contract) ─────────────────────────────────────────────────
  const subTotal = useMemo(() => grandSubtotal(form.items), [form.items]);
  const afterCk = useMemo(() => afterDiscount(subTotal, form.ck), [subTotal, form.ck]);
  const vatAmount = useMemo(
    () => calcVat(afterCk, form.vatPct, form.applyVat),
    [afterCk, form.vatPct, form.applyVat],
  );
  const tonggiatri = useMemo(() => afterCk + vatAmount, [afterCk, vatAmount]);
  const tongTienChu = useMemo(() => docTienChu(tonggiatri), [tonggiatri]);

  const tabSubTotals = useMemo(() => {
    const totals = {} as Record<CatKey, number>;
    for (const key of CAT_KEYS) {
      totals[key] = form.items[key].reduce(
        (s, i) => s + (i.dongia || 0) * (i.sl || 1) * (i.sn || 1),
        0,
      );
    }
    return totals;
  }, [form.items]);

  const progDone = useMemo(() => {
    let n = 0;
    if (form.tencty && form.tencty.trim()) n++;
    if (CAT_KEYS.some((k) => form.items[k].some((i) => (i.ten && i.ten.trim()) || i.dongia > 0)))
      n++;
    if (form.tu || form.den) n++;
    if (form.thanhtoantxt && form.thanhtoantxt.trim()) n++;
    return n;
  }, [form]);
  const progPct = Math.round((progDone / 4) * 100);

  const sohdDisplay = useMemo(
    () => form.sohd || `${form.sohdDate}/HĐDV/BeeZ`,
    [form.sohd, form.sohdDate],
  );

  const filteredContracts = useMemo(() => {
    if (!fileSearchQuery) return contractList;
    return contractList.filter((f) =>
      f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()),
    );
  }, [contractList, fileSearchQuery]);

  const filteredBZFiles = useMemo(() => {
    if (!bzSearchQuery) return bzFileList;
    return bzFileList.filter((f) => f.name.toLowerCase().includes(bzSearchQuery.toLowerCase()));
  }, [bzFileList, bzSearchQuery]);

  // ─── Derived (BBNT) ─────────────────────────────────────────────────────
  const bbntSumNthu = useMemo(
    () => bbnt.items.reduce((s, it) => s + bbntItemNthu(it), 0),
    [bbnt.items],
  );
  const bbntVat = useMemo(
    () => (bbnt.applyVat ? Math.round((bbntSumNthu * (Number(bbnt.vatPct) || 0)) / 100) : 0),
    [bbnt.applyVat, bbnt.vatPct, bbntSumNthu],
  );
  const bbntTong = useMemo(() => bbntSumNthu + bbntVat, [bbntSumNthu, bbntVat]);
  const bbntConPhai = useMemo(
    () => Math.max(0, bbntTong - (Number(bbnt.daTT) || 0)),
    [bbntTong, bbnt.daTT],
  );
  const bbntConPhaiChu = useMemo(() => docTienChu(bbntConPhai), [bbntConPhai]);

  const filteredBBNTContracts = useMemo(() => {
    if (!bbntSearchQuery) return contractList;
    return contractList.filter((f) =>
      f.name.toLowerCase().includes(bbntSearchQuery.toLowerCase()),
    );
  }, [contractList, bbntSearchQuery]);

  // ─── Derived (DNTT) ─────────────────────────────────────────────────────
  const dnttSoDntt = useMemo(() => (dntt.sohd || "").replace("HĐDV", "ĐNTT"), [dntt.sohd]);
  const dnttSoTienChu = useMemo(() => docTienChu(Number(dntt.soTien) || 0), [dntt.soTien]);
  const filteredDNTTContracts = useMemo(() => {
    if (!dnttSearchQuery) return contractList;
    return contractList.filter((f) =>
      f.name.toLowerCase().includes(dnttSearchQuery.toLowerCase()),
    );
  }, [contractList, dnttSearchQuery]);

  const modalOpen = modals.confirm || modals.loading || modals.success || modals.picker;

  // ─── Toasts ─────────────────────────────────────────────────────────────
  const removeToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);
  const toast = useCallback(
    (msg: string, type: ToastType = "info") => {
      const id = ++toastId.current;
      setToasts((list) => [...list, { id, msg, type }]);
      setTimeout(() => removeToast(id), 3600);
    },
    [removeToast],
  );

  // ─── Field setters ──────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof ContractForm>(field: K, value: ContractForm[K]) => {
      setForm((f) => ({ ...f, [field]: value }));
    },
    [],
  );
  const setBBNTField = useCallback(
    <K extends keyof BBNTForm>(field: K, value: BBNTForm[K]) => {
      setBbnt((b) => ({ ...b, [field]: value }));
    },
    [],
  );
  const setDNTTField = useCallback(
    <K extends keyof DNTTForm>(field: K, value: DNTTForm[K]) => {
      setDntt((d) => ({ ...d, [field]: value }));
    },
    [],
  );

  const toggleSec = useCallback((key: keyof SecState) => {
    setSec((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  // Auto contract number: sohd = sohdDate/HĐDV/BeeZ[-brand] (ports Vue watcher).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => {
      const next = buildSohd(f.sohdDate, f.brand);
      return f.sohd === next ? f : { ...f, sohd: next };
    });
  }, [form.sohdDate, form.brand]);

  // thoigianText from tu/den (ports Vue watcher).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => {
      let text = "";
      if (f.tu && f.den) {
        text = `ngày ${formatDateOnly(f.tu)} đến ngày ${formatDateOnly(f.den)}`;
      } else if (f.tu) {
        text = `ngày ${formatDateOnly(f.tu)}`;
      }
      return f.thoigianText === text ? f : { ...f, thoigianText: text };
    });
  }, [form.tu, form.den]);

  // ─── Items ──────────────────────────────────────────────────────────────
  const updateItem = useCallback((tab: CatKey, index: number, patch: Partial<ContractItem>) => {
    setForm((f) => {
      const arr = f.items[tab].slice();
      arr[index] = { ...arr[index], ...patch };
      return { ...f, items: { ...f.items, [tab]: arr } };
    });
  }, []);
  const addItem = useCallback((tab: CatKey) => {
    setForm((f) => ({
      ...f,
      items: { ...f.items, [tab]: [...f.items[tab], normalizeItem({})] },
    }));
  }, []);
  const removeItem = useCallback((tab: CatKey, index: number) => {
    setForm((f) => {
      const arr = f.items[tab].slice();
      arr.splice(index, 1);
      return { ...f, items: { ...f.items, [tab]: arr } };
    });
  }, []);
  const onPriceInput = useCallback(
    (tab: CatKey, index: number, raw: string) => {
      updateItem(tab, index, { dongia: parseMoney(raw) });
    },
    [updateItem],
  );
  const selectService = useCallback(
    (tab: CatKey, index: number, opt: Service) => {
      updateItem(tab, index, {
        ten: opt.ten,
        dongia: opt.dongia,
        dvt: opt.dvt,
        chitiet: opt.chitiet || "",
      });
    },
    [updateItem],
  );
  const filteredServices = useCallback(
    (tabId: CatKey, query: string): Service[] => {
      if (!query) return db[tabId];
      return db[tabId].filter((s) => s.ten.toLowerCase().includes(query.toLowerCase()));
    },
    [db],
  );

  // ─── Service picker ─────────────────────────────────────────────────────
  const openPicker = useCallback(() => setModals((m) => ({ ...m, picker: true })), []);
  const closePicker = useCallback(() => setModals((m) => ({ ...m, picker: false })), []);
  const pickerServices = useCallback(
    (tabId: CatKey, query: string): Service[] => {
      if (!query) return db[tabId] || [];
      return (db[tabId] || []).filter((s) => s.ten.toLowerCase().includes(query.toLowerCase()));
    },
    [db],
  );
  const addPicked = useCallback(
    (selected: Record<string, boolean>) => {
      let n = 0;
      setForm((f) => {
        const items = clone(f.items);
        for (const key of Object.keys(selected)) {
          if (!selected[key]) continue;
          const i = key.indexOf("::");
          const tabId = key.slice(0, i) as CatKey;
          const ten = key.slice(i + 2);
          const s = (db[tabId] || []).find((x) => x.ten === ten);
          if (s) {
            items[tabId].push(
              normalizeItem({ ten: s.ten, chitiet: s.chitiet, dongia: s.dongia, dvt: s.dvt }),
            );
            n++;
          }
        }
        return { ...f, items };
      });
      setModals((m) => ({ ...m, picker: false }));
      toast(n ? `Đã thêm ${n} mục` : "Chưa chọn mục nào", "ok");
    },
    [db, toast],
  );

  // ─── Discount ───────────────────────────────────────────────────────────
  const setCkPct = useCallback(
    (p: number) => {
      setForm((f) => ({ ...f, ck: p ? Math.round((subTotal * p) / 100) : 0 }));
    },
    [subTotal],
  );
  const onCkInput = useCallback((raw: string) => {
    const n = parseInt(String(raw).replace(/[^\d]/g, ""), 10) || 0;
    setForm((f) => ({ ...f, ck: n }));
  }, []);

  // ─── Presets ────────────────────────────────────────────────────────────
  const selectPreset = useCallback((i: number) => {
    setSelectedPreset(i);
    const preset = PAYMENT_PRESETS[i];
    if (preset && preset.tmpl) {
      const tmpl = preset.tmpl;
      setForm((f) => ({ ...f, thanhtoantxt: tmpl(f.payDays) }));
    }
  }, []);
  // Rebuild clause when payDays changes and a preset is active.
  useEffect(() => {
    if (selectedPreset == null) return;
    const preset = PAYMENT_PRESETS[selectedPreset];
    if (!preset || !preset.tmpl) return;
    const tmpl = preset.tmpl;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => {
      const next = tmpl(f.payDays);
      return f.thanhtoantxt === next ? f : { ...f, thanhtoantxt: next };
    });
  }, [form.payDays, selectedPreset]);

  const selectDvPreset = useCallback((i: number) => {
    setSelectedDvPreset(i);
    setForm((f) => ({ ...f, motadv: DV_PRESETS[i] }));
  }, []);
  // Clear DV preset selection if motadv no longer matches it.
  useEffect(() => {
    if (selectedDvPreset != null && DV_PRESETS[selectedDvPreset] !== form.motadv) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDvPreset(null);
    }
  }, [form.motadv, selectedDvPreset]);

  // ─── Customers (localStorage) ───────────────────────────────────────────
  const loadCustomers = useCallback(() => {
    try {
      const raw = localStorage.getItem("hd_customers");
      if (raw) setSavedCustomers(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const saveCustomer = useCallback((f: ContractForm) => {
    if (!f.tencty || !f.tencty.trim()) return;
    const rec = {
      tencty: f.tencty,
      mst: f.mst,
      diachi: f.diachi,
      nguoidaidien: f.nguoidaidien,
      chucvu: f.chucvu,
      email: f.email,
      sdt: f.sdt,
    };
    setSavedCustomers((list) => {
      const next = [rec, ...list.filter((c) => c.tencty !== rec.tencty)].slice(0, 50);
      try {
        localStorage.setItem("hd_customers", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  const applyCustomer = useCallback(
    (name: string) => {
      const c = savedCustomers.find((x) => x.tencty === name);
      if (!c) return;
      setForm((f) => ({
        ...f,
        mst: c.mst || "",
        diachi: c.diachi || "",
        nguoidaidien: c.nguoidaidien || "",
        chucvu: c.chucvu || "Giám đốc",
        email: c.email || "",
        sdt: c.sdt || "",
      }));
    },
    [savedCustomers],
  );

  // ─── Drafts (localStorage hd_draft) ─────────────────────────────────────
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem("hd_draft");
    } catch {
      /* ignore */
    }
    setDraftSavedAt("");
    setDraftRestored(false);
    setHasDraft(false);
  }, []);

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        const meaningful =
          form.tencty || form.duann || form.ghichu || CAT_KEYS.some((k) => form.items[k].length);
        if (meaningful) {
          localStorage.setItem("hd_draft", JSON.stringify({ form, ts: Date.now() }));
          const p = (n: number) => String(n).padStart(2, "0");
          const t = new Date();
          setDraftSavedAt(`${p(t.getHours())}:${p(t.getMinutes())}`);
          setHasDraft(false);
        }
      } catch {
        /* ignore */
      }
    }, 800);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [form]);

  const restoreDraftNow = useCallback(() => {
    if (!pendingDraft.current) return;
    setForm((f) => ({ ...f, ...(pendingDraft.current as ContractForm) }));
    setDraftRestored(true);
    setHasDraft(false);
    setTimeout(() => setDraftRestored(false), 4500);
  }, []);

  // ─── Modes ──────────────────────────────────────────────────────────────
  const refreshContractList = useCallback(() => {
    getContractFiles()
      .then((res) => setContractList(Array.isArray(res) ? res : []))
      .catch((err: unknown) => toast("Không tải được danh sách hợp đồng: " + errMsg(err), "err"));
  }, [toast]);

  const refreshBZList = useCallback(() => {
    getBaoGiaFiles()
      .then((res) => setBzFileList(Array.isArray(res) ? res : []))
      .catch((err: unknown) => toast("Không tải được danh sách báo giá: " + errMsg(err), "err"));
  }, [toast]);

  const setMode = useCallback(
    (mode: AppMode) => {
      setAppMode(mode);
      if (mode === "NEW" || mode === "IMPORT") {
        setSelectedContractId("");
      }
      if (mode === "IMPORT") {
        setSelectedBZId("");
        setBzOptionList([]);
        setSelectedBZOption("");
        refreshBZList();
      } else if (mode === "EDIT" || mode === "BBNT" || mode === "DNTT") {
        refreshContractList();
      }
    },
    [refreshContractList, refreshBZList],
  );

  const selectContract = useCallback(
    (f: ContractFile) => {
      setSelectedContractId(f.id);
      getContractData(f.id)
        .then((res) => {
          if (res.success && res.formData) {
            setForm((prev) => {
              const merged = { ...prev, ...(res.formData as ContractForm) };
              // ensure item ids for React keys
              for (const k of CAT_KEYS) {
                merged.items[k] = ((res.formData!.items?.[k] as ContractItem[]) || []).map((it) =>
                  it.id ? it : { ...normalizeItem(it), ...it, id: newItemId() },
                );
              }
              return merged;
            });
            setPendingAction("EDIT");
          } else {
            toast("Lỗi khi đọc hợp đồng: " + (res.message || ""), "err");
          }
        })
        .catch((err: unknown) => toast("Không đọc được hợp đồng: " + errMsg(err), "err"));
    },
    [toast],
  );

  // ─── Import from báo giá ────────────────────────────────────────────────
  const selectBZFile = useCallback(
    (f: BaoGiaFile) => {
      setSelectedBZId(f.id);
      setBzOptionList([]);
      setSelectedBZOption("");
      setBzHiddenData({});
      getBaoGiaDataFromFile(f.id)
        .then((res) => {
          if (res.success) {
            setBzOptionList(res.sheetNames || []);
            setBzHiddenData((res.savedData as Record<string, Record<string, unknown>>) || {});
          } else {
            toast("Lỗi khi đọc báo giá: " + (res.message || ""), "err");
          }
        })
        .catch((err: unknown) => toast("Không đọc được báo giá: " + errMsg(err), "err"));
    },
    [toast],
  );

  const selectBZOption = useCallback(
    (opt: string) => {
      setSelectedBZOption(opt);
      const bz = bzHiddenData["OPTION_" + opt] as Record<string, unknown> | undefined;
      if (!bz) return;
      const bzItems = (bz.items as Record<CatKey, Partial<ContractItem>[]>) || emptyItems();
      setForm((f) => {
        const items = emptyItems();
        for (const k of CAT_KEYS) {
          items[k] = (bzItems[k] || []).map((it) => normalizeItem(it));
        }
        return {
          ...f,
          tencty: (bz.khachhang as string) || f.tencty,
          mst: (bz.mst as string) || f.mst,
          duann: (bz.duann as string) || f.duann,
          tu: (bz.tu as string) || f.tu,
          den: (bz.den as string) || f.den,
          ck: (bz.ckValue as number) || 0,
          items,
        };
      });
      toast("Đã nạp dữ liệu từ báo giá", "ok");
    },
    [bzHiddenData, toast],
  );

  // ─── Progress runner (shared) ───────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, []);

  const runProgress = useCallback(
    (
      run: () => Promise<ProcessContractResult | ProcessDocResult>,
      opts?: { onCancel?: (res: ProcessContractResult | ProcessDocResult) => void },
    ) => {
      setModals((m) => ({ ...m, confirm: false, loading: true }));
      isCancelledRef.current = false;
      setProgressValue(0);
      setIsProcessingDone(false);

      let done = false;
      let resp: ProcessContractResult | ProcessDocResult | null = null;

      run()
        .then((res) => {
          if (isCancelledRef.current) {
            opts?.onCancel?.(res);
            return;
          }
          done = true;
          resp = res;
        })
        .catch((err: unknown) => {
          isCancelledRef.current = true;
          clearTimers();
          setModals((m) => ({ ...m, loading: false }));
          toast("Lỗi tạo file: " + errMsg(err), "err");
        });

      const start = Date.now();
      const duration = 2400;
      progressInterval.current = setInterval(() => {
        if (isCancelledRef.current) {
          clearTimers();
          return;
        }
        if (done && resp && !resp.success) {
          clearTimers();
          setModals((m) => ({ ...m, loading: false }));
          toast("Lỗi tạo file: " + (resp.message || "Unknown"), "err");
          return;
        }
        const elapsed = ((Date.now() - start) / duration) * 100;
        const cap = done ? 100 : 92;
        const pc = Math.min(cap, elapsed);
        if (done && pc >= 100) {
          setProgressValue(100);
          clearTimers();
          const res = resp!;
          if (res.success) {
            const sohd = ("sohd" in res ? res.sohd : undefined) || res.ma;
            setResultData({ ...res, sohd });
            setIsProcessingDone(true);
            setTimeout(() => setModals((m) => ({ ...m, loading: false, success: true })), 900);
          } else {
            setModals((m) => ({ ...m, loading: false }));
            toast("Lỗi tạo file: " + (res.message || "Unknown"), "err");
          }
        } else {
          setProgressValue(pc);
        }
      }, 50);
    },
    [clearTimers, toast],
  );

  const cancelCreate = useCallback(() => {
    isCancelledRef.current = true;
    clearTimers();
    setModals((m) => ({ ...m, loading: false }));
  }, [clearTimers]);

  // ─── Contract: validate + confirm + execute ─────────────────────────────
  const validateContract = useCallback((): boolean => {
    const missing: string[] = [];
    setErrTencty(false);
    setErrDaidien(false);
    if (!form.tencty || !form.tencty.trim()) {
      missing.push("Tên công ty");
      setErrTencty(true);
    }
    if (!form.nguoidaidien || !form.nguoidaidien.trim()) {
      missing.push("Người đại diện");
      setErrDaidien(true);
    }
    const hasItem = CAT_KEYS.some((k) =>
      form.items[k].some((i) => (i.ten && i.ten.trim()) || i.dongia > 0),
    );
    if (!hasItem) missing.push("ít nhất 1 hạng mục");
    if (missing.length) {
      toast("Chưa nhập: " + missing.join(", "), "err");
      setSec((s) => ({ ...s, bena: false }));
      return false;
    }
    return true;
  }, [form, toast]);

  const confirmCreate = useCallback(() => {
    if (!validateContract()) return;
    const action: ContractActionType = appMode === "EDIT" ? "EDIT" : "CREATE_NEW";
    setPendingAction(action);
    setDupWarn("");
    setModals((m) => ({ ...m, confirm: true }));
    if (action === "CREATE_NEW") {
      checkSohdExists(form.sohdDate, form.brand)
        .then((r) => {
          if (r.exists) setDupWarn(r.name || "");
        })
        .catch(() => {
          /* ignore */
        });
    }
  }, [validateContract, appMode, form.sohdDate, form.brand]);

  const closeConfirm = useCallback(() => setModals((m) => ({ ...m, confirm: false })), []);

  const executeProcess = useCallback(() => {
    const action = pendingAction;
    const submit = {
      ...formRef.current,
      subTotal,
      afterCk,
      vatAmount,
      tonggiatri,
      tonggiatriChu: tongTienChu,
    };
    runProgress(
      () =>
        processContract({
          actionType: action,
          fileId: selectedContractId || "",
          formData: submit,
        }),
      {
        onCancel: (res) => {
          rollbackContract({
            actionType: action,
            resultData: res as ProcessContractResult,
          }).catch(() => {
            /* ignore */
          });
        },
      },
    );
    // side-effects on success are handled below via effect on resultData
  }, [
    pendingAction,
    subTotal,
    afterCk,
    vatAmount,
    tonggiatri,
    tongTienChu,
    selectedContractId,
    runProgress,
  ]);

  // After a successful contract create/edit, persist customer + remember file id.
  const successHandledRef = useRef<string>("");
  useEffect(() => {
    if (!modals.success || !resultData.success) return;
    const key = resultData.fileId || resultData.sohd || "";
    if (successHandledRef.current === key) return;
    successHandledRef.current = key;
    if (appMode === "EDIT" || appMode === "NEW" || appMode === "IMPORT") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (resultData.fileId) setSelectedContractId(resultData.fileId);
      saveCustomer(formRef.current);
      clearDraft();
    }
  }, [modals.success, resultData, appMode, saveCustomer, clearDraft]);

  // ─── Reset / duplicate ──────────────────────────────────────────────────
  const initSohd = useCallback(() => {
    const today = todayISO();
    const code = dateCode();
    setForm((f) => ({
      ...f,
      sohdDate: code,
      ngayky: today,
      sohd: buildSohd(code, f.brand),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setSelectedPreset(null);
    setSelectedDvPreset(null);
    setBbnt(emptyBBNT());
    setDntt(emptyDNTT());
    setModals({ confirm: false, loading: false, success: false, picker: false });
    setAppMode("NEW");
    setSelectedContractId("");
    setSelectedBZId("");
    setSelectedBZOption("");
    clearDraft();
    initSohd();
  }, [clearDraft, initSohd]);

  const duplicateContract = useCallback(() => {
    setAppMode("NEW");
    setSelectedContractId("");
    setPendingAction("CREATE_NEW");
    setModals((m) => ({ ...m, success: false }));
    initSohd();
    toast("Đã tạo bản sao — số hợp đồng mới", "ok");
  }, [initSohd, toast]);

  const copyDocLink = useCallback(() => {
    const url = resultData.docUrl || "";
    const done = () => {
      setCopyDocSuccess(true);
      setTimeout(() => setCopyDocSuccess(false), 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
    } else {
      fallbackCopy(url, done);
    }
  }, [resultData.docUrl]);

  // ─── View / theme / zoom ────────────────────────────────────────────────
  const toggleViewMode = useCallback(() => {
    setViewMode((v) => (v === "split" ? "form" : "split"));
  }, []);
  const setTheme = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
    try {
      localStorage.setItem("hd_theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, []);

  // ─── BBNT ───────────────────────────────────────────────────────────────
  const selectBBNTContract = useCallback(
    (f: ContractFile) => {
      setBbnt((b) => ({ ...b, contractId: f.id, loading: true }));
      getContractDataLive(f.id)
        .then((res) => {
          if (bbntRef.current.contractId !== f.id) return;
          const s = res.snapshot || {};
          const live = res.live || {
            items: [],
            ck: 0,
            vatPct: 8,
            vatAmount: 0,
            subTotal: 0,
            total: 0,
            applyVat: true,
          };
          setBbnt({
            contractId: f.id,
            loading: false,
            fromSnapshot: !!res.fromSnapshot,
            sohd: s.sohd || "",
            sohdDate: s.sohdDate || "",
            ngayky: s.ngayky || "",
            brand: s.brand || "",
            duann: s.duann || "",
            tencty: s.tencty || "",
            diachi: s.diachi || "",
            mst: s.mst || "",
            nguoidaidien: s.nguoidaidien || "",
            chucvu: s.chucvu || "Giám đốc",
            items: (live.items || []).map((it) => {
              const dongia = Number(it.dongia) || 0;
              const sl = Number(it.sl) || 1;
              return {
                ten: it.ten || "",
                dvt: it.dvt || "",
                sl,
                dongia,
                tt: Number(it.tt) || dongia * sl,
                tyle: 100 as number | "",
              };
            }),
            vatPct: live.vatPct != null ? Number(live.vatPct) : 8,
            applyVat: live.applyVat !== false,
            daTT: 0,
            deliverables: "",
            ngayNthu: todayISO(),
          });
          toast(
            res.fromSnapshot
              ? "Đã nạp (từ snapshot — không đọc được bảng sống)"
              : "Đã nạp dữ liệu hợp đồng",
            "ok",
          );
        })
        .catch((err: unknown) => {
          if (bbntRef.current.contractId !== f.id) return;
          setBbnt((b) => ({ ...b, loading: false, contractId: "" }));
          toast("Lỗi tải hợp đồng: " + errMsg(err), "err");
        });
    },
    [toast],
  );

  const updateBBNTItem = useCallback((index: number, patch: Partial<BBNTItem>) => {
    setBbnt((b) => {
      const items = b.items.slice();
      const next = { ...items[index], ...patch };
      // Editing đơn giá/SL recomputes thành tiền (tt) — matches recalcBBNTTt.
      if ("dongia" in patch || "sl" in patch) {
        next.tt = (Number(next.dongia) || 0) * (Number(next.sl) || 1);
      }
      items[index] = next;
      return { ...b, items };
    });
  }, []);
  const addBBNTItem = useCallback(() => {
    setBbnt((b) => ({
      ...b,
      items: [...b.items, { ten: "", dvt: "", sl: 1, dongia: 0, tt: 0, tyle: 100 }],
    }));
  }, []);
  const removeBBNTItem = useCallback((index: number) => {
    setBbnt((b) => {
      const items = b.items.slice();
      items.splice(index, 1);
      return { ...b, items };
    });
  }, []);
  const setBBNTTyleAll = useCallback((pct: number) => {
    setBbnt((b) => ({ ...b, items: b.items.map((it) => ({ ...it, tyle: pct })) }));
  }, []);

  const exportBBNT = useCallback(() => {
    const b = bbntRef.current;
    if (!b.contractId) {
      toast("Chưa chọn hợp đồng", "err");
      return;
    }
    if (!b.items.length) {
      toast("Chưa có hạng mục nghiệm thu", "err");
      return;
    }
    const payload = {
      items: b.items.map((it) => ({
        ten: it.ten,
        dvt: it.dvt,
        sl: Number(it.sl) || 1,
        dongia: Number(it.dongia) || 0,
        tt: Number(it.tt) || 0,
        tyle: (it.tyle === "" || it.tyle == null ? 100 : Number(it.tyle)) as number | "",
      })),
      sohd: b.sohd,
      sohdDate: b.sohdDate,
      ngayky: b.ngayky,
      ngayNthu: b.ngayNthu,
      tencty: b.tencty,
      nguoidaidien: b.nguoidaidien,
      chucvu: b.chucvu,
      diachi: b.diachi,
      mst: b.mst,
      brand: b.brand,
      duann: b.duann,
      daTT: Number(b.daTT) || 0,
      vatPct: Number(b.vatPct) || 8,
      applyVat: b.applyVat !== false,
      conPhaiChu: bbntConPhaiChu,
      sanPham: b.deliverables,
    };
    runProgress(() => processBBNT(payload));
  }, [bbntConPhaiChu, runProgress, toast]);

  // ─── DNTT ───────────────────────────────────────────────────────────────
  const selectDNTTContract = useCallback(
    (f: ContractFile) => {
      setDntt((d) => ({ ...d, contractId: f.id, loading: true }));
      getContractDataLive(f.id)
        .then((res) => {
          if (dnttRef.current.contractId !== f.id) return;
          const s = res.snapshot || {};
          const live = res.live || {
            items: [],
            ck: 0,
            vatPct: 8,
            vatAmount: 0,
            subTotal: 0,
            total: 0,
            applyVat: true,
          };
          setDntt({
            contractId: f.id,
            loading: false,
            sohd: s.sohd || "",
            sohdDate: s.sohdDate || "",
            brand: s.brand || "",
            duann: s.duann || "",
            tencty: s.tencty || "",
            soTien: Number(live.total) || Number(s.tonggiatri) || 0,
            soBBNT: (s.sohd || "").replace("HĐDV", "BBNT"),
            soTienNote: "100% giá trị hợp đồng đã bao gồm VAT",
            soNgayText: "15 (mười lăm)",
            ngay: todayISO(),
          });
          toast("Đã nạp dữ liệu hợp đồng", "ok");
        })
        .catch((err: unknown) => {
          if (dnttRef.current.contractId !== f.id) return;
          setDntt((d) => ({ ...d, loading: false, contractId: "" }));
          toast("Lỗi tải hợp đồng: " + errMsg(err), "err");
        });
    },
    [toast],
  );

  const exportDNTT = useCallback(() => {
    const d = dnttRef.current;
    if (!d.contractId) {
      toast("Chưa chọn hợp đồng", "err");
      return;
    }
    if (!(Number(d.soTien) > 0)) {
      toast("Số tiền thanh toán chưa hợp lệ", "err");
      return;
    }
    const payload = {
      soDntt: dnttSoDntt,
      tencty: d.tencty,
      sohd: d.sohd,
      soBBNT: d.soBBNT,
      duann: d.duann,
      soTienNote: d.soTienNote,
      soTien: Number(d.soTien) || 0,
      soTienChu: dnttSoTienChu,
      soNgayText: d.soNgayText,
      ngay: d.ngay,
      brand: d.brand,
      sohdDate: d.sohdDate,
    };
    runProgress(() => processDNTT(payload));
  }, [dnttSoDntt, dnttSoTienChu, runProgress, toast]);

  // ─── Date picker apply ──────────────────────────────────────────────────
  const applyDate = useCallback((target: DateTarget, field: string, value: string) => {
    if (target === "form") {
      if (field === "ngayky") {
        const d = new Date(value);
        const p = (n: number) => String(n).padStart(2, "0");
        const code = isNaN(d.getTime())
          ? ""
          : `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
        setForm((f) => ({
          ...f,
          ngayky: value,
          sohdDate: code || f.sohdDate,
          sohd: buildSohd(code || f.sohdDate, f.brand),
        }));
      } else {
        setForm((f) => ({ ...f, [field]: value }));
      }
    } else if (target === "bbnt") {
      setBbnt((b) => ({ ...b, [field]: value }));
    } else {
      setDntt((d) => ({ ...d, [field]: value }));
    }
  }, []);

  // ─── Submit dispatcher (used by submit bar + Ctrl+Enter) ────────────────
  const primarySubmit = useCallback(() => {
    if (appMode === "BBNT") exportBBNT();
    else if (appMode === "DNTT") exportDNTT();
    else confirmCreate();
  }, [appMode, exportBBNT, exportDNTT, confirmCreate]);

  // ─── Mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initSohd();
    // detect draft
    try {
      const raw = localStorage.getItem("hd_draft");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.form) {
          pendingDraft.current = parsed.form as ContractForm;
          const meaningful =
            parsed.form.tencty ||
            parsed.form.duann ||
            (parsed.form.items &&
              CAT_KEYS.some((k) => (parsed.form.items[k] || []).length));
          if (meaningful) {
            const p = (n: number) => String(n).padStart(2, "0");
            const t = new Date(parsed.ts || Date.now());
            setDraftSavedAt(`${p(t.getHours())}:${p(t.getMinutes())}`);
            setHasDraft(true);
          }
        }
      }
    } catch {
      /* ignore */
    }
    // theme
    try {
      const th = localStorage.getItem("hd_theme");
      if (th) setIsDarkMode(th !== "light");
    } catch {
      /* ignore */
    }
    loadCustomers();
    getInitialData()
      .then((res) => setDb(res.db))
      .catch((err: unknown) =>
        toast("Không tải được danh mục dịch vụ: " + errMsg(err), "err"),
      );

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Keyboard: Ctrl/Cmd+Enter → primary submit; Enter → next field ──────
  const submitRef = useRef(primarySubmit);
  useEffect(() => {
    submitRef.current = primarySubmit;
  }, [primarySubmit]);
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!modals.loading && !modals.success) submitRef.current();
      } else if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && tag === "input") {
        e.preventDefault();
        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            "input:not([readonly]):not([disabled]),select:not([disabled])",
          ),
        );
        const index = focusables.indexOf(target);
        if (index > -1 && index < focusables.length - 1) focusables[index + 1].focus();
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [modals.loading, modals.success]);

  return {
    // state
    form,
    db,
    appMode,
    activeTab,
    viewMode,
    mobileTab,
    isDarkMode,
    sec,
    errTencty,
    errDaidien,
    savedCustomers,
    dupWarn,
    contractList,
    filteredContracts,
    fileSearchQuery,
    selectedContractId,
    bzFileList,
    filteredBZFiles,
    bzSearchQuery,
    selectedBZId,
    bzOptionList,
    selectedBZOption,
    selectedPreset,
    selectedDvPreset,
    bbnt,
    bbntSearchQuery,
    filteredBBNTContracts,
    dntt,
    dnttSearchQuery,
    filteredDNTTContracts,
    modals,
    pendingAction,
    resultData,
    progressValue,
    isProcessingDone,
    copyDocSuccess,
    toasts,
    draftSavedAt,
    draftRestored,
    hasDraft,
    windowWidth,
    // derived
    subTotal,
    afterCk,
    vatAmount,
    tonggiatri,
    tongTienChu,
    tabSubTotals,
    progDone,
    progPct,
    sohdDisplay,
    bbntSumNthu,
    bbntVat,
    bbntTong,
    bbntConPhai,
    bbntConPhaiChu,
    dnttSoDntt,
    dnttSoTienChu,
    modalOpen,
    bbntItemNthu,
    // setters/actions
    setField,
    setBBNTField,
    setDNTTField,
    setActiveTab,
    setMobileTab,
    toggleSec,
    toggleViewMode,
    setTheme,
    setFileSearchQuery,
    setBzSearchQuery,
    setBbntSearchQuery,
    setDnttSearchQuery,
    updateItem,
    addItem,
    removeItem,
    onPriceInput,
    selectService,
    filteredServices,
    openPicker,
    closePicker,
    pickerServices,
    addPicked,
    setCkPct,
    onCkInput,
    selectPreset,
    selectDvPreset,
    applyCustomer,
    clearDraft,
    restoreDraftNow,
    setMode,
    refreshContractList,
    refreshBZList,
    selectContract,
    selectBZFile,
    selectBZOption,
    confirmCreate,
    closeConfirm,
    executeProcess,
    cancelCreate,
    resetForm,
    duplicateContract,
    copyDocLink,
    selectBBNTContract,
    updateBBNTItem,
    addBBNTItem,
    removeBBNTItem,
    setBBNTTyleAll,
    exportBBNT,
    selectDNTTContract,
    exportDNTT,
    applyDate,
    primarySubmit,
    toast,
    removeToast,
  };
}

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function fallbackCopy(text: string, done: () => void) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
}
