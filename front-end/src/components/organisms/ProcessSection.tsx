import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useTranslation } from "#i18n";

/**
 * Quy trình làm việc — năm bước từ cuộc gọi đầu tới lúc giao file.
 *
 * VÌ SAO CÓ KHỐI NÀY: trang chủ trước đó đi thẳng từ hình ảnh sản phẩm sang
 * lời mời liên hệ, không chỗ nào trả lời câu hỏi mà khách lần đầu luôn hỏi —
 * làm việc với Bee Z thì diễn ra thế nào, mất bao lâu, mình cần chuẩn bị gì.
 * Không biết điều đó thì khách ngại gọi.
 *
 * Đánh số 01–05 ở đây là thật, không phải trang trí: đây là một chuỗi có thứ
 * tự, bước sau phụ thuộc bước trước.
 */
const ProcessSection = () => {
  const t = useTranslation();

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader title={t.process.sectionTitle} subtitle={t.process.sectionSubtitle} />

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {t.process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <li className="border-border/50 from-primary/8 hover:border-primary/30 flex h-full flex-col gap-2 rounded-2xl border bg-linear-to-b to-transparent p-6 transition-colors">
                <span className="text-primary text-xs font-bold tracking-[0.14em] tabular-nums">
                  {t.process.stepLabel} {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground grow text-sm leading-relaxed">{step.desc}</p>
                <span className="text-primary/80 mt-1 text-xs font-medium">{step.when}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default ProcessSection;
