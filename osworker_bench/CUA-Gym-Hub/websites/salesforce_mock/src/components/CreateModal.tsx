import { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
}

interface CreateModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  onSubmit: (data: Partial<T>) => void;
  initialData?: Partial<T>;
}

export const CreateModal = <T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  initialData
}: CreateModalProps<T>) => {
  const normalizedInitialData = initialData ?? {};
  const initialDataKey = JSON.stringify(normalizedInitialData);
  const [formData, setFormData] = useState<Record<string, any>>(normalizedInitialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(normalizedInitialData);
    setErrors({});
    setSubmitError(null);
  }, [isOpen, initialDataKey]);

  const validateField = (field: FieldConfig, value: any): string | null => {
    if (field.required && (!value || String(value).trim() === '')) {
      return `${field.label} is required`;
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
    }
    
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData as Partial<T>);
      onClose();
      setFormData(normalizedInitialData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {submitError && (
          <div style={{
            padding: '12px',
            background: 'var(--danger-bg, #fde8e8)',
            border: '1px solid var(--danger, var(--error))',
            borderRadius: '4px',
            color: 'var(--error)',
            fontSize: '14px'
          }}>
            {submitError}
          </div>
        )}
        {fields.map(field => (
          <div key={field.name} className="form-group">
            <label className="form-label">
              {field.label}
              {field.required && <span style={{ color: 'var(--error)' }}> *</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                className={`form-select ${errors[field.name] ? 'error' : ''}`}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                aria-invalid={errors[field.name] ? 'true' : 'false'}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                className={`form-textarea ${errors[field.name] ? 'error' : ''}`}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                rows={4}
                aria-invalid={errors[field.name] ? 'true' : 'false'}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              />
            ) : (
              <input
                type={field.type}
                className={`form-input ${errors[field.name] ? 'error' : ''}`}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                aria-invalid={errors[field.name] ? 'true' : 'false'}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              />
            )}
            
            {errors[field.name] && (
              <div id={`${field.name}-error`} className="form-error" style={{ 
                color: 'var(--error)', 
                fontSize: '12px', 
                marginTop: '4px' 
              }}>
                {errors[field.name]}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={submitting}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }} />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateModal;
