import { Button } from "#components/ui/button";
import SocialLinks from "#components/molecules/SocialLinks";
import { useTranslation } from "#i18n";

const HeroCTA = () => {
  const t = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
      <div className="flex gap-3 sm:gap-6">
        <Button
          variant="default"
          className="min-h-10 rounded-full px-6 py-3 text-sm font-bold md:px-9 md:py-6 md:text-lg"
        >
          {t.cta.contactBeez}
        </Button>
        <Button
          variant="outline"
          className="min-h-10 rounded-full border-white/60 bg-transparent px-6 py-3 text-sm font-bold text-white hover:bg-white/10 hover:text-white md:px-9 md:py-6 md:text-lg"
        >
          {t.cta.viewProjects}
        </Button>
      </div>
      <div className="mx-2 hidden h-10 w-px bg-gray-600 sm:block" />
      <SocialLinks />
    </div>
  );
};

export default HeroCTA;
