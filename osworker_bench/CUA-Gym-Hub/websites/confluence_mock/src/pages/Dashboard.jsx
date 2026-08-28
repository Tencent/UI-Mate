import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { Clock, Star, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { state } = useStore();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back, {state.currentUser.displayName.split(' ')[0]}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Recent Updates
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {state.pages.slice(0, 5).map(page => {
                const space = state.spaces.find(s => s.id === page.spaceId);
                const author = state.users.find(u => u.id === page.authorId);
                return (
                  <div key={page.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <img src={author?.avatar} alt="" className="w-8 h-8 rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-0.5">
                        {author?.displayName} updated a page in <span className="font-medium text-gray-700">{space?.name}</span>
                      </div>
                      <Link to={`/spaces/${space?.id}/pages/${page.id}`} className="text-blue-600 font-medium hover:underline block">
                        {page.title}
                      </Link>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(page.updated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-green-600" /> Spaces
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              {state.spaces.map(space => (
                <Link 
                  key={space.id} 
                  to={`/spaces/${space.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold group-hover:bg-blue-700 transition-colors">
                    {space.key[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{space.name}</div>
                    <div className="text-xs text-gray-500">{space.key}</div>
                  </div>
                </Link>
              ))}
              <button className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded mt-1">
                View all spaces
              </button>
            </div>
          </section>

          <section>
             <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" /> Starred
            </h2>
             <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center text-gray-400 text-sm italic">
               You haven't starred any pages yet.
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};
