import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '../extensions/FontSize';
import { MessageSquare, Share2, Star, ArrowLeft } from 'lucide-react';
import { useDocsContext } from '../context/DocsContext';
import Editor from '../components/Editor';
import Toolbar from '../components/Toolbar';
import MenuBar from '../components/MenuBar';
import CommentsSidebar from '../components/CommentsSidebar';
import ShareDialog from '../components/ShareDialog';
import FindReplaceBar from '../components/FindReplaceBar';

const PANEL_TITLES = {
  emailDraft: 'Email draft',
  move: 'Move document',
  versionHistory: 'Version history',
  pageSetup: 'Page setup',
  imageSearch: 'Image search',
  specialCharacters: 'Special characters',
  columns: 'Columns',
  dictionary: 'Dictionary',
  translate: 'Translate document',
  preferences: 'Preferences',
  accessibility: 'Accessibility',
  menuSearch: 'Search menus',
  helpCenter: 'Help',
  training: 'Training',
  updates: 'Updates',
  keyboardShortcuts: 'Keyboard shortcuts',
  reportProblem: 'Report a problem',
  reportAbuse: 'Report abuse or copyright',
  suggestedEdits: 'Suggested edits',
  compareDocuments: 'Compare documents',
  documentCheck: 'Document check'
};

