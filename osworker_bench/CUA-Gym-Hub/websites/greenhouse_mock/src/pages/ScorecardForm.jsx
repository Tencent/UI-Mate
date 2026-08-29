import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';

const ratingLabels = ['', 'Strong No', 'No', 'Yes', 'Strong Yes'];
const ratingColors = ['', '#DC2626', '#F59E0B', '#16A34A', '#1B3A2D'];

const recommendationOptions = [
  { key: 'strong_no', label: 'Strong No', bg: '#DC2626', color: 'white' },
  { key: 'no', label: 'No', bg: '#F59E0B', color: 'white' },
  { key: 'no_opinion', label: 'No Opinion', bg: '#6B7280', color: 'white' },
  { key: 'yes', label: 'Yes', bg: '#16A34A', color: 'white' },
  { key: 'strong_yes', label: 'Strong Yes', bg: '#1B3A2D', color: 'white' },
];

export default function ScorecardForm() {
  const { candidateId, scorecardId } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const scorecard = state.scorecards.find(sc => sc.id === scorecardId);
  const candidate = state.candidates.find(c => c.id === candidateId);

  const [attributes, setAttributes] = useState(
    scorecard?.attributes.map(a => ({ ...a })) || []
  );
  const [recommendation, setRecommendation] = useState(scorecard?.overallRecommendation || null);
  const [notes, setNotes] = useState(scorecard?.notes || '');
  const [submitted, setSubmitted] = useState(!!scorecard?.submittedAt);

  if (!scorecard || !candidate) return <div style={{ padding: 24 }}>Scorecard not found</div>;

  const interviewer = state.users.find(u => u.id === scorecard.interviewerId);
  const app = state.applications.find(a => a.id === scorecard.applicationId);
  const job = app ? state.jobs.find(j => j.id === app.jobId) : null;
  const stage = state.jobStages.find(s => s.id === scorecard.stageId);

  const isReadOnly = submitted && scorecard.submittedAt;

  const handleRatingChange = (attrIndex, rating) => {
    if (isReadOnly) return;
    setAttributes(prev => prev.map((a, i) => i === attrIndex ? { ...a, rating } : a));
  };

  const handleNoteChange = (attrIndex, note) => {
    if (isReadOnly) return;
    setAttributes(prev => prev.map((a, i) => i === attrIndex ? { ...a, note } : a));
  };

  const handleSubmit = () => {
    if (!recommendation) return;
    const now = new Date().toISOString();
    dispatch({
      type: 'UPDATE_SCORECARD',
      payload: {
        id: scorecardId,
        attributes,
        overallRecommendation: recommendation,
        notes,
        submittedAt: now
      }
    });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now().toString(),
        candidateId,
        applicationId: app?.id,
        type: 'scorecard_submitted',
        actorId: state.currentUser.id,
        description: `${state.currentUser.name} submitted scorecard: ${recommendationOptions.find(r => r.key === recommendation)?.label}`,
        metadata: { scorecardId, recommendation },
        createdAt: now
      }
    });
    setSubmitted(true);
  };

  const ratingIcon = (rating) => {
    if (rating >= 4) return <ThumbsUp size={14} color="#16A34A" />;
    if (rating === 1) return <ThumbsDown size={14} color="#DC2626" />;
    if (rating === 3) return <ThumbsUp size={14} color="#2D9D78" />;
    return null;
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header banner */}
      <div style={{ background: '#1B3A2D', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(buildLink(`/candidates/${candidateId}`))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: 0 }}
        >
          <ArrowLeft size={14} />
        </button>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Interview Scorecard</span>
        {isReadOnly && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Submitted</span>}
      </div>

      <div style={{ background: 'white', padding: '24px' }}>
        {/* Candidate header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--divider)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700
          }}>
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{candidate.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {job?.title} · {stage?.name}
            </div>
            {interviewer && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Interviewer: {interviewer.name}
              </div>
            )}
            {scorecard.submittedAt && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Submitted: {format(new Date(scorecard.submittedAt), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* Soft skills / Attributes */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Evaluation Criteria
          </h3>
          {attributes.map((attr, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>{attr.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map(r => (
                    <button
                      key={r}
                      title={ratingLabels[r]}
                      onClick={() => handleRatingChange(i, r)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                        borderColor: attr.rating === r ? ratingColors[r] : '#E5E7EB',
                        background: attr.rating === r ? ratingColors[r] : 'white',
                        cursor: isReadOnly ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {attr.rating === r && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white' }} />}
                    </button>
                  ))}
                </div>
                <div style={{ marginLeft: 8 }}>
                  {attr.rating ? ratingIcon(attr.rating) : null}
                </div>
                {attr.rating > 0 && (
                  <span style={{ fontSize: 11, color: ratingColors[attr.rating], fontWeight: 600 }}>
                    {ratingLabels[attr.rating]}
                  </span>
                )}
              </div>
              {!isReadOnly && (
                <input
                  className="form-input"
                  placeholder="Notes..."
                  value={attr.note}
                  onChange={(e) => handleNoteChange(i, e.target.value)}
                  style={{ marginTop: 6, marginLeft: 172 }}
                />
              )}
              {isReadOnly && attr.note && (
                <div style={{ marginTop: 4, marginLeft: 172, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {attr.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall recommendation */}
        <div style={{ marginBottom: 24, padding: '20px', background: '#F9FAFB', borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Overall Recommendation</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recommendationOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => !isReadOnly && setRecommendation(opt.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  borderColor: recommendation === opt.key ? opt.bg : 'var(--border)',
                  background: recommendation === opt.key ? opt.bg : 'white',
                  color: recommendation === opt.key ? opt.color : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: isReadOnly ? 'default' : 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overall notes */}
        <div style={{ marginBottom: 24 }}>
          <label className="form-label">Overall Notes</label>
          {isReadOnly ? (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '8px 0' }}>
              {notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes</span>}
            </div>
          ) : (
            <textarea
              className="form-textarea"
              placeholder="Overall notes and comments..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ minHeight: 100 }}
            />
          )}
        </div>

        {/* Submit button */}
        {!isReadOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!recommendation}
              style={{ opacity: !recommendation ? 0.5 : 1 }}
            >
              Submit Scorecard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
