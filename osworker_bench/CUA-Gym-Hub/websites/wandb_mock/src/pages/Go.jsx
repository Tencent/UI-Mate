import { useApp } from '../context/AppContext';
import { getSessionId, getInitialState } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state } = useApp();
  const sid = getSessionId();
  const initialState = getInitialState(sid);
  const stateDiff = computeStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
  };

  return <pre style={{ margin: 0, padding: 0, background: '#fff', color: '#000', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(output, null, 2)}</pre>;
}
