import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flag, ArrowLeft } from 'lucide-react';

export default function KeyCitePage() {
  const { id } = useParams();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('negative');

  const doc = (state.cases || []).find(c => c.id === id);
  if (!doc) {
    return (
      <div className="no-results">
        <h3>Document not found</h3>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  const allDocs = [...(state.cases || []), ...(state.statutes || [])];
  const citingDocs = (doc.citingReferences || []).map(refId => allDocs.find(d => d.id === refId)).filter(Boolean);

  const flagColors = { red: '#CC0000', yellow: '#F0AD00', orange: '#E8600A', green: '#2E8B57', blue: '#3B82C4' };
  const flagLabels = {
    red: 'Negative Treatment - This case has been overruled or reversed by a later decision.',
    yellow: 'Caution - This case has some negative treatment but has not been overruled.',
    orange: 'Caution - This case has possible negative treatment requiring further review.',
    green: 'Positive Treatment - This case has been followed and cited favorably.',
    blue: 'Citing References with Analysis Available.'
  };

  const treatments = ['Distinguished', 'Followed', 'Cited', 'Criticized', 'Discussed'];

  const negativeTreatment = citingDocs.map((ref, i) => ({
    ...ref,
    treatment: treatments[i % treatments.length],
    depth: Math.floor(Math.random() * 4) + 1,
    headnote: `HN${(i % 3) + 1}`
  }));

  const tabs = [
    { id: 'negative', label: 'Negative Treatment', count: negativeTreatment.filter(t => ['Criticized', 'Distinguished'].includes(t.treatment)).length },
    { id: 'history', label: 'History', count: 3 },
    { id: 'citing', label: 'Citing References', count: citingDocs.length },
    { id: 'table', label: 'Table of Authorities', count: 0 }
  ];

  return (
    <div className="keycite-page">
      <Link to={`/document/${doc.id}`} className="back-link">
        <ArrowLeft size={14} /> Back to document
      </Link>

      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C', marginBottom: 8 }}>
        KeyCite: {doc.title}
      </h1>
      <div style={{ fontSize: 13, color: '#5A6577', marginBottom: 16 }}>{doc.citation}</div>

      {doc.keyciteFlag && (
        <div className={`keycite-large ${doc.keyciteFlag}`}>
          <Flag size={16} fill={flagColors[doc.keyciteFlag]} color={flagColors[doc.keyciteFlag]} />
          <span>{flagLabels[doc.keyciteFlag]}</span>
        </div>
      )}

      <div className="keycite-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`keycite-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeTab === 'negative' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', marginBottom: 16 }}>Negative Treatment</h3>
          {negativeTreatment.filter(t => ['Criticized', 'Distinguished'].includes(t.treatment)).length === 0 ? (
            <div className="no-results">
              <p>No negative treatment found for this case.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #D9DDE3' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5A6577', textTransform: 'uppercase' }}>Treatment</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5A6577', textTransform: 'uppercase' }}>Case</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5A6577', textTransform: 'uppercase' }}>Depth</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5A6577', textTransform: 'uppercase' }}>Headnote</th>
                </tr>
              </thead>
              <tbody>
                {negativeTreatment.filter(t => ['Criticized', 'Distinguished'].includes(t.treatment)).map(ref => (
                  <tr key={ref.id} style={{ borderBottom: '1px solid #E8ECF0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`treatment-badge treatment-${ref.treatment.toLowerCase()}`}>
                        {ref.treatment}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Link to={`/document/${ref.id}`} style={{ color: '#1A73BA', fontWeight: 500 }}>{ref.title}</Link>
                      <div style={{ fontSize: 12, color: '#5A6577' }}>{ref.citation}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div className="depth-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`depth-bar ${i <= ref.depth ? 'active' : ''}`} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#5A6577', fontSize: 13 }}>{ref.headnote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', marginBottom: 16 }}>Case History</h3>
          <div className="history-timeline">
            <div className="history-timeline-item">
              <div className="history-timeline-event">Decision by {doc.court}</div>
              <div className="history-timeline-date">{doc.date}</div>
              <div className="history-timeline-desc">Original opinion delivered by {doc.judge}.</div>
            </div>
            <div className="history-timeline-item">
              <div className="history-timeline-event">Certiorari Granted</div>
              <div className="history-timeline-date">{doc.date ? doc.date.replace(/\d{2}$/, '01') : ''}</div>
              <div className="history-timeline-desc">Supreme Court agreed to hear the case.</div>
            </div>
            <div className="history-timeline-item">
              <div className="history-timeline-event">Appeal Filed</div>
              <div className="history-timeline-date">{doc.date ? `${parseInt(doc.date.substring(0, 4)) - 1}-06-15` : ''}</div>
              <div className="history-timeline-desc">Petitioners filed appeal from lower court decision.</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'citing' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', marginBottom: 16 }}>
            Citing References ({citingDocs.length})
          </h3>
          {negativeTreatment.map(ref => (
            <div key={ref.id} className="citing-ref-item">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
                <span className={`treatment-badge treatment-${ref.treatment.toLowerCase()}`}>
                  {ref.treatment}
                </span>
                <div className="depth-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`depth-bar ${i <= ref.depth ? 'active' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="citing-ref-body">
                <Link to={ref.type === 'statute' ? `/statute/${ref.id}` : `/document/${ref.id}`} className="citing-ref-title">
                  {ref.title}
                </Link>
                <div className="citing-ref-meta">
                  {ref.citation} | {ref.court || ref.jurisdiction} | {ref.date || ref.effectiveDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'table' && (
        <div className="no-results">
          <h3>Table of Authorities</h3>
          <p>Lists all authorities cited in this opinion.</p>
        </div>
      )}
    </div>
  );
}
