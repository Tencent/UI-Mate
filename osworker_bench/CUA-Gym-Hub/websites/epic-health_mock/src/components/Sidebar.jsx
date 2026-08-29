import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, Search, Calendar, MessageSquare, HelpCircle, Mail, Stethoscope, FlaskConical, Pill, Heart, Shield, ClipboardList, Users, FileText, CreditCard } from 'lucide-react'
import './Sidebar.css'

const MENU_ITEMS = [
  {
    category: 'Find Care',
    items: [
      { label: 'Schedule an Appointment', icon: Calendar, path: '/schedule' },
      { label: 'E-Visit', icon: Stethoscope, path: '/schedule?type=evisit' },
      { label: 'View Care Team', icon: Users, path: '/care-team' },
    ]
  },
  {
    category: 'Communication',
    items: [
      { label: 'Messages', icon: MessageSquare, path: '/messages' },
      { label: 'Ask a Question', icon: HelpCircle, path: '/messages/compose' },
      { label: 'Letters', icon: Mail, path: '/letters' },

    ]
  },
  {
    category: 'My Record',
    items: [
      { label: 'Visits', icon: Calendar, path: '/visits' },
      { label: 'Test Results', icon: FlaskConical, path: '/test-results' },
      { label: 'Medications', icon: Pill, path: '/medications' },
      { label: 'Health Summary', icon: Heart, path: '/health-summary' },
      { label: 'Preventive Care', icon: Shield, path: '/preventive-care' },
      { label: 'Medical and Family History', icon: ClipboardList, path: '/medical-history' },
    ]
  },
  {
    category: 'Billing',
    items: [
      { label: 'Billing Summary', icon: CreditCard, path: '/billing' },
      { label: 'Insurance', icon: FileText, path: '/insurance' },
    ]
  }
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const isOpen = state.ui?.sideMenuOpen || false

  const handleClose = () => {
    dispatch({ type: 'CLOSE_SIDEBAR' })
    setSearchQuery('')
  }

  const handleItemClick = (path) => {
    navigate(path)
    handleClose()
  }

  const filterItems = (items) => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(item => item.label.toLowerCase().includes(q))
  }

  const filteredCategories = MENU_ITEMS.map(cat => ({
    ...cat,
    items: filterItems(cat.items)
  })).filter(cat => cat.items.length > 0)

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={handleClose} />}
      <div className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Your Menu</h2>
          <button className="sidebar-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-search-wrap">
          <Search size={16} className="sidebar-search-icon" />
          <input
            type="text"
            className="sidebar-search"
            placeholder="Search the menu"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sidebar-content">
          {filteredCategories.map(cat => (
            <div key={cat.category} className="sidebar-category">
              <div className="sidebar-category-title">{cat.category}</div>
              {cat.items.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className="sidebar-item"
                    onClick={() => handleItemClick(item.path)}
                  >
                    <Icon size={16} className="sidebar-item-icon" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="sidebar-empty">
              No menu items match "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  )
}
