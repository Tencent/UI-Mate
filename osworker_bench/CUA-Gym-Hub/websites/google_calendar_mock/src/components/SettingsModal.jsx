import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function SettingsModal({ isOpen, onClose }) {
  const { state, dispatch } = useStore();
  const [settings, setSettings] = useState({ ...state.settings });

  useEffect(() => {
    if (isOpen) {
      setSettings({ ...state.settings });
    }
  }, [isOpen, state.settings]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    onClose();
  };

  const formatIcsDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const escapeIcs = (value = '') => String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const handleExportIcs = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CUA Gym//Google Calendar Mock//EN',
      'CALSCALE:GREGORIAN',
      ...state.events.flatMap(event => [
        'BEGIN:VEVENT',
        `UID:${escapeIcs(event.id)}@gcal.mock`,
        `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
        `DTSTART:${formatIcsDate(event.start)}`,
        `DTEND:${formatIcsDate(event.end)}`,
        `SUMMARY:${escapeIcs(event.title || '(No title)')}`,
        event.location ? `LOCATION:${escapeIcs(event.location)}` : null,
        event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : null,
        'END:VEVENT',
      ].filter(Boolean)),
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'calendar-export.ics';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseIcsDate = (value) => {
    if (!value) return new Date().toISOString();
    if (/^\d{8}T\d{6}Z$/.test(value)) {
      return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`).toISOString();
    }
    if (/^\d{8}$/.test(value)) {
      return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`).toISOString();
    }
    return new Date(value).toISOString();
  };

  const handleImportIcs = async (file) => {
    if (!file) return;
    const text = await file.text();
    const blocks = text.split('BEGIN:VEVENT').slice(1).map(block => block.split('END:VEVENT')[0]);
    const defaultCal = state.calendars.find(c => c.isDefault) || state.calendars[0];
    blocks.forEach(block => {
      const getField = (name) => {
        const line = block.split(/\r?\n/).find(row => row.startsWith(`${name}:`) || row.startsWith(`${name};`));
        return line ? line.slice(line.indexOf(':') + 1).replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';') : '';
      };
      const start = parseIcsDate(getField('DTSTART'));
      const end = parseIcsDate(getField('DTEND')) || new Date(new Date(start).getTime() + 60 * 60000).toISOString();
      dispatch({
        type: 'ADD_EVENT',
        payload: {
          id: getField('UID') || generateId(),
          calendarId: defaultCal?.id || 'c1',
          title: getField('SUMMARY') || '(No title)',
          start,
          end,
          allDay: /^\d{8}$/.test(getField('DTSTART')),
          location: getField('LOCATION'),
          description: getField('DESCRIPTION'),
          guests: [],
          color: defaultCal?.color || '#039BE5',
          recurring: 'none',
          reminders: state.settings?.defaultReminder ? [state.settings.defaultReminder] : [],
          meetLink: '',
          status: 'confirmed',
        }
      });
    });
  };

  const labelStyle = { fontSize: '14px', color: '#3C4043', fontWeight: 500 };
  const descStyle = { fontSize: '12px', color: '#70757A', marginTop: '2px' };
  const selectStyle = { borderColor: '#DADCE0', color: '#3C4043', borderRadius: '4px', padding: '6px 10px', fontSize: '13px', border: '1px solid #DADCE0', outline: 'none' };
  const rowStyle = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F1F3F4' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col"
        style={{ width: '520px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #DADCE0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 400, color: '#3C4043' }}>Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full"
            style={{ color: '#5F6368' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F3F4'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Week starts on */}
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Week starts on</div>
              <div style={descStyle}>Choose which day your week begins</div>
            </div>
            <select
              value={settings.weekStart}
              onChange={e => handleChange('weekStart', parseInt(e.target.value))}
              style={selectStyle}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          {/* Default view */}
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Default view</div>
              <div style={descStyle}>View shown when the calendar loads</div>
            </div>
            <select
              value={settings.defaultView}
              onChange={e => handleChange('defaultView', e.target.value)}
              style={selectStyle}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="agenda">Schedule</option>
            </select>
          </div>

          {/* Time format */}
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Time format</div>
              <div style={descStyle}>12-hour or 24-hour clock display</div>
            </div>
            <select
              value={settings.timeFormat}
              onChange={e => handleChange('timeFormat', e.target.value)}
              style={selectStyle}
            >
              <option value="12h">1:00 PM (12-hour)</option>
              <option value="24h">13:00 (24-hour)</option>
            </select>
          </div>

          {/* Default event duration */}
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Default event duration</div>
              <div style={descStyle}>Duration for new events</div>
            </div>
            <select
              value={settings.defaultDuration}
              onChange={e => handleChange('defaultDuration', parseInt(e.target.value))}
              style={selectStyle}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Default reminder */}
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Default reminder</div>
              <div style={descStyle}>Reminder time for new events</div>
            </div>
            <select
              value={settings.defaultReminder?.minutes ?? 10}
              onChange={e => handleChange('defaultReminder', { type: 'popup', minutes: parseInt(e.target.value) })}
              style={selectStyle}
            >
              <option value={0}>At time of event</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>

          {/* Show week numbers */}
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <div>
              <div style={labelStyle}>Show week numbers</div>
              <div style={descStyle}>Display ISO week numbers in month view</div>
            </div>
            <div
              onClick={() => handleChange('showWeekNumbers', !settings.showWeekNumbers)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.showWeekNumbers ? '#1A73E8' : '#BDC1C6',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: settings.showWeekNumbers ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          {/* Import / Export */}
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <div>
              <div style={labelStyle}>Import & export</div>
              <div style={descStyle}>Download events as ICS or import an ICS file</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportIcs}
                className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
                style={{ borderColor: '#DADCE0', color: '#1A73E8' }}
              >
                Export
              </button>
              <label
                className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 cursor-pointer"
                style={{ borderColor: '#DADCE0', color: '#1A73E8' }}
              >
                Import
                <input
                  type="file"
                  accept=".ics,text/calendar"
                  className="hidden"
                  onChange={(e) => handleImportIcs(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid #DADCE0' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded font-medium"
            style={{ color: '#1A73E8' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8F0FE'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm rounded font-medium text-white"
            style={{ backgroundColor: '#1A73E8' }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.92)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
