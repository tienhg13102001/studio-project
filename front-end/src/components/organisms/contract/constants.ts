// Shared constants for the /hop-dong contract builder UI.
// PAYMENT_PRESETS, DV_PRESETS and CONTRACT_CLAUSES are ported verbatim from
// back-end/scripts/google/hop-dong/index.html so the preview matches the printed doc.

/** Bee Z logo (Google Drive thumbnail with an imgur fallback via onError). */
export const LOGO_SRC =
  "https://drive.google.com/thumbnail?id=1A08TfiPaQ99gcDu7THMh9O98gpVwUbJS&sz=w200-h200";
export const LOGO_FALLBACK = "https://i.imgur.com/NymLXBn.png";

/** Service-description presets (Điều 1.1), bound to form.motadv. */
export const DV_PRESETS = [
  "Dịch vụ quay phim",
  "Dịch vụ chụp ảnh",
  "Dịch vụ Livestream",
  "Dịch vụ ghi hình sự kiện",
  "Dịch vụ quay phim và chụp ảnh",
];

export type PaymentPreset = { label: string; tmpl: ((payDays: number) => string) | null };

/** Payment-clause presets (Điều 3). tmpl receives form.payDays; null = "Tùy chỉnh". */
export const PAYMENT_PRESETS: PaymentPreset[] = [
  {
    label: "100% sau nghiệm thu",
    tmpl: (d) =>
      `Bên A sẽ thanh toán 100% giá trị hợp đồng trong vòng ${d} ngày làm việc kể từ ngày nhận đủ hồ sơ nghiệm thu và hóa đơn hợp lệ.`,
  },
  {
    label: "50% + 50% sau HT",
    tmpl: (d) =>
      `Tiền thanh toán được chia làm 02 đợt:\n1. Đợt 1 (Tạm ứng): Bên A tạm ứng 50% trong vòng 05 ngày làm việc kể từ ngày ký kết.\n2. Đợt 2: Bên A thanh toán 50% còn lại trong vòng ${d} ngày làm việc kể từ ngày nghiệm thu.`,
  },
  {
    label: "30% + 70% sau HT",
    tmpl: (d) =>
      `Tiền thanh toán được chia làm 02 đợt:\n1. Đợt 1 (Tạm ứng): Bên A tạm ứng 30% trong vòng 05 ngày làm việc kể từ ngày ký kết.\n2. Đợt 2: Bên A thanh toán 70% còn lại trong vòng ${d} ngày làm việc kể từ ngày nghiệm thu.`,
  },
  { label: "Tùy chỉnh", tmpl: null },
];

// ─── Điều khoản pháp lý đầy đủ (Điều 4–11) — verbatim from the Vue app ───────
const _H = (t: string) =>
  `<div style="font-weight:700;font-size:15px;text-transform:uppercase;margin:16px 0 8px">${t}</div>`;
const _P = (t: string) => `<p style="margin:0 0 6px;text-align:justify">${t}</p>`;
const _UL = (arr: string[]) =>
  `<ul style="margin:0 0 6px;padding-left:22px">${arr
    .map((x) => `<li style="margin-bottom:3px;text-align:justify">${x}</li>`)
    .join("")}</ul>`;

