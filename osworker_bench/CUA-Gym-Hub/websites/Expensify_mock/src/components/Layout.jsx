import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ConciergeBubble from './ConciergeBubble';
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay';
import NewExpenseModal from './NewExpenseModal';
import NewReportModal from './NewReportModal';

export default function Layout() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showNewReport, setShowNewReport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastKeyRef = useRef(null);
  const lastKeyTimeRef = useRef(0);

  const handleKeyDown = useCallback((e) => {
    // Don't trigger shortcuts when typing in inputs
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
      return;
    }

    const key = e.key;
    const now = Date.now();

    // Escape closes any overlay
    if (key === 'Escape') {
      if (showShortcuts) setShowShortcuts(false);
      if (showNewExpense) setShowNewExpense(false);
      if (showNewReport) setShowNewReport(false);
      // Also dispatch a generic close event on the window for other modals
      window.dispatchEvent(new CustomEvent('xpensify-close-modal'));
      lastKeyRef.current = null;
      return;
    }

    // ? shows help overlay
    if (key === '?') {
      e.preventDefault();
      setShowShortcuts(prev => !prev);
      lastKeyRef.current = null;
      return;
    }

    // Two-key sequences: N then E, N then R
    if (key.toLowerCase() === 'n') {
      lastKeyRef.current = 'n';
      lastKeyTimeRef.current = now;
      return;
    }

    if (lastKeyRef.current === 'n' && (now - lastKeyTimeRef.current) < 1000) {
      if (key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowNewExpense(true);
        lastKeyRef.current = null;
        return;
      }
      if (key.toLowerCase() === 'r') {
        e.preventDefault();
        setShowNewReport(true);
        lastKeyRef.current = null;
        return;
      }
    }

    lastKeyRef.current = null;
  }, [showShortcuts, showNewExpense, showNewReport]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="page-container">
          <Outlet />
        </div>
        <Footer />
      </div>
      <ConciergeBubble />
      {showShortcuts && <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      {showNewExpense && <NewExpenseModal initialTab="expense" onClose={() => setShowNewExpense(false)} />}
      {showNewReport && <NewReportModal onClose={() => setShowNewReport(false)} />}
    </div>
  );
}
