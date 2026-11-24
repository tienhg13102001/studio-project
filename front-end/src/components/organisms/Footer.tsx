import SocialLinks from "#components/molecules/SocialLinks";
import { useContact } from "#hooks/useContact";
import { useBaiViet } from "#hooks/useBaiViet";
import { useLanding } from "#hooks/useLanding";
import { useVisitorCount } from "#hooks/useVisitorCount";
import { useLanguage, useTranslation } from "#i18n";
import { localized } from "#lib/localized";
import {
  ClockIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import LogoYellow from "../../assets/icons/LogoYellow";

const NAV_ITEMS = [
  { key: "home", to: "/" },
  { key: "services", to: "/service" },
  { key: "portfolio", to: "/portfolio" },
  // Trang tĩnh ngoài React (nginx phục vụ) nên phải là thẻ <a> thường.
  { key: "pricing", to: "/bang-gia", ngoaiReact: true },
  { key: "team", to: "/team" },
  { key: "contact", to: "/contact" },
] as const;

const Footer: React.FC = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { data: contact } = useContact();
  const { data: landing } = useLanding(lang);
  const { data: baiViet } = useBaiViet();
  // GIỮ lời gọi này dù không còn hiện số: chính nó gửi lượt đếm khách của mọi
  // trang React. Bỏ đi là bộ đếm ngừng đếm. Số tổng chỉ còn xem trong Portal →
  // Analytics (24/11/2026: khách không cần thấy, và số nhỏ làm web trông vắng).
  useVisitorCount();
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
            <LogoYellow className="text-foreground h-8 w-8" />
            <span className="text-xl font-bold">Bee Z Production</span>
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
                {"ngoaiReact" in item && item.ngoaiReact ? (
                  <a
                    href={item.to}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t.nav[item.key]}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t.nav[item.key]}
                  </Link>
                )}
              </li>
            ))}
            {/* Mục bài viết chỉ hiện khi đã có bài đăng — link tới một trang
                "sắp có" trông như web làm dở. */}
            {(baiViet?.length ?? 0) > 0 && (
              <li>
                <Link
                  to="/bai-viet"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t.nav.blog}
                </Link>
              </li>
            )}
            <li>
              {/* Tệp tĩnh trong public/ — thẻ <a> thường, mở tab mới. */}
              <a
                href="/ho-so-nang-luc-beez-production.pdf"
                target="_blank"
                rel="noopener"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {t.footer.profile}
              </a>
            </li>
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
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
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
                <span className="text-muted-foreground">{localized(contact.address, lang)}</span>
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
                      <span className="text-foreground">{localized(item.label, lang)}: </span>
                      {localized(item.hours, lang)}
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
        {/* `md:pr-24`: chừa chỗ cho nút Zalo nổi góc phải, kẻo nó che link cuối hàng. */}
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-6 py-4 sm:flex-row sm:justify-between md:pr-24">
          <div className="text-muted-foreground space-y-1 text-center text-xs sm:text-left">
            <p>{t.footer.rights.replace("{year}", String(year))}</p>
            {/* Tên pháp lý + mã số thuế: khách doanh nghiệp hay soi trước khi
                ký hợp đồng, và Google đối chiếu với hồ sơ đăng ký kinh doanh. */}
            <p>{t.footer.legal}</p>
          </div>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <Link to="/chinh-sach-bao-mat" className="hover:text-foreground transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to="/portal" rel="nofollow" className="hover:text-foreground transition-colors">
              {t.footer.internal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
