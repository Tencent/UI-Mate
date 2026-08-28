
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Search.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { state, toggleTaskComplete } = useApp();
  const navigate = useNavigate();

  const searchTasks = query
    ? state.tasks.filter(task =>
        task.name.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const searchProjects = query
    ? state.projects.filter(project =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="search-page">
      <h1>Search Results for "{query}"</h1>

      {searchTasks.length > 0 && (
        <section className="search-section">
          <h2 className="search-section-header">
            <span>Tasks</span>
            <span className="search-section-count">{searchTasks.length}</span>
          </h2>
          <div className="search-task-list">
            {searchTasks.map(task => {
              const project = state.projects.find(p => p.projectId === task.projectId);
              const assignee = state.users.find(u => u.userId === task.assigneeId);
              const priority = task.customFieldValues['field-1'];
              return (
                <div
                  key={task.taskId}
                  className="search-task-row"
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                >
                  <input
                    type="checkbox"
                    className="search-task-checkbox"
                    checked={task.completed}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggleTaskComplete(task.taskId)}
                  />
                  <span className={`search-task-name ${task.completed ? 'completed-task' : ''}`}>
                    {task.name}
                  </span>
                  {project && (
                    <span className="search-task-project" style={{ color: project.color }}>
                      {project.name}
                    </span>
                  )}
                  {priority && typeof priority === 'string' && ['High', 'Medium', 'Low'].includes(priority) && (
                    <span className={`search-priority-badge priority-${priority.toLowerCase()}`}>
                      {priority}
                    </span>
                  )}
                  {assignee && (
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="search-task-avatar"
                      title={assignee.name}
                    />
                  )}
                  {task.dueDate && (
                    <span className={`search-task-due ${task.dueDate < new Date().toISOString().split('T')[0] && !task.completed ? 'overdue' : ''}`}>
                      {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {searchProjects.length > 0 && (
        <section className="search-section">
          <h2 className="search-section-header">
            <span>Projects</span>
            <span className="search-section-count">{searchProjects.length}</span>
          </h2>
          <div className="search-project-list">
            {searchProjects.map(project => {
              const team = state.teams.find(t => t.teamId === project.teamId);
              return (
                <div
                  key={project.projectId}
                  className="search-project-row"
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                >
                  <span className="search-project-dot" style={{ backgroundColor: project.color }} />
                  <span className="search-project-name">{project.name}</span>
                  {team && (
                    <span className="search-project-team">{team.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {query && searchTasks.length === 0 && searchProjects.length === 0 && (
        <div className="no-results">
          <p>No results found for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="no-results">
          <p>Start typing to search tasks and projects</p>
        </div>
      )}
    </div>
  );
}
  