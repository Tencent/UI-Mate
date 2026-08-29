import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, LayoutTemplate, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NewContractModal() {
  const [open, setOpen] = useState(false);
  const { state, addContract } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-new-contract-modal', handler);
    return () => window.removeEventListener('open-new-contract-modal', handler);
  }, []);

  if (!open) return null;

  const handleBlank = () => {
    const contract = addContract({
      title: 'Untitled Contract',
      status: 'draft',
      content: '<h2>Contract Title</h2><p>Begin writing your contract here...</p>',
      folderId: null,
      templateId: null,
      tags: [],
      parties: [
        {
          id: `party-${Date.now()}-a`,
          name: state.currentUser?.company || 'Acme Corporation',
          type: 'internal',
          signees: [],
        },
      ],
      value: null,
      currency: 'USD',
      notes: '',
      expiresAt: null,
      signedAt: null,
      sentAt: null,
      renewalDate: null,
      approvals: [],
      createdBy: state.currentUser?.id || 'user-1',
    });
    setOpen(false);
    navigate(`/contracts/${contract.id}${query}`, { state: { editMode: true } });
  };

  const handleFromTemplate = () => {
    setOpen(false);
    navigate(`/templates${query}?select=true`);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h2>Create New Contract</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="new-contract-options">
            <div className="new-contract-card" onClick={handleBlank}>
              <div className="new-contract-card-icon">
                <FileText size={24} />
              </div>
              <h3>Blank Document</h3>
              <p>Start from scratch with an empty contract</p>
            </div>
            <div className="new-contract-card" onClick={handleFromTemplate}>
              <div className="new-contract-card-icon">
                <LayoutTemplate size={24} />
              </div>
              <h3>From Template</h3>
              <p>Use an existing template as a starting point</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
