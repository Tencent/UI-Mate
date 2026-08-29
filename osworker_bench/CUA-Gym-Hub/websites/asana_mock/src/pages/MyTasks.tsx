
import { useApp } from '../context/AppContext';
import { useState, useMemo } from 'react';
import { List, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { useNavigate } from 'react-router-dom';
import './MyTasks.css';

export default function MyTasks() {
  const { state, toggleTaskComplete } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const myTasks = state.tasks.filter(t => t.assigneeId === state.currentUser.userId);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = myTasks.filter(t => t.dueDate === today && !t.completed);
  const upcomingTasks = myTasks.filter(t => t.dueDate && t.dueDate > today && !t.completed);
  const laterTasks = myTasks.filter(t => !t.dueDate && !t.completed);
  const completedTasks = myTasks.filter(t => t.completed);

  // Board view columns
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }, []);

  const sevenDaysFromNow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  const boardColumns = useMemo(() => {
    const recentlyAssigned = myTasks.filter(
      t => !t.completed && new Date(t.createdDate) >= new Date(sevenDaysAgo)
        && t.dueDate !== today
        && !(t.dueDate && t.dueDate > today && t.dueDate <= sevenDaysFromNow)
    );
    const todayCol = myTasks.filter(t => !t.completed && t.dueDate === today);
    const upcomingCol = myTasks.filter(
      t => !t.completed && t.dueDate && t.dueDate > today && t.dueDate <= sevenDaysFromNow
    );
    const laterCol = myTasks.filter(
      t => !t.completed
        && !(new Date(t.createdDate) >= new Date(sevenDaysAgo) && t.dueDate !== today && !(t.dueDate && t.dueDate > today && t.dueDate <= sevenDaysFromNow))
        && t.dueDate !== today
        && !(t.dueDate && t.dueDate > today && t.dueDate <= sevenDaysFromNow)
    );
    const completedCol = myTasks.filter(t => t.completed);

    return [
      { id: 'recently-assigned', label: 'Recently Assigned', tasks: recentlyAssigned },
      { id: 'today', label: 'Today', tasks: todayCol },
      { id: 'upcoming', label: 'Upcoming', tasks: upcomingCol },
      { id: 'later', label: 'Later', tasks: laterCol },
      { id: 'completed', label: 'Completed', tasks: completedCol },
    ];
  }, [myTasks, today, sevenDaysAgo, sevenDaysFromNow]);

  // Calendar view helpers
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
  const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = useMemo(() => {
    const days: { date: Date; day: number; isCurrentMonth: boolean }[] = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(calendarYear, calendarMonth, -i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(calendarYear, calendarMonth, i), day: i, isCurrentMonth: true });
    }
    // Next month padding to fill 6 rows
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calendarYear, calendarMonth + 1, i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false });
    }
    return days;
  }, [calendarYear, calendarMonth, startDay, daysInMonth]);

  const getTasksForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return myTasks.filter(t => t.dueDate === dateStr);
  };

  const prevMonth = () => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getPriorityBadge = (task: Task) => {
    const val = task.customFieldValues['field-1'];
    if (!val || typeof val !== 'string' || !['High', 'Medium', 'Low'].includes(val)) return null;
    const cls = val === 'High' ? 'priority-high' : val === 'Medium' ? 'priority-medium' : 'priority-low';
    return <span className={`priority-badge ${cls}`}>{val}</span>;
  };

  const renderTask = (task: Task) => {
    const project = state.projects.find(p => p.projectId === task.projectId);
    return (
      <div key={task.taskId} className="my-task-item">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskComplete(task.taskId)}
        />
        <div className="my-task-content">
          <div className="my-task-name-row">
            <span className="my-task-name">{task.name}</span>
            {getPriorityBadge(task)}
          </div>
          <div className="my-task-meta">
            {project && (
              <span className="my-task-project" style={{ color: project.color }}>
                {project.name}
              </span>
            )}
            {task.dueDate && (
              <span className="my-task-due">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBoardCard = (task: Task) => {
    const project = state.projects.find(p => p.projectId === task.projectId);
    return (
      <div
        key={task.taskId}
        className="my-board-card"
        onClick={() => navigate(`/projects/${task.projectId}`)}
      >
        <div className="my-board-card-title">{task.name}</div>
        <div className="my-board-card-footer">
          <div className="my-board-card-meta">
            {project && (
              <span className="my-board-card-project" style={{ color: project.color }}>
                {project.name}
              </span>
            )}
            {task.dueDate && (
              <span className={`my-board-card-due ${task.dueDate < today && !task.completed ? 'overdue' : ''}`}>
                {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          {getPriorityBadge(task)}
        </div>
      </div>
    );
  };

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h1>My Tasks</h1>
        <div className="view-switcher">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
            title="List View"
          >
            <List size={18} />
          </button>
          <button
            className={view === 'board' ? 'active' : ''}
            onClick={() => setView('board')}
            title="Board View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={view === 'calendar' ? 'active' : ''}
            onClick={() => setView('calendar')}
            title="Calendar View"
          >
            <CalendarIcon size={18} />
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="my-tasks-list">
          {todayTasks.length > 0 && (
            <div className="task-section">
              <div className="section-header">
                <h2>Today</h2>
                <span className="task-count">{todayTasks.length}</span>
              </div>
              <div className="task-section-content">
                {todayTasks.map(renderTask)}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div className="task-section">
              <div className="section-header">
                <h2>Upcoming</h2>
                <span className="task-count">{upcomingTasks.length}</span>
              </div>
              <div className="task-section-content">
                {upcomingTasks.map(renderTask)}
              </div>
            </div>
          )}

          {laterTasks.length > 0 && (
            <div className="task-section">
              <div className="section-header">
                <h2>Later</h2>
                <span className="task-count">{laterTasks.length}</span>
              </div>
              <div className="task-section-content">
                {laterTasks.map(renderTask)}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="task-section">
              <div className="section-header">
                <h2>Completed</h2>
                <span className="task-count">{completedTasks.length}</span>
              </div>
              <div className="task-section-content">
                {completedTasks.map(renderTask)}
              </div>
            </div>
          )}

          {myTasks.length === 0 && (
            <div className="empty-state-card">
              <div className="empty-state-icon">&#10003;</div>
              <h3>You're all caught up!</h3>
              <p>No tasks assigned to you right now. Use the +New button to create a task.</p>
            </div>
          )}
        </div>
      )}

      {view === 'board' && (
        <div className="my-board-container">
          {boardColumns.map(col => (
            <div key={col.id} className="my-board-column">
              <div className="my-board-column-header">
                <h3>{col.label}</h3>
                <span className="my-board-column-count">{col.tasks.length}</span>
              </div>
              <div className="my-board-column-tasks">
                {col.tasks.map(renderBoardCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="my-calendar-container">
          <div className="my-calendar-header">
            <button className="my-calendar-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <h2>{monthNames[calendarMonth]} {calendarYear}</h2>
            <button className="my-calendar-nav-btn" onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="my-calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="my-calendar-day-header">{day}</div>
            ))}
            {calendarDays.map((dayInfo, idx) => {
              const dayTasks = getTasksForDate(dayInfo.date);
              const isToday = dayInfo.date.toISOString().split('T')[0] === today;
              return (
                <div
                  key={idx}
                  className={`my-calendar-cell ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today-cell' : ''}`}
                >
                  <div className={`my-calendar-date ${isToday ? 'today-date' : ''}`}>
                    {dayInfo.day}
                  </div>
                  <div className="my-calendar-tasks">
                    {dayTasks.slice(0, 3).map(task => {
                      const project = state.projects.find(p => p.projectId === task.projectId);
                      return (
                        <div
                          key={task.taskId}
                          className={`my-calendar-task-pill ${task.completed ? 'completed-pill' : ''}`}
                          style={{ borderLeftColor: project?.color || '#6d6e6f' }}
                          onClick={() => navigate(`/projects/${task.projectId}`)}
                          title={task.name}
                        >
                          {task.name}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <div className="my-calendar-more">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
  