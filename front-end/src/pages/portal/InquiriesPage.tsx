import InquiriesTab from "#components/organisms/portal/InquiriesTab";
import { useInquiries } from "#hooks/useInquiries";
import { useInquiriesSeenAt } from "#hooks/useUnseenInquiries";
import { useEffect } from "react";

const InquiriesPage = () => {
  const { data, loading, refetch } = useInquiries();
  const { markSeen } = useInquiriesSeenAt();

  // Vào trang này coi như đã xem hết → badge ở sidebar về 0. Đợi tải xong mới
  // ghi mốc, tránh trường hợp mạng lỗi mà vẫn đánh dấu là đã đọc.
  useEffect(() => {
    if (!loading) markSeen();
  }, [loading, markSeen]);

  return <InquiriesTab data={data} loading={loading} onRefetch={refetch} />;
};

export default InquiriesPage;
