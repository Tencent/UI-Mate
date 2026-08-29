import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, GripVertical, CheckCircle2, Circle,
  FileText, ClipboardList, HelpCircle, MessageCircle, ExternalLink,
  Folder, MoreVertical, Plus, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Modules.css';

const TYPE_ICONS = {
  Page: FileText,
  Assignment: ClipboardList,
  Quiz: HelpCircle,
  Discussion: MessageCircle,
  ExternalUrl: ExternalLink,
  File: Folder,
  SubHeader: null,
};

function getItemRoute(courseId, item) {
  switch (item.type) {
    case 'Assignment': return `/courses/${courseId}/assignments/${item.content_id}`;
    case 'Quiz': return `/courses/${courseId}/assignments/${item.content_id}`;
    case 'Discussion': return `/courses/${courseId}/discussion_topics/${item.content_id}`;
    case 'Page': return item.content_id ? `/courses/${courseId}/pages/${item.content_id}` : null;
    case 'ExternalUrl': return item.external_url || null;
    default: return null;
  }
}

function AddModuleModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [lockUntil, setLockUntil] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), lockUntil: lockUntil || null });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modules-modal-header">
          <h3>Add Module</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modules-modal-body">
            <div className="modal-field">
              <label>Module Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="modal-input"
                placeholder="Enter module name"
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label>Lock Until (optional)</label>
              <input
                type="date"
                value={lockUntil}
                onChange={(e) => setLockUntil(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>
          <div className="modules-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={!name.trim()}>Add Module</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddModuleItemModal({ onClose, onAdd, courseId, state }) {
  const [itemType, setItemType] = useState('Page');
  const [title, setTitle] = useState('');
  const [indent, setIndent] = useState(0);
  const [selectedContentId, setSelectedContentId] = useState('');

  const cid = parseInt(courseId);

  const getExistingItems = () => {
    switch (itemType) {
      case 'Assignment':
        return state.assignments.filter(a => a.course_id === cid).map(a => ({ id: a.id, name: a.name }));
      case 'Page':
        return state.pages.filter(p => p.course_id === cid).map(p => ({ id: p.id, name: p.title }));
      case 'Discussion':
        return state.discussionTopics.filter(d => d.course_id === cid).map(d => ({ id: d.id, name: d.title }));
      case 'Quiz':
        return state.assignments.filter(a => a.course_id === cid && a.submission_types?.includes('online_quiz')).map(a => ({ id: a.id, name: a.name }));
      default:
        return [];
    }
  };

  const existingItems = getExistingItems();
  const needsContentSelector = itemType !== 'ExternalUrl' && itemType !== 'SubHeader';

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || (selectedContentId ? existingItems.find(i => i.id === parseInt(selectedContentId))?.name : 'Untitled Item') || 'Untitled Item';
    onAdd({
      type: itemType,
      title: finalTitle,
      content_id: selectedContentId ? parseInt(selectedContentId) : null,
      indent
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modules-modal-header">
          <h3>Add Item</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modules-modal-body">
            <div className="modal-field">
              <label>Type</label>
              <select
                value={itemType}
                onChange={(e) => { setItemType(e.target.value); setSelectedContentId(''); setTitle(''); }}
                className="modal-input"
              >
                <option value="Assignment">Assignment</option>
                <option value="Page">Page</option>
                <option value="Discussion">Discussion</option>
                <option value="Quiz">Quiz</option>
                <option value="ExternalUrl">External URL</option>
                <option value="SubHeader">Text Header</option>
              </select>
            </div>

            {needsContentSelector && existingItems.length > 0 && (
              <div className="modal-field">
                <label>Select Existing</label>
                <select
                  value={selectedContentId}
                  onChange={(e) => {
                    setSelectedContentId(e.target.value);
                    if (e.target.value) {
                      const item = existingItems.find(i => i.id === parseInt(e.target.value));
                      if (item) setTitle(item.name);
                    }
                  }}
                  className="modal-input"
                >
                  <option value="">-- Create New --</option>
                  {existingItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-field">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="modal-input"
                placeholder={itemType === 'SubHeader' ? 'Enter header text' : 'Enter item title'}
              />
            </div>

            <div className="modal-field">
              <label>Indent Level</label>
              <select
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value))}
                className="modal-input"
              >
                <option value={0}>0 - No Indent</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
          <div className="modules-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Modules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);

  const modules = state.modules
    .filter(m => m.course_id === cid)
    .sort((a, b) => a.position - b.position);

  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = {};
    modules.forEach(m => { initial[m.id] = true; });
    return initial;
  });

  const [menuOpen, setMenuOpen] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [addItemModuleId, setAddItemModuleId] = useState(null);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const togglePublish = (moduleId) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, published: !m.published } : m
      )
    }));
  };

  const toggleItemPublish = (itemId) => {
    setState(prev => ({
      ...prev,
      moduleItems: prev.moduleItems.map(item =>
        item.id === itemId ? { ...item, published: !item.published } : item
      )
    }));
  };

  const deleteModule = (moduleId) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
      moduleItems: prev.moduleItems.filter(i => i.module_id !== moduleId)
    }));
    setMenuOpen(null);
  };

  const handleAddModule = ({ name, lockUntil }) => {
    const newId = Math.max(0, ...state.modules.map(m => m.id)) + 1;
    const newPos = modules.length + 1;
    setState(prev => ({
      ...prev,
      modules: [...prev.modules, {
        id: newId,
        course_id: cid,
        name,
        position: newPos,
        published: false,
        items_count: 0,
        state: 'unlocked',
        lock_at: lockUntil || null
      }]
    }));
    setExpandedModules(prev => ({ ...prev, [newId]: true }));
  };

  const handleAddItem = (moduleId, { type, title, content_id, indent }) => {
    const items = state.moduleItems.filter(i => i.module_id === moduleId);
    const newItemId = Math.max(0, ...state.moduleItems.map(i => i.id)) + 1;
    setState(prev => ({
      ...prev,
      moduleItems: [...prev.moduleItems, {
        id: newItemId,
        module_id: moduleId,
        title,
        type,
        content_id,
        position: items.length + 1,
        indent,
        published: false,
        external_url: type === 'ExternalUrl' ? '' : undefined
      }]
    }));
  };

  const getAssignment = (id) => state.assignments.find(a => a.id === id);

  const handleItemClick = (item) => {
    if (item.type === 'SubHeader') return;
    if (item.type === 'ExternalUrl') {
      if (item.external_url) window.open(item.external_url, '_blank');
      return;
    }
    const route = getItemRoute(cid, item);
    if (route) navigate(route);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="modules-page">
      <div className="modules-header">
        <h1>Modules</h1>
        <button className="btn btn-success" onClick={() => setShowAddModule(true)}>
          <Plus size={16} /> Module
        </button>
      </div>

      <div className="modules-list">
        {modules.length === 0 && (
          <div className="modules-empty">
            <p>No modules have been defined for this course.</p>
            <p>Click "+ Module" to add one.</p>
          </div>
        )}
        {modules.map(mod => {
          const items = state.moduleItems
            .filter(i => i.module_id === mod.id)
            .sort((a, b) => a.position - b.position);
          const isExpanded = expandedModules[mod.id] !== false;

          return (
            <div key={mod.id} className="module-section">
              <div className="module-header-bar" onClick={() => toggleModule(mod.id)}>
                <div className="module-header-left">
                  <span className="module-drag-handle">
                    <GripVertical size={16} />
                  </span>
                  <span className="module-caret">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                  <span className="module-name">{mod.name}</span>
                </div>
                <div className="module-header-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="module-publish-btn"
                    onClick={() => togglePublish(mod.id)}
                    title={mod.published ? 'Published' : 'Unpublished'}
                  >
                    {mod.published
                      ? <CheckCircle2 size={18} className="published-icon" />
                      : <Circle size={18} className="unpublished-icon" />
                    }
                  </button>
                  <div className="module-menu-wrapper">
                    <button
                      className="module-kebab-btn"
                      onClick={() => setMenuOpen(menuOpen === mod.id ? null : mod.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen === mod.id && (
                      <div className="module-dropdown-menu">
                        <button className="module-dropdown-item" onClick={() => {
                          const newName = prompt('Module name:', mod.name);
                          if (newName && newName.trim()) {
                            setState(prev => ({
                              ...prev,
                              modules: prev.modules.map(m =>
                                m.id === mod.id ? { ...m, name: newName.trim() } : m
                              )
                            }));
                          }
                          setMenuOpen(null);
                        }}>
                          Edit
                        </button>
                        <button className="module-dropdown-item module-dropdown-danger" onClick={() => deleteModule(mod.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="module-items-list">
                  {items.length === 0 && (
                    <div className="module-empty-items">No items in this module.</div>
                  )}
                  {items.map(item => {
                    const Icon = TYPE_ICONS[item.type];
                    const assignment = (item.type === 'Assignment' || item.type === 'Quiz') && item.content_id
                      ? getAssignment(item.content_id)
                      : null;
                    const isSubHeader = item.type === 'SubHeader';

                    return (
                      <div
                        key={item.id}
                        className={`module-item ${isSubHeader ? 'sub-header' : ''}`}
                        style={{ paddingLeft: `${16 + (item.indent || 0) * 20}px` }}
                        onClick={() => handleItemClick(item)}
                      >
                        <span className="item-drag-handle">
                          <GripVertical size={14} />
                        </span>
                        {Icon && (
                          <span className="item-type-icon">
                            <Icon size={16} />
                          </span>
                        )}
                        <span className={`item-title ${isSubHeader ? '' : 'item-link'}`}>
                          {item.title}
                        </span>
                        <div className="item-right">
                          {assignment?.due_at && (
                            <span className="item-due-date">
                              Due {formatDueDate(assignment.due_at)}
                            </span>
                          )}
                          {assignment?.points_possible != null && (
                            <span className="item-points">
                              {assignment.points_possible} pts
                            </span>
                          )}
                          <button
                            className="item-publish-btn"
                            onClick={(e) => { e.stopPropagation(); toggleItemPublish(item.id); }}
                            title={item.published ? 'Published' : 'Unpublished'}
                          >
                            {item.published
                              ? <CheckCircle2 size={16} className="published-icon" />
                              : <Circle size={16} className="unpublished-icon" />
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="module-add-item-row">
                    <button
                      className="module-add-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddItemModuleId(mod.id);
                      }}
                    >
                      <Plus size={14} /> Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModule && (
        <AddModuleModal
          onClose={() => setShowAddModule(false)}
          onAdd={handleAddModule}
        />
      )}

      {addItemModuleId !== null && (
        <AddModuleItemModal
          onClose={() => setAddItemModuleId(null)}
          onAdd={(data) => handleAddItem(addItemModuleId, data)}
          courseId={courseId}
          state={state}
        />
      )}
    </div>
  );
}
