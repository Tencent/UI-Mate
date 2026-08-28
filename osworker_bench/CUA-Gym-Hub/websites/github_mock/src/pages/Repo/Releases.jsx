
    import React, { useState } from 'react';
    import { useOutletContext } from 'react-router-dom';
    import { Tag, Download, ArrowLeft } from 'lucide-react';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';

    export default function Releases() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [showNewForm, setShowNewForm] = useState(false);
      const [newTag, setNewTag] = useState('');
      const [newTitle, setNewTitle] = useState('');
      const [newBody, setNewBody] = useState('');
      const [targetBranch, setTargetBranch] = useState(repo.defaultBranch || 'main');

      const releases = (state.releases || []).filter(r => r.repoId === repo.id);
      const branches = state.branches.filter(b => b.repoId === repo.id);

      const handleCreateRelease = (e) => {
        e.preventDefault();
        if (!newTag.trim() || !newTitle.trim()) return;
        const newRelease = {
          id: `rel_${generateId()}`,
          repoId: repo.id,
          tag: newTag.trim(),
          title: newTitle.trim(),
          body: newBody.trim(),
          authorId: state.currentUser.id,
          date: new Date().toISOString(),
          isDraft: false,
          assets: [
            { name: `${repo.name}-${newTag.trim()}.tar.gz`, size: '2.0 MB' },
            { name: `${repo.name}-${newTag.trim()}.zip`, size: '2.5 MB' },
          ],
        };
        dispatch({ type: actions.ADD_RELEASE, payload: newRelease });
        setNewTag('');
        setNewTitle('');
        setNewBody('');
        setShowNewForm(false);
      };

      if (showNewForm) {
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowNewForm(false)}
              className="flex items-center gap-2 text-sm text-xithub-accent hover:underline mb-4"
            >
              <ArrowLeft size={16} /> Back to releases
            </button>
            <h1 className="text-2xl font-semibold text-white mb-6">Draft a new release</h1>
            <form onSubmit={handleCreateRelease} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-xithub-text mb-1">Tag version</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-xithub-text mb-1">Target branch</label>
                  <select
                    value={targetBranch}
                    onChange={e => setTargetBranch(e.target.value)}
                    className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-xithub-text mb-1">Release title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Release title"
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-xithub-text mb-1">Describe this release</label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="Write release notes here... Markdown is supported."
                  className="w-full h-48 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none resize-y"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-xithub-success text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-opacity-90"
                >
                  Publish release
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 text-xithub-muted hover:text-white text-sm border border-xithub-border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      }

      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Tag size={20} />
              Releases
            </h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
            >
              Draft a new release
            </button>
          </div>

          {releases.length === 0 ? (
            <div className="border border-xithub-border rounded-md p-8 text-center text-xithub-muted text-sm">
              There aren't any releases here. Create a new release to get started.
            </div>
          ) : (
            <div className="space-y-8">
              {releases
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((rel, idx) => {
                const author = state.users.find(u => u.id === rel.authorId);
                const isLatest = idx === 0;
                return (
                  <div key={rel.id} className="border border-xithub-border rounded-md overflow-hidden">
                    <div className="flex">
                      {/* Left timeline */}
                      <div className="w-32 shrink-0 bg-[#161b22] border-r border-xithub-border p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag size={14} className="text-xithub-accent" />
                          <span className="font-mono text-sm font-semibold text-xithub-accent">{rel.tag}</span>
                        </div>
                        <div className="text-xs text-xithub-muted">
                          {new Date(rel.date).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Right content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">{rel.title}</h3>
                          {isLatest && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-xithub-success/20 text-xithub-success border border-xithub-success/30">
                              Latest
                            </span>
                          )}
                          {rel.isDraft && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700/30">
                              Draft
                            </span>
                          )}
                        </div>

                        {author && (
                          <div className="flex items-center gap-2 mb-4 text-sm text-xithub-muted">
                            <img src={author.avatar} alt={author.username} className="w-5 h-5 rounded-full" />
                            <span className="font-semibold text-xithub-text">{author.username}</span>
                            <span>released this on {new Date(rel.date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {rel.body && (
                          <div className="prose prose-invert max-w-none text-sm mb-4 pb-4 border-b border-xithub-border">
                            <Markdown>{rel.body}</Markdown>
                          </div>
                        )}

                        {/* Assets */}
                        {(rel.assets || []).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-xithub-text mb-2">Assets</h4>
                            <div className="space-y-1">
                              {rel.assets.map((asset, ai) => (
                                <div key={ai} className="flex items-center justify-between py-2 px-3 bg-[#161b22] rounded-md text-sm">
                                  <div className="flex items-center gap-2 text-xithub-accent">
                                    <Download size={14} />
                                    <span>{asset.name}</span>
                                  </div>
                                  <span className="text-xs text-xithub-muted">{asset.size}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
