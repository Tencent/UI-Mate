
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { CreateModal } from '../components/CreateModal';
import { Contact } from '../types';
import { BulkActionBar } from '../components/BulkActionBar';

interface ContactsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Contacts: React.FC<ContactsProps> = ({ onShowToast }) => {
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

  const totalPages = Math.ceil(state.contacts.length / itemsPerPage);
  const paginatedContacts = state.contacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const contactFields = [
    { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
    { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
    { name: 'accountId', label: 'Account', type: 'select' as const, options: state.accounts.map(a => a.name), required: true },
    { name: 'title', label: 'Title', type: 'text' as const },
    { name: 'department', label: 'Department', type: 'text' as const },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const },
    { name: 'mobile', label: 'Mobile', type: 'text' as const },
    { name: 'mailingStreet', label: 'Mailing Street', type: 'text' as const },
    { name: 'mailingCity', label: 'Mailing City', type: 'text' as const },
    { name: 'mailingState', label: 'Mailing State', type: 'text' as const },
    { name: 'mailingZip', label: 'Mailing Zip', type: 'text' as const },
    { name: 'mailingCountry', label: 'Mailing Country', type: 'text' as const },
  ];

  const handleCreateContact = (data: any) => {
    const account = state.accounts.find(a => a.name === data.accountId);
    const newContact: Contact = {
      contactId: 'contact_' + Date.now(),
      accountId: account ? account.accountId : state.accounts[0].accountId,
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title || '',
      department: data.department || '',
      email: data.email,
      phone: data.phone || '',
      mobile: data.mobile || '',
      mailingStreet: data.mailingStreet || '',
      mailingCity: data.mailingCity || '',
      mailingState: data.mailingState || '',
      mailingZip: data.mailingZip || '',
      mailingCountry: data.mailingCountry || '',
      ownerId: state.user.userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };
    
    updateState({
      contacts: [...state.contacts, newContact]
    });
    
    onShowToast('Contact created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Contacts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          New Contact
        </button>
      </div>

      <div className="card">
        <BulkActionBar
          selectedCount={selectedIds.length}
          users={state.users}
          statusOptions={[]}
          entityName="Contact"
          onDeselectAll={() => setSelectedIds([])}
          onChangeOwner={(userId) => {
            const updated = state.contacts.map(c =>
              selectedIds.includes(c.contactId) ? { ...c, ownerId: userId, modifiedDate: new Date().toISOString() } : c
            );
            updateState({ contacts: updated });
            onShowToast(`${selectedIds.length} records updated`, 'success');
            setSelectedIds([]);
          }}
          onChangeStatus={() => {}}
          onDelete={() => {
            const updated = state.contacts.filter(c => !selectedIds.includes(c.contactId));
            updateState({ contacts: updated });
            onShowToast(`${selectedIds.length} records deleted`, 'success');
            setSelectedIds([]);
          }}
          onExport={() => {
            const selected = state.contacts.filter(c => selectedIds.includes(c.contactId));
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Name,Title,Email,Phone\n"
              + selected.map(c => `"${c.firstName} ${c.lastName}","${c.title}","${c.email}","${c.phone}"`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "contacts_selected.csv");
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
                  checked={selectedIds.length === paginatedContacts.length && paginatedContacts.length > 0}
                  onChange={() => {
                    if (selectedIds.length === paginatedContacts.length) {
                      setSelectedIds([]);
                    } else {
                      setSelectedIds(paginatedContacts.map(c => c.contactId));
                    }
                  }}
                />
              </th>
              <th>Name</th>
              <th>Account Name</th>
              <th>Title</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map(contact => {
              const account = state.accounts.find(a => a.accountId === contact.accountId);
              const owner = state.users.find(u => u.userId === contact.ownerId);
              return (
                <tr key={contact.contactId}>
                  <td className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contact.contactId)}
                      onChange={() => setSelectedIds(prev => prev.includes(contact.contactId) ? prev.filter(id => id !== contact.contactId) : [...prev, contact.contactId])}
                    />
                  </td>
                  <td>
                    <Link to={`/contacts/${contact.contactId}`}>
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </td>
                  <td>{account?.name}</td>
                  <td>{contact.title}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
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
      
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Contact"
        fields={contactFields}
        onSubmit={handleCreateContact}
      />
    </div>
  );
};
