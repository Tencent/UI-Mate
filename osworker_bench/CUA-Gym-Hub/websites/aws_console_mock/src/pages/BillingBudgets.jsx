import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X } from 'lucide-react';

export default function BillingBudgets() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [name, setName] = useState('');
  const [budgetType, setBudgetType] = useState('Cost');
  const [limit, setLimit] = useState('');
  const [threshold, setThreshold] = useState('80');

  const budgets = state.billing?.budgets || [];

  const handleCreate = () => {
    if (!name.trim() || !limit) return;
    const budget = {
      id: Math.random().toString(36).substr(2, 8),
      name: name.trim(),
      type: budgetType,
      limit: parseFloat(limit),
      actual: 0,
      forecasted: 0,
      alertThresholds: threshold.split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t)),
      alertHistory: [],
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_BUDGET', payload: budget });
    addFlash('success', `Budget "${name}" created successfully`);
    setShowCreate(false);
    setName(''); setLimit(''); setThreshold('80');
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create budget</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Budget name *</label>
            <input className="aws-input max-w-md" value={name} onChange={e => setName(e.target.value)} placeholder="My Monthly Budget" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Budget type</label>
            <select className="aws-input max-w-md" value={budgetType} onChange={e => setBudgetType(e.target.value)}>
              <option value="Cost">Cost budget</option>
              <option value="Usage">Usage budget</option>
              <option value="Savings Plans">Savings Plans budget</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Budget limit ($) *</label>
            <input type="number" className="aws-input w-40" value={limit} onChange={e => setLimit(e.target.value)} placeholder="100.00" min={0} step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Alert thresholds (%)</label>
            <input className="aws-input max-w-md" value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="80, 100" />
            <p className="text-xs text-aws-text-secondary mt-1">Comma-separated percentages</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!name.trim() || !limit}>Create budget</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedBudget) {
    const pct = selectedBudget.limit > 0 ? ((selectedBudget.actual / selectedBudget.limit) * 100).toFixed(1) : 0;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedBudget(null)}>Budgets</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{selectedBudget.name}</h1>
        </div>
        <div className="aws-card grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-bold block">Type</span>{selectedBudget.type}</div>
          <div><span className="font-bold block">Budget limit</span>${selectedBudget.limit.toFixed(2)}</div>
          <div><span className="font-bold block">Actual spend</span>${selectedBudget.actual.toFixed(2)} ({pct}%)</div>
          <div><span className="font-bold block">Forecasted</span>${(selectedBudget.forecasted || 0).toFixed(2)}</div>
        </div>
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-3">Alert history</h3>
          {(selectedBudget.alertHistory || []).length === 0 ? (
            <p className="text-sm text-aws-text-secondary">No alerts triggered</p>
          ) : (
            <div className="space-y-2">
              {selectedBudget.alertHistory.map((a, i) => (
                <div key={i} className="text-sm py-1 border-b border-gray-100">{a.message} - {a.date}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Budgets</h1>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold">All budgets ({budgets.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create budget</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr><th>Name</th><th>Type</th><th>Budget limit</th><th>Actual</th><th>Forecasted</th><th>Progress</th></tr></thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-aws-text-secondary">No budgets configured</td></tr>
            ) : budgets.map(b => {
              const pct = b.limit > 0 ? ((b.actual / b.limit) * 100) : 0;
              return (
                <tr key={b.id || b.name}>
                  <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedBudget(b)}>{b.name}</button></td>
                  <td>{b.type}</td>
                  <td>${b.limit.toFixed(2)}</td>
                  <td>${b.actual.toFixed(2)}</td>
                  <td>${(b.forecasted || 0).toFixed(2)}</td>
                  <td className="w-40">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 h-2 rounded-full">
                        <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-aws-error' : pct >= 80 ? 'bg-aws-warning' : 'bg-aws-success'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>
                      <span className="text-xs">{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
