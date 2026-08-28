
    import React, { useState } from 'react';
    import { useOutletContext } from 'react-router-dom';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';

    export default function Wiki() {
      const { repo } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [selectedPageId, setSelectedPageId] = useState(null);
      const [isCreating, setIsCreating] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [newTitle, setNewTitle] = useState('');
      const [newContent, setNewContent] = useState('');
      const [editTitle, setEditTitle] = useState('');
      const [editContent, setEditContent] = useState('');

      const pages = state.wiki.filter(w => w.repoId === repo.id);
      const currentPage = selectedPageId
        ? pages.find(p => p.id === selectedPageId)
        : pages.find(p => p.title === 'Home') || pages[0];

      const handleCreatePage = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const newPage = {
          id: generateId(),
          repoId: repo.id,
          title: newTitle.trim(),
          content: newContent || `# ${newTitle.trim()}\n\nNew wiki page.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: actions.ADD_WIKI_PAGE, payload: newPage });
        setSelectedPageId(newPage.id);
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
      };

      const handleEditPage = () => {
        if (!currentPage) return;
        setEditTitle(currentPage.title);
        setEditContent(currentPage.content);
        setIsEditing(true);
      };

      const handleSaveEdit = () => {
        if (!editTitle.trim() || !currentPage) return;
        dispatch({
          type: actions.UPDATE_WIKI_PAGE,
          payload: {
            pageId: currentPage.id,
            updates: { title: editTitle.trim(), content: editContent, updatedAt: new Date().toISOString() }
          }
        });
        setIsEditing(false);
      };

      if (isCreating) {
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Create new page</h1>
            <form onSubmit={handleCreatePage} className="bg-xithub-card border border-xithub-border rounded-md p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="Write your wiki page content here (Markdown supported)"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full h-64 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none resize-y font-mono text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-xithub-muted hover:text-xithub-text">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xithub-success text-white font-semibold rounded-md hover:bg-opacity-90">
                  Save page
                </button>
              </div>
            </form>
          </div>
        );
      }

      return (
        <div className="max-w-6xl mx-auto flex gap-8">
           <div className="w-3/4">
              {isEditing ? (
                <div>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full text-2xl bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-xithub-accent outline-none mb-4"
                    />
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="w-full h-64 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none resize-y font-mono text-sm"
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-xithub-success text-white font-semibold rounded-md text-sm hover:bg-opacity-90">Save page</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xithub-muted hover:text-white text-sm">Cancel</button>
                  </div>
                </div>
              ) : currentPage ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div></div>
                    <button
                      onClick={handleEditPage}
                      className="px-3 py-1 bg-[#21262d] border border-xithub-border rounded-md text-sm font-semibold hover:bg-[#30363d]"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <h1>{currentPage.title}</h1>
                    <Markdown>{currentPage.content}</Markdown>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xithub-muted">Wiki is empty.</p>
                  <button
                    onClick={() => { setNewTitle('Home'); setIsCreating(true); }}
                    className="mt-4 bg-xithub-success text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90"
                  >
                    Create the first page
                  </button>
                </div>
              )}
           </div>

           <div className="w-1/4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Pages</h3>
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-xs text-xithub-accent hover:underline"
                >
                  New page
                </button>
              </div>
              <ul className="text-sm space-y-1">
                {pages.map(page => (
                  <li key={page.id}>
                    <button
                      onClick={() => { setSelectedPageId(page.id); setIsEditing(false); }}
                      className={`text-left w-full hover:underline ${currentPage?.id === page.id ? 'text-white font-semibold' : 'text-xithub-accent'}`}
                    >
                      {page.title}
                    </button>
                  </li>
                ))}
              </ul>

              {pages.length > 0 && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-4 text-xs text-xithub-muted hover:text-xithub-accent"
                >
                  + Add a custom sidebar
                </button>
              )}
           </div>
        </div>
      );
    }
