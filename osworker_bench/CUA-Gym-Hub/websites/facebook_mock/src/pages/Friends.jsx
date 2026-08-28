import React from 'react';
import { useApp } from '../store/AppContext';
import { UserPlus, UserMinus } from 'lucide-react';

const Friends = () => {
  const { state, getUser, handleFriendRequest, unfriend } = useApp();
  const requests = state.friendRequests || [];
  const friends = state.currentUser.friends;

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex justify-center">
      <div className="w-full max-w-[1000px] p-4">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Friend Requests <span className="text-red-500 text-sm font-normal">{requests.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {requests.map(req => {
                const user = getUser(req.id);
                return (
                  <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-48 object-cover" />
                    <div className="p-3">
                      <h3 className="font-semibold text-[17px] mb-2">{user.name}</h3>
                      <button
                        onClick={() => handleFriendRequest(user.id, 'confirm')}
                        className="w-full bg-primary text-white py-2 rounded-md font-semibold mb-2 hover:bg-blue-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleFriendRequest(user.id, 'delete')}
                        className="w-full bg-gray-200 text-black py-2 rounded-md font-semibold hover:bg-gray-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Friends */}
        <div>
          <h2 className="text-xl font-bold mb-4">All Friends</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {friends.map(fid => {
              const user = getUser(fid);
              return (
                <div key={user.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold text-[17px]">{user.name}</h3>
                    <span className="text-gray-500 text-sm">Friend</span>
                  </div>
                  <div className="ml-auto">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Unfriend"
                      onClick={() => unfriend(user.id)}
                    >
                      <UserMinus size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
