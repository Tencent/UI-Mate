import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

export default function MoveStageModal({ application, candidate, stages, onClose }) {
  const { state, dispatch } = useAppContext();
  const [selectedStageId, setSelectedStageId] = useState(application.currentStageId);

  const currentStage = stages.find(s => s.id === application.currentStageId);

  const handleMove = () => {
    if (selectedStageId === application.currentStageId) {
      onClose();
      return;
    }

    const fromStage = stages.find(s => s.id === application.currentStageId);
    const toStage = stages.find(s => s.id === selectedStageId);

    dispatch({
      type: 'MOVE_APPLICATION_STAGE',
      payload: {
        applicationId: application.id,
        newStageId: selectedStageId,
        fromStageName: fromStage?.name,
        toStageName: toStage?.name
      }
    });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId: candidate.id,
        applicationId: application.id,
        type: 'stage_change',
        actorId: state.currentUser.id,
        description: `Moved to ${toStage?.name}`,
        metadata: { fromStage: fromStage?.name, toStage: toStage?.name },
        createdAt: new Date().toISOString()
      }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">Move Stage</h2>
          <button aria-label="Close dialog" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Move <strong>{candidate.name}</strong> to a different stage.
            Currently in <strong>{currentStage?.name}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stages.map(stage => (
              <button
                type="button"
                aria-pressed={selectedStageId === stage.id}
                aria-label={`Select ${stage.name}`}
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 6, border: '2px solid',
                  borderColor: selectedStageId === stage.id ? 'var(--accent)' : 'var(--border)',
                  background: selectedStageId === stage.id ? '#F0FBF7' : 'white',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: selectedStageId === stage.id ? 'var(--accent)' : 'var(--border)'
                }} />
                <span style={{ fontSize: 14, fontWeight: selectedStageId === stage.id ? 600 : 400 }}>
                  {stage.name}
                </span>
                {stage.id === application.currentStageId && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>Current</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleMove}>
            Move to Stage
          </button>
        </div>
      </div>
    </div>
  );
}
