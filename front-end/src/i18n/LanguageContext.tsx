import { createContext, useContext, useState } from "react";

export type Lang = "en" | "vi";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => null,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("beez-lang") as Lang) || "en",
  );

  const handleSetLang = (newLang: Lang) => {
    localStorage.setItem("beez-lang", newLang);
    setLang(newLang);
  };

  return <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
