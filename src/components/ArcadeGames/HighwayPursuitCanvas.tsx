import React, { useEffect, useRef, useState, useCallback } from 'react';
import { arcadeAudio } from '../../utils/arcadeAudio';

interface HighwayPursuitCanvasProps {
  onEarnCoins: (amount: number) => void;
  onGameOver?: (score: number, coins: number) => void;
}

export const HighwayPursuitCanvas: React.FC<HighwayPursuitCanvasProps> = ({ onEarnCoins, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wantedStars, setWantedStars] = useState(1);
  const [distanceKm, setDistanceKm] = useState('0.0');
  const [empReady, setEmpReady] = useState(true);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isBusted, setIsBusted] = useState(false);

  const stateRef = useRef({
    player: {
      lane: 1.5,
      x: 0,
      y: 0,
      speed: 16,
      health: 100,
      empAvailable: true,
      empCooldown: 0,
    },
    traffic: [] as { x: number; y: number; lane: number; speed: number; type: 'police' | 'civilian' | 'spikes'; disabled: boolean }[],
    keys: { left: false, right: false, up: false, down: false, emp: false },
    distance: 0,
    wanted: 1,
    coins: 0,
    busted: false,
    empShockwave: null as { x: number; y: number; radius: number; alpha: number } | null,
    sirenTimer: 0,
  });

  const triggerEmp = () => {
    const s = stateRef.current;
    if (s.busted || !s.player.empAvailable) return;
    s.player.empAvailable = false;
    s.player.empCooldown = 6.0;
    setEmpReady(false);
    arcadeAudio.playPulse();

    // Disable all nearby police cars
    s.traffic.forEach((car) => {
      if (car.type === 'police') {
        car.disabled = true;
        car.speed = 4;
      }
    });

    s.empShockwave = {
      x: s.player.x,
      y: s.player.y,
      radius: 10,
      alpha: 1.0,
    };
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { k.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { k.right = true; e.preventDefault(); }
      if (['ArrowUp', 'KeyW'].includes(e.code)) { k.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { k.down = true; e.preventDefault(); }
      if (['Space', 'ShiftLeft', 'KeyE'].includes(e.code)) { triggerEmp(); e.preventDefault(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) k.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) k.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) k.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) k.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width || 800);
      canvas.height = Math.max(300, rect.height || 500);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      const p = s.player;
      const k = s.keys;
      const w = canvas.width;
      const h = canvas.height;

      const roadW = Math.min(w * 0.78, 520);
      const roadX = (w - roadW) / 2;
      const laneW = roadW / 4;

      if (!s.busted) {
        // Player lane movement
        if (k.left) p.lane = Math.max(0, p.lane - 2.8 * dt);
        if (k.right) p.lane = Math.min(3, p.lane + 2.8 * dt);
        if (k.up) p.speed = Math.min(26, p.speed + 10 * dt);
        else if (k.down) p.speed = Math.max(10, p.speed - 16 * dt);
        else p.speed = Math.max(16, p.speed - 2 * dt);

        p.x = roadX + (p.lane + 0.5) * laneW;
        p.y = h - 90;

        // Distance & wanted level
        s.distance += (p.speed * 18) * dt;
        setDistanceKm((s.distance / 1000).toFixed(1));
        s.wanted = Math.min(5, Math.floor(s.distance / 1200) + 1);
        setWantedStars(s.wanted);

        // Siren sound interval
        s.sirenTimer += dt;
        if (s.sirenTimer > 4.5 && s.wanted >= 2) {
          s.sirenTimer = 0;
          arcadeAudio.playSiren();
        }

        // EMP cooldown
        if (!p.empAvailable) {
          p.empCooldown -= dt;
          if (p.empCooldown <= 0) {
            p.empAvailable = true;
            setEmpReady(true);
          }
        }

        // Spawn traffic & police
        spawnTimer += dt;
        const spawnInterval = Math.max(0.65, 1.4 - s.wanted * 0.15);
        if (spawnTimer > spawnInterval) {
          spawnTimer = 0;
          const spawnLane = Math.floor(Math.random() * 4);
          const isPolice = Math.random() < 0.28 + s.wanted * 0.1;
          const isSpikes = !isPolice && Math.random() < 0.18 && s.wanted >= 3;

          s.traffic.push({
            x: roadX + (spawnLane + 0.5) * laneW,
            y: -60,
            lane: spawnLane,
            speed: isPolice ? p.speed * 0.88 : (isSpikes ? 0 : 8 + Math.random() * 5),
            type: isPolice ? 'police' : (isSpikes ? 'spikes' : 'civilian'),
            disabled: false,
          });
        }

        // Traffic update & collision
        for (let i = s.traffic.length - 1; i >= 0; i--) {
          const car = s.traffic[i];
          car.y += (p.speed - car.speed) * 8 * dt;

          // Check collision
          const dist = Math.hypot(p.x - car.x, p.y - car.y);
          if (dist < 36) {
            if (car.disabled) {
              // Bumping disabled car shoves it away
              car.y += 40;
            } else {
              // BUSTED / CRASH!
              s.busted = true;
              setIsBusted(true);
              arcadeAudio.playCrash();
              if (onGameOver) onGameOver(Math.floor(s.distance), s.coins);
            }
          }

          if (car.y > h + 100 || car.y < -120) {
            s.traffic.splice(i, 1);
            s.coins += 1;
            onEarnCoins(1);
            setCoinsCollected(s.coins);
          }
        }

        // EMP Shockwave progression
        if (s.empShockwave) {
          s.empShockwave.radius += 380 * dt;
          s.empShockwave.alpha -= 1.8 * dt;
          if (s.empShockwave.alpha <= 0) s.empShockwave = null;
        }
      }

      // RENDER
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Highway Road Surface
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(roadX, 0, roadW, h);

      // Road shoulder barriers
      ctx.fillStyle = '#334155';
      ctx.fillRect(roadX - 8, 0, 8, h);
      ctx.fillRect(roadX + roadW, 0, 8, h);

      // Moving Lane Dashes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.setLineDash([22, 18]);
      ctx.lineDashOffset = -now * 0.6;
      for (let l = 1; l < 4; l++) {
        ctx.beginPath();
        ctx.moveTo(roadX + l * laneW, 0);
        ctx.lineTo(roadX + l * laneW, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // EMP Shockwave ring
      if (s.empShockwave) {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${s.empShockwave.alpha})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(s.empShockwave.x, s.empShockwave.y, s.empShockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Traffic
      s.traffic.forEach((car) => {
        ctx.save();
        ctx.translate(car.x, car.y);

        if (car.type === 'police') {
          // Police Cruiser
          ctx.fillStyle = '#020617';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-15, -28, 30, 56, 4);
          ctx.fill();
          ctx.stroke();

          // Flashing siren lights
          const sirenFlash = Math.floor(now / 150) % 2 === 0;
          ctx.fillStyle = sirenFlash ? '#ef4444' : '#3b82f6';
          ctx.fillRect(-10, -5, 8, 6);
          ctx.fillStyle = sirenFlash ? '#3b82f6' : '#ef4444';
          ctx.fillRect(2, -5, 8, 6);

          if (car.disabled) {
            // Disabled electrical sparks
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 30, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (car.type === 'spikes') {
          // Spike Strip Obstacle
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-22, -6, 44, 12);
          ctx.fillStyle = '#ffffff';
          for (let sp = -18; sp <= 18; sp += 6) {
            ctx.fillRect(sp, -9, 2.5, 6);
          }
        } else {
          // Civilian Car
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.roundRect(-14, -26, 28, 52, 4);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.fillRect(-10, -10, 20, 16);
        }
        ctx.restore();
      });

      // Render Getaway Player Car
      ctx.save();
      ctx.translate(p.x, p.y);

      // Matte Black Body with neon underglow
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -30, 32, 60, 5);
      ctx.fill();
      ctx.stroke();

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-12, 26, 6, 3);
      ctx.fillRect(6, 26, 6, 3);

      // Headlight beams
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(-10, -30);
      ctx.lineTo(-24, -90);
      ctx.lineTo(24, -90);
      ctx.lineTo(10, -30);
      ctx.fill();
      ctx.restore();

      // Police Helicopter Spotlight at Wanted Level 3+
      if (s.wanted >= 3) {
        ctx.save();
        const spotX = p.x + Math.sin(now * 0.003) * 60;
        const spotY = p.y - 40 + Math.cos(now * 0.004) * 30;
        const grad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, 90);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onEarnCoins, onGameOver]);

  const handleRestart = () => {
    const s = stateRef.current;
    s.player.lane = 1.5;
    s.player.speed = 16;
    s.player.empAvailable = true;
    s.distance = 0;
    s.wanted = 1;
    s.traffic = [];
    s.busted = false;
    setIsBusted(false);
    setEmpReady(true);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-red-500/30 select-none shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs sm:text-sm font-mono font-black">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-red-500/40 text-red-400">
          <span>WANTED:</span>
          <div className="flex text-amber-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < wantedStars ? 'opacity-100' : 'opacity-20'}>★</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300">
            DIST: {distanceKm} KM
          </div>
          <div className={`px-3 py-1.5 rounded-xl border font-bold ${empReady ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' : 'bg-slate-900/80 border-slate-700 text-slate-500'}`}>
            {empReady ? 'EMP BLAST: READY ⚡' : 'EMP RECHARGING...'}
          </div>
        </div>
      </div>

      {/* Busted Overlay */}
      {isBusted && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-6 z-20">
          <h3 className="text-4xl sm:text-5xl font-black font-game text-red-500 tracking-wider">
            BUSTED!
          </h3>
          <p className="text-slate-300 text-sm">
            Distance Evaded: <strong className="text-amber-400 text-lg">{distanceKm} KM</strong> • Bounty Claimed: <strong className="text-cyan-400 text-lg">{coinsCollected} Coins</strong>
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-wider hover:bg-red-500 shadow-lg shadow-red-500/30 cursor-pointer active:scale-95"
          >
            ↻ Try Getaway Again
          </button>
        </div>
      )}

      {/* Mobile Touch Controls */}
      <div className="lg:hidden absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.left = true; }}
            onTouchEnd={() => { stateRef.current.keys.left = false; }}
            className="w-14 h-13 rounded-2xl bg-slate-900/90 border border-red-500 text-red-400 font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ◀
          </button>
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.right = true; }}
            onTouchEnd={() => { stateRef.current.keys.right = false; }}
            className="w-14 h-13 rounded-2xl bg-slate-900/90 border border-red-500 text-red-400 font-black text-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerEmp}
            disabled={!empReady}
            className={`w-28 py-3 rounded-2xl font-black text-xs flex items-center justify-center shadow-lg active:scale-95 ${empReady ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
          >
            EMP PULSE ⚡
          </button>
          <button
            type="button"
            onTouchStart={() => { stateRef.current.keys.up = true; }}
            onTouchEnd={() => { stateRef.current.keys.up = false; }}
            className="w-14 h-13 rounded-2xl bg-amber-500 border border-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg active:scale-95"
          >
            ▲
          </button>
        </div>
      </div>

      {/* Desktop Controls Legend */}
      <div className="hidden lg:flex absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 gap-3">
        <span><strong className="text-amber-400">A / D</strong> Swerve Lanes</span>
        <span><strong className="text-amber-400">W / S</strong> Speed Up / Brake</span>
        <span><strong className="text-cyan-400">SPACE / E</strong> EMP Shockwave</span>
        <button onClick={handleRestart} className="text-red-400 hover:underline ml-2">↻ Restart</button>
      </div>
    </div>
  );
};
