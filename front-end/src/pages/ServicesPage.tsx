import Seo from "#components/Seo";
import PageHero from "#components/organisms/PageHero";
import ServiceCard from "#components/molecules/ServiceCard";
import { useServices } from "#hooks/useServices";
import { useLanguage, useTranslation } from "#i18n";

const ServicesPage = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { data: services, loading, error } = useServices(lang);

  return (
    <div className="min-h-screen">
      <Seo
        title={t.services.sectionTitle}
        description={t.services.sectionSubtitle}
        path="/service"
      />
      <PageHero title={t.services.sectionTitle} subtitle={t.services.sectionSubtitle} />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <p className="text-muted-foreground py-24 text-center">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ServicesPage;
