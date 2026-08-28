import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import SignatureCanvas from 'react-signature-canvas';
import { User, PenTool, Check, X } from 'lucide-react';

const CURSIVE_FONTS = [
  { name: 'Brush Script MT, cursive', label: 'Brush Script' },
  { name: 'Georgia, serif', label: 'Georgia' },
  { name: '"Palatino Linotype", serif', label: 'Palatino' },
  { name: '"Lucida Handwriting", cursive, serif', label: 'Lucida' },
];

const Settings = () => {
  const { state, updateUser } = useStore();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: state.user.name,
    email: state.user.email,
    title: state.user.title,
    company: state.user.company,
  });
  const [saved, setSaved] = useState(false);

  // Adoption modal state
  const [adoptionModal, setAdoptionModal] = useState(null); // null | 'signature' | 'initials'
  const [adoptionTab, setAdoptionTab] = useState('type');
  const [selectedFont, setSelectedFont] = useState(0);
  const sigPad = useRef({});

  const handleSave = () => {
    updateUser({
      name: form.name,
      title: form.title,
      company: form.company,
    });
    setSaved(true);
    addToast('Settings saved', 'success');
    setTimeout(() => setSaved(false), 3000);
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

  const getDisplayText = () => {
    const userName = form.name || state.user.name || '';
    if (adoptionModal === 'initials') {
      return userName.split(' ').map(n => n[0]).join('');
    }
    return userName;
  };

  const openAdoptionModal = (type) => {
    setAdoptionModal(type);
    setAdoptionTab('type');
    setSelectedFont(0);
  };

  const closeAdoptionModal = () => {
    setAdoptionModal(null);
  };

  const saveTypedAdoption = () => {
    const text = getDisplayText();
    const dataUrl = generateTypedSignature(text, selectedFont);
    if (dataUrl) {
      if (adoptionModal === 'signature') {
        updateUser({ signatureDataUrl: dataUrl });
        addToast('Signature updated', 'success');
      } else {
        updateUser({ initialsDataUrl: dataUrl });
        addToast('Initials updated', 'success');
      }
    }
    closeAdoptionModal();
  };

  const saveDrawnAdoption = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataUrl = sigPad.current.toDataURL();
      if (adoptionModal === 'signature') {
        updateUser({ signatureDataUrl: dataUrl });
        addToast('Signature updated', 'success');
      } else {
        updateUser({ initialsDataUrl: dataUrl });
        addToast('Initials updated', 'success');
      }
    }
    closeAdoptionModal();
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (adoptionModal === 'signature') {
          updateUser({ signatureDataUrl: ev.target.result });
          addToast('Signature updated', 'success');
        } else {
          updateUser({ initialsDataUrl: ev.target.result });
          addToast('Initials updated', 'success');
        }
        closeAdoptionModal();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Profile Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="settings-name"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="settings-email"
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
              value={form.email}
              readOnly
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label htmlFor="settings-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="settings-title"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="settings-company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              id="settings-company"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Signature</h2>
        </div>
        {state.user.signatureDataUrl ? (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center border mb-3">
            <img src={state.user.signatureDataUrl} alt="Signature" className="h-12 object-contain" />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500 border mb-3">
            No signature adopted yet
          </div>
        )}
        <button
          onClick={() => openAdoptionModal('signature')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Change Signature
        </button>
      </div>

      {/* Initials Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Initials</h2>
        </div>
        {state.user.initialsDataUrl ? (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center border mb-3">
            <img src={state.user.initialsDataUrl} alt="Initials" className="h-10 object-contain" />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500 border mb-3">
            No initials adopted yet
          </div>
        )}
        <button
          onClick={() => openAdoptionModal('initials')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Change Initials
        </button>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-[#1A3763] hover:bg-[#15305a] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Save Changes
        </button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Settings saved
          </span>
        )}
      </div>

      {/* Adoption Modal */}
      {adoptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {adoptionModal === 'signature' ? 'Adopt Your Signature' : 'Adopt Your Initials'}
              </h3>
              <button onClick={closeAdoptionModal} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
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
                    const displayText = getDisplayText();
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedFont(idx)}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          selectedFont === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          style={{
                            fontFamily: font.name,
                            fontSize: adoptionModal === 'initials' ? '22px' : '28px',
                            fontStyle: 'italic',
                            color: '#000080'
                          }}
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
                    <p className="text-sm text-gray-500 mb-3">
                      Upload an image of your {adoptionModal === 'signature' ? 'signature' : 'initials'}
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeAdoptionModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm">
                Cancel
              </button>
              {adoptionTab === 'type' && (
                <button onClick={saveTypedAdoption} className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium">
                  Adopt and Sign
                </button>
              )}
              {adoptionTab === 'draw' && (
                <button onClick={saveDrawnAdoption} className="px-6 py-2 bg-[#1A3763] text-white rounded hover:bg-[#15305a] text-sm font-medium">
                  Adopt and Sign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
