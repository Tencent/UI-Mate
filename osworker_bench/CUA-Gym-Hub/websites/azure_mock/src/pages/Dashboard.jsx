import React from 'react';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Grid, Folder, Activity, DollarSign, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { state, getAllResources } = useAppContext();
  const allResources = getAllResources();
  const cm = state.costManagement;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Dashboard' }]} />
      <h1 className="page-title">My Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {/* All resources tile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Grid size={18} color="var(--xzure-blue)" />
            <div style={{ fontWeight: 600 }}>All resources</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600 }}>{allResources.length}</div>
          <div className="caption">total resources</div>
        </div>

        {/* Resource groups tile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Folder size={18} color="var(--xzure-blue)" />
            <div style={{ fontWeight: 600 }}>Resource groups</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600 }}>{state.resourceGroups.length}</div>
          {state.resourceGroups.map(rg => (
            <div key={rg.id} className="caption">{rg.name}</div>
          ))}
        </div>

        {/* Service health tile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={18} color="var(--xzure-success)" />
            <div style={{ fontWeight: 600 }}>Service health</div>
          </div>
          <div style={{ color: 'var(--xzure-success)', fontWeight: 600 }}>All services healthy</div>
        </div>

        {/* Cost this month tile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <DollarSign size={18} color="var(--xzure-blue)" />
            <div style={{ fontWeight: 600 }}>Cost this month</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600 }}>${cm.currentMonthCost.toFixed(2)}</div>
          <div className="caption">of ${cm.budgetAmount.toFixed(2)} budget</div>
        </div>

        {/* Recent activity tile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} color="var(--xzure-blue)" />
            <div style={{ fontWeight: 600 }}>Recent activity</div>
          </div>
          {state.activityLog.slice(0, 3).map(event => (
            <div key={event.id} style={{ fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--xzure-border)' }}>
              <div>{event.operationName}</div>
              <div className="caption">{event.resourceName} - <span className={event.status === 'Succeeded' ? '' : ''} style={{ color: event.status === 'Succeeded' ? 'var(--xzure-success)' : 'var(--xzure-error)' }}>{event.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
