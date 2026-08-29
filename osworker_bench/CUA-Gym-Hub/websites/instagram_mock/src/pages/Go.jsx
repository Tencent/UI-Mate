
    import React, { useEffect, useState } from 'react';
    import { useData } from '../context/DataContext';

    const Go = () => {
      const { state, initialState } = useData();
      const [diff, setDiff] = useState({});

      useEffect(() => {
        // Simple diff implementation
        const calculateDiff = (obj1, obj2) => {
          const diffObj = {};
          // Check for added or changed keys
          for (const key in obj2) {
            if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
              diffObj[key] = {
                from: obj1[key],
                to: obj2[key]
              };
            }
          }
          return diffObj;
        };
        
        setDiff(calculateDiff(initialState, state));
      }, [state, initialState]);

      const data = {
        initial_state: initialState,
        current_state: state,
        state_diff: diff
      };

      return (
        <div className="p-8 bg-gray-100 min-h-screen font-mono text-xs">
          <h1 className="text-xl font-bold mb-4">State Inspector (/go)</h1>
          <div className="bg-white p-4 rounded shadow overflow-auto">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      );
    };

    export default Go;
  