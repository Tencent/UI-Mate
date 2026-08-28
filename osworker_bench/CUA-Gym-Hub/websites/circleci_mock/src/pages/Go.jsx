import { useApp } from '../context/AppContext.jsx';
import { getInitialState, getSessionId } from '../utils/dataManager.js';
import { computeStateDiff } from '../utils/stateTracker.js';

export default function Go() {
  const { state } = useApp();
  const sid = getSessionId();
  const initialState = getInitialState(sid) || state;
  const stateDiff = computeStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
  };

  return (
    <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12, background: '#fff', color: '#24292f', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
