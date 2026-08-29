import React, { useEffect, useState } from 'react';
import { Undo, Redo, Download, Share, Trash2, Copy, ImageMinus, CheckCircle, X } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';

export const Toolbar = () => {
  const { 
    undo, redo, canUndo, canRedo, 
    selectedId, deleteElement, duplicateElement, 
    elements, updateElement, canvasConfig, resizeCanvas, createShareLink, lastShareLink
  } = useDesign();

  const selectedElement = elements.find(el => el.id === selectedId);
  const [showResize, setShowResize] = useState(false);
  const [resizeDims, setResizeDims] = useState({ w: canvasConfig.width, h: canvasConfig.height });
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState(lastShareLink);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowResize(false);
        setShowShare(false);
        setStatus('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeXml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const elementToSvg = (el) => {
    if (el.visible === false) return '';
    const opacity = el.opacity ?? 1;
    const transform = `translate(${el.x || 0} ${el.y || 0}) rotate(${el.rotation || 0})`;
    if (el.type === 'rect') {
      return `<rect transform="${transform}" width="${el.width || 100}" height="${el.height || 100}" fill="${el.fill || '#000'}" opacity="${opacity}" />`;
    }
    if (el.type === 'circle') {
      return `<circle transform="${transform}" cx="${el.radius || 50}" cy="${el.radius || 50}" r="${el.radius || 50}" fill="${el.fill || '#000'}" opacity="${opacity}" />`;
    }
    if (el.type === 'star') {
      const r = el.outerRadius || 50;
      return `<polygon transform="${transform}" points="${r},0 ${r * 1.22},${r * .68} ${r * 1.95},${r * .68} ${r * 1.36},${r * 1.1} ${r * 1.58},${r * 1.82} ${r},${r * 1.38} ${r * .42},${r * 1.82} ${r * .64},${r * 1.1} ${r * .05},${r * .68} ${r * .78},${r * .68}" fill="${el.fill || '#000'}" opacity="${opacity}" />`;
    }
    if (el.type === 'text') {
      return `<text transform="${transform}" font-family="${escapeXml(el.fontFamily || 'Arial')}" font-size="${el.fontSize || 24}" font-weight="${el.fontWeight || 'normal'}" font-style="${el.fontStyle || 'normal'}" fill="${el.fill || '#000'}" opacity="${opacity}">${escapeXml(el.text || '')}</text>`;
    }
    if (el.type === 'image') {
      return `<image transform="${transform}" href="${escapeXml(el.src)}" width="${el.width || 200}" height="${el.height || 150}" opacity="${opacity}" />`;
    }
    return '';
  };

  const handleDownload = () => {
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasConfig.width}" height="${canvasConfig.height}" viewBox="0 0 ${canvasConfig.width} ${canvasConfig.height}">`,
      `<rect width="100%" height="100%" fill="${canvasConfig.backgroundColor || '#fff'}" />`,
      ...elements.map(elementToSvg),
      '</svg>'
    ].join('\n');
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'xanva-mock-design.svg');
    setStatus('Design exported as SVG.');
  };

  const handleShare = () => {
    const link = createShareLink();
    setShareLink(link);
    setShowShare(true);
    navigator.clipboard?.writeText(link).catch(() => {});
    setStatus('Local share link generated.');
  };

  const handleBgRemove = () => {
    if (selectedElement && selectedElement.type === 'image') {
      updateElement(selectedElement.id, { opacity: 0.82, bgRemoved: true });
      setStatus('Background remover applied locally.');
    }
  };

  const applyResize = () => {
    resizeCanvas(parseInt(resizeDims.w), parseInt(resizeDims.h));
    setShowResize(false);
  };

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        {/* Xanva logo */}
        <div className="flex items-center gap-1.5 mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#00C4CC"/>
            <path d="M15.5 8.5C15.5 7.12 14.38 6 13 6C11.62 6 10.5 7.12 10.5 8.5C10.5 9.1 10.72 9.65 11.07 10.08L8.08 13.07C7.65 12.72 7.1 12.5 6.5 12.5C5.12 12.5 4 13.62 4 15C4 16.38 5.12 17.5 6.5 17.5C7.88 17.5 9 16.38 9 15C9 14.4 8.78 13.85 8.43 13.42L11.42 10.43C11.85 10.78 12.4 11 13 11C14.38 11 15.5 9.88 15.5 8.5ZM17.5 9C16.12 9 15 10.12 15 11.5C15 12.88 16.12 14 17.5 14C18.88 14 20 12.88 20 11.5C20 10.12 18.88 9 17.5 9Z" fill="white"/>
          </svg>
          <span className="font-bold text-gray-900 text-base tracking-tight">Xanva</span>
        </div>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center gap-1">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <Redo size={18} />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setShowResize(!showResize)}
            className="text-sm font-medium hover:bg-gray-100 px-3 py-1.5 rounded"
          >
            Resize
          </button>
          {showResize && (
            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border rounded-lg p-4 w-64 z-50">
              <h4 className="font-bold mb-3">Custom Size</h4>
              <div className="flex gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500">Width</label>
                  <input 
                    type="number" 
                    value={resizeDims.w} 
                    onChange={e => setResizeDims({...resizeDims, w: e.target.value})}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height</label>
                  <input 
                    type="number" 
                    value={resizeDims.h} 
                    onChange={e => setResizeDims({...resizeDims, h: e.target.value})}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
              <button 
                onClick={applyResize}
                className="w-full bg-primary text-white py-1.5 rounded hover:bg-primary-dark"
              >
                Resize Design
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Tools */}
      {selectedElement && (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => duplicateElement(selectedId)}
            className="p-2 hover:bg-gray-100 rounded text-gray-600"
            title="Duplicate"
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={() => deleteElement(selectedId)}
            className="p-2 hover:bg-red-50 rounded text-red-500"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
          {selectedElement.type === 'image' && (
            <button 
              onClick={handleBgRemove}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              <ImageMinus size={16} />
              <span className="hidden md:inline">BG Remover</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button 
          onClick={handleShare}
          className="px-4 py-1.5 border rounded-md font-medium hover:bg-gray-50 flex items-center gap-2"
        >
          <Share size={16} /> Share
        </button>
        <button 
          onClick={handleDownload}
          className="px-4 py-1.5 bg-primary text-white rounded-md font-medium hover:bg-primary-dark flex items-center gap-2"
        >
          <Download size={16} /> Download
        </button>
      </div>

      {status && (
        <div className="absolute top-full right-4 mt-2 bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-xl flex items-center gap-2 z-50">
          <CheckCircle size={16} className="text-primary" />
          <span>{status}</span>
          <button onClick={() => setStatus('')} className="text-gray-300 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {showShare && (
        <div className="absolute top-full right-24 mt-2 bg-white border rounded-lg shadow-xl p-4 w-80 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">Share design</h4>
            <button onClick={() => setShowShare(false)} className="text-gray-500 hover:text-gray-900">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">Local sandbox link</p>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-2 py-1 text-xs" value={shareLink} readOnly />
            <button
              onClick={() => { navigator.clipboard?.writeText(shareLink).catch(() => {}); setStatus('Share link copied.'); }}
              className="px-3 py-1.5 bg-primary text-white rounded text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
