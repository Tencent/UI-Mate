import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const STATE_DIR = path.resolve('.mock-states')

function setupMiddleware(server) {
      // Ensure state directory exists
      if (!fs.existsSync(STATE_DIR)) {
        fs.mkdirSync(STATE_DIR, { recursive: true })
      }

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const sid = url.searchParams.get('sid')?.replace(/[^a-zA-Z0-9_-]/g, '') || 'default'
        const stateFile = path.join(STATE_DIR, `${sid}.json`)

        // POST /post?sid= — inject or reset state
        if (req.method === 'POST' && url.pathname === '/post') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const { action, state } = JSON.parse(body)
              let sessionData = {}
              if (fs.existsSync(stateFile)) {
                sessionData = JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
              }

              if (action === 'set') {
                sessionData = { current: state, initial: state }
                fs.writeFileSync(stateFile, JSON.stringify(sessionData))
              } else if (action === 'set_current') {
                sessionData.current = state
                fs.writeFileSync(stateFile, JSON.stringify(sessionData))
              } else if (action === 'reset') {
                if (sessionData.initial) {
                  sessionData.current = JSON.parse(JSON.stringify(sessionData.initial))
                  fs.writeFileSync(stateFile, JSON.stringify(sessionData))
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
          return
        }

        // GET /go?sid= — return {initial_state, current_state, state_diff} as JSON
        if (req.method === 'GET' && url.pathname === '/go') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Access-Control-Allow-Origin', '*')
          if (fs.existsSync(stateFile)) {
            const sessionData = JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
            const initial = sessionData.initial || null
            const current = sessionData.current || null
            // Compute flat diff
            const diff = {}
            const computeDiff = (a, b, path) => {
              if (a === b) return
              if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null ||
                  Array.isArray(a) !== Array.isArray(b)) {
                if (a !== b) diff[path || 'root'] = { old: a, new: b }
                return
              }
              if (Array.isArray(a)) {
                if (JSON.stringify(a) !== JSON.stringify(b)) diff[path || 'root'] = { old: a, new: b }
                return
              }
              const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
              for (const k of keys) computeDiff(a[k], b[k], path ? `${path}.${k}` : k)
            }
            if (initial && current) computeDiff(initial, current, '')
            res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: diff }))
          } else {
            res.end(JSON.stringify({ initial_state: null, current_state: null, state_diff: {} }))
          }
          return
        }

        // GET /state?sid= — return stored state
        if (req.method === 'GET' && url.pathname === '/state') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Access-Control-Allow-Origin', '*')
          if (fs.existsSync(stateFile)) {
            res.end(fs.readFileSync(stateFile, 'utf-8'))
          } else {
            res.end(JSON.stringify(null))
          }
          return
        }

        // OPTIONS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          res.end()
          return
        }

        next()
      })
}

function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) { setupMiddleware(server) },
    configurePreviewServer(server) { setupMiddleware(server) }
  }
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
  server: {
    watch: null,
  },
})
