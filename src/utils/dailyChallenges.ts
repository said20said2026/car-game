import { loadPlayerStats, savePlayerStats, getTodayDateString } from './storage';
import { loadDailyStreak } from './dailyStreak';

export type DailyMissionType =
  | 'distance'
  | 'coins'
  | 'races'
  | 'near_miss'
  | 'single_score'
  | 'nitro_boost';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  rewardCoins: number;
  claimed: boolean;
  iconName: 'distance' | 'coins' | 'races' | 'near_miss' | 'score' | 'nitro';
}

export interface DailyChallengesState {
  date: string;
  missions: DailyMission[];
  grandChestClaimed: boolean;
  grandRewardCoins: number;
}

export const DAILY_CHALLENGES_STORAGE_KEY = 'fast_city_racing_daily_challenges_v1';
export const GRAND_CHEST_REWARD_COINS = 300;

/**
 * Deterministic pseudo-random number generator based on date string
 */
function getDateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates fresh daily missions deterministically for a given date
 */
export function generateDailyMissions(dateStr: string): DailyMission[] {
  const hash = getDateHash(dateStr);

  // Pool of mission variations
  const distanceVariants = [
    { target: 2000, reward: 120, title: 'Daily Distance Driver', desc: 'Drive a total distance of 2,000 meters on city highways' },
    { target: 2500, reward: 150, title: 'Highway Cruiser', desc: 'Drive a total distance of 2,500 meters today' },
    { target: 3000, reward: 180, title: 'High-Speed Marathon', desc: 'Cover an epic 3,000 meters total distance today' },
  ];

  const coinsVariants = [
    { target: 40, reward: 120, title: 'Daily Gold Collector', desc: 'Collect 40 gold coins on the road during today\'s races' },
    { target: 60, reward: 150, title: 'Shiny Treasure Hunter', desc: 'Snag 60 gold coins on the road today' },
    { target: 80, reward: 200, title: 'City Road Fortune', desc: 'Gather 80 gold coins today to upgrade your garage fleet' },
  ];

  const skillVariants = [
    {
      type: 'near_miss' as DailyMissionType,
      target: 5,
      reward: 150,
      title: 'Near Miss Master',
      desc: 'Dodge 5 traffic cars with high-thrill close near-miss passes',
      unit: 'times',
      iconName: 'near_miss' as const,
    },
    {
      type: 'nitro_boost' as DailyMissionType,
      target: 6,
      reward: 150,
      title: 'Nitro Boost Addict',
      desc: 'Ignite nitrous boost 6 times for supersonic speeds',
      unit: 'times',
      iconName: 'nitro' as const,
    },
    {
      type: 'single_score' as DailyMissionType,
      target: 800,
      reward: 180,
      title: 'Record Breaker',
      desc: 'Score at least 800 points in a single racing session',
      unit: 'pts',
      iconName: 'score' as const,
    },
    {
      type: 'races' as DailyMissionType,
      target: 3,
      reward: 150,
      title: 'Active Daily Racer',
      desc: 'Complete 3 full races today to prove your driving skills',
      unit: 'races',
      iconName: 'races' as const,
    },
  ];

  const distChoice = distanceVariants[hash % distanceVariants.length];
  const coinsChoice = coinsVariants[(hash >> 2) % coinsVariants.length];
  const skillChoice = skillVariants[(hash >> 4) % skillVariants.length];

  return [
    {
      id: `m-dist-${dateStr}`,
      type: 'distance',
      title: distChoice.title,
      description: distChoice.desc,
      target: distChoice.target,
      current: 0,
      unit: 'm',
      rewardCoins: distChoice.reward,
      claimed: false,
      iconName: 'distance',
    },
    {
      id: `m-coins-${dateStr}`,
      type: 'coins',
      title: coinsChoice.title,
      description: coinsChoice.desc,
      target: coinsChoice.target,
      current: 0,
      unit: 'coins',
      rewardCoins: coinsChoice.reward,
      claimed: false,
      iconName: 'coins',
    },
    {
      id: `m-${skillChoice.type}-${dateStr}`,
      type: skillChoice.type,
      title: skillChoice.title,
      description: skillChoice.desc,
      target: skillChoice.target,
      current: 0,
      unit: skillChoice.unit,
      rewardCoins: skillChoice.reward,
      claimed: false,
      iconName: skillChoice.iconName,
    },
  ];
}

/**
 * Loads current daily challenges from storage. If a new day has arrived, refreshes challenges.
 */
export function loadDailyChallenges(): DailyChallengesState {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(DAILY_CHALLENGES_STORAGE_KEY);
    if (raw) {
      const parsed: DailyChallengesState = JSON.parse(raw);
      if (parsed && parsed.date === today && Array.isArray(parsed.missions) && parsed.missions.length === 3) {
        return parsed;
      }
    }
  } catch {}

  // Initialize new state for today
  const freshMissions = generateDailyMissions(today);
  const newState: DailyChallengesState = {
    date: today,
    missions: freshMissions,
    grandChestClaimed: false,
    grandRewardCoins: GRAND_CHEST_REWARD_COINS,
  };
  saveDailyChallenges(newState);
  return newState;
}

