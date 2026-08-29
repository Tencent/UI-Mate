import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Bookmark, BookmarkCheck, MapPin, Briefcase, Search, X, ChevronDown, Clock, Building2, CheckCircle2, Bell, BellOff } from 'lucide-react';

const DATE_OPTIONS = ['Any time', 'Past 24 hours', 'Past week', 'Past month'];
const LEVEL_OPTIONS = ['Any level', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive'];
const TYPE_OPTIONS = ['Any type', 'Full-time', 'Part-time', 'Contract', 'Internship'];

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const isActive = value !== options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
          isActive ? 'bg-xinkedin-blue text-white border-xinkedin-blue' : 'border-gray-400 text-gray-600 hover:bg-gray-100'
        }`}
      >
        {label}{isActive ? `: ${value}` : ''}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-48">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${value === opt ? 'text-xinkedin-blue font-semibold' : 'text-gray-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Jobs() {
  const { state, saveJob, applyToJob, followCompany, unfollowCompany } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [dateFilter, setDateFilter] = useState('Any time');
  const [levelFilter, setLevelFilter] = useState('Any level');
  const [typeFilter, setTypeFilter] = useState('Any type');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [sidebarView, setSidebarView] = useState('all'); // 'all', 'saved', 'applied'

  const filteredJobs = useMemo(() => {
    let jobs = [...state.jobs];

    // Sidebar filter
    if (sidebarView === 'saved') {
      jobs = jobs.filter(j => j.saved);
    } else if (sidebarView === 'applied') {
      jobs = jobs.filter(j => j.applied);
    }

    // Search keyword
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw)
      );
    }

    // Search location
    if (searchLocation.trim()) {
      const loc = searchLocation.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
    }

    // Level filter
    if (levelFilter !== 'Any level') {
      jobs = jobs.filter(j => j.level === levelFilter);
    }

    // Type filter
    if (typeFilter !== 'Any type') {
      jobs = jobs.filter(j => j.type === typeFilter);
    }

    // Remote toggle
    if (remoteOnly) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes('remote'));
    }

    // Date Posted filter
    if (dateFilter !== 'Any time') {
      const now = Date.now();
      const cutoffMs = {
        'Past 24 hours': 24 * 60 * 60 * 1000,
        'Past week': 7 * 24 * 60 * 60 * 1000,
        'Past month': 30 * 24 * 60 * 60 * 1000
      }[dateFilter];
      if (cutoffMs) {
        jobs = jobs.filter(j => {
          if (!j.postedDate) return true; // keep jobs without a machine-readable date
          const postedMs = new Date(j.postedDate).getTime();
          return (now - postedMs) <= cutoffMs;
        });
      }
    }

    return jobs;
  }, [state.jobs, searchKeyword, searchLocation, dateFilter, levelFilter, typeFilter, remoteOnly, sidebarView]);

  const selectedJob = selectedJobId ? state.jobs.find(j => j.id === selectedJobId) : null;
  const savedCount = state.jobs.filter(j => j.saved).length;
  const appliedCount = state.jobs.filter(j => j.applied).length;

  const activeFilterCount = [
    dateFilter !== 'Any time',
    levelFilter !== 'Any level',
    typeFilter !== 'Any type',
    remoteOnly
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <div className="md:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-2">
          <button
            onClick={() => { setSidebarView('all'); setSelectedJobId(null); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm font-semibold ${sidebarView === 'all' ? 'text-xinkedin-blue bg-blue-50' : 'text-gray-600'}`}
          >
            <span className="flex items-center gap-3"><Briefcase size={20} /> Recommended</span>
          </button>
          <button
            onClick={() => { setSidebarView('saved'); setSelectedJobId(null); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm font-semibold ${sidebarView === 'saved' ? 'text-xinkedin-blue bg-blue-50' : 'text-gray-600'}`}
          >
            <span className="flex items-center gap-3"><Bookmark size={20} /> Saved Jobs</span>
            {savedCount > 0 && <span className="text-xs text-gray-500">{savedCount}</span>}
          </button>
          <button
            onClick={() => { setSidebarView('applied'); setSelectedJobId(null); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm font-semibold ${sidebarView === 'applied' ? 'text-xinkedin-blue bg-blue-50' : 'text-gray-600'}`}
          >
            <span className="flex items-center gap-3"><CheckCircle2 size={20} /> Applied Jobs</span>
            {appliedCount > 0 && <span className="text-xs text-gray-500">{appliedCount}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-9">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by title, skill, or company"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-xinkedin-blue"
              />
            </div>
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Location"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-xinkedin-blue"
              />
            </div>
            <button
              onClick={() => { /* Filters are reactive, this button is visual consistency; we can force re-render */ setSearchKeyword(searchKeyword.trimEnd()); }}
              className="bg-xinkedin-blue text-white px-6 py-2 rounded font-semibold text-sm hover:bg-xinkedin-dark"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <FilterDropdown label="Date Posted" options={DATE_OPTIONS} value={dateFilter} onChange={setDateFilter} />
            <FilterDropdown label="Experience Level" options={LEVEL_OPTIONS} value={levelFilter} onChange={setLevelFilter} />
            <FilterDropdown label="Job Type" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                remoteOnly ? 'bg-xinkedin-blue text-white border-xinkedin-blue' : 'border-gray-400 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Remote
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setDateFilter('Any time'); setLevelFilter('Any level'); setTypeFilter('Any type'); setRemoteOnly(false); }}
                className="text-xinkedin-blue text-sm font-semibold hover:underline ml-2"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Job List + Detail */}
        <div className="flex gap-4">
          {/* Job List */}
          <div className={`${selectedJob ? 'w-2/5' : 'w-full'} transition-all`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-1">
                {sidebarView === 'saved' ? 'Saved Jobs' : sidebarView === 'applied' ? 'Applied Jobs' : 'Recommended for you'}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {sidebarView === 'all' ? 'Based on your profile and search history' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`}
              </p>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {sidebarView === 'saved' ? 'No saved jobs yet.' : sidebarView === 'applied' ? 'No applied jobs yet.' : 'No jobs match your criteria.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors border-l-2 ${
                        selectedJobId === job.id ? 'bg-blue-50 border-l-xinkedin-blue' : 'hover:bg-gray-50 border-l-transparent'
                      }`}
                    >
                      <img src={job.logo} alt={job.company} className="w-12 h-12 object-contain flex-shrink-0 rounded" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xinkedin-blue font-semibold text-sm hover:underline">{job.title}</h3>
                        <p className="text-sm text-gray-800">{job.company}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {job.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{job.posted}</span>
                          {job.applied && <span className="text-xs text-green-600 font-semibold">Applied</span>}
                          {job.saved && <BookmarkCheck size={14} className="text-gray-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Detail Panel */}
          {selectedJob && (
            <div className="w-3/5">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <img src={selectedJob.logo} alt={selectedJob.company} className="w-16 h-16 object-contain rounded" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                      <p className="text-base text-gray-800">{selectedJob.company}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {selectedJob.location}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedJobId(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{selectedJob.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{selectedJob.level}</span>
                  {selectedJob.salary && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">{selectedJob.salary}</span>}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> Posted {selectedJob.posted}</span>
                  <span>&#183;</span>
                  <span className="flex items-center gap-1"><Building2 size={14} /> {selectedJob.applicants} applicants</span>
                </div>

                <div className="flex gap-2 mb-6">
                  {selectedJob.applied ? (
                    <button disabled className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 cursor-default">
                      <CheckCircle2 size={16} /> Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => applyToJob(selectedJob.id)}
                      className="bg-xinkedin-blue text-white px-6 py-2 rounded-full font-semibold hover:bg-xinkedin-dark"
                    >
                      Apply
                    </button>
                  )}
                  <button
                    onClick={() => saveJob(selectedJob.id)}
                    className={`border px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
                      selectedJob.saved
                        ? 'border-gray-400 text-gray-600 bg-gray-50'
                        : 'border-xinkedin-blue text-xinkedin-blue hover:bg-blue-50'
                    }`}
                  >
                    {selectedJob.saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {selectedJob.saved ? 'Saved' : 'Save'}
                  </button>
                  {selectedJob.companyId && (() => {
                    const isFollowing = (state.followedCompanies || []).includes(selectedJob.companyId);
                    return (
                      <button
                        onClick={() => isFollowing ? unfollowCompany(selectedJob.companyId) : followCompany(selectedJob.companyId)}
                        className={`border px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
                          isFollowing
                            ? 'border-gray-400 text-gray-600 bg-gray-50'
                            : 'border-gray-400 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {isFollowing ? <BellOff size={16} /> : <Bell size={16} />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    );
                  })()}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="font-semibold text-base mb-2">About the job</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-base mb-2">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