export const CONTRACT_CLAUSES =
  _H("Điều 4. Quyền sở hữu trí tuệ") +
  _P(
    "<b>4.1 Quyền sở hữu:</b> Bên A là chủ sở hữu duy nhất và toàn bộ quyền sở hữu trí tuệ (bao gồm quyền tác giả, quyền liên quan và các quyền phái sinh) đối với tất cả sản phẩm hình ảnh, video và các tư liệu liên quan do Bên B thực hiện trong phạm vi Hợp đồng này.",
  ) +
  _P(
    "<b>4.2 Chuyển giao quyền:</b> Bằng việc nhận thanh toán đầy đủ theo quy định tại Điều 3, Bên B xác nhận đã chuyển giao vô điều kiện toàn bộ quyền sở hữu trí tuệ nêu trên cho Bên A. Bên B cam kết không khiếu nại về quyền tác giả hoặc yêu cầu thêm bất kỳ khoản chi phí tác quyền nào khác sau khi đã tất toán hợp đồng.",
  ) +
  _P("<b>4.3 Quy định về bản quyền âm nhạc:</b>") +
  _UL([
    "Trong phạm vi chi phí dịch vụ tại Điều 3, Bên B chịu trách nhiệm lựa chọn và sử dụng các bản nhạc thuộc diện miễn phí bản quyền hoặc nhạc nằm trong thư viện thương mại công khai của nền tảng để sản xuất video.",
    "Trường hợp Bên A yêu cầu sử dụng các bản nhạc có bản quyền thương mại nằm ngoài danh mục miễn phí nêu trên (nhạc thị trường, nhạc của ca sĩ, nhạc độc quyền), Bên A có trách nhiệm tự chi trả mọi chi phí mua quyền sử dụng (licensing) và cung cấp tài liệu chứng minh quyền cấp phép hợp pháp cho Bên B trước khi tiến hành xử lý hậu kỳ.",
    "Bên B được miễn trừ mọi trách nhiệm pháp lý và nghĩa vụ bồi thường trong trường hợp video bị gỡ hoặc phát sinh tranh chấp bản quyền do sự thay đổi thuật toán, chính sách quét nhạc đột ngột của nền tảng, hoặc do Bên A tự ý thay đổi âm nhạc khác sau khi Bên B bàn giao sản phẩm.",
  ]) +
  _P(
    "<b>4.4 Giải quyết tranh chấp đối với bên thứ ba:</b> Trường hợp phát sinh tranh chấp hoặc khiếu nại của bên thứ ba liên quan đến quyền sở hữu trí tuệ đối với Sản phẩm do lỗi của Bên B (ngoại trừ các vấn đề về âm nhạc đã được quy định riêng tại khoản 4.3 Điều này), Bên B có trách nhiệm tự giải quyết bằng chi phí của mình và bồi thường toàn bộ thiệt hại phát sinh cho Bên A.",
  ) +
  _H("Điều 5. Quyền và nghĩa vụ của Bên B") +
  _P("<b>5.1. Quyền lợi của Bên B:</b>") +
  _UL([
    "Được cung cấp đầy đủ thông tin, kịch bản, thiết bị phối hợp và nhân sự (người mẫu, talent,...) từ Bên A để phục vụ công việc.",
    "Có quyền từ chối thực hiện các yêu cầu ghi hình/chụp ảnh liên quan đến các nội dung vi phạm pháp luật, chính trị, tôn giáo hoặc các bối cảnh nguy hiểm chưa được thỏa thuận trước về bảo hộ an toàn.",
    "Được thanh toán đầy đủ và đúng hạn theo thỏa thuận tại Điều 3.",
    "Trường hợp Bên A hủy lịch quay trong vòng 12 giờ trước giờ dự kiến, Bên A chịu 100% chi phí bối cảnh, mẫu đã đặt và 30% phí nhân sự của buổi đó.",
    "Có quyền đề nghị Bên A cung cấp để sử dụng cho mục đích phi thương mại thông tin, dữ liệu, hình ảnh liên quan đến sản phẩm của hợp đồng này.",
  ]) +
  _P("<b>5.2. Nghĩa vụ của Bên B:</b>") +
  _UL([
    "Đảm bảo nhân sự và phương tiện thực hiện công việc đúng tiến độ, chất lượng và tinh thần trách nhiệm cao nhất.",
    "Chấp hành nghiêm túc sự điều phối và phân công của nhân sự phụ trách phía Bên A trong quá trình thực hiện dự án.",
    "Thực hiện các biện pháp cần thiết để đảm bảo an toàn cho nhân sự, thiết bị và hoạt động quay chụp trong phạm vi công việc do Bên B thực hiện; chịu trách nhiệm đối với các thiệt hại, sự cố phát sinh do lỗi của Bên B.",
    "Bàn giao đầy đủ và đúng thời hạn các sản phẩm, dữ liệu, tài liệu và kết quả công việc theo Hợp đồng; bảo đảm sản phẩm đáp ứng yêu cầu về chất lượng, nội dung và định dạng theo thỏa thuận.",
    "<b>Bảo mật sản phẩm:</b> Tuyệt đối không được rò rỉ, phát tán sản phẩm gốc (raw) hay đang chỉnh sửa lên phương tiện thông tin đại chúng/mạng xã hội khi chưa có phê duyệt từ Bên A. Vi phạm nghĩa vụ bảo mật, Bên A có quyền yêu cầu bồi thường toàn bộ thiệt hại phát sinh.",
  ]) +
  _H("Điều 6. Quyền và nghĩa vụ của Bên A") +
  _P("<b>6.1. Quyền lợi của Bên A:</b>") +
  _UL([
    "Giám sát, kiểm tra tiến độ và chất lượng công việc của Bên B theo các tiêu chuẩn đã thỏa thuận tại Hợp đồng này.",
    "Toàn quyền sử dụng, khai thác, sao chép hoặc chỉnh sửa sản phẩm cho mục đích truyền thông, thương mại mà không cần xin phép thêm Bên B sau khi đã thanh toán đầy đủ. Trường hợp Bên A tự chỉnh sửa dẫn đến vi phạm bản quyền (âm thanh, hình ảnh chèn thêm) hoặc tranh chấp với bên thứ ba, Bên A tự chịu hoàn toàn trách nhiệm.",
  ]) +
  _P("<b>6.2. Nghĩa vụ của Bên A:</b>") +
  _UL([
    "Cung cấp kịp thời, đầy đủ các nguồn lực, thông tin, dữ liệu, tài liệu và điều kiện làm việc cần thiết theo yêu cầu của Bên B.",
    "<b>Phê duyệt và phản hồi:</b> Trong vòng 02 ngày làm việc kể từ khi nhận sản phẩm demo/kết quả từng giai đoạn, Bên A phản hồi hoặc phê duyệt bằng văn bản (email/zalo chỉ định). Mọi chậm trễ phản hồi được cộng nối tương ứng vào tổng thời gian thực hiện của Bên B.",
    "<b>Giới hạn chỉnh sửa:</b> Bên A có quyền yêu cầu sửa đổi dựa trên kịch bản đã duyệt nhưng không quá 03 lần mỗi hạng mục video. Vượt số lần hoặc thay đổi hoàn toàn định hướng đã duyệt sẽ tính là chi phí phát sinh theo phụ lục.",
    "Thanh toán đúng số tiền, đúng phương thức và thời gian tại Điều 3 sau khi nhận đủ hồ sơ nghiệm thu hợp lệ.",
    "Cung cấp lịch trình cụ thể, đảm bảo thời gian làm việc đúng thỏa thuận để không ảnh hưởng kế hoạch sản xuất của Bên B.",
  ]) +
  _H("Điều 7. Bảo mật thông tin") +
  _P(
    "Mỗi Bên cam kết bảo mật tuyệt đối mọi thông tin liên quan đến nội dung Hợp đồng, thông tin kinh doanh, báo giá và dữ liệu khách hàng của Bên còn lại. Nghĩa vụ bảo mật có hiệu lực ngay cả sau khi Hợp đồng chấm dứt. Việc tiết lộ cho Bên thứ ba chỉ thực hiện khi có yêu cầu của cơ quan Nhà nước có thẩm quyền hoặc có sự đồng ý bằng văn bản của Bên còn lại.",
  ) +
  _H("Điều 8. Chấm dứt hợp đồng") +
  _P(
    "Hợp đồng chấm dứt khi: hai Bên hoàn thành mọi nghĩa vụ và thanh lý; hoặc hai Bên thỏa thuận chấm dứt trước thời hạn bằng văn bản; hoặc một Bên đơn phương chấm dứt nếu Bên kia vi phạm nghiêm trọng nghĩa vụ mà không khắc phục trong vòng 07 ngày kể từ khi nhận thông báo (Bên vi phạm phải bồi thường thiệt hại thực tế và chịu phạt vi phạm theo Điều 9).",
  ) +
  _H("Điều 9. Phạt vi phạm và bất khả kháng") +
  _P(
    "<b>9.1. Phạt vi phạm:</b> Bên vi phạm nghĩa vụ hợp đồng chịu mức phạt 8% giá trị phần nghĩa vụ bị vi phạm (theo Luật Thương mại), đồng thời bồi thường toàn bộ thiệt hại thực tế phát sinh cho Bên bị vi phạm.",
  ) +
  _P(
    "<b>9.2. Sự kiện bất khả kháng:</b> Các Bên được miễn trừ trách nhiệm nếu không thể thực hiện nghĩa vụ do sự kiện bất khả kháng (thiên tai, dịch bệnh, hỏa hoạn, lệnh cấm của cơ quan nhà nước...). Bên gặp sự kiện phải thông báo bằng văn bản trong vòng 24 giờ. Sự kiện bất khả kháng không miễn trừ nghĩa vụ thanh toán cho các hạng mục đã hoàn thành và nghiệm thu trước đó.",
  ) +
  _H("Điều 10. Giải quyết tranh chấp") +
  _P(
    "Mọi tranh chấp phát sinh được ưu tiên giải quyết thông qua thương lượng trên tinh thần hợp tác. Trong vòng 30 ngày không thỏa thuận được, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền nơi Bên A đặt trụ sở theo quy định pháp luật Việt Nam.",
  ) +
  _H("Điều 11. Điều khoản thi hành") +
  _P(
    "Hợp đồng có hiệu lực kể từ ngày ký. Mọi thay đổi phải được lập thành Phụ lục hợp đồng bằng văn bản. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi Bên giữ 01 (một) bản để thực hiện.",
  );
