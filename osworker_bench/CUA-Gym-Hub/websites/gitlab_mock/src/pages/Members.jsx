import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { timeAgo } from '../utils/dataManager.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const ROLES = ['Reporter', 'Developer', 'Maintainer', 'Owner'];

export default function Members() {
  const { group, project: projectSlug } = useParams();
  const { state, dispatch } = useApp();
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);
  if (!proj) return <div>Project not found</div>;

  const members = state.members.filter(m => m.projectId === proj.id);
  const nonMembers = state.users.filter(u => !members.some(m => m.userId === u.id));

  const handleInvite = () => {
    if (!inviteUserId) return;
    dispatch({ type: ACTIONS.ADD_MEMBER, payload: { projectId: proj.id, userId: inviteUserId, role: inviteRole } });
    setInviteUserId('');
  };

  const handleRoleChange = (memberId, role) => {
    dispatch({ type: ACTIONS.UPDATE_MEMBER_ROLE, payload: { memberId, role } });
  };

  const handleRemove = (memberId, userId) => {
    if (userId === state.currentUser.id) { setErrorMsg("You cannot remove yourself from the project."); setTimeout(() => setErrorMsg(''), 3000); return; }
    const user = state.users.find(u => u.id === userId);
    setPendingRemoval({ memberId, userName: user?.name || 'this member' });
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    dispatch({ type: ACTIONS.REMOVE_MEMBER, payload: { memberId: pendingRemoval.memberId } });
    setPendingRemoval(null);
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Members</h1>

      {errorMsg && (
        <div style={{ padding: '10px 16px', background: 'var(--gl-danger-bg)', color: 'var(--gl-danger)', borderRadius: 6, marginBottom: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Invite form */}
      <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 16, marginBottom: 24, background: '#fff' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Invite member</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={inviteUserId} onChange={e => setInviteUserId(e.target.value)}
            style={{ flex: 2, minWidth: 160, padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }}>
            <option value="">Select a user to invite</option>
            {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>)}
          </select>
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="gl-btn gl-btn-primary" onClick={handleInvite} disabled={!inviteUserId}>
            <Plus size={14} /> Invite
          </button>
        </div>
      </div>

      {/* Members table */}
      <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 80px', padding: '10px 16px', background: 'var(--gl-bg-secondary)', borderBottom: '1px solid var(--gl-border)', fontSize: 12, fontWeight: 600, color: 'var(--gl-text-secondary)' }}>
          <span>MEMBER</span>
          <span>ROLE</span>
          <span>JOINED</span>
          <span></span>
        </div>
        {members.map((member, i) => {
          const user = state.users.find(u => u.id === member.userId);
          return (
            <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 80px', alignItems: 'center', padding: '10px 16px', borderBottom: i < members.length - 1 ? '1px solid var(--gl-border-light)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={user?.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gl-text-secondary)' }}>@{user?.username}</div>
                </div>
              </div>
              <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)}
                disabled={member.userId === state.currentUser.id}
                style={{ padding: '5px 8px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span style={{ fontSize: 13, color: 'var(--gl-text-secondary)' }}>{timeAgo(member.createdAt)}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ color: 'var(--gl-danger)' }}
                  onClick={() => handleRemove(member.id, member.userId)}
                  disabled={member.userId === state.currentUser.id}
                  aria-label={`Remove ${user?.name || 'member'}`}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title="Remove member"
        message={`Remove ${pendingRemoval?.userName} from ${proj.name}? They will lose project access in this sandbox.`}
        confirmText="Remove member"
        onConfirm={confirmRemoval}
        onClose={() => setPendingRemoval(null)}
      />
    </div>
  );
}
