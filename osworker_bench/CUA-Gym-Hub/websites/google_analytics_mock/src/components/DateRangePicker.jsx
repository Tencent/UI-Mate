import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, subDays, subMonths } from 'date-fns';

const presets = [
  { id: 'today', label: 'Today', getDates: () => { const d = '2024-12-15'; return { start: d, end: d }; } },
  { id: 'yesterday', label: 'Yesterday', getDates: () => { return { start: '2024-12-14', end: '2024-12-14' }; } },
  { id: 'last7days', label: 'Last 7 days', getDates: () => ({ start: '2024-12-09', end: '2024-12-15' }) },
  { id: 'last28days', label: 'Last 28 days', getDates: () => ({ start: '2024-11-18', end: '2024-12-15' }) },
  { id: 'last90days', label: 'Last 90 days', getDates: () => ({ start: '2024-09-17', end: '2024-12-15' }) },
  { id: 'last12months', label: 'Last 12 months', getDates: () => ({ start: '2024-01-01', end: '2024-12-15' }) },
  { id: 'custom', label: 'Custom', getDates: () => null },
];

export default function DateRangePicker({ onClose }) {
  const { state, updateState } = useAppContext();
  const [selectedPreset, setSelectedPreset] = useState(state.selectedDateRange.preset);
  const [startDate, setStartDate] = useState(state.selectedDateRange.startDate);
  const [endDate, setEndDate] = useState(state.selectedDateRange.endDate);
  const [compareEnabled, setCompareEnabled] = useState(state.selectedDateRange.compareEnabled);
  const [compareType, setCompareType] = useState(state.selectedDateRange.compareType);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      const dates = preset.getDates();
      if (dates) {
        setStartDate(dates.start);
        setEndDate(dates.end);
      }
    }
  };

  const handleApply = () => {
    updateState(prev => ({
      ...prev,
      selectedDateRange: {
        preset: selectedPreset,
        startDate,
        endDate,
        compareEnabled,
        compareType
      }
    }));
    onClose();
  };

  const formatDisplay = () => {
    const preset = presets.find(p => p.id === selectedPreset);
    if (preset && preset.id !== 'custom') return preset.label;
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="date-picker-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="date-picker-panel">
        <div className="date-picker-header">Select date range</div>
        <div className="date-picker-body">
          <div className="date-picker-presets">
            {presets.map(preset => (
              <div
                key={preset.id}
                className={`date-picker-preset ${selectedPreset === preset.id ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </div>
            ))}
          </div>
          <div className="date-picker-custom">
            <div className="date-picker-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSelectedPreset('custom'); }}
              />
              <span style={{ alignSelf: 'center', color: '#5f6368' }}>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSelectedPreset('custom'); }}
              />
            </div>
          </div>
        </div>
        <div className="date-picker-compare">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(e) => setCompareEnabled(e.target.checked)}
            />
            Compare
          </label>
          {compareEnabled && (
            <select
              value={compareType}
              onChange={(e) => setCompareType(e.target.value)}
              style={{ marginLeft: 8, padding: '4px 8px', border: '1px solid #dadce0', borderRadius: 4, fontSize: 13 }}
            >
              <option value="precedingPeriod">Preceding period</option>
              <option value="samePeriodLastYear">Same period last year</option>
            </select>
          )}
        </div>
        <div className="date-picker-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}

export function DateRangeButton() {
  const { state } = useAppContext();
  const [showPicker, setShowPicker] = useState(false);
  const dr = state.selectedDateRange;

  const getLabel = () => {
    const preset = presets.find(p => p.id === dr.preset);
    if (preset && preset.id !== 'custom') {
      return `${preset.label}  ${dr.startDate} - ${dr.endDate}`;
    }
    return `${dr.startDate} - ${dr.endDate}`;
  };

  return (
    <>
      <div className="date-range-selector" onClick={() => setShowPicker(true)}>
        {getLabel()} &#9662;
      </div>
      {showPicker && <DateRangePicker onClose={() => setShowPicker(false)} />}
    </>
  );
}
