import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { Package, Gavel, Heart, MessageSquare, ThumbsUp, ThumbsDown, Minus, Eye, Bell, X, Reply, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const { state, endListing, leaveFeedback, sendMessage, markMessageRead, editListing } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'buying');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [watchlistNotifs, setWatchlistNotifs] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySent, setReplySent] = useState(false);
  const [endConfirmId, setEndConfirmId] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Sync tab from URL param
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const myBids = state.listings.filter(l =>
    l.bids.some(b => b.userId === state.currentUser.id) && l.status === 'active'
  );

  const myWatchlist = state.listings.filter(l =>
    l.watchers.includes(state.currentUser.id)
  );

  const myListings = state.listings.filter(l =>
    l.sellerId === state.currentUser.id && l.status === 'active'
  );

  const mySoldListings = state.listings.filter(l =>
    l.sellerId === state.currentUser.id && l.status === 'sold'
  );

  const myOrders = state.orders.filter(o =>
    o.buyerId === state.currentUser.id
  );

  // Inbox: messages TO the current user
  const inboxMessages = state.messages.filter(m => m.toId === state.currentUser.id);
  // Sent: messages FROM the current user
  const sentMessages = state.messages.filter(m => m.fromId === state.currentUser.id);

  const handleEndListing = (listingId) => {
    setEndConfirmId(listingId);
  };

  const confirmEndListing = () => {
    if (endConfirmId) {
      endListing(endConfirmId);
      setEndConfirmId(null);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rating = formData.get('rating');
    const comment = formData.get('comment');
    leaveFeedback(feedbackModal.orderId, feedbackModal.toUserId, rating, comment);
    setFeedbackModal(null);
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyContent('');
    setReplySent(false);
    if (!msg.read) {
      markMessageRead(msg.id);
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    sendMessage(
      selectedMessage.fromId,
      selectedMessage.listingId,
      `Re: ${selectedMessage.subject}`,
      replyContent
    );
    setReplySent(true);
    setReplyContent('');
    setTimeout(() => setReplySent(false), 2000);
  };

  const handleOpenEdit = (listing) => {
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.type === 'auction' ? (listing.startingBid || '') : (listing.price || ''),
      buyItNowPrice: listing.buyItNowPrice || '',
      condition: listing.condition,
      shipping: listing.shipping,
      category: listing.category,
    });
    setEditModal(listing);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModal) return;
    const price = parseFloat(editForm.price);
    const shipping = parseFloat(editForm.shipping);
    if (isNaN(price) || price <= 0) return;
    if (isNaN(shipping) || shipping < 0) return;
    const updates = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      condition: editForm.condition,
      shipping: shipping,
      category: editForm.category,
    };
    if (editModal.type === 'auction') {
      // Only update BIN price for auction (don't change currentBid if bids exist)
      if (editModal.bids.length === 0) {
        updates.startingBid = price;
        updates.currentBid = price;
      }
      if (editForm.buyItNowPrice) {
        const bin = parseFloat(editForm.buyItNowPrice);
        if (!isNaN(bin) && bin > 0) updates.buyItNowPrice = bin;
      } else {
        updates.buyItNowPrice = null;
      }
    } else {
      updates.price = price;
      updates.buyItNowPrice = price;
    }
    editListing(editModal.id, updates);
    setEditModal(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My xBay</h1>

      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
        {[
          { id: 'buying', label: 'Buying' },
          { id: 'selling', label: 'Selling' },
          { id: 'watchlist', label: 'Watchlist' },
          { id: 'messages', label: `Messages${inboxMessages.filter(m => !m.read).length > 0 ? ` (${inboxMessages.filter(m => !m.read).length})` : ''}` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 font-bold text-sm whitespace-nowrap ${activeTab === tab.id ? 'text-xbay-blue border-b-2 border-xbay-blue' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'buying' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gavel size={20} /> Active Bids
            </h2>
            {myBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myBids.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            ) : (
              <p className="text-gray-500">You haven't placed any bids yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package size={20} /> Purchase History
            </h2>
            {myOrders.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold text-gray-600">Item</th>
                      <th className="p-4 font-bold text-gray-600">Date</th>
                      <th className="p-4 font-bold text-gray-600">Total</th>
                      <th className="p-4 font-bold text-gray-600">Status</th>
                      <th className="p-4 font-bold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myOrders.map(order => {
                      const item = state.listings.find(l => l.id === order.listingId);
                      if (!item) return null;
                      const hasFeedback = state.feedbacks?.some(f => f.orderId === order.id && f.fromUserId === state.currentUser.id);
                      return (
                        <tr key={order.id}>
                          <td className="p-4">
                            <Link to={`/item/${item.id}`} className="font-medium text-xbay-blue hover:underline">
                              {item.title}
                            </Link>
                          </td>
                          <td className="p-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="p-4 font-bold">${order.amount.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold uppercase">
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {!hasFeedback ? (
                              <button
                                onClick={() => setFeedbackModal({ orderId: order.id, toUserId: item.sellerId })}
                                className="text-xbay-blue hover:underline font-medium"
                              >
                                Leave Feedback
                              </button>
                            ) : (
                              <span className="text-gray-400">Feedback Left</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No purchases yet.</p>
            )}
          </section>
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart size={20} /> Watchlist
            </h2>
            <button
              onClick={() => setWatchlistNotifs(!watchlistNotifs)}
              className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full border ${watchlistNotifs ? 'bg-blue-50 text-xbay-blue border-xbay-blue' : 'text-gray-500 border-gray-300'}`}
            >
              <Bell size={16} fill={watchlistNotifs ? "currentColor" : "none"} />
              {watchlistNotifs ? 'Notifications On' : 'Notifications Off'}
            </button>
          </div>

          {myWatchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myWatchlist.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <p className="text-gray-500">Your watchlist is empty.</p>
          )}
        </div>
      )}

      {activeTab === 'selling' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Listings</h2>
            <button onClick={() => navigate('/sell')} className="btn-primary text-sm">Create Listing</button>
          </div>

          <section>
            {myListings.length > 0 ? (
              <div className="space-y-4">
                {myListings.map(l => (
                  <div key={l.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <img src={l.images[0]} alt={l.title} className="w-20 h-20 object-cover rounded bg-gray-100" />
                    <div className="flex-1">
                      <Link to={`/item/${l.id}`} className="font-bold text-xbay-blue hover:underline text-lg">{l.title}</Link>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                        <span>
                          {l.type === 'auction'
                            ? <>Current Bid: <span className="font-bold text-gray-900">${l.currentBid.toFixed(2)}</span></>
                            : <>Price: <span className="font-bold text-gray-900">${(l.price || l.buyItNowPrice || 0).toFixed(2)}</span></>
                          }
                        </span>
                        <span>Bids: {l.bids.length}</span>
                        <span>Watchers: {l.watchers.length}</span>
                        <span className="flex items-center gap-1"><Eye size={14} /> {l.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="btn-secondary text-sm py-1.5 px-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleEndListing(l.id)}
                        className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
                      >
                        End Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="mb-4 text-gray-500">You don't have any active listings.</p>
                <button onClick={() => navigate('/sell')} className="btn-primary">Start Selling</button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Sold Items</h2>
            {mySoldListings.length > 0 ? (
              <div className="space-y-4">
                {mySoldListings.map(l => (
                  <div key={l.id} className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4 items-center opacity-75">
                    <img src={l.images[0]} alt={l.title} className="w-16 h-16 object-cover rounded bg-gray-100" />
                    <div>
                      <div className="font-bold text-gray-900">{l.title}</div>
                      <div className="text-sm text-green-600 font-bold">Sold for ${(l.currentBid || l.price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No sold items yet.</p>
            )}
          </section>
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={20} /> Messages
          </h2>

          {selectedMessage ? (
            /* Message Detail View */
            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex items-center gap-1 text-sm text-xbay-blue hover:underline mb-4"
              >
                <ArrowLeft size={16} /> Back to Inbox
              </button>
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedMessage.subject}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>From: <span className="font-medium text-gray-800">{state.users.find(u => u.id === selectedMessage.fromId)?.username}</span></span>
                  <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                </div>
                {selectedMessage.listingId && (() => {
                  const relatedListing = state.listings.find(l => l.id === selectedMessage.listingId);
                  return relatedListing ? (
                    <div className="mt-2 text-sm">
                      About: <Link to={`/item/${relatedListing.id}`} className="text-xbay-blue hover:underline">{relatedListing.title}</Link>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="text-gray-800 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedMessage.content}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-bold mb-2">Reply</label>
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none mb-3"
                  placeholder="Type your reply..."
                  required
                />
                <div className="flex items-center gap-3">
                  <button type="submit" className="bg-xbay-blue text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 flex items-center gap-1">
                    <Reply size={14} /> Send Reply
                  </button>
                  {replySent && <span className="text-green-600 text-sm font-medium">Reply sent!</span>}
                </div>
              </form>
            </div>
          ) : (
            /* Inbox List */
            <div>
              {inboxMessages.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {inboxMessages.slice().reverse().map(msg => {
                    const sender = state.users.find(u => u.id === msg.fromId);
                    return (
                      <div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {!msg.read && <span className="w-2 h-2 rounded-full bg-xbay-blue shrink-0" />}
                            <span className={`font-bold text-gray-900 ${!msg.read ? '' : 'font-medium'}`}>{sender?.username}</span>
                          </div>
                          <span className="text-xs text-gray-500 shrink-0 ml-2">{new Date(msg.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className={`text-sm mb-1 ${!msg.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.subject}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{msg.content}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No messages in your inbox.</p>
              )}

              {sentMessages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-3 text-gray-700">Sent Messages</h3>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {sentMessages.slice().reverse().map(msg => {
                      const recipient = state.users.find(u => u.id === msg.toId);
                      return (
                        <div key={msg.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-700">To: {recipient?.username}</span>
                            <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{msg.content}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Rating</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" value="positive" required className="accent-green-600" />
                    <span className="text-green-600 font-bold flex items-center gap-1"><ThumbsUp size={16} /> Positive</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" value="neutral" required className="accent-gray-500" />
                    <span className="text-gray-600 font-bold flex items-center gap-1"><Minus size={16} /> Neutral</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" value="negative" required className="accent-red-600" />
                    <span className="text-red-600 font-bold flex items-center gap-1"><ThumbsDown size={16} /> Negative</span>
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Comment</label>
                <textarea
                  name="comment"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  rows="3"
                  placeholder="Describe your experience..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Listing Confirmation Modal */}
      {endConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold mb-2">End Listing Early?</h3>
            <p className="text-gray-600 mb-1">
              {(() => {
                const l = state.listings.find(x => x.id === endConfirmId);
                return l ? `"${l.title}"` : 'this listing';
              })()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {state.listings.find(x => x.id === endConfirmId)?.bids?.length > 0
                ? 'This listing has active bids. Ending it early will cancel all bids.'
                : 'This listing will be marked as ended.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEndConfirmId(null)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndListing}
                className="bg-red-600 text-white px-4 py-2 rounded-full font-bold hover:bg-red-700"
              >
                End Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Listing</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  rows="4"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    {editModal.type === 'auction' ? 'Starting Bid ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                    min="0.01"
                    step="0.01"
                    readOnly={editModal.type === 'auction' && editModal.bids.length > 0}
                    aria-readonly={editModal.type === 'auction' && editModal.bids.length > 0}
                    title={editModal.type === 'auction' && editModal.bids.length > 0 ? 'Cannot change starting bid after bids are placed' : ''}
                    required
                  />
                  {editModal.type === 'auction' && editModal.bids.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">Cannot change after bids placed</p>
                  )}
                </div>
                {editModal.type === 'auction' && (
                  <div>
                    <label className="block text-sm font-bold mb-1">Buy It Now Price (Optional)</label>
                    <input
                      type="number"
                      value={editForm.buyItNowPrice}
                      onChange={e => setEditForm(f => ({ ...f, buyItNowPrice: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={e => setEditForm(f => ({ ...f, condition: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Open Box">Open Box</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="For Parts">For Parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Motors">Motors</option>
                    <option value="Collectibles">Collectibles</option>
                    <option value="Sports">Sports</option>
                    <option value="Home">Home &amp; Garden</option>
                    <option value="Books">Books</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Shipping Cost ($)</label>
                <input
                  type="number"
                  value={editForm.shipping}
                  onChange={e => setEditForm(f => ({ ...f, shipping: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
