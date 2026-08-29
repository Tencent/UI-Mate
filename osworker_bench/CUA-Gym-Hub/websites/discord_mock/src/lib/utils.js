import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function getAvatar(id) {
  return `https://picsum.photos/100/100?random=${id}`;
}

export function getServerIcon(id) {
  return `https://picsum.photos/64/64?random=${id}`;
}