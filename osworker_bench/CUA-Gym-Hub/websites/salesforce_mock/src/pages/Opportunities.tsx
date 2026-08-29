
import React, { useState, useEffect, DragEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, List, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from '../components/CreateModal';
import { Opportunity } from '../types';
import { BulkActionBar } from '../components/BulkActionBar';

const STAGES: Opportunity['stage'][] = ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const STAGE_PROBABILITIES: Record<string, number> = {
  'Prospecting': 10,
  'Qualification': 20,
  'Needs Analysis': 30,
  'Value Proposition': 50,
  'Proposal': 60,
  'Negotiation': 80,
  'Closed Won': 100,
  'Closed Lost': 0,
};

const STAGE_TOP_COLORS: Record<string, string> = {
  'Prospecting': '#0176D3',
  'Qualification': '#1B96FF',
  'Needs Analysis': '#0B5CAB',
  'Value Proposition': '#032D60',
  'Proposal': '#0176D3',
  'Negotiation': '#1B96FF',
  'Closed Won': '#04844B',
  'Closed Lost': '#C23934',
};

interface OpportunitiesProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const totalPages = Math.ceil(state.opportunities.length / itemsPerPage);
  const paginatedOpportunities = state.opportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const opportunityFields = [
    { name: 'name', label: 'Opportunity Name', type: 'text' as const, required: true },
    { name: 'accountId', label: 'Account', type: 'select' as const, options: state.accounts.map(a => a.name), required: true },
    { name: 'amount', label: 'Amount', type: 'number' as const, required: true },
    { name: 'closeDate', label: 'Close Date', type: 'text' as const, required: true },
    { name: 'stage', label: 'Stage', type: 'select' as const, options: [...STAGES], required: true },
    { name: 'probability', label: 'Probability (%)', type: 'number' as const },
    { name: 'type', label: 'Type', type: 'select' as const, options: ['New Business', 'Renewal', 'Upgrade', 'Expansion'] },
    { name: 'leadSource', label: 'Lead Source', type: 'select' as const, options: ['Website', 'Referral', 'Trade Show', 'Cold Call', 'LinkedIn', 'Existing Customer'] },
    { name: 'nextStep', label: 'Next Step', type: 'text' as const },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const handleCreateOpportunity = (data: any) => {
    const account = state.accounts.find(a => a.name === data.accountId);
    const newOpportunity: Opportunity = {
      opportunityId: 'opp_' + Date.now(),
      name: data.name,
      accountId: account ? account.accountId : state.accounts[0]?.accountId || '',
      amount: data.amount,
      closeDate: data.closeDate,
      stage: data.stage || 'Prospecting',
      probability: data.probability || STAGE_PROBABILITIES[data.stage || 'Prospecting'],
      type: data.type || 'New Business',
      leadSource: data.leadSource || '',
      nextStep: data.nextStep || '',
      description: data.description || '',
      ownerId: state.user.userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    updateState({
      opportunities: [...state.opportunities, newOpportunity]
    });

    onShowToast('Opportunity created successfully', 'success');
  };

  // --- Kanban drag-and-drop ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, oppId: string) => {
    setDraggedOppId(oppId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', oppId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStage: Opportunity['stage']) => {
    e.preventDefault();
    const oppId = draggedOppId || e.dataTransfer.getData('text/plain');
    if (!oppId) return;

    const opp = state.opportunities.find(o => o.opportunityId === oppId);
    if (!opp || opp.stage === targetStage) {
      setDraggedOppId(null);
      return;
    }

    const updatedOpportunities = state.opportunities.map(o =>
      o.opportunityId === oppId
        ? { ...o, stage: targetStage, probability: STAGE_PROBABILITIES[targetStage], modifiedDate: new Date().toISOString() }
        : o
    );
    updateState({ opportunities: updatedOpportunities });
    onShowToast(`Opportunity moved to ${targetStage}`, 'success');
    setDraggedOppId(null);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Opportunities</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--primary)' : 'white',
                color: viewMode === 'table' ? 'white' : 'var(--text-primary)',
                borderBottom: viewMode === 'table' ? '2px solid var(--primary)' : '2px solid transparent',
                fontSize: '13px', fontWeight: 500
              }}
            >
              <List size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'kanban' ? 'var(--primary)' : 'white',
                color: viewMode === 'kanban' ? 'white' : 'var(--text-primary)',
                borderBottom: viewMode === 'kanban' ? '2px solid var(--primary)' : '2px solid transparent',
                fontSize: '13px', fontWeight: 500
              }}
            >
              <LayoutGrid size={16} />
              Kanban
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            New Opportunity
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="card">
          <BulkActionBar
            selectedCount={selectedIds.length}
            users={state.users}
            statusOptions={STAGES as unknown as string[]}
            entityName="Opportunity"
            onDeselectAll={() => setSelectedIds([])}
            onChangeOwner={(userId) => {
              const updated = state.opportunities.map(o =>
                selectedIds.includes(o.opportunityId) ? { ...o, ownerId: userId, modifiedDate: new Date().toISOString() } : o
              );
              updateState({ opportunities: updated });
              onShowToast(`${selectedIds.length} records updated`, 'success');
              setSelectedIds([]);
            }}
            onChangeStatus={(stage) => {
              const updated = state.opportunities.map(o =>
                selectedIds.includes(o.opportunityId) ? { ...o, stage: stage as Opportunity['stage'], probability: STAGE_PROBABILITIES[stage] ?? o.probability, modifiedDate: new Date().toISOString() } : o
              );
              updateState({ opportunities: updated });
              onShowToast(`${selectedIds.length} records updated`, 'success');
              setSelectedIds([]);
            }}
            onDelete={() => {
              const updated = state.opportunities.filter(o => !selectedIds.includes(o.opportunityId));
              updateState({ opportunities: updated });
              onShowToast(`${selectedIds.length} records deleted`, 'success');
              setSelectedIds([]);
            }}
            onExport={() => {
              const selected = state.opportunities.filter(o => selectedIds.includes(o.opportunityId));
              const csvContent = "data:text/csv;charset=utf-8,"
                + "Name,Amount,Stage,Close Date,Probability\n"
                + selected.map(o => `"${o.name}","${o.amount}","${o.stage}","${o.closeDate}","${o.probability}"`).join("\n");
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "opportunities_selected.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast(`${selectedIds.length} records exported`, 'success');
            }}
          />
          <table className="table">
            <thead>
              <tr>
                <th className="table-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedOpportunities.length && paginatedOpportunities.length > 0}
                    onChange={() => {
                      if (selectedIds.length === paginatedOpportunities.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(paginatedOpportunities.map(o => o.opportunityId));
                      }
                    }}
                  />
                </th>
                <th>Opportunity Name</th>
                <th>Account Name</th>
                <th>Amount</th>
                <th>Close Date</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOpportunities.map(opp => {
                const account = state.accounts.find(a => a.accountId === opp.accountId);
                const owner = state.users.find(u => u.userId === opp.ownerId);
                return (
                  <tr key={opp.opportunityId}>
                    <td className="table-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(opp.opportunityId)}
                        onChange={() => setSelectedIds(prev => prev.includes(opp.opportunityId) ? prev.filter(id => id !== opp.opportunityId) : [...prev, opp.opportunityId])}
                      />
                    </td>
                    <td>
                      <Link to={`/opportunities/${opp.opportunityId}`}>{opp.name}</Link>
                    </td>
                    <td>{account?.name}</td>
                    <td>{formatAmount(opp.amount)}</td>
                    <td>{format(new Date(opp.closeDate), 'MMM d, yyyy')}</td>
                    <td>
                      <span className="badge badge-working">{opp.stage}</span>
                    </td>
                    <td>{opp.probability}%</td>
                    <td>{owner?.firstName} {owner?.lastName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board */
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
          {STAGES.map(stage => {
            const stageOpps = state.opportunities.filter(o => o.stage === stage);
            const totalAmount = stageOpps.reduce((sum, o) => sum + o.amount, 0);
            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                style={{
                  minWidth: '220px',
                  maxWidth: '260px',
                  flex: '1 0 220px',
                  background: '#F3F3F3',
                  borderRadius: '8px',
                  borderTop: `3px solid ${STAGE_TOP_COLORS[stage]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 200px)',
                }}
              >
                {/* Column Header */}
                <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{stage}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {stageOpps.length} deal{stageOpps.length !== 1 ? 's' : ''} &middot; {formatAmount(totalAmount)}
                  </div>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                  {stageOpps.map(opp => {
                    const account = state.accounts.find(a => a.accountId === opp.accountId);
                    const owner = state.users.find(u => u.userId === opp.ownerId);
                    return (
                      <div
                        key={opp.opportunityId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.opportunityId)}
                        style={{
                          background: 'white',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px',
                          cursor: 'grab',
                          transition: 'box-shadow 0.2s',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                      >
                        <Link
                          to={`/opportunities/${opp.opportunityId}`}
                          style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', display: 'block' }}
                        >
                          {opp.name}
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {account?.name}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>
                          {formatAmount(opp.amount)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {format(new Date(opp.closeDate), 'MMM d, yyyy')}
                          </div>
                          {owner && (
                            <div
                              title={`${owner.firstName} ${owner.lastName}`}
                              style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: STAGE_TOP_COLORS[stage],
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', fontWeight: 600
                              }}
                            >
                              {owner.firstName[0]}{owner.lastName[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {stageOpps.length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No opportunities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Opportunity"
        fields={opportunityFields}
        onSubmit={handleCreateOpportunity}
      />
    </div>
  );
};
