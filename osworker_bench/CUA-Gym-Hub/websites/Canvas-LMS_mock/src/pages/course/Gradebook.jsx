import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Search, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import GradebookSettings from './GradebookSettings';
import './Gradebook.css';

function getLetterGrade(pct) {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 60) return 'D';
  return 'F';
}

export default function Gradebook() {
  const { courseId } = useParams();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Get enrolled students
  const students = useMemo(() => {
    const studentEnrollments = state.enrollments.filter(
      e => e.course_id === cid && e.type === 'StudentEnrollment' && e.enrollment_state === 'active'
    );
    return studentEnrollments
      .map(e => state.users.find(u => u.id === e.user_id))
      .filter(Boolean)
      .sort((a, b) => a.sortable_name.localeCompare(b.sortable_name));
  }, [state.enrollments, state.users, cid]);

  // Get course assignments (published only)
  const assignments = useMemo(() => {
    return state.assignments
      .filter(a => a.course_id === cid && a.published)
      .sort((a, b) => {
        if (a.assignment_group_id !== b.assignment_group_id) return a.assignment_group_id - b.assignment_group_id;
        return a.position - b.position;
      });
  }, [state.assignments, cid]);

  // Get submission for a student and assignment
  const getSubmission = (userId, assignmentId) => {
    return state.submissions.find(s => s.user_id === userId && s.assignment_id === assignmentId);
  };

  // Calculate total grade for a student
  const calculateTotal = (userId) => {
    let totalEarned = 0;
    let totalPossible = 0;
    assignments.forEach(a => {
      const sub = getSubmission(userId, a.id);
      if (sub && sub.score !== null && sub.score !== undefined && !sub.excused) {
        totalEarned += sub.score;
        totalPossible += a.points_possible;
      } else if (sub && sub.excused) {
        // Skip excused
      } else if (sub && sub.workflow_state !== 'unsubmitted') {
        // Submitted but not graded, don't count
      }
    });
    if (totalPossible === 0) return null;
    return (totalEarned / totalPossible) * 100;
  };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(q));
  }, [students, searchQuery]);

  const handleCellClick = (userId, assignmentId, currentScore) => {
    setEditingCell({ userId, assignmentId });
    setEditValue(currentScore !== null && currentScore !== undefined ? String(currentScore) : '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    const { userId, assignmentId } = editingCell;
    const assignment = assignments.find(a => a.id === assignmentId);
    const newScore = editValue.trim() === '' ? null : parseFloat(editValue);

    setState(prev => {
      const existingSub = prev.submissions.find(s => s.user_id === userId && s.assignment_id === assignmentId);
      if (existingSub) {
        return {
          ...prev,
          submissions: prev.submissions.map(s =>
            s.user_id === userId && s.assignment_id === assignmentId
              ? {
                  ...s,
                  score: newScore,
                  grade: newScore !== null ? String(newScore) : null,
                  workflow_state: newScore !== null ? 'graded' : s.workflow_state,
                  graded_at: newScore !== null ? new Date().toISOString() : s.graded_at
                }
              : s
          )
        };
      } else if (newScore !== null) {
        return {
          ...prev,
          submissions: [
            ...prev.submissions,
            {
              id: Math.max(0, ...prev.submissions.map(s => s.id)) + 1,
              assignment_id: assignmentId,
              user_id: userId,
              score: newScore,
              grade: String(newScore),
              submitted_at: new Date().toISOString(),
              graded_at: new Date().toISOString(),
              workflow_state: 'graded',
              submission_type: 'online_upload',
              late: false,
              missing: false,
              excused: false,
              attempt: 1,
              body: null
            }
          ]
        };
      }
      return prev;
    });
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellSave();
    }
  };

  const getCellClassName = (sub) => {
    if (!sub) return 'gb-cell';
    if (sub.excused) return 'gb-cell gb-cell-excused';
    if (sub.late) return 'gb-cell gb-cell-late';
    return 'gb-cell';
  };

  const getCellDisplay = (sub) => {
    if (!sub) return '\u2013';
    if (sub.excused) return 'EX';
    if (sub.score !== null && sub.score !== undefined) return sub.score;
    if (sub.workflow_state === 'submitted') return '\u2013';
    return '\u2013';
  };

  return (
    <div className="gradebook-page">
      <div className="gradebook-header">
        <div className="gradebook-header-left">
          <h1>Gradebook</h1>
          <div className="gradebook-dropdowns">
            <button className="gb-dropdown-btn">
              Gradebook <ChevronDown size={14} />
            </button>
            <button className="gb-dropdown-btn">
              View <ChevronDown size={14} />
            </button>
            <button className="gb-dropdown-btn">
              Actions <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <div className="gradebook-header-right">
          <div className="gb-search">
            <Search size={14} className="gb-search-icon" />
            <input
              type="text"
              placeholder="Search Students"
              className="gb-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(true)}>
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div className="gradebook-table-wrapper">
        <table className="gradebook-table">
          <thead>
            <tr>
              <th className="gb-th-student">Student Name</th>
              <th className="gb-th-total">Total</th>
              {assignments.map(a => (
                <th key={a.id} className="gb-th-assignment">
                  <div className="gb-th-assignment-name" title={a.name}>{a.name}</div>
                  <div className="gb-th-assignment-pts">Out of {a.points_possible}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const total = calculateTotal(student.id);
              return (
                <tr key={student.id}>
                  <td className="gb-td-student">
                    <div className="gb-student-name">{student.sortable_name}</div>
                  </td>
                  <td className="gb-td-total">
                    {total !== null ? (
                      <>
                        <span className="gb-total-pct">{total.toFixed(2)}%</span>
                        <span className="gb-total-letter">{getLetterGrade(total)}</span>
                      </>
                    ) : (
                      <span className="gb-total-na">\u2013</span>
                    )}
                  </td>
                  {assignments.map(a => {
                    const sub = getSubmission(student.id, a.id);
                    const isEditing = editingCell && editingCell.userId === student.id && editingCell.assignmentId === a.id;
                    return (
                      <td
                        key={a.id}
                        className={getCellClassName(sub)}
                        onClick={() => !isEditing && handleCellClick(student.id, a.id, sub?.score)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            className="gb-cell-input"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={handleCellKeyDown}
                            autoFocus
                          />
                        ) : (
                          <span className="gb-cell-value">{getCellDisplay(sub)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSettings && (
        <GradebookSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
