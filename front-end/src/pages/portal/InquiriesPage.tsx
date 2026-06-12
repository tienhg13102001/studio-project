import InquiriesTab from "#components/organisms/portal/InquiriesTab";
import { useInquiries } from "#hooks/useInquiries";

const InquiriesPage = () => {
  const { data, loading, refetch } = useInquiries();
  return <InquiriesTab data={data} loading={loading} onRefetch={refetch} />;
};

export default InquiriesPage;
