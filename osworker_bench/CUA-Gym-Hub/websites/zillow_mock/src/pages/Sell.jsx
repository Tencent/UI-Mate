import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Home, FileText, Users, Check, ChevronDown, Star, MapPin, BarChart3, ExternalLink, X } from 'lucide-react';

function FSBOModal({ address, estimatedValue, onClose, onSubmitListing }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState(estimatedValue ? String(estimatedValue) : '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Please enter a valid listing price.'); return; }
    onSubmitListing({ name: name.trim(), email: email.trim(), phone: phone.trim(), address, price: Number(price), estimatedValue });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">List For Sale By Owner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>

        {!submitted ? (
          <>
            <p className="text-gray-600 text-sm mb-6">
              List your home directly on Xillow without an agent. You control the listing, the price, and the negotiations.
            </p>

            {address && (
              <div className="bg-brand-50 rounded-lg px-4 py-3 mb-6 flex items-center gap-2 text-sm text-brand-700">
                <MapPin size={16} />
                <span className="font-medium">{address}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Price ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 650000"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition"
              >
                Submit FSBO Listing
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Listing Submitted!</h3>
            <p className="text-gray-600 text-sm mb-6">
              Your For Sale By Owner listing request has been received. Our team will review and publish your listing within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-600 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceModal({ resource, onClose }) {
  const content = {
    'When Is the Best Time to Sell?': {
      body: 'Spring (March–May) is historically the best time to list your home. Buyer demand peaks, and homes sell faster and for more. Summer is also strong. Avoid listing in December–January when buyer activity drops. Locally, the Bay Area market stays active year-round due to tech demand.',
      tips: ['List in late March or April for maximum exposure', 'Avoid major holidays', 'Monitor local market trends before deciding', 'Consider school calendar — families prefer summer moves']
    },
    'How to Stage Your Home': {
      body: 'Professional staging can increase your sale price by 1–5% and reduce days on market. Focus on curb appeal, decluttering, and neutral colors that appeal to the widest range of buyers.',
      tips: ['Declutter every room — rent storage if needed', 'Deep clean and touch up paint', 'Add fresh flowers or plants', 'Ensure all lights work and use bright bulbs', 'Remove personal photos and bold decor', 'Hire a professional stager for key rooms']
    },
    'Understanding Closing Costs': {
      body: 'As a seller, expect to pay 6–10% of the sale price in closing costs. The largest expense is typically agent commissions (5–6%). Other costs include transfer taxes, title fees, and prorated property taxes.',
      tips: ['Budget 6–10% of sale price for closing costs', 'Agent commission: typically 5–6%', 'Transfer/excise taxes: 0.1–2% (varies by state)', 'Title insurance: ~0.5%', 'Prorated property taxes and HOA fees', 'Consider negotiating closing cost credits']
    },
    'FSBO vs. Agent: Which Is Right for You?': {
      body: 'Selling without an agent (FSBO) saves on commission but requires significant time and expertise. Homes sold with an agent typically sell for 6–10% more, often more than offsetting the commission.',
      tips: ['FSBO saves 5–6% in commission', 'Agent-listed homes sell for ~6% more on average', 'Agents handle showings, negotiations, and paperwork', 'FSBO requires pricing, marketing, and legal knowledge', 'Hybrid options (flat-fee MLS) offer middle ground', 'Consider your time, expertise, and local market']
    }
  };

  const info = content[resource.title] || { body: resource.desc, tips: [] };

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{resource.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 shrink-0"><X size={20} /></button>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{info.body}</p>
        {info.tips.length > 0 && (
          <>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Key Takeaways</h3>
            <ul className="space-y-2">
              {info.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-brand-500 text-white py-2 rounded-lg font-semibold hover:bg-brand-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Sell() {
  const { state, addSellerLead } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFSBOModal, setShowFSBOModal] = useState(false);
  const [activeResource, setActiveResource] = useState(null);

  const handleGetEstimate = () => {
    // Try to find the property in our data
    const found = state.properties.find(p =>
      (p.address + ' ' + p.city + ' ' + p.state + ' ' + p.zip).toLowerCase().includes(address.toLowerCase())
    );
    if (found) {
      setSelectedProperty(found);
      setEstimatedValue(found.zestimate || found.price);
    } else {
      // Generate mock estimate
      setSelectedProperty(null);
      setEstimatedValue(Math.round(550000 + Math.random() * 350000));
    }
    setShowEstimate(true);
  };

  // Agents who are listing agents
  const listingAgents = (state.agents || []).filter(a =>
    (a.specialties || []).includes('Listing Agent')
  ).slice(0, 3);

  const sellerResources = [
    { title: 'When Is the Best Time to Sell?', desc: 'Learn about seasonal trends and the best time to list your home.' },
    { title: 'How to Stage Your Home', desc: 'Tips from experts on staging your home to sell faster and for more.' },
    { title: 'Understanding Closing Costs', desc: 'A breakdown of seller closing costs and what to expect at settlement.' },
    { title: 'FSBO vs. Agent: Which Is Right for You?', desc: 'Compare the pros and cons of selling your home yourself vs. with an agent.' }
  ];

  useEffect(() => {
    if (!showFSBOModal && !activeResource) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowFSBOModal(false);
        setActiveResource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFSBOModal, activeResource]);

  return (
    <div className="bg-white min-h-screen">
      {/* FSBO Modal */}
      {showFSBOModal && (
        <FSBOModal
          address={selectedProperty ? `${selectedProperty.address}, ${selectedProperty.city}, ${selectedProperty.state}` : address}
          estimatedValue={estimatedValue}
          onClose={() => setShowFSBOModal(false)}
          onSubmitListing={addSellerLead}
        />
      )}

      {/* Resource Modal */}
      {activeResource && (
        <ResourceModal resource={activeResource} onClose={() => setActiveResource(null)} />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500 via-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sell with Confidence</h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl">
            Whether you list with a top agent or sell directly, Xillow helps you navigate every step.
          </p>

          {/* Address Lookup */}
          <div className="bg-white rounded-xl p-6 max-w-2xl shadow-2xl">
            <h3 className="text-gray-900 font-bold text-xl mb-3">Get your home value</h3>
            <p className="text-gray-600 text-sm mb-4">Enter your address to get a free Zestimate.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your home address"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setShowEstimate(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && address) handleGetEstimate(); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <button
                onClick={handleGetEstimate}
                disabled={!address}
                className="bg-brand-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-600 transition disabled:opacity-50 shrink-0"
              >
                Estimate
              </button>
            </div>

            {/* Estimate Result */}
            {showEstimate && estimatedValue && (
              <div className="mt-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-500">Estimated Zestimate</div>
                    <div className="text-3xl font-bold text-brand-600">${estimatedValue.toLocaleString()}</div>
                  </div>
                  <BarChart3 size={40} className="text-brand-400" />
                </div>
                {selectedProperty && (
                  <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <span>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</span>
                    <span className="text-gray-400">|</span>
                    <span>{selectedProperty.beds} bd, {selectedProperty.baths} ba, {selectedProperty.sqft.toLocaleString()} sqft</span>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => navigate('/agent-finder')}
                    className="flex-1 bg-brand-500 text-white py-2 rounded-lg font-medium hover:bg-brand-600 transition text-sm"
                  >
                    Find a Selling Agent
                  </button>
                  <button
                    onClick={() => setShowFSBOModal(true)}
                    className="flex-1 border border-brand-500 text-brand-500 py-2 rounded-lg font-medium hover:bg-brand-50 transition text-sm"
                  >
                    List For Sale By Owner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Selling on Xillow Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: DollarSign, title: 'Get Your Zestimate', desc: 'Start with a free home value estimate powered by data.' },
            { icon: Users, title: 'Choose Your Path', desc: 'List with a top agent or sell directly to a buyer.' },
            { icon: FileText, title: 'Prepare Your Listing', desc: 'Add photos, set your price, and create a compelling listing.' },
            { icon: TrendingUp, title: 'Close the Deal', desc: 'Review offers, negotiate, and close on your timeline.' }
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <step.icon size={28} />
              </div>
              <div className="text-sm text-brand-500 font-bold mb-1">Step {idx + 1}</div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Sell With An Agent */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Sell With a Xillow Premier Agent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Expert Pricing', desc: 'Agents use market data and local expertise to price your home competitively.', stat: '100%', statLabel: 'Data-driven pricing' },
              { title: 'Maximum Exposure', desc: 'Your listing reaches millions of buyers on Xillow, Trulia, and the MLS.', stat: '236M+', statLabel: 'Monthly visitors' },
              { title: 'Skilled Negotiation', desc: 'Top agents negotiate the best terms and price for your home.', stat: '$12K', statLabel: 'Avg. higher sale price' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-brand-500 mb-1">{item.stat}</div>
                <div className="text-xs text-gray-400 mb-4">{item.statLabel}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Agents */}
      {listingAgents.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Listing Agents Near You</h2>
            <Link to="/agent-finder" className="text-brand-500 font-medium text-sm hover:underline">
              View All Agents
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listingAgents.map(agent => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-brand-600">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.brokerage}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(agent.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{agent.rating} ({agent.reviewCount})</span>
                </div>
                <div className="text-xs text-gray-500">{agent.recentSales} Recent Sales</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller Resources */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerResources.map((resource, idx) => (
              <div
                key={idx}
                onClick={() => setActiveResource(resource)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-brand-300 transition cursor-pointer"
              >
                <h3 className="font-bold text-gray-900 mb-1 text-brand-700">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.desc}</p>
                <span className="text-xs text-brand-500 font-medium mt-2 inline-block">Read more →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
