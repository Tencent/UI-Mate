import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Search, CheckCircle2, Circle, MoreVertical,
  ChevronDown, ChevronRight, GripVertical
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Assignments.css';

export default function Assignments() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [menuOpen, setMenuOpen] = useState(null);

  const assignmentGroups = state.assignmentGroups
    .filter(g => g.course_id === cid)
    .sort((a, b) => a.position - b.position);

  const courseAssignments = state.assignments.filter(a => a.course_id === cid);

  const filteredAssignments = searchQuery
    ? courseAssignments.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : courseAssignments;

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleAssignmentPublish = (assignmentId) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(a =>
        a.id === assignmentId
          ? { ...a, published: !a.published, workflow_state: a.published ? 'unpublished' : 'published' }
          : a
      )
    }));
  };

  const deleteAssignment = (assignmentId) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== assignmentId)
    }));
    setMenuOpen(null);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No Due Date';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${months[d.getMonth()]} ${d.getDate()} at ${h}:${m}${ampm}`;
  };

  const totalWeight = assignmentGroups.reduce((sum, g) => sum + (g.weight || 0), 0);

  return (
    <div className="assignments-page">
      <div className="assignments-header">
        <h1>Assignments</h1>
        <div className="assignments-header-actions">
          <button className="btn btn-success" onClick={() => navigate(`/courses/${courseId}/assignments/new`)}>
            <Plus size={16} /> Assignment
          </button>
        </div>
      </div>

      <div className="assignments-toolbar">
        <div className="assignments-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="assignments-search-input"
          />
        </div>
        {totalWeight > 0 && (
          <div className="assignment-weights-info">
            Assignment weights enabled (Total: {totalWeight}%)
          </div>
        )}
      </div>

      <div className="assignment-groups">
        {assignmentGroups.map(group => {
          const groupAssignments = filteredAssignments
            .filter(a => a.assignment_group_id === group.id)
            .sort((a, b) => a.position - b.position);
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="assignment-group">
              <div className="assignment-group-header" onClick={() => toggleGroup(group.id)}>
                <div className="assignment-group-left">
                  <span className="group-drag-handle">
                    <GripVertical size={16} />
                  </span>
                  <span className="group-caret">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </span>
                  <span className="group-name">{group.name}</span>
                  {group.weight > 0 && (
                    <span className="group-weight">{group.weight}% of total</span>
                  )}
                </div>
                <div className="assignment-group-right" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const newId = Math.max(0, ...state.assignments.map(a => a.id)) + 1;
                    setState(prev => ({
                      ...prev,
                      assignments: [...prev.assignments, {
                        id: newId,
                        course_id: cid,
                        assignment_group_id: group.id,
                        name: 'New Assignment',
                        description: '',
                        due_at: null,
                        points_possible: 0,
                        grading_type: 'points',
                        submission_types: ['online_text_entry'],
                        published: false,
                        position: groupAssignments.length + 1,
                        needs_grading_count: 0,
                        workflow_state: 'unpublished'
                      }]
                    }));
                  }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="assignment-group-items">
                  {groupAssignments.length === 0 && (
                    <div className="assignment-group-empty">
                      No assignments in this group.
                    </div>
                  )}
                  {groupAssignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className="assignment-row"
                      onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.id}`)}
                    >
                      <div className="assignment-row-left">
                        <span className="assignment-drag-handle">
                          <GripVertical size={14} />
                        </span>
                        <button
                          className="assignment-publish-toggle"
                          onClick={(e) => { e.stopPropagation(); toggleAssignmentPublish(assignment.id); }}
                          title={assignment.published ? 'Published' : 'Unpublished'}
                        >
                          {assignment.published
                            ? <CheckCircle2 size={18} className="published-icon" />
                            : <Circle size={18} className="unpublished-icon" />
                          }
                        </button>
                        <div className="assignment-info">
                          <span className="assignment-name">{assignment.name}</span>
                          {assignment.needs_grading_count > 0 && (
                            <span className="assignment-needs-grading">
                              {assignment.needs_grading_count} need grading
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="assignment-row-right" onClick={(e) => e.stopPropagation()}>
                        <span className="assignment-due">{formatDueDate(assignment.due_at)}</span>
                        <span className="assignment-points">{assignment.points_possible} pts</span>
                        <div className="assignment-menu-wrapper">
                          <button
                            className="assignment-kebab"
                            onClick={() => setMenuOpen(menuOpen === assignment.id ? null : assignment.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === assignment.id && (
                            <div className="assignment-dropdown-menu">
                              <button
                                className="assignment-dropdown-item"
                                onClick={() => { setMenuOpen(null); navigate(`/courses/${courseId}/assignments/${assignment.id}/edit`); }}
                              >
                                Edit
                              </button>
                              <button
                                className="assignment-dropdown-item assignment-dropdown-danger"
                                onClick={() => deleteAssignment(assignment.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {assignmentGroups.length === 0 && (
          <div className="assignments-empty">
            <p>No assignment groups found for this course.</p>
          </div>
        )}
      </div>
    </div>
  );
}
