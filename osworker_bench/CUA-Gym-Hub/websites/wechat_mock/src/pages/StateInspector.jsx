
import React from 'react';
import { useStore } from '../store';
import './StateInspector.css';

const StateInspector = () => {
  const user = useStore(state => state.user);
  const contacts = useStore(state => state.contacts);
  const conversations = useStore(state => state.conversations);
  const messages = useStore(state => state.messages);
  const moments = useStore(state => state.moments);
  const groups = useStore(state => state.groups);
  const favorites = useStore(state => state.favorites);
  const initialState = useStore(state => state.initialState);
  const getStateDiff = useStore(state => state.getStateDiff);

  const currentState = {
    user,
    contacts,
    conversations,
    messages,
    moments,
    groups,
    favorites
  };

  const stateDiff = getStateDiff();

  const stateData = {
    initial_state: initialState || {},
    current_state: currentState,
    state_diff: stateDiff
  };

  return (
    <div className="state-inspector">
      <pre>{JSON.stringify(stateData, null, 2)}</pre>
    </div>
  );
};

export default StateInspector;
