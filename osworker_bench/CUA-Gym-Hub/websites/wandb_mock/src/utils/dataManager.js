const BASE_KEY = 'wandb_state';
const BASE_INITIAL_KEY = 'wandb_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  let sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('wandb_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('wandb_sid') || null;
};

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' && Object.keys(data).length > 0 ? data : null;
  } catch {
    return null;
  }
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

function deepMerge(defaults, custom) {
  if (custom === null || custom === undefined) return defaults;
  if (typeof defaults !== 'object' || defaults === null) return custom;
  if (Array.isArray(custom)) return custom;
  if (Array.isArray(defaults)) return custom;
  const result = { ...defaults };
  for (const key of Object.keys(custom)) {
    if (custom[key] === null || custom[key] === undefined) continue;
    result[key] = deepMerge(defaults[key], custom[key]);
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sKey = storageKey(sid);
  const iKey = initialKey(sid);

  if (customState) {
    const merged = { ...createInitialData(), ...customState };
    localStorage.setItem(sKey, JSON.stringify(merged));
    localStorage.setItem(iKey, JSON.stringify(merged));
    return merged;
  }

  const stored = localStorage.getItem(sKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }

  const defaults = createInitialData();
  localStorage.setItem(sKey, JSON.stringify(defaults));
  localStorage.setItem(iKey, JSON.stringify(defaults));
  return defaults;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  const sKey = storageKey(sid);
  localStorage.setItem(sKey, JSON.stringify(state));
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

export const getInitialState = (sid = null) => {
  const iKey = initialKey(sid);
  const stored = localStorage.getItem(iKey);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore */ }
  }
  return createInitialData();
};

// ---- History generation helpers ----

function generateHistory(finalMetrics, numSteps, crashed = false) {
  const history = [];
  const steps = crashed ? Math.min(numSteps, 10) : numSteps;
  const maxStep = crashed ? steps * 40 : numSteps * 40;

  const startLoss = 2.3;
  const endLoss = finalMetrics.train_loss || 0.3;
  const startAcc = 0.1;
  const endAcc = finalMetrics.train_acc || 0.9;
  const startValLoss = 2.3;
  const endValLoss = finalMetrics.val_loss || 0.4;
  const startValAcc = 0.1;
  const endValAcc = finalMetrics.val_acc || 0.85;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const noise = () => (Math.random() - 0.5) * 0.02;
    const decay = (start, end) => start + (end - start) * (1 - Math.exp(-3 * t)) + noise();
    const grow = (start, end) => start + (end - start) * (1 - Math.exp(-3 * t)) + noise();

    history.push({
      step: Math.round(t * maxStep),
      train_loss: Math.max(0.01, +decay(startLoss, endLoss).toFixed(4)),
      train_acc: Math.min(0.999, Math.max(0, +grow(startAcc, endAcc).toFixed(4))),
      val_loss: Math.max(0.01, +decay(startValLoss, endValLoss).toFixed(4)),
      val_acc: Math.min(0.999, Math.max(0, +grow(startValAcc, endValAcc).toFixed(4))),
      epoch: Math.round(t * (finalMetrics.epoch || 50))
    });
  }
  return history;
}

function generateNLPHistory(finalMetrics, numSteps, crashed = false) {
  const history = [];
  const steps = crashed ? Math.min(numSteps, 10) : numSteps;
  const maxStep = numSteps * 20;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const noise = () => (Math.random() - 0.5) * 0.015;
    history.push({
      step: Math.round(t * maxStep),
      train_loss: Math.max(0.01, +(0.8 + (finalMetrics.train_loss - 0.8) * (1 - Math.exp(-3 * t)) + noise()).toFixed(4)),
      eval_loss: Math.max(0.01, +(0.85 + (finalMetrics.eval_loss - 0.85) * (1 - Math.exp(-3 * t)) + noise()).toFixed(4)),
      f1: Math.min(0.999, Math.max(0, +(0.5 + (finalMetrics.f1 - 0.5) * (1 - Math.exp(-3 * t)) + noise()).toFixed(4))),
      accuracy: Math.min(0.999, Math.max(0, +(0.5 + (finalMetrics.accuracy - 0.5) * (1 - Math.exp(-3 * t)) + noise()).toFixed(4))),
      epoch: Math.round(t * (finalMetrics.epoch || 10))
    });
  }
  return history;
}

function generateRLHistory(finalMetrics, numSteps) {
  const history = [];
  const maxStep = numSteps * 1000;
  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1 || 1);
    const noise = () => (Math.random() - 0.5) * 30;
    history.push({
      step: Math.round(t * maxStep),
      mean_reward: +(50 + (finalMetrics.mean_reward - 50) * (1 - Math.exp(-3 * t)) + noise()).toFixed(1),
      episode_length: Math.round(100 + (finalMetrics.episode_length - 100) * (1 - Math.exp(-2.5 * t)) + noise()),
      value_loss: Math.max(0.001, +(1.0 * Math.exp(-2 * t) + Math.random() * 0.05).toFixed(4)),
      policy_loss: +(0.5 * Math.exp(-1.5 * t) + (Math.random() - 0.5) * 0.02).toFixed(4),
      epoch: Math.round(t * (finalMetrics.epoch || 100))
    });
  }
  return history;
}

