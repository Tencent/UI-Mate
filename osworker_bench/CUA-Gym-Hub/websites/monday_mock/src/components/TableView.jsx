
    import React, { useState } from 'react';
    import { useStore } from '../context/StoreContext';
    import { Plus, ChevronDown, ChevronRight, MoreHorizontal, GripVertical, Trash2, Move, GripHorizontal, Calculator, CornerDownRight } from 'lucide-react';
    import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
    import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
    import { CSS } from '@dnd-kit/utilities';
    import clsx from 'clsx';
    import StatusCell from './cells/StatusCell';
    import PersonCell from './cells/PersonCell';
    import DateCell from './cells/DateCell';
    import TimelineCell from './cells/TimelineCell';
    import { COLUMN_TYPES } from '../utils/mockData';
    import { v4 as uuidv4 } from 'uuid';

    const CellRenderer = ({ type, value, column, onChange, isSubitem }) => {
      switch (type) {
        case COLUMN_TYPES.STATUS:
          return <StatusCell value={value} column={column} onChange={onChange} />;
        case COLUMN_TYPES.PERSON:
          return <PersonCell value={value} onChange={onChange} />;
        case COLUMN_TYPES.DATE:
          return <DateCell value={value} onChange={onChange} />;
        case COLUMN_TYPES.TIMELINE:
          return <TimelineCell value={value} onChange={onChange} />;
        case COLUMN_TYPES.NUMBERS:
          return (
             <div className="w-full h-full flex items-center justify-center text-sm">
               {column.settings?.prefix}{value}
             </div>
          );
        default:
          return (
            <input
              className="w-full h-full px-2 bg-transparent outline-none text-sm"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          );
      }
    };

    const SortableHeader = ({ column }) => {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: column.width,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 20 : 1,
      };

      return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="p-2 text-xs font-semibold text-gray-500 text-center uppercase tracking-wider border-r border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing relative group h-full select-none"
        >
          <span className="truncate px-1">{column.title}</span>
          <div className="absolute top-0 right-0 bottom-0 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-400 bg-gray-50">
            <GripVertical size={12} />
          </div>
        </div>
      );
    };

    const SubitemRow = ({ subitem, columns }) => {
      return (
        <div className="flex border-b border-gray-100 hover:bg-gray-50 group/row transition-colors bg-gray-50/50 h-10 items-center">
          <div className="w-[6px] h-full bg-transparent"></div>
          <div className="w-10 h-full border-r border-gray-100 flex items-center justify-center bg-white">
             <CornerDownRight size={14} className="text-gray-400 ml-2" />
          </div>
          <div className="flex-1 min-w-[300px] h-full border-r border-gray-100 relative flex items-center pl-8">
             <input
              className="flex-1 h-full py-2 bg-transparent outline-none text-xs text-gray-600"
              value={subitem.name}
              readOnly
            />
          </div>
          {columns.map(col => (
            <div key={col.id} className="border-r border-gray-100 h-full" style={{ width: col.width }}>
               {/* Render simplified cells for subitems or empty */}
            </div>
          ))}
          <div className="w-10 h-full"></div>
        </div>
      );
    };

    const SortableItemRow = ({ item, columns, boardId, groupColor, onOpenItem, isSelected, onToggleSelect }) => {
      const { updateItemValue, updateItemName, deleteItem, addSubitem } = useStore();
      const [isExpanded, setIsExpanded] = useState(false);
      const [subitemName, setSubitemName] = useState('');
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
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
      };

      const subitems = item.subitems || [];
      const hasSubitems = subitems.length > 0;

      return (
        <>
          <div
            ref={setNodeRef}
            style={style}
            className={clsx(
              "flex border-b border-gray-100 hover:bg-gray-50 group/row transition-colors bg-white h-10 items-center",
              isDragging && "shadow-lg relative z-10",
              isSelected && "bg-blue-50"
            )}
          >
            <div className="w-[6px] h-full" style={{ backgroundColor: groupColor }}></div>

            {/* Checkbox & Drag Handle */}
            <div className="w-10 h-full flex items-center justify-center border-r border-gray-100 relative group/checkbox bg-white">
               <div
                 className={clsx(
                   "w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-colors z-10",
                   isSelected ? "bg-primary border-primary" : "border-gray-300 hover:border-primary bg-white"
                 )}
                 onClick={(e) => {
                   e.stopPropagation();
                   onToggleSelect(item.id);
                 }}
               >
                 {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
               </div>
               <div
                 {...attributes}
                 {...listeners}
                 className="absolute left-0 top-0 bottom-0 w-10 opacity-0 group-hover/checkbox:opacity-100 cursor-grab active:cursor-grabbing flex items-center justify-center bg-gray-50 -z-0"
               >
                 <GripVertical size={12} className="text-gray-400 ml-5" />
               </div>
            </div>

            <div className="flex-1 min-w-[300px] h-full border-r border-gray-100 relative flex items-center group/name-cell pl-2 bg-white">
              {/* Expand Arrow */}
              <button
                className={clsx("mr-2 p-0.5 rounded hover:bg-gray-200 text-gray-400 transition-colors opacity-100")}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              <input
                className="flex-1 h-full py-2 bg-transparent outline-none text-sm text-gray-700"
                value={item.name}
                onChange={(e) => updateItemName(boardId, item.id, e.target.value)}
              />
              <div className="flex items-center gap-2">
                {hasSubitems && !isExpanded && (
                  <div className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {subitems.length} subitems
                  </div>
                )}
                <button
                  className="mr-2 opacity-0 group-hover/name-cell:opacity-100 text-xs text-primary hover:underline font-medium transition-opacity px-2 py-1 bg-white/80 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenItem(item);
                  }}
                >
                  Open
                </button>
              </div>
            </div>
            {columns.map(col => (
              <div
                key={col.id}
                className="border-r border-gray-100 bg-white h-full"
                style={{ width: col.width }}
              >
                <CellRenderer
                  type={col.type}
                  value={item.columnValues[col.id]}
                  column={col}
                  onChange={(val) => updateItemValue(boardId, item.id, col.id, val)}
                />
              </div>
            ))}
            <div className="w-10 h-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 bg-white">
              <button
                onClick={() => deleteItem(boardId, item.id)}
                className="text-gray-400 hover:text-red-500 p-1 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Subitems Render */}
          {isExpanded && (
            <div className="bg-gray-50/30">
              {subitems.map(sub => (
                <SubitemRow key={sub.id} subitem={sub} columns={columns} boardId={boardId} parentId={item.id} />
              ))}
              <div className="flex border-b border-gray-100 h-9 items-center pl-12">
                 <input
                   placeholder="+ Add Subitem"
                   className="bg-transparent text-xs outline-none w-full placeholder-gray-400 pl-8"
                   value={subitemName}
                   onChange={(event) => setSubitemName(event.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && subitemName.trim()) {
                       addSubitem(boardId, item.id, subitemName.trim());
                       setSubitemName('');
                     }
                   }}
                 />
              </div>
            </div>
          )}
        </>
      );
    };

    const AggregationCell = ({ column, items }) => {
      const [type, setType] = useState('sum'); // sum, avg, count
      const [showMenu, setShowMenu] = useState(false);

      if (column.type !== COLUMN_TYPES.NUMBERS) return null;

      const calculate = () => {
        const values = items.map(i => parseFloat(i.columnValues[column.id]) || 0);
        if (values.length === 0) return 0;

        const sum = values.reduce((a, b) => a + b, 0);

        switch (type) {
          case 'sum': return sum;
          case 'avg': return sum / values.length;
          case 'count': return values.length;
          default: return sum;
        }
      };

      const value = calculate();
      const label = type === 'sum' ? 'Sum' : type === 'avg' ? 'Avg' : 'Count';

      return (
        <div
          className="flex flex-col items-center justify-center h-full w-full cursor-pointer hover:bg-gray-100 relative group"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="font-medium text-sm">
            {type !== 'count' && column.settings?.prefix}
            {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute bottom-full mb-1 bg-white shadow-lg rounded border border-gray-200 py-1 z-50 min-w-[80px]">
                <div className="px-3 py-1 hover:bg-gray-50 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setType('sum'); setShowMenu(false); }}>Sum</div>
                <div className="px-3 py-1 hover:bg-gray-50 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setType('avg'); setShowMenu(false); }}>Average</div>
                <div className="px-3 py-1 hover:bg-gray-50 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setType('count'); setShowMenu(false); }}>Count</div>
              </div>
            </>
          )}
        </div>
      );
    };

    const Group = ({ group, columns, items, boardId, onOpenItem, onDragEnd, selectedItems, onToggleSelect }) => {
      const [isCollapsed, setIsCollapsed] = useState(false);
      const { addItem } = useStore();
      const [newItemName, setNewItemName] = useState('');

      const handleAddItem = (e) => {
        e.preventDefault();
        if (newItemName.trim()) {
          addItem(boardId, group.id, newItemName);
          setNewItemName('');
        }
      };

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

      return (
        <div className="mb-8">
          {/* Group Header */}
          <div className="flex items-center gap-2 mb-2 group/header sticky left-0 z-20">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>
            <h3
              className="font-bold text-lg px-2 py-1 rounded hover:bg-gray-100 cursor-text border border-transparent hover:border-gray-200 transition-all"
              style={{ color: group.color }}
            >
              {group.title}
            </h3>
            <span className="text-gray-400 text-sm font-medium">{items.length} items</span>
          </div>

          {!isCollapsed && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              {/* Table Header */}
              <div className="flex border-b border-gray-200 bg-gray-50 h-9">
                <div className="w-[6px]" style={{ backgroundColor: group.color }}></div>
                <div className="w-10 border-r border-gray-100 bg-gray-50"></div>
                <div className="flex-1 min-w-[300px] p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 flex items-center pl-2">
                  Item
                </div>

                {/* Draggable Columns Header Context */}
                {columns.map(col => (
                  <SortableHeader key={col.id} column={col} />
                ))}

                <div className="w-10"></div>
              </div>

              {/* Items with DnD */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(event, group.id)}
              >
                <SortableContext
                  items={items.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map(item => (
                    <SortableItemRow
                      key={item.id}
                      item={item}
                      columns={columns}
                      boardId={boardId}
                      groupColor={group.color}
                      onOpenItem={onOpenItem}
                      isSelected={selectedItems.includes(item.id)}
                      onToggleSelect={onToggleSelect}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Item Row */}
              <div className="flex h-10 hover:bg-gray-50 border-b border-gray-200">
                <div className="w-[6px]" style={{ backgroundColor: group.color }}></div>
                <div className="w-10 border-r border-gray-100"></div>
                <form onSubmit={handleAddItem} className="flex-1 flex items-center px-2 pl-2">
                  <input
                    type="text"
                    placeholder="+ Add Item"
                    className="w-full bg-transparent outline-none text-sm text-gray-500 placeholder-gray-400"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </form>
                {columns.map(col => (
                  <div key={col.id} className="border-l border-gray-100 bg-gray-50/50" style={{ width: col.width }}></div>
                ))}
                <div className="w-10"></div>
              </div>

              {/* Aggregations Footer */}
              <div className="flex h-10 bg-gray-50 font-medium border-t border-gray-200">
                <div className="w-[6px]" style={{ backgroundColor: group.color }}></div>
                <div className="w-10 border-r border-gray-200"></div>
                <div className="flex-1 min-w-[300px] border-r border-gray-200"></div>
                {columns.map(col => (
                  <div
                    key={col.id}
                    className="border-r border-gray-200 flex items-center justify-center text-xs text-gray-700"
                    style={{ width: col.width }}
                  >
                    <AggregationCell column={col} items={items} />
                  </div>
                ))}
                <div className="w-10"></div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default function TableView({ board, onOpenItem }) {
      const { addGroup, moveItem, deleteItem } = useStore();
      const [columns, setColumns] = useState(board.columns);
      const [selectedItems, setSelectedItems] = useState([]);
      const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
      const [moveMenuOpen, setMoveMenuOpen] = useState(false);

      // Sync local columns state if board columns change (e.g. from store update)
      // Note: In a real app with persistent column ordering, we'd update the store.
      // Here we keep local state for the drag interaction demo.

      const handleColumnDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
          const oldIndex = columns.findIndex(c => c.id === active.id);
          const newIndex = columns.findIndex(c => c.id === over.id);
          setColumns(arrayMove(columns, oldIndex, newIndex));
        }
      };

      const handleItemDragEnd = (event, groupId) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
          moveItem(board.id, active.id, groupId);
        }
      };

      const toggleSelect = (itemId) => {
        setSelectedItems(prev =>
          prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId]
        );
      };

      const handleDeleteSelected = () => {
        selectedItems.forEach(itemId => deleteItem(board.id, itemId));
        setSelectedItems([]);
        setDeleteConfirmOpen(false);
      };

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

      return (
        <div className="p-8 pb-20 overflow-y-auto h-full relative">
          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-lg border border-gray-200 p-2 z-50 flex items-center gap-4 animate-in slide-in-from-bottom-5">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedItems.length}
              </div>
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <button onClick={() => setMoveMenuOpen(!moveMenuOpen)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 relative">
                <Move size={16} /> Move
                {moveMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 min-w-40 rounded border border-gray-200 bg-white py-1 shadow-lg">
                    {board.groups.map(group => (
                      <div
                        key={group.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectedItems.forEach(itemId => moveItem(board.id, itemId, group.id));
                          setSelectedItems([]);
                          setMoveMenuOpen(false);
                        }}
                        className="px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {group.title}
                      </div>
                    ))}
                  </div>
                )}
              </button>
              <button
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline"
                onClick={() => setSelectedItems([])}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Column Drag Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleColumnDragEnd}
          >
            <SortableContext
              items={columns.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.groups.map(group => (
                <Group
                  key={group.id}
                  group={group}
                  columns={columns}
                  items={board.items.filter(i => i.groupId === group.id)}
                  boardId={board.id}
                  onOpenItem={onOpenItem}
                  onDragEnd={handleItemDragEnd}
                  selectedItems={selectedItems}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
          {deleteConfirmOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-gray-800">Delete selected items?</h2>
                <p className="mt-2 text-sm text-gray-500">This removes {selectedItems.length} item(s) from the local board state.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => setDeleteConfirmOpen(false)} className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={handleDeleteSelected} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => addGroup(board.id)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Add New Group
          </button>
        </div>
      );
    }

