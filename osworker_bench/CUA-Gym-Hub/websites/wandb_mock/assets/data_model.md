# Xeights & Biases Mock — Data Model

## Entity Types

### §CurrentUser
```javascript
{
  id: "user-1",
  username: "alex-ml",
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: null, // use initials-based placeholder
  teams: ["ml-team"],
  defaultEntity: "alex-ml" // entity = username or team name
}
```

### §Users
```javascript
{
  id: "user-1",         // unique ID
  username: "alex-ml",  // display handle, used in breadcrumbs
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: null
}
```
**Seed**: 4 users
- `alex-ml` / "Alex Chen" (current user)
- `sarah-ds` / "Sarah Kim"
- `mike-eng` / "Mike Johnson"
- `lisa-res` / "Lisa Wang"

### §Projects
```javascript
{
  id: "proj-1",
  name: "image-classifier",       // URL-safe slug
  displayName: "Image Classifier", // human-readable
  entity: "alex-ml",              // owner (user or team)
  description: "ResNet and EfficientNet experiments on CIFAR-10 and ImageNet",
  visibility: "public",           // "public" | "private"
  createdAt: "2025-11-15T10:30:00Z",
  updatedAt: "2026-03-05T14:22:00Z",
  totalRuns: 12,
  totalComputeHours: 47.3,
  tags: ["computer-vision", "classification"]
}
```
**Seed**: 3 projects
1. `image-classifier` — ResNet/EfficientNet on CIFAR-10 (12 runs)
2. `nlp-sentiment` — BERT sentiment analysis fine-tuning (8 runs)
3. `rl-cartpole` — Reinforcement learning CartPole experiments (5 runs)

### §Runs
This is the core entity. Each run represents one training experiment.
```javascript
{
  id: "run-1",
  runId: "a1b2c3d4",             // 8-char alphanumeric
  name: "golden-sunset-1",       // wandb auto-generated creative name
  projectId: "proj-1",
  state: "finished",             // "running" | "finished" | "crashed" | "killed"
  createdAt: "2026-03-01T08:15:00Z",
  updatedAt: "2026-03-01T10:45:00Z",
  duration: 9000,                // seconds
  color: "#ff6384",              // chart line color (assigned from palette)
  visible: true,                 // whether shown in workspace charts
  user: "alex-ml",
  tags: ["baseline", "resnet"],
  notes: "Initial ResNet-50 baseline on CIFAR-10",

  // Config (hyperparameters) — key-value pairs
  config: {
    model: "resnet50",
    dataset: "cifar10",
    learning_rate: 0.001,
    batch_size: 64,
    epochs: 50,
    optimizer: "adam",
    weight_decay: 0.0001,
    dropout: 0.3,
    augmentation: true,
    seed: 42
  },

  // Summary (final metric values)
  summary: {
    train_loss: 0.234,
    train_acc: 0.912,
    val_loss: 0.389,
    val_acc: 0.876,
    best_val_acc: 0.881,
    epoch: 50,
    total_params: 25557032,
    learning_rate: 0.001
  },

  // History (time-series metrics, array of step objects)
  // Each entry is one logged step
  history: [
    { step: 0, train_loss: 2.31, train_acc: 0.10, val_loss: 2.30, val_acc: 0.10, epoch: 0 },
    { step: 100, train_loss: 1.85, train_acc: 0.32, val_loss: 1.90, val_acc: 0.30, epoch: 5 },
    // ... typically 20-50 data points for smooth charts
    { step: 1000, train_loss: 0.234, train_acc: 0.912, val_loss: 0.389, val_acc: 0.876, epoch: 50 }
  ],

  // System metrics (time-series)
  systemMetrics: [
    { timestamp: 0, gpu_util: 85, gpu_memory: 6.2, cpu_util: 45, memory_util: 32, disk_io: 120, network_sent: 0.5, network_recv: 12.3 },
    // ... sampled every ~30s
  ],

  // Metadata
  metadata: {
    os: "Linux-5.15.0-x86_64",
    python: "3.10.12",
    gpu: "NVIDIA A100 40GB",
    gpuCount: 1,
    cudaVersion: "11.8",
    framework: "PyTorch 2.1.0",
    gitCommit: "a3f7e2b",
    gitBranch: "main"
  },

  // Log output (stdout lines)
  logs: [
    { timestamp: "2026-03-01T08:15:01Z", level: "INFO", message: "wandb: Currently logged in as: alex-ml" },
    { timestamp: "2026-03-01T08:15:02Z", level: "INFO", message: "wandb: Tracking run with wandb version 0.16.3" },
    { timestamp: "2026-03-01T08:15:05Z", level: "INFO", message: "Epoch 1/50 - train_loss: 2.31 - train_acc: 0.10" },
    // ...
  ],

  // Files saved during run
  files: [
    { name: "model.pt", size: 102400000, updatedAt: "2026-03-01T10:45:00Z" },
    { name: "config.yaml", size: 1024, updatedAt: "2026-03-01T08:15:00Z" },
    { name: "requirements.txt", size: 512, updatedAt: "2026-03-01T08:15:00Z" },
    { name: "wandb-summary.json", size: 2048, updatedAt: "2026-03-01T10:45:00Z" }
  ],

  // Artifact references
  inputArtifacts: [],   // artifact IDs used as input
  outputArtifacts: []   // artifact IDs produced
}
```

