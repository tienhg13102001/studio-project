import BrandsTab from "#components/organisms/portal/BrandsTab";
import { useBrands } from "#hooks/useBrands";

const BrandsPage = () => {
  const { data, loading, refetch } = useBrands();
  return <BrandsTab data={data} loading={loading} onRefetch={refetch} />;
};

export default BrandsPage;
