import React from 'react';
import { ShieldOff } from 'lucide-react';
import { useStore } from '../store/StoreContext';

export default function AccessDenied({ service = 'this service', region, action = 'DescribeResources' }) {
  const { state } = useStore();
  const userName = state.user?.name || 'current user';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{service}</h1>
      <div className="aws-card border-red-300 bg-red-50">
        <div className="flex items-start gap-3 p-2">
          <ShieldOff size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 text-sm">Access Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              User <span className="font-mono font-bold">{userName}</span> is not authorized to perform <span className="font-mono">{action}</span>
              {region && <> in region <span className="font-mono font-bold">{region}</span></>}.
            </p>
            <p className="text-sm text-red-600 mt-2">
              You need to assume a role with appropriate permissions. Use <strong>Switch Role</strong> from the account menu (top-right) to assume an administrator role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
