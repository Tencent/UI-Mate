import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, ArrowRight, UserPlus, Type, PenTool, Calendar, CheckSquare,
  Trash2, Send, X, FileText, Upload, ChevronDown,
  Mail, Building, User, Hash, List, ToggleLeft, BookOpen, Search,
  ChevronUp
} from 'lucide-react';
import { getRecipientColor } from '../lib/utils';

const FIELD_TYPES_STANDARD = [
  { type: 'signature', label: 'Signature', icon: PenTool, w: 200, h: 50 },
  { type: 'initial', label: 'Initial', icon: Type, w: 80, h: 40 },
  { type: 'dateSigned', label: 'Date Signed', icon: Calendar, w: 120, h: 30 },
  { type: 'name', label: 'Name', icon: User, w: 150, h: 30 },
  { type: 'email', label: 'Email', icon: Mail, w: 180, h: 30 },
  { type: 'company', label: 'Company', icon: Building, w: 150, h: 30 },
  { type: 'title', label: 'Title', icon: Hash, w: 150, h: 30 },
];

const FIELD_TYPES_DATA = [
  { type: 'text', label: 'Text', icon: Type, w: 150, h: 30 },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, w: 20, h: 20 },
  { type: 'dropdown', label: 'Dropdown', icon: List, w: 150, h: 30 },
];

const ALL_FIELD_TYPES = [...FIELD_TYPES_STANDARD, ...FIELD_TYPES_DATA];

const ROLE_OPTIONS = [
  { value: 'signer', label: 'Needs to Sign' },
  { value: 'cc', label: 'Receives a Copy' },
  { value: 'editor', label: 'Needs to Edit' },
];

const STEPS = ['Add Documents', 'Add Recipients', 'Place Fields'];

