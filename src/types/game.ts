export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type TrackEnvironment = 'day' | 'sunset' | 'night' | 'rain';

export interface CarConfig {
  id: string;
  name: string;
  arabicName: string;
  type: string;
  price: number;
  baseSpeed: number; // km/h
  baseAcceleration: number;
  baseHandling: number;
  baseNitro: number;
  color: string;
  accentColor: string;
  unlocked: boolean;
  description: string;
}

export interface CarUpgrades {
  speedLevel: number;
  accelLevel: number;
  handlingLevel: number;
  nitroLevel: number;
}

export type DriftSmokeMode =
  | 'car_theme'      // Signature blend of car primary + accent colors
  | 'car_primary'    // Match car body paint
  | 'car_accent'     // Match car accent / aero glow
  | 'classic_black'  // Burnt rubber asphalt black
  | 'custom';        // Custom chosen color palette

export interface DriftSmokeConfig {
  mode: DriftSmokeMode;
  customColor?: string; // Hex color if custom
  intensity?: 'subtle' | 'standard' | 'dense';
  sparkEnabled?: boolean;
}

export interface TrackData {
  id: TrackEnvironment;
  name: string;
  subtitle: string;
  description: string;
  unlockCost: number; // 0 for 'day', 500 for 'sunset', 1200 for 'night', 2000 for 'rain'
  gripFactor: number; // 1.0 standard, 1.05 sunset, 0.98 night, 0.82 rain wet slick
  nitroRechargeRate: number; // passive nitro multiplier
  coinBonusMultiplier: number; // coin reward multiplier
  scoreBonusMultiplier: number; // score reward multiplier
  visibility: string;
  weatherHazard: string;
  difficulty: 'Beginner Friendly' | 'Intermediate' | 'Advanced' | 'Pro Driver';
  themeColor: string;
  accentColor: string;
  iconName: 'sun' | 'sunset' | 'moon' | 'cloud-rain';
}

export interface PlayerStats {
  coins: number;
  highScore: number;
  maxDistance: number;
  racesCount: number;
  selectedCarId: string;
  selectedTrack: TrackEnvironment;
  soundEnabled: boolean;
  musicEnabled?: boolean;
  musicVolume?: number;
  engineVolume?: number;
  hornVolume?: number;
  engineEnabled?: boolean;
  hornEnabled?: boolean;
  soundVolume?: number;
  speedPitchEnabled?: boolean;
  upgrades: Record<string, CarUpgrades>;
  unlockedCars: string[];
  unlockedTracks?: TrackEnvironment[];
  carDirt?: Record<string, number>;
  driftSmokeSettings?: Record<string, DriftSmokeConfig>; // Per-car customized drift smoke colors
  ghostCarEnabled?: boolean;
  totalOvertakes?: number; // Total cars safely overtaken across all races
  unlockedAchievements?: string[]; // IDs of unlocked achievements
  claimedAchievements?: string[]; // IDs of claimed rewards
}

export interface TrafficVehicle {
  id: number;
  x: number; // -1 (far left) to 1 (far right)
  z: number; // distance ahead in road units
  speed: number;
  lane: number;
  type: 'sedan' | 'suv' | 'truck' | 'police' | 'sports';
  color: string;
  targetX: number;
  laneChangeTimer: number;
  overtaken?: boolean; // Safe pass/overtake flag
  damaged?: boolean; // Visual damage flag when collided
  damageSide?: 'left' | 'right' | 'center';
  spinVx?: number;
  spinAngle?: number;
  smokeTimer?: number;
  scratches?: Array<{ x: number; y: number; len: number; angle: number; width: number }>;
}

export interface RoadCollectible {
  id: number;
  x: number;
  z: number;
  type: 'coin' | 'nitro' | 'star';
  collected: boolean;
  rotation: number;
}

export interface RoadObstacle {
  id: number;
  x: number;
  z: number;
  type: 'cone' | 'barrier' | 'oil';
  hit: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'circle' | 'spark' | 'streak' | 'ring' | 'smoke';
  length?: number;
  growth?: number; // Size expansion per second for smoke clouds
  spin?: number;   // Rotation velocity in radians/sec
  angle?: number;  // Current rotation angle
  glow?: boolean;  // Optional glowing effect for nitro/fire smoke
}
