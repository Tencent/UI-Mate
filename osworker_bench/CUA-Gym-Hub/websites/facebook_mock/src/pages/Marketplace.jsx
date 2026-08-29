import React, { useState } from 'react';
import { Search, MapPin, Plus, Tag, X, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getSessionId } from '../store/initialData';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'property', label: 'Property Rentals' },
  { value: 'apparel', label: 'Apparel & Accessories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'family', label: 'Family' },
  { value: 'garden', label: 'Garden & Outdoor' },
  { value: 'hobbies', label: 'Hobbies' },
  { value: 'home_goods', label: 'Home Goods' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'free', label: 'Free Items' },
];

const ListingDetailModal = ({ listing, onClose, seller, onMessageSeller, onToggleSave, onShareListing }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-900 relative flex items-center justify-center min-h-[300px]">
          <img
            src={listing.images[currentImage]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {listing.images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                onClick={() => setCurrentImage(i => (i - 1 + listing.images.length) % listing.images.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                onClick={() => setCurrentImage(i => (i + 1) % listing.images.length)}
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {listing.images.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-[#050505]">
                {listing.price === 0 ? 'Free' : `$${listing.price.toLocaleString()}`}
              </p>
              <h2 className="text-xl font-semibold mt-1">{listing.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-4">
              <X size={24} />
            </button>
          </div>

          <p className="text-[13px] text-gray-500 mb-3">
            Listed {formatDistanceToNow(listing.listed, { addSuffix: true })}
          </p>

          <div className="flex items-center gap-2 mb-4 text-[13px] text-gray-600">
            <MapPin size={14} />
            <span>{listing.location}</span>
            <span className="mx-1">·</span>
            <Tag size={14} />
            <span className="capitalize">{listing.condition}</span>
          </div>

          {/* Seller */}
          {seller && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-[15px]">{seller.name}</p>
                <p className="text-[13px] text-gray-500">Seller</p>
              </div>
              <button className="bg-gray-200 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-300 flex items-center gap-1" onClick={() => { onMessageSeller && onMessageSeller(seller.id); onClose(); }}>
                <MessageCircle size={14} /> Message
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-[15px] mb-2">Description</h3>
            <p className="text-[15px] text-[#050505] leading-relaxed">{listing.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 flex items-center justify-center gap-2" onClick={() => { onMessageSeller && onMessageSeller(seller?.id); onClose(); }}>
              <MessageCircle size={16} /> Message Seller
            </button>
            <button className="w-11 h-11 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100" onClick={() => onToggleSave && onToggleSave(listing.id)}>
              <Heart size={20} className={listing.saved ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
            </button>
            <button className="w-11 h-11 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100" onClick={() => onShareListing?.(listing)}>
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateListingModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'electronics',
    condition: 'Used - Good',
    location: 'San Francisco, CA',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      const sid = getSessionId();
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = await response.json();
      const uploadedUrls = (payload.files || []).map(file => file.url).filter(Boolean);
      if (uploadedUrls.length === 0) throw new Error('Upload response missing file URL');
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      setUploadError(error.message || 'Could not upload photos');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || isUploading) return;
    onSubmit({ ...form, images });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create New Listing</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="What are you selling?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price ($)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="0 for free"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              {CATEGORIES.slice(1).map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              {['New', 'Used - Like New', 'Used - Good', 'Used - Fair'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe your item..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px] resize-none"
              required
            />
          </div>
          <label className="block p-3 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500 cursor-pointer hover:bg-gray-50">
            <Plus size={24} className="mx-auto mb-1" />
            <p className="text-sm font-medium">{isUploading ? 'Uploading photos...' : 'Add Photos'}</p>
            <p className="text-xs">{images.length ? `${images.length} photo${images.length === 1 ? '' : 's'} attached` : 'Choose one or more item photos'}</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={image} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                  <img src={image} alt={`Listing upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-gray-700 flex items-center justify-center hover:bg-white shadow"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-2.5 rounded-md font-semibold text-[15px] ${isUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600'}`}
          >
            {isUploading ? 'Uploading...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const { state, getUser, addListing, currentUser, openChatWith, toggleSaveListing } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeNav, setActiveNav] = useState('Browse All');
  const [toast, setToast] = useState('');

  const listings = state.marketplace || [];

  const filteredListings = listings.filter(l => {
    const matchesSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || l.category === selectedCategory;
    const matchesNav = activeNav !== 'Your Listings' || l.sellerId === currentUser.id;
    return matchesSearch && matchesCategory && matchesNav;
  });

  const handleCreateListing = (form) => {
    const newListing = {
      id: `listing_${Date.now()}`,
      sellerId: currentUser.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price) || 0,
      currency: 'USD',
      category: form.category,
      condition: form.condition,
      images: form.images && form.images.length > 0 ? form.images : [`https://picsum.photos/600/600?random=listing_${Date.now()}`],
      location: form.location || currentUser.location || 'San Francisco, CA',
      listed: Date.now(),
      saved: false
    };
    addListing(newListing);
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleShareListing = async (listing) => {
    const shareText = `${listing.title} - ${listing.price === 0 ? 'Free' : `$${listing.price.toLocaleString()}`}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text: shareText });
        showToast('Listing shared');
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showToast('Listing details copied');
        return;
      }
      showToast(shareText);
    } catch (error) {
      showToast('Share canceled');
    }
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex">
      {/* Left Sidebar */}
      <div className="w-[360px] bg-white h-[calc(100vh-56px)] fixed left-0 overflow-y-auto p-4 shadow-sm hidden lg:block">
        <h2 className="text-2xl font-bold mb-4">Marketplace</h2>

        {/* Sidebar Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Marketplace"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 text-[15px]"
          />
        </div>

        {/* Nav Links */}
        <nav className="space-y-1 mb-4">
          {['Browse All', 'Notifications', 'Your Listings'].map((item) => (
            <div
              key={item}
              onClick={() => setActiveNav(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text-[15px] ${activeNav === item ? 'bg-blue-50 text-primary' : 'hover:bg-gray-100 text-[#050505]'}`}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 my-3" />

        {/* Filters */}
        <div className="mb-3">
          <h3 className="font-semibold text-[17px] mb-2">Filters</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-[15px]">San Francisco, CA - Within 60 km</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-[15px]"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-primary text-white py-2.5 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 text-[15px]"
        >
          <Plus size={18} /> Create New Listing
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[360px] p-4">
        {/* Mobile search */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Marketplace"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-full pl-10 pr-4 py-2 outline-none shadow-sm text-[15px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {searchQuery || selectedCategory ? 'Search Results' : "Today's Picks"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="lg:hidden bg-primary text-white px-3 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600 text-[14px]"
            >
              <Plus size={16} /> Create
            </button>
            <span className="text-[13px] text-gray-500">{filteredListings.length} items</span>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Search size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-xl font-semibold text-gray-700 mb-1">No results found</p>
            <p className="text-[15px]">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
                onClick={() => setSelectedListing(listing)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-[17px] text-[#050505] leading-tight">
                    {listing.price === 0 ? 'Free' : `$${listing.price.toLocaleString()}`}
                  </p>
                  <p className="text-[15px] text-[#050505] truncate mt-0.5">{listing.title}</p>
                  <p className="text-[13px] text-[#65676B] mt-0.5">{listing.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={listings.find(l => l.id === selectedListing.id) || selectedListing}
          seller={getUser(selectedListing.sellerId)}
          onClose={() => setSelectedListing(null)}
          onMessageSeller={(sellerId) => { openChatWith(sellerId); }}
          onToggleSave={(listingId) => { toggleSaveListing(listingId); }}
          onShareListing={handleShareListing}
        />
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateListing}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-[#242526] text-white px-4 py-2 rounded-md shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
