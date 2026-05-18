import { Button } from "#components/ui/button";
import SocialLinks from "#components/molecules/SocialLinks";

const HeroCTA = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <Button variant="default" className="rounded-full min-h-10 px-9 py-6 font-bold text-lg">
        LIÊN HỆ BeeZ
      </Button>
      <Button variant="outline" className="rounded-full min-h-10 px-9 py-6 font-bold text-lg">
        Xem Dự Án
      </Button>
      <div className="hidden sm:block w-px h-10 bg-gray-600 mx-2" />
      <SocialLinks />
    </div>
  );
};

export default HeroCTA;
