import * as React from "react"
import { cn } from "#lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    /**
     * Class cho div bọc ngoài (nơi thực sự cuộn). Cấp `max-h-*` ở đây thì
     * `TableHeader` mới dính được — vì div này là vùng cuộn gần nhất của thead;
     * không giới hạn chiều cao thì `sticky` không có tác dụng.
     */
    containerClassName?: string
  }
>(({ className, containerClassName, ...props }, ref) => (
  <div className={cn("relative w-full overflow-x-auto", containerClassName)}>
    {/* min-width keeps columns readable on mobile → swipe instead of squish */}
    <table ref={ref} className={cn("w-full min-w-150 caption-bottom text-sm", className)} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // Nền ĐỤC (bg-background) là bắt buộc: nền cũ chỉ 3% trong suốt nên khi cuộn,
  // các dòng body hiện xuyên qua tên cột. Tint + border chuyển xuống <th> vì
  // border khai trên thead sticky hay bị bỏ vẽ do border-collapse.
  <thead ref={ref} className={cn("bg-background sticky top-0 z-10", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t border-foreground/8 bg-foreground/3 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-foreground/5 transition-colors hover:bg-foreground/3 data-[state=selected]:bg-foreground/5",
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "border-b border-foreground/8 bg-foreground/3 px-4 py-3 text-left text-xs font-medium text-foreground/40 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3 [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-xs text-foreground/30", className)} {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
