import { CarConfig, DriftSmokeConfig, DriftSmokeMode } from '../types/game';

export interface SmokeThemeOption {
  id: DriftSmokeMode;
  name: string;
  badge: string;
  description: string;
  previewColors: string[];
  sparkColors: string[];
}

// Convert 3 or 6 digit hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) {
    return { r: 24, g: 24, b: 28 };
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbaStr(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(Math.max(0, Math.min(255, r)))}, ${Math.round(
    Math.max(0, Math.min(255, g))
  )}, ${Math.round(Math.max(0, Math.min(255, b)))}, ${Math.max(0, Math.min(1, a)).toFixed(2)})`;
}

// Pre-defined signature themes per car model
export const CAR_SIGNATURE_THEMES: Record<
  string,
  {
    name: string;
    tagline: string;
    description: string;
    badge: string;
    primarySmoke: string[];
    accentSmoke: string[];
    blendSmoke: string[];
    sparkColors: string[];
  }
> = {
  red_rocket: {
    name: 'Crimson Flame & Firestorm',
    tagline: 'Blazing scarlet and fiery orange burnout plume',
    description: 'High-combustion scarlet smoke infused with blazing orange tire sparks.',
    badge: '🔥 Turbo Flame',
    primarySmoke: ['rgba(239, 68, 68, 0.90)', 'rgba(185, 28, 28, 0.82)', 'rgba(127, 29, 29, 0.75)', 'rgba(28, 12, 12, 0.85)'],
    accentSmoke: ['rgba(249, 115, 22, 0.90)', 'rgba(234, 88, 12, 0.82)', 'rgba(154, 52, 18, 0.75)', 'rgba(30, 18, 10, 0.85)'],
    blendSmoke: ['rgba(239, 68, 68, 0.92)', 'rgba(249, 115, 22, 0.88)', 'rgba(220, 38, 38, 0.80)', 'rgba(35, 14, 14, 0.85)'],
    sparkColors: ['#fef08a', '#fbbf24', '#f97316', '#ffffff'],
  },
  night_phantom: {
    name: 'Midnight Shadow & Stealth Cyan',
    tagline: 'Heavy onyx vapor with glowing electric blue wisps',
    description: 'Stealth matte-charcoal burnout clouds infused with electric sky-blue nitro sparks.',
    badge: '⚡ Phantom Stealth',
    primarySmoke: ['rgba(30, 41, 59, 0.92)', 'rgba(15, 23, 42, 0.88)', 'rgba(51, 65, 85, 0.78)', 'rgba(8, 10, 18, 0.90)'],
    accentSmoke: ['rgba(56, 189, 248, 0.88)', 'rgba(14, 165, 233, 0.80)', 'rgba(2, 132, 199, 0.72)', 'rgba(12, 28, 45, 0.85)'],
    blendSmoke: ['rgba(15, 23, 42, 0.92)', 'rgba(56, 189, 248, 0.85)', 'rgba(30, 41, 59, 0.82)', 'rgba(8, 14, 26, 0.90)'],
    sparkColors: ['#38bdf8', '#7dd3fc', '#e0f2fe', '#ffffff'],
  },
  cyber_neon: {
    name: 'Cyberpunk Synthwave & Neon Pulse',
    tagline: 'Hyper-vibrant cyan & laser magenta synth vapor',
    description: 'Futuristic glowing electric vapor blending neon cyan aero and hot magenta underglow.',
    badge: '🌐 Synthwave Neon',
    primarySmoke: ['rgba(6, 182, 212, 0.90)', 'rgba(8, 145, 178, 0.82)', 'rgba(14, 116, 144, 0.75)', 'rgba(10, 24, 32, 0.85)'],
    accentSmoke: ['rgba(236, 72, 153, 0.90)', 'rgba(219, 39, 119, 0.82)', 'rgba(157, 23, 77, 0.75)', 'rgba(35, 10, 24, 0.85)'],
    blendSmoke: ['rgba(6, 182, 212, 0.90)', 'rgba(236, 72, 153, 0.88)', 'rgba(14, 165, 233, 0.80)', 'rgba(18, 14, 30, 0.85)'],
    sparkColors: ['#f472b6', '#38bdf8', '#c084fc', '#ffffff'],
  },
  desert_stormer: {
    name: 'Sahara Sandstorm & Terra Cotta',
    tagline: 'Roaring desert sand dust and golden dune particles',
    description: 'Dense golden dust plume designed for all-terrain drifts across desert highways.',
    badge: '🏜️ Sandstorm Grit',
    primarySmoke: ['rgba(217, 119, 6, 0.92)', 'rgba(180, 83, 9, 0.84)', 'rgba(146, 64, 14, 0.76)', 'rgba(38, 22, 10, 0.88)'],
    accentSmoke: ['rgba(245, 158, 11, 0.90)', 'rgba(217, 119, 6, 0.82)', 'rgba(251, 191, 36, 0.75)', 'rgba(42, 28, 12, 0.85)'],
    blendSmoke: ['rgba(245, 158, 11, 0.92)', 'rgba(217, 119, 6, 0.86)', 'rgba(180, 83, 9, 0.78)', 'rgba(36, 20, 8, 0.88)'],
    sparkColors: ['#fde047', '#f59e0b', '#fbbf24', '#ffffff'],
  },
  police_interceptor: {
    name: 'Enforcer Tactical Dual Strobe',
    tagline: 'Alternating siren pursuit blue and strobe red vapor',
    description: 'Tactical law-enforcement strobe smoke flashing vibrant pursuit blue and siren red.',
    badge: '🚨 Pursuit Siren',
    primarySmoke: ['rgba(37, 99, 235, 0.92)', 'rgba(29, 78, 216, 0.84)', 'rgba(30, 58, 138, 0.76)', 'rgba(12, 18, 42, 0.88)'],
    accentSmoke: ['rgba(220, 38, 38, 0.92)', 'rgba(185, 28, 28, 0.84)', 'rgba(153, 27, 27, 0.76)', 'rgba(40, 14, 14, 0.88)'],
    blendSmoke: ['rgba(37, 99, 235, 0.92)', 'rgba(220, 38, 38, 0.90)', 'rgba(29, 78, 216, 0.82)', 'rgba(185, 28, 28, 0.80)'],
    sparkColors: ['#60a5fa', '#f87171', '#ffffff', '#38bdf8'],
  },
  golden_falcon: {
    name: 'Apex Royal Gold & Gilded Champagne',
    tagline: 'Luxurious shimmering 24K gold dust and champagne vapor',
    description: 'Prestige apex drift clouds infused with golden mica flecks and champagne sparkles.',
    badge: '👑 Royal Gold',
    primarySmoke: ['rgba(234, 179, 8, 0.92)', 'rgba(202, 138, 4, 0.84)', 'rgba(161, 98, 7, 0.76)', 'rgba(40, 32, 10, 0.88)'],
    accentSmoke: ['rgba(251, 191, 36, 0.92)', 'rgba(245, 158, 11, 0.84)', 'rgba(254, 240, 138, 0.76)', 'rgba(45, 36, 12, 0.88)'],
    blendSmoke: ['rgba(234, 179, 8, 0.92)', 'rgba(251, 191, 36, 0.88)', 'rgba(202, 138, 4, 0.80)', 'rgba(38, 30, 8, 0.88)'],
    sparkColors: ['#fef08a', '#fbbf24', '#ffffff', '#fde047'],
  },
};

// Generate multi-tonal smoke palette from a primary and accent hex color
export function generateSmokePalette(
  primaryHex: string,
  accentHex?: string
): { smokeColors: string[]; sparkColors: string[] } {
  const p = hexToRgb(primaryHex);
  const a = accentHex ? hexToRgb(accentHex) : p;

  const smokeColors = [
    // Bright surface puff
    rgbaStr(p.r * 1.05, p.g * 1.05, p.b * 1.05, 0.92),
    // Rich midtone
    rgbaStr(p.r * 0.85, p.g * 0.85, p.b * 0.85, 0.86),
    // Accent edge tint
    rgbaStr(a.r * 1.1, a.g * 1.1, a.b * 1.1, 0.80),
    // Deep dense core shadow
    rgbaStr(p.r * 0.35 + 10, p.g * 0.35 + 10, p.b * 0.35 + 12, 0.88),
  ];

  const sparkColors = [
    primaryHex,
    accentHex || '#ffffff',
    '#ffffff',
  ];

  return { smokeColors, sparkColors };
}

export const CLASSIC_BLACK_SMOKE = [
  'rgba(8, 8, 12, 0.94)',   // Deep pitch black
  'rgba(18, 18, 24, 0.88)',  // Hot burnt rubber black
  'rgba(28, 28, 36, 0.80)',  // Heavy charcoal black
  'rgba(38, 38, 48, 0.72)',  // Billowy dark smoke
];

export const CLASSIC_BLACK_SPARKS = ['#fbbf24', '#f97316', '#fef08a', '#ffffff'];

export function getDefaultDriftSmokeConfig(): DriftSmokeConfig {
  return {
    mode: 'car_theme',
    intensity: 'standard',
    sparkEnabled: true,
  };
}

/**
 * Resolves the active drift smoke colors for a given car and config
 */
export function getCarDriftSmokeColors(
  car: CarConfig,
  config?: DriftSmokeConfig
): {
  smokeColors: string[];
  sparkColors: string[];
  label: string;
  badge: string;
  activeHex: string;
} {
  const currentConfig = config || getDefaultDriftSmokeConfig();
  const signature = CAR_SIGNATURE_THEMES[car.id];

  switch (currentConfig.mode) {
    case 'car_theme': {
      if (signature) {
        return {
          smokeColors: signature.blendSmoke,
          sparkColors: signature.sparkColors,
          label: signature.name,
          badge: signature.badge,
          activeHex: car.color,
        };
      }
      const pal = generateSmokePalette(car.color, car.accentColor);
      return {
        smokeColors: pal.smokeColors,
        sparkColors: pal.sparkColors,
        label: `${car.name} Theme Blend`,
        badge: '✨ Car Theme',
        activeHex: car.color,
      };
    }

    case 'car_primary': {
      if (signature) {
        return {
          smokeColors: signature.primarySmoke,
          sparkColors: [car.color, '#ffffff'],
          label: `${car.name} Body Primary`,
          badge: '🏎️ Body Paint',
          activeHex: car.color,
        };
      }
      const pal = generateSmokePalette(car.color);
      return {
        smokeColors: pal.smokeColors,
        sparkColors: pal.sparkColors,
        label: `${car.name} Body Primary`,
        badge: '🏎️ Body Paint',
        activeHex: car.color,
      };
    }

    case 'car_accent': {
      if (signature) {
        return {
          smokeColors: signature.accentSmoke,
          sparkColors: [car.accentColor, '#ffffff'],
          label: `${car.name} Aero Accent`,
          badge: '⚡ Aero Accent',
          activeHex: car.accentColor,
        };
      }
      const pal = generateSmokePalette(car.accentColor);
      return {
        smokeColors: pal.smokeColors,
        sparkColors: pal.sparkColors,
        label: `${car.name} Aero Accent`,
        badge: '⚡ Aero Accent',
        activeHex: car.accentColor,
      };
    }

    case 'classic_black': {
      return {
        smokeColors: CLASSIC_BLACK_SMOKE,
        sparkColors: CLASSIC_BLACK_SPARKS,
        label: 'Classic Burnt Rubber (Pitch Black)',
        badge: '🏁 Burnt Rubber',
        activeHex: '#18181b',
      };
    }

    case 'custom': {
      const customHex = currentConfig.customColor || car.color || '#38bdf8';
      const pal = generateSmokePalette(customHex);
      return {
        smokeColors: pal.smokeColors,
        sparkColors: pal.sparkColors,
        label: `Custom Tuning (${customHex.toUpperCase()})`,
        badge: '🎨 Custom Hue',
        activeHex: customHex,
      };
    }

    default: {
      return {
        smokeColors: CLASSIC_BLACK_SMOKE,
        sparkColors: CLASSIC_BLACK_SPARKS,
        label: 'Classic Burnt Rubber',
        badge: '🏁 Burnt Rubber',
        activeHex: '#18181b',
      };
    }
  }
}
