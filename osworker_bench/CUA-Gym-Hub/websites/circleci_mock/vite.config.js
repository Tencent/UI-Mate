import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { createInitialData } from './src/utils/dataManager.js'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true })
const FILES_DIR = path.join(process.cwd(), '.mock-files')
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true })

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
  try { fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2)); return true }
  catch (e) { console.error('Error writing state:', e); return false }
}

function writeInitialStateIfMissing(sid, state) {
  try {
    const file = getInitialStateFile(sid)
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(state, null, 2))
  } catch (e) { console.error('Error writing initial state:', e) }
}

function readInitialState(sid) {
  try {
    const f = getInitialStateFile(sid)
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'))
  } catch (e) { console.error('Error reading initial state:', e) }
  return null
}

function clearState(sid) {
  try {
    const file = getStateFile(sid)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    const initFile = getInitialStateFile(sid)
    if (fs.existsSync(initFile)) fs.unlinkSync(initFile)
    return true
  } catch (e) { console.error('Error clearing state:', e); return false }
}

function calculateStateDiff(initial, current) {
  const diff = {}
  function diffObj(init, curr, prefix) {
    const allKeys = new Set([...Object.keys(init || {}), ...Object.keys(curr || {})])
    for (const key of allKeys) {
      const p = prefix ? `${prefix}.${key}` : key
      const oldVal = init ? init[key] : undefined
      const newVal = curr ? curr[key] : undefined
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff[p] = { old: oldVal, new: newVal }
      }
    }
  }
  diffObj(initial, current, '')
  return diff
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

function createApiMiddleware(server) {
  server.middlewares.use('/upload', async (req, res, next) => {
    if (req.method !== 'POST') return next()
    const query = parseQuery(req.url || '')
    const filename = path.basename(query.filename || `upload-${Date.now()}.bin`).replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = path.join(FILES_DIR, filename)
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    fs.writeFileSync(filePath, Buffer.concat(chunks))
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ success: true, filename, url: `/files/${encodeURIComponent(filename)}` }))
  })

  server.middlewares.use('/files', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    const rawName = decodeURIComponent((req.url || '').replace(/^\/+/, '').split('?')[0])
    const filename = path.basename(rawName || '')
    if (!filename) return next()
    const filePath = path.join(FILES_DIR, filename)
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'File not found' }))
      return
    }
    const ext = path.extname(filename).toLowerCase()
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.png': 'image/png',
      '.mp4': 'video/mp4'
    }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache, no-store')
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    fs.createReadStream(filePath).pipe(res)
  })

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
        const currentState = readState(sid) || {}
        const newState = data.merge ? deepMerge(currentState, data.state) : data.state
        writeState(sid, newState)
        try { fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(newState, null, 2)) }
        catch (e) { console.error('Error writing initial state:', e) }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, sid, message: 'State updated.', state: newState }))
        return
      }
      if (action === 'set_current') {
        const currentState = readState(sid) || {}
        const newState = data.merge ? deepMerge(currentState, data.state) : data.state
        writeInitialStateIfMissing(sid, data.initialState || (currentState && Object.keys(currentState).length ? currentState : newState))
        writeState(sid, newState)
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

export default defineConfig({
  base: '/',
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) { createApiMiddleware(server) },
      configurePreviewServer(server) { createApiMiddleware(server) }
    }
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } }
  },
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
