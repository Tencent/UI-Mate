import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, ExternalLink,
  Plus, Calendar, Clock, ThumbsUp, ThumbsDown, Star, X, Pin
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import RejectModal from '../components/RejectModal/RejectModal';
import MoveStageModal from '../components/MoveStageModal/MoveStageModal';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal/ScheduleInterviewModal';

function Avatar({ user, size = 36 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 600, flexShrink: 0
    }}>
      {user.firstName?.[0]}{user.lastName?.[0]}
    </div>
  );
}

const recommendationStyles = {
  strong_yes: { bg: '#1B3A2D', color: 'white', label: 'Strong Yes' },
  yes: { bg: '#16A34A', color: 'white', label: 'Yes' },
  no_opinion: { bg: '#6B7280', color: 'white', label: 'No Opinion' },
  no: { bg: '#F59E0B', color: 'white', label: 'No' },
  strong_no: { bg: '#DC2626', color: 'white', label: 'Strong No' }
};

const activityIcons = {
  stage_change: '→',
  scorecard_submitted: '📋',
  note_added: '📝',
  email_sent: '📧',
  interview_scheduled: '📅',
  offer_created: '📄',
  rejection: '❌',
  application_submitted: '✅'
};

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [activeMainTab, setActiveMainTab] = useState('activity');
  const [activeSideTab, setActiveSideTab] = useState('details');
  const [showReject, setShowReject] = useState(false);
  const [showMoveStage, setShowMoveStage] = useState(false);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [noteBody, setNoteBody] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('public');
  const [activeJobId, setActiveJobId] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const candidate = state.candidates.find(c => c.id === candidateId);
  if (!candidate) return <div style={{ padding: 24 }}>Candidate not found</div>;

  const candidateApps = state.applications.filter(a => a.candidateId === candidateId);
  const activeApp = activeJobId
    ? candidateApps.find(a => a.jobId === activeJobId)
    : (candidateApps.find(a => a.status === 'active') || candidateApps[0]);

  const job = activeApp ? state.jobs.find(j => j.id === activeApp.jobId) : null;
  const stages = activeApp ? state.jobStages.filter(s => s.jobId === activeApp.jobId).sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const currentStageIndex = stages.findIndex(s => s.id === activeApp?.currentStageId);

  const recruiter = activeApp ? state.users.find(u => u.id === activeApp.recruiterId) : null;
  const referrer = candidate.referrerId ? state.users.find(u => u.id === candidate.referrerId) : null;

  const activityFeed = state.activityFeed
    .filter(a => a.candidateId === candidateId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const scorecards = state.scorecards.filter(sc => {
    const app = state.applications.find(a => a.id === sc.applicationId);
    return app?.candidateId === candidateId;
  });

  const interviews = state.interviews.filter(i => {
    const app = state.applications.find(a => a.id === i.applicationId);
    return app?.candidateId === candidateId;
  });

  const offers = state.offers.filter(o => {
    const app = state.applications.find(a => a.id === o.applicationId);
    return app?.candidateId === candidateId;
  });

  const notes = state.notes
    .filter(n => n.candidateId === candidateId)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleAddNote = () => {
    if (!noteBody.trim()) return;
    const newNote = {
      id: uuidv4(),
      candidateId,
      authorId: state.currentUser.id,
      body: noteBody.trim(),
      visibility: noteVisibility,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTE', payload: newNote });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId,
        applicationId: activeApp?.id || null,
        type: 'note_added',
        actorId: state.currentUser.id,
        description: `Note added by ${state.currentUser.name}`,
        metadata: { noteId: newNote.id },
        createdAt: new Date().toISOString()
      }
    });
    setNoteBody('');
  };

  const handlePinNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    dispatch({ type: 'UPDATE_NOTE', payload: { id: noteId, isPinned: !note.isPinned } });
  };

  const handleDeleteNote = (noteId) => {
    dispatch({ type: 'DELETE_NOTE', payload: { id: noteId } });
  };

  const openEmailModal = () => {
    setEmailTo(candidate.email || '');
    setEmailSubject(`Regarding your application - ${job?.title || 'Position'}`);
    setEmailBody('');
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId,
        applicationId: activeApp?.id || null,
        type: 'email_sent',
        actorId: state.currentUser.id,
        description: `Email sent: "${emailSubject}"`,
        metadata: { to: emailTo, subject: emailSubject },
        createdAt: new Date().toISOString()
      }
    });
    setShowEmailModal(false);
    setEmailTo('');
    setEmailSubject('');
    setEmailBody('');
  };

  const hasRealResumeUrl = candidate.resumeUrl && candidate.resumeUrl !== '#';
  const resumeFileName = candidate.resumeFile?.originalName || (hasRealResumeUrl ? candidate.resumeUrl.split('/').pop() : `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`);
  const generatedResumeText = [
    `${candidate.name} Resume`,
    '',
    `Email: ${candidate.email || 'Not provided'}`,
    `Phone: ${candidate.phone || 'Not provided'}`,
    `Location: ${candidate.location || 'Not provided'}`,
    `Current role: ${candidate.currentTitle || 'Candidate'}${candidate.currentCompany ? ` at ${candidate.currentCompany}` : ''}`,
    `Tags: ${(candidate.tags || []).join(', ') || 'None'}`,
    '',
    'Sandbox resume preview generated from candidate profile data.'
  ].join('\n');
  const generatedResumeUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(generatedResumeText)}`;

  return (
    <div style={{ padding: '24px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(buildLink('/candidates'))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={14} /> All Candidates
      </button>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 6, border: '1px solid var(--border)', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 600, flexShrink: 0
            }}>
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{candidate.name}</h1>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {candidate.currentTitle} at {candidate.currentCompany}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {candidate.email && (
                  <a href={`mailto:${candidate.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent)' }}>
                    <Mail size={13} /> {candidate.email}
                  </a>
                )}
                {candidate.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Phone size={13} /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                    <MapPin size={13} /> {candidate.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {candidateApps.length > 1 && (
              <select
                className="form-select"
                style={{ width: 180 }}
                value={activeJobId || activeApp?.jobId || ''}
                onChange={e => setActiveJobId(e.target.value)}
              >
                {candidateApps.map(app => {
                  const j = state.jobs.find(jj => jj.id === app.jobId);
                  return <option key={app.id} value={app.jobId}>{j?.title}</option>;
                })}
              </select>
            )}
            <button className="btn btn-outline btn-sm" onClick={openEmailModal}>
              <Mail size={13} /> Email
            </button>
            {activeApp && activeApp.status === 'active' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMoveStage(true)}>
                  Move Stage
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setShowReject(true)}>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
        {job && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#F5F5F5', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Applied for{' '}
              <a href={buildLink(`/jobs/${job.id}`)} onClick={e => { e.preventDefault(); navigate(buildLink(`/jobs/${job.id}`)); }} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                {job.title}
              </a>
              {activeApp && (
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                  · Stage: <strong>{stages.find(s => s.id === activeApp.currentStageId)?.name}</strong>
                  {activeApp.status !== 'active' && (
                    <span className={`badge badge-${activeApp.status === 'rejected' ? 'red' : 'blue'}`} style={{ marginLeft: 8 }}>
                      {activeApp.status}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Main content + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, paddingBottom: 24 }}>
        {/* Main content */}
        <div>
          {/* Tabs */}
          <div className="tabs">
            {[
              { key: 'activity', label: 'Activity' },
              { key: 'scorecards', label: `Scorecards (${scorecards.length})` },
              { key: 'interviews', label: `Interviews (${interviews.length})` },
              { key: 'offers', label: `Offers (${offers.length})` },
            ].map(tab => (
              <button key={tab.key} className={`tab ${activeMainTab === tab.key ? 'active' : ''}`} onClick={() => setActiveMainTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Activity tab */}
          {activeMainTab === 'activity' && (
            <div>
              {activityFeed.length === 0 ? (
                <div className="empty-state"><h3>No activity yet</h3></div>
              ) : activityFeed.map(act => {
                const actor = state.users.find(u => u.id === act.actorId);
                return (
                  <div key={act.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
                    <div style={{ width: 28, height: 28, background: '#F3F4F6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {activityIcons[act.type] || '•'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{act.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {actor?.name} · {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scorecards tab */}
          {activeMainTab === 'scorecards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scorecards.length === 0 ? (
                <div className="empty-state"><h3>No scorecards yet</h3></div>
              ) : scorecards.map(sc => {
                const interviewer = state.users.find(u => u.id === sc.interviewerId);
                const app = state.applications.find(a => a.id === sc.applicationId);
                const scJob = app ? state.jobs.find(j => j.id === app.jobId) : null;
                const scStage = state.jobStages.find(s => s.id === sc.stageId);
                const rec = sc.overallRecommendation ? recommendationStyles[sc.overallRecommendation] : null;

                return (
                  <div key={sc.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer' }}
                    onClick={() => navigate(buildLink(`/candidates/${candidateId}/scorecard/${sc.id}`))}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {interviewer && <Avatar user={interviewer} size={32} />}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{interviewer?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {scJob?.title} · {scStage?.name}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {rec ? (
                          <span style={{ background: rec.bg, color: rec.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                            {rec.label}
                          </span>
                        ) : (
                          <span className="badge badge-yellow">Pending</span>
                        )}
                        {sc.submittedAt && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {format(new Date(sc.submittedAt), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    {sc.notes && (
                      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--divider)', paddingTop: 10 }}>
                        {sc.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Interviews tab */}
          {activeMainTab === 'interviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleInterview(true)}>
                  <Plus size={14} /> Schedule Interview
                </button>
              </div>
              {interviews.length === 0 ? (
                <div className="empty-state"><h3>No interviews scheduled</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {interviews.map(i => {
                    const interviewers = i.interviewerIds.map(uid => state.users.find(u => u.id === uid)).filter(Boolean);
                    const iApp = state.applications.find(a => a.id === i.applicationId);
                    const iJob = iApp ? state.jobs.find(j => j.id === iApp.jobId) : null;
                    const iStage = state.jobStages.find(s => s.id === i.stageId);
                    const statusMap = { scheduled: 'badge-green', completed: 'badge-blue', cancelled: 'badge-gray' };

                    return (
                      <div key={i.id} className="card" style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                              {iStage?.name} — {iJob?.title}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={12} /> {format(new Date(i.scheduledAt), 'MMM d, yyyy h:mm a')}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {i.duration} min
                              </span>
                              <span>{i.location}</span>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {interviewers.map(iv => (
                                <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Avatar user={iv} size={20} />
                                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{iv.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <span className={`badge ${statusMap[i.status] || 'badge-gray'}`}>{i.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Offers tab */}
          {activeMainTab === 'offers' && (
            <div>
              {offers.length === 0 ? (
                <div className="empty-state"><h3>No offers yet</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {offers.map(offer => {
                    const statusMap = { pending_approval: 'badge-yellow', approved: 'badge-blue', sent: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red', draft: 'badge-gray' };
                    return (
                      <div key={offer.id} className="card" style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 20 }}>${offer.salary.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/year</span></div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                              Start: {format(new Date(offer.startDate), 'MMM d, yyyy')} · Expires: {format(new Date(offer.expiresAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <span className={`badge ${statusMap[offer.status] || 'badge-gray'}`}>
                            {offer.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Approvers:
                          {offer.approvers.map(ap => {
                            const approver = state.users.find(u => u.id === ap.userId);
                            return (
                              <span key={ap.userId} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {ap.status === 'approved' ? '✅' : ap.status === 'rejected' ? '❌' : '⏳'}
                                {approver?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="tabs">
            {[
              { key: 'details', label: 'Details' },
              { key: 'application', label: 'Application' },
              { key: 'notes', label: `Notes (${notes.length})` },
            ].map(tab => (
              <button key={tab.key} className={`tab ${activeSideTab === tab.key ? 'active' : ''}`} onClick={() => setActiveSideTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Details tab */}
          {activeSideTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card" style={{ padding: '16px' }}>
                {[
                  { label: 'Email', value: candidate.email, href: `mailto:${candidate.email}` },
                  { label: 'Phone', value: candidate.phone },
                  { label: 'Location', value: candidate.location },
                  { label: 'Current Company', value: candidate.currentCompany },
                  { label: 'Current Title', value: candidate.currentTitle },
                  { label: 'Source', value: candidate.source, capitalize: true },
                  { label: 'Referred By', value: referrer?.name },
                ].filter(f => f.value).map(field => (
                  <div key={field.label} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 110, flexShrink: 0 }}>{field.label}</span>
                    {field.href ? (
                      <a href={field.href} style={{ fontSize: 13, color: 'var(--accent)' }}>{field.value}</a>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: field.capitalize ? 'capitalize' : 'none' }}>
                        {field.value}
                      </span>
                    )}
                  </div>
                ))}
                {candidate.tags.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {candidate.tags.map(tag => (
                        <span key={tag} className="badge badge-gray" style={{ fontSize: 11 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button type="button" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }} onClick={() => setShowResumePreview(true)}>
                <ExternalLink size={13} /> View Resume
              </button>
              {candidate.linkedinUrl && (
                <button type="button" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }} onClick={() => setShowLinkedInPreview(true)}>
                  <ExternalLink size={13} /> LinkedIn Profile
                </button>
              )}
            </div>
          )}

          {/* Application tab */}
          {activeSideTab === 'application' && (
            <div className="card" style={{ padding: '16px' }}>
              {activeApp ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Applied</div>
                    <div style={{ fontSize: 13 }}>{format(new Date(activeApp.appliedAt), 'MMM d, yyyy')}</div>
                  </div>
                  {recruiter && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Recruiter</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar user={recruiter} size={24} />
                        <span style={{ fontSize: 13 }}>{recruiter.name}</span>
                      </div>
                    </div>
                  )}
                  {/* Pipeline progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Pipeline Progress</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {stages.map((stage, i) => (
                        <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: i < currentStageIndex ? 'var(--accent)'
                              : i === currentStageIndex ? 'var(--accent)'
                              : 'var(--divider)',
                            border: i === currentStageIndex ? '2px solid var(--accent)' : 'none',
                            flexShrink: 0
                          }} />
                          <span style={{
                            fontSize: 12,
                            fontWeight: i === currentStageIndex ? 600 : 400,
                            color: i <= currentStageIndex ? 'var(--text-primary)' : 'var(--text-muted)'
                          }}>
                            {stage.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeApp.status === 'rejected' && (
                    <div style={{ background: '#FEE2E2', borderRadius: 6, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>Rejected</div>
                      <div style={{ fontSize: 12, color: '#991B1B' }}>
                        {activeApp.rejectionReason} · {activeApp.rejectedAt ? format(new Date(activeApp.rejectedAt), 'MMM d, yyyy') : ''}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No application data</div>
              )}
            </div>
          )}

          {/* Notes tab */}
          {activeSideTab === 'notes' && (
            <div>
              {/* Add note form */}
              <div className="card" style={{ padding: '14px', marginBottom: 12 }}>
                <textarea
                  className="form-textarea"
                  placeholder="Add a note..."
                  value={noteBody}
                  onChange={e => setNoteBody(e.target.value)}
                  style={{ minHeight: 70, marginBottom: 10 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <select className="form-select" style={{ width: 130 }} value={noteVisibility} onChange={e => setNoteVisibility(e.target.value)}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="admin_only">Admin Only</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={!noteBody.trim()}>
                    Save Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {notes.map(note => {
                const author = state.users.find(u => u.id === note.authorId);
                return (
                  <div key={note.id} className="card" style={{ padding: '14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {author && <Avatar user={author} size={24} />}
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{author?.name}</span>
                        {note.isPinned && <Pin size={12} color="var(--accent)" />}
                        <span className={`badge badge-${note.visibility === 'public' ? 'green' : note.visibility === 'private' ? 'yellow' : 'red'}`} style={{ fontSize: 10 }}>
                          {note.visibility}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handlePinNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.isPinned ? 'var(--accent)' : 'var(--text-muted)', padding: 2 }} title="Pin note">
                          <Pin size={13} />
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }} title="Delete note">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{note.body}</p>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showReject && activeApp && (
        <RejectModal
          application={activeApp}
          candidate={candidate}
          onClose={() => setShowReject(false)}
        />
      )}

      {showMoveStage && activeApp && (
        <MoveStageModal
          application={activeApp}
          candidate={candidate}
          stages={stages}
          onClose={() => setShowMoveStage(false)}
        />
      )}

      {showScheduleInterview && activeApp && (
        <ScheduleInterviewModal
          application={activeApp}
          candidate={candidate}
          stages={stages}
          onClose={() => setShowScheduleInterview(false)}
        />
      )}

      {showResumePreview && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowResumePreview(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2 className="modal-title">Resume Preview</h2>
              <button onClick={() => setShowResumePreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 6, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{resumeFileName}</div>
                {candidate.resumeFile ? (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Uploaded resume file is stored locally for this sandbox session.<br />
                    Type: {candidate.resumeFile.contentType || 'application/octet-stream'}<br />
                    Size: {candidate.resumeFile.size ? `${candidate.resumeFile.size} bytes` : 'Unknown'}
                  </div>
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)' }}>
                    {generatedResumeText}
                  </pre>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowResumePreview(false)}>Close</button>
              <a className="btn btn-primary" href={hasRealResumeUrl ? candidate.resumeUrl : generatedResumeUrl} download={resumeFileName}>
                Download Resume
              </a>
            </div>
          </div>
        </div>
      )}

      {showLinkedInPreview && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLinkedInPreview(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">LinkedIn Profile Preview</h2>
              <button onClick={() => setShowLinkedInPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar user={candidate} size={44} />
                <div>
                  <div style={{ fontWeight: 700 }}>{candidate.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{candidate.currentTitle || 'Candidate'}{candidate.currentCompany ? ` at ${candidate.currentCompany}` : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                This local profile preview keeps the sandbox self-contained while preserving the visible Xreenhouse workflow for inspecting candidate social context.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {(candidate.tags || []).map(tag => <span key={tag} className="badge badge-gray">{tag}</span>)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowLinkedInPreview(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Send Email</h3>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>To</label>
                <input className="form-input" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="recipient@email.com" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject</label>
                <input className="form-input" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email subject" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Message</label>
                <textarea className="form-textarea" value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Write your message here..." style={{ minHeight: 120 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEmailModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSendEmail} disabled={!emailTo.trim() || !emailSubject.trim()}>
                <Mail size={13} /> Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
