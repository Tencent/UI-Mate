import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { UserPlus, Briefcase, Building2 } from 'lucide-react';

const TABS = ['People', 'Posts', 'Jobs', 'Companies'];

export default function Search() {
  const { state, sendConnectionRequest } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const [activeTab, setActiveTab] = useState('People');

  const allUsers = [
    state.currentUser,
    ...Object.values(state.users)
  ];

  // People: name, headline, skills
  const peopleResults = useMemo(() => {
    if (!query) return [];
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(query) ||
      (u.headline && u.headline.toLowerCase().includes(query)) ||
      (u.skills && u.skills.some(s => s.name.toLowerCase().includes(query)))
    );
  }, [query, state.currentUser, state.users]);

  // Posts: content
  const postResults = useMemo(() => {
    if (!query) return [];
    return state.posts.filter(p =>
      p.content.toLowerCase().includes(query)
    );
  }, [query, state.posts]);

  // Jobs: title, company, description
  const jobResults = useMemo(() => {
    if (!query) return [];
    return state.jobs.filter(j =>
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      (j.description && j.description.toLowerCase().includes(query))
    );
  }, [query, state.jobs]);

  // Companies: name, industry, description
  const companyResults = useMemo(() => {
    if (!query) return [];
    return Object.values(state.companies || {}).filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.industry && c.industry.toLowerCase().includes(query)) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  }, [query, state.companies]);

  const totalResults = peopleResults.length + postResults.length + jobResults.length + companyResults.length;

  const isConnected = (userId) =>
    userId === state.currentUser.id || state.currentUser.connections.includes(userId);

  const hasPendingRequest = (userId) =>
    state.connectionRequests?.some(
      r => r.fromUserId === state.currentUser.id && r.toUserId === userId && r.status === 'pending'
    );

  // Tab counts
  const tabCounts = {
    People: peopleResults.length,
    Posts: postResults.length,
    Jobs: jobResults.length,
    Companies: companyResults.length
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {!query ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Enter a search term to find people, posts, jobs, and companies.
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex border-b border-gray-200">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-xinkedin-blue text-xinkedin-blue'
                      : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {tab}
                  {tabCounts[tab] > 0 && (
                    <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab ? 'bg-xinkedin-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {tabCounts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {totalResults === 0 ? (
              <p className="text-gray-500 text-center py-8">No results found for "{searchParams.get('q')}"</p>
            ) : (
              <>
                <h2 className="text-base font-semibold text-gray-700 mb-4">
                  {tabCounts[activeTab]} {activeTab.toLowerCase()} result{tabCounts[activeTab] !== 1 ? 's' : ''} for "{searchParams.get('q')}"
                </h2>

                {/* People Tab */}
                {activeTab === 'People' && (
                  <div className="divide-y divide-gray-100">
                    {peopleResults.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">No people found.</p>
                    ) : (
                      peopleResults.map(user => {
                        const isSelf = user.id === state.currentUser.id;
                        const profilePath = isSelf ? '/profile/me' : `/profile/${user.id}`;
                        return (
                          <div key={user.id} className="flex items-center gap-4 py-4">
                            <Link to={profilePath}>
                              <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" alt={user.name} />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link to={profilePath} className="font-semibold text-base hover:underline text-gray-900">
                                {user.name}
                              </Link>
                              <p className="text-sm text-gray-500 truncate">{user.headline}</p>
                              {user.skills && user.skills.length > 0 && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  Skills: {user.skills.slice(0, 3).map(s => s.name).join(', ')}
                                </p>
                              )}
                            </div>
                            {!isSelf && (
                              isConnected(user.id) ? (
                                <Link to={`/profile/${user.id}`} className="border border-gray-400 text-gray-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100">
                                  View profile
                                </Link>
                              ) : hasPendingRequest(user.id) ? (
                                <button disabled className="border border-gray-400 text-gray-500 px-4 py-1 rounded-full text-sm font-semibold cursor-not-allowed">
                                  Pending
                                </button>
                              ) : (
                                <button
                                  onClick={() => sendConnectionRequest(user.id)}
                                  className="border border-xinkedin-blue text-xinkedin-blue px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-50 flex items-center gap-1"
                                >
                                  <UserPlus size={14} /> Connect
                                </button>
                              )
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Posts Tab */}
                {activeTab === 'Posts' && (
                  <div className="divide-y divide-gray-100">
                    {postResults.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">No posts found.</p>
                    ) : (
                      postResults.map(post => {
                        const postAuthor = post.userId === state.currentUser.id
                          ? state.currentUser
                          : state.users[post.userId];
                        const profilePath = post.userId === state.currentUser.id ? '/profile/me' : `/profile/${post.userId}`;
                        return (
                          <div key={post.id} className="py-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Link to={profilePath}>
                                <img src={postAuthor?.avatar} className="w-10 h-10 rounded-full object-cover" alt={postAuthor?.name} />
                              </Link>
                              <div>
                                <Link to={profilePath} className="font-semibold text-sm hover:underline">{postAuthor?.name}</Link>
                                <p className="text-xs text-gray-500">{postAuthor?.headline}</p>
                              </div>
                            </div>
                            <p
                              className="text-sm text-gray-800 line-clamp-3 cursor-pointer hover:text-gray-600"
                              onClick={() => navigate('/')}
                            >
                              {post.content}
                            </p>
                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                              <span>{Object.values(post.reactions || {}).flat().length} reactions</span>
                              <span>{post.comments?.length || 0} comments</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'Jobs' && (
                  <div className="divide-y divide-gray-100">
                    {jobResults.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">No jobs found.</p>
                    ) : (
                      jobResults.map(job => (
                        <div
                          key={job.id}
                          className="py-4 flex gap-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 rounded"
                          onClick={() => navigate('/jobs')}
                        >
                          <img src={job.logo} alt={job.company} className="w-12 h-12 object-contain rounded flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-xinkedin-blue hover:underline">{job.title}</h3>
                            <p className="text-sm text-gray-800">{job.company}</p>
                            <p className="text-xs text-gray-500">{job.location} &#183; {job.type}</p>
                            <div className="flex gap-2 mt-1">
                              {job.applied && <span className="text-xs text-green-600 font-semibold">Applied</span>}
                              {job.saved && <span className="text-xs text-gray-500">Saved</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Briefcase size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Companies Tab */}
                {activeTab === 'Companies' && (
                  <div className="divide-y divide-gray-100">
                    {companyResults.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">No companies found.</p>
                    ) : (
                      companyResults.map(company => (
                        <div key={company.id} className="py-4 flex gap-4">
                          <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="w-12 h-12 object-contain rounded" />
                            ) : (
                              <Building2 size={24} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">{company.name}</h3>
                            {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
                            {company.headquarters && <p className="text-xs text-gray-400">{company.headquarters}</p>}
                            {company.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{company.description}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
