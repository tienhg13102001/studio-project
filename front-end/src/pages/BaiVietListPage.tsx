import Seo from "#components/Seo";
import CTASection from "#components/organisms/CTASection";
import { useBaiViet } from "#hooks/useBaiViet";
import { resolveAssetUrl, srcSetAnh } from "#lib/api";
import { ngayViet } from "#lib/baiViet";
import { seoTrangTinh } from "#lib/seoTrangTinh";
import { SITE_URL, breadcrumbSchema } from "#lib/structuredData";
import { Link } from "react-router-dom";

/**
 * /bai-viet — mục bài viết (24/11/2026, mục C4 lộ trình SEO).
 *
 * Bài viết trả lời những câu khách và trợ lý AI hay hỏi ("chi phí sản xuất TVC",
 * "quay hội nghị cần mấy máy"), số liệu lấy từ bảng giá và dự án thật.
 * Chưa có bài nào thì trang đặt noindex: trang trống không nên lên Google.
 */
const BaiVietListPage = () => {
  const { data, loading } = useBaiViet();
  const seo = seoTrangTinh("/bai-viet");
  const ds = data ?? [];

  return (
    <div className="min-h-screen">
      <Seo
        {...seo}
        path="/bai-viet"
        noindex={!loading && ds.length === 0}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Bài viết — Bee Z Production",
            url: `${SITE_URL}/bai-viet`,
            inLanguage: "vi",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbSchema([
            { name: "Trang chủ", path: "/" },
            { name: "Bài viết", path: "/bai-viet" },
          ]),
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <header className="mb-12 max-w-2xl">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Bài viết</p>
          <h1 className="text-foreground text-3xl leading-tight font-bold text-balance md:text-5xl">
            Sản xuất video, nói bằng số thật
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
            Chi phí, quy trình và cách chọn ekip, viết từ bảng giá và những dự án Bee Z đã làm.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted/40 aspect-[16/10] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : ds.length === 0 ? (
          <p className="text-muted-foreground border-border rounded-xl border border-dashed p-10 text-center">
            Bài viết đầu tiên sắp lên. Trong lúc chờ, xem{" "}
            <a href="/bang-gia" className="text-primary underline underline-offset-4">
              bảng giá
            </a>{" "}
            hoặc{" "}
            <Link to="/portfolio" className="text-primary underline underline-offset-4">
              các dự án đã làm
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {ds.map((b, i) => {
              const anh = b.anhBia ? resolveAssetUrl(b.anhBia) : "";
              return (
                <Link key={b.id} to={`/bai-viet/${b.slug}`} className="group flex flex-col gap-4">
                  <div className="bg-muted/40 aspect-[16/10] overflow-hidden rounded-xl">
                    {anh ? (
                      <img
                        src={anh}
                        srcSet={srcSetAnh(anh)}
                        sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                        alt=""
                        loading={i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="from-primary/25 to-muted/40 h-full w-full bg-linear-to-br" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {b.ngayDang && (
                      <time dateTime={b.ngayDang} className="text-muted-foreground text-xs tracking-wide">
                        {ngayViet(b.ngayDang)}
                      </time>
                    )}
                    <h2 className="text-foreground group-hover:text-primary text-xl leading-snug font-semibold text-balance transition-colors">
                      {b.tieuDe}
                    </h2>
                    {b.moTa && <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{b.moTa}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <CTASection />
    </div>
  );
};

export default BaiVietListPage;
