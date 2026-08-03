import SectionHeader from "#components/molecules/SectionHeader";
import { useTranslation } from "#i18n";

/**
 * Quy trình làm việc — năm bước từ cuộc gọi đầu tới lúc giao file.
 *
 * VÌ SAO CÓ KHỐI NÀY: trang chủ trước đó đi thẳng từ hình ảnh sản phẩm sang
 * lời mời liên hệ, không chỗ nào trả lời câu hỏi mà khách lần đầu luôn hỏi —
 * làm việc với Bee Z thì diễn ra thế nào, mất bao lâu, mình cần chuẩn bị gì.
 *
 * VÌ SAO CHỒNG THẺ THAY VÌ XẾP LƯỚI: xếp lưới năm ô cạnh nhau thì khách lướt
 * qua trong một giây và không đọc chữ nào. Cho mỗi bước tự chiếm lấy màn hình
 * rồi bị bước sau trượt lên đè, khách buộc phải đi qua từng bước một.
 *
 * Toàn bộ chuyển động do `position: sticky` lo, KHÔNG một dòng JavaScript nào
 * và không tải thêm byte nào. Mỗi thẻ dính ở một độ cao lệch nhau vài pixel
 * nên thẻ trước vẫn ló mép ra, nhìn thành một chồng bài.
 *
 * Đánh số 01–05 ở đây là thật, không phải trang trí: đây là chuỗi có thứ tự,
 * bước sau phụ thuộc bước trước.
 */
const ProcessSection = () => {
  const t = useTranslation();
  const steps = t.process.steps;

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <SectionHeader title={t.process.sectionTitle} subtitle={t.process.sectionSubtitle} />

        {/*
          `flow-root` ở đây KHÔNG phải cho đẹp. Không có nó, lề dưới của thẻ cuối
          bị gộp xuyên qua đáy `ol` nên không nới thêm được chỗ nào — mà thẻ dính
          chỉ dính trong lòng khối cha, nên thẻ 05 không kịp trôi lên đè thẻ 04 và
          chồng bài đứt ở bước 4. `flow-root` giữ lề đó lại bên trong.
        */}
        <ol className="flow-root">
          {steps.map((step, i) => (
            /*
              CHÍNH `li` phải là thẻ dính, không phải thẻ con bên trong.

              Nếu để mỗi thẻ dính bên trong `li` của riêng nó thì hết `li` là nó
              rời đi — thẻ trước trượt lên chui sau thanh menu thay vì nằm yên
              làm nền cho thẻ sau. Cho cả năm `li` dính chung trong `ol` thì thẻ
              nào đã dừng sẽ ở yên đó tới hết khối, đúng kiểu chồng bài.

              `marginBottom` mới là quãng cuộn giữa hai bước: ngắn quá thì thẻ
              chưa kịp dừng đã bị đè, dài quá thì khách cuộn mỏi tay.

              BƯỚC CUỐI CŨNG PHẢI CÓ quãng này. Bỏ đi thì `ol` kết thúc ngay tại
              thẻ cuối, mà thẻ dính chỉ dính được trong lòng khối cha — nên thẻ
              05 không kịp trôi lên đè thẻ 04, chồng bài đứt ở bước 4. Giữ lại
              quãng cuối cũng là lúc khách nhìn thấy trọn cả năm thẻ xếp chồng.

              Ai bật giảm chuyển động trong hệ điều hành thì trở lại thành danh
              sách xếp dọc bình thường.
            */
            <li
              key={step.title}
              className="sticky motion-reduce:static"
              style={{
                // Lệch dần để mép thẻ trước vẫn ló ra sau khi bị đè.
                top: `calc(13vh + ${i * 16}px)`,
                marginBottom: "42vh",
              }}
            >
              <article
                className="border-border/60 bg-card rounded-2xl border p-7 shadow-2xl md:p-10"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-9">
                  <div className="flex shrink-0 items-baseline gap-3 md:w-32 md:flex-col md:gap-1">
                    <span className="text-primary/80 text-xs font-bold tracking-[0.16em]">
                      {t.process.stepLabel}
                    </span>
                    <span className="text-primary text-5xl leading-none font-bold tabular-nums md:text-6xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-foreground text-2xl font-semibold md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground max-w-xl leading-relaxed md:text-lg">
                      {step.desc}
                    </p>
                    <span className="border-primary/25 text-primary mt-1 w-fit rounded-full border px-3 py-1 text-xs font-medium">
                      {step.when}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default ProcessSection;
