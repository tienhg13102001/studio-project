// Custom Monday-first date picker, ported to match the original hop-dong Vue
// app's `.dp-*` markup (back-end/scripts/google/hop-dong/index.html). Date-only.
// Renders into a portal on document.body.

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { DateTarget } from "./useContractBuilder";

export type DatePickerConfig = {
  field: string;
  target: DateTarget;
  dateOnly: boolean;
  value: string;
  pos: { top: number; left: number };
};

type Props = {
  config: DatePickerConfig;
  onConfirm: (target: DateTarget, field: string, value: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["H", "B", "T", "N", "S", "B", "C"];
const pad2 = (n: number) => String(n).padStart(2, "0");

type DayCell = { d: number; cur: boolean; y: number; mo: number; da: number };

const ContractDatePicker = ({ config, onConfirm, onClose }: Props) => {
  const initial = useMemo(
    () => (config.value ? new Date(config.value) : new Date()),
    [config.value],
  );

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [sy, setSy] = useState(initial.getFullYear());
  const [sm, setSm] = useState(initial.getMonth());
  const [sd, setSd] = useState(initial.getDate());

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

  const monthLabel = `Tháng ${viewMonth + 1} ${viewYear}`;

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

  const confirm = () => {
    onConfirm(config.target, config.field, `${sy}-${pad2(sm + 1)}-${pad2(sd)}`);
  };

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9998 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dp-popup" style={{ top: config.pos.top, left: config.pos.left }}>
        <div className="dp-hdr">
          <button type="button" className="dp-nb" onClick={prevMonth}>
            <CaretLeftIcon size={12} weight="bold" />
          </button>
          <span className="dp-ml">{monthLabel}</span>
          <button type="button" className="dp-nb" onClick={nextMonth}>
            <CaretRightIcon size={12} weight="bold" />
          </button>
        </div>
        <div className="dp-wd">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="dp-grid">
          {calendarDays.map((day, i) => {
            const cls = [
              "dp-d",
              !day.cur ? "dp-oth" : "",
              isSelected(day) ? "dp-sel" : "",
              isToday(day) ? "dp-tod" : "",
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
        <div className="dp-ft">
          <button type="button" className="dp-btn dp-cn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="dp-btn dp-ok" onClick={confirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    // Phải portal VÀO .hd: CSS (`.hd .dp-popup`) và biến màu (--gold, --text…) đều scope dưới .hd.
    // Ra document.body là rule không khớp → mất position:fixed (top/left inline vô tác dụng) → lịch
    // nhảy lên đầu màn hình và mất màu. .hd không có transform/filter nên fixed vẫn neo theo viewport.
    document.querySelector(".hd") ?? document.body,
  );
};

export default ContractDatePicker;
