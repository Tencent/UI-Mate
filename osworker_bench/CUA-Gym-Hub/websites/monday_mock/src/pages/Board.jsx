
    import React, { useState } from 'react';
    import { useParams } from 'react-router-dom';
    import { useStore } from '../context/StoreContext';
    import { Table, Kanban, Calendar as CalendarIcon, GanttChart, Search, Filter, UserPlus, Zap, Plug, Activity } from 'lucide-react';
    import clsx from 'clsx';
    import TableView from '../components/TableView';
    import KanbanView from '../components/KanbanView';
    import TimelineView from '../components/TimelineView';
    import CalendarView from '../components/CalendarView';
    import ItemDetailPanel from '../components/ItemDetailPanel';
    import AutomationsPanel from '../components/AutomationsPanel';
    import IntegrationsPanel from '../components/IntegrationsPanel';
    import ActivityLog from '../components/ActivityLog';

    const VIEWS = {
      TABLE: 'table',
      KANBAN: 'kanban',
      TIMELINE: 'timeline',
      CALENDAR: 'calendar'
    };

    export default function Board() {
      const { boardId } = useParams();
      const { state, updateState } = useStore();
      const [currentView, setCurrentView] = useState(VIEWS.TABLE);
      const [selectedItem, setSelectedItem] = useState(null);
      const [showAutomations, setShowAutomations] = useState(false);
      const [showIntegrations, setShowIntegrations] = useState(false);
      const [showActivityLog, setShowActivityLog] = useState(false);
      const [showInvite, setShowInvite] = useState(false);
      const [inviteEmail, setInviteEmail] = useState('');
      const [searchQuery, setSearchQuery] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');

      const board = state.boards.find(b => b.id === boardId);

      if (!board) return <div className="p-10">Board not found</div>;
      const statusColumn = board.columns.find(column => column.type === 'status' && column.title === 'Status');
      const statusLabels = statusColumn?.settings?.labels || [];
      const filteredItems = board.items.filter(item => {
        const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.columnValues[statusColumn?.id] === statusFilter;
        return matchesSearch && matchesStatus;
      });
      const visibleBoard = { ...board, items: filteredItems };

      const submitInvite = (event) => {
        event.preventDefault();
        const invitation = {
          id: Date.now().toString(),
          email: inviteEmail,
          boardId: board.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        updateState(prev => ({ invitations: [...(prev.invitations || []), invitation] }));
        setInviteEmail('');
        setShowInvite(false);
      };

      return (
        <div className="h-full flex flex-col bg-white">
          {/* Board Header */}
          <div className="px-8 pt-6 pb-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{board.name}</h1>
                <p className="text-sm text-gray-500">{board.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-2">
                  <img src="https://picsum.photos/100/100?random=1" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://picsum.photos/100/100?random=2" className="w-8 h-8 rounded-full border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">+3</div>
                </div>
                <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary rounded hover:bg-blue-50 transition-colors text-sm font-medium">
                  <UserPlus size={16} />
                  Invite / 1
                </button>
                <button
                  onClick={() => setShowActivityLog(true)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  title="Activity Log"
                >
                  <Activity size={20} />
                </button>
              </div>
            </div>

            {/* View Switcher & Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setCurrentView(VIEWS.TABLE)}
                  className={clsx("pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", currentView === VIEWS.TABLE ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800")}
                >
                  <Table size={16} />
                  Main Table
                </button>
                <button
                  onClick={() => setCurrentView(VIEWS.KANBAN)}
                  className={clsx("pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", currentView === VIEWS.KANBAN ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800")}
                >
                  <Kanban size={16} />
                  Kanban
                </button>
                <button
                  onClick={() => setCurrentView(VIEWS.TIMELINE)}
                  className={clsx("pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", currentView === VIEWS.TIMELINE ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800")}
                >
                  <GanttChart size={16} />
                  Timeline
                </button>
                <button
                  onClick={() => setCurrentView(VIEWS.CALENDAR)}
                  className={clsx("pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", currentView === VIEWS.CALENDAR ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800")}
                >
                  <CalendarIcon size={16} />
                  Calendar
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={() => setShowIntegrations(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors"
                >
                  <Plug size={16} />
                  Integrate
                </button>
                <button
                  onClick={() => setShowAutomations(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors"
                >
                  <Zap size={16} />
                  Automate
                </button>
                <button onClick={() => {
                  const index = ['all', ...statusLabels.map(label => label.id)].indexOf(statusFilter);
                  const next = ['all', ...statusLabels.map(label => label.id)][(index + 1) % (statusLabels.length + 1)];
                  setStatusFilter(next);
                }} className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                  <Filter size={16} />
                  {statusFilter === 'all' ? 'Filter' : statusLabels.find(label => label.id === statusFilter)?.label}
                </button>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm outline-none focus:border-primary w-40 transition-all focus:w-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-hidden bg-surface-gray relative">
            {currentView === VIEWS.TABLE && (
              <TableView board={visibleBoard} onOpenItem={setSelectedItem} />
            )}
            {currentView === VIEWS.KANBAN && (
              <KanbanView board={visibleBoard} />
            )}
            {currentView === VIEWS.TIMELINE && (
              <TimelineView board={visibleBoard} />
            )}
            {currentView === VIEWS.CALENDAR && (
              <CalendarView board={visibleBoard} />
            )}
          </div>

          {/* Overlays */}
          {selectedItem && (
            <ItemDetailPanel
              item={selectedItem}
              board={board}
              onClose={() => setSelectedItem(null)}
            />
          )}
          {showAutomations && (
            <AutomationsPanel board={board} onClose={() => setShowAutomations(false)} />
          )}
          {showIntegrations && (
            <IntegrationsPanel board={board} onClose={() => setShowIntegrations(false)} />
          )}
          {showActivityLog && (
            <ActivityLog board={board} onClose={() => setShowActivityLog(false)} />
          )}
          {showInvite && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <form onSubmit={submitInvite} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Invite to board</h2>
                <p className="text-sm text-gray-500 mb-4">Create a local pending invitation for this sandbox board.</p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                <div className="flex justify-end gap-2 mt-5">
                  <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:bg-primary-hover">Invite</button>
                </div>
              </form>
            </div>
          )}
        </div>
      );
    }

