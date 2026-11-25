import { useEffect, useRef } from "react";

/**
 * Vệt sáng vàng bám đuôi con trỏ chuột (kiểu 07 Hoàn chọn 25/11/2026 từ 7 mẫu
 * thử trong artifact "Con trỏ Bee Z"). Gợi vệt sáng nét chớp của logo Bee Z.
 *
 * VÌ SAO VIẾT TAY BẰNG DOM + requestAnimationFrame thay vì state React: chuột
 * bắn hàng chục sự kiện mỗi giây; đi qua setState thì cả cây dựng lại liên tục.
 * Ở đây React chỉ dựng 10 chấm một lần, còn vị trí ghi thẳng vào style.
 *
 * Chỉ bật khi máy có chuột thật (hover + con trỏ chính xác). Điện thoại, máy
 * tính bảng và ai bật "giảm chuyển động" thì không thấy gì. Mũi tên chuột thật
 * giữ nguyên: vệt chỉ trang trí, không thay con trỏ, nên không ảnh hưởng thao tác.
 * Vòng lặp chỉ chạy khi vệt còn di chuyển; chuột đứng yên là dừng, không tốn CPU.
 */
const SO_CHAM = 10;
const NONG = "a, button, [role='button'], summary, label, input, select, textarea";

const VetSangChuot = () => {
  const khung = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goc = khung.current;
    if (!goc) return;
    const coChuot = window.matchMedia("(hover: hover) and (pointer: fine)");
    const giam = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!coChuot.matches || giam.matches) return;

    const cham = Array.from(goc.children) as HTMLElement[];
    const vt = cham.map(() => ({ x: -100, y: -100 }));
    const dich = { x: -100, y: -100 };
    let nong = false;
    let hien = false;
    let chay = false;

    const ve = () => {
      let conChay = false;
      for (let i = 0; i < SO_CHAM; i++) {
        const theo = i === 0 ? dich : vt[i - 1];
        const k = i === 0 ? 0.45 : 0.38;
        vt[i].x += (theo.x - vt[i].x) * k;
        vt[i].y += (theo.y - vt[i].y) * k;
        const to = nong && i === 0 ? 2.2 : 1;
        cham[i].style.transform = `translate3d(${vt[i].x}px, ${vt[i].y}px, 0) scale(${to})`;
        if (Math.abs(theo.x - vt[i].x) + Math.abs(theo.y - vt[i].y) > 0.3) conChay = true;
      }
      chay = conChay;
      if (chay) requestAnimationFrame(ve);
    };

    const diChuyen = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dich.x = e.clientX;
      dich.y = e.clientY;
      const t = e.target as Element | null;
      nong = !!t?.closest?.(NONG);
      if (!hien) {
        // Lần đầu (hoặc chuột vừa quay lại cửa sổ): đặt cả vệt tại chỗ chuột,
        // không thì nó bay vụt từ góc màn hình vào.
        vt.forEach((p) => { p.x = dich.x; p.y = dich.y; });
        hien = true;
        goc.style.opacity = "1";
      }
      if (!chay) { chay = true; requestAnimationFrame(ve); }
    };
    const roiCuaSo = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      hien = false;
      goc.style.opacity = "0";
    };

    document.addEventListener("pointermove", diChuyen, { passive: true });
    document.addEventListener("mouseout", roiCuaSo);
    return () => {
      document.removeEventListener("pointermove", diChuyen);
      document.removeEventListener("mouseout", roiCuaSo);
    };
  }, []);

  return (
    <div
      ref={khung}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9999 opacity-0 transition-opacity duration-300 print:hidden"
    >
      {Array.from({ length: SO_CHAM }, (_, i) => {
        const co = 12 - i * 0.9;
        return (
          <span
            key={i}
            className="absolute left-0 top-0 rounded-full bg-primary will-change-transform"
            style={{
              width: co,
              height: co,
              margin: `${-co / 2}px 0 0 ${-co / 2}px`,
              opacity: 1 - i / SO_CHAM,
              transform: "translate3d(-100px, -100px, 0)",
              boxShadow: `0 0 ${14 - i}px color-mix(in oklab, var(--color-primary) 70%, transparent)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default VetSangChuot;
