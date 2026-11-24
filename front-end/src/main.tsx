import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routers/index.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { LanguageProvider } from "./i18n";

/*
 * Gỡ thẻ mô tả TĨNH của HTML trước khi React vẽ (24/11/2026).
 *
 * HTML gốc (index.html, các trang dựng sẵn) mang sẵn description, canonical,
 * og:*, twitter:* cho máy không chạy JavaScript. Khi React chạy, component Seo
 * dựng bộ thẻ của nó; react-helmet-async 3 + React 19 đưa thẳng thẻ lên <head>
 * mà KHÔNG đánh dấu gì, nên không phân biệt được với thẻ tĩnh sau khi vẽ. Hậu quả
 * đo 23/11: mọi trang có HAI bộ thẻ, Google phải đoán tin bản nào.
 *
 * Gỡ ở đây — trước khi React vẽ — thì chắc chắn chỉ chạm thẻ tĩnh. Riêng <title>
 * chỉ ĐÁNH DẤU (`data-tinh`): trang có Seo sẽ gỡ nó khi Seo chạy; trang không có
 * Seo (Portal) vẫn giữ tiêu đề trên tab.
 */
document.head
  .querySelectorAll(
    'meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"]',
  )
  .forEach((el) => el.remove());
document.head.querySelectorAll("title").forEach((el) => el.setAttribute("data-tinh", ""));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
