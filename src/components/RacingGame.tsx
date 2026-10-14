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
import { soundManager, engineAudio } from '../utils/audio';

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
}

export const RacingGame = forwardRef<RacingGameHandle, RacingGameProps>((props, ref) => {
  const { onOpenGarage, coins, onCoinsChange } = props;
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

  // Switch Track Environment
  const handleTrackChange = (track: TrackEnvironment) => {
    setSelectedTrack(track);
    const stats = loadPlayerStats();
    stats.selectedTrack = track;
    savePlayerStats(stats);
    soundManager.playClick();
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
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      }
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Shift') {
        keysRef.current.nitro = true;
        keysRef.current.space = true;
        keysRef.current.drift = true;
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
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
      }
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Shift') {
        keysRef.current.nitro = false;
        keysRef.current.space = false;
        keysRef.current.drift = false;
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
      tilt: 0,
      shake: 0,
      curveOffset: 0,
      combo: 1,
      comboTimer: 0,
    };

    trafficRef.current = [];
    collectiblesRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    carGhostsRef.current = [];
    warpLinesRef.current = [];
    roadCurveRef.current = { current: 0, target: 0, timer: 0 };

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

    setGameState('PLAYING');
    setCurrentScore(0);
    setRunCoins(0);
    setRunDistance(0);
    setCarHealth(100);
    setNitroAmount(100);
    setComboMultiplier(1);
    setComboMessage(null);

    soundManager.startEngine();
    if (musicEnabled) {
      soundManager.startMusic();
    }
  }, [musicEnabled]);

  const pauseGame = () => {
    setGameState('PAUSED');
    soundManager.stopEngine();
    soundManager.pauseMusic();
  };

  const resumeGame = () => {
    setGameState('PLAYING');
    soundManager.startEngine();
    if (musicEnabled) {
      soundManager.resumeMusic();
    }
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

    // Auto-record score into Top 5 Leaderboard (LocalStorage)
    if (finalScore > 0) {
      const pName = loadPlayerName();
      const car = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
      addLeaderboardScore(pName, finalScore, car.arabicName || car.name);
    }

    onCoinsChange(finalCoins);
    setHighScore(newHigh);
    setCurrentScore(finalScore);
    setRunCoins(playerRef.current.coinsCollected);
    setRunDistance(Math.floor(playerRef.current.distance));
    setRunDirt(finalDirt);
  }, [onCoinsChange]);

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

        // Camera shake dampening
        p.shake *= 0.9;

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

          // Gentle lane changing
          car.laneChangeTimer -= dt;
          if (car.laneChangeTimer <= 0) {
            const newLane = Math.floor(Math.random() * 3);
            car.targetX = [-0.65, 0, 0.65][newLane];
            car.laneChangeTimer = 4 + Math.random() * 5;
          }
          car.x += (car.targetX - car.x) * dt * 0.8;

          // Close pass / Near miss detection
          if (Math.abs(car.z) < 18 && Math.abs(car.x - p.x) < 0.48 && Math.abs(car.x - p.x) > 0.22 && !((car as unknown as { scoredCloseCall?: boolean }).scoredCloseCall)) {
            (car as unknown as { scoredCloseCall?: boolean }).scoredCloseCall = true;
            p.combo = Math.min(5, p.combo + 1);
            p.comboTimer = 3.5;
            p.score += 75 * p.combo;
            setComboMultiplier(p.combo);
            setComboMessage(`تجاوز وشيك! +${75 * p.combo}`);
            soundManager.playNearMiss();
          }

          // Collision detection
          if (Math.abs(car.z) < 22 && Math.abs(car.x - p.x) < 0.24) {
            // Crash impact
            p.shake = 16;
            p.speed *= 0.35;
            p.health -= 35;
            setCarHealth(Math.max(0, p.health));
            soundManager.playCrash();

            // Spawn crash debris particles (optimized count on mobile)
            const crashDebrisCount = (isMobileDevice || performanceMode) ? 8 : 16;
            for (let k = 0; k < crashDebrisCount; k++) {
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3),
                y: height * 0.82,
                vx: (Math.random() - 0.5) * 350,
                vy: -Math.random() * 280,
                life: 0.6,
                maxLife: 0.6,
                color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
                size: 3 + Math.random() * 3,
              });
            }

            // Remove car
            trafficRef.current.splice(i, 1);

            if (p.health <= 0) {
              gameOver();
              break;
            }
            continue;
          }

          // Remove vehicles far behind or far ahead
          if (car.z < -60 || car.z > 1200) {
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
              soundManager.playCoin();
            } else if (item.type === 'nitro') {
              p.nitro = effective.nitro;
              soundManager.playNitroBoost();
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
            p.speed *= 0.65;
            p.shake = 10;
            p.health -= 15;
            setCarHealth(Math.max(0, p.health));
            soundManager.playCrash();

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

        // Update state hooks (throttled to 10-12 FPS to eliminate mobile React tree re-render overhead)
        const nowUi = performance.now();
        if (nowUi - lastUiSyncRef.current > (isMobileDevice ? 90 : 60)) {
          lastUiSyncRef.current = nowUi;
          setCurrentSpeed(Math.round(p.speed));
          setNitroAmount(Math.round((p.nitro / effective.nitro) * 100));
          setCurrentScore(Math.floor(p.score));
          setRunCoins(p.coinsCollected);
          setRunDistance(Math.floor(p.distance));
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

        // Rear window
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-carW * 0.32, -carH * 0.5, carW * 0.64, carH * 0.22);

        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-carW * 0.44, -carH * 0.2, 12, 6);
        ctx.fillRect(carW * 0.44 - 12, -carH * 0.2, 12, 6);

        // Tires
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW * 0.52, -14, 8, 14);
        ctx.fillRect(carW * 0.52 - 8, -14, 8, 14);

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

      // 11. NITRO BLUE SCREEN BLOOM (وهج أزرق للشاشة) & PERIPHERAL MOTION BLUR
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

      ctx.restore(); // Undo translate shake
      ctx.restore(); // Undo DPR scale

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, selectedTrack, gameOver, onCoinsChange, performanceMode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none"
    >
      {/* TOP IN-GAME HUD BAR (Always accessible) */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-xs">
        {/* Left: Score & Distance */}
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold font-game">
            <Coins className="w-4 h-4" />
            <span className="tabular-nums text-sm sm:text-base">
              {gameState === 'PLAYING' ? runCoins : coins}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <span className="text-slate-400">النقاط:</span>
            <span className="font-bold tabular-nums font-game text-white text-base">
              {currentScore.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400">المسافة:</span>
            <span className="font-bold tabular-nums font-game text-emerald-400">
              {(runDistance / 1000).toFixed(2)} كم
            </span>
          </div>
        </div>

        {/* Center: Combo Pill (When active) */}
        {comboMultiplier > 1 && (
          <div className="animate-bounce flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-amber-300 text-xs font-bold font-game">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{comboMessage || `مضاعف x${comboMultiplier}`}</span>
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
            title={performanceMode ? 'نمط الأداء التوربو مفعّل (60 FPS)' : 'تفعيل نمط تسريع الأداء للجوال'}
            aria-label="Toggle High Performance Mode"
          >
            <Zap className={`w-3.5 h-3.5 ${performanceMode ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold font-game">
              {performanceMode ? `${fps} FPS ⚡` : 'توربو'}
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
            title="التحكم بمستوى الصوت والموسيقى التفاعلية"
            aria-label="Audio and Interactive Music Controls"
          >
            <Sliders className={`w-4 h-4 ${showAudioModal ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline text-[11px] font-bold">
              التحكم بالصوت
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              showAudioModal ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-amber-300'
            }`}>
              {musicEnabled ? `${Math.round(musicVolume * 100)}%` : 'كتم'}
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
            title={musicEnabled ? 'إيقاف موسيقى السباق الحماسية' : 'تشغيل موسيقى السباق الحماسية'}
            aria-label="Toggle Race Music"
          >
            {musicEnabled ? (
              <Music className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Music2 className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden md:inline text-[11px] font-bold">
              {musicEnabled ? 'موسيقى السباق' : 'الموسيقى: متوقفة'}
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
            title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
            aria-label="Sound Toggle"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={pauseGame}
              className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="إيقاف مؤقت"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
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
            title="المرآب لتطوير وغسيل السيارات"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">المرآب</span>
            {carDirtRef.current > 20 && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono" title="السيارة متسخة وبحاجة لغسيل">
                🧽
              </span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors hidden sm:block"
            title="شاشة كاملة"
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
          className={`w-full h-full block cursor-crosshair touch-none transition-transform duration-100 origin-[50%_42%] ${
            isNitroActive ? 'scale-[1.025] filter contrast-110 saturate-125' : 'scale-100'
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

        {/* SPEEDOMETER & DYNAMIC NITRO GAUGE CLUSTER (Side-by-side instrument panel) */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-12 left-3 sm:top-auto sm:bottom-5 sm:left-5 z-20 pointer-events-none flex flex-row items-center gap-2 sm:gap-2.5">
            {/* 1. SPEED GAUGE & HEALTH */}
            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800/80 shadow-lg">
              <div className="p-1 sm:p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30">
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black font-game tabular-nums text-white leading-none">
                    {currentSpeed}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">كم/س</span>
                </div>
                {/* Health Bar */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-14 sm:w-18 h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        carHealth > 50 ? 'bg-emerald-500' : carHealth > 25 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${carHealth}%` }}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono font-bold">
                    {carHealth}%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC NITRO VISUAL GAUGE (بجانب شريط سرعة السيارة) */}
            <div
              className={`flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-950/85 backdrop-blur-md rounded-xl border transition-all duration-200 shadow-lg ${
                isNitroActive
                  ? 'border-amber-500/60 shadow-amber-500/20'
                  : nitroAmount >= 25
                  ? 'border-cyan-500/50 shadow-cyan-500/15'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Circular SVG Radial Gauge Meter */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  {/* Background Track Circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    className="stroke-slate-800/90"
                    strokeWidth="4"
                    fill="none"
                  />
                  {/* 25% Threshold Indicator Marker */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    className="stroke-slate-700"
                    strokeWidth="4"
                    strokeDasharray="2 117"
                    strokeDashoffset={-(119.38 * 0.25)}
                    fill="none"
                  />
                  {/* Active Animated Nitro Progress Arc */}
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    stroke={
                      isNitroActive
                        ? '#f59e0b'
                        : nitroAmount >= 25
                        ? '#06b6d4'
                        : '#64748b'
                    }
                    strokeWidth="4"
                    strokeDasharray={119.38}
                    strokeDashoffset={119.38 - (119.38 * (nitroAmount / 100))}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-150 ease-out"
                  />
                </svg>

                {/* Inner Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame
                    className={`w-4 h-4 transition-all ${
                      isNitroActive
                        ? 'text-amber-400 animate-pulse scale-110'
                        : nitroAmount >= 25
                        ? 'text-cyan-400'
                        : 'text-slate-500'
                    }`}
                  />
                </div>
              </div>

              {/* Nitro Level & Status Info */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-base sm:text-lg font-black font-game tabular-nums leading-none ${
                      isNitroActive
                        ? 'text-amber-400'
                        : nitroAmount >= 25
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {nitroAmount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">%</span>
                </div>

                {/* Dynamic Status Pill */}
                <div className="mt-0.5">
                  {isNitroActive ? (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                      منطلق 🔥
                    </span>
                  ) : nitroAmount >= 25 ? (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                      جاهز ⚡
                    </span>
                  ) : (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-800/90 text-slate-400 border border-slate-700/60 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse inline-block" />
                      شحن ⏳
                    </span>
                  )}
                </div>
              </div>
            </div>
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
                }}
                onPointerUp={(e) => {
                  try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
                  keysRef.current.down = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.down = false;
                }}
                className="w-13 h-13 sm:w-12 sm:h-12 rounded-xl bg-slate-800 active:bg-red-700 text-white flex items-center justify-center font-bold text-xs border border-slate-600 shadow-md touch-none select-none cursor-pointer"
                aria-label="Brake"
              >
                فرامل
              </button>
            </div>
          </>
        )}

        {/* TITLE MENU OVERLAY */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className="max-w-md w-full text-center space-y-4 sm:space-y-5 my-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <span>أقوى ألعاب سباق سيارات الشوارع لعام 2026</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-game text-white tracking-tight leading-tight">
                سباق سيارات المدينة السريعة
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                انطلق بأقصى سرعة في قلب شوارع المدينة، تفادى سيارات المرور، اجمع العملات الذهبية، واستخدم النيترو لتحطيم الأرقام القياسية!
              </p>

              {/* Track environment selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-400">اختر مسار السباق والطقس:</span>
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
                    النهار
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
                    الغروب
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
                    النيون الليلي
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
                    مطر
                  </button>
                </div>
              </div>

              {/* High Score Banner */}
              {highScore > 0 && (
                <div className="text-xs text-slate-400">
                  أفضل رقم قياسي محقق:{' '}
                  <span className="font-bold text-amber-400 font-game">{highScore.toLocaleString()} نقطة</span>
                </div>
              )}

              {/* Quick Toggles: Music & High-Performance Mobile Mode */}
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
                  <span>الموسيقى: {musicEnabled ? 'مفعلة' : 'متوقفة'}</span>
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
                  <span>تسريع الجوال (60 FPS): {performanceMode ? 'مفعّل ⚡' : 'عادي'}</span>
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
                  <span>العب الآن - انطلق بالسباق</span>
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
                  <span>المرآب والترقيات</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-amber-400 font-bold text-sm rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="عرض لوحة أفضل 5 لاعبين"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>لوحة المتصدرين 🏆</span>
                </button>
              </div>

              {/* Quick Controls Guide */}
              <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-3 flex-wrap">
                <span>التوجيه: أسهم / WASD</span>
                <span>•</span>
                <span>النيترو: زر مسافة Space</span>
                <span>•</span>
                <span>الفرامل: السهم للأسفل / S</span>
              </div>
            </div>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-xs w-full text-center space-y-4">
              <h3 className="text-2xl font-bold font-game text-white">السباق متوقف مؤقتاً</h3>
              <div className="space-y-2">
                <button
                  onClick={resumeGame}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  متابعة القيادة
                </button>

                {/* Audio & Music Control Button in Pause Menu */}
                <button
                  type="button"
                  onClick={toggleAudioModal}
                  className="w-full py-2 px-4 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>التحكم في الصوت والموسيقى 🎚️ ({Math.round(musicVolume * 100)}%)</span>
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
                  <span>موسيقى السباق: {musicEnabled ? 'مفعلة (تشغيل)' : 'متوقفة (كتم)'}</span>
                </button>

                <button
                  onClick={startGame}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  إعادة تشغيل السباق
                </button>
                <button
                  onClick={() => {
                    setGameState('MENU');
                    soundManager.stopEngine();
                    soundManager.stopMusic();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-xs cursor-pointer"
                >
                  العودة للقائمة الرئيسية
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
                <span>انتهى السباق بالاصطدام!</span>
              </div>

              <h3 className="text-3xl font-black font-game text-white">نتيجة السباق</h3>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-start text-xs">
                <div>
                  <div className="text-slate-400">النقاط الإجمالية:</div>
                  <div className="text-lg font-bold font-game text-white">
                    {currentScore.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">المسافة المقطوعة:</div>
                  <div className="text-lg font-bold font-game text-emerald-400">
                    {(runDistance / 1000).toFixed(2)} كم
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">العملات المجمعة:</div>
                  <div className="text-base font-bold font-game text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    +{runCoins}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">الرقم القياسي:</div>
                  <div className="text-base font-bold font-game text-sky-400">
                    {highScore.toLocaleString()}
                  </div>
                </div>

                {/* Car Dirt & Cleanliness Summary */}
                <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>حالة هيكل السيارة:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {runDirt <= 15 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>نظيفة ولامعة ({runDirt}%)</span>
                      </span>
                    ) : runDirt <= 50 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>💨 غبار طريق ({runDirt}%)</span>
                      </span>
                    ) : (
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <span>🍂 متسخة بالطين ({runDirt}%)</span>
                      </span>
                    )}
                    {runDirt > 25 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        اغسلها في المرآب 🧽
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Restart, Garage & Leaderboard Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={startGame}
                  className="btn-play w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>العب مجدداً</span>
                </button>

                <button
                  onClick={onOpenGarage}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>المرآب وغسيل السيارة 🧽</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>لوحة المتصدرين 🏆</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE AUDIO & MUSIC CONTROL MODAL */}
        {showAudioModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl shadow-amber-500/10 space-y-4 text-right">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  type="button"
                  onClick={toggleAudioModal}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="إغلاق لوحة الصوت"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-game text-white flex items-center gap-2">
                    التحكم بالصوت والموسيقى 🎚️
                  </h3>
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Live Interactive Pitch & Speed Telemetry */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>تفاعل الموسيقى المباشر مع السرعة</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {speedPitchEnabled ? 'متصل بالمحرك ⚡' : 'ثابت 🔒'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">إيقاع الموسيقى</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {musicEnabled ? `${liveMusicBpm} BPM` : 'متوقف'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">حدة النغمة (Pitch)</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {livePitchShift >= 0 ? `+${livePitchShift}` : livePitchShift} st
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">سرعة السيارة</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {Math.round(currentSpeed)} كم/س
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  🎶 ترتفع نغمة الموسيقى وحدتها وإيقاعها طردياً كلما ضغطت على دواسة الوقود أو النيترو، وتهدأ عند الفرملة!
                </p>
              </div>

              {/* Music Volume Section */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center justify-between">
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
                      <span>{musicEnabled ? 'تشغيل' : 'كتم'}</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>موسيقى السباق الحماسية</span>
                    <Music className="w-4 h-4 text-amber-400" />
                  </label>
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
                  <button
                    type="button"
                    onClick={handleSpeedPitchToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      speedPitchEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        speedPitchEnabled ? 'translate-x-0' : 'translate-x-4'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-300">
                    تغيير حدة النغمات مع سرعة السيارة (Pitch Reaction)
                  </span>
                </div>
              </div>

              {/* Sound Effects Volume Section */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center justify-between">
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
                      <span>{soundEnabled ? 'تشغيل' : 'كتم'}</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>صوت المحرك والمؤثرات (SFX)</span>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  </label>
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
                  كتم الكل 🔇
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(0.3);
                    handleSoundVolumeChange(0.4);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer"
                >
                  هادئ 🔉
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(0.5);
                    handleSoundVolumeChange(0.8);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-center cursor-pointer"
                >
                  متوازن 🔊
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMusicVolumeChange(1.0);
                    handleSoundVolumeChange(1.0);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-center cursor-pointer font-bold"
                >
                  أقصى حماس ⚡
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={toggleAudioModal}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RacingGame.displayName = 'RacingGame';
