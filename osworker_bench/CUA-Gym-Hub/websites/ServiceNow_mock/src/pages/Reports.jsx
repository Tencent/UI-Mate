import React from 'react';
import { useApp } from '../context/AppContext';
import { getPriorityLabel, getPriorityColor, getIncidentStateLabel } from '../utils/dataManager';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

function downloadCSV(filename, rows) {
  const csvContent = rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(filename, title, rows) {
  // Generate a simple HTML-based PDF via window.print()
  const headerRow = rows[0] || [];
  const bodyRows = rows.slice(1);
  const tableHtml = `<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:11px">
    <thead><tr>${headerRow.map(h => `<th style="background:#eee">${h}</th>`).join('')}</tr></thead>
    <tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;margin:20px} h1{font-size:16px}</style></head><body><h1>${title}</h1>${tableHtml}</body></html>`);
  w.document.close();
  w.print();
}

export default function Reports() {
  const { state } = useApp();

  const priorityCounts = [1, 2, 3, 4, 5].map(p => ({
    name: getPriorityLabel(p),
    count: state.incidents.filter(i => i.priority === p && [1, 2, 3].includes(i.state)).length,
    color: getPriorityColor(p),
  }));

  const stateCounts = [
    { name: 'New', value: state.incidents.filter(i => i.state === 1).length, color: '#2196f3' },
    { name: 'In Progress', value: state.incidents.filter(i => i.state === 2).length, color: '#ff9800' },
    { name: 'On Hold', value: state.incidents.filter(i => i.state === 3).length, color: '#9c27b0' },
    { name: 'Resolved', value: state.incidents.filter(i => i.state === 6).length, color: '#4caf50' },
    { name: 'Closed', value: state.incidents.filter(i => i.state === 7).length, color: '#607d8b' },
    { name: 'Cancelled', value: state.incidents.filter(i => i.state === 8).length, color: '#f44336' },
  ].filter(s => s.value > 0);

  const summaryData = [
    ['Metric', 'Count'],
    ['Total Incidents', state.incidents.length],
    ['Open Incidents', state.incidents.filter(i => [1, 2, 3].includes(i.state)).length],
    ['Total Problems', state.problems.length],
    ['Total Change Requests', state.changeRequests.length],
    ['Knowledge Articles', state.kbArticles.filter(a => a.workflow_state === 'Published').length],
    ['Configuration Items', state.cmdbItems.length],
  ];

  const incidentData = [
    ['Number', 'Priority', 'State', 'Short Description', 'Category', 'Updated'],
    ...state.incidents.map(i => [i.number, getPriorityLabel(i.priority), getIncidentStateLabel(i.state), i.short_description, i.category || '', i.updated_at || '']),
  ];

  return (
    <div className="sn-page">
      <div className="sn-page-header">
        <div className="sn-page-header-left"><h1 className="sn-page-title">Reports</h1></div>
        <div className="sn-page-header-right" style={{ display: 'flex', gap: 8 }}>
          <button className="sn-btn" onClick={() => downloadCSV('incidents.csv', incidentData)}>Export Incidents CSV</button>
          <button className="sn-btn" onClick={() => downloadPDF('incidents.pdf', 'Incident Report', incidentData)}>Export Incidents PDF</button>
          <button className="sn-btn" onClick={() => downloadCSV('summary.csv', summaryData)}>Export Summary CSV</button>
        </div>
      </div>
      <div className="sn-page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <h3 style={{ marginBottom: 12 }}>Open Incidents by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {priorityCounts.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 style={{ marginBottom: 12 }}>Incidents by State</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stateCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stateCounts.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Summary</h3>
          <table className="sn-table" style={{ maxWidth: 500 }}>
            <thead><tr><th>Metric</th><th>Count</th></tr></thead>
            <tbody>
              <tr><td>Total Incidents</td><td>{state.incidents.length}</td></tr>
              <tr><td>Open Incidents</td><td>{state.incidents.filter(i => [1, 2, 3].includes(i.state)).length}</td></tr>
              <tr><td>Total Problems</td><td>{state.problems.length}</td></tr>
              <tr><td>Total Change Requests</td><td>{state.changeRequests.length}</td></tr>
              <tr><td>Knowledge Articles</td><td>{state.kbArticles.filter(a => a.workflow_state === 'Published').length}</td></tr>
              <tr><td>Configuration Items</td><td>{state.cmdbItems.length}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
