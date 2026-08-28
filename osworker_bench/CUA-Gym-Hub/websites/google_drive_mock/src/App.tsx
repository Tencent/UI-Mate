import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { FileSystemProvider, useFileSystem } from './context/FileSystemContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Drive } from './pages/Drive';
import { Starred } from './pages/Starred';
import { Trash } from './pages/Trash';
import { Recent } from './pages/Recent';
import { Search } from './pages/Search';
import { Go } from './pages/Go';
import { CreateModal } from './components/CreateModal';
import { UploadProgress } from './components/UploadProgress';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }: { to: string }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const Layout = () => {
  const location = useLocation();
  const isGoRoute = location.pathname === '/go';
  const { dispatch, uploadFile } = useFileSystem();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder');

  // We need to know the current folder ID for creating items
  const pathParts = location.pathname.split('/');
  const currentFolderId = pathParts[1] === 'folder' ? pathParts[2] : null;

  const handleCreate = (name: string, type: 'folder' | 'file') => {
    if (type === 'folder') {
      dispatch({
        type: 'CREATE_FOLDER',
        payload: { name, parentId: currentFolderId }
      });
    } else {
      // Create a mock file object to pass to uploadFile
      const mockFile = new File([""], name.endsWith('.txt') ? name : `${name}.txt`, { type: "text/plain" });
      uploadFile(mockFile, currentFolderId);
    }
  };

  if (isGoRoute) {
    return <Go />;
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateClick={(type) => {
          setCreateType(type);
          setIsCreateModalOpen(true);
        }} />
        <main className="flex-1 bg-white rounded-tl-2xl shadow-sm border-t border-l border-border mt-2 ml-0 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Drive />} />
            <Route path="/folder/:folderId" element={<Drive />} />
            <Route path="/starred" element={<Starred />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        type={createType}
      />
      <UploadProgress />
    </div>
  );
};

function App() {
  return (
    <FileSystemProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ToastProvider>
    </FileSystemProvider>
  );
}

export default App;
