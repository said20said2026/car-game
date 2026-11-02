import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Play, Sparkles, Check, Flame, Zap, Trophy, ShieldAlert, Timer } from 'lucide-react';
import { ARCADE_GAMES } from '../types/arcade';

export interface GameOption {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeEn: string;
  badgeAr: string;
  icon: string;
  poster: string;
  altTextEn: string;
  altTextAr: string;
}

export const ALL_GAMES_LIST: GameOption[] = [
  {
    id: 'apex-pulse',
    titleEn: 'Apex Pulse: Neon Horizon (3D)',
    titleAr: 'أبيكس بالس: الأفق النيوني (ثلاثية الأبعاد)',
    subtitleEn: 'Ultimate 3D Highway Traffic Racer with Nitro & 6 Supercars',
    subtitleAr: 'سباق سيارات ثلاثي الأبعاد على الطرق السريعة وتفادي المرور',
    badgeEn: 'Flagship 3D',
    badgeAr: 'اللعبة الرئيسية 3D',
    icon: '🏎️',
    poster: '/assets/logo.webp',
    altTextEn: 'Apex Pulse: Neon Horizon 3D Car Racing Game - Official Logo | لعبة سباق السيارات ثلاثية الأبعاد',
    altTextAr: 'شعار لعبة سباق السيارات ثلاثية الأبعاد أبيكس بالس الأفق النيوني',
  },
  {
    id: 'cyber-drift',
    titleEn: 'Cyber Drift: Tokyo Underground',
    titleAr: 'سايبر دريفت: طوكيو أندر جراوند',
    subtitleEn: 'High-Angle Night Drift Racing & x10 Combo Multipliers',
    subtitleAr: 'تفحيط ودريفت ليلي دقيق في شوارع طوكيو مع مضاعف x10',
    badgeEn: 'Tokyo Drift 🔥',
    badgeAr: 'دريفت طوكيو 🔥',
    icon: '🔥',
    poster: '/assets/games/cyber-drift.jpg',
    altTextEn: 'Cyber Drift Tokyo Underground - Japanese night street car drifting game | لعبة سايبر دريفت تفحيط السيارات في طوكيو',
    altTextAr: 'لعبة سايبر دريفت طوكيو - تفحيط ودريفت سيارات في شوارع طوكيو الليلية',
  },
  {
    id: 'neon-rider',
    titleEn: 'Neon Rider: Synthwave Circuit',
    titleAr: 'نيون رايدر: حلبة السينثويف',
    subtitleEn: 'Hypersonic Light-Bike Highway Runner & Plasma Shields',
    subtitleAr: 'سباق دراجات نيون ضوئية وقفز حواجز الليزر بسرعة خاطفة',
    badgeEn: 'Synthwave ⚡',
    badgeAr: 'سينثويف ⚡',
    icon: '⚡',
    poster: '/assets/games/neon-rider.jpg',
    altTextEn: 'Neon Rider Synthwave Circuit - Futuristic light-bike racing runner | لعبة نيون رايدر سباق دراجات نارية نيون',
    altTextAr: 'لعبة نيون رايدر - دراجات نارية ضوئية في حلبة السينثويف المستقبلية',
  },
  {
    id: 'hyper-drag',
    titleEn: 'Hyper Drag: Nitro Shift',
    titleAr: 'هايبر دراج: نيترو شيفت',
    subtitleEn: '1/4 Mile Drag Showdown, Christmas Tree Lights & Sweet-Spot Shifts',
    subtitleAr: 'سباق تسارع ربع ميل (402م) مع شجرة البداية ودقة تبديل السرعات',
    badgeEn: 'Drag Race ⏱️',
    badgeAr: 'سباق تسارع ⏱️',
    icon: '⏱️',
    poster: '/assets/games/hyper-drag.jpg',
    altTextEn: 'Hyper Drag Nitro Shift - Quarter-mile drag racing game showdown | لعبة هايبر دراج سباق تسارع السيارات',
    altTextAr: 'لعبة هايبر دراج نيترو شيفت - سباق تسارع السيارات ربع ميل مع نيران النيترو',
  },
  {
    id: 'retro-grand-prix',
    titleEn: 'Retro Speed 2D: Grand Prix Sprint',
    titleAr: 'ريترو سبيد: جائزة الجائزة الكبرى سبرينت',
    subtitleEn: 'Top-Down Formula Circuit Racing, 8 AI Rivals & Slipstream Drafting',
    subtitleAr: 'سباق حلبات فورمولا كلاسيكي مع 8 سيارات منافسة وسحب هوائي',
    badgeEn: 'Classic GP 🏁',
    badgeAr: 'فورمولا كلاسيك 🏁',
    icon: '🏁',
    poster: '/assets/games/retro-grand-prix.jpg',
    altTextEn: 'Retro Speed 2D Grand Prix Sprint - Formula 1 circuit racing game | لعبة ريترو سبيد سباق سيارات الفورمولا',
    altTextAr: 'لعبة ريترو سبيد سبرينت - سباق سيارات فورمولا وجي تي على حلبة ساحلية',
  },
  {
    id: 'highway-pursuit',
    titleEn: 'Highway Pursuit: Police Interceptor',
    titleAr: 'هايواي برسوت: مطاردة الشرطة',
    subtitleEn: 'High-Heat Police Escape, Roadblocks, Spikes & Tactical EMP Shockwaves',
    subtitleAr: 'مطاردة وهروب تكتيكي من دوريات وحواجز الشرطة مع صدمة EMP',
    badgeEn: 'Pursuit 🚨',
    badgeAr: 'مطاردة شرطة 🚨',
    icon: '🚨',
    poster: '/assets/games/highway-pursuit.jpg',
    altTextEn: 'Highway Pursuit Police Interceptor - Night highway police chase game | لعبة مطاردة الشرطة والهروب التكتيكي',
    altTextAr: 'لعبة هايواي برسوت - مطاردة ليلية سريعة لسيارة خارقة تهرب من دوريات الشرطة',
  },
];

