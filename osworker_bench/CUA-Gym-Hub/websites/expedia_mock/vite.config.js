import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { Buffer } from 'buffer'

const STATE_DIR = path.resolve('.mock-states')
const FILES_DIR = path.resolve('.mock-files')

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true })
  }
}

function ensureFilesDir() {
  if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true })
}

function sanitizeSid(sid) {
  return (sid || 'default').replace(/[^a-zA-Z0-9_-]/g, '')
}

function getStatePath(sid) {
  return path.join(STATE_DIR, `${sid}.json`)
}

function getInitialPath(sid) {
  return path.join(STATE_DIR, `${sid}.initial.json`)
}

function writeInitialIfMissing(sid, state) {
  const initialPath = getInitialPath(sid)
  if (!fs.existsSync(initialPath)) {
    fs.writeFileSync(initialPath, JSON.stringify(state || {}, null, 2))
  }
}

function getFilesDir(sid) {
  ensureFilesDir()
  const dir = path.join(FILES_DIR, sid)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function parseMultipart(buffer, boundary) {
  const files = []
  const boundaryBuffer = Buffer.from('--' + boundary)
  let start = 0
  while (true) {
    const idx = buffer.indexOf(boundaryBuffer, start)
    if (idx === -1) break
    const next = buffer.indexOf(boundaryBuffer, idx + boundaryBuffer.length)
    if (next === -1) break
    const part = buffer.slice(idx + boundaryBuffer.length + 2, next - 2)
    start = next
    const headerEnd = part.indexOf('\r\n\r\n')
    if (headerEnd === -1) continue
    const headers = part.slice(0, headerEnd).toString('utf-8')
    const body = part.slice(headerEnd + 4)
    const nameMatch = headers.match(/name="([^"]*)"/)
    const filenameMatch = headers.match(/filename="([^"]*)"/)
    const typeMatch = headers.match(/Content-Type:\s*(.+)/i)
    if (filenameMatch?.[1]) {
      files.push({
        fieldName: nameMatch?.[1] || 'file',
        filename: filenameMatch[1],
        contentType: typeMatch?.[1]?.trim() || 'application/octet-stream',
        data: body
      })
    }
  }
  return files
}

function computeDiff(initial, current, prefix = '') {
  const diff = {}
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})])
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const oldVal = (initial || {})[key]
    const newVal = (current || {})[key]
    if (typeof oldVal === 'object' && typeof newVal === 'object' && !Array.isArray(oldVal) && !Array.isArray(newVal) && oldVal !== null && newVal !== null) {
      Object.assign(diff, computeDiff(oldVal, newVal, fullKey))
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullKey] = { old: oldVal, new: newVal }
    }
  }
  return diff
}

function setupMiddleware(server) {
    ensureStateDir()
    ensureFilesDir()

    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      const sid = sanitizeSid(url.searchParams.get('sid'))

      if (req.method === 'POST' && url.pathname === '/upload') {
        const contentType = req.headers['content-type'] || ''
        const boundaryMatch = contentType.match(/boundary=(.+)$/)
        if (!boundaryMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }))
          return
        }
        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        req.on('end', () => {
          const files = parseMultipart(Buffer.concat(chunks), boundaryMatch[1])
          if (!files.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'No files found' }))
            return
          }
          const uploaded = files.map(file => {
            const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const storedName = `${randomUUID().slice(0, 8)}_${safeName}`
            fs.writeFileSync(path.join(getFilesDir(sid), storedName), file.data)
            return {
              original_name: file.filename,
              stored_name: storedName,
              size: file.data.length,
              content_type: file.contentType,
              url: `/files/${sid}/${storedName}`
            }
          })
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, files: uploaded }))
        })
        return
      }

      if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/files/')) {
        const parts = url.pathname.split('/').filter(Boolean)
        if (parts.length < 3) return next()
        const fileSid = sanitizeSid(parts[1])
        const filename = parts.slice(2).join('/').replace(/[^a-zA-Z0-9._-]/g, '_')
        const filePath = path.join(FILES_DIR, fileSid, filename)
        if (!fs.existsSync(filePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('File not found')
          return
        }
        const ext = path.extname(filename).toLowerCase()
        const mimeMap = { '.txt': 'text/plain', '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.csv': 'text/csv', '.json': 'application/json' }
        const fileData = fs.readFileSync(filePath)
        res.writeHead(200, {
          'Content-Type': mimeMap[ext] || 'application/octet-stream',
          'Content-Length': fileData.length,
          'Content-Disposition': `attachment; filename="${filename}"`
        })
        if (req.method === 'HEAD') res.end()
        else res.end(fileData)
        return
      }

      // POST /post?sid=xxx
      if (req.method === 'POST' && url.pathname === '/post') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body)
            const statePath = getStatePath(sid)
            const initialPath = getInitialPath(sid)
            ensureStateDir()

            if (payload.action === 'set') {
              fs.writeFileSync(statePath, JSON.stringify(payload.state, null, 2))
              writeInitialIfMissing(sid, payload.state)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, action: 'set', sid }))
            } else if (payload.action === 'set_current') {
              const existing = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf-8')) : payload.state
              writeInitialIfMissing(sid, existing)
              fs.writeFileSync(statePath, JSON.stringify(payload.state, null, 2))
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, action: 'set_current', sid }))
            } else if (payload.action === 'reset') {
              if (fs.existsSync(initialPath)) {
                const initial = fs.readFileSync(initialPath, 'utf-8')
                fs.writeFileSync(statePath, initial)
              }
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, action: 'reset', sid }))
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Unknown action' }))
            }
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
        return
      }

      // GET /state?sid=xxx
      if (req.method === 'GET' && url.pathname === '/state') {
        const statePath = getStatePath(sid)
        if (fs.existsSync(statePath)) {
          const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'))
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          })
          res.end(JSON.stringify(state))
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'No state found for sid' }))
        }
        return
      }

      // GET /go?sid=xxx (server-side JSON endpoint)
      if (req.method === 'GET' && url.pathname === '/go') {
        const statePath = getStatePath(sid)
        const initialPath = getInitialPath(sid)
        const current = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf-8')) : {}
        const initial = fs.existsSync(initialPath) ? JSON.parse(fs.readFileSync(initialPath, 'utf-8')) : current
        if (!fs.existsSync(initialPath) && fs.existsSync(statePath)) writeInitialIfMissing(sid, current)
        const diff = computeDiff(initial, current)
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        })
        res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: diff }, null, 2))
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
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
  server: {
    watch: { ignored: ['**/assets/screenshots/**', '**/.mock-states/**', '**/.mock-files/**', '**/node_modules/**'], usePolling: true, interval: 1000 },
    port: 5180
  }
})
