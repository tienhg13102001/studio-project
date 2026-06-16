import Seo from "#components/Seo";
import { usePortfolio } from "#hooks/usePortfolio";
import { useTranslation } from "#i18n";
import { resolveAssetUrl } from "#lib/api";

const PortfolioPage = () => {
  const t = useTranslation();
  const { data, loading } = usePortfolio();
  const items = data ?? [];

  return (
    <div className="min-h-screen pt-17">
      <Seo
        title="Portfolio"
        description="Bộ sưu tập dự án và hình ảnh tiêu biểu của BeeZ Production — TVC, Event, TikTok/Reel, F&B, Lookbook và nhiều hơn nữa."
        path="/portfolio"
      />

      {/* Gallery — capped width on large screens, responsive grid */}
      <section className="border-foreground/8 bg-foreground/3 max-w-480 mx-auto overflow-hidden rounded-b-2xl border">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-foreground/8 bg-foreground/5 aspect-square animate-pulse rounded-2xl border"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">{t.portfolio.empty}</p>
        ) : (
          <>
            {items.map((p) => (
              <figure key={p.id} className="group">
                <img
                  src={resolveAssetUrl(p.image)}
                  alt={p.title || "BeeZ Production portfolio"}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500"
                />
              </figure>
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default PortfolioPage;
