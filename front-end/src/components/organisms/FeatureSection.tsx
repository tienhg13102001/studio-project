import { default as FeatureCard } from "#components/molecules/FeatureCard";
import MarqueeRow from "#components/molecules/MarqueeRow";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjects } from "#hooks/useProjects";
import { useTranslation } from "#i18n";
import type { FC } from "react";

type Props = {};

const FeatureSection: FC<Props> = () => {
  const t = useTranslation();
  const { verticalCards, horizontalCards } = useProjects();

  // Fall back to mock while API loads
  const top = verticalCards || [];
  const bottom = horizontalCards || [];

  return (
    <section className="flex min-h-dvh flex-col justify-center overflow-hidden py-16 font-sans">
      <div className="mx-auto mb-10 w-full max-w-7xl px-6">
        <SectionHeader title={t.featured.sectionTitle} subtitle="" />
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <MarqueeRow direction="left">
          {top.map((card) => (
            <FeatureCard key={card.id} card={card} variant="vertical" />
          ))}
        </MarqueeRow>

        <MarqueeRow direction="right">
          {bottom.map((card) => (
            <FeatureCard key={card.id} card={card} variant="horizontal" />
          ))}
        </MarqueeRow>
      </div>
    </section>
  );
};

export default FeatureSection;
