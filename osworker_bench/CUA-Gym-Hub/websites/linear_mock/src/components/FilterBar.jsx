import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { StatusIcon, PriorityIcon, Avatar, PRIORITY_LABELS } from './Icons.jsx';
import './FilterBar.css';

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = React.useState(false);

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  }

  return (
    <div className="filter-pill-wrapper">
      <button
        className={`filter-pill ${selected.length > 0 ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {label}
        {selected.length > 0 && <span className="filter-pill-count">{selected.length}</span>}
      </button>
      {open && (
        <>
          <div className="filter-backdrop" onClick={() => setOpen(false)} />
          <div className="filter-dropdown">
            {options.map(opt => (
              <button
                key={opt.value}
                className={`filter-option ${selected.includes(opt.value) ? 'selected' : ''}`}
                onClick={() => toggle(opt.value)}
              >
                {opt.icon && <span className="filter-option-icon">{opt.icon}</span>}
                <span>{opt.label}</span>
                {selected.includes(opt.value) && <span className="filter-check">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterBar({ team, filters, onChange }) {
  const { state } = useApp();

  const stateOptions = (team?.workflowStates || []).map(s => ({
    value: s.id,
    label: s.name,
    icon: <StatusIcon state={s} size={13} />,
  }));

  const priorityOptions = [0, 1, 2, 3, 4].map(p => ({
    value: p,
    label: PRIORITY_LABELS[p],
    icon: <PriorityIcon priority={p} size={13} />,
  }));

  const users = state.users?.filter(u => team?.memberIds?.includes(u.id)) || [];
  const assigneeOptions = [
    { value: null, label: 'Unassigned' },
    ...users.map(u => ({
      value: u.id,
      label: u.name,
      icon: <Avatar user={u} size={14} />,
    })),
  ];

  const labelOptions = (state.labels || []).map(l => ({
    value: l.id,
    label: l.name,
  }));

  const projectOptions = (state.projects || [])
    .filter(p => p.teamIds?.includes(team?.id))
    .map(p => ({ value: p.id, label: p.name }));

  const hasFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v);

  return (
    <div className="filter-bar">
      <MultiSelect
        label="Status"
        options={stateOptions}
        selected={filters.stateIds || []}
        onChange={v => onChange({ ...filters, stateIds: v })}
      />
      <MultiSelect
        label="Priority"
        options={priorityOptions}
        selected={filters.priority || []}
        onChange={v => onChange({ ...filters, priority: v })}
      />
      <MultiSelect
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assigneeIds || []}
        onChange={v => onChange({ ...filters, assigneeIds: v })}
      />
      <MultiSelect
        label="Label"
        options={labelOptions}
        selected={filters.labelIds || []}
        onChange={v => onChange({ ...filters, labelIds: v })}
      />
      <MultiSelect
        label="Project"
        options={projectOptions}
        selected={filters.projectIds || []}
        onChange={v => onChange({ ...filters, projectIds: v })}
      />
      {hasFilters && (
        <button className="filter-clear-btn" onClick={() => onChange({})}>
          Clear filters
        </button>
      )}
    </div>
  );
}
