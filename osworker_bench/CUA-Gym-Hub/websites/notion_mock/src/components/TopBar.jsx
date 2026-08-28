import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import { Star, MoreHorizontal, Share, Clock, MessageSquare, Smile, Image as ImageIcon, Copy, Files, FolderInput, Trash2, History, ChevronRight, X } from 'lucide-react';
import { ShareDialog } from './ShareDialog';
import { CommentsPanel } from './CommentsPanel';
import { PageHistoryPanel } from './PageHistory';

// Build breadcrumb chain by walking parentId
const buildBreadcrumbs = (pageId, pages, workspace) => {
  const crumbs = [];
  let currentId = pageId;
  while (currentId && pages[currentId]) {
    const p = pages[currentId];
    crumbs.unshift({ id: p.id, title: p.title || 'Untitled', icon: p.icon });
    currentId = p.parentId;
  }
  // Prepend workspace
  crumbs.unshift({ id: null, title: workspace.name, icon: workspace.icon, isWorkspace: true });
  return crumbs;
};

// Inline emoji picker for "Add icon" in More menu
const EmojiPickerPopover = ({ onSelect, onClose }) => {
  const emojis = ['\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}', '\u{1F602}', '\u{1F923}', '\u{1F60A}', '\u{1F607}', '\u{1F642}', '\u{1F643}', '\u{1F609}', '\u{1F60C}', '\u{1F60D}', '\u{1F970}', '\u{1F618}', '\u{1F617}', '\u{1F619}', '\u{1F61A}', '\u{1F60B}', '\u{1F61B}', '\u{1F61D}', '\u{1F61C}', '\u{1F92A}', '\u{1F928}', '\u{1F9D0}', '\u{1F913}', '\u{1F60E}', '\u{1F929}', '\u{1F973}', '\u{1F60F}', '\u{1F44B}', '\u270B', '\u{1F44D}', '\u{1F44E}', '\u270C\uFE0F', '\u{1F918}', '\u{1F680}', '\u{1F3E0}', '\u{1F4DA}', '\u{1F4D6}', '\u{1F4DD}', '\u{1F4CB}', '\u{1F4CA}', '\u{1F4C5}', '\u{1F4C6}', '\u{1F3A8}', '\u{1F3AF}', '\u{1F9ED}', '\u{1F4D1}', '\u{1F4D7}', '\u{1F4D8}', '\u{1F4D9}', '\u{1F4D5}', '\u{1F4D3}', '\u{1F373}', '\u2708\uFE0F', '\u{1F4E2}', '\u{1F9EA}', '\u{1F5FA}\uFE0F', '\u{1F525}', '\u2B50', '\u{1F4A1}', '\u2764\uFE0F', '\u{1F389}', '\u{1F381}', '\u{1F3C6}', '\u{1F3B5}', '\u{1F3B6}', '\u{1F3AE}', '\u{1F3AD}', '\u{1F4F1}', '\u{1F4BB}', '\u{1F4F7}', '\u{1F50D}', '\u{1F512}', '\u{1F511}', '\u2699\uFE0F', '\u{1F6E0}\uFE0F', '\u{1F4A4}', '\u{1F30D}', '\u{1F30E}', '\u{1F30F}', '\u{1F308}', '\u2600\uFE0F', '\u{1F319}', '\u2B50', '\u{1F31F}', '\u26A1', '\u{1F4A5}', '\u{1F300}', '\u{1F332}', '\u{1F334}', '\u{1F33B}', '\u{1F33A}', '\u{1F337}'];
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-2 w-64 h-64 overflow-y-auto" style={{ top: '100%', right: 0, marginTop: 4 }}>
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-xs font-bold text-gray-500">EMOJIS</span>
        <button onClick={onClose}><X size={14} /></button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {emojis.map((emoji, idx) => (
          <button
            key={idx}
            className="hover:bg-gray-100 p-1 rounded text-xl"
            onClick={() => { onSelect(emoji); onClose(); }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Dropdown for the More menu
const MoreMenu = ({ pageId, page, onClose, onShowHistory }) => {
  const { state, updatePage, trashPage, duplicatePage } = useStore();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const allPages = Object.values(state.pages).filter(p => p.id !== pageId && !p.parentId?.startsWith?.('db-') && p.type !== 'database');

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[220px] z-50 text-sm">
      {!page.icon && (
        <div className="relative">
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => setShowIconPicker(true)}>
            <Smile size={14} className="mr-2 text-gray-500" /> Add icon
          </button>
          {showIconPicker && (
            <EmojiPickerPopover
              onSelect={(icon) => { updatePage(pageId, { icon }); onClose(); }}
              onClose={() => setShowIconPicker(false)}
            />
          )}
        </div>
      )}
      {!page.cover && (
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
          updatePage(pageId, { cover: `https://picsum.photos/1500/400?random=${Date.now()}` });
          onClose();
        }}>
          <ImageIcon size={14} className="mr-2 text-gray-500" /> Add cover
        </button>
      )}
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        navigator.clipboard.writeText(window.location.origin + `/page/${pageId}`);
        onClose();
      }}>
        <Copy size={14} className="mr-2 text-gray-500" /> Copy link
      </button>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        duplicatePage(pageId);
        onClose();
      }}>
        <Files size={14} className="mr-2 text-gray-500" /> Duplicate
      </button>
      <div className="relative">
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700" onClick={() => setShowMoveTo(!showMoveTo)}>
          <span className="flex items-center"><FolderInput size={14} className="mr-2 text-gray-500" /> Move to</span>
          <ChevronRight size={12} className="text-gray-400" />
        </button>
        {showMoveTo && (
          <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
            {allPages.map(p => (
              <button key={p.id} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700 text-xs" onClick={() => {
                updatePage(pageId, { parentId: p.id });
                onClose();
              }}>
                <span className="mr-2">{p.icon || '\u{1F4C4}'}</span>
                <span className="truncate">{p.title || 'Untitled'}</span>
              </button>
            ))}
            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-500 text-xs" onClick={() => {
              updatePage(pageId, { parentId: null });
              onClose();
            }}>
              Move to root
            </button>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-red-600" onClick={() => {
        trashPage(pageId);
        const remaining = Object.values(state.pages).filter(p => p.id !== pageId && !p.parentId);
        if (remaining.length > 0) navigate(`/page/${remaining[0].id}`);
        onClose();
      }}>
        <Trash2 size={14} className="mr-2" /> Delete
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        onShowHistory();
        onClose();
      }}>
        <History size={14} className="mr-2 text-gray-500" /> Page history
      </button>
    </div>
  );
};

