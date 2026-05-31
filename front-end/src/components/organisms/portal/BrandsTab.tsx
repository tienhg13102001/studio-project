import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { apiPut, resolveAssetUrl } from "#lib/api";
import type { ApiBrand } from "#lib/apiTypes";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";

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
          <Skeleton key={i} className="h-20 rounded-xl border border-white/8" />
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
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(b)}
              className="absolute right-1.5 top-1.5 border border-white/10 bg-[#0d0d0d] text-white/40 opacity-0 transition-all group-hover:opacity-100 hover:border-primary/30 hover:text-primary"
            >
              <PencilSimpleIcon size={10} />
            </Button>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* ── Left ──────────────────────────────── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => set("order", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* ── Right: logo ───────────────────────── */}
              <div>
                <Label>LogoYellow</Label>
                <ImageUpload value={form.logo} onChange={(path) => set("logo", path)} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>
    </>
  );
}
