/**
 * Dựng khối link nội bộ để nhét vào HTML tĩnh của từng trang.
 *
 * VÌ SAO CẦN — đây là nguyên nhân gốc khiến 48 trang không được lập chỉ mục:
 *
 * Web là một ứng dụng chạy bằng JavaScript, nên HTML thô mà Google nhận ở lượt
 * quét ĐẦU TIÊN có đúng `<div id="root"></div>` rỗng — KHÔNG MỘT THẺ <a> NÀO.
 * Đo ngày 21/08/2026: trang chủ 0 link, trang portfolio 0 link, trang dịch vụ
 * 0 link. Phải chạy JavaScript xong mới có 66 link tới dự án.
 *
 * Google biết 78 địa chỉ kia chỉ nhờ sitemap. Nhưng sitemap chỉ nói "mấy trang
 * này TỒN TẠI", còn link nội bộ mới nói "mấy trang này QUAN TRỌNG". Không trang
 * nào trỏ tới thì Google xếp vào diện chờ — đúng cái Search Console gọi là
 * "Đã phát hiện thấy – hiện chưa được lập chỉ mục", 48 trang, khớp chính xác
 * số địa chỉ trong sitemap chưa được lập chỉ mục (78 − 30).
 *
 * KHÔNG PHẢI LINK ẨN. Đây là đúng những link mà ứng dụng cũng dựng ra sau khi
 * chạy — trang portfolio thật sự có đủ 66 link này. Khối bên dưới nằm trong
 * `#root` nên React thay thế nó ngay khi khởi động; nó chỉ tồn tại cho lượt
 * quét đầu và cho ai tắt JavaScript.
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const a = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;

/**
 * @param {object} p
 * @param {{path:string,title:string}[]} p.dichVu    6 trang dịch vụ
 * @param {{path:string,title:string,dichVuPath?:string}[]} p.duAn  66 trang dự án
 * @param {string} p.duongDanHienTai  đường dẫn của chính trang đang dựng
 * @param {"tinh"|"dich-vu"|"du-an"} p.loai
 */
export function khoiLienKet({ dichVu, duAn, duongDanHienTai, loai, noiDung }) {
  const phan = [];

  // Chữ thật của trang đi TRƯỚC danh sách link — xem chú thích khoiNoiDung().
  if (noiDung) phan.push(noiDung);

  // Luôn có: đường về các trang chính. Đây là bộ khung mọi trang đều trỏ tới
  // nhau, thứ mà một web tĩnh bình thường có sẵn còn ứng dụng JavaScript thì
  // không.
  phan.push(
    `<nav aria-label="Trang chính"><ul>` +
      [
        a("/", "Trang chủ"),
        a("/service", "Dịch vụ"),
        a("/portfolio", "Portfolio"),
        a("/team", "Đội ngũ"),
        a("/contact", "Liên hệ"),
      ]
        .map((x) => `<li>${x}</li>`)
        .join("") +
      `</ul></nav>`,
  );

  // Sáu trang dịch vụ — có mặt ở mọi trang, đúng như một thanh menu thật.
  const dv = dichVu
    .filter((s) => s.path !== duongDanHienTai)
    .map((s) => `<li>${a(s.path, s.title)}</li>`)
    .join("");
  if (dv) phan.push(`<nav aria-label="Các mảng dịch vụ"><ul>${dv}</ul></nav>`);

  /**
   * Danh sách dự án CHỈ đặt ở trang portfolio và ở trang dịch vụ của chính nó.
   *
   * Nhét cả 66 link vào mọi trang thì mỗi link loãng đi và trông như nhồi link.
   * Đặt đúng chỗ mà người thật cũng bấm tới thì vừa đúng cấu trúc web, vừa dồn
   * được sức mạnh vào đường dẫn ngắn nhất: Trang chủ → Portfolio → Dự án.
   */
  if (loai === "tinh" && duongDanHienTai === "/portfolio") {
    const ds = duAn.map((p) => `<li>${a(p.path, p.title)}</li>`).join("");
    if (ds) phan.push(`<nav aria-label="Dự án đã thực hiện"><ul>${ds}</ul></nav>`);
  }

  if (loai === "dich-vu") {
    const cua = duAn.filter((p) => p.dichVuPath === duongDanHienTai);
    const ds = cua.map((p) => `<li>${a(p.path, p.title)}</li>`).join("");
    if (ds) phan.push(`<nav aria-label="Dự án thuộc mảng này"><ul>${ds}</ul></nav>`);
  }

  // Trang dự án: đường quay lên mảng cha và về portfolio, để Google hiểu thứ bậc
  // chứ không thấy 66 trang mồ côi nằm rời rạc.
  if (loai === "du-an") {
    const toi = duAn.find((p) => p.path === duongDanHienTai);
    const cha = toi?.dichVuPath ? dichVu.find((s) => s.path === toi.dichVuPath) : null;
    const ds = [a("/portfolio", "Xem tất cả dự án")];
    if (cha) ds.push(a(cha.path, cha.title));
    phan.push(
      `<nav aria-label="Xem thêm"><ul>${ds.map((x) => `<li>${x}</li>`).join("")}</ul></nav>`,
    );
  }

  if (!phan.length) return "";

  /**
   * BỌC TRONG KHỐI MẮT KHÔNG THẤY NHƯNG MÁY VẪN ĐỌC.
   *
   * Trước đây khối này để trần trong `#root`. Hồi còn màn hình chờ thì không ai
   * thấy vì lớp phủ che đúng khoảnh khắc đó. Bỏ màn hình chờ ngày 21/08 xong là
   * nó lộ ra: khách tải lại trang thấy nháy một nhịp danh sách chữ trắng trên
   * nền đen trước khi giao diện thật hiện lên. Hoàn báo đúng chỗ này.
   *
   * Dùng đúng cách mà trình đọc màn hình vẫn dùng để giấu chữ khỏi mắt mà không
   * giấu khỏi máy: thu về một điểm ảnh rồi cắt sạch phần tràn. KHÔNG dùng
   * `display:none` — cách đó giấu khỏi cả trình đọc màn hình, và máy tìm kiếm
   * cũng đánh giá thấp hơn.
   *
   * ĐÂY KHÔNG PHẢI LINK ẨN ĐỂ GIAN LẬN: đúng những link mà ứng dụng cũng dựng
   * ra sau khi chạy — trang portfolio thật sự có đủ 66 link này, chỉ là chúng
   * chỉ tồn tại sau khi có JavaScript. React thay thế nguyên khối này ngay khi
   * khởi động, nên nó chỉ sống được vài trăm mili giây.
   */
  const giau =
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;" +
    "overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0";
  return `<div style="${giau}">${phan.join("")}</div>`;
}

