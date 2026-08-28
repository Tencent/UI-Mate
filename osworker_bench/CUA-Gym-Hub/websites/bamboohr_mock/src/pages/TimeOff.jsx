import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Calendar, ChevronLeft, ChevronRight, Check, X, Clock,
  Palmtree, Filter
} from 'lucide-react';
import TimeOffModal from '../components/TimeOffModal';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
function getAvatarColor(id) {
  const colors = ['#73C41D','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#795548','#607D8B'];
  return colors[(id || 0) % colors.length];
}

function MiniCalendar({ currentDate, onChangeMonth, onSelectDate, selectedDate, timeOffDates }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function dateStr(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => onChangeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666', padding: 4 }}><ChevronLeft size={16} /></button>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{monthName}</span>
        <button onClick={() => onChangeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666', padding: 4 }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ fontSize: 10, color: '#999', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const ds = dateStr(day);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const hasTimeOff = timeOffDates.has(ds);
          return (
            <button
              key={day}
              onClick={() => onSelectDate(ds)}
              style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, border: 'none',
                background: isSelected ? '#73C41D' : isToday ? '#edf8e0' : 'none',
                color: isSelected ? 'white' : isToday ? '#5CA315' : '#333',
                cursor: 'pointer', fontWeight: isToday || isSelected ? 600 : 400,
                position: 'relative', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {day}
              {hasTimeOff && !isSelected && (
                <div style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#73C41D' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeOff() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState('requests'); // 'requests' | 'calendar'
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState('');

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const allRequests = (state.timeOffRequests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredRequests = statusFilter === 'all'
    ? allRequests
    : allRequests.filter(r => r.status === statusFilter);

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;

  // Build set of dates with approved time off for calendar
  const timeOffDates = new Set();
  allRequests.filter(r => r.status === 'approved').forEach(r => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    const cur = new Date(start);
    while (cur <= end) {
      timeOffDates.add(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
  });

  // People out on selected date
  const outOnSelected = allRequests
    .filter(r => r.status === 'approved' && r.startDate <= selectedDate && r.endDate >= selectedDate)
    .map(r => {
      const emp = state.employees?.find(e => e.id === r.employeeId);
      const policy = state.timeOffPolicies?.find(p => p.id === r.policyId);
      return { ...r, employee: emp, policyName: policy?.type || 'Time Off' };
    })
    .filter(r => r.employee);

  function handleApprove(id) {
    dispatch({
      type: 'UPDATE_TIME_OFF_REQUEST',
      id,
      changes: { status: 'approved', reviewedBy: state.currentUser?.employeeId || 1, reviewedAt: new Date().toISOString() }
    });
    setToast('Request approved.');
    setTimeout(() => setToast(''), 2500);
  }

  function handleDeny(id) {
    dispatch({
      type: 'UPDATE_TIME_OFF_REQUEST',
      id,
      changes: { status: 'denied', reviewedBy: state.currentUser?.employeeId || 1, reviewedAt: new Date().toISOString() }
    });
    setToast('Request denied.');
    setTimeout(() => setToast(''), 2500);
  }

  function changeMonth(delta) {
    setCalendarDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + delta);
      return nd;
    });
  }

  function statusBadge(status) {
    const map = { approved: 'badge-green', pending: 'badge-yellow', denied: 'badge-red', cancelled: 'badge-gray' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', flex: 1 }}>
          <Palmtree size={18} color="#73C41D" />
          <span style={{ fontWeight: 600, fontSize: 18 }}>Time Off</span>
          {pendingCount > 0 && (
            <span style={{ background: '#FF9800', color: 'white', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, marginRight: 16 }}>
          <button
            className={`btn ${view === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setView('requests')}
          >
            Requests
          </button>
          <button
            className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
        <button className="btn btn-primary" onClick={() => setShowTimeOffModal(true)}>
          <Calendar size={14} /> Request Time Off
        </button>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.includes('denied') ? 'toast-error' : 'toast-success'}`}>
            {toast.includes('denied') ? <X size={14} /> : <Check size={14} />}
            {toast}
          </div>
        </div>
      )}

      {view === 'requests' && (
        <div style={{ padding: '20px 24px' }}>
          {/* Filters */}
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '10px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={14} color="#999" />
            <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>Status:</span>
            {['pending', 'approved', 'denied', 'all'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>

          {/* Request list */}
          {filteredRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#999' }}>
              <Clock size={32} color="#E0E0E0" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 14, marginBottom: 4 }}>No {statusFilter !== 'all' ? statusFilter : ''} requests found.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredRequests.map(req => {
                const emp = state.employees?.find(e => e.id === req.employeeId);
                const policy = state.timeOffPolicies?.find(p => p.id === req.policyId);
                if (!emp) return null;
                const initials = getInitials((emp.preferredName || emp.firstName) + ' ' + emp.lastName);
                const bg = getAvatarColor(emp.id);
                const dept = state.departments?.find(d => d.id === emp.departmentId);

                return (
                  <div key={req.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Link to={navTo(`/people/${emp.id}`)} style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
                          {emp.preferredName || emp.firstName} {emp.lastName}
                        </Link>
                        <span style={{ fontSize: 12, color: '#999' }}>{dept?.name}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        {policy?.type || 'Time Off'}: {req.startDate}{req.startDate !== req.endDate ? ` to ${req.endDate}` : ''} ({req.hours} hours)
                      </div>
                      {req.note && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Note: {req.note}</div>}
                    </div>

                    {/* Status / Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {req.status === 'pending' ? (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: 12, padding: '5px 12px' }}
                            onClick={() => handleApprove(req.id)}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: 12, padding: '5px 12px', color: '#c62828' }}
                            onClick={() => handleDeny(req.id)}
                          >
                            <X size={13} /> Deny
                          </button>
                        </>
                      ) : (
                        statusBadge(req.status)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'calendar' && (
        <div style={{ padding: '20px 24px', display: 'flex', gap: 20 }}>
          {/* Calendar sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div className="card" style={{ padding: '16px' }}>
              <MiniCalendar
                currentDate={calendarDate}
                onChangeMonth={changeMonth}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
                timeOffDates={timeOffDates}
              />
            </div>

            {/* Legend */}
            <div className="card" style={{ marginTop: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>Legend</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#73C41D' }} />
                <span style={{ fontSize: 12, color: '#666' }}>Approved Time Off</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF9800' }} />
                <span style={{ fontSize: 12, color: '#666' }}>Pending Request</span>
              </div>
            </div>
          </div>

          {/* Day detail */}
          <div style={{ flex: 1 }}>
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <div style={{ fontSize: 13, color: '#999' }}>
                {outOnSelected.length === 0 ? 'No one is out on this day.' : `${outOnSelected.length} ${outOnSelected.length === 1 ? 'person' : 'people'} out`}
              </div>
            </div>

            {outOnSelected.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outOnSelected.map(r => {
                  const emp = r.employee;
                  const initials = getInitials((emp.preferredName || emp.firstName) + ' ' + emp.lastName);
                  const bg = getAvatarColor(emp.id);
                  const dept = state.departments?.find(d => d.id === emp.departmentId);
                  return (
                    <div key={r.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Link to={navTo(`/people/${emp.id}`)} style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>
                          {emp.preferredName || emp.firstName} {emp.lastName}
                        </Link>
                        <div style={{ fontSize: 12, color: '#999' }}>{dept?.name} - {emp.jobTitle}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#73C41D', fontWeight: 500 }}>{r.policyName}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{r.startDate} - {r.endDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full month view */}
            <div className="card" style={{ marginTop: 16, padding: '16px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                Team Calendar - {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <TeamCalendarGrid
                calendarDate={calendarDate}
                state={state}
                navTo={navTo}
              />
            </div>
          </div>
        </div>
      )}

      {showTimeOffModal && (
        <TimeOffModal
          employeeId={state.currentUser?.employeeId || 1}
          onClose={() => setShowTimeOffModal(false)}
        />
      )}
    </div>
  );
}

function TeamCalendarGrid({ calendarDate, state, navTo }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const approvedRequests = (state.timeOffRequests || []).filter(r => r.status === 'approved');

  // Get unique employees who have time off this month
  const employeeIds = new Set();
  approvedRequests.forEach(r => {
    const startMonth = new Date(r.startDate).getMonth();
    const endMonth = new Date(r.endDate).getMonth();
    const startYear = new Date(r.startDate).getFullYear();
    const endYear = new Date(r.endDate).getFullYear();
    if ((startYear === year && startMonth === month) || (endYear === year && endMonth === month) ||
        (new Date(r.startDate) <= new Date(year, month + 1, 0) && new Date(r.endDate) >= new Date(year, month, 1))) {
      employeeIds.add(r.employeeId);
    }
  });

  const employees = [...employeeIds].map(id => state.employees?.find(e => e.id === id)).filter(Boolean);

  if (employees.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: 13 }}>No team absences this month.</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `150px repeat(${daysInMonth}, 28px)`, gap: 0, minWidth: 'max-content' }}>
        {/* Header row */}
        <div style={{ padding: '4px 8px', fontWeight: 600, fontSize: 11, color: '#999', borderBottom: '1px solid #E0E0E0' }}>Employee</div>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 10, color: '#999', padding: '4px 0', borderBottom: '1px solid #E0E0E0', fontWeight: [0, 6].includes(new Date(year, month, day).getDay()) ? 400 : 500 }}>
            {day}
          </div>
        ))}

        {/* Employee rows */}
        {employees.map(emp => {
          const empRequests = approvedRequests.filter(r => r.employeeId === emp.id);
          return (
            <React.Fragment key={emp.id}>
              <div style={{ padding: '6px 8px', fontSize: 12, fontWeight: 500, color: '#333', borderBottom: '1px solid #f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Link to={navTo(`/people/${emp.id}`)} style={{ color: '#73C41D', fontSize: 12 }}>
                  {emp.preferredName || emp.firstName} {emp.lastName}
                </Link>
              </div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isOff = empRequests.some(r => r.startDate <= dateStr && r.endDate >= dateStr);
                const isWeekend = [0, 6].includes(new Date(year, month, day).getDay());
                return (
                  <div
                    key={day}
                    style={{
                      height: 24,
                      background: isOff ? '#73C41D' : isWeekend ? '#f9f9f9' : 'white',
                      borderBottom: '1px solid #f5f5f5',
                      borderRight: '1px solid #f5f5f5',
                      borderRadius: isOff ? 2 : 0
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
