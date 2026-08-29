import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const STATE_DIR = path.resolve('.mock-states')

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true })
  }
}

function sanitizeSid(sid) {
  return (sid || 'default').replace(/[^a-zA-Z0-9_-]/g, '')
}

function getStatePath(sid) {
  return path.join(STATE_DIR, `${sanitizeSid(sid)}.json`)
}

function readState(sid) {
  const p = getStatePath(sid)
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'))
    } catch (e) {
      return null
    }
  }
  return null
}

function writeState(sid, data) {
  ensureStateDir()
  fs.writeFileSync(getStatePath(sid), JSON.stringify(data))
}

function computeDiff(initial, current, prefix = '') {
  const diff = {}
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})])
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const ival = initial ? initial[key] : undefined
    const cval = current ? current[key] : undefined
    if (typeof ival === 'object' && ival !== null && !Array.isArray(ival) &&
        typeof cval === 'object' && cval !== null && !Array.isArray(cval)) {
      Object.assign(diff, computeDiff(ival, cval, fullKey))
    } else if (JSON.stringify(ival) !== JSON.stringify(cval)) {
      diff[fullKey] = { old: ival, new: cval }
    }
  }
  return diff
}

function setupMiddleware(server) {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    const sid = sanitizeSid(url.searchParams.get('sid') || 'default')

    // POST /post?sid=
    if (req.method === 'POST' && url.pathname === '/post') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const payload = JSON.parse(body)
          const existing = readState(sid) || {}
          if (payload.action === 'set') {
            if (existing.initial_state !== undefined) {
              writeState(sid, {
                initial_state: existing.initial_state,
                current_state: payload.state
              })
            } else {
              writeState(sid, {
                initial_state: payload.state,
                current_state: payload.state
              })
            }
          } else if (payload.action === 'set_current') {
            writeState(sid, {
              initial_state: existing.initial_state || payload.state,
              current_state: payload.state
            })
          } else if (payload.action === 'reset') {
            writeState(sid, {
              initial_state: existing.initial_state,
              current_state: existing.initial_state
            })
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (e) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: e.message }))
        }
      })
      return
    }

    // GET /state?sid= or /go?sid=
    if (req.method === 'GET' && (url.pathname === '/state' || url.pathname === '/go')) {
      const data = readState(sid)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-cache')
      if (data) {
        const diff = computeDiff(data.initial_state || {}, data.current_state || {})
        res.end(JSON.stringify({
          initial_state: data.initial_state,
          current_state: data.current_state,
          state_diff: diff
        }, null, 2))
      } else {
        res.end(JSON.stringify({ initial_state: null, current_state: null, state_diff: {} }, null, 2))
      }
      return
    }

    next()
  })
}

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**", "**/.mock-files/**"]
    }
  },
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer: setupMiddleware,
      configurePreviewServer: setupMiddleware,
    }
  ],
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true },
})
