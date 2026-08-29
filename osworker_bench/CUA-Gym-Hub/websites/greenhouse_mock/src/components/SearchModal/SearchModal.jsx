import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, User, Briefcase } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function SearchModal({ onClose }) {
  const { state } = useAppContext();
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const sid = searchParams.get('sid');

  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const q = query.toLowerCase().trim();

  const candidateResults = q
    ? state.candidates.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.currentCompany || '').toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const jobResults = q
    ? state.jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (state.departments.find(d => d.id === j.departmentId)?.name || '').toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const handleCandidateClick = (cand) => {
    navigate(buildLink(`/candidates/${cand.id}`));
    onClose();
  };

  const handleJobClick = (job) => {
    navigate(buildLink(`/jobs/${job.id}`));
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 8, width: '100%', maxWidth: 600, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
          <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, jobs..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              padding: '0 12px',
              color: 'var(--text-primary)'
            }}
          />
          <button aria-label="Close search" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {!q && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Search size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>Type to search candidates and jobs</p>
            </div>
          )}

          {q && candidateResults.length === 0 && jobResults.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No results found for "{query}"
            </div>
          )}

          {candidateResults.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Candidates
              </div>
              {candidateResults.map(cand => (
                <div
                  key={cand.id}
                  onClick={() => handleCandidateClick(cand)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="avatar avatar-sm" style={{ background: 'var(--accent)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {cand.firstName[0]}{cand.lastName[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{cand.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cand.currentTitle} at {cand.currentCompany}</div>
                  </div>
                  <User size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}

          {jobResults.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Jobs
              </div>
              {jobResults.map(job => {
                const dept = state.departments.find(d => d.id === job.departmentId);
                return (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 32, height: 32, background: 'var(--divider)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={14} color="var(--text-secondary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dept?.name}</div>
                    </div>
                    <span className={`badge badge-${job.status === 'open' ? 'green' : job.status === 'closed' ? 'gray' : 'yellow'}`}>
                      {job.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
