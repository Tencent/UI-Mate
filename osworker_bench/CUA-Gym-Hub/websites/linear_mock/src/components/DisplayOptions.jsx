import React from 'react';
import { X } from 'lucide-react';
import './DisplayOptions.css';

const GROUP_OPTIONS = ['none', 'status', 'priority', 'assignee', 'project'];
const SORT_OPTIONS = ['priority', 'created', 'updated', 'manual'];

export default function DisplayOptions({ groupBy, sortBy, onGroupByChange, onSortByChange, onClose }) {
  return (
    <>
      <div className="display-backdrop" onClick={onClose} />
      <div className="display-options">
        <div className="display-header">
          <span className="display-title">Display</span>
          <button className="display-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="display-section">
          <label className="display-label">Grouping</label>
          <select
            className="display-select"
            value={groupBy}
            onChange={e => onGroupByChange(e.target.value)}
          >
            {GROUP_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'none' ? 'None' : o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="display-section">
          <label className="display-label">Ordering</label>
          <select
            className="display-select"
            value={sortBy}
            onChange={e => onSortByChange(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
