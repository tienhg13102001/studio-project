// Custom Monday-first date(+time) picker, ported from the Vue app's datePicker.
// Renders into a portal on document.body, so it uses `.bz-`-prefixed classes
// (styled globally in bao-gia.css) rather than relying on a `.bz` ancestor.

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CaretLeftIcon, CaretRightIcon, CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";

export type DatePickerConfig = {
  field: string;
  dateOnly: boolean;
  value: string;
  pos: { top: number; left: number };
};

type Props = {
  config: DatePickerConfig;
  onConfirm: (field: string, value: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

type DayCell = { d: number; cur: boolean; y: number; mo: number; da: number };

const QuoteDatePicker = ({ config, onConfirm, onClose }: Props) => {
  const initial = useMemo(() => (config.value ? new Date(config.value) : new Date()), [config.value]);

  // Từ (Call time) / Đến (Wrap) được phép bỏ trống — backend đã thay '' cho {{tu}}/{{den}} khi rỗng
  const canClear = config.field === "tu" || config.field === "den";

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [sy, setSy] = useState(initial.getFullYear());
  const [sm, setSm] = useState(initial.getMonth());
  const [sd, setSd] = useState(initial.getDate());
  const [h, setH] = useState(initial.getHours());
  const [m, setM] = useState(initial.getMinutes());

  const calendarDays = useMemo<DayCell[]>(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon = 0
    const days: DayCell[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      const dt = new Date(viewYear, viewMonth, -i);
      days.push({ d: dt.getDate(), cur: false, y: dt.getFullYear(), mo: dt.getMonth(), da: dt.getDate() });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ d: i, cur: true, y: viewYear, mo: viewMonth, da: i });
    }
    let next = 1;
    while (days.length < 42) {
      const dt = new Date(viewYear, viewMonth + 1, next++);
      days.push({ d: dt.getDate(), cur: false, y: dt.getFullYear(), mo: dt.getMonth(), da: dt.getDate() });
    }
    return days;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    let mo = viewMonth - 1;
    let y = viewYear;
    if (mo < 0) {
      mo = 11;
      y--;
    }
    setViewMonth(mo);
    setViewYear(y);
  };
  const nextMonth = () => {
    let mo = viewMonth + 1;
    let y = viewYear;
    if (mo > 11) {
      mo = 0;
      y++;
    }
    setViewMonth(mo);
    setViewYear(y);
  };

  const selectDay = (day: DayCell) => {
    if (!day.cur) {
      setViewYear(day.y);
      setViewMonth(day.mo);
    }
    setSy(day.y);
    setSm(day.mo);
    setSd(day.da);
  };

  const isSelected = (day: DayCell) => day.y === sy && day.mo === sm && day.da === sd;
  const isToday = (day: DayCell) => {
    const t = new Date();
    return day.y === t.getFullYear() && day.mo === t.getMonth() && day.da === t.getDate();
  };

  const clampH = () => setH((v) => Math.min(23, Math.max(0, v || 0)));
  const clampM = () => setM((v) => Math.min(59, Math.max(0, v || 0)));

  const confirm = () => {
    const hh = Math.min(23, Math.max(0, h || 0));
    const mm = Math.min(59, Math.max(0, m || 0));
    const dateStr = `${sy}-${pad2(sm + 1)}-${pad2(sd)}`;
    onConfirm(config.field, config.dateOnly ? dateStr : `${dateStr}T${pad2(hh)}:${pad2(mm)}`);
  };

  return createPortal(
    <div className="bz-dp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="bz-dp-popup"
        style={{ top: config.pos.top, left: config.pos.left }}
      >
        <div className="bz-dp-header">
          <button type="button" className="bz-dp-nav-btn" onClick={prevMonth}>
            <CaretLeftIcon size={12} weight="bold" />
          </button>
          <span className="bz-dp-month-label">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button type="button" className="bz-dp-nav-btn" onClick={nextMonth}>
            <CaretRightIcon size={12} weight="bold" />
          </button>
        </div>
        <div className="bz-dp-weekdays">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="bz-dp-grid">
          {calendarDays.map((day, i) => {
            const cls = [
              "bz-dp-day",
              !day.cur ? "dp-other" : "",
              isSelected(day) ? "dp-selected" : "",
              isToday(day) ? "dp-today" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={i} className={cls} onClick={() => selectDay(day)}>
                {day.d}
              </div>
            );
          })}
        </div>
        {!config.dateOnly && (
          <div className="bz-dp-time">
            <div className="bz-dp-time-col">
              <button
                type="button"
                className="bz-dp-arrow"
                onClick={() => setH((v) => (v + 1 + 24) % 24)}
              >
                <CaretUpIcon size={11} weight="bold" />
              </button>
              <input
                type="number"
                className="bz-dp-time-val"
                value={h}
                min={0}
                max={23}
                onChange={(e) => setH(parseInt(e.target.value) || 0)}
                onBlur={clampH}
              />
              <button
                type="button"
                className="bz-dp-arrow"
                onClick={() => setH((v) => (v - 1 + 24) % 24)}
              >
                <CaretDownIcon size={11} weight="bold" />
              </button>
              <span className="bz-dp-time-lbl">Giờ</span>
            </div>
            <span className="bz-dp-time-sep">:</span>
            <div className="bz-dp-time-col">
              <button
                type="button"
                className="bz-dp-arrow"
                onClick={() => setM((v) => (v + 1 + 60) % 60)}
              >
                <CaretUpIcon size={11} weight="bold" />
              </button>
              <input
                type="number"
                className="bz-dp-time-val"
                value={m}
                min={0}
                max={59}
                onChange={(e) => setM(parseInt(e.target.value) || 0)}
                onBlur={clampM}
              />
              <button
                type="button"
                className="bz-dp-arrow"
                onClick={() => setM((v) => (v - 1 + 60) % 60)}
              >
                <CaretDownIcon size={11} weight="bold" />
              </button>
              <span className="bz-dp-time-lbl">Phút</span>
            </div>
          </div>
        )}
        <div className="bz-dp-footer">
          <button type="button" className="bz-dp-btn bz-dp-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          {canClear && (
            <button
              type="button"
              className="bz-dp-btn bz-dp-btn-clear"
              onClick={() => onConfirm(config.field, "")}
            >
              Xóa
            </button>
          )}
          <button type="button" className="bz-dp-btn bz-dp-btn-ok" onClick={confirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QuoteDatePicker;
