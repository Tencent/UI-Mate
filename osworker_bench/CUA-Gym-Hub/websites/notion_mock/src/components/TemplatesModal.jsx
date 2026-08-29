import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { generateId } from '../utils/helpers';

const TEMPLATES = [
  {
    id: 'meeting-notes',
    icon: '\u{1F4DD}',
    title: 'Meeting Notes',
    description: 'Track attendees, agenda, and action items',
    blocks: [
      { type: 'heading-1', content: 'Meeting Notes' },
      { type: 'heading-3', content: 'Attendees' },
      { type: 'text', content: '' },
      { type: 'heading-3', content: 'Agenda' },
      { type: 'bullet-list', content: 'Topic 1' },
      { type: 'bullet-list', content: 'Topic 2' },
      { type: 'bullet-list', content: 'Topic 3' },
      { type: 'heading-3', content: 'Action Items' },
      { type: 'todo', content: 'Action item 1', properties: { checked: false } },
      { type: 'todo', content: 'Action item 2', properties: { checked: false } },
      { type: 'todo', content: 'Action item 3', properties: { checked: false } },
    ],
  },
  {
    id: 'project-brief',
    icon: '\u{1F4CB}',
    title: 'Project Brief',
    description: 'Overview, goals, timeline, and resources',
    blocks: [
      { type: 'heading-1', content: 'Project Brief' },
      { type: 'heading-2', content: 'Overview' },
      { type: 'text', content: 'Describe the project and its purpose.' },
      { type: 'heading-2', content: 'Goals' },
      { type: 'bullet-list', content: 'Goal 1' },
      { type: 'bullet-list', content: 'Goal 2' },
      { type: 'bullet-list', content: 'Goal 3' },
      { type: 'heading-2', content: 'Timeline' },
      { type: 'text', content: 'Outline key milestones and deadlines.' },
      { type: 'heading-2', content: 'Resources' },
      { type: 'bullet-list', content: 'Team members' },
      { type: 'bullet-list', content: 'Budget' },
      { type: 'bullet-list', content: 'Tools and infrastructure' },
    ],
  },
  {
    id: 'weekly-planner',
    icon: '\u{1F4C5}',
    title: 'Weekly Planner',
    description: 'Plan your week with daily to-do lists',
    blocks: [
      { type: 'heading-1', content: 'Weekly Planner' },
      { type: 'toggle', content: 'Monday', properties: { collapsed: false } },
      { type: 'todo', content: '', properties: { checked: false } },
      { type: 'toggle', content: 'Tuesday', properties: { collapsed: true } },
      { type: 'toggle', content: 'Wednesday', properties: { collapsed: true } },
      { type: 'toggle', content: 'Thursday', properties: { collapsed: true } },
      { type: 'toggle', content: 'Friday', properties: { collapsed: true } },
      { type: 'toggle', content: 'Saturday', properties: { collapsed: true } },
      { type: 'toggle', content: 'Sunday', properties: { collapsed: true } },
    ],
  },
  {
    id: 'reading-notes',
    icon: '\u{1F4D6}',
    title: 'Reading Notes',
    description: 'Book title, author, summary, and key quotes',
    blocks: [
      { type: 'heading-1', content: 'Reading Notes' },
      { type: 'heading-3', content: 'Book' },
      { type: 'text', content: '' },
      { type: 'heading-3', content: 'Author' },
      { type: 'text', content: '' },
      { type: 'heading-2', content: 'Summary' },
      { type: 'text', content: 'Write a brief summary of the book.' },
      { type: 'heading-2', content: 'Key Quotes' },
      { type: 'quote', content: '' },
      { type: 'quote', content: '' },
      { type: 'heading-2', content: 'My Thoughts' },
      { type: 'text', content: '' },
    ],
  },
  {
    id: 'bug-report',
    icon: '\u{1F41B}',
    title: 'Bug Report',
    description: 'Steps to reproduce, expected vs actual behavior',
    blocks: [
      { type: 'heading-1', content: 'Bug Report' },
      { type: 'callout', content: 'Priority: ', properties: { icon: '\u{26A0}\uFE0F', bgColor: 'red_background' } },
      { type: 'heading-2', content: 'Steps to Reproduce' },
      { type: 'numbered-list', content: 'Step 1' },
      { type: 'numbered-list', content: 'Step 2' },
      { type: 'numbered-list', content: 'Step 3' },
      { type: 'heading-2', content: 'Expected Behavior' },
      { type: 'text', content: '' },
      { type: 'heading-2', content: 'Actual Behavior' },
      { type: 'text', content: '' },
      { type: 'heading-2', content: 'Additional Context' },
      { type: 'text', content: '' },
    ],
  },
];

export const TemplatesModal = ({ onClose }) => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleUseTemplate = (template) => {
    const newPageId = generateId();
    const blockIds = [];
    const blocks = {};

    template.blocks.forEach(blockDef => {
      const blockId = generateId();
      blocks[blockId] = {
        id: blockId,
        type: blockDef.type,
        content: blockDef.content || '',
        properties: blockDef.properties || {},
        createdDate: new Date().toISOString(),
      };
      blockIds.push(blockId);
    });

    const newPage = {
      id: newPageId,
      title: template.title,
      icon: template.icon,
      cover: null,
      parentId: null,
      blockIds,
      favorite: false,
      createdDate: new Date().toISOString(),
      properties: {},
    };

    // Build new state with page + blocks added
    const newState = {
      ...state,
      pages: { ...state.pages, [newPageId]: newPage },
      blocks: { ...state.blocks, ...blocks },
      pageOrder: [...(state.pageOrder || []), newPageId],
    };

    dispatch({ type: 'RESET_STATE', payload: newState });
    navigate(`/page/${newPageId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={ref} className="bg-white rounded-xl shadow-2xl w-[640px] max-h-[80vh] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold">Templates</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map(template => (
              <div key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </div>
                <button
                  className="mt-3 w-full text-xs bg-gray-100 text-gray-700 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600"
                  onClick={() => handleUseTemplate(template)}>
                  Use this template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
