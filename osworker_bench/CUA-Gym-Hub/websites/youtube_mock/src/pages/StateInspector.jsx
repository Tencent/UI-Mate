
import React from 'react';
import { useData } from '../context/DataContext';

const StateInspector = () => {
  const { getDebugState } = useData();
  const stateData = getDebugState();

  return (
    <pre style={{
      padding: '24px',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflow: 'auto',
      fontSize: '12px',
      lineHeight: '1.5'
    }}>
      {JSON.stringify(stateData, null, 2)}
    </pre>
  );
};

export default StateInspector;
