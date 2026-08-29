
// File size limit in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Validate file type and size
export const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return { valid: false, errors };
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds 5MB limit. Current size: ${formatFileSize(file.size)}`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: images, PDFs, and common documents`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Convert file to Base64
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result;
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

// Process file for attachment
export const processFileForAttachment = async (file) => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.errors.join('. '));
  }

  // Convert to Base64
  const base64 = await convertToBase64(file);

  // Determine type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  // Create attachment object
  const attachment = {
    type: isImage ? 'image' : 'file',
    name: file.name,
    size: formatFileSize(file.size),
    url: base64,
    mimeType: file.type
  };

  // Generate thumbnail for images
  if (isImage) {
    attachment.thumbnail = base64; // Use full image as thumbnail for now
  }

  return attachment;
};

// Process multiple files
export const processMultipleFiles = async (files) => {
  const fileArray = Array.from(files);
  const results = [];
  const errors = [];

  for (const file of fileArray) {
    try {
      const attachment = await processFileForAttachment(file);
      results.push(attachment);
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }

  return {
    attachments: results,
    errors
  };
};

// Download file from Base64
export const downloadBase64File = (base64String, filename) => {
  const link = document.createElement('a');
  link.href = base64String;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Get file extension
export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Get file icon based on type
export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);

  const iconMap = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    txt: '📃',
    csv: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️'
  };

  return iconMap[ext] || '📎';
};

// Check localStorage capacity
export const checkStorageCapacity = () => {
  try {
    const total = 5 * 1024 * 1024; // Approximate 5MB localStorage limit
    let used = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    const usedMB = used / (1024 * 1024);
    const totalMB = total / (1024 * 1024);
    const percentage = (used / total) * 100;

    return {
      used: usedMB.toFixed(2),
      total: totalMB.toFixed(2),
      percentage: percentage.toFixed(1),
      warning: percentage > 80
    };
  } catch (error) {
    return {
      used: 0,
      total: 5,
      percentage: 0,
      warning: false,
      error: error.message
    };
  }
};
