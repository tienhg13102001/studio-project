import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { apiPut } from "#lib/api";
import type { ApiFeature, ApiService, ApiServiceTag } from "#lib/apiTypes";
import type { FeatureDisplay } from "#hooks/useFeatured";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const sel =
  "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

const TAG_COLORS: Record<string, string> = {
  TVC:       "bg-amber-500/15   text-amber-400   border-amber-500/30",
  SHORT:     "bg-blue-500/15    text-blue-400    border-blue-500/30",
  "F&B":     "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERVIEW: "bg-violet-500/15  text-violet-400  border-violet-500/30",
};

// ─── Edit form ───────────────────────────────────────────────────────────────

type FeatureForm = {
  title:     string;
  subtitle:  string;
  image:     string;
  layout:    "vertical" | "horizontal";
  prominent: boolean;
  order:     number;
  tag:       string; // service ObjectId
};

function toForm(f: ApiFeature): FeatureForm {
  const tagId =
    typeof f.tag === "object"
      ? (f.tag as ApiServiceTag).id
      : (f.tag as string);
  return {
    title:     f.title,
    subtitle:  f.subtitle,
    image:     f.image,
    layout:    f.layout,
    prominent: f.prominent,
    order:     f.order,
    tag:       tagId,
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = {
  data:      FeatureDisplay[];
  raw:       ApiFeature[] | null;
  services:  ApiService[]  | null;
  loading:   boolean;
  onRefetch: () => void;
};

export default function ProjectsTab({ data, raw, services, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiFeature | null>(null);
  const [form, setForm]       = useState<FeatureForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const openEdit = (displayId: string) => {
    const rawItem = (raw ?? []).find((f) => f.id === displayId);
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
      await apiPut(`/api/featured/${editing.id}`, {
        title:     form.title,
        subtitle:  form.subtitle,
        image:     form.image,
        layout:    form.layout,
        prominent: form.prominent,
        order:     form.order,
        tag:       form.tag,
      });
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof FeatureForm, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  if (loading)
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-white/8 bg-white/3" />
        ))}
      </div>
    );

  return (
    <>
      <h2 className="text-lg font-semibold text-white">Projects</h2>
      <div className="grid grid-cols-3 gap-4">
        {data.map((p) => (
          <div
            key={p.id}
            className="group overflow-hidden rounded-xl border border-white/8 bg-white/3 transition-all hover:border-primary/30"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="h-full w-full object-cover opacity-70 transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
              />
              <span
                className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${TAG_COLORS[p.tag] ?? "bg-white/10 text-white/60 border-white/20"}`}
              >
                {p.tag}
              </span>
              <button
                onClick={() => openEdit(p.id)}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-2 py-1 text-[10px] text-white/70 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:border-primary/30 hover:text-primary"
              >
                <PencilSimpleIcon size={10} />
                Edit
              </button>
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-xs font-medium text-white">{p.title}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{p.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <EditModal
        title="Edit Project"
        isOpen={!!editing}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
      >
        {form && (
          <>
            <div>
              <label className={lbl}>Title</label>
              <input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Subtitle</label>
              <input className={inp} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Image</label>
              <ImageUpload value={form.image} onChange={(path) => set("image", path)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Layout</label>
                <select
                  className={sel}
                  value={form.layout}
                  onChange={(e) => set("layout", e.target.value as FeatureForm["layout"])}
                >
                  <option value="vertical">vertical</option>
                  <option value="horizontal">horizontal</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Service Tag</label>
                <select
                  className={sel}
                  value={form.tag}
                  onChange={(e) => set("tag", e.target.value)}
                >
                  {(services ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tag} — {s.title.en}
                    </option>
                  ))}
                </select>
              </div>
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
            <div className="flex items-center gap-2">
              <input
                id="prominent"
                type="checkbox"
                checked={form.prominent}
                onChange={(e) => set("prominent", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="prominent" className="text-sm text-white/60">
                Prominent
              </label>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>
    </>
  );
}
