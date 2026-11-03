import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface NeonKartCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

type PowerUpType = 'missile' | 'shield' | 'boost' | 'lightning';

interface AIKart {
  id: number;
  name: string;
  color: string;
  trackProgress: number; // 0 to 1 loop around circuit
  laneOffset: number;
  speed: number;
  maxSpeed: number;
  stunTimer: number;
  lap: number;
}

export const NeonKartCanvas: React.FC<NeonKartCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState(1);
  const [currentLap, setCurrentLap] = useState(1);
  const [totalLaps] = useState(3);
  const [score, setScore] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [heldItem, setHeldItem] = useState<PowerUpType | null>(null);
  const [hasShield, setHasShield] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finishRank, setFinishRank] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const stateRef = useRef({
    player: {
      trackProgress: 0,
      laneOffset: 0, // -1 to 1 across track width
      speed: 0,
      maxSpeed: 9.5,
      accel: 0.22,
      friction: 0.985,
      lap: 1,
      isDrifting: false,
      driftDir: 0,
      driftCharge: 0, // 0 to 100 for mini-turbo
      hasShield: false,
      shieldTimer: 0,
      stunTimer: 0,
      heldItem: null as PowerUpType | null,
    },
    rivals: [] as AIKart[],
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      drift: false,
      item: false,
    },
    missiles: [] as { xProgress: number; lane: number; speed: number; life: number }[],
    itemBoxes: [] as { progress: number; lane: number; active: boolean; respawnTimer: number }[],
    particles: [] as { xProgress: number; lane: number; vx: number; vy: number; life: number; color: string; size: number }[],
    lapStartTime: performance.now(),
    score: 0,
    coinsEarned: 0,
    running: true,
  });

  const showAnnouncement = (text: string, durationMs = 1500) => {
    setAnnouncement(text);
    setTimeout(() => {
      setAnnouncement((prev) => (prev === text ? null : prev));
    }, durationMs);
  };

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.player.trackProgress = 0;
    s.player.laneOffset = 0;
    s.player.speed = 0;
    s.player.lap = 1;
    s.player.isDrifting = false;
    s.player.driftCharge = 0;
    s.player.hasShield = false;
    s.player.shieldTimer = 0;
    s.player.stunTimer = 0;
    s.player.heldItem = null;
    s.score = 0;
    s.coinsEarned = 0;
    s.running = true;

    // 4 AI Rivals
    s.rivals = [
      { id: 1, name: 'Vortex 99', color: '#ff0055', trackProgress: 0.08, laneOffset: -0.5, speed: 7.8, maxSpeed: 8.6, stunTimer: 0, lap: 1 },
      { id: 2, name: 'Cyber Bolt', color: '#00e5ff', trackProgress: 0.05, laneOffset: 0.5, speed: 8.1, maxSpeed: 8.8, stunTimer: 0, lap: 1 },
      { id: 3, name: 'Nova Dash', color: '#ffe600', trackProgress: 0.02, laneOffset: -0.2, speed: 8.0, maxSpeed: 8.7, stunTimer: 0, lap: 1 },
      { id: 4, name: 'Phantom X', color: '#b000ff', trackProgress: 0.0, laneOffset: 0.3, speed: 8.3, maxSpeed: 9.0, stunTimer: 0, lap: 1 },
    ];

    // Mystery Item Boxes at key track milestones
    s.itemBoxes = [
      { progress: 0.18, lane: -0.4, active: true, respawnTimer: 0 },
      { progress: 0.18, lane: 0.4, active: true, respawnTimer: 0 },
      { progress: 0.48, lane: -0.3, active: true, respawnTimer: 0 },
      { progress: 0.48, lane: 0.3, active: true, respawnTimer: 0 },
      { progress: 0.78, lane: -0.5, active: true, respawnTimer: 0 },
      { progress: 0.78, lane: 0.0, active: true, respawnTimer: 0 },
      { progress: 0.78, lane: 0.5, active: true, respawnTimer: 0 },
    ];

    s.missiles = [];
    s.particles = [];
    s.lapStartTime = performance.now();

    setPosition(1);
    setCurrentLap(1);
    setScore(0);
    setHeldItem(null);
    setHasShield(false);
    setIsGameOver(false);
    setFinishRank(null);
    showAnnouncement('3... 2... 1... GO! 🚀', 1800);
  }, []);

  const usePowerUp = () => {
    const s = stateRef.current;
    const p = s.player;
    if (!p.heldItem) return;

    if (p.heldItem === 'boost') {
      p.speed = p.maxSpeed * 1.5;
      arcadeAudio.playNitro();
      showAnnouncement('SUPER MUSHROOM BOOST! 🍄');
    } else if (p.heldItem === 'shield') {
      p.hasShield = true;
      p.shieldTimer = 7.0;
      setHasShield(true);
      arcadeAudio.playShield();
      showAnnouncement('PLASMA SHIELD ONLINE! 🛡️');
    } else if (p.heldItem === 'missile') {
      s.missiles.push({
        xProgress: p.trackProgress + 0.02,
        lane: p.laneOffset,
        speed: 18.0,
        life: 2.5,
      });
      arcadeAudio.playLaser();
      showAnnouncement('MISSILE LAUNCHED! 🚀');
    } else if (p.heldItem === 'lightning') {
      // Shock all rivals
      for (const r of s.rivals) {
        r.stunTimer = 2.0;
        r.speed = 2.0;
      }
      arcadeAudio.playLaser();
      showAnnouncement('⚡ EMP LIGHTNING SHOCK! ⚡');
    }

    p.heldItem = null;
    setHeldItem(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.min(parent.clientWidth, 960);
      const height = Math.min(Math.max(window.innerHeight * 0.62, 520), 640);
      canvas.width = width;
      canvas.height = height;
      initGame(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running && (e.code === 'Space' || e.code === 'KeyR')) {
        initGame(canvas.width, canvas.height);
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') s.keys.drift = true;
      if (e.code === 'Space') {
        usePowerUp();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') s.keys.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        s.keys.drift = false;
        // Release mini turbo if charged
        if (s.player.driftCharge > 40) {
          s.player.speed = s.player.maxSpeed * (s.player.driftCharge > 80 ? 1.4 : 1.2);
          arcadeAudio.playNitro();
        }
        s.player.isDrifting = false;
        s.player.driftCharge = 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const p = s.player;
      const w = canvas.width;
      const h = canvas.height;

      if (s.running) {
        // Player stun timer
        if (p.stunTimer > 0) {
          p.stunTimer -= dt;
          p.speed = Math.max(0, p.speed - 8 * dt);
        } else {
          // Normal drive controls
          if (s.keys.up) {
            p.speed = Math.min(p.speed + p.accel, p.maxSpeed);
            if (Math.random() < 0.15) arcadeAudio.playEngineTone(140 + p.speed * 14, 0.08);
          } else if (s.keys.down) {
            p.speed = Math.max(0, p.speed - p.accel * 2);
          } else {
            p.speed *= p.friction;
          }

          // Steer & Drift
          const steerSpeed = dt * 1.8;
          if (s.keys.left) {
            p.laneOffset = Math.max(-0.9, p.laneOffset - steerSpeed);
            if (s.keys.drift && p.speed > 3) {
              p.isDrifting = true;
              p.driftDir = -1;
              p.driftCharge = Math.min(100, p.driftCharge + dt * 60);
              if (Math.random() < 0.2) arcadeAudio.playTireSkid();
            }
          } else if (s.keys.right) {
            p.laneOffset = Math.min(0.9, p.laneOffset + steerSpeed);
            if (s.keys.drift && p.speed > 3) {
              p.isDrifting = true;
              p.driftDir = 1;
              p.driftCharge = Math.min(100, p.driftCharge + dt * 60);
              if (Math.random() < 0.2) arcadeAudio.playTireSkid();
            }
          }
        }

        // Shield countdown
        if (p.hasShield) {
          p.shieldTimer -= dt;
          if (p.shieldTimer <= 0) {
            p.hasShield = false;
            setHasShield(false);
          }
        }

        // Advance player along circuit
        const step = (p.speed * dt) / 38;
        p.trackProgress += step;
        s.score += Math.round(p.speed * 10 * dt);

        // Check lap completion
        if (p.trackProgress >= 1.0) {
          p.trackProgress -= 1.0;
          p.lap += 1;
          setCurrentLap(p.lap);
          s.score += 2000;
          arcadeAudio.playCheckpoint();
          if (p.lap > totalLaps) {
            // Race finished!
            s.running = false;
            setIsGameOver(true);
            arcadeAudio.playVictory();
            onGameOver?.(s.score, s.coinsEarned);
          } else {
            showAnnouncement(`LAP ${p.lap} / ${totalLaps}! 🔥`);
          }
        }

        // Advance AI rivals
        for (const r of s.rivals) {
          if (r.stunTimer > 0) {
            r.stunTimer -= dt;
          } else {
            r.speed = Math.min(r.speed + 0.15, r.maxSpeed);
          }
          const rStep = (r.speed * dt) / 38;
          r.trackProgress += rStep;
          if (r.trackProgress >= 1.0) {
            r.trackProgress -= 1.0;
            r.lap += 1;
          }
        }

        // Calculate current race standing (1st to 5th)
        let rank = 1;
        const playerGlobalPos = (p.lap - 1) + p.trackProgress;
        for (const r of s.rivals) {
          const rivalGlobalPos = (r.lap - 1) + r.trackProgress;
          if (rivalGlobalPos > playerGlobalPos) {
            rank += 1;
          }
        }
        setPosition(rank);
        if (isGameOver && finishRank === null) {
          setFinishRank(rank);
        }

        // Check Item Boxes
        for (const box of s.itemBoxes) {
          if (!box.active) {
            box.respawnTimer -= dt;
            if (box.respawnTimer <= 0) box.active = true;
            continue;
          }

          // Check if player collided with box
          const pDist = Math.abs(p.trackProgress - box.progress);
          const laneDist = Math.abs(p.laneOffset - box.lane);
          if (pDist < 0.02 && laneDist < 0.28) {
            box.active = false;
            box.respawnTimer = 6.0;
            arcadeAudio.playCoin();
            if (!p.heldItem) {
              const items: PowerUpType[] = ['boost', 'shield', 'missile', 'lightning'];
              const chosen = items[Math.floor(Math.random() * items.length)];
              p.heldItem = chosen;
              setHeldItem(chosen);
              s.coinsEarned += 1;
              onEarnCoins(1);
            }
          }
        }

        // Move missiles
        for (let i = s.missiles.length - 1; i >= 0; i--) {
          const m = s.missiles[i];
          m.xProgress += (m.speed * dt) / 38;
          m.life -= dt;

          // Check collision with AI rivals ahead
          for (const r of s.rivals) {
            if (Math.abs(r.trackProgress - m.xProgress) < 0.02 && Math.abs(r.laneOffset - m.lane) < 0.35) {
              r.stunTimer = 1.8;
              r.speed = 1.0;
              m.life = 0;
              arcadeAudio.playCrash();
              s.score += 800;
              showAnnouncement('RIVAL HIT! +800 PTS 🎯');
              break;
            }
          }

          if (m.life <= 0) {
            s.missiles.splice(i, 1);
          }
        }

        setScore(s.score);
        setSpeedKmh(Math.round(p.speed * 24));
      }

      // RENDER CANVAS
      // 1. Neon Cyber City Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a0520');
      bgGrad.addColorStop(0.5, '#190a38');
      bgGrad.addColorStop(1, '#050212');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Cyber grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 2. High-Tech Overhead 2.5D Kart Speedway
      const centerX = w / 2;
      const centerY = h / 2;
      const trackWidth = Math.min(w * 0.82, 700);
      const trackHeight = Math.min(h * 0.75, 420);
      const roadThickness = 65;

      // Outer track glow border
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(centerX - trackWidth / 2, centerY - trackHeight / 2, trackWidth, trackHeight, 140);
      ctx.stroke();

      // Road asphalt surface
      ctx.strokeStyle = '#120d28';
      ctx.lineWidth = roadThickness;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(centerX - trackWidth / 2, centerY - trackHeight / 2, trackWidth, trackHeight, 140);
      ctx.stroke();

      // Inner neon barrier
      ctx.strokeStyle = '#ff0077';
      ctx.shadowColor = '#ff0077';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(
        centerX - trackWidth / 2 + roadThickness / 2 + 2,
        centerY - trackHeight / 2 + roadThickness / 2 + 2,
        trackWidth - roadThickness - 4,
        trackHeight - roadThickness - 4,
        100
      );
      ctx.stroke();

      // Start/Finish Checker Line
      const finishX = centerX;
      const finishY = centerY + trackHeight / 2;
      ctx.fillStyle = '#fff';
      for (let i = -roadThickness / 2; i < roadThickness / 2; i += 10) {
        ctx.fillRect(finishX - 4, finishY + i, 8, 5);
      }
      ctx.restore();

      // Helper to compute (x, y) along rounded rectangular track
      const getTrackPos = (progress: number, lane: number) => {
        const pNorm = ((progress % 1) + 1) % 1;
        const perimeter = 2 * (trackWidth + trackHeight);
        let dist = pNorm * perimeter;

        // Bottom straight (moving left to right)
        const hw = trackWidth / 2;
        const hh = trackHeight / 2;
        let x = 0;
        let y = 0;
        let angle = 0;

        if (dist < trackWidth) {
          x = centerX - hw + dist;
          y = centerY + hh;
          angle = 0;
        } else if (dist < trackWidth + trackHeight) {
          dist -= trackWidth;
          x = centerX + hw;
          y = centerY + hh - dist;
          angle = -Math.PI / 2;
        } else if (dist < trackWidth * 2 + trackHeight) {
          dist -= trackWidth + trackHeight;
          x = centerX + hw - dist;
          y = centerY - hh;
          angle = Math.PI;
        } else {
          dist -= trackWidth * 2 + trackHeight;
          x = centerX - hw;
          y = centerY - hh + dist;
          angle = Math.PI / 2;
        }

        // Apply lane offset perpendicular to travel
        const perpX = -Math.sin(angle) * (lane * (roadThickness * 0.35));
        const perpY = Math.cos(angle) * (lane * (roadThickness * 0.35));
        return { x: x + perpX, y: y + perpY, angle };
      };

      // 3. Render Item Mystery Boxes
      for (const box of s.itemBoxes) {
        if (!box.active) continue;
        const pos = getTrackPos(box.progress, box.lane);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.fillStyle = 'rgba(255, 230, 0, 0.85)';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
        ctx.restore();
      }

      // 4. Render Missiles
      for (const m of s.missiles) {
        const pos = getTrackPos(m.xProgress, m.lane);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Render AI Rival Karts
      for (const r of s.rivals) {
        const pos = getTrackPos(r.trackProgress, r.laneOffset);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);

        // Kart body
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 12, 3);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#111';
        ctx.fillRect(-9, -8, 5, 3);
        ctx.fillRect(4, -8, 5, 3);
        ctx.fillRect(-9, 5, 5, 3);
        ctx.fillRect(4, 5, 5, 3);

        ctx.restore();
      }

      // 6. Render Player Kart
      const pPos = getTrackPos(p.trackProgress, p.laneOffset);
      ctx.save();
      ctx.translate(pPos.x, pPos.y);
      ctx.rotate(pPos.angle);

      // Drift Sparks
      if (p.isDrifting && p.driftCharge > 20) {
        ctx.fillStyle = p.driftCharge > 80 ? '#ff7700' : '#00e5ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(-12, p.driftDir * 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shield Bubble
      if (p.hasShield) {
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Kart Main Chassis (Cyan & Gold)
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-12, -7, 24, 14, 4);
      ctx.fill();

      // Pilot helmet
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Rear engine exhaust flame
      if (p.speed > 6) {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(-12, -3);
        ctx.lineTo(-20 - Math.random() * 4, 0);
        ctx.lineTo(-12, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [initGame, isGameOver, onEarnCoins, onGameOver, totalLaps, finishRank]);

  const handleTouchDir = (action: 'left' | 'right' | 'up' | 'drift' | 'item', active: boolean) => {
    const s = stateRef.current;
    if (action === 'left') s.keys.left = active;
    if (action === 'right') s.keys.right = active;
    if (action === 'up') s.keys.up = active;
    if (action === 'drift') {
      s.keys.drift = active;
      if (!active && s.player.driftCharge > 40) {
        s.player.speed = s.player.maxSpeed * 1.3;
        arcadeAudio.playNitro();
        s.player.driftCharge = 0;
      }
    }
    if (action === 'item' && active) {
      usePowerUp();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none bg-slate-950">
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Position Banner */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-white shadow-xl flex items-center gap-1.5">
            <span className="font-game font-black text-lg sm:text-2xl text-amber-400">
              {position === 1 ? '🥇 1st' : position === 2 ? '🥈 2nd' : position === 3 ? '🥉 3rd' : `${position}th`}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">/ 5</span>
          </div>

          {/* Lap Counter */}
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 shadow-xl font-game font-black text-xs sm:text-sm">
            LAP {Math.min(currentLap, totalLaps)} / {totalLaps}
          </div>
        </div>

        {/* Center Active Announcement */}
        {announcement && (
          <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-game font-black text-xs sm:text-base shadow-2xl animate-pulse">
            {announcement}
          </div>
        )}

        {/* Right: Item Box Slot & Speed */}
        <div className="flex items-center gap-2">
          {/* Item Slot */}
          <div className="w-12 h-12 bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 border-amber-400/60 shadow-xl flex items-center justify-center text-xl">
            {heldItem === 'boost' && '🍄'}
            {heldItem === 'shield' && '🛡️'}
            {heldItem === 'missile' && '🚀'}
            {heldItem === 'lightning' && '⚡'}
            {!heldItem && <span className="text-slate-600 font-bold text-xs">EMPTY</span>}
          </div>

          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white shadow-xl">
            <span className="text-[9px] text-slate-400 block font-bold">SPEED</span>
            <span className="font-mono font-black text-sm text-cyan-400">{speedKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-xl cursor-crosshair shadow-inner"
        style={{ touchAction: 'none' }}
      />

      {/* Finish / Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3">
            🏆
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-[#ffcc00] tracking-wide mb-1">
            GRAND PRIX PODIUM: {position === 1 ? '1ST PLACE VICTORY!' : `${position}TH PLACE FINISH`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4">
            {position === 1 ? 'Incredible driving! You dominated the Neon Skyway!' : 'Great effort! Take another lap to claim the golden trophy!'}
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
              <span className="font-mono font-black text-lg text-amber-400">{score.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Podium Rank</span>
              <span className="font-mono font-black text-lg text-cyan-400">P{position}</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (canvasRef.current) initGame(canvasRef.current.width, canvasRef.current.height);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
          >
            🏁 REMATCH GRAND PRIX (SPACE)
          </button>
        </div>
      )}

      {/* Mobile Controllers */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800 gap-3 md:hidden">
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('left', true)}
            onTouchEnd={() => handleTouchDir('left', false)}
            className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ◀
          </button>
          <button
            onTouchStart={() => handleTouchDir('right', true)}
            onTouchEnd={() => handleTouchDir('right', false)}
            className="w-13 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg active:bg-amber-400 active:text-slate-950 flex items-center justify-center"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouchDir('drift', true)}
            onTouchEnd={() => handleTouchDir('drift', false)}
            className="px-3.5 h-12 rounded-xl bg-purple-600 text-white font-black text-xs active:bg-purple-500 flex items-center justify-center"
          >
            DRIFT ✨
          </button>
          <button
            onTouchStart={() => handleTouchDir('item', true)}
            className="w-13 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-base active:bg-amber-300 flex items-center justify-center"
          >
            🚀
          </button>
          <button
            onTouchStart={() => handleTouchDir('up', true)}
            onTouchEnd={() => handleTouchDir('up', false)}
            className="px-4 h-12 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs active:bg-emerald-400 flex items-center justify-center"
          >
            GAS ▲
          </button>
        </div>
      </div>
    </div>
  );
};
