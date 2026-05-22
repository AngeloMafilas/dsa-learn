import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, HelpCircle, Flame, SortAsc, BookOpen, Star, Filter, Circle } from 'lucide-react';
import { Problem, Difficulty, UserProfile } from '../types';
import { dbService } from '../lib/db';

interface ProblemListProps {
  problems: Problem[];
  profile: UserProfile;
  onSelectProblem: (problemId: string) => void;
  theme?: 'dark' | 'light';
}

export const ProblemList: React.FC<ProblemListProps> = ({ problems, profile, onSelectProblem, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Attempted' | 'Unsolved'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficultyFilter, statusFilter, selectedCategory]);

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set(problems.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchSearch = problem.title.toLowerCase().includes(search.toLowerCase()) || 
                          problem.category.toLowerCase().includes(search.toLowerCase());
      
      const matchDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      
      const isSolved = dbService.isProblemSolved(problem.id);
      const isAttempted = dbService.getSubmissions(problem.id).length > 0;
      
      let matchStatus = true;
      if (statusFilter === 'Solved') {
        matchStatus = isSolved;
      } else if (statusFilter === 'Attempted') {
        matchStatus = isAttempted && !isSolved;
      } else if (statusFilter === 'Unsolved') {
        matchStatus = !isSolved;
      }

      const matchCategory = selectedCategory === 'All' || problem.category === selectedCategory;

      return matchSearch && matchDifficulty && matchStatus && matchCategory;
    });
  }, [problems, search, difficultyFilter, statusFilter, selectedCategory]);

  // Paginated partition of problems list
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  }, [filteredProblems]);


  // Statistics calculation for circular SVG ring
  const stats = useMemo(() => {
    const totalEasy = 650;
    const totalMedium = 1200;
    const totalHard = 600;
    const totalAll = totalEasy + totalMedium + totalHard;

    const solvedEasy = profile.solvedCount.Easy;
    const solvedMedium = profile.solvedCount.Medium;
    const solvedHard = profile.solvedCount.Hard;
    const totalSolved = solvedEasy + solvedMedium + solvedHard;

    // SVG dasharray geometry helper
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, (totalSolved / 2450) * 100) / 100) * circumference;

    return {
      totalEasy, totalMedium, totalHard, totalAll,
      solvedEasy, solvedMedium, solvedHard, totalSolved,
      circumference, strokeDashoffset
    };
  }, [profile]);

  return (
    <div className={`mx-auto max-w-7xl px-6 py-8 font-sans min-h-screen select-none transition-all duration-300 ${
      isLight ? 'text-neutral-800' : 'text-neutral-200'
    }`}>
      
      {/* Welcome Hero / Session Title of Lib */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6" id="problems-title-block">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isLight ? 'text-neutral-900 border-neutral-150' : 'text-white'}`}>
            Practice Library
            <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full px-2 py-0.5 font-mono">
              CURATED ALGORITHMS
            </span>
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Build muscle memory on classical computer science algorithms with instantaneous AI sandbox testing.
          </p>
        </div>

        {/* Dynamic Streak Flame indicator */}
        <div className={`flex items-center gap-3 p-3 rounded-xl max-w-xs border transition duration-150 ${
          isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-950 border-neutral-850'
        }`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 shadow">
            <Flame className="h-5.5 w-5.5 fill-red-500 animate-bounce" />
          </div>
          <div className="text-left font-sans">
            <span className="text-[10px] font-mono text-neutral-500 font-bold block uppercase tracking-wider">Active Streak</span>
            <span className={`text-sm font-bold tracking-tight ${isLight ? 'text-neutral-800' : 'text-white'}`}>{profile.streak} Days Practice</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Search + Filters + Problem Table; Right is Interactive Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="problems-grid-layout">
        
        {/* Left Side Panel – 8 Columns out of 12 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Categories Grid Selector (Array, String, Dynamic Programming, Stack) */}
          <div className={`flex flex-wrap gap-1.5 pb-2 border-b overflow-x-auto ${isLight ? 'border-neutral-200' : 'border-neutral-850'}`} id="categories-filter-bar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition capitalize shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : isLight
                      ? 'bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 shadow-sm'
                      : 'bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Topics' : cat}
              </button>
            ))}
          </div>

          {/* Quick Filters: Search Bar, Status Filter, Difficulty filter */}
          <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-950 border-neutral-850'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search target problem or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border focus:border-amber-500 focus:outline-none rounded-lg text-sm transition block ${
                  isLight 
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-850 placeholder-neutral-400 focus:bg-white' 
                    : 'bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-white placeholder-neutral-600'
                }`}
              />
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Difficulty Filter */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition duration-150 ${
                isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-neutral-900 border-neutral-850 text-neutral-500'
              }`}>
                <span className="text-neutral-500 font-medium">Difficulty:</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as any)}
                  className={`bg-transparent font-semibold focus:outline-none cursor-pointer pr-1 ${isLight ? 'text-neutral-750' : 'text-white'}`}
                >
                  <option value="All" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>All</option>
                  <option value="Easy" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Easy</option>
                  <option value="Medium" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Medium</option>
                  <option value="Hard" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Hard</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition duration-150 ${
                isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-neutral-900 border-neutral-850 text-neutral-500'
              }`}>
                <span className="text-neutral-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`bg-transparent font-semibold focus:outline-none cursor-pointer pr-1 ${isLight ? 'text-neutral-750' : 'text-white'}`}
                >
                  <option value="All" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>All</option>
                  <option value="Solved" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Solved</option>
                  <option value="Attempted" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Attempted</option>
                  <option value="Unsolved" className={isLight ? 'bg-white text-neutral-850' : 'bg-neutral-950 text-white'}>Unsolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Problems List Table */}
          <div className={`overflow-hidden rounded-xl border transition-all duration-300 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm shadow-neutral-100/40' : 'bg-neutral-950 border-neutral-850 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left font-sans text-xs">
                
                {/* Table Header */}
                <thead className={`uppercase font-mono text-[10px] tracking-wider select-none border-b transition duration-150 ${
                  isLight 
                    ? 'bg-neutral-50/60 text-neutral-500 border-neutral-200 font-bold' 
                    : 'bg-neutral-900/60 text-neutral-500 border-neutral-850'
                }`}>
                  <tr>
                    <th className="py-3 px-4 text-center w-12">Status</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 w-28">Topic</th>
                    <th className="py-3 px-4 w-24">Acceptance</th>
                    <th className="py-3 px-4 w-24">Difficulty</th>
                    <th className="py-3 px-4 w-32">Frequency</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className={`divide-y transition duration-150 ${
                  isLight ? 'divide-neutral-200/60' : 'divide-neutral-850/80'
                }`}>
                  {paginatedProblems.length > 0 ? (
                    paginatedProblems.map((problem) => {
                      const isSolved = dbService.isProblemSolved(problem.id);
                      const submissionsCount = dbService.getSubmissions(problem.id).length;
                      
                      return (
                        <tr 
                          key={problem.id}
                          onClick={() => onSelectProblem(problem.id)}
                          className={`group cursor-pointer transition duration-150 select-none ${
                            isLight ? 'hover:bg-neutral-50/80 bg-white' : 'hover:bg-neutral-900/50'
                          }`}
                        >
                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center">
                            {isSolved ? (
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 mx-auto fill-emerald-500/10" />
                            ) : submissionsCount > 0 ? (
                              <Circle className="h-4.5 w-4.5 text-amber-500 mx-auto fill-amber-500/10 stroke-[2.5]" />
                            ) : (
                              <Circle className={`h-4.5 w-4.5 mx-auto ${isLight ? 'text-neutral-300 stroke-[1.5]' : 'text-neutral-700 stroke-[1.5]'}`} />
                            )}
                          </td>

                          {/* Problem Title link */}
                          <td className="py-4 px-4">
                            <span className={`font-semibold group-hover:text-amber-500 transition text-sm ${
                              isLight ? 'text-neutral-800' : 'text-neutral-200'
                            }`}>
                              {problem.title}
                            </span>
                          </td>

                          {/* Topic / Category Tag */}
                          <td className="py-4 px-4">
                            <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                              isLight 
                                ? 'bg-neutral-50 border-neutral-200 text-neutral-605' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                            }`}>
                              {problem.category}
                            </span>
                          </td>

                          {/* Acceptance rates */}
                          <td className={`py-4 px-4 font-mono font-medium ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}>
                            {problem.acceptanceRate}
                          </td>

                          {/* Difficulty Level with color coding */}
                          <td className="py-4 px-4 font-semibold">
                            <span className={
                              problem.difficulty === 'Easy' ? 'text-emerald-500' :
                              problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'
                            }>
                              {problem.difficulty}
                            </span>
                          </td>

                          {/* Frequency distribution index (Leetcode locked items look) */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-16 h-1.5 rounded-full overflow-hidden border ${
                                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800/40'
                              }`}>
                                <div 
                                  className="bg-neutral-600 h-full rounded-full group-hover:bg-amber-500 transition-colors duration-200"
                                  style={{ width: `${problem.frequencyProgress}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-mono font-bold transition-colors duration-200 ${
                                isLight 
                                  ? 'text-neutral-400 group-hover:text-neutral-600' 
                                  : 'text-neutral-600 group-hover:text-neutral-400'
                              }`}>
                                {problem.frequencyProgress}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500 font-sans">
                        <HelpCircle className="h-10 w-10 mx-auto mb-3 text-neutral-700 stroke-1" />
                        <div className="text-sm font-semibold">No problems match criteria</div>
                        <p className="text-xs text-neutral-600 mt-1">Try relaxing filters or search terms.</p>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

        </div>

        {/* Right Side Panel – 4 Columns out of 12 (Stats Circular dials + Topic cards) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Circular Progress Solved Stats Card */}
          <div className={`rounded-xl border p-6 flex flex-col justify-between transition duration-150 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-950 border-neutral-850'
          }`} id="side-stats-card">
            <h3 className={`font-sans text-xs font-bold tracking-wider uppercase mb-5 flex items-center gap-2 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              <BookOpen className="h-4 w-4 text-amber-500" />
              Progress Tracker
            </h3>

            <div className="flex items-center justify-between gap-6">
              {/* LeetCode Solved Circular SVG layout */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="h-28 w-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="42"
                    stroke={isLight ? '#F1F5F9' : '#1E1E24'}
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="42"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={stats.circumference}
                    strokeDashoffset={stats.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                {/* Overlay Text */}
                <div className="absolute flex flex-col items-center justify-center text-center font-sans">
                  <span className={`text-xl font-bold select-none leading-none ${isLight ? 'text-neutral-850' : 'text-white'}`}>{stats.totalSolved}</span>
                  <span className={`text-[8px] font-mono leading-none font-bold uppercase mt-0.5 tracking-wider ${
                    isLight ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>Solved</span>
                  <span className={`text-[9px] font-mono mt-1 select-none ${isLight ? 'text-neutral-400' : 'text-neutral-600'}`}>/ 2450</span>
                </div>
              </div>

              {/* Progress bars split by Difficulty */}
              <div className="flex-1 space-y-3 font-sans">
                {/* Easy */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                    <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Easy</span>
                    <span className={`leading-none ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      <strong className={isLight ? 'text-neutral-800' : 'text-neutral-100'}>{stats.solvedEasy}</strong> / {stats.totalEasy}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden border ${isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-850'}`}>
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stats.solvedEasy / stats.totalEasy) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                    <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Medium</span>
                    <span className={`leading-none ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      <strong className={isLight ? 'text-neutral-800' : 'text-neutral-100'}>{stats.solvedMedium}</strong> / {stats.totalMedium}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden border ${isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-850'}`}>
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stats.solvedMedium / stats.totalMedium) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                    <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Hard</span>
                    <span className={`leading-none ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      <strong className={isLight ? 'text-neutral-800' : 'text-neutral-100'}>{stats.solvedHard}</strong> / {stats.totalHard}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden border ${isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-850'}`}>
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stats.solvedHard / stats.totalHard) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Info Platform Guidelines block */}
          <div className={`rounded-xl border p-6 space-y-4 transition duration-150 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-950 border-neutral-850'
          }`} id="side-guides-card">
            <h3 className={`font-sans text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              <Star className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
              Platform Guidelines
            </h3>
            
            <ul className={`space-y-3.5 text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              <li className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold">1</span>
                <span>Select any algorithms from the library of 11 classic curated tests.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold">2</span>
                <span>Code in standard editors with instant dynamic templates for Python, JS, C++, or Java.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold">3</span>
                <span>Click **Run** to dry-test your code against default bounds, or **Submit** to commit a live database entry.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
