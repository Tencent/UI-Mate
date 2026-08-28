import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { generateInitialData } from './src/data/initialData';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Session-based state directory
const STATE_DIR = path.join(process.cwd(), '.mock-states');
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

// Files directory for uploaded attachments
const FILES_DIR = path.join(process.cwd(), '.mock-files');
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

function getFilesDir(sid: string | null): string {
  const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
  const dir = path.join(FILES_DIR, safeSid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Simple multipart parser for file uploads
function parseMultipart(buf: Buffer, boundary: string): Array<{ fieldName: string; filename: string; contentType: string; data: Buffer }> {
  const files: Array<{ fieldName: string; filename: string; contentType: string; data: Buffer }> = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  const parts: Buffer[] = [];
  let start = 0;
  while (true) {
    const idx = buf.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    if (start > 0) { let s = start, e = idx - 2; if (e > s) parts.push(buf.slice(s, e)); }
    start = idx + boundaryBuf.length + 2;
  }
  for (const part of parts) {
    const he = part.indexOf('\r\n\r\n');
    if (he === -1) continue;
    const h = part.slice(0, he).toString('utf-8'), b = part.slice(he + 4);
    const nm = h.match(/name="([^"]*)"/);
    const fn = h.match(/filename="([^"]*)"/);
    const ct = h.match(/Content-Type:\s*(.+)/i);
    if (fn && fn[1]) files.push({ fieldName: nm ? nm[1] : 'file', filename: fn[1], contentType: ct ? ct[1].trim() : 'application/octet-stream', data: b });
  }
  return files;
}

function getStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.json');
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(STATE_DIR, `${safeSid}.json`);
}

