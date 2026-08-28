import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const APPS = [
  { id: 'approvals', label: '审批', icon: '📋', path: '/workbench/approvals', badge: 1 },
  { id: 'tasks', label: '任务', icon: '✅', path: '/tasks', badge: 0 },
  { id: 'okr', label: 'OKR', icon: '🎯', path: '/tasks' },
  { id: 'attendance', label: '打卡', icon: '⏰', path: '/workbench/approvals' },
  { id: 'announcement', label: '公告', icon: '📢', path: '/messenger' },
  { id: 'report', label: '汇报', icon: '📊', path: '/docs' },
  { id: 'schedule', label: '日程', icon: '📅', path: '/calendar' },
  { id: 'survey', label: '问卷', icon: '📝', path: '/docs' },
];

const APPROVAL_TABS = ['待我审批', '我发起的', '已完成'];

export default function WorkbenchModule({ activeTab: propTab }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const showApprovals = location.pathname.includes('approvals') || propTab === 'approvals';

  const [approvalTab, setApprovalTab] = useState('待我审批');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comment, setComment] = useState('');

  const { approvals, users, currentUser } = state;

  function getApprovalsByTab() {
    if (approvalTab === '待我审批') return approvals.filter(a => a.approverId === currentUser.id && a.status === 'pending');
    if (approvalTab === '我发起的') return approvals.filter(a => a.applicantId === currentUser.id);
    if (approvalTab === '已完成') return approvals.filter(a => a.status !== 'pending');
    return [];
  }

  function handleApprove(approval) {
    dispatch({ type: 'UPDATE_APPROVAL', payload: { id: approval.id, status: 'approved', comment } });
    setSelectedApproval(null);
    setComment('');
  }

  function handleReject(approval) {
    dispatch({ type: 'UPDATE_APPROVAL', payload: { id: approval.id, status: 'rejected', comment } });
    setSelectedApproval(null);
    setComment('');
  }

  const typeIcon = { leave: '🏖️', expense: '💰', travel: '✈️', procurement: '📦' };
  const statusBadge = {
    pending: { label: '待审批', color: '#FF7D00', bg: '#FFF7E6' },
    approved: { label: '已通过', color: '#34C724', bg: '#F6FFED' },
    rejected: { label: '已拒绝', color: '#F54A45', bg: '#FFF1F0' },
  };

  if (!showApprovals) {
    return (
      <>
        <div style={{ flex: 1, background: '#F5F6F7', padding: 32, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <h2 style={{ fontWeight: 600, fontSize: 20, color: '#1F2329', marginBottom: 24 }}>工作台</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, maxWidth: 600 }}>
            {APPS.map(app => (
              <div
                key={app.id}
                onClick={() => navigate(app.path)}
                style={{
                  background: '#fff', borderRadius: 10, padding: '16px 8px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', position: 'relative',
                  border: '1px solid #DEE0E3', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {app.badge > 0 && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%',
                    background: '#F54A45', color: '#fff', fontSize: 10, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{app.badge}</div>
                )}
                <span style={{ fontSize: 28 }}>{app.icon}</span>
                <span style={{ fontSize: 12, color: '#1F2329', fontWeight: 500 }}>{app.label}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Approvals view
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#F5F6F7' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/workbench')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>← 返回</button>
          <h2 style={{ fontWeight: 600, fontSize: 18, color: '#1F2329', margin: 0 }}>审批</h2>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '0 24px', display: 'flex' }}>
          {APPROVAL_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setApprovalTab(tab)}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, color: approvalTab === tab ? '#3370FF' : '#646A73',
                borderBottom: approvalTab === tab ? '2px solid #3370FF' : '2px solid transparent',
                fontWeight: approvalTab === tab ? 500 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', gap: 16 }}>
          {/* Approval list */}
          <div style={{ flex: 1, maxWidth: selectedApproval ? '50%' : '100%' }}>
            {getApprovalsByTab().length === 0 && (
              <div style={{ textAlign: 'center', color: '#8F959E', marginTop: 40, fontSize: 14 }}>暂无审批记录</div>
            )}
            {getApprovalsByTab().map(approval => {
              const applicant = users.find(u => u.id === approval.applicantId);
              const badge = statusBadge[approval.status];
              return (
                <div
                  key={approval.id}
                  onClick={() => setSelectedApproval(approval)}
                  style={{
                    background: '#fff', borderRadius: 8, padding: 16, marginBottom: 10, cursor: 'pointer',
                    border: selectedApproval?.id === approval.id ? '1px solid #3370FF' : '1px solid #DEE0E3',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{typeIcon[approval.type] || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2329', marginBottom: 6 }}>{approval.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: applicant?.avatarColor, color: '#fff', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{applicant?.initials}</div>
                          <span style={{ fontSize: 12, color: '#646A73' }}>{applicant?.name}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#8F959E' }}>{new Date(approval.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      color: badge.color, background: badge.bg,
                    }}>{badge.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedApproval && (
            <div style={{ width: 360, background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #DEE0E3', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{typeIcon[selectedApproval.type]}</span>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#1F2329' }}>{selectedApproval.title}</span>
                <button onClick={() => setSelectedApproval(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18 }}>✕</button>
              </div>

              {/* Details */}
              <div style={{ marginBottom: 16 }}>
                {Object.entries(selectedApproval.details || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#8F959E', minWidth: 60 }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#1F2329' }}>{Array.isArray(v) ? v.join(' · ') : String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Comment */}
              {selectedApproval.comment && (
                <div style={{ background: '#F5F6F7', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 13, color: '#646A73' }}>
                  审批意见：{selectedApproval.comment}
                </div>
              )}

              {/* Action area */}
              {selectedApproval.status === 'pending' && selectedApproval.approverId === currentUser.id && (
                <div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="输入审批意见（选填）"
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13, resize: 'none', fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleApprove(selectedApproval)}
                      style={{ flex: 1, padding: '8px', background: '#34C724', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                    >通过</button>
                    <button
                      onClick={() => handleReject(selectedApproval)}
                      style={{ flex: 1, padding: '8px', background: '#F54A45', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                    >拒绝</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