export const TopBar = ({ pageId }) => {
  const { state, updatePage } = useStore();
  const page = state.pages[pageId];
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const moreButtonRef = useRef(null);

  if (!page) return null;

  const breadcrumbs = buildBreadcrumbs(pageId, state.pages, state.workspace);

  // Comment count
  const commentCount = Object.values(state.comments || {}).filter(c => c.pageId === pageId && !c.resolved).length;

  // Collapse middle crumbs if chain is deeper than 3 levels
  const maxVisible = 4;
  let displayCrumbs = breadcrumbs;
  if (breadcrumbs.length > maxVisible) {
    displayCrumbs = [
      breadcrumbs[0],
      { id: '__ellipsis__', title: '...', icon: null, isEllipsis: true },
      ...breadcrumbs.slice(-2),
    ];
  }

  return (
    <>
      <div className="h-11 flex items-center justify-between px-3 sticky top-0 bg-white z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm overflow-hidden min-w-0">
          {displayCrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
              {index > 0 && (
                <span className="mx-1 text-gray-400 text-xs flex-shrink-0">/</span>
              )}
              {crumb.isEllipsis ? (
                <span className="text-gray-400 flex-shrink-0">...</span>
              ) : crumb.isWorkspace ? (
                <Link to="/" className="flex items-center px-1 hover:bg-xotion-hover rounded cursor-pointer transition-colors flex-shrink-0">
                  <span className="mr-1 text-sm">{crumb.icon}</span>
                  <span className="truncate max-w-[150px] text-gray-500">{crumb.title}</span>
                </Link>
              ) : crumb.id === pageId ? (
                <div className="flex items-center px-1 hover:bg-xotion-hover rounded cursor-pointer transition-colors min-w-0">
                  <span className="mr-1 text-lg flex-shrink-0">{crumb.icon || '\u{1F4C4}'}</span>
                  <span className="truncate font-medium max-w-[200px]">{crumb.title}</span>
                </div>
              ) : (
                <Link to={`/page/${crumb.id}`} className="flex items-center px-1 hover:bg-xotion-hover rounded cursor-pointer transition-colors flex-shrink-0">
                  <span className="mr-1 text-lg">{crumb.icon || '\u{1F4C4}'}</span>
                  <span className="truncate max-w-[150px] text-gray-500">{crumb.title}</span>
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 text-xotion-textGray flex-shrink-0">
          <span className="text-xs mr-2">Edited {new Date(page.lastEditedDate || page.createdDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>

          <button
            className="p-1 hover:bg-xotion-hover rounded transition-colors"
            onClick={() => setShowShareDialog(true)}
            title="Share"
          >
            <Share size={18} />
          </button>
          <button
            className="p-1 hover:bg-xotion-hover rounded transition-colors relative"
            onClick={() => setShowComments(!showComments)}
            title="Comments"
          >
            <MessageSquare size={18} />
            {commentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {commentCount}
              </span>
            )}
          </button>
          <button
            className="p-1 hover:bg-xotion-hover rounded transition-colors"
            onClick={() => setShowHistory(!showHistory)}
            title="Page history"
          >
            <Clock size={18} />
          </button>
          <button
            className="p-1 hover:bg-xotion-hover rounded transition-colors"
            onClick={() => updatePage(pageId, { favorite: !page.favorite })}
            title={page.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={18} className={page.favorite ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <div className="relative" ref={moreButtonRef}>
            <button
              className="p-1 hover:bg-xotion-hover rounded transition-colors"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal size={18} />
            </button>
            {showMoreMenu && (
              <MoreMenu
                pageId={pageId}
                page={page}
                onClose={() => setShowMoreMenu(false)}
                onShowHistory={() => setShowHistory(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Panels */}
      {showShareDialog && <ShareDialog pageId={pageId} onClose={() => setShowShareDialog(false)} />}
      {showComments && <CommentsPanel pageId={pageId} onClose={() => setShowComments(false)} />}
      {showHistory && <PageHistoryPanel pageId={pageId} onClose={() => setShowHistory(false)} />}
    </>
  );
};
