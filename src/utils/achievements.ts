import { PlayerStats } from '../types/game';
import { loadPlayerStats, savePlayerStats, loadDailyRaces } from './storage';
import { soundManager } from './audio';

export interface ToastNotification {
  id: string;
  type: 'achievement' | 'record' | 'overtake';
  title: string;
  description: string;
  iconName?: 'trophy' | 'flame' | 'zap' | 'award' | 'coins' | 'flag' | 'car' | 'sparkles' | 'target';
  reward?: number;
  badgeText?: string;
  timestamp: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'overtake' | 'record' | 'races' | 'distance' | 'garage';
  iconName: 'trophy' | 'flame' | 'zap' | 'award' | 'coins' | 'flag' | 'car' | 'sparkles' | 'target';
  targetValue: number;
  reward: number; // Coins rewarded
  getValue: (stats: PlayerStats, dailyCount: number) => number;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'first_race',
    title: 'الانطلاقة الأولى',
    description: 'أكمل أول سباق لك في شوارع المدينة',
    category: 'races',
    iconName: 'flag',
    targetValue: 1,
    reward: 50,
    getValue: (stats) => stats.racesCount || 0,
  },
  {
    id: 'daily_racer',
    title: 'بطل السباقات اليومية',
    description: 'خُض 3 سباقات على الأقل خلال نفس اليوم',
    category: 'races',
    iconName: 'flame',
    targetValue: 3,
    reward: 200,
    getValue: (_, dailyCount) => dailyCount,
  },
  {
    id: 'ten_races',
    title: 'متسابق محترف',
    description: 'شارك في 10 سباقات مختلفة في مسيرتك',
    category: 'races',
    iconName: 'trophy',
    targetValue: 10,
    reward: 300,
    getValue: (stats) => stats.racesCount || 0,
  },
  {
    id: 'overtake_10',
    title: 'مناور مبتدئ',
    description: 'تجاوز 10 سيارات بنجاح في شوارع المدينة',
    category: 'overtake',
    iconName: 'zap',
    targetValue: 10,
    reward: 150,
    getValue: (stats) => stats.totalOvertakes || 0,
  },
  {
    id: 'overtake_30',
    title: 'سيد التجاوز السريع',
    description: 'تجاوز 30 سيارة بنجاح دون اصطدام',
    category: 'overtake',
    iconName: 'car',
    targetValue: 30,
    reward: 250,
    getValue: (stats) => stats.totalOvertakes || 0,
  },
  {
    id: 'overtake_60',
    title: 'ملك الطرق السريعة',
    description: 'تجاوز 60 سيارة في مسيرتك الاحترافية',
    category: 'overtake',
    iconName: 'flame',
    targetValue: 60,
    reward: 400,
    getValue: (stats) => stats.totalOvertakes || 0,
  },
  {
    id: 'overtake_100',
    title: 'أسطورة المناورات',
    description: 'تجاوز 100 سيارة وأثبت تفوقك المطلق على الجميع',
    category: 'overtake',
    iconName: 'trophy',
    targetValue: 100,
    reward: 600,
    getValue: (stats) => stats.totalOvertakes || 0,
  },
  {
    id: 'top_speed',
    title: 'سرعة البرق',
    description: 'حقق رقماً قياسياً بالنقاط يتجاوز 1,500 نقطة',
    category: 'record',
    iconName: 'zap',
    targetValue: 1500,
    reward: 200,
    getValue: (stats) => stats.highScore || 0,
  },
  {
    id: 'record_breaker',
    title: 'كاسر الأرقام القياسية',
    description: 'حقق رقماً قياسياً استثنائياً يتجاوز 3,000 نقطة',
    category: 'record',
    iconName: 'trophy',
    targetValue: 3000,
    reward: 350,
    getValue: (stats) => stats.highScore || 0,
  },
  {
    id: 'coin_collector',
    title: 'جامع الذهب',
    description: 'اجمع أكثر من 500 عملة ذهبية في رصيدك',
    category: 'garage',
    iconName: 'coins',
    targetValue: 500,
    reward: 150,
    getValue: (stats) => stats.coins || 0,
  },
  {
    id: 'marathon_driver',
    title: 'قاطع المسافات',
    description: 'اقطع مسافة تزيد عن 2,000 متر في سباق واحد',
    category: 'distance',
    iconName: 'award',
    targetValue: 2000,
    reward: 250,
    getValue: (stats) => stats.maxDistance || 0,
  },
  {
    id: 'car_collector',
    title: 'عاشق السيارات الخارقة',
    description: 'افتح سيارتين على الأقل في المرآب الخاص بك',
    category: 'garage',
    iconName: 'car',
    targetValue: 2,
    reward: 400,
    getValue: (stats) => stats.unlockedCars?.length || 1,
  },
];

/**
 * Dispatch a dynamic in-game / site-wide toast notification
 */
export function dispatchGameToast(toast: Omit<ToastNotification, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;

  const fullToast: ToastNotification = {
    ...toast,
    id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
  };

  // Play sound according to toast type
  try {
    if (fullToast.type === 'record') {
      soundManager.playRecordBreakFanfare();
    } else if (fullToast.type === 'achievement') {
      soundManager.playAchievementUnlock();
    } else {
      soundManager.playRewardFanfare();
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('racing_game_toast', { detail: fullToast }));
}

/**
 * Check and unlock any eligible achievements in real-time.
 * If new achievements are unlocked, rewards are automatically credited,
 * toasts are dispatched, and stats are saved.
 */
export function checkAndUnlockAchievements(
  currentStats?: PlayerStats,
  customDailyCount?: number
): AchievementDef[] {
  const stats = currentStats || loadPlayerStats();
  const dailyCount = customDailyCount !== undefined ? customDailyCount : loadDailyRaces().count;

  if (!stats.unlockedAchievements) {
    stats.unlockedAchievements = [];
  }

  const newlyUnlocked: AchievementDef[] = [];

  for (const ach of ACHIEVEMENTS_LIST) {
    const val = ach.getValue(stats, dailyCount);
    const isUnlocked = val >= ach.targetValue;

    if (isUnlocked && !stats.unlockedAchievements.includes(ach.id)) {
      stats.unlockedAchievements.push(ach.id);
      stats.coins = (stats.coins || 0) + ach.reward;
      newlyUnlocked.push(ach);

      // Trigger celebratory toast
      dispatchGameToast({
        type: 'achievement',
        title: `إنجاز جديد: ${ach.title}! 🏆`,
        description: `${ach.description} (+${ach.reward} عملة ذهبية)`,
        iconName: ach.iconName,
        reward: ach.reward,
        badgeText: 'إنجاز مكتمل',
      });
    }
  }

  if (newlyUnlocked.length > 0) {
    savePlayerStats(stats);
  }

  return newlyUnlocked;
}
