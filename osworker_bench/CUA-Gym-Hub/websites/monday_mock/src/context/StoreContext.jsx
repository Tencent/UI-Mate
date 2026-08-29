
    import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
    import { INITIAL_STATE, initializeData, getInitialState, fetchCustomState, getSessionId, saveState } from '../utils/mockData';
    import { v4 as uuidv4 } from 'uuid';

    const StoreContext = createContext();

    export const useStore = () => useContext(StoreContext);

    export const StoreProvider = ({ children }) => {
      const [state, setState] = useState(null);
      const [loading, setLoading] = useState(true);
      const sidRef = useRef(getSessionId());
      const initDone = useRef(false);

      useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;

        const sid = sidRef.current;

        if (sid) {
          // Check BEFORE initializeData if session data already exists in localStorage
          const sessionKey = `monday_clone_initial_state_${sid}`;
          const isRefresh = localStorage.getItem(sessionKey) !== null;

          if (isRefresh) {
            const data = initializeData(sid);
            setState(data);
            setLoading(false);
          } else {
            fetchCustomState(sid).then(customState => {
              const data = initializeData(sid, customState);
              setState(data);
              setLoading(false);
            });
          }
        } else {
          const data = initializeData();
          setState(data);
          setLoading(false);
        }
      }, []);

      // Persist to localStorage whenever state changes
      useEffect(() => {
        if (state) {
          saveState(state, sidRef.current);
        }
      }, [state]);

      // Actions
      const updateItemValue = (boardId, itemId, columnId, value) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          if (boardIndex === -1) return prev;

          const newBoards = [...prev.boards];
          const board = newBoards[boardIndex];
          const itemIndex = board.items.findIndex(i => i.id === itemId);

          if (itemIndex === -1) return prev;

          const newItems = [...board.items];
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            columnValues: {
              ...newItems[itemIndex].columnValues,
              [columnId]: value
            }
          };

          board.items = newItems;

          // Log activity
          const activity = {
            id: uuidv4(),
            type: 'update_value',
            itemId,
            userId: prev.currentUser.id,
            timestamp: new Date().toISOString(),
            details: `Updated column ${columnId}`
          };
          board.activities = [activity, ...(board.activities || [])];

          return { ...prev, boards: newBoards };
        });
      };

      const addItem = (boardId, groupId, name) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          if (boardIndex === -1) return prev;

          const newBoards = [...prev.boards];
          const newItem = {
            id: uuidv4(),
            groupId,
            boardId,
            name: name || 'New Item',
            columnValues: {},
            updates: [],
            subitems: []
          };

          newBoards[boardIndex].items = [...newBoards[boardIndex].items, newItem];

          // Log activity
          const activity = {
            id: uuidv4(),
            type: 'create_item',
            itemId: newItem.id,
            userId: prev.currentUser.id,
            timestamp: new Date().toISOString(),
            details: `Created item "${newItem.name}"`
          };
          newBoards[boardIndex].activities = [activity, ...(newBoards[boardIndex].activities || [])];

          return { ...prev, boards: newBoards };
        });
      };

      const addGroup = (boardId) => {
        setState(prev => {
           const boardIndex = prev.boards.findIndex(b => b.id === boardId);
           if (boardIndex === -1) return prev;

           const newBoards = [...prev.boards];
           const newGroup = {
             id: uuidv4(),
             title: 'New Group',
             color: '#579bfc'
           };

           newBoards[boardIndex].groups = [newGroup, ...newBoards[boardIndex].groups];
           return { ...prev, boards: newBoards };
        });
      };

      const updateState = (updater) => {
        setState(prev => ({ ...prev, ...updater(prev) }));
      };

      const updateItemName = (boardId, itemId, name) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          const newBoards = [...prev.boards];
          const itemIndex = newBoards[boardIndex].items.findIndex(i => i.id === itemId);
          if (itemIndex > -1) {
            newBoards[boardIndex].items[itemIndex].name = name;
          }
          return { ...prev, boards: newBoards };
        });
      };

      const deleteItem = (boardId, itemId) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          const newBoards = [...prev.boards];
          newBoards[boardIndex].items = newBoards[boardIndex].items.filter(i => i.id !== itemId);
          return { ...prev, boards: newBoards };
        });
      };

      const addSubitem = (boardId, itemId, name) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          if (boardIndex === -1) return prev;
          const newBoards = [...prev.boards];
          const itemIndex = newBoards[boardIndex].items.findIndex(i => i.id === itemId);
          if (itemIndex === -1) return prev;
          const subitem = { id: uuidv4(), name, columnValues: {} };
          const item = newBoards[boardIndex].items[itemIndex];
          newBoards[boardIndex].items[itemIndex] = {
            ...item,
            subitems: [...(item.subitems || []), subitem]
          };
          return { ...prev, boards: newBoards };
        });
      };

      const addItemUpdate = (boardId, itemId, update) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          if (boardIndex === -1) return prev;
          const newBoards = [...prev.boards];
          const itemIndex = newBoards[boardIndex].items.findIndex(i => i.id === itemId);
          if (itemIndex === -1) return prev;
          const item = newBoards[boardIndex].items[itemIndex];
          newBoards[boardIndex].items[itemIndex] = {
            ...item,
            updates: [update, ...(item.updates || [])]
          };
          newBoards[boardIndex].activities = [{
            id: uuidv4(),
            type: 'post_update',
            itemId,
            userId: prev.currentUser.id,
            timestamp: new Date().toISOString(),
            details: `Posted an update on "${item.name}"`
          }, ...(newBoards[boardIndex].activities || [])];
          return { ...prev, boards: newBoards };
        });
      };

      const addItemFile = (boardId, itemId, file) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          if (boardIndex === -1) return prev;
          const newBoards = [...prev.boards];
          const itemIndex = newBoards[boardIndex].items.findIndex(i => i.id === itemId);
          if (itemIndex === -1) return prev;
          const item = newBoards[boardIndex].items[itemIndex];
          newBoards[boardIndex].items[itemIndex] = {
            ...item,
            files: [...(item.files || []), file]
          };
          return { ...prev, boards: newBoards };
        });
      };

      const moveItem = (boardId, itemId, newGroupId) => {
        setState(prev => {
          const boardIndex = prev.boards.findIndex(b => b.id === boardId);
          const newBoards = [...prev.boards];
          const itemIndex = newBoards[boardIndex].items.findIndex(i => i.id === itemId);
          if (itemIndex > -1) {
            newBoards[boardIndex].items[itemIndex].groupId = newGroupId;
          }
          return { ...prev, boards: newBoards };
        });
      };

      const getStateDiff = () => {
        const initial = getInitialState(sidRef.current) || INITIAL_STATE;
        return {
          boardsCount: (state?.boards?.length || 0) - (initial.boards?.length || 0),
          itemsCount: (state?.boards?.reduce((acc, b) => acc + b.items.length, 0) || 0) - (initial.boards?.reduce((acc, b) => acc + b.items.length, 0) || 0)
        };
      };

      if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
      }

      return (
        <StoreContext.Provider value={{
          state,
          initialState: getInitialState(sidRef.current) || INITIAL_STATE,
          updateItemValue,
          updateState,
          addItem,
          addGroup,
          updateItemName,
          deleteItem,
          moveItem,
          addSubitem,
          addItemUpdate,
          addItemFile,
          getStateDiff
        }}>
          {children}
        </StoreContext.Provider>
      );
    };
