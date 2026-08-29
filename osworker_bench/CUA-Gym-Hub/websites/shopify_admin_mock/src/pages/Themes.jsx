
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ExternalLink, Check } from 'lucide-react';

const AVAILABLE_THEMES = [
  { id: 'theme_dawn', name: 'Dawn', description: 'Clean, minimal — ideal for all product types', preview: 'https://placehold.co/320x200/e8f5e9/2e7d32?text=Dawn' },
  { id: 'theme_sense', name: 'Sense', description: 'Modern, bold — great for lifestyle brands', preview: 'https://placehold.co/320x200/e3f2fd/1565c0?text=Sense' },
  { id: 'theme_craft', name: 'Craft', description: 'Artisan look — perfect for handmade products', preview: 'https://placehold.co/320x200/fff3e0/e65100?text=Craft' },
  { id: 'theme_refresh', name: 'Refresh', description: 'Vibrant and dynamic — ideal for fashion', preview: 'https://placehold.co/320x200/fce4ec/880e4f?text=Refresh' },
];

export default function Themes() {
  const { state, updateState } = useStore();
  const activeThemeId = state.settings?.activeThemeId || 'theme_dawn';
  const [showCustomizeInfo, setShowCustomizeInfo] = useState(null);

  const handleActivate = (themeId) => {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    updateState('settings', { ...state.settings, activeThemeId: themeId, activeThemeName: theme.name });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Themes</h1>
      </div>

      {/* Current theme */}
      <div>
        <h2 className="card-title mb-3">Current theme</h2>
        {(() => {
          const active = AVAILABLE_THEMES.find(t => t.id === activeThemeId) || AVAILABLE_THEMES[0];
          return (
            <div className="card flex items-start gap-6">
              <div className="w-64 flex-shrink-0 rounded-lg overflow-hidden border" style={{ borderColor: '#e3e3e3' }}>
                <img src={active.preview} alt={active.name} className="w-full object-cover" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#303030]">{active.name}</h3>
                  <p className="text-[13px] text-[#616161]">{active.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-primary text-[13px]"
                    onClick={() => setShowCustomizeInfo(active)}
                  >
                    Customize
                  </button>
                  <button
                    className="btn-secondary text-[13px] flex items-center gap-1"
                    onClick={() => window.open('https://cua-gym-xhopify-admin.xlang.ai/', '_blank')}
                  >
                    <ExternalLink size={14} /> Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* More themes */}
      <div>
        <h2 className="card-title mb-3">Theme library</h2>
        <div className="grid grid-cols-2 gap-4">
          {AVAILABLE_THEMES.filter(t => t.id !== activeThemeId).map(theme => (
            <div key={theme.id} className="card p-0 overflow-hidden">
              <div className="w-full overflow-hidden" style={{ height: 160 }}>
                <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#303030]">{theme.name}</div>
                  <div className="text-[12px] text-[#616161]">{theme.description}</div>
                </div>
                <button
                  onClick={() => handleActivate(theme.id)}
                  className="btn-secondary text-[13px]"
                >
                  Activate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customize modal */}
      {showCustomizeInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-modal p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-[#303030]">Customize {showCustomizeInfo.name}</h3>
            <p className="text-[13px] text-[#616161]">
              The theme editor allows you to customize colors, fonts, sections, and content. Changes apply to your live store.
            </p>
            <div className="p-3 rounded-lg bg-[#f9fafb] border text-[13px] space-y-1" style={{ borderColor: '#e3e3e3' }}>
              <p className="font-medium text-[#303030]">Available customizations:</p>
              <ul className="text-[#616161] space-y-0.5 list-disc list-inside">
                <li>Colors &amp; typography</li>
                <li>Header &amp; footer layout</li>
                <li>Homepage sections</li>
                <li>Product page layout</li>
                <li>Cart settings</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCustomizeInfo(null)} className="btn-secondary text-[13px]">Close</button>
              <button onClick={() => setShowCustomizeInfo(null)} className="btn-primary text-[13px]">Open editor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
