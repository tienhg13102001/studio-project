// Top form fields: khách hàng / MST / dự án / yêu cầu / dates / phụ trách.

import { CalendarBlankIcon, CalendarCheckIcon } from "@phosphor-icons/react";
import { formatDateDisplay, formatDateOnly } from "#lib/quote/format";
import type { QuoteForm } from "#lib/quote/types";

type OpenPicker = (field: keyof QuoteForm, e: React.MouseEvent<HTMLDivElement>) => void;

type Props = {
  form: QuoteForm;
  setField: <K extends keyof QuoteForm>(field: K, value: QuoteForm[K]) => void;
  openDatePicker: OpenPicker;
};

const QuoteHeaderFields = ({ form, setField, openDatePicker }: Props) => {
  return (
    <>
      <div className="flex-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Khách hàng (*)</label>
          <input
            className="khach-input"
            type="text"
            value={form.khachhang}
            onChange={(e) => setField("khachhang", e.target.value)}
            placeholder="Tên khách hàng / Công ty"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Mã số thuế</label>
          <input
            type="text"
            inputMode="numeric"
            value={form.mst}
            onChange={(e) => setField("mst", e.target.value)}
            placeholder="Nhập MST..."
          />
        </div>
      </div>

      <div className="flex-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Dự án / Sự kiện</label>
          <input
            type="text"
            value={form.duann}
            onChange={(e) => setField("duann", e.target.value)}
            placeholder="Tên dự án / Sự kiện"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Yêu cầu</label>
          <input
            type="text"
            value={form.yeucau}
            onChange={(e) => setField("yeucau", e.target.value)}
            placeholder="Nhập yêu cầu..."
          />
        </div>
      </div>

      <div className="flex-row">
        <div className="form-group">
          <label>Từ (Call time)</label>
          <div className="date-input-wrap" onClick={(e) => openDatePicker("tu", e)}>
            <input
              type="text"
              readOnly
              value={formatDateDisplay(form.tu)}
              placeholder="Chọn ngày giờ..."
              className="date-display-input"
            />
            <button type="button" className="date-icon-btn">
              <CalendarBlankIcon size={15} />
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Đến (Wrap)</label>
          <div className="date-input-wrap" onClick={(e) => openDatePicker("den", e)}>
            <input
              type="text"
              readOnly
              value={formatDateDisplay(form.den)}
              placeholder="Chọn ngày giờ..."
              className="date-display-input"
            />
            <button type="button" className="date-icon-btn">
              <CalendarBlankIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Phụ trách</label>
          <input
            type="text"
            value={form.phutrach}
            onChange={(e) => setField("phutrach", e.target.value)}
            placeholder="Người báo giá..."
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Hạn hiệu lực báo giá</label>
          <div className="date-input-wrap" onClick={(e) => openDatePicker("hanHieuLuc", e)}>
            <input
              type="text"
              readOnly
              value={formatDateOnly(form.hanHieuLuc)}
              placeholder="Chọn ngày hết hạn..."
              className="date-display-input"
            />
            <button type="button" className="date-icon-btn">
              <CalendarCheckIcon size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuoteHeaderFields;
