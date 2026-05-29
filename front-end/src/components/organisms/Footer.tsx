import SocialLinks from "#components/molecules/SocialLinks";
import { useContact } from "#hooks/useContact";
import { useLanding } from "#hooks/useLanding";
import { useLanguage, useTranslation } from "#i18n";
import {
  ClockIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
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
  const { data: landing } = useLanding(lang);
  const year = new Date().getFullYear();
  const hasSocials = !!(
    landing?.socials.facebook ||
    landing?.socials.instagram ||
    landing?.socials.zalo
  );

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
            {landing?.phone && (
              <li className="flex items-start gap-2">
                <PhoneIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <a
                  href={`tel:${landing.phone}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {landing.phone}
                </a>
              </li>
            )}
            {landing?.email && (
              <li className="flex items-start gap-2">
                <EnvelopeSimpleIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <a
                  href={`mailto:${landing.email}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {landing.email}
                </a>
              </li>
            )}
            {landing?.address && (
              <li className="flex items-start gap-2">
                <MapPinIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{landing.address}</span>
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

          {hasSocials && (
            <div>
              <h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                {t.footer.followUs}
              </h3>
              <SocialLinks size="sm" showPhone={false} />
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
