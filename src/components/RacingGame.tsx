import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Gauge,
  Flame,
  Coins,
  Wrench,
  Maximize2,
  Pause,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  Trophy,
  Sliders,
  Volume1,
  X,
  Activity,
  Droplets,
  Sparkles,
  Target,
  Gift,
  Ghost,
  Keyboard,
  ChevronUp,
  ChevronDown,
  Smartphone,
} from 'lucide-react';
import {
  GameState,
  TrackEnvironment,
  TrafficVehicle,
  RoadCollectible,
  RoadObstacle,
  Particle,
} from '../types/game';
import {
  CARS_DATA,
  loadPlayerStats,
  savePlayerStats,
  recordDailyRace,
  getCarEffectiveStats,
  loadPlayerName,
  addLeaderboardScore,
} from '../utils/storage';
import {
  recordDailyChallengeProgress,
  getDailyChallengesSummary,
} from '../utils/dailyChallenges';
import {
  GhostTelemetryFrame,
  GhostRunData,
  InterpolatedGhost,
  loadGhostRun,
  saveGhostRun,
  checkIsNewGhostRecord,
  isGhostCarEnabled,
  setGhostCarEnabled,
  interpolateGhost,
  calculateGhostDelta,
  clearGhostRuns,
} from '../utils/ghostCar';
import { DailyChallengesModal } from './DailyChallengesModal';
import { soundManager, engineAudio } from '../utils/audio';
import { AchievementToast } from './AchievementToast';
import { dispatchGameToast, checkAndUnlockAchievements } from '../utils/achievements';
import { Speedometer } from './Speedometer';
import {
  Minimap,
  MinimapTrafficItem,
  MinimapCollectibleItem,
  MinimapObstacleItem,
} from './Minimap';
import {
  isHapticsSupported,
  isHapticEnabled,
  setHapticEnabled,
  hapticNitroBoost,
  hapticObstacleCollision,
  hapticTrafficCollision,
  hapticGameOver,
  hapticNearMiss,
  hapticTap,
} from '../utils/haptics';

export interface RacingGameHandle {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  getGameState: () => GameState;
}

interface RacingGameProps {
  onOpenGarage: () => void;
  coins: number;
  onCoinsChange: (newCoins: number) => void;
  onOpenDailyChallenges?: () => void;
}

/**
 * Renders the ethereal, translucent holographic Ghost Car (Best Personal Run)
 */
function renderGhostVehicle(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  scale: number,
  ghostData: InterpolatedGhost,
  timeVal: number
) {
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.scale(scale, scale);
  ctx.rotate(ghostData.tilt);

  // Ethereal breathing translucency (0.34 - 0.50)
  const pulse = Math.sin(timeVal / 170) * 0.08;
  ctx.globalAlpha = Math.max(0.28, Math.min(0.58, 0.42 + pulse));

  const gW = 82;
  const gH = 56;

  // 1. Holographic ground glow under Ghost Car
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 6, gW * 0.55, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Cyan holographic shadow blur
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;

  // 3. Translucent Aerodynamic Ghost Body
  const bodyGrad = ctx.createLinearGradient(0, -gH, 0, 0);
  bodyGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
  bodyGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.42)');
  bodyGrad.addColorStop(1, 'rgba(2, 132, 199, 0.62)');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-gW / 2, -gH, gW, gH, [14, 14, 8, 8]);
  ctx.fill();

  // 4. Cyan holographic wireframe edges
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 5. Holographic horizontal scanlines across body
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.35)';
  ctx.lineWidth = 1;
  for (let ly = -gH + 6; ly < 0; ly += 7) {
    ctx.beginPath();
    ctx.moveTo(-gW * 0.42, ly);
    ctx.lineTo(gW * 0.42, ly);
    ctx.stroke();
  }

  // 6. Ghost Cabin & Windows
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.beginPath();
  ctx.roundRect(-gW * 0.35, -gH * 0.9, gW * 0.7, gH * 0.5, [10, 10, 4, 4]);
  ctx.fill();
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 7. Ghost Carbon Rear Spoiler
  ctx.fillStyle = 'rgba(3, 105, 161, 0.75)';
  ctx.fillRect(-gW * 0.52, -gH - 6, gW * 1.04, 7);
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(-gW * 0.52, -gH - 6, gW * 1.04, 7);

  // 8. Ghost Luminous Cyan Taillights
  ctx.fillStyle = '#67e8f9';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 14;
  ctx.fillRect(-gW * 0.45, -gH * 0.3, 16, 7);
  ctx.fillRect(gW * 0.45 - 16, -gH * 0.3, 16, 7);
  ctx.shadowBlur = 0;

  // 9. Ghost Tires
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.fillRect(-gW * 0.55, -22, 10, 20);
  ctx.fillRect(gW * 0.55 - 10, -22, 10, 20);
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(-gW * 0.55, -22, 10, 20);
  ctx.strokeRect(gW * 0.55 - 10, -22, 10, 20);

  // 10. Twin Ghost Nitro Flames if ghost was boosting
  if (ghostData.nitro) {
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 18;
    const flameH = 16 + Math.random() * 12;
    ctx.beginPath();
    ctx.moveTo(-gW * 0.28 - 4, 0);
    ctx.lineTo(-gW * 0.28 + 4, 0);
    ctx.lineTo(-gW * 0.28, flameH);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(gW * 0.28 - 4, 0);
    ctx.lineTo(gW * 0.28 + 4, 0);
    ctx.lineTo(gW * 0.28, flameH);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 11. Floating Holographic Badge above Ghost Car
  ctx.save();
  ctx.rotate(-ghostData.tilt); // Keep badge horizontal
  const tagY = -gH - 18;
  const tagText = `👻 Ghost PB (${Math.round(ghostData.speed)} km/h)`;
  ctx.font = 'bold 9px sans-serif';
  const tagW = ctx.measureText(tagText).width + 14;

  ctx.fillStyle = 'rgba(8, 47, 73, 0.88)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, tagY - 11, tagW, 16, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e0f2fe';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, 0, tagY - 3);
  ctx.restore();

  ctx.restore();
}

