import { useAppContext } from '../context/AppContext';
import { getInitialState, getSessionId } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state } = useAppContext();
  const sid = getSessionId();
  const initial = getInitialState(sid);
  const diff = computeStateDiff(initial, state);

  const output = {
    initial_state: initial,
    current_state: state,
    state_diff: diff
  };

  return <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12 }}>{JSON.stringify(output, null, 2)}</pre>;
}
