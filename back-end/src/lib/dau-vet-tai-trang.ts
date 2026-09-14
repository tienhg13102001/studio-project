import { createHash } from "crypto";

/**
 * Ghi nhớ địa chỉ nào đã THẬT SỰ tải nội dung trang, để bộ đếm chỉ tính những
 * ai đã mở web chứ không tính kẻ gọi thẳng vào địa chỉ API.
 *
 * VÌ SAO CẦN — đo ngày 29/08/2026: bộ lọc theo tên trình duyệt và dải địa chỉ
 * đã chặn được 514 lượt bot, nhưng vẫn còn 48 con lọt. Bới log ra thì thấy
 * chúng có một điểm chung không giấu được:
 *
 *   8 khách thật : 287 lượt tải file giao diện + 216 lượt tải ảnh + đủ bộ API
 *   39 con bot   : gọi ĐÚNG /api/visitors rồi biến. Không tải một tấm ảnh nào.
 *
 * KHÔNG CHẶN ĐƯỢC BẰNG DẢI ĐỊA CHỈ: 39 con đó nằm trên 29 dải mạng khác nhau,
 * mỗi con một mạng — proxy xoay vòng, hôm nay chặn thì mai chúng đổi hết. Tệ
 * hơn, dải `119.13.` chứa CẢ một con bot LẪN một khách thật (52 lượt, tải đủ
 * ảnh). Chặn theo dải là xoá mất khách thật.
 *
 * Nên chuyển sang hỏi hành vi: "mày đã tải nội dung trang chưa?". Bot gọi mù
 * không trả lời nổi câu đó, mà không cần đoán nó là ai.
 *
 * ĐÃ ĐO TRÊN DỮ LIỆU THẬT: luật này cho qua 8/8 khách thật và chặn 39/39 bot.
 *
 * VÌ SAO KHÔNG LẤY `/api/settings` LÀM MỐC: giao diện gọi nó SAU
 * `/api/visitors` ở 6 trên 8 khách. Lấy settings làm mốc là chặn nhầm gần hết
 * khách thật.
 *
 * ── LỖI NẶNG ĐÃ SỬA NGÀY 11/09/2026 ───────────────────────────────────────
 *
 * Bản đầu đăng ký mốc bằng `router.get(["/services", "/landing", "/contact"])`.
 * `router.get` khớp CHÍNH XÁC, nên `/api/services` khớp còn
 * `/api/services/san-xuat-tvc` thì không. Trang dự án lại chỉ gọi
 * `/api/projects/by-slug/<tên>` rồi `/api/services/<tên>`.
 *
 * Nghĩa là khách vào THẲNG một trang dự án không bao giờ để lại dấu vết, và
 * hàm này trả về false cho họ — bộ đếm xếp họ vào "gọi mù" rồi loại bỏ. Loại
 * trúng toàn bộ khách đến từ Google và từ link chia sẻ.
 *
 * Đo được: số khách mỗi ngày rơi từ 12-23 xuống 1-9 ngay sau khi bộ lọc lên,
 * và `goi-mu-chua-tai-trang` thành lý do chặn nhiều nhất gần như mọi ngày.
 * Phép thử trực tiếp ngày 11/09: mô phỏng khách vào thẳng /du-an/masterise thì
 * tổng đứng yên ở 1096, mô phỏng khách vào trang chủ thì tổng lên 1097.
 *
 * Nay `routes/index.ts` dùng `router.use(path)` — khớp cả đường dẫn con.
 *
 * BÀI HỌC GIỮ LẠI: một bộ lọc im lặng loại bỏ dữ liệu thì sai của nó không kêu
 * lên. Chỗ cứu được là chiều `bot` vẫn ghi lý do — nhìn vào đó mới thấy
 * "gọi mù" cao bất thường. Đừng bao giờ bỏ phần ghi lại lý do bị chặn.
 *
 * NHỚ TRONG BỘ NHỚ, KHÔNG GHI CƠ SỞ DỮ LIỆU: đây là dấu vết sống vài phút, ghi
 * xuống đĩa chỉ tổ đẻ rác. Đổi lại, khởi động lại máy chủ là mất sạch — khách
 * đang mở trang dở đúng lúc đó sẽ không được tính, nhưng lần vào sau vẫn tính
 * bình thường. Đánh đổi chấp nhận được.
 */

/** Dấu vết sống bao lâu. Đủ dài cho mạng chậm, đủ ngắn để không phình bộ nhớ. */
const SONG_MS = 15 * 60 * 1000;

/** Trần số bản ghi, phòng trường hợp bị dội hàng loạt địa chỉ giả. */
const TRAN = 20_000;

const daThay = new Map<string, number>();

/** Băm địa chỉ IP — không giữ địa chỉ thật trong bộ nhớ. */
function bam(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/** Dọn bản ghi hết hạn. Gọi khi ghi mới, đủ để bộ nhớ không lớn dần mãi. */
function don(bayGio: number): void {
  for (const [k, t] of daThay) {
    if (bayGio - t > SONG_MS) daThay.delete(k);
  }
}

/** Đánh dấu địa chỉ này vừa tải nội dung trang. */
export function ghiNhanTaiTrang(ip: string): void {
  const bayGio = Date.now();
  if (daThay.size > TRAN) don(bayGio);
  daThay.set(bam(ip), bayGio);
}

/** Địa chỉ này có tải nội dung trang trong 15 phút qua không. */
export function daTaiTrang(ip: string): boolean {
  const t = daThay.get(bam(ip));
  if (t === undefined) return false;
  if (Date.now() - t > SONG_MS) {
    daThay.delete(bam(ip));
    return false;
  }
  return true;
}

/**
 * Đợi dấu vết tới trong một khoảng ngắn thay vì phán ngay.
 *
 * VÌ SAO — đo log nginx 72 giờ tới 14/09/2026: 5 trên 13 khách thật bị chặn
 * nhầm vì yêu cầu ĐẾM tới backend TRƯỚC yêu cầu TẢI NỘI DUNG. Bộ đếm nằm ở
 * Footer, thuộc gói JavaScript chính, chạy ngay khi mở trang; còn mọi trang nội
 * dung đều tải lười (`lazy()`), phải tải thêm một mảnh mã rồi mới gọi API. Hai
 * yêu cầu đua nhau, thứ tự tới là ngẫu nhiên. Phép đo "8/8" ngày 29/08 là trúng
 * may, và bản vá đường dẫn ngày 11/09 mới chữa được một nửa.
 *
 * Người thật gửi yêu cầu nội dung trong vòng một giây quanh đó. Bot gọi mù thì
 * không bao giờ gửi. Nên đợi vài giây là tách được hai loại mà không phải sửa
 * thứ tự bên giao diện — thứ tự đó sẽ lại vỡ lần tới có ai thêm một trang.
 *
 * Cái giá là yêu cầu của bot bị giữ lại vài giây. Vài chục lượt bot mỗi ngày
 * thì không đáng kể, còn khách thật không phải chờ: dấu vết tới là trả lời ngay.
 */
export async function choDauVet(ip: string, toiDaMs = 5000, buocMs = 200): Promise<boolean> {
  const het = Date.now() + toiDaMs;
  while (Date.now() < het) {
    if (daTaiTrang(ip)) return true;
    await new Promise((xong) => setTimeout(xong, buocMs));
  }
  return daTaiTrang(ip);
}
