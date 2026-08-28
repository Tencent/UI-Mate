import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Upload, X, Image } from 'lucide-react';

function makeListingImage(title, category) {
  const label = (title || category || 'xBay').slice(0, 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f5"/><rect x="28" y="28" width="344" height="344" rx="18" fill="#ffffff" stroke="#e5e7eb" stroke-width="6"/><circle cx="200" cy="150" r="54" fill="#e53238"/><rect x="96" y="232" width="208" height="18" rx="9" fill="#0064d2"/><rect x="128" y="266" width="144" height="14" rx="7" fill="#86b817"/><text x="200" y="330" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#333333">${label.replace(/[&<>"']/g, '')}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const { createListing } = useStore();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'auction',
    price: '',
    buyItNowPrice: '',
    condition: 'Used',
    shipping: '',
    category: 'Electronics',
    duration: '7'
  });

  const [uploadedImages, setUploadedImages] = useState([]); // { url, name }
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImages(prev => [
          ...prev,
          { url: ev.target.result, name: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    } else if (formData.title.trim().length > 80) {
      newErrors.title = 'Title must be 80 characters or fewer.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters.';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = formData.type === 'auction'
        ? 'Starting bid must be greater than $0.'
        : 'Price must be greater than $0.';
    }

    if (formData.type === 'auction' && formData.buyItNowPrice) {
      const bin = parseFloat(formData.buyItNowPrice);
      if (isNaN(bin) || bin <= 0) {
        newErrors.buyItNowPrice = 'Buy It Now price must be greater than $0.';
      } else if (!isNaN(price) && price > 0 && bin <= price) {
        newErrors.buyItNowPrice = 'Buy It Now price must be greater than the starting bid.';
      }
    }

    const shipping = parseFloat(formData.shipping);
    if (formData.shipping === '' || isNaN(shipping)) {
      newErrors.shipping = 'Shipping cost is required. Enter 0 for free shipping.';
    } else if (shipping < 0) {
      newErrors.shipping = 'Shipping cost cannot be negative.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const endTime = Date.now() + (parseInt(formData.duration) * 24 * 60 * 60 * 1000);
    const price = parseFloat(formData.price);
    const shipping = parseFloat(formData.shipping) || 0;

    const images = uploadedImages.length > 0
      ? uploadedImages.map(img => img.url)
      : [makeListingImage(formData.title.trim(), formData.category)];

    const newListing = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      startingBid: formData.type === 'auction' ? price : null,
      currentBid: formData.type === 'auction' ? price : null,
      price: formData.type === 'fixed' ? price : null,
      buyItNowPrice: formData.buyItNowPrice ? parseFloat(formData.buyItNowPrice) : (formData.type === 'fixed' ? price : null),
      condition: formData.condition,
      shipping,
      category: formData.category,
      endTime,
      images
    };

    createListing(newListing);
    navigate('/dashboard?tab=selling');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Your Listing</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6" noValidate>

        <div>
          <label className="block text-sm font-bold mb-2">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            placeholder="What are you selling? (3–80 characters)"
            maxLength={80}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          <p className="text-xs text-gray-400 mt-1">{formData.title.length}/80</p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Photos</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 hover:border-xbay-blue transition-colors"
          >
            <Upload className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF supported</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded border border-gray-200 overflow-hidden bg-gray-100 group">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-100 transition-opacity"
                    title={`Remove ${img.name}`}
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-xbay-blue/80 text-white text-[10px] text-center py-0.5">Main</span>
                  )}
                </div>
              ))}
              {uploadedImages.length < 12 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-xbay-blue hover:bg-gray-50 transition-colors"
                >
                  <Image size={20} className="text-gray-400" />
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {uploadedImages.length === 0
              ? 'No photos uploaded. A generated product image will be attached when you list the item.'
              : `${uploadedImages.length} photo${uploadedImages.length !== 1 ? 's' : ''} uploaded`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="input-field">
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

        <div>
          <label className="block text-sm font-bold mb-2">Condition</label>
          <select name="condition" value={formData.condition} onChange={handleChange} className="input-field">
            <option value="New">New</option>
            <option value="Open Box">Open Box</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
            <option value="For Parts">For Parts or Not Working</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`input-field ${errors.description ? 'border-red-500' : ''}`}
            rows="6"
            placeholder="Describe your item in detail (condition, features, included accessories, etc.)"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Format</label>
            <select name="type" value={formData.type} onChange={handleChange} className="input-field">
              <option value="auction">Auction</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Duration</label>
            <select name="duration" value={formData.duration} onChange={handleChange} className="input-field">
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">
              {formData.type === 'auction' ? 'Starting Bid ($)' : 'Price ($)'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`input-field ${errors.price ? 'border-red-500' : ''}`}
              min="0.01"
              step="0.01"
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {formData.type === 'auction' && (
            <div>
              <label className="block text-sm font-bold mb-2">Buy It Now Price (Optional)</label>
              <input
                type="number"
                name="buyItNowPrice"
                value={formData.buyItNowPrice}
                onChange={handleChange}
                className={`input-field ${errors.buyItNowPrice ? 'border-red-500' : ''}`}
                min="0.01"
                step="0.01"
                placeholder="Must be > starting bid"
              />
              {errors.buyItNowPrice && <p className="text-red-500 text-xs mt-1">{errors.buyItNowPrice}</p>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Shipping Cost ($) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="shipping"
            value={formData.shipping}
            onChange={handleChange}
            className={`input-field ${errors.shipping ? 'border-red-500' : ''}`}
            min="0"
            step="0.01"
            placeholder="Enter 0 for free shipping"
          />
          {errors.shipping && <p className="text-red-500 text-xs mt-1">{errors.shipping}</p>}
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-full">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            List Item
          </button>
        </div>

      </form>
    </div>
  );
}
