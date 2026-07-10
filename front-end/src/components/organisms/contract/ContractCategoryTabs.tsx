// Category tabs + per-category item tables (or empty state). Mirrors
// organisms/quote/CategoryTabs.tsx for the contract builder.

import { TrayIcon, ListChecksIcon } from "@phosphor-icons/react";
import { CATEGORIES } from "#lib/contract/types";
import { formatTabTotal } from "#lib/contract/format";
import ContractItemTable from "./ContractItemTable";
import type { ContractBuilder } from "./useContractBuilder";

type Props = { c: ContractBuilder };

const ContractCategoryTabs = ({ c }: Props) => {
  return (
    <div className="view-transition">
      <div className="tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`tab-btn${c.activeTab === cat.key ? " active" : ""}`}
            onClick={() => c.setActiveTab(cat.key)}
          >
            {c.form.items[cat.key].length > 0 && (
              <span className="tab-count">{c.form.items[cat.key].length}</span>
            )}
            <span>{cat.tab}</span>
            {c.tabSubTotals[cat.key] > 0 && (
              <span className="tab-subtotal">{formatTabTotal(c.tabSubTotals[cat.key])}</span>
            )}
          </button>
        ))}
      </div>

      <button type="button" className="btn-picker" onClick={c.openPicker}>
        <ListChecksIcon size={15} />
        Chọn nhanh nhiều dịch vụ
      </button>

      {CATEGORIES.map((cat) => {
        const active = c.activeTab === cat.key;
        const items = c.form.items[cat.key];
        return (
          <div key={cat.key} className={`tab-content${active ? " active" : ""}`}>
            {items.length === 0 ? (
              <div className="empty-hint">
                <TrayIcon size={26} />
                <div className="empty-txt">
                  Chưa có hạng mục <b>{cat.short}</b>
                </div>
                <div className="empty-actions">
                  <button type="button" className="btn-add-row" onClick={() => c.addItem(cat.key)}>
                    + Thêm {cat.short}
                  </button>
                  <button type="button" className="btn-add-row" onClick={c.openPicker}>
                    <ListChecksIcon size={12} /> Chọn nhanh
                  </button>
                </div>
              </div>
            ) : (
              <ContractItemTable tab={cat.key} short={cat.short} c={c} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContractCategoryTabs;
