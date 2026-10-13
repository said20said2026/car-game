import { CarConfig, CarUpgrades, PlayerStats, TrackEnvironment } from '../types/game';

export const CARS_DATA: CarConfig[] = [
  {
    id: 'red_rocket',
    name: 'Red Rocket GT',
    arabicName: 'الصاروخ الأحمر GT',
    type: 'سيارة رياضية تيربو',
    price: 0,
    baseSpeed: 190,
    baseAcceleration: 65,
    baseHandling: 70,
    baseNitro: 60,
    color: '#ef4444',
    accentColor: '#f97316',
    unlocked: true,
    description: 'سيارة السباق الافتراضية، متوازنة ورشيقة للغاية ومثالية لبدء احتراف سباقات شوارع المدينة.',
  },
  {
    id: 'night_phantom',
    name: 'Night Phantom',
    arabicName: 'شبح الليل الأسود',
    type: 'عضلات أمريكية خارقة',
    price: 800,
    baseSpeed: 230,
    baseAcceleration: 80,
    baseHandling: 60,
    baseNitro: 75,
    color: '#1e293b',
    accentColor: '#38bdf8',
    unlocked: false,
    description: 'وحش العضلات الكلاسيكي المعدل، عزم دوران هائل وسرعة اندفاع لا تُقهر في الطرق المستقيمة.',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Hypercar',
    arabicName: 'وحش النيون السيبراني',
    type: 'هايبركار فضائية مستقبلية',
    price: 1800,
    baseSpeed: 275,
    baseAcceleration: 90,
    baseHandling: 85,
    baseNitro: 90,
    color: '#06b6d4',
    accentColor: '#ec4899',
    unlocked: false,
    description: 'تصميم هوائي ديناميكي مستقبلي مع إضاءات نيون نفاثة وثبات استثنائي في المنعطفات الشديدة.',
  },
  {
    id: 'golden_falcon',
    name: 'Golden Falcon',
    arabicName: 'الصقر الذهبي الخارق',
    type: 'سيارة أساطير فاخرة',
    price: 3200,
    baseSpeed: 320,
    baseAcceleration: 95,
    baseHandling: 95,
    baseNitro: 100,
    color: '#eab308',
    accentColor: '#fbbf24',
    unlocked: false,
    description: 'قمة هندسة سباقات السيارات الفارهة، مطلية بالذهب وتولد قوة تسارع خارقة مع خزان نيترو فائق.',
  },
  {
    id: 'police_interceptor',
    name: 'Police Interceptor Spec-V',
    arabicName: 'مركبة المطاردة الخاصة Spec-V',
    type: 'مركبة تدخل سريع مدرعة',
    price: 2400,
    baseSpeed: 250,
    baseAcceleration: 88,
    baseHandling: 90,
    baseNitro: 85,
    color: '#2563eb',
    accentColor: '#dc2626',
    unlocked: false,
    description: 'مجهزة بأنوار تنبيه سريعة وهيكل فولاذي يقلل من تأثير الاصطدام بالعقبات ومخاريط الطرق.',
  },
];

const DEFAULT_UPGRADE: CarUpgrades = {
  speedLevel: 1,
  accelLevel: 1,
  handlingLevel: 1,
  nitroLevel: 1,
};

const STORAGE_KEY = 'fast_city_racing_v1';

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
        upgrades: parsed.upgrades ?? {},
        unlockedCars: parsed.unlockedCars ?? ['red_rocket'],
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
    upgrades: {
      red_rocket: { ...DEFAULT_UPGRADE },
    },
    unlockedCars: ['red_rocket'],
  };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
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
