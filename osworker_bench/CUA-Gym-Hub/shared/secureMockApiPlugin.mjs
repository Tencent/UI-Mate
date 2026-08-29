import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SESSION_COOKIE = 'cua_mock_session';
const PLACEHOLDER_SID = '__cua_session__';
const TOKEN_FILE = '.cua-admin-token';

function isHardenedEnabled() {
  return process.env.CUA_GYM_HARDENED === '1' || process.env.CUA_GYM_HARDENED === 'true';
}

function sanitizeSid(sid) {
  return sid ? String(sid).replace(/[^a-zA-Z0-9_-]/g, '') : '';
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const eq = part.indexOf('=');
        if (eq === -1) return [part, ''];
        return [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))];
      }),
  );
}

function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function getAdminToken(stateDir) {
  if (process.env.CUA_GYM_ADMIN_TOKEN) return process.env.CUA_GYM_ADMIN_TOKEN;

  ensureDir(stateDir);
  const tokenPath = path.join(stateDir, TOKEN_FILE);
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf-8').trim();

  const token = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(tokenPath, `${token}\n`, { mode: 0o600 });
  console.warn(
    `[cua-gym-hub] CUA_GYM_HARDENED is enabled but CUA_GYM_ADMIN_TOKEN is not set. ` +
      `Generated a local dev token in ${tokenPath}. Set CUA_GYM_ADMIN_TOKEN for shared deployments.`,
  );
  return token;
}

function getRequestToken(req) {
  return req.headers['x-cua-admin-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function computeDiff(initial, current, prefix = '') {
  const diff = {};
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    const oldVal = initial?.[key];
    const newVal = current?.[key];
    if (
      typeof oldVal === 'object' &&
      oldVal !== null &&
      !Array.isArray(oldVal) &&
      typeof newVal === 'object' &&
      newVal !== null &&
      !Array.isArray(newVal)
    ) {
      Object.assign(diff, computeDiff(oldVal, newVal, nextPath));
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[nextPath] = { old: oldVal, new: newVal };
    }
  }
  return diff;
}

function localStorageShim() {
  return String.raw`
(() => {
  try {
    const sid = new URLSearchParams(window.location.search).get('sid');
    if (sid !== '${PLACEHOLDER_SID}') return;
  } catch {
    return;
  }

  const PLACEHOLDER_SID = '${PLACEHOLDER_SID}';
  const sidKeys = [
    'mock_sid',
    'wandb_sid',
    'docs_mock_sid',
    'sap_mock_sid',
    'aliyun_sid',
    'cloudflare_sid',
    'bamboohr_sid'
  ];

  try {
    for (const key of sidKeys) {
      if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, PLACEHOLDER_SID);
    }
  } catch {}

  const memory = new Map();
  const raw = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
    key: Storage.prototype.key,
  };

  const looksLikeLargeState = (key, value = '') => {
    const k = String(key || '').toLowerCase();
    const v = String(value || '');
    if (k.includes('sid')) return false;
    const jsonLike = /^[\[{]/.test(v.trim());
    if (!jsonLike) return false;
    if (/(^|[_:-])(state|initial|mock)([_:-]|$)/i.test(k)) return true;
    return v.length > 1000 && /(^|[_:-])(store|data|cache|snapshot|workspace|document)([_:-]|$)/i.test(k);
  };

  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = raw.key.call(localStorage, i);
      const value = key ? raw.getItem.call(localStorage, key) : null;
      if (key && looksLikeLargeState(key, value || '')) keys.push(key);
    }
    for (const key of keys) {
      const value = raw.getItem.call(localStorage, key);
      if (value !== null) memory.set(key, value);
      raw.removeItem.call(localStorage, key);
    }
  } catch {}

  Storage.prototype.getItem = function(key) {
    if (this === window.localStorage && memory.has(String(key))) return memory.get(String(key));
    return raw.getItem.call(this, key);
  };

  Storage.prototype.setItem = function(key, value) {
    if (this === window.localStorage && looksLikeLargeState(key, value)) {
      memory.set(String(key), String(value));
      try { raw.removeItem.call(this, key); } catch {}
      return;
    }
    return raw.setItem.call(this, key, value);
  };

  Storage.prototype.removeItem = function(key) {
    if (this === window.localStorage) memory.delete(String(key));
    return raw.removeItem.call(this, key);
  };

  Storage.prototype.clear = function() {
    if (this === window.localStorage) memory.clear();
    return raw.clear.call(this);
  };
})();
`;
}

