import React from 'react';
import { Play, Sun, Moon, Wrench } from 'lucide-react';

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
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

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
          <span className="text-amber-500">ألعاب</span>
          <span>سباق سيارات المدينة</span>
        </a>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium opacity-90">
          <a href="#game-container" className="hover:text-amber-500 transition-colors whitespace-nowrap shrink-0">
            شاشة اللعبة
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
        </nav>

        {/* Zone 3: Actions (Theme Light/Dark Switcher + Garage + Play Now) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

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

