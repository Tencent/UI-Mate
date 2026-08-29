import React from 'react';

export default function RatingBubbles({ rating, size = 'medium', count = null }) {
  const sizes = { small: 10, medium: 14, large: 18 };
  const s = sizes[size] || sizes.medium;
  const gap = 2;

  const bubbles = [];
  for (let i = 1; i <= 5; i++) {
    let fill;
    if (rating >= i) {
      fill = 1;
    } else if (rating >= i - 0.5) {
      fill = 0.5;
    } else {
      fill = 0;
    }

    bubbles.push(
      <svg key={i} width={s} height={s} viewBox="0 0 16 16" style={{ marginRight: i < 5 ? gap : 0 }}>
        <circle cx="8" cy="8" r="7" fill="#E0E0E0" />
        {fill === 1 && <circle cx="8" cy="8" r="7" fill="#00AA6C" />}
        {fill === 0.5 && (
          <>
            <clipPath id={`half-${i}-${s}-${rating}`}>
              <rect x="0" y="0" width="8" height="16" />
            </clipPath>
            <circle cx="8" cy="8" r="7" fill="#00AA6C" clipPath={`url(#half-${i}-${s}-${rating})`} />
          </>
        )}
      </svg>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{bubbles}</span>
      {count !== null && (
        <span style={{ fontSize: size === 'small' ? '12px' : '14px', color: '#545454' }}>
          {count.toLocaleString()} reviews
        </span>
      )}
    </span>
  );
}
