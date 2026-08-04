import { useTranslation } from "#i18n";
import type { CaseStudyDisplay } from "#hooks/useProjects";

/**
 * Câu chuyện dự án: Bài toán → Cách làm → Kết quả.
 *
 * VÌ SAO CÓ KHỐI NÀY: dự án trước đây chỉ có tên, ảnh, video và ngày quay. Khách
 * xem xong biết Bee Z quay đẹp, nhưng không biết Bee Z GIẢI QUYẾT ĐƯỢC VẤN ĐỀ
 * GÌ — mà khách thuê TVC thì mua kết quả chứ không mua đoạn phim đẹp.
 *
 * VÌ SAO ĐÁNH SỐ 01–03: đây là chuỗi có thứ tự thật — không hiểu bài toán thì
 * không đọc nổi cách làm, không biết cách làm thì con số kết quả vô nghĩa. Đánh
 * số ở đây mang thông tin chứ không phải trang trí.
 *
 * Ba phần đều KHÔNG bắt buộc. Dự án chưa viết gì thì khối này biến mất hoàn
 * toàn, không để lại tiêu đề trống — bên gọi đã lọc sẵn ở `mapCaseStudy`.
 */
type Props = {
  caseStudy: CaseStudyDisplay;
  /** Bản gọn cho cột hẹp trên điện thoại. */
  compact?: boolean;
};

const CaseStudyBlock = ({ caseStudy, compact = false }: Props) => {
  const t = useTranslation();
  const nhan = t.project.caseStudy;

  const phan = [
    { khoa: "challenge", nhan: nhan.challenge, chu: caseStudy.challenge },
    { khoa: "approach", nhan: nhan.approach, chu: caseStudy.approach },
    { khoa: "result", nhan: nhan.result, chu: caseStudy.result },
  ].filter((p) => p.chu);

  if (phan.length === 0) return null;

  return (
    <section className={compact ? "mt-6" : "mt-8"}>
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        {nhan.heading}
      </h3>

      <ol className="flex flex-col gap-4">
        {phan.map((p, i) => (
          <li key={p.khoa} className="border-primary/25 border-l-2 pl-4">
            <div className="mb-1 flex items-baseline gap-2">
              {/* Số thứ tự bám theo phần THỰC SỰ có mặt, nên dự án chỉ viết mỗi
                  Kết quả vẫn đánh 01 chứ không nhảy cóc thành 03. */}
              <span className="text-primary/70 text-[11px] font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="text-foreground text-xs font-semibold tracking-wide uppercase">
                {p.nhan}
              </h4>
            </div>
            {/* `whitespace-pre-line` để người quản trị xuống dòng trong Portal thì
                trên web cũng xuống dòng đúng như vậy. */}
            <p
              className={`text-foreground/80 leading-relaxed whitespace-pre-line ${
                compact ? "text-sm" : "text-sm md:text-[15px]"
              }`}
            >
              {p.chu}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default CaseStudyBlock;
