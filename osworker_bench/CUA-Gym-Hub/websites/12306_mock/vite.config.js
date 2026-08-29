import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function computeDiff(initial, current, keyPath = '') {
  const diff = {};
  if (initial === current) return diff;
  const allKeys = new Set([
    ...Object.keys(initial || {}),
    ...Object.keys(current || {}),
  ]);
  for (const key of allKeys) {
    const fullPath = keyPath ? `${keyPath}.${key}` : key;
    const oldVal = initial ? initial[key] : undefined;
    const newVal = current ? current[key] : undefined;
    if (oldVal === newVal) continue;
    if (
      oldVal !== null && newVal !== null &&
      typeof oldVal === 'object' && typeof newVal === 'object' &&
      !Array.isArray(oldVal) && !Array.isArray(newVal)
    ) {
      const nested = computeDiff(oldVal, newVal, fullPath);
      Object.assign(diff, nested);
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullPath] = { old: oldVal, new: newVal };
    }
  }
  return diff;
}

const STATE_DIR = path.resolve(__dirname, '.mock-states');

function setupMiddleware(server) {
  // Ensure state dir exists
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        // POST /post?sid=xxx
        if (req.method === 'POST' && url.pathname === '/post') {
          const rawSid = url.searchParams.get('sid') || 'default';
          const sid = rawSid.replace(/[^a-zA-Z0-9_-]/g, '');
          const filePath = path.join(STATE_DIR, `${sid}.json`);

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const { action, state } = payload;

              let stored = {};
              if (fs.existsSync(filePath)) {
                stored = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              }

              if (action === 'set') {
                stored = { initial_state: state, current_state: state };
              } else if (action === 'set_current') {
                stored.current_state = state;
              } else if (action === 'reset') {
                stored.current_state = stored.initial_state || {};
              }

              fs.writeFileSync(filePath, JSON.stringify(stored, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // GET /state?sid=xxx
        if (req.method === 'GET' && url.pathname === '/state') {
          const rawSid = url.searchParams.get('sid') || 'default';
          const sid = rawSid.replace(/[^a-zA-Z0-9_-]/g, '');
          const filePath = path.join(STATE_DIR, `${sid}.json`);

          res.setHeader('Cache-Control', 'no-cache');
          res.writeHead(200, { 'Content-Type': 'application/json' });

          if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            res.end(JSON.stringify(data.current_state || {}));
          } else {
            res.end(JSON.stringify({}));
          }
          return;
        }

        // GET /go?sid=xxx (server-side state inspection)
        if (req.method === 'GET' && url.pathname === '/go') {
          const rawSid = url.searchParams.get('sid') || 'default';
          const sid = rawSid.replace(/[^a-zA-Z0-9_-]/g, '');
          const filePath = path.join(STATE_DIR, `${sid}.json`);

          res.setHeader('Cache-Control', 'no-cache');
          res.writeHead(200, { 'Content-Type': 'application/json' });

          if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const initial = data.initial_state || null;
            const current = data.current_state || null;
            const state_diff = (initial && current) ? computeDiff(initial, current) : {};
            res.end(JSON.stringify({ initial_state: initial, current_state: current, state_diff }));
          } else {
            res.end(JSON.stringify({ initial_state: null, current_state: null, state_diff: {} }));
          }
          return;
        }

        next();
      });
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), 
    react(),
    {
      name: 'mock-api',
      configureServer: setupMiddleware,
      configurePreviewServer: setupMiddleware,
    }
  ],
  server: {
    watch: { usePolling: true, interval: 1000 },
    port: 5173,
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true },
});
