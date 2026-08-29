import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

function W2Modal({ doc, onClose }) {
  if (!doc) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>W-2 Wage and Tax Statement -- {doc.year}</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)', border: 'none' }}>x</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Employer Name / Address</div>
            <div style={{ fontWeight: 500 }}>{doc.employerName}</div>
            <div style={{ fontSize: 13 }}>100 Market Street, San Francisco, CA 94105</div>
          </div>
          <table className="table">
            <tbody>
              <tr><td>Box 1 -- Wages, Tips, Other Compensation</td><td className="amount"><strong>${doc.wages?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td></tr>
              <tr><td>Box 2 -- Federal Income Tax Withheld</td><td className="amount">${doc.federalTaxWithheld?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Box 3 -- Social Security Wages</td><td className="amount">${doc.socialSecurityWages?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Box 16 -- State Wages</td><td className="amount">${doc.wages?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td>Box 17 -- State Income Tax Withheld (CA)</td><td className="amount">${doc.stateTaxWithheld?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function TaxDocuments() {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const [viewDoc, setViewDoc] = useState(null)
  const taxDocs = state.taxDocuments || []

  function handleDownload(doc) {
    updateState(prev => ({
      ...prev,
      taxDocuments: prev.taxDocuments.map(d => d.id === doc.id ? { ...d, downloaded: true } : d),
    }))
    showToast(`Download started: W-2 ${doc.year}.pdf`, 'success')
  }

  const columns = [
    { key: 'year', label: 'Year', render: (v) => <strong>{v}</strong> },
    { key: 'type', label: 'Document Type' },
    { key: 'employerName', label: 'Employer' },
    { key: 'availableDate', label: 'Available Date', render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-secondary btn-sm" onClick={() => setViewDoc(row)}>View</button>
          <button className="btn btn-primary btn-sm" onClick={() => handleDownload(row)}>
            {row.downloaded ? '\u2713 Downloaded' : '\u2193 Download'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tax Statements</h1>
        <p>View and download your annual tax documents</p>
      </div>

      <div className="card">
        <SortableTable columns={columns} data={taxDocs} />
      </div>

      {viewDoc && <W2Modal doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </div>
  )
}
