import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useTestimonials } from "#hooks/useTestimonials";
import { useLanguage, useTranslation } from "#i18n";
import { localizedOrFallback } from "#lib/localized";
import type { ApiTestimonial } from "#lib/apiTypes";

type Props = {
  /**
   * Mã dịch vụ đang mở. Có mã thì chỉ hiện nhận xét gắn với đúng mảng đó;
   * không có mã thì đây là trang chủ, hiện những cái được đánh dấu nổi bật.
   */
  serviceId?: string;
};

/**
 * Nhận xét khách hàng.
 *
 * VÌ SAO KHÔNG CÓ ẢNH CHÂN DUNG: khách thật hiếm khi gửi ảnh, mà lấy ảnh trên
 * mạng gắn vào thì đúng bằng việc bịa ra người. Chữ không có ảnh vẫn đọc được;
 * ảnh giả bị nhận ra là hỏng cả trang.
 *
 * KHỐI NÀY TỰ BIẾN MẤT khi không có nhận xét nào hợp lệ — kể cả lúc mạng lỗi.
 * Một tiêu đề "Khách hàng nói gì" nằm trên khoảng trống còn tệ hơn là không có
 * phần đó, nên thà không hiện gì.
 */
const TestimonialSection = ({ serviceId }: Props) => {
  const { data } = useTestimonials();
  const { lang } = useLanguage();
  const t = useTranslation();

  const items = (data ?? [])
    .filter((x) => (serviceId ? x.service === serviceId : x.featured))
    // Bản không có lời ở thứ tiếng nào cũng bị loại — sót một bản rỗng là khách
    // thấy một khung trắng không hiểu là gì.
    .filter((x) => localizedOrFallback(x.quote, lang) !== "");

  if (items.length === 0) return null;

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title={t.testimonials.sectionTitle}
          subtitle={t.testimonials.sectionSubtitle}
        />

        <div
          className={
            items.length === 1
              ? "mx-auto max-w-2xl"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {items.map((item, i) => (
            // Lệch nhau một nhịp nhỏ để ba thẻ không cùng bật lên một lúc.
            <Reveal key={item.id} delay={i * 90}>
              <TestimonialCard item={item} lang={lang} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

function TestimonialCard({
  item,
  lang,
}: {
  item: ApiTestimonial;
  lang: ReturnType<typeof useLanguage>["lang"];
}) {
  const loi = localizedOrFallback(item.quote, lang);
  const ten = item.authorName?.trim() ?? "";
  const chucDanh = item.authorTitle?.trim() ?? "";

  return (
    // `h-full` để ba thẻ trong một hàng cao bằng nhau dù lời dài ngắn khác nhau.
    <figure className="border-border/60 bg-card flex h-full flex-col gap-5 rounded-2xl border p-7 md:p-8">
      {/* Dấu ngoặc kép là hình trang trí, đọc màn hình bỏ qua để khỏi đọc thành
          một ký tự vô nghĩa trước câu nói. */}
      <span aria-hidden="true" className="text-primary/50 h-6 text-5xl leading-none font-bold">
        &ldquo;
      </span>

      <blockquote className="text-foreground/85 flex-1 leading-relaxed">{loi}</blockquote>

      {/* Nhận xét ẩn danh thì bỏ hẳn phần tên — để lại gạch ngang hay chữ
          "Khách hàng" chỉ tổ trông như chỗ bị thiếu dữ liệu. */}
      {(ten || chucDanh) && (
        <figcaption className="border-border/60 flex flex-col gap-0.5 border-t pt-4">
          {ten && <span className="text-foreground text-sm font-semibold">{ten}</span>}
          {chucDanh && <span className="text-muted-foreground text-xs">{chucDanh}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export default TestimonialSection;
