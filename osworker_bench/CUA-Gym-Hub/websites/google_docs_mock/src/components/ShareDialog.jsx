import React, { useState } from 'react';
import { useDocsContext } from '../context/DocsContext';
import { X, Link2, Copy, Check, Globe, Lock } from 'lucide-react';

function ShareDialog({ docId, isOpen, onClose }) {
  const { state, dispatch } = useDocsContext();
  const [emailInput, setEmailInput] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('viewer');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const doc = state.documents[docId];
  if (!doc) return null;

  const sharedUsers = (doc.sharedWith || []).map((s) => ({
    ...s,
    user: state.users.find((u) => u.id === s.userId),
  }));

  const owner = state.users.find((u) => u.id === doc.ownerId);

  // Filter suggestions: users not already shared with and not the owner
  const suggestions = state.users.filter(
    (u) =>
      u.id !== doc.ownerId &&
      !doc.sharedWith.some((s) => s.userId === u.id) &&
      (emailInput.trim() === '' ||
        u.email.toLowerCase().includes(emailInput.toLowerCase()) ||
        u.name.toLowerCase().includes(emailInput.toLowerCase()))
  );

  const handleAddUser = (userToAdd) => {
    if (!userToAdd) {
      // Try to find by email input
      userToAdd = state.users.find(
        (u) => u.email.toLowerCase() === emailInput.toLowerCase()
      );
    }

    if (!userToAdd) {
      setError('User not found. Try a valid email address.');
      return;
    }

    if (userToAdd.id === doc.ownerId) {
      setError('Cannot share with the document owner.');
      return;
    }

    if (doc.sharedWith.some((s) => s.userId === userToAdd.id)) {
      setError('User already has access.');
      return;
    }

    dispatch({
      type: 'SHARE_DOC',
      payload: {
        docId,
        userId: userToAdd.id,
        permission: selectedPermission,
      },
    });
    setEmailInput('');
    setShowSuggestions(false);
    setError('');
  };

  const handleRemoveUser = (userId) => {
    dispatch({
      type: 'SHARE_DOC',
      payload: { docId, userId, permission: null },
    });
  };

  const handlePermissionChange = (userId, permission) => {
    dispatch({
      type: 'SHARE_DOC',
      payload: { docId, userId, permission },
    });
  };

  const handleLinkSharingToggle = () => {
    dispatch({
      type: 'UPDATE_LINK_SHARING',
      payload: {
        docId,
        enabled: !doc.linkSharing.enabled,
        permission: doc.linkSharing.permission,
      },
    });
  };

  const handleLinkPermissionChange = (permission) => {
    dispatch({
      type: 'UPDATE_LINK_SHARING',
      payload: {
        docId,
        enabled: doc.linkSharing.enabled,
        permission,
      },
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/document/${docId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      // Fallback: use hidden textarea
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUser(null);
    }
  };

  const permissionLabel = (perm) => {
    switch (perm) {
      case 'editor':
        return 'Editor';
      case 'commenter':
        return 'Commenter';
      case 'viewer':
        return 'Viewer';
      default:
        return perm;
    }
  };

  const permissionColor = (perm) => {
    switch (perm) {
      case 'editor':
        return 'bg-green-100 text-green-700';
      case 'commenter':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-medium text-gray-900">
            Share "{doc.title}"
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add people section */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setShowSuggestions(true);
                  setError('');
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="Add people by email"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && emailInput.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {suggestions.map((user) => (
                    <button
                      key={user.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddUser(user);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="viewer">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>

        {/* People with access */}
        <div className="px-6 pb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            People with access
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {/* Owner */}
            {owner && (
              <div className="flex items-center gap-3 py-2 px-1">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {owner.name}{' '}
                    {owner.id === state.currentUser.id && (
                      <span className="text-gray-400">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {owner.email}
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Owner</span>
              </div>
            )}

            {/* Shared users */}
            {sharedUsers.map(({ userId, permission, user }) => {
              if (!user) return null;
              return (
                <div
                  key={userId}
                  className="flex items-center gap-3 py-2 px-1 group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name}{' '}
                      {user.id === state.currentUser.id && (
                        <span className="text-gray-400">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <select
                    value={permission}
                    onChange={(e) =>
                      handlePermissionChange(userId, e.target.value)
                    }
                    className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${permissionColor(permission)}`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={() => handleRemoveUser(userId)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove access"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link sharing section */}
        <div className="px-6 pb-4 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            General access
          </h3>
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                doc.linkSharing.enabled
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {doc.linkSharing.enabled ? (
                <Globe size={18} />
              ) : (
                <Lock size={18} />
              )}
            </div>
            <div className="flex-1">
              <button
                onClick={handleLinkSharingToggle}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
              >
                {doc.linkSharing.enabled
                  ? 'Anyone with the link'
                  : 'Restricted'}
              </button>
              <p className="text-xs text-gray-500">
                {doc.linkSharing.enabled
                  ? 'Anyone with the link can access'
                  : 'Only people with access can open'}
              </p>
            </div>
            {doc.linkSharing.enabled && (
              <select
                value={doc.linkSharing.permission}
                onChange={(e) => handleLinkPermissionChange(e.target.value)}
                className="text-xs font-medium rounded-lg px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {linkCopied ? (
              <>
                <Check size={16} />
                Link copied
              </>
            ) : (
              <>
                <Link2 size={16} />
                Copy link
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareDialog;
