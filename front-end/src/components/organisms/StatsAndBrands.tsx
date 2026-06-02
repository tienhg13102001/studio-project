import { UserIcon, UsersThreeIcon, VideoIcon } from "@phosphor-icons/react";
import MarqueeRow from "#components/molecules/MarqueeRow";
import { useTranslation } from "#i18n";
import { useBrands } from "#hooks/useBrands";
import { resolveAssetUrl } from "#lib/api";

const ICON_MAP: Record<string, React.ReactNode> = {
  UserIcon: <UserIcon size={20} weight="duotone" />,
  UsersThreeIcon: <UsersThreeIcon size={20} weight="duotone" />,
  VideoIcon: <VideoIcon size={20} weight="duotone" />,
};

const StatsAndBrands: React.FC = () => {
  const t = useTranslation();
  const { data: brands } = useBrands();

  const row1 = brands ?? [];

  return (
    <section className="py-20">
      {/* ── Stats cards ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.stats.items.map((stat) => (
            <div
              key={stat.label}
              className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                  {ICON_MAP[stat.icon]}
                </div>
                <div>
                  <span className="text-primary text-3xl font-bold">{stat.value}</span>
                  <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    {stat.label}
                  </p>
                </div>
              </div>
              {/* Divider */}
              <div className="bg-border h-px" />
              {/* Details */}
              <ul className="flex flex-col gap-1.5">
                {stat.details.map((d) => (
                  <li key={d} className="text-muted-foreground text-sm">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trusted brands ─────────────────────────────────────────────────── */}
      {brands && brands.length > 0 && (
        <div className="mt-24">
          {/* Section header */}
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
              {t.brands.badge}
            </p>
            <div className="bg-primary h-px w-12" />
            <h2 className="text-foreground text-3xl font-bold md:text-4xl">{t.brands.heading}</h2>
          </div>

          {/* Row 1 — left */}
          <div className="mb-4">
            <MarqueeRow direction="left">
              {[...row1, ...row1, ...row1].map((brand, i) => (
                <div
                  key={`${brand.id}-${i}`}
                  className="flex shrink-0 items-center justify-center px-4 py-2"
                >
                  <img
                    src={resolveAssetUrl(brand.logo)}
                    alt={brand.name}
                    decoding="async"
                    className="h-12 max-w-30 object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                </div>
              ))}
            </MarqueeRow>
          </div>
        </div>
      )}
    </section>
  );
};

export default StatsAndBrands;
