import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CircleDot, GitMerge, Users, Tag, KanbanSquare, Milestone, BookOpen, GitBranch, GitCommit, Tags, Scale, Rocket, Settings, ChevronDown, ChevronRight, Layers, Play, Package, MonitorDot, BarChart2, Home, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

function SidebarSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="gl-sidebar-section">
      <div className="gl-sidebar-section-header" onClick={() => setOpen(o => !o)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </div>
      {open && children}
    </div>
  )
}

function SItem({ to, icon: Icon, label, badge }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <NavLink to={to} className={({ isActive: a }) => `gl-sidebar-item${a || isActive ? ' active' : ''}`}
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', color: isActive ? 'var(--gl-purple-dark)' : 'var(--gl-text-primary)', background: isActive ? 'var(--gl-success-bg, #E6E0F5)' : 'transparent' }}
      end={to.split('/').length < 5}>
      {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && <span className="gl-sidebar-badge">{badge}</span>}
    </NavLink>
  )
}

export default function Sidebar({ project, group, projectPath }) {
  const { state } = useApp()
  const base = `/${group}/${projectPath}`
  const openIssues = state.issues.filter(i => i.projectId === project.id && i.state === 'opened').length
  const openMRs = state.mergeRequests.filter(m => m.projectId === project.id && m.state === 'opened').length
  const avatarColor = project.avatarColor || '#6B4FBB'
  const initial = project.name.charAt(0).toUpperCase()

  return (
    <aside style={{
      width: '220px', background: 'var(--gl-bg-secondary)', borderRight: '1px solid var(--gl-border)',
      overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
    }}>
      {/* Project avatar + name */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--gl-border)' }}>
        <NavLink to={base} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--gl-text-primary)' }}>
          <div style={{ width: '32px', height: '32px', background: avatarColor, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: '1.2' }}>{project.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--gl-text-secondary)' }}>{group}</div>
          </div>
        </NavLink>
      </div>

      <div style={{ padding: '8px 8px', flex: 1 }}>
        {/* Project information */}
        <SItem to={base} icon={Home} label="Project overview" />

        <SidebarSection title="Plan" defaultOpen={true}>
          <SItem to={`${base}/-/issues`} icon={CircleDot} label="Issues" badge={openIssues} />
          <SItem to={`${base}/-/boards`} icon={KanbanSquare} label="Issue boards" />
          <SItem to={`${base}/-/milestones`} icon={Milestone} label="Milestones" />
          <SItem to={`${base}/-/wikis`} icon={BookOpen} label="Wiki" />
        </SidebarSection>

        <SidebarSection title="Code" defaultOpen={true}>
          <SItem to={`${base}/-/merge_requests`} icon={GitMerge} label="Merge requests" badge={openMRs} />
          <SItem to={`${base}/-/tree/main`} icon={Layers} label="Repository" />
          <SItem to={`${base}/-/branches`} icon={GitBranch} label="Branches" />
          <SItem to={`${base}/-/commits/main`} icon={GitCommit} label="Commits" />
          <SItem to={`${base}/-/tags`} icon={Tags} label="Tags" />
          <SItem to={`${base}/-/snippets`} icon={Scale} label="Snippets" />
        </SidebarSection>

        <SidebarSection title="Build" defaultOpen={false}>
          <SItem to={`${base}/-/pipelines`} icon={Play} label="Pipelines" />
        </SidebarSection>

        <SidebarSection title="Deploy" defaultOpen={false}>
          <SItem to={`${base}/-/releases`} icon={Rocket} label="Releases" />
        </SidebarSection>

        <SidebarSection title="Monitor" defaultOpen={false}>
          <SItem to={`${base}/-/pipelines`} icon={MonitorDot} label="Error tracking" />
        </SidebarSection>

        <SidebarSection title="Manage" defaultOpen={false}>
          <SItem to={`${base}/-/project_members`} icon={Users} label="Members" />
          <SItem to={`${base}/-/labels`} icon={Tag} label="Labels" />
        </SidebarSection>

        <SidebarSection title="Settings" defaultOpen={false}>
          <SItem to={`${base}/-/settings/general`} icon={Settings} label="General" />
        </SidebarSection>
      </div>
    </aside>
  )
}
