import { Button } from "#components/ui/button";
import SocialLinks from "#components/molecules/SocialLinks";
import { useTranslation } from "#i18n";

const HeroCTA = () => {
  const t = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <Button variant="default" className="rounded-full min-h-10 px-9 py-6 font-bold text-lg">
        {t.cta.contactBeez}
      </Button>
      <Button variant="outline" className="rounded-full min-h-10 px-9 py-6 font-bold text-lg text-white bg-transparent border-white/60 hover:bg-white/10 hover:text-white">
        {t.cta.viewProjects}
      </Button>
      <div className="hidden sm:block w-px h-10 bg-gray-600 mx-2" />
      <SocialLinks />
    </div>
  );
};

export default HeroCTA;
