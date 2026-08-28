
    import React, { useState } from 'react';
    import { X, Globe, Mail, MessageCircle, GitBranch } from 'lucide-react';
    import { useStore } from '../context/StoreContext';

    export default function IntegrationsPanel({ board, onClose }) {
      const { updateState } = useStore();
      const [added, setAdded] = useState([]);
      const integrations = [
        { name: 'Gmail', icon: <Mail size={24} />, color: 'bg-red-100 text-red-600', desc: 'Send emails when items are updated' },
        { name: 'Slack', icon: <MessageCircle size={24} />, color: 'bg-purple-100 text-purple-600', desc: 'Post updates to Slack channels' },
        { name: 'GitHub', icon: <GitBranch size={24} />, color: 'bg-gray-100 text-gray-800', desc: 'Sync issues with board items' },
        { name: 'Zoom', icon: <Globe size={24} />, color: 'bg-blue-100 text-blue-600', desc: 'Create meetings from items' },
      ];

      const addIntegration = (tool) => {
        const integration = {
          id: `${tool.name.toLowerCase()}-${Date.now()}`,
          boardId: board.id,
          name: tool.name,
          description: tool.desc,
          enabled: true,
          createdAt: new Date().toISOString()
        };
        updateState(prev => ({ integrations: [...(prev.integrations || []), integration] }));
        setAdded(prev => [...prev, tool.name]);
      };

      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-[800px] h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Globe size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Integrations Center</h2>
                  <p className="text-sm text-gray-500">Connect your board with your favorite tools</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-surface-gray">
              <div className="grid grid-cols-3 gap-6">
                {integrations.map((tool, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group">
                    <div className={`w-16 h-16 rounded-full ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{tool.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{tool.desc}</p>
                    <button onClick={() => addIntegration(tool)} className="mt-auto border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                      {added.includes(tool.name) ? 'Added' : 'Add to Board'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

