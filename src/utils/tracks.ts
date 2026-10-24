import { TrackData, TrackEnvironment, PlayerStats } from '../types/game';
import { loadPlayerStats, savePlayerStats } from './storage';

export const TRACKS_DATA: TrackData[] = [
  {
    id: 'day',
    name: 'Daytime Metropolis',
    subtitle: 'Downtown Grand Boulevard',
    description: 'Clean daylight, dry asphalt, and predictable lane flow. The signature city circuit engineered for high-speed precision driving and setting baseline records.',
    unlockCost: 0,
    gripFactor: 1.0,
    nitroRechargeRate: 1.0,
    coinBonusMultiplier: 1.0,
    scoreBonusMultiplier: 1.0,
    visibility: '100% · Crystal Clear Daylight',
    weatherHazard: 'Dry pavement · Standard traction',
    difficulty: 'Beginner Friendly',
    themeColor: '#38bdf8',
    accentColor: '#0284c7',
    iconName: 'sun',
  },
  {
    id: 'sunset',
    name: 'Sunset Highway',
    subtitle: 'Golden Coast Expressway',
    description: 'A blazing sunset casts long golden reflections across wide ocean-view freeway lanes. Warm tarmac offers sharp grip and an instant +15% coin boost.',
    unlockCost: 500,
    gripFactor: 1.05,
    nitroRechargeRate: 1.15,
    coinBonusMultiplier: 1.15,
    scoreBonusMultiplier: 1.1,
    visibility: '90% · Warm Twilight Horizon',
    weatherHazard: 'Sun glare reflections · High-speed coastal drifts',
    difficulty: 'Intermediate',
    themeColor: '#f59e0b',
    accentColor: '#ea580c',
    iconName: 'sunset',
  },
  {
    id: 'night',
    name: 'Neon Night',
    subtitle: 'Cyberpunk Skyline Turnpike',
    description: 'Luminous neon skyscrapers and glowing holograms illuminate the dark midnight expressway. Cool ambient temperatures supercharge your nitro recharge rate by +35% with +25% score bonus.',
    unlockCost: 1200,
    gripFactor: 0.98,
    nitroRechargeRate: 1.35,
    coinBonusMultiplier: 1.25,
    scoreBonusMultiplier: 1.25,
    visibility: '85% · Neon Luminescence & Headlights',
    weatherHazard: 'Midnight traffic lighting · Hyper nitro boost charge',
    difficulty: 'Advanced',
    themeColor: '#a855f7',
    accentColor: '#38bdf8',
    iconName: 'moon',
  },
  {
    id: 'rain',
    name: 'Rainstorm Expressway',
    subtitle: 'Monsoon Slicks & Thunder Freeway',
    description: 'Torrential downpours drench the pavement, introducing authentic slick-road hydroplaning and wet-weather drifts. Extreme risk yields a massive +50% coin and score bonus reward!',
    unlockCost: 2000,
    gripFactor: 0.82,
    nitroRechargeRate: 1.1,
    coinBonusMultiplier: 1.5,
    scoreBonusMultiplier: 1.5,
    visibility: '70% · Storm Fog & Rain Mist',
    weatherHazard: 'Wet slick tarmac · Hydroplane drift physics (+50% Bonus)',
    difficulty: 'Pro Driver',
    themeColor: '#06b6d4',
    accentColor: '#475569',
    iconName: 'cloud-rain',
  },
];

export function getTrackData(id: TrackEnvironment): TrackData {
  const found = TRACKS_DATA.find((t) => t.id === id);
  return found || TRACKS_DATA[0];
}

export function isTrackUnlocked(trackId: TrackEnvironment, stats?: PlayerStats): boolean {
  if (trackId === 'day') return true;
  const currentStats = stats || loadPlayerStats();
  const unlocked = currentStats.unlockedTracks || ['day'];
  return unlocked.includes(trackId);
}

export function unlockTrack(
  trackId: TrackEnvironment
): { success: boolean; newCoins: number; error?: string } {
  const stats = loadPlayerStats();
  const unlocked = stats.unlockedTracks || ['day'];

  if (unlocked.includes(trackId)) {
    return { success: true, newCoins: stats.coins };
  }

  const track = getTrackData(trackId);
  if (stats.coins < track.unlockCost) {
    return {
      success: false,
      newCoins: stats.coins,
      error: `Need ${track.unlockCost - stats.coins} more coins to unlock ${track.name}!`,
    };
  }

  stats.coins -= track.unlockCost;
  stats.unlockedTracks = [...unlocked, trackId];
  stats.selectedTrack = trackId;
  savePlayerStats(stats);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins_updated', { detail: { coins: stats.coins } }));
    window.dispatchEvent(new CustomEvent('track_unlocked', { detail: { trackId, trackName: track.name } }));
  }

  return { success: true, newCoins: stats.coins };
}
