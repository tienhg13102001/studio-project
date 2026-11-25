import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { boTienToEn, coBanTiengAnh, ngonNguTuDuongDan, theoNgonNgu } from "./duongDan";

export type Lang = "en" | "vi";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Đường dẫn Việt → đúng ngôn ngữ đang xem (`/team` → `/en/team` khi đang ở bản Anh). */
  dd: (path: string) => string;
};

/**
 * NGÔN NGỮ = ĐƯỜNG DẪN (đợt J, 25/11/2026): `/en/…` là tiếng Anh, còn lại tiếng
 * Việt. Xem chú thích đầu `duongDan.ts`.
 *
 * Trước đây lựa chọn nằm trong `localStorage` (`beez-lang`). Giờ KHÔNG đọc nó
 * nữa: khách vào từ Google bằng link tiếng Việt thì phải thấy tiếng Việt, đúng
 * như Google đã hứa trong kết quả tìm kiếm. Tự chuyển hướng theo lựa chọn cũ là
 * điều Google khuyên đừng làm (bot không bao giờ thấy được bản còn lại).
 *
 * Provider nằm NGOÀI RouterProvider (main.tsx) nên không dùng được useLocation;
 * thay vào đó nghe thẳng router.
 */
type RouterLike = {
  state: { location: { pathname: string; search: string; hash: string } };
  subscribe: (fn: (s: { location: { pathname: string } }) => void) => () => void;
  navigate: (to: string) => unknown;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => null,
  dd: (p) => p,
});

export const LanguageProvider = ({ router, children }: { router: RouterLike; children: React.ReactNode }) => {
  const [pathname, setPathname] = useState(router.state.location.pathname);
  useEffect(() => router.subscribe((s) => setPathname(s.location.pathname)), [router]);

  const lang = ngonNguTuDuongDan(pathname);

  const setLang = useCallback(
    (moi: Lang) => {
      if (moi === lang) return;
      const { pathname: p, search, hash } = router.state.location;
      const goc = boTienToEn(p);
      // Trang chỉ có tiếng Việt (bài viết) mà bấm EN → về trang chủ tiếng Anh,
      // không để khách đứng ở một địa chỉ /en không tồn tại.
      const dich = moi === "en" ? (coBanTiengAnh(goc) ? theoNgonNgu(goc, "en") + search + hash : "/en") : goc + search + hash;
      router.navigate(dich);
    },
    [lang, router],
  );

  const dd = useCallback((p: string) => theoNgonNgu(p, lang), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, dd }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
