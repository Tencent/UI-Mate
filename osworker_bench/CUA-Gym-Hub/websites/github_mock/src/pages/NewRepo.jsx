
    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { BookOpen, Lock, Globe } from 'lucide-react';
    import { useStore } from '../lib/store';
    import { generateId } from '../lib/utils';

    export default function NewRepo() {
      const { state, dispatch, actions } = useStore();
      const navigate = useNavigate();

      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [visibility, setVisibility] = useState('public');
      const [initReadme, setInitReadme] = useState(false);
      const [gitignore, setGitignore] = useState('None');
      const [license, setLicense] = useState('None');
      const [nameError, setNameError] = useState('');

      const handleNameChange = (value) => {
        setName(value);
        const sanitized = value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!sanitized) {
          setNameError('');
          return;
        }
        const exists = state.repos.some(
          r => r.ownerId === state.currentUser.id && r.name.toLowerCase() === sanitized
        );
        setNameError(exists ? `The repository "${sanitized}" already exists.` : '');
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const repoName = name.trim().replace(/\s+/g, '-');
        if (!repoName || nameError) return;

        const repoId = generateId();
        const branchId = generateId();
        const now = new Date().toISOString();

        const newFiles = [];

        if (initReadme) {
          newFiles.push({
            id: generateId(),
            repoId,
            branch: 'main',
            path: 'README.md',
            content: `# ${repoName}\n\n${description || ''}`,
            language: 'markdown'
          });
        }

        if (gitignore !== 'None') {
          const gitignoreTemplates = {
            Node: 'node_modules/\ndist/\n.env\n*.log\ncoverage/',
            Python: '__pycache__/\n*.py[cod]\n*$py.class\n*.so\nvenv/\n.env',
            Java: '*.class\n*.jar\n*.war\ntarget/\n.gradle/'
          };
          newFiles.push({
            id: generateId(),
            repoId,
            branch: 'main',
            path: '.gitignore',
            content: gitignoreTemplates[gitignore] || '',
            language: 'text'
          });
        }

        if (license !== 'None') {
          const licenseContent = {
            'MIT': `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${state.currentUser.name}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.`,
            'Apache 2.0': `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\nCopyright ${new Date().getFullYear()} ${state.currentUser.name}`,
            'GPL 3.0': `GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007\n\nCopyright (C) ${new Date().getFullYear()} ${state.currentUser.name}`
          };
          newFiles.push({
            id: generateId(),
            repoId,
            branch: 'main',
            path: 'LICENSE',
            content: licenseContent[license] || '',
            language: 'text'
          });
        }

        const newRepo = {
          id: repoId,
          ownerId: state.currentUser.id,
          name: repoName,
          description: description.trim(),
          language: '',
          languages: {},
          stars: 0,
          forks: 0,
          watchers: 0,
          isPrivate: visibility === 'private',
          defaultBranch: 'main',
          topics: [],
          license: license !== 'None' ? license : '',
          homepage: '',
          hasWiki: true,
          hasIssues: true,
          hasProjects: true,
          updatedAt: now,
          createdAt: now
        };

        const newBranch = {
          id: branchId,
          repoId,
          name: 'main',
          lastCommitId: ''
        };

        dispatch({
          type: actions.CREATE_REPO,
          payload: {
            repo: newRepo,
            branch: newBranch,
            files: newFiles
          }
        });

        navigate(`/${state.currentUser.username}/${repoName}`);
      };

      return (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold text-white mb-1">Create a new repository</h1>
          <p className="text-sm text-xithub-muted mb-8">
            A repository contains all project files, including the revision history.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Owner / Name */}
            <div className="mb-6">
              <label htmlFor="new-repo-name" className="block text-sm font-semibold text-white mb-2">Repository name *</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#21262d] border border-xithub-border rounded-md px-3 py-1.5 text-sm">
                  <img src={state.currentUser.avatar} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-xithub-text">{state.currentUser.username}</span>
                  <span className="text-xithub-muted">/</span>
                </div>
                <input
                  type="text"
                  id="new-repo-name"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  className={`flex-1 bg-[#0d1117] border ${nameError ? 'border-red-500' : 'border-xithub-border'} rounded-md px-3 py-1.5 text-sm text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none`}
                  placeholder="my-awesome-project"
                  required
                />
              </div>
              {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
              <p className="text-xs text-xithub-muted mt-1">
                Great repository names are short and memorable.
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="new-repo-description" className="block text-sm font-semibold text-white mb-2">Description <span className="text-xithub-muted font-normal">(optional)</span></label>
              <input
                type="text"
                id="new-repo-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description of this repository"
                className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1.5 text-sm text-xithub-text focus:ring-2 focus:ring-xithub-accent outline-none"
              />
            </div>

            <div className="border-t border-xithub-border pt-6 mb-6">
              {/* Public / Private */}
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${visibility === 'public' ? 'border-xithub-accent bg-[#161b22]' : 'border-xithub-border hover:bg-[#161b22]'}`}
                  onClick={() => setVisibility('public')}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="mt-1 accent-green-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe size={18} className="text-xithub-text" />
                      <span className="font-semibold text-white text-sm">Public</span>
                    </div>
                    <p className="text-xs text-xithub-muted mt-0.5">Anyone on the internet can see this repository.</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${visibility === 'private' ? 'border-xithub-accent bg-[#161b22]' : 'border-xithub-border hover:bg-[#161b22]'}`}
                  onClick={() => setVisibility('private')}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="mt-1 accent-green-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock size={18} className="text-xithub-text" />
                      <span className="font-semibold text-white text-sm">Private</span>
                    </div>
                    <p className="text-xs text-xithub-muted mt-0.5">You choose who can see and commit to this repository.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-xithub-border pt-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">Initialize this repository with:</h3>

              {/* README checkbox */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initReadme}
                  onChange={e => setInitReadme(e.target.checked)}
                  className="w-4 h-4 rounded border-xithub-border bg-[#0d1117] accent-green-500"
                />
                <div>
                  <span className="text-sm text-white font-semibold">Add a README file</span>
                  <p className="text-xs text-xithub-muted">This is where you can write a long description for your project.</p>
                </div>
              </label>

              {/* .gitignore dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-1">Add .gitignore</label>
                <select
                  value={gitignore}
                  onChange={e => setGitignore(e.target.value)}
                  className="bg-[#21262d] border border-xithub-border rounded-md px-3 py-1.5 text-sm text-xithub-text w-64"
                >
                  <option value="None">None</option>
                  <option value="Node">Node</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                </select>
              </div>

              {/* License dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-1">Choose a license</label>
                <select
                  value={license}
                  onChange={e => setLicense(e.target.value)}
                  className="bg-[#21262d] border border-xithub-border rounded-md px-3 py-1.5 text-sm text-xithub-text w-64"
                >
                  <option value="None">None</option>
                  <option value="MIT">MIT License</option>
                  <option value="Apache 2.0">Apache License 2.0</option>
                  <option value="GPL 3.0">GNU General Public License v3.0</option>
                </select>
              </div>
            </div>

            <div className="border-t border-xithub-border pt-6">
              <button
                type="submit"
                disabled={!name.trim() || !!nameError}
                className="bg-xithub-success text-white px-5 py-2 rounded-md font-semibold text-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create repository
              </button>
            </div>
          </form>
        </div>
      );
    }
