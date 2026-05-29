import OverviewTab from "#components/organisms/portal/OverviewTab";
import { useBrands } from "#hooks/useBrands";
import { useProjects } from "#hooks/useProjects";
import { useServices } from "#hooks/useServices";
import { useTeam } from "#hooks/useTeam";
import { useNavigate } from "react-router-dom";

const TAB_TO_PATH: Record<string, string> = {
  overview: "/portal/dashboard",
  team: "/portal/team",
  brands: "/portal/brands",
  services: "/portal/services",
  projects: "/portal/projects",
  settings: "/portal/settings",
};

const OverviewPage = () => {
  const navigate = useNavigate();
  const { data: teamData, loading: teamLoading } = useTeam();
  const { data: brandsData, loading: brandsLoading } = useBrands();
  const { data: servicesData } = useServices("en");
  const { verticalCards, horizontalCards } = useProjects();
  const allProjects = [...(verticalCards ?? []), ...(horizontalCards ?? [])];

  return (
    <OverviewTab
      teamData={teamData}
      teamLoading={teamLoading}
      brandsData={brandsData}
      brandsLoading={brandsLoading}
      servicesData={servicesData}
      allProjects={allProjects}
      onTabChange={(id) => navigate(TAB_TO_PATH[id] ?? "/portal/dashboard")}
    />
  );
};

export default OverviewPage;
