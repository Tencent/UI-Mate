import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, ChevronDown, Settings } from 'lucide-react';

const INSTANCE_TYPES = [
  { type: 'm8g.24xlarge', freeTier: false, vcpus: 96, arch: 'arm64', memory: 384, storage: '-', storageType: '-', network: '40 Gigabit' },
  { type: 'm5a.4xlarge', freeTier: false, vcpus: 16, arch: 'x86_64', memory: 64, storage: '-', storageType: '-', network: 'Up to 10 Gigabit' },
  { type: 'm8i.12xlarge', freeTier: false, vcpus: 48, arch: 'x86_64', memory: 192, storage: '-', storageType: '-', network: '22.5 Gigabit' },
  { type: 'm5zn.2xlarge', freeTier: false, vcpus: 8, arch: 'x86_64', memory: 32, storage: '-', storageType: '-', network: 'Up to 25 Gigabit' },
  { type: 'i2.2xlarge', freeTier: false, vcpus: 8, arch: 'x86_64', memory: 61, storage: 1600, storageType: 'ssd', network: 'High' },
  { type: 'm6id.xlarge', freeTier: false, vcpus: 4, arch: 'x86_64', memory: 16, storage: 237, storageType: 'ssd', network: 'Up to 12.5 Gigabit' },
  { type: 't2.micro', freeTier: true, vcpus: 1, arch: 'x86_64', memory: 1, storage: '-', storageType: '-', network: 'Low to Moderate' },
  { type: 't3.micro', freeTier: true, vcpus: 2, arch: 'x86_64', memory: 1, storage: '-', storageType: '-', network: 'Low to Moderate' },
  { type: 't3.small', freeTier: false, vcpus: 2, arch: 'x86_64', memory: 2, storage: '-', storageType: '-', network: 'Low to Moderate' },
  { type: 't3.medium', freeTier: false, vcpus: 2, arch: 'x86_64', memory: 4, storage: '-', storageType: '-', network: 'Low to Moderate' },
  { type: 'm5.large', freeTier: false, vcpus: 2, arch: 'x86_64', memory: 8, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
  { type: 'm5.xlarge', freeTier: false, vcpus: 4, arch: 'x86_64', memory: 16, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
  { type: 'c5.large', freeTier: false, vcpus: 2, arch: 'x86_64', memory: 4, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
  { type: 'c5.xlarge', freeTier: false, vcpus: 4, arch: 'x86_64', memory: 8, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
  { type: 'r5.large', freeTier: false, vcpus: 2, arch: 'x86_64', memory: 16, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
  { type: 'r5.xlarge', freeTier: false, vcpus: 4, arch: 'x86_64', memory: 32, storage: '-', storageType: '-', network: 'Up to 10 Gbps' },
];

export default function EC2InstanceTypes() {
  const { addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filtered = INSTANCE_TYPES.filter(t =>
    !search || t.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-0">
      <div className="aws-card p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Instance types ({filtered.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs">Instance type finder</button>
            <div className="relative">
              <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1">
                Actions <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Find instance type by attribute" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-xs text-aws-text-secondary ml-auto">
            <button className="px-2 py-0.5 border border-aws-border rounded hover:bg-gray-50" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&lt;</button>
            <span>{page} of {totalPages}</span>
            <button className="px-2 py-0.5 border border-aws-border rounded hover:bg-gray-50" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
            <button className="p-1.5 hover:bg-gray-100 rounded"><Settings size={14} className="text-aws-text-secondary" /></button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr>
                <th className="w-8"><input type="checkbox" /></th>
                <th>
                  <span className="flex items-center gap-1">
                    Instance type
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Free ...
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    vCPUs
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                </th>
                <th>Architecture</th>
                <th>Memory (GiB)</th>
                <th>Storage (GB)</th>
                <th>Storage type</th>
                <th>Network performance</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(t => (
                <tr key={t.type} className={selectedTypes.includes(t.type) ? 'bg-blue-50/50' : ''}>
                  <td>
                    <input type="checkbox" checked={selectedTypes.includes(t.type)} onChange={e => {
                      if (e.target.checked) setSelectedTypes([...selectedTypes, t.type]);
                      else setSelectedTypes(selectedTypes.filter(x => x !== t.type));
                    }} />
                  </td>
                  <td className="text-aws-blue hover:underline cursor-pointer font-medium">{t.type}</td>
                  <td>{t.freeTier ? 'true' : 'false'}</td>
                  <td>{t.vcpus}</td>
                  <td>{t.arch}</td>
                  <td>{t.memory}</td>
                  <td>{t.storage}</td>
                  <td>{t.storageType}</td>
                  <td>{t.network}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expandable section */}
        <div className="px-4 py-3 border-t border-aws-border">
          <button className="flex items-center gap-2 text-sm font-bold">
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-aws-text-secondary">
              <path d="M3 5 L6 8 L9 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Select an instance type
          </button>
        </div>
      </div>
    </div>
  );
}
