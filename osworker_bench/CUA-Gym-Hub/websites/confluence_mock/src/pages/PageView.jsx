import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Editor } from '../components/Editor';
import { Comments } from '../components/Comments';
import { Edit, Clock, Tag, MoreHorizontal, Save, X, History, RotateCcw, Star } from 'lucide-react';
import { format } from 'date-fns';

export const PageView = () => {
  const { spaceId, pageId } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  
  const page = state.pages.find(p => p.id === pageId);
  const author = state.users.find(u => u.id === page?.authorId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);

  useEffect(() => {
    if (page) {
      setEditedContent(page.content);
      setEditedTitle(page.title);
      setIsEditing(false);
      setShowHistory(false);
    }
  }, [pageId, page]);

  if (!page) return <div className="p-8">Page not found</div>;

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PAGE',
      payload: {
        id: pageId,
        title: editedTitle,
        content: editedContent
      }
    });
    setIsEditing(false);
  };

  const handleRestore = (versionId) => {
    setVersionToRestore(versionId);
  };

  const confirmRestore = () => {
    if (!versionToRestore) return;
    dispatch({
      type: 'RESTORE_VERSION',
      payload: { pageId, versionId: versionToRestore }
    });
    setVersionToRestore(null);
    setShowHistory(false);
  };

  const pageVersions = state.versions
    .filter(v => v.pageId === pageId)
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4 gap-2">
          <span>Pages</span>
          <span>/</span>
          {/* Breadcrumbs logic could go here */}
          <span>{page.title}</span>
        </div>

        {isEditing ? (
          <div className="mb-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-4xl font-bold text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none pb-2"
              placeholder="Page Title"
            />
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium text-sm transition-colors"
              >
                <Edit size={16} /> Edit
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                <Star size={20} className="text-gray-400" />
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 relative"
                title="Version History"
              >
                <History size={20} />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <img src={author?.avatar} alt="" className="w-6 h-6 rounded-full" />
              <span>Created by {author?.displayName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1" title={new Date(page.updated).toLocaleString()}>
              <Clock size={14} />
              Last updated {format(new Date(page.updated), 'MMM d, yyyy')}
            </div>
            {page.labels && page.labels.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-2">
                  {page.labels.map(label => (
                    <span key={label} className="bg-gray-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <Tag size={10} /> {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Version History Modal/Panel */}
      {showHistory && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Version History</h3>
            <button onClick={() => setShowHistory(false)}><X size={16} /></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pageVersions.map((v, idx) => (
              <div key={v.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:bg-blue-50">
                <div className="text-sm">
                  <span className="font-medium">Version {v.version}</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-500">{format(new Date(v.created), 'MMM d, HH:mm')}</span>
                  <span className="text-gray-500 mx-2">by</span>
                  <span>{state.users.find(u => u.id === v.authorId)?.displayName || 'Unknown'}</span>
                </div>
                <button 
                  onClick={() => handleRestore(v.id)}
                  className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Restore
                </button>
              </div>
            ))}
            {pageVersions.length === 0 && <p className="text-sm text-gray-500">No previous versions.</p>}
          </div>
        </div>
      )}

      {versionToRestore && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Restore version?</h2>
            <p className="text-sm text-gray-600 mb-5">
              Current content will be saved in version history before this version is restored.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setVersionToRestore(null)} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={confirmRestore} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Restore</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="mb-8 relative">
        <Editor 
          content={editedContent} 
          onChange={setEditedContent} 
          editable={isEditing} 
        />
        
        {isEditing && (
          <div className="fixed bottom-6 right-6 flex gap-3 z-50 shadow-lg">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditedContent(page.content); // Reset
                setEditedTitle(page.title);
              }}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} /> Publish
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      {!isEditing && <Comments pageId={pageId} />}
    </div>
  );
};
