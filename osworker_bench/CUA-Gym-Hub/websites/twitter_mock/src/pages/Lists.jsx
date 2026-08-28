import React, { useState } from 'react';
import { ListTodo, Plus, X, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

export default function Lists() {
  const { state, createList } = useData();
  const navigate = useNavigate();

  const lists = state.lists || [];
  const myLists = lists.filter(l => l.ownerId === state.currentUser.id);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListPrivate, setNewListPrivate] = useState(false);

  const handleCreate = () => {
    if (!newListName.trim()) return;
    createList(newListName.trim(), newListDesc.trim(), newListPrivate);
    setNewListName('');
    setNewListDesc('');
    setNewListPrivate(false);
    setShowCreateModal(false);
  };

  const handleListClick = (list) => {
    // Navigate to a list detail view - using explore as fallback since there's no dedicated list detail page
    navigate(`/lists`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F1419]">Lists</h1>
            <p className="text-[13px] text-[#536471]">@{state.currentUser.handle}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors"
          >
            <Plus className="w-5 h-5 text-[#0F1419]" />
          </button>
        </div>
      </div>

      {myLists.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <ListTodo className="w-10 h-10 text-[#536471] mb-4" />
          <h2 className="text-[30px] font-extrabold text-[#0F1419] mb-2">Create your first List</h2>
          <p className="text-[15px] text-[#536471] text-center max-w-sm mb-6">
            Lists let you curate content from accounts you're interested in.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1DA1F2] text-white font-bold text-[17px] px-8 py-3 rounded-full hover:bg-[#1a91da] transition-colors"
          >
            Create a List
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-extrabold text-[#0F1419] px-4 py-3">Your Lists</h2>
          {myLists.map(list => (
            <div
              key={list.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] cursor-pointer transition-colors"
              onClick={() => handleListClick(list)}
            >
              <div className="w-12 h-12 rounded-xl bg-[#1DA1F2] flex items-center justify-center flex-shrink-0">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px] text-[#0F1419]">{list.name}</span>
                  {list.isPrivate && (
                    <Lock className="w-4 h-4 text-[#536471]" />
                  )}
                </div>
                {list.description && (
                  <p className="text-[13px] text-[#536471] mt-0.5 truncate">{list.description}</p>
                )}
                <p className="text-[13px] text-[#536471] mt-0.5">{(list.memberIds || []).length} members</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[5%]"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EFF3F4]">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
                  <X className="w-5 h-5 text-[#0F1419]" />
                </button>
                <span className="font-extrabold text-[17px] text-[#0F1419]">Create a new List</span>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="bg-[#0F1419] text-white font-bold text-[15px] px-4 py-[6px] rounded-full hover:bg-[#272C30] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative border border-[#CFD9DE] rounded focus-within:border-[#1DA1F2] focus-within:ring-1 focus-within:ring-[#1DA1F2]">
                <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value.slice(0, 25))}
                  className="w-full pt-6 pb-2 px-3 text-[17px] text-[#0F1419] focus:outline-none bg-transparent"
                  maxLength={25}
                  autoFocus
                />
                <span className="absolute top-2 right-3 text-[13px] text-[#536471]">{newListName.length}/25</span>
              </div>

              <div className="relative border border-[#CFD9DE] rounded focus-within:border-[#1DA1F2] focus-within:ring-1 focus-within:ring-[#1DA1F2]">
                <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Description</label>
                <textarea
                  value={newListDesc}
                  onChange={e => setNewListDesc(e.target.value.slice(0, 100))}
                  className="w-full pt-6 pb-2 px-3 text-[17px] text-[#0F1419] focus:outline-none bg-transparent resize-none"
                  rows={3}
                  maxLength={100}
                />
                <span className="absolute top-2 right-3 text-[13px] text-[#536471]">{newListDesc.length}/100</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#EFF3F4]">
                <div>
                  <p className="text-[17px] font-bold text-[#0F1419]">Make private</p>
                  <p className="text-[15px] text-[#536471]">When you make a List private, only you can see it.</p>
                </div>
                <button
                  onClick={() => setNewListPrivate(p => !p)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${newListPrivate ? 'bg-[#1DA1F2]' : 'bg-[#CFD9DE]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${newListPrivate ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
