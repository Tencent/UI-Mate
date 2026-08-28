
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Megaphone, Mail, Hash, TrendingUp, TrendingDown, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Marketing() {
  const { state } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '', type: 'email', status: 'draft', budget: '', channel: 'email',
  });

  const orders = state.orders || [];
  const discounts = state.discounts || [];
  const customers = state.customers || [];

  // Simulated marketing campaigns from discount data
  const campaigns = [
    { id: 'camp_1', name: 'Summer Sale Email Blast', type: 'email', status: 'active', channel: 'Xhopify Email', sent: 1250, opened: 487, clicked: 156, orders: 23, revenue: 2456.89, startDate: '2024-06-01', endDate: '2024-08-31' },
    { id: 'camp_2', name: 'Welcome Series Automation', type: 'automation', status: 'active', channel: 'Xhopify Email', sent: 850, opened: 612, clicked: 234, orders: 45, revenue: 3789.50, startDate: '2024-01-01', endDate: null },
    { id: 'camp_3', name: 'Instagram Story Ads', type: 'social', status: 'active', channel: 'Instagram', impressions: 45000, clicks: 2340, orders: 67, revenue: 5678.23, startDate: '2024-03-15', endDate: null },
    { id: 'camp_4', name: 'Google Shopping Ads', type: 'search', status: 'active', channel: 'Google Ads', impressions: 120000, clicks: 4500, orders: 89, revenue: 8945.67, startDate: '2024-02-01', endDate: null },
    { id: 'camp_5', name: 'Flash Sale Promo', type: 'email', status: 'completed', channel: 'Xhopify Email', sent: 2100, opened: 840, clicked: 312, orders: 156, revenue: 12456.00, startDate: '2024-02-01', endDate: '2024-02-14' },
    { id: 'camp_6', name: 'Holiday Gift Guide', type: 'email', status: 'completed', channel: 'Xhopify Email', sent: 3200, opened: 1280, clicked: 456, orders: 89, revenue: 7890.45, startDate: '2023-12-01', endDate: '2023-12-25' },
  ];

  const totalRevenue = campaigns.reduce((s, c) => s + (c.revenue || 0), 0);
  const totalOrders = campaigns.reduce((s, c) => s + (c.orders || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const getStatusBadge = (status) => {
    const map = { active: 'badge-success', draft: 'badge-info', completed: 'badge-info', paused: 'badge-warning' };
    return map[status] || 'badge-info';
  };

  const getChannelIcon = (channel) => {
    if (channel.includes('Email')) return <Mail size={14} className="text-[#616161]" />;
    if (channel.includes('Instagram') || channel.includes('Facebook')) return <Hash size={14} className="text-[#616161]" />;
    return <Megaphone size={14} className="text-[#616161]" />;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    // In a real app we'd add to state; here we just close the modal
    setShowCreateModal(false);
    setNewCampaign({ name: '', type: 'email', status: 'draft', budget: '', channel: 'email' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Marketing</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary text-[13px]">
          <Plus size={16} /> Create campaign
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-[13px] text-[#616161]">Active campaigns</div>
          <div className="text-[24px] font-bold text-[#303030] mt-1">{activeCampaigns}</div>
        </div>
        <div className="card">
          <div className="text-[13px] text-[#616161]">Orders from marketing</div>
          <div className="text-[24px] font-bold text-[#303030] mt-1">{totalOrders.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-[13px] text-[#616161]">Revenue from marketing</div>
          <div className="text-[24px] font-bold text-[#303030] mt-1">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="card">
          <div className="text-[13px] text-[#616161]">Email subscribers</div>
          <div className="text-[24px] font-bold text-[#303030] mt-1">{customers.filter(c => c.acceptsMarketing).length}</div>
        </div>
      </div>

      {/* Active discounts quick link */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="card-title">Active discounts</h3>
          <Link to="/discounts" className="btn-plain text-[13px]">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-2">
          {discounts.filter(d => d.status === 'active').slice(0, 3).map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#f9fafb' }}>
              <div>
                <div className="text-[13px] font-medium text-[#303030]">{d.title}</div>
                {d.code && <div className="text-[12px] font-mono text-[#616161]">{d.code}</div>}
              </div>
              <div className="text-[13px] text-[#616161]">
                {d.usageCount || 0} uses
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: '#e3e3e3' }}>
          <h3 className="card-title">Marketing campaigns</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(campaign => (
              <tr key={campaign.id}>
                <td>
                  <div className="font-medium text-[#303030]">{campaign.name}</div>
                  <div className="text-[12px] text-[#616161] capitalize">{campaign.type}</div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-[#616161] text-[13px]">
                    {getChannelIcon(campaign.channel)}
                    {campaign.channel}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td className="text-[#303030]">{campaign.orders}</td>
                <td className="text-[#303030] font-medium">${campaign.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="text-[#616161] text-[12px]">
                  {campaign.startDate}{campaign.endDate ? ` - ${campaign.endDate}` : ' - ongoing'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Create campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Campaign name</label>
                <input
                  required
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="e.g. Spring Sale Email"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Campaign type</label>
                  <select className="w-full text-[13px]" value={newCampaign.type} onChange={e => setNewCampaign(p => ({ ...p, type: e.target.value }))}>
                    <option value="email">Email campaign</option>
                    <option value="social">Social media ad</option>
                    <option value="search">Search ad</option>
                    <option value="automation">Email automation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Channel</label>
                  <select className="w-full text-[13px]" value={newCampaign.channel} onChange={e => setNewCampaign(p => ({ ...p, channel: e.target.value }))}>
                    <option value="email">Xhopify Email</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google Ads</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Budget (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] text-[13px]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full text-[13px] pl-7"
                    placeholder="0.00"
                    value={newCampaign.budget}
                    onChange={e => setNewCampaign(p => ({ ...p, budget: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Create campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
