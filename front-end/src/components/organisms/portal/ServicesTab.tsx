import { useState } from "react";
import { PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { apiFetch, apiPost, apiPut, apiDelete, invalidateApiCache } from "#lib/api";
import { localized } from "#lib/localized";
import type { ApiService } from "#lib/apiTypes";
import type { ServiceDisplay } from "#hooks/useServices";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import AutoTextarea from "#components/ui/portal/AutoTextarea";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#components/ui/alert-dialog";
import { Badge } from "#components/ui/badge";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import IconPicker from "#components/ui/portal/IconPicker";
import { DEFAULT_SERVICE_ICON } from "#lib/serviceIcons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";

// ─── Edit form ───────────────────────────────────────────────────────────────

type FaqForm = {
  questionEn: string;
  questionVi: string;
  answerEn: string;
  answerVi: string;
};

type HighlightForm = {
  icon: string;
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
};

type StatForm = {
  value: string;
  labelEn: string;
  labelVi: string;
};

type ServiceForm = {
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  thumbnailImage: string;
  tag: string;
  faqs: FaqForm[];
  highlights: HighlightForm[];
  stats: StatForm[];
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
    highlights: (s.highlights ?? []).map((h) => ({
      icon: h.icon ?? "",
      titleEn: h.title.en,
      titleVi: h.title.vi,
      descEn: h.desc.en,
      descVi: h.desc.vi,
    })),
    stats: (s.stats ?? []).map((st) => ({
      value: st.value,
      labelEn: st.label.en,
      labelVi: st.label.vi,
    })),
  };
}

