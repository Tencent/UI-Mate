
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreateModal } from '../components/CreateModal';
import { Dashboard } from '../types';

interface DashboardsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Dashboards: React.FC<DashboardsProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Compute metrics from state
  const closedWonOpps = state.opportunities.filter(o => o.stage === 'Closed Won');
  const totalRevenue = closedWonOpps.reduce((sum, o) => sum + o.amount, 0);
  const openDeals = state.opportunities.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost').length;
  const totalDealsWithOutcome = state.opportunities.filter(o => o.stage === 'Closed Won' || o.stage === 'Closed Lost').length;
  const winRate = totalDealsWithOutcome > 0 ? Math.round((closedWonOpps.length / totalDealsWithOutcome) * 100) : 0;

  const dashboardFields = [
    { name: 'name', label: 'Dashboard Name', type: 'text' as const, required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const },
    { name: 'chartType', label: 'Chart Type', type: 'select' as const, options: ['bar', 'line', 'pie', 'table'], required: true },
  ];

  const handleCreateDashboard = (data: any) => {
    const newDashboard: Dashboard = {
      dashboardId: 'dashboard_' + Date.now(),
      name: data.name,
      description: data.description || '',
      chartType: data.chartType || 'bar',
      createdDate: new Date().toISOString(),
      createdBy: state.user.userId,
    };

    updateState({ dashboards: [...(state.dashboards || []), newDashboard] });
    onShowToast('Dashboard created successfully', 'success');
  };

  const handleDeleteDashboard = (dashboardId: string) => {
    updateState({ dashboards: state.dashboards.filter(d => d.dashboardId !== dashboardId) });
    onShowToast('Dashboard deleted', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Dashboards</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          New Dashboard
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Sales Performance Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Overview of key sales metrics and performance indicators
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Closed Won Revenue</h3>
            <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--success)' }}>
              ${totalRevenue >= 1000000
                ? (totalRevenue / 1000000).toFixed(1) + 'M'
                : totalRevenue >= 1000
                ? (totalRevenue / 1000).toFixed(0) + 'K'
                : totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {closedWonOpps.length} deal{closedWonOpps.length !== 1 ? 's' : ''} closed won
            </div>
          </div>

          <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Open Deals</h3>
            <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--primary)' }}>{openDeals}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>In pipeline</div>
          </div>

          <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Win Rate</h3>
            <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--warning)' }}>{winRate}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {totalDealsWithOutcome} closed deal{totalDealsWithOutcome !== 1 ? 's' : ''} evaluated
            </div>
          </div>
        </div>
      </div>

      {state.dashboards && state.dashboards.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>My Dashboards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {state.dashboards.map(dashboard => {
              const creator = state.users.find(u => u.userId === dashboard.createdBy);
              return (
                <div key={dashboard.dashboardId} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{dashboard.name}</h3>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDeleteDashboard(dashboard.dashboardId)}
                    >
                      Delete
                    </button>
                  </div>
                  {dashboard.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {dashboard.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Chart: {dashboard.chartType}</span>
                    {creator && <span>By: {creator.firstName} {creator.lastName}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Dashboard"
        fields={dashboardFields}
        onSubmit={handleCreateDashboard}
      />
    </div>
  );
};
