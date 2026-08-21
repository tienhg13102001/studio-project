import Seo from "#components/Seo";
import CTASection from "#components/organisms/CTASection";
import FeatureSection from "#components/organisms/FeatureSection";
import HeroSection from "#components/organisms/HeroSection";
import ProcessSection from "#components/organisms/ProcessSection";
import ProductGallery from "#components/organisms/ProductGallery";
import ServiceSection from "#components/organisms/ServiceSection";
import StatsAndBrands from "#components/organisms/StatsAndBrands";
import TestimonialSection from "#components/organisms/TestimonialSection";
import { useContact } from "#hooks/useContact";
import { useLanguage } from "#i18n";
import { organizationSchema, websiteSchema } from "#lib/structuredData";

/**
 * ĐÃ BỎ MÀN HÌNH CHỜ — Hoàn chốt ngày 21/08/2026.
 *
 * Trang chủ từng che toàn bộ nội dung bằng một lớp phủ có thanh chạy, tới khi
 * bốn lời gọi API xong mới mở ra. Ba cái hại đo được:
 *
 *   · Thanh cố tình chạy chậm hơn dữ liệu. Đo trên web thật: dữ liệu về lúc
 *     giây 1,5 nhưng thanh tới 100% ở giây 7.
 *   · Nó hoãn luôn thời điểm Google đo tốc độ trang, mà điểm đó ăn vào thứ hạng
 *     — và trang chủ chính là trang được chấm.
 *   · Khách vào lần đầu phải nhìn một thanh chạy trước khi thấy được thứ họ
 *     đến để xem.
 *
 * Giờ nội dung hiện ngay, từng khối tự lấp vào khi dữ liệu về.
 *
 * Component `Preloader` GIỮ NGUYÊN trong mã nguồn, không xoá: Hoàn thích hiệu
 * ứng đó và tính chuyển sang dùng trong Portal, nơi chờ vài giây là bình thường
 * và không tốn một đồng SEO nào.
 */
const LandingPage = () => {
  const { lang } = useLanguage();
  // Dùng thông tin liên hệ thật đã nhập trong phần Cài đặt web để khai báo với
  // Google/trợ lý AI — không hardcode để khỏi lệch khi đổi số điện thoại/địa chỉ.
  const { data: contact } = useContact();

  return (
    <>
      {/* Tiêu đề tự mang tên thương hiệu nên tắt phần đuôi tự thêm. Chữ này CHỈ
          hiện ở tab trình duyệt, kết quả Google và thẻ chia sẻ Zalo — không
          phải H1 trên trang. Xếp theo thứ khách gõ nhiều nhất: "sản xuất TVC",
          rồi tới địa danh. */}
      <Seo
        title="Sản xuất TVC & video quảng cáo — Hà Nội & TP.HCM | Bee Z"
        titleTemplate={false}
        description="Bee Z Production sản xuất TVC, phim quảng cáo, video sự kiện và nội dung mạng xã hội tại Hà Nội và TP.HCM. Giá khởi điểm công khai từ 50 triệu."
        path="/"
        jsonLd={[organizationSchema(contact, lang), websiteSchema()]}
      />
      <div className="selection:text-primary relative flex w-full flex-col font-sans text-white antialiased">
        <HeroSection />
        <ServiceSection />
        <FeatureSection />
        <ProductGallery />
        {/* Trả lời câu hỏi khách lần đầu luôn hỏi: làm việc với Bee Z diễn ra
            thế nào, mất bao lâu. Đặt ngay trước phần thương hiệu và lời mời
            liên hệ, tức là ngay trước lúc khách quyết định có gọi hay không. */}
        <ProcessSection />
        <StatsAndBrands />
        {/* Đặt SAU phần thương hiệu và NGAY TRƯỚC lời mời liên hệ: logo chứng
            minh "có tên tuổi từng thuê", nhận xét trả lời "thuê rồi thì thấy
            thế nào" — và đó là câu cuối cùng khách hỏi trước khi bấm gọi.
            Khối tự ẩn nếu chưa có nhận xét nào được đánh dấu nổi bật. */}
        <TestimonialSection />
        <CTASection />
      </div>
    </>
  );
};

export default LandingPage;
