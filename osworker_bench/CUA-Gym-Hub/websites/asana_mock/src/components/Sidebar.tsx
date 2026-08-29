
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Bell, Briefcase, Target, Star, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import CreateProjectModal from './CreateProjectModal';
import './Sidebar.css';

export default function Sidebar() {
  const { state } = useApp();
  const location = useLocation();
  const [expandedTeams, setExpandedTeams] = useState<string[]>(['team-1']);
  const [showStarred, setShowStarred] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const starredProjects = state.projects.filter(p => p.starred);
  const unreadCount = state.notifications.filter(n => !n.read && !n.archived && n.userId === state.currentUser.userId).length;

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link to="/my-tasks" className={`sidebar-link ${isActive('/my-tasks') ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <span>My Tasks</span>
          </Link>

          <Link to="/inbox" className={`sidebar-link ${isActive('/inbox') ? 'active' : ''}`}>
            <Bell size={20} />
            <span>Inbox</span>
            {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
          </Link>

          <Link to="/portfolios" className={`sidebar-link ${isActive('/portfolios') ? 'active' : ''}`}>
            <Briefcase size={20} />
            <span>Portfolios</span>
          </Link>

          <Link to="/goals" className={`sidebar-link ${isActive('/goals') ? 'active' : ''}`}>
            <Target size={20} />
            <span>Goals</span>
          </Link>

          <div className="sidebar-divider"></div>

          {starredProjects.length > 0 && (
            <>
              <button
                className="sidebar-section-header"
                onClick={() => setShowStarred(!showStarred)}
              >
                {showStarred ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Star size={16} />
                <span>Starred</span>
              </button>

              {showStarred && (
                <div className="sidebar-section">
                  {starredProjects.map(project => (
                    <Link
                      key={project.projectId}
                      to={`/projects/${project.projectId}`}
                      className="sidebar-project-link"
                    >
                      <div
                        className="project-color-dot"
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <span>{project.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <button
            className="sidebar-section-header"
            onClick={() => setShowProjects(!showProjects)}
          >
            {showProjects ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Projects</span>
          </button>

          {showProjects && (
            <div className="sidebar-section">
              <Link to="/projects" className="sidebar-link-small">
                All Projects
              </Link>
            </div>
          )}

          <button
            className="sidebar-section-header"
            onClick={() => setShowTeams(!showTeams)}
          >
            {showTeams ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Teams</span>
          </button>

          {showTeams && (
            <div className="sidebar-section">
              {state.teams.map(team => (
                <div key={team.teamId}>
                  <button
                    className="sidebar-team-header"
                    onClick={() => toggleTeam(team.teamId)}
                  >
                    {expandedTeams.includes(team.teamId) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    <span>{team.name}</span>
                  </button>

                  {expandedTeams.includes(team.teamId) && (
                    <div className="sidebar-team-projects">
                      {state.projects
                        .filter(p => p.teamId === team.teamId)
                        .map(project => (
                          <Link
                            key={project.projectId}
                            to={`/projects/${project.projectId}`}
                            className="sidebar-project-link"
                          >
                            <div
                              className="project-color-dot"
                              style={{ backgroundColor: project.color }}
                            ></div>
                            <span>{project.name}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>

        <button
          className="create-project-btn"
          onClick={() => setShowCreateProject(true)}
        >
          <Plus size={20} />
          <span>Create Project</span>
        </button>
      </aside>

      {showCreateProject && (
        <CreateProjectModal onClose={() => setShowCreateProject(false)} />
      )}
    </>
  );
}
