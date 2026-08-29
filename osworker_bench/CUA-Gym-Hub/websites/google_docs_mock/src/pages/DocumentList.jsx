import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
  SortAsc,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useDocsContext } from '../context/DocsContext';
import DocumentCard from '../components/DocumentCard';
import RenameDialog from '../components/RenameDialog';

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank',
    content: '',
    color: 'bg-white',
    icon: '+',
  },
  {
    id: 'resume',
    title: 'Resume',
    color: 'bg-blue-50',
    content: '<h1>Your Name</h1><p>your.email@example.com • (555) 123-4567 • City, State</p><h2>Experience</h2><h3>Job Title — Company Name</h3><p><em>Jan 2022 – Present</em></p><ul><li>Key achievement or responsibility</li><li>Another accomplishment with measurable results</li></ul><h3>Previous Role — Previous Company</h3><p><em>Jun 2019 – Dec 2021</em></p><ul><li>Description of responsibilities</li><li>Notable achievement</li></ul><h2>Education</h2><h3>Bachelor of Science in Computer Science</h3><p>University Name — 2019</p><h2>Skills</h2><p>JavaScript, React, Python, SQL, Git, Communication, Problem-solving</p>',
  },
  {
    id: 'letter',
    title: 'Letter',
    color: 'bg-gray-50',
    content: '<p>Your Name</p><p>Your Address</p><p>City, State ZIP</p><p><br></p><p>Date</p><p><br></p><p>Recipient Name</p><p>Company / Organization</p><p>Address</p><p>City, State ZIP</p><p><br></p><p>Dear [Recipient Name],</p><p><br></p><p>I am writing to [state the purpose of your letter]. [Opening paragraph that introduces your main point.]</p><p><br></p><p>[Second paragraph with supporting details or additional context.]</p><p><br></p><p>[Closing paragraph summarizing your request or next steps.]</p><p><br></p><p>Sincerely,</p><p><br></p><p>Your Name</p>',
  },
  {
    id: 'proposal',
    title: 'Project proposal',
    color: 'bg-purple-50',
    content: '<h1>Project Proposal</h1><h2>Executive Summary</h2><p>Briefly describe the project, its objectives, and expected outcomes in 2-3 sentences.</p><h2>Problem Statement</h2><p>Describe the problem or opportunity this project addresses. Include relevant context and data.</p><h2>Proposed Solution</h2><p>Detail your proposed approach and methodology for solving the problem.</p><h2>Goals & Objectives</h2><ul><li>Primary goal #1</li><li>Primary goal #2</li><li>Secondary goal</li></ul><h2>Timeline</h2><p><strong>Phase 1:</strong> Research & Discovery (Weeks 1-2)</p><p><strong>Phase 2:</strong> Design & Planning (Weeks 3-4)</p><p><strong>Phase 3:</strong> Implementation (Weeks 5-8)</p><p><strong>Phase 4:</strong> Testing & Launch (Weeks 9-10)</p><h2>Budget</h2><p>Estimated total: $X,XXX</p><h2>Team</h2><p>Project Lead: [Name]</p><p>Team Members: [Names]</p>',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting notes',
    color: 'bg-green-50',
    content: '<h1>Meeting Notes</h1><p><strong>Date:</strong> [Date]</p><p><strong>Time:</strong> [Start time] – [End time]</p><p><strong>Location:</strong> [Location / Video call link]</p><h2>Attendees</h2><ul><li>[Name, Role]</li><li>[Name, Role]</li></ul><h2>Agenda</h2><ol><li>[Agenda item 1]</li><li>[Agenda item 2]</li><li>[Agenda item 3]</li></ol><h2>Discussion Notes</h2><h3>Item 1: [Topic]</h3><p>[Notes from discussion]</p><h3>Item 2: [Topic]</h3><p>[Notes from discussion]</p><h2>Action Items</h2><ul><li>[ ] [Action item] — Owner: [Name] — Due: [Date]</li><li>[ ] [Action item] — Owner: [Name] — Due: [Date]</li></ul><h2>Next Meeting</h2><p>[Date, Time, Location]</p>',
  },
  {
    id: 'brochure',
    title: 'Brochure',
    color: 'bg-yellow-50',
    content: '<h1>Company Name</h1><h2>Your Tagline Here</h2><p>A brief description of your company and what makes you unique. Two to three sentences that capture your brand essence.</p><h2>Our Services</h2><h3>Service One</h3><p>Description of this service and the key benefits it provides to customers.</p><h3>Service Two</h3><p>Description of this service and why clients choose it.</p><h3>Service Three</h3><p>Brief overview of this additional offering.</p><h2>Why Choose Us</h2><ul><li><strong>Quality:</strong> We deliver excellence in everything we do</li><li><strong>Experience:</strong> 10+ years of industry expertise</li><li><strong>Support:</strong> 24/7 customer service</li></ul><h2>Contact Us</h2><p>Phone: (555) 000-0000</p><p>Email: info@company.com</p><p>Website: www.company.com</p><p>Address: 123 Business Ave, City, State 00000</p>',
  },
];

const SORT_OPTIONS = [
  { value: 'updated', label: 'Last modified' },
  { value: 'title', label: 'Title' },
  { value: 'created', label: 'Date created' },
];

