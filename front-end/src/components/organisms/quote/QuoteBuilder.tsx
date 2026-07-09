// Top-level quote builder. Owns the useQuoteBuilder hook + the datepicker open
// state, and lays out header / form / tabs / summary / preview / modals.
// Faithful port of the Vue app markup (back-end/scripts/google/index.html).

import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowsOutSimpleIcon,
  EyeIcon,
  FileTextIcon,
  FolderOpenIcon,
  HouseIcon,
  MinusIcon,
  PlusIcon,
  RocketLaunchIcon,
  TableIcon,
} from "@phosphor-icons/react";
import { formatMoney } from "#lib/quote/format";
import type { QuoteForm } from "#lib/quote/types";
import { useQuoteBuilder } from "./useQuoteBuilder";
import { buildPreviewHTML } from "./A4Preview";
import { LOGO_FALLBACK, LOGO_SRC } from "./constants";
import QuoteHeaderFields from "./QuoteHeaderFields";
import FilePickerBar from "./FilePickerBar";
import CategoryTabs from "./CategoryTabs";
import SummarySection from "./SummarySection";
import ServicePickerModal from "./ServicePickerModal";
import ConfirmModal from "./ConfirmModal";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import MobileBar from "./MobileBar";
import QuoteToast from "./QuoteToast";
import QuoteDatePicker, { type DatePickerConfig } from "./QuoteDatePicker";

