import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, FileJson, Layout, Settings } from 'lucide-react';
import { TEMPLATES } from '../templates';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTemplateClick = (key) => {
    navigate(`/editor${location.search}`, { state: { template: key } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary p-2 rounded-lg mr-3">
              <Layout className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BoltCanvas</h1>
          </div>
          <div className="flex space-x-4">
            <Link to={`/go${location.search}`} className="text-gray-600 hover:text-primary font-medium flex items-center">
              <Settings size={18} className="mr-1" /> /go Debug
            </Link>
            <Link to={`/create${location.search}`} className="text-gray-600 hover:text-primary font-medium flex items-center">
              <FileJson size={18} className="mr-1" /> /create Sim
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Templates Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Start with a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Blank Canvas */}
            <div 
              onClick={() => handleTemplateClick('blank')}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200 group"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center group-hover:bg-gray-50">
                <Plus size={48} className="text-gray-300 group-hover:text-primary transition-colors" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Blank Canvas</h3>
                <p className="text-sm text-gray-500">Start from scratch</p>
              </div>
            </div>

            {/* Other Templates */}
            {Object.entries(TEMPLATES).filter(([k]) => k !== 'blank').map(([key, tmpl]) => (
              <div 
                key={key}
                onClick={() => handleTemplateClick(key)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200"
              >
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl opacity-50">
                     {tmpl.name.substring(0, 2).toUpperCase()}
                   </div>
                   <img 
                     src={`https://picsum.photos/400/300?random=${key}`} 
                     alt={tmpl.name}
                     className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                   />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                  <p className="text-sm text-gray-500">Pre-configured layout</p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Recent Projects (Mock) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Projects</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 text-center text-gray-500">
              No recent projects saved in local storage yet.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
