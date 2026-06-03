import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import ServiceCard from "#components/molecules/ServiceCard";
import { useServices } from "#hooks/useServices";
import { useLanguage, useTranslation } from "#i18n";
import type { FC } from "react";

type Props = {};

const ServiceSection: FC<Props> = () => {
  const { lang } = useLanguage();
  const t = useTranslation();
  const { data: services } = useServices(lang);

  return (
    <section id="services" className="min-h-screen px-4 py-24 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader title={t.services.sectionTitle} subtitle={t.services.sectionSubtitle} />
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services?.map((service, i) => (
            <Reveal key={service.id} delay={i * 80} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
