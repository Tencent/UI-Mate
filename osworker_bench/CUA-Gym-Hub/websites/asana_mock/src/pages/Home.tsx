
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { CheckSquare, Bell, Calendar } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { state, toggleTaskComplete } = useApp();

  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.userId && !t.completed);
  const tasksToday = myTasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate === today;
  });

  const unreadCount = state.notifications.filter(n => !n.read && !n.archived).length;
  const recentProjects = state.projects.slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>{greeting}, {state.currentUser.name.split(' ')[0]}!</h1>
        <p className="home-subtitle">Here's what's happening with your work</p>
      </div>

      <div className="quick-access-cards">
        <Link to="/my-tasks" className="quick-card">
          <div className="quick-card-icon" style={{ backgroundColor: '#f06a6a' }}>
            <CheckSquare size={24} />
          </div>
          <div className="quick-card-content">
            <div className="quick-card-title">My Tasks</div>
            <div className="quick-card-count">{tasksToday.length} due today</div>
          </div>
        </Link>

        <Link to="/inbox" className="quick-card">
          <div className="quick-card-icon" style={{ backgroundColor: '#4186e0' }}>
            <Bell size={24} />
          </div>
          <div className="quick-card-content">
            <div className="quick-card-title">Inbox</div>
            <div className="quick-card-count">{unreadCount} unread</div>
          </div>
        </Link>

        <Link to="/my-tasks?view=calendar" className="quick-card">
          <div className="quick-card-icon" style={{ backgroundColor: '#7ac142' }}>
            <Calendar size={24} />
          </div>
          <div className="quick-card-content">
            <div className="quick-card-title">Calendar</div>
            <div className="quick-card-count">View schedule</div>
          </div>
        </Link>
      </div>

      <section className="home-section">
        <h2>Tasks Due Soon</h2>
        <div className="task-list">
          {myTasks.slice(0, 5).map(task => {
            const project = state.projects.find(p => p.projectId === task.projectId);
            return (
              <div key={task.taskId} className="task-item">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskComplete(task.taskId)}
                />
                <div className="task-info">
                  <div className="task-name">{task.name}</div>
                  {project && (
                    <div className="task-project" style={{ color: project.color }}>
                      {project.name}
                    </div>
                  )}
                </div>
                {task.dueDate && (
                  <div className="task-due-date">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <h2>Recent Projects</h2>
        <div className="project-grid">
          {recentProjects.map(project => {
            const projectTasks = state.tasks.filter(t => t.projectId === project.projectId);
            const completedTasks = projectTasks.filter(t => t.completed).length;
            const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

            return (
              <Link key={project.projectId} to={`/projects/${project.projectId}`} className="project-card">
                <div className="project-card-header">
                  <div className="project-icon" style={{ backgroundColor: project.color }}>
                    <img src={project.icon} alt="" />
                  </div>
                  <h3>{project.name}</h3>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: project.color }}></div>
                  </div>
                  <span className="progress-text">{Math.round(progress)}% complete</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
  