import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export const Rating = ({ value, count, size = 16, className, onCountClick }) => {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex text-xmazon-orange">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={size} fill="currentColor" strokeWidth={0} />;
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />;
          } else {
            return <Star key={i} size={size} className="text-gray-300" strokeWidth={0} fill="currentColor" />;
          }
        })}
      </div>
      {count !== undefined && (
        <button
          type="button"
          onClick={onCountClick}
          className={`ml-2 text-sm text-xmazon-blue ${onCountClick ? 'hover:text-xmazon-darkYellow hover:underline cursor-pointer' : 'cursor-default'}`}
        >
          {count.toLocaleString()}
        </button>
      )}
    </div>
  );
};
