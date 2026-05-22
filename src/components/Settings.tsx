import React, { useState } from 'react';
import { 
  User, Lock, CreditCard, Palette, Upload, Trash2, Check, MapPin, 
  Sparkles, Laptop, Globe, RefreshCw, Download, Shield, Activity, 
  Smartphone, Key, Mail, Eye, EyeOff, CheckCircle, Info, ChevronRight, HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { dbService } from '../lib/db';

interface SettingsProps {
  profile: UserProfile;
  onRefreshProfile: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

type SettingsSection = 'profile' | 'account' | 'security' | 'subscription' | 'appearance';

export const Settings: React.FC<SettingsProps> = ({ 
  profile, 
  onRefreshProfile,
  theme = 'dark',
  onToggleTheme
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  
  // Public Profile Fields state
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.email.split('@')[0] || 'arivera_codes');
  const [bio, setBio] = useState('Full-stack developer passionate about competitive programming and elegant system architecture. Currently mastering Dynamic Programming. 🚀');
  const [location, setLocation] = useState('San Francisco, CA');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Password / Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<string | null>(null);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  // Account settings states
  const [emailAddress, setEmailAddress] = useState(profile.email);
  const [defaultLang, setDefaultLang] = useState('python');
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  // Appearance fields state
  const [editorMode, setEditorMode] = useState<'comfortable' | 'compact'>('comfortable');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      await dbService.updateProfile({
        displayName,
        photoURL,
        email: emailAddress, // Sync email too
      });
      onRefreshProfile();
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('Error saving profile changes.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityStatus('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityStatus('New password does not match with confirmation.');
      return;
    }
    setSecurityStatus('Updating password...');
    setTimeout(() => {
      setSecurityStatus('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecurityStatus(null), 3000);
    }, 1200);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountStatus('Saving...');
    setTimeout(() => {
      setAccountStatus('Account updated successfully!');
      setTimeout(() => setAccountStatus(null), 3000);
    }, 800);
  };

  // Static list of active sessions
  const sessions = [
    { id: 1, browser: 'Chrome on Windows', location: 'San Francisco, CA', current: true, date: 'Active now' },
    { id: 2, browser: 'AlgoCode Mobile App - iPhone 15', location: 'California, US', current: false, date: 'Last active: 2 hours ago' },
    { id: 3, browser: 'Firefox on macOS Sonoma', location: 'San Francisco, CA', current: false, date: 'Last active: Sep 10, 2024' },
  ];

  // Static list of billing invoice records
  const billingHistory = [
    { date: 'Sep 12, 2024', desc: 'Monthly Premium - Subscription', amount: '$14.99', status: 'Paid' },
    { date: 'Aug 12, 2024', desc: 'Monthly Premium - Subscription', amount: '$14.99', status: 'Paid' },
    { date: 'Jul 12, 2024', desc: 'Monthly Premium - Subscription', amount: '$14.99', status: 'Paid' },
  ];

  const handleToggle2FA = () => {
    setIs2faEnabled(!is2faEnabled);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8 font-sans text-neutral-200 select-none min-h-[calc(100vh-140px)]" id="settings-parent-container">
      {/* Title */}
      <div className="mb-6 md:mb-8" id="settings-heading-block">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Settings
          <span className="text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-full px-2.5 py-0.5 font-mono">
            PREFERENCES
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure your personal profile details, active subscriptions, and workspace experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start" id="settings-layout-grid">
        {/* Left Sub-navigation Bar */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-1.5" id="settings-nav-sidebar">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold px-3 py-1 font-mono mb-2">
            User Settings
          </div>
          
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between transition group ${
              activeSection === 'profile'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
            }`}
            id="btn-settings-profile"
          >
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" />
              Public Profile
            </span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'profile' ? 'opacity-100 translate-x-0.5' : ''}`} />
          </button>

          <button
            onClick={() => setActiveSection('account')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between transition group ${
              activeSection === 'account'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
            }`}
            id="btn-settings-account"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0" />
              Account
            </span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'account' ? 'opacity-100 translate-x-0.5' : ''}`} />
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between transition group ${
              activeSection === 'security'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
            }`}
            id="btn-settings-security"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              Account Security
            </span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'security' ? 'opacity-100 translate-x-0.5' : ''}`} />
          </button>

          <button
            onClick={() => setActiveSection('subscription')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between transition group ${
              activeSection === 'subscription'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
            }`}
            id="btn-settings-subscription"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 shrink-0" />
              Subscription
            </span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'subscription' ? 'opacity-100 translate-x-0.5' : ''}`} />
          </button>

          <button
            onClick={() => setActiveSection('appearance')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between transition group ${
              activeSection === 'appearance'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
            }`}
            id="btn-settings-appearance"
          >
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 shrink-0" />
              Appearance
            </span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'appearance' ? 'opacity-100 translate-x-0.5' : ''}`} />
          </button>
        </div>

        {/* Right Section Content Panel */}
        <div className="lg:col-span-9 bg-neutral-950 border border-neutral-850 rounded-xl p-5 md:p-6" id="settings-main-pane">
          
          {/* SECTION 1: PUBLIC PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-fade-in duration-150" id="pane-public-profile">
              <div className="border-b border-neutral-850 pb-4">
                <h2 className="text-lg font-bold text-white">Public Profile</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Manage how you appear to others in the AlgoCode community.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Pic Upload Widget */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-neutral-900/40 border border-neutral-850/60 p-4 rounded-xl">
                  <div className="relative">
                    <img 
                      src={photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'} 
                      alt="Profile Avatar"
                      className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover border-2 border-neutral-800"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="text-sm font-semibold text-neutral-200">Profile Image</div>
                    <p className="text-[11px] text-neutral-500">Square JPG, PNG, or SVG format, maximum scale metadata is auto-formatted.</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const customSeeds = ['Alex', 'Leo', 'Mia', 'Zoe', 'Max', 'Luna'];
                          const randomSeed = customSeeds[Math.floor(Math.random() * customSeeds.length)];
                          setPhotoURL(`https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 shadow"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Generate New Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoURL('')}
                        disabled={!photoURL}
                        className="bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-sans"
                      placeholder="e.g. Alex Rivera"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Username</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 text-xs font-semibold select-none">
                        @
                      </span>
                      <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-7 pr-3 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-sans"
                        placeholder="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Bio</label>
                      <span className="text-[10px] font-mono text-neutral-500 font-semibold">{bio.length} / 300 characters</span>
                    </div>
                    <textarea 
                      value={bio} 
                      maxLength={300}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-sans resize-none"
                      placeholder="Share a short bio with the AlgoCode community..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Location</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input 
                        type="text" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-8.5 pr-3 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-sans"
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>

                {saveStatus && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-1.5 font-sans border ${
                    saveStatus.includes('success') 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                    {saveStatus}
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3.5 border-t border-neutral-850 pt-5 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDisplayName(profile.displayName);
                      setUsername(profile.email.split('@')[0] || 'arivera_codes');
                      setBio('Full-stack developer passionate about competitive programming and elegant system architecture.');
                      setLocation('San Francisco, CA');
                      setPhotoURL(profile.photoURL || '');
                    }}
                    className="text-xs bg-transparent hover:bg-neutral-900 border border-transparent hover:border-neutral-850 text-neutral-400 hover:text-white px-4 py-2.5 rounded-lg transition"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 border border-amber-600 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-lg transition shadow active:scale-95 duration-100"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* SECTION 2: ACCOUNT PREFERENCES */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-fade-in duration-150" id="pane-account-preferences">
              <div className="border-b border-neutral-850 pb-4">
                <h2 className="text-lg font-bold text-white">Account Settings</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Manage your email, account preferences, and basic settings.</p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Primary Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input 
                        type="email" 
                        value={emailAddress} 
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full pl-9 pr-3 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-sans"
                        placeholder="alex.rivera@algocode.io"
                        required
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 block font-mono leading-none mt-1">✔ VERIFIED ADVISORY ACCOUNT</span>
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Default Workspace Language</label>
                    <select
                      value={defaultLang}
                      onChange={(e) => setDefaultLang(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs md:text-sm text-white transition font-mono"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++ 17</option>
                      <option value="java">Java 11</option>
                    </select>
                  </div>

                  <div className="border-t border-neutral-850 pt-5 space-y-4">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">Community & Privacy</h3>
                    
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="privacy-public-input"
                        checked={privacyPublic} 
                        onChange={() => setPrivacyPublic(!privacyPublic)}
                        className="mt-1 h-3.5 w-3.5 accent-amber-500 border border-neutral-700 bg-neutral-900 focus:ring-0 rounded"
                      />
                      <label htmlFor="privacy-public-input" className="space-y-0.5 cursor-pointer">
                        <span className="text-xs font-semibold text-neutral-200 block">Make Profile Public</span>
                        <p className="text-[11px] text-neutral-500">Allow other AlgoCode programmers to view your ranked solve statistics, streak logs and dynamic heatmaps.</p>
                      </label>
                    </div>
                  </div>
                </div>

                {accountStatus && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-1.5 font-sans">
                    <CheckCircle className="h-4 w-4" />
                    {accountStatus}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3.5 border-t border-neutral-850 pt-5 pr-1">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 border border-amber-600 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-lg transition shadow active:scale-95 duration-100"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* SECTION 3: ACCOUNT SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6 animate-fade-in duration-150" id="pane-account-security">
              <div className="border-b border-neutral-850 pb-4">
                <h2 className="text-lg font-bold text-white">Account Security</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Manage your credentials, two-factor controls, and keep active sessions safe.</p>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-amber-500" />
                  Password Credentials
                </h3>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl bg-neutral-900/10 border border-neutral-850 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs text-white tracking-widest"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs text-white tracking-widest"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Confirm Passphrase</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none p-2.5 rounded-lg text-xs text-white tracking-widest"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {securityStatus && (
                    <div className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 px-3 border ${
                      securityStatus.includes('successfully')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      {securityStatus}
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold px-3.5 py-2 rounded-lg transition duration-150 active:scale-95"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication (2FA) */}
              <div className="border-t border-neutral-850 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/20 border border-neutral-850 p-4 rounded-xl">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-[11px] text-neutral-500 max-w-xl">
                      Secure your programming profile by requiring a custom secure authorization code on every single sign-in attempt. Recommended for master-tier developers.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 shrink-0 ${
                        is2faEnabled 
                          ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-750' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-neutral-950 border border-emerald-600 shadow-md'
                      }`}
                    >
                      {is2faEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions List */}
              <div className="border-t border-neutral-850 pt-5 space-y-3">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Active Connected Sessions
                </h3>
                <p className="text-[11px] text-neutral-500">You are currently logged in to your developer AlgoCode accounts on these active devices.</p>

                <div className="space-y-2 max-w-2xl bg-neutral-900/30 border border-neutral-850 rounded-xl overflow-hidden divide-y divide-neutral-850/80">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-3.5 flex items-start justify-between text-xs font-sans">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center shrink-0 mt-0.5 select-none font-mono">
                          {sess.browser.toLowerCase().includes('phone') ? <Smartphone className="h-4 w-4 text-amber-500" /> : <Laptop className="h-4 w-4 text-neutral-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 select-text font-bold text-neutral-200">
                            {sess.browser}
                            {sess.current && (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] px-1.5 py-0.5 rounded-full select-none uppercase font-bold">
                                Current Option
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1 select-all font-mono leading-none mt-1">
                            {sess.location} • {sess.date}
                          </p>
                        </div>
                      </div>

                      {!sess.current && (
                        <button className="text-[10px] font-bold text-red-400/90 hover:text-red-400 font-mono tracking-wider uppercase border border-red-950/40 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-md transition select-none">
                          TERMINATE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* SECTION 4: SUBSCRIPTION BILLING */}
          {activeSection === 'subscription' && (
            <div className="space-y-6 animate-fade-in duration-150" id="pane-subscription">
              <div className="border-b border-neutral-850 pb-4">
                <h2 className="text-lg font-bold text-white">Subscription Billing</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Manage your active plan, view upcoming charges and download invoices.</p>
              </div>

              {/* Current Active Plan Card */}
              <div className="bg-gradient-to-r from-amber-500/5 to-amber-600/[0.02] border border-amber-500/20 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden select-none">
                <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/[0.03] blur-2xl rounded-full pointer-events-none" />
                <div className="space-y-1 font-sans">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-wider font-bold text-amber-500 block uppercase">Premium Solved Tier</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight">Premium Monthly</h3>
                  <p className="text-xs text-neutral-400 max-w-md">Unlimited code evaluations, full Gemini sandbox analytics, and exclusive algorithm hints.</p>
                </div>
                <div>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to cancel your Premium subscription? Your benefits will remain active until October 12, 2024.")) {
                        alert("Subscription cancel successfully. Your premium perks will stop after the current invoice cycles.");
                      }
                    }}
                    className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-950 hover:border-red-900 text-red-400 font-bold px-4 py-2 rounded-xl shrink-0 transition"
                  >
                    Cancel Plan
                  </button>
                </div>
              </div>

              {/* Grid Billing Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
                <div className="bg-neutral-900/30 border border-neutral-850 p-4 rounded-xl text-xs space-y-1 font-sans">
                  <span className="text-neutral-500 font-mono text-[9px] uppercase font-bold block">Next Payment Date</span>
                  <div className="text-neutral-200 font-bold text-sm">October 12, 2024</div>
                  <p className="text-[10px] text-neutral-500 mt-1">Automatic renewals occurs at 01:00 AM UTC.</p>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-850 p-4 rounded-xl text-xs space-y-1 font-sans">
                  <span className="text-neutral-500 font-mono text-[9px] uppercase font-bold block">Payment Method</span>
                  <div className="text-neutral-200 font-bold text-sm flex items-center gap-1.5">
                    <span className="bg-neutral-950 border border-neutral-850 px-1.5 py-0.5 text-[8px] font-black tracking-widest font-mono text-neutral-400 rounded">VISA</span>
                    Visa ending in 4242
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Billing address: San Francisco, CA, USA.</p>
                </div>
              </div>

              {/* Billing History Invoice table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  Billing History
                </h3>
                
                <div className="overflow-hidden border border-neutral-850 rounded-xl bg-neutral-950 font-sans text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-neutral-900/70 border-b border-neutral-850 text-neutral-500 text-[10px] tracking-wider uppercase font-mono">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Date</th>
                          <th className="py-2.5 px-4 font-bold">Description</th>
                          <th className="py-2.5 px-4 font-bold">Amount</th>
                          <th className="py-2.5 px-4 font-bold text-center">Status</th>
                          <th className="py-2.5 px-4 font-bold text-right">Invoice Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850/60 font-medium">
                        {billingHistory.map((bill, index) => (
                          <tr key={index} className="hover:bg-neutral-900/20 select-text">
                            <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">{bill.date}</td>
                            <td className="py-3 px-4 text-neutral-200 font-semibold">{bill.desc}</td>
                            <td className="py-3 px-4 text-neutral-300 font-mono">{bill.amount}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] select-none font-bold">
                                {bill.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button 
                                onClick={() => alert(`Starting invoice PDF download for period ending ${bill.date}`)}
                                className="text-[10px] font-mono font-bold tracking-wide uppercase text-amber-500 hover:text-amber-400 flex items-center gap-1 ml-auto border border-neutral-850 bg-neutral-900 px-2.5 py-1 rounded-md transition select-none active:scale-95 duration-100"
                              >
                                <Download className="h-3 w-3 shrink-0" />
                                Invoice PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* SECTION 5: APPEARANCE PREFERENCES */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-fade-in duration-150" id="pane-appearance font-sans">
              <div className={`border-b ${theme === 'light' ? 'border-neutral-200' : 'border-neutral-800'} pb-4`}>
                <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>Appearance Settings</h2>
                <p className={`text-xs ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-400'} mt-0.5`}>Customize your development themes and workspace scaling presets.</p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-400'}`}>Visual Theme Presets</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preset 1 - Dark */}
                  <div 
                    onClick={() => onToggleTheme && onToggleTheme('dark')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      theme === 'dark'
                        ? 'border-amber-500/50 bg-amber-500/[0.03] shadow-md shadow-amber-500/5 scale-[1.01]'
                        : theme === 'light'
                          ? 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                          : 'border-neutral-850 bg-neutral-900/20 hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`text-xs font-bold ${theme === 'light' ? 'text-neutral-800' : 'text-white'}`}>Jet Dark (Pro Mode)</span>
                      {theme === 'dark' && <Check className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="space-y-1.5 select-none pointer-events-none">
                      <div className="h-2 bg-neutral-850 rounded w-11/12" />
                      <div className="h-2 bg-neutral-850 rounded w-2/3" />
                      <div className="flex gap-1.5 pt-1">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <div className="h-3 w-3 rounded-full bg-neutral-800" />
                      </div>
                    </div>
                  </div>

                  {/* Preset 2 - Light */}
                  <div 
                    onClick={() => onToggleTheme && onToggleTheme('light')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      theme === 'light'
                        ? 'border-amber-500/50 bg-amber-500/[0.03] shadow-md shadow-amber-500/5 scale-[1.01]'
                        : 'border-white/5 bg-neutral-900/20 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`text-xs font-bold ${theme === 'light' ? 'text-neutral-800' : 'text-white'}`}>Brutalist Cream (Light Mode)</span>
                      {theme === 'light' && <Check className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="space-y-1.5 select-none pointer-events-none">
                      <div className="h-2 bg-neutral-200 rounded w-11/12" />
                      <div className="h-2 bg-neutral-200 rounded w-2/3" />
                      <div className="flex gap-1.5 pt-1">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <div className="h-3 w-3 rounded-full bg-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Spacing preferences */}
              <div className="border-t border-neutral-850 pt-5 space-y-3.5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">Workspace Scale</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setEditorMode('comfortable')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      editorMode === 'comfortable'
                        ? 'bg-neutral-900 border border-neutral-800 text-amber-500 shadow-sm'
                        : 'bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-800'
                    }`}
                  >
                    Comfortable Scaling
                  </button>
                  <button
                    onClick={() => setEditorMode('compact')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      editorMode === 'compact'
                        ? 'bg-neutral-900 border border-neutral-800 text-amber-500 shadow-sm'
                        : 'bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-800'
                    }`}
                  >
                    Compact Densified
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