function DocumentList() {
  const { state, dispatch } = useDocsContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(state.ui?.documentListView || 'grid');
  const [sortBy, setSortBy] = useState('updated');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);

  const documents = useMemo(() => {
    return Object.values(state.documents || {});
  }, [state.documents]);

  const filteredDocs = useMemo(() => {
    let docs = documents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q));
    }
    return docs;
  }, [documents, searchQuery]);

  const sortedDocs = useMemo(() => {
    const sorted = [...filteredDocs];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created) - new Date(a.created);
        case 'updated':
        default:
          return new Date(b.updated) - new Date(a.updated);
      }
    });
    return sorted;
  }, [filteredDocs, sortBy]);

  const starredDocs = useMemo(
    () => sortedDocs.filter((d) => d.starred),
    [sortedDocs]
  );

  const recentDocs = useMemo(() => sortedDocs, [sortedDocs]);

  const handleCreate = () => {
    const newId = 'doc-' + Date.now();
    dispatch({
      type: 'CREATE_DOC',
      payload: { id: newId, title: 'Untitled Document' },
    });
    navigate('/document/' + newId);
  };

  const handleCreateFromTemplate = (template) => {
    if (template.id === 'blank') {
      handleCreate();
      return;
    }
    const newId = 'doc-' + Date.now();
    const templateTitles = {
      resume: 'My Resume',
      letter: 'Letter',
      proposal: 'Project Proposal',
      'meeting-notes': 'Meeting Notes',
      brochure: 'Brochure',
    };
    dispatch({
      type: 'CREATE_DOC',
      payload: { id: newId, title: templateTitles[template.id] || template.title },
    });
    dispatch({
      type: 'UPDATE_DOC',
      payload: { docId: newId, content: template.content },
    });
    navigate('/document/' + newId);
  };

  const handleOpen = (docId) => {
    navigate('/document/' + docId);
  };

  const handleStar = (docId) => {
    dispatch({ type: 'STAR_DOC', payload: { docId } });
  };

  const handleDeleteRequest = (docId) => {
    setDeleteConfirm(docId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      dispatch({ type: 'DELETE_DOC', payload: { docId: deleteConfirm } });
      setDeleteConfirm(null);
    }
  };

  const handleRenameRequest = (docId) => {
    const doc = state.documents[docId];
    if (doc) {
      setRenameTarget({ id: docId, title: doc.title });
    }
  };

  const handleRename = (newTitle) => {
    if (renameTarget) {
      dispatch({
        type: 'RENAME_DOC',
        payload: { docId: renameTarget.id, title: newTitle },
      });
      setRenameTarget(null);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    dispatch({
      type: 'SET_UI',
      payload: { documentListView: mode },
    });
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Last modified';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="text-xl text-gray-700 font-normal hidden sm:inline">
              Docs
            </span>
          </div>
          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  dispatch({ type: 'SET_UI', payload: { searchQuery: e.target.value } });
                }}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Start a new document section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-700">
              Start a new document
            </h2>
            <button
              onClick={() => setShowAllTemplates(!showAllTemplates)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {showAllTemplates ? 'Hide templates' : 'Template gallery'}
              <ChevronRight size={14} className={showAllTemplates ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>
          </div>
          <div className={`flex gap-3 ${showAllTemplates ? 'flex-wrap' : 'overflow-x-auto'} pb-2`}>
            {(showAllTemplates ? TEMPLATES : TEMPLATES.slice(0, 5)).map((template) => (
              <button
                key={template.id}
                onClick={() => handleCreateFromTemplate(template)}
                className="flex-shrink-0 group"
                title={template.title}
              >
                <div className={`w-32 h-[168px] border-2 border-gray-200 rounded-lg ${template.color} hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center justify-center overflow-hidden`}>
                  {template.id === 'blank' ? (
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                      <Plus className="w-5 h-5 text-blue-500" />
                    </div>
                  ) : (
                    <div className="w-full h-full p-2 overflow-hidden">
                      <div className="text-[5px] text-left text-gray-600 leading-tight">
                        <div className="font-bold text-[6px] mb-0.5 truncate">{template.title}</div>
                        <div className="space-y-0.5">
                          <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-1 bg-gray-400 rounded w-1/2 mt-1"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-4/5"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-1 bg-gray-400 rounded w-1/2 mt-1"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 text-center mt-1.5 truncate w-32">{template.title}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Starred documents section */}
        {starredDocs.length > 0 && !searchQuery && (
          <section className="mb-8">
            <h2 className="text-base font-medium text-gray-700 mb-4">
              Starred documents
            </h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {starredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    viewMode={viewMode}
                    onOpen={handleOpen}
                    onStar={handleStar}
                    onDelete={handleDeleteRequest}
                    onRename={handleRenameRequest}
                    users={state.users}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-2">Last modified</div>
                  <div className="col-span-3"></div>
                </div>
                {starredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    viewMode={viewMode}
                    onOpen={handleOpen}
                    onStar={handleStar}
                    onDelete={handleDeleteRequest}
                    onRename={handleRenameRequest}
                    users={state.users}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent documents section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-700">
              {searchQuery ? 'Search results' : 'Recent documents'}
            </h2>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <SortAsc className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {sortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSortDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            sortBy === opt.value
                              ? 'text-blue-600 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-1.5 ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Click the + button to create your first document'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  viewMode={viewMode}
                  onOpen={handleOpen}
                  onStar={handleStar}
                  onDelete={handleDeleteRequest}
                  onRename={handleRenameRequest}
                  users={state.users}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Last modified</div>
                <div className="col-span-3"></div>
              </div>
              {recentDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  viewMode={viewMode}
                  onOpen={handleOpen}
                  onStar={handleStar}
                  onDelete={handleDeleteRequest}
                  onRename={handleRenameRequest}
                  users={state.users}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete document?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete &ldquo;
              {state.documents[deleteConfirm]?.title || 'this document'}
              &rdquo;. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      <RenameDialog
        isOpen={!!renameTarget}
        currentName={renameTarget?.title || ''}
        onRename={handleRename}
        onClose={() => setRenameTarget(null)}
      />
    </div>
  );
}

export default DocumentList;
