import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合併 Tailwind CSS 類別的公用函式，自動處理衝突。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