export function secureMockApiPlugin(options = {}) {
  const stateDir = options.stateDir || path.join(process.cwd(), '.mock-secure-states');
  const sessions = new Map();
  const setupTokens = new Map();

  function statePath(sid) {
    return path.join(stateDir, `${sanitizeSid(sid)}.json`);
  }

  function initialPath(sid) {
    return path.join(stateDir, `${sanitizeSid(sid)}_initial.json`);
  }

  function isAdmin(req) {
    return timingSafeEqual(getRequestToken(req), getAdminToken(stateDir));
  }

  function sidFromCookie(req) {
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies[SESSION_COOKIE];
    return sessionId ? sessions.get(sessionId) || null : null;
  }

  function hasSecureSession(req) {
    return Boolean(sidFromCookie(req));
  }

  function resolveClientSid(req, url) {
    const requested = sanitizeSid(url.searchParams.get('sid') || '');
    if (!requested || requested === PLACEHOLDER_SID) return sidFromCookie(req);
    return isAdmin(req) ? requested : null;
  }

  async function handlePost(req, res, url) {
    const admin = isAdmin(req);
    const body = await readBody(req);
    let data;
    try {
      data = body ? JSON.parse(body) : {};
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    const action = data.action;
    const requestedSid = sanitizeSid(url.searchParams.get('sid') || 'default');
    const sessionSid = resolveClientSid(req, url);
    const sid = admin ? requestedSid : sessionSid;

    if (!sid) {
      sendJson(res, 403, { error: 'Missing authenticated session or admin token' });
      return;
    }

    if (!admin && action !== 'set_current') {
      sendJson(res, 403, { error: 'Only admin callers can set initial state or reset sessions' });
      return;
    }

    ensureDir(stateDir);
    if (action === 'reset') {
      for (const file of [statePath(sid), initialPath(sid)]) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      sendJson(res, 200, { status: 'ok', action: 'reset' });
      return;
    }

    if (action === 'set' || action === 'set_current') {
      writeJson(statePath(sid), data.state || {});
      if (action === 'set') writeJson(initialPath(sid), data.state || {});

      const response = { status: 'ok', action };
      if (admin && action === 'set') {
        const token = crypto.randomBytes(32).toString('hex');
        setupTokens.set(token, sid);
        response.launch_url = `/_cua_session?token=${token}`;
        response.public_sid = PLACEHOLDER_SID;
      }
      sendJson(res, 200, response);
      return;
    }

    sendJson(res, 400, { error: 'Unknown action' });
  }

  function handleSession(req, res, url) {
    const token = url.searchParams.get('token') || '';
    const sid = setupTokens.get(token);
    if (!sid) {
      sendJson(res, 403, { error: 'Invalid or expired session token' });
      return;
    }
    setupTokens.delete(token);
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, sid);
    res.writeHead(302, {
      'Set-Cookie': `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax`,
      Location: `/?sid=${PLACEHOLDER_SID}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end();
  }

  function handleState(req, res, url) {
    const sid = resolveClientSid(req, url);
    if (!sid) {
      sendJson(res, 403, { error: 'Missing authenticated session or admin token' });
      return;
    }
    sendJson(res, 200, readJson(statePath(sid), {}));
  }

  function handleGo(req, res, url) {
    if (!isAdmin(req)) {
      sendJson(res, 403, { error: 'Verifier endpoint requires admin token' });
      return;
    }
    const sid = sanitizeSid(url.searchParams.get('sid') || '');
    if (!sid) {
      sendJson(res, 400, { error: 'Missing sid' });
      return;
    }
    const currentState = readJson(statePath(sid), {});
    const initialState = fs.existsSync(initialPath(sid)) ? readJson(initialPath(sid), {}) : currentState;
    sendJson(res, 200, {
      initial_state: initialState,
      current_state: currentState,
      state_diff: computeDiff(initialState, currentState),
    });
  }

  function isDebugInspectorPath(pathname) {
    return pathname === '/go' || pathname === '/state-inspector';
  }

  function register(server) {
    ensureDir(stateDir);
    server.middlewares.use((req, res, next) => {
      if (!isHardenedEnabled()) return next();
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;
      const requestedSid = sanitizeSid(url.searchParams.get('sid') || '');
      const admin = isAdmin(req);
      const secureSession = hasSecureSession(req);
      const placeholderSession = requestedSid === PLACEHOLDER_SID;

      if (pathname === '/_cua_session') return handleSession(req, res, url);
      if (pathname === '/post' && req.method === 'POST') {
        if (admin || secureSession || placeholderSession) return void handlePost(req, res, url);
        return next();
      }
      if (pathname === '/state' && req.method === 'GET') {
        if (admin || secureSession || placeholderSession) return handleState(req, res, url);
        return next();
      }
      if (isDebugInspectorPath(pathname) && req.method === 'GET') {
        if (admin) return handleGo(req, res, url);
        return next();
      }
      return next();
    });
  }

  return {
    name: 'cua-secure-mock-api',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!isHardenedEnabled()) return html;
        return html.replace('<head>', `<head><script>${localStorageShim()}</script>`);
      },
    },
    configureServer: register,
    configurePreviewServer: register,
  };
}
