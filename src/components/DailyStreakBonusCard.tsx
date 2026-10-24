import React, { useState, useEffect } from 'react';
import {
  Flame,
  Coins,
  Sparkles,
  CheckCircle2,
  Lock,
  Trophy,
  Gift,
  Calendar,
} from 'lucide-react';
import {
  loadDailyStreak,
  claimDailyStreakBonus,
  STREAK_REWARDS,
  DailyStreakData,
} from '../utils/dailyStreak';
import { getTimeUntilDailyReset } from '../utils/dailyChallenges';
import { soundManager } from '../utils/audio';

interface DailyStreakBonusCardProps {
  onCoinsChange?: (newCoins: number) => void;
  compact?: boolean;
}

export const DailyStreakBonusCard: React.FC<DailyStreakBonusCardProps> = ({
  onCoinsChange,
  compact = false,
}) => {
  const [streakState, setStreakState] = useState(() => loadDailyStreak());
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilDailyReset().formatted);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    const refresh = () => {
      setStreakState(loadDailyStreak());
    };

    const updateTimer = () => {
      setTimeLeft(getTimeUntilDailyReset().formatted);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    window.addEventListener('daily_streak_changed', refresh);
    window.addEventListener('daily_challenges_changed', refresh);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('daily_streak_changed', refresh);
      window.removeEventListener('daily_challenges_changed', refresh);
    };
  }, []);

  const { streak, isClaimableToday, currentCycleDay, todayRewardCoins } = streakState;

  const handleClaim = () => {
    if (!isClaimableToday || isClaiming) return;
    setIsClaiming(true);

    const res = claimDailyStreakBonus();
    if (res.success) {
      soundManager.playRewardFanfare();
      setStreakState(loadDailyStreak());
      setCelebrationToast(res.message);
      setTimeout(() => setCelebrationToast(null), 4000);

      if (onCoinsChange) {
        onCoinsChange(res.newCoins);
      }
    }
    setIsClaiming(false);
  };

  const currentDisplayStreak = isClaimableToday
    ? streak.currentStreak + 1
    : Math.max(1, streak.currentStreak);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-amber-500/30 shadow-xl space-y-4 text-left">
      {/* Toast Feedback */}
      {celebrationToast && (
        <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25 border border-amber-400/60 text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-bounce shadow-lg shadow-amber-500/10">
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Header with Streak Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black font-game text-white tracking-wide flex items-center gap-1.5">
                <span>Daily Login Streak Bonus</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                {streak.currentStreak} Day{streak.currentStreak === 1 ? '' : 's'} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Log in daily to claim escalating coin rewards and unlock the Day 7 Grand Jackpot!
            </p>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Best Streak:</span>
            <span className="font-bold text-white font-mono">{streak.longestStreak} Days</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Total Earned:</span>
            <span className="font-bold text-amber-400 font-mono">+{streak.totalClaimedCoins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Progression Track */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STREAK_REWARDS.map((tier) => {
          const isTodayTier = currentCycleDay === tier.day;
          const isPastTier = currentCycleDay > tier.day || (!isClaimableToday && currentCycleDay === tier.day);
          const isFutureTier = currentCycleDay < tier.day;
          const isClaimableTarget = isTodayTier && isClaimableToday;

          return (
            <div
              key={tier.day}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-200 relative ${
                isClaimableTarget
                  ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.02]'
                  : isPastTier
                  ? 'bg-slate-950/80 border-emerald-500/30 opacity-90'
                  : tier.isJackpot
                  ? 'bg-gradient-to-b from-yellow-500/10 to-slate-950 border-amber-500/40'
                  : 'bg-slate-950/50 border-slate-800 opacity-75'
              }`}
            >
              {/* Card Header: Day and Jackpot tag */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className={`text-[11px] font-bold ${isClaimableTarget ? 'text-amber-300' : 'text-slate-400'}`}>
                  {tier.label}
                </span>

                {tier.isJackpot ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-black border border-amber-500/40 animate-pulse">
                    JACKPOT
                  </span>
                ) : isPastTier ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isFutureTier ? (
                  <Lock className="w-3 h-3 text-slate-500" />
                ) : null}
              </div>

              {/* Reward Coin Icon & Value */}
              <div className="my-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Coins
                    className={`w-4 h-4 ${
                      isClaimableTarget
                        ? 'text-yellow-300 animate-bounce'
                        : tier.isJackpot
                        ? 'text-yellow-400'
                        : 'text-amber-400'
                    }`}
                  />
                  <span
                    className={`font-black font-game text-sm sm:text-base tabular-nums ${
                      isClaimableTarget
                        ? 'text-yellow-300'
                        : tier.isJackpot
                        ? 'text-amber-300'
                        : 'text-white'
                    }`}
                  >
                    +{tier.coins}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Gold Coins</div>
              </div>

              {/* Card Footer Status */}
              <div className="mt-1 pt-1.5 border-t border-slate-800/60 text-center">
                {isPastTier ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Claimed
                  </span>
                ) : isClaimableTarget ? (
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider animate-pulse">
                    Today
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim / Status Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          {isClaimableToday ? (
            <span>
              Today is <strong className="text-white">Day {currentCycleDay}</strong> of your streak! Claim your reward now.
            </span>
          ) : (
            <span>
              Today's reward claimed ✓ Next streak bonus unlocks at midnight in <strong className="text-amber-400 font-mono font-bold">{timeLeft}</strong>.
            </span>
          )}
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {isClaimableToday ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 animate-pulse"
            >
              <Gift className="w-4 h-4 fill-slate-950" />
              <span>Claim Day {currentCycleDay} Bonus (+{todayRewardCoins} Coins) 🎁</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Streak Bonus Claimed for Today ✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
