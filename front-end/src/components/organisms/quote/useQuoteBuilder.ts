// State + logic for the /bao-gia quote builder. Ports the Vue app's data,
// computed, watchers and methods (back-end/scripts/google/index.html) into a
// single React hook. Pure calc/format/api helpers are imported from #lib/quote.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculatedDays as calcDays,
  defaultDates,
  docTienChu,
  finalTotal as calcFinal,
  grandSubtotal,
  makeSobg,
  newItemId,
} from "#lib/quote/calc";
import { parseMoney, formatThousands } from "#lib/quote/format";
import {
  getInitialData,
  getQuoteDataFromFile,
  getQuoteFiles,
  processQuoteDocument,
  rollbackProcess,
} from "#lib/quote/quoteApi";
import type {
  ActionType,
  CatKey,
  ProcessResult,
  QuoteFile,
  QuoteForm,
  QuoteItem,
  Service,
} from "#lib/quote/types";

const CAT_KEYS: CatKey[] = ["SX", "TB", "HK", "HC"];

export type AppMode = "NEW" | "EDIT";
export type EditActionType = "ADD_OPTION" | "EDIT_OPTION";

export type ToastState = {
  show: boolean;
  msg: string;
  actionLabel: string;
  action: (() => void) | null;
};

export type ModalsState = {
  confirm: boolean;
  loading: boolean;
  success: boolean;
  picker: boolean;
};

function emptyItems(): Record<CatKey, QuoteItem[]> {
  return { SX: [], TB: [], HK: [], HC: [] };
}

