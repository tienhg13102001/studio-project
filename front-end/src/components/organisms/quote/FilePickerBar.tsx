// EDIT mode: pick an existing quote file, then pick an Option (sheet) to load.

import { useEffect, useRef, useState } from "react";
import {
  ArrowsClockwiseIcon,
  CaretDownIcon,
  FolderOpenIcon,
  InfoIcon,
  SpinnerIcon,
  StackIcon,
} from "@phosphor-icons/react";
import type { QuoteBuilder } from "./useQuoteBuilder";

function parseFileName(name: string): { code: string; project: string; date: string } {
  const m = name.match(/^(BZ(\d{2})(\d{2})(\d{2})[\d.]*)\s*-?\s*(.*)$/);
  if (m) return { code: m[1], project: m[5].trim() || "—", date: `${m[4]}/${m[3]}/20${m[2]}` };
  return { code: name.substring(0, 14), project: name, date: "" };
}

type Props = {
  q: QuoteBuilder;
};

const FilePickerBar = ({ q }: Props) => {
  const [optionDropdownOpen, setOptionDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown chọn Option khi bấm ra ngoài (khớp hành vi @blur bản Vue)
  useEffect(() => {
    if (!optionDropdownOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOptionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [optionDropdownOpen]);

  return (
    <div className="file-select-box">
      <div className="file-search-row">
        <label style={{ color: "var(--gold)", margin: 0, fontSize: 11 }}>1. Chọn Báo Giá</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            className="file-search-input"
            value={q.fileSearchQuery}
            onChange={(e) => q.setFileSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
          />
          <button
            className="btn-pop btn-pop-new"
            style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 8, fontSize: 13 }}
            onClick={q.refreshFileList}
            title="Tải lại"
          >
            <ArrowsClockwiseIcon size={14} />
          </button>
        </div>
      </div>
      <div className="file-grid">
        {q.fileList.length === 0 ? (
          <div className="file-grid-empty">
            <FolderOpenIcon
              size={22}
              style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }}
            />
            Nhấn tải lại để lấy danh sách
          </div>
        ) : (
          q.filteredFiles.map((f) => {
            const info = parseFileName(f.name);
            return (
              <div
                key={f.id}
                className={`file-card${q.selectedFileId === f.id ? " fc-selected" : ""}`}
                onClick={() => q.selectFile(f)}
              >
                <div className="fc-code">{info.code}</div>
                <div className="fc-name">{info.project || f.name}</div>
                {info.date && <div className="fc-date">{info.date}</div>}
              </div>
            );
          })
        )}
      </div>

      {q.loadingFile && (
        <div
          className="info-banner"
          style={{ alignItems: "center", color: "var(--gold)" }}
        >
          <SpinnerIcon size={15} className="animate-spin" />
          <span>Đang tải báo giá…</span>
        </div>
      )}

      {q.selectedFileId && !q.loadingFile && q.optionList.length > 0 && (
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ color: "var(--gold)" }}>2. Chọn Option muốn nạp:</label>
          <div className="custom-dropdown-container" ref={dropRef}>
            <div
              className={`custom-select-display${optionDropdownOpen ? " open" : ""}`}
              onClick={() => setOptionDropdownOpen((v) => !v)}
            >
              <span style={{ color: q.selectedOption ? "var(--text)" : "var(--text-dim)" }}>
                {q.selectedOption || "-- Chọn Option (Sheet) --"}
              </span>
              <CaretDownIcon className="csd-arrow" size={11} />
            </div>
            {optionDropdownOpen && (
              <ul className="custom-dropdown-list">
                <li
                  style={{ color: "var(--text-dim)", fontStyle: "italic" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    q.selectOption("");
                    setOptionDropdownOpen(false);
                  }}
                >
                  -- Chọn Option (Sheet) --
                </li>
                {q.optionList.map((opt) => (
                  <li
                    key={opt}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      q.selectOption(opt);
                      setOptionDropdownOpen(false);
                    }}
                  >
                    <StackIcon size={13} style={{ marginRight: 8, opacity: 0.5 }} />
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {q.selectedOption && (
        <div className="info-banner">
          <InfoIcon size={14} />
          <span>
            Dữ liệu nạp từ <b>bản lưu trong app</b>. Nếu bạn đã sửa TAY trên Google Sheet thì thay
            đổi đó không hiện ở đây — bấm <b>Lưu đè</b> sẽ ghi đè mất. Đã sửa tay? Nên chọn{" "}
            <b>Thêm Option</b>.
          </span>
        </div>
      )}
    </div>
  );
};

export default FilePickerBar;
