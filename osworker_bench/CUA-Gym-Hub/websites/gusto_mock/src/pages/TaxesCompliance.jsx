import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const TaxesCompliance = () => {
  const { state } = useAppContext()
  const [tab, setTab] = useState('documents')
  const taxForms = state?.taxForms || []
  const company = state?.company

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Taxes & Compliance</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'documents' ? 'active' : ''}`} onClick={() => setTab('documents')}>Tax documents</button>
        <button className={`tab ${tab === 'setup' ? 'active' : ''}`} onClick={() => setTab('setup')}>Tax setup</button>
      </div>

      {tab === 'documents' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Form Type</th>
                <th>Period</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {taxForms.map(form => (
                <tr key={form.id}>
                  <td style={{ fontWeight: '600' }}>{form.type}</td>
                  <td>{form.quarter || form.year}</td>
                  <td><span className={`badge badge-${form.status.toLowerCase()}`}>{form.status}</span></td>
                  <td>{form.filedDate ? formatDate(form.filedDate) : '—'}</td>
                  <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>{form.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'setup' && company && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Company Tax Information</h3>
          {[
            ['Company name', company.legalName],
            ['EIN', company.ein],
            ['Entity type', company.entityType],
            ['Address', `${company.address.street1}, ${company.address.city}, ${company.address.state} ${company.address.zip}`],
            ['Deposit schedule', 'Semi-weekly'],
            ['State', company.address.state],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: '200px', color: 'var(--medium-gray)', fontSize: '13px' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaxesCompliance
