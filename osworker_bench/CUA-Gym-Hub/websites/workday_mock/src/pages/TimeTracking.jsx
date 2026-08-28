import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Play, Square, Calendar, Clock, Plus, Heart, ChevronLeft, ChevronRight, Save, Send, X, Briefcase, Trash2, Check } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { startOfWeek, addDays, format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';

const AVAILABLE_PROJECTS = ['Project Alpha', 'Project Beta', 'General', 'Internal Meetings', 'Training'];

function BalanceDetailModal({ type, balance, onClose }) {
  const typeLabels = { vacation: 'Vacation', sick: 'Sick Leave', personal: 'Personal' };
  const accrued = type === 'vacation' ? 160 : type === 'sick' ? 48 : 24;
  const used = accrued - balance;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{typeLabels[type]} Balance Detail</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 uppercase font-semibold">Accrued YTD</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{accrued} hrs</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 uppercase font-semibold">Used YTD</p>
              <p className="text-xl font-bold text-red-700 mt-1">{used} hrs</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 uppercase font-semibold">Available</p>
              <p className="text-xl font-bold text-green-700 mt-1">{balance} hrs</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Transactions</h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-3 text-sm bg-gray-50">
                <span className="text-gray-500 font-medium">Date</span>
                <span className="text-gray-500 font-medium">Amount</span>
              </div>
              <div className="flex justify-between items-center p-3 text-sm">
                <span className="text-gray-700">Jan 1 - Accrual</span>
                <span className="text-green-600 font-medium">+{Math.round(accrued / 4)} hrs</span>
              </div>
              <div className="flex justify-between items-center p-3 text-sm">
                <span className="text-gray-700">Apr 1 - Accrual</span>
                <span className="text-green-600 font-medium">+{Math.round(accrued / 4)} hrs</span>
              </div>
              {used > 0 && (
                <div className="flex justify-between items-center p-3 text-sm">
                  <span className="text-gray-700">Various - Used</span>
                  <span className="text-red-600 font-medium">-{used} hrs</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 text-sm">
                <span className="text-gray-700">Jul 1 - Accrual</span>
                <span className="text-green-600 font-medium">+{Math.round(accrued / 4)} hrs</span>
              </div>
              <div className="flex justify-between items-center p-3 text-sm">
                <span className="text-gray-700">Oct 1 - Accrual</span>
                <span className="text-green-600 font-medium">+{Math.round(accrued / 4)} hrs</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Pending requests not deducted from balance until approved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimeTracking() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const { clockStatus, timeEntries, timeOffRequests, timeOffBalance } = state;
  const [activeTab, setActiveTab] = useState('tracking');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Form state for time off
  const [requestType, setRequestType] = useState('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Cancel confirmation
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Weekly Grid State
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Timesheet project rows
  const defaultProjects = ['Project Alpha', 'General'];
  const [timesheetProjects, setTimesheetProjects] = useState(defaultProjects);
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  // Controlled timesheet data: { "project|date": hours }
  const [timesheetData, setTimesheetData] = useState({});

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Balance detail modal
  const [balanceDetail, setBalanceDetail] = useState(null);

  // Initialize timesheet from existing entries
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    const data = {};
    timeEntries.forEach(entry => {
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (entry.date === dateStr) {
          const key = `${entry.project}|${dateStr}`;
          data[key] = (data[key] || 0) + entry.hours;
        }
      });
    });
    setTimesheetData(data);
  }, [currentWeekStart, timeEntries.length]);

  const showSuccess = (msg) => {
    addToast(msg, 'success');
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (clockStatus.isClockedIn && clockStatus.startTime) {
      const start = new Date(clockStatus.startTime);
      const updateTimer = () => {
        const now = new Date();
        const diff = now - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(interval);
  }, [clockStatus.isClockedIn, clockStatus.startTime]);

  const handleClockAction = () => {
    if (clockStatus.isClockedIn) {
      dispatch({ type: 'CLOCK_OUT' });
    } else {
      dispatch({ type: 'CLOCK_IN' });
    }
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_TIME_OFF',
      payload: { type: requestType, startDate, endDate, reason }
    });
    setStartDate('');
    setEndDate('');
    setReason('');
    showSuccess('Time off request submitted!');
  };

  const handleCancelRequest = (id) => {
    setCancelConfirmId(id);
  };

  const confirmCancelRequest = () => {
    if (cancelConfirmId) {
      dispatch({ type: 'CANCEL_TIME_OFF', payload: cancelConfirmId });
      setCancelConfirmId(null);
    }
  };

  const handleWeekChange = (direction) => {
    setCurrentWeekStart(prev => addDays(prev, direction * 7));
  };

  // Timesheet cell update
  const handleCellChange = (project, dateStr, value) => {
    const key = `${project}|${dateStr}`;
    setTimesheetData(prev => ({ ...prev, [key]: value }));
  };

  const handleCellBlur = (project, dateStr, value) => {
    const hours = parseFloat(value);
    if (isNaN(hours) || hours < 0) return;

    // Find existing entry for this project/date
    const existing = timeEntries.find(e => e.project === project && e.date === dateStr);
    if (existing) {
      dispatch({ type: 'UPDATE_TIME_ENTRY', payload: { entryId: existing.entryId, hours } });
    } else if (hours > 0) {
      dispatch({ type: 'ADD_TIME_ENTRY', payload: { date: dateStr, hours, project } });
    }
  };

  const getTimesheetValue = (project, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const key = `${project}|${dateStr}`;
    return timesheetData[key] !== undefined ? timesheetData[key] : '';
  };

  const getProjectTotal = (project) => {
    return weekDays.reduce((sum, day) => {
      const val = parseFloat(getTimesheetValue(project, day)) || 0;
      return sum + val;
    }, 0);
  };

  const getDayTotal = (day) => {
    return timesheetProjects.reduce((sum, project) => {
      const val = parseFloat(getTimesheetValue(project, day)) || 0;
      return sum + val;
    }, 0);
  };

  const getGrandTotal = () => {
    return timesheetProjects.reduce((sum, project) => sum + getProjectTotal(project), 0);
  };

  const handleSaveDraft = () => {
    // Persist all current timesheet cell data as time entries to the store
    Object.entries(timesheetData).forEach(([key, value]) => {
      const hours = parseFloat(value);
      if (!isNaN(hours) && hours > 0) {
        const [project, dateStr] = key.split('|');
        const existing = timeEntries.find(e => e.project === project && e.date === dateStr);
        if (existing) {
          dispatch({ type: 'UPDATE_TIME_ENTRY', payload: { entryId: existing.entryId, hours } });
        } else {
          dispatch({ type: 'ADD_TIME_ENTRY', payload: { date: dateStr, hours, project } });
        }
      }
    });
    showSuccess('Timesheet saved as draft.');
  };

  const handleSubmitTimesheet = () => {
    // Mark all pending entries for this week as submitted
    const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEnd = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    timeEntries.forEach(entry => {
      if (entry.status === 'Pending' && entry.date >= weekStart && entry.date <= weekEnd) {
        dispatch({ type: 'UPDATE_TIME_ENTRY', payload: { entryId: entry.entryId, status: 'Submitted' } });
      }
    });
    showSuccess('Timesheet submitted for approval!');
  };

  const handleAddProject = (project) => {
    if (!timesheetProjects.includes(project)) {
      setTimesheetProjects([...timesheetProjects, project]);
    }
    setAddProjectOpen(false);
  };

  const handleRemoveProject = (project) => {
    if (timesheetProjects.length <= 1) return;
    setTimesheetProjects(timesheetProjects.filter(p => p !== project));
  };

  // Calendar data
  const calendarStart = startOfMonth(calendarMonth);
  const calendarEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const startPadding = getDay(calendarStart); // 0=Sun

  const getRequestsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeOffRequests.filter(req => {
      return dateStr >= req.startDate && dateStr <= req.endDate;
    });
  };

  const requestStatusColors = {
    Approved: 'bg-green-200 text-green-800',
    Pending: 'bg-yellow-200 text-yellow-800',
    Denied: 'bg-red-200 text-red-800',
    Cancelled: 'bg-gray-200 text-gray-600',
  };

  // Company holidays for current year
  const currentYear = calendarMonth.getFullYear();
  const companyHolidays = [
    { date: `${currentYear}-01-01`, name: "New Year's Day" },
    { date: `${currentYear}-01-20`, name: 'MLK Day' },
    { date: `${currentYear}-02-17`, name: "Presidents' Day" },
    { date: `${currentYear}-05-26`, name: 'Memorial Day' },
    { date: `${currentYear}-07-04`, name: 'Independence Day' },
    { date: `${currentYear}-09-01`, name: 'Labor Day' },
    { date: `${currentYear}-11-27`, name: 'Thanksgiving' },
    { date: `${currentYear}-11-28`, name: 'Day After Thanksgiving' },
    { date: `${currentYear}-12-25`, name: 'Christmas Day' },
  ];

  const getHolidayForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return companyHolidays.find(h => h.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Time & Absence</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tracking' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Time Tracking
          </button>
          <button
            onClick={() => setActiveTab('absence')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'absence' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Absence
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {activeTab === 'tracking' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clock In/Out Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center lg:col-span-1">
              <div className="mb-4">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Current Status</span>
                <h2 className={`text-xl font-bold mt-1 ${clockStatus.isClockedIn ? 'text-green-600' : 'text-gray-400'}`}>
                  {clockStatus.isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
                </h2>
              </div>

              <button
                onClick={handleClockAction}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 transition-all shadow-lg transform active:scale-95 ${
                  clockStatus.isClockedIn
                    ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100'
                }`}
              >
                {clockStatus.isClockedIn ? <Square size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                <span className="mt-2 font-bold">{clockStatus.isClockedIn ? 'STOP' : 'START'}</span>
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Hours Worked Today</p>
                <p className="text-3xl font-mono font-bold text-gray-800">{elapsedTime}</p>
                {clockStatus.isClockedIn && (
                  <p className="text-xs text-gray-400 mt-1">
                    Started at: {new Date(clockStatus.startTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Weekly Timesheet Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} /> Weekly Timesheet
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleWeekChange(-1)} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={20} /></button>
                  <span className="text-sm font-medium text-gray-700">
                    {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                  </span>
                  <button onClick={() => handleWeekChange(1)} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto p-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b font-medium text-gray-500 w-40">Project</th>
                      {weekDays.map(day => (
                        <th key={day.toString()} className={`text-center p-2 border-b font-medium min-w-[60px] ${isToday(day) ? 'text-primary' : 'text-gray-500'}`}>
                          <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                          <div className={isToday(day) ? 'text-primary font-bold' : 'text-gray-900'}>{format(day, 'd')}</div>
                        </th>
                      ))}
                      <th className="text-center p-2 border-b font-medium text-gray-500 w-16">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetProjects.map((project, idx) => (
                      <tr key={project}>
                        <td className="p-2 border-b font-medium text-gray-800 flex items-center gap-1">
                          <Briefcase size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">{project}</span>
                        </td>
                        {weekDays.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const val = getTimesheetValue(project, day);
                          return (
                            <td key={day.toString()} className="p-2 border-b text-center">
                              <input
                                type="text"
                                className="w-full text-center p-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
                                placeholder="-"
                                value={val}
                                onChange={e => handleCellChange(project, dateStr, e.target.value)}
                                onBlur={e => handleCellBlur(project, dateStr, e.target.value)}
                              />
                            </td>
                          );
                        })}
                        <td className="p-2 border-b text-center font-bold text-gray-800">
                          {getProjectTotal(project) || 0}
                        </td>
                        <td className="p-2 border-b text-center">
                          {timesheetProjects.length > 1 && (
                            <button
                              onClick={() => handleRemoveProject(project)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Remove row"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="bg-gray-50">
                      <td className="p-2 font-bold text-gray-700">Total</td>
                      {weekDays.map(day => (
                        <td key={day.toString()} className="p-2 text-center font-bold text-gray-700">
                          {getDayTotal(day) || 0}
                        </td>
                      ))}
                      <td className="p-2 text-center font-bold text-primary text-lg">
                        {getGrandTotal() || 0}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Add Project Row */}
                <div className="mt-2">
                  {addProjectOpen ? (
                    <div className="flex items-center gap-2">
                      <select
                        onChange={e => { if (e.target.value) handleAddProject(e.target.value); }}
                        className="p-1.5 border border-gray-300 rounded-md text-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>Select project...</option>
                        {AVAILABLE_PROJECTS.filter(p => !timesheetProjects.includes(p)).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <button onClick={() => setAddProjectOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddProjectOpen(true)}
                      className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"
                    >
                      <Plus size={14} /> Add Project Row
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                >
                  <Save size={16} /> Save Draft
                </button>
                <button
                  onClick={handleSubmitTimesheet}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  <Send size={16} /> Submit for Approval
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Recent Entries Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Hours</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeEntries.slice().reverse().slice(0, 15).map((entry) => (
                    <tr key={entry.entryId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{formatDate(entry.date)}</td>
                      <td className="px-6 py-4">{entry.project}</td>
                      <td className="px-6 py-4 font-medium">{entry.hours}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          entry.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          entry.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'absence' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balances */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
              onClick={() => setBalanceDetail('vacation')}
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">Vacation Balance</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{timeOffBalance.vacation} <span className="text-base font-normal text-gray-400">hours</span></p>
                <p className="text-xs text-primary mt-1">Click for details</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Calendar size={24} />
              </div>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
              onClick={() => setBalanceDetail('sick')}
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">Sick Leave Balance</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{timeOffBalance.sick} <span className="text-base font-normal text-gray-400">hours</span></p>
                <p className="text-xs text-primary mt-1">Click for details</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <Heart size={24} />
              </div>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
              onClick={() => setBalanceDetail('personal')}
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">Personal Balance</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{timeOffBalance.personal} <span className="text-base font-normal text-gray-400">hours</span></p>
                <p className="text-xs text-primary mt-1">Click for details</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Request Time Off</h3>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Vacation">Vacation</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Day</option>
                  <option value="Jury Duty">Jury Duty</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Optional details..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Submit Request
              </button>
            </form>
          </div>

          {/* Request History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Request History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Dates</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeOffRequests.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No requests found</td></tr>
                  ) : (
                    timeOffRequests.map((req) => (
                      <tr key={req.requestId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{req.type}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(req.startDate)} - {formatDate(req.endDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            req.status === 'Denied' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      <td className="px-6 py-4 text-right">
                          {req.status === 'Pending' && (
                            cancelConfirmId === req.requestId ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-gray-600">Cancel this request?</span>
                                <button
                                  onClick={confirmCancelRequest}
                                  className="text-white bg-red-600 hover:bg-red-700 text-xs font-medium px-2 py-1 rounded"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setCancelConfirmId(null)}
                                  className="text-gray-600 border border-gray-300 hover:bg-gray-50 text-xs font-medium px-2 py-1 rounded"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCancelRequest(req.requestId)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 hover:bg-red-50 px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Absence Calendar</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={20} /></button>
                <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                  {format(calendarMonth, 'MMMM yyyy')}
                </span>
                <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="p-4">
              {/* Legend */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded bg-green-200"></div> Approved
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded bg-yellow-200"></div> Pending
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded bg-red-200"></div> Denied
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded bg-gray-300"></div> Holiday
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500 uppercase">
                    {d}
                  </div>
                ))}

                {/* Padding for start of month */}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="bg-white p-2 min-h-[80px]"></div>
                ))}

                {/* Calendar days */}
                {calendarDays.map(day => {
                  const requests = getRequestsForDate(day);
                  const today = isToday(day);
                  const holiday = getHolidayForDate(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`p-2 min-h-[80px] ${today ? 'ring-2 ring-primary ring-inset' : ''} ${holiday ? 'bg-gray-100' : 'bg-white'}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${today ? 'text-primary font-bold' : holiday ? 'text-gray-500' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {holiday && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-gray-300 text-gray-700" title={holiday.name}>
                            {holiday.name}
                          </div>
                        )}
                        {requests.map(req => (
                          <div
                            key={req.requestId}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${requestStatusColors[req.status] || 'bg-gray-100 text-gray-600'}`}
                            title={`${req.type} - ${req.status}`}
                          >
                            {req.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Detail Modal */}
      {balanceDetail && (
        <BalanceDetailModal
          type={balanceDetail}
          balance={timeOffBalance[balanceDetail]}
          onClose={() => setBalanceDetail(null)}
        />
      )}
    </div>
  );
}
