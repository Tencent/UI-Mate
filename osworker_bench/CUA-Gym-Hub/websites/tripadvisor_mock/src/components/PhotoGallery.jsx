import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PhotoGallery({ images, name }) {
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const sideImages = images.slice(1, 5);

  useEffect(() => {
    if (!showModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowModal(false);
      if (event.key === 'ArrowLeft') setActiveIndex(current => (current - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActiveIndex(current => (current + 1) % images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal, images.length]);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60% 1fr',
        gap: '4px',
        borderRadius: '12px',
        overflow: 'hidden',
        height: '340px',
        cursor: 'pointer'
      }}
        onClick={() => setShowModal(true)}
      >
        <div style={{
          background: mainImage,
          height: '100%',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            {name}
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
          height: '100%'
        }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              background: sideImages[i] || '#E0E0E0',
              position: 'relative'
            }}>
              {i === 3 && images.length > 5 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  See all {images.length} photos
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onClick={() => setShowModal(false)}
        >
          <button
            aria-label="Close photo viewer"
            onClick={() => setShowModal(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={28} />
          </button>

          <div style={{
            color: 'white',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {activeIndex + 1} of {images.length}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            maxWidth: '80vw'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Previous photo"
              onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <div style={{
              width: '60vw',
              height: '60vh',
              background: images[activeIndex],
              borderRadius: '8px'
            }} />

            <button
              aria-label="Next photo"
              onClick={() => setActiveIndex((activeIndex + 1) % images.length)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Thumbnails */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            overflowX: 'auto',
            maxWidth: '80vw',
            padding: '8px 0'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '4px',
                  background: img,
                  cursor: 'pointer',
                  border: i === activeIndex ? '2px solid white' : '2px solid transparent',
                  flexShrink: 0,
                  opacity: i === activeIndex ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
