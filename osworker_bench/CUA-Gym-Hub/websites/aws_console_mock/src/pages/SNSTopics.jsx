import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

export default function SNSTopics() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subTab, setSubTab] = useState('Subscriptions');
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [topicType, setTopicType] = useState('Standard');
  const [protocol, setProtocol] = useState('Email');
  const [endpoint, setEndpoint] = useState('');

  const topics = (state.sns?.topics || []).filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!name.trim()) return;
    const newTopic = {
      name: name.trim(),
      arn: `arn:aws:sns:${state.user?.region || 'us-east-1'}:123456789012:${name.trim()}`,
      displayName: displayName.trim(),
      type: topicType,
      subscriptionsCount: 0,
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_TOPIC', payload: newTopic });
    addFlash('success', `Topic "${name}" created successfully`);
    setShowCreate(false);
    setName(''); setDisplayName(''); setTopicType('Standard');
  };

  const handleDelete = (arn) => {
    dispatch({ type: 'DELETE_TOPIC', payload: arn });
    addFlash('success', 'Topic deleted');
    setSelectedTopic(null);
  };

  const handleCreateSub = () => {
    if (!endpoint.trim()) return;
    const sub = {
      id: `arn:aws:sns:us-east-1:123456789012:${selectedTopic.name}:${Math.random().toString(36).substr(2, 8)}`,
      topicArn: selectedTopic.arn,
      protocol,
      endpoint: endpoint.trim(),
      status: 'Confirmed',
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_SUBSCRIPTION', payload: sub });
    addFlash('success', `Subscription created for ${protocol}:${endpoint}`);
    setShowCreateSub(false);
    setEndpoint('');
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create topic</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input className="aws-input max-w-md" value={name} onChange={e => setName(e.target.value)} placeholder="my-topic" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Display name</label>
            <input className="aws-input max-w-md" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="My Topic" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={topicType === 'Standard'} onChange={() => setTopicType('Standard')} /> Standard</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={topicType === 'FIFO'} onChange={() => setTopicType('FIFO')} /> FIFO</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!name.trim()}>Create topic</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    const subs = (state.sns?.subscriptions || []).filter(s => s.topicArn === selectedTopic.arn);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedTopic(null)}>Topics</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{selectedTopic.name}</h1>
        </div>
        <div className="aws-card text-sm space-y-2">
          <div><span className="font-bold">ARN:</span> <span className="font-mono text-xs">{selectedTopic.arn}</span></div>
          <div><span className="font-bold">Display name:</span> {selectedTopic.displayName || '-'}</div>
          <div><span className="font-bold">Type:</span> <span className={`aws-badge ${selectedTopic.type === 'FIFO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{selectedTopic.type}</span></div>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['Subscriptions', 'Access policy'].map(t => (
            <button key={t} onClick={() => setSubTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${subTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        {subTab === 'Access policy' && (
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-3">Access policy</h3>
            <p className="text-sm text-aws-text-secondary mb-3">
              The access policy defines who can access this topic and what actions they can perform.
            </p>
            <pre className="p-3 text-sm font-mono overflow-auto" style={{ background: '#1E1E1E', color: '#D4D4D4', borderRadius: 8, maxHeight: 250 }}>
{JSON.stringify({
  Version: "2012-10-17",
  Statement: [{
    Sid: "AllowPublish",
    Effect: "Allow",
    Principal: { AWS: "*" },
    Action: ["SNS:GetTopicAttributes", "SNS:SetTopicAttributes", "SNS:AddPermission", "SNS:RemovePermission", "SNS:DeleteTopic", "SNS:Subscribe", "SNS:ListSubscriptionsByTopic", "SNS:Publish"],
    Resource: selectedTopic.arn,
    Condition: { StringEquals: { "AWS:SourceOwner": "123456789012" } }
  }]
}, null, 2)}
            </pre>
          </div>
        )}
        {subTab === 'Subscriptions' && (
          <div className="aws-card p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
              <h3 className="font-bold">Subscriptions ({subs.length})</h3>
              <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowCreateSub(true)}>Create subscription</button>
            </div>
            <table className="aws-table">
              <thead><tr><th>Subscription ID</th><th>Protocol</th><th>Endpoint</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {subs.length === 0 ? <tr><td colSpan={5} className="text-center text-aws-text-secondary">No subscriptions</td></tr> : subs.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs">{s.id.split(':').pop()}</td>
                    <td>{s.protocol}</td>
                    <td className="text-xs">{s.endpoint}</td>
                    <td><span className="aws-badge bg-green-100 text-green-800">{s.status}</span></td>
                    <td><button className="text-aws-error text-xs hover:underline" onClick={() => { dispatch({ type: 'DELETE_SUBSCRIPTION', payload: s.id }); addFlash('success', 'Subscription deleted'); }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-2">
          <button className="aws-btn aws-btn-danger text-xs" onClick={() => handleDelete(selectedTopic.arn)}>Delete topic</button>
        </div>
        {showCreateSub && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h3 className="font-bold">Create subscription</h3>
                <button onClick={() => setShowCreateSub(false)}><X size={18} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Protocol</label>
                  <select className="aws-input" value={protocol} onChange={e => setProtocol(e.target.value)}>
                    {['Email', 'SMS', 'Lambda', 'SQS', 'HTTP'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Endpoint</label>
                  <input className="aws-input" value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder={protocol === 'Email' ? 'user@example.com' : 'endpoint'} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreateSub(false)}>Cancel</button>
                  <button className="aws-btn aws-btn-primary" onClick={handleCreateSub} disabled={!endpoint.trim()}>Create subscription</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Topics ({topics.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create topic</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter topics" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr><th>Name</th><th>ARN</th><th>Display name</th><th>Subscriptions</th><th>Type</th><th>Created</th></tr></thead>
        <tbody>
          {topics.map(t => (
            <tr key={t.arn}>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedTopic(t)}>{t.name}</button></td>
              <td className="font-mono text-xs">{t.arn}</td>
              <td>{t.displayName || '-'}</td>
              <td>{t.subscriptionsCount || 0}</td>
              <td><span className={`aws-badge ${t.type === 'FIFO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{t.type}</span></td>
              <td>{format(new Date(t.created), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
