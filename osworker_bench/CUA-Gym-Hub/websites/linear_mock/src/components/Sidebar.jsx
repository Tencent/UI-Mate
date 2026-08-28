import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Inbox, User, FolderOpen, RefreshCw, Eye, Flag,
  List, Layers, ChevronDown, ChevronRight,
  Settings, Search, Plus, LayoutGrid, Star, Map,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar } from './Icons.jsx';
import './Sidebar.css';

function useSidLink() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  return (path) => sid ? `${path}?sid=${sid}` : path;
}

function SideNavItem({ to, icon: Icon, label, badge, end = false }) {
  const withSid = useSidLink();
  return (
    <NavLink to={withSid(to)} end={end} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
      <span className="sidebar-nav-icon"><Icon size={16} /></span>
      <span className="sidebar-nav-label">{label}</span>
      {badge != null && badge > 0 && (
        <span className="sidebar-badge">{badge}</span>
      )}
    </NavLink>
  );
}

function TeamSection({ team }) {
  const { state, dispatch } = useApp();
  const expanded = state.teamSectionsExpanded?.[team.id] !== false;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = (p) => sid ? `${p}?sid=${sid}` : p;

  const activeCycle = (state.cycles || []).find(c => c.id === team.activeCycleId && c.isActive);

  return (
    <div className="sidebar-team-section">
      <button
        className="sidebar-team-header"
        onClick={() => dispatch({ type: 'TOGGLE_TEAM_SECTION', teamId: team.id })}
      >
        <span className="sidebar-team-icon" style={{ background: team.color + '22', color: team.color }}>
          {team.icon}
        </span>
        <span className="sidebar-team-name">{team.name}</span>
        <span className="sidebar-team-chevron">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>
      {expanded && (
        <div className="sidebar-team-children">
          <NavLink to={toPath(`/team/${team.id}/issues`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
            <List size={14} /><span>Issues</span>
          </NavLink>
          <NavLink to={toPath(`/team/${team.id}/board`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
            <LayoutGrid size={14} /><span>Board</span>
          </NavLink>
          <NavLink to={toPath(`/team/${team.id}/backlog`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
            <Layers size={14} /><span>Backlog</span>
          </NavLink>
          {team.triageEnabled && (
            <NavLink to={toPath(`/team/${team.id}/triage`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <Flag size={14} /><span>Triage</span>
            </NavLink>
          )}
          {activeCycle && (
            <NavLink to={toPath(`/team/${team.id}/cycles/${activeCycle.id}`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <RefreshCw size={14} /><span>Active Cycle</span>
              <span className="sidebar-cycle-badge">{activeCycle.name}</span>
            </NavLink>
          )}
          {team.cycleEnabled && (
            <NavLink to={toPath(`/team/${team.id}/cycles`)} end className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <RefreshCw size={14} /><span>Cycles</span>
            </NavLink>
          )}
          <NavLink to={toPath(`/team/${team.id}/projects`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
            <FolderOpen size={14} /><span>Projects</span>
          </NavLink>
          <NavLink to={toPath(`/views`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
            <Eye size={14} /><span>Views</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onCreateIssue, onCommandPalette }) {
  const { state, dispatch } = useApp();
  const withSid = useSidLink();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = (p) => sid ? `${p}?sid=${sid}` : p;
  const [workspacePop, setWorkspacePop] = useState(false);

  const currentUser = state.users?.find(u => u.id === state.currentUserId);
  const unreadCount = state.notifications?.filter(n => !n.isRead && !n.isArchived).length || 0;

  const favorites = state.favorites?.filter(f => f.userId === state.currentUserId) || [];
  const favProjects = favorites.filter(f => f.type === 'project').map(f => state.projects?.find(p => p.id === f.targetId)).filter(Boolean);
  const favViews = favorites.filter(f => f.type === 'view').map(f => state.views?.find(v => v.id === f.targetId)).filter(Boolean);
  const favCycles = favorites.filter(f => f.type === 'cycle').map(f => {
    const cycle = state.cycles?.find(c => c.id === f.targetId);
    const team = cycle ? state.teams?.find(t => t.id === cycle.teamId) : null;
    return cycle ? { ...cycle, teamName: team?.name } : null;
  }).filter(Boolean);

  if (state.sidebarCollapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <button className="sidebar-collapse-icon" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} title="Expand sidebar">
          <span style={{ fontSize: 18 }}>⚡</span>
        </button>
        <button className="sidebar-icon-btn" onClick={onCreateIssue} title="Create issue"><Plus size={16} /></button>
        <button className="sidebar-icon-btn" onClick={onCommandPalette} title="Search"><Search size={16} /></button>
        <NavLink to={toPath('/inbox')} className={({ isActive }) => `sidebar-icon-btn ${isActive ? 'active' : ''}`} title="Inbox">
          <Inbox size={16} />
          {unreadCount > 0 && <span className="sidebar-badge-dot" />}
        </NavLink>
        <NavLink to={toPath('/my-issues')} className={({ isActive }) => `sidebar-icon-btn ${isActive ? 'active' : ''}`} title="My Issues">
          <User size={16} />
        </NavLink>
        <NavLink to={toPath('/roadmap')} className={({ isActive }) => `sidebar-icon-btn ${isActive ? 'active' : ''}`} title="Roadmap">
          <Map size={16} />
        </NavLink>
        <NavLink to={toPath('/settings')} className={({ isActive }) => `sidebar-icon-btn ${isActive ? 'active' : ''}`} title="Settings">
          <Settings size={16} />
        </NavLink>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {/* Workspace header */}
      <div className="sidebar-workspace-wrap">
        <button className="sidebar-workspace" onClick={() => setWorkspacePop(!workspacePop)}>
          <div className="sidebar-workspace-icon">A</div>
          <span className="sidebar-workspace-name">{state.workspace?.name || 'Acme Corp'}</span>
          <ChevronDown size={12} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
        </button>
        {workspacePop && (
          <div className="sidebar-workspace-menu">
            <div className="sidebar-workspace-menu-title">{state.workspace?.name || 'Acme Corp'}</div>
            <button onClick={() => { navigate(toPath('/settings')); setWorkspacePop(false); }}>
              <Settings size={14} />
              Workspace settings
            </button>
            <button onClick={() => { dispatch({ type: 'TOGGLE_SIDEBAR' }); setWorkspacePop(false); }}>
              <ChevronRight size={14} />
              Collapse sidebar
            </button>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="sidebar-actions">
        <button className="sidebar-create-btn" onClick={onCreateIssue}>
          <Plus size={14} /> <span>Create issue</span>
        </button>
      </div>

      {/* Search */}
      <button className="sidebar-search" onClick={onCommandPalette}>
        <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
        <span className="sidebar-search-label">Search</span>
        <span className="sidebar-search-kbd">&#x2318;K</span>
      </button>

      {/* Main nav */}
      <nav className="sidebar-nav">
        <SideNavItem to="/inbox" icon={Inbox} label="Inbox" badge={unreadCount} />
        <SideNavItem to="/my-issues" icon={User} label="My Issues" />
      </nav>

      {/* Favorites */}
      {(favProjects.length > 0 || favViews.length > 0 || favCycles.length > 0) && (
        <div className="sidebar-section">
          <div className="sidebar-section-header">Favorites</div>
          {favProjects.map(p => (
            <NavLink key={p.id} to={toPath(`/project/${p.id}`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <FolderOpen size={14} style={{ color: p.color }} />
              <span>{p.name}</span>
              <Star size={10} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
            </NavLink>
          ))}
          {favViews.map(v => (
            <NavLink key={v.id} to={toPath(`/views/${v.id}`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <Eye size={14} />
              <span>{v.name}</span>
              <Star size={10} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
            </NavLink>
          ))}
          {favCycles.map(c => (
            <NavLink key={c.id} to={toPath(`/team/${c.teamId}/cycles/${c.id}`)} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
              <RefreshCw size={14} />
              <span>{c.name}</span>
              <Star size={10} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
            </NavLink>
          ))}
        </div>
      )}

      {/* Teams */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-header">Your teams</div>
        {state.teams?.map(team => (
          <TeamSection key={team.id} team={team} />
        ))}
      </div>

      {/* Global sections */}
      <div className="sidebar-section">
        <NavLink to={toPath('/roadmap')} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
          <Map size={14} />
          <span>Roadmap</span>
        </NavLink>
        <NavLink to={toPath('/views')} className={({ isActive }) => `sidebar-child-item ${isActive ? 'active' : ''}`}>
          <Eye size={14} />
          <span>Views</span>
        </NavLink>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <NavLink to={toPath('/settings')} className={({ isActive }) => `sidebar-bottom-item ${isActive ? 'active' : ''}`}>
          <Settings size={14} />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-user">
          <Avatar user={currentUser} size={22} />
          <span className="sidebar-user-name">{currentUser?.displayName || 'Alex'}</span>
        </div>
      </div>
    </aside>
  );
}
