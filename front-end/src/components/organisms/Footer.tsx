import { useContact } from "#hooks/useContact";
import { useLanguage, useTranslation } from "#i18n";
import {
  ClockIcon,
  EnvelopeSimpleIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  TiktokLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import Logo from "../../assets/icons/Logo";

const NAV_ITEMS = [
  { key: "home", to: "/" },
  { key: "services", to: "/service" },
  { key: "team", to: "/team" },
  { key: "contact", to: "/contact" },
] as const;

const Footer: React.FC = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { data: contact } = useContact();
  const year = new Date().getFullYear();

  const socials = [
    contact?.socials.facebook && {
      href: contact.socials.facebook,
      icon: FacebookLogoIcon,
      label: "Facebook",
    },
    contact?.socials.instagram && {
      href: contact.socials.instagram,
      icon: InstagramLogoIcon,
      label: "Instagram",
    },
    contact?.socials.youtube && {
      href: contact.socials.youtube,
      icon: YoutubeLogoIcon,
      label: "YouTube",
    },
    contact?.socials.tiktok && {
      href: contact.socials.tiktok,
      icon: TiktokLogoIcon,
      label: "TikTok",
    },
  ].filter(Boolean) as { href: string; icon: typeof FacebookLogoIcon; label: string }[];

  return (
    <footer className="border-border bg-card/50 text-foreground border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo className="text-foreground h-8 w-8" />
            <span className="text-xl font-bold">BeeZ Production</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.footer.tagline}</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            {t.footer.quickLinks}
          </h3>
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            {t.footer.contact}
          </h3>
          <ul className="space-y-3 text-sm">
            {contact?.phone && (
              <li className="flex items-start gap-2">
                <PhoneIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.email && (
              <li className="flex items-start gap-2">
                <EnvelopeSimpleIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contact.email}
                </a>
              </li>
            )}
            {contact?.address && (
              <li className="flex items-start gap-2">
                <MapPinIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{contact.address[lang]}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Hours + Social */}
        <div className="space-y-6">
          {contact?.workingHours && contact.workingHours.length > 0 && (
            <div>
              <h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                {t.footer.hours}
              </h3>
              <ul className="space-y-2 text-sm">
                {contact.workingHours.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ClockIcon size={16} className="text-primary mt-0.5 shrink-0" />
                    <div className="text-muted-foreground">
                      <span className="text-foreground">{item.label[lang]}: </span>
                      {item.hours[lang]}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                {t.footer.followUs}
              </h3>
              <div className="flex items-center gap-3">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="bg-foreground/10 hover:bg-primary hover:text-primary-foreground text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-border border-t">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <p className="text-muted-foreground text-center text-xs">
            {t.footer.rights.replace("{year}", String(year))}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
