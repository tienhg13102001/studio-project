import { createContext, useContext, useState } from "react";

export type Lang = "en" | "vi";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

/**
 * MẶC ĐỊNH LÀ TIẾNG VIỆT.
 *
 * Khách của Bee Z chủ yếu là doanh nghiệp Việt, tìm bằng từ khoá tiếng Việt.
 * Trước đây mặc định là tiếng Anh, nên `index.html` khai `lang="vi"` xong thì
 * JavaScript chạy sau lại ghi đè thành `lang="en"` — vừa khiến khách Việt phải
 * bấm đổi ngôn ngữ ở mọi lần vào đầu tiên, vừa báo sai với máy tìm kiếm rằng
 * đây là trang tiếng Anh.
 *
 * Ai đã tự chọn tiếng Anh thì lựa chọn đó nằm trong `localStorage` và vẫn được
 * giữ nguyên — thay đổi này chỉ đổi mặc định cho người vào lần đầu.
 */
const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => null,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("beez-lang") as Lang) || "vi",
  );

  const handleSetLang = (newLang: Lang) => {
    localStorage.setItem("beez-lang", newLang);
    setLang(newLang);
  };

  return <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