function LocalActionPanel({ panel, doc, state, editor, onSubmit, onClose }) {
  const [email, setEmail] = useState(panel.type === 'emailDraft' && panel.payload === 'collaborators'
    ? doc.sharedWith
        .map(s => state.users.find(u => u.id === s.userId)?.email)
        .filter(Boolean)
        .join(', ')
    : '');
  const [subject, setSubject] = useState(`${doc.title}`);
  const [message, setMessage] = useState(`Sharing "${doc.title}" from the local Docs sandbox.`);
  const [folder, setFolder] = useState(doc.folder || 'My Drive');
  const [pageSize, setPageSize] = useState(doc.pageSetup?.pageSize || 'Letter');
  const [orientation, setOrientation] = useState(doc.pageSetup?.orientation || 'Portrait');
  const [margins, setMargins] = useState(doc.pageSetup?.margins || 'Normal');
  const [columns, setColumns] = useState(doc.formatPrefs?.columns || 1);
  const [query, setQuery] = useState('');
  const [report, setReport] = useState('');

  const title = PANEL_TITLES[panel.type] || 'Document action';
  const imageOptions = [
    { label: 'Workspace chart', src: 'https://picsum.photos/800/450?random=docs-chart' },
    { label: 'Project board', src: 'https://picsum.photos/800/450?random=docs-board' },
    { label: 'Team notes', src: 'https://picsum.photos/800/450?random=docs-notes' }
  ];
  const characters = ['©', '™', '✓', '→', '≤', '≥', '÷', '§', '•', '°'];

  const submitEmail = () => onSubmit('emailDraft', { email, subject, message });
  const submitMove = () => onSubmit('move', { folder });
  const submitPageSetup = () => onSubmit('pageSetup', { pageSize, orientation, margins });
  const submitColumns = () => onSubmit('columns', { columns });
  const submitReport = () => onSubmit(panel.type, { report: report || title });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">×</button>
        </div>
        <div className="p-5 space-y-4 text-sm text-gray-700">
          {panel.type === 'emailDraft' && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Recipients</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Subject</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Message</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
              </label>
              <button onClick={submitEmail} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save draft</button>
            </>
          )}

          {panel.type === 'move' && (
            <>
              <p>Choose a local folder label for this document.</p>
              <select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                {['My Drive', 'Shared with me', 'Project files', 'Archive'].map(item => <option key={item}>{item}</option>)}
              </select>
              <button onClick={submitMove} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Move</button>
            </>
          )}

          {panel.type === 'versionHistory' && (
            <div className="space-y-2">
              <div className="p-3 rounded border border-blue-200 bg-blue-50">Current draft saved {new Date(doc.updated).toLocaleString()}</div>
              {(doc.versions || []).map(version => (
                <div key={version.id} className="p-3 rounded border border-gray-200">
                  <div className="font-medium">{version.name}</div>
                  <div className="text-xs text-gray-500">{new Date(version.created).toLocaleString()}</div>
                </div>
              ))}
              {(doc.versions || []).length === 0 && <p>No named versions yet.</p>}
            </div>
          )}

          {panel.type === 'pageSetup' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <label><span className="text-xs text-gray-500">Page size</span><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="mt-1 w-full border rounded px-2 py-2"><option>Letter</option><option>A4</option><option>Legal</option></select></label>
                <label><span className="text-xs text-gray-500">Orientation</span><select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="mt-1 w-full border rounded px-2 py-2"><option>Portrait</option><option>Landscape</option></select></label>
                <label><span className="text-xs text-gray-500">Margins</span><select value={margins} onChange={(e) => setMargins(e.target.value)} className="mt-1 w-full border rounded px-2 py-2"><option>Normal</option><option>Narrow</option><option>Wide</option></select></label>
              </div>
              <button onClick={submitPageSetup} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
            </>
          )}

          {panel.type === 'imageSearch' && (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search local image library" className="w-full border border-gray-300 rounded px-3 py-2" />
              <div className="grid grid-cols-3 gap-3">
                {imageOptions.map(option => (
                  <button key={option.src} onClick={() => onSubmit('imageSearch', option)} className="rounded border border-gray-200 overflow-hidden text-left hover:border-blue-400">
                    <img src={option.src} alt="" className="h-20 w-full object-cover" />
                    <span className="block px-2 py-1 text-xs">{query ? `${option.label}: ${query}` : option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {panel.type === 'specialCharacters' && (
            <div className="grid grid-cols-5 gap-2">
              {characters.map(char => <button key={char} onClick={() => onSubmit('specialCharacters', { char })} className="border border-gray-300 rounded py-2 text-lg hover:bg-gray-50">{char}</button>)}
            </div>
          )}

          {panel.type === 'columns' && (
            <>
              <div className="flex gap-2">
                {[1, 2, 3].map(count => <button key={count} onClick={() => setColumns(count)} className={`flex-1 border rounded py-3 ${columns === count ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>{count}</button>)}
              </div>
              <button onClick={submitColumns} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply columns</button>
            </>
          )}

          {['dictionary', 'translate', 'preferences', 'accessibility', 'menuSearch', 'helpCenter', 'training', 'updates', 'keyboardShortcuts', 'suggestedEdits', 'compareDocuments', 'documentCheck'].includes(panel.type) && (
            <div className="space-y-3">
              <p>{panel.message || 'This local sandbox panel records the action and keeps the document workflow available.'}</p>
              <button onClick={() => onSubmit(panel.type, { query: query || panel.type })} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Done</button>
            </div>
          )}

          {['reportProblem', 'reportAbuse'].includes(panel.type) && (
            <>
              <textarea value={report} onChange={(e) => setReport(e.target.value)} rows={4} placeholder="Describe the issue" className="w-full border border-gray-300 rounded px-3 py-2" />
              <button onClick={submitReport} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit report</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentEditor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useDocsContext();
  const doc = state.documents[docId];

  const [titleValue, setTitleValue] = useState(doc?.title || 'Untitled Document');
  const [localPanel, setLocalPanel] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      FontFamily,
      FontSize,
    ],
    content: doc?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      dispatch({
        type: 'UPDATE_DOC',
        payload: { docId, content: html }
      });
    },
  });

  useEffect(() => {
    if (doc) {
      setTitleValue(doc.title);
    }
  }, [doc?.title]);

  // Sync editor content when navigating between documents
  useEffect(() => {
    if (editor && doc) {
      const currentContent = editor.getHTML();
      if (currentContent !== doc.content) {
        editor.commands.setContent(doc.content || '');
      }
    }
  }, [docId]);

  useEffect(() => {
    dispatch({ type: 'SET_UI', payload: { currentDocId: docId } });
    return () => {
      dispatch({ type: 'SET_UI', payload: { currentDocId: null } });
    };
  }, [docId, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+H or Ctrl+F → open Find & Replace
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'f')) {
        e.preventDefault();
        dispatch({ type: 'SET_UI', payload: { findReplaceOpen: true } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleTitleChange = useCallback((e) => {
    setTitleValue(e.target.value);
  }, []);

  const handleTitleBlur = useCallback(() => {
    const newTitle = titleValue.trim() || 'Untitled Document';
    dispatch({
      type: 'RENAME_DOC',
      payload: { docId, title: newTitle }
    });
  }, [titleValue, docId, dispatch]);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  const handleMenuAction = useCallback((actionName, payload) => {
    switch (actionName) {
      case 'newDocument': {
        const newId = 'doc-' + Date.now();
        dispatch({ type: 'CREATE_DOC', payload: { id: newId, title: 'Untitled Document' } });
        navigate('/document/' + newId);
        break;
      }
      case 'openDocument':
        navigate('/');
        break;
      case 'copyDocument': {
        if (!doc) break;
        const copyId = 'doc-' + Date.now();
        dispatch({
          type: 'CREATE_DOC',
          payload: { id: copyId, title: `Copy of ${doc.title}` }
        });
        dispatch({
          type: 'UPDATE_DOC',
          payload: { docId: copyId, content: doc.content }
        });
        navigate('/document/' + copyId);
        break;
      }
      case 'share':
        dispatch({ type: 'SET_UI', payload: { shareDialogOpen: true } });
        break;
      case 'rename': {
        const nameInput = document.querySelector('.doc-title-input');
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }
        break;
      }
      case 'delete':
        dispatch({ type: 'DELETE_DOC', payload: { docId } });
        navigate('/');
        break;
      case 'findReplace':
        dispatch({ type: 'SET_UI', payload: { findReplaceOpen: !state.ui.findReplaceOpen } });
        break;
      case 'setViewMode':
        dispatch({ type: 'SET_UI', payload: { viewMode: payload } });
        break;
      case 'emailDraft':
      case 'move':
      case 'versionHistory':
      case 'pageSetup':
      case 'imageSearch':
      case 'specialCharacters':
      case 'columns':
      case 'dictionary':
      case 'translate':
      case 'preferences':
      case 'accessibility':
      case 'menuSearch':
      case 'helpCenter':
      case 'training':
      case 'updates':
      case 'keyboardShortcuts':
      case 'reportProblem':
      case 'reportAbuse':
      case 'suggestedEdits':
      case 'compareDocuments':
        setLocalPanel({ type: actionName, payload });
        break;
      case 'nameVersion': {
        const version = {
          id: `version-${Date.now()}`,
          name: `Named version ${(doc.versions || []).length + 1}`,
          created: new Date().toISOString(),
          content: editor?.getHTML() || doc.content
        };
        dispatch({ type: 'UPDATE_DOC', payload: { docId, versions: [...(doc.versions || []), version] } });
        break;
      }
      case 'toggleUiFlag':
        dispatch({ type: 'SET_UI', payload: { [payload]: !state.ui[payload] } });
        break;
      case 'sectionText': {
        const sections = { ...(doc.sections || {}), [payload]: `${payload === 'header' ? 'Header' : 'Footer'} for ${doc.title}` };
        dispatch({ type: 'UPDATE_DOC', payload: { docId, sections } });
        editor?.chain().focus().insertContent(`<p>${sections[payload]}</p>`).run();
        break;
      }
      case 'formatPreference':
        dispatch({ type: 'UPDATE_DOC', payload: { docId, formatPrefs: { ...(doc.formatPrefs || {}), ...payload } } });
        break;
      case 'documentCheck': {
        const documentChecks = { ...(doc.documentChecks || {}), [payload]: { status: 'complete', issues: 0, checkedAt: new Date().toISOString() } };
        dispatch({ type: 'UPDATE_DOC', payload: { docId, documentChecks } });
        setLocalPanel({ type: 'documentCheck', message: `${payload} check complete: no issues found.` });
        break;
      }
      default:
        break;
    }
  }, [doc, docId, dispatch, editor, navigate, state.ui]);

  const handlePanelSubmit = useCallback((actionName, payload = {}) => {
    if (!doc) return;
    if (actionName === 'emailDraft') {
      const emailDrafts = [...(doc.emailDrafts || []), { id: `draft-${Date.now()}`, ...payload, created: new Date().toISOString() }];
      dispatch({ type: 'UPDATE_DOC', payload: { docId, emailDrafts } });
    } else if (actionName === 'move') {
      dispatch({ type: 'UPDATE_DOC', payload: { docId, folder: payload.folder } });
    } else if (actionName === 'pageSetup') {
      dispatch({ type: 'UPDATE_DOC', payload: { docId, pageSetup: payload } });
    } else if (actionName === 'imageSearch') {
      editor?.chain().focus().setImage({ src: payload.src }).run();
    } else if (actionName === 'specialCharacters') {
      editor?.chain().focus().insertContent(payload.char).run();
    } else if (actionName === 'columns') {
      dispatch({ type: 'UPDATE_DOC', payload: { docId, formatPrefs: { ...(doc.formatPrefs || {}), columns: payload.columns } } });
    } else if (actionName === 'reportProblem' || actionName === 'reportAbuse') {
      const reports = [...(doc.reports || []), { id: `report-${Date.now()}`, type: actionName, content: payload.report, created: new Date().toISOString() }];
      dispatch({ type: 'UPDATE_DOC', payload: { docId, reports } });
    } else {
      const localActions = [...(doc.localActions || []), { id: `action-${Date.now()}`, type: actionName, payload, created: new Date().toISOString() }];
      dispatch({ type: 'UPDATE_DOC', payload: { docId, localActions } });
    }
    setLocalPanel(null);
  }, [doc, docId, dispatch, editor]);

  const handleAddComment = useCallback((content, quotedText) => {
    dispatch({
      type: 'ADD_COMMENT',
      payload: { docId, content, quotedText: quotedText || '' }
    });
    dispatch({ type: 'SET_UI', payload: { sidebarOpen: true } });
  }, [docId, dispatch]);

  const handleZoomChange = useCallback((level) => {
    dispatch({ type: 'SET_UI', payload: { zoom: level } });
  }, [dispatch]);

  const toggleCommentsSidebar = useCallback(() => {
    dispatch({ type: 'SET_UI', payload: { sidebarOpen: !state.ui.sidebarOpen } });
  }, [state.ui.sidebarOpen, dispatch]);

  const toggleShareDialog = useCallback(() => {
    dispatch({ type: 'SET_UI', payload: { shareDialogOpen: !state.ui.shareDialogOpen } });
  }, [state.ui.shareDialogOpen, dispatch]);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-500 mb-4">Document not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Documents
        </button>
      </div>
    );
  }

  const sharedAvatars = doc.sharedWith
    .map(s => state.users.find(u => u.id === s.userId))
    .filter(Boolean);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top header with document title and actions */}
      <div className="flex items-center px-3 py-1.5 border-b border-gray-200 bg-white">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 mr-1"
          title="Back to documents"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <input
            type="text"
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="doc-title-input text-lg font-normal text-gray-900 border border-transparent outline-none bg-transparent px-1 py-0.5 rounded hover:border-gray-300 focus:border-blue-500 min-w-[100px] max-w-[400px] truncate"
          />
          <button
            onClick={() => dispatch({ type: 'STAR_DOC', payload: { docId } })}
            className={`p-1 rounded hover:bg-gray-100 ${doc.starred ? 'text-yellow-500' : 'text-gray-400'}`}
            title={doc.starred ? 'Unstar' : 'Star'}
          >
            <Star size={16} fill={doc.starred ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Shared user avatars */}
          {sharedAvatars.length > 0 && (
            <div className="flex -space-x-1.5 mr-1">
              {sharedAvatars.slice(0, 3).map(user => (
                <img
                  key={user.id}
                  src={user.avatar}
                  alt={user.name}
                  title={user.name}
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              ))}
              {sharedAvatars.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-xs flex items-center justify-center text-gray-600">
                  +{sharedAvatars.length - 3}
                </div>
              )}
            </div>
          )}
          <button
            onClick={toggleCommentsSidebar}
            className={`p-1.5 rounded hover:bg-gray-100 ${state.ui.sidebarOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
            title="Comments"
          >
            <MessageSquare size={18} />
          </button>
          <button
            onClick={toggleShareDialog}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c2e7ff] text-[#001d35] text-sm font-medium rounded-full hover:bg-[#a8d8f0] transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Menu bar */}
      <MenuBar editor={editor} onAction={handleMenuAction} />

      {/* Toolbar */}
      {state.ui.viewMode === 'editing' && <Toolbar editor={editor} zoom={state.ui.zoom || 100} onZoomChange={handleZoomChange} />}
      {state.ui.viewMode !== 'editing' && (
        <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
          {state.ui.viewMode === 'viewing' ? 'Viewing mode — editing is disabled' : 'Suggesting mode'}
        </div>
      )}

      {/* Find and Replace */}
      {state.ui.findReplaceOpen && (
        <FindReplaceBar
          editor={editor}
          onClose={() => dispatch({ type: 'SET_UI', payload: { findReplaceOpen: false } })}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <Editor key={docId} editor={editor} editable={state.ui.viewMode === 'editing'} onAddComment={handleAddComment} zoom={state.ui.zoom || 100} />
        <CommentsSidebar docId={docId} />
      </div>

      {/* Share dialog */}
      <ShareDialog
        docId={docId}
        isOpen={state.ui.shareDialogOpen}
        onClose={() => dispatch({ type: 'SET_UI', payload: { shareDialogOpen: false } })}
      />

      {localPanel && (
        <LocalActionPanel
          panel={localPanel}
          doc={doc}
          state={state}
          editor={editor}
          onSubmit={handlePanelSubmit}
          onClose={() => setLocalPanel(null)}
        />
      )}
    </div>
  );
}

export default DocumentEditor;
