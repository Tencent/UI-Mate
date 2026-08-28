import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Target, Plus, Edit2, Trash2, X, Star, Award } from 'lucide-react';
import { formatDate } from '../lib/utils';
import EmptyState from '../components/EmptyState';

const categoryColors = {
  Technical: 'bg-blue-100 text-blue-700',
  Leadership: 'bg-purple-100 text-purple-700',
  Business: 'bg-green-100 text-green-700',
  Personal: 'bg-orange-100 text-orange-700',
};

const statusColors = {
  'On Track': 'bg-green-100 text-green-700',
  'At Risk': 'bg-yellow-100 text-yellow-700',
  'Off Track': 'bg-red-100 text-red-700',
  Completed: 'bg-gray-100 text-gray-600',
  'Not Started': 'bg-gray-100 text-gray-500',
};

const ratingLabels = ['', 'Does Not Meet', 'Partially Meets', 'Meets Expectations', 'Exceeds Expectations', 'Significantly Exceeds'];

function GoalFormModal({ goal, onClose, dispatch }) {
  const [form, setForm] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'Technical',
    status: goal?.status || 'Not Started',
    progress: goal?.progress || 0,
    dueDate: goal?.dueDate || '',
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (goal) {
      dispatch({ type: 'UPDATE_GOAL', payload: { goalId: goal.goalId, ...form } });
    } else {
      dispatch({ type: 'ADD_GOAL', payload: form });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">{goal ? 'Edit Goal' : 'Add Goal'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Goal title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Describe the goal..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Technical">Technical</option>
                <option value="Leadership">Leadership</option>
                <option value="Business">Business</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          {goal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress ({form.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
          {goal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Not Started">Not Started</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Off Track">Off Track</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {goal ? 'Save Changes' : 'Add Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelfReviewModal({ review, onClose, dispatch }) {
  const [comments, setComments] = useState(review.selfReviewComments || '');
  const [rating, setRating] = useState(review.ratingScore || 3);

  const handleSubmit = () => {
    dispatch({
      type: 'SUBMIT_SELF_REVIEW',
      payload: {
        reviewId: review.reviewId,
        selfReviewComments: comments,
        ratingScore: rating,
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Complete Self-Review</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{review.period}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Self-Assessment</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              rows={5}
              placeholder="Describe your accomplishments, challenges, and areas for growth..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Self-Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`flex-1 p-2 rounded-md text-xs font-medium border transition-colors ${
                    rating === n
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{ratingLabels[rating]}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!comments.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            Submit Self-Review
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagerReviewModal({ review, employees, onClose, dispatch }) {
  const [managerComments, setManagerComments] = useState('');
  const [rating, setRating] = useState(3);
  const employee = employees.find(e => e.id === review.employeeId);

  const handleSubmit = () => {
    dispatch({
      type: 'ADD_REVIEW_COMMENT',
      payload: {
        reviewId: review.reviewId,
        managerComments,
        rating: ratingLabels[rating],
        ratingScore: rating,
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Complete Manager Review</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-2">{review.period}</p>
        {employee && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium text-gray-900">{employee.name}</p>
              <p className="text-xs text-gray-500">{employee.title}</p>
            </div>
          </div>
        )}

        {review.selfReviewComments && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Employee Self-Assessment</p>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-100">
              {review.selfReviewComments}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Comments</label>
            <textarea
              value={managerComments}
              onChange={e => setManagerComments(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              rows={4}
              placeholder="Provide your assessment of the employee's performance..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`flex-1 p-2 rounded-md text-xs font-medium border transition-colors ${
                    rating === n
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{ratingLabels[rating]}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!managerComments.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            Complete Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Performance() {
  const { state, dispatch } = useStore();
  const { reviews, goals, currentUser, employees } = state;
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selfReviewTarget, setSelfReviewTarget] = useState(null);
  const [managerReviewTarget, setManagerReviewTarget] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  const myGoals = goals.filter(g => g.employeeId === currentUser.id);
  const myReviews = reviews.filter(r => r.employeeId === currentUser.id);
  const reviewsToGive = reviews.filter(r => r.managerId === currentUser.id && r.status === 'Pending Manager Review');

  const getStarRating = (score) => {
    if (!score) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} className={i <= score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Performance & Talent</h1>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Performance Reviews</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {myReviews.map(review => (
            <div key={review.reviewId} className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{review.period}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    review.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    review.status === 'Pending Self-Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {review.status}
                  </span>
                  {review.rating && (
                    <span className="text-sm text-gray-600">{review.rating}</span>
                  )}
                  {review.ratingScore && getStarRating(review.ratingScore)}
                </div>
              </div>
              {review.status === 'Pending Self-Review' && review.employeeId === currentUser.id && (
                <button
                  onClick={() => setSelfReviewTarget(review)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  Complete Self-Review
                </button>
              )}
            </div>
          ))}

          {/* Manager reviews to complete */}
          {reviewsToGive.map(review => {
            const emp = employees.find(e => e.id === review.employeeId);
            return (
              <div key={review.reviewId} className="p-5 flex items-center justify-between bg-orange-50/30">
                <div className="flex items-center gap-3">
                  {emp && <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full" />}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Review for {emp?.name || 'Employee'}
                    </h3>
                    <p className="text-sm text-gray-500">{review.period}</p>
                  </div>
                </div>
                <button
                  onClick={() => setManagerReviewTarget(review)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  Complete Review
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Target size={18} className="text-primary" />
            Goals
          </h2>
          <button
            onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Goal
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {myGoals.length === 0 ? (
            <EmptyState
              type="goals"
              title="No goals yet"
              description="Create your first goal to start tracking your progress."
            />
          ) : (
            myGoals.map(goal => (
              <div key={goal.goalId} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[goal.category] || 'bg-gray-100 text-gray-600'}`}>
                        {goal.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[goal.status] || 'bg-gray-100 text-gray-500'}`}>
                        {goal.status}
                      </span>
                      {goal.dueDate && (
                        <span className="text-xs text-gray-400">Due: {formatDate(goal.dueDate)}</span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-500 mt-2">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => { setEditingGoal(goal); setShowGoalForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(goal.goalId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-bold text-gray-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        goal.status === 'Completed' ? 'bg-green-500' :
                        goal.status === 'At Risk' ? 'bg-yellow-500' :
                        'bg-primary'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteConfirmId === goal.goalId && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-700">Delete this goal?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { dispatch({ type: 'DELETE_GOAL', payload: goal.goalId }); setDeleteConfirmId(null); }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 bg-white border border-gray-300 text-xs rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-primary" />
            Skills
          </h2>
          <button
            onClick={() => setShowSkillInput(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Skill
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {(currentUser.skills || []).map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium group"
              >
                {skill}
                <button
                  onClick={() => {
                    const updatedSkills = currentUser.skills.filter((_, idx) => idx !== i);
                    dispatch({ type: 'UPDATE_PROFILE', payload: { skills: updatedSkills } });
                  }}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {(!currentUser.skills || currentUser.skills.length === 0) && !showSkillInput && (
              <p className="text-sm text-gray-400">No skills added yet</p>
            )}
          </div>
          {showSkillInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    const updatedSkills = [...(currentUser.skills || []), newSkill.trim()];
                    dispatch({ type: 'UPDATE_PROFILE', payload: { skills: updatedSkills } });
                    setNewSkill('');
                  }
                  if (e.key === 'Escape') {
                    setShowSkillInput(false);
                    setNewSkill('');
                  }
                }}
                autoFocus
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Type a skill and press Enter..."
              />
              <button
                onClick={() => {
                  if (newSkill.trim()) {
                    const updatedSkills = [...(currentUser.skills || []), newSkill.trim()];
                    dispatch({ type: 'UPDATE_PROFILE', payload: { skills: updatedSkills } });
                    setNewSkill('');
                  }
                }}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowSkillInput(false); setNewSkill(''); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Goal form modal */}
      {showGoalForm && (
        <GoalFormModal
          goal={editingGoal}
          onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
          dispatch={dispatch}
        />
      )}

      {/* Self-review modal */}
      {selfReviewTarget && (
        <SelfReviewModal
          review={selfReviewTarget}
          onClose={() => setSelfReviewTarget(null)}
          dispatch={dispatch}
        />
      )}

      {/* Manager review modal */}
      {managerReviewTarget && (
        <ManagerReviewModal
          review={managerReviewTarget}
          employees={employees}
          onClose={() => setManagerReviewTarget(null)}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}
