import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Coins,
  Flame,
  Zap,
  Trophy,
  ShieldAlert,
  Clock,
  Sparkles,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import {
  DailyChallengesState,
  DailyMission,
  loadDailyChallenges,
  claimDailyMissionReward,
  claimGrandDailyChest,
  getTimeUntilDailyReset,
  getDailyChallengesSummary,
} from '../utils/dailyChallenges';
import { soundManager } from '../utils/audio';
import { DailyStreakBonusCard } from './DailyStreakBonusCard';

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsChange?: (newCoins: number) => void;
}

export const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({
  isOpen,
  onClose,
  onCoinsChange,
}) => {
  const [challenges, setChallenges] = useState<DailyChallengesState>(() => loadDailyChallenges());
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilDailyReset().formatted);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [claimedAnimationId, setClaimedAnimationId] = useState<string | null>(null);

  // Sync state and countdown timer
  useEffect(() => {
    if (!isOpen) return;

    setChallenges(loadDailyChallenges());

    const updateTimer = () => {
      setTimeLeft(getTimeUntilDailyReset().formatted);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    const handleUpdate = () => {
      setChallenges(loadDailyChallenges());
    };
    window.addEventListener('daily_challenges_changed', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('daily_challenges_changed', handleUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const summary = getDailyChallengesSummary(challenges);

  const handleClaim = (missionId: string, title: string) => {
    const res = claimDailyMissionReward(missionId);
    if (res.success) {
      soundManager.playRewardFanfare();
      setChallenges(res.newState);
      setClaimedAnimationId(missionId);
      setTimeout(() => setClaimedAnimationId(null), 1200);

      setCelebrationToast(`Awesome! Claimed reward for "${title}" (+${res.rewardCoins} Gold Coins) 🎁`);
      setTimeout(() => setCelebrationToast(null), 3500);

      if (onCoinsChange) {
        onCoinsChange(res.rewardCoins);
      }
    }
  };

  const handleClaimGrandChest = () => {
    const res = claimGrandDailyChest();
    if (res.success) {
      soundManager.playRewardFanfare();
      setChallenges(res.newState);
      setClaimedAnimationId('grand_chest');
      setTimeout(() => setClaimedAnimationId(null), 1500);

      setCelebrationToast(`Legendary achievement! Opened Grand Daily Chest: +${res.rewardCoins} Bonus Coins! 🏆✨`);
      setTimeout(() => setCelebrationToast(null), 4000);

      if (onCoinsChange) {
        onCoinsChange(res.rewardCoins);
      }
    }
  };

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'distance':
        return <Target className="w-5 h-5 text-sky-400" />;
      case 'coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'near_miss':
        return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      case 'nitro':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'score':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'races':
      default:
        return <Trophy className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-4 text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-game text-white flex items-center gap-2">
                <span>Daily Quests & Rewards</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold">
                  {summary.completed} of {summary.total} Completed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete daily missions to earn gold and upgrade supercars in your garage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Resets in {timeLeft}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Celebration Toast */}
        {celebrationToast && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs sm:text-sm font-bold animate-bounce text-center shadow-lg shadow-amber-500/10">
            {celebrationToast}
          </div>
        )}

        {/* Mobile countdown badge */}
        <div className="sm:hidden flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="text-slate-400 font-sans text-[11px]">Resets in:</span>
          <span className="text-amber-400 flex items-center gap-1 font-bold">
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}
          </span>
        </div>

        {/* Daily Login Streak Bonus Widget */}
        <DailyStreakBonusCard onCoinsChange={onCoinsChange} />

        {/* Missions List */}
        <div className="space-y-3">
          {challenges.missions.map((mission: DailyMission) => {
            const isCompleted = mission.current >= mission.target;
            const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const isAnim = claimedAnimationId === mission.id;

            return (
              <div
                key={mission.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  mission.claimed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                    : isCompleted
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                } ${isAnim ? 'scale-[1.02] ring-2 ring-yellow-400' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {getMissionIcon(mission.iconName)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{mission.title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          +{mission.rewardCoins} Coins
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Progress Bar & Numerical stats */}
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Progress:</span>
                          <span className="font-mono font-bold text-slate-200 tabular-nums">
                            {mission.current.toLocaleString()} / {mission.target.toLocaleString()} {mission.unit}
                            <span className="text-amber-400 ml-1.5 font-sans">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="sm:self-center shrink-0 pt-1 sm:pt-0">
                    {mission.claimed ? (
                      <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Claimed</span>
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleClaim(mission.id, mission.title)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all animate-pulse"
                      >
                        <Gift className="w-4 h-4 fill-slate-950" />
                        <span>Claim {mission.rewardCoins} Coins 🎁</span>
                      </button>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium text-center">
                        In Progress
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Daily Chest Section */}
        <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
          challenges.grandChestClaimed
            ? 'bg-slate-950/60 border-slate-800 text-slate-400'
            : summary.completed === summary.total
            ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-yellow-400 shadow-xl shadow-yellow-500/15 ring-2 ring-yellow-400/40'
            : 'bg-gradient-to-b from-slate-950 to-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-6 h-6 fill-slate-950" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white">Grand Daily Golden Chest</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    +{challenges.grandRewardCoins} Extra Coins
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {challenges.grandChestClaimed
                    ? 'Grand chest claimed today! Come back tomorrow for brand new challenges.'
                    : summary.completed === summary.total
                    ? 'Congratulations! All 3 quests complete. Grand Golden Chest is ready!'
                    : `Complete ${summary.total - summary.completed} remaining quests to unlock the Grand Chest.`}
                </p>
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              {challenges.grandChestClaimed ? (
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Opened Today ✓</span>
                </div>
              ) : summary.completed === summary.total ? (
                <button
                  onClick={handleClaimGrandChest}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Open Golden Chest (+{challenges.grandRewardCoins}) 🏆</span>
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold text-center">
                  Locked ({summary.completed} / {summary.total})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500/70" />
          <span>Missions and bonus rewards reset automatically every 24 hours at midnight</span>
        </div>
      </div>
    </div>
  );
};