/**
 * Saves daily challenges state and emits custom event for UI reactivity
 */
export function saveDailyChallenges(state: DailyChallengesState): void {
  try {
    localStorage.setItem(DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify(state));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('daily_challenges_changed', { detail: state }));
  }
}

/**
 * Records progress towards daily missions from a race run
 */
export function recordDailyChallengeProgress(delta: {
  distance?: number;
  coins?: number;
  nearMisses?: number;
  races?: number;
  singleScore?: number;
  nitroBoosts?: number;
}): DailyChallengesState {
  const state = loadDailyChallenges();
  let changed = false;

  state.missions = state.missions.map((mission) => {
    let addValue = 0;
    if (mission.type === 'distance' && delta.distance) {
      addValue = Math.floor(delta.distance);
    } else if (mission.type === 'coins' && delta.coins) {
      addValue = delta.coins;
    } else if (mission.type === 'near_miss' && delta.nearMisses) {
      addValue = delta.nearMisses;
    } else if (mission.type === 'races' && delta.races) {
      addValue = delta.races;
    } else if (mission.type === 'nitro_boost' && delta.nitroBoosts) {
      addValue = delta.nitroBoosts;
    } else if (mission.type === 'single_score' && delta.singleScore) {
      // Single score is high watermark
      const newScore = Math.max(mission.current, Math.floor(delta.singleScore));
      if (newScore !== mission.current) {
        changed = true;
        return { ...mission, current: newScore };
      }
      return mission;
    }

    if (addValue > 0) {
      changed = true;
      return {
        ...mission,
        current: Math.min(mission.target * 2, mission.current + addValue),
      };
    }
    return mission;
  });

  if (changed) {
    saveDailyChallenges(state);
  }
  return state;
}

/**
 * Claims reward for an individual completed daily mission
 */
export function claimDailyMissionReward(missionId: string): {
  success: boolean;
  rewardCoins: number;
  newState: DailyChallengesState;
} {
  const state = loadDailyChallenges();
  const mission = state.missions.find((m) => m.id === missionId);

  if (!mission || mission.claimed || mission.current < mission.target) {
    return { success: false, rewardCoins: 0, newState: state };
  }

  mission.claimed = true;
  saveDailyChallenges(state);

  // Credit coins to player stats
  const stats = loadPlayerStats();
  const newCoins = (stats.coins || 0) + mission.rewardCoins;
  stats.coins = newCoins;
  savePlayerStats(stats);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins_updated', { detail: { coins: newCoins } }));
  }

  return { success: true, rewardCoins: mission.rewardCoins, newState: state };
}

/**
 * Claims Grand Chest reward when all 3 daily missions are completed
 */
export function claimGrandDailyChest(): {
  success: boolean;
  rewardCoins: number;
  newState: DailyChallengesState;
} {
  const state = loadDailyChallenges();
  const allCompleted = state.missions.every((m) => m.current >= m.target);

  if (!allCompleted || state.grandChestClaimed) {
    return { success: false, rewardCoins: 0, newState: state };
  }

  state.grandChestClaimed = true;
  saveDailyChallenges(state);

  // Credit grand bonus coins to player
  const stats = loadPlayerStats();
  const newCoins = (stats.coins || 0) + state.grandRewardCoins;
  stats.coins = newCoins;
  savePlayerStats(stats);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins_updated', { detail: { coins: newCoins } }));
  }

  return { success: true, rewardCoins: state.grandRewardCoins, newState: state };
}

/**
 * Quick summary of completed/unclaimed missions
 */
export function getDailyChallengesSummary(state = loadDailyChallenges()): {
  total: number;
  completed: number;
  claimed: number;
  unclaimedCount: number;
  allDone: boolean;
  grandReady: boolean;
  grandClaimed: boolean;
  streakClaimable: boolean;
  currentStreak: number;
} {
  const streakInfo = loadDailyStreak();
  const total = state.missions.length;
  const completed = state.missions.filter((m) => m.current >= m.target).length;
  const claimed = state.missions.filter((m) => m.claimed).length;
  const unclaimedMissions = state.missions.filter((m) => m.current >= m.target && !m.claimed).length;
  const grandReady = completed === total && !state.grandChestClaimed;
  const streakClaimable = streakInfo.isClaimableToday;
  const unclaimedCount = unclaimedMissions + (grandReady ? 1 : 0) + (streakClaimable ? 1 : 0);

  return {
    total,
    completed,
    claimed,
    unclaimedCount,
    allDone: completed === total && state.grandChestClaimed && !streakClaimable,
    grandReady,
    grandClaimed: state.grandChestClaimed,
    streakClaimable,
    currentStreak: streakInfo.streak.currentStreak,
  };
}

/**
 * Calculates remaining time until midnight (next daily challenge reset)
 */
export function getTimeUntilDailyReset(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}
