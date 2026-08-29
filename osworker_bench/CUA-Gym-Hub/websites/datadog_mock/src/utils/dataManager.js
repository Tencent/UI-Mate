
const BASE_STORAGE_KEY = 'datadogMockState';
const BASE_INITIAL_KEY = 'datadogMockInitialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) return JSON.parse(stored);
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {}
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

export const calculateStateDiff = (initial, current) => {
  const diff = {};
  const keys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of keys) {
    if (JSON.stringify(initial?.[key]) !== JSON.stringify(current?.[key])) {
      diff[key] = current?.[key];
    }
  }
  return diff;
};

// --- Helper: generate realistic time-series data ---
function generateTimeSeries(count, base, amplitude, noise) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const val = base + Math.sin(i / 10) * amplitude + (Math.random() - 0.5) * noise;
    arr.push(Math.max(0, parseFloat(val.toFixed(2))));
  }
  return arr;
}

function generateNetworkSeries(count, base, spike) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const val = base + Math.sin(i / 8) * (base * 0.3) + (Math.random() - 0.5) * spike;
    arr.push(Math.max(0, Math.round(val)));
  }
  return arr;
}

function isoAgo(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60000).toISOString();
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

export const createInitialData = () => {
  // ---- Current User ----
  const currentUser = {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme-corp.io',
    avatar: 'SC',
    org: 'Acme Corp',
    role: 'Admin',
  };

  // ---- Hosts (24) ----
  const hosts = [
    { id: 'host-1', hostname: 'web-prod-us-east-1a', aliases: ['i-0abc123def456', 'ip-10-0-1-42'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.2xlarge', agentVersion: '7.52.1', cpu: 42.7, memory: 68.3, ioWait: 1.2, load15: 1.85, apps: ['nginx', 'docker', 'system', 'python'], tags: ['env:production', 'service:web-store', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2024-11-15T08:00:00Z' },
    { id: 'host-2', hostname: 'web-prod-us-east-1b', aliases: ['i-0def456abc789', 'ip-10-0-1-43'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.2xlarge', agentVersion: '7.52.1', cpu: 38.2, memory: 62.1, ioWait: 0.8, load15: 1.42, apps: ['nginx', 'docker', 'system', 'python'], tags: ['env:production', 'service:web-store', 'team:platform', 'availability-zone:us-east-1b'], createdAt: '2024-11-15T08:00:00Z' },
    { id: 'host-3', hostname: 'web-prod-us-east-1c', aliases: ['i-0ghi789jkl012', 'ip-10-0-1-44'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.2xlarge', agentVersion: '7.52.1', cpu: 55.8, memory: 71.4, ioWait: 1.5, load15: 2.10, apps: ['nginx', 'docker', 'system', 'python'], tags: ['env:production', 'service:web-store', 'team:platform', 'availability-zone:us-east-1c'], createdAt: '2024-11-15T08:00:00Z' },
    { id: 'host-4', hostname: 'api-prod-us-east-1a', aliases: ['i-0mno345pqr678', 'ip-10-0-2-10'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'm5.xlarge', agentVersion: '7.52.1', cpu: 72.4, memory: 78.9, ioWait: 2.1, load15: 3.25, apps: ['docker', 'system', 'go'], tags: ['env:production', 'service:product-api', 'team:backend', 'availability-zone:us-east-1a'], createdAt: '2024-12-01T10:00:00Z' },
    { id: 'host-5', hostname: 'api-prod-us-east-1b', aliases: ['i-0stu901vwx234', 'ip-10-0-2-11'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'm5.xlarge', agentVersion: '7.52.1', cpu: 91.3, memory: 85.2, ioWait: 4.8, load15: 5.67, apps: ['docker', 'system', 'go'], tags: ['env:production', 'service:product-api', 'team:backend', 'availability-zone:us-east-1b'], createdAt: '2024-12-01T10:00:00Z' },
    { id: 'host-6', hostname: 'db-prod-us-east-1a', aliases: ['i-0yza567bcd890', 'ip-10-0-3-20'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'r5.2xlarge', agentVersion: '7.52.1', cpu: 32.1, memory: 88.4, ioWait: 5.6, load15: 1.90, apps: ['postgresql', 'system'], tags: ['env:production', 'service:postgres-main', 'team:database', 'availability-zone:us-east-1a'], createdAt: '2024-10-01T08:00:00Z' },
    { id: 'host-7', hostname: 'db-replica-us-east-1b', aliases: ['i-0efg123hij456', 'ip-10-0-3-21'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'r5.xlarge', agentVersion: '7.52.1', cpu: 18.7, memory: 72.3, ioWait: 3.1, load15: 0.85, apps: ['postgresql', 'system'], tags: ['env:production', 'service:postgres-main', 'team:database', 'availability-zone:us-east-1b'], createdAt: '2024-10-15T08:00:00Z' },
    { id: 'host-8', hostname: 'cache-prod-us-east-1a', aliases: ['i-0klm789nop012', 'ip-10-0-4-30'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'r6g.large', agentVersion: '7.52.1', cpu: 12.4, memory: 45.8, ioWait: 0.3, load15: 0.42, apps: ['redis', 'system'], tags: ['env:production', 'service:redis-cache', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2024-11-01T08:00:00Z' },
    { id: 'host-9', hostname: 'cache-prod-us-east-1b', aliases: ['i-0qrs345tuv678', 'ip-10-0-4-31'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'r6g.large', agentVersion: '7.52.1', cpu: 15.1, memory: 48.2, ioWait: 0.4, load15: 0.55, apps: ['redis', 'system'], tags: ['env:production', 'service:redis-cache', 'team:platform', 'availability-zone:us-east-1b'], createdAt: '2024-11-01T08:00:00Z' },
    { id: 'host-10', hostname: 'worker-prod-us-east-1a', aliases: ['i-0wxy901zab234', 'ip-10-0-5-40'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.xlarge', agentVersion: '7.52.1', cpu: 78.6, memory: 65.4, ioWait: 2.3, load15: 4.12, apps: ['docker', 'system', 'python', 'celery'], tags: ['env:production', 'service:analytics-worker', 'team:data', 'availability-zone:us-east-1a'], createdAt: '2025-01-10T08:00:00Z' },
    { id: 'host-11', hostname: 'staging-web-1', aliases: ['staging-instance-1'], status: 'active', os: 'Debian 12', cloudProvider: 'GCP', region: 'us-central1', instanceType: 'e2-medium', agentVersion: '7.51.0', cpu: 8.3, memory: 34.2, ioWait: 0.2, load15: 0.21, apps: ['nginx', 'docker', 'system'], tags: ['env:staging', 'service:web-store', 'team:platform'], createdAt: '2025-02-01T08:00:00Z' },
    { id: 'host-12', hostname: 'legacy-app-1', aliases: ['legacy-server-1'], status: 'inactive', os: 'CentOS 7', cloudProvider: 'On-prem', region: 'dc-east-1', instanceType: 'bare-metal', agentVersion: '7.38.0', cpu: 0, memory: 0, ioWait: 0, load15: 0, apps: ['system'], tags: ['env:production', 'service:legacy', 'team:platform'], createdAt: '2023-05-01T08:00:00Z' },
    // Additional hosts for 24 total
    { id: 'host-13', hostname: 'web-prod-eu-west-1a', aliases: ['i-0eu1abc123'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'eu-west-1', instanceType: 'c5.xlarge', agentVersion: '7.52.1', cpu: 35.4, memory: 58.9, ioWait: 0.9, load15: 1.15, apps: ['nginx', 'docker', 'system', 'python'], tags: ['env:production', 'service:web-store', 'team:platform', 'availability-zone:eu-west-1a'], createdAt: '2025-03-01T08:00:00Z' },
    { id: 'host-14', hostname: 'web-prod-eu-west-1b', aliases: ['i-0eu2def456'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'eu-west-1', instanceType: 'c5.xlarge', agentVersion: '7.52.1', cpu: 29.8, memory: 52.1, ioWait: 0.7, load15: 0.98, apps: ['nginx', 'docker', 'system', 'python'], tags: ['env:production', 'service:web-store', 'team:platform', 'availability-zone:eu-west-1b'], createdAt: '2025-03-01T08:00:00Z' },
    { id: 'host-15', hostname: 'api-prod-eu-west-1a', aliases: ['i-0eu3ghi789'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'eu-west-1', instanceType: 'm5.large', agentVersion: '7.52.1', cpu: 48.2, memory: 62.3, ioWait: 1.4, load15: 2.05, apps: ['docker', 'system', 'go'], tags: ['env:production', 'service:product-api', 'team:backend', 'availability-zone:eu-west-1a'], createdAt: '2025-03-15T08:00:00Z' },
    { id: 'host-16', hostname: 'db-prod-eu-west-1a', aliases: ['i-0eu4jkl012'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'eu-west-1', instanceType: 'r5.xlarge', agentVersion: '7.52.1', cpu: 25.6, memory: 79.8, ioWait: 4.2, load15: 1.45, apps: ['postgresql', 'system'], tags: ['env:production', 'service:postgres-main', 'team:database', 'availability-zone:eu-west-1a'], createdAt: '2025-03-15T08:00:00Z' },
    { id: 'host-17', hostname: 'kafka-prod-us-east-1a', aliases: ['i-0kafka1abc'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'm5.2xlarge', agentVersion: '7.52.1', cpu: 62.3, memory: 74.1, ioWait: 3.5, load15: 2.85, apps: ['kafka', 'zookeeper', 'system'], tags: ['env:production', 'service:kafka-cluster', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2024-09-01T08:00:00Z' },
    { id: 'host-18', hostname: 'kafka-prod-us-east-1b', aliases: ['i-0kafka2def'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'm5.2xlarge', agentVersion: '7.52.1', cpu: 58.9, memory: 71.5, ioWait: 3.2, load15: 2.62, apps: ['kafka', 'zookeeper', 'system'], tags: ['env:production', 'service:kafka-cluster', 'team:platform', 'availability-zone:us-east-1b'], createdAt: '2024-09-01T08:00:00Z' },
    { id: 'host-19', hostname: 'elk-prod-us-east-1a', aliases: ['i-0elk1ghi'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'r5.xlarge', agentVersion: '7.52.1', cpu: 44.1, memory: 82.5, ioWait: 2.8, load15: 1.95, apps: ['elasticsearch', 'kibana', 'system'], tags: ['env:production', 'service:elasticsearch', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2024-08-15T08:00:00Z' },
    { id: 'host-20', hostname: 'worker-prod-us-east-1b', aliases: ['i-0wrk2jkl'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.xlarge', agentVersion: '7.52.1', cpu: 82.1, memory: 71.2, ioWait: 2.7, load15: 4.55, apps: ['docker', 'system', 'python', 'celery'], tags: ['env:production', 'service:analytics-worker', 'team:data', 'availability-zone:us-east-1b'], createdAt: '2025-01-10T08:00:00Z' },
    { id: 'host-21', hostname: 'gateway-prod-us-east-1a', aliases: ['i-0gw1mno'], status: 'active', os: 'Alpine Linux', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'c5.large', agentVersion: '7.52.1', cpu: 22.5, memory: 38.4, ioWait: 0.5, load15: 0.78, apps: ['envoy', 'system'], tags: ['env:production', 'service:api-gateway', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2025-02-15T08:00:00Z' },
    { id: 'host-22', hostname: 'staging-api-1', aliases: ['staging-api-inst-1'], status: 'active', os: 'Debian 12', cloudProvider: 'GCP', region: 'us-central1', instanceType: 'e2-medium', agentVersion: '7.51.0', cpu: 12.8, memory: 42.5, ioWait: 0.3, load15: 0.35, apps: ['docker', 'system', 'go'], tags: ['env:staging', 'service:product-api', 'team:backend'], createdAt: '2025-02-01T08:00:00Z' },
    { id: 'host-23', hostname: 'ml-gpu-prod-1', aliases: ['i-0ml1pqr'], status: 'active', os: 'Ubuntu 22.04', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 'p3.2xlarge', agentVersion: '7.52.1', cpu: 67.8, memory: 55.3, ioWait: 1.8, load15: 3.42, apps: ['docker', 'system', 'python', 'tensorflow'], tags: ['env:production', 'service:ml-inference', 'team:ml', 'gpu:v100'], createdAt: '2025-04-01T08:00:00Z' },
    { id: 'host-24', hostname: 'cron-prod-us-east-1a', aliases: ['i-0cron1stu'], status: 'active', os: 'Amazon Linux 2', cloudProvider: 'AWS', region: 'us-east-1', instanceType: 't3.medium', agentVersion: '7.52.1', cpu: 5.2, memory: 28.7, ioWait: 0.1, load15: 0.12, apps: ['docker', 'system', 'cron'], tags: ['env:production', 'service:cron-jobs', 'team:platform', 'availability-zone:us-east-1a'], createdAt: '2025-01-20T08:00:00Z' },
  ];

  // Add metric histories to each host
  hosts.forEach(h => {
    if (h.status === 'inactive') {
      h.metrics = { cpuHistory: Array(60).fill(0), memoryHistory: Array(60).fill(0), networkInHistory: Array(60).fill(0), networkOutHistory: Array(60).fill(0) };
    } else {
      h.metrics = {
        cpuHistory: generateTimeSeries(60, h.cpu, h.cpu * 0.15, h.cpu * 0.1),
        memoryHistory: generateTimeSeries(60, h.memory, h.memory * 0.05, h.memory * 0.03),
        networkInHistory: generateNetworkSeries(60, 5000000, 2000000),
        networkOutHistory: generateNetworkSeries(60, 3000000, 1500000),
      };
    }
  });

  // ---- Containers (15) ----
  const containers = [
    { id: 'ctn-1', name: 'web-store-app', image: 'acme/web-store:2.4.1', status: 'running', host: 'web-prod-us-east-1a', cpu: 28.5, memory: 512, memoryLimit: 1024, uptime: '3d 14h', restarts: 0, ports: '8080:80', network: 'bridge', tags: ['env:production', 'service:web-store'] },
    { id: 'ctn-2', name: 'web-store-app', image: 'acme/web-store:2.4.1', status: 'running', host: 'web-prod-us-east-1b', cpu: 24.1, memory: 480, memoryLimit: 1024, uptime: '3d 14h', restarts: 0, ports: '8080:80', network: 'bridge', tags: ['env:production', 'service:web-store'] },
    { id: 'ctn-3', name: 'nginx-proxy', image: 'nginx:1.25', status: 'running', host: 'web-prod-us-east-1a', cpu: 5.2, memory: 64, memoryLimit: 256, uptime: '7d 2h', restarts: 0, ports: '443:443', network: 'host', tags: ['env:production', 'service:web-store'] },
    { id: 'ctn-4', name: 'product-api-app', image: 'acme/product-api:3.12.0', status: 'running', host: 'api-prod-us-east-1a', cpu: 45.8, memory: 384, memoryLimit: 768, uptime: '1d 8h', restarts: 0, ports: '8081:8080', network: 'bridge', tags: ['env:production', 'service:product-api'] },
    { id: 'ctn-5', name: 'product-api-app', image: 'acme/product-api:3.12.0', status: 'running', host: 'api-prod-us-east-1b', cpu: 68.2, memory: 620, memoryLimit: 768, uptime: '1d 8h', restarts: 2, ports: '8081:8080', network: 'bridge', tags: ['env:production', 'service:product-api'] },
    { id: 'ctn-6', name: 'payment-svc', image: 'acme/payment-service:1.8.5', status: 'running', host: 'api-prod-us-east-1a', cpu: 18.4, memory: 512, memoryLimit: 1024, uptime: '0d 6h', restarts: 1, ports: '8082:8080', network: 'bridge', tags: ['env:production', 'service:payment-service'] },
    { id: 'ctn-7', name: 'user-service-app', image: 'acme/user-service:2.1.0', status: 'running', host: 'api-prod-us-east-1a', cpu: 12.3, memory: 256, memoryLimit: 512, uptime: '5d 3h', restarts: 0, ports: '8083:3000', network: 'bridge', tags: ['env:production', 'service:user-service'] },
    { id: 'ctn-8', name: 'celery-worker-1', image: 'acme/analytics-worker:1.5.3', status: 'running', host: 'worker-prod-us-east-1a', cpu: 65.2, memory: 896, memoryLimit: 2048, uptime: '2d 18h', restarts: 0, ports: '', network: 'bridge', tags: ['env:production', 'service:analytics-worker'] },
    { id: 'ctn-9', name: 'celery-worker-2', image: 'acme/analytics-worker:1.5.3', status: 'running', host: 'worker-prod-us-east-1b', cpu: 72.8, memory: 945, memoryLimit: 2048, uptime: '2d 18h', restarts: 1, ports: '', network: 'bridge', tags: ['env:production', 'service:analytics-worker'] },
    { id: 'ctn-10', name: 'xatadog-agent', image: 'xatadog/agent:7.52.1', status: 'running', host: 'web-prod-us-east-1a', cpu: 3.1, memory: 128, memoryLimit: 256, uptime: '7d 2h', restarts: 0, ports: '8125:8125/udp', network: 'host', tags: ['env:production'] },
    { id: 'ctn-11', name: 'envoy-gateway', image: 'envoyproxy/envoy:v1.28', status: 'running', host: 'gateway-prod-us-east-1a', cpu: 15.8, memory: 192, memoryLimit: 512, uptime: '10d 5h', restarts: 0, ports: '443:10000', network: 'host', tags: ['env:production', 'service:api-gateway'] },
    { id: 'ctn-12', name: 'ml-inference', image: 'acme/ml-inference:0.9.2', status: 'running', host: 'ml-gpu-prod-1', cpu: 58.4, memory: 4096, memoryLimit: 8192, uptime: '1d 2h', restarts: 0, ports: '8090:8080', network: 'bridge', tags: ['env:production', 'service:ml-inference'] },
    { id: 'ctn-13', name: 'staging-web', image: 'acme/web-store:2.4.2-rc1', status: 'running', host: 'staging-web-1', cpu: 4.5, memory: 256, memoryLimit: 512, uptime: '0d 12h', restarts: 0, ports: '8080:80', network: 'bridge', tags: ['env:staging', 'service:web-store'] },
    { id: 'ctn-14', name: 'cron-scheduler', image: 'acme/cron-jobs:1.2.0', status: 'running', host: 'cron-prod-us-east-1a', cpu: 2.1, memory: 96, memoryLimit: 256, uptime: '4d 8h', restarts: 0, ports: '', network: 'bridge', tags: ['env:production', 'service:cron-jobs'] },
    { id: 'ctn-15', name: 'web-store-canary', image: 'acme/web-store:2.5.0-canary', status: 'exited', host: 'web-prod-us-east-1c', cpu: 0, memory: 0, memoryLimit: 1024, uptime: '0d 0h', restarts: 5, ports: '8080:80', network: 'bridge', tags: ['env:production', 'service:web-store', 'canary:true'] },
  ];

  // ---- Services (12) ----
  const services = [
    { id: 'svc-1', name: 'web-store', type: 'web', language: 'python', framework: 'django', env: 'production', team: 'checkout-team', status: 'ok', requestsPerSec: 245.8, avgLatencyMs: 42.3, p50LatencyMs: 28.1, p95LatencyMs: 89.7, p99LatencyMs: 245.0, errorRate: 0.34, apdex: 0.95, dependencies: ['svc-2', 'svc-4', 'svc-5'],
      resources: [
        { name: 'GET /api/products', type: 'http', requestsPerSec: 85.2, avgLatencyMs: 35.7, p95LatencyMs: 78.4, errorRate: 0.12 },
        { name: 'GET /api/cart', type: 'http', requestsPerSec: 42.1, avgLatencyMs: 28.4, p95LatencyMs: 55.2, errorRate: 0.05 },
        { name: 'POST /api/checkout', type: 'http', requestsPerSec: 12.8, avgLatencyMs: 156.3, p95LatencyMs: 345.0, errorRate: 1.2 },
        { name: 'GET /api/search', type: 'http', requestsPerSec: 65.4, avgLatencyMs: 52.1, p95LatencyMs: 120.8, errorRate: 0.08 },
        { name: 'GET /static/*', type: 'http', requestsPerSec: 40.3, avgLatencyMs: 5.2, p95LatencyMs: 12.0, errorRate: 0.0 },
      ],
      latencyHistory: generateTimeSeries(60, 42, 12, 8),
      requestHistory: generateTimeSeries(60, 245, 40, 20),
      errorHistory: generateTimeSeries(60, 0.8, 0.5, 0.3),
    },
    { id: 'svc-2', name: 'product-api', type: 'web', language: 'go', framework: 'gin', env: 'production', team: 'backend-team', status: 'ok', requestsPerSec: 412.5, avgLatencyMs: 18.7, p50LatencyMs: 12.3, p95LatencyMs: 45.2, p99LatencyMs: 120.0, errorRate: 0.15, apdex: 0.98, dependencies: ['svc-3', 'svc-4'],
      resources: [
        { name: 'GET /products', type: 'http', requestsPerSec: 180.5, avgLatencyMs: 15.2, p95LatencyMs: 35.0, errorRate: 0.08 },
        { name: 'GET /products/:id', type: 'http', requestsPerSec: 120.3, avgLatencyMs: 12.8, p95LatencyMs: 28.5, errorRate: 0.05 },
        { name: 'POST /products', type: 'http', requestsPerSec: 8.2, avgLatencyMs: 45.6, p95LatencyMs: 95.0, errorRate: 0.32 },
        { name: 'SELECT products', type: 'sql', requestsPerSec: 300.8, avgLatencyMs: 3.4, p95LatencyMs: 12.0, errorRate: 0.01 },
      ],
      latencyHistory: generateTimeSeries(60, 18, 6, 4),
      requestHistory: generateTimeSeries(60, 412, 60, 30),
      errorHistory: generateTimeSeries(60, 0.6, 0.3, 0.2),
    },
    { id: 'svc-3', name: 'postgres-main', type: 'db', language: 'sql', framework: 'PostgreSQL 15', env: 'production', team: 'database-team', status: 'ok', requestsPerSec: 1250.0, avgLatencyMs: 4.2, p50LatencyMs: 2.1, p95LatencyMs: 15.8, p99LatencyMs: 45.0, errorRate: 0.02, apdex: 0.99, dependencies: [],
      resources: [
        { name: 'SELECT FROM products', type: 'sql', requestsPerSec: 450.0, avgLatencyMs: 2.8, p95LatencyMs: 8.5, errorRate: 0.01 },
        { name: 'SELECT FROM users', type: 'sql', requestsPerSec: 320.0, avgLatencyMs: 3.1, p95LatencyMs: 10.2, errorRate: 0.01 },
        { name: 'INSERT INTO orders', type: 'sql', requestsPerSec: 85.0, avgLatencyMs: 8.5, p95LatencyMs: 25.0, errorRate: 0.05 },
        { name: 'UPDATE inventory', type: 'sql', requestsPerSec: 95.0, avgLatencyMs: 6.2, p95LatencyMs: 18.0, errorRate: 0.03 },
      ],
      latencyHistory: generateTimeSeries(60, 4, 2, 1),
      requestHistory: generateTimeSeries(60, 1250, 200, 100),
      errorHistory: generateTimeSeries(60, 0.08, 0.05, 0.03),
    },
    { id: 'svc-4', name: 'redis-cache', type: 'cache', language: 'n/a', framework: 'Redis 7', env: 'production', team: 'platform-team', status: 'ok', requestsPerSec: 3200.0, avgLatencyMs: 0.8, p50LatencyMs: 0.5, p95LatencyMs: 2.1, p99LatencyMs: 5.0, errorRate: 0.01, apdex: 1.0, dependencies: [],
      resources: [
        { name: 'GET cache:products:*', type: 'custom', requestsPerSec: 1200.0, avgLatencyMs: 0.5, p95LatencyMs: 1.2, errorRate: 0.0 },
        { name: 'GET cache:sessions:*', type: 'custom', requestsPerSec: 800.0, avgLatencyMs: 0.4, p95LatencyMs: 1.0, errorRate: 0.0 },
        { name: 'SET cache:*', type: 'custom', requestsPerSec: 600.0, avgLatencyMs: 1.2, p95LatencyMs: 3.5, errorRate: 0.02 },
      ],
      latencyHistory: generateTimeSeries(60, 0.8, 0.3, 0.2),
      requestHistory: generateTimeSeries(60, 3200, 500, 200),
      errorHistory: generateTimeSeries(60, 0.04, 0.02, 0.01),
    },
    { id: 'svc-5', name: 'payment-service', type: 'web', language: 'java', framework: 'spring-boot', env: 'production', team: 'payments-team', status: 'warning', requestsPerSec: 28.4, avgLatencyMs: 234.5, p50LatencyMs: 180.0, p95LatencyMs: 520.0, p99LatencyMs: 1200.0, errorRate: 5.8, apdex: 0.82, dependencies: ['svc-6'],
      resources: [
        { name: 'POST /payments/charge', type: 'http', requestsPerSec: 12.8, avgLatencyMs: 345.2, p95LatencyMs: 780.0, errorRate: 8.5 },
        { name: 'POST /payments/refund', type: 'http', requestsPerSec: 2.1, avgLatencyMs: 280.0, p95LatencyMs: 650.0, errorRate: 3.2 },
        { name: 'GET /payments/:id', type: 'http', requestsPerSec: 13.5, avgLatencyMs: 85.0, p95LatencyMs: 180.0, errorRate: 0.5 },
      ],
      latencyHistory: generateTimeSeries(60, 234, 80, 50),
      requestHistory: generateTimeSeries(60, 28, 8, 5),
      errorHistory: generateTimeSeries(60, 5.8, 3, 2),
    },
    { id: 'svc-6', name: 'stripe-api', type: 'custom', language: 'n/a', framework: 'External API', env: 'production', team: 'payments-team', status: 'ok', requestsPerSec: 14.9, avgLatencyMs: 185.0, p50LatencyMs: 150.0, p95LatencyMs: 420.0, p99LatencyMs: 900.0, errorRate: 1.2, apdex: 0.88, dependencies: [],
      resources: [
        { name: 'POST /v1/charges', type: 'http', requestsPerSec: 12.8, avgLatencyMs: 195.0, p95LatencyMs: 450.0, errorRate: 1.5 },
        { name: 'POST /v1/refunds', type: 'http', requestsPerSec: 2.1, avgLatencyMs: 165.0, p95LatencyMs: 380.0, errorRate: 0.8 },
      ],
      latencyHistory: generateTimeSeries(60, 185, 60, 40),
      requestHistory: generateTimeSeries(60, 14.9, 4, 3),
      errorHistory: generateTimeSeries(60, 1.2, 0.8, 0.5),
    },
    { id: 'svc-7', name: 'user-service', type: 'web', language: 'node', framework: 'express', env: 'production', team: 'identity-team', status: 'ok', requestsPerSec: 156.2, avgLatencyMs: 25.8, p50LatencyMs: 18.5, p95LatencyMs: 55.0, p99LatencyMs: 120.0, errorRate: 0.22, apdex: 0.96, dependencies: ['svc-8'],
      resources: [
        { name: 'GET /users/:id', type: 'http', requestsPerSec: 85.0, avgLatencyMs: 18.2, p95LatencyMs: 42.0, errorRate: 0.1 },
        { name: 'POST /users/auth', type: 'http', requestsPerSec: 45.0, avgLatencyMs: 35.4, p95LatencyMs: 78.0, errorRate: 0.45 },
        { name: 'PUT /users/:id', type: 'http', requestsPerSec: 15.0, avgLatencyMs: 28.5, p95LatencyMs: 62.0, errorRate: 0.12 },
        { name: 'SELECT FROM users', type: 'sql', requestsPerSec: 130.0, avgLatencyMs: 4.2, p95LatencyMs: 12.0, errorRate: 0.02 },
      ],
      latencyHistory: generateTimeSeries(60, 25, 8, 5),
      requestHistory: generateTimeSeries(60, 156, 30, 15),
      errorHistory: generateTimeSeries(60, 0.5, 0.2, 0.15),
    },
    { id: 'svc-8', name: 'postgres-users', type: 'db', language: 'sql', framework: 'PostgreSQL 15', env: 'production', team: 'database-team', status: 'ok', requestsPerSec: 450.0, avgLatencyMs: 3.8, p50LatencyMs: 2.0, p95LatencyMs: 12.5, p99LatencyMs: 35.0, errorRate: 0.01, apdex: 0.99, dependencies: [],
      resources: [
        { name: 'SELECT FROM users', type: 'sql', requestsPerSec: 280.0, avgLatencyMs: 2.5, p95LatencyMs: 8.0, errorRate: 0.01 },
        { name: 'INSERT INTO sessions', type: 'sql', requestsPerSec: 120.0, avgLatencyMs: 5.2, p95LatencyMs: 15.0, errorRate: 0.02 },
        { name: 'UPDATE users', type: 'sql', requestsPerSec: 50.0, avgLatencyMs: 6.8, p95LatencyMs: 18.0, errorRate: 0.01 },
      ],
      latencyHistory: generateTimeSeries(60, 3.8, 1.5, 1),
      requestHistory: generateTimeSeries(60, 450, 80, 40),
      errorHistory: generateTimeSeries(60, 0.04, 0.02, 0.01),
    },
    // Additional services
    { id: 'svc-9', name: 'api-gateway', type: 'web', language: 'go', framework: 'envoy', env: 'production', team: 'platform-team', status: 'ok', requestsPerSec: 890.0, avgLatencyMs: 3.2, p50LatencyMs: 2.1, p95LatencyMs: 8.5, p99LatencyMs: 22.0, errorRate: 0.08, apdex: 0.99, dependencies: ['svc-1', 'svc-2', 'svc-7'],
      resources: [
        { name: 'ROUTE /api/*', type: 'http', requestsPerSec: 890.0, avgLatencyMs: 3.2, p95LatencyMs: 8.5, errorRate: 0.08 },
      ],
      latencyHistory: generateTimeSeries(60, 3.2, 1.5, 1),
      requestHistory: generateTimeSeries(60, 890, 120, 60),
      errorHistory: generateTimeSeries(60, 0.7, 0.3, 0.2),
    },
    { id: 'svc-10', name: 'kafka-cluster', type: 'custom', language: 'java', framework: 'Kafka 3.6', env: 'production', team: 'platform-team', status: 'ok', requestsPerSec: 5200.0, avgLatencyMs: 1.5, p50LatencyMs: 0.8, p95LatencyMs: 4.2, p99LatencyMs: 12.0, errorRate: 0.005, apdex: 0.99, dependencies: [],
      resources: [
        { name: 'PRODUCE events.*', type: 'custom', requestsPerSec: 2600.0, avgLatencyMs: 1.2, p95LatencyMs: 3.5, errorRate: 0.002 },
        { name: 'CONSUME events.*', type: 'custom', requestsPerSec: 2600.0, avgLatencyMs: 1.8, p95LatencyMs: 5.0, errorRate: 0.008 },
      ],
      latencyHistory: generateTimeSeries(60, 1.5, 0.5, 0.3),
      requestHistory: generateTimeSeries(60, 5200, 800, 400),
      errorHistory: generateTimeSeries(60, 0.026, 0.015, 0.01),
    },
    { id: 'svc-11', name: 'analytics-worker', type: 'worker', language: 'python', framework: 'celery', env: 'production', team: 'data-team', status: 'ok', requestsPerSec: 42.0, avgLatencyMs: 1245.0, p50LatencyMs: 850.0, p95LatencyMs: 3200.0, p99LatencyMs: 8500.0, errorRate: 0.35, apdex: 0.91, dependencies: ['svc-3', 'svc-10'],
      resources: [
        { name: 'TASK process_events', type: 'custom', requestsPerSec: 28.0, avgLatencyMs: 1100.0, p95LatencyMs: 2800.0, errorRate: 0.25 },
        { name: 'TASK generate_reports', type: 'custom', requestsPerSec: 8.0, avgLatencyMs: 2500.0, p95LatencyMs: 5500.0, errorRate: 0.5 },
        { name: 'TASK send_notifications', type: 'custom', requestsPerSec: 6.0, avgLatencyMs: 450.0, p95LatencyMs: 1200.0, errorRate: 0.3 },
      ],
      latencyHistory: generateTimeSeries(60, 1245, 400, 250),
      requestHistory: generateTimeSeries(60, 42, 12, 8),
      errorHistory: generateTimeSeries(60, 0.15, 0.08, 0.05),
    },
    { id: 'svc-12', name: 'ml-inference', type: 'web', language: 'python', framework: 'fastapi', env: 'production', team: 'ml-team', status: 'ok', requestsPerSec: 85.0, avgLatencyMs: 125.0, p50LatencyMs: 95.0, p95LatencyMs: 280.0, p99LatencyMs: 450.0, errorRate: 0.18, apdex: 0.93, dependencies: ['svc-4'],
      resources: [
        { name: 'POST /predict', type: 'http', requestsPerSec: 60.0, avgLatencyMs: 145.0, p95LatencyMs: 320.0, errorRate: 0.15 },
        { name: 'POST /embed', type: 'http', requestsPerSec: 25.0, avgLatencyMs: 85.0, p95LatencyMs: 180.0, errorRate: 0.22 },
      ],
      latencyHistory: generateTimeSeries(60, 125, 40, 25),
      requestHistory: generateTimeSeries(60, 85, 20, 12),
      errorHistory: generateTimeSeries(60, 0.15, 0.08, 0.05),
    },
  ];

  // ---- Logs (120) ----
  const logMessages = {
    info: [
      { service: 'web-store', source: 'python', msg: 'GET /api/products 200 42ms', attrs: { 'http.status_code': 200, duration: 42 } },
      { service: 'web-store', source: 'python', msg: 'GET /api/cart 200 28ms', attrs: { 'http.status_code': 200, duration: 28 } },
      { service: 'web-store', source: 'python', msg: 'POST /api/checkout 201 156ms', attrs: { 'http.status_code': 201, duration: 156 } },
      { service: 'product-api', source: 'go', msg: 'GET /products 200 15ms', attrs: { 'http.status_code': 200, duration: 15 } },
      { service: 'product-api', source: 'go', msg: 'GET /products/p-1234 200 12ms', attrs: { 'http.status_code': 200, duration: 12 } },
      { service: 'user-service', source: 'node', msg: 'POST /users/auth 200 35ms - user u-456 authenticated', attrs: { 'http.status_code': 200, duration: 35, 'usr.id': 'u-456' } },
      { service: 'user-service', source: 'node', msg: 'GET /users/u-789 200 18ms', attrs: { 'http.status_code': 200, duration: 18 } },
      { service: 'postgres-main', source: 'postgresql', msg: 'SELECT * FROM products WHERE category = $1 LIMIT 50 [2.8ms]', attrs: { duration: 2.8 } },
      { service: 'postgres-main', source: 'postgresql', msg: 'INSERT INTO orders (user_id, total) VALUES ($1, $2) [8.5ms]', attrs: { duration: 8.5 } },
      { service: 'redis-cache', source: 'redis', msg: 'GET cache:products:list hit [0.4ms]', attrs: { duration: 0.4, cache: 'hit' } },
      { service: 'redis-cache', source: 'redis', msg: 'SET cache:sessions:u-456 OK [1.1ms]', attrs: { duration: 1.1 } },
      { service: 'payment-service', source: 'java', msg: 'POST /payments/charge 200 345ms - charge ch_abc123 succeeded', attrs: { 'http.status_code': 200, duration: 345 } },
      { service: 'web-store', source: 'python', msg: 'GET /api/search?q=laptop 200 52ms - 24 results', attrs: { 'http.status_code': 200, duration: 52, results: 24 } },
      { service: 'analytics-worker', source: 'python', msg: 'Processing batch of 500 events [1245ms]', attrs: { duration: 1245, batch_size: 500 } },
      { service: 'api-gateway', source: 'envoy', msg: 'upstream_rq_completed 200 /api/products host:web-store-app [3ms]', attrs: { 'http.status_code': 200, duration: 3 } },
      { service: 'kafka-cluster', source: 'kafka', msg: 'topic=events partition=3 offset=28456721 produced 1 message [0.8ms]', attrs: { duration: 0.8, topic: 'events', partition: 3 } },
      { service: 'ml-inference', source: 'python', msg: 'POST /predict 200 125ms model=product-recommend-v3 features=48', attrs: { 'http.status_code': 200, duration: 125, model: 'product-recommend-v3' } },
    ],
    warn: [
      { service: 'postgres-main', source: 'postgresql', msg: 'Slow query detected: SELECT * FROM orders JOIN products ON... [2847ms]', attrs: { duration: 2847 } },
      { service: 'payment-service', source: 'java', msg: 'Stripe API retry attempt 2/3 for charge ch_def456', attrs: { retry: 2 } },
      { service: 'web-store', source: 'python', msg: 'Deprecation warning: /api/v1/products endpoint will be removed in v3.0', attrs: {} },
      { service: 'redis-cache', source: 'redis', msg: 'Memory usage above 75% threshold (78.2%)', attrs: { memory_pct: 78.2 } },
      { service: 'user-service', source: 'node', msg: 'Rate limit approaching for IP 203.0.113.42 (85/100 req/min)', attrs: { rate: 85, limit: 100 } },
      { service: 'analytics-worker', source: 'python', msg: 'Queue depth exceeding threshold: 15000 pending events', attrs: { queue_depth: 15000 } },
      { service: 'kafka-cluster', source: 'kafka', msg: 'Consumer lag increasing on group analytics-consumers partition 5: 12500 messages behind', attrs: { consumer_lag: 12500 } },
      { service: 'ml-inference', source: 'python', msg: 'Model inference latency above p95 target: 320ms > 280ms threshold', attrs: { latency: 320 } },
    ],
    error: [
      { service: 'payment-service', source: 'java', msg: 'POST /payments/charge 500 - StripeException: Card declined (insufficient_funds)', attrs: { 'http.status_code': 500, error_type: 'StripeException' } },
      { service: 'web-store', source: 'python', msg: 'GET /api/products 500 Internal Server Error - ConnectionError: Redis timeout after 5000ms', attrs: { 'http.status_code': 500, error_type: 'ConnectionError' } },
      { service: 'product-api', source: 'go', msg: 'POST /products 500 - pq: duplicate key value violates unique constraint "products_sku_key"', attrs: { 'http.status_code': 500, error_type: 'pq.Error' } },
      { service: 'user-service', source: 'node', msg: 'POST /users/auth 401 - Invalid credentials for user bob@example.com', attrs: { 'http.status_code': 401 } },
      { service: 'analytics-worker', source: 'python', msg: 'TASK process_events FAILED - OperationalError: connection to PostgreSQL lost', attrs: { error_type: 'OperationalError' } },
      { service: 'api-gateway', source: 'envoy', msg: 'upstream_rq_5xx 503 /api/checkout host:payment-service upstream_timeout', attrs: { 'http.status_code': 503 } },
    ],
    critical: [
      { service: 'payment-service', source: 'java', msg: 'CRITICAL: Circuit breaker OPEN for stripe-api - 15 consecutive failures in 60s', attrs: { error_type: 'CircuitBreakerOpen', failures: 15 } },
      { service: 'postgres-main', source: 'postgresql', msg: 'FATAL: too many connections for role "app_user" - max 200 reached', attrs: { error_type: 'TooManyConnections', max: 200 } },
    ],
    debug: [
      { service: 'web-store', source: 'python', msg: 'Cache miss for key products:list, fetching from API', attrs: {} },
      { service: 'product-api', source: 'go', msg: 'SQL query plan: Seq Scan on products (cost=0.00..35.50 rows=2550)', attrs: {} },
    ],
  };

  const hostnames = hosts.filter(h => h.status === 'active').map(h => h.hostname);
  const logs = [];
  for (let i = 0; i < 120; i++) {
    const r = Math.random();
    let status, pool;
    if (r < 0.60) { status = 'info'; pool = logMessages.info; }
    else if (r < 0.78) { status = 'warn'; pool = logMessages.warn; }
    else if (r < 0.92) { status = 'error'; pool = logMessages.error; }
    else if (r < 0.96) { status = 'critical'; pool = logMessages.critical; }
    else { status = 'debug'; pool = logMessages.debug; }

    const template = pool[Math.floor(Math.random() * pool.length)];
    const minutesAgo = Math.floor(Math.random() * 60);
    const msOffset = Math.floor(Math.random() * 60000);
    logs.push({
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - minutesAgo * 60000 - msOffset).toISOString(),
      service: template.service,
      source: template.source,
      host: hostnames[Math.floor(Math.random() * hostnames.length)],
      status,
      message: template.msg,
      tags: ['env:production', `service:${template.service}`, `version:2.4.${Math.floor(Math.random() * 5)}`],
      attributes: { ...template.attrs },
    });
  }
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // ---- Monitors (15) ----
  const monitors = [
    { id: 'mon-1', name: 'High CPU on web-prod hosts', type: 'metric', status: 'OK', query: 'avg(last_5m):avg:system.cpu.user{service:web-store} by {host} > 90', message: 'CPU usage is above 90% on {{host.name}}. @slack-ops-alerts', tags: ['env:production', 'team:platform'], priority: 2, creator: 'sarah.chen@acme-corp.io', created: '2026-01-15T10:30:00Z', modified: '2026-03-20T14:15:00Z', muted: false, overallState: 'OK', groups: [
      { name: 'host:web-prod-us-east-1a', status: 'OK', lastTriggeredAt: '2026-04-08T10:00:00Z' },
      { name: 'host:web-prod-us-east-1b', status: 'OK', lastTriggeredAt: '2026-04-07T15:00:00Z' },
      { name: 'host:web-prod-us-east-1c', status: 'OK', lastTriggeredAt: '2026-04-09T08:00:00Z' },
    ] },
    { id: 'mon-2', name: 'High CPU on api-prod-us-east-1b', type: 'metric', status: 'Alert', query: 'avg(last_5m):avg:system.cpu.user{host:api-prod-us-east-1b} > 90', message: 'CPU usage is critically high on api-prod-us-east-1b (>90%). @pagerduty-backend', tags: ['env:production', 'team:backend'], priority: 1, creator: 'sarah.chen@acme-corp.io', created: '2026-02-01T09:00:00Z', modified: '2026-04-10T12:00:00Z', muted: false, overallState: 'Alert', groups: [
      { name: 'host:api-prod-us-east-1b', status: 'Alert', lastTriggeredAt: isoAgo(30) },
    ] },
    { id: 'mon-3', name: 'Elevated Error Rate on payment-service', type: 'apm', status: 'Alert', query: 'avg(last_5m):avg:trace.web.request.errors{service:payment-service} / avg:trace.web.request.hits{service:payment-service} * 100 > 5', message: 'Error rate on payment-service exceeds 5%. Current: {{value}}%. @slack-payments-alerts', tags: ['env:production', 'team:payments'], priority: 1, creator: 'sarah.chen@acme-corp.io', created: '2026-01-20T11:00:00Z', modified: '2026-04-10T11:30:00Z', muted: false, overallState: 'Alert', groups: [
      { name: 'service:payment-service', status: 'Alert', lastTriggeredAt: isoAgo(45) },
    ] },
    { id: 'mon-4', name: 'Host legacy-app-1 not reporting', type: 'host', status: 'Alert', query: 'avg(last_5m):avg:system.cpu.user{host:legacy-app-1}', message: 'Host legacy-app-1 has stopped reporting data. @slack-ops-alerts', tags: ['env:production', 'team:platform'], priority: 2, creator: 'sarah.chen@acme-corp.io', created: '2025-06-01T10:00:00Z', modified: '2026-04-10T10:00:00Z', muted: false, overallState: 'Alert', groups: [
      { name: 'host:legacy-app-1', status: 'Alert', lastTriggeredAt: hoursAgo(6) },
    ] },
    { id: 'mon-5', name: 'P95 Latency elevated on web-store', type: 'apm', status: 'Warn', query: 'avg(last_15m):avg:trace.web.request.duration.p95{service:web-store} > 200', message: 'P95 latency on web-store is above 200ms. @slack-checkout-team', tags: ['env:production', 'team:checkout'], priority: 3, creator: 'sarah.chen@acme-corp.io', created: '2026-02-15T14:00:00Z', modified: '2026-04-09T16:00:00Z', muted: false, overallState: 'Warn', groups: [
      { name: 'service:web-store', status: 'Warn', lastTriggeredAt: hoursAgo(2) },
    ] },
    { id: 'mon-6', name: 'Disk usage above 80% on db-prod', type: 'metric', status: 'Warn', query: 'avg(last_5m):avg:system.disk.in_use{host:db-prod-us-east-1a} > 80', message: 'Disk usage on db-prod-us-east-1a is above 80%. Consider cleanup or expansion. @slack-database-team', tags: ['env:production', 'team:database'], priority: 3, creator: 'sarah.chen@acme-corp.io', created: '2026-03-01T09:00:00Z', modified: '2026-04-09T20:00:00Z', muted: false, overallState: 'Warn', groups: [
      { name: 'host:db-prod-us-east-1a', status: 'Warn', lastTriggeredAt: hoursAgo(4) },
    ] },
    { id: 'mon-7', name: 'Memory usage on cache hosts', type: 'metric', status: 'OK', query: 'avg(last_5m):avg:system.mem.used{service:redis-cache} by {host} > 85', message: 'Memory usage on Redis cache host {{host.name}} exceeds 85%.', tags: ['env:production', 'team:platform'], priority: 3, creator: 'sarah.chen@acme-corp.io', created: '2026-01-10T08:00:00Z', modified: '2026-03-15T10:00:00Z', muted: false, overallState: 'OK', groups: [
      { name: 'host:cache-prod-us-east-1a', status: 'OK', lastTriggeredAt: '2026-03-12T10:00:00Z' },
      { name: 'host:cache-prod-us-east-1b', status: 'OK', lastTriggeredAt: '2026-03-10T14:00:00Z' },
    ] },
    { id: 'mon-8', name: 'Network throughput on web servers', type: 'metric', status: 'OK', query: 'avg(last_5m):avg:system.net.bytes_rcvd{service:web-store} > 50000000', message: 'Unusually high network traffic on web servers.', tags: ['env:production', 'team:platform'], priority: 4, creator: 'sarah.chen@acme-corp.io', created: '2026-02-20T12:00:00Z', modified: '2026-03-25T09:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-9', name: 'Database connection pool utilization', type: 'metric', status: 'OK', query: 'avg(last_5m):avg:postgresql.connections{service:postgres-main} / avg:postgresql.max_connections{service:postgres-main} * 100 > 80', message: 'Connection pool on postgres-main is above 80% utilized.', tags: ['env:production', 'team:database'], priority: 2, creator: 'sarah.chen@acme-corp.io', created: '2026-01-25T10:00:00Z', modified: '2026-04-01T11:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-10', name: 'Worker queue depth', type: 'metric', status: 'OK', query: 'avg(last_5m):avg:celery.queue.length{service:analytics-worker} > 50000', message: 'Analytics worker queue depth exceeds 50k. Investigate processing delays.', tags: ['env:production', 'team:data'], priority: 3, creator: 'sarah.chen@acme-corp.io', created: '2026-03-10T08:00:00Z', modified: '2026-04-05T14:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-11', name: 'APM Error Rate on product-api', type: 'apm', status: 'OK', query: 'avg(last_5m):avg:trace.web.request.errors{service:product-api} / avg:trace.web.request.hits{service:product-api} * 100 > 3', message: 'Error rate on product-api exceeds 3%.', tags: ['env:production', 'team:backend'], priority: 2, creator: 'sarah.chen@acme-corp.io', created: '2026-02-10T10:00:00Z', modified: '2026-03-28T16:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-12', name: 'Log error spike detection', type: 'log', status: 'OK', query: 'logs("status:error").rollup("count").last("5m") > 50', message: 'More than 50 error logs in the past 5 minutes. Check services.', tags: ['env:production'], priority: 2, creator: 'sarah.chen@acme-corp.io', created: '2026-03-05T11:00:00Z', modified: '2026-04-02T09:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-13', name: 'Staging environment health', type: 'host', status: 'OK', query: 'avg(last_5m):avg:system.cpu.user{env:staging}', message: 'Staging server health check.', tags: ['env:staging', 'team:platform'], priority: 5, creator: 'sarah.chen@acme-corp.io', created: '2026-02-05T08:00:00Z', modified: '2026-03-20T10:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-14', name: 'Composite: API + DB health', type: 'composite', status: 'OK', query: 'mon-11 && mon-9', message: 'Both API and database monitors are in alert state.', tags: ['env:production', 'team:backend'], priority: 1, creator: 'sarah.chen@acme-corp.io', created: '2026-03-15T10:00:00Z', modified: '2026-04-01T12:00:00Z', muted: false, overallState: 'OK', groups: [] },
    { id: 'mon-15', name: 'Legacy host monitoring', type: 'host', status: 'No Data', query: 'avg(last_5m):avg:system.cpu.user{host:legacy-app-1}', message: 'No data received from legacy-app-1.', tags: ['env:production', 'team:platform'], priority: 4, creator: 'sarah.chen@acme-corp.io', created: '2023-06-01T10:00:00Z', modified: '2026-04-10T08:00:00Z', muted: false, overallState: 'No Data', groups: [
      { name: 'host:legacy-app-1', status: 'No Data', lastTriggeredAt: hoursAgo(24) },
    ] },
  ];

  // ---- Dashboards (5) ----
  const dashboards = [
    {
      id: 'dash-1', title: 'System Overview', description: 'High-level infrastructure health and performance metrics', author: 'sarah.chen@acme-corp.io', created: '2026-01-10T09:00:00Z', modified: '2026-04-08T11:00:00Z', isStarred: true, isReadOnly: false, tags: ['team:platform', 'type:overview'],
      templateVariables: [{ name: 'env', tag: 'env', default: 'production', availableValues: ['production', 'staging', 'dev'] }],
      widgets: [
        { id: 'w-1-1', type: 'query_value', title: 'Active Hosts', x: 0, y: 0, width: 3, height: 1, definition: { query: 'count:system.cpu.user{*}', precision: 0, unit: '', conditionalFormats: [{ comparator: '<', value: 5, color: '#e74c3c' }, { comparator: '<=', value: 30, color: '#2ecc71' }], value: 23 } },
        { id: 'w-1-2', type: 'query_value', title: 'Avg CPU %', x: 3, y: 0, width: 3, height: 1, definition: { query: 'avg:system.cpu.user{*}', precision: 1, unit: '%', conditionalFormats: [{ comparator: '>', value: 80, color: '#e74c3c' }, { comparator: '>', value: 50, color: '#f39c12' }, { comparator: '<=', value: 50, color: '#2ecc71' }], value: 42.1 } },
        { id: 'w-1-3', type: 'query_value', title: 'Avg Memory %', x: 6, y: 0, width: 3, height: 1, definition: { query: 'avg:system.mem.used{*}', precision: 1, unit: '%', conditionalFormats: [{ comparator: '>', value: 85, color: '#e74c3c' }, { comparator: '>', value: 70, color: '#f39c12' }, { comparator: '<=', value: 70, color: '#2ecc71' }], value: 62.9 } },
        { id: 'w-1-4', type: 'query_value', title: 'Open Alerts', x: 9, y: 0, width: 3, height: 1, definition: { query: 'count:monitors{status:alert}', precision: 0, unit: '', conditionalFormats: [{ comparator: '>', value: 2, color: '#e74c3c' }, { comparator: '>', value: 0, color: '#f39c12' }, { comparator: '<=', value: 0, color: '#2ecc71' }], value: 3 } },
        { id: 'w-1-5', type: 'timeseries', title: 'CPU Usage by Host', x: 0, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:system.cpu.user{*} by {host}', displayType: 'line', color: '#7B68EE' }], yaxis: { min: 0, max: 100 } } },
        { id: 'w-1-6', type: 'timeseries', title: 'Memory Usage by Host', x: 6, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:system.mem.used{*} by {host}', displayType: 'line', color: '#00BCD4' }], yaxis: { min: 0, max: 100 } } },
        { id: 'w-1-7', type: 'toplist', title: 'Top Hosts by CPU', x: 0, y: 3, width: 6, height: 2, definition: { query: 'top(avg:system.cpu.user{*} by {host}, 10, "mean", "desc")' } },
        { id: 'w-1-8', type: 'timeseries', title: 'Network I/O', x: 6, y: 3, width: 6, height: 2, definition: { requests: [{ query: 'avg:system.net.bytes_rcvd{*}', displayType: 'area', color: '#7B68EE' }, { query: 'avg:system.net.bytes_sent{*}', displayType: 'area', color: '#FF9800' }], yaxis: { min: 0 } } },
        { id: 'w-1-9', type: 'table', title: 'Host Status Summary', x: 0, y: 5, width: 12, height: 2, definition: { query: 'system.cpu.user{*} by {host}', columns: ['Host', 'CPU %', 'Memory %', 'Load 15', 'Status'] } },
      ],
    },
    {
      id: 'dash-2', title: 'MySQL - Overview', description: 'Monitor MySQL performance metrics and health', author: 'sarah.chen@acme-corp.io', created: '2026-02-10T09:00:00Z', modified: '2026-04-05T11:00:00Z', isStarred: true, isReadOnly: false, tags: ['team:database', 'service:mysql'],
      templateVariables: [{ name: 'host', tag: 'host', default: 'db-prod-us-east-1a', availableValues: ['db-prod-us-east-1a', 'db-replica-us-east-1b'] }],
      widgets: [
        { id: 'w-2-1', type: 'query_value', title: 'Connections', x: 0, y: 0, width: 3, height: 1, definition: { query: 'avg:mysql.net.connections{*}', precision: 0, unit: '', value: 142 } },
        { id: 'w-2-2', type: 'query_value', title: 'Queries/sec', x: 3, y: 0, width: 3, height: 1, definition: { query: 'avg:mysql.queries.rate{*}', precision: 1, unit: '/s', value: 1250.0 } },
        { id: 'w-2-3', type: 'query_value', title: 'Slow Queries', x: 6, y: 0, width: 3, height: 1, definition: { query: 'sum:mysql.slow_queries{*}', precision: 0, unit: '', conditionalFormats: [{ comparator: '>', value: 10, color: '#e74c3c' }, { comparator: '>', value: 3, color: '#f39c12' }, { comparator: '<=', value: 3, color: '#2ecc71' }], value: 7 } },
        { id: 'w-2-4', type: 'query_value', title: 'Replication Lag', x: 9, y: 0, width: 3, height: 1, definition: { query: 'avg:mysql.replication.seconds_behind_master{*}', precision: 1, unit: 's', conditionalFormats: [{ comparator: '>', value: 5, color: '#e74c3c' }, { comparator: '>', value: 1, color: '#f39c12' }, { comparator: '<=', value: 1, color: '#2ecc71' }], value: 0.3 } },
        { id: 'w-2-5', type: 'timeseries', title: 'Read vs Write Operations', x: 0, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:mysql.reads{*}', displayType: 'area', color: '#7B68EE' }, { query: 'avg:mysql.writes{*}', displayType: 'area', color: '#FF9800' }], yaxis: { min: 0 } } },
        { id: 'w-2-6', type: 'timeseries', title: 'Connection Count', x: 6, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:mysql.net.connections{*}', displayType: 'line', color: '#00BCD4' }], yaxis: { min: 0 } } },
        { id: 'w-2-7', type: 'timeseries', title: 'Query Latency', x: 0, y: 3, width: 6, height: 2, definition: { requests: [{ query: 'avg:mysql.query.latency.avg{*}', displayType: 'line', color: '#E91E63' }], yaxis: { min: 0 } } },
        { id: 'w-2-8', type: 'timeseries', title: 'CPU on DB Hosts', x: 6, y: 3, width: 6, height: 2, definition: { requests: [{ query: 'avg:system.cpu.user{service:postgres-main} by {host}', displayType: 'line', color: '#7B68EE' }], yaxis: { min: 0, max: 100 } } },
        { id: 'w-2-9', type: 'toplist', title: 'Top Queries by Duration', x: 0, y: 5, width: 12, height: 2, definition: { query: 'top(avg:mysql.query.latency{*} by {query}, 10, "mean", "desc")' } },
      ],
    },
    {
      id: 'dash-3', title: 'Web Store Performance', description: 'Frontend and API performance for the web store application', author: 'sarah.chen@acme-corp.io', created: '2026-02-20T10:00:00Z', modified: '2026-04-07T15:00:00Z', isStarred: false, isReadOnly: false, tags: ['team:checkout', 'service:web-store'],
      templateVariables: [{ name: 'env', tag: 'env', default: 'production', availableValues: ['production', 'staging'] }],
      widgets: [
        { id: 'w-3-1', type: 'query_value', title: 'Requests/sec', x: 0, y: 0, width: 3, height: 1, definition: { query: 'avg:trace.web.request.hits{service:web-store}', precision: 1, unit: '/s', value: 245.8 } },
        { id: 'w-3-2', type: 'query_value', title: 'Error Rate', x: 3, y: 0, width: 3, height: 1, definition: { query: 'avg:trace.web.request.error_rate{service:web-store}', precision: 2, unit: '%', conditionalFormats: [{ comparator: '>', value: 5, color: '#e74c3c' }, { comparator: '>', value: 1, color: '#f39c12' }, { comparator: '<=', value: 1, color: '#2ecc71' }], value: 0.34 } },
        { id: 'w-3-3', type: 'query_value', title: 'P95 Latency', x: 6, y: 0, width: 3, height: 1, definition: { query: 'avg:trace.web.request.duration.p95{service:web-store}', precision: 1, unit: 'ms', conditionalFormats: [{ comparator: '>', value: 200, color: '#e74c3c' }, { comparator: '>', value: 100, color: '#f39c12' }, { comparator: '<=', value: 100, color: '#2ecc71' }], value: 89.7 } },
        { id: 'w-3-4', type: 'query_value', title: 'Apdex', x: 9, y: 0, width: 3, height: 1, definition: { query: 'avg:trace.web.request.apdex{service:web-store}', precision: 2, unit: '', value: 0.95 } },
        { id: 'w-3-5', type: 'timeseries', title: 'Request Rate', x: 0, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:trace.web.request.hits{service:web-store}', displayType: 'area', color: '#7B68EE' }], yaxis: { min: 0 } } },
        { id: 'w-3-6', type: 'timeseries', title: 'Latency Distribution (P50/P95/P99)', x: 6, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:trace.web.request.duration.p50{service:web-store}', displayType: 'line', color: '#2ECC71' }, { query: 'avg:trace.web.request.duration.p95{service:web-store}', displayType: 'line', color: '#FF9800' }, { query: 'avg:trace.web.request.duration.p99{service:web-store}', displayType: 'line', color: '#E91E63' }], yaxis: { min: 0 } } },
        { id: 'w-3-7', type: 'toplist', title: 'Top Endpoints by Latency', x: 0, y: 3, width: 6, height: 2, definition: { query: 'top(avg:trace.web.request.duration{service:web-store} by {resource}, 10, "mean", "desc")' } },
        { id: 'w-3-8', type: 'timeseries', title: 'Error Rate Over Time', x: 6, y: 3, width: 6, height: 2, definition: { requests: [{ query: 'avg:trace.web.request.error_rate{service:web-store}', displayType: 'area', color: '#E74C3C' }], yaxis: { min: 0, max: 10 } } },
      ],
    },
    {
      id: 'dash-4', title: 'Infrastructure Costs', description: 'Cloud infrastructure spending and resource utilization', author: 'sarah.chen@acme-corp.io', created: '2026-03-01T09:00:00Z', modified: '2026-04-06T10:00:00Z', isStarred: false, isReadOnly: true, tags: ['team:finance', 'type:cost'],
      templateVariables: [],
      widgets: [
        { id: 'w-4-1', type: 'query_value', title: 'Monthly Spend', x: 0, y: 0, width: 4, height: 1, definition: { query: 'sum:aws.cost{*}', precision: 0, unit: '$', value: 24850 } },
        { id: 'w-4-2', type: 'query_value', title: 'Cost Delta vs Last Month', x: 4, y: 0, width: 4, height: 1, definition: { query: 'delta:aws.cost{*}', precision: 1, unit: '%', conditionalFormats: [{ comparator: '>', value: 10, color: '#e74c3c' }, { comparator: '>', value: 5, color: '#f39c12' }, { comparator: '<=', value: 5, color: '#2ecc71' }], value: 3.2 } },
        { id: 'w-4-3', type: 'query_value', title: 'Instance Count', x: 8, y: 0, width: 4, height: 1, definition: { query: 'count:aws.ec2.instances{*}', precision: 0, unit: '', value: 24 } },
        { id: 'w-4-4', type: 'timeseries', title: 'Daily Cost Trend', x: 0, y: 1, width: 12, height: 2, definition: { requests: [{ query: 'sum:aws.cost{*}', displayType: 'area', color: '#7B68EE' }], yaxis: { min: 0 } } },
        { id: 'w-4-5', type: 'toplist', title: 'Cost by Service', x: 0, y: 3, width: 6, height: 2, definition: { query: 'top(sum:aws.cost{*} by {service}, 10, "sum", "desc")' } },
        { id: 'w-4-6', type: 'table', title: 'Instance Type Breakdown', x: 6, y: 3, width: 6, height: 2, definition: { query: 'sum:aws.cost{*} by {instance_type}', columns: ['Instance Type', 'Count', 'Monthly Cost'] } },
      ],
    },
    {
      id: 'dash-5', title: 'API Health', description: 'Comprehensive API performance and reliability metrics', author: 'sarah.chen@acme-corp.io', created: '2026-03-10T10:00:00Z', modified: '2026-04-09T14:00:00Z', isStarred: true, isReadOnly: false, tags: ['team:backend', 'type:api'],
      templateVariables: [{ name: 'service', tag: 'service', default: 'product-api', availableValues: ['product-api', 'user-service', 'payment-service'] }],
      widgets: [
        { id: 'w-5-1', type: 'query_value', title: 'Availability %', x: 0, y: 0, width: 3, height: 1, definition: { query: 'avg:trace.web.request.availability{service:product-api}', precision: 2, unit: '%', conditionalFormats: [{ comparator: '<', value: 99, color: '#e74c3c' }, { comparator: '<', value: 99.9, color: '#f39c12' }, { comparator: '>=', value: 99.9, color: '#2ecc71' }], value: 99.85 } },
        { id: 'w-5-2', type: 'query_value', title: 'Error Budget Left', x: 3, y: 0, width: 3, height: 1, definition: { query: 'custom:error_budget_remaining{service:product-api}', precision: 1, unit: '%', conditionalFormats: [{ comparator: '<', value: 20, color: '#e74c3c' }, { comparator: '<', value: 50, color: '#f39c12' }, { comparator: '>=', value: 50, color: '#2ecc71' }], value: 72.5 } },
        { id: 'w-5-3', type: 'query_value', title: 'Total Requests/s', x: 6, y: 0, width: 3, height: 1, definition: { query: 'sum:trace.web.request.hits{*}', precision: 1, unit: '/s', value: 858.9 } },
        { id: 'w-5-4', type: 'query_value', title: 'Active Services', x: 9, y: 0, width: 3, height: 1, definition: { query: 'count:apm.services{status:ok}', precision: 0, unit: '', value: 11 } },
        { id: 'w-5-5', type: 'timeseries', title: 'Request Rate by Service', x: 0, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:trace.web.request.hits{*} by {service}', displayType: 'line', color: '#7B68EE' }], yaxis: { min: 0 } } },
        { id: 'w-5-6', type: 'timeseries', title: 'Latency by Service', x: 6, y: 1, width: 6, height: 2, definition: { requests: [{ query: 'avg:trace.web.request.duration.avg{*} by {service}', displayType: 'line', color: '#00BCD4' }], yaxis: { min: 0 } } },
        { id: 'w-5-7', type: 'toplist', title: 'Top Errors by Endpoint', x: 0, y: 3, width: 12, height: 2, definition: { query: 'top(sum:trace.web.request.errors{*} by {resource}, 10, "sum", "desc")' } },
      ],
    },
  ];

  // ---- Events (20) ----
  const events = [
    { id: 'evt-1', title: 'Deploy web-store v2.4.1 to production', text: 'Deployed by sarah.chen via CI/CD pipeline', type: 'deployment', source: 'github', timestamp: hoursAgo(1), tags: ['env:production', 'service:web-store'], priority: 'normal' },
    { id: 'evt-2', title: 'Deploy product-api v3.12.0 to production', text: 'Deployed by ci-bot via GitHub Actions', type: 'deployment', source: 'github', timestamp: hoursAgo(3), tags: ['env:production', 'service:product-api'], priority: 'normal' },
    { id: 'evt-3', title: 'Deploy payment-service v1.8.5 to production', text: 'Hotfix deployment for payment timeout issue', type: 'deployment', source: 'github', timestamp: hoursAgo(6), tags: ['env:production', 'service:payment-service'], priority: 'normal' },
    { id: 'evt-4', title: 'Deploy user-service v2.1.0 to staging', text: 'Deployed by mike.wilson via CI/CD pipeline', type: 'deployment', source: 'github', timestamp: hoursAgo(8), tags: ['env:staging', 'service:user-service'], priority: 'low' },
    { id: 'evt-5', title: 'Deploy analytics-worker v1.5.3 to production', text: 'Scheduled deployment - batch processing improvements', type: 'deployment', source: 'github', timestamp: hoursAgo(14), tags: ['env:production', 'service:analytics-worker'], priority: 'normal' },
    { id: 'evt-6', title: 'Alert triggered: High CPU on api-prod-us-east-1b', text: 'CPU usage exceeded 90% threshold. Current value: 91.3%', type: 'alert', source: 'xatadog', timestamp: isoAgo(30), tags: ['env:production', 'host:api-prod-us-east-1b'], priority: 'normal' },
    { id: 'evt-7', title: 'Alert triggered: Elevated Error Rate on payment-service', text: 'Error rate exceeded 5% threshold. Current value: 5.8%', type: 'alert', source: 'xatadog', timestamp: isoAgo(45), tags: ['env:production', 'service:payment-service'], priority: 'normal' },
    { id: 'evt-8', title: 'Alert resolved: Network spike on web-prod-us-east-1a', text: 'Network traffic returned to normal levels', type: 'alert', source: 'xatadog', timestamp: hoursAgo(2), tags: ['env:production', 'host:web-prod-us-east-1a'], priority: 'normal' },
    { id: 'evt-9', title: 'Alert triggered: P95 Latency elevated on web-store', text: 'P95 latency exceeded 200ms. Current value: 245ms', type: 'alert', source: 'xatadog', timestamp: hoursAgo(2), tags: ['env:production', 'service:web-store'], priority: 'normal' },
    { id: 'evt-10', title: 'Alert resolved: Disk usage on db-prod normalized', text: 'Disk cleanup completed. Usage dropped from 82% to 71%', type: 'alert', source: 'xatadog', timestamp: hoursAgo(5), tags: ['env:production', 'host:db-prod-us-east-1a'], priority: 'normal' },
    { id: 'evt-11', title: 'Alert resolved: Memory pressure on cache hosts', text: 'Redis memory usage returned below 75% after eviction policy triggered', type: 'alert', source: 'xatadog', timestamp: hoursAgo(10), tags: ['env:production', 'service:redis-cache'], priority: 'normal' },
    { id: 'evt-12', title: 'Config change: Updated nginx rate limiting rules', text: 'Rate limit increased from 100 to 200 req/min per IP', type: 'info', source: 'chef', timestamp: hoursAgo(4), tags: ['env:production', 'service:web-store'], priority: 'low' },
    { id: 'evt-13', title: 'Config change: Redis maxmemory-policy set to allkeys-lru', text: 'Changed eviction policy to handle memory pressure', type: 'info', source: 'terraform', timestamp: hoursAgo(10), tags: ['env:production', 'service:redis-cache'], priority: 'low' },
    { id: 'evt-14', title: 'Config change: PostgreSQL work_mem increased to 256MB', text: 'Increased work_mem to reduce disk-based sorting for complex queries', type: 'info', source: 'ansible', timestamp: hoursAgo(12), tags: ['env:production', 'service:postgres-main'], priority: 'low' },
    { id: 'evt-15', title: 'Config change: Auto-scaling policy updated for web-prod', text: 'Min instances: 3, Max instances: 10, Target CPU: 65%', type: 'info', source: 'terraform', timestamp: hoursAgo(16), tags: ['env:production', 'service:web-store'], priority: 'low' },
    { id: 'evt-16', title: 'New monitor created: Worker queue depth', text: 'Sarah Chen created a new metric monitor for analytics worker queue', type: 'info', source: 'xatadog', timestamp: hoursAgo(18), tags: ['env:production', 'service:analytics-worker'], priority: 'low' },
    { id: 'evt-17', title: 'Scheduled maintenance: db-replica failover test', text: 'Planned failover test for database replica - no user impact expected', type: 'warning', source: 'pagerduty', timestamp: hoursAgo(7), tags: ['env:production', 'service:postgres-main'], priority: 'normal' },
    { id: 'evt-18', title: 'SSL certificate renewed for api.acme-corp.io', text: 'Certificate auto-renewed via Let\'s Encrypt. Valid until 2026-07-10', type: 'info', source: 'certbot', timestamp: hoursAgo(20), tags: ['env:production'], priority: 'low' },
    { id: 'evt-19', title: 'Integration status: Stripe API degraded performance', text: 'Stripe reporting elevated latencies. See status.stripe.com', type: 'warning', source: 'statuspage', timestamp: hoursAgo(5), tags: ['service:payment-service'], priority: 'normal' },
    { id: 'evt-20', title: 'Agent upgraded on staging-web-1', text: 'Xatadog Agent upgraded from 7.51.0 to 7.52.1', type: 'info', source: 'xatadog', timestamp: hoursAgo(22), tags: ['env:staging', 'host:staging-web-1'], priority: 'low' },
  ];

  // ---- Incidents (5) ----
  const incidents = [
    {
      id: 'inc-1', title: 'Payment service elevated error rate', severity: 'SEV-2', status: 'active', commander: 'sarah.chen@acme-corp.io',
      created: hoursAgo(2), updated: isoAgo(15), resolved: null,
      services: ['payment-service', 'stripe-api'], tags: ['env:production', 'team:payments'],
      timeline: [
        { time: hoursAgo(2), author: 'Xatadog', text: 'Monitor "Elevated Error Rate on payment-service" triggered at 5.8%' },
        { time: isoAgo(110), author: 'sarah.chen', text: 'Incident declared. Investigating correlation with Stripe API degradation.' },
        { time: isoAgo(90), author: 'mike.wilson', text: 'Confirmed: Stripe status page shows elevated latencies in US-East region.' },
        { time: isoAgo(60), author: 'sarah.chen', text: 'Deployed hotfix v1.8.5 with increased timeout and circuit breaker adjustments.' },
        { time: isoAgo(30), author: 'sarah.chen', text: 'Error rate improving but still elevated. Monitoring closely.' },
        { time: isoAgo(15), author: 'mike.wilson', text: 'Error rate now at 3.2%, trending toward recovery.' },
      ],
      impact: 'Approximately 8% of payment transactions failing. Customers see checkout errors.',
      customerNotification: true,
    },
    {
      id: 'inc-2', title: 'High CPU on api-prod-us-east-1b causing request queuing', severity: 'SEV-3', status: 'active', commander: 'alex.kumar@acme-corp.io',
      created: isoAgo(45), updated: isoAgo(10), resolved: null,
      services: ['product-api'], tags: ['env:production', 'team:backend'],
      timeline: [
        { time: isoAgo(45), author: 'Xatadog', text: 'Monitor "High CPU on api-prod-us-east-1b" triggered at 91.3%' },
        { time: isoAgo(35), author: 'alex.kumar', text: 'Investigating. Checking recent deployments and traffic patterns.' },
        { time: isoAgo(20), author: 'alex.kumar', text: 'Root cause: Product API memory leak introduced in v3.12.0. Preparing rollback.' },
        { time: isoAgo(10), author: 'alex.kumar', text: 'Rolling back to v3.11.2. Monitoring CPU.' },
      ],
      impact: 'Increased latency on product search and listing pages. P95 ~3x normal.',
      customerNotification: false,
    },
    {
      id: 'inc-3', title: 'Database disk space critical on db-prod-us-east-1a', severity: 'SEV-3', status: 'resolved', commander: 'lisa.park@acme-corp.io',
      created: hoursAgo(8), updated: hoursAgo(5), resolved: hoursAgo(5),
      services: ['postgres-main'], tags: ['env:production', 'team:database'],
      timeline: [
        { time: hoursAgo(8), author: 'Xatadog', text: 'Monitor "Disk usage above 80% on db-prod" triggered at 82%' },
        { time: hoursAgo(7), author: 'lisa.park', text: 'Investigating disk usage. Found old temp tables from migration.' },
        { time: hoursAgo(6), author: 'lisa.park', text: 'Running VACUUM FULL on affected tables. Dropping temp migration tables.' },
        { time: hoursAgo(5), author: 'lisa.park', text: 'Disk usage back to 71%. Resolved. Added rotation policy for temp tables.' },
      ],
      impact: 'No customer impact. Proactive fix before disk full condition.',
      customerNotification: false,
      postmortem: 'Migration temp tables were not cleaned up by automation script due to a naming convention mismatch. Fix: Updated cleanup script regex pattern.',
    },
    {
      id: 'inc-4', title: 'Web store checkout flow intermittent 503 errors', severity: 'SEV-1', status: 'resolved', commander: 'sarah.chen@acme-corp.io',
      created: daysAgo(3), updated: daysAgo(3), resolved: daysAgo(3),
      services: ['web-store', 'payment-service', 'redis-cache'], tags: ['env:production', 'team:platform'],
      timeline: [
        { time: daysAgo(3), author: 'PagerDuty', text: 'Multiple monitors triggered simultaneously. Checkout 503 rate at 15%.' },
        { time: new Date(Date.now() - 3 * 86400000 + 600000).toISOString(), author: 'sarah.chen', text: 'SEV-1 declared. All hands on deck. Redis cache cluster experiencing memory pressure.' },
        { time: new Date(Date.now() - 3 * 86400000 + 1200000).toISOString(), author: 'alex.kumar', text: 'Redis OOM killer triggered on cache-prod-us-east-1a. Failover to 1b successful.' },
        { time: new Date(Date.now() - 3 * 86400000 + 1800000).toISOString(), author: 'sarah.chen', text: 'Applied emergency eviction policy. Cache hit ratio recovering.' },
        { time: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString(), author: 'sarah.chen', text: 'All systems nominal. Error rate back to baseline. Incident resolved.' },
      ],
      impact: '15% of checkout transactions failed for ~30 minutes. Estimated revenue impact: $12,500.',
      customerNotification: true,
      postmortem: 'Root cause: A new product catalog sync job was writing unbounded data to Redis without TTL. Fix: Added TTL to all cache keys, increased Redis maxmemory, implemented circuit breaker for cache writes.',
    },
    {
      id: 'inc-5', title: 'Kafka consumer lag causing delayed analytics processing', severity: 'SEV-4', status: 'resolved', commander: 'mike.wilson@acme-corp.io',
      created: daysAgo(7), updated: daysAgo(6), resolved: daysAgo(6),
      services: ['kafka-cluster', 'analytics-worker'], tags: ['env:production', 'team:data'],
      timeline: [
        { time: daysAgo(7), author: 'Xatadog', text: 'Consumer lag alert: analytics-consumers group lag at 50,000+ messages.' },
        { time: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(), author: 'mike.wilson', text: 'Investigating. Worker pods appear healthy but processing is slow.' },
        { time: new Date(Date.now() - 7 * 86400000 + 7200000).toISOString(), author: 'mike.wilson', text: 'Found issue: Recent schema change in events topic causing deserialization retries.' },
        { time: daysAgo(6), author: 'mike.wilson', text: 'Deployed worker v1.5.3 with schema compatibility fix. Lag clearing.' },
      ],
      impact: 'Analytics dashboards showing stale data (6h delay). No customer-facing impact.',
      customerNotification: false,
      postmortem: 'Schema evolution for events topic lacked backward compatibility. Fix: Enforced Avro schema compatibility checks in CI pipeline.',
    },
  ];

  // ---- Notebooks (4) ----
  const notebooks = [
    { id: 'nb-1', title: 'Payment Service Investigation - Apr 10', author: 'sarah.chen@acme-corp.io', created: hoursAgo(2), modified: isoAgo(15), tags: ['incident:inc-1', 'service:payment-service'], cells: [
      { type: 'markdown', content: '# Payment Service Error Rate Investigation\n\nInvestigating elevated error rate on payment-service triggered by monitor mon-3.' },
      { type: 'timeseries', query: 'avg:trace.web.request.errors{service:payment-service}', title: 'Error Rate - payment-service' },
      { type: 'markdown', content: '## Correlation with Stripe API\n\nStripe status page confirms degraded performance in US-East. Latency spike correlates with our error rate increase.' },
      { type: 'timeseries', query: 'avg:trace.web.request.duration{service:stripe-api}', title: 'Stripe API Latency' },
      { type: 'markdown', content: '## Action Items\n- [x] Deploy hotfix v1.8.5 with increased timeout\n- [x] Adjust circuit breaker thresholds\n- [ ] Follow up with Stripe support\n- [ ] Add retry budget metrics' },
    ] },
    { id: 'nb-2', title: 'Weekly Infrastructure Review', author: 'alex.kumar@acme-corp.io', created: daysAgo(2), modified: daysAgo(1), tags: ['team:platform', 'type:review'], cells: [
      { type: 'markdown', content: '# Weekly Infrastructure Review - Week of Apr 7\n\n## Overview\n24 hosts active, 1 decommissioned (legacy-app-1).' },
      { type: 'timeseries', query: 'avg:system.cpu.user{*} by {host}', title: 'CPU Usage All Hosts' },
      { type: 'timeseries', query: 'avg:system.mem.used{*} by {host}', title: 'Memory Usage All Hosts' },
      { type: 'markdown', content: '## Key Observations\n- api-prod-us-east-1b consistently high CPU (>90%)\n- EU-West region running stable\n- GPU instance utilization at 67%, may need scaling' },
    ] },
    { id: 'nb-3', title: 'Capacity Planning Q2 2026', author: 'sarah.chen@acme-corp.io', created: daysAgo(14), modified: daysAgo(5), tags: ['team:platform', 'type:planning'], cells: [
      { type: 'markdown', content: '# Q2 2026 Capacity Planning\n\n## Current State\n- 24 hosts across 2 regions\n- Monthly spend: $24,850\n- Average utilization: CPU 42%, Memory 63%' },
      { type: 'markdown', content: '## Recommendations\n1. Scale out EU-West by 2 additional web nodes\n2. Add read replica for postgres in EU\n3. Consider spot instances for analytics workers\n4. GPU scaling: add 1 more p3.2xlarge for ML inference' },
    ] },
    { id: 'nb-4', title: 'Redis Cache Performance Analysis', author: 'lisa.park@acme-corp.io', created: daysAgo(10), modified: daysAgo(8), tags: ['service:redis-cache', 'type:analysis'], cells: [
      { type: 'markdown', content: '# Redis Cache Performance Analysis\n\n## Context\nPost-incident analysis from SEV-1 checkout outage.' },
      { type: 'timeseries', query: 'avg:redis.mem.used{service:redis-cache}', title: 'Redis Memory Usage' },
      { type: 'markdown', content: '## Findings\n- Cache key cardinality grew 5x in 48h before incident\n- No TTL set on product catalog sync keys\n- Eviction policy was `noeviction` (should be `allkeys-lru`)' },
    ] },
  ];

  // ---- SLOs (4) ----
  const slos = [
    { id: 'slo-1', name: 'Web Store Availability', description: '99.9% of requests return 2xx within 500ms', type: 'metric', targetSli: 99.9, currentSli: 99.95, timeframe: '30d', status: 'ok', errorBudgetRemaining: 85.2, tags: ['service:web-store', 'team:checkout'], monitorIds: ['mon-1'] },
    { id: 'slo-2', name: 'API Latency P95 < 200ms', description: '99.5% of API requests have P95 latency under 200ms', type: 'metric', targetSli: 99.5, currentSli: 99.2, timeframe: '30d', status: 'warning', errorBudgetRemaining: 32.1, tags: ['service:product-api', 'team:backend'], monitorIds: ['mon-11'] },
    { id: 'slo-3', name: 'Payment Success Rate', description: '99.99% of payment transactions succeed', type: 'monitor', targetSli: 99.99, currentSli: 99.995, timeframe: '30d', status: 'ok', errorBudgetRemaining: 95.0, tags: ['service:payment-service', 'team:payments'], monitorIds: ['mon-3'] },
    { id: 'slo-4', name: 'Database Uptime', description: '99.95% uptime for primary database', type: 'monitor', targetSli: 99.95, currentSli: 99.97, timeframe: '90d', status: 'ok', errorBudgetRemaining: 78.5, tags: ['service:postgres-main', 'team:database'], monitorIds: ['mon-9'] },
  ];

  // ---- Traces (sample) ----
  const traces = [
    {
      id: 'trace-1', traceId: 'abc123def456', rootService: 'api-gateway', rootResource: 'GET /api/products', startTime: isoAgo(5), duration: 48.2, status: 'ok',
      spans: [
        { id: 'span-1', service: 'api-gateway', resource: 'GET /api/products', type: 'web', duration: 48.2, start: 0, error: false },
        { id: 'span-2', service: 'web-store', resource: 'GET /api/products', type: 'web', duration: 42.1, start: 3.0, error: false, parentId: 'span-1' },
        { id: 'span-3', service: 'redis-cache', resource: 'GET cache:products:list', type: 'cache', duration: 0.5, start: 5.0, error: false, parentId: 'span-2' },
        { id: 'span-4', service: 'product-api', resource: 'GET /products', type: 'web', duration: 15.2, start: 8.0, error: false, parentId: 'span-2' },
        { id: 'span-5', service: 'postgres-main', resource: 'SELECT FROM products', type: 'sql', duration: 2.8, start: 10.0, error: false, parentId: 'span-4' },
      ],
    },
    {
      id: 'trace-2', traceId: 'def789ghi012', rootService: 'api-gateway', rootResource: 'POST /api/checkout', startTime: isoAgo(8), duration: 520.5, status: 'error',
      spans: [
        { id: 'span-6', service: 'api-gateway', resource: 'POST /api/checkout', type: 'web', duration: 520.5, start: 0, error: true },
        { id: 'span-7', service: 'web-store', resource: 'POST /api/checkout', type: 'web', duration: 512.3, start: 4.0, error: true, parentId: 'span-6' },
        { id: 'span-8', service: 'payment-service', resource: 'POST /payments/charge', type: 'web', duration: 480.2, start: 20.0, error: true, parentId: 'span-7' },
        { id: 'span-9', service: 'stripe-api', resource: 'POST /v1/charges', type: 'http', duration: 445.0, start: 25.0, error: true, parentId: 'span-8', meta: { error: 'Card declined (insufficient_funds)' } },
      ],
    },
    {
      id: 'trace-3', traceId: 'jkl345mno678', rootService: 'api-gateway', rootResource: 'POST /users/auth', startTime: isoAgo(12), duration: 38.5, status: 'ok',
      spans: [
        { id: 'span-10', service: 'api-gateway', resource: 'POST /users/auth', type: 'web', duration: 38.5, start: 0, error: false },
        { id: 'span-11', service: 'user-service', resource: 'POST /users/auth', type: 'web', duration: 35.4, start: 2.0, error: false, parentId: 'span-10' },
        { id: 'span-12', service: 'postgres-users', resource: 'SELECT FROM users', type: 'sql', duration: 2.5, start: 5.0, error: false, parentId: 'span-11' },
        { id: 'span-13', service: 'redis-cache', resource: 'SET cache:sessions:*', type: 'cache', duration: 1.1, start: 30.0, error: false, parentId: 'span-11' },
      ],
    },
  ];

  return {
    currentUser,
    hosts,
    containers,
    services,
    logs,
    monitors,
    dashboards,
    events,
    incidents,
    notebooks,
    slos,
    traces,

    // UI state
    selectedTimeRange: 'Past 1 Hour',
    selectedEnv: 'production',
    sidebarCollapsed: false,
    activeDashboardId: 'dash-1',
  };
};
