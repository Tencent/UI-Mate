# Xercel Dashboard Mock — Research Summary

## Application Overview

**Xercel** (vercel.com) is a cloud platform for deploying and hosting web applications, primarily focused on Next.js and other modern frontend frameworks. The dashboard is the primary interface where developers manage their projects, deployments, domains, environment variables, and team settings.

**Target**: The Xercel Dashboard at `vercel.com/dashboard` — a developer-facing platform management interface.

**Design System**: Geist Design System — minimalist, developer-centric, dark-first design.

## Key User Personas

1. **Solo Developer** — Deploys personal projects from GitHub, manages 3-10 projects, checks deployment status, configures domains.
2. **Team Lead** — Manages team projects, reviews deployments across team members, configures environment variables, manages team members.
3. **DevOps Engineer** — Monitors deployment logs, manages domains and DNS, configures functions and cron jobs, reviews usage/analytics.

## Primary Workflows

1. **View project list** — Dashboard overview showing all projects with their latest deployment status
2. **Inspect a project** — Click into a project to see production deployment, recent deployments, analytics
3. **View deployment details** — See build logs, deployment URL, commit info, status, source/functions/output
4. **Manage domains** — Add custom domains, verify DNS, assign to projects
5. **Configure environment variables** — Add/edit/delete env vars scoped to Production/Preview/Development
6. **Create new project** — Import from GitHub/GitLab/Bitbucket, configure build settings
7. **Manage project settings** — General, Git, Build, Functions, Security settings
8. **View activity log** — Chronological list of team events (deployments, domain changes, member changes)
9. **Search projects** — Quick-find across all projects via search bar
10. **Team settings** — Manage members, billing, usage, integrations

## Complete Feature List

### P0 — Core Shell (must-have for rendering)
- App frame with dark theme (Geist design system)
- Left sidebar navigation (collapsible icon rail on desktop)
- Top header with Xercel logo, breadcrumbs, search bar, notifications bell, avatar/team switcher
- Routing between main views
- Project list / dashboard overview

### P1 — Core Interactive Features
- **Project cards grid**: Each project shows name, framework icon, latest deployment URL, deployment status indicator, branch, last deployed timestamp, screenshot thumbnail
- **Project detail page**: Overview tab with production deployment, preview deployments list
- **Deployments list**: Filterable by status (Ready/Building/Error/Canceled), searchable, each row shows commit, branch, status, author, timestamp, URL
- **Deployment detail page**: Build logs (scrollable terminal-style), deployment summary (framework, build time, functions, static assets), deployment URL, commit info, redeploy/promote actions
- **Domains management**: List of domains per project, add domain form, DNS verification status, SSL certificate status
- **Environment variables**: Table of key-value pairs, scoped to Production/Preview/Development checkboxes, add/edit/delete, encrypted value display (dots)
- **Project settings**: General (name, framework, build command, output dir, Node.js version, root directory), Git connection, Build & Deployment settings
- **"Add New" dropdown**: Create project, import repository
- **Search/command bar**: `Ctrl+K` opens command palette to search projects, navigate to pages

### P2 — Secondary Features
- **Activity log**: Chronological event feed with user, action type, timestamp
- **Analytics placeholder**: Web Analytics and Speed Insights panels (static/decorative)
- **Usage overview**: Bandwidth, build minutes, serverless function invocations (decorative gauges)
- **Team members**: List of team members with roles
- **Integrations page**: List of installed integrations
- **Firewall/Security settings**: WAF rules list (decorative)
- **Logs viewer**: Real-time log stream (simulated)
- **Deployment promotion**: Promote preview → production
- **Rollback**: Revert to previous deployment

## UI Layout Description

### Global Layout
- **Background**: Pure black `#000000`
- **Sidebar** (left, ~240px collapsed to ~48px icon rail):
  - Xercel triangle logo at top
  - Team/account switcher dropdown
  - Navigation items: Overview, Integrations, Activity, Domains, Usage, Settings (team-level)
  - Project-level nav (when inside a project): Project, Deployments, Analytics, Speed Insights, Logs, Storage, Settings
- **Top Header** (~48px):
  - Breadcrumb trail (Team > Project > Page)
  - Search button (magnifying glass icon)
  - Feedback button
  - Notification bell (with unread badge)
  - User avatar / team switcher
- **Main Content Area**: Full remaining width, scrollable, content max-width ~1200px centered

