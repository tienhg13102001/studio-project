import Seo from "#components/Seo";
import PageHero from "#components/organisms/PageHero";
import ProfileStrip from "#components/organisms/ProfileStrip";
import WorkLibrary from "#components/organisms/WorkLibrary";
import { usePortfolio } from "#hooks/usePortfolio";
import { useProjects } from "#hooks/useProjects";
import { useLanguage, useTranslation } from "#i18n";

/**
 * Trang Portfolio.
 *
 * TRƯỚC ĐÂY: chín tấm ảnh xếp dọc, cao 13.122px — khoảng mười lăm màn hình cuộn.
 * Không một chỗ nào bấm được, không một giây video nào xem được, không tấm nào
 * ghi tên dự án. Trong khi đó 66 dự án kèm video nằm sau trang Dịch vụ, phải bấm
 * hai lần mới tới, và từ đây không có đường nào dẫn sang.
 *
 * NAY: hai khối rõ ràng —
 *   1. Hồ sơ năng lực: chính chín trang đó, cho chạy ngang thành dải phim, bấm
 *      vào để đọc to. Chúng KHÔNG mất đi, chỉ thôi chiếm hết trang.
 *   2. Thư viện dự án: toàn bộ dự án, lọc được theo mảng việc, mỗi thẻ dẫn thẳng
 *      tới địa chỉ riêng của dự án.
 *
 * Thứ tự này có chủ ý: khách vừa vào cần biết Bee Z là ai (hồ sơ), rồi mới cần
 * bằng chứng (dự án). Đảo lại thì bằng chứng không có chỗ dựa.
 */
const PortfolioPage = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { data: hoSo, loading: dangTaiHoSo } = usePortfolio();
  const { raw, loading: dangTaiDuAn } = useProjects(lang);

  // Gộp hai nhóm bố cục lại: với người xem thì đây chỉ là "các dự án", việc thẻ
  // dựng đứng hay nằm ngang là chuyện của trang Dịch vụ, không phải chuyện ở đây.
  const duAn = [...(raw?.verticalCards ?? []), ...(raw?.horizontalCards ?? [])];

  return (
    <div className="min-h-screen pt-17">
      <Seo
        title="Portfolio"
        description="Hồ sơ năng lực và toàn bộ dự án đã thực hiện của BeeZ Production — TVC, sự kiện, F&B, lookbook, nội dung mạng xã hội. Lọc theo mảng việc, xem video từng dự án."
        path="/portfolio"
      />

      <PageHero title="Portfolio" subtitle={t.portfolio.subtitle} />

      {dangTaiHoSo ? (
        <div className="flex gap-4 px-6 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border/60 bg-foreground/5 h-[300px] w-[220px] shrink-0 animate-pulse rounded-xl border md:h-[420px] md:w-[320px]"
            />
          ))}
        </div>
      ) : (
        <ProfileStrip items={hoSo ?? []} />
      )}

      {dangTaiDuAn ? (
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-12 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-border/60 bg-foreground/5 aspect-[4/3] animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : (
        <WorkLibrary projects={duAn} />
      )}

      {!dangTaiHoSo && !dangTaiDuAn && (hoSo ?? []).length === 0 && duAn.length === 0 && (
        <p className="text-muted-foreground py-20 text-center">{t.portfolio.empty}</p>
      )}
    </div>
  );
};

export default PortfolioPage;
