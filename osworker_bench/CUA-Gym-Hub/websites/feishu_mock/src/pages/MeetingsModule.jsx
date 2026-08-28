import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const TABS = ['即将开始', '会议历史'];

export default function MeetingsModule() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('即将开始');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [joinToast, setJoinToast] = useState(null);

  const { meetings, users, currentUser } = state;

  const upcoming = (meetings || []).filter(m => m.status === 'upcoming');
  const ended = (meetings || []).filter(m => m.status === 'ended');
  const displayMeetings = activeTab === '即将开始' ? upcoming : ended;

  function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return '今天';
    if (d.toDateString() === tomorrow.toDateString()) return '明天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function handleJoinMeeting(meeting) {
    setJoinToast(`正在加入会议: ${meeting.title}`);
    setTimeout(() => setJoinToast(null), 3000);
  }

  function handleJoinByCode() {
    if (!joinCode.trim()) return;
    setShowJoinModal(false);
    setJoinToast(`正在加入会议号: ${joinCode}`);
    setJoinCode('');
    setTimeout(() => setJoinToast(null), 3000);
  }

  function handleQuickMeeting() {
    const newMeeting = {
      id: `meeting_${Date.now()}`,
      title: `${currentUser.name}的即时会议`,
      status: 'upcoming',
      startTime: Date.now(),
      endTime: Date.now() + 3600000,
      organizerId: currentUser.id,
      attendees: [currentUser.id],
      meetingLink: `https://meeting.feishu.cn/${Date.now()}`,
      meetingNo: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
      hasRecording: false,
      isRecurring: false,
    };
    dispatch({ type: 'CREATE_MEETING', payload: newMeeting });
    setJoinToast('已创建即时会议');
    setTimeout(() => setJoinToast(null), 3000);
  }

  // Schedule modal state
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [scheduleAttendees, setScheduleAttendees] = useState([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  function handleScheduleMeeting() {
    if (!scheduleTitle.trim()) return;
    const newMeeting = {
      id: `meeting_${Date.now()}`,
      title: scheduleTitle.trim(),
      status: 'upcoming',
      startTime: scheduleStart ? new Date(scheduleStart).getTime() : Date.now() + 3600000,
      endTime: scheduleEnd ? new Date(scheduleEnd).getTime() : Date.now() + 7200000,
      organizerId: currentUser.id,
      attendees: [currentUser.id, ...scheduleAttendees],
      meetingLink: `https://meeting.feishu.cn/${Date.now()}`,
      meetingNo: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
      hasRecording: false,
      isRecurring: false,
    };
    dispatch({ type: 'CREATE_MEETING', payload: newMeeting });
    setShowScheduleModal(false);
    setScheduleTitle('');
    setScheduleStart('');
    setScheduleEnd('');
    setScheduleAttendees([]);
  }

  const matchingUsers = attendeeSearch
    ? users.filter(u => (u.name.includes(attendeeSearch) || u.englishName.toLowerCase().includes(attendeeSearch.toLowerCase())) && u.id !== currentUser.id && !scheduleAttendees.includes(u.id))
    : [];

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#F5F6F7' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 20, color: '#1F2329', margin: 0 }}>视频会议</h2>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleQuickMeeting}
            style={{
              padding: '8px 20px', background: '#3370FF', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            快速会议
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            style={{
              padding: '8px 20px', border: '1px solid #3370FF', background: '#fff',
              color: '#3370FF', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
            }}
          >
            加入会议
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            style={{
              padding: '8px 20px', border: '1px solid #DEE0E3', background: '#fff',
              color: '#1F2329', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}
          >
            预约会议
          </button>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '0 24px', display: 'flex' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, color: activeTab === tab ? '#3370FF' : '#646A73',
                borderBottom: activeTab === tab ? '2px solid #3370FF' : '2px solid transparent',
                fontWeight: activeTab === tab ? 500 : 400,
              }}
            >
              {tab}
              {tab === '即将开始' && upcoming.length > 0 && (
                <span style={{
                  marginLeft: 6, background: '#3370FF', color: '#fff',
                  borderRadius: 10, padding: '1px 6px', fontSize: 11,
                }}>{upcoming.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {displayMeetings.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {activeTab === '即将开始' ? '📹' : '📋'}
              </div>
              <div style={{ color: '#8F959E', fontSize: 14 }}>
                {activeTab === '即将开始' ? '暂无即将开始的会议' : '暂无会议记录'}
              </div>
            </div>
          )}

          {displayMeetings.map(meeting => {
            const organizer = users.find(u => u.id === meeting.organizerId);
            const attendeeUsers = (meeting.attendees || []).map(id => users.find(u => u.id === id)).filter(Boolean);
            const isOrganizer = meeting.organizerId === currentUser.id;

            return (
              <div
                key={meeting.id}
                onClick={() => setSelectedMeeting(selectedMeeting?.id === meeting.id ? null : meeting)}
                style={{
                  background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 10,
                  border: selectedMeeting?.id === meeting.id ? '1px solid #3370FF' : '1px solid #DEE0E3',
                  cursor: 'pointer', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Video icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: meeting.status === 'upcoming' ? '#E1EAFF' : '#F5F6F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={meeting.status === 'upcoming' ? '#3370FF' : '#8F959E'} strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#1F2329' }}>{meeting.title}</span>
                      {meeting.isRecurring && (
                        <span style={{ fontSize: 11, color: '#8F959E', background: '#F5F6F7', borderRadius: 4, padding: '1px 6px' }}>循环</span>
                      )}
                      {meeting.hasRecording && (
                        <span style={{ fontSize: 11, color: '#3370FF', background: '#E1EAFF', borderRadius: 4, padding: '1px 6px' }}>有录制</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#646A73', marginBottom: 8 }}>
                      <span>{formatDate(meeting.startTime)} {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', background: organizer?.avatarColor,
                          color: '#fff', fontSize: 9, fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{organizer?.initials}</div>
                        {organizer?.name}{isOrganizer ? '（我）' : ''}
                      </span>
                    </div>

                    {/* Attendees */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {attendeeUsers.slice(0, 6).map((u, i) => (
                        <div
                          key={u.id}
                          title={u.name}
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: u.avatarColor, color: '#fff', fontSize: 10, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1.5px solid #fff', marginLeft: i > 0 ? -6 : 0,
                          }}
                        >{u.initials}</div>
                      ))}
                      {attendeeUsers.length > 6 && (
                        <span style={{ fontSize: 11, color: '#8F959E', marginLeft: 4 }}>+{attendeeUsers.length - 6}</span>
                      )}
                      <span style={{ fontSize: 12, color: '#8F959E', marginLeft: 6 }}>{attendeeUsers.length} 人</span>
                    </div>

                    {/* Meeting number */}
                    {meeting.meetingNo && (
                      <div style={{ fontSize: 12, color: '#8F959E', marginTop: 6 }}>
                        会议号：{meeting.meetingNo}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {meeting.status === 'upcoming' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleJoinMeeting(meeting); }}
                        style={{
                          padding: '6px 16px', background: '#3370FF', color: '#fff',
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        }}
                      >
                        加入
                      </button>
                    )}
                    {meeting.hasRecording && (
                      <button
                        onClick={e => { e.stopPropagation(); setJoinToast('正在播放录制...'); setTimeout(() => setJoinToast(null), 2000); }}
                        style={{
                          padding: '6px 16px', border: '1px solid #DEE0E3', background: '#fff',
                          color: '#646A73', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                        }}
                      >
                        录制
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join modal */}
      {showJoinModal && (
        <>
          <div onClick={() => setShowJoinModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', top: '25%', left: '50%', transform: 'translateX(-50%)',
            width: 400, background: '#fff', borderRadius: 12, padding: 28,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)', zIndex: 201,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 16, color: '#1F2329', margin: 0 }}>加入会议</h3>
              <button onClick={() => setShowJoinModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18 }}>&#10005;</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#646A73', marginBottom: 6 }}>输入会议号或链接</div>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="例如：689-342-118"
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #DEE0E3', borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#3370FF'; }}
                onBlur={e => { e.target.style.borderColor = '#DEE0E3'; }}
                onKeyDown={e => { if (e.key === 'Enter') handleJoinByCode(); }}
              />
            </div>
            <button
              onClick={handleJoinByCode}
              disabled={!joinCode.trim()}
              style={{
                width: '100%', padding: '10px', background: joinCode.trim() ? '#3370FF' : '#DEE0E3',
                color: '#fff', border: 'none', borderRadius: 8, cursor: joinCode.trim() ? 'pointer' : 'default',
                fontSize: 14, fontWeight: 500,
              }}
            >
              加入会议
            </button>
          </div>
        </>
      )}

      {/* Schedule modal */}
      {showScheduleModal && (
        <>
          <div onClick={() => setShowScheduleModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 480, background: '#fff', borderRadius: 12, padding: 28,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)', zIndex: 201, maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 16, color: '#1F2329', margin: 0 }}>预约会议</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18 }}>&#10005;</button>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#646A73', marginBottom: 4 }}>会议主题</div>
              <input
                value={scheduleTitle}
                onChange={e => setScheduleTitle(e.target.value)}
                placeholder="输入会议主题"
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #DEE0E3', borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#3370FF'; }}
                onBlur={e => { e.target.style.borderColor = '#DEE0E3'; }}
              />
            </div>

            {/* Time */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#646A73', marginBottom: 4 }}>开始时间</div>
                <input type="datetime-local" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #DEE0E3', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#646A73', marginBottom: 4 }}>结束时间</div>
                <input type="datetime-local" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #DEE0E3', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Attendees */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#646A73', marginBottom: 6 }}>参会人</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {/* Current user always included */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                  background: '#E1EAFF', borderRadius: 20, fontSize: 12,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: currentUser.avatarColor, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{currentUser.initials}</div>
                  {currentUser.name}（我）
                </div>
                {scheduleAttendees.map(userId => {
                  const u = users.find(u => u.id === userId);
                  return u ? (
                    <div key={userId} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                      background: '#F0F1F2', borderRadius: 20, fontSize: 12,
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: u.avatarColor, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{u.initials}</div>
                      {u.name}
                      <button onClick={() => setScheduleAttendees(a => a.filter(id => id !== userId))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 12, lineHeight: 1, padding: 0 }}>&#10005;</button>
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  value={attendeeSearch}
                  onChange={e => setAttendeeSearch(e.target.value)}
                  placeholder="搜索并添加参会人"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #DEE0E3', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#3370FF'; }}
                  onBlur={e => { setTimeout(() => e.target.style.borderColor = '#DEE0E3', 200); }}
                />
                {matchingUsers.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #DEE0E3', borderRadius: 8, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: 160, overflowY: 'auto' }}>
                    {matchingUsers.slice(0, 5).map(u => (
                      <div key={u.id} onMouseDown={() => { setScheduleAttendees(a => [...a, u.id]); setAttendeeSearch(''); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: u.avatarColor, color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.initials}</div>
                        <div>
                          <div style={{ fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#8F959E' }}>{u.department}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowScheduleModal(false)} style={{ padding: '8px 20px', border: '1px solid #DEE0E3', borderRadius: 8, cursor: 'pointer', fontSize: 14, background: '#fff', color: '#646A73' }}>取消</button>
              <button onClick={handleScheduleMeeting} disabled={!scheduleTitle.trim()} style={{
                padding: '8px 20px', border: 'none', borderRadius: 8, cursor: scheduleTitle.trim() ? 'pointer' : 'default',
                fontSize: 14, background: scheduleTitle.trim() ? '#3370FF' : '#DEE0E3', color: '#fff', fontWeight: 500,
              }}>预约</button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {joinToast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(31,35,41,0.88)', color: '#fff', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, zIndex: 9999,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          {joinToast}
        </div>
      )}
    </>
  );
}
