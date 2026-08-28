
import React, { useState, useEffect } from 'react';

interface SalesPathProps {
  stages: string[];
  currentStage: string;
  onStageChange: (stage: string) => void;
  stageDetails?: Record<string, { fields?: { label: string; type: 'checkbox' | 'text' }[] }>;
  closedWonStage?: string;
}

export const SalesPath: React.FC<SalesPathProps> = ({
  stages,
  currentStage,
  onStageChange,
  stageDetails,
  closedWonStage = 'Closed Won'
}) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // Track field values per stage as { [stageName]: { [fieldLabel]: value } }
  const [stageFieldValues, setStageFieldValues] = useState<Record<string, Record<string, string | boolean>>>({});

  const currentIndex = stages.indexOf(currentStage);

  const handleFieldChange = (stage: string, fieldLabel: string, value: string | boolean) => {
    setStageFieldValues(prev => ({
      ...prev,
      [stage]: {
        ...(prev[stage] || {}),
        [fieldLabel]: value
      }
    }));
  };

  const handleMarkAsCurrent = (stage: string) => {
    if (stage === closedWonStage) {
      setShowConfetti(true);
    }
    onStageChange(stage);
    setActivePopover(null);
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti animation */}
      {showConfetti && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-10px',
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                background: ['#04844B', '#0176D3', '#FFB75D', '#C23934', '#9050E9', '#FF5D2D'][Math.floor(Math.random() * 6)],
                animation: `confetti-fall ${1.5 + Math.random() * 1.5}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                opacity: 0.9,
              }}
            />
          ))}
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(400px) rotate(${360 + Math.random() * 720}deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative' }}>
        {stages.map((stage, index) => {
          const isCurrent = stage === currentStage;
          const isPast = index < currentIndex;
          const isClosedWon = stage === closedWonStage;
          const isClosedLost = stage === 'Closed Lost';

          let bgColor = 'var(--border)';
          let textColor = 'var(--text-secondary)';
          if (isCurrent) {
            bgColor = isClosedWon ? 'var(--success)' : isClosedLost ? 'var(--error)' : 'var(--primary)';
            textColor = 'white';
          } else if (isPast) {
            bgColor = 'var(--primary)';
            textColor = 'white';
          }

          const stageValues = stageFieldValues[stage] || {};

          return (
            <div
              key={stage}
              style={{ flex: 1, position: 'relative' }}
            >
              <button
                onClick={() => setActivePopover(activePopover === stage ? null : stage)}
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  background: bgColor,
                  color: textColor,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: isCurrent ? 700 : 500,
                  textAlign: 'center',
                  borderRadius: index === 0 ? '4px 0 0 4px' : index === stages.length - 1 ? '0 4px 4px 0' : '0',
                  borderRight: index < stages.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  transition: 'background 0.2s',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={stage}
              >
                {stage}
              </button>

              {/* Popover */}
              {activePopover === stage && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }}
                    onClick={() => setActivePopover(null)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '220px',
                    zIndex: 50,
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>{stage}</div>

                    {stageDetails?.[stage]?.fields?.map((field, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {field.type === 'checkbox' ? (
                          <>
                            <input
                              type="checkbox"
                              id={`${stage}-${fi}`}
                              checked={!!stageValues[field.label]}
                              onChange={(e) => handleFieldChange(stage, field.label, e.target.checked)}
                            />
                            <label htmlFor={`${stage}-${fi}`} style={{ fontSize: '13px', cursor: 'pointer' }}>{field.label}</label>
                          </>
                        ) : (
                          <div style={{ width: '100%' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{field.label}</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '13px', padding: '4px 8px' }}
                              value={(stageValues[field.label] as string) || ''}
                              onChange={(e) => handleFieldChange(stage, field.label, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '8px', fontSize: '13px' }}
                      onClick={() => handleMarkAsCurrent(stage)}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Stage' : 'Mark as Current Stage'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
