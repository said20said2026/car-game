import { CarConfig, CarUpgrades, PlayerStats, TrackEnvironment } from '../types/game';

export const CARS_DATA: CarConfig[] = [
  {
    id: 'red_rocket',
    name: 'Red Rocket GT',
    arabicName: 'Red Rocket GT',
    type: 'Turbo Sports Coupe',
    price: 0,
    baseSpeed: 190,
    baseAcceleration: 65,
    baseHandling: 70,
    baseNitro: 60,
    color: '#ef4444',
    accentColor: '#f97316',
    unlocked: true,
    description: 'The iconic default racer. Agile, well-balanced, and engineered for high-speed city highway dominance.',
  },
  {
    id: 'night_phantom',
    name: 'Night Phantom V8',
    arabicName: 'Night Phantom V8',
    type: 'American Super Muscle',
    price: 800,
    baseSpeed: 230,
    baseAcceleration: 80,
    baseHandling: 60,
    baseNitro: 75,
    color: '#1e293b',
    accentColor: '#38bdf8',
    unlocked: false,
    description: 'A classic raw muscle machine with thunderous V8 torque, crushing top acceleration on wide open freeways.',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Hypercar',
    arabicName: 'Cyber Neon Hypercar',
    type: 'Futuristic Aero Hypercar',
    price: 1800,
    baseSpeed: 275,
    baseAcceleration: 90,
    baseHandling: 85,
    baseNitro: 90,
    color: '#06b6d4',
    accentColor: '#ec4899',
    unlocked: false,
    description: 'A futuristic aerodynamic road weapon equipped with neon LED aero fins and razor-sharp high-speed cornering.',
  },
  {
    id: 'desert_stormer',
    name: 'Desert Stormer 4x4',
    arabicName: 'Desert Stormer 4x4',
    type: 'All-Terrain 4x4 Supercar',
    price: 2100,
    baseSpeed: 240,
    baseAcceleration: 85,
    baseHandling: 92,
    baseNitro: 80,
    color: '#d97706',
    accentColor: '#f59e0b',
    unlocked: false,
    description: 'Built for intense desert sandstorms and rain slicks, providing unstoppable all-wheel-drive grip.',
  },
  {
    id: 'police_interceptor',
    name: 'Police Interceptor Spec-V',
    arabicName: 'Police Interceptor Spec-V',
    type: 'Tactical Pursuit Cruiser',
    price: 2400,
    baseSpeed: 250,
    baseAcceleration: 88,
    baseHandling: 90,
    baseNitro: 85,
    color: '#2563eb',
    accentColor: '#dc2626',
    unlocked: false,
    description: 'Armored pursuit beast with tactical strobe sirens and high impact resistance against road obstacles.',
  },
  {
    id: 'golden_falcon',
    name: 'Golden Falcon Apex',
    arabicName: 'Golden Falcon Apex',
    type: 'Legendary Hypercar',
    price: 3200,
    baseSpeed: 320,
    baseAcceleration: 95,
    baseHandling: 95,
    baseNitro: 100,
    color: '#eab308',
    accentColor: '#fbbf24',
    unlocked: false,
    description: 'The crown jewel of supercar engineering with pure gold carbon weave, twin-turbo hybrid thrust, and unlimited nitro flow.',
  },
];

const DEFAULT_UPGRADE: CarUpgrades = {
  speedLevel: 1,
  accelLevel: 1,
  handlingLevel: 1,
  nitroLevel: 1,
};

const STORAGE_KEY = 'fast_city_racing_v1';

export const CAR_WASH_COST = 25;

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        coins: parsed.coins ?? 200, // starting coins bonus
        highScore: parsed.highScore ?? 0,
        maxDistance: parsed.maxDistance ?? 0,
        racesCount: parsed.racesCount ?? 0,
        selectedCarId: parsed.selectedCarId ?? 'red_rocket',
        selectedTrack: parsed.selectedTrack ?? 'day',
        soundEnabled: parsed.soundEnabled ?? true,
        musicEnabled: parsed.musicEnabled ?? true,
        musicVolume: parsed.musicVolume ?? 0.35,
        engineVolume: parsed.engineVolume ?? 0.8,
        hornVolume: parsed.hornVolume ?? 0.75,
        engineEnabled: parsed.engineEnabled ?? true,
        hornEnabled: parsed.hornEnabled ?? true,
        soundVolume: parsed.soundVolume ?? 0.8,
        speedPitchEnabled: parsed.speedPitchEnabled ?? true,
        upgrades: parsed.upgrades ?? {},
        unlockedCars: parsed.unlockedCars ?? ['red_rocket'],
        unlockedTracks: parsed.unlockedTracks && Array.isArray(parsed.unlockedTracks) && parsed.unlockedTracks.length > 0 ? parsed.unlockedTracks : ['day'],
        carDirt: parsed.carDirt ?? {
          red_rocket: 0,
        },
        driftSmokeSettings: parsed.driftSmokeSettings ?? {},
        ghostCarEnabled: parsed.ghostCarEnabled ?? true,
        totalOvertakes: parsed.totalOvertakes ?? 0,
        unlockedAchievements: parsed.unlockedAchievements ?? [],
        claimedAchievements: parsed.claimedAchievements ?? [],
      };
    }
  } catch {}

  return {
    coins: 200,
    highScore: 0,
    maxDistance: 0,
    racesCount: 0,
    selectedCarId: 'red_rocket',
    selectedTrack: 'day',
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 0.35,
    engineVolume: 0.8,
    hornVolume: 0.75,
    engineEnabled: true,
    hornEnabled: true,
    soundVolume: 0.8,
    speedPitchEnabled: true,
    upgrades: {
      red_rocket: { ...DEFAULT_UPGRADE },
    },
    unlockedCars: ['red_rocket'],
    unlockedTracks: ['day'],
    carDirt: {
      red_rocket: 0,
    },
    driftSmokeSettings: {},
    ghostCarEnabled: true,
    totalOvertakes: 0,
    unlockedAchievements: [],
    claimedAchievements: [],
  };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player_stats_changed', { detail: stats }));
    }
  } catch {}
}

