import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import AutoTextarea from "#components/ui/portal/AutoTextarea";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { useTeamContent } from "#hooks/useTeamContent";
import { apiPut, invalidateApiCache } from "#lib/api";
import type { ApiTeamContent } from "#lib/apiTypes";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Form = {
  aboutBadge:       { en: string; vi: string };
  aboutHeading:     { en: string; vi: string };
  aboutDescription: { en: string; vi: string };
  aboutImage:       string;
};

const EMPTY_FORM: Form = {
  aboutBadge:       { en: "", vi: "" },
  aboutHeading:     { en: "", vi: "" },
  aboutDescription: { en: "", vi: "" },
  aboutImage:       "",
};

function toForm(raw: ApiTeamContent): Form {
  return {
    aboutBadge:       { en: raw.aboutBadge.en,       vi: raw.aboutBadge.vi },
    aboutHeading:     { en: raw.aboutHeading.en,     vi: raw.aboutHeading.vi },
    aboutDescription: { en: raw.aboutDescription.en, vi: raw.aboutDescription.vi },
    aboutImage:       raw.aboutImage,
  };
}

const TeamContentTab = () => {
  const { data, loading, refetch } = useTeamContent();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data) setForm(toForm(data));
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiPut("/api/team-content", form);
      invalidateApiCache("/api/team-content");
      refetch();
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg border border-foreground/8" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* About section text */}
      <Section title="About section" description="Badge, heading và mô tả hiển thị trong phần 'Who We Are' trên trang Team.">
        <BilingualField
          label="Badge"
          value={form.aboutBadge}
          onChange={(v) => setForm((f) => ({ ...f, aboutBadge: v }))}
        />
        <BilingualField
          label="Heading"
          value={form.aboutHeading}
          onChange={(v) => setForm((f) => ({ ...f, aboutHeading: v }))}
        />
        <BilingualField
          label="Description"
          value={form.aboutDescription}
          onChange={(v) => setForm((f) => ({ ...f, aboutDescription: v }))}
          multiline
        />
      </Section>

      {/* Featured image */}
      <Section title="Featured image" description="Ảnh hiển thị bên trái phần About. Để trống sẽ dùng ảnh mặc định /user1.webp.">
        <div>
          <Label>Image</Label>
          <ImageUpload
            value={form.aboutImage}
            onChange={(path) => setForm((f) => ({ ...f, aboutImage: path }))}
          />
        </div>
      </Section>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-8 flex items-center justify-end gap-3 border-t border-foreground/8 bg-background/95 px-8 py-4 backdrop-blur">
        {savedAt && !saving && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircleIcon size={14} weight="fill" />
            Đã lưu
          </span>
        )}
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <FloppyDiskIcon size={16} weight="fill" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const Section = ({ title, description, children }: SectionProps) => (
  <section className="flex flex-col gap-4 rounded-xl border border-foreground/8 bg-foreground/2 p-5">
    <header>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-foreground/40">{description}</p>}
    </header>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

type BilingualValue = { en: string; vi: string };
type BilingualFieldProps = {
  label: string;
  value: BilingualValue;
  onChange: (v: BilingualValue) => void;
  multiline?: boolean;
};

const BilingualField = ({ label, value, onChange, multiline }: BilingualFieldProps) => {
  const InputComp = multiline ? AutoTextarea : Input;
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-medium tracking-wider text-foreground/30 uppercase">
            English
          </p>
          <InputComp
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium tracking-wider text-foreground/30 uppercase">
            Tiếng Việt
          </p>
          <InputComp
            value={value.vi}
            onChange={(e) => onChange({ ...value, vi: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamContentTab;
