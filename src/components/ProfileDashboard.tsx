import React, { useMemo } from 'react';
import { Calendar, User, Award, Flame, Zap, BarChart3, Clock, Compass, Grid3X3, BookOpen } from 'lucide-react';
import { UserProfile, Submission } from '../types';
import { dbService } from '../lib/db';

interface ProfileDashboardProps {
  profile: UserProfile;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ profile }) => {
  const submissions = useMemo(() => dbService.getSubmissions(), [profile]);

  // Heatmap generation logic
  const heatmapGrid = useMemo(() => {
    const today = new Date();
    const grid: { dateStr: string; dayOfWeek: number; count: number; monthName?: string }[][] = [];
    
    // Create 53 weeks (columns) of 7 days (rows)
    // Start from the Sunday 53 weeks ago
    const startOffset = 364 + today.getDay(); // Go back 52 full weeks plus offset to Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - startOffset);

    let currentDayStr = '';
    
    for (let w = 0; w < 53; w++) {
      const week: { dateStr: string; dayOfWeek: number; count: number; monthName?: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(startDate);
        dateObj.setDate(startDate.getDate() + (w * 7) + d);
        
        const dateStr = dateObj.toISOString().split('T')[0];
        const count = profile.heatmapData[dateStr] || 0;
        
        // Month name label placement at the top of first week
        let monthName: string | undefined = undefined;
        if (d === 0 && dateObj.getDate() <= 7) {
          monthName = dateObj.toLocaleString('default', { month: 'short' });
        }

        week.push({
          dateStr,
          dayOfWeek: d,
          count,
          monthName
        });
      }
      grid.push(week);
    }
    return grid;
  }, [profile]);

  // Mastery topics Radar SVG chart parameters
  const radarChart = useMemo(() => {
    const topics = Object.keys(profile.topicMastery);
    const values = Object.values(profile.topicMastery);
    const center = 150;
    const radius = 100;
    const totalSides = topics.length;

    // Helper calculate polygonal node coordinate points on SVG space
    const getCoordinates = (value: number, index: number) => {
      const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2;
      const x = center + (radius * (value / 100)) * Math.cos(angle);
      const y = center + (radius * (value / 100)) * Math.sin(angle);
      return { x, y };
    };

    // Polygonal outline coordinates representing background grid rings at 25%, 50%, 75%, 100%
    const gridRings = [25, 50, 75, 100].map(level => {
      return topics.map((_, i) => {
        const { x, y } = getCoordinates(level, i);
        return `${x},${y}`;
      }).join(' ');
    });

    // Actual user mastery polygon overlay points
    const userPolygonPoints = topics.map((_, i) => {
      const val = (values[i] as number) || 0;
      const { x, y } = getCoordinates(val, i);
      return `${x},${y}`;
    }).join(' ');

    // Coordinate lines intersecting outer edges
    const axesLines = topics.map((_, i) => {
      const inner = getCoordinates(0, i);
      const outer = getCoordinates(100, i);
      return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
    });

    // Label items mapping with offset alignments
    const labels = topics.map((topic, i) => {
      const val = (values[i] as number) || 0;
      const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
      const textX = center + (radius + 20) * Math.cos(angle);
      const textY = center + (radius + 12) * Math.sin(angle);
      
      let textAnchor = 'middle';
      if (Math.cos(angle) > 0.1) textAnchor = 'start';
      if (Math.cos(angle) < -0.1) textAnchor = 'end';

      return { label: `${topic} (${val}%)`, x: textX, y: textY, anchor: textAnchor };
    });

    return { gridRings, userPolygonPoints, axesLines, labels };
  }, [profile]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 font-sans text-neutral-200 select-none">
      
      {/* Top Section – Profile Header Card */}
      <div className="mb-8 bg-neutral-950 border border-neutral-850 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6" id="dashboard-hero">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
        
        {/* User Card info */}
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="relative shrink-0">
            <img 
              src={profile.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'} 
              alt={profile.displayName} 
              className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/20 shadow-md transform hover:scale-105 transition"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow">
              <Award className="h-3 w-3" />
              RANK #{profile.rank.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">{profile.displayName}</h1>
            <p className="text-xs text-neutral-400 font-mono">{profile.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-xs">
              <span className="flex items-center gap-1.5 text-amber-500 font-medium font-mono text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                <Flame className="h-3.5 w-3.5 fill-amber-500" />
                {profile.streak} Day Streak
              </span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-400 font-mono">{submissions.length} Total Submissions</span>
            </div>
          </div>
        </div>

        {/* Global Solved stats card boxes */}
        <div className="grid grid-cols-3 gap-5 border border-neutral-850 bg-neutral-900/40 p-4 rounded-xl shrink-0 text-center w-full md:w-auto" id="mini-stats-grid">
          <div>
            <span className="text-2xl font-bold text-emerald-400 font-mono block leading-none">{profile.solvedCount.Easy}</span>
            <span className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wide mt-1 block select-none">Easy</span>
          </div>
          <div className="border-x border-neutral-850 px-5">
            <span className="text-2xl font-bold text-amber-400 font-mono block leading-none">{profile.solvedCount.Medium}</span>
            <span className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wide mt-1 block select-none">Medium</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-400 font-mono block leading-none">{profile.solvedCount.Hard}</span>
            <span className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wide mt-1 block select-none">Hard</span>
          </div>
        </div>
      </div>

      {/* Main Layout Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-analytics-grid">
        
        {/* LEFT COLUMN: 7 Columns out of 12 (Mastery Radar + Category Stats) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Heatmap Section */}
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-6" id="dashboard-heatmap-panel">
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Annual Coding Activity
            </h2>

            {/* Micro scroll box for heatmap grid */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[720px] pb-1 space-y-1">
                
                {/* Months labels placement row */}
                <div className="flex text-[9px] font-mono font-bold text-neutral-500 select-none pb-1.5 h-4">
                  <div className="w-6 shrink-0" /> {/* Days label spacing offset */}
                  <div className="flex justify-between flex-1 pr-6">
                    {heatmapGrid.map((week, idx) => {
                      const firstDay = week[0];
                      if (firstDay && firstDay.monthName) {
                        return (
                          <span key={idx} className="relative block text-left" style={{ width: '13px' }}>
                            {firstDay.monthName}
                          </span>
                        );
                      }
                      return <span key={idx} className="block shrink-0" style={{ width: '13px' }} />;
                    })}
                  </div>
                </div>

                {/* Heatmap Weeks Grid */}
                <div className="flex select-none">
                  {/* Vertical labels for days */}
                  <div className="flex flex-col justify-between text-[8px] font-mono font-bold text-neutral-600 w-6 shrink-0 h-[100px] select-none pr-1.5 pt-0.5">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* Weeks Columns container */}
                  <div className="flex gap-1 flex-1">
                    {heatmapGrid.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1 shrink-0">
                        {week.map((day, dayIdx) => {
                          const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                          
                          // Color-coded intensity levels matching LeetCode / GitHub commits logic
                          let colorClass = 'bg-neutral-900 border border-neutral-950';
                          if (day.count > 0 && day.count < 2) colorClass = 'bg-emerald-950 border border-emerald-900/45 text-emerald-100';
                          else if (day.count >= 2 && day.count < 4) colorClass = 'bg-emerald-800 border-none';
                          else if (day.count >= 4 && day.count < 6) colorClass = 'bg-emerald-600 border-none';
                          else if (day.count >= 6) colorClass = 'bg-emerald-400 border-none ring-1 ring-emerald-300/30';

                          return (
                            <div
                              key={dayIdx}
                              title={`${day.count} submissions on ${day.dateStr}`}
                              className={`h-2.5 w-2.5 rounded-[1.5px] cursor-pointer transition hover:scale-125 duration-100 ${colorClass} ${
                                isToday ? 'outline outline-offset-1 outline-amber-500/60' : ''
                              }`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>

                </div>

                {/* Intensity legends row */}
                <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono text-neutral-500 pr-4 pt-4 select-none">
                  <span>Less</span>
                  <div className="h-2.5 w-2.5 bg-neutral-900 rounded-[1.5px]" />
                  <div className="h-2.5 w-2.5 bg-emerald-905 bg-emerald-950 rounded-[1.5px]" />
                  <div className="h-2.5 w-2.5 bg-emerald-800 rounded-[1.5px]" />
                  <div className="h-2.5 w-2.5 bg-emerald-600 rounded-[1.5px]" />
                  <div className="h-2.5 w-2.5 bg-emerald-400 rounded-[1.5px]" />
                  <span>More</span>
                </div>

              </div>
            </div>
          </div>

          {/* Submissions Timeline list */}
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-6" id="submissions-timeline-block">
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Submission History
            </h2>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <div 
                    key={sub.id}
                    className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-neutral-900/40 border border-neutral-850 p-4 rounded-xl group hover:border-neutral-800 transition duration-150"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-amber-500 transition">{sub.problemTitle}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 rounded-md ${
                          sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-neutral-400">
                        <span className="uppercase text-amber-500 font-bold">{sub.language}</span>
                        <span>•</span>
                        <span>Runtime: <strong className="text-neutral-200">{sub.runtime}</strong></span>
                        <span>•</span>
                        <span>Memory: <strong className="text-neutral-200">{sub.memory}</strong></span>
                      </div>
                    </div>
                    {/* Timestamp relative or clean date format */}
                    <div className="text-[10px] font-mono text-neutral-500 self-end xs:self-center shrink-0">
                      {new Date(sub.timestamp).toLocaleDateString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 border-2 border-dashed border-neutral-850 rounded-xl text-center select-none text-neutral-500">
                  <BookOpen className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                  <div className="text-xs font-semibold">No submissions recorded yet</div>
                  <p className="text-[10px] text-neutral-600 mt-0.5">Start coding on the workspace to populate statistics.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 4 Columns out of 12 (Radar diagram mastery) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Radar Topic Mastery card */}
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-6" id="dashboard-mastery-card">
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Topic Skill Mastery
            </h2>

            {/* Render the math-calculated SVG Polygon Radar chart */}
            <div className="flex items-center justify-center p-2 bg-neutral-900/30 border border-neutral-900/70 rounded-xl overflow-hidden shadow-inner">
              <svg viewBox="0 0 300 300" className="h-64 w-64 select-none">
                
                {/* 1. Coordinate grids representing polygonal boundary bands */}
                {radarChart.gridRings.map((ringPoints, idx) => (
                  <polygon
                    key={idx}
                    points={ringPoints}
                    className="fill-transparent stroke-neutral-850 stroke-1"
                  />
                ))}

                {/* 2. Edge axes lines branching outward */}
                {radarChart.axesLines.map((axis, idx) => (
                  <line
                    key={idx}
                    x1={axis.x1}
                    y1={axis.y1}
                    x2={axis.x2}
                    y2={axis.y2}
                    className="stroke-neutral-850 stroke-1"
                  />
                ))}

                {/* 3. User Topic Mastery Polygon Area Overlay representation */}
                <polygon
                  points={radarChart.userPolygonPoints}
                  className="fill-amber-500/20 stroke-amber-500 stroke-[2] shadow-lg"
                />

                {/* Draw small indicator dot vertices */}
                {radarChart.userPolygonPoints.split(' ').map((pt, i) => {
                  const arr = pt.split(',');
                  return (
                    <circle
                      key={i}
                      cx={arr[0]}
                      cy={arr[1]}
                      r="3.5"
                      className="fill-amber-500 stroke-neutral-950 stroke-1 shadow-md"
                    />
                  );
                })}

                {/* 4. Display Label points aligning outer polygon coordinates */}
                {radarChart.labels.map((item, idx) => (
                  <text
                    key={idx}
                    x={item.x}
                    y={item.y}
                    className="font-mono text-[8px] font-bold fill-neutral-400 leading-none select-none tracking-tight hover:fill-amber-500 transition-colors"
                    textAnchor={item.anchor}
                  >
                    {item.label}
                  </text>
                ))}

              </svg>
            </div>

            {/* List breakdown representation in progress-rows */}
            <div className="mt-6 space-y-3.5 font-sans text-xs">
              {Object.entries(profile.topicMastery).map(([topic, val]) => (
                <div key={topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                    <span className="text-neutral-400 font-bold">{topic}</span>
                    <span className="font-mono text-[10px] text-amber-500 font-extrabold">{val}%</span>
                  </div>
                  <div className="bg-neutral-950 h-1 rounded-full overflow-hidden border border-neutral-900 flex">
                    <div 
                      className="bg-amber-500 rounded-full transition-all duration-500 ease"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
