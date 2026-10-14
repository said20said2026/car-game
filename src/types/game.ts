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
  soundVolume?: number;
  speedPitchEnabled?: boolean;
  upgrades: Record<string, CarUpgrades>;
  unlockedCars: string[];
  carDirt?: Record<string, number>;
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