function readState(sid: string | null): any {
  try {
    const file = getStateFile(sid);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { console.error('Error reading state:', e); }
  return null;
}

function writeState(sid: string | null, state: any): boolean {
  try { fs.writeFileSync(getStateFile(sid), JSON.stringify(state, null, 2)); return true; }
  catch (e) { return false; }
}

function clearState(sid: string | null): boolean {
  try {
    const f = getStateFile(sid);
    if (fs.existsSync(f)) fs.unlinkSync(f);
    const initFile = getInitialStateFile(sid);
    if (fs.existsSync(initFile)) fs.unlinkSync(initFile);
    return true;
  } catch (e) { return false; }
}

function getInitialStateFile(sid: string | null): string {
  if (!sid) return path.join(process.cwd(), '.mock-state.initial.json');
  const safeSid = sid.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(STATE_DIR, `${safeSid}.initial.json`);
}

function readInitialState(sid: string | null): any {
  try {
    const f = getInitialStateFile(sid);
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch (e) { console.error('Error reading initial state:', e); }
  return null;
}

function writeInitialStateIfMissing(sid: string | null, baseline: any): void {
  if (readInitialState(sid)) return;
  try {
    fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(baseline, null, 2));
  } catch (e) {
    console.error('Error writing initial state file:', e);
  }
}

function calculateStateDiff(initial: any, current: any): any {
  const diff: any = {};
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

function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const params: Record<string, string> = {};
  url.substring(idx + 1).split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return params;
}

function deepMerge(target: any, source: any): any {
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

// Generate sample default files so default attachments work out of the box
function ensureDefaultFiles() {
  const defaultDir = getFilesDir('_default');

  const createMinimalPdf = (title: string) => `%PDF-1.4
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
%%EOF`;

  // design-specs.pdf referenced by attach-1 as landing_page_v2.fig
  const designSpecsPath = path.join(defaultDir, 'design-specs.pdf');
  if (!fs.existsSync(designSpecsPath)) {
    fs.writeFileSync(designSpecsPath, createMinimalPdf('Design Specs'));
  }

  // api_endpoints_spec.pdf referenced by attach-2
  const apiSpecPath = path.join(defaultDir, 'api_endpoints_spec.pdf');
  if (!fs.existsSync(apiSpecPath)) {
    fs.writeFileSync(apiSpecPath, createMinimalPdf('API Endpoints Spec'));
  }

  // design_system_tokens.json referenced by attach-3
  const tokensPath = path.join(defaultDir, 'design_system_tokens.json');
  if (!fs.existsSync(tokensPath)) {
    fs.writeFileSync(tokensPath, JSON.stringify({ colors: { primary: '#6C63FF', secondary: '#2F2E41' }, spacing: { sm: 4, md: 8, lg: 16 } }, null, 2));
  }
}

ensureDefaultFiles();

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req: any, res: any, next: any) => {
          if (req.method !== 'POST') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          const ct = req.headers['content-type'] || '';
          const bm = ct.match(/boundary=(.+)/);
          if (!bm) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'multipart/form-data required' }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c);
          const buf = Buffer.concat(chunks);

          const files = parseMultipart(buf, bm[1]);
          if (!files.length) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No files' }));
            return;
          }

          const filesDir = getFilesDir(sid);
          const uploaded: any[] = [];
          for (const f of files) {
            const safe = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const stored = `${randomUUID().slice(0, 8)}_${safe}`;
            fs.writeFileSync(path.join(filesDir, stored), f.data);
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
            uploaded.push({
              original_name: f.filename,
              stored_name: stored,
              size: f.data.length,
              content_type: f.contentType,
              url: `/files/${safeSid}/${stored}`
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, files: uploaded }));
        });

        // GET/HEAD /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req: any, res: any, next: any) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next();

          const parts = (req.url || '').split('/').filter(Boolean);
          if (parts.length < 2) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }

          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '');
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_');
          const fp = path.join(FILES_DIR, sid, filename);

          if (!fs.existsSync(fp)) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          const ext = path.extname(filename).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.zip': 'application/zip',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.json': 'application/json',
            '.fig': 'application/octet-stream',
            '.csv': 'text/csv',
          };

          const fileData = fs.readFileSync(fp);
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Content-Length', fileData.length);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          res.end(fileData);
        });

        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          let body = '';
          for await (const chunk of req) { body += chunk; }
          try {
            const data = JSON.parse(body);
            const action = data.action || 'set';
            if (action === 'reset') {
              clearState(sid);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'State reset.' }));
              return;
            }
            if (action === 'set') {
              const cur = readState(sid) || {};
              const ns = data.merge ? deepMerge(cur, data.state) : data.state;
              writeState(sid, ns);
              // On first set for this session, also store as initial state for state_diff
              writeInitialStateIfMissing(sid, ns);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'State updated.', state: ns }));
              return;
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              writeInitialStateIfMissing(sid, Object.keys(currentState).length > 0 ? currentState : generateInitialData())
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                const baseline = Object.keys(currentState).length > 0 ? currentState : newState
                try {
                  fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(baseline, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }

            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Unknown action' }));
          } catch (e: any) {
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
          res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid: sid }));
        });

        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          const currentState = readState(sid);
          const initialState = readInitialState(sid);
          const defaultData = generateInitialData();
          const initial = initialState || currentState || defaultData;
          const current = currentState || initial;
          const stateDiff = calculateStateDiff(initial, current);

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store');
          res.end(JSON.stringify({
            initial_state: initial,
            current_state: current,
            state_diff: stateDiff
          }));
        });
      },
      configurePreviewServer(server) {
        // POST /upload - Upload attachment files
        server.middlewares.use('/upload', async (req: any, res: any, next: any) => {
          if (req.method !== 'POST') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          const ct = req.headers['content-type'] || '';
          const bm = ct.match(/boundary=(.+)/);
          if (!bm) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'multipart/form-data required' }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c);
          const buf = Buffer.concat(chunks);

          const files = parseMultipart(buf, bm[1]);
          if (!files.length) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No files' }));
            return;
          }

          const filesDir = getFilesDir(sid);
          const uploaded: any[] = [];
          for (const f of files) {
            const safe = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const stored = `${randomUUID().slice(0, 8)}_${safe}`;
            fs.writeFileSync(path.join(filesDir, stored), f.data);
            const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
            uploaded.push({
              original_name: f.filename,
              stored_name: stored,
              size: f.data.length,
              content_type: f.contentType,
              url: `/files/${safeSid}/${stored}`
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, files: uploaded }));
        });

        // GET/HEAD /files/:sid/:filename - Serve uploaded files
        server.middlewares.use('/files', (req: any, res: any, next: any) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next();

          const parts = (req.url || '').split('/').filter(Boolean);
          if (parts.length < 2) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }

          const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '');
          const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_');
          const fp = path.join(FILES_DIR, sid, filename);

          if (!fs.existsSync(fp)) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          const ext = path.extname(filename).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.zip': 'application/zip',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.json': 'application/json',
            '.fig': 'application/octet-stream',
            '.csv': 'text/csv',
          };

          const fileData = fs.readFileSync(fp);
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Content-Length', fileData.length);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          res.end(fileData);
        });

        server.middlewares.use('/post', async (req, res, next) => {
          if (req.method !== 'POST') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          let body = '';
          for await (const chunk of req) { body += chunk; }
          try {
            const data = JSON.parse(body);
            const action = data.action || 'set';
            if (action === 'reset') {
              clearState(sid);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'State reset.' }));
              return;
            }
            if (action === 'set') {
              const cur = readState(sid) || {};
              const ns = data.merge ? deepMerge(cur, data.state) : data.state;
              writeState(sid, ns);
              // On first set for this session, also store as initial state for state_diff
              writeInitialStateIfMissing(sid, ns);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'State updated.', state: ns }));
              return;
            }
            if (action === 'set_current') {
              const currentState = readState(sid) || {}
              writeInitialStateIfMissing(sid, Object.keys(currentState).length > 0 ? currentState : generateInitialData())
              const newState = data.merge
                ? deepMerge(currentState, data.state)
                : data.state
              if (!readInitialState(sid)) {
                const baseline = Object.keys(currentState).length > 0 ? currentState : newState
                try {
                  fs.writeFileSync(getInitialStateFile(sid), JSON.stringify(baseline, null, 2))
                } catch (e) {
                  console.error('Error writing initial state file:', e)
                }
              }
              writeState(sid, newState)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Current state updated. Initial state preserved.', state: newState }))
              return
            }

            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Unknown action' }));
          } catch (e: any) {
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
          res.end(JSON.stringify({ stored_state: state, has_custom_state: state !== null, sid: sid }));
        });

        server.middlewares.use('/go', (req, res, next) => {
          if (req.method !== 'GET') return next();

          const query = parseQuery(req.url || '');
          const sid = query.sid || null;

          const currentState = readState(sid);
          const initialState = readInitialState(sid);
          const defaultData = generateInitialData();
          const initial = initialState || currentState || defaultData;
          const current = currentState || initial;
          const stateDiff = calculateStateDiff(initial, current);

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store');
          res.end(JSON.stringify({
            initial_state: initial,
            current_state: current,
            state_diff: stateDiff
          }));
        });
      }
    }
  ],
  server: {
    port: 3000,
    allowedHosts: true,
    watch: {
      ignored: ['**/.mock-states/**', '**/.mock-files/**'],
    },
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
});