function emptyForm(): QuoteForm {
  return {
    sobg: "",
    duann: "",
    phutrach: "Hoàn Nguyễn",
    yeucau: "",
    khachhang: "",
    mst: "",
    tu: "",
    den: "",
    ckValue: 0,
    hanHieuLuc: "",
    items: emptyItems(),
  };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export type QuoteBuilder = ReturnType<typeof useQuoteBuilder>;

export function useQuoteBuilder() {
  const [form, setForm] = useState<QuoteForm>(emptyForm);
  const [db, setDb] = useState<Record<CatKey, Service[]>>(() => ({
    SX: [],
    TB: [],
    HK: [],
    HC: [],
  }));

  const [appMode, setAppMode] = useState<AppMode>("NEW");
  const [editActionType, setEditActionType] = useState<EditActionType>("ADD_OPTION");
  const [activeTab, setActiveTab] = useState<CatKey>("SX");
  const [isFullView, setIsFullView] = useState(false);
  const [splitView, setSplitView] = useState(true);

  const [rawCk, setRawCk] = useState("");

  // EDIT mode
  const [fileList, setFileList] = useState<QuoteFile[]>([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [optionList, setOptionList] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [hiddenData, setHiddenData] = useState<Record<string, QuoteForm>>({});
  const [loadingFile, setLoadingFile] = useState(false);

  // Modals & submission
  const [modals, setModals] = useState<ModalsState>({
    confirm: false,
    loading: false,
    success: false,
    picker: false,
  });
  const [pendingAction, setPendingAction] = useState<ActionType | "">("");
  const [resultData, setResultData] = useState<ProcessResult>({ success: false });
  const [progressValue, setProgressValue] = useState(0);
  const [isProcessingDone, setIsProcessingDone] = useState(false);
  const [copySheetSuccess, setCopySheetSuccess] = useState(false);

  // Preview
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    msg: "",
    actionLabel: "",
    action: null,
  });

  // Draft
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // Mutable refs used across intervals / timers.
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoved = useRef<{ tab: CatKey; index: number; item: QuoteItem } | null>(null);
  const isCancelledRef = useRef(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkBackendInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  // Latest form snapshot for use inside interval callbacks (kept in sync below).
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // ─── Derived values ────────────────────────────────────────────────────
  const subTotal = useMemo(() => grandSubtotal(form.items), [form.items]);
  const finalTotal = useMemo(() => calcFinal(subTotal, form.ckValue), [subTotal, form.ckValue]);
  const tongTienChu = useMemo(() => docTienChu(finalTotal), [finalTotal]);
  const calculatedDays = useMemo(() => calcDays(form.tu, form.den), [form.tu, form.den]);

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
    if (form.khachhang && form.khachhang.trim()) n++;
    if (CAT_KEYS.some((k) => form.items[k].some((i) => (i.ten && i.ten.trim()) || i.dongia > 0)))
      n++;
    if (form.tu || form.den) n++;
    if (form.phutrach && form.phutrach.trim()) n++;
    return n;
  }, [form]);
  const progPct = Math.round((progDone / 4) * 100);

  const modalOpen =
    modals.loading ||
    modals.success ||
    modals.confirm ||
    modals.picker ||
    previewFullscreen;

  // ─── Toast ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, actionLabel?: string, action?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, msg, actionLabel: actionLabel || "", action: action || null });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
  }, []);

  const hideToast = useCallback(() => setToast((t) => ({ ...t, show: false })), []);
  const toastAction = useCallback(() => {
    setToast((t) => {
      if (t.action) t.action();
      return { ...t, show: false };
    });
  }, []);

  // ─── Discount (rawCk → form.ckValue) ───────────────────────────────────
  // Live-format the absolute input and resolve to ckValue whenever rawCk or
  // subTotal changes (percent branch must recompute when subTotal changes).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Ports the Vue `rawCk` + `subTotal` watchers: synchronizing derived
    // discount state from the raw text input is the intended behavior here.
    if (!rawCk) {
      setForm((f) => (f.ckValue === 0 ? f : { ...f, ckValue: 0 }));
      return;
    }
    const str = String(rawCk);
    if (str.includes("%")) {
      const pct = Math.min(100, Math.max(0, parseFloat(str.replace("%", "")) || 0));
      const ck = Math.round((subTotal * pct) / 100);
      setForm((f) => (f.ckValue === ck ? f : { ...f, ckValue: ck }));
      return;
    }
    const numericString = str.replace(/[^\d]/g, "");
    if (numericString) {
      const formatted = formatThousands(numericString);
      if (rawCk !== formatted) {
        setRawCk(formatted);
        return; // effect re-runs with the formatted value
      }
    } else if (rawCk !== "") {
      setRawCk("");
      return;
    }
    const ck = parseMoney(str);
    setForm((f) => (f.ckValue === ck ? f : { ...f, ckValue: ck }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [rawCk, subTotal]);

  const setCkPct = useCallback((p: number) => setRawCk(p ? `${p}%` : ""), []);

  // ─── Auto-days: push calculatedDays into untouched items ───────────────
  // Ports the Vue `calculatedDays` watcher — syncing item.sn is intended.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => {
      let changed = false;
      const items = {} as Record<CatKey, QuoteItem[]>;
      for (const key of CAT_KEYS) {
        items[key] = f.items[key].map((item) => {
          if (!item.snTouched && item.sn !== calculatedDays) {
            changed = true;
            return { ...item, sn: calculatedDays };
          }
          return item;
        });
      }
      return changed ? { ...f, items } : f;
    });
  }, [calculatedDays]);

  // ─── Form field helpers ────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof QuoteForm>(field: K, value: QuoteForm[K]) => {
      setForm((f) => ({ ...f, [field]: value }));
    },
    [],
  );

  const updateItem = useCallback(
    (tab: CatKey, index: number, patch: Partial<QuoteItem>) => {
      setForm((f) => {
        const arr = f.items[tab].slice();
        arr[index] = { ...arr[index], ...patch };
        return { ...f, items: { ...f.items, [tab]: arr } };
      });
    },
    [],
  );

  const addItem = useCallback(
    (tab: CatKey) => {
      setForm((f) => ({
        ...f,
        items: {
          ...f.items,
          [tab]: [
            ...f.items[tab],
            {
              id: newItemId(),
              ten: "",
              chitiet: "",
              dongia: 0,
              dvt: "",
              sl: 1,
              sn: calculatedDays,
              snTouched: false,
              ghichu: "",
              showNote: false,
            },
          ],
        },
      }));
    },
    [calculatedDays],
  );

  const removeItem = useCallback(
    (tab: CatKey, index: number) => {
      setForm((f) => {
        const arr = f.items[tab].slice();
        const removed = arr.splice(index, 1)[0];
        lastRemoved.current = { tab, index, item: removed };
        return { ...f, items: { ...f.items, [tab]: arr } };
      });
      showToast("Đã xóa hạng mục", "Hoàn tác", () => {
        const lr = lastRemoved.current;
        if (!lr) return;
        setForm((f) => {
          const arr = f.items[lr.tab].slice();
          const safeIdx = Math.min(lr.index, arr.length);
          arr.splice(safeIdx, 0, lr.item);
          return { ...f, items: { ...f.items, [lr.tab]: arr } };
        });
        lastRemoved.current = null;
      });
    },
    [showToast],
  );

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
        chitiet: "",
        ghichu: opt.chitiet || "",
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

  // ─── Service picker ────────────────────────────────────────────────────
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
            items[tabId].push({
              id: newItemId(),
              ten: s.ten,
              chitiet: "",
              dongia: s.dongia || 0,
              dvt: s.dvt || "",
              sl: 1,
              sn: calculatedDays,
              snTouched: false,
              ghichu: s.chitiet || "",
              showNote: false,
            });
            n++;
          }
        }
        return { ...f, items };
      });
      setModals((m) => ({ ...m, picker: false }));
      showToast(n ? `Đã thêm ${n} hạng mục` : "Chưa chọn hạng mục nào");
    },
    [db, calculatedDays, showToast],
  );

  // ─── Draft (localStorage, NEW only, debounced 800ms) ───────────────────
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem("beez_draft");
    } catch {
      /* ignore */
    }
    setDraftSavedAt("");
    setDraftRestored(false);
  }, []);

  useEffect(() => {
    if (appMode !== "NEW") return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        const has =
          form.khachhang || form.duann || CAT_KEYS.some((k) => form.items[k].length);
        if (has) {
          localStorage.setItem("beez_draft", JSON.stringify(form));
          const p = (n: number) => String(n).padStart(2, "0");
          const t = new Date();
          setDraftSavedAt(`${p(t.getHours())}:${p(t.getMinutes())}`);
          setDraftRestored(false);
        }
      } catch {
        /* ignore */
      }
    }, 800);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [form, appMode]);

  const restoreDraft = useCallback(() => {
    try {
      const d = localStorage.getItem("beez_draft");
      if (d) {
        const parsed = JSON.parse(d) as QuoteForm;
        for (const k of CAT_KEYS) {
          ((parsed.items && parsed.items[k]) || []).forEach((item) => {
            if (item.ghichu === undefined) item.ghichu = "";
            if (item.showNote === undefined) item.showNote = false;
            if (item.snTouched === undefined) item.snTouched = false;
            if (!item.id) item.id = newItemId();
          });
        }
        setForm((f) => ({ ...f, ...parsed }));
        setRawCk(parsed.ckValue > 0 ? String(parsed.ckValue) : "");
        const p = (n: number) => String(n).padStart(2, "0");
        const t = new Date();
        setDraftSavedAt(`${p(t.getHours())}:${p(t.getMinutes())}`);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 4500);
      }
    } catch {
      /* ignore */
    }
    hideToast();
  }, [hideToast]);

  // ─── Reset ─────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    const dd = defaultDates();
    setForm({
      ...emptyForm(),
      sobg: makeSobg(),
      tu: dd.tu,
      den: dd.den,
      hanHieuLuc: dd.hanHieuLuc,
    });
    setRawCk("");
    setModals((m) => ({ ...m, success: false }));
    setAppMode("NEW");
    setSelectedFileId("");
    setFileSearchQuery("");
    setSelectedOption("");
    setEditActionType("ADD_OPTION");
    clearDraft();
  }, [clearDraft]);

  // ─── Mode / file / option ──────────────────────────────────────────────
  const refreshFileList = useCallback(() => {
    getQuoteFiles()
      .then((res) => setFileList(res))
      .catch((err: unknown) =>
        showToast("Không tải được danh sách báo giá: " + errMsg(err)),
      );
  }, [showToast]);

  const setMode = useCallback(
    (mode: AppMode) => {
      setAppMode(mode);
      setEditActionType("ADD_OPTION");
      if (mode === "NEW") {
        setSelectedFileId("");
        setFileSearchQuery("");
      } else {
        refreshFileList();
      }
    },
    [refreshFileList],
  );

  const loadDataFromOption = useCallback(
    (option: string, data: Record<string, QuoteForm>) => {
      const key = "OPTION_" + option;
      if (!data[key]) {
        showToast("Không tìm thấy Data ẩn cho Option này. Vui lòng nhập tay.");
        return;
      }
      const newData = clone(data[key]);
      newData.ckValue = 0;
      for (const tab of CAT_KEYS) {
        if (!newData.items[tab]) newData.items[tab] = [];
        newData.items[tab].forEach((item) => {
          if (item.ghichu === undefined) item.ghichu = "";
          if (item.chitiet) {
            item.ghichu = [item.chitiet, item.ghichu].filter(Boolean).join("\n");
            item.chitiet = "";
          }
          item.showNote = false;
          item.snTouched = true;
          if (!item.id) item.id = newItemId();
        });
      }
      setForm((f) => ({ ...f, ...newData }));
      setRawCk(newData.ckValue > 0 ? String(newData.ckValue) : "");
    },
    [showToast],
  );

  const selectOption = useCallback(
    (opt: string) => {
      setSelectedOption(opt);
      if (opt) loadDataFromOption(opt, hiddenData);
    },
    [loadDataFromOption, hiddenData],
  );

  const selectFile = useCallback(
    (f: QuoteFile) => {
      setSelectedFileId(f.id);
      setEditActionType("ADD_OPTION");
      setOptionList([]);
      setSelectedOption("");
      setHiddenData({});
      setLoadingFile(true);
      getQuoteDataFromFile(f.id)
        .then((res) => {
          if (res.success) {
            setOptionList(res.sheetNames || []);
            setHiddenData(res.savedData || {});
          } else {
            showToast("Lỗi khi đọc file: " + (res.message || ""));
          }
        })
        .catch((err: unknown) => showToast("Không đọc được file (mạng/quota): " + errMsg(err)))
        .finally(() => setLoadingFile(false));
    },
    [showToast],
  );

  // ─── Validate + confirm + submit ───────────────────────────────────────
  const validateForm = useCallback((): boolean => {
    if (!form.khachhang || !form.khachhang.trim()) {
      showToast("Chưa nhập Khách hàng");
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(".khach-input");
        if (el) {
          el.focus();
          el.classList.add("inp-err");
          setTimeout(() => el.classList.remove("inp-err"), 2000);
        }
      }, 0);
      return false;
    }
    let hasItem = false;
    for (const k of CAT_KEYS)
      if (form.items[k].some((i) => (i.ten && i.ten.trim()) || i.dongia > 0)) hasItem = true;
    if (!hasItem) {
      showToast("Bảng dịch vụ trống — thêm ít nhất 1 hạng mục");
      return false;
    }
    if (form.tu && form.den && new Date(form.den) < new Date(form.tu)) {
      showToast(
        '⚠ Ngày "Đến" đang sớm hơn "Từ" — vẫn tạo được, nhưng nên kiểm tra lại thời gian',
      );
    }
    return true;
  }, [form, showToast]);

  const confirmCreate = useCallback(() => {
    if (appMode === "NEW") {
      if (!validateForm()) return;
      setPendingAction("CREATE_NEW");
    } else if (appMode === "EDIT" && selectedFileId) {
      if (editActionType === "EDIT_OPTION" && !selectedOption) {
        showToast("Chọn Option muốn Lưu đè trước đã!");
        return;
      }
      setPendingAction(editActionType);
    } else {
      showToast("Vui lòng chọn Báo giá cũ trước!");
      return;
    }
    setModals((m) => ({ ...m, confirm: true }));
  }, [appMode, selectedFileId, editActionType, selectedOption, validateForm, showToast]);

  const clearTimers = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (checkBackendInterval.current) clearInterval(checkBackendInterval.current);
  }, []);

  const executeProcess = useCallback(() => {
    const action = pendingAction;
    if (!action) return;
    setModals((m) => ({ ...m, confirm: false, loading: true }));
    isCancelledRef.current = false;
    setProgressValue(0);
    setIsProcessingDone(false);

    const submitForm: QuoteForm = { ...formRef.current, tongTienChu };
    const payload = {
      actionType: action,
      formData: submitForm,
      fileId: selectedFileId,
      targetOptionName: selectedOption,
    };

    let backendDone = false;
    let backendResponse: ProcessResult | null = null;

    processQuoteDocument(payload)
      .then((res) => {
        if (isCancelledRef.current) {
          if (action === "EDIT_OPTION") {
            const oldData = hiddenData["OPTION_" + selectedOption];
            if (oldData) {
              processQuoteDocument({
                actionType: "EDIT_OPTION",
                formData: oldData,
                fileId: selectedFileId,
                targetOptionName: selectedOption,
              })
                .then((r) =>
                  showToast(
                    r && r.success
                      ? "Đã hoàn tác — khôi phục Option cũ xong."
                      : "⚠ Hoàn tác không trọn vẹn — mở Sheet kiểm tra Option ngay!",
                  ),
                )
                .catch((e: unknown) =>
                  showToast(
                    "⚠ HOÀN TÁC THẤT BẠI — Option có thể đã bị ghi đè, mở Sheet kiểm tra ngay: " +
                      errMsg(e),
                  ),
                );
            } else {
              showToast("⚠ Không tìm thấy dữ liệu cũ để hoàn tác — mở Sheet kiểm tra Option.");
            }
          } else {
            rollbackProcess({
              actionType: action,
              resultData: res,
              targetOptionName: selectedOption,
            }).catch((e: unknown) =>
              showToast(
                "⚠ Dọn dẹp khi hủy chưa xong — kiểm tra Drive nếu thấy file/sheet thừa: " +
                  errMsg(e),
              ),
            );
          }
        } else {
          backendDone = true;
          backendResponse = res;
        }
      })
      .catch((err: unknown) => {
        isCancelledRef.current = true;
        clearTimers();
        setModals((m) => ({ ...m, loading: false }));
        showToast("Lỗi khi tạo báo giá: " + errMsg(err));
      });

    const totalDuration = Math.floor(Math.random() * 5000) + 15000;
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      if (isCancelledRef.current) {
        if (progressInterval.current) clearInterval(progressInterval.current);
        return;
      }
      let currentProg = ((Date.now() - startTime) / totalDuration) * 100;
      if (backendDone && currentProg < 100) currentProg = 100;
      if (currentProg >= 100) {
        setProgressValue(100);
        if (progressInterval.current) clearInterval(progressInterval.current);
        let waited = 0;
        checkBackendInterval.current = setInterval(() => {
          if (isCancelledRef.current) {
            if (checkBackendInterval.current) clearInterval(checkBackendInterval.current);
            return;
          }
          if (backendDone) {
            if (checkBackendInterval.current) clearInterval(checkBackendInterval.current);
            const res = backendResponse;
            if (res && res.success) {
              setResultData(res);
              const opt = res.currentOption || "";
              setHiddenData((hd) => ({
                ...hd,
                ["OPTION_" + opt]: clone(formRef.current),
              }));
              if (action === "CREATE_NEW") clearDraft();
              setSelectedFileId(res.fileId || "");
              setSelectedOption(opt);
              setAppMode("EDIT");
              setIsProcessingDone(true);
              setTimeout(
                () => setModals((m) => ({ ...m, loading: false, success: true })),
                1200,
              );
            } else {
              setModals((m) => ({ ...m, loading: false }));
              showToast("Lỗi: " + (res ? res.message : "Unknown error"));
            }
          } else if (++waited > 450) {
            if (checkBackendInterval.current) clearInterval(checkBackendInterval.current);
            setModals((m) => ({ ...m, loading: false }));
            showToast(
              "Máy chủ chậm/không phản hồi — kiểm tra Drive xem file đã tạo chưa rồi thử lại",
            );
          }
        }, 200);
      } else {
        setProgressValue(currentProg);
      }
    }, 50);
  }, [
    pendingAction,
    tongTienChu,
    selectedFileId,
    selectedOption,
    hiddenData,
    showToast,
    clearDraft,
    clearTimers,
  ]);

  const cancelCreate = useCallback(() => {
    isCancelledRef.current = true;
    clearTimers();
    setModals((m) => ({ ...m, loading: false }));
  }, [clearTimers]);

  const closeConfirm = useCallback(
    () => setModals((m) => ({ ...m, confirm: false })),
    [],
  );

  const handleEditOption = useCallback(() => {
    setModals((m) => ({ ...m, success: false }));
    setEditActionType("EDIT_OPTION");
  }, []);
  const handleAddOption = useCallback(() => {
    setModals((m) => ({ ...m, success: false }));
    setEditActionType("ADD_OPTION");
  }, []);

  // ─── Success modal helpers ─────────────────────────────────────────────
  const copySheetLink = useCallback(() => {
    const url = resultData.sheetUrl || "";
    const done = () => {
      setCopySheetSuccess(true);
      setTimeout(() => setCopySheetSuccess(false), 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
    } else {
      fallbackCopy(url, done);
    }
  }, [resultData.sheetUrl]);

  // ─── Preview / view toggles ────────────────────────────────────────────
  const toggleSplitView = useCallback(() => {
    setSplitView((v) => {
      const next = !v;
      try {
        localStorage.setItem("beez_splitView", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleFullView = useCallback(() => setIsFullView((v) => !v), []);

  const openPreviewFullscreen = useCallback(() => setPreviewFullscreen(true), []);
  const closePreviewFullscreen = useCallback(() => setPreviewFullscreen(false), []);
  const zoomPreview = useCallback((d: number) => {
    if (d === 0) {
      setPreviewZoom(1);
      return;
    }
    setPreviewZoom((z) => Math.min(4, Math.max(0.4, +(z + d).toFixed(2))));
  }, []);

  useEffect(() => {
    if (previewFullscreen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewZoom(
        window.innerWidth >= 1500 ? 1.6 : window.innerWidth >= 1100 ? 1.3 : 1,
      );
    }
  }, [previewFullscreen]);

  const reloadHome = useCallback(() => {
    resetForm();
    setPreviewFullscreen(false);
    setModals({ confirm: false, loading: false, success: false, picker: false });
    hideToast();
    setActiveTab("SX");
    try {
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  }, [resetForm, hideToast]);

  const openPicker = useCallback(() => setModals((m) => ({ ...m, picker: true })), []);
  const closePicker = useCallback(() => setModals((m) => ({ ...m, picker: false })), []);

  // ─── Mount: sobg, dates, draft toast, load db, resize/scroll listeners ──
  useEffect(() => {
    try {
      const sv = localStorage.getItem("beez_splitView");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sv !== null) setSplitView(sv === "1");
    } catch {
      /* ignore */
    }
    const dd = defaultDates();
    setForm((f) => ({
      ...f,
      sobg: makeSobg(),
      tu: dd.tu,
      den: dd.den,
      hanHieuLuc: dd.hanHieuLuc,
    }));
    try {
      if (localStorage.getItem("beez_draft")) {
        showToast("Có bản nháp chưa lưu", "Khôi phục", () => restoreDraft());
      }
    } catch {
      /* ignore */
    }
    getInitialData()
      .then((res) => setDb(res.db))
      .catch((err: unknown) =>
        showToast("Không tải được danh mục dịch vụ — thử tải lại trang: " + errMsg(err)),
      );

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimers();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Keyboard: Enter → next field; Ctrl/Cmd+Enter → submit ─────────────
  const confirmCreateRef = useRef(confirmCreate);
  useEffect(() => {
    confirmCreateRef.current = confirmCreate;
  }, [confirmCreate]);
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === "textarea") return;
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!modals.loading && !modals.success) confirmCreateRef.current();
      } else if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
        if (tag === "input" || tag === "select") {
          e.preventDefault();
          const focusables = Array.from(
            document.querySelectorAll<HTMLElement>(
              "input:not([readonly]):not([disabled]),select:not([disabled])",
            ),
          );
          const index = focusables.indexOf(target);
          if (index > -1 && index < focusables.length - 1) focusables[index + 1].focus();
        }
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [modals.loading, modals.success]);

  const filteredFiles = useMemo(() => {
    if (!fileSearchQuery) return fileList;
    return fileList.filter((f) => f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()));
  }, [fileList, fileSearchQuery]);

  return {
    // state
    form,
    db,
    appMode,
    editActionType,
    activeTab,
    isFullView,
    splitView,
    rawCk,
    fileList,
    filteredFiles,
    fileSearchQuery,
    selectedFileId,
    optionList,
    selectedOption,
    loadingFile,
    modals,
    pendingAction,
    resultData,
    progressValue,
    isProcessingDone,
    copySheetSuccess,
    previewFullscreen,
    previewZoom,
    toast,
    draftSavedAt,
    draftRestored,
    windowWidth,
    // derived
    subTotal,
    finalTotal,
    tongTienChu,
    calculatedDays,
    tabSubTotals,
    progDone,
    progPct,
    modalOpen,
    // setters / actions
    setField,
    setActiveTab,
    setRawCk,
    setCkPct,
    setFileSearchQuery,
    updateItem,
    addItem,
    removeItem,
    onPriceInput,
    selectService,
    filteredServices,
    addPicked,
    setMode,
    refreshFileList,
    selectFile,
    selectOption,
    confirmCreate,
    closeConfirm,
    executeProcess,
    cancelCreate,
    handleEditOption,
    handleAddOption,
    resetForm,
    copySheetLink,
    toggleSplitView,
    toggleFullView,
    openPreviewFullscreen,
    closePreviewFullscreen,
    zoomPreview,
    reloadHome,
    openPicker,
    closePicker,
    clearDraft,
    showToast,
    hideToast,
    toastAction,
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
