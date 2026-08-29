import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const SECTIONS = [
  { category: 'USER SETTINGS', items: ['My Account', 'Profiles'] },
  { category: 'APP SETTINGS', items: ['Appearance', 'Accessibility', 'Voice & Video', 'Chat', 'Notifications', 'Keybinds', 'Language'] },
];

export default function UserSettings({ onClose }) {
  const [activeSection, setActiveSection] = useState('My Account');
  const store = useStore();
  const currentUser = store.currentUser;
  const userSettings = store.userSettings || {};

  // Derive persisted settings with defaults
  const theme = userSettings.theme || 'dark';
  const messageDisplay = userSettings.messageDisplay || 'cozy';
  const fontSize = userSettings.fontSize || 16;

  // Inline edit state for account fields
  const [editingField, setEditingField] = useState(null); // 'displayName' | 'username' | 'email' | 'phone'
  const [editFieldValue, setEditFieldValue] = useState('');

  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setEditFieldValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingField) return;
    if (editFieldValue.trim()) {
      if (editingField === 'displayName' || editingField === 'username') {
        store.updateUserProfile({ username: editFieldValue.trim() });
      } else if (editingField === 'email') {
        store.updateUserSettings({ email: editFieldValue.trim() });
      } else if (editingField === 'phone') {
        store.updateUserSettings({ phone: editFieldValue.trim() });
      }
    }
    setEditingField(null);
    setEditFieldValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditFieldValue('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const email = userSettings.email || currentUser.email || 'alex.dev@example.com';
  const phone = userSettings.phone || currentUser.phone || null;

  return (
    <div className="fixed inset-0 z-50 flex bg-xiscord-bg">
      {/* Settings Sidebar */}
      <div className="w-[218px] bg-xiscord-dark flex flex-col items-end overflow-y-auto custom-scrollbar pt-16 pb-8 shrink-0">
        <div className="w-[190px] pr-2">
          {SECTIONS.map(section => (
            <div key={section.category} className="mb-2">
              <div className="text-xs font-bold text-xiscord-muted uppercase px-2.5 py-1.5">{section.category}</div>
              {section.items.map(item => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded text-sm mb-0.5",
                    activeSection === item
                      ? "bg-xiscord-selected text-white"
                      : "text-xiscord-modifier hover:bg-xiscord-light/50 hover:text-xiscord-lightest"
                  )}
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-xiscord-divider my-2 mx-2.5" />
            </div>
          ))}
          <button
            onClick={() => {
              store.updateUserStatus('offline');
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded text-sm text-xiscord-red hover:bg-xiscord-light/50"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 pb-8 px-10 max-w-[740px]">
        {activeSection === 'My Account' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">My Account</h2>
            <div className="bg-xiscord-dark rounded-lg overflow-hidden">
              <div className="h-[100px]" style={{ backgroundColor: currentUser.bannerColor || '#5865F2' }} />
              <div className="px-4 pb-4 relative">
                <div className="flex items-end justify-between -mt-[40px] mb-4">
                  <div className="flex items-end">
                    <div className="w-[80px] h-[80px] rounded-full border-[6px] border-xiscord-dark bg-xiscord-dark overflow-hidden">
                      <img src={currentUser.avatar} alt="" className="w-full h-full rounded-full" />
                    </div>
                    <div className="ml-4 mb-2">
                      <span className="text-xl font-bold text-white">{currentUser.username}</span>
                      <span className="text-xl text-xiscord-muted">#{currentUser.discriminator}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit('displayName', currentUser.username)}
                    className="bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white text-sm font-medium px-4 py-1.5 rounded mb-2"
                  >
                    Edit User Profile
                  </button>
                </div>
                <div className="bg-xiscord-bg rounded-lg p-4 space-y-4">
                  {/* Display Name */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">Display Name</div>
                      {editingField === 'displayName' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editFieldValue}
                            onChange={(e) => setEditFieldValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="bg-xiscord-darker text-xiscord-lightest px-2 py-1 rounded outline-none border border-xiscord-blurple text-sm flex-1"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="text-xs bg-xiscord-blurple text-white px-2 py-1 rounded hover:bg-xiscord-blurple/80">Save</button>
                          <button onClick={cancelEdit} className="text-xs text-xiscord-muted hover:text-white px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="text-sm text-xiscord-lightest">{currentUser.username}</div>
                      )}
                    </div>
                    {editingField !== 'displayName' && (
                      <button
                        onClick={() => startEdit('displayName', currentUser.username)}
                        className="bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-sm px-4 py-1.5 rounded shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {/* Username */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">Username</div>
                      {editingField === 'username' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editFieldValue}
                            onChange={(e) => setEditFieldValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="bg-xiscord-darker text-xiscord-lightest px-2 py-1 rounded outline-none border border-xiscord-blurple text-sm flex-1"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="text-xs bg-xiscord-blurple text-white px-2 py-1 rounded hover:bg-xiscord-blurple/80">Save</button>
                          <button onClick={cancelEdit} className="text-xs text-xiscord-muted hover:text-white px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="text-sm text-xiscord-lightest">{currentUser.username}#{currentUser.discriminator}</div>
                      )}
                    </div>
                    {editingField !== 'username' && (
                      <button
                        onClick={() => startEdit('username', currentUser.username)}
                        className="bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-sm px-4 py-1.5 rounded shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {/* Email */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">Email</div>
                      {editingField === 'email' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={editFieldValue}
                            onChange={(e) => setEditFieldValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="bg-xiscord-darker text-xiscord-lightest px-2 py-1 rounded outline-none border border-xiscord-blurple text-sm flex-1"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="text-xs bg-xiscord-blurple text-white px-2 py-1 rounded hover:bg-xiscord-blurple/80">Save</button>
                          <button onClick={cancelEdit} className="text-xs text-xiscord-muted hover:text-white px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="text-sm text-xiscord-lightest">{email}</div>
                      )}
                    </div>
                    {editingField !== 'email' && (
                      <button
                        onClick={() => startEdit('email', email)}
                        className="bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-sm px-4 py-1.5 rounded shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {/* Phone Number */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">Phone Number</div>
                      {editingField === 'phone' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={editFieldValue}
                            onChange={(e) => setEditFieldValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="bg-xiscord-darker text-xiscord-lightest px-2 py-1 rounded outline-none border border-xiscord-blurple text-sm flex-1"
                            autoFocus
                            placeholder="+1 (555) 000-0000"
                          />
                          <button onClick={saveEdit} className="text-xs bg-xiscord-blurple text-white px-2 py-1 rounded hover:bg-xiscord-blurple/80">Save</button>
                          <button onClick={cancelEdit} className="text-xs text-xiscord-muted hover:text-white px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="text-sm text-xiscord-lightest">{phone || 'Not set'}</div>
                      )}
                    </div>
                    {editingField !== 'phone' && (
                      <button
                        onClick={() => startEdit('phone', phone || '')}
                        className="bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-sm px-4 py-1.5 rounded shrink-0"
                      >
                        {phone ? 'Edit' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'Profiles' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Profiles</h2>
            <div className="space-y-4">
              <div className="bg-xiscord-dark rounded-lg p-4">
                <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">About Me</h3>
                <EditableTextField
                  value={currentUser.aboutMe || ''}
                  placeholder="Tell everyone a little about yourself!"
                  onSave={(val) => store.updateUserProfile({ aboutMe: val })}
                  multiline
                />
              </div>
              <div className="bg-xiscord-dark rounded-lg p-4">
                <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Banner Color</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentUser.bannerColor || '#5865F2'}
                    onChange={(e) => store.updateUserProfile({ bannerColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-sm text-xiscord-lightest">{currentUser.bannerColor || '#5865F2'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'Appearance' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Appearance</h2>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Theme</h3>
              <div className="space-y-2">
                {['Dark', 'Light', 'Onyx', 'Ash'].map(t => (
                  <label
                    key={t}
                    className="flex items-center cursor-pointer group"
                    onClick={() => store.updateUserSettings({ theme: t.toLowerCase() })}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                      theme === t.toLowerCase() ? "border-xiscord-blurple" : "border-xiscord-muted"
                    )}>
                      {theme === t.toLowerCase() && <div className="w-2.5 h-2.5 rounded-full bg-xiscord-blurple" />}
                    </div>
                    <span className="text-xiscord-lightest group-hover:text-white">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Message Display</h3>
              <div className="space-y-2">
                {[{ label: 'Cozy', value: 'cozy', desc: 'Show avatar next to messages' }, { label: 'Compact', value: 'compact', desc: 'Fit more messages on screen' }].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center cursor-pointer group"
                    onClick={() => store.updateUserSettings({ messageDisplay: opt.value })}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                      messageDisplay === opt.value ? "border-xiscord-blurple" : "border-xiscord-muted"
                    )}>
                      {messageDisplay === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-xiscord-blurple" />}
                    </div>
                    <div>
                      <span className="text-xiscord-lightest group-hover:text-white">{opt.label}</span>
                      <span className="text-xs text-xiscord-muted ml-2">— {opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Chat Font Scaling</h3>
              <div className="flex items-center">
                <span className="text-xs text-xiscord-muted mr-3">12px</span>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => store.updateUserSettings({ fontSize: Number(e.target.value) })}
                  className="flex-1 accent-xiscord-blurple"
                />
                <span className="text-xs text-xiscord-muted ml-3">24px</span>
                <span className="text-sm text-xiscord-lightest ml-4 min-w-[40px]">{fontSize}px</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'Accessibility' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Accessibility</h2>
            <div className="space-y-4">
              <PersistedToggle
                label="Reduced Motion"
                desc="Reduces the amount of motion in the UI."
                settingKey="reducedMotion"
                defaultVal={false}
              />
              <PersistedToggle
                label="High Contrast Mode"
                desc="Increases contrast between elements for better readability."
                settingKey="highContrast"
                defaultVal={false}
              />
              <PersistedToggle
                label="Always Show Link Previews"
                desc="Always expand link preview even when you've collapsed it before."
                settingKey="alwaysShowLinkPreviews"
                defaultVal={true}
              />
            </div>
          </div>
        )}

        {activeSection === 'Voice & Video' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Voice & Video</h2>
            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Voice Settings</h3>
              <div className="space-y-4">
                <PersistedToggle
                  label="Echo Cancellation"
                  desc="Reduces echo on your microphone input."
                  settingKey="echoCancellation"
                  defaultVal={true}
                />
                <PersistedToggle
                  label="Noise Suppression"
                  desc="Filters out background noise from your microphone."
                  settingKey="noiseSuppression"
                  defaultVal={true}
                />
                <PersistedToggle
                  label="Automatic Gain Control"
                  desc="Automatically adjusts microphone sensitivity."
                  settingKey="automaticGainControl"
                  defaultVal={true}
                />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Input Volume</h3>
              <input
                type="range"
                min="0"
                max="200"
                value={userSettings.inputVolume ?? 100}
                onChange={(e) => store.updateUserSettings({ inputVolume: Number(e.target.value) })}
                className="w-full accent-xiscord-blurple"
              />
              <div className="text-xs text-xiscord-muted mt-1">{userSettings.inputVolume ?? 100}%</div>
            </div>
            <div className="mb-6">
              <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-3">Output Volume</h3>
              <input
                type="range"
                min="0"
                max="200"
                value={userSettings.outputVolume ?? 100}
                onChange={(e) => store.updateUserSettings({ outputVolume: Number(e.target.value) })}
                className="w-full accent-xiscord-blurple"
              />
              <div className="text-xs text-xiscord-muted mt-1">{userSettings.outputVolume ?? 100}%</div>
            </div>
          </div>
        )}

        {activeSection === 'Notifications' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: 'Enable Desktop Notifications', desc: 'Show notifications on your desktop when Xiscord is in the background', key: 'desktopNotifications', default: true },
                { label: 'Enable Unread Message Badge', desc: 'Show a red badge on the taskbar icon when you have unread messages', key: 'unreadBadge', default: true },
                { label: 'Enable Message Notification Sound', desc: 'Play a sound when you receive a message', key: 'notificationSound', default: true },
              ].map((setting) => (
                <PersistedToggle
                  key={setting.key}
                  label={setting.label}
                  desc={setting.desc}
                  settingKey={setting.key}
                  defaultVal={setting.default}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'Chat' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Chat</h2>
            <div className="space-y-4">
              {[
                { label: 'Show Embeds & Preview Links', desc: 'Show rich previews for links shared in chat', key: 'showEmbeds', default: true },
                { label: 'Show Emoji Reactions', desc: 'Show emoji reactions on messages', key: 'showReactions', default: true },
                { label: 'Render Attachments', desc: 'Show images and files inline', key: 'renderAttachments', default: true },
                { label: 'Play Animated Emoji', desc: 'Animate emoji in messages', key: 'animatedEmoji', default: true },
              ].map((setting) => (
                <PersistedToggle
                  key={setting.key}
                  label={setting.label}
                  desc={setting.desc}
                  settingKey={setting.key}
                  defaultVal={setting.default}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'Keybinds' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Keybinds</h2>
            <div className="space-y-2">
              {[
                { action: 'Quick Switcher', keys: 'Ctrl+K' },
                { action: 'Toggle Mute', keys: 'Ctrl+Shift+M' },
                { action: 'Mark Channel as Read', keys: 'Escape' },
                { action: 'Keyboard Shortcuts', keys: 'Ctrl+/' },
                { action: 'Edit Last Message', keys: '↑ (empty input)' },
              ].map((kb, i) => (
                <div key={i} className="flex items-center justify-between bg-xiscord-dark rounded-lg p-3">
                  <span className="text-xiscord-lightest text-sm">{kb.action}</span>
                  <kbd className="bg-xiscord-darker text-xiscord-lightest text-xs px-2 py-1 rounded border border-xiscord-divider font-mono">
                    {kb.keys}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-xiscord-muted mt-4">Custom keybinds are not configurable in this mock.</p>
          </div>
        )}

        {activeSection === 'Language' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Language</h2>
            <div className="mb-4">
              <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Xiscord Language</label>
              <select
                value={userSettings.language || 'en-US'}
                onChange={(e) => store.updateUserSettings({ language: e.target.value })}
                className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-darker focus:border-xiscord-blurple text-sm"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh-CN">Chinese (Simplified)</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="ru">Russian</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex flex-col items-center pt-16 px-4 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full border-2 border-xiscord-muted text-xiscord-muted hover:border-white hover:text-white flex items-center justify-center"
        >
          <X size={18} />
        </button>
        <span className="text-xs text-xiscord-muted mt-1.5 font-bold">ESC</span>
      </div>
    </div>
  );
}

// Toggle that persists to the store
function PersistedToggle({ label, desc, settingKey, defaultVal }) {
  const store = useStore();
  const userSettings = store.userSettings || {};
  const enabled = settingKey in userSettings ? userSettings[settingKey] : defaultVal;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-xiscord-lightest font-medium">{label}</div>
        {desc && <div className="text-xs text-xiscord-muted mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => store.updateUserSettings({ [settingKey]: !enabled })}
        className={cn(
          "w-10 h-6 rounded-full transition-colors relative shrink-0 ml-4",
          enabled ? "bg-xiscord-green" : "bg-xiscord-muted/40"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
          enabled ? "left-5" : "left-1"
        )} />
      </button>
    </div>
  );
}

// Editable text field
function EditableTextField({ value, placeholder, onSave, multiline = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setEditValue(value); setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-blurple text-sm resize-none"
            rows={3}
            autoFocus
            maxLength={190}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-blurple text-sm"
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} className="text-xs bg-xiscord-blurple text-white px-3 py-1.5 rounded hover:bg-xiscord-blurple/80">Save</button>
          <button onClick={() => { setEditValue(value); setIsEditing(false); }} className="text-xs text-xiscord-muted hover:text-white px-3 py-1.5">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between">
      <div className="text-sm text-xiscord-lightest flex-1 min-w-0">
        {value || <span className="text-xiscord-muted italic">{placeholder}</span>}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="ml-3 shrink-0 bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-xs px-3 py-1 rounded"
      >
        Edit
      </button>
    </div>
  );
}
