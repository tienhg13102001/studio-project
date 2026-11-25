import Seo from "#components/Seo";
import { seoTrangTinh } from "#lib/seoTrangTinh";
import PageHero from "#components/organisms/PageHero";
import { useLanguage } from "#i18n";

/**
 * Chính sách bảo mật — viết theo ĐÚNG những gì web đang làm (soát mã 24/11/2026):
 *
 *   · Form liên hệ / form bảng giá cưới: tên, điện thoại và/hoặc email, dịch vụ,
 *     tin nhắn → lưu trong Portal + gửi mail báo cho Bee Z (back-end/routes/contact.ts).
 *   · Bộ đếm khách: chỉ lưu mã băm 16 ký tự của IP, tự xoá sau 2 ngày
 *     (models/Visitor.ts, TTL 172800s); số liệu theo ngày thì không gắn với ai.
 *   · Không cookie, không Google Analytics / Facebook Pixel; trình duyệt chỉ nhớ
 *     giao diện sáng/tối (localStorage). Ngôn ngữ nằm trong đường dẫn (/en), không lưu từ 25/11/2026.
 *
 * Đổi cách thu thập dữ liệu ở đâu thì PHẢI sửa trang này theo, kẻo trang tự nói sai
 * về chính nó.
 */

type Muc = { h: string; p: string[] };

