import Seo from "#components/Seo";
import { seoTrangTinh } from "#lib/seoTrangTinh";
import PageHero from "#components/organisms/PageHero";
import WhoWeAre from "#components/organisms/WhoWeAre";
import MeetOurTeam from "#components/organisms/MeetOurTeam";
import { useLanguage, useTranslation } from "#i18n";

const TeamPage = () => {
  const t = useTranslation();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen">
      <Seo {...seoTrangTinh("/team", lang)} path="/team" />
      <PageHero
        title={
          <>
            {t.team.heroLine1}{" "}
            <span className="text-primary mt-2 block text-4xl sm:text-5xl md:text-7xl">
              {t.team.heroLine2}
            </span>
          </>
        }
        subtitle={t.team.heroSubtitle}
      />
      <WhoWeAre />
      <MeetOurTeam />
    </div>
  );
};

export default TeamPage;