**Seed Runs for `image-classifier` (proj-1)**: 6 runs
1. `golden-sunset-1` — ResNet-50 baseline, finished, val_acc 0.876 (color: #ff6384)
2. `electric-wood-2` — ResNet-50 + augmentation, finished, val_acc 0.891 (color: #36a2eb)
3. `snowy-oath-3` — EfficientNet-B0, finished, val_acc 0.902 (color: #4bc0c0)
4. `crimson-breeze-4` — EfficientNet-B2, finished, val_acc 0.918 (color: #ff9f40)
5. `quiet-river-5` — ResNet-101 large, crashed (OOM), partial metrics (color: #9966ff)
6. `bright-dawn-6` — EfficientNet-B0 + cosine LR, running, partial metrics (color: #ffce56)

**Seed Runs for `nlp-sentiment` (proj-2)**: 4 runs
1. `misty-forest-1` — BERT-base, finished, f1 0.892
2. `wandering-star-2` — DistilBERT, finished, f1 0.871
3. `silver-moon-3` — BERT-large, finished, f1 0.908
4. `amber-wave-4` — RoBERTa-base, running, partial

**Seed Runs for `rl-cartpole` (proj-3)**: 2 runs
1. `dancing-leaf-1` — PPO, finished, mean_reward 487.2
2. `frozen-lake-2` — DQN, finished, mean_reward 312.5

### §Sweeps
```javascript
{
  id: "sweep-1",
  sweepId: "abc123xy",           // 8-char ID
  projectId: "proj-1",
  name: "ResNet LR Sweep",
  state: "finished",             // "running" | "finished" | "canceled"
  createdAt: "2026-02-20T09:00:00Z",
  method: "bayes",               // "grid" | "random" | "bayes"
  metric: {
    name: "val_acc",
    goal: "maximize"
  },
  parameters: {
    learning_rate: { min: 0.0001, max: 0.01, distribution: "log_uniform" },
    batch_size: { values: [32, 64, 128] },
    dropout: { min: 0.1, max: 0.5, distribution: "uniform" },
    optimizer: { values: ["adam", "sgd", "adamw"] }
  },
  runCount: 12,
  bestRun: {
    runId: "run-sweep-best",
    name: "crimson-breeze-4",
    val_acc: 0.918,
    config: { learning_rate: 0.0003, batch_size: 64, dropout: 0.2, optimizer: "adamw" }
  },
  // For parallel coordinates visualization
  sweepRuns: [
    { runId: "sr-1", config: { learning_rate: 0.001, batch_size: 64, dropout: 0.3, optimizer: "adam" }, val_acc: 0.876 },
    { runId: "sr-2", config: { learning_rate: 0.0005, batch_size: 32, dropout: 0.2, optimizer: "adam" }, val_acc: 0.889 },
    { runId: "sr-3", config: { learning_rate: 0.0003, batch_size: 64, dropout: 0.2, optimizer: "adamw" }, val_acc: 0.918 },
    { runId: "sr-4", config: { learning_rate: 0.005, batch_size: 128, dropout: 0.4, optimizer: "sgd" }, val_acc: 0.812 },
    { runId: "sr-5", config: { learning_rate: 0.0001, batch_size: 64, dropout: 0.1, optimizer: "adam" }, val_acc: 0.895 },
    { runId: "sr-6", config: { learning_rate: 0.003, batch_size: 32, dropout: 0.5, optimizer: "sgd" }, val_acc: 0.841 },
    { runId: "sr-7", config: { learning_rate: 0.0008, batch_size: 128, dropout: 0.3, optimizer: "adamw" }, val_acc: 0.901 },
    { runId: "sr-8", config: { learning_rate: 0.0002, batch_size: 64, dropout: 0.15, optimizer: "adamw" }, val_acc: 0.911 }
  ]
}
```
**Seed**: 1 sweep for `image-classifier`

### §Artifacts
```javascript
{
  id: "art-1",
  name: "cifar10-dataset",
  type: "dataset",               // "dataset" | "model" | "code" | "result"
  projectId: "proj-1",
  description: "CIFAR-10 training and validation splits",
  createdAt: "2026-02-15T12:00:00Z",
  versions: [
    {
      version: "v0",
      alias: ["latest"],
      size: 178257920,           // bytes
      createdAt: "2026-02-15T12:00:00Z",
      createdBy: "alex-ml",
      metadata: { num_train: 50000, num_val: 10000, classes: 10, image_size: "32x32" },
      files: [
        { name: "train.tar.gz", size: 160000000 },
        { name: "val.tar.gz", size: 18000000 },
        { name: "metadata.json", size: 257920 }
      ],
      usedBy: ["run-1", "run-2", "run-3"]  // runs that consumed this artifact
    },
    {
      version: "v1",
      alias: ["latest", "augmented"],
      size: 267000000,
      createdAt: "2026-02-20T10:00:00Z",
      createdBy: "sarah-ds",
      metadata: { num_train: 50000, num_val: 10000, classes: 10, image_size: "32x32", augmented: true },
      files: [
        { name: "train_augmented.tar.gz", size: 248000000 },
        { name: "val.tar.gz", size: 18000000 },
        { name: "metadata.json", size: 1000000 }
      ],
      usedBy: ["run-4", "run-5", "run-6"]
    }
  ]
}
```
**Seed**: 3 artifacts
1. `cifar10-dataset` (type: dataset, 2 versions)
2. `resnet50-model` (type: model, 3 versions — one per finished ResNet run)
3. `efficientnet-model` (type: model, 2 versions)

### §Reports
```javascript
{
  id: "report-1",
  title: "CIFAR-10 Baseline Comparison",
  projectId: "proj-1",
  description: "Comparing ResNet and EfficientNet architectures on CIFAR-10",
  authorId: "user-1",
  createdAt: "2026-03-02T11:00:00Z",
  updatedAt: "2026-03-04T16:30:00Z",
  // Report body is a list of blocks
  blocks: [
    { type: "heading", level: 1, text: "CIFAR-10 Architecture Comparison" },
    { type: "paragraph", text: "This report compares ResNet and EfficientNet architectures trained on CIFAR-10. We evaluate accuracy, training speed, and parameter efficiency." },
    { type: "heading", level: 2, text: "Training Curves" },
    { type: "panel_grid", panels: [
      { type: "line_chart", metric: "val_acc", title: "Validation Accuracy", runIds: ["run-1", "run-2", "run-3", "run-4"] },
      { type: "line_chart", metric: "train_loss", title: "Training Loss", runIds: ["run-1", "run-2", "run-3", "run-4"] }
    ]},
    { type: "heading", level: 2, text: "Key Findings" },
    { type: "paragraph", text: "EfficientNet-B2 achieves the highest validation accuracy (91.8%) with 5.3M parameters, compared to ResNet-50's 87.6% with 25.6M parameters." },
    { type: "code_block", language: "python", code: "# Best config\nmodel = EfficientNet.from_pretrained('efficientnet-b2')\noptimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)" },
    { type: "heading", level: 2, text: "Conclusion" },
    { type: "paragraph", text: "EfficientNet models consistently outperform ResNet variants while using significantly fewer parameters. Recommended for production deployment." }
  ]
}
```
**Seed**: 2 reports
1. "CIFAR-10 Baseline Comparison" (for image-classifier project)
2. "Sentiment Analysis Results" (for nlp-sentiment project)

## Relationships

```
User --(owns)--> Project
Project --(contains)--> Run[]
Project --(contains)--> Sweep[]
Project --(contains)--> Artifact[]
Project --(contains)--> Report[]
Run --(belongs to)--> Project
Run --(uses)--> Artifact[] (input)
Run --(produces)--> Artifact[] (output)
Sweep --(contains)--> Run[] (sweep runs)
Report --(references)--> Run[] (via panel_grid blocks)
```

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUser: { /* §CurrentUser */ },
    users: [ /* 4 users */ ],
    projects: [ /* 3 projects */ ],
    runs: [ /* 12 runs total across projects */ ],
    sweeps: [ /* 1 sweep */ ],
    artifacts: [ /* 3 artifacts */ ],
    reports: [ /* 2 reports */ ],

    // UI state
    activeProjectId: "proj-1",
    activeRunId: null,
    selectedRunIds: ["run-1", "run-2", "run-3", "run-4", "run-5", "run-6"], // all visible by default

    // Workspace preferences
    workspace: {
      panelSections: [
        {
          id: "section-1",
          name: "Charts",
          collapsed: false,
          panels: [
            { id: "panel-1", type: "line_chart", metric: "train_loss", title: "train_loss" },
            { id: "panel-2", type: "line_chart", metric: "train_acc", title: "train_acc" },
            { id: "panel-3", type: "line_chart", metric: "val_loss", title: "val_loss" },
            { id: "panel-4", type: "line_chart", metric: "val_acc", title: "val_acc" }
          ]
        }
      ],
      runTableColumns: ["name", "state", "createdAt", "duration", "train_loss", "val_acc", "config.learning_rate", "config.model"],
      sortBy: "createdAt",
      sortOrder: "desc",
      filters: [],
      groupBy: null
    }
  };
}
```

## History Data Generation Notes

For realistic line charts, each run should have ~20-30 history data points with plausible training curves:
- Loss should decrease over time (roughly exponential decay with noise)
- Accuracy should increase over time (roughly logarithmic growth with noise)
- Crashed runs should have fewer data points (stop abruptly)
- Running runs should have ongoing data points
- Different model architectures should show different convergence speeds

Generate history using a helper function:
```javascript
function generateHistory(finalMetrics, numSteps, crashed = false) {
  // Generate realistic training curves with noise
  // Loss: start ~2.3, decay towards finalMetrics.train_loss
  // Accuracy: start ~0.1, grow towards finalMetrics.train_acc
  // If crashed, truncate at random point
}
```
