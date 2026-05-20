import { useTranslation, useLanguage } from "#i18n";
import { useTeam } from "#hooks/useTeam";
import { resolveAssetUrl } from "#lib/api";

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

  const featured = users?.find((u) => u.featured);
  const others = users?.filter((u) => !u.featured) ?? [];

  if (loading) return null;
  if (!users?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 md:px-12 py-20 mt-12">
      {/* Section header */}
      <div className="mb-12 flex flex-col items-center text-center gap-3">
        <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {t.team.meetBadge}
        </span>
        <h2 className="text-foreground text-4xl font-bold md:text-5xl">
          {t.team.meetHeading}
        </h2>
      </div>

      {/* Featured member */}
      {featured && (
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 items-center">
          {/* Photo */}
          <div className="relative mx-auto w-full max-w-sm md:max-w-lg">
            {featured.photo ? (
              <div className="overflow-hidden rounded-2xl shadow-2xl aspect-3/4">
                <img
                  src={resolveAssetUrl(featured.photo)}
                  alt={featured.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl aspect-3/4 bg-muted text-5xl font-bold text-muted-foreground">
                {initials(featured.name)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest">
              {featured.role[lang]}
            </p>
            <h3 className="text-foreground text-4xl font-bold">{featured.name}</h3>

            {featured.quote && (
              <blockquote className="relative pl-6 border-l-2 border-primary/40">
                <p className="text-muted-foreground text-base italic leading-relaxed">
                  &ldquo;{featured.quote[lang]}&rdquo;
                </p>
              </blockquote>
            )}

            {featured.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                {featured.bio[lang]}
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
        </div>
      )}

      {/* Other members grid */}
      {others.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {user.photo ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <img
                      src={resolveAssetUrl(user.photo)}
                      alt={user.name}
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
                  <p className="text-muted-foreground text-xs">{user.role[lang]}</p>
                </div>
              </div>

              {user.quote && (
                <p className="text-muted-foreground text-sm italic leading-relaxed border-t border-border pt-4">
                  &ldquo;{user.quote[lang]}&rdquo;
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
          ))}
        </div>
      )}
    </section>
  );
};

export default MeetOurTeam;
