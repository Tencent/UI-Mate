import React, { useMemo } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileTypeIcon } from '../components/FileTypeIcon';
import { formatBytes } from '../lib/utils';
import { FileSystemItem } from '../lib/types';
import { HardDrive, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple SVG pie/donut chart
const DonutChart = ({ segments }: {
  segments: { label: string; value: number; color: string }[];
}) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const innerR = 38;

  let cumAngle = -Math.PI / 2; // start from top

  const arcs = segments.map(seg => {
    const fraction = seg.value / total;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ');

    return { ...seg, d, fraction };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
};

export const Storage = () => {
  const { state, getFolderContents } = useFileSystem();
  const navigate = useNavigate();

  // Collect all non-trashed files owned by current user
  const myFiles = useMemo(() => {
    return Object.values(state.items).filter(
      item => item.ownerId === state.currentUser.id && !item.trashed
    );
  }, [state.items, state.currentUser.id]);

  // Compute storage breakdown by category
  const breakdown = useMemo(() => {
    const categories: Record<string, { label: string; bytes: number; color: string }> = {
      doc: { label: 'Google Docs', bytes: 0, color: '#1A73E8' },
      spreadsheet: { label: 'Google Sheets', bytes: 0, color: '#1E8E3E' },
      presentation: { label: 'Google Slides', bytes: 0, color: '#F9AB00' },
      pdf: { label: 'PDFs', bytes: 0, color: '#EA4335' },
      image: { label: 'Images', bytes: 0, color: '#FA7B17' },
      video: { label: 'Videos', bytes: 0, color: '#9334E6' },
      audio: { label: 'Audio', bytes: 0, color: '#24C1E0' },
      text: { label: 'Text files', bytes: 0, color: '#5F6368' },
      archive: { label: 'Archives', bytes: 0, color: '#AECBFA' },
      other: { label: 'Other', bytes: 0, color: '#DADCE0' },
    };

    myFiles.forEach(item => {
      const cat = categories[item.type];
      if (cat) {
        cat.bytes += item.size;
      } else {
        categories.other.bytes += item.size;
      }
    });

    return Object.entries(categories)
      .filter(([, v]) => v.bytes > 0)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.bytes - a.bytes);
  }, [myFiles]);

  // Largest files (non-trashed)
  const largestFiles = useMemo(() => {
    return myFiles
      .filter(item => item.type !== 'folder' && item.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, 15);
  }, [myFiles]);

  const storageUsed = state.storageUsed;
  const storageTotal = state.storageTotal;
  const percentage = Math.min((storageUsed / storageTotal) * 100, 100);
  const usedGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (storageTotal / (1024 * 1024 * 1024)).toFixed(0);

  // Pie segments (exclude zero)
  const pieSegments = breakdown.map(b => ({ label: b.label, value: b.bytes, color: b.color }));
  // Add free space
  const usedByFiles = breakdown.reduce((s, b) => s + b.bytes, 0);
  const freeSpace = storageTotal - storageUsed;
  if (freeSpace > 0) {
    pieSegments.push({ label: 'Free', value: freeSpace, color: '#F1F3F4' });
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-[#DADCE0] flex items-center gap-3 px-6 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#5F6368] hover:text-[#202124] transition-colors flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </button>
        <div className="h-4 w-px bg-[#DADCE0]" />
        <h1 className="text-base font-normal text-[#202124] flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#1A73E8]" />
          Storage
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl">
        {/* Overview card */}
        <div className="bg-white border border-[#DADCE0] rounded-xl p-6 mb-6">
          <h2 className="text-base font-medium text-[#202124] mb-4">Storage overview</h2>
          <div className="flex items-start gap-8">
            {/* Donut */}
            <div className="flex-shrink-0">
              <DonutChart segments={pieSegments} />
            </div>

            {/* Stats */}
            <div className="flex-1">
              <p className="text-2xl font-medium text-[#202124] mb-1">{usedGB} GB</p>
              <p className="text-sm text-[#5F6368] mb-4">of {totalGB} GB used</p>

              {/* Usage bar */}
              <div className="w-full bg-[#DADCE0] rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage > 90 ? '#EA4335' : percentage > 70 ? '#F4B400' : '#1A73E8'
                  }}
                />
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {breakdown.map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-[#3C4043] truncate">{item.label}</span>
                    </div>
                    <span className="text-sm text-[#5F6368] flex-shrink-0">{formatBytes(item.bytes)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 border border-[#DADCE0]" style={{ backgroundColor: '#F1F3F4' }} />
                    <span className="text-sm text-[#3C4043]">Free space</span>
                  </div>
                  <span className="text-sm text-[#5F6368]">{formatBytes(freeSpace > 0 ? freeSpace : 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean up suggestion */}
        {percentage > 50 && (
          <div className="bg-[#FEF7E0] border border-[#F4B400] rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F4B400] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#202124]">Clean up space</p>
              <p className="text-sm text-[#5F6368] mt-0.5">
                Consider removing large files you no longer need, or emptying the trash to free up space.
              </p>
            </div>
          </div>
        )}

        {/* Largest files */}
        <div className="bg-white border border-[#DADCE0] rounded-xl p-6">
          <h2 className="text-base font-medium text-[#202124] mb-4">Largest files</h2>
          {largestFiles.length === 0 ? (
            <p className="text-sm text-[#5F6368]">No files found.</p>
          ) : (
            <div className="space-y-0">
              {largestFiles.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 border-b border-[#F1F3F4] last:border-0 cursor-pointer hover:bg-[#F8F9FA] -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => {
                    if (item.parentId) navigate(`/folder/${item.parentId}`);
                    else navigate('/');
                  }}
                >
                  <FileTypeIcon item={item} size="sm" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#202124] truncate">{item.name}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-3">
                    {/* Size bar */}
                    <div className="w-24 bg-[#F1F3F4] rounded-full h-1.5 hidden sm:block">
                      <div
                        className="h-1.5 rounded-full bg-[#1A73E8]"
                        style={{ width: `${Math.min((item.size / largestFiles[0].size) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#5F6368] w-16 text-right">{formatBytes(item.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
