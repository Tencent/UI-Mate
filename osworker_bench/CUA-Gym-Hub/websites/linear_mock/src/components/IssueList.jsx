import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { StatusIcon } from './Icons.jsx';
import IssueRow from './IssueRow.jsx';
import './IssueList.css';

function groupIssues(issues, groupBy, state) {
  if (!groupBy || groupBy === 'none') {
    return [{ id: 'all', label: 'All Issues', issues }];
  }

  if (groupBy === 'status') {
    // Group by team's workflow states
    const stateMap = new Map();
    const allStates = state.teams?.flatMap(t => t.workflowStates) || [];
    issues.forEach(issue => {
      const wfState = allStates.find(s => s.id === issue.stateId);
      const key = issue.stateId;
      if (!stateMap.has(key)) {
        stateMap.set(key, { id: key, label: wfState?.name || 'Unknown', state: wfState, issues: [] });
      }
      stateMap.get(key).issues.push(issue);
    });
    // Sort by category order
    const categoryOrder = ['triage', 'backlog', 'unstarted', 'started', 'completed', 'canceled'];
    return [...stateMap.values()].sort((a, b) => {
      const ai = categoryOrder.indexOf(a.state?.category || '');
      const bi = categoryOrder.indexOf(b.state?.category || '');
      return ai - bi;
    });
  }

  if (groupBy === 'priority') {
    const priorities = [1, 2, 3, 4, 0];
    const labels = { 0: 'No priority', 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low' };
    const map = new Map();
    priorities.forEach(p => map.set(p, { id: String(p), label: labels[p], priority: p, issues: [] }));
    issues.forEach(i => map.get(i.priority)?.issues.push(i));
    return [...map.values()].filter(g => g.issues.length > 0);
  }

  if (groupBy === 'assignee') {
    const map = new Map();
    map.set('unassigned', { id: 'unassigned', label: 'Unassigned', issues: [] });
    issues.forEach(issue => {
      const key = issue.assigneeId || 'unassigned';
      if (!map.has(key)) {
        const user = state.users?.find(u => u.id === key);
        map.set(key, { id: key, label: user?.name || 'Unknown', issues: [] });
      }
      map.get(key).issues.push(issue);
    });
    return [...map.values()].filter(g => g.issues.length > 0);
  }

  if (groupBy === 'project') {
    const map = new Map();
    map.set('none', { id: 'none', label: 'No project', issues: [] });
    issues.forEach(issue => {
      const key = issue.projectId || 'none';
      if (!map.has(key)) {
        const project = state.projects?.find(p => p.id === key);
        map.set(key, { id: key, label: project?.name || 'Unknown', issues: [] });
      }
      map.get(key).issues.push(issue);
    });
    return [...map.values()].filter(g => g.issues.length > 0);
  }

  return [{ id: 'all', label: 'All', issues }];
}

function IssueGroup({ group, showProject, defaultExpanded = true, selectedIds = [], onSelectIssue }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { state } = useApp();
  const allStates = state.teams?.flatMap(t => t.workflowStates) || [];
  const wfState = group.state || allStates.find(s => s.id === group.id);

  return (
    <div className="issue-group">
      <button className="issue-group-header" onClick={() => setExpanded(!expanded)}>
        <span className="issue-group-chevron">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {wfState && <StatusIcon state={wfState} size={14} />}
        <span className="issue-group-label">{group.label}</span>
        <span className="issue-group-count">{group.issues.length}</span>
      </button>
      {expanded && (
        <div className="issue-group-body">
          {group.issues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              showProject={showProject}
              selected={selectedIds.includes(issue.id)}
              onSelect={onSelectIssue}
            />
          ))}
          {group.issues.length === 0 && (
            <div className="issue-group-empty">No issues</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IssueList({
  issues = [],
  groupBy = 'status',
  showProject = false,
  emptyMessage = 'No issues',
  selectedIds = [],
  onSelectIssue,
}) {
  const { state } = useApp();
  const groups = groupIssues(issues, groupBy, state);

  if (issues.length === 0) {
    return (
      <div className="issue-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="issue-list">
      {groups.map(group => (
        <IssueGroup
          key={group.id}
          group={group}
          showProject={showProject}
          selectedIds={selectedIds}
          onSelectIssue={onSelectIssue}
        />
      ))}
    </div>
  );
}
