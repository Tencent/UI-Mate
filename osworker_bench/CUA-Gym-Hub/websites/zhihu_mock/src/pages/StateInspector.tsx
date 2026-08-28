
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

const StateInspector: React.FC = () => {
  const [stateData, setStateData] = useState<any>(null);

  useEffect(() => {
    // Use getState() directly for a plain object snapshot
    const store = useStore.getState();
    const initialState = store.getInitialState();
    const currentState = store.getCurrentState();

    const calculateDiff = (initial: any, current: any): any => {
      const diff: any = {};

      const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
      for (const key of allKeys) {
        if (JSON.stringify(initial?.[key]) !== JSON.stringify(current?.[key])) {
          diff[key] = {
            initial: initial?.[key],
            current: current?.[key],
          };
        }
      }

      return diff;
    };

    const stateDiff = calculateDiff(initialState, currentState);

    setStateData({
      initial_state: initialState,
      current_state: currentState,
      state_diff: stateDiff,
    });
  }, []);

  if (!stateData) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <pre style={styles.json}>
        {JSON.stringify(stateData, null, 2)}
      </pre>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: '#1e1e1e',
    minHeight: '100vh',
    padding: '20px',
  },
  json: {
    color: '#d4d4d4',
    fontSize: '14px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
};

export default StateInspector;