const NOI_DUNG: Record<"vi" | "en", { title: string; updated: string; intro: string; muc: Muc[] }> = {
  vi: {
    title: "Chính sách bảo mật",
    updated: "Cập nhật ngày 24/11/2026",
    intro:
      "Trang này nói rõ beezvn.com ghi lại những thông tin gì về bạn, dùng để làm gì và bạn có quyền gì với chúng.",
    muc: [
      {
        h: "Ai chịu trách nhiệm",
        p: [
          "CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION, mã số thuế 0110989139, địa chỉ Số 54, Ngõ 250 Khương Trung, Khương Đình, Hà Nội.",
          "Mọi câu hỏi về dữ liệu cá nhân, bạn gửi về BeeZ.fw@gmail.com hoặc gọi 0967 33 55 77.",
        ],
      },
      {
        h: "Thông tin bạn tự gửi",
        p: [
          "Khi bạn điền form liên hệ hoặc form báo giá, Bee Z nhận họ tên, số điện thoại và/hoặc email, dịch vụ bạn quan tâm và nội dung tin nhắn.",
          "Bee Z dùng các thông tin này để trả lời, tư vấn và gửi báo giá cho bạn. Thông tin được gửi về hộp thư của Bee Z và lưu trong hệ thống quản trị nội bộ; chỉ những người trong team phụ trách dự án mới xem được.",
        ],
      },
      {
        h: "Thông tin web tự ghi khi bạn xem trang",
        p: [
          "Để đếm lượt truy cập, máy chủ tạo một mã rút gọn từ địa chỉ IP của bạn. Bee Z không lưu địa chỉ IP gốc, và mã này tự xoá sau 2 ngày.",
          "Kèm theo đó là trang bạn xem, nơi bạn đến từ đâu (ví dụ Google, Facebook) và loại thiết bị (điện thoại hay máy tính). Những số này được cộng dồn theo ngày, không gắn với tên hay liên hệ của ai.",
          "Địa chỉ IP cũng được dùng trong thời gian ngắn để chặn gửi form hàng loạt (thư rác).",
        ],
      },
      {
        h: "Cookie và mã theo dõi",
        p: [
          "beezvn.com không dùng cookie quảng cáo và không gắn mã theo dõi của bên thứ ba như Google Analytics hay Facebook Pixel.",
          "Trình duyệt của bạn chỉ nhớ một lựa chọn: giao diện sáng/tối. Ngôn ngữ nằm ngay trong địa chỉ trang (bản tiếng Anh bắt đầu bằng /en), không lưu lại.",
        ],
      },
      {
        h: "Chia sẻ thông tin",
        p: [
          "Bee Z không bán, không cho thuê và không trao đổi thông tin của bạn với bên nào. Thông tin chỉ được cung cấp cho cơ quan nhà nước khi pháp luật yêu cầu.",
          "Khi bạn bấm sang Zalo, Facebook, Instagram hay TikTok, việc xử lý dữ liệu ở đó theo chính sách riêng của các nền tảng ấy.",
        ],
      },
      {
        h: "Lưu bao lâu, và quyền của bạn",
        p: [
          "Thông tin bạn gửi qua form được giữ trong thời gian cần để trao đổi và thực hiện dự án.",
          "Bạn có quyền xem, sửa, yêu cầu xoá thông tin của mình hoặc rút lại sự đồng ý bất cứ lúc nào, bằng cách gửi email về BeeZ.fw@gmail.com. Bee Z xử lý yêu cầu theo đúng thời hạn mà pháp luật Việt Nam về bảo vệ dữ liệu cá nhân quy định.",
        ],
      },
      {
        h: "Bảo vệ thông tin",
        p: [
          "Mọi trang của beezvn.com chạy qua kết nối mã hoá (HTTPS). Khu quản trị nội bộ cần tài khoản riêng mới vào được.",
          "Khi chính sách này thay đổi, Bee Z cập nhật ngay trên trang này kèm ngày sửa.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated 24 November 2026",
    intro:
      "This page explains what beezvn.com records about you, why, and what rights you have over it.",
    muc: [
      {
        h: "Who is responsible",
        p: [
          "CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION, tax code 0110989139, No. 54, Lane 250 Khuong Trung, Khuong Dinh, Hanoi, Vietnam.",
          "For any question about your personal data, email BeeZ.fw@gmail.com or call +84 967 33 55 77.",
        ],
      },
      {
        h: "Information you send us",
        p: [
          "When you fill in the contact or quote form, Bee Z receives your name, phone number and/or email, the service you are interested in and your message.",
          "We use it to reply, advise and send you a quote. It is delivered to Bee Z's inbox and stored in our internal admin system, visible only to the team members handling your project.",
        ],
      },
      {
        h: "Information recorded when you browse",
        p: [
          "To count visits, the server creates a short code from your IP address. We do not store the original IP address, and the code deletes itself after 2 days.",
          "Alongside it we record the page you view, where you came from (for example Google or Facebook) and your device type. These figures are summed per day and are not linked to anyone's name or contact details.",
          "Your IP address is also used briefly to block automated form spam.",
        ],
      },
      {
        h: "Cookies and tracking",
        p: [
          "beezvn.com uses no advertising cookies and no third-party trackers such as Google Analytics or the Facebook Pixel.",
          "Your browser only remembers one choice: light/dark theme. The language is part of the page address (English pages start with /en) and is not stored.",
        ],
      },
      {
        h: "Sharing",
        p: [
          "Bee Z does not sell, rent or trade your information. It is only disclosed to authorities when the law requires it.",
          "When you click through to Zalo, Facebook, Instagram or TikTok, those platforms' own policies apply.",
        ],
      },
      {
        h: "Retention and your rights",
        p: [
          "Information sent through our forms is kept for as long as needed to discuss and deliver your project.",
          "You may view, correct or ask us to delete your information, or withdraw consent, at any time by emailing BeeZ.fw@gmail.com. We handle requests within the time limits set by Vietnamese personal data protection law.",
        ],
      },
      {
        h: "Security",
        p: [
          "Every page of beezvn.com is served over an encrypted connection (HTTPS). The internal admin area requires a personal account.",
          "If this policy changes, we update this page with the date of the change.",
        ],
      },
    ],
  },
};

const PrivacyPage = () => {
  const { lang } = useLanguage();
  const nd = NOI_DUNG[lang === "en" ? "en" : "vi"];

  return (
    <div className="min-h-screen">
      <Seo {...seoTrangTinh("/chinh-sach-bao-mat", lang)} path="/chinh-sach-bao-mat" />
      <PageHero title={nd.title} subtitle={nd.updated} />
      <article className="mx-auto max-w-3xl px-6 pb-24">
        <p className="text-foreground text-lg leading-relaxed">{nd.intro}</p>
        <div className="mt-10 space-y-10">
          {nd.muc.map((m) => (
            <section key={m.h}>
              <h2 className="text-foreground text-xl font-bold">{m.h}</h2>
              <div className="text-muted-foreground mt-3 space-y-3 leading-relaxed">
                {m.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
};

export default PrivacyPage;
