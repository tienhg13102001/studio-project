import type { FC } from "react";
import { DUONG_LOGO } from "../../assets/icons/LogoYellow";

/**
 * Dấu hiệu Bee Z với một vệt sáng chạy dọc ĐÚNG đường viền của chính nó.
 *
 * VÌ SAO LÀM THẾ NÀY CHỨ KHÔNG PHẢI TIA SÉT BAY QUANH: cái nét vàng vắt chéo
 * qua chữ B vốn đã là hình một tia chớp, nên cho điện chạy theo đường viền là
 * làm rõ thứ có sẵn trong dấu hiệu thương hiệu, không phải dán thêm một hình lạ
 * vào. Nó cũng vẽ lại chính hình logo mỗi vòng chạy — vừa là hiệu ứng vừa là
 * cách khoe logo. Hoàn đã xem thử năm kiểu và chốt kiểu này ngày 22/08/2026.
 *
 * CÁCH CHẠY: vẽ chồng lên bản tô đặc hai nét viền `fill:none`, cắt thành nét
 * đứt rất ngắn rồi trượt điểm bắt đầu của nét đứt đi hết một vòng. Vì đường vẽ
 * gồm ba đoạn rời (thân chữ B và hai khoảng rỗng bên trong) nên nét đứt chạy
 * xuyên qua cả ba — vệt sáng đi hết mọi ngóc ngách của hình.
 *
 * `pathLength={1000}` chuẩn hoá độ dài đường về 1000 đơn vị, nhờ đó độ dài nét
 * đứt khai trong CSS không phụ thuộc kích thước hiển thị: logo cao 64px trên
 * điện thoại hay 96px trên máy tính đều cho vệt sáng dài bằng nhau theo tỷ lệ.
 */
const LogoTiaDien: FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 377.38 383.63"
      // Nét sáng có quầng mờ toả rộng hơn khung hình. Thiếu dòng này là quầng
      // bị cắt cụt ở rìa và vệt sáng trông như bị gọt.
      style={{ overflow: "visible" }}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="tia-quang" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="m" />
          <feMerge>
            <feMergeNode in="m" />
            <feMergeNode in="m" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tia-quang-nhe" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="m" />
          <feMerge>
            <feMergeNode in="m" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={DUONG_LOGO} style={{ fill: "#ffc100", strokeWidth: 0 }} />

      {/* Hai vệt lệch nhau nửa vòng: một lõi trắng nóng đi trước, một vệt vàng
          bám sau. Chỉ một vệt thì logo có quãng dài im lìm, hai vệt thì lúc nào
          cũng có ánh sáng ở đâu đó trên hình mà vẫn không thành viền sáng đều. */}
      <path
        className="tia-vien"
        d={DUONG_LOGO}
        fill="none"
        stroke="#fff3c4"
        strokeWidth={7.28}
        strokeLinecap="round"
        pathLength={1000}
        filter="url(#tia-quang)"
      />
      <path
        className="tia-vien tia-vien-sau"
        d={DUONG_LOGO}
        fill="none"
        stroke="#ffc100"
        strokeWidth={5.2}
        strokeLinecap="round"
        pathLength={1000}
        filter="url(#tia-quang-nhe)"
      />
    </svg>
  );
};

export default LogoTiaDien;
