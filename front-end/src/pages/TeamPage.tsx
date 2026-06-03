import Seo from "#components/Seo";
import PageHero from "#components/organisms/PageHero";
import WhoWeAre from "#components/organisms/WhoWeAre";
import MeetOurTeam from "#components/organisms/MeetOurTeam";
import { useTranslation } from "#i18n";

const TeamPage = () => {
  const t = useTranslation();

  return (
    <div className="min-h-screen">
      <Seo
        title="Đội ngũ"
        description="Gặp gỡ đội ngũ sáng tạo của BeeZ Production — những con người đam mê đứng sau mỗi TVC, phim quảng cáo và brand film."
        path="/team"
      />
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

