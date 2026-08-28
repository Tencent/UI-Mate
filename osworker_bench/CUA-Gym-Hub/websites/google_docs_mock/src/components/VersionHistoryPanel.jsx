import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { useDocsContext } from '../context/DocsContext';

const VERSION_COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9334e8', '#e88c1a'];

function formatVersionDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const dayMs = 86400000;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < dayMs) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 2 * dayMs) return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const VERSIONS_STORAGE_PREFIX = 'google_docs_versions_';

function loadVersions(docId) {
  try {
    const stored = localStorage.getItem(VERSIONS_STORAGE_PREFIX + docId);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveVersions(docId, versions) {
  try {
    localStorage.setItem(VERSIONS_STORAGE_PREFIX + docId, JSON.stringify(versions));
  } catch {}
}

// Extract plain text preview from HTML content
function getTextPreview(html, maxChars = 200) {
  if (!html) return '(empty document)';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = (tmp.textContent || tmp.innerText || '').trim();
  if (!text) return '(empty document)';
  return text.length > maxChars ? text.slice(0, maxChars) + '…' : text;
}

function VersionHistoryPanel({ isOpen, onClose, docTitle, docId, currentContent, onRestoreContent, users }) {
  const { dispatch } = useDocsContext();
  const [selectedVersion, setSelectedVersion] = useState('v-current');
  const [namingVersion, setNamingVersion] = useState(null);
  const [versionName, setVersionName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();

  const [savedVersions, setSavedVersions] = useState([]);

  // Load saved versions from localStorage when panel opens
  useEffect(() => {
    if (isOpen && docId) {
      const stored = loadVersions(docId);
      if (stored && stored.length > 0) {
        setSavedVersions(stored);
      } else {
        // Initialize with an "initial" version snapshot using current content
        const currentUser = (users && users[0]?.name) || 'Demo User';
        const initialVersion = {
          id: 'v-initial',
          label: 'Initial version',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          author: currentUser,
          color: VERSION_COLORS[1],
          content: currentContent || '',
        };
        setSavedVersions([initialVersion]);
        saveVersions(docId, [initialVersion]);
      }
      setSelectedVersion('v-current');
      setShowPreview(false);
      setNamingVersion(null);
      setVersionName('');
    }
  }, [isOpen, docId]);

  const versions = useMemo(() => {
    const currentUser = (users && users[0]?.name) || 'Demo User';
    const current = {
      id: 'v-current',
      label: null,
      timestamp: new Date().toISOString(),
      author: currentUser,
      color: VERSION_COLORS[0],
      isCurrent: true,
      content: currentContent || '',
    };
    return [current, ...savedVersions];
  }, [savedVersions, currentContent, users]);

  const selectedVersionData = useMemo(() => {
    return versions.find(v => v.id === selectedVersion) || versions[0];
  }, [versions, selectedVersion]);

  const handleSelectVersion = (versionId) => {
    setSelectedVersion(versionId);
    const v = versions.find(ver => ver.id === versionId);
    if (v && !v.isCurrent) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const handleNameVersion = (versionId) => {
    const v = versions.find(ver => ver.id === versionId);
    setVersionName(v?.label || '');
    setNamingVersion(versionId);
  };

  const handleSaveVersionName = useCallback(() => {
    if (namingVersion) {
      if (namingVersion === 'v-current') {
        // Save current content as a named version snapshot
        const currentUser = (users && users[0]?.name) || 'Demo User';
        const label = versionName.trim() || 'Named version';
        const newSnapshot = {
          id: 'v-' + Date.now(),
          label,
          timestamp: new Date().toISOString(),
          author: currentUser,
          color: VERSION_COLORS[savedVersions.length % VERSION_COLORS.length],
          content: currentContent || '',
        };
        const updated = [newSnapshot, ...savedVersions];
        setSavedVersions(updated);
        if (docId) saveVersions(docId, updated);
        // Also persist to reducer state
        if (docId) {
          dispatch({
            type: 'ADD_VERSION',
            payload: { docId, label, content: currentContent || '', author: currentUser }
          });
        }
        showToast('Version saved: ' + label);
      } else {
        // Rename an existing saved version
        const updated = savedVersions.map(v =>
          v.id === namingVersion ? { ...v, label: versionName.trim() || v.label } : v
        );
        setSavedVersions(updated);
        if (docId) saveVersions(docId, updated);
        showToast('Version name updated');
      }
      setNamingVersion(null);
      setVersionName('');
    }
  }, [namingVersion, versionName, savedVersions, currentContent, docId, users, dispatch, showToast]);

  const handleRestoreVersion = useCallback((versionId) => {
    const v = versions.find(ver => ver.id === versionId);
    if (!v || v.isCurrent) return;

    // Save current state as a "before restore" snapshot
    const currentUser = (users && users[0]?.name) || 'Demo User';
    const backupLabel = 'Before restore';
    const backupSnapshot = {
      id: 'v-backup-' + Date.now(),
      label: backupLabel,
      timestamp: new Date().toISOString(),
      author: currentUser,
      color: VERSION_COLORS[(savedVersions.length + 1) % VERSION_COLORS.length],
      content: currentContent || '',
    };
    const updated = [backupSnapshot, ...savedVersions];
    setSavedVersions(updated);
    if (docId) saveVersions(docId, updated);
    // Persist backup snapshot to reducer state
    if (docId) {
      dispatch({
        type: 'ADD_VERSION',
        payload: { docId, label: backupLabel, content: currentContent || '', author: currentUser }
      });
    }

    // Restore the selected version's content into the editor and reducer state
    if (v.content !== undefined) {
      if (onRestoreContent) {
        onRestoreContent(v.content);
      }
      // Update the reducer content directly (RESTORE_VERSION cannot look up localStorage IDs,
      // so we use UPDATE_DOC to set content directly)
      if (docId) {
        dispatch({
          type: 'UPDATE_DOC',
          payload: { docId, content: v.content }
        });
      }
      showToast('Version restored: ' + (v.label || formatVersionDate(v.timestamp)));
    }
    setShowPreview(false);
    setSelectedVersion('v-current');
    onClose();
  }, [versions, savedVersions, currentContent, docId, users, dispatch, onRestoreContent, onClose, showToast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-[340px] bg-white shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Version history</h2>
            <p className="text-xs text-gray-500 truncate max-w-[220px]">{docTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name current version */}
        <div className="px-4 py-3 border-b border-gray-200">
          <label className="text-xs text-gray-500 font-medium block mb-1.5">Save current version with a name</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Version name (optional)"
              value={namingVersion === 'v-current' ? versionName : ''}
              onChange={(e) => {
                setNamingVersion('v-current');
                setVersionName(e.target.value);
              }}
              onFocus={() => {
                setNamingVersion('v-current');
              }}
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveVersionName}
              disabled={namingVersion !== 'v-current'}
              className="px-2.5 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>

        {/* Content preview for selected non-current version */}
        {showPreview && selectedVersionData && !selectedVersionData.isCurrent && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-amber-800">Version preview</span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <EyeOff size={12} />
              </button>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
              {getTextPreview(selectedVersionData.content)}
            </p>
          </div>
        )}

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => handleSelectVersion(version.id)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedVersion === version.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                  style={{ backgroundColor: version.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      {formatVersionDate(version.timestamp)}
                    </span>
                    {version.isCurrent && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Current</span>
                    )}
                  </div>
                  {version.label && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{version.label}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">{version.author}</p>

                  {/* Actions shown when a past version is selected */}
                  {selectedVersion === version.id && !version.isCurrent && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestoreVersion(version.id); }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Restore this version
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (namingVersion === version.id) {
                            setNamingVersion(null);
                            setVersionName('');
                          } else {
                            handleNameVersion(version.id);
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {namingVersion === version.id ? 'Cancel' : 'Rename'}
                      </button>
                    </div>
                  )}

                  {/* Inline rename input for a past version */}
                  {namingVersion === version.id && !version.isCurrent && (
                    <div className="flex gap-1 mt-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={versionName}
                        onChange={(e) => setVersionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveVersionName();
                          if (e.key === 'Escape') { setNamingVersion(null); setVersionName(''); }
                        }}
                        autoFocus
                        placeholder="Version name"
                        className="flex-1 text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSaveVersionName}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close version history
          </button>
        </div>
      </div>
    </div>
  );
}

export default VersionHistoryPanel;
