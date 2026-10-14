import React, { useState, useEffect } from 'react';
import { Play, Sun, Moon, Wrench, Gift, Target } from 'lucide-react';
import { getDailyChallengesSummary } from '../utils/dailyChallenges';

interface HeaderProps {
  onPlayClick: () => void;
  onOpenGarage: () => void;
  onOpenDailyChallenges?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPlayClick,
  onOpenGarage,
  onOpenDailyChallenges,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [dailySummary, setDailySummary] = useState(() => getDailyChallengesSummary());

  useEffect(() => {
    const handleUpdate = () => {
      setDailySummary(getDailyChallengesSummary());
    };
    window.addEventListener('daily_challenges_changed', handleUpdate);
    return () => {
      window.removeEventListener('daily_challenges_changed', handleUpdate);
    };
  }, []);

  const handleScrollToCars = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('cars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenGarage();
    }
  };

  return (
    <header className={`w-full border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isDark
        ? 'border-slate-800 bg-slate-950/85 text-slate-100'
        : 'border-slate-200 bg-white/90 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
        <a
          href="/"
          className="text-lg sm:text-xl font-black font-game tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <img
            src="/assets/logo.webp"
            alt="شعار لعبة سباق سيارات المدينة السريعة للأبطال"
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg object-contain shadow-xs border border-amber-500/20"
            loading="eager"
          />
          <span className="text-amber-500">سباق</span>
          <span>سيارات المدينة</span>
        </a>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium opacity-90">
          <a href="#game-container" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0">
            شاشة اللعبة
          </a>
          <a href="#daily-challenges" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0 font-bold text-amber-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>التحدي اليومي</span>
          </a>
          <a href="#leaderboard" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0 font-bold text-amber-400">
            لوحة المتصدرين 🏆
          </a>
          <a href="#instructions" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0">
            طريقة التحكم
          </a>
          <a
            href="#cars"
            onClick={handleScrollToCars}
            className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0 font-bold text-amber-500"
          >
            أنواع السيارات
          </a>
          <a href="#tips" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0">
            نصائح الفوز
          </a>
          <a href="#faq" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0">
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Zone 3: Actions (Theme Light/Dark Switcher + Daily Challenges + Garage + Play Now) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* زر التحدي اليومي والمكافآت */}
          {onOpenDailyChallenges && (
            <button
              onClick={onOpenDailyChallenges}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer relative ${
                dailySummary.unclaimedCount > 0
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20 animate-pulse'
                  : isDark
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="التحديات اليومية والمكافآت"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">التحدي اليومي</span>
              {dailySummary.unclaimedCount > 0 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping absolute -top-1 -right-1" />
              ) : (
                <span className="text-[10px] opacity-80 font-mono">({dailySummary.completed}/{dailySummary.total})</span>
              )}
            </button>
          )}

          {/* زر تغيير إضاءة الصفحة (Dark / Light Mode Toggle) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title={isDark ? 'التبديل إلى الوضع النهاري (إضاءة فاتحة)' : 'التبديل إلى الوضع الليلي (إضاءة داكنة)'}
            aria-label="Toggle Theme Lighting"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* زر أنواع السيارات / المرآب السريع */}
          <button
            onClick={onOpenGarage}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="المرآب لتطوير واختيار السيارات"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>المرآب</span>
          </button>

          {/* زر العب الآن */}
          <button
            onClick={onPlayClick}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>العب الآن</span>
          </button>
        </div>
      </div>
    </header>
  );
};

