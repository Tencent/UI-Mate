
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, MapPin, Search, ArrowUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Customers() {
  const { state, addCustomer } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    defaultAddress: { address1: '', city: '', province: '', country: 'United States', countryCode: 'US', zip: '' }
  });

  const filteredCustomers = useMemo(() => {
    let result = state.customers || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.defaultAddress?.city?.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'name') {
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
        } else if (sortField === 'location') {
          aVal = a.defaultAddress?.city || '';
          bVal = b.defaultAddress?.city || '';
        } else if (sortField === 'orders') {
          aVal = a.ordersCount || 0;
          bVal = b.ordersCount || 0;
        } else if (sortField === 'spent') {
          aVal = parseFloat(a.totalSpent) || 0;
          bVal = parseFloat(b.totalSpent) || 0;
        } else { return 0; }
        if (typeof aVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [state.customers, searchQuery, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addCustomer({
      ...newCustomer,
      state: 'enabled',
      verifiedEmail: true,
      acceptsMarketing: false,
      taxExempt: false,
      ordersCount: 0,
      totalSpent: '0.00',
      note: '',
      tags: [],
      addresses: [newCustomer.defaultAddress],
    });
    setShowAddModal(false);
    setNewCustomer({
      firstName: '', lastName: '', email: '', phone: '',
      defaultAddress: { address1: '', city: '', province: '', country: 'United States', countryCode: 'US', zip: '' }
    });
  };

  const getInitials = (c) => {
    return `${(c.firstName?.[0] || '').toUpperCase()}${(c.lastName?.[0] || '').toUpperCase()}`;
  };

  const getLocation = (c) => {
    const addr = c.defaultAddress;
    if (!addr) return '';
    const parts = [addr.city, addr.provinceCode || addr.province, addr.countryCode || addr.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Customers</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-[13px]">
          <Plus size={16} /> Add customer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search customers"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Customer <ArrowUpDown size={14} />
                </button>
              </th>
              <th>Email</th>
              <th>
                <button onClick={() => handleSort('location')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Location <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('orders')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Orders <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('spent')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Amount spent <ArrowUpDown size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-[#616161] py-12">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/customers/${customer.id}`)}>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                        style={{ background: '#8c6e4f' }}
                      >
                        {getInitials(customer)}
                      </div>
                      <Link
                        to={`/customers/${customer.id}`}
                        className="font-medium text-[#303030] hover:underline"
                        style={{ color: '#303030' }}
                      >
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </div>
                  </td>
                  <td className="text-[#616161]">{customer.email}</td>
                  <td className="text-[#616161]">
                    {getLocation(customer) && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-[#616161]" />
                        {getLocation(customer)}
                      </div>
                    )}
                  </td>
                  <td className="text-[#303030]">{customer.ordersCount} orders</td>
                  <td className="text-[#303030] font-medium">
                    ${parseFloat(customer.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-modal">
            <h3 className="text-[18px] font-bold text-[#303030] mb-4">Add customer</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">First name</label>
                  <input
                    required
                    type="text"
                    className="w-full text-[13px]"
                    value={newCustomer.firstName}
                    onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Last name</label>
                  <input
                    required
                    type="text"
                    className="w-full text-[13px]"
                    value={newCustomer.lastName}
                    onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full text-[13px]"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Save customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
