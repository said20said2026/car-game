import React, { useState, useEffect } from 'react';
import {
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
  Play,
  Award,
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

interface DailyChallengesSectionProps {
  theme?: 'dark' | 'light';
  onPlayNow?: () => void;
  onCoinsChange?: (newCoins: number) => void;
}

export const DailyChallengesSection: React.FC<DailyChallengesSectionProps> = ({
  theme = 'dark',
  onPlayNow,
  onCoinsChange,
}) => {
  const isDark = theme === 'dark';
  const [challenges, setChallenges] = useState<DailyChallengesState>(() => loadDailyChallenges());
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilDailyReset().formatted);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const summary = getDailyChallengesSummary(challenges);

  const handleClaim = (missionId: string, title: string) => {
    const res = claimDailyMissionReward(missionId);
    if (res.success) {
      soundManager.playRewardFanfare();
      setChallenges(res.newState);
      setCelebrationToast(`مبروك! تم استلام مكافأة "${title}" (+${res.rewardCoins} عملة ذهبية) 🎁`);
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
      setCelebrationToast(`إنجاز أسطوري! فتحت الصندوق الذهبي اليومي وحصلت على +${res.rewardCoins} عملة إضافية! 🏆✨`);
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

  const totalPossibleCoins =
    challenges.missions.reduce((sum, m) => sum + m.rewardCoins, 0) + challenges.grandRewardCoins;

  return (
    <section id="daily-challenges" className={`border rounded-2xl p-4 sm:p-6 backdrop-blur-xs transition-colors ${
      isDark
        ? 'bg-slate-900/70 border-slate-800 text-slate-100 shadow-xl'
        : 'bg-white border-slate-200 text-slate-900 shadow-md'
    }`}>
      {/* Header section with live timer and grand bounty */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-5 border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-game tracking-tight">
                التحدي اليومي والمهام الخاصة
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-bold border border-amber-500/30">
                {summary.completed} من {summary.total} مكتمل
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              مهام حصرية تتجدد يومياً: اكسب حتى <span className="text-amber-400 font-bold font-mono">+{totalPossibleCoins}</span> عملة ذهبية وطوّر سياراتك
            </p>
          </div>
        </div>

        {/* Live Timer and Quick Action */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>يتجدد خلال:</span>
            <span className="text-amber-400 font-bold font-mono">{timeLeft}</span>
          </div>

          {onPlayNow && (
            <button
              onClick={onPlayNow}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>انطلق للسباق الآن</span>
            </button>
          )}
        </div>
      </div>

      {/* Celebration Toast */}
      {celebrationToast && (
        <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border border-amber-500/50 rounded-xl text-amber-200 text-xs sm:text-sm font-bold animate-bounce text-center shadow-lg shadow-amber-500/10">
          {celebrationToast}
        </div>
      )}

      {/* 3 Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {challenges.missions.map((mission: DailyMission) => {
          const isCompleted = mission.current >= mission.target;
          const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                mission.claimed
                  ? 'bg-slate-950/50 border-slate-800/80 opacity-85'
                  : isCompleted
                  ? 'bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : isDark
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getMissionIcon(mission.iconName)}
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    +{mission.rewardCoins} عملة
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="font-bold text-sm text-white">{mission.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[36px]">
                  {mission.description}
                </p>
              </div>

              {/* Progress & Claim Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">التقدم الحالي:</span>
                  <span className="font-mono font-bold text-slate-200 tabular-nums">
                    {mission.current.toLocaleString()} / {mission.target.toLocaleString()} {mission.unit}
                    <span className="text-amber-400 mr-1 font-sans">({percent}%)</span>
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

                {/* Claim Button */}
                {mission.claimed ? (
                  <div className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم استلام المكافأة</span>
                  </div>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(mission.id, mission.title)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5 fill-slate-950" />
                    <span>استلم المكافأة (+{mission.rewardCoins}) 🎁</span>
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-xs font-medium text-center">
                    قيد الإنجاز في السباق
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Daily Chest Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        challenges.grandChestClaimed
          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
          : summary.completed === summary.total
          ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-yellow-400 shadow-xl shadow-yellow-500/20 ring-2 ring-yellow-400/40'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-amber-500/30'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6 fill-slate-950" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-white">الصندوق الذهبي اليومي الخارق</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40">
                +{challenges.grandRewardCoins} عملة إضافية 🏆
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {challenges.grandChestClaimed
                ? 'تم فتح الصندوق الذهبي اليوم بنجاح! عد غداً للحصول على صندوق جديد وتحديات حصرية.'
                : summary.completed === summary.total
                ? 'رائع جداً! أنهيت جميع مهام اليوم الـ 3. اضغط أدناه لاستلام جائزتك الكبرى الآن!'
                : `أنجز جميع مهام اليوم الـ 3 لفتح الصندوق الذهبي الكبير والحصول على +${challenges.grandRewardCoins} عملة إضافية.`}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {challenges.grandChestClaimed ? (
            <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم فتح الصندوق اليوم ✓</span>
            </div>
          ) : summary.completed === summary.total ? (
            <button
              onClick={handleClaimGrandChest}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>افتح الصندوق الذهبي (+{challenges.grandRewardCoins}) 🏆</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold text-center">
              مغلق ({summary.completed} من {summary.total} مهام مكتملة)
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
