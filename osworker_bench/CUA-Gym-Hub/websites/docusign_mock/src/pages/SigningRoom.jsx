import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import SignatureCanvas from 'react-signature-canvas';
import { ArrowLeft, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { downloadEnvelopeCopy, getRecipientColor } from '../lib/utils';
import { format } from 'date-fns';

const CURSIVE_FONTS = [
  { name: 'Brush Script MT, cursive', label: 'Brush Script' },
  { name: 'Georgia, serif', label: 'Georgia' },
  { name: '"Palatino Linotype", serif', label: 'Palatino' },
  { name: '"Lucida Handwriting", cursive, serif', label: 'Lucida' },
];

const SigningRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, signEnvelope } = useStore();
  const { addToast } = useToast();
  const [envelope, setEnvelope] = useState(null);
  const [currentRecipientId, setCurrentRecipientId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [adoptionTab, setAdoptionTab] = useState('type');
  const [selectedFont, setSelectedFont] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [textInputValue, setTextInputValue] = useState('');

  const sigPad = useRef({});

  useEffect(() => {
    const found = state.envelopes.find(e => e.id === id);
    if (found) {
      setEnvelope(found);
      const recipient = found.recipients.find(r => r.role === 'signer' && r.status !== 'signed');
      if (recipient) {
        setCurrentRecipientId(recipient.id);
      } else {
        setCurrentRecipientId(found.recipients[0]?.id);
      }
      // Pre-fill existing field values
      const existing = {};
      found.fields.forEach(f => {
        if (f.value) existing[f.id] = f.value;
      });
      setFieldValues(existing);
      // Set initial document
      if (found.documents?.length > 0) {
        setActiveDocumentId(found.documents[0].id);
      }
    }
  }, [id, state.envelopes]);

  const myFields = useMemo(() => {
    if (!envelope || !currentRecipientId) return [];
    return envelope.fields.filter(f => f.recipientId === currentRecipientId);
  }, [envelope, currentRecipientId]);

  const requiredFields = useMemo(() => myFields.filter(f => f.required), [myFields]);

  const completedRequired = useMemo(() =>
    requiredFields.filter(f => {
      if (f.type === 'checkbox') return true;
      return !!fieldValues[f.id];
    }).length,
    [requiredFields, fieldValues]
  );

  const allComplete = completedRequired === requiredFields.length;

  // Navigate to next/prev unfilled required field
  const getUnfilledRequired = () =>
    requiredFields.filter(f => f.type !== 'checkbox' && !fieldValues[f.id]);

  const scrollToField = (field) => {
    const el = document.getElementById(`field-${field.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToNextRequired = () => {
    const unfilled = getUnfilledRequired();
    if (unfilled.length > 0) scrollToField(unfilled[0]);
  };

  const goToPrevRequired = () => {
    const unfilled = getUnfilledRequired();
    if (unfilled.length > 0) scrollToField(unfilled[unfilled.length - 1]);
  };

  const handleFieldClick = (field) => {
    if (field.recipientId !== currentRecipientId) return;
    if (envelope.status === 'completed') return;

    if (field.type === 'dateSigned') {
      setFieldValues(prev => ({
        ...prev,
        [field.id]: format(new Date(), 'MM/dd/yyyy')
      }));
    } else if (field.type === 'name') {
      const rec = envelope.recipients.find(r => r.id === currentRecipientId);
      setFieldValues(prev => ({
        ...prev,
        [field.id]: rec?.name || ''
      }));
    } else if (field.type === 'email') {
      const rec = envelope.recipients.find(r => r.id === currentRecipientId);
      setFieldValues(prev => ({
        ...prev,
        [field.id]: rec?.email || ''
      }));
    } else if (field.type === 'company') {
      setFieldValues(prev => ({
        ...prev,
        [field.id]: state.user.company || ''
      }));
    } else if (field.type === 'title') {
      setFieldValues(prev => ({
        ...prev,
        [field.id]: state.user.title || ''
      }));
    } else if (field.type === 'checkbox') {
      setFieldValues(prev => ({
        ...prev,
        [field.id]: !prev[field.id]
      }));
    } else if (field.type === 'dropdown') {
      setActiveField(field);
      setAdoptionTab('dropdown');
    } else {
      setActiveField(field);
      setTextInputValue(fieldValues[field.id] || '');
      setAdoptionTab(field.type === 'signature' || field.type === 'initial' ? 'type' : 'text');
    }
  };

  const generateTypedSignature = (text, fontIdx) => {
    try {
      const canvas = document.createElement('canvas');
      const isInitials = text.length <= 4;
      canvas.width = isInitials ? 80 : 200;
      canvas.height = isInitials ? 40 : 50;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const fontSize = isInitials ? 22 : 28;
      ctx.font = `italic ${fontSize}px ${CURSIVE_FONTS[fontIdx].name}`;
      ctx.fillStyle = '#000080';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 5, canvas.height / 2);
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  };

  const saveTypedSignature = () => {
    if (!activeField) return;
    const rec = envelope.recipients.find(r => r.id === currentRecipientId);
    const text = activeField.type === 'initial'
      ? (rec?.name || '').split(' ').map(n => n[0]).join('')
      : (rec?.name || '');
    const dataUrl = generateTypedSignature(text, selectedFont);
    if (dataUrl) {
      setFieldValues(prev => ({ ...prev, [activeField.id]: dataUrl }));
    }
    setActiveField(null);
  };

  const saveDrawnSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataUrl = sigPad.current.toDataURL();
      setFieldValues(prev => ({ ...prev, [activeField.id]: dataUrl }));
    }
    setActiveField(null);
  };

  const saveTextValue = (text) => {
    setFieldValues(prev => ({ ...prev, [activeField.id]: text }));
    setActiveField(null);
    setTextInputValue('');
  };

  const handleFinish = () => {
    const missing = requiredFields.filter(f => {
      if (f.type === 'checkbox') return false;
      return !fieldValues[f.id];
    });

    if (missing.length > 0) {
      scrollToField(missing[0]);
      return;
    }

    signEnvelope(id, currentRecipientId, fieldValues);
    setShowCompletion(true);
  };

  if (!envelope) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

  const currentRecipient = envelope.recipients.find(r => r.id === currentRecipientId);
  const isCompleted = envelope.status === 'completed';
  const activeDocObj = envelope.documents?.find(d => d.id === activeDocumentId) || envelope.documents?.[0];
  // Only show fields belonging to the active document
  const visibleFields = envelope.fields.filter(f =>
    !f.documentId || f.documentId === (activeDocObj?.id)
  );

  // Completion screen
  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Document Signed Successfully!</h1>
          <p className="text-gray-500 mb-8">You will receive a copy via email.</p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => {
                downloadEnvelopeCopy(envelope, 'signed copy');
                addToast('Document downloaded', 'success');
              }}
              className="px-6 py-3 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download a Copy
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1A3763] text-white rounded-md text-sm font-medium hover:bg-[#15305a]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="h-14 bg-[#1A3763] text-white flex items-center justify-between px-6 shadow-md z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="hover:bg-white/10 p-2 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-sm truncate max-w-md">{envelope.subject}</h1>
        </div>
        <div className="flex items-center gap-4">
          {isCompleted ? (
            <span className="bg-green-500 px-3 py-1 rounded text-sm font-bold">COMPLETED</span>
          ) : (
            <>
              <div className="text-sm text-blue-200">
                Signing as: <span className="font-bold text-white">{currentRecipient?.name}</span>
              </div>
              <button
                onClick={handleFinish}
                disabled={!allComplete}
                className={`px-6 py-2 rounded font-bold text-sm transition-colors ${
                  allComplete
                    ? 'bg-[#FFC829] hover:bg-[#e6b424] text-gray-900'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Finish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Bar */}
      {!isCompleted && (
        <div className="bg-[#FFF3CD] text-[#856404] px-6 py-2 flex items-center gap-2 text-sm border-b border-[#FFE69C] flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Please review the document and complete all required fields.</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
        {/* Multi-document tabs */}
        {envelope.documents?.length > 1 && (
          <div className="flex gap-2 mb-4 self-start">
            {envelope.documents.map((doc, idx) => (
              <button
                key={doc.id}
                onClick={() => setActiveDocumentId(doc.id)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1 ${
                  activeDocumentId === doc.id
                    ? 'bg-[#1A3763] text-white border-[#1A3763]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">{idx + 1}.</span> {doc.name}
              </button>
            ))}
          </div>
        )}

        <div className="relative bg-white shadow-2xl" style={{ width: '800px', minHeight: '1100px' }}>
          {activeDocObj && (
            <img
              src={activeDocObj.fileUrl}
              alt="Document"
              className="w-full h-auto pointer-events-none select-none"
              style={{ minHeight: '1100px' }}
            />
          )}

          {/* Render Fields for active document */}
          {visibleFields.map(field => {
            const isMyField = field.recipientId === currentRecipientId;
            const hasValue = fieldValues[field.id] || field.value;
            const rIdx = envelope.recipients.findIndex(r => r.id === field.recipientId);
            const colors = getRecipientColor(rIdx >= 0 ? rIdx : 0);
            const isUnfilled = isMyField && field.required && !hasValue && field.type !== 'checkbox';

            return (
              <div
                key={field.id}
                id={`field-${field.id}`}
                onClick={() => handleFieldClick(field)}
                className={`absolute flex items-center justify-center border transition-all
                  ${isMyField && !isCompleted ? 'cursor-pointer hover:ring-2 ring-offset-1 ring-blue-500' : ''}
                  ${hasValue ? 'bg-transparent border-transparent' : `${colors.bg} ${colors.border}`}
                  ${isUnfilled ? 'animate-pulse' : ''}
                `}
                style={{
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  height: field.height,
                  zIndex: 10
                }}
              >
                {hasValue ? (
                  field.type === 'signature' || field.type === 'initial' ? (
                    <img src={typeof hasValue === 'string' ? hasValue : ''} alt="Signature" className="h-full w-auto object-contain" />
                  ) : field.type === 'checkbox' ? (
                    hasValue ? <CheckCircle className="w-full h-full text-blue-900" /> : <div className="w-full h-full border border-gray-400" />
                  ) : (
                    <span className="text-blue-900 text-sm font-medium truncate px-1">{typeof hasValue === 'string' ? hasValue : ''}</span>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full opacity-70">
                    {field.required && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
                    <span className={`text-[10px] uppercase font-bold ${colors.text}`}>
                      {field.type === 'dateSigned' ? 'DATE' : field.type}
                    </span>
                    {isMyField && !isCompleted && <div className="text-[8px] text-gray-500">(Click)</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar - Required Field Navigation */}
      {!isCompleted && (
        <div className="h-12 bg-white border-t flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={goToPrevRequired} className="p-1 text-gray-500 hover:text-gray-900" title="Previous field">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToNextRequired} className="p-1 text-gray-500 hover:text-gray-900" title="Next field">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${requiredFields.length > 0 ? (completedRequired / requiredFields.length) * 100 : 0}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${allComplete ? 'text-green-600' : 'text-gray-600'}`}>
              {allComplete ? (
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> All fields complete!</span>
              ) : (
                `${completedRequired} of ${requiredFields.length} required fields`
              )}
            </span>
          </div>
        </div>
      )}

      {/* Adoption / Input Modal */}
      {activeField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {activeField.type === 'signature' ? 'Adopt Your Signature' :
                 activeField.type === 'initial' ? 'Adopt Your Initials' : 'Enter Value'}
              </h3>
              <button onClick={() => setActiveField(null)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature / Initial tabs */}
            {(activeField.type === 'signature' || activeField.type === 'initial') && (
              <>
                <div className="flex border-b">
                  {['type', 'draw', 'upload'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAdoptionTab(tab)}
                      className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                        adoptionTab === tab
                          ? 'text-blue-700 border-b-2 border-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Type Tab */}
                  {adoptionTab === 'type' && (
                    <div className="space-y-3">
                      {CURSIVE_FONTS.map((font, idx) => {
                        const rec = envelope.recipients.find(r => r.id === currentRecipientId);
                        const displayText = activeField.type === 'initial'
                          ? (rec?.name || '').split(' ').map(n => n[0]).join('')
                          : (rec?.name || '');
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedFont(idx)}
                            className={`w-full p-4 border rounded-lg text-left transition-colors ${
                              selectedFont === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span
                              style={{ fontFamily: font.name, fontSize: activeField.type === 'initial' ? '22px' : '28px', fontStyle: 'italic', color: '#000080' }}
                            >
                              {displayText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Draw Tab */}
                  {adoptionTab === 'draw' && (
                    <div>
                      <div className="border-2 border-dashed border-gray-300 rounded bg-gray-50 h-40 relative">
                        <SignatureCanvas
                          ref={sigPad}
                          penColor="black"
                          canvasProps={{ className: 'w-full h-full' }}
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none">Draw here</div>
                      </div>
                      <button
                        onClick={() => sigPad.current && sigPad.current.clear()}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Upload Tab */}
                  {adoptionTab === 'upload' && (
                    <div className="text-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-3">Upload an image of your signature</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setFieldValues(prev => ({ ...prev, [activeField.id]: ev.target.result }));
                                  setActiveField(null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => setActiveField(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm">Cancel</button>
                  {adoptionTab === 'type' && (
                    <button onClick={saveTypedSignature} className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium">
                      Adopt and Sign
                    </button>
                  )}
                  {adoptionTab === 'draw' && (
                    <button onClick={saveDrawnSignature} className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium">
                      Adopt and Sign
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Text input for non-signature fields */}
            {activeField.type !== 'signature' && activeField.type !== 'initial' && activeField.type !== 'dropdown' && (
              <>
                <div className="p-6">
                  <input
                    autoFocus
                    type="text"
                    className="w-full border rounded-lg p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${activeField.label || activeField.type}...`}
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTextValue(textInputValue);
                    }}
                  />
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => setActiveField(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm">Cancel</button>
                  <button
                    onClick={() => saveTextValue(textInputValue)}
                    className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {/* Dropdown field */}
            {activeField.type === 'dropdown' && (
              <>
                <div className="p-6">
                  <label className="block text-sm text-gray-600 mb-2">Select an option:</label>
                  <select
                    autoFocus
                    className="w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500"
                    value={fieldValues[activeField.id] || ''}
                    onChange={(e) => setFieldValues(prev => ({ ...prev, [activeField.id]: e.target.value }))}
                  >
                    <option value="">-- Select --</option>
                    {(activeField.dropdownOptions || []).map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => setActiveField(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm">Cancel</button>
                  <button
                    onClick={() => {
                      const val = fieldValues[activeField.id];
                      if (val) saveTextValue(val);
                      else setActiveField(null);
                    }}
                    className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SigningRoom;
