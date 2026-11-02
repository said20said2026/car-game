import React, { useState } from 'react';
import { Play, Star, Zap, Award, Flame, Shield, HelpCircle, ChevronRight, ChevronDown, Wrench, Trophy, Sparkles } from 'lucide-react';
import { ARCADE_GAMES, ArcadeGameInfo } from '../types/arcade';

interface FeaturedGamesSectionProps {
  onSelectGame: (gameId: string) => void;
  activeGameId?: string;
  theme?: 'dark' | 'light';
  currentLang?: string;
}

export const FeaturedGamesSection: React.FC<FeaturedGamesSectionProps> = ({
  onSelectGame,
  activeGameId = 'apex-pulse',
  theme = 'dark',
  currentLang = 'en',
}) => {
  const isDark = theme === 'dark';
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(currentLang);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const filterOptions = [
    { id: 'all', labelEn: 'All Games (5)', labelAr: 'جميع الألعاب (5)' },
    { id: 'drift', labelEn: 'Drift & Precision', labelAr: 'دريفت وتفحيط' },
    { id: 'speed', labelEn: 'Speed & Reflex', labelAr: 'سرعة ورد فعل' },
    { id: 'timing', labelEn: 'Drag & Timing', labelAr: 'تسارع وتوقيت' },
    { id: 'action', labelEn: 'Action Pursuit', labelAr: 'مطاردة وأكشن' },
  ];

  const filteredGames = ARCADE_GAMES.filter((game) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'drift') return game.id === 'cyber-drift';
    if (selectedFilter === 'speed') return game.id === 'neon-rider' || game.id === 'retro-grand-prix';
    if (selectedFilter === 'timing') return game.id === 'hyper-drag';
    if (selectedFilter === 'action') return game.id === 'highway-pursuit';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedGameId(expandedGameId === id ? null : id);
  };

  return (
    <section
      id="featured-games"
      className={`scroll-mt-24 p-5 sm:p-8 rounded-3xl border transition-colors ${
        isDark
          ? 'bg-slate-900/60 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isRTL ? 'مكتبة الألعاب الممتازة المجانية' : 'Featured High-Quality Arcade Collection'}
            </span>
            <span className="text-xs text-slate-400 font-bold">5 {isRTL ? 'ألعاب حصرية جديدة' : 'New Exclusive Games'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-game text-[#ffcc00] tracking-tight">
            {isRTL ? 'ألعاب السباق والأكشن الممتازة (بدون تحميل)' : 'Premier 3D & 2D Arcade Racing Games'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            {isRTL
              ? 'مجموعة منتقاة من أروع ألعاب السباق والانجراف والتسارع ومطاردات الشرطة، مصممة بأعلى معايير الفيزياء والجرافيكس لتعمل بسلاسة فائقة 60 FPS مباشرة عبر المتصفح دون الحاجة لأي تثبيت أو تنزيل.'
              : 'Handcrafted high-octane racing experiences featuring authentic drift physics, synthwave circuits, quarter-mile drag timing, formula grand prix, and tactical police pursuits—all 100% free and playable right in your browser.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isRTL ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredGames.map((game) => {
          const isSelected = activeGameId === game.id;
          const isExpanded = expandedGameId === game.id;

          return (
            <div
              key={game.id}
              id={game.slug}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-900/90'
                  : isDark
                  ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:shadow-xl'
                  : 'bg-slate-50 border-slate-200 hover:border-amber-400/60 hover:shadow-md'
              }`}
            >
              {/* Game Artwork Poster with keyword-rich alt */}
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={game.poster}
                  alt={isRTL ? game.altTextAr : game.altTextEn}
                  width={640}
                  height={360}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-500/40 shadow-md">
                    {isRTL ? game.badgeAr : game.badge}
                  </span>
                </div>

                {/* Rating & Difficulty */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-950/90 backdrop-blur-md text-white border border-slate-700 flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{game.rating}</span>
                  </span>
                </div>

                {/* Quick Category banner */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800">
                  <span>{isRTL ? game.categoryAr : game.category}</span>
                  <span className="text-amber-400 font-bold">{isRTL ? game.difficultyAr : game.difficulty}</span>
                </div>
              </div>

              {/* Game Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-black font-game text-[#ffcc00] group-hover:text-amber-300 transition-colors">
                    {isRTL ? game.titleAr : game.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    {isRTL ? game.subtitleAr : game.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {isRTL ? game.shortDescAr : game.shortDescEn}
                  </p>
                </div>

                {/* Key Controls Quick Icons */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isRTL ? 'التحكم السريع:' : 'Controls:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {(isRTL ? game.controlsAr : game.controlsEn).slice(0, 2).map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300">
                        {c.key}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectGame(game.id);
                      const arena = document.getElementById('game-arena');
                      arena?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{isRTL ? 'العب الآن مجاناً' : 'Play Now Free'}</span>
                  </button>

                  <button
                    onClick={() => toggleExpand(game.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      isExpanded
                        ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    title={isRTL ? 'دليل اللعبة والمواصفات' : 'Game Guide & Details'}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Collapsible Deep Editorial Guide */}
              {isExpanded && (
                <div className="p-5 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                      {isRTL ? '📖 قصة وأسلوب اللعب:' : '📖 Game Synopsis & Overview:'}
                    </h4>
                    <p className="leading-relaxed text-slate-300 whitespace-pre-line">
                      {isRTL ? game.fullDescAr : game.fullDescEn}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1">
                      {isRTL ? '✨ الميزات الفنية الرئيسية:' : '✨ Key Features & Physics:'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {(isRTL ? game.featuresAr : game.featuresEn).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">
                      {isRTL ? '💡 نصائح الخبراء واستراتيجية الفوز:' : '💡 Pro Driver Tips & Strategies:'}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {(isRTL ? game.proTipsAr : game.proTipsEn).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comprehensive SEO Editorial Knowledge Base for Games */}
      <article className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-xl sm:text-2xl font-black font-game text-[#ffcc00]">
            {isRTL
              ? 'دليل ألعاب السيارات الاحترافية على المتصفح: السرعة، الدريفت، وتحديات التسارع'
              : 'The Ultimate Guide to Modern Browser Racing: Drift, Drag, Circuits, and Pursuits'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {isRTL
              ? 'استكشف التقنيات الهندسية ومحركات الويب التي تمنحك تجربة ألعاب أركيد متطورة بدون تنزيل، مع نصائح واستراتيجيات احترافية للتفوق.'
              : 'Explore the next-generation web technologies, physics engines, and strategic driving mechanics behind our zero-install browser arcade fleet.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-black text-amber-400 text-sm uppercase tracking-wide">
              {isRTL ? '1. فيزياء الدريفت والتحكم بالانزلاق (Drift Mechanics)' : '1. Advanced Drift Dynamics & Counter-Steer'}
            </h4>
            <p>
              {isRTL
                ? 'في ألعاب الدريفت مثل سايبر دريفت طوكيو، تعتمد السيارة على توازن دقيق بين نقل الوزن (Weight Transfer) وقوة سحب فرامل اليد. للحفاظ على دريفت طويل الزاوية، ابدأ بتوجيه العجلات نحو المنعطف واضغط الفرامل لجعل المؤخرة تنزلق، ثم اقلب التوجيه بالاتجاه المعاكس (Counter-Steer) مع الحفاظ على ضخ الوقود بنسب متقطعة لتجنب دوران السيارة حول نفسها.'
                : 'In games like Cyber Drift: Tokyo Underground, maintaining maximum slip angles relies on weight transfer and throttle modulation. Initiating a drift with the handbrake shifts vehicular mass forward while unlocking the rear differential. Master the delicate balance between counter-steering and throttle pulses to avoid spin-outs and extend combo chains.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-cyan-400 text-sm uppercase tracking-wide">
              {isRTL ? '2. دقة توقيت التسارع وناقل الحركة (Drag Timing)' : '2. Reaction Time & Optimal Gear Shift Windows'}
            </h4>
            <p>
              {isRTL
                ? 'سباقات التسارع ربع ميل (402 متر) في هايبر دراج تتطلب تركيزاً استثنائياً على شجرة الانطلاق (Christmas Tree). إن الانطلاق في اللحظة التي يضيء فيها آخر ضوء أصفر يمنحك زمن رد فعل مثالي (أقل من 0.200 ثانية). كما أن تبديل التروس في المنطقة الخضراء المحصورة بين 6800 و7400 دورة بالدقيقة يضمن بقاء المحرك في قمة منحنى عزم الدوران.'
                : 'Quarter-mile drag showdowns in Hyper Drag: Nitro Shift hinge on split-second reaction times and redline synchronization. Anticipating the final amber bulb on the Christmas Tree cuts crucial hundredths off your launch, while shifting within the green tachometer zone (6,800–7,400 RPM) guarantees peak horsepower delivery across every gear ratio.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-emerald-400 text-sm uppercase tracking-wide">
              {isRTL ? '3. السحب الهوائي والتجاوز في الحلبات (Slipstreaming)' : '3. Aerodynamic Drafting & Grand Prix Overtakes'}
            </h4>
            <p>
              {isRTL
                ? 'في ريترو سبيد جراند بري، يوفر البقاء خلف السيارات المنافسة مباشرة ما يعرف بـ "تيار السحب الهوائي المنخفض". يقلل هذا التيار من مقاومة الرياح على سيارتك ويشحن شريط التوربو، مما يتيح لك الاندفاع بقوة وتجاوز المنافسين قبل الوصول إلى نقطة الفرملة عند المنعطف التالي.'
                : 'In Retro Speed 2D: Grand Prix Sprint, racing behind leading cars creates an aerodynamic low-pressure pocket. Drafting in the slipstream reduces aerodynamic drag, charging your turbo bar to execute dramatic slingshot overtakes along straights right before critical braking zones.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-rose-400 text-sm uppercase tracking-wide">
              {isRTL ? '4. التكتيك والهروب من مطاردات الشرطة (Pursuit Evasion)' : '4. Tactical Highway Evasion & EMP Countermeasures'}
            </h4>
            <p>
              {isRTL
                ? 'لعبة هايواي برسوت تختبر سرعتك التكتيكية في النجاة. مع تصاعد نجوم المطلوبية من نجمة إلى خمس نجوم، تقوم دوريات الشرطة بمناورات محاصرة وتوزيع أشرطة المسامير. إن توجيه دوريات الشرطة نحو الشاحنات المدنية وإطلاق نبضة الـ EMP في التوقيت المناسب يمنحك فرصة ذهبية للهروب وتجميع المكافآت المالية.'
                : 'Highway Pursuit: Police Interceptor demands fast spatial awareness and defensive driving. High heat levels deploy helicopter searchlights, tactical roadblocks, and spike strips. Baited pit maneuvers against civilian traffic and strategic EMP shockwave releases provide vital breathers during multi-kilometer metropolitan pursuits.'}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
};
