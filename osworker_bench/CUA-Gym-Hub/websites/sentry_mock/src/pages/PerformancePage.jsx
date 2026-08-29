import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

function SummaryCard({ label, value, suffix, color }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '14px 18px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, color: TEXT_SEC, textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || TEXT_PRI, marginTop: 4 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500 }}>{suffix || ''}</span>
      </div>
    </div>
  )
}

export default function PerformancePage() {
  const { state } = useApp()
  const { transactions = [], projects = [] } = state
  const [sortKey, setSortKey] = useState('p95')
  const [sortDir, setSortDir] = useState('desc')

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = useMemo(() => {
    const list = [...transactions]
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [transactions, sortKey, sortDir])

  // Aggregate metrics
  const totalTPM = transactions.reduce((s, t) => s + t.tpm, 0)
  const avgFailureRate = transactions.length > 0 ? (transactions.reduce((s, t) => s + t.failureRate, 0) / transactions.length) : 0
  const avgApdex = transactions.length > 0 ? (transactions.reduce((s, t) => s + t.apdex, 0) / transactions.length) : 0
  const avgP75 = transactions.length > 0 ? Math.round(transactions.reduce((s, t) => s + t.p75, 0) / transactions.length) : 0

  // Throughput chart data
  const throughputData = Array.from({ length: 12 }, (_, i) => ({
    label: `${i * 2}:00`,
    tpm: Math.round(totalTPM * (0.4 + Math.random() * 1.2))
  }))

  const columns = [
    { key: 'name', label: 'Transaction', align: 'left', width: '25%' },
    { key: 'project', label: 'Project', align: 'left', width: '10%' },
    { key: 'tpm', label: 'TPM', align: 'right', width: '8%' },
    { key: 'p50', label: 'P50', align: 'right', width: '8%' },
    { key: 'p75', label: 'P75', align: 'right', width: '8%' },
    { key: 'p95', label: 'P95', align: 'right', width: '8%' },
    { key: 'p99', label: 'P99', align: 'right', width: '8%' },
    { key: 'failureRate', label: 'Failure Rate', align: 'right', width: '10%' },
    { key: 'apdex', label: 'Apdex', align: 'right', width: '8%' },
  ]

  function SortIcon({ col }) {
    if (sortKey !== col) return <ArrowUpDown size={10} color={TEXT_SEC} style={{ marginLeft: 4, opacity: 0.4 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={10} color={ACCENT} style={{ marginLeft: 4 }} />
      : <ChevronDown size={10} color={ACCENT} style={{ marginLeft: 4 }} />
  }

  function formatMs(ms) {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
  }

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Performance</h1>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <SummaryCard label="TPM" value={totalTPM.toFixed(0)} color={ACCENT} />
        <SummaryCard label="Failure Rate" value={`${(avgFailureRate * 100).toFixed(1)}%`} color={avgFailureRate > 0.05 ? '#E03E2F' : '#2BA185'} />
        <SummaryCard label="Apdex" value={avgApdex.toFixed(2)} color={avgApdex < 0.85 ? '#F5B000' : '#2BA185'} />
        <SummaryCard label="P75" value={formatMs(avgP75)} color={TEXT_PRI} />
      </div>

      {/* Throughput chart */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 12 }}>Throughput</div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <YAxis tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }} />
              <Bar dataKey="tpm" fill={ACCENT} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction table */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', padding: '10px 16px', backgroundColor: '#FAF9FB',
          borderBottom: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 600, color: TEXT_SEC,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          {columns.map(col => (
            <div key={col.key}
              onClick={() => col.key !== 'name' && col.key !== 'project' && toggleSort(col.key)}
              style={{
                width: col.width, textAlign: col.align, cursor: col.key !== 'name' && col.key !== 'project' ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                userSelect: 'none'
              }}>
              {col.label}
              {col.key !== 'name' && col.key !== 'project' && <SortIcon col={col.key} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((txn, idx) => {
          const proj = projects.find(p => p.id === txn.project)
          return (
            <div key={txn.id} style={{
              display: 'flex', padding: '10px 16px', fontSize: 13,
              borderBottom: idx < sorted.length - 1 ? `1px solid ${BORDER}` : 'none',
              alignItems: 'center'
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '25%', fontWeight: 500, color: ACCENT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {txn.name}
              </div>
              <div style={{ width: '10%' }}>
                {proj && (
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 500,
                    backgroundColor: proj.color + '22', color: proj.color, border: `1px solid ${proj.color}44`
                  }}>{proj.name}</span>
                )}
              </div>
              <div style={{ width: '8%', textAlign: 'right', color: TEXT_PRI }}>{txn.tpm.toFixed(1)}</div>
              <div style={{ width: '8%', textAlign: 'right', color: TEXT_PRI }}>{formatMs(txn.p50)}</div>
              <div style={{ width: '8%', textAlign: 'right', color: TEXT_PRI }}>{formatMs(txn.p75)}</div>
              <div style={{ width: '8%', textAlign: 'right', color: txn.p95 > 2000 ? '#E03E2F' : TEXT_PRI, fontWeight: txn.p95 > 2000 ? 600 : 400 }}>
                {formatMs(txn.p95)}
              </div>
              <div style={{ width: '8%', textAlign: 'right', color: txn.p99 > 5000 ? '#E03E2F' : TEXT_PRI }}>
                {formatMs(txn.p99)}
              </div>
              <div style={{ width: '10%', textAlign: 'right', color: txn.failureRate > 0.05 ? '#E03E2F' : '#2BA185', fontWeight: 500 }}>
                {(txn.failureRate * 100).toFixed(1)}%
              </div>
              <div style={{ width: '8%', textAlign: 'right' }}>
                <span style={{
                  padding: '2px 6px', borderRadius: 3, fontSize: 12, fontWeight: 500,
                  backgroundColor: txn.apdex >= 0.9 ? '#E8F8F5' : txn.apdex >= 0.8 ? '#FFF8E8' : '#FFE8E6',
                  color: txn.apdex >= 0.9 ? '#2BA185' : txn.apdex >= 0.8 ? '#F5B000' : '#E03E2F'
                }}>
                  {txn.apdex.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
