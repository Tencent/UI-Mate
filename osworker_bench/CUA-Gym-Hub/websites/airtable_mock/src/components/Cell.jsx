import React, { useState, useEffect, useRef } from 'react';
import { FIELD_TYPES, cn } from '../lib/utils';
import { Check, ChevronDown, Star, Calendar as CalendarIcon, Link as LinkIcon, Paperclip, ExternalLink, Mail, Phone, Play, Barcode as BarcodeIcon, User } from 'lucide-react';

// Mock users for the User field picker
const MOCK_USERS = [
  { id: 'u1', name: 'Alice', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Bob', avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'u3', name: 'Charlie', avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'u4', name: 'Dave', avatar: 'https://picsum.photos/100/100?random=4' },
];

// Mock records for Linked Record picker
const MOCK_LINKED_RECORDS = [
  { id: 'lr1', name: 'Project Alpha' },
  { id: 'lr2', name: 'Project Beta' },
  { id: 'lr3', name: 'Campaign 2024' },
];

const Cell = ({ field, value, onChange, isGrid = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    // Small delay to allow click events on dropdown items to fire
    setTimeout(() => setIsEditing(false), 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  // Common wrapper for grid cells
  const CellWrapper = ({ children, className, onClick }) => (
    <div 
      className={cn(
        "w-full h-full min-h-[32px] flex items-center px-2 text-sm truncate cursor-pointer hover:bg-gray-50",
        isGrid ? "border-b border-r border-cell-border" : "p-2 border rounded mb-2",
        className
      )}
      onClick={onClick || (() => !isEditing && setIsEditing(true))}
    >
      {children}
    </div>
  );

  switch (field.type) {
    case FIELD_TYPES.TEXT:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="text"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      return <CellWrapper>{value}</CellWrapper>;

    case FIELD_TYPES.EMAIL:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="email"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      return (
        <CellWrapper>
          {value && <Mail size={12} className="mr-2 text-gray-400" />}
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>{value}</a>
        </CellWrapper>
      );

    case FIELD_TYPES.URL:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="url"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      return (
        <CellWrapper>
          {value && <ExternalLink size={12} className="mr-2 text-gray-400" />}
          <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>{value}</a>
        </CellWrapper>
      );

    case FIELD_TYPES.PHONE:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="tel"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      return (
        <CellWrapper>
          {value && <Phone size={12} className="mr-2 text-gray-400" />}
          <a href={`tel:${value}`} className="text-blue-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>{value}</a>
        </CellWrapper>
      );

    case FIELD_TYPES.LONG_TEXT:
      if (isEditing) {
        return (
          <textarea
            ref={inputRef}
            className="w-full h-full min-h-[60px] p-1 outline-none border-2 border-primary rounded-sm bg-white z-10 absolute top-0 left-0 shadow-lg"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
          />
        );
      }
      return <CellWrapper><span className="truncate">{value}</span></CellWrapper>;

    case FIELD_TYPES.NUMBER:
    case FIELD_TYPES.CURRENCY:
    case FIELD_TYPES.PERCENT:
    case FIELD_TYPES.DURATION:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="number"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white text-right"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      return (
        <CellWrapper className="justify-end font-mono text-gray-700">
          {field.type === FIELD_TYPES.CURRENCY && '$'}
          {value}
          {field.type === FIELD_TYPES.PERCENT && '%'}
          {field.type === FIELD_TYPES.DURATION && value && `${value} min`}
        </CellWrapper>
      );

    case FIELD_TYPES.CHECKBOX:
      return (
        <div className={cn("flex items-center justify-center h-full", isGrid && "border-b border-r border-cell-border")}>
          <div 
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors",
              value ? "bg-green-500 border-green-600" : "bg-white border-gray-300 hover:bg-gray-50"
            )}
            onClick={() => onChange(!value)}
          >
            {value && <Check size={14} className="text-white" />}
          </div>
        </div>
      );

    case FIELD_TYPES.RATING:
      return (
        <CellWrapper className="text-yellow-400">
          <div className="flex">
            {[...Array(field.max || 5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < (value || 0) ? "currentColor" : "none"} 
                className={cn("mr-0.5 cursor-pointer", i < (value || 0) ? "text-yellow-400" : "text-gray-300")}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(i + 1);
                }}
              />
            ))}
          </div>
        </CellWrapper>
      );

    case FIELD_TYPES.SINGLE_SELECT:
      if (isEditing) {
        return (
          <select
            ref={inputRef}
            className="w-full h-full outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setIsEditing(false);
            }}
            onBlur={handleBlur}
            autoFocus
          >
            <option value="">Select an option</option>
            {field.options?.map(opt => (
              <option key={opt.id} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        );
      }
      const selectedOption = field.options?.find(o => o.name === value);
      return (
        <CellWrapper>
          {value && (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", selectedOption?.color || "bg-gray-100 text-gray-800")}>
              {value}
            </span>
          )}
          <ChevronDown size={12} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
        </CellWrapper>
      );

    case FIELD_TYPES.MULTIPLE_SELECT:
      return (
        <CellWrapper className="flex gap-1 overflow-hidden">
          {Array.isArray(value) && value.map((tag, i) => {
            const opt = field.options?.find(o => o.name === tag);
            return (
              <span key={i} className={cn("px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap", opt?.color || "bg-gray-100")}>
                {tag}
              </span>
            );
          })}
        </CellWrapper>
      );

    case FIELD_TYPES.ATTACHMENT:
      return (
        <CellWrapper className="flex gap-1">
          {Array.isArray(value) && value.map((file, i) => (
            <div key={i} className="h-6 w-8 bg-gray-200 rounded overflow-hidden relative group/img border border-gray-300">
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {(!value || value.length === 0) && <Paperclip size={14} className="text-gray-300" />}
        </CellWrapper>
      );

    case FIELD_TYPES.DATE:
    case FIELD_TYPES.CREATED_TIME:
    case FIELD_TYPES.LAST_MODIFIED:
      if (isEditing && field.type === FIELD_TYPES.DATE) {
        return (
          <input
            ref={inputRef}
            type="date"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
          />
        );
      }
      return (
        <CellWrapper className={cn(field.type !== FIELD_TYPES.DATE && "text-gray-500 italic bg-gray-50/50")}>
          {value ? new Date(value).toLocaleDateString() : ''}
          {field.type === FIELD_TYPES.DATE && <CalendarIcon size={12} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />}
        </CellWrapper>
      );

    case FIELD_TYPES.USER:
      if (isEditing) {
        return (
          <div className="absolute z-50 bg-white shadow-lg border rounded-md w-48 p-1">
             {MOCK_USERS.map(user => (
               <div 
                 key={user.id} 
                 className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer rounded"
                 onClick={() => {
                   onChange(user);
                   setIsEditing(false);
                 }}
               >
                 <img src={user.avatar} className="w-5 h-5 rounded-full" />
                 <span>{user.name}</span>
               </div>
             ))}
          </div>
        );
      }
      return (
        <CellWrapper>
          {value ? (
            <div className="flex items-center gap-2">
              <img src={value.avatar} className="w-5 h-5 rounded-full" />
              <span>{value.name}</span>
            </div>
          ) : (
            <User size={14} className="text-gray-300" />
          )}
          <ChevronDown size={12} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
        </CellWrapper>
      );
      
    case FIELD_TYPES.LINKED_RECORD:
      if (isEditing) {
        return (
          <div className="absolute z-50 bg-white shadow-lg border rounded-md w-48 p-1">
             <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase">Select Record</div>
             {MOCK_LINKED_RECORDS.map(rec => (
               <div 
                 key={rec.id} 
                 className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer rounded"
                 onClick={() => {
                   onChange(rec);
                   setIsEditing(false);
                 }}
               >
                 <LinkIcon size={12} />
                 <span>{rec.name}</span>
               </div>
             ))}
          </div>
        );
      }
      return (
        <CellWrapper>
          {value ? (
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
              <LinkIcon size={10} />
              <span>{value.name}</span>
            </div>
          ) : (
            <span className="text-gray-300 italic">Add link</span>
          )}
          <ChevronDown size={12} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
        </CellWrapper>
      );

    case FIELD_TYPES.BUTTON:
      return (
        <CellWrapper className="justify-center flex-col gap-1">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded shadow-sm flex items-center gap-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ ranAt: new Date().toISOString(), label: field.actionLabel || 'Run' });
            }}
          >
            <Play size={10} fill="currentColor" /> {field.actionLabel || 'Run'}
          </button>
          {value?.ranAt && (
            <span className="text-[10px] text-gray-500">Ran {new Date(value.ranAt).toLocaleTimeString()}</span>
          )}
        </CellWrapper>
      );

    case FIELD_TYPES.BARCODE:
      return (
        <CellWrapper>
          {value && (
            <div className="flex items-center gap-2">
              <BarcodeIcon size={16} className="text-gray-400" />
              <span className="font-mono text-xs tracking-widest">{value}</span>
            </div>
          )}
        </CellWrapper>
      );

    case FIELD_TYPES.FORMULA:
      return (
        <CellWrapper className="bg-gray-50/50 italic text-gray-600">
          ƒ {value}
        </CellWrapper>
      );

    default:
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="text"
            className="w-full h-full px-2 outline-none border-2 border-primary rounded-sm bg-white"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
          />
        );
      }
      return <CellWrapper>{value && String(value)}</CellWrapper>;
  }
};

export default Cell;