export function getCarDirtLevel(carId: string): number {
  const stats = loadPlayerStats();
  return Math.max(0, Math.min(100, stats.carDirt?.[carId] ?? 0));
}

export function saveCarDirtLevel(carId: string, dirt: number) {
  const stats = loadPlayerStats();
  if (!stats.carDirt) stats.carDirt = {};
  stats.carDirt[carId] = Math.max(0, Math.min(100, Math.round(dirt)));
  savePlayerStats(stats);
}

export function getCarEffectiveStats(car: CarConfig, upgrades?: CarUpgrades) {
  const up = upgrades || DEFAULT_UPGRADE;
  const speedBonus = (up.speedLevel - 1) * 15;
  const accelBonus = (up.accelLevel - 1) * 8;
  const handlingBonus = (up.handlingLevel - 1) * 8;
  const nitroBonus = (up.nitroLevel - 1) * 10;

  return {
    topSpeed: car.baseSpeed + speedBonus,
    acceleration: Math.min(100, car.baseAcceleration + accelBonus),
    handling: Math.min(100, car.baseHandling + handlingBonus),
    nitro: Math.min(100, car.baseNitro + nitroBonus),
  };
}

export const UPGRADE_COSTS: Record<number, number> = {
  1: 150,
  2: 300,
  3: 600,
  4: 1200,
  5: 2500,
};

export interface DailyRacesData {
  date: string; // YYYY-MM-DD
  count: number;
  lastUpdated: number;
}

export const DAILY_RACES_STORAGE_KEY = 'fast_city_racing_daily_races';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadDailyRaces(): DailyRacesData {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(DAILY_RACES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === today && typeof parsed.count === 'number') {
        return {
          date: today,
          count: Math.max(0, parsed.count),
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
    }
  } catch {}
  return { date: today, count: 0, lastUpdated: Date.now() };
}

export function saveDailyRaces(count: number): DailyRacesData {
  const today = getTodayDateString();
  const data: DailyRacesData = {
    date: today,
    count: Math.max(0, count),
    lastUpdated: Date.now(),
  };
  try {
    localStorage.setItem(DAILY_RACES_STORAGE_KEY, JSON.stringify(data));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('daily_races_changed', { detail: data }));
  }
  return data;
}

export function recordDailyRace(): DailyRacesData {
  const current = loadDailyRaces();
  return saveDailyRaces(current.count + 1);
}

// ----------------------------------------------------
// Leaderboard (Top 5 Racers) LocalStorage Management
// ----------------------------------------------------

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
  carName?: string;
  isCurrentPlayer?: boolean;
}

export const LEADERBOARD_STORAGE_KEY = 'fast_city_racing_leaderboard';
export const PLAYER_NAME_STORAGE_KEY = 'fast_city_racing_player_name';

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', name: 'SpeedPhantom ⚡', score: 18500, date: 'Today', carName: 'Cyber Neon Hypercar' },
  { id: 'lb-2', name: 'FalconApex 🦅', score: 14200, date: 'Today', carName: 'Night Phantom V8' },
  { id: 'lb-3', name: 'TurboVortex 🏎️', score: 11800, date: 'Yesterday', carName: 'Golden Falcon Apex' },
  { id: 'lb-4', name: 'NightRider 🌙', score: 9500, date: 'Yesterday', carName: 'Red Rocket GT' },
  { id: 'lb-5', name: 'NitroStorm 🔥', score: 7200, date: '2 days ago', carName: 'Red Rocket GT' },
];

export function loadPlayerName(): string {
  try {
    const saved = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {}
  return 'Speed Hero';
}

export function savePlayerName(name: string): string {
  const clean = (name || '').trim() || 'Speed Hero';
  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, clean);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('player_name_changed', { detail: clean }));
  }
  return clean;
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sort descending by score and keep top 5
        const sorted = [...parsed]
          .filter((item) => item && typeof item.score === 'number' && typeof item.name === 'string')
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        if (sorted.length > 0) {
          return sorted;
        }
      }
    }
  } catch {}
  return [...DEFAULT_LEADERBOARD];
}

export function saveLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(sorted));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('leaderboard_changed', { detail: sorted }));
  }
  return sorted;
}

export function addLeaderboardScore(
  name: string,
  score: number,
  carName?: string
): { entries: LeaderboardEntry[]; rank: number | null } {
  const playerName = savePlayerName(name);
  const currentEntries = loadLeaderboard();

  const newEntry: LeaderboardEntry = {
    id: `lb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: playerName,
    score: Math.max(0, Math.floor(score)),
    date: 'Today',
    carName: carName || 'Supercar Racer',
    isCurrentPlayer: true,
  };

  // Combine and sort
  const combined = [...currentEntries, newEntry].sort((a, b) => b.score - a.score);
  const top5 = combined.slice(0, 5);
  
  // Find rank of new entry
  const rankIndex = top5.findIndex((e) => e.id === newEntry.id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : null;

  saveLeaderboard(top5);

  return { entries: top5, rank };
}

export function resetLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  } catch {}
  return saveLeaderboard([...DEFAULT_LEADERBOARD]);
}

