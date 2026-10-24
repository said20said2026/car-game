import { getTodayDateString, loadPlayerStats, savePlayerStats } from './storage';

export interface StreakRewardTier {
  day: number;
  coins: number;
  label: string;
  isJackpot?: boolean;
}

export const STREAK_REWARDS: StreakRewardTier[] = [
  { day: 1, coins: 50, label: 'Day 1' },
  { day: 2, coins: 100, label: 'Day 2' },
  { day: 3, coins: 175, label: 'Day 3' },
  { day: 4, coins: 250, label: 'Day 4' },
  { day: 5, coins: 350, label: 'Day 5' },
  { day: 6, coins: 500, label: 'Day 6' },
  { day: 7, coins: 1000, label: 'Day 7', isJackpot: true },
];

export interface DailyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastClaimDate: string | null;
  lastLoginDate: string;
  totalClaimedCoins: number;
}

export const DAILY_STREAK_STORAGE_KEY = 'fast_city_racing_daily_streak_v1';

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDaysBetween(dateStrA: string, dateStrB: string): number {
  const dateA = parseDate(dateStrA);
  const dateB = parseDate(dateStrB);
  const diffMs = dateB.getTime() - dateA.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function loadDailyStreak(): {
  streak: DailyStreakData;
  isClaimableToday: boolean;
  currentCycleDay: number; // 1 to 7
  todayRewardCoins: number;
} {
  const today = getTodayDateString();
  let data: DailyStreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastClaimDate: null,
    lastLoginDate: today,
    totalClaimedCoins: 0,
  };

  try {
    const raw = localStorage.getItem(DAILY_STREAK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.currentStreak === 'number') {
        data = {
          currentStreak: Math.max(0, parsed.currentStreak),
          longestStreak: Math.max(0, parsed.longestStreak || parsed.currentStreak),
          lastClaimDate: parsed.lastClaimDate || null,
          lastLoginDate: parsed.lastLoginDate || today,
          totalClaimedCoins: Math.max(0, parsed.totalClaimedCoins || 0),
        };
      }
    }
  } catch {}

  // Check consecutive days logic
  if (data.lastClaimDate) {
    const daysSinceClaim = getDaysBetween(data.lastClaimDate, today);

    if (daysSinceClaim === 0) {
      // Already claimed today
      const cycleDay = ((data.currentStreak - 1) % 7) + 1;
      const todayReward = STREAK_REWARDS[cycleDay - 1].coins;
      return {
        streak: data,
        isClaimableToday: false,
        currentCycleDay: cycleDay,
        todayRewardCoins: todayReward,
      };
    } else if (daysSinceClaim === 1) {
      // Consecutive login yesterday -> streak is ready to advance by 1
      const nextStreak = data.currentStreak + 1;
      const nextCycleDay = ((nextStreak - 1) % 7) + 1;
      const todayReward = STREAK_REWARDS[nextCycleDay - 1].coins;
      return {
        streak: data,
        isClaimableToday: true,
        currentCycleDay: nextCycleDay,
        todayRewardCoins: todayReward,
      };
    } else {
      // Missed more than 1 day -> streak breaks and resets to Day 1
      const resetStreak = 0;
      const cycleDay = 1;
      const todayReward = STREAK_REWARDS[0].coins;
      return {
        streak: {
          ...data,
          currentStreak: resetStreak,
        },
        isClaimableToday: true,
        currentCycleDay: cycleDay,
        todayRewardCoins: todayReward,
      };
    }
  }

  // First time ever playing -> Day 1 ready to claim
  return {
    streak: data,
    isClaimableToday: true,
    currentCycleDay: 1,
    todayRewardCoins: STREAK_REWARDS[0].coins,
  };
}

export function claimDailyStreakBonus(): {
  success: boolean;
  rewardCoins: number;
  streak: DailyStreakData;
  newCoins: number;
  message: string;
} {
  const { streak, isClaimableToday, currentCycleDay, todayRewardCoins } = loadDailyStreak();
  const today = getTodayDateString();

  if (!isClaimableToday) {
    const stats = loadPlayerStats();
    return {
      success: false,
      rewardCoins: 0,
      streak,
      newCoins: stats.coins,
      message: 'You already claimed your streak reward for today! Come back tomorrow.',
    };
  }

  // Advance streak
  const newStreakCount = (streak.lastClaimDate && getDaysBetween(streak.lastClaimDate, today) === 1)
    ? streak.currentStreak + 1
    : 1;

  const newLongestStreak = Math.max(streak.longestStreak, newStreakCount);
  const rewardCoins = todayRewardCoins;

  const updatedStreak: DailyStreakData = {
    currentStreak: newStreakCount,
    longestStreak: newLongestStreak,
    lastClaimDate: today,
    lastLoginDate: today,
    totalClaimedCoins: streak.totalClaimedCoins + rewardCoins,
  };

  try {
    localStorage.setItem(DAILY_STREAK_STORAGE_KEY, JSON.stringify(updatedStreak));
  } catch {}

  // Credit coins to player stats
  const stats = loadPlayerStats();
  const newCoins = (stats.coins || 0) + rewardCoins;
  stats.coins = newCoins;
  savePlayerStats(stats);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins_updated', { detail: { coins: newCoins } }));
    window.dispatchEvent(new CustomEvent('daily_streak_changed', { detail: updatedStreak }));
    window.dispatchEvent(new CustomEvent('daily_challenges_changed'));
  }

  const isJackpot = currentCycleDay === 7;
  const message = isJackpot
    ? `🔥 7-DAY JACKPOT CLAIMED! Received +${rewardCoins} Gold Coins!`
    : `🔥 Day ${newStreakCount} Streak Bonus: +${rewardCoins} Gold Coins added!`;

  return {
    success: true,
    rewardCoins,
    streak: updatedStreak,
    newCoins,
    message,
  };
}
