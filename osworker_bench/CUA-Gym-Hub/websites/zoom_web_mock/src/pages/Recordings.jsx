import React, { useEffect, useState } from 'react';
import { Play, Download, Trash2, Share2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';

export default function Recordings() {
  const { recordings, deleteRecording, updateRecording } = useStore();
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [shareRecording, setShareRecording] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setSelectedRecording(null);
      setShareRecording(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const downloadRecording = (recording) => {
    const content = [
      recording.title,
      `Meeting ID: ${recording.meetingId}`,
      `Created: ${recording.created}`,
      '',
      recording.transcript || 'No transcript available.'
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recording.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Downloaded ${recording.title}`);
  };

  const shareLocalRecording = (event) => {
    event.preventDefault();
    if (!shareEmail.trim()) return;
    updateRecording(shareRecording.recordingId, {
      sharedWith: [...(shareRecording.sharedWith || []), shareEmail.trim()]
    });
    setNotice(`Shared ${shareRecording.title} with ${shareEmail}`);
    setShareEmail('');
    setShareRecording(null);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cloud Recordings</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {recordings.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No recordings available
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recordings.map(rec => (
                <tr key={rec.recordingId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{rec.title}</div>
                    <div className="text-xs text-gray-500">ID: {rec.meetingId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(rec.created), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rec.size}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => setSelectedRecording(rec)} className="p-1.5 text-gray-500 hover:text-xoom-blue hover:bg-blue-50 rounded" title="Play">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => downloadRecording(rec)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShareRecording(rec)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Share">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteRecording(rec.recordingId)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRecording && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedRecording.title}</h3>
              <button onClick={() => setSelectedRecording(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white mb-4">
                <Play className="w-12 h-12" />
              </div>
              <div className="text-sm text-gray-600 mb-3">Duration: {selectedRecording.duration} | Size: {selectedRecording.size}</div>
              <pre className="bg-gray-50 rounded-lg p-3 text-xs whitespace-pre-wrap">{selectedRecording.transcript || 'No transcript available.'}</pre>
            </div>
          </div>
        </div>
      )}

      {shareRecording && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Share Recording</h3>
              <button onClick={() => setShareRecording(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={shareLocalRecording} className="p-6 space-y-4">
              <div className="font-medium">{shareRecording.title}</div>
              <input
                type="email"
                required
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border rounded-lg"
                value={shareEmail}
                onChange={event => setShareEmail(event.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShareRecording(null)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xoom-blue text-white rounded-lg">Share Locally</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm">
          {notice}
          <button className="ml-3 text-gray-300" onClick={() => setNotice('')}>Close</button>
        </div>
      )}
    </div>
  );
}
