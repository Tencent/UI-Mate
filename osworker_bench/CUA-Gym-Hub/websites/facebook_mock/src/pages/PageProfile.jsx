import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ThumbsUp, MessageCircle, MoreHorizontal, Star, MapPin, Globe, Phone, X } from 'lucide-react';
import Post from '../components/Post';

const WriteReviewForm = ({ pageId, currentUser, onSubmit }) => {
  const [rating, setRating] = React.useState(5);
  const [content, setContent] = React.useState('');
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({
      id: `r_${Date.now()}`,
      userId: currentUser.id,
      rating,
      content: content.trim(),
      timestamp: Date.now()
    });
    setContent('');
    setRating(5);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-[15px] mb-3">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(star => (
            <Star
              key={star}
              size={24}
              className={`cursor-pointer transition-colors ${
                star <= (hoverRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
          <span className="ml-2 text-[13px] text-gray-500">{rating}/5</span>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-[15px] outline-none focus:border-primary resize-none mb-3"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold text-[15px] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

const PageProfile = () => {
  const { id } = useParams();
  const { state, getPage, getUser, togglePageLike, addPageReview, openChatWith, currentUser } = useApp();
  const navigate = useNavigate();
  const page = getPage(id);
  const [activeTab, setActiveTab] = useState('Posts');
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!page) return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-600">Page not found</p>
        <button onClick={() => navigate('/')} className="mt-3 text-primary hover:underline text-[15px]">Go home</button>
      </div>
    </div>
  );

  const pagePosts = state.posts.filter(p => p.pageId === id).sort((a, b) => b.timestamp - a.timestamp);
  const isLiked = page.isLiked || false;
  const followerUsers = (page.followers || []).map(fid => getUser(fid)).filter(Boolean);
  const pagePhotoPosts = pagePosts.filter(p => p.image);

  const tabs = ['Posts', 'About', 'Reviews', 'Followers', 'Photos'];

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14">
      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightboxImage(null)}>
            <X size={32} />
          </button>
          <img src={lightboxImage} alt="Photo" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[350px] rounded-b-lg overflow-hidden bg-gray-300">
            <img src={page.cover} alt="Cover" className="w-full h-full object-cover" />
          </div>

          {/* Page Info */}
          <div className="px-8 pb-4 relative">
            <div className="flex flex-col md:flex-row items-end md:items-end -mt-8 md:-mt-16 gap-4">
              <div className="relative">
                <div className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden bg-white">
                  <img src={page.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex-1 mb-4 text-center md:text-left">
                <h1 className="text-[32px] font-bold leading-tight">{page.name}</h1>
                <span className="text-gray-500 font-semibold text-[15px]">
                  {page.category && <span>{page.category} · </span>}
                  {page.followers.length} {page.followers.length === 1 ? 'follower' : 'followers'}
                  {page.reviews.length > 0 && <span> · {page.reviews.length} {page.reviews.length === 1 ? 'review' : 'reviews'}</span>}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors ${
                    isLiked ? 'bg-blue-100 text-primary hover:bg-blue-200' : 'bg-primary text-white hover:bg-blue-600'
                  }`}
                  onClick={() => togglePageLike(id)}
                >
                  <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                  onClick={() => page.adminId && openChatWith(page.adminId)}
                >
                  <MessageCircle size={16} /> Message
                </button>
                <button
                  className="bg-gray-200 text-black px-3 py-2 rounded-md hover:bg-gray-300"
                  title="Share page"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-300 mt-8"></div>

            <div className="flex items-center gap-1 mt-1 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-[15px] rounded-md cursor-pointer whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-[3px] border-primary rounded-b-none' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1095px] mx-auto py-4 px-4">

        {/* POSTS TAB */}
        {activeTab === 'Posts' && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[40%] flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-3">About</h2>
                <p className="text-[15px] mb-4">{page.description}</p>
                <div className="flex items-center gap-2 text-gray-500 text-[15px] mb-2">
                  <ThumbsUp size={18} />
                  <span>{page.followers.length} people like this</span>
                </div>
                {page.reviews.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-500 text-[15px]">
                    <Star size={18} />
                    <span>{(page.reviews.reduce((s, r) => s + r.rating, 0) / page.reviews.length).toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Reviews</h2>
                  <span className="text-primary text-[15px] cursor-pointer hover:underline" onClick={() => setActiveTab('Reviews')}>See all</span>
                </div>
                {page.reviews.slice(0, 3).map(review => {
                  const reviewer = getUser(review.userId);
                  return (
                    <div key={review.id} className="mb-3 border-b border-gray-100 pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        {reviewer && <img src={reviewer.avatar} alt={reviewer.name} className="w-6 h-6 rounded-full object-cover" />}
                        {reviewer && <span className="text-[13px] font-semibold">{reviewer.name}</span>}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        {[...Array(5 - review.rating)].map((_, i) => <Star key={`e${i}`} size={14} className="text-gray-300" />)}
                      </div>
                      <p className="text-[15px]">{review.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-[60%]">
              {pagePosts.map(post => <Post key={post.id} post={post} />)}
              {pagePosts.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">No posts yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'About' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About {page.name}</h2>
              <p className="text-[15px] mb-4 text-gray-700">{page.description}</p>
              <div className="space-y-3">
                {page.category && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500">Category</p>
                      <p className="font-semibold">{page.category}</p>
                    </div>
                  </div>
                )}
                {page.website && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500">Website</p>
                      <a href={page.website} className="text-primary hover:underline">{page.website}</a>
                    </div>
                  </div>
                )}
                {page.phone && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500">Phone</p>
                      <p>{page.phone}</p>
                    </div>
                  </div>
                )}
                {page.address && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500">Address</p>
                      <p>{page.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-[15px] mt-6 pt-4 border-t border-gray-200">
                <ThumbsUp size={18} />
                <span>{page.followers.length} people like this page</span>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'Reviews' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Reviews ({page.reviews.length})</h2>
              <WriteReviewForm
                pageId={id}
                currentUser={currentUser}
                onSubmit={(review) => addPageReview(id, review)}
              />
              {page.reviews.length === 0 ? (
                <p className="text-gray-500 text-[15px]">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {page.reviews.map(review => {
                    const reviewer = getUser(review.userId);
                    return (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          {reviewer && <img src={reviewer.avatar} alt={reviewer.name} className="w-10 h-10 rounded-full object-cover" />}
                          <div>
                            {reviewer && <p className="font-semibold text-[15px]">{reviewer.name}</p>}
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                              {[...Array(5 - review.rating)].map((_, i) => <Star key={`e${i}`} size={16} className="text-gray-300" />)}
                            </div>
                          </div>
                          {review.timestamp && (
                            <span className="ml-auto text-[13px] text-gray-500">
                              {new Date(review.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[15px]">{review.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOLLOWERS TAB */}
        {activeTab === 'Followers' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">Followers</h2>
              <p className="text-[15px] text-gray-500">{followerUsers.length} followers</p>
            </div>
            {followerUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No followers yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {followerUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(user.id === currentUser.id ? '/profile' : `/profile/${user.id}`)}
                  >
                    <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-[15px]">{user.name}</p>
                      <p className="text-[13px] text-gray-500">{user.location || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'Photos' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">Photos</h2>
              <p className="text-[15px] text-gray-500">{pagePhotoPosts.length} photos</p>
            </div>
            {pagePhotoPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 bg-white rounded-lg shadow-sm overflow-hidden p-1">
                {pagePhotoPosts.map(post => (
                  <div key={post.id} className="aspect-square overflow-hidden cursor-pointer group" onClick={() => setLightboxImage(post.image)}>
                    <img src={post.image} alt="Photo" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageProfile;