/**
 * Dựng phần chữ THẬT của trang dự án để nhét vào HTML tĩnh.
 *
 * VÌ SAO CẦN — đo ngày 04/09/2026 trên chính /du-an/masterise:
 *
 *   Bài case study trong cơ sở dữ liệu : 1.129 chữ
 *   Chữ có trong HTML thô              :     0
 *
 * Bài chỉ hiện ra sau khi trình duyệt chạy JavaScript. Google CÓ chạy JavaScript
 * nhưng ở hàng đợi thứ hai và tuỳ hứng — mà với trang nó đã xếp loại "mỏng,
 * không đáng lưu" thì nó ít có lý do quay lại lần hai. Nói cách khác: 21 bài đã
 * viết xong đang nằm sau một cánh cửa Google chưa chắc mở.
 *
 * Khối này cũng vá luôn một lỗ khác ít ai để ý: trước hôm nay HTML thô của trang
 * dự án KHÔNG CÓ MỘT THẺ <h1> NÀO. Máy tìm kiếm không có chỗ nào để đọc ra
 * "trang này nói về cái gì" ngoài thẻ <title>.
 *
 * ĐÂY KHÔNG PHẢI CHỮ ẨN ĐỂ GIAN LẬN — cùng một lập luận với khối link ở trên.
 * Đúng từng chữ mà ứng dụng cũng dựng ra sau khi chạy, và React thay thế nguyên
 * khối này ngay khi khởi động nên nó chỉ sống vài trăm mili giây. Giấu bằng
 * cách thu về một điểm ảnh (chứ không phải `display:none`) là để khách không
 * thấy nháy một nhịp chữ trắng trên nền đen — đúng lỗi Hoàn báo hôm 21/08.
 *
 * KHÔNG DÙNG <div>: hàm gọi thay `#root` bằng biểu thức dừng ở dấu `</div>`
 * đầu tiên, nên mọi thứ nhét vào trong phải tránh thẻ đó. Dùng <article>.
 *
 * @param {object} p
 * @param {string} p.ten        tên dự án, dựng thành <h1>
 * @param {object} [p.caseStudy]  { challenge:{vi}, approach:{vi} }
 */
export function khoiNoiDung({ ten, caseStudy }) {
  // Bài viết ngăn đoạn bằng dòng trắng. Giữ đúng cách ngăn đó thành <p> để máy
  // tìm kiếm đọc ra văn xuôi nhiều đoạn, không phải một khối chữ dính liền.
  const doan = (s) =>
    String(s ?? "")
      .split(/\n{2,}/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => `<p>${esc(x)}</p>`)
      .join("");

  const thuThach = doan(caseStudy?.challenge?.vi);
  const cachLam = doan(caseStudy?.approach?.vi);

  // Chưa có bài thì chỉ dựng mỗi <h1>. Vẫn hơn không có thẻ tiêu đề nào.
  if (!ten) return "";

  return (
    `<article><h1>${esc(ten)}</h1>` +
    (thuThach ? `<h2>Thử thách</h2>${thuThach}` : "") +
    (cachLam ? `<h2>Cách Bee Z làm</h2>${cachLam}` : "") +
    `</article>`
  );
}
