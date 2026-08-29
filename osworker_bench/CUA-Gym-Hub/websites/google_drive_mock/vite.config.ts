// @ts-nocheck
import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) { fs.mkdirSync(STATE_DIR, { recursive: true }) }

function getStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

function readState(sid: string | null): any {
  try {
    const f = getStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading state file:', e)
  }
  return null
}

function writeState(sid: string | null, state: any): boolean {
  try {
    fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing state file:', e)
    return false
  }
}

function clearState(sid: string | null): boolean {
  try {
    const f = getStateFile(sid)
    if (fs.existsSync(f)) fs.unlinkSync(f)
    return true
  } catch (e) {
    console.error('Error clearing state file:', e)
    return false
  }
}

function getInitialStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.initial.json`)
}

function readInitialState(sid: string | null): any {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading initial state file:', e)
  }
  return null
}

function writeInitialState(sid: string | null, state: any): boolean {
  try {
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing initial state file:', e)
    return false
  }
}

function clearInitialState(sid: string | null): boolean {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) fs.unlinkSync(f)
    return true
  } catch (e) {
    console.error('Error clearing initial state file:', e)
    return false
  }
}

function calculateStateDiff(initial: any, current: any): any {
  const diff: any = {}
  for (const key in current) {
    if (!initial || JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      if (!diff[key]) diff[key] = {}
      if (!initial || !initial[key]) {
        diff[key].added = current[key]
      } else {
        diff[key].modified = current[key]
      }
    }
  }
  return Object.keys(diff).length > 0 ? diff : {}
}

function deepMerge(target: any, source: any): any {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?')
  if (idx === -1) return {}
  const params: Record<string, string> = {}
  url.substring(idx + 1).split('&').forEach(p => {
    const [k, v] = p.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return params
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'google-drive-mock-api',
      configureServer(server) {
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          let body = ''
          for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'
            if (action === 'reset') {
              clearState(sid)
              clearInitialState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'State reset to default. Refresh browser to see changes.' }))
              return
            }
            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              writeState(sid, newState)
              if (!readInitialState(sid)) {
                writeInitialState(sid, newState)
              }
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'State updated. Refresh browser to see changes.', state: newState }))
              return
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              if (!readInitialState(sid)) {
                writeInitialState(sid, readState(sid) || newState)
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e: any) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const state = readState(sid)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid }))
        })
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const initial = initialState || currentState || {}
          const current = currentState || initial
          const stateDiff = calculateStateDiff(initial, current)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({
            initial_state: initial,
            current_state: current,
            state_diff: stateDiff
          }))
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          let body = ''
          for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'
            if (action === 'reset') {
              clearState(sid)
              clearInitialState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'State reset to default. Refresh browser to see changes.' }))
              return
            }
            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              writeState(sid, newState)
              if (!readInitialState(sid)) {
                writeInitialState(sid, newState)
              }
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'State updated. Refresh browser to see changes.', state: newState }))
              return
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              if (!readInitialState(sid)) {
                writeInitialState(sid, readState(sid) || newState)
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e: any) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const state = readState(sid)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid }))
        })
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const initial = initialState || currentState || {}
          const current = currentState || initial
          const stateDiff = calculateStateDiff(initial, current)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({
            initial_state: initial,
            current_state: current,
            state_diff: stateDiff
          }))
        })
      }
    }
  ],
  server: {
    port: 0,
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      port: 0
    }
  },
  preview: {
    port: 0
  }
})
