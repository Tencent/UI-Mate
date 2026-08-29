import React, { useRef, useState } from 'react';
import { LayoutTemplate, Type, Image as ImageIcon, Square, Layers, Upload, Search, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Shapes, Sticker, Image, PenTool } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { MOCK_TEMPLATES } from '../../utils/initialData';

const TABS = [
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'elements', icon: Square, label: 'Elements' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'layers', icon: Layers, label: 'Layers' },
];

const ELEMENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'photos', label: 'Photos' },
  { id: 'graphics', label: 'Graphics' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'lines', label: 'Lines' },
  { id: 'stickers', label: 'Stickers' },
];

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [elementCategory, setElementCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const { applyTemplate, addElement, uploads, addUpload, elements, selectedId, setSelectedId, deleteElement, reorderElement, toggleVisibility } = useDesign();

  const handleDragStart = (e, type, src) => {
    e.dataTransfer.setData('type', type);
    if (src) e.dataTransfer.setData('src', src);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        addUpload({
          name: file.name,
          type: file.type,
          url: reader.result
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImage = (url) => {
    addElement({
      type: 'image',
      src: url,
      width: 200,
      height: 200
    });
  };

  const filteredTemplates = MOCK_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderElementsContent = () => {
    const showAll = elementCategory === 'all';
    
    return (
      <div className="space-y-6 pb-4">
        {(showAll || elementCategory === 'shapes') && (
          <div>
            <h4 className="text-xs text-gray-400 mb-2 uppercase font-bold">Shapes</h4>
            <div className="grid grid-cols-3 gap-3">
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, 'rect')}
                onClick={() => addElement({ type: 'rect', width: 100, height: 100, fill: '#00C4CC' })}
                className="h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                title="Rectangle"
              >
                <div className="w-8 h-8 bg-gray-400"></div>
              </div>
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, 'circle')} 
                onClick={() => addElement({ type: 'circle', radius: 50, fill: '#FFD166' })}
                className="h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                title="Circle"
              >
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, 'star')} 
                onClick={() => addElement({ type: 'star', numPoints: 5, innerRadius: 25, outerRadius: 50, fill: '#EF476F' })}
                className="h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                title="Star"
              >
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                 </svg>
              </div>
            </div>
          </div>
        )}

        {(showAll || elementCategory === 'graphics') && (
          <div>
            <h4 className="text-xs text-gray-400 mb-2 uppercase font-bold">Graphics</h4>
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => (
                <img 
                  key={`graphic-${i}`}
                  src={`https://picsum.photos/200/200?random=graphic${i}`}
                  className="rounded cursor-pointer hover:opacity-80 transition-opacity bg-gray-700"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', `https://picsum.photos/200/200?random=graphic${i}`)}
                  onClick={() => handleAddImage(`https://picsum.photos/200/200?random=graphic${i}`)}
                />
              ))}
            </div>
          </div>
        )}

        {(showAll || elementCategory === 'photos') && (
          <div>
            <h4 className="text-xs text-gray-400 mb-2 uppercase font-bold">Photos</h4>
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => (
                <img 
                  key={`photo-${i}`}
                  src={`https://picsum.photos/300/200?random=photo${i}`}
                  className="rounded cursor-pointer hover:opacity-80 transition-opacity bg-gray-700"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', `https://picsum.photos/300/200?random=photo${i}`)}
                  onClick={() => handleAddImage(`https://picsum.photos/300/200?random=photo${i}`)}
                />
              ))}
            </div>
          </div>
        )}
        
        {(showAll || elementCategory === 'lines') && (
           <div>
            <h4 className="text-xs text-gray-400 mb-2 uppercase font-bold">Lines</h4>
            <div className="grid grid-cols-3 gap-3">
               <div 
                className="h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => addElement({ type: 'rect', width: 200, height: 4, fill: '#000000' })}
               >
                 <div className="w-12 h-1 bg-gray-400"></div>
               </div>
               <div 
                className="h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => addElement({ type: 'rect', width: 4, height: 100, fill: '#000000' })}
               >
                 <div className="w-1 h-12 bg-gray-400"></div>
               </div>
            </div>
           </div>
        )}

        {(showAll || elementCategory === 'stickers') && (
          <div>
            <h4 className="text-xs text-gray-400 mb-2 uppercase font-bold">Stickers</h4>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(i => (
                <img 
                  key={`sticker-${i}`}
                  src={`https://picsum.photos/100/100?random=sticker${i}`}
                  className="rounded-full cursor-pointer hover:opacity-80 transition-opacity bg-gray-700"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', `https://picsum.photos/100/100?random=sticker${i}`)}
                  onClick={() => handleAddImage(`https://picsum.photos/100/100?random=sticker${i}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-sidebar text-white w-96 flex-shrink-0">
      {/* Navigation Rail */}
      <div className="w-20 flex flex-col items-center py-4 gap-6 border-r border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            className={`flex flex-col items-center gap-1 text-xs w-full py-2 transition-colors ${
              activeTab === tab.id ? 'text-primary bg-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={24} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 bg-panel p-4 overflow-y-auto flex flex-col">
        {activeTab === 'templates' && (
          <div className="space-y-4 h-full flex flex-col">
            <h3 className="font-bold">Templates</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                className="w-full bg-gray-800 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
              {filteredTemplates.map(t => (
                <div 
                  key={t.id} 
                  className="cursor-pointer group relative"
                  onClick={() => applyTemplate(t)}
                >
                  <img src={t.thumbnail} className="rounded-md w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                    <span className="text-xs font-bold">Apply</span>
                  </div>
                  <p className="text-xs mt-1 text-gray-400 truncate">{t.name}</p>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <p className="text-gray-500 text-sm col-span-2 text-center py-4">No templates found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="space-y-4 h-full flex flex-col">
            <h3 className="font-bold">Elements</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search elements..." 
                className="w-full bg-gray-800 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Element Categories Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ELEMENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setElementCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    elementCategory === cat.id 
                      ? 'bg-white text-black font-medium' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="overflow-y-auto pb-4 flex-1">
              {renderElementsContent()}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <h3 className="font-bold">Uploads</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded font-medium transition-colors"
            >
              Upload Media
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <p className="text-xs text-gray-400">Choose local images, then click or drag them to the canvas.</p>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              {uploads.map(u => (
                <img 
                  key={u.id}
                  src={u.url}
                  className="rounded cursor-pointer hover:opacity-80 aspect-square object-cover bg-gray-800"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', u.url)}
                  onClick={() => handleAddImage(u.url)}
                  title="Click to add to canvas"
                />
              ))}
            </div>
            {uploads.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-10">No uploads yet.</p>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <h3 className="font-bold">Text</h3>
            <button 
              onClick={() => addElement({ type: 'text', text: 'Add a heading', fontSize: 32, fill: '#fff', fontFamily: 'Inter', fontWeight: 'bold' })}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded font-bold text-xl text-left px-4"
            >
              Add a heading
            </button>
            <button 
              onClick={() => addElement({ type: 'text', text: 'Add a subheading', fontSize: 24, fill: '#fff', fontFamily: 'Inter', fontWeight: 'medium' })}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-medium text-lg text-left px-4"
            >
              Add a subheading
            </button>
            <button 
              onClick={() => addElement({ type: 'text', text: 'Add a little bit of body text', fontSize: 16, fill: '#fff', fontFamily: 'Inter' })}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm text-left px-4"
            >
              Add body text
            </button>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-2 h-full flex flex-col">
            <h3 className="font-bold mb-2">Layers</h3>
            <div className="overflow-y-auto flex-1 space-y-2 pb-4">
              {[...elements].reverse().map((el, i) => (
                <div 
                  key={el.id}
                  className={`flex items-center justify-between p-2 rounded group ${el.id === selectedId ? 'bg-primary/20 border border-primary' : 'bg-gray-800 hover:bg-gray-750'}`}
                  onClick={() => setSelectedId(el.id)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
                      className="text-gray-400 hover:text-white"
                    >
                      {el.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <span className="text-sm truncate w-24 select-none">
                      {el.type === 'text' ? (el.text || 'Text') : el.type}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'front'); }} 
                      className="text-xs p-1 hover:bg-gray-700 rounded text-gray-300"
                      title="Bring to Front"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'back'); }} 
                      className="text-xs p-1 hover:bg-gray-700 rounded text-gray-300"
                      title="Send to Back"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} 
                      className="text-xs p-1 hover:bg-red-900/50 text-red-400 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {elements.length === 0 && (
                <p className="text-gray-500 text-sm text-center mt-10">No layers.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
