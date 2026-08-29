import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "px-4 py-1.5 text-[13px] font-medium focus:outline-none transition-colors cursor-pointer";

  const variants = {
    primary: "bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-[#0F1111] rounded-lg shadow-sm focus:ring-2 focus:ring-[#f7ca00]",
    secondary: "bg-white hover:bg-gray-50 border border-[#d5d9d9] text-[#0F1111] rounded-lg shadow-sm focus:ring-2 focus:ring-[#a8dadc]",
    orange: "bg-[#ffa41c] hover:bg-[#fa8900] border border-[#ff8f00] text-[#0F1111] rounded-full shadow-sm",
    dark: "bg-[#232f3e] hover:bg-[#37475a] text-white border border-transparent rounded-lg",
    link: "bg-transparent border-none shadow-none text-[#007185] hover:underline hover:text-[#c7511f] px-0 py-0 rounded-none"
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
