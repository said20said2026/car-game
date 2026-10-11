import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
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
  getCarEffectiveStats,
} from '../utils/storage';
import { soundManager } from '../utils/audio';

interface RacingGameProps {
  onOpenGarage: () => void;
  coins: number;
  onCoinsChange: (newCoins: number) => void;
}

export const RacingGame: React.FC<RacingGameProps> = ({
  onOpenGarage,
  coins,
  onCoinsChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-level React Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedTrack, setSelectedTrack] = useState<TrackEnvironment>('day');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [runDistance, setRunDistance] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [nitroAmount, setNitroAmount] = useState<number>(100);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [selectedCarId, setSelectedCarId] = useState<string>('red_rocket');
  const [carHealth, setCarHealth] = useState<number>(100);

  // Active Key States
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    nitro: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
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

  // Sync initial player stats from storage
  useEffect(() => {
    const stats = loadPlayerStats();
    setHighScore(stats.highScore);
    setSelectedCarId(stats.selectedCarId);
    setSelectedTrack(stats.selectedTrack);
    setSoundEnabled(stats.soundEnabled);
    soundManager.setEnabled(stats.soundEnabled);
  }, []);

  // Sync sound settings
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
    const stats = loadPlayerStats();
    stats.soundEnabled = next;
    savePlayerStats(stats);
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
      if (e.key === ' ' || e.key === 'Shift') {
        keysRef.current.nitro = true;
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
      if (e.key === ' ' || e.key === 'Shift') {
        keysRef.current.nitro = false;
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
    const stats = loadPlayerStats();
    const currentCar = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
    const effective = getCarEffectiveStats(currentCar, stats.upgrades[currentCar.id]);

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
  }, []);

  const pauseGame = () => {
    setGameState('PAUSED');
    soundManager.stopEngine();
  };

  const resumeGame = () => {
    setGameState('PLAYING');
    soundManager.startEngine();
  };

  const gameOver = useCallback(() => {
    setGameState('GAMEOVER');
    soundManager.stopEngine();
    soundManager.playCrash();

    // Persist scores and coins
    const stats = loadPlayerStats();
    const finalCoins = stats.coins + playerRef.current.coinsCollected;
    const finalScore = Math.floor(playerRef.current.score);
    const newHigh = Math.max(stats.highScore, finalScore);
    const newMaxDist = Math.max(stats.maxDistance, Math.floor(playerRef.current.distance));

    stats.coins = finalCoins;
    stats.highScore = newHigh;
    stats.maxDistance = newMaxDist;
    stats.racesCount = (stats.racesCount || 0) + 1;
    savePlayerStats(stats);

    onCoinsChange(finalCoins);
    setHighScore(newHigh);
    setCurrentScore(finalScore);
    setRunCoins(playerRef.current.coinsCollected);
    setRunDistance(Math.floor(playerRef.current.distance));
  }, [onCoinsChange]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nextTrafficSpawn = 0;
    let nextCollectibleSpawn = 0;
    let nextObstacleSpawn = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Handle Resize dynamically
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement?.clientWidth || 800;
      const height = Math.min(width * 0.65, 520);
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // Current player car config
      const stats = loadPlayerStats();
      const currentCar = CARS_DATA.find((c) => c.id === stats.selectedCarId) || CARS_DATA[0];
      const effective = getCarEffectiveStats(currentCar, stats.upgrades[currentCar.id]);

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
          setIsNitroActive(true);
        } else {
          // Slow passive nitro recharge
          p.nitro = Math.min(effective.nitro, p.nitro + dt * 4);
          setIsNitroActive(false);
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

        // Combo timer
        if (p.comboTimer > 0) {
          p.comboTimer -= dt;
          if (p.comboTimer <= 0) {
            p.combo = 1;
            setComboMultiplier(1);
            setComboMessage(null);
          }
        }

        // Update sound engine
        soundManager.updateEngine(p.speed / effective.topSpeed, wantAccel, wantNitro);

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

            // Spawn crash debris particles
            for (let k = 0; k < 18; k++) {
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3),
                y: height * 0.82,
                vx: (Math.random() - 0.5) * 350,
                vy: -Math.random() * 280,
                life: 0.7,
                maxLife: 0.7,
                color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
                size: 3 + Math.random() * 4,
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

            // Spawn sparkly pickup particles
            for (let k = 0; k < 10; k++) {
              particlesRef.current.push({
                x: width / 2 + p.x * (width * 0.3),
                y: height * 0.82,
                vx: (Math.random() - 0.5) * 150,
                vy: -Math.random() * 150 - 50,
                life: 0.5,
                maxLife: 0.5,
                color: item.type === 'coin' ? '#fbbf24' : '#38bdf8',
                size: 2.5 + Math.random() * 3,
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

        // Tire drift smoke particles
        if (Math.abs(p.vx) > 0.4 || p.speed > 220) {
          particlesRef.current.push({
            x: width / 2 + (p.x - 0.08) * (width * 0.35),
            y: height * 0.86,
            vx: (Math.random() - 0.5) * 40,
            vy: Math.random() * 30 + 10,
            life: 0.35,
            maxLife: 0.35,
            color: 'rgba(255, 255, 255, 0.45)',
            size: 4 + Math.random() * 5,
          });
          particlesRef.current.push({
            x: width / 2 + (p.x + 0.08) * (width * 0.35),
            y: height * 0.86,
            vx: (Math.random() - 0.5) * 40,
            vy: Math.random() * 30 + 10,
            life: 0.35,
            maxLife: 0.35,
            color: 'rgba(255, 255, 255, 0.45)',
            size: 4 + Math.random() * 5,
          });
        }

        // Nitro flame particles
        if (wantNitro) {
          for (let f = 0; f < 3; f++) {
            particlesRef.current.push({
              x: width / 2 + (p.x + (Math.random() - 0.5) * 0.05) * (width * 0.35),
              y: height * 0.88,
              vx: (Math.random() - 0.5) * 60,
              vy: Math.random() * 120 + 80,
              life: 0.2,
              maxLife: 0.2,
              color: Math.random() > 0.5 ? '#38bdf8' : '#f97316',
              size: 5 + Math.random() * 6,
            });
          }
        }

        // Update state hooks (throttled to UI)
        setCurrentSpeed(Math.round(p.speed));
        setNitroAmount(Math.round((p.nitro / effective.nitro) * 100));
        setCurrentScore(Math.floor(p.score));
        setRunCoins(p.coinsCollected);
        setRunDistance(Math.floor(p.distance));
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

      // 7. PARTICLES (Smoke, fire, rain, debris)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;

        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

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

      // 8. PLAYER SPORTS CAR (Anchored at bottom center with realistic steering tilt)
      const playerScreenX = roadBottomX + p.x * (roadBottomW * 0.42);
      const playerScreenY = height * 0.82;

      ctx.save();
      ctx.translate(playerScreenX, playerScreenY);
      ctx.rotate(p.tilt);

      const pW = 82;
      const pH = 56;

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
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = isBraking ? 18 : 8;
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

      ctx.restore();

      // 9. NITRO SPEED BLUR STREAKS
      if (isNitroActive) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2.5;
        for (let s = 0; s < 12; s++) {
          const sx = (s * (width / 12) + (timestamp * 0.8) % 40) % width;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + (roadCurveRef.current.current * 30), height);
          ctx.stroke();
        }
      }

      ctx.restore(); // Undo translate shake
      ctx.restore(); // Undo DPR scale

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, selectedTrack, gameOver, onCoinsChange, isNitroActive]);

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

        {/* Right: Sound, Fullscreen, Pause / Garage */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
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
            onClick={onOpenGarage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-medium transition-colors"
            title="المرآب لتطوير السيارات"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">المرآب</span>
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
      <div id="canvas-placeholder" className="relative w-full aspect-16/9 sm:aspect-21/10 min-h-[340px] max-h-[560px]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* SPEEDOMETER & NITRO GAUGE (Bottom Left of Canvas) */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 pointer-events-none flex flex-col gap-2">
            {/* Speed Gauge */}
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 shadow-lg">
              <Gauge className="w-5 h-5 text-sky-400" />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-game tabular-nums text-white leading-none">
                    {currentSpeed}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">كم/س</span>
                </div>
                {/* Health Bar */}
                <div className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-200 ${
                      carHealth > 50 ? 'bg-emerald-500' : carHealth > 25 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${carHealth}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Nitro Booster Bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 shadow-lg">
              <Flame className={`w-4 h-4 ${isNitroActive ? 'text-amber-400 animate-pulse' : 'text-sky-400'}`} />
              <div className="flex-1 w-20 sm:w-24">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                  <span>نيترو</span>
                  <span className="tabular-nums">{nitroAmount}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      isNitroActive ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${nitroAmount}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOUCH CONTROLS OVERLAY (Visible on Mobile / Touchscreens) */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-2 sm:gap-3">
            {/* Steering Left / Right */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800">
              <button
                onPointerDown={() => {
                  keysRef.current.left = true;
                }}
                onPointerUp={() => {
                  keysRef.current.left = false;
                }}
                onPointerLeave={() => {
                  keysRef.current.left = false;
                }}
                className="w-12 h-12 rounded-xl bg-slate-900/90 active:bg-sky-600 text-white flex items-center justify-center font-bold text-lg border border-slate-700/60 shadow-md touch-none"
                aria-label="Steer Left"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button
                onPointerDown={() => {
                  keysRef.current.right = true;
                }}
                onPointerUp={() => {
                  keysRef.current.right = false;
                }}
                onPointerLeave={() => {
                  keysRef.current.right = false;
                }}
                className="w-12 h-12 rounded-xl bg-slate-900/90 active:bg-sky-600 text-white flex items-center justify-center font-bold text-lg border border-slate-700/60 shadow-md touch-none"
                aria-label="Steer Right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Nitro & Gas */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800">
              <button
                onPointerDown={() => {
                  keysRef.current.nitro = true;
                }}
                onPointerUp={() => {
                  keysRef.current.nitro = false;
                }}
                onPointerLeave={() => {
                  keysRef.current.nitro = false;
                }}
                className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 active:scale-95 text-white flex items-center justify-center font-bold text-xs border border-amber-400/50 shadow-md touch-none"
                aria-label="Nitro Boost"
              >
                <Flame className="w-5 h-5 fill-white" />
              </button>

              <button
                onPointerDown={() => {
                  keysRef.current.down = true;
                }}
                onPointerUp={() => {
                  keysRef.current.down = false;
                }}
                onPointerLeave={() => {
                  keysRef.current.down = false;
                }}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-red-700 text-white flex items-center justify-center font-bold text-xs border border-slate-600 shadow-md touch-none"
                aria-label="Brake"
              >
                فرامل
              </button>
            </div>
          </div>
        )}

        {/* TITLE MENU OVERLAY */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="max-w-md w-full text-center space-y-5">
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
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleTrackChange('day')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTrack === 'day'
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    النهار
                  </button>

                  <button
                    onClick={() => handleTrackChange('sunset')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTrack === 'sunset'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sunset className="w-3.5 h-3.5" />
                    الغروب
                  </button>

                  <button
                    onClick={() => handleTrackChange('night')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTrack === 'night'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    النيون الليلي
                  </button>

                  <button
                    onClick={() => handleTrackChange('rain')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={startGame}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>ابدأ السباق الآن</span>
                </button>

                <button
                  onClick={onOpenGarage}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>المرآب والترقيات</span>
                </button>
              </div>

              {/* Quick Controls Guide */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-3">
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
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  متابعة القيادة
                </button>
                <button
                  onClick={startGame}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  إعادة تشغيل السباق
                </button>
                <button
                  onClick={() => {
                    setGameState('MENU');
                    soundManager.stopEngine();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-xs"
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
              </div>

              {/* Restart & Garage Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={startGame}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>العب مجدداً</span>
                </button>

                <button
                  onClick={onOpenGarage}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>تطوير السيارة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
