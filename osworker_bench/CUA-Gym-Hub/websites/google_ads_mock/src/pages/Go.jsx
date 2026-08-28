import React, { useState, useEffect } from 'react'
import { createInitialData } from '../utils/dataManager.js'

function deepDiff(initial, current, path = '') {
  const diff = {}
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})])
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key
    const iv = initial?.[key]
    const cv = current?.[key]
    if (JSON.stringify(iv) !== JSON.stringify(cv)) {
      if (Array.isArray(iv) || Array.isArray(cv)) {
        diff[key] = { before: iv, after: cv }
      } else if (typeof iv === 'object' && typeof cv === 'object' && iv && cv) {
        const nested = deepDiff(iv, cv)
        if (Object.keys(nested).length > 0) diff[key] = nested
      } else {
        diff[key] = { before: iv, after: cv }
      }
    }
  }
  return diff
}

function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('sid') || null
}

export default function Go() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const sid = getSessionId()
        const url = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go'
        const res = await fetch(url)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          // Fallback: read from localStorage
          const prefix = 'google_ads_state_'
          const key = prefix + (sid || 'default')
          const initKey = key + '_initial'
          const current = JSON.parse(localStorage.getItem(key) || 'null') || createInitialData()
          const initial = JSON.parse(localStorage.getItem(initKey) || 'null') || current
          const state_diff = deepDiff(initial, current)
          setData({ initial_state: initial, current_state: current, state_diff })
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 24, fontFamily: 'monospace' }}>Loading...</div>
  if (error) return <div style={{ padding: 24, fontFamily: 'monospace', color: 'red' }}>Error: {error}</div>

  return (
    <pre style={{
      padding: 24, margin: 0, fontFamily: 'monospace', fontSize: 12,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#F8F9FA',
      minHeight: '100vh', color: '#202124'
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
