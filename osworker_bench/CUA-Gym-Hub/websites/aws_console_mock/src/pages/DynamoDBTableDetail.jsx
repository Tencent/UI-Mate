import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ArrowLeft, Search } from 'lucide-react';
import { format } from 'date-fns';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DynamoDBTableDetail() {
  const { tableName } = useParams();
  const { state, addFlash } = useStore();
  const [tab, setTab] = useState('Overview');
  const [queryMode, setQueryMode] = useState('scan');
  const [filterKey, setFilterKey] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [scanned, setScanned] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const table = state.dynamodb.tables.find(t => t.name === tableName);

  if (!table) {
    return (
      <div className="aws-card text-center py-12">
        <p className="text-aws-text-secondary mb-4">Table "{tableName}" not found.</p>
        <Link to="/dynamodb" className="text-aws-blue hover:underline">Back to Tables</Link>
      </div>
    );
  }

  const tabs = ['Overview', 'Items', 'Indexes', 'Capacity', 'Tags'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/dynamodb" className="p-1 hover:bg-gray-100 rounded"><ArrowLeft size={18} className="text-aws-text-secondary" /></Link>
        <h1 className="text-xl font-bold text-aws-text">{table.name}</h1>
        <span className={`aws-badge ${table.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{table.status}</span>
      </div>

      <div className="aws-card">
        <div className="flex gap-4 border-b border-aws-border mb-4">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`pb-2 px-1 text-sm font-medium border-b-2 ${tab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-3">General Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><span className="text-aws-text-secondary">Table name:</span> <span className="ml-2 font-medium">{table.name}</span></div>
                <div><span className="text-aws-text-secondary">Status:</span> <span className="ml-2">{table.status}</span></div>
                <div><span className="text-aws-text-secondary">Partition key:</span> <span className="ml-2 font-mono">{table.partitionKey}</span></div>
                <div><span className="text-aws-text-secondary">Sort key:</span> <span className="ml-2 font-mono">{table.sortKey || '-'}</span></div>
                <div><span className="text-aws-text-secondary">Item count:</span> <span className="ml-2">{table.itemCount?.toLocaleString()}</span></div>
                <div><span className="text-aws-text-secondary">Table size:</span> <span className="ml-2">{formatBytes(table.sizeBytes)}</span></div>
                <div><span className="text-aws-text-secondary">Created:</span> <span className="ml-2">{table.created ? format(new Date(table.created), 'MMM d, yyyy h:mm a') : '-'}</span></div>
                <div><span className="text-aws-text-secondary">Encryption:</span> <span className="ml-2">{table.encryption}</span></div>
                <div><span className="text-aws-text-secondary">Stream enabled:</span> <span className="ml-2">{table.streamEnabled ? 'Yes' : 'No'}</span></div>
                <div><span className="text-aws-text-secondary">Billing mode:</span> <span className="ml-2">{table.billingMode === 'PAY_PER_REQUEST' ? 'On-demand' : 'Provisioned'}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Items' && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={queryMode === 'scan'} onChange={() => setQueryMode('scan')} />
                  Scan
                </label>
                <label className="flex items-center gap-2 text-sm ml-4">
                  <input type="radio" checked={queryMode === 'query'} onChange={() => setQueryMode('query')} />
                  Query
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input className="aws-input pl-8 text-sm" placeholder={`Filter by ${table.partitionKey}`} value={filterKey} onChange={e => setFilterKey(e.target.value)} />
              </div>
              {queryMode === 'query' && (
                <input className="aws-input text-sm max-w-xs" placeholder="Value" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
              )}
              <button
                className="aws-btn aws-btn-primary text-xs"
                onClick={() => {
                  const mockItems = Array.from({ length: Math.min(10, table.itemCount || 0) }, (_, i) => ({
                    [table.partitionKey]: `${table.partitionKey}-value-${i + 1}`,
                    ...(table.sortKey ? { [table.sortKey]: `${table.sortKey}-value-${i + 1}` } : {}),
                    attributes: `{...}`,
                  })).filter(item => !filterKey || item[table.partitionKey].includes(filterKey));
                  setScanResults(mockItems);
                  setScanned(true);
                  if (mockItems.length === 0) addFlash('info', 'No items matched the filter');
                  else addFlash('success', `Returned ${mockItems.length} item(s) (simulated)`);
                }}
              >
                {queryMode === 'scan' ? 'Run scan' : 'Run query'}
              </button>
              {scanned && (
                <button className="aws-btn aws-btn-secondary text-xs" onClick={() => { setScanResults([]); setScanned(false); setFilterKey(''); setFilterValue(''); }}>
                  Clear
                </button>
              )}
            </div>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>{table.partitionKey}</th>
                  {table.sortKey && <th>{table.sortKey}</th>}
                  <th>Attributes</th>
                </tr>
              </thead>
              <tbody>
                {!scanned ? (
                  <tr><td colSpan={table.sortKey ? 3 : 2} className="text-center py-8 text-aws-text-secondary">
                    Click &quot;Run scan&quot; or &quot;Run query&quot; to view items. ({table.itemCount?.toLocaleString()} items in table)
                  </td></tr>
                ) : scanResults.length === 0 ? (
                  <tr><td colSpan={table.sortKey ? 3 : 2} className="text-center py-8 text-aws-text-secondary">No items found matching the filter.</td></tr>
                ) : scanResults.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-sm">{item[table.partitionKey]}</td>
                    {table.sortKey && <td className="font-mono text-sm">{item[table.sortKey]}</td>}
                    <td className="font-mono text-xs text-aws-text-secondary">{item.attributes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Indexes' && (
          <div>
            <h3 className="font-bold text-sm mb-3">Global Secondary Indexes</h3>
            <table className="aws-table">
              <thead><tr><th>Index name</th><th>Partition key</th><th>Sort key</th><th>Status</th><th>Item count</th></tr></thead>
              <tbody>
                {(table.gsi || []).map(idx => (
                  <tr key={idx.name}>
                    <td className="font-medium">{idx.name}</td>
                    <td className="font-mono text-sm">{idx.partitionKey}</td>
                    <td className="font-mono text-sm">{idx.sortKey || '-'}</td>
                    <td><span className="aws-badge bg-green-50 text-green-700">{idx.status}</span></td>
                    <td>{idx.itemCount?.toLocaleString()}</td>
                  </tr>
                ))}
                {(!table.gsi || table.gsi.length === 0) && <tr><td colSpan="5" className="text-center py-8 text-aws-text-secondary">No global secondary indexes.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Capacity' && (
          <div>
            <h3 className="font-bold text-sm mb-3">Read/Write Capacity</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-aws-border rounded p-4">
                <div className="text-sm text-aws-text-secondary mb-1">Read capacity</div>
                <div className="text-2xl font-bold">{table.billingMode === 'PAY_PER_REQUEST' ? 'On-demand' : `${table.readCapacity} RCU`}</div>
              </div>
              <div className="border border-aws-border rounded p-4">
                <div className="text-sm text-aws-text-secondary mb-1">Write capacity</div>
                <div className="text-2xl font-bold">{table.billingMode === 'PAY_PER_REQUEST' ? 'On-demand' : `${table.writeCapacity} WCU`}</div>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-aws-text-secondary">Billing mode:</span>
              <span className="ml-2 font-medium">{table.billingMode === 'PAY_PER_REQUEST' ? 'On-demand' : 'Provisioned'}</span>
            </div>
          </div>
        )}

        {tab === 'Tags' && (
          <div>
            <table className="aws-table">
              <thead><tr><th>Key</th><th>Value</th></tr></thead>
              <tbody>
                {(table.tags || []).map((t, i) => (
                  <tr key={i}><td>{t.Key}</td><td>{t.Value}</td></tr>
                ))}
                {(!table.tags || table.tags.length === 0) && <tr><td colSpan="2" className="text-center py-8 text-aws-text-secondary">No tags.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
