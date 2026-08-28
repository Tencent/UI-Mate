import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { User, MapPin, CreditCard, Package, Heart, ChevronRight, X, Check } from 'lucide-react';

const Toast = ({ message, onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 bg-green-700 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 z-50 text-sm">
      <Check size={16} /> {message}
    </div>
  );
};

export const Profile = () => {
  const { state, updateUserProfile, addAddress, setDefaultAddress, addPaymentMethod, setDefaultPaymentMethod } = useStore();
  const [activeSection, setActiveSection] = useState(null);
  const [toast, setToast] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ fullName: '', street: '', city: '', state: '', zip: '', country: 'United States', phone: '' });
  const [newPmForm, setNewPmForm] = useState({ brand: 'Visa', last4: '', expiry: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [showNewPm, setShowNewPm] = useState(false);

  const addresses = state.user.addresses || [state.user.address];
  const paymentMethods = state.user.paymentMethods || [state.user.paymentMethod];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name: editName, email: editEmail });
    setIsEditingProfile(false);
    setActiveSection(null);
    setToast('Profile updated successfully.');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.fullName || !newAddressForm.street || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zip) return;
    addAddress(newAddressForm);
    setNewAddressForm({ fullName: '', street: '', city: '', state: '', zip: '', country: 'United States', phone: '' });
    setShowNewAddress(false);
    setToast('Address added successfully.');
  };

  const handleAddPm = (e) => {
    e.preventDefault();
    if (!newPmForm.last4 || newPmForm.last4.length !== 4 || !newPmForm.expiry) return;
    addPaymentMethod(newPmForm);
    setNewPmForm({ brand: 'Visa', last4: '', expiry: '' });
    setShowNewPm(false);
    setToast('Payment method added successfully.');
  };

  const sections = [
    {
      id: 'orders',
      icon: <Package size={32} className="text-[#e47911]" />,
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      link: '/orders',
    },
    {
      id: 'wishlist',
      icon: <Heart size={32} className="text-[#e47911]" />,
      title: 'Your Lists',
      description: 'View your saved wishlist items',
      link: '/wishlist',
    },
    {
      id: 'profile',
      icon: <User size={32} className="text-[#e47911]" />,
      title: 'Login & security',
      description: 'Edit login, name, and mobile number',
    },
    {
      id: 'prime',
      icon: <span className="text-[#00a8e1] font-bold italic text-[22px]">prime</span>,
      title: 'Prime Membership',
      description: state.user.isPrime ? 'You are a Prime member' : 'Join Prime for free delivery',
    },
    {
      id: 'addresses',
      icon: <MapPin size={32} className="text-[#e47911]" />,
      title: 'Your Addresses',
      description: 'Edit addresses for orders and gifts',
    },
    {
      id: 'payment',
      icon: <CreditCard size={32} className="text-[#e47911]" />,
      title: 'Payment methods',
      description: 'Edit or add payment methods',
    },
  ];

  return (
    <div className="bg-[#eaeded] min-h-screen">
      <div className="max-w-[900px] mx-auto p-4">
        <h1 className="text-[26px] font-normal mb-4 text-[#0F1111]">Your Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {sections.map(sec => (
            sec.link ? (
              <Link
                key={sec.id}
                to={sec.link}
                className="bg-white border border-[#d5d9d9] rounded-lg p-4 flex gap-4 items-start hover:bg-[#f7f8f8] transition-all cursor-pointer"
              >
                <div className="shrink-0 mt-0.5">{sec.icon}</div>
                <div className="min-w-0">
                  <div className="font-bold text-[14px] mb-0.5 text-[#0F1111]">{sec.title}</div>
                  <div className="text-[12px] text-[#565959]">{sec.description}</div>
                </div>
              </Link>
            ) : (
              <button
                key={sec.id}
                onClick={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
                className={`bg-white border rounded-lg p-4 flex gap-4 items-start hover:bg-[#f7f8f8] transition-all cursor-pointer text-left w-full ${activeSection === sec.id ? 'border-[#e47911] ring-1 ring-[#e47911]' : 'border-[#d5d9d9]'}`}
              >
                <div className="shrink-0 mt-0.5">{sec.icon}</div>
                <div className="min-w-0">
                  <div className="font-bold text-[14px] mb-0.5 text-[#0F1111]">{sec.title}</div>
                  <div className="text-[12px] text-[#565959]">{sec.description}</div>
                </div>
              </button>
            )
          ))}
        </div>

        {/* Login & Security Section */}
        {activeSection === 'profile' && (
          <div className="bg-white border rounded p-6 mb-4">
            <h2 className="text-lg font-bold mb-4">Login &amp; security</h2>
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <div className="text-sm font-bold">Name</div>
                  <div className="text-sm text-gray-600">{state.user.name}</div>
                </div>
                <button
                  className="text-xmazon-blue hover:underline text-sm"
                  onClick={() => { setEditName(state.user.name); setEditEmail(state.user.email); setIsEditingProfile(true); }}
                >
                  Edit
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <div className="text-sm font-bold">Email</div>
                  <div className="text-sm text-gray-600">{state.user.email}</div>
                </div>
              </div>
            </div>
            {isEditingProfile && (
              <form onSubmit={handleSaveProfile} className="space-y-3 border-t pt-4">
                <h3 className="font-bold text-sm">Edit your name &amp; email</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save changes</Button>
                  <Button variant="secondary" type="button" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Addresses Section */}
        {activeSection === 'addresses' && (
          <div className="bg-white border rounded p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Your Addresses</h2>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xmazon-blue hover:underline text-sm font-medium"
              >
                + Add new address
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleAddAddress} className="bg-gray-50 border rounded p-4 mb-4 space-y-3">
                <h3 className="font-bold text-sm">Add a new address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold mb-1">Full name</label>
                    <input required type="text" value={newAddressForm.fullName} onChange={e => setNewAddressForm({...newAddressForm, fullName: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold mb-1">Street address</label>
                    <input required type="text" value={newAddressForm.street} onChange={e => setNewAddressForm({...newAddressForm, street: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">City</label>
                    <input required type="text" value={newAddressForm.city} onChange={e => setNewAddressForm({...newAddressForm, city: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">State</label>
                    <input required type="text" value={newAddressForm.state} onChange={e => setNewAddressForm({...newAddressForm, state: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ZIP code</label>
                    <input required type="text" value={newAddressForm.zip} onChange={e => setNewAddressForm({...newAddressForm, zip: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Phone (optional)</label>
                    <input type="text" value={newAddressForm.phone} onChange={e => setNewAddressForm({...newAddressForm, phone: e.target.value})}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add address</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr, idx) => (
                <div key={addr.id || idx} className={`border rounded p-4 text-sm relative ${addr.isDefault ? 'border-xmazon-orange' : ''}`}>
                  {addr.isDefault && (
                    <span className="absolute top-2 right-2 text-xs bg-xmazon-orange text-white px-2 py-0.5 rounded">Default</span>
                  )}
                  <div className="font-bold">{addr.fullName}</div>
                  <div>{addr.street}</div>
                  <div>{addr.city}, {addr.state} {addr.zip}</div>
                  <div>{addr.country}</div>
                  {addr.phone && <div className="text-gray-500">{addr.phone}</div>}
                  {!addr.isDefault && addr.id && (
                    <button
                      onClick={() => { setDefaultAddress(addr.id); setToast('Default address updated.'); }}
                      className="mt-2 text-xmazon-blue hover:underline text-xs"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prime Membership Section */}
        {activeSection === 'prime' && (
          <div className="bg-white border border-[#d5d9d9] rounded-lg p-6 mb-4">
            <h2 className="text-[18px] font-bold mb-4 text-[#0F1111]">Prime Membership</h2>
            <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-lg">
              <span className="text-[#00a8e1] font-bold italic text-[28px]">prime</span>
              <div className="text-white">
                <div className="font-bold text-[14px]">{state.user.isPrime ? 'You are a Prime member' : 'Join Xmazon Prime'}</div>
                <div className="text-[12px] text-gray-300">
                  {state.user.isPrime
                    ? `Member since ${state.user.memberSince || '2019'} - Enjoy FREE same-day, one-day, and two-day delivery`
                    : 'Fast, free delivery plus streaming, reading, and more'
                  }
                </div>
              </div>
            </div>
            {state.user.isPrime && (
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-2 p-3 bg-[#f0f9ff] rounded border border-[#d1ecf8]">
                  <span className="text-[#00a8e1] font-bold">FREE Delivery</span>
                  <span className="text-[#565959]">- Fast, free shipping on millions of items</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#f0f9ff] rounded border border-[#d1ecf8]">
                  <span className="text-[#00a8e1] font-bold">Prime Video</span>
                  <span className="text-[#565959]">- Watch thousands of movies and TV shows</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#f0f9ff] rounded border border-[#d1ecf8]">
                  <span className="text-[#00a8e1] font-bold">Prime Music</span>
                  <span className="text-[#565959]">- 100 million songs, ad-free</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#f0f9ff] rounded border border-[#d1ecf8]">
                  <span className="text-[#00a8e1] font-bold">Prime Reading</span>
                  <span className="text-[#565959]">- A rotating selection of books and magazines</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Section */}
        {activeSection === 'payment' && (
          <div className="bg-white border rounded p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Payment methods</h2>
              <button
                onClick={() => setShowNewPm(!showNewPm)}
                className="text-xmazon-blue hover:underline text-sm font-medium"
              >
                + Add a card
              </button>
            </div>

            {showNewPm && (
              <form onSubmit={handleAddPm} className="bg-gray-50 border rounded p-4 mb-4 space-y-3">
                <h3 className="font-bold text-sm">Add a new card</h3>
                <div>
                  <label className="block text-xs font-bold mb-1">Card type</label>
                  <select value={newPmForm.brand} onChange={e => setNewPmForm({...newPmForm, brand: e.target.value})}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange">
                    <option>Visa</option>
                    <option>Mastercard</option>
                    <option>American Express</option>
                    <option>Discover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Last 4 digits</label>
                  <input required type="text" maxLength={4} minLength={4} pattern="\d{4}" value={newPmForm.last4}
                    onChange={e => setNewPmForm({...newPmForm, last4: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                    placeholder="1234"
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Expiry (MM/YY)</label>
                  <input required type="text" placeholder="12/28" value={newPmForm.expiry}
                    onChange={e => setNewPmForm({...newPmForm, expiry: e.target.value})}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:border-xmazon-orange" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add card</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowNewPm(false)}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm, idx) => (
                <div key={pm.id || idx} className={`border rounded p-4 text-sm relative ${pm.isDefault ? 'border-xmazon-orange' : ''}`}>
                  {pm.isDefault && (
                    <span className="absolute top-2 right-2 text-xs bg-xmazon-orange text-white px-2 py-0.5 rounded">Default</span>
                  )}
                  <div className="flex items-center gap-2 font-bold">
                    <CreditCard size={16} className="text-gray-500" />
                    {pm.brand} ending in {pm.last4}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Expires {pm.expiry}</div>
                  {!pm.isDefault && pm.id && (
                    <button
                      onClick={() => { setDefaultPaymentMethod(pm.id); setToast('Default payment method updated.'); }}
                      className="mt-2 text-xmazon-blue hover:underline text-xs"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
};
