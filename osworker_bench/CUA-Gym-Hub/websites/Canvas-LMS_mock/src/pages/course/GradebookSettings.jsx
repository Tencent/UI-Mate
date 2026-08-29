import React, { useState } from 'react';
import { X } from 'lucide-react';
import './GradebookSettings.css';

export default function GradebookSettings({ onClose }) {
  const [activeTab, setActiveTab] = useState('late');
  const [autoGradeMissing, setAutoGradeMissing] = useState(false);
  const [missingGradePercent, setMissingGradePercent] = useState(0);
  const [autoDeductLate, setAutoDeductLate] = useState(false);
  const [lateDeductPercent, setLateDeductPercent] = useState(5);
  const [deductInterval, setDeductInterval] = useState('Day');
  const [lowestGrade, setLowestGrade] = useState(75);

  const tabs = [
    { id: 'late', label: 'Late Policies' },
    { id: 'posting', label: 'Grade Posting Policy' },
    { id: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="gb-settings-overlay" onClick={onClose}>
      <div className="gb-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="gb-settings-header">
          <h2>Gradebook Settings</h2>
          <button className="gb-settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="gb-settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`gb-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="gb-settings-body">
          {activeTab === 'late' && (
            <div className="gb-late-policies">
              <label className="gb-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoGradeMissing}
                  onChange={e => setAutoGradeMissing(e.target.checked)}
                />
                <span>Automatically apply grade for missing submissions</span>
              </label>

              {autoGradeMissing && (
                <div className="gb-settings-field">
                  <label className="gb-field-label">Grade for missing submissions</label>
                  <div className="gb-input-row">
                    <input
                      type="number"
                      className="gb-settings-input"
                      value={missingGradePercent}
                      onChange={e => setMissingGradePercent(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                    <span className="gb-input-suffix">%</span>
                  </div>
                </div>
              )}

              <div className="gb-settings-divider" />

              <label className="gb-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoDeductLate}
                  onChange={e => setAutoDeductLate(e.target.checked)}
                />
                <span>Automatically apply deduction to late submissions</span>
              </label>

              {autoDeductLate && (
                <div className="gb-deduction-fields">
                  <div className="gb-deduction-row">
                    <div>
                      <label className="gb-field-label">Late submission deduction</label>
                      <div className="gb-input-row">
                        <input
                          type="number"
                          className="gb-settings-input"
                          value={lateDeductPercent}
                          onChange={e => setLateDeductPercent(Number(e.target.value))}
                          min={0}
                          max={100}
                        />
                        <span className="gb-input-suffix">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="gb-field-label">Deduction interval</label>
                      <select
                        className="gb-settings-select"
                        value={deductInterval}
                        onChange={e => setDeductInterval(e.target.value)}
                      >
                        <option value="Day">Day</option>
                        <option value="Hour">Hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="gb-settings-divider" />

              <div className="gb-settings-field">
                <label className="gb-field-label">Lowest possible grade</label>
                <div className="gb-input-row">
                  <input
                    type="number"
                    className="gb-settings-input"
                    value={lowestGrade}
                    onChange={e => setLowestGrade(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                  <span className="gb-input-suffix">%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posting' && (
            <div className="gb-posting-policy">
              <p className="gb-settings-info">Choose when grades are posted to students.</p>
              <div className="gb-radio-group">
                <label className="gb-radio-label">
                  <input type="radio" name="posting" defaultChecked />
                  <div>
                    <strong>Automatically Post Grades</strong>
                    <p className="gb-radio-desc">Grades will be visible to students as soon as they are entered.</p>
                  </div>
                </label>
                <label className="gb-radio-label">
                  <input type="radio" name="posting" />
                  <div>
                    <strong>Manually Post Grades</strong>
                    <p className="gb-radio-desc">Grades will be hidden from students until you choose to post them.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="gb-advanced">
              <label className="gb-checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Allow final grade override</span>
              </label>
              <div className="gb-settings-divider" />
              <label className="gb-checkbox-label">
                <input type="checkbox" />
                <span>Show Notes column</span>
              </label>
              <div className="gb-settings-divider" />
              <div className="gb-settings-field" style={{ marginLeft: 0 }}>
                <label className="gb-field-label">Grade Display</label>
                <select className="gb-settings-select" defaultValue="points">
                  <option value="points">Points</option>
                  <option value="percentage">Percentage</option>
                  <option value="letter">Letter Grade</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="gb-settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Update</button>
        </div>
      </div>
    </div>
  );
}