function emptyServiceForm(): ServiceForm {
  return {
    titleEn: "",
    titleVi: "",
    descEn: "",
    descVi: "",
    thumbnailImage: "",
    tag: "",
    faqs: [],
    highlights: [],
    stats: [],
  };
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
      // Always pull the latest from the server — the detail response is cached
      // in-memory, so without this a re-open after a save would show stale data.
      invalidateApiCache(`/api/services/${displayId}`);
      const full = await apiFetch<ApiService>(`/api/services/${displayId}`);
      setEditing(full);
      setForm(toForm(full));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingEdit(false);
    }
  };
  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyServiceForm());
    setError(null);
  };
  const closeEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm(null);
  };

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
        highlights: form.highlights.map((h) => ({
          icon: h.icon,
          title: { en: h.titleEn, vi: h.titleVi },
          desc: { en: h.descEn, vi: h.descVi },
        })),
        stats: form.stats.map((s) => ({
          value: s.value,
          label: { en: s.labelEn, vi: s.labelVi },
        })),
      };
      if (creating) {
        await apiPost(`/api/services`, payload);
      } else {
        await apiPut(`/api/services/${editing!.id}`, payload);
        // Drop the cached detail so the public page / a re-open reads fresh data.
        invalidateApiCache(`/api/services/${editing!.id}`);
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
      invalidateApiCache(`/api/services/${confirmDelete.id}`);
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

  const setHighlight = (i: number, k: keyof HighlightForm, v: string) =>
    setForm((f) => {
      if (!f) return f;
      const highlights = f.highlights.map((item, idx) => (idx === i ? { ...item, [k]: v } : item));
      return { ...f, highlights };
    });

  const addHighlight = () =>
    setForm((f) =>
      f
        ? {
            ...f,
            highlights: [
              ...f.highlights,
              { icon: DEFAULT_SERVICE_ICON, titleEn: "", titleVi: "", descEn: "", descVi: "" },
            ],
          }
        : f,
    );

  const removeHighlight = (i: number) =>
    setForm((f) => (f ? { ...f, highlights: f.highlights.filter((_, idx) => idx !== i) } : f));

  const setStat = (i: number, k: keyof StatForm, v: string) =>
    setForm((f) => {
      if (!f) return f;
      const stats = f.stats.map((item, idx) => (idx === i ? { ...item, [k]: v } : item));
      return { ...f, stats };
    });

  const addStat = () =>
    setForm((f) =>
      f ? { ...f, stats: [...f.stats, { value: "", labelEn: "", labelVi: "" }] } : f,
    );

  const removeStat = (i: number) =>
    setForm((f) => (f ? { ...f, stats: f.stats.filter((_, idx) => idx !== i) } : f));

  if (loading) return <TableSkeleton cols={5} rows={4} />;

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">Services</h2>
        <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" />
          Add service
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="border-foreground/8 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Service", "Tag", "Description", "FAQs", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((s) => {
              const rawItem = (raw ?? []).find((r) => r.id === s.id);
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {s.thumbnailImage && (
                        <img
                          src={s.thumbnailImage}
                          alt={s.title}
                          className="h-10 w-16 shrink-0 rounded object-cover opacity-80"
                        />
                      )}
                      <p className="text-foreground truncate text-xs font-medium">{s.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-foreground/10 bg-foreground/5 text-foreground/60"
                    >
                      {rawItem?.tag ?? ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground/50 text-xs">
                    <p className="line-clamp-2 max-w-xs">{s.description}</p>
                  </TableCell>
                  <TableCell className="text-foreground/60 text-xs">
                    {rawItem?.faqs.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openEdit(s.id)}
                        className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                      >
                        <PencilSimpleIcon size={11} />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          const r = (raw ?? []).find((x) => x.id === s.id);
                          if (r) {
                            setConfirmDelete(r);
                            setDeleteError(null);
                          }
                        }}
                        className="border-foreground/10 text-foreground/50 border hover:border-red-500/50 hover:text-red-400"
                        title="Delete service"
                      >
                        <TrashIcon size={11} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Edit Modal ── */}
      <EditModal
        title={creating ? "Add Service" : `Edit — ${editing?.title.en ?? "…"}`}
        isOpen={!!editing || loadingEdit || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        onDelete={
          editing
            ? () => {
                setConfirmDelete(editing);
                setDeleteError(null);
                closeEdit();
              }
            : undefined
        }
        deleting={deleting}
      >
        {form && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_2fr]">
              {/* ── Left: text fields ───────────────── */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title (EN)</Label>
                    <Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
                  </div>
                  <div>
                    <Label>Title (VI)</Label>
                    <Input value={form.titleVi} onChange={(e) => set("titleVi", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Description (EN)</Label>
                  <AutoTextarea
                    value={form.descEn}
                    onChange={(e) => set("descEn", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (VI)</Label>
                  <AutoTextarea
                    value={form.descVi}
                    onChange={(e) => set("descVi", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tag (slug)</Label>
                  <Input value={form.tag} onChange={(e) => set("tag", e.target.value)} />
                </div>
                {/* Feature highlights */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="mb-0">Feature highlights ({form.highlights.length})</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={addHighlight}
                      className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                    >
                      <PlusIcon size={10} />
                      Add highlight
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {form.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="border-foreground/8 bg-foreground/3 relative rounded-lg border p-3"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeHighlight(i)}
                          className="text-foreground/25 absolute top-2 right-2 hover:text-red-400"
                        >
                          <XIcon size={13} />
                        </Button>
                        <p className="text-foreground/30 mb-2 text-[10px] font-medium tracking-wider uppercase">
                          Highlight {i + 1}
                        </p>
                        <div className="mb-2">
                          <Label>Icon</Label>
                          <IconPicker
                            value={h.icon}
                            onChange={(v) => setHighlight(i, "icon", v)}
                          />
                        </div>
                        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Title (EN)</Label>
                            <Input
                              value={h.titleEn}
                              onChange={(e) => setHighlight(i, "titleEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Title (VI)</Label>
                            <Input
                              value={h.titleVi}
                              onChange={(e) => setHighlight(i, "titleVi", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Description (EN)</Label>
                            <AutoTextarea
                              value={h.descEn}
                              onChange={(e) => setHighlight(i, "descEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Description (VI)</Label>
                            <AutoTextarea
                              value={h.descVi}
                              onChange={(e) => setHighlight(i, "descVi", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.highlights.length === 0 && (
                      <p className="border-foreground/8 text-foreground/20 rounded-lg border border-dashed py-4 text-center text-xs">
                        No highlights yet — click Add highlight
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="mb-0">Stats ({form.stats.length})</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={addStat}
                      className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                    >
                      <PlusIcon size={10} />
                      Add stat
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {form.stats.map((s, i) => (
                      <div
                        key={i}
                        className="border-foreground/8 bg-foreground/3 relative rounded-lg border p-3"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeStat(i)}
                          className="text-foreground/25 absolute top-2 right-2 hover:text-red-400"
                        >
                          <XIcon size={13} />
                        </Button>
                        <p className="text-foreground/30 mb-2 text-[10px] font-medium tracking-wider uppercase">
                          Stat {i + 1}
                        </p>
                        <div className="mb-2">
                          <Label>Value</Label>
                          <Input
                            value={s.value}
                            placeholder="1000+"
                            onChange={(e) => setStat(i, "value", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <Label>Label (EN)</Label>
                            <Input
                              value={s.labelEn}
                              onChange={(e) => setStat(i, "labelEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Label (VI)</Label>
                            <Input
                              value={s.labelVi}
                              onChange={(e) => setStat(i, "labelVi", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.stats.length === 0 && (
                      <p className="border-foreground/8 text-foreground/20 rounded-lg border border-dashed py-4 text-center text-xs sm:col-span-2">
                        No stats yet — click Add stat
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right: image + FAQs ─────────────── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Image</Label>
                  <ImageUpload
                    value={form.thumbnailImage}
                    onChange={(path) => set("thumbnailImage", path)}
                  />
                </div>

                {/* FAQs */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="mb-0">FAQs ({form.faqs.length})</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={addFaq}
                      className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                    >
                      <PlusIcon size={10} />
                      Add FAQ
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {form.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="border-foreground/8 bg-foreground/3 relative rounded-lg border p-3"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeFaq(i)}
                          className="text-foreground/25 absolute top-2 right-2 hover:text-red-400"
                        >
                          <XIcon size={13} />
                        </Button>
                        <p className="text-foreground/30 mb-2 text-[10px] font-medium tracking-wider uppercase">
                          FAQ {i + 1}
                        </p>
                        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Question (EN)</Label>
                            <Input
                              value={faq.questionEn}
                              onChange={(e) => setFaq(i, "questionEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Question (VI)</Label>
                            <Input
                              value={faq.questionVi}
                              onChange={(e) => setFaq(i, "questionVi", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Answer (EN)</Label>
                            <AutoTextarea
                              value={faq.answerEn}
                              onChange={(e) => setFaq(i, "answerEn", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Answer (VI)</Label>
                            <AutoTextarea
                              value={faq.answerVi}
                              onChange={(e) => setFaq(i, "answerVi", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.faqs.length === 0 && (
                      <p className="border-foreground/8 text-foreground/20 rounded-lg border border-dashed py-4 text-center text-xs">
                        No FAQs yet — click Add FAQ
                      </p>
                    )}
                  </div>
                </div>

                {/* Linked Projects */}
                {editing && (editing.projects?.length ?? 0) > 0 && (
                  <div>
                    <Label>Linked Projects ({editing.projects.length})</Label>
                    <div className="flex flex-col gap-1.5">
                      {editing.projects.map((f) => (
                        <div
                          key={f.id}
                          className="border-foreground/8 bg-foreground/3 flex items-center gap-2.5 rounded-lg border p-2"
                        >
                          <div className="min-w-0">
                            <p className="text-foreground/80 truncate text-xs font-medium">
                              {f.title}
                            </p>
                            <p className="text-foreground/35 text-[10px]">
                              {localized(f.subtitle, "vi")}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-auto shrink-0">
                            {f.layout}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {/* ── Confirm Delete Dialog ── */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              "<span className="text-foreground/80">{confirmDelete?.title.en}</span>" will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
