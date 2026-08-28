import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Heart, Search, Trash2, Plus, Edit, Check, X, User, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Account.css'

function SuccessToast({ msg }) {
  return msg ? (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--color-navy)', color: 'white',
      padding: '12px 20px', borderRadius: '8px',
      display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: 'var(--shadow-3)', zIndex: 3000,
      fontSize: '14px'
    }}>
      <Check size={16} /> {msg}
    </div>
  ) : null
}

export default function Account() {
  const { state, updateUser, toggleSavedProperty, removeRecentSearch, addTraveler, removeTraveler, updateTraveler } = useApp()
  const navigate = useNavigate()

  const { user, hotels } = state
  const [toast, setToast] = useState(null)
  const [editProfile, setEditProfile] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  })

  const [showAddTraveler, setShowAddTraveler] = useState(false)
  const [editTravelerId, setEditTravelerId] = useState(null)
  const [newTraveler, setNewTraveler] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: '', passportNumber: '' })
  const [editTravelerForm, setEditTravelerForm] = useState({})

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProfile = () => {
    updateUser(profileForm)
    setEditProfile(false)
    showToast('Profile saved!')
  }

  const savedHotels = hotels.filter(h => (user.savedProperties || []).includes(h.id))

  const handleAddTraveler = () => {
    if (!newTraveler.firstName || !newTraveler.lastName) return
    addTraveler({ ...newTraveler, id: `traveler_${Date.now()}`, knownTravelerNumber: '', frequentFlyerNumbers: {} })
    setNewTraveler({ firstName: '', lastName: '', dateOfBirth: '', gender: '', passportNumber: '' })
    setShowAddTraveler(false)
    showToast('Traveler added!')
  }

  const handleStartEditTraveler = (traveler) => {
    setEditTravelerId(traveler.id)
    setEditTravelerForm({
      firstName: traveler.firstName,
      lastName: traveler.lastName,
      dateOfBirth: traveler.dateOfBirth || '',
      gender: traveler.gender || '',
      passportNumber: traveler.passportNumber || ''
    })
  }

  const handleSaveEditTraveler = () => {
    if (!editTravelerForm.firstName || !editTravelerForm.lastName) return
    updateTraveler(editTravelerId, editTravelerForm)
    setEditTravelerId(null)
    setEditTravelerForm({})
    showToast('Traveler updated!')
  }

  const tierProgress = {
    Blue: { current: 0, next: 'Silver', needed: 500, percent: 0 },
    Silver: { current: 500, next: 'Gold', needed: 2000, percent: 50 },
    Gold: { current: 2000, next: 'Platinum', needed: 5000, percent: 65 },
    Platinum: { current: 5000, next: null, needed: 5000, percent: 100 }
  }[user.oneKeyTier] || { current: 0, next: 'Silver', needed: 500, percent: 0 }

  return (
    <div className="page-content account-page">
      <div className="container" style={{ maxWidth: '800px', padding: '24px' }}>
        <h1 style={{ color: 'var(--color-navy)', marginBottom: '24px' }}>Account settings</h1>

        {/* Profile Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Personal information</h2>
            {!editProfile && (
              <button className="btn-ghost" onClick={() => setEditProfile(true)}>
                <Edit size={14} /> Edit
              </button>
            )}
          </div>

          {editProfile ? (
            <div>
              <div className="form-grid-2">
                {['firstName', 'lastName', 'email', 'phone'].map(field => (
                  <div key={field}>
                    <label className="form-label">{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'email' ? 'Email' : 'Phone'}</label>
                    <input
                      className="form-input"
                      value={profileForm[field]}
                      onChange={e => setProfileForm(prev => ({ ...prev, [field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-primary" onClick={handleSaveProfile}>Save changes</button>
                <button className="btn-secondary" onClick={() => setEditProfile(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-field"><span>First name</span><strong>{user.firstName}</strong></div>
              <div className="profile-field"><span>Last name</span><strong>{user.lastName}</strong></div>
              <div className="profile-field"><span>Email</span><strong>{user.email}</strong></div>
              <div className="profile-field"><span>Phone</span><strong>{user.phone}</strong></div>
            </div>
          )}
        </div>

        {/* One Key Section */}
        <div className="account-section">
          <h2>One Key Rewards</h2>
          <div className="one-key-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--color-golden-yellow)', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)' }}>
                &#9733; {user.oneKeyTier}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>
                ${user.oneKeyCash?.toFixed(2)} One Key Cash
              </div>
            </div>
            {tierProgress.next && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>{user.oneKeyTier}</span>
                  <span>Next: {tierProgress.next}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--color-border-gray)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${tierProgress.percent}%`, height: '100%', background: 'var(--color-golden-yellow)', borderRadius: '4px' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Travelers */}
        <div className="account-section">
          <div className="section-header">
            <h2>Travelers</h2>
            <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => { setShowAddTraveler(true); setEditTravelerId(null) }}>
              <Plus size={14} /> Add traveler
            </button>
          </div>

          <div className="travelers-list">
            {user.travelers.map(traveler => (
              <div key={traveler.id} className="traveler-card">
                {editTravelerId === traveler.id ? (
                  /* Edit traveler form inline */
                  <div style={{ width: '100%' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--color-navy)' }}>Edit traveler</h4>
                    <div className="form-grid-2">
                      <div>
                        <label className="form-label">First name</label>
                        <input className="form-input" value={editTravelerForm.firstName} onChange={e => setEditTravelerForm(p => ({ ...p, firstName: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">Last name</label>
                        <input className="form-input" value={editTravelerForm.lastName} onChange={e => setEditTravelerForm(p => ({ ...p, lastName: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">Date of birth</label>
                        <input type="date" className="form-input" value={editTravelerForm.dateOfBirth} onChange={e => setEditTravelerForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">Gender</label>
                        <select className="form-select" value={editTravelerForm.gender} onChange={e => setEditTravelerForm(p => ({ ...p, gender: e.target.value }))}>
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Non-binary</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Passport number</label>
                        <input className="form-input" value={editTravelerForm.passportNumber} onChange={e => setEditTravelerForm(p => ({ ...p, passportNumber: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="btn-primary" onClick={handleSaveEditTraveler}>Save</button>
                      <button className="btn-secondary" onClick={() => setEditTravelerId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* Display traveler */
                  <>
                    <div className="traveler-avatar">
                      {traveler.firstName[0]}{traveler.lastName[0]}
                    </div>
                    <div className="traveler-info">
                      <div className="traveler-name">{traveler.firstName} {traveler.lastName}</div>
                      <div className="traveler-details">
                        {traveler.dateOfBirth && <span>Born {traveler.dateOfBirth}</span>}
                        {traveler.gender && <span>{traveler.gender}</span>}
                        {traveler.passportNumber && <span>Passport: {traveler.passportNumber}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="traveler-action-btn edit"
                        title="Edit traveler"
                        onClick={() => handleStartEditTraveler(traveler)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="traveler-action-btn delete"
                        title="Remove traveler"
                        onClick={() => { removeTraveler(traveler.id); showToast('Traveler removed') }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {showAddTraveler && (
              <div className="add-traveler-form">
                <h3>Add traveler</h3>
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">First name *</label>
                    <input className="form-input" value={newTraveler.firstName} onChange={e => setNewTraveler(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Last name *</label>
                    <input className="form-input" value={newTraveler.lastName} onChange={e => setNewTraveler(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Date of birth</label>
                    <input type="date" className="form-input" value={newTraveler.dateOfBirth} onChange={e => setNewTraveler(p => ({ ...p, dateOfBirth: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={newTraveler.gender} onChange={e => setNewTraveler(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Passport number</label>
                    <input className="form-input" value={newTraveler.passportNumber} onChange={e => setNewTraveler(p => ({ ...p, passportNumber: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn-primary" onClick={handleAddTraveler}>Add traveler</button>
                  <button className="btn-secondary" onClick={() => setShowAddTraveler(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Properties */}
        <div className="account-section">
          <h2>Saved stays</h2>
          {savedHotels.length === 0 ? (
            <div style={{ color: 'var(--color-medium-gray)', fontStyle: 'italic', padding: '16px 0' }}>
              No saved properties. Heart any hotel to save it here.
            </div>
          ) : (
            <div className="saved-grid">
              {savedHotels.map(hotel => {
                const bestRoom = hotel.rooms[0]
                return (
                  <div key={hotel.id} className="saved-card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                    <div className="saved-img-wrap">
                      <img src={hotel.images[0]} alt={hotel.name} />
                      <button
                        className="saved-unsave"
                        onClick={e => { e.stopPropagation(); toggleSavedProperty(hotel.id); showToast('Removed from saved') }}
                      >
                        <Heart size={14} fill="#E21C5B" color="#E21C5B" />
                      </button>
                    </div>
                    <div className="saved-info">
                      <div className="saved-name">{hotel.name}</div>
                      <div className="saved-location">
                        <MapPin size={11} />
                        {hotel.neighborhood}
                      </div>
                      <div className="saved-rating">
                        <Star size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                        <span>{hotel.guestRating}</span>
                        <span className="saved-reviews">({hotel.reviewCount.toLocaleString()})</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-navy)' }}>
                        from ${bestRoom?.pricePerNight}/night
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        <div className="account-section">
          <h2>Recent searches</h2>
          {(user.recentSearches || []).length === 0 ? (
            <div style={{ color: 'var(--color-medium-gray)', fontStyle: 'italic', padding: '16px 0' }}>No recent searches.</div>
          ) : (
            <div className="recent-searches">
              {user.recentSearches.map(search => (
                <div key={search.id} className="recent-search-item">
                  <div className="recent-search-info">
                    <div className="recent-search-dest">{search.destination}</div>
                    <div className="recent-search-dates">
                      {search.checkIn} &ndash; {search.checkOut} &middot; {search.type}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => {
                        const typeRoutes = { stays: '/hotels', flights: '/flights', cars: '/cars', activities: '/activities', packages: '/packages', cruises: '/cruises' }
                        navigate(typeRoutes[search.type] || '/hotels')
                      }}
                    >
                      <Search size={12} /> Search again
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-medium-gray)', padding: '4px' }}
                      onClick={() => removeRecentSearch(search.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SuccessToast msg={toast} />
    </div>
  )
}
