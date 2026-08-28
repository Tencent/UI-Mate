import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import clsx from 'clsx';

const AUTH_TYPES = [
  { value: 'none', label: 'No Auth' },
  { value: 'inherit', label: 'Inherit auth from parent' },
  { value: 'apikey', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
];

export const AuthEditor = ({ auth, onChange }) => {
  const authType = auth?.type || 'none';

  const setType = (type) => {
    const newAuth = { type };
    if (type === 'bearer') newAuth.bearer = { token: auth?.bearer?.token || '' };
    if (type === 'basic') newAuth.basic = { username: auth?.basic?.username || '', password: auth?.basic?.password || '' };
    if (type === 'apikey') newAuth.apikey = { key: auth?.apikey?.key || '', value: auth?.apikey?.value || '', addTo: auth?.apikey?.addTo || 'header' };
    onChange(newAuth);
  };

  const updateField = (path, value) => {
    const parts = path.split('.');
    const newAuth = JSON.parse(JSON.stringify(auth || { type: authType }));
    let obj = newAuth;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    onChange(newAuth);
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs text-gray-500 font-medium">Type</span>
        <div className="relative">
          <select
            value={authType}
            onChange={(e) => setType(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            {AUTH_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>

      {authType === 'none' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          <Info size={16} className="text-gray-400 flex-shrink-0" />
          <span>This request does not use any authorization.</span>
        </div>
      )}

      {authType === 'inherit' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            <Info size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p>This authorization method will be used for every request in this folder.</p>
              <p className="mt-1 text-xs text-gray-400">You can override this by specifying one in the request.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            The authorization header will be automatically generated when you send the request.
          </p>
        </div>
      )}

      {authType === 'bearer' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Token</label>
            <input
              type="text"
              value={auth?.bearer?.token || ''}
              onChange={(e) => updateField('bearer.token', e.target.value)}
              placeholder="Enter bearer token"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <p className="text-xs text-gray-400">
            The token will be sent as: <code className="bg-gray-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>
      )}

      {authType === 'basic' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Username</label>
            <input
              type="text"
              value={auth?.basic?.username || ''}
              onChange={(e) => updateField('basic.username', e.target.value)}
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={auth?.basic?.password || ''}
              onChange={(e) => updateField('basic.password', e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {authType === 'apikey' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Key</label>
            <input
              type="text"
              value={auth?.apikey?.key || ''}
              onChange={(e) => updateField('apikey.key', e.target.value)}
              placeholder="Key name (e.g. X-API-Key)"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Value</label>
            <input
              type="text"
              value={auth?.apikey?.value || ''}
              onChange={(e) => updateField('apikey.value', e.target.value)}
              placeholder="API key value"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Add to</label>
            <div className="relative w-48">
              <select
                value={auth?.apikey?.addTo || 'header'}
                onChange={(e) => updateField('apikey.addTo', e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="header">Header</option>
                <option value="queryParams">Query Params</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
