import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HardDrive, Star, Clock, Trash2, Cloud, Plus, ChevronRight, ChevronDown, Folder, FileText, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFileSystem } from '../context/FileSystemContext';
import { FileSystemItem } from '../lib/types';

const SidebarItem = ({ to, icon: Icon, label, end = false }: { to: string, icon: any, label: string, end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-2 rounded-r-full text-sm font-medium transition-colors mr-2 mb-1",
      isActive 
        ? "bg-blue-50 text-primary" 
        : "text-gray-700 hover:bg-gray-100"
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </NavLink>
);

const FolderTreeItem = ({ item, level = 0 }: { item: FileSystemItem, level?: number }) => {
  const { getFolderContents } = useFileSystem();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/folder/${item.id}`;
  
  const children = getFolderContents(item.id).filter(i => i.type === 'folder');
  const hasChildren = children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/folder/${item.id}`);
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 rounded-r-full mr-2 transition-colors",
          isActive && "bg-blue-50 text-primary"
        )}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={handleClick}
      >
        <div 
          onClick={handleToggle}
          className={cn("p-0.5 rounded hover:bg-gray-200 transition-colors", !hasChildren && "invisible")}
        >
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>
        <Folder className={cn("w-4 h-4", isActive ? "text-primary fill-primary" : "text-gray-500")} />
        <span className="truncate">{item.name}</span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {children.map(child => (
            <FolderTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ onCreateClick }: { onCreateClick: (type: 'folder' | 'file') => void }) => {
  const { state, getFolderContents, uploadFile } = useFileSystem();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const totalSize = Object.values(state.items).reduce((acc, item) => acc + item.size, 0);
  const limit = 15 * 1024 * 1024 * 1024; // 15GB
  const percentage = Math.min((totalSize / limit) * 100, 100);
  
  const rootFolders = getFolderContents(null).filter(item => item.type === 'folder');

  return (
    <aside className="w-64 flex-shrink-0 bg-white h-full flex flex-col pt-4 border-r border-border overflow-hidden">
      <div className="px-4 mb-6 relative">
        <button 
          onClick={() => setIsNewOpen(!isNewOpen)}
          className="flex items-center gap-2 bg-white border border-border shadow-sm hover:shadow-md hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all"
        >
          <Plus className="w-6 h-6 text-google-plus" />
          <span className="font-medium text-sm">New</span>
        </button>
        {isNewOpen && (
          <div className="absolute left-4 top-14 z-30 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 text-sm">
            <button
              onClick={() => { onCreateClick('folder'); setIsNewOpen(false); }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 text-left"
            >
              <Folder className="w-4 h-4 text-folder fill-folder" />
              New folder
            </button>
            <button
              onClick={() => { onCreateClick('file'); setIsNewOpen(false); }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 text-left"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              New text file
            </button>
            <label className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 text-left cursor-pointer">
              <Upload className="w-4 h-4 text-gray-600" />
              File upload
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  files.forEach(file => uploadFile(file, null));
                  event.target.value = '';
                  setIsNewOpen(false);
                }}
              />
            </label>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <SidebarItem to="/" icon={HardDrive} label="My Drive" end={true} />
        
        {/* Folder Tree */}
        <div className="mb-2">
          {rootFolders.map(folder => (
            <FolderTreeItem key={folder.id} item={folder} level={0} />
          ))}
        </div>

        <SidebarItem to="/starred" icon={Star} label="Starred" />
        <SidebarItem to="/recent" icon={Clock} label="Recent" />
        <SidebarItem to="/trash" icon={Trash2} label="Trash" />
      </nav>

      <div className="p-4 mt-auto border-t border-border bg-white z-10">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Cloud className="w-5 h-5" />
          <span className="text-sm font-medium">Storage</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {(totalSize / (1024 * 1024)).toFixed(1)} MB of 15 GB used
        </p>
      </div>
    </aside>
  );
};
