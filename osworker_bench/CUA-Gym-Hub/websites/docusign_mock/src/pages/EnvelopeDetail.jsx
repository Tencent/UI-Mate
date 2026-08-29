import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';
import { downloadEnvelopeCopy } from '../lib/utils';
import {
  ArrowLeft, PenTool, Eye, Mail, Download, RotateCcw, XCircle,
  Trash2, FileText, Clock, CheckCircle, AlertCircle, X, Users, Bell, CalendarDays, Plus, MessageSquare
} from 'lucide-react';

const EnvelopeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, voidEnvelope, resendEnvelope, correctEnvelope, updateEnvelope } = useStore();
  const { addToast } = useToast();
  const envelope = state.envelopes.find(e => e.id === id);

  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [correctRecipients, setCorrectRecipients] = useState([]);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [reminderFrequency, setReminderFrequency] = useState(2);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');

  if (!envelope) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Envelope not found</p>
        <button onClick={() => navigate('/agreements')} className="mt-4 text-blue-600 hover:underline">Back to Agreements</button>
      </div>
    );
  }

  const canResend = envelope.status === 'sent' || envelope.status === 'delivered';
  const canCorrect = envelope.status === 'sent' || envelope.status === 'delivered';
  const canVoid = envelope.status !== 'completed' && envelope.status !== 'voided';

  const handleVoid = () => {
    if (!voidReason.trim()) return;
    voidEnvelope(envelope.id, voidReason.trim());
    setShowVoidModal(false);
    setVoidReason('');
    addToast('Envelope voided successfully');
  };

  const handleResend = () => {
    resendEnvelope(envelope.id);
    setShowResendConfirm(false);
    addToast('Envelope resent successfully');
  };

  const handleCorrect = () => {
    correctEnvelope(envelope.id, { recipients: correctRecipients });
    setShowCorrectModal(false);
    addToast('Recipients updated successfully');
  };

  const openCorrectModal = () => {
    setCorrectRecipients(envelope.recipients.map(r => ({ ...r })));
    setShowCorrectModal(true);
  };

  const statusBadgeClass = {
    completed: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    delivered: 'bg-blue-100 text-blue-800',
    signed: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    declined: 'bg-red-100 text-red-800',
    voided: 'bg-gray-200 text-gray-600',
  };

  const recipientStatusIcon = (status) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delivered': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'sent': return <Mail className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const historyIcon = (action) => {
    switch (action) {
      case 'created': return <FileText className="w-4 h-4 text-gray-500" />;
      case 'sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'viewed': return <Eye className="w-4 h-4 text-indigo-500" />;
      case 'signed': return <PenTool className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'voided': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'corrected': return <PenTool className="w-4 h-4 text-orange-500" />;
      case 'resent': return <RotateCcw className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const roleIcon = (role) => {
    switch (role) {
      case 'signer': return <PenTool className="w-4 h-4 text-yellow-600" />;
      case 'cc': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/agreements')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agreements
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{envelope.subject}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusBadgeClass[envelope.status] || 'bg-gray-100'}`}>
              {envelope.status.charAt(0).toUpperCase() + envelope.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Created {format(new Date(envelope.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canResend && (
            <button
              onClick={() => setShowResendConfirm(true)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Resend
            </button>
          )}
          {canCorrect && (
            <button
              onClick={openCorrectModal}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
            >
              <PenTool className="w-4 h-4" /> Correct
            </button>
          )}
          {canVoid && (
            <button
              onClick={() => setShowVoidModal(true)}
              className="px-3 py-2 text-sm border border-red-200 rounded-md hover:bg-red-50 text-red-700 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" /> Void
            </button>
          )}
          <button
            onClick={() => {
              downloadEnvelopeCopy(envelope, 'envelope copy');
              addToast('Document downloaded', 'success');
            }}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Voided Watermark */}
      {envelope.status === 'voided' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800">VOIDED</p>
            <p className="text-sm text-red-600">
              This envelope was voided on {format(new Date(envelope.voidedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      )}

      {/* Declined Banner */}
      {envelope.status === 'declined' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800">DECLINED</p>
            <p className="text-sm text-red-600">
              A recipient declined to sign this envelope
            </p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Card */}
        {envelope.message && (
          <div className="bg-white border rounded-lg lg:col-span-2">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Message to Recipients</h3>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{envelope.message}</p>
            </div>
          </div>
        )}
        {/* Recipients Card */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Recipients</h3>
          </div>
          <div className="divide-y">
            {envelope.recipients.map(rec => (
              <div key={rec.id} className="px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5">{roleIcon(rec.role)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{rec.name}</span>
                    <span className="text-xs text-gray-400">{rec.role}</span>
                  </div>
                  <p className="text-xs text-gray-500">{rec.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {recipientStatusIcon(rec.status)}
                    <span className="text-xs text-gray-600 capitalize">{rec.status}</span>
                    {rec.signedAt && (
                      <span className="text-xs text-gray-400">
                        {format(new Date(rec.signedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                  </div>
                  {rec.declineReason && (
                    <p className="text-xs text-red-600 mt-1 italic">Reason: {rec.declineReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Documents</h3>
          </div>
          <div className="divide-y">
            {envelope.documents.map(doc => (
              <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.pageCount} page{doc.pageCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders & Expiration */}
        {(envelope.status === 'sent' || envelope.status === 'delivered' || envelope.status === 'signed') && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Reminders</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Auto-reminders</span>
                </div>
                <span className={`text-sm font-medium ${envelope.reminderEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {envelope.reminderEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {envelope.reminderEnabled && (
                <div className="text-xs text-gray-500 pl-6 space-y-1">
                  <p>Every {envelope.reminderDays} day(s)</p>
                  <p>Up to {envelope.reminderFrequency} reminder(s)</p>
                </div>
              )}
              <button
                onClick={() => {
                  setReminderEnabled(envelope.reminderEnabled);
                  setReminderDays(envelope.reminderDays || 3);
                  setReminderFrequency(envelope.reminderFrequency || 2);
                  setShowReminderModal(true);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit Reminders
              </button>
            </div>
          </div>
        )}

        {(envelope.status !== 'completed' && envelope.status !== 'voided') && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Expiration</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Expires</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {envelope.expiresAt ? format(new Date(envelope.expiresAt), 'MMM d, yyyy') : 'No expiration set'}
                </span>
              </div>
              {envelope.expiresAt && new Date(envelope.expiresAt) < new Date() && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>
              )}
              <button
                onClick={() => {
                  setExpirationDate(envelope.expiresAt ? envelope.expiresAt.split('T')[0] : '');
                  setShowExpirationModal(true);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit Expiration
              </button>
            </div>
          </div>
        )}

        {/* History Timeline */}
        <div className="bg-white border rounded-lg lg:col-span-2">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">History</h3>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-0">
              {[...envelope.history].reverse().map((evt, idx) => (
                <div key={evt.id} className="flex gap-3 pb-4 relative">
                  {/* Vertical line */}
                  {idx < envelope.history.length - 1 && (
                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-gray-200" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10 flex-shrink-0">
                    {historyIcon(evt.action)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{evt.details}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{evt.actorName}</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(evt.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[440px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Void Envelope</h3>
              <button onClick={() => setShowVoidModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to void this envelope? This action cannot be undone.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for voiding *</label>
              <textarea
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowVoidModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button
                onClick={handleVoid}
                disabled={!voidReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resend Confirm */}
      {showResendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Resend Envelope</h3>
              <button onClick={() => setShowResendConfirm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Resend to all recipients who haven't completed?</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowResendConfirm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button onClick={handleResend} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Resend</button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Edit Reminders</h3>
              <button onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable reminders</label>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${reminderEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform shadow ${reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {reminderEnabled && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Days between reminders</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(parseInt(e.target.value) || 3)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total reminders to send</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(parseInt(e.target.value) || 2)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowReminderModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button
                onClick={() => {
                  updateEnvelope(envelope.id, { reminderEnabled, reminderDays, reminderFrequency });
                  setShowReminderModal(false);
                  addToast('Reminders updated');
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expiration Modal */}
      {showExpirationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Edit Expiration</h3>
              <button onClick={() => setShowExpirationModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-600 mb-1">Expiration Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowExpirationModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button
                onClick={() => {
                  const expiresAt = expirationDate ? new Date(expirationDate + 'T23:59:59Z').toISOString() : null;
                  updateEnvelope(envelope.id, { expiresAt });
                  setShowExpirationModal(false);
                  addToast('Expiration updated');
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correct Modal */}
      {showCorrectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Correct Recipients</h3>
              <button onClick={() => setShowCorrectModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              {correctRecipients.map((rec, idx) => (
                <div key={rec.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                    value={rec.name}
                    onChange={(e) => {
                      const updated = [...correctRecipients];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setCorrectRecipients(updated);
                    }}
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                    value={rec.email}
                    onChange={(e) => {
                      const updated = [...correctRecipients];
                      updated[idx] = { ...updated[idx], email: e.target.value };
                      setCorrectRecipients(updated);
                    }}
                    placeholder="Email"
                  />
                  <select
                    className="border rounded px-2 py-1.5 text-xs"
                    value={rec.role}
                    onChange={(e) => {
                      const updated = [...correctRecipients];
                      updated[idx] = { ...updated[idx], role: e.target.value };
                      setCorrectRecipients(updated);
                    }}
                  >
                    <option value="signer">Signer</option>
                    <option value="cc">CC</option>
                  </select>
                  {rec.status !== 'signed' && (
                    <button
                      onClick={() => setCorrectRecipients(correctRecipients.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newRec = {
                    id: `rec_new_${Date.now()}`,
                    name: '',
                    email: '',
                    role: 'signer',
                    routingOrder: correctRecipients.length + 1,
                    status: 'created',
                    signedAt: null,
                    viewedAt: null,
                    deliveredAt: null,
                    declinedAt: null,
                    declineReason: null
                  };
                  setCorrectRecipients([...correctRecipients, newRec]);
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Recipient
              </button>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowCorrectModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button onClick={handleCorrect} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeDetail;
