import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATE_DIR = path.join(__dirname, '.mock-states')
const UPLOADS_DIR = path.join(__dirname, '.mock-uploads')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function sanitizeSid(sid) {
  return (sid || '').replace(/[^a-zA-Z0-9_-]/g, '')
}

function statePath(sid) {
  ensureDir(STATE_DIR)
  return path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.json`)
}

function initialPath(sid) {
  ensureDir(STATE_DIR)
  return path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.initial.json`)
}

function readJSON(filepath) {
  try {
    if (fs.existsSync(filepath)) return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  } catch {}
  return null
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
}

function deepDiff(a, b, prefix = '') {
  const diff = {}
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  for (const key of keys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const va = a?.[key], vb = b?.[key]
    if (typeof va === 'object' && va !== null && typeof vb === 'object' && vb !== null && !Array.isArray(va) && !Array.isArray(vb)) {
      Object.assign(diff, deepDiff(va, vb, fullKey))
    } else if (JSON.stringify(va) !== JSON.stringify(vb)) {
      diff[fullKey] = { old: va, new: vb }
    }
  }
  return diff
}

function deepMerge(base, override) {
  if (!override) return base
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (override[key] === null || override[key] === undefined) continue
    if (Array.isArray(override[key])) {
      result[key] = override[key]
    } else if (typeof override[key] === 'object' && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key] || {}, override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

function setupMiddleware(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      const sid = sanitizeSid(url.searchParams.get('sid') || '')

      // POST /post
      if (req.method === 'POST' && url.pathname === '/post') {
        let body = ''
        req.on('data', c => body += c)
        req.on('end', () => {
          try {
            const { action, state } = JSON.parse(body)
            const sp = statePath(sid)
            const ip = initialPath(sid)

            if (action === 'set') {
              writeJSON(sp, state)
              writeJSON(ip, state)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } else if (action === 'set_current') {
              const existing = readJSON(sp) || {}
              writeJSON(sp, deepMerge(existing, state))
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } else if (action === 'reset') {
              const initial = readJSON(ip)
              if (initial) writeJSON(sp, initial)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Unknown action' }))
            }
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
        return
      }

      // GET /state
      if (req.method === 'GET' && url.pathname === '/state') {
        const data = readJSON(statePath(sid))
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
        res.end(JSON.stringify(data))
        return
      }

      // GET /go (state diff endpoint)
      if (req.method === 'GET' && url.pathname === '/go') {
        const sp = statePath(sid)
        const ip = initialPath(sid)
        const current = readJSON(sp) || {}
        const initial = readJSON(ip) || current
        const diff = deepDiff(initial, current)
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
        res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: diff }, null, 2))
        return
      }

      // POST /upload
      if (req.method === 'POST' && url.pathname === '/upload') {
        ensureDir(UPLOADS_DIR)
        const sidDir = path.join(UPLOADS_DIR, sid || 'default')
        ensureDir(sidDir)
        let body = Buffer.alloc(0)
        req.on('data', c => { body = Buffer.concat([body, c]) })
        req.on('end', () => {
          const filename = `file_${Date.now()}`
          const filepath = path.join(sidDir, filename)
          fs.writeFileSync(filepath, body)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ files: [{ url: `/files/${sid || 'default'}/${filename}`, original_name: filename, stored_name: filename, size: body.length }] }))
        })
        return
      }

      // GET /files/:sid/:filename
      const fileMatch = url.pathname.match(/^\/files\/([^/]+)\/(.+)$/)
      if (req.method === 'GET' && fileMatch) {
        const [, fsid, fname] = fileMatch
        const fpath = path.join(UPLOADS_DIR, fsid, fname)
        if (fs.existsSync(fpath)) {
          const content = fs.readFileSync(fpath)
          res.writeHead(200)
          res.end(content)
        } else {
          res.writeHead(404)
          res.end('Not found')
        }
        return
      }

      next()
    })
}

const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) { setupMiddleware(server) },
  configurePreviewServer(server) { setupMiddleware(server) }
})

export default defineConfig({
    server: {
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**"]
    }
  },
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
})
