import { TrackEnvironment } from '../types/game';

export interface GhostTelemetryFrame {
  t: number;       // Elapsed time from start in seconds (e.g. 1.25)
  d: number;       // Distance in meters (e.g. 84.2)
  x: number;       // Lateral position (-1 to 1)
  tilt: number;    // Steering tilt in radians
  speed: number;   // km/h
  nitro: boolean;  // whether nitro was active
  drift: boolean;  // whether drift was active
}

export interface GhostRunData {
  version: 1;
  id: string;
  track: TrackEnvironment;
  carId: string;
  carName: string;
  carColor: string;
  accentColor: string;
  totalDistance: number; // meters
  totalTime: number;     // seconds
  finalScore: number;
  recordedAt: number;    // unix timestamp
  frames: GhostTelemetryFrame[];
}

const GHOST_STORAGE_PREFIX = 'fast_city_racing_ghost_';
const GHOST_OVERALL_KEY = 'fast_city_racing_ghost_overall';
const GHOST_ENABLED_KEY = 'fast_city_racing_ghost_enabled';

/**
 * Checks whether the Ghost Car system is enabled in player settings
 */
export function isGhostCarEnabled(): boolean {
  try {
    const val = localStorage.getItem(GHOST_ENABLED_KEY);
    if (val === null) return true; // Enabled by default
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggles or sets Ghost Car visibility
 */
export function setGhostCarEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(GHOST_ENABLED_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('ghost_settings_changed', { detail: { enabled } }));
  } catch {}
}

/**
 * Loads the best saved ghost run for a track, or the overall best
 */
export function loadGhostRun(track?: TrackEnvironment): GhostRunData | null {
  try {
    if (track) {
      const trackRaw = localStorage.getItem(`${GHOST_STORAGE_PREFIX}${track}`);
      if (trackRaw) {
        return JSON.parse(trackRaw) as GhostRunData;
      }
    }
    const overallRaw = localStorage.getItem(GHOST_OVERALL_KEY);
    if (overallRaw) {
      return JSON.parse(overallRaw) as GhostRunData;
    }
  } catch (e) {
    console.error('Failed to load ghost run', e);
  }
  return null;
}

/**
 * Check if the current completed run surpasses the saved ghost record
 */
export function checkIsNewGhostRecord(track: TrackEnvironment, distance: number): boolean {
  if (distance < 25) return false; // Minimum qualification threshold (25m)
  const existing = loadGhostRun(track);
  if (!existing) return true;
  return distance > existing.totalDistance;
}

/**
 * Saves a completed run as the new ghost run if it qualifies
 */
export function saveGhostRun(run: GhostRunData): boolean {
  try {
    const existing = loadGhostRun(run.track);
    const isNewBest = !existing || run.totalDistance > existing.totalDistance;

    if (isNewBest) {
      // Compress frames slightly to keep storage light and fast (max 1000 frames)
      const sampledFrames = run.frames.length > 900
        ? run.frames.filter((_, idx) => idx % 2 === 0 || idx === run.frames.length - 1)
        : run.frames;

      const toSave: GhostRunData = {
        ...run,
        frames: sampledFrames,
      };

      const serialized = JSON.stringify(toSave);
      localStorage.setItem(`${GHOST_STORAGE_PREFIX}${run.track}`, serialized);

      // Check overall best as well
      const overall = loadGhostRun();
      if (!overall || run.totalDistance > overall.totalDistance) {
        localStorage.setItem(GHOST_OVERALL_KEY, serialized);
      }

      window.dispatchEvent(new CustomEvent('ghost_record_updated', { detail: { run: toSave } }));
      return true;
    }
  } catch (e) {
    console.error('Failed to save ghost run', e);
  }
  return false;
}

/**
 * Clear ghost runs
 */
export function clearGhostRuns(): void {
  try {
    localStorage.removeItem(GHOST_OVERALL_KEY);
    ['day', 'sunset', 'night', 'rain'].forEach((t) => {
      localStorage.removeItem(`${GHOST_STORAGE_PREFIX}${t}`);
    });
    window.dispatchEvent(new CustomEvent('ghost_record_updated', { detail: null }));
  } catch {}
}

export interface InterpolatedGhost {
  x: number;
  d: number;
  tilt: number;
  speed: number;
  nitro: boolean;
  drift: boolean;
  isFinished: boolean;
  carId: string;
  carName: string;
  carColor: string;
  accentColor: string;
  totalDistance: number;
}

/**
 * Interpolates ghost telemetry for current race time
 */
export function interpolateGhost(
  ghost: GhostRunData | null,
  raceTime: number
): InterpolatedGhost | null {
  if (!ghost || !ghost.frames || ghost.frames.length === 0) return null;

  const frames = ghost.frames;
  const firstFrame = frames[0];
  const lastFrame = frames[frames.length - 1];

  // If race just started before first frame
  if (raceTime <= firstFrame.t) {
    return {
      x: firstFrame.x,
      d: firstFrame.d,
      tilt: firstFrame.tilt,
      speed: firstFrame.speed,
      nitro: firstFrame.nitro,
      drift: firstFrame.drift,
      isFinished: false,
      carId: ghost.carId,
      carName: ghost.carName,
      carColor: ghost.carColor,
      accentColor: ghost.accentColor,
      totalDistance: ghost.totalDistance,
    };
  }

  // If race has exceeded ghost duration
  if (raceTime >= lastFrame.t) {
    return {
      x: lastFrame.x,
      d: lastFrame.d,
      tilt: lastFrame.tilt * 0.5,
      speed: 0,
      nitro: false,
      drift: false,
      isFinished: true,
      carId: ghost.carId,
      carName: ghost.carName,
      carColor: ghost.carColor,
      accentColor: ghost.accentColor,
      totalDistance: ghost.totalDistance,
    };
  }

  // Binary search for surrounding frames
  let low = 0;
  let high = frames.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (frames[mid].t < raceTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const f0 = frames[Math.max(0, low - 1)];
  const f1 = frames[Math.min(frames.length - 1, low)];

  const dt = f1.t - f0.t;
  const alpha = dt > 0.0001 ? Math.max(0, Math.min(1, (raceTime - f0.t) / dt)) : 0;

  return {
    x: f0.x + (f1.x - f0.x) * alpha,
    d: f0.d + (f1.d - f0.d) * alpha,
    tilt: f0.tilt + (f1.tilt - f0.tilt) * alpha,
    speed: f0.speed + (f1.speed - f0.speed) * alpha,
    nitro: alpha < 0.5 ? f0.nitro : f1.nitro,
    drift: alpha < 0.5 ? f0.drift : f1.drift,
    isFinished: false,
    carId: ghost.carId,
    carName: ghost.carName,
    carColor: ghost.carColor,
    accentColor: ghost.accentColor,
    totalDistance: ghost.totalDistance,
  };
}

/**
 * Calculates comparative delta between player and ghost
 */
export function calculateGhostDelta(
  playerDistance: number,
  ghostDistance: number
): {
  meters: number;
  status: 'ahead' | 'behind' | 'tied';
  text: string;
} {
  const diff = playerDistance - ghostDistance;
  const absDiff = Math.abs(diff);

  if (absDiff < 0.5) {
    return {
      meters: 0,
      status: 'tied',
      text: 'متعادلان ⚔️',
    };
  }

  if (diff > 0) {
    return {
      meters: absDiff,
      status: 'ahead',
      text: `+${absDiff.toFixed(1)}م متقدم 🟢`,
    };
  }

  return {
    meters: absDiff,
    status: 'behind',
    text: `-${absDiff.toFixed(1)}م خلف الشبح 🔴`,
  };
}
