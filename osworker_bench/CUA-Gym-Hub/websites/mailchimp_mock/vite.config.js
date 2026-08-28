import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { createInitialData } from './src/utils/dataManager.js'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true })
const FILE_DIR = path.join(process.cwd(), '.mock-files')
if (!fs.existsSync(FILE_DIR)) fs.mkdirSync(FILE_DIR, { recursive: true })

function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

function getInitialStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.initial.json`)
}

function readState(sid) {
  try {
    const file = getStateFile(sid)
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (e) { console.error('Error reading state:', e) }
  return null
}

function writeState(sid, state) {
  try { fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2)); return true } catch (e) { return false }
}

function writeInitialStateIfMissing(sid, state) {
  try {
    const file = getInitialStateFile(sid)
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(state, null, 2))
  } catch (e) {}
}

function readInitialState(sid) {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {}
  return null
}

function clearState(sid) {
  try {
    const f = getStateFile(sid); if (fs.existsSync(f)) fs.unlinkSync(f)
    const i = getInitialStateFile(sid); if (fs.existsSync(i)) fs.unlinkSync(i)
    return true
  } catch (e) { return false }
}

function getFileDir(sid) {
  const safeSid = sid ? sid.replace(/[^a-zA-Z0-9_-]/g, '') : 'default'
  const dir = path.join(FILE_DIR, safeSid)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function safeFilename(name) {
  return path.basename(name || '').replace(/[^a-zA-Z0-9._-]/g, '_') || `upload-${randomUUID()}`
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.csv') return 'text/csv'
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.txt') return 'text/plain'
  return 'application/octet-stream'
}

function syntheticImage(name) {
  const title = path.basename(name || 'Xailchimp asset').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#FFE01B"/><circle cx="930" cy="130" r="210" fill="#007C89" opacity=".16"/><circle cx="180" cy="620" r="240" fill="#241C15" opacity=".12"/><rect x="120" y="125" width="470" height="76" rx="12" fill="#241C15"/><rect x="120" y="242" width="760" height="30" rx="8" fill="#241C15" opacity=".58"/><rect x="120" y="292" width="620" height="30" rx="8" fill="#241C15" opacity=".42"/><text x="148" y="175" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#fff">${title}</text></svg>`)
}

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

function calculateStateDiff(initial, current) {
  const diff = {}
  if (!initial || !current) return diff
  for (const key in current) {
    if (!initial || JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = { modified: current[key] }
    }
  }
  return Object.keys(diff).length > 0 ? diff : {}
}

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

function createApiPlugin(serverType) {
  return {
    name: 'mock-api',
    [serverType](server) {
      server.middlewares.use('/post', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const query = parseQuery(req.url || '')
        const sid = query.sid || null
        let body = ''
        for await (const chunk of req) body += chunk
        try {
          const data = JSON.parse(body)
          const action = data.action || 'set'
          if (action === 'reset') {
            clearState(sid)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, sid, message: 'State reset.' }))
            return
          }
          if (action === 'set') {
            const newState = data.state || {}
            writeState(sid, newState)
            try { fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(newState, null, 2)) } catch (e) {}
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, sid, message: 'State updated.', state: newState }))
            return
          }
          if (action === 'set_current') {
            const newState = data.state || {}
            writeState(sid, newState)
            writeInitialStateIfMissing(sid, newState)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, message: 'Current state updated.', state: newState }))
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

      server.middlewares.use('/files', async (req, res, next) => {
        const query = parseQuery(req.url || '')
        const sid = query.sid || null
        const filename = safeFilename(query.filename)

        if (req.method === 'POST') {
          const chunks = []
          for await (const chunk of req) chunks.push(Buffer.from(chunk))
          fs.writeFileSync(path.join(getFileDir(sid), filename), Buffer.concat(chunks))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: true,
            sid,
            filename,
            url: `/files?sid=${encodeURIComponent(sid || '')}&filename=${encodeURIComponent(filename)}`
          }))
          return
        }

        if (req.method === 'GET' && query.filename) {
          const file = path.join(getFileDir(sid), filename)
          if (!fs.existsSync(file)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'File not found' }))
            return
          }
          res.setHeader('Content-Type', contentTypeFor(filename))
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
          fs.createReadStream(file).pipe(res)
          return
        }

        if (req.method === 'GET') {
          const dir = getFileDir(sid)
          const files = fs.readdirSync(dir).map(name => {
            const stat = fs.statSync(path.join(dir, name))
            return {
              name,
              size: stat.size,
              url: `/files?sid=${encodeURIComponent(sid || '')}&filename=${encodeURIComponent(name)}`,
              updatedAt: stat.mtime.toISOString()
            }
          })
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ sid, files }))
          return
        }

        return next()
      })

      server.middlewares.use('/content', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const name = decodeURIComponent((req.url || '').split('?')[0].replace(/^\/+/, ''))
        if (!path.extname(name)) return next()
        res.setHeader('Content-Type', 'image/svg+xml')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.end(syntheticImage(name))
      })

      server.middlewares.use('/logo.png', (req, res, next) => {
        if (req.method !== 'GET') return next()
        res.setHeader('Content-Type', 'image/svg+xml')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.end(syntheticImage('Acme logo'))
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
        const defaultData = createInitialData()
        const initial = initialState || currentState || defaultData
        const current = currentState || initial
        const stateDiff = calculateStateDiff(initial, current)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-cache, no-store')
        res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: stateDiff }))
      })
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [secureMockApiPlugin(), 
    react(),
    createApiPlugin('configureServer'),
    createApiPlugin('configurePreviewServer')
  ],
  esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/ },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  server: {
    port: 0,
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**", "**/.mock-files/**"]
    },
    hmr: { port: 0 }
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
})
