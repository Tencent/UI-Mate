import { useState } from 'react';
import './Post.css';

export default function ImageGrid({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const count = images.length;

  let gridClass = 'img-grid-1';
  if (count === 2) gridClass = 'img-grid-2';
  else if (count === 3) gridClass = 'img-grid-3';
  else if (count === 4) gridClass = 'img-grid-4';
  else if (count >= 5 && count <= 6) gridClass = 'img-grid-6';
  else if (count >= 7) gridClass = 'img-grid-9';

  return (
    <>
      <div className={`image-grid ${gridClass}`}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`图片 ${i + 1}`}
            className="grid-img"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
            >×</button>
            <img
              src={images[lightboxIndex]}
              alt="查看大图"
              className="lightbox-img"
            />
            <div className="lightbox-nav">
              {images.length > 1 && (
                <>
                  <button
                    className="lightbox-btn"
                    onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
                    disabled={lightboxIndex === 0}
                  >‹</button>
                  <span className="lightbox-count">{lightboxIndex + 1}/{images.length}</span>
                  <button
                    className="lightbox-btn"
                    onClick={() => setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1))}
                    disabled={lightboxIndex === images.length - 1}
                  >›</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
