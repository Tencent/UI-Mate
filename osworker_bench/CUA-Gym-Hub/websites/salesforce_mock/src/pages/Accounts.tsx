
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from '../components/CreateModal';
import { Account } from '../types';
import { BulkActionBar } from '../components/BulkActionBar';

interface AccountsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Accounts: React.FC<AccountsProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.ceil(state.accounts.length / itemsPerPage);
  const paginatedAccounts = state.accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const accountFields = [
    { name: 'name', label: 'Account Name', type: 'text' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const },
    { name: 'website', label: 'Website', type: 'text' as const },
    { name: 'type', label: 'Type', type: 'select' as const, options: ['Customer', 'Prospect', 'Partner', 'Reseller'] },
    { name: 'industry', label: 'Industry', type: 'text' as const },
    { name: 'revenue', label: 'Annual Revenue', type: 'number' as const },
    { name: 'employees', label: 'Employees', type: 'number' as const },
    { name: 'description', label: 'Description', type: 'textarea' as const },
    { name: 'billingStreet', label: 'Billing Street', type: 'text' as const },
    { name: 'billingCity', label: 'Billing City', type: 'text' as const },
    { name: 'billingState', label: 'Billing State', type: 'text' as const },
    { name: 'billingZip', label: 'Billing Zip', type: 'text' as const },
    { name: 'billingCountry', label: 'Billing Country', type: 'text' as const },
  ];

  const handleCreateAccount = (data: any) => {
    const newAccount: Account = {
      accountId: 'account_' + Date.now(),
      name: data.name,
      phone: data.phone || '',
      website: data.website || '',
      type: data.type || 'Customer',
      industry: data.industry || '',
      revenue: data.revenue || 0,
      employees: data.employees || 0,
      description: data.description || '',
      ownerId: state.user.userId,
      billingStreet: data.billingStreet || '',
      billingCity: data.billingCity || '',
      billingState: data.billingState || '',
      billingZip: data.billingZip || '',
      billingCountry: data.billingCountry || '',
      shippingStreet: data.billingStreet || '',
      shippingCity: data.billingCity || '',
      shippingState: data.billingState || '',
      shippingZip: data.billingZip || '',
      shippingCountry: data.billingCountry || '',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };
    
    updateState({
      accounts: [...state.accounts, newAccount]
    });
    
    onShowToast('Account created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Accounts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          New Account
        </button>
      </div>

      <div className="card">
        <BulkActionBar
          selectedCount={selectedIds.length}
          users={state.users}
          statusOptions={['Prospect', 'Customer', 'Partner', 'Other']}
          entityName="Account"
          onDeselectAll={() => setSelectedIds([])}
          onChangeOwner={(userId) => {
            const updated = state.accounts.map(a =>
              selectedIds.includes(a.accountId) ? { ...a, ownerId: userId, modifiedDate: new Date().toISOString() } : a
            );
            updateState({ accounts: updated });
            onShowToast(`${selectedIds.length} records updated`, 'success');
            setSelectedIds([]);
          }}
          onChangeStatus={(type) => {
            const updated = state.accounts.map(a =>
              selectedIds.includes(a.accountId) ? { ...a, type, modifiedDate: new Date().toISOString() } : a
            );
            updateState({ accounts: updated });
            onShowToast(`${selectedIds.length} records updated`, 'success');
            setSelectedIds([]);
          }}
          onDelete={() => {
            const updated = state.accounts.filter(a => !selectedIds.includes(a.accountId));
            updateState({ accounts: updated });
            onShowToast(`${selectedIds.length} records deleted`, 'success');
            setSelectedIds([]);
          }}
          onExport={() => {
            const selected = state.accounts.filter(a => selectedIds.includes(a.accountId));
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Name,Phone,Website,Type,Industry,Revenue\n"
              + selected.map(a => `"${a.name}","${a.phone}","${a.website}","${a.type}","${a.industry}","${a.revenue}"`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "accounts_selected.csv");
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
                  checked={selectedIds.length === paginatedAccounts.length && paginatedAccounts.length > 0}
                  onChange={() => {
                    if (selectedIds.length === paginatedAccounts.length) {
                      setSelectedIds([]);
                    } else {
                      setSelectedIds(paginatedAccounts.map(a => a.accountId));
                    }
                  }}
                />
              </th>
              <th>Account Name</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Type</th>
              <th>Industry</th>
              <th>Annual Revenue</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAccounts.map(account => {
              return (
                <tr key={account.accountId}>
                  <td className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(account.accountId)}
                      onChange={() => setSelectedIds(prev => prev.includes(account.accountId) ? prev.filter(id => id !== account.accountId) : [...prev, account.accountId])}
                    />
                  </td>
                  <td>
                    <Link to={`/accounts/${account.accountId}`}>{account.name}</Link>
                  </td>
                  <td>{account.phone}</td>
                  <td>{account.website}</td>
                  <td>{account.type}</td>
                  <td>{account.industry}</td>
                  <td>${(account.revenue / 1000000).toFixed(1)}M</td>
                  <td>{format(new Date(account.createdDate), 'MMM d, yyyy')}</td>
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
      
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Account"
        fields={accountFields}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
};
