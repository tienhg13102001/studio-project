import { useState } from "react";
import {
  PhoneIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  ClockIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  YoutubeLogo,
  TiktokLogoIcon,
  PaperPlaneTiltIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import Seo from "#components/Seo";
import { useContact } from "#hooks/useContact";
import { useServices } from "#hooks/useServices";
import { useLanguage } from "#i18n";
import { apiPost } from "#lib/api";
import { localized } from "#lib/localized";
import PageHero from "#components/organisms/PageHero";
import Reveal from "#components/Reveal";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { Textarea } from "#components/ui/textarea";
import LogoZalo from "../assets/icons/LogoZalo";

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", service: "", message: "" };

const ContactPage: React.FC = () => {
  const { lang } = useLanguage();
  const { data: contact, loading, error } = useContact();
  const { data: services } = useServices(lang);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiPost("/api/contact/inquiry", form);
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{error ?? "Contact not found"}</p>
      </div>
    );
  }

  const socialItems: { key: keyof typeof contact.socials; icon: React.ReactNode; label: string }[] =
    [
      { key: "instagram", icon: <InstagramLogoIcon size={16} />, label: "Instagram" },
      { key: "facebook", icon: <FacebookLogoIcon size={16} />, label: "Facebook" },
      { key: "youtube", icon: <YoutubeLogo size={16} />, label: "YouTube" },
      { key: "tiktok", icon: <TiktokLogoIcon size={16} />, label: "TikTok" },
      { key: "zalo", icon: <LogoZalo className="h-4 w-4" />, label: "Zalo" },
    ];

  // const inputClass =
  //   "w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="min-h-screen">
      <Seo
        title="Liên hệ"
        description="Liên hệ BeeZ Production để bắt đầu dự án video tiếp theo của bạn — TVC, phim quảng cáo, brand film. Đội ngũ tại Hà Nội luôn sẵn sàng tư vấn."
        path="/contact"
      />
      <PageHero title={localized(contact.heading, lang)} subtitle={localized(contact.subheading, lang)} />

      <div className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Left: Contact info ─────────────────────────── */}
          <Reveal direction="right">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-foreground text-xl font-bold">
                {lang === "vi" ? "Liên Hệ" : "Contact"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {lang === "vi"
                  ? "Dù bạn có câu hỏi về dịch vụ, giá cả hay bất cứ điều gì, đội ngũ của chúng tôi sẵn sàng trả lời."
                  : "Whether you have questions about services, pricing, or anything else, our team is ready to answer."}
              </p>
            </div>

            {/* Info items */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <EnvelopeSimpleIcon size={18} weight="duotone" />,
                  label: "Email",
                  value: contact.email,
                  href: `mailto:${contact.email}`,
                },
                {
                  icon: <PhoneIcon size={18} weight="duotone" />,
                  label: lang === "vi" ? "Điện Thoại" : "Phone",
                  value: contact.phone,
                  href: `tel:${contact.phone.replace(/\s/g, "")}`,
                },
                {
                  icon: <MapPinIcon size={18} weight="duotone" />,
                  label: lang === "vi" ? "Địa Điểm" : "Location",
                  value: localized(contact.address, lang),
                  href: undefined,
                },
              ].map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="bg-muted text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    {icon}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="text-foreground hover:text-primary text-sm font-medium transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-foreground text-sm font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Working hours */}
            {contact.workingHours.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ClockIcon size={15} className="text-muted-foreground" />
                  <p className="text-foreground text-sm font-semibold">
                    {lang === "vi" ? "Giờ Làm Việc" : "Working Hours"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {contact.workingHours.map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{localized(row.label, lang)}</span>
                      <span className="text-foreground font-medium">{localized(row.hours, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {Object.values(contact.socials).some(Boolean) && (
              <div>
                <p className="text-foreground mb-2 text-sm font-semibold">
                  {lang === "vi" ? "Kết Nối Với Chúng Tôi" : "Connect With Us"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialItems.map(
                    ({ key, icon, label }) =>
                      contact.socials[key] && (
                        <a
                          key={key}
                          href={contact.socials[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-border text-muted-foreground hover:text-foreground hover:border-primary flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                        >
                          {icon}
                          {label}
                        </a>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>
          </Reveal>

          {/* ── Right: Form ────────────────────────────────── */}
          <Reveal direction="left" delay={120}>
          <div className="border-border bg-background/40 rounded-2xl border p-6 backdrop-blur-sm">
            <h2 className="text-foreground mb-5 text-lg font-bold">
              {lang === "vi" ? "Gửi Tin Nhắn" : "Send a Message"}
            </h2>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
                  <PaperPlaneTiltIcon size={28} weight="duotone" />
                </div>
                <p className="text-foreground font-semibold">
                  {lang === "vi" ? "Đã gửi thành công!" : "Message sent!"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {lang === "vi"
                    ? "Chúng tôi sẽ phản hồi sớm nhất có thể."
                    : "We'll get back to you as soon as possible."}
                </p>
                <Button
                  variant="link"
                  onClick={() => setSent(false)}
                  className="text-primary mt-2 h-auto p-0 text-sm underline underline-offset-2"
                >
                  {lang === "vi" ? "Gửi tin nhắn khác" : "Send another message"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div>
                  <Label className="text-foreground mb-1 text-xs">
                    {lang === "vi" ? "Họ và Tên" : "Full Name"}{" "}
                    <span className="text-primary">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder={lang === "vi" ? "Tên của bạn" : "Your name"}
                    value={form.name}
                    onChange={set("name")}
                    className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-1 text-xs">
                    Email <span className="text-primary">*</span>
                  </Label>
                  <Input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={set("email")}
                    className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-1 text-xs">
                    {lang === "vi" ? "Điện Thoại" : "Phone"}
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+84 xxx xxx xxx"
                    value={form.phone}
                    onChange={set("phone")}
                    className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-1 text-xs">
                    {lang === "vi" ? "Dịch Vụ Quan Tâm" : "Service of Interest"}
                  </Label>
                  <Select
                    value={form.service}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, service: v }))}
                  >
                    <SelectTrigger className="border-border bg-background/60 text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:outline-none">
                      <SelectValue
                        placeholder={lang === "vi" ? "Chọn dịch vụ" : "Select a service"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(services ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground mb-1 text-xs">
                    {lang === "vi" ? "Tin Nhắn" : "Message"} <span className="text-primary">*</span>
                  </Label>
                  <Textarea
                    required
                    rows={4}
                    placeholder={
                      lang === "vi"
                        ? "Chia sẻ về dự án của bạn..."
                        : "Tell us about your project..."
                    }
                    value={form.message}
                    onChange={set("message")}
                    className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary min-h-25"
                  />
                </div>

                {submitError && <p className="text-destructive text-xs">{submitError}</p>}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-auto items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <SpinnerIcon size={16} className="animate-spin" />
                  ) : (
                    <PaperPlaneTiltIcon size={16} weight="fill" />
                  )}
                  {lang === "vi" ? "Gửi Tin Nhắn" : "Send Message"}
                </Button>
              </form>
            )}
          </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
