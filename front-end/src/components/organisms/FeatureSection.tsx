import { default as FeatureCard } from "#components/molecules/FeatureCard";
import MarqueeRow from "#components/molecules/MarqueeRow";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjects, type ProjectDisplay } from "#hooks/useProjects";
import { useTranslation } from "#i18n";
import { lazy, Suspense, type FC } from "react";
import { useSearchParams } from "react-router-dom";

const ProjectDetail = lazy(() => import("./ProjectDetail"));

const PROJECT_PARAM = "project";

type Props = {};

const FeatureSection: FC<Props> = () => {
  const t = useTranslation();
  const { verticalCards, horizontalCards } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();

  const top = verticalCards || [];
  const bottom = horizontalCards || [];

  const projectId = searchParams.get(PROJECT_PARAM);
  const selectedProject: ProjectDisplay | null = projectId
    ? [...top, ...bottom].find((p) => p.id === projectId) || null
    : null;

  const openProject = (card: ProjectDisplay) => {
    setSearchParams(
      (prev) => {
        prev.set(PROJECT_PARAM, card.id);
        return prev;
      },
      { replace: false },
    );
  };

  const closeProject = () => {
    setSearchParams(
      (prev) => {
        prev.delete(PROJECT_PARAM);
        return prev;
      },
      { replace: false },
    );
  };

  return (
    <>
      <section className="flex min-h-screen flex-col justify-center overflow-hidden py-16 font-sans">
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
                onClick={() => openProject(card)}
              />
            ))}
          </MarqueeRow>

          <MarqueeRow direction="right">
            {bottom.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                variant="horizontal"
                onClick={() => openProject(card)}
              />
            ))}
          </MarqueeRow>
        </div>
      </section>

      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectDetail project={selectedProject} onClose={closeProject} />
        </Suspense>
      )}
    </>
  );
};

export default FeatureSection;
