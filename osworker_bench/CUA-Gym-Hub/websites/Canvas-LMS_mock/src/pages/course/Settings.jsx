import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Settings.css';

const DEFAULT_NAV_ITEMS = [
  'Home', 'Announcements', 'Assignments', 'Discussions', 'Grades',
  'People', 'Pages', 'Files', 'Syllabus', 'Modules'
];

const HIDDEN_NAV_ITEMS = ['Outcomes', 'Quizzes', 'Settings'];

export default function Settings() {
  const { courseId } = useParams();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const course = state.courses.find(c => c.id === cid);

  const [activeTab, setActiveTab] = useState('details');
  const [name, setName] = useState(course?.name || '');
  const [courseCode, setCourseCode] = useState(course?.course_code || '');
  const [defaultView, setDefaultView] = useState(course?.default_view || 'modules');
  const [startDate, setStartDate] = useState(course?.start_at?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(course?.end_at?.split('T')[0] || '');

  const [shownItems, setShownItems] = useState(DEFAULT_NAV_ITEMS);
  const [hiddenItems, setHiddenItems] = useState(HIDDEN_NAV_ITEMS);

  const handleSaveCourseDetails = () => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === cid
          ? {
              ...c,
              name: name.trim() || c.name,
              course_code: courseCode.trim() || c.course_code,
              default_view: defaultView,
              start_at: startDate ? `${startDate}T00:00:00Z` : c.start_at,
              end_at: endDate ? `${endDate}T00:00:00Z` : c.end_at
            }
          : c
      )
    }));
  };

  const moveToHidden = (item) => {
    setShownItems(prev => prev.filter(i => i !== item));
    setHiddenItems(prev => [...prev, item]);
  };

  const moveToShown = (item) => {
    setHiddenItems(prev => prev.filter(i => i !== item));
    setShownItems(prev => [...prev, item]);
  };

  const handleSaveNav = () => {
    // Save to state
    setState(prev => ({
      ...prev,
      activeCourseNav: {
        ...prev.activeCourseNav,
        [cid]: { shown: shownItems, hidden: hiddenItems }
      }
    }));
  };

  const tabs = [
    { id: 'details', label: 'Course Details' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'features', label: 'Feature Options' }
  ];

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="settings-section">
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input type="text" className="form-input" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Default View</label>
              <select className="form-input" value={defaultView} onChange={e => setDefaultView(e.target.value)}>
                <option value="modules">Modules</option>
                <option value="assignments">Assignments</option>
                <option value="syllabus">Syllabus</option>
                <option value="feed">Activity Feed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time Zone</label>
              <select className="form-input" defaultValue="America/New_York">
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSaveCourseDetails}>Update Course Details</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'navigation' && (
        <div className="settings-section">
          <p className="settings-nav-desc">Drag and drop items to reorder. Items in the "Hidden" section will not be visible to students.</p>
          <div className="settings-nav-columns">
            <div className="settings-nav-col">
              <h3>Shown</h3>
              <div className="settings-nav-list">
                {shownItems.map(item => (
                  <div key={item} className="settings-nav-item">
                    <GripVertical size={14} className="settings-nav-grip" />
                    <span>{item}</span>
                    <button className="settings-nav-hide" onClick={() => moveToHidden(item)} title="Hide">
                      <EyeOff size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="settings-nav-col">
              <h3>Hidden</h3>
              <div className="settings-nav-list settings-nav-hidden">
                {hiddenItems.map(item => (
                  <div key={item} className="settings-nav-item">
                    <GripVertical size={14} className="settings-nav-grip" />
                    <span>{item}</span>
                    <button className="settings-nav-show" onClick={() => moveToShown(item)} title="Show">
                      <Eye size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSaveNav}>Save</button>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="settings-section">
          <div className="settings-features">
            {[
              { name: 'New Gradebook', desc: 'Enable the redesigned gradebook view', enabled: true },
              { name: 'Student Annotation', desc: 'Allow students to annotate submissions', enabled: false },
              { name: 'Anonymous Grading', desc: 'Hide student names during grading', enabled: false },
              { name: 'Peer Review', desc: 'Enable peer review assignments', enabled: true },
              { name: 'MasteryPaths', desc: 'Enable conditional release of content', enabled: false },
              { name: 'New Rich Content Editor', desc: 'Use the updated content editor', enabled: true }
            ].map(feature => (
              <div key={feature.name} className="settings-feature-item">
                <div className="settings-feature-info">
                  <div className="settings-feature-name">{feature.name}</div>
                  <div className="settings-feature-desc">{feature.desc}</div>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked={feature.enabled} />
                  <span className="settings-toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
