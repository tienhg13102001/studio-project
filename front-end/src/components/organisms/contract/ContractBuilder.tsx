// Top-level contract builder. Owns the useContractBuilder hook + datepicker /
// zoom / print, and lays out header / mobile tabs / workbench (form + live A4
// preview) / modals / toasts. Faithful port of the original hop-dong Vue app
// markup (back-end/scripts/google/hop-dong/index.html).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClockCounterClockwiseIcon,
  CloudIcon,
  EyeIcon,
  HouseIcon,
  PencilSimpleIcon,
  PrinterIcon,
} from "@phosphor-icons/react";
import { useContractBuilder, type DateTarget } from "./useContractBuilder";
import { buildBBNTPreview, buildContractPreview, buildDNTTPreview } from "./ContractPreview";
import ContractFormPanel from "./ContractFormPanel";
import BBNTPanel from "./BBNTPanel";
import DNTTPanel from "./DNTTPanel";
import ServicePickerModal from "./ServicePickerModal";
import ConfirmModal from "./ConfirmModal";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import ContractToast from "./ContractToast";
import ContractDatePicker, { type DatePickerConfig } from "./ContractDatePicker";

const A4_WIDTH = 794;

const ContractBuilder = () => {
  const c = useContractBuilder();
  const [datePicker, setDatePicker] = useState<DatePickerConfig | null>(null);
  const [pgZoom, setPgZoom] = useState(0.85);
  const userZoomed = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const previewHTML = useMemo(() => {
    if (c.appMode === "BBNT") {
      return buildBBNTPreview(c.bbnt, {
        sumN: c.bbntSumNthu,
        vat: c.bbntVat,
        tong: c.bbntTong,
        conPhai: c.bbntConPhai,
        conPhaiChu: c.bbntConPhaiChu,
      });
    }
    if (c.appMode === "DNTT") {
      return buildDNTTPreview(c.dntt, { soDntt: c.dnttSoDntt, soTienChu: c.dnttSoTienChu });
    }
    return buildContractPreview(c.form, {
      subTotal: c.subTotal,
      afterCk: c.afterCk,
      vatAmount: c.vatAmount,
      tonggiatri: c.tonggiatri,
      tongTienChu: c.tongTienChu,
    });
  }, [
    c.appMode, c.form, c.subTotal, c.afterCk, c.vatAmount, c.tonggiatri, c.tongTienChu,
    c.bbnt, c.bbntSumNthu, c.bbntVat, c.bbntTong, c.bbntConPhai, c.bbntConPhaiChu,
    c.dntt, c.dnttSoDntt, c.dnttSoTienChu,
  ]);

  // ── Zoom (auto-fit A4 into the stage) ──
  const calcZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || stage.offsetWidth === 0) return;
    const avail = stage.clientWidth - 32;
    const floor = window.innerWidth < 900 ? 0.72 : 0.35;
    const z = Math.min(1.2, Math.max(floor, avail / A4_WIDTH));
    setPgZoom(z);
  }, []);
  const zoomIn = () => {
    userZoomed.current = true;
    setPgZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)));
  };
  const zoomOut = () => {
    userZoomed.current = true;
    setPgZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)));
  };
  const zoomFit = () => {
    userZoomed.current = false;
    calcZoom();
  };
  useEffect(() => {
    calcZoom();
    const onResize = () => {
      if (!userZoomed.current) calcZoom();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcZoom]);
  // Re-fit when the preview panel becomes visible.
  useEffect(() => {
    if (c.viewMode === "split" && !userZoomed.current) calcZoom();
  }, [c.viewMode, c.mobileTab, calcZoom]);

  // ── Print / export PDF (hidden iframe, matches the Vue printPreview) ──
  const printPreview = useCallback(() => {
    const existing = document.getElementById("hd-print-frame");
    if (existing) existing.remove();
    const iframe = document.createElement("iframe");
    iframe.id = "hd-print-frame";
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' +
        (c.form.sohd || "hop-dong") +
        "</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}" +
        "body{margin:0;font-family:'Times New Roman',Times,serif;color:#000}" +
        ".doc-pad{padding:16mm 15mm 18mm 22mm}</style></head><body>" +
        '<div class="doc-pad">' +
        previewHTML +
        "</div></body></html>",
    );
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  }, [previewHTML, c.form.sohd]);

  const openDatePicker = (target: DateTarget, field: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;
    if (top + 360 > window.innerHeight) top = rect.top - 366;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 296;
    const source =
      target === "form" ? (c.form as Record<string, unknown>)
      : target === "bbnt" ? (c.bbnt as Record<string, unknown>)
      : (c.dntt as Record<string, unknown>);
    setDatePicker({
      field,
      target,
      dateOnly: true,
      value: String(source[field] ?? ""),
      pos: { top: Math.max(8, top), left: Math.max(8, left) },
    });
  };

  return (
    <div className="hd" data-theme={c.isDarkMode ? "dark" : "light"}>
      <div className="app">
        {/* ═══ HEADER ═══ */}
        <div className="hdr">
          <div className="hdr-logo">
            <span className="hdr-ring" />
            <img
              src="https://drive.google.com/thumbnail?id=1A08TfiPaQ99gcDu7THMh9O98gpVwUbJS&sz=w200-h200"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://i.imgur.com/NymLXBn.png"; }}
              alt="Bee Z"
            />
          </div>
          <div className="hdr-info">
            <div className="hdr-title">HỢP ĐỒNG</div>
            <div className="hdr-sub">Bee Z Production</div>
          </div>
          <div className="hdr-badge">{c.sohdDisplay}</div>
          {c.hasDraft ? (
            <button type="button" className="draft-chip draft-restore" onClick={c.restoreDraftNow} title="Bấm để khôi phục nội dung nháp đã lưu">
              <ClockCounterClockwiseIcon size={12} />
              <span className="dc-txt">Khôi phục nháp {c.draftSavedAt}</span>
            </button>
          ) : c.draftSavedAt ? (
            <div className={`draft-chip${c.draftRestored ? " restored" : ""}`}>
              {c.draftRestored ? <ClockCounterClockwiseIcon size={12} /> : <CloudIcon size={12} />}
              <span className="dc-txt">{c.draftRestored ? "Đã khôi phục nháp" : "Nháp " + c.draftSavedAt}</span>
            </div>
          ) : null}
          <div className="hdr-tools">
            <button className="icon-btn" onClick={c.resetForm} title="Trang chủ — tạo mới"><HouseIcon size={15} /></button>
            <button className={`btn-viewmode${c.viewMode === "split" ? " on" : ""}`} onClick={c.toggleViewMode}
              title={c.viewMode === "split" ? "Tắt khung xem trước — về chế độ nhập gọn" : "Bật khung xem trước A4 cạnh bên"}>
              <EyeIcon size={14} />
              <span>Xem trước</span>
            </button>
            <button className="icon-btn" onClick={printPreview} title="In / Xuất PDF"><PrinterIcon size={15} /></button>
            <div className="theme-seg" role="group" aria-label="Chế độ Sáng / Tối">
              <button className={`ts${!c.isDarkMode ? " on" : ""}`} onClick={() => c.setTheme(false)} title="Sáng">☀</button>
              <button className={`ts${c.isDarkMode ? " on" : ""}`} onClick={() => c.setTheme(true)} title="Tối">☾</button>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE TAB BAR ═══ */}
        <div className="mob-tabs">
          <button className={`mob-tab${c.mobileTab === "form" ? " active" : ""}`} onClick={() => c.setMobileTab("form")}>
            <PencilSimpleIcon size={14} /> Nhập liệu
          </button>
          <button className={`mob-tab${c.mobileTab === "preview" ? " active" : ""}`} onClick={() => c.setMobileTab("preview")}>
            <EyeIcon size={14} /> Xem trước
          </button>
        </div>

        {/* ═══ WORKBENCH ═══ */}
        <div className={`wb${c.viewMode === "form" ? " vm-form" : ""}`}>
          {/* LEFT: FORM */}
          <div className={`wb-left${c.mobileTab === "form" ? " mob-on" : ""}`}>
            <div className="l-pad">
              {(c.appMode === "NEW" || c.appMode === "EDIT" || c.appMode === "IMPORT") && (
                <ContractFormPanel c={c} openDatePicker={openDatePicker} />
              )}
              {c.appMode === "BBNT" && <BBNTPanel c={c} openDatePicker={openDatePicker} />}
              {c.appMode === "DNTT" && <DNTTPanel c={c} openDatePicker={openDatePicker} />}
            </div>
          </div>

          {/* RIGHT: A4 PREVIEW */}
          <div className={`wb-right${c.mobileTab === "preview" ? " mob-on" : ""}`}>
            <div className="a4-bar">
              <span className="a4-bar-lbl">Preview</span>
              <button className="zbtn" onClick={zoomOut} title="Thu nhỏ">−</button>
              <span className="zpct">{Math.round(pgZoom * 100)}%</span>
              <button className="zbtn" onClick={zoomIn} title="Phóng to">+</button>
              <button className="tbtn" onClick={zoomFit} title="Fit width">⤢ Fit</button>
              <div className="bsep" />
              <div className="bar-r">
                <button className="tbtn" onClick={printPreview} title="In / Xuất PDF">
                  <PrinterIcon size={14} /> In
                </button>
                <button className="icon-btn" onClick={() => c.setTheme(!c.isDarkMode)} title="Sáng / Tối" style={{ width: 26, height: 26, fontSize: 12 }}>
                  {c.isDarkMode ? "☾" : "☀"}
                </button>
              </div>
            </div>
            <div className="a4-stage" ref={stageRef}>
              <div
                className="a4-page"
                style={{ zoom: pgZoom, ["--z" as string]: pgZoom }}
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {c.modals.confirm && <ConfirmModal c={c} />}
      {c.modals.picker && <ServicePickerModal c={c} />}
      {c.modals.loading && <ProcessingModal c={c} />}
      {c.modals.success && <SuccessModal c={c} />}

      {/* TOAST */}
      <ContractToast c={c} />

      {/* DATE PICKER */}
      {datePicker && (
        <ContractDatePicker
          config={datePicker}
          onConfirm={(target, field, value) => {
            c.applyDate(target, field, value);
            setDatePicker(null);
          }}
          onClose={() => setDatePicker(null)}
        />
      )}
    </div>
  );
};

export default ContractBuilder;
