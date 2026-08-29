import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { showToast } from './Toast';

const STEP_LABELS = ['Parties', 'Signing Order', 'Review & Send'];

export default function SendForSignatureModal({ contractId, onClose }) {
  const { state, updateContract, addActivity, addNotification } = useApp();
  const contract = state.contracts.find(c => c.id === contractId);
  const [step, setStep] = useState(0);
  const [parties, setParties] = useState(
    contract?.parties?.map(p => ({
      ...p,
      signees: p.signees.map(s => ({ ...s })),
    })) || []
  );
  const [signingOrderEnabled, setSigningOrderEnabled] = useState(false);
  const [message, setMessage] = useState('');

  if (!contract) return null;

  const addParty = () => {
    setParties([...parties, {
      id: `party-${Date.now()}`,
      name: '',
      type: 'external',
      signees: [],
    }]);
  };

  const updateParty = (idx, updates) => {
    const next = [...parties];
    next[idx] = { ...next[idx], ...updates };
    setParties(next);
  };

  const removeParty = (idx) => {
    setParties(parties.filter((_, i) => i !== idx));
  };

  const addSignee = (partyIdx) => {
    const next = [...parties];
    next[partyIdx].signees = [...next[partyIdx].signees, {
      id: `signee-${Date.now()}`,
      name: '',
      email: '',
      role: '',
      status: 'pending',
      signedAt: null,
      order: next[partyIdx].signees.length + 1,
    }];
    setParties(next);
  };

  const updateSignee = (partyIdx, signeeIdx, updates) => {
    const next = [...parties];
    next[partyIdx].signees = next[partyIdx].signees.map((s, i) =>
      i === signeeIdx ? { ...s, ...updates } : s
    );
    setParties(next);
  };

  const removeSignee = (partyIdx, signeeIdx) => {
    const next = [...parties];
    next[partyIdx].signees = next[partyIdx].signees.filter((_, i) => i !== signeeIdx);
    setParties(next);
  };

  const handleSend = () => {
    const updatedParties = parties.map(p => ({
      ...p,
      signees: p.signees.map((s, i) => ({
        ...s,
        status: 'pending',
        order: signingOrderEnabled ? i + 1 : s.order,
      })),
    }));

    updateContract({
      id: contractId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      parties: updatedParties,
    });

    addActivity({
      contractId,
      type: 'sent',
      userId: state.currentUser?.id || 'user-1',
      contactId: null,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} sent contract for signature`,
      metadata: null,
    });

    addNotification({
      type: 'reminder',
      title: `Contract sent for signature: ${contract.title}`,
      description: `${contract.title} has been sent to ${updatedParties.flatMap(p => p.signees).map(s => s.name).join(', ')} for signature`,
      contractId,
    });

    showToast('Contract sent for signature', 'success');
    onClose();
  };

  const allSignees = parties.flatMap(p => p.signees);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h2>Send for Signature</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Steps */}
        <div className="steps-bar" style={{ padding: '0 24px' }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} className={`step-item ${step === i ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-number">{i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {/* Step 1: Parties */}
          {step === 0 && (
            <div>
              {parties.map((party, partyIdx) => (
                <div key={party.id} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <input
                      className="input"
                      placeholder="Party name (e.g. Acme Corporation)"
                      value={party.name}
                      onChange={e => updateParty(partyIdx, { name: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <select
                      className="input"
                      style={{ width: 120 }}
                      value={party.type}
                      onChange={e => updateParty(partyIdx, { type: e.target.value })}
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                    {partyIdx > 0 && (
                      <button className="btn btn-ghost btn-icon" onClick={() => removeParty(partyIdx)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {party.signees.map((signee, signeeIdx) => (
                    <div key={signee.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                      <input
                        className="input"
                        placeholder="Name"
                        value={signee.name}
                        onChange={e => updateSignee(partyIdx, signeeIdx, { name: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <input
                        className="input"
                        placeholder="Email"
                        type="email"
                        value={signee.email}
                        onChange={e => updateSignee(partyIdx, signeeIdx, { email: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <input
                        className="input"
                        placeholder="Role"
                        value={signee.role}
                        onChange={e => updateSignee(partyIdx, signeeIdx, { role: e.target.value })}
                        style={{ width: 120 }}
                      />
                      <button className="btn btn-ghost btn-icon" onClick={() => removeSignee(partyIdx, signeeIdx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 13, color: 'var(--color-primary)' }}
                    onClick={() => addSignee(partyIdx)}
                  >
                    <Plus size={14} />
                    Add Signee
                  </button>
                </div>
              ))}

              <button className="btn btn-secondary" onClick={addParty}>
                <Plus size={14} />
                Add Party
              </button>
            </div>
          )}

          {/* Step 2: Signing Order */}
          {step === 1 && (
            <div>
              <div
                className="toggle-switch"
                style={{ marginBottom: 20 }}
                onClick={() => setSigningOrderEnabled(!signingOrderEnabled)}
              >
                <div className={`toggle-track ${signingOrderEnabled ? 'on' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Enable signing order</span>
              </div>

              {allSignees.map((signee, idx) => (
                <div key={signee.id} className="signee-row">
                  {signingOrderEnabled && (
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--color-primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{idx + 1}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{signee.name || '(unnamed)'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{signee.email}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{signee.role}</span>
                  {signingOrderEnabled && idx > 0 && (
                    <button className="btn btn-ghost btn-icon" onClick={() => {
                      const flatSignees = parties.flatMap((p, pi) => p.signees.map((s, si) => ({ pi, si, s })));
                      const curr = flatSignees[idx];
                      const prev = flatSignees[idx - 1];
                      const next = [...parties];
                      const tmp = next[curr.pi].signees[curr.si];
                      next[curr.pi].signees[curr.si] = next[prev.pi].signees[prev.si];
                      next[prev.pi].signees[prev.si] = tmp;
                      setParties(next);
                    }}>↑</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Review & Send */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Review Parties & Signees</h3>
              {parties.map(party => (
                <div key={party.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {party.name}
                    <span className={`badge badge-${party.type}`}>{party.type}</span>
                  </div>
                  {party.signees.map(s => (
                    <div key={s.id} style={{ padding: '6px 12px', fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', gap: 12 }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.name}</span>
                      <span>{s.email}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{s.role}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Message to recipients (optional)</label>
                <textarea
                  className="input"
                  placeholder="Add a message that will be included in the signing invitation email..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
          )}
          {step < 2 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSend}>
              Send for Signature
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
