import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import ConversationList from '../components/messenger/ConversationList';
import ChatArea from '../components/messenger/ChatArea';

export default function MessengerModule() {
  const { state, dispatch } = useApp();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (conversationId && conversationId !== state.activeConversationId) {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
    } else if (!conversationId && state.activeConversationId) {
      navigate(`/messenger/${state.activeConversationId}`, { replace: true });
    }
  }, [conversationId]);

  const activeConv = state.conversations.find(c => c.id === state.activeConversationId);

  return (
    <>
      {/* Module Panel — Conversation List */}
      <div style={{
        width: 280, minWidth: 280, background: '#fff', borderRight: '1px solid #DEE0E3',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}>
        <ConversationList />
      </div>

      {/* Content Area — Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        {activeConv ? (
          <ChatArea conversation={activeConv} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F959E', fontSize: 14 }}>
            选择一个会话开始聊天
          </div>
        )}
      </div>
    </>
  );
}
