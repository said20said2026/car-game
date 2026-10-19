import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Coins,
  Flag,
  Car,
  Sparkles,
  Target,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ToastNotification } from '../utils/achievements';

interface AchievementToastProps {
  className?: string;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ className = '' }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastNotification>;
      if (!customEvent.detail) return;

      const newToast = customEvent.detail;
      setToasts((prev) => {
        // Keep max 3 toasts at once, prepend newest
        const filtered = prev.filter((t) => t.id !== newToast.id);
        return [newToast, ...filtered].slice(0, 3);
      });

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('racing_game_toast', handleNewToast);
    return () => {
      window.removeEventListener('racing_game_toast', handleNewToast);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  const renderIcon = (toast: ToastNotification) => {
    const iconName = toast.iconName;
    const baseClass = 'w-5 h-5 shrink-0';

    if (toast.type === 'record') {
      return <Trophy className={`${baseClass} text-amber-300 animate-pulse`} />;
    }
    if (toast.type === 'overtake') {
      return <Zap className={`${baseClass} text-cyan-300 animate-bounce`} />;
    }

    switch (iconName) {
      case 'trophy':
        return <Trophy className={`${baseClass} text-amber-400`} />;
      case 'flame':
        return <Flame className={`${baseClass} text-orange-400`} />;
      case 'zap':
        return <Zap className={`${baseClass} text-sky-400`} />;
      case 'award':
        return <Award className={`${baseClass} text-purple-400`} />;
      case 'coins':
        return <Coins className={`${baseClass} text-yellow-400`} />;
      case 'flag':
        return <Flag className={`${baseClass} text-emerald-400`} />;
      case 'car':
        return <Car className={`${baseClass} text-rose-400`} />;
      case 'sparkles':
        return <Sparkles className={`${baseClass} text-amber-300`} />;
      case 'target':
        return <Target className={`${baseClass} text-red-400`} />;
      default:
        return <CheckCircle2 className={`${baseClass} text-emerald-400`} />;
    }
  };

  const getStyleClasses = (toast: ToastNotification) => {
    if (toast.type === 'record') {
      return {
        border: 'border-amber-400/80 shadow-amber-500/25',
        bg: 'from-slate-950 via-amber-950/80 to-slate-950',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        title: 'text-amber-300',
      };
    }
    if (toast.type === 'overtake') {
      return {
        border: 'border-cyan-400/80 shadow-cyan-500/25',
        bg: 'from-slate-950 via-cyan-950/80 to-slate-950',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        title: 'text-cyan-300',
      };
    }
    return {
      border: 'border-emerald-400/80 shadow-emerald-500/25',
      bg: 'from-slate-950 via-emerald-950/80 to-slate-950',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: 'text-emerald-300',
    };
  };

  return (
    <div
      className={`absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2.5 w-[92vw] max-w-md pointer-events-none ${className}`}
      dir="ltr"
    >
      {toasts.map((toast) => {
        const theme = getStyleClasses(toast);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-gradient-to-r ${theme.bg} border ${theme.border} p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
          >
            {/* Shimmer line effect */}
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner">
                  {renderIcon(toast)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm sm:text-base font-black font-game ${theme.title} tracking-tight`}>
                      {toast.title}
                    </h4>
                    {toast.badgeText && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}
                      >
                        {toast.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{toast.description}</p>
                </div>
              </div>

              {/* Close Button & Reward pill */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  onClick={() => handleDismiss(toast.id)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Dismiss Notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {toast.reward && toast.reward > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg shadow-xs">
                    <Coins className="w-3 h-3" />
                    <span>+{toast.reward}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
