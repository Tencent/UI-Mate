
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';
import './Portfolios.css';

export default function Portfolios() {
  const { state, updatePortfolio } = useApp();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const getProjectHealth = (projectId: string) => {
    const tasks = state.tasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return { status: 'on-track', label: 'On Track', color: '#059669' };
    const completedPct = tasks.filter(t => t.completed).length / tasks.length;
    if (completedPct >= 0.75) return { status: 'on-track', label: 'On Track', color: '#059669' };
    if (completedPct >= 0.5) return { status: 'at-risk', label: 'At Risk', color: '#d97706' };
    return { status: 'off-track', label: 'Off Track', color: '#dc2626' };
  };

  const getProjectProgress = (projectId: string) => {
    const tasks = state.tasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  };

  const handleAddProjectToPortfolio = (portfolioId: string, projectId: string) => {
    const portfolio = state.portfolios.find(p => p.portfolioId === portfolioId);
    if (portfolio && !portfolio.projectIds.includes(projectId)) {
      updatePortfolio(portfolioId, {
        projectIds: [...portfolio.projectIds, projectId]
      });
    }
    setShowAddProject(false);
  };

  return (
    <div className="portfolios-page">
      <div className="portfolios-header">
        <h1>Portfolios</h1>
        <button className="create-portfolio-btn">Create Portfolio</button>
      </div>

      <div className="portfolios-grid">
        {state.portfolios.map(portfolio => {
          const portfolioProjects = state.projects.filter(p =>
            portfolio.projectIds.includes(p.projectId)
          );
          const owner = state.users.find(u => u.userId === portfolio.ownerId);
          const isExpanded = expandedId === portfolio.portfolioId;
          const availableProjects = state.projects.filter(
            p => !portfolio.projectIds.includes(p.projectId)
          );

          return (
            <div key={portfolio.portfolioId} className={`portfolio-card ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="portfolio-header"
                onClick={() => setExpandedId(isExpanded ? null : portfolio.portfolioId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="portfolio-color" style={{ backgroundColor: portfolio.color }}></div>
                <h3>{portfolio.name}</h3>
                <ChevronDown
                  size={16}
                  className={`portfolio-chevron ${isExpanded ? 'rotated' : ''}`}
                />
              </div>

              {!isExpanded && (
                <>
                  <p className="portfolio-description">{portfolio.description}</p>
                  <div className="portfolio-meta">
                    <span>{portfolioProjects.length} projects</span>
                    <div className="portfolio-owner">
                      <img src={owner?.avatar} alt={owner?.name} />
                      <span>{owner?.name}</span>
                    </div>
                  </div>
                </>
              )}

              {isExpanded && (
                <div className="portfolio-detail">
                  <p className="portfolio-description">{portfolio.description}</p>

                  <table className="portfolio-projects-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioProjects.map(project => {
                        const health = getProjectHealth(project.projectId);
                        const progress = getProjectProgress(project.projectId);
                        const projectOwner = state.users.find(u => u.userId === project.ownerId);
                        return (
                          <tr
                            key={project.projectId}
                            className="portfolio-project-row"
                            onClick={() => navigate(`/projects/${project.projectId}`)}
                          >
                            <td>
                              <span className="portfolio-project-dot" style={{ backgroundColor: project.color }} />
                              {project.name}
                            </td>
                            <td>
                              <span className="health-badge" style={{ backgroundColor: health.color + '20', color: health.color }}>
                                {health.label}
                              </span>
                            </td>
                            <td>
                              <div className="portfolio-progress-container">
                                <div className="portfolio-progress-bar">
                                  <div
                                    className="portfolio-progress-fill"
                                    style={{ width: `${progress}%`, backgroundColor: health.color }}
                                  />
                                </div>
                                <span className="portfolio-progress-text">{progress}%</span>
                              </div>
                            </td>
                            <td>
                              {projectOwner && (
                                <div className="portfolio-project-owner">
                                  <img src={projectOwner.avatar} alt={projectOwner.name} />
                                  {projectOwner.name}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {availableProjects.length > 0 && (
                    <div className="portfolio-add-project">
                      {showAddProject ? (
                        <div className="portfolio-add-project-dropdown">
                          {availableProjects.map(p => (
                            <button
                              key={p.projectId}
                              className="portfolio-add-project-item"
                              onClick={() => handleAddProjectToPortfolio(portfolio.portfolioId, p.projectId)}
                            >
                              <span className="portfolio-project-dot" style={{ backgroundColor: p.color }} />
                              {p.name}
                            </button>
                          ))}
                          <button
                            className="portfolio-add-project-cancel"
                            onClick={() => setShowAddProject(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="portfolio-add-project-btn"
                          onClick={() => setShowAddProject(true)}
                        >
                          + Add Project
                        </button>
                      )}
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
