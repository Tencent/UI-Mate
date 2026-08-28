import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const generateId = (prefix = 'id') => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

export const FIELD_TYPES = {
  TEXT: 'text',
  LONG_TEXT: 'long_text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  PERCENT: 'percent',
  SINGLE_SELECT: 'single_select',
  MULTIPLE_SELECT: 'multiple_select',
  ATTACHMENT: 'attachment',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  PHONE: 'phone',
  EMAIL: 'email',
  URL: 'url',
  RATING: 'rating',
  DURATION: 'duration',
  FORMULA: 'formula',
  CREATED_TIME: 'created_time',
  LAST_MODIFIED: 'last_modified',
  BUTTON: 'button',
  BARCODE: 'barcode',
  LINKED_RECORD: 'linked_record',
  USER: 'user'
};

export const COLORS = [
  'bg-red-100 text-red-800',
  'bg-orange-100 text-orange-800',
  'bg-yellow-100 text-yellow-800',
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-gray-100 text-gray-800',
];