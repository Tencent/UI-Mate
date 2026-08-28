import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatDuration, formatFileSize } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

function StepsTab({ job, testResults, artifacts }) {
  const [expandedSteps, setExpandedSteps] = useState(() => {
    const init = {};
    (job.steps || []).forEach(s => {
      if (s.status === 'failed') init[s.id] = true;
    });
    return init;
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleStep = (id) => setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));

  const filterOutput = (lines) => {
    if (!searchTerm.trim()) return lines;
    return lines.filter(l => l.text.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const isErrorLine = (text) => {
    const lower = text.toLowerCase();
    return lower.includes('error') || lower.includes('fail') || lower.includes('exit status');
  };

  return (
    <div className="step-list">
      {(!job.steps || job.steps.length === 0) ? (
        <div className="empty-state">
          <div className="empty-state-title">No step output available</div>
          <div className="empty-state-desc">This job type does not have steps</div>
        </div>
      ) : (
        job.steps.map(step => (
          <div key={step.id} className={`step-item ${step.status}`}>
            <div className="step-header" onClick={() => toggleStep(step.id)}>
              <StatusBadge status={step.status} />
              <span className="step-name">{step.name}</span>
              <span className="step-duration">{formatDuration(step.duration)}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expandedSteps[step.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSteps[step.id] && (
              <div>
                {step.output && step.output.length > 0 && (
                  <div className="terminal-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      placeholder="Search output..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <div className="terminal">
                  {filterOutput(step.output || []).map(line => (
                    <div key={line.line} className="terminal-line">
                      <span className="terminal-line-number">{line.line}</span>
                      <span className={`terminal-line-text${isErrorLine(line.text) ? ' error' : ''}`}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                  {filterOutput(step.output || []).length === 0 && (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>No matching lines</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function TestsTab({ testResults }) {
  const [expanded, setExpanded] = useState({});

  if (!testResults || testResults.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div className="empty-state-title" style={{ marginTop: 12 }}>No test results found</div>
        <div className="empty-state-desc">Test results will appear here when available</div>
      </div>
    );
  }

  const totalPassed = testResults.reduce((a, s) => a + s.passed, 0);
  const totalFailed = testResults.reduce((a, s) => a + s.failed, 0);
  const totalSkipped = testResults.reduce((a, s) => a + s.skipped, 0);

  return (
    <div style={{ padding: 24 }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, background: 'var(--content-secondary-bg)', padding: '12px 16px', borderRadius: 8 }}>
        <div><span style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{totalPassed}</span><span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 4 }}>passed</span></div>
        {totalFailed > 0 && <div><span style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{totalFailed}</span><span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 4 }}>failed</span></div>}
        {totalSkipped > 0 && <div><span style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray)' }}>{totalSkipped}</span><span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 4 }}>skipped</span></div>}
      </div>

      {/* Test suites */}
      {testResults.map(suite => (
        <div key={suite.id} style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 6 }}>
          <div
            style={{ padding: '10px 14px', background: 'var(--content-secondary-bg)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => setExpanded(prev => ({ ...prev, [suite.id]: !prev[suite.id] }))}
          >
            <span style={{ color: suite.failed > 0 ? 'var(--red)' : 'var(--green)', fontSize: 14 }}>{suite.failed > 0 ? '✗' : '✓'}</span>
            <span style={{ flex: 1, fontSize: 13, fontFamily: 'var(--mono)' }}>{suite.suiteName}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{suite.passed}/{suite.totalTests}</span>
          </div>
          {expanded[suite.id] && suite.failures && suite.failures.length > 0 && (
            <div style={{ padding: 14 }}>
              {suite.failures.map((fail, i) => (
                <div key={i} style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>{fail.testName}</div>
                  <pre style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', whiteSpace: 'pre-wrap', marginBottom: 6 }}>{fail.message}</pre>
                  <pre style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{fail.stackTrace}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function artifactContent(artifact) {
  const path = artifact.path || 'artifact.txt';
  if (path.endsWith('.html')) {
    return `<!doctype html>
<html><head><title>${path}</title></head>
<body><h1>XircleCI Artifact</h1><p>${path}</p><p>Generated by the local sandbox.</p></body></html>`;
  }
  if (path.endsWith('.json')) {
    return JSON.stringify({ path, size: artifact.size, generatedBy: 'circleci_mock', downloadedAt: new Date().toISOString() }, null, 2);
  }
  if (path.endsWith('.xml')) {
    return `<?xml version="1.0" encoding="UTF-8"?><testsuite name="${path}" tests="1" failures="0"><testcase classname="sandbox" name="download-artifact"/></testsuite>`;
  }
  if (path.endsWith('.css')) return 'body { font-family: Inter, sans-serif; }\n';
  if (path.endsWith('.js')) return 'console.log("XircleCI sandbox artifact");\n';
  return `XircleCI sandbox artifact\nPath: ${path}\nSize: ${artifact.size} bytes\n`;
}

function mimeTypeFor(path) {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.xml')) return 'application/xml';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  return 'text/plain';
}

function ArtifactsTab({ artifacts }) {
  const [downloaded, setDownloaded] = useState(null);

  const handleDownload = (artifact) => {
    const blob = new Blob([artifactContent(artifact)], { type: mimeTypeFor(artifact.path) });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = artifact.path.split('/').pop() || 'artifact.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    setDownloaded(artifact.path);
  };

  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
        <div className="empty-state-title" style={{ marginTop: 12 }}>No artifacts</div>
        <div className="empty-state-desc">Build artifacts will appear here</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {downloaded && (
        <div className="notice-card" role="status" style={{ marginBottom: 12 }}>
          Downloaded {downloaded.split('/').pop()} from local sandbox artifacts.
        </div>
      )}
      <table className="env-table">
        <thead>
          <tr>
            <th>Path</th>
            <th>Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {artifacts.map(art => (
            <tr key={art.id}>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{art.path}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{formatFileSize(art.size)}</td>
              <td>
                <button className="btn" onClick={() => handleDownload(art)} style={{ padding: '3px 10px', fontSize: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimingTab({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <div className="empty-state-title">No timing data</div>
      </div>
    );
  }

  const maxDuration = Math.max(...steps.map(s => s.duration || 0), 1);
  const total = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="timing-chart">
      <div style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
        Total duration: <strong style={{ color: 'var(--text-primary)' }}>{formatDuration(total)}</strong>
      </div>
      {steps.map(step => (
        <div key={step.id} className="timing-bar-row">
          <div className="timing-bar-label" title={step.name}>{step.name}</div>
          <div className="timing-bar-track">
            <div
              className={`timing-bar-fill ${step.status}`}
              style={{ width: `${Math.max(2, (step.duration / maxDuration) * 100)}%` }}
            />
          </div>
          <div className="timing-bar-duration">{formatDuration(step.duration)}</div>
        </div>
      ))}
    </div>
  );
}

export default function JobDetail() {
  const { pipelineId, workflowId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('steps');

  const pipeline = state.pipelines.find(p => p.id === pipelineId);
  const workflow = state.workflows.find(w => w.id === workflowId);
  const job = state.jobs.find(j => j.id === jobId);
  const project = pipeline ? state.projects.find(p => p.id === pipeline.projectId) : null;

  if (!job || !workflow || !pipeline) return (
    <div className="empty-state" style={{ marginTop: 48 }}>
      <div className="empty-state-title">Job not found</div>
    </div>
  );

  const testResults = state.testResults.filter(t => t.jobId === jobId);
  const artifacts = state.artifacts.filter(a => a.jobId === jobId);

  const tabs = [
    { id: 'steps', label: 'Steps' },
    { id: 'tests', label: `Tests${testResults.length > 0 ? ` (${testResults.reduce((a, s) => a + s.totalTests, 0)})` : ''}` },
    { id: 'artifacts', label: `Artifacts${artifacts.length > 0 ? ` (${artifacts.length})` : ''}` },
    { id: 'timing', label: 'Timing' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="text-link" onClick={() => navigate(toPath('/pipelines'))}>Pipelines</span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link" onClick={() => navigate(toPath(`/pipelines/${pipelineId}`))}>
          {project?.name} #{pipeline.number}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link" onClick={() => navigate(toPath(`/pipelines/${pipelineId}/workflows/${workflowId}`))}>
          {workflow.name}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{job.name}</span>
      </div>

      {/* Job header */}
      <div className="pipeline-meta">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <StatusBadge status={job.status} />
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>{job.name}</h2>
            <span className="duration">{formatDuration(job.duration)}</span>
            <span style={{ background: 'var(--content-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
              {job.executor.type} / {job.executor.resourceClass}
            </span>
            <span className="text-mono" style={{ color: 'var(--text-secondary)' }}>#{job.jobNumber}</span>
          </div>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'RERUN_JOB', payload: { jobId } })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            Rerun Job
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'steps' && <StepsTab job={job} testResults={testResults} artifacts={artifacts} />}
        {activeTab === 'tests' && <TestsTab testResults={testResults} />}
        {activeTab === 'artifacts' && <ArtifactsTab artifacts={artifacts} />}
        {activeTab === 'timing' && <TimingTab steps={job.steps || []} />}
      </div>
    </div>
  );
}
