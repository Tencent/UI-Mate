import { useApp } from '../context/AppContext.jsx';
import { loadInitialState, createInitialData, getStateDiff } from '../utils/dataManager.js';

export default function Go() {
  const { state } = useApp();

  if (!state) {
    return (
      <pre style={{ padding: 20, fontFamily: 'monospace', fontSize: 12 }}>
        Loading state...
      </pre>
    );
  }

  const initialState = loadInitialState() || createInitialData();
  const stateDiff = getStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
  };

  return (
    <pre style={{
      padding: 20,
      fontFamily: 'monospace',
      fontSize: 12,
      background: 'var(--xhs-input-bg)',
      color: 'var(--xhs-text)',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      minHeight: '100vh'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
