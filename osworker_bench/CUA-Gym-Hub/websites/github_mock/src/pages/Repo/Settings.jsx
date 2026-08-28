
    import React, { useState } from 'react';
    import { useOutletContext, useNavigate } from 'react-router-dom';
    import { useStore } from '../../lib/store';

    export default function Settings() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const navigate = useNavigate();
      const [activeSection, setActiveSection] = useState('general');
      const [repoName, setRepoName] = useState(repo.name);
      const [repoDescription, setRepoDescription] = useState(repo.description || '');
      const [isPrivate, setIsPrivate] = useState(repo.isPrivate || false);
      const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
      const [deleteConfirmText, setDeleteConfirmText] = useState('');
      const [saved, setSaved] = useState(false);

      const handleSave = () => {
        dispatch({
          type: actions.UPDATE_REPO,
          payload: {
            repoId: repo.id,
            updates: {
              name: repoName.trim() || repo.name,
              description: repoDescription,
              isPrivate
            }
          }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };

      const handleDelete = () => {
        if (deleteConfirmText !== `${owner?.username}/${repo.name}`) return;
        dispatch({
          type: actions.DELETE_REPO,
          payload: { repoId: repo.id }
        });
        navigate('/');
      };

      const sections = [
        { id: 'general', label: 'General' },
        { id: 'collaborators', label: 'Collaborators' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'pages', label: 'Pages' },
      ];

      return (
        <div className="max-w-6xl mx-auto flex gap-8">
          <div className="w-1/4">
             <nav className="flex flex-col gap-1 text-sm">
               {sections.map(section => (
                 <button
                   key={section.id}
                   onClick={() => setActiveSection(section.id)}
                   className={`text-left pl-3 py-1 ${activeSection === section.id ? 'font-semibold border-l-2 border-xithub-accent text-white' : 'text-xithub-muted hover:text-xithub-text'}`}
                 >
                   {section.label}
                 </button>
               ))}
             </nav>
          </div>

          <div className="w-3/4">
            {activeSection === 'general' && (
              <>
                <h2 className="text-2xl font-semibold mb-6 border-b border-xithub-border pb-2">General</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Repository Name</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={e => setRepoName(e.target.value)}
                    className="bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1.5 w-1/2 text-sm text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={repoDescription}
                    onChange={e => setRepoDescription(e.target.value)}
                    className="bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1.5 w-full text-sm text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none resize-y h-20"
                    placeholder="Short description of this repository"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={e => setIsPrivate(e.target.checked)}
                      className="rounded border-xithub-border bg-[#0d1117]"
                    />
                    <span className="font-semibold">Private repository</span>
                  </label>
                  <p className="text-xs text-xithub-muted mt-1 ml-6">Only you and collaborators can see this repository.</p>
                </div>

                <div className="mb-8">
                  <button
                    onClick={handleSave}
                    className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
                  >
                    {saved ? 'Saved!' : 'Save changes'}
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Danger Zone</h3>
                  <div className="border border-red-800 rounded-md">
                    <div className="p-4 flex items-center justify-between">
                       <div>
                          <h4 className="font-semibold text-sm">Delete this repository</h4>
                          <p className="text-xs text-xithub-muted">Once you delete a repository, there is no going back. Please be certain.</p>
                       </div>
                       <button
                         onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                         className="text-red-500 border border-xithub-border bg-[#21262d] hover:bg-red-900/20 hover:border-red-800 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                       >
                          Delete this repository
                       </button>
                    </div>
                    {showDeleteConfirm && (
                      <div className="border-t border-red-800 p-4 bg-red-900/10">
                        <p className="text-sm text-xithub-muted mb-2">
                          Please type <span className="font-semibold text-white">{owner?.username}/{repo.name}</span> to confirm.
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={e => setDeleteConfirmText(e.target.value)}
                          className="bg-[#0d1117] border border-red-800 rounded-md px-3 py-1.5 w-full text-sm text-xithub-text focus:ring-2 focus:ring-red-500 outline-none mb-2"
                          placeholder={`${owner?.username}/${repo.name}`}
                        />
                        <button
                          onClick={handleDelete}
                          disabled={deleteConfirmText !== `${owner?.username}/${repo.name}`}
                          className="bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          I understand, delete this repository
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'collaborators' && (
              <>
                <h2 className="text-2xl font-semibold mb-6 border-b border-xithub-border pb-2">Manage Access</h2>
                <div className="bg-xithub-card border border-xithub-border rounded-md p-6 text-center">
                  <p className="text-xithub-muted mb-4">People with access to this repository</p>
                  <div className="space-y-2">
                    {state.users.slice(0, 3).map(u => (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-2 bg-[#161b22] rounded-md">
                        <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full" />
                        <div className="text-sm">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xithub-muted">{u.username}</div>
                        </div>
                        <span className="ml-auto text-xs text-xithub-muted border border-xithub-border px-2 py-0.5 rounded-full">
                          {u.id === repo.ownerId ? 'Owner' : 'Collaborator'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'webhooks' && (
              <>
                <h2 className="text-2xl font-semibold mb-6 border-b border-xithub-border pb-2">Webhooks</h2>
                <div className="bg-xithub-card border border-xithub-border rounded-md p-8 text-center">
                  <p className="text-xithub-muted">No webhooks configured for this repository.</p>
                  <button className="mt-4 bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90">
                    Add webhook
                  </button>
                </div>
              </>
            )}

            {activeSection === 'pages' && (
              <>
                <h2 className="text-2xl font-semibold mb-6 border-b border-xithub-border pb-2">Pages</h2>
                <div className="bg-xithub-card border border-xithub-border rounded-md p-8 text-center">
                  <p className="text-xithub-muted">XitHub Pages is not configured for this repository.</p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
