import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import { INITIAL_STATE } from './src/data/mockData.js'
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
    if (start > 0) {
      // strip leading \r\n and trailing \r\n before boundary
      let partStart = start
      let partEnd = idx - 2 // remove trailing \r\n
      if (partEnd > partStart) {
        parts.push(buf.slice(partStart, partEnd))
      }
    }
    start = idx + boundaryBuf.length + 2 // skip boundary + \r\n
  }
  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n')
    if (headerEnd === -1) continue
    const headerStr = part.slice(0, headerEnd).toString('utf-8')
    const body = part.slice(headerEnd + 4)

    const nameMatch = headerStr.match(/name="([^"]*)"/)
    const filenameMatch = headerStr.match(/filename="([^"]*)"/)
    const ctMatch = headerStr.match(/Content-Type:\s*(.+)/i)

    if (filenameMatch && filenameMatch[1]) {
      files.push({
        fieldName: nameMatch ? nameMatch[1] : 'file',
        filename: filenameMatch[1],
        contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
        data: body
      })
    }
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
  } catch (e) { return false }
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

// Generate sample default files so default attachments work out of the box
function ensureDefaultFiles() {
  const defaultDir = getFilesDir('_default')

  // Simple minimal PDF
  const pdfPath = path.join(defaultDir, 'roadmap_q4.pdf')
  if (!fs.existsSync(pdfPath)) {
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
BT /F1 24 Tf 100 700 Td (Q4 Roadmap) Tj ET
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

  const benefitsPath = path.join(defaultDir, 'Benefits_Form.pdf')
  if (!fs.existsSync(benefitsPath)) {
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 52>>stream
BT /F1 24 Tf 100 700 Td (Benefits Form) Tj ET
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
442
%%EOF`
    fs.writeFileSync(benefitsPath, pdfContent)
  }
}

ensureDefaultFiles()

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'xmail-mock-api',
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
            // Use a unique prefix to avoid collisions, but keep original name for readability
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

        // GET /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()

          // req.url is relative to /files, e.g. /session1/myfile.pdf
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
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const contentType = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', contentType)
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
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State reset to default. Refresh browser to see changes.'
              }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeState(sid, newState)

              // Write initial state file on first set
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  fs.writeFileSync(initFile, JSON.stringify(newState, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
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
              // Updates ONLY current_state (.json). Never touches .initial.json.
              // Used by golden_patch.py to simulate correct task completion.
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  const initialState = data.initial_state || INITIAL_STATE
                  fs.writeFileSync(initFile, JSON.stringify(initialState, null, 2))
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

        // GET /go - Get state diff for RL training
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          const defaultData = { ...INITIAL_STATE }
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
            // Use a unique prefix to avoid collisions, but keep original name for readability
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

        // GET /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req, res, next) => {
          if (req.method !== 'GET') return next()

          // req.url is relative to /files, e.g. /session1/myfile.pdf
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
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
          }

          const contentType = mimeMap[ext] || 'application/octet-stream'
          const fileData = fs.readFileSync(filePath)

          res.setHeader('Content-Type', contentType)
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
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'State reset to default. Refresh browser to see changes.'
              }))
              return
            }

            if (action === 'set') {
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state

              writeState(sid, newState)

              // Write initial state file on first set
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  fs.writeFileSync(initFile, JSON.stringify(newState, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
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
              // Updates ONLY current_state (.json). Never touches .initial.json.
              // Used by golden_patch.py to simulate correct task completion.
              const currentState = readState(sid) || {}
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                try {
                  const initFile = getInitialStateFile(sid)
                  const initialState = data.initial_state || INITIAL_STATE
                  fs.writeFileSync(initFile, JSON.stringify(initialState, null, 2))
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

        // GET /go - Get state diff for RL training
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') {
            return next()
          }

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)

          const defaultData = { ...INITIAL_STATE }
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
    watch: { usePolling: true, interval: 1000 },
    host: true,
    allowedHosts: true,
    hmr: {
      overlay: false
    }
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
})
