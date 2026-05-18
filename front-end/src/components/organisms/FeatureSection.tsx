import SectionHeader from "#components/molecules/SectionHeader";
import PortfolioCard from "#components/molecules/PortfolioCard";
import MarqueeRow from "#components/molecules/MarqueeRow";
import { useTranslation } from "#i18n";
import { bottomCards, topCards } from "#mocks/featuredContent";
import type { FC } from "react";

type Props = {};

const FeatureSection: FC<Props> = () => {
  const t = useTranslation();

  return (
    <section className="bg-foreground flex min-h-dvh flex-col justify-center overflow-hidden py-16 font-sans">
      <div className="mx-auto mb-10 w-full max-w-7xl px-6">
        <SectionHeader title={t.featured.sectionTitle} subtitle="" />
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <MarqueeRow direction="left">
          {topCards.map((card) => (
            <PortfolioCard key={card.id} card={card} variant="vertical" />
          ))}
        </MarqueeRow>

        <MarqueeRow direction="right">
          {bottomCards.map((card) => (
            <PortfolioCard key={card.id} card={card} variant="horizontal" />
          ))}
        </MarqueeRow>
      </div>
    </section>
  );
};

export default FeatureSection;
