import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserPlus, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ConnectModal = ({ user, onClose, onSend }) => {
  const [note, setNote] = useState('');

  const handleSend = () => {
    onSend(user.id, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Connect with {user.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">You can add a note to personalize your invitation to {user.name}.</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: We met at the conference last week..."
            className="w-full border border-gray-300 rounded p-2 h-32 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 p-4 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-full">Cancel</button>
          <button onClick={handleSend} className="px-4 py-2 bg-xinkedin-blue text-white font-semibold rounded-full hover:bg-xinkedin-dark">Send now</button>
        </div>
      </div>
    </div>
  );
};

export default function Network() {
  const { state, sendConnectionRequest, acceptConnectionRequest, ignoreConnectionRequest, withdrawConnectionRequest, dismissSuggestion } = useStore();
  const navigate = useNavigate();
  const [connectModalUser, setConnectModalUser] = useState(null);
  const [showConnections, setShowConnections] = useState(false);

  // Filter users not already connected and not self
  const suggestions = Object.values(state.users).filter(u =>
    !state.currentUser.connections.includes(u.id) &&
    u.id !== state.currentUser.id &&
    !state.connectionRequests?.some(r => r.toUserId === u.id && r.fromUserId === state.currentUser.id) &&
    !(state.dismissedSuggestions || []).includes(u.id)
  );

  const sentRequests = state.connectionRequests?.filter(r => r.fromUserId === state.currentUser.id) || [];
  const receivedRequests = state.connectionRequests?.filter(r => r.toUserId === state.currentUser.id) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-4">
          <h3 className="px-4 text-base font-semibold text-gray-600 mb-2">Manage my network</h3>
          <button
            onClick={() => setShowConnections(!showConnections)}
            className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-600"
          >
            <span className="flex items-center gap-3">
              <UserPlus size={20} /> Connections
            </span>
            <span className="font-semibold">{state.currentUser.connections.length}</span>
          </button>
          {showConnections && (
            <div className="border-t border-gray-200 mt-2 pt-2">
              {state.currentUser.connections.map(connId => {
                const connUser = state.users[connId];
                if (!connUser) return null;
                return (
                  <Link key={connId} to={`/profile/${connId}`} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                    <img src={connUser.avatar} className="w-8 h-8 rounded-full" alt={connUser.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{connUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{connUser.headline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-3 space-y-4">
        {/* Invitations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-700">Invitations</h2>
            <button onClick={() => navigate('/notifications')} className="text-xinkedin-blue font-semibold text-sm hover:bg-blue-50 px-2 py-1 rounded">Manage</button>
          </div>
          
          {receivedRequests.length > 0 ? (
            <div className="space-y-4">
              {receivedRequests.map(req => {
                const sender = state.users[req.fromUserId];
                return (
                  <div key={req.id} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                    <img src={sender.avatar} className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{sender.name}</h3>
                      <p className="text-gray-500 text-sm">{sender.headline}</p>
                      {req.note && <p className="text-gray-600 text-sm mt-1 italic">"{req.note}"</p>}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => ignoreConnectionRequest(req.id)} className="text-gray-600 font-semibold px-4 py-1 hover:bg-gray-100 rounded-full">Ignore</button>
                       <button onClick={() => acceptConnectionRequest(req.id)} className="border border-xinkedin-blue text-xinkedin-blue font-semibold px-4 py-1 rounded-full hover:bg-blue-50">Accept</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No pending invitations</p>
          )}
        </div>

        {/* Sent Requests (Mock view) */}
        {sentRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Sent Requests</h2>
            <div className="space-y-4">
              {sentRequests.map(req => {
                const target = state.users[req.toUserId];
                return (
                  <div key={req.id} className="flex items-center gap-4">
                    <img src={target.avatar} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{target.name}</h3>
                      <p className="text-gray-500 text-xs">Sent {new Date(req.created).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => withdrawConnectionRequest(req.id)} className="text-gray-500 font-semibold text-sm hover:bg-gray-100 px-3 py-1 rounded-full">Withdraw</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-700 mb-4">People you may know</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map(user => (
              <div key={user.id} className="border border-gray-200 rounded-lg overflow-hidden relative flex flex-col">
                <div className="h-16 bg-gray-200">
                  <img src={user.banner} className="w-full h-full object-cover" />
                </div>
                <div className="px-4 pb-4 flex-1 flex flex-col items-center -mt-8">
                  <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-white mb-2" />
                  <h3 className="font-semibold text-base text-center hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>{user.name}</h3>
                  <p className="text-xs text-gray-500 text-center mb-4 line-clamp-2">{user.headline}</p>
                  <button 
                    onClick={() => setConnectModalUser(user)}
                    className="mt-auto w-full border border-xinkedin-blue text-xinkedin-blue font-semibold py-1 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Connect
                  </button>
                </div>
                <button
                  onClick={() => dismissSuggestion(user.id)}
                  className="absolute top-2 right-2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50">
                  <X size={16} />
                </button>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-gray-500 text-sm col-span-full text-center py-8">No new suggestions right now.</p>
            )}
          </div>
        </div>
      </div>

      {connectModalUser && (
        <ConnectModal 
          user={connectModalUser} 
          onClose={() => setConnectModalUser(null)} 
          onSend={sendConnectionRequest} 
        />
      )}
    </div>
  );
}