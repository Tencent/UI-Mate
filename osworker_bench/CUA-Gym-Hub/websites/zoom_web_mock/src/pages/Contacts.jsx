import React, { useEffect, useState } from 'react';
import { UserPlus, Mail, Star, MoreHorizontal, X, Send, Video } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Contacts() {
  const { contacts, addContact, updateContact, addActivity } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' });
  const [notice, setNotice] = useState('');
  const [newContact, setNewContact] = useState({ name: '', email: '' });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setShowModal(false);
      setShowEmailComposer(false);
      setSelectedContact(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    addContact({
      contactId: `c_${Date.now()}`,
      name: newContact.name,
      email: newContact.email,
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
      status: 'offline'
    });
    setNewContact({ name: '', email: '' });
    setShowModal(false);
  };

  const openComposer = (contact) => {
    setSelectedContact(contact);
    setEmailDraft({ subject: `Xoom follow-up for ${contact.name}`, body: '' });
    setShowEmailComposer(true);
  };

  const sendLocalEmail = (event) => {
    event.preventDefault();
    addActivity('email', `Drafted email to ${selectedContact.email}`);
    setNotice(`Local email draft saved for ${selectedContact.name}`);
    setShowEmailComposer(false);
  };

  const toggleFavorite = (contact) => {
    updateContact(contact.contactId, { favorite: !contact.favorite });
    setNotice(`${contact.name} ${contact.favorite ? 'removed from' : 'added to'} favorites`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-transparent text-xoom-blue px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {contacts.map(contact => (
            <div key={contact.contactId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    contact.status === 'available' ? 'bg-green-500' : 
                    contact.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openComposer(contact)} className="p-2 text-gray-500 hover:text-xoom-blue hover:bg-blue-50 rounded-full" title={`Email ${contact.name}`}>
                  <Mail className="w-4 h-4" />
                </button>
                <button onClick={() => toggleFavorite(contact)} className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-full" title="Toggle favorite">
                  <Star className={`w-4 h-4 ${contact.favorite ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                </button>
                <button onClick={() => setSelectedContact(contact)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Contact details">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newContact.email}
                  onChange={e => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-xoom-blue rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedContact && !showEmailComposer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contact Details</h3>
              <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img src={selectedContact.avatar} alt={selectedContact.name} className="w-14 h-14 rounded-full" />
                <div>
                  <div className="font-semibold text-lg">{selectedContact.name}</div>
                  <div className="text-sm text-gray-500">{selectedContact.email}</div>
                  <div className="text-xs text-gray-400 capitalize">{selectedContact.status}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => openComposer(selectedContact)} className="flex items-center justify-center gap-2 rounded-lg bg-xoom-blue text-white px-4 py-2">
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button onClick={() => setNotice(`Local instant meeting prepared for ${selectedContact.name}`)} className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2">
                  <Video className="w-4 h-4" /> Meet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailComposer && selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email {selectedContact.name}</h3>
              <button onClick={() => setShowEmailComposer(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={sendLocalEmail} className="p-6 space-y-4">
              <input className="w-full px-3 py-2 border rounded-lg" value={selectedContact.email} readOnly />
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={emailDraft.subject}
                onChange={event => setEmailDraft({ ...emailDraft, subject: event.target.value })}
              />
              <textarea
                className="w-full px-3 py-2 border rounded-lg min-h-32"
                placeholder="Write a local draft..."
                value={emailDraft.body}
                onChange={event => setEmailDraft({ ...emailDraft, body: event.target.value })}
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEmailComposer(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xoom-blue text-white rounded-lg flex items-center gap-2"><Send className="w-4 h-4" /> Save Draft</button>
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