function generateSystemMetrics(numPoints, crashed = false) {
  const metrics = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i * 30;
    const gpuBase = 70 + Math.random() * 25;
    const cpuBase = 30 + Math.random() * 30;
    const memBase = 25 + Math.random() * 20;
    metrics.push({
      timestamp: t,
      gpu_util: crashed && i === numPoints - 1 ? 99.8 : +gpuBase.toFixed(1),
      gpu_memory: crashed && i === numPoints - 1 ? 39.8 : +(4 + Math.random() * 6).toFixed(1),
      cpu_util: +cpuBase.toFixed(1),
      memory_util: +memBase.toFixed(1),
      disk_io: +(50 + Math.random() * 150).toFixed(1),
      network_sent: +(0.1 + Math.random() * 2).toFixed(2),
      network_recv: +(5 + Math.random() * 20).toFixed(2)
    });
  }
  return metrics;
}

function generateLogs(runName, state, epochs, startTime) {
  const logs = [];
  const base = new Date(startTime).getTime();
  logs.push({ timestamp: new Date(base).toISOString(), level: 'INFO', message: 'wandb: Currently logged in as: alex-ml' });
  logs.push({ timestamp: new Date(base + 1000).toISOString(), level: 'INFO', message: 'wandb: Tracking run with wandb version 0.16.3' });
  logs.push({ timestamp: new Date(base + 2000).toISOString(), level: 'INFO', message: `wandb: Run ${runName} started` });
  logs.push({ timestamp: new Date(base + 3000).toISOString(), level: 'INFO', message: 'wandb: Run data is saved locally in ./wandb/run-*' });

  const epochCount = Math.min(epochs, 10);
  for (let i = 1; i <= epochCount; i++) {
    const elapsed = 3000 + (i / epochCount) * (epochs * 60000);
    logs.push({
      timestamp: new Date(base + elapsed).toISOString(),
      level: 'INFO',
      message: `Epoch ${i}/${epochs} - train_loss: ${(2.3 * Math.exp(-0.1 * i)).toFixed(3)} - train_acc: ${(0.1 + 0.8 * (1 - Math.exp(-0.3 * i))).toFixed(3)}`
    });
  }

  if (state === 'crashed') {
    logs.push({ timestamp: new Date(base + epochs * 60000).toISOString(), level: 'ERROR', message: 'RuntimeError: CUDA out of memory. Tried to allocate 2.00 GiB' });
    logs.push({ timestamp: new Date(base + epochs * 60000 + 500).toISOString(), level: 'ERROR', message: 'wandb: Run crashed. Check logs for details.' });
  } else if (state === 'finished') {
    logs.push({ timestamp: new Date(base + epochs * 60000).toISOString(), level: 'INFO', message: 'Training complete. Best model saved.' });
    logs.push({ timestamp: new Date(base + epochs * 60000 + 1000).toISOString(), level: 'INFO', message: 'wandb: Synced run to https://wandb.ai/alex-ml/project' });
  }

  return logs;
}

