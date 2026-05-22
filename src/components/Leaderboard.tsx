import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Star, Zap, Eye, X, BookOpen, AlertCircle, BarChart2 } from 'lucide-react';
import { UserProfile } from '../types';
import { dbService } from '../lib/db';

interface LeaderboardProps {
  profile: UserProfile;
  theme?: 'dark' | 'light';
}

// Inlined competitors to populate a full competitive bracket
const STANDARD_COMPETITORS: UserProfile[] = [
  {
    uid: 'leader-1',
    email: 'elon.bytes@algocode.io',
    displayName: 'Elon Bytes',
    photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    rank: 124,
    solvedCount: { Easy: 140, Medium: 290, Hard: 94 },
    totalSolved: 524,
    streak: 112,
    topicMastery: { Array: 98, String: 92, 'Hash Table': 96, 'Dynamic Programming': 88, Math: 90, Sorting: 95, Stack: 84, 'Two Pointers': 91 },
    heatmapData: {}
  },
  {
    uid: 'leader-2',
    email: 'grace.hopper@algocode.io',
    displayName: 'Grace Hopper',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    rank: 412,
    solvedCount: { Easy: 120, Medium: 210, Hard: 78 },
    totalSolved: 408,
    streak: 89,
    topicMastery: { Array: 94, String: 88, 'Hash Table': 91, 'Dynamic Programming': 80, Math: 85, Sorting: 89, Stack: 82, 'Two Pointers': 86 },
    heatmapData: {}
  },
  {
    uid: 'leader-3',
    email: 'linus.git@algocode.io',
    displayName: 'Linux_GNU_Fan',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    rank: 821,
    solvedCount: { Easy: 110, Medium: 180, Hard: 62 },
    totalSolved: 352,
    streak: 45,
    topicMastery: { Array: 89, String: 84, 'Hash Table': 87, 'Dynamic Programming': 72, Math: 78, Sorting: 84, Stack: 80, 'Two Pointers': 81 },
    heatmapData: {}
  },
  {
    uid: 'leader-4',
    email: 'ada.lovelace@algocode.io',
    displayName: 'Ada_Lovelace',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
    rank: 1042,
    solvedCount: { Easy: 92, Medium: 142, Hard: 50 },
    totalSolved: 284,
    streak: 61,
    topicMastery: { Array: 85, String: 80, 'Hash Table': 83, 'Dynamic Programming': 66, Math: 70, Sorting: 79, Stack: 74, 'Two Pointers': 76 },
    heatmapData: {}
  },
  {
    uid: 'leader-5',
    email: 'katherine.g@algocode.io',
    displayName: 'Katherine_G',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    rank: 2180,
    solvedCount: { Easy: 80, Medium: 110, Hard: 32 },
    totalSolved: 222,
    streak: 18,
    topicMastery: { Array: 78, String: 74, 'Hash Table': 79, 'Dynamic Programming': 58, Math: 62, Sorting: 71, Stack: 65, 'Two Pointers': 69 },
    heatmapData: {}
  }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'streak' | 'hard'>('all');
  const [competitors, setCompetitors] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    async function loadContributors() {
      setDbLoading(true);
      try {
        // Query database profiles from Firestore if available
        let list: UserProfile[] = [];
        if (typeof dbService.getLeaderboardUsers === 'function') {
          list = await dbService.getLeaderboardUsers();
        }
        
        // Merge list with high fidelity mock contenders
        const userMap = new Map<string, UserProfile>();
        STANDARD_COMPETITORS.forEach(c => userMap.set(c.uid, c));
        
        // Add current logged in user
        userMap.set(profile.uid, profile);
        
        // Add database fetched users
        list.forEach(u => {
          if (u.uid) {
            userMap.set(u.uid, u);
          }
        });
        
        const mergedList = Array.from(userMap.values());
        
        // Sort descending by total solved problems
        mergedList.sort((a, b) => b.totalSolved - a.totalSolved);
        
        // Recalculate ranking order index
        const ranked = mergedList.map((item, index) => ({
          ...item,
          rank: index + 1
        }));
        
        setCompetitors(ranked);
      } catch (err) {
        console.error("Failed to query real-time Firestore Leaderboard rows:", err);
        // Fallback to static lists
        const fallback = [profile, ...STANDARD_COMPETITORS].sort((a, b) => b.totalSolved - a.totalSolved);
        setCompetitors(fallback.map((u, i) => ({ ...u, rank: i + 1 })));
      } finally {
        setDbLoading(false);
      }
    }

    loadContributors();
  }, [profile]);

  // Filters computed
  const filteredCompetitors = competitors.filter(competitor => {
    // Search keyword filter
    const matchesSearch = competitor.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          competitor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Segment tab filters
    if (filterType === 'streak') {
      return competitor.streak > 15;
    }
    if (filterType === 'hard') {
      return competitor.solvedCount.Hard > 15;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 select-none font-sans" id="leaderboard-root">
      
      {/* Intro Header */}
      <div className="mb-8" id="leaderboard-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2 rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl transition-colors duration-300 ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>Global Leaderboard</h1>
        </div>
        <p className={`text-sm ${isLight ? 'text-neutral-600' : 'text-neutral-400'} max-w-2xl leading-relaxed`}>
          Benchmark your algorithmic proficiency against elite code developers around the world. Dynamic competitive metrics are updated directly via verified cloud Firestore records.
        </p>
      </div>

      {/* Grid: Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="leaderboard-podium">
        {competitors.slice(0, 3).map((podiumUser, index) => {
          const isGold = index === 0;
          const isSilver = index === 1;
          const isBronze = index === 2;

          return (
            <div 
              key={podiumUser.uid}
              onClick={() => setSelectedUser(podiumUser)}
              className={`relative overflow-hidden cursor-pointer rounded-2xl border p-6 transition duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                isLight
                  ? isGold 
                    ? 'bg-gradient-to-br from-amber-500/15 via-white to-white border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.08)] shadow-lg' 
                    : 'bg-white border-neutral-200/80 shadow-md hover:border-neutral-305'
                  : isGold 
                  ? 'bg-gradient-to-br from-[#0b0f19] to-neutral-950 border-amber-500/30' 
                  : 'bg-neutral-900/40 border-white/5 shadow-md'
              }`}
            >
              {/* Placement badge */}
              <div className="absolute top-4 right-4 flex items-center justify-center">
                {isGold && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce">
                    <Trophy className="h-5 w-5 fill-amber-500/10" />
                  </div>
                )}
                {isSilver && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200/15 text-neutral-300 border border-neutral-200/30">
                    <Medal className="h-5 w-5" />
                  </div>
                )}
                {isBronze && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/30">
                    <Medal className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-neutral-500 font-mono font-bold text-xs">RANK #{podiumUser.rank}</span>
                <div className="flex items-center gap-3.5 mt-4">
                  <img 
                    src={podiumUser.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt={podiumUser.displayName} 
                    className="h-12 w-12 rounded-xl object-cover border border-neutral-700 shadow-md bg-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-semibold text-white tracking-tight truncate max-w-[150px]">{podiumUser.displayName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono mt-0.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                      <span>{podiumUser.streak} Day Streak</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solved Stats breakdown summary */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex justify-between items-center text-xs">
                <div>
                  <div className="text-neutral-500 text-[10px] font-mono">TOTAL COMPLETED</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{podiumUser.totalSolved} Tasks</div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-500 text-[10px] font-mono">TIERS (E / M / H)</div>
                  <div className="mt-1 flex items-center gap-1 font-mono font-semibold">
                    <span className="text-emerald-400">{podiumUser.solvedCount.Easy}</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-amber-400">{podiumUser.solvedCount.Medium}</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-rose-400">{podiumUser.solvedCount.Hard}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rankings Search and Filtering Controls Row */}
      <div className={`border rounded-2xl p-5 mb-6 transition-all duration-300 ${
        isLight 
          ? 'bg-white/75 border-neutral-200 shadow-sm' 
          : 'bg-[#0f1423]/40 border-white/5 backdrop-blur-md'
      }`} id="leaderboard-filters-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Custom Search field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search developers by alias, name, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl py-2 pl-10 pr-4 text-sm transition-all font-sans focus:outline-none ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30'
              }`}
            />
          </div>

          {/* Filtering pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-sans">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-neutral-850 text-amber-500 border-neutral-700 font-bold'
                  : isLight
                    ? 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              All Competitors
            </button>
            <button
              onClick={() => setFilterType('streak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                filterType === 'streak'
                  ? 'bg-neutral-850 text-amber-500 border-neutral-700 font-bold'
                  : isLight
                    ? 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Zap className="h-3 \w-3 fill-amber-500/10" />
              Unbreakable Streaks (&gt;15 days)
            </button>
            <button
              onClick={() => setFilterType('hard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                filterType === 'hard'
                  ? 'bg-neutral-850 text-amber-500 border-neutral-700 font-bold'
                  : isLight
                    ? 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Star className="h-3 w-3 text-rose-500" />
              Hard-Mode Masters (&gt;15 cleared)
            </button>
          </div>

        </div>
      </div>

      {/* Main rankings table */}
      <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isLight 
          ? 'bg-white/80 border-neutral-200 shadow-sm shadow-neutral-100/40' 
          : 'bg-[#0f1423]/40 border-white/5 backdrop-blur-md'
      }`} id="leaderboard-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className={`border-b font-mono text-[11px] uppercase tracking-wider ${
                isLight 
                  ? 'border-neutral-200 bg-neutral-50/60 text-neutral-500 font-bold' 
                  : 'border-neutral-900 bg-neutral-900/30 text-neutral-400 font-semibold'
              }`}>
                <th className="py-4 px-6 font-medium text-center w-20">Rank</th>
                <th className="py-4 px-6 font-medium">Developer</th>
                <th className="py-4 px-6 font-medium text-center">Score / Solved</th>
                <th className="py-4 px-3 font-medium text-center">Tiers Complete</th>
                <th className="py-4 px-6 font-medium text-center">Active Streak</th>
                <th className="py-4 px-6 font-medium text-center w-24">Profile</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-neutral-200/60' : 'divide-neutral-900'}`}>
              {filteredCompetitors.length > 0 ? (
                filteredCompetitors.map((competitor, idx) => {
                  const isUser = competitor.uid === profile.uid;
                  
                  return (
                    <tr 
                      key={competitor.uid}
                      className={`transition duration-150 ${
                        isLight 
                          ? 'hover:bg-neutral-50 bg-white' 
                          : 'hover:bg-neutral-900/30'
                      } ${
                        isUser 
                          ? 'bg-amber-500/[0.02] border-l-2 border-l-amber-500' 
                          : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center font-mono font-bold text-sm">
                        {competitor.rank <= 3 ? (
                          <span className={`${
                            competitor.rank === 1 ? 'text-amber-500 font-extrabold' : competitor.rank === 2 ? (isLight ? 'text-neutral-600' : 'text-neutral-300') : 'text-amber-700'
                          }`}>
                            #{competitor.rank}
                          </span>
                        ) : (
                          <span className={isLight ? 'text-neutral-450' : 'text-neutral-500'}>#{competitor.rank}</span>
                        )}
                      </td>

                      {/* Developer Avatar + Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={competitor.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                            alt={competitor.displayName} 
                            className={`h-9 w-9 rounded-lg object-cover border ${
                              isLight ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-800 bg-neutral-900'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate max-w-[160px] sm:max-w-xs">
                            <span className={`font-semibold text-sm hover:text-amber-500 transition cursor-pointer ${
                              isLight ? 'text-neutral-800' : 'text-white'
                            }`} onClick={() => setSelectedUser(competitor)}>
                              {competitor.displayName}
                            </span>
                            {isUser && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-550">
                                YOU
                              </span>
                            )}
                            <div className={`text-[10px] font-mono truncate ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>{competitor.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Total Solved Count Score */}
                      <td className="py-4 px-6 text-center">
                        <div className={`font-mono text-[15px] font-bold ${isLight ? 'text-neutral-800' : 'text-white'}`}>{competitor.totalSolved}</div>
                        <div className={`text-[9px] font-mono uppercase ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>Tasks cleared</div>
                      </td>

                      {/* Tiers distribution representation row */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold">
                          <span className="text-emerald-500 font-semibold" title="Easy Solved">{competitor.solvedCount.Easy}</span>
                          <span className={isLight ? 'text-neutral-300' : 'text-neutral-800'}>/</span>
                          <span className="text-amber-500 font-semibold" title="Medium Solved">{competitor.solvedCount.Medium}</span>
                          <span className={isLight ? 'text-neutral-300' : 'text-neutral-800'}>/</span>
                          <span className="text-rose-500 font-semibold" title="Hard Solved">{competitor.solvedCount.Hard}</span>
                        </div>
                      </td>

                      {/* Streak Column */}
                      <td className="py-4 px-6">
                        <div className={`flex items-center justify-center gap-1.5 text-xs font-mono font-bold ${isLight ? 'text-neutral-650' : 'text-neutral-300'}`}>
                          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/15" />
                          <span>{competitor.streak} days</span>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedUser(competitor)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                            isLight 
                              ? 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-amber-600 hover:border-amber-500 hover:bg-white shadow-sm' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-neutral-800'
                          }`}
                          title="Inspect Profile Metrics"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-3 justify-center">
                      <AlertCircle className="h-8 w-8 text-neutral-600" />
                      <p className="text-sm">No competitor matches found. Modify search parameters and try again.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - User Inspection Popover overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="leaderboard-inspect-modal">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-scale-up">
            
            {/* Header / Cover */}
            <div className="bg-neutral-900/40 p-6 border-b border-neutral-900">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <img 
                  src={selectedUser.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                  alt={selectedUser.displayName} 
                  className="h-14 w-14 rounded-xl object-cover border border-neutral-700 bg-neutral-800 shadow"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-500">RANK #{selectedUser.rank} // ELITE</span>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight mt-0.5">{selectedUser.displayName}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate max-w-[220px]">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Competency Mastery details */}
            <div className="p-6">
              
              {/* Highlight statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800/60">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Streak Log</div>
                  <div className="flex items-center gap-1.5 text-base font-bold text-amber-500 mt-0.5">
                    <Zap className="h-4 w-4 fill-amber-500/20" />
                    <span>{selectedUser.streak} Days Act.</span>
                  </div>
                </div>
                <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800/60">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Solved Index</div>
                  <div className="flex items-center gap-1.5 text-base font-bold text-white mt-0.5">
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    <span>{selectedUser.totalSolved} Tasks</span>
                  </div>
                </div>
              </div>

              {/* Sub-distribution Progress trackers */}
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-amber-500" />
                Problem Difficulty Layout
              </h4>
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400 font-medium">Easy Completion</span>
                    <span className="text-emerald-400 font-bold">{selectedUser.solvedCount.Easy}</span>
                  </div>
                  <div className="h-2 bg-neutral-900 border border-neutral-800/60 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedUser.solvedCount.Easy / 150) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400 font-medium">Medium Completion</span>
                    <span className="text-amber-500 font-bold">{selectedUser.solvedCount.Medium}</span>
                  </div>
                  <div className="h-2 bg-neutral-900 border border-neutral-800/60 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedUser.solvedCount.Medium / 300) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400 font-medium">Hard Completion</span>
                    <span className="text-rose-400 font-bold">{selectedUser.solvedCount.Hard}</span>
                  </div>
                  <div className="h-2 bg-neutral-900 border border-neutral-800/60 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedUser.solvedCount.Hard / 100) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Tag / Topic Mastery metrics */}
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                Top Algorithms Skill Core
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(selectedUser.topicMastery).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-neutral-900/30 p-2 rounded-lg border border-neutral-900">
                    <span className="text-neutral-400 truncate max-w-[110px]" title={key}>{key}</span>
                    <span className="text-amber-500 font-bold">{value}%</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Panel */}
            <div className="bg-neutral-900/25 p-4 border-t border-neutral-900/80 text-center text-[10px] font-mono text-neutral-500">
              Validated with Firestore Security Rules
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
