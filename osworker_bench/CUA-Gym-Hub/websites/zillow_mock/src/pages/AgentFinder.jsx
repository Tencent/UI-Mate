import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../lib/store';
import { Search, Star, MapPin, Phone, Mail, Award, ChevronDown } from 'lucide-react';

export default function AgentFinder() {
  const { state } = useStore();
  const agents = state.agents || [];
  const resultsRef = useRef(null);

  const [locationFilter, setLocationFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [agentType, setAgentType] = useState('Both');
  const [serviceNeeded, setServiceNeeded] = useState('All');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      if (nameFilter && !agent.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (locationFilter) {
        const match = (agent.serviceAreas || []).some(area =>
          area.toLowerCase().includes(locationFilter.toLowerCase())
        );
        if (!match) return false;
      }
      if (serviceNeeded === 'Buying' && !(agent.specialties || []).includes("Buyer's Agent")) return false;
      if (serviceNeeded === 'Selling' && !(agent.specialties || []).includes('Listing Agent')) return false;
      // Agent type filter
      if (agentType === 'Individual' && agent.isTeam) return false;
      if (agentType === 'Team' && !agent.isTeam) return false;
      return true;
    });
  }, [agents, locationFilter, nameFilter, agentType, serviceNeeded]);

  const featuredAgents = filteredAgents.filter(a => a.isFeatured);
  const regularAgents = filteredAgents.filter(a => !a.isFeatured);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} size={14} className="text-yellow-400 fill-yellow-200" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Real Estate Agent</h1>
      <p className="text-gray-600 mb-8">Connect with a local expert to buy, sell, or rent your next home.</p>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Location (City or Area)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Agent name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <button
            onClick={() => {
              // Scroll to results section to show filtered agents
              if (resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-brand-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-600 transition shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Agent Type */}
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
            {['Both', 'Individual', 'Team'].map(type => (
              <button
                key={type}
                onClick={() => setAgentType(type)}
                className={`px-4 py-2 text-sm font-medium transition ${agentType === type ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Service Needed */}
          <select
            value={serviceNeeded}
            onChange={(e) => setServiceNeeded(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer hover:border-brand-500"
          >
            <option value="All">All Services</option>
            <option value="Buying">Buying</option>
            <option value="Selling">Selling</option>
          </select>
        </div>
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={22} /> Featured Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAgents.map(agent => (
              <div key={agent.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl shrink-0">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-600">{agent.name}</h3>
                    <div className="text-sm text-gray-600">{agent.brokerage}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(agent.rating)}
                  <span className="text-sm text-gray-500 ml-1">{agent.rating} ({agent.reviewCount} reviews)</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{agent.bio}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Phone size={14} /> {agent.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Mail size={14} /> {agent.email}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>{agent.recentSales} Recent Sales</span>
                  <span>{(agent.serviceAreas || []).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent List */}
      <div ref={resultsRef}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          All Agents <span className="text-sm font-normal text-gray-500">({filteredAgents.length} results)</span>
        </h2>
        <div className="space-y-4">
          {(regularAgents.length > 0 ? regularAgents : filteredAgents).map(agent => (
            <div key={agent.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-brand-600">{agent.name}</h3>
                  {agent.isFeatured && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">Featured</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-1">{agent.brokerage}</div>
                <div className="flex items-center gap-1 mb-1">
                  {renderStars(agent.rating)}
                  <span className="text-xs text-gray-500 ml-1">{agent.rating} ({agent.reviewCount} reviews)</span>
                </div>
                <div className="text-xs text-gray-500">
                  {agent.recentSales} Recent Sales {' '} {(agent.specialties || []).join(', ')}
                </div>
              </div>
              <div className="text-right shrink-0 hidden md:block">
                <div className="text-sm text-gray-600 mb-1">{agent.phone}</div>
                <div className="text-xs text-gray-400">{(agent.serviceAreas || []).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No agents found matching your criteria.</p>
          <button
            onClick={() => { setLocationFilter(''); setNameFilter(''); setServiceNeeded('All'); setAgentType('Both'); }}
            className="text-brand-500 font-medium mt-2 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
