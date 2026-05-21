import { FacebookLogoIcon, InstagramLogoIcon } from "@phosphor-icons/react";
import LogoZalo from "../../assets/icons/LogoZalo";

const SocialLinks = () => {
  return (
    <div className="mt-4 flex items-center gap-3 sm:mt-0">
      <div className="bg-instagram-gradient flex h-10 w-10 items-center justify-center rounded-full">
        <InstagramLogoIcon className="h-2/3 w-2/3" />
      </div>
      <a
        href="https://www.facebook.com/BeeZProductions"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-facebook-gradient flex h-10 w-10 items-center justify-center rounded-full"
      >
        <FacebookLogoIcon className="h-2/3 w-2/3" />
      </a>
      <div className="h-10 w-10 overflow-hidden rounded-full">
        <LogoZalo className="h-full w-full" />
      </div>
    </div>
  );
};

export default SocialLinks;
