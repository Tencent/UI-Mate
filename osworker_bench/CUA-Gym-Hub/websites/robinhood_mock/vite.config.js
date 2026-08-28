import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Session-based state storage directory
const STATE_DIR = path.join(process.cwd(), '.mock-states')

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true })
}

// Get storage file path for a session
function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

// Read state from file
function readState(sid) {
  try {
    const file = getStateFile(sid)
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch (e) {
    console.error('Error reading state file:', e)
  }
  return null
}

// Write state to file
function writeState(sid, state) {
  try {
    fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing state file:', e)
    return false
  }
}

// Clear state file
function clearState(sid) {
  try {
    const file = getStateFile(sid)
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
    return true
  } catch (e) {
    console.error('Error clearing state file:', e)
    return false
  }
}

// Deep merge utility
function deepMerge(target, source) {
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

// Parse query string from URL
function parseQuery(url) {
  const idx = url.indexOf('?')
  if (idx === -1) return {}
  const params = {}
  url.substring(idx + 1).split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return params
}

function getInitialStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.initial.json`)
}

function readInitialState(sid) {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading initial state file:', e)
  }
  return null
}

function writeInitialState(sid, state) {
  try {
    const f = getInitialStateFile(sid)
    if (!fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify(state, null, 2))
    }
    return true
  } catch (e) {
    console.error('Error writing initial state file:', e)
    return false
  }
}

function calculateStateDiff(initial, current) {
  const diff = {}
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

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        // POST /post - Set initial state data (supports ?sid=xxx for session isolation)
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          let body = ''
          for await (const chunk of req) {
            body += chunk
          }

          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'

            if (action === 'reset') {
              clearState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'State reset to default.'
              }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeInitialState(sid, newState)
              writeState(sid, newState)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'State updated.',
                state: newState
              }))
              return
            }

            if (action === 'set_current') {
              writeInitialState(sid, data.state)
              writeState(sid, data.state)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'Current state updated.',
                state: data.state
              }))
              return
            }

            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })

        // GET /state - Get stored state (supports ?sid=xxx for session isolation)
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const state = readState(sid)

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({
            stored_state: state,
            has_custom_state: state !== null,
            sid
          }))
        })

        // GET /go - Get state diff for RL training
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

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
        // POST /post - Set initial state data (supports ?sid=xxx for session isolation)
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          let body = ''
          for await (const chunk of req) {
            body += chunk
          }

          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'

            if (action === 'reset') {
              clearState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'State reset to default.'
              }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeInitialState(sid, newState)
              writeState(sid, newState)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'State updated.',
                state: newState
              }))
              return
            }

            if (action === 'set_current') {
              writeInitialState(sid, data.state)
              writeState(sid, data.state)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                sid,
                message: 'Current state updated.',
                state: data.state
              }))
              return
            }

            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })

        // GET /state - Get stored state (supports ?sid=xxx for session isolation)
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const state = readState(sid)

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache, no-store')
          res.end(JSON.stringify({
            stored_state: state,
            has_custom_state: state !== null,
            sid
          }))
        })

        // GET /go - Get state diff for RL training
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

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
    port: 0, // Will use random available port
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      port: 0 // Random port for HMR
    }
  },
  preview: {
    port: 0 // Random port for preview
  }
})
