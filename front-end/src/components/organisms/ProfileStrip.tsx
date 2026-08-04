import { useCallback, useEffect, useState } from "react";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { useTranslation } from "#i18n";
import { resolveAssetUrl } from "#lib/api";
import type { ApiPortfolioItem } from "#lib/apiTypes";

/**
 * Hồ sơ năng lực dạng dải phim chạy ngang.
 *
 * CHÍN TẤM NÀY LÀ GÌ: chúng không phải ảnh trang trí mà là chín trang hồ sơ
 * năng lực của Bee Z — mỗi trang một chương có tiêu đề, mô tả dịch vụ và bộ ảnh
 * riêng. Trước đây trang Portfolio xếp dọc chín tấm này thành một bức tường cao
 * hơn 13.000px, khách phải cuộn khoảng mười lăm màn hình mà không bấm được vào
 * đâu, cũng không xem được một giây video nào.
 *
 * VÌ SAO CHẠY NGANG CHỨ KHÔNG XẾP DỌC: chín trang có tỉ lệ khác nhau hẳn (0,73
 * tới 1,49) vì mỗi trang cắt theo lượng nội dung của nó. Xếp dọc toàn khung thì
 * trang nào cũng chiếm trọn bề ngang và đẩy phần dự án — thứ khách thật sự tới
 * để xem — xuống tận đáy. Cho chúng chạy ngang với CHIỀU CAO CỐ ĐỊNH, bề ngang
 * tự co theo tỉ lệ gốc, thì cả chín trang gói gọn trong một màn hình, không
 * trang nào bị cắt cúp, và thứ tự đọc vẫn giữ nguyên.
 *
 * Ở kích thước dải, chữ trong trang chưa đọc được — nên bấm vào là mở khung đọc
 * to hết cỡ. Dải chỉ làm nhiệm vụ cho thấy có gì và dẫn vào.
 */
type Props = {
  items: ApiPortfolioItem[];
};

const ProfileStrip = ({ items }: Props) => {
  const t = useTranslation();
  const [dangDoc, setDangDoc] = useState<number | null>(null);

  const dong = useCallback(() => setDangDoc(null), []);
  const chuyen = useCallback(
    (buoc: number) =>
      setDangDoc((i) => (i === null ? null : (i + buoc + items.length) % items.length)),
    [items.length],
  );

  // Phím mũi tên để lật trang, Escape để đóng — khung đọc chiếm cả màn hình nên
  // bắt buộc phải có đường thoát bằng bàn phím.
  useEffect(() => {
    if (dangDoc === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dong();
      if (e.key === "ArrowRight") chuyen(1);
      if (e.key === "ArrowLeft") chuyen(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dangDoc, dong, chuyen]);

  // Khoá cuộn nền khi đang đọc, nếu không thì cuộn trong khung sẽ kéo cả trang.
  useEffect(() => {
    if (dangDoc === null) return;
    const cu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = cu;
    };
  }, [dangDoc]);

  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="mx-auto mb-5 max-w-7xl px-6">
        <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
          {t.portfolio.profileHeading}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{t.portfolio.profileHint}</p>
      </div>

      {/*
        Tràn ra sát mép màn hình có chủ ý: dải bị cắt ở mép là tín hiệu quen thuộc
        cho biết "còn nữa, kéo tiếp đi" — bo gọn trong khung thì trông như đã hết.
        `snap-x` để mỗi lần kéo dừng đúng đầu một trang thay vì dừng lưng chừng.
      */}
      <div className="dai-ngang flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4">
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDangDoc(i)}
            aria-label={`${t.portfolio.profilePage} ${i + 1}${p.title ? ` — ${p.title}` : ""}`}
            className="border-border/60 bg-card group relative h-[300px] shrink-0 snap-start overflow-hidden rounded-xl border transition-transform duration-200 hover:-translate-y-1 md:h-[420px]"
          >
            {/*
              Ảnh để `h-full w-auto`: chiều cao khoá cứng, bề ngang tự co theo tỉ
              lệ gốc. Đây là chỗ duy nhất giữ được cả chín trang không bị cắt cúp
              dù tỉ lệ chênh nhau gấp đôi.
            */}
            <img
              src={resolveAssetUrl(p.image)}
              alt={p.title || `${t.portfolio.profileHeading} — ${t.portfolio.profilePage} ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-auto max-w-none object-contain"
            />
            <span className="bg-background/80 text-foreground absolute top-2 left-2 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-sm">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* ── Khung đọc ──────────────────────────────────────────────────────── */}
      {dangDoc !== null && items[dangDoc] && (
        <div
          className="bg-background/95 animate-in fade-in fixed inset-0 z-[70] flex flex-col duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={`${t.portfolio.profilePage} ${dangDoc + 1}`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground text-sm tabular-nums">
              {t.portfolio.profilePage} {dangDoc + 1}/{items.length}
            </span>
            <button
              type="button"
              onClick={dong}
              aria-label={t.portfolio.closeReader}
              className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Cuộn dọc được: trang cao gấp rưỡi màn hình thì vẫn đọc hết. */}
          <div className="flex-1 overflow-auto px-4 pb-4">
            <img
              src={resolveAssetUrl(items[dangDoc].image)}
              alt={items[dangDoc].title || `${t.portfolio.profilePage} ${dangDoc + 1}`}
              className="mx-auto w-full max-w-4xl rounded-lg"
            />
          </div>

          <div className="flex items-center justify-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => chuyen(-1)}
              aria-label={t.portfolio.prevPage}
              className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            >
              <CaretLeftIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => chuyen(1)}
              aria-label={t.portfolio.nextPage}
              className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            >
              <CaretRightIcon size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileStrip;
