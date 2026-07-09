import { Button } from "#components/ui/button";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { useSettings } from "#hooks/useSettings";
import { apiPut } from "#lib/api";
import type { ApiSettings } from "#lib/apiTypes";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Form = {
  backgroundImage: string;
};

const EMPTY_FORM: Form = {
  backgroundImage: "",
};

function toForm(raw: ApiSettings): Form {
  return {
    backgroundImage: raw.backgroundImage ?? "",
  };
}

const SharedTab = () => {
  const { raw, loading, refetch } = useSettings();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (raw) setForm(toForm(raw));
  }, [raw]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiPut("/api/settings", { backgroundImage: form.backgroundImage });
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
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg border border-foreground/8" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Ảnh nền chung"
        description="Ảnh nền hiển thị xuyên suốt các trang. Để trống sẽ dùng ảnh mặc định."
      >
        <div>
          <Label>Ảnh nền</Label>
          <ImageUpload
            value={form.backgroundImage}
            onChange={(path) => setForm((f) => ({ ...f, backgroundImage: path }))}
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

export default SharedTab;
