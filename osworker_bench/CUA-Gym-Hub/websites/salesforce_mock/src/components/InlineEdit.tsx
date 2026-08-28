
import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface InlineEditProps {
  value: string | number;
  fieldName: string;
  fieldType: 'text' | 'select' | 'textarea' | 'number' | 'date' | 'email';
  options?: string[];
  onSave: (value: string | number) => void;
  displayValue?: string;
  formatValue?: (val: string | number) => string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  fieldName,
  fieldType,
  options,
  onSave,
  displayValue,
  formatValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(value ?? ''));
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(String(value ?? ''));
    setIsEditing(true);
  };

  const handleSave = () => {
    const newValue = fieldType === 'number' ? parseFloat(editValue) || 0 : editValue;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value ?? ''));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fieldType !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayed = displayValue ?? (formatValue ? formatValue(value) : String(value ?? '--'));

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        {fieldType === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className="form-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            style={{ fontSize: '14px', padding: '6px 8px', flex: 1, resize: 'vertical' }}
          />
        ) : fieldType === 'select' && options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className="form-select"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ fontSize: '14px', padding: '6px 8px', flex: 1 }}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : fieldType === 'email' ? 'email' : 'text'}
            className="form-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ fontSize: '14px', padding: '6px 8px', flex: 1 }}
          />
        )}
        <button
          onClick={handleSave}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title={`Save ${fieldName}`}
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          style={{
            background: 'var(--border)',
            color: 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        padding: '2px 0',
        borderRadius: '4px',
        minHeight: '28px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
      title={`Click to edit ${fieldName}`}
    >
      <span style={{ flex: 1 }}>{displayed || '--'}</span>
      <Pencil
        size={13}
        style={{
          color: 'var(--text-secondary)',
          opacity: isHovered ? 0.8 : 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
        }}
      />
    </div>
  );
};
