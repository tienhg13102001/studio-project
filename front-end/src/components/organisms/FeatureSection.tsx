import { useState } from "react";
import { default as FeatureCard } from "#components/molecules/FeatureCard";
import MarqueeRow from "#components/molecules/MarqueeRow";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjects, type ProjectDisplay } from "#hooks/useProjects";
import { useTranslation } from "#i18n";
import type { FC } from "react";
import ProjectDetail from "./ProjectDetail";

type Props = {};

const FeatureSection: FC<Props> = () => {
  const t = useTranslation();
  const { verticalCards, horizontalCards } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ProjectDisplay | null>(null);

  // Fall back to mock while API loads
  const top = verticalCards || [];
  const bottom = horizontalCards || [];

  return (
    <>
      <section className="flex min-h-dvh flex-col justify-center overflow-hidden py-16 font-sans">
        <div className="mx-auto mb-10 w-full max-w-7xl px-6">
          <SectionHeader title={t.featured.sectionTitle} subtitle="" />
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <MarqueeRow direction="left">
            {top.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                variant="vertical"
                onClick={() => setSelectedProject(card)}
              />
            ))}
          </MarqueeRow>

          <MarqueeRow direction="right">
            {bottom.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                variant="horizontal"
                onClick={() => setSelectedProject(card)}
              />
            ))}
          </MarqueeRow>
        </div>
      </section>

      {selectedProject && (
        <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
};

export default FeatureSection;
