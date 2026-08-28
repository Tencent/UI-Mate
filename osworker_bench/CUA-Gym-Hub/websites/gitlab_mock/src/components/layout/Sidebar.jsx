import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { 
  Home, Box, GitPullRequest, PlayCircle, AlertCircle, 
  Book, Database, Shield, BarChart2, Code, Flag, Tag
} from 'lucide-react';
import { clsx } from 'clsx';

export default function Sidebar() {
  const { projectId } = useParams();
  const { search } = useLocation();
  const withSearch = (path) => `${path}${search || ''}`;

  const navItemClass = ({ isActive }) => clsx(
    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
    isActive 
      ? "bg-white/10 text-white font-medium" 
      : "text-gray-300 hover:bg-white/5 hover:text-white"
  );

  return (
    <aside className="w-64 bg-xitlab-sidebar text-white flex flex-col h-screen fixed left-0 top-0 border-r border-gray-800 z-20">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <div className="w-8 h-8 bg-xitlab-orange rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
            <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58.04l2.5 2.5 1.84-5.56a.42.42 0 0 1 .57-.27.42.42 0 0 1 .23.27l1.84 5.56 2.5-2.5a.43.43 0 0 1 .58-.04.42.42 0 0 1 .11.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z"/>
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">XitLab Mock</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <NavLink to={withSearch('/')} className={navItemClass} end>
          <Home size={18} />
          <span>Projects</span>
        </NavLink>
        
        <NavLink to={withSearch('/snippets')} className={navItemClass}>
          <Code size={18} />
          <span>Snippets</span>
        </NavLink>

        {projectId && (
          <>
            <div className="my-4 border-t border-gray-700 mx-2"></div>
            <div className="px-3 text-xs font-bold text-gray-500 uppercase mb-2">Project</div>
            
            <NavLink to={withSearch(`/projects/${projectId}`)} className={navItemClass} end>
              <Box size={18} />
              <span>Overview</span>
            </NavLink>
            
            <NavLink to={withSearch(`/projects/${projectId}/issues`)} className={navItemClass}>
              <AlertCircle size={18} />
              <span>Issues</span>
            </NavLink>
            
            <NavLink to={withSearch(`/projects/${projectId}/merge_requests`)} className={navItemClass}>
              <GitPullRequest size={18} />
              <span>Merge Requests</span>
            </NavLink>
            
            <NavLink to={withSearch(`/projects/${projectId}/pipelines`)} className={navItemClass}>
              <PlayCircle size={18} />
              <span>CI/CD</span>
            </NavLink>
            
            <NavLink to={withSearch(`/projects/${projectId}/registry`)} className={navItemClass}>
              <Database size={18} />
              <span>Registry</span>
            </NavLink>

            <NavLink to={withSearch(`/projects/${projectId}/wiki`)} className={navItemClass}>
              <Book size={18} />
              <span>Wiki</span>
            </NavLink>

            <NavLink to={withSearch(`/projects/${projectId}/security`)} className={navItemClass}>
              <Shield size={18} />
              <span>Security</span>
            </NavLink>

            <NavLink to={withSearch(`/projects/${projectId}/analytics`)} className={navItemClass}>
              <BarChart2 size={18} />
              <span>Analytics</span>
            </NavLink>

            <NavLink to={withSearch(`/projects/${projectId}/milestones`)} className={navItemClass}>
              <Flag size={18} />
              <span>Milestones</span>
            </NavLink>

            <NavLink to={withSearch(`/projects/${projectId}/releases`)} className={navItemClass}>
              <Tag size={18} />
              <span>Releases</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
         <NavLink to={withSearch('/go')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs">
            <Code size={14} />
            <span>Debug State (/go)</span>
         </NavLink>
      </div>
    </aside>
  );
}
