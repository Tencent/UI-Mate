import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, LayoutGrid, List, Briefcase, Settings, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const statusBadge = (status) => {
  const map = { open: 'badge-green', closed: 'badge-gray', draft: 'badge-yellow' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

function Avatar({ user, size = 28 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0
    }}>
      {user.firstName[0]}{user.lastName[0]}
    </div>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditJob, setShowEditJob] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editOpenings, setEditOpenings] = useState(1);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('recruiter');

  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return <div style={{ padding: 24 }}>Job not found</div>;

  const dept = state.departments.find(d => d.id === job.departmentId);
  const office = state.offices.find(o => o.id === job.officeId);
  const hm = state.users.find(u => u.id === job.hiringManagerId);
  const rec = state.users.find(u => u.id === job.recruiterId);
  const coord = job.coordinatorId ? state.users.find(u => u.id === job.coordinatorId) : null;

  const jobApps = state.applications.filter(a => a.jobId === jobId);
  const activeApps = jobApps.filter(a => a.status === 'active');
  const rejectedApps = jobApps.filter(a => a.status === 'rejected');
  const hiredApps = jobApps.filter(a => a.status === 'hired');

  const recentActivity = state.activityFeed
    .filter(act => {
      const app = state.applications.find(a => a.id === act.applicationId);
      return app && app.jobId === jobId;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Briefcase },
    { key: 'pipeline', label: 'Pipeline', icon: LayoutGrid, href: buildLink(`/jobs/${jobId}/pipeline`) },
    { key: 'candidates', label: 'Candidates', icon: Users, href: buildLink(`/jobs/${jobId}/candidates`) },
    { key: 'hiring_team', label: 'Hiring Team', icon: Users },
    { key: 'setup', label: 'Job Setup', icon: Settings },
  ];

  const openEditJob = () => {
    setEditTitle(job.title);
    setEditStatus(job.status);
    setEditOpenings(job.openings);
    setShowEditJob(true);
  };

  const handleEditJobSave = () => {
    dispatch({
      type: 'UPDATE_JOB',
      payload: {
        id: jobId,
        title: editTitle.trim() || job.title,
        status: editStatus,
        openings: Number(editOpenings) || job.openings
      }
    });
    setShowEditJob(false);
  };

  const handleAddMemberSave = () => {
    if (!addMemberUserId) return;
    const roleFieldMap = {
      recruiter: 'recruiterId',
      hiring_manager: 'hiringManagerId',
      coordinator: 'coordinatorId'
    };
    const field = roleFieldMap[addMemberRole];
    if (!field) return;
    dispatch({
      type: 'UPDATE_JOB',
      payload: { id: jobId, [field]: addMemberUserId }
    });
    setShowAddMember(false);
    setAddMemberUserId('');
    setAddMemberRole('recruiter');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(buildLink('/jobs'))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={14} /> All Jobs
      </button>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 6, border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{job.title}</h1>
              {statusBadge(job.status)}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {dept && <span className="badge badge-gray">{dept.name}</span>}
              {office && <span className="badge badge-gray">{office.name}</span>}
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {job.openings} opening{job.openings !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={openEditJob}>Edit Job</button>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          {hm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar user={hm} size={28} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hiring Manager</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{hm.name}</div>
              </div>
            </div>
          )}
          {rec && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar user={rec} size={28} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recruiter</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{rec.name}</div>
              </div>
            </div>
          )}
          {coord && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar user={coord} size={28} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coordinator</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{coord.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Left nav */}
        <div>
          <div style={{ background: 'white', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {navItems.map(item => (
              <div
                key={item.key}
                onClick={() => item.href ? navigate(item.href) : setActiveTab(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer',
                  background: activeTab === item.key ? '#F0FBF7' : 'transparent',
                  color: activeTab === item.key ? 'var(--accent)' : 'var(--text-primary)',
                  borderLeft: activeTab === item.key ? '3px solid var(--accent)' : '3px solid transparent',
                  fontWeight: activeTab === item.key ? 600 : 400,
                  fontSize: 14,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => { if (activeTab !== item.key) e.currentTarget.style.background = 'var(--divider)'; }}
                onMouseLeave={(e) => { if (activeTab !== item.key) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon size={15} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Total Candidates', value: jobApps.length, color: 'var(--text-primary)' },
                  { label: 'Active', value: activeApps.length, color: 'var(--accent)' },
                  { label: 'Rejected', value: rejectedApps.length, color: 'var(--red)' },
                  { label: 'Hired', value: hiredApps.length, color: 'var(--green)' },
                ].map(m => (
                  <div key={m.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="card">
                <div className="card-header"><span className="card-title">Job Description</span></div>
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16 }}>{job.description}</p>
                  {job.requirements?.length > 0 && (
                    <>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Requirements</h4>
                      <ul style={{ paddingLeft: 20 }}>
                        {job.requirements.map((r, i) => (
                          <li key={i} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 4 }}>{r}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Recent activity */}
              <div className="card">
                <div className="card-header"><span className="card-title">Recent Activity</span></div>
                <div style={{ padding: '8px 0' }}>
                  {recentActivity.length === 0 ? (
                    <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No activity yet</div>
                  ) : recentActivity.map(act => {
                    const actor = state.users.find(u => u.id === act.actorId);
                    return (
                      <div key={act.id} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--divider)' }}>
                        <div style={{ fontSize: 13, flex: 1 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{act.description}</span>
                          {actor && <span style={{ color: 'var(--text-muted)' }}> — {actor.name}</span>}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {format(new Date(act.createdAt), 'MMM d')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hiring_team' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Hiring Team</span>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(true)}>Add Member</button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {[
                  { user: rec, role: 'Recruiter' },
                  { user: hm, role: 'Hiring Manager' },
                  { user: coord, role: 'Coordinator' }
                ].filter(m => m.user).map(m => (
                  <div key={m.user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--divider)' }}>
                    <Avatar user={m.user} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user.email}</div>
                    </div>
                    <span className="badge badge-gray">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="card">
              <div className="card-header"><span className="card-title">Job Setup</span></div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Job Title', value: job.title },
                  { label: 'Status', value: job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : '—' },
                  { label: 'Department', value: dept?.name || '—' },
                  { label: 'Office', value: office?.name || '—' },
                  { label: 'Openings', value: job.openings },
                  { label: 'Created', value: job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : '—' },
                ].map(field => (
                  <div key={field.label} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{field.label}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{field.value}</span>
                  </div>
                ))}
                {job.description && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Description Preview</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: 120, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                      {job.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Job Modal */}
      {showEditJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Edit Job</h3>
              <button onClick={() => setShowEditJob(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Job Title</label>
                <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Status</label>
                <select className="form-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Openings</label>
                <input className="form-input" type="number" min={1} value={editOpenings} onChange={e => setEditOpenings(e.target.value)} style={{ width: 80 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditJob(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditJobSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add Team Member</h3>
              <button onClick={() => setShowAddMember(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>User</label>
                <select className="form-select" value={addMemberUserId} onChange={e => setAddMemberUserId(e.target.value)}>
                  <option value="">Select user...</option>
                  {state.users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.title})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Role</label>
                <select className="form-select" value={addMemberRole} onChange={e => setAddMemberRole(e.target.value)}>
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddMemberSave} disabled={!addMemberUserId}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
