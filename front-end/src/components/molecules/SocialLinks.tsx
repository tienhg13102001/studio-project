import { FacebookLogoIcon, InstagramLogoIcon } from "@phosphor-icons/react";
import LogoZalo from "../../assets/icons/LogoZalo";

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-3 mt-4 sm:mt-0">
      <div className="w-10 h-10 flex items-center justify-center bg-instagram-gradient rounded-full">
        <InstagramLogoIcon className="w-2/3 h-2/3" />
      </div>
      <div className="w-10 h-10 flex items-center justify-center bg-facebook-gradient rounded-full">
        <FacebookLogoIcon className="w-2/3 h-2/3" />
      </div>
      <div className="rounded-full overflow-hidden h-10 w-10">
        <LogoZalo className="w-full h-full" />
      </div>
    </div>
  );
};

export default SocialLinks;
