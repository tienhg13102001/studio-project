import TrashTab from "#components/organisms/portal/TrashTab";
import { useTrash } from "#hooks/useTrash";

const TrashPage = () => {
  const { data, loading, refetch } = useTrash();
  return <TrashTab data={data} loading={loading} onRefetch={refetch} />;
};

export default TrashPage;
