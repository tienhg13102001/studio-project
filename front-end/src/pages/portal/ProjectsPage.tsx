import ProjectsTab from "#components/organisms/portal/ProjectsTab";
import { useProjects } from "#hooks/useProjects";
import { useServices } from "#hooks/useServices";

const ProjectsPage = () => {
  const { verticalCards, horizontalCards, raw, loading, refetch } = useProjects();
  const { raw: rawServices } = useServices("en");
  const allProjects = [...(verticalCards ?? []), ...(horizontalCards ?? [])];
  const rawProjectList = raw ? [...raw.verticalCards, ...raw.horizontalCards] : null;

  return (
    <ProjectsTab
      data={allProjects}
      raw={rawProjectList}
      services={rawServices}
      loading={loading}
      onRefetch={refetch}
    />
  );
};

export default ProjectsPage;
