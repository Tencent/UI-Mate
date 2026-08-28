# Deploying CUA-Gym-Hub

CUA-Gym-Hub stores all mock applications under `websites/`. Each app is an independent Vite project with the same state API contract.

## Single App

```bash
cd websites/notion_mock
npm install
npm run dev
```

The dev server defaults to `http://localhost:5173`. The state API is available from the same origin:

```bash
curl "http://localhost:5173/go?sid=task_001"
```

## All Apps On One Server

Use the root deployment script to install, build, and start every mock app in a tmux session:

```bash
./deploy-all.sh
```

By default, apps are assigned consecutive ports starting at `8100`, ordered by directory name under `websites/`.

Useful options:

```bash
./deploy-all.sh --skip-install
./deploy-all.sh --skip-build --no-attach
```

## Reverse Proxy

For public or shared deployments, place a reverse proxy in front of the tmux-managed preview servers. Map each mock app to its own hostname or path, then use those URLs in CUA-Gym dataset endpoint variables such as:

```bash
CUA_GYM_GMAIL_URL=https://your-gmail-mock.example.com
CUA_GYM_SLACK_URL=https://your-slack-mock.example.com
CUA_GYM_NOTION_URL=https://your-notion-mock.example.com
```

Do not rely on release-hosted `xlang.ai` endpoints for large-scale training or evaluation.

## Runtime State

Mocks write per-session state under `.mock-states/` and uploaded files under `.mock-files/` inside each app directory. These directories are ignored by git and can be deleted to reset local runtime state.

## UDA Hardened Deployments

For environments where the same agent has shell and browser access, run mocks with the hybrid hardened state API. This keeps legacy no-token `/post`, `/state`, and `/go` behavior available for existing rollouts while allowing new harnesses to opt into server-side private state with an admin token:

```bash
export CUA_GYM_HARDENED=1
export CUA_GYM_ADMIN_TOKEN="$(openssl rand -hex 32)"
./deploy-all.sh --skip-install --no-attach
```

The harness must keep `CUA_GYM_ADMIN_TOKEN` out of the agent workspace. Use it only from setup/eval code:

```bash
curl -X POST "$MOCK_URL/post?sid=$REAL_SID" \
  -H "Content-Type: application/json" \
  -H "X-CUA-Admin-Token: $CUA_GYM_ADMIN_TOKEN" \
  -d '{"action":"set","state":{...}}'
```

The response contains a one-time `launch_url`. Open the browser to `$MOCK_URL$launch_url`; do not place the real `sid` in the browser URL. Evaluation reads `/go?sid=$REAL_SID` with the same admin token.