interface GamesDropdownMenuProps {
  activeGameId?: string;
  onSelectGame?: (gameId: string) => void;
  currentLang?: string;
  theme?: 'dark' | 'light';
}

export const GamesDropdownMenu: React.FC<GamesDropdownMenuProps> = ({
  activeGameId = 'apex-pulse',
  onSelectGame,
  currentLang = 'en',
  theme = 'dark',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === 'dark';
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  const currentGame = ALL_GAMES_LIST.find((g) => g.id === activeGameId) || ALL_GAMES_LIST[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleChoose = (id: string) => {
    if (onSelectGame) {
      onSelectGame(id);
    }
    setIsOpen(false);
    const arena = document.getElementById('game-arena');
    arena?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={dropdownRef}
      className={`w-full border-b transition-colors relative z-30 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-200'
          : 'bg-slate-100/95 border-slate-200 text-slate-800'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 flex-wrap">
        {/* Main Dropdown Trigger Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              isOpen
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                : isDark
                ? 'bg-slate-950 hover:bg-slate-800 text-slate-100 border-amber-500/40 hover:border-amber-400'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-amber-500'
            }`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            title={isRTL ? 'قائمة الألعاب المتاحة - اختر لعبتك' : 'Available Games Menu - Select Game'}
          >
            <span className="text-base select-none">{currentGame.icon}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-game font-black tracking-wide text-xs sm:text-sm">
                {isRTL ? 'قائمة الألعاب:' : 'Games Menu:'}
              </span>
              <span className="text-[#ffcc00] font-black underline decoration-amber-400/50 underline-offset-2">
                {isRTL ? currentGame.titleAr : currentGame.titleEn}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isRTL ? 'متاحة الآن' : 'Active'}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-slate-950' : 'text-amber-400'
              }`}
            />
          </button>

          {/* Expanded Dropdown Menu Overlay */}
          {isOpen && (
            <div
              className={`absolute top-full mt-2 w-[310px] xs:w-[360px] sm:w-[440px] md:w-[480px] ${
                isRTL ? 'right-0' : 'left-0'
              } rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-slate-950/98 border-amber-500/30 divide-y divide-slate-800/80 shadow-black/80'
                  : 'bg-white/98 border-slate-300 divide-y divide-slate-100 shadow-slate-300/60'
              }`}
              role="listbox"
            >
              {/* Dropdown Header */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-game font-black text-xs text-amber-400 uppercase tracking-wider">
                    {isRTL ? 'اختر لعبتك المفضلة (6 ألعاب سريعة)' : 'Select Your Game (6 Fast Browser Racers)'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono font-bold">100% FREE</span>
              </div>

              {/* Games List Items */}
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                {ALL_GAMES_LIST.map((game) => {
                  const isSelected = activeGameId === game.id;

                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => handleChoose(game.id)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-amber-400/15 border border-amber-400/50 text-white'
                            : 'bg-amber-50 border border-amber-300 text-slate-900'
                          : isDark
                          ? 'hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 border border-transparent hover:border-slate-200 text-slate-700'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Left: Thumbnail & Titles */}
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-700/80 bg-slate-900">
                          <img
                            src={game.poster}
                            alt={isRTL ? game.altTextAr : game.altTextEn}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <span className="absolute bottom-0 right-0 text-[10px] bg-slate-950/80 px-1 rounded-tl">
                            {game.icon}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-black text-xs sm:text-sm font-game tracking-tight leading-tight ${
                              isSelected ? 'text-amber-400' : 'text-slate-100 group-hover:text-amber-300'
                            }`}>
                              {isRTL ? game.titleAr : game.titleEn}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                              {isRTL ? game.badgeAr : game.badgeEn}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {isRTL ? game.subtitleAr : game.subtitleEn}
                          </p>
                        </div>
                      </div>

                      {/* Right: Active Check or Play Arrow */}
                      <div className="shrink-0 flex items-center">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 group-hover:bg-amber-400 text-slate-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer CTA */}
              <div className="p-2.5 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {isRTL ? '🚀 تعمل مباشرة عبر المتصفح بدون تثبيت' : '🚀 60 FPS zero-download web racers'}
                </span>
                <a
                  href="#featured-games"
                  onClick={() => setIsOpen(false)}
                  className="text-amber-400 font-bold hover:underline"
                >
                  {isRTL ? 'الدليل الشامل 📖' : 'Full Guide 📖'}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Horizontal Mini-Links (Visible on tablet & desktop) */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <span className="mr-1 text-slate-400">{isRTL ? 'انتقال سريع:' : 'Quick Jump:'}</span>
          {ALL_GAMES_LIST.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => handleChoose(game.id)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeGameId === game.id
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'hover:text-amber-400 hover:bg-slate-800/60'
              }`}
            >
              <span>{game.icon}</span>
              <span className="truncate max-w-[110px]">{isRTL ? game.titleAr.split(':')[0] : game.titleEn.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
