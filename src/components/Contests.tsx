import React, { useState, useEffect } from 'react';
import { Calendar, Users, HelpCircle, Trophy, Medal, Star, Zap, Clock, Sparkles, CheckCircle, Flame, ArrowRight, Play, Hourglass } from 'lucide-react';
import { UserProfile } from '../types';

interface ContestsProps {
  profile: UserProfile;
  onSelectProblem?: (id: string) => void;
  setTab?: (tab: string) => void;
}

interface CodingContest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  startTimeStr: string;
  durationMins: number;
  participantsCount: number;
  featuredChallenges: { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[];
  isRegistered?: boolean;
}

const PAST_CONTESTS: CodingContest[] = [
  {
    id: 'contest-past-1',
    title: 'AlgoCode Weekly Contest 108',
    description: 'A classic 4-challenge dynamic sequence. Ideal practice for binary searches and advanced greedy intervals.',
    status: 'completed',
    startTimeStr: '2026-05-18T18:00:00Z',
    durationMins: 90,
    participantsCount: 4210,
    featuredChallenges: [
      { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
      { id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' },
      { id: 'edit-distance', title: 'Edit Distance', difficulty: 'Hard' }
    ]
  },
  {
    id: 'contest-past-2',
    title: 'AlgoCode Star Bi-weekly Challenge 54',
    description: 'Graph routing round designed by system engineers to test cache validity and recursive lookup limits.',
    status: 'completed',
    startTimeStr: '2026-05-10T12:00:00Z',
    durationMins: 120,
    participantsCount: 3102,
    featuredChallenges: [
      { id: 'reverse-string', title: 'Reverse String', difficulty: 'Easy' },
      { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
      { id: 'container-water', title: 'Container With Most Water', difficulty: 'Medium' }
    ]
  }
];

export const Contests: React.FC<ContestsProps> = ({ profile, onSelectProblem, setTab }) => {
  const [activeContests, setActiveContests] = useState<CodingContest[]>([
    {
      id: 'contest-up-1',
      title: 'AlgoCode Weekly Contest 109',
      description: 'Prepare your recursion trees and dynamic pointers. Features 3 brand-new algorithm challenges with extra leaderboard ranking multipliers.',
      status: 'upcoming',
      startTimeStr: new Date(Date.now() + 3600000 * 3.5 + 45000).toISOString(), // Starts in 3h 30m
      durationMins: 90,
      participantsCount: 1845,
      featuredChallenges: [
        { id: 'palindrome-number', title: 'Palindrome Number', difficulty: 'Easy' },
        { id: 'longest-substring', title: 'Longest Substring', difficulty: 'Medium' },
        { id: 'edit-distance', title: 'Edit Distance', difficulty: 'Hard' }
      ],
      isRegistered: false
    },
    {
      id: 'contest-up-2',
      title: 'AlgoCode Bi-weekly Spring Cup 55',
      description: 'The Spring edition featuring deep stack structures & complex sorting optimizations. Top 3 competitors win a premium badge!',
      status: 'upcoming',
      startTimeStr: new Date(Date.now() + 3600000 * 24 * 2 + 12000).toISOString(), // Starts in 2 days
      durationMins: 120,
      participantsCount: 840,
      featuredChallenges: [
        { id: 'reverse-string', title: 'Reverse String', difficulty: 'Easy' },
        { id: 'container-water', title: 'Container With Most Water', difficulty: 'Medium' },
        { id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' }
      ],
      isRegistered: false
    }
  ]);

  // Target timers countdown representation
  const [timers, setTimers] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers: Record<string, string> = {};
      
      activeContests.forEach(contest => {
        const diffMs = new Date(contest.startTimeStr).getTime() - Date.now();
        if (diffMs <= 0) {
          updatedTimers[contest.id] = 'Active Now';
        } else {
          const totalSeconds = Math.floor(diffMs / 1000);
          const days = Math.floor(totalSeconds / 86400);
          const hours = Math.floor((totalSeconds % 86400) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          let str = '';
          if (days > 0) str += `${days}d `;
          str += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
          updatedTimers[contest.id] = str;
        }
      });
      
      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeContests]);

  const handleRegister = (id: string) => {
    setActiveContests(activeContests.map(c => {
      if (c.id === id) {
        const check = c.isRegistered;
        return {
          ...c,
          participantsCount: check ? c.participantsCount - 1 : c.participantsCount + 1,
          isRegistered: !check
        };
      }
      return c;
    }));
  };

  const handleLaunchChallenge = (problemId: string) => {
    if (onSelectProblem && setTab) {
      onSelectProblem(problemId);
      setTab('workspace');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 select-none font-sans" id="contests-root animate-fade-in">
      
      {/* Page Intro Banner Section */}
      <div className="mb-8" id="contests-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2 rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Competitive Contests</h1>
        </div>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Solve 3–4 brand-new coding challenges under strict countdown limits! Rank high on the local leaderboard to earn multiplier rating adjustments and legendary status badges.
        </p>
      </div>

      {/* Grid: Upcoming coding combat rounds */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-neutral-200 mb-4 flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-amber-500 shrink-0" />
          Upcoming Arena Tournaments
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeContests.map((contest) => (
            <div 
              key={contest.id}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-neutral-800 transition duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Flame className="h-3.5 w-3.5" />
                    REGISTERING NOW
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{contest.durationMins} Mins duration</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mb-2 pr-4">{contest.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">{contest.description}</p>
                
                {/* Stats list */}
                <div className="flex items-center gap-4 text-xs font-mono mb-6">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Users className="h-4 w-4 text-neutral-500" />
                    <span>{contest.participantsCount} developers signed up</span>
                  </div>
                </div>
              </div>

              {/* Controls timer bracket row */}
              <div className="pt-4 border-t border-neutral-900/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                <div>
                  <div className="text-neutral-500 text-[10px] font-mono uppercase tracking-wide">TIME REMAINING TO CHAT</div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5" id={`timer-${contest.id}`}>
                    {timers[contest.id] || 'Loading...'}
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(contest.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition active:scale-95 duration-100 ${
                    contest.isRegistered
                      ? 'bg-neutral-900 border border-neutral-800 text-amber-500'
                      : 'bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold'
                  }`}
                >
                  {contest.isRegistered ? 'Registered (Leave Contest)' : 'Free Registration'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Past completed tournaments */}
      <div>
        <h2 className="text-base font-bold text-neutral-200 mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          Completed Contests Summary
        </h2>

        <div className="space-y-4">
          {PAST_CONTESTS.map((contest) => (
            <div 
              key={contest.id}
              className="bg-neutral-950 border border-neutral-900/60 rounded-2xl p-5 md:p-6 text-left hover:border-neutral-800 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-neutral-900 border border-neutral-850 text-neutral-400">
                      VIRTUAL ARENA
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Completed {new Date(contest.startTimeStr).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight mb-1.5">{contest.title}</h3>
                  <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">{contest.description}</p>
                </div>

                {/* Score stats */}
                <div className="flex items-center gap-6 md:text-right text-xs font-mono whitespace-nowrap">
                  <div>
                    <div className="text-neutral-500 text-[10px] uppercase">RIVAL PARTICIPANTS</div>
                    <div className="text-sm font-bold text-white mt-0.5">{contest.participantsCount} Devs</div>
                  </div>

                  <div>
                    <div className="text-neutral-500 text-[10px] uppercase">DURATION</div>
                    <div className="text-sm font-bold text-white mt-0.5">{contest.durationMins} Mins</div>
                  </div>
                </div>

              </div>

              {/* Contest challenges review inlined link list */}
              <div className="mt-5 pt-4 border-t border-neutral-900/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
                  <span className="text-neutral-500 uppercase tracking-widest text-[9px]">SOLVE & PRACTICE CHALLENGES:</span>
                  {contest.featuredChallenges.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleLaunchChallenge(task.id)}
                      className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-amber-500 hover:border-amber-500/40 transition cursor-pointer"
                    >
                      {task.title} <span className={`ml-1 text-[10px] py-px px-1 rounded ${
                        task.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/5' : task.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/5' : 'text-rose-400 bg-rose-500/5'
                      }`}>{task.difficulty}</span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                  Virtual practice gives full leaderboard XP.
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
