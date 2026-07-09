// Multi-select service picker modal. Keys are "<tabId>::<ten>".

import { useMemo, useState } from "react";
import { CATEGORIES } from "#lib/quote/types";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const shortMoney = (n: number) => (!n || n === 0 ? "" : Number(n).toLocaleString("vi-VN"));

const ServicePickerModal = ({ q }: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const query = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      cat,
      services: (q.db[cat.key] || []).filter(
        (s) => !query || s.ten.toLowerCase().includes(query),
      ),
    }));
  }, [q.db, search]);

  const selCount = Object.values(selected).filter(Boolean).length;
  const anyMatch = grouped.some((g) => g.services.length > 0);

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && q.closePicker()}
    >
      <div className="popup" style={{ maxWidth: 540, textAlign: "left" }}>
        <div className="popup-title gold" style={{ textAlign: "center" }}>
          Chọn nhanh nhiều dịch vụ
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm dịch vụ..."
          style={{ marginBottom: 10 }}
        />
        <div className="picker-list">
          {grouped.map(
            ({ cat, services }) =>
              services.length > 0 && (
                <div key={cat.key}>
                  <div className="picker-grp">{cat.tab}</div>
                  {services.map((s) => {
                    const key = `${cat.key}::${s.ten}`;
                    return (
                      <label key={key} className="picker-item">
                        <input
                          type="checkbox"
                          checked={!!selected[key]}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                        />
                        <span className="pi-name">{s.ten}</span>
                        <span className="pi-price">{shortMoney(s.dongia)}</span>
                      </label>
                    );
                  })}
                </div>
              ),
          )}
          {!anyMatch && (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-dim)",
                padding: 18,
                fontSize: 13,
              }}
            >
              Không có dịch vụ khớp.
            </div>
          )}
        </div>
        <div className="popup-action-row">
          <button type="button" className="btn-pop btn-pop-close" onClick={q.closePicker}>
            Đóng
          </button>
          <button type="button" className="btn-pop btn-pop-new" onClick={() => q.addPicked(selected)}>
            Thêm {selCount} mục
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePickerModal;
