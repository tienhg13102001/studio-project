/**
 * Nhận diện bot cho bộ đếm lượt truy cập.
 *
 * VÌ SAO CÓ FILE NÀY — đo ngày 28/08/2026: bộ đếm nhảy từ 17 lên 224 chỉ sau
 * một đêm. Bới log nginx ra thì 349/354 địa chỉ đến từ nước ngoài, rải trên
 * hàng chục dải máy chủ thuê (33 IP dải 47.128 của AWS Singapore, 22 IP dải
 * 192.161, 14 IP dải 128.242…), trung bình 1,7 lượt mỗi IP — vào, chạm một
 * cái, đi ngay. Khách thật mở một trang là kéo theo hàng chục lượt vì còn tải
 * ảnh và font. Riêng Bytespider (bot của ByteDance) gọi 1.010 lượt từ 75 địa
 * chỉ, và nó CHẠY JAVASCRIPT nên bộ đếm tính nó như người thật.
 *
 * Một con số mà 9 phần 10 là bot thì không dùng để đo marketing được.
 *
 * KHÔNG VỨT SỐ LIỆU: chỗ gọi hàm này vẫn ghi lượt bot vào một chiều riêng
 * (`dim: "bot"`), chỉ không cộng vào tổng. Nhờ đó vẫn xem được hôm nay lọc ra
 * bao nhiêu, và nếu lọc nhầm thì nhìn ra ngay.
 *
 * BA LỚP, xếp từ chắc chắn nhất xuống:
 *
 *   1. Không khai trình duyệt — trình duyệt thật LUÔN tự khai. Bốn địa chỉ
 *      Azure quét lỗ hổng hôm 28/08 (1.900 lượt, đòi /wp.php, /8.php…) đều
 *      thuộc loại này.
 *   2. Tên bot nằm ngay trong dòng khai báo — Bytespider, Googlebot, và mọi
 *      thứ tự nhận là bot/spider/crawler.
 *   3. Địa chỉ thuộc dải máy chủ thuê — bắt được loại giả danh Chrome.
 *
 * Lớp 3 là lớp DUY NHẤT có thể bắt nhầm: khách thật ngồi sau VPN công ty cũng
 * có thể mang địa chỉ dải máy chủ. Nên nó để cuối, và danh sách dải bên dưới
 * chỉ gồm những dải đã ĐO ĐƯỢC là đang quấy, cộng vài nhà cung cấp đám mây lớn
 * mà lưu lượng người thật gần như bằng không. Sửa danh sách này an toàn.
 */

export type KetQuaNhanDien = {
  laBot: boolean;
  /** Lý do, dùng làm khoá thống kê để nhìn ra bộ lọc đang bắt cái gì. */
  viSao: string;
};

/** Tên tự khai của bot. Cố ý để rộng — thứ gì tự nhận là bot thì đúng là bot. */
const TEN_BOT =
  /bot\b|bot\/|spider|crawler|crawling|scrap(er|y)|headless|phantomjs|puppeteer|playwright|slurp|archiver|fetcher|monitor|preview|检查|bytespider|censys|zgrab|masscan|nuclei|libredtail|flowiq|crusader|semrush|ahrefs|mj12|dotbot|dataforseo|serpstat|petal|barkrowler|seekport|linkdex/i;

/**
 * Dải địa chỉ máy chủ thuê.
 *
 * Ghi theo tiền tố chuỗi để khỏi kéo thêm thư viện tính mạng con. Đủ dùng vì
 * chỉ cần chặn ở mức /8 và /16.
 *
 * NHÓM A — đã đo được đang quấy beezvn.com ngày 28/08/2026.
 * NHÓM B — nhà cung cấp đám mây lớn, người thật gần như không duyệt web từ đó.
 */
