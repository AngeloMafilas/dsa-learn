import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { ProblemList } from './components/ProblemList';
import { ProfileDashboard } from './components/ProfileDashboard';
import { CodeWorkspace } from './components/CodeWorkspace';
import { Contests } from './components/Contests';
import { Leaderboard } from './components/Leaderboard';
import { DiscussForum } from './components/DiscussForum';
import { Settings } from './components/Settings';
import { dbService } from './lib/db';
import { UserProfile, Problem } from './types';
import { problemsList } from './data/problems';

export default function App() {
  const [currentTab, setTab] = useState<string>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile>(() => dbService.getProfile());
  const [sessionActive, setSessionActive] = useState<boolean>(() => {
    return localStorage.getItem('algocode_session_active') === 'true';
  });
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    return localStorage.getItem('algocode_session_active') !== 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('algocode_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('algocode_theme', newTheme);
  };

  // Subscribe to real-time database and auth state changes
  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      const profile = dbService.getProfile();
      setActiveProfile({ ...profile });
      if (profile.uid !== 'alex-rivera-default-uid') {
        setSessionActive(true);
        localStorage.setItem('algocode_session_active', 'true');
        setIsLoginOpen(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!sessionActive) {
      setIsLoginOpen(true);
    }
  }, [sessionActive]);

  // Sync state cleanly
  const handleProfileRefresh = () => {
    setActiveProfile({ ...dbService.getProfile() });
  };

  const handleDemoLogin = () => {
    setSessionActive(true);
    localStorage.setItem('algocode_session_active', 'true');
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to leave and return to the login screen?")) {
      await dbService.logoutUser();
      localStorage.setItem('algocode_session_active', 'false');
      setSessionActive(false);
      handleProfileRefresh();
      setTab('problems');
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setSessionActive(true);
    localStorage.setItem('algocode_session_active', 'true');
    setActiveProfile(profile);
    handleProfileRefresh();
    setIsLoginOpen(false);
  };

  const [allProblems, setAllProblems] = useState<Problem[]>(problemsList);
  const [currentProblemDetails, setCurrentProblemDetails] = useState<Problem | null>(null);

  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok' && data.problems) {
          // Place the static curated 11 items at the top or just replace all
          // We'll replace all since the backend has all 2913.
          setAllProblems(data.problems as Problem[]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProblemId) {
      const localProb = problemsList.find(p => p.id === selectedProblemId);
      fetch(`/api/problems/${selectedProblemId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ok' && data.problem) {
            setCurrentProblemDetails(data.problem as Problem);
          } else if (localProb) {
            setCurrentProblemDetails(localProb);
          }
        })
        .catch(err => {
          console.error(err);
          if (localProb) setCurrentProblemDetails(localProb);
        });
    }
  }, [selectedProblemId]);

  // Find active problem mapping helper
  const activeProblem = useState<Problem | null>(null);
  const currentProblem = currentProblemDetails || problemsList.find(p => p.id === selectedProblemId) || problemsList[0];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#ebd3be]/10 text-neutral-800' : 'bg-gradient-to-br from-[#07090e] via-[#0b0f19] to-[#080b13] text-neutral-100'} transition-all duration-300 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-900`}>
      
      {/* Top Main Navigation Header Bar */}
      <Navbar
        currentTab={currentTab}
        setTab={(tab) => {
          setTab(tab);
          if (tab !== 'workspace') {
            setSelectedProblemId(null);
          }
        }}
        profile={activeProfile}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container screen content */}
      <main className="flex-1 w-full relative">
        {currentTab === 'problems' && (
          <div className="animate-fade-in duration-300">
            <ProblemList
              problems={allProblems}
              profile={activeProfile}
              onSelectProblem={(id) => {
                setSelectedProblemId(id);
                setTab('workspace');
              }}
              theme={theme}
            />
          </div>
        )}

        {currentTab === 'contests' && (
          <div className="animate-fade-in duration-300">
            <Contests
              profile={activeProfile}
              onSelectProblem={(id) => {
                setSelectedProblemId(id);
                setTab('workspace');
              }}
              setTab={setTab}
              theme={theme}
            />
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="animate-fade-in duration-300">
            <Leaderboard
              profile={activeProfile}
              theme={theme}
            />
          </div>
        )}

        {currentTab === 'discuss' && (
          <div className="animate-fade-in duration-300">
            <DiscussForum
              profile={activeProfile}
              theme={theme}
            />
          </div>
        )}

        {currentTab === 'dashboard' && (
          <div className="animate-fade-in duration-300">
            <ProfileDashboard
              profile={activeProfile}
              theme={theme}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="animate-fade-in duration-300">
            <Settings
              profile={activeProfile}
              onRefreshProfile={handleProfileRefresh}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        )}

        {currentTab === 'workspace' && selectedProblemId && (
          <div className="animate-fade-in duration-300 font-sans">
            <CodeWorkspace
              problem={currentProblem}
              onBackToLibrary={() => {
                setTab('problems');
                setSelectedProblemId(null);
              }}
              onSubmissionSuccess={handleProfileRefresh}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Under footer simple branding - clean and minimal, no system indicators/terminals larping */}
      <footer className={`py-6 border-t ${theme === 'light' ? 'border-neutral-200 bg-[#f8fafc]' : 'border-neutral-900 bg-[#080b13]'} text-center text-[11px] font-mono text-neutral-500 select-none`}>
        <div>
          &copy; {new Date().getFullYear()} AlgoCode Corporation. Verified Sandboxed Engine.
        </div>
      </footer>

      {/* Register / Sign In modal layer */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        showCloseButton={sessionActive}
        onDemoLogin={!sessionActive ? handleDemoLogin : undefined}
      />

    </div>
  );
}
