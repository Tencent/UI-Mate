import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const STATE_DIR = path.resolve(process.cwd(), '.mock-states');

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function sanitizeSid(sid) {
  if (!sid) return 'default';
  return sid.replace(/[^a-zA-Z0-9_-]/g, '');
}

function getStatePath(sid) {
  return path.join(STATE_DIR, `${sanitizeSid(sid)}.json`);
}

function getInitialStatePath(sid) {
  return path.join(STATE_DIR, `${sanitizeSid(sid)}.initial.json`);
}

function readState(sid) {
  const filePath = getStatePath(sid);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function readInitialState(sid) {
  const filePath = getInitialStatePath(sid);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function writeState(sid, data) {
  ensureStateDir();
  fs.writeFileSync(getStatePath(sid), JSON.stringify(data, null, 2), 'utf-8');
}

function writeInitialState(sid, data) {
  ensureStateDir();
  fs.writeFileSync(getInitialStatePath(sid), JSON.stringify(data, null, 2), 'utf-8');
}

function deepDiff(initial, current, prefix = '') {
  const diff = {};
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const oldVal = initial?.[key];
    const newVal = current?.[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (oldVal && newVal && typeof oldVal === 'object' && typeof newVal === 'object' && !Array.isArray(oldVal) && !Array.isArray(newVal)) {
        Object.assign(diff, deepDiff(oldVal, newVal, fullKey));
      } else {
        diff[fullKey] = { old: oldVal, new: newVal };
      }
    }
  }
  return diff;
}

function setupMiddleware(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      const sid = sanitizeSid(url.searchParams.get('sid'));

      // POST /post?sid=xxx
      if (req.method === 'POST' && url.pathname === '/post') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);

            if (payload.action === 'set') {
              writeState(sid, payload.state);
              writeInitialState(sid, payload.state);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true }));
            } else if (payload.action === 'set_current') {
              writeState(sid, payload.state);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true }));
            } else if (payload.action === 'reset') {
              const initial = readInitialState(sid);
              if (initial) {
                writeState(sid, initial);
              }
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true }));
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Unknown action' }));
            }
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // GET /go?sid=xxx or GET /state?sid=xxx
      if (req.method === 'GET' && (url.pathname === '/go' || url.pathname === '/state')) {
        const current = readState(sid);
        const initial = readInitialState(sid);

        if (current) {
          const stateDiff = deepDiff(initial || {}, current || {});
          const response = {
            initial_state: initial || {},
            current_state: current || {},
            state_diff: stateDiff,
          };
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(response, null, 2));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ initial_state: {}, current_state: {}, state_diff: {} }));
        }
        return;
      }

      // OPTIONS for CORS preflight
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.statusCode = 204;
        res.end();
        return;
      }

      next();
    });
}

const mockApiPlugin = {
  name: 'mock-api',
  configureServer(server) { setupMiddleware(server); },
  configurePreviewServer(server) { setupMiddleware(server); },
};

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin],
  server: {
    watch: { usePolling: true, interval: 1000 },
    port: 3000,
  },
});
