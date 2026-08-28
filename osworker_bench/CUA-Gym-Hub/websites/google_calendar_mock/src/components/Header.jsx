import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu, ChevronLeft, ChevronRight, Search, Settings, HelpCircle, User, ChevronDown, Plus, Database } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addHours, startOfTomorrow, addDays as addDaysFn } from 'date-fns';
import { generateId, getSessionId, mockNow } from '../utils/helpers';

export default function Header({ onSearch }) {
  const { state, dispatch } = useStore();
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef(null);
  const quickAddRef = useRef(null);
  const settingsRef = useRef(null);
  const date = new Date(state.currentDate);
  const sid = getSessionId();
  const goHref = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsViewMenuOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target)) {
        setQuickAddOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsViewMenuOpen(false);
        setQuickAddOpen(false);
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handlePrev = () => {
    let newDate;
    if (state.view === 'month') newDate = subMonths(date, 1);
    else if (state.view === 'week') newDate = subWeeks(date, 1);
    else newDate = subDays(date, 1);
    dispatch({ type: 'SET_DATE', payload: newDate.toISOString() });
  };

  const handleNext = () => {
    let newDate;
    if (state.view === 'month') newDate = addMonths(date, 1);
    else if (state.view === 'week') newDate = addWeeks(date, 1);
    else newDate = addDays(date, 1);
    dispatch({ type: 'SET_DATE', payload: newDate.toISOString() });
  };

  const handleToday = () => {
    dispatch({ type: 'SET_DATE', payload: mockNow().toISOString() });
  };

  const handleViewChange = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    setIsViewMenuOpen(false);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling
    
    if (!quickAddText.trim()) return;

    // Simple parser logic for demo
    let start = mockNow();
    let title = quickAddText;

    // Basic date parsing
    if (quickAddText.toLowerCase().includes('tomorrow')) {
      // startOfTomorrow uses real time, so derive from mockNow instead
      start = addDaysFn(new Date(mockNow().setHours(0, 0, 0, 0)), 1);
      // Remove 'tomorrow' from title case-insensitively
      title = title.replace(/\btomorrow\b/i, '').trim();
    } else if (quickAddText.toLowerCase().includes('next monday')) {
       // Simple logic for "next monday"
       const day = start.getDay();
       const diff = start.getDate() - day + (day === 0 ? -6 : 1) + 7; // Adjust for next Monday
       start.setDate(diff);
       start.setHours(9, 0, 0, 0); // Default to 9am
       title = title.replace(/\bnext monday\b/i, '').trim();
    }
    
    // Check for time (e.g., "2pm", "14:00", "3:30pm")
    const timeMatch = title.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      const meridiem = timeMatch[4]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      start.setHours(hours, minutes, 0, 0);
      
      // Remove the time string from title roughly
      title = title.replace(timeMatch[0], '').trim();
    } else {
      // Default to next hour if no time specified
      if (!quickAddText.toLowerCase().includes('tomorrow') && !quickAddText.toLowerCase().includes('next monday')) {
         start.setHours(start.getHours() + 1, 0, 0, 0);
      }
    }

    // Clean up title
    title = title.replace(/\bat\b/i, '').trim(); // Remove standalone "at"
    if (!title) title = "New Event";

    const end = addHours(start, 1);

    const newEvent = {
      id: generateId(),
      calendarId: state.calendars[0]?.id,
      title: title,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      location: '',
      description: `Created via Quick Add from: "${quickAddText}"`,
      guests: [],
      color: 'bg-blue-500',
      recurring: 'none',
      reminders: []
    };

    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    setQuickAddText('');
    setQuickAddOpen(false);
    
    // Jump to date if it's in the future so user sees it
    dispatch({ type: 'SET_DATE', payload: start.toISOString() });
  };

  const currentMonthTitle = format(date, 'MMMM yyyy');

  const viewLabels = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Schedule'
  };

  return (
    <header className="h-16 border-b border-google-border flex items-center px-4 justify-between bg-white z-20 relative">
      <div className="flex items-center gap-2 min-w-[240px]">
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-2 hover:bg-gray-100 rounded-full text-text-secondary"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-1 text-text-secondary">
          <div className="w-8 h-8 bg-primary rounded text-white flex items-center justify-center font-bold text-lg">
            31
          </div>
          <span className="text-xl text-text-secondary hidden sm:block">Calendar</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={handleToday}
          className="px-4 py-2 border border-google-border rounded hover:bg-gray-50 text-sm font-medium"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
        <h2 className="text-xl text-text-primary min-w-[150px]">{currentMonthTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Debug Button - Prominent */}
        <a 
          href={goHref} 
          className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 transition-colors"
          title="Debug State JSON"
        >
          <Database size={14} />
          Debug API
        </a>

        {/* Quick Add Toggle */}
        <div className="relative" ref={quickAddRef}>
          <button 
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className={`p-2 rounded-full transition-colors ${quickAddOpen ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100 text-text-secondary'}`}
            title="Quick add event"
            aria-label="Quick add event"
          >
            <Plus size={24} />
          </button>
          
          {quickAddOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-xl border border-gray-200 rounded-lg p-3 z-50 animate-in fade-in zoom-in duration-100 origin-top-right">
              <form onSubmit={handleQuickAdd}>
                <div className="mb-2">
                  <label htmlFor="quick-add-input" className="block text-xs font-medium text-gray-700 mb-1">
                    Quick Add Event
                  </label>
                  <input
                    id="quick-add-input"
                    autoFocus
                    type="text"
                    placeholder="e.g. Meeting tomorrow 2pm"
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={quickAddText}
                    onChange={e => setQuickAddText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen(false)}
                    className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary-hover font-medium"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-google-gray rounded-lg focus:outline-none focus:bg-white focus:shadow-md transition-all w-64"
          />
        </div>
        
        {/* Custom View Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-google-border rounded hover:bg-gray-50 text-sm font-medium min-w-[100px] justify-between"
          >
            <span>{viewLabels[state.view]}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {isViewMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-google-border rounded shadow-lg py-1 z-50">
              {Object.entries(viewLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleViewChange(key)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-text-primary flex items-center justify-between"
                >
                  {label}
                  {state.view === key && <span className="text-primary">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 hover:bg-gray-100 rounded-full text-text-secondary"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-google-border rounded-lg shadow-xl p-4 z-50">
              <h3 className="text-sm font-medium text-text-primary mb-3">Calendar settings</h3>
              <label className="block text-xs text-text-secondary mb-1">Week starts on</label>
              <select
                value={state.settings.weekStart}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { weekStart: Number(e.target.value) } })}
                className="w-full border border-google-border rounded p-2 text-sm mb-3"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
              </select>
              <label className="block text-xs text-text-secondary mb-1">Default event duration</label>
              <select
                value={state.settings.defaultDuration}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { defaultDuration: Number(e.target.value) } })}
                className="w-full border border-google-border rounded p-2 text-sm"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          )}
          </div>
          <img 
            src={state.user.avatar} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-google-border"
          />
        </div>
      </div>
    </header>
  );
}
