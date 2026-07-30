import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Bỏ dấu tiếng Việt + hạ chữ thường, để tìm kiếm gõ không dấu vẫn ra kết quả
 * ("hoan" → khớp "Hoàn"). NFD tách được hầu hết dấu, nhưng đ/Đ là ký tự riêng
 * chứ không phải chữ có dấu nên phải thay tay.
 */
export function normalizeVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
