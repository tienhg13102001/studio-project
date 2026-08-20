import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlayIcon } from "@phosphor-icons/react";
import { useLanguage, useTranslation } from "#i18n";
import { resolveAssetUrl } from "#lib/api";
import { localized } from "#lib/localized";
import { duongDanDuAn } from "#lib/urls";
import type { ApiProject } from "#lib/apiTypes";

/**
 * Thư viện dự án — thứ khách thật sự tới trang Portfolio để xem.
 *
 * VÌ SAO CÓ KHỐI NÀY: 66 dự án kèm video của Bee Z trước đây chỉ tới được qua
 * trang Dịch vụ, phải bấm hai lần mới thấy. Còn trang Portfolio — chỗ tự nhiên
 * nhất để đánh giá một hãng phim — lại là chín tấm ảnh tĩnh không bấm được vào
 * đâu. Đo trên trang thật: 9 ảnh, 0 chỗ bấm, 0 video, cao 13.122px.
 *
 * VÌ SAO LỌC THEO DỊCH VỤ: khách tới đây gần như luôn mang sẵn một việc cụ thể
 * — cần TVC, cần quay sự kiện, cần ảnh món ăn. Bắt họ lướt qua 66 dự án để tìm
 * ba cái giống việc của mình là cách chắc nhất để họ bỏ đi. Lọc ngay trên mảng
 * đã tải, không gọi thêm máy chủ.
 *
 * Mỗi thẻ dẫn tới địa chỉ riêng của dự án (/du-an/<tên>) nên chia sẻ được, và
 * là thẻ `Link` thật chứ không phải `div` bắt sự kiện bấm — máy tìm kiếm mới lần
 * theo được, và người dùng bàn phím mới tới được.
 */
type Props = {
  projects: ApiProject[];
};

const WorkLibrary = ({ projects }: Props) => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [locTheo, setLocTheo] = useState<string>("*");

  /**
   * Danh sách mảng việc dựng TỪ CHÍNH dự án đang có, không phải từ danh sách
   * dịch vụ: dịch vụ chưa có dự án nào mà vẫn hiện nút lọc thì bấm vào ra màn
   * hình trống — lỗi trông như web hỏng.
   */
  const mang = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) {
      const dv = p.service;
      if (!dv || typeof dv === "string") continue;
      if (!m.has(dv.id)) m.set(dv.id, localized(dv.title, lang) || dv.tag);
    }
    return [...m.entries()].map(([id, ten]) => ({ id, ten }));
  }, [projects, lang]);

  const hienThi = useMemo(() => {
    if (locTheo === "*") return projects;
    return projects.filter((p) => typeof p.service === "object" && p.service?.id === locTheo);
  }, [projects, locTheo]);

  if (projects.length === 0) return null;

  const nutLoc = [{ id: "*", ten: t.portfolio.all }, ...mang];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="mb-6">
        <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
          {t.portfolio.worksHeading}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {hienThi.length} {t.portfolio.projectCount} · {t.portfolio.worksHint}
        </p>
      </div>

      {/*
        Trên điện thoại CUỘN NGANG, trên máy tính xuống dòng.

        Tên dịch vụ tiếng Anh dài (“Wedding Photography & Videography”), để xuống
        dòng trên màn 390px thì bảy nút ăn hết bốn dòng — đẩy lưới dự án xuống
        gần cuối màn hình đầu, đúng thứ khách vào đây để xem. Cuộn ngang gói lại
        còn một dòng. Bề ngang đủ rộng thì xuống dòng vẫn dễ nhìn hơn nên máy tính
        giữ nguyên cách cũ.
      */}
      <div
        className="dai-ngang -mx-6 mb-7 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
        role="group"
        aria-label={t.portfolio.worksHint}
      >
        {nutLoc.map((m) => {
          const dangChon = m.id === locTheo;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setLocTheo(m.id)}
              aria-pressed={dangChon}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                dangChon
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {m.ten}
            </button>
          );
        })}
      </div>

      {hienThi.length === 0 ? (
        <p className="text-muted-foreground py-14 text-center text-sm">
          {t.portfolio.emptyFilter}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {hienThi.map((p) => {
            const dv = typeof p.service === "object" ? p.service : null;
            return (
              <li key={p.id}>
                <Link
                  to={duongDanDuAn(p, dv ?? { id: "" })}
                  /* Cờ để nút X trong trang dự án biết đường lùi về đây. */
                  state={{ tuTrongWeb: true }}
                  className="border-border/60 bg-card group focus-visible:outline-primary block overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {/*
                    Khung tỉ lệ cố định TRƯỚC khi ảnh về: không có nó thì lúc ảnh
                    tải xong cả lưới giật xuống một nhịp. Ảnh gốc đủ mọi tỉ lệ nên
                    `object-cover` là cách duy nhất giữ lưới thẳng hàng.
                  */}
                  <div className="bg-muted relative aspect-[4/3] overflow-hidden">
                    <img
                      src={resolveAssetUrl(p.thumbnailImage)}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.video && (
                      <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <PlayIcon size={10} weight="fill" /> VIDEO
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
                      {p.title}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                      {dv ? localized(dv.title, lang) || dv.tag : ""}
                      {p.shootLocation ? ` · ${p.shootLocation}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default WorkLibrary;
