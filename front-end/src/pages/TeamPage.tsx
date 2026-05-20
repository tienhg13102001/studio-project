import PageHero from "#components/organisms/PageHero";
import WhoWeAre from "#components/organisms/WhoWeAre";
import MeetOurTeam from "#components/organisms/MeetOurTeam";
import { useTranslation } from "#i18n";

const TeamPage = () => {
  const t = useTranslation();

  return (
    <div className="min-h-screen">
      <PageHero
        title={
          <>
            {t.team.heroLine1} <br />{" "}
            <span className="text-primary text-7xl mt-2">{t.team.heroLine2}</span>
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

