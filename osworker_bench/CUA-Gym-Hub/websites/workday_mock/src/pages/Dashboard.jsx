import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Clock, Calendar, CheckSquare, Megaphone, ArrowRight,
  CheckCircle, AlertCircle, Lightbulb, Users, ChevronLeft, ChevronRight,
  X, Gift, Award, DollarSign, Heart, User, TrendingUp, Inbox, HelpCircle
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

function AwaitingActionCard({ tasks }) {
  const pendingTasks = tasks.filter(t => t.status === 'Pending').slice(0, 3);

  const typeColors = {
    Approval: 'bg-orange-100 text-orange-600',
    Review: 'bg-blue-100 text-blue-600',
    Compliance: 'bg-red-100 text-red-600',
    Information: 'bg-gray-100 text-gray-600',
    'To-Do': 'bg-green-100 text-green-600',
  };

  const typeIcons = {
    Approval: <CheckCircle size={16} />,
    Review: <Clock size={16} />,
    Compliance: <AlertCircle size={16} />,
    Information: <Lightbulb size={16} />,
    'To-Do': <CheckSquare size={16} />,
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `Due in ${diff} days`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare size={18} className="text-primary" />
          Awaiting Your Action
        </h2>
        <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {pendingTasks.length}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {pendingTasks.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">You're all caught up!</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <Link
              key={task.taskId}
              to="/inbox"
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${typeColors[task.type] || 'bg-gray-100 text-gray-600'}`}>
                  {typeIcons[task.type] || <CheckSquare size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{task.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.initiator && (
                      <span className="text-xs text-gray-500">{task.initiator}</span>
                    )}
                    {task.initiator && task.dueDate && (
                      <span className="text-xs text-gray-300">|</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">{getDaysUntil(task.dueDate)}</span>
                    )}
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 mt-1 shrink-0" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function TimelySuggestionsCard({ state }) {
  const suggestions = [];

  // Check clock status
  const dayOfWeek = new Date().getDay();
  if (!state.clockStatus.isClockedIn && dayOfWeek >= 1 && dayOfWeek <= 5) {
    suggestions.push({
      icon: <Clock size={16} className="text-blue-600" />,
      text: "Don't forget to clock in today",
      link: '/time',
    });
  }

  // Check upcoming approved time off
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  (state.timeOffRequests || []).forEach(req => {
    if (req.status === 'Approved' && req.employeeId === state.currentUser.id) {
      const start = new Date(req.startDate);
      if (start >= now && start <= weekFromNow) {
        suggestions.push({
          icon: <Calendar size={16} className="text-green-600" />,
          text: `Upcoming time off: ${formatDate(req.startDate)} - ${formatDate(req.endDate)}`,
          link: '/time',
        });
      }
    }
  });

  // Check pending self-review
  (state.reviews || []).forEach(review => {
    if (review.status === 'Pending Self-Review' && review.employeeId === state.currentUser.id) {
      suggestions.push({
        icon: <Award size={16} className="text-purple-600" />,
        text: `Self-review due for ${review.period}`,
        link: '/performance',
      });
    }
  });

  // Check at-risk goals
  (state.goals || []).forEach(goal => {
    if (goal.status === 'At Risk') {
      suggestions.push({
        icon: <AlertCircle size={16} className="text-orange-600" />,
        text: `Goal at risk: ${goal.title}`,
        link: '/performance',
      });
    }
  });

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-500" />
          Timely Suggestions
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {suggestions.slice(0, 3).map((suggestion, i) => (
          <Link
            key={i}
            to={suggestion.link}
            className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors"
          >
            {suggestion.icon}
            <span className="text-sm text-gray-700">{suggestion.text}</span>
            <ArrowRight size={14} className="text-gray-400 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function TeamHighlightsCard({ currentUser, employees }) {
  const directReports = employees.filter(e => e.managerId === currentUser.id);
  if (directReports.length === 0) return null;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const events = [];

  directReports.forEach(emp => {
    // Check birthday
    if (emp.birthday) {
      const birthday = new Date(emp.birthday);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
      }
      if (thisYearBirthday <= thirtyDaysFromNow) {
        events.push({
          employee: emp,
          type: 'Birthday',
          date: thisYearBirthday,
          icon: <Gift size={14} className="text-pink-500" />,
        });
      }
    }

    // Check work anniversary
    if (emp.workAnniversary || emp.joinDate) {
      const annivDate = new Date(emp.workAnniversary || emp.joinDate);
      const thisYearAnniv = new Date(now.getFullYear(), annivDate.getMonth(), annivDate.getDate());
      if (thisYearAnniv < now) {
        thisYearAnniv.setFullYear(thisYearAnniv.getFullYear() + 1);
      }
      if (thisYearAnniv <= thirtyDaysFromNow) {
        events.push({
          employee: emp,
          type: 'Work Anniversary',
          date: thisYearAnniv,
          icon: <Award size={14} className="text-blue-500" />,
        });
      }
    }
  });

  events.sort((a, b) => a.date - b.date);

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Team Highlights
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {events.map((event, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5">
            <img src={event.employee.avatar} alt={event.employee.name} className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{event.employee.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {event.icon}
                {event.type} - {formatDate(event.date.toISOString())}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsScroll({ announcements }) {
  const [selectedAnn, setSelectedAnn] = useState(null);
  const scrollRef = React.useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Megaphone size={18} className="text-primary" />
            Announcements
          </h2>
        </div>
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {announcements.map(ann => (
              <div
                key={ann.id}
                onClick={() => setSelectedAnn(ann)}
                className="min-w-[280px] max-w-[280px] bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-sm transition-all shrink-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  {ann.priority === 'High' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">
                      Important
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(ann.date)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{ann.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Announcement detail modal */}
      {selectedAnn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnn(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedAnn.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{formatDate(selectedAnn.date)}</span>
                  {selectedAnn.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{selectedAnn.category}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedAnn(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{selectedAnn.content}</p>
          </div>
        </div>
      )}
    </>
  );
}

function MyTeamCard({ currentUser, employees }) {
  const directReports = employees.filter(e => e.managerId === currentUser.id);
  if (directReports.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          My Team
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {directReports.map(emp => (
          <div key={emp.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
              <p className="text-xs text-gray-500 truncate">{emp.title}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Link to="/directory" className="px-2 py-1 text-xs text-primary hover:bg-blue-50 rounded transition-colors font-medium">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const appsTiles = [
  { icon: DollarSign, label: 'Pay', path: '/pay', color: 'bg-green-100 text-green-600' },
  { icon: Heart, label: 'Benefits', path: '/benefits', color: 'bg-pink-100 text-pink-600' },
  { icon: Clock, label: 'Time Off', path: '/time', color: 'bg-blue-100 text-blue-600' },
  { icon: Users, label: 'Directory', path: '/directory', color: 'bg-purple-100 text-purple-600' },
  { icon: TrendingUp, label: 'Performance', path: '/performance', color: 'bg-orange-100 text-orange-600' },
  { icon: User, label: 'Profile', path: '/profile', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Inbox, label: 'Inbox', path: '/inbox', color: 'bg-yellow-100 text-yellow-700' },
  { icon: HelpCircle, label: 'Help', path: '/', color: 'bg-gray-100 text-gray-600' },
];

function AppsGrid() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800">Apps</h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-4 gap-4">
          {appsTiles.map((tile, i) => (
            <Link
              key={i}
              to={tile.path}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${tile.color} group-hover:scale-110 transition-transform`}>
                <tile.icon size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{tile.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useStore();
  const { currentUser, announcements, tasks, timeOffBalance, employees } = state;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">{greeting()}, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      {/* Timely Suggestions */}
      <TimelySuggestionsCard state={state} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Awaiting Your Action */}
        <div className="lg:col-span-1">
          <AwaitingActionCard tasks={tasks} />
        </div>

        {/* Time Off + Team Highlights */}
        <div className="lg:col-span-1 space-y-6">
          {/* Time Off Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Time Off Balance
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-blue-900">Vacation</span>
                <span className="text-xl font-bold text-blue-700">{timeOffBalance.vacation} <span className="text-xs font-normal text-blue-600">hrs</span></span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-sm font-medium text-green-900">Sick Leave</span>
                <span className="text-xl font-bold text-green-700">{timeOffBalance.sick} <span className="text-xs font-normal text-green-600">hrs</span></span>
              </div>
              {timeOffBalance.personal !== undefined && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-purple-900">Personal</span>
                  <span className="text-xl font-bold text-purple-700">{timeOffBalance.personal} <span className="text-xs font-normal text-purple-600">hrs</span></span>
                </div>
              )}
              <Link to="/time" className="block w-full text-center py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Request Time Off
              </Link>
            </div>
          </div>

          {/* Team Highlights */}
          <TeamHighlightsCard currentUser={currentUser} employees={employees} />
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Quick Links</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'My Payslips', path: '/pay' },
                { label: 'Org Chart', path: '/directory' },
                { label: 'Update Profile', path: '/profile' },
                { label: 'Benefits', path: '/benefits' },
                { label: 'Performance', path: '/performance' },
                { label: 'Time Off', path: '/time' },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary hover:text-primary transition-all text-sm font-medium text-gray-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Announcements horizontal scroll */}
      <AnnouncementsScroll announcements={announcements} />

      {/* My Team */}
      <MyTeamCard currentUser={currentUser} employees={employees} />

      {/* Apps Grid */}
      <AppsGrid />
    </div>
  );
}
