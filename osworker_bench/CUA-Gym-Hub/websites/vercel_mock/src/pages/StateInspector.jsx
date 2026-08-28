import { useApp } from '../context/AppContext';
import { deepDiff } from '../utils/dataManager';
import { useSearchParams } from 'react-router-dom';

export default function StateInspector() {
  const { state, initialState } = useApp();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');

  const current_state = state;
  const initial_state = initialState;
  const state_diff = deepDiff(initial_state, current_state);

  const data = { initial_state, current_state, state_diff, sid: sid || null };

  return (
    <pre style={{
      padding: 24,
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: '#171717',
      background: '#fafafa',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
