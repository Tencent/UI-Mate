import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { DollarSign } from 'lucide-react';

export default function CostManagement() {
  const { state } = useAppContext();
  const cm = state.costManagement;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cost Management' }]} />
      <h1 className="page-title">Cost Management</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '200px' }}>
          <div className="caption">Current month cost</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--xzure-text)' }}>${cm.currentMonthCost.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '200px' }}>
          <div className="caption">Forecasted cost</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--xzure-text)' }}>${cm.forecastedCost.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '200px' }}>
          <div className="caption">Budget</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--xzure-text)' }}>${cm.budgetAmount.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/cost-management/cost-analysis" className="navigate-card" style={{ textDecoration: 'none' }}>
          <DollarSign size={24} />
          <div>
            <div style={{ fontWeight: 600 }}>Cost analysis</div>
            <div style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)' }}>Explore and analyze costs</div>
          </div>
        </Link>
        <Link to="/cost-management/budgets" className="navigate-card" style={{ textDecoration: 'none' }}>
          <DollarSign size={24} />
          <div>
            <div style={{ fontWeight: 600 }}>Budgets</div>
            <div style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)' }}>Create and manage budgets</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
