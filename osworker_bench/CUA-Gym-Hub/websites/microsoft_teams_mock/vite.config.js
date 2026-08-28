import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { initialState as defaultState } from './src/data/mockData.js'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Session-based state storage directory
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

// Generate default files so mock attachments work out of the box
function ensureDefaultFiles() {
  const defaultDir = getFilesDir('_default')

  const pdfPath = path.join(defaultDir, 'Q3_Roadmap.pdf')
  if (!fs.existsSync(pdfPath)) {
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
BT /F1 24 Tf 100 700 Td (Q3 Roadmap) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000340 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
434
%%EOF`
    fs.writeFileSync(pdfPath, pdfContent)
  }

  const figPath = path.join(defaultDir, 'Design_System_v2.fig')
  if (!fs.existsSync(figPath)) {
    fs.writeFileSync(figPath, 'FIGMA_PLACEHOLDER_FILE')
  }

  const pngPath = path.join(defaultDir, 'Screenshot_Error.png')
  if (!fs.existsSync(pngPath)) {
    // Minimal 1x1 PNG
    const pngBuf = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
      '0000000a49444154789c626000000002000198e195280000000049454e44ae426082',
      'hex'
    )
    fs.writeFileSync(pngPath, pngBuf)
  }
}

ensureDefaultFiles()

function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

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

function writeState(sid, state) {
  try {
    fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing state file:', e)
    return false
  }
}

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

function writeInitialState(sid, state) {
  try {
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing initial state file:', e)
    return false
  }
}

function clearInitialState(sid) {
  try {
    const file = getInitialStateFile(sid)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    return true
  } catch (e) {
    console.error('Error clearing initial state file:', e)
    return false
  }
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

function hasMeaningfulState(state) {
  return !!state && typeof state === 'object' && Object.keys(state).length > 0
}

function calculateStateDiff(initial, current) {
  // Simple diff implementation - can be enhanced based on needs
  const diff = {}

  // Find added/modified keys at top level
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

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req, res, next) => {
          if (req.method !== 'POST') return next()

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const contentType = req.headers['content-type'] || ''
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }))
            return
          }

          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const buf = Buffer.concat(chunks)

          const files = parseMultipart(buf, boundaryMatch[1])
          if (files.length === 0) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'No files found in request' }))
            return
          }

          const filesDir = getFilesDir(sid)
          const uploaded = []
          for (const file of files) {
            const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const storedName = `${randomUUID().slice(0, 8)}_${safeFilename}`
            const filePath = path.join(filesDir, storedName)
            fs.writeFileSync(filePath, file.data)

            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            const url = `/files/${safeSid}/${storedName}`
            uploaded.push({
              original_name: file.filename,
              stored_name: storedName,
              size: file.data.length,
              content_type: file.contentType,
              url
            })
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, files: uploaded }))
        })

        // GET /files/:sid/:filename - Serve uploaded/default files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()

          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) {
            res.statusCode = 404
            res.end('Not found')
            return
          }

          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '')
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_')
          const filePath = path.join(FILES_DIR, sid, filename)

          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.end('File not found')
            return
          }

          const ext = path.extname(filename).toLowerCase()
          const mimeMap = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.fig': 'application/octet-stream',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const ct = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', ct)
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          res.end(fileData)
        })

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
              res.end(JSON.stringify({ success: true, sid, message: 'State reset to default. Refresh browser to see changes.' }))
              return
            }
            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              if (!hasMeaningfulState(readInitialState(sid))) writeInitialState(sid, newState)
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, sid, message: 'State updated. Refresh browser to see changes.', state: newState }))
              return
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              const existingInitial = readInitialState(sid)
              const initial = hasMeaningfulState(existingInitial)
                ? existingInitial
                : hasMeaningfulState(data.initial_state)
                  ? data.initial_state
                  : defaultState
              if (!hasMeaningfulState(existingInitial)) writeInitialState(sid, initial)
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, sid, message: 'Current state updated.', state: newState }))
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
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          const initial = hasMeaningfulState(initialState)
            ? initialState
            : hasMeaningfulState(currentState)
              ? defaultState
              : defaultState
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

          const contentType = req.headers['content-type'] || ''
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }))
            return
          }

          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const buf = Buffer.concat(chunks)

          const files = parseMultipart(buf, boundaryMatch[1])
          if (files.length === 0) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'No files found in request' }))
            return
          }

          const filesDir = getFilesDir(sid)
          const uploaded = []
          for (const file of files) {
            const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const storedName = `${randomUUID().slice(0, 8)}_${safeFilename}`
            const filePath = path.join(filesDir, storedName)
            fs.writeFileSync(filePath, file.data)

            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            const url = `/files/${safeSid}/${storedName}`
            uploaded.push({
              original_name: file.filename,
              stored_name: storedName,
              size: file.data.length,
              content_type: file.contentType,
              url
            })
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, files: uploaded }))
        })

        // GET /files/:sid/:filename - Serve uploaded/default files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()

          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) {
            res.statusCode = 404
            res.end('Not found')
            return
          }

          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '')
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_')
          const filePath = path.join(FILES_DIR, sid, filename)

          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.end('File not found')
            return
          }

          const ext = path.extname(filename).toLowerCase()
          const mimeMap = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.fig': 'application/octet-stream',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const ct = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', ct)
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          res.end(fileData)
        })

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
              res.end(JSON.stringify({ success: true, sid, message: 'State reset to default. Refresh browser to see changes.' }))
              return
            }
            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              if (!hasMeaningfulState(readInitialState(sid))) writeInitialState(sid, newState)
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, sid, message: 'State updated. Refresh browser to see changes.', state: newState }))
              return
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              const newState = data.merge ? deepMerge(currentState, data.state) : data.state
              const existingInitial = readInitialState(sid)
              const initial = hasMeaningfulState(existingInitial)
                ? existingInitial
                : hasMeaningfulState(data.initial_state)
                  ? data.initial_state
                  : defaultState
              if (!hasMeaningfulState(existingInitial)) writeInitialState(sid, initial)
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
              res.end(JSON.stringify({ success: true, sid, message: 'Current state updated.', state: newState }))
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
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          const initial = hasMeaningfulState(initialState)
            ? initialState
            : hasMeaningfulState(currentState)
              ? defaultState
              : defaultState
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
