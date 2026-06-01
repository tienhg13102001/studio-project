import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import { Textarea } from "#components/ui/textarea";
import VideoUpload from "#components/ui/portal/VideoUpload";
import { useLanding } from "#hooks/useLanding";
import { apiPut } from "#lib/api";
import type { ApiLanding } from "#lib/apiTypes";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Form = {
  heroLine1: { en: string; vi: string };
  heroLine2: { en: string; vi: string };
  subheading: { en: string; vi: string };
  videoBackground: string;
  phone: string;
  email: string;
  address: { en: string; vi: string };
  socials: {
    zalo: string;
    facebook: string;
    instagram: string;
  };
};

const EMPTY_FORM: Form = {
  heroLine1: { en: "", vi: "" },
  heroLine2: { en: "", vi: "" },
  subheading: { en: "", vi: "" },
  videoBackground: "",
  phone: "",
  email: "",
  address: { en: "", vi: "" },
  socials: { zalo: "", facebook: "", instagram: "" },
};

function toForm(raw: ApiLanding): Form {
  return {
    heroLine1: { en: raw.heroLine1.en, vi: raw.heroLine1.vi },
    heroLine2: { en: raw.heroLine2.en, vi: raw.heroLine2.vi },
    subheading: { en: raw.subheading.en, vi: raw.subheading.vi },
    videoBackground: raw.videoBackground,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    address: { en: raw.address?.en ?? "", vi: raw.address?.vi ?? "" },
    socials: {
      zalo: raw.socials?.zalo ?? "",
      facebook: raw.socials?.facebook ?? "",
      instagram: raw.socials?.instagram ?? "",
    },
  };
}

const LandingTab = () => {
  const { raw, loading, refetch } = useLanding("en");
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
      await apiPut("/api/landing", form);
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
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg border border-foreground/8" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero text */}
      <Section title="Hero text" description="Tiêu đề lớn và mô tả hiển thị trên hero.">
        <BilingualField
          label="Hero line 1"
          value={form.heroLine1}
          onChange={(v) => setForm((f) => ({ ...f, heroLine1: v }))}
        />
        <BilingualField
          label="Hero line 2"
          value={form.heroLine2}
          onChange={(v) => setForm((f) => ({ ...f, heroLine2: v }))}
        />
        <BilingualField
          label="Subheading"
          value={form.subheading}
          onChange={(v) => setForm((f) => ({ ...f, subheading: v }))}
          multiline
        />
      </Section>

      {/* Video background */}
      <Section
        title="Video background"
        description="Video chạy nền hero. Có thể upload trực tiếp hoặc dán URL/path."
      >
        <div>
          <Label>Video</Label>
          <VideoUpload
            value={form.videoBackground}
            onChange={(path) => setForm((f) => ({ ...f, videoBackground: path }))}
          />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Liên hệ" description="Phone, email và địa chỉ hiển thị trên hero và footer.">
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+84 xxx xxx xxx"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="hello@beezvn.com"
          />
        </div>
        <BilingualField
          label="Address"
          value={form.address}
          onChange={(v) => setForm((f) => ({ ...f, address: v }))}
          multiline
        />
      </Section>

      {/* Socials */}
      <Section title="Mạng xã hội" description="URL trang Zalo / Facebook / Instagram. Để trống nếu không dùng.">
        <div>
          <Label>Zalo URL</Label>
          <Input
            value={form.socials.zalo}
            onChange={(e) =>
              setForm((f) => ({ ...f, socials: { ...f.socials, zalo: e.target.value } }))
            }
            placeholder="https://zalo.me/..."
          />
        </div>
        <div>
          <Label>Facebook URL</Label>
          <Input
            value={form.socials.facebook}
            onChange={(e) =>
              setForm((f) => ({ ...f, socials: { ...f.socials, facebook: e.target.value } }))
            }
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <Label>Instagram URL</Label>
          <Input
            value={form.socials.instagram}
            onChange={(e) =>
              setForm((f) => ({ ...f, socials: { ...f.socials, instagram: e.target.value } }))
            }
            placeholder="https://instagram.com/..."
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
  const InputComp = multiline ? Textarea : Input;
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

export default LandingTab;
