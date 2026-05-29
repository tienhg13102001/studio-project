import { useLanding } from "#hooks/useLanding";
import { useLanguage } from "#i18n";
import { cn } from "#lib/utils";
import { FacebookLogoIcon, InstagramLogoIcon, PhoneIcon } from "@phosphor-icons/react";
import LogoZalo from "../../assets/icons/LogoZalo";

type Props = {
  /** sm = 36px, md = 40px circles */
  size?: "sm" | "md";
  /** Include phone "Call now" button (default true). Disable when phone is shown elsewhere. */
  showPhone?: boolean;
  className?: string;
};

const SocialLinks = ({ size = "md", showPhone = true, className }: Props) => {
  const { lang } = useLanguage();
  const { data } = useLanding(lang);

  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  const items = [
    showPhone && data?.phone && {
      key: "phone",
      href: `tel:${data.phone}`,
      external: false,
      label: "Phone",
      bg: "bg-primary",
      content: (
        <PhoneIcon className="text-primary-foreground h-1/2 w-1/2" weight="fill" />
      ),
    },
    data?.socials.instagram && {
      key: "instagram",
      href: data.socials.instagram,
      external: true,
      label: "Instagram",
      bg: "bg-instagram-gradient",
      content: <InstagramLogoIcon className="h-2/3 w-2/3 text-white" />,
    },
    data?.socials.facebook && {
      key: "facebook",
      href: data.socials.facebook,
      external: true,
      label: "Facebook",
      bg: "bg-facebook-gradient",
      content: <FacebookLogoIcon className="h-2/3 w-2/3 text-white" />,
    },
    data?.socials.zalo && {
      key: "zalo",
      href: data.socials.zalo,
      external: true,
      label: "Zalo",
      bg: "overflow-hidden",
      content: <LogoZalo className="h-full w-full" />,
    },
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    external: boolean;
    label: string;
    bg: string;
    content: React.ReactNode;
  }>;

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          aria-label={item.label}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(
            "flex items-center justify-center rounded-full transition-transform hover:scale-110",
            dim,
            item.bg,
          )}
        >
          {item.content}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
