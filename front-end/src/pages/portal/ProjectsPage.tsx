import ProjectsTab from "#components/organisms/portal/ProjectsTab";
import { useProjects } from "#hooks/useProjects";
import { useServices } from "#hooks/useServices";
import { useTeam } from "#hooks/useTeam";

const ProjectsPage = () => {
  const { verticalCards, horizontalCards, raw, loading, refetch } = useProjects();
  const { raw: rawServices } = useServices("en");
  const { data: users } = useTeam();
  const allProjects = [...(verticalCards ?? []), ...(horizontalCards ?? [])];
  const rawProjectList = raw ? [...raw.verticalCards, ...raw.horizontalCards] : null;

  return (
    <ProjectsTab
      data={allProjects}
      raw={rawProjectList}
      services={rawServices}
      users={users}
      loading={loading}
      onRefetch={refetch}
    />
  );
};

export default ProjectsPage;
