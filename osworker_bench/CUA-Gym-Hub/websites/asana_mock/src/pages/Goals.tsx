
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';
import './Goals.css';

export default function Goals() {
  const { state, updateGoal } = useApp();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return '#7ac142';
      case 'at-risk': return '#ffc400';
      case 'off-track': return '#f06a6a';
      default: return '#6d6e6f';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      case 'off-track': return 'Off Track';
      default: return status;
    }
  };

  return (
    <div className="goals-page">
      <div className="goals-header">
        <h1>Goals</h1>
        <button className="create-goal-btn">Create Goal</button>
      </div>

      <div className="goals-list">
        {state.goals.map(goal => {
          const owner = state.users.find(u => u.userId === goal.ownerId);
          const isExpanded = expandedId === goal.goalId;
          const supportingProjects = state.projects.filter(p =>
            goal.supportingProjectIds.includes(p.projectId)
          );

          return (
            <div key={goal.goalId} className={`goal-card ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="goal-header"
                onClick={() => {
                  setExpandedId(isExpanded ? null : goal.goalId);
                  setEditingProgress(null);
                  setEditingStatus(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <h3>{goal.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="goal-status" style={{ backgroundColor: getStatusColor(goal.status) }}>
                    {getStatusText(goal.status)}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`goal-chevron ${isExpanded ? 'rotated' : ''}`}
                  />
                </div>
              </div>
              <p className="goal-description">{goal.description}</p>
              <div className="goal-progress">
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-fill"
                    style={{ width: `${goal.progress}%`, backgroundColor: getStatusColor(goal.status) }}
                  ></div>
                </div>
                <span className="goal-progress-text">{goal.progress}%</span>
              </div>

              {!isExpanded && (
                <div className="goal-meta">
                  <div className="goal-owner">
                    <img src={owner?.avatar} alt={owner?.name} />
                    <span>{owner?.name}</span>
                  </div>
                  <span className="goal-period">{goal.timePeriod}</span>
                </div>
              )}

              {isExpanded && (
                <div className="goal-detail">
                  <div className="goal-detail-row">
                    <span className="goal-detail-label">Status</span>
                    <div className="goal-detail-value">
                      {editingStatus ? (
                        <div className="goal-status-dropdown">
                          {(['on-track', 'at-risk', 'off-track'] as const).map(s => (
                            <button
                              key={s}
                              className={`goal-status-option ${goal.status === s ? 'active' : ''}`}
                              onClick={() => {
                                updateGoal(goal.goalId, { status: s });
                                setEditingStatus(false);
                              }}
                            >
                              <span className="status-dot" style={{ backgroundColor: getStatusColor(s) }} />
                              {getStatusText(s)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          className="goal-status-btn"
                          onClick={() => setEditingStatus(true)}
                        >
                          <span className="status-dot" style={{ backgroundColor: getStatusColor(goal.status) }} />
                          {getStatusText(goal.status)}
                          <ChevronDown size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="goal-detail-row">
                    <span className="goal-detail-label">Progress</span>
                    <div className="goal-detail-value">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingProgress !== null ? editingProgress : goal.progress}
                        onChange={e => setEditingProgress(parseInt(e.target.value))}
                        onMouseUp={() => {
                          if (editingProgress !== null) {
                            updateGoal(goal.goalId, { progress: editingProgress });
                            setEditingProgress(null);
                          }
                        }}
                        className="goal-progress-slider"
                      />
                      <span className="goal-progress-slider-value">
                        {editingProgress !== null ? editingProgress : goal.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="goal-detail-row">
                    <span className="goal-detail-label">Time Period</span>
                    <span className="goal-detail-value">{goal.timePeriod}</span>
                  </div>

                  <div className="goal-detail-row">
                    <span className="goal-detail-label">Owner</span>
                    <div className="goal-detail-value">
                      {owner && (
                        <div className="goal-owner">
                          <img src={owner.avatar} alt={owner.name} />
                          <span>{owner.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {supportingProjects.length > 0 && (
                    <div className="goal-supporting-projects">
                      <span className="goal-detail-label">Supporting Projects</span>
                      <div className="goal-projects-list">
                        {supportingProjects.map(project => (
                          <div
                            key={project.projectId}
                            className="goal-project-link"
                            onClick={() => navigate(`/projects/${project.projectId}`)}
                          >
                            <span className="goal-project-dot" style={{ backgroundColor: project.color }} />
                            {project.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {goal.metrics.length > 0 && (
                    <div className="goal-metrics">
                      <span className="goal-detail-label">Metrics</span>
                      <div className="goal-metrics-list">
                        {goal.metrics.map((metric, idx) => (
                          <span key={idx} className="goal-metric-badge">{metric}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