export const RacingGame = forwardRef<RacingGameHandle, RacingGameProps>((props, ref) => {
  const { onOpenGarage, coins, onCoinsChange, onOpenDailyChallenges } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-level React Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedTrack, setSelectedTrack] = useState<TrackEnvironment>('day');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  const [musicVolume, setMusicVolume] = useState<number>(0.35);
  const [soundVolume, setSoundVolume] = useState<number>(0.8);
  const [speedPitchEnabled, setSpeedPitchEnabled] = useState<boolean>(true);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [isUnpausing, setIsUnpausing] = useState<boolean>(false);
  const isUnpausingRef = useRef<boolean>(false);
  const [hapticsSupported] = useState<boolean>(() => isHapticsSupported());
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => isHapticEnabled());
  const [dailySummary, setDailySummary] = useState(() => getDailyChallengesSummary());
  const [liveMusicBpm, setLiveMusicBpm] = useState<number>(126);
  const [livePitchShift, setLivePitchShift] = useState<number>(0);
  const showAudioModalRef = useRef<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [runDistance, setRunDistance] = useState<number>(0);
  const [runDirt, setRunDirt] = useState<number>(0);
  const carDirtRef = useRef<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [nitroAmount, setNitroAmount] = useState<number>(100);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const isNitroActiveRef = useRef<boolean>(false);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [selectedCarId, setSelectedCarId] = useState<string>('red_rocket');
  const [carHealth, setCarHealth] = useState<number>(100);

  // Circular Minimap Telemetry State
  const [minimapPlayerX, setMinimapPlayerX] = useState<number>(0);
  const [minimapCurve, setMinimapCurve] = useState<number>(0);
  const [minimapTraffic, setMinimapTraffic] = useState<MinimapTrafficItem[]>([]);
  const [minimapCollectibles, setMinimapCollectibles] = useState<MinimapCollectibleItem[]>([]);
  const [minimapObstacles, setMinimapObstacles] = useState<MinimapObstacleItem[]>([]);
  const [minimapGhostZ, setMinimapGhostZ] = useState<number | null>(null);
  const [minimapGhostX, setMinimapGhostX] = useState<number | null>(null);
  const [minimapCorner, setMinimapCorner] = useState<'top-right' | 'top-left'>(() => {
    try {
      const saved = localStorage.getItem('fast_racing_minimap_corner');
      if (saved === 'top-left' || saved === 'top-right') return saved;
    } catch {}
    return 'top-right';
  });

  // Dynamic Achievements, Overtakes & Record Breaking Tracking
  const [raceOvertakes, setRaceOvertakes] = useState<number>(0);
  const raceOvertakesRef = useRef<number>(0);
  const highScoreBreakTriggeredRef = useRef<boolean>(false);
  const overtakeMilestonesTriggeredRef = useRef<Set<number>>(new Set());
  const initialHighScoreRef = useRef<number>(0);

  // Ghost Car System State & Telemetry Refs
  const [ghostEnabled, setGhostEnabled] = useState<boolean>(() => isGhostCarEnabled());
  const [ghostDelta, setGhostDelta] = useState<{ meters: number; status: 'ahead' | 'behind' | 'tied'; text: string } | null>(null);
  const [ghostRunInfo, setGhostRunInfo] = useState<GhostRunData | null>(null);
  const [ghostNotification, setGhostNotification] = useState<string | null>(null);
  const [isNewRecordBroken, setIsNewRecordBroken] = useState<boolean>(false);
  const activeGhostRef = useRef<GhostRunData | null>(null);
  const recordedFramesRef = useRef<GhostTelemetryFrame[]>([]);
  const raceTimeRef = useRef<number>(0);
  const lastRecordTimeRef = useRef<number>(0);
  const hasOvertakenGhostRef = useRef<boolean>(false);
  const ghostPrevAheadRef = useRef<boolean | null>(null);
  // Persistent Controls Overlay State & Key Visualizer
  const [showControlsOverlay, setShowControlsOverlay] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('metro_racers_controls_overlay');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 640;
    }
    return true;
  });
  const [activePressedKeys, setActivePressedKeys] = useState<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    nitro: boolean;
    space: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
    space: false,
  });

  useEffect(() => {
    const handleGhostSettings = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setGhostEnabled(customEvent.detail.enabled);
      }
    };
    const handleGhostRecord = (e: Event) => {
      const customEvent = e as CustomEvent<{ run: GhostRunData | null }>;
      if (customEvent.detail) {
        setGhostRunInfo(customEvent.detail.run);
        activeGhostRef.current = customEvent.detail.run;
      }
    };
    window.addEventListener('ghost_settings_changed', handleGhostSettings);
    window.addEventListener('ghost_record_updated', handleGhostRecord);
    return () => {
      window.removeEventListener('ghost_settings_changed', handleGhostSettings);
      window.removeEventListener('ghost_record_updated', handleGhostRecord);
    };
  }, []);

  useEffect(() => {
    const handleDailyUpdate = () => {
      setDailySummary(getDailyChallengesSummary());
    };
    window.addEventListener('daily_challenges_changed', handleDailyUpdate);
    return () => {
      window.removeEventListener('daily_challenges_changed', handleDailyUpdate);
    };
  }, []);

  // Mobile Device Detection
  const isMobileDevice = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window)
  );

  // Performance Mode (60 FPS High Speed for Mobile)
  const [performanceMode, setPerformanceMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fast_racing_perf_mode');
      if (saved !== null) return saved === 'true';
    } catch {}
    return isMobileDevice;
  });

  const togglePerformanceMode = () => {
    const next = !performanceMode;
    setPerformanceMode(next);
    try {
      localStorage.setItem('fast_racing_perf_mode', String(next));
    } catch {}
  };

  // FPS Counter
  const [fps, setFps] = useState<number>(60);
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());

  // Cached player stats and car specs to eliminate synchronous localStorage reads in 60 FPS animation loop
  const activeCarStatsRef = useRef<{
    stats: ReturnType<typeof loadPlayerStats>;
    currentCar: (typeof CARS_DATA)[0];
    effective: ReturnType<typeof getCarEffectiveStats>;
  } | null>(null);

  const refreshActiveCarStats = useCallback(() => {
    const stats = loadPlayerStats();
    const currentCar = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
    const effective = getCarEffectiveStats(currentCar, stats.upgrades[currentCar.id]);
    activeCarStatsRef.current = { stats, currentCar, effective };
    carDirtRef.current = stats.carDirt?.[currentCar.id] ?? 0;
    return activeCarStatsRef.current;
  }, []);

  const lastUiSyncRef = useRef<number>(0);

  // Active Key States
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    nitro: boolean;
    space: boolean;
    drift: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
    space: false,
    drift: false,
  });

  // Touch control state
  const touchSteerRef = useRef<number>(0); // -1 to 1

  // Engine loop state refs (avoid React re-render lag)
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Player physics
  const playerRef = useRef({
    x: 0, // -1 (left road edge) to 1 (right road edge)
    vx: 0,
    speed: 0, // current km/h
    targetSpeed: 0,
    nitro: 100,
    maxNitro: 100,
    health: 100,
    distance: 0,
    score: 0,
    coinsCollected: 0,
    nearMissesCount: 0,
    nitroBoostCount: 0,
    tilt: 0,
    shake: 0,
    curveOffset: 0,
    combo: 1,
    comboTimer: 0,
  });

  // World objects
  const trafficRef = useRef<TrafficVehicle[]>([]);
  const collectiblesRef = useRef<RoadCollectible[]>([]);
  const obstaclesRef = useRef<RoadObstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const crashFlashRef = useRef<number>(0); // 0 to 1 for collision screen flash & impact bloom
  const roadCurveRef = useRef({ current: 0, target: 0, timer: 0 });
  const carGhostsRef = useRef<Array<{
    x: number;
    y: number;
    tilt: number;
    color: string;
    accentColor: string;
    speed: number;
  }>>([]);
  const warpLinesRef = useRef<Array<{
    angle: number;
    dist: number;
    length: number;
    speed: number;
    color: string;
    width: number;
  }>>([]);

  // Player Car Visual Damage State (scratches, dents, smoke bursts)
  const playerDamageRef = useRef<{
    scratches: Array<{ x: number; y: number; len: number; angle: number; width: number; side: 'left' | 'right' | 'center' }>;
    dentLeft: number;
    dentRight: number;
    dentCenter: number;
    smokeTimer: number;
    hitFlash: number;
  }>({
    scratches: [],
    dentLeft: 0,
    dentRight: 0,
    dentCenter: 0,
    smokeTimer: 0,
    hitFlash: 0,
  });

  // Sync initial player stats from storage
  useEffect(() => {
    const stats = loadPlayerStats();
    setHighScore(stats.highScore);
    setSelectedCarId(stats.selectedCarId);
    setSelectedTrack(stats.selectedTrack);
    setSoundEnabled(stats.soundEnabled);
    const musicOn = stats.musicEnabled ?? true;
    setMusicEnabled(musicOn);

    const musVol = stats.musicVolume ?? 0.35;
    const sndVol = stats.soundVolume ?? 0.8;
    const spdPitch = stats.speedPitchEnabled ?? true;

    setMusicVolume(musVol);
    setSoundVolume(sndVol);
    setSpeedPitchEnabled(spdPitch);

    soundManager.setEnabled(stats.soundEnabled);
    soundManager.setMusicEnabled(musicOn);
    soundManager.setMusicVolume(musVol);
    soundManager.setVolume(sndVol);
    soundManager.setInteractivePitchEnabled(spdPitch);

    // Load Ghost Run for initial track
    const ghost = loadGhostRun(stats.selectedTrack);
    activeGhostRef.current = ghost;
    setGhostRunInfo(ghost);
  }, []);

  // Sync sound effects settings
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
    const stats = loadPlayerStats();
    stats.soundEnabled = next;
    savePlayerStats(stats);
  };

  // Sync high-energy background music settings
  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundManager.setMusicEnabled(next);
    const stats = loadPlayerStats();
    stats.musicEnabled = next;
    savePlayerStats(stats);

    if (gameState === 'PLAYING') {
      if (next) {
        soundManager.startMusic();
      } else {
        soundManager.stopMusic();
      }
    }
  };

  // Music volume slider handler
  const handleMusicVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setMusicVolume(clamped);
    soundManager.setMusicVolume(clamped);
    if (!musicEnabled && clamped > 0) {
      setMusicEnabled(true);
      soundManager.setMusicEnabled(true);
    }
    const stats = loadPlayerStats();
    stats.musicVolume = clamped;
    stats.musicEnabled = clamped > 0 ? true : musicEnabled;
    savePlayerStats(stats);
  };

  // SFX volume slider handler
  const handleSoundVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setSoundVolume(clamped);
    soundManager.setVolume(clamped);
    if (!soundEnabled && clamped > 0) {
      setSoundEnabled(true);
      soundManager.setEnabled(true);
    }
    const stats = loadPlayerStats();
    stats.soundVolume = clamped;
    stats.soundEnabled = clamped > 0 ? true : soundEnabled;
    savePlayerStats(stats);
  };

  // Interactive speed pitch toggle handler
  const handleSpeedPitchToggle = () => {
    const next = !speedPitchEnabled;
    setSpeedPitchEnabled(next);
    soundManager.setInteractivePitchEnabled(next);
    const stats = loadPlayerStats();
    stats.speedPitchEnabled = next;
    savePlayerStats(stats);
  };

  // Audio control modal toggle
  const toggleAudioModal = () => {
    setShowAudioModal(prev => {
      const next = !prev;
      showAudioModalRef.current = next;
      if (next) {
        const status = soundManager.getMusicStatus();
        setLiveMusicBpm(status.bpm);
        setLivePitchShift(status.pitchSemitones);
      }
      return next;
    });
  };

  const toggleHaptics = useCallback(() => {
    const next = !hapticsEnabled;
    setHapticsEnabledState(next);
    setHapticEnabled(next);
    if (next) {
      hapticTap();
    }
  }, [hapticsEnabled]);

  // Switch Track Environment
  const handleTrackChange = (track: TrackEnvironment) => {
    setSelectedTrack(track);
    const stats = loadPlayerStats();
    stats.selectedTrack = track;
    savePlayerStats(stats);
    soundManager.playClick();
    const ghost = loadGhostRun(track);
    activeGhostRef.current = ghost;
    setGhostRunInfo(ghost);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Key Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
        setActivePressedKeys((prev) => (prev.left ? prev : { ...prev, left: true }));
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
        setActivePressedKeys((prev) => (prev.right ? prev : { ...prev, right: true }));
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
        setActivePressedKeys((prev) => (prev.up ? prev : { ...prev, up: true }));
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
        setActivePressedKeys((prev) => (prev.down ? prev : { ...prev, down: true }));
      }
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Shift') {
        keysRef.current.nitro = true;
        keysRef.current.space = true;
        keysRef.current.drift = true;
        setActivePressedKeys((prev) => (prev.space ? prev : { ...prev, space: true, nitro: true }));
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          pauseGame();
        } else if (gameState === 'PAUSED') {
          resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
        setActivePressedKeys((prev) => (!prev.left ? prev : { ...prev, left: false }));
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
        setActivePressedKeys((prev) => (!prev.right ? prev : { ...prev, right: false }));
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
        setActivePressedKeys((prev) => (!prev.up ? prev : { ...prev, up: false }));
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
        setActivePressedKeys((prev) => (!prev.down ? prev : { ...prev, down: false }));
      }
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Shift') {
        keysRef.current.nitro = false;
        keysRef.current.space = false;
        keysRef.current.drift = false;
        setActivePressedKeys((prev) => (!prev.space ? prev : { ...prev, space: false, nitro: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Touch & Pointer controls for screen drag
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const mid = rect.width / 2;

    if (clickX < mid) {
      touchSteerRef.current = -1;
    } else {
      touchSteerRef.current = 1;
    }
  };

  const handlePointerUp = () => {
    touchSteerRef.current = 0;
  };

  // Helper to apply realistic visual scratches, panel dents, and impact smoke to the player car
  const applyPlayerCollisionDamage = useCallback((side: 'left' | 'right' | 'center', intensity: number = 1.0) => {
    const dmg = playerDamageRef.current;
    dmg.hitFlash = 1.0;
    dmg.smokeTimer = Math.max(dmg.smokeTimer, 3.5 * intensity);

    if (side === 'left') {
      dmg.dentLeft = Math.min(14, dmg.dentLeft + 4.0 * intensity);
    } else if (side === 'right') {
      dmg.dentRight = Math.min(14, dmg.dentRight + 4.0 * intensity);
    } else {
      dmg.dentCenter = Math.min(12, dmg.dentCenter + 3.5 * intensity);
      dmg.dentLeft = Math.min(14, dmg.dentLeft + 2.5 * intensity);
      dmg.dentRight = Math.min(14, dmg.dentRight + 2.5 * intensity);
    }

    // Add multi-layered metallic scratches along the damaged chassis/bumper
    const scratchCount = Math.floor(4 + Math.random() * 4);
    for (let k = 0; k < scratchCount; k++) {
      if (dmg.scratches.length >= 26) {
        dmg.scratches.shift();
      }
      let baseX = 0;
      const baseY = -14 - Math.random() * 34;
      if (side === 'left') {
        baseX = -36 + (Math.random() - 0.3) * 12;
      } else if (side === 'right') {
        baseX = 36 - (Math.random() - 0.3) * 12;
      } else {
        baseX = (Math.random() - 0.5) * 48;
      }
      dmg.scratches.push({
        x: baseX,
        y: baseY,
        len: 12 + Math.random() * 24,
        angle: (Math.random() - 0.5) * 0.9 + (side === 'left' ? -0.35 : side === 'right' ? 0.35 : 0),
        width: 1.2 + Math.random() * 2.2,
        side,
      });
    }
  }, []);

  // Setup / Reset Game Run
  const startGame = useCallback(() => {
    const activeData = refreshActiveCarStats();
    const effective = activeData.effective;

    playerRef.current = {
      x: 0,
      vx: 0,
      speed: 60,
      targetSpeed: 60,
      nitro: 100,
      maxNitro: effective.nitro,
      health: 100,
      distance: 0,
      score: 0,
      coinsCollected: 0,
      nearMissesCount: 0,
      nitroBoostCount: 0,
      tilt: 0,
      shake: 0,
      curveOffset: 0,
      combo: 1,
      comboTimer: 0,
    };

    playerDamageRef.current = {
      scratches: [],
      dentLeft: 0,
      dentRight: 0,
      dentCenter: 0,
      smokeTimer: 0,
      hitFlash: 0,
    };

    trafficRef.current = [];
    collectiblesRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    carGhostsRef.current = [];
    warpLinesRef.current = [];
    roadCurveRef.current = { current: 0, target: 0, timer: 0 };

    // Reset Dynamic Achievements & Overtaking counters for this run
    const currentStoredStats = loadPlayerStats();
    initialHighScoreRef.current = currentStoredStats.highScore || 0;
    raceOvertakesRef.current = 0;
    setRaceOvertakes(0);
    highScoreBreakTriggeredRef.current = false;
    overtakeMilestonesTriggeredRef.current.clear();

    // Reset Circular Minimap state
    setMinimapPlayerX(0);
    setMinimapCurve(0);
    setMinimapTraffic([]);
    setMinimapCollectibles([]);
    setMinimapObstacles([]);
    setMinimapGhostZ(null);
    setMinimapGhostX(null);

    // Initial traffic population ahead
    for (let i = 1; i <= 6; i++) {
      const laneIndex = Math.floor(Math.random() * 3);
      const laneX = [-0.6, 0, 0.6][laneIndex];
      const types: Array<'sedan' | 'suv' | 'truck' | 'sports'> = ['sedan', 'suv', 'truck', 'sports'];
      trafficRef.current.push({
        id: Math.random(),
        x: laneX,
        z: 400 + i * 260 + Math.random() * 80,
        speed: 60 + Math.random() * 45,
        lane: laneIndex,
        type: types[Math.floor(Math.random() * types.length)],
        color: ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#64748b'][Math.floor(Math.random() * 6)],
        targetX: laneX,
        laneChangeTimer: 2 + Math.random() * 5,
      });
    }

    // Initial collectibles
    for (let i = 1; i <= 5; i++) {
      collectiblesRef.current.push({
        id: Math.random(),
        x: (Math.random() - 0.5) * 1.4,
        z: 300 + i * 220,
        type: Math.random() > 0.3 ? 'coin' : 'nitro',
        collected: false,
        rotation: 0,
      });
    }

    setIsUnpausing(false);
    isUnpausingRef.current = false;
    setGameState('PLAYING');
    setCurrentScore(0);
    setRunCoins(0);
    setRunDistance(0);
    setCarHealth(100);
    setNitroAmount(100);
    setComboMultiplier(1);
    setComboMessage(null);

    // Reset Ghost recording and telemetry
    raceTimeRef.current = 0;
    lastRecordTimeRef.current = 0;
    hasOvertakenGhostRef.current = false;
    ghostPrevAheadRef.current = null;
    setIsNewRecordBroken(false);
    setGhostNotification(null);
    setGhostDelta(null);
    const ghost = loadGhostRun(selectedTrack);
    activeGhostRef.current = ghost;
    setGhostRunInfo(ghost);
    recordedFramesRef.current = [
      {
        t: 0,
        d: 0,
        x: 0,
        tilt: 0,
        speed: 60,
        nitro: false,
        drift: false,
      },
    ];

    soundManager.startEngine();
    if (musicEnabled) {
      soundManager.startMusic();
    }
  }, [musicEnabled, selectedTrack]);

  const pauseGame = () => {
    setIsUnpausing(false);
    isUnpausingRef.current = false;
    setGameState('PAUSED');
    soundManager.stopEngine();
    soundManager.pauseMusic();
  };

  const resumeGame = () => {
    if (isUnpausingRef.current) return;
    isUnpausingRef.current = true;
    setIsUnpausing(true);

    // Smooth 220ms fade-out transition before resuming engine & physics
    setTimeout(() => {
      isUnpausingRef.current = false;
      setIsUnpausing(false);
      setGameState('PLAYING');
      soundManager.startEngine();
      if (musicEnabled) {
        soundManager.resumeMusic();
      }
    }, 220);
  };

  useImperativeHandle(ref, () => ({
    startGame,
    pauseGame,
    resumeGame,
    getGameState: () => gameState,
  }));

  const gameOver = useCallback(() => {
    setGameState('GAMEOVER');
    soundManager.stopEngine();
    soundManager.stopMusic();
    soundManager.playCrash();
    hapticGameOver();

    // Persist scores, coins, and car dirt accumulation
    const stats = loadPlayerStats();
    const finalCoins = stats.coins + playerRef.current.coinsCollected;
    const finalScore = Math.floor(playerRef.current.score);
    const newHigh = Math.max(stats.highScore, finalScore);
    const newMaxDist = Math.max(stats.maxDistance, Math.floor(playerRef.current.distance));
    const finalDirt = Math.min(100, Math.round(carDirtRef.current));

    stats.coins = finalCoins;
    stats.highScore = newHigh;
    stats.maxDistance = newMaxDist;
    stats.racesCount = (stats.racesCount || 0) + 1;
    if (!stats.carDirt) stats.carDirt = {};
    stats.carDirt[stats.selectedCarId] = finalDirt;
    savePlayerStats(stats);
    recordDailyRace();
    checkAndUnlockAchievements(stats);

    // Record progress for Daily Challenges missions
    recordDailyChallengeProgress({
      distance: Math.floor(playerRef.current.distance),
      coins: playerRef.current.coinsCollected,
      nearMisses: playerRef.current.nearMissesCount || 0,
      races: 1,
      singleScore: finalScore,
      nitroBoosts: playerRef.current.nitroBoostCount || 0,
    });

    // Auto-record score into Top 5 Leaderboard (LocalStorage)
    if (finalScore > 0) {
      const pName = loadPlayerName();
      const car = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
      addLeaderboardScore(pName, finalScore, car.arabicName || car.name);
    }

    // Ghost Car Record Evaluation & Storage
    const runDist = Math.floor(playerRef.current.distance);
    const isNewGhostRecord = checkIsNewGhostRecord(selectedTrack, runDist);
    if (isNewGhostRecord && recordedFramesRef.current.length > 5) {
      const car = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
      const newGhostRun: GhostRunData = {
        version: 1,
        id: `ghost_${Date.now()}`,
        track: selectedTrack,
        carId: car.id,
        carName: car.arabicName || car.name,
        carColor: car.color,
        accentColor: car.accentColor,
        totalDistance: runDist,
        totalTime: Math.round(raceTimeRef.current * 10) / 10,
        finalScore,
        recordedAt: Date.now(),
        frames: recordedFramesRef.current,
      };
      saveGhostRun(newGhostRun);
      activeGhostRef.current = newGhostRun;
      setGhostRunInfo(newGhostRun);
      setIsNewRecordBroken(true);
      soundManager.playRewardFanfare();
    } else {
      setIsNewRecordBroken(false);
    }

    onCoinsChange(finalCoins);
    setHighScore(newHigh);
    setCurrentScore(finalScore);
    setRunCoins(playerRef.current.coinsCollected);
    setRunDistance(Math.floor(playerRef.current.distance));
    setRunDirt(finalDirt);
  }, [onCoinsChange, selectedTrack]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = (canvas.getContext('2d', { alpha: false, desynchronized: true }) || canvas.getContext('2d')) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    let nextTrafficSpawn = 0;
    let nextCollectibleSpawn = 0;
    let nextObstacleSpawn = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Track FPS
      fpsFrameCountRef.current++;
      const now = performance.now();
      if (now - fpsLastTimeRef.current >= 1000) {
        setFps(Math.round((fpsFrameCountRef.current * 1000) / (now - fpsLastTimeRef.current)));
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      // Handle Resize dynamically with Mobile-Optimized DPR
      const targetMaxDpr = isMobileDevice
        ? (performanceMode ? 1.0 : 1.25)
        : (performanceMode ? 1.25 : Math.min(window.devicePixelRatio || 1, 2.0));
      const dpr = Math.max(1.0, Math.min(window.devicePixelRatio || 1, targetMaxDpr));
      const width = canvas.parentElement?.clientWidth || 800;
      const height = Math.min(width * 0.65, 520);
      const targetWidth = Math.round(width * dpr);
      const targetHeight = Math.round(height * dpr);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // Current player car config from memory cache (NO synchronous localStorage in 60fps loop!)
      if (!activeCarStatsRef.current) {
        refreshActiveCarStats();
      }
      const activeData = activeCarStatsRef.current!;
      const stats = activeData.stats;
      const currentCar = activeData.currentCar;
      const effective = activeData.effective;

      // Initialize 3D Warp Tunnel Motion Blur Streaks (Scaled down on mobile for high FPS)
      const maxWarpCount = (isMobileDevice || performanceMode) ? 16 : 48;
      if (warpLinesRef.current.length === 0 || warpLinesRef.current.length !== maxWarpCount) {
        warpLinesRef.current = [];
        for (let i = 0; i < maxWarpCount; i++) {
          const angle = (i / maxWarpCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.14;
          warpLinesRef.current.push({
            angle,
            dist: Math.random() * 550,
            length: 20 + Math.random() * 50,
            speed: 380 + Math.random() * 420,
            color: Math.random() > 0.35 ? '#38bdf8' : '#ffffff',
            width: 1.5 + Math.random() * 1.5,
          });
        }
      }

      if (gameState === 'PLAYING') {
        const p = playerRef.current;

        // Curve changes
        roadCurveRef.current.timer -= dt;
        if (roadCurveRef.current.timer <= 0) {
          roadCurveRef.current.target = (Math.random() - 0.5) * 1.5;
          roadCurveRef.current.timer = 3 + Math.random() * 4;
        }
        roadCurveRef.current.current += (roadCurveRef.current.target - roadCurveRef.current.current) * dt * 0.8;
        p.curveOffset += roadCurveRef.current.current * (p.speed / 100) * dt;

        // Acceleration & Nitro
        const wantAccel = keysRef.current.up || touchSteerRef.current !== 0;
        const wantBrake = keysRef.current.down;
        const wantNitro = (keysRef.current.nitro || false) && p.nitro > 0;

        let maxSpeed = effective.topSpeed;
        if (wantNitro) {
          maxSpeed = effective.topSpeed * 1.35;
          p.nitro = Math.max(0, p.nitro - dt * 25);
          if (Math.random() < 0.4) soundManager.playNitroBoost();
          if (!isNitroActiveRef.current) {
            isNitroActiveRef.current = true;
            setIsNitroActive(true);
            p.nitroBoostCount = (p.nitroBoostCount || 0) + 1;
            hapticNitroBoost();
          }
        } else {
          // Slow passive nitro recharge
          p.nitro = Math.min(effective.nitro, p.nitro + dt * 4);
          if (isNitroActiveRef.current) {
            isNitroActiveRef.current = false;
            setIsNitroActive(false);
          }
        }

        // Speed calculation
        if (wantBrake) {
          p.speed = Math.max(20, p.speed - dt * 140);
        } else if (wantAccel || wantNitro) {
          const accelRate = (effective.acceleration / 100) * (wantNitro ? 90 : 55);
          p.speed = Math.min(maxSpeed, p.speed + dt * accelRate);
        } else {
          // Coasting drag
          p.speed = Math.max(40, p.speed - dt * 25);
        }

        // Steering input
        let steerInput = 0;
        if (keysRef.current.left) steerInput -= 1;
        if (keysRef.current.right) steerInput += 1;
        if (touchSteerRef.current !== 0) steerInput += touchSteerRef.current;

        const handlingFactor = (effective.handling / 100) * 2.8;
        const steerSpeed = steerInput * handlingFactor * (p.speed / 160);
        p.vx += (steerSpeed - p.vx) * dt * 10;
        p.x += p.vx * dt;

        // Tilt effect
        p.tilt += (steerInput * 0.14 - p.tilt) * dt * 8;

        // Road boundaries & grass drag
        if (p.x < -0.95 || p.x > 0.95) {
          p.speed = Math.max(30, p.speed - dt * 120);
          p.shake = 4;
          if (Math.random() < 0.2) soundManager.playDrift();
        }
        p.x = Math.max(-1.15, Math.min(1.15, p.x));

        // Camera shake dampening & collision flash decay
        p.shake *= 0.9;
        if (crashFlashRef.current > 0) {
          crashFlashRef.current = Math.max(0, crashFlashRef.current - dt * 2.8);
        }

        // Distance & score
        const distanceStep = (p.speed / 3.6) * dt;
        p.distance += distanceStep;
        p.score += (distanceStep * (p.speed / 100) * p.combo);

        // Realistic Dirt & Mud Accumulation during Race
        const speedNorm = p.speed / 100;
        let dirtRate = 0.22 * speedNorm; // Baseline highway road dust

        // Rain track: road water puddles & mud spray accumulate 2.6x faster
        if (selectedTrack === 'rain') {
          dirtRate *= 2.6;
        } else if (selectedTrack === 'sunset') {
          dirtRate *= 1.25;
        }

        // Off-road / road shoulder kicking up dirt, gravel & curb dust
        if (Math.abs(p.x) > 0.88) {
          dirtRate += 2.5;
        }

        // Drifting kicks up hot rubber residue & road grit
        if (keysRef.current.drift || keysRef.current.space) {
          dirtRate += 1.8;
        }

        carDirtRef.current = Math.min(100, carDirtRef.current + dirtRate * dt);

        // Combo timer
        if (p.comboTimer > 0) {
          p.comboTimer -= dt;
          if (p.comboTimer <= 0) {
            p.combo = 1;
            setComboMultiplier(1);
            setComboMessage(null);
          }
        }

        // Update sound engine & dynamic interactive speed music harmonics
        const speedRatio = p.speed / effective.topSpeed;
        soundManager.updateEngine(speedRatio, wantAccel, wantNitro);
        soundManager.setNitroMusicMode(wantNitro);
        soundManager.updateMusicSpeed(speedRatio, wantAccel, wantNitro);

        if (showAudioModalRef.current && Math.random() < 0.12) {
          const status = soundManager.getMusicStatus();
          setLiveMusicBpm(status.bpm);
          setLivePitchShift(status.pitchSemitones);
        }

        // Spawn traffic
        nextTrafficSpawn -= dt;
        if (nextTrafficSpawn <= 0 && trafficRef.current.length < 8) {
          const laneIdx = Math.floor(Math.random() * 3);
          const laneX = [-0.65, 0, 0.65][laneIdx];
          const vehicleTypes: Array<'sedan' | 'suv' | 'truck' | 'police' | 'sports'> = [
            'sedan',
            'suv',
            'truck',
            'police',
            'sports',
          ];
          trafficRef.current.push({
            id: Math.random(),
            x: laneX,
            z: 800 + Math.random() * 150,
            speed: 50 + Math.random() * 55,
            lane: laneIdx,
            type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
            color: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#ef4444', '#cbd5e1'][Math.floor(Math.random() * 6)],
            targetX: laneX,
            laneChangeTimer: 2 + Math.random() * 4,
          });
          nextTrafficSpawn = 1.2 + Math.random() * 1.5;
        }

        // Spawn collectibles
        nextCollectibleSpawn -= dt;
        if (nextCollectibleSpawn <= 0 && collectiblesRef.current.length < 6) {
          const laneX = (Math.random() - 0.5) * 1.3;
          collectiblesRef.current.push({
            id: Math.random(),
            x: laneX,
            z: 750 + Math.random() * 100,
            type: Math.random() > 0.25 ? 'coin' : 'nitro',
            collected: false,
            rotation: 0,
          });
          nextCollectibleSpawn = 0.9 + Math.random() * 1.2;
        }

        // Spawn road obstacles (cones / barriers)
        nextObstacleSpawn -= dt;
        if (nextObstacleSpawn <= 0 && obstaclesRef.current.length < 4) {
          const laneX = (Math.random() - 0.5) * 1.4;
          obstaclesRef.current.push({
            id: Math.random(),
            x: laneX,
            z: 850 + Math.random() * 150,
            type: Math.random() > 0.4 ? 'cone' : 'barrier',
            hit: false,
          });
          nextObstacleSpawn = 2.5 + Math.random() * 3;
        }

        // Move traffic
        for (let i = trafficRef.current.length - 1; i >= 0; i--) {
          const car = trafficRef.current[i];
          const relativeSpeed = p.speed - car.speed;
          car.z -= relativeSpeed * dt * 2.5;

          // If vehicle was collided with and damaged: spin out, veer off and emit dark smoke
          if (car.damaged) {
            car.x += (car.spinVx || 0) * dt;
            car.spinAngle = (car.spinAngle || 0) + (car.spinVx && car.spinVx > 0 ? 1 : -1) * 7.5 * dt;

            if (car.smokeTimer && car.smokeTimer > 0) {
              car.smokeTimer -= dt;
              if (Math.random() < 0.6 && car.z > 0 && car.z < 900) {
                const zFactor = Math.max(0.01, Math.min(1, 1 - car.z / 900));
                const carScreenY = height * 0.42 + Math.pow(zFactor, 2.2) * (height * 0.58);
                const roadWAtY = width * 0.12 + (width * 0.73) * Math.pow(zFactor, 2.2);
                const carScreenX = width / 2 + (car.x * roadWAtY * 0.42);
                const carScale = Math.pow(zFactor, 1.6);

                particlesRef.current.push({
                  x: carScreenX + (Math.random() - 0.5) * 16 * carScale,
                  y: carScreenY + (Math.random() - 0.5) * 12 * carScale,
                  vx: (Math.random() - 0.5) * 35,
                  vy: 35 + Math.random() * 50,
                  life: 0.5 + Math.random() * 0.3,
                  maxLife: 0.8,
                  color: Math.random() > 0.3 ? '#1e293b' : '#475569',
                  size: Math.max(3.5, 15 * carScale),
                  shape: 'smoke',
                  growth: 20 * carScale,
                });
              }
            }
          } else {
            // Gentle lane changing for normal traffic
            car.laneChangeTimer -= dt;
            if (car.laneChangeTimer <= 0) {
              const newLane = Math.floor(Math.random() * 3);
              car.targetX = [-0.65, 0, 0.65][newLane];
              car.laneChangeTimer = 4 + Math.random() * 5;
            }
            car.x += (car.targetX - car.x) * dt * 0.8;
          }

          // Close pass / Near miss detection
          if (Math.abs(car.z) < 18 && Math.abs(car.x - p.x) < 0.48 && Math.abs(car.x - p.x) > 0.22 && !((car as unknown as { scoredCloseCall?: boolean }).scoredCloseCall)) {
            (car as unknown as { scoredCloseCall?: boolean }).scoredCloseCall = true;
            p.nearMissesCount = (p.nearMissesCount || 0) + 1;
            p.combo = Math.min(5, p.combo + 1);
            p.comboTimer = 3.5;
            p.score += 75 * p.combo;
            setComboMultiplier(p.combo);
            setComboMessage(`Near Miss! +${75 * p.combo}`);
            soundManager.playNearMiss();
            hapticNearMiss();
          }

          // Collision detection with other traffic vehicle
          if (Math.abs(car.z) < 22 && Math.abs(car.x - p.x) < 0.24) {
            // Calculate collision side relative to player
            const impactSide: 'left' | 'right' | 'center' =
              car.x < p.x - 0.05 ? 'left' : car.x > p.x + 0.05 ? 'right' : 'center';

            // Apply realistic body scratches, dents, and contact scorch to player car
            applyPlayerCollisionDamage(impactSide, 1.0);

            // Crash impact: Intense camera shake, speed loss, health drop, and screen flash!
            p.shake = 28;
            p.speed *= 0.35;
            p.health -= 35;
            crashFlashRef.current = 1.0; // Trigger brilliant collision screen flash
            setCarHealth(Math.max(0, p.health));
            soundManager.playCrash();
            hapticTrafficCollision();

            // Spawn explosive crash debris & scattering spark particles (optimized on mobile)
            const crashDebrisCount = (isMobileDevice || performanceMode) ? 22 : 42;
            const sparkColors = ['#ffffff', '#fef08a', '#f97316', '#ef4444', '#f59e0b', '#dc2626'];
            for (let k = 0; k < crashDebrisCount; k++) {
              const angle = Math.random() * Math.PI * 2;
              const velocity = 100 + Math.random() * 400;
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3) + (Math.random() - 0.5) * 30,
                y: height * 0.82 + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 90, // upward explosion arc
                life: 0.5 + Math.random() * 0.45,
                maxLife: 0.85,
                color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
                size: 2.5 + Math.random() * 5.5,
              });
            }

            // Spawn immediate thick collision friction smoke bursts
            const impactSmokeCount = (isMobileDevice || performanceMode) ? 8 : 16;
            for (let s = 0; s < impactSmokeCount; s++) {
              const smokeAngle = Math.random() * Math.PI * 2;
              const smokeSpeed = 35 + Math.random() * 80;
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3) + (impactSide === 'left' ? -25 : impactSide === 'right' ? 25 : 0),
                y: height * 0.82 + (Math.random() - 0.5) * 15,
                vx: Math.cos(smokeAngle) * smokeSpeed,
                vy: Math.sin(smokeAngle) * smokeSpeed + 45,
                life: 0.65 + Math.random() * 0.5,
                maxLife: 1.15,
                color: Math.random() > 0.4 ? '#0f172a' : '#334155',
                size: 10 + Math.random() * 12,
                shape: 'smoke',
                growth: 35 + Math.random() * 25,
                spin: (Math.random() - 0.5) * 3,
              });
            }

            // Mark traffic vehicle as visually damaged and cause it to spin out with scratches and smoke
            if (!car.damaged) {
              car.damaged = true;
              car.damageSide = impactSide === 'left' ? 'right' : 'left';
              car.spinVx = (car.x >= p.x ? 1 : -1) * (2.8 + Math.random() * 2.4);
              car.spinAngle = 0;
              car.smokeTimer = 2.5;
              car.scratches = [];
              for (let sc = 0; sc < 6; sc++) {
                car.scratches.push({
                  x: (Math.random() - 0.5) * 28,
                  y: -8 - Math.random() * 28,
                  len: 8 + Math.random() * 18,
                  angle: (Math.random() - 0.5) * 0.9,
                  width: 1.2 + Math.random() * 1.6,
                });
              }
            }

            if (p.health <= 0) {
              trafficRef.current.splice(i, 1);
              gameOver();
              break;
            }
            continue;
          }

          // Clean overtake detection (vehicle safely passed behind player)
          if (car.z < -5 && !car.overtaken) {
            car.overtaken = true;
            raceOvertakesRef.current += 1;
            const count = raceOvertakesRef.current;
            setRaceOvertakes(count);

            // Award bonus score for clean pass
            p.score += 30 * p.combo;

            // Milestone toasts for overtaking cars in this run
            const overtakeMilestones: Record<number, { title: string; desc: string; coins: number; icon: 'zap' | 'car' | 'flame' | 'trophy' | 'sparkles' }> = {
              5: { title: 'Speed Overtake! ⚡', desc: 'Successfully overtook 5 cars in city traffic!', coins: 30, icon: 'zap' },
              10: { title: 'Master Driver! 🏎️', desc: 'Threaded through 10 cars in heavy traffic without crashing!', coins: 75, icon: 'car' },
              25: { title: 'Highway King! 🔥', desc: 'Epic skill! Overtook 25 vehicles in a single run!', coins: 150, icon: 'flame' },
              50: { title: 'Traffic Phantom! 👑', desc: 'Invincible maneuvers! 50 cars overtaken in one race!', coins: 300, icon: 'trophy' },
              100: { title: 'Legendary Speedster! 🌟', desc: 'World-class mastery! 100 cars overtaken!', coins: 600, icon: 'sparkles' },
            };

            if (overtakeMilestones[count] && !overtakeMilestonesTriggeredRef.current.has(count)) {
              overtakeMilestonesTriggeredRef.current.add(count);
              const m = overtakeMilestones[count];
              p.coinsCollected += m.coins;
              setRunCoins(p.coinsCollected);

              dispatchGameToast({
                type: 'overtake',
                title: m.title,
                description: m.desc,
                iconName: m.icon,
                reward: m.coins,
                badgeText: `${count} Cars`,
              });
            }

            // Realtime stats career overtakes increment & achievements check
            const currentStats = loadPlayerStats();
            currentStats.totalOvertakes = (currentStats.totalOvertakes || 0) + 1;
            savePlayerStats(currentStats);
            checkAndUnlockAchievements(currentStats);
          }

          // Remove vehicles far behind, far ahead, or spun far off-road
          if (car.z < -60 || car.z > 1200 || Math.abs(car.x) > 2.2) {
            trafficRef.current.splice(i, 1);
          }
        }

        // Move collectibles & Check pickup
        for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
          const item = collectiblesRef.current[i];
          const relativeSpeed = p.speed;
          item.z -= relativeSpeed * dt * 2.5;
          item.rotation += dt * 3;

          if (Math.abs(item.z) < 20 && Math.abs(item.x - p.x) < 0.28 && !item.collected) {
            item.collected = true;
            if (item.type === 'coin') {
              p.coinsCollected += 1;
              p.score += 25 * p.combo;
              soundManager.playCoin(p.combo);
            } else if (item.type === 'nitro') {
              p.nitro = effective.nitro;
              soundManager.playNitroBoost();
              hapticNitroBoost();
            }

            // Spawn sparkly pickup particles (optimized count on mobile)
            const pickupParticleCount = (isMobileDevice || performanceMode) ? 5 : 10;
            for (let k = 0; k < pickupParticleCount; k++) {
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3),
                y: height * 0.82,
                vx: (Math.random() - 0.5) * 150,
                vy: -Math.random() * 150 - 50,
                life: 0.45,
                maxLife: 0.45,
                color: item.type === 'coin' ? '#fbbf24' : '#38bdf8',
                size: 2.5 + Math.random() * 2.5,
              });
            }
          }

          if (item.z < -40 || item.collected) {
            collectiblesRef.current.splice(i, 1);
          }
        }

        // Move obstacles
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.z -= p.speed * dt * 2.5;

          if (Math.abs(obs.z) < 18 && Math.abs(obs.x - p.x) < 0.22 && !obs.hit) {
            obs.hit = true;
            applyPlayerCollisionDamage('center', 0.6);
            p.speed *= 0.65;
            p.shake = 10;
            p.health -= 15;
            setCarHealth(Math.max(0, p.health));
            soundManager.playCrash();
            hapticObstacleCollision();

            if (p.health <= 0) {
              gameOver();
              break;
            }
          }

          if (obs.z < -40) {
            obstaclesRef.current.splice(i, 1);
          }
        }

        // =========================================================================
        // BLACK TIRE DRIFT SMOKE PARTICLE SYSTEM (Space Key & Power Slide)
        // =========================================================================
        const roadW = width * 0.85;
        const curPlayerX = width / 2 + p.x * (roadW * 0.42);
        const curPlayerY = height * 0.82;
        const pW = 82;
        const pH = 56;

        // Space key triggers drift; also active when power-sliding or high lateral-g steering
        const isSpaceHeld = keysRef.current.space || keysRef.current.drift;
        const isHardSteering = Math.abs(steerInput) > 0.35 || Math.abs(p.vx) > 0.38;
        const isDrifting = (isSpaceHeld || isHardSteering) && p.speed > 30;

        if (isDrifting) {
          // Play drift tire screech audio periodically
          if (Math.random() < 0.24) {
            soundManager.playDrift();
          }

          // Camera micro-shudder from burning rubber friction on asphalt
          p.shake = Math.max(p.shake, isSpaceHeld ? 3.0 : 2.0);

          // Deep burnt-rubber black & charcoal smoke palette
          const blackSmokeColors = [
            'rgba(8, 8, 12, 0.92)',   // Deep pitch black
            'rgba(18, 18, 24, 0.86)',  // Hot burnt rubber black
            'rgba(28, 28, 36, 0.80)',  // Heavy charcoal black
            'rgba(38, 38, 48, 0.72)',  // Billowy dark smoke
          ];

          // Tire contact patch positions on the road (exact alignment with wheels)
          const tireLocations = [
            { x: curPlayerX - pW * 0.48, y: curPlayerY - 4, isRear: true },  // Left rear tire
            { x: curPlayerX + pW * 0.48, y: curPlayerY - 4, isRear: true },  // Right rear tire
          ];

          // During active lateral steering angle, outside front tire also skids
          if (Math.abs(steerInput) > 0.12) {
            const frontSkidX = steerInput < 0 ? curPlayerX + pW * 0.44 : curPlayerX - pW * 0.44;
            tireLocations.push({ x: frontSkidX, y: curPlayerY - 24, isRear: false });
          }

          // Spawn volumetric billowing black smoke from tires
          if (particlesRef.current.length < 220) {
            tireLocations.forEach((tire) => {
              const puffsPerTire = isSpaceHeld ? 2 : 1;

              for (let k = 0; k < puffsPerTire; k++) {
                const color = blackSmokeColors[Math.floor(Math.random() * blackSmokeColors.length)];
                const life = 0.55 + Math.random() * 0.4;
                const lateralThrow = (steerInput !== 0 ? -steerInput * 95 : (Math.random() - 0.5) * 60);

                // 1. Billowing dense black tire smoke puff
                particlesRef.current.push({
                  x: tire.x + (Math.random() - 0.5) * 8,
                  y: tire.y + (Math.random() - 0.5) * 5,
                  vx: lateralThrow + (Math.random() - 0.5) * 45,
                  vy: (p.speed / 3.6) * 1.5 + 45 + Math.random() * 55, // Drifts backwards relative to forward motion
                  life,
                  maxLife: life,
                  color,
                  size: 8 + Math.random() * 9,
                  growth: 50 + Math.random() * 50, // Rapidly expands into billowy dark cloud
                  spin: (Math.random() - 0.5) * 5.8,
                  angle: Math.random() * Math.PI * 2,
                  shape: 'smoke',
                });

                // 2. High-heat friction sparks flying from burning rubber (20% chance)
                if (Math.random() < 0.22) {
                  particlesRef.current.push({
                    x: tire.x + (Math.random() - 0.5) * 8,
                    y: tire.y + (Math.random() - 0.5) * 6,
                    vx: lateralThrow * 1.6 + (Math.random() - 0.5) * 85,
                    vy: (p.speed / 3.6) * 1.8 + 70 + Math.random() * 90,
                    life: 0.18 + Math.random() * 0.14,
                    maxLife: 0.3,
                    color: Math.random() > 0.4 ? '#fbbf24' : '#f97316',
                    size: 2,
                    length: 12 + Math.random() * 12,
                    shape: 'spark',
                  });
                }
              }
            });
          }
        }

        // =========================================================================
        // DAMAGE SMOKE & ENGINE FIRE SYSTEM (Collision Damage, Radiator Steam & Wreck Smoke)
        // =========================================================================
        const dmgState = playerDamageRef.current;
        dmgState.hitFlash = Math.max(0, dmgState.hitFlash - dt * 3.5);
        dmgState.smokeTimer = Math.max(0, dmgState.smokeTimer - dt);

        const damageSeverity = Math.max(0, (100 - p.health) / 100);

        if ((damageSeverity > 0.08 || dmgState.smokeTimer > 0) && particlesRef.current.length < 240) {
          // Source position on the car body based on impacted side
          let smokeOffsetX = 0;
          if (dmgState.dentLeft > dmgState.dentRight + 2) {
            smokeOffsetX = -pW * 0.28;
          } else if (dmgState.dentRight > dmgState.dentLeft + 2) {
            smokeOffsetX = pW * 0.28;
          } else {
            smokeOffsetX = (Math.random() - 0.5) * (pW * 0.35);
          }

          const smokeOriginX = curPlayerX + smokeOffsetX;
          const smokeOriginY = curPlayerY - pH * 0.35;

          // Severity tiers:
          // 1. Critical Damage (< 35% health): Heavy billowing pitch black smoke plumes + glowing orange sparks
          if (damageSeverity > 0.65) {
            // Dense black billowing smoke
            particlesRef.current.push({
              x: smokeOriginX + (Math.random() - 0.5) * 12,
              y: smokeOriginY + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 45 - p.vx * 70,
              vy: 75 + (p.speed / 3.6) * 1.8 + Math.random() * 55,
              life: 0.65 + Math.random() * 0.45,
              maxLife: 1.1,
              color: Math.random() > 0.3 ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.9)',
              size: 11 + Math.random() * 12,
              growth: 55 + Math.random() * 40,
              spin: (Math.random() - 0.5) * 4,
              angle: Math.random() * Math.PI * 2,
              shape: 'smoke',
            });

            // Burning engine embers / sparks
            if (Math.random() < 0.32) {
              particlesRef.current.push({
                x: smokeOriginX + (Math.random() - 0.5) * 14,
                y: smokeOriginY + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 90 - p.vx * 60,
                vy: 90 + Math.random() * 100,
                life: 0.22 + Math.random() * 0.18,
                maxLife: 0.4,
                color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
                size: 2.2,
                length: 10 + Math.random() * 12,
                shape: 'spark',
              });
            }
          }
          // 2. Moderate Damage (35% - 65% health): Billowing dark charcoal gray smoke
          else if (damageSeverity > 0.35) {
            if (Math.random() < 0.75) {
              particlesRef.current.push({
                x: smokeOriginX + (Math.random() - 0.5) * 10,
                y: smokeOriginY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 35 - p.vx * 50,
                vy: 65 + (p.speed / 3.6) * 1.5 + Math.random() * 45,
                life: 0.55 + Math.random() * 0.35,
                maxLife: 0.9,
                color: Math.random() > 0.4 ? 'rgba(51, 65, 85, 0.85)' : 'rgba(71, 85, 105, 0.8)',
                size: 9 + Math.random() * 9,
                growth: 42 + Math.random() * 30,
                spin: (Math.random() - 0.5) * 3,
                angle: Math.random() * Math.PI * 2,
                shape: 'smoke',
              });
            }
          }
          // 3. Light Damage or Recent Impact Smoke (< 35% health loss or active smokeTimer): White/light-gray radiator steam
          else {
            if (Math.random() < 0.45) {
              particlesRef.current.push({
                x: smokeOriginX + (Math.random() - 0.5) * 8,
                y: smokeOriginY + (Math.random() - 0.5) * 5,
                vx: (Math.random() - 0.5) * 25 - p.vx * 30,
                vy: 55 + (p.speed / 3.6) * 1.2 + Math.random() * 35,
                life: 0.45 + Math.random() * 0.3,
                maxLife: 0.75,
                color: 'rgba(148, 163, 184, 0.65)',
                size: 7 + Math.random() * 7,
                growth: 28 + Math.random() * 20,
                spin: (Math.random() - 0.5) * 2,
                angle: Math.random() * Math.PI * 2,
                shape: 'smoke',
              });
            }
          }
        }

        // =========================================================================
        // REALISTIC DUAL-EXHAUST SMOKE & NITRO PARTICLE SYSTEM (Canvas API)
        // =========================================================================
        const exhaustXOffsets = [-pW * 0.28, pW * 0.28]; // Exact alignment with rear twin exhaust pipes

        if (wantNitro) {
          // Intense micro-shake from rocket propulsion
          p.shake = Math.max(p.shake, 4.5);

          // 1. High-Density Nitrous Exhaust Smoke (Glowing cyan/blue/fiery turbulent vapor plumes)
          exhaustXOffsets.forEach((exX) => {
            // Nitro superheated vapor / glowing plume puff
            particlesRef.current.push({
              x: curPlayerX + exX + (Math.random() - 0.5) * 6,
              y: curPlayerY - 2,
              vx: (Math.random() - 0.5) * 60 - p.vx * 35,
              vy: 140 + Math.random() * 220,
              life: 0.38 + Math.random() * 0.18,
              maxLife: 0.55,
              color: Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(147, 197, 253, 0.65)',
              size: 5 + Math.random() * 6,
              growth: 32 + Math.random() * 24, // Expands rapidly backwards
              shape: 'smoke',
              spin: (Math.random() - 0.5) * 8,
              angle: Math.random() * Math.PI * 2,
              glow: true,
            });

            // Darker smoky condensation ring around nitro plume edge
            if (Math.random() < 0.6) {
              particlesRef.current.push({
                x: curPlayerX + exX + (Math.random() - 0.5) * 10,
                y: curPlayerY + 2,
                vx: (Math.random() - 0.5) * 75 - p.vx * 30,
                vy: 110 + Math.random() * 160,
                life: 0.4 + Math.random() * 0.2,
                maxLife: 0.6,
                color: 'rgba(75, 85, 99, 0.45)', // Grey outer smoke
                size: 6 + Math.random() * 5,
                growth: 28 + Math.random() * 20,
                shape: 'smoke',
                spin: (Math.random() - 0.5) * 6,
                angle: Math.random() * Math.PI * 2,
              });
            }

            // Core white-hot plasma fire jet
            particlesRef.current.push({
              x: curPlayerX + exX + (Math.random() - 0.5) * 4,
              y: curPlayerY - 2,
              vx: (Math.random() - 0.5) * 35 - p.vx * 40,
              vy: 200 + Math.random() * 280,
              life: 0.22,
              maxLife: 0.22,
              color: Math.random() > 0.25 ? '#ffffff' : '#38bdf8',
              size: 5 + Math.random() * 7,
              shape: 'circle',
            });

            // High-speed trailing plasma sparks
            particlesRef.current.push({
              x: curPlayerX + exX,
              y: curPlayerY - 2,
              vx: (Math.random() - 0.5) * 90 - p.vx * 60,
              vy: 280 + Math.random() * 340,
              life: 0.2,
              maxLife: 0.2,
              color: Math.random() > 0.5 ? '#06b6d4' : '#f97316',
              size: 2.5 + Math.random() * 3,
              shape: 'spark',
              length: 18 + Math.random() * 24,
            });

            // Shockwave rings
            if (Math.random() < 0.45) {
              particlesRef.current.push({
                x: curPlayerX + exX,
                y: curPlayerY + 8,
                vx: 0,
                vy: 90,
                life: 0.18,
                maxLife: 0.18,
                color: '#38bdf8',
                size: 9,
                shape: 'ring',
              });
            }
          });

          // Aerodynamic wingtip vortex streamers off rear spoiler corners
          const spoilerXOffsets = [-pW * 0.52, pW * 0.52];
          spoilerXOffsets.forEach((spX) => {
            particlesRef.current.push({
              x: curPlayerX + spX,
              y: curPlayerY - pH - 6,
              vx: (Math.random() - 0.5) * 20,
              vy: 200 + Math.random() * 120,
              life: 0.24,
              maxLife: 0.24,
              color: 'rgba(56, 189, 248, 0.85)',
              size: 2,
              shape: 'streak',
              length: 30 + Math.random() * 35,
            });
          });

          // Asphalt friction embers
          if (Math.random() < 0.65) {
            particlesRef.current.push({
              x: curPlayerX + (Math.random() - 0.5) * pW * 0.6,
              y: curPlayerY + 6,
              vx: (Math.random() - 0.5) * 120,
              vy: 60 + Math.random() * 80,
              life: 0.28,
              maxLife: 0.28,
              color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
              size: 2 + Math.random() * 3,
              shape: 'spark',
              length: 8 + Math.random() * 14,
            });
          }
        } else if (wantAccel) {
          // =========================================================================
          // ACCELERATION EXHAUST SMOKE (Volumetric grey/white smoke puffs from twin pipes)
          // Density & velocity scale with car speed and throttle engagement
          // =========================================================================
          const speedRatio = Math.min(1, Math.max(0.1, p.speed / effective.topSpeed));
          const spawnProb = isMobileDevice ? 0.75 : 0.92;

          if (Math.random() < spawnProb) {
            exhaustXOffsets.forEach((exX) => {
              // Primary billowy exhaust smoke puff
              const smokeColors = [
                'rgba(209, 213, 219, 0.48)', // light silver grey
                'rgba(156, 163, 175, 0.42)', // medium carbon grey
                'rgba(107, 114, 128, 0.38)', // dark exhaust residue
                'rgba(243, 244, 246, 0.55)', // warm white vapor
              ];
              const smokeColor = smokeColors[Math.floor(Math.random() * smokeColors.length)];

              // Spawn smoke puff from rear exhaust tip
              particlesRef.current.push({
                x: curPlayerX + exX + (Math.random() - 0.5) * 5,
                y: curPlayerY - 1 + Math.random() * 3,
                vx: (Math.random() - 0.5) * (25 + speedRatio * 30) - p.vx * 25,
                vy: (40 + speedRatio * 90) + Math.random() * 40, // drifts backwards relative to forward motion
                life: 0.35 + Math.random() * 0.25,
                maxLife: 0.6,
                color: smokeColor,
                size: 4 + Math.random() * 4,
                growth: 20 + speedRatio * 22, // Puffs expand naturally into road air
                shape: 'smoke',
                spin: (Math.random() - 0.5) * 5,
                angle: Math.random() * Math.PI * 2,
              });

              // Occasional micro-backfire flame ember on heavy acceleration
              if (speedRatio > 0.65 && Math.random() < 0.15) {
                particlesRef.current.push({
                  x: curPlayerX + exX + (Math.random() - 0.5) * 3,
                  y: curPlayerY,
                  vx: (Math.random() - 0.5) * 40,
                  vy: 120 + Math.random() * 100,
                  life: 0.14,
                  maxLife: 0.14,
                  color: Math.random() > 0.4 ? '#f97316' : '#eab308',
                  size: 2.5 + Math.random() * 2,
                  shape: 'spark',
                  length: 10 + Math.random() * 10,
                });
              }
            });
          }
        } else if (p.speed > 190) {
          // High-speed natural wind streamers
          if (Math.random() < 0.45) {
            particlesRef.current.push({
              x: curPlayerX + (Math.random() > 0.5 ? -pW * 0.52 : pW * 0.52),
              y: curPlayerY - pH - 4,
              vx: 0,
              vy: 150,
              life: 0.2,
              maxLife: 0.2,
              color: 'rgba(255, 255, 255, 0.45)',
              size: 1.5,
              shape: 'streak',
              length: 22,
            });
          }
        }

        // Mud & Dirt Flecks flying off tires at high speeds or off-road if car has accumulated dirt
        if (carDirtRef.current > 30 && (p.speed > 80 || Math.abs(p.x) > 0.85)) {
          const spawnMudProb = selectedTrack === 'rain' ? 0.35 : 0.18;
          if (Math.random() < spawnMudProb && particlesRef.current.length < 110) {
            const tireSide = Math.random() > 0.5 ? 1 : -1;
            particlesRef.current.push({
              x: curPlayerX + tireSide * (pW * 0.45) + (Math.random() - 0.5) * 8,
              y: curPlayerY - 4 + Math.random() * 4,
              vx: (Math.random() - 0.5) * 35 - p.vx * 15,
              vy: 70 + Math.random() * 90,
              life: 0.25 + Math.random() * 0.15,
              maxLife: 0.4,
              color: Math.random() > 0.5 ? 'rgba(92, 58, 33, 0.75)' : 'rgba(62, 38, 16, 0.8)',
              size: 2.5 + Math.random() * 3,
              growth: 4 + Math.random() * 6,
              shape: 'smoke',
              spin: (Math.random() - 0.5) * 4,
              angle: Math.random() * Math.PI * 2,
            });
          }
        }

        // Particle budget enforcement (smooth 60fps on mobile while rich on desktop)
        const maxActiveParticles = (isMobileDevice || performanceMode) ? 45 : 120;
        if (particlesRef.current.length > maxActiveParticles) {
          particlesRef.current.splice(0, particlesRef.current.length - maxActiveParticles);
        }

        // Record Motion Blur Afterimage Ghosts (capped for mobile)
        const maxGhostCount = (isMobileDevice || performanceMode) ? 2 : 5;
        if (wantNitro || p.speed > 210) {
          carGhostsRef.current.unshift({
            x: curPlayerX,
            y: curPlayerY,
            tilt: p.tilt,
            color: currentCar.color,
            accentColor: currentCar.accentColor,
            speed: p.speed,
          });
          if (carGhostsRef.current.length > maxGhostCount) {
            carGhostsRef.current.length = maxGhostCount;
          }
        } else if (carGhostsRef.current.length > 0) {
          carGhostsRef.current.pop();
        }

        // Record Ghost Telemetry (every ~0.085s)
        raceTimeRef.current += dt;
        if (raceTimeRef.current - lastRecordTimeRef.current >= 0.085) {
          lastRecordTimeRef.current = raceTimeRef.current;
          recordedFramesRef.current.push({
            t: Math.round(raceTimeRef.current * 100) / 100,
            d: Math.round(p.distance * 10) / 10,
            x: Math.round(p.x * 1000) / 1000,
            tilt: Math.round(p.tilt * 1000) / 1000,
            speed: Math.round(p.speed),
            nitro: isNitroActiveRef.current,
            drift: keysRef.current.space || keysRef.current.drift,
          });
        }

        const nowUi = performance.now();

        // Live Ghost Telemetry Delta Evaluation & Overtake Tracking
        if (ghostEnabled && activeGhostRef.current) {
          const ghostNow = interpolateGhost(activeGhostRef.current, raceTimeRef.current);
          if (ghostNow) {
            const isPlayerAhead = p.distance > ghostNow.d;

            // Trigger overtake sound & notification when overtaking previous best ghost
            if (ghostPrevAheadRef.current === false && isPlayerAhead && !hasOvertakenGhostRef.current && p.distance > 25) {
              hasOvertakenGhostRef.current = true;
              soundManager.playGhostOvertake();
              setGhostNotification('👻 Ghost Overtaken! Ahead of your personal best! 🔥');
              setTimeout(() => setGhostNotification(null), 3500);
            }
            ghostPrevAheadRef.current = isPlayerAhead;

            if (nowUi - lastUiSyncRef.current > (isMobileDevice ? 90 : 60)) {
              const delta = calculateGhostDelta(p.distance, ghostNow.d);
              setGhostDelta(delta);
            }
          }
        } else if (ghostDelta !== null) {
          setGhostDelta(null);
        }

        // Update state hooks (throttled to 30 FPS desktop / 20 FPS mobile for responsive real-time speedometer & minimap)
        if (nowUi - lastUiSyncRef.current > (isMobileDevice ? 50 : 33)) {
          lastUiSyncRef.current = nowUi;
          setCurrentSpeed(Math.round(p.speed));
          setNitroAmount(Math.round((p.nitro / effective.nitro) * 100));
          const currentFloorScore = Math.floor(p.score);
          setCurrentScore(currentFloorScore);
          setRunCoins(p.coinsCollected);
          setRunDistance(Math.floor(p.distance));

          // Circular Minimap live telemetry synchronization
          setMinimapPlayerX(p.x);
          setMinimapCurve(roadCurveRef.current.current);
          setMinimapTraffic(
            trafficRef.current.map((t) => ({
              id: t.id,
              x: t.x,
              z: t.z,
              type: t.type,
              color: t.color,
              damaged: t.damaged,
            }))
          );
          setMinimapCollectibles(
            collectiblesRef.current
              .filter((c) => !c.collected)
              .map((c) => ({ id: c.id, x: c.x, z: c.z, type: c.type }))
          );
          setMinimapObstacles(
            obstaclesRef.current
              .filter((o) => !o.hit)
              .map((o) => ({ id: o.id, x: o.x, z: o.z, type: o.type }))
          );

          if (ghostEnabled && activeGhostRef.current) {
            const gNow = interpolateGhost(activeGhostRef.current, raceTimeRef.current);
            if (gNow) {
              setMinimapGhostZ(gNow.d - p.distance);
              setMinimapGhostX(gNow.x);
            } else {
              setMinimapGhostZ(null);
              setMinimapGhostX(null);
            }
          } else {
            setMinimapGhostZ(null);
            setMinimapGhostX(null);
          }

          // Real-time Dynamic High Score Break Detection & Toast
          if (
            initialHighScoreRef.current > 300 &&
            currentFloorScore > initialHighScoreRef.current &&
            !highScoreBreakTriggeredRef.current
          ) {
            highScoreBreakTriggeredRef.current = true;
            setIsNewRecordBroken(true);
            p.coinsCollected += 100;
            setRunCoins(p.coinsCollected);

            dispatchGameToast({
              type: 'record',
              title: 'New High Score Smashed! 🏆',
              description: `You beat your previous best of (${initialHighScoreRef.current.toLocaleString()} pts)! Current score: ${currentFloorScore.toLocaleString()} pts!`,
              iconName: 'trophy',
              reward: 100,
              badgeText: 'New Record',
            });

            const currentStats = loadPlayerStats();
            currentStats.highScore = Math.max(currentStats.highScore, currentFloorScore);
            savePlayerStats(currentStats);
            checkAndUnlockAchievements(currentStats);
          } else if (
            initialHighScoreRef.current <= 300 &&
            currentFloorScore >= 1000 &&
            !highScoreBreakTriggeredRef.current
          ) {
            highScoreBreakTriggeredRef.current = true;
            setIsNewRecordBroken(true);
            p.coinsCollected += 100;
            setRunCoins(p.coinsCollected);

            dispatchGameToast({
              type: 'record',
              title: 'Epic 1,000+ Milestone! 🏆',
              description: `Legendary run! You crossed the 1,000 points barrier and scored ${currentFloorScore.toLocaleString()} pts!`,
              iconName: 'trophy',
              reward: 100,
              badgeText: 'Milestone',
            });

            const currentStats = loadPlayerStats();
            currentStats.highScore = Math.max(currentStats.highScore, currentFloorScore);
            savePlayerStats(currentStats);
            checkAndUnlockAchievements(currentStats);
          }
        }
      }

      // ==========================================
      // RENDER PIPELINE (60 FPS Pseudo-3D Canvas)
      // ==========================================
      const p = playerRef.current;
      const shakeX = (Math.random() - 0.5) * p.shake;
      const shakeY = (Math.random() - 0.5) * p.shake;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. SKY & HORIZON BACKGROUND
      const horizonY = height * 0.42;

      if (selectedTrack === 'day') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(0.7, '#bae6fd');
        skyGrad.addColorStop(1, '#f8fafc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Sun
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(width * 0.25, horizonY * 0.4, 28, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedTrack === 'sunset') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#4c1d95');
        skyGrad.addColorStop(0.4, '#c026d3');
        skyGrad.addColorStop(0.75, '#ea580c');
        skyGrad.addColorStop(1, '#fde047');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Sunset Sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(width * 0.5, horizonY * 0.75, 42, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedTrack === 'night') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Stars
        ctx.fillStyle = '#ffffff';
        for (let s = 0; s < 40; s++) {
          const sx = (s * 37) % width;
          const sy = (s * 19) % (horizonY * 0.8);
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        // Cyber Neon Moon
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(width * 0.8, horizonY * 0.35, 22, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rain Track
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.7, '#334155');
        skyGrad.addColorStop(1, '#475569');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);
      }

      // Parallax City Skyline
      const curveShift = roadCurveRef.current.current * 40;
      ctx.fillStyle = selectedTrack === 'night' ? '#090d16' : '#1e293b';
      const buildingStep = width / 18;
      for (let b = 0; b < 20; b++) {
        const bx = b * buildingStep + (curveShift * 0.3) % buildingStep - buildingStep;
        const bHeight = 40 + ((b * 47) % 85);
        ctx.fillRect(bx, horizonY - bHeight, buildingStep * 0.85, bHeight);

        // Lit windows
        if (selectedTrack === 'night' || selectedTrack === 'rain') {
          ctx.fillStyle = b % 2 === 0 ? '#06b6d4' : '#fbbf24';
          for (let w = 1; w < 4; w++) {
            ctx.fillRect(bx + 4, horizonY - bHeight + w * 18, 3, 4);
            ctx.fillRect(bx + 14, horizonY - bHeight + w * 18, 3, 4);
          }
          ctx.fillStyle = selectedTrack === 'night' ? '#090d16' : '#1e293b';
        }
      }

      // 2. ROADSIDE TERRAIN (Green grass / Cyber Grid / Desert)
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      if (selectedTrack === 'night') {
        groundGrad.addColorStop(0, '#090d16');
        groundGrad.addColorStop(1, '#020617');
      } else if (selectedTrack === 'sunset') {
        groundGrad.addColorStop(0, '#78350f');
        groundGrad.addColorStop(1, '#1c1917');
      } else {
        groundGrad.addColorStop(0, '#15803d');
        groundGrad.addColorStop(1, '#14532d');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 3. PERSPECTIVE ROAD SEGMENTS
      const roadBottomW = width * 0.85;
      const roadTopW = width * 0.12;
      const roadTopX = width / 2 + roadCurveRef.current.current * (width * 0.18);
      const roadBottomX = width / 2;

      // Draw asphalt trapezoid
      ctx.beginPath();
      ctx.moveTo(roadTopX - roadTopW / 2, horizonY);
      ctx.lineTo(roadTopX + roadTopW / 2, horizonY);
      ctx.lineTo(roadBottomX + roadBottomW / 2, height);
      ctx.lineTo(roadBottomX - roadBottomW / 2, height);
      ctx.closePath();

      const roadAsphalt = ctx.createLinearGradient(0, horizonY, 0, height);
      roadAsphalt.addColorStop(0, '#334155');
      roadAsphalt.addColorStop(1, '#0f172a');
      ctx.fillStyle = roadAsphalt;
      ctx.fill();

      // Road Curbs (Red and White alternating rumble strips)
      const curbSegments = 24;
      const roadOffsetZ = (p.distance * 1.5) % 40;

      for (let s = 0; s < curbSegments; s++) {
        const t1 = s / curbSegments;
        const t2 = (s + 1) / curbSegments;
        const y1 = horizonY + Math.pow(t1, 1.8) * (height - horizonY);
        const y2 = horizonY + Math.pow(t2, 1.8) * (height - horizonY);

        const w1 = roadTopW + (roadBottomW - roadTopW) * Math.pow(t1, 1.8);
        const w2 = roadTopW + (roadBottomW - roadTopW) * Math.pow(t2, 1.8);

        const xMid1 = roadTopX + (roadBottomX - roadTopX) * t1;
        const xMid2 = roadTopX + (roadBottomX - roadTopX) * t2;

        const isAlt = (Math.floor((s * 10 - roadOffsetZ) / 10) % 2 === 0);
        ctx.fillStyle = isAlt ? '#ef4444' : '#f8fafc';

        // Left curb
        ctx.beginPath();
        ctx.moveTo(xMid1 - w1 / 2 - 12 * t1, y1);
        ctx.lineTo(xMid1 - w1 / 2, y1);
        ctx.lineTo(xMid2 - w2 / 2, y2);
        ctx.lineTo(xMid2 - w2 / 2 - 12 * t2, y2);
        ctx.closePath();
        ctx.fill();

        // Right curb
        ctx.beginPath();
        ctx.moveTo(xMid1 + w1 / 2, y1);
        ctx.lineTo(xMid1 + w1 / 2 + 12 * t1, y1);
        ctx.lineTo(xMid2 + w2 / 2 + 12 * t2, y2);
        ctx.lineTo(xMid2 + w2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // Lane dividers (Dashed white/yellow stripes)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      for (let laneMultiplier of [-0.33, 0.33]) {
        for (let s = 0; s < curbSegments; s += 2) {
          const t1 = s / curbSegments;
          const t2 = (s + 1) / curbSegments;
          const y1 = horizonY + Math.pow(t1, 1.8) * (height - horizonY);
          const y2 = horizonY + Math.pow(t2, 1.8) * (height - horizonY);

          const w1 = roadTopW + (roadBottomW - roadTopW) * Math.pow(t1, 1.8);
          const w2 = roadTopW + (roadBottomW - roadTopW) * Math.pow(t2, 1.8);

          const xMid1 = roadTopX + (roadBottomX - roadTopX) * t1 + (w1 / 2) * laneMultiplier;
          const xMid2 = roadTopX + (roadBottomX - roadTopX) * t2 + (w2 / 2) * laneMultiplier;

          const isAlt = (Math.floor((s * 8 - roadOffsetZ) / 8) % 2 === 0);
          if (isAlt) {
            ctx.beginPath();
            ctx.moveTo(xMid1, y1);
            ctx.lineTo(xMid2, y2);
            ctx.stroke();
          }
        }
      }

      // Helper function to project 3D road world coordinates (x: -1 to 1, z: distance) to 2D screen
      const project = (rx: number, rz: number) => {
        const factor = Math.max(0.01, Math.min(1, 1 - rz / 900));
        const py = horizonY + Math.pow(factor, 2.2) * (height - horizonY);
        const roadWAtY = roadTopW + (roadBottomW - roadTopW) * Math.pow(factor, 2.2);
        const roadXAtY = roadTopX + (roadBottomX - roadTopX) * factor;
        const px = roadXAtY + (rx * roadWAtY * 0.42);
        const scale = Math.pow(factor, 1.6);
        return { px, py, scale, visible: rz > 0 && rz < 900 };
      };

      // 4. DRAW COLLECTIBLES
      collectiblesRef.current.forEach((item) => {
        const proj = project(item.x, item.z);
        if (!proj.visible) return;

        ctx.save();
        ctx.translate(proj.px, proj.py);
        ctx.scale(proj.scale, proj.scale);

        if (item.type === 'coin') {
          // 3D Spinning Gold Coin
          const spinWidth = Math.cos(item.rotation) * 22;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.max(2, Math.abs(spinWidth)), 22, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.max(1, Math.abs(spinWidth) * 0.7), 16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Star center
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else {
          // Blue Nitro Canister
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-10, -22, 20, 32);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-8, -20, 16, 28);
          // Valve
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-4, -28, 8, 7);
          // Flame badge
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(0, -6, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 5. DRAW ROAD OBSTACLES (Cones & Barriers)
      obstaclesRef.current.forEach((obs) => {
        const proj = project(obs.x, obs.z);
        if (!proj.visible) return;

        ctx.save();
        ctx.translate(proj.px, proj.py);
        ctx.scale(proj.scale, proj.scale);

        if (obs.type === 'cone') {
          // Traffic Cone
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(-16, 0);
          ctx.lineTo(16, 0);
          ctx.lineTo(4, -36);
          ctx.lineTo(-4, -36);
          ctx.closePath();
          ctx.fill();

          // White reflective strip
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(-9, -15);
          ctx.lineTo(9, -15);
          ctx.lineTo(6, -24);
          ctx.lineTo(-6, -24);
          ctx.closePath();
          ctx.fill();

          // Base
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-20, 0, 40, 6);
        } else {
          // Road Barrier
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-34, -28, 68, 28);
          // Chevron stripes
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(-30, -28);
          ctx.lineTo(-14, -28);
          ctx.lineTo(-24, 0);
          ctx.lineTo(-40, 0);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(6, -28);
          ctx.lineTo(22, -28);
          ctx.lineTo(12, 0);
          ctx.lineTo(-4, 0);
          ctx.fill();
        }

        ctx.restore();
      });

      // 6. DRAW TRAFFIC VEHICLES (Sorted from furthest to nearest)
      const sortedTraffic = [...trafficRef.current].sort((a, b) => b.z - a.z);
      sortedTraffic.forEach((v) => {
        const proj = project(v.x, v.z);
        if (!proj.visible) return;

        ctx.save();
        ctx.translate(proj.px, proj.py);
        ctx.scale(proj.scale, proj.scale);

        if (v.damaged && v.spinAngle) {
          ctx.rotate(v.spinAngle);
        }

        const carW = v.type === 'truck' ? 76 : 56;
        const carH = v.type === 'truck' ? 68 : 46;

        // Shadow under traffic car
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 4, carW * 0.6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.roundRect(-carW / 2, -carH, carW, carH, [8, 8, 4, 4]);
        ctx.fill();

        // Roof / Cabin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-carW * 0.4, -carH * 0.85, carW * 0.8, carH * 0.5, [6, 6, 2, 2]);
        ctx.fill();

        // Rear window (intact or cracked if damaged)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-carW * 0.32, -carH * 0.5, carW * 0.64, carH * 0.22);
        if (v.damaged) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-carW * 0.2, -carH * 0.48);
          ctx.lineTo(-carW * 0.05, -carH * 0.38);
          ctx.lineTo(carW * 0.15, -carH * 0.45);
          ctx.moveTo(-carW * 0.05, -carH * 0.38);
          ctx.lineTo(0, -carH * 0.30);
          ctx.stroke();
        }

        // Taillights (one light smashed/flickering if damaged)
        ctx.fillStyle = (v.damaged && v.damageSide === 'left') ? '#450a0a' : '#ef4444';
        ctx.fillRect(-carW * 0.44, -carH * 0.2, 12, 6);
        ctx.fillStyle = (v.damaged && v.damageSide === 'right') ? '#450a0a' : '#ef4444';
        ctx.fillRect(carW * 0.44 - 12, -carH * 0.2, 12, 6);

        // Tires
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW * 0.52, -14, 8, 14);
        ctx.fillRect(carW * 0.52 - 8, -14, 8, 14);

        // Visual Damage: Body Scratches, Scorch & Crumpled Bumper on Traffic
        if (v.damaged) {
          // Crumple impact dent
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.beginPath();
          const dentX = v.damageSide === 'left' ? -carW * 0.4 : carW * 0.4;
          ctx.ellipse(dentX, -carH * 0.3, 10, 7, v.damageSide === 'left' ? -0.4 : 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Render metallic scratch marks across traffic body
          if (v.scratches) {
            v.scratches.forEach((sc) => {
              const endX = sc.x + Math.cos(sc.angle) * sc.len;
              const endY = sc.y + Math.sin(sc.angle) * sc.len;
              // Dark outer scrape
              ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
              ctx.lineWidth = sc.width + 1.2;
              ctx.beginPath();
              ctx.moveTo(sc.x, sc.y);
              ctx.lineTo(endX, endY);
              ctx.stroke();

              // Silvery exposed bare metal line
              ctx.strokeStyle = 'rgba(241, 245, 249, 0.92)';
              ctx.lineWidth = sc.width;
              ctx.beginPath();
              ctx.moveTo(sc.x, sc.y);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            });
          }
        }

        // Police flashing siren
        if (v.type === 'police') {
          const isBlue = Math.floor(timestamp / 120) % 2 === 0;
          ctx.fillStyle = isBlue ? '#3b82f6' : '#ef4444';
          ctx.fillRect(-12, -carH - 6, 24, 7);
        }

        ctx.restore();
      });

      // 7. PARTICLES (Batch-drawn for mobile performance without ctx.save/restore)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        // Update position and growth
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.growth) {
          pt.size += pt.growth * dt;
        }
        if (pt.spin) {
          pt.angle = (pt.angle || 0) + pt.spin * dt;
        }

        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = pt.color;
        ctx.globalAlpha = alpha;

        if (pt.shape === 'smoke') {
          // Volumetric soft exhaust smoke puff using Canvas API arc and radial gradient
          const rad = Math.max(1, pt.size);
          const smokeGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rad);
          smokeGrad.addColorStop(0, pt.color);
          smokeGrad.addColorStop(0.65, pt.color);
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = smokeGrad;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.shape === 'spark') {
          const sparkLen = pt.length || 16;
          ctx.lineWidth = pt.size;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - pt.vx * 0.04, pt.y + sparkLen * alpha);
          ctx.stroke();
        } else if (pt.shape === 'streak') {
          const streakLen = pt.length || 28;
          ctx.lineWidth = pt.size;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - pt.vx * 0.02, pt.y + streakLen);
          ctx.stroke();
        } else if (pt.shape === 'ring') {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(2, pt.size * (1 + (1 - alpha) * 2.8)), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Standard glowing circular particle
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(1, pt.size * alpha), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Rain Weather Effect
      if (selectedTrack === 'rain') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 1.2;
        for (let r = 0; r < 35; r++) {
          const rx = ((r * 67 + timestamp * 0.5) % width);
          const ry = ((r * 43 + timestamp * 1.2) % height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 16);
          ctx.stroke();
        }
      }

      // 8. MOTION BLUR GHOST AFTERIMAGES (Trails behind car during Nitro or top speeds)
      const playerScreenX = roadBottomX + p.x * (roadBottomW * 0.42);
      const playerScreenY = height * 0.82;
      const pW = 82;
      const pH = 56;

      if ((isNitroActive || p.speed > 210) && carGhostsRef.current.length > 0) {
        carGhostsRef.current.forEach((ghost, idx) => {
          const ghostAlpha = (0.35 - idx * 0.06) * (isNitroActive ? 1.0 : 0.65);
          if (ghostAlpha <= 0) return;

          ctx.save();
          const dragY = (idx + 1) * (isNitroActive ? 7.5 : 4.0);
          ctx.translate(ghost.x, ghost.y + dragY);
          ctx.rotate(ghost.tilt);
          ctx.globalAlpha = ghostAlpha;

          // Glowing neon motion blur silhouette
          ctx.fillStyle = isNitroActive ? '#38bdf8' : ghost.accentColor;
          ctx.beginPath();
          ctx.roundRect(-pW / 2, -pH, pW, pH, [14, 14, 8, 8]);
          ctx.fill();

          // Spoiler ghost
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(-pW * 0.52, -pH - 6, pW * 1.04, 7);

          ctx.restore();
        });
      }

      // 8.5. RENDER HOLOGRAPHIC GHOST CAR (Personal Best Record Run)
      if (ghostEnabled && activeGhostRef.current) {
        const ghostNow = interpolateGhost(activeGhostRef.current, raceTimeRef.current);
        if (ghostNow) {
          const relMeters = ghostNow.d - p.distance;
          const rz = relMeters * 9;

          if (rz > 0 && rz < 880) {
            // Ghost car is on the road ahead of player
            const proj = project(ghostNow.x, rz);
            if (proj.visible) {
              renderGhostVehicle(ctx, proj.px, proj.py, proj.scale, ghostNow, timestamp);
            }
          } else if (rz <= 0 && rz >= -55) {
            // Ghost car is alongside or just passing the player
            const gx = roadBottomX + (ghostNow.x * roadBottomW * 0.42);
            const gy = playerScreenY - (rz * 1.8);
            const gScale = Math.max(0.85, 1.0 + (rz * 0.003));
            renderGhostVehicle(ctx, gx, gy, gScale, ghostNow, timestamp);
          }
        }
      }

      // 9. PLAYER SPORTS CAR (Anchored at bottom center with realistic steering tilt)
      ctx.save();
      ctx.translate(playerScreenX, playerScreenY);
      ctx.rotate(p.tilt);

      // Realistic Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 8, pW * 0.6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Underglow Neon
      ctx.fillStyle = currentCar.accentColor;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(0, 4, pW * 0.55, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Main Chassis / Aerodynamic Rear Bumper
      ctx.fillStyle = currentCar.color;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, -pH, pW, pH, [14, 14, 8, 8]);
      ctx.fill();

      // Rear Diffuser & Exhaust Vents
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-pW * 0.4, -10, pW * 0.8, 10);

      // Exhaust Pipes
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(-pW * 0.28, -2, 5, 0, Math.PI * 2);
      ctx.arc(pW * 0.28, -2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Carbon Fiber Rear Spoiler
      ctx.fillStyle = '#020617';
      ctx.fillRect(-pW * 0.52, -pH - 6, pW * 1.04, 7);
      // Spoiler Struts
      ctx.fillRect(-pW * 0.25, -pH, 5, 6);
      ctx.fillRect(pW * 0.25 - 5, -pH, 5, 6);

      // Cabin / Sloped Rear Glass
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(-pW * 0.35, -pH * 0.9, pW * 0.7, pH * 0.5, [10, 10, 4, 4]);
      ctx.fill();

      // Tinted Glass Reflection
      const glassGrad = ctx.createLinearGradient(0, -pH * 0.9, 0, -pH * 0.4);
      glassGrad.addColorStop(0, '#38bdf8');
      glassGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(-pW * 0.28, -pH * 0.78, pW * 0.56, pH * 0.32, [6, 6, 2, 2]);
      ctx.fill();

      // Active Taillights (Glow brighter when braking)
      const isBraking = keysRef.current.down;
      ctx.fillStyle = isBraking ? '#ff0000' : '#ef4444';
      if (!isMobileDevice && !performanceMode) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = isBraking ? 18 : 8;
      }
      ctx.fillRect(-pW * 0.45, -pH * 0.3, 16, 7);
      ctx.fillRect(pW * 0.45 - 16, -pH * 0.3, 16, 7);
      ctx.shadowBlur = 0;

      // License Plate
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-12, -14, 24, 8);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPEED', 0, -8);

      // Tires with Rims
      ctx.fillStyle = '#020617';
      ctx.fillRect(-pW * 0.55, -22, 10, 20);
      ctx.fillRect(pW * 0.55 - 10, -22, 10, 20);

      // Police Lights on roof if interceptor
      if (currentCar.id === 'police_interceptor') {
        const isBlinking = Math.floor(timestamp / 100) % 2 === 0;
        ctx.fillStyle = isBlinking ? '#3b82f6' : '#ef4444';
        ctx.fillRect(-16, -pH * 0.98, 32, 8);
      }

      // MUD & DIRT ACCUMULATION ON PLAYER CAR (Reacts to distance, rain, off-road, and drift)
      const currentDirt = carDirtRef.current;
      if (currentDirt > 0) {
        const dirtRatio = Math.min(1, currentDirt / 100);

        // 1. Mud gradient spray coating over rear bumper, wheel fenders and diffuser
        const mudGrad = ctx.createLinearGradient(0, -pH * 0.45, 0, 0);
        mudGrad.addColorStop(0, `rgba(120, 85, 45, ${0.1 * dirtRatio})`);
        mudGrad.addColorStop(0.45, `rgba(92, 58, 28, ${0.68 * dirtRatio})`);
        mudGrad.addColorStop(1, `rgba(55, 34, 15, ${0.92 * dirtRatio})`);

        ctx.fillStyle = mudGrad;
        ctx.beginPath();
        ctx.roundRect(-pW * 0.48, -pH * 0.45, pW * 0.96, pH * 0.45, [4, 4, 8, 8]);
        ctx.fill();

        // 2. Grimy dust film over rear window (dims glass reflection)
        ctx.fillStyle = `rgba(105, 75, 42, ${0.52 * dirtRatio})`;
        ctx.beginPath();
        ctx.roundRect(-pW * 0.28, -pH * 0.78, pW * 0.56, pH * 0.32, [6, 6, 2, 2]);
        ctx.fill();

        // 3. Mud Splatters and Spray Droplets on body & bumper
        ctx.fillStyle = `rgba(50, 30, 12, ${0.85 * dirtRatio})`;
        ctx.beginPath();
        // Left wheel splash dots
        ctx.arc(-pW * 0.38, -6, 4.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(-pW * 0.32, -12, 3.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(-pW * 0.42, -16, 2.5 * dirtRatio, 0, Math.PI * 2);
        // Right wheel splash dots
        ctx.arc(pW * 0.38, -6, 4.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(pW * 0.32, -12, 3.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(pW * 0.42, -16, 2.5 * dirtRatio, 0, Math.PI * 2);
        // Center bumper & diffuser splatters
        ctx.arc(-6, -7, 3 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(7, -5, 2.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(-16, -4, 3 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(15, -8, 3.5 * dirtRatio, 0, Math.PI * 2);
        ctx.arc(0, -11, 2 * dirtRatio, 0, Math.PI * 2);
        ctx.fill();

        // 4. Heavy Mud Caking if dirt > 55%
        if (currentDirt > 55) {
          ctx.fillStyle = `rgba(40, 22, 8, ${0.92 * dirtRatio})`;
          ctx.beginPath();
          ctx.arc(-pW * 0.22, -2, 4.2 * dirtRatio, 0, Math.PI * 2);
          ctx.arc(pW * 0.22, -2, 4.2 * dirtRatio, 0, Math.PI * 2);
          ctx.arc(0, -3, 3.8 * dirtRatio, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Pristine showroom shine gleam
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-pW * 0.32, -pH * 0.85);
        ctx.lineTo(-pW * 0.14, -pH * 0.85);
        ctx.stroke();
      }

      // =========================================================================
      // VISUAL CAR DAMAGE (Dents, Metallic Scratches, Window Cracks & Hit Flash)
      // =========================================================================
      const dmg = playerDamageRef.current;
      const damageRatio = Math.max(0, (100 - p.health) / 100);

      // 1. Panel Dents & Crumpling Shading on impacted bumper corners
      if (dmg.dentLeft > 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-pW * 0.45, -pH * 0.28, Math.min(16, dmg.dentLeft * 1.5), Math.min(12, dmg.dentLeft * 1.2), -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (dmg.dentRight > 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.ellipse(pW * 0.45, -pH * 0.28, Math.min(16, dmg.dentRight * 1.5), Math.min(12, dmg.dentRight * 1.2), 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (dmg.dentCenter > 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, -pH * 0.15, Math.min(18, dmg.dentCenter * 1.8), Math.min(8, dmg.dentCenter * 1.0), 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Realistic Multi-Layer Scratches (Dark gouge + exposed bare metal + highlight)
      if (dmg.scratches.length > 0) {
        dmg.scratches.forEach((sc) => {
          const endX = sc.x + Math.cos(sc.angle) * sc.len;
          const endY = sc.y + Math.sin(sc.angle) * sc.len;

          // Outer dark scorch/undercoat groove
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.lineWidth = sc.width + 1.6;
          ctx.beginPath();
          ctx.moveTo(sc.x, sc.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Inner bright exposed bare metal scratch
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
          ctx.lineWidth = sc.width;
          ctx.beginPath();
          ctx.moveTo(sc.x, sc.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Specular metallic glint
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = Math.max(0.6, sc.width * 0.4);
          ctx.beginPath();
          ctx.moveTo(sc.x + 0.4, sc.y + 0.4);
          ctx.lineTo(sc.x + Math.cos(sc.angle) * (sc.len * 0.75), sc.y + Math.sin(sc.angle) * (sc.len * 0.75));
          ctx.stroke();

          // Chipped paint specks near scratches
          ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
          ctx.fillRect(sc.x - 1, sc.y - 1, 2, 2);
          ctx.fillRect(endX - 1, endY - 1, 1.8, 1.8);
        });
      }

      // 3. Rear Glass Fracture Cracks (Appears when health drops < 65%)
      if (damageRatio > 0.35) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        // Spiderweb fracture lines across sloped rear glass
        ctx.moveTo(-pW * 0.18, -pH * 0.72);
        ctx.lineTo(-pW * 0.05, -pH * 0.60);
        ctx.lineTo(pW * 0.08, -pH * 0.65);
        ctx.lineTo(pW * 0.16, -pH * 0.52);

        ctx.moveTo(-pW * 0.05, -pH * 0.60);
        ctx.lineTo(-pW * 0.12, -pH * 0.48);

        ctx.moveTo(pW * 0.08, -pH * 0.65);
        ctx.lineTo(pW * 0.18, -pH * 0.75);

        if (damageRatio > 0.65) {
          // Severe spiderweb web cracking
          ctx.moveTo(-pW * 0.22, -pH * 0.58);
          ctx.lineTo(-pW * 0.08, -pH * 0.54);
          ctx.lineTo(0, -pH * 0.45);
          ctx.lineTo(pW * 0.12, -pH * 0.48);

          ctx.moveTo(0, -pH * 0.68);
          ctx.lineTo(0, -pH * 0.45);
        }
        ctx.stroke();
      }

      // 4. Kinetic Red/White Impact Flash
      if (dmg.hitFlash > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${dmg.hitFlash * 0.42})`;
        ctx.beginPath();
        ctx.roundRect(-pW / 2, -pH, pW, pH, [14, 14, 8, 8]);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${dmg.hitFlash * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // 10. 3D RADIAL WARP TUNNEL & OPTICAL SPEED MOTION BLUR STREAKS
      const isNitro = isNitroActiveRef.current;
      if (p.speed > 110 || isNitro) {
        const centerOrigX = roadTopX;
        const centerOrigY = horizonY;
        const speedRatio = p.speed / effective.topSpeed;
        const maxDist = Math.hypot(width, height) * 0.85;

        warpLinesRef.current.forEach((line) => {
          const speedMultiplier = isNitro ? 3.0 : 1.35;
          line.dist += line.speed * (p.speed / 100) * speedMultiplier * dt;

          if (line.dist > maxDist) {
            line.dist = 18 + Math.random() * 45;
            line.angle = Math.random() * Math.PI * 2;
          }

          if (line.dist < 35) return;

          const cos = Math.cos(line.angle);
          const sin = Math.sin(line.angle);

          const startX = centerOrigX + cos * line.dist;
          const startY = centerOrigY + sin * line.dist;
          const curLen = line.length * (isNitro ? 2.8 : 1.15) * speedRatio;
          const endX = centerOrigX + cos * (line.dist + curLen);
          const endY = centerOrigY + sin * (line.dist + curLen);

          const distRatio = Math.min(1, line.dist / (maxDist * 0.55));
          const lineAlpha = (isNitro ? 0.95 : 0.4) * distRatio;

          // Motion blur streak with optical gradient fade
          const strokeGrad = ctx.createLinearGradient(startX, startY, endX, endY);
          if (isNitro) {
            strokeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
            strokeGrad.addColorStop(0.65, '#38bdf8');
            strokeGrad.addColorStop(1, '#ffffff');
          } else {
            strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.65)');
          }

          ctx.strokeStyle = strokeGrad;
          ctx.lineWidth = isNitro ? line.width * 2.2 : line.width;
          ctx.globalAlpha = lineAlpha;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });
        ctx.globalAlpha = 1.0;
      }

      // 11. NITRO BLUE SCREEN BLOOM & PERIPHERAL MOTION BLUR
      if (isNitro) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Radiant blue screen bloom expanding from vanishing point
        const bloomGrad = ctx.createRadialGradient(
          roadTopX,
          horizonY,
          10,
          roadTopX,
          horizonY,
          Math.hypot(width, height) * 0.75
        );
        bloomGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');  // Electric cyan core
        bloomGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.28)'); // Luminous azure
        bloomGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.20)');  // Deep sapphire
        bloomGrad.addColorStop(1, 'rgba(3, 105, 161, 0.45)');   // Outer blue vignette
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);

        // Anamorphic horizontal lens flare beam
        const flareGrad = ctx.createLinearGradient(0, horizonY, width, horizonY);
        flareGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        flareGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.35)');
        flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        flareGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.35)');
        flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, horizonY - 2.5, width, 5);

        // Electric neon perimeter frame pulse
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, width - 4, height - 4);

        ctx.restore();
      }

      // 12. CRASH / COLLISION SCREEN FLASH & IMPACT BLOOM (Visual Excitement Feedback)
      if (crashFlashRef.current > 0.01) {
        const flashAlpha = Math.min(1.0, crashFlashRef.current);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Radiant explosion blast wave centered on car collision point
        const crashGrad = ctx.createRadialGradient(
          width / 2 + p.x * (width * 0.3),
          height * 0.82,
          8,
          width / 2,
          height * 0.72,
          Math.hypot(width, height) * 0.8
        );
        crashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.92 * flashAlpha})`);
        crashGrad.addColorStop(0.18, `rgba(254, 240, 138, ${0.8 * flashAlpha})`);
        crashGrad.addColorStop(0.42, `rgba(249, 115, 22, ${0.62 * flashAlpha})`);
        crashGrad.addColorStop(0.72, `rgba(239, 68, 68, ${0.45 * flashAlpha})`);
        crashGrad.addColorStop(1, `rgba(185, 28, 28, ${0.12 * flashAlpha})`);
        ctx.fillStyle = crashGrad;
        ctx.fillRect(0, 0, width, height);

        // High-tension danger warning border pulse
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.92 * flashAlpha})`;
        ctx.lineWidth = 8 * flashAlpha;
        ctx.strokeRect(0, 0, width, height);

        // Inner glowing danger border
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.75 * flashAlpha})`;
        ctx.lineWidth = 3 * flashAlpha;
        ctx.strokeRect(5, 5, width - 10, height - 10);

        ctx.restore();
      }

      ctx.restore(); // Undo translate shake
      ctx.restore(); // Undo DPR scale

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, selectedTrack, gameOver, onCoinsChange, performanceMode]);

  const isPaused = gameState === 'PAUSED' && !isUnpausing;

  return (
    <div
      ref={containerRef}
      id="racing-game-container"
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border select-none transition-all duration-300 ease-out ${
        isPaused
          ? 'border-amber-500/50 pause-glow-pulse ring-1 ring-amber-500/30'
          : 'border-slate-800 shadow-2xl ring-0'
      }`}
    >
      {/* Dynamic In-Game Achievement & Milestone Toasts */}
      <AchievementToast />

      {/* TOP IN-GAME HUD BAR (Always accessible) */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-xs">
        {/* Left: Score & Distance */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold font-game">
            <Coins className="w-4 h-4" />
            <span className="tabular-nums text-sm sm:text-base">
              {gameState === 'PLAYING' ? runCoins : coins}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <span className="text-slate-400">Score:</span>
            <span className="font-bold tabular-nums font-game text-white text-base">
              {currentScore.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400">Distance:</span>
            <span className="font-bold tabular-nums font-game text-emerald-400">
              {(runDistance / 1000).toFixed(2)} km
            </span>
          </div>

          {/* Live Cars Overtaken Badge */}
          {gameState === 'PLAYING' && (
            <div className="flex items-center gap-1 text-cyan-300 font-bold font-game bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-sans text-xs hidden xs:inline">Passed:</span>
              <span className="tabular-nums text-xs sm:text-sm text-cyan-300">
                {raceOvertakes}
              </span>
            </div>
          )}
        </div>

        {/* Center: Combo Pill (When active) */}
        {comboMultiplier > 1 && (
          <div className="animate-bounce flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-amber-300 text-xs font-bold font-game">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{comboMessage || `Multiplier x${comboMultiplier}`}</span>
          </div>
        )}

        {/* Right: Sound, Music, Fullscreen, Pause / Garage */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile High-Performance Turbo Toggle */}
          <button
            type="button"
            onClick={togglePerformanceMode}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
              performanceMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
            }`}
            title={performanceMode ? 'Turbo 60 FPS Mode Active' : 'Enable 60 FPS Mobile Turbo'}
            aria-label="Toggle High Performance Mode"
          >
            <Zap className={`w-3.5 h-3.5 ${performanceMode ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold font-game">
              {performanceMode ? `${fps} FPS ⚡` : 'TURBO'}
            </span>
          </button>

          {/* Audio Volume & Interactive Music Control Button */}
          <button
            type="button"
            onClick={toggleAudioModal}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              showAudioModal
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-800'
            }`}
            title="Audio & Interactive Music Controls"
            aria-label="Audio and Interactive Music Controls"
          >
            <Sliders className={`w-4 h-4 ${showAudioModal ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline text-[11px] font-bold">
              Audio
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              showAudioModal ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-amber-300'
            }`}>
              {musicEnabled ? `${Math.round(musicVolume * 100)}%` : 'Mute'}
            </span>
          </button>

          {/* Background Music Toggle Button */}
          <button
            type="button"
            onClick={toggleMusic}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              musicEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
            }`}
            title={musicEnabled ? 'Stop Race Music' : 'Play Race Music'}
            aria-label="Toggle Race Music"
          >
            {musicEnabled ? (
              <Music className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Music2 className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden md:inline text-[11px] font-bold">
              {musicEnabled ? 'Race Music' : 'Music: Off'}
            </span>
            {musicEnabled && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* Sound FX Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            aria-label="Sound Toggle"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <button
              onClick={gameState === 'PAUSED' ? resumeGame : pauseGame}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                gameState === 'PAUSED'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
              title={gameState === 'PAUSED' ? 'Resume Race (P or Esc)' : 'Pause Race (P or Esc)'}
              aria-label={gameState === 'PAUSED' ? 'Resume Race' : 'Pause Game'}
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => {
              const s = loadPlayerStats();
              if (!s.carDirt) s.carDirt = {};
              s.carDirt[s.selectedCarId] = Math.min(100, Math.round(carDirtRef.current));
              savePlayerStats(s);
              onOpenGarage();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-medium transition-colors relative"
            title="Garage & Car Wash"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Garage</span>
            {carDirtRef.current > 20 && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono" title="Car is dirty, wash in Garage">
                🧽
              </span>
            )}
          </button>

          {/* Daily Challenges Button */}
          <button
            type="button"
            onClick={() => setShowDailyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors relative cursor-pointer ${
              dailySummary.unclaimedCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20 animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
            }`}
            title="Daily Quests & Rewards"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-bold">Daily Quests</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              dailySummary.unclaimedCount > 0
                ? 'bg-amber-400 text-slate-950 animate-bounce'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {dailySummary.unclaimedCount > 0 ? `🎁 ${dailySummary.unclaimedCount}` : `${dailySummary.completed}/${dailySummary.total}`}
            </span>
          </button>

          {/* Ghost Car Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = !ghostEnabled;
              setGhostEnabled(next);
              setGhostCarEnabled(next);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              ghostEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-700/60'
            }`}
            title={ghostEnabled ? 'Hide Ghost Car' : 'Enable Ghost Car'}
            aria-label="Toggle Ghost Car"
          >
            <Ghost className={`w-3.5 h-3.5 ${ghostEnabled ? 'text-cyan-300 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline font-bold">
              {ghostEnabled ? 'Ghost' : 'Ghost (Off)'}
            </span>
            {activeGhostRef.current && ghostEnabled && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 font-mono hidden md:inline">
                {activeGhostRef.current.totalDistance}m
              </span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors hidden sm:block"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CANVAS ELEMENT FOR 60FPS RACING */}
      <div id="canvas-placeholder" className="relative w-full min-h-[460px] sm:min-h-[520px] max-h-[640px] aspect-16/9 sm:aspect-21/10 overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className={`w-full h-full block cursor-crosshair touch-none transition-all duration-300 origin-[50%_42%] ${
            isNitroActive ? 'scale-[1.025] filter contrast-110 saturate-125' : 'scale-100'
          } ${
            isPaused
              ? 'brightness-[0.72] saturate-[0.75] blur-[1.2px] scale-[0.996]'
              : 'brightness-100 saturate-100 blur-none scale-100'
          }`}
        />

        {/* FULL-SCREEN NITRO BLUE BLOOM & MOTION BLUR OVERLAY */}
        {isNitroActive && gameState === 'PLAYING' && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden animate-nitro-bloom">
            {/* 1. Peripheral Motion Blur (Masked backdrop blur: clear center for steering, motion blurred periphery) */}
            <div
              className="absolute inset-0 backdrop-blur-[2.5px] backdrop-brightness-110"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 42%, transparent 35%, black 85%)',
                maskImage: 'radial-gradient(ellipse 65% 55% at 50% 42%, transparent 35%, black 85%)',
              }}
            />

            {/* 2. Full-Screen Radiant Electric Blue Screen Bloom */}
            <div
              className="absolute inset-0 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.30) 45%, rgba(2, 132, 199, 0.45) 80%, rgba(3, 105, 161, 0.65) 100%)',
              }}
            />

            {/* 3. Anamorphic Horizontal Blue Lens Flare Beam */}
            <div className="absolute w-full h-1 top-[42%] -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-85 shadow-[0_0_25px_#38bdf8]" />

            {/* 4. Peripheral Motion Blur Speed Streaks */}
            <svg
              className="absolute inset-0 w-full h-full opacity-65 mix-blend-screen"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="nitro-speed-grad" cx="50%" cy="42%" r="50%">
                  <stop offset="30%" stopColor="#38bdf8" stopOpacity="0" />
                  <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                </radialGradient>
              </defs>
              <line x1="8%" y1="12%" x2="0%" y2="0%" stroke="url(#nitro-speed-grad)" strokeWidth="3.5" />
              <line x1="92%" y1="12%" x2="100%" y2="0%" stroke="url(#nitro-speed-grad)" strokeWidth="3.5" />
              <line x1="5%" y1="45%" x2="0%" y2="48%" stroke="url(#nitro-speed-grad)" strokeWidth="4" />
              <line x1="95%" y1="45%" x2="100%" y2="48%" stroke="url(#nitro-speed-grad)" strokeWidth="4" />
              <line x1="12%" y1="85%" x2="0%" y2="100%" stroke="url(#nitro-speed-grad)" strokeWidth="4.5" />
              <line x1="88%" y1="85%" x2="100%" y2="100%" stroke="url(#nitro-speed-grad)" strokeWidth="4.5" />
              <line x1="28%" y1="92%" x2="18%" y2="100%" stroke="url(#nitro-speed-grad)" strokeWidth="3" />
              <line x1="72%" y1="92%" x2="82%" y2="100%" stroke="url(#nitro-speed-grad)" strokeWidth="3" />
            </svg>

            {/* 5. Deep Neon Cyan/Blue Screen Border Bloom */}
            <div className="absolute inset-0 border-2 sm:border-4 border-cyan-400/60 shadow-[inset_0_0_50px_rgba(56,189,248,0.7),inset_0_0_100px_rgba(14,165,233,0.5)]" />

            {/* 6. Nitro Warp Acceleration Badge */}
            <div className="absolute top-14 right-3 sm:top-14 sm:right-5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-400/80 backdrop-blur-md text-cyan-200 text-xs font-black uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.8)]">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
              <span>NITRO HYPER-DRIVE ⚡</span>
            </div>
          </div>
        )}

        {/* GHOST CAR TELEMETRY HUD PILL */}
        {gameState === 'PLAYING' && ghostEnabled && activeGhostRef.current && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 sm:top-14 z-20 pointer-events-none flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 shadow-lg shadow-cyan-500/10 text-xs font-bold font-mono">
            <div className="flex items-center gap-1 text-cyan-300">
              <Ghost className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold text-white hidden xs:inline">Ghost:</span>
            </div>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] sm:text-[11px] font-bold ${
                ghostDelta?.status === 'ahead'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : ghostDelta?.status === 'behind'
                  ? 'bg-red-500/25 text-red-300 border border-red-500/40'
                  : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
              }`}
            >
              {ghostDelta?.text || 'Track Matched'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-sans hidden sm:inline">
              (Best: {activeGhostRef.current.totalDistance}m)
            </span>
          </div>
        )}

        {/* GHOST NOTIFICATION TOAST */}
        {ghostNotification && (
          <div className="absolute top-22 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce max-w-[90vw]">
            <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-950/90 border border-cyan-400/80 text-cyan-100 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 backdrop-blur-md text-center">
              <Ghost className="w-4 h-4 text-cyan-300 animate-spin shrink-0" />
              <span>{ghostNotification}</span>
            </div>
          </div>
        )}

        {/* CIRCULAR RACETRACK MINIMAP & RADAR HUD */}
        {gameState === 'PLAYING' && (
          <div
            className={`absolute z-20 pointer-events-auto select-none transition-all duration-300 ${
              minimapCorner === 'top-left'
                ? 'top-14 left-3 sm:top-4 sm:left-4'
                : 'top-3 right-3 sm:top-4 sm:right-4'
            }`}
          >
            <Minimap
              playerX={minimapPlayerX}
              playerSpeed={currentSpeed}
              distance={runDistance}
              roadCurve={minimapCurve}
              carColor={
                activeCarStatsRef.current?.currentCar.color ||
                CARS_DATA.find((c) => c.id === selectedCarId)?.color ||
                '#ef4444'
              }
              accentColor={
                activeCarStatsRef.current?.currentCar.accentColor ||
                CARS_DATA.find((c) => c.id === selectedCarId)?.accentColor ||
                '#38bdf8'
              }
              trackEnvironment={selectedTrack}
              traffic={minimapTraffic}
              collectibles={minimapCollectibles}
              obstacles={minimapObstacles}
              ghostZ={minimapGhostZ}
              ghostX={minimapGhostX}
              isNitroActive={isNitroActive}
              corner={minimapCorner}
              onToggleCorner={() => {
                const next = minimapCorner === 'top-right' ? 'top-left' : 'top-right';
                setMinimapCorner(next);
                try {
                  localStorage.setItem('fast_racing_minimap_corner', next);
                } catch {}
              }}
            />
          </div>
        )}

        {/* PERSISTENT CONTROLS OVERLAY DIRECTLY ON THE GAME SCREEN */}
        {gameState === 'PLAYING' && (
          <div
            className={`absolute z-20 pointer-events-auto select-none transition-all duration-200 ${
              minimapCorner === 'top-left'
                ? 'top-3 right-3 sm:top-4 sm:right-4'
                : showControlsOverlay
                ? 'top-36 right-3 sm:top-40 sm:right-4'
                : 'top-3 right-28 sm:top-4 sm:right-34'
            }`}
            aria-label="Current Key Bindings Controls Reference"
          >
            {showControlsOverlay ? (
              <div className="bg-slate-950/85 hover:bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl p-2 sm:p-2.5 transition-all text-left max-w-[210px] sm:max-w-[230px]">
                {/* Header with Title & Collapse Button */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/70 gap-2">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] sm:text-xs font-bold font-game tracking-wide text-white">
                      Controls
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showControlsOverlay;
                      setShowControlsOverlay(next);
                      try {
                        localStorage.setItem('metro_racers_controls_overlay', String(next));
                      } catch {}
                    }}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Minimize Controls Overlay"
                    aria-label="Minimize Controls"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Key Bindings List with Active Key Lighting */}
                <div className="space-y-1 text-[10px] sm:text-[11px]">
                  {/* Steer */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium">Steer:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          activePressedKeys.left
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-105'
                            : 'bg-slate-900 text-slate-300 border-slate-700/80'
                        }`}
                      >
                        ◄ A
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          activePressedKeys.right
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-105'
                            : 'bg-slate-900 text-slate-300 border-slate-700/80'
                        }`}
                      >
                        ► D
                      </span>
                    </div>
                  </div>

                  {/* Accelerate */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium">Drive:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          activePressedKeys.up
                            ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-105'
                            : 'bg-slate-900 text-slate-300 border-slate-700/80'
                        }`}
                      >
                        ▲ W
                      </span>
                    </div>
                  </div>

                  {/* Brake */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium">Brake:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          activePressedKeys.down
                            ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)] scale-105'
                            : 'bg-slate-900 text-slate-300 border-slate-700/80'
                        }`}
                      >
                        ▼ S
                      </span>
                    </div>
                  </div>

                  {/* Nitro */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <span>Nitro:</span>
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                    <div className="flex items-center gap-1 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-all ${
                          activePressedKeys.space || activePressedKeys.nitro || isNitroActive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.7)] scale-105'
                            : 'bg-slate-900 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        Space / Shift
                      </span>
                    </div>
                  </div>

                  {/* Pause */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-800/50">
                    <span className="text-slate-500 font-medium text-[9px] sm:text-[10px]">Pause:</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-[9px]">
                      P / Esc
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Minimized Floating Pill */
              <button
                type="button"
                onClick={() => {
                  setShowControlsOverlay(true);
                  try {
                    localStorage.setItem('metro_racers_controls_overlay', 'true');
                  } catch {}
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 text-slate-300 hover:text-white backdrop-blur-md shadow-lg transition-all text-[11px] font-medium cursor-pointer"
                title="Expand Controls Overlay"
                aria-label="Expand Controls Overlay"
              >
                <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-game font-bold text-xs text-white">Controls</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* DYNAMIC CSS-BASED SPEEDOMETER & INSTRUMENT CLUSTER */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-14 left-3 sm:top-auto sm:bottom-5 sm:left-5 z-20 pointer-events-none">
            <Speedometer
              speed={currentSpeed}
              topSpeed={activeCarStatsRef.current?.effective.topSpeed || 240}
              nitroAmount={nitroAmount}
              isNitroActive={isNitroActive}
              carHealth={carHealth}
            />
          </div>
        )}

        {/* TOUCH CONTROLS OVERLAY: Left Thumb for Steering, Right Thumb for Nitro & Brake */}
        {gameState === 'PLAYING' && (
          <>
            {/* Steering Controls (Bottom Left for Left Thumb) */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/90 shadow-xl touch-none select-none">
              <button
                type="button"
                onPointerDown={(e) => {
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                  keysRef.current.left = true;
                }}
                onPointerUp={(e) => {
                  try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
                  keysRef.current.left = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.left = false;
                }}
                className="w-13 h-13 sm:w-12 sm:h-12 rounded-xl bg-slate-900/95 active:bg-sky-600 text-white flex items-center justify-center font-bold text-lg border border-slate-700/60 shadow-md touch-none select-none cursor-pointer"
                aria-label="Steer Left"
              >
                <ChevronRight className="w-7 h-7 rotate-180" />
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                  keysRef.current.right = true;
                }}
                onPointerUp={(e) => {
                  try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
                  keysRef.current.right = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.right = false;
                }}
                className="w-13 h-13 sm:w-12 sm:h-12 rounded-xl bg-slate-900/95 active:bg-sky-600 text-white flex items-center justify-center font-bold text-lg border border-slate-700/60 shadow-md touch-none select-none cursor-pointer"
                aria-label="Steer Right"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* Action Controls (Bottom Right for Right Thumb) */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/90 shadow-xl touch-none select-none">
              <button
                type="button"
                onPointerDown={(e) => {
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                  keysRef.current.nitro = true;
                  keysRef.current.space = true;
                  keysRef.current.drift = true;
                  hapticNitroBoost();
                }}
                onPointerUp={(e) => {
                  try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
                  keysRef.current.nitro = false;
                  keysRef.current.space = false;
                  keysRef.current.drift = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.nitro = false;
                  keysRef.current.space = false;
                  keysRef.current.drift = false;
                }}
                className="w-13 h-13 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 active:scale-95 text-white flex items-center justify-center font-bold text-xs border border-amber-400/50 shadow-md touch-none select-none cursor-pointer"
                aria-label="Nitro Boost"
              >
                <Flame className="w-6 h-6 fill-white" />
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                  keysRef.current.down = true;
                  hapticTap();
                }}
                onPointerUp={(e) => {
                  try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
                  keysRef.current.down = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.down = false;
                }}
                className="w-13 h-13 sm:w-12 sm:h-12 rounded-xl bg-slate-800 active:bg-red-700 text-white flex items-center justify-center font-bold text-xs border border-slate-600 shadow-md touch-none select-none cursor-pointer uppercase tracking-wider"
                aria-label="Brake"
              >
                BRAKE
              </button>
            </div>
          </>
        )}

        {/* TITLE MENU OVERLAY */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className="max-w-md w-full text-center space-y-4 sm:space-y-5 my-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <span>Formerly known as City Speed Heroes</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black font-game text-[#ffcc00] tracking-wider leading-tight">
                METRO RACERS
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Accelerate through bustling city streets at maximum velocity, dodge dense traffic, collect gold coins, and ignite nitro boosts to smash high scores!
              </p>

              {/* Track environment selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Select Track & Weather:</span>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTrackChange('day')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTrack === 'day'
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Sunny Day
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTrackChange('sunset')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTrack === 'sunset'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sunset className="w-3.5 h-3.5" />
                    Sunset Horizon
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTrackChange('night')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTrack === 'night'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Neon Night
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTrackChange('rain')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTrack === 'rain'
                        ? 'bg-slate-600 text-white border-slate-400 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    Rainstorm
                  </button>
                </div>
              </div>

              {/* High Score Banner */}
              {highScore > 0 && (
                <div className="text-xs text-slate-400">
                  Personal Best Record:{' '}
                  <span className="font-bold text-amber-400 font-game">{highScore.toLocaleString()} pts</span>
                </div>
              )}

              {/* Ghost Car Record Banner */}
              {ghostRunInfo ? (
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
                  <Ghost className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />
                  <span>Ghost PB Recorded:</span>
                  <span className="font-bold font-mono text-cyan-300">{ghostRunInfo.totalDistance.toLocaleString()} m</span>
                  <span className="text-[11px] text-slate-400">({ghostRunInfo.carName})</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-cyan-300/80">
                  <Ghost className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ghost Car is primed to record your first epic lap! 👻</span>
                </div>
              )}

              {/* Quick Toggles: Music, Ghost Car & High-Performance Mobile Mode */}
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    musicEnabled
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {musicEnabled ? (
                    <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  ) : (
                    <Music2 className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Music: {musicEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !ghostEnabled;
                    setGhostEnabled(next);
                    setGhostCarEnabled(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    ghostEnabled
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Ghost className={`w-3.5 h-3.5 ${ghostEnabled ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>Ghost Car: {ghostEnabled ? 'ON 👻' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={togglePerformanceMode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    performanceMode
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${performanceMode ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
                  <span>Turbo 60 FPS: {performanceMode ? 'ON ⚡' : 'OFF'}</span>
                </button>
              </div>

              {/* Action Buttons: Play Now / Garage */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="btn-play w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-slate-950 font-black text-base sm:text-lg rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Race Now - Start Game</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGarage();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Garage & Upgrades</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-amber-400 font-bold text-sm rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="View Top 5 Leaderboard"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Leaderboard 🏆</span>
                </button>
              </div>

              {/* Quick Controls Guide */}
              <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-3 flex-wrap">
                <span>Steer: Arrows / WASD</span>
                <span>•</span>
                <span>Nitro: Spacebar / Shift</span>
                <span>•</span>
                <span>Brake: Down / S</span>
              </div>
            </div>
          </div>
        )}

        {/* PAUSE OVERLAY WITH SMOOTH FADE-IN & FADE-OUT CSS ANIMATION */}
        {(gameState === 'PAUSED' || isUnpausing) && (
          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 transition-all duration-200 ease-out ${
              isUnpausing
                ? 'opacity-0 backdrop-blur-none pointer-events-none'
                : 'opacity-100 bg-slate-950/80 backdrop-blur-md animate-pause-fade-in'
            }`}
          >
            <div
              className={`max-w-xs w-full text-center space-y-4 transition-all duration-200 ease-out transform ${
                isUnpausing
                  ? 'scale-95 opacity-0 -translate-y-2'
                  : 'scale-100 opacity-100 translate-y-0 animate-pause-modal-in'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <h3 className="text-2xl font-bold font-game text-white tracking-wide">
                  Race Paused
                </h3>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              </div>

              <p className="text-xs text-slate-400 leading-tight">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">P</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">Esc</kbd> to resume driving
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={resumeGame}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Resume Driving
                </button>

                {/* Ghost Car Toggle in Pause Menu */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !ghostEnabled;
                    setGhostEnabled(next);
                    setGhostCarEnabled(next);
                  }}
                  className={`w-full py-2 px-4 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    ghostEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Ghost className="w-4 h-4 text-cyan-400" />
                  <span>Ghost Car: {ghostEnabled ? 'ON 👻' : 'OFF'}</span>
                </button>

                {/* Audio & Music Control Button in Pause Menu */}
                <button
                  type="button"
                  onClick={toggleAudioModal}
                  className="w-full py-2 px-4 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Audio & Music Controls 🎚️ ({Math.round(musicVolume * 100)}%)</span>
                </button>

                {/* Music toggle during pause */}
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`w-full py-2 px-4 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    musicEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {musicEnabled ? <Music className="w-4 h-4 text-amber-400" /> : <Music2 className="w-4 h-4 text-slate-400" />}
                  <span>Race Music: {musicEnabled ? 'Playing' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={startGame}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Restart Race
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUnpausing(false);
                    isUnpausingRef.current = false;
                    setGameState('MENU');
                    soundManager.stopEngine();
                    soundManager.stopMusic();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-xs cursor-pointer"
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="max-w-sm w-full text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Race Finished - Crash Impact!</span>
              </div>

              <h3 className="text-3xl font-black font-game text-white">Race Results</h3>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-start text-xs">
                <div>
                  <div className="text-slate-400">Total Score:</div>
                  <div className="text-lg font-bold font-game text-white">
                    {currentScore.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Distance Traveled:</div>
                  <div className="text-lg font-bold font-game text-emerald-400">
                    {(runDistance / 1000).toFixed(2)} km
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Coins Collected:</div>
                  <div className="text-base font-bold font-game text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    +{runCoins}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Personal Best:</div>
                  <div className="text-base font-bold font-game text-sky-400">
                    {highScore.toLocaleString()}
                  </div>
                </div>

                {/* Cars Overtaken in this run */}
                <div className="col-span-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cars Overtaken in Run:</span>
                  </span>
                  <span className="font-bold text-cyan-300 font-game text-sm tabular-nums">
                    {raceOvertakes} cars
                  </span>
                </div>

                {/* Car Dirt & Cleanliness Summary */}
                <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>Car Body Condition:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {runDirt <= 15 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Clean & Shiny ({runDirt}%)</span>
                      </span>
                    ) : runDirt <= 50 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>💨 Road Dust ({runDirt}%)</span>
                      </span>
                    ) : (
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <span>🍂 Muddy Road Dirt ({runDirt}%)</span>
                      </span>
                    )}
                    {runDirt > 25 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Wash in Garage 🧽
                      </span>
                    )}
                  </div>
                </div>

                {/* Ghost Car Performance Comparison */}
                <div
                  className={`col-span-2 p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isNewRecordBroken
                      ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isNewRecordBroken ? 'bg-cyan-500/25 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Ghost className={`w-4 h-4 ${isNewRecordBroken ? 'animate-bounce text-cyan-300' : 'text-cyan-400'}`} />
                    </div>
                    <div className="text-start">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Ghost Car</span>
                        {isNewRecordBroken && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/25 text-cyan-200 font-bold border border-cyan-400/40 animate-pulse">
                            New Record Smashed! 🏆
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] opacity-80">
                        {isNewRecordBroken
                          ? `Smashed Ghost PB! New record saved: ${runDistance.toLocaleString()} m`
                          : ghostRunInfo
                          ? `Best track record: ${ghostRunInfo.totalDistance.toLocaleString()} m by (${ghostRunInfo.carName})`
                          : 'Your first run was saved as the Ghost Car to race against!'}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-end shrink-0">
                    {isNewRecordBroken ? (
                      <span className="text-cyan-300 font-bold text-xs sm:text-sm">
                        +{runDistance - (ghostRunInfo?.totalDistance || 0)}m Ahead 🔥
                      </span>
                    ) : ghostRunInfo ? (
                      <span
                        className={`text-xs ${
                          runDistance >= ghostRunInfo.totalDistance ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {runDistance >= ghostRunInfo.totalDistance
                          ? 'Ghost Beaten 🏁'
                          : `${(ghostRunInfo.totalDistance - runDistance).toLocaleString()}m remaining`}
                      </span>
                    ) : (
                      <span className="text-cyan-400 text-xs">Track Saved ✓</span>
                    )}
                  </div>
                </div>

                {/* Daily Challenges Progress Banner */}
                <div className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-start">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Daily Quests</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          {dailySummary.completed}/{dailySummary.total}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {dailySummary.unclaimedCount > 0
                          ? `You have ${dailySummary.unclaimedCount} quest rewards ready to claim!`
                          : 'Complete daily quests to earn bonus coins'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDailyModal(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      dailySummary.unclaimedCount > 0
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 animate-bounce shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{dailySummary.unclaimedCount > 0 ? 'Claim Rewards 🎁' : 'View Quests'}</span>
                  </button>
                </div>
              </div>

              {/* Restart, Garage & Leaderboard Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={startGame}
                  className="btn-play w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={onOpenGarage}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Garage & Car Wash 🧽</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Leaderboard 🏆</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE AUDIO & MUSIC CONTROL MODAL */}
        {showAudioModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl shadow-amber-500/10 space-y-4 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-game text-white flex items-center gap-2">
                    Audio & Music Controls 🎚️
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={toggleAudioModal}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Audio Settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Interactive Pitch & Speed Telemetry */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Dynamic Speed Pitch Reaction</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {speedPitchEnabled ? 'Engine Linked ⚡' : 'Locked 🔒'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Music Tempo</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {musicEnabled ? `${liveMusicBpm} BPM` : 'Stopped'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Pitch Shift</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {livePitchShift >= 0 ? `+${livePitchShift}` : livePitchShift} st
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Car Speed</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {Math.round(currentSpeed)} KM/H
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  🎶 The musical rhythm and pitch dynamically elevate as you accelerate or use nitro, softening dynamically during braking!
                </p>
              </div>

              {/* Music Volume Section */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Energetic Race Music</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        musicEnabled
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {musicEnabled ? <Music className="w-3.5 h-3.5 text-amber-400" /> : <Music2 className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{musicEnabled ? 'Playing' : 'Muted'}</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                {/* Speed Pitch Feature Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-xs text-slate-300">
                    Dynamic Pitch Reaction to Car Speed
                  </span>
                  <button
                    type="button"
                    onClick={handleSpeedPitchToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      speedPitchEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        speedPitchEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sound Effects Volume Section */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Engine & Sound Effects (SFX)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSound}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        soundEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{soundEnabled ? 'Active' : 'Muted'}</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleSoundVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mobile Haptic Vibration Feedback Section */}
              {hapticsSupported && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span>Haptic Vibration Feedback</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleHaptics}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            hapticsEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400">
                      Tactile rumbles for nitro boosts & obstacle crashes
                    </span>
                    <button
                      type="button"
                      onClick={() => hapticNitroBoost()}
                      disabled={!hapticsEnabled}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      Test Rumble 📳
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(0);
                    handleSoundVolumeChange(0);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer"
                >
                  Mute All 🔇
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(0.3);
                    handleSoundVolumeChange(0.4);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer"
                >
                  Quiet 🔉
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(0.5);
                    handleSoundVolumeChange(0.8);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer"
                >
                  Balanced 🔊
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(1.0);
                    handleSoundVolumeChange(1.0);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-center cursor-pointer font-bold"
                >
                  Max Hype ⚡
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={toggleAudioModal}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* DAILY CHALLENGES & SPECIAL REWARDS MODAL */}
        <DailyChallengesModal
          isOpen={showDailyModal}
          onClose={() => setShowDailyModal(false)}
          onCoinsChange={(reward) => {
            onCoinsChange(loadPlayerStats().coins);
          }}
        />
      </div>
    </div>
  );
});

RacingGame.displayName = 'RacingGame';
