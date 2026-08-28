
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';

export default function Navigation() {
  const { state, updateNavigationMenu } = useStore();
  const menus = state.navigationMenus || [];
  const [selectedMenu, setSelectedMenu] = useState(menus[0]?.id || null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemForm, setAddItemForm] = useState({ title: '', url: '' });
  const [addItemErrors, setAddItemErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const currentMenu = menus.find(m => m.id === selectedMenu);

  const validateAddItem = () => {
    const e = {};
    if (!addItemForm.title.trim()) e.title = 'Title is required';
    if (!addItemForm.url.trim()) e.url = 'URL is required';
    return e;
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const errors = validateAddItem();
    if (Object.keys(errors).length > 0) {
      setAddItemErrors(errors);
      return;
    }
    const menu = menus.find(m => m.id === selectedMenu);
    if (!menu) return;
    const newItem = {
      id: `item_${Date.now()}`,
      title: addItemForm.title,
      url: addItemForm.url,
      position: (menu.items || []).length + 1,
      children: [],
    };
    updateNavigationMenu(selectedMenu, {
      items: [...(menu.items || []), newItem]
    });
    setAddItemForm({ title: '', url: '' });
    setAddItemErrors({});
    setShowAddItem(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveItem = (itemId) => {
    const menu = menus.find(m => m.id === selectedMenu);
    if (!menu) return;
    updateNavigationMenu(selectedMenu, {
      items: (menu.items || []).filter(i => i.id !== itemId)
    });
  };

  const handleUpdateItemTitle = (itemId, title) => {
    const menu = menus.find(m => m.id === selectedMenu);
    if (!menu) return;
    updateNavigationMenu(selectedMenu, {
      items: (menu.items || []).map(i => i.id === itemId ? { ...i, title } : i)
    });
  };

  const handleUpdateItemUrl = (itemId, url) => {
    const menu = menus.find(m => m.id === selectedMenu);
    if (!menu) return;
    updateNavigationMenu(selectedMenu, {
      items: (menu.items || []).map(i => i.id === itemId ? { ...i, url } : i)
    });
  };

  if (menus.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Navigation</h1>
        <div className="card text-center py-12">
          <p className="text-[13px] text-[#616161]">No navigation menus found. Inject state with navigationMenus to manage them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Navigation</h1>
        {saved && (
          <span className="text-[13px] font-medium" style={{ color: '#047b5d' }}>Saved</span>
        )}
      </div>

      {/* Menu selector */}
      <div className="flex gap-2">
        {menus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setSelectedMenu(menu.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              selectedMenu === menu.id
                ? 'bg-[#303030] text-white'
                : 'bg-white border text-[#616161] hover:bg-[#f9fafb]'
            }`}
            style={{ borderColor: '#e3e3e3' }}
          >
            {menu.title}
          </button>
        ))}
      </div>

      {currentMenu && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">{currentMenu.title}</h3>
              {currentMenu.handle && <p className="text-[12px] text-[#616161]">Handle: {currentMenu.handle}</p>}
            </div>
            <button onClick={() => setShowAddItem(true)} className="btn-primary text-[13px]">
              <Plus size={16} /> Add menu item
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {(currentMenu.items || []).length === 0 ? (
              <div className="p-8 text-center border rounded-lg text-[13px] text-[#616161]" style={{ borderColor: '#e3e3e3', borderStyle: 'dashed' }}>
                No menu items. Add items to build your navigation menu.
              </div>
            ) : (
              (currentMenu.items || []).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-white"
                  style={{ borderColor: '#e3e3e3' }}
                >
                  <GripVertical size={16} className="text-[#616161] cursor-grab" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="text-[13px]"
                      value={item.title}
                      onChange={e => handleUpdateItemTitle(item.id, e.target.value)}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      className="text-[13px]"
                      value={item.url}
                      onChange={e => handleUpdateItemUrl(item.id, e.target.value)}
                      placeholder="URL"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 hover:bg-[#ffd2d2] text-[#d72c0d] rounded flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Item Form */}
          {showAddItem && (
            <div className="p-4 rounded-lg border space-y-3" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#303030]">Add menu item</span>
                <button onClick={() => setShowAddItem(false)}><X size={16} className="text-[#616161]" /></button>
              </div>
              <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    className={`w-full text-[13px] ${addItemErrors.title ? 'border-[#d72c0d]' : ''}`}
                    placeholder="Label (e.g. About)"
                    value={addItemForm.title}
                    onChange={e => { setAddItemForm(f => ({ ...f, title: e.target.value })); setAddItemErrors(v => ({ ...v, title: '' })); }}
                  />
                  {addItemErrors.title && <p className="text-[12px] text-[#d72c0d] mt-0.5">{addItemErrors.title}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    className={`w-full text-[13px] ${addItemErrors.url ? 'border-[#d72c0d]' : ''}`}
                    placeholder="URL (e.g. /pages/about)"
                    value={addItemForm.url}
                    onChange={e => { setAddItemForm(f => ({ ...f, url: e.target.value })); setAddItemErrors(v => ({ ...v, url: '' })); }}
                  />
                  {addItemErrors.url && <p className="text-[12px] text-[#d72c0d] mt-0.5">{addItemErrors.url}</p>}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddItem(false)} className="btn-secondary text-[13px]">Cancel</button>
                  <button type="submit" className="btn-primary text-[13px]">Add item</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
