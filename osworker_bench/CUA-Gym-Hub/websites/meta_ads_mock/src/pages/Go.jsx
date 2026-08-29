import { useApp } from '../context/AppContext';
import { computeDiff } from '../utils/stateTracker';
import { initialKey } from '../utils/dataManager';

export default function Go() {
  const { state, sid } = useApp();
  const iKey = initialKey(sid);
  let initial_state = null;
  try {
    initial_state = JSON.parse(localStorage.getItem(iKey));
  } catch (e) {
    initial_state = null;
  }
  const current_state = state;
  const state_diff = initial_state ? computeDiff(initial_state, current_state) : {};

  return (
    <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12, background: '#fff', minHeight: '100vh' }}>
      {JSON.stringify({ initial_state, current_state, state_diff }, null, 2)}
    </pre>
  );
}
