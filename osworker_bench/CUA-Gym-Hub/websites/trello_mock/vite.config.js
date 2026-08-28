import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import { createInitialData } from './src/utils/mockData.js'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Session-based state directory
const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true })
}

// Files directory for uploaded attachments
const FILES_DIR = path.join(process.cwd(), '.mock-files')
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true })
}

function getFilesDir(sid) {
  const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
  const dir = path.join(FILES_DIR, safeSid)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

// Simple multipart parser for file uploads
function parseMultipart(buf, boundary) {
  const files = []
  const boundaryBuf = Buffer.from('--' + boundary)
  const parts = []
  let start = 0
  while (true) {
    const idx = buf.indexOf(boundaryBuf, start)
    if (idx === -1) break
    if (start > 0) { let s = start, e = idx - 2; if (e > s) parts.push(buf.slice(s, e)) }
    start = idx + boundaryBuf.length + 2
  }
  for (const part of parts) {
    const he = part.indexOf('\r\n\r\n')
    if (he === -1) continue
    const h = part.slice(0, he).toString('utf-8'), b = part.slice(he + 4)
    const nm = h.match(/name="([^"]*)"/)
    const fn = h.match(/filename="([^"]*)"/)
    const ct = h.match(/Content-Type:\s*(.+)/i)
    if (fn && fn[1]) files.push({ fieldName: nm ? nm[1] : 'file', filename: fn[1], contentType: ct ? ct[1].trim() : 'application/octet-stream', data: b })
  }
  return files
}

function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

function readState(sid) {
  try {
    const file = getStateFile(sid)
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (e) { console.error('Error reading state:', e) }
  return null
}

function writeState(sid, state) {
  try { fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2)); return true }
  catch (e) { return false }
}

function clearState(sid) {
  try {
    const f = getStateFile(sid); if (fs.existsSync(f)) fs.unlinkSync(f)
    const initFile = getInitialStateFile(sid); if (fs.existsSync(initFile)) fs.unlinkSync(initFile)
    return true
  }
  catch (e) { return false }
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
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) { return false }
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

// Generate default files so default attachments work out of the box
function ensureDefaultFiles() {
  const dir = getFilesDir('_default')
  const p = path.join(dir, 'Mockup.png')
  if (!fs.existsSync(p)) {
    // Minimal 1x1 white PNG
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64')
    fs.writeFileSync(p, png)
  }
}
ensureDefaultFiles()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'xrello-mock-api',
      configureServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const ct = req.headers['content-type'] || ''
          const bm = ct.match(/boundary=(.+)/)
          if (!bm) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'multipart/form-data required' })); return }
          const chunks = []; for await (const c of req) chunks.push(c)
          const buf = Buffer.concat(chunks)
          const files = parseMultipart(buf, bm[1])
          if (!files.length) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files' })); return }
          const filesDir = getFilesDir(sid), uploaded = []
          for (const f of files) {
            const safe = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const stored = `${randomUUID().slice(0, 8)}_${safe}`
            fs.writeFileSync(path.join(filesDir, stored), f.data)
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            uploaded.push({ original_name: f.filename, stored_name: stored, size: f.data.length, content_type: f.contentType, url: `/files/${safeSid}/${stored}` })
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, files: uploaded }))
        })

        // GET /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) { res.statusCode = 404; res.end('Not found'); return }
          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '')
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_')
          const fp = path.join(FILES_DIR, sid, filename)
          if (!fs.existsSync(fp)) { res.statusCode = 404; res.end('File not found'); return }
          const ext = path.extname(filename).toLowerCase()
          const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.zip': 'application/zip', '.doc': 'application/msword', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          const fileData = fs.readFileSync(fp)
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream')
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          res.end(fileData)
        })

        // POST /post - Set initial state data
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
              // Also clear initial state file
              try {
                const initFile = getInitialStateFile(sid)
                if (fs.existsSync(initFile)) fs.unlinkSync(initFile)
              } catch (e) {}
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State reset to default. Refresh browser to see changes.'
              }))
              return
            }

            if (action === 'set_initial') {
              // Save initial state snapshot for /go endpoint
              try {
                fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(data.state, null, 2))
              } catch (e) {
                console.error('Error writing initial state:', e)
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Initial state saved.' }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeState(sid, newState)

              // If this is the first write and no initial state exists, also save initial
              if (!fs.existsSync(getInitialStateFile(sid))) {
                try {
                  fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(newState, null, 2))
                } catch (e) {}
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State updated. Refresh browser to see changes.',
                state: newState
              }))
              return
            }

            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                const baseline = Object.keys(currentState).length > 0 ? currentState : newState
                writeInitialState(sid, baseline)
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
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

        // GET /state - Get stored custom state
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
            sid: sid
          }))
        })

        // GET /go - Get initial state, current state, and diff (server-side files)
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

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
          res.end(JSON.stringify({
            initial_state: initial,
            current_state: current,
            state_diff: stateDiff
          }))
        })
      },
      configurePreviewServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const ct = req.headers['content-type'] || ''
          const bm = ct.match(/boundary=(.+)/)
          if (!bm) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'multipart/form-data required' })); return }
          const chunks = []; for await (const c of req) chunks.push(c)
          const buf = Buffer.concat(chunks)
          const files = parseMultipart(buf, bm[1])
          if (!files.length) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files' })); return }
          const filesDir = getFilesDir(sid), uploaded = []
          for (const f of files) {
            const safe = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const stored = `${randomUUID().slice(0, 8)}_${safe}`
            fs.writeFileSync(path.join(filesDir, stored), f.data)
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            uploaded.push({ original_name: f.filename, stored_name: stored, size: f.data.length, content_type: f.contentType, url: `/files/${safeSid}/${stored}` })
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, files: uploaded }))
        })

        // GET /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) { res.statusCode = 404; res.end('Not found'); return }
          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '')
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_')
          const fp = path.join(FILES_DIR, sid, filename)
          if (!fs.existsSync(fp)) { res.statusCode = 404; res.end('File not found'); return }
          const ext = path.extname(filename).toLowerCase()
          const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.zip': 'application/zip', '.doc': 'application/msword', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          const fileData = fs.readFileSync(fp)
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream')
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          res.end(fileData)
        })

        // POST /post - Set initial state data
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
              // Also clear initial state file
              try {
                const initFile = getInitialStateFile(sid)
                if (fs.existsSync(initFile)) fs.unlinkSync(initFile)
              } catch (e) {}
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State reset to default. Refresh browser to see changes.'
              }))
              return
            }

            if (action === 'set_initial') {
              // Save initial state snapshot for /go endpoint
              try {
                fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(data.state, null, 2))
              } catch (e) {
                console.error('Error writing initial state:', e)
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Initial state saved.' }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeState(sid, newState)

              // If this is the first write and no initial state exists, also save initial
              if (!fs.existsSync(getInitialStateFile(sid))) {
                try {
                  fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(newState, null, 2))
                } catch (e) {}
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State updated. Refresh browser to see changes.',
                state: newState
              }))
              return
            }

            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                const baseline = Object.keys(currentState).length > 0 ? currentState : newState
                writeInitialState(sid, baseline)
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
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

        // GET /state - Get stored custom state
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
            sid: sid
          }))
        })

        // GET /go - Get initial state, current state, and diff (server-side files)
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

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
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
})
