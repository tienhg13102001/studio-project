import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, StarIcon } from "@phosphor-icons/react";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import { useLanguage } from "#i18n";
import { Button } from "#components/ui/button";
import PageHero from "#components/organisms/PageHero";
import type { ApiService } from "#lib/apiTypes";

const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<ApiService>(`/api/services/${id}`)
      .then(setService)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? "Service not found"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} className="mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const title = service.title[lang];
  const description = service.description[lang];
  const imageUrl = resolveAssetUrl(service.thumbnailImage);
  const prominentProjects = service.projects.filter((f) => f.prominent);
  const regularProjects   = service.projects.filter((f) => !f.prominent);

  return (
    <div className="min-h-screen">
      <PageHero
        variant="image"
        title={title}
        image={imageUrl}
      />

      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>

        {/* FAQ */}
        {service.faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-foreground mb-8 text-2xl font-bold">
              {lang === "vi" ? "Câu Hỏi Thường Gặp" : "Frequently Asked Questions"}
            </h2>
            <div className="flex flex-col gap-3">
              {service.faqs.map((faq, i) => (
                <div key={i} className="border-border overflow-hidden rounded-2xl border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="text-foreground hover:bg-muted flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition-colors"
                  >
                    <span>▶ {faq.question[lang]}</span>
                    <span
                      className={`text-muted-foreground ml-4 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="border-border text-muted-foreground border-t px-6 py-4 text-sm leading-relaxed">
                      {faq.answer[lang]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {service.projects.length > 0 && (
          <section className="mt-16">
            <h2 className="text-foreground mb-8 text-2xl font-bold">
              {lang === "vi" ? "Dự Án Nổi Bật" : "Featured Work"}
            </h2>

            {/* Prominent projects — larger cards */}
            {prominentProjects.length > 0 && (
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                {prominentProjects.map((f) => (
                  <div
                    key={f.id}
                    className="group border-primary/30 relative overflow-hidden rounded-2xl border"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={resolveAssetUrl(f.thumbnailImage)}
                        alt={f.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="bg-primary text-primary-foreground absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                      <StarIcon size={11} weight="fill" />
                      {lang === "vi" ? "Nổi bật" : "Prominent"}
                    </div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="font-semibold text-white">{f.title}</p>
                      <p className="text-xs text-white/70">{f.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular projects — smaller grid */}
            {regularProjects.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {regularProjects.map((f) => (
                  <div
                    key={f.id}
                    className="group border-border relative overflow-hidden rounded-xl border"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={resolveAssetUrl(f.thumbnailImage)}
                        alt={f.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3">
                      <p className="text-sm font-medium text-white">{f.title}</p>
                      <p className="text-xs text-white/60">{f.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ServicePage;
