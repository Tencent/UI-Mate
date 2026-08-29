import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';

export default function EC2Dashboard() {
  const { state, addFlash } = useStore();
  const instances = state.ec2 || [];
  const running = instances.filter(i => i.state === 'running').length;
  const stopped = instances.filter(i => i.state === 'stopped').length;
  const volumes = state.volumes || [];
  const snapshots = state.snapshots || [];
  const secGroups = state.securityGroups || [];
  const keyPairs = state.keyPairs || [];
  const elasticIPs = state.elasticIPs || [];
  const loadBalancers = state.loadBalancers || [];

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="aws-card flex items-center justify-between" style={{ borderLeft: '4px solid #0972D3' }}>
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-aws-blue flex-shrink-0">
            <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="10" y="14" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold">i</text>
          </svg>
          <span className="text-sm">You can change your default landing page for EC2.</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-aws-blue hover:underline">Permanently dismiss</button>
          <button className="aws-btn aws-btn-primary text-xs">Change landing page</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Resources */}
        <div className="col-span-2">
          <div className="aws-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Resources</h2>
              <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            </div>
            <p className="text-sm text-aws-text-secondary mb-4">
              You are using the following Amazon EC2 resources in the {state.user.region === 'ap-southeast-1' ? 'Asia Pacific (Singapore)' : state.user.region} Region:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <ResourceLink label="Instances (running)" count={running} to="/ec2" color="text-aws-blue" />
              <ResourceLink label="Auto Scaling Groups" count={0} to="/ec2/auto-scaling" />
              <ResourceLink label="Capacity Reservations" count={0} />
              <ResourceLink label="Dedicated Hosts" count={0} />
              <ResourceLink label="Elastic IPs" count={elasticIPs.length} to="/ec2/elastic-ips" color={elasticIPs.length > 0 ? 'text-aws-blue' : ''} />
              <ResourceLink label="Instances" count={instances.length} to="/ec2" color={instances.length > 0 ? 'text-aws-blue' : ''} />
              <ResourceLink label="Key pairs" count={keyPairs.length} to="/ec2/key-pairs" color={keyPairs.length > 0 ? 'text-aws-blue' : ''} />
              <ResourceLink label="Load balancers" count={loadBalancers.length} to="/ec2/load-balancers" />
              <ResourceLink label="Placement groups" count={0} />
              <ResourceLink label="Security groups" count={secGroups.length} to="/ec2/security-groups" color={secGroups.length > 0 ? 'text-aws-blue' : ''} />
              <ResourceLink label="Snapshots" count={snapshots.length} to="/ec2/snapshots" color={snapshots.length > 0 ? 'text-aws-blue' : ''} />
              <ResourceLink label="Volumes" count={volumes.length} to="/ec2/volumes" color={volumes.length > 0 ? 'text-aws-blue' : ''} />
            </div>
          </div>

          {/* Launch instance & Service health row */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Launch instance */}
            <div className="aws-card">
              <h3 className="font-bold text-sm mb-3">Launch instance</h3>
              <p className="text-sm text-aws-text-secondary mb-4">
                To get started, launch an Amazon EC2 instance, which is a virtual server in the cloud.
              </p>
              <div className="space-y-2">
                <Link to="/ec2" className="aws-btn aws-btn-call-to-action text-xs inline-flex items-center gap-1">
                  Launch instance
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 2 L7 5 L3 8" fill="currentColor" /></svg>
                </Link>
                <div>
                  <Link to="/ec2" className="text-sm text-aws-blue hover:underline flex items-center gap-1">
                    Migrate a server <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
              <p className="text-xs text-aws-text-disabled mt-3">
                Note: Your instances will launch in the {state.user.region === 'ap-southeast-1' ? 'Asia Pacific (Singapore)' : state.user.region} Region.
              </p>
            </div>

            {/* Service health */}
            <div className="aws-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Service health</h3>
                <Link to="/cloudwatch" className="text-xs text-aws-blue hover:underline flex items-center gap-1">
                  AWS Health Dashboard <ExternalLink size={10} />
                </Link>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-aws-text-secondary">Region</span>
                  <div className="font-medium">{state.user.region === 'ap-southeast-1' ? 'Asia Pacific (Singapore)' : state.user.region}</div>
                </div>
                <div>
                  <span className="text-aws-text-secondary">Status</span>
                  <div className="flex items-center gap-1.5 text-aws-success font-medium">
                    <CheckCircle size={14} /> This service is operating normally.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* EC2 cost */}
          <div className="aws-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">EC2 cost</h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg width="14" height="14" viewBox="0 0 14 14" className="text-aws-text-secondary">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-aws-text-secondary mb-2">Date range: Past 6 months</div>
            <div className="text-sm text-aws-text-secondary mb-1">Region: Global</div>
            <div className="mt-3">
              <div className="text-sm font-bold mb-1">Total cost</div>
              <div className="text-2xl font-bold">${((state.billing?.currentMonth || 0) * 0.4).toFixed(2)}</div>
            </div>
            <div className="mt-4">
              <Link to="/billing/cost-explorer" className="text-xs text-aws-blue hover:underline flex items-center gap-1">
                Analyze your costs in Cost Explorer <ExternalLink size={10} />
              </Link>
            </div>
          </div>

          {/* Account attributes */}
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-3">Account attributes</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-aws-text-secondary">Default VPC</span>
                <div className="text-aws-blue hover:underline cursor-pointer font-mono text-xs">vpc-0abc1234def56789</div>
              </div>
              <div>
                <span className="text-aws-text-secondary">Settings</span>
                <div>
                  <Link to="/ec2" className="text-aws-blue hover:underline text-xs">EBS encryption</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceLink({ label, count, to, color = '' }) {
  const content = (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${to && count > 0 ? 'text-aws-blue hover:underline' : 'text-aws-text'}`}>{label}</span>
      <span className={`text-sm font-medium ${color}`}>{count}</span>
    </div>
  );

  if (to && count > 0) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}
