import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { apiPut, resolveAssetUrl } from "#lib/api";
import type { ApiBrand } from "#lib/apiTypes";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

// ─── BrandsGrid (also used by OverviewTab) ───────────────────────────────────

type GridProps = {
  data:     ApiBrand[] | null;
  loading:  boolean;
  preview?: boolean;
  onEdit?:  (b: ApiBrand) => void;
};

export function BrandsGrid({ data, loading, preview, onEdit }: GridProps) {
  const items = preview ? (data ?? []).slice(0, 6) : (data ?? []);

  if (loading)
    return (
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-white/8 bg-white/3" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-6 gap-3">
      {items.map((b) => (
        <div
          key={b.id}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
        >
          <img
            src={resolveAssetUrl(b.logo)}
            alt={b.name}
            className="h-8 w-full object-contain grayscale opacity-50 transition-all group-hover:opacity-100 group-hover:grayscale-0"
          />
          <p className="w-full truncate text-center text-[10px] text-white/30">{b.name}</p>
          {onEdit && (
            <button
              onClick={() => onEdit(b)}
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[#0d0d0d] text-white/40 opacity-0 transition-all group-hover:opacity-100 hover:border-primary/30 hover:text-primary"
            >
              <PencilSimpleIcon size={10} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Edit form ───────────────────────────────────────────────────────────────

type BrandForm = { name: string; logo: string; order: number };

function toForm(b: ApiBrand): BrandForm {
  return { name: b.name, logo: b.logo, order: b.order };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = { data: ApiBrand[] | null; loading: boolean; onRefetch: () => void };

export default function BrandsTab({ data, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiBrand | null>(null);
  const [form, setForm]       = useState<BrandForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const openEdit  = (b: ApiBrand) => { setEditing(b); setForm(toForm(b)); setError(null); };
  const closeEdit = () => { setEditing(null); setForm(null); };

  const handleSave = async () => {
    if (!editing || !form) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut(`/api/brands/${editing.id}`, { name: form.name, logo: form.logo, order: form.order });
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof BrandForm, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <>
      <h2 className="text-lg font-semibold text-white">Brands</h2>
      <BrandsGrid data={data} loading={loading} onEdit={openEdit} />

      <EditModal
        title={`Edit — ${editing?.name ?? ""}`}
        isOpen={!!editing}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
      >
        {form && (
          <>
            <div>
              <label className={lbl}>Name</label>
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Logo</label>
              <ImageUpload value={form.logo} onChange={(path) => set("logo", path)} />
            </div>
            <div>
              <label className={lbl}>Order</label>
              <input
                className={inp}
                type="number"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>
    </>
  );
}
