import React, { useState, useRef, useEffect } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Printer, Paintbrush,
  Type, PaintBucket, DollarSign, Percent,
  ChevronDown, Filter, Grid3x3,
} from 'lucide-react';
import { CellStyle, NumberFormat, CellData } from '../utils/types';

interface ToolbarProps {
  onFormat: (style: Partial<CellStyle>, format?: NumberFormat) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  selectedCellData?: CellData;
  onFilter: () => void;
  onMerge?: (type: 'all' | 'horizontal' | 'vertical' | 'unmerge') => void;
  onInsertFunction?: (fn: string) => void;
  onPrint?: () => void;
  onPaintFormat?: () => void;
}

const ZOOM_OPTIONS = [50, 75, 90, 100, 125, 150, 200];
const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const FONT_FAMILIES = ['Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Palatino'];
const NUMBER_FORMATS: Array<{ label: string; value: NumberFormat | undefined }> = [
  { label: 'Automatic', value: undefined },
  { label: 'Plain text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Currency ($)', value: 'currency' },
  { label: 'Percent (%)', value: 'percent' },
  { label: 'Scientific', value: 'scientific' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
];

const COLOR_PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#9900FF', '#FF00FF',
  '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#673AB7', '#F06292', '#26C6DA', '#8D6E63',
  '#FFC107', '#8BC34A', '#00BCD4', '#3F51B5', '#E91E63', '#FF5722', '#9E9E9E', '#607D8B',
];

const BORDER_PRESETS = [
  { label: 'All borders', icon: '⊞', value: 'all' },
  { label: 'Inner borders', icon: '⊕', value: 'inner' },
  { label: 'Horizontal borders', icon: '═', value: 'horizontal' },
  { label: 'Vertical borders', icon: '║', value: 'vertical' },
  { label: 'Outer borders', icon: '□', value: 'outer' },
  { separator: true },
  { label: 'Left border', icon: '▏', value: 'left' },
  { label: 'Right border', icon: '▕', value: 'right' },
  { label: 'Top border', icon: '▔', value: 'top' },
  { label: 'Bottom border', icon: '▁', value: 'bottom' },
  { separator: true },
  { label: 'Clear borders', icon: '✕', value: 'none' },
];

