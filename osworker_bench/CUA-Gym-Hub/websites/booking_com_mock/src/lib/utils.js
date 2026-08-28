
    import { clsx } from "clsx";
    import { twMerge } from "tailwind-merge";

    export function cn(...inputs) {
      return twMerge(clsx(inputs));
    }

    export const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    export const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
  