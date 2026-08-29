import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Monitor, Globe, Table2 as Table, Database, Zap, Package, Box, Server, GitBranch, Shield, Network } from 'lucide-react';

const allCards = {
  Popular: [
    { name: 'Virtual machine', desc: 'Create Linux and Windows virtual machines', icon: Monitor, path: '/virtual-machines/create' },
    { name: 'Web App', desc: 'Quickly create and deploy web apps', icon: Globe, path: '/app-services' },
    { name: 'SQL Database', desc: 'Managed relational SQL Database', icon: Table, path: '/sql-databases' },
    { name: 'Storage account', desc: 'Durable, highly available, scalable storage', icon: Database, path: '/storage-accounts/create' },
    { name: 'Function App', desc: 'Process events with serverless code', icon: Zap, path: '/app-services' },
    { name: 'Container Instances', desc: 'Run containers without managing servers', icon: Package, path: '/all-resources' },
    { name: 'Kubernetes Service', desc: 'Deploy and manage containers', icon: Box, path: '/all-resources' },
    { name: 'Cosmos DB', desc: 'Globally distributed database', icon: Server, path: '/sql-databases' },
  ],
  Compute: [
    { name: 'Virtual machine', desc: 'Create Linux and Windows virtual machines', icon: Monitor, path: '/virtual-machines/create' },
    { name: 'App Service', desc: 'Quickly create and deploy web apps', icon: Globe, path: '/app-services' },
    { name: 'Function App', desc: 'Process events with serverless code', icon: Zap, path: '/app-services' },
    { name: 'Kubernetes Service', desc: 'Deploy and manage containers', icon: Box, path: '/all-resources' },
    { name: 'Container Instances', desc: 'Run containers without managing servers', icon: Package, path: '/all-resources' },
  ],
  Networking: [
    { name: 'Virtual network', desc: 'Isolated and highly-secure environment', icon: Network, path: '/virtual-networks' },
    { name: 'Load Balancer', desc: 'Distribute network traffic', icon: GitBranch, path: '/all-resources' },
    { name: 'Network security group', desc: 'Control network traffic', icon: Shield, path: '/network-security-groups' },
  ],
  Storage: [
    { name: 'Storage account', desc: 'Durable, highly available, scalable storage', icon: Database, path: '/storage-accounts/create' },
  ],
  Databases: [
    { name: 'SQL Database', desc: 'Managed relational SQL Database', icon: Table, path: '/sql-databases' },
    { name: 'Xzure Cosmos DB', desc: 'Globally distributed, multi-model database', icon: Server, path: '/sql-databases' },
  ],
  Web: [
    { name: 'Web App', desc: 'Quickly create and deploy web apps', icon: Globe, path: '/app-services' },
    { name: 'Function App', desc: 'Process events with serverless code', icon: Zap, path: '/app-services' },
  ],
  'AI + Machine Learning': [],
  Containers: [
    { name: 'Container Instances', desc: 'Run containers without managing servers', icon: Package, path: '/all-resources' },
    { name: 'Kubernetes Service', desc: 'Deploy and manage containers', icon: Box, path: '/all-resources' },
  ],
  DevOps: [],
};

const categories = Object.keys(allCards);

export default function CreateResource() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [search, setSearch] = useState('');

  const baseCards = allCards[activeCategory] || [];
  const filteredCards = search
    ? baseCards.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()))
    : baseCards;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Create a resource' }]} />
      <h1 className="page-title">Create a resource</h1>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <input className="input" placeholder="Search services and marketplace" value={search} onChange={e => { setSearch(e.target.value); }} style={{ minWidth: '400px' }} />
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Category sidebar */}
        <div style={{ minWidth: '200px' }}>
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch(''); }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '2px',
                background: activeCategory === cat ? 'var(--xzure-blue-light)' : 'transparent',
                color: activeCategory === cat ? 'var(--xzure-blue)' : 'var(--xzure-text)',
                fontWeight: activeCategory === cat ? 600 : 400,
                marginBottom: '2px'
              }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{ flex: 1 }}>
          {filteredCards.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--xzure-text-secondary)' }}>
              {search ? `No results for "${search}"` : 'No services available in this category yet.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {filteredCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="card" style={{ cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }} onClick={() => navigate(card.path)}>
                    <Icon size={32} color="var(--xzure-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{card.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '8px' }}>{card.desc}</div>
                      <span style={{ color: 'var(--xzure-blue)', fontSize: '13px', fontWeight: 600 }}>Create</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
