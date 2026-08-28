import React, { useState } from 'react';
import { useStore } from '../store/store';
import { 
  Grid, Trello, Image, FileText, Plus, Filter, ArrowUpDown, 
  Search, Share2, Bell, History, Users, ChevronDown, X
} from 'lucide-react';
import { cn } from '../lib/utils';

const Toolbar = () => {
  const { state, dispatch, ACTIONS } = useStore();
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [newTableOpen, setNewTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newViewName, setNewViewName] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);

  const activeBase = state.bases[state.activeBaseId];
  const activeTable = state.tables[state.activeTableId];
  
  if (!activeBase || !activeTable) return null;

  const activeView = activeTable.views.find(v => v.id === activeTable.activeViewId) || activeTable.views[0];

  const getViewIcon = (type) => {
    switch(type) {
      case 'grid': return <Grid size={14} />;
      case 'kanban': return <Trello size={14} />;
      case 'gallery': return <Image size={14} />;
      case 'form': return <FileText size={14} />;
      default: return <Grid size={14} />;
    }
  };

  const handleViewChange = (viewId) => {
    dispatch({ 
      type: ACTIONS.SET_ACTIVE_VIEW, 
      payload: { tableId: activeTable.id, viewId } 
    });
    setIsViewMenuOpen(false);
  };

  const createTable = (e) => {
    e.preventDefault();
    const name = newTableName.trim();
    if (!name) return;
    dispatch({ type: ACTIONS.CREATE_TABLE, payload: { baseId: activeBase.id, name } });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'create_table', label: `Created table ${name}` } });
    setNewTableName('');
    setNewTableOpen(false);
  };

  const createView = (type = 'grid') => {
    const name = newViewName.trim() || `${type[0].toUpperCase()}${type.slice(1)} View`;
    dispatch({
      type: ACTIONS.CREATE_VIEW,
      payload: {
        tableId: activeTable.id,
        view: { id: `view_${Date.now().toString(36)}`, name, type, groupFieldId: type === 'kanban' ? activeTable.fields.find(f => f.type === 'single_select')?.id : undefined }
      }
    });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'create_view', label: `Created ${name}` } });
    setNewViewName('');
    setIsViewMenuOpen(false);
  };

  const addShareUser = (e) => {
    e.preventDefault();
    const email = shareEmail.trim();
    if (!email) return;
    setSharedUsers([...sharedUsers, { email, permission: 'Can edit' }]);
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'share', label: `Shared ${activeBase.name} with ${email}` } });
    setShareEmail('');
  };

  const closePanel = () => setPanel(null);

  return (
    <div className="flex flex-col bg-white border-b border-gray-200">
      {/* Base Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-primary text-white">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors">
            {activeBase.name}
          </h1>
          <div className="flex gap-1">
             <button className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded-full text-xs font-semibold" onClick={() => setPanel('data')}>Data</button>
             <button className="px-3 py-1 hover:bg-black/20 rounded-full text-xs font-semibold" onClick={() => setPanel('automations')}>Automations</button>
             <button className="px-3 py-1 hover:bg-black/20 rounded-full text-xs font-semibold" onClick={() => setPanel('interfaces')}>Interfaces</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/80 hover:text-white" onClick={() => setPanel('history')}><History size={18} /></button>
          <button className="text-white/80 hover:text-white" onClick={() => setPanel('notifications')}><Bell size={18} /></button>
          <button className="flex items-center gap-1 bg-white text-primary px-3 py-1.5 rounded-full text-sm font-bold hover:bg-gray-50" onClick={() => setPanel('share')}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Table Tabs */}
      <div className="flex items-center px-2 bg-primary text-white overflow-x-auto">
        {activeBase.tables.map(tableId => {
          const table = state.tables[tableId];
          const isActive = tableId === state.activeTableId;
          return (
            <div 
              key={tableId}
              onClick={() => dispatch({ type: ACTIONS.SET_ACTIVE_TABLE, payload: tableId })}
              className={cn(
                "px-4 py-2 text-sm font-medium cursor-pointer rounded-t-lg flex items-center gap-2 min-w-max",
                isActive ? "bg-white text-gray-800 shadow-sm" : "text-white/80 hover:bg-white/10"
              )}
            >
              {table.name}
              <ChevronDown size={12} className={cn("opacity-50", isActive ? "text-gray-500" : "text-white")} />
            </div>
          );
        })}
        <button 
          className="p-2 text-white/80 hover:bg-white/10 rounded ml-1"
          onClick={() => setNewTableOpen(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* View Toolbar */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-2 bg-white relative">
        <div className="relative">
          <div 
            className="flex items-center bg-gray-100 hover:bg-gray-200 rounded px-2 py-1.5 cursor-pointer gap-2 transition-colors"
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
          >
            {getViewIcon(activeView.type)}
            <span className="text-sm font-bold text-gray-700">{activeView.name}</span>
            <ChevronDown size={14} className="text-gray-500" />
          </div>

          {isViewMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Views</div>
              {activeTable.views.map(view => (
                <div 
                  key={view.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100",
                    view.id === activeView.id ? "text-primary bg-orange-50" : "text-gray-700"
                  )}
                  onClick={() => handleViewChange(view.id)}
                >
                  {getViewIcon(view.type)}
                  <span className="text-sm">{view.name}</span>
                  {view.id === activeView.id && <Check size={14} className="ml-auto" />}
                </div>
              ))}
              <div className="border-t my-1"></div>
              <div className="border-t my-1"></div>
              <div className="px-3 py-2">
                <input value={newViewName} onChange={(e) => setNewViewName(e.target.value)} placeholder="New view name" className="mb-2 w-full rounded border px-2 py-1 text-sm outline-none focus:border-primary" />
                <div className="grid grid-cols-2 gap-1">
                  {['grid', 'kanban', 'gallery', 'form'].map(type => (
                    <button key={type} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={() => createView(type)}>
                      <Plus size={12} /> {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm" onClick={() => setPanel('view')}>
            <Grid size={14} /> <span className="hidden sm:inline">View</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm" onClick={() => setPanel('hideFields')}>
            <Users size={14} /> <span className="hidden sm:inline">Hide fields</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm" onClick={() => setPanel('filter')}>
            <Filter size={14} /> <span className="hidden sm:inline">Filter</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm" onClick={() => setPanel('sort')}>
            <ArrowUpDown size={14} /> <span className="hidden sm:inline">Sort</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm" onClick={() => setPanel('color')}>
            <div className="w-3 h-3 rounded-full bg-purple-500"></div> <span className="hidden sm:inline">Color</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={state.ui?.searchQuery || ''}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: e.target.value })}
              placeholder="Find in view" 
              className="pl-8 pr-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-primary rounded outline-none transition-colors w-32 focus:w-48"
            />
          </div>
        </div>
      </div>

      {newTableOpen && (
        <Dialog title="Create table" onClose={() => setNewTableOpen(false)}>
          <form onSubmit={createTable}>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Table name</label>
            <input className="mb-4 w-full rounded border px-3 py-2 text-sm outline-none focus:border-primary" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} autoFocus />
            <button className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover">Create table</button>
          </form>
        </Dialog>
      )}

      {panel && (
        <Dialog title={panelTitles[panel] || 'Panel'} onClose={closePanel}>
          {panel === 'share' && (
            <form onSubmit={addShareUser}>
              <div className="mb-3 flex gap-2">
                <input className="flex-1 rounded border px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Add people by email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
                <button className="rounded bg-primary px-3 text-sm font-semibold text-white">Invite</button>
              </div>
              <div className="space-y-2 text-sm">
                <AccessRow name="John Doe (you)" email="john.doe@example.com" permission="Owner" />
                {sharedUsers.map(user => <AccessRow key={user.email} name={user.email.split('@')[0]} email={user.email} permission={user.permission} />)}
              </div>
            </form>
          )}
          {panel === 'history' && (
            <div className="space-y-2 text-sm">
              {(state.activityLog || []).length === 0 && <p className="text-gray-500">No recent local activity yet.</p>}
              {(state.activityLog || []).map(item => (
                <div key={item.id} className="rounded border p-2"><div>{item.label}</div><div className="text-xs text-gray-500">{new Date(item.createdTime).toLocaleString()}</div></div>
              ))}
            </div>
          )}
          {panel === 'notifications' && <PanelList items={['2 records changed in this base', 'Project Tracker is synced locally', 'Form submissions are saved to the Tasks table']} />}
          {panel === 'automations' && <PanelList items={['When a form is submitted, add an activity entry', 'When a button field runs, store a timestamp in the cell']} />}
          {panel === 'interfaces' && <PanelList items={['Create a local dashboard from the active table', 'Open gallery view for card-based browsing']} />}
          {panel === 'data' && <PanelList items={[`${activeTable.records.length} records in ${activeTable.name}`, `${activeTable.fields.length} fields`, `${activeTable.views.length} views`]} />}
          {panel === 'view' && <PanelList items={activeTable.views.map(view => `${view.name} (${view.type})`)} />}
          {panel === 'hideFields' && <PanelList items={activeTable.fields.map(field => `${field.name} is visible`)} />}
          {panel === 'filter' && <PanelList items={['Type in Find in view to filter records immediately', 'Structured filters are represented locally in this sandbox panel']} />}
          {panel === 'sort' && <PanelList items={['Click column values to edit data before sorting tasks', 'Sort rules can be modeled through view metadata in future tasks']} />}
          {panel === 'color' && <PanelList items={activeTable.fields.filter(field => field.options).flatMap(field => field.options.map(option => `${field.name}: ${option.name}`))} />}
        </Dialog>
      )}
    </div>
  );
};

const panelTitles = {
  data: 'Data',
  automations: 'Automations',
  interfaces: 'Interfaces',
  history: 'Activity history',
  notifications: 'Notifications',
  share: 'Share base',
  view: 'Views',
  hideFields: 'Visible fields',
  filter: 'Filter records',
  sort: 'Sort records',
  color: 'Color records',
};

const Dialog = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
    <div className="w-full max-w-md rounded-lg bg-white p-5 text-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button className="rounded p-1 hover:bg-gray-100" onClick={onClose}><X size={16} /></button>
      </div>
      {children}
    </div>
  </div>
);

const AccessRow = ({ name, email, permission }) => (
  <div className="flex items-center justify-between rounded border p-2">
    <div><div className="font-medium">{name}</div><div className="text-xs text-gray-500">{email}</div></div>
    <span className="text-xs text-gray-500">{permission}</span>
  </div>
);

const PanelList = ({ items }) => (
  <div className="space-y-2 text-sm">
    {items.length === 0 && <p className="text-gray-500">Nothing to show for this table yet.</p>}
    {items.map((item, index) => <div key={`${item}-${index}`} className="rounded border p-2 text-gray-700">{item}</div>)}
  </div>
);

// Helper for the check icon in the menu
const Check = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

export default Toolbar;
