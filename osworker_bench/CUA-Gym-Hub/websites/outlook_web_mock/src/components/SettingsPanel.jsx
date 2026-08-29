import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const sections = [
  { id: 'accounts', label: 'Accounts', items: ['Email accounts', 'Automatic replies', 'Signatures', 'Categories'] },
  { id: 'general', label: 'General', items: ['Appearance', 'Language', 'Accessibility'] },
  { id: 'mail', label: 'Mail', items: ['Layout', 'Compose and reply', 'Rules', 'Junk email'] },
  { id: 'calendar', label: 'Calendar', items: ['Events and invitations', 'Shared calendars'] },
  { id: 'people', label: 'People', items: ['Contacts', 'Import/Export'] },
];

export default function SettingsPanel() {
  const { state, actions } = useStore();
  const [activeSection, setActiveSection] = useState('accounts');
  const [activeItem, setActiveItem] = useState('Email accounts');
  const [searchFilter, setSearchFilter] = useState('');

  // Snapshot settings on open for discard
  const savedSettingsRef = useRef(JSON.parse(JSON.stringify(state.settings)));

  const handleSave = () => {
    // Commit current settings as saved (update snapshot)
    savedSettingsRef.current = JSON.parse(JSON.stringify(state.settings));
    actions.setSettingsOpen(false);
  };

  const handleDiscard = () => {
    // Revert to snapshot
    actions.updateSettings(savedSettingsRef.current);
    actions.setSettingsOpen(false);
  };

  // Filter items by search
  const filteredSections = sections.map(section => {
    if (!searchFilter) return section;
    const q = searchFilter.toLowerCase();
    const matchedItems = section.items.filter(item => item.toLowerCase().includes(q));
    const sectionMatch = section.label.toLowerCase().includes(q);
    if (sectionMatch) return section;
    if (matchedItems.length > 0) return { ...section, items: matchedItems };
    return null;
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-[800px] h-[520px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Settings</h2>
          <button
            onClick={() => actions.setSettingsOpen(false)}
            className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-52 border-r border-neutral-200 p-4 overflow-y-auto">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search settings"
                className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded focus:border-[#0078D4] outline-none"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            {filteredSections.map(section => (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => { setActiveSection(section.id); if (section.items.length > 0) setActiveItem(section.items[0]); }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#EBF3FC] text-[#0078D4]'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {section.label}
                </button>
                {activeSection === section.id && section.items.length > 0 && (
                  <div className="mt-1 ml-3 space-y-px">
                    {section.items.map(item => (
                      <button
                        key={item}
                        onClick={() => setActiveItem(item)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                          activeItem === item
                            ? 'text-[#0078D4] font-medium'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => actions.setSettingsOpen(false)}
              className="text-sm text-[#0078D4] hover:underline mt-3 px-3"
            >
              View quick settings
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">{activeItem}</h3>
            <SettingsContent section={activeSection} item={activeItem} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-neutral-200">
          <button
            onClick={handleDiscard}
            className="px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm bg-[#0078D4] text-white rounded hover:bg-[#106EBE] font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ section, item }) {
  const { state, actions } = useStore();

  if (section === 'accounts' && item === 'Email accounts') {
    return (
      <div>
        <div className="bg-neutral-50 border border-neutral-200 rounded p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0078D4] flex items-center justify-center text-white font-semibold">
              {state.user.initials}
            </div>
            <div>
              <div className="text-sm font-semibold">{state.user.email}</div>
              <div className="text-xs text-neutral-500">Xutlook</div>
            </div>
          </div>
          <button
            onClick={() => actions.setSettingsOpen(false)}
            className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100"
          >
            Manage
          </button>
        </div>
      </div>
    );
  }

  if (section === 'accounts' && item === 'Automatic replies') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-neutral-700">Automatic replies</label>
          <button
            onClick={() => actions.updateSettings({ autoReply: { ...state.settings.autoReply, enabled: !state.settings.autoReply.enabled } })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.autoReply.enabled ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.autoReply.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-neutral-500">{state.settings.autoReply.enabled ? 'On' : 'Off'}</span>
        </div>
        {state.settings.autoReply.enabled && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Auto-reply message</label>
            <textarea
              className="w-full border border-neutral-200 rounded p-3 text-sm h-24 outline-none focus:border-[#0078D4]"
              placeholder="Type your auto-reply message..."
              value={state.settings.autoReply.internalMessage}
              onChange={(e) => actions.updateSettings({ autoReply: { ...state.settings.autoReply, internalMessage: e.target.value } })}
            />
          </div>
        )}
      </div>
    );
  }

  if (section === 'accounts' && item === 'Signatures') {
    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Signature name</label>
        <input
          type="text"
          className="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#0078D4] mb-3"
          value={state.settings.signature.name}
          onChange={(e) => actions.updateSettings({ signature: { ...state.settings.signature, name: e.target.value } })}
        />
        <label className="block text-sm font-medium text-neutral-700 mb-1">Signature content</label>
        <textarea
          className="w-full border border-neutral-200 rounded p-3 text-sm h-32 outline-none focus:border-[#0078D4]"
          value={state.settings.signature.html}
          onChange={(e) => actions.updateSettings({ signature: { ...state.settings.signature, html: e.target.value } })}
        />
      </div>
    );
  }

  if (section === 'mail' && item === 'Layout') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Reading pane position</label>
          <div className="flex gap-3">
            {['right', 'bottom', 'off'].map(pos => (
              <button
                key={pos}
                onClick={() => actions.updateSettings({ readingPanePosition: pos })}
                className={`px-4 py-2 text-sm rounded border ${
                  state.settings.readingPanePosition === pos
                    ? 'border-[#0078D4] bg-[#EBF3FC] text-[#0078D4]'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Controls how the reading pane is displayed relative to the email list.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Density</label>
          <div className="flex gap-3">
            {['full', 'medium', 'compact'].map(d => (
              <button
                key={d}
                onClick={() => actions.updateSettings({ density: d })}
                className={`px-4 py-2 text-sm rounded border ${
                  state.settings.density === d
                    ? 'border-[#0078D4] bg-[#EBF3FC] text-[#0078D4]'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Show preview text</label>
          <button
            onClick={() => actions.updateSettings({ previewText: !state.settings.previewText })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.previewText ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.previewText ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    );
  }

  if (section === 'accounts' && item === 'Categories') {
    return (
      <div className="space-y-2">
        {state.categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 py-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
            <span className="text-sm text-neutral-700">{cat.displayName}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'general' && item === 'Appearance') {
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map(theme => (
              <button
                key={theme}
                onClick={() => actions.updateSettings({ theme })}
                className={`px-4 py-2 text-sm rounded border flex flex-col items-center gap-1 min-w-[80px] ${
                  state.settings.theme === theme
                    ? 'border-[#0078D4] bg-[#EBF3FC] text-[#0078D4]'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-8 h-5 rounded-sm border ${
                  theme === 'light' ? 'bg-white border-neutral-300' :
                  theme === 'dark' ? 'bg-neutral-800 border-neutral-600' :
                  'bg-gradient-to-r from-white to-neutral-800 border-neutral-300'
                }`} />
                <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Theme changes are applied immediately to the entire application.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Density</label>
          <div className="flex gap-3">
            {['full', 'medium', 'compact'].map(d => (
              <button
                key={d}
                onClick={() => actions.updateSettings({ density: d })}
                className={`px-4 py-2 text-sm rounded border ${
                  state.settings.density === d
                    ? 'border-[#0078D4] bg-[#EBF3FC] text-[#0078D4]'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Focused Inbox</label>
          <button
            onClick={() => actions.updateSettings({ focusedInbox: !state.settings.focusedInbox })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.focusedInbox !== false ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.focusedInbox !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-neutral-500">{state.settings.focusedInbox !== false ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Conversation view</label>
          <button
            onClick={() => actions.updateSettings({ conversationView: !state.settings.conversationView })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.conversationView !== false ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.conversationView !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-neutral-500">{state.settings.conversationView !== false ? 'On' : 'Off'}</span>
        </div>
      </div>
    );
  }

  // F-031: Language settings
  if (section === 'general' && item === 'Language') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Display language</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.language || 'en-US'}
            onChange={(e) => actions.updateSettings({ language: e.target.value })}
          >
            <option value="en-US">English (United States)</option>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="es-ES">Spanish (Spain)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
            <option value="ja-JP">Japanese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Time format</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.timeFormat || '12h'}
            onChange={(e) => actions.updateSettings({ timeFormat: e.target.value })}
          >
            <option value="12h">12-hour (1:00 PM)</option>
            <option value="24h">24-hour (13:00)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Date format</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.dateFormat || 'MM/dd/yyyy'}
            onChange={(e) => actions.updateSettings({ dateFormat: e.target.value })}
          >
            <option value="MM/dd/yyyy">MM/DD/YYYY</option>
            <option value="dd/MM/yyyy">DD/MM/YYYY</option>
            <option value="yyyy-MM-dd">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    );
  }

  // F-032: Accessibility settings
  if (section === 'general' && item === 'Accessibility') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">High contrast mode</label>
          <button
            onClick={() => actions.updateSettings({ highContrast: !state.settings.highContrast })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.highContrast ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.highContrast ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-neutral-500">{state.settings.highContrast ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Screen reader support</label>
          <button
            onClick={() => actions.updateSettings({ screenReader: !state.settings.screenReader })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.screenReader ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.screenReader ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-neutral-500">{state.settings.screenReader ? 'On' : 'Off'}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Font size</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.fontSize || 'medium'}
            onChange={(e) => actions.updateSettings({ fontSize: e.target.value })}
          >
            <option value="small">Small</option>
            <option value="medium">Medium (default)</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra large</option>
          </select>
        </div>
      </div>
    );
  }

  // F-033: Compose and reply
  if (section === 'mail' && item === 'Compose and reply') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Default font</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.composeFont || 'Segoe UI'}
            onChange={(e) => actions.updateSettings({ composeFont: e.target.value })}
          >
            <option value="Segoe UI">Segoe UI</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Default font size</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.composeFontSize || '11'}
            onChange={(e) => actions.updateSettings({ composeFontSize: e.target.value })}
          >
            <option value="8">8 pt</option>
            <option value="10">10 pt</option>
            <option value="11">11 pt</option>
            <option value="12">12 pt</option>
            <option value="14">14 pt</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Message format</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.composeFormat || 'html'}
            onChange={(e) => actions.updateSettings({ composeFormat: e.target.value })}
          >
            <option value="html">HTML</option>
            <option value="plain">Plain text</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Always show Bcc</label>
          <button
            onClick={() => actions.updateSettings({ alwaysShowBcc: !state.settings.alwaysShowBcc })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.alwaysShowBcc ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.alwaysShowBcc ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Include original message in reply</label>
          <button
            onClick={() => actions.updateSettings({ includeOriginalInReply: state.settings.includeOriginalInReply === false ? true : !(state.settings.includeOriginalInReply !== false) })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.includeOriginalInReply !== false ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.includeOriginalInReply !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    );
  }

  // F-034: Rules
  if (section === 'mail' && item === 'Rules') {
    const rules = state.settings.rules || [
      { id: 'rule-1', name: 'Move newsletters to Other', condition: 'From contains "newsletter"', action: 'Move to Other inbox', enabled: true },
      { id: 'rule-2', name: 'Flag messages from boss', condition: 'From contains "alex.wilber"', action: 'Flag message', enabled: true },
      { id: 'rule-3', name: 'Categorize GitHub notifications', condition: 'From contains "github.com"', action: 'Apply "Green category"', enabled: false },
    ];

    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">Inbox rules let you automatically sort and organize incoming messages.</p>
        <button
          className="bg-[#0078D4] hover:bg-[#106EBE] text-white px-3 py-1.5 rounded text-sm font-semibold"
          onClick={() => {
            const newRule = {
              id: `rule-${Date.now()}`,
              name: 'New rule',
              condition: '',
              action: '',
              enabled: true,
            };
            actions.updateSettings({ rules: [...rules, newRule] });
          }}
        >
          + Add new rule
        </button>
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-3 p-3 border border-neutral-200 rounded hover:bg-neutral-50">
              <button
                onClick={() => {
                  const updated = rules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r);
                  actions.updateSettings({ rules: updated });
                }}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${rule.enabled ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-700">{rule.name}</div>
                <div className="text-xs text-neutral-500">
                  {rule.condition && `If: ${rule.condition}`}
                  {rule.action && ` | Then: ${rule.action}`}
                </div>
              </div>
              <button
                onClick={() => {
                  const updated = rules.filter(r => r.id !== rule.id);
                  actions.updateSettings({ rules: updated });
                }}
                className="text-xs text-red-500 hover:underline flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // F-035: Junk email
  if (section === 'mail' && item === 'Junk email') {
    const blockedSenders = state.settings.blockedSenders || ['rewards-special-offer.xyz', 'account-verify-now.xyz'];
    const safeSenders = state.settings.safeSenders || ['contoso.com', 'outlook.com'];

    return (
      <JunkEmailSettings
        blockedSenders={blockedSenders}
        safeSenders={safeSenders}
        onUpdateBlockedSenders={(updated) => actions.updateSettings({ blockedSenders: updated })}
        onUpdateSafeSenders={(updated) => actions.updateSettings({ safeSenders: updated })}
      />
    );
  }

  // F-036: Events and invitations
  if (section === 'calendar' && item === 'Events and invitations') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Default reminder</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.defaultReminder || '15'}
            onChange={(e) => actions.updateSettings({ defaultReminder: e.target.value })}
          >
            <option value="0">None</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="1440">1 day</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Default event duration</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.defaultEventDuration || '60'}
            onChange={(e) => actions.updateSettings({ defaultEventDuration: e.target.value })}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Automatically decline conflicting invitations</label>
          <button
            onClick={() => actions.updateSettings({ autoDeclineConflicts: !state.settings.autoDeclineConflicts })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.autoDeclineConflicts ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.autoDeclineConflicts ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Week starts on</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.weekStart || 'Sunday'}
            onChange={(e) => actions.updateSettings({ weekStart: e.target.value })}
          >
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>
      </div>
    );
  }

  // F-037: Shared calendars
  if (section === 'calendar' && item === 'Shared calendars') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">Manage calendars shared with you or publish your calendar.</p>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Publishing</label>
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-700">Publish my calendar</label>
            <button
              onClick={() => actions.updateSettings({ publishCalendar: !state.settings.publishCalendar })}
              className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.publishCalendar ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
            >
              <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.publishCalendar ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Default sharing permission</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.calendarSharingPermission || 'availability'}
            onChange={(e) => actions.updateSettings({ calendarSharingPermission: e.target.value })}
          >
            <option value="availability">Can view when I'm busy</option>
            <option value="limited">Can view titles and locations</option>
            <option value="full">Can view all details</option>
            <option value="edit">Can edit</option>
          </select>
        </div>
      </div>
    );
  }

  // F-038: People > Contacts
  if (section === 'people' && item === 'Contacts') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-700">Automatically add contacts from email</label>
          <button
            onClick={() => actions.updateSettings({ autoAddContacts: state.settings.autoAddContacts === false ? true : !state.settings.autoAddContacts })}
            className={`relative w-10 h-5 rounded-full transition-colors ${state.settings.autoAddContacts !== false ? 'bg-[#0078D4]' : 'bg-neutral-300'}`}
          >
            <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${state.settings.autoAddContacts !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Default sort order</label>
          <select
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={state.settings.contactSortOrder || 'firstName'}
            onChange={(e) => actions.updateSettings({ contactSortOrder: e.target.value })}
          >
            <option value="firstName">First name</option>
            <option value="lastName">Last name</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>
    );
  }

  // F-038: People > Import/Export
  if (section === 'people' && item === 'Import/Export') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Import contacts</label>
          <p className="text-xs text-neutral-500 mb-2">Upload a CSV file to import contacts.</p>
          <button className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-100">
            Browse...
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Export contacts</label>
          <p className="text-xs text-neutral-500 mb-2">Download all your contacts as a CSV file.</p>
          <button className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-100">
            Export
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-neutral-500">
      Settings for "{item}" will appear here.
    </div>
  );
}

function JunkEmailSettings({ blockedSenders, safeSenders, onUpdateBlockedSenders, onUpdateSafeSenders }) {
  const [newBlockedInput, setNewBlockedInput] = useState('');
  const [newSafeInput, setNewSafeInput] = useState('');

  const handleAddBlocked = () => {
    const addr = newBlockedInput.trim();
    if (!addr) return;
    onUpdateBlockedSenders([...blockedSenders, addr]);
    setNewBlockedInput('');
  };

  const handleAddSafe = () => {
    const addr = newSafeInput.trim();
    if (!addr) return;
    onUpdateSafeSenders([...safeSenders, addr]);
    setNewSafeInput('');
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Blocked senders and domains</label>
        <p className="text-xs text-neutral-500 mb-2">Messages from these senders or domains will always go to your Junk Email folder.</p>
        <div className="space-y-1 mb-2">
          {blockedSenders.map((sender, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-neutral-50 rounded text-sm">
              <span className="flex-1">{sender}</span>
              <button
                onClick={() => onUpdateBlockedSenders(blockedSenders.filter((_, i) => i !== idx))}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Email address or domain"
            className="flex-1 px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={newBlockedInput}
            onChange={e => setNewBlockedInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddBlocked(); }}
          />
          <button
            onClick={handleAddBlocked}
            className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Safe senders and domains</label>
        <p className="text-xs text-neutral-500 mb-2">Messages from these senders will never go to your Junk Email folder.</p>
        <div className="space-y-1 mb-2">
          {safeSenders.map((sender, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-neutral-50 rounded text-sm">
              <span className="flex-1">{sender}</span>
              <button
                onClick={() => onUpdateSafeSenders(safeSenders.filter((_, i) => i !== idx))}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Email address or domain"
            className="flex-1 px-3 py-1.5 text-sm border border-neutral-200 rounded outline-none focus:border-[#0078D4]"
            value={newSafeInput}
            onChange={e => setNewSafeInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddSafe(); }}
          />
          <button
            onClick={handleAddSafe}
            className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
