import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

const RUNTIMES = ['nodejs18.x', 'nodejs20.x', 'python3.12', 'python3.11', 'java17', 'java21', 'go1.x', 'dotnet8'];

const CODE_TEMPLATES = {
  'nodejs18.x': 'exports.handler = async (event) => {\n  console.log("Event:", JSON.stringify(event));\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: "Hello from Lambda!" })\n  };\n};',
  'nodejs20.x': 'export const handler = async (event) => {\n  console.log("Event:", JSON.stringify(event));\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: "Hello from Lambda!" })\n  };\n};',
  'python3.12': 'import json\n\ndef lambda_handler(event, context):\n    print(f"Event: {json.dumps(event)}")\n    return {\n        "statusCode": 200,\n        "body": json.dumps({"message": "Hello from Lambda!"})\n    }',
  'python3.11': 'import json\n\ndef lambda_handler(event, context):\n    print(f"Event: {json.dumps(event)}")\n    return {\n        "statusCode": 200,\n        "body": json.dumps({"message": "Hello from Lambda!"})\n    }',
};

export default function LambdaFunctions() {
  const { state, dispatch, addFlash } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [funcName, setFuncName] = useState('');
  const [runtime, setRuntime] = useState('nodejs18.x');
  const [arch, setArch] = useState('x86_64');
  const [nameError, setNameError] = useState('');

  const functions = state.lambda.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!funcName.trim()) return;
    if (!/^[a-zA-Z0-9_-]+$/.test(funcName) || funcName.length > 64) {
      setNameError('Function name must be alphanumeric with hyphens/underscores, max 64 chars');
      return;
    }
    const newFunc = {
      name: funcName.trim(),
      description: '',
      runtime,
      handler: runtime.startsWith('python') ? 'lambda_function.lambda_handler' : 'index.handler',
      memorySize: 128,
      timeout: 3,
      lastModified: new Date().toISOString(),
      codeSize: 512,
      code: CODE_TEMPLATES[runtime] || CODE_TEMPLATES['nodejs18.x'],
      environment: {},
      layers: [],
      role: 'arn:aws:iam::123456789012:role/LambdaExecutionRole',
      tags: {}
    };
    dispatch({ type: 'CREATE_FUNCTION', payload: newFunc });
    addFlash('success', `Successfully created function "${funcName}"`);
    setShowCreate(false);
    setFuncName('');
    navigate(`/lambda/${funcName}`);
  };

  const runtimeBadge = (rt) => {
    if (rt.startsWith('nodejs')) return { label: 'Node.js', color: 'bg-green-100 text-green-800' };
    if (rt.startsWith('python')) return { label: 'Python', color: 'bg-blue-100 text-blue-800' };
    if (rt.startsWith('java')) return { label: 'Java', color: 'bg-red-100 text-red-800' };
    if (rt.startsWith('go')) return { label: 'Go', color: 'bg-cyan-100 text-cyan-800' };
    if (rt.startsWith('dotnet')) return { label: '.NET', color: 'bg-purple-100 text-purple-800' };
    return { label: rt, color: 'bg-gray-100 text-gray-800' };
  };

  if (showCreate) {
    return (
      <div className="max-w-3xl space-y-6">
        <h1 className="text-xl font-bold">Create function</h1>
        <div className="aws-card space-y-6">
          <div>
            <h3 className="font-bold text-sm mb-3">Choose one of the following options</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 border border-aws-blue bg-aws-blue-light text-sm">
                <input type="radio" checked readOnly /> Author from scratch
              </label>
              <label className="flex items-center gap-2 p-3 border border-aws-border text-sm text-aws-text-disabled">
                <input type="radio" disabled /> Use a blueprint
              </label>
              <label className="flex items-center gap-2 p-3 border border-aws-border text-sm text-aws-text-disabled">
                <input type="radio" disabled /> Container image
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Function name *</label>
            <input className="aws-input max-w-md" value={funcName} onChange={e => { setFuncName(e.target.value); setNameError(''); }} placeholder="my-function" />
            {nameError && <p className="text-xs text-aws-error mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Runtime</label>
            <select className="aws-input max-w-md" value={runtime} onChange={e => setRuntime(e.target.value)}>
              {RUNTIMES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Architecture</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={arch === 'x86_64'} onChange={() => setArch('x86_64')} /> x86_64</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={arch === 'arm64'} onChange={() => setArch('arm64')} /> arm64</label>
            </div>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-200 text-sm text-aws-text-secondary">
            Execution role: Create a new role with basic Lambda permissions
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!funcName.trim()}>Create function</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Functions ({state.lambda.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create function</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter by function name" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr><th className="w-8"><input type="checkbox" /></th><th>Function name</th><th>Description</th><th>Runtime</th><th>Code size</th><th>Last modified</th></tr></thead>
        <tbody>
          {functions.map(f => {
            const badge = runtimeBadge(f.runtime);
            return (
              <tr key={f.name}>
                <td><input type="checkbox" /></td>
                <td><Link to={`/lambda/${f.name}`} className="text-aws-blue font-medium hover:underline">{f.name}</Link></td>
                <td className="text-aws-text-secondary text-xs max-w-xs truncate">{f.description || '-'}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span></td>
                <td>{f.codeSize ? (f.codeSize / 1024).toFixed(1) + ' KB' : '-'}</td>
                <td>{format(new Date(f.lastModified), 'MMM d, yyyy')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{functions.length} of {functions.length} items
      </div>
    </div>
  );
}
