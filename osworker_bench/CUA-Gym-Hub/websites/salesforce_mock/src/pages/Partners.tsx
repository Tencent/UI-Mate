
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from '../components/CreateModal';
import { BulkActionBar } from '../components/BulkActionBar';

interface PartnersProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Partners: React.FC<PartnersProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const partners = state.partners ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedView, setSelectedView] = useState('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open create modal when ?create=1 is in the URL
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [filters, setFilters] = useState({
    stage: '',
    coMarketingStatus: '',
    dealRegistration: '',
    owner: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const [loading] = useState(false);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPartners = partners.filter(partner => {
    if (selectedView === 'my') return partner.ownerId === state.user.userId;
    if (filters.stage && partner.stage !== filters.stage) return false;
    if (filters.coMarketingStatus && partner.coMarketingStatus !== filters.coMarketingStatus) return false;
    if (filters.dealRegistration && partner.dealRegistration !== filters.dealRegistration) return false;
    if (filters.owner && partner.ownerId !== filters.owner) return false;
    return true;
  });

  const sortedPartners = [...filteredPartners].sort((a, b) => {
    let aVal: any = (a as any)[sortField];
    let bVal: any = (b as any)[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);
  const paginatedPartners = sortedPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const togglePartnerSelection = (partnerId: string) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]
    );
  };

  const toggleAllPartners = () => {
    if (selectedPartners.length === paginatedPartners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(paginatedPartners.map(p => p.partnerId));
    }
  };

  const partnerFields = [
    { name: 'name', label: 'Partner Name', type: 'text' as const, required: true },
    { name: 'stage', label: 'Partner Stage', type: 'select' as const, options: ['Prospect', 'Qualified', 'Contract Sent', 'Active', 'Inactive'], required: true },
    { name: 'nextAction', label: 'Next Action', type: 'text' as const },
    { name: 'nextActionDate', label: 'Next Action Date', type: 'text' as const },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
    { name: 'coMarketingStatus', label: 'Co-Marketing Status', type: 'select' as const, options: ['Not Started', 'Interested', 'In Discussion', 'Committed', 'Complete'] },
    { name: 'primaryContact', label: 'Primary Contact', type: 'text' as const },
    { name: 'contactEmail', label: 'Contact Email', type: 'email' as const },
    { name: 'dealRegistration', label: 'Deal Registration', type: 'select' as const, options: ['Enabled', 'Disabled', 'Pending'] },
  ];

  const handleCreatePartner = (data: any) => {
    const newPartner = {
      partnerId: 'partner_' + Date.now(),
      name: data.name,
      stage: data.stage || 'Prospect',
      nextAction: data.nextAction || '',
      nextActionDate: data.nextActionDate || '',
      notes: data.notes || '',
      coMarketingStatus: data.coMarketingStatus || 'Not Started',
      primaryContact: data.primaryContact || '',
      contactEmail: data.contactEmail || '',
      dealRegistration: data.dealRegistration || 'Disabled',
      ownerId: state.user.userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    updateState({
      partners: [...partners, newPartner]
    });

    onShowToast('Partner created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Partners</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,"
                + "Partner Name,Stage,Next Action,Next Action Date,Co-Marketing Status,Primary Contact,Contact Email,Deal Registration,Owner,Created Date\n"
                + filteredPartners.map(p => {
                  const owner = state.users.find(u => u.userId === p.ownerId);
                  return `"${p.name}","${p.stage}","${p.nextAction}","${p.nextActionDate}","${p.coMarketingStatus}","${p.primaryContact}","${p.contactEmail}","${p.dealRegistration}","${owner?.firstName} ${owner?.lastName}","${format(new Date(p.createdDate), 'yyyy-MM-dd')}"`;
                }).join("\n");

              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "partners.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              onShowToast('Partners exported successfully', 'success');
            }}
          >
            <Download size={18} />
            Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            New Partner
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="form-select"
            style={{ width: '200px' }}
          >
            <option value="all">All Partners</option>
            <option value="my">My Partners</option>
          </select>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {filteredPartners.length} items
          </div>
        </div>

        {showFilters && (
          <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Partner Stage</label>
                <select
                  className="form-select"
                  value={filters.stage}
                  onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                >
                  <option value="">All Stages</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contract Sent">Contract Sent</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Co-Marketing Status</label>
                <select
                  className="form-select"
                  value={filters.coMarketingStatus}
                  onChange={(e) => setFilters({ ...filters, coMarketingStatus: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Interested">Interested</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Committed">Committed</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Deal Registration</label>
                <select
                  className="form-select"
                  value={filters.dealRegistration}
                  onChange={(e) => setFilters({ ...filters, dealRegistration: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setFilters({ stage: '', coMarketingStatus: '', dealRegistration: '', owner: '' })}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <BulkActionBar
          selectedCount={selectedPartners.length}
          users={state.users}
          statusOptions={['Prospect', 'Qualified', 'Contract Sent', 'Active', 'Inactive']}
          entityName="Partner"
          onDeselectAll={() => setSelectedPartners([])}
          onChangeOwner={(userId) => {
            const updated = partners.map(p =>
              selectedPartners.includes(p.partnerId) ? { ...p, ownerId: userId, modifiedDate: new Date().toISOString() } : p
            );
            updateState({ partners: updated });
            onShowToast(`${selectedPartners.length} records updated`, 'success');
            setSelectedPartners([]);
          }}
          onChangeStatus={(status) => {
            const updated = partners.map(p =>
              selectedPartners.includes(p.partnerId) ? { ...p, stage: status as any, modifiedDate: new Date().toISOString() } : p
            );
            updateState({ partners: updated });
            onShowToast(`${selectedPartners.length} records updated`, 'success');
            setSelectedPartners([]);
          }}
          onDelete={() => {
            const updated = partners.filter(p => !selectedPartners.includes(p.partnerId));
            updateState({ partners: updated });
            onShowToast(`${selectedPartners.length} records deleted`, 'success');
            setSelectedPartners([]);
          }}
          onExport={() => {
            const selected = partners.filter(p => selectedPartners.includes(p.partnerId));
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Partner Name,Stage,Next Action,Contact Email\n"
              + selected.map(p => `"${p.name}","${p.stage}","${p.nextAction}","${p.contactEmail}"`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "partners_selected.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onShowToast(`${selectedPartners.length} records exported`, 'success');
          }}
        />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading partners...</p>
          </div>
        ) : (
          <table className="table">
          <thead>
            <tr>
              <th className="table-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPartners.length === paginatedPartners.length && paginatedPartners.length > 0}
                  onChange={toggleAllPartners}
                />
              </th>
              <th onClick={() => handleSort('name')}>Partner Name</th>
              <th onClick={() => handleSort('stage')}>Stage</th>
              <th onClick={() => handleSort('nextAction')}>Next Action</th>
              <th onClick={() => handleSort('nextActionDate')}>Next Action Date</th>
              <th onClick={() => handleSort('coMarketingStatus')}>Co-Marketing</th>
              <th onClick={() => handleSort('primaryContact')}>Primary Contact</th>
              <th onClick={() => handleSort('contactEmail')}>Email</th>
              <th>Owner</th>
              <th onClick={() => handleSort('createdDate')}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPartners.map(partner => {
              const owner = state.users.find(u => u.userId === partner.ownerId);
              return (
                <tr key={partner.partnerId}>
                  <td className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedPartners.includes(partner.partnerId)}
                      onChange={() => togglePartnerSelection(partner.partnerId)}
                    />
                  </td>
                  <td>
                    <Link to={`/partners/${partner.partnerId}`}>
                      {partner.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${partner.stage.toLowerCase().replace(' ', '-')}`}>
                      {partner.stage}
                    </span>
                  </td>
                  <td>{partner.nextAction}</td>
                  <td>{partner.nextActionDate ? format(new Date(partner.nextActionDate), 'MMM d, yyyy') : ''}</td>
                  <td>
                    <span className={`badge badge-${partner.coMarketingStatus.toLowerCase().replace(' ', '-')}`}>
                      {partner.coMarketingStatus}
                    </span>
                  </td>
                  <td>{partner.primaryContact}</td>
                  <td>{partner.contactEmail}</td>
                  <td>{owner?.firstName} {owner?.lastName}</td>
                  <td>{format(new Date(partner.createdDate), 'MMM d, yyyy')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}

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
        title="Create New Partner"
        fields={partnerFields}
        onSubmit={handleCreatePartner}
      />
    </div>
  );
};
