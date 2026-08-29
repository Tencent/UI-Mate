import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'
import '../styles/common.css'

function isValidCardNumber(num) {
  return num.replace(/\s/g, '').length === 16
}
function isValidExpiry(exp) {
  return /^\d{2}\/\d{2}$/.test(exp)
}
function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(cvv)
}
function isValidZip(zip) {
  return /^\d{5}$/.test(zip)
}
function isValidRouting(r) {
  return /^\d{9}$/.test(r)
}
function isValidAccountNum(a) {
  return a.trim().length >= 4
}

export default function PayBill() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preBillId = searchParams.get('bill')
  const preAmount = searchParams.get('amount')

  const bills = (state.billingStatements || []).filter(b => b.balanceDue > 0)
  const [billId, setBillId] = useState(preBillId || bills[0]?.id || '')
  const [amount, setAmount] = useState(preAmount || (bills[0]?.balanceDue?.toFixed(2) || ''))
  const [payMethod, setPayMethod] = useState('card')

  // Card fields
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [zip, setZip] = useState('')

  // Bank fields (now bound to state)
  const [routingNum, setRoutingNum] = useState('')
  const [accountNum, setAccountNum] = useState('')

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const errs = {}
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter a valid payment amount greater than $0.'
    } else {
      const bill = bills.find(b => b.id === billId)
      if (bill && amt > bill.balanceDue) {
        errs.amount = `Amount cannot exceed the balance due of $${bill.balanceDue.toFixed(2)}.`
      }
    }

    if (payMethod === 'card') {
      if (!isValidCardNumber(cardNum)) errs.cardNum = 'Card number must be 16 digits.'
      if (!isValidExpiry(cardExp)) errs.cardExp = 'Expiration must be MM/YY.'
      if (!isValidCVV(cardCvv)) errs.cardCvv = 'CVV must be 3-4 digits.'
      if (!isValidZip(zip)) errs.zip = 'Billing ZIP must be 5 digits.'
    } else if (payMethod === 'bank') {
      if (!isValidRouting(routingNum)) errs.routingNum = 'Routing number must be 9 digits.'
      if (!isValidAccountNum(accountNum)) errs.accountNum = 'Please enter your account number.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const amt = parseFloat(amount)
    dispatch({ type: 'PAY_BILL', payload: { billId, amount: amt } })
    setSuccess(true)
    setTimeout(() => navigate('/billing'), 2500)
  }

  const formatCardNum = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: 'var(--color-success)', fontSize: 'var(--font-xl)', marginBottom: 8 }}>Payment Processed!</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Payment of ${parseFloat(amount).toFixed(2)} processed successfully. Redirecting...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate('/billing')}>
          <ChevronLeft size={16} /> Back to Billing
        </button>
        <h1 className="page-title">Pay Bill</h1>
      </div>

      <div className="section-card" style={{ maxWidth: 560 }}>
        <div className="section-card-body">
          {/* Statement selection */}
          <div className="form-group">
            <label className="form-label">Statement</label>
            <select className="form-select" value={billId} onChange={e => {
              setBillId(e.target.value)
              const b = bills.find(b => b.id === e.target.value)
              if (b) setAmount(b.balanceDue.toFixed(2))
              setErrors({})
            }}>
              {bills.map(b => (
                <option key={b.id} value={b.id}>Statement {b.statementDate} — ${b.balanceDue.toFixed(2)} due</option>
              ))}
              {bills.length === 0 && <option>No outstanding balance</option>}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Amount ($)</label>
            <input
              type="number"
              className={`form-input ${errors.amount ? 'form-input--error' : ''}`}
              value={amount}
              min="0.01"
              step="0.01"
              onChange={e => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: undefined })) }}
            />
            {errors.amount && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.amount}</div>}
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[['card', 'Credit/Debit Card'], ['bank', 'Bank Account']].map(([val, label]) => (
                <div
                  key={val}
                  style={{
                    flex: 1, padding: '10px 14px', border: `2px solid ${payMethod === val ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: payMethod === val ? 'var(--color-primary-light)' : '#fff',
                    textAlign: 'center', fontSize: 'var(--font-sm)', fontWeight: payMethod === val ? 600 : 400
                  }}
                  onClick={() => { setPayMethod(val); setErrors({}) }}
                >
                  {label}
                </div>
              ))}
            </div>

            {payMethod === 'card' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className={`form-input ${errors.cardNum ? 'form-input--error' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    value={cardNum}
                    onChange={e => { setCardNum(formatCardNum(e.target.value)); setErrors(prev => ({ ...prev, cardNum: undefined })) }}
                    maxLength={19}
                  />
                  {errors.cardNum && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.cardNum}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Expiration</label>
                    <input
                      type="text"
                      className={`form-input ${errors.cardExp ? 'form-input--error' : ''}`}
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={e => { setCardExp(e.target.value); setErrors(prev => ({ ...prev, cardExp: undefined })) }}
                      maxLength={5}
                    />
                    {errors.cardExp && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.cardExp}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="text"
                      className={`form-input ${errors.cardCvv ? 'form-input--error' : ''}`}
                      placeholder="123"
                      value={cardCvv}
                      onChange={e => { setCardCvv(e.target.value); setErrors(prev => ({ ...prev, cardCvv: undefined })) }}
                      maxLength={4}
                    />
                    {errors.cardCvv && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.cardCvv}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing ZIP</label>
                    <input
                      type="text"
                      className={`form-input ${errors.zip ? 'form-input--error' : ''}`}
                      placeholder="62704"
                      value={zip}
                      onChange={e => { setZip(e.target.value); setErrors(prev => ({ ...prev, zip: undefined })) }}
                      maxLength={5}
                    />
                    {errors.zip && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.zip}</div>}
                  </div>
                </div>
              </div>
            )}

            {payMethod === 'bank' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Routing Number</label>
                  <input
                    type="text"
                    className={`form-input ${errors.routingNum ? 'form-input--error' : ''}`}
                    placeholder="021000021"
                    value={routingNum}
                    onChange={e => { setRoutingNum(e.target.value); setErrors(prev => ({ ...prev, routingNum: undefined })) }}
                    maxLength={9}
                  />
                  {errors.routingNum && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.routingNum}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className={`form-input ${errors.accountNum ? 'form-input--error' : ''}`}
                    placeholder="Enter account number"
                    value={accountNum}
                    onChange={e => { setAccountNum(e.target.value); setErrors(prev => ({ ...prev, accountNum: undefined })) }}
                  />
                  {errors.accountNum && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', marginTop: 4 }}>{errors.accountNum}</div>}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn--success btn--lg"
              onClick={handleSubmit}
              disabled={bills.length === 0 || !amount}
            >
              Submit Payment
            </button>
            <button className="btn btn--gray" onClick={() => navigate('/billing')}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .form-input--error { border-color: var(--color-danger) !important; }
      `}</style>
    </div>
  )
}
