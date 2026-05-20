type TableSkeletonProps = { cols: number; rows: number };

export function TableSkeleton({ cols, rows }: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-white/8 bg-white/3">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-white/5 last:border-0">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div
                    className="h-3 rounded bg-white/8 animate-pulse"
                    style={{ width: `${60 + (c * 15) % 40}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
