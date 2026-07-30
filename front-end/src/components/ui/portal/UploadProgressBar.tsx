import { cn } from "#lib/utils";

type Props = {
  /** 0–100. Bỏ qua khi đang ở pha xử lý (không biết còn bao lâu). */
  percent: number;
  /**
   * "uploading" = đang đẩy file lên (biết % chính xác).
   * "processing" = server đang xử lý (resize ảnh / ghép + transcode video) —
   * không có tiến độ nên hiện dạng chạy vô định.
   */
  phase: "uploading" | "processing";
  className?: string;
};

/**
 * Thanh tiến trình mảnh cho các ô upload. Trước đây chỉ có con số % nhảy cạnh
 * một spinner — với video tới 5GB thì rất khó ước lượng còn bao lâu.
 */
export default function UploadProgressBar({ percent, phase, className }: Props) {
  const processing = phase === "processing";
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      // Pha xử lý không xác định được tiến độ → bỏ aria-valuenow theo đúng chuẩn.
      aria-valuenow={processing ? undefined : clamped}
      aria-label={processing ? "Đang xử lý trên server" : `Đang tải lên ${clamped}%`}
      className={cn("bg-foreground/8 mt-1.5 h-1 overflow-hidden rounded-full", className)}
    >
      {processing ? (
        <div className="bg-primary/60 h-full w-full animate-pulse rounded-full motion-reduce:animate-none" />
      ) : (
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
          // Luôn để lại một vạch mỏng để người dùng thấy thanh đã bắt đầu.
          style={{ width: `${Math.max(clamped, 2)}%` }}
        />
      )}
    </div>
  );
}
