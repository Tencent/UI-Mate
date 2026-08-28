import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Heart, Share, Bed, Bath, Square, Calendar, MapPin, DollarSign, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Map from '../components/Map';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleSaveProperty, scheduleTour, addContactRequest, addShareDraft } = useStore();
  const [property, setProperty] = useState(null);
  
  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // Mortgage Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // Tour State
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('10:00 AM'); // Default time
  const [tourSubmitted, setTourSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [shareRecipient, setShareRecipient] = useState('');
  const [shareSaved, setShareSaved] = useState(false);
  const [contactForm, setContactForm] = useState({
      name: state.user.username || '',
      email: state.user.email || '',
      phone: '',
      message: 'I would like more information about this property.'
  });
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    const found = state.properties.find(p => p.id === id);
    if (found) {
        setProperty(found);
        // Generate 20+ mock images for the gallery
        const mockImages = [];
        for (let i = 0; i < 25; i++) {
            mockImages.push(`https://picsum.photos/1200/800?random=${id}-${i}`);
        }
        setGalleryImages(mockImages);
    } else {
        navigate('/');
    }
  }, [id, state.properties, navigate]);

  useEffect(() => {
      const handleKeyDown = (event) => {
          if (event.key === 'Escape') {
              setShowShareModal(false);
              setShowContactModal(false);
              if (isGalleryOpen) closeGallery();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

  if (!property) return <div className="p-10 text-center">Loading...</div>;

  const isSaved = state.user.savedProperties.includes(property.id);
  const agent = state.agents.find(a => a.id === property.agentId);

  // Mortgage Calculations
  const downPaymentAmount = (property.price * downPaymentPercent) / 100;
  const loanAmount = property.price - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyPrincipalInterest = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const monthlyTax = property.price * 0.012 / 12; // Est 1.2% tax
  const monthlyInsurance = property.price * 0.005 / 12; // Est 0.5% ins
  const totalMonthly = monthlyPrincipalInterest + monthlyTax + monthlyInsurance;

  const handleScheduleTour = (e) => {
      e.preventDefault();
      if (!tourDate) {
          setShowCalendar(true);
          return;
      }
      scheduleTour({
          propertyId: property.id,
          userId: state.user.userId,
          date: tourDate,
          time: tourTime
      });
      setTourSubmitted(true);
  };

  const openGallery = (index) => {
      setActiveImageIndex(index);
      setIsGalleryOpen(true);
      document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
      setIsGalleryOpen(false);
      document.body.style.overflow = 'auto';
  };

  const nextGalleryImage = (e) => {
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevGalleryImage = (e) => {
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleShare = (event) => {
      event.preventDefault();
      const shareUrl = `${window.location.origin}/property/${property.id}`;
      addShareDraft({
          propertyId: property.id,
          address: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
          recipient: shareRecipient || 'Copied link',
          url: shareUrl,
      });
      if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      setShareSaved(true);
      setTimeout(() => {
          setShareSaved(false);
          setShowShareModal(false);
          setShareRecipient('');
      }, 1200);
  };

  const handleContactAgent = (event) => {
      event.preventDefault();
      addContactRequest({
          propertyId: property.id,
          agentId: agent?.id,
          agentName: agent?.name,
          ...contactForm,
      });
      setContactSaved(true);
      setTimeout(() => {
          setContactSaved(false);
          setShowContactModal(false);
      }, 1400);
  };

  // Generate mock comparable sales
  const comparables = [
      {
          id: 'c1',
          address: `${Number(property.address.split(' ')[0]) + 10} ${property.address.split(' ').slice(1).join(' ')}`,
          price: property.price * 0.95,
          soldDate: 'Sold 2 months ago',
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft - 100,
          image: `https://picsum.photos/seed/${property.id}c1/400/300`
      },
      {
          id: 'c2',
          address: `${Number(property.address.split(' ')[0]) - 25} ${property.address.split(' ').slice(1).join(' ')}`,
          price: property.price * 1.05,
          soldDate: 'Sold 3 weeks ago',
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft + 150,
          image: `https://picsum.photos/seed/${property.id}c2/400/300`
      },
      {
          id: 'c3',
          address: `123 Nearby St`,
          price: property.price * 0.98,
          soldDate: 'Sold 5 months ago',
          beds: property.beds - 1,
          baths: property.baths,
          sqft: property.sqft - 300,
          image: `https://picsum.photos/seed/${property.id}c3/400/300`
      }
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[400px] md:h-[500px] relative">
         <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => openGallery(0)}>
            <img src={property.images[0]} className="w-full h-full object-cover hover:opacity-95 transition" />
         </div>
         <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(1)}>
            <img src={property.images[1]} className="w-full h-full object-cover hover:opacity-95 transition" />
         </div>
         <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(2)}>
            <img src={property.images[2]} className="w-full h-full object-cover hover:opacity-95 transition" />
         </div>
         <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(3)}>
            <img src={property.images[3] || property.images[0]} className="w-full h-full object-cover hover:opacity-95 transition" />
         </div>
         <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => openGallery(0)}>
            <img src={property.images[0]} className="w-full h-full object-cover hover:opacity-95 transition" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold hover:bg-black/60">
                View All {galleryImages.length} Photos
            </div>
         </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {isGalleryOpen && (
          <div className="fixed inset-0 z-[3000] bg-black flex flex-col">
              <div className="flex justify-between items-center p-4 text-white">
                  <span className="font-medium">{activeImageIndex + 1} / {galleryImages.length}</span>
                  <button onClick={closeGallery} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-1 relative flex items-center justify-center bg-black">
                  <img 
                    src={galleryImages[activeImageIndex]} 
                    alt={`View ${activeImageIndex + 1}`} 
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  <button onClick={prevGalleryImage} className="absolute left-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/80">
                      <ChevronLeft size={32} />
                  </button>
                  <button onClick={nextGalleryImage} className="absolute right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/80">
                      <ChevronRight size={32} />
                  </button>
              </div>
              <div className="h-24 bg-black/90 flex gap-2 overflow-x-auto p-4 justify-center">
                  {galleryImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        className={`h-full aspect-video object-cover cursor-pointer ${idx === activeImageIndex ? 'border-2 border-white' : 'opacity-50 hover:opacity-100'}`}
                        onClick={() => setActiveImageIndex(idx)}
                      />
                  ))}
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        ${property.price.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">For Sale</span>
                    </h1>
                    <p className="text-xl text-gray-700 mt-1">{property.address}, {property.city}, {property.state} {property.zip}</p>
                    <div className="flex gap-6 mt-4 text-gray-700">
                        <div className="flex items-center gap-2"><span className="font-bold text-xl">{property.beds}</span> bds</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-xl">{property.baths}</span> ba</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-xl">{property.sqft.toLocaleString()}</span> sqft</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => toggleSaveProperty(property.id)} className="flex flex-col items-center gap-1 text-brand-500 hover:bg-brand-50 p-2 rounded transition">
                        <Heart fill={isSaved ? "currentColor" : "none"} />
                        <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center gap-1 text-brand-500 hover:bg-brand-50 p-2 rounded transition">
                        <Share />
                        <span className="text-xs">Share</span>
                    </button>
                </div>
            </div>

            <hr className="my-8" />

            {/* Description */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">About this home</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded">
                            <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                            {feature}
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="mb-8 h-[300px] rounded-xl overflow-hidden border border-gray-200">
                <Map properties={[property]} center={property.coordinates} zoom={15} />
            </div>

            {/* Mortgage Calculator */}
            <div id="mortgage-calculator" className="bg-gray-50 p-6 rounded-xl mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <DollarSign className="text-brand-500" /> 
                    Mortgage Calculator
                </h2>
                <div className="mb-4 text-2xl font-bold text-gray-900">
                    Est. Payment: ${Math.round(totalMonthly).toLocaleString()}/mo
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment ({downPaymentPercent}%)</label>
                        <input 
                            type="range" min="0" max="50" step="5"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                            className="w-full mb-2 cursor-pointer"
                        />
                        <div className="text-right font-bold text-brand-700">${downPaymentAmount.toLocaleString()}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                        <input 
                            type="number" step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
                        <select 
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value={30}>30 Years</option>
                            <option value={15}>15 Years</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                        <span>Principal & Interest</span>
                        <span className="font-medium">${Math.round(monthlyPrincipalInterest).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Property Taxes</span>
                        <span className="font-medium">${Math.round(monthlyTax).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Home Insurance</span>
                        <span className="font-medium">${Math.round(monthlyInsurance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Comparable Sales Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Nearby Similar Homes Sold</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparables.map(comp => (
                        <div key={comp.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="h-32 bg-gray-200 relative">
                                <img src={comp.image} alt="Comparable" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 px-2">
                                    {comp.soldDate}
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="font-bold text-lg">${comp.price.toLocaleString()}</div>
                                <div className="text-sm text-gray-600 mb-1">
                                    {comp.beds}bd {comp.baths}ba {comp.sqft.toLocaleString()}sqft
                                </div>
                                <div className="text-xs text-gray-500 truncate">{comp.address}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                {/* Tour Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Schedule a Tour</h3>
                    
                    {!tourSubmitted ? (
                        <form onSubmit={handleScheduleTour} className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:border-brand-500"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                >
                                    <span>{tourDate || 'Select a date'}</span>
                                    <Calendar size={16} className="text-gray-500" />
                                </div>
                                
                                {showCalendar && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50">
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-bold text-gray-500">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                                <button 
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        setTourDate(`2024-05-${day.toString().padStart(2, '0')}`);
                                                        setShowCalendar(false);
                                                    }}
                                                    className="p-1 text-sm hover:bg-brand-50 rounded"
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                                    value={tourTime}
                                    onChange={(e) => setTourTime(e.target.value)}
                                    required
                                >
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600 transition">
                                Request Tour
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                            <p className="font-bold mb-2">Request Sent!</p>
                            <p className="text-sm">An agent will confirm your appointment shortly.</p>
                        </div>
                    )}
                </div>

                {/* Agent Card */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Listing Agent</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <img src={agent?.avatar} className="w-12 h-12 rounded-full" alt={agent?.name} />
                        <div>
                            <div className="font-bold">{agent?.name}</div>
                            <div className="text-sm text-gray-600">Premier Agent</div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{agent?.phone}</p>
                        <p>{agent?.email}</p>
                    </div>
                    <button onClick={() => setShowContactModal(true)} className="w-full mt-4 border border-brand-500 text-brand-500 font-bold py-2 rounded-lg hover:bg-brand-50 transition">
                        Contact Agent
                    </button>
                </div>
            </div>
        </div>
      </div>

      {showShareModal && (
          <div className="fixed inset-0 z-[2500] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Share listing</h2>
                      <button onClick={() => setShowShareModal(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close share dialog"><X size={20} /></button>
                  </div>
                  {shareSaved ? (
                      <div className="rounded-lg bg-green-50 text-green-700 p-4 font-medium">Share draft saved and link copied.</div>
                  ) : (
                      <form onSubmit={handleShare} className="space-y-4">
                          <div className="text-sm text-gray-600">{property.address}, {property.city}, {property.state} {property.zip}</div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient or note</label>
                              <input
                                  type="text"
                                  value={shareRecipient}
                                  onChange={(event) => setShareRecipient(event.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                  placeholder="e.g. Jamie or my shortlist"
                              />
                          </div>
                          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600">
                              Save share draft
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}

      {showContactModal && (
          <div className="fixed inset-0 z-[2500] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Contact {agent?.name}</h2>
                      <button onClick={() => setShowContactModal(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close contact dialog"><X size={20} /></button>
                  </div>
                  {contactSaved ? (
                      <div className="rounded-lg bg-green-50 text-green-700 p-4 font-medium">Agent contact draft created locally.</div>
                  ) : (
                      <form onSubmit={handleContactAgent} className="space-y-4">
                          <input
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                              placeholder="Your name"
                          />
                          <input
                              type="email"
                              required
                              value={contactForm.email}
                              onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                              placeholder="Email"
                          />
                          <input
                              type="tel"
                              value={contactForm.phone}
                              onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                              placeholder="Phone"
                          />
                          <textarea
                              required
                              rows={4}
                              value={contactForm.message}
                              onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600">
                              Create contact draft
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}
