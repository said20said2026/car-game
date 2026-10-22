/**
 * Haptic Vibration Feedback Controller using the HTML5 Navigator.vibrate API
 * Provides tactile immersion for mobile and handheld players during:
 * - Nitro boost activation & pickups
 * - Road obstacle collisions (cones, barriers, oil slicks)
 * - Vehicle collisions & terminal crash impacts
 */

const HAPTIC_STORAGE_KEY = 'metro_racers_haptics_enabled';

/**
 * Checks whether the current browser and platform support the Vibration API.
 */
export function isHapticsSupported(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Returns whether haptic vibration is currently enabled in user preferences.
 * Defaults to true for all supported mobile devices.
 */
export function isHapticEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(HAPTIC_STORAGE_KEY);
    if (val !== null) return val === 'true';
  } catch {}
  return true;
}

/**
 * Sets user preference for haptic vibration feedback.
 */
export function setHapticEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HAPTIC_STORAGE_KEY, String(enabled));
  } catch {}
}

/**
 * Core vibration dispatcher wrapped with feature detection and user preference check.
 */
export function triggerHaptic(pattern: number | number[]): boolean {
  if (!isHapticsSupported() || !isHapticEnabled()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

/**
 * Haptic Vibration Pattern for Nitro Boost Ignition:
 * Sharp double-pulse simulating twin exhaust flame ignition and high-G launch.
 */
export function hapticNitroBoost(): void {
  triggerHaptic([40, 25, 80]);
}

/**
 * Haptic Vibration Pattern for Road Obstacle Collision (Cones, barriers, road hazards):
 * Jarring double-thud impact.
 */
export function hapticObstacleCollision(): void {
  triggerHaptic([70, 35, 100]);
}

/**
 * Haptic Vibration Pattern for Vehicle Traffic Collision:
 * Heavy impact shudder when colliding with a civilian vehicle at speed.
 */
export function hapticTrafficCollision(): void {
  triggerHaptic([130, 45, 175]);
}

/**
 * Haptic Vibration Pattern for Terminal Crash / Game Over:
 * Escalating triple-shudder sequence for catastrophic wrecks.
 */
export function hapticGameOver(): void {
  triggerHaptic([160, 50, 220, 60, 260]);
}

/**
 * Haptic Vibration Pattern for Near-Miss Combo:
 * High-frequency micro-buzz when swerving within centimeters of traffic.
 */
export function hapticNearMiss(): void {
  triggerHaptic(25);
}

/**
 * Subtle UI button tap feedback.
 */
export function hapticTap(): void {
  triggerHaptic(18);
}
