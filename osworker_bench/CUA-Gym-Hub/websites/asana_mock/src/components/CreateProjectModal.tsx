
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { X, Check } from 'lucide-react';
import './QuickAddModal.css';

const PROJECT_COLORS = [
  '#F06A6A', '#EA4E9D', '#7AC142', '#4186E0',
  '#FFB900', '#E8384F', '#6A67CE', '#1AAFD0'
];

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const { state, addProject } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(state.teams[0]?.teamId || '');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;

    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      projectId,
      name: name.trim(),
      description: description.trim(),
      teamId,
      ownerId: state.currentUser.userId,
      memberIds: [state.currentUser.userId],
      color,
      icon: `https://api.dicebear.com/7.x/shapes/svg?seed=${projectId}`,
      starred: false,
      archived: false,
      privacy,
      sections: [
        { sectionId: `section-${projectId}-1`, name: 'To Do', collapsed: false },
        { sectionId: `section-${projectId}-2`, name: 'In Progress', collapsed: false },
        { sectionId: `section-${projectId}-3`, name: 'Done', collapsed: false },
      ],
      customFields: [],
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    };

    addProject(newProject);
    onClose();
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Project</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Project name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleCreate(); }}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Team</label>
            <select
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
            >
              {state.teams.map(t => (
                <option key={t.teamId} value={t.teamId}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Color</label>
            <div className="color-picker-row">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-field">
            <label>Privacy</label>
            <div className="privacy-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'public'}
                  onChange={() => setPrivacy('public')}
                />
                <span>Public to team</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                />
                <span>Private to members</span>
              </label>
            </div>
          </div>

          <div className="modal-field">
            <label>Description <span className="optional-label">(optional)</span></label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="modal-primary-btn"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
