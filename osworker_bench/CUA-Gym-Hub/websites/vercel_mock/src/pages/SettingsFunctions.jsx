import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const REGIONS = [
  { code: 'iad1', name: 'Washington, D.C., USA', flag: 'US' },
  { code: 'sfo1', name: 'San Francisco, USA', flag: 'US' },
  { code: 'cdg1', name: 'Paris, France', flag: 'FR' },
  { code: 'hnd1', name: 'Tokyo, Japan', flag: 'JP' },
  { code: 'sin1', name: 'Singapore', flag: 'SG' },
  { code: 'gru1', name: 'Sao Paulo, Brazil', flag: 'BR' },
  { code: 'bom1', name: 'Mumbai, India', flag: 'IN' },
  { code: 'lhr1', name: 'London, UK', flag: 'GB' },
  { code: 'syd1', name: 'Sydney, Australia', flag: 'AU' },
  { code: 'fra1', name: 'Frankfurt, Germany', flag: 'DE' },
];

export default function SettingsFunctions() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const project = state.projects.find(p => p.id === projectId);
  const funcs = project?.functions || {};

  const [region, setRegion] = useState(funcs.region || 'iad1');
  const [memory, setMemory] = useState(funcs.memory || '1024');
  const [duration, setDuration] = useState(funcs.maxDuration || '10');
  const [crons, setCrons] = useState(funcs.cronsEnabled || false);
  const [saved, setSaved] = useState(null);

  const save = (field, value) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, functions: { ...funcs, [field]: value } } });
    setSaved(field);
    setTimeout(() => setSaved(null), 2000);
  };

  const SavedMsg = ({ field }) => (
    saved === field ? (
      <div style={{ marginBottom: 8, fontSize: 13, color: '#0a7362', fontWeight: 500 }}>Saved successfully.</div>
    ) : null
  );

  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-title">Serverless Function Region</div>
        <div className="settings-section-desc">
          Select the default region where your Serverless Functions will be executed. Choose a region closest to your data source.
        </div>
        <SavedMsg field="region" />
        <div className="settings-row">
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.code} - {r.name}</option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => save('region', region)}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Function Memory</div>
        <div className="settings-section-desc">
          The amount of memory available to each Serverless Function during execution.
        </div>
        <SavedMsg field="memory" />
        <div className="settings-row">
          <select value={memory} onChange={e => setMemory(e.target.value)}>
            <option value="128">128 MB</option>
            <option value="256">256 MB</option>
            <option value="512">512 MB</option>
            <option value="1024">1024 MB (Default)</option>
            <option value="2048">2048 MB</option>
            <option value="3008">3008 MB (Max)</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => save('memory', memory)}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Maximum Duration</div>
        <div className="settings-section-desc">
          The maximum number of seconds a Serverless Function can run before timing out. Default is 10 seconds for Hobby plans.
        </div>
        <SavedMsg field="maxDuration" />
        <div className="settings-row">
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1" max="300" style={{ fontFamily: 'var(--font-mono)' }} />
          <span style={{ color: 'var(--fg-muted)', fontSize: 14, whiteSpace: 'nowrap' }}>seconds</span>
          <button className="btn btn-primary btn-sm" onClick={() => save('maxDuration', duration)}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Cron Jobs</div>
        <div className="settings-section-desc">
          Cron Jobs allow you to schedule Serverless Functions to run at specific times or intervals.
        </div>
        <SavedMsg field="cronsEnabled" />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
          <div
            onClick={() => { const next = !crons; setCrons(next); save('cronsEnabled', next); }}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: crons ? '#171717' : 'var(--border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: crons ? 19 : 2,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          {crons ? 'Enabled' : 'Disabled'}
        </label>
      </div>
    </div>
  );
}
