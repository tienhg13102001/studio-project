import TestimonialsTab from "#components/organisms/portal/TestimonialsTab";
import { useTestimonials } from "#hooks/useTestimonials";

const TestimonialsPage = () => {
  // `true` = đọc cả bản đã tắt. Đường này chỉ quản trị mới gọi được (xem
  // ADMIN_ONLY_READS ở back-end/src/routes/index.ts).
  const { data, loading, refetch } = useTestimonials(true);
  return <TestimonialsTab data={data} loading={loading} onRefetch={refetch} />;
};

export default TestimonialsPage;
