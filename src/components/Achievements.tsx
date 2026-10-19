import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Coins,
  Flag,
  Sparkles,
  Calendar,
  Target,
  Car,
  Layers,
} from 'lucide-react';
import { PlayerStats } from '../types/game';
import { loadPlayerStats, loadDailyRaces, DailyRacesData } from '../utils/storage';
import { ACHIEVEMENTS_LIST, AchievementDef } from '../utils/achievements';

interface AchievementsProps {
  stats?: PlayerStats;
}

type CategoryFilter = 'all' | 'overtake' | 'record' | 'races' | 'distance' | 'garage';

export const Achievements: React.FC<AchievementsProps> = ({ stats: propStats }) => {
  const [stats, setStats] = useState<PlayerStats>(() => propStats || loadPlayerStats());
  const [dailyData, setDailyData] = useState<DailyRacesData>(() => loadDailyRaces());
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    const handleStatsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlayerStats>;
      if (customEvent.detail) {
        setStats(customEvent.detail);
      } else {
        setStats(loadPlayerStats());
      }
    };

    const handleDailyUpdate = () => {
      setDailyData(loadDailyRaces());
    };

    window.addEventListener('player_stats_changed', handleStatsUpdate);
    window.addEventListener('daily_races_changed', handleDailyUpdate);
    window.addEventListener('storage', handleStatsUpdate);
    window.addEventListener('storage', handleDailyUpdate);

    return () => {
      window.removeEventListener('player_stats_changed', handleStatsUpdate);
      window.removeEventListener('daily_races_changed', handleDailyUpdate);
      window.removeEventListener('storage', handleStatsUpdate);
      window.removeEventListener('storage', handleDailyUpdate);
    };
  }, []);

  // Sync if prop changes
  useEffect(() => {
    if (propStats) {
      setStats(propStats);
    }
  }, [propStats]);

  // Format today's date in English
  const todayFormatted = (() => {
    try {
      const [y, m, d] = dailyData.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dailyData.date;
    }
  })();

  const totalOvertakes = stats.totalOvertakes || 0;

  // Rank Tier based on total cars overtaken
  const getOvertakeRank = (count: number) => {
    if (count >= 100) return { title: 'World Overtake Legend', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
    if (count >= 60) return { title: 'Highway King', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' };
    if (count >= 30) return { title: 'Master Swerver', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/40' };
    if (count >= 10) return { title: 'Pro Overtaker', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
    return { title: 'Rookie Driver', color: 'text-slate-300', bg: 'bg-slate-800/50', border: 'border-slate-700/50' };
  };

  const currentRank = getOvertakeRank(totalOvertakes);

  // Compute unlock status and progress for all achievements
  const computedAchievements = ACHIEVEMENTS_LIST.map((ach) => {
    const current = ach.getValue(stats, dailyData.count);
    const unlocked = (stats.unlockedAchievements?.includes(ach.id)) || (current >= ach.targetValue);
    const progress = Math.min(100, Math.round((current / ach.targetValue) * 100));

    return {
      ...ach,
      current,
      unlocked,
      progress,
    };
  });

  const unlockedCount = computedAchievements.filter((a) => a.unlocked).length;
  const totalCount = computedAchievements.length;

  const filteredAchievements = computedAchievements.filter((ach) => {
    if (activeCategory === 'all') return true;
    return ach.category === activeCategory;
  });

  const renderIcon = (iconName: AchievementDef['iconName'], unlocked: boolean) => {
    const iconClass = `w-5 h-5 ${unlocked ? 'text-amber-400' : 'text-slate-400'}`;
    switch (iconName) {
      case 'flag':
        return <Flag className={iconClass} />;
      case 'flame':
        return <Flame className={iconClass} />;
      case 'trophy':
        return <Trophy className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      case 'coins':
        return <Coins className={iconClass} />;
      case 'award':
        return <Award className={iconClass} />;
      case 'car':
        return <Car className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      default:
        return <Target className={iconClass} />;
    }
  };

  return (
    <section className="bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xs">
      {/* Header section with total progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-game text-white flex items-center gap-2">
              <span>Driver Achievements & Trophies</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-semibold border border-amber-500/30">
                {unlockedCount} of {totalCount} Unlocked
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete career milestones, dodge oncoming traffic, and unlock coin bonuses
            </p>
          </div>
        </div>

        {/* Total Progress */}
        <div className="flex items-center gap-2 sm:self-center">
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-400 tabular-nums">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      {/* DUAL DASHBOARD CARDS: 1. OVERTAKES COUNTER & 2. DAILY RACES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Overtakes Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg shadow-cyan-500/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                <Zap className="w-3.5 h-3.5" />
                <span>Total Vehicles Overtaken</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentRank.bg} ${currentRank.color} ${currentRank.border}`}>
                {currentRank.title}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {totalOvertakes === 0
                ? 'Hit the gas and swerve through highway traffic to log your very first overtake!'
                : totalOvertakes < 30
                ? `Passed ${totalOvertakes} cars cleanly! Keep pushing to unlock the Master Swerver tier.`
                : totalOvertakes < 60
                ? `Exceptional control! ${totalOvertakes} cars passed, closing in on Highway King.`
                : `Highway Legend! You have dominated traffic with ${totalOvertakes} clean overtakes.`}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 bg-slate-900/60 rounded-xl px-3.5 py-2.5">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Cars Overtaken</div>
              <div className="text-2xl font-black font-game text-cyan-400 tabular-nums">
                {totalOvertakes} <span className="text-xs font-normal text-slate-400">vehicles</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-[10px] text-slate-400 font-medium">Next Milestone</div>
              <div className="text-xs font-bold text-white">
                {totalOvertakes < 10
                  ? '10 Cars (Pro Overtaker)'
                  : totalOvertakes < 30
                  ? '30 Cars (Master Swerver)'
                  : totalOvertakes < 60
                  ? '60 Cars (Highway King)'
                  : totalOvertakes < 100
                  ? '100 Cars (Overtake Legend)'
                  : 'Max Tier Achieved!'}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Races Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg shadow-amber-500/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>Daily Races Log</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {todayFormatted}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {dailyData.count === 0
                ? 'No races completed yet today. Jump into the arena and crush your personal best!'
                : dailyData.count < 3
                ? 'Great start today! Keep racing to earn daily challenge gold rewards.'
                : dailyData.count < 5
                ? 'High-octane pace! Almost at today\'s daily target of 5 races.'
                : 'Daily Champion! You unlocked all daily race achievements today.'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 bg-slate-900/60 rounded-xl px-3.5 py-2.5">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Completed Today</div>
              <div className="text-2xl font-black font-game text-amber-400 tabular-nums">
                {dailyData.count} <span className="text-xs font-normal text-slate-400">races</span>
              </div>
            </div>
            <div className="min-w-[110px]">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Daily Goal:</span>
                <span className="font-bold text-white tabular-nums">{Math.min(dailyData.count, 5)} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    dailyData.count >= 5 ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${Math.min(100, (dailyData.count / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {[
          { id: 'all', label: 'All Badges', icon: Layers },
          { id: 'overtake', label: 'Traffic Overtakes', icon: Zap },
          { id: 'record', label: 'High Scores', icon: Trophy },
          { id: 'races', label: 'Races & Career', icon: Flag },
          { id: 'distance', label: 'Distance', icon: Award },
          { id: 'garage', label: 'Garage & Gold', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAchievements.map((ach) => {
          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800/70 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      ach.unlocked
                        ? 'bg-amber-500/20 border-amber-500/50 shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-500'
                    }`}
                  >
                    {renderIcon(ach.iconName, ach.unlocked)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3
                        className={`text-sm font-bold truncate ${
                          ach.unlocked ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {ach.title}
                      </h3>
                      {ach.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          <Sparkles className="w-2.5 h-2.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                          {ach.current.toLocaleString()} / {ach.targetValue.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward and Progress Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Reward:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                    <Coins className="w-3 h-3" />
                    <span>+{ach.reward} Coins</span>
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      ach.unlocked
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-sky-500 to-amber-500'
                    }`}
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
