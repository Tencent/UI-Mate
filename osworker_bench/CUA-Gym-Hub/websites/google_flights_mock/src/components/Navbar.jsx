
    import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { Plane, Menu, User, Bell, Building2, Compass, X } from 'lucide-react';
    import { useAppStore } from '../lib/store';

    export default function Navbar() {
      const { state, markAlertRead } = useAppStore();
      const [panel, setPanel] = useState(null);
      const [mobileOpen, setMobileOpen] = useState(false);
      const unreadAlerts = state.alerts.filter(alert => alert.active && !alert.read).length;
      const latestBookings = state.bookings.slice(-3).reverse();

      const closePanels = () => {
        setPanel(null);
        setMobileOpen(false);
      };

      return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center gap-2">
                    <Plane className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold text-gray-700">SkySearch</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Flights
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPanel(panel === 'hotels' ? null : 'hotels')}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Hotels
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel(panel === 'explore' ? null : 'explore')}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Explore
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPanel(panel === 'alerts' ? null : 'alerts')}
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Open price alerts"
                >
                  <Bell className="h-5 w-5" />
                  {unreadAlerts > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadAlerts}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPanel(panel === 'account' ? null : 'account')}
                  className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-200"
                  aria-label="Open account menu"
                >
                  <img src="https://picsum.photos/100/100?random=user1" alt="User" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(value => !value)}
                  className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  aria-label="Open mobile navigation"
                >
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {mobileOpen && (
              <div className="sm:hidden border-t border-gray-100 py-3 space-y-1">
                <Link onClick={closePanels} to="/" className="block rounded px-3 py-2 text-sm font-medium text-gray-900 bg-blue-50">Flights</Link>
                <button type="button" onClick={() => setPanel('hotels')} className="block w-full text-left rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Hotels</button>
                <button type="button" onClick={() => setPanel('explore')} className="block w-full text-left rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Explore</button>
              </div>
            )}
          </div>

          {panel && (
            <div className="absolute right-4 top-16 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="font-semibold text-gray-900">
                  {panel === 'alerts' && 'Price alerts'}
                  {panel === 'account' && 'Account'}
                  {panel === 'hotels' && 'Hotel stays'}
                  {panel === 'explore' && 'Explore trips'}
                </div>
                <button type="button" onClick={() => setPanel(null)} className="p-1 rounded hover:bg-gray-100" aria-label="Close panel">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {panel === 'alerts' && (
                <div className="max-h-80 overflow-y-auto">
                  {state.alerts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No price alerts yet.</div>
                  ) : (
                    state.alerts.slice().reverse().map(alert => (
                      <button
                        type="button"
                        key={alert.id}
                        onClick={() => markAlertRead(alert.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${alert.read ? '' : 'bg-blue-50'}`}
                      >
                        <div className="font-medium text-gray-900">{alert.origin || 'Any'} to {alert.destination || 'Any'}</div>
                        <div className="text-sm text-gray-500">Watching fares under ${alert.maxPrice}</div>
                        <div className="text-xs text-gray-400">{alert.active ? 'Active' : 'Paused'}</div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {panel === 'account' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{state.user.name}</div>
                      <div className="text-sm text-gray-500">{state.user.email}</div>
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-sm font-medium text-gray-900">Recent bookings</div>
                    {latestBookings.length === 0 ? (
                      <div className="mt-1 text-sm text-gray-500">No bookings yet.</div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {latestBookings.map(booking => (
                          <div key={booking.id} className="text-sm text-gray-600">
                            {booking.reference} · {booking.flightDetails.origin.code} to {booking.flightDetails.destination.code}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {panel === 'hotels' && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-3 rounded-md border border-gray-100 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-gray-900">Local hotel sandbox</div>
                      <div className="text-sm text-gray-500">Mock hotel suggestions are tied to the destination from your last flight search.</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['Airport hotel', 'City center', 'Family stay', 'Flexible cancellation'].map(label => (
                      <button type="button" key={label} className="rounded border border-gray-200 px-3 py-2 hover:bg-gray-50">{label}</button>
                    ))}
                  </div>
                </div>
              )}

              {panel === 'explore' && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-3 rounded-md border border-gray-100 p-3">
                    <Compass className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-gray-900">Trip ideas</div>
                      <div className="text-sm text-gray-500">Use these quick picks to seed flight searches without leaving the sandbox.</div>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <Link onClick={closePanels} to="/results?origin=JFK&destination=LHR&flexible=true" className="rounded border border-gray-200 px-3 py-2 hover:bg-gray-50">New York to London</Link>
                    <Link onClick={closePanels} to="/results?origin=SFO&destination=HND&flexible=true" className="rounded border border-gray-200 px-3 py-2 hover:bg-gray-50">San Francisco to Tokyo</Link>
                    <Link onClick={closePanels} to="/results?origin=LAX&destination=SYD&flexible=true" className="rounded border border-gray-200 px-3 py-2 hover:bg-gray-50">Los Angeles to Sydney</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      );
    }

