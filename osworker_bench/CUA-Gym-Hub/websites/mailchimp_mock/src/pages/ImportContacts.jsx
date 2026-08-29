import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ClipboardPaste, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ImportContacts() {
  const { state, addContact, addToast } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [csvReady, setCsvReady] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvContacts, setCsvContacts] = useState([]);
  const [importTags, setImportTags] = useState([]);
  const [importStatus, setImportStatus] = useState('subscribed');
  const csvInputRef = useRef(null);

  const parsedEmails = pasteText.split(/[\n,;]+/).map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  const handlePasteImport = () => {
    if (parsedEmails.length === 0) return;
    parsedEmails.forEach((email, i) => {
      addContact({
        id: `contact_imp_${Date.now()}_${i}`,
        audienceId: 'aud_1',
        email,
        firstName: '',
        lastName: '',
        phone: '',
        status: importStatus,
        tags: importTags,
        source: 'Import',
        rating: 1,
        location: { city: '', state: '', country: '' },
        birthday: '',
        notes: '',
        openRate: 0,
        clickRate: 0,
        lastOpened: null,
        lastClicked: null,
        subscribedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        activity: [{ type: 'subscribe', description: 'Imported via copy/paste', date: new Date().toISOString() }]
      });
    });
    addToast(`${parsedEmails.length} contacts imported successfully!`);
    navigate('/audience');
  };

  const parseCsv = (text) => {
    const rows = text.split(/\r?\n/).map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))).filter(row => row.some(Boolean));
    if (rows.length === 0) return [];
    const header = rows[0].map(h => h.toLowerCase());
    const emailIdx = header.findIndex(h => h === 'email' || h === 'email address');
    const firstIdx = header.findIndex(h => h === 'first name' || h === 'firstname' || h === 'first');
    const lastIdx = header.findIndex(h => h === 'last name' || h === 'lastname' || h === 'last');
    const dataRows = emailIdx >= 0 ? rows.slice(1) : rows;
    return dataRows.map((row, i) => ({
      email: (emailIdx >= 0 ? row[emailIdx] : row[0] || '').trim(),
      firstName: firstIdx >= 0 ? row[firstIdx] || '' : '',
      lastName: lastIdx >= 0 ? row[lastIdx] || '' : '',
      rowNumber: i + 1
    })).filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
  };

  const handleCsvFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    setCsvFileName(file.name);
    setCsvContacts(parsed);
    setCsvReady(parsed.length > 0);
  };

  const handleCsvImport = () => {
    csvContacts.forEach((contact, i) => {
      addContact({
        id: `contact_csv_${Date.now()}_${i}`,
        audienceId: 'aud_1',
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: '',
        status: importStatus,
        tags: importTags,
        source: 'Import',
        rating: 1,
        location: { city: '', state: '', country: '' },
        birthday: '',
        notes: '',
        openRate: 0,
        clickRate: 0,
        lastOpened: null,
        lastClicked: null,
        subscribedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        activity: [{ type: 'subscribe', description: 'Imported via CSV', date: new Date().toISOString() }]
      });
    });
    addToast(`${csvContacts.length} contacts imported successfully!`);
    navigate('/audience');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Import Contacts</h1>
      </div>

      {!mode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }} onClick={() => setMode('paste')}>
            <ClipboardPaste size={48} style={{ color: '#007C89', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Copy/Paste</h3>
            <p className="text-muted">Paste email addresses one per line or comma-separated.</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }} onClick={() => setMode('csv')}>
            <Upload size={48} style={{ color: '#007C89', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Upload CSV</h3>
            <p className="text-muted">Upload a CSV file with your contacts.</p>
          </div>
        </div>
      ) : mode === 'paste' ? (
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Paste Email Addresses</h3>
          <div className="form-group">
            <label>Emails (one per line or comma-separated)</label>
            <textarea rows={8} value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com" />
          </div>
          {pasteText && <p className="text-sm text-muted mb-16">{parsedEmails.length} valid emails found</p>}
          <div className="form-group">
            <label>Add tags to imported contacts</label>
            <select onChange={e => { if (e.target.value && !importTags.includes(e.target.value)) setImportTags([...importTags, e.target.value]); e.target.value = ''; }}>
              <option value="">Select tags...</option>
              {state.tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {importTags.map(t => <span key={t} className="tag-chip">{t} <button onClick={() => setImportTags(importTags.filter(x => x !== t))}><X size={12} /></button></span>)}
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={importStatus} onChange={e => setImportStatus(e.target.value)}>
              <option value="subscribed">Subscribed</option>
              <option value="non-subscribed">Non-subscribed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outlined" onClick={() => setMode(null)}>Back</button>
            <button className="btn btn-primary" onClick={handlePasteImport} disabled={parsedEmails.length === 0}>Import {parsedEmails.length} Contacts</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Upload CSV</h3>
          {!csvReady ? (
            <div className="drop-zone" onClick={() => csvInputRef.current?.click()}>
              <Upload size={32} style={{ marginBottom: 8 }} />
              <p>Drop your CSV here or click to browse</p>
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleCsvFile} />
            </div>
          ) : (
            <div style={{ padding: 16, background: '#F6F6F4', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontWeight: 500 }}>{csvFileName} - {csvContacts.length} contacts found</p>
              <p className="text-sm text-muted">Columns detected: Email, First Name, Last Name</p>
              <button className="btn btn-outlined btn-sm" style={{ marginTop: 10 }} onClick={() => csvInputRef.current?.click()}>Choose another file</button>
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleCsvFile} />
            </div>
          )}
          <div className="form-group">
            <label>Add tags to imported contacts</label>
            <select onChange={e => { if (e.target.value && !importTags.includes(e.target.value)) setImportTags([...importTags, e.target.value]); e.target.value = ''; }}>
              <option value="">Select tags...</option>
              {state.tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={importStatus} onChange={e => setImportStatus(e.target.value)}>
              <option value="subscribed">Subscribed</option>
              <option value="non-subscribed">Non-subscribed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outlined" onClick={() => { setMode(null); setCsvReady(false); }}>Back</button>
            <button className="btn btn-primary" onClick={handleCsvImport} disabled={!csvReady}>Import {csvContacts.length} Contacts</button>
          </div>
        </div>
      )}
    </div>
  );
}
