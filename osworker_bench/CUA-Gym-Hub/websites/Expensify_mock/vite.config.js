import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const STATE_DIR = path.resolve(process.cwd(), '.mock-states');

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function sanitizeSid(sid) {
  return sid ? sid.replace(/[^a-zA-Z0-9_-]/g, '') : '';
}

function readSessionFile(sid) {
  const fp = path.join(STATE_DIR, `${sid}.json`);
  if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  return null;
}

function writeSessionFile(sid, data) {
  ensureStateDir();
  fs.writeFileSync(path.join(STATE_DIR, `${sid}.json`), JSON.stringify(data, null, 2));
}

// Files directory for uploaded attachments
const FILES_DIR = path.join(process.cwd(), '.mock-files');
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

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

function setupMiddleware(server) {
  ensureStateDir();

  // POST /upload?sid=xxx
  server.middlewares.use('/upload', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = sanitizeSid(url.searchParams.get('sid') || '');
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
      const safeSid = (sid || '_default').replace(/[^a-zA-Z0-9_-]/g, '');
      uploaded.push({ original_name: file.filename, stored_name: storedName, size: file.data.length, content_type: file.contentType, url: `/files/${safeSid}/${storedName}` });
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, files: uploaded }));
  });

  // GET /files/:sid/:filename
  server.middlewares.use('/files', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const parts = (req.url || '').split('/').filter(Boolean);
    if (parts.length < 2) { res.statusCode = 404; res.end('Not found'); return; }
    const sid = parts[0].replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = parts.slice(1).join('/').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(FILES_DIR, sid, filename);
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

  // POST /post?sid=xxx
  server.middlewares.use('/post', (req, res, next) => {
    if (req.method !== 'POST') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = sanitizeSid(url.searchParams.get('sid') || '');
    if (!sid) { res.statusCode = 400; res.end(JSON.stringify({ error: 'sid required' })); return; }

    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { action, state } = JSON.parse(body);
        if (action === 'set') {
          writeSessionFile(sid, { initial_state: state, current_state: state });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } else if (action === 'set_current') {
          const existing = readSessionFile(sid) || {};
          existing.current_state = state;
          writeSessionFile(sid, existing);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } else if (action === 'reset') {
          const existing = readSessionFile(sid);
          if (existing && existing.initial_state) {
            existing.current_state = JSON.parse(JSON.stringify(existing.initial_state));
            writeSessionFile(sid, existing);
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'unknown action' }));
        }
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  });

  // GET /state?sid=xxx
  server.middlewares.use('/state', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const url = new URL(req.url, 'http://localhost');
    const sid = sanitizeSid(url.searchParams.get('sid') || '');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    if (!sid) { res.end(JSON.stringify(null)); return; }
    const data = readSessionFile(sid);
    res.end(JSON.stringify(data ? data.current_state : null));
  });
}

function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      setupMiddleware(server);
    },
    configurePreviewServer(server) {
      setupMiddleware(server);
    }
  };
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
  server: {
    watch: { usePolling: true, interval: 1000 }, host: '0.0.0.0', allowedHosts: true },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
});
