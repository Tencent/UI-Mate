
    import React, { useState } from 'react';
    import { useStore } from '../context/StoreContext';
    import { FileText, Image, MoreHorizontal, Download } from 'lucide-react';

    export default function Files() {
      const { state } = useStore();
      const [selectedFile, setSelectedFile] = useState(null);

      return (
        <div className="flex flex-col h-full bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-xl">Files</h2>
          </div>
          <div className="p-4">
             <div className="mb-4 flex gap-4 text-sm font-semibold text-gray-600 border-b border-gray-200 pb-2">
                <span className="text-teams-purple border-b-2 border-teams-purple pb-2 -mb-2.5">Recent</span>
                <span className="cursor-pointer hover:text-gray-900">Xicrosoft Teams</span>
                <span className="cursor-pointer hover:text-gray-900">Downloads</span>
             </div>

             <div className="w-full">
                <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
                   <div className="col-span-6">Name</div>
                   <div className="col-span-3">Modified</div>
                   <div className="col-span-2">Type</div>
                   <div className="col-span-1"></div>
                </div>
                {state.files.map(file => (
                   <div key={file.id} className="grid grid-cols-12 items-center py-3 border-b border-gray-100 hover:bg-gray-50 text-sm group">
                      <div className="col-span-6 flex items-center gap-3">
                         {file.type === 'pdf' ? <FileText className="text-red-500" size={20} /> : <Image className="text-blue-500" size={20} />}
                         <span className="font-medium text-gray-700">{file.name}</span>
                      </div>
                      <div className="col-span-3 text-gray-500">{file.date}</div>
                      <div className="col-span-2 text-gray-500 uppercase">{file.type}</div>
                      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100">
                         <a href={file.url} download={file.name} className="p-1 hover:bg-gray-200 rounded inline-flex"><Download size={16} /></a>
                         <button onClick={() => setSelectedFile(file)} className="p-1 hover:bg-gray-200 rounded" title="File details"><MoreHorizontal size={16} /></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {selectedFile && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">File details</h3>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:bg-gray-100 rounded px-2 py-1">x</button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Name:</span> {selectedFile.name}</p>
                  <p><span className="font-medium">Type:</span> {selectedFile.type.toUpperCase()}</p>
                  <p><span className="font-medium">Size:</span> {selectedFile.size}</p>
                  <p><span className="font-medium">Modified:</span> {selectedFile.date}</p>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <a href={selectedFile.url} download={selectedFile.name} className="px-3 py-2 bg-teams-purple text-white rounded hover:bg-teams-dark inline-flex items-center gap-2">
                    <Download size={16} /> Download
                  </a>
                  <button onClick={() => setSelectedFile(null)} className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  
