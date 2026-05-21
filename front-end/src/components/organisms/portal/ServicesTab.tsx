import { useState } from "react";
import { PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { apiFetch, apiPost, apiPut, apiDelete } from "#lib/api";
import type { ApiService } from "#lib/apiTypes";
import type { ServiceDisplay } from "#hooks/useServices";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import AutoTextarea from "#components/ui/portal/AutoTextarea";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

// ─── Edit form ───────────────────────────────────────────────────────────────

type FaqForm = {
  questionEn: string;
  questionVi: string;
  answerEn: string;
  answerVi: string;
};

type ServiceForm = {
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  thumbnailImage: string;
  tag: string;
  faqs: FaqForm[];
};

function toForm(s: ApiService): ServiceForm {
  return {
    titleEn: s.title.en,
    titleVi: s.title.vi,
    descEn: s.description.en,
    descVi: s.description.vi,
    thumbnailImage: s.thumbnailImage,
    tag: s.tag,
    faqs: (s.faqs ?? []).map((f) => ({
      questionEn: f.question.en,
      questionVi: f.question.vi,
      answerEn: f.answer.en,
      answerVi: f.answer.vi,
    })),
  };
}
function emptyServiceForm(): ServiceForm {
  return { titleEn: "", titleVi: "", descEn: "", descVi: "", thumbnailImage: "", tag: "", faqs: [] };
}
// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = {
  data: ServiceDisplay[] | null;
  raw: ApiService[] | null;
  loading: boolean;
  onRefetch: () => void;
};

