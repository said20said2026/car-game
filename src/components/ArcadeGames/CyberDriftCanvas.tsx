import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface CyberDriftCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const CyberDriftCanvas: React.FC<CyberDriftCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isDrifting, setIsDrifting] = useState(false);

  // Game internal state
  const stateRef = useRef({
    car: {
      x: 400,
      y: 300,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 8,
      accel: 0.22,
      friction: 0.97,
      turnSpeed: 0.055,
      driftFriction: 0.94,
      isDrifting: false,
      driftScore: 0,
    },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      handbrake: false,
      nitro: false,
    },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    skids: [] as { x: number; y: number; alpha: number }[],
    coins: [] as { x: number; y: number; radius: number; collected: boolean; pulse: number }[],
    barriers: [] as { x1: number; y1: number; x2: number; y2: number }[],
    score: 0,
    multiplier: 1,
    driftTimer: 0,
    nitro: 100,
    coinsEarned: 0,
    running: true,
  });

  // Track initialization
  const initTrack = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    s.car.x = w / 2;
    s.car.y = h - 100;
    s.car.angle = -Math.PI / 2;
    s.car.speed = 0;

    // Generate neon coins along a wide racing oval/figure-8 circuit
    s.coins = [];
    const centerX = w / 2;
    const centerY = h / 2;
    const rx = w * 0.38;
    const ry = h * 0.36;

    for (let i = 0; i < 24; i++) {
      const theta = (i / 24) * Math.PI * 2;
      s.coins.push({
        x: centerX + Math.cos(theta) * rx,
        y: centerY + Math.sin(theta) * ry,
        radius: 12,
        collected: false,
        pulse: Math.random() * Math.PI,
      });
    }
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { k.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { k.down = true; k.handbrake = true; e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { k.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { k.right = true; e.preventDefault(); }
      if (['Space'].includes(e.code)) { k.handbrake = true; e.preventDefault(); }
      if (['ShiftLeft', 'ShiftRight', 'KeyN'].includes(e.code)) { k.nitro = true; e.preventDefault(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) k.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) { k.down = false; k.handbrake = false; }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) k.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) k.right = false;
      if (['Space'].includes(e.code)) k.handbrake = false;
      if (['ShiftLeft', 'ShiftRight', 'KeyN'].includes(e.code)) k.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width || 800);
      canvas.height = Math.max(300, rect.height || 500);
      initTrack(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;

      if (s.running) {
        const c = s.car;
        const k = s.keys;

        // Steering
        if (k.left) c.angle -= c.turnSpeed * (c.speed / (c.maxSpeed * 0.7));
        if (k.right) c.angle += c.turnSpeed * (c.speed / (c.maxSpeed * 0.7));

        // Acceleration & Nitro
        let currentMax = c.maxSpeed;
        if (k.nitro && s.nitro > 0) {
          currentMax = c.maxSpeed * 1.45;
          c.speed = Math.min(c.speed + c.accel * 1.8, currentMax);
          s.nitro = Math.max(0, s.nitro - 35 * dt);
          arcadeAudio.playNitro();
        } else if (k.up) {
          c.speed = Math.min(c.speed + c.accel, currentMax);
          arcadeAudio.playEngineTone(110 + c.speed * 18, 0.05);
        } else if (k.down && !k.handbrake) {
          c.speed = Math.max(c.speed - c.accel * 1.2, -c.maxSpeed * 0.35);
        }

        // Handbrake drift logic
        c.isDrifting = k.handbrake && Math.abs(c.speed) > 2.5;
        if (c.isDrifting) {
          c.speed *= c.driftFriction;
          s.driftTimer += dt;
          arcadeAudio.playTireSkid();

          // Spawn tire smoke
          for (let i = 0; i < 2; i++) {
            s.particles.push({
              x: c.x - Math.cos(c.angle) * 16 + (Math.random() - 0.5) * 8,
              y: c.y - Math.sin(c.angle) * 16 + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 1.5 - Math.cos(c.angle) * 0.5,
              vy: (Math.random() - 0.5) * 1.5 - Math.sin(c.angle) * 0.5,
              life: 1.0,
              color: Math.random() > 0.4 ? 'rgba(0, 240, 255, 0.7)' : 'rgba(255, 0, 128, 0.7)',
              size: 4 + Math.random() * 8,
            });
          }

          // Skidmarks
          s.skids.push({ x: c.x, y: c.y, alpha: 0.55 });
          if (s.skids.length > 180) s.skids.shift();

          // Drift multiplier
          if (s.driftTimer > 0.6) s.multiplier = Math.min(10, Math.floor(s.driftTimer * 1.8) + 1);
          s.score += Math.floor(25 * s.multiplier * dt * 60);
        } else {
          c.speed *= c.friction;
          s.driftTimer = Math.max(0, s.driftTimer - dt * 2);
          if (s.driftTimer === 0) s.multiplier = 1;
        }

        // Car position update
        c.x += Math.cos(c.angle) * c.speed;
        c.y += Math.sin(c.angle) * c.speed;

        // Screen boundary bounce
        const margin = 28;
        if (c.x < margin) { c.x = margin; c.speed *= -0.4; arcadeAudio.playCrash(); }
        if (c.x > canvas.width - margin) { c.x = canvas.width - margin; c.speed *= -0.4; arcadeAudio.playCrash(); }
        if (c.y < margin) { c.y = margin; c.speed *= -0.4; arcadeAudio.playCrash(); }
        if (c.y > canvas.height - margin) { c.y = canvas.height - margin; c.speed *= -0.4; arcadeAudio.playCrash(); }

        // Coin collection & respawn
        let activeCoins = 0;
        s.coins.forEach((coin) => {
          if (!coin.collected) {
            activeCoins++;
            const dist = Math.hypot(c.x - coin.x, c.y - coin.y);
            if (dist < coin.radius + 18) {
              coin.collected = true;
              s.score += 250 * s.multiplier;
              s.coinsEarned += 2;
              s.nitro = Math.min(100, s.nitro + 18);
              arcadeAudio.playCoin();
              onEarnCoins(2);
            }
          }
        });

        // Respawn coins if all collected
        if (activeCoins === 0) {
          s.coins.forEach((coin) => { coin.collected = false; });
          s.score += 1500;
        }

        // React state sync for UI
        setScore(Math.floor(s.score));
        setMultiplier(s.multiplier);
        setCoinsCollected(s.coinsEarned);
        setNitro(Math.floor(s.nitro));
        setIsDrifting(c.isDrifting);
      }

      // RENDER
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon Track Grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Neon Track Circuit Outline
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rx = canvas.width * 0.38;
      const ry = canvas.height * 0.36;

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 44;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Asphalt race line
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Skid marks
      for (let i = 0; i < s.skids.length; i++) {
        const sk = s.skids[i];
        ctx.fillStyle = `rgba(0, 240, 255, ${sk.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(sk.x, sk.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        sk.alpha -= 0.001;
      }

      // Neon Coins / Fuel pickups
      s.coins.forEach((coin) => {
        if (!coin.collected) {
          coin.pulse += 0.05;
          const p = Math.sin(coin.pulse) * 3;
          ctx.save();
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#ffcc00';
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius + p * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Drift Smoke Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 2.2;
        p.size += dt * 8;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Drift Car
      const c = s.car;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      // Underglow neon
      ctx.shadowBlur = c.isDrifting ? 24 : 12;
      ctx.shadowColor = c.isDrifting ? '#ff007f' : '#00f0ff';
      ctx.fillStyle = c.isDrifting ? '#ff007f' : '#00f0ff';
      ctx.fillRect(-16, -9, 32, 18);

      // Car body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-18, -10, 36, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Cockpit windshield
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-2, -7, 10, 14);

      // Headlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, -8, 4, 4);
      ctx.fillRect(14, 4, 4, 4);

      // Taillights
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(-18, -7, 3, 3);
      ctx.fillRect(-18, 4, 3, 3);

      // Nitro exhaust flame
      if (s.keys.nitro && s.nitro > 0) {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.lineTo(-28 - Math.random() * 8, 0);
        ctx.lineTo(-18, 4);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [initTrack, onEarnCoins]);

  const handleRestart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.score = 0;
    s.multiplier = 1;
    s.nitro = 100;
    s.coinsEarned = 0;
    s.particles = [];
    s.skids = [];
    s.running = true;
    setIsGameOver(false);
    initTrack(canvas.width, canvas.height);
  };

  // Virtual buttons for mobile
  const pressKey = (key: 'left' | 'right' | 'up' | 'down' | 'handbrake' | 'nitro', pressed: boolean) => {
    stateRef.current.keys[key] = pressed;
    if (key === 'handbrake' || key === 'down') {
      stateRef.current.keys.handbrake = pressed;
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 select-none shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs sm:text-sm font-mono font-black">
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300">
          <span>SCORE: <strong className="text-white text-base">{score.toLocaleString()}</strong></span>
          <span className={`px-2 py-0.5 rounded-md font-bold transition-all ${multiplier > 1 ? 'bg-fuchsia-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            {multiplier}x MULTIPLIER
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
            <span>🪙 {coinsCollected} COINS</span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-400">
            <span>NITRO: {nitro}%</span>
          </div>
        </div>
      </div>

      {/* Drift Status Banner */}
      {isDrifting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-500 text-white font-game font-black tracking-widest text-xs uppercase animate-bounce shadow-lg shadow-pink-500/30">
          🔥 SICK DRIFT! +{multiplier * 150} 🔥
        </div>
      )}

      {/* Mobile Touch Virtual Controls */}
      <div className="lg:hidden absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={() => pressKey('left', true)}
            onTouchEnd={() => pressKey('left', false)}
            onMouseDown={() => pressKey('left', true)}
            onMouseUp={() => pressKey('left', false)}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border border-cyan-500/60 active:bg-cyan-500 text-cyan-400 active:text-slate-950 font-black text-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            ◀
          </button>
          <button
            type="button"
            onTouchStart={() => pressKey('right', true)}
            onTouchEnd={() => pressKey('right', false)}
            onMouseDown={() => pressKey('right', true)}
            onMouseUp={() => pressKey('right', false)}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border border-cyan-500/60 active:bg-cyan-500 text-cyan-400 active:text-slate-950 font-black text-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={() => pressKey('handbrake', true)}
            onTouchEnd={() => pressKey('handbrake', false)}
            onMouseDown={() => pressKey('handbrake', true)}
            onMouseUp={() => pressKey('handbrake', false)}
            className="w-14 h-13 rounded-2xl bg-pink-950/80 border border-pink-500 active:bg-pink-500 text-pink-300 active:text-white font-bold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            DRIFT
          </button>
          <button
            type="button"
            onTouchStart={() => pressKey('nitro', true)}
            onTouchEnd={() => pressKey('nitro', false)}
            onMouseDown={() => pressKey('nitro', true)}
            onMouseUp={() => pressKey('nitro', false)}
            className="w-13 h-13 rounded-2xl bg-cyan-950/80 border border-cyan-400 active:bg-cyan-400 text-cyan-300 active:text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg active:scale-95"
          >
            NOS
          </button>
          <button
            type="button"
            onTouchStart={() => pressKey('up', true)}
            onTouchEnd={() => pressKey('up', false)}
            onMouseDown={() => pressKey('up', true)}
            onMouseUp={() => pressKey('up', false)}
            className="w-14 h-13 rounded-2xl bg-amber-500 border border-amber-400 active:bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▲
          </button>
        </div>
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 gap-3">
        <span><strong className="text-amber-400">W / ▲</strong> Accelerate</span>
        <span><strong className="text-amber-400">A / D</strong> Steer</span>
        <span><strong className="text-pink-400">SPACE / S</strong> Handbrake Drift</span>
        <span><strong className="text-cyan-400">SHIFT</strong> Nitrous</span>
        <button onClick={handleRestart} className="text-amber-400 hover:underline ml-2">↻ Restart</button>
      </div>
    </div>
  );
};
