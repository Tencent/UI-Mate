import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialState, getSessionId, fetchCustomState, saveState, getInitialState, initializeData } from './initialData';
import { generateId } from '../lib/utils';

const StoreContext = createContext();

const BASE_INITIAL_KEY = 'airtable_mock_v1_initial';

const ACTIONS = {
  SET_STATE: 'SET_STATE',
  ADD_RECORD: 'ADD_RECORD',
  UPDATE_CELL: 'UPDATE_CELL',
  DELETE_RECORD: 'DELETE_RECORD',
  SET_ACTIVE_TABLE: 'SET_ACTIVE_TABLE',
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  ADD_FIELD: 'ADD_FIELD',
  CREATE_TABLE: 'CREATE_TABLE',
  CREATE_VIEW: 'CREATE_VIEW',
  CREATE_BASE: 'CREATE_BASE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_STATE:
      return action.payload;

    case ACTIONS.UPDATE_CELL: {
      const { tableId, recordId, fieldId, value } = action.payload;
      const table = state.tables[tableId];
      const recordIndex = table.records.findIndex(r => r.id === recordId);
      if (recordIndex === -1) return state;

      const updatedRecords = [...table.records];
      updatedRecords[recordIndex] = {
        ...updatedRecords[recordIndex],
        fields: {
          ...updatedRecords[recordIndex].fields,
          [fieldId]: value
        }
      };

      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            records: updatedRecords
          }
        }
      };
    }

    case ACTIONS.ADD_RECORD: {
      const { tableId, initialFields = {} } = action.payload;
      const table = state.tables[tableId];
      const newRecord = {
        id: generateId('rec'),
        createdTime: new Date().toISOString(),
        fields: initialFields
      };

      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            records: [...table.records, newRecord]
          }
        }
      };
    }

    case ACTIONS.DELETE_RECORD: {
      const { tableId, recordId } = action.payload;
      const table = state.tables[tableId];
      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            records: table.records.filter(r => r.id !== recordId)
          }
        }
      };
    }

    case ACTIONS.SET_ACTIVE_TABLE: {
      const table = state.tables[action.payload];
      return { ...state, activeTableId: action.payload, activeBaseId: table?.baseId || state.activeBaseId };
    }

    case ACTIONS.SET_ACTIVE_VIEW: {
      const { tableId, viewId } = action.payload;
      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            activeViewId: viewId
          }
        }
      };
    }

    case ACTIONS.ADD_FIELD: {
      const { tableId, field } = action.payload;
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: [...table.fields, field],
            records: table.records.map(record => ({
              ...record,
              fields: { ...record.fields, [field.id]: field.defaultValue ?? '' }
            }))
          }
        }
      };
    }

    case ACTIONS.CREATE_VIEW: {
      const { tableId, view } = action.payload;
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            views: [...table.views, view],
            activeViewId: view.id
          }
        }
      };
    }

    case ACTIONS.CREATE_TABLE: {
      const { baseId, name } = action.payload;
      const newTableId = generateId('tbl');
      const newViewId = generateId('view');

      const newTable = {
        id: newTableId,
        baseId,
        name,
        fields: [
          { id: generateId('fld'), name: 'Name', type: 'text', primary: true },
          { id: generateId('fld'), name: 'Notes', type: 'long_text' },
          { id: generateId('fld'), name: 'Status', type: 'single_select', options: [{id:'1', name:'Todo', color:'bg-gray-100 text-gray-800'}] }
        ],
        records: [],
        views: [{ id: newViewId, name: 'Grid View', type: 'grid' }],
        activeViewId: newViewId
      };

      return {
        ...state,
        bases: {
          ...state.bases,
          [baseId]: {
            ...state.bases[baseId],
            tables: [...state.bases[baseId].tables, newTableId]
          }
        },
        tables: {
          ...state.tables,
          [newTableId]: newTable
        },
        activeTableId: newTableId
      };
    }

    case ACTIONS.CREATE_BASE: {
      const { name } = action.payload;
      const baseId = generateId('base');
      const tableId = generateId('tbl');
      const viewId = generateId('view');
      return {
        ...state,
        bases: {
          ...state.bases,
          [baseId]: {
            id: baseId,
            name,
            color: 'bg-blue-500',
            tables: [tableId]
          }
        },
        tables: {
          ...state.tables,
          [tableId]: {
            id: tableId,
            baseId,
            name: 'Table 1',
            fields: [
              { id: generateId('fld'), name: 'Name', type: 'text', primary: true },
              { id: generateId('fld'), name: 'Notes', type: 'long_text' }
            ],
            records: [],
            views: [{ id: viewId, name: 'Grid View', type: 'grid' }],
            activeViewId: viewId
          }
        },
        activeBaseId: baseId,
        activeTableId: tableId
      };
    }

    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, ui: { ...(state.ui || {}), searchQuery: action.payload } };

    case ACTIONS.ADD_ACTIVITY:
      return {
        ...state,
        activityLog: [
          { id: generateId('act'), createdTime: new Date().toISOString(), ...action.payload },
          ...(state.activityLog || [])
        ].slice(0, 20)
      };

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null);
  const [initialStateData, setInitialStateData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        dispatch({ type: ACTIONS.SET_STATE, payload: data });
        setInitialStateData(getInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: ACTIONS.SET_STATE, payload: data });
          setInitialStateData(getInitialState(sid) || data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      dispatch({ type: ACTIONS.SET_STATE, payload: data });
      setInitialStateData(getInitialState() || data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  if (loading || !state) return <div className="flex items-center justify-center h-screen">Loading Base...</div>;

  return (
    <StoreContext.Provider value={{ state, dispatch, initialState: initialStateData, ACTIONS }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
