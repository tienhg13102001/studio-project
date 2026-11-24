import { useLanding } from "#hooks/useLanding";
import { useLanguage } from "#i18n";
import { ChatCircleDotsIcon, FilePdfIcon, PhoneIcon } from "@phosphor-icons/react";

/**
 * Thanh liên hệ cố định ở đáy màn hình, CHỈ trên điện thoại (dưới 768px).
 *
 * VÌ SAO (Hoàn duyệt 24/11/2026): trên điện thoại màn đầu không có nút gọi, nút
 * Zalo nổi thì che chữ ở góc. Trang /bang-gia đã có sẵn thanh "Chat Zalo · Gọi
 * điện" và khách dùng quen — làm giống cho cả web, thêm hồ sơ năng lực.
 *
 * Trên máy tính vẫn là nút Zalo nổi (FloatingZalo) như cũ. Số điện thoại và link
 * Zalo lấy từ Portal → Cài đặt, không viết cứng.
 */
export default function ThanhLienHeDiDong() {
  const { lang } = useLanguage();
  const { data } = useLanding(lang);
  const zalo = data?.socials.zalo;
  const phone = data?.phone?.replace(/[^\d+]/g, "");
  if (!zalo && !phone) return null;

  const nut =
    "focus-visible:ring-primary flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none";

  return (
    <nav
      aria-label="Liên hệ nhanh"
      className="bg-background/90 border-border fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t px-3 pt-2 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {zalo && (
        <a href={zalo} target="_blank" rel="noopener noreferrer" className={`${nut} bg-primary text-primary-foreground`}>
          <ChatCircleDotsIcon size={20} weight="fill" />
          Chat Zalo
        </a>
      )}
      {phone && (
        <a href={`tel:${phone}`} className={`${nut} border-border text-foreground border`}>
          <PhoneIcon size={18} weight="fill" className="text-primary" />
          {lang === "en" ? "Call" : "Gọi điện"}
        </a>
      )}
      <a
        href="/ho-so-nang-luc-beez-production.pdf"
        target="_blank"
        rel="noopener"
        aria-label={lang === "en" ? "Company profile (PDF)" : "Hồ sơ năng lực (PDF)"}
        className={`${nut} border-border text-foreground max-w-[4.5rem] border`}
      >
        <FilePdfIcon size={20} className="text-primary" />
      </a>
    </nav>
  );
}