const DAI_MAY_CHU_THUE = [
  // ── Nhóm A: đo được ngày 28/08/2026 ──
  "47.128.", // AWS Singapore — 33 địa chỉ
  "192.161.", // 22 địa chỉ
  "128.242.", // 14 địa chỉ
  "106.49.", // 14 địa chỉ
  "192.204.", // 13 địa chỉ
  "152.39.", // 12 địa chỉ
  "72.63.", // 10 địa chỉ
  "155.94.", // 10 địa chỉ
  "104.223.",
  "104.222.",
  "104.164.",
  "161.123.",
  "140.174.",
  "198.55.",
  "188.241.",

  // ── Nhóm B: đám mây lớn ──
  "20.", // Microsoft Azure
  "40.", // Microsoft Azure
  "52.", // AWS + Azure
  "54.", // AWS
  "57.155.", // Azure Hong Kong — đã đo, giả danh Chrome
  "34.", // Google Cloud
  "35.", // Google Cloud
  "3.", // AWS
  "18.", // AWS
];

/**
 * Hệ điều hành cũ tới mức không còn người thật nào dùng.
 *
 * ĐÂY LÀ LUẬT BẮT ĐƯỢC NHIỀU NHẤT, và lý do nó tồn tại đáng ghi lại:
 *
 * Ngày 28/08/2026, trong 358 địa chỉ gọi vào bộ đếm thì **244 địa chỉ (68%)
 * khai CHUNG MỘT chuỗi y hệt nhau** — iPhone chạy iOS 13.2.3. Bản đó phát hành
 * tháng 11/2019. Cả ngày chỉ có ĐÚNG MỘT địa chỉ khai iOS đời mới (18.7).
 *
 * Hàng trăm khách khác nhau cùng dùng một bản iOS bảy năm tuổi là chuyện không
 * thể. Đó là một mạng bot thuê hàng trăm proxy rồi cắm cứng một chuỗi giả.
 *
 * NGƯỠNG CHỌN RỘNG RÃI CÓ CHỦ Ý:
 *   · iOS dưới 14  — iOS 14 ra tháng 9/2020. Người dùng iPhone cập nhật rất
 *     nhanh, dưới mức này gần như không còn ai.
 *   · Android dưới 7 — Android 7 ra năm 2016, đã mười năm. Để 7 thay vì 8 cho
 *     chắc, vì máy Android giá rẻ ở Việt Nam sống lâu hơn iPhone.
 *
 * Lỡ có bỏ sót một khách thật đang dùng máy mười năm tuổi thì vẫn đáng, so với
 * việc đếm nhầm 244 con bot.
 */
function heDieuHanhQuaCu(ua: string): boolean {
  const ios = /iPhone OS (\d+)/.exec(ua) ?? /CPU OS (\d+)/.exec(ua);
  if (ios && Number(ios[1]) < 14) return true;

  const android = /Android (\d+)/.exec(ua);
  if (android && Number(android[1]) < 7) return true;

  return false;
}

/**
 * @param ua  Dòng khai báo trình duyệt (`user-agent`)
 * @param ip  Địa chỉ IP đã tách ra từ header proxy
 */
export function nhanDienBot(ua: string | undefined, ip: string): KetQuaNhanDien {
  const chuoi = (ua ?? "").trim();

  if (!chuoi) return { laBot: true, viSao: "khong-khai-trinh-duyet" };
  if (TEN_BOT.test(chuoi)) return { laBot: true, viSao: "tu-khai-la-bot" };

  // Dòng khai báo quá ngắn để là trình duyệt thật. Chuỗi của Chrome/Safari
  // thật luôn dài trên 40 ký tự vì còn kèm hệ điều hành và phiên bản.
  if (chuoi.length < 25) return { laBot: true, viSao: "khai-bao-qua-ngan" };

  if (heDieuHanhQuaCu(chuoi)) return { laBot: true, viSao: "he-dieu-hanh-qua-cu" };

  if (DAI_MAY_CHU_THUE.some((d) => ip.startsWith(d)))
    return { laBot: true, viSao: "dai-may-chu-thue" };

  return { laBot: false, viSao: "" };
}
