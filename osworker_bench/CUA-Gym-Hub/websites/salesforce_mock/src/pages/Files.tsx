
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, Download, Share2, Trash2, FileText, FileSpreadsheet, Presentation, File as FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';

interface FilesProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Files: React.FC<FilesProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [shareLink, setShareLink] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('file', file);
    });

    try {
      const params = new URLSearchParams(window.location.search);
      const sid = params.get('sid');
      const uploadUrl = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload';
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });
      const result = await response.json();

      if (result.success && result.files) {
        const newFiles = result.files.map((f: any, i: number) => ({
          fileId: `file-${Date.now()}-${i}`,
          name: f.original_name,
          type: f.content_type,
          size: f.size,
          url: f.url,
          ownerId: state.user.userId,
          uploadDate: new Date().toISOString()
        }));

        updateState({ files: [...state.files, ...newFiles] });
        onShowToast(`${newFiles.length} file(s) uploaded successfully`, 'success');
      } else {
        onShowToast('Upload failed: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      onShowToast('Upload failed: network error', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (file: any) => {
    window.open(file.url, '_blank');
    onShowToast(`Downloading ${file.name}`, 'info');
  };

  const handleShare = (file: any) => {
    const link = file.url || `${window.location.origin}/files/${file.fileId}`;
    setShareLink(link);
    setSelectedFile(file.name);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    onShowToast('Link copied to clipboard', 'success');
  };

  const handleDeleteClick = (fileId: string, _fileName: string) => {
    setSelectedFile(fileId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedFiles = state.files.filter(f => f.fileId !== selectedFile);
    updateState({ files: updatedFiles });
    onShowToast('File deleted successfully', 'success');
    setShowDeleteModal(false);
    setSelectedFile('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Files</h1>
        <button className="btn btn-primary" onClick={handleUploadClick}>
          <Upload size={18} />
          Upload Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {state.files.map(file => {
            const owner = state.users.find(u => u.userId === file.ownerId);
            return (
              <div
                key={file.fileId}
                className="card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '12px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg)',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    border: '1px solid var(--border)'
                  }}>
                    {file.type.includes('pdf') ? <FileText size={48} color="#e74c3c" /> :
                     file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv') ? <FileSpreadsheet size={48} color="#27ae60" /> :
                     file.type.includes('presentation') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt') ? <Presentation size={48} color="#e67e22" /> :
                     file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc') ? <FileText size={48} color="#2980b9" /> :
                     <FileIcon size={48} color="#7f8c8d" />}
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {formatFileSize(file.size)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {owner?.firstName} {owner?.lastName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {format(new Date(file.uploadDate), 'MMM d, yyyy')}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                    onClick={() => handleShare(file)}
                    title="Share"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                    onClick={() => handleDeleteClick(file.fileId, file.name)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share File">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Share this link with others to give them access to <strong>{selectedFile}</strong></p>
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            background: 'var(--bg)',
            borderRadius: '4px',
            border: '1px solid var(--border)'
          }}>
            <input
              type="text"
              value={shareLink}
              readOnly
              className="form-input"
              style={{ flex: 1, background: 'transparent', border: 'none' }}
            />
            <button className="btn btn-primary" onClick={handleCopyLink}>
              Copy Link
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete File">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this file? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{state.files.find(f => f.fileId === selectedFile)?.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete File
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
