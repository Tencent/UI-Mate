import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { RefreshCw, ChevronDown, Copy, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const STATE_COLORS = {
  running: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  stopped: { dot: 'bg-red-400', text: 'text-gray-700', bg: 'bg-gray-100' },
  pending: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  stopping: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  'shutting-down': { dot: 'bg-red-400 animate-pulse', text: 'text-red-700', bg: 'bg-red-50' },
  terminated: { dot: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-50' },
};

export default function EC2InstanceDetail() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, addFlash } = useStore();
  const [activeTab, setActiveTab] = useState('Details');
  const [stateDropdown, setStateDropdown] = useState(false);
  const [actionsDropdown, setActionsDropdown] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [addTagForm, setAddTagForm] = useState(false);
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const instance = state.ec2.find(i => i.id === instanceId);

  if (!instance) {
    return (
      <div className="aws-card">
        <div className="aws-empty-state">
          <div className="aws-empty-state-title">Instance not found</div>
          <div className="aws-empty-state-description">Instance {instanceId} does not exist or has been terminated.</div>
          <Link to="/ec2" className="aws-btn aws-btn-primary mt-4">Back to instances</Link>
        </div>
      </div>
    );
  }

  const colors = STATE_COLORS[instance.state] || STATE_COLORS.running;
  const instanceVolumes = (state.volumes || []).filter(v => v.attachedTo === instance.id);
  const instanceSGs = (state.securityGroups || []).filter(sg => (instance.securityGroups || []).includes(sg.id));

  const tabs = ['Details', 'Security', 'Networking', 'Storage', 'Status checks', 'Monitoring', 'Tags'];

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-1 p-0.5 hover:bg-gray-100 rounded inline-flex items-center"
      title="Copy"
    >
      {copiedField === field ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
    </button>
  );

  const handleStateChange = (action) => {
    setStateDropdown(false);
    if (action === 'start') {
      dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'pending' } });
      setTimeout(() => dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'running' } }), 2000);
      addFlash('success', `Instance ${instance.id} is starting...`);
    } else if (action === 'stop') {
      dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'stopping' } });
      setTimeout(() => dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'stopped' } }), 2000);
      addFlash('success', `Instance ${instance.id} is stopping...`);
    } else if (action === 'reboot') {
      dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'pending' } });
      setTimeout(() => dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'running' } }), 2000);
      addFlash('info', `Instance ${instance.id} is rebooting...`);
    } else if (action === 'terminate') {
      dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: instance.id, state: 'shutting-down' } });
      setTimeout(() => {
        dispatch({ type: 'TERMINATE_INSTANCE', payload: instance.id });
        navigate('/ec2');
      }, 2000);
      addFlash('warning', `Instance ${instance.id} is being terminated...`);
    }
  };

  const handleAddTag = () => {
    if (!newTagKey.trim()) return;
    dispatch({ type: 'UPDATE_INSTANCE_TAGS', payload: { id: instance.id, tags: [...(instance.tags || []), { Key: newTagKey.trim(), Value: newTagValue.trim() }] } });
    addFlash('success', 'Tag added successfully');
    setNewTagKey('');
    setNewTagValue('');
    setAddTagForm(false);
  };

  const handleRemoveTag = (tagKey) => {
    dispatch({ type: 'UPDATE_INSTANCE_TAGS', payload: { id: instance.id, tags: (instance.tags || []).filter(t => t.Key !== tagKey) } });
    addFlash('success', 'Tag removed');
  };

  return (
    <div className="space-y-0">
      {/* Instance Summary Header - matches real XWS Console */}
      <div className="aws-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">
              Instance summary for {instance.id} ({instance.name || 'unnamed'})
              <span className="text-aws-blue text-xs font-normal ml-2 cursor-pointer hover:underline">Info</span>
            </h1>
            <div className="text-xs text-aws-text-disabled mt-0.5">Updated less than a minute ago</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowConnect(true)} disabled={instance.state !== 'running'}>Connect</button>
            <div className="relative">
              <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" onClick={() => setStateDropdown(!stateDropdown)}>
                Instance state <ChevronDown size={12} />
              </button>
              {stateDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-aws-border shadow-lg z-20 w-44" style={{ borderRadius: 8 }}>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('start')} disabled={instance.state === 'running'}>Start instance</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('stop')} disabled={instance.state === 'stopped'}>Stop instance</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('reboot')}>Reboot instance</button>
                  <hr className="border-gray-100" />
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-aws-error" onClick={() => handleStateChange('terminate')}>Terminate instance</button>
                </div>
              )}
            </div>
            <div className="relative">
              <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" onClick={() => setActionsDropdown(!actionsDropdown)}>
                Actions <ChevronDown size={12} />
              </button>
              {actionsDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-aws-border shadow-lg z-20 w-52" style={{ borderRadius: 8 }}>
                  <div className="px-3 py-1.5 text-xs font-bold text-aws-text-secondary uppercase tracking-wide">Instance settings</div>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setActionsDropdown(false); setActiveTab('Tags'); }}>Edit tags</button>
                  <hr className="border-gray-100" />
                  <div className="px-3 py-1.5 text-xs font-bold text-aws-text-secondary uppercase tracking-wide">Monitor and troubleshoot</div>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setActionsDropdown(false); setActiveTab('Monitoring'); }}>View CloudWatch metrics</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setActionsDropdown(false); setActiveTab('Status checks'); }}>View status checks</button>
                  <hr className="border-gray-100" />
                  <div className="px-3 py-1.5 text-xs font-bold text-aws-text-secondary uppercase tracking-wide">Image and templates</div>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setActionsDropdown(false); addFlash('info', 'Create image initiated (simulated in mock)'); }}>Create image</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instance summary key-value grid matching real AWS */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
          <div>
            <div className="text-aws-text-secondary">Instance ID</div>
            <div className="font-mono flex items-center gap-1">
              <span className="text-aws-blue">{instance.id}</span>
              <CopyBtn text={instance.id} field="id" />
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Public IPv4 address</div>
            <div className="flex items-center gap-1">
              <span>{instance.publicIp}</span>
              {instance.publicIp !== '-' && (
                <span className="text-aws-blue text-xs hover:underline cursor-pointer ml-1">open address</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Private IPv4 addresses</div>
            <div>{instance.privateIp}</div>
          </div>
          <div>
            <div className="text-aws-text-secondary">IPv6 address</div>
            <div>–</div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Instance state</div>
            <div className={`flex items-center gap-1.5 ${colors.text}`}>
              <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
              {instance.state}
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Public DNS</div>
            <div className="text-xs font-mono truncate">
              {instance.publicIp !== '-' ? `ec2-${instance.publicIp.replace(/\./g, '-')}.${instance.az.replace(/[a-z]$/, '')}.compute.amazonaws.com` : '–'}
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Hostname type</div>
            <div className="text-xs">IP name: ip-{instance.privateIp.replace(/\./g, '-')}.{instance.az.replace(/[a-z]$/, '')}.compute.internal</div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Instance type</div>
            <div className="text-aws-blue hover:underline cursor-pointer">{instance.type}</div>
          </div>
          <div>
            <div className="text-aws-text-secondary">VPC ID</div>
            <div className="text-aws-blue hover:underline cursor-pointer font-mono text-xs flex items-center gap-1">
              {instance.vpcId} <CopyBtn text={instance.vpcId} field="vpc" />
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Auto-assigned IP address</div>
            <div>{instance.publicIp !== '-' ? `${instance.publicIp} [Public IP]` : '–'}</div>
          </div>
          <div>
            <div className="text-aws-text-secondary">Subnet ID</div>
            <div className="text-aws-blue hover:underline cursor-pointer font-mono text-xs flex items-center gap-1">
              {instance.subnetId} <CopyBtn text={instance.subnetId} field="subnet" />
            </div>
          </div>
          <div>
            <div className="text-aws-text-secondary">IAM role</div>
            <div>–</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="aws-card mt-0 border-t-0 p-0">
        <div className="flex gap-0 border-b border-aws-border px-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-4 pt-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-aws-blue text-aws-blue'
                  : 'border-transparent text-aws-text-secondary hover:text-aws-text hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'Details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3">Instance summary</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  <KV label="Instance ID" value={instance.id} mono copy onCopy={() => copyToClipboard(instance.id, 'detail-id')} copied={copiedField === 'detail-id'} />
                  <KV label="Instance state" value={<span className={`inline-flex items-center gap-1.5 ${colors.text}`}><span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>{instance.state}</span>} />
                  <KV label="Instance type" value={instance.type} />
                  <KV label="Availability zone" value={instance.az} />
                  <KV label="Public IPv4 address" value={instance.publicIp || '-'} mono />
                  <KV label="Private IPv4 address" value={instance.privateIp} mono />
                  <KV label="Public IPv4 DNS" value={instance.publicIp !== '-' ? `ec2-${(instance.publicIp || '').replace(/\./g, '-')}.compute-1.amazonaws.com` : '-'} mono />
                  <KV label="Private IPv4 DNS" value={`ip-${(instance.privateIp || '').replace(/\./g, '-')}.ec2.internal`} mono />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="text-sm font-bold mb-3">Instance details</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  <KV label="AMI ID" value={instance.ami} mono link />
                  <KV label="AMI name" value={instance.amiName} />
                  <KV label="Platform" value={instance.platform} />
                  <KV label="Key pair name" value={instance.keyPair || '-'} link />
                  <KV label="IAM role" value={instance.iamRole || '-'} link />
                  <KV label="Monitoring" value={instance.monitoring === 'enabled' ? 'Enabled (detailed)' : 'Disabled (basic)'} />
                  <KV label="Launch time" value={instance.launchTime ? format(new Date(instance.launchTime), 'MMM d, yyyy HH:mm:ss z') : '-'} />
                  <KV label="Root device type" value={instance.rootDeviceType || 'ebs'} />
                  <KV label="Root device name" value={instance.rootDeviceName || '/dev/xvda'} />
                  <KV label="VPC ID" value={instance.vpcId} mono link />
                  <KV label="Subnet ID" value={instance.subnetId} mono link />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3">Security groups</h3>
                <table className="aws-table">
                  <thead>
                    <tr><th>Security group name</th><th>Security group ID</th><th>Inbound rules</th><th>Outbound rules</th></tr>
                  </thead>
                  <tbody>
                    {instanceSGs.length > 0 ? instanceSGs.map(sg => (
                      <tr key={sg.id}>
                        <td><Link to="/ec2/security-groups" className="text-aws-blue hover:underline">{sg.name}</Link></td>
                        <td className="font-mono text-sm">{sg.id}</td>
                        <td>{sg.inboundRules?.length || 0}</td>
                        <td>{sg.outboundRules?.length || 0}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-aws-text-secondary">
                        {(instance.securityGroups || []).map(sgId => <span key={sgId} className="font-mono text-sm mr-2">{sgId}</span>)}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-3">IAM role</h3>
                <div className="text-sm">
                  {instance.iamRole ? (
                    <span className="text-aws-blue hover:underline cursor-pointer">{instance.iamRole}</span>
                  ) : (
                    <span className="text-aws-text-secondary">No IAM role attached</span>
                  )}
                </div>
              </div>

              {instanceSGs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-3">Inbound rules</h3>
                  <table className="aws-table">
                    <thead><tr><th>Name</th><th>Security group rule ID</th><th>IP version</th><th>Type</th><th>Protocol</th><th>Port range</th><th>Source</th></tr></thead>
                    <tbody>
                      {instanceSGs.flatMap(sg => (sg.inboundRules || []).map((rule, i) => (
                        <tr key={`${sg.id}-in-${i}`}>
                          <td>{rule.description || '-'}</td>
                          <td className="font-mono text-sm">sgr-{(sg.id + i).slice(3, 15).padEnd(12, '0')}</td>
                          <td>IPv4</td>
                          <td>{rule.type || 'Custom TCP'}</td>
                          <td>{rule.protocol || 'TCP'}</td>
                          <td>{rule.port || rule.portRange || '-'}</td>
                          <td className="font-mono text-sm">{rule.source || '0.0.0.0/0'}</td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Networking' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3">Networking details</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  <KV label="VPC ID" value={instance.vpcId} mono link />
                  <KV label="Subnet ID" value={instance.subnetId} mono link />
                  <KV label="Availability zone" value={instance.az} />
                  <KV label="Private IPv4 address" value={instance.privateIp} mono />
                  <KV label="Public IPv4 address" value={instance.publicIp || '-'} mono />
                  <KV label="Private DNS name" value={`ip-${(instance.privateIp || '').replace(/\./g, '-')}.ec2.internal`} mono />
                  <KV label="Public DNS name" value={instance.publicIp !== '-' ? `ec2-${(instance.publicIp || '').replace(/\./g, '-')}.compute-1.amazonaws.com` : '-'} mono />
                  <KV label="Source/dest check" value="Enabled" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-3">Network interfaces</h3>
                <table className="aws-table">
                  <thead><tr><th>Network interface ID</th><th>Subnet ID</th><th>VPC ID</th><th>Private IPv4</th><th>Public IPv4</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-sm text-aws-blue hover:underline cursor-pointer">eni-{instance.id.slice(2, 18)}</td>
                      <td className="font-mono text-sm">{instance.subnetId}</td>
                      <td className="font-mono text-sm">{instance.vpcId}</td>
                      <td className="font-mono text-sm">{instance.privateIp}</td>
                      <td className="font-mono text-sm">{instance.publicIp || '-'}</td>
                      <td><span className="aws-badge aws-badge-success">in-use</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Storage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3">Root device details</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  <KV label="Root device type" value={instance.rootDeviceType || 'ebs'} />
                  <KV label="Root device name" value={instance.rootDeviceName || '/dev/xvda'} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-3">Block devices</h3>
                <table className="aws-table">
                  <thead><tr><th>Device name</th><th>Volume ID</th><th>Volume size (GiB)</th><th>Volume type</th><th>IOPS</th><th>Encrypted</th><th>Status</th><th>Delete on termination</th></tr></thead>
                  <tbody>
                    {instanceVolumes.length > 0 ? instanceVolumes.map(v => (
                      <tr key={v.id}>
                        <td>{v.device || instance.rootDeviceName || '/dev/xvda'}</td>
                        <td><Link to="/ec2/volumes" className="font-mono text-sm text-aws-blue hover:underline">{v.id}</Link></td>
                        <td>{v.size}</td>
                        <td>{v.volumeType}</td>
                        <td>{v.iops || '-'}</td>
                        <td>{v.encrypted ? 'Yes' : 'No'}</td>
                        <td><span className="aws-badge aws-badge-success">attached</span></td>
                        <td>Yes</td>
                      </tr>
                    )) : (
                      <tr>
                        <td>{instance.rootDeviceName || '/dev/xvda'}</td>
                        <td className="font-mono text-sm text-aws-text-secondary">{(instance.volumes || [])[0] || '-'}</td>
                        <td>8</td>
                        <td>gp3</td>
                        <td>3000</td>
                        <td>Yes</td>
                        <td><span className="aws-badge aws-badge-success">attached</span></td>
                        <td>Yes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Status checks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-aws-border p-4" style={{ borderRadius: 8 }}>
                  <h3 className="text-sm font-bold mb-2">System status checks</h3>
                  {instance.state === 'running' ? (
                    <div className="flex items-center gap-2 text-sm text-aws-success">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      System reachability check passed
                    </div>
                  ) : (
                    <div className="text-sm text-aws-text-secondary">Instance is not running</div>
                  )}
                </div>
                <div className="border border-aws-border p-4" style={{ borderRadius: 8 }}>
                  <h3 className="text-sm font-bold mb-2">Instance status checks</h3>
                  {instance.state === 'running' ? (
                    <div className="flex items-center gap-2 text-sm text-aws-success">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Instance reachability check passed
                    </div>
                  ) : (
                    <div className="text-sm text-aws-text-secondary">Instance is not running</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Monitoring' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">CloudWatch monitoring</h3>
                <span className="text-xs text-aws-text-secondary">{instance.monitoring === 'enabled' ? 'Detailed monitoring enabled' : 'Basic monitoring'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['CPUUtilization', 'NetworkIn', 'NetworkOut', 'DiskReadOps', 'DiskWriteOps', 'StatusCheckFailed'].map(metric => (
                  <div key={metric} className="border border-aws-border p-4" style={{ borderRadius: 8 }}>
                    <div className="text-xs font-medium text-aws-text-secondary mb-2">{metric}</div>
                    <div className="h-24 bg-gray-50 flex items-center justify-center text-xs text-aws-text-disabled" style={{ borderRadius: 4 }}>
                      {instance.state === 'running' ? (
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                          <polyline
                            fill="none"
                            stroke="#0972D3"
                            strokeWidth="1.5"
                            points={Array.from({ length: 20 }, (_, i) => `${i * 10},${30 + Math.sin(i * 0.8 + metric.length) * 15 + Math.cos(i * 0.3 + metric.charCodeAt(0)) * 5}`).join(' ')}
                          />
                        </svg>
                      ) : 'No data available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Tags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Tags ({(instance.tags || []).length})</h3>
                <button className="aws-btn aws-btn-primary text-xs" onClick={() => setAddTagForm(true)}>Manage tags</button>
              </div>
              <table className="aws-table">
                <thead><tr><th>Key</th><th>Value</th><th className="w-20">Action</th></tr></thead>
                <tbody>
                  {(instance.tags || []).map((t, i) => (
                    <tr key={i}>
                      <td className="font-medium">{t.Key}</td>
                      <td>{t.Value}</td>
                      <td>
                        <button className="text-xs text-aws-error hover:underline" onClick={() => handleRemoveTag(t.Key)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {(instance.tags || []).length === 0 && (
                    <tr><td colSpan={3} className="text-center text-aws-text-secondary py-4">No tags</td></tr>
                  )}
                </tbody>
              </table>

              {addTagForm && (
                <div className="border border-aws-border p-4 space-y-3" style={{ borderRadius: 8 }}>
                  <h4 className="text-sm font-bold">Add tag</h4>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-aws-text-secondary mb-1">Key</label>
                      <input className="aws-input" value={newTagKey} onChange={e => setNewTagKey(e.target.value)} placeholder="Enter key" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-aws-text-secondary mb-1">Value</label>
                      <input className="aws-input" value={newTagValue} onChange={e => setNewTagValue(e.target.value)} placeholder="Enter value" />
                    </div>
                    <button className="aws-btn aws-btn-primary text-xs" onClick={handleAddTag} disabled={!newTagKey.trim()}>Add</button>
                    <button className="aws-btn aws-btn-secondary text-xs" onClick={() => setAddTagForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showConnect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border" style={{ borderRadius: 8 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Connect to instance: {instance.id}</h3>
              <button onClick={() => setShowConnect(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="border border-aws-border p-3" style={{ borderRadius: 8 }}>
                <div className="font-bold text-sm mb-2">EC2 Instance Connect</div>
                <div className="text-sm text-aws-text-secondary mb-3">Connect using your browser.</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-aws-text-disabled mb-1">Instance ID</div>
                    <div className="font-mono">{instance.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-aws-text-disabled mb-1">Public IP address</div>
                    <div className="font-mono">{instance.publicIp || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-aws-text-disabled mb-1">Username</div>
                    <input className="aws-input text-sm" defaultValue="ec2-user" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowConnect(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={() => { addFlash('success', `Connecting to ${instance.id} via EC2 Instance Connect (simulated)`); setShowConnect(false); }}>Connect</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KV({ label, value, mono, link, copy, onCopy, copied }) {
  return (
    <div>
      <div className="text-xs text-aws-text-secondary mb-0.5">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono' : ''} ${link ? 'text-aws-blue hover:underline cursor-pointer' : 'text-aws-text'}`}>
        {value || '-'}
        {copy && (
          <button onClick={onCopy} className="ml-1 p-0.5 hover:bg-gray-100 rounded inline-flex items-center">
            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
          </button>
        )}
      </div>
    </div>
  );
}
