import React from 'react';
import { useFileSystem } from '../context/FileSystemContext';

export const Go = () => {
  const { state, initialState } = useFileSystem();

  const calculateDiff = () => {
    const added: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];

    const currentIds = Object.keys(state.items);
    const initialIds = Object.keys(initialState.items);

    currentIds.forEach(id => {
      if (!initialIds.includes(id)) {
        added.push(id);
      } else if (JSON.stringify(state.items[id]) !== JSON.stringify(initialState.items[id])) {
        modified.push(id);
      }
    });

    initialIds.forEach(id => {
      if (!currentIds.includes(id)) {
        deleted.push(id);
      }
    });

    return { added, modified, deleted };
  };

  const diff = calculateDiff();

  const response = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff
  };

  return (
    <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm h-screen overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};
