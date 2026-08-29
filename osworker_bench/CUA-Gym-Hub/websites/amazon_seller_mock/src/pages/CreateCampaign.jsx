import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CreateCampaign() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    type: 'Sponsored Products',
    dailyBudget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetingType: 'Manual',
    keywords: [],
    selectedProducts: []
  });
  const [kwInput, setKwInput] = useState({ keyword: '', matchType: 'Exact', bid: '' });

  if (!state) return null;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addKeyword = () => {
    if (!kwInput.keyword.trim() || !kwInput.bid) return;
    setForm(f => ({ ...f, keywords: [...f.keywords, { keyword: kwInput.keyword.trim(), matchType: kwInput.matchType, bid: parseFloat(kwInput.bid), status: 'Enabled', impressions: 0, clicks: 0, spend: 0 }] }));
    setKwInput({ keyword: '', matchType: 'Exact', bid: '' });
  };

  const toggleProduct = (id) => setForm(f => ({ ...f, selectedProducts: f.selectedProducts.includes(id) ? f.selectedProducts.filter(p => p !== id) : [...f.selectedProducts, id] }));

  const launch = () => {
    if (!form.name.trim() || !form.dailyBudget) { showToast('Campaign name and daily budget are required.', 'error'); return; }
    const newCamp = {
      id: 'CAMP_' + Date.now(),
      name: form.name,
      type: form.type,
      status: 'Enabled',
      dailyBudget: parseFloat(form.dailyBudget),
      startDate: form.startDate,
      endDate: form.endDate || null,
      targetingType: form.targetingType,
      bidStrategy: 'Dynamic bids - down only',
      metrics: { impressions: 0, clicks: 0, ctr: 0, spend: 0, sales: 0, acos: 0, roas: 0, orders: 0, cpc: 0 },
      adGroups: [{
        id: 'AG_' + Date.now(),
        name: form.name + ' - Ad Group 1',
        status: 'Enabled',
        defaultBid: 0.50,
        products: form.selectedProducts,
        keywords: form.keywords
      }]
    };
    dispatch({ type: 'ADD_CAMPAIGN', payload: newCamp });
    showToast('Campaign launched!', 'success');
    navigate('/advertising');
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 20px' }}>Create Campaign</h1>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        {['Campaign Settings', 'Targeting', 'Keywords', 'Products'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= i + 1 ? '#ff9900' : '#ddd', color: step >= i + 1 ? '#111' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: step === i + 1 ? '#111' : '#888' }}>{s}</div>
            </div>
            {i < 3 && <div style={{ height: 2, flex: 0.5, background: step > i + 1 ? '#ff9900' : '#ddd', marginBottom: 16 }} />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <div className="card-title">Campaign Settings</div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label required">Campaign Name</label>
              <input className="form-input" style={{ width: '100%', maxWidth: 400 }} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Enter campaign name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Campaign Type</label>
                <select className="form-select" value={form.type} onChange={e => setField('type', e.target.value)}>
                  <option>Sponsored Products</option>
                  <option>Sponsored Brands</option>
                  <option>Sponsored Display</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Daily Budget ($)</label>
                <input type="number" className="form-input" step="1" min="1" value={form.dailyBudget} onChange={e => setField('dailyBudget', e.target.value)} style={{ width: 120 }} placeholder="e.g. 25" />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date (optional)</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setField('endDate', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="card-title">Targeting Type</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Manual', 'Automatic'].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 16, border: `2px solid ${form.targetingType === t ? '#ff9900' : '#ddd'}`, borderRadius: 4, cursor: 'pointer', flex: 1 }}>
                  <input type="radio" name="targeting" value={t} checked={form.targetingType === t} onChange={() => setField('targetingType', t)} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t} Targeting</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                      {t === 'Manual' ? 'You choose your keywords and bids' : 'Amazon automatically targets your ads to relevant shoppers'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card-title">Keywords</div>
            {form.targetingType === 'Automatic' ? (
              <div className="alert alert-info">Automatic targeting does not require keyword setup. Amazon will target relevant shoppers for you.</div>
            ) : (
              <>
                <div className="form-row" style={{ marginBottom: 12 }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Keyword</label>
                    <input className="form-input" style={{ width: '100%' }} value={kwInput.keyword} onChange={e => setKwInput(k => ({ ...k, keyword: e.target.value }))} placeholder="Enter keyword" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Match Type</label>
                    <select className="form-select" value={kwInput.matchType} onChange={e => setKwInput(k => ({ ...k, matchType: e.target.value }))}>
                      {['Exact', 'Phrase', 'Broad'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bid ($)</label>
                    <input type="number" className="form-input" step="0.01" min="0.02" value={kwInput.bid} onChange={e => setKwInput(k => ({ ...k, bid: e.target.value }))} style={{ width: 80 }} />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label className="form-label" style={{ visibility: 'hidden' }}>Add</label>
                    <button className="btn-secondary" onClick={addKeyword}>Add</button>
                  </div>
                </div>
                {form.keywords.length > 0 && (
                  <table className="data-table" style={{ marginTop: 8 }}>
                    <thead><tr><th>Keyword</th><th>Match Type</th><th>Bid</th><th></th></tr></thead>
                    <tbody>
                      {form.keywords.map((kw, i) => (
                        <tr key={i}>
                          <td>{kw.keyword}</td>
                          <td><span className={`badge ${kw.matchType === 'Exact' ? 'badge-info' : kw.matchType === 'Phrase' ? 'badge-success' : 'badge-inactive'}`}>{kw.matchType}</span></td>
                          <td>${kw.bid.toFixed(2)}</td>
                          <td><button className="btn-link" style={{ color: '#d13212' }} onClick={() => setForm(f => ({ ...f, keywords: f.keywords.filter((_, ki) => ki !== i) }))}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="card-title">Select Products</div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {state.products.filter(p => p.status === 'Active').map(prod => (
                <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.selectedProducts.includes(prod.id)} onChange={() => toggleProduct(prod.id)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: form.selectedProducts.includes(prod.id) ? 700 : 400 }}>{prod.title.slice(0, 60)}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{prod.asin} · ${prod.price.toFixed(2)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 0' }}>
        <button className="btn-secondary" onClick={() => navigate('/advertising')}>Cancel</button>
        {step > 1 && <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>Previous</button>}
        {step < 4 ? (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Next</button>
        ) : (
          <button className="btn-primary" onClick={launch}>Launch Campaign</button>
        )}
      </div>
    </div>
  );
}
