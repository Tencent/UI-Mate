import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createInitialData } from './src/utils/dataManager.js';

const STATE_DIR = path.join(process.cwd(), '.mock-states');
if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

function getStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.json');
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(STATE_DIR, `${safeSid}.json`);
}

function getInitialStateFile(sid) {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json');
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(STATE_DIR, `${safeSid}.initial.json`);
}

function readState(sid) {
  try {
    const file = getStateFile(sid);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { console.error('Error reading state:', e); }
  return null;
}

function readInitialState(sid) {
  try {
    const f = getInitialStateFile(sid);
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch (e) { console.error('Error reading initial state:', e); }
  return null;
}

function writeState(sid, state) {
  try { fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2)); return true; }
  catch (e) { console.error('Error writing state:', e); return false; }
}

function clearState(sid) {
  try {
    const f = getStateFile(sid); if (fs.existsSync(f)) fs.unlinkSync(f);
    const fi = getInitialStateFile(sid); if (fs.existsSync(fi)) fs.unlinkSync(fi);
    return true;
  } catch (e) { console.error('Error clearing state:', e); return false; }
}

function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const params = {};
  url.substring(idx + 1).split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return params;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function calculateStateDiff(initial, current) {
  const diff = {};
  for (const key in current) {
    if (!initial || JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      if (!diff[key]) diff[key] = {};
      if (!initial || !initial[key]) diff[key].added = current[key];
      else diff[key].modified = current[key];
    }
  }
  return Object.keys(diff).length > 0 ? diff : {};
}

const FILES_DIR = path.join(process.cwd(), '.mock-files');
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });

function getFilesDir(sid) {
  const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
  const dir = path.join(FILES_DIR, safeSid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function parseMultipart(buf, boundary) {
  const files = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;
  while (true) {
    const idx = buf.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    if (start > 0) { let pe = idx - 2; if (pe > start) parts.push(buf.slice(start, pe)); }
    start = idx + boundaryBuf.length + 2;
  }
  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerStr = part.slice(0, headerEnd).toString('utf-8');
    const body = part.slice(headerEnd + 4);
    const nameMatch = headerStr.match(/name="([^"]*)"/);
    const filenameMatch = headerStr.match(/filename="([^"]*)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*(.+)/i);
    if (filenameMatch?.[1]) {
      files.push({ fieldName: nameMatch?.[1] || 'file', filename: filenameMatch[1], contentType: ctMatch?.[1].trim() || 'application/octet-stream', data: body });
    }
  }
  return files;
}

function buildMiddlewares(server) {
  server.middlewares.use('/upload', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const query = parseQuery(req.url || '');
    const sid = query.sid || null;
    const ct = req.headers['content-type'] || '';
    const bm = ct.match(/boundary=(.+)/);
    if (!bm) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' })); return; }
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const files = parseMultipart(buf, bm[1]);
    if (files.length === 0) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files found' })); return; }
    const filesDir = getFilesDir(sid);
    const uploaded = [];
    for (const file of files) {
      const safe = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const stored = `${randomUUID().slice(0, 8)}_${safe}`;
      fs.writeFileSync(path.join(filesDir, stored), file.data);
      const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
      uploaded.push({ original_name: file.filename, stored_name: stored, size: file.data.length, content_type: file.contentType, url: `/files/${safeSid}/${stored}` });
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, files: uploaded }));
  });

  server.middlewares.use('/files', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const parts = (req.url || '').split('/').filter(Boolean);
    if (parts.length < 2) { res.statusCode = 404; res.end('Not found'); return; }
    const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(FILES_DIR, sid, filename);
    if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end('File not found'); return; }
    const ext = path.extname(filename).toLowerCase();
    const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.csv': 'text/csv' };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    const fileData = fs.readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileData.length);
    res.end(fileData);
  });

  server.middlewares.use('/post', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const query = parseQuery(req.url || '');
    const sid = query.sid || null;
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const data = JSON.parse(body);
      const action = data.action || 'set';
      if (action === 'reset') {
        clearState(sid);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, sid, message: 'State reset to default.' }));
        return;
      }
      if (action === 'set') {
        const current = readState(sid) || {};
        const newState = data.merge ? deepMerge(current, data.state) : data.state;
        writeState(sid, newState);
        try { fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(newState, null, 2)); }
        catch (e) { console.error('Error writing initial state:', e); }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, sid, message: 'State updated.', state: newState }));
        return;
      }
      if (action === 'set_current') {
        const current = readState(sid) || {};
        const newState = data.merge ? deepMerge(current, data.state) : data.state;
        writeState(sid, newState);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }));
        return;
      }
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Unknown action' }));
    } catch (e) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: e.message }));
    }
  });

  server.middlewares.use('/state', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const query = parseQuery(req.url || '');
    const sid = query.sid || null;
    const state = readState(sid);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid }));
  });

  server.middlewares.use('/go', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const query = parseQuery(req.url || '');
    const sid = query.sid || null;
    if (!sid) return next();
    const currentState = readState(sid);
    const initialState = readInitialState(sid);
    const defaultData = createInitialData();
    const initial = initialState || currentState || defaultData;
    const current = currentState || initial;
    const stateDiff = calculateStateDiff(initial, current);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: stateDiff }));
  });
}

export default defineConfig({
  base: '/',
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) { buildMiddlewares(server); },
      configurePreviewServer(server) { buildMiddlewares(server); }
    }
  ],
  esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  server: {
    port: 0,
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**"]
    },
    hmr: { port: 0 }
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
});
