
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import './Projects.css';

export default function Projects() {
  const { state, toggleProjectStar } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button
          className="create-project-btn-main"
          onClick={() => setShowCreateModal(true)}
        >
          Create Project
        </button>
      </div>

      <div className="projects-grid">
        {state.projects.map(project => {
          const projectTasks = state.tasks.filter(t => t.projectId === project.projectId);
          const completedTasks = projectTasks.filter(t => t.completed).length;
          const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
          const team = state.teams.find(t => t.teamId === project.teamId);

          return (
            <Link key={project.projectId} to={`/projects/${project.projectId}`} className="project-card-main">
              <div className="project-card-header-main">
                <div className="project-icon-main" style={{ backgroundColor: project.color }}>
                  <img src={project.icon} alt="" />
                </div>
                <button
                  className="star-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleProjectStar(project.projectId);
                  }}
                >
                  <Star
                    size={18}
                    fill={project.starred ? '#f06a6a' : 'none'}
                    color={project.starred ? '#f06a6a' : '#6d6e6f'}
                  />
                </button>
              </div>

              <h3>{project.name}</h3>
              <p className="project-description-main">{project.description}</p>

              <div className="project-meta">
                <span className="project-team">{team?.name}</span>
                <span className="project-members">{project.memberIds.length} members</span>
              </div>

              <div className="project-progress-main">
                <div className="progress-bar-main">
                  <div
                    className="progress-fill-main"
                    style={{ width: `${progress}%`, backgroundColor: project.color }}
                  ></div>
                </div>
                <span className="progress-text-main">{Math.round(progress)}%</span>
              </div>
            </Link>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
