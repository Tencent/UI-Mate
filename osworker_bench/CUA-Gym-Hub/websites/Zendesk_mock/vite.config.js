import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const STATE_DIR = path.resolve(__dirname, '.mock-states');
const UPLOAD_DIR = path.resolve(__dirname, '.mock-files');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sanitizeSid(sid) {
  return sid ? sid.replace(/[^a-zA-Z0-9_-]/g, '') : '';
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
      if (!initial || !initial[key]) {
        diff[key].added = current[key];
      } else {
        diff[key].modified = current[key];
      }
    }
  }
  return Object.keys(diff).length > 0 ? diff : {};
}

function parseMultipart(buf, boundary) {
  const files = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;
  while (true) {
    const idx = buf.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    if (start > 0) {
      let partStart = start;
      let partEnd = idx - 2;
      if (partEnd > partStart) parts.push(buf.slice(partStart, partEnd));
    }
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
    if (filenameMatch && filenameMatch[1]) {
      files.push({ fieldName: nameMatch ? nameMatch[1] : 'file', filename: filenameMatch[1], contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream', data: body });
    }
  }
  return files;
}

function readState(sid) {
  try {
    ensureDir(STATE_DIR);
    const file = path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { console.error('Error reading state:', e); }
  return null;
}

function writeState(sid, state) {
  try {
    ensureDir(STATE_DIR);
    fs.writeFileSync(path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.json`), JSON.stringify(state, null, 2));
    return true;
  } catch (e) { return false; }
}

function readInitialState(sid) {
  try {
    ensureDir(STATE_DIR);
    const file = path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.initial.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { console.error('Error reading initial state:', e); }
  return null;
}

function writeInitialState(sid, state) {
  try {
    ensureDir(STATE_DIR);
    fs.writeFileSync(path.join(STATE_DIR, `${sanitizeSid(sid) || 'default'}.initial.json`), JSON.stringify(state, null, 2));
    return true;
  } catch (e) { return false; }
}

function writeInitialStateIfMissing(sid, state) {
  if (!readInitialState(sid)) writeInitialState(sid, state);
}

function clearState(sid) {
  try {
    ensureDir(STATE_DIR);
    const prefix = sanitizeSid(sid) || 'default';
    const stateFile = path.join(STATE_DIR, `${prefix}.json`);
    const initialFile = path.join(STATE_DIR, `${prefix}.initial.json`);
    if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
    if (fs.existsSync(initialFile)) fs.unlinkSync(initialFile);
    return true;
  } catch (e) { return false; }
}

function getFilesDir(sid) {
  const safeSid = sanitizeSid(sid) || '_default';
  const dir = path.join(UPLOAD_DIR, safeSid);
  ensureDir(dir);
  return dir;
}

function setupMiddleware(server) {
  // POST /upload - Upload attachment files
  server.middlewares.use('/upload', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = url.searchParams.get('sid') || null;
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Content-Type must be multipart/form-data' })); return; }
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const files = parseMultipart(buf, boundaryMatch[1]);
    if (files.length === 0) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'No files found' })); return; }
    const filesDir = getFilesDir(sid);
    const uploaded = [];
    for (const file of files) {
      const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storedName = `${randomUUID().slice(0, 8)}_${safeFilename}`;
      fs.writeFileSync(path.join(filesDir, storedName), file.data);
      const safeSid = sanitizeSid(sid) || '_default';
      uploaded.push({ original_name: file.filename, stored_name: storedName, size: file.data.length, content_type: file.contentType, url: `/files/${safeSid}/${storedName}` });
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, files: uploaded }));
  });

  // GET /files/:sid/:filename - Serve uploaded files
  server.middlewares.use('/files', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const parts = (req.url || '').split('/').filter(Boolean);
    if (parts.length < 2) return next();
    const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(UPLOAD_DIR, sid, filename);
    if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end('File not found'); return; }
    const ext = path.extname(filename).toLowerCase();
    const mimeMap = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain', '.csv': 'text/csv', '.zip': 'application/zip', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const ct = mimeMap[ext] || 'application/octet-stream';
    const fileData = fs.readFileSync(filePath);
    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Length', fileData.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(fileData);
  });

  // POST /post - State management
  server.middlewares.use('/post', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = url.searchParams.get('sid') || null;
    let body = '';
    for await (const chunk of req) { body += chunk; }
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
        const currentState = readState(sid) || {};
        const newState = data.merge ? deepMerge(currentState, data.state) : data.state;
        writeState(sid, newState);
        writeInitialStateIfMissing(sid, newState);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, sid, message: 'State updated.', state: newState }));
        return;
      }

      if (action === 'set_current') {
        const currentState = readState(sid) || {};
        writeInitialStateIfMissing(sid, Object.keys(currentState).length > 0 ? currentState : data.state);
        const newState = data.merge ? deepMerge(currentState, data.state) : data.state;
        writeState(sid, newState);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }));
        return;
      }

      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unknown action' }));
    } catch (e) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: e.message }));
    }
  });

  // GET /state - Read current state
  server.middlewares.use('/state', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = url.searchParams.get('sid') || null;
    const state = readState(sid);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid }));
  });

  // GET /go - State inspection endpoint
  server.middlewares.use('/go', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = url.searchParams.get('sid') || null;
    const currentState = readState(sid);
    const initialState = readInitialState(sid);
    const initial = initialState || currentState || {};
    const current = currentState || initial;
    const stateDiff = calculateStateDiff(initial, current);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff: stateDiff }));
  });
}

function zendeskMockApi() {
  return {
    name: 'xendesk-mock-api',
    configureServer(server) {
      setupMiddleware(server);
    },
    configurePreviewServer(server) {
      setupMiddleware(server);
    }
  };
}

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    port: 0,
    strictPort: false,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/assets/screenshots/**", "**/node_modules/**", "**/.mock-states/**", "**/.mock-files/**"]
    },
    hmr: { port: 0 }
  },
  plugins: [secureMockApiPlugin(), react(), zendeskMockApi()],
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
});