const QuoteBuilder = () => {
  const q = useQuoteBuilder();
  const [datePicker, setDatePicker] = useState<DatePickerConfig | null>(null);

  const previewHTML = useMemo(
    () => buildPreviewHTML(q.form, q.subTotal, q.finalTotal, q.tongTienChu),
    [q.form, q.subTotal, q.finalTotal, q.tongTienChu],
  );

  const openDatePicker = (
    field: keyof QuoteForm,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;
    if (top + 370 > window.innerHeight) top = rect.top - 376;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 296;
    setDatePicker({
      field: field as string,
      dateOnly: field === "hanHieuLuc",
      value: String(q.form[field] ?? ""),
      pos: { top: Math.max(8, top), left: Math.max(8, left) },
    });
  };

  const submitLabel =
    q.appMode === "NEW"
      ? "TẠO FILE BÁO GIÁ MỚI"
      : q.editActionType === "EDIT_OPTION"
        ? "LƯU ĐÈ LÊN OPTION HIỆN TẠI"
        : "TẠO THÊM OPTION VÀO BÁO GIÁ NÀY";

  return (
    <div className={`bz${q.isFullView ? " full-view" : ""}`}>
      <div className="app-root">
        <div className="app-top">
          {/* HEADER */}
          <div className="header">
            <div className="header-tools">
              <button
                className="icon-btn"
                onClick={q.reloadHome}
                title="Trang chủ — làm mới & tạo báo giá mới"
              >
                <HouseIcon size={15} />
              </button>
              <button
                className={`icon-btn split-toggle${q.splitView ? " active" : ""}`}
                onClick={q.toggleSplitView}
                title={
                  q.splitView
                    ? "Đang bật Xem trước trực tiếp — bấm để về dạng cổ điển"
                    : "Bật Xem trước trực tiếp (2 cột)"
                }
              >
                <TableIcon size={15} />
              </button>
              <button className="icon-btn" onClick={q.toggleFullView} title="Dạng 1 trang">
                <FileTextIcon size={15} />
              </button>
            </div>
            <div className="logo-wrap">
              <div className="logo-ring" />
              <div className="logo-inner">
                <img
                  src={LOGO_SRC}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                  }}
                  className="logo-img"
                  alt="Bee Z"
                />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="header-title">TẠO BÁO GIÁ</div>
              <div className="header-sub">Bee Z Production</div>
            </div>
            <div className="sobg-badge">{q.form.sobg}</div>
          </div>

          {/* Draft chip (NEW only) */}
          {q.draftSavedAt && q.appMode === "NEW" && (
            <div className={`draft-chip${q.draftRestored ? " restored" : ""}`}>
              <EyeIcon size={11} />
              {q.draftRestored ? "Đã khôi phục nháp" : `Đã lưu nháp ${q.draftSavedAt}`}
              <button type="button" className="draft-clear" onClick={q.clearDraft} title="Xóa nháp">
                ✕
              </button>
            </div>
          )}

          {/* MODE SELECT */}
          <div className="mode-tabs">
            <div
              className={`mode-btn${q.appMode === "NEW" ? " active" : ""}`}
              onClick={() => q.setMode("NEW")}
            >
              <FileTextIcon size={16} /> TẠO MỚI
            </div>
            <div
              className={`mode-btn${q.appMode === "EDIT" ? " active" : ""}`}
              onClick={() => q.setMode("EDIT")}
            >
              <FolderOpenIcon size={16} /> CHỈNH SỬA / THÊM OPTION
            </div>
          </div>
        </div>

        {/* Mobile preview button */}
        <div className="mobile-preview-btn">
          <button className="btn-preview-toggle" onClick={q.openPreviewFullscreen}>
            <EyeIcon size={14} /> Xem trước báo giá
          </button>
        </div>

        <div className={`split-layout${q.splitView ? "" : " no-split"}`}>
          <div className="split-left">
            {q.appMode === "NEW" && (
              <div className="prog" title={`${q.progDone}/4 mục cần điền`}>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${q.progPct}%` }} />
                </div>
                <span className="prog-lbl">
                  {q.progDone}/4 · {q.progPct}%
                </span>
              </div>
            )}

            {q.appMode === "EDIT" && <FilePickerBar q={q} />}

            <QuoteHeaderFields form={q.form} setField={q.setField} openDatePicker={openDatePicker} />

            <hr className="divider" />

            <CategoryTabs q={q} />

            <SummarySection q={q} />

            <button type="button" className="btn-submit" onClick={q.confirmCreate}>
              <div className="submit-label">
                <RocketLaunchIcon size={15} weight="fill" />
                {submitLabel}
              </div>
              {q.finalTotal > 0 && <div className="submit-total">{formatMoney(q.finalTotal)}</div>}
            </button>
            <div className="shortcut-hint">
              Mẹo: <b>Enter</b> — qua ô tiếp theo &nbsp;|&nbsp; <b>Ctrl + Enter</b> — xuất báo giá
            </div>
          </div>

          {/* Live preview (desktop) */}
          <div className="split-right">
            <div className="preview-header">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
                <EyeIcon size={12} />
                Preview real-time
              </span>
              <button className="btn-fs" onClick={q.openPreviewFullscreen} title="Toàn màn hình">
                <ArrowsOutSimpleIcon size={12} />
              </button>
            </div>
            <div className="a4-stage">
              <div className="a4-paper" dangerouslySetInnerHTML={{ __html: previewHTML }} />
            </div>
          </div>
        </div>

        <MobileBar q={q} />

        {q.modals.picker && <ServicePickerModal q={q} />}
        {q.modals.confirm && <ConfirmModal q={q} />}
        {q.modals.loading && <ProcessingModal q={q} />}
        {q.modals.success && <SuccessModal q={q} />}
        <QuoteToast q={q} />
      </div>

      {/* Full-screen preview overlay (portaled-style, outside .bz-scoped layout) */}
      {q.previewFullscreen && (
        <div className="bz-preview-overlay">
          <div className="bz-preview-overlay-bar">
            <button className="bz-btn-back" onClick={q.closePreviewFullscreen}>
              <ArrowLeftIcon size={13} /> Quay lại
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Xem trước báo giá
            </span>
            <div className="bz-preview-zoom-ctrl">
              <button className="bz-pz-btn" onClick={() => q.zoomPreview(-0.15)} title="Thu nhỏ">
                <MinusIcon size={12} />
              </button>
              <button className="bz-pz-btn bz-pz-num" onClick={() => q.zoomPreview(0)} title="Về cỡ gốc">
                {Math.round(q.previewZoom * 100)}%
              </button>
              <button className="bz-pz-btn" onClick={() => q.zoomPreview(0.15)} title="Phóng to">
                <PlusIcon size={12} />
              </button>
            </div>
          </div>
          <div className="bz-preview-overlay-scroll">
            <div
              className="a4-paper"
              style={{ maxWidth: 794, margin: "0 auto", zoom: q.previewZoom }}
              dangerouslySetInnerHTML={{ __html: previewHTML }}
            />
          </div>
        </div>
      )}

      {datePicker && (
        <QuoteDatePicker
          config={datePicker}
          onConfirm={(field, value) => {
            q.setField(field as keyof QuoteForm, value as never);
            setDatePicker(null);
          }}
          onClose={() => setDatePicker(null)}
        />
      )}
    </div>
  );
};

export default QuoteBuilder;
