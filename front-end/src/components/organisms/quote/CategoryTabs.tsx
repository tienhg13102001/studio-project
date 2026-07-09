// Category tabs + per-category item tables (or empty state). In fullView all
// tables stack; otherwise only the active tab's table is shown.

import { TrayIcon, ListChecksIcon } from "@phosphor-icons/react";
import { CATEGORIES } from "#lib/quote/types";
import { formatTabTotal } from "#lib/quote/format";
import ItemTable from "./ItemTable";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const CategoryTabs = ({ q }: Props) => {
  return (
    <div className="view-transition">
      <div className="tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`tab-btn${q.activeTab === cat.key ? " active" : ""}`}
            onClick={() => q.setActiveTab(cat.key)}
          >
            {q.form.items[cat.key].length > 0 && (
              <span className="tab-count">{q.form.items[cat.key].length}</span>
            )}
            <span>{cat.tab}</span>
            {q.tabSubTotals[cat.key] > 0 && (
              <span className="tab-subtotal">{formatTabTotal(q.tabSubTotals[cat.key])}</span>
            )}
          </button>
        ))}
      </div>

      <button type="button" className="btn-picker" onClick={q.openPicker}>
        <ListChecksIcon size={15} />
        Chọn nhanh nhiều dịch vụ
      </button>

      {CATEGORIES.map((cat) => {
        const active = q.activeTab === cat.key || q.isFullView;
        const items = q.form.items[cat.key];
        return (
          <div key={cat.key} className={`tab-content${active ? " active" : ""}`}>
            <div className="full-view-title">{cat.tab}</div>
            {items.length === 0 ? (
              <div className="empty-hint">
                <TrayIcon size={26} />
                <div className="empty-txt">
                  Chưa có hạng mục <b>{cat.short}</b>
                </div>
                <div className="empty-actions">
                  <button type="button" className="btn-add-row" onClick={() => q.addItem(cat.key)}>
                    + Thêm {cat.short}
                  </button>
                  <button type="button" className="btn-add-row" onClick={q.openPicker}>
                    <ListChecksIcon size={12} /> Chọn nhanh
                  </button>
                </div>
              </div>
            ) : (
              <ItemTable tab={cat.key} short={cat.short} q={q} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
