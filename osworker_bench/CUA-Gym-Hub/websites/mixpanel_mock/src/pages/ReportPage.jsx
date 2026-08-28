import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import DatePickerBar from '../components/DatePickerBar.jsx'
import InsightsReport from './InsightsReport.jsx'
import FunnelsReport from './FunnelsReport.jsx'
import RetentionReport from './RetentionReport.jsx'
import FlowsReport from './FlowsReport.jsx'

export default function ReportPage({ newType }) {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const { state, updateReport, addReport } = useApp()

  // If newType is set, create a fresh report
  const [localReportId, setLocalReportId] = useState(null)

  useEffect(() => {
    if (newType && !reportId) {
      const id = `report_new_${Date.now()}`
      const base = {
        id,
        name: `New ${newType.charAt(0).toUpperCase() + newType.slice(1)} Report`,
        type: newType,
        boardId: null,
        createdBy: 'user_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
        granularity: newType === 'retention' ? 'Week' : 'Day',
        filters: [],
        breakdowns: [],
      }

      if (newType === 'insights') {
        Object.assign(base, {
          chartType: 'line',
          metrics: [{ id: 'metric_a', label: 'A', name: 'Total Page View', events: [{ id: 'mevt_001', name: 'Page View', color: '#4F44E0' }], measurement: 'Total Events', aggregation: null }],
        })
      } else if (newType === 'funnels') {
        Object.assign(base, {
          chartType: 'funnel',
          steps: [
            { id: 'step_a', label: 'A', eventName: 'Page View' },
            { id: 'step_b', label: 'B', eventName: 'Sign Up' },
          ],
          conversionCriteria: { timeWindow: '7 days', counting: 'Uniques' },
        })
      } else if (newType === 'flows') {
        Object.assign(base, {
          chartType: 'flows',
          flowConfig: { startEvent: 'Page View', depth: 4 },
        })
      } else if (newType === 'retention') {
        Object.assign(base, {
          chartType: 'retention',
          retentionConfig: { firstEvent: 'Page View', returnEvent: 'Any Event' },
        })
      }

      addReport(base)
      setLocalReportId(id)
    }
  }, [newType])

  const activeReportId = reportId || localReportId
  const report = state?.reports?.find(r => r.id === activeReportId)

  if (!report) {
    return <div style={{ padding: 40, color: '#8E8EA0', fontSize: 14 }}>Loading report...</div>
  }

  const [activePreset, setActivePreset] = useState(report.dateRange?.preset || '30D')
  const [granularity, setGranularity] = useState(report.granularity || 'Day')
  const [chartType, setChartType] = useState(report.chartType || 'line')
  const [savedFlash, setSavedFlash] = useState(false)

  function handleSave() {
    updateReport(activeReportId, { updatedAt: new Date().toISOString() })
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  function handlePresetChange(preset) {
    setActivePreset(preset)
    // Compute date range from preset
    const end = new Date('2026-01-22')
    let start = new Date(end)
    if (preset === 'Today') { start = new Date(end) }
    else if (preset === 'Yesterday') { start.setDate(start.getDate() - 1) }
    else if (preset === '7D') { start.setDate(start.getDate() - 7) }
    else if (preset === '14D') { start.setDate(start.getDate() - 14) }
    else if (preset === '30D') { start.setDate(start.getDate() - 30) }
    else if (preset === '3M') { start.setMonth(start.getMonth() - 3) }
    else if (preset === '6M') { start.setMonth(start.getMonth() - 6) }
    else if (preset === '12M') { start.setFullYear(start.getFullYear() - 1) }

    updateReport(activeReportId, {
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        preset
      }
    })
  }

  function handleGranularityChange(g) {
    setGranularity(g)
    updateReport(activeReportId, { granularity: g })
  }

  function handleChartTypeChange(ct) {
    setChartType(ct)
    updateReport(activeReportId, { chartType: ct })
  }

  const reportProps = {
    report,
    onUpdateReport: (updates) => updateReport(activeReportId, updates),
    chartType,
    granularity
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header
        title={report.name}
        reportType={report.type}
        showSave={true}
        onSave={handleSave}
        savedFlash={savedFlash}
      />
      <DatePickerBar
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
        granularity={granularity}
        onGranularityChange={handleGranularityChange}
        chartType={chartType}
        onChartTypeChange={handleChartTypeChange}
        showGranularity={report.type === 'insights' || report.type === 'retention'}
        showChartType={report.type === 'insights'}
      />

      {report.type === 'insights' && <InsightsReport {...reportProps} />}
      {report.type === 'funnels' && <FunnelsReport {...reportProps} />}
      {report.type === 'retention' && <RetentionReport {...reportProps} />}
      {report.type === 'flows' && <FlowsReport {...reportProps} />}
    </div>
  )
}
