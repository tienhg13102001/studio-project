import SectionHeader from "#components/molecules/SectionHeader";
import { useProjects } from "#hooks/useProjects";
import { useLanguage, useTranslation } from "#i18n";
import { resolveAssetUrl, srcSetAnh } from "#lib/api";
import { useEffect, useRef, useState } from "react";

/**
 * Quy trình làm việc — năm bước từ cuộc gọi đầu tới lúc giao file.
 *
 * VÌ SAO CÓ KHỐI NÀY: trang chủ trước đó đi thẳng từ hình ảnh sản phẩm sang lời
 * mời liên hệ, không chỗ nào trả lời câu khách lần đầu luôn hỏi — làm việc với
 * Bee Z diễn ra thế nào, mất bao lâu.
 *
 * BỐ CỤC MỚI (24/11/2026, mục G7 — Hoàn duyệt): bản chồng thẻ cũ dài 3,7 màn
 * (34% chiều dài trang chủ) cho 5 bước mỗi bước hai dòng, nửa màn trống. Giờ:
 *   · Máy tính: khung ẢNH THẬT đứng yên bên trái, đổi ảnh theo bước đang đọc bên
 *     phải — chính là ý "hình chạy theo thanh cuộn" Hoàn duyệt từ tháng 7, dùng
 *     ảnh hậu trường thật vì không có video hậu trường. Cả khối ~2,3 màn.
 *   · Điện thoại: mỗi bước một ảnh ngay trên chữ, xếp dọc, không dính.
 *   · Giảm chuyển động: ảnh đổi tức thì, không mờ dần.
 */

/**
 * Ảnh cho từng bước — ảnh thật trong dữ liệu dự án (Portal). Chọn lại 25/11/2026
 * vì Hoàn chê bộ cũ (4 ảnh hậu trường tối, mặt người sát khung): giờ chủ yếu là
 * ảnh highlight sự kiện, chỉ 2 ảnh hậu trường ở hai bước làm việc tại hiện trường.
 * Khung máy tính cắt dọc 4:5, điện thoại 16:9 → chọn ảnh có chủ thể ở giữa.
 * Lấy lúc chạy theo tên dự án + số thứ tự ảnh, không chép cứng địa chỉ ảnh: dự
 * án đổi ảnh vẫn chạy; dự án bị xoá thì lùi về ảnh bìa các dự án khác.
 */
const ANH_BUOC: { slug: string; anh: number }[] = [
  { slug: "chuong-trinh-nghe-thuat-ket-noi-yeu-thuong", anh: 9 }, // cúp vàng giữa sân khấu (ảnh Techcombank dính logo cắt dở ở mép)
  { slug: "concert-of-childhood-memory-to-the-light", anh: 0 }, // dàn nhạc, màn LED tròn đỏ
  { slug: "bts-su-kien-techcombank-summit-2026", anh: 3 }, // quay phim chỉnh máy, ánh xanh
  { slug: "bts-su-kien-techcombank-summit-2026", anh: 7 }, // đang quay, nhìn ra sân khấu
  { slug: "chuong-trinh-nghe-thuat-ket-noi-yeu-thuong", anh: 11 }, // ca sĩ áo dài trắng
];

const ProcessSection = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const steps = t.process.steps;
  const { raw } = useProjects(lang);
  const [dangXem, setDangXem] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  const tatCa = [...(raw?.verticalCards ?? []), ...(raw?.horizontalCards ?? [])];
  const anh = ANH_BUOC.map((a, i) => {
    const p = tatCa.find((x) => x.slug === a.slug);
    const url = p?.photos?.[a.anh] ?? tatCa[i]?.thumbnailImage;
    return url ? resolveAssetUrl(url) : "";
  });

  // Bước nằm giữa màn hình là bước "đang xem" → khung ảnh bên trái đổi theo.
  useEffect(() => {
    const ob = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) setDangXem(Number((e.target as HTMLElement).dataset.buoc));
      }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && ob.observe(el));
    return () => ob.disconnect();
  }, [steps.length]);

  return (
    <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader title={t.process.sectionTitle} subtitle={t.process.sectionSubtitle} />

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14">
          {/* Khung ảnh đứng yên — chỉ máy tính. */}
          <div className="hidden md:block">
            <div className="border-border/60 bg-card sticky top-[15vh] aspect-4/5 max-h-[70vh] w-full overflow-hidden rounded-2xl border">
              {anh.map((src, i) =>
                src ? (
                  <img
                    key={i}
                    src={src}
                    srcSet={srcSetAnh(src)}
                    sizes="(min-width: 1152px) 560px, 45vw"
                    alt={steps[i]?.title ?? ""}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                      i === dangXem ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : null,
              )}
              <div className="from-background/70 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t to-transparent" />
              <span className="text-primary absolute bottom-5 left-6 text-6xl leading-none font-bold tabular-nums">
                {String(dangXem + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          <ol className="flex flex-col">
            {steps.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => { refs.current[i] = el; }}
                data-buoc={i}
                className="flex flex-col justify-center py-6 md:min-h-[46vh] md:py-0"
              >
                {/* Ảnh của bước — chỉ điện thoại (máy tính đã có khung bên trái). */}
                {anh[i] && (
                  <img
                    src={anh[i]}
                    srcSet={srcSetAnh(anh[i])}
                    sizes="100vw"
                    alt={step.title}
                    loading="lazy"
                    decoding="async"
                    className="border-border/60 mb-5 aspect-video w-full rounded-2xl border object-cover md:hidden"
                  />
                )}
                <div
                  // Tên lớp phải viết ĐỦ ("md:opacity-40"): Tailwind chỉ sinh lớp có
                  // nguyên văn trong mã, ghép chuỗi "md:" + "opacity-40" là mất.
                  className={`transition-opacity duration-500 motion-reduce:transition-none ${
                    i === dangXem ? "md:opacity-100" : "md:opacity-40"
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-primary/80 text-xs font-bold tracking-[0.16em]">{t.process.stepLabel}</span>
                    <span className="text-primary text-4xl leading-none font-bold tabular-nums md:text-5xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-foreground mt-3 text-2xl font-semibold md:text-3xl">{step.title}</h3>
                  <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed md:text-lg">{step.desc}</p>
                  <span className="border-primary/25 text-primary mt-4 inline-block w-fit rounded-full border px-3 py-1 text-xs font-medium">
                    {step.when}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
