import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../utils/dataManager.js'

function SurveyForm({ survey, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const total = survey.questions.length

  const setAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleSubmit = () => {
    const response = {
      id: `sr_${Date.now()}`,
      surveyId: survey.id,
      respondentId: 'user_1',
      submittedAt: new Date().toISOString(),
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
    }
    onSubmit(response)
    onClose()
  }

  const question = survey.questions[currentQ]
  const allAnswered = survey.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{survey.title}</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {survey.questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setCurrentQ(idx)}
                  style={{
                    height: 4, flex: 1, borderRadius: 2, cursor: 'pointer',
                    background: idx < currentQ ? '#6B4FBB' : idx === currentQ ? '#93C5FD' : '#E5E7EB',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Question {currentQ + 1} of {total}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.4 }}>{question.text}</div>

          {question.type === 'likert' && (
            <div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setAnswer(question.id, val)}
                    style={{
                      flex: 1, padding: '14px 8px', borderRadius: 8, cursor: 'pointer',
                      border: `2px solid ${answers[question.id] === val ? '#6B4FBB' : '#E5E7EB'}`,
                      background: answers[question.id] === val ? '#EFF6FF' : '#fff',
                      color: answers[question.id] === val ? '#6B4FBB' : '#374151',
                      fontWeight: 700, fontSize: 18, transition: 'all 0.15s',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          )}

          {question.type === 'enps' && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                {Array.from({ length: 11 }, (_, i) => i).map(val => {
                  const color = val <= 6 ? '#EF4444' : val <= 8 ? '#F59E0B' : '#22C55E'
                  const isSelected = answers[question.id] === val
                  return (
                    <button
                      key={val}
                      onClick={() => setAnswer(question.id, val)}
                      style={{
                        flex: '0 0 calc(9.09% - 4px)', padding: '10px 4px', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${isSelected ? color : '#E5E7EB'}`,
                        background: isSelected ? color : '#fff',
                        color: isSelected ? '#fff' : '#374151',
                        fontWeight: 700, fontSize: 14, minWidth: 36,
                      }}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                <span>Not at all likely (0)</span>
                <span>Extremely likely (10)</span>
              </div>
            </div>
          )}

          {question.type === 'open_text' && (
            <textarea
              className="form-textarea"
              placeholder="Share your thoughts..."
              value={answers[question.id] || ''}
              onChange={e => setAnswer(question.id, e.target.value)}
              style={{ minHeight: 120 }}
            />
          )}
        </div>
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {currentQ > 0 && (
              <button className="btn btn-outline" onClick={() => setCurrentQ(v => v - 1)}>← Previous</button>
            )}
            <div style={{ flex: 1 }} />
            {currentQ < total - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQ(v => v + 1)}
                disabled={answers[question.id] === undefined}
              >
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}>
                Submit Survey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultsView({ survey, results }) {
  if (!results) return null

  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{survey.title} — Results</h3>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#6B4FBB' }}>{results.overallScore}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Overall Score</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>out of 5.0</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: results.eNPS >= 50 ? '#22C55E' : results.eNPS >= 20 ? '#F59E0B' : '#EF4444' }}>
            {results.eNPS}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>eNPS Score</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>-100 to 100</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#374151' }}>{results.responseRate}%</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Response Rate</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Category Scores</div>
        {Object.entries(results.categoryScores).map(([category, score]) => (
          <div key={category} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>{category}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: score >= 4 ? '#22C55E' : score >= 3 ? '#F59E0B' : '#EF4444' }}>
                {score.toFixed(1)}/5.0
              </span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div
                style={{
                  width: `${score / 5 * 100}%`, height: '100%', borderRadius: 4,
                  background: score >= 4 ? '#22C55E' : score >= 3 ? '#F59E0B' : '#EF4444',
                  transition: 'width 0.5s',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Engagement() {
  const { state, updateState } = useApp()
  const [surveyToTake, setSurveyToTake] = useState(null)

  if (!state) return null
  const { surveys, surveyResults } = state

  const activeSurvey = surveys.find(s => s.status === 'active' && !s.userHasResponded)
  const closedSurveys = surveys.filter(s => s.status === 'closed' || s.userHasResponded)

  const handleSubmitResponse = (response) => {
    updateState(prev => ({
      ...prev,
      surveys: prev.surveys.map(s =>
        s.id === response.surveyId ? { ...s, userHasResponded: true } : s
      ),
      tasks: prev.tasks.map(t =>
        t.type === 'survey' && t.relatedEntityId === response.surveyId
          ? { ...t, completed: true }
          : t
      ),
    }))
    setSurveyToTake(null)
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Engagement</h1>
      </div>

      {/* Active survey banner */}
      {activeSurvey && (
        <div style={{
          background: 'linear-gradient(135deg, #6B4FBB, #7C3AED)',
          borderRadius: 10, padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {activeSurvey.title} is live!
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              Complete by {formatDate(activeSurvey.endDate)} • Only takes 5 minutes
            </div>
          </div>
          <button
            className="btn"
            onClick={() => setSurveyToTake(activeSurvey)}
            style={{ background: '#fff', color: '#6B4FBB', fontWeight: 700, border: 'none' }}
          >
            Take survey
          </button>
        </div>
      )}

      {/* Results for completed/responded surveys */}
      {closedSurveys.map(survey => {
        const results = surveyResults[survey.id]
        if (!results) return null
        return (
          <div key={survey.id}>
            {survey.userHasResponded && survey.status === 'active' && (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166534', fontWeight: 500 }}>
                ✓ You have already responded to {survey.title}. Results below.
              </div>
            )}
            <ResultsView survey={survey} results={results} />
          </div>
        )
      })}

      {surveyToTake && (
        <SurveyForm
          survey={surveyToTake}
          onSubmit={handleSubmitResponse}
          onClose={() => setSurveyToTake(null)}
        />
      )}
    </div>
  )
}
