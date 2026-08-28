
    import React, { useState } from 'react';
    import { useStore } from '../context/StoreContext';
    import { STATUS_LABELS, COLUMN_TYPES } from '../utils/mockData';
    import { Plus, MoreHorizontal, Settings2 } from 'lucide-react';
    import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
    import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
    import { CSS } from '@dnd-kit/utilities';

    const SortableCard = ({ item }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
      } = useSortable({ id: item.id });

      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

      return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing whitespace-normal"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-800 text-sm">{item.name}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={14} />
            </button>
          </div>

          {/* Mini details */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] flex items-center justify-center text-gray-500">
              +
            </div>
          </div>
        </div>
      );
    };

    export default function KanbanView({ board }) {
      const { addItem, updateItemValue } = useStore();

      // Find eligible columns for grouping (status, person, etc.)
      const eligibleColumns = board.columns.filter(c =>
        c.type === COLUMN_TYPES.STATUS ||
        c.type === COLUMN_TYPES.PERSON
      );

      const [groupByColumnId, setGroupByColumnId] = useState(() => {
        const statusCol = board.columns.find(c => c.type === COLUMN_TYPES.STATUS);
        return statusCol ? statusCol.id : eligibleColumns[0]?.id;
      });

      const groupByColumn = board.columns.find(c => c.id === groupByColumnId);

      if (!groupByColumn) return <div className="p-8">No suitable column found to group by.</div>;

      // Generate columns based on the selected grouping column
      let columns = [];

      if (groupByColumn.type === COLUMN_TYPES.STATUS) {
        const labels = groupByColumn.settings.labels;
        columns = labels.map(label => ({
          ...label,
          items: board.items.filter(item => item.columnValues[groupByColumnId] === label.id)
        }));
        // Add "No Status"
        columns.push({
          id: 'uncategorized',
          label: 'No Status',
          color: '#c4c4c4',
          items: board.items.filter(item => !item.columnValues[groupByColumnId])
        });
      } else if (groupByColumn.type === COLUMN_TYPES.PERSON) {
        // Mock person grouping logic
        // In a real app, we'd iterate through unique users assigned
        columns = [
          { id: 'assigned', label: 'Assigned', color: '#0073ea', items: board.items.filter(item => item.columnValues[groupByColumnId]?.length > 0) },
          { id: 'unassigned', label: 'Unassigned', color: '#c4c4c4', items: board.items.filter(item => !item.columnValues[groupByColumnId] || item.columnValues[groupByColumnId].length === 0) }
        ];
      }

      const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        }),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      );

      const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        const validStatusIds = ['uncategorized', ...(groupByColumn.settings?.labels || []).map(label => label.id)];
        if (groupByColumn.type === COLUMN_TYPES.STATUS && over.id !== active.id && validStatusIds.includes(over.id)) {
          updateItemValue(board.id, active.id, groupByColumnId, over.id === 'uncategorized' ? '' : over.id);
        }
      };

      return (
        <div className="h-full flex flex-col">
          {/* Kanban Toolbar */}
          <div className="px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Group by:</span>
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-primary text-sm font-medium"
                value={groupByColumnId}
                onChange={(e) => setGroupByColumnId(e.target.value)}
              >
                {eligibleColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Settings2 size={14} />
              </div>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto p-8 whitespace-nowrap bg-surface-gray">
              <div className="flex gap-4 h-full">
                {columns.map(col => (
                  <div key={col.id || 'uncategorized'} className="w-72 flex-shrink-0 flex flex-col h-full">
                    <div
                      className="px-3 py-2 rounded-t-md text-white font-medium text-sm flex justify-between items-center mb-2"
                      style={{ backgroundColor: col.color }}
                    >
                      <span>{col.label}</span>
                      <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">{col.items.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 bg-gray-50/50 rounded-b-md p-2">
                      <SortableContext
                        items={col.items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {col.items.map(item => (
                          <SortableCard key={item.id} item={item} />
                        ))}
                      </SortableContext>

                      <button onClick={() => addItem(board.id, board.groups[0]?.id, `New ${col.label} item`)} className="w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 rounded-md text-sm transition-colors border border-dashed border-gray-300">
                        <Plus size={14} />
                        Add Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DndContext>
        </div>
      );
    }

