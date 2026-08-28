import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { Globe, Smartphone } from 'lucide-react';

export default function AdminDataStreams() {
  const { state, updateState } = useAppContext();
  const [selectedStream, setSelectedStream] = useState(null);

  const handleToggle = (streamId, field) => {
    updateState(prev => ({
      ...prev,
      property: {
        ...prev.property,
        dataStreams: prev.property.dataStreams.map(ds =>
          ds.id === streamId
            ? { ...ds, enhancedMeasurement: { ...ds.enhancedMeasurement, [field]: !ds.enhancedMeasurement[field] } }
            : ds
        )
      }
    }));
  };

  const stream = selectedStream ? state.property.dataStreams.find(ds => ds.id === selectedStream) : null;

  const typeIcon = (type) => {
    switch (type) {
      case 'WEB': return <Globe size={16} style={{ color: '#1a73e8' }} />;
      case 'IOS': return <Smartphone size={16} style={{ color: '#5f6368' }} />;
      case 'ANDROID': return <Smartphone size={16} style={{ color: '#34a853' }} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Data streams</h1>

      {!selectedStream ? (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Stream URL / App ID</th>
                <th>Measurement ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.property.dataStreams.map(ds => (
                <tr key={ds.id} onClick={() => setSelectedStream(ds.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--ga-blue)' }}>{ds.name}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {typeIcon(ds.type)} {ds.type}
                  </td>
                  <td>{ds.url || ds.appId || '-'}</td>
                  <td>{ds.measurementId}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: ds.status === 'active' ? 'var(--ga-positive)' : 'var(--ga-text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: ds.status === 'active' ? 'var(--ga-positive)' : '#dadce0' }} />
                      {ds.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <button className="btn btn-secondary" onClick={() => setSelectedStream(null)} style={{ marginBottom: 16 }}>
            ← Back to streams
          </button>

          <div className="card" style={{ maxWidth: 600, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--ga-font-heading)', marginBottom: 16 }}>
              {stream.name}
            </h2>
            <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--ga-text-secondary)' }}>
              <div>Type: {stream.type}</div>
              <div>URL: {stream.url}</div>
              <div>Measurement ID: {stream.measurementId}</div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Enhanced measurement</h3>
            {Object.entries(stream.enhancedMeasurement).map(([key, enabled]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ga-border-light)' }}>
                <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={enabled} onChange={() => handleToggle(stream.id, key)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
