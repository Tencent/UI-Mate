import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, Clock, AlertTriangle, CheckCircle, ChevronDown, X } from 'lucide-react';

const FEATURE_INFO = [
  {
    title: 'Comments',
    description: 'Add comments to envelopes for better collaboration with your team.',
    detail: 'You can now add inline comments to any envelope to communicate with co-senders, reviewers, or recipients without leaving XocuSign. Comments are visible to all parties with access to the envelope.'
  },
  {
    title: 'Bulk Send for Multiple Recipients',
    description: 'Send the same document to many recipients at once with personalized fields.',
    detail: 'With Bulk Send, upload a CSV of recipient information and send personalized copies of your document to hundreds of signers simultaneously. Each recipient gets their own unique link and signing experience.'
  },
  {
    title: 'Template Sorting',
    description: 'Sort your templates by name, date, or usage to find what you need faster.',
    detail: 'Organize your template library with flexible sorting and filtering options. Sort by name, creation date, last used, or usage count to quickly locate the right template for any situation.'
  }
];

const Home = () => {
  const { state, createEnvelope, createFromTemplate } = useStore();
  const navigate = useNavigate();
  const [startOpen, setStartOpen] = useState(false);
  const [featureModal, setFeatureModal] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const envelopes = state.envelopes;
  const user = state.user;

  // Compute counts
  const actionRequired = envelopes.filter(e =>
    (e.status === 'sent' || e.status === 'delivered') &&
    e.recipients.some(r => r.email === user.email && r.status !== 'signed')
  ).length;
  const waitingForOthers = envelopes.filter(e =>
    (e.status === 'sent' || e.status === 'delivered' || e.status === 'signed') &&
    e.senderId === user.id
  ).length;
  const expiringSoon = envelopes.filter(e => {
    if (!e.expiresAt || e.status === 'completed' || e.status === 'voided' || e.status === 'declined') return false;
    const days = (new Date(e.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days > 0;
  }).length;
  const completed = envelopes.filter(e => e.status === 'completed').length;

  const handleSendEnvelope = () => {
    setStartOpen(false);
    const id = createEnvelope({ subject: 'New Envelope' });
    navigate(`/prepare/${id}`);
  };

  const handleUseTemplate = () => {
    setStartOpen(false);
    navigate('/templates');
  };

  const handleSignDocument = () => {
    setStartOpen(false);
    const actionable = envelopes.find(e =>
      (e.status === 'sent' || e.status === 'delivered') &&
      e.recipients.some(r => r.email === user.email && r.status !== 'signed')
    );
    if (actionable) {
      navigate(`/sign/${actionable.id}`);
    } else {
      navigate('/agreements/inbox');
    }
  };

  const overviewRows = [
    { label: 'Action Required', count: actionRequired, icon: AlertCircle, iconColor: 'text-blue-600', bgColor: 'bg-blue-50', folder: 'action-required' },
    { label: 'Waiting for Others', count: waitingForOthers, icon: Clock, iconColor: 'text-gray-500', bgColor: 'bg-gray-50', folder: 'waiting' },
    { label: 'Expiring Soon', count: expiringSoon, icon: AlertTriangle, iconColor: 'text-red-500', bgColor: 'bg-red-50', folder: 'expiring' },
    { label: 'Completed', count: completed, icon: CheckCircle, iconColor: 'text-green-500', bgColor: 'bg-green-50', folder: 'completed' },
  ];

  const memberDate = new Date(user.memberSince);
  const memberMonthYear = memberDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1A3763] to-[#2D5FA0] px-8 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sign or Get Signatures</h1>
            <p className="text-blue-200 text-sm">Send documents, collect signatures, and track your agreements</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setStartOpen(!startOpen)}
              className="bg-[#FFC829] hover:bg-[#e6b424] text-gray-900 font-bold px-8 py-3 rounded-md flex items-center transition-colors shadow-lg"
            >
              Start
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            {startOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">
                <button
                  onClick={handleSendEnvelope}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-800 border-b"
                >
                  Send an Envelope
                </button>
                <button
                  onClick={handleUseTemplate}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-800 border-b"
                >
                  Use a Template
                </button>
                <button
                  onClick={handleSignDocument}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-800"
                >
                  Sign a Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="max-w-6xl mx-auto w-full px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left - Overview */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            {overviewRows.map((row, idx) => (
              <button
                key={row.label}
                onClick={() => navigate(`/agreements/${row.folder}`)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${idx < overviewRows.length - 1 ? 'border-b' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.bgColor} mr-3`}>
                    <row.icon className={`w-4 h-4 ${row.iconColor}`} />
                  </div>
                  <span className="text-sm text-gray-700">{row.label}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2">{row.count}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - What's New */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">What's New</h2>
          <div className="bg-white rounded-lg border shadow-sm divide-y">
            {FEATURE_INFO.map(f => (
              <div key={f.title} className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{f.description}</p>
                <button
                  onClick={() => setFeatureModal(f)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  More Info
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right - My XocuSign ID */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">My XocuSign ID</h2>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex items-center mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full border-2 border-gray-200 mr-3"
              />
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Title</span>
                <span className="text-gray-900 font-medium">{user.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Company</span>
                <span className="text-gray-900 font-medium">{user.company}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since</span>
                <span className="text-gray-900 font-medium">{memberMonthYear}</span>
              </div>
            </div>
            {user.signatureDataUrl && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Signature</p>
                <div className="bg-gray-50 rounded p-2 flex items-center justify-center">
                  <img src={user.signatureDataUrl} alt="Signature" className="h-8 object-contain" />
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Feature Info Modal */}
      {featureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[420px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">{featureModal.title}</h3>
              <button onClick={() => setFeatureModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">{featureModal.detail}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setFeatureModal(null)} className="px-4 py-2 text-sm bg-[#1A3763] text-white rounded-md hover:bg-[#15305a]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
