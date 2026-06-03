import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import { Textarea } from "#components/ui/textarea";
import VideoUpload from "#components/ui/portal/VideoUpload";
import { useLanding } from "#hooks/useLanding";
import { apiPost, apiPut } from "#lib/api";
import type { ApiLanding } from "#lib/apiTypes";
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  FloppyDiskIcon,
  QrCodeIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type SocialPlatform = "zalo" | "facebook" | "instagram";

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
  socialQrs: {
    zalo: string;
    facebook: string;
    instagram: string;
  };
  /** The URL each stored QR was generated for — used to gate the "Tạo QR" button. */
  qrUrls: {
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
  socialQrs: { zalo: "", facebook: "", instagram: "" },
  qrUrls: { zalo: "", facebook: "", instagram: "" },
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
    socialQrs: {
      zalo: raw.socialQrs?.zalo ?? "",
      facebook: raw.socialQrs?.facebook ?? "",
      instagram: raw.socialQrs?.instagram ?? "",
    },
    // A stored QR was generated for the currently-saved URL → seed qrUrls so the
    // "Tạo QR" button stays disabled until the URL is edited.
    qrUrls: {
      zalo: raw.socialQrs?.zalo ? (raw.socials?.zalo ?? "") : "",
      facebook: raw.socialQrs?.facebook ? (raw.socials?.facebook ?? "") : "",
      instagram: raw.socialQrs?.instagram ? (raw.socials?.instagram ?? "") : "",
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

  // Generate a QR for one social URL — the backend persists both URL + QR to the
  // DB and returns the PNG data-URL, which we stash in the form for preview/download.
  const generateQr = async (platform: SocialPlatform) => {
    const url = form.socials[platform].trim();
    const res = await apiPost<{ platform: string; url: string; qr: string }>(
      "/api/landing/social-qr",
      { platform, url },
    );
    setForm((f) => ({
      ...f,
      socialQrs: { ...f.socialQrs, [platform]: res.qr },
      qrUrls: { ...f.qrUrls, [platform]: res.url },
    }));
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
      <Section
        title="Mạng xã hội"
        description="URL trang Zalo / Facebook / Instagram. Bấm “Tạo QR” để sinh và lưu mã QR vào DB, “Tải QR” để tải ảnh PNG."
      >
        {(
          [
            { platform: "zalo", label: "Zalo URL", placeholder: "https://zalo.me/..." },
            { platform: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
            { platform: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
          ] as const
        ).map(({ platform, label, placeholder }) => (
          <SocialField
            key={platform}
            label={label}
            placeholder={placeholder}
            url={form.socials[platform]}
            qr={form.socialQrs[platform]}
            generatedUrl={form.qrUrls[platform]}
            onUrlChange={(v) =>
              setForm((f) => ({ ...f, socials: { ...f.socials, [platform]: v } }))
            }
            onGenerate={() => generateQr(platform)}
          />
        ))}
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

type SocialFieldProps = {
  label: string;
  placeholder: string;
  url: string;
  qr: string;
  /** URL the existing QR was generated for. */
  generatedUrl: string;
  onUrlChange: (v: string) => void;
  onGenerate: () => Promise<void>;
};

const SocialField = ({
  label,
  placeholder,
  url,
  qr,
  generatedUrl,
  onUrlChange,
  onGenerate,
}: SocialFieldProps) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const trimmed = url.trim();
  // Allow generating only for a non-empty URL that differs from the one the
  // current QR was made for (first time, or after the URL changed).
  const upToDate = !!qr && trimmed === generatedUrl.trim();
  const canGenerate = trimmed !== "" && !upToDate;

  const handleGenerate = async () => {
    if (!url.trim()) {
      setErr("Nhập URL trước khi tạo QR.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await onGenerate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `qr-${label.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            disabled={busy || !canGenerate}
            title={upToDate ? "QR đã được tạo cho URL này" : undefined}
            className="gap-1.5"
          >
            {busy ? (
              <SpinnerIcon size={14} className="animate-spin" />
            ) : (
              <QrCodeIcon size={14} />
            )}
            {upToDate ? "Đã tạo" : "Tạo QR"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!qr}
            className="gap-1.5"
          >
            <DownloadSimpleIcon size={14} />
            Tải QR
          </Button>
        </div>
      </div>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
      {qr && (
        <img
          src={qr}
          alt={`QR ${label}`}
          className="mt-3 h-28 w-28 rounded-lg border border-foreground/10 bg-white p-1.5"
        />
      )}
    </div>
  );
};

export default LandingTab;
