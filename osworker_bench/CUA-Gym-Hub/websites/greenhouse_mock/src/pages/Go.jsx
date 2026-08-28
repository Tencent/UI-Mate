import { useAppContext } from '../context/AppContext';
import { computeStateDiff } from '../utils/stateTracker';
import { getInitialState } from '../utils/dataManager';

export default function Go() {
  const { state, getInitialState: getInitial, sid } = useAppContext();

  const initialState = getInitial() || getInitialState(sid);
  const currentState = state;
  const stateDiff = (initialState && currentState) ? computeStateDiff(initialState, currentState) : {};

  const output = {
    initial_state: initialState,
    current_state: currentState,
    state_diff: stateDiff
  };

  return (
    <pre style={{
      fontFamily: 'monospace',
      fontSize: 12,
      padding: 16,
      background: '#1E1E1E',
      color: '#D4D4D4',
      minHeight: '100vh',
      margin: 0,
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
