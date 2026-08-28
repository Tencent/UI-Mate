
    import React from 'react';
    import { useOutletContext, useParams, Link } from 'react-router-dom';
    import { useStore } from '../../lib/store';

    export default function CommitDetail() {
      const { repo, owner } = useOutletContext();
      const { commitId } = useParams();
      const { state } = useStore();

      const commit = state.commits.find(c => c.id === commitId);
      const author = state.users.find(u => u.id === commit?.authorId);

      if (!commit) return <div className="p-8 text-center text-xithub-muted">Commit not found</div>;

      return (
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#161b22] border border-xithub-border rounded-md p-4 mb-6">
             <h1 className="text-xl font-semibold text-white mb-2">{commit.message}</h1>
             <div className="flex items-center gap-2 text-sm text-xithub-muted">
                <img src={author?.avatar} alt={author?.username} className="w-5 h-5 rounded-full" />
                <span className="font-bold text-white">{author?.username}</span>
                <span>committed on {new Date(commit.date).toLocaleString()}</span>
                <span className="ml-auto font-mono text-xs">SHA: {commit.id}</span>
             </div>
          </div>

          <div className="mb-4 text-sm text-xithub-muted">
            Showing 1 changed file with <span className="text-green-500">5 additions</span> and <span className="text-red-500">2 deletions</span>.
          </div>

          <div className="border border-xithub-border rounded-md overflow-hidden">
             <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 flex items-center justify-between">
                <div className="font-mono text-sm text-xithub-text">src/components/Button.js</div>
                <Link
                  to={`/${owner?.username}/${repo.name}/blob/src/components/Button.js`}
                  className="text-xs text-xithub-muted hover:text-xithub-accent hover:underline"
                >
                  View file
                </Link>
             </div>
             <div className="bg-[#0d1117] font-mono text-sm overflow-x-auto">
                {/* Mock Diff */}
                <div className="flex">
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">1</div>
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">1</div>
                   <div className="pl-4 text-xithub-text w-full">export default function Button() {'{'}</div>
                </div>
                <div className="flex bg-red-900/20">
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">2</div>
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50"></div>
                   <div className="pl-4 text-xithub-text w-full">-  return <button>Click me</button>;</div>
                </div>
                <div className="flex bg-green-900/20">
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50"></div>
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">2</div>
                   <div className="pl-4 text-xithub-text w-full">+  return <button className="btn">Click me</button>;</div>
                </div>
                <div className="flex">
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">3</div>
                   <div className="w-12 text-right pr-2 text-xithub-muted select-none border-r border-xithub-border bg-[#161b22] opacity-50">3</div>
                   <div className="pl-4 text-xithub-text w-full">{'}'}</div>
                </div>
             </div>
          </div>
        </div>
      );
    }
