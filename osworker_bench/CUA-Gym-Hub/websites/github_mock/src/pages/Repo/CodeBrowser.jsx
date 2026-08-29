
    import React, { useState } from 'react';
    import { useOutletContext, Link, useParams, useNavigate } from 'react-router-dom';
    import { GitBranch, Folder, FileCode, Download, History, BookOpen, Check, ArrowLeft, Star, GitFork, Eye, Tag, Package, Scale, ExternalLink, Search, Pencil } from 'lucide-react';
    import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
    import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';

    export default function CodeBrowser() {
      const { repo, owner } = useOutletContext();
      const { state } = useStore();
      const { "*": path } = useParams();

      const navigate = useNavigate();
      const [currentBranch, setCurrentBranch] = useState("main");
      const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
      const [branchSearch, setBranchSearch] = useState('');
      const [showCodeDropdown, setShowCodeDropdown] = useState(false);
      const [codeSearchQuery, setCodeSearchQuery] = useState('');
      const [showSearchResults, setShowSearchResults] = useState(false);

      const files = state.files.filter(f => f.repoId === repo.id && f.branch === currentBranch);
      const commits = state.commits.filter(c => c.repoId === repo.id && c.branch === currentBranch);
      const lastCommit = commits[0];
      const branches = state.branches.filter(b => b.repoId === repo.id);
      const filteredBranches = branchSearch
        ? branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()))
        : branches;

      // Highlight matching text in search results
      const highlightMatch = (text, query) => {
        if (!query) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
          <>
            {text.substring(0, idx)}
            <span className="bg-yellow-500/30 text-yellow-300">{text.substring(idx, idx + query.length)}</span>
            {text.substring(idx + query.length)}
          </>
        );
      };

      // Simple file tree logic
      const currentPath = path || "";

      // Check if current path is a file
      const selectedFile = files.find(f => f.path === currentPath);

      if (selectedFile) {
        return (
          <FileViewer file={selectedFile} repo={repo} owner={owner} />
        );
      }

      // It's a directory - get direct children
      const dirFiles = files.filter(f => {
        if (!currentPath) return !f.path.includes('/');
        return f.path.startsWith(currentPath + '/') && f.path.split('/').length === currentPath.split('/').length + 1;
      });

      // Derive folders at any depth
      const derivedFolders = [];
      const folderSet = new Set();
      files.forEach(f => {
        const relativePath = currentPath ? f.path.replace(currentPath + '/', '') : f.path;
        if (!currentPath && f.path.includes('/')) {
          const folder = f.path.split('/')[0];
          folderSet.add(folder);
        } else if (currentPath && f.path.startsWith(currentPath + '/')) {
          const remaining = f.path.substring(currentPath.length + 1);
          if (remaining.includes('/')) {
            folderSet.add(remaining.split('/')[0]);
          }
        }
      });
      folderSet.forEach(folder => {
        derivedFolders.push({ name: folder, path: currentPath ? `${currentPath}/${folder}` : folder });
      });

      const cloneUrl = `https://github.com/${owner?.username}/${repo.name}.git`;
      const isRoot = !currentPath;

      // Language color mapping for the languages bar
      const languageColors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'CSS': '#563d7c',
        'HTML': '#e34c26',
        'Python': '#3572A5',
        'Java': '#b07219',
        'Markdown': '#083fa1',
        'JSON': '#292929',
        'Shell': '#89e051',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'C': '#555555',
        'C++': '#f34b7d',
      };

      const fileTree = (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                  className="bg-[#21262d] border border-xithub-border text-xithub-text px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-[#30363d]"
                >
                  <GitBranch size={16} />
                  {currentBranch}
                  <span className="text-xs">▼</span>
                </button>

                {isBranchMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-[#161b22] border border-xithub-border rounded-md shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-xithub-border">
                       <input
                         type="text"
                         placeholder="Find a branch..."
                         value={branchSearch}
                         onChange={e => setBranchSearch(e.target.value)}
                         className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-2 py-1 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                       />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredBranches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => {
                            setCurrentBranch(branch.name);
                            setIsBranchMenuOpen(false);
                            setBranchSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#21262d] flex items-center justify-between"
                        >
                          <span>{branch.name}</span>
                          {currentBranch === branch.name && <Check size={14} />}
                        </button>
                      ))}
                      {filteredBranches.length === 0 && (
                        <div className="px-4 py-2 text-sm text-xithub-muted">No branches found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xithub-text text-sm">
                <span className="font-bold">{owner?.username}</span>
                <span className="text-xithub-muted">/</span>
                <Link to={`/${owner?.username}/${repo.name}`} className="font-bold hover:underline">{repo.name}</Link>
                {currentPath && (
                  <>
                    <span className="text-xithub-muted">/</span>
                    <span className="text-xithub-muted">{currentPath}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                className="bg-xithub-success text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2"
              >
                Code <span className="text-xs">▼</span>
              </button>
              {showCodeDropdown && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-[#161b22] border border-xithub-border rounded-md shadow-xl z-50">
                  <div className="p-3 border-b border-xithub-border">
                    <div className="text-xs font-semibold text-xithub-muted mb-2">Clone</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-white">HTTPS</span>
                      <span className="text-xs text-xithub-muted">SSH</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={cloneUrl}
                        readOnly
                        className="flex-1 bg-[#0d1117] border border-xithub-border rounded-l-md px-2 py-1 text-xs text-xithub-text font-mono"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(cloneUrl)}
                        className="bg-[#21262d] border border-l-0 border-xithub-border rounded-r-md px-2 py-1 text-xs hover:bg-[#30363d]"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCodeDropdown(false)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#21262d] flex items-center gap-2"
                  >
                    <Download size={14} /> Download ZIP
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Code Search */}
          <div className="relative mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xithub-muted" />
              <input
                type="text"
                placeholder="Search code in this repository..."
                value={codeSearchQuery}
                onChange={e => {
                  setCodeSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                onFocus={() => {
                  if (codeSearchQuery.trim()) setShowSearchResults(true);
                }}
                className="w-full bg-[#0d1117] border border-xithub-border rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-xithub-muted focus:outline-none focus:border-xithub-accent"
              />
              {codeSearchQuery && (
                <button
                  onClick={() => { setCodeSearchQuery(''); setShowSearchResults(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xithub-muted hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            {showSearchResults && codeSearchQuery.trim() && (
              <div className="mt-2 bg-xithub-card border border-xithub-border rounded-md overflow-hidden max-h-96 overflow-y-auto">
                {(() => {
                  const query = codeSearchQuery.toLowerCase();
                  const results = [];
                  files.forEach(file => {
                    // Search file path
                    const pathMatch = file.path.toLowerCase().includes(query);
                    // Search file content
                    const lines = (file.content || '').split('\n');
                    const matchingLines = [];
                    lines.forEach((line, idx) => {
                      if (line.toLowerCase().includes(query)) {
                        matchingLines.push({ lineNum: idx + 1, content: line });
                      }
                    });
                    if (pathMatch || matchingLines.length > 0) {
                      results.push({ file, pathMatch, matchingLines: matchingLines.slice(0, 3) });
                    }
                  });
                  if (results.length === 0) {
                    return (
                      <div className="p-6 text-center text-xithub-muted text-sm">
                        No results found for "{codeSearchQuery}"
                      </div>
                    );
                  }
                  return results.slice(0, 10).map(result => (
                    <div key={result.file.id} className="border-b border-xithub-border last:border-b-0">
                      <div
                        onClick={() => {
                          navigate(`/${owner?.username}/${repo.name}/blob/${result.file.path}`);
                          setShowSearchResults(false);
                          setCodeSearchQuery('');
                        }}
                        className="px-4 py-2 bg-[#161b22] flex items-center gap-2 cursor-pointer hover:bg-[#21262d]"
                      >
                        <FileCode size={14} className="text-xithub-muted shrink-0" />
                        <span className="text-sm text-xithub-accent font-mono">{result.file.path}</span>
                        {result.matchingLines.length > 0 && (
                          <span className="text-xs text-xithub-muted ml-auto">
                            {result.matchingLines.length} match{result.matchingLines.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      {result.matchingLines.map((ml, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigate(`/${owner?.username}/${repo.name}/blob/${result.file.path}`);
                            setShowSearchResults(false);
                            setCodeSearchQuery('');
                          }}
                          className="px-4 py-1.5 hover:bg-[#21262d] cursor-pointer flex items-start gap-3 text-xs font-mono"
                        >
                          <span className="text-xithub-muted w-8 text-right shrink-0">L{ml.lineNum}</span>
                          <span className="text-xithub-text truncate">
                            {highlightMatch(ml.content, codeSearchQuery)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
            <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <img src={owner?.avatar} alt={owner?.username} className="w-5 h-5 rounded-full" />
                <span className="font-semibold text-xithub-text">{owner?.username}</span>
                <span className="text-xithub-muted truncate">{lastCommit?.message || "Initial commit"}</span>
              </div>
              <div className="flex items-center gap-4 text-xithub-muted text-xs">
                <span>{lastCommit?.id?.substring(0, 7)}</span>
                <span>{lastCommit ? new Date(lastCommit.date).toLocaleDateString() : 'Just now'}</span>
                <Link to="commits" className="flex items-center gap-1 font-semibold text-xithub-text hover:text-xithub-accent">
                   <History size={14} />
                   <span>{commits.length} commits</span>
                </Link>
              </div>
            </div>

            <div className="divide-y divide-xithub-border">
              {currentPath && (
                <div className="p-3 hover:bg-[#161b22] flex items-center gap-3 text-sm">
                   <Link to={`/${owner?.username}/${repo.name}${currentPath.includes('/') ? '/blob/' + currentPath.split('/').slice(0, -1).join('/') : ''}`} className="text-xithub-accent font-bold">..</Link>
                </div>
              )}

              {/* Display Folders */}
              {derivedFolders.map(folder => (
                 <div key={folder.path} className="p-3 hover:bg-[#161b22] flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-3">
                      <Folder size={16} className="text-xithub-accent fill-xithub-accent/20" />
                      <Link to={`/${owner?.username}/${repo.name}/blob/${folder.path}`} className="text-xithub-text hover:text-xithub-accent hover:underline">
                        {folder.name}
                      </Link>
                    </div>
                    <span className="text-xithub-muted text-xs group-hover:text-xithub-text">
                      Folder update
                    </span>
                    <span className="text-xithub-muted text-xs">
                      2 days ago
                    </span>
                 </div>
              ))}

              {/* Display Files */}
              {dirFiles.map(file => (
                <div key={file.id} className="p-3 hover:bg-[#161b22] flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-3">
                    <FileCode size={16} className="text-xithub-muted" />
                    <Link to={`/${owner?.username}/${repo.name}/blob/${file.path}`} className="text-xithub-text hover:text-xithub-accent hover:underline">
                      {file.path.split('/').pop()}
                    </Link>
                  </div>
                  <span className="text-xithub-muted text-xs group-hover:text-xithub-text">
                    {commits.find(c => c.branch === currentBranch)?.message || "Update"}
                  </span>
                  <span className="text-xithub-muted text-xs">
                    {commits.find(c => c.branch === currentBranch) ? new Date(commits.find(c => c.branch === currentBranch).date).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              ))}

              {dirFiles.length === 0 && derivedFolders.length === 0 && (
                 <div className="p-8 text-center text-xithub-muted text-sm">
                    No files found in this directory.
                 </div>
              )}
            </div>
          </div>

          {/* README Preview */}
          {files.find(f => f.path === 'README.md') && !currentPath && (
            <div className="mt-8 border border-xithub-border rounded-md">
               <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm font-semibold flex items-center gap-2">
                 <BookOpen size={16} /> README.md
               </div>
               <div className="p-8 prose prose-invert max-w-none bg-xithub-bg">
                 <Markdown>{files.find(f => f.path === 'README.md').content}</Markdown>
               </div>
            </div>
          )}
        </>
      );

      // About sidebar only on root
      if (isRoot) {
        const languages = repo.languages || {};
        const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
        const totalLangPct = langEntries.reduce((sum, [, pct]) => sum + pct, 0);

        return (
          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              {fileTree}
            </div>
            <div className="w-[280px] shrink-0">
              {/* About section */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-2">About</h3>
                {repo.description && (
                  <p className="text-sm text-xithub-text mb-3">{repo.description}</p>
                )}
                {repo.homepage && (
                  <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-xithub-accent hover:underline mb-3">
                    <ExternalLink size={14} />
                    {repo.homepage}
                  </a>
                )}
                {(repo.topics || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {repo.topics.map(topic => (
                      <span key={topic} className="px-2.5 py-0.5 rounded-full bg-[#1f6feb33] text-[#58a6ff] text-xs font-medium hover:bg-[#1f6feb55] cursor-pointer">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="border-t border-xithub-border pt-4 mb-4 space-y-2">
                <Link to={`/${owner.username}/${repo.name}/releases`} className="flex items-center gap-2 text-sm text-xithub-text hover:text-xithub-accent">
                  <Tag size={14} className="text-xithub-muted" />
                  <span>Releases</span>
                </Link>
                <Link to={`/${owner.username}/${repo.name}/actions`} className="flex items-center gap-2 text-sm text-xithub-text hover:text-xithub-accent">
                  <Package size={14} className="text-xithub-muted" />
                  <span>Packages</span>
                </Link>
                {repo.license && (
                  <div className="flex items-center gap-2 text-sm text-xithub-text">
                    <Scale size={14} className="text-xithub-muted" />
                    <span>{repo.license} License</span>
                  </div>
                )}
              </div>

              {/* Stars / Forks / Watchers */}
              <div className="border-t border-xithub-border pt-4 mb-4 flex items-center gap-4 text-sm text-xithub-muted">
                <span className="flex items-center gap-1">
                  <Star size={14} /> <span className="font-semibold text-xithub-text">{repo.stars}</span> stars
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={14} /> <span className="font-semibold text-xithub-text">{repo.forks}</span> forks
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} /> <span className="font-semibold text-xithub-text">{repo.watchers || 0}</span> watching
                </span>
              </div>

              {/* Languages */}
              {langEntries.length > 0 && (
                <div className="border-t border-xithub-border pt-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Languages</h3>
                  <div className="flex h-2 rounded-full overflow-hidden mb-3">
                    {langEntries.map(([lang, pct]) => (
                      <div
                        key={lang}
                        style={{
                          width: `${(pct / totalLangPct) * 100}%`,
                          backgroundColor: languageColors[lang] || '#8b949e'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {langEntries.map(([lang, pct]) => (
                      <div key={lang} className="flex items-center gap-1.5 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: languageColors[lang] || '#8b949e' }}
                        />
                        <span className="text-xithub-text font-semibold">{lang}</span>
                        <span className="text-xithub-muted">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      return <div>{fileTree}</div>;
    }

    function FileViewer({ file, repo, owner }) {
      const [isRaw, setIsRaw] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [editContent, setEditContent] = useState(file.content);
      const [commitMessage, setCommitMessage] = useState(`Update ${file.path.split('/').pop()}`);
      const { dispatch, actions, state } = useStore();

      const handleDownload = () => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.path.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      const handleStartEdit = () => {
        setEditContent(file.content);
        setCommitMessage(`Update ${file.path.split('/').pop()}`);
        setIsEditing(true);
      };

      const handleCommitChanges = () => {
        if (editContent === file.content) {
          setIsEditing(false);
          return;
        }
        // Update file content
        dispatch({
          type: actions.UPDATE_FILE,
          payload: { fileId: file.id, content: editContent }
        });
        // Add a new commit
        const commitId = Math.random().toString(36).substring(2, 9);
        dispatch({
          type: actions.ADD_COMMIT,
          payload: {
            id: commitId,
            repoId: repo.id,
            branch: file.branch || 'main',
            message: commitMessage.trim() || `Update ${file.path.split('/').pop()}`,
            authorId: state.currentUser.id,
            date: new Date().toISOString(),
            additions: editContent.split('\n').length,
            deletions: file.content.split('\n').length,
          }
        });
        setIsEditing(false);
      };

      if (isRaw) {
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <button
                onClick={() => setIsRaw(false)}
                className="flex items-center gap-2 text-sm text-xithub-accent hover:underline"
              >
                <ArrowLeft size={16} /> Back to file view
              </button>
            </div>
            <div className="bg-white text-black p-4 font-mono whitespace-pre-wrap rounded-md border border-xithub-border">
              {file.content}
            </div>
          </div>
        );
      }

      if (isEditing) {
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-sm text-xithub-muted">
              <Link to={`/${owner?.username}/${repo.name}`} className="text-xithub-accent hover:underline font-bold">{repo.name}</Link>
              <span className="mx-1">/</span>
              <span className="font-bold text-xithub-text">{file.path}</span>
              <span className="ml-2 text-yellow-400">(editing)</span>
            </div>

            <div className="border border-xithub-border rounded-md overflow-hidden">
              <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-xithub-text">
                  <Pencil size={14} />
                  <span>Editing <span className="font-semibold">{file.path.split('/').pop()}</span></span>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xithub-muted hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full min-h-[400px] bg-[#0d1117] text-xithub-text font-mono text-sm p-4 outline-none resize-y border-b border-xithub-border"
                spellCheck={false}
              />

              <div className="bg-[#161b22] p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Commit changes</h3>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Update filename"
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCommitChanges}
                    className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
                  >
                    Commit changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-xithub-muted hover:text-white text-sm border border-xithub-border rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-6xl mx-auto">
           <div className="mb-4 text-sm text-xithub-muted">
             <Link to={`/${owner?.username}/${repo.name}`} className="text-xithub-accent hover:underline font-bold">{repo.name}</Link>
             <span className="mx-1">/</span>
             <span className="font-bold text-xithub-text">{file.path}</span>
           </div>

           <div className="border border-xithub-border rounded-md overflow-hidden">
             <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center justify-between text-sm">
               <div className="flex items-center gap-2 text-xithub-text">
                 <span className="font-mono text-xs px-2 py-0.5 bg-xithub-border rounded-md">{file.content.split('\n').length} lines</span>
                 <span className="text-xithub-muted">|</span>
                 <span>{(new Blob([file.content]).size / 1024).toFixed(1)} KB</span>
               </div>
               <div className="flex items-center gap-2">
                 <button
                    onClick={handleStartEdit}
                    className="p-1.5 hover:bg-xithub-border rounded-md text-xithub-muted hover:text-xithub-text"
                    title="Edit this file"
                 >
                    <Pencil size={16} />
                 </button>
                 <button
                    onClick={() => setIsRaw(true)}
                    className="px-3 py-1 bg-[#21262d] border border-xithub-border rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors"
                 >
                    Raw
                 </button>
                 <button
                   onClick={handleDownload}
                   className="p-1.5 hover:bg-xithub-border rounded-md text-xithub-muted hover:text-xithub-text"
                   title="Download file"
                 >
                   <Download size={16} />
                 </button>
               </div>
             </div>

             <div className="bg-[#0d1117] overflow-x-auto text-sm">
               {file.language === 'markdown' ? (
                 <div className="p-8 prose prose-invert max-w-none">
                    <Markdown>{file.content}</Markdown>
                 </div>
               ) : (
                 <SyntaxHighlighter
                    language={file.language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                    showLineNumbers={true}
                 >
                    {file.content}
                 </SyntaxHighlighter>
               )}
             </div>
           </div>
        </div>
      )
    }
