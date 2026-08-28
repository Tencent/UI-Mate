import React from 'react'
import { useApp } from '../context/AppContext'
import ChartWidget from './ChartWidget'

function ThumbnailPreview({ workbook }) {
  const sheet = workbook.sheets?.[0]
  if (!sheet?.chartConfig) {
    return (
      <div className="wb-card-thumb-placeholder">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="16" width="6" height="12" fill="#1F77B4" opacity="0.6"/>
          <rect x="13" y="10" width="6" height="18" fill="#FF7F0E" opacity="0.6"/>
          <rect x="22" y="6" width="6" height="22" fill="#2CA02C" opacity="0.6"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="wb-card-thumb-chart">
      <ChartWidget config={sheet.chartConfig} height={130} />
    </div>
  )
}

export function WorkbookCardGrid({ workbook }) {
  const { openWorkbook, toggleFavorite } = useApp()

  return (
    <div className="wb-card" onClick={() => openWorkbook(workbook.id)}>
      <div className="wb-card-thumb">
        <ThumbnailPreview workbook={workbook} />
        <button
          className={`wb-card-fav ${workbook.isFavorite ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleFavorite(workbook.id) }}
          title={workbook.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {workbook.isFavorite ? (
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="#FFB400" stroke="#FFB400" strokeWidth="1"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="none" stroke="#9CA3AF" strokeWidth="1.2"/></svg>
          )}
        </button>
      </div>
      <div className="wb-card-body">
        <div className="wb-card-name" title={workbook.name}>{workbook.name}</div>
        <div className="wb-card-meta">
          <span>{workbook.project}</span>
          <span className="wb-card-dot">.</span>
          <span>{workbook.owner}</span>
        </div>
        <div className="wb-card-stats">
          <span title="Views">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="#9CA3AF" strokeWidth="1"/><circle cx="6" cy="6" r="1.5" stroke="#9CA3AF" strokeWidth="1"/></svg>
            {workbook.viewCount}
          </span>
          <span title="Favorites">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.4.6 3.5L6 8.8l-3 1.6.6-3.5L1 4.5 4.5 4z" fill="none" stroke="#9CA3AF" strokeWidth="0.8"/></svg>
            {workbook.favoriteCount}
          </span>
          <span className="wb-card-updated">{formatRelativeTime(workbook.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export function WorkbookCardList({ workbook }) {
  const { openWorkbook, toggleFavorite } = useApp()

  return (
    <div className="wb-list-row" onClick={() => openWorkbook(workbook.id)}>
      <button
        className={`wb-list-fav ${workbook.isFavorite ? 'active' : ''}`}
        onClick={e => { e.stopPropagation(); toggleFavorite(workbook.id) }}
      >
        {workbook.isFavorite ? (
          <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="#FFB400" stroke="#FFB400" strokeWidth="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="none" stroke="#9CA3AF" strokeWidth="1.2"/></svg>
        )}
      </button>
      <div className="wb-list-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="2" stroke="#1F77B4" strokeWidth="1.3"/>
          <rect x="5" y="10" width="3" height="6" fill="#1F77B4"/>
          <rect x="9" y="7" width="3" height="9" fill="#FF7F0E"/>
          <rect x="13" y="4" width="3" height="12" fill="#2CA02C"/>
        </svg>
      </div>
      <div className="wb-list-info">
        <div className="wb-list-name">{workbook.name}</div>
        <div className="wb-list-desc">{workbook.description}</div>
      </div>
      <div className="wb-list-project">{workbook.project}</div>
      <div className="wb-list-owner">{workbook.owner}</div>
      <div className="wb-list-views">{workbook.viewCount}</div>
      <div className="wb-list-updated">{formatRelativeTime(workbook.updatedAt)}</div>
    </div>
  )
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date('2026-04-10T12:00:00Z')
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