export function createInitialData() {
  const users = [
    { id: 'user-1', username: 'alex-ml', name: 'Alex Chen', email: 'alex@example.com', avatar: null },
    { id: 'user-2', username: 'sarah-ds', name: 'Sarah Kim', email: 'sarah@example.com', avatar: null },
    { id: 'user-3', username: 'mike-eng', name: 'Mike Johnson', email: 'mike@example.com', avatar: null },
    { id: 'user-4', username: 'lisa-res', name: 'Lisa Wang', email: 'lisa@example.com', avatar: null }
  ];

  const currentUser = {
    id: 'user-1',
    username: 'alex-ml',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: null,
    teams: ['ml-team'],
    defaultEntity: 'alex-ml'
  };

  const projects = [
    {
      id: 'proj-1', name: 'image-classifier', displayName: 'Image Classifier',
      entity: 'alex-ml', description: 'ResNet and EfficientNet experiments on CIFAR-10 and ImageNet',
      visibility: 'public', createdAt: '2025-11-15T10:30:00Z', updatedAt: '2026-03-05T14:22:00Z',
      totalRuns: 6, totalComputeHours: 47.3, tags: ['computer-vision', 'classification']
    },
    {
      id: 'proj-2', name: 'nlp-sentiment', displayName: 'NLP Sentiment',
      entity: 'alex-ml', description: 'BERT sentiment analysis fine-tuning on movie reviews dataset',
      visibility: 'public', createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-03-06T11:15:00Z',
      totalRuns: 4, totalComputeHours: 23.1, tags: ['nlp', 'sentiment-analysis']
    },
    {
      id: 'proj-3', name: 'rl-cartpole', displayName: 'RL CartPole',
      entity: 'alex-ml', description: 'Reinforcement learning CartPole experiments with PPO and DQN',
      visibility: 'private', createdAt: '2026-02-01T14:00:00Z', updatedAt: '2026-03-04T09:30:00Z',
      totalRuns: 2, totalComputeHours: 5.8, tags: ['reinforcement-learning']
    }
  ];

  // --- Image classifier runs ---
  const run1 = {
    id: 'run-1', runId: 'a1b2c3d4', name: 'golden-sunset-1', projectId: 'proj-1',
    state: 'finished', createdAt: '2026-03-01T08:15:00Z', updatedAt: '2026-03-01T10:45:00Z',
    duration: 9000, color: '#ff6384', visible: true, user: 'alex-ml',
    tags: ['baseline', 'resnet'], notes: 'Initial ResNet-50 baseline on CIFAR-10',
    config: { model: 'resnet50', dataset: 'cifar10', learning_rate: 0.001, batch_size: 64, epochs: 50, optimizer: 'adam', weight_decay: 0.0001, dropout: 0.3, augmentation: false, seed: 42 },
    summary: { train_loss: 0.234, train_acc: 0.912, val_loss: 0.389, val_acc: 0.876, best_val_acc: 0.881, epoch: 50, total_params: 25557032, learning_rate: 0.001 },
    history: generateHistory({ train_loss: 0.234, train_acc: 0.912, val_loss: 0.389, val_acc: 0.876, epoch: 50 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'a3f7e2b', gitBranch: 'main' },
    logs: generateLogs('golden-sunset-1', 'finished', 50, '2026-03-01T08:15:00Z'),
    files: [
      { name: 'model.pt', size: 102400000, updatedAt: '2026-03-01T10:45:00Z' },
      { name: 'config.yaml', size: 1024, updatedAt: '2026-03-01T08:15:00Z' },
      { name: 'requirements.txt', size: 512, updatedAt: '2026-03-01T08:15:00Z' },
      { name: 'wandb-summary.json', size: 2048, updatedAt: '2026-03-01T10:45:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: ['art-2']
  };

  const run2 = {
    id: 'run-2', runId: 'e5f6g7h8', name: 'electric-wood-2', projectId: 'proj-1',
    state: 'finished', createdAt: '2026-03-01T14:00:00Z', updatedAt: '2026-03-01T16:30:00Z',
    duration: 9000, color: '#36a2eb', visible: true, user: 'sarah-ds',
    tags: ['augmentation', 'resnet'], notes: 'ResNet-50 with data augmentation',
    config: { model: 'resnet50', dataset: 'cifar10', learning_rate: 0.001, batch_size: 64, epochs: 50, optimizer: 'adam', weight_decay: 0.0001, dropout: 0.3, augmentation: true, seed: 43 },
    summary: { train_loss: 0.198, train_acc: 0.928, val_loss: 0.342, val_acc: 0.891, best_val_acc: 0.895, epoch: 50, total_params: 25557032, learning_rate: 0.001 },
    history: generateHistory({ train_loss: 0.198, train_acc: 0.928, val_loss: 0.342, val_acc: 0.891, epoch: 50 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'b4c8d3e', gitBranch: 'augmentation' },
    logs: generateLogs('electric-wood-2', 'finished', 50, '2026-03-01T14:00:00Z'),
    files: [
      { name: 'model.pt', size: 102400000, updatedAt: '2026-03-01T16:30:00Z' },
      { name: 'config.yaml', size: 1200, updatedAt: '2026-03-01T14:00:00Z' },
      { name: 'requirements.txt', size: 512, updatedAt: '2026-03-01T14:00:00Z' },
      { name: 'wandb-summary.json', size: 2048, updatedAt: '2026-03-01T16:30:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: ['art-2']
  };

  const run3 = {
    id: 'run-3', runId: 'i9j0k1l2', name: 'snowy-oath-3', projectId: 'proj-1',
    state: 'finished', createdAt: '2026-03-02T09:00:00Z', updatedAt: '2026-03-02T11:00:00Z',
    duration: 7200, color: '#4bc0c0', visible: true, user: 'alex-ml',
    tags: ['efficientnet'], notes: 'EfficientNet-B0 baseline',
    config: { model: 'efficientnet-b0', dataset: 'cifar10', learning_rate: 0.0005, batch_size: 32, epochs: 40, optimizer: 'adamw', weight_decay: 0.0005, dropout: 0.2, augmentation: true, seed: 44 },
    summary: { train_loss: 0.178, train_acc: 0.938, val_loss: 0.312, val_acc: 0.902, best_val_acc: 0.905, epoch: 40, total_params: 5288548, learning_rate: 0.0005 },
    history: generateHistory({ train_loss: 0.178, train_acc: 0.938, val_loss: 0.312, val_acc: 0.902, epoch: 40 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'c5d9e4f', gitBranch: 'efficientnet' },
    logs: generateLogs('snowy-oath-3', 'finished', 40, '2026-03-02T09:00:00Z'),
    files: [
      { name: 'model.pt', size: 21200000, updatedAt: '2026-03-02T11:00:00Z' },
      { name: 'config.yaml', size: 1100, updatedAt: '2026-03-02T09:00:00Z' },
      { name: 'wandb-summary.json', size: 2048, updatedAt: '2026-03-02T11:00:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: ['art-3']
  };

  const run4 = {
    id: 'run-4', runId: 'm3n4o5p6', name: 'crimson-breeze-4', projectId: 'proj-1',
    state: 'finished', createdAt: '2026-03-03T08:00:00Z', updatedAt: '2026-03-03T10:30:00Z',
    duration: 9000, color: '#ff9f40', visible: true, user: 'mike-eng',
    tags: ['efficientnet', 'best'], notes: 'EfficientNet-B2 — best accuracy so far',
    config: { model: 'efficientnet-b2', dataset: 'cifar10', learning_rate: 0.0003, batch_size: 64, epochs: 50, optimizer: 'adamw', weight_decay: 0.0005, dropout: 0.2, augmentation: true, seed: 45 },
    summary: { train_loss: 0.145, train_acc: 0.952, val_loss: 0.278, val_acc: 0.918, best_val_acc: 0.921, epoch: 50, total_params: 9109994, learning_rate: 0.0003 },
    history: generateHistory({ train_loss: 0.145, train_acc: 0.952, val_loss: 0.278, val_acc: 0.918, epoch: 50 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 2, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'd6e0f5a', gitBranch: 'efficientnet-b2' },
    logs: generateLogs('crimson-breeze-4', 'finished', 50, '2026-03-03T08:00:00Z'),
    files: [
      { name: 'model.pt', size: 36400000, updatedAt: '2026-03-03T10:30:00Z' },
      { name: 'config.yaml', size: 1200, updatedAt: '2026-03-03T08:00:00Z' },
      { name: 'wandb-summary.json', size: 2048, updatedAt: '2026-03-03T10:30:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: ['art-3']
  };

  const run5 = {
    id: 'run-5', runId: 'q7r8s9t0', name: 'quiet-river-5', projectId: 'proj-1',
    state: 'crashed', createdAt: '2026-03-04T07:00:00Z', updatedAt: '2026-03-04T07:45:00Z',
    duration: 2700, color: '#9966ff', visible: true, user: 'alex-ml',
    tags: ['resnet', 'large'], notes: 'ResNet-101 — crashed due to OOM on large batch',
    config: { model: 'resnet101', dataset: 'cifar10', learning_rate: 0.001, batch_size: 256, epochs: 50, optimizer: 'adam', weight_decay: 0.0001, dropout: 0.3, augmentation: true, seed: 46 },
    summary: { train_loss: 1.12, train_acc: 0.58, val_loss: 1.35, val_acc: 0.52, epoch: 12, total_params: 44549160, learning_rate: 0.001 },
    history: generateHistory({ train_loss: 1.12, train_acc: 0.58, val_loss: 1.35, val_acc: 0.52, epoch: 12 }, 10, true),
    systemMetrics: generateSystemMetrics(10, true),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'e7f1a2b', gitBranch: 'resnet101' },
    logs: generateLogs('quiet-river-5', 'crashed', 12, '2026-03-04T07:00:00Z'),
    files: [
      { name: 'config.yaml', size: 1024, updatedAt: '2026-03-04T07:00:00Z' },
      { name: 'requirements.txt', size: 512, updatedAt: '2026-03-04T07:00:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: []
  };

  const run6 = {
    id: 'run-6', runId: 'u1v2w3x4', name: 'bright-dawn-6', projectId: 'proj-1',
    state: 'running', createdAt: '2026-03-05T06:00:00Z', updatedAt: '2026-03-05T08:00:00Z',
    duration: 7200, color: '#ffce56', visible: true, user: 'lisa-res',
    tags: ['efficientnet', 'cosine-lr'], notes: 'EfficientNet-B0 with cosine annealing LR',
    config: { model: 'efficientnet-b0', dataset: 'cifar10', learning_rate: 0.001, batch_size: 64, epochs: 60, optimizer: 'adamw', weight_decay: 0.0005, dropout: 0.2, augmentation: true, seed: 47 },
    summary: { train_loss: 0.312, train_acc: 0.889, val_loss: 0.398, val_acc: 0.862, epoch: 25, total_params: 5288548, learning_rate: 0.0004 },
    history: generateHistory({ train_loss: 0.312, train_acc: 0.889, val_loss: 0.398, val_acc: 0.862, epoch: 25 }, 15),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0', gitCommit: 'f8a2b3c', gitBranch: 'cosine-lr' },
    logs: generateLogs('bright-dawn-6', 'running', 25, '2026-03-05T06:00:00Z'),
    files: [
      { name: 'checkpoint.pt', size: 21200000, updatedAt: '2026-03-05T08:00:00Z' },
      { name: 'config.yaml', size: 1200, updatedAt: '2026-03-05T06:00:00Z' }
    ],
    inputArtifacts: ['art-1'], outputArtifacts: []
  };

  // --- NLP Sentiment runs ---
  const run7 = {
    id: 'run-7', runId: 'y5z6a7b8', name: 'misty-forest-1', projectId: 'proj-2',
    state: 'finished', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-20T14:00:00Z',
    duration: 14400, color: '#ff6384', visible: true, user: 'alex-ml',
    tags: ['bert', 'baseline'], notes: 'BERT-base sentiment classifier baseline',
    config: { model: 'bert-base-uncased', dataset: 'imdb', learning_rate: 2e-5, batch_size: 16, epochs: 5, optimizer: 'adamw', max_length: 512, warmup_steps: 500 },
    summary: { train_loss: 0.198, eval_loss: 0.312, f1: 0.892, accuracy: 0.889, epoch: 5, total_params: 109482240 },
    history: generateNLPHistory({ train_loss: 0.198, eval_loss: 0.312, f1: 0.892, accuracy: 0.889, epoch: 5 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0 + HuggingFace 4.36.0', gitCommit: 'g9h0i1j', gitBranch: 'main' },
    logs: generateLogs('misty-forest-1', 'finished', 5, '2026-02-20T10:00:00Z'),
    files: [
      { name: 'model.safetensors', size: 437900000, updatedAt: '2026-02-20T14:00:00Z' },
      { name: 'tokenizer.json', size: 512000, updatedAt: '2026-02-20T10:00:00Z' },
      { name: 'config.json', size: 2048, updatedAt: '2026-02-20T10:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  const run8 = {
    id: 'run-8', runId: 'c2d3e4f5', name: 'wandering-star-2', projectId: 'proj-2',
    state: 'finished', createdAt: '2026-02-21T09:00:00Z', updatedAt: '2026-02-21T11:00:00Z',
    duration: 7200, color: '#36a2eb', visible: true, user: 'sarah-ds',
    tags: ['distilbert', 'lightweight'], notes: 'DistilBERT — faster training, slight accuracy drop',
    config: { model: 'distilbert-base-uncased', dataset: 'imdb', learning_rate: 3e-5, batch_size: 32, epochs: 5, optimizer: 'adamw', max_length: 512, warmup_steps: 300 },
    summary: { train_loss: 0.225, eval_loss: 0.345, f1: 0.871, accuracy: 0.868, epoch: 5, total_params: 66955010 },
    history: generateNLPHistory({ train_loss: 0.225, eval_loss: 0.345, f1: 0.871, accuracy: 0.868, epoch: 5 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA V100 16GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0 + HuggingFace 4.36.0', gitCommit: 'k2l3m4n', gitBranch: 'distilbert' },
    logs: generateLogs('wandering-star-2', 'finished', 5, '2026-02-21T09:00:00Z'),
    files: [
      { name: 'model.safetensors', size: 267800000, updatedAt: '2026-02-21T11:00:00Z' },
      { name: 'config.json', size: 2048, updatedAt: '2026-02-21T09:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  const run9 = {
    id: 'run-9', runId: 'g6h7i8j9', name: 'silver-moon-3', projectId: 'proj-2',
    state: 'finished', createdAt: '2026-02-22T08:00:00Z', updatedAt: '2026-02-22T16:00:00Z',
    duration: 28800, color: '#4bc0c0', visible: true, user: 'mike-eng',
    tags: ['bert-large', 'high-compute'], notes: 'BERT-large for max accuracy',
    config: { model: 'bert-large-uncased', dataset: 'imdb', learning_rate: 1e-5, batch_size: 8, epochs: 3, optimizer: 'adamw', max_length: 512, warmup_steps: 1000 },
    summary: { train_loss: 0.156, eval_loss: 0.289, f1: 0.908, accuracy: 0.905, epoch: 3, total_params: 335141890 },
    history: generateNLPHistory({ train_loss: 0.156, eval_loss: 0.289, f1: 0.908, accuracy: 0.905, epoch: 3 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 2, cudaVersion: '11.8', framework: 'PyTorch 2.1.0 + HuggingFace 4.36.0', gitCommit: 'o5p6q7r', gitBranch: 'bert-large' },
    logs: generateLogs('silver-moon-3', 'finished', 3, '2026-02-22T08:00:00Z'),
    files: [
      { name: 'model.safetensors', size: 1340000000, updatedAt: '2026-02-22T16:00:00Z' },
      { name: 'config.json', size: 3072, updatedAt: '2026-02-22T08:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  const run10 = {
    id: 'run-10', runId: 's8t9u0v1', name: 'amber-wave-4', projectId: 'proj-2',
    state: 'running', createdAt: '2026-03-06T10:00:00Z', updatedAt: '2026-03-06T11:00:00Z',
    duration: 3600, color: '#ff9f40', visible: true, user: 'lisa-res',
    tags: ['roberta'], notes: 'RoBERTa-base experiment — currently running',
    config: { model: 'roberta-base', dataset: 'imdb', learning_rate: 2e-5, batch_size: 16, epochs: 5, optimizer: 'adamw', max_length: 512, warmup_steps: 500 },
    summary: { train_loss: 0.345, eval_loss: 0.412, f1: 0.834, accuracy: 0.831, epoch: 2, total_params: 124645632 },
    history: generateNLPHistory({ train_loss: 0.345, eval_loss: 0.412, f1: 0.834, accuracy: 0.831, epoch: 2 }, 15),
    systemMetrics: generateSystemMetrics(10),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA A100 40GB', gpuCount: 1, cudaVersion: '11.8', framework: 'PyTorch 2.1.0 + HuggingFace 4.36.0', gitCommit: 'w2x3y4z', gitBranch: 'roberta' },
    logs: generateLogs('amber-wave-4', 'running', 2, '2026-03-06T10:00:00Z'),
    files: [
      { name: 'checkpoint-epoch2.pt', size: 498000000, updatedAt: '2026-03-06T11:00:00Z' },
      { name: 'config.json', size: 2048, updatedAt: '2026-03-06T10:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  // --- RL CartPole runs ---
  const run11 = {
    id: 'run-11', runId: 'a5b6c7d8', name: 'dancing-leaf-1', projectId: 'proj-3',
    state: 'finished', createdAt: '2026-02-28T15:00:00Z', updatedAt: '2026-02-28T16:30:00Z',
    duration: 5400, color: '#ff6384', visible: true, user: 'alex-ml',
    tags: ['ppo', 'stable-baselines'], notes: 'PPO on CartPole-v1 — solved',
    config: { algorithm: 'PPO', env: 'CartPole-v1', learning_rate: 0.0003, n_steps: 2048, batch_size: 64, n_epochs: 10, gamma: 0.99, clip_range: 0.2 },
    summary: { mean_reward: 487.2, episode_length: 487, value_loss: 0.012, policy_loss: -0.008, epoch: 100, total_timesteps: 100000 },
    history: generateRLHistory({ mean_reward: 487.2, episode_length: 487, epoch: 100 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA RTX 3090', gpuCount: 1, cudaVersion: '11.8', framework: 'Stable-Baselines3 2.2.1', gitCommit: 'e9f0a1b', gitBranch: 'ppo' },
    logs: generateLogs('dancing-leaf-1', 'finished', 100, '2026-02-28T15:00:00Z'),
    files: [
      { name: 'ppo_cartpole.zip', size: 5120000, updatedAt: '2026-02-28T16:30:00Z' },
      { name: 'config.yaml', size: 800, updatedAt: '2026-02-28T15:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  const run12 = {
    id: 'run-12', runId: 'f2g3h4i5', name: 'frozen-lake-2', projectId: 'proj-3',
    state: 'finished', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T11:30:00Z',
    duration: 5400, color: '#36a2eb', visible: true, user: 'alex-ml',
    tags: ['dqn', 'stable-baselines'], notes: 'DQN on CartPole-v1 — moderate performance',
    config: { algorithm: 'DQN', env: 'CartPole-v1', learning_rate: 0.001, buffer_size: 50000, batch_size: 32, exploration_fraction: 0.1, gamma: 0.99, target_update_interval: 1000 },
    summary: { mean_reward: 312.5, episode_length: 312, value_loss: 0.045, policy_loss: 0.0, epoch: 100, total_timesteps: 100000 },
    history: generateRLHistory({ mean_reward: 312.5, episode_length: 312, epoch: 100 }, 25),
    systemMetrics: generateSystemMetrics(15),
    metadata: { os: 'Linux-5.15.0-x86_64', python: '3.10.12', gpu: 'NVIDIA RTX 3090', gpuCount: 1, cudaVersion: '11.8', framework: 'Stable-Baselines3 2.2.1', gitCommit: 'j6k7l8m', gitBranch: 'dqn' },
    logs: generateLogs('frozen-lake-2', 'finished', 100, '2026-03-01T10:00:00Z'),
    files: [
      { name: 'dqn_cartpole.zip', size: 4096000, updatedAt: '2026-03-01T11:30:00Z' },
      { name: 'config.yaml', size: 800, updatedAt: '2026-03-01T10:00:00Z' }
    ],
    inputArtifacts: [], outputArtifacts: []
  };

  const runs = [run1, run2, run3, run4, run5, run6, run7, run8, run9, run10, run11, run12];

  // --- Sweeps ---
  const sweeps = [{
    id: 'sweep-1', sweepId: 'abc123xy', projectId: 'proj-1', name: 'ResNet LR Sweep',
    state: 'finished', createdAt: '2026-02-20T09:00:00Z', method: 'bayes',
    metric: { name: 'val_acc', goal: 'maximize' },
    parameters: {
      learning_rate: { min: 0.0001, max: 0.01, distribution: 'log_uniform' },
      batch_size: { values: [32, 64, 128] },
      dropout: { min: 0.1, max: 0.5, distribution: 'uniform' },
      optimizer: { values: ['adam', 'sgd', 'adamw'] }
    },
    runCount: 8,
    bestRun: { runId: 'sr-3', name: 'crimson-breeze-4', val_acc: 0.918, config: { learning_rate: 0.0003, batch_size: 64, dropout: 0.2, optimizer: 'adamw' } },
    sweepRuns: [
      { runId: 'sr-1', config: { learning_rate: 0.001, batch_size: 64, dropout: 0.3, optimizer: 'adam' }, val_acc: 0.876 },
      { runId: 'sr-2', config: { learning_rate: 0.0005, batch_size: 32, dropout: 0.2, optimizer: 'adam' }, val_acc: 0.889 },
      { runId: 'sr-3', config: { learning_rate: 0.0003, batch_size: 64, dropout: 0.2, optimizer: 'adamw' }, val_acc: 0.918 },
      { runId: 'sr-4', config: { learning_rate: 0.005, batch_size: 128, dropout: 0.4, optimizer: 'sgd' }, val_acc: 0.812 },
      { runId: 'sr-5', config: { learning_rate: 0.0001, batch_size: 64, dropout: 0.1, optimizer: 'adam' }, val_acc: 0.895 },
      { runId: 'sr-6', config: { learning_rate: 0.003, batch_size: 32, dropout: 0.5, optimizer: 'sgd' }, val_acc: 0.841 },
      { runId: 'sr-7', config: { learning_rate: 0.0008, batch_size: 128, dropout: 0.3, optimizer: 'adamw' }, val_acc: 0.901 },
      { runId: 'sr-8', config: { learning_rate: 0.0002, batch_size: 64, dropout: 0.15, optimizer: 'adamw' }, val_acc: 0.911 }
    ]
  }];

  // --- Artifacts ---
  const artifacts = [
    {
      id: 'art-1', name: 'cifar10-dataset', type: 'dataset', projectId: 'proj-1',
      description: 'CIFAR-10 training and validation splits', createdAt: '2026-02-15T12:00:00Z',
      versions: [
        {
          version: 'v0', alias: ['latest'], size: 178257920, createdAt: '2026-02-15T12:00:00Z', createdBy: 'alex-ml',
          metadata: { num_train: 50000, num_val: 10000, classes: 10, image_size: '32x32' },
          files: [{ name: 'train.tar.gz', size: 160000000 }, { name: 'val.tar.gz', size: 18000000 }, { name: 'metadata.json', size: 257920 }],
          usedBy: ['run-1', 'run-2', 'run-3']
        },
        {
          version: 'v1', alias: ['latest', 'augmented'], size: 267000000, createdAt: '2026-02-20T10:00:00Z', createdBy: 'sarah-ds',
          metadata: { num_train: 50000, num_val: 10000, classes: 10, image_size: '32x32', augmented: true },
          files: [{ name: 'train_augmented.tar.gz', size: 248000000 }, { name: 'val.tar.gz', size: 18000000 }, { name: 'metadata.json', size: 1000000 }],
          usedBy: ['run-4', 'run-5', 'run-6']
        }
      ]
    },
    {
      id: 'art-2', name: 'resnet50-model', type: 'model', projectId: 'proj-1',
      description: 'Trained ResNet-50 model checkpoints', createdAt: '2026-03-01T10:45:00Z',
      versions: [
        {
          version: 'v0', alias: [], size: 102400000, createdAt: '2026-03-01T10:45:00Z', createdBy: 'alex-ml',
          metadata: { architecture: 'resnet50', val_acc: 0.876, epochs: 50 },
          files: [{ name: 'model.pt', size: 102400000 }],
          usedBy: []
        },
        {
          version: 'v1', alias: ['latest'], size: 102400000, createdAt: '2026-03-01T16:30:00Z', createdBy: 'sarah-ds',
          metadata: { architecture: 'resnet50', val_acc: 0.891, epochs: 50, augmentation: true },
          files: [{ name: 'model.pt', size: 102400000 }],
          usedBy: []
        }
      ]
    },
    {
      id: 'art-3', name: 'efficientnet-model', type: 'model', projectId: 'proj-1',
      description: 'Trained EfficientNet model checkpoints', createdAt: '2026-03-02T11:00:00Z',
      versions: [
        {
          version: 'v0', alias: [], size: 21200000, createdAt: '2026-03-02T11:00:00Z', createdBy: 'alex-ml',
          metadata: { architecture: 'efficientnet-b0', val_acc: 0.902, epochs: 40 },
          files: [{ name: 'model.pt', size: 21200000 }],
          usedBy: []
        },
        {
          version: 'v1', alias: ['latest', 'best'], size: 36400000, createdAt: '2026-03-03T10:30:00Z', createdBy: 'mike-eng',
          metadata: { architecture: 'efficientnet-b2', val_acc: 0.918, epochs: 50 },
          files: [{ name: 'model.pt', size: 36400000 }],
          usedBy: []
        }
      ]
    }
  ];

  // --- Reports ---
  const reports = [
    {
      id: 'report-1', title: 'CIFAR-10 Baseline Comparison', projectId: 'proj-1',
      description: 'Comparing ResNet and EfficientNet architectures on CIFAR-10',
      authorId: 'user-1', createdAt: '2026-03-02T11:00:00Z', updatedAt: '2026-03-04T16:30:00Z',
      viewCount: 42,
      blocks: [
        { type: 'heading', level: 1, text: 'CIFAR-10 Architecture Comparison' },
        { type: 'paragraph', text: 'This report compares ResNet and EfficientNet architectures trained on CIFAR-10. We evaluate accuracy, training speed, and parameter efficiency.' },
        { type: 'heading', level: 2, text: 'Training Curves' },
        { type: 'panel_grid', panels: [
          { type: 'line_chart', metric: 'val_acc', title: 'Validation Accuracy', runIds: ['run-1', 'run-2', 'run-3', 'run-4'] },
          { type: 'line_chart', metric: 'train_loss', title: 'Training Loss', runIds: ['run-1', 'run-2', 'run-3', 'run-4'] }
        ]},
        { type: 'heading', level: 2, text: 'Key Findings' },
        { type: 'paragraph', text: 'EfficientNet-B2 achieves the highest validation accuracy (91.8%) with 5.3M parameters, compared to ResNet-50\'s 87.6% with 25.6M parameters.' },
        { type: 'code_block', language: 'python', code: '# Best config\nmodel = EfficientNet.from_pretrained(\'efficientnet-b2\')\noptimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)' },
        { type: 'heading', level: 2, text: 'Conclusion' },
        { type: 'paragraph', text: 'EfficientNet models consistently outperform ResNet variants while using significantly fewer parameters. Recommended for production deployment.' }
      ]
    },
    {
      id: 'report-2', title: 'Sentiment Analysis Results', projectId: 'proj-2',
      description: 'Comparison of BERT variants for sentiment analysis on IMDB',
      authorId: 'user-2', createdAt: '2026-02-25T14:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
      viewCount: 28,
      blocks: [
        { type: 'heading', level: 1, text: 'Sentiment Analysis Model Comparison' },
        { type: 'paragraph', text: 'We compare BERT-base, DistilBERT, and BERT-large for binary sentiment classification on the IMDB movie reviews dataset.' },
        { type: 'heading', level: 2, text: 'F1 Score Comparison' },
        { type: 'panel_grid', panels: [
          { type: 'line_chart', metric: 'f1', title: 'F1 Score', runIds: ['run-7', 'run-8', 'run-9'] },
          { type: 'line_chart', metric: 'eval_loss', title: 'Evaluation Loss', runIds: ['run-7', 'run-8', 'run-9'] }
        ]},
        { type: 'heading', level: 2, text: 'Results Summary' },
        { type: 'paragraph', text: 'BERT-large achieves the best F1 score (0.908) but requires 4x more compute. DistilBERT offers the best speed-accuracy tradeoff at 0.871 F1 with 2x faster training.' }
      ]
    }
  ];

  return {
    currentUser,
    users,
    projects,
    runs,
    sweeps,
    artifacts,
    reports,
    activeProjectId: 'proj-1',
    activeRunId: null,
    selectedRunIds: ['run-1', 'run-2', 'run-3', 'run-4', 'run-5', 'run-6'],
    workspace: {
      panelSections: [
        {
          id: 'section-1', name: 'Charts', collapsed: false,
          panels: [
            { id: 'panel-1', type: 'line_chart', metric: 'train_loss', title: 'train_loss' },
            { id: 'panel-2', type: 'line_chart', metric: 'train_acc', title: 'train_acc' },
            { id: 'panel-3', type: 'line_chart', metric: 'val_loss', title: 'val_loss' },
            { id: 'panel-4', type: 'line_chart', metric: 'val_acc', title: 'val_acc' }
          ]
        }
      ],
      runTableColumns: ['name', 'state', 'createdAt', 'duration', 'train_loss', 'val_acc', 'config.learning_rate', 'config.model'],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: [],
      groupBy: null
    },
    notifications: [
      { id: 'notif-1', type: 'run_finished', runName: 'crimson-breeze-4', timestamp: '2026-03-03T10:30:00Z', read: false },
      { id: 'notif-2', type: 'run_crashed', runName: 'quiet-river-5', timestamp: '2026-03-04T07:45:00Z', read: false },
      { id: 'notif-3', type: 'run_finished', runName: 'golden-sunset-1', timestamp: '2026-03-01T10:45:00Z', read: true }
    ]
  };
}
