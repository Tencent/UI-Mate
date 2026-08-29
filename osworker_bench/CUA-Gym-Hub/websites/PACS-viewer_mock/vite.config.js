import { secureMockApiPlugin } from '../../shared/secureMockApiPlugin.mjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function mockApiPlugin() {
  const sessions = new Map();

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/post' && req.method === 'POST') {
          const sid = url.searchParams.get('sid');
          if (!sid) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'sid required' }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const action = data.action;

              if (action === 'set') {
                const existing = sessions.get(sid) || { initial: null, current: null };
                const merged = deepMerge(existing.initial || {}, data.state || {});
                sessions.set(sid, { initial: JSON.parse(JSON.stringify(merged)), current: JSON.parse(JSON.stringify(merged)) });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else if (action === 'set_current') {
                const existing = sessions.get(sid);
                if (!existing) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'session not found' }));
                  return;
                }
                existing.current = deepMerge(existing.current, data.state || {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else if (action === 'reset') {
                const existing = sessions.get(sid);
                if (!existing) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'session not found' }));
                  return;
                }
                existing.current = JSON.parse(JSON.stringify(existing.initial));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'unknown action' }));
              }
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        if (url.pathname === '/go' && req.method === 'GET') {
          const sid = url.searchParams.get('sid');
          if (sid) {
            const session = sessions.get(sid);
            if (!session) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'session not found' }));
              return;
            }
            const diff = computeDiff(session.initial, session.current);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ initial_state: session.initial, current_state: session.current, state_diff: diff }));
            return;
          }
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/post' && req.method === 'POST') {
          const sid = url.searchParams.get('sid');
          if (!sid) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'sid required' }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const action = data.action;

              if (action === 'set') {
                const existing = sessions.get(sid) || { initial: null, current: null };
                const merged = deepMerge(existing.initial || {}, data.state || {});
                sessions.set(sid, { initial: JSON.parse(JSON.stringify(merged)), current: JSON.parse(JSON.stringify(merged)) });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else if (action === 'set_current') {
                const existing = sessions.get(sid);
                if (!existing) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'session not found' }));
                  return;
                }
                existing.current = deepMerge(existing.current, data.state || {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else if (action === 'reset') {
                const existing = sessions.get(sid);
                if (!existing) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'session not found' }));
                  return;
                }
                existing.current = JSON.parse(JSON.stringify(existing.initial));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'unknown action' }));
              }
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        if (url.pathname === '/go' && req.method === 'GET') {
          const sid = url.searchParams.get('sid');
          if (sid) {
            const session = sessions.get(sid);
            if (!session) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'session not found' }));
              return;
            }
            const diff = computeDiff(session.initial, session.current);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ initial_state: session.initial, current_state: session.current, state_diff: diff }));
            return;
          }
        }

        next();
      });
    }
  };
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function computeDiff(initial, current) {
  const diff = {};
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const a = initial?.[key];
    const b = current?.[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[key] = { from: a, to: b };
    }
  }
  return diff;
}

export default defineConfig({
  plugins: [secureMockApiPlugin(), react(), mockApiPlugin()],
  server: {
    watch: { usePolling: true, interval: 1000 },
    port: 5180,
    host: true
  },
  build: {
    outDir: 'dist'
  }
});
