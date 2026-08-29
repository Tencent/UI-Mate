import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId, frameworkLabel } from '../utils/helpers';

const MOCK_REPOS = [
  { name: 'my-blog', visibility: 'public', updatedAt: '2 days ago' },
  { name: 'portfolio', visibility: 'public', updatedAt: '5 days ago' },
  { name: 'api-server', visibility: 'private', updatedAt: '1 week ago' },
  { name: 'mobile-app', visibility: 'private', updatedAt: '2 weeks ago' },
];

const TEMPLATES = [
  { name: 'Next.js Starter', description: 'The all-in-one React framework with TypeScript', framework: 'nextjs' },
  { name: 'Vite React', description: 'Fast and lightweight React setup with Vite', framework: 'vite' },
  { name: 'Astro Blog', description: 'Static blog powered by Astro and content collections', framework: 'astro' },
  { name: 'SvelteKit Demo', description: 'Full-stack web app with SvelteKit', framework: 'sveltekit' },
];

export default function NewProject() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [repoSearch, setRepoSearch] = useState('');
  const [importRepo, setImportRepo] = useState(null);
  const [config, setConfig] = useState({ name: '', framework: 'nextjs', buildCommand: '', outputDirectory: '', installCommand: '' });

  const filteredRepos = MOCK_REPOS.filter(r => !repoSearch || r.name.includes(repoSearch));

  const handleImport = (repo) => {
    setImportRepo(repo);
    setConfig(c => ({ ...c, name: repo.name }));
  };

  const handleDeploy = () => {
    if (!config.name.trim()) return;
    const projectId = generateId('prj');
    const depId = generateId('dpl');
    const framework = config.framework || 'nextjs';

    dispatch({ type: 'ADD_PROJECT', payload: {
      id: projectId,
      name: config.name.trim(),
      slug: config.name.trim().toLowerCase().replace(/\s+/g, '-'),
      framework,
      gitRepo: {
        provider: 'github',
        owner: state.currentUser?.username || 'alexjohnson',
        name: importRepo?.name || config.name.trim(),
        url: `https://github.com/${state.currentUser?.username}/${importRepo?.name || config.name.trim()}`,
        branch: 'main',
      },
      productionUrl: `${config.name.trim().toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
      customDomains: [],
      latestDeployment: depId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buildCommand: config.buildCommand || 'npm run build',
      outputDirectory: config.outputDirectory || 'dist',
      installCommand: config.installCommand || 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false,
    }});

    dispatch({ type: 'ADD_DEPLOYMENT', payload: {
      id: depId,
      projectId,
      url: `${config.name.trim().toLowerCase()}-initial.vercel.app`,
      productionUrl: `${config.name.trim().toLowerCase()}.vercel.app`,
      status: 'BUILDING',
      environment: 'production',
      git: { branch: 'main', commitSha: Math.random().toString(36).slice(2, 9), commitMessage: 'Initial deployment', author: state.currentUser?.username },
      buildDuration: null,
      framework,
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: new Date().toISOString(), text: 'Cloning repository...' },
        { timestamp: new Date().toISOString(), text: 'Installing dependencies...' },
        { timestamp: new Date().toISOString(), text: `Running build command: npm run build` },
      ],
      createdAt: new Date().toISOString(),
      readyAt: null,
      creatorId: state.currentUser?.id,
    }});

    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'project.created',
      description: `Created project ${config.name.trim()}`,
      userId: state.currentUser?.id,
      userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar,
      projectId,
      projectName: config.name.trim(),
      metadata: {},
    }});

    // Simulate build complete
    setTimeout(() => {
      dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: depId, status: 'READY', readyAt: new Date().toISOString(), buildDuration: 45 }});
    }, 5000);

    navigate(`/project/${projectId}/overview`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Project</h1>
      </div>
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Import Git Repo */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Import Git Repository</h2>
          <input
            placeholder="Search repositories..."
            value={repoSearch}
            onChange={e => setRepoSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 16 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredRepos.map(repo => (
              <div key={repo.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{repo.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                    <span className={`badge ${repo.visibility === 'public' ? 'badge-production' : 'badge-preview'}`} style={{ fontSize: 10, marginRight: 6 }}>
                      {repo.visibility}
                    </span>
                    {repo.updatedAt}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleImport(repo)}>Import</button>
              </div>
            ))}
          </div>

          {importRepo && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Configure Project</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Project Name', key: 'name', placeholder: 'project-name' },
                  { label: 'Build Command', key: 'buildCommand', placeholder: 'npm run build' },
                  { label: 'Output Directory', key: 'outputDirectory', placeholder: 'dist' },
                  { label: 'Install Command', key: 'installCommand', placeholder: 'npm install' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <div style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 4 }}>{label}</div>
                    <input value={config[key]} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))} placeholder={placeholder} style={{ width: '100%' }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 4 }}>Framework Preset</div>
                  <select value={config.framework} onChange={e => setConfig(c => ({ ...c, framework: e.target.value }))} style={{ width: '100%' }}>
                    {['nextjs', 'vite', 'remix', 'astro', 'nuxt', 'sveltekit', 'gatsby'].map(f => (
                      <option key={f} value={f}>{frameworkLabel(f)}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleDeploy} style={{ marginTop: 8 }}>Deploy</button>
              </div>
            </div>
          )}
        </div>

        {/* Clone Template */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Clone Template</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TEMPLATES.map(template => (
              <div key={template.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{template.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{template.description}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setImportRepo({ name: template.name.toLowerCase().replace(/\s+/g, '-'), visibility: 'public', updatedAt: 'now' });
                  setConfig(c => ({ ...c, name: template.name.toLowerCase().replace(/\s+/g, '-'), framework: template.framework }));
                }}>
                  Deploy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
