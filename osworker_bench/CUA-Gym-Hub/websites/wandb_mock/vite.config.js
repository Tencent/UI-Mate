import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = path.join(__dirname, '.mock-states');

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function sanitizeSid(sid) {
  return sid ? sid.replace(/[^a-zA-Z0-9_-]/g, '') : '';
}

function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      ensureStateDir();

      server.middlewares.use('/post', (req, res, next) => {
        if (req.method !== 'POST') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || 'default');
        const filePath = path.join(STATE_DIR, `${sid}.json`);

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { action, state: newState } = data;

            if (action === 'reset') {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);
              if (fs.existsSync(initialPath)) fs.unlinkSync(initialPath);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', action: 'reset' }));
              return;
            }

            if (action === 'set' || action === 'set_current') {
              fs.writeFileSync(filePath, JSON.stringify(newState, null, 2));
              if (action === 'set') {
                const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);
                fs.writeFileSync(initialPath, JSON.stringify(newState, null, 2));
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', action }));
              return;
            }

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unknown action' }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      server.middlewares.use('/go', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || '');
        if (!sid) return next(); // no sid → fall through to React /go route

        const filePath = path.join(STATE_DIR, `${sid}.json`);
        const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/json');

        let currentState = {};
        let initialState = {};

        if (fs.existsSync(filePath)) {
          try { currentState = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { /* ignore */ }
        }
        if (fs.existsSync(initialPath)) {
          try { initialState = JSON.parse(fs.readFileSync(initialPath, 'utf-8')); } catch { /* ignore */ }
        } else {
          initialState = currentState;
        }

        // Compute diff
        function computeDiff(initial, current, prefix = '') {
          const diff = {};
          const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
          for (const key of allKeys) {
            const path = prefix ? `${prefix}.${key}` : key;
            const oldVal = initial?.[key];
            const newVal = current?.[key];
            if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
                typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
              Object.assign(diff, computeDiff(oldVal, newVal, path));
            } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
              diff[path] = { old: oldVal, new: newVal };
            }
          }
          return diff;
        }

        const stateDiff = computeDiff(initialState, currentState);
        res.writeHead(200);
        res.end(JSON.stringify({ initial_state: initialState, current_state: currentState, state_diff: stateDiff }));
      });

      server.middlewares.use('/state', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || 'default');
        const filePath = path.join(STATE_DIR, `${sid}.json`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/json');

        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8');
          res.writeHead(200);
          res.end(data);
        } else {
          res.writeHead(200);
          res.end('{}');
        }
      });
    },
    configurePreviewServer(server) {
      ensureStateDir();

      server.middlewares.use('/post', (req, res, next) => {
        if (req.method !== 'POST') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || 'default');
        const filePath = path.join(STATE_DIR, `${sid}.json`);

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { action, state: newState } = data;

            if (action === 'reset') {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);
              if (fs.existsSync(initialPath)) fs.unlinkSync(initialPath);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', action: 'reset' }));
              return;
            }

            if (action === 'set' || action === 'set_current') {
              fs.writeFileSync(filePath, JSON.stringify(newState, null, 2));
              if (action === 'set') {
                const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);
                fs.writeFileSync(initialPath, JSON.stringify(newState, null, 2));
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', action }));
              return;
            }

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unknown action' }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      server.middlewares.use('/go', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || '');
        if (!sid) return next(); // no sid → fall through to React /go route

        const filePath = path.join(STATE_DIR, `${sid}.json`);
        const initialPath = path.join(STATE_DIR, `${sid}_initial.json`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/json');

        let currentState = {};
        let initialState = {};

        if (fs.existsSync(filePath)) {
          try { currentState = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { /* ignore */ }
        }
        if (fs.existsSync(initialPath)) {
          try { initialState = JSON.parse(fs.readFileSync(initialPath, 'utf-8')); } catch { /* ignore */ }
        } else {
          initialState = currentState;
        }

        // Compute diff
        function computeDiff(initial, current, prefix = '') {
          const diff = {};
          const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
          for (const key of allKeys) {
            const path = prefix ? `${prefix}.${key}` : key;
            const oldVal = initial?.[key];
            const newVal = current?.[key];
            if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
                typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
              Object.assign(diff, computeDiff(oldVal, newVal, path));
            } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
              diff[path] = { old: oldVal, new: newVal };
            }
          }
          return diff;
        }

        const stateDiff = computeDiff(initialState, currentState);
        res.writeHead(200);
        res.end(JSON.stringify({ initial_state: initialState, current_state: currentState, state_diff: stateDiff }));
      });

      server.middlewares.use('/state', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const sid = sanitizeSid(url.searchParams.get('sid') || 'default');
        const filePath = path.join(STATE_DIR, `${sid}.json`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/json');

        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8');
          res.writeHead(200);
          res.end(data);
        } else {
          res.writeHead(200);
          res.end('{}');
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
  server: {
    watch: { usePolling: true, interval: 1000 },
    port: 5180,
    host: true
  },
  preview: { port: 0, host: '0.0.0.0', allowedHosts: true }
});
