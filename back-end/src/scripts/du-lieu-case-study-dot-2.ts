/**
 * MƯỜI case study đợt 2 — Hoàn trả lời dữ kiện ngày 21/08/2026.
 *
 * Khác đợt 1 ở chỗ: đợt 1 Hoàn kể rất kỹ từng buổi quay, đợt này chỉ một dòng
 * mỗi dự án. Nên các bài dưới đây bám SÁT dữ kiện Hoàn đưa và suy ra hệ quả
 * nghề nghiệp từ chính dữ kiện đó, KHÔNG bịa thêm số máy, số người, số ngày
 * nào không được kể.
 *
 * CỐ Ý VIẾT KHÁC NHAU VỀ HÌNH DẠNG. Bộ tám bài đợt 1 bị soi là "đúc cùng một
 * khuôn": bài nào cũng mở bằng định nghĩa thể loại, dựng một nghịch lý hai
 * chiều, rồi chốt bằng một câu triết lý đảo vế. Mười bài này cố tình lệch nhau:
 * có bài mở thẳng bằng con số, có bài mở bằng ràng buộc thời gian, có bài chỉ
 * hai câu, có bài ba đoạn. Không bài nào kết bằng câu triết lý.
 *
 * KHÔNG BÀI NÀO CÓ KHỐI KẾT QUẢ: Hoàn chưa đưa chỉ số nào. Khối rỗng tự ẩn.
 */

import type { BaiCaseStudy } from "./du-lieu-case-study.ts";

