
    import React, { useMemo } from 'react';
    import { useStore } from '../lib/store';

    // Deep diff computation
    function computeDeepDiff(initial, current, path = '') {
      const diff = {};

      if (initial === current) return diff;

      if (initial === null || initial === undefined ||
          current === null || current === undefined ||
          typeof initial !== 'object' || typeof current !== 'object') {
        if (initial !== current) {
          diff[path || 'root'] = { old: initial, new: current };
        }
        return diff;
      }

      if (Array.isArray(initial) || Array.isArray(current)) {
        if (!Array.isArray(initial) || !Array.isArray(current) ||
            initial.length !== current.length) {
          diff[path || 'root'] = { old: initial, new: current };
          return diff;
        }
        for (let i = 0; i < initial.length; i++) {
          Object.assign(diff, computeDeepDiff(initial[i], current[i], path ? `${path}[${i}]` : `[${i}]`));
        }
        return diff;
      }

      const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
      for (const key of allKeys) {
        const keyPath = path ? `${path}.${key}` : key;
        if (!(key in initial)) {
          diff[keyPath] = { old: undefined, new: current[key] };
        } else if (!(key in current)) {
          diff[keyPath] = { old: initial[key], new: undefined };
        } else {
          Object.assign(diff, computeDeepDiff(initial[key], current[key], keyPath));
        }
      }
      return diff;
    }

    // Get or create session ID
    function getSessionId() {
      let sessionId = sessionStorage.getItem('github_mock_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('github_mock_session_id', sessionId);
      }
      return sessionId;
    }

    export default function GoDebug() {
      const { state, initialState } = useStore();

      const output = useMemo(() => {
        const stateDiff = computeDeepDiff(initialState, state);

        return {
          initial_state: initialState,
          current_state: state,
          state_diff: stateDiff,
          metadata: {
            app_name: 'github_mock',
            timestamp: new Date().toISOString(),
            session_id: getSessionId(),
            changes_count: Object.keys(stateDiff).length,
            has_changes: Object.keys(stateDiff).length > 0
          }
        };
      }, [state, initialState]);

      return (
        <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
          <div className="bg-[#252526] border-b border-[#3c3c3c] p-3 flex justify-between items-center">
            <h1 className="text-base font-semibold text-white">XitHub Mock - State Inspector</h1>
            <div className="flex gap-4 text-xs text-[#858585]">
              <span>Session: {output.metadata.session_id}</span>
              <span>Changes: {output.metadata.changes_count}</span>
            </div>
          </div>
          <pre className="p-4 overflow-auto">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      );
    }
