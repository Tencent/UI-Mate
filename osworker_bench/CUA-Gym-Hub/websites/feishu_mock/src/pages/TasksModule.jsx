import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const FILTER_OPTIONS = ['我的任务', '我分配的', '已完成'];
const PRIORITY_MAP = {
  high: { label: '高', color: '#F54A45', icon: '🔴' },
  medium: { label: '中', color: '#FF7D00', icon: '🟡' },
  low: { label: '低', color: '#3370FF', icon: '🔵' },
};

export default function TasksModule() {
  const { state, dispatch } = useApp();
  const { tasks, users, currentUser } = state;
  const [filter, setFilter] = useState('我的任务');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  function getFilteredTasks() {
    if (filter === '我的任务') return tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'done');
    if (filter === '我分配的') return tasks.filter(t => t.creatorId === currentUser.id && t.assigneeId !== currentUser.id);
    if (filter === '已完成') return tasks.filter(t => t.status === 'done');
    return tasks;
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isOverdue = ts < now.getTime() && filter !== '已完成';
    const str = `${d.getMonth()+1}月${d.getDate()}日`;
    return { str, isOverdue };
  }

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: currentUser.id,
      creatorId: currentUser.id,
      dueDate: null,
      tags: [],
      relatedDocId: null,
      relatedConvId: null,
      createdAt: Date.now(),
      completedAt: null,
    };
    dispatch({ type: 'CREATE_TASK', payload: task });
    setNewTaskTitle('');
    setShowCreateForm(false);
  }

  const filteredTasks = getFilteredTasks();

  return (
    <>
      {/* Module Panel */}
      <div style={{
        width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DEE0E3',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid #F0F1F2' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, color: '#1F2329', margin: 0 }}>任务</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {[
            ['我的任务', '📥'],
            ['我分配的', '📤'],
            ['已完成', '✅'],
          ].map(([f, icon]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: filter === f ? '#E1EAFF' : 'transparent',
                color: filter === f ? '#3370FF' : '#1F2329',
                fontSize: 13, fontWeight: filter === f ? 500 : 400, marginBottom: 2,
              }}
              onMouseEnter={e => { if (filter !== f) e.currentTarget.style.background = '#F0F1F2'; }}
              onMouseLeave={e => { if (filter !== f) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{icon}</span> {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#F5F6F7' }}>
        {/* Task list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, color: '#1F2329', margin: 0 }}>{filter}</h2>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowCreateForm(true)}
              style={{ padding: '6px 14px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
            >+ 新建任务</button>
          </div>

          {/* Create form */}
          {showCreateForm && (
            <div style={{ background: '#fff', padding: '8px 24px', borderBottom: '1px solid #DEE0E3', display: 'flex', gap: 8 }}>
              <input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="输入任务标题"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') setShowCreateForm(false); }}
                style={{ flex: 1, padding: '7px 10px', border: '1px solid #3370FF', borderRadius: 6, fontSize: 14, outline: 'none' }}
              />
              <button onClick={handleCreateTask} style={{ padding: '7px 14px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>确定</button>
              <button onClick={() => setShowCreateForm(false)} style={{ padding: '7px 14px', background: '#fff', color: '#646A73', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>取消</button>
            </div>
          )}

          {/* Task list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {filteredTasks.length === 0 && (
              <div style={{ textAlign: 'center', color: '#8F959E', marginTop: 40, fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                暂无任务
              </div>
            )}
            {filteredTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              const due = task.dueDate ? formatDate(task.dueDate) : null;
              const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    background: '#fff', borderRadius: 8, padding: '12px 16px', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    border: selectedTask?.id === task.id ? '1px solid #3370FF' : '1px solid #DEE0E3',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TASK_DONE', payload: task.id }); }}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      border: isDone ? 'none' : '2px solid #DEE0E3',
                      background: isDone ? '#34C724' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isDone && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
                  </div>

                  {/* Title */}
                  <span style={{ flex: 1, fontSize: 14, color: isDone ? '#8F959E' : '#1F2329', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>

                  {/* Priority */}
                  <span title={`优先级：${p.label}`} style={{ fontSize: 14 }}>{p.icon}</span>

                  {/* Due date */}
                  {due && (
                    <span style={{ fontSize: 12, color: due.isOverdue ? '#F54A45' : '#8F959E', whiteSpace: 'nowrap' }}>
                      {due.str}
                    </span>
                  )}

                  {/* Assignee */}
                  {assignee && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: assignee.avatarColor, color: '#fff', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {assignee.initials}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task detail panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            users={users}
            currentUser={currentUser}
            onClose={() => setSelectedTask(null)}
            dispatch={dispatch}
          />
        )}
      </div>
    </>
  );
}

function TaskDetailPanel({ task, users, currentUser, onClose, dispatch }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);

  function handleUpdate(updates) {
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, ...updates } });
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    onClose();
  }

  const assignee = users.find(u => u.id === task.assigneeId);

  return (
    <div style={{
      width: 340, background: '#fff', borderLeft: '1px solid #DEE0E3',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #DEE0E3', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#1F2329' }}>任务详情</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Title */}
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); handleUpdate({ title: e.target.value }); }}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontWeight: 600, color: '#1F2329', fontFamily: 'inherit', marginBottom: 16 }}
        />

        {/* Status */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#8F959E', display: 'block', marginBottom: 4 }}>状态</label>
          <select value={status} onChange={e => { setStatus(e.target.value); handleUpdate({ status: e.target.value }); }} style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13 }}>
            <option value="todo">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
          </select>
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#8F959E', display: 'block', marginBottom: 4 }}>优先级</label>
          <select value={priority} onChange={e => { setPriority(e.target.value); handleUpdate({ priority: e.target.value }); }} style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13 }}>
            <option value="high">🔴 高</option>
            <option value="medium">🟡 中</option>
            <option value="low">🔵 低</option>
          </select>
        </div>

        {/* Assignee */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#8F959E', display: 'block', marginBottom: 4 }}>负责人</label>
          {assignee && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F5F6F7', borderRadius: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: assignee.avatarColor, color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{assignee.initials}</div>
              <span style={{ fontSize: 13, color: '#1F2329' }}>{assignee.name}</span>
            </div>
          )}
        </div>

        {/* Due date */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#8F959E', display: 'block', marginBottom: 4 }}>截止日期</label>
          <input
            type="date"
            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            onChange={e => handleUpdate({ dueDate: e.target.value ? new Date(e.target.value).getTime() : null })}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13 }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#8F959E', display: 'block', marginBottom: 4 }}>描述</label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); handleUpdate({ description: e.target.value }); }}
            placeholder="添加描述..."
            rows={4}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13, resize: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          style={{ width: '100%', padding: '8px', border: '1px solid #F54A45', borderRadius: 6, background: '#fff', color: '#F54A45', cursor: 'pointer', fontSize: 13 }}
        >
          删除任务
        </button>
      </div>
    </div>
  );
}
