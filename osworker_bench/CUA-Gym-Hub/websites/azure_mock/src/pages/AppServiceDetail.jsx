import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import TagEditor from '../components/TagEditor';
import { Globe, RefreshCw, Trash2, ExternalLink, Square, RotateCcw } from 'lucide-react';

const menuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity log' },
  { id: 'deployment', label: 'Deployment center' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'tags', label: 'Tags' },
];

export default function AppServiceDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const app = state.appServices.find(a => a.id === id);
  if (!app) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'App Services', path: '/app-services' }, { label: 'Not found' }]} />
        <h1 className="page-title">App Service not found</h1>
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--xzure-text-secondary)' }}>The requested App Service could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/app-services')} style={{ marginTop: '16px' }}>Back to App Services</button>
        </div>
      </div>
    );
  }

  // Update recent resources
  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_RECENT_RESOURCES',
      payload: { name: app.name, type: 'App Service', resourceGroup: app.resourceGroup }
    });
  }, [app.name]);

  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleStop = () => {
    dispatch({ type: 'UPDATE_APP_STATUS', payload: { id: app.id, status: 'Stopped' } });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: 'App Service stopped',
        message: `${app.name} was stopped.`,
        level: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        resourceName: app.name
      }
    });
  };

  const handleRestart = () => {
    dispatch({ type: 'UPDATE_APP_STATUS', payload: { id: app.id, status: 'Running' } });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: 'App Service restarted',
        message: `${app.name} was restarted successfully.`,
        level: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        resourceName: app.name
      }
    });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_APP_SERVICE', payload: app.id });
    navigate('/app-services');
  };

  const sub = state.subscriptions.find(s => s.id === app.subscriptionId) || state.subscriptions[0];

  const handleSaveTags = (newTags) => {
    // We'd need an UPDATE_APP_TAGS action, but we can use a generic approach
    dispatch({ type: 'UPDATE_APP_TAGS', payload: { id: app.id, tags: newTags } });
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'App Services', path: '/app-services' }, { label: app.name }]} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Globe size={28} color="var(--xzure-blue)" />
        <div>
          <h1 className="page-title" style={{ marginBottom: '0' }}>{app.name}</h1>
          <div className="caption">App Service</div>
        </div>
      </div>

      <div className="command-bar">
        <button className="btn btn-default" onClick={handleRefresh}><RefreshCw size={14} /> Refresh</button>
        <button className="btn btn-default" onClick={() => setBrowseOpen(true)}>
          <ExternalLink size={14} /> Browse
        </button>
        <button className="btn btn-default" onClick={handleRestart}><RotateCcw size={14} /> Restart</button>
        <button className="btn btn-default" onClick={handleStop}><Square size={14} /> Stop</button>
        <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} /> Delete</button>
      </div>

      {deleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>Delete App Service</h2>
            <p style={{ marginBottom: '20px', color: 'var(--xzure-text-secondary)' }}>
              Are you sure you want to delete <strong>{app.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {browseOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>App Service Preview</h2>
            <p style={{ marginBottom: '12px', color: 'var(--xzure-text-secondary)' }}>
              Local sandbox preview for the app service host name.
            </p>
            <div style={{ fontFamily: 'monospace', padding: '10px 12px', background: 'var(--xzure-bg)', border: '1px solid var(--xzure-border)', marginBottom: '20px' }}>
              https://{app.defaultHostName}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => setBrowseOpen(false)}>Close</button>
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
                      <div><Link to={`/resource-groups/${app.resourceGroup}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{app.resourceGroup}</Link></div>
                      <div className="caption">Status</div>
                      <div><span className="badge badge-success">{app.status}</span></div>
                      <div className="caption">Location</div>
                      <div>{app.location}</div>
                      <div className="caption">Subscription</div>
                      <div><Link to={`/subscriptions/${sub?.id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sub?.displayName}</Link></div>
                      <div className="caption">Subscription ID</div>
                      <div style={{ fontSize: '13px' }}>{sub?.subscriptionId}</div>
                      <div className="caption">Tags</div>
                      <div>{Object.entries(app.tags || {}).map(([k, v]) => (
                        <span key={k} className="badge badge-info" style={{ marginRight: '4px', marginBottom: '4px' }}>{k}: {v}</span>
                      ))}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 12px' }}>
                      <div className="caption">URL</div>
                      <div>
                        <a href={`https://${app.defaultHostName}`} onClick={e => e.preventDefault()} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>
                          https://{app.defaultHostName}
                        </a>
                      </div>
                      <div className="caption">App Service plan</div>
                      <div>{app.appServicePlan}</div>
                      <div className="caption">Runtime stack</div>
                      <div>{app.runtime}</div>
                      <div className="caption">Operating System</div>
                      <div>{app.kind === 'app' ? 'Linux' : app.kind}</div>
                      <div className="caption">HTTPS Only</div>
                      <div>{app.httpsOnly ? 'On' : 'Off'}</div>
                      <div className="caption">Default domain</div>
                      <div style={{ fontSize: '13px' }}>{app.defaultHostName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Activity log</div>
              <div className="card" style={{ padding: 0 }}>
                <table className="xzure-table">
                  <thead>
                    <tr><th>Operation</th><th>Status</th><th>Time</th><th>Initiated by</th></tr>
                  </thead>
                  <tbody>
                    {state.activityLog
                      .filter(e => e.resourceName === app.name)
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map(event => (
                        <tr key={event.id}>
                          <td>{event.operationName}</td>
                          <td><span className={`badge ${event.status === 'Succeeded' ? 'badge-success' : 'badge-error'}`}>{event.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(event.timestamp).toLocaleString()}</td>
                          <td>{event.initiatedBy}</td>
                        </tr>
                      ))}
                    {state.activityLog.filter(e => e.resourceName === app.name).length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No activity log entries</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Deployment center</div>
              <div className="card">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Source</div>
                  <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '12px' }}>
                    Configure how your app is deployed. Connect a source control repository or use local Git.
                  </div>
                  <select className="input" style={{ width: '300px' }}>
                    <option>GitHub</option>
                    <option>Xzure DevOps</option>
                    <option>Local Git</option>
                    <option>External Git</option>
                    <option>Bitbucket</option>
                  </select>
                </div>
                <div style={{ padding: '16px', background: 'var(--xzure-bg)', borderRadius: '2px', color: 'var(--xzure-text-secondary)', fontSize: '13px' }}>
                  No deployment source configured. Select a source above and click Save to configure continuous deployment.
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary">Save</button>
                  <button className="btn btn-default" style={{ marginLeft: '8px' }}>Disconnect</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Configuration</div>
              <div className="card">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Application settings</div>
                  <div style={{ color: 'var(--xzure-text-secondary)', fontSize: '13px' }}>
                    Application settings are exposed as environment variables to your application.
                  </div>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  <table className="xzure-table">
                    <thead><tr><th>Name</th><th>Value</th><th>Source</th></tr></thead>
                    <tbody>
                      <tr><td>WEBSITE_NODE_DEFAULT_VERSION</td><td>~18</td><td>App Setting</td></tr>
                      <tr><td>SCM_DO_BUILD_DURING_DEPLOYMENT</td><td>true</td><td>App Setting</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Tags</div>
              <TagEditor tags={app.tags || {}} onSave={handleSaveTags} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
