import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date, locale = "he"): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return locale === "he" ? "עכשיו" : "now";
  if (minutes < 60) return locale === "he" ? `לפני ${minutes} דק׳` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale === "he" ? `לפני ${hours} שע׳` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return locale === "he" ? `לפני ${days} ימים` : `${days}d ago`;
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US");
}
