import React, { useContext, useMemo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import AssetRow from './AssetRow';

const SORTABLE_COLUMNS = [
  { key: 'rank', label: '#', align: 'center', className: 'w-10' },
  { key: 'name', label: 'Name', align: 'left', className: '' },
  { key: 'currentPrice', label: 'Price', align: 'right', className: '' },
  { key: 'priceChange24h', label: '24h %', align: 'right', className: '' },
  { key: 'priceChange7d', label: '7d %', align: 'right', className: 'hidden md:table-cell' },
  { key: 'marketCap', label: 'Market Cap', align: 'right', className: 'hidden lg:table-cell' },
  { key: 'volume24h', label: 'Volume (24h)', align: 'right', className: 'hidden xl:table-cell' },
  { key: 'sparkline', label: 'Last 7 Days', align: 'left', className: 'hidden lg:table-cell', sortable: false },
  { key: 'watchlist', label: '', align: 'center', className: 'w-10', sortable: false },
];

function AssetTable({ onNavigateToAsset }) {
  const { state, updateState } = useContext(CoinbaseContext);
  const { sortBy, sortDirection, searchQuery } = state.ui;

  const handleSort = (columnKey) => {
    const column = SORTABLE_COLUMNS.find((c) => c.key === columnKey);
    if (column && column.sortable === false) return;

    if (sortBy === columnKey) {
      updateState({
        ui: {
          ...state.ui,
          sortDirection: sortDirection === 'asc' ? 'desc' : 'asc',
        },
      });
    } else {
      updateState({
        ui: {
          ...state.ui,
          sortBy: columnKey,
          sortDirection: 'desc',
        },
      });
    }
  };

  const filteredAndSorted = useMemo(() => {
    let assets = [...state.assets];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.symbol.toLowerCase().includes(query)
      );
    }

    // Sort
    assets.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case 'rank':
        case 'marketCap':
          aVal = a.marketCap;
          bVal = b.marketCap;
          // For rank: desc marketCap = asc rank
          if (sortBy === 'rank') {
            return sortDirection === 'asc'
              ? bVal - aVal
              : aVal - bVal;
          }
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        case 'currentPrice':
          aVal = a.currentPrice;
          bVal = b.currentPrice;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        case 'priceChange24h':
          aVal = a.priceChange24h;
          bVal = b.priceChange24h;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        case 'priceChange7d':
          aVal = a.priceChange7d;
          bVal = b.priceChange7d;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        case 'volume24h':
          aVal = a.volume24h;
          bVal = b.volume24h;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });

    // Assign rank based on market cap (always descending market cap = rank 1)
    const ranked = [...state.assets].sort((a, b) => b.marketCap - a.marketCap);
    const rankMap = {};
    ranked.forEach((a, i) => {
      rankMap[a.id] = i + 1;
    });

    return assets.map((a) => ({ ...a, rank: rankMap[a.id] }));
  }, [state.assets, sortBy, sortDirection, searchQuery]);

  const SortIcon = ({ columnKey }) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={12} className="text-gray-300 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-[#0052FF] ml-0.5" />
    ) : (
      <ChevronDown size={14} className="text-[#0052FF] ml-0.5" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className} ${
                    col.sortable !== false ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                  }`}
                  style={{ textAlign: col.align }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable !== false && col.label && (
                      <SortIcon columnKey={col.key} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  rank={asset.rank}
                  onNavigate={onNavigateToAsset}
                />
              ))
            ) : (
              <tr>
                <td colSpan={SORTABLE_COLUMNS.length} className="py-12 text-center text-gray-400">
                  No assets found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetTable;
