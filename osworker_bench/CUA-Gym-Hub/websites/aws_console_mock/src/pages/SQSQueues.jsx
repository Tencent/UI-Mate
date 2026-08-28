import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

export default function SQSQueues() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [detailTab, setDetailTab] = useState('Configuration');
  const [showSendMsg, setShowSendMsg] = useState(false);
  const [name, setName] = useState('');
  const [queueType, setQueueType] = useState('Standard');
  const [visTimeout, setVisTimeout] = useState(30);
  const [retention, setRetention] = useState(4);
  const [maxSize, setMaxSize] = useState(256);
  const [msgBody, setMsgBody] = useState('');

  const queues = (state.sqs?.queues || []).filter(q => !search || q.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!name.trim()) return;
    const newQueue = {
      name: name.trim() + (queueType === 'FIFO' && !name.trim().endsWith('.fifo') ? '.fifo' : ''),
      type: queueType,
      url: `https://sqs.${state.user?.region || 'us-east-1'}.amazonaws.com/123456789012/${name.trim()}`,
      messagesAvailable: 0,
      messagesInFlight: 0,
      visibilityTimeout: visTimeout,
      messageRetention: retention,
      maxMessageSize: maxSize,
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_QUEUE', payload: newQueue });
    addFlash('success', `Queue "${name}" created successfully`);
    setShowCreate(false);
    setName(''); setQueueType('Standard'); setVisTimeout(30); setRetention(4); setMaxSize(256);
  };

  const handlePurge = (queueName) => {
    dispatch({ type: 'PURGE_QUEUE', payload: queueName });
    addFlash('success', `Queue "${queueName}" purged`);
  };

  const handleSendMessage = () => {
    if (!msgBody.trim() || !selectedQueue) return;
    dispatch({ type: 'SEND_MESSAGE', payload: { queueName: selectedQueue.name, body: msgBody.trim() } });
    addFlash('success', 'Message sent successfully');
    setShowSendMsg(false);
    setMsgBody('');
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create queue</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input className="aws-input max-w-md" value={name} onChange={e => setName(e.target.value)} placeholder="my-queue" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={queueType === 'Standard'} onChange={() => setQueueType('Standard')} /> Standard</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" checked={queueType === 'FIFO'} onChange={() => setQueueType('FIFO')} /> FIFO</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Visibility timeout (seconds)</label>
            <input type="number" className="aws-input w-32" value={visTimeout} onChange={e => setVisTimeout(Number(e.target.value))} min={0} max={43200} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Message retention period (days)</label>
            <input type="number" className="aws-input w-32" value={retention} onChange={e => setRetention(Number(e.target.value))} min={1} max={14} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Maximum message size (KB)</label>
            <input type="number" className="aws-input w-32" value={maxSize} onChange={e => setMaxSize(Number(e.target.value))} min={1} max={256} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!name.trim()}>Create queue</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedQueue) {
    const liveQueue = (state.sqs?.queues || []).find(q => q.name === selectedQueue.name) || selectedQueue;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedQueue(null)}>Queues</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{liveQueue.name}</h1>
        </div>
        <div className="flex gap-2">
          <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowSendMsg(true)}>Send message</button>
          <button className="aws-btn aws-btn-secondary text-xs" onClick={() => handlePurge(selectedQueue.name)}>Purge</button>
          <button className="aws-btn aws-btn-danger text-xs" onClick={() => { dispatch({ type: 'DELETE_QUEUE', payload: selectedQueue.name }); addFlash('success', 'Queue deleted'); setSelectedQueue(null); }}>Delete</button>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['Configuration', 'Monitoring'].map(t => (
            <button key={t} onClick={() => setDetailTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${detailTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        {detailTab === 'Configuration' && (
          <div className="aws-card grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold block">URL</span><span className="font-mono text-xs break-all">{liveQueue.url}</span></div>
            <div><span className="font-bold block">Type</span><span className={`aws-badge ${liveQueue.type === 'FIFO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{liveQueue.type}</span></div>
            <div><span className="font-bold block">Messages available</span>{liveQueue.messagesAvailable}</div>
            <div><span className="font-bold block">Messages in flight</span>{liveQueue.messagesInFlight}</div>
            <div><span className="font-bold block">Visibility timeout</span>{liveQueue.visibilityTimeout}s</div>
            <div><span className="font-bold block">Message retention</span>{liveQueue.messageRetention >= 86400 ? `${Math.round(liveQueue.messageRetention / 86400)} days` : `${liveQueue.messageRetention} seconds`}</div>
            <div><span className="font-bold block">Max message size</span>{liveQueue.maxMessageSize} KB</div>
            <div><span className="font-bold block">Created</span>{format(new Date(liveQueue.created), 'MMM d, yyyy h:mm a')}</div>
          </div>
        )}
        {detailTab === 'Monitoring' && (
          <div className="aws-card space-y-4">
            <h3 className="font-bold text-sm">CloudWatch metrics for {liveQueue.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {['NumberOfMessagesSent', 'NumberOfMessagesReceived', 'NumberOfMessagesDeleted', 'ApproximateNumberOfMessagesVisible', 'ApproximateAgeOfOldestMessage', 'SentMessageSize'].map(metric => (
                <div key={metric} className="border border-aws-border p-3" style={{ borderRadius: 8 }}>
                  <div className="text-xs font-medium text-aws-text-secondary mb-2">{metric}</div>
                  <div className="h-20 bg-gray-50 flex items-center justify-center" style={{ borderRadius: 4 }}>
                    <svg width="100%" height="50" viewBox="0 0 200 50">
                      <polyline fill="none" stroke="#0972D3" strokeWidth="1.5"
                        points={Array.from({ length: 20 }, (_, i) => `${i * 10},${25 + Math.sin(i * 0.7 + metric.length) * 10}`).join(' ')} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSendMsg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h3 className="font-bold">Send message</h3>
                <button onClick={() => setShowSendMsg(false)}><X size={18} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Message body *</label>
                  <textarea className="aws-input h-32" value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Enter message body" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="aws-btn aws-btn-secondary" onClick={() => setShowSendMsg(false)}>Cancel</button>
                  <button className="aws-btn aws-btn-primary" onClick={handleSendMessage} disabled={!msgBody.trim()}>Send message</button>
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
        <h2 className="font-bold text-lg">Queues ({queues.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create queue</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter queues" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr><th>Name</th><th>Type</th><th>Messages available</th><th>Messages in flight</th><th>Created</th></tr></thead>
        <tbody>
          {queues.map(q => (
            <tr key={q.name}>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedQueue(q)}>{q.name}</button></td>
              <td><span className={`aws-badge ${q.type === 'FIFO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{q.type}</span></td>
              <td>{q.messagesAvailable}</td>
              <td>{q.messagesInFlight}</td>
              <td>{format(new Date(q.created), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