const PrepareEnvelope = ({ isTemplate = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateEnvelope, sendEnvelope, createTemplate, updateTemplate, addContact } = useStore();
  const { addToast } = useToast();
  const [envelope, setEnvelope] = useState(null);
  const [step, setStep] = useState(0);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', role: 'signer' });
  const [newRecipientError, setNewRecipientError] = useState('');
  const [selectedField, setSelectedField] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [signingOrder, setSigningOrder] = useState(false);
  const [showContactBook, setShowContactBook] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [saveRecipientToContacts, setSaveRecipientToContacts] = useState(false);
  const fileInputRef = useRef(null);

  // Template mode
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const documentRef = useRef(null);

  useEffect(() => {
    if (isTemplate && id && id !== 'new') {
      // Editing an existing template
      const tmpl = state.templates.find(t => t.id === id);
      if (tmpl) {
        setTemplateName(tmpl.name);
        setTemplateDesc(tmpl.description);
        // Convert template to envelope-like structure for editing
        const envLike = {
          id: tmpl.id,
          subject: tmpl.name,
          message: '',
          documents: tmpl.documents,
          recipients: tmpl.roles.map(r => ({
            id: r.id,
            name: r.name,
            email: '',
            role: r.role,
            routingOrder: r.routingOrder,
            status: 'created'
          })),
          fields: tmpl.fields.map(f => ({
            ...f,
            recipientId: f.roleId || f.recipientId,
            value: '',
            readOnly: false,
            fontSize: 14,
            fontColor: '#000000'
          })),
        };
        setEnvelope(envLike);
        if (tmpl.roles.length > 0) setActiveRecipient(tmpl.roles[0].id);
        if (tmpl.documents.length > 0) setActiveDocumentId(tmpl.documents[0].id);
        setStep(0);
      } else {
        navigate('/templates');
      }
    } else if (isTemplate && id === 'new') {
      setEnvelope({
        id: 'new',
        subject: '',
        message: '',
        documents: [],
        recipients: [],
        fields: [],
      });
      setStep(0);
    } else {
      const found = state.envelopes.find(e => e.id === id);
      if (found) {
        setEnvelope(found);
        setSubject(found.subject);
        setMessage(found.message || '');
        if (found.recipients.length > 0 && !activeRecipient) {
          setActiveRecipient(found.recipients[0].id);
        }
        if (found.documents.length > 0) {
          setActiveDocumentId(found.documents[0].id);
        }
        // Auto-set step based on state
        if (found.documents && found.documents.length > 0 && found.recipients.length > 0) {
          setStep(2);
        } else if (found.documents && found.documents.length > 0) {
          setStep(1);
        }
      } else {
        navigate('/');
      }
    }
  }, [id, isTemplate]);

  // Sync envelope changes to store (for non-template mode)
  useEffect(() => {
    if (envelope && !isTemplate && envelope.id !== 'new') {
      updateEnvelope(envelope.id, {
        documents: envelope.documents,
        recipients: envelope.recipients,
        fields: envelope.fields,
        subject: subject || envelope.subject,
        message,
      });
    }
  }, [envelope?.documents, envelope?.recipients, envelope?.fields, subject, message]);

  const uploadFileToServer = async (file) => {
    try {
      const sid = sessionStorage.getItem('mock_sid');
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.files?.[0] || null;
    } catch (e) {
      return null;
    }
  };

  const processUploadedFile = async (file) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|doc|docx)$/i)) {
      addToast(`Unsupported file type: ${file.name}`, 'error');
      return;
    }
    const uploaded = await uploadFileToServer(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const doc = {
        id: uuidv4(),
        name: file.name,
        pageCount: 1,
        order: (envelope.documents?.length || 0) + 1,
        fileUrl: dataUrl,
        downloadUrl: uploaded?.url || dataUrl,
        fileType: file.name.split('.').pop().toLowerCase() || 'pdf',
        fileSize: uploaded?.size || file.size,
        contentType: uploaded?.content_type || file.type || 'application/octet-stream',
        storedName: uploaded?.stored_name
      };
      setEnvelope(prev => ({
        ...prev,
        documents: [...(prev.documents || []), doc]
      }));
      if (!activeDocumentId) setActiveDocumentId(doc.id);
      addToast(`"${file.name}" uploaded successfully`, 'success');
    };
    reader.onerror = () => addToast(`Failed to read "${file.name}"`, 'error');
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processUploadedFile);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    files.forEach(processUploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const removeDocument = (docId) => {
    setEnvelope(prev => {
      const remaining = prev.documents.filter(d => d.id !== docId);
      return {
        ...prev,
        documents: remaining,
        fields: prev.fields.filter(f => f.documentId !== docId)
      };
    });
    if (activeDocumentId === docId) {
      const remaining = envelope.documents.filter(d => d.id !== docId);
      setActiveDocumentId(remaining[0]?.id || null);
    }
  };

  const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addRecipient = () => {
    if (!newRecipient.name.trim()) {
      setNewRecipientError('Name is required.');
      return;
    }
    if (!isTemplate && !isValidEmail(newRecipient.email)) {
      setNewRecipientError('A valid email address is required.');
      return;
    }
    setNewRecipientError('');
    const recipient = {
      id: uuidv4(),
      name: newRecipient.name.trim(),
      email: newRecipient.email.trim(),
      role: newRecipient.role,
      routingOrder: (envelope.recipients?.length || 0) + 1,
      status: 'created',
      signedAt: null,
      viewedAt: null,
      deliveredAt: null,
      declinedAt: null,
      declineReason: null
    };
    setEnvelope(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), recipient]
    }));
    if (saveRecipientToContacts && !state.contacts.some(c => c.email.toLowerCase() === recipient.email.toLowerCase())) {
      addContact({ name: recipient.name, email: recipient.email });
      addToast(`${recipient.name} saved to contacts`, 'success');
    }
    setNewRecipient({ name: '', email: '', role: 'signer' });
    setSaveRecipientToContacts(false);
    if (!activeRecipient) setActiveRecipient(recipient.id);
  };

  const removeRecipient = (rId) => {
    setEnvelope(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== rId),
      fields: prev.fields.filter(f => f.recipientId !== rId)
    }));
    if (activeRecipient === rId) {
      const remaining = envelope.recipients.filter(r => r.id !== rId);
      setActiveRecipient(remaining[0]?.id || null);
    }
  };

  const moveRecipientUp = (idx) => {
    if (idx === 0) return;
    setEnvelope(prev => {
      const recs = [...prev.recipients];
      [recs[idx - 1], recs[idx]] = [recs[idx], recs[idx - 1]];
      return {
        ...prev,
        recipients: recs.map((r, i) => ({ ...r, routingOrder: i + 1 }))
      };
    });
  };

  const moveRecipientDown = (idx) => {
    if (!envelope || idx >= envelope.recipients.length - 1) return;
    setEnvelope(prev => {
      const recs = [...prev.recipients];
      [recs[idx], recs[idx + 1]] = [recs[idx + 1], recs[idx]];
      return {
        ...prev,
        recipients: recs.map((r, i) => ({ ...r, routingOrder: i + 1 }))
      };
    });
  };

  const addField = (type) => {
    if (!activeRecipient) return;
    const typeConfig = ALL_FIELD_TYPES.find(t => t.type === type) || { w: 150, h: 30 };
    const docId = activeDocumentId || envelope.documents?.[0]?.id || null;
    const field = {
      id: uuidv4(),
      type,
      recipientId: activeRecipient,
      documentId: docId,
      pageNumber: 1,
      x: 50 + ((envelope.fields?.length || 0) * 10) % 300,
      y: 50 + ((envelope.fields?.length || 0) * 30) % 500,
      width: typeConfig.w,
      height: typeConfig.h,
      value: '',
      required: true,
      label: '',
      readOnly: false,
      fontSize: 14,
      fontColor: '#000000',
      dropdownOptions: type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };
    setEnvelope(prev => ({
      ...prev,
      fields: [...(prev.fields || []), field]
    }));
    setSelectedField(field.id);
  };

  const updateFieldPosition = (fieldId, data) => {
    setEnvelope(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, x: data.x, y: data.y } : f
      )
    }));
  };

  const removeField = (fieldId) => {
    setEnvelope(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
    if (selectedField === fieldId) setSelectedField(null);
  };

  const updateFieldProp = (fieldId, prop, value) => {
    setEnvelope(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, [prop]: value } : f
      )
    }));
  };

  const handleSend = () => {
    if (!envelope.documents || envelope.documents.length === 0) {
      addToast('Please add at least one document before sending.', 'error');
      return;
    }
    if (!envelope.recipients || envelope.recipients.length === 0) {
      addToast('Please add at least one recipient.', 'error');
      return;
    }
    // Validate all recipient emails
    const invalidRecipients = envelope.recipients.filter(r => r.role !== 'cc' && !isValidEmail(r.email));
    if (invalidRecipients.length > 0) {
      addToast(`Recipient "${invalidRecipients[0].name}" is missing a valid email address.`, 'error');
      return;
    }
    const signers = envelope.recipients.filter(r => r.role === 'signer');
    if (signers.length === 0) {
      addToast('Please add at least one signer recipient.', 'error');
      return;
    }
    // Warn if no fields placed (non-blocking)
    if (!envelope.fields || envelope.fields.length === 0) {
      addToast('Warning: No fields have been placed. Recipients will have nothing to sign.', 'warning');
    }
    setShowConfirmSend(true);
  };

  const confirmSend = () => {
    if (subject) updateEnvelope(envelope.id, { subject });
    sendEnvelope(envelope.id);
    setShowConfirmSend(false);
    navigate('/agreements/sent');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      addToast('Please enter a template name.', 'error');
      return;
    }
    const templateData = {
      name: templateName,
      description: templateDesc,
      documents: envelope.documents,
      roles: envelope.recipients.map(r => ({
        id: r.id,
        name: r.name,
        role: r.role,
        routingOrder: r.routingOrder
      })),
      fields: envelope.fields.map(f => ({
        ...f,
        roleId: f.recipientId,
      })),
      shared: false
    };
    if (isTemplate && id !== 'new') {
      updateTemplate(id, templateData);
      addToast('Template saved successfully', 'success');
    } else {
      createTemplate(templateData);
      addToast('Template created successfully', 'success');
    }
    navigate('/templates');
  };

  const handleUseTemplate = (tmpl) => {
    setShowTemplateModal(false);
    // Clone documents
    const docMap = {};
    const newDocs = tmpl.documents.map(d => {
      const newId = uuidv4();
      docMap[d.id] = newId;
      return { ...d, id: newId };
    });
    // Clone roles as recipients
    const roleMap = {};
    const newRecipients = tmpl.roles.map((role, idx) => {
      const newId = uuidv4();
      roleMap[role.id] = newId;
      return {
        id: newId,
        name: role.name,
        email: '',
        role: role.role,
        routingOrder: role.routingOrder,
        status: 'created',
        signedAt: null, viewedAt: null, deliveredAt: null, declinedAt: null, declineReason: null
      };
    });
    // Clone fields mapping role IDs -> recipient IDs
    const newFields = tmpl.fields.map(f => ({
      ...f,
      id: uuidv4(),
      recipientId: roleMap[f.roleId] || f.roleId,
      documentId: docMap[f.documentId] || f.documentId,
      value: '',
      readOnly: false,
      fontSize: f.fontSize || 14,
      fontColor: f.fontColor || '#000000'
    }));
    setEnvelope(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...newDocs],
      recipients: [...(prev.recipients || []), ...newRecipients],
      fields: [...(prev.fields || []), ...newFields]
    }));
    if (!activeDocumentId && newDocs.length > 0) setActiveDocumentId(newDocs[0].id);
    if (!activeRecipient && newRecipients.length > 0) setActiveRecipient(newRecipients[0].id);
    addToast(`Template "${tmpl.name}" applied with ${newDocs.length} document(s) and ${newRecipients.length} role(s).`, 'success');
  };

  if (!envelope) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

  const selectedFieldObj = envelope.fields?.find(f => f.id === selectedField);
  const activeDocObj = envelope.documents?.find(d => d.id === activeDocumentId) || envelope.documents?.[0];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Toolbar */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(isTemplate ? '/templates' : '/')}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {isTemplate ? (
            <div className="flex items-center gap-3">
              <input
                className="text-lg font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
              />
            </div>
          ) : (
            <input
              className="text-lg font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 max-w-xs"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Envelope Subject"
            />
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  step === i
                    ? 'bg-[#1A3763] text-white'
                    : step > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {step > i ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-300" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 text-sm bg-[#1A3763] text-white rounded-md hover:bg-[#15305a] flex items-center gap-1"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : isTemplate ? (
            <button
              onClick={handleSaveTemplate}
              className="px-6 py-2 text-sm bg-[#1A3763] text-white rounded-md hover:bg-[#15305a] font-medium"
            >
              Save Template
            </button>
          ) : (
            <button
              onClick={handleSend}
              className="px-6 py-2 text-sm bg-[#FFC829] text-gray-900 rounded-md hover:bg-[#e6b424] font-bold flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        {/* Step 0: Add Documents */}
        {step === 0 && (
          <div className="p-8 max-w-3xl mx-auto overflow-y-auto h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Documents</h2>

            {/* Existing documents */}
            {envelope.documents?.length > 0 && (
              <div className="space-y-3 mb-6">
                {envelope.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 bg-white border rounded-lg p-3">
                    <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.pageCount} page{doc.pageCount !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 cursor-pointer ${
                isDraggingOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDraggingOver ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 mb-1">Drop files here to upload</p>
              <p className="text-xs text-gray-400">or click to browse (PDF, DOC, PNG, JPG)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" /> Use a Template
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Add Recipients */}
        {step === 1 && (
          <div className="p-8 max-w-3xl mx-auto overflow-y-auto h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Recipients</h2>

            {/* Subject */}
            {!isTemplate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter envelope subject"
                />
              </div>
            )}

            {isTemplate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Description</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="Brief description of the template"
                />
              </div>
            )}

            {/* Message */}
            {!isTemplate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message to Recipients</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message for all recipients..."
                />
              </div>
            )}

            {/* Signing order toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSigningOrder(!signingOrder)}
                className={`relative w-10 h-5 rounded-full transition-colors ${signingOrder ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform shadow ${signingOrder ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-gray-700">Set signing order</span>
              {signingOrder && <span className="text-xs text-gray-400">(use arrows to reorder)</span>}
            </div>

            {/* Add recipient form */}
            <div className="bg-white border rounded-lg p-4 mb-4">
              <div className="flex gap-3 items-end flex-wrap">
                {signingOrder && (
                  <div className="w-16">
                    <label className="block text-xs text-gray-500 mb-1">Order</label>
                    <div className="border rounded px-2 py-2 text-sm text-center bg-gray-50 text-gray-600">
                      {(envelope.recipients?.length || 0) + 1}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={newRecipient.name}
                    onChange={(e) => { setNewRecipient({ ...newRecipient, name: e.target.value }); setNewRecipientError(''); }}
                    placeholder={isTemplate ? "Role name (e.g. Signer 1)" : "Recipient name"}
                    onKeyDown={(e) => { if (e.key === 'Enter') addRecipient(); }}
                  />
                </div>
                {!isTemplate && (
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={newRecipient.email}
                      onChange={(e) => { setNewRecipient({ ...newRecipient, email: e.target.value }); setNewRecipientError(''); }}
                      placeholder="Email address"
                      onKeyDown={(e) => { if (e.key === 'Enter') addRecipient(); }}
                    />
                  </div>
                )}
                <div className="w-44">
                  <label className="block text-xs text-gray-500 mb-1">Action</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={newRecipient.role}
                    onChange={(e) => setNewRecipient({ ...newRecipient, role: e.target.value })}
                  >
                    {ROLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addRecipient}
                  className="px-4 py-2 bg-[#1A3763] text-white rounded text-sm font-medium hover:bg-[#15305a] flex-shrink-0"
                >
                  Add
                </button>
                {!isTemplate && (
                  <button
                    onClick={() => setShowContactBook(true)}
                    className="p-2 border rounded text-gray-500 hover:bg-gray-50 hover:text-blue-600 flex-shrink-0"
                    title="Address Book"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!isTemplate && (
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={saveRecipientToContacts}
                    onChange={(e) => setSaveRecipientToContacts(e.target.checked)}
                  />
                  Save to Contacts
                </label>
              )}
              {newRecipientError && (
                <p className="text-xs text-red-600 mt-2">{newRecipientError}</p>
              )}
            </div>

            {/* Recipient list */}
            <div className="space-y-2">
              {envelope.recipients?.map((r, idx) => {
                const colors = getRecipientColor(idx);
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 bg-white border rounded-lg p-3 ${
                      activeRecipient === r.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    }`}
                    onClick={() => setActiveRecipient(r.id)}
                  >
                    {signingOrder && (
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveRecipientUp(idx); }}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveRecipientDown(idx); }}
                          disabled={idx === envelope.recipients.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                         style={{ backgroundColor: colors.pill }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      {r.email && <p className="text-xs text-gray-500">{r.email}</p>}
                    </div>
                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded">
                      {ROLE_OPTIONS.find(o => o.value === r.role)?.label || r.role}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeRecipient(r.id); }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Place Fields */}
        {step === 2 && (
          <div className="flex flex-1 overflow-hidden h-full">
            {/* Left Sidebar - Field Palette */}
            <div className="w-72 bg-white border-r flex flex-col overflow-y-auto flex-shrink-0">
              {/* Recipient selector */}
              <div className="p-3 border-b">
                <label className="block text-xs font-medium text-gray-500 mb-1">Assign fields to:</label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  value={activeRecipient || ''}
                  onChange={(e) => setActiveRecipient(e.target.value)}
                >
                  {envelope.recipients?.map((r, idx) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                  ))}
                </select>
              </div>

              {/* Document selector (if multiple documents) */}
              {envelope.documents?.length > 1 && (
                <div className="p-3 border-b">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Viewing document:</label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    value={activeDocumentId || ''}
                    onChange={(e) => setActiveDocumentId(e.target.value)}
                  >
                    {envelope.documents.map((doc, idx) => (
                      <option key={doc.id} value={doc.id}>{idx + 1}. {doc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Standard Fields */}
              <div className="p-3 border-b">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Standard Fields</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {FIELD_TYPES_STANDARD.map(f => (
                    <button
                      key={f.type}
                      onClick={() => addField(f.type)}
                      disabled={!activeRecipient}
                      className="flex flex-col items-center justify-center p-2 border rounded hover:bg-blue-50 hover:border-blue-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      <f.icon className="w-4 h-4 mb-0.5 text-gray-600" />
                      <span className="text-[10px] text-gray-600">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Fields */}
              <div className="p-3 border-b">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Fields</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {FIELD_TYPES_DATA.map(f => (
                    <button
                      key={f.type}
                      onClick={() => addField(f.type)}
                      disabled={!activeRecipient}
                      className="flex flex-col items-center justify-center p-2 border rounded hover:bg-blue-50 hover:border-blue-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      <f.icon className="w-4 h-4 mb-0.5 text-gray-600" />
                      <span className="text-[10px] text-gray-600">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Document Canvas */}
            <div className="flex-1 bg-gray-200 overflow-auto p-8 flex justify-center relative">
              <div
                ref={documentRef}
                className="bg-white shadow-lg relative"
                style={{ width: '800px', minHeight: '1100px' }}
                onClick={() => setSelectedField(null)}
              >
                {activeDocObj && (
                  <img
                    src={activeDocObj.fileUrl}
                    alt="Document"
                    className="w-full h-auto select-none pointer-events-none"
                    style={{ minHeight: '1100px', objectFit: 'contain', background: '#fff' }}
                  />
                )}
                {!activeDocObj && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No document selected</p>
                    </div>
                  </div>
                )}

                {/* Fields Overlay - only show fields for active document */}
                {envelope.fields?.filter(field => field.documentId === (activeDocObj?.id)).map((field) => {
                  const rIdx = envelope.recipients?.findIndex(r => r.id === field.recipientId) ?? -1;
                  const colors = getRecipientColor(rIdx >= 0 ? rIdx : 0);
                  const isSelected = selectedField === field.id;
                  const fieldLabel = ALL_FIELD_TYPES.find(t => t.type === field.type)?.label || field.type;

                  return (
                    <Draggable
                      key={field.id}
                      bounds="parent"
                      defaultPosition={{ x: field.x, y: field.y }}
                      onStop={(e, data) => updateFieldPosition(field.id, data)}
                      onStart={() => setSelectedField(field.id)}
                    >
                      <div
                        className={`absolute flex items-center justify-center cursor-move group border-2 rounded shadow-sm
                          ${colors.bg} ${colors.border}
                          ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''}
                        `}
                        style={{ width: field.width, height: field.height, zIndex: isSelected ? 20 : 10 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedField(field.id); }}
                      >
                        <span className={`text-[10px] font-medium truncate px-1 ${colors.text}`}>
                          {fieldLabel}
                        </span>
                        {field.required && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </Draggable>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar - Field Properties */}
            {selectedFieldObj && (
              <div className="w-72 bg-white border-l flex-shrink-0 overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Field Properties</h3>
                  <p className="text-xs text-gray-500">
                    {ALL_FIELD_TYPES.find(t => t.type === selectedFieldObj.type)?.label}
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Assigned to</label>
                    <select
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      value={selectedFieldObj.recipientId}
                      onChange={(e) => updateFieldProp(selectedField, 'recipientId', e.target.value)}
                    >
                      {envelope.recipients?.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Document selector for field */}
                  {envelope.documents?.length > 1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">On document</label>
                      <select
                        className="w-full border rounded px-2 py-1.5 text-sm"
                        value={selectedFieldObj.documentId || ''}
                        onChange={(e) => updateFieldProp(selectedField, 'documentId', e.target.value)}
                      >
                        {envelope.documents.map((doc, idx) => (
                          <option key={doc.id} value={doc.id}>{idx + 1}. {doc.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Required</label>
                    <button
                      onClick={() => updateFieldProp(selectedField, 'required', !selectedFieldObj.required)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${selectedFieldObj.required ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform shadow ${selectedFieldObj.required ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label / Tooltip</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      value={selectedFieldObj.label || ''}
                      onChange={(e) => updateFieldProp(selectedField, 'label', e.target.value)}
                      placeholder="Optional label"
                    />
                  </div>
                  {/* Dropdown options editor */}
                  {selectedFieldObj.type === 'dropdown' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Dropdown Options (one per line)</label>
                      <textarea
                        className="w-full border rounded px-2 py-1.5 text-sm"
                        rows={4}
                        value={(selectedFieldObj.dropdownOptions || []).join('\n')}
                        onChange={(e) => {
                          const opts = e.target.value.split('\n').filter(o => o.trim());
                          updateFieldProp(selectedField, 'dropdownOptions', opts);
                        }}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => removeField(selectedField)}
                    className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Field
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[500px] overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Choose a Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto max-h-[360px] divide-y">
              {state.templates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No templates available</div>
              ) : (
                state.templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleUseTemplate(t)}
                    className="w-full text-left px-6 py-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.documents?.length || 0} doc(s), {t.roles?.length || 0} role(s)</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Book Modal */}
      {showContactBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[500px] overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Address Book</h3>
              <button onClick={() => { setShowContactBook(false); setContactSearch(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 border rounded text-sm"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[320px] divide-y">
              {state.contacts
                .filter(c => {
                  if (!contactSearch.trim()) return true;
                  const q = contactSearch.toLowerCase();
                  return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q);
                })
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      const recipient = {
                        id: uuidv4(),
                        name: c.name,
                        email: c.email,
                        role: 'signer',
                        routingOrder: (envelope.recipients?.length || 0) + 1,
                        status: 'created',
                        signedAt: null,
                        viewedAt: null,
                        deliveredAt: null,
                        declinedAt: null,
                        declineReason: null
                      };
                      setEnvelope(prev => ({ ...prev, recipients: [...(prev.recipients || []), recipient] }));
                      if (!activeRecipient) setActiveRecipient(recipient.id);
                      setShowContactBook(false);
                      setContactSearch('');
                    }}
                    className="w-full text-left px-6 py-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.email}{c.company ? ` - ${c.company}` : ''}</p>
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showConfirmSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[440px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Send Envelope</h3>
              <button onClick={() => setShowConfirmSend(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">You are about to send this envelope:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subject</span>
                  <span className="font-medium text-gray-900">{subject || envelope.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Documents</span>
                  <span className="font-medium text-gray-900">{envelope.documents?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipients</span>
                  <span className="font-medium text-gray-900">{envelope.recipients?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fields placed</span>
                  <span className="font-medium text-gray-900">{envelope.fields?.length || 0}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Recipients:</p>
                {envelope.recipients?.map((r, idx) => (
                  <div key={r.id} className="text-sm text-gray-700 flex items-center gap-2 py-1">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">{idx + 1}</span>
                    {r.name} ({ROLE_OPTIONS.find(o => o.value === r.role)?.label || r.role})
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowConfirmSend(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button onClick={confirmSend} className="px-6 py-2 text-sm bg-[#FFC829] text-gray-900 rounded-md hover:bg-[#e6b424] font-bold">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepareEnvelope;
