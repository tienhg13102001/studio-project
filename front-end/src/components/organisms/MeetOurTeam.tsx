import { useTranslation, useLanguage } from "#i18n";
import { useTeam } from "#hooks/useTeam";
import { resolveAssetUrl } from "#lib/api";
import { localized } from "#lib/localized";
import Reveal from "#components/Reveal";
import SpotlightCard from "#components/molecules/SpotlightCard";

/** Returns the initials of a name, e.g. "Tyler Nguyen" → "TN" */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const MeetOurTeam: React.FC = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { data: users, loading } = useTeam();

  /**
   * Khối nổi bật là bố cục lớn có ảnh to và trích dẫn — chỉ vừa MỘT người.
   *
   * LỖI CŨ: `others` lọc bỏ MỌI người được tick, trong khi chỉ MỘT người được
   * đưa lên khối nổi bật. Nên tick người thứ hai là người đó biến mất khỏi web
   * hoàn toàn — không nằm ở khối nổi bật, cũng không nằm trong lưới. Đã tái hiện
   * bằng dữ liệu thật: tick hai người thì người thứ hai mất tích.
   *
   * Nay loại đúng MỘT người đang ở khối nổi bật ra khỏi lưới. Ai tick thêm thì
   * vẫn hiện ở lưới như bình thường — sai thứ tự ưu tiên thì sửa được, chứ mất
   * người khỏi trang thì không ai phát hiện ra.
   */
  const featured = users?.find((u) => u.featured) ?? null;
  const others = (users ?? []).filter((u) => u.id !== featured?.id);

  if (loading) return null;
  if (!users?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 md:px-12 py-20 mt-12">
      {/* Section header */}
      <Reveal>
        <div className="mb-12 flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            {t.team.meetBadge}
          </span>
          <h2 className="text-foreground text-4xl font-bold md:text-5xl">
            {t.team.meetHeading}
          </h2>
        </div>
      </Reveal>

      {/* Featured member */}
      {featured && (
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 items-center">
          {/* Photo */}
          <Reveal direction="right">
            <div className="relative mx-auto w-full max-w-sm md:max-w-lg">
              {featured.photo ? (
                <div className="overflow-hidden rounded-2xl shadow-2xl aspect-3/4">
                  <img
                    src={resolveAssetUrl(featured.photo)}
                    alt={featured.name}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={640}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl aspect-3/4 bg-muted text-5xl font-bold text-muted-foreground">
                  {initials(featured.name)}
                </div>
              )}
            </div>
          </Reveal>

          {/* Info */}
          <Reveal direction="left" delay={120}>
            <div className="flex flex-col gap-5">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest">
                {localized(featured.role, lang)}
              </p>
              <h3 className="text-foreground text-4xl font-bold">{featured.name}</h3>

              {featured.quote && (
                <blockquote className="relative pl-6 border-l-2 border-primary/40">
                  <p className="text-muted-foreground text-base italic leading-relaxed">
                    &ldquo;{localized(featured.quote, lang)}&rdquo;
                  </p>
                </blockquote>
              )}

              {featured.bio && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                  {localized(featured.bio, lang)}
                </p>
              )}

              {featured.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {featured.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* Other members grid */}
      {others.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((user, i) => (
            <Reveal key={user.id} delay={i * 80} className="h-full">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex h-full flex-col gap-4 p-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  {user.photo ? (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                      <img
                        src={resolveAssetUrl(user.photo)}
                        alt={user.name}
                        loading="lazy"
                        decoding="async"
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-base font-bold text-muted-foreground">
                      {initials(user.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-foreground font-semibold">{user.name}</p>
                    <p className="text-muted-foreground text-xs">{localized(user.role, lang)}</p>
                  </div>
                </div>

                {user.quote && (
                  <p className="text-muted-foreground text-sm italic leading-relaxed border-t border-border pt-4">
                    &ldquo;{localized(user.quote, lang)}&rdquo;
                  </p>
                )}

                {user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
};

export default MeetOurTeam;
