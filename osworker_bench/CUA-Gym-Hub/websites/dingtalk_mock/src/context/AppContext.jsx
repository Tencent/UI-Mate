import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import {
  getSessionId, fetchCustomState, initializeData, saveState, getInitialState
} from '../utils/dataManager'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext(null)

const AUTO_REPLIES = ['好的，收到', '我看一下', '马上处理', '没问题', '好的', '稍等一下', '收到！', '了解，谢谢']

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.id }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }

    case 'SEND_MESSAGE': {
      const { conversationId, text, replyTo, fileData } = action
      const msg = {
        id: uuidv4(),
        conversationId,
        senderId: state.currentUser.id,
        type: fileData ? 'file' : 'text',
        content: text,
        timestamp: new Date().toISOString(),
        readBy: [state.currentUser.id],
        isRecalled: false,
        replyTo: replyTo || null,
        ...(fileData || {})
      }
      const convs = state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: { text, senderId: state.currentUser.id, timestamp: msg.timestamp }, unreadCount: 0 }
          : c
      )
      return { ...state, messages: [...state.messages, msg], conversations: convs }
    }

    case 'ADD_AUTO_REPLY': {
      const { conversationId, senderId } = action
      const conv = state.conversations.find(c => c.id === conversationId)
      if (!conv) return state
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      const msg = {
        id: uuidv4(),
        conversationId,
        senderId,
        type: 'text',
        content: replyText,
        timestamp: new Date().toISOString(),
        readBy: [senderId],
        isRecalled: false,
        replyTo: null,
      }
      const convs = state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: { text: replyText, senderId, timestamp: msg.timestamp } }
          : c
      )
      return { ...state, messages: [...state.messages, msg], conversations: convs }
    }

    case 'RECALL_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.id
            ? { ...m, isRecalled: true, content: '[该消息已被撤回]', type: 'system' }
            : m
        )
      }
    }

    case 'DELETE_MESSAGE': {
      return { ...state, messages: state.messages.filter(m => m.id !== action.id) }
    }

    case 'MARK_AS_READ': {
      const { conversationId } = action
      const msgs = state.messages.map(m =>
        m.conversationId === conversationId && !m.readBy.includes(state.currentUser.id)
          ? { ...m, readBy: [...m.readBy, state.currentUser.id] }
          : m
      )
      const convs = state.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
      return { ...state, messages: msgs, conversations: convs }
    }

    case 'CREATE_CONVERSATION': {
      const { userIds, name, convType } = action
      const convKind = convType || (userIds.length > 1 ? 'group' : 'dm')
      const existing = state.conversations.find(c =>
        c.type === 'dm' && c.memberIds.length === 2 &&
        c.memberIds.includes(state.currentUser.id) &&
        userIds.some(id => c.memberIds.includes(id))
      )
      if (convKind === 'dm' && existing) {
        return { ...state, activeConversationId: existing.id }
      }
      const newConv = {
        id: uuidv4(),
        type: convKind,
        name: name || (userIds.length > 1 ? '群聊' : state.users.find(u => u.id === userIds[0])?.name || '新会话'),
        avatar: '#1890FF',
        memberIds: [state.currentUser.id, ...userIds],
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isGroup: convKind === 'group',
        announcement: '',
        createdAt: new Date().toISOString()
      }
      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        activeConversationId: newConv.id
      }
    }

    case 'PIN_CONVERSATION': {
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, isPinned: !c.isPinned } : c
        )
      }
    }

    case 'MUTE_CONVERSATION': {
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, isMuted: !c.isMuted } : c
        )
      }
    }

    case 'DELETE_CONVERSATION': {
      return {
        ...state,
        conversations: state.conversations.filter(c => c.id !== action.id),
        activeConversationId: state.activeConversationId === action.id ? null : state.activeConversationId
      }
    }

    case 'UPDATE_GROUP_NAME': {
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, name: action.name } : c
        )
      }
    }

    case 'UPDATE_GROUP_ANNOUNCEMENT': {
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, announcement: action.announcement } : c
        )
      }
    }

    case 'SEND_DING': {
      const { recipientIds, content, method } = action
      const ding = {
        id: uuidv4(),
        senderId: state.currentUser.id,
        recipientIds,
        content,
        method: method || '应用内',
        timestamp: new Date().toISOString(),
        confirmedBy: [],
        type: 'sent'
      }
      return { ...state, dingMessages: [ding, ...state.dingMessages] }
    }

    case 'CONFIRM_DING': {
      return {
        ...state,
        dingMessages: state.dingMessages.map(d =>
          d.id === action.id && !d.confirmedBy.includes(state.currentUser.id)
            ? { ...d, confirmedBy: [...d.confirmedBy, state.currentUser.id] }
            : d
        )
      }
    }

    case 'SET_DING_TAB':
      return { ...state, dingActiveTab: action.tab }

    case 'SUBMIT_APPROVAL': {
      const form = {
        id: uuidv4(),
        ...action.form,
        submitterId: state.currentUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        comments: []
      }
      return { ...state, approvalForms: [form, ...state.approvalForms] }
    }

    case 'APPROVE_FORM': {
      return {
        ...state,
        approvalForms: state.approvalForms.map(f => {
          if (f.id !== action.id) return f
          const comment = { userId: state.currentUser.id, text: action.comment || '同意', timestamp: new Date().toISOString(), action: 'approved' }
          const approverIdx = f.approverIds.indexOf(f.currentApproverId)
          const nextApprover = f.approverIds[approverIdx + 1] || null
          return {
            ...f,
            status: nextApprover ? 'pending' : 'approved',
            currentApproverId: nextApprover,
            comments: [...f.comments, comment]
          }
        })
      }
    }

    case 'REJECT_FORM': {
      return {
        ...state,
        approvalForms: state.approvalForms.map(f => {
          if (f.id !== action.id) return f
          const comment = { userId: state.currentUser.id, text: action.comment || '拒绝', timestamp: new Date().toISOString(), action: 'rejected' }
          return { ...f, status: 'rejected', currentApproverId: null, comments: [...f.comments, comment] }
        })
      }
    }

    case 'SET_APPROVAL_TAB':
      return { ...state, approvalActiveTab: action.tab }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todoItems: state.todoItems.map(t =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        )
      }
    }

    case 'CREATE_TODO': {
      const todo = {
        id: uuidv4(),
        ...action.todo,
        creatorId: state.currentUser.id,
        completed: false,
        createdAt: new Date().toISOString()
      }
      return { ...state, todoItems: [todo, ...state.todoItems] }
    }

    case 'CREATE_EVENT': {
      const event = { id: uuidv4(), ...action.event, creatorId: state.currentUser.id }
      return { ...state, calendarEvents: [...state.calendarEvents, event] }
    }

    case 'UPDATE_EVENT': {
      return {
        ...state,
        calendarEvents: state.calendarEvents.map(e => e.id === action.event.id ? { ...e, ...action.event } : e)
      }
    }

    case 'DELETE_EVENT': {
      return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.id) }
    }

    case 'SET_CALENDAR_VIEW':
      return { ...state, calendarView: action.view }

    case 'SET_CALENDAR_DATE':
      return { ...state, calendarDate: action.date }

    case 'SET_CONTACTS_TAB':
      return { ...state, contactsActiveTab: action.tab }

    case 'TOGGLE_DEPARTMENT': {
      return {
        ...state,
        departments: state.departments.map(d =>
          d.id === action.id ? { ...d, expanded: !d.expanded } : d
        )
      }
    }

    case 'CLOCK_IN': {
      const now = new Date().toISOString()
      const today = now.split('T')[0]
      const records = state.attendanceRecords
      const todayRec = records.history[today] || {}
      if (!todayRec.checkIn) {
        const updated = { ...records, checkIn: now, history: { ...records.history, [today]: { ...todayRec, checkIn: now } } }
        return { ...state, attendanceRecords: updated }
      } else {
        const updated = { ...records, checkOut: now, history: { ...records.history, [today]: { ...todayRec, checkOut: now } } }
        return { ...state, attendanceRecords: updated }
      }
    }

    case 'READ_ANNOUNCEMENT': {
      return {
        ...state,
        announcements: state.announcements.map(a =>
          a.id === action.id && !a.readBy.includes(state.currentUser.id)
            ? { ...a, readBy: [...a.readBy, state.currentUser.id] }
            : a
        )
      }
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } }
    }

    case 'DRIVE_UPLOAD_FILE': {
      const drive = state.drive || { files: [], folders: [] }
      return { ...state, drive: { ...drive, files: [action.file, ...(drive.files || [])] } }
    }

    case 'DRIVE_CREATE_FOLDER': {
      const drive = state.drive || { files: [], folders: [] }
      return { ...state, drive: { ...drive, folders: [...(drive.folders || []), action.folder] } }
    }

    case 'DRIVE_DELETE_FILE': {
      const drive = state.drive || { files: [], folders: [] }
      return { ...state, drive: { ...drive, files: (drive.files || []).filter(f => f.id !== action.id) } }
    }

    case 'DRIVE_DELETE_FOLDER': {
      const drive = state.drive || { files: [], folders: [] }
      return { ...state, drive: { ...drive, folders: (drive.folders || []).filter(f => f.id !== action.id) } }
    }

    case 'DRIVE_RENAME_FILE': {
      const drive = state.drive || { files: [], folders: [] }
      if (action.itemType === 'folder') {
        return { ...state, drive: { ...drive, folders: (drive.folders || []).map(f => f.id === action.id ? { ...f, name: action.name } : f) } }
      }
      return { ...state, drive: { ...drive, files: (drive.files || []).map(f => f.id === action.id ? { ...f, name: action.name } : f) } }
    }

    case 'FORWARD_MESSAGE': {
      const { targetConversationId, originalMsg, comment } = action
      const content = `[转发] ${originalMsg.senderName || originalMsg.senderId}: ${originalMsg.content}`
      const msg = {
        id: `msg_fwd_${Date.now()}`,
        conversationId: targetConversationId,
        senderId: state.currentUser.id,
        type: 'text',
        content: comment ? `${content}\n${comment}` : content,
        timestamp: new Date().toISOString(),
        readBy: [state.currentUser.id],
        isRecalled: false,
        replyTo: null,
      }
      const convs = state.conversations.map(c =>
        c.id === targetConversationId
          ? { ...c, lastMessage: { text: msg.content, senderId: state.currentUser.id, timestamp: msg.timestamp }, unreadCount: c.id === state.activeConversationId ? 0 : c.unreadCount + 1 }
          : c
      )
      return { ...state, messages: [...state.messages, msg], conversations: convs }
    }

    case 'CREATE_DAILY_REPORT': {
      const report = {
        id: uuidv4(),
        ...action.report,
        authorId: state.currentUser.id,
        createdAt: new Date().toISOString(),
        readBy: [state.currentUser.id],
      }
      return { ...state, dailyReports: [report, ...(state.dailyReports || [])] }
    }

    case 'READ_REPORT': {
      return {
        ...state,
        dailyReports: (state.dailyReports || []).map(r =>
          r.id === action.id && !r.readBy.includes(state.currentUser.id)
            ? { ...r, readBy: [...r.readBy, state.currentUser.id] }
            : r
        )
      }
    }

    case 'CREATE_ANNOUNCEMENT': {
      const ann = {
        id: uuidv4(),
        ...action.announcement,
        authorId: state.currentUser.id,
        publishedAt: new Date().toISOString(),
        readBy: [state.currentUser.id],
      }
      return { ...state, announcements: [ann, ...state.announcements] }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const sid = getSessionId()
  const [state, dispatch] = useReducer(reducer, null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    if (sid) {
      // Always fetch server state when sid is present — never trust stale localStorage.
      // This ensures that after a POST /post?sid=X {"action":"reset"}, the next page load
      // gets the reset state from the server rather than the old localStorage cache.
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom || undefined)
        dispatch({ type: 'INIT', payload: data })
      })
    } else {
      const data = initializeData(sid)
      dispatch({ type: 'INIT', payload: data })
    }
  }, [])

  useEffect(() => {
    if (state) {
      saveState(state, sid)
    }
  }, [state])

  if (!state) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'PingFang SC, sans-serif', color:'#8F959E' }}>
        加载中...
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export default AppContext
