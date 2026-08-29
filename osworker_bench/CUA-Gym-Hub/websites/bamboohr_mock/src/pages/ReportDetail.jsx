import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Download, ChevronUp, ChevronDown } from 'lucide-react';

function HeadcountReport({ state, filters }) {
  const { deptFilter, locFilter } = filters;
  let emps = (state.employees || []).filter(e => e.status === 'Active');
  if (deptFilter) emps = emps.filter(e => e.departmentId === Number(deptFilter));
  if (locFilter) emps = emps.filter(e => e.locationId === Number(locFilter));

  const byDept = {};
  emps.forEach(e => {
    const dept = state.departments?.find(d => d.id === e.departmentId);
    const key = dept?.name || 'Unknown';
    byDept[key] = (byDept[key] || 0) + 1;
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{emps.length}</div>
        <div style={{ fontSize: 14, color: '#666' }}>Total Active Employees</div>
      </div>
      <table className="data-table">
        <thead><tr><th>Department</th><th>Count</th><th>% of Total</th></tr></thead>
        <tbody>
          {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
            <tr key={dept}>
              <td style={{ fontSize: 13 }}>{dept}</td>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{count}</td>
              <td style={{ fontSize: 13 }}>{((count / emps.length) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompensationReport({ state, filters }) {
  const { deptFilter } = filters;
  let emps = (state.employees || []).filter(e => e.status === 'Active' && e.payRate);
  if (deptFilter) emps = emps.filter(e => e.departmentId === Number(deptFilter));

  const sorted = [...emps].sort((a, b) => b.payRate - a.payRate);
  const avg = emps.length > 0 ? emps.reduce((s, e) => s + e.payRate, 0) / emps.length : 0;
  const min = emps.length > 0 ? Math.min(...emps.map(e => e.payRate)) : 0;
  const max = emps.length > 0 ? Math.max(...emps.map(e => e.payRate)) : 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {[['Average', avg], ['Min', min], ['Max', max]].map(([label, val]) => (
          <div key={label} style={{ background: '#f8fdf6', border: '1px solid #c9eb8a', borderRadius: 4, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>${Math.round(val).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <table className="data-table">
        <thead><tr><th>Employee</th><th>Title</th><th>Department</th><th>Pay Rate</th><th>Pay Type</th></tr></thead>
        <tbody>
          {sorted.map(e => {
            const dept = state.departments?.find(d => d.id === e.departmentId);
            return (
              <tr key={e.id}>
                <td style={{ fontSize: 13, fontWeight: 500 }}>{e.displayName}</td>
                <td style={{ fontSize: 13 }}>{e.jobTitle}</td>
                <td style={{ fontSize: 13 }}>{dept?.name || '—'}</td>
                <td style={{ fontSize: 13, fontWeight: 500 }}>
                  {e.payType === 'Salary' ? `$${e.payRate.toLocaleString()}/yr` : `$${e.payRate}/hr`}
                </td>
                <td style={{ fontSize: 13 }}>{e.payType}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TimeOffReport({ state, filters }) {
  const balances = state.timeOffBalances || [];
  const employees = (state.employees || []).filter(e => e.status === 'Active');

  const empBalances = employees.map(emp => {
    const vac = balances.find(b => b.employeeId === emp.id && b.policyId === 1);
    const sick = balances.find(b => b.employeeId === emp.id && b.policyId === 2);
    const dept = state.departments?.find(d => d.id === emp.departmentId);
    return { ...emp, vacAvail: vac?.available || 0, sickAvail: sick?.available || 0, deptName: dept?.name || '—' };
  }).filter(e => e.vacAvail > 0 || e.sickAvail > 0);

  return (
    <table className="data-table">
      <thead><tr><th>Employee</th><th>Department</th><th>Vacation Available</th><th>Sick Available</th></tr></thead>
      <tbody>
        {empBalances.map(e => (
          <tr key={e.id}>
            <td style={{ fontSize: 13, fontWeight: 500 }}>{e.displayName}</td>
            <td style={{ fontSize: 13 }}>{e.deptName}</td>
            <td style={{ fontSize: 13 }}>{e.vacAvail.toFixed(1)} hrs</td>
            <td style={{ fontSize: 13 }}>{e.sickAvail.toFixed(1)} hrs</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BenefitsReport({ state }) {
  const enrollments = state.benefitEnrollments || [];
  const byPlan = {};
  enrollments.filter(e => e.status === 'active').forEach(en => {
    const plan = state.benefitPlans?.find(p => p.id === en.planId);
    if (!plan) return;
    if (!byPlan[plan.name]) byPlan[plan.name] = { name: plan.name, type: plan.type, provider: plan.provider, enrolled: 0, cost: plan.employeeCost };
    byPlan[plan.name].enrolled++;
  });

  return (
    <table className="data-table">
      <thead><tr><th>Plan</th><th>Type</th><th>Provider</th><th>Enrolled</th><th>Employee Cost/mo</th></tr></thead>
      <tbody>
        {Object.values(byPlan).map(p => (
          <tr key={p.name}>
            <td style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</td>
            <td style={{ fontSize: 13 }}>{p.type}</td>
            <td style={{ fontSize: 13 }}>{p.provider}</td>
            <td style={{ fontSize: 13 }}>{p.enrolled}</td>
            <td style={{ fontSize: 13 }}>${p.cost}/mo</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NewHiresReport({ state }) {
  const today = new Date();
  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 90);
  const newHires = (state.employees || []).filter(e => e.hireDate && new Date(e.hireDate) >= cutoff).sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate));

  return (
    <table className="data-table">
      <thead><tr><th>Name</th><th>Job Title</th><th>Department</th><th>Location</th><th>Hire Date</th></tr></thead>
      <tbody>
        {newHires.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No new hires in the last 90 days.</td></tr> : newHires.map(e => {
          const dept = state.departments?.find(d => d.id === e.departmentId);
          const loc = state.locations?.find(l => l.id === e.locationId);
          return (
            <tr key={e.id}>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{e.displayName}</td>
              <td style={{ fontSize: 13 }}>{e.jobTitle}</td>
              <td style={{ fontSize: 13 }}>{dept?.name || '—'}</td>
              <td style={{ fontSize: 13 }}>{loc?.name || '—'}</td>
              <td style={{ fontSize: 13 }}>{e.hireDate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [exportToast, setExportToast] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const report = (state.reports || []).find(r => r.id === Number(id));
  if (!report) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Report not found.</div>;

  const filters = { deptFilter, locFilter };

  function getTableData() {
    switch (report.type) {
      case 'headcount': {
        let emps = (state.employees || []).filter(e => e.status === 'Active');
        if (deptFilter) emps = emps.filter(e => e.departmentId === Number(deptFilter));
        if (locFilter) emps = emps.filter(e => e.locationId === Number(locFilter));
        const byDept = {};
        emps.forEach(e => {
          const dept = state.departments?.find(d => d.id === e.departmentId);
          const key = dept?.name || 'Unknown';
          byDept[key] = (byDept[key] || 0) + 1;
        });
        const rows = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
        return { headers: ['Department', 'Count', '% of Total'], rows: rows.map(([dept, count]) => [dept, count, `${((count / emps.length) * 100).toFixed(1)}%`]) };
      }
      case 'compensation': {
        let emps = (state.employees || []).filter(e => e.status === 'Active' && e.payRate);
        if (deptFilter) emps = emps.filter(e => e.departmentId === Number(deptFilter));
        return {
          headers: ['Employee', 'Title', 'Department', 'Pay Rate', 'Pay Type'],
          rows: emps.sort((a, b) => b.payRate - a.payRate).map(e => {
            const dept = state.departments?.find(d => d.id === e.departmentId);
            return [e.displayName, e.jobTitle, dept?.name || '—', e.payType === 'Salary' ? `$${e.payRate.toLocaleString()}/yr` : `$${e.payRate}/hr`, e.payType];
          })
        };
      }
      case 'time_off': {
        const balances = state.timeOffBalances || [];
        const employees = (state.employees || []).filter(e => e.status === 'Active');
        const rows = employees.map(emp => {
          const vac = balances.find(b => b.employeeId === emp.id && b.policyId === 1);
          const sick = balances.find(b => b.employeeId === emp.id && b.policyId === 2);
          const dept = state.departments?.find(d => d.id === emp.departmentId);
          return [emp.displayName, dept?.name || '—', `${(vac?.available || 0).toFixed(1)} hrs`, `${(sick?.available || 0).toFixed(1)} hrs`];
        }).filter(r => r[2] !== '0.0 hrs' || r[3] !== '0.0 hrs');
        return { headers: ['Employee', 'Department', 'Vacation Available', 'Sick Available'], rows };
      }
      case 'turnover': {
        const terminated = (state.employees || []).filter(e => e.status === 'Inactive');
        const rows = terminated.map(e => {
          const dept = state.departments?.find(d => d.id === e.departmentId);
          return [e.displayName, e.jobTitle, dept?.name || '—', e.terminationDate || '—', e.terminationType || '—'];
        });
        return { headers: ['Employee', 'Title', 'Department', 'Termination Date', 'Type'], rows };
      }
      case 'new_hires': {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const newHires = (state.employees || []).filter(e => e.status === 'Active' && e.hireDate && new Date(e.hireDate) >= ninetyDaysAgo);
        const rows = newHires.sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate)).map(e => {
          const dept = state.departments?.find(d => d.id === e.departmentId);
          const loc = state.locations?.find(l => l.id === e.locationId);
          return [e.displayName, e.jobTitle, dept?.name || '—', loc?.name || '—', e.hireDate];
        });
        return { headers: ['Employee', 'Title', 'Department', 'Location', 'Hire Date'], rows };
      }
      default:
        return { headers: ['Name', 'Value'], rows: [] };
    }
  }

  function handleExportCSV() {
    const { headers, rows } = getTableData();
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'UPDATE_REPORT', id: report.id, changes: { lastRunAt: new Date().toISOString().split('T')[0] } });
    setExportToast('CSV downloaded successfully.');
    setTimeout(() => setExportToast(''), 3000);
  }

  function handleExportPDF() {
    const { headers, rows } = getTableData();
    // Build a simple HTML table for PDF-like export
    const htmlRows = rows.map(row => `<tr>${row.map(cell => `<td style="border:1px solid #ccc;padding:6px 10px;font-size:12px;">${cell}</td>`).join('')}</tr>`).join('');
    const htmlContent = `<!DOCTYPE html><html><head><title>${report.name}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;margin-top:16px;}th{border:1px solid #999;padding:8px 10px;background:#f0f0f0;font-size:12px;text-align:left;}td{border:1px solid #ccc;padding:6px 10px;font-size:12px;}</style></head><body><h1>${report.name}</h1><p style="font-size:12px;color:#666;">Generated: ${new Date().toLocaleDateString()}</p><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'UPDATE_REPORT', id: report.id, changes: { lastRunAt: new Date().toISOString().split('T')[0] } });
    setExportToast('PDF exported successfully.');
    setTimeout(() => setExportToast(''), 3000);
  }

  function handleRunReport() {
    setIsRunning(true);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_REPORT', id: report.id, changes: { lastRunAt: new Date().toISOString().split('T')[0] } });
      setIsRunning(false);
      setExportToast('Report ran successfully.');
      setTimeout(() => setExportToast(''), 3000);
    }, 500);
  }

  function renderReport() {
    switch (report.type) {
      case 'headcount': return <HeadcountReport state={state} filters={filters} />;
      case 'compensation': return <CompensationReport state={state} filters={filters} />;
      case 'time_off': return <TimeOffReport state={state} filters={filters} />;
      case 'benefits': return <BenefitsReport state={state} />;
      case 'new_hires': return <NewHiresReport state={state} />;
      case 'turnover': {
        const terminated = (state.employees || []).filter(e => e.status === 'Inactive');
        return (
          <div>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
              {terminated.length} terminated employees
            </div>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Title</th><th>Department</th><th>Termination Date</th></tr></thead>
              <tbody>
                {terminated.map(e => {
                  const dept = state.departments?.find(d => d.id === e.departmentId);
                  return (
                    <tr key={e.id}>
                      <td style={{ fontSize: 13 }}>{e.displayName}</td>
                      <td style={{ fontSize: 13 }}>{e.jobTitle}</td>
                      <td style={{ fontSize: 13 }}>{dept?.name || '—'}</td>
                      <td style={{ fontSize: 13 }}>{e.terminationDate || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Custom report results would appear here.</div>;
    }
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '16px 24px' }}>
        <Link to={navTo('/reports')} style={{ color: '#999', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <ChevronLeft size={14} /> Back to Reports
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{report.name}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={handleRunReport}
              disabled={isRunning}
              style={{ fontSize: 13 }}
            >
              {isRunning ? 'Running...' : 'Run Report'}
            </button>
            <button className="btn btn-secondary" onClick={handleExportCSV}><Download size={14} /> Export CSV</button>
            <button className="btn btn-secondary" onClick={handleExportPDF}><Download size={14} /> Export PDF</button>
          </div>
        </div>
        {report.description && <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{report.description}</div>}
        {exportToast && (
          <div style={{ marginTop: 8, background: '#edf8e0', border: '1px solid #b6e07a', color: '#5CA315', borderRadius: 4, padding: '6px 12px', fontSize: 13 }}>
            {exportToast}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Filters */}
        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Filter:</span>
          <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Departments</option>
            {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-select" value={locFilter} onChange={e => setLocFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Locations</option>
            {(state.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '20px' }}>
          {renderReport()}
        </div>
      </div>
    </div>
  );
}
