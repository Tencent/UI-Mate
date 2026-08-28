import React, { useState } from 'react';
import { Search, ChevronRight, BookOpen, Video, MessageCircle, FileText, Users, Clock, BarChart2, Settings } from 'lucide-react';

const CATEGORIES = [
  {
    icon: <Users size={20} color="#73C41D" />,
    title: 'People & Employees',
    articles: ['Adding a new employee', 'Editing employee information', 'Terminating an employee', 'Managing org chart'],
  },
  {
    icon: <Clock size={20} color="#73C41D" />,
    title: 'Time Off',
    articles: ['Requesting time off', 'Approving time off requests', 'Setting up time off policies', 'Viewing time off balances'],
  },
  {
    icon: <BarChart2 size={20} color="#73C41D" />,
    title: 'Reports',
    articles: ['Running a headcount report', 'Creating custom reports', 'Exporting report data', 'Scheduling automated reports'],
  },
  {
    icon: <FileText size={20} color="#73C41D" />,
    title: 'Files & Documents',
    articles: ['Uploading company files', 'Sharing files with employees', 'Managing file permissions', 'Organizing document folders'],
  },
  {
    icon: <Settings size={20} color="#73C41D" />,
    title: 'Settings & Admin',
    articles: ['Setting up your company profile', 'Managing user roles', 'Configuring notifications', 'Integrations & API access'],
  },
  {
    icon: <BookOpen size={20} color="#73C41D" />,
    title: 'Getting Started',
    articles: ['XambooHR overview', 'Importing employee data', 'Setting up departments', 'Onboarding checklist'],
  },
];

const POPULAR = [
  'How do I reset an employee password?',
  'How do I add a new hire?',
  'Where can I find payroll reports?',
  'How do I approve a time off request?',
  'Can I customize the employee fields?',
  'How do I set up PTO accrual?',
];

export default function HelpPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = query.trim().length >= 2
    ? CATEGORIES.map(cat => ({
        ...cat,
        articles: cat.articles.filter(a => a.toLowerCase().includes(query.toLowerCase())),
      })).filter(cat => cat.articles.length > 0)
    : CATEGORIES;

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Hero */}
      <div style={{ background: '#73C41D', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>How can we help?</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, margin: '0 0 24px' }}>
          Search our help center or browse topics below
        </p>
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <Search size={16} color="#999" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search help articles..."
            style={{
              width: '100%', padding: '11px 16px 11px 40px', fontSize: 14,
              border: 'none', borderRadius: 6, outline: 'none',
              boxSizing: 'border-box', color: '#333',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Popular questions */}
        {!query && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>Popular Questions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {POPULAR.map(q => (
                <button
                  key={q}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'white', border: '1px solid #E0E0E0', borderRadius: 6,
                    padding: '12px 16px', fontSize: 13, color: '#333', cursor: 'pointer',
                    textAlign: 'left', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#73C41D'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E0E0E0'}
                >
                  <span>{q}</span>
                  <ChevronRight size={14} color="#999" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          {query ? `Results for "${query}"` : 'Browse by Topic'}
        </h2>
        {filteredCategories.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 8, padding: '40px', textAlign: 'center', color: '#999', border: '1px solid #E0E0E0' }}>
            No articles found for "{query}"
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {filteredCategories.map(cat => (
              <div key={cat.title} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 8, padding: '20px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  {cat.icon}
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>{cat.title}</span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {cat.articles.map(article => (
                    <li key={article}>
                      <button
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          width: '100%', padding: '7px 0', fontSize: 13, color: '#555',
                          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          borderBottom: '1px solid #F5F5F5',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#73C41D'}
                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                      >
                        <ChevronRight size={12} color="#CCC" style={{ flexShrink: 0 }} />
                        {article}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Contact support */}
        <div style={{ marginTop: 36, background: 'white', border: '1px solid #E0E0E0', borderRadius: 8, padding: '24px', display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 6px' }}>Still need help?</h3>
            <p style={{ fontSize: 13, color: '#777', margin: 0 }}>Our support team is available Mon–Fri, 6am–6pm MT.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, fontWeight: 500, border: '1px solid #E0E0E0', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#333' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <Video size={14} /> Watch a demo
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 6, background: '#73C41D', cursor: 'pointer', color: 'white' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5fa818'}
              onMouseLeave={e => e.currentTarget.style.background = '#73C41D'}
            >
              <MessageCircle size={14} /> Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