export default function ServicesTab({ data, raw, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ServiceForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiService | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openEdit = async (displayId: string) => {
    setLoadingEdit(true);
    setCreating(false);
    setError(null);
    try {
      const full = await apiFetch<ApiService>(`/api/services/${displayId}`);
      setEditing(full);
      setForm(toForm(full));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingEdit(false);
    }
  };
  const openCreate = () => { setCreating(true); setEditing(null); setForm(emptyServiceForm()); setError(null); };
  const closeEdit = () => { setEditing(null); setCreating(false); setForm(null); };

  const handleSave = async () => {
    if (!form) return;
    if (!creating && !editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: { en: form.titleEn, vi: form.titleVi },
        description: { en: form.descEn, vi: form.descVi },
        thumbnailImage: form.thumbnailImage,
        tag: form.tag,
        faqs: form.faqs.map((f) => ({
          question: { en: f.questionEn, vi: f.questionVi },
          answer: { en: f.answerEn, vi: f.answerVi },
        })),
      };
      if (creating) {
        await apiPost(`/api/services`, payload);
      } else {
        await apiPut(`/api/services/${editing!.id}`, payload);
      }
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/api/services/${confirmDelete.id}`);
      onRefetch();
      setConfirmDelete(null);
      closeEdit();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const set = (k: keyof ServiceForm, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const setFaq = (i: number, k: keyof FaqForm, v: string) =>
    setForm((f) => {
      if (!f) return f;
      const faqs = f.faqs.map((item, idx) => (idx === i ? { ...item, [k]: v } : item));
      return { ...f, faqs };
    });

  const addFaq = () =>
    setForm((f) =>
      f
        ? {
            ...f,
            faqs: [...f.faqs, { questionEn: "", questionVi: "", answerEn: "", answerVi: "" }],
          }
        : f,
    );

  const removeFaq = (i: number) =>
    setForm((f) => (f ? { ...f, faqs: f.faqs.filter((_, idx) => idx !== i) } : f));

  if (loading) return <TableSkeleton cols={6} rows={4} />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Services</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-black transition-all hover:opacity-80"
        >
          <PlusIcon size={12} weight="bold" />
          Add service
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead className="border-b border-white/8 bg-white/3">
            <tr>
              {["Service", "Tag", "Description", "FAQs", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => {
              const rawItem = (raw ?? []).find((r) => r.id === s.id);
              return (
                <tr key={s.id} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.thumbnailImage && (
                        <img
                          src={s.thumbnailImage}
                          alt={s.title}
                          className="h-10 w-16 shrink-0 rounded object-cover opacity-80"
                        />
                      )}
                      <p className="truncate text-xs font-medium text-white">{s.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                      {rawItem?.tag ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    <p className="line-clamp-2 max-w-xs">{s.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{rawItem?.faqs.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s.id)}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <PencilSimpleIcon size={11} />
                        Edit
                      </button>
                      <button
                        onClick={() => { const r = (raw ?? []).find((x) => x.id === s.id); if (r) { setConfirmDelete(r); setDeleteError(null); } }}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-red-500/50 hover:text-red-400"
                        title="Delete service"
                      >
                        <TrashIcon size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditModal
        title={creating ? "Add Service" : `Edit — ${editing?.title.en ?? "…"}`}
        isOpen={!!editing || loadingEdit || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        onDelete={editing ? () => { setConfirmDelete(editing); setDeleteError(null); closeEdit(); } : undefined}
        deleting={deleting}
      >
        {form && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_2fr]">
              {/* ── Left: text fields ─────────────────── */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Title (EN)</label>
                    <input
                      className={inp}
                      value={form.titleEn}
                      onChange={(e) => set("titleEn", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Title (VI)</label>
                    <input
                      className={inp}
                      value={form.titleVi}
                      onChange={(e) => set("titleVi", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Description (EN)</label>
                  <AutoTextarea
                    className={inp}
                    value={form.descEn}
                    onChange={(e) => set("descEn", e.target.value)}
                  />
                </div>
                <div>
                  <label className={lbl}>Description (VI)</label>
                  <AutoTextarea
                    className={inp}
                    value={form.descVi}
                    onChange={(e) => set("descVi", e.target.value)}
                  />
                </div>
                <div>
                  <label className={lbl}>Tag (slug)</label>
                  <input
                    className={inp}
                    value={form.tag}
                    onChange={(e) => set("tag", e.target.value)}
                  />
                </div>
                {/* Linked Features read-only */}
                {editing && (editing.projects?.length ?? 0) > 0 && (
                  <div>
                    <label className={lbl}>Linked Projects ({editing.projects.length})</label>
                    <div className="flex flex-col gap-1.5">
                      {editing.projects.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/3 p-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-white/80">{f.title}</p>
                            <p className="text-[10px] text-white/35">{f.subtitle}</p>
                          </div>
                          <span className="ml-auto shrink-0 rounded border border-white/8 px-1.5 py-0.5 text-[10px] text-white/30">
                            {f.layout}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: image + FAQs ───────────────── */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Image</label>
                  <ImageUpload value={form.thumbnailImage} onChange={(path) => set("thumbnailImage", path)} />
                </div>

                {/* FAQs */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={lbl + " mb-0"}>FAQs ({form.faqs.length})</label>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="hover:border-primary/40 hover:text-primary flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/50 transition-colors"
                    >
                      <PlusIcon size={10} />
                      Add FAQ
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {form.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="relative rounded-lg border border-white/8 bg-white/3 p-3"
                      >
                        <button
                          type="button"
                          onClick={() => removeFaq(i)}
                          className="absolute top-2 right-2 text-white/25 transition-colors hover:text-red-400"
                        >
                          <XIcon size={13} />
                        </button>
                        <p className="mb-2 text-[10px] font-medium tracking-wider text-white/30 uppercase">
                          FAQ {i + 1}
                        </p>
                        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <label className={lbl}>Question (EN)</label>
                            <input
                              className={inp}
                              value={faq.questionEn}
                              onChange={(e) => setFaq(i, "questionEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Question (VI)</label>
                            <input
                              className={inp}
                              value={faq.questionVi}
                              onChange={(e) => setFaq(i, "questionVi", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <label className={lbl}>Answer (EN)</label>
                            <AutoTextarea
                              className={inp}
                              value={faq.answerEn}
                              onChange={(e) => setFaq(i, "answerEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Answer (VI)</label>
                            <AutoTextarea
                              className={inp}
                              value={faq.answerVi}
                              onChange={(e) => setFaq(i, "answerVi", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.faqs.length === 0 && (
                      <p className="rounded-lg border border-dashed border-white/8 py-4 text-center text-xs text-white/20">
                        No FAQs yet — click Add FAQ
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl">
            <h3 className="mb-2 font-semibold text-white">Delete service?</h3>
            <p className="mb-5 text-sm text-white/50">
              “<span className="text-white/80">{confirmDelete.title.en}</span>” will be permanently deleted.
            </p>
            {deleteError && <p className="mb-3 text-xs text-red-400">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