export const CASE_STUDY_DOT_2: BaiCaseStudy[] = [
  {
    slug: "greensm-podcast-green-lifestyle-stories",
    ten: "GreenSM Podcast",
    challenge:
      "Podcast là thể loại tĩnh nhất trong nghề quay: hai người ngồi nói chuyện trong một căn phòng. Nhưng nội dung của bộ này là chuyện nghề của các bác tài GreenSM, mà chuyện đó không xảy ra trong phòng thu. Nó xảy ra ngoài đường, trong ca chạy, giữa những cuốc khách.",
    approach:
      "Quay hai lớp hình. Phần các bác tài ngồi kể được quay trong studio để tiếng sạch và nhìn được rõ mặt. Xen vào đó là cảnh quay thật ngoài đường: xe đang chạy, bác tài đang đón khách, đúng cái việc mà họ vừa kể.\n\nCảnh đường phố ở đây không phải để chèn cho đỡ trống. Người xem nghe một bác tài nói về ca đêm, rồi nhìn thấy đúng ca đêm đó, thì lời kể mới có chỗ bám.",
  },
  {
    slug: "lynk-co-event-shaping-the-urban-mobility",
    ten: "Lynk & Co Event",
    challenge:
      "Ba máy, một sự kiện ra mắt xe, và hai hạn chót lệch nhau: ảnh phải có ngay trong ngày, video trả sau hai ngày.\n\nHạn chót ảnh mới là cái khó. Sự kiện chưa kết thúc thì bên truyền thông đã cần hình để đăng, nghĩa là không thể đợi tan cuộc rồi mới ngồi lọc.",
    approach:
      "Khâu chọn và chỉnh ảnh chạy song song với sự kiện chứ không nối đuôi phía sau. Ảnh được rút và xử lý theo từng chặng của chương trình, để tới lúc khách mời ra về thì bộ ảnh đăng được đã sẵn sàng.\n\nBa máy giữ cho phần video không phụ thuộc vào một góc duy nhất: sự kiện chạy một lần, và những khoảnh khắc đáng giá nhất thường xảy ra đúng lúc một máy đang đổi vị trí.",
  },
  {
    slug: "vinwonder",
    ten: "Vinwonder",
    challenge:
      "Quay trong công viên đang mở cửa đón khách thật. Không quây được khu vực, không dừng được trò chơi, không dọn được người lạ ra khỏi khung. Bốn video ngắn, hai ngày quay, hai ngày hậu kỳ.",
    approach:
      "Chạy theo nhịp của công viên thay vì bắt công viên chạy theo lịch quay. Trò chơi nào đông thì để đó quay sau, chỗ nào vừa vãn khách thì vào ngay — thứ tự trong lịch quay đổi liên tục theo tình hình thực tế trong ngày.\n\nKhách trong khung không phải là thứ phải né. Một công viên giải trí vắng người trông như công viên đã đóng cửa, nên đám đông chính là thứ cần có trong hình.\n\nHai ngày hậu kỳ cho bốn video nghĩa là phải biết trước mình cần gì. Dựng danh sách cảnh bắt buộc từ trước, quay đủ rồi mới quay thêm phần tuỳ hứng.",
  },
  {
    slug: "bao-tin-manh-hai",
    ten: "Bảo Tín Mạnh Hải",
    challenge:
      "Trang sức trên người mẫu khó hơn trang sức đặt trên bàn. Đá quý cần ánh sáng gắt và có hướng để bắt được lửa trong viên đá; da người thì cần ánh sáng mềm, gắt quá là lộ hết kết cấu da và đổ bóng cứng lên mặt.\n\nHai yêu cầu này chiếu vào cùng một khung hình, cùng một lúc.",
    approach:
      "Sáu đèn cho một khung hình. Không phải để cho sáng, mà để tách hai hệ sáng ra khỏi nhau: một hệ lo gương mặt và dáng người, một hệ lo riêng món trang sức đang đeo.\n\nModel là hoa hậu và người mẫu chuyên nghiệp, nên phần tạo dáng không phải là chỗ tốn thời gian. Thời gian dồn vào việc canh lại đèn mỗi khi món trang sức đổi vị trí trên người — cổ, tai và tay không nhận sáng theo cùng một hướng.",
  },
  {
    slug: "jun-pham-x-shinkai-impact",
    ten: "Jun Phạm x Shinkai Impact",
    challenge:
      "TVC này dựng trên kỹ xảo, nên phần lớn quay trước phông xanh. Cái khó nằm ở chỗ diễn viên phải diễn với những thứ chưa tồn tại: nhìn vào chỗ trống, phản ứng với thứ sẽ được thêm vào sau.",
    approach:
      "Quay phông xanh và bàn phần hậu kỳ với studio Zodiac II ngay từ khâu chuẩn bị, không phải quay xong mới giao. Người làm kỹ xảo cần biết trước máy đặt ở đâu, ống kính nào, đèn hắt từ hướng nào — thiếu mấy thứ đó thì phần dựng thêm vào không khớp với cảnh quay thật, và mắt người xem nhận ra ngay cả khi không giải thích được vì sao.\n\nJun Phạm diễn phần hành động trong bối cảnh trống. Việc của team hiện trường là làm cho phần trống ấy có mốc để diễn viên bám vào.",
  },
  {
    slug: "zh-bike-tvc-ky-nguyen-dot-pha-the",
    ten: "ZH Bike TVC",
    challenge:
      "Xe đứng yên trong studio thì chỉ khoe được kiểu dáng. Muốn nói tới chuyện vận hành thì phải cho xe chạy thật, mà xe chạy thật là mất quyền kiểm soát: ánh sáng đổi theo đoạn đường, hậu cảnh đổi theo từng mét, và mỗi lần quay lại là một lần chạy lại từ đầu.",
    approach:
      "Quay ngoại cảnh với xe chạy thật, dùng Sony FX3 và bộ ống kính GM.\n\nMáy nhỏ và nhẹ là lý do chọn: cảnh xe chạy cần máy bám theo được, đổi vị trí nhanh giữa các lượt chạy, và luồn được vào những góc mà một thân máy lớn không đặt vừa. Bộ ống kính GM lo phần còn lại — độ nét ở khẩu mở rộng, để tách được chiếc xe khỏi hậu cảnh đang trôi.",
  },
  {
    slug: "vespa-la-dolce-vita-cuoc-song-ngot-ngao",
    ten: "Vespa — La Dolce Vita",
    challenge:
      "Kịch bản kể một ngày, và quay đúng một ngày ngoài đường phố thật, từ sáng tới tối.\n\nĐiều đó nghĩa là ánh sáng không phải thứ chọn được. Cảnh nào nằm ở đoạn nào trong kịch bản thì phải quay đúng vào khung giờ có thứ ánh sáng ấy, và giờ đó trôi qua là hết, không có lượt hai trong cùng một ngày.",
    approach:
      "Quay theo đúng trình tự thời gian của kịch bản thay vì gom cảnh theo địa điểm cho tiện di chuyển. Cách gom theo địa điểm nhanh hơn, nhưng nó đẩy hai cảnh cách nhau nửa ngày trong phim về quay cùng một giờ, và khi ghép lại thì ánh sáng tố cáo.\n\nĐổi lại, cả ngày quay bị neo vào đồng hồ: tới giờ nào phải xong cảnh của giờ đó, chậm một nhịp là cảnh sau lệch theo.",
  },
  {
    slug: "dinh-tu-x-vf8",
    ten: "Đình Tú x VF8",
    challenge:
      "Lịch của Đình Tú gói trong đúng một ngày. Với một TVC ô tô, chừng đó là chật: xe cần thời gian đặt vị trí và canh sáng, còn diễn viên thì không thể ngồi chờ mỗi lần đổi cảnh.",
    approach:
      "Dồn mọi thứ có thể làm trước ra khỏi ngày quay. Bối cảnh khảo sát trước, vị trí xe và hướng sáng chốt trước, để ngày có talent thì chỉ còn việc bấm máy.\n\nCách này không rút ngắn được buổi quay, nó chỉ chuyển phần tốn thời gian sang những ngày không có ai phải chờ.",
  },
  {
    slug: "beverly-hills-polo-club",
    ten: "Beverly Hills Polo Club",
    challenge:
      "Mười video ngắn dạng tình huống, làm trong năm ngày, cho chiến dịch quà tặng Valentine.\n\nHạn chót ở đây là hạn chót cứng theo nghĩa đen: hàng bán trước Valentine, video lên sau ngày đó thì không còn chỗ dùng. Không có phương án lùi lịch.",
    approach:
      "Video tình huống có một đặc điểm dùng được: mỗi cái là một mẩu riêng, không nối vào nhau. Nên chúng được gom lại theo bối cảnh chứ không quay lần lượt theo thứ tự — dựng một cảnh xong thì quay hết mọi tình huống diễn ra trong cảnh đó, kể cả khi chúng nằm ở các video khác nhau.\n\nNăm ngày cho mười video còn có nghĩa là hậu kỳ không đợi quay xong. Video nào quay xong trước thì dựng trước.",
  },
  {
    slug: "rue35-food-photography-the-art-of-gastronomy",
    ten: "Rue35 Food Photography",
    challenge:
      "Mười lăm ảnh, chụp ngay tại quán trong lúc quán vẫn hoạt động. Không dựng set riêng, không bê món về studio.",
    approach:
      "Chụp tại quán là đánh đổi. Mất quyền kiểm soát ánh sáng và không gian, nhưng được lại thứ mà studio không dựng ra nổi: đúng cái bàn, đúng bộ đồ ăn, đúng thứ ánh sáng mà khách sẽ ngồi vào.\n\nBù lại phần mất, thiết bị phải gọn để dựng nhanh và không chiếm lối đi, và lịch chụp phải bám theo giờ vắng khách của quán. Món ăn thì không chờ được: mỗi đĩa chỉ đẹp trong ít phút sau khi rời bếp, nên khung hình và ánh sáng phải căn xong trước khi bếp bắt đầu làm món.",
  },
];