const ToolbarSeparator: React.FC = () => (
  <div className="h-5 w-px bg-[#DADCE0] mx-1" />
);

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DropdownWrapper: React.FC<DropdownProps> = ({ trigger, children, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className="absolute top-full left-0 mt-0.5 z-50 bg-white border border-[#DADCE0] rounded shadow-lg"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)', minWidth: 160 }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface TbBtnProps {
  onClick?: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

const TbBtn: React.FC<TbBtnProps> = ({ onClick, title, disabled, active, children }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded transition-colors flex items-center justify-center
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#E8EAED] cursor-pointer'}
      ${active ? 'bg-[#D3E3FD]' : ''}
    `}
    style={{ minWidth: 28 }}
  >
    {children}
  </button>
);

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat, onUndo, onRedo, canUndo, canRedo, zoom, onZoom, selectedCellData, onFilter, onMerge,
  onInsertFunction, onPrint, onPaintFormat,
}) => {
  const style = selectedCellData?.style || {};
  const [lastTextColor, setLastTextColor] = useState('#000000');
  const [lastFillColor, setLastFillColor] = useState('#FFFF00');
  const [lastBorderColor, setLastBorderColor] = useState('#000000');
  const [lastBorderStyle, setLastBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [fontSizeInput, setFontSizeInput] = useState(String(style.fontSize || 10));
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fillInputRef = useRef<HTMLInputElement>(null);
  const borderColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFontSizeInput(String(selectedCellData?.style?.fontSize || 10));
  }, [selectedCellData?.style?.fontSize]);

  const applyTextColor = (color: string) => {
    setLastTextColor(color);
    onFormat({ color });
  };

  const applyFillColor = (color: string) => {
    setLastFillColor(color);
    onFormat({ bg: color });
  };

  const applyBorder = (preset: string) => {
    const edge = { style: lastBorderStyle as any, width: 1, color: lastBorderColor };
    switch (preset) {
      case 'all':
        onFormat({ borders: { top: edge, right: edge, bottom: edge, left: edge } });
        break;
      case 'outer':
        onFormat({ borders: { top: edge, right: edge, bottom: edge, left: edge } });
        break;
      case 'inner':
        onFormat({ borders: { top: edge, right: edge, bottom: edge, left: edge } });
        break;
      case 'top':
        onFormat({ borders: { ...style.borders, top: edge } });
        break;
      case 'bottom':
        onFormat({ borders: { ...style.borders, bottom: edge } });
        break;
      case 'left':
        onFormat({ borders: { ...style.borders, left: edge } });
        break;
      case 'right':
        onFormat({ borders: { ...style.borders, right: edge } });
        break;
      case 'horizontal':
        onFormat({ borders: { ...style.borders, top: edge, bottom: edge } });
        break;
      case 'vertical':
        onFormat({ borders: { ...style.borders, left: edge, right: edge } });
        break;
      case 'none':
        onFormat({ borders: { top: null, right: null, bottom: null, left: null } });
        break;
    }
  };

  const currentFontFamily = style.fontFamily || 'Arial';
  const currentFontSize = style.fontSize || 10;

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 border-b overflow-x-auto"
      style={{ backgroundColor: '#F9FBFD', borderColor: '#DADCE0', minHeight: 40 }}
    >
      {/* Group 1: Undo/Redo/Print/Paint */}
      <TbBtn onClick={onUndo} title="Undo (Ctrl+Z)" disabled={!canUndo}>
        <Undo2 size={16} />
      </TbBtn>
      <TbBtn onClick={onRedo} title="Redo (Ctrl+Y)" disabled={!canRedo}>
        <Redo2 size={16} />
      </TbBtn>
      <TbBtn onClick={onPrint} title="Print (Ctrl+P)">
        <Printer size={16} />
      </TbBtn>
      <TbBtn onClick={onPaintFormat} title="Paint format">
        <Paintbrush size={16} />
      </TbBtn>
      <ToolbarSeparator />

      {/* Group 2: Zoom */}
      <DropdownWrapper
        trigger={
          <button
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-[#E8EAED] rounded cursor-pointer"
            title="Zoom"
            style={{ minWidth: 60 }}
          >
            {zoom}%
            <ChevronDown size={12} />
          </button>
        }
      >
        {ZOOM_OPTIONS.map(z => (
          <button
            key={z}
            className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] ${zoom === z ? 'text-[#1A73E8] font-medium' : 'text-[#202124]'}`}
            onClick={() => onZoom(z)}
          >
            {z}%
          </button>
        ))}
      </DropdownWrapper>
      <ToolbarSeparator />

      {/* Group 3: Number formats */}
      <TbBtn onClick={() => onFormat({}, 'currency')} title="Format as Currency ($)">
        <DollarSign size={15} />
      </TbBtn>
      <TbBtn onClick={() => onFormat({}, 'percent')} title="Format as Percent (%)">
        <Percent size={15} />
      </TbBtn>
      <TbBtn onClick={() => onFormat({}, 'number')} title="Decrease decimal" >
        <span className="text-xs font-mono">.0←</span>
      </TbBtn>
      <TbBtn onClick={() => onFormat({}, 'number')} title="Increase decimal">
        <span className="text-xs font-mono">.0→</span>
      </TbBtn>
      <DropdownWrapper
        trigger={
          <button className="flex items-center gap-0.5 px-1.5 py-1 text-sm hover:bg-[#E8EAED] rounded cursor-pointer" title="Number format">
            <span className="font-mono text-xs">123</span>
            <ChevronDown size={10} />
          </button>
        }
      >
        {NUMBER_FORMATS.map(({ label, value }) => (
          <button
            key={label}
            className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124]"
            onClick={() => onFormat({}, value)}
          >
            {label}
          </button>
        ))}
      </DropdownWrapper>
      <ToolbarSeparator />

      {/* Group 4: Font family */}
      <DropdownWrapper
        trigger={
          <button
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-[#E8EAED] rounded cursor-pointer"
            title="Font"
            style={{ minWidth: 80, maxWidth: 120 }}
          >
            <span className="truncate" style={{ fontFamily: currentFontFamily }}>{currentFontFamily}</span>
            <ChevronDown size={12} />
          </button>
        }
      >
        {FONT_FAMILIES.map(f => (
          <button
            key={f}
            className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] ${currentFontFamily === f ? 'text-[#1A73E8]' : 'text-[#202124]'}`}
            style={{ fontFamily: f }}
            onClick={() => onFormat({ fontFamily: f })}
          >
            {f}
          </button>
        ))}
      </DropdownWrapper>

      {/* Font size */}
      <div className="relative flex items-center">
        <DropdownWrapper
          trigger={
            <div className="flex items-center">
              <input
                type="text"
                value={fontSizeInput}
                onChange={e => setFontSizeInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(fontSizeInput);
                  if (!isNaN(n) && n > 0) onFormat({ fontSize: n });
                  else setFontSizeInput(String(currentFontSize));
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const n = parseInt(fontSizeInput);
                    if (!isNaN(n) && n > 0) onFormat({ fontSize: n });
                  }
                }}
                className="w-10 text-center text-sm border border-[#DADCE0] rounded-l px-1 py-0.5 outline-none focus:border-[#4285F4]"
                onClick={e => e.stopPropagation()}
              />
              <button className="border border-l-0 border-[#DADCE0] rounded-r px-0.5 py-0.5 hover:bg-[#E8EAED]">
                <ChevronDown size={10} />
              </button>
            </div>
          }
        >
          {FONT_SIZES.map(s => (
            <button
              key={s}
              className={`block w-full text-left px-4 py-1 text-sm hover:bg-[#F1F3F4] ${currentFontSize === s ? 'text-[#1A73E8]' : 'text-[#202124]'}`}
              onClick={() => { onFormat({ fontSize: s }); setFontSizeInput(String(s)); }}
            >
              {s}
            </button>
          ))}
        </DropdownWrapper>
      </div>
      <ToolbarSeparator />

      {/* Group 5: Bold/Italic/Strikethrough/Colors */}
      <TbBtn onClick={() => onFormat({ bold: !style.bold })} title="Bold (Ctrl+B)" active={!!style.bold}>
        <span className="font-bold text-sm">B</span>
      </TbBtn>
      <TbBtn onClick={() => onFormat({ italic: !style.italic })} title="Italic (Ctrl+I)" active={!!style.italic}>
        <span className="italic text-sm">I</span>
      </TbBtn>
      <TbBtn onClick={() => onFormat({ underline: !style.underline })} title="Underline (Ctrl+U)" active={!!style.underline}>
        <span className="underline text-sm">U</span>
      </TbBtn>
      <TbBtn onClick={() => onFormat({ strikethrough: !style.strikethrough })} title="Strikethrough" active={!!style.strikethrough}>
        <span className="line-through text-sm">S</span>
      </TbBtn>

      {/* Text color */}
      <DropdownWrapper
        trigger={
          <button className="flex items-center p-1.5 hover:bg-[#E8EAED] rounded cursor-pointer" title="Text color">
            <div className="relative">
              <Type size={15} />
              <div className="absolute -bottom-1 left-0 right-0 h-1 rounded-sm" style={{ backgroundColor: lastTextColor }} />
            </div>
            <ChevronDown size={10} className="ml-0.5" />
          </button>
        }
      >
        <div className="p-2 w-48">
          <div className="grid grid-cols-8 gap-1 mb-2">
            {COLOR_PALETTE.map(c => (
              <button
                key={c}
                className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => applyTextColor(c)}
                title={c}
              />
            ))}
          </div>
          <button
            className="text-xs text-[#202124] hover:bg-[#F1F3F4] w-full text-left px-2 py-1 rounded"
            onClick={() => colorInputRef.current?.click()}
          >
            Custom...
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            defaultValue={lastTextColor}
            onChange={e => applyTextColor(e.target.value)}
          />
        </div>
      </DropdownWrapper>

      {/* Fill color */}
      <DropdownWrapper
        trigger={
          <button className="flex items-center p-1.5 hover:bg-[#E8EAED] rounded cursor-pointer" title="Fill color">
            <div className="relative">
              <PaintBucket size={15} />
              <div className="absolute -bottom-1 left-0 right-0 h-1 rounded-sm" style={{ backgroundColor: lastFillColor }} />
            </div>
            <ChevronDown size={10} className="ml-0.5" />
          </button>
        }
      >
        <div className="p-2 w-48">
          <button
            className="block w-full text-left px-2 py-1 text-xs hover:bg-[#F1F3F4] rounded mb-1"
            onClick={() => onFormat({ bg: '' })}
          >
            None (remove)
          </button>
          <div className="grid grid-cols-8 gap-1 mb-2">
            {COLOR_PALETTE.map(c => (
              <button
                key={c}
                className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => applyFillColor(c)}
                title={c}
              />
            ))}
          </div>
          <button
            className="text-xs text-[#202124] hover:bg-[#F1F3F4] w-full text-left px-2 py-1 rounded"
            onClick={() => fillInputRef.current?.click()}
          >
            Custom...
          </button>
          <input
            ref={fillInputRef}
            type="color"
            className="sr-only"
            defaultValue={lastFillColor}
            onChange={e => applyFillColor(e.target.value)}
          />
        </div>
      </DropdownWrapper>

      {/* Borders dropdown */}
      <DropdownWrapper
        trigger={
          <button className="flex items-center p-1.5 hover:bg-[#E8EAED] rounded cursor-pointer" title="Borders">
            <Grid3x3 size={15} />
            <ChevronDown size={10} className="ml-0.5" />
          </button>
        }
      >
        <div className="py-1 w-52">
          <div className="px-2 pb-1">
            <div className="grid grid-cols-4 gap-1">
              {BORDER_PRESETS.filter(p => !('separator' in p)).map((preset: any) => (
                <button
                  key={preset.value}
                  className="flex flex-col items-center p-1.5 rounded hover:bg-[#F1F3F4] text-[#202124]"
                  title={preset.label}
                  onClick={() => applyBorder(preset.value)}
                >
                  <span className="text-base">{preset.icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-[#DADCE0] my-1" />
          <div className="px-2 py-1">
            <div className="text-xs text-[#5F6368] mb-1">Border color</div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-sm border border-gray-300" style={{ backgroundColor: lastBorderColor }} />
              <button
                className="text-xs text-[#202124] hover:bg-[#F1F3F4] px-2 py-0.5 rounded border border-[#DADCE0]"
                onClick={() => borderColorInputRef.current?.click()}
              >
                Pick color
              </button>
              <input
                ref={borderColorInputRef}
                type="color"
                className="sr-only"
                value={lastBorderColor}
                onChange={e => setLastBorderColor(e.target.value)}
              />
            </div>
          </div>
          <div className="px-2 py-1">
            <div className="text-xs text-[#5F6368] mb-1">Border style</div>
            <div className="flex gap-1">
              {(['solid', 'dashed', 'dotted'] as const).map(s => (
                <button
                  key={s}
                  className={`flex-1 py-1 text-xs rounded border ${lastBorderStyle === s ? 'border-[#1A73E8] text-[#1A73E8] bg-[#E8F0FE]' : 'border-[#DADCE0] text-[#202124]'} hover:bg-[#F1F3F4]`}
                  onClick={() => setLastBorderStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DropdownWrapper>

      {/* Cell Merge */}
      {onMerge && (
        <DropdownWrapper
          trigger={
            <button className="flex items-center p-1.5 hover:bg-[#E8EAED] rounded cursor-pointer" title="Merge cells">
              <span className="text-sm font-medium">⊞</span>
              <ChevronDown size={10} className="ml-0.5" />
            </button>
          }
        >
          <div className="py-1">
            <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124]" onClick={() => onMerge('all')}>Merge all</button>
            <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124]" onClick={() => onMerge('horizontal')}>Merge horizontally</button>
            <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124]" onClick={() => onMerge('vertical')}>Merge vertically</button>
            <div className="border-t border-[#DADCE0] my-1" />
            <button className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124]" onClick={() => onMerge('unmerge')}>Unmerge</button>
          </div>
        </DropdownWrapper>
      )}
      <ToolbarSeparator />

      {/* Group 6: Alignment */}
      <TbBtn onClick={() => onFormat({ align: 'left' })} title="Align left" active={style.align === 'left'}>
        <AlignLeft size={15} />
      </TbBtn>
      <TbBtn onClick={() => onFormat({ align: 'center' })} title="Align center" active={style.align === 'center'}>
        <AlignCenter size={15} />
      </TbBtn>
      <TbBtn onClick={() => onFormat({ align: 'right' })} title="Align right" active={style.align === 'right'}>
        <AlignRight size={15} />
      </TbBtn>
      <ToolbarSeparator />

      {/* Group 7: Filter + Functions */}
      <TbBtn onClick={onFilter} title="Create a filter">
        <Filter size={15} />
      </TbBtn>

      <DropdownWrapper
        trigger={
          <button className="flex items-center gap-0.5 px-1.5 py-1 text-sm hover:bg-[#E8EAED] rounded cursor-pointer" title="Functions">
            <span className="font-medium">Σ</span>
            <ChevronDown size={10} />
          </button>
        }
      >
        {['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'].map(fn => (
          <button
            key={fn}
            className="block w-full text-left px-4 py-1.5 text-sm hover:bg-[#F1F3F4] text-[#202124] font-mono"
            onClick={() => onInsertFunction && onInsertFunction(fn)}
          >
            {fn}
          </button>
        ))}
      </DropdownWrapper>
    </div>
  );
};
