
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './SettingsPage.css';

const SettingsPage = () => {
  const { data, updateSettings, clearHistory, clearSearchHistory, showToast } = useData();
  const settings = data.settings || {};
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [showClearSearchDialog, setShowClearSearchDialog] = useState(false);

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleDropdownChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
    // Resolve effective theme for immediate DOM update
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', effectiveTheme);
  };

  const handleClearWatchHistory = () => {
    clearHistory();
    setShowClearHistoryDialog(false);
    showToast('Watch history cleared');
  };

  const handleClearSearchHistory = () => {
    clearSearchHistory();
    setShowClearSearchDialog(false);
    showToast('Search history cleared');
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* Account */}
      <div className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <div className="settings-account-card">
          <img src={data.user.avatar} alt={data.user.displayName} className="settings-account-avatar" />
          <div className="settings-account-info">
            <div className="settings-account-name">{data.user.displayName}</div>
            <div className="settings-account-email">{data.user.email}</div>
            <div className="settings-account-handle">{data.user.handle}</div>
          </div>
        </div>
      </div>

      {/* Playback */}
      <div className="settings-section">
        <h2 className="settings-section-title">Playback</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Autoplay next video</div>
            <div className="settings-row-desc">Automatically play the next suggested video</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.autoplay !== false}
              onChange={() => handleToggle('autoplay')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Always show captions</div>
            <div className="settings-row-desc">Display captions on all videos</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={!!settings.captions}
              onChange={() => handleToggle('captions')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Subtitles language</div>
          </div>
          <select
            className="settings-dropdown"
            value={settings.subtitlesLang || 'English'}
            onChange={(e) => handleDropdownChange('subtitlesLang', e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>
      </div>

      {/* General */}
      <div className="settings-section">
        <h2 className="settings-section-title">General</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Theme</div>
          </div>
          <div className="settings-radio-group">
            {['light', 'dark', 'system'].map(theme => (
              <label key={theme} className="settings-radio-label">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={(settings.theme || 'light') === theme}
                  onChange={() => handleThemeChange(theme)}
                />
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Location</div>
          </div>
          <select
            className="settings-dropdown"
            value={settings.location || 'United States'}
            onChange={(e) => handleDropdownChange('location', e.target.value)}
          >
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="India">India</option>
            <option value="Brazil">Brazil</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Language</div>
          </div>
          <select
            className="settings-dropdown"
            value={settings.language || 'English'}
            onChange={(e) => handleDropdownChange('language', e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h2 className="settings-section-title">Notifications</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Subscriptions</div>
            <div className="settings-row-desc">Notify when subscribed channels upload</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.notifSubscriptions !== false}
              onChange={() => handleToggle('notifSubscriptions')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Recommended videos</div>
            <div className="settings-row-desc">Notify about videos you might like</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.notifRecommended !== false}
              onChange={() => handleToggle('notifRecommended')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Channel activity</div>
            <div className="settings-row-desc">Notify about activity on your channel</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.notifActivity !== false}
              onChange={() => handleToggle('notifActivity')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Comment replies</div>
            <div className="settings-row-desc">Notify when someone replies to your comment</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.notifReplies !== false}
              onChange={() => handleToggle('notifReplies')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="settings-section">
        <h2 className="settings-section-title">Privacy</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Keep watch history</div>
            <div className="settings-row-desc">Remember videos you watch to improve recommendations</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.keepWatchHistory !== false}
              onChange={() => handleToggle('keepWatchHistory')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Keep search history</div>
            <div className="settings-row-desc">Remember your searches to improve recommendations</div>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.keepSearchHistory !== false}
              onChange={() => handleToggle('keepSearchHistory')}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-privacy-actions">
          <button
            className="settings-action-btn"
            onClick={() => setShowClearHistoryDialog(true)}
          >
            Clear watch history
          </button>
          <button
            className="settings-action-btn"
            onClick={() => setShowClearSearchDialog(true)}
          >
            Clear search history
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearHistoryDialog}
        onClose={() => setShowClearHistoryDialog(false)}
        onConfirm={handleClearWatchHistory}
        title="Clear watch history?"
        message="This will clear your entire watch history. This action cannot be undone."
        confirmText="Clear history"
      />

      <ConfirmDialog
        isOpen={showClearSearchDialog}
        onClose={() => setShowClearSearchDialog(false)}
        onConfirm={handleClearSearchHistory}
        title="Clear search history?"
        message="This will clear your entire search history. This action cannot be undone."
        confirmText="Clear search history"
      />
    </div>
  );
};

export default SettingsPage;
