import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const EditLabelModal = ({ label, onSave, onClose }) => {
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Edit label</h3>
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Label name</label>
          <input
            autoFocus
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#1a73e8]"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-2 block">Label color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'w-6 h-6 rounded-full border-2',
                  color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button
            disabled={!name.trim()}
            onClick={() => { if (name.trim()) onSave(name.trim(), color); }}
            className="px-4 py-1.5 text-sm bg-[#1a73e8] text-white rounded hover:bg-[#1558b0] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteLabelModal = ({ label, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-xl shadow-xl p-6 w-80">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
        <h3 className="text-base font-semibold text-gray-800">Delete label</h3>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Delete label <span className="font-semibold">&ldquo;{label.name}&rdquo;</span>?
      </p>
      <p className="text-xs text-gray-500 mb-6">
        Emails with this label will keep their content. Only the label will be removed.
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { state, createLabel, updateLabel, deleteLabel, updateSettings, settings, showToast } = useStore();
  const [activeTab, setActiveTab] = useState('general');

  // General tab local state (pre-populated from persisted settings)
  const [density, setDensity] = useState(settings.density || 'default');
  const [undoSend, setUndoSend] = useState(settings.undoSend || 10);
  const [signature, setSignature] = useState(settings.signature || '--\nDemo User\ndemo@example.com');

  // Inbox tab local state
  const [categoryTabs, setCategoryTabs] = useState(() => ({
    primary: true, social: true, promotions: true, updates: false, forums: false,
    ...settings.categoryTabs
  }));

  // Accounts tab local state
  const [replyBehavior, setReplyBehavior] = useState(settings.replyBehavior || 'Reply');
  const [language, setLanguage] = useState(settings.language || 'English (US)');

  // Saved confirmation flash
  const [savedFlash, setSavedFlash] = useState(false);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'labels', label: 'Labels' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'accounts', label: 'Accounts' },
  ];

  const systemLabels = [
    { id: 'sys_inbox', name: 'Inbox' },
    { id: 'sys_starred', name: 'Starred' },
    { id: 'sys_important', name: 'Important' },
    { id: 'sys_sent', name: 'Sent' },
    { id: 'sys_drafts', name: 'Drafts' },
    { id: 'sys_snoozed', name: 'Snoozed' },
    { id: 'sys_spam', name: 'Spam' },
    { id: 'sys_trash', name: 'Trash' },
    { id: 'sys_allmail', name: 'All Mail' },
  ];

  const [sysLabelShown, setSysLabelShown] = useState(() => ({
    ...Object.fromEntries(systemLabels.map(l => [l.id, true])),
    ...(settings.sysLabelShown || {}),
  }));

  const [userLabelShown, setUserLabelShown] = useState(() => ({
    ...Object.fromEntries(state.labels.map(l => [l.id, true])),
    ...(settings.userLabelShown || {}),
  }));

  // Label editing/deleting modal state
  const [editingLabel, setEditingLabel] = useState(null);
  const [deletingLabel, setDeletingLabel] = useState(null);

  const handleSaveGeneral = () => {
    updateSettings({ density, undoSend, signature });
    setSavedFlash(true);
    showToast('Settings saved');
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveInbox = () => {
    updateSettings({ categoryTabs });
    setSavedFlash(true);
    showToast('Inbox settings saved');
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveLabelVisibility = () => {
    updateSettings({ sysLabelShown, userLabelShown });
    showToast('Label visibility saved');
  };

  const handleSaveAccounts = () => {
    updateSettings({ replyBehavior, language });
    showToast('Account settings saved');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {editingLabel && (
        <EditLabelModal
          label={editingLabel}
          onSave={(name, color) => {
            updateLabel(editingLabel.id, { name, color });
            setEditingLabel(null);
            showToast('Label updated');
          }}
          onClose={() => setEditingLabel(null)}
        />
      )}
      {deletingLabel && (
        <DeleteLabelModal
          label={deletingLabel}
          onConfirm={() => {
            deleteLabel(deletingLabel.id);
            showToast(`Label "${deletingLabel.name}" deleted`);
            setDeletingLabel(null);
          }}
          onClose={() => setDeletingLabel(null)}
        />
      )}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#1a73e8] hover:text-[#1558b0] mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back to inbox
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-[#1a73e8] text-[#1a73e8]"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Display density</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'default', label: 'Default', desc: 'Comfortable viewing with standard spacing' },
                      { id: 'comfortable', label: 'Comfortable', desc: 'Extra padding for easier reading' },
                      { id: 'compact', label: 'Compact', desc: 'More emails visible at once' },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="density"
                          value={opt.id}
                          checked={density === opt.id}
                          onChange={() => setDensity(opt.id)}
                          className="mt-0.5 text-[#1a73e8]"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-500">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Undo Send</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Send cancellation period:</span>
                    <select
                      value={undoSend}
                      onChange={e => setUndoSend(Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#1a73e8]"
                    >
                      {[5, 10, 20, 30].map(n => (
                        <option key={n} value={n}>{n} seconds</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Signature</h3>
                  <textarea
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#1a73e8] resize-y"
                    placeholder="No signature"
                  />
                  <p className="text-xs text-gray-500 mt-1">Appended at the end of all outgoing messages</p>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-end items-center gap-4">
                  {savedFlash && <span className="text-sm text-green-600 font-medium">Saved!</span>}
                  <button
                    className="px-6 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded hover:bg-[#1558b0] transition-colors"
                    onClick={handleSaveGeneral}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'labels' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">System labels</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-gray-500 font-medium">Label name</th>
                      <th className="text-left pb-2 text-gray-500 font-medium w-32">Show in label list</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLabels.map(label => (
                      <tr key={label.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{label.name}</td>
                        <td className="py-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sysLabelShown[label.id] ?? true}
                              onChange={e => {
                                const updated = { ...sysLabelShown, [label.id]: e.target.checked };
                                setSysLabelShown(updated);
                                updateSettings({ sysLabelShown: updated });
                              }}
                              className="text-[#1a73e8]"
                            />
                            <span className="text-xs text-gray-600">{(sysLabelShown[label.id] ?? true) ? 'show' : 'hide'}</span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {state.labels.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-800 mt-8 mb-4">User labels</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left pb-2 text-gray-500 font-medium">Label name</th>
                          <th className="text-left pb-2 text-gray-500 font-medium w-32">Show in label list</th>
                          <th className="text-left pb-2 text-gray-500 font-medium w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.labels.map(label => (
                          <tr key={label.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                                <span className="text-gray-700">{label.name}</span>
                              </div>
                            </td>
                            <td className="py-2">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={userLabelShown[label.id] ?? true}
                                  onChange={e => {
                                    const updated = { ...userLabelShown, [label.id]: e.target.checked };
                                    setUserLabelShown(updated);
                                    updateSettings({ userLabelShown: updated });
                                  }}
                                  className="text-[#1a73e8]"
                                />
                                <span className="text-xs text-gray-600">{(userLabelShown[label.id] ?? true) ? 'show' : 'hide'}</span>
                              </label>
                            </td>
                            <td className="py-2">
                              <button
                                className="text-xs text-[#1a73e8] hover:underline mr-2"
                                onClick={() => setEditingLabel(label)}
                              >
                                edit
                              </button>
                              <button
                                className="text-xs text-red-500 hover:underline"
                                onClick={() => setDeletingLabel(label)}
                              >
                                delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {state.labels.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No user labels yet. Create labels from the sidebar.</p>
                )}
              </div>
            )}

            {activeTab === 'inbox' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Inbox type</h3>
                <p className="text-sm text-gray-500 mb-6">Choose which category tabs to show. Primary is always enabled.</p>

                <div className="space-y-4">
                  {[
                    { id: 'primary', label: 'Primary', desc: "Person-to-person conversations and messages that don't appear in other tabs", disabled: true },
                    { id: 'social', label: 'Social', desc: 'Messages from social networks, media-sharing sites, online dating services, and other social websites' },
                    { id: 'promotions', label: 'Promotions', desc: 'Deals, offers, and other marketing emails' },
                    { id: 'updates', label: 'Updates', desc: 'Personal, auto-generated updates including confirmations, receipts, bills, and statements' },
                    { id: 'forums', label: 'Forums', desc: 'Messages from online groups, discussion boards, and mailing lists' },
                  ].map(tab => (
                    <label key={tab.id} className={cn("flex items-start gap-3", tab.disabled ? "opacity-60" : "cursor-pointer")}>
                      <input
                        type="checkbox"
                        checked={categoryTabs[tab.id]}
                        disabled={tab.disabled}
                        onChange={e => setCategoryTabs(prev => ({ ...prev, [tab.id]: e.target.checked }))}
                        className="mt-0.5 text-[#1a73e8]"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{tab.label}</div>
                        <div className="text-xs text-gray-500">{tab.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex justify-end items-center gap-4">
                  {savedFlash && <span className="text-sm text-green-600 font-medium">Saved!</span>}
                  <button
                    className="px-6 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded hover:bg-[#1558b0] transition-colors"
                    onClick={handleSaveInbox}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Account info</h3>

                <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
                  <img
                    src={state.user.avatar}
                    alt={state.user.username}
                    className="w-16 h-16 rounded-full border border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-base">{state.user.username}</p>
                    <p className="text-sm text-gray-500">{state.user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Google Account</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Default reply behavior</p>
                      <p className="text-xs text-gray-500">Reply vs Reply all default action</p>
                    </div>
                    <select
                      value={replyBehavior}
                      onChange={e => setReplyBehavior(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#1a73e8]"
                    >
                      <option>Reply</option>
                      <option>Reply all</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Language</p>
                      <p className="text-xs text-gray-500">Display language for Xmail</p>
                    </div>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#1a73e8]"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="px-6 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded hover:bg-[#1558b0] transition-colors"
                    onClick={handleSaveAccounts}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
