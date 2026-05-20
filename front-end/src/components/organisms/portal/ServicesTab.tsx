import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { apiPut } from "#lib/api";
import type { ApiService } from "#lib/apiTypes";
import type { ServiceDisplay } from "#hooks/useServices";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

// ─── Edit form ───────────────────────────────────────────────────────────────

type ServiceForm = {
  titleEn:  string;
  titleVi:  string;
  descEn:   string;
  descVi:   string;
  iconName: string;
  image:    string;
  tag:      string;
  order:    number;
};

function toForm(s: ApiService): ServiceForm {
  return {
    titleEn:  s.title.en,
    titleVi:  s.title.vi,
    descEn:   s.description.en,
    descVi:   s.description.vi,
    iconName: s.iconName,
    image:    s.image,
    tag:      s.tag,
    order:    s.order,
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = {
  data:      ServiceDisplay[] | null;
  raw:       ApiService[]     | null;
  loading:   boolean;
  onRefetch: () => void;
};

export default function ServicesTab({ data, raw, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [form, setForm]       = useState<ServiceForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const openEdit = (displayId: string) => {
    const rawItem = (raw ?? []).find((s) => s.id === displayId);
    if (!rawItem) return;
    setEditing(rawItem);
    setForm(toForm(rawItem));
    setError(null);
  };
  const closeEdit = () => { setEditing(null); setForm(null); };

  const handleSave = async () => {
    if (!editing || !form) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut(`/api/services/${editing.id}`, {
        title:       { en: form.titleEn, vi: form.titleVi },
        description: { en: form.descEn,  vi: form.descVi  },
        iconName:    form.iconName,
        image:       form.image,
        tag:         form.tag,
        order:       form.order,
      });
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof ServiceForm, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  if (loading)
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-white/8 bg-white/3" />
        ))}
      </div>
    );

  return (
    <>
      <h2 className="text-lg font-semibold text-white">Services</h2>
      <div className="grid grid-cols-2 gap-4">
        {(data ?? []).map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="group flex gap-4 rounded-xl border border-white/8 bg-white/3 p-5 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon size={22} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/40">{s.description}</p>
              </div>
              <img src={s.image} alt={s.title} className="h-16 w-24 shrink-0 rounded-lg object-cover opacity-60" />
              <button
                onClick={() => openEdit(s.id)}
                className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 opacity-0 transition-all group-hover:opacity-100 hover:border-primary/40 hover:text-primary"
              >
                <PencilSimpleIcon size={11} />
                Edit
              </button>
            </div>
          );
        })}
      </div>

      <EditModal
        title={`Edit — ${editing?.title.en ?? ""}`}
        isOpen={!!editing}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
      >
        {form && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Title (EN)</label>
                <input className={inp} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Title (VI)</label>
                <input className={inp} value={form.titleVi} onChange={(e) => set("titleVi", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Description (EN)</label>
              <textarea
                className={inp}
                rows={2}
                value={form.descEn}
                onChange={(e) => set("descEn", e.target.value)}
              />
            </div>
            <div>
              <label className={lbl}>Description (VI)</label>
              <textarea
                className={inp}
                rows={2}
                value={form.descVi}
                onChange={(e) => set("descVi", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Icon Name</label>
                <input
                  className={inp}
                  placeholder="FilmReel"
                  value={form.iconName}
                  onChange={(e) => set("iconName", e.target.value)}
                />
              </div>
              <div>
                <label className={lbl}>Tag (slug)</label>
                <input className={inp} value={form.tag} onChange={(e) => set("tag", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Image</label>
              <ImageUpload value={form.image} onChange={(path) => set("image", path)} />
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
