// Top-level contract builder. Owns the useContractBuilder hook + datepicker open
// state, and lays out header / mode tabs / form (or BBNT/DNTT) / live A4 preview /
// modals. Faithful port of the Vue app (back-end/scripts/google/hop-dong/index.html).

import { useMemo, useState } from "react";
import {
  ClipboardTextIcon,
  EyeIcon,
  FileArrowDownIcon,
  FileTextIcon,
  FolderOpenIcon,
  HouseIcon,
  InvoiceIcon,
  MoonIcon,
  SunIcon,
  TableIcon,
} from "@phosphor-icons/react";
import { useContractBuilder, type AppMode, type DateTarget } from "./useContractBuilder";
import {
  buildBBNTPreview,
  buildContractPreview,
  buildDNTTPreview,
} from "./ContractPreview";
import { LOGO_FALLBACK, LOGO_SRC } from "./constants";
import ContractFormPanel from "./ContractFormPanel";
import BBNTPanel from "./BBNTPanel";
import DNTTPanel from "./DNTTPanel";
import ServicePickerModal from "./ServicePickerModal";
import ConfirmModal from "./ConfirmModal";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import ContractToast from "./ContractToast";
import ContractDatePicker, { type DatePickerConfig } from "./ContractDatePicker";

const MODE_TABS: { key: AppMode; label: string; icon: React.ReactNode }[] = [
  { key: "NEW", label: "TẠO MỚI", icon: <FileTextIcon size={16} /> },
  { key: "EDIT", label: "CHỈNH SỬA", icon: <FolderOpenIcon size={16} /> },
  { key: "IMPORT", label: "TỪ BÁO GIÁ", icon: <FileArrowDownIcon size={16} /> },
  { key: "BBNT", label: "NGHIỆM THU", icon: <ClipboardTextIcon size={16} /> },
  { key: "DNTT", label: "THANH TOÁN", icon: <InvoiceIcon size={16} /> },
];

const ContractBuilder = () => {
  const c = useContractBuilder();
  const [datePicker, setDatePicker] = useState<DatePickerConfig | null>(null);

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
    c.appMode,
    c.form,
    c.subTotal,
    c.afterCk,
    c.vatAmount,
    c.tonggiatri,
    c.tongTienChu,
    c.bbnt,
    c.bbntSumNthu,
    c.bbntVat,
    c.bbntTong,
    c.bbntConPhai,
    c.bbntConPhaiChu,
    c.dntt,
    c.dnttSoDntt,
    c.dnttSoTienChu,
  ]);

  const openDatePicker = (
    target: DateTarget,
    field: string,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;
    if (top + 370 > window.innerHeight) top = rect.top - 376;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 296;
    const source =
      target === "form"
        ? (c.form as Record<string, unknown>)
        : target === "bbnt"
          ? (c.bbnt as Record<string, unknown>)
          : (c.dntt as Record<string, unknown>);
    setDatePicker({
      field,
      target,
      dateOnly: true,
      value: String(source[field] ?? ""),
      pos: { top: Math.max(8, top), left: Math.max(8, left) },
    });
  };

  const splitOff = c.viewMode === "form";

  return (
    <div className={`bz${c.isDarkMode ? "" : " light"}`}>
      <div className="app-root">
        <div className="app-top">
          {/* HEADER */}
          <div className="header">
            <div className="header-tools">
              <button className="icon-btn" onClick={c.resetForm} title="Trang chủ — tạo hợp đồng mới">
                <HouseIcon size={15} />
              </button>
              <button
                className={`icon-btn split-toggle${!splitOff ? " active" : ""}`}
                onClick={c.toggleViewMode}
                title="Bật/tắt xem trước trực tiếp"
              >
                <TableIcon size={15} />
              </button>
              <button
                className="icon-btn"
                onClick={() => c.setTheme(!c.isDarkMode)}
                title="Đổi giao diện sáng/tối"
              >
                {c.isDarkMode ? <SunIcon size={15} /> : <MoonIcon size={15} />}
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
              <div className="header-title">HỢP ĐỒNG</div>
              <div className="header-sub">Bee Z Production</div>
            </div>
            <div className="sobg-badge">{c.sohdDisplay}</div>
          </div>

          {/* Draft chip */}
          {c.hasDraft && (
            <div className="draft-chip">
              <EyeIcon size={11} />
              {`Có bản nháp ${c.draftSavedAt}`}
              <button type="button" className="draft-clear" onClick={c.restoreDraftNow}>
                Khôi phục
              </button>
            </div>
          )}
          {!c.hasDraft && c.draftSavedAt && (
            <div className={`draft-chip${c.draftRestored ? " restored" : ""}`}>
              <EyeIcon size={11} />
              {c.draftRestored ? "Đã khôi phục nháp" : `Đã lưu nháp ${c.draftSavedAt}`}
              <button type="button" className="draft-clear" onClick={c.clearDraft} title="Xóa nháp">
                ✕
              </button>
            </div>
          )}

          {/* MODE TABS */}
          <div className="mode-tabs">
            {MODE_TABS.map((m) => (
              <div
                key={m.key}
                className={`mode-btn${c.appMode === m.key ? " active" : ""}`}
                onClick={() => c.setMode(m.key)}
              >
                {m.icon} {m.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mobile-preview-btn">
          <button className="btn-preview-toggle" onClick={() => c.setMobileTab("preview")}>
            <EyeIcon size={14} /> Xem trước
          </button>
        </div>

        <div className={`split-layout${splitOff ? " no-split" : ""}`}>
          <div className="split-left">
            {(c.appMode === "NEW" || c.appMode === "EDIT" || c.appMode === "IMPORT") && (
              <ContractFormPanel c={c} openDatePicker={openDatePicker} />
            )}
            {c.appMode === "BBNT" && <BBNTPanel c={c} openDatePicker={openDatePicker} />}
            {c.appMode === "DNTT" && <DNTTPanel c={c} openDatePicker={openDatePicker} />}
          </div>

          <div className="split-right">
            <div className="preview-header">
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <EyeIcon size={12} />
                Preview real-time
              </span>
            </div>
            <div className="a4-stage">
              <div className="a4-paper" dangerouslySetInnerHTML={{ __html: previewHTML }} />
            </div>
          </div>
        </div>

        {c.modals.picker && <ServicePickerModal c={c} />}
        {c.modals.confirm && <ConfirmModal c={c} />}
        {c.modals.loading && <ProcessingModal c={c} />}
        {c.modals.success && <SuccessModal c={c} />}
        <ContractToast c={c} />
      </div>

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
