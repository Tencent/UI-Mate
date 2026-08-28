import React from 'react';
import { useApp } from '../context/AppContext';

interface ReportsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Reports: React.FC<ReportsProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();

  const totalLeads = state.leads.length;
  const totalAccounts = state.accounts.length;
  const totalOpportunities = state.opportunities.length;
  const totalCases = state.cases.length;

  // Compute "this week" leads
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekLeads = state.leads.filter(l => new Date(l.createdDate) >= startOfWeek).length;
  const thisWeekAccounts = state.accounts.filter(a => new Date(a.createdDate) >= startOfWeek).length;
  const openCases = state.cases.filter(c => c.status !== 'Closed').length;

  const leadsByStatus = state.leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const opportunitiesByStage = state.opportunities.reduce((acc: Record<string, number>, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {});

  const totalOppValue = state.opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const reportMetrics = {
    totalLeads,
    totalAccounts,
    totalOpportunities,
    totalCases,
    openCases,
    totalOpportunityValue: totalOppValue,
  };

  const refreshReports = () => {
    const snapshot = {
      snapshotId: `snapshot-${Date.now()}`,
      name: `Pipeline Summary ${new Date().toLocaleString()}`,
      createdDate: new Date().toISOString(),
      metrics: reportMetrics,
    };
    updateState({ reportSnapshots: [snapshot, ...(state.reportSnapshots || [])] });
    onShowToast('Report snapshot refreshed', 'success');
  };

  const exportSummaryCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Leads', totalLeads],
      ['Total Accounts', totalAccounts],
      ['Total Opportunities', totalOpportunities],
      ['Total Cases', totalCases],
      ['Open Cases', openCases],
      ['Total Opportunity Value', totalOppValue],
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xalesforce-report-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onShowToast('Report CSV exported', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Reports</h1>
        <button
          className="btn btn-primary"
          onClick={refreshReports}
        >
          Refresh Reports
        </button>
        <button
          className="btn btn-secondary"
          onClick={exportSummaryCsv}
        >
          Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Leads</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalLeads}</div>
          <div style={{ fontSize: '14px', color: 'var(--success)' }}>
            {thisWeekLeads > 0 ? `+${thisWeekLeads} this week` : 'None this week'}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Accounts</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalAccounts}</div>
          <div style={{ fontSize: '14px', color: 'var(--success)' }}>
            {thisWeekAccounts > 0 ? `+${thisWeekAccounts} this week` : 'None this week'}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Opportunities</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalOpportunities}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>${(totalOppValue / 1000000).toFixed(1)}M total</div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Cases</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalCases}</div>
          <div style={{ fontSize: '14px', color: openCases > 0 ? 'var(--error)' : 'var(--success)' }}>
            {openCases} open
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Leads by Status</h2>
          {Object.entries(leadsByStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{status}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Opportunities by Stage</h2>
          {Object.entries(opportunitiesByStage).map(([stage, count]) => (
            <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{stage}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Top Accounts</h2>
        {state.accounts.slice(0, 5).map((account, index) => (
          <div key={account.accountId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < 4 ? '1px solid var(--border)' : 'none' }}>
            <span>{account.name}</span>
            <span>${(account.revenue / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Report Snapshots</h2>
        {(state.reportSnapshots || []).length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No report snapshots yet</div>
        ) : (
          (state.reportSnapshots || []).slice(0, 5).map(snapshot => (
            <div key={snapshot.snapshotId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{snapshot.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(snapshot.createdDate).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
