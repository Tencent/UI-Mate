import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const STATE_DIR = path.resolve('.mock-states');

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function sanitizeSid(sid) {
  return (sid || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
}

function getStatePath(sid) {
  return path.join(STATE_DIR, `${sanitizeSid(sid)}.json`);
}

function readSessionState(sid) {
  const p = getStatePath(sid);
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
  }
  return null;
}

function writeSessionState(sid, data) {
  ensureStateDir();
  fs.writeFileSync(getStatePath(sid), JSON.stringify(data, null, 2));
}

function computeDiff(initial, current, prefix = '') {
  const diff = {};
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const oldVal = (initial || {})[key];
    const newVal = (current || {})[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (oldVal && newVal && typeof oldVal === 'object' && !Array.isArray(oldVal)) {
        Object.assign(diff, computeDiff(oldVal, newVal, fullKey));
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
    const sid = sanitizeSid(url.searchParams.get('sid') || 'default');

    // POST /post - set/reset state
    if (req.method === 'POST' && url.pathname === '/post') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const existing = readSessionState(sid) || {};

          if (payload.action === 'set') {
            const newState = { initial_state: payload.state, current_state: payload.state };
            writeSessionState(sid, newState);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ ok: true }));
          } else if (payload.action === 'set_current') {
            const newState = { initial_state: existing.initial_state || payload.state, current_state: payload.state };
            writeSessionState(sid, newState);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ ok: true }));
          } else if (payload.action === 'reset') {
            if (existing.initial_state) {
              writeSessionState(sid, { initial_state: existing.initial_state, current_state: existing.initial_state });
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

    // OPTIONS preflight
    if (req.method === 'OPTIONS' && url.pathname === '/post') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.end();
      return;
    }

    // GET /state or GET /go - return state
    if (req.method === 'GET' && (url.pathname === '/state' || url.pathname === '/go')) {
      const session = readSessionState(sid);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (session) {
        const diff = computeDiff(session.initial_state || {}, session.current_state || {});
        res.end(JSON.stringify({ initial_state: session.initial_state, current_state: session.current_state, state_diff: diff }, null, 2));
      } else {
        res.end(JSON.stringify({ initial_state: null, current_state: null, state_diff: {} }));
      }
      return;
    }

    next();
  });
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), { name: 'mock-api', configureServer: setupMiddleware, configurePreviewServer: setupMiddleware }],
  server: {
    watch: { usePolling: true, interval: 1000 },
    port: 5173
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true },
});
