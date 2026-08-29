import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Shield, Users, Key, FileText } from 'lucide-react';

export default function IAMDashboard() {
  const { state } = useStore();
  const { users, roles, policies, groups } = state.iam;
  const awsPolicies = policies.filter(p => p.type === 'AWS managed').length;
  const custPolicies = policies.filter(p => p.type === 'Customer managed').length;

  // Derive security recommendations from actual state
  const rootMfaEnabled = state.iam?.accountSettings?.rootMfaEnabled ?? true;
  const passwordPolicyConfigured = !!(state.iam?.accountSettings?.passwordPolicy?.minimumLength);
  const noRootAccessKeys = !state.iam?.accountSettings?.hasRootAccessKeys;
  const usersHavePermissions = users.length === 0 || users.some(u => (u.groups || []).length > 0 || (u.policies || []).length > 0);

  const recommendations = [
    { label: 'Root user MFA enabled', status: rootMfaEnabled },
    { label: 'IAM password policy configured', status: passwordPolicyConfigured },
    { label: 'No root access keys', status: noRootAccessKeys },
    { label: 'IAM users have appropriate permissions', status: usersHavePermissions },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">IAM Dashboard</h1>

      {/* AWS Account */}
      <div className="aws-card">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><Shield size={16} /> AWS Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-aws-text-secondary">Account ID:</span> <span className="font-mono ml-2">{state.user.accountId}</span></div>
          <div><span className="text-aws-text-secondary">Account Alias:</span> <span className="ml-2">{state.user.accountAlias}</span></div>
          <div><span className="text-aws-text-secondary">Sign-in URL:</span> <span className="ml-2 text-aws-blue">https://{state.user.accountAlias}.signin.aws.amazon.com/console</span></div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="aws-card">
        <h2 className="font-bold text-sm mb-3">Security recommendations</h2>
        <div className="space-y-2">
          {recommendations.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.status ? (
                <CheckCircle size={14} className="text-aws-success" />
              ) : (
                <XCircle size={14} className="text-aws-error" />
              )}
              <span className={item.status ? '' : 'text-aws-error font-medium'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* IAM Resources */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/iam/users" className="aws-card hover:border-aws-blue transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-aws-blue" />
            <h3 className="font-bold text-sm">Users</h3>
          </div>
          <div className="text-3xl font-bold text-aws-blue">{users.length}</div>
        </Link>
        <Link to="/iam/groups" className="aws-card hover:border-aws-blue transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-aws-blue" />
            <h3 className="font-bold text-sm">Groups</h3>
          </div>
          <div className="text-3xl font-bold text-aws-blue">{groups.length}</div>
        </Link>
        <Link to="/iam/roles" className="aws-card hover:border-aws-blue transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Key size={18} className="text-aws-blue" />
            <h3 className="font-bold text-sm">Roles</h3>
          </div>
          <div className="text-3xl font-bold text-aws-blue">{roles.length}</div>
        </Link>
        <Link to="/iam/policies" className="aws-card hover:border-aws-blue transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-aws-blue" />
            <h3 className="font-bold text-sm">Policies</h3>
          </div>
          <div className="text-3xl font-bold text-aws-blue">{policies.length}</div>
          <div className="text-xs text-aws-text-secondary mt-1">{awsPolicies} AWS managed, {custPolicies} customer managed</div>
        </Link>
      </div>
    </div>
  );
}
