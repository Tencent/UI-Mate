import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, Search, FolderOpen, MoreVertical, Star, X } from 'lucide-react';
import { useSpreadsheet } from '../store/useSpreadsheet';

export const Home: React.FC = () => {
  const { state } = useSpreadsheet();
  const [showFilePicker, setShowFilePicker] = useState(false);
  const location = useLocation();
  const sheetUrl = `/spreadsheet${location.search}`;
  const blankUrl = `/spreadsheet${location.search ? `${location.search}&new=1` : '?new=1'}`;
  const recentFiles = [
    { title: state.title, owner: 'me', updated: 'Opened just now', starred: false },
    { title: 'Marketing Campaign Tracker', owner: 'Alex Johnson', updated: 'Yesterday', starred: true },
    { title: 'Website Analytics', owner: 'me', updated: 'Apr 24, 2026', starred: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#202124]">
      <header className="h-16 bg-white border-b border-[#DADCE0] flex items-center px-6 gap-5">
        <div className="flex items-center gap-3 min-w-[220px]">
          <FileSpreadsheet size={32} className="text-[#0F9D58]" />
          <span className="text-[22px] text-[#5F6368]">Sheets</span>
        </div>
        <div className="flex-1 max-w-[720px] h-12 rounded-lg bg-[#F1F3F4] flex items-center px-4 gap-3">
          <Search size={20} className="text-[#5F6368]" />
          <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Search" />
        </div>
        <img
          src="https://ui-avatars.com/api/?name=Alex+Johnson&background=4285F4&color=fff&size=36"
          alt="User"
          className="w-9 h-9 rounded-full border border-gray-300 ml-auto"
        />
      </header>

      <section className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-5xl mx-auto py-6 px-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-normal">Start a new spreadsheet</h1>
          </div>
          <div className="flex gap-5">
            <Link
              to={blankUrl}
              className="group w-[150px]"
            >
              <div className="w-[150px] h-[112px] bg-white border border-[#DADCE0] rounded hover:border-[#0F9D58] overflow-hidden">
                <div className="h-full grid grid-cols-4 grid-rows-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-[#E8EAED]" />
                  ))}
                </div>
              </div>
              <div className="mt-2 text-sm font-medium group-hover:text-[#0F9D58]">Blank spreadsheet</div>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-normal">Recent spreadsheets</h2>
          <button className="flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-[#F1F3F4]" onClick={() => setShowFilePicker(true)}>
            <FolderOpen size={18} />
            File picker
          </button>
        </div>
        <div className="bg-white border border-[#DADCE0] rounded overflow-hidden">
          <div className="grid grid-cols-[1fr_130px_170px_48px] px-4 py-2 text-xs text-[#5F6368] border-b border-[#E8EAED]">
            <span>Name</span>
            <span>Owner</span>
            <span>Last opened</span>
            <span />
          </div>
          {recentFiles.map((file, index) => (
            <Link
              key={file.title}
              to={sheetUrl}
              className="grid grid-cols-[1fr_130px_170px_48px] px-4 py-3 items-center text-sm hover:bg-[#F8FAFD] border-b border-[#F1F3F4] last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-[#0F9D58]" />
                {file.title}
                {file.starred && <Star size={14} className="text-[#F9AB00]" fill="#F9AB00" />}
              </span>
              <span className="text-[#5F6368]">{file.owner}</span>
              <span className="text-[#5F6368]">{file.updated}</span>
              <MoreVertical size={18} className="text-[#5F6368]" />
            </Link>
          ))}
        </div>
      </main>

      {showFilePicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setShowFilePicker(false); }}>
          <div className="w-[640px] bg-white rounded-lg shadow-xl border border-[#DADCE0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADCE0]">
              <h2 className="text-lg">Open a file</h2>
              <button className="p-1 rounded hover:bg-[#F1F3F4]" onClick={() => setShowFilePicker(false)}><X size={18} /></button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {recentFiles.map(file => (
                  <Link key={file.title} to={sheetUrl} className="border border-[#DADCE0] rounded p-3 hover:border-[#0F9D58] hover:bg-[#F8FAFD]">
                    <FileSpreadsheet size={24} className="text-[#0F9D58] mb-3" />
                    <div className="text-sm font-medium truncate">{file.title}</div>
                    <div className="text-xs text-[#5F6368] mt-1">{file.updated}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
