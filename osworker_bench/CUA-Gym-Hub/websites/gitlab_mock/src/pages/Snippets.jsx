import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Code, Copy } from 'lucide-react';

export default function Snippets() {
  const { state, updateState } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [newSnippet, setNewSnippet] = useState({ title: '', code: '', language: 'javascript' });

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setIsModalOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const createSnippet = (event) => {
    event.preventDefault();
    const snippet = {
      id: (state.snippets?.length || 0) + 1,
      title: newSnippet.title,
      code: newSnippet.code,
      language: newSnippet.language,
      author: state.currentUser.name
    };
    updateState(prev => ({ snippets: [...(prev.snippets || []), snippet] }));
    setNewSnippet({ title: '', code: '', language: 'javascript' });
    setIsModalOpen(false);
  };

  const copySnippet = async (snippet) => {
    await navigator.clipboard?.writeText(snippet.code);
    setNotice(`Copied ${snippet.title}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Snippets</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          New Snippet
        </button>
      </div>
      {notice && <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div>}

      <div className="grid gap-4">
        {state.snippets.map(snippet => (
          <div key={snippet.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Code size={16} className="text-gray-500" />
                   <span className="font-bold text-gray-800">{snippet.title}</span>
                </div>
                <div className="text-xs text-gray-500">by {snippet.author}</div>
             </div>
             <div className="p-4 bg-[#1e1e1e] overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{snippet.code}</code>
                </pre>
             </div>
             <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-right">
                <button onClick={() => copySnippet(snippet)} className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center justify-end gap-1 ml-auto">
                   <Copy size={12} /> Copy to clipboard
                </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">New Snippet</h2>
            <form onSubmit={createSnippet}>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input required value={newSnippet.title} onChange={(event) => setNewSnippet(prev => ({ ...prev, title: event.target.value }))} className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
              <textarea required value={newSnippet.code} onChange={(event) => setNewSnippet(prev => ({ ...prev, code: event.target.value }))} className="mb-4 h-40 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="rounded bg-xitlab-info px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create snippet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
