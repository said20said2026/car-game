import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Zap, Coins, Flag, Sparkles, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { loadDailyRaces, DailyRacesData } from '../utils/storage';

interface AchievementsProps {
  stats: PlayerStats;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  unlocked: boolean;
  reward: number;
}

export const Achievements: React.FC<AchievementsProps> = ({ stats }) => {
  const [dailyData, setDailyData] = useState<DailyRacesData>(() => loadDailyRaces());

  useEffect(() => {
    const handleDailyUpdate = () => {
      setDailyData(loadDailyRaces());
    };

    window.addEventListener('daily_races_changed', handleDailyUpdate);
    window.addEventListener('storage', handleDailyUpdate);
    return () => {
      window.removeEventListener('daily_races_changed', handleDailyUpdate);
      window.removeEventListener('storage', handleDailyUpdate);
    };
  }, []);

  // Format today's date in Arabic
  const todayFormatted = (() => {
    try {
      const [y, m, d] = dailyData.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dailyData.date;
    }
  })();

  const achievements: Achievement[] = [
    {
      id: 'first_race',
      title: 'الانطلاقة الأولى',
      description: 'أكمل أول سباق لك في شوارع المدينة',
      icon: <Flag className="w-5 h-5 text-emerald-400" />,
      current: Math.min(1, stats.racesCount || 0),
      max: 1,
      unlocked: (stats.racesCount || 0) >= 1,
      reward: 50,
    },
    {
      id: 'daily_racer',
      title: 'بطل السباقات اليومية',
      description: 'خُض 3 سباقات على الأقل خلال نفس اليوم',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      current: Math.min(3, dailyData.count),
      max: 3,
      unlocked: dailyData.count >= 3,
      reward: 200,
    },
    {
      id: 'ten_races',
      title: 'متسابق محترف',
      description: 'شارك في 10 سباقات مختلفة في مسيرتك',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      current: Math.min(10, stats.racesCount || 0),
      max: 10,
      unlocked: (stats.racesCount || 0) >= 10,
      reward: 300,
    },
    {
      id: 'top_speed',
      title: 'سرعة البرق',
      description: 'حقق رقماً قياسياً بالنقاط يتجاوز 1,500 نقطة',
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      current: Math.min(1500, stats.highScore || 0),
      max: 1500,
      unlocked: (stats.highScore || 0) >= 1500,
      reward: 200,
    },
    {
      id: 'coin_collector',
      title: 'جامع الذهب',
      description: 'اجمع أكثر من 500 عملة ذهبية',
      icon: <Coins className="w-5 h-5 text-yellow-400" />,
      current: Math.min(500, stats.coins || 0),
      max: 500,
      unlocked: (stats.coins || 0) >= 500,
      reward: 150,
    },
    {
      id: 'marathon_driver',
      title: 'قاطع المسافات',
      description: 'اقطع مسافة تزيد عن 2,000 متر في سباق واحد',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      current: Math.min(2000, stats.maxDistance || 0),
      max: 2000,
      unlocked: (stats.maxDistance || 0) >= 2000,
      reward: 250,
    },
    {
      id: 'car_collector',
      title: 'عاشق السيارات الخارقة',
      description: 'افتح سيارتين على الأقل في المرآب',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      current: Math.min(2, stats.unlockedCars?.length || 1),
      max: 2,
      unlocked: (stats.unlockedCars?.length || 1) >= 2,
      reward: 400,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section className="bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xs">
      {/* Header section with total progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-game text-white flex items-center gap-2">
              <span>إنجازات وأوسمة المتسابق</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-semibold">
                {unlockedCount} من {achievements.length} مكتمل
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              أكمل المهام لفتح شارات التميز وإثبات مهارتك على الطرق السريعة
            </p>
          </div>
        </div>

        {/* Total Progress */}
        <div className="flex items-center gap-2 sm:self-center">
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-400 tabular-nums">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </span>
        </div>
      </div>

      {/* ميزة عداد السباقات اليومية المحفوظ في LocalStorage */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg shadow-amber-500/5 relative overflow-hidden">
        {/* خلفية تزيينية متوهجة */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* تفاصيل العداد واليوم */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>عداد السباقات اليومية</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {todayFormatted}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {dailyData.count === 0
                ? 'لم تخض أي سباق اليوم بعد. انطلق الآن وتحدَّ أرقامك القياسية!'
                : dailyData.count < 3
                ? 'بداية رائعة اليوم! استمر في القيادة لجمع المكافآت وكسر الأرقام.'
                : dailyData.count < 5
                ? 'أداء بطولي! اقتربت جداً من تحقيق هدف اليوم (5 سباقات).'
                : 'بطل شوارع المدينة اليوم! حققت وتجاوزت الهدف اليومي بجدارة.'}
            </p>
          </div>

          {/* لوحة عرض الرقم وهدف اليوم */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3">
            <div className="text-center sm:text-start">
              <div className="text-[11px] text-slate-400 font-semibold">خاضها اليوم</div>
              <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-black font-game text-amber-400 tracking-tight tabular-nums">
                  {dailyData.count}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {dailyData.count === 1 ? 'سباق' : dailyData.count === 2 ? 'سباقان' : 'سباقات'}
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            {/* شريط هدف اليوم */}
            <div className="space-y-1 min-w-[120px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">هدف اليوم:</span>
                <span className="font-bold text-white tabular-nums">{Math.min(dailyData.count, 5)} / 5</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    dailyData.count >= 5
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${Math.min(100, (dailyData.count / 5) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-center font-semibold">
                {dailyData.count >= 5 ? '✓ اكتمل هدف اليوم' : `${Math.round(Math.min(100, (dailyData.count / 5) * 100))}% من الهدف`}
              </div>
            </div>
          </div>
        </div>

        {/* إشعار حفظ التخزين المحلي والمهام */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>تحديات اليوم: 1 سباق (انطلاق) · 3 سباقات (تحدي) · 5 سباقات (احتراف)</span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            محفوظ في التخزين المحلي (LocalStorage) · يُجدد تلقائياً كل يوم
          </span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.current / ach.max) * 100));

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800/70 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-500'
                  }`}
                >
                  {ach.icon}
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
                        تم الإنجاز
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                        {ach.current} / {ach.max}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      ach.unlocked
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-sky-500 to-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
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
