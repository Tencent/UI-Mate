import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import { useToast } from '../context/ToastContext';
import { FileGrid } from '../components/FileGrid';
import { FileList } from '../components/FileList';
import { PreviewModal } from '../components/PreviewModal';
import { ShareModal } from '../components/ShareModal';
import { DetailsPanel } from '../components/DetailsPanel';
import { MoveToDialog } from '../components/MoveToDialog';
import { FileSystemItem, FileType } from '../lib/types';
import { LayoutGrid, List as ListIcon, ChevronRight, Upload, X, Share2, Star, Trash2, Link2, ChevronDown, FolderInput, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { NewButton } from '../components/NewButton';
import { cn, downloadItem } from '../lib/utils';

// Breadcrumb segment with sibling folder dropdown
const BreadcrumbSegment = ({
  label,
  to,
  isCurrent,
  siblings,
}: {
  label: string;
  to: string;
  isCurrent: boolean;
  siblings: FileSystemItem[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center">
      {isCurrent ? (
        <button
          onClick={() => siblings.length > 0 && setOpen(!open)}
          className={cn(
            "flex items-center gap-0.5 px-2 py-1 rounded-full text-sm font-bold text-[#202124] transition-colors",
            siblings.length > 0 && "hover:bg-[#F1F3F4] cursor-pointer"
          )}
        >
          {label}
          {siblings.length > 0 && (
            <ChevronDown className="w-3.5 h-3.5 text-[#5F6368]" />
          )}
        </button>
      ) : (
        <button
          onClick={() => { navigate(to); setOpen(false); }}
          onContextMenu={(e) => { e.preventDefault(); setOpen(!open); }}
          className="flex items-center gap-0.5 px-2 py-1 rounded-full text-sm font-medium text-[#3C4043] hover:bg-[#F1F3F4] transition-colors"
        >
          {label}
        </button>
      )}
      {open && siblings.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-[#DADCE0] py-1 z-40 min-w-[180px] max-h-60 overflow-y-auto">
          {siblings.map(s => (
            <button
              key={s.id}
              onClick={() => { navigate(`/folder/${s.id}`); setOpen(false); }}
              className="w-full text-left px-4 h-8 text-sm text-[#202124] hover:bg-[#F1F3F4] transition-colors truncate"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SortButton = ({ label, sortKey, current }: { label: string, sortKey: 'name' | 'modifiedAt' | 'size' | 'type', current: { key: string, direction: string } }) => {
  const { dispatch } = useFileSystem();
  const isActive = current.key === sortKey;
  return (
    <button
      onClick={() => dispatch({ type: 'SORT_ITEMS', payload: { key: sortKey } })}
      className={cn(
        "flex items-center gap-1 px-3 h-8 rounded-full text-sm font-medium transition-colors border",
        isActive
          ? "bg-[#C2E7FF] border-[#7DC3FB] text-[#001D35]"
          : "border-[#DADCE0] text-[#3C4043] hover:bg-[#F1F3F4]"
      )}
    >
      {label}
      {isActive && (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d={current.direction === 'asc' ? "M7 14l5-5 5 5z" : "M7 10l5 5 5-5z"} fill="currentColor"/>
        </svg>
      )}
    </button>
  );
};

// Filter chip types
type FilterType = FileType | null;
type PersonFilter = string | null;
type ModifiedFilter = 'today' | 'week' | 'month' | 'year' | null;

const FILE_TYPE_OPTIONS: { label: string; value: FileType }[] = [
  { label: 'Folders', value: 'folder' },
  { label: 'Documents', value: 'doc' },
  { label: 'Spreadsheets', value: 'spreadsheet' },
  { label: 'Presentations', value: 'presentation' },
  { label: 'PDFs', value: 'pdf' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
];

const MODIFIED_OPTIONS: { label: string; value: ModifiedFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'week' },
  { label: 'Last 30 days', value: 'month' },
  { label: 'This year', value: 'year' },
];

interface FilterDropdownProps {
  label: string;
  isActive: boolean;
  onClear: () => void;
  children: React.ReactNode;
}

const FilterDropdown = ({ label, isActive, onClear, children }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 px-3 h-8 rounded-full text-sm font-medium transition-colors border",
          isActive
            ? "bg-[#D2E3FC] border-[#1A73E8] text-[#1A73E8]"
            : "border-[#DADCE0] text-[#3C4043] hover:bg-[#F1F3F4]"
        )}
      >
        {label}
        {isActive ? (
          <X
            className="w-3.5 h-3.5 ml-0.5"
            onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }}
          />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-[#DADCE0] py-1 z-30 min-w-[180px]">
          {children}
        </div>
      )}
    </div>
  );
};

export const Drive = () => {
  const { folderId } = useParams();
  const currentFolderId = folderId || null;
  const navigate = useNavigate();

  const { state, getFolderContents, getPath, dispatch, uploadFile } = useFileSystem();
  const { showToast } = useToast();
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
  const [shareItem, setShareItem] = useState<FileSystemItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<FileSystemItem | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<FilterType>(null);
  const [personFilter, setPersonFilter] = useState<PersonFilter>(null);
  const [modifiedFilter, setModifiedFilter] = useState<ModifiedFilter>(null);

  const contents = getFolderContents(currentFolderId);
  const path = getPath(currentFolderId);

  // Build person options from contents
  const personOptions = useMemo(() => {
    const owners = new Set<string>();
    contents.forEach(item => owners.add(item.ownerId));
    return Array.from(owners).map(uid => ({
      id: uid,
      name: uid === state.currentUser.id ? 'me' : (state.users?.[uid]?.name || 'Unknown')
    }));
  }, [contents, state.currentUser.id, state.users]);

  const filteredContents = useMemo(() => {
    let result = [...contents];

    if (typeFilter) {
      result = result.filter(item => item.type === typeFilter);
    }

    if (personFilter) {
      result = result.filter(item => item.ownerId === personFilter);
    }

    if (modifiedFilter) {
      const now = Date.now();
      const cutoffs: Record<NonNullable<ModifiedFilter>, number> = {
        today: now - 86400000,
        week: now - 7 * 86400000,
        month: now - 30 * 86400000,
        year: now - 365 * 86400000,
      };
      result = result.filter(item => item.modifiedAt >= cutoffs[modifiedFilter]);
    }

    return result;
  }, [contents, typeFilter, personFilter, modifiedFilter]);

  const sortedContents = useMemo(() => {
    return [...filteredContents].sort((a, b) => {
      const { key, direction } = state.sortConfig;
      // Folders always first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let valA: any = a[key as keyof FileSystemItem];
      let valB: any = b[key as keyof FileSystemItem];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredContents, state.sortConfig]);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadFile(file, currentFolderId));
    if (acceptedFiles.length > 0) {
      showToast(`Uploading ${acceptedFiles.length} file${acceptedFiles.length > 1 ? 's' : ''}...`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  // Bulk actions
  const selectedItems = state.selectedItems;
  const selectedCount = selectedItems.length;

  const handleBulkDelete = () => {
    const ids = [...selectedItems];
    ids.forEach(id => dispatch({ type: 'DELETE_ITEM', payload: { id } }));
    showToast(
      `${ids.length} item${ids.length > 1 ? 's' : ''} moved to trash`,
      () => ids.forEach(id => dispatch({ type: 'RESTORE_ITEM', payload: { id } }))
    );
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const handleBulkStar = () => {
    selectedItems.forEach(id => dispatch({ type: 'TOGGLE_STAR', payload: { id } }));
    showToast(`${selectedCount} item${selectedCount > 1 ? 's' : ''} starred`);
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const handleCopyLink = () => {
    const id = selectedItems[0];
    if (id) {
      navigator.clipboard.writeText(`https://drive.google.com/file/d/${id}`).catch(() => {});
      showToast('Link copied to clipboard');
    }
  };

  const handleBulkShare = () => {
    if (selectedCount === 1) {
      const item = state.items[selectedItems[0]];
      if (item) setShareItem(item);
      return;
    }
    selectedItems.forEach(id => {
      dispatch({
        type: 'SHARE_ITEM',
        payload: { id, users: [{ userId: 'user_002', role: 'viewer', addedAt: new Date().toISOString() }] }
      });
    });
    showToast(`Shared ${selectedCount} items with Sarah Chen as viewer`);
  };

  const handleBulkDownload = () => {
    selectedItems
      .map(id => state.items[id])
      .filter(Boolean)
      .forEach(item => downloadItem(item));
    showToast(`Downloaded ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Only handle if not typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'Backspace' && e.metaKey && path.length > 0) {
      navigate(path.length > 1 ? `/folder/${path[path.length - 2].id}` : '/');
    }
    if ((e.key === 'Delete' || e.key === '#') && selectedItems.length > 0) {
      handleBulkDelete();
    }
    if (e.key === 'Escape') {
      if (detailsItem) setDetailsItem(null);
      else dispatch({ type: 'CLEAR_SELECTION' });
    }
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      dispatch({ type: 'SELECT_ALL', payload: { ids: sortedContents.map(i => i.id) } });
    }
    if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
      dispatch({ type: 'SET_VIEW_MODE', payload: state.viewMode === 'grid' ? 'list' : 'grid' });
    }
    if (e.key === 'd' && !e.ctrlKey && !e.metaKey && selectedItems.length === 1) {
      const item = state.items[selectedItems[0]];
      if (item) setDetailsItem(detailsItem ? null : item);
    }
    if (e.key === '.' && selectedItems.length > 0) {
      selectedItems.forEach(id => dispatch({ type: 'TOGGLE_STAR', payload: { id } }));
      showToast(`${selectedItems.length > 1 ? selectedItems.length + ' items' : 'Item'} starred`);
    }
    if (e.key === '/' || e.key === 'f') {
      e.preventDefault();
      const searchInput = document.querySelector('header input[type="text"]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const newBtn = document.querySelector('[data-new-button="true"]') as HTMLButtonElement;
      if (newBtn) newBtn.click();
    }
  }, [path, selectedItems, dispatch, navigate, sortedContents, state.viewMode, state.items, detailsItem, showToast]);

  const hasFilters = typeFilter || personFilter || modifiedFilter;
  const currentFolderName = path.length > 0 ? path[path.length - 1].name : 'My Drive';

  // Compute sibling folders for breadcrumb segments
  // For each segment at index i, siblings = folders inside the parent (path[i-1] or root)
  const getBreadcrumbSiblings = useCallback((segmentIndex: number): FileSystemItem[] => {
    // segmentIndex -1 means the "My Drive" root
    // segmentIndex 0..path.length-1 corresponds to path[0..n-1]
    const parentId = segmentIndex <= 0 ? null : path[segmentIndex - 1].id;
    return getFolderContents(parentId).filter(i => i.type === 'folder');
  }, [path, getFolderContents]);

  // Max visible segments before collapsing (show first + last 2)
  const MAX_VISIBLE = 3;
  const shouldCollapse = path.length > MAX_VISIBLE;
  const visiblePath = shouldCollapse
    ? [path[0], ...path.slice(path.length - 2)]
    : path;

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden relative focus:outline-none"
      tabIndex={0}
      {...getRootProps()}
      onKeyDown={handleKeyDown}
    >
      <input {...getInputProps({ className: 'hidden', 'aria-label': 'Upload files' })} />

      {/* Toolbar */}
      <div className="h-14 border-b border-[#DADCE0] flex items-center justify-between px-4 flex-shrink-0 gap-3">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-[#3C4043] gap-0 min-w-0 overflow-hidden">
          {/* My Drive root segment */}
          <BreadcrumbSegment
            label="My Drive"
            to="/"
            isCurrent={path.length === 0}
            siblings={getBreadcrumbSiblings(0)}
          />

          {/* Path segments */}
          {shouldCollapse ? (
            <>
              {/* First segment */}
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#9AA0A6]" />
              <BreadcrumbSegment
                key={visiblePath[0].id}
                label={visiblePath[0].name}
                to={`/folder/${visiblePath[0].id}`}
                isCurrent={false}
                siblings={getBreadcrumbSiblings(path.indexOf(visiblePath[0]))}
              />
              {/* Ellipsis */}
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#9AA0A6]" />
              <button
                title="More folders"
                className="px-2 py-1 text-sm text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors"
              >
                ...
              </button>
              {/* Last 2 segments */}
              {visiblePath.slice(1).map((item, i) => {
                const originalIdx = path.indexOf(item);
                const isCurr = originalIdx === path.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#9AA0A6]" />
                    <BreadcrumbSegment
                      label={item.name}
                      to={`/folder/${item.id}`}
                      isCurrent={isCurr}
                      siblings={getBreadcrumbSiblings(originalIdx)}
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            path.map((item, i) => (
              <React.Fragment key={item.id}>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#9AA0A6]" />
                <BreadcrumbSegment
                  label={item.name}
                  to={`/folder/${item.id}`}
                  isCurrent={i === path.length - 1}
                  siblings={getBreadcrumbSiblings(i)}
                />
              </React.Fragment>
            ))
          )}
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sort buttons */}
          <div className="flex items-center gap-1.5">
            <SortButton label="Name" sortKey="name" current={state.sortConfig} />
            <SortButton label="Modified" sortKey="modifiedAt" current={state.sortConfig} />
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-[#DADCE0]" />

          {/* View mode */}
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
            className={cn("p-2 rounded-full transition-colors", state.viewMode === 'list' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]')}
            title="List view"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
            className={cn("p-2 rounded-full transition-colors", state.viewMode === 'grid' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]')}
            title="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F1F3F4] flex-shrink-0">
        {/* Type filter */}
        <FilterDropdown
          label={typeFilter ? FILE_TYPE_OPTIONS.find(o => o.value === typeFilter)?.label || 'Type' : 'Type'}
          isActive={!!typeFilter}
          onClear={() => setTypeFilter(null)}
        >
          {FILE_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setTypeFilter(opt.value); }}
              className={cn(
                "w-full text-left px-4 h-8 text-sm hover:bg-[#F1F3F4] transition-colors",
                typeFilter === opt.value ? "text-[#1A73E8] font-medium" : "text-[#202124]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </FilterDropdown>

        {/* People filter */}
        {personOptions.length > 1 && (
          <FilterDropdown
            label={personFilter ? personOptions.find(o => o.id === personFilter)?.name || 'People' : 'People'}
            isActive={!!personFilter}
            onClear={() => setPersonFilter(null)}
          >
            {personOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setPersonFilter(opt.id); }}
                className={cn(
                  "w-full text-left px-4 h-8 text-sm hover:bg-[#F1F3F4] transition-colors",
                  personFilter === opt.id ? "text-[#1A73E8] font-medium" : "text-[#202124]"
                )}
              >
                {opt.name}
              </button>
            ))}
          </FilterDropdown>
        )}

        {/* Modified filter */}
        <FilterDropdown
          label={modifiedFilter ? MODIFIED_OPTIONS.find(o => o.value === modifiedFilter)?.label || 'Modified' : 'Modified'}
          isActive={!!modifiedFilter}
          onClear={() => setModifiedFilter(null)}
        >
          {MODIFIED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setModifiedFilter(opt.value); }}
              className={cn(
                "w-full text-left px-4 h-8 text-sm hover:bg-[#F1F3F4] transition-colors",
                modifiedFilter === opt.value ? "text-[#1A73E8] font-medium" : "text-[#202124]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </FilterDropdown>

        {/* Clear all filters */}
        {hasFilters && (
          <button
            onClick={() => { setTypeFilter(null); setPersonFilter(null); setModifiedFilter(null); }}
            className="text-xs text-[#1A73E8] hover:underline font-medium ml-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Selection bar (replaces regular toolbar when items selected) */}
      {selectedCount > 0 && (
        <div className="h-12 flex items-center gap-2 px-4 bg-[#E8F0FE] border-b border-[#DADCE0] flex-shrink-0">
          <button
            onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
            className="p-1.5 hover:bg-[#DADCE0] rounded-full"
          >
            <X className="w-4 h-4 text-[#5F6368]" />
          </button>
          <span className="text-sm font-medium text-[#202124] mr-2">{selectedCount} selected</span>

          {/* Bulk actions */}
          <button
            onClick={handleBulkShare}
            title="Share"
            className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {selectedCount === 1 && (
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Copy link</span>
            </button>
          )}

          <button
            onClick={handleBulkDownload}
            title="Download"
            className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors"
          >
            <Upload className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleBulkStar}
            title="Star"
            className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors"
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Star</span>
          </button>

          <button
            onClick={handleBulkDelete}
            title="Move to trash"
            className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#EA4335] rounded-full hover:bg-[#FCE8E6] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>

          <button
            onClick={() => setShowMoveDialog(true)}
            title="Move to"
            className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors"
          >
            <FolderInput className="w-4 h-4" />
            <span className="hidden sm:inline">Move to</span>
          </button>

          {selectedCount === 1 && (
            <button
              onClick={() => {
                const item = state.items[selectedItems[0]];
                if (item) setDetailsItem(item);
              }}
              title="View details"
              className="flex items-center gap-1.5 px-3 h-8 text-sm text-[#3C4043] rounded-full hover:bg-[#DADCE0] transition-colors ml-auto"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Content area with optional details panel */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 overflow-y-auto"
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              dispatch({ type: 'CLEAR_SELECTION' });
            }
          }}
        >
          {sortedContents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5F6368] gap-3">
              <svg viewBox="0 0 24 24" className="w-20 h-20 text-[#DADCE0]" fill="currentColor">
                <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
              </svg>
              {isDragActive ? (
                <p className="text-lg">Drop files here to upload</p>
              ) : hasFilters ? (
                <>
                  <p className="text-base font-medium">No matching files</p>
                  <p className="text-sm text-[#9AA0A6]">Try removing some filters</p>
                  <button onClick={() => { setTypeFilter(null); setPersonFilter(null); setModifiedFilter(null); }} className="text-sm text-[#1A73E8] hover:underline">Clear all filters</button>
                </>
              ) : (
                <>
                  <p className="text-base font-medium">This folder is empty</p>
                  <p className="text-sm text-[#9AA0A6]">Drag files here or use the New button to create files</p>
                </>
              )}
            </div>
          ) : (
            state.viewMode === 'grid'
              ? <FileGrid items={sortedContents} onPreview={setPreviewItem} />
              : <FileList items={sortedContents} onPreview={setPreviewItem} onDetails={setDetailsItem} />
          )}
        </div>

        {/* Details panel */}
        {detailsItem && (
          <DetailsPanel
            item={detailsItem}
            onClose={() => setDetailsItem(null)}
          />
        )}
      </div>

      {/* Drag & Drop overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-[#E8F0FE]/80 border-4 border-[#1A73E8] border-dashed z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-[#1A73E8]" />
            <p className="text-lg font-medium text-[#1A73E8]">Drop files to upload to {currentFolderName}</p>
          </div>
        </div>
      )}

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      {shareItem && (
        <ShareModal isOpen={true} item={shareItem} onClose={() => setShareItem(null)} />
      )}
      {showMoveDialog && selectedItems.length > 0 && (
        <MoveToDialog
          itemIds={[...selectedItems]}
          onClose={() => setShowMoveDialog(false)}
        />
      )}
    </div>
  );
};
