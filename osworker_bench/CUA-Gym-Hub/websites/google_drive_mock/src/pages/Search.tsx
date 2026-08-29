import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import { FileList } from '../components/FileList';
import { PreviewModal } from '../components/PreviewModal';
import { FileTypeIcon } from '../components/FileTypeIcon';
import { FileSystemItem } from '../lib/types';
import { Search as SearchIcon, X } from 'lucide-react';
import { formatBytes } from '../lib/utils';

const SearchResultItem = ({
  item,
  onPreview,
  getPath
}: {
  item: FileSystemItem;
  onPreview: (item: FileSystemItem) => void;
  getPath: (folderId: string | null) => FileSystemItem[];
}) => {
  const navigate = useNavigate();

  const path = item.parentId ? getPath(item.parentId) : [];
  const pathStr = ['My Drive', ...path.map(p => p.name)].join(' › ');

  const handleClick = () => {
    if (item.type === 'folder') {
      navigate(`/folder/${item.id}`);
    } else {
      onPreview(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 px-6 py-3 hover:bg-[#F1F3F4] cursor-pointer transition-colors border-b border-[#F1F3F4] group"
    >
      <FileTypeIcon item={item} size="sm" className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#202124] truncate">{item.name}</p>
        <p className="text-xs text-[#9AA0A6] mt-0.5">{pathStr}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#5F6368] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.type !== 'folder' && item.size > 0 && (
          <span>{formatBytes(item.size)}</span>
        )}
      </div>
    </div>
  );
};

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchItems, getPath } = useFileSystem();
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
  const [localQuery, setLocalQuery] = useState(query);

  const items = searchItems(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchParams({});
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Search header */}
      <div className="px-6 pt-4 pb-3 border-b border-[#DADCE0] flex-shrink-0">
        {query && (
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-base font-normal text-[#202124]">
              Search results for
            </h1>
            <span className="text-base font-medium text-[#202124]">"{query}"</span>
            <button
              onClick={handleClear}
              className="ml-1 text-xs text-[#1A73E8] hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        )}
        <p className="text-xs text-[#5F6368]">
          {query ? `${items.length} result${items.length !== 1 ? 's' : ''} found` : 'Enter a search query'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!query ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5F6368] gap-3">
            <SearchIcon className="w-16 h-16 text-[#DADCE0]" />
            <p className="text-base">Search your files</p>
            <p className="text-sm text-[#9AA0A6]">Use the search bar above to find files</p>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5F6368] gap-3">
            <SearchIcon className="w-16 h-16 text-[#DADCE0]" />
            <p className="text-base font-medium">No results found for "{query}"</p>
            <p className="text-sm text-[#9AA0A6]">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="py-2">
            {items.map(item => (
              <SearchResultItem
                key={item.id}
                item={item}
                onPreview={setPreviewItem}
                getPath={getPath}
              />
            ))}
          </div>
        )}
      </div>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};