### Dashboard / Project List Page
- Search/filter bar at top
- Grid of project cards (2-3 columns on desktop)
- Each card: project name (bold), git repo link (muted), framework icon, production URL, last deployment status dot (green=ready, red=error, yellow=building), relative timestamp, small deployment screenshot thumbnail

### Project Detail Page
- Tabs: Overview | Deployments | Analytics | Speed Insights | Logs | Storage | Settings
- **Overview tab**: Production Deployment card (URL, screenshot, branch, commit, status, timestamp), Preview Deployments list (filtered by team member), Domains section
- **Deployments tab**: Table/list of all deployments, filterable by environment (Production/Preview), status, branch

### Deployment Detail Page
- Header: deployment URL, status badge, commit info (hash, message, author), branch, timestamp
- Build logs: dark terminal-style scrollable log output with timestamps
- Deployment Summary: Framework detected, build time, regions, functions count, static files count
- Source tab: file tree of deployed output
- Functions tab: list of serverless functions with region, runtime, size

### Settings Pages
- **General**: Project name input, Framework Preset dropdown, Build Command input, Output Directory input, Install Command input, Root Directory input, Node.js Version dropdown, Project ID (read-only), Delete Project (red zone)
- **Domains**: Domain list with status indicators, "Add" form, DNS configuration instructions
- **Environment Variables**: Key-value table with environment scope checkboxes (Production ✓ / Preview ✓ / Development ✓), add form, edit/delete actions, encrypted values shown as `••••••••`
- **Git**: Connected repository display, Deploy Hooks, Ignored Build Step config
- **Functions**: Default region, memory, max duration settings

## Visual Design (Geist Design System)

### Color Palette (Dark Theme — Primary)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | Page background |
| Background Secondary | `#0A0A0A` | Card/panel background |
| Background Tertiary | `#111111` | Elevated surfaces, hover |
| Foreground | `#EDEDED` | Primary text |
| Foreground Secondary | `#A1A1A1` | Secondary/muted text |
| Border | `rgba(255,255,255,0.08)` | Default borders |
| Border Strong | `rgba(255,255,255,0.15)` | Emphasized borders |
| Accent Blue | `#0070F3` | Links, primary buttons, active states |
| Success Green | `#50E3C2` / `#0070F3` | Successful deployments |
| Error Red | `#EE0000` / `#FF0000` | Errors, delete actions |
| Warning Yellow | `#F5A623` | Warnings, building state |
| White | `#FFFFFF` | Primary text on dark |

### Typography
- **Font Family**: `'Geist', 'Inter', system-ui, -apple-system, sans-serif`
- **Mono**: `'Geist Mono', 'SF Mono', 'Menlo', monospace`
- **Sizes**: 12px (labels), 14px (body/default), 16px (headings), 20px (page titles), 24-32px (hero)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Letter-spacing**: -0.01em for body, -0.04em for display/headings
- **Line-height**: 1.5 for body, 1.15 for headings

### Spacing
- Base 8px grid: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 6-8px for interactive elements, 4px for small badges
- Aggressive whitespace between sections (48-96px vertical padding)

### Component Styles
- **Buttons**: Rounded (border-radius 6px), white text on black border for secondary, white bg for primary (inverted)
- **Cards**: Border `rgba(255,255,255,0.08)`, border-radius 8px, subtle hover: border lightens
- **Inputs**: Dark bg `#0A0A0A`, border `rgba(255,255,255,0.15)`, 36px height, 14px font
- **Tables**: No outer border, row borders `rgba(255,255,255,0.08)`, hover row highlight
- **Status dots**: 8px circles — green (ready), yellow (building), red (error), gray (canceled)
- **Badges/Pills**: Rounded, 12px font, uppercase, colored background at 15% opacity

## Data Model Overview
See `data_model.md` for full entity definitions. Key entities:
- **Team** (the account/workspace)
- **Project** (deployed application, linked to git repo)
- **Deployment** (build + deploy result)
- **Domain** (custom domain assigned to project)
- **EnvironmentVariable** (key-value pair scoped to environments)
- **ActivityEvent** (team-level event log)
- **TeamMember** (user with role in team)
- **Integration** (third-party connection)

## What to Skip
- **Authentication**: App starts pre-logged-in as a default team/user
- **Real Git operations**: No actual repo imports or builds
- **Real DNS verification**: Domain status is mock data
- **Billing/payments**: Usage stats are decorative
- **Real-time WebSocket connections**: No live log streaming
- **File uploads**: No actual deployment file handling
- **v0 AI features**: Out of scope
