import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Shield, CheckCircle } from 'lucide-react';

export default function IAMAccountSettings() {
  const { state, dispatch, addFlash } = useStore();
  const settings = state.iam?.accountSettings || {};
  const pp = settings.passwordPolicy || {};
  const sts = settings.securityTokenService || {};

  const [minLength, setMinLength] = useState(pp.minimumLength || 8);
  const [requireUpper, setRequireUpper] = useState(pp.requireUppercase ?? true);
  const [requireLower, setRequireLower] = useState(pp.requireLowercase ?? true);
  const [requireNumbers, setRequireNumbers] = useState(pp.requireNumbers ?? true);
  const [requireSymbols, setRequireSymbols] = useState(pp.requireSymbols ?? false);
  const [maxAge, setMaxAge] = useState(pp.maxAge || 90);
  const [preventReuse, setPreventReuse] = useState(pp.preventReuse || 0);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_IAM_ACCOUNT_SETTINGS',
      payload: {
        passwordPolicy: {
          minimumLength: minLength,
          requireUppercase: requireUpper,
          requireLowercase: requireLower,
          requireNumbers,
          requireSymbols,
          maxAge,
          preventReuse,
        }
      }
    });
    addFlash('success', 'Password policy updated successfully');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Account Settings</h1>

      {/* Password Policy */}
      <div className="aws-card space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-aws-text-secondary" />
          <h3 className="font-bold text-sm">Password policy</h3>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Minimum password length</label>
          <input type="number" className="aws-input w-24" value={minLength} onChange={e => setMinLength(Number(e.target.value))} min={6} max={128} />
          <p className="text-xs text-aws-text-secondary mt-1">Between 6 and 128 characters</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold">Password requirements</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requireUpper} onChange={e => setRequireUpper(e.target.checked)} />
            Require at least one uppercase letter (A-Z)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requireLower} onChange={e => setRequireLower(e.target.checked)} />
            Require at least one lowercase letter (a-z)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requireNumbers} onChange={e => setRequireNumbers(e.target.checked)} />
            Require at least one number (0-9)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requireSymbols} onChange={e => setRequireSymbols(e.target.checked)} />
            Require at least one non-alphanumeric character (!@#$%^&*)
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Maximum password age (days)</label>
          <input type="number" className="aws-input w-24" value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} min={0} max={1095} />
          <p className="text-xs text-aws-text-secondary mt-1">0 means passwords do not expire</p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Prevent password reuse</label>
          <input type="number" className="aws-input w-24" value={preventReuse} onChange={e => setPreventReuse(Number(e.target.value))} min={0} max={24} />
          <p className="text-xs text-aws-text-secondary mt-1">Number of previous passwords to remember (0-24)</p>
        </div>

        <div className="flex justify-end pt-2">
          <button className="aws-btn aws-btn-primary" onClick={handleSave}>Save changes</button>
        </div>
      </div>

      {/* Security Token Service */}
      <div className="aws-card max-w-2xl">
        <h3 className="font-bold text-sm mb-3">Security Token Service (STS)</h3>
        <p className="text-sm text-aws-text-secondary mb-3">Active regions for STS endpoint usage.</p>
        <div className="space-y-2">
          {(sts.regions || []).map(region => (
            <div key={region} className="flex items-center gap-2 text-sm py-1 border-b border-gray-100 last:border-0">
              <CheckCircle size={14} className="text-aws-success" />
              <span className="font-mono">{region}</span>
              <span className="aws-badge bg-green-100 text-green-800 ml-auto">Active</span>
            </div>
          ))}
          {(sts.regions || []).length === 0 && (
            <p className="text-sm text-aws-text-secondary">No active STS regions configured</p>
          )}
        </div>
      </div>
    </div>
  );
}
