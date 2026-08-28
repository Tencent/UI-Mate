import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function generateMeetingId() {
  // Format: 123 456 7890
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  return `${p1} ${p2} ${p3}`;
}