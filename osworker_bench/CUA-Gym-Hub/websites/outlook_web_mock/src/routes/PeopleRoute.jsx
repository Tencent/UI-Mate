import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MoreHorizontal } from 'lucide-react';

export default function PeopleRoute() {
  const { state, actions } = useStore();
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '' });
    setDialog({ type: 'add' });
  };

  const openEdit = (contact) => {
    setForm({ name: contact.name, email: contact.email, phone: contact.phone || '' });
    setDialog({ type: 'edit', contact });
  };

  const saveContact = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (dialog.type === 'edit') {
      actions.updateContact(dialog.contact.id, form);
    } else {
      actions.addContact(form);
    }
    setDialog(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-neutral-800">Contacts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {state.contacts.map(contact => (
          <div key={contact.id} className="bg-white p-4 rounded shadow-sm border border-neutral-200 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-lg text-neutral-800">{contact.name}</h3>
            <p className="text-sm text-neutral-500 mb-4">{contact.email}</p>
            
            <div className="flex gap-2 w-full justify-center opacity-60 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setDialog({ type: 'email', contact })} className="p-2 bg-neutral-100 rounded-full hover:bg-primary hover:text-white transition-colors" title="Email">
                <Mail className="w-4 h-4" />
              </button>
              <button onClick={() => setDialog({ type: 'call', contact })} className="p-2 bg-neutral-100 rounded-full hover:bg-primary hover:text-white transition-colors" title="Call">
                <Phone className="w-4 h-4" />
              </button>
              <button onClick={() => openEdit(contact)} className="p-2 bg-neutral-100 rounded-full hover:bg-primary hover:text-white transition-colors" title="Edit contact">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add Contact Button */}
        <button onClick={openAdd} className="border-2 border-dashed border-neutral-300 rounded p-4 flex flex-col items-center justify-center text-neutral-400 hover:border-primary hover:text-primary transition-colors min-h-[200px]">
          <span className="text-4xl font-light mb-2">+</span>
          <span className="font-medium">Add contact</span>
        </button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded bg-white p-5 shadow-xl">
            {dialog.type === 'email' && (
              <>
                <h3 className="mb-3 text-lg font-semibold">Email {dialog.contact.name}</h3>
                <p className="mb-4 text-sm text-neutral-600">A local draft is ready for {dialog.contact.email}.</p>
                <button onClick={() => setDialog(null)} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white">Done</button>
              </>
            )}
            {dialog.type === 'call' && (
              <>
                <h3 className="mb-3 text-lg font-semibold">Call {dialog.contact.name}</h3>
                <p className="mb-4 text-sm text-neutral-600">Local call panel opened for {dialog.contact.phone || dialog.contact.email}.</p>
                <button onClick={() => setDialog(null)} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white">End</button>
              </>
            )}
            {(dialog.type === 'add' || dialog.type === 'edit') && (
              <form onSubmit={saveContact}>
                <h3 className="mb-3 text-lg font-semibold">{dialog.type === 'edit' ? 'Edit contact' : 'Add contact'}</h3>
                <div className="space-y-3">
                  <input value={form.name} onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="Name" />
                  <input value={form.email} onChange={(event) => setForm(prev => ({ ...prev, email: event.target.value }))} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="Email" />
                  <input value={form.phone} onChange={(event) => setForm(prev => ({ ...prev, phone: event.target.value }))} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="Phone" />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Cancel</button>
                  <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
