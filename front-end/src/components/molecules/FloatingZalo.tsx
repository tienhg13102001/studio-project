import { useLanding } from "#hooks/useLanding";
import { useLanguage } from "#i18n";
import LogoZalo from "../../assets/icons/LogoZalo";

/**
 * Nút Zalo nổi ở góc phải dưới — khách Việt thường nhắn Zalo trước khi điền form,
 * nên luôn cần một lối liên hệ 1 chạm. Chỉ hiện khi phần Cài đặt web đã điền link
 * Zalo. Giữ z-index dưới drawer/lightbox (z-40+) để không đè lên chúng.
 */
export default function FloatingZalo() {
  const { lang } = useLanguage();
  const { data } = useLanding(lang);
  const zalo = data?.socials.zalo;

  if (!zalo) return null;

  return (
    <a
      href={zalo}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Zalo với BeeZ Production"
      className="group focus-visible:ring-primary fixed right-5 bottom-5 z-30 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100 md:right-6 md:bottom-6"
    >
      {/* Vòng sáng lan toả — chỉ để hút mắt, tắt khi người dùng giảm chuyển động. */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#0068FF]/40 motion-reduce:hidden" />
      <LogoZalo className="relative h-full w-full rounded-full" />
      {/* Nhãn chỉ hiện khi trỏ chuột trên máy tính. */}
      <span className="bg-card text-foreground border-border pointer-events-none absolute right-full mr-3 hidden rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100 lg:block">
        Chat Zalo
      </span>
    </a>
  );
}
