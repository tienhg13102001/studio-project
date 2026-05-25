import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { Skeleton } from "#components/ui/skeleton";

type TableSkeletonProps = { cols: number; rows: number };

export function TableSkeleton({ cols, rows }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-3 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r} className="hover:bg-transparent">
              {Array.from({ length: cols }).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton
                    className="h-3"
                    style={{ width: `${60 + (c * 15) % 40}%` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
