import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Calendar, Clock, Palmtree, Heart, Star, ChevronRight,
  Plus, X, Bell, BookOpen, Award, Megaphone, TrendingUp, Shield
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
function SmallAvatar({ employee, size = 32 }) {
  if (!employee) return null;
  const name = (employee.preferredName || employee.firstName) + ' ' + employee.lastName;
  const initials = getInitials(name);
  const bg = getAvatarColor(employee.id);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size < 36 ? 11 : 13, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function relTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ProgressBar({ value, color = '#73C41D' }) {
  return (
    <div style={{ background: '#E0E0E0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
      <div style={{ background: color, width: `${Math.min(100, value)}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  );
}

export default function Home() {
  const { state, dispatch } = useApp();
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());
  const [feedView, setFeedView] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const me = state.employees?.find(e => e.id === state.currentUser?.employeeId);
  const myBalances = (state.timeOffBalances || []).filter(b => b.employeeId === state.currentUser?.employeeId);
  const vacationBal = myBalances.find(b => b.policyId === 1);
  const sickBal = myBalances.find(b => b.policyId === 2);

  // Who's out today/tomorrow
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  function isOutOn(dateStr) {
    return (state.timeOffRequests || []).filter(r =>
      r.status === 'approved' && r.startDate <= dateStr && r.endDate >= dateStr
    ).map(r => state.employees?.find(e => e.id === r.employeeId)).filter(Boolean);
  }
  const outToday = isOutOn(todayStr);
  const outTomorrow = isOutOn(tomorrowStr);

  // Notifications feed
  const allFeedNotifs = (state.notifications || []).filter(n => !dismissedNotifs.has(n.id));
  const feedNotifs = feedView === 'announcements'
    ? allFeedNotifs.filter(n => n.type === 'announcement').slice(0, 8)
    : allFeedNotifs.slice(0, 8);

  // Department stats for donut chart
  const deptCounts = {};
  (state.departments || []).forEach(d => { deptCounts[d.id] = 0; });
  (state.employees || []).filter(e => e.status === 'Active').forEach(e => {
    if (deptCounts[e.departmentId] !== undefined) deptCounts[e.departmentId]++;
  });

  const deptColors = ['#73C41D','#2196F3','#FF9800','#E91E63','#9C27B0','#00BCD4','#FF5722','#795548','#607D8B','#4CAF50'];

  // New hire spotlight
  const newHires = (state.employees || []).filter(e => {
    if (!e.hireDate || e.status !== 'Active') return false;
    const hd = new Date(e.hireDate);
    const diff = today - hd;
    return diff < 90 * 86400000;
  }).slice(0, 1);

  // Upcoming birthdays (next 30 days)
  const upcomingBirthdays = (state.employees || []).filter(e => {
    if (!e.dateOfBirth || e.status !== 'Active') return false;
    const dob = new Date(e.dateOfBirth);
    const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (thisYearBday < today) thisYearBday.setFullYear(thisYearBday.getFullYear() + 1);
    const diff = thisYearBday - today;
    return diff >= 0 && diff < 30 * 86400000;
  }).sort((a, b) => {
    const aDate = new Date(today.getFullYear(), new Date(a.dateOfBirth).getMonth(), new Date(a.dateOfBirth).getDate());
    const bDate = new Date(today.getFullYear(), new Date(b.dateOfBirth).getMonth(), new Date(b.dateOfBirth).getDate());
    if (aDate < today) aDate.setFullYear(aDate.getFullYear() + 1);
    if (bDate < today) bDate.setFullYear(bDate.getFullYear() + 1);
    return aDate - bDate;
  }).slice(0, 5);

  // Upcoming work anniversaries (next 30 days)
  const upcomingAnniversaries = (state.employees || []).filter(e => {
    if (!e.hireDate || e.status !== 'Active') return false;
    const hd = new Date(e.hireDate);
    if (hd.getFullYear() === today.getFullYear()) return false;
    const thisYearAnniv = new Date(today.getFullYear(), hd.getMonth(), hd.getDate());
    if (thisYearAnniv < today) thisYearAnniv.setFullYear(thisYearAnniv.getFullYear() + 1);
    const diff = thisYearAnniv - today;
    return diff >= 0 && diff < 30 * 86400000;
  }).sort((a, b) => {
    const aDate = new Date(today.getFullYear(), new Date(a.hireDate).getMonth(), new Date(a.hireDate).getDate());
    const bDate = new Date(today.getFullYear(), new Date(b.hireDate).getMonth(), new Date(b.hireDate).getDate());
    if (aDate < today) aDate.setFullYear(aDate.getFullYear() + 1);
    if (bDate < today) bDate.setFullYear(bDate.getFullYear() + 1);
    return aDate - bDate;
  }).slice(0, 5);

  // Goals
  const companyGoals = (state.goals || []).filter(g => !g.employeeId);
  const myGoals = (state.goals || []).filter(g => g.employeeId === state.currentUser?.employeeId);

  // Benefits
  const myEnrollments = (state.benefitEnrollments || []).filter(b => b.employeeId === state.currentUser?.employeeId && b.status === 'active');

  // Training
  const myTrainings = (state.trainings || []).filter(t => t.employeeId === state.currentUser?.employeeId);

  function getNotifIcon(type) {
    switch (type) {
      case 'time_off_request': return <Calendar size={16} color="#73C41D" />;
      case 'application': return <Plus size={16} color="#2196F3" />;
      case 'compensation_request': return <Star size={16} color="#FF9800" />;
      case 'asset_request': return <BookOpen size={16} color="#9C27B3" />;
      case 'feedback_request': return <Star size={16} color="#FF5722" />;
      case 'announcement': return <Megaphone size={16} color="#73C41D" />;
      case 'task_due': return <Clock size={16} color="#E65100" />;
      case 'new_hire': return <Plus size={16} color="#73C41D" />;
      default: return <Bell size={16} color="#666" />;
    }
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Page header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', flex: 1 }}>
          <Calendar size={18} color="#73C41D" />
          <span style={{ fontWeight: 600, fontSize: 18 }}>Home</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, padding: '20px 24px', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User card */}
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <SmallAvatar employee={me} size={64} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              <Link to={navTo('/my-info')} style={{ color: '#333', textDecoration: 'none' }}>
                {me?.displayName || 'Charlotte Abbott'}
              </Link>
            </div>
            <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>{me?.jobTitle}</div>

            {/* PTO Balances */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
              {/* Vacation */}
              <div style={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 6 }}>Vacation</div>
                <Palmtree size={20} color="#73C41D" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 22, fontWeight: 700, color: '#333', lineHeight: 1 }}>
                  {vacationBal?.available?.toFixed(1) || '0.0'}
                </div>
                <div style={{ fontSize: 10, color: '#73C41D', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>HOURS AVAILABLE</div>
                {vacationBal?.scheduled > 0 && (
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{vacationBal.scheduled} hours scheduled</div>
                )}
              </div>
              {/* Sick */}
              <div style={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 6 }}>Sick</div>
                <Heart size={20} color="#73C41D" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 22, fontWeight: 700, color: '#333', lineHeight: 1 }}>
                  {sickBal?.available?.toFixed(1) || '0.0'}
                </div>
                <div style={{ fontSize: 10, color: '#73C41D', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>HOURS AVAILABLE</div>
                {sickBal?.scheduled > 0 && (
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{sickBal.scheduled} hours scheduled</div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowTimeOffModal(true)}
              style={{ width: '100%', justifyContent: 'center', gap: 6 }}
            >
              <Calendar size={14} /> Request Time Off
            </button>
          </div>

          {/* Who's Out */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <Calendar size={13} /> WHO'S OUT
            </div>
            {outToday.length === 0 && outTomorrow.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>Everyone's in! 🎉</div>
            ) : null}
            {outToday.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>TODAY</div>
                {outToday.map(emp => (
                  <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <SmallAvatar employee={emp} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>{emp.preferredName || emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{emp.jobTitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {outTomorrow.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>TOMORROW</div>
                {outTomorrow.map(emp => (
                  <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <SmallAvatar employee={emp} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>{emp.preferredName || emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{emp.jobTitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Birthdays */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <Award size={13} /> BIRTHDAYS
            </div>
            {upcomingBirthdays.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No upcoming birthdays</div>
            ) : upcomingBirthdays.map(emp => {
              const dob = new Date(emp.dateOfBirth);
              const bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
              if (bday < today) bday.setFullYear(bday.getFullYear() + 1);
              const isToday = bday.toISOString().split('T')[0] === todayStr;
              return (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <SmallAvatar employee={emp} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{emp.preferredName || emp.firstName} {emp.lastName}</div>
                    <div style={{ fontSize: 11, color: isToday ? '#73C41D' : '#999' }}>
                      {isToday ? 'Today!' : formatDate(bday)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Work Anniversaries */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <Star size={13} /> WORK ANNIVERSARIES
            </div>
            {upcomingAnniversaries.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No upcoming anniversaries</div>
            ) : upcomingAnniversaries.map(emp => {
              const hd = new Date(emp.hireDate);
              const anniv = new Date(today.getFullYear(), hd.getMonth(), hd.getDate());
              if (anniv < today) anniv.setFullYear(anniv.getFullYear() + 1);
              const years = anniv.getFullYear() - hd.getFullYear();
              const isToday = anniv.toISOString().split('T')[0] === todayStr;
              return (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <SmallAvatar employee={emp} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{emp.preferredName || emp.firstName} {emp.lastName}</div>
                    <div style={{ fontSize: 11, color: isToday ? '#73C41D' : '#999' }}>
                      {isToday ? `${years} years today!` : `${years} years on ${formatDate(anniv)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Training */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <BookOpen size={13} /> TRAINING
            </div>
            {myTrainings.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999' }}>No training assigned</div>
            ) : myTrainings.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 0', borderBottom: '1px solid #f5f5f5', gap: 8 }}>
                <div style={{ fontSize: 12, color: '#333', flex: 1 }}>{t.title}</div>
                <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'overdue' ? 'badge-orange' : 'badge-blue'}`}>
                  {t.status === 'completed' ? 'Complete' : t.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>

          {/* Company Links */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <TrendingUp size={13} /> COMPANY LINKS
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 600 }}>Benefits</div>
            <div style={{ paddingLeft: 8, marginBottom: 8 }}>
              <div><a href="#" style={{ fontSize: 12, color: '#73C41D', display: 'block', padding: '2px 0' }}>Benefits Portal</a></div>
              <div><a href="#" style={{ fontSize: 12, color: '#73C41D', display: 'block', padding: '2px 0' }}>401(k) Enrollment</a></div>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 600 }}>General</div>
            <div style={{ paddingLeft: 8 }}>
              <div><a href="#" style={{ fontSize: 12, color: '#73C41D', display: 'block', padding: '2px 0' }}>Employee Handbook</a></div>
              <div><a href="#" style={{ fontSize: 12, color: '#73C41D', display: 'block', padding: '2px 0' }}>IT Help Desk</a></div>
              <div><a href="#" style={{ fontSize: 12, color: '#73C41D', display: 'block', padding: '2px 0' }}>Employee Referral</a></div>
            </div>
          </div>
        </div>

        {/* MAIN COLUMN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Notifications feed */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  WHAT'S HAPPENING AT {state.currentUser?.companyName?.toUpperCase() || 'EFFICIENT OFFICE'}
                </span>
              </div>
            <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`btn ${feedView === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => setFeedView('all')}
                >All Activity</button>
                <button
                  className={`btn ${feedView === 'announcements' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => setFeedView('announcements')}
                >Announcements</button>
              </div>
            </div>
            {feedNotifs.map(n => (
              <div
                key={n.id}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px solid #f5f5f5' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getNotifIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                    {n.linkTo ? (
                      <Link to={navTo(n.linkTo)} style={{ color: '#73C41D', fontWeight: 500 }} onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id })}>
                        {n.message}
                      </Link>
                    ) : n.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#999' }}>{relTime(n.timestamp)}</span>
                    {n.isPastDue && <span className="badge badge-past-due">PAST DUE</span>}
                  </div>
                </div>
                <button
                  onClick={() => { setDismissedNotifs(s => new Set([...s, n.id])); dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id }); }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {feedNotifs.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
                {feedView === 'announcements' ? 'No announcements yet.' : 'No notifications'}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="section-header" style={{ margin: 0 }}><Megaphone size={13} /> ANNOUNCEMENTS</div>
              <Link to={navTo('/')} style={{ fontSize: 12, color: '#73C41D' }}>View All</Link>
            </div>
            {(state.announcements || []).map(a => {
              const author = state.employees?.find(e => e.id === a.authorId);
              return (
                <div key={a.id} style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {a.isPinned && <span style={{ fontSize: 10, background: '#73C41D', color: 'white', padding: '1px 6px', borderRadius: 3, fontWeight: 600, marginTop: 2, flexShrink: 0 }}>PINNED</span>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 6 }}>{a.body}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>
                        {author ? `${author.firstName} ${author.lastName}` : ''} · {relTime(a.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Report + Common Reports */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Dept donut */}
            <div className="card" style={{ flex: 1, padding: '14px 16px' }}>
              <div className="section-header" style={{ marginBottom: 12 }}><TrendingUp size={13} /> DEPARTMENT REPORT</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {/* Simple donut via conic-gradient */}
                <div style={{ width: 90, height: 90, flexShrink: 0, position: 'relative' }}>
                  <DeptDonut deptCounts={deptCounts} departments={state.departments} colors={deptColors} />
                </div>
                <div style={{ flex: 1, fontSize: 12 }}>
                  {(state.departments || []).filter(d => deptCounts[d.id] > 0).map((d, i) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: deptColors[i % deptColors.length], flexShrink: 0 }} />
                      <span style={{ color: '#555', flex: 1 }}>{d.name}</span>
                      <span style={{ color: '#333', fontWeight: 600 }}>{deptCounts[d.id]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Common reports */}
            <div className="card" style={{ flex: 1, padding: '14px 16px' }}>
              <div className="section-header" style={{ marginBottom: 12 }}><BookOpen size={13} /> COMMON REPORTS</div>
              {(state.reports || []).filter(r => r.category === 'standard').slice(0, 5).map(r => (
                <div key={r.id}>
                  <Link to={navTo(`/reports/${r.id}`)} style={{ fontSize: 13, color: '#73C41D', display: 'block', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                    {r.name}
                  </Link>
                </div>
              ))}
              <Link to={navTo('/reports')} style={{ fontSize: 12, color: '#999', marginTop: 8, display: 'block' }}>View all reports →</Link>
            </div>
          </div>

          {/* Welcome new hire */}
          {newHires.length > 0 && (
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-header" style={{ marginBottom: 12 }}><Award size={13} /> WELCOME TO {state.currentUser?.companyName?.toUpperCase() || 'EFFICIENT OFFICE'}</div>
              {newHires.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SmallAvatar employee={emp} size={48} />
                  <div>
                    <Link to={navTo(`/people/${emp.id}`)} style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>{emp.displayName}</Link>
                    <div style={{ color: '#666', fontSize: 13 }}>{emp.jobTitle}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>Started {formatDate(emp.hireDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goals */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 12 }}><TrendingUp size={13} /> KEEP AN EYE ON YOUR GOALS</div>
            {[...companyGoals, ...myGoals].slice(0, 4).map(g => (
              <div key={g.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#333', flex: 1 }}>{g.title}</span>
                  <span style={{ fontSize: 12, color: g.status === 'behind' ? '#E65100' : '#73C41D', fontWeight: 500, marginLeft: 8 }}>
                    {g.progress}%
                  </span>
                </div>
                <ProgressBar value={g.progress} color={g.status === 'behind' ? '#FF9800' : '#73C41D'} />
              </div>
            ))}
          </div>

          {/* My Benefits */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-header" style={{ marginBottom: 12 }}><Shield size={13} /> MY BENEFITS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {myEnrollments.map(en => {
                const plan = state.benefitPlans?.find(p => p.id === en.planId);
                if (!plan) return null;
                const typeColors = { Medical: '#2196F3', Dental: '#4CAF50', Vision: '#9C27B0', '401k': '#FF9800', Life: '#E91E63' };
                return (
                  <div key={en.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: '10px 14px', minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: typeColors[plan.type] || '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{plan.type}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{plan.provider}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>${plan.employeeCost}/mo</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Time Off Modal */}
      {showTimeOffModal && (
        <TimeOffModal
          employeeId={state.currentUser?.employeeId}
          onClose={() => setShowTimeOffModal(false)}
        />
      )}
    </div>
  );
}

function DeptDonut({ deptCounts, departments, colors }) {
  const total = Object.values(deptCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#E0E0E0' }} />;

  let cumulativePercent = 0;
  const segments = (departments || []).filter(d => deptCounts[d.id] > 0).map((d, i) => {
    const pct = (deptCounts[d.id] / total) * 100;
    const start = cumulativePercent;
    cumulativePercent += pct;
    return { start, end: cumulativePercent, color: colors[i % colors.length] };
  });

  const conicParts = segments.map(s => `${s.color} ${s.start.toFixed(1)}% ${s.end.toFixed(1)}%`).join(', ');

  return (
    <div style={{
      width: 90, height: 90, borderRadius: '50%',
      background: `conic-gradient(${conicParts})`,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute', inset: '18px', borderRadius: '50%', background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: '#333'
      }}>
        {total}
      </div>
    </div>
  );
}
