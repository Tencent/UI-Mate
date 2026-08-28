import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, X } from 'lucide-react';

const timeGrains = ['Monthly', 'Quarterly', 'Annually'];

export default function CostBudgets() {
  const { state, dispatch } = useAppContext();
  const cm = state.costManagement;
  const [showAddForm, setShowAddForm] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetTimeGrain, setBudgetTimeGrain] = useState('Monthly');
  const [formError, setFormError] = useState('');

  const handleAddBudget = () => {
    if (!budgetName.trim()) {
      setFormError('Budget name is required.');
      return;
    }
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }
    if (cm.budgets.find(b => b.name === budgetName.trim())) {
      setFormError('A budget with this name already exists.');
      return;
    }
    dispatch({
      type: 'CREATE_BUDGET',
      payload: {
        name: budgetName.trim(),
        amount,
        timeGrain: budgetTimeGrain
      }
    });
    setBudgetName('');
    setBudgetAmount('');
    setBudgetTimeGrain('Monthly');
    setFormError('');
    setShowAddForm(false);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cost Management', path: '/cost-management' }, { label: 'Budgets' }]} />
      <h1 className="page-title">Budgets</h1>

      <div className="command-bar" style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={14} /> Add
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '16px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Create budget</div>
            <button onClick={() => { setShowAddForm(false); setFormError(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
          </div>

          {formError && (
            <div style={{ color: 'var(--xzure-error)', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: '#fde8e8', borderRadius: '2px' }}>{formError}</div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Budget name *</label>
            <input className="input" style={{ width: '100%' }} placeholder="e.g. Monthly-Dev" value={budgetName}
              onChange={e => { setBudgetName(e.target.value); setFormError(''); }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Amount ($) *</label>
            <input className="input" style={{ width: '100%' }} placeholder="e.g. 500" type="number" min="1" value={budgetAmount}
              onChange={e => { setBudgetAmount(e.target.value); setFormError(''); }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Time grain</label>
            <select className="input" style={{ width: '100%' }} value={budgetTimeGrain}
              onChange={e => setBudgetTimeGrain(e.target.value)}>
              {timeGrains.map(tg => <option key={tg} value={tg}>{tg}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleAddBudget}>Create</button>
            <button className="btn btn-default" onClick={() => { setShowAddForm(false); setFormError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, marginBottom: '24px' }}>
        <table className="xzure-table">
          <thead><tr><th>Budget name</th><th>Amount</th><th>Time grain</th><th>Current spend</th><th>Status</th></tr></thead>
          <tbody>
            {cm.budgets.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No budgets configured</td></tr>
            )}
            {cm.budgets.map(b => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>${b.amount.toFixed(2)}</td>
                <td>{b.timeGrain}</td>
                <td>${b.currentSpend.toFixed(2)}</td>
                <td><span className={`badge ${b.status === 'OK' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop: '8px' }}>Invoices</div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due date</th></tr></thead>
          <tbody>
            {cm.invoices.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No invoices</td></tr>
            )}
            {cm.invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.period}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td><span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span></td>
                <td>{inv.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
