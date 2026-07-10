// Multi-select service picker modal. Keys are "<catKey>::<ten>".
// Ported verbatim from back-end/scripts/google/hop-dong/index.html (lines 1278-1298).

import { useState } from "react";
import { CATEGORIES } from "#lib/contract/types";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const formatShortMoney = (n: number) => (n ? Number(n).toLocaleString("vi-VN") : "");

const ServicePickerModal = ({ c }: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const pickerSelCount = Object.values(selected).filter(Boolean).length;

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) c.closePicker();
      }}
    >
      <div className="popup" style={{ maxWidth: 540, textAlign: "left" }}>
        <div className="popup-title gold" style={{ textAlign: "center" }}>
          Chọn nhiều dịch vụ
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm dịch vụ..."
          style={{ marginBottom: 10 }}
        />
        <div className="picker-list">
          {CATEGORIES.map((tab) => {
            const services = c.pickerServices(tab.key, search);
            if (!services.length) return null;
            return (
              <div key={tab.key}>
                <div className="picker-grp">{tab.tab}</div>
                {services.map((s) => {
                  const key = `${tab.key}::${s.ten}`;
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
                      <span className="pi-price">{formatShortMoney(s.dongia)}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="par">
          <button type="button" className="bp bp-cl" onClick={() => c.closePicker()}>
            Đóng
          </button>
          <button type="button" className="bp bp-ok" onClick={() => c.addPicked(selected)}>
            Thêm {pickerSelCount} mục
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePickerModal;
