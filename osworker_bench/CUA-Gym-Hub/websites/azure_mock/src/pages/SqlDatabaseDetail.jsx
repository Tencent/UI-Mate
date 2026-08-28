import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import TagEditor from '../components/TagEditor';
import { Database, RefreshCw, Trash2 } from 'lucide-react';

const menuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'query-editor', label: 'Query editor' },
  { id: 'connection-strings', label: 'Connection strings' },
  { id: 'tags', label: 'Tags' },
];

export default function SqlDatabaseDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [queryAuth, setQueryAuth] = useState('SQL server authentication');
  const [queryUsername, setQueryUsername] = useState('');
  const [queryPassword, setQueryPassword] = useState('');
  const [queryLoggedIn, setQueryLoggedIn] = useState(false);

  const db = state.sqlDatabases.find(d => d.id === id);
  if (!db) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'SQL databases', path: '/sql-databases' }, { label: 'Not found' }]} />
        <h1 className="page-title">SQL database not found</h1>
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--xzure-text-secondary)' }}>The requested SQL database could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/sql-databases')} style={{ marginTop: '16px' }}>Back to SQL databases</button>
        </div>
      </div>
    );
  }

  // Update recent resources
  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_RECENT_RESOURCES',
      payload: { name: db.name, type: 'SQL database', resourceGroup: db.resourceGroup }
    });
  }, [db.name]);

  const sub = state.subscriptions.find(s => s.id === db.subscriptionId) || state.subscriptions[0];

  const handleSaveTags = (newTags) => {
    dispatch({ type: 'UPDATE_SQL_TAGS', payload: { id: db.id, tags: newTags } });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_SQL_DATABASE', payload: db.id });
    navigate('/sql-databases');
  };

  const handleQueryLogin = () => {
    if (queryUsername.trim() && queryPassword.trim()) {
      setQueryLoggedIn(true);
    }
  };

  const connectionStrings = {
    'ADO.NET': `Server=tcp:${db.serverName}.database.windows.net,1433;Initial Catalog=${db.name};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`,
    'JDBC': `jdbc:sqlserver://${db.serverName}.database.windows.net:1433;database=${db.name};encrypt=true;trustServerCertificate=false;loginTimeout=30;`,
    'ODBC': `Driver={ODBC Driver 18 for SQL Server};Server=tcp:${db.serverName}.database.windows.net,1433;Database=${db.name};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`,
    'PHP': `$conn = new PDO("sqlsrv:server=tcp:${db.serverName}.database.windows.net,1433;Database=${db.name}", "<username>", "<password>");`
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'SQL databases', path: '/sql-databases' }, { label: db.name }]} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Database size={28} color="var(--xzure-blue)" />
        <div>
          <h1 className="page-title" style={{ marginBottom: '0' }}>{db.name}</h1>
          <div className="caption">SQL database</div>
        </div>
      </div>

      <div className="command-bar">
        <button className="btn btn-default" onClick={handleRefresh}><RefreshCw size={14} /> Refresh</button>
        <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} /> Delete</button>
      </div>

      {deleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>Delete SQL Database</h2>
            <p style={{ marginBottom: '20px', color: 'var(--xzure-text-secondary)' }}>
              Are you sure you want to delete <strong>{db.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Service menu */}
        <div style={{ minWidth: '200px', flexShrink: 0 }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ borderLeft: activeTab === item.id ? '3px solid var(--xzure-blue)' : '3px solid transparent' }}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'overview' && (
            <div>
              <div className="section-header" style={{ marginBottom: '16px' }}>Essentials</div>
              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 12px' }}>
                      <div className="caption">Resource group</div>
                      <div><Link to={`/resource-groups/${db.resourceGroup}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{db.resourceGroup}</Link></div>
                      <div className="caption">Status</div>
                      <div><span className="badge badge-success">{db.status}</span></div>
                      <div className="caption">Location</div>
                      <div>{db.location}</div>
                      <div className="caption">Subscription</div>
                      <div><Link to={`/subscriptions/${sub?.id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sub?.displayName}</Link></div>
                      <div className="caption">Subscription ID</div>
                      <div style={{ fontSize: '13px' }}>{sub?.subscriptionId}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 12px' }}>
                      <div className="caption">Server name</div>
                      <div>{db.serverName}</div>
                      <div className="caption">Pricing tier</div>
                      <div>{db.pricingTier}</div>
                      <div className="caption">Max size</div>
                      <div>{db.maxSizeGb} GB</div>
                      <div className="caption">Collation</div>
                      <div style={{ fontSize: '13px' }}>{db.collation}</div>
                      <div className="caption">Tags</div>
                      <div>{Object.entries(db.tags || {}).map(([k, v]) => (
                        <span key={k} className="badge badge-info" style={{ marginRight: '4px' }}>{k}: {v}</span>
                      ))}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'query-editor' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Query editor (preview)</div>
              {!queryLoggedIn ? (
                <div className="card">
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--xzure-blue-light)', borderRadius: '2px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Login to continue</div>
                    <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)' }}>
                      Sign in to the SQL server to run queries against this database.
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Authentication type</label>
                    <select className="input" style={{ width: '300px' }} value={queryAuth} onChange={e => setQueryAuth(e.target.value)}>
                      <option>SQL server authentication</option>
                      <option>Active Directory password authentication</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Login</label>
                    <input className="input" style={{ width: '300px' }} placeholder="Username" value={queryUsername} onChange={e => setQueryUsername(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Password</label>
                    <input className="input" type="password" style={{ width: '300px' }} placeholder="Password" value={queryPassword} onChange={e => setQueryPassword(e.target.value)} />
                  </div>
                  {queryUsername.trim() === '' && queryPassword.trim() === '' ? null : (!queryUsername.trim() || !queryPassword.trim()) ? (
                    <div style={{ color: 'var(--xzure-error)', fontSize: '13px', marginBottom: '8px' }}>Please enter both username and password.</div>
                  ) : null}
                  <button className="btn btn-primary" onClick={handleQueryLogin} disabled={!queryUsername.trim() || !queryPassword.trim()}>OK</button>
                </div>
              ) : (
                <div className="card">
                  <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#dff6dd', borderRadius: '2px', color: 'var(--xzure-success)', fontSize: '13px', fontWeight: 600 }}>
                    Connected as {queryUsername}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <textarea className="input" style={{ width: '100%', minHeight: '120px', fontFamily: 'monospace', fontSize: '13px' }} placeholder="SELECT * FROM..." />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary">Run</button>
                    <button className="btn btn-default" onClick={() => setQueryLoggedIn(false)}>Disconnect</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'connection-strings' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Connection strings</div>
              <div style={{ color: 'var(--xzure-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                Use the connection strings below to connect to your database. Replace &lt;username&gt; and &lt;password&gt; with your credentials.
              </div>
              {Object.entries(connectionStrings).map(([name, str]) => (
                <div key={name} className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>{name}</div>
                  <div style={{
                    background: 'var(--xzure-bg)',
                    padding: '12px',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    lineHeight: 1.6
                  }}>
                    {str}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Tags</div>
              <TagEditor tags={db.tags || {}} onSave={handleSaveTags} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
