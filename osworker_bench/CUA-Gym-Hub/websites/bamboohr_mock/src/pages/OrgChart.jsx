import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GitBranch, Grid, ChevronDown, ChevronRight } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
function getAvatarColor(id) {
  const colors = ['#73C41D','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#795548','#607D8B'];
  return colors[(id || 0) % colors.length];
}

function OrgNode({ employee, allEmployees, level = 0, onClickEmp }) {
  const [collapsed, setCollapsed] = useState(level > 1);
  const directReports = allEmployees.filter(e => e.reportsToId === employee.id && e.status === 'Active');
  const hasReports = directReports.length > 0;

  const name = (employee.preferredName || employee.firstName) + ' ' + employee.lastName;
  const initials = getInitials(name);
  const bg = getAvatarColor(employee.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
      {/* Node */}
      <div
        data-testid={`org-node-${employee.id}`}
        onClick={() => onClickEmp(employee.id)}
        style={{
          background: '#4A8A0C', borderRadius: 6, padding: '10px 16px',
          minWidth: 180, textAlign: 'center', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'transform 0.1s, box-shadow 0.1s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}
      >
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 700, border: '2px solid rgba(255,255,255,0.4)' }}>
          {initials}
        </div>
        <div
          data-testid={`org-node-name-${employee.id}`}
          style={{ color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.3px', lineHeight: 1.3 }}
        >
          {name.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontStyle: 'italic' }}>
          {employee.jobTitle}
        </div>
        {hasReports && (
          <button
            data-testid={`org-collapse-${employee.id}`}
            onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 2 }}
          >
            {collapsed ? <ChevronDown size={12} color="white" /> : <ChevronRight size={12} color="white" />}
          </button>
        )}
      </div>

      {/* Connector + children */}
      {hasReports && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Vertical line down */}
          <div style={{ width: 2, height: 24, background: '#aaa' }} />
          {/* Horizontal line spanning children */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            {directReports.map((child, i) => (
              <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: 16, background: '#aaa' }} />
                <OrgNode employee={child} allEmployees={allEmployees} level={level + 1} onClickEmp={onClickEmp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const activeEmps = (state.employees || []).filter(e => e.status === 'Active');
  // Find CEO (no manager)
  const ceo = activeEmps.find(e => !e.reportsToId);

  function handleClickEmp(id) {
    navigate(navTo(`/people/${id}`));
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Header bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 18, padding: '14px 0', flex: 1 }}>People</span>
        <Link to={navTo('/people')} style={{ padding: '16px 14px', fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none', borderBottom: '3px solid transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Grid size={14} /> Directory
        </Link>
        <Link to={navTo('/people/org-chart')} style={{ padding: '16px 14px', fontSize: 14, fontWeight: 500, color: '#73C41D', textDecoration: 'none', borderBottom: '3px solid #73C41D', display: 'flex', alignItems: 'center', gap: 6 }}>
          <GitBranch size={14} /> Org Chart
        </Link>
      </div>

      <div style={{ padding: '24px', overflowX: 'auto', overflowY: 'auto' }}>
        {ceo && (
          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'max-content' }}>
            <OrgNode
              employee={ceo}
              allEmployees={activeEmps}
              level={0}
              onClickEmp={handleClickEmp}
            />
          </div>
        )}
      </div>
    </div>
  );
}
