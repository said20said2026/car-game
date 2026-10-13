import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  User,
  Check,
  Flame,
  Sparkles,
  Zap,
  RotateCcw,
  Car,
  Calendar,
  Send,
  Edit2
} from 'lucide-react';
import {
  LeaderboardEntry,
  loadLeaderboard,
  saveLeaderboard,
  addLeaderboardScore,
  loadPlayerName,
  savePlayerName,
  resetLeaderboard,
  loadPlayerStats
} from '../utils/storage';

interface LeaderboardProps {
  theme?: 'dark' | 'light';
  onPlayNow?: () => void;
}

const NAME_SUGGESTIONS = [
  'كابتن السرعة ⚡',
  'صقر الأسفلت 🦅',
  'شبح الحلبة 🏁',
  'توربو الخارق 🚀',
  'فارس الظلام 🌙',
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ theme = 'dark', onPlayNow }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [playerName, setPlayerName] = useState<string>(() => loadPlayerName());
  const [nameInput, setNameInput] = useState<string>(() => loadPlayerName());
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [rankAchieved, setRankAchieved] = useState<number | null>(null);
  const [customScoreInput, setCustomScoreInput] = useState<string>('');
  const [showAddScoreModal, setShowAddScoreModal] = useState<boolean>(false);

  // Read current player stats for high score
  const playerStats = loadPlayerStats();
  const currentHighScore = playerStats.highScore || 0;

  useEffect(() => {
    const handleLeaderboardUpdate = () => {
      setEntries(loadLeaderboard());
    };
    const handleNameUpdate = () => {
      const name = loadPlayerName();
      setPlayerName(name);
      setNameInput(name);
    };

    window.addEventListener('leaderboard_changed', handleLeaderboardUpdate);
    window.addEventListener('player_name_changed', handleNameUpdate);
    window.addEventListener('storage', handleLeaderboardUpdate);

    return () => {
      window.removeEventListener('leaderboard_changed', handleLeaderboardUpdate);
      window.removeEventListener('player_name_changed', handleNameUpdate);
      window.removeEventListener('storage', handleLeaderboardUpdate);
    };
  }, []);

  const handleSaveName = (nameToSave?: string) => {
    const target = (nameToSave !== undefined ? nameToSave : nameInput).trim();
    if (!target) return;
    const saved = savePlayerName(target);
    setPlayerName(saved);
    setNameInput(saved);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleSubmitScore = (scoreValue: number) => {
    if (scoreValue <= 0) return;
    const result = addLeaderboardScore(nameInput.trim() || playerName, scoreValue, 'سيارة السباق');
    setEntries(result.entries);
    setRankAchieved(result.rank);
    setShowAddScoreModal(false);
    setCustomScoreInput('');
    setTimeout(() => setRankAchieved(null), 5000);
  };

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة قائمة المتصدرين الافتراضية؟')) {
      const reset = resetLeaderboard();
      setEntries(reset);
      setRankAchieved(null);
    }
  };

  const isDark = theme === 'dark';

  return (
    <section
      id="leaderboard"
      aria-label="قائمة المتصدرين"
      className={`scroll-mt-20 my-8 rounded-2xl p-4 sm:p-7 border transition-all ${
        isDark
          ? 'bg-slate-900/85 border-slate-800 text-white shadow-2xl shadow-black/40'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* رأس المكون - متمركز في وسط الصفحة */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800/80">
        {/* أيقونة كأس لوحة المتصدرين 🏆 متمركزة في وسط الصفحة */}
        <div className="relative mb-3.5 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/40 transform hover:scale-105 transition-all">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 drop-shadow-md" />
          </div>
          {/* تأثير توهج نيون خلف أيقونة الكأس في الوسط */}
          <div className="absolute -inset-3 bg-amber-500/25 blur-xl rounded-full -z-10 pointer-events-none" />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-game tracking-tight">
              لوحة المتصدرين 🏆 (Leaderboard)
            </h2>
            <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              أفضل 5 أبطال
            </span>
          </div>
          <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            سجل أرقامك القياسية وتنافس للوصول إلى قمة المتصدرين في شوارع المدينة السريعة
          </p>
        </div>

        {/* أزرار الإجراءات العلوية متمركزة في وسط الصفحة */}
        <div className="flex items-center justify-center gap-2.5 mt-4 flex-wrap">
          {currentHighScore > 0 && (
            <button
              type="button"
              onClick={() => handleSubmitScore(currentHighScore)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="إدراج رقمك القياسي الحالي في القائمة"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تسجيل رقمي ({currentHighScore.toLocaleString()})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddScoreModal(!showAddScoreModal)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>تسجيل نتيجة</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/80'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title="استعادة القائمة الافتراضية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* تنبيه تحقيق مركز في القائمة */}
      {rankAchieved !== null && (
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-bold">
              تهانينا يا {playerName}! لقد حجزت المركز{' '}
              <strong className="text-amber-300 font-game text-base">#{rankAchieved}</strong> في لوحة أفضل 5 لاعبين!
            </span>
          </div>
          <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2.5 py-1 rounded-lg font-bold">
            محفوظ بنجاح
          </span>
        </div>
      )}

      {/* قسم تخصيص اسم اللاعب */}
      <div
        className={`mt-5 p-4 rounded-xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">اسمك في السباق:</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/30 font-game">
              {playerName}
            </span>
          </div>

          {/* نموذج إدخال وحفظ اسم اللاعب */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveName();
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={25}
                placeholder="أدخل اسمك كمتسابق..."
                className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/50'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              {isSavedNotice ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isSavedNotice ? 'تم الحفظ!' : 'حفظ الاسم'}</span>
            </button>
          </form>
        </div>

        {/* اقتراحات سريعة لأسماء المتسابقين */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            اقتراحات سريعة:
          </span>
          {NAME_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSaveName(suggestion)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-amber-400/60'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-amber-500'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* نافذة منبثقة بسيطة لتسجيل نتيجة يدوياً إن رغب المستخدم */}
      {showAddScoreModal && (
        <div
          className={`mt-4 p-4 rounded-xl border animate-fadeIn ${
            isDark ? 'bg-slate-950/80 border-amber-500/40' : 'bg-amber-50/70 border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">تسجيل نتيجة جديدة في لوحة المتصدرين</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddScoreModal(false)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(customScoreInput, 10);
              if (!isNaN(val) && val > 0) {
                handleSubmitScore(val);
              }
            }}
            className="flex flex-col sm:flex-row items-center gap-2.5"
          >
            <input
              type="number"
              min="1"
              max="999999"
              value={customScoreInput}
              onChange={(e) => setCustomScoreInput(e.target.value)}
              placeholder="اكتب النقاط (مثال: 12500)..."
              className={`w-full sm:flex-1 px-3 py-2 text-xs rounded-lg border outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
              }`}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              تسجيل في اللوحة الآن
            </button>
          </form>
        </div>
      )}

      {/* قائمة أفضل 5 لاعبين */}
      <div className="mt-6 space-y-2.5">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;
          const isCurrent = entry.isCurrentPlayer || entry.name === playerName;

          return (
            <div
              key={entry.id || `rank-${rank}`}
              className={`relative overflow-hidden rounded-xl p-3.5 sm:p-4 border transition-all flex items-center justify-between gap-3 ${
                isGold
                  ? isDark
                    ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-slate-900/60 border-amber-400/50 shadow-md shadow-amber-500/10'
                    : 'bg-amber-50/70 border-amber-300 text-slate-900'
                  : isSilver
                  ? isDark
                    ? 'bg-gradient-to-r from-slate-300/10 via-slate-400/5 to-slate-900/60 border-slate-300/40'
                    : 'bg-slate-100/70 border-slate-300 text-slate-900'
                  : isBronze
                  ? isDark
                    ? 'bg-gradient-to-r from-amber-700/15 via-amber-800/10 to-slate-900/60 border-amber-600/40'
                    : 'bg-amber-100/40 border-amber-400/40 text-slate-900'
                  : isDark
                  ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  : 'bg-white border-slate-200'
              } ${isCurrent ? 'ring-2 ring-emerald-400/60' : ''}`}
            >
              {/* الترتيب والمعلومات */}
              <div className="flex items-center gap-3 min-w-0">
                {/* شارة الترتيب */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black font-game text-sm shrink-0 shadow-xs ${
                    isGold
                      ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-300/60'
                      : isSilver
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 ring-2 ring-slate-300/60'
                      : isBronze
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white ring-2 ring-amber-600/60'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isGold ? (
                    <Crown className="w-5 h-5 fill-slate-950" />
                  ) : isSilver ? (
                    <Medal className="w-5 h-5 fill-slate-950" />
                  ) : isBronze ? (
                    <Medal className="w-4 h-4 fill-white" />
                  ) : (
                    <span>#{rank}</span>
                  )}
                </div>

                {/* اسم المتسابق والتفاصيل */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base truncate">{entry.name}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                        أنت
                      </span>
                    )}
                    {isGold && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                        متصدر البطولة
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[11px] mt-0.5 flex-wrap ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {entry.carName && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-slate-400" />
                        <span>{entry.carName}</span>
                      </span>
                    )}
                    {entry.date && (
                      <span className="flex items-center gap-1 opacity-80">
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{entry.date}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* مجموع النقاط */}
              <div className="text-end shrink-0 ps-2">
                <div
                  className={`text-base sm:text-xl font-black font-game tracking-tight tabular-nums ${
                    isGold
                      ? 'text-amber-400'
                      : isSilver
                      ? 'text-slate-200'
                      : isBronze
                      ? 'text-amber-500'
                      : 'text-emerald-400'
                  }`}
                >
                  {entry.score.toLocaleString()}
                </div>
                <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  نقطة
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* شريط الإحصائيات والمعلومات التوضيحية */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            تحديث تلقائي:
          </span>
          <span>تُحفظ أفضل 5 أرقام قياسية في التخزين المحلي (LocalStorage) لكل سباق.</span>
        </div>

        {onPlayNow && (
          <button
            type="button"
            onClick={onPlayNow}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>انطلق لتحطيم الرقم القياسي الآن</span>
            <span>←</span>
          </button>
        )}
      </div>
    </section>
  );
};
