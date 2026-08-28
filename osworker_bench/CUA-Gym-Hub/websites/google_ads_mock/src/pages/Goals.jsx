import React from 'react'
import { Target } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const GOALS = [
  { label: 'Website purchases', count: 3 },
  { label: 'Form submissions', count: 1 },
  { label: 'Phone calls', count: 2 },
]

export default function Goals() {
  const { state, dispatch } = useApp()
  const selectedGoal = state?.selectedGoal || null

  function handleSelectGoal(label) {
    dispatch({ type: 'SET_GOAL', payload: selectedGoal === label ? null : label })
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Goals</h1>
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Target size={24} color="#1A73E8" />
          <span style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>Conversion Goals</span>
        </div>
        <p style={{ fontSize: 14, color: '#5F6368', marginBottom: 24 }}>
          Set up conversion goals to measure actions that matter to your business, such as purchases, sign-ups, or phone calls.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {GOALS.map(g => {
            const isSelected = selectedGoal === g.label
            return (
              <div
                key={g.label}
                onClick={() => handleSelectGoal(g.label)}
                style={{
                  background: isSelected ? '#E8F0FE' : '#F8F9FA',
                  border: `1px solid ${isSelected ? '#1A73E8' : '#DADCE0'}`,
                  borderRadius: 8, padding: 16, cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  outline: 'none'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#1A73E8' : '#202124', marginBottom: 4 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: '#5F6368' }}>{g.count} conversion action{g.count !== 1 ? 's' : ''}</div>
              </div>
            )
          })}
        </div>
        {selectedGoal && (
          <div style={{ marginTop: 20, fontSize: 13, color: '#1A73E8', background: '#E8F0FE', borderRadius: 6, padding: '8px 14px' }}>
            Selected goal: <strong>{selectedGoal}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
