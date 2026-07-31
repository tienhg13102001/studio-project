import Reveal from "#components/Reveal";
import CountUp from "#components/molecules/CountUp";
import MarqueeRow from "#components/molecules/MarqueeRow";
import { useBrands } from "#hooks/useBrands";
import { useTranslation } from "#i18n";
import { resolveAssetUrl } from "#lib/api";
import { UserIcon, UsersThreeIcon, VideoIcon } from "@phosphor-icons/react";

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
          {t.stats.items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                    {ICON_MAP[stat.icon]}
                  </div>
                  <div>
                    <CountUp value={stat.value} className="text-primary text-3xl font-bold" />
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
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Trusted brands ─────────────────────────────────────────────────── */}
      {brands && brands.length > 0 && (
        <div className="mt-24">
          {/* Section header */}
          <Reveal>
            <div className="mb-20 flex flex-col items-center gap-3 text-center">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                {t.brands.badge}
              </p>
              <div className="bg-primary h-px w-12" />
              <h2 className="text-foreground text-3xl font-bold md:text-4xl">{t.brands.heading}</h2>
            </div>
          </Reveal>

          {/*
            Chỉ một hàng: trước đây có hai hàng chạy ngược chiều nhưng LẶP LẠI
            cùng một danh sách thương hiệu — nhìn kỹ là thấy trùng, vô tình khoe
            ra là ít khách. Logo để xám lúc nghỉ và lên màu khi rê chuột, cách
            các agency lớn vẫn làm để dải logo không lấn át nội dung chính.
          */}
          <div className="border-border/50 bg-muted/30 overflow-hidden border-y">
            <MarqueeRow direction="left">
              {[...row1, ...row1].map((brand, i) => (
                <div
                  key={`${brand.id}-${i}`}
                  className="group flex shrink-0 items-center justify-center px-4 py-6"
                >
                  <img
                    src={resolveAssetUrl(brand.logo)}
                    alt={`Logo ${brand.name} — khách hàng của BeeZ Production`}
                    loading="lazy"
                    decoding="async"
                    width={120}
                    height={48}
                    className="h-12 max-w-30 object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
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
