import TeamTab from "#components/organisms/portal/TeamTab";
import { useTeam } from "#hooks/useTeam";

const TeamPage = () => {
  const { data, loading, refetch } = useTeam();
  return <TeamTab data={data} loading={loading} onRefetch={refetch} />;
};

export default TeamPage;
