import MarqueeRow from "#components/molecules/MarqueeRow";
import { useTranslation } from "#i18n";

const GALLERY_IMAGES = [
  "/NAQ03133.webp",
  "/feature1.webp",
  "/feature2.webp",
  "/services1.webp",
  "/services2.webp",
];

const WhoWeAre: React.FC = () => {
  const t = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Main content row */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pb-16 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 items-center">
        {/* Left — featured image */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl aspect-4/3">
            <img
              src={"/user1.webp"}
              alt="BeeZ Production team"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Decorative accent */}
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-primary/20 -z-10" />
          <div className="absolute -top-4 -left-4 h-16 w-16 rounded-xl bg-primary/10 -z-10" />
        </div>

        {/* Right — text */}
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            {t.team.aboutBadge}
          </span>
          <h2 className="text-foreground text-4xl font-bold leading-tight md:text-5xl">
            {t.team.aboutHeading}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
            {t.team.aboutDescription}
          </p>
        </div>
      </div>

      {/* Stats marquee */}
      <div className="border-y border-border/50 bg-muted/30 py-4 overflow-hidden w-1/2 max-w-7xl mx-auto">
        <MarqueeRow direction="left">
          {[...t.team.stats, ...t.team.stats, ...t.team.stats].map((stat, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3">
              <span className="text-primary text-2xl font-bold">{stat.value}</span>
              <span className="text-muted-foreground text-sm font-medium">{stat.label}</span>
              <span className="text-border mx-2 text-xl">•</span>
            </div>
          ))}
        </MarqueeRow>
      </div>

      {/* Photo gallery strip */}
      <div className="pt-10 pb-4 overflow-hidden">
        <MarqueeRow direction="left">
          {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
            <div key={i} className="shrink-0 h-48 w-72 overflow-hidden rounded-xl shadow-md">
              <img
                src={src}
                alt={`BeeZ gallery ${i}`}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </MarqueeRow>
      </div>
    </section>
  );
};

export default WhoWeAre;
