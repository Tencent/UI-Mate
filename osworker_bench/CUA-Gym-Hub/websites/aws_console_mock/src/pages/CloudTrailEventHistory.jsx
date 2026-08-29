import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Search, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import AccessDenied from '../components/AccessDenied';

const REGION_OPTIONS = [
  { label: 'All regions', value: 'all' },
  { label: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
  { label: 'US East (Ohio) - us-east-2', value: 'us-east-2' },
  { label: 'US West (Oregon) - us-west-2', value: 'us-west-2' },
  { label: 'Europe (Ireland) - eu-west-1', value: 'eu-west-1' },
  { label: 'Europe (Frankfurt) - eu-central-1', value: 'eu-central-1' },
  { label: 'Asia Pacific (Singapore) - ap-southeast-1', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Tokyo) - ap-northeast-1', value: 'ap-northeast-1' },
];

export default function CloudTrailEventHistory() {
  const { state, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortCol, setSortCol] = useState('eventTime');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedEvent, setExpandedEvent] = useState(null);

  const userRole = state.user?.role || 'admin';
  if (userRole === 'lab-member') {
    return <AccessDenied service="CloudTrail" action="cloudtrail:LookupEvents" />;
  }

  const events = (state.cloudtrail?.events || [])
    .filter(e => regionFilter === 'all' || e.region === regionFilter)
    .filter(e => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (e.eventName || '').toLowerCase().includes(s) ||
        (e.userName || '').toLowerCase().includes(s) ||
        (e.sourceIp || '').toLowerCase().includes(s) ||
        (e.eventSource || '').toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortCol] || '';
      const bVal = b[sortCol] || '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ col, children }) => (
    <th className="cursor-pointer select-none" onClick={() => handleSort(col)}>
      <div className="flex items-center gap-1">
        {children}
        {sortCol === col && <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>}
      </div>
    </th>
  );

  const formatTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Event history</h1>
        <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" onClick={() => addFlash('success', 'Refreshed')}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="aws-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-aws-text-secondary">Lookup attributes:</span>
            <select className="aws-input w-auto text-sm" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              {REGION_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Search size={14} className="text-aws-text-secondary" />
            <input
              className="aws-input flex-1"
              placeholder="Filter by event name, user name, source IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="aws-card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          Showing <strong>{events.length}</strong> event{events.length !== 1 ? 's' : ''}.
          CloudTrail records API activity for your account. Use the filters above to narrow results.
        </p>
      </div>

      {/* Events table */}
      <div className="aws-card">
        <table className="aws-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <SortHeader col="eventName">Event name</SortHeader>
              <SortHeader col="eventTime">Event time</SortHeader>
              <SortHeader col="userName">User name</SortHeader>
              <SortHeader col="eventSource">Event source</SortHeader>
              <SortHeader col="sourceIp">Source IP address</SortHeader>
              <SortHeader col="region">AWS region</SortHeader>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-aws-text-secondary py-8">No events found matching your criteria.</td></tr>
            ) : (
              events.map(event => (
                <React.Fragment key={event.eventId}>
                  <tr
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedEvent(expandedEvent === event.eventId ? null : event.eventId)}
                  >
                    <td>
                      {expandedEvent === event.eventId
                        ? <ChevronDown size={14} className="text-aws-text-secondary" />
                        : <ChevronRight size={14} className="text-aws-text-secondary" />
                      }
                    </td>
                    <td className="font-medium text-aws-blue">{event.eventName}</td>
                    <td className="text-xs">{formatTime(event.eventTime)}</td>
                    <td className="font-mono text-xs">{event.userName || '-'}</td>
                    <td className="text-xs text-aws-text-secondary">{event.eventSource || '-'}</td>
                    <td className="font-mono text-xs">{event.sourceIp || '-'}</td>
                    <td className="text-xs">{event.region || '-'}</td>
                  </tr>
                  {expandedEvent === event.eventId && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 p-0">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-aws-text-secondary">Event ID:</span>
                              <span className="ml-2 font-mono text-xs">{event.eventId}</span>
                            </div>
                            <div>
                              <span className="text-aws-text-secondary">Event source:</span>
                              <span className="ml-2">{event.eventSource}</span>
                            </div>
                            <div>
                              <span className="text-aws-text-secondary">User name:</span>
                              <span className="ml-2 font-mono">{event.userName}</span>
                            </div>
                            <div>
                              <span className="text-aws-text-secondary">Source IP:</span>
                              <span className="ml-2 font-mono">{event.sourceIp}</span>
                            </div>
                            <div>
                              <span className="text-aws-text-secondary">AWS region:</span>
                              <span className="ml-2">{event.region}</span>
                            </div>
                            <div>
                              <span className="text-aws-text-secondary">Event time:</span>
                              <span className="ml-2">{formatTime(event.eventTime)}</span>
                            </div>
                          </div>

                          {event.resources && event.resources.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold mb-1">Resources referenced</h4>
                              <table className="aws-table text-xs">
                                <thead><tr><th>Resource type</th><th>Resource name</th></tr></thead>
                                <tbody>
                                  {event.resources.map((r, i) => (
                                    <tr key={i}>
                                      <td className="text-aws-text-secondary">{r.type}</td>
                                      <td className="font-mono">{r.name}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {event.requestParameters && (
                            <div>
                              <h4 className="text-sm font-bold mb-1">Request parameters</h4>
                              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-48">
                                {(() => {
                                  try {
                                    return JSON.stringify(JSON.parse(event.requestParameters), null, 2);
                                  } catch {
                                    return event.requestParameters;
                                  }
                                })()}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
