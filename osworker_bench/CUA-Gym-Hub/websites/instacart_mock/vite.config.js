import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const STATE_DIR = path.join(process.cwd(), '.mock-states')
if (!fs.existsSync(STATE_DIR)) { fs.mkdirSync(STATE_DIR, { recursive: true }) }

function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json')
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(STATE_DIR, `${safeSid}.json`)
}
function readState(sid) { try { const f=getStateFile(sid); if(fs.existsSync(f)) return JSON.parse(fs.readFileSync(f,'utf-8')) } catch(e){console.error('Error:',e)} return null }
function writeState(sid,state) { try{fs.writeFileSync(getStateFile(sid),JSON.stringify(state,null,2));return true}catch(e){return false} }
function clearState(sid) { try{const f=getStateFile(sid);if(fs.existsSync(f))fs.unlinkSync(f);return true}catch(e){return false} }
function getInitialStateFile(sid) { if(!sid)return path.join(process.cwd(),'.mock-state.initial.json');const safeSid=sid.replace(/[^a-zA-Z0-9_-]/g,'');return path.join(STATE_DIR,`${safeSid}.initial.json`) }
function readInitialState(sid) { try{const f=getInitialStateFile(sid);if(fs.existsSync(f))return JSON.parse(fs.readFileSync(f,'utf-8'))}catch(e){console.error('Error reading initial state:',e)}return null }
function writeInitialState(sid,state) { try{fs.writeFileSync(getInitialStateFile(sid),JSON.stringify(state,null,2));return true}catch(e){console.error('Error writing initial state:',e);return false} }
function calculateStateDiff(initial,current) { const diff={};for(const key in current){if(!initial||JSON.stringify(current[key])!==JSON.stringify(initial[key])){if(!diff[key])diff[key]={};if(!initial||!initial[key]){diff[key].added=current[key]}else{diff[key].modified=current[key]}}}return Object.keys(diff).length>0?diff:{} }
function deepMerge(t,s) { const r={...t};for(const k in s){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))r[k]=deepMerge(r[k]||{},s[k]);else r[k]=s[k];}return r }
function parseQuery(url) { const i=url.indexOf('?');if(i===-1)return{};const p={};url.substring(i+1).split('&').forEach(x=>{const[k,v]=x.split('=');if(k)p[decodeURIComponent(k)]=decodeURIComponent(v||'')});return p }

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          let body = ''; for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body); const action = data.action || 'set'
            if (action === 'reset') { clearState(sid); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'State reset to default.'})); return }
            if (action === 'set') { const cur=readState(sid)||{}; const ns=data.merge?deepMerge(cur,data.state):data.state; if(!readInitialState(sid)) writeInitialState(sid,Object.keys(cur).length?cur:ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'State updated.',state:ns})); return }
            if (action === 'set_current') { const cur=readState(sid); const ns=data.state; if(!readInitialState(sid)) writeInitialState(sid,cur||ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'Current state saved.',state:ns})); return }
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
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          const currentState = readState(sid); const initialState = readInitialState(sid)
          const initial = initialState || currentState || {}; const current = currentState || initial
          const stateDiff = calculateStateDiff(initial, current)
          res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-cache, no-store')
          res.end(JSON.stringify({initial_state:initial,current_state:current,state_diff:stateDiff}))
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          let body = ''; for await (const chunk of req) { body += chunk }
          try {
            const data = JSON.parse(body); const action = data.action || 'set'
            if (action === 'reset') { clearState(sid); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'State reset to default.'})); return }
            if (action === 'set') { const cur=readState(sid)||{}; const ns=data.merge?deepMerge(cur,data.state):data.state; if(!readInitialState(sid)) writeInitialState(sid,Object.keys(cur).length?cur:ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'State updated.',state:ns})); return }
            if (action === 'set_current') { const cur=readState(sid); const ns=data.state; if(!readInitialState(sid)) writeInitialState(sid,cur||ns); writeState(sid,ns); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({success:true,sid,message:'Current state saved.',state:ns})); return }
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
          const query = parseQuery(req.url || ''); const sid = query.sid || null
          const currentState = readState(sid); const initialState = readInitialState(sid)
          const initial = initialState || currentState || {}; const current = currentState || initial
          const stateDiff = calculateStateDiff(initial, current)
          res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-cache, no-store')
          res.end(JSON.stringify({initial_state:initial,current_state:current,state_diff:stateDiff}))
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
