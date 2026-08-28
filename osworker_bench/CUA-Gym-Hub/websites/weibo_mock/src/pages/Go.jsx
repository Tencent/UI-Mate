import { useApp } from '../context/AppContext';
import { getStateDiff } from '../utils/dataManager';

export default function Go() {
  const { state, getInitialState } = useApp();
  const initialState = getInitialState();
  const stateDiff = getStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff,
  };

  return (
    <pre style={{
      fontFamily: 'monospace',
      fontSize: 12,
      padding: 16,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      background: 'white',
      margin: 0,
      minHeight: '100vh',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
