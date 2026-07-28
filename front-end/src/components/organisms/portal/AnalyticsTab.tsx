import { useMemo, useState } from "react";
import { EyeIcon, CalendarBlankIcon, TrendUpIcon, StackIcon } from "@phosphor-icons/react";
import { useVisitorTotal } from "#hooks/useVisitorTotal";
import { useVisitorDaily, type DailyPoint } from "#hooks/useVisitorDaily";
import { useVisitorBreakdown } from "#hooks/useVisitorBreakdown";

const RANGES = [7, 30, 90] as const;

const SOURCE_LABELS: Record<string, string> = {
  direct: "Trực tiếp",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  tiktok: "TikTok",
  youtube: "YouTube",
  zalo: "Zalo",
  twitter: "Twitter / X",
  unknown: "Không rõ",
};
const DEVICE_LABELS: Record<string, string> = {
  mobile: "Điện thoại",
  desktop: "Máy tính",
  tablet: "Máy tính bảng",
  unknown: "Không rõ",
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const dayLabel = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/** Lấp các ngày không có lượt (backend chỉ trả ngày > 0) thành 0 để biểu đồ liền mạch. */
function fillDays(data: DailyPoint[] | null, days: number): DailyPoint[] {
  const map = new Map((data ?? []).map((d) => [d.day, d.count]));
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day: iso, count: map.get(iso) ?? 0 });
  }
  return out;
}

export default function AnalyticsTab() {
  const [days, setDays] = useState<number>(30);
  const { total } = useVisitorTotal();
  const { data: daily, loading } = useVisitorDaily(days);
  const { data: sources } = useVisitorBreakdown("source", days);
  const { data: devices } = useVisitorBreakdown("device", days);

  const series = useMemo(() => fillDays(daily, days), [daily, days]);
  const sumRange = series.reduce((a, b) => a + b.count, 0);
  const todayCount = series.length ? series[series.length - 1].count : 0;
  const avg = Math.round(sumRange / days);
  const niceMax = Math.max(4, Math.ceil(Math.max(...series.map((s) => s.count), 1) / 4) * 4);
  const hasData = sumRange > 0;

  const tiles = [
    { label: "Hôm nay", value: todayCount, icon: <EyeIcon size={20} weight="duotone" /> },
    {
      label: `${days} ngày`,
      value: sumRange,
      icon: <CalendarBlankIcon size={20} weight="duotone" />,
    },
    { label: "Trung bình / ngày", value: avg, icon: <TrendUpIcon size={20} weight="duotone" /> },
    { label: "Tổng tích lũy", value: total ?? 0, icon: <StackIcon size={20} weight="duotone" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-lg font-bold">Analytics — Lượt truy cập</h1>
          <p className="text-foreground/40 text-xs">
            Khách duy nhất theo IP mỗi ngày (chưa lọc bot).
          </p>
        </div>
        <div className="border-foreground/10 flex gap-0.5 rounded-lg border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                days === r
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/50 hover:text-foreground",
              ].join(" ")}
            >
              {r} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="border-foreground/8 bg-foreground/3 flex flex-col gap-3 rounded-xl border p-4"
          >
            <div className="text-primary">{t.icon}</div>
            <div>
              <p className="text-foreground text-2xl font-bold tabular-nums">{fmt(t.value)}</p>
              <p className="text-foreground/40 mt-0.5 text-xs">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="border-foreground/8 bg-foreground/3 rounded-xl border p-5">
        <h2 className="text-foreground/80 mb-4 text-sm font-semibold">Lượt truy cập theo ngày</h2>

        {loading ? (
          <div className="bg-foreground/5 h-52 animate-pulse rounded-lg" />
        ) : !hasData ? (
          <div className="text-foreground/40 flex h-52 flex-col items-center justify-center gap-1 text-center text-sm">
            <p>Chưa có dữ liệu trong khoảng này.</p>
            <p className="text-xs">Số liệu sẽ tích lũy dần từ khi tính năng được bật.</p>
          </div>
        ) : (
          <div className="relative h-52 pl-8">
            {/* Gridlines + y labels */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-foreground/8 absolute right-0 left-8 border-t"
                style={{ top: `${i * 25}%` }}
              >
                <span className="text-foreground/30 absolute -top-2 -left-8 w-7 pr-1.5 text-right text-[10px] tabular-nums">
                  {fmt(Math.round((niceMax / 4) * (4 - i)))}
                </span>
              </div>
            ))}
            {/* Bars — mỗi cột là 1 flex-col cao hết khung (items-stretch) để chiều
                cao % của thanh có mốc xác định; justify-end đẩy thanh xuống đáy. */}
            <div className="absolute inset-0 left-8 flex items-stretch gap-[2px] pb-5">
              {series.map((pt) => (
                <div key={pt.day} className="group/bar flex flex-1 flex-col justify-end">
                  <div
                    className="bg-primary/85 hover:bg-primary relative min-h-[2px] w-full rounded-t transition-colors"
                    style={{ height: `${(pt.count / niceMax) * 100}%` }}
                  >
                    {/* Tooltip on hover — neo ngay trên đỉnh thanh */}
                    <div className="bg-card border-foreground/15 pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md border px-2 py-1 text-center whitespace-nowrap shadow-lg group-hover/bar:block">
                      <span className="text-foreground/50 block text-[10px]">{dayLabel(pt.day)}</span>
                      <span className="text-primary text-xs font-semibold tabular-nums">
                        {fmt(pt.count)} lượt
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* X axis: đầu / giữa / cuối */}
            <div className="text-foreground/30 absolute right-0 bottom-0 left-8 flex justify-between text-[10px] tabular-nums">
              <span>{dayLabel(series[0].day)}</span>
              <span>{dayLabel(series[Math.floor(series.length / 2)].day)}</span>
              <span>{dayLabel(series[series.length - 1].day)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownCard title="Nguồn traffic" rows={sources} labels={SOURCE_LABELS} />
        <BreakdownCard title="Thiết bị" rows={devices} labels={DEVICE_LABELS} />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  labels,
}: {
  title: string;
  rows: { key: string; count: number }[] | null;
  labels: Record<string, string>;
}) {
  const max = Math.max(1, ...(rows ?? []).map((r) => r.count));
  const totalRows = (rows ?? []).reduce((a, b) => a + b.count, 0);

  return (
    <div className="border-foreground/8 bg-foreground/3 rounded-xl border p-5">
      <h2 className="text-foreground/80 mb-4 text-sm font-semibold">{title}</h2>
      {!rows || rows.length === 0 ? (
        <p className="text-foreground/40 py-6 text-center text-sm">Chưa có dữ liệu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const pct = totalRows ? Math.round((r.count / totalRows) * 100) : 0;
            return (
              <div key={r.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-foreground">{labels[r.key] ?? r.key}</span>
                  <span className="text-foreground/50 tabular-nums">
                    {fmt(r.count)} · {pct}%
                  </span>
                </div>
                <div className="bg-foreground/8 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${(r.count / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
