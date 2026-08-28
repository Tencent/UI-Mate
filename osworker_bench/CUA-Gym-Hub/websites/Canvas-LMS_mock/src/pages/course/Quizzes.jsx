import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle2, Circle, MoreVertical, HelpCircle, Clock, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Quizzes.css';

export default function Quizzes() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewQuiz, setPreviewQuiz] = useState(null);

  const quizAssignments = useMemo(() => {
    return state.assignments
      .filter(a => a.course_id === cid && a.submission_types?.includes('online_quiz'))
      .sort((a, b) => a.position - b.position);
  }, [state.assignments, cid]);

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizAssignments;
    const q = searchQuery.toLowerCase();
    return quizAssignments.filter(a => a.name.toLowerCase().includes(q));
  }, [quizAssignments, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${months[d.getMonth()]} ${d.getDate()} at ${h}:${m}${ampm}`;
  };

  const getSubmissionCount = (assignmentId) => {
    return state.submissions.filter(s => s.assignment_id === assignmentId && s.workflow_state !== 'unsubmitted').length;
  };

  const getEnrolledStudentCount = () => {
    return state.enrollments.filter(
      e => e.course_id === cid && e.type === 'StudentEnrollment' && e.enrollment_state === 'active'
    ).length;
  };

  const togglePublish = (quizId) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(a =>
        a.id === quizId
          ? { ...a, published: !a.published, workflow_state: a.published ? 'unpublished' : 'published' }
          : a
      )
    }));
  };

  // Mock quiz questions for preview
  const quizQuestions = {
    6: [ // Quiz 1: Python Basics
      { id: 1, type: 'multiple_choice', text: 'Which of the following is a valid Python variable name?', points: 5,
        options: ['2var', 'my-var', '_myVar', 'class'], correct: 2 },
      { id: 2, type: 'multiple_choice', text: 'What is the output of print(type(3.14))?', points: 5,
        options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"], correct: 1 },
      { id: 3, type: 'true_false', text: 'Python is a statically typed language.', points: 5, correct: false },
      { id: 4, type: 'multiple_choice', text: 'Which operator is used for integer division in Python?', points: 5,
        options: ['/', '//', '%', '**'], correct: 1 },
      { id: 5, type: 'short_answer', text: 'What built-in function is used to get input from the user in Python?', points: 5, correct: 'input' },
      { id: 6, type: 'multiple_choice', text: 'What does the len() function return for the string "Hello"?', points: 5,
        options: ['4', '5', '6', 'Error'], correct: 1 },
      { id: 7, type: 'true_false', text: 'Strings in Python are mutable.', points: 5, correct: false },
      { id: 8, type: 'multiple_choice', text: 'Which of the following creates a list in Python?', points: 5,
        options: ['(1, 2, 3)', '[1, 2, 3]', '{1, 2, 3}', '<1, 2, 3>'], correct: 1 },
      { id: 9, type: 'short_answer', text: 'What keyword is used to define a function in Python?', points: 5, correct: 'def' },
      { id: 10, type: 'multiple_choice', text: 'What is the output of print(2 ** 3)?', points: 5,
        options: ['5', '6', '8', '9'], correct: 2 },
    ],
    7: [ // Quiz 2: Control Structures
      { id: 1, type: 'multiple_choice', text: 'Which keyword starts a conditional statement in Python?', points: 5,
        options: ['switch', 'if', 'case', 'when'], correct: 1 },
      { id: 2, type: 'multiple_choice', text: 'What is the correct syntax for a for loop iterating over a range of 5?', points: 5,
        options: ['for i in range(5):', 'for (i=0; i<5; i++):', 'for i to 5:', 'foreach i in 5:'], correct: 0 },
      { id: 3, type: 'true_false', text: 'A while loop always executes at least once.', points: 5, correct: false },
      { id: 4, type: 'multiple_choice', text: 'What does the "break" statement do?', points: 5,
        options: ['Skips to next iteration', 'Exits the loop', 'Pauses the loop', 'Restarts the loop'], correct: 1 },
      { id: 5, type: 'short_answer', text: 'What keyword is used to skip the rest of the current iteration and continue with the next?', points: 5, correct: 'continue' },
      { id: 6, type: 'multiple_choice', text: 'What is the result of: True and False?', points: 5,
        options: ['True', 'False', 'None', 'Error'], correct: 1 },
      { id: 7, type: 'true_false', text: 'The elif keyword is used for else-if conditions in Python.', points: 5, correct: true },
      { id: 8, type: 'multiple_choice', text: 'How many times will this loop execute? for i in range(2, 10, 3):', points: 5,
        options: ['2', '3', '4', '8'], correct: 1 },
      { id: 9, type: 'short_answer', text: 'What value does range(5) start from by default?', points: 5, correct: '0' },
      { id: 10, type: 'multiple_choice', text: 'What is the output of: not (True or False)?', points: 5,
        options: ['True', 'False', 'None', 'Error'], correct: 1 },
    ]
  };

  const handlePreview = (quiz) => {
    const questions = quizQuestions[quiz.id] || [];
    setPreviewQuiz({ ...quiz, questions });
  };

  return (
    <div className="quizzes-page">
      <div className="quizzes-header">
        <h1>Quizzes</h1>
        <button className="btn btn-primary">
          <Plus size={16} /> Quiz
        </button>
      </div>

      <div className="quizzes-toolbar">
        <div className="quizzes-search">
          <Search size={14} className="quizzes-search-icon" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="quizzes-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="quizzes-list">
        {filteredQuizzes.map(quiz => (
          <div key={quiz.id} className="quiz-item">
            <button
              className="quiz-publish-btn"
              onClick={() => togglePublish(quiz.id)}
              title={quiz.published ? 'Published' : 'Unpublished'}
            >
              {quiz.published
                ? <CheckCircle2 size={18} className="published-icon" />
                : <Circle size={18} className="unpublished-icon" />
              }
            </button>
            <div className="quiz-icon">
              <HelpCircle size={20} />
            </div>
            <div className="quiz-info">
              <div className="quiz-name" onClick={() => handlePreview(quiz)}>{quiz.name}</div>
              <div className="quiz-meta">
                <span><Clock size={12} /> Due {formatDate(quiz.due_at)}</span>
                <span>{quiz.points_possible} pts</span>
                <span>{quiz.questions_count || (quizQuestions[quiz.id]?.length || 10)} Questions</span>
                <span><Users size={12} /> {getSubmissionCount(quiz.id)}/{getEnrolledStudentCount()} submitted</span>
              </div>
            </div>
            <div className="quiz-status">
              {quiz.published ? (
                <span className="status-pill status-published">Published</span>
              ) : (
                <span className="status-pill status-unpublished">Unpublished</span>
              )}
            </div>
          </div>
        ))}
        {filteredQuizzes.length === 0 && (
          <div className="quizzes-empty">No quizzes found.</div>
        )}
      </div>

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <QuizPreview
          quiz={previewQuiz}
          onClose={() => setPreviewQuiz(null)}
        />
      )}
    </div>
  );
}

function QuizPreview({ quiz, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (qId, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getScore = () => {
    let earned = 0;
    quiz.questions.forEach(q => {
      const ans = answers[q.id];
      if (q.type === 'multiple_choice' && ans === q.correct) earned += q.points;
      if (q.type === 'true_false' && ans === q.correct) earned += q.points;
      if (q.type === 'short_answer' && ans?.trim().toLowerCase() === q.correct.toLowerCase()) earned += q.points;
    });
    return earned;
  };

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="quiz-preview-overlay" onClick={onClose}>
      <div className="quiz-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="quiz-preview-header">
          <div>
            <h2>{quiz.name}</h2>
            <div className="quiz-preview-info">
              {quiz.questions.length} Questions &middot; {totalPoints} Points
              {quiz.due_at && <> &middot; Due {new Date(quiz.due_at).toLocaleDateString()}</>}
            </div>
          </div>
          <button className="quiz-preview-close" onClick={onClose}>&times;</button>
        </div>

        {submitted && (
          <div className="quiz-score-banner">
            Score: {getScore()} / {totalPoints} ({Math.round(getScore() / totalPoints * 100)}%)
          </div>
        )}

        <div className="quiz-preview-body">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className={`quiz-question ${submitted ? (isCorrect(q, answers[q.id]) ? 'correct' : 'incorrect') : ''}`}>
              <div className="quiz-question-header">
                <span className="quiz-question-num">Question {idx + 1}</span>
                <span className="quiz-question-pts">{q.points} pts</span>
              </div>
              <div className="quiz-question-text">{q.text}</div>

              {q.type === 'multiple_choice' && (
                <div className="quiz-options">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`quiz-option ${submitted && i === q.correct ? 'correct-answer' : ''} ${submitted && answers[q.id] === i && i !== q.correct ? 'wrong-answer' : ''}`}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={answers[q.id] === i}
                        onChange={() => setAnswer(q.id, i)}
                        disabled={submitted}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="quiz-options">
                  {[true, false].map(val => (
                    <label key={String(val)} className={`quiz-option ${submitted && val === q.correct ? 'correct-answer' : ''} ${submitted && answers[q.id] === val && val !== q.correct ? 'wrong-answer' : ''}`}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={answers[q.id] === val}
                        onChange={() => setAnswer(q.id, val)}
                        disabled={submitted}
                      />
                      <span>{val ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <div className="quiz-short-answer">
                  <input
                    type="text"
                    className="quiz-text-input"
                    placeholder="Type your answer..."
                    value={answers[q.id] || ''}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    disabled={submitted}
                  />
                  {submitted && (
                    <div className="quiz-correct-text">Correct answer: {q.correct}</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {quiz.questions.length === 0 && (
            <div className="quizzes-empty">No questions available for preview.</div>
          )}
        </div>

        <div className="quiz-preview-footer">
          {!submitted ? (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={Object.keys(answers).length === 0}>
              Submit Quiz
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function isCorrect(question, answer) {
  if (answer === undefined || answer === null) return false;
  if (question.type === 'multiple_choice') return answer === question.correct;
  if (question.type === 'true_false') return answer === question.correct;
  if (question.type === 'short_answer') return answer?.trim().toLowerCase() === question.correct.toLowerCase();
  return false;
}
