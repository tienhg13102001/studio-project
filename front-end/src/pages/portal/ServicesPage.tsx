import ServicesTab from "#components/organisms/portal/ServicesTab";
import { useServices } from "#hooks/useServices";

const ServicesPage = () => {
  const { data, raw, loading, refetch } = useServices("en");
  return <ServicesTab data={data} raw={raw} loading={loading} onRefetch={refetch} />;
};

export default ServicesPage;
