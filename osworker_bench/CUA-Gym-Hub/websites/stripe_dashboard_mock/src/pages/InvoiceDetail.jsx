import React from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Send, Download, XCircle, CheckCircle } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import { downloadInvoicePdf } from '../utils/exportFiles';
import StatusBadge from '../components/StatusBadge';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const addToast = outletContext.addToast || (() => {});

  const invoice = state.invoices.find(i => i.id === id);
  if (!invoice) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Invoice not found</div>
          <button className="btn-primary" onClick={() => navigate('/invoices')}>Back to invoices</button>
        </div>
      </div>
    );
  }

  const customer = state.customers.find(c => c.id === invoice.customer);

  function formatTs(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  function handleFinalize() {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'open', due_date: Math.floor(Date.now() / 1000) + 2592000 }, eventType: 'finalized' } });
  }

  function handleMarkPaid() {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'paid', amount_paid: invoice.amount_due, amount_remaining: 0, paid_at: Math.floor(Date.now() / 1000) }, eventType: 'paid' } });
  }

  function handleVoid() {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'void' }, eventType: 'voided' } });
  }

  function handleDownloadPdf() {
    downloadInvoicePdf(invoice, customer);
    dispatch({
      type: 'UPDATE_INVOICE',
      payload: {
        id,
        updates: {
          metadata: {
            ...(invoice.metadata || {}),
            last_pdf_downloaded_at: Math.floor(Date.now() / 1000),
          },
        },
        eventType: 'pdf_downloaded',
      }
    });
    addToast(`Downloaded PDF for invoice ${invoice.number || invoice.id}.`, 'success');
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/invoices" className="breadcrumb-link">Invoices</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{invoice.number || invoice.id}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {invoice.number || invoice.id}
            <StatusBadge status={invoice.status} />
          </h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{invoice.id}</div>
        </div>
        <div className="actions-row">
          {invoice.status === 'draft' && (
            <button className="btn-primary" onClick={handleFinalize}>
              <Send size={14} /> Finalize invoice
            </button>
          )}
          {invoice.status === 'open' && (
            <>
              <button className="btn-primary" onClick={handleMarkPaid}>
                <CheckCircle size={14} /> Mark as paid
              </button>
              <button className="btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={handleVoid}>
                <XCircle size={14} /> Void
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={handleDownloadPdf}><Download size={14} /> Download PDF</button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Invoice details</div></div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Invoice number</span><span className="kv-value">{invoice.number || '--'}</span></div>
              <div className="kv-row"><span className="kv-label">Status</span><span className="kv-value"><StatusBadge status={invoice.status} /></span></div>
              <div className="kv-row"><span className="kv-label">Amount due</span><span className="kv-value">{formatCurrency(invoice.amount_due, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Amount paid</span><span className="kv-value">{formatCurrency(invoice.amount_paid, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Amount remaining</span><span className="kv-value">{formatCurrency(invoice.amount_remaining, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Collection method</span><span className="kv-value" style={{ textTransform: 'capitalize' }}>{(invoice.collection_method || '').replace(/_/g, ' ')}</span></div>
              {invoice.billing_reason && (
                <div className="kv-row"><span className="kv-label">Billing reason</span><span className="kv-value" style={{ textTransform: 'capitalize' }}>{invoice.billing_reason.replace(/_/g, ' ')}</span></div>
              )}
              <div className="kv-row"><span className="kv-label">Due date</span><span className="kv-value">{formatTs(invoice.due_date)}</span></div>
              <div className="kv-row"><span className="kv-label">Created</span><span className="kv-value">{formatTs(invoice.created)}</span></div>
              {invoice.paid_at && (
                <div className="kv-row"><span className="kv-label">Paid at</span><span className="kv-value">{formatTs(invoice.paid_at)}</span></div>
              )}
              {invoice.subscription && (
                <div className="kv-row">
                  <span className="kv-label">Subscription</span>
                  <span className="kv-value">
                    <Link to={`/subscriptions/${invoice.subscription}`} className="table-link">{invoice.subscription}</Link>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Line items</div></div>
            {invoice.lines && invoice.lines.length > 0 ? (
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit price</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line, idx) => (
                      <tr key={line.id || idx}>
                        <td>{line.description || '--'}</td>
                        <td>{line.quantity || 1}</td>
                        <td>{line.quantity ? formatCurrency(Math.round(line.amount / line.quantity), invoice.currency) : '--'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(line.amount, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Subtotal</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(invoice.subtotal, invoice.currency)}</td>
                    </tr>
                    {invoice.tax > 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'right' }}>Tax</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.tax, invoice.currency)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: 15 }}>Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{formatCurrency(invoice.total, invoice.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No line items</div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Timeline</div></div>
            <div className="timeline">
              {invoice.status === 'paid' && invoice.paid_at && (
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-label">Invoice paid</div>
                  <div className="timeline-time">{formatTs(invoice.paid_at)}</div>
                </div>
              )}
              {invoice.status === 'void' && (
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger)' }} />
                  <div className="timeline-label">Invoice voided</div>
                  <div className="timeline-time">--</div>
                </div>
              )}
              {invoice.status === 'open' && (
                <div className="timeline-item">
                  <div className="timeline-dot info" />
                  <div className="timeline-label">Invoice finalized and sent</div>
                  <div className="timeline-time">--</div>
                </div>
              )}
              <div className="timeline-item">
                <div className="timeline-dot info" />
                <div className="timeline-label">Invoice created</div>
                <div className="timeline-time">{formatTs(invoice.created)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          {customer && (
            <div className="card">
              <div className="card-header"><div className="card-title">Customer</div></div>
              <div style={{ fontSize: 14 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{customer.name}</div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{customer.email}</div>
                <Link to={`/customers/${customer.id}`} style={{ fontSize: 13 }}>View customer →</Link>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><div className="card-title">Summary</div></div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Subtotal</span><span className="kv-value">{formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Tax</span><span className="kv-value">{formatCurrency(invoice.tax || 0, invoice.currency)}</span></div>
              <div className="kv-row" style={{ fontWeight: 600 }}><span className="kv-label">Total</span><span className="kv-value">{formatCurrency(invoice.total, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Amount paid</span><span className="kv-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(invoice.amount_paid, invoice.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Amount due</span><span className="kv-value" style={{ color: invoice.amount_remaining > 0 ? 'var(--color-danger)' : 'inherit' }}>{formatCurrency(invoice.amount_remaining, invoice.currency)}</span></div>
            </div>
          </div>

          {Object.keys(invoice.metadata || {}).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Metadata</div></div>
              <div className="kv-list">
                {Object.entries(invoice.metadata).map(([k, v]) => (
                  <div key={k} className="kv-row">
                    <span className="kv-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{k}</span>
                    <span className="kv-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
