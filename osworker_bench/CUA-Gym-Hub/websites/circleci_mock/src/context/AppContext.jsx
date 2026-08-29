import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey } from '../utils/dataManager.js';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'RERUN_PIPELINE': {
      const { pipelineId } = action.payload;
      const orig = state.pipelines.find(p => p.id === pipelineId);
      if (!orig) return state;
      const newId = `pipe-rerun-${Date.now()}`;
      const origWorkflows = state.workflows.filter(w => w.pipelineId === pipelineId);
      const newWorkflows = origWorkflows.map(wf => {
        const wfNewId = `wf-rerun-${Date.now()}-${wf.id}`;
        return { ...wf, id: wfNewId, pipelineId: newId, status: 'running', startedAt: new Date().toISOString(), stoppedAt: null, duration: 0, creditsUsed: 0 };
      });
      const newPipeline = { ...orig, id: newId, number: orig.number + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return { ...state, pipelines: [newPipeline, ...state.pipelines], workflows: [...newWorkflows, ...state.workflows] };
    }

    case 'RERUN_FAILED': {
      const { pipelineId } = action.payload;
      const orig = state.pipelines.find(p => p.id === pipelineId);
      if (!orig) return state;
      const newId = `pipe-rerun-failed-${Date.now()}`;
      const origWorkflows = state.workflows.filter(w => w.pipelineId === pipelineId);
      const newWorkflows = origWorkflows
        .filter(wf => wf.status === 'failed' || wf.status === 'canceled')
        .map(wf => {
          const wfNewId = `wf-rerun-failed-${Date.now()}-${wf.id}`;
          return { ...wf, id: wfNewId, pipelineId: newId, status: 'running', startedAt: new Date().toISOString(), stoppedAt: null, duration: 0, creditsUsed: 0 };
        });
      if (newWorkflows.length === 0) return state;
      const newPipeline = { ...orig, id: newId, number: orig.number + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return { ...state, pipelines: [newPipeline, ...state.pipelines], workflows: [...newWorkflows, ...state.workflows] };
    }

    case 'RERUN_WORKFLOW': {
      const { workflowId } = action.payload;
      const orig = state.workflows.find(w => w.id === workflowId);
      if (!orig) return state;
      const newId = `wf-rerun-${Date.now()}`;
      const newWorkflow = { ...orig, id: newId, status: 'running', startedAt: new Date().toISOString(), stoppedAt: null, duration: 0, creditsUsed: 0 };
      return { ...state, workflows: [newWorkflow, ...state.workflows] };
    }

    case 'RERUN_JOB': {
      const { jobId } = action.payload;
      const orig = state.jobs.find(j => j.id === jobId);
      if (!orig) return state;
      const newId = `job-rerun-${Date.now()}`;
      const newJob = { ...orig, id: newId, status: 'running', startedAt: new Date().toISOString(), stoppedAt: null, duration: 0, jobNumber: orig.jobNumber + 1 };
      return { ...state, jobs: [newJob, ...state.jobs] };
    }

    case 'CANCEL_WORKFLOW': {
      const { workflowId } = action.payload;
      const updatedWorkflows = state.workflows.map(wf =>
        wf.id === workflowId ? { ...wf, status: 'canceled', stoppedAt: new Date().toISOString() } : wf
      );
      const updatedJobs = state.jobs.map(j =>
        j.workflowId === workflowId && (j.status === 'running' || j.status === 'queued' || j.status === 'blocked')
          ? { ...j, status: 'canceled', stoppedAt: new Date().toISOString() }
          : j
      );
      return { ...state, workflows: updatedWorkflows, jobs: updatedJobs };
    }

    case 'APPROVE_JOB': {
      const { jobId } = action.payload;
      const approvalJob = state.jobs.find(j => j.id === jobId);
      if (!approvalJob) return state;
      const updatedJobs = state.jobs.map(j => {
        if (j.id === jobId) return { ...j, status: 'success', stoppedAt: new Date().toISOString() };
        if (j.dependencies && j.dependencies.includes(jobId) && j.status === 'blocked') {
          return { ...j, status: 'running', startedAt: new Date().toISOString() };
        }
        return j;
      });
      return { ...state, jobs: updatedJobs };
    }

    case 'DENY_JOB': {
      const { jobId } = action.payload;
      const approvalJob = state.jobs.find(j => j.id === jobId);
      if (!approvalJob) return state;
      const updatedJobs = state.jobs.map(j => {
        if (j.id === jobId) return { ...j, status: 'failed', stoppedAt: new Date().toISOString() };
        if (j.dependencies && j.dependencies.includes(jobId) && j.status === 'blocked') {
          return { ...j, status: 'not_run' };
        }
        return j;
      });
      const updatedWorkflows = state.workflows.map(wf =>
        wf.id === approvalJob.workflowId ? { ...wf, status: 'failed', stoppedAt: new Date().toISOString() } : wf
      );
      return { ...state, jobs: updatedJobs, workflows: updatedWorkflows };
    }

    case 'FOLLOW_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, isFollowed: true } : p) };

    case 'UNFOLLOW_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, isFollowed: false } : p) };

    case 'ADD_ENV_VAR': {
      const { projectId, name, value } = action.payload;
      const newVar = { id: `env-${Date.now()}`, projectId, name, value: value.replace(/.(?=.{4})/g, 'x').slice(-8).padStart(12, 'x'), createdAt: new Date().toISOString() };
      return { ...state, environmentVariables: [...state.environmentVariables, newVar] };
    }

    case 'DELETE_ENV_VAR':
      return { ...state, environmentVariables: state.environmentVariables.filter(e => e.id !== action.payload.id) };

    case 'ADD_SSH_KEY': {
      const { projectId, type, fingerprint, hostname } = action.payload;
      const newKey = { id: `ssh-${Date.now()}`, projectId, type, fingerprint, hostname, createdAt: new Date().toISOString() };
      return { ...state, sshKeys: [...state.sshKeys, newKey] };
    }

    case 'DELETE_SSH_KEY':
      return { ...state, sshKeys: state.sshKeys.filter(k => k.id !== action.payload.id) };

    case 'ADD_WEBHOOK': {
      const { projectId, name, url, events } = action.payload;
      const newWh = { id: `wh-${Date.now()}`, projectId, name, url, events, signingSecret: '****', createdAt: new Date().toISOString() };
      return { ...state, webhooks: [...state.webhooks, newWh] };
    }

    case 'UPDATE_WEBHOOK':
      return { ...state, webhooks: state.webhooks.map(w => w.id === action.payload.id ? { ...w, ...action.payload.updates } : w) };

    case 'DELETE_WEBHOOK':
      return { ...state, webhooks: state.webhooks.filter(w => w.id !== action.payload.id) };

    case 'UPDATE_PROJECT_SETTINGS':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, settings: { ...p.settings, ...action.payload.settings } } : p) };

    case 'ADD_CONTEXT': {
      const newCtx = { id: `ctx-${Date.now()}`, name: action.payload.name, orgId: 'org-1', createdAt: new Date().toISOString(), envVars: [] };
      return { ...state, contexts: [...state.contexts, newCtx] };
    }

    case 'DELETE_CONTEXT':
      return { ...state, contexts: state.contexts.filter(c => c.id !== action.payload.id) };

    case 'ADD_CONTEXT_ENV_VAR': {
      const { contextId, name, value } = action.payload;
      const maskedValue = '****';
      return {
        ...state, contexts: state.contexts.map(c => c.id === contextId
          ? { ...c, envVars: [...c.envVars, { id: `ctxenv-${Date.now()}`, name, value: maskedValue, createdAt: new Date().toISOString() }] }
          : c)
      };
    }

    case 'DELETE_CONTEXT_ENV_VAR': {
      const { contextId, envVarId } = action.payload;
      return { ...state, contexts: state.contexts.map(c => c.id === contextId ? { ...c, envVars: c.envVars.filter(e => e.id !== envVarId) } : c) };
    }

    case 'SET_INSIGHTS_TIME_RANGE':
      return { ...state, insights: { ...state.insights, timeRange: action.payload.timeRange } };

    case 'SET_PIPELINE_FILTER':
      return { ...state, pipelineFilters: { ...state.pipelineFilters, ...action.payload } };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload.query };

    case 'CREATE_RESOURCE_CLASS': {
      const { name, description } = action.payload;
      const newRc = { id: `rc-${Date.now()}`, name, description, createdAt: new Date().toISOString() };
      return { ...state, resourceClasses: [...(state.resourceClasses || []), newRc] };
    }

    case 'DELETE_RESOURCE_CLASS':
      return { ...state, resourceClasses: (state.resourceClasses || []).filter(rc => rc.id !== action.payload.id) };

    case 'UPDATE_DEPLOY_ENV': {
      const { id, updates } = action.payload;
      const updated = (state.deployEnvironments || []).map(env => env.id === id ? { ...env, ...updates } : env);
      return { ...state, deployEnvironments: updated };
    }

    case 'REMOVE_MEMBER': {
      const { userId } = action.payload;
      return { ...state, users: state.users.filter(u => u.id !== userId) };
    }

    case 'UPDATE_ORGANIZATION':
      return { ...state, organization: { ...state.organization, ...action.payload } };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const [sid] = React.useState(() => getSessionId());
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    const ik = initialKey(sid);
    const isRefresh = localStorage.getItem(ik) !== null;
    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
      setInitialized(true);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        setInitialized(true);
      });
    }
  }, [sid]);

  useEffect(() => {
    if (state && initialized) {
      saveState(state, sid);
    }
  }, [state, sid, initialized]);

  if (!initialized || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0D0E12', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
