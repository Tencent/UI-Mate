import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import { initialState as defaultSalesforceState } from './src/data/initialData.ts'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Session-based state storage directory
const STATE_DIR = path.join(process.cwd(), '.mock-states')

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true })
}

// Files directory for uploaded files
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

// Generate default placeholder files so default file entries work out of the box
function ensureDefaultFiles() {
  const defaultDir = getFilesDir('_default')

  const minimalPdf = (title) => `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${title.length + 42}>>stream
BT /F1 24 Tf 100 700 Td (${title}) Tj ET
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

  const defaultFiles = [
    { name: 'Q4_Forecast.xlsx', content: 'Placeholder spreadsheet file - Q4 Forecast Data' },
    { name: 'Sales_Playbook.pdf', content: null, pdf: true, title: 'Sales Playbook' },
    { name: 'Acme_Proposal.docx', content: 'Placeholder document file - Acme Corporation Proposal' },
    { name: 'Pipeline_Review.pptx', content: 'Placeholder presentation file - Pipeline Review' },
    { name: 'Product_Catalog.pdf', content: null, pdf: true, title: 'Product Catalog' },
    { name: 'Case_Study_Acme.pdf', content: null, pdf: true, title: 'Case Study Acme' },
    { name: 'Team_Photo.png', content: null, png: true },
  ]

  for (const f of defaultFiles) {
    const filePath = path.join(defaultDir, f.name)
    if (!fs.existsSync(filePath)) {
      if (f.pdf) {
        fs.writeFileSync(filePath, minimalPdf(f.title))
      } else if (f.png) {
        // Minimal 1x1 white PNG
        const pngBuf = Buffer.from(
          '89504e470d0a1a0a0000000d494844520000000100000001' +
          '0802000000907753de0000000c4944415408d763f8cfc000' +
          '000002000160e7274a0000000049454e44ae426082', 'hex')
        fs.writeFileSync(filePath, pngBuf)
      } else {
        fs.writeFileSync(filePath, f.content)
      }
    }
  }
}

ensureDefaultFiles()

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
    const initFile = getInitialStateFile(sid)
    if (fs.existsSync(initFile)) {
      fs.unlinkSync(initFile)
    }
    return true
  } catch (e) {
    console.error('Error clearing state file:', e)
    return false
  }
}

// Get initial state file path
function getInitialStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.initial.json`)
}

// Read initial state
function readInitialState(sid) {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading initial state file:', e)
  }
  return null
}

function writeInitialStateIfMissing(sid, baseline) {
  if (readInitialState(sid)) return
  try {
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(baseline, null, 2))
  } catch (e) {
    console.error('Error writing initial state file:', e)
  }
}

// Calculate state diff
function calculateStateDiff(initial, current) {
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

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        // POST /upload - Upload files
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

        // GET/HEAD /files/:sid/:filename - Serve uploaded/default files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next()

          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) {
            return next()
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
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const ct = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', ct)
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          if (req.method === 'HEAD') {
            res.end()
            return
          }
          res.end(fileData)
        })

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

              writeState(sid, newState)

              writeInitialStateIfMissing(sid, newState)

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
              const currentState = readState(sid) || {}
              writeInitialStateIfMissing(sid, Object.keys(currentState).length > 0 ? currentState : JSON.parse(JSON.stringify(defaultSalesforceState)))
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  const baseline = currentState && Object.keys(currentState).length ? currentState : newState
                  fs.writeFileSync(initFile, JSON.stringify(baseline, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
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

        // GET /go - Get initial state, current state, and diff
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          // Use current as initial if no initial state file exists
          const defaultData = JSON.parse(JSON.stringify(defaultSalesforceState))
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
        // POST /upload - Upload files
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

        // GET/HEAD /files/:sid/:filename - Serve uploaded/default files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next()

          const parts = (req.url || '').split('/').filter(Boolean)
          if (parts.length < 2) {
            return next()
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
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const ct = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', ct)
          res.setHeader('Content-Length', fileData.length)
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          if (req.method === 'HEAD') {
            res.end()
            return
          }
          res.end(fileData)
        })

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

              writeState(sid, newState)

              writeInitialStateIfMissing(sid, newState)

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
              const currentState = readState(sid) || {}
              writeInitialStateIfMissing(sid, Object.keys(currentState).length > 0 ? currentState : JSON.parse(JSON.stringify(defaultSalesforceState)))
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  const baseline = currentState && Object.keys(currentState).length ? currentState : newState
                  fs.writeFileSync(initFile, JSON.stringify(baseline, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
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

        // GET /go - Get initial state, current state, and diff
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          // Use current as initial if no initial state file exists
          const defaultData = JSON.parse(JSON.stringify(defaultSalesforceState))
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
    port: 0, // Will use random available port
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**", "**/.mock-files/**"]
    },
    hmr: {
      port: 0 // Random port for HMR
    }
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
})
