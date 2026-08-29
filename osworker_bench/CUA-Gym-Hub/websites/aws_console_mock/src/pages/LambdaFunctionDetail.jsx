import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useParams, Link } from 'react-router-dom';
import { Copy, Plus, Trash2, X } from 'lucide-react';

const TEST_TEMPLATES = {
  'API Gateway AWS Proxy': '{\n  "httpMethod": "GET",\n  "path": "/test",\n  "queryStringParameters": null,\n  "body": null\n}',
  'S3 Put': '{\n  "Records": [{\n    "s3": {\n      "bucket": { "name": "my-bucket" },\n      "object": { "key": "test.txt" }\n    }\n  }]\n}',
  'Scheduled Event': '{\n  "source": "aws.events",\n  "detail-type": "Scheduled Event",\n  "time": "2024-03-15T10:00:00Z"\n}',
  'Custom': '{\n  "key1": "value1",\n  "key2": "value2"\n}',
};

export default function LambdaFunctionDetail() {
  const { functionName } = useParams();
  const { state, dispatch, addFlash } = useStore();
  const func = state.lambda.find(f => f.name === functionName);
  const [tab, setTab] = useState('Code');
  const [code, setCode] = useState('');
  const [testEvent, setTestEvent] = useState(TEST_TEMPLATES['Custom']);
  const [testTemplate, setTestTemplate] = useState('Custom');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [configTab, setConfigTab] = useState('General');
  const [envVars, setEnvVars] = useState([]);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [editMemory, setEditMemory] = useState(128);
  const [editTimeout, setEditTimeout] = useState(3);
  const [editDescription, setEditDescription] = useState('');
  const [triggersList] = useState([
    { source: 'API Gateway', arn: 'arn:aws:execute-api:us-east-1:123456789012:abc123/prod', status: 'Enabled' },
  ]);

  useEffect(() => {
    if (func) {
      setCode(func.code);
      setEditMemory(func.memorySize || 128);
      setEditTimeout(func.timeout || 3);
      setEditDescription(func.description || '');
      const env = func.environment ? Object.entries(func.environment).map(([k, v]) => ({ key: k, value: v })) : [];
      setEnvVars(env);
    }
  }, [func?.name]);

  if (!func) {
    return <div className="p-8 text-center text-aws-text-secondary">Function not found.</div>;
  }

  const arn = `arn:aws:lambda:${state.user.region}:123456789012:function:${func.name}`;
  const fileName = func.runtime?.startsWith('python') ? 'lambda_function.py' : 'index.js';

  const handleDeploy = () => {
    dispatch({ type: 'UPDATE_FUNCTION_CODE', payload: { name: func.name, code } });
    addFlash('success', 'Changes deployed successfully');
  };

  const handleTest = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      const reqId = `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`;
      const duration = (Math.random() * 50 + 5).toFixed(2);
      const billed = Math.ceil(parseFloat(duration));
      const maxMem = Math.floor(Math.random() * 40 + 40);
      setOutput({
        success: true,
        response: { statusCode: 200, body: JSON.stringify({ message: 'Execution successful' }) },
        logs: [
          `START RequestId: ${reqId} Version: $LATEST`,
          `${new Date().toISOString()} INFO Processing event...`,
          `END RequestId: ${reqId}`,
          `REPORT RequestId: ${reqId} Duration: ${duration} ms Billed Duration: ${billed} ms Memory Size: ${func.memorySize} MB Max Memory Used: ${maxMem} MB`
        ],
        duration,
        billed,
        memoryConfigured: func.memorySize,
        maxMemory: maxMem
      });
      setRunning(false);
    }, 1500);
  };

  const tabs = ['Code', 'Test', 'Monitor', 'Configuration', 'Aliases', 'Versions'];

  return (
    <div className="space-y-4">
      {/* Function header */}
      <div>
        <h1 className="text-xl font-bold">{func.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-aws-text-secondary font-mono">{arn}</span>
          <button className="text-aws-text-disabled hover:text-aws-text"><Copy size={12} /></button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 border-b border-aws-border">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === t ? 'border-aws-orange text-aws-orange' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Code' && (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button className="aws-btn aws-btn-primary" onClick={handleDeploy}>Deploy</button>
            <button className="aws-btn aws-btn-secondary" onClick={() => { setTab('Test'); handleTest(); }}>Test</button>
          </div>
          {/* Code editor */}
          <div className="aws-card p-0 overflow-hidden">
            <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs font-mono border-b border-gray-700">
              {fileName}
            </div>
            <textarea
              className="w-full p-4 font-mono text-sm focus:outline-none resize-none"
              style={{ background: '#1E1E1E', color: '#D4D4D4', minHeight: 400 }}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
          {/* Runtime info */}
          <div className="text-xs text-aws-text-secondary flex gap-4">
            <span>Runtime: {func.runtime}</span>
            <span>Handler: {func.handler}</span>
            <span>Architecture: x86_64</span>
          </div>
        </div>
      )}

      {tab === 'Test' && (
        <div className="space-y-4">
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-3">Test event</h3>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-aws-text-secondary">Template:</label>
              <select className="aws-input w-auto" value={testTemplate} onChange={e => { setTestTemplate(e.target.value); setTestEvent(TEST_TEMPLATES[e.target.value]); }}>
                {Object.keys(TEST_TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea
              className="w-full p-3 font-mono text-sm border border-aws-border focus:outline-none focus:border-aws-blue"
              style={{ minHeight: 150, borderRadius: 2 }}
              value={testEvent}
              onChange={e => setTestEvent(e.target.value)}
              spellCheck="false"
            />
            <div className="mt-3">
              <button className="aws-btn aws-btn-primary" onClick={handleTest} disabled={running}>
                {running ? 'Executing...' : 'Test'}
              </button>
            </div>
          </div>

          {output && (
            <div className="aws-card space-y-4">
              <div className={`p-3 border-l-4 ${output.success ? 'border-l-aws-success bg-green-50' : 'border-l-aws-error bg-red-50'}`}>
                <span className="font-bold text-sm">{output.success ? 'Execution result: succeeded' : 'Execution result: failed'}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Response</h4>
                <pre className="p-3 bg-gray-50 border border-gray-200 text-sm font-mono overflow-auto" style={{ borderRadius: 2 }}>
                  {JSON.stringify(JSON.parse(output.response.body), null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Function Logs</h4>
                <div className="p-3 font-mono text-xs overflow-auto" style={{ background: '#1E1E1E', color: '#D4D4D4', borderRadius: 2 }}>
                  {output.logs.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
              <div className="text-sm text-aws-text-secondary">
                Duration: {output.duration} ms | Billed duration: {output.billed} ms | Memory: {output.memoryConfigured} MB | Max memory: {output.maxMemory} MB
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Configuration' && (
        <div className="flex gap-0">
          {/* Config sub-tabs sidebar */}
          <div className="w-48 border-r border-aws-border flex-shrink-0">
            {['General', 'Triggers', 'Permissions', 'Environment variables', 'Tags'].map(ct => (
              <button
                key={ct}
                onClick={() => setConfigTab(ct)}
                className={`w-full text-left px-4 py-2 text-sm border-l-3 ${configTab === ct ? 'border-l-aws-orange bg-orange-50/50 text-aws-orange font-medium' : 'border-l-transparent text-aws-text-secondary hover:bg-gray-50'}`}
                style={{ borderLeftWidth: 3 }}
              >
                {ct}
              </button>
            ))}
          </div>
          {/* Config content */}
          <div className="flex-1 p-4">
            {configTab === 'General' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm mb-3">General configuration</h3>
                  <div className="grid grid-cols-1 gap-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-bold mb-1">Description</label>
                      <input className="aws-input" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Function description" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Memory (MB)</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min="128" max="3008" step="64" value={editMemory} onChange={e => setEditMemory(Number(e.target.value))} className="flex-1" />
                        <span className="text-sm font-mono w-16 text-right">{editMemory} MB</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Timeout (seconds)</label>
                      <input type="number" className="aws-input w-32" min={1} max={900} value={editTimeout} onChange={e => setEditTimeout(Number(e.target.value))} />
                    </div>
                    <div className="pt-2">
                      <button className="aws-btn aws-btn-primary text-xs" onClick={() => {
                        dispatch({
                          type: 'UPDATE_FUNCTION_CONFIG',
                          payload: {
                            name: func.name,
                            description: editDescription,
                            memorySize: editMemory,
                            timeout: editTimeout
                          }
                        });
                        addFlash('success', 'General configuration saved');
                      }}>Save</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {configTab === 'Triggers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Triggers</h3>
                  <button className="aws-btn aws-btn-primary text-xs flex items-center gap-1" onClick={() => addFlash('info', 'Add trigger is simulated in mock mode')}>
                    <Plus size={14} /> Add trigger
                  </button>
                </div>
                <table className="aws-table">
                  <thead><tr><th>Source</th><th>ARN / Details</th><th>Status</th></tr></thead>
                  <tbody>
                    {triggersList.map((t, i) => (
                      <tr key={i}>
                        <td className="font-medium text-sm">{t.source}</td>
                        <td className="text-xs font-mono text-aws-text-secondary truncate max-w-xs">{t.arn}</td>
                        <td><span className="aws-badge bg-green-50 text-green-800 text-xs">{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {configTab === 'Permissions' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Execution role</h3>
                <div className="aws-card">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-aws-text-secondary">Role name:</span> <span className="ml-2 text-aws-blue font-medium">LambdaExecutionRole</span></div>
                    <div><span className="text-aws-text-secondary">Role ARN:</span> <span className="ml-2 font-mono text-xs">{func.role}</span></div>
                  </div>
                </div>
                <h3 className="font-bold text-sm mt-4">Resource-based policy statements</h3>
                <div className="text-sm text-aws-text-secondary">No resource-based policy statements configured.</div>
              </div>
            )}

            {configTab === 'Environment variables' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Environment variables</h3>
                <table className="aws-table">
                  <thead><tr><th>Key</th><th>Value</th><th className="w-12"></th></tr></thead>
                  <tbody>
                    {envVars.map((ev, i) => (
                      <tr key={i}>
                        <td className="font-mono text-sm">{ev.key}</td>
                        <td className="font-mono text-sm">{ev.value}</td>
                        <td>
                          <button className="text-aws-error hover:text-red-800" onClick={() => {
                            const newVars = envVars.filter((_, idx) => idx !== i);
                            setEnvVars(newVars);
                          }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {envVars.length === 0 && (
                      <tr><td colSpan="3" className="text-center text-aws-text-secondary text-sm py-4">No environment variables</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="flex items-center gap-2">
                  <input className="aws-input w-40" placeholder="Key" value={newEnvKey} onChange={e => setNewEnvKey(e.target.value)} />
                  <input className="aws-input w-48" placeholder="Value" value={newEnvVal} onChange={e => setNewEnvVal(e.target.value)} />
                  <button className="aws-btn aws-btn-secondary text-xs" disabled={!newEnvKey.trim()} onClick={() => {
                    if (!newEnvKey.trim()) return;
                    setEnvVars([...envVars, { key: newEnvKey.trim(), value: newEnvVal }]);
                    setNewEnvKey('');
                    setNewEnvVal('');
                  }}>Add</button>
                </div>
                <button className="aws-btn aws-btn-primary text-xs" onClick={() => {
                  const envObj = {};
                  envVars.forEach(ev => { envObj[ev.key] = ev.value; });
                  dispatch({ type: 'UPDATE_FUNCTION_ENVIRONMENT', payload: { name: func.name, environment: envObj } });
                  addFlash('success', 'Environment variables saved');
                }}>Save</button>
              </div>
            )}

            {configTab === 'Tags' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Tags</h3>
                <table className="aws-table">
                  <thead><tr><th>Key</th><th>Value</th></tr></thead>
                  <tbody>
                    {Object.entries(func.tags || {}).map(([k, v]) => (
                      <tr key={k}>
                        <td className="text-sm">{k}</td>
                        <td className="text-sm">{v}</td>
                      </tr>
                    ))}
                    {Object.keys(func.tags || {}).length === 0 && (
                      <tr><td colSpan="2" className="text-center text-aws-text-secondary text-sm py-4">No tags</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Monitor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="aws-card"><div className="text-xs text-aws-text-secondary">Invocations</div><div className="text-2xl font-bold mt-1">1,284</div></div>
            <div className="aws-card"><div className="text-xs text-aws-text-secondary">Errors</div><div className="text-2xl font-bold mt-1">3</div></div>
            <div className="aws-card"><div className="text-xs text-aws-text-secondary">Duration p95</div><div className="text-2xl font-bold mt-1">48 ms</div></div>
            <div className="aws-card"><div className="text-xs text-aws-text-secondary">Throttles</div><div className="text-2xl font-bold mt-1">0</div></div>
          </div>
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-3">Invocation trend</h3>
            <div className="h-32 flex items-end gap-2">
              {[34, 52, 45, 70, 62, 88, 76, 93, 81, 67].map((height, idx) => (
                <div key={idx} className="bg-aws-orange w-8" style={{ height }} title={`${height} invocations`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Aliases' && (
        <div className="aws-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Aliases</h3>
            <button className="aws-btn aws-btn-secondary text-xs" onClick={() => addFlash('info', 'Alias draft saved locally')}>Create alias</button>
          </div>
          <table className="aws-table">
            <thead><tr><th>Name</th><th>Version</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>prod</td><td>$LATEST</td><td>Production traffic alias</td></tr>
              <tr><td>dev</td><td>$LATEST</td><td>Development testing alias</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Versions' && (
        <div className="aws-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Versions</h3>
            <button className="aws-btn aws-btn-secondary text-xs" onClick={() => addFlash('success', 'Published a local sandbox version')}>Publish new version</button>
          </div>
          <table className="aws-table">
            <thead><tr><th>Version</th><th>Last modified</th><th>Runtime</th><th>Code size</th></tr></thead>
            <tbody>
              <tr><td>$LATEST</td><td>{new Date(func.lastModified).toLocaleString()}</td><td>{func.runtime}</td><td>{func.codeSize} bytes</td></tr>
              <tr><td>1</td><td>{new Date(func.lastModified).toLocaleDateString()}</td><td>{func.runtime}</td><td>{func.codeSize} bytes</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
