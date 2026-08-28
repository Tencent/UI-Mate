
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from '../components/CreateModal';
import { BulkActionBar } from '../components/BulkActionBar';

interface LeadsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Leads: React.FC<LeadsProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedView, setSelectedView] = useState('all');
  const [sortField, setSortField] = useState<string>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open create modal when ?create=1 is in the URL
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
      // Remove the param after opening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    source: '',
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

  const filteredLeads = state.leads.filter(lead => {
    if (selectedView === 'my') return lead.ownerId === state.user.userId;
    if (selectedView === 'today') {
      const today = new Date().toDateString();
      return new Date(lead.createdDate).toDateString() === today;
    }
    
    // Apply additional filters
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.rating && lead.rating !== filters.rating) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.owner && lead.ownerId !== filters.owner) return false;
    
    return true;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal: any = a[sortField as keyof typeof a];
    let bVal: any = b[sortField as keyof typeof b];
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(l => l.leadId));
    }
  };

  const leadFields = [
    { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
    { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
    { name: 'company', label: 'Company', type: 'text' as const, required: true },
    { name: 'title', label: 'Title', type: 'text' as const },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const },
    { name: 'mobile', label: 'Mobile', type: 'text' as const },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['New', 'Working', 'Qualified', 'Unqualified'], required: true },
    { name: 'source', label: 'Lead Source', type: 'select' as const, options: ['Website', 'Referral', 'Trade Show', 'Cold Call', 'LinkedIn'] },
    { name: 'rating', label: 'Rating', type: 'select' as const, options: ['Hot', 'Warm', 'Cold'] },
    { name: 'industry', label: 'Industry', type: 'text' as const },
    { name: 'employees', label: 'Employees', type: 'number' as const },
    { name: 'revenue', label: 'Annual Revenue', type: 'number' as const },
    { name: 'street', label: 'Street', type: 'text' as const },
    { name: 'city', label: 'City', type: 'text' as const },
    { name: 'state', label: 'State', type: 'text' as const },
    { name: 'zip', label: 'Zip Code', type: 'text' as const },
    { name: 'country', label: 'Country', type: 'text' as const },
    { name: 'website', label: 'Website', type: 'text' as const },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const handleCreateLead = (data: any) => {
    const newLead = {
      leadId: 'lead_' + Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      title: data.title || '',
      email: data.email,
      phone: data.phone || '',
      mobile: data.mobile || '',
      status: data.status || 'New',
      source: data.source || '',
      rating: data.rating || 'Warm',
      industry: data.industry || '',
      employees: data.employees || 0,
      revenue: data.revenue || 0,
      street: data.street || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: data.country || '',
      website: data.website || '',
      description: data.description || '',
      ownerId: state.user.userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };
    
    updateState({
      leads: [...state.leads, newLead]
    });
    
    onShowToast('Lead created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Leads</h1>
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
              // Simple CSV export functionality
              const csvContent = "data:text/csv;charset=utf-8," 
                + "Name,Company,Email,Phone,Status,Source,Rating,Owner,Created Date\n"
                + filteredLeads.map(lead => {
                  const owner = state.users.find(u => u.userId === lead.ownerId);
                  return `"${lead.firstName} ${lead.lastName}","${lead.company}","${lead.email}","${lead.phone}","${lead.status}","${lead.source}","${lead.rating}","${owner?.firstName} ${owner?.lastName}","${format(new Date(lead.createdDate), 'yyyy-MM-dd')}"`;
                }).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "leads.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              onShowToast('Leads exported successfully', 'success');
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
            New Lead
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
            <option value="all">All Leads</option>
            <option value="my">My Leads</option>
            <option value="today">Today's Leads</option>
          </select>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {filteredLeads.length} items
          </div>
        </div>

        {showFilters && (
          <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Working">Working</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select 
                  className="form-select"
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                >
                  <option value="">All Ratings</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Source</label>
                <select 
                  className="form-select"
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                >
                  <option value="">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setFilters({ status: '', rating: '', source: '', owner: '' })}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <BulkActionBar
          selectedCount={selectedLeads.length}
          users={state.users}
          statusOptions={['New', 'Working', 'Qualified', 'Unqualified']}
          entityName="Lead"
          onDeselectAll={() => setSelectedLeads([])}
          onChangeOwner={(userId) => {
            const updated = state.leads.map(l =>
              selectedLeads.includes(l.leadId) ? { ...l, ownerId: userId, modifiedDate: new Date().toISOString() } : l
            );
            updateState({ leads: updated });
            onShowToast(`${selectedLeads.length} records updated`, 'success');
            setSelectedLeads([]);
          }}
          onChangeStatus={(status) => {
            const updated = state.leads.map(l =>
              selectedLeads.includes(l.leadId) ? { ...l, status: status as any, modifiedDate: new Date().toISOString() } : l
            );
            updateState({ leads: updated });
            onShowToast(`${selectedLeads.length} records updated`, 'success');
            setSelectedLeads([]);
          }}
          onDelete={() => {
            const updated = state.leads.filter(l => !selectedLeads.includes(l.leadId));
            updateState({ leads: updated });
            onShowToast(`${selectedLeads.length} records deleted`, 'success');
            setSelectedLeads([]);
          }}
          onExport={() => {
            const selected = state.leads.filter(l => selectedLeads.includes(l.leadId));
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Name,Company,Email,Phone,Status,Source,Rating\n"
              + selected.map(l => `"${l.firstName} ${l.lastName}","${l.company}","${l.email}","${l.phone}","${l.status}","${l.source}","${l.rating}"`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "leads_selected.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onShowToast(`${selectedLeads.length} records exported`, 'success');
          }}
        />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading leads...</p>
          </div>
        ) : (
          <table className="table">
          <thead>
            <tr>
              <th className="table-checkbox">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                  onChange={toggleAllLeads}
                />
              </th>
              <th onClick={() => handleSort('firstName')}>Name</th>
              <th onClick={() => handleSort('company')}>Company</th>
              <th onClick={() => handleSort('email')}>Email</th>
              <th onClick={() => handleSort('phone')}>Phone</th>
              <th onClick={() => handleSort('status')}>Status</th>
              <th onClick={() => handleSort('source')}>Source</th>
              <th onClick={() => handleSort('rating')}>Rating</th>
              <th>Owner</th>
              <th onClick={() => handleSort('createdDate')}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map(lead => {
              const owner = state.users.find(u => u.userId === lead.ownerId);
              return (
                <tr key={lead.leadId}>
                  <td className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.leadId)}
                      onChange={() => toggleLeadSelection(lead.leadId)}
                    />
                  </td>
                  <td>
                    <Link to={`/leads/${lead.leadId}`}>
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </td>
                  <td>{lead.company}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>
                    <span className={`badge badge-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.source}</td>
                  <td>
                    <span className={`badge badge-${lead.rating.toLowerCase()}`}>
                      {lead.rating}
                    </span>
                  </td>
                  <td>{owner?.firstName} {owner?.lastName}</td>
                  <td>{format(new Date(lead.createdDate), 'MMM d, yyyy')}</td>
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
        title="Create New Lead"
        fields={leadFields}
        onSubmit={handleCreateLead}
      />
    </div>
  );
};
