import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { DEFAULT_STATE } from './src/utils/mockData.js'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) { fs.mkdirSync(STATE_DIR, { recursive: true }) }

// Files directory for uploaded attachments
const FILES_DIR = path.join(process.cwd(), '.mock-files')
if (!fs.existsSync(FILES_DIR)) { fs.mkdirSync(FILES_DIR, { recursive: true }) }

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

// Generate default files so default attachments work out of the box
function ensureDefaultFiles() {
  const defaultDir = getFilesDir('_default')

  const writePdf = (filename, title) => {
    const pdfPath = path.join(defaultDir, filename)
    if (fs.existsSync(pdfPath)) return
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
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
    fs.writeFileSync(pdfPath, pdfContent)
  }

  writePdf('report.pdf', 'Report')
  writePdf('E-Ticket_CA4521.pdf', 'E-Ticket CA4521')
  writePdf('Itinerary_MP093MQ.pdf', 'Itinerary MP093MQ')

  const zipPath = path.join(defaultDir, 'Team_Outing_Photos.zip')
  if (!fs.existsSync(zipPath)) {
    fs.writeFileSync(zipPath, 'Xutlook mock archive: Team Outing Photos\n')
  }
}

ensureDefaultFiles()

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

function readState(sid) { try { const f=getStateFile(sid); if(fs.existsSync(f)) return JSON.parse(fs.readFileSync(f,'utf-8')) } catch(e){console.error('Error:',e)} return null }
function readInitialState(sid) { try { const f=getInitialStateFile(sid); if(fs.existsSync(f)) return JSON.parse(fs.readFileSync(f,'utf-8')) } catch(e){console.error('Error:',e)} return null }
function writeState(sid,state) { try{fs.writeFileSync(getStateFile(sid),JSON.stringify(state,null,2));return true}catch(e){return false} }
function writeInitialState(sid,state) { try{fs.writeFileSync(getInitialStateFile(sid),JSON.stringify(state,null,2));return true}catch(e){return false} }
function clearState(sid) { try{const f=getStateFile(sid);if(fs.existsSync(f))fs.unlinkSync(f);return true}catch(e){return false} }
function clearInitialState(sid) { try{const f=getInitialStateFile(sid);if(fs.existsSync(f))fs.unlinkSync(f);return true}catch(e){return false} }
function deepMerge(t,s) { const r={...t};for(const k in s){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))r[k]=deepMerge(r[k]||{},s[k]);else r[k]=s[k];}return r }
function parseQuery(url) { const i=url.indexOf('?');if(i===-1)return{};const p={};url.substring(i+1).split('&').forEach(x=>{const[k,v]=x.split('=');if(k)p[decodeURIComponent(k)]=decodeURIComponent(v||'')});return p }
function hasMeaningfulState(state) { return !!state && typeof state === 'object' && Object.keys(state).length > 0 }

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

        // GET /files/:sid/:filename - Serve uploaded files
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
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          let body = ''; for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body); const action = data.action || 'set'
            if (action === 'reset') { clearState(sid); clearInitialState(sid); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,message:'State reset.'})); return }
            if (action === 'set') { const cur=readState(sid)||{}; const ns=data.merge?deepMerge(cur,data.state):data.state; if(!hasMeaningfulState(readInitialState(sid))) writeInitialState(sid, ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,message:'State updated.',state:ns})); return }
            if (action === 'set_current') {
              const cur=readState(sid)||{}
              const ns=data.merge?deepMerge(cur,data.state):data.state
              const existingInitial=readInitialState(sid)
              const initial=hasMeaningfulState(existingInitial)?existingInitial:(hasMeaningfulState(data.initial_state)?data.initial_state:DEFAULT_STATE)
              if(!hasMeaningfulState(existingInitial)) writeInitialState(sid, initial)
              writeState(sid,ns)
              res.setHeader('Content-Type','application/json')
              res.end(JSON.stringify({success:true,message:'Current state updated.',state:ns}))
              return
            }
            res.statusCode=400; res.end(JSON.stringify({error:'Unknown action'}))
          } catch(e) { res.statusCode=400; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({error:e.message})) }
        })
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || ''); const sid = query.sid || null; const state = readState(sid)
          res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-cache, no-store')
          res.end(JSON.stringify({stored_state:state,has_custom_state:state!==null,sid}))
        })
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const initial = hasMeaningfulState(initialState) ? initialState : DEFAULT_STATE
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

        // GET /files/:sid/:filename - Serve uploaded files
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
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          let body = ''; for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body); const action = data.action || 'set'
            if (action === 'reset') { clearState(sid); clearInitialState(sid); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,message:'State reset.'})); return }
            if (action === 'set') { const cur=readState(sid)||{}; const ns=data.merge?deepMerge(cur,data.state):data.state; if(!hasMeaningfulState(readInitialState(sid))) writeInitialState(sid, ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,message:'State updated.',state:ns})); return }
            if (action === 'set_current') {
              const cur=readState(sid)||{}
              const ns=data.merge?deepMerge(cur,data.state):data.state
              const existingInitial=readInitialState(sid)
              const initial=hasMeaningfulState(existingInitial)?existingInitial:(hasMeaningfulState(data.initial_state)?data.initial_state:DEFAULT_STATE)
              if(!hasMeaningfulState(existingInitial)) writeInitialState(sid, initial)
              writeState(sid,ns)
              res.setHeader('Content-Type','application/json')
              res.end(JSON.stringify({success:true,message:'Current state updated.',state:ns}))
              return
            }
            res.statusCode=400; res.end(JSON.stringify({error:'Unknown action'}))
          } catch(e) { res.statusCode=400; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({error:e.message})) }
        })
        server.middlewares.use('/state', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || ''); const sid = query.sid || null; const state = readState(sid)
          res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-cache, no-store')
          res.end(JSON.stringify({stored_state:state,has_custom_state:state!==null,sid}))
        })
        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const query = parseQuery(req.url || '')
          const sid = query.sid || null
          const currentState = readState(sid)
          const initialState = readInitialState(sid)
          const initial = hasMeaningfulState(initialState) ? initialState : DEFAULT_STATE
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
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**"],
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
