import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getDefaultData } from './src/utils/mockData'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) { fs.mkdirSync(STATE_DIR, { recursive: true }) }

function getStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}

function readState(sid: string | null): any {
  try {
    const f = getStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading state:', e)
  }
  return null
}

function writeState(sid: string | null, state: any): boolean {
  try {
    fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing state:', e)
    return false
  }
}

function clearState(sid: string | null): boolean {
  try {
    const f = getStateFile(sid)
    if (fs.existsSync(f)) fs.unlinkSync(f)
    const initFile = getInitialStateFile(sid)
    if (fs.existsSync(initFile)) fs.unlinkSync(initFile)
    return true
  } catch (e) {
    console.error('Error clearing state:', e)
    return false
  }
}

function writeInitialState(sid: string | null, state: any): boolean {
  try {
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(state, null, 2))
    return true
  } catch (e) {
    console.error('Error writing initial state:', e)
    return false
  }
}

function clearInitialState(sid: string | null): boolean {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) fs.unlinkSync(f)
    return true
  } catch (e) {
    console.error('Error clearing initial state:', e)
    return false
  }
}

function getInitialStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.initial.json`)
}

function readInitialState(sid: string | null): any {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) {
    console.error('Error reading initial state:', e)
  }
  return null
}

function hasMeaningfulState(state: any): boolean {
  return !!state && typeof state === 'object' && Object.keys(state).length > 0
}

function calculateStateDiff(initial: any, current: any): any {
  const diff: any = {}
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

function deepMerge(target: any, source: any): any {
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

function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?')
  if (idx === -1) return {}
  const params: Record<string, string> = {}
  url.substring(idx + 1).split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return params
}

// https://vitejs.dev/config/

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

function parseMultipart(buf, boundary) {
  const files = []
  const boundaryBuf = Buffer.from('--' + boundary)
  const parts = []
  let start = 0
  while (true) {
    const idx = buf.indexOf(boundaryBuf, start)
    if (idx === -1) break
    if (start > 0) {
      let partStart = start
      let partEnd = idx - 2
      if (partEnd > partStart) parts.push(buf.slice(partStart, partEnd))
    }
    start = idx + boundaryBuf.length + 2
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
      files.push({ fieldName: nameMatch ? nameMatch[1] : 'file', filename: filenameMatch[1], contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream', data: body })
    }
  }
  return files
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'xira-mock-api',
      configureServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const contentType = req.headers['content-type'] || ''
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' })); return }
          const chunks = []; for await (const chunk of req) chunks.push(chunk)
          const buf = Buffer.concat(chunks)
          const files = parseMultipart(buf, boundaryMatch[1])
          if (files.length === 0) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files found' })); return }
          const filesDir = getFilesDir(sid)
          const uploaded = []
          for (const file of files) {
            const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const storedName = `${randomUUID().slice(0, 8)}_${safeFilename}`
            fs.writeFileSync(path.join(filesDir, storedName), file.data)
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            uploaded.push({ original_name: file.filename, stored_name: storedName, size: file.data.length, content_type: file.contentType, url: `/files/${safeSid}/${storedName}` })
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
          const filePath = path.join(FILES_DIR, sid, filename)
          if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end('File not found'); return }
          const ext = path.extname(filename).toLowerCase()
          const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.csv': 'text/csv', '.zip': 'application/zip', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
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
          for await (const chunk of req) {
            body += chunk
          }

          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'

            if (action === 'reset') {
              clearState(sid)
              clearInitialState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
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

              if (!hasMeaningfulState(readInitialState(sid))) writeInitialState(sid, newState)
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
              res.setHeader('Cache-Control', 'no-cache, no-store')
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
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }

            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e: any) {
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
          res.end(JSON.stringify({
            stored_state: state,
            has_custom_state: state !== null,
            sid
          }))
        })

        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const defaultData = getDefaultData()

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
          if (!boundaryMatch) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' })); return }
          const chunks = []; for await (const chunk of req) chunks.push(chunk)
          const buf = Buffer.concat(chunks)
          const files = parseMultipart(buf, boundaryMatch[1])
          if (files.length === 0) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files found' })); return }
          const filesDir = getFilesDir(sid)
          const uploaded = []
          for (const file of files) {
            const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
            const storedName = `${randomUUID().slice(0, 8)}_${safeFilename}`
            fs.writeFileSync(path.join(filesDir, storedName), file.data)
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '')
            uploaded.push({ original_name: file.filename, stored_name: storedName, size: file.data.length, content_type: file.contentType, url: `/files/${safeSid}/${storedName}` })
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
          const filePath = path.join(FILES_DIR, sid, filename)
          if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end('File not found'); return }
          const ext = path.extname(filename).toLowerCase()
          const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.csv': 'text/csv', '.zip': 'application/zip', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
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
          for await (const chunk of req) {
            body += chunk
          }

          try {
            const data = JSON.parse(body)
            const action = data.action || 'set'

            if (action === 'reset') {
              clearState(sid)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-cache, no-store')
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
              res.setHeader('Cache-Control', 'no-cache, no-store')
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
              const existingInitial = readInitialState(sid)
              const initial = hasMeaningfulState(existingInitial)
                ? existingInitial
                : hasMeaningfulState(data.initial_state)
                  ? data.initial_state
                  : getDefaultData()
              if (!hasMeaningfulState(existingInitial)) writeInitialState(sid, initial)
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }

            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Unknown action' }))
          } catch (e: any) {
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
          res.end(JSON.stringify({
            stored_state: state,
            has_custom_state: state !== null,
            sid
          }))
        })

        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()

          const query = parseQuery(req.url || '')
          const sid = query.sid || null

          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const defaultData = getDefaultData()

          const initial = hasMeaningfulState(initialState)
            ? initialState
            : hasMeaningfulState(currentState)
              ? defaultData
              : defaultData
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
    allowedHosts: ['xira-app.app.msh.work'],
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
