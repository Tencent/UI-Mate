import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Bell, Lock, Globe, Eye, Palette, HelpCircle, Shield, ChevronRight, User, LogOut } from 'lucide-react';

const SettingsSection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-3 text-gray-800">{title}</h2>
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon: Icon, label, description, action, actionLabel, type = 'navigate', checked, onChange }) => {
  if (type === 'toggle') {
    return (
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-gray-500 flex-shrink-0" />}
          <div>
            <p className="font-medium text-sm">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
          </div>
        </div>
        <button
          role="switch"
          aria-checked={checked}
          onClick={onChange}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            checked ? 'bg-xinterest-red' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <button
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      onClick={action}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className="text-gray-500 flex-shrink-0" />}
        <div>
          <p className="font-medium text-sm">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actionLabel && <span className="text-sm text-gray-500">{actionLabel}</span>}
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    </button>
  );
};

const Settings = () => {
  const { state, updateProfile } = useStore();
  const navigate = useNavigate();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saveRecommendations, setSaveRecommendations] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showFollowers, setShowFollowers] = useState(true);
  const [searchVisibility, setSearchVisibility] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    // Reset to a cleared current-user state (simulated logout)
    updateProfile({
      name: state.currentUser.name,
      username: state.currentUser.username,
      bio: state.currentUser.bio,
      website: state.currentUser.website,
      avatar: state.currentUser.avatar,
    });
    showToast('You have been logged out');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => navigate(-1)}
          >
            <ChevronRight size={20} className="rotate-180 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Account section */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={User}
            label="Edit profile"
            description={`@${state.currentUser.username}`}
            action={() => navigate(`/profile/${state.currentUser.id}`)}
          />
          <SettingsRow
            icon={Lock}
            label="Change password"
            description="Update your password regularly to keep your account secure"
            action={() => showToast('Password change email sent to your address')}
          />
          <SettingsRow
            icon={Globe}
            label="Country / region"
            actionLabel="United States"
            action={() => showToast('Country settings saved')}
          />
          <SettingsRow
            icon={Globe}
            label="Language"
            actionLabel="English"
            action={() => showToast('Language settings saved')}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={Bell}
            label="Email notifications"
            description="Receive email updates about your activity"
            type="toggle"
            checked={emailNotifications}
            onChange={() => {
              setEmailNotifications(v => !v);
              showToast('Email notification preference saved');
            }}
          />
          <SettingsRow
            icon={Bell}
            label="Push notifications"
            description="Get notified in your browser"
            type="toggle"
            checked={pushNotifications}
            onChange={() => {
              setPushNotifications(v => !v);
              showToast('Push notification preference saved');
            }}
          />
          <SettingsRow
            icon={Bell}
            label="Weekly email digest"
            description="Receive a weekly summary of new ideas"
            type="toggle"
            checked={weeklyDigest}
            onChange={() => {
              setWeeklyDigest(v => !v);
              showToast('Weekly digest preference saved');
            }}
          />
          <SettingsRow
            icon={Bell}
            label="Save recommendations"
            description="Suggest boards when you save pins"
            type="toggle"
            checked={saveRecommendations}
            onChange={() => {
              setSaveRecommendations(v => !v);
              showToast('Recommendation preference saved');
            }}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy and data">
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Eye size={20} className="text-gray-500 flex-shrink-0" />
              <p className="font-medium text-sm">Profile visibility</p>
            </div>
            <div className="ml-9 flex gap-3">
              {['public', 'private'].map(v => (
                <button
                  key={v}
                  onClick={() => {
                    setProfileVisibility(v);
                    showToast(`Profile set to ${v}`);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${
                    profileVisibility === v
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <SettingsRow
            icon={Eye}
            label="Show your follower/following counts"
            type="toggle"
            checked={showFollowers}
            onChange={() => {
              setShowFollowers(v => !v);
              showToast('Visibility preference saved');
            }}
          />
          <SettingsRow
            icon={Globe}
            label="Search engine visibility"
            description="Allow search engines to index your profile"
            type="toggle"
            checked={searchVisibility}
            onChange={() => {
              setSearchVisibility(v => !v);
              showToast('Search visibility preference saved');
            }}
          />
          <SettingsRow
            icon={Shield}
            label="Personalized ads"
            description="Use your activity to show you more relevant ads"
            type="toggle"
            checked={personalizedAds}
            onChange={() => {
              setPersonalizedAds(v => !v);
              showToast('Ads preference saved');
            }}
          />
          <SettingsRow
            icon={Shield}
            label="Data sharing with partners"
            description="Share your data with Xinterest partners for improved services"
            type="toggle"
            checked={dataSharing}
            onChange={() => {
              setDataSharing(v => !v);
              showToast('Data sharing preference saved');
            }}
          />
          <SettingsRow
            icon={Shield}
            label="Download your data"
            description="Request a copy of your Xinterest data"
            action={() => showToast('Data export request submitted. You will receive an email when ready.')}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={Palette}
            label="Theme"
            actionLabel="Light"
            action={() => showToast('Theme settings saved')}
          />
          <SettingsRow
            icon={Globe}
            label="Display density"
            actionLabel="Standard"
            action={() => showToast('Display settings saved')}
          />
        </SettingsSection>

        {/* Help */}
        <SettingsSection title="Support">
          <SettingsRow
            icon={HelpCircle}
            label="Help center"
            action={() => showToast('Opening help center...')}
          />
          <SettingsRow
            icon={HelpCircle}
            label="Report a problem"
            action={() => showToast('Problem report submitted. Thank you!')}
          />
          <SettingsRow
            icon={Shield}
            label="Privacy policy"
            action={() => showToast('Opening privacy policy...')}
          />
          <SettingsRow
            icon={Shield}
            label="Terms of service"
            action={() => showToast('Opening terms of service...')}
          />
        </SettingsSection>

        {/* Logout */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="font-semibold text-sm">Log out</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-semibold whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Settings;
