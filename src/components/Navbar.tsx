import React from 'react';
import { Terminal, User, LogOut, Code, BarChart2, Award, Zap, Trophy, MessageSquare, Settings, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  profile: UserProfile;
  onLogout: () => void;
  onOpenLogin: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  profile,
  onLogout,
  onOpenLogin,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDefaultUser = profile.uid === 'alex-rivera-default-uid';
  const isLight = theme === 'light';

  return (
    <nav className={`border-b sticky top-0 z-40 select-none transition-all duration-300 backdrop-blur-md ${
      isLight 
        ? 'border-neutral-200 bg-white/75 shadow-sm text-neutral-800' 
        : 'border-white/5 bg-[#0b0f19]/85 shadow-lg shadow-black/10'
    } px-6 py-3.5`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Logo Section */}
        <div 
          onClick={() => setTab('problems')}
          className="flex cursor-pointer items-center gap-2.5 transition active:scale-95"
          id="navbar-logo"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition-all duration-300 ${
            isLight 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-650' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <span className={`font-sans text-lg font-bold tracking-tight transition-colors duration-300 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>AlgoCode</span>
            <span className="block text-[10px] font-mono text-neutral-400 leading-none">V1.4.2 // CLOUD</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1.5 font-sans" id="navbar-tabs">
          <button
            onClick={() => setTab('problems')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'problems' || currentTab === 'workspace'
                ? isLight 
                  ? 'bg-neutral-100/90 text-amber-600 border border-neutral-200 shadow-sm font-bold'
                  : 'bg-white/5 text-amber-500 border border-white/10 shadow-sm'
                : isLight
                  ? 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-100/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code className="h-4.5 w-4.5 shrink-0" />
            <span>Problem Library</span>
          </button>

          <button
            onClick={() => setTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? isLight 
                  ? 'bg-neutral-100/90 text-amber-600 border border-neutral-200 shadow-sm font-bold'
                  : 'bg-white/5 text-amber-500 border border-white/10 shadow-sm'
                : isLight
                  ? 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-100/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="h-4.5 w-4.5 shrink-0" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setTab('contests')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'contests'
                ? isLight 
                  ? 'bg-neutral-100/90 text-amber-600 border border-neutral-200 shadow-sm font-bold'
                  : 'bg-white/5 text-amber-500 border border-white/10 shadow-sm'
                : isLight
                  ? 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-100/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="h-4.5 w-4.5 shrink-0" />
            <span>Contests</span>
          </button>

          <button
            onClick={() => setTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'leaderboard'
                ? isLight 
                  ? 'bg-neutral-100/90 text-amber-600 border border-neutral-200 shadow-sm font-bold'
                  : 'bg-white/5 text-amber-500 border border-white/10 shadow-sm'
                : isLight
                  ? 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-100/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="h-4.5 w-4.5 shrink-0" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setTab('discuss')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'discuss'
                ? isLight 
                  ? 'bg-neutral-100/90 text-amber-600 border border-neutral-200 shadow-sm font-bold'
                  : 'bg-white/5 text-amber-500 border border-white/10 shadow-sm'
                : isLight
                  ? 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-100/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5 shrink-0" />
            <span>Discussions</span>
          </button>
        </div>

        {/* User Stats widget & controls */}
        <div className="flex items-center gap-3.5" id="navbar-user-panel">
          
          {/* Solved Stats indicator */}
          <div className={`hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${
            isLight ? 'bg-neutral-100/50 border-neutral-200' : 'bg-neutral-900/40 border-white/5'
          }`}>
            <Award className={`h-4 w-4 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-500 animate-pulse'}`} />
            <div className="text-right">
              <div className={`text-[10px] font-mono leading-tight ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Solved <span className={`${isLight ? 'text-amber-600 font-bold' : 'text-amber-500 font-bold'}`}>{profile.totalSolved}</span> / 2450
              </div>
              <div className={`w-20 h-1 rounded-full mt-0.5 overflow-hidden border ${isLight ? 'bg-neutral-200 border-neutral-300/30' : 'bg-[#0f1115] border-white/5'}`}>
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (profile.totalSolved / 2450) * 100)}%` }}
                />
              </div>
            </div>
            {profile.streak > 0 && (
              <div className={`flex items-center gap-0.5 border px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ml-1 ${
                isLight 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-sm' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm shadow-amber-500/5 animate-bounce-subtle'
              }`}>
                <Zap className="h-3 w-3 fill-amber-500 shrink-0" />
                <span>{profile.streak}d</span>
              </div>
            )}
          </div>

          {/* Theme Dynamic Controller Tab */}
          {onToggleTheme && (
            <div className={`p-0.5 rounded-lg border flex items-center transition-all ${
              isLight 
                ? 'bg-neutral-200/50 border-neutral-300' 
                : 'bg-neutral-900/85 border-white/5'
            }`}>
              <button
                onClick={() => onToggleTheme('dark')}
                title="Enter deep dark workspace"
                className={`p-1.5 rounded-md text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1 transition ${
                  !isLight
                    ? 'bg-neutral-800 text-amber-500 border border-neutral-700/40 shadow shadow-black/30'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onToggleTheme('light')}
                title="Enter clean light workspace"
                className={`p-1.5 rounded-md text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1 transition-all ${
                  isLight
                    ? 'bg-white text-amber-700 border border-neutral-200 shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Settings Section Gear button */}
          <button
            onClick={() => setTab('settings')}
            title="Configure appearance & developer options"
            className={`p-2 rounded-lg border transition active:scale-95 duration-150 cursor-pointer ${
              currentTab === 'settings'
                ? isLight
                  ? 'text-amber-700 border-amber-500/20 bg-amber-500/10'
                  : 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                : isLight
                  ? 'text-neutral-500 border-neutral-200 bg-neutral-100 hover:text-neutral-800 hover:bg-neutral-200/50'
                  : 'text-neutral-500 border-white/5 bg-neutral-900/40 hover:text-white hover:border-white/10'
            }`}
            id="nav-settings-gear"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Logged in User widget or Sign In */}
          {isDefaultUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLogin}
                className="bg-amber-500 hover:bg-amber-600 border border-amber-600 text-neutral-950 font-semibold px-4 py-1.5 rounded-lg text-sm transition shadow-lg active:scale-95 duration-150 cursor-pointer"
              >
                Sign In
              </button>
              
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-white/5'
              }`}>
                <div className="h-5.5 w-5.5 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center">
                  <User className="h-3 w-3 text-amber-500 animate-pulse" />
                </div>
                <span className={`text-[11px] font-medium max-w-[80px] truncate ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>Demo Mode</span>
              </div>

              <button
                onClick={onLogout}
                title="Leave / Return to Login"
                className={`p-2 rounded-lg border transition active:scale-95 duration-150 cursor-pointer ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-red-50 hover:text-red-650 text-neutral-500 border-neutral-200 hover:border-red-200'
                    : 'bg-neutral-900/50 hover:bg-neutral-900 hover:text-red-400 text-neutral-500 border-white/5 hover:border-red-950'
                }`}
                id="btn-leave-demo"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
                isLight ? 'bg-neutral-100/90 border-neutral-200' : 'bg-neutral-900/90 border-white/5'
              }`}>
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName} 
                  className={`h-6 w-6 rounded-full object-cover border ${isLight ? 'border-amber-500/50' : 'border-amber-500/30'}`}
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden xs:block">
                  <div className={`text-xs font-semibold truncate max-w-[100px] ${isLight ? 'text-neutral-800' : 'text-white'}`}>{profile.displayName}</div>
                  <div className="text-[10px] font-mono text-emerald-500 font-bold leading-none mt-0.5">ONLINE</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Leave / Sign Out"
                className={`p-2 rounded-lg border transition active:scale-95 duration-150 cursor-pointer ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-red-50 hover:text-red-650 text-neutral-500 border-neutral-200 hover:border-red-200'
                    : 'bg-neutral-900/50 hover:bg-neutral-900 hover:text-red-400 text-neutral-500 border-white/5 hover:border-red-950'
                }`}
                id="btn-leave-account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};
