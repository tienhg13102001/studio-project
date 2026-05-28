import { useBrands } from "#hooks/useBrands";
import { useLanding } from "#hooks/useLanding";
import { useProjects } from "#hooks/useProjects";
import { useServices } from "#hooks/useServices";
import { useLanguage } from "#i18n";

/**
 * Aggregates loading state of all APIs needed by the landing page and
 * returns a 0-100 target % for the Preloader. Thanks to the apiFetch
 * cache (lib/api.ts), calling these hooks here does NOT cause double
 * fetches — they share promises with the sections that render later.
 */
export function useLandingProgress() {
  const { lang } = useLanguage();
  const { loading: landingLoading } = useLanding(lang);
  const { loading: servicesLoading } = useServices(lang);
  const { loading: projectsLoading } = useProjects();
  const { loading: brandsLoading } = useBrands();

  const flags = [landingLoading, servicesLoading, projectsLoading, brandsLoading];
  const total = flags.length;
  const done = flags.filter((l) => !l).length;
  const target = Math.round((done / total) * 100);

  return { target, allDone: done === total };
}
