
    import React from 'react';
    import { useOutletContext } from 'react-router-dom';
    import { Shield, AlertCircle } from 'lucide-react';

    export default function Security() {
      const { repo } = useOutletContext();

      return (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="bg-xithub-card border border-xithub-border rounded-md p-8 text-center">
            <Shield size={48} className="mx-auto mb-4 text-xithub-muted opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">Security overview</h3>
            <p className="text-xithub-muted mb-4 max-w-md mx-auto">
              Get an overview of your repository's security setup and alerts.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-6">
              <div className="bg-[#161b22] border border-xithub-border rounded-md p-4">
                <div className="text-2xl font-bold text-green-500 mb-1">0</div>
                <div className="text-xs text-xithub-muted">Dependabot alerts</div>
              </div>
              <div className="bg-[#161b22] border border-xithub-border rounded-md p-4">
                <div className="text-2xl font-bold text-green-500 mb-1">0</div>
                <div className="text-xs text-xithub-muted">Code scanning alerts</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
